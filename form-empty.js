/* Form empty state on the module dashboard (Studio Index → "Form Empty State": studio.html?form=empty#/module/<id>).
   The module toggle (and Activation state for other modules) stays; the configuration cards are replaced by one white
   container: illustration + "Start by creating your form" + Create Form. The illustration uses the theme colours
   (#0B4B66 header, #C84C0E pencil, #FBEEE8 tint) so brand.js recolours it with each theme. */
(() => {
  const KEY = 'studio-form-empty';
  if (/[?&]form=empty(&|$)/.test(location.search)) {
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    history.replaceState(null, '', location.pathname + location.hash);
  }
  const isOn = () => { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } };
  const off = () => { try { sessionStorage.removeItem(KEY); } catch (e) {} };

  const ART = `<svg class="fe-art" aria-hidden="true" focusable="false" width="184" height="140" viewBox="0 0 184 140" fill="none">
    <ellipse cx="92" cy="128" rx="62" ry="7" fill="#EEEEEE"/>
    <circle cx="92" cy="66" r="58" fill="#FBEEE8"/>
    <rect x="56" y="22" width="72" height="94" rx="8" fill="#FFFFFF" stroke="#D6D6D6" stroke-width="2"/>
    <rect x="56" y="22" width="72" height="16" rx="8" fill="#0B4B66"/><rect x="56" y="30" width="72" height="8" fill="#0B4B66"/>
    <rect x="66" y="48" width="30" height="5" rx="2.5" fill="#0B4B66" opacity=".35"/>
    <rect x="66" y="58" width="52" height="9" rx="3" fill="#F5F5F5" stroke="#D6D6D6"/>
    <rect x="66" y="74" width="24" height="5" rx="2.5" fill="#0B4B66" opacity=".35"/>
    <rect x="66" y="84" width="52" height="9" rx="3" fill="#F5F5F5" stroke="#D6D6D6"/>
    <rect x="66" y="100" width="20" height="7" rx="3.5" fill="#C84C0E" opacity=".45"/>
    <g transform="rotate(35 140 46)"><rect x="134" y="20" width="12" height="46" rx="3" fill="#C84C0E"/><path d="M134 66h12l-6 12z" fill="#F6E7C9"/><path d="M138.5 74h3l-1.5 4z" fill="#363636"/><rect x="134" y="20" width="12" height="7" rx="3" fill="#FBEEE8" stroke="#C84C0E"/></g>
    <path d="M30 40l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" fill="#C84C0E" opacity=".35"/><circle cx="160" cy="98" r="4" fill="#0B4B66" opacity=".3"/>
  </svg>`;
  const css = document.createElement('style');
  css.textContent = `
    .fe-empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding: 40px 24px 44px !important; }
    .fe-empty .fe-art { display: block; margin-bottom: 4px; }
    .fe-empty h2 { margin: 0; font-size: 24px; line-height: 1.25; font-weight: 700; color: var(--heading); }
    .fe-empty p { margin: 0; max-width: 520px; font-size: 16px; line-height: 1.5; color: #505A5F; }
    .fe-empty .btn { margin-top: 8px; }
    .fe-empty .fe-cta { height: 32px; min-height: 32px; padding: 0 16px; gap: 8px; }   /* 32px CTA; same icon as the Form card */`;
  document.head.appendChild(css);

  function apply() {
    const view = document.getElementById('view-module'), grid = document.getElementById('config-grid');
    if (!view || !grid) return;
    const m = location.hash.match(/^#\/module\/([^/]+)$/);
    const on = isOn() && m && !view.hidden;
    let card = document.getElementById('fe-empty');
    if (grid.hidden !== !!on) grid.hidden = !!on;   // only on change: the observer below would otherwise loop
    if (!on) { if (card) card.remove(); return; }
    if (card) return;
    card = document.createElement('section');
    card.className = 'section fe-empty'; card.id = 'fe-empty'; card.setAttribute('aria-labelledby', 'fe-empty-t');
    card.innerHTML = `${ART}
      <h2 id="fe-empty-t">Start by creating your form</h2>
      <p>The form is what people fill in when they use this service. Add the sections and fields you need, and set the rules for each one.</p>
      <a class="btn btn-primary fe-cta" href="#/module/${m[1]}/form"><svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg> Create Form</a>`;
    grid.parentNode.insertBefore(card, grid);
  }
  // leaving the module dashboards (Create Form, Back, side nav…) ends the empty-state preview
  window.addEventListener('hashchange', () => { if (!/^#\/module\/[^/]+$/.test(location.hash)) off(); setTimeout(apply); });
  new MutationObserver(() => apply()).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
  apply();
})();
