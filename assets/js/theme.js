(function () {
  var order = ["dark", "light", "system"];
  var labels = { dark: "☾ dark", light: "☀ light", system: "⌘ system" };
  function effective(p) {
    if (p === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return p;
  }
  function apply(p) {
    document.documentElement.setAttribute("data-theme", effective(p));
    document.documentElement.setAttribute("data-theme-pref", p);
    var b = document.getElementById("theme-toggle");
    if (b) { b.textContent = labels[p]; b.setAttribute("aria-label", "Theme: " + p); }
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
