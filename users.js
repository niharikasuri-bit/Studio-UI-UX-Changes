/* ==========================================================
   User Management — Studio Prototype
   Routes: #/users (User Management list) · #/users/new (Add User) · #/users/<id> (Edit User)
   List: table styled like the attendance Manage Registers table (count bar, grey header row, rows, pagination).
         Status is a switch; turning a user off asks first (red alert popup, no ✕).
   Form: Personal Details · Employment Details · Assignment · Roles (multi-select dropdown, DIGIT spec:
         checkbox options, selected roles as chips under the field, Clear All).
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.users.v2';

  const ROLES = ['Citizen', 'Employee', 'Verifier', 'Approver', 'Field Inspector', 'Supervisor', 'Admin', 'Dashboard Viewer'];
  const GENDERS = ['Female', 'Male', 'Transgender'];
  const USER_TYPES = ['Permanent', 'Temporary', 'Contractual', 'Deputation'];
  const DEPARTMENTS = ['Administration', 'Engineering', 'Health', 'Revenue', 'Water Supply'];
  const DESIGNATIONS = ['Assistant Engineer', 'Clerk', 'Commissioner', 'Inspector', 'Junior Engineer'];

  const today = () => new Date().toISOString().slice(0, 10);
  // Sample users: characters from The Office (fictional), user IDs as firstname.lastname
  const SAMPLE = () => [
    { id: 'u1', name: 'Michael Scott', userId: 'michael.scott', active: true, roles: ['Admin', 'Approver', 'Supervisor'], added: '2026-09-02',
      mobile: '9876541371', gender: 'Male', dob: '1981-02-11', email: 'michael.scott@dundermifflin.example', address: 'Scranton Business Park, Ward 1',
      type: 'Permanent', appointed: '2024-02-01', dept: 'Administration', desig: 'Commissioner', start: '2025-02-01', current: true },
    { id: 'u2', name: 'Dwight Schrute', userId: 'dwight.schrute', active: true, roles: ['Field Inspector', 'Verifier', 'Employee', 'Supervisor'], added: '2026-09-04',
      mobile: '9876542742', gender: 'Male', dob: '1982-03-12', email: 'dwight.schrute@dundermifflin.example', address: 'Scranton Business Park, Ward 2',
      type: 'Permanent', appointed: '2024-03-01', dept: 'Revenue', desig: 'Inspector', start: '2025-03-01', current: true },
    { id: 'u3', name: 'Jim Halpert', userId: 'jim.halpert', active: true, roles: ['Employee', 'Verifier'], added: '2026-09-10',
      mobile: '9876544113', gender: 'Male', dob: '1983-04-13', email: 'jim.halpert@dundermifflin.example', address: 'Scranton Business Park, Ward 3',
      type: 'Permanent', appointed: '2024-04-01', dept: 'Revenue', desig: 'Clerk', start: '2025-04-01', current: true },
    { id: 'u4', name: 'Pam Beesly', userId: 'pam.beesly', active: true, roles: ['Employee'], added: '2026-09-12',
      mobile: '9876545484', gender: 'Female', dob: '1984-05-14', email: 'pam.beesly@dundermifflin.example', address: 'Scranton Business Park, Ward 4',
      type: 'Permanent', appointed: '2024-05-01', dept: 'Administration', desig: 'Clerk', start: '2025-05-01', current: true },
    { id: 'u5', name: 'Angela Martin', userId: 'angela.martin', active: true, roles: ['Approver', 'Dashboard Viewer'], added: '2026-09-18',
      mobile: '9876546855', gender: 'Female', dob: '1985-06-15', email: 'angela.martin@dundermifflin.example', address: 'Scranton Business Park, Ward 5',
      type: 'Permanent', appointed: '2024-06-01', dept: 'Revenue', desig: 'Assistant Engineer', start: '2025-06-01', current: true },
    { id: 'u6', name: 'Oscar Martinez', userId: 'oscar.martinez', active: true, roles: ['Verifier', 'Dashboard Viewer'], added: '2026-09-21',
      mobile: '9876548226', gender: 'Male', dob: '1986-07-16', email: 'oscar.martinez@dundermifflin.example', address: 'Scranton Business Park, Ward 6',
      type: 'Permanent', appointed: '2024-07-01', dept: 'Revenue', desig: 'Assistant Engineer', start: '2025-07-01', current: true },
    { id: 'u7', name: 'Stanley Hudson', userId: 'stanley.hudson', active: false, roles: ['Employee'], added: '2026-09-25',
      mobile: '9876549597', gender: 'Male', dob: '1987-08-17', email: 'stanley.hudson@dundermifflin.example', address: 'Scranton Business Park, Ward 7',
      type: 'Temporary', appointed: '2024-08-01', dept: 'Water Supply', desig: 'Clerk', start: '2025-08-01', current: true },
    { id: 'u8', name: 'Kevin Malone', userId: 'kevin.malone', active: true, roles: ['Employee'], added: '2026-10-01',
      mobile: '9876550968', gender: 'Male', dob: '1988-09-18', email: 'kevin.malone@dundermifflin.example', address: 'Scranton Business Park, Ward 8',
      type: 'Contractual', appointed: '2024-09-01', dept: 'Revenue', desig: 'Clerk', start: '2025-09-01', current: true },
    { id: 'u9', name: 'Kelly Kapoor', userId: 'kelly.kapoor', active: true, roles: ['Citizen', 'Employee'], added: '2026-10-06',
      mobile: '9876552339', gender: 'Female', dob: '1989-01-10', email: 'kelly.kapoor@dundermifflin.example', address: 'Scranton Business Park, Ward 9',
      type: 'Contractual', appointed: '2024-01-01', dept: 'Health', desig: 'Clerk', start: '2025-01-01', current: true },
    { id: 'u10', name: 'Toby Flenderson', userId: 'toby.flenderson', active: false, roles: ['Supervisor'], added: '2026-10-14',
      mobile: '9876553710', gender: 'Male', dob: '1990-02-11', email: 'toby.flenderson@dundermifflin.example', address: 'Scranton Business Park, Ward 10',
      type: 'Deputation', appointed: '2024-02-01', dept: 'Administration', desig: 'Inspector', start: '2025-02-01', current: true },
    { id: 'u11', name: 'Ryan Howard', userId: 'ryan.howard', active: false, roles: ['Employee', 'Field Inspector'], added: '2026-10-20',
      mobile: '9876555081', gender: 'Male', dob: '1991-03-12', email: 'ryan.howard@dundermifflin.example', address: 'Scranton Business Park, Ward 11',
      type: 'Temporary', appointed: '2024-03-01', dept: 'Engineering', desig: 'Junior Engineer', start: '2025-03-01', current: true },
    { id: 'u12', name: 'Phyllis Vance', userId: 'phyllis.vance', active: true, roles: ['Verifier'], added: '2026-11-02',
      mobile: '9876556452', gender: 'Female', dob: '1992-04-13', email: 'phyllis.vance@dundermifflin.example', address: 'Scranton Business Park, Ward 12',
      type: 'Permanent', appointed: '2024-04-01', dept: 'Health', desig: 'Inspector', start: '2025-04-01', current: true },
  ].reverse();   // newest first, like a freshly added user
  let users = SAMPLE();
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(s)) users = s; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(users)); } catch (e) {} };
  const fmtDate = d => (d ? d.split('-').reverse().join('/') : '');

  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    left: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plus: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    pencil: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    check: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
    chev: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>',
    x: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    first: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17-5-5 5-5M18 17l-5-5 5-5"/></svg>',
    prev: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    next: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    last: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 17 5-5-5-5M6 17l5-5-5-5"/></svg>',
  };

  const view = $('view-users');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="um-back-top" href="index.html">${I.back} <span id="um-back-l">Back to Home</span></a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <div class="um-body" id="um-body"></div>
    <footer class="form-foot" id="um-foot" hidden>
      <a class="btn btn-secondary" href="#/users">${I.left} Back</a>
      <button type="submit" form="um-form" class="btn btn-primary" id="um-submit">${I.check} Add User</button>
    </footer>

    <dialog class="modal um-alert" id="um-confirm" aria-labelledby="um-c-title" aria-describedby="um-c-desc">
      <div class="um-alert-head">
        <svg class="um-alert-ico" aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B91900" stroke-width="2.2"/><path d="M12 7v6" stroke="#B91900" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.4" fill="#B91900"/></svg>
        <h2 class="um-alert-title" id="um-c-title"></h2>
      </div>
      <p class="um-alert-desc" id="um-c-desc"></p>
      <div class="field um-alert-f">
        <label class="label" for="um-c-date">Date of deactivation</label>
        <input class="input um-dis" id="um-c-date" type="date" disabled>
      </div>
      <div class="field um-alert-f">
        <label class="label" for="um-c-reason">Reason for deactivating the user<span class="req" aria-hidden="true"> *</span></label>
        <select class="input" id="um-c-reason" aria-required="true" aria-describedby="um-c-reason-err">
          <option value="">Select</option>
          <option>Orders from higher authority</option>
          <option>Retired</option>
          <option>Resigned</option>
          <option>Transferred to another office</option>
          <option>Contract ended</option>
          <option>Suspended</option>
          <option>Long leave</option>
          <option>Deceased</option>
          <option>Other</option>
        </select>
        <p class="error" id="um-c-reason-err" hidden>Select the reason for deactivating the user.</p>
      </div>
      <div class="um-alert-actions">
        <button type="button" class="btn btn-secondary" id="um-c-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="um-c-ok">Deactivate User</button>
      </div>
    </dialog>`;

  /* ---------- User Management list ---------- */
  let page = 0, pageSize = 10;
  // Search and filters apply as you type or pick; Clear (secondary button) resets them
  const f = { q: '', status: '', role: '' };
  const filtered = () => users.filter(u => {
    const q = f.q.trim().toLowerCase();
    return (!q || u.name.toLowerCase().includes(q) || u.userId.toLowerCase().includes(q))
      && (!f.status || (f.status === 'active') === u.active)
      && (!f.role || u.roles.includes(f.role));
  });
  const anyFilter = () => !!(f.q.trim() || f.status || f.role);
  const opt = (v, label, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
  // Roles: one info tag ("2 Roles"); hovering it lists the roles, screen readers read them out
  const roleTag = u => u.roles.length
    ? `<span class="tag tag-info um-rtag" title="${esc(u.roles.join(', '))}">${u.roles.length} ${u.roles.length === 1 ? 'Role' : 'Roles'}<span class="sr-only">: ${esc(u.roles.join(', '))}</span></span>`
    : '<span class="um-none">No roles</span>';
  function drawList(focusId) {
    $('um-foot').hidden = true;
    $('um-back-top').setAttribute('href', 'index.html'); $('um-back-l').textContent = 'Back to Home';
    const act = users.filter(u => u.active).length;
    $('um-body').innerHTML = `
      <div class="um-head">
        <div>
          <h1 class="page-title" id="um-title" tabindex="-1">User Management</h1>
          <p class="um-desc">Add the people who use your system, keep their details and roles up to date, and activate or deactivate their access.</p>
        </div>
        ${users.length ? `<a class="btn btn-primary um-add" href="#/users/new">${I.plus} Add User</a>` : ''}
      </div>
      <div class="um-metrics" role="list" aria-label="User summary">
        <div class="um-metric" role="listitem"><b>${users.length}</b><span>Total users</span></div>
        <div class="um-metric" role="listitem"><b>${act}</b><span>Active users</span></div>
        <div class="um-metric" role="listitem"><b>${users.length - act}</b><span>Inactive users</span></div>
      </div>
      <section class="section nt-filters" aria-label="Filter users"${users.length ? '' : ' hidden'}>
        <div class="nt-filter">
          <label class="nt-label" for="um-q">Search by user name or user ID</label>
          <div class="nt-search"><input class="input" id="um-q" type="search" autocomplete="off" aria-describedby="um-count" value="${esc(f.q)}"><span class="rs-ico" aria-hidden="true"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></span></div>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="um-fs">Status</label>
          <select class="input pf-select nt-select" id="um-fs">${opt('', 'All statuses', f.status)}${opt('active', 'Active', f.status)}${opt('inactive', 'Inactive', f.status)}</select>
        </div>
        <div class="nt-filter">
          <label class="nt-label" for="um-fr">Role</label>
          <select class="input pf-select nt-select" id="um-fr">${opt('', 'All roles', f.role)}${ROLES.map(r => opt(r, r, f.role)).join('')}</select>
        </div>
        <button type="button" class="btn btn-secondary nt-clear nt-clear-btn" id="um-fclear" disabled>Clear Search</button>
      </section>
      <div class="nt-results" id="um-results" hidden><p class="nt-count" id="um-count" role="status"></p></div>
      <section class="um-table-box" aria-label="Users" id="um-tbl"></section>
      ${S.emptyState({ id: 'um-empty', ctaId: 'um-empty-add', ctaLabel: 'Add User' })}`;
    $('um-empty-add').removeAttribute('aria-haspopup');   // goes to the Add User page, not a popup
    drawTable();
    if (focusId) $(focusId)?.focus();
  }
  function drawTable() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / pageSize)); page = Math.min(page, pages - 1);
    const rows = list.slice(page * pageSize, page * pageSize + pageSize);
    $('um-fclear').disabled = !anyFilter();
    $('um-results').hidden = !anyFilter();
    $('um-count').textContent = anyFilter() ? `${list.length} ${list.length === 1 ? 'user' : 'users'} found.` : '';
    const none = !rows.length;
    $('um-tbl').hidden = none; $('um-empty').hidden = !none;
    if (none) users.length
      ? S.setEmpty($('um-empty'), false, 'No users found', 'Nothing matches your search or filters. Check the spelling, or change the filters.')
      : S.setEmpty($('um-empty'), true, 'User yet to be added', 'Add users so they can sign in and work on the services they are given roles for.');
    $('um-tbl').innerHTML = `
        <div class="um-scroll">
          <table class="um-table">
            <thead><tr><th scope="col">User</th><th scope="col">User ID</th><th scope="col">Roles</th><th scope="col">Added on</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
            <tbody>${rows.length ? rows.map(u => `
              <tr${u.active ? '' : ' class="is-off"'}>
                <td class="um-name">${esc(u.name)}</td>
                <td class="um-id">${esc(u.userId)}</td>
                <td>${roleTag(u)}</td>
                <td class="um-date">${fmtDate(u.added)}</td>
                <td><span class="um-status">
                  <button type="button" class="switch" role="switch" data-um-sw="${u.id}" aria-checked="${u.active}" aria-label="${esc(u.name)} active"><span class="switch-knob" aria-hidden="true"></span></button>
                  <span class="um-status-t${u.active ? ' is-on' : ''}" aria-hidden="true">${u.active ? 'Active' : 'Inactive'}</span></span></td>
                <td><a class="btn btn-secondary um-edit" href="#/users/${encodeURIComponent(u.id)}" aria-label="Edit ${esc(u.name)}">${I.pencil} Edit</a></td>
              </tr>`).join('') : ''}</tbody>
          </table>
        </div>
        <div class="um-pager">
          <label class="um-rpp">Rows per page
            <select class="input" id="um-size">${[10, 25, 50].map(n => `<option${n === pageSize ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
          <span>${list.length ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, list.length)}` : '0'} of ${list.length}</span>
          <span class="um-nav">
            <button type="button" class="icon-btn" data-um-page="0" aria-label="First page"${page === 0 ? ' disabled' : ''}>${I.first}</button>
            <button type="button" class="icon-btn" data-um-page="${page - 1}" aria-label="Previous page"${page === 0 ? ' disabled' : ''}>${I.prev}</button>
            <button type="button" class="icon-btn" data-um-page="${page + 1}" aria-label="Next page"${page >= pages - 1 ? ' disabled' : ''}>${I.next}</button>
            <button type="button" class="icon-btn" data-um-page="${pages - 1}" aria-label="Last page"${page >= pages - 1 ? ' disabled' : ''}>${I.last}</button>
          </span>
        </div>`;
  }
  // filters apply straight away; screen readers hear the result count once typing pauses
  $('um-body').addEventListener('input', e => {
    const k = { 'um-q': 'q', 'um-fs': 'status', 'um-fr': 'role' }[e.target.id]; if (!k) return;
    f[k] = e.target.value; page = 0; drawTable();
  });
  const clearFilters = () => { Object.assign(f, { q: '', status: '', role: '' }); page = 0; drawList('um-q'); S.announce('Search and filters cleared.'); };
  $('um-body').addEventListener('change', e => { if (e.target.id === 'um-size') { pageSize = +e.target.value; page = 0; drawTable(); $('um-size').focus(); } });
  $('um-body').addEventListener('click', e => {
    if (e.target.closest('#um-fclear')) return clearFilters();
    if (e.target.closest('#um-empty-add')) { location.hash = '#/users/new'; return; }
    const pg = e.target.closest('[data-um-page]'); if (pg && !pg.disabled) { page = +pg.dataset.umPage; drawTable(); return; }
    const sw = e.target.closest('[data-um-sw]'); if (!sw) return;
    const u = users.find(x => x.id === sw.dataset.umSw);
    if (u.active) return askDeactivate(u, sw);
    u.active = true; save(); drawList(); refocusSwitch(u.id);
    S.toast(`${u.name} activated`); S.announce(`${u.name} activated.`);
  });
  const refocusSwitch = id => $('um-body').querySelector(`[data-um-sw="${id}"]`)?.focus();

  /* Deactivate: red alert popup (no ✕), Cancel + Deactivate User */
  const conf = $('um-confirm'); let target = null;
  function askDeactivate(u) {
    target = u;
    $('um-c-title').textContent = `Deactivate ${u.name}?`;   // the title asks the question
    $('um-c-desc').innerHTML = `Are you sure you want to deactivate <strong>${esc(u.name)}</strong>? They will no longer be able to sign in or use the system. You can activate them again at any time.`;
    // fresh fields each time: today's date, no reason picked, no errors
    $('um-c-date').value = today(); $('um-c-reason').value = '';
    $('um-c-reason').removeAttribute('aria-invalid'); $('um-c-reason-err').hidden = true;   // the date is today's date and can't be changed
    conf.showModal(); $('um-c-cancel').focus();
  }
  $('um-c-cancel').addEventListener('click', () => conf.close());
  conf.addEventListener('click', e => { if (e.target === conf) conf.close(); });
  // an error clears as soon as its field is filled
  $('um-c-reason').addEventListener('change', () => { if ($('um-c-reason').value) { $('um-c-reason').removeAttribute('aria-invalid'); $('um-c-reason-err').hidden = true; } });
  $('um-c-ok').addEventListener('click', () => {
    if (!$('um-c-reason').value) { $('um-c-reason-err').hidden = false; $('um-c-reason').setAttribute('aria-invalid', 'true'); $('um-c-reason').focus(); return; }
    const u = target; target = null; conf.close();
    u.active = false; u.deactivatedOn = $('um-c-date').value; u.deactivateReason = $('um-c-reason').value;
    save(); drawList(); refocusSwitch(u.id);
    S.toast(`${u.name} deactivated`); S.announce(`${u.name} deactivated.`);
  });
  conf.addEventListener('close', () => { if (target) { const id = target.id; target = null; refocusSwitch(id); } });

  /* ---------- Add / Edit User form ---------- */
  let editing = null, picked = [];
  const req = '<span class="req" aria-hidden="true"> *</span>';
  const opts = (list, v) => `<option value="">Select</option>` + list.map(o => `<option${o === v ? ' selected' : ''}>${esc(o)}</option>`).join('');
  const fld = (id, label, control, required, wide) => `
    <div class="field um-f${wide ? ' is-wide' : ''}">
      <label class="label" for="${id}">${label}${required ? req : ''}</label>
      ${control}
      <p class="error" id="${id}-err" hidden></p>
    </div>`;
  const inp = (id, v, extra = '') => `<input class="input" id="${id}" name="${id}" value="${esc(v || '')}" autocomplete="off" aria-describedby="${id}-err" ${extra}>`;
  const sel = (id, list, v, extra = '') => `<select class="input" id="${id}" name="${id}" aria-describedby="${id}-err" ${extra}>${opts(list, v)}</select>`;
  const REQUIRED = { 'um-name': 'Enter the name.', 'um-mobile': 'Enter the mobile number.', 'um-gender': 'Select the gender.', 'um-dob': 'Enter the date of birth.',
    'um-address': 'Enter the correspondence address.', 'um-type': 'Select the user type.', 'um-appointed': 'Enter the date of appointment.',
    'um-dept': 'Select the department.', 'um-desig': 'Select the designation.', 'um-start': 'Enter the start date.' };

  function drawForm(u) {
    editing = u || null; picked = u ? [...u.roles] : [];
    const v = u || { current: true };
    $('um-foot').hidden = false;
    $('um-submit').innerHTML = `${I.check} ${u ? 'Save' : 'Add User'}`;
    $('um-back-top').setAttribute('href', '#/users'); $('um-back-l').textContent = 'Back to User Management';
    $('um-body').innerHTML = `
      <div><h1 class="page-title" id="um-title" tabindex="-1">${u ? 'Edit User' : 'Add User'}</h1>
        <p class="um-desc">${u ? 'Update the details of this user.' : 'Add details about the user you are about to add.'}</p></div>
      <form id="um-form" class="um-form" novalidate>
        <section class="section um-sec" aria-labelledby="um-s1"><h2 class="um-sec-t" id="um-s1">Personal Details</h2>
          <div class="um-grid">
            ${fld('um-name', 'Name', inp('um-name', v.name, 'maxlength="60" aria-required="true"'), true)}
            ${fld('um-mobile', 'Mobile Number', `<div class="um-phone"><span class="um-cc" aria-hidden="true">+91</span>${inp('um-mobile', v.mobile, 'inputmode="numeric" maxlength="10" aria-required="true" aria-label="Mobile Number, country code +91"')}</div>`, true)}
            ${fld('um-gender', 'Gender', sel('um-gender', GENDERS, v.gender, 'aria-required="true"'), true)}
            ${fld('um-dob', 'Date of Birth', inp('um-dob', v.dob, `type="date" max="${today()}" aria-required="true"`), true)}
            ${fld('um-email', 'Email ID', inp('um-email', v.email, 'type="email" maxlength="80"'))}
            ${fld('um-address', 'Correspondence Address', `<textarea class="input um-ta" id="um-address" name="um-address" rows="3" maxlength="250" aria-required="true" aria-describedby="um-address-err">${esc(v.address || '')}</textarea>`, true, true)}
          </div>
        </section>
        <section class="section um-sec" aria-labelledby="um-s2"><h2 class="um-sec-t" id="um-s2">Employment Details</h2>
          <div class="um-grid">
            ${fld('um-type', 'User type', sel('um-type', USER_TYPES, v.type, 'aria-required="true"'), true)}
            ${fld('um-appointed', 'Date of Appointment', inp('um-appointed', v.appointed, 'type="date" aria-required="true"'), true)}
            ${fld('um-userid', 'User ID', inp('um-userid', v.userId, 'maxlength="40"'))}
          </div>
        </section>
        <section class="section um-sec" aria-labelledby="um-s3"><h2 class="um-sec-t" id="um-s3">Assignment</h2>
          <div class="um-grid">
            ${fld('um-dept', 'Department', sel('um-dept', DEPARTMENTS, v.dept, 'aria-required="true"'), true)}
            ${fld('um-desig', 'Designation', sel('um-desig', DESIGNATIONS, v.desig, 'aria-required="true"'), true)}
            ${fld('um-start', 'Start Date', inp('um-start', v.start, 'type="date" aria-required="true"'), true)}
            <label class="check-row um-current"><input type="checkbox" id="um-current" aria-controls="um-end-wrap"${v.current ? ' checked' : ''}> Is this the current assignment?</label>
            <div id="um-end-wrap"${v.current ? ' hidden' : ''}>${fld('um-end', 'End Date', inp('um-end', v.end, 'type="date" aria-required="true"'), true)}</div>
          </div>
        </section>
        <section class="section um-sec" aria-labelledby="um-s4"><h2 class="um-sec-t" id="um-s4">Roles</h2>
          <div class="um-grid">
            <div class="field um-f">
              <span class="label" id="um-roles-l">Select Roles</span>
              <div class="um-ms" id="um-ms">
                <button type="button" class="input um-ms-btn" id="um-ms-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="um-ms-list" aria-labelledby="um-roles-l um-ms-val">
                  <span id="um-ms-val"></span>${I.chev}</button>
                <ul class="um-ms-list" id="um-ms-list" role="listbox" aria-multiselectable="true" aria-labelledby="um-roles-l" tabindex="-1" hidden></ul>
              </div>
              <div class="um-chips" id="um-chips"></div>
            </div>
          </div>
        </section>
      </form>`;
    drawRoles();
  }

  /* Roles multi-select: button opens a list of checkbox options; picked roles show as chips under the field */
  function drawRoles(keepActive) {
    $('um-ms-val').textContent = picked.length ? `${picked.length} Selected` : 'Select';   // DIGIT MultiSelectDropdown wording
    $('um-ms-val').classList.toggle('is-ph', !picked.length);
    $('um-ms-list').innerHTML = ROLES.map((r, i) => `<li role="option" id="um-opt-${i}" class="um-opt${keepActive === i ? ' is-active' : ''}" data-role="${esc(r)}" aria-selected="${picked.includes(r)}">
      <span class="um-cb" aria-hidden="true"></span>${esc(r)}</li>`).join('');
    // DIGIT: picked options as plain grey tags under the field, then an outlined Clear All button (untick in the list to remove one)
    $('um-chips').innerHTML = picked.length ? `<ul class="um-chip-list" aria-label="Selected roles">${picked.map(r => `<li class="um-chip">${esc(r)}</li>`).join('')}</ul>` +
      '<button type="button" class="um-clear" id="um-clear">Clear All</button>' : '';
  }
  let active = 0;
  const msOpen = () => !$('um-ms-list').hidden;
  function openMs(on) {
    const list = $('um-ms-list'), btn = $('um-ms-btn');
    list.hidden = !on; btn.setAttribute('aria-expanded', on);
    if (on) { active = 0; markActive(); list.focus(); } else btn.focus();
  }
  function markActive() {
    const list = $('um-ms-list');
    list.querySelectorAll('.um-opt').forEach((o, i) => o.classList.toggle('is-active', i === active));
    list.setAttribute('aria-activedescendant', 'um-opt-' + active);
    list.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }
  function toggleRole(r) {
    picked = picked.includes(r) ? picked.filter(x => x !== r) : [...picked, r];
    picked.sort((a, b) => ROLES.indexOf(a) - ROLES.indexOf(b));
    drawRoles(active); if (msOpen()) markActive();
  }
  $('um-body').addEventListener('click', e => {
    if (e.target.closest('#um-ms-btn')) return openMs(!msOpen());
    const o = e.target.closest('.um-opt'); if (o) { active = [...o.parentElement.children].indexOf(o); return toggleRole(o.dataset.role); }
    const un = e.target.closest('[data-unpick]');
    if (un) { const r = un.dataset.unpick; picked = picked.filter(x => x !== r); drawRoles(); ($('um-chips').querySelector('[data-unpick]') || $('um-ms-btn')).focus(); S.announce(`${r} removed.`); return; }
    if (e.target.closest('#um-clear')) { picked = []; drawRoles(); $('um-ms-btn').focus(); S.announce('All roles cleared.'); }
  });
  $('um-body').addEventListener('keydown', e => {
    if (e.target.id !== 'um-ms-list') return;
    const n = ROLES.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % n; markActive(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + n) % n; markActive(); }
    else if (e.key === 'Home') { e.preventDefault(); active = 0; markActive(); }
    else if (e.key === 'End') { e.preventDefault(); active = n - 1; markActive(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleRole(ROLES[active]); }
    else if (e.key === 'Escape' || e.key === 'Tab') { if (e.key === 'Escape') e.preventDefault(); openMs(false); }
  });
  document.addEventListener('pointerdown', e => { if (view.hidden || !$('um-ms') || !msOpen()) return; if (!e.target.closest('#um-ms')) { $('um-ms-list').hidden = true; $('um-ms-btn').setAttribute('aria-expanded', 'false'); } });

  // Not the current assignment -> it has ended, so ask for its End Date (like LinkedIn's "I currently work here")
  $('um-body').addEventListener('change', e => {
    if (e.target.id !== 'um-current') return;
    const show = !e.target.checked; $('um-end-wrap').hidden = !show;
    if (!show) { $('um-end').value = ''; $('um-end').removeAttribute('aria-invalid'); $('um-end-err').hidden = true; }
    S.announce(show ? 'End Date field added.' : 'End Date field removed.');
  });
  // errors clear as soon as the field is fixed
  $('um-body').addEventListener('input', e => { const t = e.target; if (t.getAttribute('aria-invalid') && String(t.value).trim()) { t.removeAttribute('aria-invalid'); const er = $(t.id + '-err'); if (er) er.hidden = true; } });
  $('um-body').addEventListener('submit', e => {
    if (e.target.id !== 'um-form') return;
    e.preventDefault();
    const val = id => $(id).value.trim(); const bad = [];
    const setErr = (id, msg) => { const f = $(id), er = $(id + '-err'); if (msg) { f.setAttribute('aria-invalid', 'true'); er.textContent = msg; er.hidden = false; bad.push(id); } else { f.removeAttribute('aria-invalid'); er.hidden = true; } };
    Object.entries(REQUIRED).forEach(([id, msg]) => setErr(id, val(id) ? '' : msg));
    if (val('um-mobile') && !/^[6-9]\d{9}$/.test(val('um-mobile'))) setErr('um-mobile', 'Enter a 10-digit mobile number.');
    if (val('um-email') && !/^\S+@\S+\.\S+$/.test(val('um-email'))) setErr('um-email', 'Enter an email ID like name@example.com.');
    if (!$('um-current').checked) {
      if (!val('um-end')) setErr('um-end', 'Enter the end date.');
      else if (val('um-start') && val('um-end') < val('um-start')) setErr('um-end', 'The end date must be on or after the start date.');
    }
    if (bad.length) { $(bad[0]).focus(); return; }
    const data = { name: val('um-name'), mobile: val('um-mobile'), gender: val('um-gender'), dob: val('um-dob'), email: val('um-email'), address: val('um-address'),
      type: val('um-type'), appointed: val('um-appointed'), userId: val('um-userid') || val('um-name').toLowerCase().trim().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, ''),
      dept: val('um-dept'), desig: val('um-desig'), start: val('um-start'), current: $('um-current').checked, end: $('um-current').checked ? '' : val('um-end'), roles: [...picked] };
    if (editing) Object.assign(editing, data); else users.unshift({ id: 'u' + Date.now().toString(36), active: true, added: today(), ...data });
    save(); const was = !!editing; location.hash = '#/users';
    S.toast(was ? 'User details saved' : 'User added'); S.announce(was ? 'User details saved.' : 'User added.');
  });

  window.StudioUsers = {
    render(sub, focus) {
      if (!sub) drawList();
      else if (sub === 'new') drawForm(null);
      else { const u = users.find(x => x.id === decodeURIComponent(sub)); if (!u) { location.hash = '#/users'; return; } drawForm(u); }
      $('um-body').scrollTop = 0;
      if (focus) $('um-title').focus();
    },
  };
})();
