// Arnab – Inhalte. Eine Einheit = ein Buchstabe, immer dieselben vier Schritte.
// Ankerwörter: konkretes Nomen, beginnt mit dem Buchstaben, Schulform (Hocharabisch). Bitte gegenlesen.
// key = Schlüssel der Eltern-Aufnahme aus der bisherigen App (falls vorhanden), sonst Sprachausgabe.
const AR_UNITS = [
  { id: 'alif', letter: 'alif', sound: 'أَ', scene: 'hase', words: [
    { id: 'hase', ar: 'أَرْنَب', de: 'Hase', art: 'tiere/hase', key: 'tiere/hase' },
    { id: 'loewe', ar: 'أَسَد', de: 'Löwe', art: 'tiere/loewe', key: 'tiere/loewe' },
    { id: 'ananas', ar: 'أَنَانَاس', de: 'Ananas', art: 'a/ananas' },
    { id: 'mama', ar: 'أُمّ', de: 'Mama', art: 'a/mama' },
  ] },
  { id: 'ba', letter: 'ba', sound: 'بَ', scene: 'farben', words: [
    { id: 'haus', ar: 'بَيْت', de: 'Haus', art: 'wort/haus', key: 'wort/wort/haus' },
    { id: 'ente', ar: 'بَطَّة', de: 'Ente', art: 'tiere/ente', key: 'tiere/ente' },
    { id: 'tuer', ar: 'بَاب', de: 'Tür', art: 'a/tuer' },
    { id: 'kuh', ar: 'بَقَرَة', de: 'Kuh', art: 'tiere/kuh', key: 'tiere/kuh' },
  ] },
  { id: 'ta', letter: 'ta', sound: 'تَ', scene: 'apfel', words: [
    { id: 'apfel', ar: 'تُفَّاحَة', de: 'Apfel', art: 'essen/apfel', key: 'essen/apfel' },
    { id: 'datteln', ar: 'تَمْر', de: 'Datteln', art: 'a/datteln' },
    { id: 'krone', ar: 'تَاج', de: 'Krone', art: 'a/krone' },
    { id: 'krokodil', ar: 'تِمْسَاح', de: 'Krokodil', art: 'a/krokodil' },
  ] },
  { id: 'tha', letter: 'tha', sound: 'ثَ', scene: 'fuchs', words: [
    { id: 'fuchs', ar: 'ثَعْلَب', de: 'Fuchs', art: 'wort/fuchs', key: 'wort/wort/fuchs' },
    { id: 'schnee', ar: 'ثَلْج', de: 'Schnee', art: 'a/schnee' },
    { id: 'stier', ar: 'ثَوْر', de: 'Stier', art: 'a/stier' },
    { id: 'drei', ar: 'ثَلَاثَة', de: 'drei', art: 'a/drei' },
  ] },
];
const AR_NEXT = ['ج', 'ح', 'خ'];
// Jeder Buchstabe hat beim Ausmalen immer dieselbe Farbe (ids aus der Kategorie „Farben").
const AR_KEY = { alif: 'braun', ba: 'rot', ta: 'gruen', tha: 'orange' };
// Themen aus der bisherigen App: Schauen → Hören → Malen
const AR_THEMES = ['farben', 'zahlen', 'tiere', 'essen', 'gefuehle', 'sinne', 'bewegung'];

// Ausmalbilder. regions: [id, Pfad, Grundfarbe]; letters: Fläche → Buchstabe (diese Flächen haben eine feste Farbe).
// 'farben' ist das Haus-Bild der bisherigen App; hier steht nur, welche Flächen einen Buchstaben tragen.
const AR_SCENES = (() => {
  const W = '#FFFBF2', RECT = 'M0 0 L140 0 L140 100 L0 100 Z';
  const E = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  const Ci = (cx, cy, r) => E(cx, cy, r, r);
  const apple = (x) => `M${x + 26} 42 C${x + 10} 32 ${x - 4} 46 ${x} 62 C${x + 4} 80 ${x + 18} 84 ${x + 26} 78 C${x + 34} 84 ${x + 48} 80 ${x + 52} 62 C${x + 56} 46 ${x + 42} 32 ${x + 26} 42 Z`;
  const stem = (x) => `M${x + 24} 42 L${x + 26} 27 L${x + 30} 28 L${x + 28} 42 Z`;
  const leaf = (x) => `M${x + 29} 31 Q${x + 42} 18 ${x + 48} 29 Q${x + 38} 38 ${x + 29} 31 Z`;
  return {
    hase: {
      regions: [
        ['sky', RECT, '#F3F8FC'], ['sun', Ci(118, 20, 11), W], ['grass', 'M0 78 Q35 70 70 78 T140 76 L140 100 L0 100 Z', W],
        ['ear1', 'M52 42 Q43 8 56 6 Q67 10 63 42 Z', W], ['inner1', 'M55 36 Q51 16 57 13 Q61 18 59 36 Z', W],
        ['ear2', 'M77 42 Q73 10 84 6 Q97 8 88 42 Z', W], ['inner2', 'M81 36 Q79 17 84 13 Q89 17 85 36 Z', W],
        ['tail', Ci(94, 84, 6), W], ['body', E(70, 78, 22, 17), W], ['head', E(70, 51, 21, 17), W],
        ['carrot', 'M104 84 L128 77 L106 72 Z', W], ['green', 'M105 78 Q95 68 98 80 Q92 86 105 78 Z', W],
      ],
      deco: '<circle cx="62" cy="49" r="2.4" fill="#2B2F3B"/><circle cx="78" cy="49" r="2.4" fill="#2B2F3B"/><path d="M68 55 L72 55 L70 58 Z"/><path d="M70 58 Q66 62 63 59 M70 58 Q74 62 77 59"/>',
      letters: { head: 'alif', body: 'alif', ear1: 'alif', ear2: 'alif' },
    },
    farben: { letters: { roof: 'ba', door: 'ba', trunk: 'alif' } },
    apfel: {
      regions: [
        ['wall', RECT, '#F6F1E8'], ['window', 'M98 8 L132 8 L132 34 L98 34 Z', W], ['table', 'M0 76 L140 76 L140 100 L0 100 Z', W],
        ['apple1', apple(10), W], ['stem1', stem(10), W], ['leaf1', leaf(10), W],
        ['apple2', apple(74), W], ['stem2', stem(74), W], ['leaf2', leaf(74), W],
      ],
      deco: '<path d="M115 8 L115 34 M98 21 L132 21"/><path d="M22 54 Q24 48 30 46"/><path d="M86 54 Q88 48 94 46"/>',
      letters: { apple1: 'ta', leaf1: 'ta', apple2: 'ba', leaf2: 'ta', stem1: 'alif', stem2: 'alif' },
    },
    fuchs: {
      regions: [
        ['sky', RECT, '#F3F8FC'], ['ground', 'M0 84 Q40 78 80 84 T140 82 L140 100 L0 100 Z', W],
        ['bush', 'M0 86 Q2 60 16 64 Q24 50 34 64 Q46 62 44 86 Z', W], ['tail', 'M102 86 Q130 84 128 54 Q112 60 106 74 Z', W],
        ['ear1', 'M46 42 L42 10 L66 30 Z', W], ['ear2', 'M94 42 L98 10 L74 30 Z', W],
        ['face', 'M40 38 Q70 22 100 38 Q104 60 70 88 Q36 60 40 38 Z', W],
        ['cheek1', 'M41 47 Q58 56 70 88 Q40 66 41 47 Z', W], ['cheek2', 'M99 47 Q82 56 70 88 Q100 66 99 47 Z', W],
        ['nose', Ci(70, 83, 5), W], ['ball', Ci(22, 92, 6), W],
      ],
      deco: '<circle cx="58" cy="47" r="2.6" fill="#2B2F3B"/><circle cx="82" cy="47" r="2.6" fill="#2B2F3B"/>',
      letters: { face: 'tha', ear1: 'tha', ear2: 'tha', tail: 'tha', nose: 'alif', bush: 'ta', ball: 'ba' },
    },
  };
})();

// Für den Zusammen-Modus: Ideen zum Sprechen ohne Bildschirm
const AR_TALK = {
  alif: ['Sucht drei Dinge im Zimmer, deren Name mit „a" anfängt.', 'Hüpft wie ein Hase: أَرْنَب!'],
  ba: ['Geht durch die Wohnung: Wo ist eine Tür? بَاب!', 'Wer macht „muh"? بَقَرَة.'],
  ta: ['Legt einen Apfel und eine Dattel hin: Was ist تُفَّاحَة, was ist تَمْر?', 'Bastelt eine Krone: تَاج.'],
  tha: ['Zählt bis drei: وَاحِد، اِثْنَان، ثَلَاثَة.', 'Zunge zwischen die Zähne: „th" wie in ثَلْج.'],
};
