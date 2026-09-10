import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wissenskarten")({
  head: () => ({
    meta: [
      { title: "Wissenskarten – AP1 Trainer" },
      {
        name: "description",
        content:
          "Lerne mit digitalen Karteikarten die wichtigsten Begriffe für die AP1.",
      },
      { property: "og:title", content: "Wissenskarten – AP1 Trainer" },
      {
        property: "og:description",
        content:
          "Lerne mit digitalen Karteikarten die wichtigsten Begriffe für die AP1.",
      },
    ],
  }),
  component: WissenskartenPage,
});

function WissenskartenPage() {
  return (
    <PlaceholderPage
      title="Wissenskarten"
      description="Hier entsteht ein Karteikarten-Modul mit den zentralen Fachbegriffen für die IHK-Abschlussprüfung Teil 1."
      icon={BookOpen}
    />
  );
}
