# Curepick Development Roadmap

## Overview

MVP+ 버전 개발을 8개 Phase로 나누어 진행합니다.
각 Phase는 이전 Phase의 결과물 위에 쌓이는 구조입니다.

---

## System Architecture (전체 시스템 구조)

```
[User Browser]
     |
     v
[Next.js Frontend - Vercel]
     |
     |-- Static Pages (SSG) -----> Category, Service, Hospital, Doctor Pages
     |-- Server Components ------> Search, Filtering, Dynamic Content
     |-- API Routes -------------> Inquiry Form, Contact
     |
     v
[Supabase Backend]
     |
     |-- PostgreSQL DB ----------> Service Graph, Hospital Graph, Doctor Graph
     |-- Auth -------------------> User Auth + Hospital Staff Auth + Admin Auth
     |-- Storage ----------------> Images (Hospital, Doctor, Procedure photos)
     |-- Edge Functions ---------> Email/WhatsApp Notification
     |
     v
[External Services]
     |-- Vercel (Hosting + CDN)
     |-- WhatsApp Business API
     |-- Email Service (Resend / SendGrid)
     |-- Google Analytics
     |-- Google Search Console
```

---

## Data Flow (데이터 흐름)

```
[Admin Dashboard]
     |
     | (1) 데이터 입력/관리
     v
[Supabase DB]
     |
     | (2) Build Time: SSG 데이터 fetch
     | (3) Runtime: 동적 데이터 fetch
     v
[Next.js]
     |
     | (4) Pre-rendered HTML + Client Hydration
     v
[User Browser]
     |
     | (5) 문의 요청 (Inquiry)
     v
[API Route]
     |
     | (6) DB 저장 + 알림 발송
     v
[Supabase DB] + [Email/WhatsApp]
```

---

## User Flow (사용자 여정)

```
[Landing Page]
     |
     |-- (A) 검색 입력 ---> [Search Results] ---> [Service Page]
     |
     |-- (B) Intent 선택
     |       |
     |       |-- Treat Disease
     |       |-- Improve Health
     |       |-- Look Better          각 Intent에서
     |       |-- Live Longer   -----> [Category Page]
     |
     |-- (C) Category 직접 선택 -----> [Category Page]
     |
     v
[Category Page]  예: Beauty & Skin
     |
     |-- Service 목록 표시
     |-- 인기 Procedure 표시
     |-- Featured Provider 표시
     |
     v
[Service Page]  예: Ultherapy
     |
     |-- Service 개요, 설명
     |-- Procedure 목록 (300 shots, 600 shots ...)
     |-- 추천 Hospital 목록 (가격, 볼륨, 점수 비교)
     |-- FAQ
     |-- [문의하기 CTA]
     |
     v
[Hospital Page]  예: Gangnam Clinic A
     |
     |-- Hospital 개요, 강점
     |-- 지원 Procedure 목록
     |-- Doctor 목록
     |-- 언어 지원, 국제 환자 서비스
     |-- [문의하기 CTA]
     |
     v
[Doctor Page]  예: Dr. Kim
     |
     |-- 프로필, 경력
     |-- 전문 Procedure
     |-- 학술 논문
     |-- [문의하기 CTA]
     |
     v
[Login / Sign Up]  (선택적 - 비로그인 문의도 가능)
     |
     |-- Email 가입
     |-- Google 로그인
     |-- Facebook 로그인
     |
     v
[Inquiry Form]
     |
     |-- 이름, 이메일, 국적 (로그인 시 자동 채움)
     |-- 관심 Service/Procedure
     |-- 메시지
     |
     v
[Confirmation Page]
     |
     |-- 접수 완료 안내
     |-- WhatsApp 연결 옵션
     |-- 예상 응답 시간 안내
     |
     v
[My Page]  (로그인 사용자)
     |
     |-- 문의 내역 확인
     |-- 프로필 관리
```

---

## Page Architecture (페이지 구조)

```
/                           --> Home (Landing)
/[locale]                   --> Localized Home

/[locale]/categories
  /beauty-skin              --> Category: Beauty & Skin
  /dental                   --> Category: Dental
  /health-screening         --> Category: Health Screening
  /plastic-surgery          --> Category: Plastic Surgery
  /stem-cell-longevity      --> Category: Stem Cell & Longevity
  /ivf-womens-health        --> Category: IVF & Women's Health
  /orthopedic-spine         --> Category: Orthopedic & Spine
  /cancer                   --> Category: Cancer & Serious Diseases

/[locale]/services
  /ultherapy                --> Service: Ultherapy
  /thermage                 --> Service: Thermage
  /dental-implant           --> Service: Dental Implant
  /executive-checkup        --> Service: Executive Check-up
  ...

/[locale]/procedures
  /ultherapy-600-shots      --> Procedure: Ultherapy 600 Shots
  /all-on-4-implant         --> Procedure: All-on-4 Implant
  ...

/[locale]/hospitals
  /[hospital-slug]          --> Hospital Detail

/[locale]/doctors
  /[doctor-slug]            --> Doctor Detail

/[locale]/login              --> 로그인 (Email / Google / Facebook)
/[locale]/signup             --> 회원가입
/[locale]/my                 --> My Page (문의 내역, 프로필)

/[locale]/reviews            --> 후기 목록
/[locale]/reviews/write      --> 후기 작성 (로그인 필요)
/[locale]/reviews/[id]       --> 후기 상세 + 댓글

/[locale]/inquiry           --> Inquiry Form
/[locale]/inquiry/success   --> Inquiry Confirmation

/hospital                   --> Hospital Backoffice (병원 담당자용)
  /hospital/dashboard       --> 대시보드 (문의 수, 조회 수)
  /hospital/profile         --> 병원 프로필 확인/수정 요청
  /hospital/doctors         --> 소속 의사 관리
  /hospital/procedures      --> 시술/패키지 관리
  /hospital/inquiries       --> 문의 확인 및 응대
  /hospital/reviews         --> 후기 확인 및 답변

/admin                      --> Admin Dashboard (Curepick 운영팀)
  /admin/services           --> Service 관리
  /admin/hospitals          --> Hospital 관리
  /admin/doctors            --> Doctor 관리
  /admin/inquiries          --> 문의 관리
  /admin/reviews            --> 후기 승인/관리
  /admin/hospital-accounts  --> 병원 담당자 계정 관리
```

---

## Database Schema (데이터베이스 구조)

```
[intents]                    [categories]
  id                           id
  name (json: i18n)            intent_id (FK)
  slug                         name (json: i18n)
  sort_order                   slug
                               description (json: i18n)
                               image_url
                               sort_order
        |                           |
        |                           |
        v                           v
                            [services]
                               id
                               category_id (FK)
                               name (json: i18n)
                               slug
                               description (json: i18n)
                               overview (json: i18n)
                               image_url
                               sort_order
                               is_featured
                                    |
                                    v
                            [procedures]
                               id
                               service_id (FK)
                               name (json: i18n)
                               slug
                               description (json: i18n)
                               sort_order
                                    |
                                    v
[hospitals]              [hospital_procedures]         [doctors]
  id                        id                           id
  name (json: i18n)         hospital_id (FK)             hospital_id (FK)
  slug                      procedure_id (FK)            name (json: i18n)
  description (json: i18n)  annual_volume                slug
  address (json: i18n)      specialist_count             specialty (json: i18n)
  city                      waiting_time_days            experience_years
  accreditation             cost_min                     bio (json: i18n)
  international_center      cost_max                     photo_url
  languages (text[])        cost_currency                languages (text[])
  phone                     languages (text[])           publications (json)
  email                     intl_patient_support
  website                   evidence_score
  logo_url                  is_featured
  hero_image_url
  is_featured                        |
                                     v
                            [evidence]
                               id
                               hospital_procedure_id (FK)
                               source_type
                               source_url
                               description
                               verified_at

                            [profiles]
                               id (= auth.users.id)
                               email
                               full_name
                               nationality
                               phone
                               avatar_url
                               role (patient/hospital_staff/admin)
                               hospital_id (FK, nullable)  -- hospital_staff인 경우
                               auth_provider (email/google/facebook)
                               created_at

                            [inquiries]
                               id
                               user_id (FK, nullable)  -- 로그인 사용자
                               name
                               email
                               phone
                               nationality
                               service_id (FK)
                               procedure_id (FK)
                               hospital_id (FK)
                               message
                               status (new/contacted/closed)
                               created_at

                            [reviews]
                               id
                               user_id (FK)
                               hospital_id (FK)
                               procedure_id (FK, nullable)
                               rating (1-5)
                               title
                               content
                               media (json: [{type, url}])
                               is_verified (boolean)
                               status (pending/approved/rejected)
                               created_at

                            [review_comments]
                               id
                               review_id (FK)
                               user_id (FK)
                               content
                               created_at

                            [faqs]
                               id
                               service_id (FK)
                               question (json: i18n)
                               answer (json: i18n)
                               sort_order
```

---

## Development Phases

### Phase 0: Project Foundation
> Next.js 프로젝트 생성 및 기본 인프라 구축

**작업 내용:**
- [ ] Next.js 프로젝트 생성 (App Router)
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] Supabase 프로젝트 생성 및 연결
- [ ] 프로젝트 폴더 구조 설계
- [ ] ESLint, Prettier 설정
- [ ] Git 저장소 초기화
- [ ] Vercel 배포 연결
- [ ] 환경 변수 설정 (.env.local)

**결과물:** 빈 Next.js 프로젝트가 Vercel에 배포되는 상태

```
curepick/
  src/
    app/
      [locale]/
        layout.tsx
        page.tsx
    components/
      ui/           --> 공통 UI 컴포넌트
      layout/       --> Header, Footer, Navigation
    lib/
      supabase.ts   --> Supabase 클라이언트
      types.ts      --> TypeScript 타입 정의
      i18n/         --> 다국어 설정
    data/           --> Seed 데이터
  public/
    images/
  messages/         --> 번역 파일 (en.json, zh.json ...)
```

---

### Phase 1: Database & Data Model
> Supabase에 전체 데이터 모델 구축 + Seed 데이터 입력

**작업 내용:**
- [ ] Supabase 테이블 생성 (위 Schema 참고)
- [ ] RLS (Row Level Security) 정책 설정
- [ ] i18n 필드를 JSON 타입으로 설계
- [ ] Seed 데이터 준비 (최소 2개 Category, 각 3-5개 Service)
- [ ] TypeScript 타입 자동 생성 설정
- [ ] Supabase 클라이언트 유틸리티 작성

**Seed 데이터 범위 (초기):**
| Category | Services | Hospitals | Doctors |
|---|---|---|---|
| Beauty & Skin | Ultherapy, Thermage, Rejuran | 3개 | 5명 |
| Dental | Implant, Wisdom Tooth | 3개 | 5명 |

- [ ] reviews 테이블 생성 (id, user_id, hospital_id, procedure_id, rating, title, content, media:json, is_verified, status, created_at)
- [ ] review_comments 테이블 생성 (id, review_id, user_id, content, created_at)
- [ ] reviews RLS 정책 (누구나 approved 읽기, 본인 것 생성, hospital_staff는 자기 병원 건 읽기)
- [ ] review_comments RLS 정책 (누구나 읽기, 로그인 사용자 생성)

**결과물:** 전체 DB 스키마 + 테스트용 데이터 입력 완료

---

### Phase 2: Core Layout & Navigation
> 공통 레이아웃, 헤더, 푸터, 네비게이션 구축

**작업 내용:**
- [ ] Header 컴포넌트 (로고, 네비게이션, 언어 선택)
- [ ] Footer 컴포넌트 (링크, 연락처, 소셜)
- [ ] Mobile Navigation (햄버거 메뉴)
- [ ] Category Navigation (메인 네비)
- [ ] Breadcrumb 컴포넌트
- [ ] CTA Button 컴포넌트 (문의하기)
- [ ] 기본 i18n 설정 (next-intl)
- [ ] 영어 기본 + 구조만 잡기

**결과물:** 모든 페이지에서 공유하는 레이아웃 완성

---

### Phase 3: Category & Service Pages
> 핵심 탐색 페이지 구축 - 사용자가 서비스를 발견하는 경로

**작업 내용:**
- [ ] Category List Page (전체 카테고리 목록)
- [ ] Category Detail Page (카테고리별 서비스 목록)
- [ ] Service Detail Page (서비스 상세 + 추천 병원)
- [ ] Procedure Section (Service Page 내 Procedure 비교)
- [ ] Hospital Card 컴포넌트 (Service Page에서 병원 비교용)
- [ ] Price Range 표시 컴포넌트
- [ ] FAQ Section 컴포넌트
- [ ] SSG (Static Site Generation) 적용

**결과물:** Category → Service → Procedure 탐색 플로우 완성

---

### Phase 4: Hospital & Doctor Pages
> 병원과 의사 상세 페이지 구축

**작업 내용:**
- [ ] Hospital Detail Page
  - Overview Section
  - Strength/특장점 Section
  - Supported Procedures 목록
  - Doctor 목록
  - International Services (언어, 국제 환자 지원)
  - Location/Contact
  - CTA (문의하기)
- [ ] Doctor Detail Page
  - Profile Section
  - Experience & Career
  - Procedure List
  - Publications
  - CTA (문의하기)
- [ ] Hospital Card / Doctor Card 컴포넌트
- [ ] Evidence Badge 컴포넌트 (데이터 근거 표시)

**결과물:** Hospital, Doctor 상세 페이지 완성

---

### Phase 5: Home Page & Search
> 랜딩 페이지 + 검색 기능

**작업 내용:**
- [ ] Home Page 구성
  - Hero Section (핵심 메시지 + 검색)
  - Intent Section (4개 Intent 카드)
  - Category Grid
  - Featured Services
  - Featured Hospitals
  - CTA Section
- [ ] Search 기능
  - Search Bar 컴포넌트
  - Supabase Full-Text Search 또는 ILIKE 검색
  - Search Results Page
  - 자동완성 (추후 개선 가능)
- [ ] 반응형 디자인 점검

**결과물:** 완성된 Home + 기본 검색 기능

---

### Phase 6: User Authentication & Inquiry System
> 고객 로그인 + 문의/상담 신청 시스템

**작업 내용 (인증):**
- [ ] Supabase Auth 설정
- [ ] Email 회원가입 / 로그인
- [ ] Google OAuth 로그인
- [ ] Facebook OAuth 로그인
- [ ] 비밀번호 재설정 (이메일)
- [ ] profiles 테이블 연동 (가입 시 자동 생성)
- [ ] Login / Signup 페이지
- [ ] 로그인 상태 관리 (Header에 사용자 표시)
- [ ] My Page (프로필 관리, 문의 내역)

**작업 내용 (문의 시스템):**
- [ ] Inquiry Form Page
  - 이름, 이메일, 전화번호 (로그인 시 자동 채움)
  - 국적 선택
  - 관심 Service/Procedure (자동 채움 가능)
  - 관심 Hospital (자동 채움 가능)
  - 메시지
  - 개인정보 동의
- [ ] Form Validation (Zod + React Hook Form)
- [ ] API Route: 문의 접수 처리
- [ ] Supabase에 문의 데이터 저장 (user_id 연결)
- [ ] 이메일 알림 발송 (관리자에게)
- [ ] Confirmation Page
- [ ] WhatsApp 연결 버튼 (선택)
- [ ] 비로그인 사용자도 문의 가능 (user_id nullable)

**작업 내용 (후기/리뷰 시스템):**
- [ ] 후기 작성 페이지 (/reviews/write)
  - 대상 Hospital / Procedure 선택
  - 별점 (1-5)
  - 제목 + 본문
  - 사진 업로드 (최대 5장, Supabase Storage)
  - 영상 업로드 (최대 1개, Supabase Storage)
- [ ] 후기 목록 페이지 (/reviews)
  - 전체 후기 목록 (approved만)
  - 필터: 별점, 카테고리, 병원
  - Verified 뱃지 표시
- [ ] 후기 상세 페이지 (/reviews/[id])
  - 후기 본문 + 미디어 표시
  - 댓글 목록
  - 댓글 작성 폼 (로그인 사용자)
- [ ] Hospital Page에 후기 섹션 추가
- [ ] Service Page에 관련 후기 섹션 추가
- [ ] My Page에 "내 후기" 탭 추가 (작성한 후기 목록, 수정/삭제)

**결과물:** 로그인/회원가입 + 문의 시스템 + 후기/리뷰 시스템 완성

---

### Phase 7: Hospital Backoffice & Admin Dashboard
> 병원 담당자 백오피스 + Curepick 관리자 페이지

**작업 내용 (Hospital Backoffice - /hospital):**
- [ ] 병원 담당자 로그인 (이메일/비밀번호, 계정은 Admin이 생성)
- [ ] Dashboard (자기 병원 문의 수, 페이지 조회 수)
- [ ] 병원 프로필 확인 / 수정 요청
- [ ] 소속 의사 정보 확인 / 수정 요청
- [ ] 시술·패키지 정보 확인 / 수정 요청
- [ ] 문의 목록 확인 (자기 병원으로 들어온 건만)
- [ ] 문의 상태 변경 (확인중/응대완료)
- [ ] RLS 정책: hospital_id 기반 데이터 격리

**작업 내용 (Hospital Backoffice - 후기 관리):**
- [ ] 자기 병원 후기 목록 확인 (/hospital/reviews)
- [ ] 후기에 공식 답변(댓글) 작성
- [ ] 후기 통계 (평균 별점, 후기 수)

**작업 내용 (Admin Dashboard - /admin):**
- [ ] Admin 인증 (Supabase Auth - 이메일/비밀번호)
- [ ] Dashboard Home (전체 통계 요약)
- [ ] Service 관리 (CRUD)
- [ ] Hospital 관리 (CRUD)
- [ ] Doctor 관리 (CRUD)
- [ ] HospitalProcedure 관리 (CRUD)
- [ ] Inquiry 관리 (전체 목록, 상태 변경, 메모)
- [ ] 병원 담당자 계정 생성/관리
- [ ] 이미지 업로드 (Supabase Storage)

**작업 내용 (Admin - 후기 관리):**
- [ ] 전체 후기 목록 (/admin/reviews)
- [ ] 후기 승인/거절 (status 변경)
- [ ] Verified 뱃지 부여 (is_verified)
- [ ] 부적절한 후기/댓글 삭제

**결과물:** 병원 담당자가 자기 병원을 관리 + Curepick 운영팀이 전체를 관리

---

### Phase 8: SEO & i18n & Launch Prep
> 검색 최적화, 다국어 완성, 런칭 준비

**작업 내용:**
- [ ] SEO 메타 태그 (모든 페이지)
- [ ] Open Graph / Twitter Card
- [ ] Sitemap 자동 생성
- [ ] robots.txt
- [ ] Structured Data (JSON-LD: MedicalOrganization, Physician)
- [ ] 다국어 번역 파일 완성 (영어 우선, 중국어 등 추후)
- [ ] Google Analytics 연동
- [ ] Google Search Console 등록
- [ ] 성능 최적화 (이미지, 폰트, Core Web Vitals)
- [ ] 404 페이지
- [ ] Error Boundary

**결과물:** 런칭 가능한 상태의 플랫폼

---

## Phase Summary (한눈에 보기)

```
Phase 0: Project Foundation
   |
   v
Phase 1: Database & Data Model
   |
   v
Phase 2: Core Layout & Navigation
   |
   v
Phase 3: Category & Service Pages      <-- 핵심 (Service-first UX)
   |
   v
Phase 4: Hospital & Doctor Pages
   |
   v
Phase 5: Home Page & Search
   |
   v
Phase 6: Auth & Inquiry System         <-- 로그인 + 수익화 연결
   |
   v
Phase 7: Hospital Backoffice & Admin   <-- 병원 관리 + 운영 도구
   |
   v
Phase 8: SEO & i18n & Launch Prep      <-- 런칭
   |
   v
[LAUNCH]
```

---

## Tech Stack Detail

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG + SSR + API Routes |
| Language | TypeScript | 타입 안전성 |
| Styling | Tailwind CSS | 빠른 UI 개발 |
| UI Components | shadcn/ui | 재사용 가능한 컴포넌트 |
| Database | Supabase (PostgreSQL) | 데이터 저장 + Storage |
| Auth | Supabase Auth | Email, Google OAuth, Facebook OAuth |
| ORM/Client | Supabase JS Client | DB 쿼리 |
| Form | React Hook Form + Zod | 폼 처리 + 검증 |
| i18n | next-intl | 다국어 지원 |
| Hosting | Vercel | 배포 + CDN |
| Email | Resend | 알림 이메일 |
| Analytics | Google Analytics 4 | 사용자 분석 |
| SEO | next-sitemap | 사이트맵 생성 |

---

## Key Decisions & Notes

### 왜 SSG (Static Site Generation)를 사용하는가?
- 의료 서비스 정보는 자주 바뀌지 않음
- SSG로 빌드하면 로딩 속도가 매우 빠름
- SEO에 유리 (Google이 정적 HTML을 선호)
- Vercel 무료 플랜으로도 충분한 트래픽 처리 가능
- ISR (Incremental Static Regeneration)로 필요시 갱신 가능

### 왜 i18n 필드를 JSON으로 저장하는가?
- 별도 번역 테이블 없이 하나의 레코드에 모든 언어 저장
- 예: `{"en": "Ultherapy", "ko": "울쎄라", "zh": "超声刀"}`
- 언어 추가 시 스키마 변경 불필요
- 쿼리가 단순해짐

### 왜 Admin을 별도로 만드는가?
- Supabase Dashboard는 비개발자가 쓰기 어려움
- 파트너가 직접 콘텐츠를 관리할 수 있어야 함
- 데이터 검증/가이드를 Admin UI에 포함 가능

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| 초기 데이터 부족 | 빈 페이지 느낌 | Seed 데이터를 충실히 준비, 2개 카테고리에 집중 |
| SEO 효과 지연 | 트래픽 없음 | 구조화된 데이터 + 콘텐츠 품질에 집중 |
| 다국어 번역 품질 | 신뢰도 저하 | 영어 우선, 이후 전문 번역 |
| 디자인 품질 | 첫인상 | shadcn/ui 기반으로 깔끔한 기본 디자인 확보 |
| 문의 응대 속도 | 전환율 저하 | 이메일 + WhatsApp 즉시 알림 |
