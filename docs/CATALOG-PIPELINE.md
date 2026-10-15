# Catálogos y variantes de PaintMe

Fuente técnica: `base_png/catalog.json`. Los PNG maestros permanecen en `base_png/`; se conservan sus bytes y resolución. Editar esa fuente, no los catálogos generados.

**Decisión 08/10/2026:** la generación y las comprobaciones son manuales y locales. GitHub Pages publica los archivos ya generados y guardados en Git; no ejecuta Python, regenera PNG ni compara sus bytes en Linux.

## Ejecutar desde la raíz

```powershell
python -m pip install -r scripts/requirements-catalog.txt
python scripts/build_catalog.py --write
python scripts/build_catalog.py
python scripts/check-artwork.py --report-dir docs/qa-evidence/catalogo
python -m unittest discover -s tests -p test_catalog_pipeline.py -v
node scripts/check-web.cjs
```

La instalación es preparación del entorno; no se ejecuta al abrir la web. Python 3 y las versiones fijadas de Pillow/NumPy son necesarios. `--write` aplica las salidas; el comando posterior sin esa opción comprueba sin escribir y debe devolver cero diferencias en el mismo entorno local. `--out-dir <carpeta>` permite revisar una salida aislada; no elimina archivos antiguos ni publica nada.

Revisar los cambios y guardar en el commit las salidas de `web/` y Flutter junto con la fuente modificada. Después del push a `main`, Pages publica únicamente `web/`, sin generar ni validar. Para los comandos de revisión y publicación, ver [runbook](DEPLOYMENT-RUNBOOK.md).

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

## Reparaciones CAT-04 del 14/10/2026

Las nueve fuentes corregidas usan nombres `*-cat04-20261014.png`; los originales permanecen intactos. `legacyWebSrc` identifica la imagen anterior: los editores mantienen esa fuente y sus contornos al recuperar obras antiguas. Una obra nueva usa `webSrc`. El generador también actualiza referencias de imágenes en las páginas existentes.

`downsampleFilter` admite `lanczos` (predeterminado histórico) y `bilinear`. Las nueve reparaciones usan bilinear: Lanczos reintroducía pequeñas islas blancas al reducir estos contornos binarios. No se modifica la selección de las otras 53 entradas.

La reparación es reproducible desde originales preservados y un manifiesto con hashes. El script consulta por defecto; `--write` escribe únicamente las versiones nuevas y sus variantes. Requiere el entorno de `scripts/requirements-artwork-repair.txt`; puede instalarse en un entorno virtual dentro del proyecto. Los parámetros y la conservación de píxeles negros/créditos se comprueban por dibujo.

```powershell
python scripts/repair-artwork-catalog.py --report-dir docs/qa-evidence/2026-10-14/artwork-checklist
# Aplicar solo una reparación ya analizada/autorizada:
python scripts/repair-artwork-catalog.py --report-dir docs/qa-evidence/2026-10-14/artwork-checklist --write
```

`PAINTME_ARTWORK_OUTPUT` permite dirigir las auditorías a una carpeta de evidencia dentro del repositorio. `audit-artwork-browser.cjs` admite `PAINTME_ARTWORK_SLUGS` para repetir un subconjunto y `PAINTME_ARTWORK_REFERENCE` para su comparación extendida con un dibujo sin cambios. `merge-artwork-audits.py` valida hashes/metadatos antes de reutilizar evidencia; `report-artwork-review.py` rechaza fuentes, editor o revisión visual desactualizados. `render-artwork-region-maps.py` genera colores únicos por región y contrasta semillas/áreas con el navegador; no altera los dibujos.

Los 11 desajustes históricos de bytes PNG se conservaron: `compare-artwork-pipeline.py` comprueba que sus píxeles son idénticos. El entorno de reparación tiene dependencias distintas al pipeline histórico y queda fijado por separado. [Resultados y límites actuales](RESULTADO-CHECKLIST-IMAGENES.md).
