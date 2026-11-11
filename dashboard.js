/* ==========================================================
   Dashboard Designer — Studio Prototype
   Route: #/dashboard (service level, from the "Dashboard" card → Configure Dashboard)
   Left:   Visualisations — process-flow palette cards; click OR drag a card onto the dashboard.
   Centre: dashboard name + 12-column grid of visualisation cards (live sample data).
           Each card: title (selects it) · grip (drag, or click → Move menu) · Copy · Delete.
   Right:  Dashboard Items (one card per visualisation) → Item Properties with Data | Appearance tabs,
           boxes = blue heading → dark label → field (same as Documents / Landing page).
   Footer: Back · View (read-only preview) · Save.
   Accessibility: every drag has a click / keyboard alternative (WCAG 2.5.7); charts are SVG role="img"
   with a short summary and a hidden data table; selection = 2px orange stroke (no tint).
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.dashboard.v1';

  /* ---------- What can be added ---------- */
  const TYPES = {
    number:  { group: 'kpi', name: 'Number', desc: 'One key figure, such as total applications.', kind: 'kpi',
               icon: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10v4M11 10h2v2h-2v2h2M16 10h1.5v4M16 12h1.5"/>' },
    percent: { group: 'kpi', name: 'Percentage', desc: 'One rate, such as the approval rate.', kind: 'kpi',
               icon: '<circle cx="12" cy="12" r="9"/><path d="M9 15l6-6"/><circle cx="9.5" cy="9.5" r="1"/><circle cx="14.5" cy="14.5" r="1"/>' },
    vbar:    { group: 'chart', name: 'Vertical Bar', desc: 'Compare values side by side.', kind: 'bar',
               icon: '<path d="M4 20h16"/><path d="M7 16V10M12 16V5M17 16v-4"/>' },
    hbar:    { group: 'chart', name: 'Horizontal Bar', desc: 'Compare values with long names.', kind: 'bar',
               icon: '<path d="M4 4v16"/><path d="M8 7h8M8 12h12M8 17h5"/>' },
    pie:     { group: 'chart', name: 'Pie', desc: 'Show parts of a whole.', kind: 'pie',
               icon: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>' },
    donut:   { group: 'chart', name: 'Donut', desc: 'Parts of a whole, with the total in the middle.', kind: 'pie',
               icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 4v4.5"/>' },
    line:    { group: 'chart', name: 'Line', desc: 'Show how a value changes over time.', kind: 'line',
               icon: '<path d="M4 18l5-6 4 3 7-9"/>' },
    area:    { group: 'chart', name: 'Area', desc: 'A line chart with the area below filled in.', kind: 'line',
               icon: '<path d="M4 18l5-6 4 3 7-9v12H4z"/>' },
  };
  const LOOK = {"number": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><rect x=\"3\" y=\"7\" width=\"26\" height=\"18\" rx=\"3\" fill=\"#E8F0FE\" stroke=\"#1A73E8\" stroke-width=\"2\"/><text x=\"16\" y=\"20.5\" text-anchor=\"middle\" font-family=\"Roboto, sans-serif\" font-size=\"10\" font-weight=\"700\" fill=\"#1A73E8\">123</text></svg>", "percent": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><rect x=\"3\" y=\"7\" width=\"26\" height=\"18\" rx=\"3\" fill=\"#FEF7E0\" stroke=\"#F9AB00\" stroke-width=\"2\"/><text x=\"16\" y=\"21\" text-anchor=\"middle\" font-family=\"Roboto, sans-serif\" font-size=\"12\" font-weight=\"700\" fill=\"#E37400\">%</text></svg>", "vbar": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><rect x=\"5\" y=\"15\" width=\"6\" height=\"12\" rx=\"1\" fill=\"#1A73E8\"/><rect x=\"13\" y=\"6\" width=\"6\" height=\"21\" rx=\"1\" fill=\"#F9AB00\"/><rect x=\"21\" y=\"11\" width=\"6\" height=\"16\" rx=\"1\" fill=\"#1A73E8\"/></svg>", "hbar": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><rect x=\"5\" y=\"6\" width=\"22\" height=\"5\" rx=\"1\" fill=\"#1A73E8\"/><rect x=\"5\" y=\"13.5\" width=\"15\" height=\"5\" rx=\"1\" fill=\"#1A73E8\"/><rect x=\"5\" y=\"21\" width=\"10\" height=\"5\" rx=\"1\" fill=\"#F9AB00\"/></svg>", "pie": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path d=\"M16 16V4a12 12 0 1 1-11.4 15.7z\" fill=\"#1A73E8\"/><path d=\"M16 16 4.6 19.7A12 12 0 0 1 9 6.3z\" fill=\"#F9AB00\"/><path d=\"M16 16 9 6.3A12 12 0 0 1 16 4z\" fill=\"#A142F4\"/></svg>", "donut": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"9.5\" fill=\"none\" stroke=\"#1A73E8\" stroke-width=\"5\" stroke-dasharray=\"32 60\" transform=\"rotate(-90 16 16)\"/><circle cx=\"16\" cy=\"16\" r=\"9.5\" fill=\"none\" stroke=\"#F9AB00\" stroke-width=\"5\" stroke-dasharray=\"16 60\" stroke-dashoffset=\"-32\" transform=\"rotate(-90 16 16)\"/><circle cx=\"16\" cy=\"16\" r=\"9.5\" fill=\"none\" stroke=\"#A142F4\" stroke-width=\"5\" stroke-dasharray=\"11.7 60\" stroke-dashoffset=\"-48\" transform=\"rotate(-90 16 16)\"/></svg>", "line": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path d=\"M4 24l7-8 6 4 11-12\" fill=\"none\" stroke=\"#1A73E8\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "area": "<svg aria-hidden=\"true\" focusable=\"false\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path d=\"M4 24l7-8 6 4 11-12v20H4z\" fill=\"#AECBFA\"/><path d=\"M4 24l7-8 6 4 11-12\" fill=\"none\" stroke=\"#1A73E8\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"};
  const STYLE_PAIRS = { bar: [['vbar', 'Vertical Bar'], ['hbar', 'Horizontal Bar']], pie: [['pie', 'Pie'], ['donut', 'Donut']], line: [['line', 'Line'], ['area', 'Area']] };
  const MODULES = { all: 'All modules', application: 'Application', renewal: 'Renewal', amendment: 'Amendment' };
  const MEASURES = {
    count: 'Number of Applications', fees: 'Fees Collected', days: 'Average Days to Approve', rate: 'Approval Rate',
  };
  const BY = {
    status: ['Workflow Status', ['Submitted', 'Pending for Verification', 'Pending for Field Inspection', 'Approved', 'Rejected']],
    ward: ['Ward', ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6']],
    month: ['Month', ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']],
    channel: ['Channel', ['Online', 'Counter', 'Mobile App']],
  };
  const FILTERS = {
    status: BY.status,
    ward: ['Ward', BY.ward[1]], channel: ['Channel', BY.channel[1]],
  };
  // a pie / donut shows parts of a whole, so only values that add up to a total can size its slices
  const ADDS_UP = ['count', 'fees'];
  const OPS = [['eq', 'Is equal to', 'is'], ['ne', 'Is not equal to', 'is not']];
  // a filter = conditions joined by "And" (same as the form's Display Logic); older saved filters are converted
  const normFilters = w => { w.filters = (w.filters || []).map((f, i) => f.conds ? f : { name: `Filter ${i + 1}`, conds: f.field ? [{ field: f.field, op: 'eq', value: f.value }] : [] }); return w.filters; };
  const WIDTHS = { 3: 'Quarter', 4: 'One Third', 6: 'Half', 8: 'Two Thirds', 12: 'Full Width' };
  const HEIGHTS = { small: ['Small', 200], medium: ['Medium', 280], large: ['Large', 360] };
  // 3:1+ against white, white text 4.5:1+ on each
  const COLOURS = ['#0B4B66', '#C84C0E', '#00703C', '#5B3FC4', '#9E5F00', '#0057BD'];
  const LIMIT = { title: 40, desc: 120 };

  let seq = 1;
  const nid = () => 'w' + Date.now().toString(36) + (seq++);
  function make(type, extra = {}) {
    const t = TYPES[type], kpi = t.kind === 'kpi';
    return Object.assign({
      id: nid(), type, title: t.name, desc: '', module: 'all',
      measure: type === 'percent' ? 'rate' : 'count', by: t.kind === 'line' ? 'month' : 'status', filters: [],
      w: kpi ? 3 : 6, h: 'medium', values: true, legend: t.kind === 'pie', legendPos: 'bottom', points: true, running: false,
      xLabel: '', yLabel: '', compare: true,
    }, extra);
  }
  const PRESETS = [
    ['number', { title: 'Total Applications' }],
    ['percent', { title: 'Approval Rate' }],
    ['number', { title: 'Fees Collected', measure: 'fees' }],
    ['vbar', { title: 'Applications by Status' }],
    ['line', { title: 'Applications per Month' }],
    ['donut', { title: 'Applications by Channel', by: 'channel' }],
  ];
  const DEFAULT = () => ({ name: 'Business License Dashboard', widgets: [
    make('number', { title: 'Total Applications' }),
    make('percent', { title: 'Approval Rate' }),
    make('number', { title: 'Fees Collected', measure: 'fees' }),
    make('number', { title: 'Average Days to Approve', measure: 'days', upGood: false }),
    make('vbar', { title: 'Applications by Status' }),
    make('line', { title: 'Applications per Month' }),
    make('donut', { title: 'Applications by Channel', by: 'channel', w: 4 }),
    make('hbar', { title: 'Applications by Ward', by: 'ward', w: 8 }),
  ] });
  let data = DEFAULT();
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.widgets)) data = s; } catch (e) {}
  // data source is chosen per visualisation (older saves that used a dashboard-wide source are converted)
  data.widgets.forEach(w => { if (!w.module) w.module = data.module || 'application'; }); delete data.module;
  const modOf = w => w.module || 'application';
  data.widgets.forEach(w => { if (TYPES[w.type] && TYPES[w.type].kind === 'pie' && !ADDS_UP.includes(w.measure)) w.measure = 'count'; });
  let saved = JSON.stringify(data);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} saved = JSON.stringify(data); };
  let selId = null, tab = 'data', preview = false;
  const W = id => data.widgets.find(w => w.id === id);

  /* ---------- Sample data (stable for the same settings) ---------- */
  const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const rnd = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const RANGES = { month: ['This month', 0.35], d30: ['Last 30 days', 0.4], m3: ['Last 3 months', 1], m6: ['Last 6 months', 1.9], year: ['This year', 3.1], custom: ['Custom range', 1] };
  let range = 'm3', rFrom = '', rTo = '';
  const rangeFactor = () => {
    if (!preview) return 1;
    if (range === 'custom') { const d = (new Date(rTo) - new Date(rFrom)) / 864e5; return d > 0 ? Math.max(0.05, d / 91) : 1; }
    return RANGES[range][1];
  };
  const modFactor = w => (modOf(w) === 'all' ? 2.3 : 1);
  const filterFactor = w => normFilters(w).flatMap(f => f.conds).filter(c => c.value).reduce(a => a * 0.55, 1);
  function series(w) {
    const [, cats] = BY[w.by] || BY.status, r = rnd(hash(modOf(w) + w.measure + w.by));
    const base = { count: 140, fees: 36000, days: 8, rate: 70 }[w.measure];
    let vals = cats.map(() => base * (0.45 + r() * 1.1));
    if (w.measure === 'count' || w.measure === 'fees') vals = vals.map(v => Math.round(v * filterFactor(w) * rangeFactor() * modFactor(w)));
    if (w.measure === 'days') vals = vals.map(v => Math.round(v * 10) / 10);
    if (w.measure === 'rate') vals = vals.map(v => Math.min(99, Math.round(v)));
    if (TYPES[w.type].kind === 'line' && w.running && w.by === 'month') { let t = 0; vals = vals.map(v => (t += v)); }
    return cats.map((c, i) => ({ label: c, value: vals[i] }));
  }
  function kpi(w) {
    const r = rnd(hash(modOf(w) + w.measure + 'kpi'));
    const v = { count: 1248, fees: 452000, days: 7.6, rate: 82 }[w.measure] * (0.8 + r() * 0.4);
    const ff = (w.measure === 'count' || w.measure === 'fees') ? filterFactor(w) * rangeFactor() * modFactor(w) : 1;
    const val = w.measure === 'days' ? Math.round(v * 10) / 10 : w.measure === 'rate' ? Math.min(99, Math.round(v)) : Math.round(v * ff);
    const change = Math.round((r() * 30 - 10) * 10) / 10;
    return { val, change };
  }
  const fmt = (m, v, short) => {
    if (m === 'fees') return '₹' + (short && v >= 100000 ? (v / 100000).toFixed(1) + 'L' : Math.round(v).toLocaleString('en-IN'));
    if (m === 'days') return v + (short ? 'd' : ' days');
    if (m === 'rate') return v + '%';
    return Math.round(v).toLocaleString('en-IN');
  };

  /* Value format (Appearance → Number Format): Full = 12,45,000 · Short = 12.4 L; decimals; ₹ / days / % kept */
  const decOf = (w, m) => (w.dec != null ? +w.dec : (m === 'days' ? 1 : 0));
  // short form: K / L / Cr keep at least one decimal (12.5 L); numbers under 1,000 use the chosen decimals
  const compact = (n, d) => { const a = Math.abs(n), e = Math.max(d, 1);
    return a >= 1e7 ? (n / 1e7).toFixed(e) + ' Cr' : a >= 1e5 ? (n / 1e5).toFixed(e) + ' L' : a >= 1e3 ? (n / 1e3).toFixed(e) + ' K' : n.toFixed(d); };
  function fmtW(w, m, v) {
    const d = decOf(w, m), num = w.numFmt === 'short' ? compact(+v, d) : (+v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
    return m === 'fees' ? '₹' + num : m === 'days' ? num + ' days' : m === 'rate' ? num + '%' : num;
  }

  /* ---------- Charts (SVG) ---------- */
  const tx = (x, y, s, a = {}) => `<text x="${x}" y="${y}" ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}>${esc(String(s))}</text>`;
  const fit = (s, px) => { const n = Math.max(3, Math.floor(px / 6.4)); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const wrap2 = (str, px) => {
    const n = Math.max(4, Math.floor(px / 6.4)); if (str.length <= n) return [str];
    const words = str.split(' '); let a = '';
    while (words.length && (a ? a + ' ' + words[0] : words[0]).length <= n) a = a ? a + ' ' + words.shift() : words.shift();
    if (!a) return [fit(str, px)];
    return [a, fit(words.join(' '), px)].filter(Boolean);
  };
  const txLines = (x, y, lines, a, dy = 13) => `<text x="${x}" y="${y}" ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}>${lines.map((l, i) => `<tspan x="${x}" dy="${i ? dy : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  const niceMax = m => { if (m <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(m))); return Math.ceil(m / p * 1.1) * p; };
  function chartSVG(w, W0, H) {
    const t = TYPES[w.type], d = series(w), m = w.measure;
    if (t.kind === 'pie') return pieSVG(w, d, W0, H);
    const max = niceMax(Math.max(...d.map(x => x.value)));
    const xl = w.xLabel || (w.type === 'hbar' ? MEASURES[w.measure] : BY[w.by][0]), yl = w.yLabel || (w.type === 'hbar' ? BY[w.by][0] : MEASURES[w.measure]);
    w = { ...w, xLabel: xl, yLabel: yl };
    const ax = (w.xLabel ? 18 : 0), ay = (w.yLabel ? 18 : 0);
    if (w.type === 'hbar') {
      const L = Math.min(130, Math.max(...d.map(x => x.label.length)) * 7.4 + 18) + ay, R = 48, T = 8, B = 24 + ax;
      const iw = Math.max(40, W0 - L - R), ih = H - T - B, band = ih / d.length, bh = Math.min(28, band * 0.62);
      let s = '';
      for (let k = 0; k <= 4; k++) { const x = L + iw * k / 4; s += `<line x1="${x}" y1="${T}" x2="${x}" y2="${T + ih}" class="db-gl"/>` + tx(x, T + ih + 16, fmt(m, max * k / 4, true), { 'text-anchor': 'middle', class: 'db-tick' }); }
      d.forEach((p, i) => { const y = T + band * i + (band - bh) / 2, bw = iw * p.value / max;
        s += `<rect x="${L}" y="${y}" width="${Math.max(1, bw)}" height="${bh}" rx="3" fill="${COLOURS[0]}"/>` + (() => { const ln = wrap2(p.label, L - 10 - ay); return txLines(L - 8, y + bh / 2 + 4 - (ln.length - 1) * 6.5, ln, { 'text-anchor': 'end', class: 'db-tick' }); })();
        if (w.values) s += tx(L + bw + 6, y + bh / 2 + 4, fmtW(w, m, p.value), { class: 'db-val' }); });
      if (w.xLabel) s += tx(L + iw / 2, H - 4, w.xLabel, { 'text-anchor': 'middle', class: 'db-axis' });
      if (w.yLabel) s += tx(12, T + ih / 2, fit(w.yLabel, ih), { 'text-anchor': 'middle', class: 'db-axis', transform: `rotate(-90 12 ${T + ih / 2})` });
      return s;
    }
    // names along the bottom: one line → two lines → tilted (when even two lines would cut a name short)
    const bandW = Math.max(40, W0 - 48 - ay - 12) / d.length, names = d.map(p => wrap2(p.label, bandW - 4));
    const tilt = names.some(l => l.some(x => x.endsWith('…'))), two = !tilt && names.some(l => l.length > 1);
    const longest = Math.max(...d.map(p => Math.min(p.label.length, 32)));
    const L = 48 + ay, R = 12, T = w.values ? 22 : 10, B = 26 + ax + (tilt ? Math.min(110, longest * 3.6) : two ? 13 : 0);
    const nameAt = (x, y, i) => tilt
      ? tx(x + 4, y - 4, fit(d[i].label, 32 * 6.4), { 'text-anchor': 'end', class: 'db-tick', transform: `rotate(-40 ${x + 4} ${y - 4})` })
      : txLines(x, y, names[i], { 'text-anchor': 'middle', class: 'db-tick' });
    const iw = Math.max(40, W0 - L - R), ih = Math.max(40, H - T - B);
    let s = '';
    for (let k = 0; k <= 4; k++) { const y = T + ih - ih * k / 4; s += `<line x1="${L}" y1="${y}" x2="${L + iw}" y2="${y}" class="db-gl"/>` + tx(L - 8, y + 4, fmt(m, max * k / 4, true), { 'text-anchor': 'end', class: 'db-tick' }); }
    const band = iw / d.length;
    if (t.kind === 'bar') {
      const bw = Math.min(48, band * 0.6);
      d.forEach((p, i) => { const x = L + band * i + (band - bw) / 2, bh = ih * p.value / max;
        s += `<rect x="${x}" y="${T + ih - bh}" width="${bw}" height="${Math.max(1, bh)}" rx="3" fill="${COLOURS[0]}"/>`;
        if (w.values) s += tx(x + bw / 2, T + ih - bh - 6, fmtW(w, m, p.value), { 'text-anchor': 'middle', class: 'db-val' });
        s += nameAt(L + band * i + band / 2, T + ih + 16, i); });
    } else {
      const pts = d.map((p, i) => [L + band * i + band / 2, T + ih - ih * p.value / max]);
      if (w.type === 'area') s += `<path d="M${pts[0][0]},${T + ih} L${pts.map(p => p.join(',')).join(' L')} L${pts[pts.length - 1][0]},${T + ih}Z" fill="${COLOURS[0]}" fill-opacity=".16"/>`;
      s += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${COLOURS[0]}" stroke-width="2.5" stroke-linejoin="round"/>`;
      d.forEach((p, i) => {
        if (w.points) s += `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="4" fill="#fff" stroke="${COLOURS[0]}" stroke-width="2"/>`;
        if (w.values) s += tx(pts[i][0], pts[i][1] - 9, fmtW(w, m, p.value), { 'text-anchor': 'middle', class: 'db-val' });
        s += nameAt(pts[i][0], T + ih + 16, i); });
    }
    s += `<line x1="${L}" y1="${T + ih}" x2="${L + iw}" y2="${T + ih}" class="db-axisline"/>`;
    if (w.xLabel) s += tx(L + iw / 2, H - 4, w.xLabel, { 'text-anchor': 'middle', class: 'db-axis' });
    if (w.yLabel) s += tx(12, T + ih / 2, fit(w.yLabel, ih), { 'text-anchor': 'middle', class: 'db-axis', transform: `rotate(-90 12 ${T + ih / 2})` });
    return s;
  }
  function pieSVG(w, d, W0, H) {
    const total = d.reduce((a, p) => a + p.value, 0) || 1, cx = W0 / 2, cy = H / 2, r = Math.max(30, Math.min(W0, H) / 2 - 6), ir = w.type === 'donut' ? r * 0.58 : 0;
    let a0 = -Math.PI / 2, s = '';
    d.forEach((p, i) => {
      const a1 = a0 + 2 * Math.PI * p.value / total, big = a1 - a0 > Math.PI ? 1 : 0;
      const P = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
      const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1);
      const path = ir ? (() => { const [u0, v0] = P(ir, a1), [u1, v1] = P(ir, a0); return `M${x0},${y0} A${r},${r} 0 ${big} 1 ${x1},${y1} L${u0},${v0} A${ir},${ir} 0 ${big} 0 ${u1},${v1}Z`; })()
        : `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${big} 1 ${x1},${y1}Z`;
      s += `<path d="${path}" fill="${COLOURS[i % COLOURS.length]}" stroke="#fff" stroke-width="2"/>`;
      const pct = Math.round(p.value / total * 100);
      if (w.values && pct >= 6) { const [lx, ly] = P(ir ? (r + ir) / 2 : r * 0.62, (a0 + a1) / 2); s += tx(lx, ly + 4, w.sliceAs === 'value' ? fmtW({ ...w, numFmt: 'short' }, w.measure, p.value) : pct + '%', { 'text-anchor': 'middle', class: 'db-slice' }); }
      a0 = a1;
    });
    if (ir) s += tx(cx, cy - 2, fmtW(w, w.measure, Math.round(total * 10) / 10), { 'text-anchor': 'middle', class: 'db-centre' }) + tx(cx, cy + 16, 'Total', { 'text-anchor': 'middle', class: 'db-tick' });
    return s;
  }
  const summary = w => { const d = series(w), top = d.reduce((a, b) => (b.value > a.value ? b : a)); return `${TYPES[w.type].name} chart of ${MEASURES[w.measure].toLowerCase()} by ${BY[w.by][0].toLowerCase()}. Highest: ${top.label}, ${fmt(w.measure, top.value)}.`; };
  const table = w => `<table class="sr-only"><caption>${esc(w.title || TYPES[w.type].name)}</caption><thead><tr><th scope="col">${BY[w.by][0]}</th><th scope="col">${MEASURES[w.measure]}</th></tr></thead>
      <tbody>${series(w).map(p => `<tr><th scope="row">${esc(p.label)}</th><td>${fmtW(w, w.measure, p.value)}</td></tr>`).join('')}</tbody></table>`;

  /* ---------- Icons ---------- */
  const ic = (p, s = 20) => `<svg aria-hidden="true" focusable="false" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    back: ic('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', 16),
    left: ic('<path d="M19 12H5M11 18l-6-6 6-6"/>', 18),
    guides: ic('<rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/>', 16),
    plus: ic('<path d="M12 5v14M5 12h14"/>', 16),
    plusSq: '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
    trash: ic('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', 18),
    resize: ic('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>', 18),
    copy: ic('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', 18),
    grip: '<svg aria-hidden="true" focusable="false" width="14" height="22" viewBox="0 0 14 22"><g fill="currentColor"><circle cx="4" cy="5" r="1.6"/><circle cx="10" cy="5" r="1.6"/><circle cx="4" cy="11" r="1.6"/><circle cx="10" cy="11" r="1.6"/><circle cx="4" cy="17" r="1.6"/><circle cx="10" cy="17" r="1.6"/></g></svg>',
    close: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: ic('<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>', 18),
    kb: ic('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>', 18),
    undo: ic('<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', 16),
    redo: ic('<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>', 16),
    eye: ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 18),
    info: ic('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>', 16),
    pencilS: ic('<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>', 18),
    pencil: ic('<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>', 20),
    up: ic('<path d="M7 14l5-5 5 5"/>', 16), down: ic('<path d="M7 10l5 5 5-5"/>', 16),
  };
  const tip = (id, label, text) => `<span class="tip"><button type="button" class="tip-btn" aria-label="About ${label}" aria-describedby="${id}">${I.info}</button><span class="tip-bubble" role="tooltip" id="${id}">${text}</span></span>`;
  const opts = (pairs, cur) => pairs.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(cur) ? ' selected' : ''}>${esc(t)}</option>`).join('');
  const sw = (key, on, label) => `<button type="button" class="switch" role="switch" data-sw="${key}" aria-checked="${on}" aria-label="${label}"><span class="switch-knob" aria-hidden="true"></span></button>`;

  /* ---------- Shell ---------- */
  const view = $('view-dashboard');
  view.innerHTML = `
    <div class="subbar db-topbar">
      <a class="btn btn-secondary" href="#/">${I.back} Back to Service Dashboard</a>
      <h1 class="db-top-title" id="db-page-t" tabindex="-1">Dashboard</h1>
      <button type="button" class="btn btn-secondary db-guides">${I.guides} Tutorials and Guides</button>
    </div>
    <div class="form-body db-body" id="db-body">
      <aside class="db-palette" aria-labelledby="db-pal-t">
        <div class="fp-head"><h2 class="fp-title" id="db-pal-t">Visualisations</h2>
          <p class="db-pal-desc" id="db-pal-d">Click or drag a visualisation to add it to the dashboard.</p></div>
        <div class="fp-scroll">
          ${[['kpi', 'KPI Cards'], ['chart', 'Charts']].map(([g, gt]) => `
          <h3 class="db-pal-group" id="db-g-${g}">${gt}</h3>
          <ul class="db-pal-list is-tiles" aria-labelledby="db-g-${g}">${Object.entries(TYPES).filter(([, t]) => t.group === g).map(([k, t]) => `
            <li><button type="button" class="db-pal-item" draggable="true" data-add="${k}" aria-describedby="db-pal-d">
              <span class="db-pal-ico" aria-hidden="true">${LOOK[k]}</span><span class="db-pal-name">${t.name}</span>
            </button></li>`).join('')}</ul>`).join('')}
        </div>
      </aside>
      <div class="form-main db-main" id="db-main">
        <div class="db-bar" role="toolbar" aria-label="Dashboard tools">
          <p class="db-stats" id="db-stats" aria-live="polite"></p>
        </div>
        <div class="db-head">
          <h2 class="db-prev-title">Preview Dashboard</h2>
          <p class="db-desc" id="db-desc"></p>
        </div>
        <p class="sr-only" id="db-kb-hint">Arrow keys go to the next or previous visualisation. Control plus arrow keys move it. Control Shift plus arrow keys resize it. Delete removes it. Control plus slash lists all keyboard shortcuts.</p>
        <div class="db-range" id="db-range" role="group" aria-labelledby="db-range-l" hidden>
          <div class="db-range-f"><label class="db-range-l" id="db-range-l" for="db-range-sel">Date Range</label>
            <select class="input" id="db-range-sel">${opts(Object.entries(RANGES).map(([v, [t]]) => [v, t]), range)}</select></div>
          <div class="db-range-f" data-custom hidden><label class="db-range-l" for="db-range-from">From</label><input class="input" id="db-range-from" type="date"></div>
          <div class="db-range-f" data-custom hidden><label class="db-range-l" for="db-range-to">To</label><input class="input" id="db-range-to" type="date"></div>
        </div>
        <div class="db-grid" id="db-grid" aria-label="Dashboard"></div>
      </div>
      <aside class="form-panel db-panel" aria-label="Dashboard items">
        <div class="panel-view" id="db-list-view">
          <div class="fp-head"><h2 class="fp-title" id="db-list-head">Dashboard Items</h2></div>
          <div class="fp-scroll" id="db-items"></div>
        </div>
        <div class="panel-view" id="db-item-view" hidden></div>
      </aside>
    </div>
    <div class="db-narrow" role="note"><h2>Use a larger screen</h2><p>The dashboard designer needs a screen at least 1024 pixels wide. Open it on a laptop or desktop.</p></div>
    <footer class="form-foot">
      <a class="btn btn-secondary" id="db-back" href="#/">${I.left} Back</a>
      <div class="db-foot-r">
        <button type="button" class="btn btn-secondary" id="db-view">${I.eye} Preview Dashboard</button>
        <button type="button" class="btn btn-primary dc-save" id="db-save">${I.check} Save</button>
      </div>
    </footer>

    <dialog class="modal dc-vd" id="db-src-dlg" aria-labelledby="db-src-t" aria-describedby="db-src-d">
      <form id="db-src-form" novalidate>
        <button type="button" class="icon-btn dc-vd-close" data-close aria-label="Close">${I.close}</button>
        <h2 class="dc-vd-title" id="db-src-t">Add Visualisation</h2>
        <p class="dc-vd-desc" id="db-src-d">Choose the module this visualisation counts records from, and give it a title to show on the dashboard. You can change both later in Item Properties.</p>
        <div class="db-src-row">
        <div class="dc-vd-field">
          <label class="dc-vd-label" for="db-src-sel">Data Source <span class="req" aria-hidden="true">*</span></label>
          <select class="input" id="db-src-sel">${opts(Object.entries(MODULES), 'all')}</select>
        </div>
        <div class="dc-vd-field">
          <label class="dc-vd-label" for="db-src-title">Title <span class="req" aria-hidden="true">*</span></label>
          <input class="input" id="db-src-title" type="text" maxlength="${LIMIT.title}" autocomplete="off" required aria-describedby="db-src-title-e">
          <p class="fp-error" id="db-src-title-e"></p>
        </div>
        </div>
        <div class="dc-vd-actions">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Add Visualisation</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal dc-vd db-kb-dlg" id="db-kb-dlg" aria-labelledby="db-kb-t" aria-describedby="db-kb-d">
      <div class="db-kb-in">
        <button type="button" class="icon-btn dc-vd-close" data-close aria-label="Close">${I.close}</button>
        <h2 class="dc-vd-title" id="db-kb-t"><span class="dc-vd-ico" aria-hidden="true">${I.kb}</span><span>Keyboard Shortcuts</span></h2>
        <p class="dc-vd-desc" id="db-kb-d">Everything you can do with a mouse, you can also do with these keys. On a Mac, use Cmd instead of Ctrl.</p>
        <div class="db-kb-body" tabindex="0" role="region" aria-label="Shortcut list"><h3 class="db-kb-h">Anywhere on this page</h3><table class="db-kb-table"><thead><tr><th scope="col">Keys</th><th scope="col">What it does</th></tr></thead><tbody><tr><td><kbd>Ctrl + /</kbd></td><td>Show these keyboard shortcuts</td></tr><tr><td><kbd>Ctrl + S</kbd></td><td>Save the dashboard</td></tr><tr><td><kbd>Ctrl + Z</kbd></td><td>Undo the last change</td></tr><tr><td><kbd>Ctrl + Y or Ctrl + Shift + Z</kbd></td><td>Redo</td></tr><tr><td><kbd>F6 / Shift + F6</kbd></td><td>Go to the next / previous area: Visualisations panel, dashboard, properties panel</td></tr><tr><td><kbd>Esc</kbd></td><td>Close Item Properties, or leave Preview Dashboard</td></tr></tbody></table><h3 class="db-kb-h">Visualisations (left)</h3><table class="db-kb-table"><thead><tr><th scope="col">Keys</th><th scope="col">What it does</th></tr></thead><tbody><tr><td><kbd>↑ / ↓</kbd></td><td>Go to the previous / next visualisation</td></tr><tr><td><kbd>Enter or Space</kbd></td><td>Add the visualisation at the end of the dashboard</td></tr></tbody></table><h3 class="db-kb-h">A visualisation on the dashboard</h3><table class="db-kb-table"><thead><tr><th scope="col">Keys</th><th scope="col">What it does</th></tr></thead><tbody><tr><td><kbd>← → ↑ ↓</kbd></td><td>Go to the previous / next visualisation</td></tr><tr><td><kbd>Home / End</kbd></td><td>Go to the first / last visualisation</td></tr><tr><td><kbd>Enter or Space</kbd></td><td>Select it and open its properties</td></tr><tr><td><kbd>Ctrl + ← / Ctrl + →</kbd></td><td>Move it left / right</td></tr><tr><td><kbd>Ctrl + Home / Ctrl + End</kbd></td><td>Move it to the first / last place</td></tr><tr><td><kbd>Ctrl + Shift + → / ←</kbd></td><td>Make it wider / narrower</td></tr><tr><td><kbd>Ctrl + Shift + ↑ / ↓</kbd></td><td>Make a chart shorter / taller</td></tr><tr><td><kbd>Ctrl + D</kbd></td><td>Copy it</td></tr><tr><td><kbd>Delete</kbd></td><td>Delete it</td></tr></tbody></table></div>
        <div class="dc-vd-actions"><button type="button" class="btn btn-primary" data-close>Close</button></div>
      </div>
    </dialog>

    <dialog class="modal dlg-logic" id="db-flt-dlg" aria-labelledby="db-flt-t">
      <form id="db-flt-form" novalidate>
        <div class="lg-head">
          <h2 class="lg-title db-flt-title"><span class="dc-vd-ico" aria-hidden="true">${I.plusSq}</span><span id="db-flt-t">Add Filter</span></h2>
          <button type="button" class="icon-btn" data-close aria-label="Close">${I.close}</button>
        </div>
        <div class="lg-body" id="db-flt-body"></div>
        <div class="lg-foot">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal pfc" id="db-confirm" aria-labelledby="db-pfc-t" aria-describedby="db-pfc-d">
      <button type="button" class="icon-btn pfc-close" data-close aria-label="Close">${I.close}</button>
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="db-pfc-t"></h2>
      <p class="pfc-desc" id="db-pfc-d"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-close id="db-pfc-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="db-pfc-ok">Delete</button>
      </div>
    </dialog>`;

  /* ---------- Canvas ---------- */
  const grid = $('db-grid');
  function cardHTML(w, i) {
    const t = TYPES[w.type], sel = w.id === selId, h = HEIGHTS[w.h] ? HEIGHTS[w.h][1] : 280;
    let body;
    if (t.kind === 'kpi') {
      const k = kpi(w), up = k.change >= 0, val = w.type === 'percent' && w.measure !== 'rate' ? fmt('rate', Math.min(99, Math.round(k.val % 100))) : fmtW(w, w.measure, k.val);
      body = `<div class="db-kpi"><p class="db-kpi-v">${val}</p>
        ${w.compare ? (() => {
          const good = up === (w.upGood !== false), than = { month: 'the previous month', quarter: 'the previous 3 months', year: 'the same month last year' }[w.cmpWith || 'month'];
          const amt = (w.cmpAs || 'pct') === 'num' ? fmtW(w, w.measure, Math.round(Math.abs(k.change) / 100 * k.val * 10) / 10) : `${Math.abs(k.change)}%`;
          return `<p class="db-kpi-c ${good ? 'is-up' : 'is-down'}"><span aria-hidden="true">${up ? '▲' : '▼'}</span> ${amt} <span class="db-kpi-cl">${up ? 'more' : 'less'} than ${than}</span></p>`;
        })() : ''}</div>`;
    } else {
      const legend = !!w.legend;
      const d = series(w), total = d.reduce((a, p) => a + p.value, 0) || 1;
      body = `<div class="db-chart-wrap${legend && w.legendPos === 'right' ? ' is-right' : ''}">
          <div class="db-chart" data-chart="${w.id}" style="height:${h}px"></div>
          ${legend ? `<ul class="db-legend" aria-hidden="true">${t.kind === 'pie'
            ? d.map((p, k) => `<li><span class="db-sw" style="background:${COLOURS[k % COLOURS.length]}"></span>${esc(p.label)}${w.values ? '' : ` <b>${Math.round(p.value / total * 100)}%</b>`}</li>`).join('')   /* % only when the slices don't already show it */
            : `<li><span class="db-sw" style="background:${COLOURS[0]}"></span>${MEASURES[w.measure]}</li>`}</ul>` : ''}
        </div>${table(w)}`;
    }
    return `<article class="db-card${sel ? ' is-sel' : ''}"${preview ? '' : ' draggable="true"'} data-w="${w.id}" data-span="${w.w}" style="--span:${w.w}" aria-labelledby="db-t-${w.id}">
      <header class="db-card-head">
        <div class="db-card-tt">
          ${preview ? `<h3 class="db-card-title" id="db-t-${w.id}">${esc(w.title || t.name)}</h3>`
            : `<h3 class="db-card-title" id="db-t-${w.id}"><button type="button" class="db-sel" data-sel="${w.id}" aria-pressed="${sel}" aria-describedby="db-kb-hint" aria-keyshortcuts="Delete Control+D Control+ArrowLeft Control+ArrowRight Control+Shift+ArrowRight Control+Shift+ArrowLeft Control+Shift+ArrowUp Control+Shift+ArrowDown">${esc(w.title || t.name)}</button></h3>`}
          ${w.desc ? `<p class="db-card-desc">${esc(w.desc)}</p>` : ''}
        </div>
        ${preview ? '' : `<div class="db-card-acts" role="group" aria-label="${esc(w.title || t.name)} tools">
          <span class="db-grip-wrap"><button type="button" class="grip db-grip" draggable="true" data-grip="${i}" aria-haspopup="menu" aria-expanded="false" aria-label="Move ${esc(w.title || t.name)}" title="Drag, or click to move">${I.grip}</button></span>
          <span class="db-grip-wrap"><button type="button" class="db-act" data-rsz="${i}" aria-haspopup="menu" aria-expanded="false" aria-label="Resize ${esc(w.title || t.name)}" title="Resize">${I.resize}</button></span>
          <button type="button" class="db-act" data-copy="${w.id}" aria-label="Copy ${esc(w.title || t.name)}" title="Copy">${I.copy}</button>
          <button type="button" class="db-act" data-del="${w.id}" aria-label="Delete ${esc(w.title || t.name)}" title="Delete">${I.trash}</button>
        </div>`}
      </header>
      <div class="db-card-body">${body}</div>
      ${preview ? '' : `<span class="db-rz db-rz-x" data-rs="${w.id}" data-axis="x" aria-hidden="true" title="Drag to change the width"></span>${t.kind !== 'kpi' ? `<span class="db-rz db-rz-y" data-rs="${w.id}" data-axis="y" aria-hidden="true" title="Drag to change the height"></span>` : ''}<span class="db-resize" data-rs="${w.id}" data-axis="${t.kind !== 'kpi' ? 'xy' : 'x'}" aria-hidden="true" title="Drag to resize"></span>`}
    </article>`;
  }
  function drawStats() {
    const n = data.widgets.length, kpis = data.widgets.filter(w => TYPES[w.type].kind === 'kpi').length;
    const st = (v, one, many) => `<span class="db-stat"><strong>${v}</strong> ${v === 1 ? one : many}</span>`;
    $('db-stats').innerHTML = st(n, 'visualisation', 'visualisations') + '<span class="db-stat-sep" aria-hidden="true"></span>'
      + st(kpis, 'KPI card', 'KPI cards') + '<span class="db-stat-sep" aria-hidden="true"></span>' + st(n - kpis, 'chart', 'charts');
  }
  function drawGrid() {
    drawStats();
    grid.innerHTML = data.widgets.length ? data.widgets.map(cardHTML).join('')
      : `<div class="db-empty"><svg class="db-empty-art" aria-hidden="true" focusable="false" width="220" height="120" viewBox="0 0 220 120" fill="none">
            <rect x="96" y="14" width="56" height="36" rx="4" stroke="#B1B4B6" stroke-width="1.5" stroke-dasharray="4 3"/>
            <rect x="158" y="14" width="56" height="36" rx="4" stroke="#B1B4B6" stroke-width="1.5" stroke-dasharray="4 3"/>
            <rect x="96" y="58" width="118" height="54" rx="4" stroke="#B1B4B6" stroke-width="1.5" stroke-dasharray="4 3"/>
            <path d="M58 52c14-18 26-24 40-22" stroke="#C84C0E" stroke-width="1.5" stroke-dasharray="3 3" stroke-linecap="round"/>
            <path d="M93 25l6 5-7 3" stroke="#C84C0E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="6" y="50" width="56" height="48" rx="6" fill="#fff" stroke="#C84C0E" stroke-width="2"/>
            <rect x="18" y="74" width="7" height="14" rx="1" fill="#1A73E8"/><rect x="30" y="64" width="7" height="24" rx="1" fill="#F9AB00"/><rect x="42" y="70" width="7" height="18" rx="1" fill="#1A73E8"/>
            <path d="M48 90l0 20 5-5 4 9 4-2-4-9 7 0z" fill="#fff" stroke="#363636" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
          <h2 class="db-empty-t">Add your first visualisation</h2>
          <p class="db-empty-d">Drag a KPI card or chart from the Visualisations panel and drop it here, or click one to add it.</p></div>`;
    view.classList.toggle('db-is-empty', !data.widgets.length);
    drawCharts();
  }
  function drawCharts() {
    grid.querySelectorAll('[data-chart]').forEach(el => {
      const w = W(el.dataset.chart); if (!w) return;
      const base = HEIGHTS[w.h] ? HEIGHTS[w.h][1] : 280, cw = Math.max(120, el.clientWidth);
      const draw = h => { el.style.height = h + 'px'; el.innerHTML = `<svg width="${cw}" height="${h}" viewBox="0 0 ${cw} ${h}" role="img" aria-label="${esc(summary(w))}">${chartSVG(w, cw, h)}</svg>`; };
      draw(base);
      // tilted names take room from the bars: give the chart that room back
      if (el.querySelector('.db-tick[transform]')) draw(base + Math.min(110, Math.max(...series(w).map(p => Math.min(p.label.length, 32))) * 3.2));
    });
  }
  new ResizeObserver(() => drawCharts()).observe(grid);
  const stamp = new Date();
  const fresh = () => `<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Data last updated: ${stamp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${stamp.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
  function drawTitle() { const d = $('db-desc'); d.textContent = data.desc || ''; d.hidden = !data.desc; }

  /* ---------- Right panel: Dashboard Items ---------- */
  const DL = { name: 60, desc: 150 };
  function drawItems() {
    $('db-items').innerHTML = `<div class="fp-section">
      ${data.widgets.length ? `<ul class="field-list" aria-labelledby="db-list-head">${data.widgets.map(w => `<li class="field-card lp-fc db-item${w.id === selId ? ' is-selected' : ''}">
        <button type="button" class="lp-fc-open" data-sel="${w.id}"><span class="field-info"><span class="field-name">${esc(w.title || TYPES[w.type].name)}</span>
          <span class="db-item-tags"><span class="type-tag db-type-tag"><span class="sr-only">Type: </span>${TYPES[w.type].name}</span><span class="db-flt-tag db-mod-tag"><span class="sr-only">Data source: </span>${MODULES[modOf(w)]}</span></span></span></button>
          <span class="field-actions"><button type="button" class="del-btn" data-rmitem="${w.id}" aria-label="Delete ${esc(w.title || TYPES[w.type].name)}" title="Delete">${I.trash}</button></span></li>`).join('')}</ul>`
        : `<p class="db-items-none">No visualisations added yet. Click or drag one from the left.</p>`}
    </div>`;
  }

  /* ---------- Item Properties: Data | Appearance ---------- */
  const box = (title, inner, id = '') => `<div class="fpp-box"${id ? ` id="${id}"` : ''}><h3 class="fpp-box-title">${title}</h3>${inner}</div>`;
  const field = (id, label, control, t = '') => `<div class="fpp-field"><span class="fp-label"><label class="fpp-label" for="${id}">${label}</label>${t}</span>${control}</div>`;
  const sel = (id, key, pairs, cur) => `<select class="input" id="${id}" data-k="${key}">${opts(pairs, cur)}</select>`;
  const chkGroup = (id, label, rows) => `<div class="fpp-field"><p class="fpp-label" id="${id}">${label}</p>
      <fieldset class="check-list db-chk-list" aria-labelledby="${id}">${rows.map(([key, on, text, hint]) =>
        `<label class="check-row${hint ? ' has-hint' : ''}"><input type="checkbox" data-chk="${key}"${on ? ' checked' : ''}${hint ? ` aria-describedby="db-h-${key}"` : ''}><span class="db-chk-t"><span>${text}</span>${hint ? `<small id="db-h-${key}">${hint}</small>` : ''}</span></label>`).join('')}</fieldset></div>`;
  const chk = (key, on, label, t = '') => `<div class="db-chk"><label class="check-row"><input type="checkbox" data-chk="${key}"${on ? ' checked' : ''}><span>${label}</span></label>${t}</div>`;
  const swRow = (key, on, label, t = '') => `<div class="db-sw-row"><span class="fp-label" id="db-swl-${key}">${label}${t}</span>${sw(key, on, label)}</div>`;
  // Which box sits on which axis: bar / line = groups across the bottom, numbers up the side; horizontal bar is the other way round
  function axesBoxes(w, k) {
    const groups = (title, label) => box(title, field('db-by', label, sel('db-by', 'by', Object.entries(BY).map(([v, [t]]) => [v, t]), w.by)));
    const values = (title, label) => box(title, field('db-measure', label, sel('db-measure', 'measure', Object.entries(MEASURES), w.measure))
      // how the value is shown (Excel "Show values as" / Looker "Running calculation"): only for a timeline
      + (k === 'line' && w.by === 'month' ? field('db-sva', 'Show Value As', `<select class="input" id="db-sva" data-run>${opts([['each', 'Each month on its own'], ['running', 'Running total (adds up month by month)']], w.running ? 'running' : 'each')}</select>`) : ''));
    if (k === 'kpi') return values('Card Value', 'Value to Show');
    // a pie has no axes: one "Slices" box holds both choices
    if (k === 'pie') return box('Slices', field('db-by', 'Data to Show', sel('db-by', 'by', Object.entries(BY).map(([v, [t]]) => [v, t]), w.by))
      + field('db-measure', 'Value to Show', sel('db-measure', 'measure', Object.entries(MEASURES).filter(([v]) => ADDS_UP.includes(v)), w.measure)));
    if (w.type === 'hbar') return groups('Vertical Axis (Y)', 'Data to Show') + values('Horizontal Axis (X)', 'Value to Show');
    return groups('Horizontal Axis (X)', 'Data to Show') + values('Vertical Axis (Y)', 'Value to Show');
  }
  function dataTab(w) {
    const k = TYPES[w.type].kind;
    return box('Data Source', field('db-module', 'Module', sel('db-module', 'module', Object.entries(MODULES), w.module)))
      + axesBoxes(w, k)
      + box('Filters', `<div class="dl-card">
          <h4 class="dl-title fpp-with-tip" id="db-fl-t">Filters for This Visualisation ${tip('db-tip-fl', 'filters for this visualisation', 'Filters for this visualisation are conditions on a record. Only records that meet every filter are included in this visualisation.')}</h4>
          ${normFilters(w).length ? `<ul class="dl-list" aria-labelledby="db-fl-t">${w.filters.map((f, i) => `
            <li class="dl-item">
              <span class="dl-name">${esc(f.name)}${f.conds[0] ? `<span class="dl-meta">${esc(FILTERS[f.conds[0].field]?.[0] || '')} ${OPS.find(o => o[0] === f.conds[0].op)?.[2] || ''} ${esc(f.conds[0].value)}</span>` : ''}</span>
              <button type="button" class="dl-btn" data-editf="${i}" aria-label="Edit ${esc(f.name)}" aria-haspopup="dialog">${I.pencilS}</button>
              <button type="button" class="dl-btn" data-rmf="${i}" aria-label="Delete ${esc(f.name)}">${I.trash}</button>
            </li>`).join('')}</ul>` : '<p class="db-none">No filters yet. The visualisation counts every record.</p>'}
          <button type="button" class="btn btn-secondary dl-add" id="db-add-filter" aria-haspopup="dialog">${I.plus} Add Filter</button>
        </div>`);
  }
  const numFields = w => field('db-nf', 'Show Numbers As', sel('db-nf', 'numFmt', [['full', 'Full number (12,45,000)'], ['short', 'Short number (12.5 L)']], w.numFmt || 'full'))
      + field('db-dp', 'Decimal Places', sel('db-dp', 'dec', [['0', '0'], ['1', '1'], ['2', '2']], String(decOf(w, w.measure))));
  const numBox = w => box('Number Format', numFields(w));
  function displayTab(w) {
    const k = TYPES[w.type].kind;
    const cnt = (key, max) => `<div class="fp-meta"><span class="fp-error"></span><span class="fp-count" data-cnt="${key}">${(w[key] || '').length}/${max}<span class="sr-only"> characters</span></span></div>`;
    let h = box('Title',
      field('db-ttl', 'Title', `<input class="fp-input" id="db-ttl" type="text" maxlength="${LIMIT.title}" data-k="title" value="${esc(w.title)}" autocomplete="off">`));   // limit kept, counter not shown
    // (Size is not in the panel: resize by dragging the handles, Ctrl+Shift+arrows, or the card's ⋮⋮ menu)
    if (k === 'kpi') h += numBox(w) + `<div class="fpp-box"><div class="fpp-box-head"><h3 class="fpp-box-title">Comparison</h3>${sw('compare', w.compare, 'Comparison')}</div>
      ${w.compare ? field('db-cw', 'Compare With', sel('db-cw', 'cmpWith', [['month', 'Previous month'], ['quarter', 'Previous 3 months'], ['year', 'Same month last year']], w.cmpWith || 'month'))
        + field('db-ca', 'Show Change As', sel('db-ca', 'cmpAs', [['pct', 'Percentage'], ['num', 'Number']], w.cmpAs || 'pct'))
        + field('db-cg', 'An Increase Is', sel('db-cg', 'upGood', [['good', 'Good (shown in green)'], ['bad', 'Bad (shown in red)']], w.upGood === false ? 'bad' : 'good')) : ''}</div>`;
    else {
      // Order = outside in, like Looker / Power BI format panes, and mirrors the Data tab:
      // what it is → its axes (same order as Data) → what is written on it → its key
      const xT = field('db-xl', 'Horizontal Axis (X) Title', `<input class="fp-input" id="db-xl" type="text" maxlength="30" data-k="xLabel" value="${esc(w.xLabel)}" placeholder="${esc(w.type === 'hbar' ? MEASURES[w.measure] : BY[w.by][0])}" autocomplete="off">`);
      const yT = field('db-yl', 'Vertical Axis (Y) Title', `<input class="fp-input" id="db-yl" type="text" maxlength="30" data-k="yLabel" value="${esc(w.yLabel)}" placeholder="${esc(w.type === 'hbar' ? BY[w.by][0] : MEASURES[w.measure])}" autocomplete="off">`);
      h += box('Chart Style', field('db-style', 'Style', `<select class="input" id="db-style" data-style>${opts(STYLE_PAIRS[k], w.type)}</select>`))
        + (k !== 'pie' ? box('Axis Titles', w.type === 'hbar' ? yT + xT : xT + yT) : '')
        + `<div class="fpp-box"><div class="fpp-box-head"><h3 class="fpp-box-title">Data Labels</h3>${sw('values', w.values, 'Data Labels')}</div>
            ${k === 'pie' && w.values ? field('db-sla', 'Slice Labels Show', sel('db-sla', 'sliceAs', [['pct', 'Percentage of the total'], ['value', 'Value']], w.sliceAs || 'pct')) : ''}
            ${w.values ? numFields(w) : ''}</div>`
        + (k === 'line' ? `<div class="fpp-box"><div class="fpp-box-head"><h3 class="fpp-box-title">Data Points</h3>${sw('points', w.points, 'Data Points')}</div></div>` : '')
        + `<div class="fpp-box"><div class="fpp-box-head"><h3 class="fpp-box-title" id="db-lg-t">Legend</h3>${sw('legend', w.legend, 'Legend')}</div>
            ${w.legend ? field('db-lpos', 'Legend Position', sel('db-lpos', 'legendPos', [['bottom', 'Below the chart'], ['right', 'Right of the chart']], w.legendPos)) : ''}</div>`;
    }
    return h;
  }
  function openItem(focusTab) {
    const w = W(selId); if (!w) return closeItem();
    $('db-list-view').hidden = true; const v = $('db-item-view'); v.hidden = false;
    const y = v.querySelector('.fp-scroll')?.scrollTop || 0;
    v.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="db-item-back">${I.left} Back to dashboard items</button>
        <h2 class="fpp-title" id="db-item-t">Item Properties</h2>
      </div>
      <div class="fpp-tabs-wrap"><div class="fpp-tabs" role="tablist" aria-labelledby="db-item-t">
        ${[['data', 'Data'], ['display', 'Appearance']].map(([k, t]) => `<button type="button" role="tab" id="db-tab-${k}" aria-controls="db-tabpanel" aria-selected="${tab === k}" tabindex="${tab === k ? 0 : -1}" data-tab="${k}">${t}</button>`).join('')}
      </div></div>
      <div class="fp-scroll"><div class="fpp-body" id="db-tabpanel" role="tabpanel" aria-labelledby="db-tab-${tab}">
        <p class="fpp-intro">${tab === 'data'
          ? 'Data controls what this visualisation shows and which records it counts.'
          : 'Appearance controls how this visualisation looks on the dashboard.'}</p>
        ${tab === 'data' ? dataTab(w) : displayTab(w)}
      </div></div>`;
    v.querySelector('.fp-scroll').scrollTop = y;
    if (focusTab) $('db-tab-' + tab).focus();
  }
  function closeItem() { $('db-item-view').hidden = true; $('db-list-view').hidden = false; drawItems(); }
  function select(id, opts2 = {}) {
    selId = id; if (!opts2.keepTab) tab = 'data';
    grid.querySelectorAll('.db-card').forEach(c => { const on = c.dataset.w === id; c.classList.toggle('is-sel', on); c.querySelector('.db-sel')?.setAttribute('aria-pressed', on); });
    if (id) { openItem(false); if (opts2.focusPanel) $('db-tab-' + tab)?.focus(); } else closeItem();
  }

  /* ---------- Filter Logic popup: "If <field> <is / is not> <value>", joined by "And", then "Then count …" ---------- */
  let fl = null;   // { w, index, conds, errors, opener, saved }
  const blank = () => ({ field: '', op: '', value: '' });
  const lgSel = (id, label, ph, pairs, cur, k, i, err) => `<div class="lg-field"><label class="lg-label" for="${id}">${label}</label>
      <select class="pf-input pf-select lg-select${cur ? '' : ' is-ph'}" id="${id}" data-k="${k}" data-i="${i}"${err ? ' aria-invalid="true"' : ''}><option value="">${ph}</option>${opts(pairs, cur)}</select></div>`;
  function flRender(focusSel) {
    const n = fl.conds.length;
    const conds = fl.conds.map((c, i) => { const er = fl.errors[i] || {};
      return (i ? '<p class="lg-and" aria-hidden="true">And</p>' : '') + `<div class="lg-cond" role="group" aria-label="Condition ${i + 1}">
        <div class="lg-cond-head"><span class="lg-if">If</span>${n > 1 ? `<button type="button" class="lg-del" data-delc="${i}">${I.trash} Delete Condition</button>` : ''}</div>
        ${lgSel(`db-fc-f-${i}`, 'Field', 'Choose a field', Object.entries(FILTERS).map(([v, [t]]) => [v, t]), c.field, 'field', i, er.field)}
        ${lgSel(`db-fc-o-${i}`, 'Operator', 'Choose an operator for comparison', OPS.map(([v, t]) => [v, t]), c.op, 'op', i, er.op)}
        ${lgSel(`db-fc-v-${i}`, 'Value', c.field ? 'Choose a value' : 'Choose a field first', c.field ? FILTERS[c.field][1].map(v => [v, v]) : [], c.value, 'value', i, er.value)}
        ${Object.keys(er).length ? `<p class="fp-error">Complete every part of this condition.</p>` : ''}
      </div>`; }).join('');
    const done = fl.conds.filter(c => c.field && c.op && c.value), tag = t => `<span class="lg-tag">${esc(t)}</span>`;
    const summary = done.length ? `<div class="lg-summary" aria-label="Summary">${done.map((c, i) => `${i ? '<p class="lg-and-s">And</p>' : ''}<p class="lg-sum-row"><span class="lg-if-s">If</span> ${tag(FILTERS[c.field][0])} ${OPS.find(o => o[0] === c.op)[2]} ${tag(c.value)}</p>`).join('')}
      <p class="lg-sum-row lg-then">Then count the record in ${tag(fl.w.title || TYPES[fl.w.type].name)}</p></div>` : '';
    $('db-flt-body').innerHTML = conds + summary;
    if (focusSel) $('db-flt-dlg').querySelector(focusSel)?.focus();
  }
  function openFilter(w, index, opener) {
    const f = index >= 0 ? w.filters[index] : null;
    fl = { w, index, opener, saved: false, errors: [], conds: f && f.conds.length ? JSON.parse(JSON.stringify(f.conds.slice(0, 1))) : [blank()] };   // one condition per filter
    $('db-flt-t').textContent = f ? `Edit ${f.name}` : 'Add Filter';
    flRender(); $('db-flt-dlg').showModal(); $('db-fc-f-0')?.focus();
  }
  $('db-flt-body').addEventListener('change', e => {
    const k = e.target.dataset.k; if (!k || !fl) return;
    const i = +e.target.dataset.i, c = fl.conds[i]; c[k] = e.target.value; if (k === 'field') c.value = '';
    if (fl.errors[i]) delete fl.errors[i][k];
    flRender('#' + e.target.id);
  });
  $('db-flt-body').addEventListener('click', e => {
    if (e.target.closest('#db-fc-add')) { fl.conds.push(blank()); flRender(`#db-fc-f-${fl.conds.length - 1}`); S.announce(`Condition ${fl.conds.length} added.`); return; }
    const d = e.target.closest('[data-delc]'); if (d) { const i = +d.dataset.delc; fl.conds.splice(i, 1); fl.errors.splice(i, 1); flRender(`#db-fc-f-${Math.max(0, i - 1)}`); S.announce(`Condition ${i + 1} deleted.`); }
  });
  $('db-flt-form').addEventListener('submit', e => {
    e.preventDefault();
    fl.errors = fl.conds.map(c => Object.fromEntries(['field', 'op', 'value'].filter(k => !c[k]).map(k => [k, 1])));
    const bad = fl.errors.findIndex(er => Object.keys(er).length);
    if (bad >= 0) { flRender(); $('db-flt-dlg').querySelector(`[data-k="${Object.keys(fl.errors[bad])[0]}"][data-i="${bad}"]`)?.focus(); S.announce(`Complete every part of condition ${bad + 1}.`); return; }
    snap(); const list = normFilters(fl.w);
    if (fl.index >= 0) list[fl.index].conds = fl.conds; else list.push({ name: `Filter ${list.length + 1}`, conds: fl.conds });
    const name = fl.index >= 0 ? list[fl.index].name : list[list.length - 1].name;
    fl.saved = true; $('db-flt-dlg').close(); drawGrid(); openItem(false); $('db-add-filter')?.focus(); S.announce(`${name} saved.`);
  });
  $('db-flt-dlg').querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => $('db-flt-dlg').close()));
  $('db-flt-dlg').addEventListener('click', e => { if (e.target === $('db-flt-dlg')) $('db-flt-dlg').close(); });
  $('db-flt-dlg').addEventListener('close', () => { if (fl && !fl.saved && fl.opener && document.contains(fl.opener)) fl.opener.focus(); });

  /* ---------- Changes ---------- */
  function redraw(focusSel) {
    const a = document.activeElement, aid = a && a.id;
    drawGrid(); if (selId && W(selId)) openItem(false); else { selId = null; closeItem(); }
    if (focusSel) grid.querySelector(focusSel)?.focus(); else if (aid && $(aid) && a !== $(aid)) $(aid).focus();
  }
  /* Undo / redo: a snapshot before every change */
  const past = [], future = [];
  function snap() { past.push(JSON.stringify(data)); if (past.length > 60) past.shift(); future.length = 0; undoState(); }
  function undoState() { const u = $('db-undo'), r = $('db-redo'); if (u) u.disabled = !past.length; if (r) r.disabled = !future.length; }
  function restore(from, to, word) {
    setTimeout(undoState);
    if (!from.length) { S.announce(`Nothing to ${word.toLowerCase()}.`); return; }
    to.push(JSON.stringify(data)); data = JSON.parse(from.pop());
    if (selId && !W(selId)) selId = null;
    drawTitle(); redraw(selId ? `[data-sel="${selId}"]` : '');
    if (!selId) (grid.querySelector('.db-sel') || document.querySelector('.db-pal-item'))?.focus();
    S.announce(`${word} done.`);
  }
  /* Adding (click, drag or keyboard) always asks the data source and title; the last data source chosen is preselected */
  let lastSrc = 'all', pending = null;
  const srcDlg = $('db-src-dlg'), srcTitle = $('db-src-title'), srcErr = $('db-src-title-e');
  const titleErr = msg => { srcErr.textContent = msg; if (msg) srcTitle.setAttribute('aria-invalid', 'true'); else srcTitle.removeAttribute('aria-invalid'); };
  function add(type, at = data.widgets.length, preset) {
    pending = { type, at, preset, opener: document.activeElement };
    $('db-src-sel').value = lastSrc;
    srcTitle.value = '';   // no default title: the user names every visualisation
    titleErr('');
    srcDlg.showModal(); $('db-src-sel').focus();
  }
  // Titles always start with a capital letter (caret position kept)
  const capFirst = el => { const v = el.value, i = v.search(/\S/); if (i < 0 || v[i] === v[i].toUpperCase()) return;
    const a = el.selectionStart, b = el.selectionEnd; el.value = v.slice(0, i) + v[i].toUpperCase() + v.slice(i + 1); el.setSelectionRange(a, b); };
  srcTitle.addEventListener('input', () => { capFirst(srcTitle); if (srcTitle.value.trim()) titleErr(''); });
  $('db-src-form').addEventListener('submit', e => {
    e.preventDefault(); const p0 = pending; if (!p0) return;
    const title = srcTitle.value.trim();
    if (!title) { titleErr('Enter a title for this visualisation.'); srcTitle.focus(); return; }
    pending = null; lastSrc = $('db-src-sel').value; srcDlg.close();
    place(p0.type, p0.at, p0.preset, lastSrc, title);
  });
  srcDlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => srcDlg.close()));
  srcDlg.addEventListener('click', e => { if (e.target === srcDlg) srcDlg.close(); });
  srcDlg.addEventListener('close', () => { if (pending) { const o = pending.opener; pending = null; o && document.contains(o) && o.focus(); } });
  function place(type, at, preset, module, title) {
    snap();
    const w = make(type, { module, ...(preset != null && PRESETS[+preset] ? PRESETS[+preset][1] : {}), ...(title ? { title } : {}) }); data.widgets.splice(at, 0, w); selId = w.id; tab = 'data';
    redraw(`[data-sel="${w.id}"]`); grid.querySelector(`[data-w="${w.id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const msg = `${w.title} added from ${MODULES[module]}`;
    S.toast(msg); S.announce(`${msg}. Its properties are open on the right. You can change the data source in its Data tab.`);
  }
  function copy(id) {
    const i = data.widgets.findIndex(w => w.id === id), src = data.widgets[i];
    snap(); const c = JSON.parse(JSON.stringify(src)); c.id = nid(); c.title = `${src.title} (copy)`.slice(0, LIMIT.title);
    data.widgets.splice(i + 1, 0, c); selId = c.id; redraw(`[data-sel="${c.id}"]`); S.announce(`${c.title} added after ${src.title}.`);
  }
  function move(from, to, focus = 'grip') {
    if (to < 0 || to >= data.widgets.length || to === from) return;
    snap(); const [w] = data.widgets.splice(from, 1); data.widgets.splice(to, 0, w);
    redraw(focus === 'grip' ? `[data-grip="${to}"]` : `[data-sel="${w.id}"]`);
    S.announce(`${w.title} moved to place ${to + 1} of ${data.widgets.length}.`);
  }
  // Delete (Studio confirm popup)
  const conf = $('db-confirm'); let confOk = null, confBack = null;
  // Delete straight away (no confirm popup on the dashboard); focus moves to the next visualisation
  function askDelete(id) {
    const w = W(id); if (!w) return;
    snap(); const i = data.widgets.indexOf(w); data.widgets.splice(i, 1); if (selId === id) selId = null; redraw();
    const next = data.widgets[Math.min(i, data.widgets.length - 1)];
    (next ? grid.querySelector(`[data-sel="${next.id}"]`) : document.querySelector('.db-pal-item'))?.focus();
    S.announce(`${w.title} deleted.`);
  }
  $('db-pfc-ok').addEventListener('click', () => { const f = confOk; confOk = null; conf.close(); f && f(); });
  conf.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => conf.close()));
  conf.addEventListener('click', e => { if (e.target === conf) conf.close(); });
  conf.addEventListener('close', () => { if (confOk === null) return; confOk = null; confBack && document.contains(confBack) && confBack.focus(); });

  /* ---------- Move menu (the click / keyboard alternative to dragging) ---------- */
  let menu = null;
  function closeMenu(refocus) { if (!menu) return; const g = menu.grip; menu.el.remove(); g.setAttribute('aria-expanded', 'false'); menu = null; if (refocus) g.focus(); }
  function openMenu(g) {
    const was = menu && menu.grip === g; closeMenu(false); if (was) return;
    const i = +(g.dataset.grip ?? g.dataset.rsz), n = data.widgets.length, sizeMenu = g.hasAttribute('data-rsz');
    const items = [['Move left', i - 1, i === 0], ['Move right', i + 1, i === n - 1], ['Move to first place', 0, i === 0], ['Move to last place', n - 1, i === n - 1]];
    const w = data.widgets[i], wi = ORDER.indexOf(w.w), hs = Object.keys(HEIGHTS), hi = hs.indexOf(w.h), chart = TYPES[w.type].kind !== 'kpi';
    const sizes = [['Make wider', 'w+', wi === ORDER.length - 1], ['Make narrower', 'w-', wi === 0]].concat(chart ? [['Make taller', 'h+', hi === hs.length - 1], ['Make shorter', 'h-', hi === 0]] : []);
    const el = document.createElement('div'); el.className = 'move-menu'; el.setAttribute('role', 'menu'); el.setAttribute('aria-label', `${sizeMenu ? 'Resize' : 'Move'} ${w.title}`);
    el.innerHTML = sizeMenu   // ⋮⋮ = move only; the Resize button = sizes (click alternative to dragging the handles, WCAG 2.5.7)
      ? sizes.map(([t, sz, dis]) => `<button type="button" role="menuitem" data-size="${sz}"${dis ? ' aria-disabled="true"' : ''} tabindex="-1">${t}</button>`).join('')
      : items.map(([t, to, dis]) => `<button type="button" role="menuitem" data-to="${to}"${dis ? ' aria-disabled="true"' : ''} tabindex="-1">${t}</button>`).join('');
    g.parentElement.appendChild(el); g.setAttribute('aria-expanded', 'true'); menu = { el, grip: g, from: i };
    el.querySelector('[role="menuitem"]:not([aria-disabled])')?.focus();
  }
  grid.addEventListener('keydown', e => {
    if (!menu || !menu.el.contains(e.target)) return;
    const its = [...menu.el.querySelectorAll('[role^="menuitem"]')]; let k = its.indexOf(e.target);
    if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeMenu(true); return; }
    if (e.key === 'ArrowDown') k = (k + 1) % its.length; else if (e.key === 'ArrowUp') k = (k - 1 + its.length) % its.length;
    else if (e.key === 'Home') k = 0; else if (e.key === 'End') k = its.length - 1; else return;
    e.preventDefault(); its[k].focus();
  });
  document.addEventListener('click', e => { if (menu && !menu.el.contains(e.target) && !menu.grip.contains(e.target)) closeMenu(false); });

  grid.addEventListener('click', e => {
    const t = e.target;
    const it = t.closest('.move-menu [role^="menuitem"]');
    if (it) { if (it.getAttribute('aria-disabled') === 'true') return; const from = menu.from; closeMenu(false);
      if (it.dataset.size) return resizeBy(data.widgets[from], it.dataset.size);
      return move(from, +it.dataset.to); }
    const g = t.closest('[data-grip], [data-rsz]'); if (g) return openMenu(g);
    const c = t.closest('[data-copy]'); if (c) return copy(c.dataset.copy);
    const d = t.closest('[data-del]'); if (d) return askDelete(d.dataset.del, d);
    if (preview) return;
    const mb = t.closest('[data-mod]');
    if (mb) { tab = 'data'; select(mb.dataset.mod, { keepTab: true }); $('db-module')?.focus(); return; }
    const card = t.closest('.db-card'); if (card) select(card.dataset.w, { focusPanel: false });
  });
  function resizeBy(w, sz) {
    snap();
    if (sz[0] === 'w') { const k = ORDER.indexOf(w.w); w.w = ORDER[Math.max(0, Math.min(ORDER.length - 1, (k < 0 ? 2 : k) + (sz[1] === '+' ? 1 : -1)))]; }
    else { const hs = Object.keys(HEIGHTS), k = hs.indexOf(w.h); w.h = hs[Math.max(0, Math.min(hs.length - 1, k + (sz[1] === '+' ? 1 : -1)))]; }
    redraw(`[data-sel="${w.id}"]`);
    S.announce(`${w.title} is now ${WIDTHS[w.w].toLowerCase()}${TYPES[w.type].kind !== 'kpi' ? `, ${HEIGHTS[w.h][0].toLowerCase()} height` : ''}.`);
  }
  // Delete key on a selected card's title button
  /* ---------- Keyboard shortcuts ---------- */
  const mod = e => e.ctrlKey || e.metaKey;
  const kbDlg = $('db-kb-dlg'); let kbBack = null;
  function openKb() { kbBack = document.activeElement; kbDlg.showModal(); kbDlg.querySelector('[data-close]').focus(); }
  kbDlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => kbDlg.close()));
  kbDlg.addEventListener('click', e => { if (e.target === kbDlg) kbDlg.close(); });
  kbDlg.addEventListener('close', () => { kbBack && document.contains(kbBack) && kbBack.focus(); });
  const ORDER = [3, 4, 6, 8, 12];
  // On a visualisation (its title button)
  grid.addEventListener('keydown', e => {
    const b = e.target.closest('.db-sel'); if (!b || menu) return;
    const titles = [...grid.querySelectorAll('.db-sel')], i = titles.indexOf(b), id = b.dataset.sel, w = W(id);
    const go = k => { e.preventDefault(); titles[Math.max(0, Math.min(titles.length - 1, k))]?.focus(); };
    if (mod(e) && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && TYPES[w.type].kind !== 'kpi') {
      e.preventDefault(); const hs = Object.keys(HEIGHTS), k = hs.indexOf(w.h), n = hs[Math.max(0, Math.min(hs.length - 1, k + (e.key === 'ArrowDown' ? 1 : -1)))];
      if (n === w.h) { S.announce(e.key === 'ArrowDown' ? 'Already the tallest size.' : 'Already the shortest size.'); return; }
      snap(); w.h = n; redraw(`[data-sel="${id}"]`); S.announce(`${w.title} is now ${HEIGHTS[n][0].toLowerCase()} height.`); return;
    }
    if (mod(e) && e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault(); const k = ORDER.indexOf(w.w), n = ORDER[Math.max(0, Math.min(ORDER.length - 1, (k < 0 ? 2 : k) + (e.key === 'ArrowRight' ? 1 : -1)))];
      if (n === w.w) { S.announce(e.key === 'ArrowRight' ? 'Already full width.' : 'Already the narrowest size.'); return; }
      snap(); w.w = n; redraw(`[data-sel="${id}"]`); S.announce(`${w.title} is now ${WIDTHS[n].toLowerCase()}.`); return;
    }
    if (mod(e) && (e.key === 'ArrowLeft' || e.key === 'ArrowUp')) { e.preventDefault(); if (i === 0) return S.announce('Already first.'); return move(i, i - 1, 'sel'); }
    if (mod(e) && (e.key === 'ArrowRight' || e.key === 'ArrowDown')) { e.preventDefault(); if (i === titles.length - 1) return S.announce('Already last.'); return move(i, i + 1, 'sel'); }
    if (mod(e) && e.key === 'Home') { e.preventDefault(); return move(i, 0, 'sel'); }
    if (mod(e) && e.key === 'End') { e.preventDefault(); return move(i, titles.length - 1, 'sel'); }
    if (mod(e) && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); return copy(id); }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); return askDelete(id, b); }
    if (mod(e)) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') return go(i + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') return go(i - 1);
    if (e.key === 'Home') return go(0);
    if (e.key === 'End') return go(titles.length - 1);
  });
  // Visualisations list: arrow keys between cards
  view.querySelector('.db-palette').addEventListener('keydown', e => {
    const b = e.target.closest('.db-pal-item'); if (!b || mod(e) || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const all = [...view.querySelectorAll('.db-pal-item')], i = all.indexOf(b);
    e.preventDefault(); all[e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : Math.max(0, Math.min(all.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))].focus();
  });
  // Anywhere on the page
  const typing = t => !!(t && t.matches && t.matches('input, textarea, select, [contenteditable="true"]'));
  function areas() {
    return [view.querySelector('.db-pal-item'),
      grid.querySelector(`[data-sel="${selId}"]`) || grid.querySelector('.db-sel') || $('db-page-t'),
      !$('db-item-view').hidden ? $('db-tab-' + tab) : ($('db-items').querySelector('[data-sel]') || $('db-items'))].filter(Boolean);
  }
  document.addEventListener('keydown', e => {
    if (view.hidden || document.querySelector('dialog[open]')) return;
    const t = e.target;
    if (mod(e) && e.key === '/') { e.preventDefault(); return openKb(); }
    if (mod(e) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); return $('db-save').click(); }
    if (mod(e) && !typing(t) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) { e.preventDefault(); return restore(past, future, 'Undo'); }
    if (mod(e) && !typing(t) && ((e.key === 'y' || e.key === 'Y') || ((e.key === 'z' || e.key === 'Z') && e.shiftKey))) { e.preventDefault(); return restore(future, past, 'Redo'); }
    if (e.key === 'F6') {
      e.preventDefault(); if (preview) return;
      const a = areas(), now = a.findIndex(x => x.closest('.db-palette, .db-main, .db-panel') === t.closest('.db-palette, .db-main, .db-panel'));
      a[(now + (e.shiftKey ? -1 : 1) + a.length) % a.length].focus(); return;
    }
    if (e.key === 'Escape' && !menu) {
      if (preview) { e.preventDefault(); return $('db-view').click(); }
      if (selId && !(t.tagName === 'SELECT')) { e.preventDefault(); const id = selId; select(null); (grid.querySelector(`[data-sel="${id}"]`))?.focus(); S.announce('Item Properties closed.'); }
    }
  });

  /* ---------- Resize: drag the bottom-right corner (snaps to the grid widths and the chart heights) ---------- */
  // Right edge = width, bottom edge = height (charts), corner = both. While dragging, a dashed outline shows the size the card
  // will snap to, with its name; the card and its neighbours only change when the pointer is released.
  let rs = null;
  grid.addEventListener('pointerdown', e => {
    const hd = e.target.closest('[data-rs]'); if (!hd || preview) return;
    e.preventDefault(); e.stopPropagation();
    const card = hd.closest('.db-card'), w = W(hd.dataset.rs), r = card.getBoundingClientRect();
    const gs = getComputedStyle(grid), gap = parseFloat(gs.columnGap) || 16, col = (grid.clientWidth - parseFloat(gs.paddingLeft) - parseFloat(gs.paddingRight) - gap * 11) / 12;
    const ch = card.querySelector('.db-chart'), chartH = ch ? ch.getBoundingClientRect().height : 0;
    const ghost = document.createElement('div'); ghost.className = 'db-ghost'; ghost.setAttribute('aria-hidden', 'true');
    card.appendChild(ghost);
    const tag = document.createElement('div'); tag.className = 'db-ghost-l'; tag.setAttribute('aria-hidden', 'true'); document.body.appendChild(tag);   // follows the pointer, above every header
    rs = { w, card, ghost, tag, px: e.clientX, py: e.clientY, axis: hd.dataset.axis || 'xy', x: e.clientX, y: e.clientY, width: r.width, height: r.height, col, gap, chartH,
           isChart: !!ch && TYPES[w.type].kind !== 'kpi', span: w.w, h: w.h };
    hd.setPointerCapture(e.pointerId); card.classList.add('is-resizing'); document.body.classList.add('db-resizing-' + rs.axis);
    grid.style.setProperty('--db-col', col + 'px'); grid.style.setProperty('--db-gap', gap + 'px'); grid.classList.add('db-cols');   // show the 12 columns
    select(w.id, { keepTab: true }); paintGhost();
  });
  function paintGhost() {
    const { ghost, tag, span, h, col, gap, height, isChart, w } = rs;
    ghost.style.width = (span * col + (span - 1) * gap) + 'px';
    ghost.style.height = (isChart ? height + HEIGHTS[h][1] - HEIGHTS[w.h][1] : height) + 'px';   // grows / shrinks from the card's current height
    tag.textContent = WIDTHS[span] + (isChart ? ' · ' + HEIGHTS[h][0] : '');
    const same = span === w.w && h === w.h; ghost.classList.toggle('is-same', same); tag.classList.toggle('is-same', same);
    const tw = tag.offsetWidth, th = tag.offsetHeight;
    tag.style.left = Math.min(innerWidth - tw - 8, rs.px + 16) + 'px'; tag.style.top = Math.min(innerHeight - th - 8, rs.py + 18) + 'px';
  }
  grid.addEventListener('pointermove', e => {
    if (!rs) return; rs.px = e.clientX; rs.py = e.clientY;
    if (rs.axis !== 'y') {
      const want = (rs.width + e.clientX - rs.x + rs.gap) / (rs.col + rs.gap);
      rs.span = ORDER.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a));
    }
    if (rs.axis !== 'x' && rs.isChart) {
      const hh = HEIGHTS[rs.w.h][1] + e.clientY - rs.y;
      rs.h = Object.keys(HEIGHTS).reduce((a, b) => (Math.abs(HEIGHTS[b][1] - hh) < Math.abs(HEIGHTS[a][1] - hh) ? b : a));
    }
    paintGhost();
  });
  const endResize = () => {
    if (!rs) return; const { w, span, h, card, ghost, tag, axis } = rs; rs = null;
    ghost.remove(); tag.remove(); card.classList.remove('is-resizing'); document.body.classList.remove('db-resizing-' + axis); grid.classList.remove('db-cols');
    if (span === w.w && h === w.h) return;
    snap(); w.w = span; w.h = h; redraw(`[data-sel="${w.id}"]`);
    S.announce(`${w.title} resized to ${WIDTHS[span].toLowerCase()}${TYPES[w.type].kind !== 'kpi' ? `, ${HEIGHTS[h][0].toLowerCase()} height` : ''}.`);
  };
  grid.addEventListener('pointerup', endResize); grid.addEventListener('pointercancel', endResize);

  /* ---------- Drag: palette → dashboard, and grip → new place (pointer only; click / Move menu do the same) ---------- */
  let drag = null; const ph = document.createElement('div'); ph.className = 'db-drop'; ph.setAttribute('aria-hidden', 'true');
  view.addEventListener('dragstart', e => {
    const p = e.target.closest('[data-add]'), g = e.target.closest('[data-grip]'), card = e.target.closest?.('.db-card');
    if (p) { ph.style.minHeight = ''; drag = { add: p.dataset.add, preset: p.dataset.preset, span: TYPES[p.dataset.add].kind === 'kpi' ? 3 : 6 }; }
    else if (card && !preview) {   // drag by the ⋮⋮ grip OR anywhere on the card (not its other buttons / resize handles)
      if (!g && e.target.closest('button, a, input, select, textarea, [data-rs]')) { e.preventDefault(); return; }
      const i = data.widgets.findIndex(x => x.id === card.dataset.w); drag = { from: i, span: data.widgets[i].w }; closeMenu(false);
      const r = card.getBoundingClientRect();
      e.dataTransfer.setDragImage(card, Math.max(0, e.clientX - r.left), Math.max(0, e.clientY - r.top)); setTimeout(() => { ph.style.setProperty('--span', drag.span); ph.style.minHeight = r.height + 'px'; card.before(ph); card.classList.add('is-dragging'); }); }
    else return;
    e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'db');
    ph.style.setProperty('--span', drag.span);
  });
  function dropIndex(x, y) {
    const cards = [...grid.querySelectorAll('.db-card:not(.is-dragging)')];
    for (let k = 0; k < cards.length; k++) { const r = cards[k].getBoundingClientRect();
      if (y < r.top) return k; if (y <= r.bottom && x < r.left + r.width / 2) return k; }
    return cards.length;
  }
  grid.addEventListener('dragover', e => {
    if (!drag) return; e.preventDefault(); grid.classList.add('is-over');
    const k = dropIndex(e.clientX, e.clientY), cards = [...grid.querySelectorAll('.db-card:not(.is-dragging)')];
    grid.querySelector('.db-empty')?.remove();
    if (cards[k]) { if (ph.nextElementSibling !== cards[k]) grid.insertBefore(ph, cards[k]); } else if (grid.lastElementChild !== ph) grid.appendChild(ph);
    drag.at = k;
  });
  grid.addEventListener('dragleave', e => { if (drag && !grid.contains(e.relatedTarget)) { ph.remove(); grid.classList.remove('is-over'); if (!data.widgets.length) drawGrid(); } });
  grid.addEventListener('drop', e => {
    if (!drag) return; e.preventDefault(); ph.remove(); grid.classList.remove('is-over');
    const d = drag; drag = null; let at = d.at ?? data.widgets.length;
    if (d.add) return add(d.add, at, d.preset);
    move(d.from, at > d.from ? at : at, 'sel');   // index counted without the dragged card
  });
  view.addEventListener('dragend', () => { grid.querySelectorAll('.is-dragging').forEach(c => c.classList.remove('is-dragging')); if (!drag) return; drag = null; ph.remove(); grid.classList.remove('is-over'); grid.querySelectorAll('.is-dragging').forEach(c => c.classList.remove('is-dragging')); if (!data.widgets.length) drawGrid(); });

  // Palette click = add at the end
  // Clicking the empty grey canvas (not a visualisation, menu or control) deselects
  $('db-main').addEventListener('click', e => {
    if (preview || !selId || e.target.closest('.db-card, .move-menu, button, a, input, select, textarea, label')) return;
    select(null); S.announce('Visualisation deselected.');
  });
  view.querySelector('.db-palette').addEventListener('click', e => { const p = e.target.closest('[data-add]'); if (p) add(p.dataset.add, undefined, p.dataset.preset); });

  /* ---------- Right panel events ---------- */
  $('db-items').addEventListener('focusin', e => { if (e.target.dataset.dk) snap(); });
  $('db-items').addEventListener('input', e => {
    const k = e.target.dataset.dk; if (!k) return; data[k] = e.target.value;
    const c = $('db-items').querySelector(`[data-dcnt="${k}"]`); if (c) c.innerHTML = `${e.target.value.length}/${DL[k]}<span class="sr-only"> characters</span>`;
    drawTitle();
  });
  $('db-items').addEventListener('click', e => {
    const rm = e.target.closest('[data-rmitem]');
    if (rm) { const ids = data.widgets.map(w => w.id), i = ids.indexOf(rm.dataset.rmitem); askDelete(rm.dataset.rmitem);
      const items = [...$('db-items').querySelectorAll('[data-rmitem]')]; (items[Math.min(i, items.length - 1)] || document.querySelector('.db-pal-item'))?.focus(); }
  });
  $('db-items').addEventListener('click', e => { if (e.target.closest('[data-rmitem]')) return; const b = e.target.closest('[data-sel]'); if (b) { select(b.dataset.sel, { focusPanel: true }); grid.querySelector(`[data-w="${b.dataset.sel}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } });
  const iv = $('db-item-view');
  iv.addEventListener('click', e => {
    const t = e.target, w = W(selId); if (!w) return;
    if (t.closest('#db-item-back')) { const id = selId; select(null); $('db-items').querySelector(`[data-sel="${id}"]`)?.focus(); return; }
    const tb = t.closest('[data-tab]'); if (tb) { tab = tb.dataset.tab; openItem(true); return; }
    const s = t.closest('[data-sw]'); if (s) { snap(); w[s.dataset.sw] = !w[s.dataset.sw]; drawGrid(); openItem(false); iv.querySelector(`[data-sw="${s.dataset.sw}"]`)?.focus(); return; }
    if (t.closest('#db-add-filter')) return openFilter(w, -1, t.closest('#db-add-filter'));
    const ef = t.closest('[data-editf]'); if (ef) return openFilter(w, +ef.dataset.editf, ef);
    const rf = t.closest('[data-rmf]'); if (rf) { snap(); const [f] = w.filters.splice(+rf.dataset.rmf, 1); drawGrid(); openItem(false); (iv.querySelector('[data-editf]') || $('db-add-filter'))?.focus(); S.announce(`${f.name} deleted.`); }
  });
  iv.addEventListener('keydown', e => {
    const tb = e.target.closest('[data-tab]'); if (!tb || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); tab = tab === 'data' ? 'display' : 'data'; openItem(true);
  });
  iv.addEventListener('change', e => {
    const t = e.target, w = W(selId); if (!w) return;
    if (t.dataset.chk) { snap(); w[t.dataset.chk] = t.checked; const k2 = t.dataset.chk; drawGrid(); openItem(false); iv.querySelector(`[data-chk="${k2}"]`)?.focus(); return; }
    if (!t.matches('input[type="text"], textarea')) snap();
    if (t.hasAttribute('data-run')) w.running = t.value === 'running';
    else if (t.dataset.k) { w[t.dataset.k] = t.dataset.k === 'w' ? +t.value : t.dataset.k === 'upGood' ? t.value === 'good' : t.value; }
    else if (t.hasAttribute('data-style')) w.type = t.value;
    else return;
    const id = t.id; drawGrid(); openItem(false); $(id)?.focus();
  });
  iv.addEventListener('focusin', e => { if (e.target.matches('input[type="text"], textarea')) snap(); });
  iv.addEventListener('input', e => {
    const t = e.target, w = W(selId); if (!w || !['title', 'desc', 'xLabel', 'yLabel'].includes(t.dataset.k)) return;
    if (t.dataset.k === 'title') capFirst(t);
    w[t.dataset.k] = t.value;
    const c = iv.querySelector(`[data-cnt="${t.dataset.k}"]`); if (c) c.innerHTML = `${t.value.length}/${LIMIT[t.dataset.k]}<span class="sr-only"> characters</span>`;
    const card = grid.querySelector(`[data-w="${w.id}"]`);
    if (t.dataset.k === 'title') { card.querySelector('.db-sel').textContent = t.value || TYPES[w.type].name; }
    else { const y = card.outerHTML; card.outerHTML = cardHTML(w, data.widgets.indexOf(w)); drawCharts(); }
  });

  /* ---------- Name, View, Save ---------- */
  /* dashboard title / description are edited in the right panel (like the form's section heading) */
  $('db-view').addEventListener('click', () => {
    preview = !preview; view.classList.toggle('db-previewing', preview);
    $('db-view').innerHTML = preview ? `${I.pencil} Back to Editing` : `${I.eye} Preview Dashboard`;
    if (preview) selId = null;
    $('db-range').hidden = !preview;
    drawTitle(); drawGrid(); closeItem(); $('db-view').focus();
    S.announce(preview ? 'Showing the dashboard as viewers will see it.' : 'Back to editing the dashboard.');
  });
  /* Date range (Preview Dashboard only): what viewers use to pick the period */
  $('db-range-sel').addEventListener('change', e => {
    range = e.target.value; view.querySelectorAll('[data-custom]').forEach(x => { x.hidden = range !== 'custom'; });
    drawGrid(); if (range === 'custom') $('db-range-from').focus();
    S.announce(range === 'custom' ? 'Choose the start and end dates.' : `Showing ${RANGES[range][0].toLowerCase()}.`);
  });
  ['db-range-from', 'db-range-to'].forEach(id => $(id).addEventListener('change', e => {
    if (id === 'db-range-from') rFrom = e.target.value; else rTo = e.target.value;
    if (rFrom && rTo) { drawGrid(); S.announce(`Showing ${rFrom} to ${rTo}.`); }
  }));
  $('db-save').addEventListener('click', () => { save(); S.toast('Dashboard saved successfully'); S.announce('Dashboard saved.'); });

  window.StudioDashboard = {
    render(focus) {
      preview = false; view.classList.remove('db-previewing'); $('db-range').hidden = true; $('db-view').innerHTML = `${I.eye} Preview Dashboard`;
      selId = null; drawTitle(); drawGrid(); closeItem();
      if (focus) $('db-page-t').focus();
    },
  };
})();
