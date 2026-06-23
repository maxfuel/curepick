# Curepick - Project Goal Document

## Project Name

Curepick

## Tagline

Global Healthcare Service Marketplace (Korea-first)

---

## 1. Executive Summary

Curepick은 해외 환자가 한국(및 향후 글로벌)의 의료 서비스를 발견, 비교, 평가하고 이용할 수 있도록 돕는 의료 서비스 마켓플레이스입니다.

### Curepick은 이런 것이 아닙니다

- 병원 디렉토리
- 병원 랭킹 사이트
- 전통적인 의료관광 에이전시

### Curepick은 이런 것입니다

- Healthcare Service Marketplace
- Healthcare Intelligence Platform
- Healthcare Service Discovery Engine

플랫폼의 중심은 "병원"이 아니라 **"의료 서비스"**입니다.

---

## 2. Core Philosophy

기존 의료 플랫폼:

```
Hospital → Doctor → Treatment
```

Curepick:

```
Intent → Category → Service → Procedure → Package → Hospital → Doctor
```

사용자는 병원을 검색하지 않습니다.
사용자는 **서비스를 검색**합니다:

- Ultherapy
- Thermage
- Dental Implant
- Wisdom Tooth Removal
- Executive Health Check-up
- Stem Cell Therapy
- IVF
- Pancreatic Cancer Treatment

> 플랫폼은 항상 병원 브랜딩보다 **의료 서비스를 우선**합니다.

---

## 3. Long-Term Vision

세계 최대의 Healthcare Service Graph를 구축합니다.

| Phase | Goal |
|---|---|
| Phase 1 | Korea Healthcare Marketplace |
| Phase 2 | Asia Healthcare Marketplace |
| Phase 3 | Global Healthcare Marketplace |
| Phase 4 | Healthcare Intelligence Platform |
| Phase 5 | AI Healthcare Companion |

---

## 4. Target Markets

### Primary (초기 타겟)

- Singapore
- Hong Kong
- Taiwan
- UAE
- Saudi Arabia

### Secondary

- Australia
- Canada
- United Kingdom

### Future

- United States
- China
- Japan
- Thailand

---

## 5. User Intent Framework

모든 의료 수요는 4가지 Intent로 분류됩니다.

### Treat Disease (질병 치료)

Cancer, Heart Disease, Neurosurgery, Liver Disease

### Improve Health (건강 개선)

Dental, Orthopedic, IVF, Vision Correction

### Look Better (외모 개선)

Dermatology, Plastic Surgery, Hair Transplant

### Live Longer (장수/웰니스)

Stem Cell, Longevity, Executive Check-up, Wellness Programs

---

## 6. Category Taxonomy

### Beauty & Skin

Ultherapy, Thermage, Rejuran, Juvelook, Botox, Filler, Laser, Acne Treatment, Pigmentation Treatment

### Plastic Surgery

Rhinoplasty, Double Eyelid Surgery, Facelift, Breast Surgery, Body Contouring, Hair Transplant

### Dental

Dental Implant, Wisdom Tooth Removal, Root Canal, Orthodontics, Crown, Veneers, Hollywood Smile

### Health Screening

Basic Check-up, Premium Check-up, Executive Check-up, Cancer Screening, Cardiac Screening, Women's Screening

### Stem Cell & Longevity

Anti-Aging Programs, Joint Regeneration, Regenerative Medicine, IV Therapy, Longevity Programs

### IVF & Women's Health

IVF, Egg Freezing, Fertility Preservation, Gynecology

### Orthopedic & Spine

Knee, Shoulder, Spine, Disc Treatment, Sports Injury

### Cancer & Serious Diseases

Pancreatic Cancer, Liver Cancer, Breast Cancer, Colon Cancer, Lung Cancer, Prostate Cancer

---

## 7. Product Hierarchy

```
Intent
  └── Category
        └── Service
              └── Procedure
                    └── Package
                          └── Hospital
                                └── Doctor
```

**예시:**

```
Look Better
  └── Beauty & Skin
        └── Ultherapy
              └── 600 Shots
                    └── Premium Package
                          └── Gangnam Clinic A
                                └── Dr. Kim
```

---

## 8. Data Architecture
4
### 8.1 Service Graph

의료 서비스 상품 구조를 표현합니다.

```
Category → Service → Procedure → Package
```

예시:
- Beauty & Skin → Ultherapy → 600 Shots → Premium Package
- Dental → Implant → All-on-4 → Premium Implant Package

### 8.2 Hospital Graph

병원 정보를 저장합니다.

- Hospital Profile
- Accreditation (인증)
- International Center
- Languages (지원 언어)
- Location
- Contact

### 8.3 Doctor Graph

의사 정보를 저장합니다.

- Doctor Profile
- Specialty (전문 분야)
- Experience (경력)
- Publications (논문)
- Languages (지원 언어)

### 8.4 HospitalProcedure Graph

**가장 중요한 데이터셋.**
특정 병원이 특정 시술에서 얼마나 강한지를 나타냅니다.

예시:
- Hospital A → Ultherapy
- Hospital B → Pancreatic Cancer Surgery
- Hospital C → Dental Implant

Key Fields:
- Annual Volume (연간 시술 건수)
- Specialist Count (전문의 수)
- Waiting Time (대기 시간)
- Cost Range (가격 범위)
- Languages (지원 언어)
- International Patient Support (국제 환자 지원)
- Evidence Score (근거 점수)

### 8.5 Evidence Graph

모든 주요 데이터는 근거(Evidence)를 가져야 합니다.

가능한 출처:
- Hospital Website
- Hospital Annual Reports
- HIRA (건강보험심사평가원)
- Academic Journals
- Medical Conferences
- Direct Verification
- Internal Research

> 모든 주요 데이터 포인트는 추적 가능해야 합니다.

---

## 9. Site Architecture

### Home

- Search
- Categories
- Featured Services
- Featured Hospitals
- Consultation CTA

### Category Page (예: Beauty & Skin, Dental)

- Services 목록
- Popular Procedures
- Featured Providers

### Service Page (예: Ultherapy, Dental Implant)

- Service Overview
- Pricing
- Recommended Hospitals
- FAQ
- Consultation CTA

### Procedure Page (예: Ultherapy 600 Shots, All-on-4)

- Package Comparison
- Provider Comparison
- Pricing

### Hospital Page

- Overview
- Strengths
- Supported Procedures
- Doctors
- Languages
- International Services
- Consultation CTA

### Doctor Page

- Profile
- Experience
- Procedures
- Publications
- Languages

---

## 10. MVP+ Scope

### Must Include (포함)

- Service Discovery
- Category Pages
- Service Pages
- Hospital Pages
- Doctor Pages
- Inquiry System (문의 시스템)
- User Authentication (고객 로그인)
- Hospital Backoffice (병원 담당자 백오피스)
- Review & Comment System (후기/리뷰 시스템)
- Multilingual Architecture (다국어 구조)
- SEO Infrastructure
- Service Graph
- HospitalProcedure Graph

### Not Included Yet (미포함)

- AI Agent
- Insurance Integration
- Employer Programs
- Travel Planner
- Online Payment
- Direct Scheduling

---

## 11. User Authentication

고객(해외 환자)은 다음 방법으로 회원가입/로그인할 수 있습니다.

| Method | Provider | 설명 |
|---|---|---|
| Email | Supabase Auth | 이메일 + 비밀번호 가입 |
| Google | Supabase OAuth | Google 계정 로그인 |
| Facebook | Supabase OAuth | Facebook 계정 로그인 |

### 인증 관련 기능

- 회원가입 / 로그인 / 로그아웃
- 비밀번호 재설정 (이메일)
- 로그인 후 문의 내역 확인 가능
- 프로필 관리 (이름, 국적, 연락처)

### 참고

- Supabase Auth가 Email, Google, Facebook OAuth를 모두 지원
- 별도 인증 서버 구축 불필요

---

## 12. Hospital Backoffice (병원 담당자 백오피스)

병원 담당자가 자기 병원의 정보를 직접 관리할 수 있는 백오피스입니다.

### 로그인 방식

| Method | 설명 |
|---|---|
| Email + Password | Curepick이 병원 담당자 계정을 생성하여 제공 |

### 병원 담당자가 할 수 있는 것

- 자기 병원 프로필 확인 및 수정 요청
- 소속 의사 정보 확인 및 수정 요청
- 시술/패키지 정보 확인 및 수정 요청
- 자기 병원으로 들어온 문의 확인 및 응대
- 문의 상태 변경 (확인중/응대완료 등)
- 기본 통계 확인 (문의 수, 페이지 조회 수)

### 권한 구분

| Role | 범위 | 설명 |
|---|---|---|
| Patient (고객) | 서비스 탐색 + 문의 | 해외 환자 |
| Hospital Staff (병원) | 자기 병원 데이터만 | 병원 담당자 |
| Admin (관리자) | 전체 데이터 | Curepick 운영팀 |

### 참고

- 병원 담당자 계정은 Curepick 관리자가 생성 (셀프 가입 불가)
- 병원 담당자는 자기 병원에 연결된 데이터만 접근 가능 (RLS 적용)
- Admin과 별도의 인터페이스 (경로: /hospital)

---

## 13. Review & Comment System (후기/리뷰 시스템)

로그인 사용자가 시술 경험에 대한 후기를 작성하고, 다른 사용자 및 병원 담당자가 댓글을 달 수 있는 시스템입니다.

### 후기 작성

- 로그인 사용자만 작성 가능
- 대상: Hospital 또는 Hospital + Procedure 조합
- 별점 (1-5점)
- 제목 + 본문
- 사진 첨부 가능 (최대 5장)
- 영상 첨부 가능 (최대 1개)
- 미디어는 Supabase Storage에 저장

### Verified Review (인증 후기)

- Admin이 실제 시술 여부를 확인한 후기에 Verified 뱃지 표시
- 인증 후기는 상단 노출 등 우선 표시 가능

### 후기 Moderation (관리)

- 후기는 Admin 승인 후 공개 (status: pending → approved)
- 부적절한 후기는 거절 가능 (status: rejected)

### 댓글 (Comment)

- 후기에 댓글 작성 가능
- 병원 담당자도 자기 병원 후기에 공식 답변(댓글) 가능
- 로그인 사용자만 댓글 작성 가능

### 후기 표시 위치

- Hospital Page: 해당 병원의 후기 목록
- Service Page: 해당 서비스 관련 후기 목록
- 후기 목록 페이지 (/reviews): 전체 후기 탐색

### 권한별 기능

| Role | 할 수 있는 것 |
|---|---|
| Patient (고객) | 후기 작성, 댓글 작성, 내 후기 관리 |
| Hospital Staff (병원) | 자기 병원 후기 확인, 공식 답변(댓글) 작성 |
| Admin (관리자) | 전체 후기 승인/거절/삭제, 인증(Verified) 부여 |

---

## 14. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Supabase |
| Hosting | Vercel |
| Localization | i18n |
| Communication | WhatsApp, Email |

---

## 15. Development Principles

1. **Service First** - 서비스 중심 UX
2. **Evidence Based** - 근거 기반 데이터
3. **Multilingual by Default** - 다국어 기본 설계
4. **Korea-first but Globally Expandable** - 한국 우선, 글로벌 확장 가능
5. **Data Model Must Support Future Expansion** - 미래 확장을 지원하는 데이터 모델
6. **Never Build Hospital-first UX** - 절대 병원 중심 UX를 만들지 않음

---

## 16. Success Definition

사용자가 할 수 있어야 하는 것:

1. 의료 서비스를 **발견**한다
2. 제공자(병원)를 **비교**한다
3. 가격을 **이해**한다
4. 품질 지표를 **이해**한다
5. **플랫폼을 통해** 제공자에게 **연락**한다
6. 치료를 **예약**한다

> 플랫폼은 사용자가 **더 나은 의료 결정**을 내리도록 도와야 성공입니다.
> 병원을 나열하는 것이 아닙니다.
