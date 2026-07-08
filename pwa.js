/* ═══════════════════════════════════════════════════════════════
   UX-FIRST STUDIO — PWA LAYER (spec §5, §9, §11)
   ───────────────────────────────────────────────────────────────
   Service worker registration + user-controlled update flow,
   install affordances (Chromium button, iOS hint), and launcher
   shortcut routing. Loads last; talks to the engine through its
   globals and the "uxfs:ready" event.
   ═══════════════════════════════════════════════════════════════ */

/* ---------- Standalone detection ---------- */
function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}
if(isStandalone()) document.body.classList.add("standalone");

/* ---------- Service worker: register + update flow ---------- */
// The worker never skipWaiting()s on its own — the user chooses when to
// reload. If they ignore the toast, the update applies on next launch.
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").then(reg => {
    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      nw.addEventListener("statechange", () => {
        if(nw.state === "installed" && navigator.serviceWorker.controller){
          showUpdateToast(() => nw.postMessage("SKIP_WAITING"));
        }
      });
    });
  }).catch(e => console.warn("sw registration failed", e));
  let refreshed = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if(!refreshed){ refreshed = true; location.reload(); }
  });
}

function showUpdateToast(activate){
  const toast = document.getElementById("updateToast");
  toast.hidden = false;
  document.getElementById("updateReload").onclick = async () => {
    // pending debounced saves must flush before the reload (§11)
    if(typeof flushSaves === "function") await flushSaves();
    activate();   // → SKIP_WAITING → controllerchange → one reload
  };
}

/* ---------- Install: desktop + Android (Chromium) ---------- */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  if(!isStandalone()) document.getElementById("installBtn").hidden = false;
});
document.getElementById("installBtn").onclick = async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById("installBtn").hidden = true;
};
window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  document.getElementById("installBtn").hidden = true;
});

/* ---------- Install: iOS hint (second visit, one-time) ---------- */
function isIOS(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /mac/i.test(navigator.platform));   // iPadOS masquerades as Mac
}
function maybeShowIosHint(){
  if(isStandalone() || !isIOS()) return;
  const visits = (store.visits || 0) + 1;
  store.visits = visits;
  Store.saveMeta({ visits });
  if(visits < 2 || store.iosHintDismissed) return;   // let the tool prove itself once
  const hint = document.getElementById("iosHint");
  hint.hidden = false;
  document.getElementById("iosHintClose").onclick = () => {
    hint.hidden = true;
    store.iosHintDismissed = true;
    Store.saveMeta({ iosHintDismissed: true });
  };
}

/* ---------- Launcher shortcut routing (?action=…) ---------- */
function handleLaunchAction(){
  const action = new URLSearchParams(location.search).get("action");
  if(!action) return;
  history.replaceState(null, "", location.pathname);   // a reload must not repeat it
  if(action === "new"){
    if(window.matchMedia("(max-width:860px)").matches) openSidebar();
    document.getElementById("newProjInput").focus();
  }else if(action === "export"){
    exportTab = "brief";
    renderExport();
    document.getElementById("modalScrim").classList.add("open");
  }
}

window.addEventListener("uxfs:ready", () => {
  handleLaunchAction();
  maybeShowIosHint();
});
