/* ==========================================================
   Roles (Manage Roles) — Studio Prototype
   Route: #/module/<id>/roles. Roles belong to the service, so every module shares one list.
   Citizen exists by default. "Create Role" = the process-flow designer's popup (same copy and rules).
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.roles.v1';
  const ACCESS = [
    { v: 'VIEWER', t: 'Viewer', d: 'Can view everything in the service. Cannot edit anything or add anything new.' },
    { v: 'EDITOR', t: 'Editor', d: 'Can edit anything that was already created in the service. Cannot add anything new.' },
    { v: 'CREATOR', t: 'Creator', d: 'Can add new things to the service, and view and edit everything in the service. Has full access.' },
  ];
  let roles = [{ code: 'CITIZEN', name: 'Citizen', fixed: true, desc: 'Access citizen services through portal', access: ['VIEWER'] }];
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(saved) && saved.length) roles = saved; } catch (e) {}
  // Citizen starts as View only; its access can be changed later
  roles.forEach(r => { if (r.code === 'CITIZEN') { r.desc = r.desc || 'Access citizen services through portal'; if (!r.access || !r.access.length) r.access = ['VIEWER']; } });
  const TAG = { CREATOR: ['Create', 'rt-create'], EDITOR: ['Edit', 'rt-edit'], VIEWER: ['View', 'rt-view'] };
  const TINTS = ['#FAF5F0', '#EEF5F7', '#F3F4FC', '#EFF7F0'];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(roles)); } catch (e) {} };
  const toCode = s => s.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
  S.roles = () => roles;

  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plus: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    left: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    user: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
    trash: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    plusW: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    userL: '<svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
    grid: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    list: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  const view = $('view-roles');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="roles-back-top" href="#">${I.back} Back to Module Dashboard</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <main class="content roles-main">
      <div class="roles-head">
        <div class="roles-title-row">
          <h1 class="page-title" id="roles-title" tabindex="-1">Roles</h1>
        </div>
        <button type="button" class="btn btn-primary roles-new" id="new-role-btn" aria-haspopup="dialog">${I.plusW} Create Role</button>
      </div>
      <section class="section nt-filters" aria-label="Filter roles">
        <div class="nt-filter">
          <label class="nt-label" for="role-search">Search by role name</label>
          <div class="nt-search"><input class="input" id="role-search" type="search" autocomplete="off" aria-describedby="role-count"><span class="rs-ico" aria-hidden="true">${I.search}</span></div>
        </div>
      </section>
      <p class="nt-count" id="role-count" role="status"></p>
      <ul class="role-grid" id="role-cards" aria-label="Roles"></ul>
      ${S.emptyState({ id: 'roles-empty', ctaId: 're-create', ctaLabel: 'Create Role' })}
    </main>

    <dialog class="modal role-modal" id="role-dialog" aria-labelledby="role-d-title" aria-describedby="role-d-desc">
      <form id="role-form" novalidate>
        <div class="rm-body">
          <button type="button" class="icon-btn modal-close" data-close aria-label="Close">${I.close}</button>
          <div class="modal-head">
            <h2 class="rm-title" id="role-d-title">Create Role</h2>
            <p class="rm-desc" id="role-d-desc">Choose what this role can do in the service.</p>
          </div>
          <div class="field">
            <label class="label" for="role-name">Role name <span class="req" aria-hidden="true">*</span></label>
            <input class="input" id="role-name" type="text" placeholder="Enter role name" autocomplete="off" aria-required="true" aria-describedby="role-name-err" maxlength="40">
            <p class="error" id="role-name-err" hidden><span></span></p>
          </div>
          <div class="field">
            <label class="label" for="role-desc">Role description</label>
            <input class="input" id="role-desc" type="text" placeholder="Describe what this role does" autocomplete="off" maxlength="80">
          </div>
          <fieldset class="rm-access" aria-describedby="role-access-err">
            <legend class="label">What kind of access do you want to give the role? <span class="req" aria-hidden="true">*</span></legend>
            ${ACCESS.map(a => `
            <label class="rm-card">
              <input type="checkbox" name="role-access" value="${a.v}">
              <span class="rm-box" aria-hidden="true"></span>
              <span><span class="rm-label">${a.t}</span><span class="rm-text">${a.d}</span></span>
            </label>`).join('')}
            <p class="error" id="role-access-err" hidden><span>Select at least one access.</span></p>
          </fieldset>
        </div>
        <div class="rm-foot">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary" id="role-submit">Create Role</button>
        </div>
      </form>
    </dialog>`;

  let query = '';
  function render() {
    const q = query.trim().toLowerCase();
    const shown = roles.map((r, i) => ({ r, i })).filter(({ r }) => !q || r.name.toLowerCase().includes(q));
    const tags = r => `<ul class="rt-tags" aria-label="Access">${['CREATOR', 'EDITOR', 'VIEWER'].filter(v => r.access.includes(v)).map(v => `<li class="rt-tag ${TAG[v][1]}">${TAG[v][0]}</li>`).join('')}</ul>`;
    const descHTML = r => r.desc ? `<p class="rt-desc">${esc(r.desc)}</p>` : `<p class="rt-desc"><span aria-hidden="true">-</span><span class="sr-only">No description</span></p>`;
    $('role-cards').className = 'role-grid';
    if (false) {   // list layout removed — cards only
      $('role-cards').innerHTML = shown.map(({ r, i }) => `
        <li class="role-row">
          <span class="rr-pic" style="background:${TINTS[i % TINTS.length]}" aria-hidden="true">${I.user}</span>
          <span class="rr-main"><h2 class="rt-name" id="rt-n-${i}">${esc(r.name)}</h2>${descHTML(r)}</span>
          ${tags(r)}
          <button type="button" class="btn btn-secondary nt-act rt-edit-btn" data-edit="${i}" aria-describedby="rt-n-${i}" aria-haspopup="dialog">${I.pencil} Edit Role</button>
        </li>`).join('');
    } else
    $('role-cards').innerHTML = shown.map(({ r, i }) => `
      <li class="role-tile">
        <div class="rt-pic" style="background:${TINTS[i % TINTS.length]}" aria-hidden="true">${I.userL}</div>
        <div class="rt-name-row"><h2 class="rt-name" id="rt-n-${i}">${esc(r.name)}</h2></div>
        ${r.desc ? `<p class="rt-desc">${esc(r.desc)}</p>` : `<p class="rt-desc"><span aria-hidden="true">-</span><span class="sr-only">No description</span></p>`}
        <ul class="rt-tags" aria-label="Access">${['CREATOR', 'EDITOR', 'VIEWER'].filter(v => r.access.includes(v)).map(v => `<li class="rt-tag ${TAG[v][1]}">${TAG[v][0]}</li>`).join('')}</ul>
        <div class="rt-foot"><button type="button" class="btn btn-secondary nt-act rt-edit-btn" data-edit="${i}" aria-describedby="rt-n-${i}" aria-haspopup="dialog">${I.pencil} Edit Role</button></div>
      </li>`).join('');
    $('roles-empty').hidden = shown.length > 0;
    $('role-cards').hidden = !shown.length;   // an empty list would add its own gap above "No results found"
    if (!shown.length) S.setEmpty($('roles-empty'), false, 'No results found', `Nothing matches “${query.trim()}”. Check the spelling, or try a different search.`);
    $('role-count').textContent = q ? `${shown.length} role${shown.length === 1 ? '' : 's'} found.` : '';
  }
  $('role-search').addEventListener('input', e => { query = e.target.value; render(); });


  /* ---------- Create Role popup ---------- */
  const dlg = $('role-dialog'), nameEl = $('role-name');
  const boxes = () => [...dlg.querySelectorAll('input[name="role-access"]')];
  const nameErr = msg => {
    const e = $('role-name-err'); e.querySelector('span').textContent = msg; e.hidden = !msg;
    if (msg) nameEl.setAttribute('aria-invalid', 'true'); else nameEl.removeAttribute('aria-invalid');
  };
  let editing = -1, opener = null;
  function openRole(i, from) {
    editing = i; opener = from;
    const r = i >= 0 ? roles[i] : null, fixed = !!(r && r.fixed);
    $('role-form').reset();
    $('role-d-title').textContent = r ? 'Edit Role' : 'Create Role';
    $('role-d-desc').textContent = r ? 'Change this role’s details or what it can do in the service.' : 'Choose what this role can do in the service.';
    $('role-submit').textContent = r ? 'Save' : 'Create Role';
    nameEl.value = r ? r.name : '';
    nameEl.readOnly = fixed;                        // Citizen keeps its name …
    $('role-desc').value = r ? (r.desc || '') : '';
    boxes().forEach(c => { c.checked = r ? r.access.includes(c.value) : c.value === 'VIEWER'; });
    nameErr(''); $('role-access-err').hidden = true;
    dlg.showModal(); (fixed ? $('role-desc') : nameEl).focus();
  }
  $('new-role-btn').addEventListener('click', e => openRole(-1, e.currentTarget));
  $('re-create').addEventListener('click', e => {
    openRole(-1, e.currentTarget);
    const q = query.trim(); if (q) { nameEl.value = q[0].toLocaleUpperCase() + q.slice(1); nameEl.select(); }
  });
  $('role-cards').addEventListener('click', e => { const b = e.target.closest('[data-edit]'); if (b) openRole(+b.dataset.edit, b); });
  nameEl.addEventListener('input', () => {
    const v = nameEl.value;   // first letter capitalised, like the form builder
    if (v && v[0] !== v[0].toLocaleUpperCase()) { const a = nameEl.selectionStart; nameEl.value = v[0].toLocaleUpperCase() + v.slice(1); nameEl.setSelectionRange(a, a); }
    if (nameEl.value.trim()) nameErr('');
  });
  // Access builds up: Editor includes Viewer, Creator includes all three. Unticking a level unticks the ones above it.
  boxes().forEach((c, i, all) => c.addEventListener('change', () => {
    all.forEach((x, j) => { if (c.checked && j < i) x.checked = true; if (!c.checked && j > i) x.checked = false; });
    if (c.checked) $('role-access-err').hidden = true;
  }));
  $('role-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = nameEl.value.trim().replace(/\s+/g, ' '), code = toCode(name);
    const access = boxes().filter(c => c.checked).map(c => c.value);
    nameErr(!code ? 'Enter the role name.' : roles.some((r, j) => r.code === code && j !== editing) ? 'This role already exists.' : '');
    $('role-access-err').hidden = access.length > 0;
    if (nameEl.getAttribute('aria-invalid')) return nameEl.focus();
    if (!access.length) return boxes()[0].focus();
    const desc = $('role-desc').value.trim();
    if (editing >= 0) Object.assign(roles[editing], roles[editing].fixed ? { desc, access } : { code, name, desc, access });
    else roles.push({ code, name, desc, access });
    save(); render();
    const was = editing; dlg.close();
    (was >= 0 ? $('role-cards').querySelector(`[data-edit="${was}"]`) : $('new-role-btn'))?.focus();
    S.announce(was >= 0 ? `${name} role updated.` : `${name} role created.`);
    if (was < 0) S.toast(`${name} role created successfully`);
  });
  dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { if (!view.hidden && document.activeElement === document.body) (opener && document.contains(opener) ? opener : $('new-role-btn')).focus(); editing = -1; });

  window.StudioRoles = {
    render(m, focus) {
      const back = '#/module/' + encodeURIComponent(m.id);
      $('roles-back-top').href = back;
      render();
      if (focus) $('roles-title').focus();
    },
  };
})();
