-- Migration 015: Service Taxonomy Expansion
-- 2025 Korean medical tourism statistics based priority ordering
-- Updates sort_order for existing categories, adds plastic-surgery + services

-- ============================================================
-- Update sort_order for existing categories (using actual slugs in DB)
-- Priority: Beauty & Skin(1) > Plastic Surgery(2) > Dental(3) >
--           Health Check-up(4) > Fertility(5) > Hair(6) > Eye(7) > Ortho(8)
-- ============================================================
UPDATE categories SET sort_order = 1 WHERE slug = 'beauty-skin';
UPDATE categories SET sort_order = 3 WHERE slug = 'dental';
UPDATE categories SET sort_order = 4 WHERE slug = 'health-checkup';
UPDATE categories SET sort_order = 5 WHERE slug = 'fertility';
UPDATE categories SET sort_order = 6 WHERE slug = 'hair';
UPDATE categories SET sort_order = 7 WHERE slug = 'eye-care';
UPDATE categories SET sort_order = 8 WHERE slug = 'orthopedics';

-- ============================================================
-- Add Plastic Surgery category (not yet in DB)
-- ============================================================
INSERT INTO categories (intent_id, name, slug, sort_order)
SELECT
  id AS intent_id,
  '{"ko":"성형외과","en":"Plastic Surgery","zh":"整形外科","zh-TW":"整形外科","ja":"形成外科","ru":"Пластическая хирургия","ar":"جراحة التجميل","uk":"Пластична хірургія","kk":"Пластикалық хирургия","it":"Chirurgia plastica","es":"Cirugía plástica","id":"Bedah plastik","pt":"Cirurgia plástica","de":"Plastische Chirurgie","fr":"Chirurgie plastique","pl":"Chirurgia plastyczna"}'::jsonb,
  'plastic-surgery',
  2
FROM intents WHERE slug = 'look-better'
ON CONFLICT (slug) DO UPDATE SET sort_order = 2;

-- ============================================================
-- Add services for Plastic Surgery (look up category_id by slug)
-- ============================================================
INSERT INTO services (category_id, name, slug, sort_order, is_featured)
SELECT
  c.id,
  '{"ko":"코성형","en":"Rhinoplasty","zh":"鼻整形","zh-TW":"鼻整形","ja":"鼻形成術"}'::jsonb,
  'rhinoplasty',
  1,
  true
FROM categories c WHERE c.slug = 'plastic-surgery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, sort_order, is_featured)
SELECT
  c.id,
  '{"ko":"쌍꺼풀수술","en":"Eyelid Surgery","zh":"双眼皮手术","zh-TW":"雙眼皮手術","ja":"二重まぶた手術"}'::jsonb,
  'eyelid-surgery',
  2,
  true
FROM categories c WHERE c.slug = 'plastic-surgery'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, sort_order, is_featured)
SELECT
  c.id,
  '{"ko":"지방흡입","en":"Liposuction","zh":"脂肪抽吸","zh-TW":"脂肪抽吸","ja":"脂肪吸引"}'::jsonb,
  'liposuction',
  3,
  false
FROM categories c WHERE c.slug = 'plastic-surgery'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Add Comprehensive Health Check-up for Health Check-up category
-- ============================================================
INSERT INTO services (category_id, name, slug, sort_order, is_featured)
SELECT
  c.id,
  '{"ko":"종합건강검진","en":"Comprehensive Health Check-up","zh":"综合体检","zh-TW":"綜合體檢","ja":"総合健康診断"}'::jsonb,
  'comprehensive-checkup',
  3,
  true
FROM categories c WHERE c.slug = 'health-checkup'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Multilingual name updates for existing categories
-- (admin UI only fills ko/en/zh/ja; extend to all 16 languages)
-- ============================================================
UPDATE categories SET name = '{"ko":"뷰티 & 피부","en":"Beauty & Skin","zh":"美容与皮肤","zh-TW":"美容與皮膚","ja":"美容・スキン","ru":"Красота и кожа","ar":"الجمال والبشرة","uk":"Краса та шкіра","kk":"Сұлулық және тері","it":"Bellezza e pelle","es":"Belleza y piel","id":"Kecantikan dan kulit","pt":"Beleza e pele","de":"Schönheit und Haut","fr":"Beauté et peau","pl":"Uroda i skóra"}'::jsonb WHERE slug = 'beauty-skin';

UPDATE categories SET name = '{"ko":"치과","en":"Dental","zh":"牙科","zh-TW":"牙科","ja":"歯科","ru":"Стоматология","ar":"طب الأسنان","uk":"Стоматологія","kk":"Стоматология","it":"Dentistica","es":"Dental","id":"Gigi","pt":"Odontologia","de":"Zahnmedizin","fr":"Dentaire","pl":"Stomatologia"}'::jsonb WHERE slug = 'dental';

UPDATE categories SET name = '{"ko":"건강검진","en":"Health Check-up","zh":"健康检查","zh-TW":"健康檢查","ja":"健康診断","ru":"Медосмотр","ar":"فحص صحي","uk":"Медичний огляд","kk":"Денсаулық тексеру","it":"Check-up sanitario","es":"Chequeo médico","id":"Pemeriksaan kesehatan","pt":"Check-up de saúde","de":"Gesundheitscheck","fr":"Bilan de santé","pl":"Badanie zdrowotne"}'::jsonb WHERE slug = 'health-checkup';

UPDATE categories SET name = '{"ko":"산부인과·난임","en":"Fertility & Women''s Health","zh":"妇科与不孕不育","zh-TW":"婦科與不孕不育","ja":"婦人科・不妊治療","ru":"Гинекология и фертильность","ar":"طب النساء والخصوبة","uk":"Гінекологія та фертильність","kk":"Гинекология және ұрпақтылық","it":"Ginecologia e fertilità","es":"Ginecología y fertilidad","id":"Ginekologi dan kesuburan","pt":"Ginecologia e fertilidade","de":"Gynäkologie und Fruchtbarkeit","fr":"Gynécologie et fertilité","pl":"Ginekologia i płodność"}'::jsonb WHERE slug = 'fertility';

UPDATE categories SET name = '{"ko":"모발","en":"Hair","zh":"植发","zh-TW":"植髮","ja":"植毛","ru":"Волосы","ar":"الشعر","uk":"Волосся","kk":"Шаш","it":"Capelli","es":"Cabello","id":"Rambut","pt":"Cabelo","de":"Haare","fr":"Cheveux","pl":"Włosy"}'::jsonb WHERE slug = 'hair';

UPDATE categories SET name = '{"ko":"안과","en":"Eye Care","zh":"眼科","zh-TW":"眼科","ja":"眼科","ru":"Офтальмология","ar":"طب العيون","uk":"Офтальмологія","kk":"Офтальмология","it":"Cure oculistiche","es":"Cuidado ocular","id":"Perawatan mata","pt":"Cuidados oculares","de":"Augenpflege","fr":"Soins oculaires","pl":"Okulistyka"}'::jsonb WHERE slug = 'eye-care';

UPDATE categories SET name = '{"ko":"정형외과","en":"Orthopedics & Spine","zh":"骨科与脊椎","zh-TW":"骨科與脊椎","ja":"整形外科・脊椎","ru":"Ортопедия и позвоночник","ar":"العظام والعمود الفقري","uk":"Ортопедія та хребет","kk":"Ортопедия және омыртқа","it":"Ortopedia e colonna vertebrale","es":"Ortopedia y columna","id":"Ortopedi dan tulang belakang","pt":"Ortopedia e coluna","de":"Orthopädie und Wirbelsäule","fr":"Orthopédie et colonne","pl":"Ortopedia i kręgosłup"}'::jsonb WHERE slug = 'orthopedics';
