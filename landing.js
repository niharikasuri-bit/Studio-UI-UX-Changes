/* ==========================================================
   Service Landing Page — Studio Prototype
   Route: #/landing (service level, from the "Service Landing Page" card → Manage Content)
   Centre: phone preview of the citizen landing page (header, hero banner, quick actions, FAQ).
   Right: Page Properties — Hero Banner / Quick Actions / Frequently Asked Questions, each with a switch,
          built like the document editor's Personalization Variables (white inner cards, lists, "+ Add …").
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.landing.v1';
  const ACTIONS = {
    apply: ['Apply', '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 12v6M9 15h6"/>'],
    renew: ['Renew', '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5"/>'],
    track: ['Track', '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'],
    pay: ['Pay Fees', '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'],
    download: ['Download Certificate', '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'],
    amend: ['Amend', '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>'],
  };
  const actLabel = k => (data.actions.labels && data.actions.labels[k]) || ACTIONS[k][0];
  const DEFAULT = () => ({
    hero: { on: true, title: 'Business License', desc: 'Learn more about Business License, submit an application, and track the progress of your applications.' },
    actions: { on: true, list: ['apply', 'renew', 'track'] },
    faq: { on: true, list: [
      { q: 'Who can apply?', a: 'Any business owner trading within the city limits can apply for a business license.' },
      { q: 'What documents do I need?', a: 'Identity proof, proof of address of the business, and the property tax receipt.' },
    ] },
  });
  let data = DEFAULT();
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.hero) data = s; } catch (e) {}
  data.hero.on = true; data.actions.on = true;   // only the FAQ section can be turned off
  let saved = JSON.stringify(data);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} saved = JSON.stringify(data); };
  var heroOpen = false, actKey = null, qIdx = -1, actsOpen = false;
  let openFaq = 0;   // which FAQ is expanded in the phone

  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    left: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plus: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    plusSq: '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>',
    trash: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    upload: '<svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
    info: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    chev: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
  };
  const icon = (paths, size = 20) => `<svg aria-hidden="true" focusable="false" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  const tip = (id, label, text) => `<span class="tip"><button type="button" class="tip-btn" aria-label="About ${label}" aria-describedby="${id}">${I.info}</button><span class="tip-bubble" role="tooltip" id="${id}">${text}</span></span>`;

  /* ---------- Shell ---------- */
  const view = $('view-landing');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="lp-back-top" href="#/">${I.back} Back to Service Dashboard</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <div class="form-body lp-body">
      <div class="form-main lp-main">
        <div class="lp-head">
          <h1 class="page-title" id="lp-title" tabindex="-1">Service Landing Page</h1>
        </div>
        <div class="lp-stage" id="lp-stage">
          <div class="lp-fit" id="lp-fit">
            <div class="lp-phone" role="region" aria-label="Phone preview of the landing page">
              <span class="lp-cam" aria-hidden="true"></span>
              <div class="lp-screen" id="lp-screen"></div>
            </div>
          </div>
        </div>
      </div>
      <aside class="form-panel" aria-label="Landing page items">
        <div class="panel-view" id="lp-list-view">
          <div class="fp-head"><h2 class="fp-title">Landing Page Items</h2></div>
          <div class="fp-scroll" id="lp-props"></div>
        </div>
        <div class="panel-view" id="lp-q-view" hidden></div>
      </aside>
    </div>
    <footer class="form-foot">
      <a class="btn btn-secondary" id="lp-back" href="#/">${I.left} Back</a>
      <button type="button" class="btn btn-primary dc-save" id="lp-save">${I.check} Save</button>
    </footer>

    <dialog class="modal dc-vd" id="lp-act-dlg" aria-labelledby="lp-ad-t" aria-describedby="lp-ad-d">
      <form id="lp-act-form" novalidate>
        <button type="button" class="icon-btn dc-vd-close" data-close aria-label="Close">${I.close}</button>
        <h2 class="dc-vd-title" id="lp-ad-t"><span class="dc-vd-ico" aria-hidden="true">${I.plusSq}</span><span>Add Quick Action</span></h2>
        <p class="dc-vd-desc" id="lp-ad-d">Select the actions applicants can start from the landing page.</p>
        <div class="dc-vd-field">
          <p class="dc-vd-label" id="lp-ad-l">Quick Actions <span class="req" aria-hidden="true">*</span></p>
          <fieldset class="check-list dc-vd-list" id="lp-ad-list" aria-labelledby="lp-ad-l" aria-describedby="lp-ad-err"><legend>Quick Actions</legend></fieldset>
          <p class="error" id="lp-ad-err" hidden>Select at least one action.</p>
        </div>
        <div class="dc-vd-actions">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Add Action</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal dc-vd lp-faq-dlg" id="lp-faq-dlg" aria-labelledby="lp-fq-t" aria-describedby="lp-fq-d">
      <form id="lp-faq-form" novalidate>
        <button type="button" class="icon-btn dc-vd-close" data-close aria-label="Close">${I.close}</button>
        <h2 class="dc-vd-title" id="lp-fq-t"><span class="dc-vd-ico" aria-hidden="true">${I.plusSq}</span><span id="lp-fq-tt">Add FAQ</span></h2>
        <p class="dc-vd-desc" id="lp-fq-d">Add a question applicants often ask, and its answer.</p>
        <div class="dc-vd-field">
          <label class="dc-vd-label" for="lp-fq-q">Question <span class="req" aria-hidden="true">*</span></label>
          <input class="input" id="lp-fq-q" type="text" maxlength="100" autocomplete="off" aria-required="true" aria-describedby="lp-fq-q-err lp-fq-q-n">
          <div class="fp-meta"><p class="error" id="lp-fq-q-err" hidden>Enter the question.</p><span class="fp-count" id="lp-fq-q-n" data-dcount="100"></span></div>
        </div>
        <div class="dc-vd-field">
          <label class="dc-vd-label" for="lp-fq-a">Answer <span class="req" aria-hidden="true">*</span></label>
          <textarea class="input lp-textarea" id="lp-fq-a" rows="4" maxlength="300" aria-required="true" aria-describedby="lp-fq-a-err lp-fq-a-n"></textarea>
          <div class="fp-meta"><p class="error" id="lp-fq-a-err" hidden>Enter the answer.</p><span class="fp-count" id="lp-fq-a-n" data-dcount="300"></span></div>
        </div>
        <div class="dc-vd-actions">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary" id="lp-fq-ok">Add FAQ</button>
        </div>
      </form>
    </dialog>`;
  view.querySelectorAll('dialog').forEach(dl => {
    dl.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dl.close()));
    dl.addEventListener('click', e => { if (e.target === dl) dl.close(); });
  });

  /* ---------- Phone preview ---------- */
  // Scale the fixed-size phone (320 × 592) as one picture to fit the stage, so its inside never reflows with browser zoom
  const PW = 320, PH = 592;
  function fitPhone() {
    const st = $('lp-stage'), fit = $('lp-fit'); if (!st || !fit || view.hidden) return;
    const cs = getComputedStyle(st);
    const h = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const w = st.clientWidth - 32;
    // fixed height: the phone is always shown at its full size (320 × 592); the centre scrolls if the window is shorter
    const k = 1;
    fit.style.width = PW * k + 'px'; fit.style.height = PH * k + 'px';
    fit.firstElementChild.style.transform = `scale(${k})`;
  }
  if (window.ResizeObserver) new ResizeObserver(fitPhone).observe($('lp-stage'));
  window.addEventListener('resize', fitPhone);
  window.addEventListener('hashchange', () => requestAnimationFrame(fitPhone));

  function drawPhone() {
    const h = data.hero, a = data.actions, f = data.faq;
    $('lp-screen').innerHTML = `
      <div class="lp-top" aria-hidden="true">
        <span class="lp-burger"></span>
        <span class="lp-mark"><svg width="16" height="14" viewBox="0 0 16 14" focusable="false"><circle cx="3" cy="3" r="2.2" fill="#F4B41A"/><circle cx="3" cy="11" r="2.2" fill="#00A3AD"/><circle cx="9" cy="7" r="2.2" fill="#0B4B66"/><circle cx="14" cy="3" r="1.6" fill="#29A8E0"/></svg>DIGIT</span>
        <span class="lp-bell"><svg width="18" height="18" viewBox="0 0 24 24" focusable="false"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="#0B0C0C"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" stroke="#0B0C0C" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>
      </div>
      ${h.on ? `<div class="lp-hero${heroOpen ? ' is-sel' : ''}${h.bg ? ' has-bg' : ''}" data-phero${h.bg ? ` style="background-image: linear-gradient(rgba(11,75,102,.78), rgba(11,75,102,.78)), url('${esc(h.bg)}')"` : ''}><p class="lp-hero-t">${esc(h.title || 'Service name')}</p>${h.desc ? `<p class="lp-hero-d">${esc(h.desc)}</p>` : ''}</div>` : ''}
      <div class="lp-content">
        ${a.on && a.list.length ? `<div class="lp-qa-sec lp-sec${actsOpen ? ' is-sel' : ''}" data-pacts><p class="lp-h">Quick <b>Actions</b></p>
          <div class="lp-tiles${a.list.length > 3 ? ' is-many' : ''}">${a.list.map(k => `<button type="button" class="lp-tile${actKey === k ? ' is-sel' : ''}" data-pact="${k}">${icon(ACTIONS[k][1])}<span>${esc(actLabel(k))}</span></button>`).join('')}</div></div>` : ''}
        ${f.on && f.list.length ? `<div class="lp-sec lp-fq-sec${qIdx >= 0 ? ' is-sel' : ''}" data-pfaqs><p class="lp-h">Frequently Asked <b>Questions</b></p>
          <div class="lp-faqs">${f.list.map((x, i) => `<div class="lp-faq${openFaq === i ? ' is-open' : ''}${qIdx === i ? ' is-sel' : ''}">
              <button type="button" class="lp-faq-q" data-pfaq="${i}" aria-expanded="${openFaq === i}">${esc(x.q)}<span class="lp-chev">${I.chev}</span></button>
              ${openFaq === i ? `<p class="lp-faq-a">${esc(x.a)}</p>` : ''}</div>`).join('')}</div></div>` : ''}
        ${!h.on && !(a.on && a.list.length) && !(f.on && f.list.length) ? '<p class="lp-empty">Turn on a section to add it to the landing page.</p>' : ''}
      </div>`;
  }
  $('lp-screen').addEventListener('click', e => {
    const ta = e.target.closest('[data-pact]'); if (ta) return openAct(ta.dataset.pact, true);
    if (e.target.closest('[data-pacts]')) return openActs();   // the Quick Actions section as a whole
    if (e.target.closest('[data-phero]')) return openHero();
    const b = e.target.closest('[data-pfaq]');
    if (!b) { if (e.target.closest('[data-pfaqs]') && data.faq.list.length) openQ(qIdx >= 0 ? qIdx : 0); return; }
    const i = +b.dataset.pfaq; openFaq = openFaq === i ? -1 : i; drawPhone();
    $('lp-screen').querySelector(`[data-pfaq="${i}"]`)?.focus();
    if (openFaq === i) openQ(i, true);
  });

  /* ---------- Right panel ---------- */
  const sw = (k, on, label) => `<button type="button" class="switch" role="switch" data-lsw="${k}" aria-checked="${on}" aria-label="${label}"><span class="switch-knob" aria-hidden="true"></span></button>`;
  function drawProps() {
    const h = data.hero, a = data.actions, f = data.faq;
    const left = Object.keys(ACTIONS).filter(k => !a.list.includes(k));
    $('lp-props').innerHTML = `
      <div class="fp-section">
        <ul class="field-list" aria-label="Page sections">
          <li class="field-card lp-fc"><button type="button" class="lp-fc-open" data-edithero><span class="field-name">Hero Banner</span></button></li>
          <li class="field-card lp-fc"><button type="button" class="lp-fc-open" data-editacts><span class="field-name">Quick Actions</span></button></li>
        </ul>
      </div>
      <div class="fp-section">
        <div class="lp-tc${f.on ? ' is-on' : ''}">
          <div class="lp-tc-head"><h4 class="lp-tc-title" id="lp-fq-sw">FAQ's</h4>
            <button type="button" class="switch" role="switch" data-lsw="faq" aria-checked="${f.on}" aria-labelledby="lp-fq-sw"><span class="switch-knob" aria-hidden="true"></span></button></div>
          ${f.on ? `${f.list.length ? `<ul class="lp-ll" aria-label="FAQs">${f.list.map((x, i) => `<li class="lp-li">
              <button type="button" class="lp-li-open" data-editfaq="${i}" aria-label="Edit FAQ ${i + 1}: ${esc(x.q)}">FAQ ${i + 1}</button>
              <button type="button" class="lp-li-btn" data-rmfaq="${i}" aria-label="Delete FAQ ${i + 1}">${I.trash}</button></li>`).join('')}</ul>` : ''}
            <button type="button" class="btn btn-secondary lp-ic-add" id="lp-add-faq">${I.plus} Add FAQ</button>` : ''}
        </div>
      </div>`;
    $('lp-props').querySelectorAll('.tip').forEach(t => { const b2 = t.querySelector('.tip-btn'); if (!b2) return;
      b2.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      b2.addEventListener('blur', () => t.classList.remove('open', 'dismissed')); });
  }
  const props = $('lp-props');
  props.addEventListener('input', e => { const k = e.target.dataset.hero; if (!k) return; data.hero[k] = e.target.value; heroCount(k); drawPhone(); });
  // the hero on the phone is highlighted orange while its fields are being edited
  props.addEventListener('focusin', e => { if (e.target.dataset.hero && !heroOpen) { heroOpen = true; drawPhone(); } });
  props.addEventListener('focusout', e => { if (e.target.dataset.hero && !(e.relatedTarget && e.relatedTarget.dataset && e.relatedTarget.dataset.hero)) { heroOpen = false; drawPhone(); } });
  props.addEventListener('click', e => {
    const t = e.target;
    const s = t.closest('[data-lsw]');
    if (s) { const k = s.dataset.lsw; data[k].on = !data[k].on; drawProps(); drawPhone(); props.querySelector(`[data-lsw="${k}"]`).focus();
      S.announce(`${s.getAttribute('aria-label')} ${data[k].on ? 'shown on' : 'hidden from'} the landing page.`); return; }
    const ra = t.closest('[data-rmact]');
    if (ra) { const [k] = data.actions.list.splice(+ra.dataset.rmact, 1); drawProps(); drawPhone(); ($('lp-props').querySelector('[data-rmact]') || $('lp-add-act')).focus(); S.announce(`${ACTIONS[k][0]} removed.`); return; }
    const rf = t.closest('[data-rmfaq]');
    if (rf) { const [x] = data.faq.list.splice(+rf.dataset.rmfaq, 1); openFaq = 0; drawProps(); drawPhone(); ($('lp-props').querySelector('[data-rmfaq]') || $('lp-add-faq')).focus(); S.announce('FAQ removed.'); return; }
    const ef = t.closest('[data-editfaq]'); if (ef) return openQ(+ef.dataset.editfaq);
    const ea = t.closest('[data-editact]'); if (ea) return openAct(ea.dataset.editact);
    if (t.closest('[data-edithero]')) return openHero();
    if (t.closest('[data-editacts]')) return openActs();
    if (t.closest('#lp-add-act')) return openActDlg(t.closest('#lp-add-act'));
    if (t.closest('#lp-add-faq')) return openFaqDlg(-1, t.closest('#lp-add-faq'));
  });

  /* ---------- Add Quick Action (checkbox list, same as the variable popup) ---------- */
  const actDlg = $('lp-act-dlg'); let actBack = null;
  function openActDlg(from) {
    actBack = from;
    const list = $('lp-ad-list'); list.querySelectorAll('.check-row').forEach(r => r.remove());
    Object.keys(ACTIONS).filter(k => !data.actions.list.includes(k)).forEach(k =>
      list.insertAdjacentHTML('beforeend', `<label class="check-row"><input type="checkbox" value="${k}"> ${esc(ACTIONS[k][0])}</label>`));
    $('lp-ad-err').hidden = true; actDlg.showModal(); list.querySelector('input')?.focus();
  }
  $('lp-ad-list').addEventListener('change', () => { $('lp-ad-err').hidden = true; });
  $('lp-act-form').addEventListener('submit', e => {
    e.preventDefault();
    const ks = [...$('lp-ad-list').querySelectorAll('input:checked')].map(i => i.value);
    if (!ks.length) { $('lp-ad-err').hidden = false; $('lp-ad-list').querySelector('input')?.focus(); return; }
    data.actions.list.push(...ks); actBack = null; actDlg.close(); drawProps(); drawPhone(); $('lp-add-act')?.focus() || $('lp-props').querySelector('[data-rmact]')?.focus();
    S.toast(`${ks.length === 1 ? ACTIONS[ks[0]][0] : ks.length + ' actions'} added`);
  });
  actDlg.addEventListener('close', () => { if (actBack && document.contains(actBack)) actBack.focus(); actBack = null; });

  /* ---------- Add / edit question ---------- */
  const faqDlg = $('lp-faq-dlg'); let faqIdx = -1, faqBack = null;
  // character counts in the Add / Edit FAQ popup (same caps as the FAQ item properties)
  const faqDlgCount = () => [['lp-fq-q', 'lp-fq-q-n'], ['lp-fq-a', 'lp-fq-a-n']].forEach(([f, n]) => {
    const c = $(n); c.innerHTML = `${$(f).value.length}/${c.dataset.dcount}<span class="sr-only"> characters</span>`; });
  $('lp-fq-q').addEventListener('input', faqDlgCount); $('lp-fq-a').addEventListener('input', faqDlgCount);
  function openFaqDlg(i, from) {
    faqIdx = i; faqBack = from; const x = i >= 0 ? data.faq.list[i] : { q: '', a: '' };
    $('lp-fq-tt').textContent = i >= 0 ? `Edit FAQ ${i + 1}` : 'Add FAQ';
    $('lp-fq-ok').textContent = i >= 0 ? 'Save' : 'Add FAQ';
    $('lp-fq-q').value = x.q; $('lp-fq-a').value = x.a;
    ['q', 'a'].forEach(k => { $(`lp-fq-${k}-err`).hidden = true; $(`lp-fq-${k}`).removeAttribute('aria-invalid'); });
    faqDlgCount(); faqDlg.showModal(); $('lp-fq-q').focus();
  }
  $('lp-faq-form').addEventListener('submit', e => {
    e.preventDefault();
    const q = $('lp-fq-q').value.trim(), a = $('lp-fq-a').value.trim(), bad = [];
    [['q', q], ['a', a]].forEach(([k, v]) => { const no = !v; $(`lp-fq-${k}-err`).hidden = !no; no ? ($(`lp-fq-${k}`).setAttribute('aria-invalid', 'true'), bad.push(k)) : $(`lp-fq-${k}`).removeAttribute('aria-invalid'); });
    if (bad.length) { $(`lp-fq-${bad[0]}`).focus(); return; }
    const was = faqIdx >= 0;
    if (was) Object.assign(data.faq.list[faqIdx], { q, a }); else { data.faq.list.push({ q, a }); openFaq = data.faq.list.length - 1; }
    faqBack = null; faqDlg.close(); drawProps(); drawPhone();
    $('lp-props').querySelector(`[data-editfaq="${was ? faqIdx : data.faq.list.length - 1}"]`)?.focus();
    S.toast(was ? 'Question updated' : 'Question added');
  });
  faqDlg.addEventListener('close', () => { if (faqBack && document.contains(faqBack)) faqBack.focus(); faqBack = null; });

  /* Question properties (same frame as the document element view, but no Element / Appearance tabs) */
  function openQ(i, keepFocus) {
    actKey = null; heroOpen = false; actsOpen = false; qIdx = i; openFaq = i; drawPhone();
    const x = data.faq.list[i], qv = $('lp-q-view');
    $('lp-list-view').hidden = true; qv.hidden = false;
    qv.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="lp-q-back">${I.left} Back to landing page items</button>
        <h2 class="fpp-title" id="lp-q-title">Item Properties</h2>
      </div>
      <div class="fp-scroll"><div class="fpp-body">
        <p class="fpp-intro">These are the properties of the element you selected. You can customise them to suit your needs.</p>
        <div class="fpp-box"><h3 class="fpp-box-title">FAQ ${i + 1}</h3>
          <div class="fpp-field"><label class="fpp-label" for="lp-q-q">Question</label>
            <input class="fp-input" id="lp-q-q" type="text" maxlength="${FL.q}" value="${esc(x.q)}" data-q="q" autocomplete="off" aria-describedby="lp-q-q-meta">
            <div class="fp-meta" id="lp-q-q-meta"><span class="fp-count" data-qcount="q">${x.q.length}/${FL.q}<span class="sr-only"> characters</span></span></div></div>
          <div class="fpp-field"><label class="fpp-label" for="lp-q-a">Answer</label>
            <textarea class="fp-textarea lp-textarea" id="lp-q-a" rows="5" maxlength="${FL.a}" data-q="a" aria-describedby="lp-q-a-meta">${esc(x.a)}</textarea>
            <div class="fp-meta" id="lp-q-a-meta"><span class="fp-count" data-qcount="a">${x.a.length}/${FL.a}<span class="sr-only"> characters</span></span></div></div>
        </div>
      </div></div>`;
    if (!keepFocus) $('lp-q-q').focus();
  }
  const HL = { title: 40, desc: 200 };
  const FL = { q: 100, a: 300 };   // FAQ caps: question / answer
  const heroCount = k => { const c = document.querySelector(`#lp-q-view [data-count="${k}"]`); if (c) c.innerHTML = `${data.hero[k].length}/${HL[k]}<span class="sr-only"> characters</span>`; };
  /* Background image: upload a file OR add a link (one way at a time), like the logo in Studio Branding */
  let bgLink = '', bgErr = '', bgLinkErr = '';
  const isLink = v => /^https?:/i.test(v || '');
  function bgBox() {
    const bg = data.hero.bg || '', uploaded = bg.startsWith('data:'), linked = isLink(bg);
    if (linked) bgLink = bg;
    return `<div class="fpp-box"><h3 class="fpp-box-title">Hero Banner Background Image</h3>
      <div class="fpp-field"><p class="fpp-label" id="lp-bg-l">Upload image</p>
        ${uploaded
          ? `<div class="dc-logo-tile lp-bg-tile"><img src="${bg}" alt="Uploaded background image"><button type="button" class="dc-logo-x" id="lp-bg-rm" aria-label="Remove background image">${I.close}</button></div>`
          : `<div class="dc-logo-drop${linked ? ' is-disabled' : ''}" id="lp-bg-drop"${linked ? ' inert aria-disabled="true"' : ''}><span class="dc-logo-ico" aria-hidden="true">${I.upload}</span>
              <p>Drag and drop your image or <button type="button" class="dc-browse" id="lp-bg-up" aria-describedby="lp-bg-l">Browse in my files</button></p></div>
             ${linked ? '<p class="lp-off-hint">Clear the image link to upload a file instead.</p>' : ''}`}
        <p class="error" id="lp-bg-err" role="alert"${bgErr ? '' : ' hidden'}>${esc(bgErr)}</p>
        <input type="file" id="lp-bg-file" accept="image/png,image/svg+xml,image/jpeg" tabindex="-1" aria-hidden="true" hidden>
      </div>
      <p class="lp-or" aria-hidden="true"><span>or</span></p>
      <div class="fpp-field"><label class="fpp-label" for="lp-bg-link">Image link</label>
        <input class="fp-input" id="lp-bg-link" type="text" placeholder="https://" autocomplete="off" value="${esc(bgLink)}"${uploaded ? ' disabled' : ''}
               aria-describedby="lp-bg-link-msg"${bgLinkErr ? ' aria-invalid="true"' : ''}>
        <p class="${bgLinkErr ? 'error' : 'lp-off-hint'}" id="lp-bg-link-msg"${bgLinkErr || uploaded ? '' : ' hidden'}>${bgLinkErr ? esc(bgLinkErr) : 'Remove the uploaded image to add a link instead.'}</p>
      </div>
    </div>`;
  }
  const redrawHero = focusId => { const y = $('lp-q-view').querySelector('.fp-scroll')?.scrollTop || 0; openHero(true); const sc = $('lp-q-view').querySelector('.fp-scroll'); if (sc) sc.scrollTop = y; focusId && $(focusId)?.focus(); };
  function takeBg(f) {
    if (!f) return;
    if (!/^image\/(png|jpeg|svg\+xml)$/.test(f.type)) { bgErr = 'Choose a PNG, SVG or JPG file'; return redrawHero('lp-bg-up'); }
    const r = new FileReader();
    r.onload = () => { data.hero.bg = String(r.result); bgErr = ''; bgLink = ''; bgLinkErr = ''; drawPhone(); redrawHero('lp-bg-rm'); S.announce('Background image uploaded.'); };
    r.readAsDataURL(f);
  }
  function addBgLink() {
    const url = ($('lp-bg-link')?.value || '').trim(); bgLink = url;
    if (!url) { if (isLink(data.hero.bg)) { data.hero.bg = ''; drawPhone(); } bgLinkErr = ''; return redrawHero('lp-bg-link'); }
    if (!/^https?:\/\/\S+$/i.test(url)) { bgLinkErr = 'Enter a link that starts with https://'; return redrawHero('lp-bg-link'); }
    const img = new Image();
    img.onload = () => { data.hero.bg = url; bgLinkErr = ''; drawPhone(); redrawHero(); S.announce('Background image added.'); };
    img.onerror = () => { bgLinkErr = 'We couldn’t load an image from this link. Check it opens a PNG, SVG or JPG.'; redrawHero('lp-bg-link'); };
    img.src = url;
  }
  const qv0 = $('lp-q-view');
  qv0.addEventListener('click', e => {
    if (!heroOpen) return;
    if (e.target.closest('#lp-bg-up')) return $('lp-bg-file').click();
    if (e.target.closest('#lp-bg-rm')) { data.hero.bg = ''; drawPhone(); redrawHero('lp-bg-up'); S.announce('Background image removed.'); }
  });
  qv0.addEventListener('change', e => { if (e.target.id === 'lp-bg-file') { takeBg(e.target.files[0]); e.target.value = ''; } });
  qv0.addEventListener('dragover', e => { const z = e.target.closest('#lp-bg-drop'); if (z && !z.hasAttribute('inert')) { e.preventDefault(); z.classList.add('is-over'); } });
  qv0.addEventListener('dragleave', e => { const z = e.target.closest('#lp-bg-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
  qv0.addEventListener('drop', e => { const z = e.target.closest('#lp-bg-drop'); if (!z || z.hasAttribute('inert')) return; e.preventDefault(); takeBg(e.dataTransfer.files[0]); });
  // the link is checked when they leave the field or press Enter
  qv0.addEventListener('focusout', e => { if (e.target.id === 'lp-bg-link' && (e.target.value.trim() !== (isLink(data.hero.bg) ? data.hero.bg : '') )) addBgLink(); });
  qv0.addEventListener('keydown', e => { if (e.target.id === 'lp-bg-link' && e.key === 'Enter') { e.preventDefault(); addBgLink(); } });
  function openHero(keepFocus) {
    actKey = null; qIdx = -1; actsOpen = false; heroOpen = true; drawPhone();
    const h = data.hero, qv = $('lp-q-view');
    $('lp-list-view').hidden = true; qv.hidden = false;
    qv.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="lp-q-back">${I.left} Back to landing page items</button>
        <h2 class="fpp-title" id="lp-q-title">Item Properties</h2>
      </div>
      <div class="fp-scroll"><div class="fpp-body">
        <p class="fpp-intro">These are the properties of the element you selected. You can customise them to suit your needs.</p>
        <div class="fpp-box"><h3 class="fpp-box-title">Hero Banner Text</h3>
          <div class="fpp-field"><span class="fp-label"><label class="fpp-label" for="lp-h-title">Heading</label>${tip('lp-tip-h', 'heading', 'The title at the top of the landing page, pulled from the service name.')}</span>
            <input class="fp-input" id="lp-h-title" type="text" autocomplete="off" maxlength="${HL.title}" data-hero="title" value="${esc(h.title)}" aria-describedby="lp-h-title-meta">
            <div class="fp-meta" id="lp-h-title-meta"><span class="fp-error"></span><span class="fp-count" data-count="title"></span></div></div>
          <div class="fpp-field"><span class="fp-label"><label class="fpp-label" for="lp-h-desc">Description</label>${tip('lp-tip-d', 'description', 'The short text under the hero banner heading.')}</span>
            <textarea class="fp-textarea" id="lp-h-desc" maxlength="${HL.desc}" data-hero="desc" aria-describedby="lp-h-desc-meta">${esc(h.desc)}</textarea>
            <div class="fp-meta" id="lp-h-desc-meta"><span class="fp-error"></span><span class="fp-count" data-count="desc"></span></div></div>
        </div>
        ${bgBox()}
      </div></div>`;
    heroCount('title'); heroCount('desc');
    if (!keepFocus) $('lp-h-title').focus();
  }
  $('lp-q-view').addEventListener('input', e => { const k = e.target.dataset.hero; if (!k || !heroOpen) return; data.hero[k] = e.target.value; heroCount(k); drawPhone(); });
  function openAct(k) { openActs(k); }   // a tile on the phone opens Quick Actions on that action
  function openActs(k) {
    qIdx = -1; heroOpen = false; actsOpen = true; actKey = k || null; drawPhone();
    const qv = $('lp-q-view');
    $('lp-list-view').hidden = true; qv.hidden = false;
    qv.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="lp-q-back">${I.left} Back to landing page items</button>
        <h2 class="fpp-title" id="lp-q-title">Item Properties</h2>
      </div>
      <div class="fp-scroll"><div class="fpp-body">
        <p class="fpp-intro">These are the properties of the element you selected. You can customise them to suit your needs.</p>
        ${data.actions.list.map(x => `<div class="fpp-box"><h3 class="fpp-box-title">${esc(ACTIONS[x][0])}</h3>
          <div class="fpp-field"><label class="fpp-label" for="lp-act-${x}">Card Text</label>
            <input class="fp-input" id="lp-act-${x}" type="text" maxlength="30" value="${esc(actLabel(x))}" data-act-label="${x}" autocomplete="off"></div>
        </div>`).join('')}
      </div></div>`;
    const first = $('lp-act-' + (k || data.actions.list[0]));
    first?.focus(); if (k) first?.scrollIntoView({ block: 'nearest' });
  }
  // the tile being edited is highlighted orange on the phone
  $('lp-q-view').addEventListener('focusin', e => { const x = e.target.dataset.actLabel; if (x && actKey !== x) { actKey = x; drawPhone(); } });
  $('lp-q-view').addEventListener('input', e => {
    const x = e.target.dataset.actLabel; if (!x) return;
    (data.actions.labels = data.actions.labels || {})[x] = e.target.value.trim() || ACTIONS[x][0]; drawPhone();
  });
  function closeQ() {
    setTimeout(drawPhone);   // drop the orange selection on the phone
    if (heroOpen) { heroOpen = false; $('lp-q-view').hidden = true; $('lp-list-view').hidden = false; drawProps();
      $('lp-props').querySelector('[data-edithero]')?.focus(); return; }
    if (actsOpen) { actsOpen = false; actKey = null; $('lp-q-view').hidden = true; $('lp-list-view').hidden = false; drawProps();
      $('lp-props').querySelector('[data-editacts]')?.focus(); return; }
    const i = qIdx; qIdx = -1;
    $('lp-q-view').hidden = true; $('lp-list-view').hidden = false; drawProps();
    $('lp-props').querySelector(`[data-editfaq="${i}"]`)?.focus();
  }
  $('lp-q-view').addEventListener('click', e => { if (e.target.closest('#lp-q-back')) closeQ(); });
  $('lp-q-view').addEventListener('input', e => {
    const k = e.target.dataset.q; if (!k || qIdx < 0) return;
    data.faq.list[qIdx][k] = e.target.value; drawPhone();
    const c = $('lp-q-view').querySelector(`[data-qcount="${k}"]`); if (c) c.innerHTML = `${e.target.value.length}/${FL[k]}<span class="sr-only"> characters</span>`;
  });

  $('lp-save').addEventListener('click', () => { save(); S.toast('Landing page saved'); S.announce('Landing page saved.'); });

  window.StudioLanding = {
    render(focus) {
      drawPhone(); drawProps();
      if (focus) $('lp-title').focus();
    },
  };
})();
