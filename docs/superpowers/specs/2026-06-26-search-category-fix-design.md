# Search: Category + Child Services Fix

**Date:** 2026-06-26  
**Status:** Approved

## Problem

Searching "plastic surgery" returns zero results because:
1. The `categories` table is never queried — "Plastic Surgery" is a category, not a service name
2. Services inside that category (Rhinoplasty, Eyelid Surgery, Liposuction) don't contain the words "plastic surgery", so they also miss the ILIKE match

## Goal

When a user searches a category-level term like "plastic surgery", they see:
- The matching category card(s)
- All services that belong to those categories

## Architecture

Two-step server query in `search/page.tsx`:

**Step 1** — Query `categories`, `hospitals`, `doctors` in parallel:
```ts
const [{ data: catData }, { data: hospData }, { data: docData }] = await Promise.all([
  supabase.from("categories").select("id, slug, name, image_url").or(orPattern).limit(5),
  supabase.from("hospitals")...,
  supabase.from("doctors")...,
]);
```

**Step 2** — Query `services` with enhanced OR filter:
```ts
const matchedCategoryIds = (catData ?? []).map(c => c.id);
let serviceOrFilter = orPattern; // name-based match (existing)
if (matchedCategoryIds.length > 0) {
  serviceOrFilter += `,category_id.in.(${matchedCategoryIds.join(",")})`;
}
const { data: svcData } = await supabase
  .from("services")
  .select("slug, name, description, image_url")
  .or(serviceOrFilter)
  .limit(10);
```

Step 2 must run after Step 1 (needs matched category IDs). Step 1 is fully parallel.

## Files to Change

### 1. `src/app/[locale]/(main)/search/page.tsx`

- Add `categories` type + array
- Restructure query to 2-step flow above
- Add `categories.length` to `totalResults`
- Add **Categories section** at the top of results UI (before Services), styled consistently with other sections — card with image + name, linking to `/categories/:slug`
- `highlightMatch()` reused as-is for category names

### 2. `src/components/ui/SearchBar.tsx`

- Add `"category"` to `Suggestion` type union
- Add categories query to `Promise.all` (limit 2 — fewer slots than services/hospitals)
- Push category suggestions **first** in the results array so they appear at top
- Add `category` case to `typeLabel` (uses `t("categoriesSection")`)
- Add `category` case to `handleSelect` → navigate to `/categories/:slug`

### 3. i18n messages (`messages/en.json`, `ko.json`, `zh.json`, `ja.json`)

Add `"categoriesSection"` key under the `"search"` namespace:
- en: `"Categories"`
- ko: `"카테고리"`
- zh: `"类别"`
- ja: `"カテゴリー"`

## No DB Changes Required

The existing `categories` table already has `id`, `slug`, `name` (JSONB), `image_url`. The `services` table already has `category_id`. No migrations needed.

## Edge Cases

- **Duplicate services**: If a service matches both by name AND by category_id, Supabase returns it once (no dedup needed — DB-level uniqueness)
- **No category match**: `matchedCategoryIds` is empty → `serviceOrFilter` remains the original `orPattern`, behavior identical to current
- **Many child services**: limit 10 on services query prevents flooding; categories limit is 5

## Verification

1. Search "plastic surgery" → expect: Plastic Surgery category card + Rhinoplasty/Eyelid Surgery/Liposuction services
2. Search "rhinoplasty" → expect: only services section (no category match), behavior unchanged
3. Search "dental" → expect: Dental category card + dental services
4. Autocomplete for "plastic" → expect: "Plastic Surgery" category suggestion appears first
5. Click autocomplete category → navigates to `/categories/plastic-surgery`
6. Empty state ("xyz") → "no results" message still shows correctly
