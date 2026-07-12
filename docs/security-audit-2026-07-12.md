# Auditoría Técnica de Seguridad

Fecha: 2026-07-12

Alcance:
- `index.html`
- `paint.html`
- `home.js`
- `paint.js`
- `assets-list.js`
- cabeceras observables del sitio público en GitHub Pages

## Resumen

El sitio tiene una superficie de ataque baja por ser estático y no exponer backend propio, pero dependía demasiado de esa simplicidad y tenía poco hardening explícito. Los riesgos principales estaban en:

- ausencia de una política CSP
- validación débil de parámetros de URL en `paint.html`
- dependencia en scripts de terceros sin acotación explícita desde el HTML
- falta de cabeceras de seguridad configurables desde el origen actual

## Hallazgos

### P1 - Medium

`home` y `paint` no tenían `Content-Security-Policy`, lo que dejaba abierta la ejecución de recursos no previstos si en el futuro se introducía una inyección DOM o una referencia externa no controlada.

Estado:
- mitigado en código con CSP por meta tag

Limitación:
- al estar en GitHub Pages, la meta CSP no sustituye completamente cabeceras HTTP como `frame-ancestors`

### P1 - Medium

`paint.html` aceptaba `asset` y `category` desde la URL, pero la validación era permisiva: un valor inválido se ignoraba por comportamiento de negocio, no por una sanitización explícita y trazable.

Estado:
- mitigado en código con validación estricta por regex y lista blanca
- los parámetros inválidos ahora se eliminan de la URL normalizada

### P2 - Medium

El sitio público observado no envía varias cabeceras defensivas:

- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- política anti-framing por cabecera

Estado:
- no mitigable por completo solo desde HTML estático en GitHub Pages

Recomendación:
- mover la publicación detrás de Cloudflare o un proxy equivalente para inyectar cabeceras

### P2 - Medium

`paint.html` carga terceros para analytics y AdSense. Eso amplía la superficie de confianza del cliente.

Estado:
- parcialmente mitigado con CSP acotando `script-src`, `connect-src`, `img-src` y `frame-src`

### P3 - Low

`Access-Control-Allow-Origin: *` aparece en las respuestas públicas observadas de GitHub Pages.

Impacto:
- bajo para este caso porque no hay API privada ni datos sensibles del lado del origen

### P3 - Low

La inicialización de analytics estaba inline, lo que obligaba a una política CSP más débil si se quería endurecer el sitio.

Estado:
- mitigado moviendo la inicialización a `analytics-init.js`

## Recomendaciones siguientes

1. Añadir un borde de entrega con cabeceras HTTP reales.
2. Revisar si AdSense es necesario en todas las vistas y reducir terceros donde sea posible.
3. Mantener `assets-list.js` como catálogo de lista blanca y no cargar rutas arbitrarias.
4. Si en el futuro se agregan formularios, comentarios o contenido generado por usuarios, repetir la auditoría con foco en DOM XSS y exfiltración.
