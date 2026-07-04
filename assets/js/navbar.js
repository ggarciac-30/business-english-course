/* ==========================================================================
   RESPONSIVE.CSS
   Ajustes finos de breakpoints globales que no viven ya en cada archivo
   individual (variables.css define los valores base; layout.css y
   components.css ya resuelven sus propios breakpoints puntuales).
   Aquí solo va lo transversal: spacing, contenedores, secciones, tipografía.

   Breakpoints usados en todo el proyecto:
   - 1200px  → escritorio grande / laptop
   - 992px   → tablet horizontal / laptop pequeño
   - 768px   → tablet vertical
   - 576px   → móvil grande
   - 375px   → móvil pequeño (ajustes mínimos)
   ========================================================================== */


/* --------------------------------------------------------------------------
   1200px — LAPTOP / ESCRITORIO PEQUEÑO
   -------------------------------------------------------------------------- */

@media (max-width: 1200px) {
  :root {
    --container-max: 1040px;
  }
}


/* --------------------------------------------------------------------------
   992px — TABLET HORIZONTAL
   -------------------------------------------------------------------------- */

@media (max-width: 992px) {
  :root {
    --container-max: 100%;
    --container-padding: var(--space-lg);
  }

  .section {
    padding-block: var(--space-3xl);
  }

  .section-sm {
    padding-block: var(--space-xl);
  }

  .section-header {
    margin-bottom: var(--space-xl);
  }
}


/* --------------------------------------------------------------------------
   768px — TABLET VERTICAL
   -------------------------------------------------------------------------- */

@media (max-width: 768px) {
  :root {
    --header-height: 64px;
    --container-padding: var(--space-md);
  }

  .section {
    padding-block: var(--space-2xl);
  }

  .section-sm {
    padding-block: var(--space-lg);
  }

  .btn-lg {
    padding: var(--space-sm) var(--space-xl);
    font-size: var(--fs-base);
  }

  .card {
    padding: var(--space-lg);
  }

  .hero-actions,
  .cta-banner .flex {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn,
  .cta-banner .btn {
    width: 100%;
  }
}


/* --------------------------------------------------------------------------
   576px — MÓVIL GRANDE
   -------------------------------------------------------------------------- */

@media (max-width: 576px) {
  :root {
    --container-padding: var(--space-sm);
  }

  .section {
    padding-block: var(--space-xl);
  }

  .section-header {
    margin-bottom: var(--space-lg);
  }

  .section-eyebrow {
    font-size: var(--fs-xs);
  }

  .btn {
    width: 100%;
  }

  .btn-inline {
    width: auto;
  }

  .pricing-card--featured {
    transform: none;
  }
}


/* --------------------------------------------------------------------------
   375px — MÓVIL PEQUEÑO (ajustes mínimos, solo lo esencial)
   -------------------------------------------------------------------------- */

@media (max-width: 375px) {
  h1 { font-size: var(--fs-3xl); }
  h2 { font-size: var(--fs-2xl); }

  .navbar-brand-name {
    font-size: var(--fs-base);
  }

  .whatsapp-float,
  .scroll-top-btn {
    width: 48px;
    height: 48px;
  }
}


/* --------------------------------------------------------------------------
   ORIENTACIÓN — ajuste para tablets en horizontal con poca altura
   -------------------------------------------------------------------------- */

@media (max-height: 500px) and (orientation: landscape) {
  .hero {
    padding-block: var(--space-xl);
  }

  .navbar-links {
    padding-block: var(--space-lg);
  }
}


/* --------------------------------------------------------------------------
   PANTALLAS GRANDES — límite superior para que el contenido no se estire
   demasiado en monitores ultra-wide
   -------------------------------------------------------------------------- */

@media (min-width: 1600px) {
  :root {
    --container-max: 1320px;
  }
}


/* --------------------------------------------------------------------------
   IMPRESIÓN — oculta elementos no relevantes al imprimir (ej. contacto/FAQ)
   -------------------------------------------------------------------------- */

@media print {
  .navbar,
  .whatsapp-float,
  .scroll-top-btn,
  .hero-floating-badge,
  .footer-social,
  .btn {
    display: none !important;
  }

  body {
    color: #000;
    background: #fff;
  }

  a {
    text-decoration: underline;
  }
}
