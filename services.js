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
    { name: SERVICE(), desc: 'Apply for, renew, and amend business licences online.', date: '12/11/2026', ver: 'V1', tint: '#F6EFE8', own: true },
    { name: 'Building Permit', desc: 'Apply for permission to build or change a building.', date: '28/10/2026', ver: 'V3', tint: '#E8F4EA' },
    { name: 'Water Connection', desc: 'Request a new water connection for a property.', date: '14/10/2026', ver: 'V2', tint: '#E9E7F5' },
    { name: 'Property Tax', desc: 'Assess, pay, and get receipts for property tax.', date: '02/10/2026', ver: 'V1', tint: '#F6EFE8' },
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
        <p class="sv-desc">Create service delivery applications to manage the end-to-end delivery of citizen services. Start from a template or build your own.</p>
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
        <div class="sv-note is-${kind}">${svg(kind === 'warn' ? I.warn : I.info, 20)}<div><p class="sv-note-t">${boxTitle}</p><p>${boxText}</p></div></div>
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
  const toDraft = fresh => {
    try { sessionStorage.setItem('studio-draft', 'V2'); } catch (e) {}
    window.Studio?.toast?.(fresh ? 'A new draft was made from the published version' : 'Editing the V2 draft');
    const first = (window.Studio && window.Studio.modules()[0]) || { id: 'application' };
    location.hash = '#/module/' + encodeURIComponent(first.id);   // lands on the module page, like the reference
  };

  document.addEventListener('click', e => {
    const view = $('view-services'); if (!view || view.hidden || !view.contains(e.target)) return;
    const t = e.target.closest('[data-svtab]'); if (t) { tab = t.dataset.svtab; landing(`[data-svtab="${tab}"]`); return; }
    const ed = e.target.closest('[data-edit]');
    if (ed) { if (mode === 'nodraft' && tab === 'published') open('sv-edit', ed); else location.hash = '#/edit-choice'; return; }
    const ch = e.target.closest('[data-choice]');
    if (ch) { if (ch.dataset.choice === 'continue') toDraft(false); else open('sv-fresh', ch); return; }
    const d = e.target.closest('dialog');
    if (d && e.target.closest('[data-close]')) { d.close(); return; }
    if (d && e.target.closest('[data-proceed]')) { d.close(); toDraft(d.id === 'sv-fresh'); return; }
    if (d && e.target === d) d.close();
  });
  document.addEventListener('close', e => { if (e.target.classList?.contains('sv-dlg') && opener && document.contains(opener)) opener.focus(); }, true);
  document.addEventListener('keydown', e => {
    const list = e.target.closest && e.target.closest('#view-services [role="tablist"]'); if (!list) return;
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!k) return;
    const tabs = [...list.querySelectorAll('[role="tab"]')], i = tabs.indexOf(e.target);
    e.preventDefault(); tabs[(i + k + tabs.length) % tabs.length].click();
  });

  window.StudioServices = {
    landing(m, focus) { if (m !== mode) tab = 'published'; mode = m; landing(focus); },
    choice(focus) { choice(focus); },
  };
})();
