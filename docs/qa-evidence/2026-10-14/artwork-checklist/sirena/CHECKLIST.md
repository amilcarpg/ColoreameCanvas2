# Sirena feliz — sirena

Revisión CAT-04: 14/10/2026. Evidencia local identificada por SHA-256.

**Resultado:** Verificado en web de escritorio; pendiente de alcance físico/nativo.

## Variantes

| Variante | Dimensiones | KB | SHA-256 |
|---|---:|---:|---|
| master | 1200×1200 | 1010.7 | b4ab3016e9bb4fe90d0cd8393c7f0ed4c3e19c3a503fe4c07215e593276aa2c2 |
| web | 1200×1200 | 811.0 | c9a78ebafeea81fb0565ce168eda04cd1668b8c761d50e41981372d75e8b3624 |
| thumbnail | 360×360 | 112.9 | 484ef443691521431fcc5e80327728f2c29130e767348eb0d9f659d1e614eaeb |
| flutter | 1200×1200 | 811.0 | c9a78ebafeea81fb0565ce168eda04cd1668b8c761d50e41981372d75e8b3624 |

## Revisión visual

- Revisión de las cuatro hojas actuales y los mapas individuales de composiciones detalladas; áreas principales aprobadas frente a fuente y conectividad numerada.
- Colores únicos por región: no confundir tonos parecidos con una conexión; IDs y semillas son la referencia.
- No se realizaron pruebas físicas, evaluación educativa ni aprobación de derechos. Detalles diminutos y trazos decorativos abiertos no se prometen como zonas independientes.

## Recuperación y descargas

| Motor | Balde: píxeles cambiados | Pincel: píxeles cambiados | PNG exactos |
|---|---:|---:|---:|
| chromium | 0 | 0 | 6/6 |
| webkit | 0 | 0 | 6/6 |

Regiones: 62; menores de 16 px: 30. Barrido: 0 píxeles discrepantes, 0 de contorno dañados.

[Mapa numerado](regions-chromium.png) · [Balde exportado](paint-chromium-export.png) · [Pincel antes de restaurar](brush-chromium-before-restore.png) · [Pincel recuperado](brush-chromium-export.png)

## Checklist

| ID | Control | Estado | Evidencia o límite |
|---|---|---|---|
| T-01 | PNG real y legible. | Aprobado | Variantes decodificadas con Pillow y cargadas en ambos editores web. |
| T-02 | Rutas disponibles. | Pendiente | Rutas web comprobadas; Flutter incluido en catálogo/paquete, ejecución física pendiente cuando aplica. |
| T-03 | Resolución adecuada. | Aprobado | Web ≤1200 px; miniatura ≤360 px; dimensiones por variante registradas. |
| T-04 | Proporción y encuadre conservados. | Aprobado | Proporciones y píxeles del pipeline verificados; revisión de hojas de contacto. |
| T-05 | Identidad y metadatos correctos. | Aprobado | 62 slugs únicos y pertenencia explícita: 43 Flutter, 19 exclusivos web. |
| T-06 | Selección real correcta. | Aprobado | Selección por miniatura/selector en Chromium; enlace directo en ambos motores. |
| T-07 | Base sin colorear. | Aprobado | Base sin color incompatible; lectura independiente de los canales PNG. |
| T-08 | Contornos cerrados donde corresponde. | Aprobado | Fuente y mapa numerado revisados: figura principal separada del exterior, regiones principales coherentes y contornos visibles. Barrido de todas las regiones sin discrepancias. No certifica la intención de cada detalle mínimo ni selección táctil física. |
| T-09 | Líneas resistentes a la reducción. | Aprobado | Fuente y mapa numerado revisados: figura principal separada del exterior, regiones principales coherentes y contornos visibles. Barrido de todas las regiones sin discrepancias. No certifica la intención de cada detalle mínimo ni selección táctil física. |
| T-10 | Interiores realmente pintables. | Aprobado | 62 regiones; 30 menores de 16 px. Sin fragmentación masiva en las áreas principales revisadas; detalles pequeños/grises y letras registrados, usabilidad pendiente en T-12. Microregión no implica por sí sola un defecto. |
| T-11 | Bordes y transparencia correctos. | Aprobado | Fondo blanco opaco y encuadre conservados. Marcos decorativos abiertos junto a créditos comparten papel interior/exterior; no se interpreta como fuga hacia la figura. |
| T-13 | Cobertura completa con balde. | Aprobado | Fuente y mapa numerado revisados: figura principal separada del exterior, regiones principales coherentes y contornos visibles. Barrido de todas las regiones sin discrepancias. No certifica la intención de cada detalle mínimo ni selección táctil física. |
| T-14 | Sin fugas. | Aprobado | Fuente y mapa numerado revisados: figura principal separada del exterior, regiones principales coherentes y contornos visibles. Barrido de todas las regiones sin discrepancias. No certifica la intención de cada detalle mínimo ni selección táctil física. |
| T-12 | Detalles utilizables. | Bloqueado | Falta verificar regiones pequeñas con dedo en los dispositivos físicos objetivo. |
| T-15 | Contornos protegidos. | Aprobado | Barrido completo de regiones no altera la máscara; toque sobre línea probado. |
| T-16 | Cambio de color fiable. | Aprobado | Recoloreado y repetición del mismo color comprobados en una región real. |
| T-17 | Pincel y borrador utilizables. | Aprobado | Punto, trazo largo, borrador y protección de líneas sólidas en navegador; tacto físico pendiente. |
| T-18 | Deshacer conserva la imagen. | Aprobado | Deshacer devuelve exactamente el estado previo en ambos motores y modos. |
| T-19 | Comportamiento equivalente por motor. | Pendiente | Worker/fallback equivalentes en navegador; Flutter físico pendiente cuando aplica. |
| T-20 | Guardado recuperable. | Aprobado | Comparación RGBA antes/después de recargar y recuperar; capa editable y PNG compuesto independientes. |
| T-21 | Obras independientes. | Aprobado | Obras A/B conservadas por slug y modo, comprobadas contra sus copias persistidas. |
| T-22 | PNG exportado comprobado. | Pendiente | PNG recibido, comparado RGBA y abierto con Pillow independiente; visor del sistema y dispositivos físicos pendientes. |
| T-23 | Salida repetible. | Pendiente | Tres PNG diferentes tras nuevas ediciones por modo/motor; alternativa de guardado físico pendiente. |
| T-24 | Base imprimible, si se ofrece. | Pendiente | Impresión física y salida de papel no comprobadas. |
| T-25 | Prueba real en los destinos ofrecidos. | Bloqueado | Faltan dispositivos físicos para toque, zoom/rotación y CPU/RAM; emulación no los sustituye. |
| T-26 | Escala, zoom y rotación. | Bloqueado | Faltan dispositivos físicos para toque, zoom/rotación y CPU/RAM; emulación no los sustituye. |
| T-27 | Respuesta aceptable en equipo modesto. | Bloqueado | Faltan dispositivos físicos para toque, zoom/rotación y CPU/RAM; emulación no los sustituye. |
| T-28 | Peso y memoria registrados. | Aprobado | Peso, dimensiones y SHA-256 por variante; tiempos de escritorio registrados, memoria móvil pendiente. |
| E-01 | Figura reconocible. | Aprobado | Figura y miniatura reconocibles y coherentes con el nombre. casa-4 conserva slug por compatibilidad y representa un cohete. |
| E-02 | Dificultad coherente. | Pendiente | Dificultad declarada medio; falta validar uso táctil y adecuación con el público previsto. |
| E-03 | Categoría y pack pertinentes. | Aprobado | Tema y categoría observados coherentes con el catálogo actual. |
| E-04 | Presentación limpia. | Aprobado | Figura, encuadre y miniatura revisados; títulos/créditos existentes conservados. No se evalúan permisos en CAT-04. |
| P-01 | Procedencia registrada. | Pendiente | No evaluado en CAT-04. CAT-02 continúa excluida; no se acredita procedencia ni permiso comercial. |
| P-02 | Uso previsto documentado. | Pendiente | No evaluado en CAT-04. CAT-02 continúa excluida; no se acredita procedencia ni permiso comercial. |
| P-03 | Personajes y marcas revisados. | Pendiente | No evaluado en CAT-04. CAT-02 continúa excluida; no se acredita procedencia ni permiso comercial. |
| P-04 | Selección coherente de publicación. | Pendiente | No evaluado en CAT-04. CAT-02 continúa excluida; no se acredita procedencia ni permiso comercial. |
