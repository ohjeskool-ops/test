/* Handgezeichnete Motive (Sketch & Scribble): Tuschelinie + leicht versetzte Farbfläche.
   Jedes Motiv ist eine Liste von Zeichen-Befehlen auf einer 100x100-Fläche:
   ['s', pfad, farbe]  Fläche mit Umriss      ['l', pfad]       nur Linie
   ['d', x, y, r]      Punkt (Auge)           ['c', pfad, farbe] nur Farbe (Wangen)
   ['h', pfad]         heller Glanzstrich     ['t', x, y, größe, text] Schrift        */
(() => {
  const INK = '#3A3340';
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

  function render(ops) {
    let out = '';
    for (const op of ops) {
      switch (op[0]) {
        case 's': out += `<path d="${op[1]}" fill="${op[2]}" stroke="none" transform="translate(2.4 2)"/><path d="${op[1]}" fill="none"/>`; break;
        case 'l': out += `<path d="${op[1]}" fill="none"/>`; break;
        case 'c': out += `<path d="${op[1]}" fill="${op[2]}" stroke="none"/>`; break;
        case 'h': out += `<path d="${op[1]}" fill="none" stroke="#FFFFFF" stroke-width="3.4" opacity=".85"/>`; break;
        case 'd': out += `<circle cx="${op[1]}" cy="${op[2]}" r="${op[3]}" fill="${INK}" stroke="none"/>`; break;
        case 't': out += `<text x="${op[1]}" y="${op[2]}" font-size="${op[3]}" font-weight="700" text-anchor="middle" fill="${INK}" stroke="none" font-family="'Marker Felt','Bradley Hand','Chalkboard SE',cursive">${op[4]}</text>`; break;
      }
    }
    return `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#sketch)" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${out}</g></svg>`;
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
      `<path d="${d}" fill="none" stroke="${INK}" stroke-width="2.6"/></g></svg>`;
  }

  window.Sketch = {
    color: colorSketch,
    motif: (catId, itemId) => (ART[`${catId}/${itemId}`] ? render(ART[`${catId}/${itemId}`]) : null),
    nav: (catId) => (ART[`nav/${catId}`] ? render(ART[`nav/${catId}`]) : null),
  };
})();
