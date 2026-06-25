# Hospital Media Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give hospital staff a `/hospital/media` page where they can self-manage logo, hero image, photo gallery, and YouTube videos for their own hospital — without admin involvement.

**Architecture:** Three-task delivery: (1) server actions scoped to the authenticated hospital, (2) the page itself with four independent form sections, (3) sidebar nav entry + translation keys. Each task is independently deployable; later tasks import from earlier ones.

**Tech Stack:** Next.js App Router (Server Components + Server Actions), Supabase Admin Client for storage, `FileDropzone` + `YouTubePreviewInput` shared components, `next-intl` for translations.

## Global Constraints

- Every server action file must start with `"use server"`
- File uploads: use `createClient as createAdminClient` from `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY` + `await file.arrayBuffer()` — never the browser or server client
- `hospital_id` must always be derived from `getProfile()` server-side — never from form fields or URL params
- `revalidatePath()` must be called after every mutation
- Storage bucket: `hospital-images` (already exists; no need to create)
- `slugify()` is not needed here — slugs come from DB, not user input

---

### Task 1: Server Actions (`hospital-media.ts`)

**Files:**
- Create: `src/lib/actions/hospital-media.ts`

**Interfaces:**
- Produces: `updateHospitalLogo(formData)`, `updateHospitalHero(formData)`, `addHospitalGalleryImage(formData)`, `removeHospitalGalleryImage(formData)`, `addHospitalVideo(formData)`, `removeHospitalVideo(formData)` — all exported async server actions, no parameters other than `FormData`

- [ ] **Step 1: Create `src/lib/actions/hospital-media.ts`**

```ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/get-user";

const HOSPITAL_BUCKET = "hospital-images";

async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const ext = file.name.split(".").pop() ?? "jpg";
  const { data, error } = await admin.storage
    .from(HOSPITAL_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || `image/${ext}`,
      upsert: true,
    });
  if (error || !data) return null;
  return admin.storage.from(HOSPITAL_BUCKET).getPublicUrl(data.path).data.publicUrl;
}

function revalidateHospital(slug: string | null) {
  revalidatePath("/hospital/media");
  if (slug) revalidatePath(`/hospitals/${slug}`);
}

export async function updateHospitalLogo(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug")
    .eq("id", profile.hospital_id)
    .single();

  const file = formData.get("logo_file") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, `logos/${hospital?.slug ?? profile.hospital_id}-${Date.now()}.${ext}`);
  if (!url) return;

  await (supabase.from("hospitals") as any)
    .update({ logo_url: url })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function updateHospitalHero(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug")
    .eq("id", profile.hospital_id)
    .single();

  const file = formData.get("hero_file") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, `heroes/${hospital?.slug ?? profile.hospital_id}-${Date.now()}.${ext}`);
  if (!url) return;

  await (supabase.from("hospitals") as any)
    .update({ hero_image_url: url })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function addHospitalGalleryImage(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("gallery_images, slug")
    .eq("id", profile.hospital_id)
    .single();

  const file = formData.get("image_file") as File | null;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop();
  const url = await uploadImage(file, `gallery/${profile.hospital_id}-${Date.now()}.${ext}`);
  if (!url) return;

  const current = (hospital?.gallery_images as string[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ gallery_images: [...current, url] })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function removeHospitalGalleryImage(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("gallery_images, slug")
    .eq("id", profile.hospital_id)
    .single();

  const imageUrl = formData.get("image_url") as string;
  const current = ((hospital?.gallery_images as string[]) ?? []).filter((u) => u !== imageUrl);

  await (supabase.from("hospitals") as any)
    .update({ gallery_images: current })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function addHospitalVideo(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("videos, slug")
    .eq("id", profile.hospital_id)
    .single();

  const title = (formData.get("title") as string) || "";
  const url = (formData.get("url") as string) || "";
  const type = (formData.get("type") as string) || "general";
  if (!url) return;

  const current = (hospital?.videos as unknown[]) ?? [];
  await (supabase.from("hospitals") as any)
    .update({ videos: [...current, { title, url, type }] })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}

export async function removeHospitalVideo(formData: FormData) {
  const profile = await getProfile();
  if (!profile?.hospital_id) return;

  const supabase = await createClient();
  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("videos, slug")
    .eq("id", profile.hospital_id)
    .single();

  const index = Number(formData.get("index"));
  const current = ((hospital?.videos as unknown[]) ?? []).filter((_, i) => i !== index);

  await (supabase.from("hospitals") as any)
    .update({ videos: current })
    .eq("id", profile.hospital_id);

  revalidateHospital(hospital?.slug ?? null);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `hospital-media.ts`. (Existing `as any` casts on `supabase.from("hospitals")` are intentional — same pattern as `admin-hospitals.ts`.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/hospital-media.ts
git commit -m "feat: add hospital-media server actions (logo, hero, gallery, videos)"
git push origin main
```

---

### Task 2: Media Management Page

**Files:**
- Create: `src/app/[locale]/(backoffice)/hospital/media/page.tsx`

**Interfaces:**
- Consumes: all 6 actions from `src/lib/actions/hospital-media.ts`
- Consumes: `FileDropzone` from `src/components/ui/FileDropzone.tsx` (props: `name`, `accept`, `currentPreviewUrl?`, `label`)
- Consumes: `YouTubePreviewInput` from `src/components/ui/YouTubePreviewInput.tsx` (props: `name`, `defaultValue?`, `placeholder?`, `label?`, `className?`)
- Consumes: `getProfile()` from `src/lib/auth/get-user.ts`
- Consumes: `createClient` from `@/lib/supabase/server` (server Supabase client for read)

- [ ] **Step 1: Create `src/app/[locale]/(backoffice)/hospital/media/page.tsx`**

```tsx
import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { YouTubePreviewInput } from "@/components/ui/YouTubePreviewInput";
import {
  updateHospitalLogo,
  updateHospitalHero,
  addHospitalGalleryImage,
  removeHospitalGalleryImage,
  addHospitalVideo,
  removeHospitalVideo,
} from "@/lib/actions/hospital-media";

const VIDEO_TYPES = [
  { value: "general", label: "General" },
  { value: "facility", label: "Facility Tour" },
  { value: "doctor", label: "Doctor Introduction" },
  { value: "testimonial", label: "Patient Testimonial" },
];

export default async function HospitalMediaPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug, logo_url, hero_image_url, gallery_images, videos")
    .eq("id", profile!.hospital_id!)
    .single();

  const galleryImages: string[] = (hospital?.gallery_images as string[]) ?? [];
  const videos: { title: string; url: string; type: string }[] =
    (hospital?.videos as { title: string; url: string; type: string }[]) ?? [];

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">미디어 관리</h1>

      {/* ── Section 1: Logo ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">로고</h2>
          <p className="text-sm text-muted-foreground mt-1">
            검색 결과 및 병원 상세 페이지 상단에 표시됩니다.
          </p>
        </div>
        {hospital?.logo_url && (
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border bg-muted">
            <Image src={hospital.logo_url} alt="Logo" fill className="object-contain" />
          </div>
        )}
        <form action={updateHospitalLogo} className="space-y-3">
          <FileDropzone
            name="logo_file"
            accept="image/*"
            currentPreviewUrl={hospital?.logo_url ?? undefined}
            label={hospital?.logo_url ? "로고 교체" : "로고 업로드"}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            저장
          </button>
        </form>
      </section>

      {/* ── Section 2: Hero Image ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">히어로 이미지</h2>
          <p className="text-sm text-muted-foreground mt-1">
            병원 상세 페이지 최상단 대표 사진입니다. 가로 비율의 고화질 이미지를 권장합니다.
          </p>
        </div>
        {hospital?.hero_image_url && (
          <div className="relative h-40 w-full overflow-hidden rounded-lg border">
            <Image src={hospital.hero_image_url} alt="Hero" fill className="object-cover" />
          </div>
        )}
        <form action={updateHospitalHero} className="space-y-3">
          <FileDropzone
            name="hero_file"
            accept="image/*"
            currentPreviewUrl={hospital?.hero_image_url ?? undefined}
            label={hospital?.hero_image_url ? "히어로 이미지 교체" : "히어로 이미지 업로드"}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            저장
          </button>
        </form>
      </section>

      {/* ── Section 3: Photo Gallery ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">사진 갤러리</h2>
          <p className="text-sm text-muted-foreground mt-1">
            병원 상세 페이지 이미지 모자이크에 표시됩니다. 최대 20장을 권장합니다.
          </p>
        </div>

        {galleryImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((src, i) => (
              <div key={src} className="relative group aspect-square overflow-hidden rounded-lg border">
                <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                <form
                  action={removeHospitalGalleryImage}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                >
                  <input type="hidden" name="image_url" value={src} />
                  <button
                    type="submit"
                    className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-white hover:bg-destructive/90"
                  >
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addHospitalGalleryImage} className="space-y-3">
          <FileDropzone name="image_file" accept="image/*" label="사진 추가" />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            사진 추가
          </button>
        </form>
      </section>

      {/* ── Section 4: YouTube Videos ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">YouTube 영상</h2>
          <p className="text-sm text-muted-foreground mt-1">
            병원 소개, 시설 투어, 의사 소개, 환자 후기 영상을 등록하세요.
          </p>
        </div>

        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{v.title || "(제목 없음)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{v.url}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {VIDEO_TYPES.find((t) => t.value === v.type)?.label ?? v.type}
                </span>
                <form action={removeHospitalVideo}>
                  <input type="hidden" name="index" value={i} />
                  <button
                    type="submit"
                    className="shrink-0 text-destructive text-xs hover:underline"
                  >
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addHospitalVideo} className="space-y-3">
          <YouTubePreviewInput name="url" label="YouTube URL *" placeholder="https://youtube.com/watch?v=..." required />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">제목</label>
              <input
                name="title"
                type="text"
                placeholder="시설 투어 영상"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">유형</label>
              <select name="type" defaultValue="general" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                {VIDEO_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            영상 추가
          </button>
        </form>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/\(backoffice\)/hospital/media/page.tsx
git commit -m "feat: add /hospital/media page for self-service media management"
git push origin main
```

---

### Task 3: Sidebar Nav + Translation Keys

**Files:**
- Modify: `src/components/backoffice/hospital/HospitalSidebar.tsx` (add `media` entry)
- Modify: `messages/en.json` (add `"media"` key under `hospital.nav`)
- Modify: `messages/ko.json` (add `"media"` key)
- Modify: `messages/zh.json`, `messages/zh-TW.json`, `messages/ja.json`, `messages/ru.json`, `messages/ar.json`, `messages/uk.json`, `messages/kk.json`, `messages/it.json`, `messages/es.json`, `messages/id.json`, `messages/pt.json`, `messages/de.json`, `messages/fr.json`, `messages/pl.json` (add `"media"` key)

**Interfaces:**
- `HospitalSidebar.tsx` reads `t("media")` from `"hospital.nav"` namespace

- [ ] **Step 1: Add `media` to `HospitalSidebar.tsx`**

In `src/components/backoffice/hospital/HospitalSidebar.tsx`, change the `navItems` array from:

```ts
const navItems = [
  { key: "dashboard", href: "/hospital/dashboard" },
  { key: "inquiries", href: "/hospital/inquiries" },
  { key: "profile", href: "/hospital/profile" },
  { key: "doctors", href: "/hospital/doctors" },
  { key: "procedures", href: "/hospital/procedures" },
  { key: "reviews", href: "/hospital/reviews" },
] as const;
```

to:

```ts
const navItems = [
  { key: "dashboard", href: "/hospital/dashboard" },
  { key: "inquiries", href: "/hospital/inquiries" },
  { key: "profile", href: "/hospital/profile" },
  { key: "media", href: "/hospital/media" },
  { key: "doctors", href: "/hospital/doctors" },
  { key: "procedures", href: "/hospital/procedures" },
  { key: "reviews", href: "/hospital/reviews" },
] as const;
```

- [ ] **Step 2: Add `"media"` key to all translation files**

In each messages file, find the `"hospital": { "nav": { ... } }` block and add `"media"` with the following values:

| File | Value |
|---|---|
| `en.json` | `"Media"` |
| `ko.json` | `"미디어 관리"` |
| `zh.json` | `"媒体管理"` |
| `zh-TW.json` | `"媒體管理"` |
| `ja.json` | `"メディア管理"` |
| `ru.json` | `"Медиа"` |
| `ar.json` | `"الوسائط"` |
| `uk.json` | `"Медіа"` |
| `kk.json` | `"Медиа"` |
| `it.json` | `"Media"` |
| `es.json` | `"Multimedia"` |
| `id.json` | `"Media"` |
| `pt.json` | `"Mídia"` |
| `de.json` | `"Medien"` |
| `fr.json` | `"Médias"` |
| `pl.json` | `"Media"` |

For each file, the nav block currently ends with `"reviews": "..."`. Add the new key after `"profile"` or before `"reviews"` — placement in the nav object is order-independent.

Example diff for `en.json`:
```json
// Before:
"nav": {
  "dashboard": "Dashboard",
  "inquiries": "Inquiries",
  "profile": "Hospital Profile",
  "doctors": "Doctors",
  "procedures": "Procedures",
  "reviews": "Reviews"
}

// After:
"nav": {
  "dashboard": "Dashboard",
  "inquiries": "Inquiries",
  "profile": "Hospital Profile",
  "media": "Media",
  "doctors": "Doctors",
  "procedures": "Procedures",
  "reviews": "Reviews"
}
```

- [ ] **Step 3: Verify sidebar renders without error**

Start dev server and navigate to any `/hospital/*` page. Confirm "Media" (or localized equivalent) appears in the sidebar nav between "Profile" and "Doctors". Click it — confirm it navigates to `/hospital/media` and the page renders.

```bash
npm run dev
```

Open: `http://localhost:3000/ko/hospital/media` (log in as hospital staff first)

Expected: page renders with four sections (로고, 히어로 이미지, 사진 갤러리, YouTube 영상).

- [ ] **Step 4: Commit**

```bash
git add src/components/backoffice/hospital/HospitalSidebar.tsx messages/
git commit -m "feat: add Media nav item to hospital sidebar with translation keys"
git push origin main
```

---

## Verification Checklist (post-all-tasks)

Run through these manually after all three tasks are deployed:

- [ ] Hospital staff login → sidebar shows "미디어 관리" (ko) / "Media" (en)
- [ ] Upload logo → page reloads → logo preview updates → public `/hospitals/{slug}` shows new logo
- [ ] Upload hero → same flow
- [ ] Add gallery photo → appears in 4-col grid → public page gallery updates
- [ ] Hover over gallery photo → "삭제" button appears → click → photo removed from grid and public page
- [ ] Add YouTube URL → `YouTubePreviewInput` shows thumbnail → submit → appears in video list with type label
- [ ] Delete video → removed from list
- [ ] TypeScript: `npx tsc --noEmit` passes with no new errors
