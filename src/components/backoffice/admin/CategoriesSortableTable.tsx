"use client";

import { SortableList } from "@/components/ui/SortableList";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteCategory, reorderCategories } from "@/lib/actions/admin-services";

interface Category {
  id: string;
  name: unknown;
  slug: string | null;
  sort_order: number | null;
}

function getEn(val: unknown): string {
  if (!val || typeof val !== "object" || Array.isArray(val)) return "";
  return ((val as Record<string, unknown>).en as string) || "";
}

function getKo(val: unknown): string {
  if (!val || typeof val !== "object" || Array.isArray(val)) return "";
  return ((val as Record<string, unknown>).ko as string) || "";
}

interface Props {
  categories: Category[];
  locale: string;
}

export function CategoriesSortableTable({ categories, locale }: Props) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b bg-muted/50">
          <th className="w-8 px-2 py-2" />
          <th className="text-left px-4 py-2 font-medium w-12">순서</th>
          <th className="text-left px-4 py-2 font-medium">이름 (EN)</th>
          <th className="text-left px-4 py-2 font-medium">이름 (KO)</th>
          <th className="text-left px-4 py-2 font-medium">Slug</th>
          <th className="px-4 py-2 w-28" />
        </tr>
      </thead>
      <tbody>
        {categories.length > 0 ? (
          <SortableList
            items={categories}
            colSpan={5}
            onSave={reorderCategories}
            renderCells={(cat, index) => (
              <>
                <td className="px-4 py-2 text-muted-foreground text-xs font-mono">
                  #{index + 1}
                </td>
                <td className="px-4 py-2 font-medium">{getEn(cat.name)}</td>
                <td className="px-4 py-2 text-muted-foreground">{getKo(cat.name)}</td>
                <td className="px-4 py-2 text-muted-foreground font-mono text-xs">
                  {cat.slug}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-3">
                    <a
                      href={`/${locale}/admin/services/categories/${cat.id}`}
                      className="text-primary text-xs hover:underline"
                    >
                      수정
                    </a>
                    <DeleteButton action={deleteCategory.bind(null, cat.id)} />
                  </div>
                </td>
              </>
            )}
          />
        ) : (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
              카테고리가 없습니다.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
