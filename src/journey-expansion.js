// Curated scenes: every place/verse pair is checked against the pinned OpenBible index.
// The short story is editorial context; the linked Bible passage remains the source.
const scene = (placeId, code, chapter, verse, action, ko, en, options = {}) => ({
  placeId, code, chapter, verse, action, story: { ko, en }, ...options,
});

export const ADDITIONAL_JOURNEYS = [
  {
    id: 'jesus-early', category: 'jesus', linePolicy: 'sequence',
    title: { ko: '예수님의 탄생과 성장', en: 'Jesus: birth and childhood', ja: 'イエスの誕生と成長', 'zh-CN': '耶稣的降生与成长', es: 'Jesús: nacimiento e infancia', th: 'พระเยซู: การประสูติและวัยเด็ก', hi: 'यीशु: जन्म और बचपन', fr: 'Jésus : naissance et enfance', de: 'Jesus: Geburt und Kindheit' },
    intro: { ko: '누가복음 2장에 기록된 가족의 이동과 어린 시절을 따라갑니다.', en: 'Follow the family’s movements in Luke 2.' },
    steps: [
      scene('af5884f', 'LUK', 2, 4, 'depart', '요셉과 마리아가 나사렛에서 베들레헴으로 향합니다.', 'Joseph and Mary travel from Nazareth toward Bethlehem.'),
      scene('a112427', 'LUK', 2, 4, 'birth', '베들레헴에 이릅니다. 예수님의 탄생은 이어지는 7절에 기록됩니다.', 'They reach Bethlehem; the birth is recorded in verse 7.', { endVerse: 7 }),
      scene('a15257a', 'LUK', 2, 22, 'arrive', '아기를 데리고 예루살렘으로 올라갑니다.', 'They bring the child to Jerusalem.'),
      scene('af5884f', 'LUK', 2, 39, 'return', '가족이 갈릴리 나사렛으로 돌아갑니다.', 'The family returns to Nazareth in Galilee.'),
      scene('a15257a', 'LUK', 2, 41, 'arrive', '가족이 유월절을 지키러 예루살렘에 올라갑니다.', 'The family goes to Jerusalem for Passover.'),
      scene('af5884f', 'LUK', 2, 51, 'return', '예수께서 부모와 함께 나사렛으로 내려가십니다.', 'Jesus returns to Nazareth with his parents.'),
    ],
  },
  {
    id: 'jesus-ministry', category: 'jesus', linePolicy: 'sequence',
    title: { ko: '예수님의 갈릴리에서 예루살렘까지', en: 'Jesus: Galilee to Jerusalem', ja: 'イエス：ガリラヤからエルサレムへ', 'zh-CN': '耶稣：从加利利到耶路撒冷', es: 'Jesús: de Galilea a Jerusalén', th: 'พระเยซู: จากกาลิลีสู่เยรูซาเล็ม', hi: 'यीशु: गलील से यरूशलेम', fr: 'Jésus : de Galilée à Jérusalem', de: 'Jesus: von Galiläa nach Jerusalem' },
    intro: { ko: '마가복음의 서술 순서에서 확인되는 주요 지점을 따라갑니다.', en: 'Follow key places in the narrative order of Mark.' },
    steps: [
      scene('af5884f', 'MRK', 1, 9, 'depart', '예수께서 나사렛에서 요단강으로 오십니다.', 'Jesus comes from Nazareth to the Jordan.'),
      scene('ae686c9', 'MRK', 1, 9, 'baptism', '예수께서 요단강에서 세례를 받으십니다.', 'Jesus is baptized in the Jordan.'),
      scene('a562fcc', 'MRK', 1, 16, 'teach', '갈릴리 바닷가에서 제자들을 부르십니다.', 'Jesus calls disciples by the Sea of Galilee.'),
      scene('af2161c', 'MRK', 1, 21, 'teach', '가버나움 회당에서 가르치십니다.', 'Jesus teaches in the synagogue at Capernaum.'),
      scene('ada6b64', 'MRK', 5, 1, 'cross', '호수 건너편 거라사인의 지방에 이르십니다.', 'Jesus reaches the region of the Gerasenes across the lake.', { broad: true }),
      scene('a9fc13a', 'MRK', 8, 22, 'arrive', '벳새다에 이르러 한 사람을 만나십니다.', 'Jesus arrives at Bethsaida and meets a man.'),
      scene('ab7bf48', 'MRK', 8, 27, 'teach', '가이사랴 빌립보의 여러 마을로 가십니다.', 'Jesus goes toward the villages of Caesarea Philippi.'),
      scene('aaf03fa', 'MRK', 10, 46, 'arrive', '여리고에 이르러 길가의 바디매오를 만나십니다.', 'Jesus reaches Jericho and meets Bartimaeus.'),
      scene('a4f35bc', 'MRK', 11, 1, 'arrive', '예루살렘 가까운 베다니에 이르십니다.', 'Jesus reaches Bethany near Jerusalem.'),
      scene('a15257a', 'MRK', 11, 11, 'end', '예루살렘에 들어가 성전을 둘러보십니다.', 'Jesus enters Jerusalem and looks around the temple.'),
    ],
  },
  {
    id: 'paul-2', category: 'paul', linePolicy: 'sequence',
    title: { ko: '바울의 2차 선교 여행', en: 'Paul’s second mission journey', ja: 'パウロの第二次宣教旅行', 'zh-CN': '保罗第二次宣教旅程', es: 'Segundo viaje misionero de Pablo', th: 'การเดินทางประกาศครั้งที่สองของเปาโล', hi: 'पौलुस की दूसरी मिशन यात्रा', fr: 'Deuxième voyage missionnaire de Paul', de: 'Zweite Missionsreise des Paulus' },
    intro: { ko: '사도행전 15–18장의 소아시아와 마게도냐·아가야 여정을 따라갑니다.', en: 'Follow Acts 15–18 through Asia Minor, Macedonia, and Achaia.' },
    steps: [
      scene('ae41ab4', 'ACT', 15, 35, 'depart', '바울과 바나바가 안디옥에 머무는 장면에서 두 번째 여정의 배경을 봅니다.', 'Paul and Barnabas remain in Antioch before the next journey.'),
      scene('ad63819', 'ACT', 15, 41, 'cross', '바울이 수리아와 길리기아 지역을 지나갑니다.', 'Paul passes through the region of Cilicia.', { broad: true }),
      scene('af0719d', 'ACT', 16, 1, 'arrive', '바울이 루스드라에 이릅니다.', 'Paul reaches Lystra.'),
      scene('a91c509', 'ACT', 16, 8, 'arrive', '무시아를 지나 드로아로 내려갑니다.', 'The group travels down to Troas.'),
      scene('a49e1d0', 'ACT', 16, 12, 'teach', '마게도냐의 빌립보에 머뭅니다.', 'The group stays in Philippi in Macedonia.'),
      scene('afa9d8e', 'ACT', 17, 1, 'teach', '데살로니가에 이르러 회당에 들어갑니다.', 'Paul reaches Thessalonica and enters the synagogue.'),
      scene('a62fe31', 'ACT', 17, 10, 'arrive', '밤에 베뢰아로 보냄을 받습니다.', 'Paul is sent to Berea by night.'),
      scene('a1fe6e7', 'ACT', 17, 15, 'arrive', '인도한 사람들이 바울을 아덴까지 데려갑니다.', 'Paul is brought to Athens.'),
      scene('a6f437a', 'ACT', 18, 1, 'arrive', '바울이 아덴을 떠나 고린도에 이릅니다.', 'Paul leaves Athens and arrives at Corinth.'),
      scene('a5feb15', 'ACT', 18, 19, 'arrive', '에베소에 이르러 회당에 들어갑니다.', 'Paul reaches Ephesus and enters the synagogue.'),
      scene('a58735e', 'ACT', 18, 22, 'arrive', '가이사랴에 상륙합니다.', 'Paul lands at Caesarea.'),
      scene('ae41ab4', 'ACT', 18, 22, 'return', '안디옥으로 내려와 여정을 마칩니다.', 'Paul returns to Antioch.'),
    ],
  },
  {
    id: 'paul-3', category: 'paul', linePolicy: 'sequence',
    title: { ko: '바울의 3차 선교 여행', en: 'Paul’s third mission journey', ja: 'パウロの第三次宣教旅行', 'zh-CN': '保罗第三次宣教旅程', es: 'Tercer viaje misionero de Pablo', th: 'การเดินทางประกาศครั้งที่สามของเปาโล', hi: 'पौलुस की तीसरी मिशन यात्रा', fr: 'Troisième voyage missionnaire de Paul', de: 'Dritte Missionsreise des Paulus' },
    intro: { ko: '사도행전 18–21장의 주요 장면을 예루살렘 도착까지 따라갑니다.', en: 'Follow key scenes in Acts 18–21 through the arrival in Jerusalem.' },
    steps: [
      scene('ae41ab4', 'ACT', 18, 22, 'depart', '안디옥으로 돌아온 뒤 다시 길을 떠납니다. 출발은 이어지는 23절에 나옵니다.', 'After returning to Antioch, Paul sets out again in verse 23.', { endVerse: 23 }),
      scene('a0f440a', 'ACT', 18, 23, 'cross', '갈라디아 지역을 차례로 다닙니다.', 'Paul travels through the region of Galatia.', { broad: true }),
      scene('a5feb15', 'ACT', 19, 1, 'teach', '에베소에 도착합니다.', 'Paul arrives at Ephesus.'),
      scene('a69e1b8', 'ACT', 20, 1, 'cross', '바울이 마게도냐로 떠납니다.', 'Paul departs for Macedonia.', { broad: true }),
      scene('a4492a0', 'ACT', 20, 2, 'cross', '그리스 지역에 이릅니다.', 'Paul reaches Greece.', { broad: true }),
      scene('a49e1d0', 'ACT', 20, 6, 'depart', '무교절 후 빌립보에서 배를 탑니다.', 'The group sails from Philippi after Unleavened Bread.'),
      scene('a91c509', 'ACT', 20, 6, 'arrive', '드로아에서 일행을 만납니다.', 'The group meets at Troas.'),
      scene('a0a2ca7', 'ACT', 20, 13, 'arrive', '바울이 앗소까지 걸어갑니다.', 'Paul walks to Assos.'),
      scene('a55027d', 'ACT', 20, 15, 'teach', '밀레도에 이르러 에베소 장로들을 부릅니다.', 'At Miletus Paul summons the elders from Ephesus.'),
      scene('a160272', 'ACT', 21, 3, 'arrive', '두로에 상륙합니다.', 'The group lands at Tyre.'),
      scene('a58735e', 'ACT', 21, 8, 'arrive', '가이사랴에 이르러 빌립의 집에 머뭅니다.', 'The group reaches Caesarea and stays with Philip.'),
      scene('a15257a', 'ACT', 21, 17, 'end', '일행이 예루살렘에 도착합니다.', 'The group arrives in Jerusalem.'),
    ],
  },
  {
    id: 'moses', category: 'exodus', linePolicy: 'none',
    title: { ko: '모세와 출애굽의 주요 장면', en: 'Moses and the Exodus: key scenes', ja: 'モーセと出エジプトの主要場面', 'zh-CN': '摩西与出埃及的重要场景', es: 'Moisés y el éxodo: escenas clave', th: 'โมเสสและการอพยพ: เหตุการณ์สำคัญ', hi: 'मूसा और निर्गमन: प्रमुख दृश्य', fr: 'Moïse et l’Exode : scènes clés', de: 'Mose und der Exodus: wichtige Stationen' },
    intro: { ko: '출애굽기·민수기·신명기의 지명을 본문 순서로 봅니다. 출애굽 노선을 확정하지 않습니다.', en: 'Read places from Exodus, Numbers, and Deuteronomy in biblical order; no single route is asserted.' },
    steps: [
      scene('acc6d8e', 'EXO', 2, 15, 'arrive', '모세가 애굽을 떠나 미디안 땅에 머뭅니다.', 'Moses flees Egypt and stays in Midian.', { broad: true }),
      scene('af301ca', 'EXO', 4, 20, 'return', '모세가 가족을 데리고 애굽으로 돌아갑니다.', 'Moses returns to Egypt with his family.', { broad: true }),
      scene('a079b21', 'EXO', 12, 37, 'depart', '이스라엘 자손이 라암셋에서 출발합니다.', 'Israel sets out from Rameses.'),
      scene('aa28709', 'EXO', 12, 37, 'arrive', '일행이 숙곳으로 향합니다.', 'The people travel toward Succoth.'),
      scene('a27d0e0', 'EXO', 13, 20, 'arrive', '숙곳을 떠나 광야 끝 에담에 장막을 칩니다.', 'They camp at Etham at the edge of the wilderness.'),
      scene('ad3970d', 'EXO', 15, 23, 'arrive', '마라에 이르지만 물이 쓰다고 기록됩니다.', 'At Marah the water is described as bitter.'),
      scene('a2410c1', 'EXO', 15, 27, 'arrive', '일행이 엘림에 이르러 진을 칩니다.', 'The people reach Elim and camp there.'),
      scene('ae50cf1', 'EXO', 19, 1, 'wilderness', '이스라엘 자손이 시내 광야에 이릅니다.', 'Israel comes into the wilderness of Sinai.', { broad: true }),
      scene('ac2cef0', 'NUM', 20, 1, 'wilderness', '회중이 가데스에 머무는 장면입니다.', 'The congregation stays at Kadesh.', { broad: true }),
      scene('ad8027f', 'NUM', 20, 22, 'arrive', '가데스를 떠나 호르 산에 이릅니다.', 'The congregation travels from Kadesh to Mount Hor.'),
      scene('aefaa2d', 'DEU', 34, 1, 'end', '모세가 모압 평지에서 느보 산에 오릅니다.', 'Moses climbs Mount Nebo from the plains of Moab.'),
    ],
  },
];

export const JOURNEY_CATEGORIES = ['all', 'jesus', 'paul', 'patriarch', 'exodus'];

export const JOURNEY_SEARCH_MESSAGES = {
  ko: { searchJourneys: '인물 또는 여정 검색', noJourneyResults: '일치하는 공개 여정이 없습니다.' },
  en: { searchJourneys: 'Search people or journeys', noJourneyResults: 'No published journey matches.' },
  ja: { searchJourneys: '人物や旅を検索', noJourneyResults: '一致する公開済みの旅はありません。' },
  'zh-CN': { searchJourneys: '搜索人物或旅程', noJourneyResults: '没有匹配的已发布旅程。' },
  es: { searchJourneys: 'Buscar personas o viajes', noJourneyResults: 'No hay viajes publicados que coincidan.' },
  th: { searchJourneys: 'ค้นหาบุคคลหรือการเดินทาง', noJourneyResults: 'ไม่พบการเดินทางที่เผยแพร่ซึ่งตรงกัน' },
  hi: { searchJourneys: 'व्यक्ति या यात्रा खोजें', noJourneyResults: 'कोई प्रकाशित यात्रा नहीं मिली।' },
  fr: { searchJourneys: 'Rechercher une personne ou un voyage', noJourneyResults: 'Aucun voyage publié ne correspond.' },
  de: { searchJourneys: 'Person oder Reise suchen', noJourneyResults: 'Keine passende veröffentlichte Reise gefunden.' },
};

export const CATALOG_MESSAGES = {
  ko: { navPlaces: '본문 속 지명', navJourneys: '성경여행', catalogTitle: '인물과 여정 살펴보기', catalogIntro: '인물을 고르고, 본문이 알려 주는 장소를 장면별로 따라가 보세요.', categoryAll: '전체', categoryJesus: '예수님', categoryPaul: '바울', categoryPatriarch: '족장', categoryExodus: '출애굽', journeyCount: '{count}개 여정', storyFallback: '이 장면의 본문과 장소를 함께 살펴보세요.', noRouteNote: '출애굽 장소의 위치와 경로에는 여러 견해가 있습니다. 장면만 본문 순서로 표시하며 이동선을 그리지 않습니다.', actionDepart: '이 장소에서 다음 장면으로 떠납니다.', actionArrive: '본문에 기록된 이 장소에 이릅니다.', actionReturn: '이 장소로 돌아옵니다.', actionTeach: '이 장소에서의 사역을 살펴봅니다.', actionCross: '이 지역을 지나가는 장면입니다.', actionBirth: '탄생과 연결된 장소입니다.', actionBaptism: '세례가 기록된 장소입니다.', actionWilderness: '광야 여정의 한 장면입니다.', actionEnd: '이 장소에서 여정의 다음 국면을 맞습니다.' },
  en: { navPlaces: 'Places in the Passage', navJourneys: 'Bible Journeys', catalogTitle: 'People and journeys', catalogIntro: 'Choose a person and follow places named in the biblical account.', categoryAll: 'All', categoryJesus: 'Jesus', categoryPaul: 'Paul', categoryPatriarch: 'Patriarchs', categoryExodus: 'Exodus', journeyCount: '{count} journeys', storyFallback: 'Read the passage and explore this place.', noRouteNote: 'Locations and the path of the Exodus are disputed. Scenes follow the passage order without a route line.', actionDepart: 'The journey leaves this place.', actionArrive: 'The account reaches this place.', actionReturn: 'The journey returns here.', actionTeach: 'Explore the ministry recorded here.', actionCross: 'The account passes through this region.', actionBirth: 'This place is connected with the birth.', actionBaptism: 'Baptism is recorded here.', actionWilderness: 'This is a scene in the wilderness journey.', actionEnd: 'This place marks the next stage of the account.' },
  ja: { navPlaces: '本文の地名', navJourneys: '聖書の旅', catalogTitle: '人物と旅を探す', catalogIntro: '人物を選び、本文に記された場所を場面ごとにたどります。', categoryAll: 'すべて', categoryJesus: 'イエス', categoryPaul: 'パウロ', categoryPatriarch: '族長', categoryExodus: '出エジプト', journeyCount: '{count}の旅', storyFallback: '本文と場所を一緒に確認します。', noRouteNote: '出エジプトの場所と経路には諸説があります。場面を本文順に示し、移動線は引きません。', actionDepart: 'この場所から次の場面へ進みます。', actionArrive: '本文に記された場所に着きます。', actionReturn: 'この場所に戻ります。', actionTeach: 'この場所での働きを見ます。', actionCross: 'この地域を通る場面です。', actionBirth: '誕生に結びつく場所です。', actionBaptism: '洗礼が記された場所です。', actionWilderness: '荒野の旅の一場面です。', actionEnd: 'この場所で物語は次の段階に進みます。' },
  'zh-CN': { navPlaces: '经文中的地名', navJourneys: '圣经旅程', catalogTitle: '人物与旅程', catalogIntro: '选择人物，按场景查看经文记载的地点。', categoryAll: '全部', categoryJesus: '耶稣', categoryPaul: '保罗', categoryPatriarch: '族长', categoryExodus: '出埃及', journeyCount: '{count}段旅程', storyFallback: '结合经文查看这个地点。', noRouteNote: '出埃及地点和路线存在不同看法。场景按经文顺序呈现，不绘制路线。', actionDepart: '旅程从这里继续。', actionArrive: '记载来到这个地点。', actionReturn: '旅程回到这里。', actionTeach: '查看这里记载的事工。', actionCross: '这是经过该地区的场景。', actionBirth: '这个地点与降生有关。', actionBaptism: '这里记载了受洗。', actionWilderness: '这是旷野旅程的一幕。', actionEnd: '故事在这里进入下一阶段。' },
  es: { navPlaces: 'Lugares del pasaje', navJourneys: 'Viajes bíblicos', catalogTitle: 'Personas y viajes', catalogIntro: 'Elige una persona y sigue los lugares citados en cada escena.', categoryAll: 'Todos', categoryJesus: 'Jesús', categoryPaul: 'Pablo', categoryPatriarch: 'Patriarcas', categoryExodus: 'Éxodo', journeyCount: '{count} viajes', storyFallback: 'Consulta el pasaje y este lugar.', noRouteNote: 'Los lugares y la ruta del éxodo son debatidos. Las escenas siguen el texto sin trazar una ruta.', actionDepart: 'El viaje sale de este lugar.', actionArrive: 'El relato llega a este lugar.', actionReturn: 'El viaje regresa aquí.', actionTeach: 'Explora el ministerio registrado aquí.', actionCross: 'El relato pasa por esta región.', actionBirth: 'Este lugar se relaciona con el nacimiento.', actionBaptism: 'Aquí se registra el bautismo.', actionWilderness: 'Esta es una escena del viaje por el desierto.', actionEnd: 'Aquí comienza otra etapa del relato.' },
  th: { navPlaces: 'สถานที่ในพระคัมภีร์', navJourneys: 'การเดินทางในพระคัมภีร์', catalogTitle: 'บุคคลและการเดินทาง', catalogIntro: 'เลือกบุคคลแล้วติดตามสถานที่ตามฉากในพระคัมภีร์', categoryAll: 'ทั้งหมด', categoryJesus: 'พระเยซู', categoryPaul: 'เปาโล', categoryPatriarch: 'บรรพบุรุษ', categoryExodus: 'อพยพ', journeyCount: '{count} การเดินทาง', storyFallback: 'อ่านข้อพระคัมภีร์และดูสถานที่นี้', noRouteNote: 'ตำแหน่งและเส้นทางอพยพมีหลายข้อเสนอ จึงแสดงฉากตามลำดับพระคัมภีร์โดยไม่ลากเส้นทาง', actionDepart: 'การเดินทางออกจากสถานที่นี้', actionArrive: 'เรื่องราวมาถึงสถานที่นี้', actionReturn: 'การเดินทางกลับมาที่นี่', actionTeach: 'ดูพันธกิจที่บันทึกไว้ที่นี่', actionCross: 'เรื่องราวผ่านภูมิภาคนี้', actionBirth: 'สถานที่นี้เกี่ยวข้องกับการประสูติ', actionBaptism: 'มีบันทึกการรับบัพติศมาที่นี่', actionWilderness: 'นี่เป็นฉากหนึ่งของการเดินทางในถิ่นทุรกันดาร', actionEnd: 'เรื่องราวเข้าสู่ช่วงต่อไปที่นี่' },
  hi: { navPlaces: 'पाठ के स्थान', navJourneys: 'बाइबल यात्राएँ', catalogTitle: 'लोग और यात्राएँ', catalogIntro: 'एक व्यक्ति चुनें और पाठ में आए स्थानों को दृश्यवार देखें।', categoryAll: 'सभी', categoryJesus: 'यीशु', categoryPaul: 'पौलुस', categoryPatriarch: 'कुलपिता', categoryExodus: 'निर्गमन', journeyCount: '{count} यात्राएँ', storyFallback: 'इस स्थान के साथ बाइबल का पाठ पढ़ें।', noRouteNote: 'निर्गमन के स्थान और मार्ग पर मतभेद हैं। दृश्य पाठ के क्रम में हैं; मार्गरेखा नहीं बनाई गई है।', actionDepart: 'यात्रा इस स्थान से आगे बढ़ती है।', actionArrive: 'वृत्तांत इस स्थान तक पहुँचता है।', actionReturn: 'यात्रा यहाँ लौटती है।', actionTeach: 'यहाँ दर्ज सेवकाई देखें।', actionCross: 'वृत्तांत इस क्षेत्र से गुजरता है।', actionBirth: 'यह स्थान जन्म से जुड़ा है।', actionBaptism: 'यहाँ बपतिस्मा दर्ज है।', actionWilderness: 'यह जंगल की यात्रा का दृश्य है।', actionEnd: 'यहाँ वृत्तांत का अगला चरण शुरू होता है।' },
  fr: { navPlaces: 'Lieux du passage', navJourneys: 'Voyages bibliques', catalogTitle: 'Personnes et voyages', catalogIntro: 'Choisissez une personne et suivez les lieux mentionnés scène par scène.', categoryAll: 'Tout', categoryJesus: 'Jésus', categoryPaul: 'Paul', categoryPatriarch: 'Patriarches', categoryExodus: 'Exode', journeyCount: '{count} voyages', storyFallback: 'Lisez le passage et examinez ce lieu.', noRouteNote: 'Les lieux et l’itinéraire de l’Exode font débat. Les scènes suivent le texte sans tracer de route.', actionDepart: 'Le voyage quitte ce lieu.', actionArrive: 'Le récit atteint ce lieu.', actionReturn: 'Le voyage revient ici.', actionTeach: 'Découvrez le ministère relaté ici.', actionCross: 'Le récit traverse cette région.', actionBirth: 'Ce lieu est lié à la naissance.', actionBaptism: 'Le baptême est relaté ici.', actionWilderness: 'Voici une scène du voyage dans le désert.', actionEnd: 'Le récit entre ici dans une nouvelle étape.' },
  de: { navPlaces: 'Orte im Bibeltext', navJourneys: 'Biblische Reisen', catalogTitle: 'Menschen und Reisen', catalogIntro: 'Wählen Sie eine Person und folgen Sie den genannten Orten Szene für Szene.', categoryAll: 'Alle', categoryJesus: 'Jesus', categoryPaul: 'Paulus', categoryPatriarch: 'Patriarchen', categoryExodus: 'Exodus', journeyCount: '{count} Reisen', storyFallback: 'Lesen Sie die Stelle und betrachten Sie diesen Ort.', noRouteNote: 'Orte und Verlauf des Exodus sind umstritten. Die Szenen folgen dem Text ohne eingezeichnete Route.', actionDepart: 'Die Reise führt von hier weiter.', actionArrive: 'Der Bericht erreicht diesen Ort.', actionReturn: 'Die Reise kehrt hierher zurück.', actionTeach: 'Entdecken Sie das hier beschriebene Wirken.', actionCross: 'Der Bericht führt durch diese Region.', actionBirth: 'Dieser Ort steht mit der Geburt in Verbindung.', actionBaptism: 'Hier wird die Taufe beschrieben.', actionWilderness: 'Dies ist eine Szene der Wüstenreise.', actionEnd: 'Hier beginnt der nächste Abschnitt des Berichts.' },
};
