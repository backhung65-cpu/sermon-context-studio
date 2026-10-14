// Historical dictionary background is kept separate from verse evidence and map coordinates.
export function noteForPlace(payload, atlasCommit, placeId) {
  if (!payload || payload.placeSourceCommit !== atlasCommit || !placeId) return null;
  const note = payload.notes?.[placeId];
  return note?.sourceName && note.sharedVerses > 0 && Array.isArray(note.paragraphs)
    && note.paragraphs.some((paragraph) => typeof paragraph === 'string' && paragraph.trim()) ? note : null;
}

export function dictionaryPlainText(value) {
  return String(value).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
}

export function geographyNoteCopy(locale) {
  const messages = {
    ko: ['지리 배경 사전', '1897년 영어 원문', '옛 사전의 설명입니다. 현대의 위치 확정이나 이 본문에 대한 해석으로 받아들이지 말고 성경 본문과 최신 연구 자료를 함께 확인하세요.', '이스턴 성경 사전 원전', '지명 연결 자료'],
    en: ['Geographic dictionary background', '1897 English original', 'This is a historical dictionary entry, not a modern location verdict or an interpretation of this passage. Check the Bible text and current scholarship.', 'Easton’s original', 'Place-link data'],
    ja: ['地理背景辞典', '1897年の英語原文', '古い辞典の説明です。現在の位置の確定やこの箇所の解釈とはせず、聖書本文と新しい研究資料も確認してください。', 'イーストン聖書辞典の原典', '地名の照合資料'],
    'zh-CN': ['地理背景词典', '1897年英文原文', '这是历史词典的说明，不能视为现代地点定论或本段经文的解释。请同时查核圣经正文与近期研究。', '伊斯顿圣经词典原文', '地名关联资料'],
    es: ['Diccionario geográfico histórico', 'Original inglés de 1897', 'Esta entrada histórica no establece la ubicación actual ni interpreta este pasaje. Compruebe el texto bíblico y los estudios actuales.', 'Diccionario original de Easton', 'Datos de vinculación'],
    th: ['พจนานุกรมภูมิศาสตร์พระคัมภีร์', 'ต้นฉบับภาษาอังกฤษ ปี 1897', 'นี่คือข้อมูลจากพจนานุกรมเก่า ไม่ใช่ข้อสรุปเรื่องตำแหน่งหรือคำอธิบายตอนพระคัมภีร์นี้ โปรดตรวจข้อความพระคัมภีร์และงานวิจัยปัจจุบันด้วย', 'พจนานุกรมอีสตันฉบับต้นทาง', 'ข้อมูลเชื่อมโยงสถานที่'],
    hi: ['भौगोलिक पृष्ठभूमि शब्दकोश', '1897 का अंग्रेज़ी मूल पाठ', 'यह पुराने शब्दकोश की प्रविष्टि है; इसे वर्तमान स्थान का निष्कर्ष या इस अंश की व्याख्या न मानें। बाइबल पाठ और आधुनिक शोध भी जाँचें।', 'ईस्टन शब्दकोश का मूल', 'स्थान मिलान डेटा'],
    fr: ['Dictionnaire géographique historique', 'Original anglais de 1897', 'Cette notice ancienne ne confirme pas un emplacement actuel et n’interprète pas ce passage. Vérifiez le texte biblique et les recherches récentes.', 'Dictionnaire original d’Easton', 'Données de rapprochement'],
    de: ['Historisches Ortslexikon', 'Englischer Originaltext von 1897', 'Dieser ältere Lexikoneintrag bestätigt keinen heutigen Standort und legt diesen Abschnitt nicht aus. Prüfen Sie den Bibeltext und aktuelle Forschung.', 'Eastons Originallexikon', 'Ortsabgleichsdaten'],
  };
  const [title, original, caution, source, data] = messages[locale] || messages.en;
  return { title, original, caution, source, data };
}
