import { supabase } from "@/integrations/supabase/client";

export interface MasteryRow {
  topic_id: string;
  richtig: number;
  falsch: number;
}

export async function fetchTopicMastery(): Promise<MasteryRow[]> {
  const { data, error } = await supabase
    .from("topic_mastery")
    .select("topic_id, richtig, falsch");
  if (error) throw error;
  return data ?? [];
}

/** Zählt richtig/falsch für ein Thema des eingeloggten Nutzers hoch. */
export async function recordTopicResult(
  topicId: string,
  correct: boolean,
): Promise<MasteryRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Nicht angemeldet.");

  const { data: existing, error: readError } = await supabase
    .from("topic_mastery")
    .select("richtig, falsch")
    .eq("user_id", userId)
    .eq("topic_id", topicId)
    .maybeSingle();
  if (readError) throw readError;

  const richtig = (existing?.richtig ?? 0) + (correct ? 1 : 0);
  const falsch = (existing?.falsch ?? 0) + (correct ? 0 : 1);

  const { data, error } = await supabase
    .from("topic_mastery")
    .upsert(
      {
        user_id: userId,
        topic_id: topicId,
        richtig,
        falsch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,topic_id" },
    )
    .select("topic_id, richtig, falsch")
    .single();
  if (error) throw error;
  return data;
}
