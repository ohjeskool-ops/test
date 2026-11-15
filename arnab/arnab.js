/* Arnab (أَرْنَب = Hase) – Arabisch lernen, ein Buchstabe nach dem anderen.
   Lernziel je Buchstabe: erkennen, Laut sagen, Anfangslaut hören, schreiben, vier Ankerwörter kennen.
   Jede Einheit hat dieselben vier Schritte: Schauen (Film) → Hören → Schreiben → Malen.
   Allein-Modus: ein Knopf, alles gesprochen. Zusammen-Modus (Eltern halten gedrückt): Sprechen, Aufnehmen, Einstellungen.
   Kein Framework, kein Build. Wörter, Zeichnungen, Ausmalbilder und Eltern-Aufnahmen kommen aus der bisherigen App. */
(() => {
  const VERSION = 1;
  const app = document.getElementById('app');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const INK = '#2B2F3B';

  /* ---------- Symbole ---------- */
  const P = (d, extra = '') => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const ICONS = {
    film: '<rect x="4" y="7" width="24" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M13 11.5l8 4.5-8 4.5z" fill="currentColor"/>',
    hoeren: P('M9 14c0-5 3-8 7-8s7 3 7 7c0 4-4 5-4 9 0 3-2 5-5 5s-4-2-4-4') + P('M13 14c0-2 1-4 3-4s3 2 3 3'),
    schreiben: P('M6 26l3-9L22 4l6 6L15 23z') + P('M9 17l6 6'),
    malen: P('M19 5l8 8-9 9c-3 3-7 2-8-1l9-16z') + P('M9 22c-3 1-4 4-5 6 3 0 6-1 7-4'),
    karten: '<rect x="5" y="8" width="14" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2.6"/>' + P('M12 5h12a3 3 0 0 1 3 3v15'),
    quiz: P('M9 14c0-5 3-8 7-8s7 3 7 7c0 4-4 5-4 9 0 3-2 5-5 5s-4-2-4-4') + P('M13 14c0-2 1-4 3-4s3 2 3 3'),
    back: P('M20 6L10 16l10 10'), next: P('M12 6l10 10-10 10'), check: P('M5 17l7 7L27 8', 'stroke-width="3.6"'),
    play: '<path d="M10 5l18 11-18 11z" fill="currentColor"/>', skip: '<path d="M5 6l11 10L5 26zM16 6l11 10-11 10z" fill="currentColor"/>',
    speaker: P('M5 12h5l7-6v20l-7-6H5z') + P('M22 11c2 3 2 7 0 10M26 8c4 5 4 11 0 16'),
    mic: '<rect x="12" y="4" width="8" height="14" rx="4" fill="currentColor"/>' + P('M7 15c0 5 4 8 9 8s9-3 9-8M16 23v5'),
    album: '<rect x="4" y="6" width="24" height="20" rx="3" fill="none" stroke="currentColor" stroke-width="2.6"/>' + P('M4 22l7-7 5 5 4-4 8 8') + '<circle cx="21" cy="12" r="2.4" fill="currentColor"/>',
    people: '<circle cx="11" cy="10" r="4" fill="currentColor"/><circle cx="22" cy="13" r="3" fill="currentColor"/>' + P('M4 26c0-5 3-8 7-8s7 3 7 8M19 26c0-4 1-6 4-6s5 2 5 6'),
    star: '<path d="M16 3l3.8 8.2 9 1-6.7 6 1.9 8.8-8-4.6-8 4.6 1.9-8.8-6.7-6 9-1z" fill="currentColor"/>',
    trash: P('M7 9h18M12 9V6h8v3M9 9l1 17h12l1-17'), lock: '<rect x="8" y="14" width="16" height="12" rx="3" fill="currentColor"/>' + P('M11 14v-3a5 5 0 0 1 10 0v3'),
  };
  const icon = (n) => `<svg class="ic" viewBox="0 0 32 32" aria-hidden="true">${ICONS[n]}</svg>`;

  /* ---------- Speicher ---------- */
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem('arnab.' + k)); return v == null ? d : v; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('arnab.' + k, JSON.stringify(v)); } catch { /* voll oder gesperrt */ } },
  };
  let done = store.get('done', {});
  let album = store.get('album', {});
  let seen = store.get('seen', {});
  let settings = { sound: true, slow: true, easy: false, ...store.get('settings', {}) };
  const USTEPS = ['film', 'hoeren', 'schreiben', 'malen'];
  const TSTEPS = ['karten', 'quiz', 'malen'];
  const unitOf = (id) => AR_UNITS.find((u) => u.id === id);
  const catOf = (id) => CATEGORIES.find((c) => c.id === id);
  const letterOf = (id) => ALPHABET.find((l) => l.id === id);
  const stepsOf = (kind) => (kind === 'unit' ? USTEPS : TSTEPS);
  const isDone = (id, step) => !!(done[id] && done[id][step]);
  const nextStep = (kind, id) => stepsOf(kind).find((s) => !isDone(id, s)) || null;
  function nextTarget() {
    for (const u of AR_UNITS) { const s = nextStep('unit', u.id); if (s) return { kind: 'unit', id: u.id, step: s }; }
    for (const t of AR_THEMES) { const s = nextStep('theme', t); if (s) return { kind: 'theme', id: t, step: s }; }
    return null;
  }

  /* ---------- Ton ---------- */
  const recs = new Map();
  const voices = new Map();
  let voiceDb = null;
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
    const blob = key && recs.get(key);
    if (blob) return playBlob(blob);
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(ar);
    u.lang = 'ar-SA'; if (arVoice) u.voice = arVoice; u.rate = settings.slow ? 0.7 : 0.95;
    speechSynthesis.speak(u);
  }
  const saySound = (u) => speak('laut/' + u.id, u.sound);
  const sayWord = (w) => speak(w.key, w.ar);
  const farben = () => catOf('farben');
  const sayColor = (id) => { const c = farben().items.find((x) => x.id === id); speak('farben/' + id, c.ar); };
  let ac = null;
  const SCALE = [293.66, 329.63, 369.99, 392, 440, 493.88, 554.37, 587.33];
  function pluck(i, vol = 0.15) {
    if (!settings.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle'; o.frequency.value = SCALE[((i % 8) + 8) % 8];
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.55);
    } catch { /* kein Ton */ }
  }

  /* ---------- Bilder ---------- */
  const X = (inner) => `<svg class="art" viewBox="0 0 100 100" aria-hidden="true"><g filter="url(#sketch)" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${inner}</g></svg>`;
  const OWN = {
    'a/schnee': X('<path d="M50 12v76M17 31l66 38M83 31L17 69" stroke="#5FA8D3" stroke-width="5"/><path d="M40 20l10 9 10-9M40 80l10-9 10 9M20 46l11-3-3-12M80 54l-11 3 3 12M69 31l11 3-3 12M31 69l-11-3 3-12" stroke="#5FA8D3" stroke-width="3.4"/>'),
    'a/drei': X('<circle cx="50" cy="50" r="38" fill="#F7D154"/><text x="50" y="72" font-size="62" text-anchor="middle" fill="' + INK + '" stroke="none" font-family="Geeza Pro, Noto Naskh Arabic, serif">٣</text>'),
    'a/krone': X('<path d="M16 74l-4-42 22 20 16-32 16 32 22-20-4 42z" fill="#F7D154"/><path d="M16 82h68"/><circle cx="50" cy="60" r="4" fill="#E0524B"/><circle cx="30" cy="64" r="3" fill="#8EC5E8"/><circle cx="70" cy="64" r="3" fill="#8EC5E8"/>'),
    'a/ananas': X('<path d="M50 36Q38 12 50 6Q62 12 50 36ZM50 36Q28 20 24 30Q36 34 50 36ZM50 36Q72 20 76 30Q64 34 50 36Z" fill="#7DBB6B"/><ellipse cx="50" cy="64" rx="22" ry="28" fill="#F7D154"/><path d="M33 50l30 30M40 42l26 26M30 62l22 24M67 50L37 80M60 42L34 68M70 62L48 86" stroke-width="1.4"/>'),
    'a/mama': X('<path d="M22 56Q18 14 50 12Q82 14 78 56Q80 80 68 88L32 88Q20 80 22 56Z" fill="#7A4B35"/><ellipse cx="50" cy="52" rx="20" ry="23" fill="#F2C9A5"/><circle cx="42" cy="48" r="2.4" fill="' + INK + '"/><circle cx="58" cy="48" r="2.4" fill="' + INK + '"/><path d="M41 60Q50 68 59 60"/><circle cx="36" cy="57" r="4" fill="#F4A6B8" stroke="none"/><circle cx="64" cy="57" r="4" fill="#F4A6B8" stroke="none"/>'),
    'a/tuer': X('<path d="M28 90L28 32Q28 10 50 10Q72 10 72 32L72 90Z" fill="#A9795A"/><path d="M36 82L36 36Q36 20 50 20Q64 20 64 36L64 82Z" stroke-width="1.5"/><circle cx="62" cy="58" r="3.6" fill="#F7D154"/><path d="M16 90h68"/>'),
    'a/datteln': X('<path d="M50 10Q52 26 50 34M50 34Q40 38 36 46M50 34Q54 40 54 48M50 34Q62 36 68 44"/><ellipse cx="34" cy="62" rx="10" ry="17" transform="rotate(-14 34 62)" fill="#7A4B35"/><ellipse cx="54" cy="66" rx="10" ry="18" fill="#8F5A3C"/><ellipse cx="72" cy="60" rx="10" ry="17" transform="rotate(16 72 60)" fill="#7A4B35"/><path d="M31 54Q33 62 31 70M53 56Q55 66 53 76" stroke="#F2C879" stroke-width="1.6"/>'),
    'a/krokodil': X('<path d="M8 60Q8 44 32 42Q42 28 56 40L90 46Q97 48 95 55L92 59L60 63Q40 76 20 71Q8 69 8 60Z" fill="#7DBB6B"/><path d="M60 63L64 57L68 62L72 56L76 61L80 55L84 60L88 55L92 59" fill="#FFFFFF"/><circle cx="46" cy="42" r="6" fill="#FFFFFF"/><circle cx="47" cy="42" r="2.6" fill="' + INK + '" stroke="none"/><circle cx="89" cy="49" r="1.4" fill="' + INK + '"/><path d="M12 52l5-6 4 6 5-6 4 5"/>'),
    'a/stier': X('<path d="M30 44Q10 40 12 20Q22 34 36 36Z" fill="#FFF3DC"/><path d="M70 44Q90 40 88 20Q78 34 64 36Z" fill="#FFF3DC"/><ellipse cx="50" cy="54" rx="25" ry="23" fill="#A9795A"/><ellipse cx="50" cy="68" rx="15" ry="11" fill="#F4A6B8"/><circle cx="40" cy="48" r="2.8" fill="' + INK + '"/><circle cx="60" cy="48" r="2.8" fill="' + INK + '"/><circle cx="44" cy="68" r="2" fill="' + INK + '"/><circle cx="56" cy="68" r="2" fill="' + INK + '"/><circle cx="50" cy="80" r="5" stroke="#E8A93A" stroke-width="2.6"/>'),
  };
  const pic = (art) => OWN[art] || Sketch.get(art) || '';
  const hl = (ar) => { const m = ar.match(/^(.[ً-ْٰ]*)([\s\S]*)$/u); return m ? `<b>${m[1]}</b>${m[2]}` : ar; };
  const HARE = () => pic('tiere/hase');
  // Bild zu einem Themen-Wort (Farbe, Zahl oder Zeichnung)
  function themePic(c, it) {
    if (c.type === 'color') return Sketch.color(it.color);
    if (c.type === 'number') return `<div class="numpic"><span class="ar">${it.digit}</span><i>${'●'.repeat(it.n)}</i></div>`;
    return Sketch.motif(c.id, it.id) || `<span class="emo">${it.emoji || ''}</span>`;
  }

  /* ---------- Rahmen ---------- */
  let view = { name: 'home' };
  const RENDER = {}, AFTER = {};
  function go(next) { stopRec(); stopSound(); view = next; render(); }
  function later(fn, ms) { const v = view; setTimeout(() => { if (view === v) fn(); }, ms); }
  function render() { app.className = 'v-' + view.name; app.innerHTML = RENDER[view.name](); if (AFTER[view.name]) AFTER[view.name](); }
  const dots = (n, i) => `<div class="dots">${Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'd' : k === i ? 'c' : ''}"></i>`).join('')}</div>`;
  const STEP_COLOR = { film: '#E0524B', hoeren: '#F4A046', schreiben: '#7DBB6B', malen: '#5FA8D3', karten: '#E0524B', quiz: '#F4A046' };
  function frame(body, n = 0, i = 0, right = '') {
    return `<div class="act" style="--c:${STEP_COLOR[view.step] || '#E0524B'}"><header class="top"><button class="round" data-act="leave" aria-label="Zurück">${icon('back')}</button>
      ${n ? dots(n, i) : '<span></span>'}${right || `<span class="chip">${icon(view.step)}</span>`}</header>${body}<div class="praise" id="praise"></div></div>`;
  }
  const praise = () => { const p = $('#praise'); if (p) { p.innerHTML = icon('star'); p.classList.remove('burst'); void p.offsetWidth; p.classList.add('burst'); } pluck(4); later(() => pluck(7), 140); };
  const wrong = (el) => { el.classList.remove('wob'); void el.offsetWidth; el.classList.add('wob'); };
  const owner = () => ({ kind: view.kind, id: view.id });
  function startStep(kind, id, step) { START[step]({ kind, id, step }); }
  function finishStep() {
    const { kind, id, step } = view;
    done[id] = { ...(done[id] || {}), [step]: true }; store.set('done', done);
    go({ name: 'cheer', kind, id, step });
  }

  /* ---------- Start (Allein-Modus) ---------- */
  const pips = (kind, id) => `<span class="pips">${stepsOf(kind).map((s) => `<i class="${isDone(id, s) ? 'on' : ''}" style="--c:${STEP_COLOR[s]}"></i>`).join('')}</span>`;
  RENDER.home = () => {
    const t = nextTarget();
    const path = AR_UNITS.map((u) => `<button class="node ${t && t.id === u.id ? 'cur' : ''} ${USTEPS.every((s) => isDone(u.id, s)) ? 'full' : ''}" data-act="unit" data-id="${u.id}" aria-label="Buchstabe ${letterOf(u.letter).tr}">
      <span class="ar">${letterOf(u.letter).ch}</span>${pips('unit', u.id)}</button>`).join('') + AR_NEXT.map((ch) => `<span class="node ghost"><span class="ar">${ch}</span></span>`).join('');
    const themes = AR_THEMES.map((id) => `<button class="tnode ${TSTEPS.every((s) => isDone(id, s)) ? 'full' : ''}" data-act="theme" data-id="${id}" aria-label="${catOf(id).de}">${Sketch.nav(id) || catOf(id).icon}${pips('theme', id)}</button>`).join('');
    const label = t ? (t.kind === 'unit' ? `<span class="ar">${letterOf(unitOf(t.id).letter).ch}</span>` : `<span class="gi">${Sketch.nav(t.id) || ''}</span>`) + icon(t.step) : icon('album');
    return `<header class="top"><button class="round" data-act="album" aria-label="Mein Album">${icon('album')}</button><span class="brand ar">أَرْنَب</span>
      <button class="gate" data-gate aria-label="Zusammen-Modus (gedrückt halten)">${icon('people')}<span id="gatehint">Zusammen</span></button></header>
      <div class="borte" aria-hidden="true"></div><div class="hero"><button class="hare" data-act="hare" aria-label="Hase">${HARE()}</button>
      <button class="go" data-act="${t ? 'weiter' : 'album'}" aria-label="Weiter"><span class="golabel">${label}</span>${icon('play')}</button></div>
      <div class="path" dir="rtl">${path}</div><div class="themes">${themes}</div>`;
  };
  const STEPNAMES = { film: 'Schauen', hoeren: 'Hören', schreiben: 'Schreiben', malen: 'Malen', karten: 'Schauen', quiz: 'Hören' };
  function hub(kind, id, head) {
    const nx = nextStep(kind, id);
    const steps = stepsOf(kind).map((s) => {
      const st = isDone(id, s) ? 'done' : s === nx ? 'ready' : 'later';
      return `<button class="step ${st}" style="--c:${STEP_COLOR[s]}" data-act="step" data-s="${s}" data-st="${st}" aria-label="${STEPNAMES[s]}">${icon(st === 'later' ? 'lock' : s)}${st === 'done' ? `<span class="tick">${icon('check')}</span>` : ''}</button>`;
    }).join('');
    return `<header class="top"><button class="round" data-act="home" aria-label="Zurück">${icon('back')}</button><span></span><span class="sp"></span></header>
      <div class="hub">${head}<div class="steps">${steps}</div></div>`;
  }
  RENDER.unit = () => { const u = unitOf(view.id), l = letterOf(u.letter); return hub('unit', u.id, `<button class="bigletter ar" data-act="say-sound" aria-label="Laut anhören">${l.ch}</button>`); };
  RENDER.theme = () => { const c = catOf(view.id); return hub('theme', c.id, `<div class="bigtheme">${Sketch.nav(c.id) || c.icon}<span class="ar">${c.ar}</span></div>`); };
  RENDER.cheer = () => {
    const { kind, id } = view, nx = nextStep(kind, id);
    const pic2 = view.step === 'malen' ? `<div class="polaroid">${sceneSvg(view.scene || (kind === 'unit' ? unitOf(id).scene : id), album[view.scene || (kind === 'unit' ? unitOf(id).scene : id)] || {}, false)}</div>` : `<div class="hare hop">${HARE()}</div>`;
    return `<div class="cheer">${pic2}<div class="stars">${icon('star')}${icon('star')}${icon('star')}</div>
      <div class="row"><button class="round big" data-act="home" aria-label="Zum Start">${icon('back')}</button>
      <button class="go small" data-act="cheer-next" aria-label="Weiter">${nx ? icon(nx) : icon('album')}${icon('play')}</button></div></div>`;
  };
  AFTER.cheer = () => [0, 2, 4, 7].forEach((n, i) => later(() => pluck(n, 0.2), 150 + i * 150));

  /* ---------- Schritt 1: Schauen (30-Sekunden-Film) ---------- */
  const START = {};
  const SPEC = { ba: { up: 0, down: 1 }, ta: { up: 2, down: 0 }, tha: { up: 3, down: 0 } };
  const SLOT = { up: [[], [[230, 72]], [[204, 72], [256, 72]], [[204, 84], [256, 84], [230, 42]]], down: [[], [[230, 246]]] };
  const BOWL = 'M352 112 C358 186 322 204 230 204 C138 204 102 186 108 112';
  function glyph(id) {
    const sp = SPEC[id], stroke = id === 'alif' ? 'M215 40 L215 268' : BOWL;
    const ds = sp ? [...SLOT.up[sp.up], ...SLOT.down[sp.down]].map(([x, y], k) => `<g transform="translate(${x} ${y})"><rect class="gd" style="animation-delay:${1.9 + k * 0.4}s" x="-15" y="-15" width="30" height="30" rx="5" transform="rotate(45)"/></g>`).join('') : '';
    return `<svg class="glyph" viewBox="60 0 340 310" aria-hidden="true"><path class="gs" pathLength="1" d="${stroke}"/>${ds}</svg>`;
  }
  function filmOf(u) {
    const l = letterOf(u.letter);
    return [
      { html: glyph(l.id), say: [[1600, () => saySound(u)], [3300, () => saySound(u)]], dur: 5000 },
      { html: `<div class="f-sound ar">${l.ch}</div>`, say: [[300, () => saySound(u)], [1700, () => saySound(u)], [3100, () => saySound(u)]], dur: 4600 },
      ...u.words.map((w) => ({ html: `<div class="f-word"><div class="pic popin">${pic(w.art)}</div><span class="ar wipe">${hl(w.ar)}</span></div>`, say: [[350, () => saySound(u)], [1500, () => sayWord(w)]], dur: 4000 })),
      { html: `<div class="f-ask"><span class="ar">${l.ch}</span><div class="f-row">${u.words.map((w, k) => `<div class="pic bob" style="animation-delay:${k * 0.25}s">${pic(w.art)}</div>`).join('')}</div></div>`, say: [[300, () => saySound(u)]], dur: 4000 },
    ];
  }
  START.film = (o) => go({ name: 'film', ...o, steps: filmOf(unitOf(o.id)), i: 0 });
  RENDER.film = () => frame(`<div class="stage">${view.steps[view.i].html}</div>
    <div class="cta" id="fcta">${seen[view.id] ? `<button class="round" data-act="finish" aria-label="Film überspringen">${icon('skip')}</button>` : ''}</div>`, view.steps.length, view.i);
  AFTER.film = () => {
    const st = view.steps[view.i];
    st.say.forEach(([at, fn]) => later(fn, at));
    later(() => {
      if (view.i + 1 < view.steps.length) { view.i += 1; return render(); }
      seen[view.id] = true; store.set('seen', seen);
      $('#fcta').innerHTML = `<button class="pill hopping" data-act="finish" aria-label="Weiter">${icon('check')}</button>`;
    }, st.dur);
  };

  /* ---------- Schritt 2: Hören ---------- */
  // Buchstabe: „Welches Bild fängt mit diesem Laut an?" – Themen: „Welches Bild ist das Wort?"
  const allWords = () => AR_UNITS.flatMap((u) => u.words.map((w) => ({ ...w, unit: u.id })));
  START.hoeren = (o) => {
    const u = unitOf(o.id), known = AR_UNITS.slice(0, AR_UNITS.indexOf(u) + 1);
    const rounds = Array.from({ length: 5 }, (_, i) => {
      const tu = i === 2 && known.length > 1 ? known[Math.floor(Math.random() * (known.length - 1))] : u; // eine Runde wiederholt einen früheren Buchstaben
      const target = { ...tu.words[i % tu.words.length], unit: tu.id };
      const others = shuffle(allWords().filter((w) => w.unit !== tu.id)).slice(0, i < 3 ? 1 : 2);
      return { prompt: () => saySound(tu), badge: letterOf(tu.letter).ch, target, options: shuffle([target, ...others]), seq: true };
    });
    go({ name: 'hoeren', ...o, rounds, i: 0, busy: false });
  };
  START.quiz = (o) => {
    const c = catOf(o.id), mk = (it) => ({ id: it.id, ar: it.ar, key: `${c.id}/${it.id}`, html: themePic(c, it) });
    const rounds = shuffle(c.items).slice(0, 5).map((it) => ({ prompt: () => speak(`${c.id}/${it.id}`, it.ar), target: mk(it), options: shuffle([it, ...shuffle(c.items.filter((x) => x.id !== it.id)).slice(0, 2)]).map(mk), seq: false }));
    go({ name: 'hoeren', ...o, rounds, i: 0, busy: false });
  };
  RENDER.hoeren = () => {
    const r = view.rounds[view.i];
    return frame(`<div class="hoeren"><button class="speaker" data-act="h-say" aria-label="Nochmal anhören">${r.badge ? `<span class="ar">${r.badge}</span>` : ''}${icon('speaker')}</button>
      <div class="opts n${r.options.length}">${r.options.map((o, k) => `<button class="opt" data-act="h-pick" data-k="${k}"><div class="pic">${o.html || pic(o.art)}</div></button>`).join('')}</div></div>`, view.rounds.length, view.i);
  };
  function playRound() {
    const r = view.rounds[view.i];
    r.prompt();
    if (!r.seq) return;
    r.options.forEach((o, k) => later(() => { if (view.busy) return; sayWord(o); const el = $(`.opt[data-k="${k}"]`); if (el) { el.classList.remove('bounce'); void el.offsetWidth; el.classList.add('bounce'); } }, 1400 + k * 1500));
  }
  AFTER.hoeren = () => later(playRound, 350);

  /* ---------- Themen Schritt 1: Karten ---------- */
  START.karten = (o) => go({ name: 'karten', ...o, i: 0 });
  RENDER.karten = () => {
    const c = catOf(view.id), it = c.items[view.i], last = view.i === c.items.length - 1;
    return frame(`<div class="karten"><button class="round big" data-act="k-prev" ${view.i === 0 ? 'disabled' : ''} aria-label="Zurück">${icon('back')}</button>
      <button class="kcard" data-act="k-say" aria-label="Anhören"><div class="pic">${themePic(c, it)}</div><span class="ar">${it.ar}</span></button>
      ${last ? `<button class="pill" data-act="finish" aria-label="Fertig">${icon('check')}</button>` : `<button class="round big" data-act="k-next" aria-label="Weiter">${icon('next')}</button>`}</div>`, c.items.length, view.i);
  };
  AFTER.karten = () => later(() => ACT['k-say'](), 300);

  /* ---------- Schritt 3: Schreiben ---------- */
  START.schreiben = (o) => { go({ name: 'schreiben', ...o, i: 0, n: 2 }); saySound(unitOf(o.id)); };
  RENDER.schreiben = () => frame(`<div class="schreiben"><div class="pad"><canvas id="pad"></canvas><i class="startdot" id="startdot"></i></div></div>`, view.n, view.i);
  AFTER.schreiben = () => {
    const cv = $('#pad'), u = unitOf(view.id), l = letterOf(u.letter), second = view.i === 1;
    const css = cv.clientWidth, dpr = Math.min(2, window.devicePixelRatio || 1), size = Math.round(css * dpr);
    cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    const font = `${Math.round(size * 0.62)}px "Geeza Pro","Noto Naskh Arabic","Segoe UI",serif`;
    const draw = (c, fill) => { c.font = font; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = fill; c.fillText(l.ch, size / 2, size * 0.5); };
    const off = document.createElement('canvas'); off.width = off.height = size;
    const octx = off.getContext('2d'); draw(octx, '#000');
    const data = octx.getImageData(0, 0, size, size).data, step = Math.max(4, Math.round(size / 56)), pts = [];
    for (let y = 0; y < size; y += step) for (let x = 0; x < size; x += step) if (data[(y * size + x) * 4 + 3] > 110) pts.push({ x, y, hit: false });
    draw(ctx, second ? '#F3EBDD' : '#E3D6BF'); // zweite Runde: Vorlage fast unsichtbar
    if (pts.length) {
      const s = l.id === 'alif' ? pts.reduce((a, b) => (b.y < a.y ? b : a)) : pts.filter((p) => p.y > size * 0.35).reduce((a, b) => (b.x > a.x ? b : a), pts[0]);
      const d = $('#startdot'); d.style.left = (s.x / size) * 100 + '%'; d.style.top = (s.y / size) * 100 + '%';
    }
    const w = size * 0.085; let last = null, hits = 0, ok = false, travelled = 0;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * size, y: ((e.clientY - r.top) / r.height) * size }; };
    const mark = (p) => { for (const q of pts) if (!q.hit && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < (w * 0.8) ** 2) { q.hit = true; hits += 1; } };
    const lineTo = (p) => {
      ctx.strokeStyle = STEP_COLOR.schreiben; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      const dist = Math.hypot(p.x - last.x, p.y - last.y), n = Math.max(1, Math.ceil(dist / (w * 0.4)));
      for (let i = 1; i <= n; i++) mark({ x: last.x + ((p.x - last.x) * i) / n, y: last.y + ((p.y - last.y) * i) / n });
      travelled += dist; last = p;
    };
    const check = () => {
      if (ok) return;
      const need = settings.easy ? 0.5 : second ? 0.7 : 0.8;
      if (!(pts.length > 20 ? hits / pts.length >= need : travelled > size * 0.8)) return;
      ok = true; praise(); saySound(u);
      later(() => { if (view.i + 1 >= view.n) finishStep(); else { view.i += 1; render(); } }, 1500);
    };
    cv.addEventListener('pointerdown', (e) => { if (ok) return; try { cv.setPointerCapture(e.pointerId); } catch { /* egal */ } last = pos(e); mark(last); lineTo({ x: last.x + 0.1, y: last.y }); $('#startdot').classList.add('off'); e.preventDefault(); });
    cv.addEventListener('pointermove', (e) => { if (last && !ok) lineTo(pos(e)); });
    const up = () => { last = null; check(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  };

  /* ---------- Schritt 4: Malen (nach Buchstaben) und freies Malen ---------- */
  function sceneSvg(id, fills, interactive = true) {
    const S = AR_SCENES[id];
    let html;
    if (S && S.regions) {
      html = `<svg class="scene" viewBox="-2 -2 144 104" aria-label="Ausmalbild"><g filter="url(#sketch)" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round">` +
        S.regions.map(([rid, d, def]) => `<path class="region" data-act="m-fill" data-r="${rid}" d="${d}" fill="${fills[rid] || def}"/>`).join('') +
        `<g fill="none" stroke-linecap="round" pointer-events="none">${S.deco || ''}</g></g></svg>`;
    } else html = Sketch.scene(id, fills);
    return interactive ? html : html.replaceAll('data-act="m-fill"', '');
  }
  const hexOf = (cid) => farben().items.find((x) => x.id === cid).color;
  const lettersOf = (scene) => (AR_SCENES[scene] && AR_SCENES[scene].letters) || {};
  function openMalen(o, scene, guided) {
    const letters = guided ? lettersOf(scene) : {};
    const first = guided && Object.values(letters)[0] ? AR_KEY[Object.values(letters)[0]] : farben().items[0].id;
    go({ name: 'malen', ...o, step: 'malen', scene, letters, guided, fills: { ...(guided ? {} : album[scene] || {}) }, color: first });
  }
  START.malen = (o) => openMalen(o, o.kind === 'unit' ? unitOf(o.id).scene : o.id, o.kind === 'unit');
  const guidedOk = () => Object.entries(view.letters).every(([r, l]) => view.fills[r] === hexOf(AR_KEY[l]));
  const malenReady = () => (view.guided ? guidedOk() : Object.keys(view.fills).length >= 3);
  RENDER.malen = () => {
    const used = new Set(Object.values(view.letters));
    const chips = farben().items.map((it) => {
      const l = [...used].find((x) => AR_KEY[x] === it.id);
      return `<button class="col ${it.id === view.color ? 'sel' : ''}" data-act="m-color" data-id="${it.id}" style="--c:${it.color}" aria-label="${it.de}">${l ? `<span class="ar">${letterOf(l).ch}</span>` : ''}</button>`;
    }).join('');
    return frame(`<div class="malen"><div class="scene-card">${sceneSvg(view.scene, view.fills)}</div>
      <div class="palette">${chips}<button class="col tool" data-act="m-reset" aria-label="Alles löschen">${icon('trash')}</button></div></div>`,
    0, 0, `<span id="mdone">${malenReady() ? `<button class="pill sm hopping" data-act="m-done" aria-label="Fertig">${icon('check')}</button>` : `<span class="chip">${icon('malen')}</span>`}</span>`);
  };
  function labelRegions() {
    const svg = $('.scene'); if (!svg) return;
    $$('.rl', svg).forEach((t) => t.remove());
    Object.entries(view.letters).forEach(([r, l]) => {
      if (view.fills[r] === hexOf(AR_KEY[l])) return;
      const el = $(`.region[data-r="${r}"]`, svg); if (!el) return;
      const b = el.getBBox(), t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      const fs = Math.max(6, Math.min(13, Math.min(b.width, b.height) * 0.62));
      t.setAttribute('x', b.x + b.width / 2); t.setAttribute('y', b.y + b.height / 2 + fs * 0.18); t.setAttribute('font-size', fs);
      t.setAttribute('class', 'rl'); t.textContent = letterOf(l).ch; svg.appendChild(t);
    });
  }
  AFTER.malen = () => { labelRegions(); if (view.guided) later(() => sayColor(view.color), 400); };
  function saveMalen() { album[view.scene] = { ...view.fills }; store.set('album', album); }

  /* ---------- Album ---------- */
  const albumScenes = () => [...AR_UNITS.map((u) => u.scene), ...AR_THEMES].filter((s, i, a) => a.indexOf(s) === i && album[s]);
  RENDER.album = () => {
    const list = albumScenes();
    return `<header class="top"><button class="round" data-act="home" aria-label="Zurück">${icon('back')}</button><span class="brand small">${icon('album')}</span><span class="sp"></span></header>
      <div class="albumgrid">${list.length ? list.map((s) => `<button class="polaroid" data-act="a-open" data-s="${s}" aria-label="Bild weitermalen">${sceneSvg(s, album[s], false)}</button>`).join('') : `<div class="empty"><div class="hare">${HARE()}</div>${icon('malen')}</div>`}</div>`;
  };

  /* ---------- Zusammen-Modus ---------- */
  let rec = null;
  function stopRec() { if (rec) { try { rec.mr.stop(); } catch { /* schon aus */ } } }
  RENDER.zusammen = () => {
    const units = AR_UNITS.map((u) => {
      const l = letterOf(u.letter), n = USTEPS.filter((s) => isDone(u.id, s)).length;
      const mine = u.words.filter((w) => voices.has(`${u.id}/${w.id}`)).map((w) => `<button class="clip" data-act="z-voice" data-key="${u.id}/${w.id}">${icon('play')} ${w.de}</button>`).join('');
      return `<section class="card"><h2><span class="ar">${l.ch}</span> Laut „${l.snd.split(' ')[0]}“<small>${n} von 4 Schritten allein geschafft</small></h2>
        <p class="words">${u.words.map((w) => `<span><b class="ar">${w.ar}</b> ${w.de}</span>`).join('')}</p>
        <button class="btn" data-act="z-sprechen" data-id="${u.id}">${icon('mic')} Zusammen sprechen</button>
        <h3>Ohne Bildschirm</h3><ul>${(AR_TALK[u.id] || []).map((t) => `<li>${t}</li>`).join('')}</ul>${mine ? `<h3>Ihre Aufnahmen</h3><div class="clips">${mine}</div>` : ''}</section>`;
    }).join('');
    const sw = (k, t, s) => `<label class="set"><span><b>${t}</b><small>${s}</small></span><input type="checkbox" class="sw" data-set="${k}" ${settings[k] ? 'checked' : ''}></label>`;
    return `<div class="parent"><header class="top"><button class="round" data-act="home" aria-label="Zurück">${icon('back')}</button><strong>Zusammen</strong><span class="sp"></span></header>
      <section class="card"><p>Allein übt sie Erkennen, Hören, Schreiben und Malen. Das Sprechen braucht euch: Hier sagt sie die Wörter, ihr hört zu, und sie kann sich aufnehmen.</p></section>${units}
      <section class="card"><h2>Einstellungen</h2>${sw('slow', 'Langsam sprechen', 'Gilt für die Sprachausgabe des Geräts.')}${sw('easy', 'Schreiben großzügig prüfen', 'Der Buchstabe gilt schon als geschrieben, wenn die Hälfte abgedeckt ist.')}${sw('sound', 'Töne', 'Kurze Töne bei Erfolg.')}
      <p><button class="link" data-act="z-reset">Fortschritt zurücksetzen</button> · <button class="link" data-act="z-reload">Neu laden</button> · <a href="../">Bisherige App</a> · <small>Version ${VERSION}</small></p></section></div>`;
  };
  RENDER.sprechen = () => {
    const u = unitOf(view.id), w = u.words[view.i], canRec = !!(navigator.mediaDevices && window.MediaRecorder), mine = voices.has(`${u.id}/${w.id}`);
    return `<div class="act" style="--c:#D9667B"><header class="top"><button class="round" data-act="zusammen" aria-label="Zurück">${icon('back')}</button>${dots(u.words.length, view.i)}<span class="chip">${icon('people')}</span></header>
      <div class="sprechen"><div class="kcard still"><div class="pic">${pic(w.art)}</div><span class="ar">${hl(w.ar)}</span><small>${w.de}</small></div>
      <div class="row"><button class="round big" data-act="sp-say" aria-label="Vorsprechen">${icon('speaker')}</button>
      ${canRec ? `<button class="mic ${view.recording ? 'on' : ''}" data-act="sp-rec" aria-label="Aufnehmen">${icon('mic')}</button>` : ''}
      ${mine ? `<button class="round big" data-act="sp-mine" aria-label="Ihre Aufnahme anhören">${icon('play')}</button>` : ''}
      <button class="pill" data-act="sp-next" aria-label="Weiter">${icon('check')}</button></div>
      <p class="hint">Erst vorsprechen lassen, dann sagt sie das Wort. Mit dem Mikrofon kann sie sich aufnehmen und anhören.</p></div></div>`;
  };
  async function toggleRec() {
    if (rec) return stopRec();
    const v = view, u = unitOf(view.id), w = u.words[view.i];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream), chunks = [];
      rec = { mr };
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop()); rec = null;
        const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }), key = `${u.id}/${w.id}`;
        voices.set(key, blob);
        if (voiceDb) { try { voiceDb.transaction('voice', 'readwrite').objectStore('voice').put(blob, key); } catch { /* nur diese Sitzung */ } }
        if (view !== v) return;
        view.recording = false; render(); playBlob(blob);
      };
      mr.start(); view.recording = true; render();
      setTimeout(() => { if (rec && rec.mr === mr) stopRec(); }, 4000);
    } catch { /* kein Mikrofon erlaubt */ }
  }

  /* ---------- Eingaben ---------- */
  const ACT = {
    home: () => go({ name: 'home' }),
    hare: () => { pluck(2); speak('tiere/hase', 'أَرْنَب'); const h = $('.hare'); h.classList.remove('hopnow'); void h.offsetWidth; h.classList.add('hopnow'); },
    weiter: () => { const t = nextTarget(); if (t) startStep(t.kind, t.id, t.step); },
    unit: (el) => { go({ name: 'unit', id: el.dataset.id }); saySound(unitOf(el.dataset.id)); },
    theme: (el) => { go({ name: 'theme', id: el.dataset.id }); const c = catOf(el.dataset.id); speak(null, c.ar); },
    'say-sound': () => saySound(unitOf(view.id)),
    step: (el) => { if (el.dataset.st === 'later') return wrong(el); startStep(view.name, view.id, el.dataset.s); },
    leave: () => go(view.kind ? { name: view.kind, id: view.id } : { name: view.name === 'malen' ? 'album' : 'home' }),
    finish: () => finishStep(),
    'cheer-next': () => { const nx = nextStep(view.kind, view.id); if (nx) return startStep(view.kind, view.id, nx); const t = nextTarget(); t ? go({ name: 'home' }) : go({ name: 'album' }); },
    'h-say': () => playRound(),
    'h-pick': (el) => {
      if (view.busy) return;
      const r = view.rounds[view.i], o = r.options[Number(el.dataset.k)];
      if (o.id !== r.target.id) {
        wrong(el); el.classList.add('dim');
        if (!r.missed) { r.missed = true; view.rounds.push({ ...r, options: shuffle(r.options) }); }
        const ok = $(`.opt[data-k="${r.options.findIndex((x) => x.id === r.target.id)}"]`); if (ok) ok.classList.add('showok');
        return sayWord(r.target);
      }
      view.busy = true; stopSound(); el.classList.add('ok'); praise(); later(() => sayWord(r.target), 250);
      later(() => { if (view.i + 1 >= view.rounds.length) return finishStep(); view.i += 1; view.busy = false; render(); }, 1900);
    },
    'k-say': () => { const c = catOf(view.id), it = c.items[view.i]; speak(`${c.id}/${it.id}`, it.ar); },
    'k-prev': () => { if (view.i > 0) { view.i -= 1; render(); } },
    'k-next': () => { view.i += 1; render(); },
    'm-color': (el) => { view.color = el.dataset.id; $$('.col[data-id]').forEach((x) => x.classList.toggle('sel', x === el)); sayColor(view.color); },
    'm-fill': (el) => {
      const r = el.dataset.r, need = view.letters[r];
      if (need && AR_KEY[need] !== view.color) { // falsche Farbe für diese Buchstaben-Fläche: Laut sagen, richtige Farbe zeigen
        const chip = $(`.col[data-id="${AR_KEY[need]}"]`); if (chip) { chip.classList.remove('showok'); void chip.offsetWidth; chip.classList.add('showok'); }
        return saySound(unitOf(need));
      }
      view.fills[r] = hexOf(view.color); el.setAttribute('fill', view.fills[r]); pluck(Object.keys(view.fills).length, 0.1);
      if (need) saySound(unitOf(need));
      saveMalen(); labelRegions();
      if (malenReady() && !$('#mdone .pill')) { $('#mdone').innerHTML = `<button class="pill sm hopping" data-act="m-done" aria-label="Fertig">${icon('check')}</button>`; if (view.guided) praise(); }
    },
    'm-reset': () => { view.fills = {}; saveMalen(); render(); },
    'm-done': () => { saveMalen(); if (view.kind) finishStep(); else go({ name: 'album' }); },
    album: () => go({ name: 'album' }),
    'a-open': (el) => openMalen({}, el.dataset.s, false),
    zusammen: () => go({ name: 'zusammen' }),
    'z-sprechen': (el) => { go({ name: 'sprechen', id: el.dataset.id, i: 0, recording: false }); sayWord(unitOf(el.dataset.id).words[0]); },
    'z-voice': (el) => { const b = voices.get(el.dataset.key); if (b) { stopSound(); playBlob(b); } },
    'z-reset': () => { if (view.confirm) { done = {}; seen = {}; store.set('done', done); store.set('seen', seen); go({ name: 'zusammen' }); } else { view.confirm = true; $('[data-act="z-reset"]').textContent = 'Wirklich? Nochmal tippen'; } },
    'z-reload': () => { location.href = location.pathname + '?r=' + Date.now(); },
    'sp-say': () => sayWord(unitOf(view.id).words[view.i]),
    'sp-rec': toggleRec,
    'sp-mine': () => { const b = voices.get(`${view.id}/${unitOf(view.id).words[view.i].id}`); if (b) { stopSound(); playBlob(b); } },
    'sp-next': () => { stopRec(); pluck(view.i + 2); if (view.i + 1 >= unitOf(view.id).words.length) return go({ name: 'zusammen' }); view.i += 1; view.recording = false; render(); ACT['sp-say'](); },
  };
  app.addEventListener('click', (e) => { const el = e.target.closest('[data-act]'); if (el && ACT[el.dataset.act]) ACT[el.dataset.act](el); });
  app.addEventListener('change', (e) => { const t = e.target; if (t.dataset.set) { settings[t.dataset.set] = t.checked; store.set('settings', settings); } });
  // Zusammen-Modus: Knopf 1 Sekunde halten (damit sie nicht aus Versehen hineingerät)
  let gateTimer = null;
  app.addEventListener('pointerdown', (e) => { const g = e.target.closest('[data-gate]'); if (!g) return; g.classList.add('hold'); const h = $('#gatehint'); if (h) h.textContent = 'halten …'; gateTimer = setTimeout(() => go({ name: 'zusammen' }), 1000); });
  const gateOff = () => { clearTimeout(gateTimer); const g = $('[data-gate]'); if (g) g.classList.remove('hold'); const h = $('#gatehint'); if (h) h.textContent = 'Zusammen'; };
  app.addEventListener('pointerup', gateOff); app.addEventListener('pointerleave', gateOff); app.addEventListener('pointercancel', gateOff);
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  render();
  (async () => {
    await loadAll(await openDb('arabisch', 'rec'), 'rec', recs);
    voiceDb = await openDb('arnab', 'voice');
    await loadAll(voiceDb, 'voice', voices);
  })();
})();
