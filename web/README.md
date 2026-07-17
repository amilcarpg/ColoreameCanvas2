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
- Resolución para pintar: máximo de 1200 px en el lado mayor; el lienzo no utiliza más detalle.
- Si hay bordes anti-aliased, ajusta la tolerancia en `paint.js` (por defecto 20).
- El modo pincel (`brush.html`) filtra y carga solo archivos `.png`.

## Regla obligatoria para el administrador al agregar un dibujo

Cada vez que el administrador agregue un dibujo, debe preparar y registrar estas tres variantes antes de publicarlo:

- `base_png/<archivo>.png`: maestro, conservado a la mayor resolución disponible.
- `assets/<archivo>.png` o `assets/<coleccion>/<archivo>.png`: versión para pintar, máximo 1200 px en el lado mayor.
- `assets/thumbs/<archivo>.png`: miniatura de selección, máximo 360 px en el lado mayor.

En `assets-list.js`, el administrador debe registrar `src` para la versión de pintura y `thumbnailSrc` para la miniatura. La galería carga solo `thumbnailSrc`; el lienzo carga `src` al seleccionar el dibujo. Ambas versiones deben ser PNG optimizados y conservar la misma proporción.

En la web, la galería se muestra bajo demanda al abrir **Explorar dibujos**. No se crean sus tarjetas ni se descargan sus miniaturas durante la carga inicial de la página.

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
- `assets/<coleccion>/*.png`
- `assets/thumbs/*.png`
