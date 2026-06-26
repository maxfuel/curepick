# Homepage: Featured Hospitals Carousel + Choose Specialties

**Date:** 2026-06-26  
**Status:** Approved

## Problem

The homepage currently shows Featured Hospitals as a small logo+city grid near the bottom (section #4), and has no "Choose Specialties" section. The reference design (Bookimed-style) shows:
1. A photo-forward hospital carousel immediately below Browse Categories
2. A clean "Choose Specialties" grid with bold category names and service lists

## Goal

New homepage section order:
1. Hero (unchanged)
2. Browse Categories (unchanged)
3. **Featured Hospitals** ← moved up, restyled as photo carousel
4. **Choose Specialties** ← new section
5. Featured Services (existing, stays)
6. CTA (unchanged)

---

## Section 1: Featured Hospitals Carousel

### New component: `src/components/cards/HospitalCarousel.tsx`

Same scroll mechanics as `CategoryCarousel.tsx` (smooth scroll, left/right chevron buttons, `overflow-x-auto`, CSS grid with `gridAutoFlow: column`).

**Card design:**
```
┌──────────────────────────────┐
│  [hero_image_url, 4:3 ratio] │
│  Seoul, Korea (bottom-left)  │  ← overlay tag
└──────────────────────────────┘
  Gangnam Aesthetic Clinic       ← name, truncated
```
- Image: `hero_image_url` primary, `logo_url` fallback (object-cover, rounded-xl top corners)
- City tag: absolute overlay, bottom-left, `bg-black/60 text-white text-xs px-2 py-0.5 rounded`
- Card width: `minmax(220px, 280px)` (matches reference scale)
- Single row (not 2-row like CategoryCarousel — 1 row of hospital cards)

**Props interface:**
```ts
interface HospitalItem {
  id: string;
  slug: string;
  name: string;         // already localized
  city: string | null;
  heroImageUrl: string | null;
  logoUrl: string | null;
}
```

### Data changes in `page.tsx`

Change hospital query (add `hero_image_url`, drop `languages` — no longer needed for this card):
```ts
supabase.from("hospitals")
  .select("id, slug, name, city, hero_image_url, logo_url")
  .eq("is_featured", true)
  .limit(8)
```

Add "See all hospitals" link to `/hospitals` (right of section title).

### i18n

`featuredHospitals` key already exists. No new keys needed for this section.

---

## Section 2: Choose Specialties

### No new component — inline in `page.tsx`

### Data: new parallel query in `Promise.all`

```ts
supabase.from("categories")
  .select("id, slug, name, services(id, slug, name)")
  .order("sort_order")
```

Note: The existing `categories` query uses `services(count)` for the CategoryCarousel. This is a separate query that fetches full service data. Keep both queries in `Promise.all` — they are independent.

### UI layout

```
Choose Specialties           (h2, bold)

grid-cols-2 sm:grid-cols-3 lg:grid-cols-4, gap-6

┌─────────────────────┐  ┌─────────────────────┐
│ Plastic Surgery      │  │ Dental               │  ← bold, /categories/:slug
│ ─────────────────   │  │ ──────────────────   │
│ Rhinoplasty          │  │ Dental Implant        │  ← /services/:slug
│ Eyelid Surgery       │  │ Veneers               │
│ Liposuction          │  │ Denture               │
└─────────────────────┘  └─────────────────────┘
```

Each grid cell:
- Category name: `font-bold text-sm`, `Link href="/categories/:slug"`
- Thin divider: `border-t my-2`
- Services list: `space-y-1`, each service name as `Link href="/services/:slug"` in `text-sm text-muted-foreground hover:text-foreground`

No images — text-only for scannability.

### i18n

New key needed in `home` namespace:
- `"chooseSpecialties"` → en: "Choose Specialties", ko: "진료과목 선택", zh: "选择专科", ja: "診療科目を選ぶ"

---

## Files to Change

| File | Change |
|------|--------|
| `src/app/[locale]/(main)/page.tsx` | Reorder sections, update hospital query, add categoriesWithServices query, add Choose Specialties JSX, add HospitalCarousel import |
| `src/components/cards/HospitalCarousel.tsx` | **New file** — photo carousel component |
| `messages/en.json` | Add `chooseSpecialties` key under `home` |
| `messages/ko.json` | Add `chooseSpecialties` |
| `messages/zh.json` | Add `chooseSpecialties` |
| `messages/ja.json` | Add `chooseSpecialties` |

---

## Edge Cases

- **No `hero_image_url`**: Fall back to `logo_url`. If both null, skip image and show name-only card with `bg-muted` placeholder.
- **No hospitals with `is_featured=true`**: Section hidden (conditional render, same as current).
- **Categories with no services**: Show category name with no service items below (empty list, no error).
- **Many services per category**: No limit — show all. Categories with many services make the grid cell taller, which is acceptable.

---

## Verification

1. Homepage shows Featured Hospitals carousel directly below Browse Categories
2. Each hospital card shows large photo (or logo fallback), city overlay, hospital name
3. Click hospital card → `/hospitals/:slug`
4. "See all hospitals" link → `/hospitals`
5. Choose Specialties section shows below Featured Hospitals
6. Category names are bold and link to `/categories/:slug`
7. Service names link to `/services/:slug`
8. Responsive: 2-col mobile, 3-col tablet, 4-col desktop
9. Featured Services section still renders further below (not removed)
