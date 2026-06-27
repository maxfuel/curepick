"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

interface Procedure {
  id: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  slug: string;
  name: string;
  procedures: Procedure[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
  intentId: string | null;
  services: Service[];
}

interface Intent {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  intents: Intent[];
  viewAllLabel: string;
}

export function CategoriesMegaMenu({ categories, intents, viewAllLabel }: Props) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? "");

  const active = categories.find((c) => c.id === activeId);

  const intentGroups = intents
    .map((intent) => ({
      ...intent,
      cats: categories.filter((c) => c.intentId === intent.id),
    }))
    .filter((g) => g.cats.length > 0);

  const ungrouped = categories.filter((c) => !c.intentId);

  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm">
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 480 }}>

        {/* ── Mobile: horizontal scroll tabs ────────────── */}
        <div className="lg:hidden flex gap-2 overflow-x-auto p-3 border-b bg-muted/30 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveId(cat.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeId === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background hover:bg-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ── Desktop: vertical sidebar ──────────────────── */}
        <nav className="hidden lg:block w-52 shrink-0 border-r bg-muted/20 overflow-y-auto">
          <div className="py-2">
            {intentGroups.map((group) => (
              <div key={group.id}>
                <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.name}
                </p>
                {group.cats.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveId(cat.id)}
                    className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                      activeId === cat.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="flex-1 truncate">{cat.name}</span>
                    {activeId === cat.id && <ChevronRight className="size-3.5 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            ))}

            {ungrouped.length > 0 && (
              <div>
                {ungrouped.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveId(cat.id)}
                    className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                      activeId === cat.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="flex-1 truncate">{cat.name}</span>
                    {activeId === cat.id && <ChevronRight className="size-3.5 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── Right panel: services + procedures ─────────── */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {active && (
            <>
              <div className="flex items-center justify-between mb-6 gap-4">
                <h2 className="text-base font-semibold">{active.name}</h2>
                <Link
                  href={`/categories/${active.slug}`}
                  className="shrink-0 text-sm text-primary hover:underline"
                >
                  {viewAllLabel} →
                </Link>
              </div>

              {active.services.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-3 xl:grid-cols-4">
                  {active.services.map((svc) => (
                    <div key={svc.id}>
                      <Link
                        href={`/services/${svc.slug}`}
                        className="block text-sm font-semibold mb-2 hover:text-primary hover:underline"
                      >
                        {svc.name}
                      </Link>
                      {svc.procedures.length > 0 && (
                        <ul className="space-y-1.5">
                          {svc.procedures.map((proc) => (
                            <li key={proc.id}>
                              <Link
                                href={`/services/${svc.slug}`}
                                className="block text-xs text-muted-foreground hover:text-foreground leading-snug"
                              >
                                {proc.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
