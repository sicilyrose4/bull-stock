// Bull Stock — a working build of the Figma "Final Prototype".
// Plain JS: every screen is a template + a bind() for its interactions.
// State lives in memory only, so every visit starts fresh.

const phone = document.getElementById('phone');

/* ============ State ============ */

const newAccount = () => ({ cash: START_BALANCE, hold: {}, tx: [] });
const freshState = (keep = {}) => ({
  user: '', mode: 'mock', remember: false, conf: null, income: null,
  acct: { mock: newAccount(), real: newAccount() },
  watch: [...START_WATCHLIST], recent: [], liked: {},
  lessons: {}, quizzes: {}, commTab: 'news',
  ranges: { detail: '1M', portfolio: '1M' },
  ...keep,
});
let S = freshState();
const acct = () => S.acct[S.mode];

// The core of the onboarding: confidence (1–5) + income → recommended mode.
function recommendMode(conf, income) {
  if (conf <= 2) return 'mock';
  if (income === 'low') return 'mock';
  return 'real'; // confidence 3–5 with $40k+ income
}

function setMode(mode) {
  S.mode = mode;
  phone.dataset.mode = mode;
}

/* ============ Formatting ============ */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtShares = (n) => n.toLocaleString('en-US', { maximumFractionDigits: 4 });
const sharesLabel = (n) => `${fmtShares(n)} share${n === 1 ? '' : 's'}`;
const icon = (name, cls = '', style = '') => `<span class="ico ${cls}" style="${style}">${ICONS[name]}</span>`;
// Mock currency symbol: a stack of coins, sized like the "$" in DM Sans.
const COIN_PATHS = '<ellipse cx="32" cy="24" rx="24" ry="8"/><path d="M8 24v16a24 8 0 0 0 48 0V24M8 40v16a24 8 0 0 0 48 0V40M8 56v16a24 8 0 0 0 48 0V56"/>';
const coinSVG = (style = '', weight = 6) => `<svg viewBox="0 0 64 100" fill="none" stroke="currentColor" stroke-width="${weight}" style="${style}" aria-hidden="true">${COIN_PATHS}</svg>`;
const COIN = `<span class="coin" role="img" aria-label="coins">${coinSVG()}</span>`;
const sym = () => (S.mode === 'mock' ? COIN : '$');
const cur = (n, d = 2) => sym() + fmt(n, d);
const curText = (n) => (S.mode === 'mock' ? '₵' : '$') + fmt(n);
const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(n));
const change = (t) => {
  const s = STOCKS[t];
  return { abs: s.abs ?? s.price - s.price / (1 + s.pct / 100), pct: s.pct, up: s.pct >= 0 };
};
const initial = () => (S.user.trim()[0] || 'B').toUpperCase();
const displayName = () => S.user.trim() || 'Bull Stock Investor';
const modeName = () => (S.mode === 'mock' ? 'Mock Mode' : 'Real Mode');

/* ============ Small components ============ */

const avatar = (size, extra = '') =>
  `<div class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.44)}px;${extra}">${esc(initial())}</div>`;

function logo(t, size = 64) {
  const s = STOCKS[t];
  if (!s.logo) {
    return `<div class="logo lettermark" style="width:${size}px;height:${size}px;font-size:${size * (t.length > 3 ? 0.25 : 0.3)}px">${t}</div>`;
  }
  const px = s.logoScale * size;
  const dx = (s.logoX || 0) * size, dy = (s.logoY || 0) * size;
  return `<div class="logo" style="width:${size}px;height:${size}px"><img src="${s.logo}" alt="${t}" style="width:${px}px;height:${px}px;margin-left:${-px / 2 + dx}px;margin-top:${-px / 2 + dy}px"></div>`;
}

function chg(t, withAbs = true) {
  const c = change(t);
  return `<div class="chg ${c.up ? 'up' : 'down'}"><img class="ind" src="assets/${c.up ? 'ind-up' : 'ind-down'}.svg" alt="">${
    withAbs ? `<span>${c.up ? '' : '-'}${fmt(Math.abs(c.abs))}</span><span>(${c.up ? '+' : '-'}${fmt(Math.abs(c.pct))}%)</span>`
      : `<span>${c.up ? '+' : '-'}${fmt(Math.abs(c.pct))}%</span>`}</div>`;
}

function rowCard(t, right, cls = '') {
  const s = STOCKS[t];
  return `<button class="row-card press ${cls}" data-stock="${t}">
    ${logo(t)}
    <div class="tick"><b>${t}</b><span>${esc(s.name)}</span></div>
    <div class="spark">${spark(t)}</div>
    <div class="rt">${right || `<div class="px">${cur(s.price)}</div>${chg(t)}`}</div>
  </button>`;
}

function popCard(t) {
  const s = STOCKS[t];
  return `<button class="pop-card press" data-stock="${t}">
    ${logo(t)}
    <div class="tick"><b>${t}</b><span>${esc(s.name)}</span></div>
    <div class="px"><span>${sym()}</span><span>${fmt(s.price)}</span></div>
    ${chg(t, false)}
  </button>`;
}

function nav(active) {
  const item = (key, label, x) =>
    `<button class="nav-item ${active === key ? 'on' : ''}" style="left:${x}px" data-tab="${key}">${ICONS[key]}<span>${label}</span></button>`;
  return `<div class="nav">
    ${item('home', 'Home', 16)}${item('portfolio', 'Portfolio', 102)}
    <button class="nav-search press" data-go="search" data-anim="up" aria-label="Search">${ICONS.search}</button>
    ${item('community', 'Community', 306)}${item('history', 'History', 392)}
  </div>`;
}

const header = () => `
  <button class="abs" style="left:16px;top:69px" data-go="profile" data-anim="up" aria-label="Profile">${avatar(64)}</button>
  <button class="mode-pill" style="left:91px;top:83px" data-go="modeChange" data-anim="up">${modeName()}</button>
  <button class="circle-btn press" style="left:316px;top:69px" data-act="notifs" aria-label="Notifications">${icon('bell')}</button>
  <button class="circle-btn press" style="left:360px;top:69px" data-go="profile" data-anim="up" aria-label="Settings">${icon('gear')}</button>`;

const closeBtn = (x, y, act = 'data-back') => `<button class="icon-btn" style="left:${x}px;top:${y}px" ${act} aria-label="Close">${ICONS.close}</button>`;
const backBtn = (x, y, color = 'var(--accent)') => `<button class="icon-btn" style="left:${x}px;top:${y}px;width:30px;height:30px;color:${color}" data-back aria-label="Back">${ICONS.back}</button>`;

/* ============ Charts ============ */

const RANGES = ['1W', '1M', '6M', '1YR'];
const RANGE_SHAPE = {
  '1W': { trend: 0.025, vol: 0.007, days: 7 },
  '1M': { trend: 0.06, vol: 0.012, days: 30 },
  '6M': { trend: 0.14, vol: 0.02, days: 182 },
  '1YR': { trend: 0.28, vol: 0.026, days: 365 },
};
const histCache = {};

function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A fake but stable price history that ends at today's (fixed) price.
function priceHistory(t, range) {
  const key = t + range;
  if (histCache[key]) return histCache[key];
  const { trend, vol } = RANGE_SHAPE[range];
  const r = rng(key), N = 40, dir = STOCKS[t].pct >= 0 ? 1 : -1;
  const p = new Array(N);
  p[N - 1] = STOCKS[t].price;
  for (let i = N - 1; i > 0; i--) p[i - 1] = p[i] / (1 + (dir * trend) / N + vol * (r() * 2 - 1) * 1.7);
  const smooth = p.map((v, i) => (i === 0 || i === N - 1 ? v : (p[i - 1] + v + p[i + 1]) / 3));
  return (histCache[key] = smooth);
}

function portfolioHistory(range) {
  const hold = Object.entries(acct().hold);
  if (!hold.length) return null;
  return priceHistory(hold[0][0], range).map((_, i) =>
    hold.reduce((sum, [t, h]) => sum + h.shares * priceHistory(t, range)[i], 0));
}

function curvePath(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

let gradId = 0;
const PALETTE = { up: ['#A8F1A1', '#B7E1B3', '#95D88F'], down: ['#E1B3B3', '#E1B3B4', '#E1B3B3'] };

function areaSVG(values, { w, h, x0, x1, yOf, fillTo, line = true, up = true }) {
  const id = 'g' + gradId++;
  const [c1, c2, stroke] = PALETTE[up ? 'up' : 'down'];
  const pts = values.map((v, i) => [x0 + ((x1 - x0) * i) / (values.length - 1), yOf(v)]);
  const d = curvePath(pts);
  const top = Math.min(...pts.map((p) => p[1]));
  return `<svg class="abs" style="left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">
    <defs><linearGradient id="${id}" x1="0" y1="${top}" x2="0" y2="${fillTo}" gradientUnits="userSpaceOnUse">
      <stop offset="0.45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></linearGradient></defs>
    <path d="${d} L${x1},${fillTo} L${x0},${fillTo} Z" fill="url(#${id})" fill-opacity="0.7"/>
    ${line ? `<path d="${d}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>` : ''}
  </svg>`;
}

function spark(t) {
  const v = priceHistory(t, '1M');
  const lo = Math.min(...v), hi = Math.max(...v);
  return areaSVG(v, { w: 83, h: 39, x0: 0, x1: 83, fillTo: 39, line: false, up: STOCKS[t].pct >= 0,
    yOf: (x) => 20 - ((x - lo) / (hi - lo || 1)) * 18 });
}

function niceStep(x) {
  const e = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
}

const dateLabel = (daysAgo, range) => {
  const d = new Date(Date.now() - daysAgo * 864e5);
  return d.toLocaleDateString('en-US', range === '1YR' ? { month: 'short', year: 'numeric' } : { month: 'short', day: 'numeric' });
};

// Big chart with three dashed grid lines (detail + portfolio screens).
function bigChart(values, range, { lines, fillTo, dateY, placeholder }) {
  const [yTop, yMid, yBot] = lines;
  let labels;
  let svg = '';
  if (values) {
    const lo = Math.min(...values), hi = Math.max(...values);
    let step = niceStep(Math.max((hi - lo) / 2, hi * 0.004));
    let mid = Math.round((lo + hi) / 2 / step) * step;
    for (let i = 0; i < 6 && (mid + step < hi || mid - step > lo); i++) {
      step = niceStep(step * 1.01 + step * 0.5);
      mid = Math.round((lo + hi) / 2 / step) * step;
    }
    const d = step >= 1 ? 0 : 2;
    labels = [mid + step, mid, mid - step].map((v) => cur(v, d));
    const yOf = (v) => yMid - ((v - mid) / step) * (yMid - yTop);
    svg = areaSVG(values, { w: 440, h: fillTo, x0: 14, x1: 424, yOf, fillTo, up: values[values.length - 1] >= values[0] });
  } else {
    labels = placeholder;
  }
  const grid = lines.map((y, i) => `
    <img class="abs" src="assets/dash-line.svg" style="left:16px;top:${y}px;width:408px;height:1px" alt="">
    <p class="abs" style="left:12px;top:${y - 16}px;font-size:12px;color:var(--muted);white-space:nowrap">${labels[i]}</p>`).join('');
  return `${grid}${svg}
    <p class="abs" style="left:12px;top:${dateY}px;font-size:12px;color:var(--muted)">${values ? dateLabel(RANGE_SHAPE[range].days, range) : 'Date'}</p>
    <p class="abs" style="right:16px;top:${dateY}px;font-size:12px;color:var(--muted)">${values ? 'Today' : 'Date'}</p>`;
}

const rangeSlider = (active, top) => `<div class="ranges" style="top:${top}px">
  <span class="thumb" style="left:${4 + RANGES.indexOf(active) * 112}px"></span>${RANGES.map((r, i) =>
  `<button class="${r === active ? 'on' : ''}" style="left:${4 + i * 112}px" data-range="${r}">${r}</button>`).join('')}</div>`;

// Slide the highlight to the tapped range button.
function pickRange(el, btn) {
  el.querySelectorAll('[data-range]').forEach((x) => x.classList.toggle('on', x === btn));
  btn.parentElement.querySelector('.thumb').style.left = btn.style.left;
}

/* ============ Screens ============ */

const SCREENS = {};

SCREENS.login = {
  html: () => `
    <img class="abs" src="assets/logo.svg" alt="" style="left:152px;top:200px;width:137px;height:102px">
    <p class="abs" style="left:0;right:0;top:326px;text-align:center;font-size:36px;font-weight:600;line-height:47px;color:#f4f3f1">Bull Stock</p>
    <form class="abs" id="loginForm" style="left:75px;top:539px;display:flex;flex-direction:column;gap:21px" autocomplete="off">
      <div class="field"><label for="u">Username</label><input id="u" value="${esc(S.user)}" autocapitalize="off" spellcheck="false"></div>
      <div class="field"><label for="p">Password</label><input id="p" type="password"></div>
      <button type="submit" hidden></button>
    </form>
    <button class="btn-white abs press" style="left:140px;top:730px;width:160px" data-act="login">Log in</button>
    <button class="abs" style="left:140px;top:788px;width:160px;text-align:center;font-size:16px;color:#979797;line-height:21px" data-act="login">Sign up</button>`,
  bind(el) {
    const go_ = () => {
      S.user = el.querySelector('#u').value.trim();
      if (S.remember) reset('home', {}, 'fade');
      else go('questions', {}, 'up');
    };
    el.querySelectorAll('[data-act="login"]').forEach((b) => (b.onclick = go_));
    el.querySelector('#loginForm').onsubmit = (e) => { e.preventDefault(); go_(); };
  },
};

const CONFIDENCE = ['Very unconfident', 'Not confident', 'Fairly confident', 'Confident', 'Very confident'];

SCREENS.questions = {
  html: () => {
    const ready = S.conf && S.income;
    const incomes = [['low', '<$40k'], ['mid', '$40k - $100k'], ['high', '$100k+']];
    return `
    <button class="icon-btn" style="left:12px;top:85px;color:#fff" data-back aria-label="Close">${ICONS.close}</button>
    <img class="abs" src="assets/logo-small.svg" alt="" style="left:178px;top:143px;width:83px;height:61.8px">
    <div class="abs" style="left:10px;top:262px;width:416px;display:flex;flex-direction:column;align-items:center;gap:40px">
      <p style="width:350px;text-align:center;font-size:20px;font-weight:600;line-height:26px;color:#f4f3f1">How confident are you with investing in the stock market?</p>
      <div style="height:87px;display:flex;flex-direction:column;align-items:center;gap:14px">
        <div style="display:flex;gap:20px">${[1, 2, 3, 4, 5].map((n) =>
          `<button class="num press ${S.conf && n <= S.conf ? 'on' : ''}" data-conf="${n}" aria-pressed="${S.conf === n}" aria-label="${n}, ${CONFIDENCE[n - 1]}">${n}</button>`).join('')}</div>
        <p style="font-size:16px;line-height:21px;color:${S.conf ? '#f4f3f1' : '#979797'}">${S.conf ? CONFIDENCE[S.conf - 1] : 'Tap a number'}</p>
      </div>
    </div>
    <div class="abs" style="left:26px;top:484px;width:387px;display:flex;flex-direction:column;align-items:center;gap:55px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:40px;width:100%">
        <p style="text-align:center;font-size:20px;font-weight:600;line-height:26px;color:#f4f3f1">What is your yearly income range?</p>
        <div style="display:flex;flex-direction:column;gap:21px">${incomes.map(([k, l]) =>
          `<button class="opt press ${S.income === k ? 'on' : ''}" data-income="${k}" aria-pressed="${S.income === k}">${esc(l)}</button>`).join('')}</div>
      </div>
      <button class="btn-white solid press" style="width:275px" data-act="continue" ${ready ? '' : 'disabled'}>Continue</button>
    </div>`;
  },
  bind(el) {
    el.querySelectorAll('[data-conf]').forEach((b) => (b.onclick = () => { S.conf = +b.dataset.conf; refresh(); }));
    el.querySelectorAll('[data-income]').forEach((b) => (b.onclick = () => { S.income = b.dataset.income; refresh(); }));
    el.querySelector('[data-act="continue"]').onclick = () => {
      S.rec = recommendMode(S.conf, S.income);
      setMode(S.rec);
      go('recommend', {}, 'push');
    };
  },
};

function chooseMode() {
  const mock = S.mode === 'mock';
  return `<div class="choose">
    <button class="side ${mock ? 'on' : ''}" style="left:0;width:140px" data-pick="mock" aria-label="Mock Mode">
      ${coinSVG('position:absolute;left:30px;top:24px;width:76px;height:118px', 8)}
      <span class="label" style="left:0">Mock Mode</span>
      <span class="radio" style="left:52px">${mock ? ICONS.radioOn : ICONS.radioOff}</span>
    </button>
    <button class="side ${mock ? '' : 'on'}" style="left:186px;width:120px" data-pick="real" aria-label="Real Mode">
      <span class="glyph-d">$</span>
      <span class="label" style="left:0;top:158px">Real Mode</span>
      <span class="radio" style="left:45px">${mock ? ICONS.radioOff : ICONS.radioOn}</span>
    </button>
    <p class="desc">${mock ? 'Mock Mode uses <b>fake currency</b> to invest.' : 'Real mode uses your <b>real money</b> to invest.'}</p>
  </div>`;
}

SCREENS.recommend = {
  html: () => `
    ${backBtn(20, 87, '#fff')}
    <img class="abs" src="assets/logo-small.svg" alt="" style="left:178px;top:143px;width:83px;height:61.8px">
    <p class="abs" style="left:45px;top:235px;width:350px;text-align:center;font-size:16px;font-weight:600;line-height:21px;color:#f4f3f1">We recommend you to use ${S.rec === 'mock' ? 'Mock' : 'Real'} Mode.</p>
    ${chooseMode()}
    <button class="check abs ${S.remember ? 'on' : ''}" style="left:144px;top:754px" data-act="remember"><span class="box"></span>Remember Mode</button>
    <button class="btn-white abs press" style="left:144px;top:806px;width:162px" data-act="enter">Enter</button>`,
  bind(el) {
    el.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = () => { setMode(b.dataset.pick); refresh(); }));
    el.querySelector('[data-act="remember"]').onclick = () => { S.remember = !S.remember; refresh(); };
    el.querySelector('[data-act="enter"]').onclick = () => reset('home', {}, 'fade');
  },
};

function holdingsRow() {
  const hold = Object.entries(acct().hold);
  const add = (w) => `<button class="press" data-go="search" data-anim="up" aria-label="Find stocks"
    style="position:relative;width:${w}px;height:167px;border-radius:12px;background:var(--accent-dark)">
    <span style="position:absolute;left:${w / 2 - 33}px;top:51px;width:64px;height:64px;border-radius:9000px;background:var(--accent);color:#171717;display:flex;align-items:center;justify-content:center">${ICONS.plus}</span></button>`;
  if (!hold.length) return add(264);
  return hold.map(([t, h]) => `
    <button class="press" data-stock="${t}" style="position:relative;width:264px;height:167px;border-radius:12px;background:var(--card)">
      <div class="abs" style="left:14px;top:14px">${logo(t)}</div>
      <div class="tick abs" style="left:90px;top:24px;width:160px"><b>${t}</b><span>${esc(STOCKS[t].name)}</span><span style="opacity:.6">${sharesLabel(h.shares)}</span></div>
      <div class="abs" style="left:22px;top:90px"><div class="px" style="font-size:32px;font-weight:900;line-height:42px;color:#f4f3f1;white-space:nowrap">${cur(h.shares * STOCKS[t].price)}</div>${chg(t)}</div>
    </button>`).join('') + add(120);
}

const tutorialCards = () => `
  <button class="tcard press" style="width:227px;padding:10px 23px" data-go="lessons">
    <span style="width:139px;margin-right:-10px">Investing Basics</span>${icon('tutCoins', 'accent')}</button>
  <button class="tcard press" style="width:217px;padding:9px 11px 9px 17px" data-go="lessons" data-p="portfolio">
    <span style="width:139px;margin-right:-10px">Building a Portfolio</span>${icon('tutPortfolio', 'accent')}</button>
  <button class="tcard press" style="width:237px;padding:10px 15px" data-go="lessons" data-p="trends">
    <span style="width:139px">Understanding Trends</span>${icon('tutTrends', 'accent', 'margin-left:auto')}</button>
  <button class="tcard press" style="width:150px;padding:10px 20px;background:#ededed;border-color:#d4d2cd;color:#1e1e1e" data-act="allTutorials">See all tutorials</button>`;

SCREENS.home = {
  html: () => `
    <div class="scroll"><div class="home-body" style="position:relative;padding-bottom:24px">
      <div style="position:relative;height:133px">${header()}</div>
      <p class="welcome" style="margin:57px 16px 0;height:26px;font-size:20px;font-weight:300;line-height:26px;color:#959595;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Welcome back${S.user.trim() ? ', ' + esc(S.user.trim()) : ''}.</p>
      ${S.mode === 'mock' ? `
      <p class="h20" style="margin:38px 16px 0 17px">Tutorials</p>
      <div class="hscroll" style="margin-top:20px;gap:30px;padding:0 16px;scroll-padding:0 16px">${tutorialCards()}</div>` : ''}
      <!-- Real Mode has no tutorials (Figma 595:1473), so its sections sit higher -->
      <p class="h20" style="margin:38px 16px 0">Portfolio Overview</p>
      <div class="hscroll" style="margin-top:${S.mode === 'mock' ? 20 : 8}px;gap:12px;padding:0 16px;scroll-padding:0 16px">${holdingsRow()}</div>
      <p class="h20" style="margin:${S.mode === 'mock' ? 40 : 24}px 16px 0">Trends/Watchlist</p>
      <div class="stack" style="margin-top:${S.mode === 'mock' ? 18 : 8}px;padding:0 16px">${S.watch.length ? S.watch.map((t) => rowCard(t, '', 'no-stroke')).join('')
        : '<p class="empty" style="padding:16px 0">Your watchlist is empty. Open any stock and tap “+ Watch”.</p>'}</div>
    </div></div>
    ${nav('home')}`,
  // When Home is opened (not just switched to from the nav), its sections rise in one by one.
  bind(el, params) {
    el.querySelector('[data-act="allTutorials"]')?.addEventListener('click', () => {
      S.commTab = 'tutorials';
      reset('community', {}, 'push');
    });
    if (params.anim !== 'fade') return;
    params.anim = 'played'; // don't replay when coming back from another screen
    const body = el.querySelector('.home-body');
    [...body.children].forEach((c, i) => c.style.setProperty('--i', i));
    body.classList.add('intro');
    // Once everything has risen in, type out the welcome line (once).
    const welcome = body.querySelector('.welcome');
    const text = welcome.textContent;
    welcome.innerHTML = '<span></span><span class="caret"></span>';
    const typed = welcome.firstChild;
    let i = 0;
    setTimeout(function type() {
      if (!welcome.isConnected) return;
      typed.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(type, 55);
      else setTimeout(() => welcome.querySelector('.caret')?.remove(), 900);
    }, 1200);
  },
};

SCREENS.portfolio = {
  html: () => {
    const a = acct();
    const hold = Object.entries(a.hold);
    const value = hold.reduce((s, [t, h]) => s + h.shares * STOCKS[t].price, 0);
    const r = S.ranges.portfolio;
    const height = Math.max(822, 531 + hold.length * 104 + 24);
    const assets = hold.length
      ? `<div class="stack abs" style="left:16px;top:531px">${hold.map(([t, h]) => rowCard(t,
          `<div class="px">${cur(h.shares * STOCKS[t].price)}</div><div class="chg" style="color:rgba(255,255,255,.6)">${sharesLabel(h.shares)}</div>`)).join('')}</div>`
      : `<button class="abs" style="left:82px;top:592px;width:266px;display:flex;flex-direction:column;align-items:center;gap:25px" data-go="search" data-anim="up">
          <p class="empty" style="text-align:center;height:35px">You don’t have any assets yet. Click here to search for stocks</p>
          <span style="width:64px;height:64px;border-radius:9000px;border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;color:var(--accent)">${ICONS.plus}</span>
        </button>`;
    return `<div class="scroll"><div style="position:relative;height:${height}px">
      <div class="abs" style="left:0;top:53px;width:440px;height:412px">
        <p class="abs" style="left:12px;top:16px;font-size:12px">Portfolio Balance</p>
        <p class="abs" style="left:12px;top:32px;font-size:32px;font-weight:900;line-height:42px;white-space:nowrap">${cur(value)}</p>
        <p class="abs" style="left:186px;top:16px;font-size:12px">Available Balance</p>
        <p class="abs" style="left:186px;top:32px;font-size:32px;font-weight:900;line-height:42px;white-space:nowrap">${cur(a.cash)}</p>
        <div class="abs" id="pchart" style="left:0;top:0;width:440px;height:360px">${portfolioChart()}</div>
        ${rangeSlider(r, 364)}
      </div>
      <p class="h20 abs" style="left:16px;top:489px">Your Assets</p>
      ${assets}
    </div></div>
    ${nav('portfolio')}`;
  },
  bind(el) {
    el.querySelectorAll('[data-range]').forEach((b) => (b.onclick = () => {
      S.ranges.portfolio = b.dataset.range;
      pickRange(el, b);
      el.querySelector('#pchart').innerHTML = portfolioChart();
    }));
  },
};

function portfolioChart() {
  const v = portfolioHistory(S.ranges.portfolio);
  const html = bigChart(v, S.ranges.portfolio, { lines: [122, 202, 282], fillTo: 340, dateY: 322,
    placeholder: [cur(2000, 0), cur(1600, 0), cur(1200, 0)] });
  return v ? html : html + `<p class="abs" style="left:87px;top:153px;width:266px;text-align:center;font-size:14px;font-weight:600;color:#766d6d">No data yet</p>`;
}

const searchBar = (left, width, attrs) => `<div class="abs" style="left:${left}px;top:83px;width:${width}px;height:36px;border-radius:900px;background:#d9d9d9;overflow:hidden" ${attrs}>`;

SCREENS.community = {
  html: () => {
    const news = S.commTab === 'news';
    const content = news ? `
      <p class="h20 abs" style="left:22px;top:227px">News Articles</p>
      <div class="hscroll abs" style="left:0;top:271px;width:440px;gap:12px;padding:0 18px;scroll-padding:0 18px">${NEWS.map((n) => `
        <button class="photo-card press" data-go="article" data-p="${n.id}" data-anim="up">
          <img src="${n.img}" alt=""><div class="bar"><span class="src"><img src="${n.src}" alt=""></span><p>${esc(n.title)}</p></div></button>`).join('')}</div>
      <p class="h20 abs" style="left:22px;top:514px">Feed</p>
      <div class="stack abs" style="left:22px;top:558px;gap:12px">${POSTS.map((p, i) => post(p, i)).join('')}</div>`
      : `
      <p class="h20 abs" style="left:20px;top:226px">How to Invest</p>
      <div class="hscroll abs" style="left:0;top:270px;width:440px;gap:12px;padding:0 16px;scroll-padding:0 16px">
        <button class="photo-card press" data-go="lessons" style="border:1px solid #000"><img src="assets/tut-invest-basics.png" alt="">
          <div class="bar"><p class="big">Investing Basics</p></div></button>
        <button class="photo-card press" data-go="lessons" data-p="portfolio"><img src="assets/tut-card-2.png" alt=""><div class="bar"><span class="src" style="background:#d9d9d9"><img src="assets/tut-src.png" alt=""></span><p>Building your first portfolio, one share at a time</p></div></button>
        <button class="photo-card press" data-go="lessons" data-p="trends"><img src="assets/video-poster.jpg" alt=""><div class="bar"><p class="big">Understanding Trends</p></div></button>
      </div>
      <div class="abs" style="left:30px;top:510px">${progressBar()}</div>
      <p class="h20 abs" style="left:20px;top:615px">Important Terms</p>
      <div class="hscroll abs" style="left:0;top:659px;width:440px;gap:12px;padding:0 16px;scroll-padding:0 16px">
        ${TERMS.map((n) => `<button class="photo-card press" data-go="article" data-p="${n.id}" data-anim="up"><img src="${n.img}" alt=""><div class="bar"><span class="src" style="background:#d9d9d9"><img src="${n.src}" alt=""></span><p>${esc(n.title)}</p></div></button>`).join('')}
      </div>`;
    const height = news ? 558 + POSTS.length * 201 + 12 : 822;
    return `<div class="scroll"><div style="position:relative;height:${height}px">
      <button class="abs" style="left:16px;top:69px" data-go="profile" data-anim="up" aria-label="Profile">${avatar(64)}</button>
      ${searchBar(107, 267, 'data-go="search" data-anim="up" role="button"')}<p class="poppins" style="position:absolute;left:20px;top:6px;font-size:16px;color:#000">Search</p></div>
      <div class="filter">
        <button style="left:24px;width:64px" class="${news ? 'on' : ''}" data-ctab="news">News</button>
        <button style="left:136px;width:100px" class="${news ? '' : 'on'}" data-ctab="tutorials">Tutorials</button>
        <span class="ul" style="left:${news ? 0 : 130}px"></span>
      </div>
      ${content}
    </div></div>
    ${nav('community')}`;
  },
  bind(el) {
    el.querySelectorAll('[data-ctab]').forEach((b) => (b.onclick = () => { S.commTab = b.dataset.ctab; refresh(); }));
    el.querySelectorAll('[data-like]').forEach((b) => (b.onclick = () => {
      const i = b.dataset.like;
      S.liked[i] = !S.liked[i];
      b.classList.toggle('liked', S.liked[i]);
      b.querySelector('span').textContent = compact(POSTS[i].likes + (S.liked[i] ? 1 : 0));
    }));
  },
};

function post(p, i) {
  return `<div class="post">
    <div class="pav"><img src="${p.avatar}" alt=""></div>
    <div class="nm">${esc(p.name)}${icon('verified')}</div>
    <p class="hd">${esc(p.handle)}</p>
    <p class="tx">${esc(p.text)}</p>
    <button class="act ${S.liked[i] ? 'liked' : ''}" style="left:27px" data-like="${i}" aria-label="Like">${ICONS.heart}<span>${compact(p.likes + (S.liked[i] ? 1 : 0))}</span></button>
    <div class="act" style="left:106px">${ICONS.message}<span>${compact(p.comments)}</span></div>
  </div>`;
}

// Progress for one course (2 lessons + its quiz), or across every course when none is given.
function lessonProgress(course) {
  const ids = course ? [course] : Object.keys(COURSES);
  let done = 0, total = 0;
  for (const c of ids) {
    COURSES[c].lessons.forEach((l) => { total++; if (S.lessons[`${c}:${l.id}`]) done++; });
    total++; if (S.quizzes[c]) done++;
  }
  return done / total;
}
function progressBar(course) {
  const p = lessonProgress(course);
  return `<div class="progress"><div class="track"></div><div class="fill" style="width:${Math.max(8, p * 375)}px"></div><p>${Math.round(p * 100)}% Completed</p></div>`;
}

SCREENS.history = {
  html: () => {
    const tx = acct().tx;
    const list = tx.length
      ? `<div class="stack" style="margin-top:8px;padding:0 16px">${tx.map((x) => `
          <button class="tx-row press" data-stock="${x.t}">${logo(x.t, 48)}
            <p class="a">${x.side === 'buy' ? 'Bought' : 'Sold'} ${x.t}</p>
            <p class="b">${sharesLabel(x.shares)} at ${cur(x.price)} · ${x.when}</p>
            <p class="c ${x.side === 'sell' ? 'in' : ''}">${x.side === 'buy' ? '-' : '+'}${cur(x.total)}</p></button>`).join('')}</div>`
      : `<button style="margin:60px auto 0;width:266px;display:flex;flex-direction:column;align-items:center;gap:25px" data-go="search" data-anim="up">
          <p class="empty" style="text-align:center">No transactions yet. Buy your first stock to see it here.</p>
          <span style="width:64px;height:64px;border-radius:9000px;border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;color:var(--accent)">${ICONS.plus}</span></button>`;
    return `<div class="scroll"><div style="position:relative;padding-bottom:24px">
      <div style="position:relative;height:133px">${header()}</div>
      <p class="h20" style="margin:63px 16px 0">Transaction History</p>
      ${list}
    </div></div>
    ${nav('history')}`;
  },
};

SCREENS.search = {
  html: () => `
    ${closeBtn(12, 85)}
    ${searchBar(49, 342, '')}<input id="q" class="poppins" placeholder="Search" autocomplete="off" spellcheck="false"
      style="position:absolute;inset:0;border:0;outline:none;background:none;padding:0 20px;font-size:16px;color:#000"></div>
    <div class="scroll" style="top:130px"><div id="results" style="position:relative">${searchResults('')}</div></div>`,
  bind(el) {
    const q = el.querySelector('#q');
    q.oninput = () => { el.querySelector('#results').innerHTML = searchResults(q.value); };
  },
};

function searchResults(query) {
  const q = query.trim().toLowerCase();
  if (q) {
    const hits = Object.keys(STOCKS).filter((t) => t.toLowerCase().includes(q) || STOCKS[t].name.toLowerCase().includes(q) || STOCKS[t].short.toLowerCase().includes(q));
    return `<p class="h20" style="margin:39px 20px 0">Results</p>
      ${hits.length ? `<div class="stack" style="margin:16px 16px 140px">${hits.map((t) => rowCard(t)).join('')}</div>`
        : `<p class="empty" style="margin:26px 19px">No stocks match “${esc(query.trim())}”.</p>`}`;
  }
  return `<div style="position:relative;height:${215 + SEARCH_ROWS.length * 283 + 80}px">
    <p class="h20 abs" style="left:20px;top:39px">Recently Viewed</p>
    ${S.recent.length
      ? `<div class="hscroll abs" style="left:0;top:85px;width:440px;gap:10px;padding:0 20px;scroll-padding:0 20px">${S.recent.map((t) => `<button class="chip press" data-stock="${t}">${logo(t, 32)}${t}</button>`).join('')}</div>`
      : '<p class="empty abs" style="left:19px;top:91px">No search data yet.</p>'}
    ${SEARCH_ROWS.map(([title, list], i) => `
    <p class="h20 abs" style="left:20px;top:${215 + i * 283}px">${title}</p>
    <div class="hscroll abs" style="left:0;top:${261 + i * 283}px;width:440px;gap:12px;padding:0 16px;scroll-padding:0 16px">${list.map(popCard).join('')}</div>`).join('')}
  </div>`;
}

SCREENS.detail = {
  html: ({ t }) => {
    const s = STOCKS[t];
    const owned = acct().hold[t];
    const watching = S.watch.includes(t);
    const card = (x, y, label, def, value) => `<div class="dcard" style="left:${x}px;top:${y}px">
      <p class="t">${label}</p><p class="v">${value}</p>
      <button class="q" data-def="${def}" aria-label="What is ${label}?">${ICONS.question}</button></div>`;
    return `
      <button class="icon-btn" style="left:24px;top:86px" data-back aria-label="Close">${ICONS.close}</button>
      <p class="abs poppins" style="left:70px;right:70px;top:84px;text-align:center;font-size:24px;line-height:36px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.short)}</p>
      <button class="mode-pill" style="right:16px;left:auto;top:87px;padding:6px 10px" data-act="watch">${watching ? 'Watching' : '+ Watch'}</button>
      <div class="abs" style="left:0;top:144px;width:440px;height:390px">
        <div class="abs" style="left:16px;top:16px">${logo(t, 48)}</div>
        <p class="abs" style="left:74px;top:14px;font-size:20px;line-height:26px">${t}</p>
        <div class="abs" style="left:74px;top:42px">${chg(t)}</div>
        <p class="abs" style="right:16px;top:16px;font-size:32px;font-weight:900;line-height:42px;white-space:nowrap">${cur(s.price)}</p>
        <div class="abs" id="dchart" style="left:0;top:0;width:440px;height:330px">${detailChart(t)}</div>
        ${rangeSlider(S.ranges.detail, 332)}
      </div>
      <p class="abs" style="left:16px;top:558px;font-size:20px;line-height:26px">Details</p>
      ${card(16, 608, 'Market capitalization', 'cap', sym() + s.cap)}
      ${card(226, 608, 'Total Cash', 'cash', sym() + s.cash)}
      ${card(16, 708, 'Dividend', 'dividend', s.dividend ? cur(s.dividend) : '—')}
      ${card(226, 708, 'Dividend Yield', 'yield', fmt(s.yield) + '%')}
      <div class="abs" style="left:16px;top:827px;width:408px;display:flex;gap:4px">
        <button class="btn-pill press" style="width:240px;height:64px;font-weight:600" data-go="buy" data-p="${t}">Buy</button>
        <button class="press ${owned ? '' : 'disabled'}" style="flex:1;height:64px;border-radius:9000px;background:#cfcfcf;color:#000;font-size:24px;text-align:center"
          data-go="buy" data-p="${t}" data-side="sell" ${owned ? '' : 'aria-disabled="true"'}>Trade</button>
      </div>`;
  },
  bind(el, { t }) {
    S.recent = [t, ...S.recent.filter((x) => x !== t)].slice(0, 6);
    el.querySelectorAll('[data-range]').forEach((b) => (b.onclick = () => {
      S.ranges.detail = b.dataset.range;
      pickRange(el, b);
      el.querySelector('#dchart').innerHTML = detailChart(t);
    }));
    el.querySelector('[data-act="watch"]').onclick = (e) => {
      const on = !S.watch.includes(t);
      S.watch = on ? [...S.watch, t] : S.watch.filter((x) => x !== t);
      e.currentTarget.textContent = on ? 'Watching' : '+ Watch';
      toast(on ? `${t} added to your watchlist` : `${t} removed from your watchlist`);
    };
  },
};

const detailChart = (t) => bigChart(priceHistory(t, S.ranges.detail), S.ranges.detail, { lines: [100, 180, 260], fillTo: 316, dateY: 300 });

SCREENS.buy = {
  html: ({ t, side = 'buy' }) => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '#'];
    return `
      <button class="icon-btn" style="left:12px;top:59px" data-back aria-label="Close">${ICONS.close}</button>
      <p class="abs poppins" style="left:0;right:0;top:56px;text-align:center;font-size:24px;line-height:36px">${side === 'buy' ? 'Buy' : 'Sell'} ${t}</p>
      <div class="abs" id="info" style="left:16px;top:142px;width:408px"></div>
      <div class="bfield" id="sharesField" role="textbox" aria-label="Number of shares" style="top:210px"><div class="l">Shares <button data-def="shares" aria-label="What is a share?">${ICONS.question}</button></div><div class="r" id="shares">0</div></div>
      <div class="bfield" style="top:308px"><div class="l">MKT Price <button data-def="price" aria-label="What is market price?">${ICONS.question}</button></div><div class="r">${cur(STOCKS[t].price)}</div></div>
      <button class="btn-pill abs press" id="go" style="left:12px;top:406px;width:416px;height:64px" disabled>${side === 'buy' ? 'Buy' : 'Sell'}</button>
      ${keys.map((k, i) => `<button class="key" style="left:${14.5 + (i % 3) * 159}px;top:${494 + Math.floor(i / 3) * 101}px" data-key="${k}" aria-label="${k === '#' ? 'Delete' : k}">${k === '#' ? `<span class="key-back">${ICONS.back}</span>` : k}</button>`).join('')}`;
  },
  bind(el, { t, side = 'buy' }) {
    let s = '', focused = false;
    const price = STOCKS[t].price;
    const a = acct();
    const update = () => {
      const shares = parseFloat(s) || 0;
      const total = Math.round(shares * price * 100) / 100;
      const owned = a.hold[t]?.shares || 0;
      const err = side === 'buy' ? total > a.cash && `Not enough funds. You have ${cur(a.cash)} available.`
        : shares > owned + 1e-9 && `You only own ${sharesLabel(owned)} of ${t}.`;
      el.querySelector('#shares').innerHTML = esc(s || '0') + (focused ? '<span class="type-caret"></span>' : '');
      el.querySelector('#sharesField').classList.toggle('focused', focused);
      el.querySelector('#shares').classList.toggle('has', !!s);
      el.querySelector('#info').innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:18px;line-height:23px">
          <span><span style="color:#979797">Total</span> ${cur(total)}</span>
          <span style="color:#979797">${side === 'buy' ? `Available ${cur(a.cash)}` : `You own ${fmtShares(owned)}`}</span></div>
        <p style="margin-top:8px;font-size:14px;line-height:18px;color:#ec9092;min-height:18px">${err || ''}</p>`;
      el.querySelector('#go').disabled = !shares || !!err;
      return { shares, total };
    };
    const press = (k) => {
      if (k === '#') s = s.slice(0, -1);
      else if (k === '.') { if (!s.includes('.')) s = (s || '0') + '.'; }
      else {
        const [int, dec] = s.split('.');
        if (dec !== undefined ? dec.length < 4 : (int || '').length < 5) s = s === '0' ? k : s + k;
      }
      focused = true;
      update();
    };
    el.querySelectorAll('[data-key]').forEach((b) => (b.onclick = () => press(b.dataset.key)));
    // Tapping the Shares field shows a blinking cursor; tapping anywhere else (except the keypad) hides it.
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-key], #go')) return;
      focused = !!e.target.closest('#sharesField') && !e.target.closest('[data-def]');
      update();
    });
    // A physical keyboard works straight away: digits, a decimal point, Backspace/Delete, and Enter to buy.
    const onKey = (e) => {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (document.querySelector('.overlay')) return;
      const digit = /^[0-9]$/.test(e.key) ? e.key : (/^(Digit|Numpad)([0-9])$/.exec(e.code) || [])[2];
      if (digit) press(digit);
      else if (e.key === '.' || e.key === ',' || e.code === 'Period' || e.code === 'NumpadDecimal') press('.');
      else if (e.key === 'Backspace' || e.key === 'Delete') press('#');
      else if (e.key === 'Enter') el.querySelector('#go').click();
      else return;
      e.preventDefault();
    };
    document.addEventListener('keydown', onKey);
    el.querySelector('#go').onclick = () => {
      const { shares, total } = update();
      const run = () => trade(t, side, shares, total);
      if (S.mode === 'real') confirmReal(side, t, shares, total, run);
      else run();
    };
    update();
  },
};

function trade(t, side, shares, total) {
  const a = acct();
  const first = side === 'buy' && !a.tx.some((x) => x.side === 'buy');
  const h = a.hold[t] || (a.hold[t] = { shares: 0 });
  if (side === 'buy') { a.cash -= total; h.shares += shares; }
  else { a.cash += total; h.shares -= shares; if (h.shares < 1e-6) delete a.hold[t]; }
  a.cash = Math.round(a.cash * 100) / 100;
  const when = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  a.tx.unshift({ t, side, shares, total, price: STOCKS[t].price, when });
  go('success', { t, side, total, celebrate: side === 'buy' && first && S.mode === 'mock' }, 'fade');
}

// "You did it!" only for the first Mock Mode purchase; every other buy or sell
// shows the same screen with a plain heading (Figma 4062:1988).
SCREENS.success = {
  html: ({ t, side, total, celebrate }) => `
    <div class="abs" style="left:65px;top:307px;width:310px;display:flex;flex-direction:column;align-items:center;gap:31px">
      <img src="assets/logo.svg" alt="" style="width:137px;height:102px">
      ${celebrate ? `<p style="font-size:36px;font-weight:600;line-height:41px;color:var(--accent)">You did it!</p>
      <p style="font-size:17px;line-height:22px;color:var(--alt);text-align:center">Congrats, you got your first stock.</p>`
        : `<p style="width:334px;font-size:28px;font-weight:600;line-height:41px;color:#e1e1e1;text-align:center">${side === 'sell' ? 'Sale complete' : 'Purchase complete'}</p>`}
    </div>
    <div class="abs" style="left:0;right:0;top:${celebrate ? 633 : 550}px;display:flex;flex-direction:column;align-items:center;gap:11px">
      <div style="display:flex;align-items:center;gap:12px">${logo(t)}<div class="tick" style="width:auto"><b>${t}</b><span>${esc(STOCKS[t].name)}</span></div></div>
      <p style="font-size:32px;font-weight:900;line-height:42px;color:#f4f3f1">${cur(total)}</p>
    </div>`,
  bind(el) {
    const done = () => { if (el.isConnected) reset('home', {}, 'fade'); };
    setTimeout(done, 2600);
    el.onclick = done;
  },
};

SCREENS.profile = {
  html: () => {
    const rows = [['Linked Accounts'], ['History', 'history'], ['Preferences'], ['Security'], ['Support'], ['Settings'], ['Mode Change', 'mode']];
    return `
      ${closeBtn(12, 85)}
      <div class="abs" style="left:109px;top:83px">${avatar(223)}</div>
      <p class="abs" style="left:20px;right:20px;top:322px;text-align:center;font-size:24px;font-weight:600;line-height:31px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(displayName())}</p>
      <p class="abs poppins" style="left:0;right:0;top:370px;text-align:center;font-size:16px">Edit Profile</p>
      <div class="menu">${rows.map(([label, act]) => `<button ${act ? `data-act="${act}"` : ''}>${label}<span class="chev">${ICONS.chevron}</span></button>`).join('')}</div>
      <button class="btn-pill abs press" style="left:42px;top:870px;width:356px;height:45px" data-act="logout">Log out</button>`;
  },
  bind(el) {
    el.querySelector('[data-act="history"]').onclick = () => reset('history', {}, 'fade');
    el.querySelector('[data-act="mode"]').onclick = () => go('modeChange', {}, 'push');
    el.querySelector('[data-act="logout"]').onclick = () => {
      const o = overlay(`<div class="copy"><h2>Log out?</h2>
        <p class="body">You’ll go back to the login screen, and your portfolio and lesson progress will be cleared.</p></div>
        <div class="two"><button class="press" style="border:1.5px solid var(--accent);color:#fff" data-close>Cancel</button>
        <button class="press" style="background:var(--accent);color:#171717" data-act="ok">Log out</button></div>`);
      o.el.querySelector('[data-act="ok"]').onclick = () => {
        o.close();
        S = freshState(S.remember ? { remember: true, mode: S.mode } : {});
        setMode(S.mode);
        reset('login', {}, 'fade');
      };
    };
  },
};

SCREENS.modeChange = {
  html: () => `
    <button class="icon-btn" style="left:12px;top:85px;color:#fff" data-act="cancel" aria-label="Close">${ICONS.close}</button>
    <img class="abs" src="assets/logo.svg" alt="" style="left:152px;top:200px;width:137px;height:102px">
    <div class="abs" style="left:50px;top:383px;display:flex;flex-direction:column;gap:26px">
      <button class="mode-btn press ${S.mode === 'mock' ? 'on' : ''}" data-pick="mock">Mock Mode
        <span class="qm" data-def="mock" role="button" aria-label="What is Mock Mode?">${ICONS.questionLg}</span></button>
      <button class="mode-btn press ${S.mode === 'real' ? 'on' : ''}" data-pick="real">Real Mode</button>
    </div>
    <button class="check abs ${S.remember ? 'on' : ''}" style="left:139px;top:571px" data-act="remember"><span class="box"></span>Remember Mode</button>
    <button class="btn-white abs press" style="left:140px;top:630px;width:160px" data-act="enter">Enter</button>`,
  bind(el, params) {
    params.original ??= S.mode;
    el.querySelectorAll('[data-pick]').forEach((b) => (b.onclick = (e) => {
      if (e.target.closest('[data-def]')) return;
      setMode(b.dataset.pick);
      refresh();
    }));
    el.querySelector('[data-act="remember"]').onclick = () => { S.remember = !S.remember; refresh(); };
    el.querySelector('[data-act="cancel"]').onclick = () => { setMode(params.original); back(); };
    el.querySelector('[data-act="enter"]').onclick = () => reset('home', {}, 'fade');
  },
};

SCREENS.lessons = {
  html: ({ course }) => {
    const c = COURSES[course];
    const lesson = (l, y) => {
      const done = S.lessons[`${course}:${l.id}`];
      return `
      <div class="photo-card abs" style="left:28px;top:${y}px;width:385px;border:1px solid #000">
        <img src="${c.img}" alt=""><div class="bar"><p class="big"><span>${l.title}</span> <span style="font-weight:400">(${l.mins} min)</span>${done ? ' <span class="accent">✓</span>' : ''}</p></div></div>
      <button class="btn-pill abs press" style="left:58px;top:${y + 233}px;width:324px;height:45px" data-go="video" data-p="${course}:${l.id}">${done ? 'Watch again' : 'Start'}</button>`;
    };
    return `
      <button class="icon-btn" style="left:24px;top:86px" data-back aria-label="Close">${ICONS.close}</button>
      <p class="h20 abs" style="left:30px;top:151px">${c.title}</p>
      <div class="abs" style="left:30px;top:202px">${progressBar(course)}</div>
      ${lesson(c.lessons[0], 270)}${lesson(c.lessons[1], 617)}`;
  },
};

let playTimer = null;
const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

const findLesson = (key) => {
  const [course, id] = key.split(':');
  return { course, c: COURSES[course], l: COURSES[course].lessons.find((x) => x.id === id) };
};

SCREENS.video = {
  html: ({ id }) => {
    const { course, c, l } = findLesson(id);
    return `
      ${backBtn(20, 87)}
      <p class="h20 abs" style="left:20px;top:151px">${l.heading}</p>
      <div class="abs" style="left:20px;top:203px;width:400px;height:569px">
        <button class="abs" id="vid" style="left:0;top:0;width:400px;height:479px;border-radius:26px;overflow:hidden" aria-label="Play video">
          <img src="${c.poster}" alt="" style="width:100%;height:100%;object-fit:cover">
          <span class="abs" style="inset:0;background:rgba(0,0,0,.38)"></span>
          <span class="abs" id="playIcon" style="left:159px;top:186px;width:83px;height:83px;display:flex;align-items:center;justify-content:center;color:#fff;transition:opacity .2s">${ICONS.play}</span>
        </button>
        <div class="abs" style="left:11px;top:513px;width:379px;height:43px">
          <div class="abs" style="left:2px;top:5px;width:377px;height:2px;border-radius:2px;background:var(--accent);opacity:.35"></div>
          <div class="abs" id="played" style="left:2px;top:5px;width:0;height:2px;border-radius:2px;background:var(--accent)"></div>
          <div class="abs" id="knob" style="left:0;top:0;width:12px;height:12px;border-radius:50%;background:var(--accent)"></div>
          <p class="abs accent" id="time" style="right:0;top:13px;font-size:16px">${clock(l.length)}</p>
        </div>
      </div>
      <p class="abs" style="left:20px;top:766px;width:400px;font-size:14px;line-height:19px;color:#b4b2a9">${esc(l.summary)}</p>
      <button class="btn-pill abs press" style="left:85px;top:827px;width:270px;height:45px" data-go="quiz" data-p="${course}">Take the Quiz</button>`;
  },
  bind(el, { id }) {
    const { l } = findLesson(id);
    const DEMO_SECONDS = 8; // the fake video plays back fast so viewers can see it finish
    let t = 0;
    const draw = () => {
      const p = t / DEMO_SECONDS;
      el.querySelector('#knob').style.left = p * 367 + 'px';
      el.querySelector('#played').style.width = p * 377 + 'px';
      el.querySelector('#time').textContent = t ? `${clock(p * l.length)} / ${clock(l.length)}` : clock(l.length);
    };
    el.querySelector('#vid').onclick = () => {
      const icon = el.querySelector('#playIcon');
      if (playTimer) { clearInterval(playTimer); playTimer = null; icon.style.opacity = 1; return; }
      if (t >= DEMO_SECONDS) t = 0;
      icon.style.opacity = 0;
      playTimer = setInterval(() => {
        t = Math.min(DEMO_SECONDS, t + 0.05);
        draw();
        if (t >= DEMO_SECONDS) {
          clearInterval(playTimer); playTimer = null; icon.style.opacity = 1;
          if (!S.lessons[id]) { S.lessons[id] = true; toast('Lesson complete!'); }
        }
      }, 50);
    };
  },
};

SCREENS.quiz = {
  html: ({ course }) => `
    ${backBtn(20, 87)}
    <p class="h20 abs" style="left:20px;top:151px">${COURSES[course].title} Quiz</p>
    <div class="abs" id="quizBody" style="left:20px;top:190px;width:400px;bottom:0"></div>`,
  bind(el, { course }) {
    const QUIZ = COURSES[course].quiz;
    let i = 0, score = 0, picked = null;
    const body = el.querySelector('#quizBody');
    const draw = () => {
      if (i >= QUIZ.length) {
        S.quizzes[course] = true;
        body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;gap:31px;margin-top:110px">
            <img src="assets/logo.svg" alt="" style="width:137px;height:102px">
            <p style="font-size:36px;font-weight:600;line-height:41px;color:var(--accent)">Quiz complete!</p>
            <p style="font-size:17px;color:var(--alt)">You got ${score} of ${QUIZ.length} right.</p>
            <button class="btn-white solid press" style="width:275px;margin-top:60px" data-act="done">Back to lessons</button>
          </div>`;
        body.querySelector('[data-act="done"]').onclick = () => back();
        return;
      }
      const q = QUIZ[i];
      body.innerHTML = `
        <p style="font-size:16px;color:#979797">Question ${i + 1} of ${QUIZ.length}</p>
        <p style="margin-top:24px;font-size:24px;font-weight:600;line-height:31px">${esc(q.q)}</p>
        <div style="margin-top:32px;display:flex;flex-direction:column;gap:16px">${q.options.map((o, k) => {
          const cls = picked === null ? '' : k === q.answer ? 'right' : k === picked ? 'wrong' : '';
          return `<button class="qopt ${cls}" data-o="${k}" ${picked === null ? '' : 'disabled style="opacity:1"'}>${esc(o)}</button>`;
        }).join('')}</div>
        ${picked === null ? '' : `<p style="margin-top:20px;font-size:16px;line-height:21px;color:${picked === q.answer ? 'var(--up)' : 'var(--down)'}">${picked === q.answer ? 'Correct! ' : 'Not quite. '}<span style="color:#ededed">${esc(q.why)}</span></p>
        <button class="btn-white solid press abs" style="left:62px;top:637px;width:275px" data-act="next">${i === QUIZ.length - 1 ? 'See results' : 'Next'}</button>`}`;
      body.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => {
        picked = +b.dataset.o;
        if (picked === q.answer) score++;
        draw();
      }));
      const next = body.querySelector('[data-act="next"]');
      if (next) next.onclick = () => { i++; picked = null; draw(); };
    };
    draw();
  },
};

SCREENS.article = {
  html: ({ id }) => {
    const n = [...NEWS, ...TERMS].find((x) => x.id === id);
    return `
      ${closeBtn(12, 85)}
      <div class="scroll" style="top:130px"><div style="padding:10px 16px 80px">
        <img src="${n.img}" alt="" style="width:408px;height:240px;object-fit:cover;border-radius:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-top:16px;font-size:12px;color:#979797">
          <span style="width:21px;height:21px;border-radius:9000px;overflow:hidden"><img src="${n.src}" alt="" style="width:100%;height:100%;object-fit:cover"></span>${n.read}</div>
        <h1 style="margin-top:12px;font-size:24px;font-weight:600;line-height:31px">${esc(n.title)}</h1>
        ${n.body.map((p) => `<p style="margin-top:16px;font-size:16px;line-height:24px;color:#ededed">${esc(p)}</p>`).join('')}
      </div></div>`;
  },
};

/* ============ Pop-up cards ============ */

function overlay(inner, { onClose } = {}) {
  const o = document.createElement('div');
  o.className = 'overlay';
  o.innerHTML = `<div class="pop" role="dialog" aria-modal="true">
    <button class="x" data-close aria-label="Close">${ICONS.close}</button>${inner}</div>`;
  const close = () => { o.classList.remove('show'); setTimeout(() => o.remove(), 230); onClose?.(); };
  o.addEventListener('click', (e) => { if (e.target === o || e.target.closest('[data-close]')) close(); });
  phone.appendChild(o);
  requestAnimationFrame(() => o.classList.add('show'));
  return { el: o, close };
}

function showDef(key) {
  const d = DEFINITIONS[key];
  overlay(`<div class="copy"><h2>${d.title}</h2><div class="body">${d.aka ? `<p class="aka">${d.aka}</p>` : ''}<p>${esc(d.body)}</p></div></div>
    <button class="thanks press" data-close>Thanks!</button>`);
}

function showNotifs() {
  const t = STOCKS.AAPL;
  overlay(`<div class="copy" style="gap:20px"><h2>Notifications</h2><div class="notif">
    <div>Welcome to Bull Stock${S.user ? ', ' + esc(S.user) : ''}! You have ${cur(acct().cash)} to invest in ${modeName()}.<small>Just now</small></div>
    <div>AAPL is up ${fmt(t.pct)}% today.<small>2 min ago</small></div>
    <div>New lesson: How to Start (3 min).<small>1 hr ago</small></div>
    <div>Linda Smith shared a new post in Community.<small>3 hr ago</small></div>
  </div></div>`);
}

function confirmReal(side, t, shares, total, onOk) {
  const o = overlay(`<div class="copy"><h2>Use real money?</h2>
    <p class="body">You’re about to ${side} ${sharesLabel(shares)} of ${t} for <b>${curText(total)}</b>. Real Mode uses your real money.</p></div>
    <div class="two"><button class="press" style="border:1.5px solid var(--accent);color:#fff" data-close>Cancel</button>
    <button class="press" style="background:var(--accent);color:#171717" data-act="ok">Confirm</button></div>`);
  o.el.querySelector('[data-act="ok"]').onclick = () => { o.close(); onOk(); };
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  phone.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 250); }, 1800);
}

/* ============ Navigation ============ */

const stack = [];

function build(name, params) {
  const el = document.createElement('div');
  el.className = 'screen';
  el.dataset.screen = name;
  el.innerHTML = SCREENS[name].html(params);
  SCREENS[name].bind?.(el, params);
  return el;
}

const FROM = {
  push: ['translateX(100%)', 'translateX(-30%)'],
  up: ['translateY(100%)', 'none'],
  fade: ['none', 'none'],
};

function transition(oldEl, newEl, anim, reverse) {
  if (playTimer) { clearInterval(playTimer); playTimer = null; }
  if (reverse) phone.insertBefore(newEl, oldEl); else phone.appendChild(newEl);
  phone.querySelector('.home-indicator') && phone.appendChild(phone.querySelector('.home-indicator'));
  if (!oldEl || anim === 'none') { oldEl?.remove(); return; }
  const [enter, exit] = FROM[anim];
  const moving = reverse ? oldEl : newEl;
  const staying = reverse ? newEl : oldEl;
  if (anim === 'fade') moving.style.opacity = reverse ? 1 : 0;
  else moving.style.transform = reverse ? 'none' : enter;
  staying.style.transform = reverse ? exit : 'none';
  newEl.offsetWidth; // start transition from the initial positions
  moving.classList.add('anim'); staying.classList.add('anim');
  if (anim === 'fade') moving.style.opacity = reverse ? 0 : 1;
  else moving.style.transform = reverse ? enter : 'none';
  staying.style.transform = reverse ? 'none' : exit;
  setTimeout(() => {
    oldEl.remove();
    newEl.classList.remove('anim');
    newEl.style.transform = newEl.style.opacity = '';
  }, 360);
}

const scrollsOf = (el) => [...el.querySelectorAll('.scroll, .hscroll')].map((s) => [s.scrollTop, s.scrollLeft]);
const restoreScrolls = (el, saved = []) =>
  el.querySelectorAll('.scroll, .hscroll').forEach((s, i) => { if (saved[i]) [s.scrollTop, s.scrollLeft] = saved[i]; });

function go(name, params = {}, anim = 'push') {
  const prev = stack[stack.length - 1];
  if (prev) prev.scrolls = scrollsOf(prev.el); // so Back returns to the same scroll spot
  const el = build(name, params);
  stack.push({ name, params, el, anim });
  transition(prev?.el, el, anim, false);
}

function back() {
  if (stack.length < 2) return;
  const top = stack.pop();
  const under = stack[stack.length - 1];
  under.el = build(under.name, under.params); // re-render so it reflects any changes
  transition(top.el, under.el, top.anim, true);
  restoreScrolls(under.el, under.scrolls);
}

function reset(name, params = {}, anim = 'fade') {
  const prev = stack[stack.length - 1];
  stack.length = 0;
  params = { ...params, anim };
  const el = build(name, params);
  stack.push({ name, params, el, anim });
  transition(prev?.el, el, anim, false);
}

function refresh() {
  const top = stack[stack.length - 1];
  const scrolls = [...top.el.querySelectorAll('.scroll, .hscroll')].map((s) => [s.scrollTop, s.scrollLeft]);
  const el = build(top.name, top.params);
  top.el.replaceWith(el);
  top.el = el;
  el.querySelectorAll('.scroll, .hscroll').forEach((s, i) => { if (scrolls[i]) [s.scrollTop, s.scrollLeft] = scrolls[i]; });
}

// Shared click handling for data-* attributes used across screens.
phone.addEventListener('click', (e) => {
  const t = e.target.closest('[data-def],[data-back],[data-tab],[data-stock],[data-go],[data-act="notifs"]');
  if (!t || t.closest('.disabled')) return;
  if (t.dataset.def) { e.stopPropagation(); showDef(t.dataset.def); }
  else if (t.hasAttribute('data-back')) back();
  else if (t.dataset.tab) { if (stack[stack.length - 1].name !== t.dataset.tab) reset(t.dataset.tab, {}, 'none'); }
  else if (t.dataset.stock) go('detail', { t: t.dataset.stock }, 'up');
  else if (t.dataset.go) {
    const p = t.dataset.p;
    const params = { search: {}, detail: { t: p }, buy: { t: p, side: t.dataset.side || 'buy' }, video: { id: p }, article: { id: p },
      lessons: { course: p || 'basics' }, quiz: { course: p || 'basics' } }[t.dataset.go] || {};
    go(t.dataset.go, params, t.dataset.anim || 'push');
  } else if (t.dataset.act === 'notifs') showNotifs();
}, true);

/* ============ Device frame scaling ============ */

if (window.self !== window.top) document.body.classList.add('embedded');

function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const isPhone = vw < 600 || (matchMedia('(pointer: coarse)').matches && vw < 900);
  document.body.classList.toggle('is-phone', isPhone);
  const s = isPhone ? Math.min(vw / 440, vh / 956) : Math.min((vh - 48) / 980, (vw - 48) / 464, 1);
  document.getElementById('viewport').style.transform = `translate(-50%, -50%) scale(${s})`;
}
window.addEventListener('resize', fit);
fit();

setMode('mock');
reset('login', {}, 'none');
