/* Handgezeichnete Motive (Sketch & Scribble): Tuschelinie + leicht versetzte Farbfläche.
   Jedes Motiv ist eine Liste von Zeichen-Befehlen auf einer 100x100-Fläche:
   ['s', pfad, farbe]  Fläche mit Umriss      ['l', pfad]       nur Linie
   ['d', x, y, r]      Punkt (Auge)           ['c', pfad, farbe] nur Farbe (Wangen)
   ['h', pfad]         heller Glanzstrich     ['t', x, y, größe, text] Schrift        */
(() => {
  const INK = '#2B2F3B';
  const ORANGE = '#F4A046', SAND = '#F2C879', CREAM = '#FFF3DC', PINK = '#F4A6B8', BLUE = '#8EC5E8';
  const GREEN = '#7DBB6B', RED = '#E0524B', YELLOW = '#F7D154', BROWN = '#A9795A', GREY = '#C9C3CF', WHITE = '#FFFFFF';

  const E = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  const Ci = (cx, cy, r) => E(cx, cy, r, r);
  const poly = (...p) => { let d = ''; for (let i = 0; i < p.length; i += 2) d += (i ? ' L' : 'M') + p[i] + ' ' + p[i + 1]; return d + ' Z'; };
  function scallop(cx, cy, r, n, b) {
    const pt = (i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    const p0 = pt(0);
    let d = `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}`;
    for (let i = 1; i <= n; i++) { const p = pt(i % n); d += ` A${b} ${b} 0 0 1 ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }
    return d + ' Z';
  }

  /* ---------- Gesichter für die Gefühle: immer mit kleiner Schleife ---------- */
  const SKY = '#7EB6E6';
  const face = (color, ...rest) => [
    ['s', Ci(50, 56, 34), color],
    ['s', poly(50, 19, 33, 8, 33, 30), PINK], ['s', poly(50, 19, 67, 8, 67, 30), PINK], ['s', Ci(50, 19, 4.5), PINK],
    ...rest,
  ];

  const ART = {
    /* ---------- Tiere ---------- */
    'tiere/katze': [
      ['s', poly(24, 42, 24, 12, 46, 30), ORANGE], ['s', poly(76, 42, 76, 12, 54, 30), ORANGE],
      ['s', E(50, 58, 31, 27), ORANGE],
      ['l', 'M50 32 L50 40'], ['l', 'M42 34 L43 40'], ['l', 'M58 34 L57 40'],
      ['d', 40, 54, 2.8], ['d', 60, 54, 2.8],
      ['s', poly(46, 62, 54, 62, 50, 67), PINK],
      ['l', 'M50 67 Q45 73 40 69'], ['l', 'M50 67 Q55 73 60 69'],
      ['l', 'M30 62 L12 58'], ['l', 'M30 67 L12 69'], ['l', 'M70 62 L88 58'], ['l', 'M70 67 L88 69'],
    ],
    'tiere/hund': [
      ['s', 'M30 34 Q8 36 14 70 Q30 72 36 48 Z', BROWN], ['s', 'M70 34 Q92 36 86 70 Q70 72 64 48 Z', BROWN],
      ['s', E(50, 52, 25, 26), SAND], ['s', E(50, 67, 15, 12), CREAM],
      ['s', E(50, 61, 6, 4), INK],
      ['d', 39, 46, 2.8], ['d', 61, 46, 2.8],
      ['s', E(50, 77, 4.5, 5.5), PINK],
      ['l', 'M50 65 L50 70'], ['l', 'M50 70 Q44 75 39 71'], ['l', 'M50 70 Q56 75 61 71'],
    ],
    'tiere/pferd': [
      ['s', 'M26 92 C26 64 28 42 40 28 L38 8 L50 20 C62 20 74 28 80 44 L90 66 C92 73 85 79 79 76 L68 72 C64 80 58 82 54 84 L52 92 Z', '#C98B5B'],
      ['s', 'M38 10 C24 20 18 42 20 64 C16 76 18 86 24 92 L34 90 C30 66 32 44 42 30 Z', '#7A4B35'],
      ['d', 62, 38, 2.8], ['d', 84, 69, 1.8], ['l', 'M79 76 Q74 74 70 72'],
    ],
    'tiere/kuh': [
      ['s', 'M28 30 Q16 24 18 12 Q30 14 36 26 Z', '#F2E3B8'], ['s', 'M72 30 Q84 24 82 12 Q70 14 64 26 Z', '#F2E3B8'],
      ['s', E(15, 42, 10, 6), PINK], ['s', E(85, 42, 10, 6), PINK],
      ['s', 'M30 28 Q50 20 70 28 Q82 40 78 64 Q74 90 50 92 Q26 90 22 64 Q18 40 30 28 Z', '#FFF8EA'],
      ['s', 'M30 32 Q42 26 48 34 Q46 46 36 48 Q26 44 30 32 Z', '#8A8490'],
      ['s', E(50, 76, 19, 13), PINK], ['d', 43, 76, 2.2], ['d', 57, 76, 2.2],
      ['d', 40, 54, 2.8], ['d', 62, 54, 2.8],
    ],
    'tiere/schaf': [
      ['s', E(26, 62, 9, 5), '#BDB5C6'], ['s', E(74, 62, 9, 5), '#BDB5C6'],
      ['s', scallop(50, 44, 28, 10, 9), '#FFF8EA'],
      ['s', E(50, 64, 16, 20), '#BDB5C6'],
      ['s', scallop(50, 34, 10, 5, 5), '#FFF8EA'],
      ['d', 43, 60, 2.6], ['d', 57, 60, 2.6], ['l', 'M44 76 Q50 80 56 76'],
    ],
    'tiere/huhn': [
      ['s', 'M24 56 Q8 46 12 28 Q26 34 32 50 Z', SAND],
      ['s', E(48, 62, 28, 22), '#FFF8EA'], ['s', 'M34 60 Q48 48 62 62 Q48 74 34 60 Z', SAND],
      ['s', Ci(68, 36, 13), '#FFF8EA'],
      ['s', 'M60 26 Q58 14 65 19 Q67 9 72 17 Q79 14 77 25 Z', RED],
      ['s', poly(79, 35, 93, 39, 79, 43), ORANGE], ['s', E(78, 47, 3, 5), RED], ['d', 70, 33, 2.4],
      ['l', 'M42 84 L42 94'], ['l', 'M56 84 L56 94'], ['l', 'M36 94 L44 94'], ['l', 'M50 94 L58 94'],
    ],
    'tiere/ente': [
      ['s', E(48, 66, 32, 20), YELLOW], ['s', Ci(66, 36, 15), YELLOW],
      ['s', 'M78 38 Q96 38 94 47 Q84 50 78 45 Z', ORANGE], ['d', 68, 32, 2.4],
      ['s', 'M30 66 Q44 54 60 66 Q44 78 30 66 Z', '#F2B84A'],
      ['l', 'M10 90 Q18 84 26 90 Q34 96 42 90 Q50 84 58 90 Q66 96 74 90 Q82 84 90 90'],
    ],
    'tiere/fisch': [
      ['s', 'M42 34 Q50 14 62 36 Z', ORANGE],
      ['s', 'M12 50 Q38 20 68 42 L90 26 Q84 50 90 74 L68 58 Q38 80 12 50 Z', BLUE],
      ['d', 28, 46, 3], ['l', 'M14 52 Q18 54 22 52'], ['l', 'M38 40 Q34 50 38 60'],
      ['l', 'M48 46 Q52 50 48 54'], ['l', 'M56 44 Q60 50 56 56'], ['l', 'M64 46 Q68 50 64 54'],
      ['l', Ci(10, 28, 3)], ['l', Ci(18, 16, 2)],
    ],
    'tiere/vogel': [
      ['s', 'M70 62 L94 76 L92 58 L72 52 Z', '#5FA0C8'],
      ['s', Ci(46, 56, 26), BLUE], ['s', E(40, 68, 14, 9), CREAM],
      ['s', poly(22, 50, 8, 56, 22, 62), ORANGE], ['d', 36, 46, 2.8],
      ['s', 'M48 54 Q66 50 70 66 Q54 74 48 54 Z', '#5FA0C8'],
      ['l', 'M42 82 L42 92'], ['l', 'M52 82 L52 92'], ['l', 'M20 94 L80 94'],
    ],
    'tiere/elefant': [
      ['s', Ci(18, 48, 16), '#D9CBD8'], ['s', Ci(82, 48, 16), '#D9CBD8'],
      ['s', Ci(50, 46, 28), GREY],
      ['s', 'M36 62 Q30 76 38 80 Q38 70 42 62 Z', '#FFF8EA'], ['s', 'M64 62 Q70 76 62 80 Q62 70 58 62 Z', '#FFF8EA'],
      ['s', 'M42 58 Q38 84 50 92 Q60 94 62 84 Q56 86 54 80 Q58 66 58 58 Z', GREY],
      ['d', 40, 42, 2.8], ['d', 60, 42, 2.8], ['l', 'M46 70 L54 70'], ['l', 'M45 78 L53 78'],
    ],
    'tiere/loewe': [
      ['s', Ci(24, 26, 8), ORANGE], ['s', Ci(76, 26, 8), ORANGE],
      ['s', scallop(50, 52, 30, 12, 8), ORANGE],
      ['s', Ci(50, 54, 23), '#FBE29A'],
      ['d', 41, 50, 2.8], ['d', 59, 50, 2.8],
      ['s', poly(45, 58, 55, 58, 50, 64), '#B5654A'],
      ['l', 'M50 64 L50 68'], ['l', 'M50 68 Q44 74 39 69'], ['l', 'M50 68 Q56 74 61 69'],
    ],
    'tiere/hase': [
      ['s', E(38, 26, 9, 22), CREAM], ['s', E(62, 26, 9, 22), CREAM],
      ['c', E(38, 28, 4, 15), PINK], ['c', E(62, 28, 4, 15), PINK],
      ['s', E(50, 68, 25, 22), CREAM],
      ['c', Ci(32, 73, 4), PINK], ['c', Ci(68, 73, 4), PINK],
      ['d', 41, 65, 2.8], ['d', 59, 65, 2.8],
      ['s', poly(47, 72, 53, 72, 50, 75), PINK],
      ['l', 'M50 75 L50 78'], ['l', 'M50 78 Q45 82 42 79'], ['l', 'M50 78 Q55 82 58 79'],
      ['l', 'M30 74 L14 72'], ['l', 'M30 78 L14 82'], ['l', 'M70 74 L86 72'], ['l', 'M70 78 L86 82'],
    ],

    /* ---------- Essen ---------- */
    'essen/apfel': [
      ['l', 'M50 34 Q50 22 56 14'],
      ['s', 'M50 34 C34 24 14 36 18 58 C22 78 38 90 50 84 C62 90 78 78 82 58 C86 36 66 24 50 34 Z', RED],
      ['s', 'M54 26 Q66 12 78 20 Q66 32 54 26 Z', GREEN],
      ['h', 'M28 50 Q30 42 38 40'],
    ],
    'essen/banane': [
      ['s', 'M22 20 C18 58 44 88 86 74 C88 70 86 66 80 66 C52 70 40 50 38 22 Z', YELLOW],
      ['l', 'M22 20 L24 10 L34 12 L38 22'], ['l', 'M50 56 Q62 66 76 68'],
    ],
    'essen/orange': [
      ['s', Ci(50, 56, 30), ORANGE],
      ['s', 'M52 26 Q64 12 76 20 Q64 32 52 26 Z', GREEN],
      ['d', 40, 50, 1.2], ['d', 58, 46, 1.2], ['d', 64, 62, 1.2], ['d', 46, 70, 1.2], ['d', 34, 64, 1.2],
      ['h', 'M30 50 Q32 40 40 36'],
    ],
    'essen/trauben': [
      ['l', 'M52 30 Q54 18 62 12'],
      ['s', 'M56 24 Q70 8 86 18 Q72 30 56 24 Z', GREEN],
      ['s', Ci(30, 44, 11), '#B592D6'], ['s', Ci(52, 40, 11), '#B592D6'], ['s', Ci(72, 46, 11), '#B592D6'],
      ['s', Ci(40, 60, 11), '#B592D6'], ['s', Ci(62, 62, 11), '#B592D6'], ['s', Ci(50, 78, 11), '#B592D6'],
      ['h', 'M26 40 Q28 36 32 36'], ['h', 'M48 36 Q50 32 54 32'],
    ],
    'essen/erdbeere': [
      ['s', 'M50 90 C26 76 14 54 20 40 C26 32 42 34 50 40 C58 34 74 32 80 40 C86 54 74 76 50 90 Z', RED],
      ['s', poly(34, 36, 44, 26, 50, 34, 56, 26, 66, 36, 50, 42), GREEN], ['l', 'M50 30 L50 18'],
      ['d', 36, 54, 1.4], ['d', 50, 58, 1.4], ['d', 64, 54, 1.4], ['d', 43, 68, 1.4], ['d', 57, 68, 1.4], ['d', 50, 78, 1.4],
    ],
    'essen/brot': [
      ['s', 'M14 58 C10 36 30 24 50 24 C70 24 90 36 86 58 C86 68 82 76 76 78 L24 78 C18 76 14 68 14 58 Z', '#E2A55C'],
      ['l', 'M34 38 Q40 46 38 56'], ['l', 'M50 33 Q56 44 54 56'], ['l', 'M66 38 Q72 46 70 56'],
      ['h', 'M22 50 Q24 40 32 34'],
    ],
    'essen/milch': [
      ['s', 'M30 32 L40 14 L60 14 L70 32 Z', BLUE],
      ['s', 'M30 32 L70 32 L70 86 L30 86 Z', '#FFF8EA'],
      ['s', E(50, 60, 12, 11), BLUE],
      ['l', 'M30 44 Q40 40 50 44 Q60 48 70 44'],
    ],
    'essen/wasser': [
      ['s', 'M50 12 C50 12 22 46 22 62 C22 78 34 88 50 88 C66 88 78 78 78 62 C78 46 50 12 50 12 Z', BLUE],
      ['h', 'M34 62 Q34 72 42 77'],
    ],
    'essen/kaese': [
      ['s', 'M12 76 L12 52 L88 36 L88 76 Z', YELLOW],
      ['s', 'M12 52 L38 30 L88 36 Z', '#FBE29A'],
      ['s', Ci(30, 64, 5), '#E5B546'], ['s', Ci(56, 58, 6.5), '#E5B546'], ['s', Ci(74, 68, 4), '#E5B546'], ['s', Ci(46, 70, 3.5), '#E5B546'],
    ],
    'essen/ei': [
      ['s', 'M50 14 C32 14 20 44 22 62 C24 80 36 88 50 88 C64 88 76 80 78 62 C80 44 68 14 50 14 Z', '#FBEBCC'],
      ['d', 42, 66, 1.3], ['d', 58, 58, 1.3], ['d', 50, 74, 1.3],
      ['h', 'M32 56 Q34 42 42 32'],
    ],
    'essen/karotte': [
      ['s', 'M42 30 Q34 12 40 6 Q48 14 48 30 Z', GREEN], ['s', 'M50 30 Q50 10 56 4 Q60 14 54 30 Z', GREEN], ['s', 'M58 30 Q68 14 76 16 Q74 26 62 32 Z', GREEN],
      ['s', 'M28 32 Q50 20 72 32 Q66 64 50 94 Q34 64 28 32 Z', ORANGE],
      ['l', 'M38 46 L46 48'], ['l', 'M54 58 L62 56'], ['l', 'M42 70 L49 72'],
    ],
    'essen/tomate': [
      ['s', E(50, 58, 33, 29), RED],
      ['s', poly(30, 38, 42, 40, 50, 28, 58, 40, 70, 38, 62, 48, 50, 44, 38, 48), GREEN], ['l', 'M50 30 L50 18'],
      ['h', 'M26 56 Q28 46 36 42'],
    ],

    /* ---------- Gefühle ---------- */
    'gefuehle/froh': face('#F7D154',
      ['l', 'M33 50 Q39 42 45 50'], ['l', 'M55 50 Q61 42 67 50'],
      ['s', 'M32 62 Q50 84 68 62 Q50 66 32 62 Z', WHITE],
      ['c', Ci(27, 62, 5), PINK], ['c', Ci(73, 62, 5), PINK]),
    'gefuehle/traurig': face('#BFD9EE',
      ['l', 'M30 42 L44 46'], ['l', 'M70 42 L56 46'], ['d', 38, 52, 2.8], ['d', 62, 52, 2.8],
      ['l', 'M38 74 Q50 64 62 74'], ['s', 'M34 58 Q29 67 34 70 Q39 67 34 58 Z', SKY]),
    'gefuehle/wuetend': face('#F08A70',
      ['l', 'M28 40 L46 48'], ['l', 'M72 40 L54 48'], ['d', 39, 54, 3], ['d', 61, 54, 3],
      ['l', 'M38 74 Q50 66 62 74'],
      ['l', 'M82 30 L90 24'], ['l', 'M86 40 L94 38'], ['l', 'M18 30 L10 24'], ['l', 'M14 40 L6 38']),
    'gefuehle/aengstlich': face('#CFE3D4',
      ['s', Ci(38, 52, 8), WHITE], ['s', Ci(62, 52, 8), WHITE], ['d', 38, 54, 2.6], ['d', 62, 54, 2.6],
      ['l', 'M30 38 Q38 33 46 38'], ['l', 'M54 38 Q62 33 70 38'],
      ['l', 'M38 74 Q44 68 50 74 Q56 80 62 74'], ['s', 'M82 36 Q75 47 82 51 Q89 47 82 36 Z', SKY]),
    'gefuehle/ueberrascht': face('#FBE29A',
      ['d', 38, 50, 3.2], ['d', 62, 50, 3.2],
      ['l', 'M30 40 Q38 34 46 40'], ['l', 'M54 40 Q62 34 70 40'],
      ['s', E(50, 72, 8, 11), '#8A4B4B']),
    'gefuehle/muede': face('#D9CCEB',
      ['l', 'M31 52 Q38 57 45 52'], ['l', 'M55 52 Q62 57 69 52'], ['l', 'M44 72 Q50 76 56 72'],
      ['l', 'M72 24 L82 24 L72 34 L82 34'], ['l', 'M86 8 L93 8 L86 15 L93 15']),
    'gefuehle/hungrig': face('#F6C79A',
      ['d', 38, 50, 2.8], ['d', 62, 50, 2.8],
      ['s', 'M34 64 Q50 86 66 64 Z', WHITE], ['s', E(58, 74, 6, 4.5), PINK],
      ['s', 'M70 70 Q66 80 70 83 Q74 80 70 70 Z', SKY]),
    'gefuehle/krank': face('#CDE6D6',
      ['l', 'M32 46 L42 56'], ['l', 'M42 46 L32 56'], ['l', 'M58 46 L68 56'], ['l', 'M68 46 L58 56'],
      ['l', 'M38 74 Q44 70 50 74 Q56 78 62 74'],
      ['l', 'M62 70 L86 88'], ['s', Ci(88, 90, 4), RED]),

    /* ---------- Symbole der Seitenleiste ---------- */
    'nav/farben': [['s', Ci(36, 40, 21), RED], ['s', Ci(64, 40, 21), YELLOW], ['s', Ci(50, 66, 21), BLUE]],
    'nav/zahlen': [['t', 50, 70, 54, '123']],
  };
  ART['nav/tiere'] = ART['tiere/loewe'];
  ART['nav/essen'] = ART['essen/apfel'];
  ART['nav/gefuehle'] = ART['gefuehle/froh'];

  /* ---------- Spiele ---------- */
  ART['game/suche'] = [
    ['s', Ci(42, 42, 24), '#D6ECFA'], ['h', 'M30 34 Q34 26 42 24'],
    ['s', 'M60 58 L84 82 L77 89 L53 65 Z', BROWN],
  ];
  ART['game/zaehlen'] = [
    ['s', Ci(26, 62, 14), RED], ['s', Ci(50, 44, 14), ORANGE], ['s', Ci(74, 62, 14), YELLOW],
    ['l', 'M26 86 L26 90'], ['l', 'M50 68 L50 90'], ['l', 'M74 86 L74 90'],
    ['t', 26, 67, 16, '1'], ['t', 50, 49, 16, '2'], ['t', 74, 67, 16, '3'],
  ];
  ART['game/geben'] = [
    ['s', Ci(40, 46, 11), RED], ['s', Ci(62, 44, 11), GREEN], ['s', Ci(51, 32, 11), YELLOW],
    ['s', 'M16 52 L84 52 L75 88 L25 88 Z', '#E2A55C'], ['l', 'M24 62 L76 62'], ['l', 'M30 72 L70 72'],
  ];
  ART['game/malen'] = [
    ['s', 'M50 14 C26 14 10 32 14 54 C18 76 40 88 56 82 C66 78 58 66 66 62 C76 58 90 62 90 46 C90 26 72 14 50 14 Z', '#F6E3C8'],
    ['s', Ci(34, 38, 7), RED], ['s', Ci(54, 28, 7), YELLOW], ['s', Ci(74, 38, 7), BLUE], ['s', Ci(30, 60, 7), GREEN],
  ];


  /* ---------- Sinne: Körperteile ---------- */
  const SKIN = '#F4C7A8';
  ART['sinne/auge'] = [
    ['s', 'M8 52 Q50 16 92 52 Q50 88 8 52 Z', WHITE],
    ['s', Ci(50, 52, 17), '#7A5A3A'], ['d', 50, 52, 7.5], ['c', Ci(44, 46, 3.4), WHITE],
    ['l', 'M24 40 L19 32'], ['l', 'M36 31 L33 22'], ['l', 'M50 27 L50 17'], ['l', 'M64 31 L67 22'], ['l', 'M77 40 L82 32'],
  ];
  ART['sinne/ohr'] = [
    ['s', 'M46 10 C20 10 12 40 22 58 C28 70 38 72 40 84 C42 94 60 96 66 84 C72 72 64 62 72 48 C82 24 68 10 46 10 Z', SKIN],
    ['l', 'M46 26 C32 26 30 44 38 54 C42 60 44 62 44 72'], ['l', 'M54 34 C60 40 58 48 52 52'],
  ];
  ART['sinne/nase'] = [
    ['s', 'M50 12 C55 40 58 52 70 62 C80 72 72 88 58 84 C54 82 46 82 42 84 C28 88 20 72 30 62 C42 52 45 40 50 12 Z', SKIN],
    ['s', E(39, 74, 5.5, 3.6), '#B5654A'], ['s', E(61, 74, 5.5, 3.6), '#B5654A'],
    ['h', 'M46 36 Q47 48 43 56'],
  ];
  ART['sinne/mund'] = [
    ['s', 'M10 50 C24 32 38 32 50 42 C62 32 76 32 90 50 C76 56 62 56 50 54 C38 56 24 56 10 50 Z', '#E5707A'],
    ['s', 'M10 50 C26 56 38 58 50 56 C62 58 74 56 90 50 C82 74 62 80 50 80 C38 80 18 74 10 50 Z', '#EE8B92'],
    ['l', 'M10 50 C26 57 38 57 50 55 C62 57 74 57 90 50'], ['h', 'M36 68 Q50 74 64 68'],
  ];
  ART['sinne/hand'] = [
    ['s', 'M32 94 C26 80 24 70 22 58 L17 38 C15 31 24 29 27 35 L33 50 L33 18 C33 10 44 10 44 18 L44 44 L47 10 C47 2 58 2 58 10 L58 44 L62 16 C63 8 73 11 71 19 L67 48 L73 30 C76 23 85 27 82 34 L75 60 C73 74 71 82 67 94 Z', SKIN],
    ['l', 'M40 70 Q50 76 60 70'],
  ];

  /* ---------- Dinge für „Welcher Sinn?" ---------- */
  ART['dinge/blume'] = [
    ['l', 'M50 52 L50 94'], ['s', 'M50 84 Q28 80 24 64 Q44 64 50 84 Z', GREEN], ['s', 'M50 76 Q70 74 76 60 Q58 58 50 76 Z', GREEN],
    ['s', Ci(50, 24, 11), PINK], ['s', Ci(65, 35, 11), PINK], ['s', Ci(59, 53, 11), PINK], ['s', Ci(41, 53, 11), PINK], ['s', Ci(35, 35, 11), PINK],
    ['s', Ci(50, 41, 9), YELLOW],
  ];
  ART['dinge/fernseher'] = [
    ['l', 'M50 24 L34 8'], ['l', 'M50 24 L66 8'],
    ['s', 'M10 24 L90 24 L90 76 L10 76 Z', '#4A5570'], ['s', 'M17 31 L83 31 L83 69 L17 69 Z', BLUE],
    ['h', 'M24 40 L42 36'], ['d', 74, 50, 1.6], ['l', 'M36 86 L64 86'], ['l', 'M50 76 L50 86'],
  ];
  ART['dinge/radio'] = [
    ['l', 'M76 34 L90 10'],
    ['s', 'M10 34 L90 34 L90 86 L10 86 Z', '#E2A55C'], ['s', Ci(34, 60, 17), CREAM],
    ['l', 'M24 60 L44 60'], ['l', 'M26 52 L42 52'], ['l', 'M26 68 L42 68'],
    ['s', Ci(70, 50, 6), BROWN], ['s', Ci(70, 70, 6), BROWN],
  ];
  ART['dinge/zitrone'] = [
    ['s', 'M4 52 L14 46 Q20 32 50 30 Q80 32 86 46 L96 52 L86 58 Q80 72 50 74 Q20 72 14 58 Z', YELLOW],
    ['s', 'M52 30 Q62 14 76 18 Q68 32 52 30 Z', GREEN], ['h', 'M26 48 Q30 40 40 38'],
    ['d', 40, 56, 1.1], ['d', 58, 62, 1.1], ['d', 68, 50, 1.1],
  ];
  ART['dinge/feuer'] = [
    ['s', 'M50 8 C58 28 78 38 74 62 C72 78 60 90 50 90 C38 90 26 78 26 62 C26 48 36 44 38 30 C44 36 46 28 50 8 Z', ORANGE],
    ['s', 'M50 44 C54 54 62 58 60 72 C58 80 54 84 50 84 C44 84 40 78 40 70 C40 60 48 56 50 44 Z', YELLOW],
    ['s', 'M16 90 L84 90 L84 98 L16 98 Z', BROWN],
  ];
  ART['nav/sinne'] = ART['sinne/auge'];
  ART['game/sinn'] = [
    ['s', 'M8 52 Q50 16 92 52 Q50 88 8 52 Z', WHITE], ['s', Ci(50, 52, 17), '#7A5A3A'], ['d', 50, 52, 7.5],
    ['t', 78, 30, 28, '?'],
  ];

  /* ---------- Beispielwörter fürs Alphabet (nur Wörter ohne eigene Zeichnung) ---------- */
  ART['wort/haus'] = [
    ['s', 'M66 34 L66 20 L77 20 L77 40 Z', '#C9625A'],
    ['s', 'M20 48 L20 86 L80 86 L80 48 Z', '#F2D9B8'], ['s', poly(12, 50, 50, 16, 88, 50), RED],
    ['s', 'M42 62 L42 86 L58 86 L58 62 Z', BROWN], ['s', 'M26 58 L36 58 L36 68 L26 68 Z', BLUE], ['s', 'M64 58 L74 58 L74 68 L64 68 Z', BLUE],
  ];
  ART['wort/papagei'] = [
    ['s', 'M50 90 L44 98 L56 98 Z', BLUE],
    ['s', 'M44 14 C24 14 20 40 28 58 C34 74 36 88 46 92 L58 92 C70 80 74 56 70 40 C66 22 58 14 44 14 Z', RED],
    ['s', 'M40 48 C52 46 62 56 60 74 C48 74 40 64 40 48 Z', '#C9423C'],
    ['s', 'M28 26 C14 24 10 38 20 42 C26 40 30 34 28 26 Z', YELLOW], ['s', Ci(38, 28, 6), WHITE], ['d', 38, 28, 3],
    ['l', 'M20 92 L84 92'],
  ];
  ART['wort/fuchs'] = [
    ['s', poly(18, 40, 26, 10, 44, 28), ORANGE], ['s', poly(82, 40, 74, 10, 56, 28), ORANGE],
    ['s', 'M50 86 C26 80 16 56 20 40 C34 30 66 30 80 40 C84 56 74 80 50 86 Z', ORANGE],
    ['s', 'M50 86 C40 82 34 70 40 60 C46 56 54 56 60 60 C66 70 60 82 50 86 Z', WHITE],
    ['d', 50, 63, 3.6], ['d', 36, 52, 2.8], ['d', 64, 52, 2.8],
  ];
  ART['wort/mais'] = [
    ['s', 'M50 10 C66 14 70 40 66 66 C62 84 56 90 50 90 C44 90 38 84 34 66 C30 40 34 14 50 10 Z', YELLOW],
    ['l', 'M42 24 L44 82'], ['l', 'M50 14 L50 88'], ['l', 'M58 24 L56 82'], ['l', 'M36 40 L64 40'], ['l', 'M35 56 L65 56'], ['l', 'M37 72 L63 72'],
    ['s', 'M50 94 C30 86 22 62 28 42 C36 58 44 74 50 94 Z', GREEN], ['s', 'M50 94 C70 86 78 62 72 42 C64 58 56 74 50 94 Z', GREEN],
  ];
  ART['wort/granatapfel'] = [
    ['s', Ci(50, 56, 30), RED], ['s', poly(38, 30, 41, 14, 50, 24, 59, 14, 62, 30), '#C9423C'],
    ['h', 'M30 50 Q32 42 40 38'], ['d', 52, 60, 1.4], ['d', 60, 52, 1.4], ['d', 44, 66, 1.4], ['d', 62, 68, 1.4],
  ];
  ART['wort/sonne'] = [
    ['l', 'M50 8 L50 22'], ['l', 'M50 78 L50 92'], ['l', 'M8 50 L22 50'], ['l', 'M78 50 L92 50'],
    ['l', 'M20 20 L30 30'], ['l', 'M70 70 L80 80'], ['l', 'M80 20 L70 30'], ['l', 'M20 80 L30 70'],
    ['s', Ci(50, 50, 22), YELLOW], ['d', 43, 46, 2.4], ['d', 57, 46, 2.4], ['l', 'M42 56 Q50 62 58 56'],
  ];
  ART['wort/rakete'] = [
    ['s', 'M42 66 L50 94 L58 66 Z', ORANGE],
    ['s', 'M38 52 L22 76 L38 70 Z', RED], ['s', 'M62 52 L78 76 L62 70 Z', RED],
    ['s', 'M50 8 C64 22 66 46 62 68 L38 68 C34 46 36 22 50 8 Z', '#EDEAF2'],
    ['s', 'M50 8 C58 16 62 24 63 32 L37 32 C38 24 42 16 50 8 Z', RED], ['s', Ci(50, 46, 8), BLUE],
  ];
  ART['wort/frosch'] = [
    ['s', E(50, 62, 32, 24), GREEN], ['s', Ci(32, 38, 10), GREEN], ['s', Ci(68, 38, 10), GREEN],
    ['s', Ci(32, 38, 5), WHITE], ['s', Ci(68, 38, 5), WHITE], ['d', 32, 39, 2.6], ['d', 68, 39, 2.6],
    ['l', 'M26 68 Q50 86 74 68'], ['d', 45, 58, 1.4], ['d', 55, 58, 1.4],
  ];
  ART['wort/flugzeug'] = [
    ['s', 'M14 44 L8 22 L28 42 Z', BLUE],
    ['s', 'M10 52 C10 44 20 42 30 42 L80 42 C92 42 96 48 96 52 C96 56 92 62 80 62 L30 62 C20 62 10 60 10 52 Z', '#EDEAF2'],
    ['s', 'M44 54 L28 82 L50 82 L66 54 Z', BLUE], ['s', 'M80 42 C88 42 92 46 92 50 L78 50 Z', BLUE],
    ['s', Ci(36, 52, 3), BLUE], ['s', Ci(48, 52, 3), BLUE], ['s', Ci(60, 52, 3), BLUE],
  ];
  ART['wort/briefumschlag'] = [
    ['s', 'M12 28 L88 28 L88 76 L12 76 Z', CREAM], ['s', 'M70 34 L82 34 L82 46 L70 46 Z', PINK],
    ['l', 'M12 28 L50 56 L88 28'], ['l', 'M12 76 L38 50'], ['l', 'M88 76 L62 50'],
  ];
  ART['wort/wolke'] = [
    ['s', 'M24 66 C10 66 8 46 24 42 C24 24 50 20 56 36 C68 26 90 36 84 54 C96 56 94 70 80 70 Z', '#E6F0FA'],
    ['l', 'M30 80 L26 90'], ['l', 'M50 80 L46 90'], ['l', 'M70 80 L66 90'],
  ];
  ART['wort/affe'] = [
    ['s', 'M62 86 C88 86 90 62 76 58 C80 66 74 76 64 76 Z', BROWN],
    ['s', Ci(28, 38, 8), BROWN], ['s', Ci(72, 38, 8), BROWN],
    ['s', E(50, 76, 16, 18), BROWN], ['s', E(50, 78, 9, 11), '#F2D3B3'],
    ['s', Ci(50, 40, 20), BROWN], ['s', E(50, 46, 13, 11), '#F2D3B3'],
    ['d', 44, 40, 2.6], ['d', 56, 40, 2.6], ['l', 'M44 51 Q50 55 56 51'],
  ];
  ART['wort/mond'] = [
    ['s', Ci(50, 50, 32), '#FBE29A'], ['s', Ci(40, 40, 6), '#EBCF7A'], ['s', Ci(60, 58, 8), '#EBCF7A'], ['s', Ci(42, 66, 4), '#EBCF7A'],
    ['h', 'M30 44 Q32 34 42 28'],
  ];
  ART['wort/hilal'] = [
    ['s', 'M60 12 C36 16 22 40 28 62 C34 84 62 92 82 78 C58 78 46 58 52 40 C56 28 62 20 60 12 Z', YELLOW],
    ['s', poly(76, 24, 79, 33, 88, 33, 81, 39, 84, 48, 76, 42, 68, 48, 71, 39, 64, 33, 73, 33), YELLOW],
  ];
  ART['wort/rose'] = [
    ['l', 'M50 52 L50 94'], ['s', 'M50 84 Q28 80 24 64 Q44 64 50 84 Z', GREEN], ['s', 'M50 76 Q70 74 76 60 Q58 58 50 76 Z', GREEN],
    ['s', Ci(50, 34, 20), '#D9424E'], ['l', 'M50 20 Q38 28 44 40 Q54 46 58 34'], ['l', 'M42 30 Q50 26 58 32'],
  ];

  /* ---------- Bewegung: Tiere mit Bewegungslinien ---------- */
  const without = (ops, bad) => ops.filter((o) => !bad.includes(o[1]));
  ART['bewegung/fliegen'] = [...without(ART['tiere/vogel'], ['M20 94 L80 94', 'M42 82 L42 92', 'M52 82 L52 92']),
    ['l', 'M4 22 L24 22'], ['l', 'M2 34 L18 34'], ['l', 'M6 46 L20 46']];
  ART['bewegung/rennen'] = [...ART['tiere/pferd'], ['l', 'M2 36 L14 36'], ['l', 'M0 50 L12 50'], ['l', 'M4 64 L16 64']];
  ART['bewegung/klettern'] = [['s', 'M0 8 L100 8 L100 18 L0 18 Z', BROWN], ['s', 'M34 60 C22 48 26 30 34 16 L42 20 C38 34 38 46 44 58 Z', BROWN], ...ART['wort/affe'].slice(0)];
  ART['bewegung/schwimmen'] = [...ART['tiere/fisch'], ['l', 'M4 86 Q14 80 24 86 Q34 92 44 86 Q54 80 64 86 Q74 92 84 86 Q90 83 96 86'], ['l', 'M14 96 Q24 90 34 96 Q44 102 54 96']];
  ART['bewegung/springen'] = [...ART['tiere/hase'], ['l', 'M6 86 Q2 60 16 42'], ['l', 'M14 94 Q8 72 22 54']];
  ART['nav/bewegung'] = ART['bewegung/springen'];

  /* ---------- Ausmalbilder: je Thema ein Bild, Fläche für Fläche ---------- */
  const W = '#FFFBF2';
  const RECT = 'M0 0 L140 0 L140 100 L0 100 Z';
  const dot = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}" stroke="none"/>`;
  const digit = (x, y, t) => `<text x="${x}" y="${y}" font-size="12" font-weight="700" text-anchor="middle" fill="${INK}" stroke="none" font-family="ui-rounded,'SF Pro Rounded',-apple-system,sans-serif">${t}</text>`;
  const SCENES = {
    farben: {
      regions: [
        ['sky', RECT, '#F3F8FC'], ['sun', Ci(112, 24, 13), W],
        ['cloud', 'M22 42 C12 42 12 30 22 30 C22 20 38 18 42 28 C50 22 62 28 58 38 C66 40 64 48 56 48 L26 48 C18 48 16 42 22 42 Z', W],
        ['ground', 'M0 78 Q40 66 80 74 T140 70 L140 100 L0 100 Z', W],
        ['wall', 'M44 54 L44 84 L92 84 L92 54 Z', W], ['roof', 'M38 56 L68 30 L98 56 Z', W],
        ['door', 'M62 66 L62 84 L74 84 L74 66 Z', W], ['window', 'M50 62 L58 62 L58 70 L50 70 Z', W],
        ['trunk', 'M112 62 L112 84 L120 84 L120 62 Z', W], ['crown', E(116, 48, 17, 16), W], ['flower', Ci(22, 76, 6), W],
      ],
      deco: '<path d="M22 82 L22 94 M22 88 Q14 86 12 80 M22 88 Q30 86 32 80"/>',
    },
    tiere: {
      regions: [
        ['water', RECT, '#EEF6FB'], ['sand', 'M0 82 Q35 74 70 82 T140 80 L140 100 L0 100 Z', W],
        ['alge1', 'M20 84 Q8 68 22 56 Q16 70 28 84 Z', W], ['alge2', 'M114 84 Q102 70 114 58 Q110 72 124 84 Z', W],
        ['tail', 'M92 50 L130 26 Q122 50 130 74 Z', W], ['fin', 'M52 33 Q66 10 82 33 Z', W],
        ['body', E(66, 50, 31, 21), W], ['belly', 'M40 54 Q66 72 92 56 Q66 64 40 54 Z', W],
        ['bubble1', Ci(26, 36, 5), W], ['bubble2', Ci(20, 22, 3.5), W], ['bubble3', Ci(32, 12, 3), W],
      ],
      deco: dot(48, 45, 3.4) + '<path d="M36 52 Q40 55 44 53"/><path d="M55 40 Q51 50 55 60"/><path d="M68 44 Q72 48 68 52 M78 43 Q82 48 78 55"/>',
    },
    essen: {
      regions: [
        ['wand', RECT, '#F6F1E8'], ['tisch', 'M0 80 L140 80 L140 100 L0 100 Z', W],
        ['apfel', 'M44 28 C34 20 20 28 22 44 C24 56 34 62 44 58 C54 62 64 56 66 44 C68 28 54 20 44 28 Z', W],
        ['blatt', 'M46 24 Q56 12 66 18 Q58 28 46 24 Z', W],
        ['banane', 'M62 54 C70 22 100 20 118 36 C122 40 118 44 114 42 C98 32 82 36 74 56 Z', W],
        ['orange', Ci(88, 40, 15), W],
        ['korb', 'M26 60 L114 60 L102 94 L38 94 Z', W], ['rand', 'M20 54 L120 54 L120 64 L20 64 Z', W],
      ],
      deco: '<path d="M32 72 L108 72 M36 82 L104 82 M50 64 L52 94 M70 64 L70 94 M90 64 L88 94"/>',
    },
    gefuehle: {
      regions: [
        ['bg', RECT, '#F4EEF8'], ['face', Ci(70, 58, 37), W],
        ['bowL', 'M70 18 L50 8 L50 30 Z', W], ['bowR', 'M70 18 L90 8 L90 30 Z', W], ['knot', Ci(70, 19, 5), W],
        ['cheekL', Ci(44, 68, 7), W], ['cheekR', Ci(96, 68, 7), W],
        ['mouth', 'M46 68 Q70 96 94 68 Q70 74 46 68 Z', W],
        ['eyeL', Ci(54, 52, 8), W], ['eyeR', Ci(86, 52, 8), W],
      ],
      deco: dot(55, 53, 3.6) + dot(87, 53, 3.6) + '<path d="M44 40 Q54 33 62 40 M78 40 Q86 33 96 40"/><path d="M70 56 Q66 64 70 66"/>',
    },
    zahlen: {
      regions: [
        ['himmel', RECT, '#EAF4FA'], ['sonne', Ci(120, 18, 10), W],
        ['wiese', 'M0 76 Q35 68 70 74 T140 72 L140 100 L0 100 Z', W],
        ['s1', Ci(14, 66, 11), W], ['s2', Ci(32, 62, 11), W], ['s3', Ci(50, 66, 11), W], ['s4', Ci(68, 62, 11), W], ['s5', Ci(86, 66, 11), W],
        ['kopf', Ci(108, 60, 15), W],
      ],
      deco: '<path d="M14 77 L14 85 M32 73 L32 81 M50 77 L50 85 M68 73 L68 81 M86 77 L86 85"/>' +
        ['١', '٢', '٣', '٤', '٥'].map((t, n) => digit(14 + n * 18, (n % 2 ? 66 : 70), t)).join('') +
        dot(104, 55, 2.6) + dot(114, 55, 2.6) + '<path d="M103 65 Q109 71 116 65"/><path d="M103 46 Q99 36 94 33 M113 46 Q117 36 122 33"/>',
    },
    sinne: {
      regions: [
        ['bg', RECT, '#EDF3FA'], ['haar', E(70, 46, 38, 34), W],
        ['ohrL', E(35, 64, 8, 12), W], ['ohrR', E(105, 64, 8, 12), W],
        ['kopf', E(70, 62, 32, 36), W],
        ['augeL', 'M44 54 Q54 44 64 54 Q54 64 44 54 Z', W], ['augeR', 'M76 54 Q86 44 96 54 Q86 64 76 54 Z', W],
        ['nase', 'M70 54 L62 74 Q70 80 78 74 Z', W], ['mund', 'M52 86 Q70 100 88 86 Q70 90 52 86 Z', W],
      ],
      deco: dot(54, 54, 3.2) + dot(86, 54, 3.2) + '<path d="M44 44 Q54 38 64 44 M76 44 Q86 38 96 44"/>',
    },
  };

  SCENES.bewegung = {
    regions: [
      ['himmel', RECT, '#EAF4FA'], ['wiese', 'M0 82 Q35 74 70 82 T140 80 L140 100 L0 100 Z', W],
      ['stamm', 'M96 98 L100 46 L114 46 L118 98 Z', W], ['krone', Ci(106, 30, 24), W],
      ['schwanz', 'M54 80 C80 80 82 54 68 52 C72 62 66 72 56 70 Z', W],
      ['ohrL', Ci(26, 42, 7), W], ['ohrR', Ci(58, 42, 7), W],
      ['koerper', E(42, 72, 16, 19), W], ['kopf', Ci(42, 42, 17), W], ['gesicht', E(42, 47, 11, 9), W],
    ],
    deco: dot(37, 41, 2.6) + dot(47, 41, 2.6) + '<path d="M37 51 Q42 55 47 51"/>',
  };

  ART['game/finger'] = [
    ['s', poly(72, 8, 92, 28, 52, 68, 32, 48), BROWN],
    ['s', 'M32 48 L52 68 Q38 90 14 86 Q16 62 32 48 Z', RED],
    ['h', 'M70 20 L84 34'],
  ];


  function render(ops) {
    let out = '';
    for (const op of ops) {
      switch (op[0]) {
        case 's': out += `<path d="${op[1]}" fill="${op[2]}" stroke="none" transform="translate(2.4 2)"/><path d="${op[1]}" fill="none"/>`; break;
        case 'l': out += `<path d="${op[1]}" fill="none"/>`; break;
        case 'c': out += `<path d="${op[1]}" fill="${op[2]}" stroke="none"/>`; break;
        case 'h': out += `<path d="${op[1]}" fill="none" stroke="#FFFFFF" stroke-width="3" opacity=".8"/>`; break;
        case 'd': out += `<circle cx="${op[1]}" cy="${op[2]}" r="${op[3]}" fill="${INK}" stroke="none"/>`; break;
        case 't': out += `<text x="${op[1]}" y="${op[2]}" font-size="${op[3]}" font-weight="700" text-anchor="middle" fill="${INK}" stroke="none" font-family="ui-rounded,'SF Pro Rounded',-apple-system,'Helvetica Neue',Arial,sans-serif">${op[4]}</text>`; break;
      }
    }
    return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#sketch)" stroke="${INK}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${out}</g></svg>`;
  }

  /* ---------- Farben: gekritzelte Farbfläche ---------- */
  const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return h >>> 0; };
  const rng = (seed) => { let s = seed || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  let uid = 0;

  function colorSketch(color) {
    const r = rng(hash(color));
    const n = 8, pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / 8, c = Math.cos(a), s = Math.sin(a);
      pts.push([50 + 41 * Math.sign(c) * Math.pow(Math.abs(c), 0.6) * (0.92 + r() * 0.13), 50 + 41 * Math.sign(s) * Math.pow(Math.abs(s), 0.6) * (0.92 + r() * 0.13)]);
    }
    const f = (v) => v.toFixed(1);
    const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const m0 = mid(pts[n - 1], pts[0]);
    let d = `M${f(m0[0])} ${f(m0[1])}`;
    for (let i = 0; i < n; i++) { const p = pts[i], m = mid(pts[i], pts[(i + 1) % n]); d += ` Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`; }
    d += ' Z';
    let z = 'M-6 4', y = 4, left = false;
    while (y < 108) { y += 8 + r() * 3; z += ` L${f((left ? -6 : 106) + r() * 6 - 3)} ${f(y)}`; left = !left; }
    const white = color.toUpperCase() === '#FFFFFF';
    const id = 'cl' + uid++;
    return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>` +
      `<g filter="url(#sketch)" stroke-linecap="round" stroke-linejoin="round">` +
      `<g clip-path="url(#${id})"><path d="${d}" fill="${color}" opacity="${white ? 1 : .5}" stroke="none"/>` +
      `<path d="${z}" fill="none" stroke="${white ? '#E4DCCB' : color}" stroke-width="6.5"/></g>` +
      `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2"/></g></svg>`;
  }

  const FRAME = 'viewBox="-2 -2 144 104"';
  const sceneOf = (catId) => SCENES[catId] || SCENES.farben;

  /* Antippen-Bild: jede Fläche eine Farbe */
  function scene(catId, fills) {
    const S = sceneOf(catId);
    const regions = S.regions.map(([id, d, def]) =>
      `<path class="region" data-act="m-fill" data-r="${id}" d="${d}" fill="${fills[id] || def}"/>`).join('');
    return `<svg class="scene" ${FRAME} aria-label="Ausmalbild"><g filter="url(#sketch)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round">${regions}` +
      `<g fill="none" stroke-linecap="round" pointer-events="none">${S.deco}</g></g></svg>`;
  }

  /* Finger-Bild: pro Fläche eine zugeschnittene Malschicht, Linien liegen darüber */
  function paintScene(catId) {
    const S = sceneOf(catId);
    const pid = 'p' + uid++;
    const defs = S.regions.map(([id, d]) => `<clipPath id="${pid}-${id}"><path d="${d}"/></clipPath>`).join('');
    const layers = S.regions.map(([id, d, def]) =>
      `<path class="region" data-r="${id}" d="${d}" fill="${def}"/><g class="paint" data-r="${id}" clip-path="url(#${pid}-${id})"></g>`).join('');
    const lines = S.regions.map(([, d]) => `<path d="${d}" fill="none"/>`).join('');
    return `<svg class="scene paint" ${FRAME} aria-label="Ausmalbild zum Malen mit dem Finger"><defs>${defs}</defs>${layers}` +
      `<g filter="url(#sketch)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" pointer-events="none">${lines}` +
      `<g fill="none">${S.deco}</g></g></svg>`;
  }

  window.Sketch = {
    get: (key) => (ART[key] ? render(ART[key]) : null),
    scene,
    paintScene,
    color: colorSketch,
    motif: (catId, itemId) => (ART[`${catId}/${itemId}`] ? render(ART[`${catId}/${itemId}`]) : null),
    nav: (catId) => (ART[`nav/${catId}`] ? render(ART[`nav/${catId}`]) : null),
  };
})();
