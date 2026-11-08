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
  const failureBox = form.querySelector('[data-form-failure]');

  /* ------------------------------------------------------------------------
     Reglas de validación por campo
     ------------------------------------------------------------------------ */
  /* Cada validador regresa '' si el valor es válido, o el mensaje de error */
  const validators = {
    name: (value) =>
      value.trim().length >= 2 ? '' : 'Escribe tu nombre completo (mínimo 2 caracteres).',
    email: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Ingresa un correo electrónico válido.',
    phone: (value) => validateMexicanPhone(value).error,
    message: (value) =>
      value.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).',
  };

  /* ------------------------------------------------------------------------
     Validar un campo individual y reflejar el estado en el DOM
     ------------------------------------------------------------------------ */
  function validateField(field) {
    const name = field.getAttribute('name');
    const validator = validators[name];

    if (!validator) return true;

    const errorText = validator(field.value);
    const isValid = errorText === '';
    const group = field.closest('.form-group');

    field.setAttribute('aria-invalid', String(!isValid));

    if (!group) return isValid;

    const errorEl = group.querySelector('.form-error');

    if (isValid) {
      group.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
    } else {
      group.classList.add('has-error');
      if (errorEl) errorEl.textContent = errorText;
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

    /* Envía el teléfono normalizado a 10 dígitos (ej. 5529728886) */
    const phoneField = form.querySelector('[name="phone"]');
    if (phoneField) {
      const { digits } = validateMexicanPhone(phoneField.value);
      if (digits) phoneField.value = digits;
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

      if (failureBox) failureBox.classList.remove('is-visible');
      showSuccess();
      form.reset();
    } catch (error) {
      /* Si falla el envío, se avisa y se conservan los datos capturados para
         reintentar; también se ofrece WhatsApp para no perder al prospecto */
      console.error('Error al enviar el formulario:', error);
      showFailure();
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

  function showFailure() {
    if (!failureBox) return;
    if (successBox) successBox.classList.remove('is-visible');
    failureBox.classList.add('is-visible');
    failureBox.setAttribute('role', 'alert');
    failureBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

/* ==========================================================================
   VALIDACIÓN DE TELÉFONO MEXICANO
   Plan de numeración del IFT: 10 dígitos (clave de larga distancia + número).
   Ninguna clave inicia con 0 ni con 1. Acepta espacios, guiones, paréntesis
   y el prefijo internacional +52 (también el antiguo 044/045/1 de celular).
   Regresa { error, digits }: error = '' si es válido; digits = 10 dígitos.
   ========================================================================== */
function validateMexicanPhone(raw) {
  const value = String(raw || '').trim();

  if (value === '') {
    return { error: 'El teléfono es obligatorio para poder contactarte.', digits: '' };
  }

  if (/[^\d\s().+-]/.test(value)) {
    return { error: 'Usa solo números (puedes separarlos con espacios o guiones).', digits: '' };
  }

  let digits = value.replace(/\D/g, '');

  /* Prefijos que no forman parte de los 10 dígitos */
  if (digits.length === 13 && digits.startsWith('521')) digits = digits.slice(3);
  else if (digits.length === 12 && digits.startsWith('52')) digits = digits.slice(2);
  else if (digits.length === 13 && /^04[45]/.test(digits)) digits = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);

  if (digits.length < 10) {
    const missing = 10 - digits.length;
    return {
      error: `El teléfono debe tener 10 dígitos (te ${missing === 1 ? 'falta 1' : `faltan ${missing}`}).`,
      digits: '',
    };
  }

  if (digits.length > 10) {
    return { error: 'El teléfono debe tener 10 dígitos, incluida la clave de larga distancia.', digits: '' };
  }

  if (/^[01]/.test(digits)) {
    return { error: 'En México ningún número de 10 dígitos empieza con 0 ni con 1.', digits: '' };
  }

  const invalid = { error: 'Ese número no parece válido. Revisa que esté completo y bien escrito.', digits: '' };

  /* Todos los dígitos iguales (5555555555) */
  if (/^(\d)\1{9}$/.test(digits)) return invalid;

  /* Seis o más dígitos iguales seguidos (5500000012, 5511111189) */
  if (/(\d)\1{5,}/.test(digits)) return invalid;

  /* Demasiados ceros en total */
  if ((digits.match(/0/g) || []).length >= 7) return invalid;

  /* Secuencias ascendentes o descendentes (2345678901, 9876543210) */
  const steps = [...digits].slice(1).map((d, i) => (Number(d) - Number(digits[i]) + 10) % 10);
  if (steps.every((s) => s === 1) || steps.every((s) => s === 9)) return invalid;

  /* Números de ejemplo comunes */
  if (['5512345678', '5523456789', '5500000000'].includes(digits)) return invalid;

  return { error: '', digits };
}

window.initFormValidation = initFormValidation;
window.validateMexicanPhone = validateMexicanPhone;
