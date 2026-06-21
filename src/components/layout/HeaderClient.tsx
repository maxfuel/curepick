"use client";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";

interface HeaderClientProps {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
  }>;
}

export function HeaderClient({ categories }: HeaderClientProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex items-center gap-2">
        <LanguageSwitcher />
        <UserMenu />
      </div>
      <MobileNav categories={categories} />
    </div>
  );
}
