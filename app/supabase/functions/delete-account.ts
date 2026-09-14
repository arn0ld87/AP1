/**
 * Edge Function `delete-account` — löscht den angemeldeten Nutzer samt
 * sämtlicher Lern-/Prüfungsdaten (Self-Service, DSGVO Art. 17).
 *
 * POST {} — Header: Authorization: Bearer <user-JWT>
 * Antwort: { "ok": true }
 *
 * Sicherheit:
 * - JWT muss vorhanden UND gültig sein: die Function verifiziert Signatur
 *   und Ablauf selbst gegen GoTrue (verifiedJwtSub), unabhängig vom
 *   Gateway-Flag verify_jwt in config.toml — fällt die Gateway-Prüfung aus,
 *   greift diese Prüfung trotzdem (P1-4). Ist sie selbst nicht möglich
 *   (GoTrue nicht erreichbar), antwortet die Function mit 503 statt das
 *   Token durchzulassen (fail-closed).
 * - Löschen darf nur der eigene Account: Ziel-ID = der von GoTrue
 *   verifizierte sub, nie aus dem Body oder ungeprüft aus dem
 *   JWT-Payload (Service Role umgeht RLS und könnte sonst beliebige
 *   Nutzer löschen).
 * - Alle fachlichen Tabellen (exam_attempts, exam_answers, topic_mastery,
 *   flashcard_progress, error_log) hängen per FK ON DELETE CASCADE an
 *   auth.users — der GoTrue-Admin-Delete räumt sie mit ab.
 * - Session-Invalidierung passiert clientseitig per signOut nach Erfolg.
 * - CORS: Access-Control-Allow-Origin ist auf die tatsächliche App-Herkunft
 *   (ALLOWED_ORIGIN, Default https://pruefung.alexle135.de) eingeschränkt
 *   statt "*" — ein Wildcard erlaubte jeder beliebigen Seite, die Function
 *   per Browser-Fetch mit dem JWT eines eingeloggten Nutzers anzusprechen.
 */

/** Live-Herkunft der App — Default für ALLOWED_ORIGIN, damit das Deployment
 *  ohne neue Konfiguration funktioniert (siehe docs/architecture.md). */
export const DEFAULT_ALLOWED_ORIGIN = "https://pruefung.alexle135.de";

export interface FunctionEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Überschreibt Access-Control-Allow-Origin (Default: DEFAULT_ALLOWED_ORIGIN). */
  ALLOWED_ORIGIN?: string;
}

function json(status: number, body: unknown, cors: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

/**
 * base64url-sicherer JWT-Payload-Decode (ohne Signaturprüfung).
 *
 * Nur noch für Diagnose/Tests — keine Autorisierungsentscheidung mehr.
 * Für die Authentifizierung ist ausschließlich verifiedJwtSub() maßgeblich.
 */
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

/** Ergebnis der JWT-Verifikation gegen GoTrue — unterscheidet bewusst
 *  "Token ungültig" von "Prüfung nicht möglich", damit der Aufrufer einen
 *  GoTrue-Ausfall fail-closed (503) behandelt statt das Token
 *  durchzulassen (fail-open). */
export type JwtVerification =
  { status: "ok"; sub: string } | { status: "invalid" } | { status: "unavailable" };

/** true, wenn die 401/403-Antwort von GoTrue selbst stammt (Tokenfehler),
 *  false, wenn sie nach einer Gateway-Abweisung aussieht (Betriebsstörung).
 *  Im Zweifel — unlesbarer Körper — wird "Betriebsstörung" angenommen: eine
 *  fälschliche 503 ist harmloser als eine fälschliche 401, die dem Nutzer
 *  ein gültiges Login als ungültig meldet. */
async function gotrueLehntToken(res: Response): Promise<boolean> {
  // Erkannt wird die GATEWAY-Form, nicht die GoTrue-Form: Kong antwortet auf
  // einen falschen apikey mit ausschliesslich { message }. GoTrue meldet
  // Tokenfehler je nach Version unterschiedlich (msg + error_code, oder
  // error + error_description) — diese Liste waere die fragilere Seite.
  try {
    const body = (await res.json()) as Record<string, unknown>;
    const gotrueFelder = ["msg", "error", "error_code", "error_description", "code"];
    const istGatewayForm = "message" in body && !gotrueFelder.some((f) => f in body);
    if (istGatewayForm) {
      console.error("401/403 in Gateway-Form — vermutlich falscher apikey:", body["message"]);
      return false;
    }
    return true;
  } catch {
    console.error("401/403 mit unlesbarem Körper — als Betriebsstörung gewertet");
    return false;
  }
}

/**
 * Prüft die JWT-Signatur (und den Ablauf) gegen GoTrue statt lokal per
 * HS256: GET {SUPABASE_URL}/auth/v1/user mit dem Service-Role-Key als
 * apikey und dem Nutzer-JWT als Authorization-Header. GoTrue lehnt einen
 * ungültigen/abgelaufenen Token mit 401/403 ab; bei Erfolg liefert es den
 * verifizierten Nutzer inkl. id (== sub).
 *
 * Bewusst kein lokaler HS256-Check: dafür bräuchte es das JWT-Secret als
 * zusätzliches Container-Secret. SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY
 * sind am Container bereits gesetzt — das Deployment bleibt damit eine
 * reine Dateikopie ohne neue Konfiguration.
 *
 * Rückgabe:
 * - { status: "ok", sub } — Token verifiziert, sub stammt aus GoTrue.
 * - { status: "invalid" } — GoTrue lehnt den Token ab.
 * - { status: "unavailable" } — die Prüfung war nicht möglich und darf
 *   NICHT als gültig gewertet werden (der Aufrufer muss mit 503
 *   antworten).
 *
 * Zur Unterscheidung bei 401/403: Der Aufruf trägt zwei Zugangsdaten, den
 * Nutzer-JWT UND den Service-Role-Key als apikey. Ein falscher oder
 * rotierter Service-Role-Key lässt das Gateway ebenfalls mit 401
 * antworten — das ist eine Betriebsstörung, kein ungültiges Nutzertoken.
 * Unterschieden wird am Antwortkörper: Das Gateway antwortet mit
 * ausschliesslich einem message-Feld; alles andere gilt als
 * GoTrue-Tokenfehler. Greift die Heuristik daneben, bleibt das
 * Verhalten in beiden Richtungen fail-closed (401 oder 503) — niemand
 * wird fälschlich durchgelassen, nur die Fehlermeldung kann irreführen.
 */
export async function verifiedJwtSub(
  jwt: string,
  env: FunctionEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<JwtVerification> {
  try {
    const res = await fetchImpl(env.SUPABASE_URL + "/auth/v1/user", {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: "Bearer " + jwt,
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 401 || res.status === 403) {
      return (await gotrueLehntToken(res)) ? { status: "invalid" } : { status: "unavailable" };
    }
    if (!res.ok) {
      console.error("GoTrue-JWT-Prüfung fehlgeschlagen:", res.status);
      return { status: "unavailable" };
    }
    const body = (await res.json()) as { id?: unknown };
    if (typeof body.id !== "string" || !body.id) {
      console.error("GoTrue-Antwort ohne id-Feld");
      return { status: "unavailable" };
    }
    return { status: "ok", sub: body.id };
  } catch (e) {
    console.error("GoTrue-JWT-Prüfung Netzwerkfehler:", e);
    return { status: "unavailable" };
  }
}

/**
 * Anfrage-Handler — aus dem Serve-Callback extrahiert, damit die
 * Fehler- und Sicherheitsszenarien in test.ts mit injiziertem fetch
 * getestet werden können.
 */
export async function handleRequest(req: Request, env: FunctionEnv): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return json(405, { error: "nur POST" }, cors);
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return json(401, { error: "nicht angemeldet" }, cors);
  }
  const verified = await verifiedJwtSub(auth.slice(7), env);
  if (verified.status === "invalid") {
    return json(401, { error: "ungültiges Token" }, cors);
  }
  if (verified.status === "unavailable") {
    return json(503, { error: "Anmeldung derzeit nicht prüfbar — bitte erneut versuchen" }, cors);
  }
  const sub = verified.sub;

  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const res = await fetch(env.SUPABASE_URL + "/auth/v1/admin/users/" + encodeURIComponent(sub), {
      method: "DELETE",
      headers: { apikey: key, Authorization: "Bearer " + key },
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      return json(200, { ok: true }, cors);
    }
    console.error(
      "GoTrue-Admin-Delete fehlgeschlagen:",
      res.status,
      await res.text().catch(() => ""),
    );
    if (res.status === 404) {
      return json(404, { error: "Konto nicht gefunden" }, cors);
    }
    return json(502, { error: "Konto konnte nicht gelöscht werden" }, cors);
  } catch (e) {
    console.error("GoTrue-Admin-Delete Netzwerkfehler:", e);
    return json(
      503,
      { error: "Konto konnte nicht gelöscht werden — bitte erneut versuchen" },
      cors,
    );
  }
}

// Serve nur beim Direktaufruf starten (Supabase-Deploy), nicht beim
// Import durch Tests.
if (import.meta.main) {
  Deno.serve((req: Request) => {
    const env: FunctionEnv = {
      SUPABASE_URL: Deno.env.get("SUPABASE_URL") ?? "",
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      ALLOWED_ORIGIN: Deno.env.get("ALLOWED_ORIGIN") ?? undefined,
    };
    return handleRequest(req, env);
  });
}
