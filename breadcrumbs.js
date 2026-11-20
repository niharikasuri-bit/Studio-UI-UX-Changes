/* DIGIT Breadcrumbs (design.digit.org/components/breadcrumbs) — only on screens with more than one entry point
   (module dashboard AND process flow): Payment, Checklists, Notifications, Roles, Documents (+ the Documents create steps).
   Not on screens with a left panel (form builder, process flow, dashboard designer, document editor) or the landing page designers.
   Screens with a breadcrumb have no top-left Back; screens without one keep it.
   Trail = Home / Service Dashboard / Module Dashboard / <Current>. Opened from the module's process flow, the trail
   includes it: … / Module Dashboard / Process Flow / <Current>. No extra "Back to …" link. */
(() => {
  const TITLES = ['py-title', 'cl-title', 'nt-title', 'roles-title', 'dc-title'];
  const DOC_STEPS = ['dc-ch-title', 'dc-dt-title', 'dc-ar-title'];   // … / Documents / <step>
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  const titleCase = t => t.trim().split(/\s+/).map((w, i) => (i && SMALL.has(w.toLowerCase())) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  // opened from the module's process flow → remember it (survives a reload of the same page)
  const KEY = 'studio-crumb-from';
  const MANAGE = /^#\/module\/([^/]+)\/(payments|checklists|notifications|roles|documents)$/;
  window.addEventListener('hashchange', e => {
    const from = '#' + (e.oldURL.split('#')[1] || ''), to = location.hash, tm = to.match(MANAGE);
    if (!tm || from === to) return;
    try {
      if (from === '#/module/' + tm[1] + '/process-flow') sessionStorage.setItem(KEY, JSON.stringify({ to }));
      else sessionStorage.removeItem(KEY);
    } catch (er) {}
  });
  const fromFlow = () => { try { const s = JSON.parse(sessionStorage.getItem(KEY)); return !!s && s.to === location.hash; } catch (er) { return false; } };
  function crumbsFor(title) {
    const m = location.hash.match(/^#\/module\/([^/]+)\//); if (!m) return null;
    const id = decodeURIComponent(m[1]);
    // screen names, not the service / module names
    const items = [['Home', '#/services/all'], ['Service Dashboard', '#/'], ['Module Dashboard', '#/module/' + encodeURIComponent(id)]];
    if (fromFlow()) items.push(['Process Flow', '#/module/' + encodeURIComponent(id) + '/process-flow']);
    if (DOC_STEPS.includes(title.id)) items.push(['Documents', '#/module/' + encodeURIComponent(id) + '/documents', 'docs']);
    const nav = document.createElement('nav');
    nav.className = 'digit-crumbs'; nav.setAttribute('aria-label', 'Breadcrumb');
    nav.innerHTML = `<ol>${items.map(([t, h, k]) => `<li><a href="${h}"${k ? ` data-crumb="${k}"` : ''}>${esc(titleCase(t))}</a></li>`).join('')}<li><span aria-current="page">${esc(titleCase(title.textContent))}</span></li></ol>`;
    return nav;
  }
  // View only (from Published Service or a template): the screen as it is — no breadcrumb; Back in the blue header and in the floating card
  const vmFrom = () => { try { return document.body.classList.contains('view-mode') ? (sessionStorage.getItem('studio-view-mode') || '') : ''; } catch (e) { return ''; } };
  const pubView = () => !!vmFrom();
  function place() {
    if (pubView()) {
      document.querySelectorAll('.digit-crumbs').forEach(n => n.remove());
      // top-left Back in the blue header (same place as other screens), named after where they came from
      const tp = vmFrom().match(/^tpl:(\d+)$/);
      document.querySelectorAll('#view-form, #view-roles, #view-notifications, #view-checklists, #view-payments, #view-documents, #view-landing, #view-dashboard, #view-citizen').forEach(v => {
        if (v.hidden) return;
        const bar = v.querySelector('.subbar'); if (!bar || bar.querySelector('.vm-top-back')) return;
        const a = document.createElement('a'); a.className = 'btn btn-secondary vm-top-back'; a.href = tp ? '#/services/template/' + tp[1] : '#/published';
        a.innerHTML = '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg> ' + (tp ? 'Back to Template Overview' : 'Back to Published Service');
        bar.prepend(a);
      });
      return;
    }
    document.querySelectorAll('.vm-top-back').forEach(n => n.remove());
    TITLES.concat(DOC_STEPS).forEach(id => {
      const t = document.getElementById(id); if (!t || t.closest('[hidden]')) return;
      const head = t.closest('.roles-head') || t;
      const prev = head.previousElementSibling, fresh = crumbsFor(t);
      if (prev && prev.classList.contains('digit-crumbs')) { if (fresh && prev.innerHTML !== fresh.innerHTML) prev.innerHTML = fresh.innerHTML; }
      else if (fresh) head.parentNode.insertBefore(fresh, head);
      // a screen with a breadcrumb has no top-left Back in the blue header
      const back = t.closest('[id^="view-"]')?.querySelector('.subbar > a.btn-secondary:first-child, .subbar > button.btn-secondary:first-child:not(:last-child)');
      if (back && !back.hidden) back.hidden = true;
    });
  }
  new MutationObserver(() => place()).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(place));
  // Breadcrumb clicks just go: the only "Save changes?" popup is on the document canvas (leave-guard.js)
  function go(a) {
    if (a.dataset.crumb === 'docs' && window.StudioDocuments) {   // same URL: re-open the list directly
      const id = decodeURIComponent((location.hash.match(/^#\/module\/([^/]+)\//) || [])[1] || '');
      const mod = ((window.Studio && window.Studio.modules()) || []).find(x => x.id === id);
      if (mod) window.StudioDocuments.render(mod, true);
    } else location.hash = a.getAttribute('href');
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('.digit-crumbs a'); if (!a) return;
    if (a.dataset.crumb === 'docs') { e.preventDefault(); go(a); }
  });
  // view only: rows stay visible but nothing can be dragged around
  document.addEventListener('dragstart', e => { if (document.body.classList.contains('view-mode')) { e.preventDefault(); e.stopPropagation(); } }, true);
  // view only dashboard: arrows still move between visualisations, but nothing can be moved, resized, copied or deleted
  document.addEventListener('keydown', e => {
    if (!document.body.classList.contains('view-mode') || !e.target.closest || !e.target.closest('#view-dashboard')) return;
    if (e.key === 'Delete' || e.key === 'Backspace' || ((e.ctrlKey || e.metaKey) && /^(Arrow|d$|z$|y$|s$)/i.test(e.key))) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  place();
})();
