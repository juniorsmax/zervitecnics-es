# Auditoría de la web — 9 de octubre de 2026

> Estado: **recuento de hallazgos**. Nada de lo marcado como "decisión pendiente" se ha tocado.
> Base: 680 páginas HTML (673 indexables, 7 `noindex`), repositorio en `main` tras los cambios del 9-oct.
> Datos de Google: 28 días hasta 6-oct → 177 impresiones, 5 clics, posición media 17,9; GA4: 11 sesiones, 0 envíos de formulario.
> Muestra muy pequeña: sirve para pistas, no para conclusiones. Releer con 28+ días tras los cambios.

---

## 1. Lo que está bien (no tocar)

- Títulos y descripciones **sin duplicados** en las 673 páginas indexables.
- Todas tienen canonical, schema (LocalBusiness/Service/FAQPage/BreadcrumbList) y una sola H1.
- Contenido por tipo (palabras): marca×ciudad 770–1.440; capacidad×ciudad ≈1.150; zonas 600–850; guías ≈1.570; mantenimiento ≈900–1.000.
- `robots.txt` abierto a buscadores y bots de IA; `llms.txt`, `sitemap.xml` y `sitemap-guias.xml` presentes.
- Reseñas: **son reales** (en la ficha de Google). Lo pendiente es solo mostrarlas en la web (ver 3.8).

---

## 2. Palabras clave: qué falta

### 2.1 "Aire acondicionado Barcelona" en la portada
- El hub `/aires-acondicionados/` **sí** lo tiene (título "Instalación Aire Acondicionado Barcelona y Alrededores"; Google ya lo muestra en pos. 8,3 para "aires acondicionados barcelona").
- La **portada `/`** no: título "Zervitecnics Barcelona — Aire acondicionado, diseño web y reformas", H1 "Soluciones técnicas y digitales para tu hogar y negocio", solo 69 palabras. Ver decisión D1.

### 2.2 Frases de intención que casi no existen en la web (673 páginas)
| Frase | Páginas que la contienen |
|---|---|
| "instalación de aire acondicionado" | 622 |
| "cuánto cuesta" | 198 |
| "empresa instaladora" | 1 |
| "mejores instaladores" / "mejor instalador" | 0 |
| "instalador(es) de aire acondicionado" | 0 |
| "opiniones" / "reseñas" | 1 |

Quien busca "mejores instaladores…", "empresa instaladora…" o "instalador de aire acondicionado en X" hoy no encuentra una página que use esas palabras.

### 2.3 Títulos y descripciones
- Marca×ciudad y capacidad×ciudad: título "Aire acondicionado Daikin en Sabadell | Zervitecnics" → falta **"instalación"** (y "precio") que es lo que la gente teclea.
- 231 títulos superan 65 caracteres (se cortan en Google); 64 descripciones fuera de 70–160.

### 2.4 Huecos de página (con datos reales de Search Console)
- Cassette × ciudad (impresión real: "aire acondicionado por cassettes en sabadell", pos. 7,7).
- Conductos × ciudad (Sabadell, Badalona, Mataró, L'Hospitalet…); "conductos precio barcelona" está en pos. 63–70.
- Reformas con instalación de aire acondicionado (Badalona, Sabadell, L'Hospitalet; pos. 11–19).
- Municipios sin página: Cabrera de Mar, Montgat, Tiana, Teià, Sant Vicenç de Montalt.
- Capacidades sin página: 3000, 3500, 5000, 7000, 9000.

---

## 3. Otros hallazgos

1. **Enlaces internos débiles**: 322 de 673 páginas indexables reciben 1 enlace o ninguno (casi todas marca×ciudad y capacidad×ciudad de municipios pequeños). Coincide con 414 páginas "descubiertas sin indexar" en Search Console (informe hasta 4-oct).
2. **Contenido muy plantilla**: similitud de vocabulario media 68 % (marca×ciudad) y 76 % (capacidad×ciudad). Ya decidido: reescribir con datos reales por ciudad (barrios, ordenanzas) y eliminar las que no se puedan respaldar.
3. **Portada fina**: 69 palabras; promete diseño web y reformas que aún no tienen página.
4. **reCAPTCHA** se sigue cargando en 36 páginas; clave pública antigua de EmailJS + SDK en 672 (pendiente rotar claves).
5. **Imágenes pesadas** en guías (hasta 360 KB; la mayor `guia-normativa-eixample.jpg`).
6. **Sin hreflang / idiomas**: no hay catalán ni inglés.
7. **Bug conocido**: `subvenciones.html` con rutas rotas (`../css/`, `../js/`, `../img/`).
8. **Reseñas en la web**: `/opiniones/` existe pero es `noindex` y solo tiene botón a la reseña de Google; las reseñas reales aún no se muestran en la web.
9. **Sin fotos reales de trabajos** (galería actual retocada con IA; sección «Trabajos realizados» pendiente).
10. **Poca señal de datos**: esperar 2–3 semanas tras los cambios del 9-oct antes de crear más páginas.

---

## 4. Catálogo de intenciones de búsqueda (sin volúmenes: hipótesis)

Plantillas que deben cubrirse, por ciudad/zona `{X}` (Barcelona, barrios, 40 municipios):

| Intención | Frases tipo | Página que debería captarla | Estado |
|---|---|---|---|
| Mejores / ranking | "mejores instaladores de aire acondicionado en {X}", "los 3 mejores instaladores en {X}" | Portada del hub + zonas (sección con criterios, reseñas reales, garantía) | **Falta** |
| Empresa | "empresa instaladora de aire acondicionado en {X}", "instalador de aire acondicionado {X}" | Zonas y municipios (H1/H2 con "empresa instaladora") | **Falta** |
| Instalación directa | "instalación de aire acondicionado en {X}" | Zonas, marca×ciudad, capacidad×ciudad | Cubierta (falta en títulos de marca/capacidad) |
| Precio | "precio instalación aire acondicionado {X}", "cuánto cuesta instalar aire acondicionado" | Precios, ofertas, zonas | Parcial |
| Presupuesto / urgencia | "presupuesto instalación aire acondicionado {X}" | Zonas, formulario | Parcial |
| Tipo de equipo | "aire acondicionado por conductos {X}", "cassette {X}", "split", "multisplit", "suelo-techo" | `categorias/*` + categoría×ciudad | **Hueco** (solo Barcelona) |
| Marca | "instalación Daikin {X}", "Daikin 4500 frigorías" | Marca×ciudad, marca×capacidad | Cubierta |
| Capacidad | "aire acondicionado 3000 frigorías" | Capacidad×ciudad | Faltan 3000/3500/5000/7000/9000 |
| Mantenimiento | "mantenimiento aire acondicionado {X}" | mantenimiento-zonas / -marcas | Cubierta |
| Subvenciones / normativa | "subvenciones aire acondicionado Cataluña", "normativa aire acondicionado Eixample" | Guías, subvenciones | Cubierta (reparar subvenciones.html) |
| Reformas + A/C | "reforma con instalación de aire acondicionado {X}" | Página nueva | **Hueco** |

Siguiente paso para volumen real: Planificador de palabras clave de Google Ads (solo consulta, sin pagar) y repetir con 28+ días de Search Console.

---

## 5. Decisiones pendientes (quién decide: Filiberto)

- **D1 – Portada multi-servicio vs. posicionamiento de aire acondicionado.** Opciones y riesgos expuestos en el chat del 9-oct; sin decisión todavía.
- **D2 – Orden de trabajo** (propuesto, no aprobado): ① títulos/H1 con "instalación"/"empresa instaladora"/"mejores" en hub y zonas; ② reescritura de portada según D1; ③ mostrar reseñas reales en `/opiniones/`; ④ cassette/conductos × ciudad y reformas+A/C tras 2–3 semanas de datos; ⑤ municipios y capacidades que faltan.

## 6. Pendientes ya conocidos (no son de esta auditoría)
Rotar claves de EmailJS y quitar reCAPTCHA; indexación manual de 7 guías y 25 mantenimiento (~10/día); borrar rama `resenas-opiniones`; GA4 `form_submit` como conversión; foto real de trabajo; páginas de reformas/electricidad/diseño web; catalán/inglés; nivel 3 formulario→bot; opción 3 de lectura de datos de Google en directo.
