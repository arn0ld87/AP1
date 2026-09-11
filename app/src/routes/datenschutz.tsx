import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/datenschutz")({
  head: () => ({
    meta: [
      { title: "Datenschutzerklärung – AP1 Trainer" },
      {
        name: "description",
        content: "Datenschutzerklärung für den AP1 Trainer (pruefung.alexle135.de).",
      },
    ],
  }),
  component: DatenschutzPage,
});

function DatenschutzPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 text-foreground">
      <Link
        to="/auth"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Zurück
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Datenschutzerklärung</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground">1. Verantwortlicher</h2>
          <p className="mt-2">
            Alexander Schneider, Georg-Schumann-Straße 148, 04159 Leipzig, kontakt@alexle135.de
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">
            2. Registrierung und Kontodaten
          </h2>
          <p className="mt-2">
            Für die Nutzung des AP1 Trainers ist ein Konto erforderlich. Bei der Registrierung
            verarbeiten wir deine E-Mail-Adresse und ein verschlüsseltes Passwort (Art. 6 Abs. 1
            lit. b DSGVO). Die Speicherung und Authentifizierung erfolgt über eine selbst gehostete
            Supabase-Instanz (PostgreSQL und GoTrue) auf einem Server in Deutschland. Die
            Registrierung erfordert die Bestätigung deiner E-Mail-Adresse; die Bestätigungs- E-Mail
            wird über den SMTP-Dienst von Fastmail versendet.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">3. Lern- und Prüfungsdaten</h2>
          <p className="mt-2">
            Deine Lernfortschritte, Übungsergebnisse, Probeprüfungsversuche, Fehlerlisteneinträge
            und die von dir eingegebenen Antworttexte werden in der Supabase-Datenbank gespeichert
            und sind ausschließlich deinem Konto zugeordnet (Row Level Security).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">4. KI-Bewertung</h2>
          <p className="mt-2">
            Optionale KI-Bewertungen von Prüfungsaufgaben übertragen deine eingegebenen Antworttexte
            sowie die jeweilige Aufgabenstellung an Anthropic Claude über Amazon Bedrock in der
            Region eu-central-1 (Frankfurt, EU). Die Inhalte werden zur Erzeugung der Bewertung
            verarbeitet und nicht zum Training der Modelle verwendet. Rechtsgrundlage ist Art. 6
            Abs. 1 lit. b DSGVO; die KI-Bewertung ist freiwillig und kann durch Selbst-Einschätzung
            ersetzt werden.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">5. Cookies und Speicher</h2>
          <p className="mt-2">
            Die Anwendung nutzt technisch notwendige Session-Cookies bzw. den Browser-Speicher, um
            dich angemeldet zu halten. Es findet kein Tracking und keine Werbeanalyse statt.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">6. Speicherdauer</h2>
          <p className="mt-2">
            Deine Daten werden gespeichert, solange dein Konto besteht. Du kannst dein Konto samt
            aller zugehörigen Daten jederzeit selbst über die Funktion „Konto löschen" in der
            Seitenleiste löschen. Alternativ genügt eine E-Mail an kontakt@alexle135.de.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground">7. Deine Rechte</h2>
          <p className="mt-2">
            Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art.
            17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und
            Widerspruch (Art. 21). Zudem kannst du dich bei der zuständigen Aufsichtsbehörde
            (Sächsische Datenschutz- und Informationsfreiheitsbeauftragte) beschweren.
          </p>
        </section>
      </div>
    </div>
  );
}
