# Phase 8-A: SEO Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-ready SEO infrastructure — per-page OG/Twitter metadata, hreflang, JSON-LD structured data, XML sitemap, robots.txt, and full-layout 404/500 error pages.

**Architecture:** A centralized `src/lib/seo/` utility layer (`buildMetadata`, JSON-LD builders) is created first. All page `generateMetadata` functions call these helpers instead of assembling metadata inline. Sitemap and robots.txt use Next.js App Router's native file conventions. Error pages live at `src/app/[locale]/` so they inherit the full Header+Footer layout automatically.

**Tech Stack:** Next.js 15 App Router (native `Metadata` API, `sitemap.ts`, `robots.ts`), next-intl ≥ 3.11 (4 locales: en, ko, zh, ja), Supabase, TypeScript strict

## Global Constraints

- Locales: `en`, `ko`, `zh`, `ja` — exactly these 4; `x-default` hreflang always points to `en`
- Base URL: `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"` — never hardcoded
- `og:locale` format: `en_US`, `ko_KR`, `zh_CN`, `ja_JP`
- Title format: `"{Page Title} | Curepick"` — Home page uses `"Curepick — Find the Right Care in Korea"` (no suffix)
- OG image: DB image field first (hero_image_url / image_url / photo_url); fallback to `${SITE_URL}/og-default.png`
- TypeScript strict mode: no `any`, no unhandled `null` — `npx tsc --noEmit` must stay at 0 errors after every task
- No new npm packages — Next.js built-ins only (no `next-sitemap`)
- All new UI strings added to all 4 locale message files (en, ko, zh, ja)

---

### Task 1: SEO Utility Layer

**Files:**
- Create: `src/lib/seo/metadata.ts`
- Create: `src/lib/seo/json-ld.ts`

**Interfaces:**
- Consumes: `src/lib/utils/i18n-field.ts` → `getLocalizedField(field, locale)`; `src/config/i18n.ts` → `locales`
- Produces:
  - `buildMetadata(opts: BuildMetadataOptions): Metadata` — used by all pages in Tasks 4–6
  - `buildHospitalJsonLd(hospital: HospitalJsonLdInput, locale: string): object` — Task 4
  - `buildPhysicianJsonLd(doctor: PhysicianJsonLdInput, hospitalName: string, locale: string): object` — Task 5
  - `buildFaqJsonLd(faqs: FaqJsonLdInput[], locale: string): object | null` — Task 5
  - `buildBreadcrumbJsonLd(items: BreadcrumbItem[]): object` — Tasks 4, 5, 6

- [ ] **Step 1: Create `src/lib/seo/metadata.ts`**

```ts
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
    title: fullTitle,
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
```

- [ ] **Step 2: Create `src/lib/seo/json-ld.ts`**

```ts
import { getLocalizedField } from "@/lib/utils/i18n-field";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface HospitalJsonLdInput {
  slug: string;
  name: unknown;
  description: unknown;
  address: unknown;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
}

export function buildHospitalJsonLd(hospital: HospitalJsonLdInput, locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: getLocalizedField(hospital.name, locale),
    description: getLocalizedField(hospital.description, locale),
    url: `${SITE_URL}/${locale}/hospitals/${hospital.slug}`,
    ...(hospital.logo_url && { logo: hospital.logo_url }),
    ...(hospital.phone && { telephone: hospital.phone }),
    ...(hospital.email && { email: hospital.email }),
    ...(hospital.website && { sameAs: hospital.website }),
    address: {
      "@type": "PostalAddress",
      streetAddress: getLocalizedField(hospital.address, locale),
      addressLocality: hospital.city ?? "",
    },
  };
}

export interface PhysicianJsonLdInput {
  slug: string;
  name: unknown;
  specialty: unknown;
  photo_url: string | null;
}

export function buildPhysicianJsonLd(
  doctor: PhysicianJsonLdInput,
  hospitalName: string,
  locale: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: getLocalizedField(doctor.name, locale),
    url: `${SITE_URL}/${locale}/doctors/${doctor.slug}`,
    ...(doctor.photo_url && { image: doctor.photo_url }),
    medicalSpecialty: getLocalizedField(doctor.specialty, locale),
    worksFor: {
      "@type": "MedicalOrganization",
      name: hospitalName,
    },
  };
}

export interface FaqJsonLdInput {
  question: unknown;
  answer: unknown;
}

export function buildFaqJsonLd(faqs: FaqJsonLdInput[], locale: string): object | null {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: getLocalizedField(faq.question, locale),
      acceptedAnswer: {
        "@type": "Answer",
        text: getLocalizedField(faq.answer, locale),
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url?: string;  // omit for the last (current) item
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/seo/metadata.ts src/lib/seo/json-ld.ts
git commit -m "feat(seo): add centralized SEO utility layer (buildMetadata, JSON-LD builders)"
```

---

### Task 2: Error Pages + i18n

**Files:**
- Modify: `messages/en.json`, `messages/ko.json`, `messages/zh.json`, `messages/ja.json`
- Create: `src/app/[locale]/not-found.tsx`
- Create: `src/app/[locale]/error.tsx`

**Interfaces:**
- Consumes: `src/i18n/navigation.ts` → `Link`; `next-intl/server` → `getLocale`, `getTranslations`; `next-intl` → `useTranslations`
- Produces: locale-aware 404 and 500 pages with full layout (Header + Footer via `[locale]/layout.tsx`)

- [ ] **Step 1: Add "errors" namespace to all 4 locale message files**

Add to `messages/en.json` (after the `"reviews"` block, before the closing `}`):
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

Add to `messages/ko.json`:
```json
  "errors": {
    "notFound": {
      "title": "페이지를 찾을 수 없습니다",
      "message": "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
      "backHome": "홈으로 가기"
    },
    "serverError": {
      "title": "오류가 발생했습니다",
      "message": "예상치 못한 오류가 발생했습니다. 다시 시도해 주세요.",
      "retry": "다시 시도",
      "backHome": "홈으로 가기"
    }
  }
```

Add to `messages/zh.json`:
```json
  "errors": {
    "notFound": {
      "title": "页面未找到",
      "message": "您查找的页面不存在或已被移动。",
      "backHome": "返回首页"
    },
    "serverError": {
      "title": "出现错误",
      "message": "发生了意外错误，请重试。",
      "retry": "重试",
      "backHome": "返回首页"
    }
  }
```

Add to `messages/ja.json`:
```json
  "errors": {
    "notFound": {
      "title": "ページが見つかりません",
      "message": "お探しのページは存在しないか、移動されました。",
      "backHome": "ホームへ"
    },
    "serverError": {
      "title": "エラーが発生しました",
      "message": "予期しないエラーが発生しました。もう一度お試しください。",
      "retry": "再試行",
      "backHome": "ホームへ"
    }
  }
```

- [ ] **Step 2: Create `src/app/[locale]/not-found.tsx`**

```tsx
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "errors" });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">{t("notFound.title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("notFound.message")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/[locale]/error.tsx`**

Note: `error.tsx` must be `"use client"` — Next.js requirement. `useTranslations` works because `NextIntlClientProvider` is in the parent `[locale]/layout.tsx`.

```tsx
"use client";

import { useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  const t = useTranslations("errors");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground">500</p>
      <h1 className="text-2xl font-semibold">{t("serverError.title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("serverError.message")}</p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("serverError.retry")}
        </button>
        <a
          href="/"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {t("serverError.backHome")}
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 5: Manual test — 404 page**

Start dev server: `npm run dev`
Navigate to: `http://localhost:3000/en/this-page-does-not-exist`
Expected: 404 page with Header + Footer visible, "Page not found" heading, "Go home" button

Navigate to: `http://localhost:3000/ko/this-page-does-not-exist`
Expected: Same page in Korean — "페이지를 찾을 수 없습니다"

- [ ] **Step 6: Commit**

```bash
git add messages/en.json messages/ko.json messages/zh.json messages/ja.json
git add "src/app/[locale]/not-found.tsx" "src/app/[locale]/error.tsx"
git commit -m "feat(seo): add 404/500 error pages with full layout and i18n"
```

---

### Task 3: Sitemap + robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `src/config/i18n.ts` → `locales`; `@supabase/supabase-js` (already in dependencies); `src/lib/types/database.ts` → `Database`
- Produces: `GET /sitemap.xml` and `GET /robots.txt` HTTP endpoints

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { locales } from "@/config/i18n";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function db() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = db();
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  for (const locale of locales) {
    entries.push({ url: `${BASE_URL}/${locale}`, changeFrequency: "weekly", priority: 1.0 });
    entries.push({ url: `${BASE_URL}/${locale}/categories`, changeFrequency: "weekly", priority: 0.8 });
    entries.push({ url: `${BASE_URL}/${locale}/search`, changeFrequency: "monthly", priority: 0.5 });
  }

  // Dynamic pages — fetch slug/id lists in parallel
  const [
    { data: hospitals, error: eH },
    { data: services, error: eS },
    { data: categories, error: eC },
    { data: doctors, error: eD },
    { data: reviews, error: eR },
  ] = await Promise.all([
    supabase.from("hospitals").select("slug"),
    supabase.from("services").select("slug"),
    supabase.from("categories").select("slug"),
    supabase.from("doctors").select("slug"),
    supabase.from("reviews").select("id").eq("status", "approved"),
  ]);

  if (eH) console.error("sitemap: hospitals fetch failed", eH.message);
  if (eS) console.error("sitemap: services fetch failed", eS.message);
  if (eC) console.error("sitemap: categories fetch failed", eC.message);
  if (eD) console.error("sitemap: doctors fetch failed", eD.message);
  if (eR) console.error("sitemap: reviews fetch failed", eR.message);

  for (const locale of locales) {
    for (const h of hospitals ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/hospitals/${h.slug}`, changeFrequency: "weekly", priority: 0.9 });
    }
    for (const s of services ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/services/${s.slug}`, changeFrequency: "weekly", priority: 0.9 });
    }
    for (const c of categories ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/categories/${c.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
    for (const d of doctors ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/doctors/${d.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
    for (const r of reviews ?? []) {
      entries.push({ url: `${BASE_URL}/${locale}/reviews/${r.id}`, changeFrequency: "weekly", priority: 0.6 });
    }
  }

  return entries;
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/hospital/",
        "/my",
        "/inquiry",
        "/login",
        "/signup",
        "/verify-email",
        "/reset-password",
        "/update-password",
        "/api/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Manual test**

With dev server running:
```bash
curl http://localhost:3000/robots.txt
```
Expected output contains:
```
User-agent: *
Allow: /
Disallow: /admin/
...
Sitemap: http://localhost:3000/sitemap.xml
```

```bash
curl http://localhost:3000/sitemap.xml | head -30
```
Expected: valid XML starting with `<?xml version="1.0"` and containing `<loc>` entries

- [ ] **Step 5: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(seo): add XML sitemap and robots.txt"
```

---

### Task 4: Root Layout `metadataBase` + Hospital Page Full SEO

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/[locale]/hospitals/[slug]/page.tsx`

**Interfaces:**
- Consumes: `src/lib/seo/metadata.ts` → `buildMetadata`; `src/lib/seo/json-ld.ts` → `buildHospitalJsonLd`, `buildBreadcrumbJsonLd`
- Produces: `metadataBase` in root layout so relative OG image URLs resolve correctly; hospital page with OG image, hreflang, MedicalOrganization JSON-LD, BreadcrumbList JSON-LD

- [ ] **Step 1: Add `metadataBase` to `src/app/layout.tsx`**

Current `metadata` export in `src/app/layout.tsx`:
```ts
export const metadata: Metadata = {
  title: "Curepick — Find the Right Care in Korea",
  description:
    "Discover, compare, and inquire about medical services in Korea. Your trusted medical tourism marketplace.",
};
```

Replace with:
```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Curepick — Find the Right Care in Korea",
  description:
    "Discover, compare, and inquire about medical services in Korea. Your trusted medical tourism marketplace.",
};
```

Also add `import type { Metadata } from "next";` if not already present (it is — line 1 of the current file).

- [ ] **Step 2: Update `generateMetadata` in `src/app/[locale]/hospitals/[slug]/page.tsx`**

Current `generateMetadata` selects only `name, description`. We need to also select `hero_image_url`, `address`, `city`, `phone`, `email`, `website`, `logo_url` for JSON-LD.

Replace the current `generateMetadata` function (lines 51–66) with:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: hospital } = await supabase
    .from("hospitals")
    .select("name, description, hero_image_url")
    .eq("slug", slug)
    .single();

  if (!hospital) return {};

  return buildMetadata({
    title: getLocalizedField(hospital.name, locale),
    description: getLocalizedField(hospital.description, locale),
    locale,
    path: `/hospitals/${slug}`,
    image: hospital.hero_image_url,
  });
}
```

Add `buildMetadata` to imports at the top of the file:
```ts
import { buildMetadata } from "@/lib/seo/metadata";
```

- [ ] **Step 3: Add JSON-LD to the Hospital page component**

In `HospitalDetailPage`, after the `if (!hospital) notFound();` check (after line 84), insert JSON-LD rendering. The hospital variable already has all the fields needed for `buildHospitalJsonLd` — confirm the select query already fetches `address, city, phone, email, website, logo_url, slug` (it does, at line 79).

Add these imports at the top of the file:
```ts
import { buildHospitalJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
```

After the existing `const t = await getTranslations(...)` line, add a second translations call for breadcrumb labels:
```ts
const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });
```

The `breadcrumb` namespace in `messages/en.json` has keys `home` ("Home") and `hospitals` ("Hospitals").

After `hospitalName` is computed (it's already in the file as `const hospitalName = getLocalizedField(hospital.name, locale)`), add the JSON-LD variables:
```ts
const hospitalJsonLd = buildHospitalJsonLd(hospital, locale);
const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
  { name: tBreadcrumb("hospitals"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/hospitals` },
  { name: hospitalName },
]);
```

In the `return` statement, wrap the existing JSX in a fragment and add JSON-LD scripts as the first children. Replace:
```tsx
  return (
    <div>
```
With:
```tsx
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div>
```

And add a closing `</>` at the very end of the return statement to close the fragment.

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 5: Manual test**

Navigate to `http://localhost:3000/en/hospitals/[any-slug]`

In browser DevTools → Elements → `<head>`:
- Confirm `<meta property="og:title">` present
- Confirm `<meta property="og:image">` present (hero_image_url or og-default.png)
- Confirm `<link rel="canonical">` present
- Confirm 4 `<link rel="alternate" hreflang>` tags (en, ko, zh, ja) + x-default

In page source, search for `application/ld+json`:
- Confirm MedicalOrganization JSON-LD present
- Confirm BreadcrumbList JSON-LD present

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx "src/app/[locale]/hospitals/[slug]/page.tsx"
git commit -m "feat(seo): add metadataBase to root layout and full SEO to hospital page"
```

---

### Task 5: Doctor + Service Pages SEO + JSON-LD

**Files:**
- Modify: `src/app/[locale]/doctors/[slug]/page.tsx`
- Modify: `src/app/[locale]/services/[slug]/page.tsx`

**Interfaces:**
- Consumes: `buildMetadata`, `buildPhysicianJsonLd`, `buildFaqJsonLd`, `buildBreadcrumbJsonLd` from Tasks 1 (already defined)
- Produces: Doctor page with Physician JSON-LD; Service page with FAQPage JSON-LD

- [ ] **Step 1: Update `src/app/[locale]/doctors/[slug]/page.tsx`**

Add imports at the top:
```ts
import { buildMetadata } from "@/lib/seo/metadata";
import { buildPhysicianJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
```

Replace the current `generateMetadata` function (lines 36–54) with:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: doctor } = await supabase
    .from("doctors")
    .select("name, specialty, photo_url")
    .eq("slug", slug)
    .single();

  if (!doctor) return {};

  const name = getLocalizedField(doctor.name, locale);
  const specialty = getLocalizedField(doctor.specialty, locale);

  return buildMetadata({
    title: name,
    description: specialty ? `${name} — ${specialty}` : name,
    locale,
    path: `/doctors/${slug}`,
    image: doctor.photo_url,
  });
}
```

In `DoctorDetailPage`, after `if (!doctor) notFound();` (line 72), add JSON-LD. The `hospital` variable is fetched later in a `Promise.all`. Add the JSON-LD computation after both `hospitalName` and `doctorName` are available (they're computed at lines 92–94). Add:
```ts
const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });
const physicianJsonLd = buildPhysicianJsonLd(doctor, hospitalName ?? "", locale);
const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
  { name: tBreadcrumb("doctors"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/doctors` },
  { name: doctorName },
]);
```

Wrap the return JSX in a fragment with JSON-LD scripts as first children (same pattern as Task 4):
```tsx
return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianJsonLd) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div>
      {/* existing JSX unchanged */}
    </div>
  </>
);
```

Note: `breadcrumb` namespace in `messages/en.json` has key `"doctors": "Doctors"` — use `tBreadcrumb("doctors")`.

- [ ] **Step 2: Update `src/app/[locale]/services/[slug]/page.tsx`**

Add imports at the top:
```ts
import { buildMetadata } from "@/lib/seo/metadata";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";
```

Replace the current `generateMetadata` function (lines 38–53) with:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("services")
    .select("name, description, image_url")
    .eq("slug", slug)
    .single();

  if (!service) return {};

  return buildMetadata({
    title: getLocalizedField(service.name, locale),
    description: getLocalizedField(service.description, locale),
    locale,
    path: `/services/${slug}`,
    image: service.image_url,
  });
}
```

In `ServiceDetailPage`, the `faqs` variable is already fetched via `Promise.all` (line 73–86). After all data is fetched, add JSON-LD computation. The service `name` is used for breadcrumb. Add before the `return`:
```ts
const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });
const serviceName = getLocalizedField(service.name, locale);
const faqJsonLd = buildFaqJsonLd(faqs ?? [], locale);
const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
  { name: tBreadcrumb("services"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/services` },
  { name: serviceName },
]);
```

Wrap return JSX with fragment and JSON-LD scripts:
```tsx
return (
  <>
    {faqJsonLd && (
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    )}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    <div>
      {/* existing JSX unchanged */}
    </div>
  </>
);
```

Note: `faqJsonLd` is `null` when there are no FAQs — the conditional prevents rendering an empty script tag.

Note: `breadcrumb` namespace has key `"services": "Services"` — use `tBreadcrumb("services")`.

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Manual test**

Navigate to `http://localhost:3000/en/doctors/[any-slug]` → inspect `<head>` for og:title, og:image, hreflang
Navigate to `http://localhost:3000/en/services/[any-slug]` → inspect page source for `application/ld+json` containing `FAQPage`

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/doctors/[slug]/page.tsx" "src/app/[locale]/services/[slug]/page.tsx"
git commit -m "feat(seo): add full SEO and JSON-LD to doctor and service pages"
```

---

### Task 6: Remaining Pages SEO + Locale Layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/categories/[slug]/page.tsx`
- Modify: `src/app/[locale]/reviews/[id]/page.tsx`

**Interfaces:**
- Consumes: `buildMetadata` from Task 1; `buildBreadcrumbJsonLd` from Task 1
- Produces: locale layout with title template fallback; all remaining public pages with full OG/hreflang metadata

- [ ] **Step 1: Add `generateMetadata` to `src/app/[locale]/layout.tsx`**

Add this function after `generateStaticParams` (after line 14):
```ts
export function generateMetadata(): Metadata {
  return {
    title: {
      template: "%s | Curepick",
      default: "Curepick — Find the Right Care in Korea",
    },
  };
}
```

Add `import type { Metadata } from "next";` to the imports at the top if not already there.

- [ ] **Step 2: Update `generateMetadata` in `src/app/[locale]/page.tsx`**

Add import:
```ts
import { buildMetadata } from "@/lib/seo/metadata";
```

Replace the current `generateMetadata` (lines 18–25):
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return buildMetadata({
    title: "Curepick — Find the Right Care in Korea",
    description: t("subtitle"),
    locale,
    path: "",
    isHome: true,
  });
}
```

- [ ] **Step 3: Update `generateMetadata` in `src/app/[locale]/categories/[slug]/page.tsx`**

Current `generateMetadata` (lines 37–52) returns only title + description. Replace with:
```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name, description, image_url")
    .eq("slug", slug)
    .single();

  if (!category) return {};

  return buildMetadata({
    title: getLocalizedField(category.name, locale),
    description: getLocalizedField(category.description, locale),
    locale,
    path: `/categories/${slug}`,
    image: category.image_url,
  });
}
```

Add import: `import { buildMetadata } from "@/lib/seo/metadata";`

Also add BreadcrumbList JSON-LD to `CategoryDetailPage`. After the `if (!category) notFound();` check, add:
```ts
const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });
const categoryName = getLocalizedField(category.name, locale);
const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: tBreadcrumb("home"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}` },
  { name: tBreadcrumb("categories"), url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/${locale}/categories` },
  { name: categoryName },
]);
```

Add import: `import { buildBreadcrumbJsonLd } from "@/lib/seo/json-ld";`

Wrap return JSX with JSON-LD script (same pattern as previous tasks).

- [ ] **Step 4: Add `generateMetadata` to `src/app/[locale]/reviews/[id]/page.tsx`**

The reviews/[id] page currently has no `generateMetadata`. Add it:

Add imports:
```ts
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
```

Add this function before `export default async function ReviewDetailPage`:
```ts
export async function generateMetadata({
  params,
}: ReviewDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("title, content")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!review) return {};

  return buildMetadata({
    title: review.title,
    description: review.content.slice(0, 160),
    locale,
    path: `/reviews/${id}`,
  });
}
```

- [ ] **Step 5: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 6: Build check**

Run: `npm run build`
Expected: Build succeeds with 0 TypeScript errors. The build output will include sitemap generation — confirm it runs without errors.

- [ ] **Step 7: Manual test — full OG check**

Use [opengraph.xyz](https://www.opengraph.xyz) or browser DevTools on:
- `http://localhost:3000/en` — og:title should be "Curepick — Find the Right Care in Korea"
- `http://localhost:3000/ko/categories/[any-slug]` — og:title should be Korean category name
- `http://localhost:3000/en/reviews/[any-approved-id]` — og:title should be review title

Confirm 404 page still works at `/en/nonexistent-page`.

- [ ] **Step 8: Commit**

```bash
git add "src/app/[locale]/layout.tsx" "src/app/[locale]/page.tsx"
git add "src/app/[locale]/categories/[slug]/page.tsx" "src/app/[locale]/reviews/[id]/page.tsx"
git commit -m "feat(seo): complete SEO for remaining pages — home, category, reviews, locale layout"
```

---

## Post-Implementation Checklist

- [ ] Place a default OG image at `public/og-default.png` (1200×630 px, brand image) — **manual step, not automated**
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://your-domain.com` in Vercel environment variables before production deploy
- [ ] Submit `https://your-domain.com/sitemap.xml` to Google Search Console after deploying
- [ ] Update `features-checklist.json` — set F-090, F-091, F-092, F-096 tasks to `"done": true` and features to `"status": "done"`
