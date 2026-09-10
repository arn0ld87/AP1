import { type LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-2xl pt-8 md:pt-12">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary md:mb-6">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">{title}</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">{description}</p>
        <div className="mt-6 inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground">
          Wird als Nächstes gebaut.
        </div>
      </div>
    </div>
  );
}
