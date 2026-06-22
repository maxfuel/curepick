-- ============================================================
-- Curepick Extended Taxonomy Seed
-- Supabase Dashboard > SQL Editor에서 실행
-- 멱등성 보장: ON CONFLICT DO NOTHING / DO UPDATE
-- ============================================================

-- ============================================================
-- 1. INTENTS — zh/ja 번역 추가
-- ============================================================

UPDATE intents SET name = '{"en":"Treat Disease","ko":"질병 치료","zh":"治疗疾病","ja":"疾患を治す"}' WHERE slug = 'treat-disease';
UPDATE intents SET name = '{"en":"Improve Health","ko":"건강 개선","zh":"改善健康","ja":"健康を改善する"}' WHERE slug = 'improve-health';
UPDATE intents SET name = '{"en":"Look Better","ko":"외모 개선","zh":"改善外貌","ja":"外見を整える"}' WHERE slug = 'look-better';
UPDATE intents SET name = '{"en":"Live Longer","ko":"장수","zh":"延年益寿","ja":"長生きする"}' WHERE slug = 'live-longer';

-- ============================================================
-- 2. EXISTING CATEGORIES — zh/ja 번역 추가
-- ============================================================

UPDATE categories SET
  name = '{"en":"Beauty & Skin","ko":"뷰티 & 피부","zh":"美容与皮肤","ja":"美容・スキン"}',
  description = '{"en":"Advanced skin rejuvenation and non-surgical beauty treatments using cutting-edge technology","ko":"최첨단 기술을 활용한 피부 재생 및 비수술적 뷰티 트리트먼트","zh":"采用尖端技术进行先进的皮肤再生和非手术美容治疗","ja":"最先端技術を使った高度な肌再生・非外科的美容トリートメント"}'
WHERE slug = 'beauty-skin';

UPDATE categories SET
  name = '{"en":"Dental","ko":"치과","zh":"牙科","ja":"歯科"}',
  description = '{"en":"World-class dental care including implants, orthodontics, and cosmetic dentistry","ko":"임플란트, 교정, 심미 치과를 포함한 세계적 수준의 치과 진료","zh":"包括种植牙、正畸和美容牙科在内的世界级牙科护理","ja":"インプラント、矯正、審美歯科を含む世界水準の歯科治療"}'
WHERE slug = 'dental';

-- ============================================================
-- 3. NEW CATEGORIES (6개)
-- ============================================================

INSERT INTO categories (id, intent_id, name, slug, description, image_url, sort_order)
VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM intents WHERE slug = 'look-better'),
    '{"en":"Plastic Surgery","ko":"성형외과","zh":"整形外科","ja":"形成外科"}',
    'plastic-surgery',
    '{"en":"Expert cosmetic and reconstructive surgery by board-certified plastic surgeons in Korea","ko":"한국 전문의가 시행하는 성형외과 및 재건 수술","zh":"韩国认证整形外科医生提供的美容和重建手术","ja":"韓国の認定形成外科医による美容・再建手術"}',
    null, 3
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM intents WHERE slug = 'look-better'),
    '{"en":"Hair","ko":"모발","zh":"毛发","ja":"毛髪"}',
    'hair',
    '{"en":"Advanced hair restoration and scalp care for natural, lasting results","ko":"자연스럽고 지속적인 결과를 위한 첨단 모발 복원 및 두피 관리","zh":"先进的植发和头皮护理，带来自然持久的效果","ja":"自然で長続きする結果のための先進的な発毛・頭皮ケア"}',
    null, 4
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM intents WHERE slug = 'treat-disease'),
    '{"en":"Eye Care","ko":"안과","zh":"眼科","ja":"眼科"}',
    'eye-care',
    '{"en":"Precision vision correction and eye surgery with the latest laser technology","ko":"최신 레이저 기술을 활용한 정밀 시력 교정 및 안과 수술","zh":"使用最新激光技术进行精准视力矫正和眼科手术","ja":"最新レーザー技術による精密な視力矯正と眼科手術"}',
    null, 4
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM intents WHERE slug = 'treat-disease'),
    '{"en":"Orthopedics & Spine","ko":"정형외과 & 척추","zh":"骨科与脊柱","ja":"整形外科・脊椎"}',
    'orthopedics',
    '{"en":"Joint replacement, spine surgery, and sports medicine by leading orthopedic specialists","ko":"관절 치환술, 척추 수술, 스포츠 의학 전문의의 맞춤 치료","zh":"领先骨科专家提供关节置换、脊柱手术和运动医学服务","ja":"関節置換、脊椎手術、スポーツ医学の一流整形外科専門医"}',
    null, 5
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM intents WHERE slug = 'improve-health'),
    '{"en":"Health Check-up","ko":"건강검진","zh":"健康体检","ja":"健康診断"}',
    'health-checkup',
    '{"en":"Comprehensive preventive health screening programs with state-of-the-art diagnostics","ko":"최첨단 진단 장비로 진행하는 종합 예방 건강검진 프로그램","zh":"采用最先进诊断技术的全面预防性健康筛查计划","ja":"最新鋭の診断機器による総合的な予防健康診断プログラム"}',
    null, 1
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM intents WHERE slug = 'improve-health'),
    '{"en":"Fertility & Women''s Health","ko":"난임 & 여성 건강","zh":"生育与女性健康","ja":"不妊・女性の健康"}',
    'fertility',
    '{"en":"Leading fertility treatments and comprehensive women''s health services in Korea","ko":"한국의 선도적인 난임 치료 및 종합 여성 건강 서비스","zh":"韩国领先的生育治疗和全面女性健康服务","ja":"韓国における先進的な不妊治療と総合的な女性健康サービス"}',
    null, 2
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 4. EXISTING SERVICES — zh/ja 번역 추가
-- ============================================================

UPDATE services SET
  name = '{"en":"Ultherapy","ko":"울쎄라","zh":"超声刀","ja":"ウルセラ"}',
  description = '{"en":"Non-surgical skin lifting and tightening using focused ultrasound energy","ko":"집중 초음파 에너지를 이용한 비수술적 피부 리프팅 및 타이트닝","zh":"使用聚焦超声波能量进行非手术皮肤提升和紧致","ja":"集束超音波エネルギーを使用した非外科的な肌リフティングと引き締め"}'
WHERE slug = 'ultherapy';

UPDATE services SET
  name = '{"en":"Thermage","ko":"써마지","zh":"热玛吉","ja":"サーマジ"}',
  description = '{"en":"Radiofrequency skin tightening for a smoother, younger-looking complexion","ko":"더 매끄럽고 젊어 보이는 피부를 위한 고주파 피부 타이트닝","zh":"射频皮肤紧致，打造更光滑年轻的肌肤","ja":"よりなめらかで若々しい肌のための高周波肌引き締め"}'
WHERE slug = 'thermage';

UPDATE services SET
  name = '{"en":"Rejuran","ko":"리쥬란","zh":"婴儿针","ja":"リジュラン"}',
  description = '{"en":"DNA-based skin healing treatment that restores youthful skin from within","ko":"피부 내부에서 젊은 피부를 회복시키는 DNA 기반 피부 치유 치료","zh":"基于DNA的皮肤修复治疗，从内部恢复年轻肌肤","ja":"内側から若々しい肌を取り戻すDNAベースの肌修復治療"}'
WHERE slug = 'rejuran';

UPDATE services SET
  name = '{"en":"Dental Implant","ko":"치과 임플란트","zh":"牙科种植","ja":"歯科インプラント"}',
  description = '{"en":"Permanent tooth replacement with titanium implants for a natural look and feel","ko":"자연스러운 외관과 느낌을 위한 티타늄 임플란트 영구 치아 교체","zh":"使用钛种植体进行永久性牙齿修复，外观和感觉自然","ja":"自然な見た目と感触のためのチタンインプラントによる永久的な歯の修復"}'
WHERE slug = 'dental-implant';

UPDATE services SET
  name = '{"en":"Wisdom Tooth Extraction","ko":"사랑니 발치","zh":"智齿拔除","ja":"親知らず抜歯"}',
  description = '{"en":"Safe and pain-minimized removal of wisdom teeth by experienced oral surgeons","ko":"숙련된 구강외과 전문의에 의한 안전하고 통증 최소화된 사랑니 발치","zh":"经验丰富的口腔外科医生安全、最小化疼痛的智齿拔除","ja":"経験豊富な口腔外科医による安全で痛みを最小限に抑えた親知らず抜歯"}'
WHERE slug = 'wisdom-tooth-extraction';

-- ============================================================
-- 5. NEW SERVICES
-- ============================================================

INSERT INTO services (id, category_id, name, slug, description, overview, image_url, sort_order, is_featured)
VALUES

-- Beauty & Skin: Laser Toning
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'beauty-skin'),
  '{"en":"Laser Toning","ko":"레이저 토닝","zh":"激光嫩肤","ja":"レーザートーニング"}',
  'laser-toning',
  '{"en":"Low-fluence laser treatment for pigmentation, pores, and overall skin brightness","ko":"색소 침착, 모공, 전반적인 피부 밝기를 위한 저에너지 레이저 치료","zh":"低能量激光治疗色素沉着、毛孔和整体皮肤亮度","ja":"色素沈着、毛穴、全体的な肌の明るさのための低フルエンスレーザー治療"}',
  '{"en":"Laser toning uses sub-ablative laser energy to gently target melanin and stimulate collagen. Popular for treating melasma, uneven skin tone, and enlarged pores with no downtime.","ko":"레이저 토닝은 멜라닌을 표적으로 하고 콜라겐을 자극하기 위해 낮은 에너지 레이저를 사용합니다. 기미, 불균일한 피부 톤, 확장된 모공 치료에 인기가 있으며 다운타임이 없습니다.","zh":"激光嫩肤使用亚剥脱性激光能量轻柔靶向黑色素并刺激胶原蛋白，常用于治疗黄褐斑、不均匀肤色和毛孔粗大，无需恢复期。","ja":"レーザートーニングは低エネルギーレーザーを使ってメラニンをターゲットにし、コラーゲン生成を促進します。肝斑、ムラのある肌色、毛穴の治療に人気で、ダウンタイムがありません。"}',
  null, 4, false
),

-- Beauty & Skin: Botox & Filler
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'beauty-skin'),
  '{"en":"Botox & Filler","ko":"보톡스 & 필러","zh":"肉毒素与填充剂","ja":"ボトックス・フィラー"}',
  'botox-filler',
  '{"en":"Injectable treatments for wrinkle reduction and facial volume enhancement","ko":"주름 감소 및 안면 볼륨 향상을 위한 주사 치료","zh":"注射治疗，用于减少皱纹和增强面部轮廓","ja":"しわの軽減と顔のボリューム増強のための注射治療"}',
  '{"en":"Botox temporarily relaxes facial muscles to smooth dynamic wrinkles, while dermal fillers restore lost volume and define facial contours. Both treatments are quick, minimally invasive, and require no downtime.","ko":"보톡스는 일시적으로 안면 근육을 이완시켜 역동적인 주름을 부드럽게 하고, 필러는 손실된 볼륨을 회복하고 얼굴 윤곽을 선명하게 합니다.","zh":"肉毒素暂时放松面部肌肉以平滑动态皱纹，而真皮填充剂则恢复失去的容量并定义面部轮廓。两种治疗都快速、微创、无需恢复期。","ja":"ボトックスは顔の筋肉を一時的に弛緩させて表情じわをなめらかにし、ヒアルロン酸フィラーは失ったボリュームを回復させ顔の輪郭を整えます。"}',
  null, 5, false
),

-- Plastic Surgery: Rhinoplasty
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'plastic-surgery'),
  '{"en":"Rhinoplasty","ko":"코 성형","zh":"鼻整形","ja":"鼻整形"}',
  'rhinoplasty',
  '{"en":"Surgical reshaping of the nose for aesthetic improvement or functional correction","ko":"미적 개선 또는 기능적 교정을 위한 코의 외과적 재형성","zh":"通过外科手术重塑鼻子，改善外观或矫正功能","ja":"審美的改善または機能的矯正のための外科的な鼻の再形成"}',
  '{"en":"Rhinoplasty, or nose reshaping surgery, is one of Korea''s most sought-after procedures. Korean surgeons are globally renowned for creating natural, harmonious results that suit Asian facial features. Procedures can address the bridge, tip, nostrils, and overall nasal profile.","ko":"코 성형은 한국에서 가장 많이 찾는 시술 중 하나입니다. 한국 성형외과 의사들은 아시아 얼굴 특징에 맞는 자연스럽고 조화로운 결과로 세계적으로 유명합니다.","zh":"隆鼻手术是韩国最受欢迎的手术之一。韩国外科医生以创造适合亚洲面部特征的自然和谐效果而举世闻名。手术可针对鼻梁、鼻尖、鼻翼和整体鼻形。","ja":"鼻整形術は韓国で最も人気の高い手術の一つです。韓国の外科医はアジア人の顔立ちに合った自然で調和のとれた結果を生み出すことで世界的に有名です。"}',
  null, 1, true
),

-- Plastic Surgery: Eyelid Surgery
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'plastic-surgery'),
  '{"en":"Eyelid Surgery","ko":"눈 성형","zh":"眼睑手术","ja":"眼瞼手術"}',
  'eyelid-surgery',
  '{"en":"Double eyelid and eye-opening procedures for brighter, more defined eyes","ko":"더 밝고 또렷한 눈을 위한 쌍꺼풀 및 눈 확대 시술","zh":"双眼皮和开眼手术，让眼睛更明亮、更有轮廓","ja":"より明るく定義のある目のための二重まぶた・目の開きの手術"}',
  '{"en":"Eyelid surgery (blepharoplasty) is the most commonly performed cosmetic procedure in Korea. Options range from non-incision techniques for subtle results to full incision methods for dramatic transformation. Ptosis correction restores full eye-opening ability.","ko":"눈꺼풀 성형술은 한국에서 가장 많이 시행되는 성형 시술입니다. 자연스러운 결과를 위한 비절개 기법부터 극적인 변화를 위한 절개 기법까지 다양합니다.","zh":"眼睑手术（眼睑成形术）是韩国最常见的美容手术。从非切口技术（细微改变）到全切口方法（大幅改变），选项多样。","ja":"眼瞼手術（眼瞼形成術）は韓国で最もよく行われる美容手術です。繊細な結果のための非切開法から劇的な変化のための全切開法まで選択肢があります。"}',
  null, 2, true
),

-- Plastic Surgery: Facial Contouring
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'plastic-surgery'),
  '{"en":"Facial Contouring","ko":"안면 윤곽","zh":"面部轮廓","ja":"フェイシャルコントゥーリング"}',
  'facial-contouring',
  '{"en":"Bone-level facial reshaping including jaw reduction, cheekbone, and forehead surgery","ko":"턱 축소, 광대뼈, 이마 수술을 포함한 뼈 수준 안면 재형성","zh":"骨骼级面部重塑，包括下颌骨缩小、颧骨和额头手术","ja":"顎削り、頬骨、額の手術を含む骨レベルの顔の再形成"}',
  '{"en":"Facial contouring surgery addresses the underlying bone structure to create a smaller, more oval face. Korea is a world leader in these complex procedures, including V-line jaw reduction, cheekbone reduction, and forehead reshaping.","ko":"안면 윤곽 수술은 더 작고 타원형의 얼굴을 만들기 위해 뼈 구조를 다룹니다. 한국은 V라인 턱 축소, 광대뼈 축소, 이마 재형성 등 복잡한 시술의 세계적 선두입니다.","zh":"面部轮廓手术针对骨骼结构，创造更小、更椭圆的脸型。韩国在这些复杂手术方面处于世界领先地位，包括V型下颌骨缩小、颧骨缩小和额头重塑。","ja":"輪郭形成術は小さくて楕円形の顔を作るために骨格を修正します。Vライン顎削り、頬骨削り、額の再形成など複雑な手術において韓国は世界のリーダーです。"}',
  null, 3, false
),

-- Hair: Hair Transplant
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'hair'),
  '{"en":"Hair Transplant","ko":"모발 이식","zh":"植发","ja":"植毛"}',
  'hair-transplant',
  '{"en":"Permanent hair restoration using your own follicles for natural, lifelong results","ko":"자연스럽고 영구적인 결과를 위해 자신의 모낭을 사용하는 영구 모발 복원","zh":"使用自体毛囊进行永久性毛发修复，效果自然持久","ja":"自分の毛包を使った永久的な発毛修復で自然で生涯続く結果"}',
  '{"en":"Hair transplant surgery moves healthy follicles from the back of the scalp to thinning or bald areas. Korean clinics offer FUE, FUT, and DHI techniques with high graft survival rates and minimal scarring. Results are permanent and completely natural-looking.","ko":"모발 이식 수술은 두피 뒤쪽의 건강한 모낭을 얇아지거나 탈모가 된 부위로 이동시킵니다. 한국 클리닉은 높은 이식 생존율과 최소 흉터로 FUE, FUT, DHI 기법을 제공합니다.","zh":"植发手术将头皮后部的健康毛囊移植到稀疏或秃头区域。韩国诊所提供FUE、FUT和DHI技术，移植存活率高，疤痕最小。效果永久且完全自然。","ja":"植毛手術は頭皮後部の健康な毛包を薄毛や脱毛部位に移植します。韓国のクリニックはFUE、FUT、DHI技術を提供し、移植生存率が高く傷跡が最小限です。"}',
  null, 1, true
),

-- Hair: Scalp Treatment
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'hair'),
  '{"en":"Scalp Treatment","ko":"두피 치료","zh":"头皮治疗","ja":"頭皮治療"}',
  'scalp-treatment',
  '{"en":"Medical scalp care to strengthen follicles, reduce hair loss, and stimulate growth","ko":"모낭 강화, 탈모 감소, 성장 촉진을 위한 의학적 두피 케어","zh":"医疗头皮护理，强化毛囊，减少脱发，促进生长","ja":"毛包を強化し、抜け毛を減らし、成長を促進する医療的頭皮ケア"}',
  '{"en":"Non-surgical scalp treatments combine PRP therapy, mesotherapy, and low-level laser to nourish follicles and slow hair loss. Ideal for early-stage thinning or as a maintenance treatment after hair transplant.","ko":"비수술적 두피 치료는 PRP 요법, 메조테라피, 저출력 레이저를 결합하여 모낭을 영양 공급하고 탈모를 늦춥니다. 초기 단계 탈모 또는 모발 이식 후 유지 치료에 이상적입니다.","zh":"非手术头皮治疗结合PRP疗法、中胚层疗法和低能量激光，滋养毛囊并减缓脱发。适合早期稀疏或植发后的维护治疗。","ja":"非外科的頭皮治療はPRP療法、メソセラピー、低出力レーザーを組み合わせて毛包に栄養を与え脱毛を遅らせます。初期段階の薄毛や植毛後のメンテナンス治療に最適です。"}',
  null, 2, false
),

-- Dental: Orthodontics
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dental'),
  '{"en":"Orthodontics","ko":"치아 교정","zh":"正畸","ja":"矯正歯科"}',
  'orthodontics',
  '{"en":"Teeth straightening treatments from traditional braces to invisible aligners","ko":"전통적인 교정기부터 투명 교정기까지 치아 교정 치료","zh":"从传统牙套到隐形矫正器的牙齿矫正治疗","ja":"従来のブラケットから透明矯正器まで歯を矯正する治療"}',
  '{"en":"Orthodontic treatment aligns teeth and corrects bite issues for both aesthetic and functional improvement. Korea offers competitive pricing on metal braces, ceramic braces, Invisalign, and lingual orthodontics, often at 30–50% less than Western countries.","ko":"교정 치료는 미적 및 기능적 개선을 위해 치아를 정렬하고 교합 문제를 교정합니다. 한국은 금속 교정, 세라믹 교정, 인비절라인, 설측 교정에서 경쟁력 있는 가격을 제공합니다.","zh":"正畸治疗对齐牙齿并矫正咬合问题，同时改善外观和功能。韩国金属牙套、陶瓷牙套、隐适美和舌侧矫正器价格极具竞争力，通常比西方国家便宜30-50%。","ja":"矯正治療は審美的・機能的改善のために歯を整列させ咬合問題を矯正します。韓国はメタルブラケット、セラミック矯正、インビザライン、舌側矯正で競争力のある価格を提供しています。"}',
  null, 3, false
),

-- Dental: Dental Veneers
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'dental'),
  '{"en":"Dental Veneers","ko":"치아 베니어","zh":"牙齿贴面","ja":"歯科ベニア"}',
  'dental-veneers',
  '{"en":"Thin porcelain or composite shells bonded to teeth for a perfect smile makeover","ko":"완벽한 스마일 변신을 위해 치아에 부착하는 얇은 도자기 또는 복합 껍데기","zh":"粘合在牙齿上的薄瓷器或复合材料外壳，打造完美笑容","ja":"完璧な笑顔のために歯に接着する薄いセラミックまたはコンポジットシェル"}',
  '{"en":"Dental veneers transform the appearance of discolored, chipped, or misaligned teeth with minimally invasive preparation. Korean dental clinics are known for artistry in creating Hollywood smiles at a fraction of the cost compared to the US or Europe.","ko":"치아 베니어는 최소한의 치아 삭제로 변색, 깨진 또는 배열이 맞지 않는 치아의 외관을 변환합니다. 한국 치과는 미국이나 유럽에 비해 훨씬 저렴한 비용으로 할리우드 스마일을 만드는 예술성으로 유명합니다.","zh":"牙齿贴面以最小创伤准备改变变色、缺损或排列不齐牙齿的外观。韩国牙科诊所以创造好莱坞笑容的艺术性而闻名，费用仅为美国或欧洲的一小部分。","ja":"歯科ベニアは最小限の歯の削除で変色、欠け、または不整列な歯の外観を変えます。韓国の歯科クリニックは米国やヨーロッパの何分の一かのコストでハリウッドスマイルを作る芸術性で知られています。"}',
  null, 4, false
),

-- Eye Care: LASIK / LASEK
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'eye-care'),
  '{"en":"LASIK / LASEK","ko":"라식 / 라섹","zh":"激光矫视","ja":"レーシック・ラセック"}',
  'lasik-lasek',
  '{"en":"Laser vision correction procedures to eliminate dependence on glasses or contact lenses","ko":"안경이나 콘택트렌즈 의존을 없애는 레이저 시력 교정 시술","zh":"激光视力矫正手术，消除对眼镜或隐形眼镜的依赖","ja":"眼鏡やコンタクトレンズへの依存をなくすレーザー視力矯正手術"}',
  '{"en":"Korea is one of the world''s leading destinations for laser vision correction, performing hundreds of thousands of procedures annually. LASIK, LASEK, and SMILE procedures are performed by highly experienced surgeons using the most advanced laser systems available.","ko":"한국은 매년 수십만 건의 시술을 수행하는 레이저 시력 교정의 세계 선도 목적지 중 하나입니다. LASIK, LASEK, SMILE 시술은 최첨단 레이저 시스템을 사용하는 경험 많은 외과의에 의해 시행됩니다.","zh":"韩国是世界上领先的激光视力矫正目的地之一，每年进行数十万次手术。LASIK、LASEK和SMILE手术由经验丰富的外科医生使用最先进的激光系统进行。","ja":"韓国は年間数十万件の手術を行うレーザー視力矯正の世界有数の目的地の一つです。LASIK、LASEK、SMILE手術は最先端のレーザーシステムを使用した経験豊富な外科医が行います。"}',
  null, 1, true
),

-- Eye Care: Cataract Surgery
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'eye-care'),
  '{"en":"Cataract Surgery","ko":"백내장 수술","zh":"白内障手术","ja":"白内障手術"}',
  'cataract-surgery',
  '{"en":"Cloudy lens removal and replacement with premium intraocular lenses for clear vision","ko":"선명한 시야를 위한 혼탁한 수정체 제거 및 프리미엄 인공수정체 교체","zh":"去除浑浊晶状体并置换高级人工晶状体，恢复清晰视力","ja":"明確な視力のための白濁した水晶体の除去とプレミアム眼内レンズへの交換"}',
  '{"en":"Modern cataract surgery is a brief, painless procedure with rapid recovery. Korean eye hospitals offer a range of intraocular lens options including monofocal, multifocal, and toric lenses to correct distance, near, and astigmatism simultaneously.","ko":"현대 백내장 수술은 빠른 회복을 보이는 짧고 통증 없는 시술입니다. 한국 안과 병원은 단초점, 다초점, 토릭 렌즈 등 다양한 인공수정체 옵션을 제공합니다.","zh":"现代白内障手术是一种短暂、无痛的手术，恢复迅速。韩国眼科医院提供多种人工晶状体选择，包括单焦、多焦和散光矫正晶状体。","ja":"現代の白内障手術は短時間で痛みのない手術で、回復が早いです。韓国の眼科病院は単焦点、多焦点、乱視矯正レンズなど様々な眼内レンズオプションを提供しています。"}',
  null, 2, false
),

-- Orthopedics: Knee Replacement
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'orthopedics'),
  '{"en":"Knee Replacement","ko":"무릎 인공관절","zh":"膝关节置换","ja":"人工膝関節置換"}',
  'knee-replacement',
  '{"en":"Total and partial knee replacement surgery to relieve chronic pain and restore mobility","ko":"만성 통증 완화 및 이동성 회복을 위한 전체 및 부분 무릎 인공관절 수술","zh":"全膝和部分膝关节置换手术，减轻慢性疼痛并恢复活动能力","ja":"慢性的な痛みを軽減し可動性を回復するための全膝・部分膝人工関節置換術"}',
  '{"en":"Korean hospitals offer knee replacement surgery with advanced robotic-assisted systems, significantly improving implant placement accuracy. Recovery programs include intensive physiotherapy and a streamlined pathway from surgery to discharge that typically takes 5–7 days.","ko":"한국 병원은 임플란트 배치 정확도를 크게 향상시키는 고급 로봇 보조 시스템으로 무릎 인공관절 수술을 제공합니다. 회복 프로그램에는 집중 물리치료가 포함됩니다.","zh":"韩国医院提供先进机器人辅助系统的膝关节置换手术，显著提高植入物放置精度。恢复计划包括密集物理治疗，从手术到出院通常需要5-7天。","ja":"韓国の病院は高度なロボット支援システムで人工膝関節置換術を提供し、インプラント配置の精度を大幅に向上させます。回復プログラムには集中的な理学療法が含まれます。"}',
  null, 1, true
),

-- Orthopedics: Spine Surgery
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'orthopedics'),
  '{"en":"Spine Surgery","ko":"척추 수술","zh":"脊柱手术","ja":"脊椎手術"}',
  'spine-surgery',
  '{"en":"Minimally invasive and open spine procedures for disc, stenosis, and alignment problems","ko":"디스크, 협착증, 정렬 문제를 위한 최소 침습적 및 개방형 척추 수술","zh":"针对椎间盘、椎管狭窄和脊柱排列问题的微创和开放式脊柱手术","ja":"椎間板、脊柱管狭窄、アライメント問題のための低侵襲・開放型脊椎手術"}',
  '{"en":"Korean spine centers combine neurosurgical and orthopedic expertise to treat conditions ranging from herniated discs to complex spinal deformities. Minimally invasive techniques reduce blood loss, hospital stay, and recovery time compared to traditional open surgery.","ko":"한국 척추 센터는 신경외과 및 정형외과 전문성을 결합하여 추간판 탈출증부터 복잡한 척추 변형까지 치료합니다. 최소 침습 기법은 기존 개방 수술에 비해 출혈, 입원 기간, 회복 시간을 줄입니다.","zh":"韩国脊柱中心结合神经外科和骨科专业知识，治疗从椎间盘突出到复杂脊柱畸形的各种疾病。微创技术与传统开放手术相比，减少出血、住院时间和恢复时间。","ja":"韓国の脊椎センターは神経外科と整形外科の専門知識を組み合わせ、椎間板ヘルニアから複雑な脊椎変形まで治療します。低侵襲技術は従来の開放手術と比べて出血、入院日数、回復期間を短縮します。"}',
  null, 2, false
),

-- Health Check-up: Executive Screening
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'health-checkup'),
  '{"en":"Executive Health Screening","ko":"종합 건강검진","zh":"高管健康体检","ja":"人間ドック"}',
  'executive-health-screening',
  '{"en":"Comprehensive full-body health assessment with same-day results and specialist consultation","ko":"당일 결과 및 전문의 상담을 포함한 종합 전신 건강 평가","zh":"当天出结果并包含专科医生咨询的全面全身健康评估","ja":"当日結果と専門医相談を含む総合的な全身健康評価"}',
  '{"en":"Korean executive health screening programs offer world-class preventive care in a single day. Packages typically include blood tests, imaging (CT, MRI, endoscopy), cardiac assessment, and cancer markers. Results are reviewed same-day with an English-speaking specialist.","ko":"한국 종합 건강검진 프로그램은 하루에 세계 수준의 예방 의료를 제공합니다. 패키지에는 일반적으로 혈액 검사, 영상 검사(CT, MRI, 내시경), 심장 평가, 암 표지자가 포함됩니다.","zh":"韩国高管健康体检计划在一天内提供世界级的预防保健。套餐通常包括血液检查、影像学（CT、MRI、胃镜）、心脏评估和肿瘤标志物，当天由英语专科医生审查结果。","ja":"韓国の人間ドックプログラムは一日で世界水準の予防医療を提供します。パッケージには通常、血液検査、画像検査（CT、MRI、内視鏡）、心臓評価、腫瘍マーカーが含まれ、当日英語専門医が結果を確認します。"}',
  null, 1, true
),

-- Health Check-up: Cancer Screening
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'health-checkup'),
  '{"en":"Cancer Screening","ko":"암 검진","zh":"癌症筛查","ja":"がん検診"}',
  'cancer-screening',
  '{"en":"Early detection cancer screening programs using the latest imaging and biomarker technology","ko":"최신 영상 및 바이오마커 기술을 사용한 조기 발견 암 검진 프로그램","zh":"使用最新影像学和生物标志物技术的癌症早期检测筛查计划","ja":"最新の画像・バイオマーカー技術を使用したがん早期発見スクリーニングプログラム"}',
  '{"en":"Korea has one of the world''s highest cancer screening rates and most advanced detection capabilities. Programs use PET-CT, MRI, tumor marker panels, and genetic testing. Early detection significantly improves treatment outcomes across all major cancer types.","ko":"한국은 세계 최고 수준의 암 검진율과 가장 발달된 검출 능력을 보유하고 있습니다. 프로그램은 PET-CT, MRI, 종양 표지자 패널, 유전자 검사를 활용합니다.","zh":"韩国拥有世界上最高的癌症筛查率和最先进的检测能力。计划使用PET-CT、MRI、肿瘤标志物组合和基因检测。早期发现显著改善所有主要癌症类型的治疗效果。","ja":"韓国は世界で最も高いがん検診率と最先端の検出能力を誇ります。PET-CT、MRI、腫瘍マーカーパネル、遺伝子検査を活用します。早期発見はすべての主要ながん種の治療成績を大幅に改善します。"}',
  null, 2, false
),

-- Fertility: IVF Treatment
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'fertility'),
  '{"en":"IVF Treatment","ko":"시험관 시술","zh":"试管婴儿","ja":"体外受精（IVF）"}',
  'ivf-treatment',
  '{"en":"In-vitro fertilization and assisted reproductive technology with high success rates","ko":"높은 성공률을 자랑하는 체외 수정 및 보조 생식 기술","zh":"高成功率的体外受精和辅助生殖技术","ja":"高い成功率の体外受精と生殖補助技術"}',
  '{"en":"Korean fertility clinics consistently achieve IVF success rates above the global average, using individualized stimulation protocols and advanced embryology labs. Many clinics offer international patient programs with English-speaking coordinators and telemedicine follow-up.","ko":"한국 난임 클리닉은 개인 맞춤 자극 프로토콜과 첨단 배아학 실험실을 통해 지속적으로 세계 평균 이상의 시험관 성공률을 달성합니다.","zh":"韩国生育诊所通过个性化刺激方案和先进胚胎学实验室，IVF成功率持续高于全球平均水平。许多诊所提供英语协调员和远程医疗随访的国际患者项目。","ja":"韓国の不妊クリニックは個別化された刺激プロトコルと先進的な胚研究室により、IVF成功率が世界平均を継続的に上回っています。多くのクリニックが英語コーディネーターと遠隔医療フォローアップによる国際患者プログラムを提供しています。"}',
  null, 1, true
),

-- Fertility: Gynecology Check-up
(
  gen_random_uuid(),
  (SELECT id FROM categories WHERE slug = 'fertility'),
  '{"en":"Women''s Health Check-up","ko":"여성 건강검진","zh":"女性健康检查","ja":"女性健康診断"}',
  'womens-health-checkup',
  '{"en":"Comprehensive gynecological screening and fertility assessment for women of all ages","ko":"모든 연령대 여성을 위한 종합 부인과 검사 및 난임 평가","zh":"适合所有年龄女性的全面妇科检查和生育评估","ja":"すべての年齢の女性のための総合的な婦人科検診と妊孕性評価"}',
  '{"en":"Korea''s women''s health programs combine gynecological screening, fertility assessment, and hormone evaluation in one visit. Services include cervical cancer screening, ovarian reserve testing, pelvic ultrasound, and comprehensive hormonal panels.","ko":"한국의 여성 건강 프로그램은 한 번의 방문으로 부인과 검사, 난임 평가, 호르몬 평가를 결합합니다. 자궁경부암 검사, 난소 예비력 검사, 골반 초음파, 종합 호르몬 패널이 포함됩니다.","zh":"韩国女性健康项目在一次就诊中结合妇科筛查、生育评估和激素评估。服务包括宫颈癌筛查、卵巢储备检测、盆腔超声和综合激素组合。","ja":"韓国の女性健康プログラムは一回の受診で婦人科検診、妊孕性評価、ホルモン評価を組み合わせます。子宮頸がん検診、卵巣予備能検査、骨盤エコー、総合ホルモンパネルが含まれます。"}',
  null, 2, false
)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6. PROCEDURES
-- ============================================================

INSERT INTO procedures (id, service_id, name, slug, description, sort_order)
VALUES

-- Laser Toning
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'laser-toning'),
 '{"en":"Laser Toning — Full Face","ko":"레이저 토닝 — 전체 얼굴","zh":"激光嫩肤 — 全脸","ja":"レーザートーニング — 全顔"}',
 'laser-toning-full-face',
 '{"en":"Full-face low-fluence Q-switched laser session targeting overall pigmentation and skin tone","ko":"전체 색소 침착 및 피부 톤을 타겟으로 하는 전체 얼굴 저에너지 Q스위치 레이저 세션","zh":"针对整体色素沉着和肤色的全脸低能量Q开关激光疗程","ja":"全体的な色素沈着と肌トーンを対象にした全顔低フルエンスQスイッチレーザーセッション"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'laser-toning'),
 '{"en":"Pico Laser Toning","ko":"피코 레이저 토닝","zh":"皮秒激光嫩肤","ja":"ピコレーザートーニング"}',
 'pico-laser-toning',
 '{"en":"Ultra-short picosecond pulses for faster pigmentation clearance and skin rejuvenation with less heat damage","ko":"더 빠른 색소 제거와 열 손상을 줄인 피부 재생을 위한 초단 피코초 펄스","zh":"超短皮秒脉冲，更快清除色素沉着，皮肤焕新，热损伤更少","ja":"より速い色素除去と熱ダメージの少ない肌再生のための超短ピコ秒パルス"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'laser-toning'),
 '{"en":"Laser Toning — Neck & Décolletage","ko":"레이저 토닝 — 목 & 데콜테","zh":"激光嫩肤 — 颈部与胸口","ja":"レーザートーニング — 首・デコルテ"}',
 'laser-toning-neck',
 '{"en":"Targeted laser toning session for the neck and chest area to even out skin tone and reduce sun damage","ko":"피부 톤을 균일하게 하고 자외선 손상을 줄이기 위한 목과 가슴 부위 타겟 레이저 토닝","zh":"针对颈部和胸部区域的激光嫩肤疗程，均匀肤色并减少日晒损伤","ja":"肌のトーンを均一にして日焼けダメージを軽減するための首とデコルテのターゲットレーザートーニング"}',
 3),

-- Botox & Filler
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'botox-filler'),
 '{"en":"Botox — Forehead & Frown Lines","ko":"보톡스 — 이마 & 미간 주름","zh":"肉毒素 — 额头与眉间纹","ja":"ボトックス — 額・眉間のしわ"}',
 'botox-forehead',
 '{"en":"Targeted botulinum toxin injections to relax forehead lines and frown lines between the brows","ko":"이마 주름과 미간 주름을 이완시키기 위한 타겟 보툴리눔 톡신 주사","zh":"靶向肉毒杆菌注射，舒缓额头和眉间皱纹","ja":"額のしわと眉間のしわを和らげるためのターゲットボツリヌス毒素注射"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'botox-filler'),
 '{"en":"Botox — Jaw Slimming","ko":"보톡스 — 턱 슬리밍","zh":"肉毒素 — 瘦脸针","ja":"ボトックス — エラボトックス"}',
 'botox-jaw',
 '{"en":"Masseter muscle reduction injections to slim the lower face and soften a square jaw","ko":"사각턱을 부드럽게 하고 하안면을 슬리밍하는 교근 축소 주사","zh":"咬肌缩小注射，瘦脸下颌，软化方形脸","ja":"四角い顎を和らげ下顔面をスリムにする咬筋縮小注射"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'botox-filler'),
 '{"en":"Dermal Filler — Lips","ko":"필러 — 입술","zh":"真皮填充剂 — 嘴唇","ja":"ヒアルロン酸フィラー — 唇"}',
 'filler-lips',
 '{"en":"Hyaluronic acid lip filler for added volume, definition, and natural-looking enhancement","ko":"볼륨 추가, 선명한 윤곽, 자연스러운 개선을 위한 히알루론산 입술 필러","zh":"透明质酸唇部填充剂，增加丰满度、轮廓和自然效果","ja":"ボリュームの追加、輪郭の定義、自然な仕上がりのためのヒアルロン酸リップフィラー"}',
 3),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'botox-filler'),
 '{"en":"Dermal Filler — Cheeks & Midface","ko":"필러 — 볼 & 중안부","zh":"真皮填充剂 — 双颊与面中","ja":"ヒアルロン酸フィラー — 頬・中顔面"}',
 'filler-cheeks',
 '{"en":"Cheek augmentation and midface volume restoration using long-lasting hyaluronic acid filler","ko":"오래 지속되는 히알루론산 필러를 사용한 볼 증대 및 중안부 볼륨 회복","zh":"使用持久透明质酸填充剂进行颧骨增大和面中部容积恢复","ja":"長持ちするヒアルロン酸フィラーを使った頬の増大と中顔面のボリューム回復"}',
 4),

-- Rhinoplasty
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"Open Rhinoplasty","ko":"절개 코 성형","zh":"开放式隆鼻","ja":"オープン鼻整形"}',
 'open-rhinoplasty',
 '{"en":"Full rhinoplasty via a small incision under the nose tip, allowing maximum visibility and precise reshaping of the entire nasal structure","ko":"코 끝 아래 작은 절개를 통한 완전한 코 성형으로 전체 비강 구조의 최대 가시성 및 정밀한 재형성","zh":"通过鼻尖下方小切口进行全面鼻整形，最大限度地提高可视性，精确重塑整个鼻部结构","ja":"鼻先の下の小さな切開を通じた全面的な鼻整形で、鼻全体の構造を最大限の視野で精密に再形成"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"Closed Rhinoplasty","ko":"비절개 코 성형","zh":"闭合式隆鼻","ja":"クローズ鼻整形"}',
 'closed-rhinoplasty',
 '{"en":"Scarless rhinoplasty performed entirely through the nostrils, suitable for moderate changes to the bridge or tip","ko":"콧구멍을 통해 완전히 시행되는 흉터 없는 코 성형, 콧대나 코 끝의 중간 정도 변화에 적합","zh":"完全通过鼻孔进行的无疤隆鼻手术，适合对鼻梁或鼻尖进行适度改变","ja":"鼻孔を通じて完全に行われる傷跡のない鼻整形、鼻筋や鼻先の適度な変化に適している"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"Revision Rhinoplasty","ko":"재수술 코 성형","zh":"修复鼻整形","ja":"修正鼻整形"}',
 'revision-rhinoplasty',
 '{"en":"Corrective surgery to address unsatisfactory results or complications from a previous rhinoplasty","ko":"이전 코 성형 수술의 불만족스러운 결과나 합병증을 해결하기 위한 교정 수술","zh":"矫正上次鼻整形手术不满意效果或并发症的矫正手术","ja":"以前の鼻整形手術の不満足な結果や合併症を修正するための矯正手術"}',
 3),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"Alarplasty (Nostril Reduction)","ko":"콧볼 축소","zh":"鼻翼缩小","ja":"小鼻縮小"}',
 'alarplasty',
 '{"en":"Surgical reduction of wide or flared nostrils for a more refined and balanced nose","ko":"더 세련되고 균형 잡힌 코를 위한 넓거나 퍼진 콧구멍의 외과적 축소","zh":"手术缩小宽或外张的鼻翼，打造更精致均衡的鼻形","ja":"より洗練されたバランスの取れた鼻のための広がった小鼻の外科的縮小"}',
 4),

-- Eyelid Surgery
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'eyelid-surgery'),
 '{"en":"Double Eyelid — Incision Method","ko":"쌍꺼풀 — 절개법","zh":"双眼皮 — 切开法","ja":"二重まぶた — 切開法"}',
 'double-eyelid-incision',
 '{"en":"Permanent double eyelid creation via a fine incision along the eyelid, ideal for thick eyelid skin or desired dramatic fold","ko":"두꺼운 눈꺼풀 피부나 뚜렷한 주름에 이상적인 눈꺼풀을 따라 세밀한 절개를 통한 영구 쌍꺼풀 생성","zh":"通过眼睑细小切口永久打造双眼皮，适合眼皮较厚或想要明显折痕的人","ja":"眼瞼に沿った細かい切開による永久的な二重まぶたの作成、厚い眼瞼皮膚や明確な折り目を望む方に最適"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'eyelid-surgery'),
 '{"en":"Double Eyelid — Non-Incision (Suture)","ko":"쌍꺼풀 — 비절개 (매몰법)","zh":"双眼皮 — 非切开（埋线法）","ja":"二重まぶた — 非切開法（埋没法）"}',
 'double-eyelid-non-incision',
 '{"en":"Minimally invasive double eyelid technique using sutures without cutting, with faster recovery and natural results","ko":"절개 없이 봉합사를 사용하는 최소 침습 쌍꺼풀 기법, 빠른 회복과 자연스러운 결과","zh":"使用缝合线无切口的微创双眼皮技术，恢复更快，效果自然","ja":"切開なしで縫合糸を使用する低侵襲二重まぶた技術、より早い回復と自然な結果"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'eyelid-surgery'),
 '{"en":"Ptosis Correction","ko":"눈꺼풀 하수 교정","zh":"上睑下垂矫正","ja":"眼瞼下垂修正"}',
 'ptosis-correction',
 '{"en":"Surgical tightening of the levator muscle to fully open eyes that appear droopy or tired","ko":"졸리거나 피곤해 보이는 눈을 완전히 뜨기 위한 거근 근육의 외과적 조임","zh":"手术收紧上睑提肌，使看起来下垂或疲惫的眼睛完全睁开","ja":"垂れたり疲れて見える目を完全に開けるための眼瞼挙筋の外科的強化"}',
 3),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'eyelid-surgery'),
 '{"en":"Lower Eyelid Surgery","ko":"하안검 수술","zh":"下眼睑手术","ja":"下眼瞼手術"}',
 'lower-eyelid-surgery',
 '{"en":"Removal or repositioning of under-eye fat bags and excess skin to reduce puffiness and dark circles","ko":"부기와 다크서클을 줄이기 위한 눈 밑 지방 주머니 및 과잉 피부 제거 또는 재배치","zh":"去除或重新定位下眼皮脂肪袋和多余皮肤，减少浮肿和黑眼圈","ja":"むくみとクマを軽減するためのアイバッグと余分な皮膚の除去または再配置"}',
 4),

-- Facial Contouring
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'facial-contouring'),
 '{"en":"V-Line Jaw Reduction","ko":"V라인 턱 축소","zh":"V型下颌缩小","ja":"Vライン顎削り"}',
 'v-line-jaw-reduction',
 '{"en":"Mandible angle reduction and chin reshaping surgery to create a slender, V-shaped lower face","ko":"날씬하고 V자 모양의 하안면을 만들기 위한 하악각 축소 및 턱 재형성 수술","zh":"下颌角缩小和下巴重塑手术，打造纤细的V型下半脸","ja":"細くてV字形の下顔面を作るための下顎角縮小と顎の再形成手術"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'facial-contouring'),
 '{"en":"Cheekbone Reduction","ko":"광대뼈 축소","zh":"颧骨缩小","ja":"頬骨削り"}',
 'cheekbone-reduction',
 '{"en":"Zygoma reduction surgery to soften prominent cheekbones and create a smoother, more feminine face shape","ko":"두드러진 광대뼈를 부드럽게 하고 더 매끄럽고 여성스러운 얼굴 형태를 만들기 위한 광대뼈 축소 수술","zh":"颧骨缩小手术，软化突出的颧骨，打造更光滑、更女性化的脸形","ja":"突出した頬骨を和らげ、よりなめらかで女性らしい顔の形を作るための頬骨削り手術"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'facial-contouring'),
 '{"en":"Forehead Contouring","ko":"이마 윤곽","zh":"额头轮廓整形","ja":"額の輪郭形成"}',
 'forehead-contouring',
 '{"en":"Forehead augmentation or reshaping using implants or fat grafting for a rounder, more balanced forehead","ko":"더 둥글고 균형 잡힌 이마를 위한 임플란트 또는 지방 이식을 사용한 이마 증대 또는 재형성","zh":"使用植入物或脂肪移植进行额头增大或重塑，打造更圆润均衡的额头","ja":"より丸くバランスの取れた額のためのインプラントや脂肪移植を使った額の増大または再形成"}',
 3),

-- Hair Transplant
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'hair-transplant'),
 '{"en":"FUE Hair Transplant","ko":"FUE 모발 이식","zh":"FUE植发","ja":"FUE植毛"}',
 'fue-hair-transplant',
 '{"en":"Follicular Unit Extraction: individual follicles extracted one-by-one for minimal scarring and fast recovery","ko":"모낭 단위 채취: 최소 흉터와 빠른 회복을 위한 개별 모낭 하나씩 채취","zh":"毛囊单位提取：逐一提取单个毛囊，疤痕最小，恢复快","ja":"毛包単位抽出：個々の毛包を一本ずつ採取し、傷跡が最小限で回復が早い"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'hair-transplant'),
 '{"en":"DHI Hair Transplant","ko":"DHI 모발 이식","zh":"DHI植发","ja":"DHI植毛"}',
 'dhi-hair-transplant',
 '{"en":"Direct Hair Implantation: follicles are implanted directly using a Choi pen for precise angle and density control","ko":"직접 모발 이식: 정확한 각도와 밀도 조절을 위해 최 펜을 사용하여 모낭을 직접 이식","zh":"直接植发：使用Choi笔直接种植毛囊，精确控制角度和密度","ja":"ダイレクトヘアインプランテーション：チョイペンを使って毛包を直接植毛し、角度と密度を精密に制御"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'hair-transplant'),
 '{"en":"FUT Hair Transplant","ko":"FUT 모발 이식","zh":"FUT植发","ja":"FUT植毛"}',
 'fut-hair-transplant',
 '{"en":"Follicular Unit Transplantation: a strip of scalp is harvested for a high graft count in a single session","ko":"모낭 단위 이식: 한 세션에서 많은 이식편 수를 위해 두피 스트립을 채취","zh":"毛囊单位移植：采集一条头皮，单次疗程即可获得大量移植体","ja":"毛包単位移植：一回のセッションで多くのグラフト数のために頭皮のストリップを採取"}',
 3),

-- Scalp Treatment
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'scalp-treatment'),
 '{"en":"PRP Scalp Therapy","ko":"PRP 두피 치료","zh":"PRP头皮治疗","ja":"PRP頭皮治療"}',
 'prp-scalp',
 '{"en":"Platelet-Rich Plasma injections into the scalp to stimulate dormant follicles and promote new hair growth","ko":"휴면 모낭을 자극하고 새로운 모발 성장을 촉진하기 위한 두피 내 혈소판 풍부 혈장 주사","zh":"将富含血小板的血浆注射到头皮，刺激休眠毛囊并促进新发生长","ja":"休眠中の毛包を刺激し新しい毛髪の成長を促進するための頭皮への多血小板血漿注射"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'scalp-treatment'),
 '{"en":"Scalp Mesotherapy","ko":"두피 메조테라피","zh":"头皮中胚层疗法","ja":"頭皮メソセラピー"}',
 'scalp-mesotherapy',
 '{"en":"Microinjections of vitamins, minerals, and growth factors directly into the scalp to nourish follicles","ko":"모낭에 영양을 공급하기 위해 두피에 직접 비타민, 미네랄, 성장인자를 미세 주사","zh":"将维生素、矿物质和生长因子直接微注射入头皮，滋养毛囊","ja":"毛包に栄養を与えるためにビタミン、ミネラル、成長因子を頭皮に直接微量注射"}',
 2),

-- Orthodontics
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'orthodontics'),
 '{"en":"Metal Braces","ko":"금속 교정","zh":"金属牙套","ja":"メタルブラケット"}',
 'metal-braces',
 '{"en":"Traditional stainless-steel brackets and wires — the most cost-effective orthodontic option with reliable results","ko":"가장 비용 효율적인 교정 옵션으로 신뢰할 수 있는 결과를 제공하는 전통적인 스테인리스 스틸 브라켓과 와이어","zh":"传统不锈钢托槽和弓丝 — 最具成本效益的正畸选择，效果可靠","ja":"最もコスト効率の良い矯正オプションで信頼できる結果をもたらす従来のステンレス鋼ブラケットとワイヤー"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'orthodontics'),
 '{"en":"Clear Aligners (Invisalign)","ko":"투명 교정 (인비절라인)","zh":"隐形矫正器（隐适美）","ja":"クリアアライナー（インビザライン）"}',
 'clear-aligners',
 '{"en":"Removable transparent plastic aligners for discreet teeth straightening without brackets or wires","ko":"브라켓이나 와이어 없이 눈에 띄지 않는 치아 교정을 위한 탈착 가능한 투명 플라스틱 교정기","zh":"可摘除透明塑料矫正器，无需托槽或弓丝，隐蔽矫正牙齿","ja":"ブラケットやワイヤーなしで目立たずに歯を矯正するための取り外し可能な透明プラスチックアライナー"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'orthodontics'),
 '{"en":"Ceramic Braces","ko":"세라믹 교정","zh":"陶瓷牙套","ja":"セラミックブラケット"}',
 'ceramic-braces',
 '{"en":"Tooth-colored ceramic brackets that blend with natural teeth for a more discreet treatment than metal braces","ko":"금속 교정보다 더 눈에 띄지 않는 치료를 위해 자연 치아와 조화되는 치아색 세라믹 브라켓","zh":"与天然牙齿相融合的牙色陶瓷托槽，比金属牙套更隐蔽","ja":"金属ブラケットよりも目立たない治療のために天然歯と調和する歯の色のセラミックブラケット"}',
 3),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'orthodontics'),
 '{"en":"Lingual Braces","ko":"설측 교정","zh":"舌侧矫正","ja":"舌側矯正"}',
 'lingual-braces',
 '{"en":"Braces bonded to the inside surface of teeth — completely invisible from the outside","ko":"외부에서 완전히 보이지 않도록 치아 내면에 부착된 교정기","zh":"粘合在牙齿内表面的牙套 — 从外面完全看不见","ja":"完全に外から見えないように歯の内側に接着したブラケット"}',
 4),

-- Dental Veneers
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'dental-veneers'),
 '{"en":"Porcelain Veneers","ko":"도자기 베니어","zh":"瓷贴面","ja":"ポーセレンベニア"}',
 'porcelain-veneers',
 '{"en":"Ultra-thin ceramic shells custom-crafted and bonded to the front of teeth for a flawless, long-lasting smile","ko":"완벽하고 오래 지속되는 미소를 위해 치아 앞면에 맞춤 제작하여 부착하는 초박형 도자기 껍데기","zh":"超薄陶瓷壳，定制制作并粘合在牙齿正面，打造无瑕疵、持久的笑容","ja":"完璧で長持ちする笑顔のために歯の前面にカスタム製作して接着する超薄型セラミックシェル"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'dental-veneers'),
 '{"en":"Composite Veneers","ko":"복합 레진 베니어","zh":"复合树脂贴面","ja":"コンポジットベニア"}',
 'composite-veneers',
 '{"en":"Direct composite resin applied and sculpted onto teeth — a more affordable, reversible veneer option","ko":"더 저렴하고 가역적인 베니어 옵션으로 치아에 직접 복합 레진을 적용하고 조각","zh":"直接在牙齿上应用和塑形的复合树脂 — 更实惠、可逆的贴面选择","ja":"より手頃で可逆的なベニアオプションとして歯に直接コンポジット樹脂を適用して成形"}',
 2),

-- LASIK/LASEK
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"LASIK","ko":"라식","zh":"LASIK激光矫视","ja":"レーシック"}',
 'standard-lasik',
 '{"en":"Flap-based laser vision correction with rapid recovery — most popular refractive surgery for eligible candidates","ko":"빠른 회복을 보이는 플랩 기반 레이저 시력 교정 — 적합한 후보자에게 가장 인기 있는 굴절 수술","zh":"基于角膜瓣的激光视力矫正，恢复迅速 — 适合候选者最受欢迎的屈光手术","ja":"急速な回復のフラップベースのレーザー視力矯正 — 適格な候補者に最も人気の屈折矯正手術"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"LASEK / PRK","ko":"라섹 / PRK","zh":"LASEK/PRK","ja":"ラセック / PRK"}',
 'lasek',
 '{"en":"Surface ablation technique without creating a flap — recommended for thin corneas or active lifestyles","ko":"플랩 생성 없는 표면 절제 기법 — 얇은 각막이나 활동적인 생활 방식에 권장","zh":"无需制作角膜瓣的表面消融技术 — 推荐用于薄角膜或活跃生活方式","ja":"フラップを作らない表面切除技術 — 薄い角膜や活動的なライフスタイルに推奨"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"SMILE Pro","ko":"스마일 프로","zh":"全激光近视手术","ja":"スマイルプロ"}',
 'smile-pro',
 '{"en":"Minimally invasive flapless laser surgery using a small incision — latest generation vision correction technology","ko":"소절개를 이용한 최소 침습적 플랩리스 레이저 수술 — 최신 세대 시력 교정 기술","zh":"通过小切口进行的微创无瓣激光手术 — 最新一代视力矫正技术","ja":"小さな切開を使用した低侵襲フラップレスレーザー手術 — 最新世代の視力矯正技術"}',
 3),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"ICL (Implantable Collamer Lens)","ko":"안내 렌즈 삽입술 (ICL)","zh":"有晶体眼人工晶体植入","ja":"有水晶体眼内レンズ（ICL）"}',
 'icl',
 '{"en":"Implantable lens placed inside the eye — ideal for high prescriptions or thin corneas not suitable for laser surgery","ko":"눈 안에 삽입되는 렌즈 — 높은 도수나 레이저 수술에 적합하지 않은 얇은 각막에 이상적","zh":"放置在眼睛内部的可植入晶状体 — 适合高度近视或不适合激光手术的薄角膜","ja":"眼内に配置する埋込みレンズ — 高度数や薄い角膜でレーザー手術に適さない方に最適"}',
 4),

-- Cataract
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'cataract-surgery'),
 '{"en":"Standard Cataract Surgery","ko":"일반 백내장 수술","zh":"标准白内障手术","ja":"標準白内障手術"}',
 'standard-cataract',
 '{"en":"Phacoemulsification with a monofocal IOL — restores clear distance vision with minimal recovery time","ko":"단초점 인공수정체로 수정체 유화술 — 최소 회복 시간으로 선명한 원거리 시야 회복","zh":"使用单焦点人工晶状体进行超声乳化手术 — 以最短恢复时间恢复清晰的远视力","ja":"単焦点眼内レンズによる超音波水晶体乳化術 — 最小限の回復時間で明確な遠距離視力を回復"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'cataract-surgery'),
 '{"en":"Multifocal IOL Cataract Surgery","ko":"다초점 인공수정체 백내장 수술","zh":"多焦点人工晶状体白内障手术","ja":"多焦点眼内レンズ白内障手術"}',
 'multifocal-iol-cataract',
 '{"en":"Cataract removal with a premium multifocal IOL that corrects both distance and near vision, often eliminating glasses","ko":"거리 및 근거리 시야를 모두 교정하는 프리미엄 다초점 인공수정체를 사용한 백내장 수술, 종종 안경 없이도 가능","zh":"使用高级多焦点人工晶状体进行白内障摘除，同时矫正远视和近视，通常无需眼镜","ja":"距離と近距離の視力を両方矯正するプレミアム多焦点眼内レンズによる白内障除去、多くの場合眼鏡が不要に"}',
 2),

-- Knee Replacement
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'knee-replacement'),
 '{"en":"Total Knee Replacement","ko":"전슬관절 치환술","zh":"全膝关节置换","ja":"人工膝関節全置換術"}',
 'total-knee-replacement',
 '{"en":"Complete replacement of the knee joint with a metal and plastic implant — ideal for severe arthritis or joint damage","ko":"심한 관절염이나 관절 손상에 이상적인 금속과 플라스틱 임플란트로 무릎 관절 완전 교체","zh":"用金属和塑料植入物完全替换膝关节 — 适合严重关节炎或关节损伤","ja":"重度の関節炎や関節損傷に最適な金属とプラスチックのインプラントによる膝関節の完全置換"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'knee-replacement'),
 '{"en":"Robotic-Assisted Knee Replacement","ko":"로봇 보조 무릎 인공관절","zh":"机器人辅助膝关节置换","ja":"ロボット支援人工膝関節置換"}',
 'robotic-knee-replacement',
 '{"en":"Knee replacement performed with robotic guidance for sub-millimeter implant placement accuracy and faster rehabilitation","ko":"빠른 재활과 밀리미터 이하 임플란트 배치 정확도를 위한 로봇 유도 무릎 인공관절 수술","zh":"在机器人引导下进行膝关节置换，植入物放置精度达亚毫米级，康复更快","ja":"サブミリメートルのインプラント配置精度とより早いリハビリのためのロボット誘導膝関節置換術"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'knee-replacement'),
 '{"en":"Partial Knee Replacement","ko":"부분 슬관절 치환술","zh":"部分膝关节置换","ja":"部分人工膝関節置換術"}',
 'partial-knee-replacement',
 '{"en":"Resurfacing only the damaged compartment of the knee — less invasive with a faster recovery than total replacement","ko":"전체 교체보다 덜 침습적이며 빠른 회복을 위해 손상된 무릎 구획만 재표면화","zh":"仅对膝关节受损部分进行表面处理 — 比全关节置换创伤更小，恢复更快","ja":"全置換術より低侵襲で回復が早い、損傷した膝コンパートメントのみを置換する表面置換術"}',
 3),

-- Spine Surgery
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'spine-surgery'),
 '{"en":"Lumbar Disc Herniation Surgery","ko":"요추 추간판 탈출증 수술","zh":"腰椎间盘突出手术","ja":"腰椎椎間板ヘルニア手術"}',
 'lumbar-discectomy',
 '{"en":"Minimally invasive removal of herniated disc material pressing on spinal nerves to relieve leg pain and numbness","ko":"다리 통증과 저림을 완화하기 위해 척추 신경을 누르는 탈출된 추간판 물질을 최소 침습적으로 제거","zh":"微创去除压迫脊神经的椎间盘突出物质，减轻腿部疼痛和麻木","ja":"脚の痛みと麻痺を和らげるために脊椎神経を圧迫している椎間板ヘルニア物質の低侵襲除去"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'spine-surgery'),
 '{"en":"Spinal Stenosis Surgery","ko":"척추 협착증 수술","zh":"脊柱狭窄手术","ja":"脊柱管狭窄症手術"}',
 'spinal-stenosis-surgery',
 '{"en":"Decompression procedure to widen the spinal canal and relieve pressure on nerves causing pain and limited mobility","ko":"통증과 제한된 이동성을 유발하는 신경 압박을 해소하기 위해 척추관을 넓히는 감압 시술","zh":"减压手术，扩大椎管，减轻导致疼痛和活动受限的神经压迫","ja":"痛みや可動性制限を引き起こす神経への圧力を和らげるために脊柱管を広げる除圧手術"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'spine-surgery'),
 '{"en":"Spinal Fusion","ko":"척추 유합술","zh":"脊柱融合术","ja":"脊椎固定術"}',
 'spinal-fusion',
 '{"en":"Connecting two or more vertebrae permanently to eliminate painful motion and stabilize the spine","ko":"통증스러운 움직임을 제거하고 척추를 안정화하기 위해 두 개 이상의 척추를 영구적으로 연결","zh":"将两个或多个椎骨永久连接，消除疼痛的活动并稳定脊柱","ja":"痛みのある動きを排除し脊椎を安定させるために2つ以上の椎骨を永久的に連結"}',
 3),

-- Executive Health Screening
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'executive-health-screening'),
 '{"en":"Standard Health Check-up","ko":"기본 건강검진","zh":"基础健康体检","ja":"基本健康診断"}',
 'standard-health-checkup',
 '{"en":"Essential full-body screening including blood panel, urine test, chest X-ray, ECG, and abdominal ultrasound","ko":"혈액 검사, 소변 검사, 흉부 X선, 심전도, 복부 초음파를 포함한 기본 전신 검사","zh":"基本全身筛查，包括血液检查、尿液检查、胸部X光、心电图和腹部超声","ja":"血液検査、尿検査、胸部X線、心電図、腹部エコーを含む基本的な全身検査"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'executive-health-screening'),
 '{"en":"Premium Health Check-up","ko":"프리미엄 건강검진","zh":"高级健康体检","ja":"プレミアム健康診断"}',
 'premium-health-checkup',
 '{"en":"Comprehensive screening adding endoscopy, cardiac CT, brain MRI, and cancer markers to the standard package","ko":"표준 패키지에 내시경, 심장 CT, 뇌 MRI, 암 표지자를 추가한 종합 검사","zh":"在基础套餐基础上增加内窥镜、心脏CT、脑部MRI和肿瘤标志物的综合检查","ja":"標準パッケージに内視鏡、心臓CT、脳MRI、腫瘍マーカーを追加した総合検査"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'executive-health-screening'),
 '{"en":"VIP Executive Check-up","ko":"VIP 종합 건강검진","zh":"VIP高管健康体检","ja":"VIP人間ドック"}',
 'vip-health-checkup',
 '{"en":"Full-day head-to-toe screening with PET-CT, full-body MRI, genetic risk assessment, and personalized specialist consultation","ko":"PET-CT, 전신 MRI, 유전적 위험 평가, 맞춤형 전문의 상담을 포함한 하루 종일 머리부터 발끝까지 검사","zh":"全天从头到脚筛查，包括PET-CT、全身MRI、遗传风险评估和个性化专科医生咨询","ja":"PET-CT、全身MRI、遺伝的リスク評価、個別専門医相談を含む一日かけた頭から足先までの検査"}',
 3),

-- Cancer Screening
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'cancer-screening'),
 '{"en":"General Cancer Screening","ko":"일반 암 검진","zh":"一般癌症筛查","ja":"一般がん検診"}',
 'general-cancer-screening',
 '{"en":"Multi-cancer screening panel covering colorectal, lung, stomach, liver, and prostate/cervical cancers","ko":"대장암, 폐암, 위암, 간암, 전립선/자궁경부암을 포함하는 다중 암 검사 패널","zh":"涵盖结直肠癌、肺癌、胃癌、肝癌和前列腺癌/宫颈癌的多癌筛查套餐","ja":"大腸がん、肺がん、胃がん、肝がん、前立腺がん/子宮頸がんをカバーする多がんスクリーニングパネル"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'cancer-screening'),
 '{"en":"PET-CT Cancer Screening","ko":"PET-CT 암 검진","zh":"PET-CT癌症筛查","ja":"PET-CTがん検診"}',
 'pet-ct-cancer-screening',
 '{"en":"Whole-body PET-CT scan for the most comprehensive early-stage cancer detection available","ko":"가장 포괄적인 조기 암 발견을 위한 전신 PET-CT 스캔","zh":"全身PET-CT扫描，提供最全面的早期癌症检测","ja":"利用可能な最も包括的な早期がん検出のための全身PET-CTスキャン"}',
 2),

-- IVF
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'ivf-treatment'),
 '{"en":"Standard IVF","ko":"표준 시험관 시술","zh":"标准试管婴儿","ja":"標準体外受精"}',
 'standard-ivf',
 '{"en":"Conventional IVF with full ovarian stimulation, egg retrieval, fertilization, and embryo transfer","ko":"완전한 난소 자극, 난자 채취, 수정, 배아 이식을 포함한 표준 체외 수정","zh":"包含完整卵巢刺激、取卵、受精和胚胎移植的常规试管婴儿","ja":"完全な卵巣刺激、採卵、受精、胚移植を含む従来の体外受精"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'ivf-treatment'),
 '{"en":"Frozen Embryo Transfer (FET)","ko":"동결 배아 이식","zh":"冷冻胚胎移植","ja":"凍結胚移植（FET）"}',
 'frozen-embryo-transfer',
 '{"en":"Transfer of previously frozen embryos in a medicated or natural cycle — often used after a prior IVF egg retrieval","ko":"이전 체외 수정 난자 채취 후 종종 사용되는 약물 또는 자연 주기에서 이전에 냉동된 배아 이식","zh":"在用药或自然周期中移植之前冷冻的胚胎 — 通常在之前的试管婴儿取卵后使用","ja":"薬物または自然周期での以前に凍結した胚の移植 — 以前のIVF採卵後によく使用される"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'ivf-treatment'),
 '{"en":"Mini IVF","ko":"미니 시험관 시술","zh":"微刺激试管婴儿","ja":"低刺激体外受精"}',
 'mini-ivf',
 '{"en":"Low-stimulation IVF using fewer medications — gentler on the body with lower costs, suitable for poor ovarian responders","ko":"더 적은 약물을 사용하는 저자극 시험관 — 난소 반응이 낮은 환자에게 적합한 신체에 더 부드럽고 낮은 비용","zh":"使用较少药物的低刺激试管婴儿 — 对身体更温和，费用更低，适合卵巢低反应者","ja":"少ない薬剤を使用する低刺激体外受精 — 卵巣低反応者に適した体への負担が少なく低コスト"}',
 3),

-- Women's Health Check-up
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'womens-health-checkup'),
 '{"en":"Fertility Assessment","ko":"난임 평가","zh":"生育评估","ja":"妊孕性評価"}',
 'fertility-assessment',
 '{"en":"Comprehensive evaluation of egg reserve (AMH), ovarian structure, uterine anatomy, and hormonal profile","ko":"난자 예비력(AMH), 난소 구조, 자궁 해부학, 호르몬 프로필의 종합 평가","zh":"全面评估卵巢储备（AMH）、卵巢结构、子宫解剖和激素水平","ja":"卵子予備能（AMH）、卵巣構造、子宮解剖、ホルモンプロファイルの総合評価"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'womens-health-checkup'),
 '{"en":"Women''s Cancer Screening","ko":"여성 암 검진","zh":"女性癌症筛查","ja":"女性がん検診"}',
 'womens-cancer-screening',
 '{"en":"Pap smear, HPV test, breast ultrasound and mammogram, and ovarian cancer marker panel for women","ko":"여성을 위한 자궁경부 세포검사, HPV 검사, 유방 초음파 및 유방촬영술, 난소암 표지자 패널","zh":"女性宫颈涂片检查、HPV检测、乳腺超声和乳腺X线、卵巢癌标志物套餐","ja":"子宮頸部細胞診、HPV検査、乳房エコーとマンモグラフィー、卵巣がんマーカーパネル"}',
 2)

ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. FAQs
-- faqs 테이블에 slug 컬럼 없음 → 해당 서비스 FAQ 삭제 후 재삽입
-- ============================================================

DELETE FROM faqs WHERE service_id IN (
  SELECT id FROM services WHERE slug IN (
    'lasik-lasek', 'rhinoplasty', 'hair-transplant', 'dental-implant', 'ivf-treatment'
  )
);

INSERT INTO faqs (id, service_id, question, answer, sort_order)
VALUES

-- LASIK/LASEK FAQs
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"Am I a good candidate for laser eye surgery?","ko":"레이저 안과 수술에 적합한 후보자인가요?","zh":"我适合做激光眼科手术吗？","ja":"レーザー眼科手術の適切な候補者ですか？"}',
 '{"en":"Good candidates are generally over 18, have a stable prescription for at least 1 year, and have sufficient corneal thickness. A thorough pre-op consultation including corneal mapping and pupil measurement will determine which procedure suits you best.","ko":"좋은 후보자는 일반적으로 18세 이상, 최소 1년간 안정적인 시력, 충분한 각막 두께를 가지고 있습니다. 각막 지도 및 동공 측정을 포함한 철저한 수술 전 상담을 통해 가장 적합한 시술을 결정합니다.","zh":"好的候选人通常年龄超过18岁，处方稳定至少1年，并且有足够的角膜厚度。包括角膜图谱和瞳孔测量的全面术前咨询将确定哪种手术最适合您。","ja":"適切な候補者は通常18歳以上で、少なくとも1年間安定した視力を持ち、十分な角膜の厚さがあります。角膜マッピングと瞳孔測定を含む詳細な術前相談でどの手術が最適かを決定します。"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"How long does the procedure take?","ko":"시술은 얼마나 걸리나요?","zh":"手术需要多长时间？","ja":"手術にはどのくらい時間がかかりますか？"}',
 '{"en":"The actual laser treatment takes less than 60 seconds per eye. You will spend 2–3 hours at the clinic on the day of your procedure for preparation, the surgery itself, and a brief post-operative check.","ko":"실제 레이저 치료는 눈당 60초 미만입니다. 시술 당일 준비, 수술, 짧은 수술 후 확인을 위해 클리닉에서 2-3시간을 보냅니다.","zh":"实际激光治疗每只眼睛不到60秒。手术当天，您将在诊所度过2-3小时，包括准备、手术本身和简短的术后检查。","ja":"実際のレーザー治療は目一つあたり60秒未満です。当日は準備、手術本体、術後の簡単な確認のためにクリニックで2〜3時間過ごします。"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"What is the difference between LASIK and LASEK?","ko":"라식과 라섹의 차이는 무엇인가요?","zh":"LASIK和LASEK有什么区别？","ja":"LASIKとLASEKの違いは何ですか？"}',
 '{"en":"LASIK creates a thin corneal flap before the laser reshapes the tissue underneath — recovery is rapid (usually 1 day). LASEK removes the epithelial layer directly, making it better for thinner corneas or contact sports, but recovery takes 3–5 days.","ko":"라식은 레이저가 아래 조직을 재형성하기 전에 얇은 각막 플랩을 만듭니다 — 회복이 빠릅니다(보통 1일). 라섹은 상피층을 직접 제거하여 얇은 각막이나 접촉 스포츠에 더 적합하지만 회복에 3-5일이 걸립니다.","zh":"LASIK在激光重塑下层组织之前创建一个薄角膜瓣 — 恢复迅速（通常1天）。LASEK直接去除上皮层，更适合薄角膜或接触性运动，但恢复需要3-5天。","ja":"LASIKはレーザーが下の組織を再形成する前に薄い角膜フラップを作成します — 回復が早い（通常1日）。LASEKは上皮層を直接除去し、薄い角膜や接触スポーツに適していますが、回復に3〜5日かかります。"}',
 3),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'lasik-lasek'),
 '{"en":"Will I need glasses after the surgery?","ko":"수술 후 안경이 필요한가요?","zh":"手术后我还需要戴眼镜吗？","ja":"手術後眼鏡は必要ですか？"}',
 '{"en":"Over 95% of patients achieve 20/20 vision or better after laser eye surgery and no longer need glasses for daily activities. Some patients may require a mild prescription for night driving or reading after the age of 40 (presbyopia).","ko":"레이저 안과 수술 후 95% 이상의 환자가 20/20 이상의 시력을 달성하여 일상 활동에 더 이상 안경이 필요하지 않습니다. 일부 환자는 40세 이후 야간 운전이나 독서를 위한 약한 처방이 필요할 수 있습니다.","zh":"超过95%的患者在激光眼科手术后视力达到20/20或更好，日常活动不再需要眼镜。40岁后，部分患者可能需要轻微处方用于夜间驾驶或阅读（老花眼）。","ja":"レーザー眼科手術後、95%以上の患者が20/20以上の視力を達成し、日常活動に眼鏡が不要になります。一部の患者は40歳以降の夜間運転や読書に軽い処方が必要になる場合があります（老眼）。"}',
 4),

-- Rhinoplasty FAQs
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"How long is the recovery after rhinoplasty?","ko":"코 성형 후 회복 기간은 얼마나 걸리나요?","zh":"鼻整形后需要多长时间恢复？","ja":"鼻整形後の回復期間はどのくらいですか？"}',
 '{"en":"Most swelling resolves within 2–3 weeks. A cast or splint is worn for 7–10 days post-surgery. You can return to light work within 1–2 weeks, but final results are visible after 6–12 months as subtle swelling gradually subsides.","ko":"대부분의 부기는 2-3주 내에 사라집니다. 수술 후 7-10일 동안 깁스나 부목을 착용합니다. 1-2주 내에 가벼운 업무로 복귀할 수 있지만 미묘한 부기가 점차 가라앉으면서 최종 결과는 6-12개월 후에 보입니다.","zh":"大多数肿胀在2-3周内消退。术后需要佩戴石膏或夹板7-10天。您可以在1-2周内恢复轻度工作，但随着轻微肿胀逐渐消退，最终效果需要6-12个月才能显现。","ja":"ほとんどの腫れは2〜3週間で解消されます。手術後7〜10日間はギプスやスプリントを着用します。1〜2週間で軽い仕事に戻れますが、微妙な腫れが徐々に引くため最終的な結果は6〜12ヶ月後に見えます。"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"Will the results look natural?","ko":"결과가 자연스러워 보일까요?","zh":"效果看起来自然吗？","ja":"結果は自然に見えますか？"}',
 '{"en":"Korean plastic surgeons specialize in creating results that harmonize with your natural features. The goal is a balanced profile that looks like your nose has always been that way — not an obviously operated appearance. Natural filler-free results are a hallmark of top Korean surgeons.","ko":"한국 성형외과 의사들은 자연스러운 특징과 조화되는 결과를 만드는 데 전문화되어 있습니다. 목표는 항상 그런 코였던 것처럼 보이는 균형 잡힌 프로필입니다.","zh":"韩国整形外科医生专门创造与您自然特征和谐的效果。目标是平衡的侧面轮廓，看起来就像您的鼻子一直就是这样 — 而不是明显手术过的外观。","ja":"韓国の形成外科医はあなたの自然な特徴と調和する結果を作ることを専門としています。目標はいつもそういう鼻だったように見えるバランスの取れたプロファイルです。"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'rhinoplasty'),
 '{"en":"What materials are used in Korean rhinoplasty?","ko":"한국 코 성형에는 어떤 재료가 사용되나요?","zh":"韩国鼻整形使用什么材料？","ja":"韓国の鼻整形にはどのような素材が使われますか？"}',
 '{"en":"Korean surgeons typically use medical-grade silicone implants for the bridge and the patient''s own cartilage (from the ear or rib) for the tip. Using autologous cartilage for the tip gives more natural results and reduces long-term complication risk.","ko":"한국 성형외과 의사들은 일반적으로 콧대에는 의료용 실리콘 임플란트를, 코 끝에는 환자 자신의 연골(귀 또는 갈비뼈)을 사용합니다. 코 끝에 자가 연골을 사용하면 더 자연스러운 결과와 장기적 합병증 위험을 줄입니다.","zh":"韩国外科医生通常使用医用硅胶植入物做鼻梁，用患者自身软骨（来自耳朵或肋骨）做鼻尖。使用自体软骨做鼻尖效果更自然，长期并发症风险更低。","ja":"韓国の外科医は通常、鼻筋には医療グレードのシリコンインプラントを、鼻先には患者自身の軟骨（耳または肋骨から）を使用します。鼻先に自家軟骨を使うことでより自然な結果が得られ、長期的な合併症リスクが減少します。"}',
 3),

-- Hair Transplant FAQs
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'hair-transplant'),
 '{"en":"When will I see the final results?","ko":"최종 결과는 언제 볼 수 있나요?","zh":"什么时候能看到最终效果？","ja":"最終的な結果はいつ見られますか？"}',
 '{"en":"Transplanted hair falls out within 2–4 weeks (shock loss) and begins regrowth around 3–4 months. Significant density is visible at 6 months, and the final result — with full thickness and natural hairline — is seen at 12–18 months.","ko":"이식된 모발은 2-4주 내에 빠집니다(충격성 탈모) 3-4개월 주변에 재성장이 시작됩니다. 6개월에 상당한 밀도가 보이며, 완전한 두께와 자연스러운 헤어라인의 최종 결과는 12-18개월에 나타납니다.","zh":"移植的头发在2-4周内脱落（休克性脱发），大约3-4个月开始重新生长。6个月时可以看到明显的密度，12-18个月后才能看到完整厚度和自然发际线的最终效果。","ja":"移植した毛髪は2〜4週間で抜け落ち（シェッディング）、3〜4ヶ月頃から再成長が始まります。6ヶ月で相当な密度が見られ、完全な太さと自然なヘアラインを持つ最終結果は12〜18ヶ月で現れます。"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'hair-transplant'),
 '{"en":"Is the hair transplant permanent?","ko":"모발 이식은 영구적인가요?","zh":"植发效果是永久性的吗？","ja":"植毛は永久的ですか？"}',
 '{"en":"Yes. The transplanted follicles are taken from the donor zone (back and sides of the scalp), which is genetically resistant to hair loss. Once transplanted, these follicles retain their DHT-resistance and grow permanently for life.","ko":"네. 이식된 모낭은 탈모에 유전적으로 저항성이 있는 공여 구역(두피 뒤쪽과 옆쪽)에서 채취됩니다. 이식된 후 이 모낭들은 DHT 저항성을 유지하고 평생 영구적으로 자랍니다.","zh":"是的。移植的毛囊来自捐献区（头皮后部和两侧），遗传上对脱发有抵抗力。移植后，这些毛囊保持其DHT抵抗力，终生永久生长。","ja":"はい。移植した毛包は脱毛に対して遺伝的に抵抗力のあるドナーゾーン（頭皮の後部と側面）から採取されます。移植後、これらの毛包はDHT耐性を維持し、生涯にわたって永久に成長します。"}',
 2),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'hair-transplant'),
 '{"en":"How many grafts do I need?","ko":"몇 개의 이식편이 필요한가요?","zh":"我需要多少个毛囊单位？","ja":"何グラフト必要ですか？"}',
 '{"en":"The number of grafts depends on the degree of hair loss and desired density. A typical frontal hairline restoration requires 1,500–2,500 grafts, while a full crown restoration may need 2,500–4,000. An in-person or virtual consultation with scalp analysis will give you an accurate estimate.","ko":"이식편의 수는 탈모 정도와 원하는 밀도에 따라 다릅니다. 일반적인 전방 헤어라인 복원은 1,500-2,500개, 전체 크라운 복원은 2,500-4,000개가 필요할 수 있습니다.","zh":"所需移植体数量取决于脱发程度和期望的密度。典型的前额发际线修复需要1500-2500个移植体，而全冠顶修复可能需要2500-4000个。面对面或虚拟头皮分析咨询将给出准确估计。","ja":"必要なグラフト数は脱毛の程度と望む密度によって異なります。典型的な前頭部ヘアライン修復は1,500〜2,500グラフト、クラウン全体の修復は2,500〜4,000グラフトが必要な場合があります。"}',
 3),

-- Dental Implant FAQs (add to existing service)
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'dental-implant'),
 '{"en":"How long do dental implants last?","ko":"치과 임플란트는 얼마나 오래 지속되나요?","zh":"牙科种植牙能用多久？","ja":"歯科インプラントはどのくらい持ちますか？"}',
 '{"en":"With proper care, dental implants can last a lifetime. The titanium implant post integrates with the jawbone permanently. The crown on top typically lasts 15–25 years before needing replacement, while the implant itself rarely requires any changes.","ko":"적절한 관리로 치과 임플란트는 평생 지속될 수 있습니다. 티타늄 임플란트 포스트는 영구적으로 턱뼈와 통합됩니다. 위의 크라운은 일반적으로 교체가 필요하기 전까지 15-25년 지속됩니다.","zh":"通过适当护理，牙科种植牙可以使用终生。钛种植体柱与颌骨永久融合。上面的牙冠通常可以使用15-25年再换，而种植体本身几乎不需要任何更换。","ja":"適切なケアにより、歯科インプラントは生涯持続します。チタンインプラントポストは永久的に顎骨と統合されます。上のクラウンは通常15〜25年で交換が必要ですが、インプラント自体はほとんど変更が必要ありません。"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'dental-implant'),
 '{"en":"Is the implant procedure painful?","ko":"임플란트 시술은 아프나요?","zh":"种植牙手术疼吗？","ja":"インプラント手術は痛いですか？"}',
 '{"en":"The procedure is performed under local anesthesia, so you will not feel pain during surgery. Some soreness and swelling are normal for the first few days, well-managed with standard pain relievers. Most patients describe the experience as less uncomfortable than expected.","ko":"시술은 국소 마취 하에 시행되므로 수술 중 통증을 느끼지 않습니다. 처음 며칠 동안 약간의 통증과 부기는 정상이며 표준 진통제로 잘 관리됩니다.","zh":"手术在局部麻醉下进行，因此手术中不会感到疼痛。最初几天出现一些酸痛和肿胀是正常的，标准止痛药可以很好地控制。大多数患者描述体验比预期更舒适。","ja":"手術は局所麻酔下で行われるため、手術中は痛みを感じません。最初の数日間の軽い痛みと腫れは正常で、標準的な鎮痛剤でうまく管理できます。ほとんどの患者は予想より快適だったと述べています。"}',
 2),

-- IVF FAQs
(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'ivf-treatment'),
 '{"en":"What are the success rates for IVF in Korea?","ko":"한국 시험관 시술의 성공률은 어떤가요?","zh":"韩国试管婴儿的成功率是多少？","ja":"韓国でのIVFの成功率はどのくらいですか？"}',
 '{"en":"Korean IVF clinics consistently report clinical pregnancy rates of 45–55% per fresh embryo transfer for women under 35, and 35–45% for women aged 35–40. These rates are among the highest globally, backed by decades of volume and specialist expertise.","ko":"한국 시험관 클리닉은 35세 미만 여성의 신선 배아 이식당 임상 임신율 45-55%, 35-40세 여성의 경우 35-45%를 지속적으로 보고합니다. 이 비율은 수십 년의 경험과 전문가 전문성에 의해 뒷받침되는 세계 최고 수준 중 하나입니다.","zh":"韩国试管婴儿诊所在35岁以下女性的新鲜胚胎移植临床妊娠率持续报告为45-55%，35-40岁女性为35-45%。这些比率是全球最高的之一，得益于数十年的数量和专家经验。","ja":"韓国のIVFクリニックは35歳未満の女性の新鮮胚移植あたりの臨床妊娠率が45〜55%、35〜40歳の女性では35〜45%と継続的に報告しています。これらの比率は数十年の経験と専門知識に裏付けられた世界で最も高い水準の一つです。"}',
 1),

(gen_random_uuid(), (SELECT id FROM services WHERE slug = 'ivf-treatment'),
 '{"en":"Can I do IVF consultations remotely before traveling to Korea?","ko":"한국에 오기 전에 원격으로 시험관 상담을 받을 수 있나요?","zh":"去韩国之前可以远程进行试管婴儿咨询吗？","ja":"韓国に来る前にIVF相談をリモートで受けられますか？"}',
 '{"en":"Yes. Most leading Korean fertility clinics offer telemedicine consultations via video call. You can share previous fertility workups, discuss treatment options, and receive a preliminary protocol before your visit. Blood tests and ultrasounds can often be done locally and results shared with the Korean clinic.","ko":"네. 대부분의 주요 한국 난임 클리닉은 화상 통화를 통한 원격 진료 상담을 제공합니다. 이전 난임 검사 결과를 공유하고, 치료 옵션을 논의하고, 방문 전 예비 프로토콜을 받을 수 있습니다.","zh":"是的。大多数领先的韩国生育诊所提供视频通话的远程医疗咨询。您可以分享之前的生育检查、讨论治疗选项，并在就诊前获得初步方案。血液检测和超声波通常可以在当地进行，将结果分享给韩国诊所。","ja":"はい。ほとんどの主要な韓国の不妊クリニックはビデオ通話によるテレメディシン相談を提供しています。以前の不妊検査を共有し、治療オプションを話し合い、来院前に予備的なプロトコルを受け取ることができます。"}',
 2);
