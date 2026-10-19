# Zervitecnics Barcelona — Ecosistema Web A1

## Estructura del proyecto

```
zervitecnics-es/
├── index.html                       # Portada del dominio (multi-servicio)
├── llms.txt                         # Resumen del sitio para modelos de IA
├── sitemap.xml                      # Sitemap SEO (vertical + geo-pages)
├── sitemap-guias.xml                # Sitemap específico de guías
├── robots.txt                       # Directivas para buscadores
├── 404.html                         # Página de error
├── CNAME                            # Dominio GitHub Pages
├── aires-acondicionados/            # Vertical de aire acondicionado
│   ├── index.html                   # Hub del vertical
│   ├── precios.html                 # Tabla de precios de referencia
│   ├── ofertas.html                 # Packs con descuento vigente
│   ├── subvenciones.html            # Landing transaccional de subvenciones
│   ├── mantenimiento.html           # Hub de mantenimiento
│   ├── instalacion-personalizada.html
│   ├── gracias.html                 # Confirmación de formulario
│   ├── css/                         # Estilos del vertical
│   ├── js/                          # Lógica del vertical
│   ├── img/                         # Imágenes del vertical
│   ├── categorias/                  # Tipos de equipo (split, multisplit, conductos, cassette…)
│   ├── marcas/                      # Marca raíz + marca×ciudad + marca×capacidad
│   ├── capacidades/                 # Capacidad×ciudad (frigorías × municipio)
│   ├── zonas/                       # Zonas de instalación (distritos BCN + municipios)
│   ├── mantenimiento-zonas/         # Mantenimiento por zona
│   ├── mantenimiento-marcas/        # Mantenimiento por marca
│   ├── guias/                       # Contenido editorial informativo
│   └── legal/                       # Aviso legal, cookies, privacidad
├── docs/                            # Documentación interna del proyecto
│   └── MAPA_PALABRAS_CLAVE.md       # Mapa de keywords por intención
└── tools/                           # Generadores Node y datos fuente
    ├── data/                        # JSONs de ciudades, marcas, capacidades…
    └── *.js                         # Scripts de generación de páginas y sitemap
```

## Configuración actual

### 1. Formulario de presupuesto

El formulario está solo en el hub (`aires-acondicionados/index.html#presupuesto`); el resto
de páginas enlazan a él. Envía los datos a un Worker de Cloudflare
(`FORM_ENDPOINT` en `aires-acondicionados/js/shared.js`), que comprueba Cloudflare
Turnstile en el servidor y manda el correo. Ya no se usan EmailJS ni reCAPTCHA.

### 2. Google Tag Manager / Analytics

- GTM: `GTM-P6C8L3VX` · GA4: `G-N4C8H8KMFD` · Clarity: `xbowxa66oa` (en `shared.js` y en
  la cabecera de cada página).
- Consent Mode por defecto en `denied`; se actualiza al aceptar cookies.

### 3. Datos de contacto

- Teléfono: `625 215 983` (`+34625215983`).
- Correo: `info@zervitecnics.es`.
- Sin dirección postal (negocio de área de servicio).

### 4. Imágenes

Las imágenes en `aires-acondicionados/img/` son ilustrativas (generadas con IA) y sus textos
alternativos lo indican. Se pueden sustituir por fotos reales manteniendo los nombres.

### 5. Generadores de contenido

- `tools/apply-distritos.js` + `tools/data/distritos.json`: páginas de zona (10 distritos y
  7 municipios) con barrios, viviendas, normativa, preguntas y fuentes.
- `tools/build-catala.js` + `tools/data/distritos-ca.json`: páginas en catalán
  (`/ca/aire-condicionat/` y los 10 distritos), con hreflang es/ca en las dos versiones.
- `tools/apply-noindex.js` + `tools/data/noindex-temporal.json`: noindex temporal
  (quitar una página de la lista y volver a ejecutar para que vuelva a indexarse).
- `tools/shorten-titles.js`: acorta títulos de más de 65 caracteres.
- `tools/apply-mantenimiento-local.js` + `tools/data/mantenimiento-zonas-local.json`:
  bloque local de las páginas de mantenimiento por zona.
- `tools/build-opiniones-section.js` + `data/reviews.json`: reseñas reales en carrusel.
- `tools/generate-sitemap.js`: sitemaps con `lastmod` del último commit de cada página.
- `npm run check:seo` (en `tools/`): comprobador de títulos, canónicas y sitemaps.

## Despliegue

GitHub Pages publica la rama `main` en `zervitecnics.es` (archivo `CNAME`). Cada push a
`main` publica la web: trabajar en otra rama y publicar solo con el visto bueno del titular.

## SEO — Mapa de palabras clave

El inventario completo de intenciones y palabras clave por tipo de página
(hub, precios, ofertas, subvenciones, categorías, marcas raíz, marca-ciudad,
marca-capacidad, capacidad-ciudad, zonas, mantenimiento, guías, legal y
portada), junto con las canibalizaciones detectadas y los huecos de intención,
vive en [`docs/MAPA_PALABRAS_CLAVE.md`](docs/MAPA_PALABRAS_CLAVE.md).

Validar con Search Console cuando haya al menos 60 días de datos.

## Reglas para páginas nuevas

Toda página nueva (servicio, zona, marca, guía o cualquier otro tipo) debe
cumplir todos los puntos siguientes **antes de publicarse**:

- **a) Keyword e intención asignadas.** Tener una *keyword principal* y una
  *intención* (informativa / comparación / transaccional / local) asignadas
  en el mapa, y quedar registrada en
  [`docs/MAPA_PALABRAS_CLAVE.md`](docs/MAPA_PALABRAS_CLAVE.md).
- **b) Sin solapamiento de keyword principal.** No atacar la misma keyword
  principal que otra página existente. Si hay solapamiento, decidir cuál gana
  (y la perdedora se funde, se canonicaliza o cambia de eje).
- **c) Title, meta description y H1 únicos** en todo el sitio.
- **d) Schema adecuado** al tipo de página (Service, LocalBusiness, FAQPage,
  Article, etc.) **y BreadcrumbList obligatorio**.
- **e) Enlazado interno desde el hub** correspondiente y **entrada en
  `sitemap.xml`** (o `sitemap-guias.xml` si es guía).
- **f) Solo afirmar lo demostrable.** Sin reseñas, cifras ni certificaciones
  inventadas. Sin dirección postal.
- **g) Precios solo desde la fuente única.** Los precios solo pueden ser los
  vigentes de la fuente única de precios, con `+ IVA` y sin suplementos.
- **h) Contenido propio**, no una plantilla con la ciudad o la marca
  cambiada. Diferenciación real por página (barrio, equipo, m², ejemplos).
- **i) Servicios nuevos (reformas, electricidad, diseño web)**: solo se
  añaden a `llms.txt`, al schema de la portada y a la ficha de Google cuando
  **ya estén publicadas** con página real. Nada de prometer servicios futuros.
- **j) Instalación y mantenimiento, sin prometer reparaciones.** La web se
  centra en instalación y mantenimiento (preventivo, correctivo y diagnóstico
  técnico). Si tras el diagnóstico hace falta una reparación, se puede decir
  que se deriva al SAT oficial de la marca o a un técnico especializado, pero
  sin nombrar empresas concretas. Las keywords de avería, recarga de gas o
  reparación quedan fuera del mapa.

## Soporte técnico

Para cualquier modificación o soporte, contacta con el desarrollador.
