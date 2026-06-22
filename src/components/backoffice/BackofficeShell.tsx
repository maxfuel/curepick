import { type ReactNode } from "react";

export function BackofficeShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-60 shrink-0 border-r bg-muted/30">{sidebar}</aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
