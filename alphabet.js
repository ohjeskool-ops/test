// Das arabische Alphabet: 28 Buchstaben mit Namen, Laut, Beispielwörtern.
// Wörter aus den Kategorien werden per pick() eingebunden (inkl. Aufnahmen), neue Wörter per nw().
// ACHTUNG, bitte gegenlesen: Lautschrift der Buchstaben und Laute sind ein Vorschlag (deutsch gelesen).
// join = verbindet sich mit dem folgenden Buchstaben; group = ähnlich aussehende Buchstaben (für das Üben).
const ALPHABET = (() => {
  const pick = (cat, id, art) => {
    const c = CATEGORIES.find((x) => x.id === cat);
    const it = [...c.items, ...(c.extra || [])].find((x) => x.id === id);
    return { ar: it.ar, tr: it.tr, de: it.de, art: art || `${cat}/${id}`, cat, itemId: id };
  };
  const nw = (ar, tr, de, art) => ({ ar, tr, de, art: 'wort/' + art });
  const L = (id, ch, name, tr, snd, join, group, words) => ({ id, ch, name, tr, snd, join, group, words });
  return [
    L('alif', 'ا', 'أَلِف', 'alif', 'a', false, 'alif', [pick('tiere', 'hase'), pick('tiere', 'loewe'), pick('sinne', 'ohr')]),
    L('ba', 'ب', 'بَاء', 'ba', 'b', true, 'bt', [nw('بَبَّغَاء', 'babbagha’', 'Papagei', 'papagei'), pick('tiere', 'ente'), pick('tiere', 'kuh'), pick('essen', 'ei'), nw('بَيْت', 'bait', 'Haus', 'haus')]),
    L('ta', 'ت', 'تَاء', 'ta', 't', true, 'bt', [pick('essen', 'apfel'), pick('sinne', 'fernseher', 'dinge/fernseher'), pick('gefuehle', 'muede')]),
    L('tha', 'ث', 'ثَاء', 'tha', 'th (wie englisch „think")', true, 'bt', [nw('ثَعْلَب', 'thaʿlab', 'Fuchs', 'fuchs')]),
    L('dschim', 'ج', 'جِيم', 'dschim', 'dsch', true, 'jh', [pick('essen', 'karotte'), pick('essen', 'kaese')]),
    L('ha', 'ح', 'حَاء', 'ha', 'h (tief, gehaucht)', true, 'jh', [pick('tiere', 'pferd'), pick('essen', 'milch'), pick('gefuehle', 'traurig')]),
    L('cha', 'خ', 'خَاء', 'cha', 'ch (wie in „Bach")', true, 'jh', [pick('tiere', 'schaf'), pick('essen', 'brot'), pick('gefuehle', 'aengstlich')]),
    L('dal', 'د', 'دَال', 'dal', 'd', false, 'dz', [pick('tiere', 'huhn')]),
    L('dhal', 'ذ', 'ذَال', 'dhal', 'dh (wie englisch „this")', false, 'dz', [nw('ذُرَة', 'dhura', 'Mais', 'mais')]),
    L('ra', 'ر', 'رَاء', 'ra', 'r (gerollt)', false, 'rz', [nw('رُمَّان', 'rummane', 'Granatapfel', 'granatapfel'), pick('sinne', 'radio', 'dinge/radio')]),
    L('sai', 'ز', 'زَاي', 'sai', 's (stimmhaft, wie „Sonne")', false, 'rz', [pick('sinne', 'blume', 'dinge/blume')]),
    L('sin', 'س', 'سِين', 'ßin', 'ß (wie „Straße")', true, 'ss', [pick('tiere', 'fisch')]),
    L('schin', 'ش', 'شِين', 'schin', 'sch', true, 'ss', [nw('شَمْس', 'schams', 'Sonne', 'sonne')]),
    L('ssad', 'ص', 'صَاد', 'ßad', 'ß (dumpf)', true, 'sd', [nw('صَارُوخ', 'ßaruch', 'Rakete', 'rakete')]),
    L('dad', 'ض', 'ضَاد', 'dad', 'd (dumpf)', true, 'sd', [nw('ضِفْدَع', 'difdaʿ', 'Frosch', 'frosch')]),
    L('ta2', 'ط', 'طَاء', 'ta', 't (dumpf)', true, 'tz', [nw('طَائِرَة', 'ta’ira', 'Flugzeug', 'flugzeug')]),
    L('dha', 'ظ', 'ظَاء', 'dha', 'dh (dumpf)', true, 'tz', [nw('ظَرْف', 'dharf', 'Briefumschlag', 'briefumschlag')]),
    L('ain', 'ع', 'عَيْن', 'ʿain', 'ʿ (Kehllaut)', true, 'ag', [pick('sinne', 'auge'), pick('essen', 'trauben'), pick('tiere', 'vogel')]),
    L('ghain', 'غ', 'غَيْن', 'ghain', 'gh (wie Pariser „r")', true, 'ag', [nw('غَيْمَة', 'ghaima', 'Wolke', 'wolke')]),
    L('fa', 'ف', 'فَاء', 'fa', 'f', true, 'fq', [pick('tiere', 'elefant'), pick('essen', 'erdbeere'), pick('gefuehle', 'froh'), pick('sinne', 'mund')]),
    L('qaf', 'ق', 'قَاف', 'qaf', 'q (tiefes „k")', true, 'fq', [nw('قِرْد', 'qird', 'Affe', 'affe'), nw('قَمَر', 'qamar', 'Mond', 'mond')]),
    L('kaf', 'ك', 'كَاف', 'kaf', 'k', true, 'kaf', [pick('tiere', 'hund')]),
    L('lam', 'ل', 'لَام', 'lam', 'l', true, 'lam', [pick('sinne', 'zitrone', 'dinge/zitrone')]),
    L('mim', 'م', 'مِيم', 'mim', 'm', true, 'mim', [pick('essen', 'banane'), pick('essen', 'wasser'), pick('gefuehle', 'krank')]),
    L('nun', 'ن', 'نُون', 'nun', 'n', true, 'bt', [pick('sinne', 'feuer', 'dinge/feuer')]),
    L('ha2', 'ه', 'هَاء', 'ha', 'h', true, 'ha2', [nw('هِلَال', 'hilal', 'Mondsichel', 'hilal')]),
    L('wau', 'و', 'وَاو', 'wau', 'w', false, 'wau', [nw('وَرْدَة', 'warda', 'Rose', 'rose')]),
    L('ja', 'ي', 'يَاء', 'ja', 'j (wie „Jahr")', true, 'bt', [pick('sinne', 'hand')]),
  ];
})();
