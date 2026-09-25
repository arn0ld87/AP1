// Relativer Import statt "@/data/..." — der Alias ist unter vitest.config.ts nicht
// auflösbar (siehe topic-mastery.test.ts), und quiz.ts wird direkt getestet, nicht gemockt.
import rawQuiz from "../data/notebooklm/quiz.json";

/**
 * Von NotebookLM aus den Altprüfungen generiertes Quiz (siehe
 * `app/src/data/notebooklm/quiz.json`). `hasAllOfTheAbove`/`hasNoneOfTheAbove`
 * sind Generator-Metadaten und werden aktuell nicht ausgewertet — die
 * jeweilige Option enthält den Text ("Alle/Keine der oben genannten") bereits
 * selbst.
 */
export type QuestionType = "multiple_choice" | "multiple_select";

export interface AnswerOption {
  text: string;
  isCorrect: boolean;
  rationale: string;
}

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  answerOptions: AnswerOption[];
  hint: string;
  hasAllOfTheAbove?: boolean;
  hasNoneOfTheAbove?: boolean;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = (rawQuiz as { quiz: QuizQuestion[] }).quiz;

export interface GradeResult {
  correct: boolean;
  correctIndexes: number[];
  selectedIndexes: number[];
}

/**
 * Bewertet eine Antwort rein anhand der Indizes in `answerOptions` — für
 * `multiple_choice` reicht ein Treffer, für `multiple_select` muss die
 * Auswahl exakt der Menge der korrekten Optionen entsprechen (nicht mehr,
 * nicht weniger).
 */
export function gradeQuestion(question: QuizQuestion, selectedIndexes: number[]): GradeResult {
  const correctIndexes = question.answerOptions
    .map((option, i) => (option.isCorrect ? i : -1))
    .filter((i) => i !== -1);
  const selectedSet = new Set(selectedIndexes);
  const correctSet = new Set(correctIndexes);
  const correct =
    selectedSet.size === correctSet.size && [...selectedSet].every((i) => correctSet.has(i));
  return {
    correct,
    correctIndexes,
    selectedIndexes: [...selectedSet].sort((a, b) => a - b),
  };
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Mischt Fragenreihenfolge und je Frage die Optionsreihenfolge — für den
 * "Nochmal"-Durchlauf. `rng` ist injizierbar für deterministische Tests
 * (siehe flashcard-weighting.ts für dasselbe Muster).
 */
export function shuffleQuestions(
  questions: QuizQuestion[],
  rng: () => number = Math.random,
): QuizQuestion[] {
  return shuffle(questions, rng).map((q) => ({
    ...q,
    answerOptions: shuffle(q.answerOptions, rng),
  }));
}
