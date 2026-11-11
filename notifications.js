/* ==========================================================
   Manage Notifications — Studio Prototype
   Route: #/module/<id>/notifications. One list per module.
   Layout from the user's "SMS Notifications" screenshot: title + primary CTA, white filter bar,
   full-width cards (name, state tag + purple type tag, message, Edit / Duplicate / Delete).
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.notifications.v1';
  const STATES = ['Pending for Verification', 'Pending for Field Inspect', 'Payment Stage 1 - Paid', 'Approved',
                  'Manual Expired', 'Terminated', 'Auto Expired', 'Due for Renewal'];
  const TYPES = { SMS: 'SMS', EMAIL: 'Email' };
  const VARIABLES = ['Application Number', 'Submission Date', 'Submission Time', 'Current State', 'Name', 'Mobile Number', 'Email',
                     'Gender', 'Pincode', 'Street Name', 'Location on Map', 'Business Name', 'Established Date', 'Contact'];
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  let uid = 0;
  const nid = () => 'n' + Date.now().toString(36) + (uid++);
  const seed = () => [
    { id: nid(), name: 'Application received', type: 'SMS', state: 'Pending for Verification', message: 'Dear {Name}, your application {Application Number} has been received on {Submission Date} and is waiting for verification.' },
    { id: nid(), name: 'Application approved', type: 'EMAIL', state: 'Approved', message: 'Dear {Name}, your application {Application Number} has been approved. You can download your certificate from the portal.' },
    { id: nid(), name: 'Renewal reminder', type: 'SMS', state: 'Due for Renewal', message: 'Dear {Name}, your licence for {Business Name} is due for renewal. Renew before the expiry date to avoid a late fee.' },
  ];

  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plusW: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    copy: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
    trash: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const opts = (list, cur, all) => (all ? `<option value="">${all}</option>` : '') + list.map(([v, t]) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(t)}</option>`).join('');

  const view = $('view-notifications');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="nt-back-top" href="#">${I.back} Back to Module Dashboard</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <main class="content nt-main">
      <div class="roles-head">
        <h1 class="page-title" id="nt-title" tabindex="-1">Notifications</h1>
        <button type="button" class="btn btn-primary roles-new" id="nt-new" aria-haspopup="dialog">${I.plusW} Create Notification</button>
      </div>
      <section class="section nt-filters" aria-label="Filter notifications">
        <div class="nt-filter">
          <label class="nt-label" for="nt-search">Search by notification name</label>
          <div class="nt-search"><input class="input" id="nt-search" type="search" autocomplete="off" aria-describedby="nt-count"><span class="rs-ico" aria-hidden="true">${I.search}</span></div>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="nt-state">Process flow state</label>
          <select class="input pf-select nt-select" id="nt-state">${opts(STATES.map(s => [s, s]), '', 'All states')}</select>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="nt-type">Type</label>
          <select class="input pf-select nt-select" id="nt-type">${opts(Object.entries(TYPES), '', 'All types')}</select>
        </div>
        <button type="button" class="btn btn-secondary nt-clear nt-clear-btn" id="nt-clear" data-clear-filters disabled>Clear Search</button>
      </section>
      <div class="nt-results" id="nt-results" hidden><p class="nt-count" id="nt-count" role="status"></p></div>
      <ul class="nt-list" id="nt-list" aria-label="Notifications"></ul>
      ${S.emptyState({ id: 'nt-empty', ctaId: 'nt-empty-new', ctaLabel: 'Create Notification' })}
    </main>

    <dialog class="modal ntw" id="nt-dialog" aria-labelledby="ntw-title-how">
      <form id="nt-form" novalidate>
        <div class="ntw-body" id="ntw-body">
          <button type="button" class="icon-btn ntw-close" data-close aria-label="Close">${I.close}</button>
          <div class="ntw-bars-wrap" id="ntw-bars-wrap"><span class="sr-only" id="ntw-step-text"></span><span class="ntw-bars" id="ntw-bars" aria-hidden="true"></span></div>

          <section data-step="how">
            <h2 class="ntw-title" id="ntw-title-how">How do you want to add the notification?</h2>
            <p class="ntw-desc">Create a new notification, or copy one that already exists in this module.</p>
            <fieldset class="ntw-options"><legend class="sr-only">How to add the notification</legend>
              <label class="ntw-radio"><input type="radio" name="ntw-mode" value="new" checked><span class="ntw-rdot" aria-hidden="true"></span><span><span class="ntw-rlabel">Create new notification</span><span class="ntw-rtext">Create a new notification for this module.</span></span></label>
              <label class="ntw-radio"><input type="radio" name="ntw-mode" value="copy"><span class="ntw-rdot" aria-hidden="true"></span><span><span class="ntw-rlabel">Copy existing notification</span><span class="ntw-rtext">Copy a notification and edit the copy.</span></span></label>
            </fieldset>
          </section>

          <section data-step="type" hidden>
            <h2 class="ntw-title" id="ntw-title-type">Select Notification Type</h2>
            <p class="ntw-desc">Start by choosing the notification type you want to add, such as Email or SMS, to notify users at the right time.</p>
            <fieldset class="ntw-tiles"><legend class="sr-only">Notification type</legend>
              <label class="ntw-tile"><input type="radio" name="ntw-type" value="SMS" checked>
                <span class="ntw-tile-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H8l-4 4V5a1 1 0 011-1z" fill="currentColor"/><path d="M8 9h8M8 12.5h5" fill="none" class="ntw-ico-cut" stroke-width="1.8" stroke-linecap="round"/></svg></span>
                <span class="ntw-tile-title">SMS</span><span class="ntw-tile-text">Send text messages to users on their mobile numbers</span></label>
              <label class="ntw-tile"><input type="radio" name="ntw-type" value="EMAIL">
                <span class="ntw-tile-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor"/><path d="M4 7l8 6 8-6" fill="none" class="ntw-ico-cut" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                <span class="ntw-tile-title">Email</span><span class="ntw-tile-text">Send emails to users on their registered email addresses</span></label>
            </fieldset>
          </section>

          <section data-step="pick" hidden>
            <h2 class="ntw-title" id="ntw-title-pick">Select Notification</h2>
            <p class="ntw-desc">Select the notification to copy. You can edit the copy in the next step.</p>
            <div class="nt-search ntw-search"><label class="sr-only" for="ntw-q">Search notifications</label><input class="input" id="ntw-q" type="search" autocomplete="off" aria-controls="ntw-pick"><span class="rs-ico" aria-hidden="true">${I.search}</span></div>
            <p class="sr-only" id="ntw-pick-count" role="status"></p>
            <div class="ntw-pick" id="ntw-pick" role="radiogroup" aria-labelledby="ntw-title-pick"></div>
            <p class="ntw-none" id="ntw-pick-none" hidden>No notifications match your search.</p>
          </section>

          <section data-step="form" hidden>
            <div class="ntw-head">
              <div class="ntw-name-row" id="ntw-name-row">
                <h2 class="ntw-name" id="ntw-title-form"></h2>
                <button type="button" class="icon-btn ntw-rename" id="ntw-rename" aria-label="Rename notification"><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></button>
              </div>
              <label class="sr-only" for="ntw-name-in">Notification name</label>
              <input class="input ntw-name-in" id="ntw-name-in" type="text" maxlength="60" autocomplete="off" hidden>
              <p class="error" id="ntw-name-err" hidden><span></span></p>
              <span class="nt-tag nt-tag-type ntw-type-tag" id="ntw-type-tag"></span>
            </div>
            <div class="ntw-fields">
              <div class="ntw-info" id="ntw-sms-info" role="note" aria-labelledby="ntw-info-t">
                <p class="ntw-info-title" id="ntw-info-t"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6M12 7.5v.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg> Info</p>
                <p class="ntw-info-text">Certain countries require SMS templates to be approved by telecom providers before sending. Please verify the requirements for your country and register the template with your SMS provider if needed.</p>
              </div>
              <div class="ntw-box"><div class="ntw-row">
                <label class="ntw-label" for="nt-st">Process flow state <span class="req" aria-hidden="true">*</span></label>
                <div class="ntw-control"><select class="input pf-select" id="nt-st" aria-required="true" aria-describedby="nt-st-err"></select>
                  <p class="error" id="nt-st-err" hidden><span>Select a process flow state.</span></p></div>
              </div></div>
              <div class="ntw-box" id="ntw-subject-box"><div class="ntw-row">
                <label class="ntw-label" for="ntw-subject">Subject <span class="req" aria-hidden="true">*</span></label>
                <div class="ntw-control"><input class="input" id="ntw-subject" type="text" maxlength="120" autocomplete="off" aria-required="true" aria-describedby="ntw-subject-err">
                  <p class="error" id="ntw-subject-err" hidden><span>Enter the subject.</span></p></div>
              </div></div>
              <div class="ntw-box">
                <div class="ntw-row">
                  <label class="ntw-label" for="nt-msg">Message Body <span class="req" aria-hidden="true">*</span></label>
                  <div class="ntw-control"><textarea class="input nt-msg" id="nt-msg" aria-required="true" aria-describedby="ntw-msg-meta"></textarea>
                    <div class="fp-meta" id="ntw-msg-meta"><span class="fp-error" id="nt-msg-err"></span><span class="fp-count" id="ntw-count"></span></div></div>
                </div>
                <div class="ntw-row">
                  <span class="ntw-label" id="nt-vars-l">Personalization Variables</span>
                  <div class="ntw-control"><div class="var-chips" role="group" aria-labelledby="nt-vars-l">${VARIABLES.map(v => `
                    <button type="button" class="var-chip" data-var="${v}" aria-label="Insert ${v}"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>${v}</button>`).join('')}</div></div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="ntw-foot">
          <button type="button" class="btn btn-secondary" id="ntw-back">Cancel</button>
          <button type="submit" class="btn btn-primary" id="nt-submit">Next</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal pfc" id="nt-confirm" aria-labelledby="pfc-title" aria-describedby="pfc-desc">
      <button type="button" class="icon-btn pfc-close" data-close aria-label="Close">${I.close}</button>
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="pfc-title"></h2>
      <p class="pfc-desc" id="pfc-desc"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-close id="pfc-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="pfc-ok">Delete</button>
      </div>
    </dialog>`;

  let mod = null, list = [];
  const f = { q: '', state: '', type: '' };

  function render() {
    const q = f.q.trim().toLowerCase();
    const shown = list.filter(n => (!q || n.name.toLowerCase().includes(q)) && (!f.state || n.state === f.state) && (!f.type || n.type === f.type));
    $('nt-list').innerHTML = shown.map(n => `
      <li class="nt-card">
        <div class="nt-body">
          <h2 class="nt-name" id="nt-n-${n.id}">${esc(n.name)}</h2>
          <ul class="nt-tags" aria-label="Details">
            <li class="nt-tag nt-tag-state">${esc(n.state)}</li>
            <li class="nt-tag nt-tag-type">${TYPES[n.type]}</li>
          </ul>
          <p class="nt-msg-text">${n.subject ? `<strong class="nt-subject-in">${esc(n.subject)}</strong> – ` : ''}${esc(n.message).replace(/\{([^{}]{1,40})\}/g, '<span class="nt-var">{$1}</span>')}</p>
        </div>
        <div class="nt-foot">
          <button type="button" class="nt-del" data-del="${n.id}" aria-describedby="nt-n-${n.id}" aria-haspopup="dialog">${I.trash} Delete</button>
          <span class="nt-right">
            <button type="button" class="btn btn-secondary nt-act" data-dup="${n.id}" aria-describedby="nt-n-${n.id}">${I.copy} Copy</button>
            <button type="button" class="btn btn-secondary nt-act" data-edit="${n.id}" aria-describedby="nt-n-${n.id}" aria-haspopup="dialog">${I.pencil} Edit</button>
          </span>
        </div>
      </li>`).join('');
    const empty = !shown.length;
    $('nt-empty').hidden = !empty;
    document.querySelector('.nt-filters[aria-label="Filter notifications"]').hidden = !list.length;   // nothing created yet → no search/filters
    $('nt-new').hidden = !list.length;   // nothing created yet → only the empty-state CTA
    if (empty) list.length
      ? S.setEmpty($('nt-empty'), false, 'No results found', 'Nothing matches your search or filters. Check the spelling, or change the filters.')
      : S.setEmpty($('nt-empty'), true, 'Nothing here yet', 'Create notifications to update applicants via SMS or email as they move through the process.');
    $('nt-count').textContent = (q || f.state || f.type) ? `${shown.length} notification${shown.length === 1 ? '' : 's'} found.` : '';
    $('nt-results').hidden = !(q || f.state || f.type);
    $('nt-clear').disabled = !(q || f.state || f.type);
  }
  $('nt-search').addEventListener('input', e => { f.q = e.target.value; render(); });
  $('nt-state').addEventListener('change', e => { f.state = e.target.value; render(); });
  $('nt-type').addEventListener('change', e => { f.type = e.target.value; render(); });
  const persist = () => { store[mod.id] = list; save(); };

  /* ---------- Create / Edit: same wizard as the process flow ----------
       create new: How to add -> Type -> Details
       duplicate:  How to add -> Select notification -> Details (prefilled)
       nothing to duplicate: starts at Type.  Edit: straight to Details (no bars). */
  const dlg = $('nt-dialog');
  const MAX = { SMS: 160, EMAIL: 500 };
  let W = null, opener = null, caret = null;   // W = { path:[steps], i, edit, draft }
  const err = (id, on, msg) => { const e = $(id); if (!e) return; if (msg) (e.querySelector('span') || e).textContent = msg; e.hidden = !on; };
  const step = () => W.path[W.i];
  function showStep(focus = true) {
    const st = step();
    dlg.querySelectorAll('section[data-step]').forEach(sec => { sec.hidden = sec.dataset.step !== st; });
    dlg.setAttribute('aria-labelledby', 'ntw-title-' + st);
    const bars = !W.edit && W.path.length > 1;
    $('ntw-bars-wrap').hidden = !bars;
    if (bars) {
      $('ntw-bars').innerHTML = W.path.map((_, k) => `<span class="${k <= W.i ? 'on' : ''}"></span>`).join('');
      $('ntw-step-text').textContent = `Step ${W.i + 1} of ${W.path.length}`;
    }
    $('ntw-back').textContent = W.i === 0 ? 'Cancel' : 'Back';
    $('nt-submit').textContent = st === 'form' ? 'Save' : 'Next';
    if (st === 'pick') renderPick();
    if (st === 'form') fillForm();
    if (focus) {
      const target = st === 'how' ? dlg.querySelector('input[name="ntw-mode"]:checked')
        : st === 'type' ? dlg.querySelector('input[name="ntw-type"]:checked')
        : st === 'pick' ? $('ntw-q') : $('nt-st');
      target && target.focus();
    }
    $('ntw-body').scrollTop = 0;
  }
  function open(n, from) {
    opener = from;
    const blank = { name: '', type: 'SMS', state: '', subject: '', message: '' };
    if (n) W = { path: ['form'], i: 0, edit: n, draft: { ...blank, ...n } };
    else W = { path: ['type', 'form'], i: 0, edit: null, draft: { ...blank } };   // SMS / Email, then details
    dlg.querySelector('input[name="ntw-mode"][value="new"]').checked = true;
    dlg.querySelector(`input[name="ntw-type"][value="${W.draft.type}"]`).checked = true;
    $('ntw-q').value = ''; W.pick = list[0]?.id;
    dlg.showModal(); showStep();
  }
  // Duplicate from a card: straight to Details, prefilled, named "… (copy)"; nothing is added until Save
  function openCopy(n, from) {
    opener = from;
    W = { path: ['form'], i: 0, edit: null, draft: { ...n, id: undefined, name: uniqueName(`${n.name} (copy)`) } };
    dlg.showModal(); showStep();
    S.announce(`Copying ${n.name}. Review the copy, then save.`);
  }
  const uniqueName = base => { const root = base.replace(/ \(copy( \d+)?\)$/, ''); let n = `${root} (copy)`, k = 1; while (list.some(x => x.name.toLowerCase() === n.toLowerCase())) n = `${root} (copy ${++k})`; return n; };
  const nextNumber = () => { let k = list.length + 1; while (list.some(x => x.name === `Notification ${k}`)) k++; return `Notification ${k}`; };

  function renderPick() {
    const q = $('ntw-q').value.trim().toLowerCase();
    const shown = list.filter(n => !q || [n.name, TYPES[n.type], n.state].some(t => t.toLowerCase().includes(q)));
    if (!shown.some(n => n.id === W.pick)) W.pick = shown[0]?.id;
    $('ntw-pick').innerHTML = shown.map(n => `
      <label class="ntw-pcard"><input type="radio" name="ntw-pick" value="${n.id}"${n.id === W.pick ? ' checked' : ''}>
        <span class="ntw-pbody"><span class="ntw-ptitle">${esc(n.name)}</span>
          <span class="ntw-ptags"><span class="nt-tag nt-tag-state">${esc(n.state)}</span><span class="nt-tag nt-tag-type">${TYPES[n.type]}</span></span></span>
        <span class="ntw-pcheck" aria-hidden="true"></span></label>`).join('');
    $('ntw-pick-none').hidden = shown.length > 0;
    $('nt-submit').disabled = !shown.length;
    $('ntw-pick-count').textContent = q ? `${shown.length} notification${shown.length === 1 ? '' : 's'} found.` : '';
  }
  $('ntw-q').addEventListener('input', renderPick);
  $('ntw-pick').addEventListener('change', e => { W.pick = e.target.value; });

  function fillForm() {
    const d = W.draft;
    $('ntw-title-form').textContent = d.name;
    $('ntw-rename').setAttribute('aria-label', `Rename ${d.name}`);
    $('ntw-name-in').hidden = true; $('ntw-name-row').hidden = false; err('ntw-name-err', false);
    $('ntw-type-tag').textContent = TYPES[d.type];
    $('ntw-sms-info').hidden = d.type !== 'SMS';
    $('ntw-subject-box').hidden = d.type !== 'EMAIL';
    $('ntw-subject').value = d.subject || '';
    $('nt-st').innerHTML = opts(STATES.map(x => [x, x]), d.state, 'Select a state');
    $('nt-msg').maxLength = MAX[d.type]; $('nt-msg').value = (d.message || '').slice(0, MAX[d.type]);
    caret = null; count();
    ['nt-st', 'ntw-subject', 'nt-msg'].forEach(i => $(i).removeAttribute('aria-invalid'));
    err('nt-st-err', false); err('ntw-subject-err', false); $('nt-msg-err').textContent = '';
  }
  const count = () => { $('ntw-count').innerHTML = `${$('nt-msg').value.length}/${MAX[W.draft.type]}<span class="sr-only"> characters</span>`; };
  $('nt-msg').addEventListener('input', () => { count(); if ($('nt-msg').value.trim()) { $('nt-msg-err').textContent = ''; $('nt-msg').removeAttribute('aria-invalid'); } });

  // Inline rename (pencil), like the process flow
  $('ntw-rename').addEventListener('click', () => {
    $('ntw-name-row').hidden = true; const inp = $('ntw-name-in'); inp.hidden = false; inp.value = W.draft.name; inp.focus(); inp.select();
  });
  function endRename(save) {
    const inp = $('ntw-name-in'); if (inp.hidden) return;
    let v = inp.value.trim().replace(/\s+/g, ' ');
    if (save && v) W.draft.name = v[0].toLocaleUpperCase() + v.slice(1);
    inp.hidden = true; $('ntw-name-row').hidden = false;
    $('ntw-title-form').textContent = W.draft.name;
    $('ntw-rename').setAttribute('aria-label', `Rename ${W.draft.name}`);
    $('ntw-rename').focus();
  }
  $('ntw-name-in').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); endRename(true); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); endRename(false); }
  });
  $('ntw-name-in').addEventListener('blur', () => endRename(true));

  // Back / Cancel
  $('ntw-back').addEventListener('click', () => {
    if (W.i === 0) return dlg.close();
    W.i--; if (W.path[W.i] === 'pick' || W.path[W.i] === 'type') { /* keep choices */ }
    showStep();
  });
  // Next / Save
  $('nt-form').addEventListener('submit', e => {
    e.preventDefault();
    const st = step();
    if (st === 'how') {
      const copy = dlg.querySelector('input[name="ntw-mode"]:checked').value === 'copy';
      W.path = copy ? ['how', 'pick', 'form'] : ['how', 'type', 'form'];
      W.i = 1; return showStep();
    }
    if (st === 'type') {
      W.draft.type = dlg.querySelector('input[name="ntw-type"]:checked').value;
      if (!W.draft.name) W.draft.name = nextNumber();
      W.i++; return showStep();
    }
    if (st === 'pick') {
      const src = list.find(n => n.id === W.pick); if (!src) return;
      W.draft = { ...src, id: undefined, name: uniqueName(`${src.name} (copy)`) };
      W.i++; return showStep();
    }
    // Save (details)
    const d = W.draft;
    d.state = $('nt-st').value; d.subject = $('ntw-subject').value.trim(); d.message = $('nt-msg').value.trim();
    const bad = [];
    const mark = (id, errId, on, msg) => { if (on) { $(id).setAttribute('aria-invalid', 'true'); bad.push(id); } else $(id).removeAttribute('aria-invalid');
      if (errId === 'nt-msg-err') $('nt-msg-err').textContent = on ? msg : ''; else err(errId, on); };
    mark('nt-st', 'nt-st-err', !d.state);
    if (d.type === 'EMAIL') mark('ntw-subject', 'ntw-subject-err', !d.subject); else d.subject = '';
    mark('nt-msg', 'nt-msg-err', !d.message, 'Enter the message.');
    if (bad.length) { $(bad[0]).focus(); return; }
    const rec = { name: d.name, type: d.type, state: d.state, subject: d.subject, message: d.message };
    const apply = () => {
      if (W.edit) Object.assign(W.edit, rec); else list.unshift({ id: nid(), ...rec });
      persist(); render();
      const wasEdit = !!W.edit; W.saved = true; dlg.close();
      S.announce(`${rec.name} ${wasEdit ? 'updated' : 'created'}.`);
      if (!wasEdit) S.toast(`${rec.name} created successfully`);
    };
    apply();   // edit was confirmed when Edit was clicked
  });
  $('nt-new').addEventListener('click', e => open(null, e.currentTarget));
  $('nt-empty-new').addEventListener('click', e => open(null, e.currentTarget));

  // Insert {Variable} where the cursor is in the message (or at the end)
  ['keyup', 'click', 'select', 'input'].forEach(ev => $('nt-msg').addEventListener(ev, () => { caret = [$('nt-msg').selectionStart, $('nt-msg').selectionEnd]; }));
  dlg.addEventListener('click', e => {
    const chip = e.target.closest('[data-var]'); if (!chip) return;
    const ta = $('nt-msg'), token = `{${chip.dataset.var}}`;
    const [a, b] = caret || [ta.value.length, ta.value.length];
    if ((ta.value.length - (b - a) + token.length) > ta.maxLength) { S.announce('The message is too long to add this variable.'); return; }
    ta.value = ta.value.slice(0, a) + token + ta.value.slice(b);
    const pos = a + token.length; caret = [pos, pos];
    ta.focus(); ta.setSelectionRange(pos, pos); count();
    $('nt-msg-err').textContent = ''; ta.removeAttribute('aria-invalid');
    S.announce(`${chip.dataset.var} added to the message.`);
  });
  dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { (opener && document.contains(opener) ? opener : $('nt-new')).focus(); W = null; });

  /* ---------- Confirm (process-flow delete popup style) ---------- */
  const conf = $('nt-confirm'); let confOk = null, confBack = null;
  function confirmPF({ title, desc, cta, onOk, back }) {
    $('pfc-title').textContent = title;
    $('pfc-desc').innerHTML = desc;
    $('pfc-ok').textContent = cta;
    confOk = onOk; confBack = back || null;
    conf.showModal(); $('pfc-cancel').focus();
  }
  $('pfc-ok').addEventListener('click', () => { const f2 = confOk; confOk = null; conf.close(); f2 && f2(); });
  conf.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => conf.close()));
  conf.addEventListener('click', e => { if (e.target === conf) conf.close(); });
  conf.addEventListener('close', () => { if (confOk === null) return; confOk = null; confBack && document.contains(confBack) && confBack.focus(); });
  const LINKED = 'This notification is linked to a process flow state. Any change you make here will also be changed in the process flow.';

  /* ---------- Duplicate / Delete ---------- */
  const del = $('nt-del'); let delTarget = null;
  $('nt-list').addEventListener('click', e => {
    const b = e.target.closest('[data-edit],[data-dup],[data-del]'); if (!b) return;
    const n = list.find(x => x.id === (b.dataset.edit || b.dataset.dup || b.dataset.del));
    if (b.dataset.edit) return confirmPF({ title: `Proceed to edit "${n.name}"?`, desc: `${LINKED} Do you want to continue?`, cta: 'Continue', back: b, onOk: () => open(n, b) });
    if (b.dataset.dup) return openCopy(n, b);   // opens the details step with "Name (copy)"; saved only on Save
    confirmPF({
      title: `Proceed to delete "${n.name}"?`,
      desc: `Are you sure you want to delete <strong>"${esc(n.name)}"</strong>? ${LINKED} This action cannot be undone.`,
      cta: 'Delete', back: b,
      onOk: () => {
        const i = list.indexOf(n), name = n.name; list.splice(i, 1); persist(); render();
        const cards = $('nt-list').querySelectorAll('[data-edit]');
        (cards[Math.min(i, cards.length - 1)] || $('nt-new')).focus();
        S.announce(`${name} deleted.`);
      },
    });
  });

  window.StudioNotifications = {
    render(m, focus) {
      mod = m;
      if (!store[m.id]) { store[m.id] = seed(); save(); }
      list = store[m.id];
      $('nt-back-top').href = '#/module/' + encodeURIComponent(m.id);
      render();
      if (focus) $('nt-title').focus();
    },
  };
})();
