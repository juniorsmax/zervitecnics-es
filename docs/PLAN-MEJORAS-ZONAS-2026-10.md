# Plan de mejoras para Zervitecnics: zonas y SEO local (19/10/2026)

> Documento de traspaso para otra sesión de Claude Code. Está en una **rama aparte** (`plan-mejoras-zonas`) y no se ha publicado en la web.
> **Nada de esto está hecho todavía.** Primero analizar, después proponer y solo cambiar algo con el «sí» del titular.

## 1. Reglas del titular (obligatorias)

- Responder **siempre en español, con frases cortas**.
- **No hacer nada sin autorización:** se puede sugerir, pero no modificar, subir, publicar ni actualizar sin un «sí» explícito.
- Ir **paso a paso**, un paso cada vez.
- Enviar **capturas** (móvil y ordenador) de cada cambio visual antes de publicar.
- No inventar datos: códigos de error, reseñas, trabajos hechos, cifras. Si no hay fuente fiable, no se pone.
- No usar «oficial» ni «autorizado» con las marcas.
- Cada push a `main` **publica la web** (GitHub Pages, `zervitecnics.es`). Trabajar en una rama y publicar solo con el «sí».

## 2. Qué quiere el titular

1. **No crear más páginas**, salvo alguna puntual de **distrito o municipio** que falte. **Nada de páginas por barrio** de momento.
2. Hacer una **investigación individual de cada distrito y municipio** para que cada página tenga **contenido propio y distinto**, y Google no las vea como copias. Objetivo: que **todas las páginas de zona se indexen**.
3. Que esta sesión **analice el proyecto entero**, diga qué conviene y qué no, y proponga mejoras que encuentre aunque no estén aquí.

## 3. Estado actual de las zonas (revisado el 19/10, solo lectura)

- `aires-acondicionados/zonas/`: **15 páginas**. Badalona, Castelldefels, Cornellà, Eixample, Gràcia, L'Hospitalet, Les Corts, Nou Barris, Sabadell, Sant Andreu, Sant Cugat, Sant Martí, Sants, Sarrià y Terrassa.
- `aires-acondicionados/mantenimiento-zonas/`: **15 páginas** con las mismas zonas.
- Textos de unas **1.350–1.450 palabras**, con códigos postales. Barrios solo en algunas (Sants sí; Gràcia no los nombra).
- **Distritos de Barcelona que faltan (2):** **Ciutat Vella** y **Horta-Guinardó**.
- Auditoría previa: `zervitecnics-datos/AUDITORIA_WEB_2026-10.md` (9/10). Dice que la similitud de vocabulario es alta (68–76 % en las páginas marca×ciudad y capacidad×ciudad) y que hay 414 páginas «descubiertas sin indexar».

## 4. Mejoras propuestas para cada página de zona (sin crear páginas)

Cada zona debe tener datos **propios y comprobables**:

1. **Todos los barrios del distrito** (Barcelona tiene 10 distritos y 73 barrios oficiales). En municipios, sus barrios principales.
2. **Calles y ejes principales** (por ejemplo, Via Laietana, Urgell, Gran de Gràcia).
3. **Códigos postales** de la zona.
4. **Lugares de referencia** (mercados, hospitales, parques, estaciones).
5. **Tipo de vivienda y su efecto en la instalación de aire acondicionado.** Por ejemplo: fincas antiguas del Eixample con patios de luces, casas de Sarrià, bloques de los años 60–70 en Nou Barris, áticos y terrazas, normativa de fachadas y unidades exteriores.
6. **Normativa municipal** que afecte a las unidades exteriores, solo si hay una fuente oficial (Ajuntament).
7. **Clima o particularidades** (cerca del mar: salitre y corrosión; zonas altas, etc.).
8. **Mapa de la zona con sus códigos postales resaltados**, en SVG estático. Fuente posible: códigos postales del CNIG (licencia CC BY 4.0, citar la fuente). Sin Google Maps.
9. **«Cómo es la visita» en 5 pasos** (llamada, visita y presupuesto, instalación, prueba y garantía), adaptado a aire acondicionado.
10. **Guías relacionadas** que encajen con esa zona.
11. **Preguntas frecuentes propias de la zona**, no las mismas en todas.

⚠️ No poner reseñas, «trabajos hechos en el barrio» ni precios que no sean reales.

## 5. Posible canibalización

Hay dos páginas por zona: **instalación** (`zonas/`) y **mantenimiento** (`mantenimiento-zonas/`). Revisar que no compitan por las mismas búsquedas. Cada una debe enfocarse en su intención y enlazar a la otra.

## 6. Otras mejoras detectadas (revisar y proponer)

1. **IndexNow** (aviso a Bing, Yandex, etc. cuando cambia una página; Bing alimenta a ChatGPT y Copilot). La web **no lo tiene**. En GitHub Pages se puede hacer con un archivo de clave en la raíz y un aviso automático (por ejemplo, una GitHub Action tras cada push a `main` que envíe las URL cambiadas a `https://api.indexnow.org/indexnow`).
2. **robots.txt**: añadir los bots actuales `Claude-User`, `Claude-SearchBot`, `Bingbot` y `Applebot`. Ahora tiene nombres antiguos (`Claude-Web`, `anthropic-ai`).
3. **Formulario**: la auditoría del 9/10 dice que siguen pendientes de cambiar las claves antiguas de EmailJS y reCAPTCHA. Valorar Cloudflare Turnstile.
4. Resto de puntos abiertos de `AUDITORIA_WEB_2026-10.md`: portada fina, títulos largos, enlaces internos débiles, imágenes pesadas y `subvenciones.html` con rutas rotas.

## 7. Fuera de la web (lo hace el titular, con guía paso a paso)

- **Bing Places**, **Apple Business** y directorios: Cylex, Hotfrog, Infobel, QDQ, Páginas Amarillas, Habitissimo y Cronoshare.
- Con los **datos propios de Zervitecnics** (teléfono 625 215 983, su correo y sus textos). **Nunca** mezclar con los del otro negocio del titular, para que Google no los vea como un negocio duplicado.
- Preparar una hoja de datos (nombre, teléfono, web, correo, horario, categoría y descripciones corta y larga) para copiar y pegar.
- **Microsoft Advertising**: valorar más adelante.

## 8. Cómo trabajar

1. Leer el proyecto y la auditoría. Dar al titular un **resumen corto** de lo que conviene y de lo que no.
2. Proponer un **plan por fases**. El titular aprueba cada fase.
3. Empezar con **una sola zona de ejemplo** (por ejemplo, Gràcia), mostrar capturas y esperar el «sí» antes de seguir con las demás.
4. Citar las fuentes de la investigación de cada zona.
