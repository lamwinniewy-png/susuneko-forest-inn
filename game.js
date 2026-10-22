/* Susu & Neko 夢幻森林旅店 — 默書遊戲 */
(() => {
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const STAR = c => `<svg viewBox="0 0 24 24"><path fill="${c}" d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>`;
const ICON = {
  spk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h4l5 4V6L7 10z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/></svg>',
  slow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16c0-5 3.5-9 8-9s8 4 8 9z"/><path d="M2 16h20M7 16v3M17 16v3"/></svg>',
  undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/></svg>',
  clr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
};

/* ---------- audio ---------- */
let muted = false, player = null, AC = null;
function play(name, rate = 1) {
  if (muted) return Promise.resolve();
  try { if (player) player.pause(); } catch (e) {}
  player = new Audio(`audio/${name}.mp3`);
  player.playbackRate = rate; if ('preservesPitch' in player) player.preservesPitch = true;
  return new Promise(res => { player.onended = res; player.onerror = res; player.play().catch(res); });
}
function tone(kind) {
  if (muted) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = kind === 'ok' ? [[880, 0], [1175, .09], [1568, .18]] : kind === 'pop' ? [[1300, 0]] : kind === 'win' ? [[784, 0], [988, .12], [1175, .24], [1568, .38]] : [[300, 0], [240, .12]];
    seq.forEach(([f, t]) => {
      const o = AC.createOscillator(), g = AC.createGain(); o.type = kind === 'no' ? 'triangle' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, AC.currentTime + t); g.gain.linearRampToValueAtTime(.18, AC.currentTime + t + .02); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + t + .28);
      o.connect(g).connect(AC.destination); o.start(AC.currentTime + t); o.stop(AC.currentTime + t + .3);
    });
  } catch (e) {}
}
$('#muteBtn').onclick = () => { muted = !muted; document.body.classList.toggle('muted', muted); if (muted && player) player.pause(); };

/* ---------- stars (kept for this visit) ---------- */
const best = {};
function renderStars() {
  let t = 0; for (const k in best) t += best[k];
  $('#starTotal').textContent = t;
  document.querySelectorAll('[data-stars]').forEach(n => { const b = best[n.dataset.stars] || 0; n.innerHTML = [0, 1, 2].map(i => STAR(i < b ? '#FFC94D' : '#E9DFF5')).join(''); });
  return t;
}
renderStars();

/* ---------- feedback ---------- */
let popT;
function cheer(txt, who) {
  const p = $('#pop'); $('#popImg').src = who || (Math.random() < .5 ? 'img/susu_cheer.webp' : 'img/neko_cheer.webp'); $('#popTxt').textContent = txt;
  p.classList.add('on'); clearTimeout(popT); popT = setTimeout(() => p.classList.remove('on'), 1300);
}
const RIGHT = ['right1', 'right2', 'right3'], WRONG = ['wrong1', 'wrong2'];
function good(sayAfter) { tone('ok'); const k = RIGHT[Math.random() * 3 | 0]; cheer(D.ph[k]); return play(k).then(() => sayAfter && play(sayAfter)); }
function bad() { tone('no'); const k = WRONG[Math.random() * 2 | 0]; const p = $('#pop'); $('#popImg').src = 'img/susu_think.webp'; $('#popTxt').textContent = D.ph[k]; p.classList.add('on'); clearTimeout(popT); popT = setTimeout(() => p.classList.remove('on'), 1500); play(k); }

function confetti() {
  const c = $('#fx'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
  const cols = ['#FF8FB8', '#A98CEB', '#6CCBB8', '#FFC94D', '#9CC7F5'];
  const ps = Array.from({ length: 110 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .5, vx: (Math.random() - .5) * 2.4, vy: 1.6 + Math.random() * 3, r: Math.random() * 6, s: 7 + Math.random() * 9, c: cols[Math.random() * 5 | 0], star: Math.random() < .4 }));
  let f = 0; (function tick() {
    x.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += .06; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c;
      if (p.star) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, rr = i % 2 ? p.s * .45 : p.s; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.fill(); } else { x.beginPath(); x.arc(0, 0, p.s / 2, 0, 7); x.fill(); }
      x.restore(); });
    if (++f < 200) requestAnimationFrame(tick); else x.clearRect(0, 0, c.width, c.height);
  })();
}

/* ---------- navigation ---------- */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  $('#s-' + id).classList.add('on');
  document.body.classList.toggle('in-game', id !== 'home');
  window.scrollTo(0, 0);
}
$('#backBtn').onclick = () => { if (player) player.pause(); show('home'); renderStars(); };
document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => GAMES[b.dataset.go]());
$('#helloBtn').onclick = () => play('hello_s').then(() => play('hello_n'));

/* lesson reader */
const lesson = $('#lesson');
D.paras.forEach((p, i) => { const e = el('p', '', p); e.onclick = () => { readStop = true; hl(i); play('p' + i).then(() => hl(-1)); }; lesson.appendChild(e); });
let readStop = false;
const hl = i => [...lesson.children].forEach((p, j) => p.classList.toggle('reading', i === j));
$('#readAll').onclick = async () => { readStop = false; for (let i = 0; i < D.paras.length; i++) { if (readStop) break; hl(i); await play('p' + i); } hl(-1); };

/* ---------- game frame ---------- */
let G = null;
function frame(key, title, intro, guideImg) {
  G = { key, total: 0, n: 0, score: 0, wrongs: [] };
  $('#gTitle').textContent = title; $('#guideImg').src = guideImg || 'img/neko_point.webp';
  $('#guideTxt').textContent = D.ph[intro]; show('game'); play(intro);
  return $('#stage');
}
function prog() { $('#gBar').style.width = (G.n / G.total * 100) + '%'; $('#gCount').textContent = `${Math.min(G.n + 1, G.total)} / ${G.total}`; }
function finish(again) {
  const pct = G.score / G.total, st = pct >= .95 ? 3 : pct >= .75 ? 2 : pct >= .4 ? 1 : 0;
  best[G.key] = Math.max(best[G.key] || 0, st); const total = renderStars();
  $('#gBar').style.width = '100%'; $('#gCount').textContent = `${G.total} / ${G.total}`;
  const stage = $('#stage'); stage.innerHTML = '';
  const r = el('div', 'result', `<img src="${st === 3 ? 'img/duo.webp' : 'img/neko_cheer.webp'}" alt="">
    <h3>${st === 3 ? '完美過關' : '完成了'}</h3><div class="score">答對 ${G.score} / ${G.total}</div>
    <div class="st">${[0, 1, 2].map(i => STAR(i < st ? '#FFC94D' : '#E9DFF5')).join('')}</div>
    ${G.wrongs.length ? `<div class="score">要多練習：</div><div class="redo">${[...new Set(G.wrongs)].map(w => `<span>${w}</span>`).join('')}</div>` : ''}
    <div class="row"><button class="btn big pink" id="again">再玩一次</button><button class="btn big" id="home">返回大堂</button></div>`);
  stage.appendChild(r);
  r.querySelector('#again').onclick = again; r.querySelector('#home').onclick = () => $('#backBtn').click();
  tone('win'); if (st >= 2) confetti();
  if (total === 21) setTimeout(() => play('all'), 300); else play(st === 3 ? 'done3' : 'done');
}

/* ---------- 101 星星泡泡 ---------- */
function bubble() {
  const stage = frame('bubble', '星星泡泡', 'g_bubble', 'img/neko_point.webp');
  const rounds = shuffle(D.words).slice(0, 10); G.total = rounds.length;
  const COLORS = ['#FFC3DA', '#D7C6FA', '#BFEDE3', '#FFE3A8'];
  const POS = [[8, 10], [56, 4], [14, 52], [60, 50]];
  function round() {
    if (G.n >= G.total) return finish(bubble);
    prog(); const w = rounds[G.n]; let first = true;
    const others = shuffle(D.words.filter(x => x.w !== w.w)).slice(0, 1).map(x => x.w);
    const opts = shuffle([w.w, ...w.bad, ...others]);
    stage.innerHTML = `<div class="listen"><button class="btn lilac" id="l1">${ICON.spk}再聽一次</button><button class="btn" id="l2">${ICON.slow}慢慢讀</button></div><div class="bub-field" id="field"></div>`;
    const field = stage.querySelector('#field');
    opts.forEach((o, i) => {
      const b = el('button', 'bub', o); b.style.left = POS[i][0] + '%'; b.style.top = POS[i][1] + '%'; b.style.setProperty('--bc', COLORS[i]); b.style.animationDelay = (i * .5) + 's';
      b.onclick = () => {
        if (b.classList.contains('no') || field.dataset.done) return;
        if (o === w.w) { field.dataset.done = 1; tone('pop'); b.classList.add('pop'); if (first) G.score++; good('w' + w.i).then(() => { G.n++; round(); }); }
        else { first = false; G.wrongs.push(w.w); b.classList.add('no'); bad(); }
      };
      field.appendChild(b);
    });
    stage.querySelector('#l1').onclick = () => play('w' + w.i);
    stage.querySelector('#l2').onclick = () => play('w' + w.i, .7);
    setTimeout(() => play('w' + w.i), G.n === 0 ? 2600 : 200);
  }
  round();
}

/* ---------- 201 魔法補字 ---------- */
function magic() {
  const stage = frame('magic', '魔法補字', 'g_magic', 'img/neko_point.webp');
  const rounds = shuffle(D.cloze).slice(0, 12); G.total = rounds.length;
  function round() {
    if (G.n >= G.total) return finish(magic);
    prog(); const q = rounds[G.n]; let first = true;
    const idx = q.s.indexOf(q.k);
    stage.innerHTML = `<div class="listen"><button class="btn lilac" id="l1">${ICON.spk}聽句子</button></div>
      <div class="q-line">${q.s.slice(0, idx)}<span class="gap" id="gap">？</span>${q.s.slice(idx + q.k.length)}</div><div class="opts" id="opts"></div>`;
    const box = stage.querySelector('#opts');
    shuffle([q.k, ...q.bad]).forEach(o => {
      const b = el('button', 'opt', o);
      b.onclick = () => {
        if (b.disabled) return;
        if (o === q.k) { box.querySelectorAll('button').forEach(x => x.disabled = true); b.classList.add('ok'); const g = stage.querySelector('#gap'); g.textContent = q.k; g.classList.add('fill');
          if (first) G.score++; good('d' + q.d).then(() => { G.n++; round(); }); }
        else { first = false; G.wrongs.push(q.k); b.classList.add('no'); b.disabled = true; bad(); }
      };
      box.appendChild(b);
    });
    stage.querySelector('#l1').onclick = () => play('k' + q.i);
  }
  round();
}

/* ---------- 202 小兔執房間 ---------- */
function order() {
  const stage = frame('order', '小兔執房間', 'g_order', 'img/bunny.webp');
  const rounds = shuffle(D.chunks.map((c, i) => ({ c, i }))).slice(0, 7); G.total = rounds.length;
  function round() {
    if (G.n >= G.total) return finish(order);
    prog(); const q = rounds[G.n]; let first = true, picked = [];
    let pool = shuffle(q.c.map((t, j) => ({ t, j }))); if (pool.every((p, k) => p.j === k)) pool = pool.reverse();
    stage.innerHTML = `<div class="listen"><button class="btn lilac" id="l1">${ICON.spk}聽句子</button><button class="btn" id="undo">${ICON.undo}退一步</button></div>
      <div class="slots" id="slots"><span class="ph">按下面的詞語，排出句子</span></div><div class="row" id="pool"></div>`;
    const slots = stage.querySelector('#slots'), poolEl = stage.querySelector('#pool');
    const chips = pool.map(p => { const c = el('button', 'chip', p.t); c.onclick = () => pick(p, c); poolEl.appendChild(c); return c; });
    function draw() {
      slots.innerHTML = picked.length ? '' : '<span class="ph">按下面的詞語，排出句子</span>';
      picked.forEach(p => slots.appendChild(el('span', 'chip', p.t)));
    }
    function pick(p, c) {
      if (c.classList.contains('used') || slots.classList.contains('good')) return;
      tone('pop'); picked.push(p); c.classList.add('used'); draw();
      if (picked.length === q.c.length) {
        if (picked.every((x, k) => x.t === q.c[k])) { slots.classList.add('good'); if (first) G.score++; good('d' + q.i).then(() => { G.n++; round(); }); }
        else { first = false; G.wrongs.push(q.c.join('')); slots.classList.add('bad'); bad();
          setTimeout(() => { slots.classList.remove('bad'); picked = []; chips.forEach(x => x.classList.remove('used')); draw(); }, 900); }
      }
    }
    stage.querySelector('#undo').onclick = () => { if (!picked.length || slots.classList.contains('good')) return; const p = picked.pop(); chips[pool.indexOf(p)].classList.remove('used'); draw(); };
    stage.querySelector('#l1').onclick = () => play('d' + q.i);
    setTimeout(() => play('d' + q.i), G.n === 0 ? 2600 : 200);
  }
  round();
}

/* ---------- 203 標點糖果屋 ---------- */
function candy() {
  const stage = frame('candy', '標點糖果屋', 'g_candy', 'img/neko_point.webp');
  const PUN = '，。！、「」', COL = { '，': '#FF8FB8', '。': '#A98CEB', '！': '#F6A04D', '、': '#6CCBB8', '「': '#7DB3EE', '」': '#7DB3EE' };
  const NAME = { '，': '逗號', '。': '句號', '！': '感嘆號', '、': '頓號', '「': '開引號', '」': '閂引號' };
  // one round per paragraph; total = number of punctuation marks
  const paras = D.paras; let pi = 0; G.total = [...paras.join('')].filter(c => PUN.includes(c)).length;
  function round() {
    if (pi >= paras.length) return finish(candy);
    const txt = paras[pi]; const marks = []; let html = '';
    [...txt].forEach(c => { if (PUN.includes(c)) { html += `<span class="pbox" data-k="${marks.length}"></span>`; marks.push(c); } else html += c; });
    let cur = 0, first = true;
    stage.innerHTML = `<div class="listen"><button class="btn lilac" id="l1">${ICON.spk}聽這段</button></div>
      <div class="punc-line">${html}</div><div class="candies" id="cand"></div>`;
    const boxes = [...stage.querySelectorAll('.pbox')];
    const mark = () => boxes.forEach((b, k) => b.classList.toggle('cur', k === cur));
    mark(); prog();
    [...PUN].forEach(p => {
      const b = el('button', 'candy', `<span>${p}</span>`); b.style.background = COL[p]; b.setAttribute('aria-label', NAME[p]);
      b.onclick = () => {
        if (cur >= marks.length) return;
        if (p === marks[cur]) {
          tone('pop'); boxes[cur].textContent = p; boxes[cur].classList.add('done'); if (first) G.score++; first = true; G.n++; cur++; mark(); prog();
          if (cur >= marks.length) { good('p' + pi).then(() => { pi++; round(); }); }
        } else { first = false; G.wrongs.push(NAME[marks[cur]]); b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); bad(); }
      };
      stage.querySelector('#cand').appendChild(b);
    });
    stage.querySelector('#l1').onclick = () => play('p' + pi);
  }
  round();
}

/* ---------- 102 翻翻魔法卡 ---------- */
function match() {
  const stage = frame('match', '翻翻魔法卡', 'g_match', 'img/neko_point.webp');
  const pairs = shuffle(D.match).slice(0, 6);
  G.total = pairs.length; let tries = 0, open = [], lock = false, got = 0;
  const cards = shuffle(pairs.flatMap(p => [{ id: p.i, t: p.w, kind: 'w' }, { id: p.i, t: p.m, kind: 'm' }]));
  stage.innerHTML = `<div class="cards" id="cards"></div>`;
  const grid = stage.querySelector('#cards');
  $('#gCount').textContent = `0 / ${G.total} 對`;
  cards.forEach(cd => {
    const c = el('button', 'card', `<div class="b">${ICON.star}</div><div class="f ${cd.kind}">${cd.t}</div>`);
    c.onclick = () => {
      if (lock || c.classList.contains('open')) return;
      c.classList.add('open'); tone('pop'); if (cd.kind === 'w') play('m' + cd.id);
      open.push([c, cd]);
      if (open.length === 2) {
        lock = true; tries++;
        const [[c1, d1], [c2, d2]] = open;
        if (d1.id === d2.id && d1.kind !== d2.kind) {
          got++; G.n = got; $('#gBar').style.width = (got / G.total * 100) + '%'; $('#gCount').textContent = `${got} / ${G.total} 對`;
          setTimeout(() => { c1.classList.add('got'); c2.classList.add('got'); open = []; lock = false;
            if (got === G.total) { G.score = Math.max(0, G.total - Math.floor(Math.max(0, tries - G.total - 3) / 2)); good().then(() => finish(match)); } else good(); }, 500);
        } else {
          setTimeout(() => { c1.classList.remove('open'); c2.classList.remove('open'); open = []; lock = false; tone('no'); }, 1100);
        }
      }
    };
    grid.appendChild(c);
  });
}

/* ---------- writing pad ---------- */
function makePad(wrap, cells, cellSize) {
  const cv = document.createElement('canvas'); wrap.appendChild(cv);
  const ctx = cv.getContext('2d'); let strokes = [], cur = null; const dpr = Math.max(1, devicePixelRatio || 1); const L = {};
  function size() {
    const w = wrap.clientWidth, cs = Math.min(cellSize, Math.floor((w - 8) / Math.max(1, Math.min(cells, cellSize < 100 ? Math.min(10, Math.floor((w - 8) / 52)) : 99))) || cellSize);
    const per = Math.max(1, Math.floor((w - 8) / cs)), rows = Math.ceil(cells / per);
    Object.assign(L, { cs, per, rows, w, ox: Math.floor((w - per * cs) / 2) });
    cv.style.height = (rows * cs + 8) + 'px'; cv.width = w * dpr; cv.height = (rows * cs + 8) * dpr; draw();
  }
  function grid() {
    ctx.save(); ctx.scale(dpr, dpr); ctx.translate(L.ox, 4);
    for (let i = 0; i < cells; i++) {
      const x = (i % L.per) * L.cs, y = Math.floor(i / L.per) * L.cs;
      ctx.setLineDash([]); ctx.strokeStyle = '#F0B8CC'; ctx.lineWidth = 1.6; ctx.strokeRect(x + 2, y + 2, L.cs - 4, L.cs - 4);
      ctx.setLineDash([5, 5]); ctx.strokeStyle = '#F7D9E4'; ctx.beginPath(); ctx.moveTo(x + L.cs / 2, y + 3); ctx.lineTo(x + L.cs / 2, y + L.cs - 3); ctx.moveTo(x + 3, y + L.cs / 2); ctx.lineTo(x + L.cs - 3, y + L.cs / 2); ctx.stroke();
    }
    ctx.restore();
  }
  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); grid();
    ctx.save(); ctx.scale(dpr, dpr); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3E2F52'; ctx.fillStyle = '#3E2F52'; ctx.setLineDash([]);
    for (const s of strokes) { if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0].x, s[0].y, s[0].w / 2, 0, 7); ctx.fill(); }
      for (let i = 1; i < s.length; i++) { ctx.lineWidth = s[i].w; ctx.beginPath(); ctx.moveTo(s[i - 1].x, s[i - 1].y); ctx.lineTo(s[i].x, s[i].y); ctx.stroke(); } }
    ctx.restore();
  }
  const pt = e => { const r = cv.getBoundingClientRect(); const base = Math.max(3.5, L.cs / 22); const p = e.pointerType === 'pen' ? (e.pressure || .5) : .55; return { x: e.clientX - r.left, y: e.clientY - r.top, w: base * (.5 + p) }; };
  cv.addEventListener('pointerdown', e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} cur = [pt(e)]; strokes.push(cur); draw(); });
  cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); (e.getCoalescedEvents ? e.getCoalescedEvents() : [e]).forEach(x => cur.push(pt(x))); draw(); });
  const end = () => { cur = null; }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  size(); if (document.fonts) document.fonts.ready.then(draw);
  let lw = wrap.clientWidth; new ResizeObserver(() => { if (Math.abs(wrap.clientWidth - lw) > 2) { lw = wrap.clientWidth; size(); } }).observe(wrap);
  return { clear() { strokes = []; draw(); }, undo() { strokes.pop(); draw(); }, empty: () => !strokes.length };
}

/* ---------- 103 / 204 魔法聽寫 ---------- */
function dictation(sentence, retry) {
  const key = sentence ? 'writeS' : 'writeW';
  const stage = frame(key, sentence ? '模擬默書' : '魔法聽寫・詞語', 'g_write', 'img/susu_think.webp');
  const items = sentence ? D.dict.map((s, i) => ({ t: s, a: 'dp' + i, b: 'd' + i })) : shuffle(D.words).map(w => ({ t: w.w, a: 'w' + w.i, b: 'w' + w.i }));
  const list = retry ? items.filter(x => retry.includes(x.t)) : items;
  G.total = list.length;
  function round() {
    if (G.n >= G.total) { const w = G.wrongs.slice(); finish(() => dictation(sentence)); if (w.length) { const r = $('#stage .row'); const b = el('button', 'btn big lilac', '只練錯咗嘅'); b.onclick = () => dictation(sentence, w); r.prepend(b); } return; }
    prog(); const q = list[G.n];
    const cells = [...q.t].length;
    stage.innerHTML = `<div class="listen"><button class="btn lilac" id="l1">${ICON.spk}${sentence ? '讀這句（連標點）' : '讀詞語'}</button><button class="btn" id="l2">${ICON.slow}慢慢讀</button></div>
      <div class="pad-wrap" id="pw"></div>
      <div class="row" style="margin-top:14px"><button class="btn" id="u">${ICON.undo}復原</button><button class="btn" id="c">${ICON.clr}清除</button><button class="btn pink" id="chk">寫好了，對答案</button></div>
      <div class="answer ${sentence ? 'sent' : ''}" id="ans"><div class="lbl">正確答案</div><div class="txt">${q.t}</div>
        <div class="row" style="margin-top:12px"><button class="btn mint" id="ok">全對</button><button class="btn" id="no">有錯，要再練</button></div></div>`;
    const big = innerWidth > 700;
    const pad = makePad(stage.querySelector('#pw'), cells, sentence ? (big ? 84 : 60) : (big ? 170 : 130));
    stage.querySelector('#l1').onclick = () => play(q.a);
    stage.querySelector('#l2').onclick = () => play(sentence ? q.a : q.b, .72);
    stage.querySelector('#u').onclick = () => pad.undo();
    stage.querySelector('#c').onclick = () => pad.clear();
    stage.querySelector('#chk').onclick = () => {
      if (pad.empty()) { $('#guideTxt').textContent = '先寫出嚟，再對答案啦！'; return; }
      stage.querySelector('#ans').classList.add('on'); stage.querySelector('#chk').style.display = 'none';
      stage.querySelector('#ans').scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    stage.querySelector('#ok').onclick = () => { G.score++; good().then(() => { G.n++; round(); }); };
    stage.querySelector('#no').onclick = () => { G.wrongs.push(q.t); tone('no'); play('wrong1'); G.n++; round(); };
    setTimeout(() => play(q.a), G.n === 0 && !retry ? 3200 : 250);
  }
  round();
}

const GAMES = { bubble, magic, order, candy, match, writeW: () => dictation(false), writeS: () => dictation(true) };
window.__GAMES = GAMES;
})();
