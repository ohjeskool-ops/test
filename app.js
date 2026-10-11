/* Arabisch lernen – ruhige Lern-App für Kinder. Kein Framework, läuft offline. */
(() => {
  const app = document.getElementById('app');
  const ROUNDS = 6;

  /* ---------- Speicher (Fortschritt, Einstellungen) ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignorieren */ }
    },
  };
  let stars = store.get('stars', {});
  let settings = { tr: true, letters: ['alif', 'ba', 'ta'], ...store.get('settings', {}) };

  /* ---------- Eigene Aufnahmen (IndexedDB) ---------- */
  const recs = new Map();
  const idb = {
    db: null,
    open() {
      return new Promise((resolve) => {
        try {
          const req = indexedDB.open('arabisch', 1);
          req.onupgradeneeded = () => req.result.createObjectStore('rec');
          req.onsuccess = () => { idb.db = req.result; resolve(); };
          req.onerror = () => resolve();
        } catch { resolve(); }
      });
    },
    run(mode, fn) {
      return new Promise((resolve) => {
        if (!idb.db) return resolve();
        const tx = idb.db.transaction('rec', mode);
        const req = fn(tx.objectStore('rec'));
        tx.oncomplete = () => resolve(req && req.result);
        tx.onerror = () => resolve();
      });
    },
    put: (k, v) => idb.run('readwrite', (s) => s.put(v, k)),
    del: (k) => idb.run('readwrite', (s) => s.delete(k)),
    async loadAll() {
      if (!idb.db) return;
      await new Promise((resolve) => {
        const tx = idb.db.transaction('rec', 'readonly');
        const req = tx.objectStore('rec').openCursor();
        req.onsuccess = () => {
          const c = req.result;
          if (c) { recs.set(c.key, c.value); c.continue(); } else resolve();
        };
        req.onerror = () => resolve();
      });
    },
  };

  /* ---------- Ton ---------- */
  const audio = new Audio();
  let arabicVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    arabicVoice = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('ar')) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  const keyOf = (cat, item) => `${cat.id}/${item.id}`;

  function speak(cat, item) {
    stopSound();
    const blob = recs.get(keyOf(cat, item));
    if (blob) {
      const url = URL.createObjectURL(blob);
      audio.src = url;
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play().catch(() => {});
      return;
    }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(item.ar);
    u.lang = 'ar-SA';
    if (arabicVoice) u.voice = arabicVoice;
    u.rate = 0.7;
    speechSynthesis.speak(u);
  }
  function stopSound() {
    try { audio.pause(); } catch { /* ignorieren */ }
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  /* ---------- Bausteine ---------- */
  // Pseudo-Kategorie für die Buchstabennamen (Aufnahmen im Elternbereich, Sprachausgabe)
  const ALPHA_CAT = {
    id: 'alphabet', de: 'Buchstaben', ar: 'حُرُوف', icon: 'ا', tint: '#E4DDF5', type: 'emoji',
    items: ALPHABET.map((l) => ({ id: l.id, ar: l.name, tr: l.tr, de: `Buchstabe ${l.ch}` })),
  };
  const catById = (id) => (id === 'alphabet' ? ALPHA_CAT : CATEGORIES.find((c) => c.id === id));

  function visual(cat, item, small) {
    let inner = '';
    if (cat.type === 'color') {
      inner = Sketch.color(item.color);
    } else if (cat.type === 'number') {
      inner = `<div class="numvis"><div class="big"><span>${item.n}</span><span class="ar">${item.digit}</span></div>` +
        `<div class="pips">${'<i class="pip"></i>'.repeat(item.n)}</div></div>`;
    } else {
      inner = Sketch.motif(cat.id, item.id) || `<div class="emoji">${item.emoji}</div>`;
    }
    return `<div class="visual${small ? ' sm' : ''}">${inner}</div>`;
  }

  const svg = (body, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const ICON = {
    prev: svg('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
    next: svg('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
    speaker: svg('<path d="M4 9.5v5h3.6L12.5 19V5L7.6 9.5H4z"/><path d="M16 9.2a4.2 4.2 0 0 1 0 5.6"/><path d="M18.6 6.6a8 8 0 0 1 0 10.8"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    undo: svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>'),
    trash: svg('<path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 12.5h9l1-12.5"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M18 6l-2.1 2.1M8.1 15.9 6 18"/>'),
  };
  const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7z"/></svg>';
  const starsText = (n) => (n ? STAR.repeat(n) : '');
  const trHtml = (it, cls) => (settings.tr && it.tr ? `<span class="${cls}">${it.tr}</span>` : '');
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* ---------- Bildschirme ---------- */
  let view = { name: 'learn', cat: CATEGORIES[0].id, idx: 0 };

  function go(next) {
    if (recorder && next.name !== 'parent') recorder.stop();
    view = next;
    stopSound();
    render();
  }

  function render() {
    const c = catById(view.cat);
    document.body.style.setProperty('--tint', c.tint);
    const fn = { learn: renderLearn, quiz: renderQuiz, result: renderResult, parent: renderParent, games: renderGames, game: renderGame, alpha: renderAlpha, letter: renderLetter, agame: renderAGame, trace: renderTrace }[view.name];
    app.innerHTML = renderNav() + `<div class="content screen">${fn()}</div>`;
    bindGate();
    if (view.name === 'game' && view.game === 'finger') bindPaint();
    if (view.name === 'trace') bindTrace();
  }

  function renderNav() {
    const items = CATEGORIES.map((c) => `
      <button class="nav-item ${view.name !== 'parent' && currentTab() !== 'alpha' && c.id === view.cat ? 'active' : ''}" data-act="open" data-cat="${c.id}" aria-label="${c.de}">
        <span class="ico">${Sketch.nav(c.id) || c.icon}</span>
        <span class="stars">${starsText(stars[c.id] || 0)}</span>
      </button>`).join('');
    return `<nav class="nav">${items}<button class="parent-gate" data-gate aria-label="Eltern">${ICON.gear}</button></nav>`;
  }

  const ALPHA_TOP = { ar: 'حُرُوف', de: 'Buchstaben' };
  const currentTab = () => ({ learn: 'learn', quiz: 'quiz', games: 'play', game: 'play', alpha: 'alpha', letter: 'alpha', agame: 'alpha', trace: 'alpha', result: view.tab }[view.name] || 'learn');

  function topbar(c, dots, label) {
    const tab = currentTab();
    const on = (n) => (tab === n ? 'on' : '');
    return `<div class="topbar">
      <div class="seg">
        <button class="seg-i ${on('learn')}" data-act="learn">Lernen</button>
        <button class="seg-i ${on('quiz')}" data-act="quiz">Finden</button>
        <button class="seg-i ${on('play')}" data-act="games">Spielen</button>
        <button class="seg-i ${on('alpha')}" data-act="alpha">Alphabet</button>
      </div>
      ${dots}
      <span class="cat-name">${c === ALPHA_TOP && label ? '' : `<span class="ar">${c.ar}</span>`}<span class="de">${label || c.de}</span></span>
    </div>`;
  }

  function dotsHtml(n, current) {
    return `<div class="dots">${Array.from({ length: n }, (_, i) => `<span class="dot ${i === current ? 'on' : i < current ? 'done' : ''}"></span>`).join('')}</div>`;
  }

  function renderLearn() {
    const c = catById(view.cat);
    const item = c.items[view.idx];
    const last = view.idx === c.items.length - 1;
    return `
      ${topbar(c, dotsHtml(c.items.length, view.idx))}
      <div class="learn">
        <button class="nav-btn" data-act="prev" ${view.idx === 0 ? 'disabled' : ''} aria-label="Zurück">${ICON.prev}</button>
        <button class="card-main" data-act="say" aria-label="Anhören">
          ${visual(c, item, false)}
          <div class="word-ar ar">${item.ar}</div>
          ${settings.tr ? `<div class="word-tr">${item.tr}</div>` : ''}
          <div class="word-de">${item.de}</div>
        </button>
        ${last
          ? `<button class="nav-btn quiz" data-act="quiz" aria-label="Zum Quiz">Quiz ${ICON.next}</button>`
          : `<button class="nav-btn" data-act="next" aria-label="Weiter">${ICON.next}</button>`}
      </div>`;
  }

  function startQuiz(c) {
    const targets = shuffle(c.items).slice(0, ROUNDS);
    const rounds = targets.map((t) => ({
      target: t,
      options: shuffle([t, ...shuffle(c.items.filter((x) => x.id !== t.id)).slice(0, 2)]),
      mistake: false,
    }));
    go({ name: 'quiz', cat: c.id, rounds, i: 0, busy: false });
    speak(c, rounds[0].target);
  }

  function renderQuiz() {
    const c = catById(view.cat);
    const r = view.rounds[view.i];
    const opts = r.options.map((o) => `<button class="opt" data-act="pick" data-id="${o.id}" aria-label="${o.de}">${visual(c, o, true)}</button>`).join('');
    return `
      ${topbar(c, dotsHtml(view.rounds.length, view.i))}
      <div class="quiz">
        <button class="speaker" data-act="ask" aria-label="Nochmal anhören">${ICON.speaker}</button>
        <div class="options">${opts}</div>
        <div class="praise" id="praise"></div>
      </div>`;
  }

  function pick(btn) {
    if (view.busy) return;
    const c = catById(view.cat);
    const r = view.rounds[view.i];
    if (btn.dataset.id !== r.target.id) {
      r.mistake = true;
      btn.classList.add('dim');
      return;
    }
    view.busy = true;
    btn.classList.add('ok');
    app.querySelectorAll('.opt').forEach((o) => { o.classList.add('locked'); if (o !== btn) o.classList.add('dim'); });
    document.getElementById('praise').innerHTML = STAR;
    speak(c, r.target);
    setTimeout(() => {
      if (view.name !== 'quiz') return;
      if (view.i + 1 < view.rounds.length) {
        view.i += 1;
        view.busy = false;
        render();
        speak(c, view.rounds[view.i].target);
      } else {
        const good = view.rounds.filter((x) => !x.mistake).length;
        const earned = good === view.rounds.length ? 3 : good >= view.rounds.length - 2 ? 2 : 1;
        stars[c.id] = Math.max(stars[c.id] || 0, earned);
        store.set('stars', stars);
        go({ name: 'result', cat: c.id, earned, tab: 'quiz', next: 'learn' });
      }
    }, 1600);
  }

  function renderResult() {
    const c = view.tab === 'alpha' ? ALPHA_TOP : catById(view.cat);
    return `
      ${topbar(c, '<span></span>')}
      <div class="result"><div class="result-card">
        <div class="big-stars">${starsText(view.earned)}</div>
        <div class="msg ar" style="font-size:9vmin">يَا سَلَام!</div>
        <div class="msg">Super gemacht!</div>
        <button class="pill" data-act="${view.next || 'learn'}">Weiter</button>
      </div></div>`;
  }

  /* ---------- Spielen ---------- */
  // Überall dieselben vier Spiele; „Extra" nur, wo es inhaltlich passt.
  const BASE_GAMES = [
    { id: 'suche', de: 'Such mich!' },
    { id: 'zaehlen', de: 'Zähl mit!' },
    { id: 'malen', de: 'Ausmalen' },
    { id: 'finger', de: 'Finger-Malen' },
  ];
  const EXTRA_GAMES = { zahlen: { id: 'geben', de: 'Gib mir …' }, sinne: { id: 'sinn', de: 'Welcher Sinn?' } };
  const gamesFor = (cid) => (EXTRA_GAMES[cid] ? [...BASE_GAMES, EXTRA_GAMES[cid]] : BASE_GAMES);

  // Dinge zum Zählen: aus der aktuellen Kategorie; bei den Zahlen aus Tieren und Essen
  const objectPool = (cid) => (cid === 'zahlen' ? ['tiere', 'essen'] : [cid]).flatMap((id) => catById(id).items.map((it) => ({ cid: id, it })));
  const pickObjects = (k) => { const pool = shuffle(objectPool(view.cat)); return Array.from({ length: k }, (_, i) => pool[i % pool.length]); };
  const numbers = (max, k) => shuffle(Array.from({ length: max }, (_, i) => i + 1)).slice(0, k).sort((a, b) => a - b);

  function later(fn, ms) {
    const v = view;
    setTimeout(() => { if (view === v) fn(); }, ms);
  }
  function shake(el) {
    el.classList.remove('wrong');
    void el.offsetWidth;
    el.classList.add('wrong');
  }
  function scatter(n) {
    const tall = window.innerHeight > window.innerWidth;
    const cols = tall ? 3 : 4, rows = tall ? 4 : 3;
    const jit = (k) => (Math.random() - 0.5) * k;
    return shuffle(Array.from({ length: cols * rows }, (_, i) => i)).slice(0, n).map((slot) => ({
      x: ((slot % cols + 0.5) / cols) * 100 + jit((100 / cols) * 0.3),
      y: ((Math.floor(slot / cols) + 0.5) / rows) * 100 + jit((100 / rows) * 0.3),
      rot: jit(14),
    }));
  }
  const fitem = (p, inner, attrs, cls = '') =>
    `<button class="fitem ${cls}" style="left:${p.x.toFixed(1)}%;top:${p.y.toFixed(1)}%;--r:${p.rot.toFixed(1)}deg" ${attrs}>${inner}</button>`;
  const objArt = (o) => `<div class="visual sm">${catById(o.cid).type === 'color' ? Sketch.color(o.it.color) : Sketch.motif(o.cid, o.it.id)}</div>`;
  const badge = (z, n) => `<span class="badge"><b class="ar">${z.items[n - 1].digit}</b><i>${n}</i></span>`;
  const tick = `<span class="tick">${STAR}</span>`;

  function finishGame(mistakes, tab = 'play', next = 'games') {
    const earned = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    go({ name: 'result', cat: view.cat, earned, tab, next });
  }

  function renderGames() {
    const c = catById(view.cat);
    const list = gamesFor(view.cat);
    const cards = list.map((g) => `<button class="game-card" data-act="g-start" data-g="${g.id}">
        <div class="gic">${Sketch.get('game/' + g.id)}</div><span>${g.de}</span></button>`).join('');
    return `${topbar(c, '<span></span>')}<div class="games-grid g${list.length}">${cards}</div>`;
  }

  function renderGame() {
    return { suche: renderSuche, zaehlen: renderZaehlen, geben: renderGeben, malen: renderMalen, finger: renderMalen, sinn: renderSinn }[view.game]();
  }

  /* -- Such mich! -- */
  function startSuche() {
    const c = catById(view.cat);
    const pool = shuffle(c.items).slice(0, 9);
    const pos = scatter(pool.length);
    const targets = shuffle(pool).slice(0, 5);
    go({ name: 'game', game: 'suche', cat: c.id, field: pool.map((it, i) => ({ it, ...pos[i], found: false })), targets, i: 0, mistakes: 0, busy: false });
    speak(c, targets[0]);
  }
  function renderSuche() {
    const c = catById(view.cat);
    const items = view.field.map((f) => fitem(f, visual(c, f.it, true) + (f.found ? tick : ''),
      `data-act="s-pick" data-id="${f.it.id}" aria-label="${f.it.de}"`, f.found ? 'found' : '')).join('');
    return `${topbar(c, dotsHtml(view.targets.length, view.i), 'Such mich!')}
      <div class="prompt"><button class="speaker sm" data-act="s-ask" aria-label="Nochmal anhören">${ICON.speaker}</button></div>
      <div class="field-card"><div class="field" style="--s:17vmin">${items}</div></div>`;
  }
  function sPick(el) {
    if (view.busy) return;
    const c = catById(view.cat);
    const target = view.targets[view.i];
    if (el.dataset.id !== target.id) { view.mistakes += 1; shake(el); return; }
    view.busy = true;
    view.field.find((f) => f.it.id === target.id).found = true;
    el.classList.add('found');
    el.insertAdjacentHTML('beforeend', tick);
    speak(c, target);
    later(() => {
      if (view.i + 1 < view.targets.length) { view.i += 1; view.busy = false; render(); speak(c, view.targets[view.i]); }
      else finishGame(view.mistakes);
    }, 1500);
  }

  /* -- Zähl mit! -- */
  function startZaehlen() {
    const ns = numbers(10, 5);
    const objs = pickObjects(5);
    go({ name: 'game', game: 'zaehlen', cat: view.cat, i: 0, busy: false,
      rounds: ns.map((n, i) => ({ n, obj: objs[i], pos: scatter(n), counted: [] })) });
  }
  function renderZaehlen() {
    const c = catById(view.cat);
    const z = catById('zahlen');
    const r = view.rounds[view.i];
    const items = r.pos.map((p, k) => {
      const num = r.counted.indexOf(k) + 1;
      return fitem(p, objArt(r.obj) + (num ? badge(z, num) : ''), `data-act="z-tap" data-k="${k}"`, num ? 'counted' : '');
    }).join('');
    return `${topbar(c, dotsHtml(view.rounds.length, view.i), 'Zähl mit!')}
      <div class="prompt"><span class="hint-chip" id="hint">Tippe alles an und zähle mit</span><div class="total" id="total"></div></div>
      <div class="field-card"><div class="field" style="--s:15vmin">${items}</div></div>`;
  }
  function zTap(el) {
    const z = catById('zahlen');
    const r = view.rounds[view.i];
    const k = Number(el.dataset.k);
    const had = r.counted.indexOf(k);
    if (had >= 0) { speak(z, z.items[had]); return; }
    if (view.busy) return;
    r.counted.push(k);
    const num = r.counted.length;
    el.classList.add('counted');
    el.insertAdjacentHTML('beforeend', badge(z, num));
    speak(z, z.items[num - 1]);
    if (num < r.n) return;
    view.busy = true;
    const it = z.items[r.n - 1];
    document.getElementById('hint').style.display = 'none';
    document.getElementById('total').innerHTML = `<b class="ar">${it.digit}</b><b>${r.n}</b><span class="ar">${it.ar}</span>${trHtml(it, 'trs')}${STAR}`;
    later(() => {
      if (view.i + 1 < view.rounds.length) { view.i += 1; view.busy = false; render(); }
      else finishGame(0);
    }, 2600);
  }

  /* -- Gib mir … (Extra bei den Zahlen) -- */
  function startGeben() {
    const z = catById('zahlen');
    const ns = numbers(8, 5);
    const objs = pickObjects(5);
    go({ name: 'game', game: 'geben', cat: 'zahlen', i: 0, mistakes: 0, busy: false,
      rounds: ns.map((n, i) => ({ n, obj: objs[i], pos: scatter(Math.min(12, n + 4)), picked: [] })) });
    speak(z, z.items[ns[0] - 1]);
  }
  function renderGeben() {
    const c = catById('zahlen');
    const r = view.rounds[view.i];
    const it = c.items[r.n - 1];
    const items = r.pos.map((p, k) => fitem(p, objArt(r.obj) + (r.picked.includes(k) ? tick : ''),
      `data-act="g-pick" data-k="${k}"`, r.picked.includes(k) ? 'picked' : '')).join('');
    return `${topbar(c, dotsHtml(view.rounds.length, view.i), 'Gib mir …')}
      <div class="prompt">
        <button class="speaker sm" data-act="g-ask" aria-label="Nochmal anhören">${ICON.speaker}</button>
        <span class="numchip"><b class="ar">${it.digit}</b><b>${r.n}</b>${trHtml(it, 'otr')}</span>
      </div>
      <div class="field-card"><div class="field" style="--s:15vmin">${items}</div></div>
      <div class="cta-row"><button class="pill" data-act="g-done">${ICON.check} Fertig</button></div>`;
  }
  function gPick(el) {
    if (view.busy) return;
    const r = view.rounds[view.i];
    const k = Number(el.dataset.k);
    const at = r.picked.indexOf(k);
    if (at >= 0) { r.picked.splice(at, 1); el.classList.remove('picked'); el.querySelector('.tick')?.remove(); }
    else { r.picked.push(k); el.classList.add('picked'); el.insertAdjacentHTML('beforeend', tick); }
  }
  function gDone() {
    if (view.busy) return;
    const c = catById('zahlen');
    const r = view.rounds[view.i];
    if (r.picked.length !== r.n) {
      view.mistakes += 1;
      app.querySelectorAll('.fitem.picked').forEach((el) => { shake(el); });
      later(() => {
        r.picked = [];
        app.querySelectorAll('.fitem.picked').forEach((el) => { el.classList.remove('picked'); el.querySelector('.tick')?.remove(); });
        speak(c, c.items[r.n - 1]);
      }, 700);
      return;
    }
    view.busy = true;
    speak(c, c.items[r.n - 1]);
    later(() => {
      if (view.i + 1 < view.rounds.length) { view.i += 1; view.busy = false; render(); speak(c, c.items[view.rounds[view.i].n - 1]); }
      else finishGame(view.mistakes);
    }, 1900);
  }

  /* -- Welcher Sinn? (Extra bei den Sinnen) -- */
  function startSinn() {
    const c = catById('sinne');
    go({ name: 'game', game: 'sinn', cat: 'sinne', i: 0, mistakes: 0, busy: false, rounds: shuffle(c.extra) });
    speak(c, view.rounds[0]);
  }
  function renderSinn() {
    const c = catById('sinne');
    const thing = view.rounds[view.i];
    const opts = c.items.map((o) => `<button class="opt" data-act="n-pick" data-id="${o.id}" aria-label="${o.de}">${visual(c, o, true)}<span class="ar olabel">${o.ar}</span>${trHtml(o, 'otr')}</button>`).join('');
    return `${topbar(c, dotsHtml(view.rounds.length, view.i), 'Welcher Sinn?')}
      <div class="prompt">
        <button class="speaker sm" data-act="n-ask" aria-label="Nochmal anhören">${ICON.speaker}</button>
        <div class="thing"><div class="visual sm">${Sketch.get('dinge/' + thing.id)}</div><span class="ar">${thing.ar}</span>${trHtml(thing, 'otr')}</div>
      </div>
      <div class="options five">${opts}</div>
      <div class="praise" id="praise"></div>`;
  }
  function nPick(el) {
    if (view.busy) return;
    const c = catById('sinne');
    const thing = view.rounds[view.i];
    if (el.dataset.id !== thing.sense) { view.mistakes += 1; el.classList.add('dim'); return; }
    view.busy = true;
    el.classList.add('ok');
    app.querySelectorAll('.opt').forEach((o) => { o.classList.add('locked'); if (o !== el) o.classList.add('dim'); });
    document.getElementById('praise').innerHTML = STAR;
    speak(c, c.items.find((x) => x.id === thing.sense));
    later(() => {
      if (view.i + 1 < view.rounds.length) { view.i += 1; view.busy = false; render(); speak(c, view.rounds[view.i]); }
      else finishGame(view.mistakes);
    }, 1800);
  }

  /* -- Ausmalen (Antippen) und Finger-Malen: gleiche Bilder, die Palette sind die Farben-Vokabeln -- */
  const colors = () => catById('farben');
  const colorHex = (id) => colors().items.find((x) => x.id === id).color;
  const BRUSH = [3.2, 6.5, 11];
  const NS = 'http://www.w3.org/2000/svg';

  function startMalen() { go({ name: 'game', game: 'malen', cat: view.cat, color: colors().items[0].id, fills: {} }); }
  function startFinger() { go({ name: 'game', game: 'finger', cat: view.cat, color: colors().items[0].id, size: 1, strokes: [] }); }

  function paletteHtml() {
    const chips = colors().items.map((it) => `<button class="chip ${it.id === view.color ? 'sel' : ''}" data-act="m-color" data-id="${it.id}" style="--c:${it.color}" aria-label="${it.de}"></button>`).join('');
    if (view.game === 'malen') {
      return `<div class="palette"><div class="chips">${chips}<button class="chip reset" data-act="m-reset" aria-label="Alles löschen">${ICON.trash}</button></div></div>`;
    }
    const sizes = [1.6, 2.6, 3.8].map((d, i) => `<button class="size ${i === view.size ? 'sel' : ''}" data-act="f-size" data-i="${i}" aria-label="Pinselgröße"><i style="--d:${d}vmin"></i></button>`).join('');
    return `<div class="palette"><div class="chips">${chips}</div>
      <div class="tools">${sizes}<button class="chip reset" data-act="f-undo" aria-label="Rückgängig">${ICON.undo}</button><button class="chip reset" data-act="m-reset" aria-label="Alles löschen">${ICON.trash}</button></div></div>`;
  }
  function renderMalen() {
    const c = catById(view.cat);
    const finger = view.game === 'finger';
    const picture = finger ? Sketch.paintScene(view.cat) : Sketch.scene(view.cat, view.fills);
    return `${topbar(c, '<span></span>', finger ? 'Finger-Malen' : 'Ausmalen')}
      <div class="scene-card">${picture}</div>${paletteHtml()}`;
  }
  function mColor(el) {
    view.color = el.dataset.id;
    app.querySelectorAll('.chip[data-id]').forEach((x) => x.classList.toggle('sel', x === el));
    speak(colors(), colors().items.find((x) => x.id === view.color));
  }
  function mFill(el) {
    const col = colorHex(view.color);
    view.fills[el.dataset.r] = col;
    el.setAttribute('fill', col);
  }
  // Finger-Malen: Der Strich bleibt in der Fläche, in der er begonnen wurde (Zuschnitt per clip-path).
  function bindPaint() {
    const svg = app.querySelector('.scene.paint');
    if (!svg) return;
    let cur = null;
    const at = (e) => {
      const p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(svg.getScreenCTM().inverse());
      return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    };
    svg.addEventListener('pointerdown', (e) => {
      const reg = e.target.closest('[data-r]');
      if (!reg) return;
      const layer = svg.querySelector(`g.paint[data-r="${reg.dataset.r}"]`);
      const start = at(e);
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', colorHex(view.color));
      path.setAttribute('stroke-width', BRUSH[view.size]);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      cur = { path, d: `M${start} L${start}` };
      path.setAttribute('d', cur.d);
      layer.appendChild(path);
      view.strokes.push(path);
      try { svg.setPointerCapture(e.pointerId); } catch { /* ignorieren */ }
      e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => {
      if (!cur) return;
      cur.d += ` L${at(e)}`;
      cur.path.setAttribute('d', cur.d);
    });
    ['pointerup', 'pointercancel'].forEach((t) => svg.addEventListener(t, () => { cur = null; }));
  }

  /* ---------- Alphabet ---------- */
  const letterOf = (id) => ALPHABET.find((l) => l.id === id);
  const letterItem = (l) => ALPHA_CAT.items.find((i) => i.id === l.id);
  const sayLetter = (l) => speak(ALPHA_CAT, letterItem(l));
  const activeLetters = () => {
    const a = ALPHABET.filter((l) => settings.letters.includes(l.id));
    return a.length ? a : ALPHABET.slice(0, 3);
  };
  function sayWord(w) {
    if (w.cat) { const c = catById(w.cat); speak(c, [...c.items, ...(c.extra || [])].find((x) => x.id === w.itemId)); }
    else speak({ id: 'wort' }, { id: w.art, ar: w.ar });
  }
  const ZWJ = '‍';
  const formsOf = (l) => (l.join
    ? [['allein', l.ch], ['Anfang', l.ch + ZWJ], ['Mitte', ZWJ + l.ch + ZWJ], ['Ende', ZWJ + l.ch]]
    : [['allein', l.ch], ['Ende', ZWJ + l.ch]]);
  const hl = (ar) => { const m = ar.match(/^(.[ً-ْٰ]*)([\s\S]*)$/u); return m ? `<b class="hl">${m[1]}</b>${m[2]}` : ar; };

  function renderAlpha() {
    const cells = ALPHABET.map((l) => `<button class="acell" data-act="l-open" data-id="${l.id}" aria-label="${l.name}"><span class="ar">${l.ch}</span></button>`).join('');
    return `${topbar(ALPHA_TOP, '<span></span>')}
      <div class="agrid">${cells}</div>
      <div class="apractice">
        <button class="pill sm" data-act="a-quiz-start">Hören &amp; Finden</button>
        <button class="pill sm" data-act="a-suche-start">Such den Buchstaben</button>
        <button class="pill sm" data-act="a-trace-start">Nachspuren</button>
      </div>`;
  }

  function renderLetter() {
    const l = ALPHABET[view.idx];
    const forms = formsOf(l).map(([t, g]) => `<div class="form"><span class="ar">${g}</span><i>${t}</i></div>`).join('');
    const words = l.words.slice(0, 5).map((w, k) => `<button class="lword" data-act="l-word" data-k="${k}">
        <div class="visual sm">${Sketch.get(w.art) || ''}</div><span class="ar lw">${hl(w.ar)}</span>${trHtml(w, 'otr')}<span class="ode">${w.de}</span></button>`).join('');
    return `${topbar(ALPHA_TOP, '<span></span>')}
      <div class="letter">
        <button class="nav-btn" data-act="l-prev" ${view.idx === 0 ? 'disabled' : ''} aria-label="Vorheriger Buchstabe">${ICON.prev}</button>
        <div class="letter-card">
          <div class="lhead">
            <button class="bigletter ar" data-act="l-say" aria-label="Anhören">${l.ch}</button>
            <div class="linfo"><div class="lname ar">${l.name}</div>${trHtml(l, 'ltr')}<div class="lsnd">Laut: ${l.snd}</div></div>
            <div class="forms">${forms}</div>
          </div>
          <div class="lwords">${words}</div>
        </div>
        <button class="nav-btn" data-act="l-next" ${view.idx === ALPHABET.length - 1 ? 'disabled' : ''} aria-label="Nächster Buchstabe">${ICON.next}</button>
      </div>
      <div class="cta-row"><button class="pill sm" data-act="l-trace">Nachspuren</button><button class="pill sm" data-act="alpha">Alle Buchstaben</button></div>`;
  }

  /* -- Hören & Finden (Welcher Buchstabe?) -- */
  function startAQuiz() {
    const act = shuffle(activeLetters());
    const rounds = Array.from({ length: 6 }, (_, i) => {
      const t = act[i % act.length];
      const same = shuffle(ALPHABET.filter((x) => x.group === t.group && x.id !== t.id));
      const rest = shuffle(ALPHABET.filter((x) => x.id !== t.id && !same.slice(0, 1).includes(x)));
      return { target: t, options: shuffle([t, ...[...same.slice(0, 1), ...rest].slice(0, 2)]) };
    });
    go({ name: 'agame', game: 'aquiz', cat: view.cat, rounds, i: 0, mistakes: 0, busy: false });
    sayLetter(rounds[0].target);
  }
  function renderAQuiz() {
    const r = view.rounds[view.i];
    const opts = r.options.map((o) => `<button class="opt" data-act="a-pick" data-id="${o.id}" aria-label="${o.name}"><span class="ar bigl">${o.ch}</span></button>`).join('');
    return `${topbar(ALPHA_TOP, dotsHtml(view.rounds.length, view.i), 'Welcher Buchstabe?')}
      <div class="quiz">
        <button class="speaker" data-act="a-ask" aria-label="Nochmal anhören">${ICON.speaker}</button>
        <div class="options">${opts}</div>
        <div class="praise" id="praise"></div>
      </div>`;
  }
  function aPick(el) {
    if (view.busy) return;
    const r = view.rounds[view.i];
    if (el.dataset.id !== r.target.id) { view.mistakes += 1; el.classList.add('dim'); return; }
    view.busy = true;
    el.classList.add('ok');
    app.querySelectorAll('.opt').forEach((o) => { o.classList.add('locked'); if (o !== el) o.classList.add('dim'); });
    document.getElementById('praise').innerHTML = STAR;
    sayLetter(r.target);
    later(() => {
      if (view.i + 1 < view.rounds.length) { view.i += 1; view.busy = false; render(); sayLetter(view.rounds[view.i].target); }
      else finishGame(view.mistakes, 'alpha', 'alpha');
    }, 1700);
  }

  /* -- Such den Buchstaben -- */
  function startASuche() {
    const targets = shuffle(activeLetters()).slice(0, 5);
    const others = shuffle(ALPHABET.filter((l) => !targets.includes(l)));
    const pool = shuffle([...targets, ...others.slice(0, Math.max(0, 9 - targets.length))]);
    const pos = scatter(pool.length);
    go({ name: 'agame', game: 'asuche', cat: view.cat, field: pool.map((l, i) => ({ l, ...pos[i], found: false })), targets, i: 0, mistakes: 0, busy: false });
    sayLetter(targets[0]);
  }
  function renderASuche() {
    const items = view.field.map((f) => fitem(f, `<span class="ar fl">${f.l.ch}</span>${f.found ? tick : ''}`,
      `data-act="a-spick" data-id="${f.l.id}" aria-label="${f.l.name}"`, f.found ? 'found' : '')).join('');
    return `${topbar(ALPHA_TOP, dotsHtml(view.targets.length, view.i), 'Such den Buchstaben')}
      <div class="prompt"><button class="speaker sm" data-act="a-ask" aria-label="Nochmal anhören">${ICON.speaker}</button></div>
      <div class="field-card"><div class="field" style="--s:16vmin">${items}</div></div>`;
  }
  function aSPick(el) {
    if (view.busy) return;
    const target = view.targets[view.i];
    if (el.dataset.id !== target.id) { view.mistakes += 1; shake(el); return; }
    view.busy = true;
    view.field.find((f) => f.l.id === target.id).found = true;
    el.classList.add('found');
    el.insertAdjacentHTML('beforeend', tick);
    sayLetter(target);
    later(() => {
      if (view.i + 1 < view.targets.length) { view.i += 1; view.busy = false; render(); sayLetter(view.targets[view.i]); }
      else finishGame(view.mistakes, 'alpha', 'alpha');
    }, 1500);
  }
  const renderAGame = () => (view.game === 'aquiz' ? renderAQuiz() : renderASuche());

  /* -- Nachspuren: Buchstabe blass, mit dem Finger darüberfahren (keine Prüfung) -- */
  function startTrace(idx) {
    go({ name: 'trace', cat: view.cat, idx, strokes: [] });
    sayLetter(ALPHABET[idx]);
  }
  function renderTrace() {
    const l = ALPHABET[view.idx];
    return `${topbar(ALPHA_TOP, '<span></span>', 'Nachspuren')}
      <div class="prompt">
        <button class="speaker sm" data-act="t-say" aria-label="Anhören">${ICON.speaker}</button>
        <span class="ar tname">${l.name}</span>${trHtml(l, 'otr')}
      </div>
      <div class="scene-card"><svg class="tracer" viewBox="0 0 100 100" aria-label="Buchstabe nachspuren">
        <text class="ghost ar" x="50" y="52" text-anchor="middle" dominant-baseline="central">${l.ch}</text>
        <g class="ink" fill="none" stroke="#E8836B" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"></g>
      </svg></div>
      <div class="palette"><div class="tools">
        <button class="chip reset" data-act="t-prev" ${view.idx === 0 ? 'disabled style="opacity:.35"' : ''} aria-label="Vorheriger Buchstabe">${ICON.prev}</button>
        <button class="chip reset" data-act="t-undo" aria-label="Rückgängig">${ICON.undo}</button>
        <button class="chip reset" data-act="t-clear" aria-label="Löschen">${ICON.trash}</button>
        <button class="chip reset" data-act="t-next" ${view.idx === ALPHABET.length - 1 ? 'disabled style="opacity:.35"' : ''} aria-label="Nächster Buchstabe">${ICON.next}</button>
      </div></div>`;
  }
  function bindTrace() {
    const svg = app.querySelector('.tracer');
    const layer = svg.querySelector('.ink');
    let cur = null;
    const at = (e) => {
      const p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(svg.getScreenCTM().inverse());
      return `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    };
    svg.addEventListener('pointerdown', (e) => {
      const start = at(e);
      const path = document.createElementNS(NS, 'path');
      cur = { path, d: `M${start} L${start}` };
      path.setAttribute('d', cur.d);
      layer.appendChild(path);
      view.strokes.push(path);
      try { svg.setPointerCapture(e.pointerId); } catch { /* ignorieren */ }
      e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => {
      if (!cur) return;
      cur.d += ` L${at(e)}`;
      cur.path.setAttribute('d', cur.d);
    });
    ['pointerup', 'pointercancel'].forEach((t) => svg.addEventListener(t, () => { cur = null; }));
  }

  /* ---------- Elternbereich ---------- */
  let recorder = null;
  let recordingKey = null;

  function renderParent() {
    const cats = [...CATEGORIES, ALPHA_CAT].map((c) => `
      <div class="cat-title">${c.icon} ${c.de}</div>
      ${[...c.items, ...(c.extra || [])].map((it) => {
        const k = keyOf(c, it);
        const has = recs.has(k);
        const live = recordingKey === k;
        return `<div class="row">
          <span class="ar">${it.ar}</span><span class="de">${it.de}</span>
          <span class="has">${has ? '✓ eigene' : ''}</span>
          <button class="mini" data-act="p-play" data-k="${k}" aria-label="Anhören">▶</button>
          <button class="mini rec ${live ? 'live' : ''}" data-act="p-rec" data-k="${k}" aria-label="Aufnehmen">${live ? '■' : '●'}</button>
          <button class="mini" data-act="p-del" data-k="${k}" ${has ? '' : 'disabled style="opacity:.3"'} aria-label="Löschen">🗑</button>
        </div>`;
      }).join('')}`).join('');
    return `
      <div class="topbar"><button class="round-btn" data-act="learn" aria-label="Schließen">✕</button><strong style="font-size:3.6vmin">Elternbereich</strong><span class="spacer"></span></div>
      <div class="parent">
        <p class="hint">Hier kannst du die Wörter mit deiner eigenen Stimme aufnehmen (● starten, ■ beenden). Ohne Aufnahme liest die Sprachausgabe des iPads vor. Aufnahmen bleiben auf diesem Gerät.</p>
        <div class="toggle-row">
          <button class="mini text" data-act="p-tr">Lautschrift: ${settings.tr ? 'an' : 'aus'}</button>
          <button class="mini text" data-act="p-reset">Sterne zurücksetzen</button>
        </div>
        <div class="cat-title">Buchstaben für die Alphabet-Spiele</div>
        <p class="hint">Antippen schaltet einen Buchstaben ein oder aus. Die Spiele „Hören &amp; Finden" und „Such den Buchstaben" fragen nur eingeschaltete Buchstaben ab, zum Beispiel die, die in der Schule dran waren.</p>
        <div class="letter-toggles">${ALPHABET.map((l) => `<button class="ltoggle ${settings.letters.includes(l.id) ? 'on' : ''}" data-act="p-letter" data-id="${l.id}"><span class="ar">${l.ch}</span></button>`).join('')}</div>
        ${cats}
      </div>`;
  }

  async function toggleRecord(k) {
    if (recorder) { recorder.stop(); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) { alert('Aufnahme wird auf diesem Gerät nicht unterstützt.'); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { alert('Bitte erlaube den Zugriff auf das Mikrofon.'); return; }
    const chunks = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = (e) => chunks.push(e.data);
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/mp4' });
      recorder = null; recordingKey = null;
      if (blob.size > 0) { recs.set(k, blob); await idb.put(k, blob); }
      if (view.name === 'parent') keepScroll(render);
    };
    recorder = mr; recordingKey = k;
    mr.start();
    keepScroll(render);
  }

  function keepScroll(fn) {
    const p = app.querySelector('.parent');
    const top = p ? p.scrollTop : 0;
    fn();
    const np = app.querySelector('.parent');
    if (np) np.scrollTop = top;
  }

  function playRec(k) {
    const [cid, iid] = k.split('/');
    const c = catById(cid);
    speak(c, [...c.items, ...(c.extra || [])].find((x) => x.id === iid));
  }

  /* ---------- Eltern-Zugang: 2 Sekunden gedrückt halten ---------- */
  function bindGate() {
    const g = app.querySelector('[data-gate]');
    let t = null;
    const clear = () => { clearTimeout(t); t = null; };
    g.addEventListener('pointerdown', () => { t = setTimeout(() => go({ name: 'parent', cat: view.cat }), 2000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => g.addEventListener(e, clear));
  }

  /* ---------- Eingaben ---------- */
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const c = view.cat && catById(view.cat);
    switch (el.dataset.act) {
      case 'open': {
        const nc = catById(el.dataset.cat);
        const tab = currentTab();
        if (view.name === 'parent' || tab === 'learn' || tab === 'alpha') { go({ name: 'learn', cat: nc.id, idx: 0 }); speak(nc, nc.items[0]); }
        else if (tab === 'quiz') startQuiz(nc);
        else go({ name: 'games', cat: nc.id });
        break;
      }
      case 'games': go({ name: 'games', cat: view.cat }); break;
      case 'alpha': go({ name: 'alpha', cat: view.cat }); break;
      case 'l-open': go({ name: 'letter', cat: view.cat, idx: ALPHABET.findIndex((l) => l.id === el.dataset.id) }); sayLetter(ALPHABET[view.idx]); break;
      case 'l-prev': view.idx -= 1; render(); sayLetter(ALPHABET[view.idx]); break;
      case 'l-next': view.idx += 1; render(); sayLetter(ALPHABET[view.idx]); break;
      case 'l-say': sayLetter(ALPHABET[view.idx]); break;
      case 'l-word': sayWord(ALPHABET[view.idx].words[Number(el.dataset.k)]); break;
      case 'l-trace': startTrace(view.idx); break;
      case 'a-quiz-start': startAQuiz(); break;
      case 'a-suche-start': startASuche(); break;
      case 'a-trace-start': startTrace(ALPHABET.indexOf(activeLetters()[0])); break;
      case 'a-pick': aPick(el); break;
      case 'a-spick': aSPick(el); break;
      case 'a-ask': sayLetter(view.game === 'aquiz' ? view.rounds[view.i].target : view.targets[view.i]); break;
      case 't-say': sayLetter(ALPHABET[view.idx]); break;
      case 't-prev': startTrace(view.idx - 1); break;
      case 't-next': startTrace(view.idx + 1); break;
      case 't-undo': view.strokes.pop()?.remove(); break;
      case 't-clear': view.strokes = []; render(); break;
      case 'p-letter': {
        const id = el.dataset.id;
        const has = settings.letters.includes(id);
        settings.letters = has ? settings.letters.filter((x) => x !== id) : [...settings.letters, id];
        if (!settings.letters.length) settings.letters = [id];
        store.set('settings', settings); keepScroll(render); break;
      }
      case 'g-start': ({ suche: startSuche, zaehlen: startZaehlen, geben: startGeben, malen: startMalen, finger: startFinger, sinn: startSinn })[el.dataset.g](); break;
      case 's-pick': sPick(el); break;
      case 's-ask': speak(c, view.targets[view.i]); break;
      case 'z-tap': zTap(el); break;
      case 'g-pick': gPick(el); break;
      case 'g-done': gDone(); break;
      case 'g-ask': { const z = catById('zahlen'); speak(z, z.items[view.rounds[view.i].n - 1]); break; }
      case 'm-color': mColor(el); break;
      case 'm-fill': mFill(el); break;
      case 'n-pick': nPick(el); break;
      case 'n-ask': speak(catById('sinne'), view.rounds[view.i]); break;
      case 'm-reset': if (view.game === 'finger') view.strokes = []; else view.fills = {}; render(); break;
      case 'f-size': view.size = Number(el.dataset.i); app.querySelectorAll('.size').forEach((x) => x.classList.toggle('sel', x === el)); break;
      case 'f-undo': view.strokes.pop()?.remove(); break;
      case 'learn': go({ name: 'learn', cat: view.cat, idx: 0 }); speak(c, c.items[0]); break;
      case 'prev': view.idx -= 1; render(); speak(c, c.items[view.idx]); break;
      case 'next': view.idx += 1; render(); speak(c, c.items[view.idx]); break;
      case 'say': speak(c, c.items[view.idx]); break;
      case 'quiz': startQuiz(c); break;
      case 'ask': speak(c, view.rounds[view.i].target); break;
      case 'pick': pick(el); break;
      case 'p-rec': toggleRecord(el.dataset.k); break;
      case 'p-play': playRec(el.dataset.k); break;
      case 'p-del': recs.delete(el.dataset.k); idb.del(el.dataset.k); keepScroll(render); break;
      case 'p-tr': settings.tr = !settings.tr; store.set('settings', settings); keepScroll(render); break;
      case 'p-reset': stars = {}; store.set('stars', stars); break;
    }
  });

  // Doppeltipp-Zoom und Kontextmenü unterbinden
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  idb.open().then(idb.loadAll).then(render);
  render();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
