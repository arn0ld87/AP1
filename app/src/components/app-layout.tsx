import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { AppSidebar, SidebarLogo, SidebarNav } from "./app-sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile-Kopfzeile: unter md ersetzt der Drawer die feste Sidebar. */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label="Navigation öffnen"
              className="flex size-9 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              // Kein Beschreibungstext nötig — verhindert die Radix-Warnung.
              aria-describedby={undefined}
              className="flex w-72 max-w-[85vw] flex-col border-sidebar-border bg-sidebar p-0"
            >
              <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-5">
                <SidebarLogo />
                <SheetTitle className="truncate text-base font-semibold tracking-tight text-sidebar-foreground">
                  AP1 Trainer
                </SheetTitle>
              </div>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <SidebarLogo />
          <span className="truncate font-semibold tracking-tight text-sidebar-foreground">
            Trainer
          </span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
