import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

import { CARDS } from "./ap1-cards";
import type { AdaptiveMasteryRow, AnswerConfidence } from "./ap1-mission";

export interface MissionSnapshot {
  mastery: AdaptiveMasteryRow[];
  openErrorsByTopic: Record<string, number>;
  openSession: {
    id: string;
    started_at: string;
    questions_answered: number;
    xp_earned: number;
    details: Json;
  } | null;
}

export interface MissionAttemptResult {
  correct: boolean;
  duplicate: boolean;
  queue: Json[];
  xp: number;
}

export async function fetchMissionSnapshot(): Promise<MissionSnapshot> {
  const [masteryResult, flashcardResult, errorsResult, sessionResult] = await Promise.all([
    supabase
      .from("topic_mastery")
      .select(
        "topic_id, richtig, falsch, updated_at, confidence_score, streak, next_review_at, last_seen_at, xp",
      ),
    supabase.from("flashcard_progress").select("card_id, richtig, falsch, updated_at"),
    supabase.from("error_log").select("thema").eq("erledigt", false),
    supabase
      .from("learning_session")
      .select("id, started_at, questions_answered, xp_earned, details")
      .eq("session_kind", "mission")
      .is("ended_at", null)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (masteryResult.error) throw masteryResult.error;
  if (flashcardResult.error) throw flashcardResult.error;
  if (errorsResult.error) throw errorsResult.error;
  if (sessionResult.error) throw sessionResult.error;

  const openErrorsByTopic: Record<string, number> = {};
  for (const error of errorsResult.data ?? []) {
    if (!error.thema) continue;
    openErrorsByTopic[error.thema] = (openErrorsByTopic[error.thema] ?? 0) + 1;
  }
  const mergedMastery = new Map<string, AdaptiveMasteryRow>(
    (masteryResult.data ?? []).map((row) => [row.topic_id, { ...row }]),
  );
  const topicByCard = new Map(CARDS.map((card) => [card.id, card.topic] as const));
  for (const row of flashcardResult.data ?? []) {
    const topicId = topicByCard.get(row.card_id);
    if (!topicId) continue;
    const existing = mergedMastery.get(topicId);
    if (existing) {
      existing.richtig += row.richtig;
      existing.falsch += row.falsch;
      continue;
    }
    mergedMastery.set(topicId, {
      topic_id: topicId,
      richtig: row.richtig,
      falsch: row.falsch,
      updated_at: row.updated_at,
      confidence_score: 0.5,
      streak: 0,
      next_review_at: null,
      last_seen_at: row.updated_at,
      xp: 0,
    });
  }
  return {
    mastery: [...mergedMastery.values()],
    openErrorsByTopic,
    openSession: sessionResult.data,
  };
}

export async function startMissionSession(details: Json): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Nicht authentifiziert");
  const { data, error } = await supabase
    .from("learning_session")
    .insert({ user_id: userData.user.id, session_kind: "mission", details })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function recordMissionAttempt(input: {
  attemptId: string;
  sessionId: string;
  topicId: string;
  correct: boolean;
  confidence: AnswerConfidence;
  nextQueue: Json;
  errorDescription?: string;
}): Promise<MissionAttemptResult> {
  const { data, error } = await supabase.rpc("record_mission_attempt", {
    p_attempt_id: input.attemptId,
    p_session_id: input.sessionId,
    p_topic_id: input.topicId,
    p_correct: input.correct,
    p_confidence: input.confidence,
    p_next_queue: input.nextQueue,
    p_error_description: input.errorDescription ?? null,
  });
  if (error) throw error;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Ungültige Antwort beim Speichern des Missionsversuchs.");
  }
  const result = data as Record<string, Json | undefined>;
  if (
    typeof result["correct"] !== "boolean" ||
    typeof result["duplicate"] !== "boolean" ||
    !Array.isArray(result["queue"]) ||
    typeof result["xp"] !== "number"
  ) {
    throw new Error("Unvollständige Antwort beim Speichern des Missionsversuchs.");
  }
  return {
    correct: result["correct"],
    duplicate: result["duplicate"],
    queue: result["queue"],
    xp: result["xp"],
  };
}

export async function advanceMissionSession(input: {
  sessionId: string;
  attemptId: string;
  nextIndex: number;
}): Promise<void> {
  const { error } = await supabase.rpc("advance_mission_session", {
    p_session_id: input.sessionId,
    p_attempt_id: input.attemptId,
    p_next_index: input.nextIndex,
  });
  if (error) throw error;
}

export async function finishMissionSession(
  sessionId: string,
  startedAt: Date,
  details: Json,
  interrupted = false,
): Promise<void> {
  const endedAt = new Date();
  const activeSeconds = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));
  const { error } = await supabase
    .from("learning_session")
    .update({
      ended_at: endedAt.toISOString(),
      active_seconds: activeSeconds,
      was_interrupted: interrupted,
      details,
    })
    .eq("id", sessionId);
  if (error) throw error;
}
