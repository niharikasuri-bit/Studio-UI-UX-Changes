/* ==========================================================
   Form builder (Edit Form) — Studio Prototype
   Route: #/module/<id>/form   (rendered by index.html's router)
   Data:  module.form = { sections: [{ id, type, heading, description, fields: [...] }] }
   ========================================================== */
(() => {
  const S = window.Studio;
  const { esc } = S;
  const $ = id => document.getElementById(id);

  const TYPE_LABEL = { text: 'Text', mobile: 'Mobile', email: 'Email', dropdown: 'Dropdown', number: 'Number', document: 'Document upload',
                       docUpload: 'Document upload', docTemplate: 'Document download & upload' };

  /* Section types offered in "Add Section" (copy from the Studio screenshot) */
  const SECTION_TYPES = [
    { type: 'custom', title: 'Custom section', desc: 'Configure a custom section with a heading, description, and fields as required.' },
    { type: 'address', title: 'Address details', desc: 'Add address-related fields such as house number, street, locality, city, and pin code.' },
    { type: 'applicant', title: 'Applicant details', desc: 'Configure applicant information such as name, mobile number, email, and other personal details.', single: true },
    { type: 'document', title: 'Document details', desc: 'Configure document upload fields to collect supporting documents from applicants.' },
  ];

  const FILE_TYPES = [['pdf', 'PDF'], ['jpg', 'JPG'], ['png', 'PNG'], ['doc', 'DOC / DOCX'], ['xls', 'XLS / XLSX']];
  let uid = 0;
  const newId = p => `${p}-${Date.now().toString(36)}-${(uid++).toString(36)}`;
  const field = (label, type, required = false) => ({ id: newId('f'), label, type, required });

  function makeSection(type, form) {
    if (type === 'applicant') return { id: newId('s'), type, heading: 'Applicant Details', description: 'Please provide your personal information',
      fields: [field('Name', 'text', true), field('Mobile Number', 'mobile', true), field('Email', 'email'), field('Gender', 'dropdown')] };
    if (type === 'address') return { id: newId('s'), type, heading: 'Address Details', description: 'Please provide your address',
      fields: [field('House Number', 'text'), field('Street', 'text'), field('Locality', 'text', true), field('City', 'text', true), field('Pin Code', 'number', true)] };
    if (type === 'document') return { id: newId('s'), type, heading: 'Document Details', description: 'Please upload required documents',
      fields: [field('Identity Proof', 'docUpload', true), field('Declaration Form', 'docTemplate', true)] };
    const n = (form ? form.sections.filter(s => s.type === 'custom').length : 0) + 1;
    return { id: newId('s'), type: 'custom', heading: `Section ${n}`, description: '', fields: [] };
  }

  function ensureForm(m) {
    if (!m.form || !Array.isArray(m.form.sections)) {
      const doc = makeSection('document'); doc.heading = 'Document Section';
      m.form = { sections: [makeSection('applicant'), makeSection('address'), doc] };
      m.form.sections.push(makeSection('custom', m.form));
      S.saveModules();
    }
    return m.form;
  }

  let mod = null, form = null, active = 0, selField = null;
  const uploads = {};   // fid -> File chosen in the canvas preview (preview only, not saved)
  const LIMITS = { heading: 20, desc: 150 };   // character limits for the section heading / description

  const ICON = {
    back: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>',
    guides: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="6" y="3" width="15" height="15" rx="2"/><path d="M3 7v12a2 2 0 0 0 2 2h12"/><path d="m11 8 5 3-5 3z"/></svg>',
    plus: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
    left: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    right: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    up: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 6l8 10H4z"/></svg>',
    down: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 18 4 8h16z"/></svg>',
    grip: '<svg aria-hidden="true" focusable="false" width="12" height="20" viewBox="0 0 12 20" fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></svg>',
    info: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    add: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    // Same bin as the workflow designer (ICONS.trash there)
    trash: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    upload: '<svg aria-hidden="true" focusable="false" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 5 10h4v6h6v-6h4z"/><rect x="5" y="18.5" width="14" height="2" rx="1"/></svg>',
    uploadSm: '<svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V5M7 10l5-5 5 5M5 20h14"/></svg>',
    pencilU: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg>',
    binX: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M9 6V4h6v2M6 6l1 14h10l1-14"/><path d="M10 11l4 4M14 11l-4 4"/></svg>',
    logic: '<svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a4 4 0 0 0 4 4h8M14 10l4 4-4 4"/></svg>',
    close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  const tip = (id, label, text) => `
    <span class="tip">
      <button type="button" class="tip-btn" aria-label="About ${label}" aria-describedby="${id}">${ICON.info}</button>
      <span class="tip-bubble" role="tooltip" id="${id}">${text}</span>
    </span>`;

  /* ---------- Shell (built once) ---------- */
  const view = $('view-form');
  view.innerHTML = `
    <div class="subbar">
      <a class="btn btn-secondary" id="form-back-top" href="#">${ICON.back} Back to Module Dashboard</a>
      <button type="button" class="btn btn-secondary">${ICON.guides} Tutorials and Guides</button>
    </div>
    <div class="form-body">
      <div class="form-main" id="form-main">
        <div class="form-head">
          <h1 class="page-title" id="form-title" tabindex="-1"></h1>
          <button type="button" class="btn btn-secondary btn-add-section" id="add-section-btn" aria-haspopup="dialog">${ICON.plus} Add Section</button>
        </div>
        <div class="form-canvas">
          <nav aria-label="Form sections"><ol class="steps" id="form-steps"></ol></nav>
          <section class="section-preview" id="section-preview" aria-live="off"></section>
        </div>
        <div class="form-pager">
          <button type="button" class="pager-btn" id="pager-prev">${ICON.left}<span class="sr-only">Previous section</span></button>
          <span class="pager-label" id="pager-label"></span>
          <button type="button" class="pager-btn" id="pager-next">${ICON.right}<span class="sr-only">Next section</span></button>
        </div>
      </div>

      <aside class="form-panel" aria-label="Properties">
       <div class="panel-view" id="section-props">
        <div class="fp-head"><h2 class="fp-title" id="fp-title"></h2></div>
        <div class="fp-scroll">
          <div class="fp-section">
            <div class="fp-field">
              <span class="fp-label"><label for="fp-heading">Heading</label>${tip('tip-heading', 'heading', 'The title shown at the top of this section of the form.')}</span>
              <input class="fp-input" id="fp-heading" type="text" autocomplete="off" maxlength="${LIMITS.heading}" aria-describedby="fp-heading-meta" />
              <div class="fp-meta" id="fp-heading-meta"><span class="fp-error" id="fp-heading-err"></span><span class="fp-count" id="fp-heading-count"></span></div>
            </div>
            <div class="fp-field">
              <span class="fp-label"><label for="fp-desc">Description</label>${tip('tip-desc', 'description', 'Short instructions shown under the heading.')}</span>
              <textarea class="fp-textarea" id="fp-desc" maxlength="${LIMITS.desc}" aria-describedby="fp-desc-meta"></textarea>
              <div class="fp-meta" id="fp-desc-meta"><span class="fp-error" id="fp-desc-err"></span><span class="fp-count" id="fp-desc-count"></span></div>
            </div>
          </div>
          <div class="fp-section">
            <h3 class="fp-subtitle" id="fp-fields-title">Section fields ${tip('tip-fields', 'section fields', 'Section fields are the inputs in this section of the form, such as name or mobile number, that applicants fill in.')}</h3>
            <ul class="field-list" id="field-list" aria-labelledby="fp-fields-title"></ul>
            <button type="button" class="btn btn-secondary fp-add-field" id="add-field-btn">${ICON.add} Add Field</button>
          </div>
        </div>
        <div class="fp-foot"><button type="button" class="btn btn-secondary" id="delete-section-btn">${ICON.trash} Delete Section</button></div>
       </div>
       <div class="panel-view" id="field-props" hidden></div>
      </aside>
    </div>
    <footer class="form-foot">
      <a class="btn btn-secondary" id="form-back" href="#">${ICON.left} Back</a>
      <button type="button" class="btn btn-primary" id="form-save">Save</button>
    </footer>

    <dialog class="modal dlg-logic" id="logic-dialog" aria-labelledby="lg-title">
      <form id="lg-form" novalidate>
        <div class="lg-head">
          <h2 class="lg-title" id="lg-title">Display Logic</h2>
          <button type="button" class="icon-btn" data-close aria-label="Close">${ICON.close}</button>
        </div>
        <div class="lg-body" id="lg-body"></div>
        <div class="lg-foot">
          <button type="button" class="btn btn-secondary" data-close>Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </dialog>

    <dialog class="modal pfc" id="del-section-dialog" aria-labelledby="ds-title" aria-describedby="ds-desc">
      <button type="button" class="icon-btn pfc-close" data-close aria-label="Close">${ICON.close}</button>
      <div class="pfc-icon" aria-hidden="true"><svg viewBox="0 0 48 44" width="48" height="48" focusable="false"><path d="M24 2L46 42H2z" fill="#B91900"/><rect x="21.5" y="15" width="5" height="15" rx="1.5" fill="#fff"/><circle cx="24" cy="35.5" r="2.8" fill="#fff"/></svg></div>
      <h2 class="pfc-title" id="ds-title"></h2>
      <p class="pfc-desc" id="ds-desc"></p>
      <div class="pfc-actions">
        <button type="button" class="btn btn-secondary" data-close id="ds-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="ds-confirm">Delete</button>
      </div>
    </dialog>

    <dialog class="modal add-section" id="add-section-dialog" aria-labelledby="as-title">
      <div class="as-head">
        <h2 class="modal-title" id="as-title">Add Section</h2>
        <button type="button" class="icon-btn modal-close" data-close aria-label="Close" style="top:20px;right:16px">${ICON.close}</button>
      </div>
      <div class="as-list" id="as-list"></div>
      <div class="as-foot"><button type="button" class="btn btn-secondary" data-close>Cancel</button></div>
    </dialog>`;

  /* Tooltips in this view: tap toggles (Esc is handled globally in index.html) */
  view.querySelectorAll('.tip').forEach(t => {
    const b = t.querySelector('.tip-btn');
    b.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
    t.addEventListener('mouseleave', () => t.classList.remove('dismissed'));
    b.addEventListener('blur', () => t.classList.remove('open', 'dismissed'));
  });

  /* ---------- Rendering ---------- */
  function previewField(f) {
    const id = `pv-${f.id}`;
    const req = f.required ? ' aria-required="true"' : '';
    const label = `<label class="pf-label" for="${id}">${esc(f.label)}${f.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</label>`;
    const help = f.help && f.help.on && f.help.text ? `<p class="pf-help" id="${id}-help">${esc(f.help.text)}</p>` : '';
    const hd = help ? ` aria-describedby="${id}-help"` : '';
    let control;
    switch (f.type) {
      case 'mobile':
        control = `<div class="pf-prefix"><span aria-hidden="true">+91</span><input class="pf-input" id="${id}" type="tel" inputmode="numeric" autocomplete="tel-national"${req} aria-describedby="${id}-cc"><span class="sr-only" id="${id}-cc">Country code +91</span></div>`; break;
      case 'email':
        control = `<input class="pf-input" id="${id}" type="email" autocomplete="email"${req}>`; break;
      case 'number':
        control = `<input class="pf-input" id="${id}" type="text" inputmode="numeric"${req}>`; break;
      case 'dropdown':
        { const items = f.options && f.options.source === 'manual' ? f.options.items.filter(x => x.trim()) : [];
          control = `<select class="pf-input pf-select" id="${id}"${req}${hd}><option value=""></option>${items.map(o => `<option>${esc(o)}</option>`).join('')}</select>`; }
        break;
      case 'document':
      case 'docUpload':
      case 'docTemplate': {
        // Document card (Studio reference): title, optional Download Template, dashed drop zone
        const tmpl = f.type === 'docTemplate'
          ? `<button type="button" class="btn btn-secondary pf-doc-tmpl" data-tmpl="${f.id}" aria-describedby="${id}-title">${ICON.download} Download Template</button>` : '';
        return `<div class="pf pf-doc${selField === f.id ? ' is-selected' : ''}" data-fid="${f.id}">
          <div class="pf-doc-head">
            <span class="pf-doc-title" id="${id}-title">${esc(f.label)}${f.required ? ' <span class="req" aria-hidden="true">*</span>' : ''}</span>${tmpl}
          </div>
          <div class="pf-drop">
            <span class="pf-drop-icon" aria-hidden="true">${ICON.upload}</span>
            <span class="pf-drop-text">Drag and drop your file or
              <label class="pf-browse" for="${id}">Browse in my files</label></span>
            ${f.doc && f.doc.on && f.doc.types.length ? `<span class="pf-drop-meta">Accepted: ${f.doc.types.map(x => (FILE_TYPES.find(t => t[0] === x) || [x, x])[1]).join(', ')}</span>` : ''}
            <input class="sr-only" type="file" id="${id}"${req} aria-describedby="${id}-title" data-upload="${f.id}"${f.doc && f.doc.on && f.doc.types.length ? ` accept="${f.doc.types.map(x => ({ pdf: '.pdf', jpg: '.jpg,.jpeg', png: '.png', doc: '.doc,.docx', xls: '.xls,.xlsx' })[x]).join(',')}"` : ''}>
          </div>
          ${uploads[f.id] ? fileRow(f.id, uploads[f.id]) : ''}
        </div>`;
      }
      default:
        control = `<input class="pf-input" id="${id}" type="text"${f.label === 'Name' ? ' autocomplete="name"' : ''}${req}>`;
    }
    if (hd && !control.includes('aria-describedby')) control = control.replace(/<(input|select)\b/, `<$1${hd}`);
    return `<div class="pf${selField === f.id ? ' is-selected' : ''}" data-fid="${f.id}">${label}${control}${help}</div>`;
  }

  // Uploaded file row (Studio reference): file icon, name, Re-Upload, Download, remove ×
  function fileRow(fid, file) {
    const ext = (file.name.split('.').pop() || 'file').slice(0, 4).toLowerCase();
    return `<div class="pf-file">
      <span class="pf-file-icon" aria-hidden="true"><svg width="32" height="40" viewBox="0 0 32 40"><path d="M3 1h18l8 8v28a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" fill="#FCEDEA" stroke="#E7B7AE"/><path d="M21 1v8h8" fill="#F6D5CE" stroke="#E7B7AE"/><rect x="-1" y="22" width="26" height="11" rx="2" fill="#B91900"/><text x="12" y="30.5" text-anchor="middle" font-family="Roboto, sans-serif" font-size="7.5" font-weight="700" fill="#fff">.${esc(ext)}</text></svg></span>
      <span class="pf-file-name" title="${esc(file.name)}">${esc(file.name)}</span>
      <span class="pf-file-actions">
        <button type="button" class="btn btn-secondary" data-reup="${fid}">${ICON.uploadSm} Re-Upload</button>
        <button type="button" class="btn btn-secondary" data-dl="${fid}">${ICON.download} Download</button>
      </span>
      <button type="button" class="pf-file-x" data-rm="${fid}" aria-label="Remove ${esc(file.name)}">${ICON.close}</button>
    </div>`;
  }

  function renderSteps() {
    $('form-steps').innerHTML = form.sections.map((s, i) => `
      <li class="${i <= active ? 'reached' : ''}">
        <button type="button" class="step-btn" data-i="${i}"${i === active ? ' aria-current="step"' : ''}>
          <span class="step-num" aria-hidden="true">${i + 1}</span>
          <span class="step-label"><span class="sr-only">Section ${i + 1}: </span>${esc(s.heading || 'Untitled section')}</span>
        </button>
      </li>`).join('');
  }

  function renderPreview() {
    const s = form.sections[active];
    const shown = s.fields.filter(f => f.fixed || f.enabled !== false);   // fixed fields can't be hidden
    $('section-preview').innerHTML = `
      <h2 class="sp-title">${esc(s.heading || 'Untitled section')}</h2>
      ${s.description ? `<p class="sp-desc">${esc(s.description)}</p>` : ''}
      ${shown.length ? `<div class="sp-fields">${shown.map(previewField).join('')}</div>` : ''}
      <button type="button" class="add-dashed canvas-add-field" id="canvas-add-field">${ICON.add} Add Field</button>`;
    $('pager-label').textContent = s.heading || 'Untitled section';
    $('pager-prev').disabled = active === 0;
    $('pager-next').disabled = active === form.sections.length - 1;
  }

  function renderPanel() {
    const s = form.sections[active];
    $('fp-title').textContent = s.heading || 'Untitled section';
    $('fp-heading').value = s.heading;
    $('fp-desc').value = s.description;
    updateCount('heading'); updateCount('desc');
    const only = form.sections.length < 2;
    const delBtn = $('delete-section-btn');
    delBtn.disabled = only;
    delBtn.title = only ? 'A form needs at least one section' : '';
    renderFields();
  }

  function renderFields() {
    const s = form.sections[active], n = s.fields.length;
    $('field-list').innerHTML = n ? s.fields.map((f, i) => `
      <li class="field-card${f.enabled === false && !f.fixed ? ' is-off' : ''}${selField === f.id ? ' is-selected' : ''}" draggable="true" data-i="${i}" data-fid="${f.id}">
        <span class="grip-wrap">
          <button type="button" class="grip" data-grip="${i}" aria-haspopup="menu" aria-expanded="false"
                  aria-label="Reorder ${esc(f.label)}" title="Drag, or click to move">${ICON.grip}</button>
        </span>
        <span class="field-info">
          <span class="field-name">${esc(f.label)}${f.required ? '<span class="sr-only"> (required)</span>' : ''}</span>
          <span class="type-tag">${TYPE_LABEL[f.type] || 'Text'}</span>
        </span>
        <span class="field-actions">
          ${f.custom
            /* Fields you added can be deleted; required standard fields (Name, Mobile Number) are fixed;
               other standard fields can only be switched off */
            ? `<button type="button" class="del-btn" data-del="${i}" aria-label="Delete ${esc(f.label)}">${ICON.trash}</button>`
            : f.fixed ? ''
            : `<button type="button" class="switch" role="switch" data-toggle="${i}" aria-checked="${f.enabled !== false}"
                  aria-label="Show ${esc(f.label)} in the form"><span class="switch-knob" aria-hidden="true"></span></button>`}
        </span>
      </li>`).join('') : `<li class="field-empty"><svg class="field-empty-ico" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h4l2 3h4l2-3h4M4 13l2.5-7h11L20 13v5a1 1 0 01-1 1H5a1 1 0 01-1-1z"/></svg><span>You don’t have any fields yet.</span></li>`;
  }

  function renderAll() { form.sections.forEach(sec => sec.fields.forEach(normField)); renderSteps(); renderPreview(); renderPanel(); }

  function select(i, focusStep) {
    const next = Math.max(0, Math.min(form.sections.length - 1, i));
    if (next !== active) { selField = null; closeFieldProps(false); }
    active = next;
    renderAll();
    if (focusStep) $('form-steps').querySelector(`[data-i="${active}"]`).focus();
  }

  /* ---------- Selected field: orange outline + tint on the canvas, matching card in the panel ---------- */
  function setSelected(fid, scroll) {
    selField = fid;
    openFieldProps();
    document.querySelectorAll('#section-preview .pf, #field-list .field-card').forEach(el =>
      el.classList.toggle('is-selected', el.dataset.fid === fid));
    if (scroll) {
      document.querySelector(`#section-preview .pf[data-fid="${fid}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      document.querySelector(`#field-list .field-card[data-fid="${fid}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
  // Canvas: clicking or tabbing into a field selects it
  ['click', 'focusin'].forEach(ev => $('section-preview').addEventListener(ev, e => {
    const pf = e.target.closest('.pf'); if (pf && pf.dataset.fid !== selField) setSelected(pf.dataset.fid, true);
  }));
  // Panel: clicking a card (not its switch / handle / delete) selects the field
  $('field-list').addEventListener('click', e => {
    if (e.target.closest('button, .move-menu')) return;
    const card = e.target.closest('.field-card'); if (card) setSelected(card.dataset.fid, true);
  });

  /* ======================================================
     Field properties (Elements | Logic) — opens when a field is selected
     ====================================================== */
  const RULES = {
    none:    { label: 'None' },
    numbers: { label: 'Numbers Only', hint: 'This field accepts numbers only (0–9).', pattern: '^[0-9]+$', allow: '12345', block: '12a45', error: 'Please enter numbers only' },
    letters: { label: 'Letters Only', hint: 'This field accepts letters and spaces only.', pattern: '^[A-Za-z ]+$', allow: 'Hello World', block: 'Hello 123', error: 'Please enter letters only' },
    alnum:   { label: 'Alphanumeric', hint: 'This field accepts letters, numbers and spaces. Symbols such as @, # or ! are not accepted.', pattern: '^[A-Za-z0-9 ]+$', allow: 'Hello 123', block: 'Hello 123!', error: 'Please enter letters and numbers only' },
    email:   { label: 'Email', hint: 'This field accepts a complete email address only, with an @ and a domain.', pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', allow: 'name@example.com', block: 'name@example', error: 'Please enter a valid email address' },
    custom:  { label: 'Custom' },   // no info card for Custom
  };
  // What each rule lets applicants type, shown as character-type chips (not sample answers)
  const RULE_CHARS = {
    numbers: { yes: ['Digits 0–9'], no: ['Letters', 'Spaces', 'Symbols'] },
    letters: { yes: ['Letters', 'Spaces'], no: ['Digits 0–9', 'Symbols'] },
    alnum:   { yes: ['Letters', 'Digits 0–9', 'Spaces'], no: ['Symbols'] },
    email:   { yes: ['Letters', 'Digits 0–9', '@', '.'], no: ['Spaces'] },
  };
  const DATA_SOURCES = ['Gender', 'Country', 'State', 'District'];

  function normField(f) {
    if (f.fixed === undefined) f.fixed = !f.custom && !!f.required;
    if (!f.doc && ['document', 'docUpload', 'docTemplate'].includes(f.type)) f.doc = { on: false, types: ['pdf', 'jpg', 'png'] };
    if (!f.help) f.help = { on: false, text: '' };
    if (f.error === undefined) f.error = 'This field is required';
    if (!f.options) f.options = { source: 'manual', data: '', items: f.type === 'dropdown' && /gender/i.test(f.label) ? ['Female', 'Male', 'Transgender'] : [''] };
    if (f.logic && f.logic.validOn === undefined) f.logic.validOn = f.logic.rule && f.logic.rule !== 'none';
    if (!f.logic) f.logic = { count: { on: false, min: '', max: '' }, rule: 'none', pattern: '', ruleError: '', dep: { on: false, field: '', value: '' } };
    return f;
  }
  const curField = () => form.sections[active].fields.find(f => f.id === selField);
  let fieldTab = 'elements', tryVal = '', editLogic = -1;
  function tryResult(f) {
    const L = f.logic;
    if (!tryVal || !L.pattern) return '';
    let re; try { re = new RegExp(L.pattern); } catch (e) { return ''; }
    if (re.test(tryVal)) return `<span class="try-ok"><span class="ex-ico ok" aria-hidden="true">✓</span>Accepted</span>`;
    const msg = L.ruleError ? `“${esc(L.ruleError)}”` : 'your error message';
    return `<span class="try-bad"><span class="ex-ico bad" aria-hidden="true">✗</span><span>Not accepted. The applicant sees: ${msg}</span></span>`;
  }

  // DIGIT-style dropdown (button + listbox), keyboard: ↑ ↓ Home End Enter Esc
  function sel(key, id, labelId, options, value, opts = {}) {
    const cur = options.find(o => o.v === value);
    return `<div class="sel${opts.disabled ? ' is-disabled' : ''}" data-sel="${key}">
      <button type="button" class="sel-btn" id="${id}" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="${labelId} ${id}"${opts.describedby ? ` aria-describedby="${opts.describedby}"` : ''}${opts.disabled ? ' disabled' : ''}>
        <span class="sel-val${cur ? '' : ' is-ph'}">${esc(cur ? cur.t : (opts.placeholder || 'Select'))}</span>
        <svg aria-hidden="true" focusable="false" width="12" height="12" viewBox="0 0 12 12"><path d="M2 4l4 4 4-4z" fill="currentColor"/></svg>
      </button>
      <ul class="sel-list" role="listbox" tabindex="-1" aria-labelledby="${labelId}" hidden>
        ${options.map((o, i) => `<li role="option" id="${id}-o${i}" data-v="${esc(o.v)}" aria-selected="${o.v === value}"${o.d ? ' class="has-desc"' : ''}>
          <span class="opt-t">${esc(o.t)}</span>${o.d ? `<span class="opt-d">${esc(o.d)}</span>` : ''}</li>`).join('')}
      </ul>
    </div>`;
  }
  const sw = (act, on, label, disabled, why) => {
    const btn = (attrs) => `<button type="button" class="switch" role="switch" data-act="${act}" aria-checked="${on}" aria-label="${label}"${attrs}><span class="switch-knob" aria-hidden="true"></span></button>`;
    if (disabled && why) return `<span class="tip sw-tip">${btn(` aria-disabled="true" aria-describedby="why-${act}"`)}<span class="tip-bubble" role="tooltip" id="why-${act}">${why}</span></span>`;
    return btn(disabled ? ' disabled' : '');
  };
  const box = (inner, cls = '') => `<div class="fpp-box ${cls}">${inner}</div>`;
  const inp = (id, label, value, act, extra = '') => `<div class="fpp-field">
      <label class="fpp-label" for="${id}">${label}</label>
      <input class="fp-input" id="${id}" type="text" value="${esc(value || '')}" data-input="${act}" autocomplete="off"${extra}>
    </div>`;

  function elementsHTML(f) {
    const typeOpts = Object.keys(TYPE_LABEL).filter(k => k !== 'document').map(k => ({ v: k, t: TYPE_LABEL[k] }));
    let html = `<p class="fpp-intro">In Elements you can edit form labels, heading and fields. You can customise each field's name, type, and behaviour to match your service needs.</p>`;
    html += box(`<span class="fpp-label" id="fpp-type-l">Field type</span>${sel('type', 'fpp-type', 'fpp-type-l', typeOpts, f.type === 'document' ? 'docUpload' : f.type, { disabled: true })}`, 'is-disabled');
    html += box(inp('fpp-label', 'Label', f.label, 'label', ' maxlength="60"'));
    html += box(`<div class="fpp-box-head"><h3 class="fpp-box-title">Required</h3>${sw('mandatory', !!f.required, 'Required', f.fixed || f.logic.dep.on, f.logic.dep.on && !f.fixed ? 'This field is shown only to some applicants, so it can\u2019t be required. Turn off Dependent Field to make it required.' : '')}</div>
`);
    if (f.type === 'docTemplate') {
      // Template details for "Document download & upload": grey box with a white inner container
      const tp = f.template || (f.template = { key: '', url: '' });
      html += box(`<h3 class="fpp-box-title">Template details</h3>
        <div class="fpp-inner">
          <div class="fpp-field"><label class="fpp-label" for="fpp-tkey">Template PDF key</label>
            <input class="fp-input" id="fpp-tkey" type="text" value="${esc(tp.key)}" data-input="tplKey" autocomplete="off" spellcheck="false"></div>
        </div>
        <div class="fpp-inner">
          <div class="fpp-field"><label class="fpp-label" for="fpp-turl">Template download URL</label>
            <input class="fp-input" id="fpp-turl" type="url" inputmode="url" value="${esc(tp.url)}" data-input="tplUrl" autocomplete="off" spellcheck="false" placeholder="https://"${tplErr ? ' aria-invalid="true" aria-describedby="fpp-turl-err"' : ''}>
            <p class="fp-error" id="fpp-turl-err"${tplErr ? '' : ' hidden'}>${tplErr}</p></div>
        </div>`);
    }
    if (f.type === 'dropdown') {
      const o = f.options, data = o.source === 'data';
      html += box(`<h3 class="fpp-box-title" id="fpp-resp">Response options</h3>
        <div class="rc-group" role="radiogroup" aria-labelledby="fpp-resp">
          <div class="rc${data ? ' is-on' : ''}">
            <label class="rc-head"><input type="radio" name="fpp-src" value="data" data-act="source"${data ? ' checked' : ''}><span class="rc-dot" aria-hidden="true"></span>Pull from existing data</label>
            ${data ? `<div class="fpp-field"><span class="fpp-label" id="fpp-ds-l">Data Source</span>${sel('data', 'fpp-ds', 'fpp-ds-l', DATA_SOURCES.map(d => ({ v: d, t: d })), o.data, { placeholder: 'Select' })}</div>` : ''}
          </div>
          <div class="rc${!data ? ' is-on' : ''}">
            <label class="rc-head"><input type="radio" name="fpp-src" value="manual" data-act="source"${!data ? ' checked' : ''}><span class="rc-dot" aria-hidden="true"></span>Enter options manually</label>
            ${!data ? `<div class="opt-list">${o.items.map((it, i) => `
              <div class="fpp-field">
                <label class="fpp-label" for="fpp-opt-${i}">Option ${i + 1}</label>
                <div class="opt-row">
                  <input class="fp-input" id="fpp-opt-${i}" type="text" value="${esc(it)}" placeholder="Enter an option" data-input="opt" data-i="${i}" autocomplete="off">
                  ${o.items.length > 1 ? `<button type="button" class="del-btn" data-act="delOpt" data-i="${i}" aria-label="Delete option ${i + 1}">${ICON.trash}</button>` : ''}
                </div>
              </div>`).join('')}
              <button type="button" class="btn btn-secondary opt-add" data-act="addOpt">${ICON.plus} Add option</button>
            </div>` : ''}
          </div>
        </div>`);
    }
    return html;
  }

  // A template URL must be a full http(s) web address
  const validUrl = u => { try { const x = new URL(u); return (x.protocol === 'https:' || x.protocol === 'http:') && !!x.hostname.includes('.'); } catch (e) { return false; } };
  let tplErr = '';
  const isDoc = f => ['document', 'docUpload', 'docTemplate'].includes(f.type);
  // Settings that make sense per field type
  const LOGIC_FOR = f => isDoc(f) ? { files: true }
    : f.type === 'text' ? { count: true, valid: true }
    : f.type === 'number' ? { count: true }
    : {};   // mobile, email (format already checked), dropdown (fixed options)
  function logicHTML(f) {
    const L = f.logic, r = RULES[L.rule] || RULES.none, use = LOGIC_FOR(f);
    let html = `<p class="fpp-intro">Define the rules and behaviours that control how this field responds to user input. Add visibility conditions, dependencies, validations, and expressions to make your form dynamic.</p>`;
    if (use.files) {
      // "File validation" switch; when on, choose the accepted file types (no size limit)
      const d = f.doc || (f.doc = { on: false, types: ['pdf', 'jpg', 'png'] });
      html += box(`<div class="fpp-box-head"><h3 class="fpp-box-title">File validation</h3>${sw('fileValid', !!d.on, 'File validation')}</div>
        ${d.on ? `<fieldset class="fpp-fs fpp-inner"><legend class="fpp-label">Accepted file types</legend>
          <div class="ft-grid">${FILE_TYPES.map(([v, t]) => `
            <label class="ft-check"><input type="checkbox" value="${v}" data-act="ftype"${d.types.includes(v) ? ' checked' : ''}><span class="ft-box" aria-hidden="true"></span>${t}</label>`).join('')}
          </div>${d.types.length ? '' : '<p class="fp-error">Select at least one file type.</p>'}</fieldset>` : ''}`);
    }
    if (use.count) html += box(`<div class="fpp-box-head"><h3 class="fpp-box-title">Set character count</h3>${sw('count', L.count.on, 'Set character count')}</div>
      ${L.count.on ? `<div class="fpp-two">
        ${inp('fpp-min', 'Minimum', L.count.min, 'min', ' inputmode="numeric"')}
        ${inp('fpp-max', 'Maximum', L.count.max, 'max', ' inputmode="numeric"')}</div>` : ''}`);
    const vOn = !!L.validOn;
    let rule = `<div class="fpp-box-head"><h3 class="fpp-box-title">Field validation</h3>${sw('valid', vOn, 'Field validation')}</div>`;
    // The selected rule's plain description lives in the ⓘ tooltip next to "Validation rule"
    if (vOn) rule += `<div class="fpp-field"><span class="fpp-label fpp-with-tip"><span id="fpp-rule-l">Validation rule</span>${tip('tip-vrule', 'validation rule', 'A validation rule sets what applicants are allowed to type in this field.')}</span>
      ${sel('rule', 'fpp-rule', 'fpp-rule-l', Object.keys(RULES).filter(k => k !== 'none').map(k => ({ v: k, t: RULES[k].label })), L.rule, { placeholder: 'Select a rule' })}
</div>`;
    if (vOn && L.rule !== 'none') {
      let bad = false; try { if (L.pattern) new RegExp(L.pattern); } catch (e) { bad = true; }
      rule += `<div class="fpp-field">
          <span class="fpp-label fpp-with-tip"><label for="fpp-pat">Pattern</label>${tip('tip-pat', 'pattern', 'A pattern is a rule for the characters an answer may contain.')}</span>
          <input class="fp-input" id="fpp-pat" type="text" value="${esc(L.pattern)}" data-input="pattern" autocomplete="off" spellcheck="false"${bad ? ' aria-invalid="true" aria-describedby="fpp-pat-err"' : ''}>
          ${bad ? '<p class="fp-error" id="fpp-pat-err">Enter a valid pattern.</p>' : ''}
        </div>`;
      // Option A: the rule in one sentence, in a DIGIT info card
      if (r.hint) rule += `<div class="fpp-rule-box" id="fpp-rule-hint">
          <svg class="rb-ico" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6M12 7.5v.01" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>
          <p>${esc(r.hint)}</p>
        </div>`;

      rule += `<div class="fpp-field">
          <span class="fpp-label fpp-with-tip"><label for="fpp-rerr">Error message</label>${tip('tip-rerr', 'error message', 'The message applicants see when their answer doesn’t match the rule.')}</span>
          <input class="fp-input" id="fpp-rerr" type="text" value="${esc(L.ruleError)}" data-input="ruleError" autocomplete="off">
        </div>`;

    }
    if (use.valid) html += box(rule);
    const others = form.sections[active].fields.filter(x => x.id !== f.id).map(x => ({ v: x.id, t: x.label }));
    const items = (L.dep.items || (L.dep.items = [])).map((it, i) => (L.dep.items[i] = typeof it === 'string' ? { name: it, conds: [] } : it));
    html += box(`<div class="fpp-box-head"><h3 class="fpp-box-title">Dependent Field</h3>${sw('dep', L.dep.on, 'Dependent Field', !!f.required, 'This field is required, so every applicant must see it. Turn off Required to show it only to some applicants.')}</div>
      ${L.dep.on ? `<div class="dl-card">
        <h4 class="dl-title fpp-with-tip" id="dl-title">Display Logic ${tip('tip-dl', 'display logic', 'Display logic decides when this field is shown to applicants, based on their answers to other fields.')}</h4>
        ${items.length ? `<ul class="dl-list" aria-labelledby="dl-title">${items.map((it, i) => `
          <li class="dl-item">
            <span class="dl-name">${esc(it.name)}</span>
            <button type="button" class="dl-btn" data-act="editLogic" data-i="${i}" aria-label="Edit ${esc(it.name)}" aria-haspopup="dialog">${ICON.pencilU}</button>
            <button type="button" class="dl-btn" data-act="delLogic" data-i="${i}" aria-label="Delete ${esc(it.name)}">${ICON.binX}</button>
          </li>`).join('')}</ul>` : ''}
        <button type="button" class="btn btn-secondary dl-add" data-act="addLogic" aria-haspopup="dialog">${ICON.add} Add Display Logic</button>
      </div>` : ''}`);
    return html;
  }

  function renderFieldProps(focusSel) {
    const f = curField(); if (!f) return closeFieldProps(false);
    normField(f);
    const fp = $('field-props');
    const scrollTop = fp.querySelector('.fp-scroll')?.scrollTop || 0;
    fp.innerHTML = `
      <div class="fpp-top">
        <button type="button" class="btn btn-secondary fpp-back" data-act="back">${ICON.left} Back to page properties</button>
        <h2 class="fpp-title fpp-with-tip" id="fpp-title">Field properties ${tip('tip-fpp', 'field properties', 'Field properties are the settings for one field: what it is called, whether it must be filled in, and the rules for its answer.')}</h2>
      </div>
      <div class="fpp-tabs-wrap">
        <div class="fpp-tabs" role="tablist" aria-labelledby="fpp-title">
          <button type="button" role="tab" id="fpp-tab-elements" aria-controls="fpp-body" aria-selected="${fieldTab === 'elements'}" tabindex="${fieldTab === 'elements' ? 0 : -1}" data-tab="elements">Elements</button>
          <button type="button" role="tab" id="fpp-tab-logic" aria-controls="fpp-body" aria-selected="${fieldTab === 'logic'}" tabindex="${fieldTab === 'logic' ? 0 : -1}" data-tab="logic">Logic</button>
        </div>
      </div>
      <div class="fp-scroll"><div class="fpp-body" id="fpp-body" role="tabpanel" aria-labelledby="fpp-tab-${fieldTab}">
        ${fieldTab === 'elements' ? elementsHTML(f) : logicHTML(f)}
      </div></div>`;
    fp.querySelector('.fp-scroll').scrollTop = scrollTop;
    bindTips(fp);
    if (focusSel) fp.querySelector(focusSel)?.focus();
  }
  function bindTips(scope) {
    scope.querySelectorAll('.tip').forEach(t => {
      const b = t.querySelector('.tip-btn'); if (!b) return;   // locked switches show their reason on hover/focus only
      b.addEventListener('click', () => { t.classList.remove('dismissed'); t.classList.toggle('open'); });
      t.addEventListener('mouseleave', () => t.classList.remove('dismissed'));
      b.addEventListener('blur', () => t.classList.remove('open', 'dismissed'));
    });
  }
  function openFieldProps() {
    tryVal = ''; tplErr = '';
    $('section-props').hidden = true;
    $('field-props').hidden = false;
    renderFieldProps();
  }
  function closeFieldProps(focusBack) {
    const was = selField;
    $('field-props').hidden = true;
    $('section-props').hidden = false;
    if (focusBack) {
      selField = null;
      document.querySelectorAll('#section-preview .pf.is-selected, #field-list .is-selected').forEach(el => el.classList.remove('is-selected'));
      $('field-list').querySelector(`.field-card[data-fid="${was}"] .grip`)?.focus();
    }
  }
  const refreshAfterEdit = () => { S.saveModules(); renderPreview(); renderFields(); };

  // clicks: back, tabs, switches, radios, options
  $('field-props').addEventListener('click', e => {
    const f = curField(); if (!f) return;
    const t = e.target.closest('[data-act], [data-tab]'); if (!t) return;
    if (t.dataset.tab) { fieldTab = t.dataset.tab; renderFieldProps(`#fpp-tab-${fieldTab}`); return; }
    const act = t.dataset.act;
    if (t.getAttribute('aria-disabled') === 'true') return;
    if (act === 'back') return closeFieldProps(true);
    if (act === 'help') f.help.on = !f.help.on;
    else if (act === 'mandatory') { if (f.fixed || f.logic.dep.on) return; f.required = !f.required; }
    else if (act === 'count') f.logic.count.on = !f.logic.count.on;
    else if (act === 'valid') { f.logic.validOn = !f.logic.validOn; if (!f.logic.validOn) { f.logic.rule = 'none'; f.logic.pattern = ''; f.logic.ruleError = ''; } }
    else if (act === 'dep') { if (f.required) return; f.logic.dep.on = !f.logic.dep.on; }
    else if (act === 'addLogic') { openLogicDialog(f, -1, t); return; }
    else if (act === 'editLogic') { openLogicDialog(f, +t.dataset.i, t); return; }
    else if (act === 'delLogic') { const i = +t.dataset.i, [gone] = f.logic.dep.items.splice(i, 1); refreshAfterEdit(); renderFieldProps('[data-act="addLogic"]'); S.announce(`${gone.name || gone} deleted.`); return; }
    else if (act === 'source') { if (!t.checked) return; f.options.source = t.value; }
    else if (act === 'fileValid') { f.doc.on = !f.doc.on; }
    else if (act === 'ftype') { const d = f.doc; d.types = t.checked ? [...new Set([...d.types, t.value])] : d.types.filter(x => x !== t.value); refreshAfterEdit(); renderFieldProps(`input[data-act="ftype"][value="${t.value}"]`); return; }
    else if (act === 'addOpt') { f.options.items.push(''); refreshAfterEdit(); renderFieldProps(`#fpp-opt-${f.options.items.length - 1}`); S.announce(`Option ${f.options.items.length} added.`); return; }
    else if (act === 'delOpt') { const i = +t.dataset.i; f.options.items.splice(i, 1); refreshAfterEdit(); renderFieldProps(`#fpp-opt-${Math.min(i, f.options.items.length - 1)}`); S.announce(`Option ${i + 1} deleted.`); return; }
    else return;
    refreshAfterEdit();
    renderFieldProps(act === 'source' ? `input[name="fpp-src"][value="${f.options.source}"]` : `[data-act="${act}"]`);
  });
  // Tabs: arrow keys
  $('field-props').addEventListener('keydown', e => {
    if (!e.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    fieldTab = fieldTab === 'elements' ? 'logic' : 'elements';
    if (e.key === 'Home') fieldTab = 'elements'; if (e.key === 'End') fieldTab = 'logic';
    renderFieldProps(`#fpp-tab-${fieldTab}`);
  });
  // typing: update the field without re-rendering the panel
  $('field-props').addEventListener('input', e => {
    if (e.target.matches('[data-try]')) { tryVal = e.target.value; const f = curField(); if (f) $('fpp-try-res').innerHTML = tryResult(f); return; }
    const f = curField(); const k = e.target.dataset.input; if (!f || !k) return;
    const v = e.target.value;
    if (k === 'label') {
      if (v && v[0] !== v[0].toLocaleUpperCase()) {
        const el = e.target, a = el.selectionStart, b = el.selectionEnd;
        el.value = v[0].toLocaleUpperCase() + v.slice(1); el.setSelectionRange(a, b);
      }
      f.label = e.target.value; refreshAfterEdit(); return;
    }
    if (k === 'tplKey') { f.template.key = v; S.saveModules(); return; }
    if (k === 'tplUrl') {
      f.template.url = v.trim(); S.saveModules();
      if (tplErr && validUrl(f.template.url)) { tplErr = ''; e.target.removeAttribute('aria-invalid'); e.target.removeAttribute('aria-describedby'); $('fpp-turl-err').hidden = true; }
      return;
    }
    if (k === 'helpText') f.help.text = v;
    else if (k === 'error') f.error = v;
    else if (k === 'opt') f.options.items[+e.target.dataset.i] = v;
    else if (k === 'min') f.logic.count.min = v.replace(/\D/g, '');
    else if (k === 'max') f.logic.count.max = v.replace(/\D/g, '');
    else if (k === 'maxMb') { f.doc.maxMb = v.replace(/\D/g, '').slice(0, 3); e.target.value = f.doc.maxMb; }
    else if (k === 'pattern') { f.logic.pattern = v; S.saveModules(); return; }
    else if (k === 'ruleError') { f.logic.ruleError = v; if ($('fpp-try-res')) $('fpp-try-res').innerHTML = tryResult(f); }
    else if (k === 'depValue') f.logic.dep.value = v;
    refreshAfterEdit();
  });
  // Inline rename of a display logic: Enter / leaving the box saves, Esc cancels
  function endRename(save) {
    const el = $('dl-edit'); if (!el || editLogic < 0) return;
    const f = curField(), i = editLogic, v = el.value.trim();
    editLogic = -1;
    if (save && v && f) { f.logic.dep.items[i] = v; S.saveModules(); }
    renderFieldProps(`[data-act="editLogic"][data-i="${i}"]`);
  }
  $('field-props').addEventListener('keydown', e => {
    if (e.target.id !== 'dl-edit') return;
    if (e.key === 'Enter') { e.preventDefault(); endRename(true); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); endRename(false); }
  });
  $('field-props').addEventListener('focusout', e => { if (e.target.id === 'dl-edit') setTimeout(() => endRename(true), 0); });

  // Template URL: check when leaving the box
  $('field-props').addEventListener('focusout', e => {
    if (e.target.id !== 'fpp-turl') return;
    const u = e.target.value.trim();
    tplErr = u && !validUrl(u) ? 'Enter a full web address that starts with https://' : '';
    const err = $('fpp-turl-err'); if (!err) return;
    err.textContent = tplErr; err.hidden = !tplErr;
    if (tplErr) { e.target.setAttribute('aria-invalid', 'true'); e.target.setAttribute('aria-describedby', 'fpp-turl-err'); }
    else { e.target.removeAttribute('aria-invalid'); e.target.removeAttribute('aria-describedby'); }
  });

  // pattern: re-check validity / examples when leaving the field
  $('field-props').addEventListener('change', e => {
    if (e.target.dataset.input === 'pattern') renderFieldProps();
  });

  // Dropdown behaviour (shared)
  function selClose(w, refocus) {
    const list = w.querySelector('.sel-list'), btn = w.querySelector('.sel-btn');
    list.hidden = true; btn.setAttribute('aria-expanded', 'false'); list.removeAttribute('aria-activedescendant');
    if (refocus) btn.focus();
  }
  function selOpen(w) {
    document.querySelectorAll('.sel-list:not([hidden])').forEach(l => selClose(l.closest('.sel'), false));
    const list = w.querySelector('.sel-list'), btn = w.querySelector('.sel-btn');
    list.hidden = false; btn.setAttribute('aria-expanded', 'true');
    const opts = [...list.querySelectorAll('[role="option"]')];
    selActive(list, opts.find(o => o.getAttribute('aria-selected') === 'true') || opts[0]);
    list.focus();
  }
  function selActive(list, o) {
    list.querySelectorAll('.is-active').forEach(x => x.classList.remove('is-active'));
    if (!o) return;
    o.classList.add('is-active'); list.setAttribute('aria-activedescendant', o.id); o.scrollIntoView({ block: 'nearest' });
  }
  function selPick(w, v) {
    const f = curField(); if (!f) return;
    const key = w.dataset.sel;
    if (key === 'rule') {
      const r = RULES[v]; f.logic.rule = v;
      if (r.pattern !== undefined) { f.logic.pattern = r.pattern; f.logic.ruleError = r.error; }
      else if (v === 'custom') { f.logic.pattern = f.logic.pattern || ''; }
    } else if (key === 'data') f.options.data = v;
    else if (key === 'depField') f.logic.dep.field = v;
    refreshAfterEdit();
    renderFieldProps(`[data-sel="${key}"] .sel-btn`);
  }
  $('field-props').addEventListener('click', e => {
    const btn = e.target.closest('.sel-btn');
    if (btn) { const w = btn.closest('.sel'); w.querySelector('.sel-list').hidden ? selOpen(w) : selClose(w, true); return; }
    const o = e.target.closest('.sel-list [role="option"]');
    if (o) selPick(o.closest('.sel'), o.dataset.v);
  });
  $('field-props').addEventListener('keydown', e => {
    const btn = e.target.closest('.sel-btn');
    if (btn && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); selOpen(btn.closest('.sel')); return; }
    const list = e.target.closest('.sel-list'); if (!list) return;
    const w = list.closest('.sel'), opts = [...list.querySelectorAll('[role="option"]')];
    let i = opts.findIndex(o => o.classList.contains('is-active'));
    if (e.key === 'ArrowDown') i = Math.min(opts.length - 1, i + 1);
    else if (e.key === 'ArrowUp') i = Math.max(0, i - 1);
    else if (e.key === 'Home') i = 0;
    else if (e.key === 'End') i = opts.length - 1;
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (opts[i]) selPick(w, opts[i].dataset.v); return; }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); selClose(w, true); return; }
    else if (e.key === 'Tab') { selClose(w, false); return; }
    else return;
    e.preventDefault(); selActive(list, opts[i]);
  });
  document.addEventListener('click', e => {
    document.querySelectorAll('#field-props .sel-list:not([hidden])').forEach(l => { if (!l.closest('.sel').contains(e.target)) selClose(l.closest('.sel'), false); });
  });

  /* ---------- Document upload in the canvas preview ---------- */
  $('section-preview').addEventListener('change', e => {
    const inp = e.target.closest('input[data-upload]'); if (!inp || !inp.files[0]) return;
    const fid = inp.dataset.upload;
    uploads[fid] = inp.files[0];
    renderPreview();
    document.querySelector(`#section-preview [data-dl="${fid}"]`)?.focus();
    S.announce(`${inp.files[0].name} uploaded.`);
  });
  $('section-preview').addEventListener('click', e => {
    const tb = e.target.closest('[data-tmpl]');
    if (tb) {
      const f = form.sections[active].fields.find(x => x.id === tb.dataset.tmpl);
      const url = f?.template?.url || '';
      if (validUrl(url)) { window.open(url, '_blank', 'noopener'); return; }
      fieldTab = 'elements';
      const msg = url ? 'Enter a full web address that starts with https://' : 'Enter the template download URL so applicants can download the template.';
      setSelected(f.id, true);
      tplErr = msg; renderFieldProps('#fpp-turl');
      tplErr = msg;
      const box = $('fpp-turl'); if (box) box.scrollIntoView({ block: 'center' });
      S.announce(tplErr);
      return;
    }
    const reup = e.target.closest('[data-reup]'), dl = e.target.closest('[data-dl]'), rm = e.target.closest('[data-rm]');
    if (reup) document.querySelector(`#section-preview input[data-upload="${reup.dataset.reup}"]`)?.click();
    else if (dl) {
      const file = uploads[dl.dataset.dl]; if (!file) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } else if (rm) {
      const fid = rm.dataset.rm, name = uploads[fid]?.name; delete uploads[fid];
      renderPreview();
      document.querySelector(`#section-preview input[data-upload="${fid}"]`)?.focus();
      S.announce(`${name} removed.`);
    }
  });

  /* ======================================================
     Display Logic popup — conditions joined by "And", then "Then show <this field>"
     ====================================================== */
  const OPS = [
    { v: 'eq', t: 'Is equal to', s: 'equals' },
    { v: 'ne', t: 'Is not equal to', s: 'does not equal' },
    { v: 'gt', t: 'Is greater than', s: 'is more than' },
    { v: 'lt', t: 'Is less than', s: 'is less than' },
    { v: 'has', t: 'Contains', s: 'contains' },
  ];
  const blankCond = () => ({ page: '', field: '', op: '', mode: 'value', value: '', page2: '', field2: '' });
  let lg = null;   // { f, index, conds, opener, errors }

  const secById = id => form.sections.find(x => x.id === id);
  const fieldById = fid => { for (const sec of form.sections) { const x = sec.fields.find(y => y.id === fid); if (x) return x; } };
  const fieldOf = (pid, fid) => fieldById(fid);
  const opt = (v, t, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(t)}</option>`;
  function fieldSelectHTML(id, label, cur, key, i, err) {
    const groups = form.sections.map(sec => {
      const fs = sec.fields.filter(x => x.id !== lg.f.id);
      return fs.length ? `<optgroup label="${esc(sec.heading || 'Untitled section')}">${fs.map(x => opt(x.id, x.label, cur)).join('')}</optgroup>` : '';
    }).join('');
    return `<div class="lg-field">
      <label class="lg-label" for="${id}">${label}</label>
      <select class="pf-input pf-select lg-select${cur ? '' : ' is-ph'}" id="${id}" data-k="${key}" data-i="${i}"${err ? ' aria-invalid="true"' : ''}>
        <option value="">Choose a field</option>${groups}
      </select></div>`;
  }
  function selectHTML(id, label, placeholder, options, cur, key, i, err) {
    return `<div class="lg-field">
      <label class="lg-label" for="${id}">${label}</label>
      <select class="pf-input pf-select lg-select${cur ? '' : ' is-ph'}" id="${id}" data-k="${key}" data-i="${i}"${err ? ' aria-invalid="true"' : ''}>
        <option value="">${placeholder}</option>${options.map(o => opt(o.v, o.t, cur)).join('')}
      </select></div>`;
  }
  function condHTML(c, i, n) {
    const err = lg.errors[i] || {};
    const pages = form.sections.map(x => ({ v: x.id, t: x.heading || 'Untitled section' }));
    const fieldsOf = pid => (secById(pid)?.fields || []).filter(x => x.id !== lg.f.id).map(x => ({ v: x.id, t: x.label }));
    const src = fieldOf(c.page, c.field);
    const choices = src && src.type === 'dropdown' && src.options?.source === 'manual' ? src.options.items.filter(x => x.trim()) : null;
    let html = `<div class="lg-cond" role="group" aria-label="Condition ${i + 1}">
      <div class="lg-cond-head"><span class="lg-if">If</span>
        ${n > 1 ? `<button type="button" class="lg-del" data-del="${i}">${ICON.trash} Delete Condition</button>` : ''}</div>
      ${fieldSelectHTML(`lg-field-${i}`, 'Field', c.field, 'field', i, err.field)}
      ${selectHTML(`lg-op-${i}`, 'Operator', 'Choose an operator for comparison', OPS.map(o => ({ v: o.v, t: o.t })), c.op, 'op', i, err.op)}
      <div class="lg-modes" role="radiogroup" aria-label="Compare with">
        <label class="lg-mode${c.mode === 'value' ? ' is-on' : ''}"><input type="radio" name="lg-mode-${i}" value="value" data-k="mode" data-i="${i}"${c.mode === 'value' ? ' checked' : ''}>
          <span class="rc-dot" aria-hidden="true"></span><span><strong>Enter Value</strong><small>Enter a number or text, or choose a value from the options</small></span></label>
        <label class="lg-mode${c.mode === 'field' ? ' is-on' : ''}"><input type="radio" name="lg-mode-${i}" value="field" data-k="mode" data-i="${i}"${c.mode === 'field' ? ' checked' : ''}>
          <span class="rc-dot" aria-hidden="true"></span><span><strong>Use Another Field</strong><small>Compare with an existing field in the form</small></span></label>
      </div>`;
    if (c.mode === 'value') {
      html += choices
        ? `<div class="lg-narrow">${selectHTML(`lg-val-${i}`, 'Value', 'Choose a value', choices.map(x => ({ v: x, t: x })), c.value, 'value', i, err.value)}</div>`
        : `<div class="lg-field lg-narrow"><label class="lg-label" for="lg-val-${i}">Enter Value</label>
            <input class="pf-input" id="lg-val-${i}" type="text" placeholder="Value" value="${esc(c.value)}" data-k="value" data-i="${i}"${err.value ? ' aria-invalid="true"' : ''} autocomplete="off"></div>`;
    } else {
      html += fieldSelectHTML(`lg-field2-${i}`, 'Compare with field', c.field2, 'field2', i, err.field2);
    }
    if (Object.keys(err).length) html += `<p class="fp-error" id="lg-err-${i}">Complete every part of this condition.</p>`;
    return html + `</div>`;
  }
  function summaryHTML() {
    const done = lg.conds.filter(c => c.field && c.op && (c.mode === 'value' ? c.value : c.field2));
    if (!done.length) return '';
    const tag = t => `<span class="lg-tag">${esc(t)}</span>`;
    return `<div class="lg-summary" aria-label="Summary">
      ${done.map((c, i) => `${i ? '<p class="lg-and-s">And</p>' : ''}<p class="lg-sum-row"><span class="lg-if-s">If</span> ${tag(fieldById(c.field)?.label || '')}
        ${OPS.find(o => o.v === c.op).s} ${c.mode === 'value' ? tag(c.value) : tag(fieldById(c.field2)?.label || '')}</p>`).join('')}
      <p class="lg-sum-row lg-then">Then show ${tag(lg.f.label)}</p>
    </div>`;
  }
  function renderLogic(focusSel) {
    $('lg-body').innerHTML = lg.conds.map((c, i) => (i ? '<p class="lg-and" aria-hidden="true">And</p>' : '') + condHTML(c, i, lg.conds.length)).join('')
      + `<button type="button" class="btn btn-secondary lg-add" id="lg-add">${ICON.plus} Add Condition</button>` + summaryHTML();
    if (focusSel) $('logic-dialog').querySelector(focusSel)?.focus();
  }
  function openLogicDialog(f, index, opener) {
    const item = index >= 0 ? f.logic.dep.items[index] : null;
    lg = { f, index, opener, errors: [], conds: item && item.conds.length ? JSON.parse(JSON.stringify(item.conds)) : [blankCond()] };
    lg.conds.forEach(c => { if (!c.page) c.page = form.sections[active].id; });
    renderLogic();
    $('logic-dialog').showModal();
    $('lg-field-0')?.focus();
  }
  $('lg-body').addEventListener('change', e => {
    const k = e.target.dataset.k; if (!k || !lg) return;
    const i = +e.target.dataset.i, c = lg.conds[i];
    c[k] = e.target.value;
    if (k === 'page') { c.field = ''; c.value = ''; }
    if (k === 'field') c.value = '';
    if (k === 'page2') c.field2 = '';
    if (lg.errors[i]) delete lg.errors[i][k];
    renderLogic(`#${e.target.id}` + (k === 'mode' ? `, input[name="lg-mode-${i}"][value="${c.mode}"]` : ''));
    if (k === 'mode') $('logic-dialog').querySelector(`input[name="lg-mode-${i}"][value="${c.mode}"]`)?.focus();
  });
  $('lg-body').addEventListener('input', e => {
    if (e.target.dataset.k !== 'value' || e.target.tagName !== 'INPUT' || !lg) return;
    lg.conds[+e.target.dataset.i].value = e.target.value;
  });
  $('lg-body').addEventListener('focusout', e => {   // refresh the summary once a typed value is finished
    if (e.target.dataset.k === 'value' && e.target.tagName === 'INPUT') { const id = e.relatedTarget?.id; renderLogic(id ? `#${id}` : null); }
  });
  $('lg-body').addEventListener('click', e => {
    if (e.target.closest('#lg-add')) { lg.conds.push({ ...blankCond(), page: form.sections[active].id }); renderLogic(`#lg-field-${lg.conds.length - 1}`); S.announce(`Condition ${lg.conds.length} added.`); return; }
    const d = e.target.closest('[data-del]');
    if (d) { const i = +d.dataset.del; lg.conds.splice(i, 1); lg.errors.splice(i, 1); renderLogic(`#lg-field-${Math.max(0, i - 1)}`); S.announce(`Condition ${i + 1} deleted.`); }
  });
  $('lg-form').addEventListener('submit', e => {
    e.preventDefault();
    lg.errors = lg.conds.map(c => {
      const er = {};
      ['field', 'op'].forEach(k => { if (!c[k]) er[k] = 1; });
      if (c.mode === 'value' && !String(c.value).trim()) er.value = 1;
      if (c.mode === 'field' && !c.field2) er.field2 = 1;
      return er;
    });
    const bad = lg.errors.findIndex(er => Object.keys(er).length);
    if (bad >= 0) {
      renderLogic();
      const k = Object.keys(lg.errors[bad])[0];
      $('logic-dialog').querySelector(`[data-k="${k}"][data-i="${bad}"]`)?.focus();
      S.announce(`Complete every part of condition ${bad + 1}.`);
      return;
    }
    const items = lg.f.logic.dep.items;
    if (lg.index >= 0) items[lg.index].conds = lg.conds;
    else items.push({ name: `Logic ${items.length + 1}`, conds: lg.conds });
    const name = lg.index >= 0 ? items[lg.index].name : items[items.length - 1].name;
    S.saveModules();
    lg.saved = true;
    $('logic-dialog').close();
    renderFieldProps('[data-act="addLogic"]');
    S.announce(`${name} saved.`);
  });
  $('logic-dialog').querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => $('logic-dialog').close()));
  $('logic-dialog').addEventListener('click', e => { if (e.target === $('logic-dialog')) $('logic-dialog').close(); });
  $('logic-dialog').addEventListener('close', () => { if (lg && !lg.saved && lg.opener && document.contains(lg.opener)) lg.opener.focus(); });

  /* ---------- Events ---------- */
  $('form-steps').addEventListener('click', e => { const b = e.target.closest('.step-btn'); if (b) select(+b.dataset.i); });
  $('pager-prev').addEventListener('click', () => select(active - 1));
  $('pager-next').addEventListener('click', () => select(active + 1));

  // "n/limit" counter under the field; over the limit (only possible for older text) shows an error
  function updateCount(key) {
    const el = $('fp-' + key), n = el.value.length, max = LIMITS[key], over = n > max;
    $(`fp-${key}-count`).innerHTML = `${n}/${max}<span class="sr-only"> characters</span>`;
    $(`fp-${key}-count`).classList.toggle('is-over', over);
    $(`fp-${key}-err`).textContent = over ? `Use ${max} characters or fewer.` : '';
    if (over) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
  }
  $('fp-heading').addEventListener('input', () => updateCount('heading'));
  $('fp-desc').addEventListener('input', () => updateCount('desc'));
  $('fp-heading').addEventListener('input', e => {
    // First letter of the heading is always a capital
    const el = e.target, v = el.value;
    if (v && v[0] !== v[0].toLocaleUpperCase()) {
      const a = el.selectionStart, b = el.selectionEnd;
      el.value = v[0].toLocaleUpperCase() + v.slice(1);
      el.setSelectionRange(a, b);
    }
    form.sections[active].heading = e.target.value;
    renderSteps(); renderPreview();
    $('fp-title').textContent = e.target.value || 'Untitled section';
    S.saveModules();
  });
  $('fp-desc').addEventListener('input', e => { form.sections[active].description = e.target.value; renderPreview(); S.saveModules(); });

  function moveField(from, to, focusDir) {
    const list = form.sections[active].fields;
    if (to < 0 || to >= list.length || from === to) return;
    const [f] = list.splice(from, 1);
    list.splice(to, 0, f);
    S.saveModules();
    renderFields(); renderPreview();
    if (focusDir) $('field-list').querySelector(`.grip[data-grip="${to}"]`)?.focus();
    S.announce(`${f.label} moved to position ${to + 1} of ${list.length}.`);
  }
  $('field-list').addEventListener('click', e => {
    const sec = form.sections[active];
    const sw = e.target.closest('.switch');
    if (sw) {
      const i = +sw.dataset.toggle, f = sec.fields[i];
      f.enabled = f.enabled === false;
      S.saveModules(); renderFields(); renderPreview();
      $('field-list').querySelector(`.switch[data-toggle="${i}"]`).focus();
      S.announce(`${f.label} ${f.enabled ? 'shown in' : 'hidden from'} the form.`);
      return;
    }
    const del = e.target.closest('.del-btn');
    if (del) {
      const i = +del.dataset.del, [f] = sec.fields.splice(i, 1);
      S.saveModules(); renderFields(); renderPreview();
      const cards = $('field-list').querySelectorAll('.field-card');
      (cards[Math.min(i, cards.length - 1)]?.querySelector('.switch, .del-btn') || $('add-field-btn')).focus();
      S.announce(`${f.label} deleted.`);
      return;
    }
    const g = e.target.closest('.grip');
    if (g) { openMoveMenu(g); return; }
  });

  /* Reorder menu on the drag handle — the click/keyboard alternative to dragging (WCAG 2.5.7) */
  let menu = null;
  function closeMoveMenu(refocus) {
    if (!menu) return;
    const g = menu.grip; menu.el.remove(); g.setAttribute('aria-expanded', 'false'); menu = null;
    if (refocus) g.focus();
  }
  function openMoveMenu(g) {
    const open = menu && menu.grip === g; closeMoveMenu(false); if (open) return;
    const i = +g.dataset.grip, n = form.sections[active].fields.length, name = form.sections[active].fields[i].label;
    const items = [['Move to top', 0, i === 0], ['Move up', i - 1, i === 0], ['Move down', i + 1, i === n - 1], ['Move to bottom', n - 1, i === n - 1]];
    const el = document.createElement('div');
    el.className = 'move-menu'; el.setAttribute('role', 'menu'); el.setAttribute('aria-label', `Move ${name}`);
    el.innerHTML = items.map(([t, to, dis]) => `<button type="button" role="menuitem" data-to="${to}"${dis ? ' aria-disabled="true"' : ''} tabindex="-1">${t}</button>`).join('');
    g.parentElement.appendChild(el);
    g.setAttribute('aria-expanded', 'true');
    menu = { el, grip: g, from: i };
    el.querySelector('[role="menuitem"]:not([aria-disabled])')?.focus();
  }
  $('field-list').addEventListener('click', e => {
    const it = e.target.closest('.move-menu [role="menuitem"]');
    if (!it || !menu) return;
    e.stopPropagation();
    if (it.getAttribute('aria-disabled') === 'true') return;
    const from = menu.from, to = +it.dataset.to;
    closeMoveMenu(false);
    moveField(from, to, 'grip');
  }, true);
  $('field-list').addEventListener('keydown', e => {
    if (!menu || !menu.el.contains(e.target)) return;
    const its = [...menu.el.querySelectorAll('[role="menuitem"]')];
    let k = its.indexOf(e.target);
    if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); closeMoveMenu(true); return; }
    if (e.key === 'ArrowDown') k = (k + 1) % its.length;
    else if (e.key === 'ArrowUp') k = (k - 1 + its.length) % its.length;
    else if (e.key === 'Home') k = 0;
    else if (e.key === 'End') k = its.length - 1;
    else return;
    e.preventDefault(); its[k].focus();
  });
  document.addEventListener('click', e => { if (menu && !menu.el.contains(e.target) && e.target !== menu.grip && !menu.grip.contains(e.target)) closeMoveMenu(false); });

  // Drag to reorder (the ▲▼ buttons are the non-drag alternative)
  let dragFrom = null;
  $('field-list').addEventListener('dragstart', e => {
    const li = e.target.closest('.field-card'); if (!li) return;
    dragFrom = +li.dataset.i; li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(dragFrom));
  });
  $('field-list').addEventListener('dragover', e => {
    const li = e.target.closest('.field-card'); if (!li || dragFrom === null) return;
    e.preventDefault();
    $('field-list').querySelectorAll('.drop-target').forEach(x => x.classList.remove('drop-target'));
    li.classList.add('drop-target');
  });
  $('field-list').addEventListener('drop', e => {
    const li = e.target.closest('.field-card'); if (!li || dragFrom === null) return;
    e.preventDefault();
    moveField(dragFrom, +li.dataset.i);
  });
  $('field-list').addEventListener('dragend', () => {
    dragFrom = null;
    $('field-list').querySelectorAll('.dragging, .drop-target').forEach(x => x.classList.remove('dragging', 'drop-target'));
  });

  // Add Field lives on the canvas (dashed) and in the panel (button); both do the same thing
  $('section-preview').addEventListener('click', e => { if (e.target.closest('#canvas-add-field')) addField(true); });
  $('add-field-btn').addEventListener('click', () => addField(false));
  function addField(fromCanvas) {
    const s = form.sections[active];
    const n = s.fields.length + 1;
    s.fields.push({ ...field(`Field ${n}`, 'text'), custom: true });
    S.saveModules();
    renderFields(); renderPreview();
    S.announce(`Field ${n} added to ${s.heading || 'this section'}.`);
    if (fromCanvas) $('canvas-add-field').focus();
  }

  $('form-save').addEventListener('click', () => { S.saveModules(); S.announce('Form saved.'); S.toast?.('Form saved'); });

  /* ---------- Delete Section (confirm first, like the workflow designer) ---------- */
  const dsDlg = $('del-section-dialog');
  $('delete-section-btn').addEventListener('click', () => {
    const name = form.sections[active].heading || 'Untitled section';
    $('ds-title').textContent = `Proceed to delete "${name}"?`;
    $('ds-desc').textContent = `Are you sure you want to delete "${name}"? All fields in this section will be deleted too. This action cannot be undone.`;
    dsDlg.showModal();
    $('ds-cancel').focus();
  });
  dsDlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dsDlg.close()));
  dsDlg.addEventListener('click', e => { if (e.target === dsDlg) dsDlg.close(); });
  dsDlg.addEventListener('close', () => { if (dsDlg.returnValue !== 'deleted') $('delete-section-btn').focus(); dsDlg.returnValue = ''; });
  $('ds-confirm').addEventListener('click', () => {
    const [gone] = form.sections.splice(active, 1);
    S.saveModules();
    dsDlg.close('deleted');
    select(Math.min(active, form.sections.length - 1), true);
    S.announce(`${gone.heading || 'Section'} deleted.`);
  });

  /* ---------- Add Section popup ---------- */
  const dlg = $('add-section-dialog');
  // Clicking a card adds that section straight away; Cancel closes
  $('add-section-btn').addEventListener('click', () => {
    $('as-list').innerHTML = SECTION_TYPES.map(t => {
      const used = t.single && form.sections.some(s => s.type === t.type);
      return `<button type="button" class="as-card${used ? ' is-used' : ''}" data-type="${t.type}"${used ? ' aria-disabled="true"' : ''}>
        <span class="as-title-row"><span class="as-title">${t.title}</span>${used ? '<span class="as-used-tag">Already added</span>' : ''}</span>
        <span class="as-desc">${t.desc}</span>
      </button>`;
    }).join('');
    dlg.showModal();
    $('as-list').querySelector('.as-card:not([aria-disabled="true"])')?.focus();
  });
  $('as-list').addEventListener('click', e => {
    const c = e.target.closest('.as-card');
    if (!c || c.getAttribute('aria-disabled') === 'true') return;
    const sec = makeSection(c.dataset.type, form);
    form.sections.push(sec);
    S.saveModules();
    dlg.close();
    select(form.sections.length - 1);
    $('fp-heading').focus();
    S.announce(`${sec.heading} section added.`);
  });
  dlg.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { if (!view.hidden && document.activeElement === document.body) $('add-section-btn').focus(); });

  /* ---------- Public: called by the router ---------- */
  window.StudioForm = {
    render(m, focus) {
      const fresh = mod !== m;
      mod = m; form = ensureForm(m);
      if (fresh) active = 0;
      $('form-title').textContent = `${m.name} Form`;
      const back = '#/module/' + encodeURIComponent(m.id);
      $('form-back-top').href = back;
      $('form-back').href = back;
      renderAll();
      if (focus) $('form-title').focus();
    },
  };
})();
