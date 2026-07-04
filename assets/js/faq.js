/* ==========================================================================
   FAQ.JS
   Controla el acordeón de preguntas frecuentes: abrir/cerrar cada item,
   cerrar los demás al abrir uno nuevo (modo acordeón exclusivo), y
   accesibilidad vía aria-expanded / aria-hidden.
   Expone window.initFaq() para ser llamado desde main.js
   ========================================================================== */

function initFaq() {
  const faqItems = document.querySelectorAll('[data-faq-item]');

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const question = item.querySelector('[data-faq-question]');
    const answer = item.querySelector('[data-faq-answer]');

    if (!question || !answer) return;

    /* Estado inicial: cerrado y con atributos de accesibilidad correctos */
    question.setAttribute('aria-expanded', 'false');
    answer.setAttribute('aria-hidden', 'true');

    question.addEventListener('click', () => {
      const isCurrentlyOpen = item.classList.contains('is-open');

      /* Modo acordeón exclusivo: cierra todos los demás items */
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
          const otherQuestion = otherItem.querySelector('[data-faq-question]');
          const otherAnswer = otherItem.querySelector('[data-faq-answer]');
          if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.setAttribute('aria-hidden', 'true');
        }
      });

      /* Toggle del item actual */
      item.classList.toggle('is-open', !isCurrentlyOpen);
      question.setAttribute('aria-expanded', (!isCurrentlyOpen).toString());
      answer.setAttribute('aria-hidden', isCurrentlyOpen.toString());
    });

    /* Permitir navegación y activación con teclado (Enter / Espacio) */
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  /* ------------------------------------------------------------------------
     Abrir automáticamente un item si la URL trae un hash que coincide
     con su id (ej. faq.html#envios-internacionales)
     ------------------------------------------------------------------------ */
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const target = document.getElementById(hash);
    if (target && target.hasAttribute('data-faq-item')) {
      const question = target.querySelector('[data-faq-question]');
      if (question) {
        question.click();
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}

window.initFaq = initFaq;
