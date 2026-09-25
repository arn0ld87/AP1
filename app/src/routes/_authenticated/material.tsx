import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, FileStack, Headphones, Image as ImageIcon, Sparkles } from "lucide-react";

import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";

import leitfadenMarkdown from "@/data/notebooklm/leitfaden-ganzheitliche-it-systeme.md?raw";
import pruefungsanalyseMarkdown from "@/data/notebooklm/pruefungsanalyse-bericht.md?raw";

export const Route = createFileRoute("/_authenticated/material")({
  head: () => ({
    meta: [
      { title: "Material – AP1 Trainer" },
      {
        name: "description",
        content: "NotebookLM-Berichte, Infografik und Tactical Dossier zu den AP1-Altprüfungen.",
      },
      { property: "og:title", content: "Material – AP1 Trainer" },
    ],
  }),
  component: MaterialPage,
});

type TabKey = "leitfaden" | "pruefungsanalyse" | "spickzettel" | "dossier" | "audio-video";

const TABS: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: "leitfaden", label: "Leitfaden: Ganzheitliche IT-Systeme", icon: BookOpen },
  { key: "pruefungsanalyse", label: "Prüfungsanalyse-Bericht", icon: Sparkles },
  { key: "spickzettel", label: "Spickzettel (Infografik)", icon: ImageIcon },
  { key: "dossier", label: "Tactical Dossier", icon: FileStack },
  { key: "audio-video", label: "Audio & Video", icon: Headphones },
];

const DOSSIER_SLIDE_COUNT = 15;

function MaterialPage() {
  const [tab, setTab] = useState<TabKey>("leitfaden");

  return (
    <div className="mx-auto max-w-5xl space-y-6 pt-4 md:pt-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Material</h1>
        <p className="text-sm text-muted-foreground">
          Zusatzmaterial zu den Altprüfungen, mit NotebookLM aus den Prüfungssätzen erstellt.
        </p>
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          Von KI (NotebookLM) aus Altprüfungen generiert — Inhalte stichprobenartig prüfen.
        </p>
      </header>

      <nav
        aria-label="Materialabschnitte"
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            aria-current={tab === key ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
              tab === key
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {tab === "leitfaden" && <MarkdownSection markdown={leitfadenMarkdown} />}
      {tab === "pruefungsanalyse" && <MarkdownSection markdown={pruefungsanalyseMarkdown} />}
      {tab === "spickzettel" && <SpickzettelSection />}
      {tab === "dossier" && <DossierSection />}
      {tab === "audio-video" && <AudioVideoSection />}
    </div>
  );
}

function MarkdownSection({ markdown }: { markdown: string }) {
  return (
    <section
      className="rounded-xl border border-border bg-card p-4 md:p-6 [&_pre]:bg-muted/60 [&_table]:text-xs"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}

function SpickzettelSection() {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 md:p-6">
      <p className="text-sm text-muted-foreground">
        IHK-Prüfungsspickzettel für die FISI-Ausbildung — zum Vergrößern anklicken (öffnet im neuen
        Tab).
      </p>
      <a href="/notebooklm/spickzettel.webp" target="_blank" rel="noreferrer">
        <img
          src="/notebooklm/spickzettel.webp"
          alt="IHK-Prüfungsspickzettel für die FISI-Ausbildung — Infografik mit den wichtigsten Prüfungsthemen"
          className="w-full rounded-lg border border-border"
        />
      </a>
    </section>
  );
}

/**
 * LibreOffice/soffice steht nicht zur Verfügung, das pptx enthält außerdem keinen
 * einzigen Textlauf — alle 15 Folien sind reine Bildgrafiken (siehe
 * ppt/slides/slideN.xml: nur <p:pic>, kein <a:t>). Der in der Spec vorgesehene
 * Text-Fallback liefert deshalb nichts Sinnvolles; stattdessen werden die im
 * pptx eingebetteten Folienbilder als komprimierte WebP-Galerie gezeigt.
 */
function DossierSection() {
  const slides = Array.from({ length: DOSSIER_SLIDE_COUNT }, (_, i) => i + 1);
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4 md:p-6">
      <p className="text-sm text-muted-foreground">
        AP1 Tactical Dossier — {DOSSIER_SLIDE_COUNT} Folien als Bildgalerie (das Original ist eine
        20&nbsp;MB-Präsentation ohne eingebetteten Text). Folie zum Vergrößern anklicken.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {slides.map((n) => {
          const src = `/notebooklm/dossier-slide-${String(n).padStart(2, "0")}.webp`;
          return (
            <a key={n} href={src} target="_blank" rel="noreferrer">
              <img
                src={src}
                alt={`AP1 Tactical Dossier — Folie ${n} von ${DOSSIER_SLIDE_COUNT}`}
                className="w-full rounded-lg border border-border"
                loading="lazy"
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}

function AudioVideoSection() {
  return (
    <section className="space-y-6 rounded-xl border border-border bg-card p-4 md:p-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Netzwerktechnik, Storage und Sicherheit zur AP1
        </h2>
        <p className="text-xs text-muted-foreground">
          Podcast-artige Audio-Zusammenfassung · ca. 26 Minuten
        </p>
        <audio
          controls
          preload="none"
          className="w-full max-w-xl"
          src="/notebooklm/audio-netzwerk-storage-sicherheit.m4a"
        >
          Ihr Browser unterstützt die Audiowiedergabe nicht.
        </audio>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Kompakt: FISI-Prüfung</h2>
        <p className="text-xs text-muted-foreground">Erklärvideo · ca. 10 Minuten</p>
        <video
          controls
          preload="none"
          playsInline
          className="aspect-video w-full max-w-xl rounded-lg border border-border bg-black"
          src="/notebooklm/video-kompakt-fisi-pruefung.mp4"
        >
          Ihr Browser unterstützt die Videowiedergabe nicht.
        </video>
      </div>
    </section>
  );
}
