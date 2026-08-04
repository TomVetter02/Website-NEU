(function () {
  "use strict";

  // EmailJS-Zugangsdaten aus dem EmailJS-Dashboard (siehe Setup-Anleitung).
  // Ohne echte Werte schlägt der Versand fehl und die Fehlermeldung im
  // Formular greift als Fallback (mailto-Link).
  var EMAILJS_PUBLIC_KEY = "DEIN_PUBLIC_KEY";
  var EMAILJS_SERVICE_ID = "DEIN_SERVICE_ID";
  var EMAILJS_TEMPLATE_ADMIN = "DEIN_TEMPLATE_ID_BENACHRICHTIGUNG";
  var EMAILJS_TEMPLATE_AUTOREPLY = "DEIN_TEMPLATE_ID_BESTAETIGUNG";

  if (window.emailjs) {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  var header = document.getElementById("site-header");
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  // Condense header on scroll
  function onScroll() {
    if (window.scrollY > 40) {
      header.classList.add("is-condensed");
    } else {
      header.classList.remove("is-condensed");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  function closeNav() {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  navToggle.addEventListener("click", function () {
    var isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll(".reveal");
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // Hero video preview: autoplays muted, loops up to twice, then stops on
  // the last frame. Clicking the video replays it (from the start once
  // it has stopped); a separate button opens it in fullscreen.
  var heroVideo = document.getElementById("hero-video");

  if (heroVideo) {
    var HERO_VIDEO_MAX_LOOPS = 2;
    var heroVideoLoops = 0;

    heroVideo.addEventListener("ended", function () {
      heroVideoLoops += 1;
      if (heroVideoLoops < HERO_VIDEO_MAX_LOOPS) {
        heroVideo.currentTime = 0;
        heroVideo.play();
      }
    });

    heroVideo.addEventListener("click", function () {
      if (heroVideo.paused) {
        if (heroVideo.ended) {
          heroVideoLoops = 0;
          heroVideo.currentTime = 0;
        }
        heroVideo.play();
      } else {
        heroVideo.pause();
      }
    });

    if (!prefersReducedMotion) {
      heroVideo.play().catch(function () {});
    }

    var heroExpandBtn = document.getElementById("hero-video-expand");

    if (heroExpandBtn) {
      heroExpandBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (heroVideo.requestFullscreen) {
          heroVideo.requestFullscreen();
        } else if (heroVideo.webkitRequestFullscreen) {
          heroVideo.webkitRequestFullscreen();
        } else if (heroVideo.webkitEnterFullscreen) {
          heroVideo.webkitEnterFullscreen();
        }
      });
    }
  }

  // Process timeline: the center line fills in as the section scrolls
  // through view. Desktop only — mobile keeps the plain stacked list.
  var processList = document.getElementById("process-list");
  var processFill = document.getElementById("process-line-fill");

  if (processList && processFill) {
    var processDesktopQuery = window.matchMedia("(min-width: 1025px)");

    var updateProcessLine = function () {
      var rect = processList.getBoundingClientRect();
      var progress = (window.innerHeight * 0.75 - rect.top) / rect.height;
      progress = Math.min(1, Math.max(0, progress));
      processFill.style.height = progress * 100 + "%";
    };

    var refreshProcessLine = function () {
      if (!processDesktopQuery.matches) {
        processFill.style.height = "";
        return;
      }
      if (prefersReducedMotion) {
        processFill.style.height = "100%";
        return;
      }
      updateProcessLine();
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!processDesktopQuery.matches || prefersReducedMotion) return;
        window.requestAnimationFrame(updateProcessLine);
      },
      { passive: true }
    );

    window.addEventListener("resize", refreshProcessLine);

    if (processDesktopQuery.addEventListener) {
      processDesktopQuery.addEventListener("change", refreshProcessLine);
    } else {
      processDesktopQuery.addListener(refreshProcessLine);
    }

    refreshProcessLine();
  }

  // Contact form: send in-page via EmailJS, no page leave, with a success animation
  var contactForm = document.getElementById("contact-form");

  if (contactForm && window.emailjs) {
    var submitBtn = document.getElementById("form-submit");
    var errorEl = document.getElementById("form-error");
    var successEl = document.getElementById("form-success");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      submitBtn.classList.add("is-loading");
      submitBtn.disabled = true;
      errorEl.hidden = true;

      Promise.all([
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, contactForm),
        emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_AUTOREPLY, contactForm),
      ])
        .then(function () {
          contactForm.hidden = true;
          successEl.hidden = false;
        })
        .catch(function () {
          submitBtn.classList.remove("is-loading");
          submitBtn.disabled = false;
          errorEl.hidden = false;
        });
    });
  }
})();
