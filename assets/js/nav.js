(function () {
  window.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header");
    var btn = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!header || !btn || !nav) return;

    function isOpen() { return header.getAttribute("data-nav-open") === "true"; }
    function setOpen(open) {
      header.setAttribute("data-nav-open", open ? "true" : "false");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    setOpen(false);

    btn.addEventListener("click", function () {
      var open = !isOpen();
      setOpen(open);
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { setOpen(false); btn.focus(); }
    });

    document.addEventListener("click", function (e) {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });

    var wide = window.matchMedia("(min-width: 681px)");
    wide.addEventListener("change", function (e) { if (e.matches) setOpen(false); });
  });
})();
