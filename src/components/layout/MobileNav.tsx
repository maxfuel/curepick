"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Menu } from "lucide-react";

interface MobileNavProps {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
}

export function MobileNav({ categories }: MobileNavProps) {
  const t = useTranslations();

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="lg:hidden">
            <Menu className="size-5" />
            <span className="sr-only">{t("header.menu")}</span>
          </Button>
        }
      />
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{t("mobileNav.navigation")}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t("header.categories")}
          </p>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("common.language")}
            </span>
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" render={<Link href="/login" />}>
              {t("common.login")}
            </Button>
            <Button className="w-full" render={<Link href="/signup" />}>
              {t("common.signup")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
