/**
 * Edge Function `delete-account` — löscht den angemeldeten Nutzer samt
 * sämtlicher Lern-/Prüfungsdaten (Self-Service, DSGVO Art. 17).
 *
 * POST {} — Header: Authorization: Bearer <user-JWT>
 * Antwort: { "ok": true }
 *
 * Sicherheit:
 * - JWT muss vorhanden sein (zusätzlich prüft der Gateway bei VERIFY_JWT).
 * - Löschen darf nur der eigene Account: Ziel-ID = JWT.sub, nie aus dem
 *   Body (Service Role umgeht RLS und könnte sonst beliebige Nutzer
 *   löschen).
 * - Alle fachlichen Tabellen (exam_attempts, exam_answers, topic_mastery,
 *   flashcard_progress, error_log) hängen per FK ON DELETE CASCADE an
 *   auth.users — der GoTrue-Admin-Delete räumt sie mit ab.
 * - Session-Invalidierung passiert clientseitig per signOut nach Erfolg.
 */

export interface FunctionEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

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

/**
 * Anfrage-Handler — aus dem Serve-Callback extrahiert, damit die
 * Fehler- und Sicherheitsszenarien in test.ts mit injiziertem fetch
 * getestet werden können.
 */
export async function handleRequest(req: Request, env: FunctionEnv): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
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
  const sub = jwtSub(auth.slice(7));
  if (!sub) {
    return json(401, { error: "ungültiges Token" }, cors);
  }

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
    };
    return handleRequest(req, env);
  });
}
