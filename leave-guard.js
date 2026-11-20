/* "Save changes?" popup when someone leaves a canvas (form builder, document editor) with unsaved changes.
   A screen registers a guard: StudioLeave.set({ what: 'form' | 'document', isDirty(), save() → false to stay, discard() }).
   Caught: hash moves (studio.html runs window.StudioLeaveGuard before its router), links to other pages, and the
   screen's own Back (StudioLeave.ask(go)). Reload / close tab gets the browser's own prompt.
   Copy is kept short and literal so it translates well: no idioms, no contractions, the thing is always named. */
(() => {
  const COPY = {
    title: 'Save changes?',
    desc: what => `The changes to this ${what} are not saved. If you leave without saving, the changes will be lost.`,
    discard: 'Discard Changes',
    save: 'Save Changes',
    close: 'Close',
  };
  const guards = [];
  let pending = null, pendingGuard = null, leaving = false, allowTo = null, dlg = null;   // allowTo: the hash they just confirmed
  const current = () => guards.find(g => g.active()) || null;
  const dirty = () => { const g = current(); return !!(g && g.isDirty()); };

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'modal pfc lv-dlg'; dlg.id = 'leave-dialog';
    dlg.setAttribute('aria-labelledby', 'lv-title'); dlg.setAttribute('aria-describedby', 'lv-desc');
    dlg.innerHTML = `<button type="button" class="icon-btn pfc-close" data-lv="close" aria-label="${COPY.close}"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48" focusable="false"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="lv-title">${COPY.title}</h2>
      <p class="pfc-desc" id="lv-desc"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-lv="discard">${COPY.discard}</button>
        <button type="button" class="btn btn-primary" data-lv="save">${COPY.save}</button>
      </div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener('click', e => {
      const b = e.target.closest('[data-lv]'); if (!b) return;
      const act = b.dataset.lv;
      if (act === 'close') return dlg.close();
      const go = pending, g = pendingGuard; pending = null;
      if (act === 'save' && g.save() === false) { dlg.close(); return; }   // could not save (e.g. a required part is missing): stay
      if (act === 'discard') g.discard?.();
      leaving = true; dlg.close();
      if (go) go();
      if (allowTo === null) setTimeout(() => { leaving = false; });   // stayed on this page (e.g. the screen's own Back)
    });
    dlg.addEventListener('close', () => { if (pending) { pending = null; } });
  }
  function ask(go) {
    if (!dirty()) { go(); return; }
    if (!dlg) build();
    leaving = false; pending = go; pendingGuard = current();
    dlg.querySelector('#lv-desc').textContent = COPY.desc(pendingGuard.what);
    dlg.showModal(); dlg.querySelector('[data-lv="save"]').focus();
  }

  window.StudioLeave = { set: g => { guards.push(g); }, ask, isDirty: dirty };

  // hash moves: put the hash back, ask, then go (the screen stays as it is behind the popup)
  window.StudioLeaveGuard = e => {
    if (allowTo !== null && location.hash === allowTo) { allowTo = null; return false; }   // the move they just confirmed
    if (!dirty()) return false;
    const from = '#' + (e.oldURL.split('#')[1] || ''), to = location.hash;
    if (from === to) return false;
    history.replaceState(null, '', from);
    ask(() => { allowTo = to; location.hash = to; });
    return true;
  };
  // links to other pages (Studio Index, Home …)
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a || !dirty()) return;
    const href = a.getAttribute('href'); if (!href || href.startsWith('#') || a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault(); e.stopPropagation();
    ask(() => { location.href = a.href; });
  }, true);
  window.addEventListener('beforeunload', e => { if (!leaving && dirty()) { e.preventDefault(); e.returnValue = ''; } });
})();
