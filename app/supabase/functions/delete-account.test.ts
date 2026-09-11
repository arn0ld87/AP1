/**
 * Tests für delete-account (Deno test).
 * Ausführen: deno test --allow-env app/supabase/functions/
 * globalThis.fetch wird pro Fall durch einen Stub ersetzt, der die
 * GoTrue-Admin-API nachstellt.
 */
import { assertEquals } from "jsr:@std/assert@1";

import { handleRequest, jwtSub, type FunctionEnv } from "./delete-account.ts";

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
}

function stubFetch(state: StubState): typeof fetch {
  return (async (input: RequestInfo | URL): Promise<Response> => {
    const url = String(input);
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

const baseState = (): StubState => ({ gotrueStatus: 204, gotrueBody: "", deletes: [] });

Deno.test("OPTIONS wird ohne Auth beantwortet", async () => {
  const res = await handleRequest(new Request("https://fn/x", { method: "OPTIONS" }), ENV);
  assertEquals(res.status, 200);
});

Deno.test("ohne JWT → 401", async () => {
  const res = await handleRequest(post(), ENV);
  assertEquals(res.status, 401);
});

Deno.test("ungültiges JWT → 401", async () => {
  const res = await handleRequest(post("not-a-jwt"), ENV);
  assertEquals(res.status, 401);
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

Deno.test("jwtSub decodiert sub", () => {
  assertEquals(jwtSub(makeJwt(USER_SUB)), USER_SUB);
  assertEquals(jwtSub("kein-jwt"), "");
});
