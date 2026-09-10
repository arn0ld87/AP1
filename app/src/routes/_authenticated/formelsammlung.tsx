import { createFileRoute } from "@tanstack/react-router";

import { PlaceholderPage } from "@/components/placeholder-page";
import { Sigma } from "lucide-react";

export const Route = createFileRoute("/_authenticated/formelsammlung")({
  head: () => ({
    meta: [
      { title: "Formelsammlung – AP1 Trainer" },
      {
        name: "description",
        content: "Die wichtigsten Formeln für die IHK AP1 Prüfung auf einen Blick.",
      },
      { property: "og:title", content: "Formelsammlung – AP1 Trainer" },
      {
        property: "og:description",
        content: "Die wichtigsten Formeln für die IHK AP1 Prüfung auf einen Blick.",
      },
    ],
  }),
  component: FormelsammlungPage,
});

function FormelsammlungPage() {
  return (
    <PlaceholderPage
      title="Formelsammlung"
      description="Hier entsteht eine durchsuchbare Sammlung der Formeln, die du für die AP1 brauchst."
      icon={Sigma}
    />
  );
}
