/* ==========================================================
   Citizen Landing Page — Studio Prototype
   Route: #/citizen-landing (from the "Citizen Landing" card on the index page)
   A copy of the Service Landing Page editor for the citizen home page:
   Centre: phone preview (header, hero banner with a button, search bar, Explore Our Services, View More).
   Right: Landing Page Items — Hero Banner / Search Bar. The hero has one extra box over the
          service landing page: Hero Banner Button (button text).
   ========================================================== */
(() => {
  const S = window.Studio, { esc } = S;
  const $ = id => document.getElementById(id);
  const KEY = 'studio-prototype.citizen-landing.v1';
  const DEFAULT = () => ({
    hero: { title: 'Welcome to City Services', desc: 'Apply for, track and renew municipal services in one place.', btn: 'Log in to continue', bg: '' },
    search: { text: 'Search for a service…' },
  });
  let data = DEFAULT();
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.hero && s.search) data = s; } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} };
  let open = '';   // '' | 'hero' | 'search' — which item's properties are shown

  const HL = { title: 40, desc: 200, btn: 30 };
  const SL = { text: 40 };

  const I = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    left: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    upload: '<svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zm0-10h4v6h6v-6h4l-7-7-7 7z"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
    info: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    search: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    service: '<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M6 18h6"/><rect x="15" y="9" width="7" height="12" rx="1.5" fill="#fff"/></svg>',
    down: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>',
  };
  const tip = (id, label, text) => `<span class="tip"><button type="button" class="tip-btn" aria-label="About ${label}" aria-describedby="${id}">${I.info}</button><span class="tip-bubble" role="tooltip" id="${id}">${text}</span></span>`;

  /* ---------- Shell (same layout as the Service Landing Page) ---------- */
  const view = $('view-citizen');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" href="index.html">${I.back} Back to Home</a>
      <button type="button" class="btn btn-secondary">${I.guides} Tutorials and Guides</button>
    </div>
    <div class="form-body lp-body">
      <div class="form-main lp-main">
        <div class="lp-head">
          <h1 class="page-title" id="cz-title" tabindex="-1">Citizen Landing Page</h1>
        </div>
        <div class="lp-stage" id="cz-stage">
          <div class="lp-fit" id="cz-fit">
            <div class="lp-phone">
              <span class="lp-cam" aria-hidden="true"></span>
              <div class="lp-screen" id="cz-screen" tabindex="0" role="region" aria-label="Phone preview of the citizen landing page"></div>
            </div>
          </div>
        </div>
      </div>
      <aside class="form-panel" aria-label="Landing page items">
        <div class="panel-view" id="cz-list-view">
          <div class="fp-head"><h2 class="fp-title">Landing Page Items</h2></div>
          <div class="fp-scroll" id="cz-props">
            <div class="fp-section">
              <ul class="field-list" aria-label="Page sections">
                <li class="field-card lp-fc"><button type="button" class="lp-fc-open" data-czedit="hero"><span class="field-name">Hero Banner</span></button></li>
                <li class="field-card lp-fc"><button type="button" class="lp-fc-open" data-czedit="search"><span class="field-name">Search Bar</span></button></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="panel-view" id="cz-q-view" hidden></div>
      </aside>
    </div>
    <footer class="form-foot">
      <a class="btn btn-secondary" href="index.html">${I.left} Back</a>
      <button type="button" class="btn btn-primary dc-save" id="cz-save">${I.check} Save</button>
    </footer>`;

  /* ---------- Phone preview (sized like the Service Landing Page phone) ---------- */
  const PW = 320, PH = 592;
  function fitPhone() {
    const st = $('cz-stage'), fit = $('cz-fit'); if (!st || !fit || view.hidden) return;
    const main = st.parentElement, head = main.querySelector('.lp-head'), phone = fit.firstElementChild;
    phone.style.transform = '';
    if (window.innerWidth < 1100) { fit.style.width = PW + 'px'; fit.style.height = PH + 'px'; phone.style.height = PH + 'px'; return; }
    const mcs = getComputedStyle(main);
    const avail = main.clientHeight - parseFloat(mcs.paddingTop) - parseFloat(mcs.paddingBottom) - head.offsetHeight - parseFloat(getComputedStyle(head).marginBottom) - 8;
    const kZoom = Math.min(1, Math.max(0.67, 1 / (window.devicePixelRatio || 1)));
    const k = Math.max(0.5, Math.min(kZoom, avail / (PW * 1.3)));
    const ph = Math.max(Math.round(PW * 1.3), Math.min(PH, avail / k));
    st.classList.toggle('is-scroll', ph * k > avail + 1);
    fit.style.width = PW * k + 'px'; fit.style.height = ph * k + 'px';
    phone.style.height = ph + 'px';
    phone.style.transform = k < 1 ? `scale(${k})` : '';
  }
  if (window.ResizeObserver) new ResizeObserver(fitPhone).observe($('cz-stage').parentElement);
  window.addEventListener('resize', fitPhone);
  window.addEventListener('hashchange', () => requestAnimationFrame(fitPhone));

  // Explore Our Services: the service modules set up in Studio (first four), then View More
  const services = () => {
    const list = (S.modules ? S.modules() : []).map(m => m.name).filter(Boolean);
    return (list.length ? list : ['Trade License', 'Property Tax', 'Water Connection', 'Birth Certificate']).slice(0, 4);
  };
  function drawPhone() {
    const h = data.hero;
    $('cz-screen').innerHTML = `
      <div class="lp-top" aria-hidden="true">
        <span class="lp-burger"></span>
        <span class="lp-mark"><svg width="16" height="14" viewBox="0 0 16 14" focusable="false"><circle cx="3" cy="3" r="2.2" fill="#F4B41A"/><circle cx="3" cy="11" r="2.2" fill="#00A3AD"/><circle cx="9" cy="7" r="2.2" fill="#0B4B66"/><circle cx="14" cy="3" r="1.6" fill="#29A8E0"/></svg>DIGIT</span>
        <span class="lp-bell"><svg width="18" height="18" viewBox="0 0 24 24" focusable="false"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="#0B0C0C"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" stroke="#0B0C0C" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>
      </div>
      <div class="lp-hero${open === 'hero' ? ' is-sel' : ''}${h.bg ? ' has-bg' : ''}" data-czp="hero"${h.bg ? ` style="background-image: linear-gradient(rgba(11,75,102,.78), rgba(11,75,102,.78)), url('${esc(h.bg)}')"` : ''}>
        <p class="lp-hero-t">${esc(h.title || 'Heading')}</p>${h.desc ? `<p class="lp-hero-d">${esc(h.desc)}</p>` : ''}
        ${h.btn ? `<span class="cz-hero-btn">${esc(h.btn)}</span>` : ''}
      </div>
      <div class="lp-content">
        <div class="cz-search${open === 'search' ? ' is-sel' : ''}" data-czp="search">${I.search}<span>${esc(data.search.text || 'Search')}</span></div>
        <div class="cz-services">
          <p class="lp-h cz-h">Explore<br><b>Our Services</b></p>
          <div class="lp-tiles cz-tiles">${services().map(n => `<div class="lp-tile cz-tile">${I.service}<span>${esc(n)}</span></div>`).join('')}</div>
          <span class="cz-more">View More ${I.down}</span>
        </div>
      </div>`;
    const sel = $('cz-screen').querySelector('.is-sel');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }
  $('cz-screen').addEventListener('click', e => { const p = e.target.closest('[data-czp]'); if (p) openItem(p.dataset.czp); });

  /* ---------- Right panel: item list -> Item Properties ---------- */
  $('cz-props').addEventListener('click', e => { const b = e.target.closest('[data-czedit]'); if (b) openItem(b.dataset.czedit); });
  const count = (k, max, v) => `${v.length}/${max}<span class="sr-only"> characters</span>`;
  const field = (id, label, value, max, attr, tipText, area) => `
    <div class="fpp-field"><span class="fp-label"><label class="fpp-label" for="${id}">${label}</label>${tipText ? tip(id + '-tip', label.toLowerCase(), tipText) : ''}</span>
      ${area
        ? `<textarea class="fp-textarea" id="${id}" maxlength="${max}" ${attr} aria-describedby="${id}-meta">${esc(value)}</textarea>`
        : `<input class="fp-input" id="${id}" type="text" autocomplete="off" maxlength="${max}" ${attr} value="${esc(value)}" aria-describedby="${id}-meta">`}
      <div class="fp-meta" id="${id}-meta"><span class="fp-error"></span><span class="fp-count" data-czcount="${id}">${count(id, max, value)}</span></div></div>`;

  /* Background image: upload a file OR add a link (same as the Service Landing Page hero) */
  let bgLink = '', bgErr = '', bgLinkErr = '';
  const isLink = v => /^https?:/i.test(v || '');
  function bgBox() {
    const bg = data.hero.bg || '', uploaded = bg.startsWith('data:'), linked = isLink(bg);
    if (linked) bgLink = bg;
    return `<div class="fpp-box"><h3 class="fpp-box-title">Hero Banner Background Image</h3>
      <div class="fpp-field"><p class="fpp-label" id="cz-bg-l">Upload image</p>
        ${uploaded
          ? `<div class="dc-logo-tile lp-bg-tile"><img src="${bg}" alt="Uploaded background image"><button type="button" class="dc-logo-x" id="cz-bg-rm" aria-label="Remove background image">${I.close}</button></div>`
          : `<div class="dc-logo-drop${linked ? ' is-disabled' : ''}" id="cz-bg-drop"${linked ? ' inert aria-disabled="true"' : ''}><span class="dc-logo-ico" aria-hidden="true">${I.upload}</span>
              <p>Drag and drop your image or <button type="button" class="dc-browse" id="cz-bg-up" aria-describedby="cz-bg-l">Browse in my files</button></p></div>
             ${linked ? '<p class="lp-off-hint">Clear the image link to upload a file instead.</p>' : ''}`}
        <p class="error" id="cz-bg-err" role="alert"${bgErr ? '' : ' hidden'}>${esc(bgErr)}</p>
        <input type="file" id="cz-bg-file" accept="image/png,image/svg+xml,image/jpeg" tabindex="-1" aria-hidden="true" hidden>
      </div>
      <p class="lp-or" aria-hidden="true"><span>or</span></p>
      <div class="fpp-field"><label class="fpp-label" for="cz-bg-link">Image link</label>
        <input class="fp-input" id="cz-bg-link" type="text" placeholder="https://" autocomplete="off" value="${esc(bgLink)}"${uploaded ? ' disabled' : ''}
               aria-describedby="cz-bg-link-msg"${bgLinkErr ? ' aria-invalid="true"' : ''}>
        <p class="${bgLinkErr ? 'error' : 'lp-off-hint'}" id="cz-bg-link-msg"${bgLinkErr || uploaded ? '' : ' hidden'}>${bgLinkErr ? esc(bgLinkErr) : 'Remove the uploaded image to add a link instead.'}</p>
      </div>
    </div>`;
  }

  function openItem(k, keepFocus) {
    open = k; drawPhone();
    const qv = $('cz-q-view'), h = data.hero;
    $('cz-list-view').hidden = true; qv.hidden = false;
    qv.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" id="cz-q-back">${I.left} Back to landing page items</button>
        <h2 class="fpp-title">Item Properties</h2>
      </div>
      <div class="fp-scroll"><div class="fpp-body">
        <p class="fpp-intro">These properties control the content of this item on the landing page.</p>
        ${k === 'hero' ? `
          <div class="fpp-box"><h3 class="fpp-box-title">Hero Banner Text</h3>
            ${field('cz-h-title', 'Heading', h.title, HL.title, 'data-czhero="title"', 'The title at the top of the citizen landing page.')}
            ${field('cz-h-desc', 'Description', h.desc, HL.desc, 'data-czhero="desc"', 'The short text under the hero banner heading.', true)}
          </div>
          <div class="fpp-box"><h3 class="fpp-box-title">Hero Banner Button</h3>
            ${field('cz-h-btn', 'Button text', h.btn, HL.btn, 'data-czhero="btn"')}
          </div>
          ${bgBox()}` : `
          <div class="fpp-box"><h3 class="fpp-box-title">Search Bar</h3>
            ${field('cz-s-text', 'Search bar text', data.search.text, SL.text, 'data-czsearch="text"')}
          </div>`}
      </div></div>`;
    qv.querySelectorAll('.tip').forEach(t => { const b2 = t.querySelector('.tip-btn');
      b2.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      b2.addEventListener('blur', () => t.classList.remove('open', 'dismissed')); });
    if (!keepFocus) $(k === 'hero' ? 'cz-h-title' : 'cz-s-text').focus();
  }
  function closeItem() {
    const k = open; open = ''; drawPhone();
    $('cz-q-view').hidden = true; $('cz-list-view').hidden = false;
    $('cz-props').querySelector(`[data-czedit="${k}"]`)?.focus();
  }
  const qv = $('cz-q-view');
  qv.addEventListener('input', e => {
    const t = e.target, hk = t.dataset.czhero, sk = t.dataset.czsearch;
    if (hk) data.hero[hk] = t.value; else if (sk) data.search[sk] = t.value; else return;
    const c = qv.querySelector(`[data-czcount="${t.id}"]`); if (c) c.innerHTML = count(t.id, t.maxLength, t.value);
    drawPhone();
  });
  const redrawHero = focusId => { const sc = qv.querySelector('.fp-scroll'), y = sc ? sc.scrollTop : 0; openItem('hero', true); const sc2 = qv.querySelector('.fp-scroll'); if (sc2) sc2.scrollTop = y; focusId && $(focusId)?.focus(); };
  function takeBg(f) {
    if (!f) return;
    if (!/^image\/(png|jpeg|svg\+xml)$/.test(f.type)) { bgErr = 'Choose a PNG, SVG or JPG file'; return redrawHero('cz-bg-up'); }
    const r = new FileReader();
    r.onload = () => { data.hero.bg = String(r.result); bgErr = ''; bgLink = ''; bgLinkErr = ''; drawPhone(); redrawHero('cz-bg-rm'); S.announce('Background image uploaded.'); };
    r.readAsDataURL(f);
  }
  function addBgLink() {
    const url = ($('cz-bg-link')?.value || '').trim(); bgLink = url;
    if (!url) { if (isLink(data.hero.bg)) { data.hero.bg = ''; drawPhone(); } bgLinkErr = ''; return redrawHero('cz-bg-link'); }
    if (!/^https?:\/\/\S+$/i.test(url)) { bgLinkErr = 'Enter a link that starts with https://'; return redrawHero('cz-bg-link'); }
    const img = new Image();
    img.onload = () => { data.hero.bg = url; bgLinkErr = ''; drawPhone(); redrawHero(); S.announce('Background image added.'); };
    img.onerror = () => { bgLinkErr = 'We couldn’t load an image from this link. Check it opens a PNG, SVG or JPG.'; redrawHero('cz-bg-link'); };
    img.src = url;
  }
  qv.addEventListener('click', e => {
    if (e.target.closest('#cz-q-back')) return closeItem();
    if (open !== 'hero') return;
    if (e.target.closest('#cz-bg-up')) return $('cz-bg-file').click();
    if (e.target.closest('#cz-bg-rm')) { data.hero.bg = ''; drawPhone(); redrawHero('cz-bg-up'); S.announce('Background image removed.'); }
  });
  qv.addEventListener('change', e => { if (e.target.id === 'cz-bg-file') { takeBg(e.target.files[0]); e.target.value = ''; } });
  qv.addEventListener('dragover', e => { const z = e.target.closest('#cz-bg-drop'); if (z && !z.hasAttribute('inert')) { e.preventDefault(); z.classList.add('is-over'); } });
  qv.addEventListener('dragleave', e => { const z = e.target.closest('#cz-bg-drop'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
  qv.addEventListener('drop', e => { const z = e.target.closest('#cz-bg-drop'); if (!z || z.hasAttribute('inert')) return; e.preventDefault(); takeBg(e.dataTransfer.files[0]); });
  qv.addEventListener('focusout', e => { if (e.target.id === 'cz-bg-link' && (e.target.value.trim() !== (isLink(data.hero.bg) ? data.hero.bg : ''))) addBgLink(); });
  qv.addEventListener('keydown', e => { if (e.target.id === 'cz-bg-link' && e.key === 'Enter') { e.preventDefault(); addBgLink(); } });

  $('cz-save').addEventListener('click', () => { save(); S.toast('Landing page saved'); S.announce('Landing page saved.'); });

  window.StudioCitizenLanding = {
    render(focus) {
      drawPhone(); requestAnimationFrame(fitPhone);
      if (focus) $('cz-title').focus();
    },
  };
})();
