# PaintMe — Resultado del checklist de imágenes

Fecha: 07/10/2026. Alcance: **62 dibujos del catálogo actual**, 43 incluidos también en Flutter y 19 solo web. Se aplicaron los **36 controles por imagen** y se registraron resultados, pendientes y bloqueos. No se modificaron imágenes ni código del producto.

**Ningún dibujo obtiene aprobación técnica completa todavía:** todos reproducen un fallo compartido al recuperar el modo pincel; además faltan pruebas físicas y aprobación detallada de regiones esperadas. La autorización de publicación/comercialización sigue pendiente en los 62.

## Resultados comprobados

- **229 archivos PNG** (maestros, web, miniaturas y variantes Flutter) decodificados con Pillow; todos legibles, con contenido visible, resolución y proporciones correctas. Las 43 variantes Flutter coinciden con las web por hash.
- **62/62 dibujos** cargados y pintados en balde y pincel en Chrome y WebKit automatizados, con deshacer, guardado, recuperación y tres descargas por modo.
- **744/744 descargas PNG** recibidas y decodificadas: píxeles iguales al lienzo en el momento de descargar. El PNG del pincel conserva también cualquier alteración previa causada al recuperar.
- **27,611 regiones geométricas** recorridas por el motor compartido en cada navegador, con cero píxeles discrepantes respecto a la conectividad de la máscara y sin dañar líneas. Esto no certifica ausencia de fugas: un contorno abierto produce una región conectada incorrecta que el algoritmo rellena correctamente.
- Selección desde miniatura y selector, recoloreado, mismo color, protección al tocar líneas, trazo largo y separación A/B de guardados comprobados en Chrome por dibujo y modo.

## Correcciones prioritarias

1. **Editor pincel — T-20, 62 dibujos.** La copia persistida coincide con la obra, pero al recuperarla cambian píxeles de los bordes suavizados. Balde recupera exactamente. La ruta de restauración coloca el PNG compuesto en la capa de pintura, elimina parcialmente líneas y vuelve a componer; es coherente con el fallo observado. Corregir la reconstrucción o persistir la capa de pintura y repetir la matriz; no redibujar 62 assets por este defecto del editor.
2. **Triceratops — T-08, T-13 y T-14.** La cabeza y el fondo comparten región. Un toque interior en (500,300), canvas 1200×1200, pinta ambos. [PNG que reproduce la fuga](qa-evidence/2026-10-07/artwork-checklist/triceratops-probe/triceratops/paint-chromium-export.png). Cerrar el contorno en el maestro y regenerar.
3. **Siete imágenes — T-10.** Fragmentación abundante: limpiar ruido y pequeños recintos accidentales, revisar detalles relevantes y regenerar. El umbral de menos de 16 px es una señal diagnóstica; no es una medida validada de facilidad táctil.

| Imagen | Regiones totales | Menores de 16 px |
|---|---:|---:|
| [pony-magico](qa-evidence/2026-10-07/artwork-checklist/pony-magico/CHECKLIST.md) | 2087 | 2022 |
| [pony-princesa](qa-evidence/2026-10-07/artwork-checklist/pony-princesa/CHECKLIST.md) | 2928 | 2822 |
| [gabby-camping](qa-evidence/2026-10-07/artwork-checklist/gabby-camping/CHECKLIST.md) | 2002 | 1821 |
| [gabby-pintando](qa-evidence/2026-10-07/artwork-checklist/gabby-pintando/CHECKLIST.md) | 8362 | 8145 |
| [gabby-amigos](qa-evidence/2026-10-07/artwork-checklist/gabby-amigos/CHECKLIST.md) | 4001 | 3622 |
| [gabby-cumpleanos](qa-evidence/2026-10-07/artwork-checklist/gabby-cumpleanos/CHECKLIST.md) | 1868 | 1575 |
| [gabby-casa-magica](qa-evidence/2026-10-07/artwork-checklist/gabby-casa-magica/CHECKLIST.md) | 1067 | 829 |

4. **10 imágenes — E-04.** Textos de marca/créditos/sitios visibles, detallados en las fichas. Resolver procedencia y condiciones de uso; usar originales autorizados. La auditoría no autoriza borrar atribuciones.
5. **Casa 4 — E-01/E-03 pendientes.** La figura parece una torre/cohete; confirmar nombre y clasificación. Dificultad y adecuación al público pendientes, especialmente ponis y composiciones Gabby.

En Chrome, recuperar pincel cambia entre **1,816 y 87,124 píxeles por dibujo**, con delta máximo de 38 por canal. [Comparación ampliada antes/después](qa-evidence/2026-10-07/artwork-checklist/restore-comparison.png). Son diferencias en bordes, no evidencia de pérdida completa de la obra.

**Pipeline:** el generador señala 11 archivos diferentes por bytes. La comparación posterior confirma los mismos píxeles en los 11: diferencia de codificación PNG, sin cambio gráfico. [Detalle](qa-evidence/2026-10-07/artwork-checklist/pipeline-differences.json). No se regeneraron ni reemplazaron assets.

## Qué queda sin aprobar

- Regiones previstas y conexiones intencionales: mapas generados y revisados, pero no existe una referencia de intención gráfica aprobada para certificar todos los contornos. La fuga de Triceratops sí está confirmada.
- Toque/zoom/rotación/exportación y memoria en Android, iPhone/iPad físicos; ejecución de los assets en Flutter; impresión.
- WebKit en Windows no equivale a Safari iOS. Apertura de PNG en visor independiente y descargas con cambios entre repeticiones también pendientes.
- Dificultad para la edad prevista, procedencia y permiso de publicación/adaptación/uso comercial. No se encontraron esos registros por imagen en el maestro; esto no demuestra falta de derechos ni una infracción.

## Registro por imagen

[Resumen CSV](qa-evidence/2026-10-07/artwork-checklist/checklist-summary.csv) · [Resultados completos JSON](qa-evidence/2026-10-07/artwork-checklist/checklist-results.json)

| Imagen / ficha con 36 controles | Regiones | <16 px | Aprobados | Fallidos | Pendientes | Bloqueados |
|---|---:|---:|---:|---:|---:|---:|
| [Dinosaurio feliz](qa-evidence/2026-10-07/artwork-checklist/dinosaurio/CHECKLIST.md) | 52 | 22 | 15 | 1 | 15 | 5 |
| [Gato curioso](qa-evidence/2026-10-07/artwork-checklist/gato/CHECKLIST.md) | 28 | 11 | 15 | 1 | 15 | 5 |
| [Perro juguetón](qa-evidence/2026-10-07/artwork-checklist/perro/CHECKLIST.md) | 25 | 11 | 15 | 1 | 15 | 5 |
| [Auto rojo](qa-evidence/2026-10-07/artwork-checklist/auto/CHECKLIST.md) | 18 | 0 | 15 | 1 | 15 | 5 |
| [Árbol de navidad](qa-evidence/2026-10-07/artwork-checklist/arbol-navidad/CHECKLIST.md) | 73 | 5 | 15 | 1 | 15 | 5 |
| [Mariposa](qa-evidence/2026-10-07/artwork-checklist/mariposa/CHECKLIST.md) | 48 | 20 | 15 | 1 | 15 | 5 |
| [Cohete](qa-evidence/2026-10-07/artwork-checklist/cohete/CHECKLIST.md) | 28 | 9 | 15 | 1 | 15 | 5 |
| [Princesa](qa-evidence/2026-10-07/artwork-checklist/princesa/CHECKLIST.md) | 46 | 11 | 15 | 1 | 15 | 5 |
| [Unicornio](qa-evidence/2026-10-07/artwork-checklist/unicornio/CHECKLIST.md) | 54 | 27 | 15 | 1 | 15 | 5 |
| [Castillo](qa-evidence/2026-10-07/artwork-checklist/castillo/CHECKLIST.md) | 91 | 19 | 15 | 1 | 15 | 5 |
| [Elefante alegre](qa-evidence/2026-10-07/artwork-checklist/elefante/CHECKLIST.md) | 51 | 29 | 15 | 1 | 15 | 5 |
| [Conejo saltarín](qa-evidence/2026-10-07/artwork-checklist/conejo/CHECKLIST.md) | 28 | 11 | 15 | 1 | 15 | 5 |
| [Pez sonriente](qa-evidence/2026-10-07/artwork-checklist/pez/CHECKLIST.md) | 37 | 8 | 15 | 1 | 15 | 5 |
| [Búho amable](qa-evidence/2026-10-07/artwork-checklist/buho/CHECKLIST.md) | 32 | 11 | 15 | 1 | 15 | 5 |
| [Camión feliz](qa-evidence/2026-10-07/artwork-checklist/camion/CHECKLIST.md) | 27 | 7 | 15 | 1 | 15 | 5 |
| [Avión divertido](qa-evidence/2026-10-07/artwork-checklist/avion/CHECKLIST.md) | 21 | 6 | 15 | 1 | 15 | 5 |
| [Barco de vela](qa-evidence/2026-10-07/artwork-checklist/barco/CHECKLIST.md) | 33 | 12 | 15 | 1 | 15 | 5 |
| [Tren juguete](qa-evidence/2026-10-07/artwork-checklist/tren/CHECKLIST.md) | 41 | 4 | 15 | 1 | 15 | 5 |
| [Muñeco de nieve](qa-evidence/2026-10-07/artwork-checklist/muneco-nieve/CHECKLIST.md) | 40 | 12 | 15 | 1 | 15 | 5 |
| [Regalo navideño](qa-evidence/2026-10-07/artwork-checklist/regalo-navidad/CHECKLIST.md) | 44 | 10 | 15 | 1 | 15 | 5 |
| [Campana navideña](qa-evidence/2026-10-07/artwork-checklist/campana-navidad/CHECKLIST.md) | 61 | 33 | 15 | 1 | 15 | 5 |
| [Dragón bebé](qa-evidence/2026-10-07/artwork-checklist/dragon/CHECKLIST.md) | 102 | 42 | 15 | 1 | 15 | 5 |
| [Hada mágica](qa-evidence/2026-10-07/artwork-checklist/hada/CHECKLIST.md) | 91 | 36 | 15 | 1 | 15 | 5 |
| [Sirena feliz](qa-evidence/2026-10-07/artwork-checklist/sirena/CHECKLIST.md) | 62 | 30 | 15 | 1 | 15 | 5 |
| [Triceratops](qa-evidence/2026-10-07/artwork-checklist/triceratops/CHECKLIST.md) | 46 | 10 | 15 | 4 | 12 | 5 |
| [Brontosaurio](qa-evidence/2026-10-07/artwork-checklist/brontosaurio/CHECKLIST.md) | 25 | 4 | 15 | 1 | 15 | 5 |
| [Pterodáctilo](qa-evidence/2026-10-07/artwork-checklist/pterodactilo/CHECKLIST.md) | 46 | 26 | 15 | 1 | 15 | 5 |
| [Corona real](qa-evidence/2026-10-07/artwork-checklist/corona-real/CHECKLIST.md) | 43 | 10 | 15 | 1 | 15 | 5 |
| [Carruaje real](qa-evidence/2026-10-07/artwork-checklist/carruaje-real/CHECKLIST.md) | 108 | 26 | 15 | 1 | 15 | 5 |
| [Vestido de princesa](qa-evidence/2026-10-07/artwork-checklist/vestido-princesa/CHECKLIST.md) | 40 | 11 | 15 | 1 | 15 | 5 |
| [Pony mágico](qa-evidence/2026-10-07/artwork-checklist/pony-magico/CHECKLIST.md) | 2087 | 2022 | 14 | 2 | 14 | 6 |
| [Pony princesa](qa-evidence/2026-10-07/artwork-checklist/pony-princesa/CHECKLIST.md) | 2928 | 2822 | 14 | 2 | 14 | 6 |
| [Pony 3](qa-evidence/2026-10-07/artwork-checklist/pony-3/CHECKLIST.md) | 154 | 77 | 15 | 1 | 14 | 6 |
| [Pony 4](qa-evidence/2026-10-07/artwork-checklist/pony-4/CHECKLIST.md) | 113 | 51 | 15 | 1 | 14 | 6 |
| [Casa 1](qa-evidence/2026-10-07/artwork-checklist/casa-1/CHECKLIST.md) | 6 | 0 | 15 | 1 | 15 | 5 |
| [Casa 2](qa-evidence/2026-10-07/artwork-checklist/casa-2/CHECKLIST.md) | 12 | 0 | 15 | 1 | 15 | 5 |
| [Casa 3](qa-evidence/2026-10-07/artwork-checklist/casa-3/CHECKLIST.md) | 7 | 0 | 15 | 1 | 15 | 5 |
| [Cohete sencillo](qa-evidence/2026-10-07/artwork-checklist/casa-4/CHECKLIST.md) | 6 | 0 | 13 | 1 | 17 | 5 |
| [Casa 5](qa-evidence/2026-10-07/artwork-checklist/casa-5/CHECKLIST.md) | 16 | 0 | 15 | 1 | 15 | 5 |
| [Paisaje 3](qa-evidence/2026-10-07/artwork-checklist/paisaje-3/CHECKLIST.md) | 19 | 0 | 15 | 1 | 15 | 5 |
| [Paisaje 4](qa-evidence/2026-10-07/artwork-checklist/paisaje-4/CHECKLIST.md) | 7 | 0 | 15 | 1 | 15 | 5 |
| [Paisaje 5](qa-evidence/2026-10-07/artwork-checklist/paisaje-5/CHECKLIST.md) | 7 | 0 | 15 | 1 | 15 | 5 |
| [Casa simple](qa-evidence/2026-10-07/artwork-checklist/casa-simple/CHECKLIST.md) | 24 | 2 | 15 | 1 | 15 | 5 |
| [Gabby gato volador](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-volador/CHECKLIST.md) | 259 | 197 | 17 | 1 | 12 | 6 |
| [Gabby gato con flores](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-flores/CHECKLIST.md) | 271 | 202 | 17 | 1 | 12 | 6 |
| [Gabby auto](qa-evidence/2026-10-07/artwork-checklist/gabby-auto/CHECKLIST.md) | 230 | 172 | 17 | 1 | 12 | 6 |
| [Gabby camping](qa-evidence/2026-10-07/artwork-checklist/gabby-camping/CHECKLIST.md) | 2002 | 1821 | 16 | 2 | 12 | 6 |
| [Gabby casa y auto](qa-evidence/2026-10-07/artwork-checklist/gabby-casa-auto/CHECKLIST.md) | 394 | 143 | 17 | 1 | 12 | 6 |
| [Gabby pintando](qa-evidence/2026-10-07/artwork-checklist/gabby-pintando/CHECKLIST.md) | 8362 | 8145 | 16 | 3 | 11 | 6 |
| [Gabby gato espacial](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-espacial/CHECKLIST.md) | 256 | 86 | 16 | 2 | 12 | 6 |
| [Gabby leyendo](qa-evidence/2026-10-07/artwork-checklist/gabby-leyendo/CHECKLIST.md) | 363 | 219 | 16 | 2 | 12 | 6 |
| [Gabby gato simple](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-simple/CHECKLIST.md) | 268 | 230 | 16 | 2 | 12 | 6 |
| [Gabby amigos](qa-evidence/2026-10-07/artwork-checklist/gabby-amigos/CHECKLIST.md) | 4001 | 3622 | 16 | 3 | 11 | 6 |
| [Gabby sala](qa-evidence/2026-10-07/artwork-checklist/gabby-sala/CHECKLIST.md) | 417 | 203 | 16 | 2 | 12 | 6 |
| [Gabby gato disfrazado](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-disfraz/CHECKLIST.md) | 269 | 200 | 17 | 1 | 12 | 6 |
| [Gabby cumpleaños](qa-evidence/2026-10-07/artwork-checklist/gabby-cumpleanos/CHECKLIST.md) | 1868 | 1575 | 16 | 2 | 12 | 6 |
| [Gabby Catrat](qa-evidence/2026-10-07/artwork-checklist/gabby-catrat/CHECKLIST.md) | 66 | 25 | 17 | 1 | 12 | 6 |
| [Gabby gato espacial dos](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-espacial-2/CHECKLIST.md) | 129 | 24 | 16 | 2 | 12 | 6 |
| [Gabby gato caja](qa-evidence/2026-10-07/artwork-checklist/gabby-gato-caja/CHECKLIST.md) | 136 | 29 | 16 | 2 | 12 | 6 |
| [Gabby póster de amigos](qa-evidence/2026-10-07/artwork-checklist/gabby-poster-amigos/CHECKLIST.md) | 288 | 126 | 16 | 2 | 12 | 6 |
| [Gabby casa mágica](qa-evidence/2026-10-07/artwork-checklist/gabby-casa-magica/CHECKLIST.md) | 1067 | 829 | 16 | 2 | 12 | 6 |
| [Gabby casa frontal](qa-evidence/2026-10-07/artwork-checklist/gabby-casa-frontal/CHECKLIST.md) | 138 | 29 | 16 | 2 | 12 | 6 |

## Evidencia y reproducción

[Checklist original](CHECKLIST-IMAGENES-COLOREAR.md). Evidencia: [inventario](qa-evidence/2026-10-07/artwork-checklist/static.json), [Chrome](qa-evidence/2026-10-07/artwork-checklist/browser-chromium.json), [WebKit](qa-evidence/2026-10-07/artwork-checklist/browser-webkit.json), [casos adicionales Chrome](qa-evidence/2026-10-07/artwork-checklist/extended-chromium.json). Cada ficha enlaza PNG y mapa de regiones numeradas; regiones pequeñas de menos de 64 píxeles no llevan número dibujado, pero sí figuran en JSON.

Se conservan SHA-256 de fuentes, catálogos y scripts para identificar la revisión local. Las pruebas sirven `web/` por HTTPS local y bloquean terceros. No miden producción ni anuncios. La auditoría compara píxeles; no interpreta como defectos diferencias de compresión PNG.

```powershell
python scripts/build_catalog.py
python scripts/audit-artwork-static.py
$env:PAINTME_PLAYWRIGHT_PATH = '<ruta instalada a playwright>'
$env:PAINTME_BROWSER_ENGINE = 'chromium'
node scripts/audit-artwork-browser.cjs
node scripts/audit-artwork-browser.cjs --extended
$env:PAINTME_BROWSER_ENGINE = 'webkit'
node scripts/audit-artwork-browser.cjs
$env:PAINTME_BROWSER_ENGINE = 'chromium'
node scripts/audit-artwork-browser.cjs --probe-triceratops
python scripts/artwork-audit-contact-sheets.py
python scripts/compare-artwork-pipeline.py
python scripts/summarize-artwork-checklist.py
```

El runner devuelve **código 1** cuando reproduce un control funcional fallido (en esta revisión, recuperación de pincel). Es un resultado negativo registrado, no un fallo que deba ocultarse. Genera y reemplaza evidencia automática; preservar una ejecución anterior en otra carpeta antes de repetir si se desea conservar historial.
