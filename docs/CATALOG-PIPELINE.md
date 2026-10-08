# Catálogos y variantes de PaintMe

Fuente técnica: `base_png/catalog.json`. Los PNG maestros permanecen en `base_png/`; se conservan sus bytes y resolución. Editar esa fuente, no los catálogos generados.

## Ejecutar desde la raíz

```powershell
python -m pip install -r scripts/requirements-catalog.txt
python scripts/build_catalog.py
python scripts/build_catalog.py --write
python scripts/build_catalog.py
python scripts/check-artwork.py --report-dir docs/qa-evidence/catalogo
python -m unittest discover -s tests -p test_catalog_pipeline.py -v
node scripts/check-web.cjs
```

La instalación es preparación del entorno; no se ejecuta al abrir la web. Python 3 y las versiones fijadas de Pillow/NumPy son necesarios. El primer comando del generador solo verifica, sin escribir; devuelve 1 si hay diferencias. `--write` aplica las salidas. Repetir la verificación debe devolver cero diferencias. `--out-dir <carpeta>` permite revisar una salida aislada; no elimina archivos antiguos ni publica nada.

## Agregar o cambiar una entrada

1. Conservar el maestro PNG y elegir un slug estable. Registrar `file`, `label`, `category`, `pack`, `theme`, `difficulty`, `keywords`, `webSrc`, `thumbnailSrc` y `platforms` en la fuente. Categoría y tema deben existir en `categories`; dificultad: `simple`, `medio`, `detallado` o `por-revisar`.
2. Declarar las plataformas de manera explícita. Se mantienen 62 entradas web y 43 Flutter; las 19 exclusivas web siguen excluidas de Flutter. Un nivel gráfico es orientativo, no una evaluación educativa.
3. Generar en una carpeta de revisión o ejecutar `--write`; comprobar los cambios. Los duplicados, rutas fuera de directorio, archivos ausentes, categorías desconocidas y PNG inválidos provocan error antes de escribir.
4. Ejecutar las comprobaciones y revisar visualmente regiones, contornos y legibilidad. Registrar el resultado por dibujo en el CSV; no marcar aprobado por tener solamente un PNG válido.

El pipeline crea PNG RGB sobre blanco a un máximo de 1200 px para pintar/móvil y 360 px para miniaturas, sin ampliar maestros pequeños. Genera `web/assets-list.js`, `web/catalog-meta.js`, `flutter/assets/catalog.json` y `flutter/lib/catalog_categories.dart`. Parámetros de resize/compresión y finales LF están fijados para reproducibilidad en el entorno documentado. Actualizar las dependencias requiere revisar las diferencias de salida.

También sincroniza metadatos, relacionados y queries de las **páginas HTML existentes** de dibujos/categorías/packs. Conserva rutas y canonical; no crea nuevas páginas indexables ni añade fichas de personajes. Las plantillas de esas páginas siguen siendo HTML editable; ejecutar el generador tras cambiar la taxonomía. No decide la intención editorial ni la indexación.

## Evidencia y límites

`check-artwork.py` comprueba dimensiones, proporción y compatibilidad de blanco/negro con el pincel. Guarda hashes de los maestros en JSON. Crea `artwork-review.csv` si falta; conserva una revisión humana existente. Un maestro modificado exige actualizar conscientemente su revisión anterior usando los hashes actuales.

La suite Playwright pinta/exporta cada dibujo y compara dimensiones y todos los píxeles descargados. Sus fixtures verifican regiones aisladas y contornos protegidos del motor; no demuestran que todas las líneas de cada ilustración estén cerradas. Las pruebas físicas y revisión visual siguen en [pruebas pendientes](PRUEBAS-PENDIENTES.md).

Esta herramienta es técnica. **CAT-02 quedó excluida por instrucción del usuario:** no implementa procedencia/licencias, filtro comercial ni aprobación de derechos. Generar archivos no autoriza comercialización o publicación.
