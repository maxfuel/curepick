import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";

interface CategoryItem {
  id: string;
  slug: string;
  name: Record<string, string>;
}

export async function CategoryNav() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order", { ascending: true })
    .limit(8);

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {(categories as CategoryItem[]).map((category) => {
        const name =
          (category.name as Record<string, string>)?.[locale] ||
          (category.name as Record<string, string>)?.en ||
          category.slug;

        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {name}
          </Link>
        );
      })}
    </nav>
  );
}
