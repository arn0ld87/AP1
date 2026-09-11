import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Calculator,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Loader2,
  LogOut,
  Sigma,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Rechnen üben", url: "/rechnen", icon: Calculator },
  { title: "Wissenskarten", url: "/wissenskarten", icon: BookOpen },
  { title: "Lernblätter", url: "/lernblaetter", icon: FileText },
  { title: "Formelsammlung", url: "/formelsammlung", icon: Sigma },
  { title: "Tagesplan", url: "/tagesplan", icon: Calendar },
  { title: "Probeprüfungen", url: "/probepruefungen", icon: ClipboardCheck },
  { title: "Fortschritt & Fehlerliste", url: "/fortschritt", icon: BarChart2 },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          AP1
        </div>
        {!collapsed && (
          <span className="truncate font-semibold tracking-tight text-sidebar-foreground">
            Trainer
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = currentPath === item.url;
            return (
              <li key={item.url}>
                <Link
                  to={item.url}
                  title={collapsed ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-out",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-sidebar-border p-3">
        <AccountDeletion collapsed={collapsed} onDeleted={handleSignOut} />
        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? "Abmelden" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Abmelden</span>}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="truncate">Einklappen</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

/**
 * Self-Service-Kontolöschung (DSGVO Art. 17): Zweimal bestätigen, dann
 * ruft die Edge Function delete-account den GoTrue-Admin-Delete auf.
 * Alle Fachdaten räumt die DB per FK-Cascade mit ab. Nach Erfolg meldet
 * onDeleted den Nutzer ab und zurück zur Anmeldeseite.
 */
function AccountDeletion({ collapsed, onDeleted }: { collapsed: boolean; onDeleted: () => void }) {
  const [armed, setArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const disarmTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (disarmTimer.current !== null) window.clearTimeout(disarmTimer.current);
    };
  }, []);

  async function handleDelete() {
    if (!armed) {
      setArmed(true);
      setError(null);
      disarmTimer.current = window.setTimeout(() => setArmed(false), 5000);
      return;
    }
    if (disarmTimer.current !== null) window.clearTimeout(disarmTimer.current);
    setDeleting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const jwt = session.session?.access_token;
      const res = await fetch(
        (import.meta.env as Record<string, string>)["VITE_SUPABASE_URL"] +
          "/functions/v1/delete-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(jwt ? { Authorization: "Bearer " + jwt } : {}),
          },
          body: "{}",
        },
      );
      if (!res.ok) {
        throw new Error("delete-account: HTTP " + res.status);
      }
      onDeleted();
    } catch {
      setError("Konto konnte nicht gelöscht werden. Bitte versuche es erneut.");
      setArmed(false);
      setDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        title={
          collapsed
            ? armed
              ? "Erneut klicken, um das Konto endgültig zu löschen"
              : "Konto löschen"
            : undefined
        }
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent",
          armed ? "text-destructive" : "text-sidebar-foreground",
        )}
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 shrink-0" />
        )}
        {!collapsed && (
          <span className="truncate">{armed ? "Endgültig löschen?" : "Konto löschen"}</span>
        )}
      </button>
      {!collapsed && armed && !deleting && (
        <p className="px-3 pb-1 text-xs leading-snug text-muted-foreground">
          Konto und alle Daten werden endgültig entfernt. Nochmals klicken zum Bestätigen.
        </p>
      )}
      {!collapsed && error && (
        <p className="px-3 pb-1 text-xs leading-snug text-destructive">{error}</p>
      )}
    </div>
  );
}
