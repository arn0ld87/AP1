import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { ClipboardCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/probepruefungen")({
  head: () => ({
    meta: [
      { title: "Probeprüfungen – AP1 Trainer" },
      {
        name: "description",
        content: "Simuliere die IHK AP1 Prüfung mit zeitbegrenzten Probeprüfungen.",
      },
      { property: "og:title", content: "Probeprüfungen – AP1 Trainer" },
      {
        property: "og:description",
        content: "Simuliere die IHK AP1 Prüfung mit zeitbegrenzten Probeprüfungen.",
      },
    ],
  }),
  component: ProbepruefungenPage,
});

function ProbepruefungenPage() {
  return (
    <PlaceholderPage
      title="Probeprüfungen"
      description="Hier entsteht ein Modul für zeitbegrenzte Probeprüfungen, die dir das Gefühl der echten AP1 vermitteln."
      icon={ClipboardCheck}
    />
  );
}
