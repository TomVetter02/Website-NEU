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

  // Hero scroll-pin: the circle starts at its resting size, then grows as
  // the hero stays pinned to the top of the viewport, until it has grown
  // to its full size — after that the page scrolls normally again.
  // Desktop only (see the matching 1024px breakpoint in style.css).
  var heroTrack = document.getElementById("hero-pin-track");
  var heroPin = document.getElementById("hero-pin");
  var heroCircle = document.getElementById("hero-circle");

  if (heroTrack && heroPin && heroCircle) {
    var HERO_CIRCLE_MIN = 300;
    var HERO_CIRCLE_MAX_VW = 0.62;
    var HERO_CIRCLE_MAX_CAP = 980;
    var HERO_EXIT_END = 0.75; // blocks are fully gone by 75% of the scroll
    var HERO_EXIT_X = 460;
    var HERO_EXIT_Y = 170;
    var HERO_EXIT_ROT = 11;
    var HERO_BUTTON_START = 0.9; // last word holds, then the button appears
    var HERO_WORD_SHIFT = 30;
    var heroDesktopQuery = window.matchMedia("(min-width: 1025px)");
    var heroWords = Array.prototype.slice.call(
      heroCircle.querySelectorAll(".hero-circle__word")
    );
    var heroBtn = document.getElementById("hero-circle-btn");
    var heroIntro = heroPin.querySelector(".hero__intro");
    var heroHeadline = heroPin.querySelector(".hero__headline");

    var heroMaxSize = function () {
      return Math.min(window.innerWidth * HERO_CIRCLE_MAX_VW, HERO_CIRCLE_MAX_CAP);
    };

    var layoutHeroPin = function () {
      var headerH = header.offsetHeight;
      heroPin.style.top = headerH + "px";
      heroPin.style.height = "calc(100vh - " + headerH + "px)";
    };

    // Words fade in, hold, and fade out one at a time as scroll progress
    // (0–1) moves through the pin. Each word owns an equal slice of the
    // range; a trapezoid envelope (fade in / hold / fade out) inside that
    // slice means one word is always fully gone before the next appears.
    // The last word ("Webseite?") is the exception: it fades in and then
    // holds instead of fading out, and once the scroll nears the very end
    // it slides up to make room for the "Na klar, Keule!" button below it.
    var updateHeroWords = function (progress, size) {
      heroCircle.style.setProperty("--hero-word-size", size * 0.16 + "px");

      var count = heroWords.length;
      var slice = 1 / count;
      var active = Math.min(count - 1, Math.floor(progress * count));
      var lastIndex = count - 1;

      var buttonT = Math.min(
        1,
        Math.max(0, (progress - HERO_BUTTON_START) / (1 - HERO_BUTTON_START))
      );

      heroWords.forEach(function (word, i) {
        var isLast = i === lastIndex;

        if (isLast) {
          word.style.transform = "translateY(" + -HERO_WORD_SHIFT * buttonT + "px)";
        }

        if (i !== active) {
          word.style.opacity = 0;
          return;
        }

        var t = (progress - active * slice) / slice;
        var opacity;
        if (isLast) {
          opacity = t < 0.25 ? t / 0.25 : 1; // fades in, then holds — no fade-out
        } else if (t < 0.25) {
          opacity = t / 0.25;
        } else if (t > 0.75) {
          opacity = (1 - t) / 0.25;
        } else {
          opacity = 1;
        }
        word.style.opacity = Math.min(1, Math.max(0, opacity));
      });

      if (heroBtn) {
        heroBtn.style.opacity = buttonT;
        heroBtn.style.transform = "translate(-50%, " + (14 - buttonT * 14) + "px)";
        heroBtn.style.pointerEvents = buttonT > 0.6 ? "auto" : "none";
        heroBtn.tabIndex = buttonT > 0.6 ? 0 : -1;
      }
    };

    var resetHeroWords = function () {
      heroWords.forEach(function (word) {
        word.style.opacity = 0;
        word.style.transform = "";
      });
      if (heroBtn) {
        heroBtn.style.opacity = "";
        heroBtn.style.transform = "";
        heroBtn.style.pointerEvents = "";
      }
    };

    // Intro block slides diagonally down-left, headline slides down-right,
    // both fading out — fully gone by HERO_EXIT_END so the circle owns the
    // full stage for the last stretch of its growth.
    var updateHeroBlocks = function (progress) {
      var t = Math.min(1, progress / HERO_EXIT_END);
      var opacity = 1 - t;

      if (heroIntro) {
        heroIntro.style.transform =
          "translate(" + -HERO_EXIT_X * t + "px, " + HERO_EXIT_Y * t + "px) rotate(" + -HERO_EXIT_ROT * t + "deg)";
        heroIntro.style.opacity = opacity;
        heroIntro.style.pointerEvents = t >= 1 ? "none" : "";
      }

      if (heroHeadline) {
        heroHeadline.style.transform =
          "translate(" + HERO_EXIT_X * t + "px, " + HERO_EXIT_Y * t + "px) rotate(" + HERO_EXIT_ROT * t + "deg)";
        heroHeadline.style.opacity = opacity;
      }
    };

    var resetHeroBlocks = function () {
      [heroIntro, heroHeadline].forEach(function (el) {
        if (!el) return;
        el.style.transform = "";
        el.style.opacity = "";
        el.style.pointerEvents = "";
      });
    };

    var updateHeroCircle = function () {
      var headerH = header.offsetHeight;
      var pinnedHeight = window.innerHeight - headerH;
      var scrollDistance = heroTrack.offsetHeight - pinnedHeight;
      var rectTop = heroTrack.getBoundingClientRect().top - headerH;
      var progress = scrollDistance > 0 ? -rectTop / scrollDistance : 0;
      progress = Math.min(1, Math.max(0, progress));

      // Grows evenly from its own center (the static translate(-50%, -50%)
      // on .portrait__circle in CSS) — .hero__top clips its own overflow,
      // so once the circle reaches that box's top or bottom edge, the
      // excess simply disappears instead of pushing anything around.
      var size = HERO_CIRCLE_MIN + (heroMaxSize() - HERO_CIRCLE_MIN) * progress;
      heroCircle.style.width = size + "px";
      heroCircle.style.height = size + "px";

      updateHeroWords(progress, size);
      updateHeroBlocks(progress);
    };

    var teardownHeroPin = function () {
      heroPin.style.top = "";
      heroPin.style.height = "";
      heroCircle.style.width = "";
      heroCircle.style.height = "";
      heroCircle.style.removeProperty("--hero-word-size");
      resetHeroWords();
      resetHeroBlocks();
    };

    var refreshHeroPin = function () {
      if (!heroDesktopQuery.matches) {
        teardownHeroPin();
        return;
      }
      if (prefersReducedMotion) {
        // Keep the original static layout: no pin, no growth, headline and
        // intro stay put and fully visible.
        teardownHeroPin();
        return;
      }
      layoutHeroPin();
      updateHeroCircle();
    };

    window.addEventListener(
      "scroll",
      function () {
        if (!heroDesktopQuery.matches || prefersReducedMotion) return;
        window.requestAnimationFrame(updateHeroCircle);
      },
      { passive: true }
    );

    window.addEventListener("resize", refreshHeroPin);

    if (heroDesktopQuery.addEventListener) {
      heroDesktopQuery.addEventListener("change", refreshHeroPin);
    } else {
      heroDesktopQuery.addListener(refreshHeroPin);
    }

    refreshHeroPin();
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
