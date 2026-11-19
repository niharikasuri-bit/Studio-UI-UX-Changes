/* Full-screen loader, copied from the Attendance register (attendance-ux-revamp → upload mapping):
   dark 70% overlay with a slight blur, the same Lottie animation (120px), and a white status line under it.
   Studio.loader(steps, task): steps = [[message, minimum ms], …] shown one after another while `task` runs. */
(() => {
  const DATA = {"v":"5.7.0","fr":60,"ip":0,"op":106,"w":100,"h":100,"nm":"Main Scene","ddd":0,"assets":[],"meta":{"g":"@lottiefiles/creator 1.37.1"},"layers":[{"ty":4,"nm":"Shape Layer 5","sr":1,"st":20,"op":620,"ip":20,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[50,50]},"r":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":20},{"s":[360],"t":110}]},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}},"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Ellipse 1","ix":1,"cix":2,"np":3,"it":[{"ty":"el","bm":0,"hd":false,"mn":"ADBE Vector Shape - Ellipse","nm":"Ellipse Path 1","d":1,"p":{"a":0,"k":[0,-30]},"s":{"a":0,"k":[6,6]}},{"ty":"fl","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Fill","nm":"Fill 1","c":{"a":0,"k":[1,1,1]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":1},{"ty":4,"nm":"Shape Layer 4","sr":1,"st":15,"op":615,"ip":15,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[50,50]},"r":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":15},{"s":[360],"t":105}]},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}},"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Ellipse 1","ix":1,"cix":2,"np":3,"it":[{"ty":"el","bm":0,"hd":false,"mn":"ADBE Vector Shape - Ellipse","nm":"Ellipse Path 1","d":1,"p":{"a":0,"k":[0,-30]},"s":{"a":0,"k":[8,8]}},{"ty":"fl","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Fill","nm":"Fill 1","c":{"a":0,"k":[1,1,1]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":2},{"ty":4,"nm":"Shape Layer 3","sr":1,"st":10,"op":610,"ip":10,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[50,50]},"r":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":10},{"s":[360],"t":100}]},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}},"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Ellipse 1","ix":1,"cix":2,"np":3,"it":[{"ty":"el","bm":0,"hd":false,"mn":"ADBE Vector Shape - Ellipse","nm":"Ellipse Path 1","d":1,"p":{"a":0,"k":[0,-30]},"s":{"a":0,"k":[10,10]}},{"ty":"fl","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Fill","nm":"Fill 1","c":{"a":0,"k":[1,1,1]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":3},{"ty":4,"nm":"Shape Layer 2","sr":1,"st":5,"op":605,"ip":5,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[50,50]},"r":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":5},{"s":[360],"t":95}]},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}},"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Ellipse 1","ix":1,"cix":2,"np":3,"it":[{"ty":"el","bm":0,"hd":false,"mn":"ADBE Vector Shape - Ellipse","nm":"Ellipse Path 1","d":1,"p":{"a":0,"k":[0,-30]},"s":{"a":0,"k":[12,12]}},{"ty":"fl","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Fill","nm":"Fill 1","c":{"a":0,"k":[1,1,1]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":4},{"ty":4,"nm":"Shape Layer 1","sr":1,"st":0,"op":600,"ip":0,"hd":false,"ddd":0,"bm":0,"hasMask":false,"ao":0,"ks":{"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100]},"sk":{"a":0,"k":0},"p":{"a":0,"k":[50,50]},"r":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[0],"t":0},{"s":[360],"t":90}]},"sa":{"a":0,"k":0},"o":{"a":0,"k":100}},"shapes":[{"ty":"gr","bm":0,"hd":false,"mn":"ADBE Vector Group","nm":"Ellipse 1","ix":1,"cix":2,"np":3,"it":[{"ty":"el","bm":0,"hd":false,"mn":"ADBE Vector Shape - Ellipse","nm":"Ellipse Path 1","d":1,"p":{"a":0,"k":[0,-30]},"s":{"a":1,"k":[{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[14,14],"t":0},{"o":{"x":0.333,"y":0},"i":{"x":0.667,"y":1},"s":[12,12],"t":84},{"s":[14,14],"t":100}]}},{"ty":"fl","bm":0,"hd":false,"mn":"ADBE Vector Graphic - Fill","nm":"Fill 1","c":{"a":0,"k":[1,1,1]},"r":1,"o":{"a":0,"k":100}},{"ty":"tr","a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"sk":{"a":0,"k":0,"ix":4},"p":{"a":0,"k":[0,0],"ix":2},"r":{"a":0,"k":0,"ix":6},"sa":{"a":0,"k":0,"ix":5},"o":{"a":0,"k":100,"ix":7}}]}],"ind":5}]};
  let lottieReady = null;
  const loadLottie = () => lottieReady || (lottieReady = new Promise(res => {
    if (window.lottie) return res(window.lottie);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js';
    s.onload = () => res(window.lottie); s.onerror = () => res(null);
    document.head.appendChild(s);
  }));
  const css = document.createElement('style');
  css.textContent = `
    .st-loader { position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
      background: rgb(11 12 12 / 0.7); backdrop-filter: blur(2px); outline: none; animation: st-loader-in .15s ease-out; }
    .st-loader-anim { width: 120px; height: 120px; }
    .st-loader-text { margin: 0; padding: 0 24px; text-align: center; font: 500 16px/1.4 Roboto, system-ui, sans-serif; color: #fff; }
    @keyframes st-loader-in { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .st-loader { animation: none; } }`;
  document.head.appendChild(css);
  const wait = ms => new Promise(r => setTimeout(r, ms));

  async function loader(steps, task) {
    const back = document.activeElement;
    const el = document.createElement('div');
    el.className = 'st-loader'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'assertive'); el.tabIndex = -1;
    el.innerHTML = '<div class="st-loader-anim" aria-hidden="true"></div><p class="st-loader-text"></p>';
    document.body.appendChild(el); el.focus();
    const main = document.querySelector('.app, #app, .main') || null;   // keep keyboard/screen readers on the loader
    document.querySelectorAll('body > *:not(.st-loader)').forEach(n => n.setAttribute('inert', ''));
    let anim = null;
    loadLottie().then(l => { if (l && document.contains(el)) anim = l.loadAnimation({ container: el.firstChild, renderer: 'svg', loop: true, autoplay: true, animationData: DATA }); });
    const text = el.querySelector('.st-loader-text');
    let result;
    try {
      const run = Promise.resolve().then(task);
      for (const [msg, ms] of steps) { text.textContent = msg; await wait(ms); }
      result = await run;
    } finally {
      if (anim) anim.destroy();
      document.querySelectorAll('[inert]').forEach(n => n.removeAttribute('inert'));
      el.remove();
      if (back && document.contains(back)) back.focus();
    }
    return result;
  }
  window.Studio = window.Studio || {};
  window.Studio.loader = loader;
})();
