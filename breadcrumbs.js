/* DIGIT Breadcrumbs (design.digit.org/components/breadcrumbs) on the module "manage" screens:
   Payment, Checklists, Notifications, Roles, Documents (+ the Documents create steps).
   Not on screens with a left panel (form builder, process flow, dashboard designer, document editor) or the landing page designers.
   Screens with a breadcrumb have no top-left Back; screens without one keep it.
   Home / <Service> / <Module> / [<screen they came from>] / <Current> — Title Case, matching the screen titles. */
(() => {
  const TITLES = ['py-title', 'cl-title', 'nt-title', 'roles-title', 'dc-title'];
  const DOC_STEPS = ['dc-ch-title', 'dc-dt-title', 'dc-ar-title'];   // … / Documents / <step>
  const KEY = 'studio-crumb-from';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  const titleCase = t => t.trim().split(/\s+/).map((w, i) => (i && SMALL.has(w.toLowerCase())) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const service = () => ((document.querySelector('#view-service .page-title') || {}).firstChild || {}).textContent?.trim() || 'Service';
  const modName = id => (((window.Studio && window.Studio.modules()) || []).find(x => x.id === id) || {}).name || id;
  const MANAGE = /^#\/module\/([^/]+)\/(payments|checklists|notifications|roles|documents)$/;
  // where they came from → its crumb (label, link); the module dashboard itself is already in the trail
  const SUB = { 'process-flow': 'Process Flow', form: 'Form', roles: 'Roles', notifications: 'Notifications', checklists: 'Checklists', payments: 'Payment', documents: 'Documents' };
  function fromCrumb(hash, id) {
    const m = hash.match(/^#\/module\/([^/]+)\/([a-z-]+)$/);
    if (m && SUB[m[2]]) return [SUB[m[2]], hash, decodeURIComponent(m[1]) === id ? null : modName(decodeURIComponent(m[1]))];
    const top = { '#/published': 'Published Service', '#/landing': 'Service Landing Page', '#/dashboard': 'Dashboard', '#/citizen-landing': 'Citizen Landing' }[hash];
    return top ? [top, hash] : null;
  }
  // remember the screen they came from (survives a reload of the same page)
  window.addEventListener('hashchange', e => {
    const from = '#' + (e.oldURL.split('#')[1] || ''), to = location.hash, tm = to.match(MANAGE);
    if (!tm) return;
    const fm = from.match(/^#\/module\/([^/]+)/);
    if (from === to) return;
    // from the module dashboard or another manage screen (Roles → Payment …): the usual trail
    if ((fm && from === '#/module/' + fm[1]) || MANAGE.test(from)) { try { sessionStorage.removeItem(KEY); } catch (er) {} return; }
    try { sessionStorage.setItem(KEY, JSON.stringify({ to, from })); } catch (er) {}
  });
  function crumbsFor(title) {
    const m = location.hash.match(/^#\/module\/([^/]+)\//); if (!m) return null;
    const id = decodeURIComponent(m[1]);
    // screen names, not the service / module names
    const items = [['Home', '#/services/all'], ['Service Dashboard', '#/'], ['Module Dashboard', '#/module/' + encodeURIComponent(id)]];
    let saved = null; try { saved = JSON.parse(sessionStorage.getItem(KEY)); } catch (er) {}
    // opened view-only from a Template Overview: Home / <Template> / <Module> / <Current>
    const tpl = (saved && saved.from || '').match(/^#\/services\/template\/(\d+)$/);
    if (saved && saved.to === location.hash && tpl) {
      items[1] = ['Template Overview', saved.from];
    } else if (saved && saved.to === location.hash) {
      const c = fromCrumb(saved.from, id);
      // a module screen goes after the module; a service-level page (Published Service …) before it
      if (c && c[0] !== titleCase(title.textContent)) { if (/^#\/module\//.test(c[1])) items.push([c[0], c[1]]); else items.splice(2, 0, [c[0], c[1]]); }
    }
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
  // "Documents" from a create step: same URL, so re-open the list directly
  document.addEventListener('click', e => {
    const a = e.target.closest('.digit-crumbs [data-crumb="docs"]'); if (!a || !window.StudioDocuments) return;
    e.preventDefault();
    const id = decodeURIComponent((location.hash.match(/^#\/module\/([^/]+)\//) || [])[1] || '');
    const mod = ((window.Studio && window.Studio.modules()) || []).find(x => x.id === id);
    if (mod) window.StudioDocuments.render(mod, true);
  });
  // view only: rows stay visible but nothing can be dragged around
  document.addEventListener('dragstart', e => { if (document.body.classList.contains('view-mode')) { e.preventDefault(); e.stopPropagation(); } }, true);
  place();
})();
