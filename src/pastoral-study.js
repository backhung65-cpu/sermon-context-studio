// Build a passage observation sheet from verse-level mentions only. Neither a
// shared verse nor a map coordinate establishes an event location or journey.
export function buildPastoralStudy(reference, places, context, evidence) {
  const rows = new Map();
  const reviewedScenes = new Set((evidence?.scenes || [])
    .map(({ journey, step }) => `${step.code || journey.code}:${step.chapter}:${step.verse}:${step.placeId}`));
  for (const place of places) {
    for (const { chapter, verse } of place.references || []) {
      const key = `${chapter}:${verse}`;
      if (!rows.has(key)) rows.set(key, { chapter, verse, places: [] });
      rows.get(key).places.push({
        id: place.id,
        name: place.displayName || place.name,
        role: context?.roles?.get(place.id) || null,
        reviewed: reviewedScenes.has(`${reference.code}:${chapter}:${verse}:${place.id}`),
        candidateCount: place.candidateCount || 0,
      });
    }
  }
  const verses = [...rows.values()].sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);
  return {
    verses,
    placeCount: places.length,
    verseCount: verses.length,
    candidatePlaceCount: places.filter((place) => place.candidateCount > 1).length,
    reviewedVerseCount: verses.filter((row) => row.places.some((place) => place.reviewed || place.role === 'scene')).length,
  };
}

export function observationLine(reference, row, place, labels, readingUrl = '', prompt = true) {
  const status = place.role ? labels[place.role] : place.reviewed ? labels.reviewed : labels.mention;
  const link = readingUrl ? ` [${labels.read}](${readingUrl})` : '';
  return `- ${reference} ${row.chapter}:${row.verse} · ${place.name} — ${status}.${prompt ? ` ${labels.question}` : ''}${link}`;
}

export function pastoralStudyMarkdown(referenceLabel, bookName, study, labels, readingUrl, noteText = '') {
  const rows = study.verses.flatMap((row) => row.places.map((place) =>
    observationLine(bookName, row, place, labels, readingUrl(row.chapter, row.verse), false)));
  const cautions = [labels.cautionRole,
    ...(study.candidatePlaceCount ? [labels.cautionCandidates] : []),
    ...(!study.reviewedVerseCount ? [labels.cautionReview] : []),
    labels.cautionText];
  return `# ${labels.title}\n\n${referenceLabel}\n\n[${labels.read}](${readingUrl()})\n\n## ${labels.flow}\n\n${rows.length ? rows.join('\n') : labels.noPlaces}\n\n## ${labels.cautionTitle}\n\n- ${labels.question}\n${cautions.map((item) => `- ${item}`).join('\n')}\n\n## ${labels.myNotes}\n\n${noteText.trimEnd()}\n\nOpenBible.info · CC BY 4.0 | Theographic · CC BY-SA 4.0\n`;
}

const COPY = {
  ko: {
    title: '설교 준비 · 본문 관찰 시트', intro: '지리 자료를 보기 전에 본문을 읽고, 절마다 실제로 나온 지명과 해석할 질문을 확인하세요.',
    read: '본문 먼저 읽기', flow: '절별 지명 관찰', mention: '지명 언급', reviewed: '검토된 여정 장면',
    scene: '검토된 사건 현장', background: '배경 지명', discussed: '대화 속 언급', note: '이 절을 메모에 추가',
    question: '본문에서 이 지명의 역할은 무엇인가?', noPlaces: '이 본문에는 연결된 지명이 없습니다. 성경 본문 자체를 읽으며 설교를 준비하세요.',
    cautionTitle: '설교 전 확인할 것', cautionRole: '지명 언급은 방문이나 사건 현장의 증거가 아닙니다. 본문 문맥에서 역할을 확인하세요.',
    cautionCandidates: '위치 후보가 여러 곳인 지명은 현재 지도 핀을 확정 위치로 설명하지 마세요.',
    cautionReview: '이 본문에는 검토된 현장 장면이 없습니다. 지도는 지명 색인으로만 사용하세요.',
    cautionText: '설교의 중심 주장과 적용은 지도에서 만들지 말고 성경 본문과 청중의 상황에서 검토하세요.',
    more: '나머지 등장 절 보기', narrow: '긴 본문입니다. 절별 목록은 처음 150개까지만 보여 줍니다. 범위를 좁혀 검색하면 이어서 확인할 수 있습니다.',
    noteAdded: '절별 관찰 문장을 메모에 추가했습니다.', starter: '관찰 질문 틀 넣기', starterAdded: '본문 관찰 틀을 메모에 넣었습니다.', download: '연구 시트 파일로 저장', myNotes: '내 메모',
    starterText: '## 본문에서 실제로 확인한 것\n\n## 지명의 역할과 불확실성\n\n## 더 확인할 해석 질문\n\n## 회중에게 연결할 내용\n',
  },
  en: {
    title: 'Sermon prep · passage observation', intro: 'Read the passage first, then check the named places in each verse and the questions they raise.',
    read: 'Read the passage first', flow: 'Places by verse', mention: 'Place mention', reviewed: 'Reviewed journey scene',
    scene: 'Reviewed scene location', background: 'Background place', discussed: 'Mentioned in speech', note: 'Add verse to notes',
    question: 'What role does this place have in context?', noPlaces: 'No mapped place is linked to this passage. Start with the Bible text itself.',
    cautionTitle: 'Check before preaching', cautionRole: 'A place mention does not prove a visit or scene location. Check its role in context.',
    cautionCandidates: 'Some places have multiple location proposals. Do not present a map pin as certain.',
    cautionReview: 'No scene location has been reviewed for this passage. Use the map as a place index only.',
    cautionText: 'Ground the sermon claim and application in the Bible text and your congregation, not the map.',
    more: 'Show remaining verses', narrow: 'Long passage: the first 150 place verses appear here. Narrow your search to continue.',
    noteAdded: 'Verse observation added to notes.', starter: 'Insert observation outline', starterAdded: 'Observation outline added to notes.', download: 'Download study sheet', myNotes: 'My notes',
    starterText: '## What the passage says\n\n## Place roles and uncertainty\n\n## Questions to verify\n\n## Connection to the congregation\n',
  },
  ja: {
    title: '説教準備 · 本文観察シート', intro: 'まず本文を読み、各節の地名と確認すべき問いを見てください。',
    read: 'まず本文を読む', flow: '節ごとの地名', mention: '地名への言及', reviewed: '確認済みの旅の場面',
    scene: '確認済みの場面', background: '背景の地名', discussed: '発言中の言及', note: 'この節をメモへ',
    question: '本文の中でこの地名は何を示しますか？', noPlaces: 'この本文に結び付く地名はありません。聖書本文から始めてください。',
    cautionTitle: '説教前に確認', cautionRole: '地名への言及は訪問や出来事の場所を証明しません。文脈を確認してください。',
    cautionCandidates: '複数の候補地がある場合、地図の点を確定地として説明しないでください。',
    cautionReview: 'この本文に確認済みの場面はありません。地図は地名索引として利用してください。',
    cautionText: '説教の主張と適用は地図ではなく聖書本文と会衆の状況に基づいて考えてください。',
    more: '残りの節を見る', narrow: '長い本文の最初の150節を表示しています。範囲を狭めてください。',
    noteAdded: '節の観察をメモに追加しました。', starter: '観察の見出しを挿入', starterAdded: '観察の見出しを追加しました。', download: '研究シートを保存', myNotes: '自分のメモ',
    starterText: '## 本文に書かれていること\n\n## 地名の役割と不確実性\n\n確認すべき問い\n\n会衆とのつながり\n',
  },
  'zh-CN': {
    title: '讲道准备 · 经文观察表', intro: '先读经文，再逐节查看地名和需要核查的问题。',
    read: '先读经文', flow: '逐节地名', mention: '提及地名', reviewed: '已核查的旅程场景',
    scene: '已核查的场景', background: '背景地名', discussed: '话语中提及', note: '加入笔记',
    question: '此地名在经文中起什么作用？', noPlaces: '本段没有关联的地图地名。请从经文本身开始。',
    cautionTitle: '讲道前核查', cautionRole: '提及地名不能证明人物到访或事件发生于此。请查考上下文。',
    cautionCandidates: '有多个位置候选时，不要把地图标记说成确定地点。',
    cautionReview: '本段尚无已核查的场景位置。地图只能作为地名索引。',
    cautionText: '讲道主张与应用须依据经文和会众处境，而非地图。',
    more: '显示其余经节', narrow: '这里只显示前150条。请缩小经文范围继续查看。',
    noteAdded: '经节观察已加入笔记。', starter: '插入观察提纲', starterAdded: '已插入观察提纲。', download: '下载研究表', myNotes: '我的笔记',
    starterText: '## 经文明说的内容\n\n## 地名的作用与不确定性\n\n## 待核查的问题\n\n## 与会众的关联\n',
  },
  es: {
    title: 'Preparación del sermón · observación', intro: 'Lee primero el pasaje; luego revisa los lugares de cada versículo y las preguntas que surgen.',
    read: 'Leer primero el pasaje', flow: 'Lugares por versículo', mention: 'Mención del lugar', reviewed: 'Escena de viaje revisada',
    scene: 'Lugar de escena revisado', background: 'Lugar de contexto', discussed: 'Mencionado en el discurso', note: 'Añadir a notas',
    question: '¿Qué función cumple este lugar en el contexto?', noPlaces: 'No hay lugares vinculados. Comienza por el texto bíblico.',
    cautionTitle: 'Comprobar antes de predicar', cautionRole: 'Una mención no prueba una visita ni el lugar de una escena. Comprueba el contexto.',
    cautionCandidates: 'Si hay varias ubicaciones posibles, no presentes el marcador como lugar seguro.',
    cautionReview: 'No hay escenas revisadas aquí. Usa el mapa solo como índice de lugares.',
    cautionText: 'Basa el mensaje y la aplicación en el texto y la congregación, no en el mapa.',
    more: 'Ver los demás versículos', narrow: 'Se muestran los primeros 150 versículos. Reduce el rango para continuar.',
    noteAdded: 'Observación añadida a las notas.', starter: 'Insertar esquema de observación', starterAdded: 'Esquema añadido.', download: 'Descargar hoja de estudio', myNotes: 'Mis notas',
    starterText: '## Lo que dice el texto\n\n## Función e incertidumbre del lugar\n\n## Preguntas por verificar\n\n## Aplicación a la congregación\n',
  },
  th: {
    title: 'เตรียมเทศนา · บันทึกการสังเกต', intro: 'อ่านพระคัมภีร์ก่อน แล้วตรวจชื่อสถานที่ในแต่ละข้อและคำถามที่ควรศึกษา',
    read: 'อ่านพระคัมภีร์ก่อน', flow: 'สถานที่ตามข้อ', mention: 'กล่าวถึงสถานที่', reviewed: 'ฉากการเดินทางที่ตรวจแล้ว',
    scene: 'สถานที่ของฉากที่ตรวจแล้ว', background: 'สถานที่พื้นหลัง', discussed: 'กล่าวถึงในคำพูด', note: 'เพิ่มในบันทึก',
    question: 'สถานที่นี้มีบทบาทอย่างไรในบริบท?', noPlaces: 'ไม่มีสถานที่เชื่อมกับตอนนี้ เริ่มจากข้อความพระคัมภีร์',
    cautionTitle: 'ตรวจสอบก่อนเทศนา', cautionRole: 'การกล่าวถึงสถานที่ไม่พิสูจน์การเดินทางหรือที่เกิดเหตุ ต้องอ่านบริบท',
    cautionCandidates: 'หากมีหลายตำแหน่งที่เสนอ อย่าอธิบายหมุดว่าเป็นตำแหน่งที่ยืนยันแล้ว',
    cautionReview: 'ตอนนี้ยังไม่มีฉากที่ตรวจแล้ว ใช้แผนที่เป็นดัชนีสถานที่เท่านั้น',
    cautionText: 'ให้ข้อพระคัมภีร์และบริบทของผู้ฟังเป็นฐานของคำเทศนา ไม่ใช่แผนที่',
    more: 'ดูข้อที่เหลือ', narrow: 'แสดง 150 ข้อแรก กรุณาค้นหาช่วงที่แคบลง',
    noteAdded: 'เพิ่มการสังเกตในบันทึกแล้ว', starter: 'ใส่โครงบันทึก', starterAdded: 'เพิ่มโครงบันทึกแล้ว', download: 'ดาวน์โหลดแผ่นศึกษา', myNotes: 'บันทึกของฉัน',
    starterText: '## สิ่งที่ข้อความกล่าว\n\n## บทบาทและความไม่แน่นอนของสถานที่\n\n## คำถามที่ต้องตรวจ\n\n## ความเชื่อมโยงกับผู้ฟัง\n',
  },
  hi: {
    title: 'उपदेश तैयारी · पाठ अवलोकन', intro: 'पहले पाठ पढ़ें, फिर प्रत्येक पद में स्थान और जाँचने वाले प्रश्न देखें।',
    read: 'पहले पाठ पढ़ें', flow: 'पद के अनुसार स्थान', mention: 'स्थान का उल्लेख', reviewed: 'समीक्षित यात्रा दृश्य',
    scene: 'समीक्षित दृश्य स्थल', background: 'पृष्ठभूमि स्थान', discussed: 'बातचीत में उल्लेख', note: 'नोट में जोड़ें',
    question: 'इस स्थान की भूमिका संदर्भ में क्या है?', noPlaces: 'इस पाठ से कोई नक्शा स्थान नहीं जुड़ा। बाइबल पाठ से शुरू करें।',
    cautionTitle: 'उपदेश से पहले जाँचें', cautionRole: 'स्थान का उल्लेख यात्रा या घटना स्थल सिद्ध नहीं करता। संदर्भ जाँचें।',
    cautionCandidates: 'कई स्थान प्रस्ताव हों तो नक्शे के चिह्न को निश्चित स्थान न कहें।',
    cautionReview: 'इस पाठ का कोई दृश्य स्थल समीक्षित नहीं है। नक्शे को केवल स्थान सूची मानें।',
    cautionText: 'उपदेश का दावा और अनुप्रयोग पाठ और मंडली पर आधारित रखें, नक्शे पर नहीं।',
    more: 'बाकी पद देखें', narrow: 'पहले 150 पद दिखाए गए हैं। आगे देखने के लिए सीमा छोटी करें।',
    noteAdded: 'पद अवलोकन नोट में जोड़ा।', starter: 'अवलोकन रूपरेखा जोड़ें', starterAdded: 'रूपरेखा जोड़ी गई।', download: 'अध्ययन पत्र डाउनलोड करें', myNotes: 'मेरे नोट',
    starterText: '## पाठ में क्या लिखा है\n\n## स्थान की भूमिका और अनिश्चितता\n\n## जाँचने के प्रश्न\n\n## मंडली से संबंध\n',
  },
  fr: {
    title: 'Préparation du sermon · observation', intro: 'Lisez d’abord le passage, puis vérifiez les lieux nommés dans chaque verset et les questions à étudier.',
    read: 'Lire d’abord le passage', flow: 'Lieux par verset', mention: 'Lieu mentionné', reviewed: 'Scène de voyage vérifiée',
    scene: 'Lieu de scène vérifié', background: 'Lieu de contexte', discussed: 'Mentionné dans le discours', note: 'Ajouter aux notes',
    question: 'Quel rôle ce lieu joue-t-il dans le contexte ?', noPlaces: 'Aucun lieu cartographié n’est lié à ce passage. Commencez par le texte biblique.',
    cautionTitle: 'À vérifier avant de prêcher', cautionRole: 'La mention d’un lieu ne prouve ni une visite ni le lieu d’une scène. Vérifiez le contexte.',
    cautionCandidates: 'Si plusieurs positions sont proposées, ne présentez pas le repère comme certain.',
    cautionReview: 'Aucune scène vérifiée pour ce passage. Utilisez la carte comme index des lieux.',
    cautionText: 'Fondez le message et l’application sur le texte et l’assemblée, non sur la carte.',
    more: 'Voir les autres versets', narrow: 'Seuls les 150 premiers versets sont affichés. Réduisez la plage pour continuer.',
    noteAdded: 'Observation ajoutée aux notes.', starter: 'Insérer un plan d’observation', starterAdded: 'Plan ajouté aux notes.', download: 'Télécharger la fiche', myNotes: 'Mes notes',
    starterText: '## Ce que dit le texte\n\n## Rôle et incertitude du lieu\n\n## Questions à vérifier\n\n## Lien avec l’assemblée\n',
  },
  de: {
    title: 'Predigtvorbereitung · Textbeobachtung', intro: 'Lesen Sie zuerst den Abschnitt und prüfen Sie dann Ortsnamen und offene Fragen Vers für Vers.',
    read: 'Zuerst den Text lesen', flow: 'Orte nach Vers', mention: 'Ortsnennung', reviewed: 'Geprüfte Reiseszene',
    scene: 'Geprüfter Schauplatz', background: 'Ort im Hintergrund', discussed: 'In der Rede erwähnt', note: 'Zu Notizen hinzufügen',
    question: 'Welche Rolle hat dieser Ort im Kontext?', noPlaces: 'Diesem Abschnitt ist kein Kartenort zugeordnet. Beginnen Sie beim Bibeltext.',
    cautionTitle: 'Vor der Predigt prüfen', cautionRole: 'Eine Ortsnennung belegt weder einen Besuch noch den Schauplatz. Prüfen Sie den Kontext.',
    cautionCandidates: 'Bei mehreren Ortsvorschlägen darf die Kartenmarkierung nicht als sicher gelten.',
    cautionReview: 'Für diesen Abschnitt ist kein Schauplatz geprüft. Nutzen Sie die Karte nur als Ortsindex.',
    cautionText: 'Begründen Sie Aussage und Anwendung mit Bibeltext und Gemeinde, nicht mit der Karte.',
    more: 'Weitere Verse anzeigen', narrow: 'Die ersten 150 Verse werden angezeigt. Grenzen Sie die Suche weiter ein.',
    noteAdded: 'Versbeobachtung zu Notizen hinzugefügt.', starter: 'Beobachtungsgerüst einfügen', starterAdded: 'Gerüst hinzugefügt.', download: 'Studienblatt herunterladen', myNotes: 'Meine Notizen',
    starterText: '## Was der Text sagt\n\n## Ortsrolle und Unsicherheit\n\n## Zu prüfende Fragen\n\n## Bezug zur Gemeinde\n',
  },
};

export function pastoralStudyCopy(locale = 'ko') { return COPY[locale] || COPY.en; }
