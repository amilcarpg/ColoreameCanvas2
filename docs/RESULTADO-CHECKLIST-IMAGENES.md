# CAT-04 — Revisión y correcciones de dibujos

**Actualización posterior del 14/10/2026:** publicación autorizada completada y verificada; familias responde 200, 247 archivos exactos y smoke público aprobado. Servicios apagados. [Resultado vigente](PUBLICACION-WEB-2026-10-14.md). Las referencias a cambios sin publicar en el texto siguiente describen la preparación anterior.

Actualizado: 14/10/2026. **Alcance local web verificado; CAT-04 continúa parcial por QA física/nativa.** Se revisaron los 62 dibujos y sus áreas principales; se corrigieron nueve fuentes y la recuperación del pincel. Cambios locales, sin publicar.

## Correcciones realizadas

- Triceratops: cerrada la discontinuidad de mandíbula que conectaba cabeza y exterior; parche local de 121 píxeles.
- Pony mágico, pony princesa, Gabby camping, pintando, amigos, cumpleaños y casa mágica: limpieza determinista de ruido y contornos. Sus microregiones menores de 16 px bajaron de **20 836 a 109 (99,5%)**; se conservan detalles pequeños legítimos.
- Gabby gato con flores: cerradas localmente las puntas de ambas antenas, sin alterar el resto del maestro.
- Pincel: guarda capa editable y compuesto por separado; recuperar/deshacer conserva los píxeles del compuesto. Decodificación PNG evita aplicar de nuevo perfiles de color y redondear bordes. Registros antiguos conservan la fuente y máscara originales al restaurarse, tanto con balde como pincel.
- Catálogo: maestros nuevos versionados, miniaturas y variantes web/Flutter regeneradas según plataforma. Los originales y créditos siguen presentes. Las nueve entradas usan reducción bilineal para evitar que Lanczos reintroduzca microagujeros. Queries de scripts actualizadas para invalidar caché.

No se incorporó ningún candidato ImageGen: se descartaron por fragmentación residual. El resultado activo procede del pipeline Python autorizado. El caso Gabby sala no tenía fuga del cuerpo: la paleta diagnóstica repetía colores; ahora los mapas usan colores únicos y verifican cada semilla/área contra el navegador. Marcos abiertos junto a créditos y adornos abiertos comparten fondo; no se prometen como zonas cerradas independientes.

## Verificación y evidencia

- 62 registros individuales, **2 232 controles** y **744 PNG descargados**, abiertos con Pillow y comparados píxel a píxel.
- Barrido de todas las regiones: cero discrepancias de relleno y cero píxeles de máscara dañados. Pintar, borrador, deshacer, recuperación, tres descargas sucesivas y separación de obras comprobados.
- Chromium y WebKit: corrida completa inicial de 62 y repetición final de los nueve corregidos. Los 53 restantes se reutilizan únicamente tras comprobar hashes de fuente/editor y metadatos; la procedencia consta en cada registro.
- Regresión del editor: 97 pruebas completas por motor; después de la novena corrección, las dos pruebas de compatibilidad antigua por motor recorrieron las nueve fuentes versionadas. Tres casos de pincel con bordes suavizados también verifican recuperación y deshacer exactos.
- 51 pruebas Node, 10 del pipeline Python y comprobación de 64 rutas HTML/61 URLs del sitemap aprobadas. Las 11 diferencias históricas de codificación PNG tienen píxeles idénticos; se preservaron esos archivos.

[Resumen por dibujo](qa-evidence/2026-10-14/artwork-checklist/checklist-summary.csv) · [Controles completos](qa-evidence/2026-10-14/artwork-checklist/checklist-results.json) · [Parámetros y hashes de reparación](qa-evidence/2026-10-14/artwork-checklist/deterministic-repairs.json) · [Revisión visual](qa-evidence/2026-10-14/artwork-checklist/visual-review.json) · [Auditoría Chromium](qa-evidence/2026-10-14/artwork-checklist/browser-chromium.json) · [Auditoría WebKit](qa-evidence/2026-10-14/artwork-checklist/browser-webkit.json).

Cada carpeta de dibujo contiene CHECKLIST.md, mapa numerado y PNG de exportación/recuperación. Las carpetas before y before-cleanup conservan la evidencia anterior; after-cleanup contiene la repetición final. Los registros no equiparan conectividad automática con intención artística de cada microdetalle.

## Pendientes para cerrar CAT-04

- Teléfono/tablet Android y Safari iPhone/iPad: regiones pequeñas con dedo, zoom, rotación, guardado alternativo y CPU/RAM.
- Ejecución instalada Flutter para los 43 dibujos incluidos; exportación/recuperación y contornos nativos.
- Apertura en visor del sistema e impresión física para legibilidad en papel.
- Adecuación de dificultad al público previsto. CAT-02 permanece excluida; no se evalúan derechos ni autorización de publicación.

El informe del 07/10 queda conservado como histórico en la evidencia anterior. Sus fallos de pincel, Triceratops y fragmentación masiva están corregidos en esta versión local.
