import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lernblaetter")({
  head: () => ({
    meta: [
      { title: "Lernblätter – AP1 Trainer" },
      {
        name: "description",
        content: "Arbeite gezielt mit Lernblättern zu den AP1-Themenbereichen.",
      },
      { property: "og:title", content: "Lernblätter – AP1 Trainer" },
      {
        property: "og:description",
        content: "Arbeite gezielt mit Lernblättern zu den AP1-Themenbereichen.",
      },
    ],
  }),
  component: LernblaetterPage,
});

function LernblaetterPage() {
  return (
    <PlaceholderPage
      title="Lernblätter"
      description="Hier entstehen thematische Lernblätter, mit denen du die AP1-Inhalte Schritt für Schritt durcharbeiten kannst."
      icon={FileText}
    />
  );
}
