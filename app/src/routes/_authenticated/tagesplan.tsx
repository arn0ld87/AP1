import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { Calendar } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tagesplan")({
  head: () => ({
    meta: [
      { title: "Tagesplan – AP1 Trainer" },
      {
        name: "description",
        content:
          "Plane dein tägliches Lernpensum für die AP1-Vorbereitung.",
      },
      { property: "og:title", content: "Tagesplan – AP1 Trainer" },
      {
        property: "og:description",
        content:
          "Plane dein tägliches Lernpensum für die AP1-Vorbereitung.",
      },
    ],
  }),
  component: TagesplanPage,
});

function TagesplanPage() {
  return (
    <PlaceholderPage
      title="Tagesplan"
      description="Hier entsteht ein Tagesplaner, der dir vorschlägt, welche Lerneinheiten du heute bearbeiten solltest."
      icon={Calendar}
    />
  );
}
