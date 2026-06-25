import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { updateCategory } from "@/lib/actions/admin-services";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { parseMultilingual } from "@/lib/utils/multilingual";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  const backHref = `/${locale}/admin/services?tab=categories`;

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateCategory(id, formData);
    redirect(backHref);
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={backHref} className="hover:underline">
          서비스 분류 관리
        </Link>
        <span>/</span>
        <span>카테고리 수정</span>
      </div>

      <h1 className="text-2xl font-semibold mb-6">카테고리 수정</h1>

      <form action={handleUpdate} className="space-y-4">
        <MultilingualInput
          name="name"
          label="카테고리 이름"
          value={parseMultilingual(category.name)}
        />
        <div>
          <label className="text-sm font-medium">Slug</label>
          <input
            name="slug"
            defaultValue={category.slug}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">노출 순서</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={category.sort_order ?? 0}
            min={0}
            className="mt-1 w-24 rounded-md border bg-background px-3 py-2 text-sm block"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            저장
          </button>
          <Link
            href={backHref}
            className="rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
