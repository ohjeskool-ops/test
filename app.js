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
  let settings = store.get('settings', { tr: true });

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
      inner = `<div class="swatch" style="background:${item.color}"></div>`;
    } else if (cat.type === 'number') {
      inner = `<div class="numvis"><div class="big"><span>${item.n}</span><span class="ar">${item.digit}</span></div>` +
        `<div class="pips">${'<i class="pip"></i>'.repeat(item.n)}</div></div>`;
    } else {
      inner = `<div class="emoji">${item.emoji}</div>`;
    }
    return `<div class="visual${small ? ' sm' : ''}">${inner}</div>`;
  }

  const starsText = (n) => (n ? '⭐'.repeat(n) : '');
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  /* ---------- Bildschirme ---------- */
  let view = { name: 'home' };

  function go(next) {
    view = next;
    stopSound();
    render();
  }

  function render() {
    const fn = { home: renderHome, mode: renderMode, learn: renderLearn, quiz: renderQuiz, result: renderResult, parent: renderParent }[view.name];
    app.innerHTML = `<div class="screen">${fn()}</div>`;
    if (view.name === 'parent') return;
    if (view.name === 'home') bindGate();
  }

  function renderHome() {
    const tiles = CATEGORIES.map((c) => `
      <button class="tile" data-act="open" data-cat="${c.id}" style="background:${c.tint}" aria-label="${c.de}">
        <span class="ico">${c.icon}</span>
        <span class="nm-ar ar">${c.ar}</span>
        <span class="nm">${c.de}</span>
        <span class="stars">${starsText(stars[c.id] || 0)}</span>
      </button>`).join('');
    return `
      <div class="home-head"><div class="ar">عَرَبِي</div><div class="de">Arabisch lernen</div></div>
      <div class="tiles">${tiles}</div>
      <button class="parent-gate" data-gate aria-label="Eltern">⚙️</button>`;
  }

  function renderMode() {
    const c = catById(view.cat);
    return `
      <div class="topbar"><button class="round-btn" data-act="home" aria-label="Zurück">🏠</button><span></span><span class="spacer"></span></div>
      <div class="mode-wrap">
        <div class="mode-title"><div class="ar">${c.ar}</div><div class="de">${c.de}</div></div>
        <div class="mode-btns">
          <button class="mode-btn" data-act="learn"><span class="ico">👀</span>Lernen</button>
          <button class="mode-btn" data-act="quiz"><span class="ico">👂</span>Zuhören &amp; Finden<span class="stars">${starsText(stars[c.id] || 0)}</span></button>
        </div>
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
      <div class="topbar"><button class="round-btn" data-act="back-mode" aria-label="Zurück">🏠</button>${dotsHtml(c.items.length, view.idx)}<span class="spacer"></span></div>
      <div class="learn">
        <button class="nav-btn" data-act="prev" ${view.idx === 0 ? 'disabled' : ''} aria-label="Zurück">◀</button>
        <button class="card-main" data-act="say" aria-label="Anhören">
          ${visual(c, item, false)}
          <div class="word-ar ar">${item.ar}</div>
          ${settings.tr ? `<div class="word-tr">${item.tr}</div>` : ''}
          <div class="word-de">${item.de}</div>
        </button>
        ${last
          ? '<button class="nav-btn quiz" data-act="quiz" aria-label="Zum Quiz">Quiz ▶</button>'
          : '<button class="nav-btn" data-act="next" aria-label="Weiter">▶</button>'}
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
      <div class="topbar"><button class="round-btn" data-act="back-mode" aria-label="Zurück">🏠</button>${dotsHtml(view.rounds.length, view.i)}<span class="spacer"></span></div>
      <div class="quiz">
        <button class="speaker" data-act="ask" aria-label="Nochmal anhören">🔊</button>
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
    document.getElementById('praise').textContent = '⭐';
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
        go({ name: 'result', cat: c.id, earned });
      }
    }, 1600);
  }

  function renderResult() {
    return `
      <div class="result">
        <div class="big-stars">${starsText(view.earned)}</div>
        <div class="msg ar" style="font-size:9vmin">أَحْسَنْتِ!</div>
        <div class="msg">Super gemacht!</div>
        <button class="pill" data-act="back-mode">Fertig</button>
      </div>`;
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
      <div class="topbar"><button class="round-btn" data-act="home" aria-label="Zurück">🏠</button><strong style="font-size:3.6vmin">Elternbereich</strong><span class="spacer"></span></div>
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
    g.addEventListener('pointerdown', () => { t = setTimeout(() => go({ name: 'parent' }), 2000); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => g.addEventListener(e, clear));
  }

  /* ---------- Eingaben ---------- */
  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const c = view.cat && catById(view.cat);
    switch (el.dataset.act) {
      case 'home': if (recorder) recorder.stop(); go({ name: 'home' }); break;
      case 'open': go({ name: 'mode', cat: el.dataset.cat }); break;
      case 'back-mode': go({ name: 'mode', cat: view.cat }); break;
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
