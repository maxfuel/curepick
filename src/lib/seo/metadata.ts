import type { Metadata } from "next";
import { locales } from "@/config/i18n";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const SITE_NAME = "Curepick";

const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  ko: "ko_KR",
  zh: "zh_CN",
  ja: "ja_JP",
};

export interface BuildMetadataOptions {
  title: string;
  description: string;
  locale: string;
  path: string;      // e.g. "/hospitals/asan-medical" — no locale prefix, no trailing slash
  image?: string | null;
  isHome?: boolean;  // true → use title as-is without " | Curepick" suffix
}

export function buildMetadata({
  title,
  description,
  locale,
  path,
  image,
  isHome = false,
}: BuildMetadataOptions): Metadata {
  const fullTitle = isHome ? title : `${title} | ${SITE_NAME}`;
  const pageUrl = `${SITE_URL}/${locale}${path}`;
  const ogImage = image ?? `${SITE_URL}/og-default.png`;

  const languages: Record<string, string> = { "x-default": `${SITE_URL}/en${path}` };
  for (const l of locales) {
    languages[l] = `${SITE_URL}/${l}${path}`;
  }

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: pageUrl,
      languages,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_NAME,
      locale: OG_LOCALE_MAP[locale] ?? "en_US",
      type: "website",
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
