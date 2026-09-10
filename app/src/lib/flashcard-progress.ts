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

/**
 * Zählt richtig/falsch für eine Karte atomar hoch — das Inkrement passiert
 * in der DB (RPC increment_flashcard_progress), nicht client-seitig, damit
 * parallele Bewertungen (zwei Tabs) keine Zähler verlieren.
 */
export async function recordCardResult(cardId: string, correct: boolean): Promise<void> {
  const { error } = await supabase.rpc("increment_flashcard_progress", {
    p_card_id: cardId,
    p_correct: correct,
  });
  if (error) throw error;
}
