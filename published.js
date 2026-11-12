/* Published Service (#/published): the service name, the app URLs, Manage User / Manage Translation,
   then the service modules (module tabs → activation state → configuration cards) and the service-wide configuration.
   Uses the Studio's own components (section, card, module tabs, state boxes, buttons, tags). */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (d, size = 20, extra = '') => `<svg aria-hidden="true" focusable="false" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</svg>`;
  const I = {
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.5 1.7-2 3-2s2.4.5 3 2M14 10h4M14 13h3"/>',
    lang: '<path d="M4 5h9M8.5 3v2M6 5c.6 3 2.6 5.5 5.5 7M11 5c-.8 3.5-3 6.3-6 8"/><path d="M12 21l4.5-10L21 21M13.6 17.5h5.8"/>',
    alert: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><path d="M12 7.5v5.5M12 16.2v.3" stroke="#fff" stroke-width="2.4"/>',
    plus: '<rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" stroke="none"/><path d="M12 8v8M8 12h8" stroke="#fff" stroke-width="2.4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16" stroke-width="2.4"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16" stroke-width="2.4"/>',
    bolt: '<circle cx="12" cy="12" r="10"/><path d="M13 6l-5 7h4l-1 5 5-7h-4z"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    user: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.3-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.2 2.5 3.6 5.2"/>',
    flow: '<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 7.5V20M6 14c0-3 2-5 9.5-5"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
    bell: '<path d="M18 8.5a6 6 0 0 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5"/><path d="M10.2 20.5a2 2 0 0 0 3.6 0"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
    page: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h4M7 14h4M14 10h3M14 14h3"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  };
  // Same cards and wording as the module page (CONFIG_CARDS in studio.html)
  const MODULE_CONFIG = [
    { icon: 'doc', title: 'Form', desc: 'Edit form fields, configure logic, and manage how information is captured for this service.', sub: '/form' },
    { icon: 'user', title: 'Roles', desc: 'Manage roles and permissions, and control who can create, edit, or view information across your service.', sub: '/roles' },
    { icon: 'flow', title: 'Process Flow', desc: 'Design and configure process flows to define how applications move through different states and users.', sub: '/process-flow' },
    { icon: 'list', title: 'Checklists', desc: 'Create and configure checklists to capture required information and validations at specific stages of process flow.', sub: '/checklists' },
    { icon: 'bell', title: 'Notifications', desc: 'Configure notifications to keep users informed at key stages of the service process flow.', sub: '/notifications' },
    { icon: 'card', title: 'Payment', desc: 'Configure payment setups, map them to fees, define payment methods, and set when fees are collected.', sub: '/payments' },
    { icon: 'doc', title: 'Documents', desc: 'Configure application receipts, certificates, notices, and other PDF documents generated during the service lifecycle.', sub: '/documents' },
  ];
  const SERVICE_CONFIG = [
    { icon: 'page', title: 'Service Landing Page', desc: 'Configure the content applicants see and information they need before starting an application.', href: '#/landing' },
    { icon: 'grid', title: 'Dashboard', desc: 'Configure analytics and reporting to monitor service activity, performance, and key information.', href: '#/dashboard' },
  ];
  const SLUG = 'studio-prototype';
  const URLS = [['Citizen Portal', `https://digit.gov/${SLUG}/apply`], ['Employee Portal', `https://digit.gov/${SLUG}/employee`]];

  // Employee Portal link is still being generated: a countdown (5 minutes from the first visit in this tab)
  const GEN_I = 1, GEN_MS = 5 * 60 * 1000;
  const genStart = () => { try { let t = +sessionStorage.getItem('pb-gen-start'); if (!t) { t = Date.now(); sessionStorage.setItem('pb-gen-start', t); } return t; } catch (e) { return Date.now(); } };
  const genLeft = () => Math.max(0, GEN_MS - (Date.now() - genStart()));
  const genPct = () => Math.round(100 * (1 - genLeft() / GEN_MS));
  const fmtLeft = ms => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  setInterval(() => {
    const view = $('view-published'), t = $('pb-gen-t'); if (!view || view.hidden || !t) return;
    if (genLeft() <= 0) { render(); window.Studio?.announce?.('Employee Portal link is ready.'); return; }
    t.textContent = fmtLeft(genLeft());
  }, 1000);
  let modId = null, tab = 'users', open = true;   // Manage Translation is disabled for now
  const modules = () => (window.Studio && window.Studio.modules()) || [];
  // active users from User Management, counted per role
  const usersList = () => { if (window.StudioUsers && window.StudioUsers.list) return window.StudioUsers.list(); try { return JSON.parse(localStorage.getItem('studio-prototype.users.v2')) || []; } catch (e) { return []; } };
  function byRole(list) {
    const m = new Map();
    list.filter(u => u.active !== false).forEach(u => (u.roles || []).forEach(r => m.set(r, (m.get(r) || 0) + 1)));
    return [...m].sort((a, b) => b[1] - a[1]);
  }

  const cfgCard = (c, href) => `
    <article class="card pb-cfg">
      <div class="card-head">
        <div class="card-title-row"><span class="card-icon">${ic(I[c.icon])}</span><h3 class="card-title">${esc(c.title)}</h3></div>
        <p class="card-desc">${esc(c.desc)}</p>
      </div>
      <p class="pb-status">${ic(I.check, 16)} Configured</p>
      <a class="btn btn-secondary pb-edit" href="${href}">${ic(I.pen, 16)} Edit Configuration<span class="sr-only"> for ${esc(c.title)}</span></a>
    </article>`;

  // Same markup and classes as the module page (activation accordion + config cards with their illustrations)
  function moduleBlock(m) {
    const p = m.primaryStates || [], s = m.secondaryStates || [];
    const chips = (list, cls, none) => list.length ? list.map(n => `<span class="tag ${cls}">${esc(n)}</span>`).join('') : `<p class="state-empty">${none}</p>`;
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    const edit = `<a class="btn-link" href="#/module/${encodeURIComponent(m.id)}"><span class="bl-ico">${ic(I.pen, 16)}</span> <span class="bl-text">Edit activation state</span></a>`;
    const act = m.primary ? '' : `
      <section class="activation pb-activation">
        <div class="acc-header">
          <div class="acc-top">
            <span class="acc-icon">${ic(I.bolt)}</span>
            <h3 class="card-title acc-title" id="pb-act-t">Activation state</h3>
            <button type="button" class="btn btn-secondary acc-btn" id="pb-act-btn" aria-expanded="${open}" aria-controls="pb-act-panel">
              <span class="acc-btn-text">${open ? 'Hide details' : 'View details'}</span><span class="sr-only"> for activation state</span>${ic(I.chev, 16, ' stroke-width="2.5"')}</button>
          </div>
          <p class="card-desc acc-desc">The state(s) that determine when this module becomes active and its process flow can begin.</p>
          <div class="tags acc-summary"><span class="tag tag-info">${plural(p.length, 'Primary activation state')}</span><span class="tag tag-warn">${plural(s.length, 'Secondary activation state')}</span></div>
        </div>
        <div class="acc-panel" id="pb-act-panel" role="region" aria-labelledby="pb-act-t" ${open ? '' : 'hidden'}>
          <div class="state-box"><div class="state-box-head"><h4 class="state-box-title">Primary activation state</h4></div>
            <div class="tags">${chips(p, 'tag-info', 'No primary activation states added.')}</div></div>
          <div class="state-box"><div class="state-box-head"><h4 class="state-box-title">Secondary activation state</h4></div>
            <div class="tags">${chips(s, 'tag-warn', 'No secondary activation states added.')}</div></div>
        </div>
      </section>`;
    // the module page's own cards (icons, illustrations, buttons), pointed at this module
    const tmp = document.createElement('div'); tmp.innerHTML = ($('config-grid') || {}).innerHTML || '';
    tmp.querySelectorAll('a[data-href]').forEach(a => { a.href = a.dataset.href + encodeURIComponent(m.id) + (a.dataset.sub || '/process-flow'); });
    tmp.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
    tmp.querySelectorAll('.card-foot').forEach(f => { const a = f.querySelector('a[href]'); f.innerHTML = viewBtn(f.closest('.card'), a ? a.getAttribute('href') : '#'); });   // view only
    return `${act}<h3 class="sr-only">${esc(m.name)} configuration</h3><div class="config-grid">${tmp.innerHTML}</div>`;
  }
  // 32px "View …" button named after the card (View Form, View Checklists …)
  const VIEW_NAME = { 'Service Landing Page': 'Landing Page' };
  function viewBtn(card, href) {
    const t = (card.querySelector('.card-title') || {}).textContent || '';
    return `<button type="button" class="btn btn-secondary pb-view">${ic('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 16)} View ${esc(VIEW_NAME[t] || t)}</button>`;   // goes nowhere for now
  }
  // the service page's own Service Configuration cards
  function serviceGrid() {
    const g = document.querySelector('#view-service .grid-config'); if (!g) return '';
    const c = g.cloneNode(true); c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id')); c.querySelectorAll('.card-foot').forEach(f => { const a = f.querySelector('a[href]'); f.innerHTML = viewBtn(f.closest('.card'), a ? a.getAttribute('href') : '#'); });   // view only
    return c.outerHTML;
  }

  function render(focus) {
    const view = $('view-published'), ms = modules();
    if (!modId || !ms.some(m => m.id === modId)) modId = ms[0] && ms[0].id;
    // for now the service starts with no users: the sample people (u1–u12) are left out, so only users added here count
    const SHOW_EMPTY = true;
    const mine = SHOW_EMPTY ? usersList().filter(u => !/^u\d{1,2}$/.test(u.id)) : usersList();
    const m = ms.find(x => x.id === modId), roles = byRole(mine), n = mine.length;
    const title = ((document.querySelector('#view-service .page-title') || {}).firstChild || {}).textContent?.trim() || 'Studio Prototype';
    view.innerHTML = `
      <h1 class="page-title" tabindex="-1">${esc(title)}</h1>

      <section class="section pb-urls" aria-labelledby="pb-url-t">
        <h2 class="pb-h"><span class="card-icon">${ic(I.link)}</span><span id="pb-url-t">Service App URLs</span></h2>
        <div class="pb-url-row">${URLS.map(([k, u], i) => i === GEN_I && genLeft() > 0 ? `
          <div class="pb-url is-gen">
            <div class="pb-url-txt"><p class="pb-url-k" id="pb-u${i}">${k}</p>
              <p class="pb-gen"><span class="pb-gen-u">${esc(u)}</span></p></div>
            <span class="pb-gen-tag">Generating in <span id="pb-gen-t">${fmtLeft(genLeft())}</span></span>
          </div>` : `
          <div class="pb-url">
            <div class="pb-url-txt"><p class="pb-url-k" id="pb-u${i}">${k}</p><a class="pb-url-a" href="#" aria-describedby="pb-u${i}">${esc(u)}</a></div>
            <button type="button" class="pb-icon-btn" data-copy="${esc(u)}" aria-label="Copy ${k} link">${ic(I.copy, 18)}</button>
            <a class="btn btn-primary pb-open" href="#" aria-label="Open ${k}">${ic(I.open, 14)} Open</a>
          </div>`).join('')}</div>
      </section>

      <section class="section pb-tabs-card" aria-label="Users and translation">
        <div class="pb-tabs" role="tablist" aria-label="Manage">
          <button type="button" role="tab" class="pb-tab" id="pb-tab-users" aria-selected="${tab === 'users'}" aria-controls="pb-panel" tabindex="${tab === 'users' ? 0 : -1}" data-tab="users">Manage User</button>
          <button type="button" role="tab" class="pb-tab" id="pb-tab-tr" aria-selected="false" aria-disabled="true" tabindex="-1" title="Not available yet">Manage Translation</button>
        </div>
        <div class="pb-panel" id="pb-panel" role="tabpanel" aria-labelledby="${tab === 'users' ? 'pb-tab-users' : 'pb-tab-tr'}">
          ${tab === 'users' ? `
            <h2 class="pb-h"><span class="card-icon pb-ic-lg">${ic(I.idcard, 24)}</span>Manage User</h2>
            <p class="card-desc">Add the people who will use this service and give them roles to decide what each person can do.</p>
            ${n ? `<ul class="pb-ucount" aria-label="Users by role">${roles.map(([r, c]) => `<li><b>${c} ${c === 1 ? 'User' : 'Users'}</b><span>${esc(r)}</span></li>`).join('')}</ul>
            <div class="pb-foot"><a class="btn btn-secondary" href="#/users">${ic(I.idcard, 16)} Manage Users</a><a class="btn btn-primary" href="#/users/new">${ic('<path d="M12 5v14M5 12h14" stroke-width="2.4"/>', 16)} Add User</a></div>`
            : `<p class="pb-note">${ic(I.alert, 18)} Users yet to be added</p>
            <div class="pb-foot is-empty"><a class="btn btn-primary" href="#/users/new">${ic('<path d="M12 5v14M5 12h14" stroke-width="2.4"/>', 16)} Add User</a></div>`}`
          : `
            <h2 class="pb-h"><span class="card-icon">${ic(I.lang)}</span>Manage Translation</h2>
            <p class="card-desc">Add translations for the text in your service so people can use it in their own language. Download the template, add the translations, and upload it back.</p>
            <p class="pb-note">${ic(I.alert, 18)} No translations have been added</p>
            <div class="pb-foot"><button type="button" class="btn btn-secondary">${ic(I.download, 16)} Download Template</button><button type="button" class="btn btn-primary">${ic(I.upload, 16)} Upload Translations</button></div>`}
        </div>
      </section>

      <section class="section" aria-labelledby="pb-mod-t">
        <div class="pb-sec-head"><h2 class="section-title" id="pb-mod-t">Service modules</h2></div>
        <div class="module-toggle pb-modtabs" role="tablist" aria-label="Modules">${ms.map(x => `
          <button type="button" class="module-tab" role="tab" id="pb-mt-${x.id}" data-mod="${x.id}" aria-selected="${x.id === modId}" aria-controls="pb-mod-panel" tabindex="${x.id === modId ? 0 : -1}">${esc(x.name)}</button>`).join('')}</div>
        <div class="pb-mod-panel" id="pb-mod-panel" role="tabpanel" aria-labelledby="pb-mt-${modId}">${m ? moduleBlock(m) : ''}</div>
      </section>

      <section class="section" aria-labelledby="pb-svc-t">
        <div class="section-head"><h2 class="section-title" id="pb-svc-t">Service Configuration</h2>
          <p class="section-desc">Configure settings that apply across the entire service</p></div>
        ${serviceGrid()}
      </section>`;
    if (focus === 'title') view.querySelector('.page-title').focus();
    else if (focus) view.querySelector(focus)?.focus();
  }

  document.addEventListener('click', e => {
    const view = $('view-published'); if (!view || view.hidden || !view.contains(e.target)) return;
    const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; render(`[data-tab="${tab}"]`); return; }
    const mt = e.target.closest('[data-mod]'); if (mt) { modId = mt.dataset.mod; render(`[data-mod="${modId}"]`); return; }
    if (e.target.closest('#pb-act-btn')) { open = !open; render('#pb-act-btn'); return; }
    const c = e.target.closest('[data-copy]');
    if (c) { try { navigator.clipboard.writeText(c.dataset.copy); } catch (er) {} window.Studio?.toast?.('Link copied'); window.Studio?.announce?.('Link copied.'); return; }
    if (e.target.closest('.pb-url-a, .pb-open')) e.preventDefault();   // sample links
    if (e.target.closest('a[href="#/users/new"]')) { try { sessionStorage.setItem('studio-users-return', '#/published'); } catch (er) {} }   // come back here after adding
  });
  // Tabs: arrow keys move between them (WAI-ARIA tabs)
  document.addEventListener('keydown', e => {
    const list = e.target.closest && e.target.closest('#view-published [role="tablist"]'); if (!list) return;
    const tabs = [...list.querySelectorAll('[role="tab"]')]; let i = tabs.indexOf(e.target);
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (i < 0 || !k) return;
    e.preventDefault(); tabs[(i + k + tabs.length) % tabs.length].click();
  });

  window.StudioPublished = { render: started => render(started ? 'title' : null) };
})();
