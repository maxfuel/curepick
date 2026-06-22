# Phase 7: Auto Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate user-generated review titles, review bodies, and review comments on-demand via Google Cloud Translation API, caching results in the DB, with Airbnb-style "View Translation" / "View Original" toggle.

**Architecture:** Server Components fetch reviews + existing translation cache in one JOIN query and pass `cachedTranslation` as props. If cached, the toggle is available on page load with no API call. If not cached, clicking "View Translation" calls `GET /api/translations`, which translates via Google, caches in DB, and returns the result. A controlled `TranslateButton` client component handles fetch/error/pending state; its parent (`ReviewCard`, `ReviewDetailClient`, `CommentSection`) holds `translation` + `showTranslation` state for display.

**Tech Stack:** Google Cloud Translation API v2 (REST), Supabase PostgREST (JOIN queries), Next.js 15 App Router, next-intl (en/ko/zh/ja), TypeScript strict mode

## Global Constraints

- Valid locales: `en`, `ko`, `zh`, `ja` only — reject any other value at the API boundary with HTTP 400
- Translation API: `POST https://translation.googleapis.com/language/translate/v2?key=KEY`
- API key in `GOOGLE_TRANSLATE_API_KEY` environment variable
- Source language: auto-detect (omit `source` param in Google API request)
- Never re-translate: if `review_translations` row exists for `(review_id, locale)`, return it immediately
- TypeScript strict mode: no `any`, no unhandled `null`
- All new UI strings in all 4 locale files: `en`, `ko`, `zh`, `ja`
- No test framework in this project — verify with `npx tsc --noEmit` + `npm run lint` + manual browser check

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/008_review_translations.sql` | Create | Translation cache tables |
| `src/lib/translation/google.ts` | Create | Google Translate API wrapper |
| `src/app/api/translations/route.ts` | Create | Cache-check → translate → store endpoint |
| `src/components/reviews/TranslateButton.tsx` | Create | Controlled translate toggle button |
| `src/components/reviews/ReviewDetailClient.tsx` | Create | Client component for review detail UI |
| `messages/en.json` | Modify | Add 4 translation UI strings |
| `messages/ko.json` | Modify | Add 4 translation UI strings |
| `messages/zh.json` | Modify | Add 4 translation UI strings |
| `messages/ja.json` | Modify | Add 4 translation UI strings |
| `src/components/reviews/ReviewCard.tsx` | Modify | Add `"use client"`, translation state, TranslateButton |
| `src/app/[locale]/reviews/page.tsx` | Modify | JOIN review_translations in query, pass cachedTranslation to ReviewCard |
| `src/app/[locale]/reviews/[id]/page.tsx` | Modify | JOIN review_translations + review_comment_translations, render ReviewDetailClient |
| `src/components/reviews/CommentSection.tsx` | Modify | Accept commentTranslations prop, render TranslateButton per comment |

---

### Task 1: DB Migration — Translation Cache Tables

**Files:**
- Create: `supabase/migrations/008_review_translations.sql`

**Interfaces:**
- Produces: `review_translations(review_id, locale, title, content)` and `review_comment_translations(comment_id, locale, content)` tables used by Tasks 2, 4, 5

- [ ] **Step 1: Write the migration file**

```sql
-- Migration 008: Review translation cache tables

CREATE TABLE review_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ko', 'zh', 'ja')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (review_id, locale)
);

CREATE TABLE review_comment_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES review_comments(id) ON DELETE CASCADE NOT NULL,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'ko', 'zh', 'ja')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, locale)
);

-- RLS: Anyone can read translations (same as reviews)
ALTER TABLE review_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_translations_select" ON review_translations FOR SELECT USING (true);
CREATE POLICY "review_translations_insert" ON review_translations FOR INSERT WITH CHECK (true);

ALTER TABLE review_comment_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_comment_translations_select" ON review_comment_translations FOR SELECT USING (true);
CREATE POLICY "review_comment_translations_insert" ON review_comment_translations FOR INSERT WITH CHECK (true);
```

- [ ] **Step 2: Run in Supabase Dashboard**

Open Supabase Dashboard → SQL Editor → paste the file content → Run.

Expected: "Success. No rows returned."

> **Note:** This project does not auto-apply migrations. The SQL file must be run manually in the Supabase Dashboard SQL Editor each time. The file is committed to git as documentation.

- [ ] **Step 3: Verify tables exist**

In Supabase Dashboard → Table Editor, confirm `review_translations` and `review_comment_translations` appear.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/008_review_translations.sql
git commit -m "feat(F-070): add review translation cache tables"
```

---

### Task 2: Google Translate Wrapper + Translation API Route

**Files:**
- Create: `src/lib/translation/google.ts`
- Create: `src/app/api/translations/route.ts`

**Interfaces:**
- Consumes: `review_translations` and `review_comment_translations` tables from Task 1
- Produces:
  - `translateText(text: string, targetLocale: string): Promise<string>` from `@/lib/translation/google`
  - `GET /api/translations?type=review&id=<uuid>&locale=<en|ko|zh|ja>` → `{ title: string; content: string }`
  - `GET /api/translations?type=comment&id=<uuid>&locale=<en|ko|zh|ja>` → `{ content: string }`

- [ ] **Step 1: Write the Google Translate wrapper**

Create `src/lib/translation/google.ts`:

```ts
export async function translateText(
  text: string,
  targetLocale: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TRANSLATE_API_KEY not set");

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target: targetLocale, format: "text" }),
    }
  );

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    data: { translations: Array<{ translatedText: string }> };
  };
  return data.data.translations[0].translatedText;
}
```

- [ ] **Step 2: Write the API route**

Create `src/app/api/translations/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { translateText } from "@/lib/translation/google";

const VALID_LOCALES = ["en", "ko", "zh", "ja"] as const;
type ValidLocale = (typeof VALID_LOCALES)[number];

function isValidLocale(v: string | null): v is ValidLocale {
  return VALID_LOCALES.includes(v as ValidLocale);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const locale = searchParams.get("locale");

  if (!type || !["review", "comment"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  if (!isValidLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  if (type === "review") {
    // 1. Cache hit
    const { data: cached } = await supabase
      .from("review_translations")
      .select("title, content")
      .eq("review_id", id)
      .eq("locale", locale)
      .single();
    if (cached) return NextResponse.json(cached);

    // 2. Fetch original
    const { data: review } = await supabase
      .from("reviews")
      .select("title, content")
      .eq("id", id)
      .single();
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // 3. Translate + cache
    try {
      const [translatedTitle, translatedContent] = await Promise.all([
        translateText(review.title, locale),
        translateText(review.content, locale),
      ]);

      const { error: insertError } = await supabase
        .from("review_translations")
        .insert({
          review_id: id,
          locale,
          title: translatedTitle,
          content: translatedContent,
        });

      // 23505 = unique_violation (race condition — another request beat us to it)
      if (insertError && insertError.code !== "23505") {
        console.error("review_translations insert error:", insertError);
      }

      return NextResponse.json({
        title: translatedTitle,
        content: translatedContent,
      });
    } catch (err) {
      console.error("Translation failed:", err);
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }
  } else {
    // type === "comment"
    const { data: cached } = await supabase
      .from("review_comment_translations")
      .select("content")
      .eq("comment_id", id)
      .eq("locale", locale)
      .single();
    if (cached) return NextResponse.json(cached);

    const { data: comment } = await supabase
      .from("review_comments")
      .select("content")
      .eq("id", id)
      .single();
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    try {
      const translatedContent = await translateText(comment.content, locale);

      const { error: insertError } = await supabase
        .from("review_comment_translations")
        .insert({ comment_id: id, locale, content: translatedContent });

      if (insertError && insertError.code !== "23505") {
        console.error("review_comment_translations insert error:", insertError);
      }

      return NextResponse.json({ content: translatedContent });
    } catch (err) {
      console.error("Translation failed:", err);
      return NextResponse.json(
        { error: "Translation failed" },
        { status: 502 }
      );
    }
  }
}
```

- [ ] **Step 3: Add env var placeholder**

Open `.env.local` and add:
```
GOOGLE_TRANSLATE_API_KEY=
```

- [ ] **Step 4: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Smoke test (with real API key set)**

```bash
# Start dev server, then in a separate terminal:
curl "http://localhost:3000/api/translations?type=review&id=REAL_UUID&locale=en"
# Expected: { "title": "...", "content": "..." }

curl "http://localhost:3000/api/translations?type=review&id=anything&locale=xx"
# Expected: { "error": "Invalid locale" } (400)
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/translation/google.ts src/app/api/translations/route.ts .env.local
git commit -m "feat(F-070): add Google Translate wrapper and translations API route"
```

---

### Task 3: TranslateButton Component + i18n Strings

**Files:**
- Create: `src/components/reviews/TranslateButton.tsx`
- Modify: `messages/en.json`, `messages/ko.json`, `messages/zh.json`, `messages/ja.json`

**Interfaces:**
- Consumes: `GET /api/translations` from Task 2
- Produces:
  ```ts
  // from "@/components/reviews/TranslateButton"
  export function TranslateButton(props: TranslateButtonProps): JSX.Element
  
  interface TranslateButtonProps {
    type: "review" | "comment";
    id: string;
    locale: string;
    translation: { title?: string; content: string } | null; // current cached value from parent
    showTranslation: boolean; // controlled by parent
    onTranslated: (data: { title?: string; content: string }) => void;
    onToggle: (show: boolean) => void;
  }
  ```

- [ ] **Step 1: Add i18n strings to all 4 locale files**

In `messages/en.json`, inside the `"reviews"` object, add after `"cancel": "Cancel"`:
```json
"viewTranslation": "View Translation",
"viewOriginal": "View Original",
"translating": "Translating...",
"translationError": "Translation failed"
```

In `messages/ko.json`, inside the `"reviews"` object:
```json
"viewTranslation": "번역 보기",
"viewOriginal": "원문 보기",
"translating": "번역 중...",
"translationError": "번역 실패"
```

In `messages/zh.json`, inside the `"reviews"` object:
```json
"viewTranslation": "查看翻译",
"viewOriginal": "查看原文",
"translating": "翻译中...",
"translationError": "翻译失败"
```

In `messages/ja.json`, inside the `"reviews"` object:
```json
"viewTranslation": "翻訳を見る",
"viewOriginal": "原文を見る",
"translating": "翻訳中...",
"translationError": "翻訳失敗"
```

- [ ] **Step 2: Write TranslateButton**

Create `src/components/reviews/TranslateButton.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface TranslateButtonProps {
  type: "review" | "comment";
  id: string;
  locale: string;
  translation: { title?: string; content: string } | null;
  showTranslation: boolean;
  onTranslated: (data: { title?: string; content: string }) => void;
  onToggle: (show: boolean) => void;
}

export function TranslateButton({
  type,
  id,
  locale,
  translation,
  showTranslation,
  onTranslated,
  onToggle,
}: TranslateButtonProps) {
  const t = useTranslations("reviews");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);

    if (showTranslation) {
      onToggle(false);
      return;
    }

    if (translation) {
      onToggle(true);
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(
        `/api/translations?type=${type}&id=${encodeURIComponent(id)}&locale=${encodeURIComponent(locale)}`
      );
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { title?: string; content: string };
      onTranslated(data);
      onToggle(true);
    } catch {
      setError(t("translationError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50"
      >
        {isPending
          ? t("translating")
          : showTranslation
            ? t("viewOriginal")
            : t("viewTranslation")}
      </button>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/reviews/TranslateButton.tsx messages/en.json messages/ko.json messages/zh.json messages/ja.json
git commit -m "feat(F-070): add TranslateButton component and translation i18n strings"
```

---

### Task 4: Reviews List — RSC Query + ReviewCard Client Component

**Files:**
- Modify: `src/components/reviews/ReviewCard.tsx`
- Modify: `src/app/[locale]/reviews/page.tsx`

**Interfaces:**
- Consumes: `TranslateButton` from Task 3
- Produces: `ReviewCard` accepts new prop `cachedTranslation: { title: string; content: string } | null`

- [ ] **Step 1: Update ReviewCard to client component with translation**

Replace the entire contents of `src/components/reviews/ReviewCard.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { TranslateButton } from "./TranslateButton";

interface ReviewCardProps {
  review: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
  };
  locale: string;
  cachedTranslation: { title: string; content: string } | null;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export function ReviewCard({ review, locale, cachedTranslation }: ReviewCardProps) {
  const [translation, setTranslation] = useState<{
    title: string;
    content: string;
  } | null>(cachedTranslation);
  const [showTranslation, setShowTranslation] = useState(!!cachedTranslation);

  const displayTitle =
    showTranslation && translation ? translation.title : review.title;
  const displayContent =
    showTranslation && translation ? translation.content : review.content;

  const mediaUrls = Array.isArray(review.media)
    ? (review.media as string[])
    : [];

  return (
    <div className="rounded-xl border transition-colors hover:bg-muted/50">
      <Link href={`/reviews/${review.id}`} className="block space-y-2 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {review.is_verified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {review.created_at
              ? new Date(review.created_at).toLocaleDateString(locale)
              : ""}
          </span>
        </div>

        <h3 className="font-medium">{displayTitle}</h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {displayContent}
        </p>

        {mediaUrls.length > 0 && (
          <div className="flex gap-2">
            {mediaUrls.slice(0, 3).map((url, i) => (
              <div
                key={i}
                className="size-16 overflow-hidden rounded-lg bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </div>
            ))}
            {mediaUrls.length > 3 && (
              <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                +{mediaUrls.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {review.authorName && <span>{review.authorName}</span>}
          {review.hospitals && (
            <>
              {review.authorName && <span>·</span>}
              <span>{getLocalizedName(review.hospitals.name, locale)}</span>
            </>
          )}
        </div>
      </Link>

      <div className="px-4 pb-3">
        <TranslateButton
          type="review"
          id={review.id}
          locale={locale}
          translation={translation}
          showTranslation={showTranslation}
          onTranslated={(data) =>
            setTranslation(data as { title: string; content: string })
          }
          onToggle={setShowTranslation}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update reviews list page query to JOIN review_translations**

In `src/app/[locale]/reviews/page.tsx`, find:

```ts
  let query = supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
```

Replace with:

```ts
  let query = supabase
    .from("reviews")
    .select("*, hospitals(name), review_translations(locale, title, content)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });
```

- [ ] **Step 3: Extract cachedTranslation per review and pass to ReviewCard**

In `src/app/[locale]/reviews/page.tsx`, find:

```ts
  const reviewsWithAuthors = (reviews ?? []).map((r) => ({
    ...r,
    authorName: profileMap.get(r.user_id) ?? null,
  }));
```

Replace with:

```ts
  const reviewsWithAuthors = (reviews ?? []).map((r) => {
    const translations = r.review_translations as
      | Array<{ locale: string; title: string; content: string }>
      | null
      | undefined;
    const cachedTranslation =
      translations?.find((t) => t.locale === locale) ?? null;
    return {
      ...r,
      authorName: profileMap.get(r.user_id) ?? null,
      cachedTranslation: cachedTranslation
        ? { title: cachedTranslation.title, content: cachedTranslation.content }
        : null,
    };
  });
```

- [ ] **Step 4: Update ReviewsPageContent props and ReviewCard call**

In the `ReviewsPageContent` function signature, add `cachedTranslation` to the reviews type:

```ts
function ReviewsPageContent({
  reviews,
  ...
}: {
  reviews: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
    cachedTranslation: { title: string; content: string } | null;
  }[];
  ...
```

And update the `ReviewCard` call from:
```tsx
<ReviewCard key={review.id} review={review} locale={locale} />
```
to:
```tsx
<ReviewCard
  key={review.id}
  review={review}
  locale={locale}
  cachedTranslation={review.cachedTranslation}
/>
```

Also update the early-return path (the empty results case at the top, the `reviews={[]}` call) — `ReviewsPageContent` now requires `cachedTranslation` in each review, but the `reviews` array is empty there so no change needed to that call site. The empty array satisfies the type.

- [ ] **Step 5: Type check + lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: 0 errors.

- [ ] **Step 6: Manual test**

Open `http://localhost:3000/ko/reviews`. Each review card should show a "번역 보기" link below the content. (Translation won't work until a real API key is set, but the button should render and show a loading state on click.)

- [ ] **Step 7: Commit**

```bash
git add src/components/reviews/ReviewCard.tsx src/app/\[locale\]/reviews/page.tsx
git commit -m "feat(F-070): wire translation toggle into reviews list (ReviewCard + RSC query)"
```

---

### Task 5: Review Detail Page — RSC Query + ReviewDetailClient + CommentSection

**Files:**
- Create: `src/components/reviews/ReviewDetailClient.tsx`
- Modify: `src/app/[locale]/reviews/[id]/page.tsx`
- Modify: `src/components/reviews/CommentSection.tsx`

**Interfaces:**
- Consumes: `TranslateButton` from Task 3; translation tables from Task 1
- Produces: review detail page shows TranslateButton for review body + per-comment TranslateButton

- [ ] **Step 1: Create ReviewDetailClient**

Create `src/components/reviews/ReviewDetailClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TranslateButton } from "./TranslateButton";
import { CommentSection } from "./CommentSection";

interface ReviewDetailClientProps {
  review: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
  };
  cachedTranslation: { title: string; content: string } | null;
  comments: {
    id: string;
    content: string;
    created_at: string | null;
    profiles: { full_name: string | null; role: string | null } | null;
  }[];
  commentTranslations: Record<string, { content: string } | null>;
  locale: string;
  isLoggedIn: boolean;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export function ReviewDetailClient({
  review,
  cachedTranslation,
  comments,
  commentTranslations,
  locale,
  isLoggedIn,
}: ReviewDetailClientProps) {
  const t = useTranslations("reviews");
  const [translation, setTranslation] = useState<{
    title: string;
    content: string;
  } | null>(cachedTranslation);
  const [showTranslation, setShowTranslation] = useState(!!cachedTranslation);

  const displayTitle =
    showTranslation && translation ? translation.title : review.title;
  const displayContent =
    showTranslation && translation ? translation.content : review.content;

  const mediaUrls = Array.isArray(review.media)
    ? (review.media as string[])
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <article className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {review.is_verified && (
              <Badge variant="secondary">{t("verified")}</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold">{displayTitle}</h1>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {review.authorName && <span>{review.authorName}</span>}
            {review.hospitals && (
              <>
                <span>·</span>
                <span>{getLocalizedName(review.hospitals.name, locale)}</span>
              </>
            )}
            {review.created_at && (
              <>
                <span>·</span>
                <span>
                  {new Date(review.created_at).toLocaleDateString(locale)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
        </div>

        <TranslateButton
          type="review"
          id={review.id}
          locale={locale}
          translation={translation}
          showTranslation={showTranslation}
          onTranslated={(data) =>
            setTranslation(data as { title: string; content: string })
          }
          onToggle={setShowTranslation}
        />

        {mediaUrls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {mediaUrls.map((url, i) => (
              <div
                key={i}
                className="h-48 overflow-hidden rounded-lg bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </article>

      <div className="mt-8 border-t pt-8">
        <CommentSection
          reviewId={review.id}
          comments={comments}
          commentTranslations={commentTranslations}
          isLoggedIn={isLoggedIn}
          locale={locale}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update CommentSection to accept commentTranslations**

Replace the entire contents of `src/components/reviews/CommentSection.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createComment } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TranslateButton } from "./TranslateButton";

interface Comment {
  id: string;
  content: string;
  created_at: string | null;
  profiles: { full_name: string | null; role: string | null } | null;
}

interface CommentSectionProps {
  reviewId: string;
  comments: Comment[];
  commentTranslations: Record<string, { content: string } | null>;
  isLoggedIn: boolean;
  locale: string;
}

interface CommentItemProps {
  comment: Comment;
  cachedTranslation: { content: string } | null;
  locale: string;
}

function CommentItem({ comment, cachedTranslation, locale }: CommentItemProps) {
  const t = useTranslations("reviews");
  const [translation, setTranslation] = useState<{ content: string } | null>(
    cachedTranslation
  );
  const [showTranslation, setShowTranslation] = useState(!!cachedTranslation);

  const displayContent =
    showTranslation && translation ? translation.content : comment.content;

  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium">
          {comment.profiles?.full_name ?? "Anonymous"}
        </span>
        {comment.profiles?.role === "hospital_staff" && (
          <Badge variant="secondary" className="text-xs">
            {t("officialResponse")}
          </Badge>
        )}
        {comment.created_at && (
          <span className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString(locale)}
          </span>
        )}
      </div>
      <p className="text-sm">{displayContent}</p>
      <TranslateButton
        type="comment"
        id={comment.id}
        locale={locale}
        translation={translation}
        showTranslation={showTranslation}
        onTranslated={(data) => setTranslation({ content: data.content })}
        onToggle={setShowTranslation}
      />
    </div>
  );
}

export function CommentSection({
  reviewId,
  comments,
  commentTranslations,
  isLoggedIn,
  locale,
}: CommentSectionProps) {
  const t = useTranslations("reviews");
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    await createComment(reviewId, content.trim());
    setContent("");
    setIsPending(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("comments")}</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noComments")}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              cachedTranslation={commentTranslations[comment.id] ?? null}
              locale={locale}
            />
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("writeComment")}
            className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !content.trim()}
          >
            {isPending ? t("posting") : t("postComment")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t("loginToComment")}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update review detail page — JOIN queries + render ReviewDetailClient**

Replace the entire contents of `src/app/[locale]/reviews/[id]/page.tsx` with:

```tsx
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";
import { ReviewDetailClient } from "@/components/reviews/ReviewDetailClient";

interface ReviewDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function ReviewDetailPage({
  params,
}: ReviewDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const user = await getUser();

  const { data: review } = await supabase
    .from("reviews")
    .select(
      "*, hospitals(name), review_translations(locale, title, content)"
    )
    .eq("id", id)
    .single();

  if (
    !review ||
    (review.status !== "approved" && review.user_id !== user?.id)
  ) {
    notFound();
  }

  // Extract cached translation for current locale
  const reviewTranslations = review.review_translations as
    | Array<{ locale: string; title: string; content: string }>
    | null
    | undefined;
  const cachedTranslation =
    reviewTranslations?.find((t) => t.locale === locale) ?? null;

  // Fetch author profile
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", review.user_id)
    .single();

  // Fetch comments with translation cache
  const { data: rawComments } = await supabase
    .from("review_comments")
    .select(
      "id, content, created_at, user_id, review_comment_translations(locale, content)"
    )
    .eq("review_id", id)
    .order("created_at", { ascending: true });

  // Fetch commenter profiles
  const commenterIds = [
    ...new Set((rawComments ?? []).map((c) => c.user_id)),
  ];
  const { data: commenterProfiles } =
    commenterIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", commenterIds)
      : { data: [] };

  const profileMap = new Map(
    (commenterProfiles ?? []).map((p) => [p.id, p])
  );

  const comments = (rawComments ?? []).map((c) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    profiles: profileMap.get(c.user_id) ?? null,
  }));

  // Build comment translations map keyed by comment ID
  const commentTranslations: Record<string, { content: string } | null> = {};
  for (const c of rawComments ?? []) {
    const cTranslations = c.review_comment_translations as
      | Array<{ locale: string; content: string }>
      | null
      | undefined;
    const cached = cTranslations?.find((t) => t.locale === locale) ?? null;
    commentTranslations[c.id] = cached ? { content: cached.content } : null;
  }

  return (
    <ReviewDetailClient
      review={{
        id: review.id,
        title: review.title,
        content: review.content,
        rating: review.rating,
        media: review.media,
        is_verified: review.is_verified,
        created_at: review.created_at,
        hospitals: review.hospitals,
        authorName: authorProfile?.full_name ?? null,
      }}
      cachedTranslation={
        cachedTranslation
          ? { title: cachedTranslation.title, content: cachedTranslation.content }
          : null
      }
      comments={comments}
      commentTranslations={commentTranslations}
      locale={locale}
      isLoggedIn={!!user}
    />
  );
}
```

- [ ] **Step 4: Type check + lint**

```bash
npx tsc --noEmit
npm run lint
```

Expected: 0 errors.

- [ ] **Step 5: Manual browser test**

1. Open `http://localhost:3000/ko/reviews` — list page shows "번역 보기" under each card
2. Click a review card → detail page shows "번역 보기" under the review body, and under each comment
3. Click "번역 보기" → shows loading state "번역 중..." → (with real API key) shows translated text + button changes to "원문 보기"
4. Click "원문 보기" → reverts to original text

- [ ] **Step 6: Commit**

```bash
git add src/components/reviews/ReviewDetailClient.tsx src/components/reviews/CommentSection.tsx src/app/\[locale\]/reviews/\[id\]/page.tsx
git commit -m "feat(F-070): wire translation toggle into review detail page and comments"
```
