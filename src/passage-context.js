// A place-name occurrence is not evidence that the narrative happens there.
// Scene roles below are added only where the passage itself has been checked.
const COPY = {
  ko: {
    title: '모세가 서 있던 곳은 호렙산입니다',
    summary: '출애굽기 3:1은 모세가 양 떼를 이끌고 호렙에 이르렀다고 밝힙니다. 애굽은 뒤이어 하나님이 말씀하신 백성의 상황과 모세의 사명에 등장합니다.',
    shortSummary: '출애굽기 3:1은 모세가 양 떼를 이끌고 호렙에 이르렀다고 밝힙니다.',
    note: '이 장에는 “시내산”이라는 이름이 직접 나오지 않습니다. 호렙산의 지도 좌표도 여러 위치 후보 중 하나이며 확정된 장소가 아닙니다.',
    genericNote: '지명이 본문에 나온다고 해서 그곳이 사건의 현장이라는 뜻은 아닙니다.',
    journeyLink: '모세 여정에서 이 장면 보기',
    scene: '사건이 벌어진 곳', background: '인물의 배경 지명', discussed: '대화·사명 속 지명',
    sceneDetail: '모세가 양 떼를 이끌고 도착한 산 · 3:1',
    backgroundDetail: '이드로를 미디안 제사장으로 소개 · 3:1',
    discussedDetail: '이스라엘 백성의 고통과 모세가 갈 곳을 언급 · 3:7–22',
  },
  en: {
    title: 'Moses is at Horeb in this scene',
    summary: 'Exodus 3:1 places Moses at Horeb with the flock. Egypt enters later as the subject of God’s speech and Moses’s mission.',
    shortSummary: 'Exodus 3:1 places Moses at Horeb with the flock.',
    note: '“Sinai” is not named in this chapter. The map point for Horeb is one proposed location, not a confirmed site.',
    genericNote: 'A place being named in a passage does not establish that the event happened there.',
    journeyLink: 'See this scene in Moses’s journey',
    scene: 'Scene location', background: 'Background place', discussed: 'Mentioned in speech',
    sceneDetail: 'Moses arrives with the flock · 3:1',
    backgroundDetail: 'Jethro is identified as a priest of Midian · 3:1',
    discussedDetail: 'Israel’s suffering and Moses’s mission · 3:7–22',
  },
  ja: { title: 'この場面でモーセがいるのはホレブです', summary: '出エジプト記3:1はモーセが群れを連れてホレブに来たと記します。エジプトは後の神の言葉と使命に登場します。', shortSummary: '出エジプト記3:1はモーセがホレブに来たと記します。', note: 'この章に「シナイ」という名は直接出ません。ホレブの地図上の点は推定候補です。', genericNote: '本文に地名が出るだけでは、そこが出来事の場所とは限りません。', journeyLink: 'モーセの旅でこの場面を見る', scene: '出来事の場所', background: '背景の地名', discussed: '言葉に出る地名', sceneDetail: 'モーセが群れと到着 · 3:1', backgroundDetail: 'エトロはミディアンの祭司 · 3:1', discussedDetail: '民の苦しみと使命 · 3:7–22' },
  'zh-CN': { title: '摩西在何烈山经历此事', summary: '出埃及记3:1说摩西带羊群来到何烈山。埃及后来出现在上帝的话语和摩西的使命中。', shortSummary: '出埃及记3:1说摩西来到何烈山。', note: '本章没有直接提到“西奈山”。地图上的何烈山只是候选位置。', genericNote: '经文提到某地，不等于事件就在该地发生。', journeyLink: '在摩西的旅程中查看此场景', scene: '事件发生地', background: '背景地名', discussed: '话语中提及', sceneDetail: '摩西带羊群来到这里 · 3:1', backgroundDetail: '叶忒罗是米甸的祭司 · 3:1', discussedDetail: '百姓的苦难与摩西的使命 · 3:7–22' },
  es: { title: 'Moisés está en Horeb en esta escena', summary: 'Éxodo 3:1 sitúa a Moisés con el rebaño en Horeb. Egipto aparece después en el discurso de Dios y la misión de Moisés.', shortSummary: 'Éxodo 3:1 sitúa a Moisés en Horeb.', note: 'Este capítulo no nombra «Sinaí». El punto de Horeb en el mapa es una ubicación propuesta.', genericNote: 'Que se mencione un lugar no significa que el suceso ocurriera allí.', journeyLink: 'Ver esta escena en el viaje de Moisés', scene: 'Lugar de la escena', background: 'Lugar de contexto', discussed: 'Mencionado en el discurso', sceneDetail: 'Moisés llega con el rebaño · 3:1', backgroundDetail: 'Jetro es sacerdote de Madián · 3:1', discussedDetail: 'El sufrimiento de Israel y la misión · 3:7–22' },
  th: { title: 'โมเสสอยู่ที่โฮเรบในเหตุการณ์นี้', summary: 'อพยพ 3:1 ระบุว่าโมเสสนำฝูงแกะมาถึงโฮเรบ ส่วนอียิปต์ปรากฏในคำตรัสและพันธกิจที่จะตามมา', shortSummary: 'อพยพ 3:1 ระบุว่าโมเสสมาถึงโฮเรบ', note: 'บทนี้ไม่ได้เรียกชื่อ “ซีนาย” โดยตรง จุดโฮเรบบนแผนที่เป็นเพียงตำแหน่งที่เสนอไว้', genericNote: 'การกล่าวถึงสถานที่ในพระคัมภีร์ไม่ได้ยืนยันว่าเหตุการณ์เกิดขึ้นที่นั่น', journeyLink: 'ดูเหตุการณ์นี้ในเส้นทางของโมเสส', scene: 'สถานที่เกิดเหตุ', background: 'สถานที่พื้นหลัง', discussed: 'สถานที่ที่กล่าวถึง', sceneDetail: 'โมเสสมาถึงพร้อมฝูงแกะ · 3:1', backgroundDetail: 'เยโธรเป็นปุโรหิตแห่งมีเดียน · 3:1', discussedDetail: 'ความทุกข์ของอิสราเอลและพันธกิจ · 3:7–22' },
  hi: { title: 'इस दृश्य में मूसा होरेब पर है', summary: 'निर्गमन 3:1 के अनुसार मूसा झुंड लेकर होरेब पहुँचा। मिस्र बाद में परमेश्वर के कथन और मूसा के कार्य में आता है।', shortSummary: 'निर्गमन 3:1 में मूसा होरेब पहुँचता है।', note: 'इस अध्याय में “सीनै” नाम सीधे नहीं आता। मानचित्र का होरेब बिंदु एक प्रस्तावित स्थान है।', genericNote: 'किसी स्थान का उल्लेख होने से घटना वहीं हुई, यह सिद्ध नहीं होता।', journeyLink: 'मूसा की यात्रा में यह दृश्य देखें', scene: 'घटना का स्थान', background: 'पृष्ठभूमि का स्थान', discussed: 'बातचीत में उल्लिखित', sceneDetail: 'मूसा झुंड लेकर पहुँचा · 3:1', backgroundDetail: 'यित्रो मिद्यान का याजक है · 3:1', discussedDetail: 'इस्राएल का दुःख और मूसा का कार्य · 3:7–22' },
  fr: { title: 'Moïse se trouve à l’Horeb dans cette scène', summary: 'Exode 3:1 place Moïse avec le troupeau à l’Horeb. L’Égypte apparaît ensuite dans la parole de Dieu et la mission de Moïse.', shortSummary: 'Exode 3:1 place Moïse à l’Horeb.', note: 'Le nom « Sinaï » ne figure pas directement dans ce chapitre. Le point de l’Horeb est une localisation proposée.', genericNote: 'Un lieu mentionné dans le texte n’est pas forcément celui où se déroule la scène.', journeyLink: 'Voir cette scène dans le parcours de Moïse', scene: 'Lieu de la scène', background: 'Lieu de contexte', discussed: 'Mentionné dans le discours', sceneDetail: 'Moïse arrive avec le troupeau · 3:1', backgroundDetail: 'Jéthro est prêtre de Madian · 3:1', discussedDetail: 'Souffrance d’Israël et mission · 3:7–22' },
  de: { title: 'Mose ist in dieser Szene am Horeb', summary: 'Exodus 3,1 beschreibt, wie Mose mit der Herde zum Horeb kommt. Ägypten wird später in Gottes Rede und Moses Auftrag genannt.', shortSummary: 'Exodus 3,1 führt Mose zum Horeb.', note: '„Sinai“ wird in diesem Kapitel nicht ausdrücklich genannt. Der Kartenpunkt für Horeb ist ein vorgeschlagener Ort.', genericNote: 'Ein erwähnter Ort ist nicht automatisch der Schauplatz des Geschehens.', journeyLink: 'Diese Szene in Moses Reise ansehen', scene: 'Ort des Geschehens', background: 'Ort im Hintergrund', discussed: 'In der Rede erwähnt', sceneDetail: 'Mose kommt mit der Herde an · 3,1', backgroundDetail: 'Jitro ist Priester von Midian · 3,1', discussedDetail: 'Israels Leid und Moses Auftrag · 3,7–22' },
};

const ROLES = { 'Mount Horeb': 'scene', Midian: 'background', Egypt: 'discussed' };

export function passageContext(reference, places) {
  if (reference?.code !== 'EXO' || reference.chapter !== 3 || reference.endChapter !== 3
    || (reference.startVerse !== null && reference.startVerse > 1)
    || !places.some((place) => place.name === 'Mount Horeb')) return null;
  const present = new Map(places.map((place) => [place.name, place]));
  return {
    scenePlaceId: present.get('Mount Horeb').id,
    hasEgypt: present.has('Egypt'),
    roles: new Map([...present].filter(([name]) => ROLES[name]).map(([name, place]) => [place.id, ROLES[name]])),
  };
}

export function passageContextCopy(locale = 'ko') { return COPY[locale] || COPY.en; }

export function passageRole(context, place) { return context?.roles.get(place?.id) || null; }
