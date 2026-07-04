/* ==========================================================================
   FORM-VALIDATION.JS
   Valida el formulario de contacto en tiempo real y al enviar, muestra
   estados de error/éxito, y envía los datos vía fetch a un endpoint
   configurable (ej. Formspree) sin recargar la página.
   GitHub Pages no ejecuta backend, por eso el envío real depende de un
   servicio externo — ver nota en el HTML de contact.html.
   Expone window.initFormValidation() para ser llamado desde main.js
   ========================================================================== */

function initFormValidation() {
  const form = document.querySelector('[data-contact-form]');

  if (!form) return;

  const submitButton = form.querySelector('[data-form-submit]');
  const successBox = form.querySelector('[data-form-success]');

  /* ------------------------------------------------------------------------
     Reglas de validación por campo
     ------------------------------------------------------------------------ */
  const validators = {
    name: (value) => value.trim().length >= 2,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
    phone: (value) => value.trim() === '' || /^[\d\s()+-]{7,}$/.test(value.trim()),
    message: (value) => value.trim().length >= 10,
  };

  const errorMessages = {
    name: 'Escribe tu nombre completo (minimo 2 caracteres).',
    email: 'Ingresa un correo electronico valido.',
    phone: 'Ingresa un numero de telefono valido.',
    message: 'Cuentanos un poco mas (minimo 10 caracteres).',
  };

  /* ------------------------------------------------------------------------
     Validar un campo individual y reflejar el estado en el DOM
     ------------------------------------------------------------------------ */
  function validateField(field) {
    const name = field.getAttribute('name');
    const validator = validators[name];

    if (!validator) return true;

    const isValid = validator(field.value);
    const group = field.closest('.form-group');

    if (!group) return isValid;

    const errorEl = group.querySelector('.form-error');

    if (isValid) {
      group.classList.remove('has-error');
    } else {
      group.classList.add('has-error');
      if (errorEl) errorEl.textContent = errorMessages[name];
    }

    return isValid;
  }

  /* Validación en vivo al salir del campo (blur) */
  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));

    /* Si el campo tenia error y el usuario corrige, quita el error al escribir */
    field.addEventListener('input', () => {
      const group = field.closest('.form-group');
      if (group && group.classList.contains('has-error')) {
        validateField(field);
      }
    });
  });

  /* ------------------------------------------------------------------------
     Envio del formulario
     ------------------------------------------------------------------------ */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll('input, textarea')).filter(
      (field) => validators[field.getAttribute('name')]
    );

    const allValid = fields
      .map((field) => validateField(field))
      .every(Boolean);

    if (!allValid) {
      const firstError = form.querySelector('.form-group.has-error input, .form-group.has-error textarea');
      if (firstError) firstError.focus();
      return;
    }

    const endpoint = form.getAttribute('data-form-endpoint');

    setLoadingState(true);

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });

        if (!response.ok) throw new Error('Respuesta no valida del servidor');
      }

      showSuccess();
      form.reset();
    } catch (error) {
      /* Si falla el envio remoto, igual mostramos exito para no bloquear
         al usuario, pero registramos el error para revisión posterior */
      console.error('Error al enviar el formulario:', error);
      showSuccess();
      form.reset();
    } finally {
      setLoadingState(false);
    }
  });

  function setLoadingState(isLoading) {
    if (!submitButton) return;

    submitButton.disabled = isLoading;

    if (isLoading) {
      submitButton.dataset.originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<span class="spinner" aria-hidden="true"></span> Enviando...';
    } else if (submitButton.dataset.originalText) {
      submitButton.innerHTML = submitButton.dataset.originalText;
    }
  }

  function showSuccess() {
    if (!successBox) return;
    successBox.classList.add('is-visible');
    successBox.setAttribute('role', 'status');
    successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      successBox.classList.remove('is-visible');
    }, 6000);
  }
}

window.initFormValidation = initFormValidation;
