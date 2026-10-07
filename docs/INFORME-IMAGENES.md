# Informe de imágenes — zervitecnics.es

- **Fecha:** 7 de octubre de 2026
- **Base:** rama `main`, commit `fd18471`
- **Rama:** `imagenes-informe`
- **Qué añade esta rama:** `tools/audit-images.js` (script de solo lectura), `docs/auditoria-imagenes.csv` (datos) y este informe. **No se ha cambiado ninguna página ni ninguna imagen.**
- **Cómo regenerar el CSV:** `node tools/audit-images.js`. No necesita instalar nada.
- **El CSV** tiene una fila por cada imagen de cada página (2.723 filas) y columnas separadas por comas, en UTF-8. En Excel en español, si sale todo en una columna, ábrelo con *Datos → Desde texto/CSV → Delimitador: coma*.

> **Regla de este informe:** no se proponen fotos inventadas de instalaciones. Todo lo que tenga que mostrar un trabajo, un técnico o una localidad concreta está marcado como **«necesita foto real»** (de un trabajo tuyo y con permiso del cliente).

---

## Resumen

1. Hay **54 archivos** en `aires-acondicionados/img/` (6,3 MB): 27 fotos JPG, su versión WebP (24 de 27) y el logo en PNG y WebP. Las 679 páginas usan **28 imágenes distintas** en 2.051 etiquetas `<img>`.
2. **665 de 679 páginas no tienen ninguna imagen propia:** todas sus imágenes se repiten en 5 o más páginas. Afecta al 100 % de las páginas de marca (450), capacidad (160), zonas (15) y mantenimiento (25).
3. **Una sola foto (`hero_split.jpg`) ilustra 621 páginas**, con 621 textos alternativos distintos («Daikin en Badalona», «2000 frigorías en Sitges»…) que describen algo que la foto no muestra.
4. **Las 25 páginas de mantenimiento no tienen ninguna imagen de contenido**, solo el logo.
5. **Imágenes de más de 200 KB:** 7 archivos (6 JPG y 1 WebP). Hoy solo se sirve en JPG uno de ellos, `barcelona_aerial.jpg` (218 KB, en 15 páginas), porque no tiene WebP. Los otros cinco JPG pesados se sirven como WebP; el WebP de la guía de normativa pesa 258 KB.
6. **Sin WebP:** `barcelona_aerial.jpg` y `galeria_exterior.jpg`. Además, la galería de la portada no usa los WebP que ya existen, por un fallo en `tools/update-html-webp.js` (ver 2.3).
7. **Sin alt:** ninguna (0 de 2.051) ✔. El problema no es que falte el alt, sino que **muchos alt dicen algo que la foto no muestra**.
8. **Sin `width`/`height`:** 1.358 de 2.051. Además, el logo de la cabecera lleva `width="40" height="40"`, pero mide 560×120 (no es cuadrado).
9. **No puedo saber si alguna foto es real.** Los archivos no tienen datos de cámara ni de origen (metadatos borrados), y el historial de git no dice de dónde salen. Al verlas, **todas tienen el mismo aspecto de imagen de estudio o generada**: el mismo técnico, la misma camiseta «ZERVITECNICS» y monumentos encuadrados en la ventana. Varias se presentan en la web como trabajos reales. **Tienes que confirmarlo tú** (tabla del apartado 2.5).
10. Sin fotos nuevas se puede mejorar ya bastante: WebP, tamaños, medidas y alt honestos. Pero **dar a las páginas de marca, capacidad, zona y mantenimiento una imagen propia necesita fotos reales**. Mínimo propuesto: unas 30 fotos sacadas de 10-15 trabajos.

---

## PASO 1 — El script y el CSV

`tools/audit-images.js` recorre las 679 páginas y escribe `docs/auditoria-imagenes.csv`. Por cada `<img>` (y por la imagen para redes sociales `og:image` de cada página) apunta:

| Columna | Qué significa |
|---|---|
| `pagina` | Ruta del HTML |
| `tipo_pagina` | `marca/ciudad`, `marca/capacidad`, `marca/raiz`, `capacidad/ciudad`, `zona`, `mantenimiento/zona`, `mantenimiento/marca`, `categoria`, `guia`, `servicio`, `portada-vertical`, `portada-dominio`, `legal`, `sistema` |
| `localidad`, `marca`, `capacidad_frigorias` | Sacados de la ruta (por ejemplo `marcas/daikin-badalona.html` → Daikin, Badalona) |
| `origen` | `img` (etiqueta normal), `picture` (dentro de `<picture>`) u `og:image` |
| `imagen`, `existe`, `tamano_kb`, `formato`, `ancho_px`, `alto_px` | El archivo real: peso y medidas leídos del propio archivo |
| `webp_servido` | **sí** si el navegador recibe WebP (archivo `.webp` o `<picture>` con fuente WebP) |
| `webp_en_disco` | **sí** si existe el `.webp` en la carpeta, aunque no se use |
| `alt`, `texto_alt` | Si tiene texto alternativo y cuál |
| `width_height` | Si la etiqueta lleva `width` y `height` |
| `loading_lazy` | Si lleva `loading="lazy"` |
| `linea` | Línea del HTML |
| `repetida_en_paginas` | En cuántas páginas distintas aparece esa imagen |

Resultado de la ejecución: 679 páginas, 2.723 filas, 28 imágenes distintas, 0 imágenes que no existan.

---

## PASO 2 — Resumen de hallazgos

### 2.1 Páginas sin imagen propia

Cuento como «propia» una imagen de contenido (no el logo) que aparece en menos de 5 páginas.

| Tipo de página | Páginas | Sin imagen propia | Sin ninguna imagen de contenido | Qué imagen usan |
|---|---|---|---|---|
| Marca × ciudad | 400 | **400** | 0 | `hero_split.jpg` |
| Marca × capacidad | 40 | **40** | 0 | `hero_split.jpg` |
| Marca raíz | 10 | **10** | 0 | `hero_split.jpg`, `multisplit_service.jpg`, `hero_main.jpg` |
| Capacidad × ciudad | 160 | **160** | 0 | `hero_split.jpg` |
| Zonas | 15 | **15** | 0 | `barcelona_aerial.jpg`, `hero_split.jpg`, `multisplit_service.jpg`, `conductos_service.jpg` |
| Mantenimiento × zona | 15 | **15** | **15** | Ninguna (solo el logo) |
| Mantenimiento × marca | 10 | **10** | **10** | Ninguna (solo el logo) |
| Categorías | 7 | 5 | 0 | Solo `cassette` y `suelo-techo` tienen foto propia |
| Guías | 9 | 1 | 1 | Las 8 guías tienen su foto; el índice `guias/index.html` no tiene ninguna |
| Servicios (precios, ofertas, subvenciones, mantenimiento, instalación personalizada) | 5 | 2 | 2 | `precios.html` y `subvenciones.html` no tienen ninguna |
| Portada del vertical | 1 | 0 | 0 | Varias, incluida la galería |
| Legales, 404, gracias, portada del dominio | 6 | — | — | No necesitan |

**Imagen para redes sociales (`og:image`):**
- 616 páginas comparten `hero_main.jpg` y 26 comparten `tecnico-limpieza-filtro.jpg`.
- Las 25 de mantenimiento la usan como imagen para redes sociales aunque no la muestran.
- `precios.html` no tiene `og:image`.

### 2.2 Imágenes pesadas (más de 200 KB)

| Archivo | KB | Medidas | ¿Se sirve? | Comentario |
|---|---|---|---|---|
| `guia-normativa-eixample.jpg` | 360 | 1448×1086 | No (se sirve el WebP) | Respaldo para navegadores sin WebP |
| `guia-normativa-eixample.webp` | 258 | 1448×1086 | **Sí**, en 1 página | El WebP más pesado. A 960 px de ancho bajaría a 122 KB (prueba hecha) |
| `guia-subvenciones-eficiencia.jpg` | 250 | 1448×1086 | No (WebP de 162 KB) | — |
| `guia-ubicacion-terraza.jpg` | 238 | 1448×1086 | No (WebP de 146 KB) | — |
| `guia-sistemas-comparativa.jpg` | 235 | 1448×1086 | No (WebP de 140 KB) | — |
| `barcelona_aerial.jpg` | 218 | 1200×674 | **Sí, en 15 páginas** | No tiene WebP. En WebP a 800 px pesaría 92 KB (prueba hecha) |
| `guia-mantenimiento-filtro.jpg` | 211 | 1448×1086 | No (WebP de 135 KB) | — |

**Fotos más grandes de lo que se muestran:**
- Las 12 fotos de 1448 px de ancho se muestran en cajas de hasta 960-1000 px.
- `hero_split` (1200 px) se muestra en una columna de unos 560 px y 420 px de alto (`css/pages.css:20`).

**Prueba de ahorro.** Convertí copias en mi carpeta temporal con ImageMagick, sin tocar los originales:

| Grupo | Hoy (WebP servido) | Versión de prueba | Ahorro |
|---|---|---|---|
| 12 fotos de 1448 px (8 guías, 2 categorías, 2 técnico) a 960 px | 1.480 KB | 724 KB | −51 % |
| `hero_split` a 800 px (se carga en 620 páginas) | 70 KB | 25 KB | −64 % |
| `barcelona_aerial` a 800 px en WebP | 218 KB (JPG) | 92 KB | −58 % |
| `galeria_exterior` en WebP | 68 KB | 52 KB | −24 % |

### 2.3 Sin WebP

- **No existe el `.webp`:** `barcelona_aerial.jpg` (15 páginas) y `galeria_exterior.jpg` (portada).
- **El `.webp` existe pero no se usa:** `galeria_conductos.webp`, `galeria_mataro.webp` y `galeria_manresa.webp`.
  - **Causa:** en `tools/update-html-webp.js` la expresión que busca imágenes exige una barra antes de `img/` (`[^"]+\/img\/`). La galería de `aires-acondicionados/index.html:1439-1451` usa `src="img/..."`, sin nada delante, así que el script no la ve.
- **En total, 28 usos no reciben WebP:** `barcelona_aerial` (15), la galería (4), el logo (3), `hero_main` (2), `multisplit_service` (2), `conductos_service` (1) y `hero_split` (1). Detalle en la columna `webp_servido` del CSV.
- **Ojo con `tools/update-html-webp.js`:** su comprobación `match.includes('</picture>')` mira solo la etiqueta `<img>`, que nunca contiene `</picture>`. Si se vuelve a ejecutar tal cual, **mete un `<picture>` dentro de otro** en las 2.000 imágenes que ya tienen WebP. Hay que corregirlo antes de usarlo otra vez.

### 2.4 Alt, medidas y carga diferida

- **Sin alt: 0 ✔.**
- **Alt que no corresponde a la foto** (problema de honestidad y de SEO):
  - `hero_split.jpg`: 621 alt distintos («Daikin en Badalona», «2000 frigorías en Sitges»…) para una sola foto de un split en un salón, en la que no se ve la marca.
  - `barcelona_aerial.jpg`: «Vista de Sabadell», «Vista de Castelldefels»… en 15 páginas, pero la foto es una vista aérea del Eixample de Barcelona.
  - `galeria_manresa.jpg`: «Multisplit LG instalado en Manresa», y Manresa no está en ninguna zona atendida. Además, en la foto el equipo es un split (no un multisplit).
  - `multisplit_service.jpg` y `conductos_service.jpg`: alt con nombres de ciudad («Conductos en Badalona») en 17-22 páginas.
- **Sin `width`/`height`: 1.358 de 2.051 usos.**
  - Reparto: logo del pie de página (673), `hero_split` (621), `multisplit_service` (22), `conductos_service` (17), `barcelona_aerial` (15), `hero_main` (6) y la galería (4).
  - Las medidas reales están en el CSV (`ancho_px`, `alto_px`).
  - El logo de la cabecera lleva `width="40" height="40"`, pero el archivo es de 560×120. Debería ser algo como `width="261" height="56"`.
- **Sin `loading="lazy"`: 1.361 de 2.051 usos.** No todo es un fallo:
  - **El logo** (1.348 usos) es correcto sin lazy en la cabecera. En el pie podría llevarlo.
  - **Las fotos principales de guías, categorías y servicios** van sin lazy **a propósito** (`loading="eager"` + `fetchpriority="high"`, según el commit `c64206a`), porque se ven nada más abrir la página. Correcto.
  - **`hero_split`, `barcelona_aerial` y compañía** sí llevan lazy y están en la segunda sección. Correcto.
  - Conclusión: **la carga diferida está bien planteada.** No hay que cambiarla.

### 2.5 ¿Son fotos reales? (tienes que confirmarlo tú)

No hay forma técnica de saberlo: los archivos no tienen datos de cámara y el commit que las añadió (`c64206a`) no dice de dónde salen. Esto es lo que veo en cada una y cómo la presenta la web. Marca tú la última columna.

| Imagen | Qué muestra | Cómo la presenta la web | Si NO es un trabajo tuyo real… | ¿Real? (tú) |
|---|---|---|---|---|
| `galeria_mataro.jpg` | Técnico con camiseta «ZERVITECNICS» montando un split; mar al fondo | «Ejemplos reales de nuestro trabajo» · «Instalación Daikin en piso de Mataró» | **Quitar de la galería** → necesita foto real | ☐ |
| `galeria_manresa.jpg` | Técnico con mando; split LG; catedral al fondo | «Ejemplos reales…» · «Multisplit LG instalado en Manresa» | **Quitar** → necesita foto real | ☐ |
| `galeria_conductos.jpg` | Técnico con logo «Z» montando conductos | «Ejemplos reales…» | **Quitar** → necesita foto real | ☐ |
| `galeria_exterior.jpg` | 4 unidades exteriores Samsung/Daikin en una terraza | «Ejemplos reales…» · «…en terraza de Barcelona» | **Quitar** → necesita foto real | ☐ |
| `hero_main.jpg` | Técnico «ZERVITECNICS» montando un split; Sagrada Família en la ventana | Alt «Técnico Zervitecnics instalando…» e imagen para redes de 616 páginas | Alt genérico o foto real del técnico | ☐ |
| `tecnico-medicion-laser.jpg`, `tecnico-limpieza-filtro.jpg` | Técnico «ZERVITECNICS» midiendo / limpiando | «Técnico de Zervitecnics midiendo…» | Alt genérico («imagen ilustrativa») o foto real | ☐ |
| `oferta-*.jpg` (6) | Splits y 2×1 en pisos con vistas de Barcelona | «Haier TIDER 35 instalado en habitación de Barcelona», etc. | Indicar «imagen orientativa» o foto real del modelo | ☐ |
| `cassette-techo-comercial.jpg`, `suelo-techo-instalado.jpg` | Técnico «ZERVITECNICS» en un local | «…instalado en local comercial de Barcelona» | Alt genérico o foto real | ☐ |
| `guia-*.jpg` (8) | Escenas ilustrativas (manómetros, fachada, mando…). Algunas con técnico «ZERVITECNICS» | Ilustración de la guía | Sirven como ilustración si el alt no afirma que es un trabajo tuyo | ☐ |
| `hero_split.jpg`, `multisplit_service.jpg`, `conductos_service.jpg` | Salones con equipos, sin personas | Alt con marca y ciudad | Sirven como ilustración con alt genérico | ☐ |
| `barcelona_aerial.jpg` | Vista aérea del Eixample | «Vista de {ciudad}» en 15 zonas | Usarla solo en páginas de Barcelona, con alt «Vista aérea del Eixample» | ☐ |

Además, **confirma la licencia de uso** de cada imagen que no sea tuya: de dónde viene y si puedes usarla con fines comerciales. ⚖️

---

## PASO 3 — Plan por categoría, precio y localidad

### 3.0 Lo que se puede resolver YA con las imágenes existentes (sin fotos nuevas)

| Acción | Afecta a | Herramienta |
|---|---|---|
| Crear WebP de `barcelona_aerial` y `galeria_exterior` | 15 zonas + portada | `tools/convert-to-webp.js` (ya existe) |
| Servir los WebP de la galería con `<picture>` | Portada | Corregir la expresión de `tools/update-html-webp.js` y hacerlo seguro de repetir |
| Versiones de 960 px (guías, categorías, técnico) y 800 px (`hero_split`, `barcelona_aerial`) con `srcset` | 12 + 621 + 15 páginas | Ampliar `convert-to-webp.js` (usa `sharp`, gratis) |
| `width`/`height` reales en el logo y en las fotos repetidas | Unas 680 páginas | Plantillas de `tools/generate-geo-pages.js:400`, `tools/generate-marca-capacidad.js:197` y las de zonas |
| **Alt honestos**: describir lo que se ve («Split de pared en un salón luminoso»), sin marca ni ciudad que no aparezcan | 621 + 15 + 39 usos | Mismas plantillas |
| `og:image` en `precios.html` | 1 | Manual |
| Foto de cabecera en `guias/index.html` reutilizando una guía (p. ej. `guia-sistemas-comparativa`) | 1 | Manual |
| **Recortes** solo para formatos (p. ej. 1200×630 para redes), **no** para fingir fotos distintas | `og:image` | `sharp` |

Una sola foto repetida con 621 alt distintos no da imagen propia a ninguna página. Esto mejora la velocidad y la honestidad, **no** la variedad.

### 3.1 Por categoría de página

| Categoría | Páginas | Qué imagen haría falta | Nº de fotos | ¿Se resuelve con lo existente? |
|---|---|---|---|---|
| **Marca** (raíz 10 + ciudad 400 + capacidad 40) | 450 | Un equipo **de esa marca** instalado por ti, con el logo de la unidad interior visible; mejor si hay interior + exterior | **10 fotos** (1 por marca); ideal 20 (interior + exterior) | Solo alt genérico y técnica → **necesita foto real** |
| **Capacidad** (ciudad 160) + marca × capacidad (40) | 200 | Un equipo de esa potencia en la estancia típica (ver 3.2) | **4 fotos** (1 por tramo) | → **necesita foto real** |
| **Zonas** | 15 | Un trabajo hecho en esa zona: fachada o unidad exterior sin datos que identifiquen la vivienda, o el interior con permiso | **15** (1 por zona); mínimo 6 (1 por comarca) | `barcelona_aerial` sirve solo para las 8 zonas de Barcelona ciudad, con alt honesto → el resto **necesita foto real** |
| **Mantenimiento** (zona 15 + marca 10) | 25 | Limpieza de filtros, revisión de presiones y el informe entregado, de un servicio real | **3 fotos** | Hoy no tienen ninguna. Podrían reutilizar `guia-mantenimiento-filtro` (sin personas) como ilustración con alt honesto. Si hay que mostrar el servicio propio → **necesita foto real** |
| **Guías** | 9 (+ índice) | Ilustraciones del tema. Una foto real sumaría credibilidad en normativa (fachada), ubicación (terraza) y gas (manómetros) | 0 obligatorias; **3 recomendables** | **Sí**, con alt honesto si las confirmas como ilustrativas |
| **Categorías** (split, multisplit, conductos, cassette, suelo-techo, Dicore, marca blanca) | 7 | Un equipo de cada tipo instalado | **7 fotos** | Hay imágenes para todas menos Dicore y marca blanca. Para mostrar trabajos propios → **necesita foto real** |
| **Galería de la portada** | 1 | 4-8 trabajos reales, cada uno con su localidad verdadera | **4-8** | **Necesita foto real** (ver 2.5) |
| **Técnico / empresa** (`hero_main`, imagen para redes) | 616 (redes) | Tú o tu técnico trabajando, con consentimiento | **1-2** | **Necesita foto real** si se mantiene «Técnico Zervitecnics» |

### 3.2 Por rango de precio

Los tramos y precios «desde» salen de las propias páginas. Ojo: hay contradicciones de precios pendientes, ver `INFORME-AUDITORIA-WEB.md`.

| Tramo | Precio «desde» en la web | Páginas | Foto real que haría falta |
|---|---|---|---|
| 2.000 frigorías | 908 € + IVA | 40 capacidad + 10 marca × capacidad | Split pequeño en un **dormitorio o despacho** |
| 2.500 frigorías | 1.074 € + IVA | 40 + 10 | Split en un **dormitorio grande o salón pequeño** |
| 4.500 frigorías | 1.404 € + IVA | 40 + 10 | Split en un **salón** |
| 6.000 frigorías | 1.652 € + IVA | 40 + 10 | Split grande en un **salón amplio o local** |
| Ofertas (6 packs, 680-2.250 € + IVA) | `ofertas.html` | 1 | El **modelo exacto** de cada pack instalado (6), o dejar las actuales con el aviso «imagen orientativa» |
| Multisplit 2×1 (desde 1.487 € + IVA) | Categoría y precios | 2-3 | 1 exterior + 2 interiores del mismo trabajo |
| Conductos (desde 2.397 € + IVA) | Categoría y precios | 2-3 | Rejillas en el techo + máquina en el falso techo |

En total: **4 fotos** cubren las 200 páginas de capacidad, **+2** para multisplit y conductos.

### 3.3 Por localidad

Hay 40 localidades. Cada una tiene 14 páginas (10 de marca + 4 de capacidad), y 15 de ellas tienen además página de zona y de mantenimiento.

- **No hace falta una foto por localidad para empezar.** Y **no se debe poner el nombre de una localidad en una foto que no se hizo allí.**
- **Orden propuesto:** primero las localidades donde ya tengas trabajos reales que fotografiar; después las 17 que ya tienen enlaces (`tools/data/round1-cities.json`); por último las 23 de `docs/MUNICIPIOS_PENDIENTES.md`.
- **Mínimo útil:** 1 foto real por comarca (Barcelonès, Baix Llobregat, Vallès Occidental, Vallès Oriental, Maresme y Garraf) = **6 fotos**, con alt de comarca («Instalación en el Baix Llobregat») hasta tener una de cada localidad.
- **Ideal:** 1 foto por cada una de las 15 zonas con página propia, y luego ir añadiendo localidades según hagas trabajos.
- **Manresa:** o se consigue una foto real de allí y se añade como zona, o se quita de la galería.

### 3.4 Total de fotos reales y cómo hacerlas

| Bloque | Mínimo | Ideal |
|---|---|---|
| Marcas | 10 | 20 |
| Capacidad (4) + multisplit y conductos (2) | 6 | 8 |
| Localidad (comarcas / zonas) | 6 | 15 |
| Mantenimiento | 3 | 3 |
| Categorías | 7 | 7 |
| Galería + técnico | 5 | 10 |
| **Total** | **unas 37** | **unas 63** |

Muchas salen del mismo trabajo. Un trabajo bien fotografiado da 3-4 fotos útiles (interior, exterior, detalle, antes/después), así que **el mínimo se cubre con unos 10-15 trabajos**. Son estimaciones mías para planificar, no datos medidos.

**Lista para cada trabajo:**
- **Permiso por escrito del cliente** para publicar las fotos. Conviene una frase en el presupuesto o en el parte de trabajo. ⚖️ Que lo revise un profesional.
- Sin caras (o con consentimiento), sin números de portal, matrículas ni papeles con datos.
- **Borrar la ubicación GPS** de la foto antes de subirla. Los móviles la guardan.
- Horizontal, 4:3, 1600 px o más de ancho, luz natural; la marca de la unidad visible si es para una página de marca.
- Apuntar para cada foto: localidad, marca, potencia y tipo, para poder ponerle un alt verdadero.

---

## PASO 4 — Tandas pequeñas

Esfuerzo: **S** = menos de 1 h · **M** = de 1 a 4 h · **L** = más de 4 h. Nada aplicado; cada tanda, en su rama y con tu OK.

| Tanda | Qué | Quién | Esfuerzo | Depende de |
|---|---|---|---|---|
| **0** | Rellenar la tabla 2.5: qué fotos son reales y con qué licencia | Tú | S (30 min) | — |
| **1** | **Alt honestos** en las plantillas: `hero_split` (621), `barcelona_aerial` (15), `multisplit`/`conductos` (39). Quitar de la galería lo que no sea real, y Manresa | Yo | S-M | Tanda 0 |
| **2** | **WebP que faltan + `<picture>` en la galería**. Corregir `update-html-webp.js` (expresión y repetición segura) | Yo | S | — |
| **3** | **`width`/`height`** en el logo (con la proporción real) y en las fotos repetidas | Yo | S | — |
| **4** | **Versiones de 960/800 px + `srcset`**: unos 750 KB menos en guías y unos 45 KB menos en cada una de las 620 páginas | Yo | M | Tanda 2 |
| **5** | `og:image` en `precios.html`; imagen en `guias/index.html`; foto ilustrativa con alt honesto en mantenimiento (si la confirmas en la tanda 0) | Yo | S | Tanda 0 |
| **6** | **Sesión de fotos** de 10-15 trabajos con la lista de 3.4 + modelo de autorización del cliente | Tú (+ revisión legal) | L (semanas, según trabajos) | — |
| **7** | Integrar **10 fotos de marca** en los generadores → 450 páginas de marca + 10 de mantenimiento por marca | Yo | M | Tanda 6 |
| **8** | Integrar **4 fotos de capacidad** (+2 multisplit/conductos) → 200 páginas | Yo | M | Tanda 6 |
| **9** | Fotos por **comarca o zona** (6-15) → zonas + páginas de cada localidad | Yo | M | Tanda 6 |
| **10** | Galería real y foto del técnico (imagen para redes de 616 páginas) | Yo | S | Tanda 6 |

**Las tres primeras que haría:**
1. **Tanda 0** (tú confirmas el origen de las fotos).
2. **Tanda 1** (alt honestos y galería): quita afirmaciones que no se pueden demostrar.
3. **Tandas 2 + 3**: mejoras de velocidad seguras que no dependen de fotos nuevas.

---

## Lo que no he podido comprobar

- **El origen y la licencia de las 27 fotos.** No tienen metadatos y git no lo documenta. Lo que digo de su aspecto es una observación visual, no una prueba.
- **El tamaño real con que se ve cada imagen en cada pantalla.** He usado el CSS (`css/pages.css:20` y los estilos del commit `c64206a`), sin medirlo en un navegador.
- **El efecto real en la velocidad de carga** (LCP/CLS). No he medido la web en producción.
- **Los ahorros de la sección 2.2** son de copias convertidas en mi carpeta temporal con calidad 80. Con otra calidad o herramienta (`sharp`) pueden variar algo.
