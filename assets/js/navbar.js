/* ==========================================================================
   NAVBAR.JS
   Controla la barra de navegación:
   - Menú móvil (botón hamburguesa): abre/cierra .navbar-links con la clase
     .is-open, actualiza aria-expanded y el ícono, cierra con Escape, al
     elegir un enlace o al volver a escritorio.
   - Sombra al hacer scroll: agrega .is-scrolled a .navbar.
   Expone window.initNavbar() para ser llamado desde main.js
   ========================================================================== */

function initNavbar() {
  const navbar = document.querySelector('[data-navbar]');
  if (!navbar) return;

  const toggle = navbar.querySelector('[data-navbar-toggle]');
  const links = navbar.querySelector('[data-navbar-links]');
  const icon = toggle ? toggle.querySelector('i') : null;
  const DESKTOP_MQ = window.matchMedia('(min-width: 993px)');

  /* ------------------------------------------------------------------------
     Menú móvil
     ------------------------------------------------------------------------ */
  const setOpen = (open) => {
    if (!toggle || !links) return;
    if (open) {
      /* El alto del encabezado varía con el logo: el panel arranca justo debajo */
      links.style.top = `${Math.round(navbar.getBoundingClientRect().bottom)}px`;
    }
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menu' : 'Abrir menu');
    if (icon) {
      icon.classList.toggle('ti-menu-2', !open);
      icon.classList.toggle('ti-x', open);
    }
    document.body.style.overflow = open ? 'hidden' : '';
  };

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      setOpen(!links.classList.contains('is-open'));
    });

    links.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && links.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    const onViewportChange = (mq) => {
      if (mq.matches) setOpen(false);
    };
    if (DESKTOP_MQ.addEventListener) {
      DESKTOP_MQ.addEventListener('change', onViewportChange);
    } else if (DESKTOP_MQ.addListener) {
      DESKTOP_MQ.addListener(onViewportChange);
    }
  }

  /* ------------------------------------------------------------------------
     Sombra al hacer scroll
     ------------------------------------------------------------------------ */
  const SCROLLED_AFTER_PX = 10;
  let ticking = false;

  const updateScrolled = () => {
    navbar.classList.toggle('is-scrolled', window.scrollY > SCROLLED_AFTER_PX);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrolled);
      ticking = true;
    }
  }, { passive: true });

  updateScrolled();
}

window.initNavbar = initNavbar;
