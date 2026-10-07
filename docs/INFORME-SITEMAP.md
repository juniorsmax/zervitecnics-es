# Informe: sitemaps y robots.txt

- **Fecha:** 7 de octubre de 2026
- **Base:** rama `main`, commit `fd18471`
- **Rama:** `sitemap-check`
- **Qué cambia esta rama:** `tools/generate-sitemap.js` (mejorado, no es un generador nuevo), `tools/check-seo.js` (nuevo), `tools/lib/site-pages.js` (funciones comunes), `tools/package.json` (script `check:seo`) y este informe.
- **Qué NO cambia:** ninguna página, ni `robots.txt`, ni `sitemap.xml`, ni `sitemap-guias.xml`. **Los sitemaps reales no se han regenerado:** primero tienes que ver el diff de abajo y dar el OK.

---

## Resumen en sencillo

1. **El generador antiguo era peligroso.** Si se ejecutaba tal cual, **borraba 25 páginas de mantenimiento** del sitemap y bajaba la prioridad de 3 páginas importantes (ofertas, instalación personalizada y mantenimiento). Estaban en el sitemap porque se añadieron a mano después; el generador no las conocía.
2. **Ahora el generador recorre todo el sitio** sin listas de carpetas, **excluye solo las páginas con `noindex`** (como será `/opiniones/`), pone en cada URL **la fecha real del último cambio** según git, y genera también `sitemap-guias.xml`.
3. **Con el sitemap mejorado, los cambios frente al actual serían solo dos:**
   - **Salen las 3 páginas legales**, porque tienen `noindex` (Google recibía órdenes contradictorias).
   - **Se corrigen 658 fechas**: el sitemap decía 25-06-2026 en 634 páginas que han cambiado de verdad en septiembre y octubre.
   - No sobra ni falta ninguna otra URL y las prioridades se mantienen.
4. **`tools/check-seo.js`** (con `npm --prefix tools run check:seo`) falla si hay páginas indexables fuera del sitemap, URLs sin archivo, páginas `noindex` dentro, URLs repetidas o un `robots.txt` mal apuntado. Hoy, sobre los sitemaps reales, **falla con 3 errores** (las legales). Sobre los sitemaps generados, **pasa**.
5. **No hace falta un índice de sitemaps.** `robots.txt` ya apunta bien a los dos con líneas `Sitemap:`. No he tocado la política de bots de IA.

---

## PASO 0 — Generador antiguo frente al sitemap actual (solo lectura)

Ejecuté el generador **original** en una copia temporal del repositorio, fuera del repo, y comparé el resultado con `sitemap.xml`:

| | Actual | Generador antiguo |
|---|---|---|
| URLs en `sitemap.xml` | 667 | 642 |
| URLs que **faltarían** | — | **25**: las 10 de `mantenimiento-marcas/` y las 15 de `mantenimiento-zonas/` |
| URLs que sobrarían | — | 0 |
| Prioridad distinta | — | 3: `ofertas.html`, `instalacion-personalizada.html` y `mantenimiento.html` bajarían de 0.9 a 0.5 (y de `weekly` a `monthly`) |
| `lastmod` distinto | — | 642: todas pasarían a **la fecha del día en que se ejecuta** |
| Guías | En `sitemap-guias.xml` (9, escrito a mano) | El generador antiguo no recorría `guias/` ni creaba ese archivo |

**Por qué pasaba:** el generador antiguo solo miraba una lista fija de carpetas (`categorias`, `marcas`, `capacidades`, `zonas`, `legal`) y excluía solo archivos llamados `404.html` y `gracias.html`. Las páginas nuevas (mantenimiento, guías) se añadieron a mano a los sitemaps.

### ¿Qué páginas quedan fuera del sitemap?

En el sitemap actual quedan fuera **3 páginas, no 6**:

| Página | ¿Fuera del sitemap? | ¿Tiene `noindex`? | Correcto |
|---|---|---|---|
| `404.html` | Sí | Sí | ✔ |
| `aires-acondicionados/404.html` | Sí | Sí | ✔ |
| `aires-acondicionados/gracias.html` | Sí | Sí | ✔ |
| `aires-acondicionados/legal/aviso-legal.html` | **No, está dentro** | Sí | ✘ contradicción |
| `aires-acondicionados/legal/cookies.html` | **No, está dentro** | Sí | ✘ |
| `aires-acondicionados/legal/privacidad.html` | **No, está dentro** | Sí | ✘ |

Seguramente el número 6 venía de contar las 6 páginas con `noindex`.

Los «index duplicados» no son un problema: `index.html`, `aires-acondicionados/index.html` y `guias/index.html` aparecen en el sitemap con su URL de carpeta (`/`, `/aires-acondicionados/`, `/aires-acondicionados/guias/`), una sola vez cada una, y coinciden con su `canonical`.

---

## PASO 1 — Exclusión automática de páginas `noindex`

- El generador recorre **todas** las carpetas del sitio. Solo se salta `tools/`, `docs/`, `.git` y `node_modules`.
- Cualquier página con `<meta name="robots" content="…noindex…">` **se excluye sola**, sin listas. Funciona aunque los atributos vayan en otro orden (`content` antes que `name`).
- Al terminar, el generador dice qué páginas ha excluido. Hoy son: las dos 404, `gracias.html` y las 3 legales.
- **Probado con una página `/aires-acondicionados/opiniones/` con `noindex`**, creada solo en una copia temporal: el generador la excluyó sin tocar nada y el comprobador pasó.

**Decisión pendiente para ti:** las 3 páginas legales tienen `noindex`, así que salen del sitemap. Si prefieres que Google las indexe, habría que quitarles el `noindex` (eso es tocar contenido; no lo he hecho). Lo habitual es dejarlas como están.

---

## PASO 2 — `lastmod` con la fecha real de git (hecho)

- La fecha de cada URL es la del **último commit que tocó su archivo**. Se calcula con una sola pasada de `git log`, así que es rápido.
- Si un archivo tiene cambios sin commitear o no está en git, se usa la fecha de hoy, porque de verdad está cambiando hoy.
- Si git no está disponible, se usa la fecha de hoy con un aviso.
- **Aviso automático si el clon de git es superficial** (`--depth`). En ese caso, los archivos sin cambios recientes recibirían una fecha demasiado nueva.
  - Este entorno es un clon superficial: los commits más antiguos disponibles son del 24-06-2026.
  - **Para estos datos no afecta:** el último cambio de todas las páginas es del 15-09-2026 o posterior.
  - Si se automatiza en GitHub Actions, el paso de checkout debe usar `fetch-depth: 0`.
- Las fechas resultantes son **15-09-2026** (15 URLs), **02-10-2026** (354) y **03-10-2026** (304). Corresponden a commits reales, como:
  - `bf5da17` «enlazado interno tanda 1» (304 archivos);
  - `23add3c` «Limpieza de confianza…» (659 archivos);
  - `e01d742` «recalcular a base sin IVA…» (632 archivos).

Ojo: la fecha marca **cualquier** cambio en el archivo, también cambios técnicos (un enlace o un script), no solo de texto. Es lo correcto según el protocolo de sitemaps: indica cuándo cambió la página.

---

## PASO 3 — ¿Índice de sitemaps? y robots.txt

**Recomendación: no crear un índice de sitemaps por ahora.**
- El protocolo permite hasta 50.000 URLs o 50 MB por sitemap. Aquí hay 664 + 9, muy lejos del límite.
- `robots.txt` ya declara los dos sitemaps con URL absoluta y `https`. Es válido y Google y Bing lo leen igual que un índice:

  ```
  Sitemap: https://zervitecnics.es/sitemap.xml
  Sitemap: https://zervitecnics.es/sitemap-guias.xml
  ```

- Cambiar de estructura obligaría a revisar lo que tengas dado de alta en Google Search Console y Bing Webmaster. **No he podido ver esas cuentas.**
- **Cuándo sí convendría:** si se añaden más verticales o más sitemaps (por ejemplo `sitemap-opiniones.xml`). Entonces bastaría con un `sitemap-index.xml` que liste los demás, más una línea `Sitemap:` hacia él. El comprobador ya sabe leer índices de sitemaps, así que no habría que cambiarlo.

**`robots.txt`:** sin cambios. La política de bots (todos permitidos, incluidos los de IA) queda igual, y las líneas `Sitemap:` son correctas. El comprobador avisa si falta alguna o si apunta a un archivo que no existe.

Mejora ya hecha: ahora el generador crea **también** `sitemap-guias.xml` con las mismas prioridades que tenía (guías 0.7, índice de guías 0.8). Así ninguna página queda fuera y ninguna URL se repite entre los dos archivos.

---

## PASO 4 — `tools/check-seo.js` y `npm run check:seo`

**Cómo se usa:**
- `npm --prefix tools run check:seo` (o `cd tools && npm run check:seo`) revisa `robots.txt` y los sitemaps reales.
- `node tools/check-seo.js --dir <carpeta>` revisa los sitemaps de otra carpeta (por ejemplo una prueba hecha con `generate-sitemap.js --out <carpeta>`) contra las páginas del repo.

**Qué hace fallar** (código de salida 1):
- `robots.txt` sin `Sitemap:`, o apuntando a un sitemap que no existe;
- páginas indexables fuera de los sitemaps;
- URLs del sitemap sin archivo;
- páginas `noindex` dentro de un sitemap;
- URLs repetidas o fuera de `https://zervitecnics.es`;
- más de 50.000 URLs en un sitemap.

**Qué solo avisa:** `lastmod` con formato raro o fecha futura, y páginas indexables cuyo `canonical` apunta a otra URL. Hoy hay 0 avisos.

**Pruebas realizadas:**

| Prueba | Resultado |
|---|---|
| Sitemaps reales actuales | ✘ **3 errores**: las 3 legales con `noindex` dentro de `sitemap.xml` → código 1 |
| Sitemaps generados con el generador mejorado (carpeta temporal) | ✔ Sin errores → código 0 |
| Copia con `/opiniones/` en `noindex` (atributos al revés) + regenerar | ✔ Excluida sola; comprobador sin errores |
| Copia con una página nueva sin regenerar el sitemap | ✘ «Página indexable fuera de los sitemaps: aires-acondicionados/nueva.html» → código 1 |
| Copia con una URL inventada en el sitemap | ✘ «URL de sitemap.xml sin archivo en el repo» |
| Copia con `/guias/` repetida en los dos sitemaps | ✘ «URL repetida: /aires-acondicionados/guias/ (en sitemap.xml y sitemap-guias.xml)» |
| Copia con `robots.txt` apuntando a `sitemap-falta.xml` | ✘ «El sitemap … no existe» |
| Copia sin líneas `Sitemap:` | ✘ «robots.txt no tiene ninguna línea "Sitemap:"» (más las 673 páginas fuera) |
| Generar dos veces seguidas | Salida idéntica byte a byte (orden estable) |

Las pruebas con fallos se hicieron en copias temporales fuera del repo, que borré después. Nada del repo cambió.

---

## PASO 5 — Diff antes/después (lo que cambiaría al regenerar los sitemaps reales)

Comparación entre los sitemaps actuales y los que produce el generador mejorado:

| | `sitemap.xml` | `sitemap-guias.xml` |
|---|---|---|
| URLs ahora → después | 667 → **664** | 9 → 9 |
| URLs que salen | **3**: `legal/aviso-legal.html`, `legal/cookies.html`, `legal/privacidad.html` (tienen `noindex`) | 0 |
| URLs que entran | 0 | 0 |
| `priority` distinta | 0 | 0 |
| `changefreq` distinta | 0 | 0 |
| `lastmod` distinta | **649** | **9** |
| Orden | Orden alfabético por URL (el actual tiene inserciones a mano). Para Google el orden no importa | Igual |

**Cambios de `lastmod`, agrupados:**

| Antes | Después | URLs | Ejemplos |
|---|---|---|---|
| 2026-06-25 | 2026-10-02 | 330 | `/`, `capacidades/2000-frigorias-arenys-de-mar.html` |
| 2026-06-25 | 2026-10-03 | 304 | `/aires-acondicionados/`, `capacidades/2000-frigorias-badalona.html` (las 17 ciudades de la tanda 1 de enlaces) |
| 2026-09-15 | 2026-10-02 | 10 | `mantenimiento-marcas/*.html` |
| 2026-09-02 / 09-03 / 09-05 | 2026-10-02 | 5 | `ofertas.html`, `instalacion-personalizada.html`, `mantenimiento.html`, `categorias/cassette.html`, `categorias/suelo-techo.html` |
| 2026-09-06 | 2026-10-02 | 9 | Las 9 guías |
| 2026-09-15 | 2026-09-15 | 15 | `mantenimiento-zonas/*.html` (sin cambio) |

**Muestra del diff** (`diff -u sitemap.xml nuevo/sitemap.xml`):

```diff
   <url>
     <loc>https://zervitecnics.es/</loc>
-    <lastmod>2026-06-25</lastmod>
+    <lastmod>2026-10-02</lastmod>
     <changefreq>monthly</changefreq>
     <priority>1.0</priority>
   </url>
 …
-  <url>
-    <loc>https://zervitecnics.es/aires-acondicionados/legal/aviso-legal.html</loc>
-    <lastmod>2026-06-25</lastmod>
-    <changefreq>yearly</changefreq>
-    <priority>0.3</priority>
-  </url>
```

(Lo mismo para `cookies.html` y `privacidad.html`.)

**Cómo aplicarlo cuando des el OK** (en esta misma rama):

```
node tools/generate-sitemap.js       # reescribe sitemap.xml y sitemap-guias.xml
npm --prefix tools run check:seo     # debe decir "✓ Sin errores"
```

Y un commit solo con los dos XML.

---

## Propuestas (no aplicadas)

1. **Regenerar los sitemaps reales** con el diff de arriba (pendiente de tu OK).
2. **Ejecutar `check:seo` antes de cada despliegue.** Por ejemplo con una GitHub Action gratuita que use `fetch-depth: 0`. Así una página nueva no se queda fuera del sitemap sin que nadie se entere.
3. **Cuando entre la rama `reseñas-opiniones`:** si `/opiniones/` lleva `noindex`, el generador la excluye sola. Si es indexable, entra sola. En ambos casos basta con regenerar y pasar `check:seo`.
4. **Más adelante:** un `sitemap-index.xml` solo si se añaden más sitemaps.

## Lo que no he podido comprobar

- Qué sitemaps tienes dados de alta en Google Search Console o Bing Webmaster, ni si Google ha leído los actuales.
- El `robots.txt` y los sitemaps servidos de verdad en `zervitecnics.es`. He revisado el repositorio, no la web en producción.
- La fecha en que se publicó cada commit: el `lastmod` usa la fecha del commit, no la del despliegue.
