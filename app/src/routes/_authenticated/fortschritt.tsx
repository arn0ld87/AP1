import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { BarChart2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/fortschritt")({
  head: () => ({
    meta: [
      { title: "Fortschritt & Fehlerliste – AP1 Trainer" },
      {
        name: "description",
        content: "Behalte deinen Lernfortschritt und deine wiederkehrenden Fehler im Blick.",
      },
      {
        property: "og:title",
        content: "Fortschritt & Fehlerliste – AP1 Trainer",
      },
      {
        property: "og:description",
        content: "Behalte deinen Lernfortschritt und deine wiederkehrenden Fehler im Blick.",
      },
    ],
  }),
  component: FortschrittPage,
});

function FortschrittPage() {
  return (
    <PlaceholderPage
      title="Fortschritt & Fehlerliste"
      description="Hier entsteht dein persönliches Dashboard mit Statistiken, Streaks und einer Fehlerliste, die dich an wiederkehrende Schwächen erinnert."
      icon={BarChart2}
    />
  );
}
