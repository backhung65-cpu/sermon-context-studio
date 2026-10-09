// Labels for the provenance and location-candidate panels.
export const ENRICHMENT_MESSAGES = {
  ko: {
    candidateTitle: '가능한 위치 비교', candidateIntro: '학자들이 제시한 위치 후보입니다. 1번은 원자료 점수가 가장 높은 대표 좌표이며 확정 위치는 아닙니다.',
    candidateOne: '대표 후보', candidateRank: '{rank}번 후보', candidateMap: '지도에서 보기',
    candidateScore: '자료 점수 {score}', candidateVotes: '판정 기록 {count}건',
    candidateScoreHelp: '점수는 출처 자료의 상대적인 근거 지표이며 확률(%)이 아닙니다. 후보 이름은 원자료의 현대 지명 표기입니다.',
    candidateNone: '확인된 위치 후보가 없습니다.', sourceVersion: '지리 자료판',
    sourceVersionNote: 'OpenBible.info · CC BY 4.0 · 원자료의 위치 후보와 절 연결을 가공했습니다.',
    sourceRecord: '원자료 전체 근거', candidateLocation: '{name} 위치 후보 {rank}번',
  },
  en: {
    candidateTitle: 'Compare possible locations', candidateIntro: 'Location proposals in the source data. The first has the highest source score; it is not a confirmed site.',
    candidateOne: 'Leading candidate', candidateRank: 'Candidate {rank}', candidateMap: 'View on map',
    candidateScore: 'Source score {score}', candidateVotes: '{count} recorded votes',
    candidateScoreHelp: 'The score is a relative measure in the source data, not a probability. Names are modern-place labels from the source.',
    candidateNone: 'No location candidates are available.', sourceVersion: 'Geodata version',
    sourceVersionNote: 'OpenBible.info · CC BY 4.0 · Location proposals and verse links have been transformed.',
    sourceRecord: 'Full source evidence', candidateLocation: 'Location candidate {rank} for {name}',
  },
  ja: { candidateTitle: '候補地を比較', candidateIntro: '資料にある所在地の候補です。1番は資料の点数が最も高い代表地点で、確定地ではありません。', candidateOne: '代表候補', candidateRank: '候補 {rank}', candidateMap: '地図で見る', candidateScore: '資料の点数 {score}', candidateVotes: '判定記録 {count} 件', candidateScoreHelp: '点数は資料内の相対指標で、確率ではありません。名称は資料の現代地名です。', candidateNone: '候補地がありません。', sourceVersion: '地理資料の版', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · 候補地と節の関連を加工しました。', sourceRecord: '元資料の根拠', candidateLocation: '{name} の候補地 {rank}' },
  'zh-CN': { candidateTitle: '比较可能位置', candidateIntro: '原始资料中的位置候选。第一个得分最高，但并非确定地点。', candidateOne: '主要候选', candidateRank: '候选 {rank}', candidateMap: '在地图查看', candidateScore: '资料得分 {score}', candidateVotes: '判定记录 {count} 条', candidateScoreHelp: '得分是原始资料中的相对指标，并非概率。名称为现代地名。', candidateNone: '没有位置候选。', sourceVersion: '地理资料版本', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · 已加工位置候选与经节关联。', sourceRecord: '完整原始依据', candidateLocation: '{name} 的位置候选 {rank}' },
  es: { candidateTitle: 'Comparar posibles ubicaciones', candidateIntro: 'Lugares propuestos en los datos de origen. El primero tiene la puntuación más alta; no es una ubicación confirmada.', candidateOne: 'Candidato principal', candidateRank: 'Candidato {rank}', candidateMap: 'Ver en el mapa', candidateScore: 'Puntuación {score}', candidateVotes: '{count} valoraciones', candidateScoreHelp: 'La puntuación es relativa, no una probabilidad. Los nombres son topónimos modernos de la fuente.', candidateNone: 'No hay lugares propuestos.', sourceVersion: 'Versión de los datos', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · Se adaptaron los lugares propuestos y las referencias.', sourceRecord: 'Fuentes completas', candidateLocation: 'Ubicación candidata {rank} de {name}' },
  th: { candidateTitle: 'เปรียบเทียบตำแหน่งที่เป็นไปได้', candidateIntro: 'ตำแหน่งที่เสนอในข้อมูลต้นทาง จุดแรกมีคะแนนสูงสุด แต่ไม่ใช่ตำแหน่งที่ยืนยันแล้ว', candidateOne: 'ตำแหน่งหลัก', candidateRank: 'ตำแหน่ง {rank}', candidateMap: 'ดูบนแผนที่', candidateScore: 'คะแนนข้อมูล {score}', candidateVotes: 'บันทึกการประเมิน {count} รายการ', candidateScoreHelp: 'คะแนนเป็นค่าเปรียบเทียบ ไม่ใช่ความน่าจะเป็น ชื่อเป็นชื่อสถานที่ปัจจุบัน', candidateNone: 'ไม่มีตำแหน่งที่เสนอ', sourceVersion: 'รุ่นข้อมูลภูมิศาสตร์', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · ปรับข้อมูลตำแหน่งและข้อพระคัมภีร์', sourceRecord: 'หลักฐานต้นฉบับ', candidateLocation: 'ตำแหน่ง {rank} ของ {name}' },
  hi: { candidateTitle: 'संभावित स्थानों की तुलना', candidateIntro: 'स्रोत में प्रस्तावित स्थान। पहले स्थान का स्कोर सबसे अधिक है; यह पुष्ट स्थान नहीं है।', candidateOne: 'मुख्य विकल्प', candidateRank: 'विकल्प {rank}', candidateMap: 'मानचित्र पर देखें', candidateScore: 'स्रोत स्कोर {score}', candidateVotes: '{count} दर्ज मत', candidateScoreHelp: 'स्कोर तुलनात्मक है, संभावना प्रतिशत नहीं। नाम आधुनिक स्थानों के हैं।', candidateNone: 'स्थान विकल्प उपलब्ध नहीं हैं।', sourceVersion: 'भूगोल डेटा संस्करण', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · स्थान विकल्प और पद लिंक रूपांतरित किए गए हैं।', sourceRecord: 'पूरा स्रोत प्रमाण', candidateLocation: '{name} का स्थान विकल्प {rank}' },
  fr: { candidateTitle: 'Comparer les lieux possibles', candidateIntro: 'Lieux proposés par les données sources. Le premier a le meilleur score, sans être une localisation certaine.', candidateOne: 'Premier lieu proposé', candidateRank: 'Lieu proposé {rank}', candidateMap: 'Voir sur la carte', candidateScore: 'Score source {score}', candidateVotes: '{count} avis consignés', candidateScoreHelp: 'Le score est relatif, ce n’est pas une probabilité. Les noms sont ceux des lieux actuels.', candidateNone: 'Aucun lieu proposé disponible.', sourceVersion: 'Version des données', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · Lieux proposés et références adaptés.', sourceRecord: 'Sources complètes', candidateLocation: 'Lieu proposé {rank} pour {name}' },
  de: { candidateTitle: 'Mögliche Orte vergleichen', candidateIntro: 'Ortsvorschläge aus den Quelldaten. Der erste hat den höchsten Wert, ist aber kein gesicherter Ort.', candidateOne: 'Erster Vorschlag', candidateRank: 'Vorschlag {rank}', candidateMap: 'Auf Karte zeigen', candidateScore: 'Quellenwert {score}', candidateVotes: '{count} erfasste Bewertungen', candidateScoreHelp: 'Der Wert ist relativ und keine Wahrscheinlichkeit. Die Namen bezeichnen heutige Orte.', candidateNone: 'Keine Ortsvorschläge vorhanden.', sourceVersion: 'Geodatenversion', sourceVersionNote: 'OpenBible.info · CC BY 4.0 · Ortsvorschläge und Versbezüge wurden aufbereitet.', sourceRecord: 'Vollständige Quellen', candidateLocation: 'Ortsvorschlag {rank} für {name}' },
};

export function enrichmentText(locale, key, variables = {}) {
  const template = ENRICHMENT_MESSAGES[locale]?.[key] || ENRICHMENT_MESSAGES.en[key];
  if (!template) return null;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(variables[name] ?? ''));
}
