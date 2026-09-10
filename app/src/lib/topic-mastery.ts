import { supabase } from "@/integrations/supabase/client";

export interface MasteryRow {
  topic_id: string;
  richtig: number;
  falsch: number;
}

export async function fetchTopicMastery(): Promise<MasteryRow[]> {
  const { data, error } = await supabase.from("topic_mastery").select("topic_id, richtig, falsch");
  if (error) throw error;
  return data ?? [];
}

/**
 * Zählt richtig/falsch für ein Thema atomar hoch — das Inkrement passiert
 * in der DB (RPC increment_topic_mastery), nicht client-seitig, damit
 * parallele Absenden (zwei Tabs) keine Zähler verlieren.
 */
export async function recordTopicResult(topicId: string, correct: boolean): Promise<void> {
  const { error } = await supabase.rpc("increment_topic_mastery", {
    p_topic_id: topicId,
    p_correct: correct,
  });
  if (error) throw error;
}
