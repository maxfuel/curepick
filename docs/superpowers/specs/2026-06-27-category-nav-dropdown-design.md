# 카테고리 네비게이션 드롭다운 + 언어별 간격 개선

**날짜**: 2026-06-27  
**상태**: 구현 완료

---

## 문제

1. **드롭다운 없음**: 카테고리 hover 시 하위 서비스가 표시되지 않아 사용자가 어떤 서비스가 있는지 한눈에 파악 불가
2. **언어별 레이아웃 파손**: 러시아어 등 긴 번역어에서 카테고리명이 2~3줄로 줄바꿈되어 헤더 높이 64px 초과

## 해결책

- **문제 1**: categories + services를 단일 DB JOIN fetch → `CategoryNavClient` (Client Component)에서 hover 상태 관리
- **문제 2**: `whitespace-nowrap max-w-[7.5rem] overflow-hidden text-ellipsis` — 드롭다운 헤더에 풀네임 표시로 UX 손실 없음

## 변경 파일

| 파일 | 변경 |
|------|------|
| `src/components/layout/Header.tsx` | services JOIN fetch 추가, CategoryNavClient 사용 |
| `src/components/layout/CategoryNavClient.tsx` | 신규 — hover 드롭다운 Client Component |
| `src/components/layout/CategoryNav.tsx` | 삭제 — 중복 Server Component 제거 |
