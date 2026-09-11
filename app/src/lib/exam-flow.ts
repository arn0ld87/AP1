/**
 * Reine Prüfungslogik für Probeprüfungen (ohne React-State-Abhängigkeit).
 * Die Abschlusslogik berechnet Ergebnisse deterministisch aus expliziten
 * Parametern — kein Zugriff auf asynchron gesetzten React-State.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface Frage {
  id: string;
  aufgabe_nr: number | null;
  teil: string | null;
  frage: string | null;
  max_punkte: number | null;
  musterloesung: string | null;
  intro: string | null;
  ausgangssituation: string | null;
}

export type PruefungResults = Record<string, { punkte: number | null; begruendung: string }>;

/**
 * Notenstufe 1–6 nach IHK-Schlüssel (100–92=1, 91–81=2, 80–67=3, 66–50=4,
 * 49–30=5, 29–0=6). AP1 hat KEINE eigenständige Bestehensgrenze: 50 Punkte
 * entsprechen der Notenstufe "ausreichend" (Note 4), AP1 geht mit 20 % in
 * das Gesamtergebnis der gestreckten Abschlussprüfung ein.
 */
export function notenstufe(percent: number): string {
  if (percent >= 92) return "1";
  if (percent >= 81) return "2";
  if (percent >= 67) return "3";
  if (percent >= 50) return "4";
  if (percent >= 30) return "5";
  return "6";
}

/** Summiert vergebene Punkte; fehlende/null-Bewertungen zählen 0. */
export function gesamtpunkteVon(fragen: Pick<Frage, "id">[], results: PruefungResults): number {
  return fragen.reduce((a, f) => a + (results[f.id]?.punkte ?? 0), 0);
}

/** Maximale Punktzahl aller Fragen. */
export function maxPunkteVon(fragen: Pick<Frage, "max_punkte">[]): number {
  return fragen.reduce((a, f) => a + (f.max_punkte ?? 0), 0);
}

export interface GradeFnInput {
  question_id: string;
  attempt_id: string;
  antworttext: string;
}

export interface GradeFnOutput {
  punkte: number | null;
  begruendung?: string;
}

/**
 * Bewertet alle Fragen sequenziell und liefert das vollständige Ergebnis
 * als Wert zurück (keine State-Mutation). `callGrade` kapselt den
 * Edge-Function-Aufruf und ist damit in Tests austauschbar.
 */
export async function gradeAllQuestions(
  fragen: Frage[],
  answers: Record<string, string>,
  attemptId: string,
  callGrade: (input: GradeFnInput) => Promise<GradeFnOutput>,
): Promise<PruefungResults> {
  const results: PruefungResults = {};
  for (const f of fragen) {
    try {
      const r = await callGrade({
        question_id: f.id,
        attempt_id: attemptId,
        antworttext: answers[f.id] ?? "",
      });
      results[f.id] = {
        punkte: typeof r.punkte === "number" && Number.isFinite(r.punkte) ? r.punkte : null,
        begruendung: r.begruendung ?? "KI-Bewertung nicht verfügbar.",
      };
    } catch {
      results[f.id] = { punkte: null, begruendung: "KI-Bewertung nicht verfügbar." };
    }
  }
  return results;
}

export interface SubmitExamDeps {
  fragen: Frage[];
  answers: Record<string, string>;
  attemptId: string;
  callGrade: (input: GradeFnInput) => Promise<GradeFnOutput>;
  /** Persistiert gesamtpunkte + finished_at in exam_attempts. */
  persist: (gesamtpunkte: number) => Promise<unknown>;
}

/**
 * Abschluss-Flow: bewertet zuerst alles (unabhängig von React-State),
 * berechnet die Summe aus dem Ergebniswert und persistiert erst danach.
 * Timeout und manueller Abgabe-Button nutzen denselben Flow; die Route
 * verhindert Parallel-Ausführung über einen Ref-Guard.
 */
export async function submitExamFlow(
  deps: SubmitExamDeps,
): Promise<{ results: PruefungResults; gesamtpunkte: number }> {
  const results = await gradeAllQuestions(
    deps.fragen,
    deps.answers,
    deps.attemptId,
    deps.callGrade,
  );
  const gesamtpunkte = gesamtpunkteVon(deps.fragen, results);
  await deps.persist(gesamtpunkte);
  return { results, gesamtpunkte };
}

/**
 * Persistiert den Abschluss (gesamtpunkte + finished_at) in exam_attempts.
 * Supabase-js meldet Schreibfehler als `{ error }` statt per Exception —
 * hier wird daraus bewusst eine Exception, damit der Aufrufer nicht
 * stillschweigend über einen fehlgeschlagenen Save hinweggeht.
 */
export async function persistAttemptFinish(
  db: SupabaseClient,
  attemptId: string,
  gesamtpunkte: number,
): Promise<void> {
  const { error } = await db
    .from("exam_attempts")
    .update({ gesamtpunkte, finished_at: new Date().toISOString() })
    .eq("id", attemptId);
  if (error) throw new Error("Abschluss konnte nicht gespeichert werden: " + error.message);
}

/**
 * Upsert der Selbsteinschätzung in exam_answers (Konflikt über
 * attempt_id + question_id). Das Fehlerfeld wird wie bei
 * persistAttemptFinish zu einer Exception umgebogen.
 */
export async function upsertSelfGrade(
  db: SupabaseClient,
  input: { attemptId: string; questionId: string; antworttext: string; punkte: number },
): Promise<void> {
  const { error } = await db.from("exam_answers").upsert(
    {
      attempt_id: input.attemptId,
      question_id: input.questionId,
      antworttext: input.antworttext,
      ki_punkte: input.punkte,
      ki_feedback: "Selbst eingeschätzt.",
    },
    { onConflict: "attempt_id,question_id" },
  );
  if (error) {
    throw new Error("Selbsteinschätzung konnte nicht gespeichert werden: " + error.message);
  }
}
