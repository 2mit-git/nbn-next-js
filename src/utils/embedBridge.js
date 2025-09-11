// app/betanbn/embedBridge.js
const inBrowser = typeof window !== "undefined";

function post(msg) { if (inBrowser) try { window.parent?.postMessage(msg, "*"); } catch {} }

export function notifyParentModal(open) {
  post({ type: "EMBED_MODAL_TOGGLE", open: !!open });
}

export function notifyParentHeight(h) {
  const height = Math.max(1, Math.floor(h || 0));
  post({ type: "EMBED_IFRAME_HEIGHT", height });
}

export function initEmbedBridge() {
  if (!inBrowser) return;
  window.__EMBED_MODAL_TOGGLE__ = notifyParentModal;

  const report = () => {
    const h = Math.max(document.documentElement.scrollHeight, document.body?.scrollHeight || 0);
    notifyParentHeight(h);
  };

  report(); setTimeout(report, 0);

  const ro = new ResizeObserver(report);
  ro.observe(document.documentElement);

  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(report, 50); });
  window.addEventListener("hashchange", report);
  window.addEventListener("load", report);

  return () => { try { ro.disconnect(); } catch {} };
}
