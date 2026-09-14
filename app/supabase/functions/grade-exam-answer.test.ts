/**
 * Tests für grade-exam-answer (Deno test).
 * Ausführen: deno test --allow-env app/supabase/functions/
 * globalThis.fetch wird pro Fall durch einen Router-Stub ersetzt, der
 * Supabase-REST und Bedrock nachstellt und die Insert-Aufrufe aufzeichnet.
 */
import { assertEquals } from "jsr:@std/assert@1";

import { handleRequest, jwtSub, verifiedJwtSub, type FunctionEnv } from "./grade-exam-answer.ts";

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
  /** exam_id des Attempts laut Lookup — Default entspricht QUESTION.exam_id. */
  attemptExamId?: string | null;
  /** Ergebnis der atomaren Budget-Reservierung (consume_ai_budget). */
  budgetGranted: boolean;
  budgetLookupFails?: boolean;
  /** RPC-Aufrufe (consume_ai_budget/release_ai_budget) mit Body. */
  rpcCalls: { fn: string; body: Record<string, unknown> }[];
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
  /** Status für den error_log-Insert, unabhängig vom exam_answers-Insert. */
  errorLogInsertStatus?: number;
  /** Simuliert einen Netzwerkfehler (Exception statt Response) beim exam_answers-Insert. */
  examAnswersInsertFails?: boolean;
  inserts: { url: string; body: Record<string, unknown> | null }[];
  /** Antwort auf GET /auth/v1/user (JWT-Verifikation via verifiedJwtSub). */
  authStatus: number;
  authBody: string;
  authNetworkFails?: boolean;
}

function stubFetch(state: StubState): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input);
    if (url.includes("/auth/v1/user")) {
      if (state.authNetworkFails) throw new TypeError("network down");
      return new Response(state.authBody, { status: state.authStatus });
    }
    if (url.includes("/exam_attempts?")) {
      if (state.attemptsLookupFails) return new Response("err", { status: 500 });
      return new Response(
        state.attemptOwned
          ? JSON.stringify([{ id: ATTEMPT_ID, exam_id: state.attemptExamId ?? QUESTION.exam_id }])
          : "[]",
        { status: 200 },
      );
    }
    if (url.includes("/rpc/consume_ai_budget")) {
      state.rpcCalls.push({
        fn: "consume_ai_budget",
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {},
      });
      if (state.budgetLookupFails) return new Response("err", { status: 500 });
      return new Response(JSON.stringify(state.budgetGranted), { status: 200 });
    }
    if (url.includes("/rpc/release_ai_budget")) {
      state.rpcCalls.push({
        fn: "release_ai_budget",
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {},
      });
      return new Response(null, { status: 200 });
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
    if (url.includes("/exam_answers")) {
      if (state.examAnswersInsertFails) throw new TypeError("network error");
      state.inserts.push({
        url,
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null,
      });
      return new Response(null, { status: state.insertStatus });
    }
    if (url.includes("/error_log")) {
      state.inserts.push({
        url,
        body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null,
      });
      return new Response(null, { status: state.errorLogInsertStatus ?? 201 });
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
  budgetGranted: true,
  rpcCalls: [],
  question: QUESTION,
  bedrockStatus: 200,
  bedrockBody: JSON.stringify({
    output: { message: { content: [{ text: '{"punkte": 3, "begruendung": "gut"}' }] } },
  }),
  insertStatus: 201,
  inserts: [],
  authStatus: 200,
  authBody: JSON.stringify({ id: USER_SUB }),
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

Deno.test("ungültiges JWT (GoTrue lehnt ab) → 401", async () => {
  const state = baseState();
  state.authStatus = 401;
  state.authBody = JSON.stringify({ error: "invalid_token" });
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), "not-a-jwt"), ENV);
    assertEquals(res.status, 401);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("ungültiger JSON-Body → 400", async () => {
  const state = baseState();
  globalThis.fetch = stubFetch(state);
  try {
    const req = new Request("https://fn/x", {
      method: "POST",
      headers: { authorization: "Bearer " + makeJwt(USER_SUB) },
      body: "{defekt",
    });
    const res = await handleRequest(req, ENV);
    assertEquals(res.status, 400);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("fehlende/leere question_id → 400", async () => {
  const state = baseState();
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(
      post({ ...validBody(), question_id: "" }, makeJwt(USER_SUB)),
      ENV,
    );
    assertEquals(res.status, 400);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test("antworttext über Größenlimit → 400", async () => {
  const state = baseState();
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(
      post({ ...validBody(), antworttext: "x".repeat(10_001) }, makeJwt(USER_SUB)),
      ENV,
    );
    assertEquals(res.status, 400);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
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

Deno.test("Attempt-Lookup schlägt fehl (HTTP 500) → 503 statt 403, kein Insert", async () => {
  const state = baseState();
  state.attemptsLookupFails = true;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 503);
    assertEquals(state.inserts.length, 0);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test(
  "Tageslimit erreicht (Reservierung abgelehnt) → 429, kein Bedrock-Call, kein Insert",
  async () => {
    const state = baseState();
    state.budgetGranted = false;
    globalThis.fetch = stubFetch(state);
    try {
      const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
      assertEquals(res.status, 429);
      const body = (await res.json()) as { error: string };
      assertEquals(body.error.includes("Tageslimit"), true);
      assertEquals(state.inserts.length, 0);
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  },
);

Deno.test("Reservierung ruft consume_ai_budget mit p_user aus JWT und p_limit=50", async () => {
  const state = baseState();
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 200);
    const consume = state.rpcCalls.find((c) => c.fn === "consume_ai_budget");
    assertEquals(consume?.body.p_user, USER_SUB);
    assertEquals(consume?.body.p_limit, 50);
    // Erfolgreiche Bewertung: Budget bleibt verbraucht, kein Release.
    assertEquals(
      state.rpcCalls.some((c) => c.fn === "release_ai_budget"),
      false,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test(
  "Reservierung schlägt fehl (HTTP 500) → 503, kein Bedrock-Call, kein Insert",
  async () => {
    const state = baseState();
    state.budgetLookupFails = true;
    globalThis.fetch = stubFetch(state);
    try {
      const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
      assertEquals(res.status, 503);
      assertEquals(state.inserts.length, 0);
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  },
);

Deno.test("erfolgreicher Flow: Bewertung + Upsert mit user_id + Fehlerlog bei <50 %", async () => {
  const state = baseState();
  state.bedrockBody = JSON.stringify({
    output: { message: { content: [{ text: '{"punkte": 1, "begruendung": "unvollständig"}' }] } },
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

Deno.test("Bedrock 500 → Fallback punkte=null, kein Insert, Budget freigegeben", async () => {
  const state = baseState();
  state.bedrockStatus = 500;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    const body = await res.json();
    assertEquals(body.punkte, null);
    assertEquals(state.inserts.length, 0);
    assertEquals(
      state.rpcCalls.some((c) => c.fn === "release_ai_budget"),
      true,
    );
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
  state.bedrockBody = JSON.stringify({
    output: { message: { content: [{ text: "kein JSON hier" }] } },
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

Deno.test("Bedrock-Punkte über max_punkte → nicht akzeptiert", async () => {
  const state = baseState();
  state.bedrockBody = JSON.stringify({
    output: { message: { content: [{ text: '{"punkte": 99, "begruendung": "hacker"}' }] } },
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

Deno.test(
  "exam_answers-Insert schlägt fehl (HTTP 500) → 503, kein Scheinerfolg, Budget freigegeben",
  async () => {
    const state = baseState();
    state.insertStatus = 500;
    globalThis.fetch = stubFetch(state);
    try {
      const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
      assertEquals(res.status, 503);
      assertEquals(
        state.rpcCalls.some((c) => c.fn === "release_ai_budget"),
        true,
      );
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  },
);

Deno.test(
  "exam_answers-Insert Netzwerkfehler → 503, kein Scheinerfolg, Budget freigegeben",
  async () => {
    const state = baseState();
    state.examAnswersInsertFails = true;
    globalThis.fetch = stubFetch(state);
    try {
      const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
      assertEquals(res.status, 503);
      assertEquals(
        state.rpcCalls.some((c) => c.fn === "release_ai_budget"),
        true,
      );
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  },
);

Deno.test("error_log-Insert schlägt fehl → Hauptbewertung bleibt erfolgreich (200)", async () => {
  const state = baseState();
  // punkte 1 von 4 = 25 % < 50 % → error_log-Pfad wird ausgelöst
  state.bedrockBody = JSON.stringify({
    output: { message: { content: [{ text: '{"punkte": 1, "begruendung": "unvollständig"}' }] } },
  });
  state.errorLogInsertStatus = 500;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.punkte, 1);
    // exam_answers wurde trotz fehlgeschlagenem error_log-Insert gespeichert
    assertEquals(
      state.inserts.some((i) => i.url.includes("/exam_answers")),
      true,
    );
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

Deno.test(
  "Frage gehört zu anderer Prüfung als der Attempt → 400, kein Bedrock-Call, kein Insert",
  async () => {
    const state = baseState();
    state.attemptExamId = "probepruefung_02"; // Attempt gehört zu Prüfung 02
    // QUESTION.exam_id bleibt "probepruefung_01" → Mismatch
    globalThis.fetch = stubFetch(state);
    try {
      const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
      assertEquals(res.status, 400);
      assertEquals(state.inserts.length, 0);
    } finally {
      globalThis.fetch = fetchOriginal;
    }
  },
);

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

Deno.test("GoTrue-JWT-Prüfung nicht erreichbar (Netzwerkfehler) → 503", async () => {
  const state = baseState();
  state.authNetworkFails = true;
  globalThis.fetch = stubFetch(state);
  try {
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 503);
    assertEquals(state.inserts.length, 0);
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
    const res = await handleRequest(post(validBody(), makeJwt(USER_SUB)), ENV);
    assertEquals(res.status, 503);
    assertEquals(state.inserts.length, 0);
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

Deno.test("jwtSub dekodiert base64url korrekt (nur Diagnose, keine Autorisierung mehr)", () => {
  assertEquals(jwtSub(makeJwt(USER_SUB)), USER_SUB);
  assertEquals(jwtSub("x.y.z"), "");
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
