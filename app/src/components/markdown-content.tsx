import { useMemo } from "react";

import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

/**
 * Rendert Markdown aus der DB (Fragen, Intros, Musterlösungen) als HTML.
 * `renderMarkdown` escaped den Quelltext vollständig, bevor es eigene Tags
 * setzt — Roh-HTML aus den Daten kann also nicht ausgeführt werden.
 */
export function MarkdownContent({ src, className }: { src: string | null; className?: string }) {
  const html = useMemo(() => renderMarkdown(src ?? ""), [src]);
  return (
    <div
      className={cn(
        // erste/letzte Blockränder kappen, damit der Container die Abstände bestimmt
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
