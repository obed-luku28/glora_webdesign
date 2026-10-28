/* =========================================================
   GLORA – Scripts (JavaScript vanille, aucune librairie)
   1. Menu burger (mobile)
   2. Lien actif dans le menu selon la section visible
   3. Apparition au scroll
   4. Masquer les réseaux non renseignés
   5. Année du footer
   ========================================================= */

(function () {
  'use strict';

  // Active les styles d'animation uniquement si JavaScript fonctionne
  document.documentElement.classList.add('js');

  /* ---------- 1. Menu burger ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  }

  burger.addEventListener('click', function () {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });

  // Ferme le menu après un clic sur un lien
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  // Ferme le menu avec Échap
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  // Ferme le menu si on passe en affichage PC
  window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- 2. Lien actif ---------- */
  var navLinks = Array.prototype.slice.call(menu.querySelectorAll('.nav-link'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      var active = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { sectionObserver.observe(section); });

    // Hero ou contact : aucun lien n'est surligné
    ['accueil', 'contact'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) setActive('');
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(el);
    });
  }

  /* ---------- 3. Apparition au scroll ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* ---------- 4. Réalisations : Capture automatique & redirection ---------- */
  function initProjectScreenshots() {
    var projects = document.querySelectorAll('.project');

    projects.forEach(function (project) {
      var overlayEl = project.querySelector('.project-overlay');
      var rawUrl = project.getAttribute('data-url') || (overlayEl ? overlayEl.getAttribute('href') : '');
      if (!rawUrl) return;

      // S'assure que l'URL a bien son protocole https://
      var siteUrl = rawUrl.trim();
      if (!/^https?:\/\//i.test(siteUrl)) {
        siteUrl = 'https://' + siteUrl;
        project.setAttribute('data-url', siteUrl);
      }

      // Récupération ou création du conteneur média
      var media = project.querySelector('.project-media');
      if (!media) {
        media = document.createElement('div');
        media.className = 'project-media';
        project.insertBefore(media, project.firstChild);
      }

      // Récupération du titre du projet pour l'accessibilité
      var titleEl = project.querySelector('strong');
      var projectName = titleEl ? titleEl.textContent.trim() : 'Projet';

      // Récupération ou création de l'image de couverture
      var img = media.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = 'Aperçu du site ' + projectName;
        media.appendChild(img);
      }

      // URLs de génération automatique de capture d'écran
      // 1. WordPress mShots (gratuit, rapide, sans clé API)
      var mshotsUrl = 'https://s0.wp.com/mshots/v1/' + encodeURIComponent(siteUrl) + '?w=900';
      // 2. Microlink en secours
      var fallbackUrl = 'https://api.microlink.io/?url=' + encodeURIComponent(siteUrl) + '&screenshot=true&meta=false&embed=screenshot.url';

      var currentSrc = img.getAttribute('src') || '';
      var needsAutoScreenshot = !currentSrc || currentSrc.indexOf('picsum.photos') !== -1 || img.dataset.auto === 'true';

      if (needsAutoScreenshot) {
        media.classList.add('is-loading');

        var tempImg = new Image();
        tempImg.onload = function () {
          img.src = tempImg.src;
          media.classList.remove('is-loading');
        };
        tempImg.onerror = function () {
          // Essai avec le service de secours
          if (tempImg.src !== fallbackUrl) {
            tempImg.src = fallbackUrl;
          } else {
            media.classList.remove('is-loading');
          }
        };
        tempImg.src = mshotsUrl;
      }

      // Création / mise à jour du lien de redirection au clic sur l'icône Font Awesome
      var overlay = media.querySelector('.project-overlay');
      if (!overlay) {
        overlay = document.createElement('a');
        overlay.className = 'project-overlay';
        overlay.innerHTML = '<span class="project-icon-badge" aria-hidden="true"><i class="fa-solid fa-arrow-up-right-from-square"></i></span>';
        media.appendChild(overlay);
      }

      overlay.href = siteUrl;
      overlay.target = '_blank';
      overlay.rel = 'noopener noreferrer';
      overlay.setAttribute('aria-label', 'Visiter le site ' + projectName + ' (s\'ouvre dans un nouvel onglet)');
    });
  }

  initProjectScreenshots();

  /* ---------- 5. Réseaux non renseignés ---------- */
  // Un lien qui contient encore des crochets [LIEN_...] est considéré comme vide.
  document.querySelectorAll('[data-social]').forEach(function (item) {
    var link = item.querySelector('a');
    if (link && link.getAttribute('href').indexOf('[') !== -1) {
      item.hidden = true;
    }
  });

  // Masque la liste entière si aucun réseau n'est renseigné
  document.querySelectorAll('[data-socials]').forEach(function (list) {
    var visible = list.querySelectorAll('[data-social]:not([hidden])').length;
    if (visible === 0) list.hidden = true;
  });

  /* ---------- 6. Année du footer ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
