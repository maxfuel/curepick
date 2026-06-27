# Admin Hospital — Procedure Picker Mega Menu

**Date:** 2026-06-27
**Status:** Approved

## Problem

The current "시술 추가" form uses a flat `<select>` dropdown with all procedures sorted alphabetically by English name. Admins cannot tell which category or service a procedure belongs to, making navigation extremely inefficient (especially with 50+ procedures).

## Goal

Replace the flat dropdown with an inline mega menu that exposes the full category → service → procedure hierarchy. The admin can browse by medical category, find the right service group, and click a procedure to select it — without leaving the page or opening a modal.

---

## UX Flow

**Step 1 — Browse (mega menu expanded, default state):**
```
┌ 카테고리 사이드바 ┬────── 서비스/시술 패널 ───────────────────┐
│ 성형             │  눈             코             가슴        │
│ 치과             │  • 쌍커풀        • 코끝 성형    • 가슴 확대  │
│ 피부             │  • 눈매교정      • 콧날 성형    [이미 추가]  │
│ 건강검진         │  • 안검하수      ...            ...         │
│ 모발이식         │  ...                                        │
└─────────────────┴─────────────────────────────────────────── ┘
```

**Step 2 — Procedure selected (mega menu collapses):**
```
선택됨: 쌍커풀 수술  [다시 선택]

최소가격  ___   최대가격  ___   통화  USD   연간건수  ___
[추가]
```

- 이미 추가된 시술: 회색 텍스트 + `cursor-not-allowed`, 클릭 불가
- [다시 선택] 클릭 → 메가메뉴 다시 펼침, 가격 필드 숨김
- 추가 성공 후 → 선택 초기화, 메가메뉴 다시 표시

---

## Architecture

### Data Fetching — `page.tsx` 변경

기존 flat 쿼리 제거:
```ts
// 제거
supabase.from("procedures").select("id, name").order("name->en")
```

새 3레벨 쿼리 추가 (공개 categories 페이지 패턴 재사용):
```ts
(supabase.from("categories") as any)
  .select(`
    id, name, intent_id,
    services(
      id, name, sort_order,
      procedures(id, name, sort_order)
    )
  `)
  .order("sort_order"),
supabase.from("intents").select("id, name, sort_order").order("sort_order"),
```

각 `name` 필드는 `getEn()` 로 영어명 추출 후 prop으로 전달.

### New Component — `ProcedureAddSection.tsx`

**위치:** `src/components/backoffice/admin/ProcedureAddSection.tsx`
**타입:** `"use client"`

**Props:**
```ts
interface ProcedureAddSectionProps {
  hospitalId: string;
  categories: {
    id: string;
    name: string;
    intentId: string | null;
    services: {
      id: string;
      name: string;
      procedures: { id: string; name: string }[];
    }[];
  }[];
  intents: { id: string; name: string }[];
  assignedProcedureIds: string[];
}
```

**State:**
```ts
const [selectedProcedure, setSelectedProcedure] = useState<{ id: string; name: string } | null>(null);
const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id ?? "");
const [isPending, startTransition] = useTransition();
```

**렌더링 로직:**
- `selectedProcedure === null` → 메가메뉴 렌더 (카테고리 사이드바 + 서비스/시술 패널)
- `selectedProcedure !== null` → 선택됨 배너 + 가격 입력 폼

**Server Action 호출:**
```ts
function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  startTransition(async () => {
    await upsertHospitalProcedure(formData);
    setSelectedProcedure(null); // reset to mega menu
  });
}
```

### `page.tsx` 변경

- `allProcedures`, `availableProcedures` 관련 코드 제거
- 기존 `<form action={upsertHospitalProcedure}>` 섹션 → `<ProcedureAddSection>` 로 교체
- 3레벨 쿼리 결과를 `getEn()` 로 변환 후 prop 전달

---

## Mega Menu Layout

- **사이드바:** 카테고리 목록, intent 그룹별 섹션 헤더 (CategoriesMegaMenu 와 동일 패턴)
- **패널:** 활성 카테고리의 서비스 컬럼 그리드 (`grid-cols-2 sm:grid-cols-3`)
  - 서비스명: 볼드 헤더
  - 시술: 클릭 가능한 버튼, `assignedProcedureIds`에 포함된 경우 회색 + 비활성
- **미니멈 높이:** `min-h-[320px]`로 패널이 너무 짧아지지 않도록

---

## Files Changed

| 파일 | 변경 |
|------|------|
| `src/app/[locale]/(backoffice)/admin/hospitals/[id]/page.tsx` | 쿼리 교체, ProcedureAddSection으로 교체 |
| `src/components/backoffice/admin/ProcedureAddSection.tsx` | 신규 생성 |

---

## Verification

1. `?tab=procedures` 접속 → 메가메뉴가 펼쳐진 상태로 표시됨
2. 카테고리 클릭 → 오른쪽 패널 업데이트 확인
3. 이미 추가된 시술 → 회색 + 클릭 불가 확인
4. 시술 클릭 → 메가메뉴 접힘, 시술명 + 가격 필드 표시 확인
5. 가격 입력 후 [추가] → 테이블에 추가되고 메가메뉴 초기화 확인
6. [다시 선택] → 메가메뉴 재오픈 확인
7. TypeScript 오류 없이 빌드 통과
