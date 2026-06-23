# Changelog

MVP+ 개발 완료 이후 진행되는 개선·수정 사항을 날짜별로 기록합니다.

형식: `Added` 새 기능 · `Fixed` 버그 수정 · `Improved` 기존 기능 개선 · `Removed` 제거

---

## [2026-06-24]

### Fixed
- **Admin > Doctors 목록** (`/admin/doctors`): Server Component에서 `<select onChange>` 핸들러 사용으로 발생하던 런타임 오류 수정 → `HospitalFilter` Client Component로 분리
- **Admin > Inquiries** (`/admin/inquiries`): 병원·서비스 필터 `<select onChange>` 핸들러 오류 수정 → `InquiryFilters` Client Component로 분리
- **Admin > Reviews** (`/admin/reviews`): 병원·별점 필터 `<select onChange>` 핸들러 오류 수정 → `ReviewFilters` Client Component로 분리
- **Admin > Doctors 수정/신규**, **Hospitals 수정/신규** (4개 페이지): Server Action 폼에 `encType="multipart/form-data"` 명시 시 발생하던 React 경고 수정 → 속성 제거 (React가 자동 처리)
- **홈페이지 500 에러**: `next/image`가 Supabase 이미지 도메인을 차단하던 문제 수정 → `next.config.ts`에 `images.remotePatterns` 추가
- **검색 다국어 지원**: 검색이 영어 필드만 검색하던 문제 수정 → Supabase `.or()` 에 `name->>ko`, `name->>zh`, `name->>ja` 필드도 포함 (`SearchBar.tsx`, `search/page.tsx`)
- **검색창 텍스트 색상**: Hero 배경 위 검색창 입력 텍스트가 검정으로 안보이던 문제 수정 → 흰색(`text-white`)으로 변경
- **DB Migration (010_site_settings.sql)**: `policy already exists` 오류 수정 → `DROP POLICY IF EXISTS` 추가. 이후 `site_settings` 테이블 자체를 제거하고 파일 기반으로 전환.

### Added
- **Header**: Admin·Hospital Staff 로그인 시 오른쪽 상단에 역할별 대시보드 이동 배지 표시
  - Admin → 주황 pill badge (`🟠 Admin`) → `/admin`
  - Hospital Staff → 파랑 pill badge (`🔵 Hospital`) → `/hospital`
  - 서버 사이드 role 체크 (하이드레이션 이슈 없음)
- **개발 환경**: `scripts/create-test-users.mjs` — Supabase Admin API로 테스트 계정 3개 생성 스크립트
  - `admin@test.curepick.com` / `Admin1234!` (role: admin)
  - `hospital@test.curepick.com` / `Hospital1234!` (role: hospital_staff, Gangnam Aesthetic Clinic A)
  - `user@test.curepick.com` / `User1234!` (role: null/일반 사용자)
- **홈 > Browse Categories 캐러셀** (`src/components/cards/CategoryCarousel.tsx`): 카테고리 그리드를 좌우 스크롤 캐러셀로 교체
  - 2행 × N열 CSS Grid (`grid-auto-flow: column`)
  - 좌·우 화살표 버튼 (sm 이상에서 표시)
  - `requestAnimationFrame` + `easeInOutCubic` 커스텀 부드러운 스크롤 애니메이션 (520ms)
  - 스크롤바 숨김 처리 (`scrollbarWidth: none` + `[&::-webkit-scrollbar]:hidden`)
- **홈 > CTA 버튼**: WhatsApp 상담 / WeChat 상담 버튼 추가 (`src/components/ui/ContactButtons.tsx`)
  - WhatsApp: `https://wa.me/{number}` 링크
  - WeChat: 클릭 시 WeChat ID 표시 (alert, 추후 QR 모달로 업그레이드 예정)
  - 연락처 정보: `WHATSAPP_NUMBER`, `WECHAT_ID` 상수로 파일 상단에 정의 (실제 값으로 교체 필요)
- **Hero 이미지 파일 기반 저장** (`src/lib/site-settings.ts`, `data/site-settings.json`):
  - 매 요청마다 DB 조회하는 대신 `data/site-settings.json`에 hero_image_url 저장
  - Admin이 이미지를 올릴 때만 파일 업데이트 + `revalidatePath` 호출
  - **주의**: Vercel 배포 시 `fs.writeFileSync` 불가 → Supabase 테이블 + `unstable_cache` 방식으로 전환 필요 (미해결)

### Improved
- **Category 상세** (`/categories/[slug]`): Popular Procedures 태그 클릭 시 해당 시술의 Service 상세 페이지로 이동 (기존: 링크 없는 Badge)
- **Doctor 상세** (`/doctors/[slug]`): Specialty Procedures 태그 클릭 시 Service 상세 페이지로 이동
- **Hospital 상세** (`/hospitals/[slug]`): Supported Procedures 카드 전체 클릭 시 Service 상세 페이지로 이동 (hover 효과 추가)
- **Category 상세 Hero 색상**: 베이지 배경 → 시원한 그라디언트 `from-sky-700 to-indigo-900` 으로 변경
- **홈 Hero 타이틀**: 모든 언어에서 한 줄로 표시 (`whitespace-nowrap`, `text-xl sm:text-3xl md:text-4xl lg:text-5xl`)
  - ko: "최고의 한국 의료를 경험해 보세요"
  - en: "Experience Korea's Best Care"
  - zh: "体验韩国顶级医疗服务"
  - ja: "韓国最高の医療を体験する"
- **Browse Categories 타이틀**: 가운데 정렬 (`text-center`)

### Removed
- **홈 > Intent Section** ("무엇을 찾고 계신가요?"): 불필요한 섹션 제거
- **홈 > "전체 카테고리 보기" 링크**: 캐러셀 도입으로 필요없어져 제거

---
