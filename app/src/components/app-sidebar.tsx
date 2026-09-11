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
  LogOut,
  Sigma,
} from "lucide-react";

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

/**
 * Desktop-Sidebar. Unter `md` ausgeblendet — dort übernimmt der Drawer in
 * `AppLayout` (siehe SidebarNav), damit auf schmalen Geräten die volle
 * Breite für den Inhalt bleibt.
 */
export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-out md:flex",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-5">
        <SidebarLogo />
        {!collapsed && (
          <span className="truncate font-semibold tracking-tight text-sidebar-foreground">
            Trainer
          </span>
        )}
      </div>
      <SidebarNav collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}

export function SidebarLogo() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
      AP1
    </div>
  );
}

/**
 * Navigation samt Abmelden/Einklappen — geteilt von Desktop-Sidebar und
 * mobilem Drawer. Im Drawer ist nichts eingeklappt und der
 * Einklappen-Schalter entfällt; `onNavigate` schließt ihn nach dem Klick.
 */
export function SidebarNav({
  collapsed = false,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
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
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = currentPath === item.url;
            return (
              <li key={item.url}>
                <Link
                  to={item.url}
                  title={collapsed ? item.title : undefined}
                  onClick={onNavigate}
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
        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? "Abmelden" : undefined}
          className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Abmelden</span>}
        </button>
        {onToggle && (
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
        )}
      </div>
    </>
  );
}
