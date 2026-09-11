/**
 * Edge Function `grade-exam-answer` — KI-Bewertung einer AP1-Teilaufgabe
 * über Amazon Bedrock (eu-central-1, Cross-Region-Inference).
 *
 * POST { "question_id": string, "attempt_id": string, "antworttext": string }
 *   Header: Authorization: Bearer <user-JWT>
 *
 * Antwort: { "punkte": number|null, "begruendung": string }
 *
 * Sicherheit:
 * - JWT muss vorhanden sein (zusätzlich prüft der Gateway bei VERIFY_JWT).
 * - Tageslimit: max. DAILY_KI_LIMIT KI-Bewertungen je Nutzer/Tag (UTC).
 *   Zählt exam_answers mit ki_punkte des Tages; nicht prüfbar → 503
 *   (fail-closed, Kostenschutz).
 * - Service Role umgeht RLS bewusst — deshalb Eigentümerschaft serverseitig:
 *   exam_attempts.id = attempt_id AND exam_attempts.user_id = JWT.sub,
 *   sonst 403. Ist die Prüfung selbst nicht möglich (Lookup HTTP-/Netzwerk-
 *   fehler), antwortet die Function mit 503 statt fälschlich 403.
 * - Eingaben werden auf Form und Länge validiert; die KI-Antwort wird auf
 *   0 <= punkte <= max_punkte begrenzt. Ungültiges JSON erzeugt keine
 *   Bewertung (Fallback punkte=null → Selbst-Einschätzung im Frontend).
 */

interface GradingRequest {
  question_id?: unknown;
  antworttext?: unknown;
  attempt_id?: unknown;
}

interface ExamQuestion {
  frage: string;
  musterloesung: string;
  max_punkte: number;
  exam_id: string;
  aufgabe_nr: number;
  teil: string;
}

const MODEL_ID = "eu.amazon.nova-lite-v1:0";
const AWS_REGION = "eu-central-1";
const TIMEOUT_MS = 30_000;
const MAX_ANTWORT_LAENGE = 10_000;
/** KI-Bewertungen pro Nutzer und Tag (UTC) — Kostenschutz bei offener Registrierung. */
export const DAILY_KI_LIMIT = 50;

function json(status: number, body: unknown, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/** base64url-sicherer JWT-Payload-Decode (ohne Signaturprüfung). */
export function jwtSub(jwt: string): string {
  try {
    const part = jwt.split(".")[1] ?? "";
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { sub?: unknown };
    return typeof payload.sub === "string" ? payload.sub : "";
  } catch {
    return "";
  }
}

export interface FunctionEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AWS_BEDROCK_API_KEY: string;
}

/**
 * Anfrage-Handler — aus dem Serve-Callback extrahiert, damit die
 * Sicherheits- und Fehlerszenarien in test.ts mit injiziertem fetch
 * getestet werden können.
 */
export async function handleRequest(req: Request, env: FunctionEnv): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok-v2", { headers: cors });
  if (req.method !== "POST") {
    return json(405, { error: "nur POST" }, cors);
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return json(401, { error: "nicht angemeldet" }, cors);
  }
  const jwt = auth.slice(7);
  const sub = jwtSub(jwt);
  if (!sub) {
    return json(401, { error: "ungültiges Token" }, cors);
  }

  let body: GradingRequest;
  try {
    body = (await req.json()) as GradingRequest;
  } catch {
    return json(400, { error: "ungültiges JSON" }, cors);
  }

  // --- Eingabevalidierung (Form + Größe) ---
  const questionId = typeof body.question_id === "string" ? body.question_id : "";
  const attemptId = typeof body.attempt_id === "string" ? body.attempt_id : "";
  const antworttext = typeof body.antworttext === "string" ? body.antworttext : "";
  if (!questionId || questionId.length > 200) {
    return json(400, { error: "question_id fehlt oder zu lang" }, cors);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(attemptId)) {
    return json(400, { error: "attempt_id fehlt oder kein UUID" }, cors);
  }
  if (antworttext.length > MAX_ANTWORT_LAENGE) {
    return json(400, { error: `antworttext zu lang (max ${MAX_ANTWORT_LAENGE} Zeichen)` }, cors);
  }

  const rest = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  // --- Eigentümerschaft: Attempt muss dem JWT-Sub gehören (RLS-Bypass!) ---
  let attemptOwned = false;
  let lookupFailed = false;
  try {
    const aRes = await fetch(
      rest +
        "/rest/v1/exam_attempts?id=eq." +
        encodeURIComponent(attemptId) +
        "&user_id=eq." +
        encodeURIComponent(sub) +
        "&select=id",
      {
        headers: { apikey: key, Authorization: "Bearer " + key },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (aRes.ok) {
      attemptOwned = ((await aRes.json()) as { id: string }[]).length > 0;
    } else {
      console.error("exam_attempts-Lookup fehlgeschlagen:", aRes.status);
      lookupFailed = true;
    }
  } catch (e) {
    console.error("exam_attempts-Lookup Netzwerkfehler:", e);
    lookupFailed = true;
  }
  if (lookupFailed) {
    return json(503, { error: "Eigentümerschaft nicht prüfbar — bitte erneut versuchen" }, cors);
  }
  if (!attemptOwned) {
    return json(403, { error: "Attempt gehört nicht zum angemeldeten Nutzer" }, cors);
  }

  // --- Tageslimit: KI-Bewertungen heute (UTC) zählen, sonst 429 ---
  let limitReached = false;
  let limitLookupFailed = false;
  try {
    const todayStart = new Date().toISOString().slice(0, 10) + "T00:00:00Z";
    const cRes = await fetch(
      rest +
        "/rest/v1/exam_answers?user_id=eq." +
        encodeURIComponent(sub) +
        "&created_at=gte." +
        encodeURIComponent(todayStart) +
        "&ki_punkte=not.is.null&select=id",
      {
        headers: { apikey: key, Authorization: "Bearer " + key },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (cRes.ok) {
      limitReached = ((await cRes.json()) as { id: string }[]).length >= DAILY_KI_LIMIT;
    } else {
      console.error("Tageslimit-Zählung fehlgeschlagen:", cRes.status);
      limitLookupFailed = true;
    }
  } catch (e) {
    console.error("Tageslimit-Zählung Netzwerkfehler:", e);
    limitLookupFailed = true;
  }
  if (limitLookupFailed) {
    return json(503, { error: "Tageslimit nicht prüfbar — bitte erneut versuchen" }, cors);
  }
  if (limitReached) {
    return json(
      429,
      {
        error:
          "Tageslimit erreicht: max. " +
          DAILY_KI_LIMIT +
          " KI-Bewertungen pro Tag. Ab morgen (UTC) steht das Kontingent wieder zur Verfügung.",
      },
      cors,
    );
  }

  // --- Frage laden ---
  let q: ExamQuestion | undefined;
  try {
    const qRes = await fetch(
      rest +
        "/rest/v1/exam_questions?id=eq." +
        encodeURIComponent(questionId) +
        "&select=frage,musterloesung,max_punkte,exam_id,aufgabe_nr,teil",
      {
        headers: { apikey: key, Authorization: "Bearer " + key },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!qRes.ok) {
      console.error("exam_questions-Lookup fehlgeschlagen:", qRes.status);
      return json(200, { punkte: null, begruendung: "KI-Bewertung nicht verfügbar." }, cors);
    }
    q = ((await qRes.json()) as ExamQuestion[])[0];
  } catch (e) {
    console.error("exam_questions-Lookup Netzwerkfehler:", e);
    return json(200, { punkte: null, begruendung: "KI-Bewertung nicht verfügbar." }, cors);
  }
  if (!q) {
    console.error("question_id unbekannt:", questionId);
    return json(200, { punkte: null, begruendung: "KI-Bewertung nicht verfügbar." }, cors);
  }

  // --- Bedrock aufrufen (ein Modell, kein Fallback-Modell implementiert) ---
  // Nova Lite über Bedrock Converse API (modellfamilien-unabhängiges Format).
  // Anthropic-Modelle sind für diesen AWS-Account nicht freigeschaltet; nova
  // nur über den CRIS-Inferenz-Profil-ID (eu.-Präfix), nicht on-demand.
  const bedrockKey = env.AWS_BEDROCK_API_KEY ?? "";
  const system =
    "Du bist Prüfer für die IHK-Abschlussprüfung AP1 Fachinformatiker Systemintegration. Bewerte nach der Musterlösung, vergib anteilige Punkte für teilweise richtige Antworten, antworte ausschließlich mit dem geforderten JSON.";
  const userPrompt =
    "Aufgabe (Prüfung " +
    q.exam_id +
    ", Aufgabe " +
    q.aufgabe_nr +
    q.teil +
    "):\n" +
    q.frage +
    "\n\nMusterlösung:\n" +
    q.musterloesung +
    "\n\nMaximale Punktzahl: " +
    q.max_punkte +
    "\n\nAntwort des Prüflings:\n" +
    (antworttext.trim() || "(leere Antwort)") +
    '\n\nAntworte ausschließlich mit diesem JSON-Format: {"punkte": <ganzzahl 0..' +
    q.max_punkte +
    '>, "begruendung": "<kurzer deutscher Text>"}';

  let punkte: number | null = null;
  let begruendung = "KI-Bewertung nicht verfügbar.";

  try {
    const brRes = await fetch(
      "https://bedrock-runtime." +
        AWS_REGION +
        ".amazonaws.com/model/" +
        encodeURIComponent(MODEL_ID) +
        "/converse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + bedrockKey,
        },
        body: JSON.stringify({
          system: [{ text: system }],
          messages: [{ role: "user", content: [{ text: userPrompt }] }],
          inferenceConfig: { maxTokens: 1000, temperature: 0 },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!brRes.ok) {
      console.error("Bedrock-Fehler:", brRes.status, await brRes.text().catch(() => ""));
    } else {
      const br: { output?: { message?: { content?: { text?: string }[] } } } = await brRes.json();
      const text = br.output?.message?.content?.[0]?.text ?? "";
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]) as { punkte?: unknown; begruendung?: unknown };
        const p = Number(parsed.punkte);
        // KI-Antwort strikt begrenzen: 0 <= punkte <= max_punkte
        if (Number.isFinite(p) && p >= 0 && p <= q.max_punkte) {
          punkte = Math.round(p);
          if (typeof parsed.begruendung === "string" && parsed.begruendung.length <= 2000) {
            begruendung = parsed.begruendung;
          }
        }
      }
    }
  } catch (e) {
    console.error("Bedrock-Aufruf/Parse fehlgeschlagen:", e);
  }

  // --- Ergebnis persistieren — nur bei echter Bewertung, idempotent via Upsert ---
  if (punkte !== null) {
    const headers = {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
      Prefer: "return=minimal,resolution=merge-duplicates",
    };
    try {
      const insRes = await fetch(
        rest + "/rest/v1/exam_answers?on_conflict=attempt_id,question_id",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            attempt_id: attemptId,
            question_id: questionId,
            antworttext,
            ki_punkte: punkte,
            ki_feedback: begruendung,
            user_id: sub,
          }),
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!insRes.ok) {
        console.error("exam_answers-Insert fehlgeschlagen:", insRes.status);
      }
    } catch (e) {
      console.error("exam_answers-Insert Netzwerkfehler:", e);
    }

    // Fehlerlog bei <50% der Maximalpunktzahl
    if (punkte < q.max_punkte * 0.5) {
      try {
        const logRes = await fetch(rest + "/rest/v1/error_log", {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: "Bearer " + key,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: sub,
            quelle: "pruefung",
            thema: q.exam_id + " Aufgabe " + q.aufgabe_nr + q.teil,
            beschreibung: begruendung,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!logRes.ok) {
          console.error("error_log-Insert fehlgeschlagen:", logRes.status);
        }
      } catch (e) {
        console.error("error_log-Insert Netzwerkfehler:", e);
      }
    }
  }

  return json(200, { punkte, begruendung }, cors);
}

// Serve nur beim Direktaufruf starten (Supabase-Deploy), nicht beim
// Import durch Tests.
if (import.meta.main) {
  Deno.serve((req: Request) => {
    const env: FunctionEnv = {
      SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? "",
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      AWS_BEDROCK_API_KEY: Deno.env.get("AWS_BEDROCK_API_KEY") ?? "",
    };
    return handleRequest(req, env);
  });
}
