import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/impressum")({
  head: () => ({
    meta: [
      { title: "Impressum – AP1 Trainer" },
      { name: "description", content: "Impressum und Anbieterkennzeichnung für den AP1 Trainer." },
    ],
  }),
  component: ImpressumPage,
});

function ImpressumPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 text-foreground">
      <Link
        to="/auth"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Zurück
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Impressum</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">Angaben gemäß § 5 DDG</h2>
          <p className="mt-2">
            Alexander Schneider
            <br />
            Georg-Schumann-Straße 148
            <br />
            04159 Leipzig
            <br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Kontakt</h2>
          <p className="mt-2">
            E-Mail:{" "}
            <a href="mailto:kontakt@alexle135.de" className="text-primary hover:underline">
              kontakt@alexle135.de
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-2">
            Alexander Schneider
            <br />
            Georg-Schumann-Straße 148
            <br />
            04159 Leipzig
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">Haftung für Inhalte</h2>
          <p className="mt-2">
            Die Inhalte dieser Seiten wurden mit großer Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
            Die Lerninhalte dienen der Prüfungsvorbereitung und ersetzen keine offiziellen
            IHK-Materialien.
          </p>
        </section>
      </div>
    </div>
  );
}
