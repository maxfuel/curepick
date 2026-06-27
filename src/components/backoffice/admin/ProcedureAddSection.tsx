"use client";

import { useState, useTransition } from "react";
import { upsertHospitalProcedure } from "@/lib/actions/admin-hospitals";

interface Procedure {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  procedures: Procedure[];
}

interface Category {
  id: string;
  name: string;
  services: Service[];
}

interface Props {
  hospitalId: string;
  categories: Category[];
  assignedProcedureIds: string[];
}

export function ProcedureAddSection({ hospitalId, categories, assignedProcedureIds }: Props) {
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const assignedSet = new Set(assignedProcedureIds);
  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProcedure) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await upsertHospitalProcedure(formData);
      setSelectedProcedure(null);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 3000);
    });
  }

  /* ── Price form (procedure selected) ──────────────────────────── */
  if (selectedProcedure) {
    return (
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{selectedProcedure.name}</span>
          <button
            type="button"
            onClick={() => setSelectedProcedure(null)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            다시 선택
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="hospital_id" value={hospitalId} />
          <input type="hidden" name="procedure_id" value={selectedProcedure.id} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">최소 가격</label>
              <input
                name="cost_min"
                type="number"
                min={0}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">최대 가격</label>
              <input
                name="cost_max"
                type="number"
                min={0}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">통화</label>
              <input
                name="cost_currency"
                defaultValue="USD"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">연간 건수</label>
              <input
                name="annual_volume"
                type="number"
                min={0}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? "추가 중..." : "추가"}
          </button>
        </form>
      </div>
    );
  }

  /* ── Mega menu (browse state) ──────────────────────────────────── */
  return (
    <div className="rounded-lg border overflow-hidden">
      {justAdded && (
        <div className="px-4 py-2 bg-green-50 border-b text-sm font-medium text-green-700">
          ✓ 추가완료
        </div>
      )}
      <div className="flex min-h-[320px]">
        {/* Category sidebar */}
        <div className="w-36 shrink-0 border-r bg-muted/30">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                activeCategoryId === cat.id
                  ? "bg-background font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Services / procedures panel */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeCategory && activeCategory.services.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {activeCategory.services.map((svc) => (
                <div key={svc.id}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {svc.name}
                  </p>
                  <ul className="space-y-0.5">
                    {svc.procedures.map((proc) => {
                      const isAssigned = assignedSet.has(proc.id);
                      return (
                        <li key={proc.id}>
                          <button
                            type="button"
                            disabled={isAssigned}
                            onClick={() => setSelectedProcedure(proc)}
                            className={`w-full text-left text-sm px-2 py-1 rounded transition-colors ${
                              isAssigned
                                ? "text-muted-foreground cursor-not-allowed"
                                : "text-foreground hover:bg-muted"
                            }`}
                          >
                            {proc.name}
                            {isAssigned && (
                              <span className="ml-1 text-xs opacity-60">(추가됨)</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              이 카테고리에 시술이 없습니다.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
