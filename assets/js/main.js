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
