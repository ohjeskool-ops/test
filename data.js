// Inhalte der App. Hier kannst du Wörter ändern, ergänzen oder entfernen.
// ar = Arabisch mit Vokalzeichen (palästinensischer Dialekt), tr = Lautschrift (deutsch gelesen), de = Deutsch
// Lautschrift: ch = خ, dsch = ج, ' = Stimmabsatz (ء/ق städtisch), ' vor Vokal am Anfang = ع
// Bei den Gefühlen stehen die weiblichen Formen (für deine Tochter).
const CATEGORIES = [
  {
    id: 'farben', de: 'Farben', ar: 'أَلْوَان', icon: '🎨', tint: '#F6D6C9', type: 'color',
    items: [
      { id: 'rot', ar: 'أَحْمَر', tr: 'ahmar', de: 'rot', color: '#E53935' },
      { id: 'blau', ar: 'أَزْرَق', tr: 'asra’', de: 'blau', color: '#1E88E5' },
      { id: 'gelb', ar: 'أَصْفَر', tr: 'asfar', de: 'gelb', color: '#FDD835' },
      { id: 'gruen', ar: 'أَخْضَر', tr: 'achdar', de: 'grün', color: '#43A047' },
      { id: 'orange', ar: 'بُرْتُقَالِي', tr: 'burtu’ali', de: 'orange', color: '#FB8C00' },
      { id: 'lila', ar: 'بَنَفْسَجِي', tr: 'banafsadschi', de: 'lila', color: '#8E24AA' },
      { id: 'rosa', ar: 'وَرْدِي', tr: 'wardi', de: 'rosa', color: '#F48FB1' },
      { id: 'weiss', ar: 'أَبْيَض', tr: 'abyad', de: 'weiß', color: '#FFFFFF' },
      { id: 'schwarz', ar: 'أَسْوَد', tr: 'aswad', de: 'schwarz', color: '#212121' },
      { id: 'braun', ar: 'بُنِّي', tr: 'bunni', de: 'braun', color: '#795548' },
    ],
  },
  {
    id: 'zahlen', de: 'Zahlen', ar: 'أَرْقَام', icon: '🔢', tint: '#D5E5F2', type: 'number',
    items: [
      { id: '1', ar: 'وَاحَد', tr: 'wahed', de: 'eins', n: 1, digit: '١' },
      { id: '2', ar: 'اِتْنَيْن', tr: 'itnen', de: 'zwei', n: 2, digit: '٢' },
      { id: '3', ar: 'تَلَاتَة', tr: 'talate', de: 'drei', n: 3, digit: '٣' },
      { id: '4', ar: 'أَرْبَعَة', tr: 'arbaʿa', de: 'vier', n: 4, digit: '٤' },
      { id: '5', ar: 'خَمْسَة', tr: 'chamse', de: 'fünf', n: 5, digit: '٥' },
      { id: '6', ar: 'سِتَّة', tr: 'sitte', de: 'sechs', n: 6, digit: '٦' },
      { id: '7', ar: 'سَبْعَة', tr: 'sabʿa', de: 'sieben', n: 7, digit: '٧' },
      { id: '8', ar: 'تَمَانْيَة', tr: 'tamanje', de: 'acht', n: 8, digit: '٨' },
      { id: '9', ar: 'تِسْعَة', tr: 'tisʿa', de: 'neun', n: 9, digit: '٩' },
      { id: '10', ar: 'عَشْرَة', tr: 'ʿaschra', de: 'zehn', n: 10, digit: '١٠' },
    ],
  },
  {
    id: 'tiere', de: 'Tiere', ar: 'حَيَوَانَات', icon: '🦁', tint: '#F7E3B5', type: 'emoji',
    items: [
      { id: 'katze', ar: 'بِسِّي', tr: 'bissi', de: 'Katze', emoji: '🐱' },
      { id: 'hund', ar: 'كَلْب', tr: 'kalb', de: 'Hund', emoji: '🐶' },
      { id: 'pferd', ar: 'حِصَان', tr: 'hisan', de: 'Pferd', emoji: '🐴' },
      { id: 'kuh', ar: 'بَقَرَة', tr: 'ba’ara', de: 'Kuh', emoji: '🐮' },
      { id: 'schaf', ar: 'خَرُوف', tr: 'charuf', de: 'Schaf', emoji: '🐑' },
      { id: 'huhn', ar: 'دَجَاجَة', tr: 'dschadsche', de: 'Huhn', emoji: '🐔' },
      { id: 'ente', ar: 'بَطَّة', tr: 'batte', de: 'Ente', emoji: '🦆' },
      { id: 'fisch', ar: 'سَمَكَة', tr: 'samake', de: 'Fisch', emoji: '🐟' },
      { id: 'vogel', ar: 'عُصْفُور', tr: 'ʿusfur', de: 'Vogel', emoji: '🐦' },
      { id: 'elefant', ar: 'فِيل', tr: 'fil', de: 'Elefant', emoji: '🐘' },
      { id: 'loewe', ar: 'أَسَد', tr: 'asad', de: 'Löwe', emoji: '🦁' },
      { id: 'hase', ar: 'أَرْنَب', tr: 'arnab', de: 'Hase', emoji: '🐰' },
    ],
  },
  {
    id: 'essen', de: 'Essen', ar: 'أَكْل', icon: '🍎', tint: '#D8EBC8', type: 'emoji',
    items: [
      { id: 'apfel', ar: 'تُفَّاحَة', tr: 'tuffahe', de: 'Apfel', emoji: '🍎' },
      { id: 'banane', ar: 'مَوْزَة', tr: 'moze', de: 'Banane', emoji: '🍌' },
      { id: 'orange', ar: 'بُرْتُقَالَة', tr: 'burtu’ale', de: 'Orange', emoji: '🍊' },
      { id: 'trauben', ar: 'عِنَب', tr: 'ʿinab', de: 'Trauben', emoji: '🍇' },
      { id: 'erdbeere', ar: 'فَرَاوْلَة', tr: 'farawle', de: 'Erdbeere', emoji: '🍓' },
      { id: 'brot', ar: 'خُبْز', tr: 'chubs', de: 'Brot', emoji: '🍞' },
      { id: 'milch', ar: 'حَلِيب', tr: 'halib', de: 'Milch', emoji: '🥛' },
      { id: 'wasser', ar: 'مَيّ', tr: 'mai', de: 'Wasser', emoji: '💧' },
      { id: 'kaese', ar: 'جِبْنَة', tr: 'dschibne', de: 'Käse', emoji: '🧀' },
      { id: 'ei', ar: 'بَيْضَة', tr: 'beda', de: 'Ei', emoji: '🥚' },
      { id: 'karotte', ar: 'جَزَر', tr: 'dschasar', de: 'Karotte', emoji: '🥕' },
      { id: 'tomate', ar: 'بَنْدُورَة', tr: 'bandura', de: 'Tomate', emoji: '🍅' },
    ],
  },
  {
    id: 'gefuehle', de: 'Gefühle', ar: 'مَشَاعِر', icon: '😊', tint: '#E6D5EE', type: 'emoji',
    items: [
      { id: 'froh', ar: 'فَرْحَانَة', tr: 'farhane', de: 'glücklich', emoji: '😊' },
      { id: 'traurig', ar: 'حَزِينَة', tr: 'hasine', de: 'traurig', emoji: '😢' },
      { id: 'wuetend', ar: 'غَضْبَانَة', tr: 'ghadbane', de: 'wütend', emoji: '😠' },
      { id: 'aengstlich', ar: 'خَايْفَة', tr: 'chaife', de: 'ängstlich', emoji: '😨' },
      { id: 'ueberrascht', ar: 'مُسْتَغْرِبَة', tr: 'mustaghribe', de: 'überrascht', emoji: '😮' },
      { id: 'muede', ar: 'تَعْبَانَة', tr: 'taʿbane', de: 'müde', emoji: '😴' },
      { id: 'hungrig', ar: 'جَوْعَانَة', tr: 'dschaʿane', de: 'hungrig', emoji: '🤤' },
      { id: 'krank', ar: 'مَرِيضَة', tr: 'mariede', de: 'krank', emoji: '🤒' },
    ],
  },
];
