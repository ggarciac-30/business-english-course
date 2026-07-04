/* ==========================================================================
   MAIN.JS
   Orquestador principal. Espera a que el DOM esté listo y llama a cada
   función de inicialización expuesta por los demás archivos JS.

   IMPORTANTE — orden de carga en el HTML: este script debe ir DESPUÉS de
   navbar.js, faq.js, scroll-top.js, whatsapp-float.js, form-validation.js
   y animations.js, para que window.initX ya existan cuando se ejecute.

   <script src="assets/js/navbar.js"></script>
   <script src="assets/js/faq.js"></script>
   <script src="assets/js/scroll-top.js"></script>
   <script src="assets/js/whatsapp-float.js"></script>
   <script src="assets/js/form-validation.js"></script>
   <script src="assets/js/animations.js"></script>
   <script src="assets/js/main.js"></script>
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* Lista de inicializadores. Si alguna página no tiene el elemento
     correspondiente (ej. faq.html no existe el whatsapp-float), cada
     función ya valida internamente con un "if (!el) return;" y no truena. */
  const initializers = [
    { name: 'initNavbar', fn: window.initNavbar },
    { name: 'initFaq', fn: window.initFaq },
    { name: 'initScrollTop', fn: window.initScrollTop },
    { name: 'initWhatsappFloat', fn: window.initWhatsappFloat },
    { name: 'initFormValidation', fn: window.initFormValidation },
    { name: 'initAnimations', fn: window.initAnimations },
  ];

  initializers.forEach(({ name, fn }) => {
    if (typeof fn !== 'function') {
      console.warn(`[main.js] ${name} no esta definido. Verifica que el script correspondiente se haya cargado antes de main.js.`);
      return;
    }

    try {
      fn();
    } catch (error) {
      console.error(`[main.js] Error al ejecutar ${name}:`, error);
    }
  });

  /* ------------------------------------------------------------------------
     Año dinámico en el footer (©️ 2026 se actualiza solo cada año)
     Requiere <span data-current-year></span> en el footer
     ------------------------------------------------------------------------ */
  const yearEl = document.querySelector('[data-current-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------------
     Lazy loading de imágenes marcadas con class="lazy" y data-src
     (complementa el loading="lazy" nativo del navegador para navegadores
     viejos, y activa el fade-in definido en animations.css)
     ------------------------------------------------------------------------ */
  const lazyImages = document.querySelectorAll('img.lazy[data-src]');

  if (lazyImages.length && 'IntersectionObserver' in window) {
    const lazyObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute('data-src');
            img.addEventListener('load', () => img.classList.add('is-loaded'));
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' }
    );

    lazyImages.forEach((img) => lazyObserver.observe(img));
  } else {
    /* Fallback para navegadores sin soporte: carga todo de inmediato */
    lazyImages.forEach((img) => {
      img.src = img.getAttribute('data-src');
      img.classList.add('is-loaded');
    });
  }
});
