import { useState, type ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
