/**
 * Tests für delete-account (Deno test).
 * Ausführen: deno test --allow-env app/supabase/functions/
 * globalThis.fetch wird pro Fall durch einen Stub ersetzt, der die
 * GoTrue-Admin-API nachstellt.
 */
import { assertEquals } from "jsr:@std/assert@1";

import { handleRequest, jwtSub, verifiedJwtSub, type FunctionEnv } from "./delete-account.ts";

const fetchOriginal = globalThis.fetch;

const ENV: FunctionEnv = {
  SUPABASE_URL: "https://stub.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
};

const USER_SUB = "22222222-2222-2222-2222-222222222222";

interface StubState {
  gotrueStatus: number;
  gotrueBody: string;
  networkFails?: boolean;
  deletes: { url: string }[];
  /** Antwort auf GET /auth/v1/user (JWT-Verifikation via verifiedJwtSub). */
  authStatus: number;
  authBody: string;
  authNetworkFails?: boolean;
}

function stubFetch(state: StubState): typeof fetch {
  return (async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
    if (url.includes("/auth/v1/user")) {
      if (state.authNetworkFails) throw new TypeError("network down");
      return new Response(state.authBody, { status: state.authStatus });
    }
    if (url.includes("/auth/v1/admin/users/")) {
      state.deletes.push({ url });
      if (state.networkFails) throw new TypeError("network down");
      return state.gotrueStatus === 204
        ? new Response(null, { status: 204 })
        : new Response(state.gotrueBody, { status: state.gotrueStatus });
    }
    return new Response("unrouted", { status: 500 });
  }) as typeof fetch;
}

function makeJwt(sub: string): string {
  const b64url = (s: string) => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64url('{"alg":"HS256"}')}.${b64url(JSON.stringify({ sub }))}.sig`;
}

function post(jwt?: string): Request {
  return new Request("https://fn/functions/v1/delete-account", {
    method: "POST",
    headers: jwt ? { authorization: "Bearer " + jwt } : {},
    body: "{}",
  });
}

const baseState = (): StubState => ({
  gotrueStatus: 204,
  gotrueBody: "",
  deletes: [],
  authStatus: 200,
  authBody: JSON.stringify({ id: USER_SUB }),
});

Deno.test("OPTIONS wird ohne Auth beantwortet", async () => {
  const res = await handleRequest(new Request("https://fn/x", { method: "OPTIONS" }), ENV);
  assertEquals(res.status, 200);
});

Deno.test("ohne JWT → 401", async () => {
  const res = await handleRequest(post(), ENV);
  assertEquals(res.status, 401);
});

Deno.test("ungültiges JWT (GoTrue lehnt ab) → 401", async () => {
  const state = baseState();
  state.authStatus = 401;
  state.authBody = JSON.stringify({ error: "invalid_token" });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post("not-a-jwt"), ENV);
    assertEquals(res.status, 401);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("GET → 405", async () => {
  const res = await handleRequest(new Request("https://fn/x"), ENV);
  assertEquals(res.status, 405);
});

Deno.test("erfolgreicher Delete löscht den eigenen Account und antwortet ok", async () => {
  const state = baseState();
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 200);
    assertEquals((await res.json()) as { ok: boolean }, { ok: true });
    assertEquals(state.deletes.length, 1);
    assertEquals(state.deletes[0]?.url, ENV.SUPABASE_URL + "/auth/v1/admin/users/" + USER_SUB);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("GoTrue 404 (User existiert nicht) → 404", async () => {
  const state = baseState();
  state.gotrueStatus = 404;
  state.gotrueBody = JSON.stringify({ code: 404, msg: "User not found" });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 404);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("GoTrue interner Fehler → 502", async () => {
  const state = baseState();
  state.gotrueStatus = 500;
  state.gotrueBody = JSON.stringify({ code: 500, msg: "database error" });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 502);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("Netzwerkfehler zum GoTrue → 503", async () => {
  const state = baseState();
  state.networkFails = true;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 503);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("GoTrue-JWT-Prüfung nicht erreichbar (Netzwerkfehler) → 503", async () => {
  const state = baseState();
  state.authNetworkFails = true;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 503);
    assertEquals(state.deletes.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("GoTrue liefert 500 bei JWT-Prüfung → 503 (fail-closed, nicht 401)", async () => {
  const state = baseState();
  state.authStatus = 500;
  state.authBody = JSON.stringify({ error: "internal" });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 503);
    assertEquals(state.deletes.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("Ziel-ID der Löschung kommt aus GoTrue, nicht aus dem JWT-Payload", async () => {
  const payloadSub = "99999999-9999-9999-9999-999999999999";
  const realSubFromGotrue = "11111111-1111-1111-1111-111111111111";
  const state = baseState();
  state.authBody = JSON.stringify({ id: realSubFromGotrue });
  globalThis.fetch = stubFetch(state);
  try {
    // Gefälschtes Token: Payload-sub weicht bewusst von der (von GoTrue
    // signierten) Wahrheit ab — die Function darf trotzdem nicht den
    // Payload-Wert löschen.
    const res = await handleRequest(post(makeJwt(payloadSub)), ENV);
    assertEquals(res.status, 200);
    assertEquals(state.deletes.length, 1);
    assertEquals(
      state.deletes[0]?.url,
      ENV.SUPABASE_URL + "/auth/v1/admin/users/" + realSubFromGotrue,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("verifiedJwtSub: ok/invalid/unavailable je nach GoTrue-Antwort", async () => {
  const fetchOk = (async () =>
    new Response(JSON.stringify({ id: USER_SUB }), { status: 200 })) as typeof fetch;
  const fetchInvalid = (async () =>
    new Response(JSON.stringify({ error: "invalid" }), { status: 401 })) as typeof fetch;
  const fetchDown = (() => {
    throw new TypeError("network down");
  }) as typeof fetch;

  assertEquals(await verifiedJwtSub("jwt", ENV, fetchOk), { status: "ok", sub: USER_SUB });
  assertEquals(await verifiedJwtSub("jwt", ENV, fetchInvalid), { status: "invalid" });
  assertEquals(await verifiedJwtSub("jwt", ENV, fetchDown), { status: "unavailable" });
});

Deno.test("401 in Gateway-Form (falscher apikey) → unavailable, nicht invalid", async () => {
  // Kong lehnt einen falschen apikey mit ausschliesslich { message } ab. Das
  // ist eine Betriebsstoerung: Der Nutzer-Token kann voellig in Ordnung sein.
  // Wuerde das als "invalid" durchgehen, bekaeme jeder Nutzer waehrend einer
  // Key-Rotation "ungueltiges Token" statt einer erkennbaren Stoerung.
  const fetchGateway = (async () =>
    new Response(JSON.stringify({ message: "Invalid authentication credentials" }), {
      status: 401,
    })) as typeof fetch;
  assertEquals(await verifiedJwtSub("jwt", ENV, fetchGateway), { status: "unavailable" });

  // GoTrue-Form bleibt "invalid" — beide bekannten Auspraegungen.
  const fetchGotrueNeu = (async () =>
    new Response(JSON.stringify({ code: 401, error_code: "bad_jwt", msg: "invalid JWT" }), {
      status: 401,
    })) as typeof fetch;
  const fetchGotrueAlt = (async () =>
    new Response(JSON.stringify({ error: "invalid_token", error_description: "expired" }), {
      status: 401,
    })) as typeof fetch;
  assertEquals(await verifiedJwtSub("jwt", ENV, fetchGotrueNeu), { status: "invalid" });
  assertEquals(await verifiedJwtSub("jwt", ENV, fetchGotrueAlt), { status: "invalid" });

  // Unlesbarer Koerper: im Zweifel Stoerung, nicht "Token ungueltig".
  const fetchMuell = (async () =>
    new Response("<html>502</html>", { status: 401 })) as typeof fetch;
  assertEquals(await verifiedJwtSub("jwt", ENV, fetchMuell), { status: "unavailable" });
});

Deno.test("jwtSub decodiert sub (nur Diagnose, keine Autorisierung mehr)", () => {
  assertEquals(jwtSub(makeJwt(USER_SUB)), USER_SUB);
  assertEquals(jwtSub("kein-jwt"), "");
});
