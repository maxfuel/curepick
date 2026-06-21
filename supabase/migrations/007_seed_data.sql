-- Migration 007: Seed Data
-- Intents, Categories, Services, Procedures, Hospitals, Doctors,
-- HospitalProcedures, FAQs

-- ============================================================
-- Intents (4개)
-- ============================================================
INSERT INTO intents (id, name, slug, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', '{"en": "Treat Disease", "ko": "질병 치료"}', 'treat-disease', 1),
  ('a0000000-0000-0000-0000-000000000002', '{"en": "Improve Health", "ko": "건강 개선"}', 'improve-health', 2),
  ('a0000000-0000-0000-0000-000000000003', '{"en": "Look Better", "ko": "외모 개선"}', 'look-better', 3),
  ('a0000000-0000-0000-0000-000000000004', '{"en": "Live Longer", "ko": "장수"}', 'live-longer', 4);

-- ============================================================
-- Categories (2개)
-- ============================================================
INSERT INTO categories (id, intent_id, name, slug, description, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000003',
   '{"en": "Beauty & Skin", "ko": "뷰티 & 피부"}',
   'beauty-skin',
   '{"en": "Non-surgical and surgical aesthetic procedures for skin rejuvenation and beauty enhancement.", "ko": "피부 재생 및 미용 향상을 위한 비수술/수술적 시술."}',
   1),
  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   '{"en": "Dental", "ko": "치과"}',
   'dental',
   '{"en": "Comprehensive dental treatments including implants, orthodontics, and oral surgery.", "ko": "임플란트, 교정, 구강 수술 등 종합 치과 치료."}',
   2);

-- ============================================================
-- Services (5개)
-- ============================================================

-- Beauty & Skin services
INSERT INTO services (id, category_id, name, slug, description, overview, sort_order, is_featured) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   '{"en": "Ultherapy", "ko": "울쎄라"}',
   'ultherapy',
   '{"en": "FDA-cleared ultrasound treatment that lifts and tightens skin on the face, neck, and chest.", "ko": "얼굴, 목, 가슴 피부를 리프팅하고 조여주는 FDA 승인 초음파 시술."}',
   '{"en": "Ultherapy uses focused ultrasound energy to stimulate collagen production deep within the skin, resulting in a natural lifting and tightening effect over 2-3 months.", "ko": "울쎄라는 집속 초음파 에너지를 사용하여 피부 깊숙이 콜라겐 생성을 촉진하며, 2-3개월에 걸쳐 자연스러운 리프팅 및 타이트닝 효과를 제공합니다."}',
   1, true),
  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   '{"en": "Thermage", "ko": "써마지"}',
   'thermage',
   '{"en": "Radiofrequency treatment that smooths, tightens, and contours skin for an overall younger-looking appearance.", "ko": "피부를 매끄럽게 하고 조여주며 윤곽을 개선하여 전체적으로 젊어 보이게 하는 고주파 시술."}',
   '{"en": "Thermage uses radiofrequency technology to heat the deep, collagen-rich layers of your skin. The treatment stimulates collagen renewal, resulting in tighter, smoother skin.", "ko": "써마지는 고주파 기술을 사용하여 피부의 콜라겐이 풍부한 깊은 층을 가열합니다. 콜라겐 재생을 촉진하여 더 탄력 있고 매끄러운 피부를 만듭니다."}',
   2, true),
  ('c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000001',
   '{"en": "Rejuran", "ko": "리쥬란"}',
   'rejuran',
   '{"en": "Polynucleotide-based skin healing treatment that improves skin texture, elasticity, and overall health.", "ko": "피부 질감, 탄력 및 전반적인 건강을 개선하는 폴리뉴클레오타이드 기반 피부 힐링 시술."}',
   '{"en": "Rejuran Healer uses polynucleotides (PN) derived from salmon DNA to repair damaged skin cells and promote natural skin regeneration from within.", "ko": "리쥬란 힐러는 연어 DNA에서 추출한 폴리뉴클레오타이드(PN)를 사용하여 손상된 피부 세포를 복구하고 내부에서부터 자연스러운 피부 재생을 촉진합니다."}',
   3, false);

-- Dental services
INSERT INTO services (id, category_id, name, slug, description, overview, sort_order, is_featured) VALUES
  ('c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000002',
   '{"en": "Dental Implant", "ko": "치과 임플란트"}',
   'dental-implant',
   '{"en": "Permanent tooth replacement solution using titanium posts surgically placed into the jawbone.", "ko": "턱뼈에 외과적으로 삽입하는 티타늄 포스트를 사용한 영구적 치아 대체 솔루션."}',
   '{"en": "Dental implants are the gold standard for replacing missing teeth. A titanium post is surgically placed into the jawbone, where it fuses with the bone to create a strong foundation for a replacement tooth.", "ko": "치과 임플란트는 결손 치아를 대체하는 최고 수준의 솔루션입니다. 티타늄 포스트를 턱뼈에 외과적으로 삽입하여 뼈와 융합시켜 대체 치아의 강력한 기반을 만듭니다."}',
   1, true),
  ('c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000002',
   '{"en": "Wisdom Tooth Extraction", "ko": "사랑니 발치"}',
   'wisdom-tooth-extraction',
   '{"en": "Surgical removal of impacted or problematic wisdom teeth to prevent pain and dental complications.", "ko": "통증과 치과 합병증을 예방하기 위한 매복 또는 문제 사랑니의 외과적 제거."}',
   '{"en": "Wisdom tooth extraction is a common dental procedure to remove one or more wisdom teeth that are impacted, causing pain, or leading to other dental problems.", "ko": "사랑니 발치는 매복되거나 통증을 유발하거나 다른 치과 문제를 일으키는 사랑니를 하나 이상 제거하는 일반적인 치과 시술입니다."}',
   2, false);

-- ============================================================
-- Procedures (각 Service별 2-3개)
-- ============================================================

-- Ultherapy procedures
INSERT INTO procedures (id, service_id, name, slug, description, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000001',
   'c0000000-0000-0000-0000-000000000001',
   '{"en": "Ultherapy Full Face (300 shots)", "ko": "울쎄라 전체 얼굴 (300샷)"}',
   'ultherapy-full-face-300',
   '{"en": "Standard full face treatment with 300 ultrasound shots covering forehead, cheeks, and jawline.", "ko": "이마, 볼, 턱선을 포함한 300샷 표준 전체 얼굴 시술."}',
   1),
  ('d0000000-0000-0000-0000-000000000002',
   'c0000000-0000-0000-0000-000000000001',
   '{"en": "Ultherapy Full Face (600 shots)", "ko": "울쎄라 전체 얼굴 (600샷)"}',
   'ultherapy-full-face-600',
   '{"en": "Premium full face treatment with 600 ultrasound shots for enhanced lifting and tightening results.", "ko": "향상된 리프팅 및 타이트닝 효과를 위한 600샷 프리미엄 전체 얼굴 시술."}',
   2),
  ('d0000000-0000-0000-0000-000000000003',
   'c0000000-0000-0000-0000-000000000001',
   '{"en": "Ultherapy Neck & Décolletage", "ko": "울쎄라 목 & 데콜테"}',
   'ultherapy-neck-decolletage',
   '{"en": "Targeted treatment for the neck and chest area to improve skin laxity and fine lines.", "ko": "피부 처짐과 잔주름 개선을 위한 목과 가슴 부위 집중 시술."}',
   3);

-- Thermage procedures
INSERT INTO procedures (id, service_id, name, slug, description, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000004',
   'c0000000-0000-0000-0000-000000000002',
   '{"en": "Thermage FLX Face (300 shots)", "ko": "써마지 FLX 얼굴 (300샷)"}',
   'thermage-flx-face-300',
   '{"en": "Face treatment using the latest FLX technology with 300 shots for skin tightening.", "ko": "피부 타이트닝을 위한 최신 FLX 기술 300샷 얼굴 시술."}',
   1),
  ('d0000000-0000-0000-0000-000000000005',
   'c0000000-0000-0000-0000-000000000002',
   '{"en": "Thermage FLX Face (600 shots)", "ko": "써마지 FLX 얼굴 (600샷)"}',
   'thermage-flx-face-600',
   '{"en": "Enhanced face treatment with 600 shots for comprehensive skin tightening and contouring.", "ko": "포괄적인 피부 타이트닝 및 윤곽 개선을 위한 600샷 강화 얼굴 시술."}',
   2),
  ('d0000000-0000-0000-0000-000000000006',
   'c0000000-0000-0000-0000-000000000002',
   '{"en": "Thermage FLX Eyes", "ko": "써마지 FLX 눈가"}',
   'thermage-flx-eyes',
   '{"en": "Specialized eye area treatment to reduce hooding, fine lines, and wrinkles around the eyes.", "ko": "눈꺼풀 처짐, 잔주름, 눈가 주름 감소를 위한 전문 눈가 시술."}',
   3);

-- Rejuran procedures
INSERT INTO procedures (id, service_id, name, slug, description, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000007',
   'c0000000-0000-0000-0000-000000000003',
   '{"en": "Rejuran Healer", "ko": "리쥬란 힐러"}',
   'rejuran-healer',
   '{"en": "Standard Rejuran treatment for overall skin rejuvenation and texture improvement.", "ko": "전반적인 피부 재생 및 질감 개선을 위한 표준 리쥬란 시술."}',
   1),
  ('d0000000-0000-0000-0000-000000000008',
   'c0000000-0000-0000-0000-000000000003',
   '{"en": "Rejuran i (Eye)", "ko": "리쥬란 아이"}',
   'rejuran-eye',
   '{"en": "Specialized Rejuran formula for the delicate under-eye area to reduce dark circles and fine lines.", "ko": "다크서클과 잔주름 감소를 위한 섬세한 눈 밑 전용 리쥬란 포뮬러."}',
   2);

-- Dental Implant procedures
INSERT INTO procedures (id, service_id, name, slug, description, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000009',
   'c0000000-0000-0000-0000-000000000004',
   '{"en": "Single Dental Implant", "ko": "단일 치과 임플란트"}',
   'single-dental-implant',
   '{"en": "Single tooth replacement with titanium implant, abutment, and crown.", "ko": "티타늄 임플란트, 어버트먼트, 크라운을 사용한 단일 치아 대체."}',
   1),
  ('d0000000-0000-0000-0000-000000000010',
   'c0000000-0000-0000-0000-000000000004',
   '{"en": "All-on-4 Implant", "ko": "올온포 임플란트"}',
   'all-on-4-implant',
   '{"en": "Full arch restoration using 4 strategically placed implants to support a complete set of teeth.", "ko": "전체 치아를 지지하기 위해 전략적으로 배치된 4개의 임플란트를 사용한 전악 복원."}',
   2),
  ('d0000000-0000-0000-0000-000000000011',
   'c0000000-0000-0000-0000-000000000004',
   '{"en": "All-on-6 Implant", "ko": "올온식스 임플란트"}',
   'all-on-6-implant',
   '{"en": "Full arch restoration using 6 implants for enhanced stability and load distribution.", "ko": "향상된 안정성과 하중 분산을 위해 6개의 임플란트를 사용한 전악 복원."}',
   3);

-- Wisdom Tooth procedures
INSERT INTO procedures (id, service_id, name, slug, description, sort_order) VALUES
  ('d0000000-0000-0000-0000-000000000012',
   'c0000000-0000-0000-0000-000000000005',
   '{"en": "Simple Wisdom Tooth Extraction", "ko": "단순 사랑니 발치"}',
   'simple-wisdom-tooth-extraction',
   '{"en": "Removal of erupted wisdom teeth that are accessible and straightforward to extract.", "ko": "접근 가능하고 발치가 간단한 맹출 사랑니 제거."}',
   1),
  ('d0000000-0000-0000-0000-000000000013',
   'c0000000-0000-0000-0000-000000000005',
   '{"en": "Surgical Wisdom Tooth Extraction", "ko": "매복 사랑니 발치"}',
   'surgical-wisdom-tooth-extraction',
   '{"en": "Surgical removal of impacted wisdom teeth requiring incision, bone removal, and suturing.", "ko": "절개, 골 삭제, 봉합이 필요한 매복 사랑니의 외과적 제거."}',
   2);

-- ============================================================
-- Hospitals (3개)
-- ============================================================
INSERT INTO hospitals (id, name, slug, description, address, city, accreditation, international_center, languages, phone, email, website, is_featured) VALUES
  ('e0000000-0000-0000-0000-000000000001',
   '{"en": "Gangnam Aesthetic Clinic A", "ko": "강남 에스테틱 클리닉 A"}',
   'gangnam-aesthetic-clinic-a',
   '{"en": "Premier aesthetic clinic in Gangnam specializing in non-surgical skin treatments with over 15 years of experience.", "ko": "15년 이상의 경험을 가진 비수술 피부 시술 전문 강남 프리미어 에스테틱 클리닉."}',
   '{"en": "123 Gangnam-daero, Gangnam-gu, Seoul", "ko": "서울특별시 강남구 강남대로 123"}',
   'Seoul',
   'JCI',
   true,
   ARRAY['en', 'ko', 'zh'],
   '+82-2-1234-5678',
   'contact@gangnam-clinic-a.com',
   'https://gangnam-clinic-a.com',
   true),
  ('e0000000-0000-0000-0000-000000000002',
   '{"en": "Gangnam Beauty Clinic B", "ko": "강남 뷰티 클리닉 B"}',
   'gangnam-beauty-clinic-b',
   '{"en": "State-of-the-art beauty clinic offering comprehensive aesthetic and dermatological services.", "ko": "종합 미용 및 피부과 서비스를 제공하는 최첨단 뷰티 클리닉."}',
   '{"en": "456 Teheran-ro, Gangnam-gu, Seoul", "ko": "서울특별시 강남구 테헤란로 456"}',
   'Seoul',
   NULL,
   true,
   ARRAY['en', 'ko'],
   '+82-2-2345-6789',
   'contact@gangnam-clinic-b.com',
   'https://gangnam-clinic-b.com',
   true),
  ('e0000000-0000-0000-0000-000000000003',
   '{"en": "Seoul Dental Center C", "ko": "서울 덴탈 센터 C"}',
   'seoul-dental-center-c',
   '{"en": "Leading dental center in Seoul with advanced implant technology and experienced oral surgeons.", "ko": "첨단 임플란트 기술과 경험 많은 구강외과 의사를 갖춘 서울 선도 치과 센터."}',
   '{"en": "789 Apgujeong-ro, Gangnam-gu, Seoul", "ko": "서울특별시 강남구 압구정로 789"}',
   'Seoul',
   'JCI',
   true,
   ARRAY['en', 'ko', 'ja'],
   '+82-2-3456-7890',
   'contact@seoul-dental-c.com',
   'https://seoul-dental-c.com',
   true);

-- ============================================================
-- Doctors (5명)
-- ============================================================
INSERT INTO doctors (id, hospital_id, name, slug, specialty, experience_years, bio, languages) VALUES
  ('f0000000-0000-0000-0000-000000000001',
   'e0000000-0000-0000-0000-000000000001',
   '{"en": "Dr. Min-Jun Kim", "ko": "김민준 원장"}',
   'dr-min-jun-kim',
   '{"en": "Dermatology, Aesthetic Medicine", "ko": "피부과, 미용의학"}',
   18,
   '{"en": "Board-certified dermatologist with 18 years of experience specializing in Ultherapy and Thermage treatments. Published over 20 research papers on non-surgical skin rejuvenation.", "ko": "울쎄라 및 써마지 시술을 전문으로 하는 18년 경력의 피부과 전문의. 비수술 피부 재생에 관한 20편 이상의 연구 논문 발표."}',
   ARRAY['en', 'ko']),
  ('f0000000-0000-0000-0000-000000000002',
   'e0000000-0000-0000-0000-000000000001',
   '{"en": "Dr. Soo-Yeon Park", "ko": "박수연 원장"}',
   'dr-soo-yeon-park',
   '{"en": "Dermatology, Skin Regeneration", "ko": "피부과, 피부 재생"}',
   12,
   '{"en": "Dermatologist specializing in Rejuran and regenerative skin treatments with 12 years of clinical experience.", "ko": "12년의 임상 경험을 가진 리쥬란 및 재생 피부 시술 전문 피부과 의사."}',
   ARRAY['en', 'ko', 'zh']),
  ('f0000000-0000-0000-0000-000000000003',
   'e0000000-0000-0000-0000-000000000002',
   '{"en": "Dr. Ji-Hoon Lee", "ko": "이지훈 원장"}',
   'dr-ji-hoon-lee',
   '{"en": "Plastic Surgery, Aesthetic Medicine", "ko": "성형외과, 미용의학"}',
   15,
   '{"en": "Double board-certified in plastic surgery and dermatology with expertise in energy-based skin treatments.", "ko": "에너지 기반 피부 시술에 전문성을 가진 성형외과 및 피부과 이중 전문의."}',
   ARRAY['en', 'ko']),
  ('f0000000-0000-0000-0000-000000000004',
   'e0000000-0000-0000-0000-000000000003',
   '{"en": "Dr. Hyun-Woo Choi", "ko": "최현우 원장"}',
   'dr-hyun-woo-choi',
   '{"en": "Oral Surgery, Implantology", "ko": "구강외과, 임플란트학"}',
   20,
   '{"en": "Leading implant specialist with 20 years of experience and over 10,000 successful implant placements.", "ko": "20년 경력과 10,000건 이상의 성공적인 임플란트 식립 기록을 가진 임플란트 전문의."}',
   ARRAY['en', 'ko', 'ja']),
  ('f0000000-0000-0000-0000-000000000005',
   'e0000000-0000-0000-0000-000000000003',
   '{"en": "Dr. Eun-Ji Yoon", "ko": "윤은지 원장"}',
   'dr-eun-ji-yoon',
   '{"en": "Oral Surgery, General Dentistry", "ko": "구강외과, 일반 치과"}',
   8,
   '{"en": "Skilled oral surgeon specializing in wisdom tooth extractions and minor oral surgical procedures.", "ko": "사랑니 발치와 소규모 구강 외과 시술을 전문으로 하는 숙련된 구강외과 전문의."}',
   ARRAY['en', 'ko']);

-- ============================================================
-- Hospital Procedures (병원-시술 연결)
-- ============================================================

-- Clinic A: Ultherapy, Thermage, Rejuran procedures
INSERT INTO hospital_procedures (hospital_id, procedure_id, annual_volume, specialist_count, waiting_time_days, cost_min, cost_max, cost_currency, languages, intl_patient_support, evidence_score, is_featured) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1200, 2, 3, 800, 1200, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.5, true),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 800, 2, 5, 1500, 2200, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.5, true),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 400, 2, 3, 600, 900, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.2, false),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 900, 2, 3, 700, 1100, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.3, true),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000005', 600, 2, 5, 1300, 2000, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.3, false),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007', 500, 1, 2, 200, 350, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.0, false),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000008', 300, 1, 2, 150, 250, 'USD', ARRAY['en', 'ko', 'zh'], true, 4.0, false);

-- Clinic B: Ultherapy, Thermage procedures
INSERT INTO hospital_procedures (hospital_id, procedure_id, annual_volume, specialist_count, waiting_time_days, cost_min, cost_max, cost_currency, languages, intl_patient_support, evidence_score, is_featured) VALUES
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 800, 1, 5, 700, 1000, 'USD', ARRAY['en', 'ko'], true, 4.0, true),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 500, 1, 7, 1300, 1900, 'USD', ARRAY['en', 'ko'], true, 4.0, false),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', 600, 1, 5, 600, 950, 'USD', ARRAY['en', 'ko'], true, 3.8, false),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000006', 400, 1, 5, 500, 800, 'USD', ARRAY['en', 'ko'], true, 3.8, false);

-- Dental Center C: Dental Implant, Wisdom Tooth procedures
INSERT INTO hospital_procedures (hospital_id, procedure_id, annual_volume, specialist_count, waiting_time_days, cost_min, cost_max, cost_currency, languages, intl_patient_support, evidence_score, is_featured) VALUES
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000009', 2000, 3, 7, 1000, 1800, 'USD', ARRAY['en', 'ko', 'ja'], true, 4.8, true),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000010', 300, 2, 14, 8000, 15000, 'USD', ARRAY['en', 'ko', 'ja'], true, 4.7, true),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000011', 200, 2, 14, 10000, 18000, 'USD', ARRAY['en', 'ko', 'ja'], true, 4.7, false),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000012', 1500, 2, 3, 100, 200, 'USD', ARRAY['en', 'ko', 'ja'], true, 4.5, false),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000013', 800, 2, 5, 200, 500, 'USD', ARRAY['en', 'ko', 'ja'], true, 4.5, false);

-- ============================================================
-- FAQs (서비스별 2-3개)
-- ============================================================

-- Ultherapy FAQs
INSERT INTO faqs (service_id, question, answer, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   '{"en": "How long does an Ultherapy session take?", "ko": "울쎄라 시술은 얼마나 걸리나요?"}',
   '{"en": "A typical Ultherapy session takes 60-90 minutes depending on the treatment area. Full face treatments usually take about 90 minutes.", "ko": "일반적인 울쎄라 시술은 시술 부위에 따라 60-90분 정도 소요됩니다. 전체 얼굴 시술은 보통 약 90분 걸립니다."}',
   1),
  ('c0000000-0000-0000-0000-000000000001',
   '{"en": "When will I see results from Ultherapy?", "ko": "울쎄라 결과는 언제 볼 수 있나요?"}',
   '{"en": "Some patients see initial effects immediately, but the full results typically appear over 2-3 months as new collagen is produced. Results can last up to a year or more.", "ko": "일부 환자는 즉시 초기 효과를 볼 수 있지만, 새로운 콜라겐이 생성되면서 전체 결과는 보통 2-3개월에 걸쳐 나타납니다. 결과는 1년 이상 지속될 수 있습니다."}',
   2),
  ('c0000000-0000-0000-0000-000000000001',
   '{"en": "Is Ultherapy painful?", "ko": "울쎄라는 아픈가요?"}',
   '{"en": "Patients may experience some discomfort during treatment as the ultrasound energy is delivered. Most clinics offer pain management options including topical anesthesia or mild sedation.", "ko": "초음파 에너지가 전달되는 동안 약간의 불편함을 느낄 수 있습니다. 대부분의 클리닉에서 국소 마취나 가벼운 진정제 등 통증 관리 옵션을 제공합니다."}',
   3);

-- Thermage FAQs
INSERT INTO faqs (service_id, question, answer, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000002',
   '{"en": "What is the difference between Thermage and Ultherapy?", "ko": "써마지와 울쎄라의 차이점은 무엇인가요?"}',
   '{"en": "Thermage uses radiofrequency energy while Ultherapy uses focused ultrasound. Thermage is better for skin tightening and texture improvement, while Ultherapy excels at lifting. Many patients combine both for optimal results.", "ko": "써마지는 고주파 에너지를, 울쎄라는 집속 초음파를 사용합니다. 써마지는 피부 타이트닝과 질감 개선에 더 좋고, 울쎄라는 리프팅에 뛰어납니다. 많은 환자들이 최적의 결과를 위해 두 가지를 병행합니다."}',
   1),
  ('c0000000-0000-0000-0000-000000000002',
   '{"en": "How often should I get Thermage?", "ko": "써마지는 얼마나 자주 받아야 하나요?"}',
   '{"en": "Most practitioners recommend Thermage treatments once every 1-2 years for maintenance. Results continue to improve for up to 6 months after treatment.", "ko": "대부분의 전문의는 유지를 위해 1-2년에 한 번 써마지 시술을 권장합니다. 결과는 시술 후 최대 6개월까지 계속 개선됩니다."}',
   2);

-- Rejuran FAQs
INSERT INTO faqs (service_id, question, answer, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000003',
   '{"en": "How many Rejuran sessions do I need?", "ko": "리쥬란은 몇 회 시술이 필요한가요?"}',
   '{"en": "Most patients see optimal results after 3-4 sessions spaced 2-4 weeks apart. Maintenance sessions are recommended every 3-6 months.", "ko": "대부분의 환자는 2-4주 간격으로 3-4회 시술 후 최적의 결과를 봅니다. 3-6개월마다 유지 시술을 권장합니다."}',
   1),
  ('c0000000-0000-0000-0000-000000000003',
   '{"en": "Is there downtime after Rejuran?", "ko": "리쥬란 시술 후 다운타임이 있나요?"}',
   '{"en": "Minimal downtime is expected. You may experience small bumps at injection sites that typically resolve within 1-2 days. Mild redness may last 2-3 days.", "ko": "최소한의 다운타임이 예상됩니다. 주사 부위에 작은 돌기가 생길 수 있으며 보통 1-2일 내에 사라집니다. 가벼운 홍조는 2-3일 지속될 수 있습니다."}',
   2);

-- Dental Implant FAQs
INSERT INTO faqs (service_id, question, answer, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000004',
   '{"en": "How long does the dental implant process take?", "ko": "치과 임플란트 과정은 얼마나 걸리나요?"}',
   '{"en": "The entire process typically takes 3-6 months. After implant placement, 3-6 months of healing is needed for osseointegration before the final crown is placed.", "ko": "전체 과정은 보통 3-6개월 소요됩니다. 임플란트 식립 후 최종 크라운을 장착하기 전에 골유합을 위해 3-6개월의 치유 기간이 필요합니다."}',
   1),
  ('c0000000-0000-0000-0000-000000000004',
   '{"en": "How long do dental implants last?", "ko": "치과 임플란트는 얼마나 오래 지속되나요?"}',
   '{"en": "With proper care and maintenance, dental implants can last 25 years or even a lifetime. Regular dental check-ups and good oral hygiene are essential.", "ko": "적절한 관리와 유지로 치과 임플란트는 25년 이상 또는 평생 지속될 수 있습니다. 정기적인 치과 검진과 올바른 구강 위생이 필수적입니다."}',
   2),
  ('c0000000-0000-0000-0000-000000000004',
   '{"en": "Am I a good candidate for dental implants?", "ko": "제가 치과 임플란트 대상자인가요?"}',
   '{"en": "Most adults with good general health are candidates. You need adequate jawbone density to support the implant. Conditions like uncontrolled diabetes or heavy smoking may affect eligibility.", "ko": "일반적으로 건강 상태가 양호한 성인 대부분이 대상자입니다. 임플란트를 지지할 수 있는 적절한 턱뼈 밀도가 필요합니다. 조절되지 않는 당뇨병이나 심한 흡연은 적격 여부에 영향을 미칠 수 있습니다."}',
   3);

-- Wisdom Tooth FAQs
INSERT INTO faqs (service_id, question, answer, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000005',
   '{"en": "How long is the recovery after wisdom tooth extraction?", "ko": "사랑니 발치 후 회복 기간은 얼마나 되나요?"}',
   '{"en": "Recovery typically takes 3-7 days. Swelling peaks around 48 hours and gradually subsides. Most patients return to normal activities within a week.", "ko": "회복은 보통 3-7일 정도 걸립니다. 부기는 약 48시간에 최고조에 달하고 점차 줄어듭니다. 대부분의 환자는 일주일 이내에 정상 활동에 복귀합니다."}',
   1),
  ('c0000000-0000-0000-0000-000000000005',
   '{"en": "Do all wisdom teeth need to be removed?", "ko": "모든 사랑니를 발치해야 하나요?"}',
   '{"en": "Not all wisdom teeth need removal. Extraction is recommended when they are impacted, causing pain, damaging adjacent teeth, or leading to repeated infections.", "ko": "모든 사랑니를 발치할 필요는 없습니다. 매복되었거나, 통증을 유발하거나, 인접 치아를 손상시키거나, 반복적인 감염을 일으킬 때 발치를 권장합니다."}',
   2);
