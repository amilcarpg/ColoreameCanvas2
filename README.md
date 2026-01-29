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

## AdSense (recomendaciones)
- Mantener anuncios SOLO en header y footer (ya están los slots).
- Evitar anuncios pegados al canvas o superpuestos.
- Agregar separación visual clara para prevenir clics accidentales.
- En `index.html` hay comentarios indicando dónde pegar los snippets reales.

## Estructura
- `index.html`
- `styles.css`
- `app.js`
- `assets-list.js`
- `assets/dinosaur-01.png`
