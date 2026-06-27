"use client";

import { SortableList } from "@/components/ui/SortableList";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteProcedure, reorderProcedures } from "@/lib/actions/admin-services";

interface Procedure {
  id: string;
  name: unknown;
  slug: string | null;
  sort_order: number | null;
}

function getEn(val: unknown): string {
  if (!val || typeof val !== "object" || Array.isArray(val)) return "";
  return ((val as Record<string, unknown>).en as string) || "";
}

interface Props {
  procedures: Procedure[];
  deleteLabel: string;
  noProceduresLabel: string;
}

export function ProceduresSortableTable({ procedures, deleteLabel, noProceduresLabel }: Props) {
  return (
    <table className="w-full text-sm table-fixed">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="w-8 px-2 py-2" />
          <th className="text-left px-4 py-2 font-medium">이름</th>
          <th className="text-left px-4 py-2 font-medium w-56">Slug</th>
          <th className="text-left px-4 py-2 font-medium w-16">순서</th>
          <th className="px-4 py-2 w-16" />
        </tr>
      </thead>
      <tbody>
        {procedures.length > 0 ? (
          <SortableList
            items={procedures}
            colSpan={4}
            onSave={reorderProcedures}
            renderCells={(proc, index) => (
              <>
                <td className="px-4 py-2">{getEn(proc.name)}</td>
                <td className="px-4 py-2 w-56 overflow-hidden">
                  <span
                    className="block truncate text-muted-foreground font-mono text-xs"
                    title={proc.slug ?? ""}
                  >
                    {proc.slug}
                  </span>
                </td>
                <td className="px-4 py-2 w-16 text-muted-foreground text-xs">{index + 1}</td>
                <td className="px-4 py-2 w-16">
                  <DeleteButton
                    action={deleteProcedure.bind(null, proc.id)}
                    label={deleteLabel}
                    className="text-destructive text-xs hover:underline"
                  />
                </td>
              </>
            )}
          />
        ) : (
          <tr>
            <td colSpan={5} className="px-4 py-3 text-muted-foreground text-xs">
              {noProceduresLabel}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
