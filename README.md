# Zervitecnics Barcelona — Ecosistema Web A1

## Estructura del proyecto

```
aires-zervitecnics/
├── index.html                  # Página principal
├── sitemap.xml                 # Sitemap SEO
├── robots.txt                  # Directivas para buscadores
├── css/
│   ├── shared.css              # Estilos compartidos (variables, header, footer, componentes)
│   └── pages.css               # Estilos específicos de subpáginas
├── js/
│   ├── shared.js               # Lógica compartida (nav, cookies, formulario, carrusel, FAQ)
│   └── pages.js                # Lógica de subpáginas (precios dinámicos, schema Service)
├── img/
│   ├── logo_zervitecnics.png   # Logo
│   ├── hero_main.jpg           # Imagen hero principal
│   ├── hero_split.jpg          # Imagen split
│   ├── hero_technician.jpg     # Imagen técnico
│   ├── multisplit_service.jpg  # Imagen multisplit
│   ├── conductos_service.jpg   # Imagen conductos
│   └── barcelona_aerial.jpg    # Imagen aérea Barcelona
└── pages/
    ├── split.html              # Instalación Split 1×1
    ├── multisplit.html         # Instalación Multisplit
    ├── conductos.html          # Aire por Conductos
    ├── subvenciones.html       # Subvenciones 2026
    ├── precios.html            # Tabla de precios completa
    ├── daikin.html             # Marca Daikin
    ├── mitsubishi.html         # Marca Mitsubishi Electric
    ├── fujitsu.html            # Marca Fujitsu
    ├── lg.html                 # Marca LG
    ├── samsung.html            # Marca Samsung
    ├── hisense.html            # Marca Hisense
    ├── eixample.html           # Zona SEO: L'Eixample
    ├── gracia.html             # Zona SEO: Gràcia
    ├── hospitalet.html         # Zona SEO: L'Hospitalet
    ├── badalona.html           # Zona SEO: Badalona
    ├── sant-cugat.html         # Zona SEO: Sant Cugat
    ├── cornella.html           # Zona SEO: Cornellà
    ├── terrassa.html           # Zona SEO: Terrassa
    ├── sabadell.html           # Zona SEO: Sabadell
    ├── privacidad.html         # Política de Privacidad (RGPD)
    ├── cookies.html            # Política de Cookies
    └── aviso-legal.html        # Aviso Legal (LSSI)
```

## Configuración necesaria antes del despliegue

### 1. EmailJS (formulario de presupuesto)

1. Crear cuenta en [emailjs.com](https://www.emailjs.com)
2. Crear un servicio de email (Gmail, SMTP, etc.)
3. Crear una plantilla con las variables: `{{nombre}}`, `{{telefono}}`, `{{zona}}`, `{{tipo}}`, `{{obs}}`
4. En `js/shared.js`, buscar y reemplazar:
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
- `info@zervitecnics.com` → tu email real
- `www.zervitecnics.com` → tu dominio real

### 4. Imágenes

Las imágenes en `/img/` son generadas con IA. Puedes reemplazarlas por fotos reales de tus instalaciones manteniendo los mismos nombres de archivo.

## Despliegue

### Opción A: Hosting estático (recomendado)
- **Netlify**: Arrastra la carpeta a [app.netlify.com](https://app.netlify.com)
- **Vercel**: `vercel --prod` desde la carpeta del proyecto
- **GitHub Pages**: Sube a un repositorio y activa Pages

### Opción B: Hosting tradicional (FTP)
- Sube todos los archivos al directorio raíz de tu hosting
- Asegúrate de que el servidor sirve `index.html` como página principal

## SEO — Palabras clave objetivo

| Página | Keyword principal |
|--------|-------------------|
| index.html | instalación aire acondicionado Barcelona |
| split.html | instalación split Barcelona |
| multisplit.html | instalación multisplit Barcelona |
| conductos.html | aire acondicionado conductos Barcelona |
| subvenciones.html | subvenciones aire acondicionado Barcelona 2026 |
| daikin.html | instalación Daikin Barcelona |
| eixample.html | aire acondicionado Eixample Barcelona |

## Soporte técnico

Para cualquier modificación o soporte, contacta con el desarrollador.
