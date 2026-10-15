(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  /* ---------- Theme toggle (persisted) ---------- */

  var themeBtn = document.querySelector(".theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
      themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#161311" : "#f5f0ea");
    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
    }
  }

  applyTheme(currentTheme(), false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  /* ---------- Mobile navigation ---------- */

  var hamburger = document.querySelector(".hamburger");
  var navLinks = document.querySelector(".nav-links");

  function closeNav() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Header border on scroll ---------- */

  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link + reveal on scroll ---------- */

  if ("IntersectionObserver" in window) {
    var linkFor = {};
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(function (a) {
      linkFor[a.getAttribute("href").slice(1)] = a;
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Sections without a nav link (e.g. the hero) clear the highlight.
        Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove("is-active"); });
        var link = linkFor[entry.target.id];
        if (link) link.classList.add("is-active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("main > section[id]").forEach(function (el) { spy.observe(el); });

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Lightbox ---------- */

  var lb = document.querySelector(".lightbox");
  if (lb) {
    var lbImg = lb.querySelector(".lightbox-stage img");
    var lbCap = lb.querySelector(".lightbox-caption");
    var lbCount = lb.querySelector(".lightbox-count");
    var group = [];
    var index = 0;
    var lastFocus = null;

    function show(i) {
      index = (i + group.length) % group.length;
      var a = group[index];
      var cap = a.getAttribute("data-caption") || "";
      lbImg.src = a.getAttribute("href");
      lbImg.alt = cap;
      lbCap.textContent = cap;
      lbCount.textContent = group.length > 1 ? (index + 1) + " / " + group.length : "";
      lb.classList.toggle("is-single", group.length < 2);
      // Warm the cache for the neighbours.
      [index + 1, index - 1].forEach(function (n) {
        var next = group[(n + group.length) % group.length];
        if (next) { var pre = new Image(); pre.src = next.getAttribute("href"); }
      });
    }

    function open(a) {
      var scope = a.closest("[data-gallery]") || document;
      group = Array.prototype.slice.call(scope.querySelectorAll("a[data-lightbox]"));
      lastFocus = document.activeElement;
      show(group.indexOf(a));
      lb.hidden = false;
      requestAnimationFrame(function () { lb.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }

    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { lb.hidden = true; lbImg.removeAttribute("src"); }, 250);
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-lightbox]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(a);
    });

    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.classList.contains("lightbox-stage")) close();
    });

    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(index + 1);
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "Tab") {
        // Keep focus inside the dialog.
        var f = lb.querySelectorAll("button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var touchX = null;
    lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Inline PDF preview (loaded on demand) ---------- */

  var previewBtn = document.querySelector(".pdf-preview-btn");
  var viewer = document.querySelector(".pdf-viewer");
  if (previewBtn && viewer) {
    previewBtn.addEventListener("click", function () {
      var showing = !viewer.hidden;
      if (!showing && !viewer.querySelector("iframe")) {
        var frame = document.createElement("iframe");
        frame.src = viewer.getAttribute("data-src") + "#view=FitH";
        frame.title = "Shikha portfolio PDF";
        frame.loading = "lazy";
        viewer.appendChild(frame);
      }
      viewer.hidden = showing;
      previewBtn.setAttribute("aria-expanded", String(!showing));
      previewBtn.querySelector("span").textContent = showing ? "Preview here" : "Hide preview";
      if (!showing) viewer.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Footer year ---------- */

  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
