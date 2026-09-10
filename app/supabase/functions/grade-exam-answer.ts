/**
 * Edge Function `grade-exam-answer` — KI-Bewertung einer AP1-Teilaufgabe
 * über Amazon Bedrock (eu-central-1, Cross-Region-Inference).
 *
 * POST { "question_id": string, "antworttext": string }
 *   Header: Authorization: Bearer <user-JWT> (geprüft via VERIFY_JWT)
 *
 * Antwort:
 *   { "punkte": number|null, "begruendung": string }
 *
 * Fehlverhalten laut Brief: schlägt der Bedrock-Ruf fehl, kommen
 * { punkte: null, begruendung: "KI-Bewertung nicht verfügbar." } und das
 * Frontend bietet den Selbst-Einschätzungs-Fallback.
 */

interface GradingRequest {
  question_id?: string;
  antworttext?: string;
  attempt_id?: string;
}

interface ExamQuestion {
  frage: string;
  musterloesung: string;
  max_punkte: number;
  exam_id: string;
  aufgabe_nr: number;
  teil: string;
}

const MODEL_ID = "eu.anthropic.claude-haiku-4-5-20251001-v1:0";
const AWS_REGION = "eu-central-1";
const TIMEOUT_MS = 30_000;

Deno.serve(async (req: Request) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok-v2", { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "nur POST" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // User muss eingeloggt sein (JWT-Verifikation übernimmt der Gateway,
  // wenn VERIFY_JWT=true; zur Sicherheit hier nochmal prüfen, dass ein
  // Token anliegt — die DB-Rolle 'authenticated' braucht RLS).
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "nicht angemeldet" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const jwt = auth.slice(7);
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  let body: GradingRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "ungültiges JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const questionId = body.question_id;
  const antworttext = body.antworttext ?? "";
  if (!questionId) {
    return new Response(JSON.stringify({ error: "question_id fehlt" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // 1) Frage laden (Service-Rolle umgeht RLS bewusst; user wurde oben geprüft)
  const rest = Deno.env.get("SUPABASE_URL")!;
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
    return new Response(
      JSON.stringify({ punkte: null, begruendung: "KI-Bewertung nicht verfügbar." }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }
  const rows: ExamQuestion[] = await qRes.json();
  const q = rows[0];
  if (!q) {
    return new Response(
      JSON.stringify({ punkte: null, begruendung: "KI-Bewertung nicht verfügbar." }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      },
    );
  }

  // 2) Bedrock aufrufen
  const bedrockKey = Deno.env.get("BEDROCK_API_KEY") ?? "";
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
        "/invoke",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + bedrockKey,
        },
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 1000,
          system,
          messages: [{ role: "user", content: userPrompt }],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (brRes.ok) {
      const br: { output?: { message?: { content?: { text?: string }[] } } } = await brRes.json();
      const text = br.content?.[0]?.text ?? br.output?.message?.content?.[0]?.text ?? "";
      const m = text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]) as { punkte?: unknown; begruendung?: unknown };
        const p = Number(parsed.punkte);
        if (Number.isFinite(p) && p >= 0 && p <= q.max_punkte) {
          punkte = Math.round(p);
          if (typeof parsed.begruendung === "string") begruendung = parsed.begruendung;
        }
      }
    }
  } catch {
    // Fallback unten greift
  }

  // 3) Ergebnis persistieren — nur wenn eine echte Bewertung existiert
  if (punkte !== null) {
    // attempt_id kommt mit? Der Brief legt den Insert auf die Function;
    // ohne attempt_id kann nicht gespeichert werden -> client schickt ihn mit.
    const attemptId = body.attempt_id;
    if (attemptId) {
      // user_id aus dem JWT extrahieren (sub-claim) für RLS-Sauberkeit
      let userId = "";
      try {
        const payload = JSON.parse(atob(jwt.split(".")[1]!)) as { sub?: string };
        userId = payload.sub ?? "";
      } catch {
        /* leave empty */
      }
      await fetch(rest + "/rest/v1/exam_answers", {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: "Bearer " + key,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          attempt_id: attemptId,
          question_id: questionId,
          antworttext,
          ki_punkte: punkte,
          ki_feedback: begruendung,
          ...(userId ? { user_id: userId } : {}),
        }),
        signal: AbortSignal.timeout(10_000),
      }).catch(() => undefined);

      // 4) Fehlerlog bei <50%
      if (punkte < q.max_punkte * 0.5) {
        await fetch(rest + "/rest/v1/error_log", {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: "Bearer " + key,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            user_id: userId || null,
            quelle: "pruefung",
            thema: q.exam_id + " Aufgabe " + q.aufgabe_nr + q.teil,
            beschreibung: begruendung,
            ...(userId ? { user_id: userId } : {}),
          }),
          signal: AbortSignal.timeout(10_000),
        }).catch(() => undefined);
      }
    }
  }

  return new Response(JSON.stringify({ punkte, begruendung }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
