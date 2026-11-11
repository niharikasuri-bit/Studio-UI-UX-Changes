/* ==========================================================
   Manage Payment — Studio Prototype (same dashboard as Notifications / Checklists)
   Route: #/module/<id>/payments. One list per module.
   Fields follow the process-flow payment popup: fee type (Fixed / Calculated / Amount entered by the user),
   currency + amount or range, host endpoint + method, payment modes (Online + integration / Offline), next step.
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.payments.v1';
  const STATES = ['Pending for Verification', 'Pending for Field Inspect', 'Payment Stage 1 - Paid', 'Approved',
                  'Manual Expired', 'Terminated', 'Auto Expired', 'Due for Renewal'];
  const FEES = { FIXED: 'Fixed amount', CALC: 'Calculated amount', USER: 'Range amount' };   // process-flow PAY_FEES
  const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'KES', 'NGN'];
  const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£', KES: 'KSh ', NGN: '₦' };
  const GATEWAYS = ['PayGov', 'Razorpay', 'Paytm'];
  const AFTER = { PROCESS: ['Continue to the next state', 'The process flow continues to the next state.'],
                  TERMINATE: ['End the process flow', 'The process flow ends. There are no more steps.'] };
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  let uid = 0; const nid = () => 'p' + Date.now().toString(36) + (uid++);
  const seed = () => [
    { id: nid(), name: 'Renewal fee', state: 'Due for Renewal', fee: 'FIXED', currency: 'INR', amount: '500', min: '', max: '', endpoint: '', method: 'POST',
      online: true, gateway: 'Razorpay', offline: true, after: 'PROCESS' },
    { id: nid(), name: 'Inspection charge', state: 'Pending for Field Inspect', fee: 'CALC', currency: 'INR', amount: '', min: '', max: '',
      endpoint: 'https://api.example.gov/fees/inspection', method: 'POST', online: true, gateway: 'PayGov', offline: false, after: 'PROCESS' },
  ];
  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plusW: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    pencilL: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    copy: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
    trash: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const opts = (list, cur, all) => (all ? `<option value="">${all}</option>` : '') + list.map(([v, t]) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(t)}</option>`).join('');
  const money = (c, a) => `${SYMBOL[c] || c + ' '}${Number(a).toLocaleString('en-IN')}`;
  const FEE_KIND = { FIXED: 'Fixed fee', CALC: 'Formula', USER: 'Entered by applicant' };
  const feeText = p => p.fee === 'FIXED' ? money(p.currency, p.amount || 0)
    : p.fee === 'USER' ? `${money(p.currency, p.min || 0)} – ${money(p.currency, p.max || 0)}` : 'Set by fee API';
  const modesText = p => [p.online && `Online (${p.gateway || 'no integration'})`, p.offline && 'Offline'].filter(Boolean).join(', ') || '—';
  // One short line for the card — never the full setup
  function summary(p) {
    const fee = p.fee === 'FIXED' ? `${money(p.currency, p.amount || 0)} fixed fee`
      : p.fee === 'CALC' ? 'Fee calculated by an external service'
      : `Applicant enters ${money(p.currency, p.min || 0)} to ${money(p.currency, p.max || 0)}`;
    const modes = [p.online && `online${p.gateway ? ` (${p.gateway})` : ''}`, p.offline && 'offline'].filter(Boolean).join(' or ');
    return `${fee} · Pay ${modes || '—'} · ${p.after === 'TERMINATE' ? 'Ends the process flow after payment' : 'Continues to the next state after payment'}`;
  }

  const view = $('view-payments');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="py-back-top" href="#">${I.back} Back to Module Dashboard</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <main class="content nt-main">
      <div class="roles-head">
        <h1 class="page-title" id="py-title" tabindex="-1">Payment</h1>
        <button type="button" class="btn btn-primary roles-new" id="py-new" aria-haspopup="dialog">${I.plusW} Create Payment</button>
      </div>
      <section class="section nt-filters" aria-label="Filter payments">
        <div class="nt-filter">
          <label class="nt-label" for="py-search">Search by payment name</label>
          <div class="nt-search"><input class="input" id="py-search" type="search" autocomplete="off" aria-describedby="py-count"><span class="rs-ico" aria-hidden="true">${I.search}</span></div>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="py-state">Process flow state</label>
          <select class="input pf-select nt-select" id="py-state">${opts(STATES.map(s => [s, s]), '', 'All states')}</select>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="py-fee">Fee type</label>
          <select class="input pf-select nt-select" id="py-fee">${opts(Object.entries(FEES), '', 'All fee types')}</select>
        </div>
        <button type="button" class="btn btn-secondary nt-clear nt-clear-btn" id="py-clear" data-clear-filters disabled>Clear Search</button>
      </section>
      <div class="nt-results" id="py-results" hidden><p class="nt-count" id="py-count" role="status"></p></div>
      <ul class="nt-list" id="py-list" aria-label="Payments"></ul>
      ${S.emptyState({ id: 'py-empty', ctaId: 'py-empty-new', ctaLabel: 'Create Payment' })}
    </main>

    <dialog class="modal ntw pyw" id="py-dialog" aria-labelledby="pyw-title-after">
      <form id="py-form" novalidate>
        <div class="ntw-body" id="pyw-body">
          <button type="button" class="icon-btn ntw-close" data-close aria-label="Close">${I.close}</button>
          <div class="ntw-bars-wrap" id="pyw-bars-wrap"><span class="sr-only" id="pyw-step-text"></span><span class="ntw-bars" id="pyw-bars" aria-hidden="true"></span></div>
          <section data-step="after">
            <h2 class="ntw-title" id="pyw-title-after">Select Next Step After Payment</h2>
            <p class="ntw-desc">Select what happens when the payment is successful.</p>
            <fieldset class="ntw-options"><legend class="sr-only">Next step after payment</legend>${Object.entries(AFTER).map(([v, [t, d]]) => `
              <label class="ntw-radio"><input type="radio" name="pyw-after" value="${v}" data-k="after"><span class="ntw-rdot" aria-hidden="true"></span><span><span class="ntw-rlabel">${t}</span><span class="ntw-rtext">${d}</span></span></label>`).join('')}
            </fieldset>
            <p class="error" id="pyw-err-after" hidden>Select what happens after payment.</p>
          </section>
          <section data-step="details" hidden>
            <h2 class="ntw-title" id="pyw-title-details">Set Up Payment</h2>
            <p class="ntw-desc">Choose how the fee amount is worked out and how people can pay the fee at this state.</p>
            <div class="ntw-fields pyw-fields" id="pyw-fields"></div>
          </section>
        </div>
        <div class="ntw-foot">
          <button type="button" class="btn btn-secondary" id="pyw-back">Cancel</button>
          <button type="submit" class="btn btn-primary" id="py-submit">Next</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal pfc" id="py-confirm" aria-labelledby="pyc-title" aria-describedby="pyc-desc">
      <button type="button" class="icon-btn pfc-close" data-close aria-label="Close">${I.close}</button>
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="pyc-title"></h2>
      <p class="pfc-desc" id="pyc-desc"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-close id="pyc-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="pyc-ok">Delete</button>
      </div>
    </dialog>`;

  let mod = null, list = [];
  const f = { q: '', state: '', fee: '' };
  function render() {
    const qq = f.q.trim().toLowerCase();
    const shown = list.filter(p => (!qq || p.name.toLowerCase().includes(qq)) && (!f.state || p.state === f.state) && (!f.fee || p.fee === f.fee));
    $('py-list').innerHTML = shown.map(p => `
      <li class="nt-card">
        <div class="nt-body">
          <h2 class="nt-name" id="py-n-${p.id}">${esc(p.name)}</h2>
          <ul class="nt-tags" aria-label="Details">
            <li class="nt-tag nt-tag-state">${esc(p.state)}</li>
            <li class="nt-tag nt-tag-type">${FEES[p.fee]}</li>
          </ul>
          <dl class="py-facts">
            <div class="py-fact-amount"><dt>Fee amount</dt><dd>${esc(feeText(p))}</dd></div>
            <div><dt>Payment mode</dt><dd>${[p.online && 'Online', p.offline && 'Offline'].filter(Boolean).join(', ') || '—'}</dd></div>
            <div><dt>Payment integration</dt><dd>${p.online && p.gateway ? esc(p.gateway) : '<span aria-hidden="true">-</span><span class="sr-only">None</span>'}</dd></div>
          </dl>
        </div>
        <div class="nt-foot">
          <button type="button" class="nt-del" data-del="${p.id}" aria-describedby="py-n-${p.id}" aria-haspopup="dialog">${I.trash} Delete</button>
          <span class="nt-right">
            <button type="button" class="btn btn-secondary nt-act" data-dup="${p.id}" aria-describedby="py-n-${p.id}" aria-haspopup="dialog">${I.copy} Copy</button>
            <button type="button" class="btn btn-secondary nt-act" data-edit="${p.id}" aria-describedby="py-n-${p.id}" aria-haspopup="dialog">${I.pencil} Edit</button>
          </span>
        </div>
      </li>`).join('');
    $('py-empty').hidden = shown.length > 0;
    document.querySelector('.nt-filters[aria-label="Filter payments"]').hidden = !list.length;   // nothing created yet → no search/filters
    $('py-new').hidden = !list.length;   // nothing created yet → only the empty-state CTA
    if (!shown.length) list.length
      ? S.setEmpty($('py-empty'), false, 'No results found', 'Nothing matches your search or filters. Check the spelling, or change the filters.')
      : S.setEmpty($('py-empty'), true, 'No payments yet', 'Create a payment to collect a fee from applicants.');
    $('py-count').textContent = (qq || f.state || f.fee) ? `${shown.length} payment${shown.length === 1 ? '' : 's'} found.` : '';
    $('py-results').hidden = !(qq || f.state || f.fee);
    $('py-clear').disabled = !(qq || f.state || f.fee);
  }
  $('py-search').addEventListener('input', e => { f.q = e.target.value; render(); });
  $('py-state').addEventListener('change', e => { f.state = e.target.value; render(); });
  $('py-fee').addEventListener('change', e => { f.fee = e.target.value; render(); });
  const persist = () => { store[mod.id] = list; save(); };

  /* ---------- Confirm ---------- */
  const conf = $('py-confirm'); let confOk = null, confBack = null;
  function confirmPF({ title, desc, cta, onOk, back }) {
    $('pyc-title').textContent = title; $('pyc-desc').innerHTML = desc; $('pyc-ok').textContent = cta;
    confOk = onOk; confBack = back || null; conf.showModal(); $('pyc-cancel').focus();
  }
  $('pyc-ok').addEventListener('click', () => { const f2 = confOk; confOk = null; conf.close(); f2 && f2(); });
  conf.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => conf.close()));
  conf.addEventListener('click', e => { if (e.target === conf) conf.close(); });
  conf.addEventListener('close', () => { if (confOk === null) return; confOk = null; confBack && document.contains(confBack) && confBack.focus(); });
  const LINKED = 'This payment is linked to a process flow state. Any change you make here will also be changed in the process flow.';

  /* ---------- Editor = process-flow payment popup ----------
       Step 1 "Select Next Step After Payment" → Step 2 "Set Up Payment". Edit opens on step 2 (no bars).
       Studio adds Payment name + Process flow state at the top of step 2 (in the process flow the state is known). */
  const dlg = $('py-dialog'); let D = null, opener = null, errs = {};
  const nextName = () => { let k = list.length + 1; while (list.some(x => x.name === `Payment ${k}`)) k++; return `Payment ${k}`; };
  const tipHTML = (id, label, text) => `<span class="tip"><button type="button" class="tip-btn" aria-label="About ${label}" aria-describedby="${id}"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg></button><span class="tip-bubble" role="tooltip" id="${id}">${text}</span></span>`;
  const errP = k => `<p class="error" id="pyw-err-${k}"${errs[k] ? '' : ' hidden'}>${errs[k] || ''}</p>`;
  const inv = k => errs[k] ? ` aria-invalid="true" aria-describedby="pyw-err-${k}"` : ` aria-describedby="pyw-err-${k}"`;
  const row = (labelHTML, inner) => `<div class="ntw-row"><div class="ntw-label pyw-lab">${labelHTML}</div><div class="ntw-control">${inner}</div></div>`;
  const lab = (forId, t) => `<label for="${forId}">${t} <span class="req" aria-hidden="true">*</span></label>`;
  const rupee = (id, k, ph) => `<div class="pay-amount"><span class="pay-amount__prefix" aria-hidden="true">₹</span><input class="input" id="${id}" type="text" inputmode="decimal" placeholder="${ph}" data-k="${k}" value="${esc(D.draft[k] || '')}" autocomplete="off"${inv(k)}></div>${errP(k)}`;
  function fields() {
    const d = D.draft;
    let h = `<div class="ntw-box">
        ${row(lab('pyw-state', 'Process flow state'), `<select class="input" id="pyw-state" data-k="state"${inv('state')}>${opts(STATES.map(x => [x, x]), d.state, 'Select a state')}</select>${errP('state')}`)}
      </div>`;
    h += `<div class="ntw-box">
        ${row(`${lab('pyw-fee', 'Fee')}${tipHTML('pyw-tip-fee', 'fee', 'The fee is the amount people pay at this state.')}`, `<select class="input" id="pyw-fee" data-k="fee"${inv('fee')}>${opts(Object.entries(FEES), d.fee, 'Select fee type')}</select>${errP('fee')}`)}
        ${d.fee === 'FIXED' ? row(lab('pyw-amount', 'Fee amount'), rupee('pyw-amount', 'amount', 'Enter fee amount')) : ''}
        ${d.fee === 'USER' ? row(lab('pyw-min', 'Minimum amount'), rupee('pyw-min', 'min', 'Enter minimum amount')) + row(lab('pyw-max', 'Maximum amount'), rupee('pyw-max', 'max', 'Enter maximum amount')) : ''}
        ${d.fee === 'CALC' ? row(lab('pyw-endpoint', 'Host endpoint'), `<input class="input" id="pyw-endpoint" type="text" placeholder="Enter host endpoint" data-k="endpoint" value="${esc(d.endpoint)}" autocomplete="off"${inv('endpoint')}>${errP('endpoint')}`)
          + row(lab('pyw-method', 'Method type'), `<select class="input" id="pyw-method" data-k="method"${inv('method')}>${opts([['GET', 'GET'], ['POST', 'POST']], d.method, 'Select method type')}</select>${errP('method')}`)
          + `<div class="ntw-info" role="note" aria-labelledby="pyw-calc-info"><p class="ntw-info-title" id="pyw-calc-info"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6M12 7.5v.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg> Info</p>
              <p class="ntw-info-text">This fee type requires a custom calculator API that follows the DIGIT fee contract.</p>
              <button type="button" class="btn pyw-guide" id="pyw-guide">View Integration Guide</button></div>` : ''}
      </div>`;
    h += `<div class="ntw-box">
        ${row(`<span id="pyw-mode-l">Payment mode <span class="req" aria-hidden="true">*</span></span>${tipHTML('pyw-tip-mode', 'payment mode', 'The payment mode is how people pay the fee at this state.')}`,
          `<div class="pay-modes" role="group" aria-labelledby="pyw-mode-l" aria-describedby="pyw-err-mode">
            <label class="ntw-radio pyw-check"><input type="checkbox" data-k="online"${d.online ? ' checked' : ''}><span class="ft-box" aria-hidden="true"></span><span><span class="ntw-rlabel">Online payment</span><span class="ntw-rtext">Collect payment through an integrated payment gateway.</span></span></label>
            <label class="ntw-radio pyw-check"><input type="checkbox" data-k="offline"${d.offline ? ' checked' : ''}><span class="ft-box" aria-hidden="true"></span><span><span class="ntw-rlabel">Offline payment</span><span class="ntw-rtext">Record payment collected outside the gateway, such as cash or bank transfer.</span></span></label>
          </div>${errP('mode')}`)}
        ${d.online ? row(lab('pyw-gw', 'Payment integration'), `<select class="input" id="pyw-gw" data-k="gateway"${inv('gateway')}>${opts(GATEWAYS.map(g => [g, g]), d.gateway, 'Select payment integration')}</select>${errP('gateway')}`) : ''}
      </div>`;
    $('pyw-fields').innerHTML = h;
    $('pyw-fields').querySelectorAll('.tip').forEach(t => { const b2 = t.querySelector('.tip-btn');
      b2.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      t.addEventListener('mouseleave', () => t.classList.remove('dismissed')); b2.addEventListener('blur', () => t.classList.remove('open', 'dismissed')); });
  }
  function showStep(focus = true) {
    const st = D.path[D.i];
    dlg.querySelectorAll('section[data-step]').forEach(x => { x.hidden = x.dataset.step !== st; });
    dlg.setAttribute('aria-labelledby', 'pyw-title-' + st);
    const bars = D.path.length > 1;
    $('pyw-bars-wrap').hidden = !bars;
    if (bars) { $('pyw-bars').innerHTML = D.path.map((_, k) => `<span class="${k <= D.i ? 'on' : ''}"></span>`).join(''); $('pyw-step-text').textContent = `Step ${D.i + 1} of ${D.path.length}`; }
    $('pyw-back').textContent = D.i === 0 ? 'Cancel' : 'Back';
    $('py-submit').textContent = st === 'details' ? 'Save' : 'Next';
    if (st === 'after') dlg.querySelectorAll('input[name="pyw-after"]').forEach(r => { r.checked = r.value === D.draft.after; });
    if (st === 'details') fields();
    if (focus) (st === 'after' ? (dlg.querySelector('input[name="pyw-after"]:checked') || dlg.querySelector('input[name="pyw-after"]')) : $('pyw-state')).focus();
    $('pyw-body').scrollTop = 0;
  }
  // copy = card Copy: straight to the details, prefilled, named "… (copy)"; nothing is added until Save
  function open(p, from, copy) {
    opener = from; errs = {};
    const blank = { name: nextName(), state: '', fee: '', amount: '', min: '', max: '', endpoint: '', method: '', online: false, gateway: '', offline: false, after: '' };
    const draft = p ? JSON.parse(JSON.stringify(p)) : blank;
    if (copy) { delete draft.id; let n = `${p.name} (copy)`, k = 2; while (list.some(x => x.name === n)) n = `${p.name} (copy ${k++})`; draft.name = n; }
    D = { edit: copy ? null : p, draft, path: p ? ['details'] : ['after', 'details'], i: 0 };
    $('pyw-err-after').hidden = true;
    dlg.showModal(); showStep();
  }
  $('pyw-back').addEventListener('click', () => { if (D.i === 0) return dlg.close(); D.i--; showStep(); });
  dlg.addEventListener('change', e => {
    const t = e.target, k = t.dataset.k; if (!k || !D) return;
    D.draft[k] = t.type === 'checkbox' ? t.checked : t.value;
    if (k === 'after') $('pyw-err-after').hidden = true;
    delete errs[k]; if (k === 'online' || k === 'offline') delete errs.mode;
    if (['fee', 'online', 'offline'].includes(k)) { fields(); $('pyw-fields').querySelector(`[data-k="${k}"]`)?.focus(); }
  });
  dlg.addEventListener('input', e => {
    const t = e.target, k = t.dataset.k; if (!k || !D || t.tagName !== 'INPUT' || t.type === 'checkbox' || t.type === 'radio') return;
    D.draft[k] = ['amount', 'min', 'max'].includes(k) ? t.value.replace(/[^\d.]/g, '') : t.value;
    if (t.value !== D.draft[k]) t.value = D.draft[k];
  });
  dlg.addEventListener('click', e => { if (e.target.closest('#pyw-guide')) S.announce('The integration guide is not linked yet.'); });
  const validUrl = u => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.hostname.includes('.'); } catch (e) { return false; } };
  $('py-form').addEventListener('submit', e => {
    e.preventDefault();
    const d = D.draft, st = D.path[D.i];
    if (st === 'after') {
      if (!d.after) { $('pyw-err-after').hidden = false; dlg.querySelector('input[name="pyw-after"]').focus(); return; }
      D.i++; return showStep();
    }
    errs = {};
    // No name field (same as the process flow): new payments are called "Payment N"
    const nm = d.name || nextName();
    if (!d.state) errs.state = 'Select a process flow state.';
    if (!d.fee) errs.fee = 'Select the fee type.';
    if (d.fee === 'FIXED' && !(+d.amount > 0)) errs.amount = 'Enter the fee amount.';
    if (d.fee === 'USER') { if (d.min === '') errs.min = 'Enter the minimum amount.'; if (!(+d.max > 0)) errs.max = 'Enter the maximum amount.'; else if (+d.max < +d.min) errs.max = 'The maximum amount must be more than the minimum amount.'; }
    if (d.fee === 'CALC') { if (!validUrl(d.endpoint)) errs.endpoint = 'Enter the host endpoint.'; if (!d.method) errs.method = 'Select the method type.'; }
    if (!d.online && !d.offline) errs.mode = 'Select at least one payment mode.';
    if (d.online && !d.gateway) errs.gateway = 'Select the payment integration.';
    if (Object.keys(errs).length) {
      fields();
      const k = ['state', 'fee', 'amount', 'min', 'max', 'endpoint', 'method', 'mode', 'gateway'].find(x => errs[x]);
      $('pyw-fields').querySelector(k === 'mode' ? '[data-k="online"]' : `[data-k="${k}"]`)?.focus();
      return;
    }
    d.name = nm;
    const rec = { ...d, currency: 'INR' }; delete rec.id;
    const apply = () => {
      if (D.edit) Object.assign(D.edit, rec); else list.unshift({ id: nid(), ...rec });
      persist(); render(); const was = !!D.edit; dlg.close();
      S.announce(`${rec.name} ${was ? 'updated' : 'created'}.`);
      if (!was) S.toast(`${rec.name} created successfully`);
    };
    apply();   // edit was confirmed when Edit was clicked
  });
  $('py-new').addEventListener('click', e => open(null, e.currentTarget));
  $('py-empty-new').addEventListener('click', e => open(null, e.currentTarget));
  dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { (opener && document.contains(opener) ? opener : $('py-new')).focus(); D = null; });

  $('py-list').addEventListener('click', e => {
    const b = e.target.closest('[data-edit],[data-dup],[data-del]'); if (!b) return;
    const p = list.find(x => x.id === (b.dataset.edit || b.dataset.dup || b.dataset.del));
    if (b.dataset.edit) return confirmPF({ title: `Proceed to edit "${p.name}"?`, desc: `${LINKED} Do you want to continue?`, cta: 'Continue', back: b, onOk: () => open(p, b) });
    if (b.dataset.dup) return open(p, b, true);
    confirmPF({
      title: `Proceed to delete "${p.name}"?`,
      desc: `Are you sure you want to delete <strong>"${esc(p.name)}"</strong>? ${LINKED} This action cannot be undone.`,
      cta: 'Delete', back: b,
      onOk: () => {
        const i = list.indexOf(p), name = p.name; list.splice(i, 1); persist(); render();
        const cards = $('py-list').querySelectorAll('[data-edit]'); (cards[Math.min(i, cards.length - 1)] || $('py-new')).focus();
        S.announce(`${name} deleted.`);
      },
    });
  });

  window.StudioPayments = {
    render(m, focus) {
      mod = m;
      if (!store[m.id]) { store[m.id] = seed(); save(); }
      list = store[m.id];
      $('py-back-top').href = '#/module/' + encodeURIComponent(m.id);
      render();
      if (focus) $('py-title').focus();
    },
  };
})();
