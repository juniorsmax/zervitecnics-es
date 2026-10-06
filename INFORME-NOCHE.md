# Informe nocturno — rama `reseñas-opiniones`

**Fecha:** 2026-10-07
**Rama:** `reseñas-opiniones` (sin push, sin merge, sin deploy)
**Base:** `main` @ `fd18471`

Objetivo: eliminar reseñas falsas del schema, preparar pipeline de reseñas reales
desde Google Places (gratis, sin claves locales) y añadir sección + landing
`/opiniones/`.

---

## PASO 0 — Reconocimiento (hallazgos)

- **Único foco de `aggregateRating` falso:** `aires-acondicionados/js/shared.js:797-802`
  (`ratingValue 4.9`, `reviewCount 127`). Inyectado por `injectLocalBusinessSchema()`
  (llamada en `shared.js:937`), por lo que **afectaba a ~635 páginas** de
  `/aires-acondicionados/*` que cargan `shared.js`.
- **No había más sitios.** Comprobado:
  - `index.html` raíz: Organization sin aggregateRating.
  - Guías de `aires-acondicionados/guias/*.html`: sin review schema.
  - Generadores `tools/generate-*.js`: los `LocalBusiness` que embeben son
    referencias dentro de `Service.provider` (uso permitido, sin rating).
  - HTMLs ya generados (`marcas/`, `capacidades/`, `mantenimiento-*/`): limpios.
- **Cómo se generan las páginas:** `tools/generate-geo-pages.js`,
  `tools/generate-marca-capacidad.js` y `tools/generate-mantenimiento-pages.js`
  emiten HTML estático. Las ~635 páginas cargan `aires-acondicionados/js/shared.js`,
  que inyecta el `LocalBusiness+HVACBusiness` runtime (ya corregido).

## PASO 1 — Schema limpio

- Eliminado el bloque `aggregateRating` de `shared.js` (6 líneas).
- `hasCredential` (Carnet Gases Fluorados, RITE, Instalador HVAC Certificado)
  y `sameAs` (Instagram, Facebook) **intactos**.
- Verificación: `grep -rn "aggregateRating\|reviewCount"` en todo el repo
  → **0 ocurrencias**.

## PASO 2 — Pipeline de reseñas reales

Archivos nuevos:

- `config/reviews.json` — configuración (único sitio con `REVIEW_URL`):
  ```json
  { "PLACE_ID": "", "REVIEW_URL": "https://g.page/r/CXH7-yVPG3bTEBM/review",
    "LANGUAGE": "es", "MIN_RATING": 4, "MAX_REVIEWS": 6 }
  ```
  `PLACE_ID` queda vacío — hay que rellenarlo cuando la ficha Google esté lista.
- `tools/fetch-reviews.js` — Node 20, cero dependencias externas (usa `fetch`
  nativo). Lee clave de `process.env.GOOGLE_PLACES_API_KEY`. Si `PLACE_ID`
  vacío → `exit 0` (no rompe el workflow). Guarda en `data/reviews.json`.
- `.github/workflows/reviews.yml` — cron semanal (lunes 06:00 UTC) +
  `workflow_dispatch`. Usa secreto `GOOGLE_PLACES_API_KEY`. Commitea
  `data/reviews.json` si cambia (bot). **No se ha ejecutado localmente.**

Pruebas locales (en seco):
- `node tools/fetch-reviews.js` sin PLACE_ID → `exit 0` + mensaje claro.
- Con PLACE_ID y sin clave → `exit 1` + mensaje claro.

## PASO 3 — Sección «Opiniones de clientes» (build)

- `tools/build-opiniones-section.js` — recorre todos los `*.html` del repo
  (excepto `node_modules` y `graphify-out`) y reemplaza el bloque entre
  marcadores `<!-- opiniones:start -->` / `<!-- opiniones:end -->`.
- HTML estático, **sin scripts externos**. Rating con estrellas Unicode,
  atribución a Google, botón que abre `REVIEW_URL`.
- Si `data/reviews.json` no existe → la sección queda vacía (sólo un
  comentario discreto). Si existe pero vacía → ídem.
- Marcadores añadidos en:
  - `aires-acondicionados/index.html` (antes del FAQ).
  - `opiniones/index.html` (ver paso 4).
- Estilos añadidos a `aires-acondicionados/css/shared.css` (clases `.rev-*`).

## PASO 4 — Página `/opiniones/`

- `opiniones/index.html` creado:
  - `<meta name="robots" content="noindex,nofollow">` ✓
  - **Fuera de sitemaps** (confirmado: `sitemap.xml`, `sitemap-guias.xml`
    y `robots.txt` no listan `/opiniones/`).
  - GTM-P6C8L3VX **coincide con el resto del sitio** (misma propiedad usada
    en `index.html` raíz y en `aires-acondicionados/index.html`).
  - `<noscript>` iframe de GTM al inicio del `<body>`.
  - Consent Mode default `denied` (igual que el resto del sitio).
  - Atributos `data-evento` y `data-evento-origen` en los CTAs; delegación
    de clicks que empuja `click_evento` a `dataLayer`.
  - Evento inicial `page_view_opiniones`.
  - `og:image` **comentada** hasta que exista `/opiniones/foto-trabajo.jpg`.
  - CSS reutiliza `/aires-acondicionados/css/shared.css` + estilos propios inline.
- Enlace a reseña: **una sola vez**, apuntando a la URL de `config/reviews.json`
  (hard-coded sólo en el hero de `/opiniones/` como CTA principal; en el resto
  del sitio llegará desde `build-opiniones-section.js` → `data/reviews.json`).

**Consentimiento de cookies — observación importante:**
el resto del sitio muestra el banner RGPD mediante `aires-acondicionados/js/shared.js`
(función `initCookies`). La página `/opiniones/` **no carga ese script**, así que
opera siempre en modo `denied` por defecto (GTM carga pero sus etiquetas
condicionadas no disparan `analytics_storage`). Esto es correcto a nivel RGPD,
pero si quieres mostrar el banner también aquí, bastaría con añadir el `<script>`
de `shared.js` al final del `<body>`.

## PASO 5 — Verificación

- `grep -rn "aggregateRating\|reviewCount"` en todo el repo → **0 ocurrencias**.
- `grep` de patrones de API keys (`AIza…`, `sk-…`, `ghp_…`) → **0 ocurrencias**;
  la única mención a `GOOGLE_PLACES_API_KEY` es como variable de entorno/secreto
  (`fetch-reviews.js` y `reviews.yml`).
- Sintaxis Node OK para `fetch-reviews.js` y `build-opiniones-section.js`.
- Prueba e2e del build con un `reviews.json` ficticio: sección renderizada
  correctamente en ambas páginas. Luego borrado para dejar el estado real.
- No existe suite de tests automatizada en el repo (no hay `package.json` raíz,
  sólo `tools/package.json` con `sharp` para webp).

---

## Diff resumido

```
 aires-acondicionados/css/shared.css |  +20   (clases .rev-*)
 aires-acondicionados/index.html     |  +5    (marcadores opiniones:start/end)
 aires-acondicionados/js/shared.js   |  -6    (quitar aggregateRating)
 .github/workflows/reviews.yml       |  +37   (nuevo)
 config/reviews.json                 |  +7    (nuevo)
 opiniones/index.html                | +130   (nuevo, build-regen de la sección)
 tools/build-opiniones-section.js    | +130   (nuevo)
 tools/fetch-reviews.js              | +143   (nuevo)
```

Commits en la rama: **ninguno** (todo pendiente de commit).

---

## Pendientes (no bloqueantes)

1. **Rellenar `PLACE_ID` en `config/reviews.json`** cuando la ficha Google
   Business de Zervitecnics esté publicada. El `PLACE_ID` se consigue con
   el "Place ID Finder" de Google Maps o desde la URL de la ficha
   (`CXH7-yVPG3bT…` sugerido por el link de reseña, pero hay que verificarlo).
2. **Dar de alta el secreto `GOOGLE_PLACES_API_KEY`** en GitHub → Settings →
   Secrets → Actions. API habilitada: Places API (New). Gratis dentro de la
   cuota mensual (10.000 Place Details/mes gratis). Restringir la clave a
   referrer del repo + API Places (New) para evitar abuso.
3. **Primera ejecución del workflow:** manual desde Actions → *workflow_dispatch*
   para validar que la ficha devuelve reseñas y escribir `data/reviews.json`
   la primera vez. Luego commit automático semanal.
4. **Opcional:** añadir `shared.js` en `/opiniones/` si quieres ver el banner
   de cookies también allí (ver nota en Paso 4).
5. **Opcional:** `/opiniones/foto-trabajo.jpg` + descomentar `og:image`.
6. **Opcional:** una vez haya reseñas reales, considerar añadir
   `aggregateRating` **de verdad** al schema de `LocalBusiness` leyéndolo de
   `data/reviews.json` desde el propio `shared.js` (coherente con lo que
   publica Google). Pero esto es trabajo posterior; **no re-añadir rating falso**.
7. Decidir si quieres enlazar `/opiniones/` desde el footer de las páginas
   principales (ahora mismo sólo lo verá quien tenga el link directo —
   coherente con `noindex,nofollow`).

## Nada se ha empujado

- Rama local `reseñas-opiniones` creada desde `main`.
- Cambios **sin commit, sin push, sin merge**.
- `main` intacto.
- No se ha ejecutado `fetch-reviews.js` real (no hay clave en este equipo).
- No se ha ejecutado el workflow (sin push, no se puede).

Para publicar:

```bash
git checkout reseñas-opiniones
git add .
git commit -m "feat(reseñas): quitar rating falso + pipeline Places + /opiniones/"
# revisar diff y hacer merge/PR cuando se quiera
```
