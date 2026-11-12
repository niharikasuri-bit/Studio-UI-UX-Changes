/* ==========================================================
   Branding → Studio
   When a theme is applied in Branding and Theming (Apply theme), Studio uses it too:
   primary colour (and its darker / lighter shades), heading colour, page background, font, button corners,
   and the display name + logo in the header.
   Branding saves it in the browser ('digit-console-v4' → account.branding). Both prototypes are on
   niharikasuri-bit.github.io, so they share it. Nothing saved, or DIGIT Classic → Studio stays as it is.
   ========================================================== */
(function () {
  var b = null;
  try { b = (JSON.parse(localStorage.getItem('digit-console-v4')) || {}).account.branding; } catch (e) {}
  // a theme applied in Branding updates Studio pages that are already open
  addEventListener('storage', function (e) { if (e.key === 'digit-console-v4') location.reload(); });
  if (!b || !b.saved || !b.theme) return;
  var t = b.theme;
  var DEF = { primary: '#C84C0E', heading: '#0B4B66', page: '#EEEEEE' };
  var same = function (x, y) { return String(x || '').toUpperCase() === y; };
  var isDefault = same(t.primary, DEF.primary) && same(t.header, DEF.heading) && t.font === 'roboto' && t.radius === 'rounded';

  /* ---------- colour helpers ---------- */
  var hex2rgb = function (h) { h = h.replace('#', ''); return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); }); };
  var rgb2hsl = function (c) {
    var r = c[0] / 255, g = c[1] / 255, bl = c[2] / 255, mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - bl) / d) % 6 : mx === g ? (bl - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
    return [h, s, l];
  };
  var hsl2rgb = function (h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, bl = 0;
    if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; bl = x; } else if (h < 240) { g = x; bl = c; } else if (h < 300) { r = x; bl = c; } else { r = c; bl = x; }
    return [r, g, bl].map(function (v) { return Math.round((v + m) * 255); });
  };
  var P0 = rgb2hsl(hex2rgb(DEF.primary)), P1 = rgb2hsl(hex2rgb(t.primary || DEF.primary));
  var HEAD = hex2rgb(t.header || DEF.heading), PAGE = hex2rgb(t.background || DEF.page);
  // Studio's orange family (the primary, its darker text shade, hover, tints, borders, illustration oranges):
  // hue ~10–35°, saturated. Each is moved to the theme's hue, keeping how much lighter or darker it was than the primary.
  var orange = function (c) { var h = rgb2hsl(c); return h[0] >= 12 && h[0] <= 30 && h[1] > 0.35 && h[2] > 0.15; /* not error red (~8°) or warning amber (~36°) */ };
  var recolour = function (c) {
    if (c[0] === 11 && c[1] === 75 && c[2] === 102) return HEAD;                        // heading blue #0B4B66
    if (c[0] === 238 && c[1] === 238 && c[2] === 238) return PAGE;                       // page background #EEEEEE
    if (!orange(c)) return null;
    var h = rgb2hsl(c), l = h[2];
    var nl = l <= P0[2] ? l * (P1[2] / P0[2]) : P1[2] + (l - P0[2]) * (1 - P1[2]) / (1 - P0[2]);
    var ns = Math.min(1, h[1] * (P1[1] / (P0[1] || 1)));
    return hsl2rgb(P1[0], ns, nl);
  };
  var cache = {};
  var swap = function (str) {
    if (!str || str.indexOf('rgb') < 0 && str.indexOf('#') < 0) return str;
    if (cache[str] !== undefined) return cache[str];
    var out = str.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*[\d.]+)?\)|#([0-9a-fA-F]{6})\b/g, function (m, r, g, bl, a, hx) {
      var c = hx ? hex2rgb(hx) : [+r, +g, +bl], n = recolour(c);
      if (!n) return m;
      return hx ? '#' + n.map(function (v) { return v.toString(16).padStart(2, '0'); }).join('').toUpperCase() : (a ? 'rgba(' + n.join(', ') + a + ')' : 'rgb(' + n.join(', ') + ')');
    });
    cache[str] = out; return out;
  };
  // data-URI SVGs in CSS (dropdown arrows, icons) carry colours as %23RRGGBB
  var swapUri = function (str) { return str.indexOf('%23') < 0 ? str : str.replace(/%23([0-9a-fA-F]{6})/g, function (m, hx) { var n = swap('#' + hx); return n === '#' + hx ? m : '%23' + n.slice(1); }); };

  /* ---------- stylesheets ---------- */
  var COLOUR_PROPS = ['color', 'background-color', 'background-image', 'background', 'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color',
    'border-left-color', 'outline-color', 'box-shadow', 'fill', 'stroke', 'text-decoration-color', 'caret-color', 'accent-color', 'column-rule-color'];
  var doRules = function (rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.cssRules && !r.style) { doRules(r.cssRules); continue; }
      if (!r.style) continue;
      for (var j = 0; j < r.style.length; j++) {
        var p = r.style[j];
        if (p.indexOf('--') === 0 || COLOUR_PROPS.indexOf(p) >= 0 || p.indexOf('color') >= 0 || p.indexOf('shadow') >= 0) {
          var v = r.style.getPropertyValue(p), nv = swapUri(swap(v));
          if (nv !== v) r.style.setProperty(p, nv, r.style.getPropertyPriority(p));
        }
      }
    }
  };
  var doSheets = function () { for (var i = 0; i < document.styleSheets.length; i++) { try { doRules(document.styleSheets[i].cssRules); } catch (e) { /* cross-origin (fonts) */ } } };

  /* ---------- markup made by the scripts (inline styles, SVG fill / stroke) ---------- */
  var doEl = function (el) {
    if (el.nodeType !== 1) return;
    ['fill', 'stroke', 'stop-color', 'color'].forEach(function (a) { var v = el.getAttribute(a); if (v) { var nv = swap(v); if (nv !== v) el.setAttribute(a, nv); } });
    var st = el.getAttribute('style'); if (st) { var ns = swapUri(swap(st)); if (ns !== st) el.setAttribute('style', ns); }
  };
  var doTree = function (root) { doEl(root); if (root.querySelectorAll) root.querySelectorAll('[style],[fill],[stroke],[stop-color]').forEach(doEl); };

  /* ---------- font, corners, header name + logo ---------- */
  var FONTS = { 'dm-sans': ['DM Sans', 'DM+Sans:wght@400;500;700'], 'public-sans': ['Public Sans', 'Public+Sans:wght@400;500;700'], inter: ['Inter', 'Inter:wght@400;500;700'] };
  var RADII = { sharp: [2, 2], rounded: [4, 8], soft: [10, 18], pill: [999, 12] };
  var extraCss = function () {
    var css = '', f = FONTS[t.font];
    if (f) {
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + f[1] + '&display=swap'; document.head.appendChild(l);
      css += 'body, button, input, select, textarea, .btn { font-family: "' + f[0] + '", system-ui, sans-serif !important; }';
    }
    var rd = RADII[t.radius];
    if (rd && t.radius !== 'rounded') css += '.btn, .btn-primary, .btn-secondary { border-radius: ' + rd[0] + 'px !important; } .section, .card, .um-table-box, .nt-filters { border-radius: ' + rd[1] + 'px !important; }';
    if (css) { var s = document.createElement('style'); s.id = 'brand-css'; s.textContent = css; document.head.appendChild(s); }
  };
  var header = function () {
    var logo = document.querySelector('.logo-egov');
    if (logo && b.logo) { var img = document.createElement('img'); img.src = b.logo; img.alt = b.name || 'Logo'; img.className = 'brand-logo'; img.style.cssText = 'max-height:36px;max-width:160px;object-fit:contain;display:block'; logo.replaceWith(img); }
    var city = document.querySelector('.header .city, .city');
    if (city && b.name) city.textContent = b.name;
  };

  var run = function () {
    if (!isDefault) {
      doSheets(); doTree(document.body);
      new MutationObserver(function (ms) {
        ms.forEach(function (m) { if (m.type === 'attributes') doEl(m.target); else m.addedNodes.forEach(doTree); });
      }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'fill', 'stroke'] });
      extraCss();
    }
    header();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  // stylesheets that finish loading later
  addEventListener('load', function () { if (!isDefault) doSheets(); });
})();
