/* ==========================================================================
   WHATSAPP-FLOAT.JS
   Controla el botón flotante de WhatsApp: arma el link wa.me con número y
   mensaje predefinido (editables vía data-attributes en el HTML), muestra
   el pulso de atención solo al inicio, y lo pausa al hacer hover/focus.
   Expone window.initWhatsappFloat() para ser llamado desde main.js
   ========================================================================== */

function initWhatsappFloat() {
  const button = document.querySelector('[data-whatsapp-float]');

  if (!button) return;

  /* ------------------------------------------------------------------------
     Configuración — se lee de data-attributes en el HTML para que sea
     fácil de editar sin tocar JS:
     <a data-whatsapp-float data-phone="5215512345678" data-message="Hola...">
     ------------------------------------------------------------------------ */
  const phone = button.getAttribute('data-phone') || '5215500000000';
  const defaultMessage =
    button.getAttribute('data-message') ||
    'Hola, me gustaria recibir informacion sobre los cursos de ingles.';

  const encodedMessage = encodeURIComponent(defaultMessage);
  button.setAttribute(
    'href',
    `https://wa.me/${phone}?text=${encodedMessage}`
  );
  button.setAttribute('target', '_blank');
  button.setAttribute('rel', 'noopener noreferrer');
  button.setAttribute('aria-label', 'Contactar por WhatsApp');

  /* ------------------------------------------------------------------------
     Pulso de atención: solo durante los primeros segundos de la visita,
     para no distraer permanentemente. Se detiene al hacer hover/focus
     o interactuar con la página.
     ------------------------------------------------------------------------ */
  const PULSE_DURATION_MS = 8000;

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    button.classList.add('pulse');

    const stopPulse = () => button.classList.remove('pulse');

    setTimeout(stopPulse, PULSE_DURATION_MS);
    button.addEventListener('mouseenter', stopPulse, { once: true });
    button.addEventListener('focus', stopPulse, { once: true });
  }

  /* ------------------------------------------------------------------------
     Ocultar temporalmente si el formulario de contacto está en pantalla,
     para no tapar el botón "Enviar" en móviles pequeños
     ------------------------------------------------------------------------ */
  const contactForm = document.querySelector('[data-contact-form]');

  if (contactForm && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          button.style.opacity = entry.isIntersecting ? '0.35' : '1';
          button.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(contactForm);
  }
}

window.initWhatsappFloat = initWhatsappFloat;
