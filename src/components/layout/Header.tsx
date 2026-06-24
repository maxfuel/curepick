import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { CategoryNav } from "./CategoryNav";
import { HeaderClient } from "./HeaderClient";
import { LayoutDashboard, Building2 } from "lucide-react";
import { CurepickLogo } from "@/components/ui/CurepickLogo";

export async function Header() {
  const locale = await getLocale();
  const supabase = await createClient();

  const [{ data: categories }, { data: { user } }] = await Promise.all([
    supabase.from("categories").select("id, slug, name").order("sort_order", { ascending: true }).limit(8),
    supabase.auth.getUser(),
  ]);

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

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
          <Link href="/">
            <CurepickLogo size="sm" showTagline={true} />
          </Link>
          <CategoryNav />
        </div>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
            >
              <LayoutDashboard className="size-3" />
              Admin
            </Link>
          )}
          {role === "hospital_staff" && (
            <Link
              href="/hospital"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Building2 className="size-3" />
              Hospital
            </Link>
          )}
          <HeaderClient categories={formattedCategories} />
        </div>
      </div>
    </header>
  );
}
