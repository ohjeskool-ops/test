/* Khait (خَيْط = Faden) – Faden für Faden.
   Jede Schulwoche ist ein Stickmotiv auf einem Tuch. Fünf kurze Übungen = fünf Fäden.
   Pro Tag wächst ein Motiv nur um einen Faden: kurze Einheiten, über die Woche verteilt.
   Kein Framework, kein Build. Wörter, Alphabet und Zeichnungen kommen aus der bestehenden App. */
(() => {
  const app = document.getElementById('app');
  const $ = (s, r = document) => r.querySelector(s);
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  const INK = '#1F2233';
  const STITCH = { R: '#B4232F', K: INK, G: '#6E8B3D', Y: '#E8A93A', P: '#D9667B' };
  const THREAD_COLORS = ['#B4232F', '#E8A93A', '#6E8B3D', '#2F7F86', '#D9667B'];
  const THREADS = {
    hoeren: { de: 'Hören', icon: 'ear' }, punkte: { de: 'Punkte', icon: 'dots' }, finden: { de: 'Finden', icon: 'find' },
    spuren: { de: 'Schreiben', icon: 'pen' }, quiz: { de: 'Wörter', icon: 'cards' }, sinne: { de: 'Sinne', icon: 'eye' },
    gegensatz: { de: 'Groß & klein', icon: 'pair' }, bewegung: { de: 'Mach mit!', icon: 'jump' }, lehrerin: { de: 'Ich bin die Lehrerin', icon: 'crown' },
  };
  const P = (d, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const ICONS = {
    ear: P('M9 14c0-5 3-8 7-8s7 3 7 7c0 4-4 5-4 9 0 3-2 5-5 5s-4-2-4-4') + P('M13 14c0-2 1-4 3-4s3 2 3 3'),
    dots: '<rect x="13" y="4" width="6" height="6" rx="1" transform="rotate(45 16 7)" fill="currentColor"/><rect x="6" y="13" width="6" height="6" rx="1" transform="rotate(45 9 16)" fill="currentColor"/><rect x="20" y="13" width="6" height="6" rx="1" transform="rotate(45 23 16)" fill="currentColor"/>' + P('M5 24c2 4 20 4 22 0'),
    find: '<circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/>' + P('M20 20l7 7'),
    pen: P('M6 26l3-9L22 4l6 6L15 23z') + P('M9 17l6 6'),
    cards: '<rect x="5" y="8" width="14" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/>' + P('M12 5h12a3 3 0 0 1 3 3v15'),
    eye: P('M3 16c4-7 9-10 13-10s9 3 13 10c-4 7-9 10-13 10S7 23 3 16z') + '<circle cx="16" cy="16" r="4" fill="currentColor"/>',
    pair: '<circle cx="11" cy="17" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="25" cy="22" r="3.4" fill="currentColor"/>',
    jump: '<circle cx="16" cy="6" r="3" fill="currentColor"/>' + P('M16 10v8l-6 8M16 18l6 8M7 9l9 4 9-4'),
    crown: P('M4 24l-1-14 8 7 5-11 5 11 8-7-1 14z'),
    back: P('M20 6L10 16l10 10'), speaker: P('M5 12h5l7-6v20l-7-6H5z') + P('M22 11c2 3 2 7 0 10M26 8c4 5 4 11 0 16'),
    check: P('M5 17l7 7L27 8', 'stroke-width="3.4"'), mic: '<rect x="12" y="4" width="8" height="14" rx="4" fill="currentColor"/>' + P('M7 15c0 5 4 8 9 8s9-3 9-8M16 23v5'),
    moon: '<path d="M22 4a12 12 0 1 0 6 20A13 13 0 0 1 22 4z" fill="currentColor"/>', gear: '<circle cx="16" cy="16" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/>' + P('M16 3v5M16 24v5M3 16h5M24 16h5M7 7l3.5 3.5M21.5 21.5L25 25M25 7l-3.5 3.5M10.5 21.5L7 25'),
    star: '<path d="M16 3l3.8 8.2 9 1-6.7 6 1.9 8.8-8-4.6-8 4.6 1.9-8.8-6.7-6 9-1z" fill="currentColor"/>',
  };
  const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 32 32" aria-hidden="true">${ICONS[n]}</svg>`;

  /* ---------- Speicher ---------- */
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem('khait.' + k)); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('khait.' + k, JSON.stringify(v)); } catch { /* voll oder gesperrt */ } },
  };
  let done = store.get('done', {});
  let hw = store.get('hw', {});
  let settings = store.get('settings', { daily: true });
  const today = () => new Date().toLocaleDateString('sv');
  const lessonOf = (id) => KHAIT_LESSONS.find((l) => l.id === id);
  const letterOf = (id) => ALPHABET.find((l) => l.id === id);
  const countDone = (L) => L.threads.filter((t) => done[L.id] && done[L.id][t]).length;
  const grewToday = (L) => Object.values(done[L.id] || {}).includes(today());

  /* ---------- Ton: Aufnahmen aus der bestehenden App, sonst Sprachausgabe ---------- */
  const recs = new Map();
  const voices = new Map();
  function openDb(name, storeName) {
    return new Promise((resolve) => {
      try {
        const req = indexedDB.open(name, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(storeName);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }
  function loadAll(db, storeName, into) {
    return new Promise((resolve) => {
      if (!db) return resolve();
      try {
        const req = db.transaction(storeName, 'readonly').objectStore(storeName).openCursor();
        req.onsuccess = () => { const c = req.result; if (c) { into.set(c.key, c.value); c.continue(); } else resolve(); };
        req.onerror = () => resolve();
      } catch { resolve(); }
    });
  }
  let voiceDb = null;
  const player = new Audio();
  let arVoice = null;
  const pickVoice = () => { arVoice = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('ar')) || null; };
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function stopSound() { try { player.pause(); } catch { /* egal */ } if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function playBlob(blob, onend) {
    const url = URL.createObjectURL(blob);
    player.src = url;
    player.onended = () => { URL.revokeObjectURL(url); if (onend) onend(); };
    player.play().catch(() => { if (onend) onend(); });
  }
  function speak(key, ar) {
    stopSound();
    const blob = recs.get(key);
    if (blob) return playBlob(blob);
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(ar);
    u.lang = 'ar-SA'; if (arVoice) u.voice = arVoice; u.rate = 0.7;
    speechSynthesis.speak(u);
  }
  const sayLetter = (l) => speak('alphabet/' + l.id, l.name);
  const sayWord = (w) => speak(w.key, w.ar);

  // Gezupfte Töne beim Sticken (Hidschas-Leiter)
  let ac = null;
  const SCALE = [293.66, 311.13, 369.99, 392, 440, 466.16, 554.37, 587.33];
  function pluck(i, vol = 0.16) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = SCALE[((i % 8) + 8) % 8];
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.6);
    } catch { /* kein Ton */ }
  }

  /* ---------- Wörter ---------- */
  const X = (inner) => `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#sketch)" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${inner}</g></svg>`;
  const OWN_ART = {
    'x/schnee': X('<path d="M50 12v76M17 31l66 38M83 31L17 69" stroke="#5FA8D3" stroke-width="5"/><path d="M40 20l10 9 10-9M40 80l10-9 10 9M20 46l11-3-3-12M80 54l-11 3 3 12M69 31l11 3-3 12M31 69l-11-3 3-12" stroke="#5FA8D3" stroke-width="3.4"/>'),
    'x/drei': X('<circle cx="50" cy="50" r="38" fill="#F7D154"/><text x="50" y="72" font-size="62" text-anchor="middle" fill="' + INK + '" stroke="none" font-family="Geeza Pro, Noto Naskh Arabic, serif">٣</text>'),
    'x/krone': X('<path d="M16 74l-4-42 22 20 16-32 16 32 22-20-4 42z" fill="#F7D154"/><path d="M16 82h68"/><circle cx="50" cy="60" r="4" fill="#B4232F"/>'),
  };
  const EXTRA_WORDS = {
    ta: [{ ar: 'تَاج', de: 'Krone', art: 'x/krone' }],
    tha: [{ ar: 'ثَلْج', de: 'Schnee', art: 'x/schnee' }, { ar: 'ثَلَاثَة', de: 'drei', art: 'x/drei' }],
  };
  const pic = (art) => OWN_ART[art] || Sketch.get(art) || '';
  function wordsOf(letterId) {
    const base = letterOf(letterId).words.map((w) => ({ ar: w.ar, de: w.de, art: w.art, key: w.cat ? `${w.cat}/${w.itemId}` : `wort/${w.art}` }));
    const extra = (EXTRA_WORDS[letterId] || []).map((w) => ({ ...w, key: 'khait/' + w.art }));
    return [...base, ...extra];
  }
  const hl = (ar) => { const m = ar.match(/^(.[ً-ْٰ]*)([\s\S]*)$/u); return m ? `<b>${m[1]}</b>${m[2]}` : ar; };

  /* ---------- Stickmotiv ---------- */
  function cellsOf(L) {
    const cells = [];
    const rows = L.motif.length;
    for (let r = rows - 1; r >= 0; r--) { // von unten nach oben, hin und her wie beim Sticken
      const row = [...L.motif[r]].map((ch, c) => ({ r, c, ch })).filter((x) => x.ch !== '.');
      cells.push(...((rows - 1 - r) % 2 ? row.reverse() : row));
    }
    return cells;
  }
  const stitchedCount = (L, n) => Math.round((cellsOf(L).length * n) / L.threads.length);
  function motif(L, n, animFrom = null) {
    const cells = cellsOf(L), size = L.motif.length;
    const upto = stitchedCount(L, n), from = animFrom == null ? upto : stitchedCount(L, animFrom);
    let out = '';
    cells.forEach((cell, i) => {
      const x = cell.c * 10, y = cell.r * 10;
      if (i < upto) {
        const fresh = i >= from;
        out += `<g class="st${fresh ? ' fresh' : ''}" stroke="${STITCH[cell.ch]}"${fresh ? ` style="animation-delay:${((i - from) * 55)}ms"` : ''}><path d="M${x + 1.6} ${y + 1.6}L${x + 8.4} ${y + 8.4}M${x + 8.4} ${y + 1.6}L${x + 1.6} ${y + 8.4}"/></g>`;
      } else out += `<path class="todo" d="M${x + 3.4} ${y + 3.4}L${x + 6.6} ${y + 6.6}M${x + 6.6} ${y + 3.4}L${x + 3.4} ${y + 6.6}"/>`;
    });
    return `<svg class="motif" viewBox="-4 -4 ${size * 10 + 8} ${size * 10 + 8}" aria-hidden="true">${out}</svg>`;
  }
  const border = () => `<div class="border" aria-hidden="true"></div>`;

  /* ---------- Bildschirme ---------- */
  let view = { name: 'cloth' };
  function go(next) { stopRec(); stopSound(); view = next; render(); }
  function later(fn, ms) { const v = view; setTimeout(() => { if (view === v) fn(); }, ms); }
  const RENDER = {};
  const AFTER = {};
  function render() {
    app.innerHTML = RENDER[view.name]();
    app.className = 'v-' + view.name;
    if (AFTER[view.name]) AFTER[view.name]();
  }

  RENDER.cloth = () => {
    const current = KHAIT_LESSONS[KHAIT_LESSONS.length - 1];
    const tiles = KHAIT_LESSONS.map((L) => {
      const n = countDone(L), l = letterOf(L.letter);
      const pips = L.threads.map((t, i) => `<i style="--c:${THREAD_COLORS[i]}" class="${done[L.id] && done[L.id][t] ? 'on' : ''}"></i>`).join('');
      return `<button class="tile ${L === current ? 'current' : ''} ${n === L.threads.length ? 'full' : ''}" data-act="open" data-id="${L.id}" aria-label="Buchstabe ${l.tr}">
        ${motif(L, n)}<span class="tl ar">${l.ch}</span><span class="pips">${pips}</span></button>`;
    }).join('');
    const ghosts = KHAIT_NEXT.map((ch) => `<div class="tile ghost"><span class="tl ar">${ch}</span></div>`).join('');
    return `<header class="top"><div class="brand"><span class="ar">خَيْط</span><small>Faden für Faden</small></div>
      <button class="gate" data-gate aria-label="Eltern (gedrückt halten)">${icon('gear')}</button></header>
      ${border()}<div class="cloth" dir="rtl">${tiles}${ghosts}</div>${border()}`;
  };

  RENDER.week = () => {
    const L = lessonOf(view.id), l = letterOf(L.letter), n = countDone(L);
    const next = L.threads.find((t) => !(done[L.id] && done[L.id][t]));
    const asleep = settings.daily && grewToday(L);
    const spools = L.threads.map((t, i) => {
      const isDone = !!(done[L.id] && done[L.id][t]);
      const state = isDone ? 'done' : t === next ? (asleep ? 'asleep' : 'ready') : 'later';
      return `<button class="spool ${state}" style="--c:${THREAD_COLORS[i]}" data-act="thread" data-t="${t}" data-state="${state}" aria-label="${THREADS[t].de}">
        <span class="reel">${icon(state === 'asleep' ? 'moon' : THREADS[t].icon)}</span>${isDone ? `<span class="tick">${icon('check')}</span>` : ''}</button>`;
    }).join('');
    return `<header class="top"><button class="round" data-act="home" aria-label="Zurück zum Tuch">${icon('back')}</button>
      <div class="wtitle"><span class="ar">${hl(L.word.ar)}</span></div><span class="sp"></span></header>
      <div class="week"><div class="hoop"><button class="hoop-in" data-act="say-letter" aria-label="Anhören">${motif(L, n)}</button><span class="hoop-letter ar">${l.ch}</span></div>
      <div class="spools">${spools}</div></div>
      <p class="hint" id="hint">${asleep && next ? 'Der nächste Faden schläft bis morgen. Fertige Fäden kannst du noch einmal spielen.' : ''}</p>`;
  };

  RENDER.stitch = () => {
    const L = lessonOf(view.id), full = view.to === L.threads.length;
    return `<div class="stitching"><div class="hoop big">${`<div class="hoop-in">${motif(L, view.to, view.from)}</div>`}</div>
      <div class="cheer ${full ? 'full' : ''}"><span class="ar">${full ? 'يَا سَلَام!' : 'بْرَافُو!'}</span>
      <button class="pill" data-act="week" aria-label="Weiter">${icon('check')}</button></div></div>`;
  };
  AFTER.stitch = () => {
    const L = lessonOf(view.id);
    const k = stitchedCount(L, view.to) - stitchedCount(L, view.from);
    for (let i = 0; i < k; i += 3) later(() => pluck(Math.floor(i / 3) + view.from), i * 55);
    if (view.to === L.threads.length) [0, 2, 4, 7].forEach((nn, i) => later(() => pluck(nn, 0.22), k * 55 + 250 + i * 160));
  };

  function finish() {
    const L = lessonOf(view.id), before = countDone(L);
    if (!(done[L.id] && done[L.id][view.t])) { done[L.id] = { ...(done[L.id] || {}), [view.t]: today() }; store.set('done', done); }
    go({ name: 'stitch', id: L.id, from: before, to: countDone(L) });
  }
  const dots = (n, i) => `<div class="dots">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'd' : k === i ? 'c' : ''}"></i>`).join('')}</div>`;
  function frame(body, n = 0, i = 0) {
    const L = lessonOf(view.id), color = THREAD_COLORS[L.threads.indexOf(view.t)];
    return `<div class="act" style="--c:${color}"><header class="top"><button class="round" data-act="week" aria-label="Schließen">${icon('back')}</button>
      ${n ? dots(n, i) : '<span></span>'}<span class="chip">${icon(THREADS[view.t].icon)}</span></header>${body}<div class="praise" id="praise"></div></div>`;
  }
  const praise = () => { const p = $('#praise'); if (p) { p.innerHTML = icon('star'); p.classList.remove('go'); void p.offsetWidth; p.classList.add('go'); } pluck(4); };
  const wrong = (el) => { el.classList.remove('wob'); void el.offsetWidth; el.classList.add('wob'); };

  /* ---------- Faden: Hören ---------- */
  const START = {};
  START.hoeren = (L) => { go({ name: 'hoeren', id: L.id, t: 'hoeren', words: wordsOf(L.letter).slice(0, 4), heard: [] }); sayLetter(letterOf(L.letter)); };
  RENDER.hoeren = () => {
    const l = letterOf(lessonOf(view.id).letter);
    const cards = view.words.map((w, k) => `<button class="wcard ${view.heard.includes(k) ? 'heard' : ''}" data-act="h-word" data-k="${k}" aria-label="${w.de}">
      <div class="pic">${pic(w.art)}</div><span class="ar">${hl(w.ar)}</span></button>`).join('');
    const all = view.heard.length === view.words.length;
    return frame(`<div class="hoeren"><button class="bigletter ar" data-act="say-letter" aria-label="Buchstabe anhören">${l.ch}</button>
      <div class="wrow" dir="rtl">${cards}</div></div><div class="cta">${all ? `<button class="pill" data-act="finish" aria-label="Fertig">${icon('check')}</button>` : ''}</div>`);
  };

  /* ---------- Faden: Punkte (ب ت ث – dieselbe Schale, andere Punkte) ---------- */
  const SPEC = { ba: { up: 0, down: 1 }, ta: { up: 2, down: 0 }, tha: { up: 3, down: 0 } };
  const FAMILY = ['ba', 'ta', 'tha'];
  START.punkte = (L) => {
    const known = FAMILY.slice(0, FAMILY.indexOf(L.letter) + 1);
    const targets = [L.letter, ...shuffle(known), L.letter].slice(0, Math.max(3, known.length + 1));
    go({ name: 'punkte', id: L.id, t: 'punkte', targets, i: 0, pos: ['tray', 'tray', 'tray'], busy: false });
    sayLetter(letterOf(targets[0]));
  };
  const SLOT = {
    up: [[], [[230, 72]], [[204, 72], [256, 72]], [[204, 84], [256, 84], [230, 42]]],
    down: [[], [[230, 246]], [[204, 246], [256, 246]], [[204, 240], [256, 240], [230, 278]]],
    tray: [[48, 96], [48, 156], [48, 216]],
  };
  function dotXY(pos) {
    const idx = { up: 0, down: 0 };
    const n = { up: pos.filter((p) => p === 'up').length, down: pos.filter((p) => p === 'down').length };
    return pos.map((p, k) => (p === 'tray' ? SLOT.tray[k] : SLOT[p][n[p]][idx[p]++]));
  }
  RENDER.punkte = () => {
    const target = letterOf(view.targets[view.i]);
    const xy = dotXY(view.pos);
    const ds = xy.map(([x, y], k) => `<g class="dot" data-k="${k}" transform="translate(${x} ${y})"><circle r="34" fill="transparent"/><rect x="-15" y="-15" width="30" height="30" rx="5" transform="rotate(45)"/></g>`).join('');
    return frame(`<div class="punkte"><button class="target" data-act="p-say" aria-label="Buchstabe anhören"><span class="ar">${target.ch}</span>${icon('speaker')}</button>
      <svg class="lab" id="lab" viewBox="0 0 400 310"><ellipse class="zone" cx="230" cy="66" rx="92" ry="46"/><ellipse class="zone" cx="230" cy="254" rx="92" ry="46"/>
      <rect class="trayb" x="12" y="58" width="72" height="196" rx="26"/>
      <path class="bowl" id="bowl" d="M352 112 C358 186 322 204 230 204 C138 204 102 186 108 112"/>${ds}</svg>
      <div class="made ar" id="made"></div></div>`, view.targets.length, view.i);
  };
  AFTER.punkte = () => {
    const svg = $('#lab');
    const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let drag = null;
    svg.addEventListener('pointerdown', (e) => {
      const g = e.target.closest('.dot');
      if (!g || view.busy) return;
      drag = g; g.classList.add('drag'); e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch { /* egal */ }
    });
    svg.addEventListener('pointermove', (e) => { if (!drag) return; const p = pt(e); drag.setAttribute('transform', `translate(${p.x} ${p.y})`); });
    const drop = (e) => {
      if (!drag) return;
      const g = drag, k = Number(g.dataset.k), p = pt(e);
      drag = null; g.classList.remove('drag');
      view.pos[k] = p.x <= 110 ? 'tray' : p.y < 158 ? 'up' : 'down';
      pluck(k + 2, 0.1);
      const xy = dotXY(view.pos);
      svg.querySelectorAll('.dot').forEach((d) => { const [x, y] = xy[Number(d.dataset.k)]; d.setAttribute('transform', `translate(${x} ${y})`); });
      judge();
    };
    svg.addEventListener('pointerup', drop); svg.addEventListener('pointercancel', drop);
  };
  function judge() {
    const up = view.pos.filter((p) => p === 'up').length, down = view.pos.filter((p) => p === 'down').length;
    const made = FAMILY.find((id) => SPEC[id].up === up && SPEC[id].down === down);
    const out = $('#made');
    out.textContent = made ? letterOf(made).ch : '';
    if (!made) return;
    sayLetter(letterOf(made));
    if (made !== view.targets[view.i]) return;
    view.busy = true; $('#bowl').classList.add('ok'); out.classList.add('ok'); praise();
    later(() => {
      if (view.i + 1 >= view.targets.length) return finish();
      view.i += 1; view.pos = ['tray', 'tray', 'tray']; view.busy = false; render(); sayLetter(letterOf(view.targets[view.i]));
    }, 1900);
  }

  /* ---------- Faden: Finden (für ا: der gerade Strich) ---------- */
  START.finden = (L) => {
    const l = letterOf(L.letter);
    const others = shuffle(['ب', 'ت', 'ث', 'ن', 'د', 'ر', 'و', 'م']).slice(0, 7);
    const cells = shuffle([...Array(5).fill(l.ch), ...others]).map((ch) => ({ ch, hit: false, rot: Math.round(Math.random() * 10 - 5) }));
    go({ name: 'finden', id: L.id, t: 'finden', cells, left: 5, busy: false });
    sayLetter(l);
  };
  RENDER.finden = () => frame(`<div class="finden"><button class="target" data-act="say-letter" aria-label="Buchstabe anhören"><span class="ar">${letterOf(lessonOf(view.id).letter).ch}</span>${icon('speaker')}</button>
    <div class="field">${view.cells.map((c, k) => `<button class="fl ar ${c.hit ? 'hit' : ''}" style="--r:${c.rot}deg" data-act="f-pick" data-k="${k}">${c.ch}</button>`).join('')}</div></div>`, 5, 5 - view.left);

  /* ---------- Faden: Wörter (hören, Bild antippen) ---------- */
  function knownWords(L) { return KHAIT_LESSONS.slice(0, KHAIT_LESSONS.indexOf(L) + 1).flatMap((x) => wordsOf(x.letter)); }
  START.quiz = (L) => {
    const pool = knownWords(L), own = shuffle(wordsOf(L.letter));
    const rounds = Array.from({ length: 4 }, (_, i) => { const target = own[i % own.length]; return { target, options: shuffle([target, ...shuffle(pool.filter((w) => w.key !== target.key)).slice(0, 2)]) }; });
    go({ name: 'quiz', id: L.id, t: 'quiz', rounds, i: 0, busy: false });
    sayWord(rounds[0].target);
  };
  RENDER.quiz = () => {
    const r = view.rounds[view.i];
    return frame(`<div class="quiz"><button class="speaker" data-act="q-say" aria-label="Nochmal anhören">${icon('speaker')}</button>
      <div class="opts">${r.options.map((o, k) => `<button class="opt" data-act="q-pick" data-k="${k}" aria-label="${o.de}"><div class="pic">${pic(o.art)}</div></button>`).join('')}</div></div>`, view.rounds.length, view.i);
  };

  /* ---------- Faden: Sinne (Buch S. 12–14) ---------- */
  const sinne = () => CATEGORIES.find((c) => c.id === 'sinne');
  START.sinne = (L) => {
    const rounds = shuffle(sinne().extra);
    go({ name: 'sinne', id: L.id, t: 'sinne', rounds, i: 0, busy: false });
    speak('sinne/' + rounds[0].id, rounds[0].ar);
  };
  RENDER.sinne = () => {
    const r = view.rounds[view.i];
    return frame(`<div class="sinne"><button class="thing" data-act="s-say" aria-label="${r.de}"><div class="pic">${pic('dinge/' + r.id)}</div><span class="ar">${r.ar}</span></button>
      <div class="opts five" dir="rtl">${sinne().items.map((o) => `<button class="opt" data-act="s-pick" data-id="${o.id}" aria-label="${o.de}"><div class="pic">${pic('sinne/' + o.id)}</div></button>`).join('')}</div></div>`, view.rounds.length, view.i);
  };

  /* ---------- Faden: Gegensätze (Buch S. 16) ---------- */
  const pencil = (len) => `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#sketch)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"><path d="M${50 - len / 2} 44h${len - 12}l12 6-12 6h-${len - 12}z" fill="#E8A93A"/><path d="M${50 - len / 2} 44h8v12h-8z" fill="#D9667B"/></g></svg>`;
  START.gegensatz = (L) => {
    const arts = shuffle(['tiere/elefant', 'essen/apfel', 'tiere/fisch', 'tiere/hase', 'dinge/blume']);
    const order = [...shuffle(KHAIT_PAIRS), ...shuffle(KHAIT_PAIRS).slice(0, 2)];
    const rounds = order.map((p, i) => ({ p, art: arts[i % arts.length], bigLeft: Math.random() < 0.5 }));
    go({ name: 'gegensatz', id: L.id, t: 'gegensatz', rounds, i: 0, busy: false });
    speak('khait/' + rounds[0].p.id, rounds[0].p.ar);
  };
  RENDER.gegensatz = () => {
    const r = view.rounds[view.i];
    const side = (which) => `<button class="opt side" data-act="g-pick" data-w="${which}"><div class="pic ${r.p.kind} ${which}">${r.p.kind === 'size' ? pic(r.art) : pencil(which === 'big' ? 92 : 40)}</div></button>`;
    return frame(`<div class="quiz"><button class="speaker word" data-act="g-say" aria-label="${r.p.de}">${icon('speaker')}<span class="ar">${r.p.ar}</span></button>
      <div class="opts two">${r.bigLeft ? side('big') + side('small') : side('small') + side('big')}</div></div>`, view.rounds.length, view.i);
  };

  /* ---------- Faden: Mach mit! (Buch S. 7–8) ---------- */
  const bewegung = () => CATEGORIES.find((c) => c.id === 'bewegung');
  START.bewegung = (L) => { const items = bewegung().items; go({ name: 'bewegung', id: L.id, t: 'bewegung', items, i: 0 }); speak('bewegung/' + items[0].id, items[0].ar); };
  RENDER.bewegung = () => {
    const it = view.items[view.i];
    return frame(`<div class="bewegung"><button class="mover m-${it.id}" data-act="b-say" aria-label="${it.de}"><div class="pic">${pic('bewegung/' + it.id)}</div></button>
      <div class="ar sentence">${it.ar}</div><p class="hint">Mach es nach! Dann tippe auf den Haken.</p></div>
      <div class="cta"><button class="pill" data-act="b-next" aria-label="Geschafft">${icon('check')}</button></div>`, view.items.length, view.i);
  };

  /* ---------- Faden: Ich bin die Lehrerin (Rollentausch + eigene Stimme) ---------- */
  let rec = null;
  function stopRec() { if (rec) { try { rec.mr.stop(); } catch { /* schon aus */ } } }
  START.lehrerin = (L) => { const words = shuffle(wordsOf(L.letter)).slice(0, 3); go({ name: 'lehrerin', id: L.id, t: 'lehrerin', words, i: 0, recording: false }); sayWord(words[0]); };
  RENDER.lehrerin = () => {
    const w = view.words[view.i], canRec = !!(navigator.mediaDevices && window.MediaRecorder);
    const mine = voices.has(`${view.id}/${w.key}`);
    return frame(`<div class="lehrerin"><div class="board"><div class="pic">${pic(w.art)}</div><span class="ar">${hl(w.ar)}</span></div>
      <div class="lrow">${canRec ? `<button class="mic ${view.recording ? 'on' : ''}" data-act="l-rec" aria-label="Selbst sagen und aufnehmen">${icon('mic')}</button>` : ''}
      ${mine ? `<button class="round big me" data-act="l-mine" aria-label="Meine Stimme anhören">${icon('crown')}</button>` : ''}
      <button class="round big" data-act="l-say" aria-label="Anhören">${icon('speaker')}</button></div>
      <p class="hint">Du bist die Lehrerin: Sag das Wort, und Mama oder Baba spricht es dir nach.</p></div>
      <div class="cta"><button class="pill" data-act="l-next" aria-label="Weiter">${icon('check')}</button></div>`, view.words.length, view.i);
  };
  async function toggleRec() {
    if (rec) return stopRec();
    const v = view, w = view.words[view.i];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream), chunks = [];
      rec = { mr };
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop()); rec = null;
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
        const key = `${v.id}/${w.key}`;
        voices.set(key, blob);
        if (voiceDb) { try { voiceDb.transaction('voice', 'readwrite').objectStore('voice').put(blob, key); } catch { /* nur für diese Sitzung */ } }
        if (view !== v) return;
        view.recording = false; render();
        playBlob(blob, () => { if (view === v) later(() => sayWord(w), 350); }); // erst sie, dann das Vorbild
      };
      mr.start(); view.recording = true; render();
      setTimeout(() => { if (rec && rec.mr === mr) stopRec(); }, 4000);
    } catch { /* kein Mikrofon erlaubt */ }
  }

  /* ---------- Faden: Schreiben (Nachspuren mit Abdeckungs-Prüfung) ---------- */
  START.spuren = (L) => { go({ name: 'spuren', id: L.id, t: 'spuren', i: 0, n: 2 }); sayLetter(letterOf(L.letter)); };
  RENDER.spuren = () => frame(`<div class="spuren"><div class="pad"><canvas id="pad"></canvas><i class="startdot" id="startdot"></i></div></div>`, view.n, view.i);
  AFTER.spuren = () => {
    const cv = $('#pad'), L = lessonOf(view.id), l = letterOf(L.letter);
    const color = THREAD_COLORS[L.threads.indexOf('spuren')];
    const css = cv.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1), size = Math.round(css * dpr);
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const font = `${Math.round(size * 0.62)}px "Geeza Pro","Noto Naskh Arabic","Segoe UI",serif`;
    const glyph = (c, fill) => { c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fill; c.fillText(l.ch, size / 2, size * 0.5); };
    const off = document.createElement('canvas'); off.width = off.height = size;
    const octx = off.getContext('2d'); glyph(octx, '#000');
    const data = octx.getImageData(0, 0, size, size).data, step = Math.max(4, Math.round(size / 56)), pts = [];
    for (let y = 0; y < size; y += step) for (let x = 0; x < size; x += step) if (data[(y * size + x) * 4 + 3] > 110) pts.push({ x, y, hit: false });
    glyph(ctx, '#E6D8BE');
    if (pts.length) { // Startpunkt: oben bei ا, sonst rechts (Schreibrichtung)
      const s = l.id === 'alif' ? pts.reduce((a, b) => (b.y < a.y ? b : a)) : pts.filter((p) => p.y > size * 0.35).reduce((a, b) => (b.x > a.x ? b : a), pts[0]);
      const d = $('#startdot'); d.style.left = (s.x / size) * 100 + '%'; d.style.top = (s.y / size) * 100 + '%';
    }
    const w = size * 0.085; let last = null, hits = 0, ok = false, travelled = 0;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size }; };
    const mark = (p) => { for (const q of pts) if (!q.hit && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < (w * 0.8) ** 2) { q.hit = true; hits += 1; } };
    const lineTo = (p) => {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      const dist = Math.hypot(p.x - last.x, p.y - last.y), n = Math.max(1, Math.ceil(dist / (w * 0.4)));
      for (let i = 1; i <= n; i++) mark({ x: last.x + ((p.x - last.x) * i) / n, y: last.y + ((p.y - last.y) * i) / n });
      travelled += dist; last = p;
    };
    const check = () => {
      if (ok) return;
      const complete = pts.length > 20 ? hits / pts.length >= 0.8 : travelled > size * 0.8;
      if (!complete) return;
      ok = true; praise(); sayLetter(l);
      later(() => { if (view.i + 1 >= view.n) finish(); else { view.i += 1; render(); } }, 1500);
    };
    cv.addEventListener('pointerdown', (e) => { if (ok) return; cv.setPointerCapture(e.pointerId); last = pos(e); mark(last); lineTo({ x: last.x + 0.1, y: last.y }); $('#startdot').classList.add('off'); e.preventDefault(); });
    cv.addEventListener('pointermove', (e) => { if (last && !ok) lineTo(pos(e)); });
    const up = () => { last = null; check(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  };

  /* ---------- Elternbereich ---------- */
  RENDER.parent = () => {
    const weeks = [...KHAIT_LESSONS].reverse().map((L) => {
      const l = letterOf(L.letter);
      const hws = L.homework.map((h, k) => { const id = `${L.id}/${k}`; return `<label class="hw"><input type="checkbox" data-hw="${id}" ${hw[id] ? 'checked' : ''}><span>${h}</span></label>`; }).join('');
      const talk = L.talk.map((q, k) => `<li><span>${q.de}</span><button class="say" data-act="pa-talk" data-id="${L.id}" data-k="${k}"><span class="ar">${q.ar}</span>${icon('speaker')}</button></li>`).join('');
      const mine = [...voices.keys()].filter((k) => k.startsWith(L.id + '/')).map((k) => `<button class="clip" data-act="pa-voice" data-key="${k}">${icon('crown')} ${(wordsOf(L.letter).find((w) => `${L.id}/${w.key}` === k) || { de: 'Aufnahme' }).de}</button>`).join('');
      return `<section class="pweek"><h2><span class="ar">${l.ch}</span> ${L.topic ? L.topic.de : 'Buchstabe ' + l.tr}<small>${L.pages.length ? 'Buch S. ' + L.pages.join('–') + ' · ' : ''}${countDone(L)} von ${L.threads.length} Fäden</small></h2>
        <h3>Hausaufgaben</h3>${hws}${talk ? `<h3>Darüber sprechen</h3><ul class="talk">${talk}</ul>` : ''}
        ${L.note ? `<p class="note">${L.note}</p>` : ''}${mine ? `<h3>Ihre Stimme</h3><div class="clips">${mine}</div>` : ''}</section>`;
    }).join('');
    return `<div class="parent"><header class="top"><button class="round" data-act="home" aria-label="Schließen">${icon('back')}</button><strong>Für Eltern</strong><span class="sp"></span></header>
      <section class="pweek idea"><h2>Die Idee</h2><p>Jede Schulwoche ist ein Stickmotiv. Fünf kurze Übungen sind fünf Fäden. Pro Tag wächst ein Motiv nur um einen Faden: lieber fünf Tage je drei Minuten als einmal eine Viertelstunde. Der letzte Faden gehört ihr als Lehrerin.</p>
      <label class="hw"><input type="checkbox" data-set="daily" ${settings.daily ? 'checked' : ''}><span>Ein neuer Faden pro Tag und Motiv (empfohlen)</span></label>
      <p><a href="../">Zur bisherigen App</a> · <button class="link" data-act="pa-reset">Fortschritt zurücksetzen</button></p></section>${weeks}</div>`;
  };

  /* ---------- Eingaben ---------- */
  const ACT = {
    home: () => go({ name: 'cloth' }),
    open: (el) => { go({ name: 'week', id: el.dataset.id }); sayLetter(letterOf(lessonOf(el.dataset.id).letter)); },
    week: () => go({ name: 'week', id: view.id }),
    'say-letter': () => sayLetter(letterOf(lessonOf(view.id).letter)),
    thread: (el) => {
      const s = el.dataset.state;
      if (s === 'ready' || s === 'done') return START[el.dataset.t](lessonOf(view.id));
      wrong(el); pluck(0, 0.08);
      $('#hint').textContent = s === 'asleep' ? 'Der nächste Faden schläft bis morgen. Fertige Fäden kannst du noch einmal spielen.' : 'Ein Faden nach dem anderen.';
    },
    finish,
    'h-word': (el) => { const k = Number(el.dataset.k); sayWord(view.words[k]); if (!view.heard.includes(k)) { view.heard.push(k); pluck(k); render(); } },
    'p-say': () => sayLetter(letterOf(view.targets[view.i])),
    'f-pick': (el) => {
      const c = view.cells[Number(el.dataset.k)], l = letterOf(lessonOf(view.id).letter);
      if (c.hit || view.busy) return;
      if (c.ch !== l.ch) return wrong(el);
      c.hit = true; view.left -= 1; pluck(5 - view.left); sayLetter(l); render();
      if (view.left === 0) { view.busy = true; praise(); later(finish, 1500); }
    },
    'q-say': () => sayWord(view.rounds[view.i].target),
    'q-pick': (el) => {
      if (view.busy) return;
      const r = view.rounds[view.i];
      if (r.options[Number(el.dataset.k)].key !== r.target.key) return wrong(el);
      view.busy = true; el.classList.add('ok'); praise(); sayWord(r.target);
      later(() => { if (view.i + 1 >= view.rounds.length) return finish(); view.i += 1; view.busy = false; render(); sayWord(view.rounds[view.i].target); }, 1600);
    },
    's-say': () => { const r = view.rounds[view.i]; speak('sinne/' + r.id, r.ar); },
    's-pick': (el) => {
      if (view.busy) return;
      const r = view.rounds[view.i];
      if (el.dataset.id !== r.sense) return wrong(el);
      const part = sinne().items.find((x) => x.id === r.sense);
      view.busy = true; el.classList.add('ok'); praise(); speak('sinne/' + part.id, part.ar);
      later(() => { if (view.i + 1 >= view.rounds.length) return finish(); view.i += 1; view.busy = false; render(); ACT['s-say'](); }, 1700);
    },
    'g-say': () => { const p = view.rounds[view.i].p; speak('khait/' + p.id, p.ar); },
    'g-pick': (el) => {
      if (view.busy) return;
      const r = view.rounds[view.i];
      if (el.dataset.w !== r.p.pick) return wrong(el);
      view.busy = true; el.classList.add('ok'); praise(); ACT['g-say']();
      later(() => { if (view.i + 1 >= view.rounds.length) return finish(); view.i += 1; view.busy = false; render(); ACT['g-say'](); }, 1700);
    },
    'b-say': () => { const it = view.items[view.i]; speak('bewegung/' + it.id, it.ar); },
    'b-next': () => { pluck(view.i + 1); if (view.i + 1 >= view.items.length) return finish(); view.i += 1; render(); ACT['b-say'](); },
    'l-say': () => sayWord(view.words[view.i]),
    'l-rec': toggleRec,
    'l-mine': () => { const b = voices.get(`${view.id}/${view.words[view.i].key}`); if (b) { stopSound(); playBlob(b); } },
    'l-next': () => { stopRec(); pluck(view.i + 3); if (view.i + 1 >= view.words.length) return finish(); view.i += 1; view.recording = false; render(); sayWord(view.words[view.i]); },
    'pa-talk': (el) => { const q = lessonOf(el.dataset.id).talk[Number(el.dataset.k)]; speak(`khait/talk/${el.dataset.id}/${el.dataset.k}`, q.ar); },
    'pa-voice': (el) => { const b = voices.get(el.dataset.key); if (b) { stopSound(); playBlob(b); } },
    'pa-reset': () => { if (view.confirm) { done = {}; store.set('done', done); go({ name: 'parent' }); } else { view.confirm = true; $('[data-act="pa-reset"]').textContent = 'Wirklich? Nochmal tippen'; } },
  };
  app.addEventListener('click', (e) => { const el = e.target.closest('[data-act]'); if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el); });
  app.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.hw) { hw[t.dataset.hw] = t.checked; store.set('hw', hw); }
    if (t.dataset.set) { settings[t.dataset.set] = t.checked; store.set('settings', settings); }
  });
  // Eltern-Zugang: Zahnrad 1,5 Sekunden halten
  let gateTimer = null;
  app.addEventListener('pointerdown', (e) => { const g = e.target.closest('[data-gate]'); if (!g) return; g.classList.add('hold'); gateTimer = setTimeout(() => go({ name: 'parent' }), 1500); });
  const gateOff = () => { clearTimeout(gateTimer); const g = $('[data-gate]'); if (g) g.classList.remove('hold'); };
  app.addEventListener('pointerup', gateOff); app.addEventListener('pointerleave', gateOff); app.addEventListener('pointercancel', gateOff);
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  render();
  (async () => {
    await loadAll(await openDb('arabisch', 'rec'), 'rec', recs); // Aufnahmen der Eltern aus der bisherigen App
    voiceDb = await openDb('khait', 'voice');
    await loadAll(voiceDb, 'voice', voices);
  })();
})();
