# Drag-and-Drop Sort Order — Admin Backoffice

**Date:** 2026-06-27  
**Status:** Approved

## Problem

백오피스 테이블에는 `sort_order` 컬럼이 있지만 순서를 바꾸려면 각 레코드 편집 폼에 들어가 숫자를 직접 입력해야 한다. 직관적이지 않고 실수가 잦다. 드래그로 순서를 바꾸고 저장 버튼 한 번으로 반영되는 UX가 필요하다.

---

## Scope

| 페이지 | 테이블 UI | DB 컬럼 |
|--------|-----------|---------|
| `admin/services?tab=categories` | 카테고리 목록 | `categories.sort_order` |
| `admin/services?tab=services` | 카테고리별 서비스 그룹 (그룹마다 별도 테이블) | `services.sort_order` |
| `admin/services/[id]` | 시술 목록 | `procedures.sort_order` |

---

## Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- React 18 / Next.js 15 App Router 호환
- ~10kb gzipped, 트리-쉐이킹 가능
- Client Component 내에서만 사용 — Server Components와 충돌 없음
- 드래그 핸들 아이콘: `lucide-react`의 `GripVertical` (이미 설치됨)

---

## Architecture

### 새 컴포넌트: `src/components/ui/SortableList.tsx`

```tsx
"use client";

interface SortableItem { id: string }

interface Props<T extends SortableItem> {
  items: T[];
  renderCells: (item: T, index: number) => React.ReactNode; // <td>...</td> 반환
  onSave: (items: { id: string; sort_order: number }[]) => Promise<void>;
  colSpan: number;   // 저장 버튼 행 colspan
  saveLabel?: string; // default "저장"
}
```

**내부 동작:**
1. `items` prop을 로컬 state로 복사 (드래그 중 reorder 반영용)
2. `DndContext` + `SortableContext(verticalListSortingStrategy)` 로 tbody wrap
3. `onDragEnd` → `arrayMove()` 로 로컬 state 재정렬 → `isDirty = true`
4. 각 row: `useSortable(id)` 로 드래그 리스너 + `GripVertical` 핸들 첫 번째 `<td>`
5. 저장 버튼: `isDirty`일 때 활성화, 클릭 시 `onSave` 호출
6. 저장 완료: "✓ 저장완료" 3초 표시 후 초기화 (SaveForm과 동일 패턴)

**renderCells 계약:** `<td>` 요소를 반환. `SortableList`가 drag handle `<td>`를 맨 앞에 자동 추가.

---

### 새 서버 액션: `src/lib/actions/admin-services.ts` 에 추가

```ts
export async function reorderCategories(
  items: { id: string; sort_order: number }[]
): Promise<void>

export async function reorderServices(
  items: { id: string; sort_order: number }[]
): Promise<void>

export async function reorderProcedures(
  items: { id: string; sort_order: number }[]
): Promise<void>
```

각각 Supabase `upsert` 또는 `Promise.all` + `update().eq("id", ...)` 패턴으로 bulk 업데이트.  
완료 후 `revalidatePath()` 호출.

---

## UX 흐름

```
드래그 전:
[≡] Ultherapy    | ultherapy    | 1 | ✓ | 수정 삭제
[≡] Thermage     | thermage     | 2 | ✓ | 수정 삭제
[≡] Rejuran      | rejuran      | 3 |   | 수정 삭제
                                    [ 저장 ]  ← 회색(비활성)

드래그 후 (Rejuran을 맨 위로):
[≡] Rejuran      | rejuran      | 1 |   | 수정 삭제
[≡] Ultherapy    | ultherapy    | 2 | ✓ | 수정 삭제
[≡] Thermage     | thermage     | 3 | ✓ | 수정 삭제
                                    [ 저장 ]  ← 파란색(활성)

저장 클릭:
                                  [ 저장 중... ]

저장 완료:
                                  ✓ 저장완료   ← 3초 후 버튼 복귀
```

- "순서" 컬럼 숫자는 드래그 후 즉시 새 인덱스(index + 1)로 업데이트
- 저장하지 않고 페이지 이동 시 변경 취소 (로컬 state만 바뀐 상태)
- 서비스 탭: 카테고리 그룹마다 독립적인 저장 버튼

---

## 변경 파일 요약

| 파일 | 변경 유형 |
|------|----------|
| `package.json` | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` 추가 |
| `src/components/ui/SortableList.tsx` | 신규 생성 |
| `src/lib/actions/admin-services.ts` | `reorderCategories`, `reorderServices`, `reorderProcedures` 추가 |
| `src/app/[locale]/(backoffice)/admin/services/page.tsx` | 카테고리 탭 + 서비스 탭 테이블 → SortableList 사용 (Client Component 분리 필요) |
| `src/app/[locale]/(backoffice)/admin/services/[id]/page.tsx` | 시술 테이블 → SortableList 사용 |

### 주의: Server Component → Client Component 분리

`admin/services/page.tsx`는 현재 Server Component. `SortableList`(Client)를 포함하려면 테이블 부분을 별도 Client Component로 분리해야 한다.

- `src/components/backoffice/admin/CategoriesSortableTable.tsx` (신규)
- `src/components/backoffice/admin/ServicesSortableTable.tsx` (신규)

데이터 fetch는 page.tsx(Server)에서 하고, props로 Client Component에 전달.

---

## 검증

1. 카테고리 탭에서 항목 드래그 → 순서 숫자 변경 확인
2. 저장 버튼 클릭 → "✓ 저장완료" 표시 후 페이지 새로고침 → 순서 유지 확인
3. 서비스 탭 각 카테고리 그룹의 서비스 드래그 → 그룹별 독립 저장 버튼 동작 확인
4. `services/[id]` 시술 목록 드래그 → 저장 후 순서 유지 확인
5. TypeScript 오류 없이 빌드 통과
6. 모바일: `@dnd-kit`의 기본 PointerSensor는 touch 지원
