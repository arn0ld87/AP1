import type { Topic } from "./ap1-topics";

export type AnswerConfidence = "sure" | "unsure" | "guessed";

export interface AdaptiveMasteryRow {
  topic_id: string;
  richtig: number;
  falsch: number;
  updated_at: string;
  confidence_score: number;
  streak: number;
  next_review_at: string | null;
  last_seen_at: string | null;
  xp: number;
}

export interface TopicPriority {
  topic: Topic;
  score: number;
  weakness: number;
  examRelevance: number;
  errorFrequency: number;
  repetitionDue: number;
  uncertainty: number;
  reasons: string[];
}

export type MissionTaskKind = "quick" | "calculation" | "boss";

export interface ReviewSchedule {
  intervalDays: number;
  nextReviewAt: Date;
  nextStreak: number;
  repeatInSession: boolean;
}

export interface DailyMissionItem {
  topic: Topic;
  taskCount: number;
  priority: number;
  reason: string;
  estimatedMinutes: number;
}

export interface DailyMission {
  items: DailyMissionItem[];
  estimatedMinutes: number;
}

export interface Readiness {
  score: number;
  coverage: number;
  byTopic: Record<string, number>;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function calculateTopicPriority(
  topic: Topic,
  row: AdaptiveMasteryRow | undefined,
  openErrors: number,
  now = new Date(),
): TopicPriority {
  const attempts = (row?.richtig ?? 0) + (row?.falsch ?? 0);
  const smoothedAccuracy = ((row?.richtig ?? 0) + 1) / (attempts + 2);
  const weakness = attempts === 0 ? 0.72 : 1 - smoothedAccuracy;
  const examRelevance = clamp01(topic.rel / 5);
  const errorFrequency = clamp01(openErrors / 4);
  const nextReview = row?.next_review_at ? new Date(row.next_review_at) : null;
  const repetitionDue = !row?.last_seen_at || (nextReview !== null && nextReview <= now) ? 1 : 0;
  const uncertainty = clamp01(1 - (row?.confidence_score ?? 0.5));
  const score = clamp01(
    weakness * 0.35 +
      examRelevance * 0.25 +
      errorFrequency * 0.2 +
      repetitionDue * 0.15 +
      uncertainty * 0.05,
  );
  const reasons: string[] = [];
  if (weakness >= 0.55) reasons.push("hohe Fehlerquote");
  if (repetitionDue === 1) reasons.push("Wiederholung fällig");
  if (errorFrequency >= 0.5) reasons.push("mehrere offene Fehler");
  if (uncertainty >= 0.55) reasons.push("noch unsicher");
  if (!reasons.length) reasons.push("Prüfungsrelevanz");

  return {
    topic,
    score,
    weakness,
    examRelevance,
    errorFrequency,
    repetitionDue,
    uncertainty,
    reasons,
  };
}

export function calculateReviewSchedule(
  correct: boolean,
  confidence: AnswerConfidence,
  currentStreak: number,
  now = new Date(),
): ReviewSchedule {
  const nextStreak = correct ? currentStreak + 1 : 0;
  const intervals = [1, 3, 7, 14] as const;
  let intervalDays: number = correct
    ? (intervals[Math.min(currentStreak, intervals.length - 1)] ?? 14)
    : 1;
  if (confidence === "unsure") intervalDays = Math.min(intervalDays, 3) as 1 | 3;
  if (confidence === "guessed") intervalDays = 1;
  const nextReviewAt = new Date(now);
  nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + intervalDays);
  return { intervalDays, nextReviewAt, nextStreak, repeatInSession: !correct };
}

export function calculateXp(
  correct: boolean,
  confidence: AnswerConfidence,
  kind: MissionTaskKind,
): number {
  if (!correct) return 0;
  const base = kind === "boss" ? 50 : kind === "calculation" ? 20 : 10;
  const multiplier = confidence === "sure" ? 1 : confidence === "unsure" ? 0.75 : 0.5;
  return Math.round(base * multiplier);
}

export function calculateReadiness(
  topics: Topic[],
  rows: Record<string, AdaptiveMasteryRow>,
): Readiness {
  const totalWeight = topics.reduce((sum, topic) => sum + topic.rel, 0);
  let earnedWeight = 0;
  let coveredWeight = 0;
  const byTopic: Record<string, number> = {};
  for (const topic of topics) {
    const row = rows[topic.id];
    const attempts = row ? row.richtig + row.falsch : 0;
    const score = attempts > 0 ? row!.richtig / attempts : 0;
    byTopic[topic.id] = Math.round(score * 100);
    earnedWeight += score * topic.rel;
    if (attempts > 0) coveredWeight += topic.rel;
  }
  return {
    score: totalWeight ? Math.round((earnedWeight / totalWeight) * 100) : 0,
    coverage: totalWeight ? Math.round((coveredWeight / totalWeight) * 100) / 100 : 0,
    byTopic,
  };
}

export function buildDailyMission(priorities: TopicPriority[], limit = 3): DailyMission {
  const items = [...priorities]
    .sort((a, b) => b.score - a.score || b.topic.rel - a.topic.rel)
    .slice(0, limit)
    .map((priority) => {
      const taskCount = priority.topic.kind === "card" ? 5 : priority.score >= 0.8 ? 3 : 2;
      const estimatedMinutes = taskCount * (priority.topic.kind === "card" ? 1 : 4);
      return {
        topic: priority.topic,
        taskCount,
        priority: priority.score,
        reason: priority.reasons[0] ?? "Prüfungsrelevanz",
        estimatedMinutes,
      };
    });
  return { items, estimatedMinutes: items.reduce((sum, item) => sum + item.estimatedMinutes, 0) };
}

export function daysUntilExam(now = new Date(), exam = new Date(2026, 8, 30)): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const examDay = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate());
  return Math.max(0, Math.round((examDay.getTime() - today.getTime()) / 86_400_000));
}
