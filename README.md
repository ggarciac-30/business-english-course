# Business English Course (BEC) — Sitio Web

Sitio web estático para **Business English Course**, academia de inglés online enfocada en adultos, universitarios, profesionales y empresas. Construido 100% con HTML5, CSS3 y JavaScript Vanilla, sin frameworks, listo para publicarse en GitHub Pages sin configuración adicional.

🔗 **Sitio en vivo:** https://ggarciac-30.github.io/business-english-course/

---

## Descripción

BEC ofrece cursos de inglés en modalidad grupal, individual, empresarial y personalizada, cubriendo desde nivel básico (A1) hasta dominio avanzado (C2) del Marco Común Europeo de Referencia (CEFR), además de preparación para certificaciones internacionales (TOEFL, IELTS) y programas de Business English para empresas.

Este repositorio contiene el sitio web completo: landing principal, páginas de curso individuales, equipo docente, testimonios, programas empresariales, preguntas frecuentes, contacto y páginas legales.

## Objetivo

Ofrecer una presencia web profesional, rápida y optimizada para SEO que:

- Comunique claramente la oferta educativa y el método de enseñanza.
- Facilite la conversión (agendar clase muestra, solicitar cotización empresarial).
- Funcione sin backend propio, aprovechando GitHub Pages y servicios externos (ej. Formspree para el formulario de contacto).
- Sea completamente responsive y accesible (WCAG).

## Tecnologías

- **HTML5** — semántico, con metadatos SEO (Open Graph, Twitter Cards, Schema.org)
- **CSS3** — arquitectura modular (variables, reset, base, layout, componentes, animaciones, responsive), sin frameworks ni preprocesadores
- **JavaScript Vanilla (ES6+)** — sin librerías ni frameworks, dividido por funcionalidad
- **Tabler Icons** (vía CDN) — iconografía
- **Google Fonts** (Poppins + Inter) — tipografía

Sin Bootstrap, sin React, sin Node.js como dependencia de build. El sitio se sirve directamente como archivos estáticos.

## Instalación

No requiere instalación ni proceso de build. Para trabajar en local:

```bash
git clone https://github.com/ggarciac-30/business-english-course.git
cd business-english-course
```

Abre `index.html` directamente en tu navegador, o usa un servidor local simple para evitar restricciones de CORS con `fetch` (usado en el formulario de contacto):

```bash
# Con Python 3
python3 -m http.server 8000

# Con la extensión "Live Server" de VS Code
# Clic derecho en index.html → "Open with Live Server"
```

Luego visita `http://localhost:8000`.

## Publicación en GitHub Pages

1. Ve a **Settings → Pages** en el repositorio de GitHub.
2. En **Source**, selecciona la rama `main` y la carpeta `/ (root)`.
3. Guarda. El sitio quedará disponible en `https://<tu-usuario>.github.io/<nombre-repo>/` en 1-3 minutos.

El archivo `.nojekyll` en la raíz evita que GitHub Pages procese el sitio con Jekyll, ya que es un sitio estático puro.

## Estructura del proyecto

```
business-english-course/
│
├── index.html                   Página principal
├── about.html                   Sobre nosotros
├── courses.html                 Listado de todos los cursos
├── pricing.html                 Comparativo de precios
├── course-*.html                8 páginas individuales de curso
├── teachers.html                Equipo docente
├── testimonials.html            Testimonios de alumnos
├── companies.html                Programas empresariales
├── faq.html                      Preguntas frecuentes
├── contact.html                   Formulario de contacto
├── privacy.html                   Aviso de privacidad
├── terms.html                     Términos y condiciones
├── 404.html                       Página de error personalizada
│
├── assets/
│   ├── css/                      7 archivos CSS modulares
│   │   ├── variables.css         Paleta de colores, tipografía, spacing
│   │   ├── reset.css             Normalización cross-browser
│   │   ├── base.css              Tipografía global, botones, badges
│   │   ├── layout.css            Navbar, hero, footer, grid system
│   │   ├── components.css        Cards, FAQ, formularios, pricing
│   │   ├── animations.css        Scroll-reveal, microinteracciones
│   │   └── responsive.css        Breakpoints globales
│   │
│   ├── js/                       7 archivos JS modulares
│   │   ├── navbar.js             Menú hamburguesa, sticky scroll
│   │   ├── faq.js                Acordeón de preguntas frecuentes
│   │   ├── scroll-top.js         Botón regresar arriba
│   │   ├── whatsapp-float.js     Botón flotante de WhatsApp
│   │   ├── form-validation.js    Validación y envío del formulario
│   │   ├── animations.js         IntersectionObserver, contadores
│   │   └── main.js               Orquestador principal
│   │
│   ├── images/                   Imágenes por sección (cursos, equipo, etc.)
│   ├── logos/                    Logo oficial de BEC
│   └── icons/                    Referencias de paleta e iconografía
│
├── favicon/                      Favicon en múltiples tamaños
├── README.md
├── LICENSE
├── sitemap.xml
├── robots.txt
└── .gitignore
```

## Personalización

- **Colores de marca:** editar únicamente `assets/css/variables.css` — todo el sitio usa custom properties (`--color-primary`, `--color-secondary`, `--color-cefr-*`, etc.), por lo que un solo cambio se propaga a todas las páginas.
- **Logo:** reemplazar `assets/logos/logo-bec.jpg` manteniendo el mismo nombre de archivo, o actualizar la ruta en el `<img>` del navbar/footer de cada página.
- **Número de WhatsApp:** actualizar el atributo `data-phone` en el botón flotante (`data-whatsapp-float`) de cada página.
- **Formulario de contacto:** agregar la URL de tu endpoint (ej. Formspree) en el atributo `data-form-endpoint` del `<form data-contact-form>` en `contact.html`.
- **Precios:** actualizar directamente en cada página de curso (`course-*.html`) y en la tabla comparativa de `pricing.html`.

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Créditos

- Iconografía: [Tabler Icons](https://tabler.io/icons)
- Tipografía: [Google Fonts](https://fonts.google.com) (Poppins, Inter)
- Desarrollado para Business English Course (BEC)
