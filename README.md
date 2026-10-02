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

## Configuración necesaria antes del despliegue

### 1. EmailJS (formulario de presupuesto)

1. Crear cuenta en [emailjs.com](https://www.emailjs.com)
2. Crear un servicio de email (Gmail, SMTP, etc.)
3. Crear una plantilla con las variables: `{{nombre}}`, `{{telefono}}`, `{{zona}}`, `{{tipo}}`, `{{obs}}`
4. En `aires-acondicionados/js/shared.js`, buscar y reemplazar:
   - `TU_PUBLIC_KEY` → tu Public Key de EmailJS
   - `TU_SERVICE_ID` → tu Service ID
   - `TU_TEMPLATE_ID` → tu Template ID

### 2. Google Tag Manager / Analytics

El GTM ya está integrado con el ID `GTM-TF473QQQ`. Para usar tu propio:
1. En `index.html`, reemplaza `GTM-TF473QQQ` por tu ID de GTM
2. Configura en GTM: GA4, eventos de conversión (llamadas, WhatsApp, formulario)

### 3. Teléfono y datos de contacto

Busca y reemplaza en todos los archivos:
- `625 215 983` → tu número real
- `+34625215983` → tu número en formato internacional
- `info@zervitecnics.es` → tu email real
- `zervitecnics.es` → tu dominio real

### 4. Imágenes

Las imágenes en `aires-acondicionados/img/` son generadas con IA. Puedes reemplazarlas por fotos reales de tus instalaciones manteniendo los mismos nombres de archivo.

## Despliegue

### Opción A: Hosting estático (recomendado)
- **Netlify**: Arrastra la carpeta a [app.netlify.com](https://app.netlify.com)
- **Vercel**: `vercel --prod` desde la carpeta del proyecto
- **GitHub Pages**: Sube a un repositorio y activa Pages

### Opción B: Hosting tradicional (FTP)
- Sube todos los archivos al directorio raíz de tu hosting
- Asegúrate de que el servidor sirve `index.html` como página principal

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
- **j) No prometer reparaciones ni derivación al SAT oficial.** La web habla
  exclusivamente de instalación y mantenimiento. Las keywords de avería,
  recarga de gas o servicio técnico correctivo quedan fuera del mapa.

## Soporte técnico

Para cualquier modificación o soporte, contacta con el desarrollador.
