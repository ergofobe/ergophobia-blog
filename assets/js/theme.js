(function () {
  var order = ["dark", "light", "system"];
  var icons = { dark: "☾", light: "☀", system: "⌘" };
  function effective(p) {
    if (p === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return p;
  }
  function apply(p) {
    document.documentElement.setAttribute("data-theme", effective(p));
    document.documentElement.setAttribute("data-theme-pref", p);
    var b = document.getElementById("theme-toggle");
    if (!b) return;
    var ico = b.querySelector(".ico"), lbl = b.querySelector(".lbl");
    if (ico) ico.textContent = icons[p];
    if (lbl) lbl.textContent = p;
    b.setAttribute("aria-label", "Theme: " + p);
  }
  function current() { return localStorage.getItem("theme") || "dark"; }
  window.addEventListener("DOMContentLoaded", function () {
    apply(current());
    var b = document.getElementById("theme-toggle");
    if (b) b.addEventListener("click", function () {
      var n = order[(order.indexOf(current()) + 1) % order.length];
      localStorage.setItem("theme", n); apply(n);
    });
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (current() === "system") apply("system");
    });
  });
})();
