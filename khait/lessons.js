// Khait – Inhalte. Eine Schulwoche = ein Stickmotiv. Neue Woche: Eintrag unten anhängen.
// motif: 13x13 Kreuzstiche. R rot, K indigo, G oliv, Y safran, P rosa, . leer
// threads: fünf Fäden (Übungen) pro Woche, Reihenfolge = empfohlene Reihenfolge über die Woche
// Arabisch der Schul-Inhalte folgt dem Buch (Hocharabisch). Bitte gegenlesen.
const KHAIT_LESSONS = [
  {
    id: 'alif', letter: 'alif', date: '2026-10-24', word: { ar: 'أَرْنَب', de: 'Hase' },
    topic: null, pages: [],
    threads: ['hoeren', 'finden', 'spuren', 'quiz', 'lehrerin'],
    homework: ['Buchstaben ا üben'],
    talk: [],
    motif: [
      '..R...R......', '..R...R......', '..R...R......', '..RR.RR......', '..RRRRR......',
      '.RRKRRRR.....', '.RRRRRRRRRR..', '..RRRRRRRRRR.', '...RRRRRRRRRP', '...RRRRRRRRR.',
      '...RR.RRR.RR.', '..RRR..RR.RRR', 'GGGGGGGGGGGGG',
    ],
  },
  {
    id: 'ba', letter: 'ba', date: '2026-10-31', word: { ar: 'بُرْتُقَالَة', de: 'Orange' },
    topic: { de: 'Muskeln und Bewegungen', ar: 'العَضَلات وَالحَرَكَات' }, pages: [7, 8],
    threads: ['hoeren', 'punkte', 'spuren', 'bewegung', 'lehrerin'],
    homework: ['ب-Seite im Aktivitätsbuch lösen', 'Über die Bilder sprechen, Thema wiederholen'],
    talk: [
      { de: 'Wie bewegt sich der Hase? Mach es nach!', ar: 'كيف بِيِنُطّ الأَرْنَب؟ اعْمَلي زَيُّه!' },
      { de: 'Kannst du wie ein Affe klettern?', ar: 'بْتِقْدَري تِتْسَلّقي زيّ القِرْد؟' },
    ],
    motif: [
      '......GG.....', '.....GGG.....', '....GGK......', '......K......', '...YYYYYYY...',
      '..YYYYYYYYY..', '.YYYYYYYYYYY.', '.YYYRYYYYYYY.', '.YYRYYYYYYYY.', '.YYYYYYYYYYY.',
      '.YYYYYYYYYYY.', '..YYYYYYYYY..', '...YYYYYYY...',
    ],
  },
  {
    id: 'ta', letter: 'ta', date: '2026-11-07', word: { ar: 'تُفَّاحَة', de: 'Apfel' },
    topic: { de: 'Die fünf Sinne', ar: 'الحَوَاسّ الخَمْس' }, pages: [12, 14],
    threads: ['hoeren', 'punkte', 'spuren', 'sinne', 'lehrerin'],
    homework: ['ت-Seite im Arbeitsheft lösen', 'Über die fünf Sinne sprechen und wiederholen'],
    talk: [
      { de: 'Womit riechst du die Blume?', ar: 'بِشو بِتْشِمّي الوَرْدة؟' },
      { de: 'Wie schmeckt die Zitrone?', ar: 'شو طَعْم اللَّيْمون؟' },
      { de: 'Was ist heiß? Womit spürst du das?', ar: 'شو سُخْن؟ بِشو بْتِحِسّي؟' },
    ],
    motif: [
      '.......K.....', '......KGG....', '......KGGG...', '..RRR.KRRR...', '.RRRRRRRRRR..',
      'RRRRRRRRRRRR.', 'RRPRRRRRRRRR.', 'RPRRRRRRRRRR.', 'RRRRRRRRRRRR.', 'RRRRRRRRRRRR.',
      '.RRRRRRRRRR..', '..RRRRRRRR...', '...RR..RR....',
    ],
  },
  {
    id: 'tha', letter: 'tha', date: '2026-11-14', word: { ar: 'ثَعْلَب', de: 'Fuchs' },
    topic: { de: 'Sehsinn', ar: 'حَاسَّةُ البَصَر' }, pages: [15, 16],
    threads: ['hoeren', 'punkte', 'spuren', 'gegensatz', 'lehrerin'],
    homework: ['Buchstaben ث üben', 'ث-Seite im Aktivitätsbuch lösen', 'Über den Sehsinn sprechen und wiederholen'],
    talk: [
      { de: 'Welche Farbe hat dein Pulli?', ar: 'شو لون الكَنْزة تَبَعِك؟' },
      { de: 'Was ist hier groß, was ist klein?', ar: 'شو كبير هون وشو زْغير؟' },
      { de: 'Mach die Augen zu. Was siehst du jetzt?', ar: 'غَمّضي عْيونِك. شو شايْفة هلّأ؟' },
    ],
    note: 'ث wird im Alltag oft wie t oder s gesprochen (ثلاثة → تلاتة). Die Schule übt das „th“ wie im englischen „think“.',
    motif: [
      'Y...........Y', 'YY.........YY', 'YYY.......YYY', 'YYYY.....YYYY', 'YYYYYYYYYYYYY',
      'YYYYYYYYYYYYY', 'YYKYYYYYYYKYY', '.YYYYYYYYYYY.', '.PPYYYYYYYPP.', '..PPPYYYPPP..',
      '...PPPKPPP...', '....PPKPP....', '.....PPP.....',
    ],
  },
];
// Was als Nächstes in der Schule kommt (leere Felder auf dem Tuch)
const KHAIT_NEXT = ['ج', 'ح', 'خ', 'د'];
// Gegensätze aus dem Buch (S. 16)
const KHAIT_PAIRS = [
  { id: 'gross', ar: 'كَبِير', de: 'groß', kind: 'size', pick: 'big' },
  { id: 'klein', ar: 'صَغِير', de: 'klein', kind: 'size', pick: 'small' },
  { id: 'lang', ar: 'طَوِيل', de: 'lang', kind: 'length', pick: 'big' },
  { id: 'kurz', ar: 'قَصِير', de: 'kurz', kind: 'length', pick: 'small' },
];
