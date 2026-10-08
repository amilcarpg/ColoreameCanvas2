# Generador local de PNG para colorear

Convierte imágenes existentes, conserva el archivo original y permite probar las regiones con el mismo motor de relleno de la web. Incluye cinco originales creados con la herramienta integrada **ImageGen**, en llamadas independientes: tortuga de líneas, zorro a color, globo a lápiz, flor sin contornos y fotografía sintética de una casa de madera. Los prompts completos y referencias de creación están en [samples/prompts.json](samples/prompts.json).

## Abrir

Desde la raíz del proyecto, con Python 3.11 o posterior:

```powershell
python -m pip install -r scripts/requirements-coloring.txt
python scripts/coloring_generator.py --serve
```

Abrir `http://127.0.0.1:8787/`. El servidor escucha solamente en el equipo local. En esta sesión se usó el Python incluido en Codex; OpenCV quedó instalado en `.tools/coloring-deps`, fuera del control de versiones. La instalación normal anterior permite ejecutar el generador en otro equipo.

1. Elegir una muestra o cargar PNG, JPG o WEBP, hasta 16 MB y 16 millones de píxeles.
2. Elegir líneas, ilustración a color o fotografía. Automático distingue color de líneas; no reconoce fotografías con fiabilidad.
3. Ajustar detalle, grosor, limpieza y cierre de huecos. Generar el PNG.
4. Tocar las regiones para probar el balde y abrir el mapa de regiones. Unir huecos puede alterar separaciones intencionales.
5. Descargar dibujo, miniatura, maestro procesado o informe. La descarga del dibujo conserva el resultado **sin los colores de la prueba**.

Cambiar ajustes invalida la vista anterior y sus enlaces de descarga. Las conversiones que terminan después de cambiar ajustes o imagen se descartan. Los archivos cargados se procesan en memoria: el servidor no los guarda ni los envía a otro servicio.

## Conversión por archivo o lote de muestras

```powershell
python scripts/coloring_generator.py --input imagen.png --out output/mi-dibujo --mode outline
python scripts/coloring_generator.py --input foto.jpg --out output/mi-foto --mode photo --detail simple
python scripts/coloring_generator.py --samples
```

Cada carpeta de salida contiene:

| Archivo | Uso |
|---|---|
| `drawing.png` | Blanco y negro binario, lado mayor ≤1200 px, para los editores. |
| `thumbnail.png` | Miniatura suavizada, lado mayor ≤360 px; no es la base de pintura. |
| `master.png` | Maestro procesado, limitado por `--size` (1200 predeterminado, máximo 2400). |
| `regions.png` | Mapa de componentes blancos conectados en cuatro direcciones. |
| `report.json` | Opciones, hashes, versiones, dimensiones, regiones, tiempos y advertencias. |

El original de mayor resolución se conserva por separado. `--force` permite reemplazar resultados existentes; nunca permite reemplazar el original. El lote aplica ajustes específicos al globo a lápiz: contraste 230, limpieza 64 y cierre 3. Esos ajustes también se cargan al elegir esa muestra en la interfaz.

Otros parámetros: `--threshold`, `--noise`, `--close`, `--thickness`, `--colors`, `--size`, `--detail simple|medium|detailed`. Los resultados se mantienen fuera del catálogo público hasta que se revisen. El generador no modifica assets ni catálogos de web o Flutter.

## Pruebas y evidencia

```powershell
python -m unittest discover -s tests -p test_coloring_generator.py -v
node --test tests/coloring-browser.test.cjs
```

Las pruebas de navegador requieren Playwright y Chrome. `PAINTME_PLAYWRIGHT_PATH`, `PAINTME_PYTHON_PATH`, `PAINTME_BROWSER_PATH` y `PAINTME_OPENSSL_PATH` permiten indicar instalaciones existentes. Para WebKit: `PAINTME_BROWSER_ENGINE=webkit`; requiere su navegador instalado. El test inicia un servidor local temporal y un servidor HTTPS del producto, y cierra ambos al terminar.

Ver [informe y checklist de las cinco muestras](../../docs/GENERADOR-PNG-RESULTADOS.md) y [comparación visual](samples/comparison-final.jpg). `python scripts/coloring_evidence.py` regenera la comparación y las sondas semánticas; utiliza Arial de Windows para los rótulos.

## Lo aprendido para crear mejores imágenes

La tortuga, creada directamente con líneas negras cerradas y fondo blanco, conserva mejor la estructura. Las ilustraciones planas también funcionan, pero dos partes del mismo color pueden quedar como una sola región: en la flor, los pétalos forman una región y el tallo con las hojas otra. Separarlas requiere dibujar líneas que el original no tiene.

El lápiz y las fotos necesitan más trabajo. La limpieza del globo eliminó textura, pero las nubes siguen abiertas. La casa quedó reconocible, aunque conserva un trazo residual en el techo y detalles demasiado pequeños para una ficha sencilla. La extracción de bordes ayuda a preparar una base; no entiende qué zonas deberían ser independientes.

Para originales destinados a colorear, usar este tipo de especificación:

> Dibujo infantil de [tema], composición centrada, formas amplias y contornos negros continuos sobre fondo blanco puro. Cada región que debe pintarse por separado tiene un perímetro cerrado. Sin grises, sombras, degradados, texturas, texto ni marcas de agua. Evitar regiones diminutas y conservar margen alrededor de la figura.

La revisión visual y la prueba del balde siguen siendo necesarias. `review_required` permanece verdadero incluso cuando pasan los controles automáticos. No se declara una imagen lista para publicación por contar regiones o eliminar ruido.
