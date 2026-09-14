import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * flashcard-progress.ts importiert den Supabase-Singleton per `@/integrations/supabase/client`.
 * Dieser Alias ist unter der aktuellen vitest.config.ts nicht auflösbar (siehe
 * topic-mastery.test.ts für die Begründung) — vi.mock() umgeht das, weil es das Modul
 * ersetzt, bevor der reale Pfad aufgelöst werden müsste.
 *
 * Hinweis zur Aufgabenstellung: Die fachliche Gewichtungslogik
 * `(falsch + 1) / (richtig + falsch + 2)` liegt NICHT in flashcard-progress.ts, sondern
 * in flashcard-weighting.ts (Funktion `kartengewicht`) und ist dort bereits vollständig
 * getestet (flashcard-weighting.test.ts, inkl. der Regression "neue Karten fallen nicht
 * aus dem Pool"). flashcard-progress.ts selbst ist ein reines Persistenzmodul ohne
 * Gewichtungsberechnung — die Annahme aus der Aufgabenstellung trifft auf diese Datei
 * nicht zu. Dieser Test deckt daher den Erfolgs-/Fehlerpfad des Persistenzmoduls ab.
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

import { fetchFlashcardProgress, recordCardResult, type FlashcardRow } from "../flashcard-progress";

beforeEach(() => {
  fromMock.mockReset();
  rpcMock.mockReset();
});

describe("fetchFlashcardProgress", () => {
  it("liest card_id/richtig/falsch aus der Tabelle flashcard_progress", async () => {
    const rows: FlashcardRow[] = [
      { card_id: "osi-schicht-3", richtig: 6, falsch: 2 },
      { card_id: "raid-5", richtig: 1, falsch: 0 },
    ];
    const selectMock = vi.fn(async () => ({ data: rows, error: null }));
    fromMock.mockReturnValue({ select: selectMock });

    const result = await fetchFlashcardProgress();

    expect(fromMock).toHaveBeenCalledWith("flashcard_progress");
    expect(selectMock).toHaveBeenCalledWith("card_id, richtig, falsch");
    expect(result).toEqual(rows);
  });

  it("liefert ein leeres Array, wenn die DB data: null ohne Fehler zurückgibt", async () => {
    fromMock.mockReturnValue({ select: vi.fn(async () => ({ data: null, error: null })) });

    await expect(fetchFlashcardProgress()).resolves.toEqual([]);
  });

  it("wirft bei Fehlerantwort der DB die Supabase-Fehlermeldung (kein stilles Verschlucken)", async () => {
    fromMock.mockReturnValue({
      select: vi.fn(async () => ({
        data: null,
        error: { message: "permission denied for flashcard_progress" },
      })),
    });

    await expect(fetchFlashcardProgress()).rejects.toThrow(
      "permission denied for flashcard_progress",
    );
  });
});

describe("recordCardResult", () => {
  it("zählt über die RPC increment_flashcard_progress atomar hoch — mit p_card_id/p_correct", async () => {
    rpcMock.mockResolvedValue({ error: null });

    await recordCardResult("osi-schicht-3", true);

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("increment_flashcard_progress", {
      p_card_id: "osi-schicht-3",
      p_correct: true,
    });
  });

  it("übergibt correct=false unverändert (kein impliziertes Truthy-Casting)", async () => {
    rpcMock.mockResolvedValue({ error: null });

    await recordCardResult("raid-5", false);

    expect(rpcMock).toHaveBeenCalledWith("increment_flashcard_progress", {
      p_card_id: "raid-5",
      p_correct: false,
    });
  });

  it("propagiert einen Fehler aus der RPC als Exception (kein verlorener Zähler ohne Hinweis)", async () => {
    rpcMock.mockResolvedValue({ error: { message: "rate limit exceeded" } });

    await expect(recordCardResult("osi-schicht-3", true)).rejects.toThrow("rate limit exceeded");
  });
});
