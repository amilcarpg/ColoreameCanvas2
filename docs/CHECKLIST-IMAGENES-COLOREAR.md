# PaintMe — Checklist de imágenes para colorear

Fecha: 07/10/2026. Usar una copia de este checklist por dibujo y versión. **Este documento define qué verificar; no certifica que las imágenes actuales hayan pasado las pruebas.**

Aplicación al catálogo actual: [resultados de los 62 dibujos, fichas y evidencias](RESULTADO-CHECKLIST-IMAGENES.md).

Basado en el [documento de análisis](audit-2026-10-03/INFORME-PAINTME.md), especialmente inventario, calidad gráfica, rendimiento y pipeline, y en [CAT-01 a CAT-04](PRODUCT-BACKLOG.md). Las pruebas de continuidad y dispositivos se complementan con [Pruebas pendientes](PRUEBAS-PENDIENTES.md). Se añaden criterios prácticos para detectar fugas, zonas imposibles de pintar y diferencias entre motores.

## Cómo usarlo

Marcar `[x]` únicamente cuando se cumpla el resultado esperado y exista evidencia. Registrar **Pendiente**, **Aprobado**, **Fallido**, **Bloqueado** o **No aplica** por control; «No aplica» necesita un motivo. Probar la variante que realmente usa el editor, después de cualquier reducción u optimización, además de conservar el maestro.

Los controles **T** son obligatorios para aprobar el funcionamiento en cada plataforma/modo ofrecido; los **E** evalúan la adecuación editorial; los **P** condicionan la publicación y el uso comercial. Una imagen puede funcionar técnicamente y seguir pendiente de publicación por procedencia o calidad editorial.

## Ficha del dibujo

| Campo | Valor a completar |
|---|---|
| Nombre y slug estable | |
| Versión del dibujo / commit o revisión local | |
| Maestro y variantes web, miniatura y Flutter | |
| Dimensiones y peso de cada variante | |
| Categoría, pack y dificultad prevista | |
| Público previsto | La propuesta inicial de 4–7 años del análisis es una hipótesis, no una edad validada. |
| Plataformas/modos que se ofrecerán | Web balde / web pincel / Flutter balde, pincel y borrador, según alcance. |
| Autor, fuente y evidencia de permiso | |
| Responsable y fecha de revisión | |

## 1. Archivo, variantes y catálogo

- [ ] **T-01 · PNG real y legible.** El archivo se decodifica como PNG, tiene ancho/alto mayores que cero y contiene un dibujo visible. Una extensión `.png` o un archivo totalmente transparente no bastan. Debe abrirse en el editor y en un visor independiente.
- [ ] **T-02 · Rutas disponibles.** Maestro, imagen para pintar y miniatura existen en las rutas registradas. En web se sirven correctamente desde el entorno de prueba; en Flutter el asset está incluido en el paquete y se carga. Comprobar mayúsculas/minúsculas para evitar rutas que solo funcionan en Windows.
- [ ] **T-03 · Resolución adecuada.** La variante web tiene lado mayor ≤1200 px y la miniatura ≤360 px, según el criterio del proyecto. El maestro conserva resolución para regenerar variantes. La variante móvil carga sin problemas y se registra su resolución; no asumir que Flutter reduce automáticamente a 1200 px.
- [ ] **T-04 · Proporción y encuadre conservados.** Maestro y variantes muestran el mismo dibujo, sin estirar, recortar líneas ni perder detalles. Entre imagen web y miniatura, diferencia de ancho/alto ≤0,01, como en el check existente. Revisar también visualmente el resultado.
- [ ] **T-05 · Identidad y metadatos correctos.** Slug único y estable; nombre y rutas apuntan al dibujo correcto. En web comprobar `label`, `slug`, `category`, `src` y `thumbnailSrc`; en el maestro `file`; en Flutter los campos que consume su catálogo, incluido `asset`. Documentar diferencias intencionales entre plataformas.
- [ ] **T-06 · Selección real correcta.** Abrir desde miniatura, selector y enlace directo cuando exista: todos muestran la misma imagen. Buscarla o filtrar su categoría permite encontrarla; ningún enlace abre otro dibujo.

## 2. Preparación gráfica y contornos

- [ ] **T-07 · Base sin colorear.** Líneas oscuras sobre áreas blancas o transparentes que el editor interprete correctamente. Sin colores previos, degradados, sombras, textura ni compresión que conviertan zonas para pintar en zonas protegidas. El modo pincel acepta la imagen como blanco y negro.
- [ ] **T-08 · Contornos cerrados donde corresponde.** Cada zona que debe rellenarse por separado tiene un perímetro continuo en la variante final. Revisar uniones, curvas, esquinas y contactos diagonales al tamaño del editor y con zoom. Las conexiones intencionales están documentadas.
- [ ] **T-09 · Líneas resistentes a la reducción.** Después de escalar a la resolución de uso, las líneas siguen siendo visibles y protegen las regiones. No desaparecen trazos finos ni aparecen huecos. No hay un grosor universal obligatorio: la prueba de relleno decide si el contorno funciona.
- [ ] **T-10 · Interiores realmente pintables.** Las áreas destinadas a colorear no tienen manchas grises, ruido ni rellenos oscuros que la máscara trate como líneas. Ojos u otros detalles negros intencionales están identificados y no se cuentan como regiones pintables.
- [ ] **T-11 · Bordes y transparencia correctos.** El fondo exterior y las zonas transparentes tienen el comportamiento previsto al pintar y exportar. No aparecen halos, cajas inesperadas o partes del dibujo cortadas en el borde del lienzo. Anotar si el fondo debe ser coloreable.
- [ ] **T-12 · Detalles utilizables.** Las zonas relevantes se pueden seleccionar con el dedo en el dispositivo objetivo, usando el zoom disponible cuando haga falta. No quedan regiones importantes imposibles de tocar o tan estrechas que solo se pintan por accidente.

**Por qué probar cada motor:** el balde web protege píxeles según brillo y alfa; el pincel web construye su propia capa de líneas; Flutter usa otra regla de máscara. Un gris o una línea semitransparente puede comportarse de forma distinta. Aprobar un modo no aprueba automáticamente los demás.

## 3. Prueba de coloreado

Preparar una captura con las regiones pintables numeradas y el resultado esperado. Incluir todas las regiones independientes, el fondo si corresponde y conexiones intencionales. Usar colores contrastantes en regiones vecinas.

- [ ] **T-13 · Cobertura completa con balde.** Rellenar cada región desde un punto interior: ocupa toda el área esperada, sin huecos injustificados. Inspeccionar especialmente la región mayor, la menor, zonas estrechas y regiones junto al borde. Registrar regiones probadas/total; una muestra parcial no aprueba el dibujo completo.
- [ ] **T-14 · Sin fugas.** Al pintar una región no se colorean regiones vecinas ni el exterior, salvo conexiones documentadas. Repetir cerca de las uniones sospechosas. Si dos partes deben compartir color por estar conectadas, dejarlo explícito en el mapa.
- [ ] **T-15 · Contornos protegidos.** Tocar una línea no la recolorea ni inicia una fuga. Pintar junto al borde conserva el contorno y no deja una franja visible de píxeles sin pintar que arruine el resultado.
- [ ] **T-16 · Cambio de color fiable.** Rellenar una región, cambiarla a otro color y repetir el mismo color. El cambio afecta la región esperada, conserva las vecinas y no bloquea herramientas ni produce restos inesperados.
- [ ] **T-17 · Pincel y borrador utilizables.** Hacer un punto, un trazo largo y trazos con distintos grosores; cruzar una línea y borrar parte del color. Los contornos permanecen visibles y protegidos, el borrador elimina el color añadido y el dibujo base se conserva.
- [ ] **T-18 · Deshacer conserva la imagen.** Deshacer un relleno y un trazo devuelve el estado anterior, con líneas y colores correctos. Si se ofrece recuperación de reinicio, comprobarla dentro del historial disponible; no asumir que existe después de recargar.
- [ ] **T-19 · Comportamiento equivalente por motor.** En web comparar balde con worker y con fallback usando la misma imagen y secuencia. Si también se ofrece en Flutter, repetir allí las regiones críticas y las herramientas disponibles. Registrar diferencias; no exigir igualdad de renderizado entre plataformas, sí ausencia de fugas y pérdida de contenido.

## 4. Guardado, recuperación y salida

- [ ] **T-20 · Guardado recuperable.** Pintar con varios colores, esperar confirmación del guardado local, recargar o reabrir y recuperar. La obra conserva el dibujo, la escala, los colores y su alineación con los contornos.
- [ ] **T-21 · Obras independientes.** Pintar A, cambiar a B, pintar B y volver a A. Cada obra queda asociada al slug y modo correctos. Comprobar cada modo por separado; la transferencia entre editores depende de que esa función esté implementada.
- [ ] **T-22 · PNG exportado comprobado.** Descargar el resultado y abrir el archivo recibido en un visor externo. Dimensiones iguales a las del lienzo exportado, todos los colores y capas presentes, líneas legibles y fondo previsto. Un mensaje de «PNG preparado» no demuestra que se recibió el archivo.
- [ ] **T-23 · Salida repetible.** Descargar tres veces después de seguir pintando: cada PNG contiene el estado correspondiente y no está vacío, corrupto o desfasado. En móvil comprobar también la alternativa de vista previa cuando sea necesaria.
- [ ] **T-24 · Base imprimible, si se ofrece.** Imprimir o revisar la salida prevista para papel: dibujo completo, proporción correcta, márgenes suficientes y líneas legibles. Usar el maestro o una variante específica si la resolución de pantalla resulta insuficiente; no dar por aprobada la impresión por exportar un PNG.

## 5. Pantallas y rendimiento

- [ ] **T-25 · Prueba real en los destinos ofrecidos.** El dibujo abre, se pinta y exporta en escritorio y en los dispositivos móviles incluidos en soporte. Registrar navegador/SO/modelo. Un viewport móvil o WebKit automatizado no acredita Chrome Android o Safari iOS físicos.
- [ ] **T-26 · Escala, zoom y rotación.** En pantalla estrecha, tablet y escritorio no se deforma ni pierde partes. Después de zoom, desplazamiento o rotación, los toques siguen coincidiendo con la región visible y la obra se conserva.
- [ ] **T-27 · Respuesta aceptable en equipo modesto.** Medir carga, región mayor y veinte trazos/rellenos con la variante real, incluyendo un Android de 2–3 GB si está en soporte. Objetivos propuestos por el análisis: respuesta visual <100 ms al toque, operación grande <500 ms o progreso visible, sin bloqueo >1 s ni cierre. Son objetivos por medir, no resultados obtenidos.
- [ ] **T-28 · Peso y memoria registrados.** Anotar KB/MB y dimensiones por variante, tiempo de carga y memoria cuando se pueda medir. Optimizar si la carga o el editor falla en el equipo objetivo, conservando contornos. No se fija un límite de peso arbitrario: el tamaño comprimido no describe por sí solo la memoria del canvas.

Probar el **100% de las imágenes elegidas en sus modos ofrecidos**. La matriz física completa puede organizarse por lote con dibujos simples, complejos, de resolución máxima y con transparencia; registrar cuáles se usaron. Todo dibujo con un problema particular se vuelve a probar en el dispositivo afectado. Una prueba de lote no equivale a una prueba física individual.

## 6. Calidad editorial

- [ ] **E-01 · Figura reconocible.** La miniatura y el dibujo abierto representan claramente el mismo tema. Sin partes cortadas, objetos incoherentes ni defectos accidentales de anatomía o perspectiva que dificulten entenderlo.
- [ ] **E-02 · Dificultad coherente.** Cantidad y tamaño de regiones adecuados al nivel declarado. Para el piloto sencillo, preferir formas amplias y detalles manejables; registrar complejidad y no atribuir beneficios educativos sin evidencia.
- [ ] **E-03 · Categoría y pack pertinentes.** Tema, título y descripción coinciden con lo visible. No clasificar casas como vehículos o paisajes como animales por una asignación heredada.
- [ ] **E-04 · Presentación limpia.** Encuadre equilibrado, espacio suficiente para pintar y ausencia de marcas de agua, publicidad, texto accidental o firmas que interfieran con la actividad. La miniatura permite distinguirlo de otros dibujos.

## 7. Procedencia y autorización de uso

- [ ] **P-01 · Procedencia registrada.** Autor/fuente, fecha, versión y evidencia archivados por imagen. Si se creó mediante generación, conservar la referencia de creación y revisar los elementos reconocibles; «generada» o «descargada» no basta para aprobarla.
- [ ] **P-02 · Uso previsto documentado.** Registrar permiso aplicable a publicar, adaptar, distribuir, imprimir y comercializar según los usos ofrecidos, además de atribución o restricciones. Cuando falta evidencia, dejar pendiente la autorización; esta casilla no sustituye la validación del responsable.
- [ ] **P-03 · Personajes y marcas revisados.** Cualquier personaje o marca reconocible tiene evidencia de autorización para el uso previsto. El análisis dejó pendiente la evidencia del grupo Gabby; ese antecedente no demuestra autorización ni infracción.
- [ ] **P-04 · Selección coherente de publicación.** La decisión registrada se aplica a catálogo, miniaturas, fichas, packs y salidas comerciales. Un dibujo técnicamente aprobado con permisos pendientes no entra en una salida comercial como autorizado.

## Diagnosticar un fallo sin culpar al archivo automáticamente

| Síntoma | Comprobación siguiente |
|---|---|
| Un relleno sale de su región | Revisar continuidad y máscara del contorno en la variante final; comparar otros motores. |
| Una región amplia queda incompleta | Probar una región sintética conocida y worker/fallback; puede fallar el algoritmo. W2 fue corregido en los cambios locales documentados del 07/10, pero hay que identificar la versión probada. |
| El pincel rechaza la imagen | Revisar formato real, presencia de color y variante cargada. |
| Una zona gris no se deja pintar | Inspeccionar si el motor la considera línea; limpiar el área o corregir su definición gráfica. |
| Pintar funciona, pero guardar/exportar falla | Probar otro dibujo conocido en el mismo entorno; revisar almacenamiento, exportación y versión del editor. |
| La copia recuperada queda desalineada | Comparar dimensiones, versión del asset y slug; revisar compatibilidad con obras anteriores. |

## Registro de resultados y decisión

Guardar evidencia fuera de los assets públicos, por ejemplo `docs/qa-evidence/<fecha>/<slug>/`: mapa de regiones, captura inicial, resultado pintado, PNG exportado y tiempos medidos. Usar dibujos de prueba del evaluador.

| Control | Plataforma / modo / dispositivo | Estado | Resultado observado y evidencia | Incidencia / acción |
|---|---|---|---|---|
| T-01 | | Pendiente | | |
| … añadir una fila por control y entorno … | | | | |

**Decisión por imagen:**

- [ ] **Aprobada técnicamente:** todos los T aplicables aprobados con evidencia, en el alcance registrado. No aprobar con regiones pendientes, fugas, pérdida de contornos, recuperación incorrecta o PNG exportado sin verificar.
- [ ] **Aprobada editorialmente:** todos los E aprobados, o excepciones justificadas por el responsable.
- [ ] **Autorizada para el uso previsto:** todos los P aplicables aprobados con evidencia validada por el responsable.
- [ ] **Lista para incorporar al catálogo:** se cumplen las tres decisiones anteriores para el uso y plataformas elegidos.

Si falta una prueba, equipo o evidencia, registrar **Pendiente/Bloqueada**. Si hay un defecto reproducido, registrar **Requiere corrección** y volver a comprobar los controles afectados después del cambio. Cambiar resolución, contornos, transparencia o el motor de pintura exige revisar nuevamente las pruebas que dependan de ese cambio.

Firma/responsable: ____________________ · Fecha: ____________________ · Alcance aprobado: ____________________
