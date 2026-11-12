/* ==========================================================
   Service Preview — Studio Prototype
   Route: #/preview (Studio Index → Service Preview, and the service page's Preview button)
   Laid out like Branding and Theming: two left panels and a preview.
     Panel 1  Modules (names in blue)
     Panel 2  Roles with access to the selected module (from its Process Flow), with what each can do
     Preview  what that role sees, in a Mobile / Tablet / Laptop frame, at a chosen step of the process flow:
              Citizen   → their application, a timeline, "What happens next", the notifications received so far
              Employee  → their inbox: the task waiting for them (time limit, actions) or when they will be notified
   Data: Studio modules, each module's Process Flow (states, actions, roles, time limits, notifications).
         A module without a process flow uses a standard sample.
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);

  const SAMPLE = () => ({
    states: [
      { id: 's1', type: 'start', name: 'Applied', description: 'A citizen has filed an application.', slaHours: 24, notify: { enabled: true, items: [{ name: 'Application received', channel: 'SMS' }] } },
      { id: 's2', type: 'intermediate', name: 'Pending verification', description: 'A verifier checks the application details.', slaHours: 48, notify: { enabled: true, items: [{ name: 'Application under verification', channel: 'SMS' }] } },
      { id: 's3', type: 'intermediate', name: 'Pending approval', description: 'An approver reviews the verified application.', slaHours: 72, notify: { enabled: false, items: [] } },
      { id: 's4', type: 'end', name: 'Approved', description: 'The application is approved.', slaHours: 0, notify: { enabled: true, items: [{ name: 'Application approved', channel: 'Email' }] } },
      { id: 's5', type: 'end', name: 'Rejected', description: 'The application is rejected.', slaHours: 0, notify: { enabled: true, items: [{ name: 'Application rejected', channel: 'SMS' }] } },
    ],
    actions: [
      { name: 'Submit', from: 's1', to: 's2', roles: ['CITIZEN'] },
      { name: 'Verify', from: 's2', to: 's3', roles: ['VERIFIER'] },
      { name: 'Send back', from: 's2', to: 's1', roles: ['VERIFIER'] },
      { name: 'Approve', from: 's3', to: 's4', roles: ['APPROVER'] },
      { name: 'Reject', from: 's3', to: 's5', roles: ['APPROVER'] },
    ],
  });
  const flowOf = m => { try { const f = JSON.parse(localStorage.getItem('studio-process-flow.' + m.id)); if (f && f.states && f.states.length) return f; } catch (e) {} return SAMPLE(); };
  const roleName = r => r.charAt(0) + r.slice(1).toLowerCase().replace(/_/g, ' ');
  const hrs = h => (h >= 24 && h % 24 === 0 ? `${h / 24} ${h / 24 === 1 ? 'day' : 'days'}` : `${h} ${h === 1 ? 'hour' : 'hours'}`);

  // states in the order an application moves through them (start first, end states last)
  function ordered(f) {
    const seen = new Set(), out = [], q = f.states.filter(s => s.type === 'start').map(s => s.id);
    while (q.length) { const id = q.shift(); if (seen.has(id)) continue; seen.add(id); const s = f.states.find(x => x.id === id); if (!s) continue; out.push(s);
      f.actions.filter(a => a.from === id).forEach(a => { if (!seen.has(a.to)) q.push(a.to); }); }
    f.states.forEach(s => { if (!seen.has(s.id)) out.push(s); });
    return [...out.filter(s => s.type !== 'end'), ...out.filter(s => s.type === 'end')];
  }
  // the usual path to a state (for the timeline): follow the first action out of each state
  function pathTo(f, target) {
    const start = f.states.find(s => s.type === 'start'); if (!start) return [target];
    const prev = { [start.id]: null }, q = [start.id];
    while (q.length) { const id = q.shift(); if (id === target.id) break; f.actions.filter(a => a.from === id).forEach(a => { if (!(a.to in prev)) { prev[a.to] = id; q.push(a.to); } }); }
    const p = []; let cur = target.id; if (!(cur in prev)) return [start, target];
    while (cur) { p.unshift(f.states.find(s => s.id === cur)); cur = prev[cur]; }
    return p;
  }
  const notesOf = s => (s.notify && s.notify.enabled ? s.notify.items || [] : []);

  let mod = null, role = 'CITIZEN', stepId = null, device = 'mobile';

  const view = $('view-preview');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="pv-back" href="index.html"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg> Back to Home</a>
      <button type="button" class="btn btn-secondary"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg> Tutorials and Guides</button>
    </div>
    <div class="pv-body">
      <nav class="pv-nav" aria-labelledby="pv-mods-t"><h2 class="pv-nav-t" id="pv-mods-t">Modules</h2><ul class="pv-list" id="pv-mods"></ul></nav>
      <nav class="pv-nav pv-nav-2" aria-labelledby="pv-roles-t"><h2 class="pv-nav-t" id="pv-roles-t">Roles with access</h2><p class="pv-nav-d">Preview the service as each role sees it.</p><ul class="pv-list" id="pv-roles"></ul></nav>
      <main class="pv-main">
        <div class="pv-head">
          <div><h1 class="page-title" id="pv-title" tabindex="-1">Service Preview</h1><p class="pv-sub" id="pv-sub"></p></div>
          <div class="pv-tools">
            <div class="field pv-step-f"><label class="label" for="pv-step">Application is at</label><select class="input" id="pv-step"></select></div>
            <div class="pv-dev" role="radiogroup" aria-label="Device">
              ${[['mobile', 'Mobile'], ['tablet', 'Tablet'], ['laptop', 'Laptop']].map(([k, l]) => `<button type="button" role="radio" class="pv-dev-b" data-dev="${k}" aria-checked="false">${l}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="pv-stage"><div class="pv-frame" id="pv-frame"><div class="pv-screen" id="pv-screen" role="region" aria-label="Preview"></div></div></div>
      </main>
    </div>`;

  function drawNavs() {
    const mods = S.modules ? S.modules() : [];
    if (!mod || !mods.find(m => m.id === mod.id)) mod = mods[0];
    $('pv-mods').innerHTML = mods.map(m => `<li><button type="button" class="pv-item pv-mod${m.id === mod.id ? ' is-on' : ''}" data-mod="${esc(m.id)}" aria-current="${m.id === mod.id ? 'true' : 'false'}">${esc(m.name)}</button></li>`).join('');
    const f = flowOf(mod), roles = ['CITIZEN', ...new Set(f.actions.flatMap(a => a.roles || []).filter(r => r !== 'CITIZEN'))];
    if (!roles.includes(role)) role = 'CITIZEN';
    $('pv-roles').innerHTML = roles.map(r => {
      const can = [...new Set(f.actions.filter(a => (a.roles || []).includes(r) || (r === 'CITIZEN' && a.from === (f.states.find(s => s.type === 'start') || {}).id && !(a.roles || []).length)).map(a => a.name))];
      return `<li><button type="button" class="pv-item pv-role${r === role ? ' is-on' : ''}" data-role="${esc(r)}" aria-current="${r === role ? 'true' : 'false'}">
        <span class="pv-role-n">${esc(roleName(r))}</span><span class="pv-role-d">${r === 'CITIZEN' ? 'Applies and tracks the application' : can.length ? 'Can ' + esc(can.join(', ')) : 'View only'}</span></button></li>`;
    }).join('');
    const st = ordered(f).filter(s => s.type !== 'start' || true);
    if (!stepId || !st.find(s => s.id === stepId)) stepId = (st[1] || st[0]).id;
    $('pv-step').innerHTML = st.map(s => `<option value="${esc(s.id)}"${s.id === stepId ? ' selected' : ''}>${esc(s.name)}</option>`).join('');
  }

  /* ---------- what the role sees ---------- */
  function citizenScreen(f, cur) {
    const path = pathTo(f, cur), all = ordered(f), next = f.actions.filter(a => a.from === cur.id).map(a => f.states.find(s => s.id === a.to)).filter(Boolean);
    const got = path.flatMap(s => notesOf(s).map(n => ({ ...n, at: s.name })));
    const head = (() => { try { return JSON.parse(localStorage.getItem('studio-prototype.citizen-landing.v1')).hero.title; } catch (e) { return 'City Services'; } })();
    const who = next.length && cur.type !== 'end' ? (f.actions.filter(a => a.from === cur.id).flatMap(a => a.roles || []).map(roleName)[0] || 'An officer') : '';
    const nextText = cur.type === 'end'
      ? `Your application is ${esc(cur.name.toLowerCase())}. No further steps.`
      : cur.type === 'start' ? 'Submit your application to send it for verification.'
      : `${esc(who)} is working on your application${cur.slaHours ? `, usually within <b>${hrs(cur.slaHours)}</b>` : ''}. We will send you a message when it moves to the next step.`;
    return `
      <div class="pv-app">
        <div class="pv-bar"><span class="pv-burger" aria-hidden="true"></span><span class="pv-brand">${esc(head)}</span>
          <span class="pv-bell" aria-label="${got.length} notifications"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="#363636"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" stroke="#363636" stroke-width="2" fill="none" stroke-linecap="round"/></svg>${got.length ? `<b>${got.length}</b>` : ''}</span></div>
        <div class="pv-pad">
          <p class="pv-h">My Applications</p>
          <div class="pv-card">
            <div class="pv-card-top"><div><p class="pv-app-no">APP-2026-000123</p><p class="pv-app-m">${esc(mod.name)}</p></div><span class="pv-tag${cur.type === 'end' ? ' is-end' : ''}">${esc(cur.name)}</span></div>
            <ol class="pv-tl" aria-label="Application progress">${all.filter(s => s.type !== 'end' || s.id === cur.id).map(s => {
              const done = path.slice(0, -1).some(p => p.id === s.id), now = s.id === cur.id;
              return `<li class="${done ? 'is-done' : now ? 'is-now' : ''}"><span class="pv-dot" aria-hidden="true"></span><span>${esc(s.name)}</span>${now ? '<span class="sr-only"> (current step)</span>' : done ? '<span class="sr-only"> (done)</span>' : ''}</li>`; }).join('')}</ol>
          </div>
          <div class="pv-next"><p class="pv-next-t">What happens next</p><p>${nextText}</p></div>
          <p class="pv-h">Notifications</p>
          ${got.length ? `<ul class="pv-notes">${got.slice().reverse().map(n => `<li><span class="pv-ch">${esc(n.channel || 'SMS')}</span><span><b>${esc(n.name)}</b><br><span class="pv-muted">When the application reached ${esc(n.at)}</span></span></li>`).join('')}</ul>`
            : '<p class="pv-muted">No notifications yet.</p>'}
        </div>
      </div>`;
  }
  function employeeScreen(f, cur) {
    const mine = f.actions.filter(a => a.from === cur.id && (a.roles || []).includes(role));
    const actsAt = [...new Set(f.actions.filter(a => (a.roles || []).includes(role)).map(a => a.from))].map(id => f.states.find(s => s.id === id)).filter(Boolean);
    return `
      <div class="pv-app pv-emp">
        <div class="pv-bar"><span class="pv-burger" aria-hidden="true"></span><span class="pv-brand">${esc(roleName(role))} Inbox</span>
          <span class="pv-bell" aria-label="${mine.length} notifications"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="#363636"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" stroke="#363636" stroke-width="2" fill="none" stroke-linecap="round"/></svg>${mine.length ? '<b>1</b>' : ''}</span></div>
        <div class="pv-pad">
          ${mine.length ? `
            <div class="pv-alert" role="note"><b>New task:</b> APP-2026-000123 is waiting for you at <b>${esc(cur.name)}</b>.</div>
            <p class="pv-h">Waiting for you (1)</p>
            <div class="pv-card">
              <div class="pv-card-top"><div><p class="pv-app-no">APP-2026-000123</p><p class="pv-app-m">${esc(mod.name)} · Applicant: Pam Beesly</p></div><span class="pv-tag">${esc(cur.name)}</span></div>
              ${cur.slaHours ? `<p class="pv-sla">Act within <b>${hrs(cur.slaHours)}</b></p>` : ''}
              ${cur.description ? `<p class="pv-muted">${esc(cur.description)}</p>` : ''}
              <div class="pv-acts">${mine.map((a, i) => `<span class="pv-btn${i ? ' is-2' : ''}">${esc(a.name)}</span>`).join('')}</div>
            </div>`
          : `
            <p class="pv-h">Waiting for you (0)</p>
            <div class="pv-empty"><p><b>Nothing waiting for you at this step.</b></p>
              <p class="pv-muted">${actsAt.length ? `You will get a notification and a task in this inbox when an application reaches ${actsAt.map(s => `<b>${esc(s.name)}</b>`).join(' or ')}.` : 'This role has no actions in this process flow.'}</p></div>`}
        </div>
      </div>`;
  }
  function drawPreview() {
    const f = flowOf(mod), cur = f.states.find(s => s.id === stepId) || f.states[0];
    $('pv-sub').innerHTML = `<b>${esc(mod.name)}</b> as seen by <b>${esc(roleName(role))}</b>, when the application is at <b>${esc(cur.name)}</b>.`;
    view.querySelectorAll('.pv-dev-b').forEach(b => b.setAttribute('aria-checked', b.dataset.dev === device));
    $('pv-frame').className = 'pv-frame is-' + device;
    $('pv-screen').innerHTML = role === 'CITIZEN' ? citizenScreen(f, cur) : employeeScreen(f, cur);
  }
  function draw() { drawNavs(); drawPreview(); }

  view.addEventListener('click', e => {
    const m = e.target.closest('[data-mod]'); if (m) { mod = (S.modules() || []).find(x => x.id === m.dataset.mod); stepId = null; draw(); view.querySelector(`[data-mod="${m.dataset.mod}"]`)?.focus(); return; }
    const r = e.target.closest('[data-role]'); if (r) { role = r.dataset.role; device = role === 'CITIZEN' ? 'mobile' : 'laptop'; draw(); view.querySelector(`[data-role="${r.dataset.role}"]`)?.focus(); return; }
    const d = e.target.closest('[data-dev]'); if (d) { device = d.dataset.dev; drawPreview(); d.focus(); }
  });
  // device switch: arrow keys move between Mobile / Tablet / Laptop (radio group)
  view.querySelector('.pv-dev').addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return; e.preventDefault();
    const order = ['mobile', 'tablet', 'laptop']; device = order[(order.indexOf(device) + k + 3) % 3]; drawPreview(); view.querySelector(`[data-dev="${device}"]`).focus();
  });
  $('pv-step').addEventListener('change', e => { stepId = e.target.value; drawPreview(); S.announce(`Preview updated: application at ${e.target.selectedOptions[0].text}.`); });

  window.StudioPreview = { render(focus) { draw(); if (focus) $('pv-title').focus(); } };
})();
