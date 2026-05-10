# Colorea con balde de pintura (Canvas)

Proyecto web estático (sin backend) para pintar por regiones usando flood fill en HTML5 Canvas.

## Cómo ejecutar
- Recomendado: servir con un servidor local para evitar bloqueos de CORS.
- Ejemplos:
  - `python3 -m http.server 8000`
  - `npx serve .`
- Abrir en el navegador: `http://localhost:8000`

## PNGs recomendados
- Líneas negras sobre fondo blanco, sin grises en las líneas.
- Contornos cerrados (evita fugas del balde).
- Resolución recomendada: hasta 1200x1200 (el proyecto reescala si es mayor).
- Si hay bordes anti-aliased, ajusta la tolerancia en `app.js` (por defecto 20).
- Antes de publicar, audita `file assets/*.png` y prueba cada dibujo de
  `assets-list.js` pintando zonas pequeñas cerca de bordes y detalles finos.

## AdSense (recomendaciones)
- Mantener anuncios SOLO en header y footer (ya están los slots).
- Evitar anuncios pegados al canvas o superpuestos.
- Agregar separación visual clara para prevenir clics accidentales.
- Analytics y AdSense se cargan desde `app.js` solo si el usuario acepta el
  consentimiento.
- Los anuncios se inicializan como no personalizados
  (`requestNonPersonalizedAds = 1`).
- Si la web se publica para niños, revisar la configuración de AdSense,
  Analytics y el cumplimiento legal vigente antes de producción.

## Seguridad y privacidad
- La pagina incluye una politica de seguridad basica con `Content-Security-Policy`
  y `referrer=strict-origin-when-cross-origin`.
- La experiencia funciona aunque el usuario rechace analitica y anuncios.
- No se solicitan cuentas, nombres, correos ni datos personales.
- En hosting propio, agregar tambien headers HTTP equivalentes para
  `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy` y
  `X-Content-Type-Options`.

## Estructura
- `index.html`
- `styles.css`
- `app.js`
- `assets-list.js`
- `assets/*.png`
