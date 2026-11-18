/* ==========================================================
   Tutorials and Guides — bottom panel opened by every "Tutorials and Guides" button in Studio,
   on the Studio Index, and by the process-flow designer inside its frame.
   Card (user reference): white rounded card → inset gradient thumbnail (eGov mark top-left, centred label)
   → title → tag → description → divider → "Watch Video →".
   Needs window.Studio.{esc, announce} (studio.html; index.html sets a small stand-in).
   ========================================================== */
(() => {
  const S = window.Studio;
  // [thumbnail label (Title Case), title + description (sentence case), tag]  — order: label, title, tag, description
  const ITEMS = [
    ['Studio Overview', 'DIGIT Studio overview', 'Overview', 'Get an overview of DIGIT Studio and learn how to create and configure digital services.'],
    ['Service Creation Demo', 'End to end service creation demo', 'Demo', 'Watch a step-by-step demo to understand the complete service creation process, from configuration to publishing.'],
    ['Services and Modules', 'What is a service and a module?', 'Concepts', 'Understand the difference between a service and a module, and how modules help structure a service.'],
    ['Service Workflow', 'How do you create a service workflow?', 'How-to guide', 'Learn how to create a service process flow by defining states, actions, roles, and transitions to manage the service lifecycle.'],
  ];
  const esc = S.esc;
  const ICON = '<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 7v12a2 2 0 0 0 2 2h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="3" width="15" height="15" rx="2" fill="currentColor"/><path d="m11 8 5 3-5 3z" fill="#fff"/></svg>';   // the Tutorials and Guides icon, filled orange
  const panel = document.createElement('section');
  panel.className = 'tg';
  panel.id = 'tg-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'tg-title');
  panel.innerHTML = `
    <div class="tg-head">
      <h2 class="tg-title" id="tg-title"><span class="tg-ico" aria-hidden="true">${ICON}</span>Tutorials and Guides</h2>
      <button type="button" class="tg-close" aria-label="Close tutorials and guides"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <ul class="tg-list">${ITEMS.map(([label, title, tag, desc], i) => `
      <li class="tg-card">
        <div class="tg-thumb tg-tone-${i % 3}" aria-hidden="true"><span class="tg-play"></span><span class="tg-thumb-t">${esc(label)}</span></div>
        <h3 class="tg-card-t" id="tg-t-${i}">${esc(title)}</h3>
        <p class="tg-card-d">${esc(desc)}</p>
        <div class="tg-foot"><button type="button" class="tg-cta" data-tg="${i}" aria-describedby="tg-t-${i}">Watch Video <span aria-hidden="true">→</span></button></div>
      </li>`).join('')}
    </ul>`;
  document.body.appendChild(panel);

  let back = null;
  function open(from) {
    back = from || document.activeElement;
    panel.hidden = false;
    panel.querySelector('.tg-close').focus();
    S.announce('Tutorials and guides opened.');
  }
  function close() {
    if (panel.hidden) return;
    panel.hidden = true;
    if (back && document.contains(back)) back.focus();
  }
  panel.querySelector('.tg-close').addEventListener('click', close);
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
  panel.addEventListener('click', e => {
    const c = e.target.closest('[data-tg]'); if (!c) return;
    S.announce(`${ITEMS[+c.dataset.tg][1]} is not linked yet.`);
  });
  // any "Tutorials and Guides" button opens / closes the panel
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (!b || panel.contains(b) || b.textContent.trim() !== 'Tutorials and Guides') return;
    panel.hidden ? open(b) : close();
  });
  window.Studio.openGuides = open;
  // Studio Index link (studio.html?guides=1#/): open the panel over the Studio screen, then tidy the address
  if (/[?&]guides=1/.test(location.search)) {
    history.replaceState(null, '', location.pathname + location.hash);
    setTimeout(() => open(null), 0);
  }
  window.Studio.closeGuides = close;
})();
