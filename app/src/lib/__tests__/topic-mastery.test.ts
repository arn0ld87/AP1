import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * topic-mastery.ts importiert den Supabase-Singleton per `@/integrations/supabase/client`.
 * Dieser Alias ist unter der aktuellen vitest.config.ts (kein vite-tsconfig-paths-Plugin
 * registriert) nicht auflösbar — ein direkter Import von topic-mastery.ts würde mit
 * "Cannot find package '@/integrations/supabase/client'" fehlschlagen. vi.mock() ersetzt
 * das Modul jedoch, bevor Vitest den echten Pfad auflösen muss, und funktioniert daher
 * trotzdem (siehe exam-flow.test.ts für das Äquivalent bei injizierten Clients).
 */
const { fromMock, rpcMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: fromMock,
    rpc: rpcMock,
  },
}));

import { fetchTopicMastery, recordTopicResult, type MasteryRow } from "../topic-mastery";

beforeEach(() => {
  fromMock.mockReset();
  rpcMock.mockReset();
});

describe("fetchTopicMastery", () => {
  it("liest topic_id/richtig/falsch aus der Tabelle topic_mastery", async () => {
    const rows: MasteryRow[] = [
      { topic_id: "subnetting", richtig: 4, falsch: 1 },
      { topic_id: "raid", richtig: 0, falsch: 2 },
    ];
    const selectMock = vi.fn(async () => ({ data: rows, error: null }));
    fromMock.mockReturnValue({ select: selectMock });

    const result = await fetchTopicMastery();

    expect(fromMock).toHaveBeenCalledWith("topic_mastery");
    expect(selectMock).toHaveBeenCalledWith("topic_id, richtig, falsch");
    expect(result).toEqual(rows);
  });

  it("liefert ein leeres Array, wenn die DB data: null ohne Fehler zurückgibt", async () => {
    fromMock.mockReturnValue({ select: vi.fn(async () => ({ data: null, error: null })) });

    await expect(fetchTopicMastery()).resolves.toEqual([]);
  });

  it("wirft bei Fehlerantwort der DB die Supabase-Fehlermeldung (kein stilles Verschlucken)", async () => {
    fromMock.mockReturnValue({
      select: vi.fn(async () => ({
        data: null,
        error: { message: "permission denied for topic_mastery" },
      })),
    });

    await expect(fetchTopicMastery()).rejects.toThrow("permission denied for topic_mastery");
  });
});

describe("recordTopicResult", () => {
  it("zählt über die RPC increment_topic_mastery atomar hoch — mit p_topic_id/p_correct", async () => {
    rpcMock.mockResolvedValue({ error: null });

    await recordTopicResult("subnetting", true);

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("increment_topic_mastery", {
      p_topic_id: "subnetting",
      p_correct: true,
    });
  });

  it("übergibt correct=false unverändert (kein impliziertes Truthy-Casting)", async () => {
    rpcMock.mockResolvedValue({ error: null });

    await recordTopicResult("raid", false);

    expect(rpcMock).toHaveBeenCalledWith("increment_topic_mastery", {
      p_topic_id: "raid",
      p_correct: false,
    });
  });

  it("propagiert einen Fehler aus der RPC als Exception (kein verlorener Zähler ohne Hinweis)", async () => {
    rpcMock.mockResolvedValue({ error: { message: "rate limit exceeded" } });

    await expect(recordTopicResult("subnetting", true)).rejects.toThrow("rate limit exceeded");
  });
});
