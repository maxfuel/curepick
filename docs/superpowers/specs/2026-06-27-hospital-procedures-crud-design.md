# 당사시술 관리 UI — Design Spec

**Date:** 2026-06-27  
**Status:** Approved

## Context

현재 `hospital_procedures` 테이블은 DB와 프론트엔드 표시까지 완성되어 있으나, 병원 스태프가 직접 생성·편집·삭제할 수 있는 관리 UI가 없다. Admin이 수동으로 넣어줘야 하는 구조.

추가로 `hospital_procedures`에는 커스텀 이름 필드가 없어 전역 시술명만 표시된다. 병원이 고유 이름과 차별점을 붙일 수 없는 상태.

이 스펙은 병원 스태프가 당사시술을 직접 관리하는 기능을 정의한다.

## 계층 구조

```
카테고리 → 서비스 → 시술[전역, Admin 관리]
                        ↓ inherit
               당사시술[hospital_procedures, 병원별 관리] ← 이번 구현 대상
                        ↓
                     패키지[미래 구현]
```

## Scope

### DB 변경
- `hospital_procedures` 테이블에 컬럼 3개 추가 (Supabase 마이그레이션)

### 서버 액션
- `src/lib/actions/hospital-procedures.ts` 신규 생성

### 병원 포털 UI (3개 페이지)
- `src/app/[locale]/(backoffice)/hospital/procedures/page.tsx` — 목록 (읽기 전용 → CRUD)
- `src/app/[locale]/(backoffice)/hospital/procedures/new/page.tsx` — 추가 폼
- `src/app/[locale]/(backoffice)/hospital/procedures/[id]/edit/page.tsx` — 편집 폼

### 프론트엔드 표시
- `src/app/[locale]/(main)/hospitals/[slug]/page.tsx` — 커스텀 이름·차별점 표시

---

## DB 스키마

### Migration: `016_hospital_procedure_fields.sql`

```sql
ALTER TABLE hospital_procedures
  ADD COLUMN name JSONB,
  ADD COLUMN differentiator_summary JSONB,
  ADD COLUMN differentiator_bullets JSONB DEFAULT '[]'::jsonb;
```

**컬럼 설명:**

| 컬럼 | 타입 | 예시 |
|---|---|---|
| `name` | `JSONB \| null` | `{"ko": "울쎄라 스페셜 케어", "en": "Ulthera Special Care"}` |
| `differentiator_summary` | `JSONB \| null` | `{"ko": "FDA 장비와 전문의 직접 시술", "en": "FDA devices, doctor-performed only"}` |
| `differentiator_bullets` | `JSONB` (array) | `[{"ko": "FDA 인증 장비", "en": "FDA-certified device"}, ...]` |

- `name`이 null이면 전역 `procedures.name` 사용 (하위 호환)
- `differentiator_bullets`는 각 element가 다국어 JSON 객체인 배열

---

## 서버 액션

**파일:** `src/lib/actions/hospital-procedures.ts`

```ts
"use server";

// createHospitalProcedure(formData: FormData): Promise<void>
// - getProfile()로 hospital_id 서버 검증 (URL param 신뢰 금지)
// - procedure_id, name(JSON), cost_min, cost_max, cost_currency,
//   differentiator_summary(JSON), differentiator_bullets(JSON[]) 파싱
// - supabase server client로 insert
// - revalidatePath("/hospital/procedures")

// updateHospitalProcedure(id: string, formData: FormData): Promise<void>
// - getProfile()로 hospital_id 검증 + 해당 record의 hospital_id 일치 확인
// - 위 필드들 update
// - revalidatePath("/hospital/procedures")

// deleteHospitalProcedure(id: string): Promise<void>
// - getProfile()로 hospital_id 검증 + record 소유권 확인
// - delete
// - revalidatePath("/hospital/procedures")
```

**보안 원칙 (CLAUDE.md):**  
`hospital_id`는 반드시 `getProfile()`에서 서버 검증. form field나 URL param의 hospital_id 사용 금지.

---

## 병원 포털 UI

### 목록 페이지 (`/hospital/procedures`)

- 현재 읽기 전용 목록을 CRUD 목록으로 업그레이드
- 상단 우측: "당사시술 추가" 버튼 → `/hospital/procedures/new`
- 테이블 각 행: 시술명(커스텀명 우선, 없으면 전역명), 가격 범위, 편집 버튼, 삭제 버튼
- 삭제는 서버 액션 직접 호출 (confirm dialog)

### 추가 폼 (`/hospital/procedures/new`)

**입력 필드:**

1. **전역 시술 선택** (필수) — 서비스별 그룹 `<select>` 또는 Combobox
   - 서버에서 `procedures → services → categories` 조인하여 그룹화
2. **커스텀 이름** (선택)
   - KO, EN 각각 텍스트 입력
3. **가격**
   - 최솟값, 최댓값 (숫자), 통화 (KRW / USD / EUR 등)
4. **한 줄 차별점 요약** (선택)
   - KO, EN 각각 텍스트 입력
5. **차별점 불릿 포인트** (선택, 동적 추가/삭제)
   - 각 항목: KO + EN 입력 쌍
   - "+ 항목 추가" / "✕ 삭제" 버튼

**폼 제출:** `createHospitalProcedure` 서버 액션 → 성공 시 `/hospital/procedures`로 redirect

### 편집 폼 (`/hospital/procedures/[id]/edit`)

- 추가 폼과 동일한 필드, 기존 값 pre-fill
- 전역 시술은 변경 불가 (표시만, select 비활성화)
- 폼 제출: `updateHospitalProcedure` → 성공 시 `/hospital/procedures`로 redirect

---

## 프론트엔드 표시

**파일:** `src/app/[locale]/(main)/hospitals/[slug]/page.tsx`

현재 시술명 표시 로직:
```ts
// 현재: procedures.name 사용
// 변경: hospital_procedures.name이 있으면 우선 사용
const displayName = getLocalizedField(hp.name, locale) 
  || getLocalizedField(hp.procedures.name, locale);
```

차별점이 있는 경우 시술 목록에 요약 한 줄 표시:
```tsx
{hp.differentiator_summary && (
  <p className="text-xs text-muted-foreground mt-0.5">
    {getLocalizedField(hp.differentiator_summary, locale)}
  </p>
)}
```

불릿 포인트는 시술 상세 확장 영역(또는 툴팁)에 표시 — 병원 상세 페이지 레이아웃에 맞게 조정.

---

## 다국어 입력 범위

병원 스태프는 **KO + EN** 2개 언어만 입력. ZH, JA는 추후 번역 기능 추가 시 처리.  
(`parseMultilingual()` 패턴 — 없는 언어는 EN fallback)

---

## Verification

1. 병원 스태프 로그인 → `/hospital/procedures` → "당사시술 추가" 클릭
2. 전역 시술 선택 + 커스텀 이름 입력 + 가격 입력 + 차별점 입력 → 저장
3. 목록에서 커스텀 이름으로 표시 확인
4. 편집 → 수정 → 반영 확인
5. 삭제 확인
6. `/hospitals/[slug]` 프론트에서 커스텀 이름 + 차별점 요약 표시 확인
7. 다른 병원 스태프 계정으로 타 병원의 시술 수정 시도 → 403/redirect 확인
