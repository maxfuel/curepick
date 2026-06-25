# Hospital Media Management — Design Spec

**Date:** 2026-06-26  
**Status:** Approved  
**Scope:** Hospital staff self-service for photos and videos

---

## Problem

Hospital staff cannot currently upload or manage any visual content for their own page. All media (logo, hero image, gallery photos, YouTube videos) must go through an admin request. This creates friction and prevents hospitals from independently advertising their services.

## Goal

Give hospital staff a dedicated `/hospital/media` page where they can fully manage all visual content for their own hospital page — without admin involvement.

---

## Architecture

### New route
`src/app/[locale]/(backoffice)/hospital/media/page.tsx`

Server Component. Fetches the hospital record using `profile.hospital_id` (from `getProfile()`), renders four sections as independent `<form>` elements each posting to a dedicated server action.

### New server actions
`src/lib/actions/hospital-media.ts`

All actions:
1. Call `getProfile()` to get the authenticated user's `hospital_id` — never trust a client-supplied ID
2. Use Admin client (`createAdminClient` + `SUPABASE_SERVICE_ROLE_KEY`) + `arrayBuffer()` for file uploads (same pattern as `admin-hospitals.ts`)
3. Call `revalidatePath()` after mutation

| Action | Purpose | Storage path |
|---|---|---|
| `updateHospitalLogo` | Replace logo image | `hospital-images/logos/{slug}-{ts}.{ext}` |
| `updateHospitalHero` | Replace hero image | `hospital-images/heroes/{slug}-{ts}.{ext}` |
| `addHospitalGalleryImage` | Add one gallery photo | `hospital-images/gallery/{slug}-{ts}.{ext}` |
| `removeHospitalGalleryImage` | Remove one gallery photo by URL | (DB update only, removes URL from `gallery_images[]`) |
| `addHospitalVideo` | Add YouTube video entry | (DB update only, appends to `videos` JSONB) |
| `removeHospitalVideo` | Remove video by index | (DB update only) |

These mirror the admin actions in `admin-hospitals.ts` but are scoped by authenticated `hospital_id`.

### Sidebar nav
Add "미디어 관리" item to `src/components/backoffice/hospital/HospitalSidebar.tsx`.

---

## Page Layout

```
/hospital/media
│
├── [섹션 1] 로고
│   ├── 현재 로고 미리보기 (56×56px)
│   └── FileDropzone name="logo_file" accept="image/*"
│       + [업로드] 버튼
│
├── [섹션 2] 히어로 이미지
│   ├── 현재 히어로 이미지 (16:9 preview, h-32)
│   └── FileDropzone name="hero_file" accept="image/*"
│       + [업로드] 버튼
│
├── [섹션 3] 사진 갤러리
│   ├── 현재 사진 그리드 (4-col, aspect-square)
│   │   └── 각 사진 위에 [삭제] 버튼 (hover 시 표시)
│   └── FileDropzone name="image_file" accept="image/*"
│       + [사진 추가] 버튼
│
└── [섹션 4] YouTube 영상
    ├── 현재 영상 목록 (title, type, URL 미리보기 카드)
    │   └── 각 항목 [삭제] 버튼
    └── YouTubePreviewInput name="url"
        + Title 입력 + Type 선택 (General/Facility/Doctor/Testimonial)
        + [영상 추가] 버튼
```

---

## Security

- `getProfile()` is called server-side in every action — the `hospital_id` is derived from the authenticated session, never from user input
- Hospital staff can only modify their own hospital's data
- File uploads go to the shared `hospital-images` bucket (same as admin); path includes the hospital slug for traceability

---

## Components Reused

- `FileDropzone` (`src/components/ui/FileDropzone.tsx`) — drag & drop upload
- `YouTubePreviewInput` (`src/components/ui/YouTubePreviewInput.tsx`) — URL + inline preview
- `getProfile()` (`src/lib/auth/get-user.ts`) — server-side auth/profile lookup

---

## What Is NOT in Scope

- Editing basic hospital info text (name, address, contact) — separate feature
- Doctor management — separate feature
- Procedure/pricing management — separate feature
- Multi-file gallery upload in one form submission — one photo per submit (same as admin)

---

## Verification

1. Hospital staff login → sidebar shows "미디어 관리" → `/hospital/media` accessible
2. Upload logo → page reloads → logo preview updates → public hospital page shows new logo
3. Upload hero → same flow
4. Add gallery photo → appears in grid → public hospital page gallery updates
5. Delete gallery photo → removed from grid and public page
6. Add YouTube URL → YouTubePreviewInput shows thumbnail → submit → appears in video list
7. Delete video → removed from list
8. Cannot access another hospital's data (verify `hospital_id` scoping)
