import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { CategoryNav } from "./CategoryNav";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const locale = await getLocale();
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order", { ascending: true })
    .limit(8);

  const formattedCategories = (categories ?? []).map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name:
      (cat.name as Record<string, string>)?.[locale] ||
      (cat.name as Record<string, string>)?.en ||
      cat.slug,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            Curepick
          </Link>
          <CategoryNav />
        </div>
        <HeaderClient categories={formattedCategories} />
      </div>
    </header>
  );
}
