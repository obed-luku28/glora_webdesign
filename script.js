/* =========================================================
   GLORA – Scripts (JavaScript vanille natif, aucune dépendance)
   1. Menu mobile (burger)
   2. En-tête avec ombre au défilement
   3. Lien actif dans la navigation (ScrollSpy)
   4. Apparition progressive des éléments (Scroll Reveal)
   5. Compteurs animés pour les chiffres clés
   6. Réalisations : Capture d'écran automatique et redirection
   7. Accordéon FAQ accessible
   8. Année dynamique du pied de page
   ========================================================= */

(function () {
  'use strict';

  // Active les styles avancés uniquement lorsque JavaScript est supporté
  document.documentElement.classList.add('js');

  /* ---------- 1. Menu mobile (burger) ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    if (!menu || !burger) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var isOpen = burger.getAttribute('aria-expanded') === 'true';
      setMenu(!isOpen);
    });

    // Ferme le menu après un clic sur un lien interne
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setMenu(false);
      });
    });

    // Ferme le menu avec la touche Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });

    // Ferme le menu lors du passage en affichage tablette/PC
    window.matchMedia('(min-width: 860px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- 2. En-tête avec ombre au défilement ---------- */
  var header = document.getElementById('header');

  function updateHeaderScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  /* ---------- 3. Lien actif dans la navigation (ScrollSpy) ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('#menu .nav-link'));
  var sections = navLinks
    .map(function (link) {
      var targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        return document.querySelector(targetId);
      }
      return null;
    })
    .filter(Boolean);

  function setActiveNavLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length > 0) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveNavLink(entry.target.id);
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px' });

    sections.forEach(function (section) {
      spyObserver.observe(section);
    });

    // Sur la section Hero (accueil) : aucun onglet n'est actif
    var heroEl = document.getElementById('accueil');
    if (heroEl) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          setActiveNavLink('');
        }
      }, { rootMargin: '-30% 0px -60% 0px' }).observe(heroEl);
    }
  }

  /* ---------- 4. Apparition progressive (Scroll Reveal) ---------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealElements = document.querySelectorAll('.reveal');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- 5. Compteurs animés pour les chiffres clés ---------- */
  function animateCounter(counterEl) {
    var target = parseInt(counterEl.getAttribute('data-target'), 10);
    if (isNaN(target)) return;

    var duration = 1600; // millisecondes
    var startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      var progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing out cubic pour un ralentissement naturel à la fin
      var easeOutProgress = 1 - Math.pow(1 - progress, 3);
      var currentVal = Math.floor(easeOutProgress * target);
      counterEl.textContent = String(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        counterEl.textContent = String(target);
      }
    }

    window.requestAnimationFrame(step);
  }

  var counterElements = document.querySelectorAll('.counter');
  if (counterElements.length > 0) {
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      var counterObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      counterElements.forEach(function (el) {
        counterObserver.observe(el);
      });
    } else {
      counterElements.forEach(function (el) {
        el.textContent = el.getAttribute('data-target') || '0';
      });
    }
  }

  /* ---------- 6. Réalisations : Capture d'écran automatique ---------- */
  function initProjectScreenshots() {
    var projects = document.querySelectorAll('.project[data-url]');

    projects.forEach(function (project) {
      var rawUrl = project.getAttribute('data-url');
      if (!rawUrl) return;

      var siteUrl = rawUrl.trim();
      if (!/^https?:\/\//i.test(siteUrl)) {
        siteUrl = 'https://' + siteUrl;
        project.setAttribute('data-url', siteUrl);
      }

      var media = project.querySelector('.project-media');
      if (!media) return;

      var titleEl = project.querySelector('strong');
      var projectName = titleEl ? titleEl.textContent.trim() : 'Projet';

      var img = media.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = 'Aperçu du site ' + projectName;
        media.appendChild(img);
      }

      // 1. Service principal gratuit WordPress mShots
      var mshotsUrl = 'https://s0.wp.com/mshots/v1/' + encodeURIComponent(siteUrl) + '?w=900';
      // 2. Service de secours Microlink
      var fallbackUrl = 'https://api.microlink.io/?url=' + encodeURIComponent(siteUrl) + '&screenshot=true&meta=false&embed=screenshot.url';

      media.classList.add('is-loading');

      var tempImg = new Image();
      tempImg.onload = function () {
        img.src = tempImg.src;
        media.classList.remove('is-loading');
      };
      tempImg.onerror = function () {
        if (tempImg.src !== fallbackUrl) {
          tempImg.src = fallbackUrl;
        } else {
          media.classList.remove('is-loading');
        }
      };
      tempImg.src = mshotsUrl;

      // Lien overlay "Voir le projet"
      var overlay = media.querySelector('.project-overlay');
      if (overlay) {
        overlay.href = siteUrl;
        overlay.target = '_blank';
        overlay.rel = 'noopener noreferrer';
      }
    });
  }

  initProjectScreenshots();

  /* ---------- 7. Accordéon FAQ accessible ---------- */
  // Ferme automatiquement les autres questions lorsqu'une question est ouverte
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (otherItem) {
          if (otherItem !== item && otherItem.open) {
            otherItem.open = false;
          }
        });
      }
    });
  });

  /* ---------- 8. Année dynamique du pied de page ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

})();
