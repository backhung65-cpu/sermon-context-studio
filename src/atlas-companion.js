// A reading index for the user-supplied KeepBible map PDFs. These are references
// to the publisher's plates, not imported coordinates, map images, or commentary.
export const ATLAS_PUBLISHER_PAGE = 'https://keepbible.com/Pds1/View/3o5?page=13';
export const ATLAS_STUDY_PDF = 'https://keepbible.com/Pds1//BoardAdtDownload/6672';
export const ATLAS_COMPACT_PDF = 'https://keepbible.com/Pds1//BoardAdtDownload/6671';

const PLATES = {
  ancientWorld: { studyPage: 14, title: ['고대 근동의 강과 지역', 'Rivers and regions of the ancient Near East'], prompt: ['본문에 직접 나오는 지명과 넓은 지역 이름을 구별해 보세요.', 'Distinguish places named in the passage from broad regional labels.'] },
  egypt: { studyPage: 16, title: ['고대 이집트와 나일강', 'Ancient Egypt and the Nile'], prompt: ['애굽 전체 지역과 본문이 명시한 개별 장소를 나누어 보세요.', 'Separate Egypt as a broad region from individual places named in the passage.'] },
  exodusRoute: { studyPage: 17, compactPage: 5, title: ['이집트 탈출 경로 비교', 'Comparing proposed Exodus routes'], prompt: ['원본도 두 추정 경로를 구분합니다. 본문에 없는 경유지를 확정된 이동 장소로 읽지 마세요.', 'The source shows two proposed routes. Do not treat unmentioned stops as established travel locations.'] },
  sinaiTerrain: { studyPage: 50, title: ['시내 반도의 지형', 'Terrain of the Sinai Peninsula'], prompt: ['호렙·시내산의 위치는 논쟁 중입니다. 현재 지형과 본문에서 확인되는 장소를 따로 살펴보세요.', 'The location of Horeb/Sinai is disputed. Compare modern terrain separately from places named in the passage.'] },
  mountains: { studyPage: 55, title: ['산과 고도 비교', 'Mountains and elevations'], prompt: ['산 이름과 오늘날 고도를 참고하되, 고대 지명의 동일시를 확정 사실로 삼지 마세요.', 'Use modern elevations for context without treating ancient identifications as certain.'] },
  conquest: { studyPage: 19, title: ['가나안 정복 개관', 'Overview of the conquest of Canaan'], prompt: ['지도에 이어진 선과 본문에 명시된 사건 순서를 대조해 보세요.', 'Compare drawn lines with the sequence actually stated in the passage.'] },
  tribes: { studyPage: 21, title: ['이스라엘 열두 지파의 지역', 'Regions of the twelve tribes'], prompt: ['지파의 대략적인 영역을 현재 본문에 명시된 도시·경계와 구별해 보세요.', 'Separate approximate tribal regions from the towns and borders named in this passage.'] },
  judges: { studyPage: 20, title: ['사사 시대의 도시들', 'Cities in the period of the judges'], prompt: ['도시·지파 영역·사건 장소는 서로 다른 정보입니다. 본문이 말하는 범위를 확인하세요.', 'Cities, tribal territories, and event locations are different claims. Check which the passage makes.'] },
  monarchy: { studyPage: 32, title: ['사울·다윗·솔로몬 시대의 지역', 'Regions in the time of Saul, David, and Solomon'], prompt: ['왕국의 넓은 경계와 한 장면의 실제 장소를 분리해 읽어 보세요.', 'Separate broad kingdom boundaries from the location of a single scene.'] },
  dividedKingdom: { studyPage: 33, title: ['분단 왕국의 지역', 'Regions of the divided kingdoms'], prompt: ['남유다·북이스라엘의 시대적 배경과 본문에 나온 도시를 구별해 보세요.', 'Separate the period setting of Judah and Israel from cities named in the passage.'] },
  assyria: { studyPage: 34, title: ['아시리아 제국과 이스라엘', 'Assyria and Israel'], prompt: ['제국의 세력 범위와 본문에 이름이 나온 도시·사건의 실제 범위를 구별해 보세요.', 'Separate an empire’s extent from towns and events named in the passage.'] },
  exile: { studyPage: 35, title: ['유다의 포로와 귀환 배경', 'Geography of exile and return'], prompt: ['제국의 이동 화살표는 여러 시대를 압축한 편집 도식입니다. 본문의 인물·연대를 먼저 확인하세요.', 'The arrows compress several periods. Check the passage’s people and chronology first.'] },
  gospelRegion: { studyPage: 42, title: ['1세기 팔레스타인의 지명', 'Places of first-century Palestine'], prompt: ['갈릴리·사마리아·유대 같은 지역과 개별 마을을 구별해 보세요.', 'Distinguish regions such as Galilee, Samaria, and Judea from individual towns.'] },
  newTestamentRegions: { studyPage: 41, title: ['신약 시대의 지역', 'Regions of the New Testament era'], prompt: ['넓은 지역명과 본문의 특정 도시를 구분해 보세요.', 'Distinguish broad regional names from specific towns in the passage.'] },
  galileeTerrain: { studyPage: 54, title: ['갈릴리 바다 주변의 지형', 'Terrain around the Sea of Galilee'], prompt: ['오늘날 호수 주변의 지형은 장면의 배경입니다. 본문에 없는 항해 경로는 추정하지 마세요.', 'Modern terrain gives context; avoid inventing a voyage route the passage does not state.'] },
  paulFirstSecond: { studyPage: 44, compactPage: 18, title: ['바울의 1·2차 선교 여행', 'Paul’s first and second journeys'], prompt: ['도시 순서를 사도행전 장절과 하나씩 대조해 보세요. 지도 선은 재구성된 이동입니다.', 'Check each city against Acts in order. The map lines reconstruct travel.'] },
  paulThird: { studyPage: 45, compactPage: 19, title: ['바울의 3차 선교 여행', 'Paul’s third journey'], prompt: ['돌아가는 구간과 방문 도시를 본문 절 순서대로 구분해 보세요.', 'Separate the return leg and visited towns using the order in Acts.'] },
  paulRome: { studyPage: 46, compactPage: 20, title: ['바울의 로마 이송', 'Paul’s voyage to Rome'], prompt: ['해상 이동선은 항로 재구성입니다. 본문에 나온 항구와 폭풍·표류 구간을 따로 확인하세요.', 'The sea line is a reconstructed route. Check named ports and the storm/drift section separately.'] },
};

function plate(id) { return { id, ...PLATES[id] }; }

export function atlasPlatesForPassage(reference) {
  if (!reference || !Number.isInteger(reference.chapter)) return [];
  const { code, chapter } = reference;
  if (code === 'GEN' && chapter >= 37) return [plate('ancientWorld'), plate('egypt')];
  if (code === 'GEN' && chapter >= 10) return [plate('ancientWorld')];
  if (code === 'EXO' && (chapter <= 2 || chapter >= 5 && chapter <= 12)) return [plate('egypt')];
  if (code === 'EXO' && chapter <= 4) return [plate('sinaiTerrain'), plate('mountains')];
  if (code === 'EXO' && chapter <= 18) return [plate('exodusRoute'), plate('sinaiTerrain')];
  if (code === 'EXO' || (code === 'NUM' && chapter <= 10)) return [plate('sinaiTerrain')];
  if (code === 'NUM' && chapter >= 11 && chapter <= 21) return [plate('exodusRoute')];
  if (code === 'JOS') return [plate(chapter <= 12 ? 'conquest' : 'tribes')];
  if (code === 'JDG' || code === 'RUT') return [plate('judges')];
  if (code === '1SA') return [plate(chapter <= 7 ? 'judges' : 'monarchy')];
  if (code === '2SA' || (code === '1CH' && chapter >= 10)) return [plate('monarchy')];
  if (code === '1KI') return [plate(chapter <= 11 ? 'monarchy' : 'dividedKingdom')];
  if (code === '2KI') return [plate(chapter >= 24 ? 'exile' : chapter >= 18 && chapter <= 20 ? 'assyria' : 'dividedKingdom')];
  if (code === '2CH') return [plate(chapter <= 9 ? 'monarchy' : chapter >= 36 ? 'exile' : 'dividedKingdom')];
  if (code === 'EZR' || code === 'NEH') return [plate('exile')];
  if (['MAT', 'MRK', 'LUK', 'JHN'].includes(code)) {
    const nearGalilee = (code === 'MAT' && chapter === 8) || (code === 'MRK' && chapter === 4)
      || (code === 'LUK' && chapter === 8) || (code === 'JHN' && chapter === 6);
    return nearGalilee ? [plate('gospelRegion'), plate('galileeTerrain')] : [plate('gospelRegion')];
  }
  if (code === 'ACT') {
    if (chapter >= 27) return [plate('paulRome')];
    if (chapter >= 19 && chapter <= 21) return [plate('paulThird')];
    if ((chapter >= 13 && chapter <= 14) || (chapter >= 16 && chapter <= 18)) return [plate('paulFirstSecond')];
    if (chapter <= 12) return [plate('newTestamentRegions')];
    return [];
  }
  return [];
}

export function atlasPlatesForJourney(id) {
  const ids = {
    abraham: ['ancientWorld'], moses: ['exodusRoute', 'sinaiTerrain'],
    'jesus-early': ['gospelRegion'], 'jesus-ministry': ['gospelRegion', 'galileeTerrain'],
    paul: ['paulFirstSecond'], 'paul-2': ['paulFirstSecond'], 'paul-3': ['paulThird'],
  };
  return (ids[id] || []).map(plate);
}

const COPY = {
  ko: { eyebrow: '지도 자료 대조', title: '이 본문과 함께 펼칠 도판', intro: '성경지도선도의 해당 쪽을 찾아, 앱의 본문 근거와 비교해 보세요.', study: '96쪽 스터디판', compact: '32쪽 선별판', page: 'PDF {page}쪽', openStudy: '스터디판 열기', openCompact: '선별판 열기', openPlate: '이 도판 보기', source: '발행처와 자료 안내', caveat: '킹제임스 흠정역 판의 편집 지도입니다. 경로·연대·옛 지명의 동일시는 출판사의 해석이거나 논쟁 중일 수 있습니다. 앱의 좌표와 본문 근거를 대신하지 않습니다.' },
  en: { eyebrow: 'Compare atlas sources', title: 'Atlas plates for this passage', intro: 'Use these pages from the supplied Bible atlas alongside the passage evidence in this app.', study: '96-page study edition', compact: '32-page compact edition', page: 'PDF page {page}', openStudy: 'Open study PDF', openCompact: 'Open compact PDF', openPlate: 'Open this plate', source: 'Publisher and source', caveat: 'These editorial maps come from a King James Bible edition. Routes, dates, and ancient site identifications may reflect the publisher’s interpretation or be disputed; the plates do not establish this app’s coordinates.' },
  ja: { eyebrow: '地図資料との照合', title: 'この箇所に関連する地図', intro: '韓国語版の原本PDFと、このアプリの聖句根拠を照らし合わせてください。', study: '96ページ版', compact: '32ページ版', page: 'PDF {page}ページ', openStudy: '96ページ版を開く', openCompact: '32ページ版を開く', openPlate: 'この地図を見る', source: '出版社と資料', caveat: 'これは欽定訳に付属する編集地図です。経路・年代・古代の地名の比定には解釈や異論があります。アプリの座標や聖句の根拠を確定する資料ではありません。' },
  'zh-CN': { eyebrow: '对照地图资料', title: '与本段经文相关的地图', intro: '对照韩文原版 PDF 与本应用的经文依据。', study: '96页研读版', compact: '32页精选版', page: 'PDF 第{page}页', openStudy: '打开研读版', openCompact: '打开精选版', openPlate: '查看这张地图', source: '出版方与资料', caveat: '这些是钦定版圣经附带的编辑地图。路线、年代和古地名定位可能有争议，不能据此确定本应用的坐标或经文证据。' },
  es: { eyebrow: 'Comparar mapas', title: 'Mapas relacionados con este pasaje', intro: 'Compare el PDF original en coreano con las pruebas textuales de esta aplicación.', study: 'Edición de 96 páginas', compact: 'Edición de 32 páginas', page: 'PDF pág. {page}', openStudy: 'Abrir edición de estudio', openCompact: 'Abrir edición breve', openPlate: 'Ver este mapa', source: 'Editorial y fuente', caveat: 'Son mapas editoriales de una edición de la Biblia King James. Las rutas, fechas e identificaciones antiguas pueden ser discutidas; no establecen las coordenadas ni la evidencia textual de esta aplicación.' },
  th: { eyebrow: 'เปรียบเทียบแหล่งแผนที่', title: 'แผนที่ประกอบตอนพระคัมภีร์นี้', intro: 'เทียบ PDF ต้นฉบับภาษาเกาหลีกับหลักฐานข้อพระคัมภีร์ในแอป', study: 'ฉบับศึกษา 96 หน้า', compact: 'ฉบับย่อ 32 หน้า', page: 'PDF หน้า {page}', openStudy: 'เปิดฉบับศึกษา', openCompact: 'เปิดฉบับย่อ', openPlate: 'ดูแผนที่นี้', source: 'ผู้จัดพิมพ์และแหล่งข้อมูล', caveat: 'แผนที่เหล่านี้เป็นงานเรียบเรียงในพระคัมภีร์ฉบับคิงเจมส์ เส้นทาง วันที่ และการระบุสถานที่โบราณอาจเป็นข้อถกเถียง ไม่ใช่หลักฐานยืนยันพิกัดหรือข้อพระคัมภีร์ของแอป' },
  hi: { eyebrow: 'मानचित्र स्रोत की तुलना', title: 'इस पाठ से जुड़े मानचित्र', intro: 'कोरियाई मूल PDF की तुलना ऐप में दिए बाइबल संदर्भों से करें।', study: '96 पृष्ठ अध्ययन संस्करण', compact: '32 पृष्ठ संक्षिप्त संस्करण', page: 'PDF पृष्ठ {page}', openStudy: 'अध्ययन PDF खोलें', openCompact: 'संक्षिप्त PDF खोलें', openPlate: 'यह मानचित्र देखें', source: 'प्रकाशक और स्रोत', caveat: 'ये किंग जेम्स बाइबल संस्करण के संपादकीय मानचित्र हैं। मार्ग, तिथियाँ और प्राचीन स्थलों की पहचान विवादित हो सकती है; ये ऐप के निर्देशांक या पाठ प्रमाण की पुष्टि नहीं करते।' },
  fr: { eyebrow: 'Comparer les sources cartographiques', title: 'Cartes liées à ce passage', intro: 'Comparez le PDF original en coréen avec les références bibliques de cette application.', study: 'Édition de 96 pages', compact: 'Édition de 32 pages', page: 'PDF p. {page}', openStudy: 'Ouvrir l’édition d’étude', openCompact: 'Ouvrir l’édition abrégée', openPlate: 'Voir cette carte', source: 'Éditeur et source', caveat: 'Ces cartes éditoriales proviennent d’une édition King James. Les itinéraires, dates et identifications de sites anciens peuvent être débattus ; elles ne valident ni les coordonnées ni les références de cette application.' },
  de: { eyebrow: 'Kartenquellen vergleichen', title: 'Karten zu diesem Abschnitt', intro: 'Vergleichen Sie das koreanische Original-PDF mit den Bibelstellenangaben dieser App.', study: 'Studienausgabe mit 96 Seiten', compact: 'Kurzfassung mit 32 Seiten', page: 'PDF-Seite {page}', openStudy: 'Studienausgabe öffnen', openCompact: 'Kurzfassung öffnen', openPlate: 'Diese Karte ansehen', source: 'Verlag und Quelle', caveat: 'Diese redaktionellen Karten stammen aus einer King-James-Bibelausgabe. Routen, Datierungen und antike Ortszuordnungen können umstritten sein; sie belegen weder die Koordinaten noch die Textnachweise dieser App.' },
};

export function atlasCompanionCopy(locale) { return COPY[locale] || COPY.en; }
export function atlasPlateText(plateEntry, locale) {
  const index = locale === 'ko' ? 0 : 1;
  return { title: plateEntry.title[index], prompt: plateEntry.prompt[index] };
}
