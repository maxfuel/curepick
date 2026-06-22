# Phase 8-A: SEO Core Design

## Goal

Add production-ready SEO infrastructure to Curepick: per-page Open Graph / Twitter metadata, hreflang alternate links, JSON-LD structured data, XML sitemap, robots.txt, and full-layout 404/500 error pages.

**Scope:** F-090 (SEO meta tags), F-091 (Structured Data / JSON-LD), F-092 (Sitemap & robots.txt), F-096 (Error Handling)

**Out of scope (Phase 8-B later):** F-093 (i18n completion), F-094 (GA4 Analytics), F-095 (Performance optimization)

**Tech Stack:** Next.js 15 App Router (native `Metadata` API, `sitemap.ts`, `robots.ts`), next-intl (4 locales: en, ko, zh, ja), Supabase

---

## Global Constraints

- Locales: `en`, `ko`, `zh`, `ja` — exactly these 4; `x-default` always points to `en`
- Base URL via `NEXT_PUBLIC_SITE_URL` env var; fallback to `http://localhost:3000`
- `og:locale` format: `en_US`, `ko_KR`, `zh_CN`, `ja_JP`
- Title format: `"{Page Title} | Curepick"` — except Home: `"Curepick — Find the Right Care in Korea"`
- OG image: DB image field first; fallback to `/og-default.png` (must exist in `public/`)
- TypeScript strict mode: no `any`, no unhandled `null`
- All new UI strings added to all 4 locale message files (`messages/en.json`, `ko.json`, `zh.json`, `ja.json`)
- No new npm packages — use Next.js built-ins only (no `next-sitemap`)

---

## Architecture

Centralized SEO utility layer at `src/lib/seo/`. Individual pages call helper functions and receive fully-formed `Metadata` objects or JSON-LD payloads — pages do not assemble URLs or hreflang maps themselves.

```
src/lib/seo/
  metadata.ts    ← buildMetadata() — assembles title/desc/OG/Twitter/canonical/hreflang
  json-ld.ts     ← buildHospitalJsonLd(), buildPhysicianJsonLd(), buildFaqJsonLd(), buildBreadcrumbJsonLd()
```

---

## File Map

### New files

| File | Purpose |
|------|---------|
| `src/lib/seo/metadata.ts` | `buildMetadata()` helper |
| `src/lib/seo/json-ld.ts` | JSON-LD builder functions |
| `src/app/sitemap.ts` | Next.js native sitemap generation |
| `src/app/robots.ts` | Next.js native robots.txt |
| `src/app/[locale]/not-found.tsx` | 404 page (locale-aware, full layout) |
| `src/app/[locale]/error.tsx` | 500 error boundary (client component, full layout) |
| `public/og-default.png` | Default OG fallback image (1200×630) — must be added manually |

### Modified files

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `metadataBase`, improve default metadata |
| `src/app/[locale]/layout.tsx` | Add `generateMetadata` for locale-level defaults |
| `src/app/[locale]/page.tsx` | Add OG/Twitter via `buildMetadata` |
| `src/app/[locale]/hospitals/[slug]/page.tsx` | Extend generateMetadata: OG image + JSON-LD (MedicalOrganization + BreadcrumbList) |
| `src/app/[locale]/services/[slug]/page.tsx` | Extend generateMetadata: OG image + JSON-LD (FAQPage + BreadcrumbList) |
| `src/app/[locale]/categories/[slug]/page.tsx` | Add generateMetadata via `buildMetadata` |
| `src/app/[locale]/doctors/[slug]/page.tsx` | Add generateMetadata: OG image + JSON-LD (Physician + BreadcrumbList) |
| `src/app/[locale]/reviews/[id]/page.tsx` | Add generateMetadata via `buildMetadata` |
| `messages/en.json` `ko.json` `zh.json` `ja.json` | Add `"errors"` namespace |

---

## Component Design

### `src/lib/seo/metadata.ts`

```ts
interface BuildMetadataOptions {
  title: string;           // page-specific title (without " | Curepick" suffix)
  description: string;
  locale: string;          // "en" | "ko" | "zh" | "ja"
  path: string;            // e.g. "/hospitals/asan-medical" (no locale prefix)
  image?: string | null;   // absolute or relative URL; null → use fallback
  isHome?: boolean;        // true → use full brand title, skip " | Curepick" suffix
}
```

**Canonical URL:** `${SITE_URL}/${locale}${path}`

**hreflang alternates:**
```ts
languages: {
  en:        `${SITE_URL}/en${path}`,
  ko:        `${SITE_URL}/ko${path}`,
  zh:        `${SITE_URL}/zh${path}`,
  ja:        `${SITE_URL}/ja${path}`,
  "x-default": `${SITE_URL}/en${path}`,
}
```

**OG image resolution:**
1. If `image` is a non-empty string → use as-is (absolute URL from DB, or absolute URL)
2. If `image` is null/undefined → `${SITE_URL}/og-default.png`

**`og:locale` map:**
```ts
const OG_LOCALE: Record<string, string> = {
  en: "en_US", ko: "ko_KR", zh: "zh_CN", ja: "ja_JP",
};
```

---

### `src/lib/seo/json-ld.ts`

#### `buildHospitalJsonLd(hospital, locale)`
Input fields used: `name` (JSON), `description` (JSON), `slug`, `address` (JSON), `city`, `phone`, `email`, `website`, `logo_url`

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "<localized name>",
  "description": "<localized description>",
  "url": "https://curepick.com/en/hospitals/<slug>",
  "logo": "<logo_url>",
  "telephone": "<phone>",
  "email": "<email>",
  "sameAs": "<website>",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "<localized address>",
    "addressLocality": "<city>"
  }
}
```

#### `buildPhysicianJsonLd(doctor, hospitalName, locale)`
Input fields used: `name` (JSON), `slug`, `specialty` (JSON), `photo_url`, `hospital_id` (name passed in)

```json
{
  "@context": "https://schema.org",
  "@type": "Physician",
  "name": "<localized name>",
  "image": "<photo_url>",
  "url": "https://curepick.com/en/doctors/<slug>",
  "medicalSpecialty": "<localized specialty>",
  "worksFor": {
    "@type": "MedicalOrganization",
    "name": "<hospitalName>"
  }
}
```

#### `buildFaqJsonLd(faqs, locale)`
Input: array of `{ question: JSON, answer: JSON }`

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "<localized question>",
      "acceptedAnswer": { "@type": "Answer", "text": "<localized answer>" }
    }
  ]
}
```
Only included if `faqs.length > 0`.

#### `buildBreadcrumbJsonLd(items)`
Input: `Array<{ name: string; url?: string }>`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "<url>" },
    { "@type": "ListItem", "position": 2, "name": "Beauty & Skin", "item": "<url>" },
    { "@type": "ListItem", "position": 3, "name": "Ultherapy" }
  ]
}
```
Last item has no `item` field (current page).

**Usage in page (all JSON-LD types):**
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```
Placed as first child inside the page's top-level `<>` fragment, before layout JSX.

---

### `src/app/sitemap.ts`

```ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap>
```

**Static routes** (all 4 locales, generated inline):
- `/{locale}` — priority 1.0, weekly
- `/{locale}/categories` — priority 0.8, weekly
- `/{locale}/search` — priority 0.5, monthly

**Dynamic routes** (slug lists fetched in parallel with `Promise.all`):
- `/{locale}/hospitals/{slug}` — priority 0.9, weekly
- `/{locale}/services/{slug}` — priority 0.9, weekly
- `/{locale}/categories/{slug}` — priority 0.8, weekly
- `/{locale}/doctors/{slug}` — priority 0.7, monthly

Approved reviews (`status = 'approved'`):
- `/{locale}/reviews/{id}` — priority 0.6, weekly

**Excluded paths** (never in sitemap):
`/admin/**`, `/hospital/**`, `/my`, `/inquiry`, `/login`, `/signup`, `/verify-email`, `/reset-password`, `/update-password`, `/reviews/write`, `/reviews/*/edit`, `/api/**`

Uses `createClient` from `@supabase/supabase-js` directly (not server client — no cookies needed for public data).

---

### `src/app/robots.ts`

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/hospital/", "/my", "/inquiry", "/login",
                 "/signup", "/verify-email", "/reset-password",
                 "/update-password", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

---

### Error Pages

#### `src/app/[locale]/not-found.tsx`
- Async Server Component
- `not-found.tsx` does NOT receive params — use `const locale = await getLocale()` from `next-intl/server` to get the current locale
- Uses `getTranslations({ locale, namespace: "errors" })`
- Full layout automatically applied (lives inside `[locale]` segment)
- Layout: centered, `min-h-[60vh]`, large "404" heading, translated message, `<Link href="/">` button

#### `src/app/[locale]/error.tsx`
- `"use client"` — required by Next.js
- Props: `{ error: Error & { digest?: string }; reset: () => void }`
- Uses `useTranslations("errors")` — works because `NextIntlClientProvider` is in `[locale]/layout.tsx`
- Layout: same centered design as 404, "Try again" button (`onClick={reset}`) + "Go home" `<Link>`
- Does NOT log `error` to console in production (digest only)

#### i18n keys added to all 4 locale files:
```json
"errors": {
  "notFound": {
    "title": "Page not found",
    "message": "The page you're looking for doesn't exist or has been moved.",
    "backHome": "Go home"
  },
  "serverError": {
    "title": "Something went wrong",
    "message": "An unexpected error occurred. Please try again.",
    "retry": "Try again",
    "backHome": "Go home"
  }
}
```

---

## Data Flow

```
[Build time]
  sitemap.ts → Supabase (public read) → slug lists → MetadataRoute.Sitemap

[Request time — e.g. /ko/hospitals/asan-medical]
  generateMetadata():
    ├─ fetch hospital (name, description, hero_image_url) from Supabase
    ├─ buildMetadata({ title, description, locale: "ko", path: "/hospitals/asan-medical", image: hero_image_url })
    │    └─ returns Metadata with canonical, hreflang ×4, OG, Twitter
    └─ returns Metadata to Next.js

  Page component:
    ├─ buildHospitalJsonLd(hospital, "ko") → JSON-LD script
    ├─ buildBreadcrumbJsonLd([Home, Hospitals, name]) → JSON-LD script
    └─ renders page JSX
```

---

## Error Handling

- `buildMetadata()`: if `NEXT_PUBLIC_SITE_URL` is unset → falls back to `http://localhost:3000` (no throw)
- `buildFaqJsonLd()`: if `faqs` is empty array → returns `null`; caller skips `<script>` tag
- `sitemap.ts`: if Supabase fetch fails for a table → logs error, returns empty array for that route group (partial sitemap rather than build failure)
- `not-found.tsx`: if translation fetch fails → Next.js falls back to closest error boundary

---

## Notes

- `public/og-default.png` must be created manually (1200×630 px, brand image). This is a manual step, not automated by code.
- After running the sitemap in production, submit `sitemap.xml` to Google Search Console manually.
- `metadataBase` in `src/app/layout.tsx` must be set to `new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")` — this allows Next.js to resolve relative og:image URLs automatically.
