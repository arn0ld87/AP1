import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, getUserMock, rpcMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  getUserMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: getUserMock },
    from: fromMock,
    rpc: rpcMock,
  },
}));

import { finishMissionSession, recordMissionAttempt } from "../mission-persistence";

beforeEach(() => {
  fromMock.mockReset();
  getUserMock.mockReset();
  rpcMock.mockReset();
});

describe("recordMissionAttempt", () => {
  it("schreibt Ergebnis, Sicherheit, XP und Fehlertext gemeinsam über den atomaren RPC", async () => {
    rpcMock.mockResolvedValue({ error: null });

    await recordMissionAttempt({
      sessionId: "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      topicId: "subnetting",
      correct: false,
      confidence: "sure",
      xp: 0,
      errorDescription: "Netzadresse verwechselt",
    });

    expect(rpcMock).toHaveBeenCalledWith("record_mission_attempt", {
      p_session_id: "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      p_topic_id: "subnetting",
      p_correct: false,
      p_confidence: "sure",
      p_xp: 0,
      p_error_description: "Netzadresse verwechselt",
    });
  });
});

describe("finishMissionSession", () => {
  it("persistiert Abschlusszeit, aktive Dauer, Zustand und Abbruchstatus", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-14T12:05:00.000Z"));
    const eqMock = vi.fn(async () => ({ error: null }));
    const updateMock = vi.fn(() => ({ eq: eqMock }));
    fromMock.mockReturnValue({ update: updateMock });

    await finishMissionSession(
      "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      new Date("2026-09-14T12:00:00.000Z"),
      { currentIndex: 4 },
      true,
    );

    expect(fromMock).toHaveBeenCalledWith("learning_session");
    expect(updateMock).toHaveBeenCalledWith({
      ended_at: "2026-09-14T12:05:00.000Z",
      active_seconds: 300,
      was_interrupted: true,
      details: { currentIndex: 4 },
    });
    expect(eqMock).toHaveBeenCalledWith("id", "2f031b4b-69ad-4f0d-9d1d-c11effd4288a");
    vi.useRealTimers();
  });
});
