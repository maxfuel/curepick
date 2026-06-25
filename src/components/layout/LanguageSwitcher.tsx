"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { SUPPORTED_LANGS, type LangCode } from "@/config/i18n";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const currentLang = SUPPORTED_LANGS.find((l) => l.code === locale);

  function handleLocaleChange(code: LangCode) {
    router.replace(pathname, { locale: code });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5 px-2">
            <Globe className="size-4" />
            <span className="text-xs font-medium">{currentLang?.label ?? "EN"}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {SUPPORTED_LANGS.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLocaleChange(lang.code as LangCode)}
            className={`flex items-center gap-2 ${locale === lang.code ? "font-semibold bg-muted" : ""}`}
          >
            <span className="w-7 text-xs text-muted-foreground shrink-0">{lang.label}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
