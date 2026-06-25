import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "@/config/i18n";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localeCookie: {
    name: "CUREPICK_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});
