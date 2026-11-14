// Schulwochen der arabischen Schule. Neue Woche = neuer Eintrag OBEN (die erste Woche ist „Diese Woche").
// units: 'letter:<id>' (Buchstabe: Seite → Nachspuren → Such den Buchstaben)
//        'category:<id>' (Kategorie: Lernen → Finden)
//        'game:<kategorie>/<spiel>' (ein Spiel). Unbekannte Einheiten werden übersprungen.
// homework type: 'letter-practice' (hakt sich ab, wenn die Buchstaben-Station fertig ist), 'offline', 'talk'.
// Datumsangaben der Wochen 0–2 sind aus der Reihenfolge abgeleitet (Platzhalter).
const LESSONS = [
  {
    id: 'w3-tha', date: '2026-11-14', letter: 'tha',
    topic: { de: 'Sehsinn', ar: 'حَاسَّةُ البَصَر' }, bookPages: [15, 16],
    homework: [
      { id: 'hw1', de: 'Buchstaben ث üben', type: 'letter-practice' },
      { id: 'hw2', de: 'ث-Seite im Aktivitätsbuch lösen', type: 'offline' },
      { id: 'hw3', de: 'Über den Sehsinn sprechen und wiederholen', type: 'talk' },
    ],
    units: ['letter:tha', 'category:farben', 'category:gegensaetze'],
    talk: 'sehsinn', note: 'Im Unterricht: Film Timon und Pumbaa',
    hint: 'ث wird im Alltagsdialekt oft wie t oder s gesprochen (ثلاثة → تلاتة). In der App gilt die Aussprache aus dem Buch: „th".',
  },
  {
    id: 'w2-ta', date: '2026-11-07', letter: 'ta',
    topic: { de: 'Die fünf Sinne', ar: 'الحَوَاسّ الخَمْس' }, bookPages: [12, 14],
    homework: [
      { id: 'hw1', de: 'ت-Seite im Arbeitsheft lösen', type: 'offline' },
      { id: 'hw2', de: 'Über die fünf Sinne sprechen und wiederholen', type: 'talk' },
    ],
    units: ['letter:ta', 'category:sinne', 'game:sinne/sinn'],
    talk: 'sinne',
  },
  {
    id: 'w1-ba', date: '2026-10-31', letter: 'ba',
    topic: { de: 'Muskeln und Bewegungen', ar: 'العَضَلات وَالحَرَكَات' }, bookPages: [7, 8],
    homework: [
      { id: 'hw1', de: 'ب-Seite im Aktivitätsbuch lösen', type: 'offline' },
      { id: 'hw2', de: 'Über die Bilder sprechen, Thema wiederholen', type: 'talk' },
    ],
    units: ['letter:ba', 'category:bewegung'],
    talk: 'bewegung',
  },
  {
    // Annahme: erster Buchstabe. Thema dieser Woche unbekannt.
    id: 'w0-alif', date: '2026-10-24', letter: 'alif',
    topic: null, bookPages: [],
    homework: [{ id: 'hw1', de: 'Buchstaben ا üben', type: 'letter-practice' }],
    units: ['letter:alif'], talk: null,
  },
];

// Gesprächsfragen für Eltern („Sprecht mit den Kindern über …"). Arabisch = Dialekt, bitte gegenlesen.
const TALK = {
  sinne: [
    { de: 'Womit riechst du die Blume?', ar: 'بِشو بِتْشِمّي الوَرْدة؟' },
    { de: 'Wie schmeckt die Zitrone?', ar: 'شو طَعْم اللَّيْمون؟' },
    { de: 'Womit hörst du das Radio?', ar: 'بِشو بْتِسْمَعي الرّاديو؟' },
    { de: 'Was ist heiß? Womit spürst du das?', ar: 'شو سُخْن؟ بِشو بْتِحِسّي؟' },
  ],
  sehsinn: [
    { de: 'Welche Farbe hat dein Pulli?', ar: 'شو لون الكَنْزة تَبَعِك؟' },
    { de: 'Was ist hier groß, was ist klein?', ar: 'شو كبير هون وشو زْغير؟' },
    { de: 'Mach die Augen zu. Was siehst du jetzt?', ar: 'غَمّضي عْيونِك. شو شايْفة هلّأ؟' },
  ],
  bewegung: [
    { de: 'Wie bewegt sich der Hase? Mach es nach!', ar: 'كيف بِيِنُطّ الأَرْنَب؟ اعْمَلي زَيُّه!' },
    { de: 'Kannst du wie ein Affe klettern?', ar: 'بْتِقْدَري تِتْسَلّقي زيّ القِرْد؟' },
  ],
};
