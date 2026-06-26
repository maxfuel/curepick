# Cure Partner Header & Frontend Indicator

**Date:** 2026-06-27

## Problem

`/cure-partner/dashboard`에 상단 헤더가 없어 로그인 정보, 언어 변경, 로그아웃을 이용할 수 없다.
또한 프론트엔드 헤더에 cure_partner 역할 사용자가 로그인해도 백오피스 진입 링크가 표시되지 않는다.

## Solution

### 1. Cure Partner 백오피스 헤더

`AdminHeader` 재사용 — `ROLE_LABELS`/`ROLE_COLORS`에 `cure_partner`(보라색)가 이미 정의되어 있어 별도 컴포넌트 불필요.

**변경 파일:** `src/app/[locale]/(backoffice)/cure-partner/layout.tsx`

`BackofficeShell` children 첫 번째로 `AdminHeader` 추가 (admin layout과 동일 패턴):
```tsx
<BackofficeShell sidebar={<CurePartnerSidebar />}>
  <AdminHeader email={profile.email!} role={profile.role!} fullName={profile.full_name} />
  {children}
</BackofficeShell>
```

결과: 좌측 Curepick 링크 / 우측 언어변경 + 보라색 "Cure Partner" 뱃지 + 이름 + 로그아웃

### 2. 프론트엔드 헤더 cure_partner 링크

**변경 파일:** `src/components/layout/Header.tsx`

admin(amber), hospital_staff(blue)과 동일한 pill 스타일로 추가:
```tsx
{role === "cure_partner" && (
  <Link
    href="/cure-partner"
    className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100"
  >
    <Stethoscope className="size-3" />
    Cure Partner
  </Link>
)}
```

## Files Changed

| File | Change |
|------|--------|
| `src/app/[locale]/(backoffice)/cure-partner/layout.tsx` | AdminHeader import + render |
| `src/components/layout/Header.tsx` | cure_partner role → backoffice link |
