# Pendientes de seguridad · zervitecnics.es

> **Obligatorio. No se puede pasar por alto.** Revisado el 12-nov-2026 con el diagnóstico del panel de monitoreo.

## Hecho (12-nov-2026)

- **Lista de lo que la página puede cargar (CSP):** ya estaba en 690 páginas; se añadió a las 4 que faltaban
  (`index.html`, `404.html`, `opiniones/index.html`, `interno/mapa/index.html`).
- **No contar a otras webs de qué página vienen las visitas (Referrer-Policy):** añadido a todas las páginas
  y a los 4 generadores de `tools/`, para que las páginas nuevas salgan ya con él.

## Pendiente: 3 protecciones que GitHub Pages no permite

Solo se pueden enviar como cabeceras del servidor, y GitHub Pages no deja configurarlas:

| # | Protección | Gravedad | Qué evita |
|---|---|---|---|
| 1 | `Strict-Transport-Security` (HSTS) | Importante | Que en una wifi pública se desvíe la primera visita a la versión sin cifrar. |
| 3 | `X-Frame-Options: DENY` o `frame-ancestors 'none'` | Importante | Que otra web muestre la tuya debajo de botones falsos. |
| 4 | `X-Content-Type-Options: nosniff` | Leve | Que el navegador trate un archivo como si fuera otro tipo. |

### Opciones a evaluar (ninguna decidida)

- **Cloudflare (proxy): descartado.** LaLiga bloquea direcciones de Cloudflare durante los partidos de fútbol
  y la web se cae en España. La sentencia que lo ampara dura hasta el 20-jun-2027.
- **Firebase Hosting (Google):** gratuito y permite las 3 cabeceras. No aparece en los informes de bloqueos
  revisados, pero eso no garantiza que no le toque. Falta comprobar sus límites gratuitos de tráfico.
- **Netlify:** permite las 3, pero gasta créditos del plan gratuito que ya se usan en Gestión Fiscal.
- **Volver a mirar Cloudflare** si cambian los bloqueos (fin de la sentencia o reforma legal).

Antes de mover la web: comprobar que no se rompen el dominio, el formulario, el SEO ni Search Console.
