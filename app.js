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
  let settings = { tr: true, ...store.get('settings', {}) };

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
  const catById = (id) => CATEGORIES.find((c) => c.id === id);

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
    undo: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5"/><path d="M4.5 4.5v4.8h4.8"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3M6 6l2.1 2.1M15.9 15.9 18 18M18 6l-2.1 2.1M8.1 15.9 6 18"/>'),
  };
  const STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5l-5.4 3 1.2-6L3.3 9.3l6.1-.7z"/></svg>';
  const starsText = (n) => (n ? STAR.repeat(n) : '');
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
    const fn = { learn: renderLearn, quiz: renderQuiz, result: renderResult, parent: renderParent, games: renderGames, game: renderGame }[view.name];
    app.innerHTML = renderNav() + `<div class="content screen">${fn()}</div>`;
    bindGate();
  }

  function renderNav() {
    const items = CATEGORIES.map((c) => `
      <button class="nav-item ${view.name !== 'parent' && c.id === view.cat ? 'active' : ''}" data-act="open" data-cat="${c.id}" aria-label="${c.de}">
        <span class="ico">${Sketch.nav(c.id) || c.icon}</span>
        <span class="stars">${starsText(stars[c.id] || 0)}</span>
      </button>`).join('');
    return `<nav class="nav">${items}<button class="parent-gate" data-gate aria-label="Eltern">${ICON.gear}</button></nav>`;
  }

  const currentTab = () => ({ learn: 'learn', quiz: 'quiz', games: 'play', game: 'play', result: view.tab }[view.name] || 'learn');

  function topbar(c, dots, label) {
    const tab = currentTab();
    const on = (n) => (tab === n ? 'on' : '');
    return `<div class="topbar">
      <div class="seg">
        <button class="seg-i ${on('learn')}" data-act="learn">Lernen</button>
        <button class="seg-i ${on('quiz')}" data-act="quiz">Finden</button>
        <button class="seg-i ${on('play')}" data-act="games">Spielen</button>
      </div>
      ${dots}
      <span class="cat-name"><span class="ar">${c.ar}</span><span class="de">${label || c.de}</span></span>
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
    const c = catById(view.cat);
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
  const GAMES = [
    { id: 'suche', de: 'Such mich!' },
    { id: 'zaehlen', de: 'Zähl mit!' },
    { id: 'geben', de: 'Gib mir …' },
    { id: 'malen', de: 'Ausmalen' },
  ];
  const objects = () => ['tiere', 'essen'].flatMap((cid) => catById(cid).items.map((it) => ({ cid, it })));
  const pickObjects = (k) => shuffle(objects()).slice(0, k);
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
  const objArt = (o) => `<div class="visual sm">${Sketch.motif(o.cid, o.it.id)}</div>`;
  const badge = (z, n) => `<span class="badge"><b class="ar">${z.items[n - 1].digit}</b><i>${n}</i></span>`;
  const tick = `<span class="tick">${STAR}</span>`;

  function finishGame(mistakes) {
    const earned = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    go({ name: 'result', cat: view.cat, earned, tab: 'play', next: 'games' });
  }

  function renderGames() {
    const c = catById(view.cat);
    const cards = GAMES.map((g) => `<button class="game-card" data-act="g-start" data-g="${g.id}">
        <div class="gic">${Sketch.get('game/' + g.id)}</div><span>${g.de}</span></button>`).join('');
    return `${topbar(c, '<span></span>')}<div class="games-grid">${cards}</div>`;
  }

  function renderGame() {
    return { suche: renderSuche, zaehlen: renderZaehlen, geben: renderGeben, malen: renderMalen }[view.game]();
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
    go({ name: 'game', game: 'zaehlen', cat: 'zahlen', i: 0, busy: false,
      rounds: ns.map((n, i) => ({ n, obj: objs[i], pos: scatter(n), counted: [] })) });
  }
  function renderZaehlen() {
    const c = catById('zahlen');
    const r = view.rounds[view.i];
    const items = r.pos.map((p, k) => {
      const num = r.counted.indexOf(k) + 1;
      return fitem(p, objArt(r.obj) + (num ? badge(c, num) : ''), `data-act="z-tap" data-k="${k}"`, num ? 'counted' : '');
    }).join('');
    return `${topbar(c, dotsHtml(view.rounds.length, view.i), 'Zähl mit!')}
      <div class="prompt"><span class="hint-chip" id="hint">Tippe alles an und zähle mit</span><div class="total" id="total"></div></div>
      <div class="field-card"><div class="field" style="--s:15vmin">${items}</div></div>`;
  }
  function zTap(el) {
    const c = catById('zahlen');
    const r = view.rounds[view.i];
    const k = Number(el.dataset.k);
    const had = r.counted.indexOf(k);
    if (had >= 0) { speak(c, c.items[had]); return; }
    if (view.busy) return;
    r.counted.push(k);
    const num = r.counted.length;
    el.classList.add('counted');
    el.insertAdjacentHTML('beforeend', badge(c, num));
    speak(c, c.items[num - 1]);
    if (num < r.n) return;
    view.busy = true;
    const it = c.items[r.n - 1];
    document.getElementById('hint').style.display = 'none';
    document.getElementById('total').innerHTML = `<b class="ar">${it.digit}</b><b>${r.n}</b><span class="ar">${it.ar}</span>${STAR}`;
    later(() => {
      if (view.i + 1 < view.rounds.length) { view.i += 1; view.busy = false; render(); }
      else finishGame(0);
    }, 2600);
  }

  /* -- Gib mir … -- */
  function startGeben() {
    const c = catById('zahlen');
    const ns = numbers(8, 5);
    const objs = pickObjects(5);
    go({ name: 'game', game: 'geben', cat: 'zahlen', i: 0, mistakes: 0, busy: false,
      rounds: ns.map((n, i) => ({ n, obj: objs[i], pos: scatter(Math.min(12, n + 4)), picked: [] })) });
    speak(c, c.items[ns[0] - 1]);
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
        <span class="numchip"><b class="ar">${it.digit}</b><b>${r.n}</b></span>
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

  /* -- Ausmalen -- */
  function startMalen() {
    go({ name: 'game', game: 'malen', cat: 'farben', color: catById('farben').items[0].id, fills: {} });
  }
  function renderMalen() {
    const c = catById('farben');
    const chips = c.items.map((it) => `<button class="chip ${it.id === view.color ? 'sel' : ''}" data-act="m-color" data-id="${it.id}" style="--c:${it.color}" aria-label="${it.de}"></button>`).join('');
    return `${topbar(c, '<span></span>', 'Ausmalen')}
      <div class="scene-card">${Sketch.scene(view.fills)}</div>
      <div class="palette">${chips}<button class="chip reset" data-act="m-reset" aria-label="Neu beginnen">${ICON.undo}</button></div>`;
  }
  function mColor(el) {
    const c = catById('farben');
    view.color = el.dataset.id;
    app.querySelectorAll('.chip').forEach((x) => x.classList.toggle('sel', x === el));
    speak(c, c.items.find((x) => x.id === view.color));
  }
  function mFill(el) {
    const c = catById('farben');
    const col = c.items.find((x) => x.id === view.color).color;
    view.fills[el.dataset.r] = col;
    el.setAttribute('fill', col);
  }

  /* ---------- Elternbereich ---------- */
  let recorder = null;
  let recordingKey = null;

  function renderParent() {
    const cats = CATEGORIES.map((c) => `
      <div class="cat-title">${c.icon} ${c.de}</div>
      ${c.items.map((it) => {
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
    speak(c, c.items.find((x) => x.id === iid));
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
        if (view.name === 'parent' || tab === 'learn') { go({ name: 'learn', cat: nc.id, idx: 0 }); speak(nc, nc.items[0]); }
        else if (tab === 'quiz') startQuiz(nc);
        else go({ name: 'games', cat: nc.id });
        break;
      }
      case 'games': go({ name: 'games', cat: view.cat }); break;
      case 'g-start': ({ suche: startSuche, zaehlen: startZaehlen, geben: startGeben, malen: startMalen })[el.dataset.g](); break;
      case 's-pick': sPick(el); break;
      case 's-ask': speak(c, view.targets[view.i]); break;
      case 'z-tap': zTap(el); break;
      case 'g-pick': gPick(el); break;
      case 'g-done': gDone(); break;
      case 'g-ask': { const z = catById('zahlen'); speak(z, z.items[view.rounds[view.i].n - 1]); break; }
      case 'm-color': mColor(el); break;
      case 'm-fill': mFill(el); break;
      case 'm-reset': view.fills = {}; render(); break;
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
