// A source event location is an editorial association; a verse-place match is
// a textual mention. Neither relationship alone proves a person's movement.
export function verseInReference(reference, code, chapter, verse) {
  if (reference.code !== code || chapter < reference.chapter || chapter > reference.endChapter) return false;
  if (chapter === reference.chapter && reference.startVerse !== null && verse < reference.startVerse) return false;
  if (chapter === reference.endChapter && reference.endVerse !== null && verse > reference.endVerse) return false;
  return true;
}

export function firstPassageMention(place) {
  return Math.min(...(place.references || []).map(({ chapter, verse }) => chapter * 1000 + verse));
}

export function evidencePriority(place, context, evidence) {
  const role = context?.roles.get(place.id);
  if (role) return { scene: 0, background: 2, discussed: 3 }[role];
  if (evidence?.eventPlaceIds.includes(place.id)) return 1;
  return 2;
}

export function evidenceForReference(source, atlas, reference, journeys = []) {
  if (!source?.index || !atlas?.places || !reference?.code) return null;
  const personHits = new Map();
  const placeHits = new Map();
  const eventHits = new Map();
  for (let chapter = reference.chapter; chapter <= reference.endChapter; chapter += 1) {
    const verses = source.index[`${reference.code} ${chapter}`] || {};
    for (const [verseText, row] of Object.entries(verses)) {
      const verse = Number(verseText);
      if (!verseInReference(reference, reference.code, chapter, verse)) continue;
      for (const person of row[0]) personHits.set(person, (personHits.get(person) || 0) + 1);
      const directPlaces = new Set(atlas.index[`${reference.code} ${chapter}`]?.[verse] || []);
      for (const place of row[1]) if (directPlaces.has(place)) placeHits.set(place, (placeHits.get(place) || 0) + 1);
      for (const event of row[2]) eventHits.set(event, (eventHits.get(event) || 0) + 1);
    }
  }
  const people = [...personHits].map(([index, verses]) => ({ ...source.people[index], verses }))
    .filter((person) => person.id).sort((a, b) => b.verses - a.verses || a.name.localeCompare(b.name));
  const byEventId = new Map(source.events.map((event) => [event.id, event]));
  const events = [...eventHits].map(([id, verses]) => ({ ...byEventId.get(id), verses }))
    .filter((event) => event.id).sort((a, b) => b.verses - a.verses || a.id - b.id);
  const confirmedPlaces = [...placeHits]
    .map(([index, verses]) => ({ ...atlas.places[index], verses }))
    .filter((place) => place.id).sort((a, b) => b.verses - a.verses || a.name.localeCompare(b.name));
  const eventPlaceIds = [...new Set(events.flatMap((event) => event.locations || []))]
    .filter((index) => placeHits.has(index))
    .map((index) => atlas.places[index]?.id).filter(Boolean);
  const scenes = journeys.flatMap((journey) => journey.steps.map((step, index) => ({ journey, step, index })))
    .filter(({ journey, step }) => verseInReference(reference, step.code || journey.code, step.chapter, step.verse));
  return { people, events, confirmedPlaces, eventPlaceIds, scenes };
}

export const EVIDENCE_MESSAGES = {
  ko: { eyebrow: '본문 근거 연결', title: '지명 · 사건 · 인물을 같은 본문에서 확인하세요', direct: '직접 나온 지명', confirmed: '두 자료가 같은 절에 연결', events: '사건 분류', people: '인물 언급', journeys: '검수된 여정 장면', placeEvents: '본문 지명과 사건 자료', personJourneys: '인물과 검수된 여정', eventLocation: '사건 자료 위치', both: '두 자료에 같은 절', mention: '본문 지명', noPlaces: '이 본문에는 지도 지명이 없습니다.', eventCategory: 'Theographic 사건 분류', linkedVerses: '절 연결', personVerses: '절에서 언급', noPeople: '연결된 인물 기록이 없습니다.', unavailable: '사건·인물 보조 자료를 불러오지 못했습니다. 아래 지명은 OpenBible 자료로 계속 확인할 수 있습니다.', caveat: '사건 위치는 Theographic의 편집 자료입니다. 인물·민족이나 동명 지명으로 해석이 갈리는 항목은 인물 미리보기에서 제외했습니다. 인물과 지명이 같은 절에 있어도 방문·이동을 증명하지 않습니다. 지도 좌표는 위치 후보입니다.', reveal: '다른 검수 여정 보기 ↗' },
  en: { eyebrow: 'Passage evidence', title: 'Places, events and people in this passage', direct: 'Place mentions', confirmed: 'Matched across sources', events: 'Linked events', people: 'People named', journeys: 'Reviewed journey scenes', placeEvents: 'Place and event data', personJourneys: 'People and reviewed journeys', eventLocation: 'Event location', both: 'Both sources', mention: 'Verse mention', noPlaces: 'No mapped place in this passage.', eventCategory: 'Theographic event category', linkedVerses: 'linked verses', personVerses: 'verse mentions', noPeople: 'No linked person records.', unavailable: 'The people and event index is unavailable. Place mentions below remain available from OpenBible.', caveat: 'Event locations are editorial source data. Ambiguous person, people-group and same-name place records are omitted from the preview. A person and place in one verse do not prove a visit. Map points may be uncertain.', reveal: 'Explore other reviewed journeys ↗' },
  ja: { eyebrow: '本文の根拠', title: '地名・出来事・人物を本文と結びます', direct: '本文の地名', confirmed: '二つの資料で一致', events: '出来事の分類', people: '人物への言及', journeys: '検証済みの旅の場面', placeEvents: '地名と出来事の資料', personJourneys: '人物と検証済みの旅', eventLocation: '出来事の資料上の場所', both: '二つの資料で同じ節', mention: '本文の地名', noPlaces: 'この本文に地図の地点はありません。', eventCategory: 'Theographic の出来事分類', linkedVerses: '節に関連', personVerses: '節で言及', noPeople: '人物の記録はありません。', unavailable: '人物・出来事の補助資料を読み込めません。地名は OpenBible から確認できます。', caveat: '出来事の場所は資料上の編集判断です。人物・民族名や同名地名で曖昧な項目は人物一覧から省いています。同じ節に人物と地名があっても訪問の証拠にはなりません。地図の位置は候補です。', reveal: 'ほかの検証済みの旅を見る ↗' },
  'zh-CN': { eyebrow: '经文依据', title: '将地名、事件和人物与经文关联', direct: '经文中的地名', confirmed: '两份资料同节关联', events: '事件分类', people: '人物提及', journeys: '已核查旅程场景', placeEvents: '地名与事件资料', personJourneys: '人物与已核查旅程', eventLocation: '事件资料中的地点', both: '两份资料同节', mention: '经文地名', noPlaces: '此处经文没有地图地点。', eventCategory: 'Theographic 事件分类', linkedVerses: '节关联', personVerses: '节提及', noPeople: '没有关联的人物记录。', unavailable: '无法加载人物与事件辅助资料，仍可查看 OpenBible 地名。', caveat: '事件地点是资料的编辑判断。有歧义的人名、民族名与同名地名不在人物预览中。同节出现人物和地名不能证明到访；地图坐标只是候选位置。', reveal: '查看其他已核查旅程 ↗' },
  es: { eyebrow: 'Evidencia del pasaje', title: 'Lugares, sucesos y personas del pasaje', direct: 'Lugares mencionados', confirmed: 'Coinciden dos fuentes', events: 'Sucesos vinculados', people: 'Personas mencionadas', journeys: 'Escenas de viajes revisados', placeEvents: 'Lugares y datos de sucesos', personJourneys: 'Personas y viajes revisados', eventLocation: 'Lugar según la fuente', both: 'Ambas fuentes', mention: 'Mención en el versículo', noPlaces: 'Este pasaje no tiene lugar cartografiado.', eventCategory: 'Suceso clasificado por Theographic', linkedVerses: 'versículos vinculados', personVerses: 'versículos con mención', noPeople: 'No hay personas vinculadas.', unavailable: 'No se cargó el índice de personas y sucesos. Los lugares de OpenBible siguen disponibles.', caveat: 'Los lugares de sucesos son asociaciones editoriales. Se omiten de la vista previa los nombres ambiguos de personas, pueblos y lugares. Coincidir en un versículo no prueba una visita; los puntos del mapa son propuestos.', reveal: 'Ver otros viajes revisados ↗' },
  th: { eyebrow: 'หลักฐานของตอนพระคัมภีร์', title: 'เชื่อมสถานที่ เหตุการณ์ และบุคคลกับข้อพระคัมภีร์', direct: 'ชื่อสถานที่ในข้อ', confirmed: 'ตรงกันในสองแหล่ง', events: 'เหตุการณ์ที่เชื่อมโยง', people: 'บุคคลที่กล่าวถึง', journeys: 'ฉากการเดินทางที่ตรวจสอบแล้ว', placeEvents: 'ข้อมูลสถานที่และเหตุการณ์', personJourneys: 'บุคคลและการเดินทางที่ตรวจสอบแล้ว', eventLocation: 'สถานที่ตามข้อมูลเหตุการณ์', both: 'สองแหล่งตรงกัน', mention: 'สถานที่ในข้อ', noPlaces: 'ตอนนี้ไม่มีสถานที่บนแผนที่', eventCategory: 'หมวดเหตุการณ์ของ Theographic', linkedVerses: 'ข้อที่เชื่อมโยง', personVerses: 'ข้อที่กล่าวถึง', noPeople: 'ไม่มีข้อมูลบุคคลที่เชื่อมโยง', unavailable: 'โหลดข้อมูลบุคคลและเหตุการณ์ไม่ได้ แต่ยังดูชื่อสถานที่จาก OpenBible ได้', caveat: 'ตำแหน่งเหตุการณ์เป็นการจัดหมวดหมู่ของแหล่งข้อมูล รายชื่อที่กำกวมถูกตัดจากตัวอย่าง บุคคลและสถานที่ในข้อเดียวกันไม่ยืนยันการเดินทาง และจุดบนแผนที่เป็นเพียงตำแหน่งที่เสนอ', reveal: 'ดูการเดินทางอื่นที่ตรวจสอบแล้ว ↗' },
  hi: { eyebrow: 'अंश के स्रोत', title: 'अंश से स्थान, घटनाएँ और व्यक्ति जोड़ें', direct: 'उल्लिखित स्थान', confirmed: 'दो स्रोतों में समान', events: 'संबद्ध घटनाएँ', people: 'उल्लिखित व्यक्ति', journeys: 'जाँचे गए यात्रा दृश्य', placeEvents: 'स्थान और घटना के स्रोत', personJourneys: 'व्यक्ति और जाँची गई यात्राएँ', eventLocation: 'स्रोत में घटना का स्थान', both: 'दोनों स्रोत', mention: 'पद में उल्लेख', noPlaces: 'इस अंश का कोई मानचित्र स्थान नहीं है।', eventCategory: 'Theographic घटना वर्ग', linkedVerses: 'संबद्ध पद', personVerses: 'पदों में उल्लेख', noPeople: 'कोई संबद्ध व्यक्ति रिकॉर्ड नहीं।', unavailable: 'व्यक्ति और घटना सूची लोड नहीं हुई। OpenBible के स्थान उपलब्ध हैं।', caveat: 'घटना के स्थान स्रोत के संपादकीय संबंध हैं। अस्पष्ट व्यक्ति, समुदाय और समान नाम वाले स्थान पूर्वावलोकन से हटाए गए हैं। एक पद में व्यक्ति और स्थान साथ होने से यात्रा सिद्ध नहीं होती। मानचित्र के बिंदु संभावित हैं।', reveal: 'अन्य जाँची गई यात्राएँ देखें ↗' },
  fr: { eyebrow: 'Sources du passage', title: 'Lieux, événements et personnes du passage', direct: 'Lieux mentionnés', confirmed: 'Confirmés par deux sources', events: 'Événements liés', people: 'Personnes citées', journeys: 'Scènes de voyages vérifiées', placeEvents: 'Lieux et données d’événements', personJourneys: 'Personnes et voyages vérifiés', eventLocation: 'Lieu selon la source', both: 'Deux sources', mention: 'Mention dans le verset', noPlaces: 'Aucun lieu cartographié dans ce passage.', eventCategory: 'Catégorie Theographic', linkedVerses: 'versets liés', personVerses: 'versets cités', noPeople: 'Aucune personne liée.', unavailable: 'L’index des personnes et événements est indisponible. Les lieux OpenBible restent visibles.', caveat: 'Les lieux des événements sont des associations éditoriales. Les noms ambigus de personnes, peuples et lieux sont exclus de l’aperçu. Une mention dans le même verset ne prouve pas une visite. Les points sont des localisations proposées.', reveal: 'Voir d’autres voyages vérifiés ↗' },
  de: { eyebrow: 'Belege zum Abschnitt', title: 'Orte, Ereignisse und Personen im Abschnitt', direct: 'Erwähnte Orte', confirmed: 'In zwei Quellen belegt', events: 'Verknüpfte Ereignisse', people: 'Erwähnte Personen', journeys: 'Geprüfte Reiseszenen', placeEvents: 'Orte und Ereignisdaten', personJourneys: 'Personen und geprüfte Reisen', eventLocation: 'Ereignisort laut Quelle', both: 'Beide Quellen', mention: 'Im Vers erwähnt', noPlaces: 'Kein kartierter Ort in diesem Abschnitt.', eventCategory: 'Theographic Ereigniskategorie', linkedVerses: 'verknüpfte Verse', personVerses: 'Verse mit Erwähnung', noPeople: 'Keine verknüpften Personen.', unavailable: 'Personen- und Ereignisindex ist nicht verfügbar. OpenBible-Orte bleiben sichtbar.', caveat: 'Ereignisorte sind redaktionelle Zuordnungen. Mehrdeutige Personen-, Volks- und Ortsnamen fehlen in der Vorschau. Ein gemeinsamer Vers beweist keinen Besuch. Kartenpunkte sind Ortsvorschläge.', reveal: 'Weitere geprüfte Reisen ansehen ↗' },
};

export function evidenceMessage(locale = 'ko') { return EVIDENCE_MESSAGES[locale] || EVIDENCE_MESSAGES.en; }
