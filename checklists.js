/* ==========================================================
   Manage Checklists — Studio Prototype (same dashboard as Manage Notifications)
   Route: #/module/<id>/checklists. One list per module.
   Card: name · tags (process flow action + "N questions") · short description · Delete | Duplicate · Edit
   Builder: name + pencil, Action *, Description, question cards (text, answer type, options, required).
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.checklists.v1';
  const ACTIONS = ['Submit Application', 'Verify Documents', 'Field Inspection', 'Approve', 'Reject', 'Send Back', 'Renew'];
  const ATYPES = { radio: 'Radio button', text: 'Text' };
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} };
  let uid = 0; const nid = () => 'c' + Date.now().toString(36) + (uid++);
  const q = (text, type = 'radio', options = ['Yes', 'No'], required = true) => ({ text, type, options: type === 'radio' ? options.map(t => ({ text: t, nested: false })) : [], required });
  const normQ = x => { x.options = (x.options || []).map(o => typeof o === 'string' ? { text: o, nested: false } : o); return x; };
  const seed = () => [
    { id: nid(), name: 'Document verification', action: 'Verify Documents',
      questions: [q('Is the identity proof valid?'), q('Is the address proof clear and readable?'), q('Does the name match across all documents?'), q('Add any remarks about the documents', 'text', [], false)] },
    { id: nid(), name: 'Site inspection', action: 'Field Inspection',
      questions: [q('Is the premises at the address given?'), q('Is fire safety equipment installed?'), q('Inspection notes', 'text', [], false)] },
  ];
  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plusW: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    plusC: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    search: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    pencilL: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    copy: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
    trash: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    x: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  const opts = (list, cur, all) => (all ? `<option value="">${all}</option>` : '') + list.map(([v, t]) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(t)}</option>`).join('');
  const plural = n => `${n} question${n === 1 ? '' : 's'}`;

  const view = $('view-checklists');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="cl-back-top" href="#">${I.back} Back to Module Dashboard</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <main class="content nt-main">
      <div class="roles-head">
        <h1 class="page-title" id="cl-title" tabindex="-1">Checklists</h1>
        <button type="button" class="btn btn-primary roles-new" id="cl-new" aria-haspopup="dialog">${I.plusW} Create Checklist</button>
      </div>
      <section class="section nt-filters" aria-label="Filter checklists">
        <div class="nt-filter">
          <label class="nt-label" for="cl-search">Search by checklist name</label>
          <div class="nt-search"><input class="input" id="cl-search" type="search" autocomplete="off" aria-describedby="cl-count"><span class="rs-ico" aria-hidden="true">${I.search}</span></div>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="cl-action">Process flow action</label>
          <select class="input pf-select nt-select" id="cl-action">${opts(ACTIONS.map(a => [a, a]), '', 'All actions')}</select>
        </div>
        <button type="button" class="btn btn-secondary nt-clear nt-clear-btn" id="cl-clear" data-clear-filters disabled>Clear Search</button>
      </section>
      <div class="nt-results" id="cl-results" hidden><p class="nt-count" id="cl-count" role="status"></p></div>
      <ul class="nt-list" id="cl-list" aria-label="Checklists"></ul>
      ${S.emptyState({ id: 'cl-empty', ctaId: 'cl-empty-new', ctaLabel: 'Create Checklist' })}
    </main>

    <dialog class="modal ntw clw" id="cl-dialog" aria-labelledby="clw-title-how">
      <form id="cl-form" novalidate>
        <div class="ntw-body" id="clw-body">
          <button type="button" class="icon-btn ntw-close" data-close aria-label="Close">${I.close}</button>
          <div class="ntw-bars-wrap" id="clw-bars-wrap"><span class="sr-only" id="clw-step-text"></span><span class="ntw-bars" id="clw-bars" aria-hidden="true"></span></div>

          <section data-step="how">
            <div class="ntw-head ntw-head--step"><h2 class="ntw-title" id="clw-title-how">How would you like to add the checklist?</h2>
            <p class="ntw-desc">Pick a starting point for adding your checklist. You can edit its content once it is added.</p></div>
            <fieldset class="ntw-options"><legend class="sr-only">How to add the checklist</legend>
              <label class="ntw-radio"><input type="radio" name="clw-mode" value="new" checked><span class="ntw-rdot" aria-hidden="true"></span><span><span class="ntw-rlabel">Create new checklist</span><span class="ntw-rtext">Create a new checklist for this action.</span></span></label>
              <label class="ntw-radio"><input type="radio" name="clw-mode" value="copy"><span class="ntw-rdot" aria-hidden="true"></span><span><span class="ntw-rlabel">Copy existing checklist</span><span class="ntw-rtext">Copy a checklist and edit the copy.</span></span></label>
            </fieldset>
          </section>

          <section data-step="pick" hidden>
            <div class="ntw-head ntw-head--step"><h2 class="ntw-title" id="clw-title-pick">Select Checklist</h2>
            <p class="ntw-desc">Select the checklist to copy. You can edit the copy in the next step.</p></div>
            <div class="ntw-pick" id="clw-pick" role="radiogroup" aria-labelledby="clw-title-pick"></div>
          </section>

          <section data-step="build" hidden>
          <div class="ntw-head">
            <div class="ntw-name-row" id="clw-name-row">
              <h2 class="ntw-name" id="clw-name"></h2>
              <button type="button" class="icon-btn ntw-rename" id="clw-rename" aria-label="Rename checklist">${I.pencilL}</button>
            </div>
            <label class="sr-only" for="clw-name-in">Checklist name</label>
            <input class="input ntw-name-in" id="clw-name-in" type="text" maxlength="60" autocomplete="off" hidden>
          </div>
          <div class="ntw-fields">
            <div class="ntw-box">
              <div class="ntw-row">
                <label class="ntw-label" for="clw-action">Action <span class="req" aria-hidden="true">*</span></label>
                <div class="ntw-control"><select class="input" id="clw-action" aria-required="true" aria-describedby="clw-action-err"></select>
                  <p class="error" id="clw-action-err" hidden>Select the action this checklist is used for.</p></div>
              </div>

            </div>
            <div class="cl-questions">
              <div class="cl-qlist" id="clw-qs" role="list" aria-label="Questions"></div>
              <button type="button" class="btn btn-secondary cl-add-q" id="clw-addq"></button>
            </div>
          </div>
          </section>
        </div>
        <div class="ntw-foot">
          <button type="button" class="btn btn-secondary" id="clw-back">Cancel</button>
          <button type="submit" class="btn btn-primary" id="cl-submit">Next</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal pfc" id="cl-confirm" aria-labelledby="clc-title" aria-describedby="clc-desc">
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="clc-title"></h2>
      <p class="pfc-desc" id="clc-desc"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-close id="clc-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="clc-ok">Delete</button>
      </div>
    </dialog>`;

  let mod = null, list = [];
  const f = { q: '', action: '' };
  function render() {
    const qq = f.q.trim().toLowerCase();
    const shown = list.filter(c => (!qq || c.name.toLowerCase().includes(qq)) && (!f.action || c.action === f.action));
    $('cl-list').innerHTML = shown.map(c => `
      <li class="nt-card">
        <div class="nt-body">
          <h2 class="nt-name" id="cl-n-${c.id}">${esc(c.name)}</h2>
          <ul class="nt-tags" aria-label="Details">
            <li class="nt-tag nt-tag-state">${esc(c.action)}</li>
            <li class="nt-tag nt-tag-type">${plural(c.questions.length)}</li>
          </ul>
        </div>
        <div class="nt-foot">
          <button type="button" class="nt-del" data-del="${c.id}" aria-describedby="cl-n-${c.id}" aria-haspopup="dialog">${I.trash} Delete</button>
          <span class="nt-right">
            <button type="button" class="btn btn-secondary nt-act" data-dup="${c.id}" aria-describedby="cl-n-${c.id}" aria-haspopup="dialog">${I.copy} Copy</button>
            <button type="button" class="btn btn-secondary nt-act" data-edit="${c.id}" aria-describedby="cl-n-${c.id}" aria-haspopup="dialog">${I.pencil} Edit</button>
          </span>
        </div>
      </li>`).join('');
    $('cl-empty').hidden = shown.length > 0;
    document.querySelector('.nt-filters[aria-label="Filter checklists"]').hidden = !list.length;   // nothing created yet → no search/filters
    $('cl-new').hidden = !list.length;   // nothing created yet → only the empty-state CTA
    if (!shown.length) list.length
      ? S.setEmpty($('cl-empty'), false, 'No results found', 'Nothing matches your search or filter. Check the spelling, or change the filter.')
      : S.setEmpty($('cl-empty'), true, 'Checklist yet to be created', 'Create checklists to ask users questions as they move through the process.');
    $('cl-count').textContent = (qq || f.action) ? `${shown.length} checklist${shown.length === 1 ? '' : 's'} found.` : '';
    $('cl-results').hidden = !(qq || f.action);
    $('cl-clear').disabled = !(qq || f.action);
  }
  $('cl-search').addEventListener('input', e => { f.q = e.target.value; render(); });
  $('cl-action').addEventListener('change', e => { f.action = e.target.value; render(); });
  const persist = () => { store[mod.id] = list; save(); };

  /* ---------- Confirm (process-flow delete popup style) ---------- */
  const conf = $('cl-confirm'); let confOk = null, confBack = null;
  function confirmPF({ title, desc, cta, onOk, back }) {
    $('clc-title').textContent = title; $('clc-desc').innerHTML = desc; $('clc-ok').textContent = cta;
    confOk = onOk; confBack = back || null; conf.showModal(); $('clc-cancel').focus();
  }
  $('clc-ok').addEventListener('click', () => { const f2 = confOk; confOk = null; conf.close(); f2 && f2(); });
  conf.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => conf.close()));
  conf.addEventListener('click', e => { if (e.target === conf) conf.close(); });
  conf.addEventListener('close', () => { if (confOk === null) return; confOk = null; confBack && document.contains(confBack) && confBack.focus(); });
  const LINKED = 'This checklist is linked to a process flow action. Any change you make here will also be changed in the process flow.';

  /* ---------- Builder ---------- */
  const dlg = $('cl-dialog'); let D = null, opener = null;   // D = { edit, draft }
  const unique = base => { const root = base.replace(/ \(copy( \d+)?\)$/, ''); let n = base, k = 1; while (list.some(x => x.name.toLowerCase() === n.toLowerCase() && x !== D?.edit)) n = `${root} (copy${++k > 2 ? ' ' + (k - 1) : ''})`; return n; };
  const nextName = () => { let k = list.length + 1; while (list.some(x => x.name === `Checklist ${k}`)) k++; return `Checklist ${k}`; };
  // Paths (same as the process flow): create → How → Builder; duplicate → How → Select Checklist → Builder.
  // Nothing to duplicate → straight to the builder. Edit / card Duplicate → builder only (no bars).
  function open(c, from, copy) {
    opener = from;
    const draft = c ? JSON.parse(JSON.stringify(c)) : { name: nextName(), action: '', questions: [q('', 'radio', ['', ''])] };
    if (copy) delete draft.id;
    D = { edit: copy ? null : c, draft, path: ['build'], i: 0, pick: list[0]?.id };
    if (copy) draft.name = unique(`${c.name} (copy)`);
    dlg.querySelector('input[name="clw-mode"][value="new"]').checked = true;
    dlg.showModal(); showStep();
    if (copy) S.announce(`Copying ${c.name}. Review the copy, then save.`);
  }
  function showStep() {
    const st = D.path[D.i];
    dlg.querySelectorAll('section[data-step]').forEach(x => { x.hidden = x.dataset.step !== st; });
    dlg.setAttribute('aria-labelledby', st === 'build' ? 'clw-name' : 'clw-title-' + st);
    const bars = !D.edit && D.path.length > 1 && D.path[0] === 'how';
    $('clw-bars-wrap').hidden = !bars;
    if (bars) { $('clw-bars').innerHTML = D.path.map((_, k) => `<span class="${k <= D.i ? 'on' : ''}"></span>`).join(''); $('clw-step-text').textContent = `Step ${D.i + 1} of ${D.path.length}`; }
    $('clw-back').textContent = D.i === 0 ? 'Cancel' : 'Back';
    $('cl-submit').textContent = st === 'build' ? 'Save' : 'Next';
    if (st === 'pick') renderPick();
    if (st === 'build') fill();
    (st === 'how' ? dlg.querySelector('input[name="clw-mode"]:checked') : st === 'pick' ? dlg.querySelector('input[name="clw-pick"]:checked') : $('clw-action'))?.focus();
    $('clw-body').scrollTop = 0;
  }
  function renderPick() {
    if (!list.some(c => c.id === D.pick)) D.pick = list[0]?.id;
    $('clw-pick').innerHTML = list.map(c => `
      <label class="ntw-pcard"><input type="radio" name="clw-pick" value="${c.id}"${c.id === D.pick ? ' checked' : ''}>
        <span class="ntw-pbody"><span class="ntw-ptitle">${esc(c.name)}</span>
          <span class="ntw-ptags"><span class="nt-tag nt-tag-state">${esc(c.action)}</span><span class="nt-tag nt-tag-type">${plural(c.questions.length)}</span></span></span>
        <span class="ntw-pcheck" aria-hidden="true"></span></label>`).join('');
  }
  $('clw-pick').addEventListener('change', e => { D.pick = e.target.value; });
  $('clw-back').addEventListener('click', () => { if (D.i === 0) return dlg.close(); D.i--; showStep(); });
  function fill() {
    const d = D.draft;
    $('clw-name').textContent = d.name; $('clw-rename').setAttribute('aria-label', `Rename ${d.name}`);
    $('clw-name-in').hidden = true; $('clw-name-row').hidden = false;
    $('clw-action').innerHTML = opts(ACTIONS.map(a => [a, a]), d.action, 'Select an action');
    $('clw-action').removeAttribute('aria-invalid'); $('clw-action-err').hidden = true;
    renderQs();
  }
  $('clw-action').addEventListener('change', e => { D.draft.action = e.target.value; if (e.target.value) { e.target.removeAttribute('aria-invalid'); $('clw-action-err').hidden = true; } });

  function renderQs(focusSel) {
    const qs = D.draft.questions, n = qs.length;
    $('clw-qs').innerHTML = qs.map((x, i) => `
      <div class="cl-q" role="listitem" aria-labelledby="clw-qt-${i}">
        <div class="cl-q__head">
          <h3 class="cl-q__title" id="clw-qt-${i}">Question ${i + 1}</h3>
          <label class="cl-check"><input type="checkbox" data-k="required" data-i="${i}"${x.required ? ' checked' : ''}> Required</label>
          ${n > 1 ? `<button type="button" class="cl-link cl-q__delete" data-delq="${i}">${I.trash} Delete Question ${i + 1}</button>` : ''}
        </div>
        <div class="cl-q__row">
          <div class="clw-q-text">
            <label class="sr-only" for="clw-q-${i}">Question ${i + 1}</label>
            <input class="input" id="clw-q-${i}" type="text" maxlength="200" placeholder="Please type your question here" value="${esc(x.text)}" data-k="text" data-i="${i}" autocomplete="off"${x._err ? ' aria-invalid="true" aria-describedby="clw-q-err-' + i + '"' : ''}>
            ${x._err ? `<p class="error" id="clw-q-err-${i}">Enter the question.</p>` : ''}
          </div>
          <div>
            <label class="sr-only" for="clw-qtype-${i}">Answer type for question ${i + 1}</label>
            <select class="input" id="clw-qtype-${i}" data-k="type" data-i="${i}">${opts(Object.entries(ATYPES), x.type)}</select>
          </div>
        </div>
        ${x.type === 'radio' ? `
        <ul class="cl-opts" aria-label="Options for question ${i + 1}">${x.options.map((o, j) => `
          <li class="cl-opt">
            <span class="cl-opt__mark cl-opt__mark--radio" aria-hidden="true"></span>
            <label class="sr-only" for="clw-o-${i}-${j}">Option ${j + 1}</label>
            <input class="cl-opt__input" id="clw-o-${i}-${j}" type="text" maxlength="80" placeholder="Option ${j + 1}" value="${esc(o.text)}" data-k="opt" data-i="${i}" data-j="${j}" autocomplete="off">
            <span class="cl-nested">
              <label class="cl-check"><input type="checkbox" data-k="nested" data-i="${i}" data-j="${j}"${o.nested ? ' checked' : ''}> Link nested checklist</label>
              <span class="tip"><button type="button" class="tip-btn" aria-label="About nested checklist" aria-describedby="clw-tip-${i}-${j}">${I.info}</button><span class="tip-bubble" role="tooltip" id="clw-tip-${i}-${j}">A follow-up checklist that appears when this option is chosen.</span></span>
            </span>
            ${x.options.length > 1 ? `<button type="button" class="icon-btn cl-opt__delete" data-delo="${i}:${j}" aria-label="Delete option ${j + 1} of question ${i + 1}">${I.x}</button>` : ''}
          </li>`).join('')}
        </ul>
        <button type="button" class="cl-link" data-addo="${i}">${I.plusC} Add Options for Question ${i + 1}</button>` : ''}
      </div>`).join('');
    $('clw-addq').innerHTML = `${I.plusW} Add Question ${n + 1}`;
    $('clw-qs').querySelectorAll('.tip').forEach(t => {
      const b2 = t.querySelector('.tip-btn');
      b2.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      t.addEventListener('mouseleave', () => t.classList.remove('dismissed'));
      b2.addEventListener('blur', () => t.classList.remove('open', 'dismissed'));
    });
    if (focusSel) ($('clw-qs').querySelector(focusSel) || dlg.querySelector(focusSel))?.focus();
  }
  $('clw-qs').addEventListener('input', e => {
    const t = e.target, i = +t.dataset.i, x = D.draft.questions[i]; if (!x) return;
    if (t.dataset.k === 'text') { x.text = t.value; if (x._err && t.value.trim()) { x._err = false; t.removeAttribute('aria-invalid'); t.parentElement.querySelector('.error')?.remove(); } }
    if (t.dataset.k === 'opt') x.options[+t.dataset.j].text = t.value;
  });
  $('clw-qs').addEventListener('change', e => {
    const t = e.target, i = +t.dataset.i, x = D.draft.questions[i]; if (!x) return;
    if (t.dataset.k === 'required') x.required = t.checked;
    if (t.dataset.k === 'nested') x.options[+t.dataset.j].nested = t.checked;
    if (t.dataset.k === 'type') { x.type = t.value; if (x.type === 'radio' && !x.options.length) x.options = [{ text: '', nested: false }, { text: '', nested: false }]; renderQs(`#clw-qtype-${i}`); }
  });
  $('clw-qs').addEventListener('click', e => {
    const dq = e.target.closest('[data-delq]'), ao = e.target.closest('[data-addo]'), dob = e.target.closest('[data-delo]');
    if (dq) { const i = +dq.dataset.delq; D.draft.questions.splice(i, 1); renderQs(`#clw-q-${Math.max(0, i - 1)}`); S.announce(`Question ${i + 1} deleted.`); }
    else if (ao) { const i = +ao.dataset.addo, x = D.draft.questions[i]; x.options.push({ text: '', nested: false }); renderQs(`#clw-o-${i}-${x.options.length - 1}`); }
    else if (dob) { const [i, j] = dob.dataset.delo.split(':').map(Number); D.draft.questions[i].options.splice(j, 1); renderQs(`#clw-o-${i}-${Math.max(0, j - 1)}`); }
  });
  $('clw-addq').addEventListener('click', () => {
    D.draft.questions.push(q('', 'radio', ['', ''])); const n = D.draft.questions.length;
    renderQs(`#clw-q-${n - 1}`); S.announce(`Question ${n} added.`);
  });

  // rename (same as the process flow)
  $('clw-rename').addEventListener('click', () => { $('clw-name-row').hidden = true; const i = $('clw-name-in'); i.hidden = false; i.value = D.draft.name; i.focus(); i.select(); });
  function endRename(keep) {
    const inp = $('clw-name-in'); if (inp.hidden) return;
    const v = inp.value.trim().replace(/\s+/g, ' ');
    if (keep && v) D.draft.name = v[0].toLocaleUpperCase() + v.slice(1);
    inp.hidden = true; $('clw-name-row').hidden = false; $('clw-name').textContent = D.draft.name;
    $('clw-rename').setAttribute('aria-label', `Rename ${D.draft.name}`); $('clw-rename').focus();
  }
  $('clw-name-in').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); endRename(true); } else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); endRename(false); } });
  $('clw-name-in').addEventListener('blur', () => endRename(true));

  $('cl-form').addEventListener('submit', e => {
    e.preventDefault();
    const st = D.path[D.i];
    if (st === 'how') {
      const copy = dlg.querySelector('input[name="clw-mode"]:checked').value === 'copy';
      D.path = copy ? ['how', 'pick', 'build'] : ['how', 'build']; D.i = 1; return showStep();
    }
    if (st === 'pick') {
      const src = list.find(c => c.id === D.pick); if (!src) return;
      D.draft = JSON.parse(JSON.stringify(src)); delete D.draft.id; D.draft.name = unique(`${src.name} (copy)`);
      D.i++; return showStep();
    }
    const d = D.draft; let first = null;
    if (!d.action) { $('clw-action').setAttribute('aria-invalid', 'true'); $('clw-action-err').hidden = false; first = first || '#clw-action'; }
    d.questions.forEach((x, i) => { x._err = !x.text.trim(); if (x._err) first = first || `#clw-q-${i}`; });
    if (d.questions.some(x => x._err)) renderQs();
    if (first) { dlg.querySelector(first).focus(); return; }
    const rec = { name: d.name, action: d.action,
      questions: d.questions.map(x => ({ text: x.text.trim(), type: x.type, required: x.required, options: x.type === 'radio' ? x.options.map((o, j) => ({ text: o.text.trim() || `Option ${j + 1}`, nested: !!o.nested })) : [] })) };
    const apply = () => {
      if (D.edit) Object.assign(D.edit, rec); else list.unshift({ id: nid(), ...rec });
      persist(); render(); const was = !!D.edit; D.saved = true; dlg.close();
      S.announce(`${rec.name} ${was ? 'updated' : 'created'}.`);
      if (!was) S.toast(`${rec.name} created successfully`);
    };
    apply();   // edit was confirmed when Edit was clicked
  });
  $('cl-new').addEventListener('click', e => open(null, e.currentTarget));
  $('cl-empty-new').addEventListener('click', e => open(null, e.currentTarget));
  dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { (opener && document.contains(opener) ? opener : $('cl-new')).focus(); D = null; });

  /* ---------- Card actions ---------- */
  $('cl-list').addEventListener('click', e => {
    const b = e.target.closest('[data-edit],[data-dup],[data-del]'); if (!b) return;
    const c = list.find(x => x.id === (b.dataset.edit || b.dataset.dup || b.dataset.del));
    if (b.dataset.edit) return confirmPF({ title: `Proceed to edit "${c.name}"?`, desc: `${LINKED} Do you want to continue?`, cta: 'Continue', back: b, onOk: () => open(c, b) });
    if (b.dataset.dup) return open(c, b, true);
    confirmPF({
      title: `Proceed to delete "${c.name}"?`,
      desc: `Are you sure you want to delete <strong>"${esc(c.name)}"</strong>? ${LINKED} This action cannot be undone.`,
      cta: 'Delete', back: b,
      onOk: () => {
        const i = list.indexOf(c), name = c.name; list.splice(i, 1); persist(); render();
        const cards = $('cl-list').querySelectorAll('[data-edit]'); (cards[Math.min(i, cards.length - 1)] || $('cl-new')).focus();
        S.announce(`${name} deleted.`);
      },
    });
  });

  window.StudioChecklists = {
    render(m, focus) {
      mod = m;
      if (!store[m.id]) { store[m.id] = seed(); save(); }
      list = store[m.id];
      list.forEach(c => { delete c.desc; c.questions.forEach(normQ); });
      $('cl-back-top').href = '#/module/' + encodeURIComponent(m.id);
      render();
      if (focus) $('cl-title').focus();
    },
  };
})();
