"use client";

import { SortableList } from "@/components/ui/SortableList";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteService, reorderServices } from "@/lib/actions/admin-services";

interface Procedure {
  id: string;
  name: unknown;
  slug: string | null;
}

interface Service {
  id: string;
  name: unknown;
  slug: string | null;
  sort_order: number | null;
  is_featured: boolean | null;
  procedures?: Procedure[];
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
    <table className="w-full text-sm table-fixed">
      <thead>
        <tr className="border-b bg-muted/20">
          <th className="w-8 px-2 py-2" />
          <th className="text-left px-4 py-2 font-medium w-40">이름</th>
          <th className="text-left px-4 py-2 font-medium w-48">Slug</th>
          <th className="text-left px-4 py-2 font-medium">시술</th>
          <th className="text-center px-4 py-2 font-medium w-14">추천</th>
          <th className="px-4 py-2 w-24" />
        </tr>
      </thead>
      <tbody>
        {services.length > 0 ? (
          <SortableList
            items={services}
            colSpan={5}
            onSave={reorderServices}
            renderCells={(svc) => (
              <>
                <td className="px-4 py-2 w-40">
                  <a
                    href={`/${locale}/services/${svc.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline hover:text-primary"
                    title="공개 페이지 보기"
                  >
                    {getEn(svc.name)}
                  </a>
                </td>
                <td className="px-4 py-2 w-48 overflow-hidden">
                  <span className="block truncate text-muted-foreground font-mono text-xs" title={svc.slug ?? ""}>
                    {svc.slug}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-1">
                    {(svc.procedures ?? []).slice(0, 6).map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap"
                      >
                        {getEn(p.name)}
                      </span>
                    ))}
                    {(svc.procedures ?? []).length > 6 && (
                      <span className="text-xs text-muted-foreground">
                        +{(svc.procedures ?? []).length - 6}
                      </span>
                    )}
                    {(svc.procedures ?? []).length === 0 && (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 w-14 text-center">{svc.is_featured ? "✓" : ""}</td>
                <td className="px-4 py-2 w-24">
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
