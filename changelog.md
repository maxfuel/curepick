# Changelog

MVP+ 개발 완료 이후 진행되는 개선·수정 사항을 날짜별로 기록합니다.

형식: `Added` 새 기능 · `Fixed` 버그 수정 · `Improved` 기존 기능 개선 · `Removed` 제거

---

## [2026-06-26]

### Added
- **`FileDropzone` 공유 컴포넌트** (`src/components/ui/FileDropzone.tsx`): 모든 파일 업로드 입력에 drag & drop 지원
  - DataTransfer API로 드롭한 파일을 native input에 주입 → Server Action form 제출 정상 작동
  - `URL.createObjectURL`로 즉시 이미지 미리보기, `useRef`로 URL 정리(메모리 누수 방지)
  - Props: `name`, `accept`, `multiple`, `maxFiles`, `currentPreviewUrl`, `onChange`, `label`
- **`YouTubePreviewInput` 공유 컴포넌트** (`src/components/ui/YouTubePreviewInput.tsx`): YouTube URL 입력 + 썸네일 미리보기
  - 정규식으로 `watch?v=`, `youtu.be/`, `embed/` 형식 모두 파싱
  - 썸네일 클릭 시 `autoplay=1` iframe으로 인라인 재생
- **`HospitalPhotoMosaic` 컴포넌트** (`src/components/hospitals/HospitalPhotoMosaic.tsx`): Bookimed 벤치마크 이미지 모자이크 레이아웃
  - 데스크탑: `grid-cols-[3fr_2fr]` — 좌측 히어로 + 우측 2×2 갤러리 그리드
  - 모바일: 히어로 단독 full-width (기존과 동일)
  - 내장 라이트박스 (← → Esc 키보드 네비게이션), "+N 사진 더 보기" 오버레이
- **병원 Doctor 사진 업로드 수정** (`src/lib/actions/admin-doctors.ts`): Service Role client + `arrayBuffer()` 패턴 적용, `ensureDoctorBucket()` 추가
- **Doctor 사진 크기 확대**: `DoctorCard.tsx` 64px → 96px (1.5×), `/doctors/[slug]` 페이지 `rounded-full` → `rounded-xl` (얼굴 잘림 방지)
- **병원 포털 철학 + UI 컴포넌트 규칙 CLAUDE.md 추가**: Hospital Portal Philosophy, FileDropzone/YouTubePreviewInput 의무 사용 규칙
- **병원 미디어 자체 관리 페이지** (`src/app/[locale]/(backoffice)/hospital/media/page.tsx`): 병원 스태프가 직접 미디어 관리
  - 4개 섹션: 로고 / 히어로 이미지 / 사진 갤러리 / YouTube 영상
  - 갤러리: 4열 그리드, hover 시 삭제 버튼
  - 영상: 제목·유형 입력 + YouTubePreviewInput, 영상 목록 카드형
- **`hospital-media.ts` 서버 액션** (`src/lib/actions/hospital-media.ts`): 6개 액션 — 모두 `getProfile()`로 `hospital_id` 서버 검증
  - `updateHospitalLogo`, `updateHospitalHero`, `addHospitalGalleryImage`, `removeHospitalGalleryImage`, `addHospitalVideo`, `removeHospitalVideo`
- **병원 사이드바 "미디어 관리" 네비 추가** (`HospitalSidebar.tsx`) + 16개 언어 번역 키

### Improved
- **Admin 병원 관리 폼** (`/admin/hospitals/[id]`, `/admin/hospitals/new`): 모든 파일 입력 → `FileDropzone`, YouTube URL → `YouTubePreviewInput`으로 교체
- **리뷰 폼** (`ReviewForm.tsx`): 사진·영상 첨부 → `FileDropzone`으로 교체
- **Cure Partner 폼** (`CurePartnersClient.tsx`): `intro_video_url` → `YouTubePreviewInput`으로 교체
- **사이트 설정 Hero 폼** (`/admin/settings`): → `FileDropzone`으로 교체
- **병원 상세 Hero** (`/hospitals/[slug]`): 단일 배경 이미지 → `HospitalPhotoMosaic` 모자이크 레이아웃으로 교체

### Fixed
- **`NEXT_PUBLIC_SITE_URL=""`(빈 문자열) 500 에러**: `layout.tsx`의 `??` → `||` 변경 (빈 문자열도 fallback 처리)
- **로컬 개발 환경 `.env.local` 누락**: Vercel env vars가 Production/Preview에만 등록되어 있어 `vercel env pull --environment=production` 필요함을 확인

---

## [2026-06-25]

### Added
- **서비스 우선순위 ordering**: 2025 한국 의료관광 통계 기반으로 카테고리 sort_order 설정
  - Beauty & Skin(1) > Plastic Surgery(2) > Dental(3) > Health Check-up(4) > Fertility(5) > Hair(6) > Eye Care(7) > Orthopedics & Spine(8)
- **성형외과 카테고리 + 서비스**: Plastic Surgery 카테고리와 Rhinoplasty / Eyelid Surgery / Liposuction 서비스 추가
- **카테고리 다국어 확장**: 기존 카테고리 이름을 16개 언어로 업데이트
- **서비스 드롭다운 optgroup 그룹핑**: 파트너 케이스 등록 폼, 공개 문의 폼, 어드민 문의 필터 — 모두 카테고리별 `<optgroup>` 적용
- **Admin 관리 UI sort_order 입력**: 카테고리 생성 폼 + 서비스 생성/수정 폼에 "순서" 숫자 입력 추가
- **카테고리 목록 순서 배지**: 어드민 서비스 페이지 카테고리 chip에 `#N` 순서 표시

### Improved
- **서비스 드롭다운 정렬**: 모든 서비스 select에서 `name->en` 알파벳 정렬 → `sort_order` 인기순 정렬로 통일
- **카테고리 다국어 이름 정규화**: 16개 언어 완전 지원 (기존 ko/en/zh/ja만 있던 것 확장)

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
  - WeChat: 클릭 시 WeChat ID 표시 → **2026-06-25 개선: `weixin://` 딥링크로 앱 직접 실행, 미설치 시 팝오버(ID 복사) fallback**
  - 연락처 정보: `WHATSAPP_NUMBER`, `WECHAT_ID` 상수로 파일 상단에 정의 (실제 값으로 교체 필요)
- **`supabase/migrations/011_hospital_media.sql`** — `hospitals` 테이블에 5개 컬럼 추가 (`founded_year`, `annual_patients`, `videos`, `gallery_images`, `awards`) · Supabase Dashboard SQL Editor에서 적용 완료
- **병원 영상 갤러리** (`src/components/hospitals/VideoGallery.tsx`): YouTube 영상 썸네일 3열 그리드 + 클릭 시 인라인 iframe autoplay, 타입 뱃지(facility/testimonial/doctor/youtube)
- **병원 사진 갤러리** (`src/components/hospitals/PhotoGallery.tsx`): 8칸 그리드 + "+N more" 오버레이, 풀스크린 라이트박스 (← → Esc 키보드 네비게이션)
- **텍스트 더보기** (`src/components/hospitals/ReadMoreText.tsx`): 기본 500자 truncate + "Read more / Read less" 토글
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
- **병원 상세 페이지** (`/hospitals/[slug]`): Bookimed 벤치마크 기반 전면 리뉴얼
  - Hero: 풀블리드 480px, 그라디언트 오버레이, 로고·스탯 pill·CTA 카드
  - Sticky 섹션 네비게이션 (About / Videos / Photos / Services / Doctors / Awards / Reviews / Contact)
  - Stats Bar 5열 (설립연도·연간환자·의사수·시술수·언어)
  - 서비스·가격: 카테고리 → 서비스 → 시술 3단계 그룹핑, 볼륨·전문의·가격 표시
  - VideoGallery, PhotoGallery, Awards 섹션 (새 컴포넌트 사용)
  - 국제서비스(인증·국제센터·언어), 최하단 CTA 배너
- **Admin 병원 관리** (`/admin/hospitals/[id]`): 기본정보에 설립연도·연간환자·히어로이미지 필드 추가, 영상 관리·사진 갤러리 관리·수상내역 관리 섹션 신설
- **`src/lib/actions/admin-hospitals.ts`**: 영상·사진·수상내역 Server Actions 추가 (`addHospitalVideo`, `removeHospitalVideo`, `addHospitalGalleryImage`, `removeHospitalGalleryImage`, `addHospitalAward`, `removeHospitalAward`)
- **`src/lib/types/database.ts`**: `hospitals` Row/Insert/Update에 `founded_year`, `annual_patients`, `videos`, `gallery_images`, `awards` 타입 추가
- **`features-checklist.json`**: Cure Partner 역할 전반 반영 — `case_manager` → `cure_partner`, F-101-B(Admin Cure Partner 계정 관리), F-109~F-113(Cure Partner 포털 `/cure-partner`), phase-9 명칭 수정, 66→72 features / 302→327 tasks
- **`Curepick_goal.md`**: Section 3 Partner Ecosystem(Local Agent/Cure Partner/Hospital 협업), Section 14-B Cure Partner 포털 스펙, Section 17 Admin 역할 명시("플랫폼 관리만"), Section 18 개발원칙 #9 "Admin ≠ Executor" 추가

### Removed
- **홈 > Intent Section** ("무엇을 찾고 계신가요?"): 불필요한 섹션 제거
- **홈 > "전체 카테고리 보기" 링크**: 캐러셀 도입으로 필요없어져 제거

### 런칭 준비 (Vercel 배포 차단 요소 해소)
- **Hero 이미지 저장 방식 전환** (배포 차단): `src/lib/site-settings.ts`가 `fs.writeFileSync`로 `data/site-settings.json`에 저장하던 방식 → Supabase `site_settings` 테이블로 전환. Vercel 서버리스의 읽기 전용 FS에서 Admin 히어로 이미지 교체 시 `EROFS` 크래시가 발생하던 문제 해결.
  - `supabase/migrations/011_site_settings_table.sql` 추가 (단일행 테이블, 기존 hero URL 시드, public read RLS)
  - `readSiteSettings`/`writeSiteSettings` async 전환 + 호출부 4곳 `await` 처리 (`page.tsx`, `admin/settings/page.tsx`, `admin-settings.ts`)
  - 위 [Added] 항목의 "Supabase 테이블 + unstable_cache 방식으로 전환 필요 (미해결)" 경고 해소
- **연락처 env 일원화**: `ContactButtons.tsx`의 하드코딩 WhatsApp 번호(`821012345678` 플레이스홀더)/WeChat ID → `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WECHAT_ID` 환경변수로 교체 (success 페이지와 소스 일원화). 값 미설정 시 버튼 자동 숨김.
- **이미지 도메인 일반화**: `next.config.ts`의 `images.remotePatterns`에 하드코딩되던 Supabase project ref → `NEXT_PUBLIC_SUPABASE_URL`에서 host 파생 (환경별 대응).
- **`.env.example` 정리**: 누락되어 있던 `RESEND_API_KEY`, `ADMIN_EMAIL`, `GOOGLE_TRANSLATE_API_KEY`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_WECHAT_ID` 추가 + `SUPABASE_SERVICE_ROLE_KEY`를 필수로 표기.
- **Node 버전 고정**: `package.json`에 `engines.node: "22.x"` + `.nvmrc`(22) 추가. Next 16.2.9는 Node ≥20.9 필요 → Vercel 빌드 Node 결정성 확보.
- **문의 알림 이메일 신뢰성**: `src/app/api/inquiries/route.ts`의 알림 발송을 `await` 없는 fire-and-forget → Next 16 `after()`로 변경. 서버리스 Lambda가 응답 후 freeze되어 이메일이 누락되던 위험 제거.
- **빌드 검증**: 로컬 `next build`로 컴파일·TypeScript 통과 확인(실패는 로컬 env 부재만). Next 16 Turbopack 빌드는 ESLint를 실행하지 않아 기존 lint 경고가 배포를 막지 않음을 확인.

### 배포 완료 (F-004 — ✅ done)
- ✅ 위 런칭 준비 변경분 전체를 커밋 후 `main`에 푸시 완료 (commit `2ca5044`, 12개 파일).
- ✅ **Vercel 프로덕션 배포 완료 (2026-06-25)**: `curepick.vercel.app` LIVE. 343개 페이지 정상 생성.
  - 환경변수 등록 완료: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_WECHAT_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER`

**남은 수동 작업 (도메인 연결 전 완료 권장):**
- **curepick.com 도메인 연결**: Vercel Dashboard → Settings → Domains → `curepick.com` 추가 후 DNS 설정
- **Supabase DB 마이그레이션**: `012_site_settings.sql`, `013_partner_ecosystem.sql` → Supabase Dashboard SQL Editor 실행
- **Supabase Storage**: `partner-resources` 버킷 생성 (Public read)
- **OAuth 콜백 URL**: Supabase → Authentication → Site URL: `https://curepick.com`, Redirect: `https://curepick.com/**`
- **RESEND_API_KEY**: 이메일 알림 활성화 시 Vercel 환경변수 추가

---

## [2026-06-25 — Session 2]

### Added
- **`supabase/migrations/014_cure_partner_profile.sql`**: `cure_partners` 테이블에 15개 필드 추가 — `photo_url`, `title`(JSONB), `bio`(JSONB), `nationality`, `base_country`, `service_regions[]`, `certifications[]`, `years_experience`, `patient_count`, `contact_whatsapp`, `contact_wechat`, `vip_level`(standard/vip/vvip), `protocol_features[]`, `partner_hospitals[]`, `intro_video_url`. Supabase SQL Editor에서 실행 필요.
- **`/cure-partners` 공개 페이지** (`src/app/[locale]/(main)/cure-partners/page.tsx`): Jairos 제안서 마케팅 내용 기반 Cure Partner 쇼케이스 페이지 신규 생성
  - Hero — "Your Dedicated Medical Journey Companion"
  - What is a Cure Partner? (JMM 개념 설명 + 3자 역할 비교)
  - 4-Step Premium Journey (Pre-Check → Medical Care → Premium Recovery → Continuative Care)
  - JMM Protocol (공항 의전·병원 동행·통역·명상 연계·사후관리 등 7개 특징 카드)
  - Our Cure Partners (DB에서 active CP 카드 그리드, 사진·VIP배지·언어·서비스지역 표시)
  - CTA — 문의 연결
- **`/about` 페이지** (`src/app/[locale]/(main)/about/page.tsx`): Footer 링크만 존재하던 About 페이지 신규 구현
  - Mission ("Service First" 철학 시각화)
  - How It Works (Local Agent → Cure Partner → Hospital 3단계 협업)
  - Our Principles (4대 개발 원칙)
  - Partner Network (보건복지부·청담Cell·오대산·경희대 한의과)
  - Contact CTA

### Improved
- **Admin Cure Partner 관리** (`/admin/cure-partners`): 등록 폼 대폭 강화
  - 섹션 구분: Account / Identity / Title & Bio / Languages & Specialties / Protocol Features / Contact & Media / Partner Info
  - 신규 필드: VIP 등급(Standard/VIP/VVIP), 국적·거주국, 다국어 직함·소개글(EN/KO), 서비스 지역, 프로토콜 특징 체크박스 7개, WhatsApp/WeChat, 사진·영상 URL, 협력병원, 자격증
  - 목록 테이블에 VIP Level, Service Regions, WhatsApp 열 추가
- **`src/lib/types/database.ts`**: `cure_partners` Row/Insert/Update 타입에 15개 신규 필드 추가
- **Footer**: Services 열에 "Cure Partners" 링크 (`/cure-partners`) 추가

### Jairos 역할 분리 정의
- **Local Partner** (`/partner`): 중국(항저우 화상초진센터·양란EMBA·왕천1500만·징즈5000명) + 유럽에서 VVIP 환자 유치·케이스 등록
- **Cure Partner (JMM)** (`/cure-partner`): Alex Park이 공항 픽업부터 귀국까지 1:1 동행, 병원 예약·통역·오대산 명상 연계·사후관리
- **Admin 콘텐츠 기여** → `/about` 및 `/cure-partners` 공개 페이지에 반영 (팀 6인, 4단계 여정, 파트너십 정보)

---

## [2026-06-25]

### Added
- **CurepickLogo 전면 개편** (`src/components/ui/CurepickLogo.tsx`):
  - 하트·십자 아이콘 제거 → "Curepick" 워드마크 + VIP 원형 뱃지(superscript) 조합으로 교체
  - VIP 뱃지: 회색 원형 테두리(`border-radius: 50%`) 내 "VIP" 텍스트, 오른쪽 상단에 superscript 배치
  - 태그라인: "The best S.Korea VIP Medical Tourism Platform" (파란색 `#2563eb`)
  - sm 사이즈: 태그라인 2줄 레이아웃 (`whitespace-nowrap` div × 2, "Curepick" 폭 맞춤)
- **`.gitignore` 추가**: `.vercel`, `scripts/test-accounts.json` (비밀번호 포함 파일 제외)

### Improved
- **Header 태그라인 표시** (`src/components/layout/Header.tsx`): `showTagline={false}` → `showTagline={true}`. 로고 하단에 2줄 태그라인 표시.
- **WeChat 버튼 UX** (`src/components/ui/ContactButtons.tsx`):
  - `alert()` 제거 → `weixin://` URL scheme으로 WeChat 앱 직접 실행
  - 앱 미설치 감지(1.5초 timeout + `visibilitychange`): 팝오버 fallback 표시
  - 팝오버: WeChat ID + "Copy ID" 버튼(클립보드 복사), ✕ 닫기 버튼
- **병원 상세 페이지 Doctors 어드민 관리** (`src/lib/actions/admin-hospitals.ts`):
  - `addDoctor(hospitalId, formData)` — 이름·전문분야(다국어), 경력, 언어, 사진 업로드 → `doctors` 테이블 insert
  - `removeDoctor(doctorId)` — 의사 행 삭제
- **병원 어드민 편집 페이지 Medical Team 섹션** (`src/app/.../admin/hospitals/[id]/page.tsx`):
  - 기존 의사 목록 표시 (사진/이니셜, 이름 EN, 전문분야, 경력)
  - `<details>` 접기형 Add Doctor 폼 (MultilingualInput × 2, 경력·언어·사진)
  - Remove 버튼으로 즉시 삭제
- **Logo/Hero 업로드 독립 폼 분리**:
  - 기존 main form에서 `logo_file`, `hero_file` input 제거 → 각각 별도 `<form>` + 서버액션
  - `updateHospitalLogo(id, formData)`, `updateHospitalHero(id, formData)` 추가
- **`next.config.ts`**: `experimental.serverActions.bodySizeLimit: "10mb"` — Vercel 기본 1MB 제한 초과 방지

### Fixed
- **Supabase Storage 업로드 실패** (`src/lib/actions/admin-hospitals.ts`):
  - `uploadImage()` — anon client → `createAdminClient(SERVICE_ROLE_KEY)` 교체
  - `await file.arrayBuffer()` 패턴 적용 (File 객체 직접 전달 금지)
  - `ensureHospitalBucket()` — `hospital-images` 버킷 자동 생성
- **병원 slug 공백 문제** — `updateHospital()`/`createHospital()` 에서 수동 입력 slug도 `slugify()` 강제 적용 (URL 인코딩 404 방지)
- **Hero 이미지 opacity** (`/hospitals/[slug]/page.tsx`):
  - 이미지에 `opacity-60` 제거 → 100% 원본 품질 표시
  - 그라디언트 조건부: 이미지 있을 때 `from-black/80 via-black/20` (텍스트 가독성 확보), 없을 때 어두운 단색 배경
- **Admin 버튼 커서** — `<button type="submit">` 전체에 `cursor-pointer` 추가

---
