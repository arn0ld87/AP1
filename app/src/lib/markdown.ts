/**
 * Minimaler, sicherer Markdown→HTML-Renderer für die Lernblätter.
 * Unterstützt genau die Konstrukte aus data/migration/*.json:
 * - **bold**, *italic*, `inline code`
 * - fenced Code-Blöcke (```), Blockquotes (>)
 * - Listen (- und 1.)
 * - Absätze und Zeilenumbrüche
 * Erzeugt ausschließlich Escaped-HTML: Quelltext wird vor dem Einfügen
 * von HTML-Tags befreit, damit kein Roh-HTML injiziert werden kann.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,;:!?]|$)/g, "$1<i>$2</i>");
}

export function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // horizontal rule
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push(`<hr class="my-4 border-border" />`);
      i++;
      continue;
    }

    // fenced code block
    if (line.trim().startsWith("```")) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++; // closing fence
      out.push(
        `<pre class="my-3 overflow-x-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground">${escapeHtml(body.join("\n"))}</pre>`,
      );
      continue;
    }

    // blockquote
    if (line.trim().startsWith(">")) {
      const body: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        body.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push(
        `<blockquote class="my-3 border-l-2 border-primary/50 pl-3 text-sm italic text-muted-foreground">${inline(body.join(" "))}</blockquote>`,
      );
      continue;
    }

    // table (| … |)
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows: string[][] = [];
      let headerDone = false;
      const header: string[] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        const cells = lines[i]
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());
        // separator row (---|:---)
        if (cells.every((c) => /^:?-{2,}:?$/.test(c.trim()) || c.trim() === "")) {
          headerDone = true;
          i++;
          continue;
        }
        if (!headerDone) {
          header.push(...cells);
        } else {
          rows.push(cells);
        }
        i++;
      }
      if (header.length) {
        out.push(
          `<table class="my-3 w-full border-collapse text-sm"><thead><tr>${header
            .map(
              (h) =>
                `<th class="border border-border bg-muted/40 px-2 py-1.5 text-left font-semibold text-foreground">${inline(h)}</th>`,
            )
            .join("")}</tr></thead><tbody>${rows
            .map(
              (r) =>
                `<tr>${r
                  .map(
                    (c) =>
                      `<td class="border border-border px-2 py-1.5 text-card-foreground">${inline(c)}</td>`,
                  )
                  .join("")}</tr>`,
            )
            .join("")}</tbody></table>`,
        );
      }
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      out.push(
        `<ul class="my-2 list-disc space-y-1 pl-5 text-sm text-card-foreground">${items
          .map((it) => `<li>${inline(it)}</li>`)
          .join("")}</ul>`,
      );
      continue;
    }

    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      out.push(
        `<ol class="my-2 list-decimal space-y-1 pl-5 text-sm text-card-foreground">${items
          .map((it) => `<li>${inline(it)}</li>`)
          .join("")}</ol>`,
      );
      continue;
    }

    // blank line → paragraph break
    if (!line.trim()) {
      i++;
      continue;
    }

    // paragraph: consecutive non-empty, non-special lines
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*(-{3,}|\*{3,})\s*$/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^\s*\|.*\|\s*$/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    out.push(
      `<p class="my-2 text-sm leading-relaxed text-card-foreground">${inline(para.join("\n")).replace(/\n/g, "<br>")}</p>`,
    );
  }

  return out.join("");
}
