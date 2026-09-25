import { Info } from "lucide-react";

/**
 * Dezenter Hinweis für Inhalte, die NotebookLM aus den Altprüfungen generiert
 * hat (Quiz, Mindmap) — im Unterschied zu den kuratierten Lernblättern/Karten
 * ungeprüft, daher der Stichproben-Hinweis.
 */
export function AiGeneratedNotice() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Info className="size-3.5 shrink-0" />
      Von KI (NotebookLM) aus Altprüfungen generiert — Inhalte stichprobenartig prüfen.
    </p>
  );
}
