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

import {
  advanceMissionSession,
  finishMissionSession,
  recordMissionAttempt,
} from "../mission-persistence";

beforeEach(() => {
  fromMock.mockReset();
  getUserMock.mockReset();
  rpcMock.mockReset();
});

describe("recordMissionAttempt", () => {
  it("schreibt einen stabilen Versuch und den Checkpoint gemeinsam über den atomaren RPC", async () => {
    rpcMock.mockResolvedValue({
      data: {
        correct: false,
        duplicate: false,
        queue: [{ id: "7da0b726-d05c-4e99-884d-01d16f523223", topicId: "subnetting" }],
        xp: 0,
      },
      error: null,
    });

    const result = await recordMissionAttempt({
      attemptId: "7da0b726-d05c-4e99-884d-01d16f523223",
      sessionId: "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      topicId: "subnetting",
      correct: false,
      confidence: "sure",
      nextQueue: [{ id: "7da0b726-d05c-4e99-884d-01d16f523223", topicId: "subnetting" }],
      errorDescription: "Netzadresse verwechselt",
    });

    expect(rpcMock).toHaveBeenCalledWith("record_mission_attempt", {
      p_attempt_id: "7da0b726-d05c-4e99-884d-01d16f523223",
      p_session_id: "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      p_topic_id: "subnetting",
      p_correct: false,
      p_confidence: "sure",
      p_next_queue: [{ id: "7da0b726-d05c-4e99-884d-01d16f523223", topicId: "subnetting" }],
      p_error_description: "Netzadresse verwechselt",
    });
    expect(result).toEqual({
      correct: false,
      duplicate: false,
      queue: [{ id: "7da0b726-d05c-4e99-884d-01d16f523223", topicId: "subnetting" }],
      xp: 0,
    });
  });
});

describe("advanceMissionSession", () => {
  it("verschiebt den Wiederaufnahmepunkt nur über den Session-RPC", async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });

    await advanceMissionSession({
      sessionId: "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      attemptId: "7da0b726-d05c-4e99-884d-01d16f523223",
      nextIndex: 3,
    });

    expect(rpcMock).toHaveBeenCalledWith("advance_mission_session", {
      p_session_id: "2f031b4b-69ad-4f0d-9d1d-c11effd4288a",
      p_attempt_id: "7da0b726-d05c-4e99-884d-01d16f523223",
      p_next_index: 3,
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
