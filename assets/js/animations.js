/* ==========================================================================
   ANIMATIONS.JS
   Activa las clases .reveal / .reveal-left / .reveal-right / .reveal-scale
   definidas en animations.css cuando el elemento entra en el viewport,
   usando IntersectionObserver (más eficiente que escuchar el scroll).
   También anima los números de la barra de stats (contador ascendente).
   Expone window.initAnimations() para ser llamado desde main.js
   ========================================================================== */

function initAnimations() {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ------------------------------------------------------------------------
     STAGGER AUTOMÁTICO — asigna reveal + reveal-delay-N a hijos de un grid
     marcado con data-stagger, sin tener que escribir la clase a mano en
     cada card. Debe correr ANTES de buscar los elementos .reveal de abajo.
     ------------------------------------------------------------------------ */
  document.querySelectorAll('[data-stagger]').forEach((grid) => {
    Array.from(grid.children).forEach((child, index) => {
      const delayIndex = (index % 6) + 1;
      child.classList.add('reveal', `reveal-delay-${delayIndex}`);
    });
  });

  /* ------------------------------------------------------------------------
     SCROLL REVEAL
     ------------------------------------------------------------------------ */
  const revealSelectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const revealElements = document.querySelectorAll(revealSelectors);

  if (revealElements.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      /* Sin soporte o con reduce-motion: mostrar todo de inmediato */
      revealElements.forEach((el) => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -60px 0px',
        }
      );

      revealElements.forEach((el) => revealObserver.observe(el));
    }
  }

  /* ------------------------------------------------------------------------
     CONTADOR ANIMADO — barra de stats (ej. "500+ alumnos")
     Requiere que el elemento tenga data-counter-target="500" y
     opcionalmente data-counter-suffix="+"
     ------------------------------------------------------------------------ */
  const counterElements = document.querySelectorAll('[data-counter-target]');

  if (counterElements.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counterElements.forEach((el) => {
        const target = parseInt(el.getAttribute('data-counter-target'), 10);
        const suffix = el.getAttribute('data-counter-suffix') || '';
        el.textContent = `${target}${suffix}`;
      });
    } else {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counterElements.forEach((el) => counterObserver.observe(el));
    }
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter-target'), 10);
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const duration = 1400;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* easeOutQuad para que desacelere al final, se siente más natural */
      const eased = 1 - (1 - progress) * (1 - progress);
      const currentValue = Math.round(eased * target);

      el.textContent = `${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = `${target}${suffix}`;
      }
    }

    requestAnimationFrame(step);
  }
}

window.initAnimations = initAnimations;
