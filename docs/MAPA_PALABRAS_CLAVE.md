# Mapa de palabras clave — Zervitecnics

> **Aviso**: este mapa es una hipótesis construida a partir de la estructura real
> del sitio (sitemap + carpetas), **no hay datos de volumen de búsqueda ni de
> Search Console todavía**. Debe validarse con Search Console cuando haya al
> menos 60 días de datos (impresiones, clics, posición media y consulta real
> por URL). Hasta entonces, trátese como asignación de intención y no como
> prioridad definitiva.
>
> Convenciones:
> - **Intención**: *informativa* (aprender), *comparación* (decidir entre opciones),
>   *transaccional* (listo para contratar / pedir presupuesto), *local*
>   (incluye topónimo y espera resultado cercano).
> - *Keyword principal* = la que debe decidir title + H1 + URL.
> - *Secundarias* = variantes que la misma página debe cubrir dentro del body,
>   subtítulos o FAQ.
> - Ninguna página legal debe posicionar: no se incluyen en el mapa.

---

## 0. Datos reales de Search Console (muestra: 7 días hasta 9-oct-2026)

Muestra muy pequeña (177 impresiones, 5 clics): sirve para detectar pistas, no para decidir.

| Consulta real | Impr. | Pos. | Página que debería captarla | Estado |
|---|---|---|---|---|
| aires acondicionados barcelona | 8 | 8,3 | Hub `/aires-acondicionados/` | Bien posicionada, sin clics aún |
| aire acondicionado por cassettes en sabadell | 6 | 7,7 | (no existe cassette × ciudad) | **Hueco**: crear cassette × ciudad |
| conductos precio barcelona (3 variantes) | 15 | 63–70 | `categorias/conductos.html` | Título y descripción reforzados con "precio desde 2.397 €" (9-oct) |
| reformas de pisos con instalación de aire acondicionado en badalona / sabadell / l'hospitalet | 6 | 11–19 | (no existe) | **Hueco**: página de reformas con aire acondicionado incluido |
| instalacion aire acondicionado sarria sant gervasi | 2 | 6,5 | `zonas/sarria.html` | Falta mencionar "Sant Gervasi" |
| panasonic barcelona / daikin 4500 frigorías | 3 | 14–40 | marca-barcelona / marca-capacidad | Títulos reforzados (9-oct) |
| servicio técnico hisense badalona | 1 | 6 | — | Es reparación: NO se cubre (ver C.1) |
| informe técnico solar, reparación y conservación de viviendas | 4 | 60–99 | — | Descartadas, no encajan con el negocio |

Páginas con impresiones y 0 clics (títulos y descripciones mejorados el 9-oct): panasonic-barcelona (46), daikin-4500-frigorias (41), hisense-badalona (37), conductos (36), zonas/gracia (34).

Cambios de enlazado interno hechos el 9-oct: sección "Guías útiles" en la portada y enlaces "Guías" y "Mantenimiento" en el pie de todas las páginas.

Pendiente: volumen de búsqueda real (Planificador de palabras clave de Google Ads, solo consulta) y repetir esta tabla con 28+ días de datos.

---

## 1. Portada del dominio — `/index.html`

| Campo | Valor |
|---|---|
| Keyword principal | `zervitecnics barcelona` (marca) |
| Secundarias | `zervitecnics`, `aire acondicionado diseño web reformas barcelona` |
| Intención | Navegacional + informativa (multi-servicio) |
| Posiciona para | Búsquedas de marca y aterrizaje genérico del dominio. No debe pelear por "aire acondicionado barcelona" — para eso está el hub. |

## 2. Hub del vertical — `/aires-acondicionados/index.html`

| Campo | Valor |
|---|---|
| Keyword principal | `instalación aire acondicionado barcelona` |
| Secundarias | `aire acondicionado barcelona`, `instalador aire acondicionado barcelona`, `empresa aire acondicionado barcelona` |
| Intención | Transaccional + local |
| Posiciona para | La keyword cabecera del vertical. Es el ancla de interlinking de todo el silo. |

## 3. Precios — `/aires-acondicionados/precios.html`

| Campo | Valor |
|---|---|
| Keyword principal | `precio instalación aire acondicionado barcelona 2026` |
| Secundarias | `cuánto cuesta instalar aire acondicionado barcelona`, `precio split instalación barcelona`, `tarifa aire acondicionado barcelona + IVA` |
| Intención | Comparación (pre-conversión, el usuario busca cifra antes de pedir presupuesto) |
| Posiciona para | Búsquedas con "precio", "cuánto cuesta", "tarifa". No ofertas con descuento (eso va a /ofertas.html). |

## 4. Ofertas — `/aires-acondicionados/ofertas.html`

| Campo | Valor |
|---|---|
| Keyword principal | `ofertas aire acondicionado barcelona todo incluido` |
| Secundarias | `aire acondicionado instalación incluida barcelona`, `oferta split 2x1 barcelona`, `pack aire acondicionado barcelona` |
| Intención | Transaccional (listo para comprar un pack cerrado) |
| Posiciona para | Usuarios en fase decisión con sensibilidad al precio y a plazo. Debe tener fecha de vigencia visible para no canibalizar /precios.html. |

## 5. Subvenciones — `/aires-acondicionados/subvenciones.html`

| Campo | Valor |
|---|---|
| Keyword principal | `subvenciones aire acondicionado barcelona 2026` |
| Secundarias | `ayudas aire acondicionado cataluña`, `plan renove aire acondicionado barcelona`, `subvención ICAEN aire acondicionado` |
| Intención | Transaccional (gestión del trámite) |
| Posiciona para | Usuarios que buscan "ayuda económica + instalación". Debe diferenciarse explícitamente de la guía homónima (ver §13). |

## 6. Mantenimiento (hub) — `/aires-acondicionados/mantenimiento.html`

| Campo | Valor |
|---|---|
| Keyword principal | `mantenimiento aire acondicionado barcelona` |
| Secundarias | `limpieza aire acondicionado barcelona`, `revisión aire acondicionado barcelona`, `contrato mantenimiento aire acondicionado barcelona` |
| Intención | Transaccional + local (servicio recurrente) |
| Posiciona para | Contratación de mantenimiento preventivo/correctivo. Es el padre de /mantenimiento-zonas/ y /mantenimiento-marcas/. |

## 7. Instalación personalizada — `/aires-acondicionados/instalacion-personalizada.html`

| Campo | Valor |
|---|---|
| Keyword principal | `presupuesto instalación aire acondicionado barcelona` |
| Secundarias | `visita técnica aire acondicionado`, `instalación personalizada aire acondicionado`, `estudio técnico aire acondicionado barcelona` |
| Intención | Transaccional (lead) |
| Posiciona para | Usuarios con instalación no estándar. Captura "visita técnica" y "presupuesto a medida". |

## 8. Categorías de equipo — `/aires-acondicionados/categorias/*.html`

| Página | Keyword principal | Secundarias | Intención |
|---|---|---|---|
| `split.html` | `instalación split 1x1 barcelona` | `aire acondicionado 1x1 barcelona`, `split barato barcelona` | Transaccional |
| `multisplit.html` | `instalación multisplit barcelona` | `aire acondicionado 2x1 3x1 barcelona`, `multisplit todo incluido barcelona` | Transaccional |
| `conductos.html` | `aire acondicionado por conductos barcelona` | `conductos vivienda barcelona`, `instalación conductos barcelona` | Transaccional |
| `cassette.html` | `instalación aire cassette barcelona` | `cassette 4 vías barcelona`, `aire cassette oficina barcelona` | Transaccional (B2B/comercial) |
| `suelo-techo.html` | `aire acondicionado suelo-techo barcelona` | `suelo techo local comercial barcelona` | Transaccional (B2B/comercial) |
| `dicore.html` | `instalación aire acondicionado dicore barcelona` | `dicore aire acondicionado barcelona` | Transaccional (marca específica) |
| `marca-blanca.html` | `aire acondicionado marca blanca barcelona` | `aire acondicionado barato barcelona`, `aire acondicionado económico barcelona` | Transaccional (sensibilidad precio) |

## 9. Marcas raíz — `/aires-acondicionados/marcas/{marca}.html` (10 páginas)

| Campo | Valor |
|---|---|
| Keyword principal | `instalación {marca} barcelona` (p. ej. `instalación daikin barcelona`) |
| Secundarias | `{marca} aire acondicionado barcelona`, `distribuidor {marca} barcelona`, `técnico {marca} barcelona` |
| Intención | Transaccional (usuario con marca ya decidida, busca técnico local) |
| Posiciona para | Búsqueda "marca + barcelona". ⚠ Canibaliza con `{marca}-barcelona.html` — ver §A.2. |

## 10. Marca × ciudad — `/aires-acondicionados/marcas/{marca}-{ciudad}.html` (400 páginas, 10×40)

| Campo | Valor |
|---|---|
| Keyword principal | `aire acondicionado {marca} {ciudad}` (p. ej. `aire acondicionado daikin mataró`) |
| Secundarias | `instalación {marca} {ciudad}`, `técnico {marca} {ciudad}`, `servicio técnico {marca} {ciudad}` |
| Intención | Transaccional + local |
| Posiciona para | Búsqueda larga marca+municipio del área metropolitana. Es la red de captura long-tail. |

## 11. Marca × capacidad — `/aires-acondicionados/marcas/{marca}-{capacidad}-frigorias.html` (40 páginas, 10×4)

| Campo | Valor |
|---|---|
| Keyword principal | `{marca} {capacidad} frigorías` (p. ej. `daikin 2500 frigorías`) |
| Secundarias | `{marca} {capacidad} frigorías precio`, `{marca} {capacidad} frigorías instalación`, `{marca} 1×1 {capacidad}` |
| Intención | Comparación → transaccional (usuario con marca y tamaño ya elegidos) |
| Posiciona para | Búsqueda de modelo específico. Debe mostrar la ficha técnica real (consumo, SEER/SCOP, dB, código) para no ser plantilla pura. |

## 12. Capacidad × ciudad — `/aires-acondicionados/capacidades/{capacidad}-frigorias-{ciudad}.html` (160 páginas, 4×40)

| Campo | Valor |
|---|---|
| Keyword principal | `aire acondicionado {capacidad} frigorías {ciudad}` |
| Secundarias | `aire acondicionado {kw} kw {ciudad}`, `{capacidad} frigorías habitación {m²}` |
| Intención | Comparación/transaccional + local |
| Posiciona para | Usuario que sabe el tamaño pero no la marca. Complementa §10 (marca+ciudad). |

## 13. Zonas de instalación — `/aires-acondicionados/zonas/{zona}.html` (15 páginas)

Zonas publicadas: Eixample, Gràcia, Sants, Sarrià, Les Corts, Sant Andreu, Sant Martí, Nou Barris, Badalona, Hospitalet, Castelldefels, Cornellà, Sabadell, Terrassa, Sant Cugat.

| Campo | Valor |
|---|---|
| Keyword principal | `instalación aire acondicionado {zona}` |
| Secundarias | `aire acondicionado {zona}`, `instalador aire acondicionado {zona}` |
| Intención | Transaccional + local |
| Posiciona para | Búsqueda por distrito/municipio sin marca ni capacidad. |

## 14. Mantenimiento × zona — `/aires-acondicionados/mantenimiento-zonas/{zona}.html` (15 páginas)

| Campo | Valor |
|---|---|
| Keyword principal | `mantenimiento aire acondicionado {zona}` |
| Secundarias | `limpieza aire acondicionado {zona}`, `revisión aire acondicionado {zona}` |
| Intención | Transaccional + local (recurring service) |
| Posiciona para | Usuario con equipo ya instalado que busca revisión por zona. |

## 15. Mantenimiento × marca — `/aires-acondicionados/mantenimiento-marcas/{marca}.html` (10 páginas)

| Campo | Valor |
|---|---|
| Keyword principal | `mantenimiento {marca} barcelona` |
| Secundarias | `revisión {marca} barcelona`, `limpieza {marca} barcelona`, `contrato mantenimiento {marca} barcelona` |
| Intención | Transaccional |
| Posiciona para | Usuario con marca concreta buscando mantenimiento recurrente (no instalación nueva, no reparación de averías). |

## 16. Guías editoriales — `/aires-acondicionados/guias/`

| Página | Keyword principal | Secundarias | Intención |
|---|---|---|---|
| `index.html` | `guías aire acondicionado` | `blog aire acondicionado barcelona` | Informativa (hub) |
| `que-frigorias-necesito.html` | `qué frigorías necesito aire acondicionado` | `calculadora frigorías aire habitación`, `frigorías por m² aire acondicionado` | Informativa |
| `split-vs-multisplit-vs-conductos.html` | `split vs multisplit vs conductos` | `diferencia split multisplit`, `qué sistema aire acondicionado elegir` | Comparación |
| `consumo-real-aire-acondicionado.html` | `consumo aire acondicionado kwh mes` | `cuánto gasta aire acondicionado barcelona`, `coste aire acondicionado mensual` | Informativa |
| `gas-r32-vs-r410a.html` | `gas r32 vs r410a aire acondicionado` | `diferencia r32 r410a`, `aire acondicionado r32 eficiencia` | Comparación |
| `ubicacion-unidad-exterior.html` | `dónde colocar unidad exterior aire acondicionado` | `instalación unidad exterior aire acondicionado normativa` | Informativa |
| `normativa-comunidad-vecinos-barcelona.html` | `aire acondicionado comunidad vecinos barcelona normativa` | `permiso comunidad vecinos aire acondicionado barcelona` | Informativa + local |
| `mantenimiento-yo-mismo-o-profesional.html` | `cómo hacer mantenimiento aire acondicionado uno mismo` | `limpiar aire acondicionado casa` | Informativa |
| `subvenciones-como-solicitarlas.html` | `cómo solicitar subvenciones aire acondicionado 2026` | `tramitar ayudas aire acondicionado cataluña` | Informativa |

## 17. Legal — `/aires-acondicionados/legal/`

`aviso-legal.html`, `cookies.html`, `privacidad.html` → no posicionan. Marcar `noindex` opcional si no se requiere para auditorías externas. **No deben aparecer en el interlinking SEO**, sólo en el footer.

---

## A. Canibalizaciones detectadas (hipótesis — validar con Search Console)

### A.1. Hub subvenciones ↔ guía subvenciones
- Páginas en conflicto: `/aires-acondicionados/subvenciones.html` y `/aires-acondicionados/guias/subvenciones-como-solicitarlas.html`.
- Ambas podrían competir por `subvenciones aire acondicionado barcelona 2026`.
- **Corrección propuesta**: la hub se reorienta a landing *transaccional* ("Zervitecnics te gestiona la subvención, entrega llave en mano"). La guía queda como contenido informativo puro ("cómo tramitarlas tú mismo paso a paso"). Añadir enlace cruzado explícito con anchor-text diferenciado ("Prefieres que te lo gestionemos → hub") y recortar la parte informativa de la hub a 2-3 párrafos.

### A.2. Marca raíz ↔ marca-Barcelona
- Páginas en conflicto: `/aires-acondicionados/marcas/{marca}.html` y `/aires-acondicionados/marcas/{marca}-barcelona.html` (10 pares).
- Ambas tienen "{marca} Barcelona" en title/H1 → compiten por la misma keyword.
- **La decisión definitiva se toma con datos de Search Console**: qué URL recibe más impresiones y clics por la consulta `{marca} barcelona` tras 60 días. Hasta entonces, posibles correcciones a nivel HTML (GitHub Pages no permite redirects 301 de servidor; descartado):
  - **Opción canonical**: declarar `<link rel="canonical">` desde `{marca}-barcelona.html` hacia `{marca}.html` (o al revés, según qué ganadora elijamos con los datos). La página perdedora sigue existiendo pero cede autoridad.
  - **Opción noindex**: añadir `<meta name="robots" content="noindex,follow">` a la perdedora. Se desindexa manteniendo el interlinking interno.
  - **Opción diferenciación**: mantener ambas pero reorientar la raíz `{marca}.html` a "gama + por qué elegir {marca}" sin topónimo "Barcelona" en title/H1, y dejar `{marca}-barcelona.html` como variante estrictamente local. Sólo viable si hay contenido local sustancial exclusivo de la variante-Barcelona.

### A.3. Precios ↔ Ofertas
- Páginas en conflicto: `/aires-acondicionados/precios.html` y `/aires-acondicionados/ofertas.html`.
- Ambas pueden pelear por `aire acondicionado barcelona precio todo incluido`.
- **Corrección propuesta**: `precios.html` = tabla completa de precios de referencia + IVA, sin descuento. `ofertas.html` = packs con descuento vigente y plazo expreso de la oferta. Marcar explícitamente en title de ofertas la vigencia ("Ofertas vigentes [mes/año]"). Enlace de precios a ofertas con anchor "Descuentos activos este mes".

### A.4. Categoría multisplit ↔ guía comparativa
- Páginas en conflicto: `/aires-acondicionados/categorias/multisplit.html` y `/aires-acondicionados/guias/split-vs-multisplit-vs-conductos.html`.
- Para "multisplit vs split" la guía debe ganar; para "instalar multisplit barcelona" la categoría debe ganar.
- **Corrección propuesta**: enlace cruzado explícito. En la categoría, link anchor "¿Dudas entre split y multisplit? → guía comparativa". En la guía, CTA "Decidido? → instalación multisplit".

### A.5. Zonas ↔ marca-ciudad coincidentes
- Posible conflicto: `/aires-acondicionados/zonas/badalona.html` y `/aires-acondicionados/marcas/{cualquier-marca}-badalona.html` cuando el usuario busca sólo "aire acondicionado badalona".
- No es canibalización pura (ejes distintos: zona-genérica vs marca+zona), pero si las 10 marca-ciudad usan copy casi idéntico, Google puede fusionarlas y mezclar con la zona pura.
- **Corrección propuesta**: zona-pura prioriza el genérico sin marca; marca-ciudad incluye SIEMPRE la marca en title/H1/URL/body. Verificar que ninguna marca-ciudad posiciona por el genérico sin marca.

---

## B. Grupos casi duplicados (requieren diferenciación de contenido)

### B.1. Las 400 páginas de marca-ciudad
Las 400 combinaciones `{marca}-{ciudad}.html` arrancan del mismo generador (`tools/generate-geo-pages.js`). Riesgo real de "doorway pages" si el único cambio es el topónimo.

Diferenciación mínima requerida para cada página:
- Barrio o parte de la ciudad representativa (casco antiguo, zona nueva, polígono).
- Hora típica de desplazamiento desde Barcelona centro y vehículo.
- Edificaciones típicas (bloques años 70, chalets unifamiliares, locales…) y qué sistema recomendamos para cada una.
- Normativa de fachadas o comunidades si la ciudad tiene algo propio.
- Ejemplos reales de intervenciones (sin inventar reseñas ni cifras).

### B.2. Las 160 páginas de capacidad-ciudad
Mismo generador. Diferenciación mínima:
- m² habitables típicos de esa ciudad para esa capacidad (altura de techos, orientación mediterránea, aislamiento).
- Qué equipo concreto recomendamos para esa combinación.
- Relación €/frigoría de referencia (ligada a /precios.html, nunca inventada).

### B.3. Las 40 páginas de marca-capacidad
Deben llevar **ficha técnica real del equipo**: código fabricante, SEER, SCOP, nivel sonoro, consumo nominal, gas, dimensiones. Si no se pueden conseguir estos datos, la página no debería existir.

### B.4. Las 10 marcas raíz entre sí
Si el único diferencial es el color del título, canibalizan la categoría "instalación aire acondicionado barcelona" entre sí sin aportar valor marca-por-marca. Diferenciar con: gama real que ofrecemos de esa marca, países de fabricación, garantía oficial, puntos técnicos propios, errores típicos de instalación de esa marca.

### B.5. /zonas/{zona}.html ↔ /mantenimiento-zonas/{zona}.html
Comparten topónimo y mucho boilerplate. Para que no se fundan en el índice:
- `/zonas/` habla **sólo de instalación nueva** (presupuesto, modelos recomendados, plazos).
- `/mantenimiento-zonas/` habla **sólo de servicio recurrente** (preventivo trimestral/anual, filtros, limpieza de serpentín, precio del contrato). Nunca repetir el bloque de instalación.

---

## C. Huecos de intención sin página

### C.1. Reparación / avería (correctivo)
**NO se crea.** El propietario decidió no cubrir reparaciones en la web. Zervitecnics se posiciona exclusivamente como instalación + mantenimiento preventivo. Cualquier keyword de avería (`aire acondicionado no enfría`, `aire acondicionado no arranca`, `reparación aire acondicionado barcelona`, etc.) queda fuera del mapa y no debe atacarse desde ninguna página existente.

### C.2. Recarga de gas
**NO se crea.** Misma razón que C.1: el propietario decidió no cubrir reparaciones. `recarga gas aire acondicionado`, `aire acondicionado pierde gas` y similares no se cubren.

### C.3. Verticales B2B
- Keywords sin landing: `aire acondicionado oficina barcelona`, `aire acondicionado local comercial barcelona`, `aire acondicionado restaurante barcelona`.
- Hoy sólo tocado tangencialmente por categorías cassette/suelo-techo.

### C.4. Comparativa de marcas
- Keyword sin landing: `mejor marca aire acondicionado 2026`, `comparativa daikin mitsubishi fujitsu`.
- Sugerencia: guía comparativa en `/guias/`.

### C.5. Portátiles e informacionales de descarte
- Keyword sin landing: `aire acondicionado portátil vs split`.
- Sugerencia: guía que posicione para la búsqueda y explique por qué no instalamos portátiles.

### C.6. Capacidades no cubiertas
- Existen páginas para 2000, 2500, 4500, 6000 frigorías. **Faltan**: 3000, 3500, 5000, 7000, 9000 frigorías.
- Riesgo: usuarios que buscan "aire 3500 frigorías" no encuentran landing propia y caen en una capacidad-ciudad arbitraria.

### C.7. Capacidad sin ciudad (eje puro)
- No existe `/aires-acondicionados/capacidades/{capacidad}-frigorias.html` genérica. Quien busca "aire 2500 frigorías" sin ciudad no tiene landing adecuada.

### C.8. Hubs intermedios ausentes
- No hay `/aires-acondicionados/categorias/index.html` para "tipos de aire acondicionado barcelona".
- No hay `/aires-acondicionados/marcas/index.html` para "mejores marcas aire acondicionado barcelona".
- No hay `/aires-acondicionados/capacidades/index.html`.

### C.9. Zonas de Barcelona ciudad sin página
- Las 15 zonas publicadas dejan fuera: Horta-Guinardó, Sant-Gervasi, Poble-Nou, Ciutat Vella, Sant-Pere/Santa Caterina, Camp de l'Arpa.
- Y ciudades que sí tienen marca-ciudad (40 municipios) pero no están en `/zonas/`: p. ej. Mataró, Granollers, Rubí, Sant Boi, Vilanova, Sitges, Gavà. Hueco local evidente.

### C.10. Instalación urgente
- Keyword sin landing: `instalación aire acondicionado urgente barcelona`, `instalación aire acondicionado 48 horas`.
- **Solo si se atiende fuera del horario publicado.** Si Zervitecnics no cubre instalación en 24-48h fuera de horario, esta página no debe crearse (sería promesa incumplible).

### C.11. Features de equipo
- Keywords sin landing: `aire acondicionado silencioso barcelona`, `aire acondicionado wifi inverter`, `aire acondicionado bomba de calor barcelona`.

---

**Próximo paso recomendado**: tras 60 días de Search Console, cruzar este mapa con "Consulta vs URL de aterrizaje real" y detectar: (a) consultas que la página planeada no está capturando, (b) URLs recibiendo tráfico por consultas no previstas (indicio de canibalización real) y (c) páginas con 0 impresiones en 60 días (candidatas a fusión o noindex).
