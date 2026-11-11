/* ==========================================================
   Manage Documents — Studio Prototype
   Route: #/module/<id>/documents. One list per module.
   Flow:  Create New Document → popup "How would you like to create your document?"
            • Predefined Document Template → full screen "Choose a document template" → template editor
              (no left panel: page preview + Document Properties with Header / Body / Footer elements)
            • Upload Your Own Design → full screen "Choose a document category" → name popup → uploader
              (left: uploaded pages — reorder by drag or Move up / Move down, delete, add more;
               centre: page preview; right: state, QR Code, Dynamic Variable + personalization variables)
   Dashboard cards: page thumbnail · name · process flow state tag · type tag · Delete | Copy · Edit
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.documents.v1';
  const STATES = ['Pending for Verification', 'Pending for Field Inspect', 'Payment Stage 1 - Paid', 'Approved',
                  'Manual Expired', 'Terminated', 'Auto Expired', 'Due for Renewal'];
  const KINDS = { TEMPLATE: 'Predefined template', UPLOAD: 'Uploaded design' };
  const CATS = {
    application: ['Application Details', 'Create an application summary containing applicant details, submitted information, and application status'],
    certificate: ['Certificate', 'Design an official certificate issued upon approval, including configurable fields, branding, and QR codes'],
    invoice: ['Invoice / Receipt', 'Generate payment receipts/ invoices with transaction details and payment information'],
    demand: ['Demand / Bill', 'Create demand notices/ bills outlining fees, taxes, dues, due dates, and payment instructions'],
  };
  // Document elements per template: Header + Body (varies) + Footer. [key, label, required]
  const HEADER = [['logo', 'Logo', true], ['orgName', 'Organization Name'], ['orgAddr', 'Organization Address'], ['appNo', 'Application Number']];
  const FOOTER = [['qr', 'QR Code'], ['note', 'Bottom note']];
  const BODY = {
    application: [['applicant', 'Applicant Details'], ['submitted', 'Submitted Information'], ['status', 'Application Status']],
    certificate: [['certTitle', 'Certificate Title'], ['recipient', 'Recipient Details'], ['certText', 'Certificate Text'], ['signature', 'Signature']],
    invoice: [['payer', 'Payer Details'], ['payment', 'Payment Details'], ['txn', 'Transaction Details']],
    demand: [['bill', 'Bill Details'], ['section2', 'Section 2']],
  };
  const groups = cat => [['Header', HEADER], ['Body', BODY[cat]], ['Footer', FOOTER]];
  const allOn = cat => Object.fromEntries(groups(cat).flatMap(([, els]) => els.map(([k]) => [k, true])));
  const VARIABLES = ['Application Number', 'Submission Date', 'Current State', 'Name', 'Mobile Number', 'Email',
                     'Street Name', 'Pincode', 'Business Name', 'Established Date', 'Contact'];

  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); return true; } catch (e) { return false; } };
  let uid = 0; const nid = () => 'd' + Date.now().toString(36) + (uid++);

  // A plain page image for the seeded "uploaded design" (stands in for a real upload)
  const svgPage = title => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
    <rect width="595" height="842" fill="#fff"/><rect x="48" y="48" width="56" height="56" fill="#0B4B9C"/>
    <text x="76" y="81" font-family="Arial" font-size="11" fill="#fff" text-anchor="middle">LOGO</text>
    <text x="48" y="150" font-family="Georgia" font-size="26" font-weight="bold" fill="#1F1F1F">${title}</text>
    <rect x="48" y="176" width="300" height="8" fill="#E0E0E0"/><rect x="48" y="194" width="240" height="8" fill="#E0E0E0"/>
    <rect x="48" y="250" width="499" height="1" fill="#C9C9C9"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="48" y="${280 + i * 40}" width="150" height="8" fill="#E8E8E8"/><rect x="230" y="${280 + i * 40}" width="317" height="8" fill="#F0F0F0"/>`).join('')}
    <rect x="48" y="560" width="499" height="120" fill="none" stroke="#C9C9C9"/>
    <text x="64" y="590" font-family="Arial" font-size="13" fill="#505A5F">Inspector remarks</text>
    <rect x="48" y="760" width="160" height="1" fill="#9E9E9E"/><text x="48" y="780" font-family="Arial" font-size="11" fill="#505A5F">Inspector signature</text></svg>`);
  const seed = () => [
    { id: nid(), name: 'Trade licence certificate', kind: 'TEMPLATE', cat: 'certificate', state: 'Approved', els: allOn('certificate') },
    { id: nid(), name: 'Application acknowledgement', kind: 'TEMPLATE', cat: 'application', state: 'Pending for Verification', els: { ...allOn('application'), note: false } },
    { id: nid(), name: 'Field inspection report', kind: 'UPLOAD', cat: 'application', state: 'Pending for Field Inspect',
      pages: [{ src: svgPage('Field Inspection Report'), label: 'Inspection report' }], qr: true, varsOn: true,
      vars: [{ page: 0, name: 'Application Number', x: 360, y: 72 }, { page: 0, name: 'Name', x: 230, y: 276 }] },
  ];

  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    left: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plusW: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    pencilL: '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    copy: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
    trash: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trashS: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    closeS: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    leftS: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    rightS: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    plusL: '<svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    dots: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
    lock: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    plusSq: '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
    up: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    grip: '<svg aria-hidden="true" focusable="false" width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg>',   // same dots as the form builder's Section fields cards
    plus: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
    upload: '<svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"/></svg>',
    info: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    tplTile: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor"/><path d="M8 7h8M8 11h8M8 15h5" fill="none" class="ntw-ico-cut" stroke-width="1.8" stroke-linecap="round"/></svg>',
    upTile: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor"/><path d="M12 16V8M8.5 11.5 12 8l3.5 3.5" fill="none" class="ntw-ico-cut" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };
  const opts = (list, cur, all) => (all ? `<option value="">${all}</option>` : '') + list.map(([v, t]) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(t)}</option>`).join('');
  const tip = (id, label, text) => `<span class="tip"><button type="button" class="tip-btn" aria-label="About ${label}" aria-describedby="${id}">${I.info}</button><span class="tip-bubble" role="tooltip" id="${id}">${text}</span></span>`;
  const tok = t => `<span class="dp-tok">{${t}}</span>`;

  /* ---------- QR code (decorative pattern) ---------- */
  const QR = (() => {
    const n = 21, cells = [];
    const finder = (x, y) => [[x, y, 7, 7, '#111'], [x + 1, y + 1, 5, 5, '#fff'], [x + 2, y + 2, 3, 3, '#111']];
    let s = 7;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
      s = (s * 31 + x * 7 + y * 13) % 97; if (s % 2) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
    const f = [...finder(0, 0), ...finder(14, 0), ...finder(0, 14)].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`).join('');
    return `<svg viewBox="0 0 21 21" width="100%" height="100%" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><rect width="21" height="21" fill="#fff"/><g fill="#111">${cells.join('')}</g>${f}</svg>`;
  })();

  /* ---------- Page rendering (A4, 595 × 842) ----------
       Each template element has editable text (EL_TEXT defaults, saved in d.props[key]) and appearance
       (size, alignment, bold, colour). {Variable} in any text shows as a personalization token. */
  const EL_TEXT = {
    orgName: { text: '' }, orgAddr: { text: '' },
    appNo: { label: 'Application No.', text: '{Application Number}' },
    applicant: { heading: 'Applicant Details' }, submitted: { heading: 'Submitted Information' }, status: { heading: 'Application Status' },
    certTitle: { text: 'Certificate of Registration' },
    recipient: { label: 'This certificate is proudly presented to', text: '{Name}' },
    certText: { text: 'In recognition of the registration of {Business Name}, approved under application {Application Number} on {Submission Date}.' },
    signature: { text: 'Authorised Signatory' },
    payer: { heading: 'Payer Details' }, payment: { heading: 'Payment Details' }, txn: { heading: 'Transaction Details' },
    bill: { heading: 'Bill Details' },
    section2: { heading: 'Section 2', text: 'Pay the amount due before the due date at any service centre or online. Keep this notice for your records.' },
    note: { text: 'This is a system-generated document and does not need a signature.' },
    qr: { link: '' },
  };
  const pv = (d, k, f) => { const x = ((d.props || {})[k] || {})[f]; return x !== undefined ? x : ((EL_TEXT[k] || {})[f] ?? ''); };
  const fmt = t => esc(t).replace(/\{([^{}]{1,40})\}/g, (_, v) => tok(v));
  const row = (k, v) => `<div class="dp-row"><span class="dp-k">${k}</span><span class="dp-v">${v}</span></div>`;
  const H = (d, k) => `<h3 class="dp-h">${fmt(pv(d, k, 'heading'))}</h3>`;
  const BODY_HTML = {
    applicant: d => `${H(d, 'applicant')}${row('Name', tok('Name'))}${row('Mobile Number', tok('Mobile Number'))}${row('Email', tok('Email'))}`,
    submitted: d => `${H(d, 'submitted')}${row('Business Name', tok('Business Name'))}${row('Established Date', tok('Established Date'))}${row('Address', `${tok('Street Name')}, ${tok('Pincode')}`)}`,
    status: d => `${H(d, 'status')}${row('Current State', tok('Current State'))}${row('Submitted On', tok('Submission Date'))}`,
    certTitle: d => `<p class="dp-cert-title">${fmt(pv(d, 'certTitle', 'text'))}</p>`,
    recipient: d => `<p class="dp-cert-sub">${fmt(pv(d, 'recipient', 'label'))}</p><p class="dp-cert-name">${fmt(pv(d, 'recipient', 'text'))}</p>`,
    certText: d => `<p class="dp-p">${fmt(pv(d, 'certText', 'text'))}</p>`,
    signature: d => `<div class="dp-sign"><span class="dp-sign-line"></span><span>${fmt(pv(d, 'signature', 'text'))}</span></div>`,
    payer: d => `${H(d, 'payer')}${row('Name', tok('Name'))}${row('Mobile Number', tok('Mobile Number'))}`,
    payment: d => `${H(d, 'payment')}<table class="dp-table"><tr><th>Description</th><th>Amount</th></tr><tr><td>Licence fee</td><td>₹500</td></tr><tr><td>Processing fee</td><td>₹50</td></tr><tr class="dp-total"><td>Total paid</td><td>₹550</td></tr></table>`,
    txn: d => `${H(d, 'txn')}${row('Transaction ID', tok('Transaction ID'))}${row('Payment Mode', 'Online')}${row('Paid On', tok('Submission Date'))}`,
    bill: d => `${H(d, 'bill')}<table class="dp-table"><tr><th>Description</th><th>Amount</th></tr><tr><td>Licence fee</td><td>₹500</td></tr><tr><td>Late fee</td><td>₹50</td></tr><tr class="dp-total"><td>Total due</td><td>₹550</td></tr></table>${row('Due Date', tok('Due Date'))}`,
    section2: d => `${H(d, 'section2')}<p class="dp-p">${fmt(pv(d, 'section2', 'text'))}</p>`,
  };
  const SIZE_ZOOM = { S: 0.85, M: 1, L: 1.2 };
  const DEF_ALIGN = { certTitle: 'center', recipient: 'center', certText: 'center', appNo: 'right', signature: 'right' };
  const defAlign = k => DEF_ALIGN[k] || 'left';
  const look = (d, k) => ({ cls: '', style: '' });   // template appearance is locked
  const lookUnused = (d, k) => {
    const a = (d.props || {})[k] || {}, cls = [];
    if (a.align && a.align !== defAlign(k)) cls.push('dp-al-' + a.align);
    if (a.bold) cls.push('dp-b');
    if (a.color && a.color !== 'default') cls.push('dp-c-' + a.color);
    return { cls: cls.length ? ' ' + cls.join(' ') : '', style: a.size && a.size !== 'M' ? ` style="zoom:${SIZE_ZOOM[a.size]}"` : '' };
  };
  function templatePage(d, sel) {
    const on = k => k !== 'qr' || (d.els || {}).qr !== false;
    const el = (k, html) => { if (!on(k)) return ''; const l = look(d, k); return `<div class="dp-el${sel === k ? ' is-sel' : ''}${l.cls}" data-el="${k}"${l.style}>${html}</div>`; };
    const logoSrc = pv(d, 'logo', 'src');
    const head = [el('logo', logoSrc ? `<span class="dp-logo dp-logo-img"><img src="${logoSrc}" alt=""></span>` : '<span class="dp-logo">LOGO</span>'),
      `<div class="dp-org">${el('orgName', `<p class="dp-org-name">${pv(d, 'orgName', 'text') ? esc(pv(d, 'orgName', 'text')) : '<span class="dp-ph">Organization Name</span>'}</p>`)}${el('orgAddr', `<p class="dp-org-addr">${pv(d, 'orgAddr', 'text') ? esc(pv(d, 'orgAddr', 'text')) : '<span class="dp-ph">Organization Address</span>'}</p>`)}</div>`,
      el('appNo', `<p class="dp-appno">${fmt(pv(d, 'appNo', 'label'))}<br>${fmt(pv(d, 'appNo', 'text'))}</p>`)].join('');
    const body = BODY[d.cat].map(([k]) => el(k, BODY_HTML[k](d))).join('');
    const foot = el('note', `<p class="dp-note">${fmt(pv(d, 'note', 'text'))}</p>`) + el('qr', `<span class="dp-qr">${QR}</span>`);
    return `<div class="dp-page dp-cat-${d.cat}">
      <header class="dp-head">${head}</header>
      <div class="dp-body">${body}</div>
      <footer class="dp-foot">${foot}</footer>
    </div>`;
  }
  const FONTS = { Helvetica: 'Helvetica, Arial, sans-serif', Arial: 'Arial, sans-serif', Roboto: 'Roboto, sans-serif',
    'Times New Roman': '"Times New Roman", Times, serif', Georgia: 'Georgia, serif', 'Courier New': '"Courier New", monospace' };
  const WEIGHTS = [['400', 'Regular'], ['500', 'Medium'], ['700', 'Bold']];
  const qrBox = d => (d.qrBox = d.qrBox || { x: 483, y: 730, w: 72, h: 72 });
  const ARW = {
    left: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M15 6 8 12l7 6z"/></svg>',
    up: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M6 15l6-7 6 7z"/></svg>',
    down: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M6 9l6 7 6-7z"/></svg>',
    right: '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor"><path d="M9 6l7 6-7 6z"/></svg>',
  };
  function uploadPage(d, i, live) {
    const p = d.pages[i]; if (!p) return '<div class="dp-page dp-up"></div>';
    const vars = d.varsOn ? (d.vars || []).filter(v => v.page === i) : [];
    const sel = live && W && W.usel, q = qrBox(d);
    const isSel = (t, idx) => sel && sel.t === t && (t === 'qr' || sel.i === idx);
    const st = b => `left:${b.x}px;top:${b.y}px${b.w ? `;width:${b.w}px` : ''}${b.h ? `;height:${b.h}px` : ''}`;
    const vst = v => `left:${v.x}px;top:${v.y}px;font-family:${FONTS[v.font || 'Helvetica']};font-weight:${v.weight || 400};font-size:${v.size || 13}px`;
    let nudge = '';
    if (sel) {
      const bx = sel.t === 'qr' ? (d.qr ? q : null) : d.vars[sel.i];
      if (bx) {
      // keep the arrow bar inside the page: clamp left, and flip above the element if there is no room below
      const z = (W && W.zoom) || 1, bw = 58 / z, bh = 58 / z;   // compact + cross, centred under the element
      const nl = Math.max(0, Math.min(bx.x + (bx.w || 40) / 2 - bw / 2, 595 - bw)), below = bx.y + (bx.h || 24) + 8, nt = below + bh > 842 ? Math.max(0, bx.y - bh - 8) : below;
      if (bx && (sel.t === 'qr' || bx.page === i)) nudge = `<div class="dc-nudge" role="group" aria-label="Move ${sel.t === 'qr' ? 'QR code' : esc(bx.name)}" style="left:${nl}px;top:${nt}px">
        ${[['up', 'Move up'], ['left', 'Move left'], ['right', 'Move right'], ['down', 'Move down']].map(([k, l]) => `<button type="button" data-nudge="${k}" aria-label="${l}">${ARW[k]}</button>`).join('')}</div>`;
      }
    }
    return `<div class="dp-page dp-up"><img src="${p.src}" alt="">
      ${vars.map(v => { const idx = d.vars.indexOf(v); return live
        ? `<button type="button" class="dp-var${isSel('var', idx) ? ' is-sel' : ''}" data-var-i="${idx}" style="${vst(v)}" aria-label="${esc(v.name)} variable. Select to edit it, or use the arrow keys to move it. Press Delete to remove it.">{${esc(v.name)}}</button>`
        : `<span class="dp-var" style="${vst(v)}">{${esc(v.name)}}</span>`; }).join('')}
      ${d.qr ? (live ? `<button type="button" class="dp-qr dp-qr-pos${isSel('qr') ? ' is-sel' : ''}" data-up-qr style="${st(q)}" aria-label="QR code. Select to edit it, or use the arrow keys to move it.">${QR}</button>`
                     : `<span class="dp-qr dp-qr-pos" style="${st(q)}">${QR}</span>`) : ''}
      ${nudge}
      ${sel && nudge ? `<button type="button" class="dc-resize" data-resize aria-label="${sel.t === 'qr' ? 'Resize QR code. Use the arrow keys to change its size.' : `Change the font size of ${esc(d.vars[sel.i].name)}. Use the up and down arrow keys.`}"></button>` : ''}
    </div>`;
  }
  const pageHTML = d => d.kind === 'UPLOAD' ? uploadPage(d, 0, false) : templatePage(d);

  /* ---------- Shell ---------- */
  const view = $('view-documents');
  let mod = null, list = [], screen = 'list', W = null;   // W = the document being created / edited
  const f = { q: '', state: '', kind: '' };
  const subbar = `<div class="subbar">
      <a class="btn btn-secondary" id="dc-back-top" href="#">${I.back} Back to Module Dashboard</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>`;
  const persist = () => { store[mod.id] = list; if (!save()) S.announce('This browser is out of storage space, so the document is kept only until you leave the page.'); };

  // Top-left back: Manage Documents → module dashboard; every later screen → the previous step (same as the footer Back)
  function topBack() {
    const a = $('dc-back-top'); if (!a) return;
    if (screen === 'list') { a.href = '#/module/' + encodeURIComponent(mod.id); return; }
    const b = document.createElement('button');
    b.type = 'button'; b.className = a.className; b.id = 'dc-back-top'; b.innerHTML = `${I.back} Back`;
    b.addEventListener('click', () => view.querySelector('.form-foot .btn-secondary')?.click());
    a.replaceWith(b);
  }
  function setScreen(s) {
    screen = s;
    const full = s === 'template' || s === 'upload';
    view.className = full ? 'form-view dc-editor-view' : 'nt-view dc-view';
    document.body.style.overflow = full && innerWidth >= 1100 ? 'hidden' : '';
    scrollTo(0, 0);
  }

  /* ---------- 1. Dashboard ---------- */
  function showList(focusId) {
    if (pf) { pf = null; return toFlow(); }
    setScreen('list'); W = null;
    view.innerHTML = `${subbar}
    <main class="content nt-main">
      <div class="roles-head">
        <h1 class="page-title" id="dc-title" tabindex="-1">Documents</h1>
        <button type="button" class="btn btn-primary roles-new" id="dc-new" aria-haspopup="dialog">${I.plusW} Create New Document</button>
      </div>
      <section class="section nt-filters" aria-label="Filter documents">
        <div class="nt-filter">
          <label class="nt-label" for="dc-search">Search by document name</label>
          <div class="nt-search"><input class="input" id="dc-search" type="search" autocomplete="off" aria-describedby="dc-count" value="${esc(f.q)}"><span class="rs-ico" aria-hidden="true">${I.search}</span></div>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="dc-state">Process flow state</label>
          <select class="input pf-select nt-select" id="dc-state">${opts(STATES.map(s => [s, s]), f.state, 'All states')}</select>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="dc-kind">Type</label>
          <select class="input pf-select nt-select" id="dc-kind">${opts(Object.entries(CATS).map(([k, [t]]) => [k, t]), f.kind, 'All types')}</select>
        </div>
        <button type="button" class="btn btn-secondary nt-clear nt-clear-btn" id="dc-clear" data-clear-filters disabled>Clear Search</button>
      </section>
      <div class="nt-results" id="dc-results" hidden><p class="nt-count" id="dc-count" role="status"></p></div>
      <ul class="dc-grid" id="dc-list" aria-label="Documents"></ul>
      ${S.emptyState({ id: 'dc-empty', ctaId: 'dc-empty-new', ctaLabel: 'Create New Document' })}
    </main>`;
    topBack();
    $('dc-search').addEventListener('input', e => { f.q = e.target.value; renderList(); });
    $('dc-state').addEventListener('change', e => { f.state = e.target.value; renderList(); });
    $('dc-kind').addEventListener('change', e => { f.kind = e.target.value; renderList(); });
    $('dc-new').addEventListener('click', e => openHow(e.currentTarget));
    $('dc-empty-new').addEventListener('click', e => openHow(e.currentTarget));
    $('dc-list').addEventListener('click', onCardClick);
    renderList();
    const t = focusId && $('dc-list').querySelector(`[data-edit="${focusId}"]`);
    (t || $('dc-title')).focus();
  }
  function renderList() {
    const qq = f.q.trim().toLowerCase();
    const shown = list.filter(d => (!qq || d.name.toLowerCase().includes(qq)) && (!f.state || d.state === f.state) && (!f.kind || d.cat === f.kind));
    $('dc-list').innerHTML = shown.map(d => `
      <li class="nt-card dc-card">
        <div class="dc-thumb" aria-hidden="true"><div class="dc-scale">${pageHTML(d)}</div></div>
        <div class="nt-body dc-body">
          <h2 class="nt-name" id="dc-n-${d.id}">${esc(d.name)}</h2>
          <ul class="nt-tags" aria-label="Details">
            <li class="nt-tag nt-tag-state">${d.state ? esc(d.state) : 'No state selected'}</li>
            <li class="nt-tag nt-tag-type">${CATS[d.cat][0]}</li>
          </ul>
        </div>
        <div class="nt-foot">
          <button type="button" class="nt-del" data-del="${d.id}" aria-describedby="dc-n-${d.id}" aria-haspopup="dialog">${I.trash} Delete</button>
          <span class="nt-right">
            <button type="button" class="btn btn-secondary nt-act" data-dup="${d.id}" aria-describedby="dc-n-${d.id}">${I.copy} Copy</button>
            <button type="button" class="btn btn-secondary nt-act" data-edit="${d.id}" aria-describedby="dc-n-${d.id}" aria-haspopup="dialog">${I.pencil} Edit</button>
          </span>
        </div>
      </li>`).join('');
    $('dc-empty').hidden = shown.length > 0;
    document.querySelector('.nt-filters[aria-label="Filter documents"]').hidden = !list.length;
    $('dc-new').hidden = !list.length;
    if (!shown.length) list.length
      ? S.setEmpty($('dc-empty'), false, 'No results found', 'Nothing matches your search or filters. Check the spelling, or change the filters.')
      : S.setEmpty($('dc-empty'), true, 'No documents yet', 'Create a document, such as a certificate or receipt, that is generated when an application reaches a process flow state.');
    $('dc-count').textContent = (qq || f.state || f.kind) ? `${shown.length} document${shown.length === 1 ? '' : 's'} found.` : '';
    $('dc-results').hidden = !(qq || f.state || f.kind);
    $('dc-clear').disabled = !(qq || f.state || f.kind);
  }
  const LINKED = 'This document is linked to a process flow state. Any change you make here will also be changed in the process flow.';
  const uniqueName = base => { let n = base, k = 2; while (list.some(x => x.name === n)) n = `${base.replace(/ \(copy( \d+)?\)$/, '')} (copy ${k++})`; return n; };
  function onCardClick(e) {
    const b = e.target.closest('[data-edit],[data-dup],[data-del]'); if (!b) return;
    const d = list.find(x => x.id === (b.dataset.edit || b.dataset.dup || b.dataset.del));
    if (b.dataset.edit) return confirmPF({ title: `Proceed to edit "${d.name}"?`, desc: `${LINKED} Do you want to continue?`, cta: 'Continue', back: b,
      onOk: () => openEditor(JSON.parse(JSON.stringify(d)), { edit: d, from: 'list' }) });
    if (b.dataset.dup) {
      const c = JSON.parse(JSON.stringify(d)); delete c.id; c.name = uniqueName(`${d.name} (copy)`);
      S.announce(`Copying ${d.name}. Review the copy, then save.`);
      return openEditor(c, { from: 'list' });
    }
    confirmPF({
      title: `Proceed to delete "${d.name}"?`,
      desc: `Are you sure you want to delete <strong>"${esc(d.name)}"</strong>? ${LINKED} This action cannot be undone.`,
      cta: 'Delete', back: b,
      onOk: () => {
        const i = list.indexOf(d), name = d.name; list.splice(i, 1); persist(); renderList();
        const cards = $('dc-list').querySelectorAll('[data-edit]'); (cards[Math.min(i, cards.length - 1)] || $('dc-new')).focus();
        S.announce(`${name} deleted.`);
      },
    });
  }

  /* ---------- Dialogs (built once, outside the view so screens can be swapped) ---------- */
  const host = document.createElement('div'); host.id = 'dc-dialogs';
  host.innerHTML = `
    <dialog class="modal ntw dcw" id="dc-how" aria-labelledby="dcw-how-title" aria-describedby="dcw-how-desc">
      <form id="dc-how-form" novalidate>
        <div class="ntw-body">
          <button type="button" class="icon-btn ntw-close" data-close aria-label="Close">${I.close}</button>
          <h2 class="ntw-title" id="dcw-how-title">How would you like to create your document?</h2>
          <p class="ntw-desc" id="dcw-how-desc">Choose how you would like to create your document.</p>
          <fieldset class="ntw-tiles"><legend class="sr-only">How to create the document</legend>
            <label class="ntw-tile"><input type="radio" name="dc-how" value="TEMPLATE"><span class="ntw-tile-ico">${I.tplTile}</span>
              <span class="ntw-tile-title">Predefined Document Template</span><span class="ntw-tile-text">Start from a ready-made template and customize it.</span></label>
            <label class="ntw-tile"><input type="radio" name="dc-how" value="UPLOAD"><span class="ntw-tile-ico">${I.upTile}</span>
              <span class="ntw-tile-title">Upload Your Own Design</span><span class="ntw-tile-text">Upload an image of each page and set it up in the designer.</span></label>
          </fieldset>
          <p class="error dc-how-err" id="dc-how-err" hidden>Select how you would like to create your document.</p>
        </div>
        <div class="ntw-foot">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Next</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal ntw dcw dcw-name" id="dc-name" aria-labelledby="dcw-name-title" aria-describedby="dcw-name-desc">
      <form id="dc-name-form" novalidate>
        <div class="ntw-body">
          <button type="button" class="icon-btn ntw-close" data-close aria-label="Close">${I.close}</button>
          <h2 class="ntw-title" id="dcw-name-title">Name Your Document</h2>
          <p class="ntw-desc" id="dcw-name-desc">Enter a name for this document. You can change the name later.</p>
          <div class="ntw-box"><div class="ntw-row">
            <label class="ntw-label" for="dc-name-in">Document name <span class="req" aria-hidden="true">*</span></label>
            <div class="ntw-control"><input class="input" id="dc-name-in" type="text" maxlength="60" autocomplete="off" aria-required="true" aria-describedby="dc-name-err">
              <p class="error" id="dc-name-err" hidden><span>Enter the document name.</span></p></div>
          </div></div>
          <div class="ntw-box" id="dc-state-box"><div class="ntw-row">
            <label class="ntw-label" for="dc-state-in">Document type <span class="req" aria-hidden="true">*</span></label>
            <div class="ntw-control"><select class="input" id="dc-state-in" aria-required="true" aria-describedby="dc-state-err">${opts(Object.entries(CATS).map(([k, [t]]) => [k, t]), '', 'Select document type')}</select>
              <p class="error" id="dc-state-err" hidden><span>Select the document type.</span></p></div>
          </div></div>
        </div>
        <div class="ntw-foot">
          <button type="button" class="btn btn-secondary" data-close id="dc-name-cancel">Back</button>
          <button type="submit" class="btn btn-primary" id="dc-name-ok">Next</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal pfc" id="dc-confirm" aria-labelledby="dcc-title" aria-describedby="dcc-desc">
      <button type="button" class="icon-btn pfc-close" data-close aria-label="Close">${I.close}</button>
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48" focusable="false"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="dcc-title"></h2>
      <p class="pfc-desc" id="dcc-desc"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-close id="dcc-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="dcc-ok">Delete</button>
      </div>
    </dialog>
    <dialog class="modal dc-vd" id="dc-var-dlg" aria-labelledby="dc-vd-title" aria-describedby="dc-vd-desc">
      <form id="dc-vd-form" novalidate>
        <button type="button" class="icon-btn dc-vd-close" data-close aria-label="Close">${I.close}</button>
        <h2 class="dc-vd-title" id="dc-vd-title"><span class="dc-vd-ico" aria-hidden="true">${I.plusSq}</span><span id="dc-vd-title-t">Add System Variable</span></h2>
        <p class="dc-vd-desc" id="dc-vd-desc"></p>
        <div class="dc-vd-field">
          <p class="dc-vd-label" id="dc-vd-legend">Personalization Variables <span class="req" aria-hidden="true">*</span></p>
          <fieldset class="check-list dc-vd-list" id="dc-vd-list" aria-labelledby="dc-vd-legend" aria-describedby="dc-vd-err"><legend>Personalization Variables</legend></fieldset>
          <p class="error" id="dc-vd-err" hidden>Select at least one variable.</p>
        </div>
        <div class="dc-vd-actions">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Add Variable</button>
        </div>
      </form>
    </dialog>
    <input type="file" id="dc-file" accept="image/png,image/jpeg" multiple hidden>`;
  document.body.appendChild(host);
  host.querySelectorAll('dialog').forEach(dl => {
    dl.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dl.close()));
    dl.addEventListener('click', e => { if (e.target === dl) dl.close(); });
  });

  // Confirm (process-flow alert)
  const conf = $('dc-confirm'); let confOk = null, confBack = null;
  function confirmPF({ title, desc, cta, onOk, back }) {
    $('dcc-title').textContent = title; $('dcc-desc').innerHTML = desc; $('dcc-ok').textContent = cta;
    confOk = onOk; confBack = back || null; conf.showModal(); $('dcc-cancel').focus();
  }
  $('dcc-ok').addEventListener('click', () => { const f2 = confOk; confOk = null; conf.close(); f2 && f2(); });
  conf.addEventListener('close', () => { if (confOk === null) return; confOk = null; confBack && document.contains(confBack) && confBack.focus(); });

  // How would you like to create your document?
  const how = $('dc-how'); let howOpener = null, howGo = false;
  // Nothing is preselected: Next asks for a choice
  function openHow(from) {
    howOpener = from; howGo = false;
    how.querySelectorAll('input[name="dc-how"]').forEach(r => { r.checked = false; });
    $('dc-how-err').hidden = true; how.querySelector('.ntw-tiles').removeAttribute('aria-describedby');
    how.showModal(); how.querySelector('input[name="dc-how"]').focus();
  }
  how.addEventListener('change', () => { $('dc-how-err').hidden = true; how.querySelector('.ntw-tiles').removeAttribute('aria-describedby'); });
  $('dc-how-form').addEventListener('submit', e => {
    e.preventDefault();
    const picked = how.querySelector('input[name="dc-how"]:checked');
    if (!picked) { $('dc-how-err').hidden = false; how.querySelector('.ntw-tiles').setAttribute('aria-describedby', 'dc-how-err'); how.querySelector('input[name="dc-how"]').focus(); return; }
    const kind = picked.value;
    howGo = true; how.close();
    if (kind === 'TEMPLATE') return showChooser(kind);
    showDetails({ name: '', kind: 'UPLOAD', cat: '', state: '', pages: [], qr: false, varsOn: false, vars: [] }, { from: 'how' });
  });
  how.addEventListener('close', () => { if (!howGo && howOpener && document.contains(howOpener)) howOpener.focus(); });

  // Name popup (upload path, and rename in both editors)
  const nameDlg = $('dc-name'); let nameDone = null, nameBack = null;
  // withState = upload flow: name + Document type (dropdown) before the uploader opens. Template / rename = name only.
  let nameWithState = false;
  function askName(cur, { ok = 'Next', cancel = 'Back', title = 'Name Your Document', desc = 'Enter a name for this document. You can change the name later.', withState = false, state = '' } = {}, onOk, back) {
    $('dcw-name-title').textContent = title; $('dcw-name-desc').textContent = desc; $('dc-name-ok').textContent = ok; $('dc-name-cancel').textContent = cancel;
    nameWithState = withState; $('dc-state-box').hidden = !withState; $('dc-state-in').value = state;
    $('dc-state-err').hidden = true; $('dc-state-in').removeAttribute('aria-invalid');
    $('dc-name-in').value = cur || ''; $('dc-name-err').hidden = true; $('dc-name-in').removeAttribute('aria-invalid');
    nameDone = onOk; nameBack = back || null; nameDlg.showModal(); $('dc-name-in').focus(); $('dc-name-in').select();
  }
  $('dc-name-form').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('dc-name-in').value.trim(), st = $('dc-state-in').value;
    $('dc-name-err').hidden = !!v; v ? $('dc-name-in').removeAttribute('aria-invalid') : $('dc-name-in').setAttribute('aria-invalid', 'true');
    const stBad = nameWithState && !st;
    $('dc-state-err').hidden = !stBad; stBad ? $('dc-state-in').setAttribute('aria-invalid', 'true') : $('dc-state-in').removeAttribute('aria-invalid');
    if (!v) { $('dc-name-in').focus(); return; }
    if (stBad) { $('dc-state-in').focus(); return; }
    const fn = nameDone; nameDone = null; nameDlg.close(); fn && fn(v, st);
  });
  nameDlg.addEventListener('close', () => { if (nameDone === null) return; nameDone = null; nameBack && document.contains(nameBack) && nameBack.focus(); });

  /* ---------- 2. Choose a document template / category (full screen) ---------- */
  function showChooser(kind, picked) {
    setScreen('choose');
    const tpl = kind === 'TEMPLATE';
    let cur = picked || 'application';
    view.innerHTML = `${subbar}
    <main class="content dc-choose">
      <h1 class="page-title" id="dc-ch-title" tabindex="-1">${tpl ? 'Choose a document template' : 'Choose a document category'}</h1>
      <p class="dc-ch-desc" id="dc-ch-desc">${tpl ? 'Pick the template closest to the document you need, then personalize it to suit your service.' : 'Select the type of document you are uploading.'}</p>
      <div class="dc-tpl-grid" role="radiogroup" aria-labelledby="dc-ch-title" aria-describedby="dc-ch-desc">${Object.entries(CATS).map(([k, [t, d]]) => `
        <label class="dc-tpl"><input type="radio" name="dc-cat" value="${k}"${k === cur ? ' checked' : ''}>
          <span class="dc-tpl-thumb" aria-hidden="true"><span class="dc-scale">${templatePage({ cat: k, els: allOn(k) })}</span></span>
          <span class="dc-tpl-text"><span class="dc-tpl-title">${t}</span><span class="dc-tpl-desc">${d}</span></span>
          <span class="dc-tpl-check" aria-hidden="true"></span></label>`).join('')}
      </div>
    </main>
    <footer class="form-foot dc-foot">
      <button type="button" class="btn btn-secondary" id="dc-ch-back">${I.left} Back</button>
      <button type="button" class="btn btn-primary" id="dc-ch-next">Next</button>
    </footer>`;
    topBack();
    view.querySelector('.dc-tpl-grid').addEventListener('change', e => { cur = e.target.value; });
    $('dc-ch-back').addEventListener('click', () => showList());
    $('dc-ch-next').addEventListener('click', () => showDetails({ name: uniqueName(CATS[cur][0]), kind: 'TEMPLATE', cat: cur, state: '', els: allOn(cur) }, { from: 'choose' }));
    $('dc-ch-title').focus();
    S.announce(tpl ? 'Choose a document template.' : 'Choose a document category.');
  }

  /* ---------- 2b. Add Document Details (full screen): name · document type · process flow state ----------
       from: 'choose' (template) | 'how' (upload) | 'editor' (pencil: edit the details, then back to the editor) */
  function showDetails(doc, ctx) {
    setScreen('details');
    const tpl = doc.kind === 'TEMPLATE', fromEd = ctx.from === 'editor';
    const row = (id, label, control, err) => `<div class="dc-dt-row">
        <label class="dc-dt-label" for="${id}">${label} <span class="req" aria-hidden="true">*</span></label>
        <div class="dc-dt-control">${control}<p class="error" id="${id}-err" hidden>${err}</p></div>
      </div>`;
    const typeCtl = tpl
      ? `<input class="input dc-readonly" id="dc-dt-type" type="text" readonly aria-readonly="true" value="${esc(CATS[doc.cat][0])}">`
      : `<select class="input" id="dc-dt-type" aria-required="true" aria-describedby="dc-dt-type-err">${opts(Object.entries(CATS).map(([k, [t]]) => [k, t]), doc.cat, 'Select document type')}</select>`;
    view.innerHTML = `${subbar}
    <main class="content dc-details">
      <h1 class="page-title" id="dc-dt-title" tabindex="-1">${fromEd ? 'Edit Document Details' : 'Add Document Details'}</h1>
      <p class="dc-ch-desc" id="dc-dt-desc">Add the basic details of the document you are creating.</p>
      <section class="section dc-dt-card" aria-labelledby="dc-dt-title" aria-describedby="dc-dt-desc">
        ${row('dc-dt-state', 'Process flow state', `<select class="input" id="dc-dt-state" aria-required="true" aria-describedby="dc-dt-state-err">${opts([...new Set([...(pf ? [pf.stateName] : []), ...STATES])].map(x => [x, x]), doc.state || (pf ? pf.stateName : ''), 'Select a state')}</select>`, 'Select a process flow state.')}
        ${row('dc-dt-type', 'Document type', typeCtl, 'Select the document type.')}
        ${row('dc-dt-name', 'Document name', `<input class="input" id="dc-dt-name" type="text" maxlength="60" autocomplete="off" aria-required="true" aria-describedby="dc-dt-name-err" value="${esc(doc.name)}">`, 'Enter the document name.')}
      </section>
    </main>
    <footer class="form-foot dc-foot">
      <button type="button" class="btn btn-secondary" id="dc-dt-back">${I.left} Back</button>
      <button type="button" class="btn btn-primary" id="dc-dt-next">${fromEd ? 'Save' : 'Next'}</button>
    </footer>`;
    topBack();
    const clear = id => { $(id + '-err').hidden = true; $(id).removeAttribute('aria-invalid'); };
    $('dc-dt-name').addEventListener('input', () => clear('dc-dt-name'));
    if (!tpl) $('dc-dt-type').addEventListener('change', () => clear('dc-dt-type'));
    $('dc-dt-state').addEventListener('change', () => clear('dc-dt-state'));
    $('dc-dt-back').addEventListener('click', () => {
      if (fromEd) return tpl ? showTemplateEditor() : showUploadEditor();
      if (ctx.from === 'choose') return showChooser('TEMPLATE', doc.cat);
      showList();
    });
    $('dc-dt-next').addEventListener('click', () => {
      const name = $('dc-dt-name').value.trim(), cat = tpl ? doc.cat : $('dc-dt-type').value, state = $('dc-dt-state').value;
      const checks = [['dc-dt-state', !state], ['dc-dt-name', !name]];
      if (!tpl) checks.splice(1, 0, ['dc-dt-type', !cat]);
      const bad = [];
      checks.forEach(([id, isBad]) => { if (isBad) { $(id + '-err').hidden = false; $(id).setAttribute('aria-invalid', 'true'); bad.push(id); } else clear(id); });
      if (bad.length) { $(bad[0]).focus(); return; }
      Object.assign(doc, { name, cat, state });
      if (fromEd) { (tpl ? showTemplateEditor : showUploadEditor)(); S.announce('Document details saved.'); return; }
      if (!tpl) return showArrange(doc, { prev: ctx.from });
      openEditor(doc, { from: 'details', prev: ctx.from });
    });
    $('dc-dt-title').focus();
  }

  /* ---------- 2c. Upload and Arrange Pages (iLovePDF "organise" style) ----------
       One image = one page. Big drop zone first; then a grid of page thumbnails you can drag to reorder,
       move earlier / later with buttons (keyboard), delete, or add more. Next → the upload canvas. */
  function showArrange(doc, ctx) {
    setScreen('arrange');
    W = { doc, ctx: { from: 'arrange', prev: ctx.prev }, sel: null, page: 0, err: '' };
    view.innerHTML = `${subbar}
    <main class="content dc-arrange">
      <h1 class="page-title" id="dc-ar-title" tabindex="-1">Upload and Arrange Documents</h1>
      <p class="dc-ch-desc" id="dc-ar-desc">Upload an image for each page of your document and put the files in order.</p>
      <section class="section dc-ar-card" aria-labelledby="dc-ar-title" aria-describedby="dc-ar-desc">
        <div id="dc-ar-body"></div>
      </section>
    </main>
    <footer class="form-foot dc-foot">
      <button type="button" class="btn btn-secondary" id="dc-ar-back">${I.left} Back</button>
      <button type="button" class="btn btn-primary" id="dc-ar-next">Next</button>
    </footer>`;
    topBack();
    $('dc-ar-back').addEventListener('click', () => showDetails(doc, { from: ctx.prev }));
    $('dc-ar-next').addEventListener('click', () => {
      if (!doc.pages.length) { $('dc-ar-err') && ($('dc-ar-err').hidden = false); S.announce('Add at least one page.'); $('dc-ar-browse')?.focus(); return; }
      openEditor(doc, { from: 'arrange', prev: ctx.prev });
    });
    const body = $('dc-ar-body');
    body.addEventListener('click', onArrangeClick);
    body.addEventListener('keydown', onArrangeKey);
    body.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); $('dc-ar-drop')?.classList.add('is-over'); } });
    body.addEventListener('dragleave', e => { if (!body.contains(e.relatedTarget)) $('dc-ar-drop')?.classList.remove('is-over'); });
    body.addEventListener('drop', e => { if (!e.dataTransfer.files.length) return; e.preventDefault(); $('dc-ar-drop')?.classList.remove('is-over'); addFiles(e.dataTransfer.files); });
    wireArrangeDrag(body);
    drawArrange();
    $('dc-ar-title').focus();
  }
  // Uploader stays at the top (same look as the other Studio uploaders); pages grid below with a ⋮ menu on each page
  function drawArrange() {
    const d = W.doc, n = d.pages.length;
    $('dc-ar-body').innerHTML = `
      <div class="dc-ar-drop${n ? ' is-compact' : ''}" id="dc-ar-drop">
        <span class="dc-ar-ico" aria-hidden="true">${I.upload}</span>
        <div class="dc-ar-droptext">
          <p class="dc-ar-text">Drag and drop your files or <button type="button" class="dc-browse" id="dc-ar-browse">browse in my files</button></p>
          <p class="dc-ar-hint">One image for each page. Accepted: PNG, JPG</p>
        </div>
        <p class="error" id="dc-ar-err" hidden>Add at least one file.</p>
      </div>
      ${n ? `
      <div class="dc-ar-head">
        <h2 class="dc-ar-htitle" id="dc-ar-htitle">Uploaded Documents</h2>
        <span class="dc-ar-count dc-ar-tag" role="status"><span aria-hidden="true">${n}</span><span class="sr-only">${n} file${n === 1 ? '' : 's'} uploaded</span></span>
      </div>
      <ol class="dc-ar-grid" id="dc-ar-grid" aria-labelledby="dc-ar-htitle">${d.pages.map((p, i) => `
        <li class="dc-fcard dc-ar-page" data-ar-i="${i}" draggable="true">
          <div class="dc-fcard-img dc-ar-img" aria-hidden="true"><span class="dc-ar-badge">${i + 1}</span><img src="${p.src}" alt=""></div>
          <div class="dc-ar-row">
            <button type="button" class="dc-ar-grip" data-ar-grip="${i}" aria-label="Move file ${i + 1}, ${esc(p.label)}. Use the arrow keys to change its position">${I.grip}</button>
            <div class="dc-ar-names"><h3 class="dc-ar-fname" id="dc-ar-p${i}" title="${esc(p.label)}">${esc(p.label)}</h3></div>
            <button type="button" class="icon-btn dc-ar-rm" data-ar-rm="${i}" aria-label="Delete file ${i + 1}, ${esc(p.label)}">${I.trash}</button>
          </div>
        </li>`).join('')}
      </ol>` : ''}`;
  }
  function closeArMenus(except) {
    view.querySelectorAll('.dc-ar-menu').forEach(m => { if (m === except) return; m.hidden = true; m.previousElementSibling?.setAttribute('aria-expanded', 'false'); });
  }
  function onArrangeClick(e) {
    const d = W.doc, b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.id === 'dc-ar-browse') return $('dc-file').click();
    if (b.dataset.arMenu !== undefined) {
      const m = b.nextElementSibling, open = m.hidden; closeArMenus(m);
      m.hidden = !open; b.setAttribute('aria-expanded', String(open));
      if (open) m.querySelector('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
      return;
    }
    if (b.getAttribute('aria-disabled') === 'true') return;
    const thumb = i => $('dc-ar-grid')?.querySelector(`[data-ar-i="${i}"] .dc-ar-rm`);
    if (b.dataset.arLeft !== undefined) { const i = +b.dataset.arLeft; reorder(d, i, i - 1); drawArrange(); thumb(i - 1)?.focus(); S.announce(`Page moved. It is now page ${i}.`); return; }
    if (b.dataset.arRight !== undefined) { const i = +b.dataset.arRight; reorder(d, i, i + 1); drawArrange(); thumb(i + 1)?.focus(); S.announce(`Page moved. It is now page ${i + 2}.`); return; }
    if (b.dataset.arRm !== undefined) {
      const i = +b.dataset.arRm, label = d.pages[i].label; removePage(d, i); drawArrange();
      (thumb(Math.min(i, d.pages.length - 1)) || $('dc-ar-browse'))?.focus();
      S.announce(`${label} deleted.`);
    }
  }
  // Grip: arrow keys move the page earlier / later (drag works with a pointer)
  function onArrangeKey(e) {
    const g = e.target.closest('[data-ar-grip]');
    if (g) {
      const i = +g.dataset.arGrip, n = W.doc.pages.length;
      const to = (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ? i - 1 : (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? i + 1 : null;
      if (to === null) return;
      e.preventDefault(); if (to < 0 || to >= n) return;
      reorder(W.doc, i, to); drawArrange(); $('dc-ar-grid').querySelector(`[data-ar-grip="${to}"]`)?.focus();
      S.announce(`File moved. It is now file ${to + 1} of ${n}.`); return;
    }
    return onArrangeMenuKey(e);
  }
  function onArrangeMenuKey(e) {
    const m = e.target.closest('.dc-ar-menu'); if (!m) return;
    const items = [...m.querySelectorAll('[role="menuitem"]')], i = items.indexOf(e.target);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
    else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); const btn = m.previousElementSibling; closeArMenus(); if (e.key === 'Escape') btn.focus(); }
  }
  function wireArrangeDrag(body) {
    let from = null;
    body.addEventListener('dragstart', e => { const li = e.target.closest('.dc-ar-page'); if (!li) return; from = +li.dataset.arI; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(from)); });
    body.addEventListener('dragend', () => { from = null; body.querySelectorAll('.dc-ar-page').forEach(x => x.classList.remove('dragging', 'drop-target')); });
    body.addEventListener('dragover', e => { if (from === null) return; const li = e.target.closest('.dc-ar-page'); if (!li) return; e.preventDefault();
      body.querySelectorAll('.dc-ar-page').forEach(x => x.classList.toggle('drop-target', x === li && +li.dataset.arI !== from)); });
    body.addEventListener('drop', e => { const li = e.target.closest('.dc-ar-page'); if (from === null || !li) return; e.preventDefault(); e.stopPropagation();
      const to = +li.dataset.arI; if (to !== from) { reorder(W.doc, from, to); drawArrange(); S.announce(`Page moved. It is now page ${to + 1}.`); } from = null; });
  }

  /* ---------- 3. Editors ---------- */
  function openEditor(doc, ctx) {
    W = { doc, ctx, sel: null, page: 0, err: '' };
    doc.kind === 'TEMPLATE' ? showTemplateEditor() : showUploadEditor();
  }
  const editorHead = d => `<div class="form-head dc-ed-head">
      <div class="dc-name-row"><h1 class="page-title" id="dc-ed-title" tabindex="-1">${esc(d.name)}</h1>
        <button type="button" class="icon-btn dc-rename" id="dc-rename" aria-label="Edit document name">${I.pencilL}</button></div>
      <label class="sr-only" for="dc-name-edit">Document name</label>
      <input class="input dc-name-edit" id="dc-name-edit" type="text" maxlength="60" autocomplete="off" hidden>
      <ul class="nt-tags dc-ed-tags" aria-label="Process flow state"><li class="nt-tag nt-tag-state">${esc(d.state)}</li></ul>
    </div>`;
  const stateField = d => `<div class="fp-field">
      <span class="fp-label"><label for="dc-ed-state">Process flow state <span class="req" aria-hidden="true">*</span></label>${tip('tip-dc-state', 'process flow state', 'The document is generated when an application reaches this state.')}</span>
      <select class="input dc-select" id="dc-ed-state" aria-required="true" aria-describedby="dc-ed-state-err"${W.err ? ' aria-invalid="true"' : ''}>${opts([...new Set([...(pf ? [pf.stateName] : []), ...STATES])].map(s => [s, s]), d.state, 'Select a state')}</select>
      <p class="error" id="dc-ed-state-err"${W.err ? '' : ' hidden'}>${W.err ? 'Select a process flow state.' : ''}</p>
    </div>`;
  const panelHead = `<div class="fp-head"><h2 class="fp-title dc-panel-title">Document Items</h2></div>`;
  const editorFoot = `<footer class="form-foot">
      <button type="button" class="btn btn-secondary" id="dc-ed-back">${I.left} Back</button>
      <button type="button" class="btn btn-primary dc-save" id="dc-ed-save">${I.check} Save Configuration</button>
    </footer>`;
  function wireEditorCommon() {
    topBack();
    // Pencil edits the name only (process flow state and document type can't be changed here)
    // Pencil edits the name in place (no popup): Enter or leaving the field saves, Escape cancels; empty keeps the old name
    $('dc-rename').addEventListener('click', () => {
      const row = view.querySelector('.dc-name-row'), inp = $('dc-name-edit');
      row.hidden = true; inp.hidden = false; inp.value = W.doc.name; inp.focus(); inp.select();
    });
    const endEdit = save => {
      const row = view.querySelector('.dc-name-row'), inp = $('dc-name-edit'); if (inp.hidden) return;
      const v = inp.value.trim();
      if (save && v && v !== W.doc.name) { W.doc.name = v; $('dc-ed-title').textContent = v; S.announce(`Document renamed to ${v}.`); }
      inp.hidden = true; row.hidden = false; $('dc-rename').focus();
    };
    $('dc-name-edit').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); endEdit(true); } else if (e.key === 'Escape') { e.preventDefault(); endEdit(false); } });
    $('dc-name-edit').addEventListener('blur', () => endEdit(true));
    $('dc-ed-back').addEventListener('click', () => {
      if (W.ctx.from === 'arrange' && !W.ctx.edit) return showArrange(W.doc, { prev: W.ctx.prev });
      if (W.ctx.from === 'details' && !W.ctx.edit) return showDetails(W.doc, { from: W.ctx.prev });
      showList(W.ctx.edit && W.ctx.edit.id);
    });
    $('dc-ed-save').addEventListener('click', saveDoc);
    view.querySelectorAll('.tip').forEach(t => { const b2 = t.querySelector('.tip-btn'); if (!b2) return;
      b2.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      t.addEventListener('mouseleave', () => t.classList.remove('dismissed')); b2.addEventListener('blur', () => t.classList.remove('open', 'dismissed')); });
  }
  function saveDoc() {
    const d = W.doc;
    if (d.kind === 'UPLOAD' && !d.pages.length) { S.announce('Add at least one page before saving.'); $('dc-add')?.focus(); $('dc-drop-err') && ($('dc-drop-err').hidden = false); return; }
    let id;
    if (W.ctx.edit) { Object.assign(W.ctx.edit, d); id = W.ctx.edit.id; }
    else { id = nid(); list.unshift({ ...d, id }); }
    persist();
    if (pf && !W.ctx.edit) {
      sessionStorage.setItem('studio.docDone', JSON.stringify({ module: mod.id, stateId: pf.stateId, docId: id, name: d.name, docType: CATS[d.cat] ? CATS[d.cat][0] : '', source: d.kind === 'UPLOAD' ? 'upload' : 'template' }));
      pf = null; return toFlow();
    }
    const was = !!W.ctx.edit, name = d.name;
    showList(id);
    S.announce(`${name} ${was ? 'updated' : 'created'}.`);
    if (!was) S.toast(`${name} created successfully`);
  }

  // 3a. Template editor: preview + Document Properties (no left panel)
  function showTemplateEditor() {
    setScreen('template');
    const d = W.doc;
    view.innerHTML = `${subbar}
    <div class="form-body">
      <div class="form-main dc-main">
        ${editorHead(d)}
        <div class="dc-zoom" role="group" aria-label="Zoom">
          <button type="button" class="icon-btn" data-zoom="out" aria-label="Zoom out" title="Zoom out"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          <button type="button" class="dc-zoom-l" data-zoom="fit" id="dc-zoom-l" title="Fit the page" aria-label="Zoom level. Select to fit the page">Fit</button>
          <button type="button" class="icon-btn" data-zoom="in" aria-label="Zoom in" title="Zoom in"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="dc-stage" id="dc-stage">${templatePage(d, W.sel)}</div>
      </div>
      <aside class="form-panel" aria-label="Document items">
        <div class="panel-view" id="dc-list-view">
          ${panelHead}
          <div class="fp-scroll">
            <div class="dc-pbody">${groups(d.cat).map(([g, els]) => `
              <section class="dc-psec" aria-labelledby="dc-g-${g}">
                <h3 class="dc-psec-title" id="dc-g-${g}">${g}</h3>
                <div class="dc-icard">
                  <ul class="dc-items">${els.map(([k, label]) => `
                    <li class="dc-item${W.sel === k ? ' is-sel' : ''}" data-row="${k}">
                      <button type="button" class="dc-item-btn" data-pick="${k}" aria-pressed="${W.sel === k}">${label}</button>
                      ${k === 'qr' ? `<button type="button" class="switch" role="switch" data-sw="qr" aria-checked="${d.els.qr !== false}" aria-label="QR Code"><span class="switch-knob" aria-hidden="true"></span></button>` : ''}
                    </li>`).join('')}
                  </ul>
                </div>
              </section>`).join('')}
            </div>
          </div>
        </div>
        <div class="panel-view" id="dc-el-view" hidden></div>
      </aside>
    </div>
    ${editorFoot}`;
    wireEditorCommon();
    const aside = view.querySelector('.form-panel');
    aside.addEventListener('click', e => {
      const sw = e.target.closest('[data-sw]'), pick = e.target.closest('[data-pick]');
      if (sw) {
        const k = sw.dataset.sw; d.els[k] = d.els[k] === false; sw.setAttribute('aria-checked', String(d.els[k] !== false));
        redrawTemplate(); S.announce(`${sw.getAttribute('aria-label')} ${d.els[k] !== false ? 'added to' : 'removed from'} the document.`); return;
      }
      if (pick) selectEl(pick.dataset.pick);
    });
    $('dc-stage').addEventListener('click', e => { const el = e.target.closest('[data-el]'); if (el) selectEl(el.dataset.el); });
    wireElView();
    fitTemplate(); $('dc-ed-title').focus();
  }
  function redrawTemplate() { $('dc-stage').innerHTML = templatePage(W.doc, W.sel); fitTemplate(); }
  // Template preview shows the whole A4 page: scaled to the space under the title, so the centre never scrolls
  function fitTemplate() {
    const stage = $('dc-stage'), main = view.querySelector('.dc-main'), page = stage && stage.querySelector('.dp-page');
    if (!page || (screen !== 'template' && screen !== 'upload')) return;
    const availH = main.clientHeight - stage.offsetTop - 32, availW = stage.clientWidth;
    // The page is laid out at 595 × 842 (A4 in points). Real A4 on screen is 210 × 297 mm = 794 × 1123 CSS px,
    // so 100% = REAL scale (like the phone preview: true size, grows with browser zoom).
    const REAL = 793.7 / 595;
    const fit = Math.max(0.3, Math.min(REAL, availH / 842, availW / 595));
    const k = W.zf ? W.zf * REAL : fit;   // W.zf = zoom chosen with − / + (1 = actual size); none = fit the page
    W.zoom = k; page.style.transform = `scale(${k})`; page.style.transformOrigin = 'top center'; page.style.setProperty('--uz', String(1 / k));
    stage.style.height = Math.ceil(842 * k) + 'px'; stage.style.padding = '0';
    stage.style.width = k * 595 > availW ? Math.ceil(595 * k) + 'px' : ''; stage.style.overflow = 'visible';
    main.style.overflow = k > fit + 0.001 ? 'auto' : 'hidden';   // zoomed past the fit: the centre scrolls
    // zoom control pinned to the bottom-right of the page area (same place as the process flow), also while the page scrolls
    const zc = main.querySelector('.dc-zoom'); if (zc) { const r = main.getBoundingClientRect(); zc.style.left = (r.right - zc.offsetWidth - 16) + 'px'; zc.style.top = (r.bottom - zc.offsetHeight - 16) + 'px'; }
    const pct = Math.round(k / REAL * 100);
    const l = view.querySelector('#dc-zoom-l'); if (l) { l.textContent = W.zf ? pct + '%' : 'Fit'; l.title = W.zf ? 'Fit the page' : `Fitted: ${pct}% of actual size`; l.setAttribute('aria-label', `Zoom ${pct} percent of actual size${W.zf ? '. Select to fit the page' : ', fitted to the space'}`); }
  }
  addEventListener('resize', () => fitTemplate());
  // − / Fit / + : steps of 25%, from 50% to 200%
  view.addEventListener('click', e => {
    const b = e.target.closest('[data-zoom]'); if (!b || !W) return;
    const cur = (W.zoom || 1) / (793.7 / 595), steps = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];   // percent of actual A4 size
    if (b.dataset.zoom === 'fit') W.zf = null;
    else if (b.dataset.zoom === 'in') W.zf = steps.find(z => z > cur + 0.01) || 2;
    else W.zf = [...steps].reverse().find(z => z < cur - 0.01) || 0.5;
    fitTemplate(); placeResize && placeResize(); S.announce(W.zf ? `Zoom ${Math.round(W.zf * 100)} percent of actual size.` : 'Page fitted to the space.');
  });
  function selectEl(k) {
    W.sel = k; W.elTab = W.elTab || 'element';
    view.querySelectorAll('[data-row]').forEach(r => { const on = r.dataset.row === W.sel; r.classList.toggle('is-sel', on); r.querySelector('[data-pick]').setAttribute('aria-pressed', String(on)); });
    redrawTemplate();
    openElView(true);
  }
  /* ---------- Element properties (like the form builder's field properties): Element | Appearance ---------- */
  const EL_FIELDS = {
    orgName: [['text', 'Organization Name', 'text', 'Name']], orgAddr: [['text', 'Organization Address', 'textarea', 'Address']],
    appNo: [['label', 'Label', 'text', 'Label text'], ['text', 'Value', 'text', 'Value text']],
    applicant: [['heading', 'Heading', 'text', 'Heading text']], submitted: [['heading', 'Heading', 'text', 'Heading text']], status: [['heading', 'Heading', 'text', 'Heading text']],
    payer: [['heading', 'Heading', 'text', 'Heading text']], payment: [['heading', 'Heading', 'text', 'Heading text']], txn: [['heading', 'Heading', 'text', 'Heading text']], bill: [['heading', 'Heading', 'text', 'Heading text']],
    section2: [['heading', 'Heading', 'text', 'Heading text'], ['text', 'Text', 'textarea', 'Paragraph text']],
    certTitle: [['text', 'Title', 'text', 'Title text']], recipient: [['label', 'Intro Text', 'text', 'Intro text'], ['text', 'Recipient Name', 'text', 'Recipient name']],
    certText: [['text', 'Text', 'textarea', 'Paragraph text']], signature: [['text', 'Signatory Label', 'text', 'Label text']], note: [['text', 'Note', 'textarea', 'Note text']],
  };

  const elLabel = k => groups(W.doc.cat).flatMap(([, els]) => els).find(([x]) => x === k)?.[1] || k;
  const P = k => ((W.doc.props = W.doc.props || {})[k] = W.doc.props[k] || {});
  const seg = (name, label, opts2, cur) => `<fieldset class="dc-seg-fs"><legend class="fpp-label">${label}</legend>
      <div class="dc-seg">${opts2.map(([v, t]) => `<label class="dc-seg-opt"><input type="radio" name="${name}" value="${v}" data-look="${name}"${v === cur ? ' checked' : ''}><span>${t}</span></label>`).join('')}</div></fieldset>`;
  const EL_INTRO = '<p class="fpp-intro">Element controls what this element shows on the document, such as its text, image or link. Any change you make here shows straight away in the preview.</p>';
  const NO_VARS = ['orgName', 'orgAddr'];   // the organisation's real details, not per-application values
  const PH = { orgName: 'Enter organization name', orgAddr: 'Enter organization address' };
  let lastField = null;   // where a personalization variable is inserted
  // One box per field: label, field, then (if it can hold them) Personalization Variables for THAT field. Logo = uploader.
  function elementTabHTML(k) {
    const d = W.doc;
    if (k === 'logo') {
      // Same uploader as Studio Branding: dashed drop box before; after, the logo in a tile with ✕ to remove it
      const src = pv(d, 'logo', 'src');
      return `${EL_INTRO}<div class="fpp-box">
        <p class="fpp-box-title" id="dc-logo-l">Upload logo</p>
        ${src
          ? `<div class="dc-logo-tile"><img src="${src}" alt="Uploaded logo"><button type="button" class="dc-logo-x" id="dc-logo-rm" aria-label="Remove logo">${I.close}</button></div>`
          : `<div class="dc-logo-drop" id="dc-logo-drop"><span class="dc-logo-ico" aria-hidden="true">${I.upload}</span>
              <p>Drag and drop your logo or <button type="button" class="dc-browse" id="dc-logo-up" aria-describedby="dc-logo-l">Browse in my files</button></p></div>`}
        <p class="error" id="dc-logo-err" role="alert" hidden></p>
        <input type="file" id="dc-logo-file" accept="image/png,image/svg+xml,image/jpeg" tabindex="-1" aria-hidden="true" hidden></div>`;
    }
    if (k === 'qr') {
      return `${EL_INTRO}<div class="fpp-box">
        <h3 class="fpp-box-title">QR Code Link</h3>
        <div class="fpp-field">
          <label class="fpp-label" for="dc-f-link">Link</label>
          <input class="fp-input" id="dc-f-link" type="url" inputmode="url" data-elf="link" value="${esc(pv(d, 'qr', 'link'))}" placeholder="Enter the link the QR code opens" autocomplete="off">
        </div>
      </div>`;
    }
    const chip = (f, v) => `<button type="button" class="var-chip" data-dvar="${esc(v)}" data-target="dc-f-${f}" aria-label="Insert ${esc(v)}"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>${esc(v)}</button>`;
    return EL_INTRO + (EL_FIELDS[k] || []).map(([f, head, type, label]) => `
      <div class="fpp-box">
        <h3 class="fpp-box-title">${head}</h3>
        <div class="fpp-field">
          <label class="fpp-label" for="dc-f-${f}">${label}</label>
          ${type === 'textarea' ? `<textarea class="fp-textarea" id="dc-f-${f}" data-elf="${f}" rows="3"${PH[k] ? ` placeholder="${PH[k]}"` : ''}>${esc(pv(d, k, f))}</textarea>`
            : `<input class="fp-input" id="dc-f-${f}" type="text" data-elf="${f}" value="${esc(pv(d, k, f))}" autocomplete="off"${PH[k] ? ` placeholder="${PH[k]}"` : ''}>`}
        </div>
        ${NO_VARS.includes(k) ? '' : `<div class="dc-vars-in">
          <span class="fpp-label" id="dc-vars-${f}">Personalization Variables</span>
          <div class="var-chips" role="group" aria-labelledby="dc-vars-${f}">${VARIABLES.map(v => chip(f, v)).join('')}</div>
        </div>`}
      </div>`).join('');
  }
  // Templates are approved designs: Appearance only explains that the layout is locked
  function appearanceTabHTML() {
    return `<p class="fpp-intro">Appearance controls how this element looks on the document, such as its size, alignment and position on the page.</p>
      <div class="ntw-info dc-lock" role="note" aria-labelledby="dc-lock-t">
        <p class="ntw-info-title" id="dc-lock-t">${I.lock} Template Locked</p>
        <p class="ntw-info-text">Layout, size and position are locked to preserve the approved document design. You can still edit the element content.</p>
      </div>`;
  }
  function openElView(focusTab) {
    const k = W.sel, ev = $('dc-el-view'), tab = W.elTab || 'element';
    $('dc-list-view').hidden = true; ev.hidden = false;
    ev.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="dc-el-back">${I.left} Back to document items</button>
        <h2 class="fpp-title" id="dc-el-title">Item Properties</h2>
      </div>
      <div class="fpp-tabs-wrap">
        <div class="fpp-tabs" role="tablist" aria-labelledby="dc-el-title">
          <button type="button" role="tab" id="dc-tab-element" aria-controls="dc-el-body" aria-selected="${tab === 'element'}" tabindex="${tab === 'element' ? 0 : -1}" data-eltab="element">Element</button>
          <button type="button" role="tab" id="dc-tab-appearance" aria-controls="dc-el-body" aria-selected="${tab === 'appearance'}" tabindex="${tab === 'appearance' ? 0 : -1}" data-eltab="appearance">Appearance</button>
        </div>
      </div>
      <div class="fp-scroll"><div class="fpp-body" id="dc-el-body" role="tabpanel" aria-labelledby="dc-tab-${tab}">
        ${tab === 'element' ? elementTabHTML(k) : appearanceTabHTML(k)}
      </div></div>`;
    if (focusTab) $('dc-tab-' + tab).focus();
  }
  function takeLogo(f) {
    if (!f) return;
    const err = $('dc-logo-err');
    if (!/^image\/(png|jpeg|svg\+xml)$/.test(f.type)) { if (err) { err.textContent = 'Choose a PNG, SVG or JPG file'; err.hidden = false; } return; }
    const r = new FileReader();
    r.onload = () => { P('logo').src = String(r.result); redrawTemplate(); openElView(false); $('dc-logo-rm')?.focus(); S.announce('Logo uploaded.'); };
    r.readAsDataURL(f);
  }
  function closeElView() {
    const k = W.sel; W.sel = null;
    $('dc-el-view').hidden = true; $('dc-list-view').hidden = false;
    view.querySelectorAll('[data-row]').forEach(r => { r.classList.remove('is-sel'); r.querySelector('[data-pick]').setAttribute('aria-pressed', 'false'); });
    redrawTemplate();
    view.querySelector(`[data-pick="${k}"]`)?.focus();
  }
  function wireElView() {
    const ev = $('dc-el-view');
    ev.addEventListener('click', e => {
      const t = e.target;
      if (t.closest('#dc-el-back')) return closeElView();
      const tb = t.closest('[data-eltab]'); if (tb) { W.elTab = tb.dataset.eltab; return openElView(true); }
      if (t.closest('[data-elqr]')) { const b = t.closest('[data-elqr]'); W.doc.els.qr = W.doc.els.qr === false; b.setAttribute('aria-checked', String(W.doc.els.qr !== false));
        view.querySelector('[data-sw="qr"]')?.setAttribute('aria-checked', String(W.doc.els.qr !== false)); redrawTemplate(); S.announce(`QR code ${W.doc.els.qr !== false ? 'shown' : 'hidden'}.`); return; }
      if (t.closest('[data-elbold]')) { const b = t.closest('[data-elbold]'), a = P(W.sel); a.bold = !a.bold; b.setAttribute('aria-checked', String(a.bold)); redrawTemplate(); return; }
      if (t.closest('#dc-logo-up')) return $('dc-logo-file').click();
      if (t.closest('#dc-logo-rm')) { delete P('logo').src; redrawTemplate(); openElView(false); $('dc-logo-up')?.focus(); S.announce('Logo removed.'); }
    });
    ev.addEventListener('keydown', e => {
      const tb = e.target.closest('[data-eltab]'); if (!tb || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault(); W.elTab = W.elTab === 'element' ? 'appearance' : 'element'; openElView(true);
    });
    ev.addEventListener('input', e => { const f = e.target.dataset.elf; if (!f || e.target.tagName === 'SELECT') return; P(W.sel)[f] = e.target.value; redrawTemplate(); });
    ev.addEventListener('focusin', e => { if (e.target.dataset.elf && e.target.tagName !== 'SELECT') lastField = e.target; });
    ev.addEventListener('click', e => {
      const chip = e.target.closest('[data-dvar]'); if (!chip) return;
      const fld = $(chip.dataset.target) || ((lastField && ev.contains(lastField)) ? lastField : ev.querySelector('[data-elf]:not(select)')); if (!fld) return;
      const token = `{${chip.dataset.dvar}}`, a = fld.selectionStart ?? fld.value.length, b = fld.selectionEnd ?? fld.value.length;
      fld.value = fld.value.slice(0, a) + token + fld.value.slice(b);
      P(W.sel)[fld.dataset.elf] = fld.value; redrawTemplate();
      fld.focus(); fld.setSelectionRange(a + token.length, a + token.length);
      S.announce(`${chip.dataset.dvar} added.`);
    });
    ev.addEventListener('dragover', e => { const z = e.target.closest('#dc-logo-drop'); if (z && [...e.dataTransfer.types].includes('Files')) { e.preventDefault(); z.classList.add('is-over'); } });
    ev.addEventListener('dragleave', e => { const z = e.target.closest('#dc-logo-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
    ev.addEventListener('drop', e => { const z = e.target.closest('#dc-logo-drop'); if (!z) return; e.preventDefault(); z.classList.remove('is-over'); takeLogo(e.dataTransfer.files[0]); });
    ev.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.elf && t.tagName === 'SELECT') { P(W.sel)[t.dataset.elf] = t.value; return; }
      if (t.dataset.look) { P(W.sel)[t.dataset.look] = t.value; redrawTemplate(); return; }
      if (t.id === 'dc-logo-file') { takeLogo(t.files[0]); t.value = ''; }
    });
  }

  // 3b. Upload editor: uploaded pages · preview · Document Properties
  function showUploadEditor() {
    setScreen('upload');
    const d = W.doc;
    view.innerHTML = `${subbar}
    <div class="form-body dc-up-body">
      <aside class="dc-pages" aria-labelledby="dc-pages-title">
        <div class="fp-head dc-pages-head"><h2 class="fp-title" id="dc-pages-title">Uploaded Documents</h2></div>
        <div class="fp-scroll"><ol class="dc-page-list" id="dc-page-list" aria-labelledby="dc-pages-title"></ol></div>
        <div class="fp-foot"><button type="button" class="btn btn-secondary" id="dc-add">${I.plus} Add Documents</button></div>
      </aside>
      <div class="form-main dc-main">
        ${editorHead(d)}
        <div class="dc-zoom" role="group" aria-label="Zoom">
          <button type="button" class="icon-btn" data-zoom="out" aria-label="Zoom out" title="Zoom out"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
          <button type="button" class="dc-zoom-l" data-zoom="fit" id="dc-zoom-l" title="Fit the page" aria-label="Zoom level. Select to fit the page">Fit</button>
          <button type="button" class="icon-btn" data-zoom="in" aria-label="Zoom in" title="Zoom in"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="dc-stage" id="dc-stage"></div>
      </div>
      <aside class="form-panel" aria-label="Document items">
        <div class="panel-view" id="dc-list-view">
          ${panelHead}
          <div class="fp-scroll" id="dc-up-props"></div>
        </div>
        <div class="panel-view" id="dc-el-view" hidden></div>
      </aside>
    </div>
    ${editorFoot}`;
    wireEditorCommon();
    $('dc-add').addEventListener('click', () => $('dc-file').click());
    $('dc-page-list').addEventListener('click', onPageListClick);
    $('dc-page-list').addEventListener('keydown', onPageListKey);
    wirePageDrag();
    $('dc-stage').addEventListener('click', e => { if (e.target.closest('#dc-browse')) $('dc-file').click(); });
    wireDrop();
    wireVarTokens();
    wireUpEl();
    $('dc-up-props').addEventListener('click', onUpProps);
    drawPages(); drawStage(); drawUpProps();
    $('dc-ed-title').focus();
  }
  function drawPages() {
    const d = W.doc;
    $('dc-page-list').innerHTML = d.pages.length ? d.pages.map((p, i) => `
      <li class="dc-fcard dc-page${i === W.page ? ' is-sel' : ''}" data-i="${i}" draggable="true">
        <button type="button" class="dc-fcard-img dc-page-thumb" data-show="${i}" aria-current="${i === W.page ? 'true' : 'false'}" aria-label="File ${i + 1}: ${esc(p.label)}. Show in preview">
          <span class="dc-ar-badge" aria-hidden="true">${i + 1}</span><img src="${p.src}" alt="">
        </button>
        <div class="dc-ar-row">
          <button type="button" class="dc-ar-grip" data-pgrip="${i}" aria-label="Move file ${i + 1}, ${esc(p.label)}. Use the arrow keys to change its position">${I.grip}</button>
          <div class="dc-ar-names"><h3 class="dc-ar-fname" title="${esc(p.label)}">${esc(p.label)}</h3></div>
          <button type="button" class="icon-btn dc-ar-rm" data-rm="${i}" aria-label="Delete file ${i + 1}, ${esc(p.label)}">${I.trash}</button>
        </div>
      </li>`).join('') : `<li class="field-empty dc-pages-empty"><svg class="field-empty-ico" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h4l2 3h4l2-3h4M4 13l2.5-7h11L20 13v5a1 1 0 01-1 1H5a1 1 0 01-1-1z"/></svg><span>No pages added yet.</span></li>`;
  }
  function drawStage() {
    const d = W.doc;
    $('dc-stage').innerHTML = d.pages.length ? uploadPage(d, W.page, true)
      : `<div class="dc-drop" id="dc-drop">
          <span class="dc-drop-ico">${I.upload}</span>
          <p class="dc-drop-text">Drag and drop your files or <button type="button" class="dc-browse" id="dc-browse">Browse in my files</button></p>
          <p class="dc-drop-hint">Upload one image for each page. Accepted: PNG, JPG</p>
          <p class="error" id="dc-drop-err" hidden>Add at least one page.</p>
        </div>`;
    fitTemplate();
    placeResize();
  }
  function selEl() { const sl = W && W.usel; if (!sl) return null; return $('dc-stage').querySelector(sl.t === 'qr' ? '[data-up-qr]' : `[data-var-i="${sl.i}"]`); }
  function placeResize() {
    const el = selEl(), nb = $('dc-stage')?.querySelector('.dc-nudge');
    // arrow bar sits under the element's real height (variables grow with their font size)
    const h = $('dc-stage')?.querySelector('[data-resize]'), z = W.zoom || 1;
    // leave room for the resize handle (half of it hangs below the corner) so the arrows never overlap it
    if (el && nb) {
      const gap = (h ? 11 + 10 : 8) / z, below = el.offsetTop + el.offsetHeight + gap;
      nb.style.top = (below + nb.offsetHeight <= 842 ? below : Math.max(0, el.offsetTop - nb.offsetHeight - 8 / z)) + 'px';
      nb.style.left = Math.max(0, Math.min(el.offsetLeft + el.offsetWidth / 2 - nb.offsetWidth / 2, 595 - nb.offsetWidth)) + 'px';   // centred under the element
      if (h && below + nb.offsetHeight > 842) nb.style.left = Math.max(0, el.offsetLeft - nb.offsetWidth - 8 / z) + 'px';
    }
    if (!h || !el) return;
    h.style.left = (el.offsetLeft + el.offsetWidth) + 'px'; h.style.top = (el.offsetTop + el.offsetHeight) + 'px';
  }
  /* Upload panel (reference): QR Code switch; Dynamic Variable switch → System Variable + Application Variable boxes,
     each listing the variables on this page and an "+ Add …" button that opens a picker. Added variables are placed on the page. */
  const SYS_VARS = ['Citizen Name', 'Application Number', 'Submission Date', 'Current State', 'Mobile Number'];
  const APP_VARS = ['Business Name', 'Established Date', 'Street Name', 'Pincode', 'Email', 'Contact'];
  // Upload editor only: payment + bill details
  const PAY_VARS = ['Amount Paid', 'Payment Date', 'Transaction ID', 'Payment Mode', 'Receipt Number'];
  const BILL_VARS = ['Bill Number', 'Bill Amount', 'Due Date', 'Billing Period', 'Late Fee'];
  const VAR_KINDS = {
    system: ['System Variable', SYS_VARS, 'system', 'Details the system fills in for each application, such as the application number.'],
    app: ['Application Variable', APP_VARS, 'application', 'Answers from the application form, such as the business name.'],
    payment: ['Payment Variable', PAY_VARS, 'payment', 'Details of the payment made, such as the amount paid and the transaction ID.'],
    bill: ['Bill Variable', BILL_VARS, 'bill', 'Details of the bill raised, such as the bill amount and the due date.'],
  };
  // the last variable deleted -> Personalization Variables switches off and its boxes go away
  function varsEmpty() { const d = W.doc; if (d.varsOn && !(d.vars || []).length) { d.varsOn = false; return true; } return false; }
  function drawUpProps() {
    const d = W.doc, here = (d.vars || []).filter(v => v.page === W.page);
    const group = (kind, title, tipText, all) => {
      const mine = here.filter(v => (v.kind || (SYS_VARS.includes(v.name) || v.name === 'Name' ? 'system' : PAY_VARS.includes(v.name) ? 'payment' : BILL_VARS.includes(v.name) ? 'bill' : 'app')) === kind);
      const left = all.filter(x => !mine.some(v => v.name === x));
      const id = `dc-uv-${kind}`;
      return `<div class="dc-uv-card">
        <div class="dc-uv-head"><span class="dc-uv-title" id="${id}-t">${title}</span>${tip(`${id}-tip`, title.toLowerCase(), tipText)}</div>
        ${mine.length ? `<ul class="dc-uv-list" aria-labelledby="${id}-t">${mine.map(v => `<li class="dc-uv-item"><button type="button" class="dc-uv-open" data-upsel-var="${d.vars.indexOf(v)}">${esc(v.name)}</button>
          <button type="button" class="icon-btn dc-uv-del" data-rmvar="${d.vars.indexOf(v)}" aria-label="Delete ${esc(v.name)}">${I.trashS}</button></li>`).join('')}</ul>` : ''}
        <button type="button" class="btn btn-secondary dc-uv-add" data-uvadd="${kind}"${d.pages.length && left.length ? '' : ' disabled'} aria-describedby="${id}-t">${I.plus} Add ${title}</button>
      </div>`;
    };
    $('dc-up-props').innerHTML = `
      <div class="fp-section">
        <div class="fpp-box${d.qr ? ' dc-click-box' : ''}" data-qr-box><div class="fpp-box-head"><h4 class="fpp-box-title">${d.qr ? '<button type="button" class="dc-uv-open dc-uv-open-t" data-upsel-qr>QR Code</button>' : 'QR Code'}</h4>
          <button type="button" class="switch" role="switch" data-usw="qr" aria-checked="${!!d.qr}" aria-label="QR Code"><span class="switch-knob" aria-hidden="true"></span></button></div>
        </div>
        <div class="fpp-box"><div class="fpp-box-head"><h4 class="fpp-box-title">Personalization Variables</h4>
          <button type="button" class="switch" role="switch" data-usw="varsOn" aria-checked="${!!d.varsOn}" aria-label="Personalization Variables"><span class="switch-knob" aria-hidden="true"></span></button></div>
          ${d.varsOn ? group('system', 'System Variable', 'Details the system fills in for each application, such as the application number.', SYS_VARS)
                     + group('app', 'Application Variable', 'Answers from the application form, such as the business name.', APP_VARS)
                     + group('payment', VAR_KINDS.payment[0], VAR_KINDS.payment[3], PAY_VARS)
                     + group('bill', VAR_KINDS.bill[0], VAR_KINDS.bill[3], BILL_VARS) : ''}
        </div>
      </div>`;
    view.querySelectorAll('#dc-up-props .tip').forEach(t => { const b2 = t.querySelector('.tip-btn'); if (!b2) return;
      b2.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      b2.addEventListener('blur', () => t.classList.remove('open', 'dismissed')); });
  }
  // Add System / Application Variable popup (design: icon + title, description, Dynamic Variable* select, Cancel | Add Variable)
  const vdlg = $('dc-var-dlg'); let vdKind = null, vdBack = null;
  function openVarDlg(kind, from) {
    vdKind = kind; vdBack = from;
    const d = W.doc, here = (d.vars || []).filter(v => v.page === W.page), all = VAR_KINDS[kind][1];
    const left = all.filter(x => !here.some(v => v.name === x));   // variables already on this page are not listed again
    $('dc-vd-title-t').textContent = `Add ${VAR_KINDS[kind][0]}`;
    $('dc-vd-desc').textContent = `Select personalization variables from the ${VAR_KINDS[kind][2]} to insert into the document.`;
    const list = $('dc-vd-list');
    list.querySelectorAll('.check-row').forEach(r => r.remove());
    left.forEach(x => list.insertAdjacentHTML('beforeend', `<label class="check-row"><input type="checkbox" name="dc-vd" value="${esc(x)}"> {${esc(x)}}</label>`));
    $('dc-vd-err').hidden = true; list.removeAttribute('aria-invalid');
    vdlg.showModal(); list.querySelector('input')?.focus();
  }
  $('dc-vd-list').addEventListener('change', () => { $('dc-vd-err').hidden = true; $('dc-vd-list').removeAttribute('aria-invalid'); });
  $('dc-vd-form').addEventListener('submit', e => {
    e.preventDefault();
    const names = [...$('dc-vd-list').querySelectorAll('input:checked')].map(i => i.value);
    if (!names.length) { $('dc-vd-err').hidden = false; $('dc-vd-list').setAttribute('aria-invalid', 'true'); $('dc-vd-list').querySelector('input')?.focus(); return; }
    const d = W.doc, kind = vdKind;
    d.vars = d.vars || [];
    names.forEach(name => { const n = d.vars.filter(v => v.page === W.page).length; d.vars.push({ page: W.page, name, kind, x: 64, y: 120 + (n % 12) * 40 }); });
    vdBack = null; vdlg.close(); drawStage(); drawUpProps();
    $('dc-up-props').querySelector(`[data-uvadd="${kind}"]`)?.focus();
    const label = names.length === 1 ? names[0] : `${names.length} variables`;
    S.toast(`${label} added`);
    S.announce(`${label} added to page ${W.page + 1}. Drag each one into place, or select it in the preview and use the arrow keys.`);
  });
  vdlg.addEventListener('close', () => { if (vdBack && document.contains(vdBack)) vdBack.focus(); vdBack = null; });

  function onUpProps(e) {
    const ov = e.target.closest('[data-upsel-var]'), oq = e.target.closest('[data-upsel-qr]') || (!e.target.closest('[data-usw]') && W.doc.qr && e.target.closest('[data-qr-box]'));
    if (ov) return selectUp({ t: 'var', i: +ov.dataset.upselVar });
    if (oq) return selectUp({ t: 'qr' });
    const d = W.doc, sw = e.target.closest('[data-usw]'), add = e.target.closest('[data-uvadd]'), rm = e.target.closest('[data-rmvar]');
    if (sw) {
      const k = sw.dataset.usw; d[k] = !d[k]; drawUpProps(); drawStage();
      if (k === 'qr' && d.qr) $('dc-stage').querySelector('.dp-qr')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      $('dc-up-props').querySelector(`[data-usw="${k}"]`).focus();
      S.announce(`${sw.getAttribute('aria-label')} turned ${d[k] ? 'on' : 'off'}.`); return;
    }
    if (add && !add.disabled) return openVarDlg(add.dataset.uvadd, add);
    if (rm) {
      const [gone] = d.vars.splice(+rm.dataset.rmvar, 1); const off = varsEmpty(); drawStage(); drawUpProps();
      ($('dc-up-props').querySelector('[data-rmvar]') || $('dc-up-props').querySelector(off ? '[data-usw="varsOn"]' : '[data-uvadd]'))?.focus();
      S.announce(`${gone.name} removed from page ${W.page + 1}.${off ? ' No variables left, so Personalization Variables is now off.' : ''}`);
    }
  }
  function showPage(i, focusThumb) {
    W.page = i; drawPages(); drawStage(); drawUpProps();
    if (focusThumb) $('dc-page-list').querySelector(`[data-show="${i}"]`)?.focus();
  }
  function reorder(d, from, to) {
    const [p] = d.pages.splice(from, 1); d.pages.splice(to, 0, p);
    (d.vars || []).forEach(v => { if (v.page === from) v.page = to; else if (from < to && v.page > from && v.page <= to) v.page--; else if (from > to && v.page >= to && v.page < from) v.page++; });
  }
  function removePage(d, i) {
    d.pages.splice(i, 1); d.vars = (d.vars || []).filter(v => v.page !== i).map(v => ({ ...v, page: v.page > i ? v.page - 1 : v.page }));
  }
  function movePage(from, to) {
    reorder(W.doc, from, to);
    W.page = to; drawPages(); drawStage(); drawUpProps();
  }
  function onPageListClick(e) {
    const d = W.doc, b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.show !== undefined) return showPage(+b.dataset.show, false);
    if (b.dataset.up !== undefined) { const i = +b.dataset.up; movePage(i, i - 1); S.announce(`Page moved up. It is now page ${i}.`);
      return $('dc-page-list').querySelector(`[data-up="${i - 1}"]`)?.focus() || $('dc-page-list').querySelector(`[data-down="${i - 1}"]`)?.focus(); }
    if (b.dataset.down !== undefined) { const i = +b.dataset.down; movePage(i, i + 1); S.announce(`Page moved down. It is now page ${i + 2}.`);
      return $('dc-page-list').querySelector(`[data-down="${i + 1}"]`)?.focus() || $('dc-page-list').querySelector(`[data-up="${i + 1}"]`)?.focus(); }
    if (b.dataset.rm !== undefined) {
      const i = +b.dataset.rm, label = d.pages[i].label;
      d.pages.splice(i, 1); d.vars = (d.vars || []).filter(v => v.page !== i).map(v => ({ ...v, page: v.page > i ? v.page - 1 : v.page }));
      W.page = Math.max(0, Math.min(W.page >= i ? W.page - (W.page > i ? 1 : 0) : W.page, d.pages.length - 1));
      drawPages(); drawStage(); drawUpProps();
      ($('dc-page-list').querySelector(`[data-show="${Math.min(i, d.pages.length - 1)}"]`) || $('dc-add')).focus();
      S.announce(`${label} deleted.`);
    }
  }
  function onPageListKey(e) {
    const g = e.target.closest('[data-pgrip]'); if (!g) return;
    const i = +g.dataset.pgrip, n = W.doc.pages.length;
    const to = (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? i - 1 : (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? i + 1 : null;
    if (to === null) return; e.preventDefault(); if (to < 0 || to >= n) return;
    movePage(i, to); $('dc-page-list').querySelector(`[data-pgrip="${to}"]`)?.focus(); S.announce(`File moved. It is now file ${to + 1} of ${n}.`);
  }
  function wirePageDrag() {
    const ol = $('dc-page-list'); let from = null;
    ol.addEventListener('dragstart', e => { const li = e.target.closest('.dc-page'); if (!li) return; from = +li.dataset.i; li.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(from)); });
    ol.addEventListener('dragend', () => { from = null; ol.querySelectorAll('.dc-page').forEach(x => x.classList.remove('dragging', 'drop-target')); });
    ol.addEventListener('dragover', e => { if (from === null) return; const li = e.target.closest('.dc-page'); if (!li) return; e.preventDefault();
      ol.querySelectorAll('.dc-page').forEach(x => x.classList.toggle('drop-target', x === li && +li.dataset.i !== from)); });
    ol.addEventListener('drop', e => { const li = e.target.closest('.dc-page'); if (from === null || !li) return; e.preventDefault();
      const to = +li.dataset.i; if (to !== from) { movePage(from, to); S.announce(`Page moved. It is now page ${to + 1}.`); } from = null; });
  }
  // Files → pages (each image is one page; scaled down so the prototype can keep it in this browser)
  function readImage(file) {
    return new Promise(res => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const w = Math.min(900, img.width), h = Math.round(img.height * w / img.width), c = document.createElement('canvas');
          c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => res(null); img.src = r.result;
      };
      r.onerror = () => res(null); r.readAsDataURL(file);
    });
  }
  async function addFiles(files) {
    if (!W || W.doc.kind !== 'UPLOAD') return;
    const ok = [...files].filter(f2 => /^image\/(png|jpeg)$/.test(f2.type));
    if (!ok.length) { S.announce('Only PNG and JPG images can be added.'); return; }
    const first = W.doc.pages.length;
    for (const file of ok) { const src = await readImage(file); if (src) W.doc.pages.push({ src, label: file.name.replace(/\.[^.]+$/, '') }); }
    S.announce(`${ok.length} page${ok.length === 1 ? '' : 's'} added.`);
    if (screen === 'arrange') { drawArrange(); $('dc-ar-grid').querySelector(`[data-ar-i="${first}"] .dc-ar-thumb`)?.focus(); return; }
    W.page = first; drawPages(); drawStage(); drawUpProps();
    $('dc-page-list').querySelector(`[data-show="${first}"]`)?.focus();
  }
  $('dc-file').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
  function wireDrop() {
    const stage = $('dc-stage');
    stage.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); $('dc-drop')?.classList.add('is-over'); } });
    stage.addEventListener('dragleave', () => $('dc-drop')?.classList.remove('is-over'));
    stage.addEventListener('drop', e => { if (!e.dataTransfer.files.length) return; e.preventDefault(); $('dc-drop')?.classList.remove('is-over'); addFiles(e.dataTransfer.files); });
  }
  // Variable tokens on the page: drag with a pointer, or arrow keys (Shift = bigger steps); Delete removes
  function wireVarTokens() {
    const stage = $('dc-stage'); let drag = null, justDragged = false, rs = null;
    const isQR = () => W.usel && W.usel.t === 'qr';
    const setSize = (b, w, h) => { w = Math.round(Math.max(16, Math.min(595 - b.x, w))); h = Math.round(Math.max(16, Math.min(842 - b.y, h)));
      if (isQR()) { const m = Math.min(Math.max(w, h), 595 - b.x, 842 - b.y); w = h = m; } b.w = w; b.h = h; };
    stage.addEventListener('pointerdown', e => { const hd = e.target.closest('[data-resize]'); if (!hd) return; e.stopPropagation(); e.preventDefault();
      const el = selEl(), b = upBox(W.usel); rs = { b, el, sx: e.clientX, sy: e.clientY, w: b.w || el.offsetWidth, h: b.h || el.offsetHeight, fs: b.size || 13, moved: false };
      rs.tag = document.createElement('div'); rs.tag.className = 'db-ghost-l'; rs.tag.setAttribute('aria-hidden', 'true'); document.body.appendChild(rs.tag);   // same size label as the dashboard
      document.body.classList.add('db-resizing-xy'); hd.setPointerCapture(e.pointerId); }, true);
    stage.addEventListener('pointermove', e => { if (!rs) return; const z = W.zoom || 1, dx = (e.clientX - rs.sx) / z, dy = (e.clientY - rs.sy) / z; rs.moved = true;
      if (isQR()) { setSize(rs.b, rs.w + dx, rs.h + dy); rs.el.style.width = rs.b.w + 'px'; rs.el.style.height = rs.b.h + 'px'; }
      else { let f = Math.round(Math.max(6, Math.min(96, rs.fs * (rs.h + Math.max(dx * rs.h / rs.w, dy)) / rs.h))); rs.el.style.fontSize = f + 'px';
        while (f > 6 && (rs.el.offsetLeft + rs.el.offsetWidth > 595 || rs.el.offsetTop + rs.el.offsetHeight > 842)) { f--; rs.el.style.fontSize = f + 'px'; }   // stays on the page
        rs.b.size = f; }
      placeResize(); stage.querySelector('.dc-nudge')?.remove();
      const t = rs.tag; t.textContent = isQR() ? `${rs.b.w} × ${rs.b.h} px` : `Font ${rs.b.size} px`;
      t.style.left = Math.min(innerWidth - t.offsetWidth - 8, e.clientX + 16) + 'px'; t.style.top = Math.min(innerHeight - t.offsetHeight - 8, e.clientY + 18) + 'px'; });
    const endRs = () => { if (!rs) return; const r = rs; rs = null; r.tag.remove(); document.body.classList.remove('db-resizing-xy');
      if (r.moved) { drawStage(); syncUpInputs(); $('dc-stage').querySelector('[data-resize]')?.focus(); } };
    stage.addEventListener('pointerup', endRs); stage.addEventListener('pointercancel', endRs);
    stage.addEventListener('keydown', e => { const hd = e.target.closest('[data-resize]'); if (!hd) return;
      const step = e.shiftKey ? 24 : 4, d = { ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowDown: [0, step], ArrowUp: [0, -step] }[e.key]; if (!d) return;
      e.preventDefault(); e.stopPropagation(); const el = selEl(), b = upBox(W.usel);
      if (!isQR()) { const up = e.key === 'ArrowUp' || e.key === 'ArrowRight'; b.size = Math.max(6, Math.min(96, (b.size || 13) + (up ? 1 : -1) * (e.shiftKey ? 4 : 1)));
        drawStage(); syncUpInputs(); $('dc-stage').querySelector('[data-resize]')?.focus(); S.announce(`Font size ${b.size} pixels.`); return; }
      setSize(b, (b.w || el.offsetWidth) + d[0], (b.h || el.offsetHeight) + d[1]); drawStage(); syncUpInputs();
      $('dc-stage').querySelector('[data-resize]')?.focus(); S.announce(`Size ${b.w} by ${b.h}.`); }, true);
    const which = el => { const v = el.closest('.dp-var[data-var-i]'); if (v) return { t: 'var', i: +v.dataset.varI, el: v };
      const q = el.closest('[data-up-qr]'); return q ? { t: 'qr', el: q } : null; };
    stage.addEventListener('pointerdown', e => { if (e.target.closest('[data-nudge]')) return; const w = which(e.target); if (!w) return;
      const b = upBox(w); drag = { w, b, sx: e.clientX, sy: e.clientY, x: b.x, y: b.y, moved: false }; w.el.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!drag) return; const z = W.zoom || 1, dx = (e.clientX - drag.sx) / z, dy = (e.clientY - drag.sy) / z;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return; drag.moved = true; drag.w.el.classList.add('is-drag');
      drag.b.x = drag.x + dx; drag.b.y = drag.y + dy; clampBox(drag.b); drag.w.el.style.left = drag.b.x + 'px'; drag.w.el.style.top = drag.b.y + 'px';
      stage.querySelector('.dc-nudge')?.remove(); });
    stage.addEventListener('pointerup', () => { if (!drag) return; const d2 = drag; drag = null; d2.w.el.classList.remove('is-drag');
      if (d2.moved) { justDragged = true; drawStage(); syncUpInputs(); } });
    stage.addEventListener('click', e => {
      const n = e.target.closest('[data-nudge]'); if (n) return nudgeSel(n.dataset.nudge, e.shiftKey);
      const w = which(e.target); if (!w) return;
      if (justDragged) { justDragged = false; return; }
      selectUp(w.t === 'qr' ? { t: 'qr' } : { t: 'var', i: w.i });
    });
    stage.addEventListener('keydown', e => {
      const w = which(e.target); if (!w) return;
      const b = upBox(w), step = e.shiftKey ? 24 : 4;
      const mv = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (mv) { e.preventDefault(); b.x += mv[0]; b.y += mv[1]; clampBox(b); drawStage(); syncUpInputs();
        stage.querySelector(w.t === 'qr' ? '[data-up-qr]' : `[data-var-i="${w.i}"]`)?.focus(); return; }
      if (w.t === 'var' && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); const v = W.doc.vars[w.i]; W.doc.vars.splice(w.i, 1); varsEmpty();
        if (W.usel) { W.usel = null; $('dc-el-view').hidden = true; $('dc-list-view').hidden = false; }
        drawStage(); drawUpProps(); $('dc-stage').querySelector('.dp-var')?.focus(); S.announce(`${v.name} removed from page ${W.page + 1}.`); }
    });
  }

  /* ---------- Upload editor: selected QR code / variable → element view (like the template editor) ---------- */
  const upBox = sel => sel.t === 'qr' ? qrBox(W.doc) : W.doc.vars[sel.i];
  const upName = sel => sel.t === 'qr' ? 'QR Code' : W.doc.vars[sel.i].name;
  function clampBox(b) { const w = b.w || 40, h = b.h || 24; b.x = Math.round(Math.max(0, Math.min(595 - w, b.x))); b.y = Math.round(Math.max(0, Math.min(842 - h, b.y))); }
  function selectUp(sel, keepFocus) {
    W.usel = sel; W.elTab = W.elTab || 'element';
    drawStage(); openUpEl(!keepFocus);
  }
  function openUpEl(focusTab) {
    const sel = W.usel, ev = $('dc-el-view'), tab = W.elTab || 'element', b = upBox(sel), d = W.doc;
    $('dc-list-view').hidden = true; ev.hidden = false;
    const px = (id, label, val) => `<div class="fpp-field"><label class="fpp-label" for="${id}">${label}</label>
        <div class="dc-px"><input class="fp-input" id="${id}" type="number" inputmode="numeric" min="0" step="1" value="${val ?? ''}" data-box="${id.split('-').pop()}"><span class="dc-px-suf" aria-hidden="true">px</span></div></div>`;
    const body = tab === 'element'
      ? EL_INTRO + (sel.t === 'qr'
        ? `<div class="fpp-box"><h3 class="fpp-box-title">QR Code Link</h3><div class="fpp-field"><label class="fpp-label" for="dc-uq-link">Link</label>
            <input class="fp-input" id="dc-uq-link" type="url" inputmode="url" value="${esc(d.qrLink || '')}" placeholder="Enter the link the QR code opens" autocomplete="off"></div></div>`
        : `<div class="fpp-box"><h3 class="fpp-box-title">Personalization Variable</h3><div class="fpp-field"><label class="fpp-label" for="dc-uv-name">Variable</label>
            <input class="fp-input dc-readonly" id="dc-uv-name" type="text" readonly aria-readonly="true" value="{${esc(b.name)}}"></div></div>`)
      : `<p class="fpp-intro">Appearance controls how this element looks on the document, such as its size, alignment and position on the page.</p>
         <div class="fpp-box"><h3 class="fpp-box-title">Position</h3><div class="dc-px-row">${px('dc-ap-x', 'X-Axis', b.x)}${px('dc-ap-y', 'Y-Axis', b.y)}</div></div>
         ${sel.t === 'qr'
           ? `<div class="fpp-box"><h3 class="fpp-box-title">Size</h3><div class="dc-px-row">${px('dc-ap-w', 'Width', b.w)}${px('dc-ap-h', 'Height', b.h)}</div></div>`
           : `<div class="fpp-box"><h3 class="fpp-box-title">Font</h3>
               <div class="fpp-field"><label class="fpp-label" for="dc-ap-font">Font Style</label>
                 <select class="input" id="dc-ap-font" data-font="font">${opts(Object.keys(FONTS).map(f => [f, f]), b.font || 'Helvetica')}</select></div>
               <div class="dc-px-row">
                 <div class="fpp-field"><label class="fpp-label" for="dc-ap-weight">Font Weight</label>
                   <select class="input" id="dc-ap-weight" data-font="weight">${opts(WEIGHTS, String(b.weight || 400))}</select></div>
                 ${px('dc-ap-size', 'Font Size', b.size || 13)}
               </div></div>`}`;
    ev.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="dc-el-back">${I.left} Back to document items</button>
        <h2 class="fpp-title" id="dc-el-title">Item Properties</h2>
      </div>
      <div class="fpp-tabs-wrap"><div class="fpp-tabs" role="tablist" aria-labelledby="dc-el-title">
        <button type="button" role="tab" id="dc-tab-element" aria-controls="dc-el-body" aria-selected="${tab === 'element'}" tabindex="${tab === 'element' ? 0 : -1}" data-eltab="element">Element</button>
        <button type="button" role="tab" id="dc-tab-appearance" aria-controls="dc-el-body" aria-selected="${tab === 'appearance'}" tabindex="${tab === 'appearance' ? 0 : -1}" data-eltab="appearance">Appearance</button>
      </div></div>
      <div class="fp-scroll"><div class="fpp-body" id="dc-el-body" role="tabpanel" aria-labelledby="dc-tab-${tab}">${body}</div></div>
`;
    if (focusTab) $('dc-tab-' + tab).focus();
  }
  function syncUpInputs() {
    if (!W.usel || $('dc-el-view')?.hidden) return;
    const b = upBox(W.usel);
    [['x', b.x], ['y', b.y], ['w', b.w], ['h', b.h], ['size', b.size || 13]].forEach(([k, v]) => { const el = $('dc-ap-' + k); if (el && document.activeElement !== el) el.value = v ?? ''; });
  }
  function closeUpEl() {
    const sel = W.usel; W.usel = null;
    $('dc-el-view').hidden = true; $('dc-list-view').hidden = false;
    drawStage(); drawUpProps();
    ($('dc-up-props').querySelector(sel && sel.t === 'qr' ? '[data-upsel-qr]' : `[data-upsel-var="${sel && sel.i}"]`) || $('dc-up-props').querySelector('[data-usw]'))?.focus();
  }
  function wireUpEl() {
    const ev = $('dc-el-view');
    ev.addEventListener('click', e => {
      if (e.target.closest('#dc-el-back')) return closeUpEl();
      const tb = e.target.closest('[data-eltab]'); if (tb) { W.elTab = tb.dataset.eltab; return openUpEl(true); }
      if (e.target.closest('#dc-uv-remove')) {
        const v = W.doc.vars[W.usel.i]; W.doc.vars.splice(W.usel.i, 1); W.usel = null; const off = varsEmpty();
        $('dc-el-view').hidden = true; $('dc-list-view').hidden = false; drawStage(); drawUpProps();
        $('dc-up-props').querySelector(off ? '[data-usw="varsOn"]' : '[data-uvadd]')?.focus(); S.announce(`${v.name} removed from page ${W.page + 1}.`);
      }
    });
    ev.addEventListener('keydown', e => {
      const tb = e.target.closest('[data-eltab]'); if (!tb || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault(); W.elTab = W.elTab === 'element' ? 'appearance' : 'element'; openUpEl(true);
    });
    ev.addEventListener('input', e => {
      const t = e.target;
      if (t.id === 'dc-uq-link') { W.doc.qrLink = t.value; return; }
      if (t.dataset.font && W.usel) { upBox(W.usel)[t.dataset.font] = t.dataset.font === 'weight' ? +t.value : t.value; drawStage(); return; }
      if (t.dataset.box === 'size' && W.usel) { const b2 = upBox(W.usel), n2 = Math.round(+t.value); if (t.value !== '' && n2 >= 6) { b2.size = Math.min(n2, 96); clampBox(b2); drawStage(); } return; }
      const k = t.dataset.box; if (!k || !W.usel) return;
      const b = upBox(W.usel), n = t.value === '' ? null : Math.max(0, Math.round(+t.value));
      if (k === 'w' || k === 'h') { if (n === null || n < 8) delete b[k]; else b[k] = Math.min(n, k === 'w' ? 595 : 842); }
      else if (n !== null) b[k] = n;
      clampBox(b); drawStage();
    });
  }
  // On-canvas arrows (process-flow style): 4px per press, 24px with Shift
  // Size without dragging = the Width / Height / Font Size fields in Appearance (WCAG 2.5.7)
  function nudgeSel(dir, big) {
    const b = upBox(W.usel), step = big ? 24 : 4;
    const mv = { left: [-step, 0], right: [step, 0], up: [0, -step], down: [0, step] }[dir];
    b.x += mv[0]; b.y += mv[1]; clampBox(b); drawStage(); syncUpInputs();
    $('dc-stage').querySelector(`[data-nudge="${dir}"]`)?.focus();
    S.announce(`Moved to ${b.x}, ${b.y}.`);
  }

  document.addEventListener('click', e => { if (screen === 'arrange' && !e.target.closest('.dc-ar-tools')) closeArMenus(); });
  // pf = the process flow state that started this document (from the process-flow document popup)
  let pf = null;
  const toFlow = () => { location.hash = '#/module/' + encodeURIComponent(mod.id) + '/process-flow'; };
  window.StudioDocuments = {
    render(m, focus) {
      mod = m;
      if (!store[m.id]) { store[m.id] = seed(); save(); }
      list = store[m.id];
      pf = null;
      let h = null; try { h = JSON.parse(sessionStorage.getItem('studio.docHandoff')); } catch (e) {}
      if (h && h.module === m.id) {
        sessionStorage.removeItem('studio.docHandoff');
        pf = h;
        if (h.kind === 'TEMPLATE') return showChooser('TEMPLATE');
        if (h.kind === 'COPY') {
          // Copy existing (from the process flow): a copy of the document opens in the editor, on this state
          const src = list.find(x => x.id === h.srcId);
          const cat = src ? src.cat : (Object.keys(CATS).find(k => CATS[k][0] === h.srcType) || 'certificate');
          const copy = src ? JSON.parse(JSON.stringify(src)) : { kind: 'TEMPLATE', cat, els: allOn(cat) };
          delete copy.id;
          Object.assign(copy, { name: uniqueName(`${src ? src.name : h.srcName} (copy)`), state: h.stateName });
          return openEditor(copy, { from: 'copy' });
        }
        return showDetails({ name: '', kind: 'UPLOAD', cat: '', state: h.stateName, pages: [], qr: false, varsOn: false, vars: [] }, { from: 'how' });
      }
      showList();
      if (!focus) document.activeElement?.blur();
    },
  };
})();
