# Phase 7: Hospital Backoffice & Admin Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build two role-gated dashboard sections — `/hospital` for hospital staff managing their own inquiries/reviews/data, and `/admin` for Curepick operators with full CRUD over all content.

**Architecture:** Route group `(backoffice)` under `[locale]` isolates dashboards from the main site layout. Current pages move into `(main)` route group so Header/Footer is not inherited by backoffice routes. Role checks happen in each layout Server Component; no middleware is added.

**Tech Stack:** Next.js 15 App Router, Supabase (server client + service role for admin account creation), React Hook Form + Zod, next-intl, Tailwind CSS, Base UI components

---

## Global Constraints

- **Role values:** `'patient'` | `'hospital_staff'` | `'admin'` — stored in `profiles.role` (CHECK constraint)
- **hospital_staff scope:** `profiles.hospital_id` limits all their data access; RLS enforces it automatically
- **Admin account creation:** requires `SUPABASE_SERVICE_ROLE_KEY` env var — only used in API Routes, never client-side
- **Multilingual JSONB format:** `{"en":"...","ko":"...","zh":"...","ja":"..."}` — all content fields follow this pattern
- **Server Action pattern:** all mutations use `"use server"` actions in `src/lib/actions/`
- **Supabase clients:** Server Components/Actions use `createClient` from `@/lib/supabase/server`; Client Components use `@/lib/supabase/client`
- **Auth helpers:** `getUser()` and `getProfile()` from `@/lib/auth/get-user` — use these for role checks
- **features-checklist.json:** update `done: true` / `status: "done"` after each task completes
- **No tests required** — this is a Next.js UI project; verify by running `npm run build` (no type errors)
- **i18n:** All user-visible text must use `useTranslations()` / `getTranslations()`; add keys to `messages/en.json` (other locale files can mirror en.json for now)

---

## Task 1: Layout Restructure + DB Migration

**Files:**
- Rename (move directory): `src/app/[locale]/` all page directories → `src/app/[locale]/(main)/`
- Modify: `src/app/[locale]/layout.tsx` — remove Header/Footer, keep only i18n + font providers
- Create: `src/app/[locale]/(main)/layout.tsx` — Header + Footer (extracted from current `[locale]/layout.tsx`)
- Create: `src/app/[locale]/(backoffice)/layout.tsx` — minimal wrapper (just i18n, no header/footer)
- Create: `supabase/migrations/009_backoffice.sql` — adds `is_official BOOLEAN DEFAULT false` to `review_comments`

**Context:**
- Current `src/app/[locale]/layout.tsx` renders: `<html><body><Header />{children}<Footer /></body></html>` wrapped with NextIntlClientProvider
- All existing page dirs live directly under `[locale]/`: categories, doctors, hospitals, inquiry, login, my, reset-password, reviews, search, services, signup, update-password, verify-email + page.tsx, not-found.tsx, error.tsx
- Route groups `(main)` and `(backoffice)` do not affect URL paths — `/en/categories` stays `/en/categories`
- `(main)/layout.tsx` must render Header+Footer exactly as current `[locale]/layout.tsx` does
- `(backoffice)/layout.tsx` must NOT render Header/Footer — just pass `{children}`

**Steps:**
- [ ] Run migration in Supabase Dashboard SQL Editor:
  ```sql
  ALTER TABLE review_comments ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT false;
  ```
  (Note: The implementer cannot run SQL — include this as a comment in the migration file and note it needs manual execution)
- [ ] Create `supabase/migrations/009_backoffice.sql` with the ALTER TABLE statement
- [ ] Create `src/app/[locale]/(main)/layout.tsx` by extracting Header+Footer from current `[locale]/layout.tsx`
- [ ] Update `src/app/[locale]/layout.tsx` to remove Header+Footer (keep only html/body, font, NextIntlClientProvider)
- [ ] Move all page directories into `(main)/`: categories, doctors, hospitals, inquiry, login, my, reset-password, reviews, search, services, signup, update-password, verify-email
- [ ] Move `page.tsx`, `not-found.tsx`, `error.tsx` into `(main)/`
- [ ] Create `src/app/[locale]/(backoffice)/layout.tsx` — minimal (just renders children; no header/footer)
- [ ] Run `npm run build` — must pass with 0 type errors
- [ ] Commit

---

## Task 2: Hospital Backoffice — Login & Dashboard (F-070, F-071)

**Files:**
- Create: `src/app/[locale]/(backoffice)/hospital/layout.tsx`
- Create: `src/app/[locale]/(backoffice)/hospital/page.tsx` (redirects to /hospital/dashboard)
- Create: `src/app/[locale]/(backoffice)/hospital/dashboard/page.tsx`
- Create: `src/components/backoffice/hospital/HospitalSidebar.tsx`
- Create: `src/components/backoffice/BackofficeShell.tsx` (layout wrapper with sidebar)
- Add i18n keys to `messages/en.json` under `"hospital"` namespace

**Context:**
- `getProfile()` from `@/lib/auth/get-user` returns the full profile including `role` and `hospital_id`
- If `profile.role !== 'hospital_staff'`, redirect to `/login`
- Dashboard must show: new inquiry count, total inquiry count, recent 5 inquiries preview
- Query: `supabase.from("inquiries").select("id, status, name, created_at").eq("hospital_id", profile.hospital_id)`
- Status values: `'new'` | `'contacted'` | `'closed'`
- Use `src/components/ui/card.tsx` and `src/components/ui/badge.tsx` (already exist)
- HospitalSidebar links: Dashboard, Inquiries, Profile, Doctors, Procedures, Reviews

**Hospital Sidebar navigation items:**
```
Dashboard → /hospital/dashboard
Inquiries → /hospital/inquiries
Profile → /hospital/profile
Doctors → /hospital/doctors
Procedures → /hospital/procedures
Reviews → /hospital/reviews
```

**Steps:**
- [ ] Create `BackofficeShell.tsx` — flex layout with sidebar + main content area
- [ ] Create `HospitalSidebar.tsx` — nav links (active state using `usePathname()`)
- [ ] Create `hospital/layout.tsx` — Server Component: `getProfile()` → if not `hospital_staff`, redirect `/login`; wrap children in `BackofficeShell` + `HospitalSidebar`
- [ ] Create `hospital/page.tsx` — `redirect('/hospital/dashboard')`
- [ ] Create `hospital/dashboard/page.tsx` — fetch inquiry stats, render stat cards + recent inquiry table
- [ ] Add i18n keys: `"hospital.dashboard.title"`, `"hospital.dashboard.newInquiries"`, `"hospital.dashboard.totalInquiries"`, `"hospital.dashboard.recentInquiries"`, `"hospital.nav.*"`
- [ ] Update `features-checklist.json`: F-070 and F-071 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 3: Hospital Content Pages (F-072, F-073, F-074)

**Files:**
- Create: `src/app/[locale]/(backoffice)/hospital/profile/page.tsx`
- Create: `src/app/[locale]/(backoffice)/hospital/doctors/page.tsx`
- Create: `src/app/[locale]/(backoffice)/hospital/procedures/page.tsx`
- Create: `src/components/backoffice/hospital/EditRequestForm.tsx` (shared form for requesting edits)

**Context:**
- These pages are **read-only views** — hospital staff cannot directly edit hospital data
- They show current data and provide an "Edit Request" form that sends an email/inquiry to admin
- Profile: shows hospital name, description, address, contact, languages, accreditation
- Doctors: list of doctors belonging to `profile.hospital_id`
- Procedures: list of `hospital_procedures` for the hospital, with cost ranges, annual volume
- `EditRequestForm` submits to `src/lib/actions/hospital.ts` → creates an inquiry or sends email
- Fetch doctors: `supabase.from("doctors").select("*").eq("hospital_id", profile.hospital_id)`
- Fetch hospital_procedures: `supabase.from("hospital_procedures").select("*, procedures(name)").eq("hospital_id", profile.hospital_id)`
- JSONB field display: use `name?.en` or locale-aware helper for multilingual fields

**Steps:**
- [ ] Create `EditRequestForm.tsx` — textarea + submit; Server Action saves to `inquiries` table with `message` prefixed with "[Edit Request]"
- [ ] Create `profile/page.tsx` — fetch and display hospital data; include `EditRequestForm`
- [ ] Create `doctors/page.tsx` — table of doctors with name, specialty, experience; include `EditRequestForm`
- [ ] Create `procedures/page.tsx` — table of hospital_procedures; include `EditRequestForm`
- [ ] Add i18n keys under `"hospital.profile"`, `"hospital.doctors"`, `"hospital.procedures"`
- [ ] Update `features-checklist.json`: F-072, F-073, F-074 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 4: Hospital Inquiries Management (F-075)

**Files:**
- Create: `src/app/[locale]/(backoffice)/hospital/inquiries/page.tsx`
- Create: `src/app/[locale]/(backoffice)/hospital/inquiries/[id]/page.tsx`
- Create: `src/lib/actions/hospital-inquiry.ts`

**Context:**
- RLS already limits hospital_staff to see only their hospital's inquiries
- Inquiry table fields relevant here: `id`, `name`, `email`, `phone`, `nationality`, `service_id`, `procedure_id`, `message`, `status`, `created_at`
- Status values: `'new'` | `'contacted'` | `'closed'`
- List page: paginated table (50 per page), filter by status, show name/email/status/date
- Detail page: full inquiry details + status change dropdown + admin notes textarea
- Status change: Server Action → `supabase.from("inquiries").update({status}).eq("id", id)`
- Admin notes: stored in `inquiries` table — check if there's a `notes` column; if not, use `message` field context or add notes as part of update (the column may not exist — skip notes if missing, just implement status change)
- Use `src/components/ui/badge.tsx` for status display, `src/components/ui/dropdown-menu.tsx` for status change
- `inquiries` table has no `notes` column in the schema — implement status change only, skip notes

**Steps:**
- [ ] Create `hospital-inquiry.ts` Server Actions: `updateInquiryStatus(id, status)`
- [ ] Create `inquiries/page.tsx` — table list with status filter; link to detail page
- [ ] Create `inquiries/[id]/page.tsx` — full detail view + status change (Client Component for dropdown)
- [ ] Add i18n keys under `"hospital.inquiries"`
- [ ] Update `features-checklist.json`: F-075 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 5: Hospital Reviews Management (F-083)

**Files:**
- Create: `src/app/[locale]/(backoffice)/hospital/reviews/page.tsx`
- Create: `src/app/[locale]/(backoffice)/hospital/reviews/[id]/page.tsx`
- Create: `src/lib/actions/hospital-review.ts`

**Context:**
- RLS: `hospital_staff` can SELECT reviews where `hospital_id = user_hospital_id()`
- Show: rating, title, content preview, author name, date, verified status
- Detail: full review + media + existing comments + official reply form
- Official reply: insert into `review_comments` with `is_official = true` (new column from Task 1 migration)
- Stats widget on list page: average rating (avg of all approved reviews for this hospital), total count, verified count
- The `is_official` column migration must be run before this task — note in implementation that it depends on the migration from Task 1
- Fetch reviews: `supabase.from("reviews").select("*, profiles(full_name)").eq("hospital_id", profile.hospital_id).eq("status", "approved")`
- Comments: `supabase.from("review_comments").select("*, profiles(full_name)").eq("review_id", reviewId)`
- Insert official reply: `supabase.from("review_comments").insert({review_id, user_id, content, is_official: true})`

**Steps:**
- [ ] Create `hospital-review.ts` Server Actions: `addOfficialReply(reviewId, content)`
- [ ] Create `reviews/page.tsx` — stats widget + review list table
- [ ] Create `reviews/[id]/page.tsx` — full review + comments list + official reply form
- [ ] Mark official replies visually (badge "Official Response") in the comments section
- [ ] Add i18n keys under `"hospital.reviews"`
- [ ] Update `features-checklist.json`: F-083 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 6: Admin Login & Dashboard (F-076, F-077)

**Files:**
- Create: `src/app/[locale]/(backoffice)/admin/layout.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/page.tsx` (redirects to /admin/dashboard)
- Create: `src/app/[locale]/(backoffice)/admin/dashboard/page.tsx`
- Create: `src/components/backoffice/admin/AdminSidebar.tsx`

**Context:**
- Same pattern as hospital layout but checks `profile.role === 'admin'`
- If not admin, redirect to `/login`
- Admin sidebar links:
  ```
  Dashboard → /admin/dashboard
  Services → /admin/services
  Hospitals → /admin/hospitals
  Doctors → /admin/doctors
  Inquiries → /admin/inquiries
  Accounts → /admin/accounts
  Reviews → /admin/reviews
  ```
- Dashboard stats: total inquiries (new count + total), total hospitals, total services, recent 10 inquiries
- Reuse `BackofficeShell.tsx` from Task 2

**Steps:**
- [ ] Create `AdminSidebar.tsx` — nav links with active state
- [ ] Create `admin/layout.tsx` — Server Component: role check → redirect if not admin; wrap in BackofficeShell + AdminSidebar
- [ ] Create `admin/page.tsx` — redirect to `/admin/dashboard`
- [ ] Create `admin/dashboard/page.tsx` — fetch stats from inquiries, hospitals, services; render stat cards + recent inquiries table
- [ ] Add i18n keys under `"admin.dashboard"`, `"admin.nav.*"`
- [ ] Update `features-checklist.json`: F-076, F-077 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 7: Admin Service Taxonomy CRUD (F-078)

**Files:**
- Create: `src/app/[locale]/(backoffice)/admin/services/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/services/[id]/page.tsx` (edit)
- Create: `src/app/[locale]/(backoffice)/admin/services/new/page.tsx`
- Create: `src/components/backoffice/admin/MultilingualInput.tsx`
- Create: `src/lib/actions/admin-services.ts`

**Context:**
- Manage: categories, services, procedures, FAQs (intents are managed inline with categories)
- `MultilingualInput` component: renders 4 tab inputs (en/ko/zh/ja), outputs JSONB object
  ```tsx
  <MultilingualInput value={{"en":"","ko":"","zh":"","ja":""}} onChange={fn} label="Name" />
  ```
- Use tab state with 4 language tabs; onChange fires with complete `{en, ko, zh, ja}` object
- Services list page: table with Category → Service → (Procedure count) structure; Create/Edit/Delete buttons
- Edit page: form with MultilingualInput for name, description, overview; category selector; is_featured toggle
- Category management: inline section at top of services page (simpler CRUD)
- Procedures: managed as sub-items within each service's edit page
- FAQs: managed as sub-items within each service's edit page (question + answer, both multilingual)
- Server Actions: `createService`, `updateService`, `deleteService`, `createProcedure`, `updateProcedure`, `deleteProcedure`, `createFaq`, `deleteFaq`
- Validation: Zod — name.en required, slug auto-generated from name.en if empty (`name.en.toLowerCase().replace(/\s+/g, '-')`)

**Steps:**
- [ ] Create `MultilingualInput.tsx` — Client Component with 4 language tabs
- [ ] Create `admin-services.ts` Server Actions for categories, services, procedures, FAQs
- [ ] Create `admin/services/page.tsx` — category+service tree table with CRUD controls
- [ ] Create `admin/services/new/page.tsx` — create service form
- [ ] Create `admin/services/[id]/page.tsx` — edit service form + procedures sub-section + FAQs sub-section
- [ ] Add i18n keys under `"admin.services"`
- [ ] Update `features-checklist.json`: F-078 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 8: Admin Hospital & Doctor CRUD (F-079, F-080)

**Files:**
- Create: `src/app/[locale]/(backoffice)/admin/hospitals/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/hospitals/new/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/hospitals/[id]/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/doctors/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/doctors/new/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/doctors/[id]/page.tsx`
- Create: `src/lib/actions/admin-hospitals.ts`
- Create: `src/lib/actions/admin-doctors.ts`

**Context:**
- Hospital form fields: name (multilingual), slug, description (multilingual), address (multilingual), city, accreditation (text), international_center (bool), languages (text array), phone, email, website, is_featured
- Hospital edit page also manages `hospital_procedures`: table of linked procedures with cost_min, cost_max, cost_currency, annual_volume, specialist_count, waiting_time_days, evidence_score, is_featured; inline add/remove procedure connections
- Doctor form fields: hospital_id (select), name (multilingual), slug, specialty (multilingual), experience_years, bio (multilingual), languages (text array)
- Image upload (logo_url, hero_image_url, photo_url): use `<input type="file">` → upload to Supabase Storage bucket `hospital-images` / `doctor-images`; store public URL in DB
- Supabase Storage upload pattern: `supabase.storage.from("hospital-images").upload(path, file)` → get public URL
- Server Actions: `createHospital`, `updateHospital`, `deleteHospital`, `upsertHospitalProcedure`, `removeHospitalProcedure`, `createDoctor`, `updateDoctor`, `deleteDoctor`
- Use `MultilingualInput` from Task 7

**Steps:**
- [ ] Create `admin-hospitals.ts` Server Actions
- [ ] Create `admin-doctors.ts` Server Actions
- [ ] Create `admin/hospitals/page.tsx` — list table with edit/delete actions
- [ ] Create `admin/hospitals/new/page.tsx` — create hospital form
- [ ] Create `admin/hospitals/[id]/page.tsx` — edit hospital + hospital_procedures management section
- [ ] Create `admin/doctors/page.tsx` — list with hospital filter
- [ ] Create `admin/doctors/new/page.tsx` — create doctor form
- [ ] Create `admin/doctors/[id]/page.tsx` — edit doctor form
- [ ] Add i18n keys under `"admin.hospitals"`, `"admin.doctors"`
- [ ] Update `features-checklist.json`: F-079, F-080 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 9: Admin Inquiry Management (F-081)

**Files:**
- Create: `src/app/[locale]/(backoffice)/admin/inquiries/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/inquiries/[id]/page.tsx`
- Create: `src/lib/actions/admin-inquiries.ts`

**Context:**
- Admin sees ALL inquiries (RLS: admin has full access)
- List: paginated (50/page), filter by status (`new`/`contacted`/`closed`), hospital, service
- Columns: name, email, phone, nationality, service, hospital, status, date
- Detail: all inquiry fields + status change + read-only message
- No notes column — just status change
- Server Action: `adminUpdateInquiryStatus(id, status)`

**Steps:**
- [ ] Create `admin-inquiries.ts` — `adminUpdateInquiryStatus` Server Action
- [ ] Create `admin/inquiries/page.tsx` — filtered list with status/hospital/service filters
- [ ] Create `admin/inquiries/[id]/page.tsx` — full detail + status change
- [ ] Add i18n keys under `"admin.inquiries"`
- [ ] Update `features-checklist.json`: F-081 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 10: Admin Hospital Account Management (F-082)

**Files:**
- Create: `src/app/[locale]/(backoffice)/admin/accounts/page.tsx`
- Create: `src/app/api/admin/accounts/route.ts`
- Create: `src/lib/actions/admin-accounts.ts` (for read operations)

**Context:**
- Creating hospital_staff accounts requires `supabase.auth.admin.createUser()` which needs `SUPABASE_SERVICE_ROLE_KEY`
- Pattern for service role client:
  ```ts
  import { createClient } from "@supabase/supabase-js";
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  ```
- This client is ONLY used in `src/app/api/admin/accounts/route.ts` — never in client components
- Account creation flow: POST to `/api/admin/accounts` → `adminClient.auth.admin.createUser({email, password, email_confirm: true})` → then update profile: `adminClient.from("profiles").update({role: "hospital_staff", hospital_id}).eq("id", newUser.id)`
- Account list: read from `profiles` where `role = 'hospital_staff'` — use regular admin Supabase client (admin RLS allows this)
- Deactivate: no built-in Supabase feature — set `role` back to `'patient'` as a proxy for deactivation, or just delete the auth user via `adminClient.auth.admin.deleteUser(id)`
- The `SUPABASE_SERVICE_ROLE_KEY` env var must be documented but the implementer cannot add it — note it as a prerequisite
- List columns: email, full_name, hospital name, created_at, action (deactivate)

**Steps:**
- [ ] Create `/api/admin/accounts/route.ts` — POST handler for account creation (service role); GET handler to list all `hospital_staff` profiles with hospital names
- [ ] Create `admin-accounts.ts` — `deactivateAccount(userId)` calls `/api/admin/accounts` DELETE or uses service role
- [ ] Create `admin/accounts/page.tsx` — list + create form + deactivate button
- [ ] Document `SUPABASE_SERVICE_ROLE_KEY` requirement in `.env.example`
- [ ] Add i18n keys under `"admin.accounts"`
- [ ] Update `features-checklist.json`: F-082 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Task 11: Admin Review Moderation (F-084)

**Files:**
- Create: `src/app/[locale]/(backoffice)/admin/reviews/page.tsx`
- Create: `src/app/[locale]/(backoffice)/admin/reviews/[id]/page.tsx`
- Create: `src/lib/actions/admin-reviews.ts`

**Context:**
- Admin sees ALL reviews regardless of status
- List: filter by status (`pending`/`approved`/`rejected`), hospital, rating; show title, author, hospital, rating, status, date
- Detail: full review content + media gallery + comments list + action buttons
- Actions: Approve (`status → 'approved'`), Reject (`status → 'rejected'`), Delete (hard delete), Toggle Verified (`is_verified` toggle), Delete Comment
- Server Actions: `approveReview(id)`, `rejectReview(id)`, `deleteReview(id)`, `toggleVerified(id, currentValue)`, `deleteComment(id)`
- Review comments deletion: admin can delete any comment — use service role or admin RLS (check: admin has ALL on review_comments per 006_rls_policies.sql)

**Steps:**
- [ ] Create `admin-reviews.ts` Server Actions for all review moderation operations
- [ ] Create `admin/reviews/page.tsx` — filtered list with approve/reject quick actions
- [ ] Create `admin/reviews/[id]/page.tsx` — full review detail + all action buttons + comments management
- [ ] Add i18n keys under `"admin.reviews"`
- [ ] Update `features-checklist.json`: F-084 → `done: true`, `status: "done"`
- [ ] Run `npm run build`
- [ ] Commit

---

## Verification

After all tasks:
1. `npm run build` — 0 type errors
2. Manually test in browser:
   - Main site still works: `/en/`, `/en/categories`, `/en/services/rhinoplasty`
   - `/en/hospital/dashboard` → redirects to login (no hospital_staff session)
   - `/en/admin/dashboard` → redirects to login (no admin session)
3. Set a user's role to `hospital_staff` in Supabase → login → confirm dashboard loads
4. Set a user's role to `admin` in Supabase → login → confirm admin dashboard loads
