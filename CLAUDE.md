
# Global AI OS Inheritance

Before applying project-specific rules, load:

1. ../_global/GLOBAL_HOME.md
2. ../_global/GLOBAL_AGENTS.md
3. ../_global/GLOBAL_DECISION_LOG.md

@AGENTS.md

## Feature Checklist Rule
기능 구현 완료 후 반드시 features-checklist.json을 업데이트할 것:
- 완료된 task의 "done"을 true로 변경
- 모든 task가 완료되면 feature의 "status"를 "done"으로 변경

---

## Supabase Client Rules

Three clients exist — use the right one:

| Client | Import | When to use |
|--------|--------|-------------|
| Browser | `@/lib/supabase/client` | Client Components only |
| Server | `@/lib/supabase/server` | Server Components, Route Handlers |
| Admin | `createClient` from `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY` | Server Actions that bypass RLS (storage uploads, admin writes) |

Never use `SUPABASE_SERVICE_ROLE_KEY` in Client Components.

---

## Server Action Rules

- Every server action file must start with `"use server"`
- Call `revalidatePath()` after any mutation
- File uploads in Server Actions: use Admin client + `arrayBuffer()` pattern (not `File` directly)
- Server Actions body size limit is 10mb — do not increase without updating `next.config.ts`

---

## Slug Rules

Any field named `slug` must pass through `slugify()` before saving — including manually entered values.

```ts
function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
```

---

## Multilingual Field Rules

Multilingual text fields are stored as JSON: `{ en: "", ko: "", zh: "", ja: "" }`.

- Use `parseMultilingual()` to safely read these fields
- Never store a plain string in a multilingual column
- Display order: `ko` first for Korean users, `en` as fallback

---

## Language Rules

| Context | Language |
|---------|----------|
| Code, variable names, file names | English |
| Comments, commit messages | English |
| Responses to the user | Korean |

---

## Hospital Portal Philosophy

병원 포털(`/hospital/*`)은 병원이 자신의 콘텐츠를 직접 관리하는 공간이다.

- **병원 콘텐츠는 병원이 직접 관리한다** — 사진, 영상, 의사 정보, 시술 가격 등
- **Admin은 거버넌스/모더레이션만 담당** — 콘텐츠 입력/편집은 병원 스태프 몫
- **새 기능 설계 시:** "병원 스태프가 직접 할 수 있는가?" 를 먼저 확인할 것
- **보안:** 병원 스태프 서버 액션은 반드시 `getProfile()`로 `hospital_id`를 서버에서 검증해야 함 — URL param 또는 form field의 `hospital_id`를 신뢰하지 말 것
- **병원 스태프용 서버 액션 위치:** `src/lib/actions/hospital-*.ts`

---

## UI Component Rules

- All file upload inputs must use `FileDropzone` (`src/components/ui/FileDropzone.tsx`)
  - Supports drag & drop, click-to-open, image preview, multi-file display
  - Pass `currentPreviewUrl` on edit forms to show the existing file before replacement
  - Pass `onChange` callback when the form manages state (e.g. ReviewForm)
- YouTube URL inputs must use `YouTubePreviewInput` (`src/components/ui/YouTubePreviewInput.tsx`)
  - Shows thumbnail once a valid YouTube URL is typed
  - Clicking the thumbnail plays the video inline (iframe embed)

---

## Git Push Rule

**커밋 후 반드시 즉시 push할 것.**

- `git commit` 직후 항상 `git push origin main` 실행
- 절대 커밋만 하고 push 없이 세션을 끝내지 말 것
- Vercel은 GitHub 기준으로 배포 — 로컬 커밋은 push 전까지 배포에 반영되지 않음
