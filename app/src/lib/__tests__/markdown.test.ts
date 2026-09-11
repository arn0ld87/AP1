import { describe, expect, it } from "vitest";

import { renderMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("rendert Markdown-Tabellen als <table> statt als Pipe-Syntax", () => {
    const html = renderMarkdown(
      ["| Vorgang | Dauer |", "|---|---:|", "| A | 3 |", "| B | 4 |"].join("\n"),
    );

    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("Vorgang");
    // Keine rohe Pipe-Syntax mehr im Ergebnis
    expect(html).not.toMatch(/\|\s*Vorgang/);
  });

  it("übernimmt die Spaltenausrichtung aus der Trennzeile", () => {
    const html = renderMarkdown(["| Text | Zahl |", "|:---|---:|", "| A | 3 |"].join("\n"));

    expect(html).toContain("text-right");
    expect(html).toContain("text-left");
  });

  it("legt breite Tabellen in einen horizontalen Scroll-Container", () => {
    const html = renderMarkdown(["| A | B |", "|---|---|", "| 1 | 2 |"].join("\n"));

    expect(html).toContain("overflow-x-auto");
  });

  it("escaped HTML aus dem Quelltext", () => {
    const html = renderMarkdown("| A |\n|---|\n| <script>alert(1)</script> |");

    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("rendert Codeblöcke, Listen und Fettschrift weiterhin", () => {
    expect(renderMarkdown("```\nFUNKTION f()\n```")).toContain("<pre");
    expect(renderMarkdown("- eins\n- zwei")).toContain("<ul");
    expect(renderMarkdown("**fett**")).toContain("<b>fett</b>");
  });
});
