/**
 * Tests für grade-exam-answer (Deno test).
 * Ausführen: deno test --allow-env app/supabase/functions/
 * globalThis.fetch wird pro Fall durch einen Router-Stub ersetzt, der
 * Supabase-REST und Bedrock nachstellt und die Insert-Aufrufe aufzeichnet.
 */
import { assertEquals } from "jsr:@std/assert@1";

import { handleRequest, jwtSub, type FunctionEnv } from "./grade-exam-answer.ts";

const fetchOriginal = globalThis.fetch;

const ENV: FunctionEnv = {
  SUPABASE_URL: "https://stub.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-key",
  AWS_BEDROCK_API_KEY: "bedrock-key",
};

const USER_SUB = "22222222-2222-2222-2222-222222222222";
const ATTEMPT_ID = "33333333-3333-3333-3333-333333333333";
const QUESTION_ID = "probepruefung_01-1a";

interface StubState {
  attemptOwned: boolean;
  attemptsLookupFails?: boolean;
  question: {
    frage: string;
    musterloesung: string;
    max_punkte: number;
    exam_id: string;
    aufgabe_nr: number;
    teil: string;
  } | null;
  questionStatus?: number;
  bedrockStatus: number;
  bedrockBody: string;
  insertStatus: number;
  inserts: { url: string; body: Record<string, unknown> | null }[];
}

function stubFetch(state: StubState): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes("/exam_attempts?")) {
      if (state.attemptsLookupFails) return new Response("err", { status: 500 });
      return new Response(state.attemptOwned ? JSON.stringify([{ id: ATTEMPT_ID }]) : "[]", {
        status: 200,
      });
    }
    if (url.includes("/exam_questions?")) {
      if (state.questionStatus) return new Response("err", { status: state.questionStatus });
      return new Response(state.question ? JSON.stringify([state.question]) : "[]", {
        status: 200,
      });
    }
    if (url.includes("bedrock-runtime")) {
      return new Response(state.bedrockBody, { status: state.bedrockStatus });
    }
    if (url.includes("/exam_answers") || url.includes("/error_log")) {
      state.inserts.push({
        url,
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null,
      });
      return new Response(null, { status: state.insertStatus });
    }
    return new Response("unrouted", { status: 500 });
  }) as typeof fetch;
}

function makeJwt(sub: string): string {
  const b64url = (s: string) => btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${b64url('{"alg":"HS256"}')}.${b64url(JSON.stringify({ sub }))}.sig`;
}

function post(body: unknown, jwt?: string): Request {
  return new Request("https://fn/functions/v1/grade-exam-answer", {
    method: "POST",
    headers: jwt ? { authorization: "Bearer " + jwt, "content-type": "application/json" } : {},
    body: JSON.stringify(body),
  });
}

const QUESTION = {
  frage: "Nennen Sie zwei Schutzziele.",
  musterloesung: "Vertraulichkeit, Integrität",
  max_punkte: 4,
  exam_id: "probepruefung_01",
  aufgabe_nr: 1,
  teil: "a",
};

const baseState = (): StubState => ({
  attemptOwned: true,
  question: QUESTION,
  bedrockStatus: 200,
  bedrockBody: JSON.stringify({
    content: [{ text: '{"punkte": 3, "begruendung": "gut"}' }],
  }),
  insertStatus: 201,
  inserts: [],
});

const validBody = () => ({
  question_id: QUESTION_ID,
  attempt_id: ATTEMPT_ID,
  antworttext: "Vertraulichkeit und Integrität",
});

Deno.test("OPTIONS wird ohne Auth beantwortet", async () => {
  const res = await handleRequest(new Request("https://fn/x", { method: "OPTIONS" }), ENV);
  assertEquals(res.status, 200);
});

Deno.test("ohne JWT → 401", async () => {
  const res = await handleRequest(post(validBody()), ENV);
  assertEquals(res.status, 401);
});

Deno.test("ungültiges JWT → 401", async () => {
  const res = await handleRequest(post(validBody(), "not-a-jwt"), ENV);
  assertEquals(res.status, 401);
});

Deno.test("ungültiger JSON-Body → 400", async () => {
  const req = new Request("https://fn/x", {
    method: "POST",
    headers: { authorization: "Bearer " + makeJwt(USER_SUB) },
    body: "{defekt",
  });
  const res = await handleRequest(req, ENV);
  assertEquals(res.status, 400);
});

Deno.test("fehlende/leere question_id → 400", async () => {
  const res = await handleRequest(
    post({ ...validBody(), question_id: "" }, makeJwt(USER_SUB)),
    ENV,
  );
  assertEquals(res.status, 400);
});

Deno.test("antworttext über Größenlimit → 400", async () => {
  const res = await handleRequest(
    post({ ...validBody(), antworttext: "x".repeat(10_001) }, makeJwt(USER_SUB)),
    ENV,
  );
  assertEquals(res.status, 400);
});

Deno.test("fremde attempt_id → 403, keine Bewertung, kein Insert", async () => {
  const state = baseState();
  state.attemptOwned = false;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 403);
    assertEquals(state.inserts.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("erfolgreicher Flow: Bewertung + Upsert mit user_id + Fehlerlog bei <50 %", async () => {
  const state = baseState();
  state.bedrockBody = JSON.stringify({
    content: [{ text: '{"punkte": 1, "begruendung": "unvollständig"}' }],
  });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.punkte, 1);
    const answerInsert = state.inserts.find((i) => i.url.includes("/exam_answers"));
    assertEquals(answerInsert?.body?.user_id, USER_SUB);
    assertEquals(answerInsert?.body?.ki_punkte, 1);
    assertEquals(
      state.inserts.some((i) => i.url.includes("/error_log")),
      true,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("kein Fehlerlog bei >=50 %", async () => {
  const state = baseState(); // punkte 3 von 4 = 75 %
  globalThis.fetch = stubFetch(state);
  try {
    await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(
      state.inserts.some((i) => i.url.includes("/error_log")),
      false,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("Bedrock 500 → Fallback punkte=null, kein Insert", async () => {
  const state = baseState();
  state.bedrockStatus = 500;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    const body = await res.json();
    assertEquals(body.punkte, null);
    assertEquals(state.inserts.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("Bedrock-Timeout → Fallback punkte=null", async () => {
  const state = baseState();
  const abortingFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input).includes("bedrock-runtime")) {
      // simuliert AbortSignal.timeout: Fetch bricht mit TimeoutError ab
      return Promise.reject(
        new DOMException("The operation was aborted due to timeout", "TimeoutError"),
      );
    }
    return stubFetch(state)(input, init);
  }) as typeof fetch;
  globalThis.fetch = abortingFetch;
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    const body = await res.json();
    assertEquals(body.punkte, null);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("Bedrock liefert invalides JSON → punkte=null, kein Insert", async () => {
  const state = baseState();
  state.bedrockBody = JSON.stringify({ content: [{ text: "kein JSON hier" }] });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    const body = await res.json();
    assertEquals(body.punkte, null);
    assertEquals(state.inserts.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("Bedrock-Punkte über max_punkte → nicht akzeptiert", async () => {
  const state = baseState();
  state.bedrockBody = JSON.stringify({
    content: [{ text: '{"punkte": 99, "begruendung": "hacker"}' }],
  });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    const body = await res.json();
    assertEquals(body.punkte, null);
    assertEquals(state.inserts.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("DB-Insert schlägt fehl → Antwort bleibt 200 mit Bewertung", async () => {
  const state = baseState();
  state.insertStatus = 500;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.punkte, 3);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("unbekannte question_id → Fallback ohne Insert", async () => {
  const state = baseState();
  state.question = null;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    const body = await res.json();
    assertEquals(body.punkte, null);
    assertEquals(state.inserts.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("jwtSub dekodiert base64url korrekt", () => {
  assertEquals(jwtSub(makeJwt(USER_SUB)), USER_SUB);
  assertEquals(jwtSub("x.y.z"), "");
});
