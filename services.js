/* Editing a published service.
   #/services/nodraft  Studio landing → Edit Service → "Edit Published Service" popup → Proceed → service flow (V2 draft)
   #/services/draft    Studio landing → Edit Service → "Choose how you want to continue editing"
   #/edit-choice       Continue Draft → service flow (V2 draft) | Start Again From Scratch → popup → Proceed → service flow (new V2 draft) */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const svg = (d, w = 16, extra = '') => `<svg aria-hidden="true" focusable="false" width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
  const I = {
    back: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    guides: '<rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/>',
    plus: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-9 8"/>',
    draft: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    fresh: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12a4 4 0 1 0 1.2-2.8M8 6.5v3h3"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7.5v.5"/>',
    warn: '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18v.5"/>',
  };
  // Sample services (fictional): the first is this Studio's own service
  const SERVICE = () => ((document.querySelector('#view-service .page-title') || {}).firstChild || {}).textContent?.trim() || 'Studio Prototype';
  const SERVICES = () => [
    { name: SERVICE(), desc: 'Apply for, renew, and amend business licences online.', date: '12/11/2026', ver: 'V1', tint: '#F6F0E8', own: true },
    { name: 'Building Permit', desc: 'Apply for permission to build or change a building.', date: '28/10/2026', ver: 'V3', tint: '#E8F4EA' },
    { name: 'Water Connection', desc: 'Request a new water connection for a property.', date: '14/10/2026', ver: 'V2', tint: '#E9E7F5' },
    { name: 'Property Tax', desc: 'Assess, pay, and get receipts for property tax.', date: '02/10/2026', ver: 'V1', tint: '#F6F0E8' },
    { name: 'Birth Certificate', desc: 'Register a birth and get a certificate.', date: '19/09/2026', ver: 'V4', tint: '#E8F4EA' },
  ];
  let mode = 'nodraft', tab = 'published';

  const subbar = backHref => `<div class="subbar">
      <a class="btn btn-secondary" href="${backHref}">${svg(I.back)} <span>${backHref === 'index.html' ? 'Back to Home' : 'Back'}</span></a>
      <button type="button" class="btn btn-secondary">${svg(I.guides)} Tutorials and Guides</button></div>`;

  function landing(focus) {
    const view = $('view-services');
    const list = tab === 'published' ? SERVICES() : SERVICES().filter(s => s.own && mode === 'draft');
    view.innerHTML = `${subbar('index.html')}
      <div class="sv-body">
        <h1 class="page-title" tabindex="-1">Design and Launch Public Services</h1>
        <p class="sv-desc">Create service delivery applications to manage the end-to-end delivery of citizen services. Build a new service from scratch, or use one of the pre-configured templates.</p>
        <section class="section sv-box">
          <div class="sv-tabs" role="tablist" aria-label="Services">
            <button type="button" role="tab" class="sv-tab" data-svtab="published" aria-selected="${tab === 'published'}" tabindex="${tab === 'published' ? 0 : -1}" aria-controls="sv-grid">Published</button>
            <button type="button" role="tab" class="sv-tab" data-svtab="drafts" aria-selected="${tab === 'drafts'}" tabindex="${tab === 'drafts' ? 0 : -1}" aria-controls="sv-grid">Drafts</button>
          </div>
          <div class="sv-grid" id="sv-grid" role="tabpanel">
            ${tab === 'published' ? `<a class="sv-new" href="#/">${svg(I.plus, 28)}<span>Create a New Service</span></a>` : ''}
            ${list.length ? list.map((s, i) => `
              <article class="card sv-card">
                <div class="sv-card-head"><h2 class="card-title" id="sv-t${i}">${esc(s.name)}</h2></div>
                <p class="card-desc">${esc(s.desc)}</p>
                <div class="tags sv-meta"><span class="tag tag-info">${svg(I.cal, 12)} ${s.date}</span><span class="tag ${tab === 'drafts' ? 'tag-warn' : 'tag-info'}">${svg(I.layers, 12)} ${tab === 'drafts' ? 'V2 · Draft' : s.ver}</span></div>
                <div class="sv-img" style="background:${s.tint}" aria-hidden="true">${svg(I.img, 28)}</div>
                <div class="sv-acts">
                  <button type="button" class="btn btn-secondary" data-edit="${i}" aria-describedby="sv-t${i}">${svg(I.pen)} Edit Service</button>
                  <a class="btn btn-primary" href="#/published" aria-describedby="sv-t${i}">${svg(I.eye)} View Service</a>
                </div>
              </article>`).join('') : `<p class="sv-none">No drafts yet.</p>`}
          </div>
        </section>
      </div>
      ${popups()}`;
    if (focus) view.querySelector(focus === true ? '.page-title' : focus)?.focus();
  }

  function choice(focus) {
    const view = $('view-services');
    view.innerHTML = `${subbar('#/services/draft')}
      <div class="sv-body">
        <h1 class="page-title" tabindex="-1">Choose how you want to continue editing</h1>
        <p class="sv-desc">You already have a draft for this service. You can continue working on it or start fresh from the live version.</p>
        <div class="sv-choices">
          <button type="button" class="sv-choice" data-choice="continue">
            <span class="sv-choice-top"><span class="sv-choice-ic">${svg(I.draft, 22)}</span><span class="tag tag-info sv-rec">Recommended</span></span>
            <span class="sv-choice-t">Continue Draft</span>
            <span class="sv-choice-d">Resume your existing draft. Your changes are saved, so you can carry on from where you left off.</span>
            <span class="tag tag-warn sv-choice-tag">V2 · Draft</span>
          </button>
          <button type="button" class="sv-choice" data-choice="fresh">
            <span class="sv-choice-top"><span class="sv-choice-ic">${svg(I.fresh, 22)}</span></span>
            <span class="sv-choice-t">Start Again From Scratch</span>
            <span class="sv-choice-d">Discard your current draft and create a new one from the latest published version.</span>
            <span class="tag tag-success sv-choice-tag">V1 · Published</span>
          </button>
        </div>
      </div>
      ${popups()}`;
    if (focus) view.querySelector('.page-title').focus();
  }

  const popup = (id, title, desc, kind, boxTitle, boxText) => `
    <dialog class="modal sv-dlg" id="${id}" aria-labelledby="${id}-t" aria-describedby="${id}-d">
      <div class="modal-body">
        <button type="button" class="icon-btn modal-close" data-close aria-label="Close">${svg(I.x, 20)}</button>
        <div class="modal-head"><h2 class="modal-title sv-dlg-t" id="${id}-t">${title}</h2><p class="modal-desc" id="${id}-d">${desc}</p></div>
        ${kind === 'info'   // the Studio Info card (same as the dashboard's, without its button)
          ? `<div class="db-sample sv-info" role="note" aria-labelledby="${id}-it"><p class="db-sample-t" id="${id}-it"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6M12 7.5v.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg> ${boxTitle}</p><p class="db-sample-d">${boxText}</p></div>`
          : `<div class="sv-note is-${kind}">${svg(I.warn, 20)}<div><p class="sv-note-t">${boxTitle}</p><p>${boxText}</p></div></div>`}
        <div class="sv-dlg-acts"><button type="button" class="btn btn-secondary" data-close>Back</button><button type="button" class="btn btn-primary" data-proceed>Proceed</button></div>
      </div>
    </dialog>`;
  const popups = () => popup('sv-edit', 'Edit Published Service', "You're about to edit a published service. Your changes will be saved in a separate draft version.", 'info',
      'Info', 'The live service stays as it is. Your changes go live only when you publish the draft.')
    // alert card popup (same as the Studio's delete / exit alerts): red triangle, centred title, grey text, Back + Proceed
    + `<dialog class="modal pfc sv-dlg" id="sv-fresh" aria-labelledby="sv-fresh-t" aria-describedby="sv-fresh-d">
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="sv-fresh-t">Start Again From Scratch?</h2>
      <p class="pfc-desc" id="sv-fresh-d">You're about to discard your current draft. A new draft will be made from the latest published version. The changes in your current draft will be deleted, and this cannot be undone.</p>
      <div class="pfc-actions"><button type="button" class="btn btn-secondary" data-close>Back</button><button type="button" class="btn btn-primary" data-proceed>Proceed</button></div>
    </dialog>`;

  let opener = null;
  const open = (id, from) => { opener = from; const d = $(id); d.showModal(); d.querySelector('[data-close]:not(.modal-close)').focus(); };
  let editVer = 'V2';   // the new version being edited: the published version + 1
  const toDraft = fresh => {
    try { sessionStorage.setItem('studio-draft', editVer); } catch (e) {}
    window.Studio?.toast?.(fresh ? 'A new draft was made from the published version' : `Editing new version (${editVer}). Update any module, then republish the service.`);
    const first = (window.Studio && window.Studio.modules()[0]) || { id: 'application' };
    location.hash = '#/module/' + encodeURIComponent(first.id);   // lands on the module page, like the reference
  };

  document.addEventListener('click', e => {
    const view = $('view-services'); if (!view || view.hidden || !view.contains(e.target)) return;
    const t = e.target.closest('[data-svtab]'); if (t) { tab = t.dataset.svtab; landing(`[data-svtab="${tab}"]`); return; }
    if (mode === 'all' && !e.target.closest('dialog')) return;   // #/services/all has its own handler
    const ed = e.target.closest('[data-edit]');
    if (ed) { if (mode === 'nodraft' && tab === 'published') open('sv-edit', ed); else location.hash = '#/edit-choice'; return; }
    const ch = e.target.closest('[data-choice]');
    if (ch) { if (ch.dataset.choice === 'continue') toDraft(false); else open('sv-fresh', ch); return; }
    const d = e.target.closest('dialog');
    if (d && e.target.closest('[data-close]')) { d.close(); return; }
    if (d && e.target.closest('[data-proceed]')) {
      d.close();
      const r = mode === 'all' && ALL.editRow;
      if (r) { ALL.drafts = ALL.drafts.filter(x => x.name !== r.name); ALL.drafts.unshift({ name: r.name, date: today(), ver: editVer }); }
      toDraft(d.id === 'sv-fresh'); return;
    }
    if (d && e.target === d) d.close();
  });
  document.addEventListener('close', e => { if (e.target.classList?.contains('sv-dlg') && opener && document.contains(opener)) opener.focus(); }, true);
  document.addEventListener('keydown', e => {
    const list = e.target.closest && e.target.closest('#view-services [role="tablist"]'); if (!list) return;
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
    const tabs = [...list.querySelectorAll('[role="tab"]')], i = tabs.indexOf(e.target);
    e.preventDefault(); tabs[(i + k + tabs.length) % tabs.length].click();
  });


  /* ---------- #/services/all: Template, Import, Duplicate, Edit Published (copy of the Studio landing) ----------
     Import Service (top right) · Published / Drafts tabs · Create a New Service + service cards (⋮ → Duplicate, Edit, View)
     · View More · "Start from a pre-configured template" cards (description, View Template + Use Template). */
  const DEV = '<rect x="2" y="4" width="14" height="11" rx="1.5"/><path d="M5 19h8M9 15v4"/><rect x="15" y="9" width="7" height="12" rx="1.5"/>';
  const UP = '<path d="M12 15V3M7 10l5 5 5-5M4 21h16"/>';
  const KEBAB = '<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>';
  // Material Symbols (Google Fonts): publish = import (upload), system_update_alt = export (download), content_copy, delete
  const MS = n => ({ download: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>', upload: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h200v80H160v480h640v-480H600v-80h200q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-184L280-544l56-56 104 104v-304h80v304l104-104 56 56-200 200Z"/></svg>', copy: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>', del: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 -960 960 960" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>' })[n];
  const CARET = '<path d="M7 10l5 5 5-5z" fill="currentColor" stroke="none"/>';
  const TINTS = ['#E8F4EA', '#F6F0E8', '#E9E7F5'];   // theme-independent tints (same as module cards)
  const code = () => Math.random().toString(36).slice(2, 7).toUpperCase().replace(/[^A-Z0-9]/g, 'X').padEnd(5, '7');
  const today = () => { const d = new Date(); return [d.getDate(), d.getMonth() + 1, d.getFullYear()].map((n, i) => i < 2 ? String(n).padStart(2, '0') : n).join('/'); };
  const ALL = {
    tab: 'published', more: false,
    list: [
      { name: 'Service 9m0f7cx', date: '04/11/2026', ver: 'V2' },
      { name: 'ImpService Z3F9PC', date: '30/10/2026', ver: 'V2' },
      { name: 'DupService 5BZM4F', date: '29/10/2026', ver: 'V1' },
      { name: 'Trade Licence Renewal', date: '21/10/2026', ver: 'V3' },
      { name: 'Building Permit', date: '14/10/2026', ver: 'V1' },
      { name: 'Water Connection', date: '02/10/2026', ver: 'V2' },
    ],
    drafts: [{ name: 'Service 9m0f7cx', date: '06/11/2026', ver: 'V3' }],
  };
  const TEMPLATES = [
    { name: 'Complaints Management', desc: 'Let citizens raise complaints and track them until they are resolved, with each complaint routed to the right team.' },
    { name: 'Trade License', desc: 'Let businesses apply for, renew and amend trade licences, with document checks, inspection and fee payment.' },
    { name: 'Public Facility Management', desc: 'Enable citizens and organizations to discover, reserve, and manage bookings for public facilities such as community halls, sports grounds, auditoriums, and meeting spaces.' },
  ];
  function landingAll(focus) {
    const view = $('view-services');
    const rows = ALL.tab === 'published' ? ALL.list : ALL.drafts;
    const shown = ALL.more ? rows : rows.slice(0, 3);
    view.innerHTML = `${subbar('index.html')}
      <div class="sv-body sva">
        <div class="sva-head">
          <div><h1 class="page-title" tabindex="-1">Design and Launch Public Services</h1>
          <p class="sv-desc">Create service delivery applications to manage the end-to-end delivery of citizen services. Build a new service from scratch, or use one of the pre-configured templates.</p></div>
          <button type="button" class="btn btn-secondary sva-import" id="sva-import" aria-haspopup="dialog"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 -960 960 960" fill="currentColor"><path d="M440-160v-326L336-382l-56-58 200-200 200 200-56 58-104-104v326h-80ZM160-600v-120q0-33 23.5-56.5T240-800h480q33 0 56.5 23.5T800-720v120h-80v-120H240v120h-80Z"/></svg> Import Service</button>
        </div>
        <div class="sva-tabs" role="tablist" aria-label="Services">
          ${[['published', 'Published'], ['drafts', 'Drafts']].map(([k, t]) => `<button type="button" role="tab" class="sva-tab" data-svatab="${k}" aria-selected="${ALL.tab === k}" tabindex="${ALL.tab === k ? 0 : -1}" aria-controls="sva-grid">${t}</button>`).join('')}
        </div>
        <section class="section sva-box">
          <div class="sva-grid" id="sva-grid" role="tabpanel">
            <a class="sv-new" href="#/"><svg class="sva-plus" aria-hidden="true" focusable="false" width="36" height="36" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg><span>Create a New Service</span></a>
            ${shown.length ? shown.map((s, i) => `
              <article class="card sva-card">
                <div class="sva-card-head"><h2 class="card-title" id="sva-t${i}">${esc(s.name)}</h2>
                  <div class="sva-menu-wrap"><button type="button" class="sva-kebab" data-kebab="${i}" aria-haspopup="menu" aria-expanded="false" aria-label="More actions for ${esc(s.name)}">${svg(KEBAB, 20)}</button>
                    <div class="sva-menu" role="menu" hidden><button type="button" role="menuitem" data-dup="${i}">${MS('copy')} Duplicate</button><button type="button" role="menuitem" data-exp="${i}">${MS('upload')} Export</button><button type="button" role="menuitem" class="is-danger" data-del="${i}">${MS('del')} Delete</button></div></div></div>
                <div class="tags sva-meta"><span class="tag tag-info"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg> ${s.date}</span><span class="tag ${s.ver === 'V1' ? 'tag-info' : s.ver === 'V2' ? 'tag-warn' : 'sva-ver-3'}"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="7" cy="5" r="2.2"/><circle cx="7" cy="19" r="2.2"/><circle cx="17" cy="7" r="2.2"/><path d="M7 7.2v9.6M17 9.2c0 4.5-6.5 3.6-9.4 7.6"/></svg> ${s.ver}</span></div>
                <div class="sva-img" style="background:${TINTS[i % 3]}" aria-hidden="true"><svg aria-hidden="true" focusable="false" width="48" height="48" viewBox="0 -960 960 960" fill="currentColor"><path d="M80-160v-120h80v-440q0-33 23.5-56.5T240-800h600v80H240v440h240v120H80Zm520 0q-17 0-28.5-11.5T560-200v-400q0-17 11.5-28.5T600-640h240q17 0 28.5 11.5T880-600v400q0 17-11.5 28.5T840-160H600Zm40-120h160v-280H640v280Zm0 0h160-160Z"/></svg></div>
                <div class="sv-acts sva-acts">
                  <button type="button" class="btn btn-secondary" data-svaedit="${i}" aria-describedby="sva-t${i}"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg> Edit</button>
                  <a class="btn btn-primary" href="#/published" aria-describedby="sva-t${i}"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> View</a>
                </div>
              </article>`).join('') : ''}
          </div>
          ${rows.length > 3 ? `<div class="sva-more"><button type="button" class="btn btn-secondary" id="sva-more" aria-expanded="${ALL.more}" aria-controls="sva-grid">${ALL.more ? 'View Less' : 'View More'} ${svg(CARET, 20, ALL.more ? ' style="transform:rotate(180deg)"' : '')}</button></div>` : ''}
        </section>
        <section class="section sva-box sva-tpl" aria-labelledby="sva-tpl-t">
          <h2 class="section-title sva-tpl-title" id="sva-tpl-t">Start from a pre-configured template</h2>
          <div class="sva-grid sva-tgrid">
            ${TEMPLATES.map((t, i) => `
              <article class="card sva-tcard" aria-labelledby="sva-tt${i}">
                <div class="sva-img sva-timg" style="background:${TINTS[i % 3]}" aria-hidden="true"><svg aria-hidden="true" focusable="false" width="48" height="48" viewBox="0 -960 960 960" fill="currentColor"><path d="M80-160v-120h80v-440q0-33 23.5-56.5T240-800h600v80H240v440h240v120H80Zm520 0q-17 0-28.5-11.5T560-200v-400q0-17 11.5-28.5T600-640h240q17 0 28.5 11.5T880-600v400q0 17-11.5 28.5T840-160H600Zm40-120h160v-280H640v280Zm0 0h160-160Z"/></svg></div>
                <div class="sva-tbody"><h3 class="card-title" id="sva-tt${i}">${esc(t.name)}</h3>
                  <p class="sva-tdesc" id="sva-td${i}">${esc(t.desc)}</p></div>
                <div class="sv-acts sva-acts">
                  <a class="btn btn-secondary" href="#/services/template/${i}" data-tplview="${i}" aria-describedby="sva-tt${i}"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> View Template</a>
                  <button type="button" class="btn btn-primary" data-tpl="${i}" aria-describedby="sva-tt${i}">Use Template <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button>
                </div>
              </article>`).join('')}
          </div>
        </section>
      </div>
      ${popups()}
      <dialog class="modal um-alert sv-dlg" id="sva-del" aria-labelledby="sva-del-t" aria-describedby="sva-del-d">
        <div class="um-alert-head"><svg class="um-alert-ico" aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B91900" stroke-width="2.2"/><path d="M12 7v6" stroke="#B91900" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.4" fill="#B91900"/></svg><h2 class="um-alert-title" id="sva-del-t">Delete service?</h2></div>
        <p class="um-alert-desc" id="sva-del-d">The service and all its versions will be deleted. This action cannot be undone.</p>
        <div class="um-alert-actions"><button type="button" class="btn btn-secondary" data-close>Cancel</button><button type="button" class="btn btn-primary" id="sva-del-ok">Delete</button></div>
      </dialog>
      <dialog class="modal um-alert sva-choicew" id="sva-choice" aria-labelledby="sva-choice-t" aria-describedby="sva-choice-d">
        <button type="button" class="icon-btn modal-close" data-close aria-label="Close">${svg(I.x, 20)}</button>
        <div class="um-alert-head"><svg class="um-alert-ico" aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B91900" stroke-width="2.2"/><path d="M12 7v6" stroke="#B91900" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.4" fill="#B91900"/></svg><h2 class="um-alert-title" id="sva-choice-t">Draft in Progress</h2></div>
        <p class="um-alert-desc" id="sva-choice-d">You already have a draft for this service. You can continue working on it or start fresh from the live version.</p>
        <fieldset class="ntw-tiles"><legend class="sr-only">How do you want to continue editing?</legend>
            <label class="ntw-tile"><input type="radio" name="sva-choice" value="continue" checked>
              <span class="ntw-tile-ico" aria-hidden="true">${svg(I.draft, 24)}</span>
              <span class="ntw-tile-title">Continue Draft</span><span class="ntw-tile-text">Pick up where you left off. Your changes are saved.</span></label>
            <label class="ntw-tile"><input type="radio" name="sva-choice" value="fresh">
              <span class="ntw-tile-ico" aria-hidden="true">${svg(I.fresh, 24)}</span>
              <span class="ntw-tile-title">Start Again From Scratch</span><span class="ntw-tile-text">Discard the draft and start again from the published version.</span></label>
          </fieldset>
        <div class="ntw-foot"><button type="button" class="btn btn-secondary" data-close>Cancel</button><button type="button" class="btn btn-primary" id="sva-choice-ok">Continue</button></div>
      </dialog>
      <dialog class="modal" id="sva-dup" aria-labelledby="sva-dup-t" aria-describedby="sva-dup-d">
        <form id="sva-dup-form" novalidate>
          <div class="modal-body">
            <button type="button" class="icon-btn modal-close" data-close aria-label="Close">${svg(I.x, 20)}</button>
            <div class="modal-head"><h2 class="modal-title sva-dup-title" id="sva-dup-t">${MS('copy').replace(/width="18" height="18"/, 'width="28" height="28"')}Duplicate Service</h2><p class="modal-desc" id="sva-dup-d"></p></div>
            <div class="field"><label class="label" for="sva-dup-name">Service name <span class="req" aria-hidden="true">*</span></label>
              <input class="input" id="sva-dup-name" type="text" required aria-required="true" autocomplete="off" maxlength="60" aria-describedby="sva-dup-err">
              <p class="error" id="sva-dup-err" hidden><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg><span></span></p></div>
          </div>
          <div class="modal-foot">
            <button type="button" class="btn btn-secondary" data-close>Cancel</button>
            <button type="submit" class="btn btn-primary">Duplicate Service</button>
          </div>
        </form>
      </dialog>
      <dialog class="modal ntw sva-impw" id="sva-imp" aria-labelledby="sva-imp-t1">
        <div class="ntw-body">
          <button type="button" class="icon-btn ntw-close" data-close aria-label="Close">${svg(I.x, 20)}</button>
          <div class="ntw-bars-wrap"><span class="sr-only" id="sva-imp-step">Step 1 of 2</span><span class="ntw-bars" id="sva-imp-bars" aria-hidden="true"><span class="on"></span><span></span></span></div>
          <section id="sva-imp-p1">
            <div class="ntw-head ntw-head--step"><h2 class="ntw-title" id="sva-imp-t1">Name Your Service</h2>
            <p class="ntw-desc">Enter a name for the service you are importing.</p></div>
            <div class="ntw-fields"><div class="ntw-row sva-imp-row">
              <label class="ntw-label" for="sva-imp-name">Service name&nbsp;<span class="req" aria-hidden="true">*</span></label>
              <div class="ntw-control"><input class="input" id="sva-imp-name" type="text" required aria-required="true" autocomplete="off" maxlength="60" aria-describedby="sva-imp-name-err">
                <p class="error" id="sva-imp-name-err" hidden></p></div>
            </div></div>
          </section>
          <section id="sva-imp-p2" hidden>
            <div class="ntw-head ntw-head--step"><h2 class="ntw-title" id="sva-imp-t2">Upload Service File</h2>
            <p class="ntw-desc">Upload the service as a JSON file. It will be added to your draft services.</p></div>
            <div class="ntw-fields"><div class="ntw-box sva-up">
              <span class="pf-doc-title" id="sva-file-t">Service file <span class="req" aria-hidden="true">*</span></span>
              <div class="pf-drop" id="sva-drop">
                <span class="pf-drop-icon" aria-hidden="true"><svg aria-hidden="true" focusable="false" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 5 10h4v6h6v-6h4z"/><rect x="5" y="18.5" width="14" height="2" rx="1"/></svg></span>
                <span class="pf-drop-text">Drag and drop your file or <label class="pf-browse" for="sva-file">browse in my files</label></span>
                <span class="pf-drop-meta">Accepted: JSON</span>
                <input class="sr-only" type="file" id="sva-file" accept=".json,application/json" aria-labelledby="sva-file-t" aria-describedby="sva-file-err">
              </div>
              <div id="sva-file-row"></div>
              <p class="error" id="sva-file-err" hidden>Select a service file to import.</p>
            </div></div>
          </section>
        </div>
        <div class="ntw-foot">
          <button type="button" class="btn btn-secondary" id="sva-imp-prev">Cancel</button>
          <button type="button" class="btn btn-primary" id="sva-imp-ok">Next</button>
        </div>
      </dialog>`;
    if (focus) view.querySelector(focus === true ? '.page-title' : focus)?.focus();
  }
  const closeMenus = (except) => document.querySelectorAll('#view-services .sva-menu').forEach(m => { if (m === except) return; m.hidden = true; m.previousElementSibling.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('click', e => {
    const view = $('view-services'); if (!view || view.hidden || mode !== 'all' || !view.contains(e.target)) return;
    const t = e.target.closest('[data-svatab]'); if (t) { ALL.tab = t.dataset.svatab; ALL.more = false; return landingAll(`[data-svatab="${ALL.tab}"]`); }
    if (e.target.closest('#sva-more')) { ALL.more = !ALL.more; return landingAll('#sva-more'); }
    const k = e.target.closest('[data-kebab]');
    if (k) { const m = k.nextElementSibling, on = m.hidden; closeMenus(m); m.hidden = !on; k.setAttribute('aria-expanded', String(on)); if (on) m.querySelector('[role="menuitem"]').focus(); return; }
    const d = e.target.closest('[data-dup]');
    if (d) {
      const rows = ALL.tab === 'published' ? ALL.list : ALL.drafts, src = rows[+d.dataset.dup];
      closeMenus(); ALL.dupSrc = src;
      $('sva-dup-d').innerHTML = `Make a copy of <strong>${esc(src.name)}</strong> with all its modules and settings. Give the copy its own name.`;
      const n = $('sva-dup-name'); n.value = `Copy of ${src.name}`; n.removeAttribute('aria-invalid'); $('sva-dup-err').hidden = true;
      opener = d.closest('.sva-menu-wrap').querySelector('.sva-kebab'); $('sva-dup').showModal(); n.focus(); n.select();
      return;
    }
    const ex = e.target.closest('[data-exp]');
    if (ex) { const r = (ALL.tab === 'published' ? ALL.list : ALL.drafts)[+ex.dataset.exp]; closeMenus(); window.Studio?.toast?.(`${r.name} exported`); return; }
    const dl = e.target.closest('[data-del]');
    if (dl) { closeMenus(); ALL.delAt = +dl.dataset.del; const r = (ALL.tab === 'published' ? ALL.list : ALL.drafts)[ALL.delAt];
      $('sva-del-t').textContent = `Delete ${r.name}?`; $('sva-del-d').innerHTML = `Are you sure you want to delete <strong>${esc(r.name)}</strong>? The service and all its versions will be deleted. This action cannot be undone.`; open('sva-del', dl.closest('.sva-menu-wrap').querySelector('.sva-kebab')); return; }
    if (e.target.closest('#sva-del-ok')) { const rows = ALL.tab === 'published' ? ALL.list : ALL.drafts, r = rows.splice(ALL.delAt, 1)[0];
      $('sva-del').close(); landingAll('#sva-import'); window.Studio?.toast?.(`${r.name} deleted`); return; }
    const ed = e.target.closest('[data-svaedit]');
    if (ed && ALL.tab === 'drafts') { location.hash = '#/'; return; }   // a draft is already a separate version: open it, no popup
    if (ed) {
      const r = ALL.list[+ed.dataset.svaedit]; ALL.editRow = r;
      const draft = ALL.drafts.find(x => x.name === r.name);
      if (draft) {   // clicked Edit again: a draft of this service is already there
        editVer = draft.ver; opener = ed;
        $('sva-choice-d').innerHTML = `<strong>${esc(r.name)}</strong> already has a draft that hasn't been published yet. Choose how you want to continue.`;
        const dlg = $('sva-choice'); dlg.querySelector('input[value="continue"]').checked = true;
        dlg.showModal(); dlg.querySelector('input[value="continue"]').focus(); return;
      }
      editVer = 'V' + ((parseInt(String(r && r.ver).replace(/\D/g, ''), 10) || 1) + 1); open('sv-edit', ed); return;
    }
    if (e.target.closest('#sva-choice-ok')) {
      const how = $('sva-choice').querySelector('input[name="sva-choice"]:checked').value;
      $('sva-choice').close();
      if (how === 'continue') toDraft(false); else open('sv-fresh', ALL.editRow && [...view.querySelectorAll('[data-svaedit]')].find(b => ALL.list[+b.dataset.svaedit] === ALL.editRow));
      return;
    }
    if (e.target.closest('#sva-choice [data-close]')) { $('sva-choice').close(); return; }
    const tp = e.target.closest('[data-tpl]');
    if (tp) { window.Studio?.toast?.(`New service created from the ${TEMPLATES[+tp.dataset.tpl].name} template`); location.hash = '#/'; return; }   // Use Template
    if (e.target.closest('#sva-import')) {
      const n = $('sva-imp-name'), f = $('sva-file');
      n.value = ''; f.value = ''; $('sva-file-row').innerHTML = ''; $('sva-drop').hidden = false; [n, f].forEach(x => x.removeAttribute('aria-invalid')); $('sva-imp-name-err').hidden = $('sva-file-err').hidden = true;
      opener = e.target.closest('#sva-import'); impStep(1); $('sva-imp').showModal(); n.focus(); return;
    }
    if (e.target.closest('#sva-imp-prev')) { if (ALL.impStep === 2) { impStep(1); $('sva-imp-name').focus(); } else $('sva-imp').close(); return; }
    if (e.target.closest('#sva-imp-ok')) { impNext(); return; }
    if (!e.target.closest('.sva-menu-wrap')) closeMenus();
  });
  document.addEventListener('keydown', e => {
    if (mode !== 'all') return;
    if (e.key === 'Escape') { const open1 = document.querySelector('#view-services .sva-menu:not([hidden])'); if (open1) { e.preventDefault(); closeMenus(); open1.previousElementSibling.focus(); } }
  });
  // Duplicate Service popup: name (required, unique) + description
  const dupErr = msg => { const n = $('sva-dup-name'), er = $('sva-dup-err'); er.querySelector('span').textContent = msg; er.hidden = false; n.setAttribute('aria-invalid', 'true'); n.focus(); };
  document.addEventListener('submit', e => {
    if (e.target.id !== 'sva-dup-form') return;
    e.preventDefault();
    const name = $('sva-dup-name').value.trim(), src = ALL.dupSrc;
    if (!name) return dupErr('Enter a service name.');
    if ([...ALL.list, ...ALL.drafts].some(r => r.name.toLowerCase() === name.toLowerCase())) return dupErr('A service with this name already exists. Enter a different name.');
    ALL.list.unshift({ name, date: today(), ver: 'V1' }); ALL.tab = 'published';
    $('sva-dup').close(); landingAll('.sva-card .sva-kebab');
    window.Studio?.toast?.(`${src.name} duplicated as ${name}`); window.Studio?.announce?.(`${src.name} duplicated as ${name}.`);
  });
  document.addEventListener('input', e => { if (e.target.id === 'sva-dup-name') { e.target.removeAttribute('aria-invalid'); $('sva-dup-err').hidden = true; } });
  // Import Service wizard: step 1 = name the service, step 2 = upload the service file
  function impStep(n) {
    ALL.impStep = n;
    $('sva-imp-step').textContent = `Step ${n} of 2`;
    $('sva-imp-bars').querySelectorAll('span').forEach((x, i) => x.classList.toggle('on', i < n));
    $('sva-imp-p1').hidden = n !== 1; $('sva-imp-p2').hidden = n !== 2;
    $('sva-imp').setAttribute('aria-labelledby', `sva-imp-t${n}`);
    $('sva-imp-prev').textContent = n === 1 ? 'Cancel' : 'Back';
    $('sva-imp-ok').textContent = n === 1 ? 'Next' : 'Import Service';
    window.Studio?.announce?.(`Step ${n} of 2`);
  }
  function impNext() {
    if (ALL.impStep === 1) {
      const n = $('sva-imp-name'), name = n.value.trim(), er = $('sva-imp-name-err');
      const msg = !name ? 'Enter a service name.' : [...ALL.list, ...ALL.drafts].some(r => r.name.toLowerCase() === name.toLowerCase()) ? 'A service with this name already exists. Enter a different name.' : '';
      if (msg) { er.textContent = msg; er.hidden = false; n.setAttribute('aria-invalid', 'true'); n.focus(); return; }
      impStep(2); $('sva-file').focus(); return;
    }
    const f = $('sva-file');
    if (!f.files.length) { $('sva-file-err').hidden = false; f.setAttribute('aria-invalid', 'true'); f.focus(); return; }
    const name = $('sva-imp-name').value.trim(); ALL.drafts.unshift({ name, date: today(), ver: 'V1' }); ALL.tab = 'drafts';   // imported services start as drafts
    $('sva-imp').close(); landingAll('#sva-import'); window.Studio?.toast?.(`${name} imported successfully`);
  }
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'sva-imp-name') { e.preventDefault(); impNext(); } });
  // service names start with a capital letter (Import + Duplicate), as people type
  document.addEventListener('input', e => {
    const el = e.target; if (el.id !== 'sva-imp-name' && el.id !== 'sva-dup-name') return;
    const v = el.value, up = v.charAt(0).toUpperCase() + v.slice(1);
    if (up !== v) { const a = el.selectionStart, b = el.selectionEnd; el.value = up; el.setSelectionRange(a, b); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'sva-imp-name') { e.target.removeAttribute('aria-invalid'); $('sva-imp-name-err').hidden = true; } });
  const fileRowHTML = file => {
    const ext = (file.name.split('.').pop() || 'file').slice(0, 4).toLowerCase();
    return `<div class="pf-file">
      <span class="pf-file-icon" aria-hidden="true"><svg width="32" height="40" viewBox="0 0 32 40"><path d="M3 1h18l8 8v28a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" fill="#FCEDEA" stroke="#E7B7AE"/><path d="M21 1v8h8" fill="#F6D5CE" stroke="#E7B7AE"/><rect x="-1" y="22" width="26" height="11" rx="2" fill="#B91900"/><text x="12" y="30.5" text-anchor="middle" font-family="Roboto, sans-serif" font-size="7.5" font-weight="700" fill="#fff">.${esc(ext)}</text></svg></span>
      <span class="pf-file-name" title="${esc(file.name)}">${esc(file.name)}</span>
      <span class="pf-file-actions">
        <button type="button" class="btn btn-secondary" data-svareup><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 10l5-5 5 5M5 20h14"/></svg> Re-Upload</button>
        <button type="button" class="btn btn-secondary" data-svadl><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg> Download</button>
      </span>
      <button type="button" class="pf-file-x" data-svarm aria-label="Remove ${esc(file.name)}"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>`;
  };
  const showFile = () => { const f = $('sva-file'); let file = f.files[0];
    if (file && !/\.json$/i.test(file.name)) { f.value = ''; file = null; $('sva-file-row').innerHTML = ''; const er = $('sva-file-err'); er.textContent = 'Upload a JSON file.'; er.hidden = false; f.setAttribute('aria-invalid', 'true'); return; }
    $('sva-file-err').textContent = 'Select a service file to import.'; $('sva-file-row').innerHTML = file ? fileRowHTML(file) : ''; $('sva-drop').hidden = !!file; /* once a file is added, only its row shows */ if (file) { f.removeAttribute('aria-invalid'); $('sva-file-err').hidden = true; window.Studio?.announce?.(`${file.name} added.`); } };
  document.addEventListener('change', e => { if (e.target.id === 'sva-file') showFile(); });
  document.addEventListener('click', e => {
    if (!e.target.closest || !e.target.closest('#sva-imp')) return;
    if (e.target.closest('[data-svareup]')) $('sva-file').click();
    if (e.target.closest('[data-svarm]')) { const f = $('sva-file'), nm = f.files[0] && f.files[0].name; f.value = ''; $('sva-file-row').innerHTML = ''; $('sva-drop').hidden = false; window.Studio?.announce?.(`${nm || 'File'} removed.`); f.focus(); }
  });
  ['dragover', 'drop'].forEach(t => document.addEventListener(t, e => {
    const z = e.target.closest && e.target.closest('#sva-drop'); if (!z) return;
    e.preventDefault(); if (t === 'drop' && e.dataTransfer.files.length) { const dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); $('sva-file').files = dt.files; showFile(); }
  }));
  document.addEventListener('change', e => { if (e.target.id === 'sva-file' && e.target.files.length) { e.target.removeAttribute('aria-invalid'); $('sva-file-err').hidden = true; } });

  /* ---------- #/services/template/<n>: Template Overview (opened from View Template) ----------
     Name + description + modules + metric tiles · divider · What you can customise · divider
     · module configuration laid out like Published Service · Service Configuration · sticky Back / Use Template. */
  const TPL_META = [
    { modules: ['Application'], states: 6, roles: 4, notifications: 5, features: 'Checklist, Documents' },
    { modules: ['Application', 'Renewal'], states: 9, roles: 7, notifications: 2, features: 'Payments, Checklist' },
    { modules: ['Application', 'Amendment'], states: 7, roles: 5, notifications: 3, features: 'Payments, Documents' },
  ];
  let tovMod = 0, tovOpen = true;
  function templateView(n, focus) {
    const view = $('view-services'), t = TEMPLATES[n], meta = TPL_META[n];
    if (!t) { location.hash = '#/services/all'; return; }
    const all = (window.Studio && window.Studio.modules()) || [];
    const mods = meta.modules.map(nm => all.find(m => m.name === nm)).filter(Boolean);
    if (tovMod >= mods.length) tovMod = 0;
    const m = mods[tovMod];
    const P = window.StudioPublished;
    view.innerHTML = `
      <div class="subbar"><a class="btn btn-secondary" href="#/services/all">${svg(I.back)} <span>Back</span></a>
        <button type="button" class="btn btn-secondary">${svg(I.guides)} Tutorials and Guides</button></div>
      <div class="sv-body tov">
        <div class="tov-titlerow"><h1 class="page-title" id="tov-t" tabindex="-1">${esc(t.name)}</h1><span class="tag tag-info tov-tag">Template</span><span class="tag tag-warn tov-tag tov-cfg"><svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"/></svg>Fully configurable</span></div>

        <section class="section pb-urls" aria-labelledby="tov-det-t">
          <h2 class="section-title" id="tov-det-t">About the Template</h2>
          <p class="tov-desc">${esc(t.desc)}</p>
          <div class="tov-facts">
            ${[['Modules', meta.modules.join(', ')], ['Workflow states', meta.states], ['Configured roles', meta.roles], ['Notifications', meta.notifications], ['Additional features', meta.features]]
              .map(([k, v]) => `<div class="pb-url tov-fact"><div class="pb-url-txt"><p class="pb-url-k">${k}</p><p class="tov-fact-v">${esc(v)}</p></div></div>`).join('')}
          </div>
        </section>

        <section class="section" aria-labelledby="tov-mod-t">
          <div class="pb-sec-head pb-sec-head--desc"><h2 class="section-title" id="tov-mod-t">Service Modules</h2>
            <p class="section-desc">These are the modules that come with this template. Each module represents a different use case the service supports.</p></div>
          ${mods.length > 1 ? `<div class="module-toggle pb-modtabs" role="tablist" aria-label="Modules">${mods.map((x, i) => `
            <button type="button" class="module-tab" role="tab" data-tovmod="${i}" aria-selected="${i === tovMod}" aria-controls="tov-mod-panel" tabindex="${i === tovMod ? 0 : -1}">${esc(x.name)}</button>`).join('')}</div>` : ''}
          <div class="pb-mod-panel" id="tov-mod-panel" role="tabpanel">${m && P ? P.moduleBlock(m) : ''}</div>
        </section>

        <section class="section" aria-labelledby="tov-svc-t">
          <div class="section-head"><h2 class="section-title" id="tov-svc-t">Service Configuration</h2>
            <p class="section-desc">Settings that apply across the entire service</p></div>
          ${P ? P.serviceGrid() : ''}
        </section>
      </div>
      <footer class="form-foot tov-foot">
        <a class="btn btn-secondary" href="preview.html"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="12" r="3"/></svg> Preview</a>
        <button type="button" class="btn btn-primary" data-tpl="${n}">Use Template <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></button>
      </footer>`;
    const panel = $('tov-mod-panel'), ab = panel.querySelector('#pb-act-btn');
    if (ab) { ab.setAttribute('aria-expanded', String(tovOpen)); panel.querySelector('#pb-act-panel').hidden = !tovOpen; ab.querySelector('.acc-btn-text').textContent = tovOpen ? 'Hide details' : 'View details'; }
    if (focus) view.querySelector(focus === true ? '.page-title' : focus)?.focus();
  }
  document.addEventListener('click', e => {
    const view = $('view-services'); if (!view || view.hidden || !String(mode).startsWith('template/') || !view.contains(e.target)) return;
    const n = +mode.split('/')[1];
    const mt = e.target.closest('[data-tovmod]'); if (mt) { tovMod = +mt.dataset.tovmod; return templateView(n, `[data-tovmod="${tovMod}"]`); }
    if (e.target.closest('#pb-act-btn')) { tovOpen = !tovOpen; return templateView(n, '#pb-act-btn'); }
    const tp = e.target.closest('[data-tpl]');
    if (tp) { window.Studio?.toast?.(`New service created from the ${TEMPLATES[+tp.dataset.tpl].name} template`); location.hash = '#/'; }
  });
  document.addEventListener('keydown', e => {
    const list = e.target.closest && e.target.closest('#view-services .module-toggle'); if (!list) return;
    const tabs = [...list.querySelectorAll('[role="tab"]')], i = tabs.indexOf(e.target), k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (i < 0 || !k) return; e.preventDefault(); tabs[(i + k + tabs.length) % tabs.length].click();
  });

  window.StudioServices = {
    templateName: n => (TEMPLATES[n] || {}).name,
    landing(m, focus) { if (m !== mode) tab = 'published'; if (m !== mode) tovMod = 0; mode = m; if (m === 'all') return landingAll(focus); if (m.startsWith('template/')) return templateView(+m.split('/')[1], focus); landing(focus); },
    choice(focus) { choice(focus); },
  };
})();
