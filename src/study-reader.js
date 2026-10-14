import { VERSE_COUNTS } from './verse-counts.js';

// Verse addresses only. Bible text remains with its licensed publisher.
export function passageVerses(reference) {
  if (!reference?.code || !VERSE_COUNTS[reference.code]) return [];
  const verses = [];
  for (let chapter = reference.chapter; chapter <= reference.endChapter; chapter += 1) {
    const lastVerse = VERSE_COUNTS[reference.code][chapter - 1];
    if (!lastVerse) return [];
    const start = chapter === reference.chapter ? reference.startVerse || 1 : 1;
    const end = chapter === reference.endChapter ? reference.endVerse || lastVerse : lastVerse;
    for (let verse = start; verse <= end; verse += 1) {
      verses.push({ code: reference.code, chapter, verse, key: `${reference.code}:${chapter}:${verse}` });
    }
  }
  return verses;
}

export function notesForPassage(verseNotes, sequence) {
  const order = new Map(sequence.map(({ key }, index) => [key, index]));
  return verseNotes.filter(({ verse }) => order.has(verse))
    .sort((a, b) => order.get(a.verse) - order.get(b.verse));
}

export function studyReaderCopy(locale = 'ko') {
  const messages = {
    ko: ['말씀을 따라 읽으며 기록하기', '읽기', '지명 확인', '내 주석', '현재 절', '이전 절', '다음 절', '절 바로 가기', '개역개정에서 이 절 읽기', '새 탭에서 말씀을 읽고 돌아와 이 절에 대한 관찰을 적으세요.', '이 절에 연결된 지명', '연결된 지명이 없습니다. 본문을 읽고 자유롭게 기록하세요.', '지명은 본문에 등장한 말입니다. 방문이나 사건 현장으로 단정하지 마세요.', '지도에서 보기', '이 절의 주석 메모', '본문에서 확인한 사실, 지명의 역할, 더 살펴볼 질문을 내 말로 적어 보세요.', '이 브라우저에 자동 저장됩니다. 전체 메모 백업에 포함됩니다.', '절별 메모가 저장되었습니다.', '메모를 지웠습니다.', '브라우저 저장 공간을 사용할 수 없습니다. 내용을 복사해 보관하세요.', '설교 준비 메모'],
    en: ['Read and annotate the passage', 'Read', 'Check places', 'Your notes', 'Current verse', 'Previous verse', 'Next verse', 'Jump to verse', 'Read this verse in the Korean Bible', 'Read in a new tab, then return to record your observations.', 'Places linked to this verse', 'No place is linked to this verse. Read and record freely.', 'A place mention does not prove a visit or scene location.', 'Show on map', 'Your verse note', 'Write what the text says, the role of any place, and questions to check.', 'Autosaved in this browser and included in the full backup.', 'Verse note saved.', 'Verse note cleared.', 'Browser storage is unavailable. Copy your note to keep it.', 'Passage summary notes'],
    ja: ['聖書を読みながら記録', '読む', '地名を確認', '注記', '現在の節', '前の節', '次の節', '節へ移動', '韓国語聖書でこの節を読む', '新しいタブで本文を読み、戻って観察を記録してください。', 'この節に関連する地名', '関連する地名はありません。本文を読んで自由に記録してください。', '地名への言及は訪問や事件の場所を証明しません。', '地図で見る', 'この節の注記', '本文の事実、地名の役割、確認したい問いを書いてください。', 'このブラウザーに自動保存され、バックアップに含まれます。', '節の注記を保存しました。', '注記を削除しました。', 'ブラウザーに保存できません。内容をコピーしてください。', '本文全体のメモ'],
    'zh-CN': ['边读经边做注释', '阅读', '核查地名', '我的注释', '当前经节', '上一节', '下一节', '跳至经节', '在韩文圣经中阅读本节', '在新标签页阅读正文，然后返回记录观察。', '本节关联的地名', '本节没有关联地名。请阅读正文并自由记录。', '提到地名并不能证明人物到过那里或事件发生在那里。', '在地图上查看', '本节注释', '记录正文事实、地名作用和需要进一步核查的问题。', '自动保存在本浏览器中，并包含在完整备份内。', '经节注释已保存。', '注释已清除。', '浏览器无法保存。请复制内容留存。', '整段经文笔记'],
    es: ['Lea y anote el pasaje', 'Leer', 'Comprobar lugares', 'Sus notas', 'Versículo actual', 'Anterior', 'Siguiente', 'Ir al versículo', 'Leer este versículo en la Biblia coreana', 'Lea en otra pestaña y vuelva para anotar sus observaciones.', 'Lugares vinculados a este versículo', 'No hay lugares vinculados. Lea y anote libremente.', 'Mencionar un lugar no prueba una visita ni el sitio de un hecho.', 'Ver en el mapa', 'Nota de este versículo', 'Anote lo que dice el texto, la función del lugar y las preguntas pendientes.', 'Guardado automático en este navegador e incluido en la copia completa.', 'Nota guardada.', 'Nota borrada.', 'No se puede guardar en el navegador. Copie su nota.', 'Notas del pasaje completo'],
    th: ['อ่านพระคัมภีร์พร้อมจดบันทึก', 'อ่าน', 'ตรวจสถานที่', 'บันทึกของฉัน', 'ข้อปัจจุบัน', 'ข้อก่อน', 'ข้อถัดไป', 'ไปยังข้อ', 'อ่านข้อนี้ในพระคัมภีร์ภาษาเกาหลี', 'อ่านในแท็บใหม่แล้วกลับมาจดสิ่งที่สังเกต', 'สถานที่ที่เชื่อมกับข้อนี้', 'ข้อนี้ไม่มีสถานที่ที่เชื่อมโยง อ่านและจดได้ตามต้องการ', 'การกล่าวถึงสถานที่ไม่ได้ยืนยันว่ามีการเดินทางหรือเหตุการณ์เกิดขึ้นที่นั่น', 'ดูบนแผนที่', 'บันทึกสำหรับข้อนี้', 'จดสิ่งที่ข้อความกล่าว บทบาทของสถานที่ และคำถามที่ต้องตรวจ', 'บันทึกอัตโนมัติในเบราว์เซอร์นี้และรวมในไฟล์สำรอง', 'บันทึกข้อแล้ว', 'ลบบันทึกแล้ว', 'ไม่สามารถบันทึกในเบราว์เซอร์ โปรดคัดลอกข้อความ', 'บันทึกภาพรวมตอนพระคัมภีร์'],
    hi: ['पाठ पढ़ें और टिप्पणी लिखें', 'पढ़ें', 'स्थान जाँचें', 'मेरी टिप्पणी', 'वर्तमान पद', 'पिछला पद', 'अगला पद', 'पद चुनें', 'कोरियाई बाइबल में यह पद पढ़ें', 'नए टैब में पढ़कर लौटें और अपना अवलोकन लिखें।', 'इस पद से जुड़े स्थान', 'इस पद से कोई स्थान नहीं जुड़ा। पाठ पढ़कर स्वतंत्र रूप से लिखें।', 'किसी स्थान का उल्लेख यात्रा या घटना का स्थान सिद्ध नहीं करता।', 'मानचित्र पर देखें', 'इस पद की टिप्पणी', 'पाठ में तथ्य, स्थान की भूमिका और जाँचने वाले प्रश्न लिखें।', 'इस ब्राउज़र में स्वतः सुरक्षित; पूरे बैकअप में शामिल।', 'पद की टिप्पणी सहेजी गई।', 'टिप्पणी मिटाई गई।', 'ब्राउज़र में सहेजना उपलब्ध नहीं। अपना पाठ कॉपी करें।', 'पूरे अंश की टिप्पणियाँ'],
    fr: ['Lire et annoter le passage', 'Lire', 'Vérifier les lieux', 'Mes notes', 'Verset actuel', 'Verset précédent', 'Verset suivant', 'Aller au verset', 'Lire ce verset dans la Bible coréenne', 'Lisez dans un nouvel onglet, puis revenez noter vos observations.', 'Lieux liés à ce verset', 'Aucun lieu associé. Lisez et notez librement.', 'La mention d’un lieu ne prouve ni une visite ni le lieu d’un événement.', 'Voir sur la carte', 'Note sur ce verset', 'Notez les faits du texte, le rôle du lieu et les questions à vérifier.', 'Enregistrement automatique dans ce navigateur, inclus dans la sauvegarde complète.', 'Note enregistrée.', 'Note effacée.', 'Stockage indisponible. Copiez votre note.', 'Notes sur l’ensemble du passage'],
    de: ['Abschnitt lesen und kommentieren', 'Lesen', 'Orte prüfen', 'Meine Notizen', 'Aktueller Vers', 'Vorheriger Vers', 'Nächster Vers', 'Zu Vers springen', 'Diesen Vers in der koreanischen Bibel lesen', 'Lesen Sie in einem neuen Tab und notieren Sie danach Ihre Beobachtungen.', 'Mit diesem Vers verknüpfte Orte', 'Kein Ort ist verknüpft. Lesen und notieren Sie frei.', 'Die Erwähnung eines Ortes belegt weder einen Besuch noch einen Schauplatz.', 'Auf Karte zeigen', 'Notiz zu diesem Vers', 'Notieren Sie Textbeobachtungen, die Rolle eines Ortes und offene Fragen.', 'Automatisch in diesem Browser gespeichert und in der Gesamtsicherung enthalten.', 'Versnotiz gespeichert.', 'Notiz gelöscht.', 'Browserspeicher nicht verfügbar. Kopieren Sie Ihre Notiz.', 'Notizen zum ganzen Abschnitt'],
  };
  const [title, read, places, annotate, current, previous, next, jump, openBible, readingHelp, versePlaces, noPlaces, caution, showMap, noteTitle, notePlaceholder, autosave, saved, cleared, storageError, passageNotes] = messages[locale] || messages.en;
  const savedVerseCount = {
    ko: '저장된 절별 메모 {count}개', en: '{count} saved verse notes', ja: '保存した節の注記 {count}件',
    'zh-CN': '已保存 {count} 条经节注释', es: '{count} notas de versículos guardadas',
    th: 'บันทึกข้อที่บันทึกไว้ {count} รายการ', hi: '{count} पद टिप्पणियाँ सुरक्षित',
    fr: '{count} notes de versets enregistrées', de: '{count} Versnotizen gespeichert',
  };
  return { title, read, places, annotate, current, previous, next, jump, openBible, readingHelp, versePlaces, noPlaces, caution, showMap, noteTitle, notePlaceholder, autosave, saved, cleared, storageError, passageNotes, savedVerseCount: savedVerseCount[locale] || savedVerseCount.en };
}
