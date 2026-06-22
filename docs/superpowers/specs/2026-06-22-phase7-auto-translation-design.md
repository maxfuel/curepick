# Phase 7: Auto Translation Design

## Goal

Automatically translate user-generated content (review titles, review body, review comments) into the viewer's selected locale using Google Cloud Translation API, with on-demand caching in the database.

## Architecture

Server Components fetch reviews and existing translation cache in a single JOIN query. If a cached translation exists for the viewer's locale, it is passed as a prop and the toggle is available immediately with no client-side API call. If no cache exists, clicking "View Translation" triggers a fetch to `/api/translations`, which calls Google Translate, caches the result in the DB, and returns it. The client component updates local state with the response.

**Tech Stack:** Google Cloud Translation API v2 (REST), Supabase (PostgreSQL + RLS), Next.js 15 App Router (RSC + Client Components), next-intl (4 locales: en, ko, zh, ja)

---

## Global Constraints

- Locales: `en`, `ko`, `zh`, `ja` only — reject any other value at the API boundary
- Translation API: Google Cloud Translation v2 REST (`https://translation.googleapis.com/language/translate/v2`)
- API key via `GOOGLE_TRANSLATE_API_KEY` environment variable
- Source language: auto-detect (omit `source` param)
- Cache storage: Supabase DB (never re-translate if cache exists for that locale)
- TypeScript strict mode: no `any`, no unhandled `null`
- All new UI strings added to all 4 locale message files

---

## Data Model

### New tables (`supabase/migrations/008_review_translations.sql`)

```sql
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
```

`UNIQUE(review_id, locale)` prevents duplicate translations. `ON DELETE CASCADE` cleans up translations when the review or comment is deleted.

---

## Components & Files

### New files

**`src/lib/translation/google.ts`**
- `translateText(text: string, targetLocale: string): Promise<string>`
- Uses `GOOGLE_TRANSLATE_API_KEY`
- Throws on API error (caller handles)

**`src/app/api/translations/route.ts`**

```
GET /api/translations?type=review&id=<uuid>&locale=<en|ko|zh|ja>
GET /api/translations?type=comment&id=<uuid>&locale=<en|ko|zh|ja>
```

Logic:
1. Validate `type` (`review` | `comment`) and `locale` (`en|ko|zh|ja`) — return 400 otherwise
2. Check DB for existing translation → return immediately if found (no Google API call)
3. Fetch original text from `reviews` or `review_comments`
4. Call `translateText` in parallel for each text field
5. Insert into `review_translations` or `review_comment_translations`
6. Return translated fields as JSON

**`src/components/reviews/TranslateButton.tsx`** (`"use client"`)

Props:
```ts
interface TranslateButtonProps {
  type: "review" | "comment";
  id: string;
  locale: string;
  cached: { title?: string; content: string } | null;
  onTranslated: (data: { title?: string; content: string }) => void;
}
```

State:
- `translation` — starts as `cached`, updated after fetch
- `showTranslation` — starts `true` if `cached` exists, `false` otherwise
- `isPending` — true during API fetch
- `error` — string | null

Button label: `t("viewTranslation")` / `t("viewOriginal")` (next-intl)

Behaviour:
- Click when `showTranslation=false` and no translation yet → fetch `/api/translations`, call `onTranslated(data)`, set `showTranslation=true`
- Click when `showTranslation=false` and translation already fetched → set `showTranslation=true` (no API call)
- Click when `showTranslation=true` → set `showTranslation=false`
- Error: show inline error message, keep original text

### Modified files

**`src/app/[locale]/reviews/[id]/page.tsx`**

Extend select query:
```ts
.select(`
  *,
  profiles(full_name, avatar_url),
  review_translations(locale, title, content),
  review_comments(
    *,
    profiles(full_name, avatar_url),
    review_comment_translations(locale, content)
  )
`)
```

Extract cached translation for current locale and pass to components:
```ts
const cachedTranslation = review.review_translations?.find(t => t.locale === locale) ?? null;
```

**`src/app/[locale]/reviews/page.tsx`**

Extend select query:
```ts
.select(`*, review_translations(locale, title, content)`)
```

Pass `cachedTranslation` per review to `ReviewCard`.

**`src/components/reviews/ReviewCard.tsx`**

Add props:
```ts
cachedTranslation: { title: string; content: string } | null;
locale: string;
```

Internal state:
```ts
const [translation, setTranslation] = useState(cachedTranslation);
const [showTranslation, setShowTranslation] = useState(!!cachedTranslation);

const displayTitle = showTranslation && translation ? translation.title : review.title;
const displayContent = showTranslation && translation ? translation.content : review.content;
```

Render `<TranslateButton>` below content.

**`src/components/reviews/CommentSection.tsx`**

Accept `commentTranslations: Record<string, { content: string } | null>` prop (keyed by comment ID). Render `<TranslateButton type="comment">` per comment.

**`messages/en.json`, `ko.json`, `zh.json`, `ja.json`**

Add to `reviews` section:
- `"viewTranslation"`: "View Translation" / "번역 보기" / "查看翻译" / "翻訳を見る"
- `"viewOriginal"`: "View Original" / "원문 보기" / "查看原文" / "原文を見る"
- `"translating"`: "Translating..." / "번역 중..." / "翻译中..." / "翻訳中..."
- `"translationError"`: "Translation failed" / "번역 실패" / "翻译失败" / "翻訳失敗"

**`.env.local`**

Add: `GOOGLE_TRANSLATE_API_KEY=`

---

## Data Flow

```
[User visits /ko/reviews/[id]]
  RSC fetches review + review_translations(locale='ko') in one query
  ├─ Translation cached → cachedTranslation passed as prop
  │    ReviewCard: showTranslation=true, toggle available immediately
  └─ No cache → cachedTranslation=null
       ReviewCard: shows original, "번역 보기" button visible

[User clicks "번역 보기"]
  TranslateButton fetches GET /api/translations?type=review&id=...&locale=ko
  API Route:
    ├─ Cache hit → return immediately
    └─ Cache miss → translateText(title) + translateText(content) in parallel
                  → INSERT INTO review_translations
                  → return { title, content }
  onTranslated({ title, content }) → setTranslation(data) → setShowTranslation(true)
  ReviewCard renders translated text
```

---

## Error Handling

- Google API error → log server-side, return 502 with generic message, client shows `translationError` string and keeps original text
- Invalid `locale` or `type` param → return 400
- Review/comment not found → return 404
- DB insert conflict (race condition on same locale) → `ON CONFLICT DO NOTHING`, re-fetch and return existing translation
