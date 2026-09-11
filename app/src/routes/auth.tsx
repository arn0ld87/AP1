import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, MailCheck } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Anmelden – AP1 Trainer" },
      {
        name: "description",
        content: "Melde dich an oder registriere dich für deinen AP1-Lernbereich.",
      },
      { property: "og:title", content: "Anmelden – AP1 Trainer" },
      {
        property: "og:description",
        content: "Melde dich an oder registriere dich für deinen AP1-Lernbereich.",
      },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "login") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError("E-Mail oder Passwort ist nicht korrekt.");
        setLoading(false);
        return;
      }
      navigate({ to: "/", replace: true });
      return;
    }

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen haben.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth",
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already") || signUpError.message.includes("registriert")
          ? "Für diese E-Mail-Adresse existiert bereits ein Konto. Melde dich einfach an."
          : "Registrierung fehlgeschlagen. Bitte versuche es erneut.",
      );
      setLoading(false);
      return;
    }

    // MAILER_AUTOCONFIRM=false → session ist null, Bestätigungsmail ist unterwegs.
    if (!data.session) {
      setConfirmationSent(true);
      setLoading(false);
      return;
    }
    navigate({ to: "/", replace: true });
  }

  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            AP1
          </div>
          <span className="font-semibold tracking-tight text-foreground">Trainer</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {confirmationSent ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MailCheck className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
                E-Mail bestätigen
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Wir haben dir einen Bestätigungslink an{" "}
                <span className="font-medium text-foreground">{email.trim()}</span> geschickt.
                Klicke auf den Link in der E-Mail, um dein Konto zu aktivieren. Prüfe auch den
                Spam-Ordner.
              </p>
              <button
                type="button"
                onClick={() => {
                  setConfirmationSent(false);
                  setMode("login");
                }}
                className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Zurück zur Anmeldung
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">
                {isLogin ? "Anmelden" : "Registrieren"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {isLogin
                  ? "Melde dich mit deiner E-Mail-Adresse und deinem Passwort an."
                  : "Lege dein kostenloses Konto an und starte deine AP1-Vorbereitung."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isLogin}
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                    (isLogin
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  Anmelden
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isLogin}
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className={
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors " +
                    (!isLogin
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  Registrieren
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    E-Mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder="du@beispiel.de"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Passwort
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    minLength={isLogin ? undefined : 8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder={isLogin ? "••••••••" : "mindestens 8 Zeichen"}
                  />
                </div>

                {error && (
                  <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLogin ? "Anmelden" : "Konto erstellen"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Mit der Registrierung akzeptierst du die{" "}
          <Link to="/datenschutz" className="underline hover:text-foreground">
            Datenschutzerklärung
          </Link>{" "}
          und das{" "}
          <Link to="/impressum" className="underline hover:text-foreground">
            Impressum
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
