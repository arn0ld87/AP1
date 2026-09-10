import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { Home } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Startseite – AP1 Trainer" },
      {
        name: "description",
        content:
          "Willkommen beim AP1 Trainer. Bereite dich gezielt auf die IHK-Abschlussprüfung Teil 1 vor.",
      },
      { property: "og:title", content: "Startseite – AP1 Trainer" },
      {
        property: "og:description",
        content:
          "Willkommen beim AP1 Trainer. Bereite dich gezielt auf die IHK-Abschlussprüfung Teil 1 vor.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <PlaceholderPage
      title="Willkommen beim AP1 Trainer"
      description="Dein persönlicher Lernbereich für die IHK-Abschlussprüfung Teil 1 (Fachinformatiker Systemintegration). Wähle einen Bereich in der Sidebar, um zu starten."
      icon={Home}
    />
  );
}
