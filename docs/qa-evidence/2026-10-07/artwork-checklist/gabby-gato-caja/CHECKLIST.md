# Gabby gato caja — gabby-gato-caja

Revisión local: 07/10/2026. Responsable: Codex (comprobaciones automáticas y revisión visual).

**Decisión técnica: requiere corrección.** Fallo del editor al recuperar pincel; además, ver controles fallidos propios del dibujo. **Publicación: pendiente de autorización.**

## Archivos comprobados

| Variante | Dimensiones | KB | Archivo |
|---|---:|---:|---|
| master | 1707×2560 | 282.0 | [gabby-16-gato-caja.png](../../../../../base_png/gabby-16-gato-caja.png) |
| web | 800×1200 | 227.4 | [gabby-16-gato-caja.png](../../../../../web/assets/gabby/gabby-16-gato-caja.png) |
| thumbnail | 240×360 | 45.0 | [gabby-16-gato-caja.png](../../../../../web/assets/thumbs/gabby-16-gato-caja.png) |

## Hallazgos

- Fallo compartido del editor: recuperación de pincel altera bordes suavizados.
- Título de marca y sitio en el pie. No eliminar créditos sin resolver condiciones de uso; preferir original autorizado.

## Resultados de recuperación y descarga

| Motor | Balde: píxeles cambiados al recuperar | Pincel: píxeles cambiados | Delta máximo por canal en pincel | Descargas PNG exactas |
|---|---:|---:|---:|---:|
| chromium | 0 | 23973 | 38 | 6/6 |
| webkit | 0 | 23973 | 38 | 6/6 |

Regiones geométricas: **136**; menores de 16 px: **29**. Barrido: 0 píxeles discrepantes y 0 píxeles de contorno dañados. Esto prueba el algoritmo sobre la máscara; no valida qué zonas debían estar conectadas.

[Mapa numerado](regions-chromium.png) · [Pincel antes de recuperar](brush-chromium-before-restore.png) · [Pincel recuperado/exportado](brush-chromium-export.png) · [Balde exportado](paint-chromium-export.png)

## Checklist aplicado

| ID | Control | Estado | Evidencia / limitación |
|---|---|---|---|
| T-01 | PNG real y legible. | Aprobado | Todas las variantes decodificadas por Pillow; contenido visible y carga en ambos editores web, Chrome y WebKit. |
| T-02 | Rutas disponibles. | Aprobado | Rutas y maestros presentes; imagen y miniatura decodificadas; carga web comprobada. |
| T-03 | Resolución adecuada. | Aprobado | Web ≤1200 px, miniatura ≤360 px; dimensiones y peso registrados para maestro y variante móvil cuando existe. |
| T-04 | Proporción y encuadre conservados. | Aprobado | Diferencia web/miniatura=0.000000; maestro/web=0.000130. Variantes iguales al generador en contenido: 11 archivos difieren en codificación PNG, con los mismos píxeles. Revisión visual de hojas de contacto. |
| T-05 | Identidad y metadatos correctos. | Aprobado | 62 slugs únicos; metadatos y recursos coherentes en el generador. 43 Flutter y 19 solo web declarados explícitamente. |
| T-06 | Selección real correcta. | Aprobado | Enlace directo en Chrome/WebKit; selección desde miniatura y evento del selector en Chrome, en ambos modos. |
| T-07 | Base sin colorear. | Aprobado | Sin píxeles de color por el criterio de canales; PNG aceptado por pincel. Esto no aprueba ruido gris ni procedencia. |
| T-08 | Contornos cerrados donde corresponde. | Pendiente | Mapa de conectividad generado y revisado visualmente; falta validar mapa de regiones esperadas y conexiones intencionales. No se certifica cada contorno por una prueba del algoritmo. |
| T-09 | Líneas resistentes a la reducción. | Pendiente | Variante final probada; falta comparar continuidad de todos los contornos con el maestro y aprobar las conexiones previstas. |
| T-10 | Interiores realmente pintables. | Pendiente | 136 regiones detectadas, 29 de menos de 16 píxeles. No se certifica intención de cada detalle negro/gris; revisar regiones pequeñas antes de aprobar. |
| T-11 | Bordes y transparencia correctos. | Pendiente | Sin transparencia en la variante web; revisar si el exterior debe ser pintable y los márgenes. La salida PNG conserva el fondo del lienzo. |
| T-12 | Detalles utilizables. | Bloqueado | Falta prueba con dedo en el dispositivo físico objetivo; las métricas de regiones no prueban facilidad de toque. |
| T-13 | Cobertura completa con balde. | Pendiente | Algoritmo recorrió las 136 regiones geométricas: 0 píxeles discrepantes. Falta aprobar regiones esperadas; conectividad correcta no demuestra intención gráfica. |
| T-14 | Sin fugas. | Pendiente | Mapas revisados; sin certificación completa de fugas hasta aprobar el mapa esperado. |
| T-15 | Contornos protegidos. | Aprobado | Todos los píxeles de máscara intactos en el barrido; toque sobre línea protegido en Chrome. Franja interior pendiente de revisión visual detallada. |
| T-16 | Cambio de color fiable. | Aprobado | Relleno y repetición del mismo color ejecutados en una región interior real, Chrome. |
| T-17 | Pincel y borrador utilizables. | Aprobado | Punto y borrador en Chrome/WebKit; trazo largo de 32 px cruzando líneas y borrado de 64 px en Chrome. Contornos negros sólidos intactos; no acredita gestos físicos ni todo grosor posible. |
| T-18 | Deshacer conserva la imagen. | Aprobado | Deshacer devuelve el lienzo inicial exactamente en balde y pincel, ambos motores. Recuperación de reinicio no ejercitada por imagen. |
| T-19 | Comportamiento equivalente por motor. | Aprobado | Worker y fallback idénticos en la región seleccionada, Chrome y WebKit; barrido geométrico con motor compartido. |
| T-20 | Guardado recuperable. | Fallido | Balde recuperado exactamente; pincel cambia píxeles al recuperar. Ver métricas por motor y PNG antes/después. El registro guardado sí coincide con el lienzo previo: el cambio ocurre al reconstruirlo. |
| T-21 | Obras independientes. | Aprobado | Pintar A→pintar B→volver A; copias de ambos slugs coinciden con sus capturas independientes, por modo, Chrome. No implica recuperación visual correcta del pincel. |
| T-22 | PNG exportado comprobado. | Pendiente | Parte automatizada aprobada: PNG recibido, decodificado y comparado píxel a píxel con el lienzo al descargar. Conserva el estado posterior a recuperar; no corrige T-20. Falta apertura independiente en visor del sistema por imagen/dispositivo. |
| T-23 | Salida repetible. | Pendiente | Tres descargas consecutivas exactas por modo y motor; no se modificó la obra entre esas tres descargas. Faltan esa variante del caso y la alternativa física móvil. |
| T-24 | Base imprimible, si se ofrece. | Pendiente | No se imprimió ni se aprobó una variante destinada a papel. |
| T-25 | Prueba real en los destinos ofrecidos. | Bloqueado | Escritorio automatizado Chrome y WebKit aprobado para carga/coloreado/exportación. Faltan Android/iPhone/iPad físicos y app Flutter. |
| T-26 | Escala, zoom y rotación. | Bloqueado | Esta ejecución por imagen usa 1280×900; no se probó rotación física, zoom ni desplazamiento por imagen. |
| T-27 | Respuesta aceptable en equipo modesto. | Bloqueado | Hay tiempos de escritorio por imagen, pero falta equipo modesto y perfil de memoria. No compararlos como si fueran mediciones de Android. |
| T-28 | Peso y memoria registrados. | Aprobado | Dimensiones, KB y SHA-256 por variante; tiempos de carga y barrido registrados. Memoria pendiente en T-27. |
| E-01 | Figura reconocible. | Aprobado | Revisión visual de dibujo/miniatura en hojas de contacto: tema principal reconocible. No es una valoración pedagógica. |
| E-02 | Dificultad coherente. | Pendiente | Falta validar dificultad con el público previsto. Nivel por-revisar en catálogo. |
| E-03 | Categoría y pack pertinentes. | Aprobado | Categoría/pack revisados visualmente con la taxonomía actual; casas y paisajes tienen categorías propias. |
| E-04 | Presentación limpia. | Fallido | Título de marca y sitio en el pie. |
| P-01 | Procedencia registrada. | Pendiente | Sin autor/fuente/evidencia por asset en el maestro. Créditos impresos son indicios de fuente, no un registro validado. |
| P-02 | Uso previsto documentado. | Bloqueado | Falta evidencia y validación del responsable para los usos previstos. |
| P-03 | Personajes y marcas revisados. | Bloqueado | Personajes o marcas reconocibles; falta acreditar permiso. |
| P-04 | Selección coherente de publicación. | Pendiente | No se aplicó una selección comercial ni se publicaron/excluyeron archivos; falta decisión acreditada de autorización. |
