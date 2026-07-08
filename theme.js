/* Theme: Light / Dark / System. Loaded BLOCKING in <head> so data-theme is
   stamped before first paint (no flash). CSP forbids inline scripts, so the
   preference lives in localStorage (synchronous) rather than IndexedDB. */
(function () {
  var KEY = "uxfs-theme";
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function pref() { try { return localStorage.getItem(KEY) || "system"; } catch (e) { return "system"; } }
  function resolved(p) { return (p === "dark" || (p === "system" && mq.matches)) ? "dark" : "light"; }
  function apply() { document.documentElement.setAttribute("data-theme", resolved(pref())); }

  apply();   // before paint

  function syncUI() {
    var p = pref();
    document.querySelectorAll("#themeToggle [data-theme-set]").forEach(function (b) {
      b.classList.toggle("on", b.dataset.themeSet === p);
    });
  }
  window.Theme = {
    set: function (p) { try { localStorage.setItem(KEY, p); } catch (e) {} apply(); syncUI(); },
    get: pref
  };

  // Follow the OS live while in System mode.
  mq.addEventListener("change", function () { if (pref() === "system") apply(); });

  document.addEventListener("DOMContentLoaded", function () {
    var t = document.getElementById("themeToggle");
    if (t) t.addEventListener("click", function (e) {
      var b = e.target.closest("[data-theme-set]");
      if (b) window.Theme.set(b.dataset.themeSet);
    });
    syncUI();
  });
})();
