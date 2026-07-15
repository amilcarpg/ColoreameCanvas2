# Colorea con balde de pintura y pincel (Canvas)

Proyecto web estático (sin backend) para pintar por regiones usando flood fill en HTML5 Canvas o pintar a mano con pincel sobre dibujos PNG.

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
- Si hay bordes anti-aliased, ajusta la tolerancia en `paint.js` (por defecto 20).
- El modo pincel (`brush.html`) filtra y carga solo archivos `.png`.

## AdSense (recomendaciones)
- Mantener anuncios SOLO en header y footer (ya están los slots).
- Evitar anuncios pegados al canvas o superpuestos.
- Agregar separación visual clara para prevenir clics accidentales.
- En `paint.html` hay comentarios indicando dónde pegar los snippets reales.

## Estructura
- `index.html`
- `paint.html`
- `brush.html`
- `paint.css`
- `paint.js`
- `brush.css`
- `brush.js`
- `assets-list.js`
- `assets/*.png`
