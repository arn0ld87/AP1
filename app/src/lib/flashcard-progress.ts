import { supabase } from "@/integrations/supabase/client";

export interface FlashcardRow {
  card_id: string;
  richtig: number;
  falsch: number;
}

export async function fetchFlashcardProgress(): Promise<FlashcardRow[]> {
  const { data, error } = await supabase
    .from("flashcard_progress")
    .select("card_id, richtig, falsch");
  if (error) throw error;
  return data ?? [];
}

/** Zählt richtig/falsch für eine Karte des eingeloggten Nutzers hoch. */
export async function recordCardResult(
  cardId: string,
  correct: boolean,
): Promise<FlashcardRow> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Nicht angemeldet.");

  const { data: existing, error: readError } = await supabase
    .from("flashcard_progress")
    .select("richtig, falsch")
    .eq("user_id", userId)
    .eq("card_id", cardId)
    .maybeSingle();
  if (readError) throw readError;

  const richtig = (existing?.richtig ?? 0) + (correct ? 1 : 0);
  const falsch = (existing?.falsch ?? 0) + (correct ? 0 : 1);

  const { data, error } = await supabase
    .from("flashcard_progress")
    .upsert(
      {
        user_id: userId,
        card_id: cardId,
        richtig,
        falsch,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,card_id" },
    )
    .select("card_id, richtig, falsch")
    .single();
  if (error) throw error;
  return data;
}
