# Informe de auditoría web — zervitecnics.es

- **Fecha:** 7 de octubre de 2026
- **Base revisada:** rama `main`, commit `fd18471` (679 archivos HTML, 54 imágenes)
- **Rama del informe:** `auditoria-web` (solo se añade este archivo; no se ha cambiado ninguna página ni script)
- **Método:** lectura del código; un script de análisis propio que recorre las 679 páginas (guardado fuera del repositorio); y una simulación del formulario en Chromium con **dobles de prueba**. En la simulación se interceptaron todas las llamadas a EmailJS, Google y Clarity: no se envió ningún email ni dato real.
- **Fuera de esta auditoría:** el `aggregateRating` falso (`aires-acondicionados/js/shared.js:797`) y la página `/opiniones/`, porque ya están resueltos en la rama local `reseñas-opiniones`.

> Esto no es asesoramiento legal. Los puntos marcados con ⚖️ los debe revisar un profesional (abogado o consultor RGPD).

---

## Resumen en 10 líneas

1. Todo el sitio tiene **un solo formulario real**, en `aires-acondicionados/index.html`, con dos versiones: el formulario principal y una ventana emergente. Las otras ~674 páginas no tienen ventana propia: sus botones llevan a `index.html#presupuesto`.
2. **reCAPTCHA no protege nada en un servidor.** Genera un token que nadie comprueba. Solo detiene a robots que no ejecutan JavaScript, igual que el campo trampa y el límite de envíos local.
3. **Si EmailJS falla, la solicitud se pierde.** Pasa si se agota la cuota, si un bloqueador lo impide o si no carga. No queda copia en ningún sitio. La ventana emergente muestra además «Error 426: The monthly limit…».
4. Si el navegador bloquea el almacenamiento local, **el formulario principal deja de funcionar**: el botón «Continuar» no hace nada (comprobado en Chromium).
5. **Aviso legal incompleto.** El NIF tiene un formato que no es válido. Falta el nombre legal del titular y la dirección completa. Aparecen tres emails de contacto distintos.
6. **La política de privacidad y la de cookies no mencionan** reCAPTCHA (carga en 677 páginas antes de que el visitante acepte), Microsoft Clarity, Google Fonts ni jsDelivr.
7. **Precios contradictorios.** Split desde 660, 680, 799 o 908 €. Solo instalación desde 247, 299 o 350 €. Conductos desde 2.397 € + IVA o 2.900 € sin indicar IVA.
8. **Garantías contradictorias.** «Garantía de instalación 1 año» en 647 páginas frente a «Garantía 3 años instalación» en las tablas de precios. La web **no afirma tener seguro de responsabilidad civil**.
9. Las páginas marca-ciudad (400) y capacidad-ciudad (160) son **un 98 % iguales** si se cambia el nombre de la ciudad. Riesgo alto de contenido fino. 322 de ellas siguen sin ningún enlace que llegue a ellas, como dice `docs/MUNICIPIOS_PENDIENTES.md`.
10. Lo técnico está sano: 0 enlaces internos rotos, sitemap igual a las páginas reales, teléfono y WhatsApp coherentes en todas partes, sin contenido mixto. Lo pendiente: 1.358 imágenes sin medidas y 7 archivos de más de 200 KB.

---

## Tabla priorizada

Esfuerzo: **S** = menos de 1 h · **M** = de 1 a 4 h · **L** = más de 4 h.

| # | Gravedad | Bloque | Problema | Dónde | Arreglo | Esfuerzo |
|---|---|---|---|---|---|---|
| 1 | **Alta** | A | Si EmailJS falla (cuota, bloqueador, caída) la solicitud se pierde: no se guarda en ningún sitio | `aires-acondicionados/js/shared.js:708-727`, `aires-acondicionados/index.html:1874-1893` | Enviar a un servidor propio gratuito que guarde una copia y luego avise por email (opción 1 del bloque A) | M-L |
| 2 | **Alta** | A | reCAPTCHA v3 no se verifica en ningún servidor: el token se pide y se tira | `shared.js:695-706`, `index.html:1862-1872` | Verificarlo en el servidor (opción 1) o quitarlo | M |
| 3 | **Alta** | A | Con el almacenamiento local bloqueado, `initCookies` lanza un error y el formulario principal no avanza | `shared.js:492` (sin `try/catch`); se cortan `initForm` (`:934`) y el arranque de EmailJS (`:944`) | Envolver `localStorage` en `try/catch` | S |
| 4 | **Alta** ⚖️ | B | Aviso legal: el NIF tiene un formato no válido; el titular es solo un nombre comercial; el domicilio es «Barcelona» | `aires-acondicionados/legal/aviso-legal.html:94-98` | Poner el nombre legal, el NIF/NIE real y la dirección completa (LSSI art. 10) | S |
| 5 | **Alta** ⚖️ | B | reCAPTCHA (Google) carga en 677 páginas antes del consentimiento y no aparece en privacidad ni en cookies | `<head>` de cada página (p. ej. `index.html:36`) | Cargarlo solo en la página del formulario o al abrirlo, y declararlo en las políticas | S-M |
| 6 | **Alta** ⚖️ | B | Microsoft Clarity se activa al pulsar «Aceptar» pero no figura en privacidad ni en cookies | `shared.js:538, 543-551`; `legal/cookies.html:96-102` | Añadirlo (cookies, finalidad, transferencias) o quitarlo | S |
| 7 | **Alta** | C | Precios «desde» contradictorios entre páginas, y unos con IVA indicado y otros sin indicar | Ver bloque C.4 | Una sola fuente de precios para todo el sitio | M |
| 8 | **Alta** | C | Garantía de instalación «1 año» (647 páginas) frente a «3 años» (tablas de precios); garantía de fabricante «3 años» frente a «5 años» | `js/pages.js:24` y siguientes; `capacidades/*.html` (~línea 363); `marcas/daikin.html` | Decidir la garantía real y unificar el texto | S-M |
| 9 | **Alta** | C | Contenido casi duplicado: marca-ciudad y capacidad-ciudad son un 98 % iguales con los nombres cambiados | `marcas/*-{ciudad}.html` (400), `capacidades/*.html` (160) | Añadir contenido único por ciudad, o reducir páginas y marcar `noindex` las más débiles | L |
| 10 | Media | A | La ventana emergente muestra errores técnicos al cliente («Error 426: The monthly limit has been reached», «EmailJS SDK no cargado…») | `index.html:1891` | Mostrar el mismo mensaje sencillo que el formulario principal | S |
| 11 | Media | A | El formulario principal pide el código postal pero no lo envía; las dos versiones mandan nombres de campo distintos (`tipo_equipo` / `tipo`) | `shared.js:683-693` y `index.html:1854-1860` | Enviar el CP; usar los mismos campos; revisar la plantilla de EmailJS | S |
| 12 | Media | A | Con reCAPTCHA bloqueado (algunos navegadores o bloqueadores), una persona real **no puede enviar** el formulario | `shared.js:699-706`, `index.html:1864-1872` | No bloquear por falta de token mientras no se verifique en el servidor; ofrecer WhatsApp | S |
| 13 | Media ⚖️ | B | Privacidad: faltan proveedores (reCAPTCHA, Clarity, Google Fonts, jsDelivr, GitHub Pages, Gmail); dice «EmailJS: servidores en la UE» sin poder comprobarlo; pide «copia de su DNI» siempre | `legal/privacidad.html:101-150` | Completar la lista de proveedores y las transferencias; pedir identificación solo si hay dudas | M |
| 14 | Media ⚖️ | B | Cookies: la tabla no coincide con la realidad (no aparecen Clarity ni reCAPTCHA; `_gtm_*` no es una cookie real; `sz_consent` se guarda en el navegador y no caduca al año) | `legal/cookies.html:96-102` | Rehacer la tabla con lo que de verdad carga la web | S-M |
| 15 | Media | B | La portada `index.html` (raíz) carga GTM y GA4 pero no tiene aviso de cookies ni `shared.js`: el visitante no puede aceptar ni rechazar | `index.html` (raíz) | Añadir el aviso o no cargar analítica en esa página | S |
| 16 | Media | C | Hay texto «PENDIENTE VERIFICAR» visible para el público en dos guías | `guias/normativa-comunidad-vecinos-barcelona.html:336`, `guias/subvenciones-como-solicitarlas.html:335` | Comprobar los datos y quitar la nota, o quitar el dato | S |
| 17 | Media | C | 322 páginas huérfanas (0 enlaces entrantes): 92 de capacidad + 230 de marca, de 23 municipios | Ver `docs/MUNICIPIOS_PENDIENTES.md` (las cifras coinciden) | Tanda 2 de enlazado interno | M |
| 18 | Media | C | Schema `LocalBusiness` de 15 zonas pone como dirección el barrio o municipio (p. ej. «Gràcia, 08012»), como si hubiera un local allí | `zonas/*.html:55` | Usar `areaServed` y una sola dirección real | S |
| 19 | Media | C | El schema `Service` que se inyecta por JavaScript pone precios de 299/399/990 € que no aparecen en ninguna tabla; también se activa en la guía «split-vs-multisplit» | `js/pages.js:313-320` | Quitar el precio o usar el de la tabla | S |
| 20 | Media | C | La galería dice «Ejemplos reales de nuestro trabajo» (Mataró, **Manresa**…). No puedo comprobar que las fotos sean propias, y Manresa no está entre las zonas atendidas | `index.html:1427-1451` | Confirmar que son fotos propias o cambiar el texto | S |
| 21 | Media | D | 1.358 de 2.051 `<img>` sin `width`/`height` (hace que la página «salte» al cargar) | Sobre todo el logo (666 veces) y `hero_split.jpg` (620) | Añadirlos en las plantillas | S-M |
| 22 | Baja | A | La CSP se declara después de los scripts de GTM, GA4 y reCAPTCHA en el `<head>`, así que no los cubre | `index.html:38` (y la misma posición en 677 páginas) | Subir la meta CSP al principio del `<head>` | S |
| 23 | Baja | A | EmailJS se carga en 5 páginas de categorías sin formulario, con versión flotante `@4` y sin control de integridad | `categorias/{split,multisplit,conductos,cassette,suelo-techo}.html:57` | Quitarlo de esas páginas | S |
| 24 | Baja | B | El botón «Restablecer» de `cookies.html` recarga una página que no tiene aviso de cookies | `js/pages.js:211-217`; `legal/cookies.html` | Mostrar el aviso o los controles en la propia página | S |
| 25 | Baja | C | 609 títulos de más de 60 caracteres y 270 descripciones de más de 160 (no hay duplicados) | Sobre todo `capacidades/` y `marcas/` | Acortarlos en el generador | S |
| 26 | Baja | C | Las 3 páginas legales tienen `noindex` pero están en el sitemap | `sitemap.xml` | Quitarlas del sitemap | S |
| 27 | Baja | C | Promesas de tiempo de respuesta distintas: «menos de 2 horas» y «menos de 24 horas» | `aires-acondicionados/index.html:767, 976, 1694` | Elegir una | S |
| 28 | Baja | D | 7 archivos de más de 200 KB; `barcelona_aerial.jpg` (218 KB) y `galeria_exterior.jpg` no tienen versión WebP; 3 WebP de la galería existen pero no se usan | `aires-acondicionados/img/` | Comprimir; usar `<picture>` en la galería | S |
| 29 | Baja | D | `barcelona_aerial.jpg` tiene el texto alternativo «Vista de Sabadell», «Vista de Badalona»… en 15 páginas, pero es la misma foto | `zonas/*.html` (~línea 162) | Alt honesto o foto propia por zona | S |
| 30 | Baja | E | La 404 de la raíz no tiene teléfono ni WhatsApp y usa una ruta relativa para el favicon | `404.html:6` | Añadir contacto; usar ruta absoluta `/favicon.svg` | S |
| 31 | Baja | E | El README está desactualizado (habla de `GTM-TF473QQQ` y de `TU_PUBLIC_KEY`) | `README.md` | Actualizarlo | S |

---

## A) Formularios y reCAPTCHA

### A.1 Qué formularios hay y por dónde se envían

| Formulario | Archivo | Envío | Campos que manda |
|---|---|---|---|
| Formulario principal de 2 pasos (`#budget-form`) | `aires-acondicionados/index.html:798-970`; lógica en `js/shared.js:598-729` | EmailJS (`service_tfuzhfr` / `template_wcjvjy3`) | `nombre, telefono, zona, tipo_equipo, marca, problema, distancia_exterior, planta, observaciones` |
| Ventana emergente «Presupuesto gratuito» (`#presup-modal`) | `aires-acondicionados/index.html:1690-1893` | EmailJS (los mismos IDs) | `nombre, telefono, zona (con CP), tipo, observaciones` |

**Corrección a lo que esperábamos:** la ventana emergente **solo existe en `aires-acondicionados/index.html`** (la función `openPresupModal` aparece en 1 archivo). En las otras páginas, los botones «Pedir presupuesto» enlazan a `../index.html#presupuesto`: lo comprobé en 674 páginas. Por eso cualquier problema del formulario afecta a todo el sitio, pero solo hay que arreglarlo en un sitio.

Detalles que encontré:
- El formulario principal **no envía el código postal** aunque lo pide (`f-postal`). Tampoco envía m² ni el número de estancias de la sección de conductos. La simulación confirma que el CP no llega (ver A.5).
- La zona llega como clave interna (`gracia`), no como nombre legible (`Gràcia`).
- Las dos versiones usan nombres distintos para el tipo (`tipo_equipo` / `tipo`). No puedo ver la plantilla de EmailJS. Si la plantilla solo usa `{{tipo}}` (como dice el README), **en los emails del formulario principal ese campo llega vacío**. Hay que comprobarlo en el panel de EmailJS.

### A.2 reCAPTCHA v3: ¿quién lo verifica?

**Nadie. Lo confirmo leyendo el código:**
- `shared.js:62-71` pide un token a Google.
- `shared.js:695-706` y `index.html:1862-1872` solo miran si el token existe. Si no existe, cortan el envío. Si existe, **no lo mandan a ningún sitio**: no va en los datos de EmailJS (la simulación lo confirma) y no hay ningún servidor propio.
- El comentario de `index.html:1862` lo dice claramente: «reCAPTCHA v3 = guard local. NO se envía a EmailJS».

**Qué protege de verdad hoy:**

| Defensa | Dónde | Qué para | Qué no para |
|---|---|---|---|
| Token de reCAPTCHA «local» | `shared.js:699`, `index.html:1864` | Robots que no ejecutan JavaScript de Google | Cualquier robot con un navegador real, y cualquiera que llame directamente a la API de EmailJS. Los IDs de servicio y plantilla y la clave pública están en el código de la página, como es normal en EmailJS |
| Campo trampa `website` (`f-website` / `m-website`) | `index.html:800-801, 1698-1699`; se comprueba en `shared.js:659` e `index.html:1833` | Robots sencillos que rellenan todos los campos | Robots que solo rellenan campos visibles |
| Tiempo mínimo de 3 s (solo formulario principal) | `shared.js:660` | Robots muy rápidos | Robots que esperan. La ventana emergente no tiene esta comprobación |
| Límite local: 1 envío por minuto y 3 por sesión | `shared.js:83-108` | Dobles clics y reenvíos de una persona | Cualquiera que borre los datos del navegador o use otro navegador |
| Ajustes del panel de EmailJS (dominios permitidos, captcha, límites) | Fuera del repositorio | **No puedo comprobarlo**: no tengo acceso al panel | — |

En resumen: hoy la protección real contra spam depende de lo que esté configurado en el panel de EmailJS, y eso no lo puedo ver.

### A.3 CSP y qué pasa si algo no carga

La meta CSP es la misma en 677 páginas (en `index.html:38`). Permite:
- `script-src`: `cdn.jsdelivr.net` (EmailJS), `www.google.com` y `www.gstatic.com` (reCAPTCHA), GTM, GA y Clarity ✔
- `connect-src`: `api.emailjs.com`, `www.google.com`, `www.gstatic.com`, GA y Clarity ✔
- `frame-src`: `www.google.com` (iframe de reCAPTCHA) ✔

O sea, **la CSP no bloquea ni EmailJS ni reCAPTCHA**.

Matices:
- La meta CSP aparece **después** de los scripts de GTM, GA4 y reCAPTCHA del `<head>`. El navegador solo aplica una CSP declarada con `<meta>` a lo que viene detrás, así que esos tres scripts quedan fuera de la CSP.
- La raíz `index.html` y `404.html` no tienen CSP.
- No he podido ver las cabeceras HTTP reales del servidor (GitHub Pages): en esta revisión no consulté la web en producción.

**Qué ve el cliente en cada fallo** (comprobado en la simulación, ver A.5):

| Situación | Formulario principal | Ventana emergente | ¿Se pierde la solicitud? |
|---|---|---|---|
| EmailJS no carga (bloqueador, caída del CDN) | Aviso del navegador: «No hemos podido enviar tu solicitud en este momento. Por favor, llámanos al 625 215 983 o escríbenos por WhatsApp.» | Texto rojo: **«Error ?: EmailJS SDK no cargado (revisa CSP / bloqueador de scripts)»** + «Llámanos al 625 215 983» | **Sí**: no se guarda nada |
| Cuota mensual de EmailJS agotada | El mismo aviso sencillo | Texto rojo: **«Error 426: The monthly limit has been reached»** + teléfono | **Sí** |
| reCAPTCHA no carga | «No hemos podido verificar que eres humano. Recarga la página o llámanos…» | El mismo mensaje en rojo | **Sí**. Además, **una persona real no puede enviar** aunque EmailJS funcione |
| Almacenamiento del navegador bloqueado | **El botón «Continuar» no hace nada** (error de JavaScript en `shared.js:492`) | Funciona | Sí: el cliente ni siquiera puede rellenarlo |

(El código de error 426 es el que puse en el doble de prueba para simular la cuota agotada. No sé qué código exacto devuelve hoy EmailJS. Lo importante es que la ventana emergente enseña al cliente el texto técnico que llegue.)

En todos los casos el evento `form_error` se envía a la capa de datos de Google Tag Manager, pero eso **no guarda los datos del cliente**: el nombre y el teléfono se pierden si no llama.

### A.4 Consentimiento y RGPD en el formulario

- Las dos versiones tienen una casilla obligatoria «He leído y acepto la política de privacidad *» con enlace a `legal/privacidad.html` (`index.html:965-966` y `1740-1743`). La casilla empieza sin marcar ✔ y se comprueba antes de enviar ✔.
- Falta la **información básica junto al formulario**: quién es el responsable, para qué se usan los datos y dónde ejercer los derechos. Se suele poner en una línea debajo del botón. ⚖️
- Falta decir que los datos pasan por EmailJS y llegan a una cuenta de Gmail. ⚖️
- El mensaje de error técnico de la ventana emergente se arregla en 5 minutos (fila 10 de la tabla).

### A.5 Simulación con doble de prueba (sin emails reales)

Monté la web en un servidor local y la abrí en Chromium. Sustituí EmailJS y reCAPTCHA por versiones falsas y bloqueé el resto de peticiones externas.

| # | Escenario | Resultado |
|---|---|---|
| 1 | Formulario principal, todo bien | Redirige a `gracias.html` ✔ |
| 2 | Ventana emergente, todo bien, y luego un segundo envío | Redirige a `gracias.html` ✔. El segundo intento se frena: «Ya hemos recibido tu solicitud hace un momento.» ✔ |
| 3 | EmailJS bloqueado (formulario principal) | Aviso sencillo con teléfono y WhatsApp ✔ |
| 4 | EmailJS bloqueado (ventana emergente) | «Error ?: EmailJS SDK no cargado (revisa CSP / bloqueador de scripts)» ✘ |
| 5 | Cuota agotada (ventana emergente) | «Error 426: The monthly limit has been reached» ✘. Datos enviados: `nombre, telefono, zona: "Gràcia (CP 08012)", tipo, observaciones`. **Sin token de reCAPTCHA** |
| 6 | Cuota agotada (formulario principal) | Aviso sencillo ✔. Datos enviados: `zona: "gracia"`, **sin código postal**, `planta: "1"` aunque no era multisplit. **Sin token de reCAPTCHA** |
| 7 | reCAPTCHA bloqueado (formulario principal) | No deja enviar: «No hemos podido verificar que eres humano…» |
| 8 | reCAPTCHA bloqueado (ventana emergente) | No deja enviar (el mismo mensaje) |
| 9 | Cookies: «Solo necesarias» | El consentimiento sigue denegado y Clarity no carga ✔ |
| 10 | Cookies: «Aceptar» | Pasa a `analytics_storage` y `ad_storage` concedidos y se carga Clarity |
| 11 | Almacenamiento del navegador bloqueado | Error de JavaScript «blocked» y el paso 2 del formulario no aparece ✘ |

El script de la simulación está en mi carpeta temporal de trabajo, no en el repositorio. Si lo quieres guardar en `tools/`, dímelo.

### A.6 Tres opciones (todas gratuitas) — no implementadas

| Opción | Cómo funciona | Coste | A favor | En contra |
|---|---|---|---|---|
| **1. EmailJS + verificación con una función gratuita** (Cloudflare Worker o Supabase Edge Function) | El formulario envía a la función → la función verifica el token de reCAPTCHA con Google → guarda una copia (Cloudflare KV/D1 o tabla de Supabase) → envía el email por la API de EmailJS desde el servidor | 0 €. Cloudflare Workers tiene un plan gratuito con un límite diario de peticiones muy por encima del uso de esta web; Supabase gratis pausa el proyecto tras días sin uso. *Comprueba los límites actuales en sus webs: los cito de memoria* | Verifica de verdad. **No se pierden solicitudes** aunque falle EmailJS. Las claves dejan de estar en la página. Funciona sin depender del bot | Hay que mantener un trozo de código más (~100 líneas). Hay que dar de alta el dominio de la función en la CSP |
| **2. Enviar al backend del bot, que guarda cada contacto en base de datos** | El formulario envía a un endpoint del bot → verificación de reCAPTCHA → guardado en base de datos → aviso | 0 € si el bot ya está desplegado | Todos los contactos en un mismo sitio (web + WhatsApp). Fácil de seguir después | **No conozco el estado del bot** (no está en este repositorio). Si el bot cae, la web deja de recibir solicitudes. Mezcla dos proyectos |
| **3. Servicio tipo Web3Forms o Formspree** | El formulario envía a su API y ellos mandan el email | 0 € con límites mensuales de envíos en el plan gratuito, más bajos en Formspree. *Comprueba las cifras actuales* | Lo más rápido de montar | Otro proveedor más para la política de privacidad. Límite mensual (el mismo problema que hoy). La verificación anti-spam depende de ellos |

**Recomendación: opción 1 con Cloudflare Worker.** Es la única que resuelve a la vez los dos problemas graves:
1. Verifica reCAPTCHA en un servidor.
2. Guarda una copia de cada solicitud, así que un fallo de EmailJS ya no hace perder un cliente.

No depende del bot y sigue siendo gratis. Más adelante, el Worker puede reenviar cada contacto al bot y llegas a la opción 2 sin rehacer nada. Mientras tanto se pueden hacer ya los arreglos rápidos: filas 3, 10, 11 y 12 de la tabla.

---

## B) Políticas legales

### B.1 Existencia y enlaces

- Existen las tres: `aires-acondicionados/legal/aviso-legal.html`, `privacidad.html` y `cookies.html`.
- Las tres están enlazadas desde 676 de 679 páginas. Faltan solo en `404.html`, `aires-acondicionados/404.html` y `aires-acondicionados/gracias.html`.
- Los dos formularios enlazan a privacidad ✔.
- Las tres tienen `noindex, follow` (bien), pero están en `sitemap.xml` (fila 26).

### B.2 Aviso legal ⚖️ (`legal/aviso-legal.html:94-98`)

| Dato | Lo que pone | Problema |
|---|---|---|
| Titular | «Zervitecnics Barcelona» | Es un nombre comercial. La LSSI pide el nombre o la razón social del titular (persona física o sociedad) |
| NIF | Un valor de 2 letras + 6 cifras | **No tiene formato de NIF, NIE ni CIF españoles**: el NIF son 8 cifras + letra; el NIE, X/Y/Z + 7 cifras + letra; el CIF, letra + 7 caracteres. Puede ser un número de pasaporte o un error. Hay que poner el NIF/NIE real |
| Domicilio | «Barcelona, Cataluña, España» | Falta la dirección completa (calle, número, código postal) |
| Email | `avisos.servitecnic24h@gmail.com` | Hay **tres emails distintos** en la web: este; `info@zervitecnics.es` (pie de página, cookies y schema de `index.html`); y `formularios.zervitecnics@gmail.com` (schema de `shared.js:774`). No sé si los tres funcionan. Conviene usar uno |
| Registro mercantil | No aparece | Solo hace falta si el titular es una sociedad |
| Actividad | «CNAE 4322» | Bien |

### B.3 Privacidad (RGPD/LOPDGDD) ⚖️ (`legal/privacidad.html`)

| Elemento | Estado |
|---|---|
| Responsable | Mismos fallos que el aviso legal: sin nombre legal, sin NIF y sin dirección completa |
| Finalidades y base jurídica | Bien planteadas (tabla con art. 6.1.a/b/c) |
| Datos recogidos | Lista nombre, teléfono, zona, tipo y observaciones. No menciona el código postal, la marca, el servicio, la distancia ni la planta, que también se piden |
| Conservación | 3 años (presupuestos) y 5 años (clientes): concreto, bien |
| Destinatarios | Menciona EmailJS, Google Analytics/GTM y WhatsApp (Meta). **Faltan:** Google reCAPTCHA (carga en todas las páginas), **Microsoft Clarity** (grabación de sesiones tras aceptar), Google Fonts (las fuentes se piden a Google con la IP del visitante), jsDelivr (CDN de EmailJS), GitHub Pages (alojamiento) y Gmail (donde llegan los emails) |
| «EmailJS: servidores en la UE» | **No lo he podido comprobar.** Hay que mirarlo en el contrato de encargado de tratamiento (DPA) de EmailJS |
| Derechos | Están todos y se menciona la AEPD ✔. Exige «copia de su DNI» siempre; la AEPD considera que solo se puede pedir si hay dudas sobre la identidad |
| Transferencias internacionales | Solo habla de Google Analytics. Faltan reCAPTCHA (Google), Clarity (Microsoft), WhatsApp (Meta) y, según dónde esté alojado, EmailJS |

### B.4 Cookies: lo que de verdad carga la web frente a lo que dice la política

| Script o servicio | ¿Carga? | ¿Antes del consentimiento? | ¿En la política de cookies? | ¿En privacidad? |
|---|---|---|---|---|
| Google Tag Manager `GTM-P6C8L3VX` | Sí, 660+ páginas y la raíz | Sí (con el modo de consentimiento en «denegado») | Sí (`_gtm_*`, que no es un nombre de cookie real) | Sí |
| Google Analytics 4 `G-N4C8H8KMFD` (gtag directo + GTM) | Sí | Sí, en modo «denegado»: Google recibe avisos sin cookies | Sí (`_ga`, `_ga_*`) | Sí |
| Google reCAPTCHA v3 | Sí, 677 páginas | **Sí, sin esperar a nada** | **No** | **No** |
| Microsoft Clarity `xbowxa66oa` | Solo tras «Aceptar» | No ✔ | **No** | **No** |
| EmailJS (jsDelivr) | 6 páginas | Sí (no pone cookies, pero el CDN ve la IP) | No (no hace falta como cookie) | EmailJS sí; jsDelivr no |
| Google Fonts | Todas | Sí | No | **No** |
| `sz_consent` | Guardado en el navegador (localStorage), no es una cookie | — | Sí, con «1 año», pero el código no lo hace caducar nunca | — |

**Modo de consentimiento:** arranca en «denegado» para todo (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) ✔, comprobado en la simulación. Al pulsar «Aceptar» se conceden `analytics_storage` y `ad_storage` y se carga Clarity. Con «Solo necesarias» no se concede nada ✔.

Observaciones ⚖️:
- Con GA4 cargado en modo «denegado», Google recibe avisos sin cookies antes de que el visitante decida (lo que se llama modo avanzado). Es una práctica discutida; que lo valore un profesional.
- `ad_storage` se concede aunque la web no parece usar publicidad. Si no hay campañas, sobra.
- **El aviso funciona**, pero en 671 páginas solo dice «Usamos cookies. Más info» con dos botones. No explica para qué se usan (analítica y grabación de sesiones) y no deja elegir por tipo. Solo `aires-acondicionados/index.html` tiene un texto más completo y un botón «Configurar», que lleva a una página sin controles por tipo.
- No hay forma visible de retirar el consentimiento desde cualquier página. Solo el botón «Restablecer» de `cookies.html`, que recarga una página sin aviso (fila 24).
- La portada raíz `index.html` carga GTM y GA4 sin aviso de cookies (fila 15).
- Si GTM tiene también una etiqueta de GA4, además del `gtag` directo, las visitas se contarían dos veces. **No puedo comprobarlo** sin acceso al contenedor de GTM.

### B.5 Responsabilidad civil y garantías

- **La web no afirma tener seguro de responsabilidad civil.** Busqué «seguro», «asegurado», «póliza» y «responsabilidad civil» en las 679 páginas y los scripts. La única coincidencia es «¿Es seguro?» sobre el gas R32. No hay nada que retirar por este lado.
- **Garantías: sí hay afirmaciones, y se contradicen:**
  - «Garantía de instalación Zervitecnics: 1 año» en 647 páginas (bloque de garantías de capacidades y marcas, ~línea 363), en `mantenimiento.html` y en `instalacion-personalizada.html`.
  - «Garantía 3 años instalación» en las tarjetas de precios que pinta `js/pages.js:24` (y siguientes), visibles en `index.html` y en `categorias/split.html` y `multisplit.html`.
  - Garantía de fabricante: «3 años» en la mayoría de páginas; **«5 años»** en `marcas/daikin.html`, `fujitsu.html`, `lg.html`, `mitsubishi.html` y `panasonic.html`; «10 años de compresor» en LG y Samsung.
- ⚖️ Varias páginas dicen «3 años de garantía directamente con el fabricante». En España la garantía legal la debe el vendedor, no el fabricante. Que un profesional revise la redacción.
- El schema de `shared.js:771` y `:803` afirma «carnet de gases fluorados», «habilitación RITE» e «Instalador HVAC certificado» en todas las páginas. **No puedo comprobarlo**: hay que confirmar que es cierto y que está vigente.

---

## C) Contenido y huecos

### C.1 Zonas que faltan

**Lo que hay hoy:** 40 municipios con páginas de marca y capacidad (`tools/data/ciudades.json`); 15 páginas de zona (`zonas/`); 15 de mantenimiento por zona.

**Los 23 municipios huérfanos de `docs/MUNICIPIOS_PENDIENTES.md`: confirmado.** El análisis encuentra exactamente 92 páginas de capacidad + 230 de marca (322) sin ningún enlace entrante, de Maresme (10), Vallès Oriental (7), Vallès Occidental (5) y Garraf (1).

**Municipios con páginas de marca y capacidad pero sin página de zona (25):** Santa Coloma de Gramenet, Sant Adrià de Besòs, Esplugues, Sant Boi, Gavà, Viladecans, El Prat, Sant Just Desvern, Sant Joan Despí, Cerdanyola, Rubí, Sant Quirze, Castellar, Barberà y los 10 del Maresme, 7 del Vallès Oriental y Sitges. Las 15 zonas actuales son 8 distritos de Barcelona y 7 municipios.

**Distritos de Barcelona sin página** (de los 10): **Ciutat Vella** y **Horta-Guinardó**.

**Barrios de Barcelona:** ninguno de los 73 barrios oficiales tiene página propia. Si se hacen, los más útiles para empezar serían los de mucha vivienda y mucho calor en verano:
- *Ciutat Vella:* el Raval, el Gòtic, la Barceloneta, Sant Pere-Santa Caterina-la Ribera (el Born).
- *Eixample:* Sagrada Família, Dreta de l'Eixample, Antiga y Nova Esquerra, Sant Antoni, Fort Pienc.
- *Sants-Montjuïc:* Poble-sec, Hostafrancs, la Bordeta, Sants-Badal.
- *Les Corts:* Pedralbes, la Maternitat i Sant Ramon.
- *Sarrià-Sant Gervasi:* Sant Gervasi-Galvany, la Bonanova, les Tres Torres, el Putxet i el Farró.
- *Gràcia:* Vila de Gràcia, Camp d'en Grassot, la Salut, Vallcarca.
- *Horta-Guinardó:* el Guinardó, Horta, el Carmel, la Vall d'Hebron.
- *Nou Barris:* Vilapicina, Porta, la Prosperitat, Verdun.
- *Sant Andreu:* la Sagrera, Navas, el Congrés i els Indians, el Bon Pastor.
- *Sant Martí:* el Poblenou, el Clot, Diagonal Mar, la Verneda, Sant Martí de Provençals.

*Aviso:* con la plantilla actual, crear páginas de barrio solo empeoraría el contenido duplicado (C.2). Primero hay que tener contenido propio por zona.

**Municipios cercanos sin ninguna página** (solo nombres, sin datos inventados):
- *Baix Llobregat:* Sant Feliu de Llobregat, Molins de Rei, Sant Vicenç dels Horts, Sant Andreu de la Barca, Martorell, Esparreguera, Olesa de Montserrat, Begues.
- *Vallès Occidental:* Montcada i Reixac, Ripollet, Santa Perpètua de Mogoda, Badia del Vallès, Matadepera, Castellbisbal, Polinyà.
- *Vallès Oriental:* Montornès, Montmeló, La Llagosta, Les Franqueses, Canovelles, La Roca.
- *Maresme:* Montgat, Tiana, Alella, Teià, Vilassar de Dalt, Premià de Dalt, Sant Andreu de Llavaneres, Malgrat de Mar.
- *Garraf:* Vilanova i la Geltrú, Sant Pere de Ribes.
- *Bages:* **Manresa** aparece en la galería de la portada como trabajo realizado, pero no hay ninguna página de Manresa. O se añade o se quita esa mención.

**Sectores y servicios sin página:**
- Servicios que el propio formulario ofrece y no tienen página: equipo **portátil**, **recarga de gas**, **averías** (no enfría, ruidos, goteo) y **cambio de equipo o desinstalación**.
- Tipos de cliente (propuesta; valora tú si hay demanda): comercios y locales, oficinas, restaurantes, comunidades de vecinos, pisos de alquiler.

### C.2 Contenido muy repetido (riesgo de contenido fino)

Medí qué parte del texto de cada página aparece igual en otras páginas de su mismo tipo, en bloques de 5 palabras:

| Tipo de página | Nº | Palabras de media | Texto compartido con otra del mismo tipo (sin menú ni pie) | **Con los nombres de ciudad y marca igualados** |
|---|---|---|---|---|
| marca-ciudad (`marcas/{marca}-{ciudad}`) | 400 | 1.128 | ~72 % (p. ej. daikin-badalona frente a daikin-sitges) | **98 %** de media (mínimo 91 %) |
| capacidad-ciudad (`capacidades/`) | 160 | 1.101 | ~72 % | **98 %** de media (mínimo 92 %; Mataró frente a Granollers: 99 %) |
| marca-capacidad | 40 | 830 | — | 84 % (daikin-2000 frente a lg-2500) |
| zonas | 15 | 782 | 68 % (badalona frente a sabadell) | 77 % |
| mantenimiento-zonas | 15 | 963 | 68 % | 77 % |
| mantenimiento-marcas | 10 | 1.047 | — | 73 % |
| guías | 9 | 1.533 | 1 % | — |

**Qué significa:** 560 páginas (marca-ciudad + capacidad-ciudad) son la misma página con otro nombre. Google suele indexar solo unas pocas y tratar el resto como duplicadas o de poco valor. Eso puede arrastrar la valoración de todo el sitio. Las guías y las páginas de zona tienen bastante más contenido propio.

**Arreglo** (esfuerzo L): dar a cada ciudad datos propios y verdaderos (barrios atendidos, tipo de vivienda, normativa municipal, fotos propias, opiniones reales cuando las haya). Si eso no es posible, reducir las combinaciones y marcar `noindex` o unir las más débiles.

### C.3 Títulos, descripciones, canonicals, schema y huérfanas

- **Títulos:** 0 duplicados ✔; 609 pasan de 60 caracteres (Google los corta).
- **Descripciones:** 0 duplicadas ✔; 270 pasan de 160 caracteres; faltan en las dos 404 (da igual).
- **H1:** exactamente uno por página en las 679 ✔.
- **Canonical:** todas las páginas indexables tienen canonical propio y correcto ✔. Solo faltan en las 404 y en `gracias.html`, que no se indexan.
- **Schema:** 0 bloques JSON-LD con errores de sintaxis ✔. Tipos: BreadcrumbList (675), FAQPage (623), Service (598), Product (40), LocalBusiness (16 en el HTML + el que inyecta `shared.js` en el resto), Article (8) y Organization/WebSite (raíz). Problemas:
  - Los `LocalBusiness` de las 15 zonas usan el barrio o municipio como dirección (fila 18).
  - El `LocalBusiness` que inyecta `shared.js:776-782` usa `streetAddress: "Barcelona"` y código postal 08001, que no es una dirección real.
  - El `Service` de `js/pages.js:313-320` pone precios de 299/399/990 € (fila 19).
  - La respuesta FAQ sobre ayudas (`index.html:614`) da cifras de 2026 (Plan Renove hasta 500 €, ICAEN 40 %, IRPF 60 %) que **no he podido verificar**. Hay que comprobarlas con las convocatorias vigentes.
- **Huérfanas:** 322 de marca y capacidad (C.1), más `gracias.html` y las 404, que es normal.

### C.4 Precios contradictorios

Precios «desde» por producto, según la página:

| Producto | Cifras encontradas | Dónde |
|---|---|---|
| Split 1×1 pack completo (el más barato) | **660 € + IVA** · **680 €** (+IVA en ofertas, sin indicar IVA en precios) · **799 €** sin indicar IVA · **908 € + IVA** | `guias/split-vs-multisplit-vs-conductos.html` y `shared.js:966` · `ofertas.html`, `precios.html:116` · `zonas/nou-barris.html:88,167` · `precios.html`, `capacidades/2000-*` |
| Split 3,5 kW / 2.500-3.000 frigorías | **1.074 € + IVA** frente a **1.299 € «instalado»** sin indicar IVA | `precios.html`, `capacidades/2500-*` · `zonas/sants.html:104,223` |
| Split 7 kW / 6.000 frigorías | **1.569 € + IVA** (7 kW) frente a **1.652 € + IVA** (6.000 frigorías, unos 7 kW) | `precios.html:138` · `capacidades/6000-*.html:136` |
| Solo instalación | **247 € + IVA** · **299 €** sin indicar IVA (y 299 en el schema) · **350 €** sin indicar IVA | `precios.html:149`, tabla de `index.html` · `zonas/sant-andreu.html:96,219`, `pages.js:317` · `instalacion-personalizada.html:432` |
| Conductos | **2.397 € + IVA** frente a **2.900 €** sin indicar IVA (15 páginas de zona) frente a **990 €** (schema) | `precios.html` · `zonas/*.html:201` · `pages.js:319` |
| Multisplit 2×1 | **1.487 € + IVA** frente a **399 €** (schema) | `precios.html` · `pages.js:315` |
| Limpieza o mantenimiento | **«desde 60 €»** sin indicar IVA frente a **70 € + IVA** (preventivo, en 400+ páginas) frente a «desde 70 €» sin indicar IVA | `precios.html:188` · `mantenimiento*.html`, guías · `index.html` |

**Causa:** los precios viven en cuatro sitios: `shared.js` (`PRECIOS_WEB`), `pages.js` (`PRECIOS`), el HTML generado por `tools/` y el texto escrito a mano en las zonas.

**Arreglo:** un único archivo de precios (por ejemplo, `tools/data/precios.json`) del que salgan las páginas y los schemas, y siempre «+ IVA» o siempre «IVA incluido». Ojo: al público final, la normativa de consumo pide normalmente mostrar el precio final con impuestos. ⚖️

---

## D) Imágenes

**Inventario `aires-acondicionados/img/`:** 54 archivos, 6.327 KB (6,3 MB): 29 JPG, 24 WebP y 1 PNG. En la raíz están `apple-touch-icon.png`, `favicon-32.png` y `favicon.svg`.

| Comprobación | Resultado |
|---|---|
| `<img>` sin `alt` | **0 de 2.051** ✔ (todos tienen texto alternativo) |
| `<img>` sin `width`/`height` | **1.358 de 2.051**: logo (666), `hero_split.jpg` (620), `multisplit_service.jpg` (20), `conductos_service.jpg` (16), `barcelona_aerial.jpg` (15), galería… |
| Sin versión WebP | `barcelona_aerial.jpg` (218 KB, 15 páginas) y `galeria_exterior.jpg` (69 KB) |
| WebP que existen pero no se usan | `galeria_manresa.webp`, `galeria_mataro.webp` y `galeria_conductos.webp`: la galería de `index.html:1439-1451` usa `<img>` normal, sin `<picture>` |
| Archivos de más de 200 KB | 7: `guia-normativa-eixample.jpg` (360) y `.webp` (259), `guia-subvenciones-eficiencia.jpg` (250), `guia-ubicacion-terraza.jpg` (238), `guia-sistemas-comparativa.jpg` (235), `barcelona_aerial.jpg` (218), `guia-mantenimiento-filtro.jpg` (211). Los JPG de las guías tienen WebP; el problema está en el WebP de normativa y en la foto aérea |
| La misma imagen en muchas páginas | Logo (676), `hero_split.jpg` (620), `multisplit_service.jpg` (21), `conductos_service.jpg` (17), `barcelona_aerial.jpg` (15, con alt «Vista de {ciudad}» en cada zona: engañoso) |
| Páginas sin ninguna imagen propia (todas sus imágenes se repiten en 5 o más páginas) | **665 de 679**: todas las de marcas (450), capacidades (160), zonas (15), mantenimiento (25), 5 de las 7 categorías, precios y subvenciones. Solo tienen foto propia la portada del vertical, las ofertas y 8 de las 9 guías |
| Fotos que la web presenta como «trabajos reales» | Galería de `index.html:1427-1451` (Eixample, Gràcia, Mataró, Manresa…). **No puedo comprobar que sean propias.** Si no lo son, hay que cambiar el texto «Ejemplos reales de nuestro trabajo» |

Solo es un informe: no he generado ni cambiado ninguna imagen.

---

## E) Técnica

| Comprobación | Resultado |
|---|---|
| Enlaces internos rotos | **0** en los `<a href>` de las 679 páginas ✔ |
| Recursos locales rotos (CSS, JS, imágenes) | **0** ✔ |
| Teléfono | `tel:+34625215983` en 678 páginas y «625 215 983» en el texto. **Ningún otro número** ✔ (la 404 de la raíz no tiene teléfono) |
| WhatsApp | `wa.me/34625215983` en 672 páginas, el mismo número ✔. `shared.js:394-405` añade un mensaje según la página. No está en legales, 404, gracias ni en la raíz |
| Sitemap frente a páginas reales | 676 URL (667 + 9 de guías), 0 duplicadas, 0 que no existan, 0 páginas indexables fuera del sitemap ✔. Sobran las 3 legales con `noindex` |
| robots.txt | Permite todo, incluidos los robots de IA, y declara los 2 sitemaps ✔ |
| Página 404 | GitHub Pages usa la `404.html` de la raíz: `noindex`, botones a `/` y al vertical ✔; sin teléfono y con el favicon en ruta relativa. La copia en `aires-acondicionados/404.html` no la usa GitHub Pages |
| Páginas con `noindex` | 6: las dos 404, `gracias.html` y las tres legales. Todas con sentido ✔ |
| Contenido mixto (`http://`) | **0** ✔ |
| Idioma | `lang="es"` en todas ✔ |
| Accesibilidad básica | H1 único ✔, alt ✔, enlace «Saltar al contenido» ✔, la ventana emergente tiene `role="dialog"`, mantiene el foco dentro y se cierra con Escape ✔, el menú móvil tiene `aria-expanded` ✔. A mejorar: el aviso de cookies de 671 páginas no tiene `role`/`aria-label`; la ventana usa `alert()` si no eliges tipo; `shared.js:741-748` bloquea el clic derecho en imágenes (molesta y no protege). **El contraste de colores no lo he medido** |
| Peso del HTML | Mediana 33 KB; la más pesada `aires-acondicionados/index.html` (99 KB); 22,6 MB en total. CSS: `shared.css` 37 KB + `pages.css` 7 KB. JS: `shared.js` 39 KB + `pages.js` 12 KB. Razonable |
| Scripts de terceros por página | GTM + gtag GA4 + reCAPTCHA + Google Fonts en casi todas, y Clarity tras aceptar. reCAPTCHA es el más pesado y en 676 páginas no sirve para nada (no hay formulario) |
| Otros | `target="_blank"` sin `noopener` en 7 enlaces externos de las guías (riesgo bajo). El README está desactualizado (fila 31) |

---

## Lo que no he podido comprobar

- El panel de EmailJS: dominios permitidos, captcha, plantilla, cuota y ubicación de servidores.
- El contenedor de GTM: qué etiquetas dispara y si cuenta GA4 dos veces.
- Las cabeceras HTTP reales de GitHub Pages y la web en producción (no la he consultado).
- Si las fotos de la galería son trabajos propios.
- Si los carnés (gases fluorados, RITE) existen y están vigentes.
- Las cifras de subvenciones de 2026 y los importes de las sanciones de las guías.
- El estado del backend del bot (no está en este repositorio).
- Los límites gratuitos actuales de Cloudflare, Supabase, Web3Forms, Formspree y reCAPTCHA (los cito de memoria; hay que mirarlos en sus webs).

---

## Propuesta de orden de trabajo (tandas pequeñas)

Cada tanda en su propia rama, con tu OK antes de subirla y desplegarla.

1. **Tanda 1 — Arreglos rápidos del formulario (S, ~1 h):**
   - `try/catch` en `localStorage` (fila 3).
   - Mensaje de error sencillo en la ventana emergente (10).
   - Enviar el CP y unificar los nombres de campo (11).
   - No bloquear a humanos sin token mientras no haya verificación (12).
   - Quitar EmailJS de las categorías (23).
2. **Tanda 2 — Datos legales (S-M, tú + un profesional):**
   - Titular, NIF, dirección y un único email (4).
   - Añadir reCAPTCHA, Clarity, Fonts y jsDelivr a privacidad y cookies (5, 6, 13, 14).
   - Línea informativa junto al formulario.
3. **Tanda 3 — reCAPTCHA solo donde hay formulario + aviso de cookies (S-M):**
   - Cargar reCAPTCHA solo en la página del formulario (5).
   - Aviso en la raíz (15).
   - Restablecer el consentimiento desde el pie de página (24).
   - Subir la meta CSP (22).
4. **Tanda 4 — Precios y garantías unificados (M):**
   - Un `precios.json` y regenerar las páginas (7, 8, 19).
   - Quitar «PENDIENTE VERIFICAR» (16).
   - Unificar la promesa de tiempo de respuesta (27).
5. **Tanda 5 — Servidor del formulario (M-L):**
   - Cloudflare Worker con verificación de reCAPTCHA + copia de cada solicitud + EmailJS desde el servidor (1, 2).
6. **Tanda 6 — Enlazado de los 23 municipios (M):**
   - El plan que ya tienes en `docs/MUNICIPIOS_PENDIENTES.md` (17).
7. **Tanda 7 — Schema y SEO menor (S):**
   - Dirección real en `LocalBusiness` (18).
   - Acortar títulos y descripciones (25).
   - Quitar las legales del sitemap (26).
8. **Tanda 8 — Imágenes (S-M):**
   - `width`/`height` en las plantillas (21).
   - Comprimir y usar `<picture>` (28).
   - Alt honestos (29).
   - Confirmar la galería (20).
9. **Tanda 9 — Contenido propio por ciudad (L, continuo):**
   - Reducir la duplicación antes de crear barrios o municipios nuevos (9, C.1).

---

## Las 3 cosas que haría primero

1. **Que no se pierda ningún cliente:** la tanda 1 ya mismo (una hora) y después el Worker gratuito, que guarda una copia de cada solicitud y verifica reCAPTCHA.
2. **Poner en regla los textos legales:** titular, NIF y dirección reales en el aviso legal, y declarar reCAPTCHA y Clarity en privacidad y cookies, con revisión de un profesional. Es lo que más riesgo legal tiene hoy.
3. **Unificar precios y garantías:** que el cliente vea el mismo «desde» y la misma garantía en todas las páginas, y quitar los «PENDIENTE VERIFICAR». Hoy son contradicciones que el cliente puede ver y reclamar.
