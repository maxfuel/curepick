# Hospital Portal Header — Design Spec

**Date:** 2026-06-27  
**Status:** Approved

## Context

`/hospital/*` 포털(병원 스태프 전용)에 `AdminHeader`가 누락되어 있다.  
`cure-partner` 및 `partner` 레이아웃과 달리 `hospital/layout.tsx`에는 헤더가 없어 스태프가 자신의 역할·병원을 확인하거나 로그아웃·언어 전환을 할 수 없는 상태.

프론트엔드 `Header.tsx`의 `hospital_staff` 로그인 pill과 Local Agent 어드민의 `AdminHeader`는 이미 정상 구현되어 있어 변경 불필요.

## Scope

변경 파일 2개:
1. `src/components/backoffice/admin/AdminHeader.tsx`
2. `src/app/[locale]/(backoffice)/hospital/layout.tsx`

## Design

### AdminHeader — `subtitle` prop 추가

```ts
interface AdminHeaderProps {
  email: string;
  role: string;
  fullName?: string | null;
  subtitle?: string | null;  // 병원명 (optional)
}
```

이름 표시 영역:
- `subtitle` 있음 → `{fullName} · {subtitle}` (예: `홍길동 · 서울성모병원`)
- `subtitle` 없음 → 기존처럼 `fullName` 또는 `email`만 표시

`subtitle`이 없는 기존 호출부(admin/cure-partner/partner layout)는 변경 없음.

### hospital/layout.tsx — AdminHeader 추가

```tsx
// 기존 profile 조회 후 병원명 추가 조회
const { data: hospital } = await supabase
  .from("hospitals")
  .select("name")
  .eq("id", profile.hospital_id!)
  .single();

// BackofficeShell 안에 AdminHeader 삽입
<BackofficeShell sidebar={<HospitalSidebar locale={locale} />}>
  <AdminHeader
    email={profile.email!}
    role={profile.role!}
    fullName={profile.full_name}
    subtitle={hospital?.name ?? null}
  />
  {children}
</BackofficeShell>
```

## Result

병원 포털 헤더:
```
[Curepick ↗]   [Hospital Staff] 홍길동 · 서울성모병원   [언어]  [로그아웃]
```

role pill 색상: `bg-green-500/10 text-green-700` (AdminHeader에 이미 정의됨)

## Verification

1. `hospital_staff` 계정으로 `/hospital/dashboard` 접속 → 헤더에 green "Hospital Staff" pill + 스태프명 · 병원명 확인
2. 언어 전환 버튼 동작 확인
3. 로그아웃 → `/login` 리다이렉트 확인
4. 기존 admin/cure-partner/partner 헤더 — 레그레션 없음 확인
