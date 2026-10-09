// Each waypoint is tied to a place and verse in the pinned OpenBible.info index.
// Repeated places remain separate scenes because the passage returns to them.
export const JOURNEYS = [
  {
    id: 'abraham', code: 'GEN', chapterRange: '12–13',
    source: 'https://www.biblegateway.com/passage/?search=Genesis+12-13&version=KJV',
    steps: [
      { placeId: 'a6d9af3', chapter: 12, verse: 4 }, // Haran
      { placeId: 'adf74d4', chapter: 12, verse: 6 }, // Shechem
      { placeId: 'a64f355', chapter: 12, verse: 8 }, // Bethel
      { placeId: 'a1cb244', chapter: 12, verse: 9, broad: true }, // Negeb region
      { placeId: 'af301ca', chapter: 12, verse: 10, broad: true }, // Egypt region
      { placeId: 'a64f355', chapter: 13, verse: 3 }, // return to Bethel
      { placeId: 'a85151a', chapter: 13, verse: 18 }, // Hebron
    ],
  },
  {
    id: 'paul', code: 'ACT', chapterRange: '13–14',
    source: 'https://www.biblegateway.com/passage/?search=Acts+13-14&version=KJV',
    steps: [
      { placeId: 'ae41ab4', chapter: 13, verse: 1 }, // Syrian Antioch
      { placeId: 'a6d306d', chapter: 13, verse: 4 }, // Seleucia
      { placeId: 'afa863b', chapter: 13, verse: 5 }, // Salamis
      { placeId: 'a314765', chapter: 13, verse: 6 }, // Paphos
      { placeId: 'aff04b8', chapter: 13, verse: 13 }, // Perga
      { placeId: 'a6c704a', chapter: 13, verse: 14 }, // Pisidian Antioch
      { placeId: 'ae425aa', chapter: 13, verse: 51 }, // Iconium
      { placeId: 'af0719d', chapter: 14, verse: 6 }, // Lystra
      { placeId: 'aa401a9', chapter: 14, verse: 20, endVerse: 21 }, // Derbe; its arrival is indexed in v20
      { placeId: 'ac744c1', chapter: 14, verse: 25 }, // Attalia
      { placeId: 'ae41ab4', chapter: 14, verse: 26, endVerse: 27 }, // return
    ],
  },
];

export const JOURNEY_MESSAGES = {
  ko: {
    eyebrow: '본문을 따라 걷는 지도', title: '여행 이야기', intro: '지명이 나오는 순서대로 장면을 넘기며, 본문과 지도 근거를 함께 살펴보세요.',
    abraham: '아브라함의 길', abrahamIntro: '하란에서 가나안으로 떠나고, 기근 뒤 다시 돌아오는 장면을 따라갑니다.',
    paul: '바울의 첫 선교 여행', paulIntro: '안디옥에서 출발해 구브로와 소아시아를 거쳐 공동체로 돌아오는 장면입니다.',
    steps: '{count}장면', scene: '장면 {current} / {total}', prev: '이전 장면', next: '다음 장면', all: '전체 여정',
    read: '본문 읽기', place: '본문 지도에서 보기', source: '본문 근거', photo: '오늘날 주변 사진',
    broad: '지역을 나타내는 대표 핀입니다.', routeNote: '점선은 본문의 순서만 연결합니다. 실제 이동한 길이나 거리를 뜻하지 않으며, 옛 지명의 위치는 추정일 수 있습니다.',
    mapLoading: '여정 지도를 불러오는 중입니다.', mapFailed: '지도를 불러오지 못했습니다. 아래 장면과 본문 링크는 계속 사용할 수 있습니다.', jump: '여행 이야기 따라가기',
    abrahamEvents: [
      '아브람이 하란을 떠나 가나안으로 향합니다.', '세겜의 모레 상수리나무에 이릅니다.', '벧엘과 아이 사이에 장막을 치고 제단을 쌓습니다.',
      '점점 남쪽 네겝으로 옮겨 갑니다.', '기근 때문에 애굽으로 내려갑니다.', '애굽에서 돌아와 이전에 제단을 쌓았던 곳에 이릅니다.', '롯과 헤어진 뒤 헤브론에 머물며 제단을 쌓습니다.',
    ],
    paulEvents: [
      '안디옥 교회가 바나바와 사울을 보내는 장면에서 시작합니다.', '실루기아 항구에서 구브로로 배를 탑니다.', '살라미의 회당에서 말씀을 전합니다.',
      '섬을 지나 바보에 도착합니다.', '바보에서 배를 타고 버가에 이릅니다.', '비시디아 안디옥의 회당에서 말씀을 전합니다.', '그곳에서 떠나 이고니온으로 갑니다.',
      '반대가 거세지자 루스드라로 피합니다.', '더베에서 복음을 전하고 제자를 삼습니다.', '버가를 거쳐 앗달리아 항구로 내려갑니다.', '안디옥으로 돌아와 공동체에 여정을 보고합니다.',
    ],
  },
  en: {
    eyebrow: 'Follow the passage on a map', title: 'Journey stories', intro: 'Move through the places in narrative order, with a verse and map source for each scene.',
    abraham: "Abraham's journey", abrahamIntro: 'Follow Abram from Haran into Canaan, through famine and back again.',
    paul: "Paul's first mission journey", paulIntro: 'Follow the mission from Antioch through Cyprus and Asia Minor, then back to the church.',
    steps: '{count} scenes', scene: 'Scene {current} / {total}', prev: 'Previous scene', next: 'Next scene', all: 'Whole journey',
    read: 'Read the passage', place: 'Open passage map', source: 'Passage source', photo: 'Present-day area photo',
    broad: 'This pin represents a broad region.', routeNote: 'Dashed lines connect the story sequence only. They are not historical roads or travel distances; ancient locations may be uncertain.',
    mapLoading: 'Loading the journey map.', mapFailed: 'The map could not load. The scenes and passage links still work.', jump: 'Follow a journey story',
    abrahamEvents: [
      'Abram leaves Haran for Canaan.', 'He reaches Shechem near the oak of Moreh.', 'He pitches his tent between Bethel and Ai and builds an altar.',
      'He continues south toward the Negev.', 'Famine leads him down to Egypt.', 'He returns to the place where he built an altar earlier.', 'After separating from Lot, he settles near Hebron and builds an altar.',
    ],
    paulEvents: [
      'The church in Antioch sends Barnabas and Saul.', 'They sail from Seleucia toward Cyprus.', 'They speak in the synagogues of Salamis.',
      'They cross the island to Paphos.', 'They sail from Paphos to Perga.', 'They speak in the synagogue at Pisidian Antioch.', 'They move on to Iconium.',
      'Facing opposition, they flee to Lystra.', 'They preach and make disciples in Derbe.', 'They pass through Perga and reach the port of Attalia.', 'They return to Antioch and report to the church.',
    ],
  },
  ja: {
    eyebrow: '本文をたどる地図', title: '旅の物語', intro: '本文に出る順に場面を進め、節と地図資料を一緒に見ます。',
    abraham: 'アブラハムの旅', abrahamIntro: 'ハランからカナンへ、飢饉を経て戻る歩みをたどります。', paul: 'パウロの第一次伝道旅行', paulIntro: 'アンティオキアからキプロスと小アジアを経て教会に戻ります。',
    steps: '{count}場面', scene: '場面 {current} / {total}', prev: '前の場面', next: '次の場面', all: '旅全体', read: '本文を読む', place: '本文の地図を見る', source: '本文の根拠', photo: '現在の周辺写真', broad: '広い地域を示す代表ピンです。',
    routeNote: '点線は物語の順序だけを結びます。実際の道や距離ではなく、古代の位置は推定の場合があります。', mapLoading: '旅の地図を読み込み中です。', mapFailed: '地図を読み込めません。場面と本文リンクは利用できます。', jump: '旅の物語を見る',
    abrahamEvents: ['アブラムはハランを出てカナンへ向かいます。', 'モレの木の近くのシケムに着きます。', 'ベテルとアイの間に天幕を張り、祭壇を築きます。', '南のネゲブへ進みます。', '飢饉のためエジプトへ下ります。', '以前祭壇を築いた場所へ戻ります。', 'ロトと別れ、ヘブロンに住み祭壇を築きます。'],
    paulEvents: ['アンティオキアの教会がバルナバとサウロを遣わします。', 'セレウキアからキプロスへ船で向かいます。', 'サラミスの会堂で語ります。', '島を渡りパフォスに着きます。', 'パフォスからペルガへ船で向かいます。', 'ピシディアのアンティオキアの会堂で語ります。', 'イコニオムへ進みます。', '反対を受けてルステラへ逃れます。', 'デルベで福音を伝え弟子を得ます。', 'ペルガを経てアタリア港へ下ります。', 'アンティオキアに戻り教会に報告します。'],
  },
  'zh-CN': {
    eyebrow: '沿着经文看地图', title: '旅程故事', intro: '按经文顺序逐幕查看地点、经节和地图资料。',
    abraham: '亚伯拉罕的旅程', abrahamIntro: '从哈兰前往迦南，经历饥荒后返回。', paul: '保罗第一次宣教旅程', paulIntro: '从安提阿出发，经塞浦路斯和小亚细亚，再回到教会。',
    steps: '{count}幕', scene: '第 {current} / {total} 幕', prev: '上一幕', next: '下一幕', all: '查看全程', read: '阅读经文', place: '打开经文地图', source: '经文依据', photo: '今日周边照片', broad: '此图钉代表较大的地区。',
    routeNote: '虚线只连接叙事顺序，并非真实道路或距离；古代地点的位置可能只是推测。', mapLoading: '正在加载旅程地图。', mapFailed: '地图未能加载，仍可使用场景和经文链接。', jump: '跟随旅程故事',
    abrahamEvents: ['亚伯兰离开哈兰前往迦南。', '他到达示剑的摩利橡树附近。', '他在伯特利与艾城之间支搭帐棚并筑坛。', '他继续向南到南地。', '饥荒使他下到埃及。', '他回到先前筑坛的地方。', '与罗得分开后，他住在希伯仑并筑坛。'],
    paulEvents: ['安提阿教会差遣巴拿巴和扫罗。', '他们从西流基坐船前往塞浦路斯。', '他们在撒拉米的会堂传讲。', '他们穿过全岛来到帕弗。', '他们从帕弗乘船到别加。', '他们在彼西底的安提阿会堂传讲。', '他们前往以哥念。', '面对反对，他们逃往路司得。', '他们在特庇传福音并使人作门徒。', '他们经过别加，下到亚大利港。', '他们回到安提阿，向教会报告。'],
  },
  es: {
    eyebrow: 'Sigue el pasaje en el mapa', title: 'Historias de viaje', intro: 'Recorre los lugares en orden narrativo con el versículo y la fuente del mapa.',
    abraham: 'El viaje de Abraham', abrahamIntro: 'Sigue a Abram desde Harán hasta Canaán, durante el hambre y de regreso.', paul: 'Primer viaje misionero de Pablo', paulIntro: 'De Antioquía por Chipre y Asia Menor, y de vuelta a la iglesia.',
    steps: '{count} escenas', scene: 'Escena {current} / {total}', prev: 'Escena anterior', next: 'Escena siguiente', all: 'Viaje completo', read: 'Leer el pasaje', place: 'Abrir mapa del pasaje', source: 'Fuente bíblica', photo: 'Foto actual de la zona', broad: 'Este marcador representa una región amplia.',
    routeNote: 'La línea punteada solo une el orden del relato. No indica caminos ni distancias reales; algunas ubicaciones antiguas son inciertas.', mapLoading: 'Cargando el mapa del viaje.', mapFailed: 'No se pudo cargar el mapa. Las escenas y enlaces siguen disponibles.', jump: 'Seguir un viaje',
    abrahamEvents: ['Abram sale de Harán hacia Canaán.', 'Llega a Siquem, cerca de la encina de More.', 'Acampa entre Betel y Hai y levanta un altar.', 'Continúa al sur hacia el Néguev.', 'El hambre lo lleva a Egipto.', 'Regresa al lugar donde había levantado un altar.', 'Tras separarse de Lot, vive cerca de Hebrón y levanta un altar.'],
    paulEvents: ['La iglesia de Antioquía envía a Bernabé y Saulo.', 'Zarpan de Seleucia hacia Chipre.', 'Hablan en las sinagogas de Salamina.', 'Cruzan la isla hasta Pafos.', 'Navegan de Pafos a Perge.', 'Hablan en la sinagoga de Antioquía de Pisidia.', 'Siguen hacia Iconio.', 'Ante la oposición huyen a Listra.', 'Predican y hacen discípulos en Derbe.', 'Pasan por Perge y llegan al puerto de Atalia.', 'Vuelven a Antioquía e informan a la iglesia.'],
  },
  th: {
    eyebrow: 'ติดตามพระคัมภีร์บนแผนที่', title: 'เรื่องราวการเดินทาง', intro: 'ดูสถานที่ตามลำดับเรื่อง พร้อมข้อพระคัมภีร์และที่มาของแผนที่',
    abraham: 'การเดินทางของอับราฮัม', abrahamIntro: 'ติดตามอับรามจากฮารานสู่คานาอัน ผ่านการกันดารอาหารแล้วกลับมา', paul: 'การเดินทางประกาศครั้งแรกของเปาโล', paulIntro: 'จากอันทิโอกผ่านไซปรัสและเอเชียไมเนอร์ ก่อนกลับสู่คริสตจักร',
    steps: '{count} ฉาก', scene: 'ฉาก {current} / {total}', prev: 'ฉากก่อน', next: 'ฉากถัดไป', all: 'การเดินทางทั้งหมด', read: 'อ่านพระคัมภีร์', place: 'เปิดแผนที่ข้อพระคัมภีร์', source: 'หลักฐานจากพระคัมภีร์', photo: 'ภาพพื้นที่ในปัจจุบัน', broad: 'หมุดนี้แทนพื้นที่กว้างโดยประมาณ',
    routeNote: 'เส้นประแสดงเพียงลำดับเรื่อง ไม่ใช่ถนนหรือระยะทางจริง และตำแหน่งโบราณอาจเป็นการประมาณ', mapLoading: 'กำลังโหลดแผนที่การเดินทาง', mapFailed: 'โหลดแผนที่ไม่ได้ แต่ยังอ่านฉากและข้อพระคัมภีร์ได้', jump: 'ติดตามเรื่องราวการเดินทาง',
    abrahamEvents: ['อับรามออกจากฮารานไปคานาอัน', 'เขามาถึงเชเคมใกล้ต้นไม้ที่โมเรห์', 'เขาตั้งเต็นท์ระหว่างเบธเอลกับอัยและสร้างแท่นบูชา', 'เขาเดินทางต่อไปทางใต้สู่นาเกบ', 'การกันดารอาหารทำให้เขาลงไปอียิปต์', 'เขากลับไปยังที่ซึ่งเคยสร้างแท่นบูชา', 'หลังแยกจากโลท เขาอยู่ใกล้เฮโบรนและสร้างแท่นบูชา'],
    paulEvents: ['คริสตจักรอันทิโอกส่งบารนาบัสกับเซาโล', 'พวกเขาลงเรือจากเซลูเคียไปไซปรัส', 'พวกเขาประกาศในธรรมศาลาที่ซาลามิส', 'พวกเขาข้ามเกาะไปถึงปาโฟส', 'พวกเขาล่องเรือจากปาโฟสไปเปอร์กา', 'พวกเขาพูดในธรรมศาลาที่อันทิโอกแคว้นปิสิเดีย', 'พวกเขาไปต่อยังอิโคนียูม', 'เมื่อถูกต่อต้าน พวกเขาหนีไปลิสตรา', 'พวกเขาประกาศและสร้างสาวกในเดอร์บี', 'พวกเขาผ่านเปอร์กาไปยังท่าเรืออัททาลิยา', 'พวกเขากลับอันทิโอกและรายงานต่อคริสตจักร'],
  },
  hi: {
    eyebrow: 'पाठ के साथ मानचित्र देखें', title: 'यात्रा की कहानियाँ', intro: 'कथा के क्रम में स्थान, पद और मानचित्र का स्रोत देखें।',
    abraham: 'अब्राहम की यात्रा', abrahamIntro: 'हारान से कनान, अकाल और फिर वापसी तक अब्राम का रास्ता देखें।', paul: 'पौलुस की पहली मिशन यात्रा', paulIntro: 'अन्ताकिया से कुप्रुस और एशिया माइनर होकर कलीसिया तक वापसी।',
    steps: '{count} दृश्य', scene: 'दृश्य {current} / {total}', prev: 'पिछला दृश्य', next: 'अगला दृश्य', all: 'पूरी यात्रा', read: 'पाठ पढ़ें', place: 'पाठ का मानचित्र खोलें', source: 'बाइबल का आधार', photo: 'आज के क्षेत्र की तस्वीर', broad: 'यह चिह्न एक बड़े क्षेत्र का प्रतिनिधि स्थान है।',
    routeNote: 'बिंदीदार रेखा केवल कथा का क्रम दिखाती है। यह वास्तविक सड़क या दूरी नहीं है; प्राचीन स्थान अनुमानित हो सकते हैं।', mapLoading: 'यात्रा का मानचित्र लोड हो रहा है।', mapFailed: 'मानचित्र नहीं खुला। दृश्य और पद के लिंक उपलब्ध हैं।', jump: 'यात्रा की कहानी देखें',
    abrahamEvents: ['अब्राम हारान से कनान की ओर निकलता है।', 'वह मोरे के वृक्ष के पास शकेम पहुँचता है।', 'वह बेतेल और ऐ के बीच डेरा डालकर वेदी बनाता है।', 'वह दक्षिण में नेगेव की ओर बढ़ता है।', 'अकाल उसे मिस्र ले जाता है।', 'वह पहले बनाई वेदी की जगह लौटता है।', 'लूत से अलग होकर वह हेब्रोन के पास बसता और वेदी बनाता है।'],
    paulEvents: ['अन्ताकिया की कलीसिया बरनबास और शाऊल को भेजती है।', 'वे सिलूकिया से कुप्रुस के लिए जहाज़ लेते हैं।', 'वे सलमीस के आराधनालयों में बोलते हैं।', 'वे द्वीप पार करके पाफुस पहुँचते हैं।', 'वे पाफुस से पिरगा जाते हैं।', 'वे पिसिदिया के अन्ताकिया के आराधनालय में बोलते हैं।', 'वे इकुनियुम जाते हैं।', 'विरोध के कारण वे लुस्त्रा भागते हैं।', 'वे दिरबे में सुसमाचार सुनाकर चेले बनाते हैं।', 'वे पिरगा होकर अत्तालिया बंदरगाह जाते हैं।', 'वे अन्ताकिया लौटकर कलीसिया को समाचार देते हैं।'],
  },
  fr: {
    eyebrow: 'Suivre le passage sur la carte', title: 'Récits de voyage', intro: 'Parcourez les lieux dans l’ordre du récit avec le verset et la source cartographique.',
    abraham: "Le voyage d'Abraham", abrahamIntro: "Suivez Abram de Haran à Canaan, pendant la famine puis à son retour.", paul: 'Premier voyage missionnaire de Paul', paulIntro: "D'Antioche à Chypre et en Asie Mineure, puis retour vers l'Église.",
    steps: '{count} scènes', scene: 'Scène {current} / {total}', prev: 'Scène précédente', next: 'Scène suivante', all: 'Voyage entier', read: 'Lire le passage', place: 'Ouvrir la carte du passage', source: 'Source biblique', photo: 'Photo actuelle de la région', broad: 'Ce repère représente une vaste région.',
    routeNote: "Les pointillés relient seulement l’ordre du récit. Ils ne montrent ni route réelle ni distance; certains lieux antiques restent incertains.", mapLoading: 'Chargement de la carte du voyage.', mapFailed: 'Carte indisponible. Les scènes et liens bibliques restent accessibles.', jump: 'Suivre un récit de voyage',
    abrahamEvents: ['Abram quitte Haran pour Canaan.', 'Il arrive à Sichem près du chêne de Moré.', 'Il campe entre Béthel et Aï et bâtit un autel.', 'Il poursuit vers le Néguev au sud.', 'La famine le conduit en Égypte.', 'Il revient au lieu où il avait bâti un autel.', 'Après sa séparation de Lot, il demeure près d’Hébron et bâtit un autel.'],
    paulEvents: ["L'Église d'Antioche envoie Barnabas et Saul.", 'Ils embarquent à Séleucie pour Chypre.', 'Ils parlent dans les synagogues de Salamine.', "Ils traversent l'île jusqu'à Paphos.", 'Ils naviguent de Paphos à Perge.', "Ils parlent dans la synagogue d'Antioche de Pisidie.", 'Ils vont à Iconium.', "Face à l'opposition, ils fuient à Lystre.", 'Ils annoncent l’Évangile et font des disciples à Derbe.', 'Ils passent par Perge et gagnent le port d’Attalie.', "Ils reviennent à Antioche et rendent compte à l'Église."],
  },
  de: {
    eyebrow: 'Dem Bibeltext auf der Karte folgen', title: 'Reisegeschichten', intro: 'Orte in der Reihenfolge der Erzählung mit Vers und Kartenquelle erkunden.',
    abraham: 'Abrahams Reise', abrahamIntro: 'Abrams Weg von Haran nach Kanaan, durch die Hungersnot und zurück.', paul: 'Paulus’ erste Missionsreise', paulIntro: 'Von Antiochia über Zypern und Kleinasien zurück zur Gemeinde.',
    steps: '{count} Szenen', scene: 'Szene {current} / {total}', prev: 'Vorige Szene', next: 'Nächste Szene', all: 'Ganze Reise', read: 'Bibeltext lesen', place: 'Textkarte öffnen', source: 'Bibelstelle', photo: 'Heutiges Foto der Umgebung', broad: 'Dieser Punkt steht stellvertretend für eine große Region.',
    routeNote: 'Die gestrichelte Linie verbindet nur die Erzählfolge. Sie zeigt weder echte Wege noch Entfernungen; antike Orte können unsicher sein.', mapLoading: 'Reisekarte wird geladen.', mapFailed: 'Karte nicht verfügbar. Szenen und Bibellinks bleiben nutzbar.', jump: 'Reisegeschichte ansehen',
    abrahamEvents: ['Abram verlässt Haran Richtung Kanaan.', 'Er erreicht Sichem bei der Eiche von More.', 'Er lagert zwischen Bethel und Ai und baut einen Altar.', 'Er zieht weiter nach Süden in den Negev.', 'Eine Hungersnot führt ihn nach Ägypten.', 'Er kehrt an den früheren Altarplatz zurück.', 'Nach der Trennung von Lot wohnt er bei Hebron und baut einen Altar.'],
    paulEvents: ['Die Gemeinde in Antiochia sendet Barnabas und Saulus aus.', 'Sie fahren von Seleuzia nach Zypern.', 'Sie sprechen in den Synagogen von Salamis.', 'Sie durchqueren die Insel bis Paphos.', 'Sie fahren von Paphos nach Perge.', 'Sie sprechen in der Synagoge von Antiochia in Pisidien.', 'Sie ziehen weiter nach Ikonion.', 'Wegen Widerstands fliehen sie nach Lystra.', 'In Derbe verkünden sie das Evangelium und gewinnen Jünger.', 'Über Perge gelangen sie zum Hafen Attalia.', 'Sie kehren nach Antiochia zurück und berichten der Gemeinde.'],
  },
};

export function journeyMessage(locale, key, vars = {}) {
  const text = JOURNEY_MESSAGES[locale]?.[key] ?? JOURNEY_MESSAGES.en[key];
  return typeof text === 'string' ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? '')) : text;
}
