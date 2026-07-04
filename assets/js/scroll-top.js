/* ==========================================================================
   SCROLL-TOP.JS
   Controla el botón flotante "regresar arriba": aparece después de bajar
   cierta distancia, y al hacer clic sube suavemente al inicio de la página.
   Expone window.initScrollTop() para ser llamado desde main.js
   ========================================================================== */

function initScrollTop() {
  const button = document.querySelector('[data-scroll-top]');

  if (!button) return;

  const SHOW_AFTER_PX = 400;
  let ticking = false;

  function updateVisibility() {
    if (window.scrollY > SHOW_AFTER_PX) {
      button.classList.add('is-visible');
    } else {
      button.classList.remove('is-visible');
    }
    ticking = false;
  }

  /* Throttle con requestAnimationFrame para no saturar el scroll event */
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateVisibility();

  button.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    /* Devuelve el foco al inicio de la página para usuarios de teclado */
    const mainContent = document.querySelector('main') || document.body;
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus({ preventScroll: true });
  });
}

window.initScrollTop = initScrollTop;
