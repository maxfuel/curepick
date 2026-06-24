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
- Healthcare Collaboration Network

플랫폼의 중심은 "병원"이 아니라 **"의료 서비스"**이며, 동시에 환자가 그 서비스에 안전하게 도달할 수 있도록 돕는 **파트너 생태계**입니다.

---

## 2. Core Philosophy

기존 의료 플랫폼:

```
Hospital → Doctor → Treatment
```

기존 의료관광 에이전시 모델:

```
Agent → Hospital → Patient
```

Curepick:

```
Intent → Category → Service → Procedure → Package → Hospital → Doctor
                    ↕
         Partner Ecosystem (Agent ↔ Cure Partner ↔ Hospital)
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

그러나 사용자가 서비스를 발견한 이후, **실제 여정을 완성하는 것은 파트너 생태계**입니다.

> 플랫폼은 항상 병원 브랜딩보다 **의료 서비스를 우선**합니다.
> 동시에, 파트너들이 치열하게 협업할 수 있는 **운영 인프라**를 제공합니다.

---

## 3. Partner Ecosystem (파트너 생태계)

Curepick의 핵심 차별점은 **환자-플랫폼 관계**가 아니라, 그 뒤에서 작동하는 **3자 협업 네트워크**입니다.

### 3.1 현지 에이전트 (Local Agent / Partner)

해외 현지에서 환자를 유치하고 Curepick으로 연결해주는 파트너.

**역할:**
- 현지(싱가포르, UAE, 홍콩 등)에서 환자를 직접 발굴·상담
- Curepick 플랫폼을 통해 환자 케이스를 등록·의뢰
- 케이스 진행 상황을 실시간으로 추적
- 자신이 소개한 환자의 성사율·수익 추적

**비즈니스 모델:**
- 성사된 케이스에 대해 커미션(수수료) 수취
- Curepick이 커미션 비율과 지급을 관리

**백오피스:** `/partner` — Partner Dashboard

### 3.2 Cure Partner (큐어파트너 / 현장 코디네이터)

환자가 Curepick을 통해 치료를 결정한 순간부터 귀국할 때까지, **환자의 모든 동선을 함께 책임지는** 현장 전담 매니저.
에이전트가 "환자를 보내주는 사람"이라면, Cure Partner는 "환자와 함께 움직이는 사람"입니다.

**역할:**
- 에이전트로부터 배정된 케이스를 인수받아 환자와 직접 1:1 소통 시작
- 병원 예약 일정 확정 및 사전 서류 준비 지원 (비자, 의료 기록 번역 등)
- 공항 픽업 · 병원 동행 · 숙소 안내 등 실제 이동 동선 관리
- 진료 현장에서 통역 및 의사소통 지원
- 시술/치료 후 회복 기간 체크인 및 케어
- 케이스 상태를 단계별로 실시간 업데이트 (Lead → Confirmed → Arrived → In-Treatment → Completed)
- 치료 완료 후 후기 수집 및 에이전트 커미션 트리거

**Cure Partner의 정체성:**
- Curepick의 **브랜드 대면자(brand face)**. 환자가 경험하는 Curepick = Cure Partner
- 에이전트, 병원, 환자 세 주체 사이에서 **실시간 허브** 역할
- 언어 능력 + 의료 지식 + 현장 대응력이 핵심 역량

**백오피스:** `/cure-partner` — Cure Partner Dashboard (독립 포털)

### 3.3 병원 (Hospital)

실제 의료 서비스를 제공하는 파트너. 정보 등록 및 케이스 확인이 주요 역할.

**역할:**
- 자기 병원 프로필·시술·패키지 정보 관리
- 배정된 환자 케이스 확인 및 예약 확정
- 케이스별 메모 및 상태 업데이트
- 들어온 문의에 공식 응대
- 후기에 공식 답변

**백오피스:** `/hospital` — Hospital Dashboard

### 3.4 협업 흐름 (Collaboration Flow)

```
[환자 발견/문의]
      ↓
[현지 에이전트 /partner]
  └─ 케이스 등록 및 Curepick에 의뢰
      ↓
[Cure Partner /cure-partner]
  └─ 케이스 인수 → 환자 1:1 소통 → 병원 예약 조율
  └─ 공항 픽업 → 병원 동행 → 통역 → 사후 케어
      ↓
[병원 /hospital]
  └─ 예약 확정 → 치료 → 케이스 피드백
      ↓
[환자 완료]
  └─ 후기 작성 → 에이전트 커미션 정산
```

**Admin(`/admin`)의 역할은 이 흐름 "위"에 있습니다:**
- 플랫폼 데이터(병원·서비스·의사) 관리
- 파트너 계정(에이전트·Cure Partner·병원) 생성 및 관리
- 커미션 정산 승인
- 후기 검수 및 플랫폼 운영
- Admin은 개별 케이스를 직접 처리하지 않습니다.

---

## 4. Long-Term Vision

세계 최대의 Healthcare Service Graph와 Healthcare Collaboration Network를 구축합니다.

| Phase | Goal |
|---|---|
| Phase 1 | Korea Healthcare Marketplace |
| Phase 2 | Asia Healthcare Marketplace + Partner Network |
| Phase 3 | Global Healthcare Marketplace |
| Phase 4 | Healthcare Intelligence Platform |
| Phase 5 | AI Healthcare Companion |

---

## 5. Target Markets

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

## 6. User Intent Framework

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

## 7. Category Taxonomy

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

## 8. Product Hierarchy

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

## 9. Data Architecture

### 9.1 Service Graph

의료 서비스 상품 구조를 표현합니다.

```
Category → Service → Procedure → Package
```

예시:
- Beauty & Skin → Ultherapy → 600 Shots → Premium Package
- Dental → Implant → All-on-4 → Premium Implant Package

### 9.2 Hospital Graph

병원 정보를 저장합니다.

- Hospital Profile
- Accreditation (인증)
- International Center
- Languages (지원 언어)
- Location
- Contact

### 9.3 Doctor Graph

의사 정보를 저장합니다.

- Doctor Profile
- Specialty (전문 분야)
- Experience (경력)
- Publications (논문)
- Languages (지원 언어)

### 9.4 HospitalProcedure Graph

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

### 9.5 Evidence Graph

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

### 9.6 Case Graph (케이스 관리)

파트너 생태계의 핵심 데이터셋. 환자 케이스의 전체 생애주기를 추적합니다.

```
Case
  ├── Patient (환자 정보)
  ├── Source (유입 경로: 직접 문의 / 에이전트 소개)
  ├── Agent (담당 에이전트 — 환자 유치 주체)
  ├── CurePartner (담당 큐어파트너 — 현장 동행 코디네이터)
  ├── Hospital (배정 병원)
  ├── Procedure (시술 내용)
  ├── Status (Lead → Qualified → Confirmed → Arrived → In-Treatment → Completed)
  ├── Timeline (단계별 날짜 기록)
  ├── Notes (단계별 메모 — Cure Partner가 주로 작성)
  └── Commission (커미션 정보 — 에이전트 귀속)
```

---

## 10. Site Architecture

### 10.1 Patient-Facing (환자향 공개 사이트)

#### Home
- Search
- Categories
- Featured Services
- Featured Hospitals
- Consultation CTA (WhatsApp / WeChat)

#### Category Page (예: Beauty & Skin, Dental)
- Services 목록
- Popular Procedures
- Featured Providers

#### Service Page (예: Ultherapy, Dental Implant)
- Service Overview
- Pricing
- Recommended Hospitals
- FAQ
- Consultation CTA

#### Procedure Page (예: Ultherapy 600 Shots, All-on-4)
- Package Comparison
- Provider Comparison
- Pricing

#### Hospital Page
- Overview
- Strengths
- Supported Procedures
- Doctors
- Languages
- International Services
- Consultation CTA

#### Doctor Page
- Profile
- Experience
- Procedures
- Publications
- Languages

### 10.2 Partner Backoffice (파트너 백오피스)

#### `/partner` — 현지 에이전트 포털
- 내가 소개한 케이스 목록 및 상태 추적
- 신규 케이스 등록 및 의뢰
- 커미션 현황 및 정산 내역 확인
- Curepick 제공 마케팅 자료

#### `/cure-partner` — Cure Partner 포털 (현장 코디네이터)
- 배정된 케이스 목록 및 실시간 상태 관리
- 케이스별 환자 정보 · 병원 예약 현황 · 일정
- 단계별 상태 업데이트 (Confirmed → Arrived → In-Treatment → Completed)
- 케이스 메모 및 활동 기록
- 환자와의 소통 내역 기록
- 에이전트 · 병원과의 협업 채널

#### `/hospital` — 병원 담당자 포털
- 배정된 케이스 목록 및 예약 확인
- 자기 병원 프로필·시술·패키지 수정 요청
- 문의 응대
- 후기 공식 답변
- 기본 통계 (문의 수, 조회 수, 케이스 수)

#### `/admin` — Curepick 본사 운영 포털
**Admin은 플랫폼 운영자입니다. 개별 케이스를 직접 관리하지 않습니다.**

- 플랫폼 콘텐츠 관리 (병원·의사·서비스·카테고리 CRUD)
- 파트너 계정 생성 및 관리 (에이전트·Cure Partner·병원 계정)
- 후기 검수 및 승인/거절
- 커미션 정산 승인 및 관리
- 전체 통계 및 KPI 대시보드
- 사이트 설정 및 운영 공지

---

## 11. MVP+ Scope

### Must Include (포함)

- Service Discovery
- Category Pages
- Service Pages
- Hospital Pages
- Doctor Pages
- Inquiry System (문의 시스템)
- User Authentication (고객 로그인)
- Hospital Backoffice `/hospital` (병원 담당자 백오피스)
- Review & Comment System (후기/리뷰 시스템)
- Multilingual Architecture (다국어 구조)
- SEO Infrastructure
- Service Graph
- HospitalProcedure Graph

### Phase 2 (파트너 생태계 확장)

- Partner/Agent Backoffice `/partner` (현지 에이전트 포털)
- Cure Partner Backoffice `/cure-partner` (현장 코디네이터 포털)
- Case Management System (케이스 CRM — Cure Partner 중심)
- Case Graph (케이스 데이터 모델 — CurePartner 필드 포함)
- Commission Tracking (에이전트 커미션 추적)
- Real-time Case Status (케이스 실시간 상태 업데이트)

### Not Included Yet (미포함)

- AI Agent
- Insurance Integration
- Employer Programs
- Travel Planner
- Online Payment
- Direct Scheduling

---

## 12. User Authentication & Roles

### 12.1 역할 구조

| Role | 포털 | 성격 | 설명 |
|---|---|---|---|
| Patient (고객) | 공개 사이트 | 외부 사용자 | 해외 환자 — 서비스 탐색 + 문의 |
| Local Agent (현지 에이전트) | `/partner` | 외부 파트너 | 현지에서 환자 유치 + 케이스 등록, 커미션 수취 |
| Cure Partner (큐어파트너) | `/cure-partner` | 내부/외부 파트너 | 실제 환자 동선 관리 코디네이터 — 공항부터 퇴원까지 |
| Hospital Staff (병원) | `/hospital` | 외부 파트너 | 병원 담당자 — 케이스 확인, 예약, 프로필 관리 |
| Admin (관리자) | `/admin` | **Curepick 본사 직원** | 플랫폼 운영 — 콘텐츠·계정·정산·검수 |

> **핵심 구분:**
> - Admin = 플랫폼을 관리하는 본사 직원 (케이스를 직접 다루지 않음)
> - Cure Partner = 케이스를 현장에서 실행하는 코디네이터 (데이터를 입력하고 환자와 움직임)

### 12.2 환자 (Patient) 인증

| Method | Provider | 설명 |
|---|---|---|
| Email | Supabase Auth | 이메일 + 비밀번호 가입 |
| Google | Supabase OAuth | Google 계정 로그인 |
| Facebook | Supabase OAuth | Facebook 계정 로그인 |

### 12.3 파트너·내부 인증 (Agent / Cure Partner / Hospital Staff / Admin)

| Method | 설명 |
|---|---|
| Email + Password | Admin이 계정을 생성하여 제공 (셀프 가입 불가) |

- 모든 파트너·내부 계정은 Admin이 생성
- 각 역할은 자신에게 할당된 데이터만 접근 가능 (RLS 적용)
- 에이전트: 자신이 등록한 케이스만 조회 가능
- Cure Partner: 자신에게 배정된 케이스만 조회·수정 가능
- 병원 담당자: 자기 병원에 연결된 케이스·문의만 조회 가능
- Admin: 전체 데이터 접근 (케이스 조회는 가능하나 직접 운영하지 않음)

---

## 13. Hospital Backoffice `/hospital`

병원 담당자가 자기 병원의 정보와 케이스를 직접 관리할 수 있는 백오피스입니다.

### 병원 담당자가 할 수 있는 것

- 자기 병원 프로필 확인 및 수정 요청
- 소속 의사 정보 확인 및 수정 요청
- 시술/패키지 정보 확인 및 수정 요청
- 자기 병원으로 들어온 문의 확인 및 응대
- 배정된 케이스 확인 및 상태 업데이트
- 기본 통계 확인 (문의 수, 케이스 수, 페이지 조회 수)

---

## 14. Partner Backoffice `/partner` (Phase 2)

현지 에이전트가 환자 케이스를 등록하고 추적할 수 있는 포털입니다.

### 에이전트가 할 수 있는 것

- 신규 환자 케이스 등록 및 Curepick에 의뢰
- 내가 소개한 케이스 목록 및 단계별 상태 확인 (Cure Partner가 업데이트하는 상태 실시간 확인)
- 케이스별 담당 Cure Partner 정보 확인
- 커미션 현황 및 정산 내역 확인
- Curepick 제공 마케팅 자료 다운로드

### 에이전트 온보딩

- Curepick과 파트너십 계약 체결
- Admin이 에이전트 계정 생성 및 커미션 구조 설정
- 에이전트는 자신만의 레퍼럴 링크(또는 코드)를 통해 환자 유입 추적 가능

---

## 14-B. Cure Partner Backoffice `/cure-partner` (Phase 2)

실제 환자 동선을 책임지는 Cure Partner의 전용 포털.
이 포털은 **케이스 실행 도구(execution tool)**입니다 — 환자와 함께 움직이며 실시간으로 사용합니다.

### Cure Partner가 할 수 있는 것

**케이스 관리:**
- 나에게 배정된 케이스 목록 및 오늘의 일정 확인
- 케이스 상세: 환자 정보 · 시술 내용 · 병원 · 일정
- 케이스 상태 실시간 업데이트 (한 단계씩 진행)
- 단계별 메모 및 체크리스트 (공항 픽업 완료 ✓, 병원 도착 ✓ 등)

**환자 커뮤니케이션:**
- 환자 연락처 확인 및 WhatsApp/이메일 링크
- 소통 내역 메모 기록

**병원 협업:**
- 배정 병원 담당자 연락처 확인
- 예약 확정 상태 확인

**케이스 완료 처리:**
- 치료 완료 확인 → 후기 수집 요청 발송
- 에이전트 커미션 트리거 (완료 상태로 변경 시 자동)

### Cure Partner 온보딩

- Curepick 본사(Admin)가 Cure Partner 계정 생성
- 언어 능력, 전문 분야(뷰티/의료/치과 등), 담당 가능 지역 프로필 설정
- Admin이 케이스 배정 시 Cure Partner에게 알림

---

## 15. Review & Comment System

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

## 16. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Supabase |
| Hosting | Vercel |
| Localization | next-intl |
| Communication | WhatsApp, WeChat, Email |

---

## 17. Admin(`/admin`) 역할 정의

Admin은 **Curepick 본사 직원**입니다. 플랫폼을 운영·관리하는 사람이며, 환자 개별 케이스를 직접 실행하지 않습니다.

### Admin이 하는 일 (플랫폼 운영)

| 영역 | 구체적 업무 |
|---|---|
| 콘텐츠 관리 | 병원·의사·서비스·카테고리·시술 CRUD |
| 계정 관리 | 에이전트·Cure Partner·병원 담당자 계정 생성 및 관리 |
| 케이스 모니터링 | 전체 케이스 파이프라인 현황 조망 (직접 실행 ❌) |
| 정산 관리 | 에이전트 커미션 정산 승인 및 처리 |
| 품질 관리 | 후기 검수 (승인/거절/Verified 부여) |
| 플랫폼 설정 | Hero 이미지, 사이트 공지, SEO 설정 |
| KPI 대시보드 | 전체 통계 (트래픽, 문의 수, 케이스 전환율, 매출) |

### Admin이 하지 않는 일

- 환자와 직접 소통 ❌ → Cure Partner 역할
- 케이스 상태를 직접 업데이트 ❌ → Cure Partner 역할
- 병원 예약·동행·통역 ❌ → Cure Partner 역할
- 환자 유치·상담 ❌ → Local Agent 역할

---

## 18. Development Principles

1. **Service First** - 서비스 중심 UX
2. **Evidence Based** - 근거 기반 데이터
3. **Multilingual by Default** - 다국어 기본 설계
4. **Korea-first but Globally Expandable** - 한국 우선, 글로벌 확장 가능
5. **Data Model Must Support Future Expansion** - 미래 확장을 지원하는 데이터 모델
6. **Never Build Hospital-first UX** - 절대 병원 중심 UX를 만들지 않음
7. **Partner Network is Core Infrastructure** - 에이전트·Cure Partner·병원의 협업 네트워크가 플랫폼의 운영 근간
8. **Every Case Must Be Traceable** - 모든 케이스는 유입부터 완료까지 추적 가능해야 함
9. **Admin ≠ Executor** - Admin은 플랫폼을 관리하고, Cure Partner가 케이스를 실행한다. 두 역할을 혼용하지 않는다.

---

## 19. Success Definition

### 환자 관점

1. 의료 서비스를 **발견**한다
2. 제공자(병원)를 **비교**한다
3. 가격을 **이해**한다
4. 품질 지표를 **이해**한다
5. **플랫폼을 통해** 제공자에게 **연락**한다
6. 치료를 **예약**하고 **Cure Partner와 함께 완료**한다

### 파트너 관점

1. **에이전트**: 케이스를 손쉽게 등록하고, 케이스가 어느 단계인지 실시간으로 확인할 수 있다
2. **Cure Partner**: 배정된 케이스의 모든 정보를 즉시 파악하고, 환자 동선을 빠짐없이 기록할 수 있다
3. **병원**: 확정된 케이스를 즉시 확인하고, 예약 일정을 관리할 수 있다
4. 각 파트너가 **자신의 기여도와 수익**을 투명하게 확인할 수 있다

### Admin(본사) 관점

1. 플랫폼의 모든 데이터가 **정확하고 최신 상태**로 유지된다
2. 파트너 생태계가 **자체적으로 운영**될 수 있다 (Admin 개입 최소화)
3. 전체 케이스 전환율과 매출을 **한눈에 파악**할 수 있다

> 플랫폼은 사용자가 **더 나은 의료 결정**을 내리도록 돕고,
> Cure Partner가 **환자의 모든 여정을 완성**할 수 있는 인프라를 제공해야 성공입니다.
