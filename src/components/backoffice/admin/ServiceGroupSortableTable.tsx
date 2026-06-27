"use client";

import { SortableList } from "@/components/ui/SortableList";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteService, reorderServices } from "@/lib/actions/admin-services";

interface Service {
  id: string;
  name: unknown;
  slug: string | null;
  sort_order: number | null;
  is_featured: boolean | null;
}

function getEn(val: unknown): string {
  if (!val || typeof val !== "object" || Array.isArray(val)) return "";
  return ((val as Record<string, unknown>).en as string) || "";
}

interface Props {
  services: Service[];
  locale: string;
  editLabel: string;
  deleteLabel: string;
  noServicesLabel: string;
}

export function ServiceGroupSortableTable({
  services,
  locale,
  editLabel,
  deleteLabel,
  noServicesLabel,
}: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/20">
          <th className="w-8 px-2 py-2" />
          <th className="text-left px-4 py-2 font-medium">이름</th>
          <th className="text-left px-4 py-2 font-medium">Slug</th>
          <th className="text-left px-4 py-2 font-medium">순서</th>
          <th className="text-left px-4 py-2 font-medium">추천</th>
          <th className="px-4 py-2" />
        </tr>
      </thead>
      <tbody>
        {services.length > 0 ? (
          <SortableList
            items={services}
            colSpan={5}
            onSave={reorderServices}
            renderCells={(svc, index) => (
              <>
                <td className="px-4 py-2">{getEn(svc.name)}</td>
                <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                  {svc.slug}
                </td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{index + 1}</td>
                <td className="px-4 py-2">{svc.is_featured ? "✓" : ""}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${locale}/admin/services/${svc.id}`}
                      className="text-primary text-xs hover:underline"
                    >
                      {editLabel}
                    </a>
                    <DeleteButton action={deleteService.bind(null, svc.id)} label={deleteLabel} />
                  </div>
                </td>
              </>
            )}
          />
        ) : (
          <tr>
            <td colSpan={6} className="px-4 py-3 text-muted-foreground text-xs">
              {noServicesLabel}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
