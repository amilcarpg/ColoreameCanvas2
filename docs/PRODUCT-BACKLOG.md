# PaintMe — Product backlog técnico

Creado: 07/10/2026. Fuente: [diagnóstico del 03/10/2026](audit-2026-10-03/INFORME-PAINTME.md) y revisión local del 07/10/2026.

Este archivo reúne las recomendaciones que se pueden implementar o verificar mediante código: web, Flutter, herramientas de contenido, configuración, pruebas y CI. Registra el plan y el estado de ejecución; sus entradas no autorizan publicar, activar anuncios, procesar pagos o enviar comunicaciones.

## Prioridades, estado y alcance

[Plan de ejecución de los ítems 21–31 y sus dependencias](PLAN-ITEMS-21-31.md). Incluye MOB-02 como requisito de MOB-01; mantiene CAT-02 excluida y las ramas comerciales/inglés condicionadas. Planificar no cambia el estado de las tareas.

- **P0:** fiabilidad básica; bloqueante de monetización o publicación cuando así se indica. Una tarea P0 móvil no desplaza automáticamente al núcleo web.
- **P1:** experiencia y soporte técnico de la validación del negocio.
- **P2:** mejoras posteriores o ramas condicionadas a uso, demanda y presupuesto.
- **Hecho:** criterios técnicos verificados; evidencia y límites registrados.
- **Pendiente:** falta implementar o verificar el alcance.
- **Parcial:** hay implementación local, pero falta completar criterios de aceptación.
- **Condicional:** preparar/ejecutar solo al cumplir la dependencia externa o el hito indicado.
- **Pospuesto:** fuera del alcance actual por decisión del usuario; no iniciar ni reactivar automáticamente al cumplirse otras dependencias. Requiere una nueva indicación para retomarlo.

Las estimaciones son orientativas para alguien familiarizado con el proyecto; incluyen implementación y verificación técnica básica, tienen incertidumbre y se solapan. No se deben sumar como compromiso de 90 días. Las pruebas físicas y de usuarios requieren disponibilidad adicional.

Quedan fuera como tareas de código: escoger país del operador/mercados/edades, acreditar derechos, obtener dictamen jurídico, aprobación AdSense/AdMob/tiendas, entrevistar o reclutar personas, distribuir contenidos, crear ilustraciones y validar precio/ventas. Sí se incluyen los mecanismos técnicos necesarios para aplicar esas decisiones. Tener el código listo no resuelve esas dependencias externas.

## Decisión de alcance del 07/10/2026 — Versiones vendibles pospuestas

Por indicación del usuario, no se atenderán por ahora la creación de ofertas de pago, el cobro/entrega ni una versión vendible sin publicidad. Se conservan las tareas y sus dependencias como referencia futura, sin asignar fecha ni esfuerzo al plan actual.

| Ítem | ID | Alcance pospuesto |
|---:|---|---|
| 43 | COM-01 | Oferta original de pago, muestra, precio, licencia y entrega comercial. |
| 44 | COM-02 | Integración de cobro y entrega de productos vendidos. |
| 45 | COM-03 | Compra o versión de pago para quitar anuncios móvil. |

Los botones, recorridos y pruebas específicos de esas ventas/compras también quedan fuera del trabajo actual. Las mejoras de impresión gratuita, exportación, privacidad, guardado y fiabilidad mantienen su alcance técnico. COM-04 conserva su condición de compartir un enlace opcional y no exige una venta. El trabajo ya realizado se conserva; las tres tareas solo se retomarán cuando el usuario lo solicite expresamente.

## Estado comprobado al preparar el backlog

Se ejecutó en modo de lectura `node docs/audit-2026-10-03/checks.cjs`:

- Los siete JavaScript principales pasan comprobación de sintaxis.
- `web/app-utils.js` ya expone `window.PaintMe` y sus helpers. **W1 está parcialmente resuelto localmente**; faltan recorridos reales de paletas, navegación y guardado en ambos editores.
- **W2 continúa:** el worker pinta 36/100, 2.607/10.000 y 361.274/1.440.000 píxeles en las regiones blancas del diagnóstico.
- Los recursos de los catálogos existen, sin slugs web duplicados ni exceso de dimensiones en esos checks. Se mantienen 62 dibujos web y 43 móvil/maestros; hay 19 exclusivos web.
- El helper local difiere de la copia de producción archivada el 03/10. Esto no comprueba el despliegue público actual.
- Flutter conserva una cola de mutaciones en storage, pero sigue sobrescribiendo archivos y sus lecturas pueden reescribir el índice. No se ejecutaron analyzer, tests ni builds móviles para preparar este documento.

Los resultados JSON archivados corresponden a la auditoría original; no se sobrescribieron. Las tareas se cierran con evidencia nueva.

## Ejecución del 07/10/2026

Continuación MAINT-01/DATA-02/SEO-03 solicitada explícitamente: refactorización compartida y piloto gratuito inglés implementados; GA4/Firebase preparados y apagados hasta completar configuración y verificación externas. Pasaron 50 pruebas web, 78 por navegador (Chromium/WebKit), 32 Flutter y analyzer; APK debug con Firebase desactivado compilado e inspeccionado. [Resultados, alcance y pendientes](implementation-2026-10-07/maint-data-seo3.md). Esta autorización abrió el piloto inglés; las ofertas vendibles siguen pospuestas.

WEB-01, WEB-02, QA-01, WEB-03 y WEB-04 atendidos localmente. Pasaron 29 tests de lógica, 14 de navegador y la prueba de que W1/W2 hacen fallar el gate. Se documentan 20 recorridos de restauración, cambios rápidos y cierre/reapertura. Sin publicación. [Evidencia y límites](implementation-2026-10-07/web-first-five.md).

El estado inicial de arriba corresponde al momento de crear el documento y se conserva como referencia histórica; el worker ya fue reparado.

Tareas 6–10 atendidas localmente: WEB-05, WEB-09 y WEB-08 cerradas; WEB-06 y QA-02 parciales por QA física y, en QA-02, PRIV-01. La suite ampliada pasa 34 tests de lógica, 47 en Chrome y 47 en WebKit. Sin publicación. [Cambios, matriz y evidencia](implementation-2026-10-07/web-six-ten.md).

Ítems 11–20 atendidos localmente excepto CAT-02, excluida por instrucción del usuario. WEB-11 y CAT-03 cierran su alcance técnico; las otras siete tareas conservan **Parcial** por validación física, humana o dependencias concretas. Pasaron 38 pruebas de lógica, ocho del pipeline, 66 completas por navegador y tres comprobaciones finales por navegador. [Implementación y evidencia](implementation-2026-10-07/web-eleven-twenty.md).

Plan 21–31 ejecutado en su alcance local disponible, con MOB-02 como dependencia: PRIV-01 y DATA-01 hechos técnicamente, ocho ítems parciales, MOB-02 parcial y SEO-03 condicionado. CAT-02 sigue excluida. Pasaron 44 tests Node, 71 por navegador, ocho Python y doce del núcleo móvil; no se publicaron cambios. [Resultados y dependencias restantes](implementation-2026-10-07/items-21-31.md).

Continuación de la lista restante: WEB-07, MOB-09, MOB-10, QA-03 y DOC-01 completados técnicamente; demás ítems atendidos conservan **Parcial** por criterios físicos, nativos o remotos pendientes. Pasaron 45 tests Node, 75 por motor de navegador, 24 Flutter y doce de núcleo móvil. CAT-02 excluida y COM-01/02/03 pospuestos. [Cambios y límites de esta entrega](implementation-2026-10-07/remaining-code.md).

## Épica 1 — Motor, guardado y continuidad web

### WEB-01 — Validar integración del objeto compartido
**P0 · Hecho · 1–2 h · Origen W1**  
**Cierre 07/10/2026:** implementado y verificado; ver [cambios, pruebas y límites](implementation-2026-10-07/web-first-five.md).
**Archivos:** [app-utils.js](../web/app-utils.js), [paint.js](../web/paint.js), [brush.js](../web/brush.js).  
**Trabajo:** conservar la exposición local de `window.PaintMe`, verificar orden de carga y uso de helpers en ambos editores; manejar de forma clara una dependencia ausente.  
**Aceptación:** Base y otras paletas funcionan; Siguiente cambia dibujo; Sorpresa evita repetir cuando hay alternativas; guardar/restaurar invocan los helpers; regresión de exposición cubierta.  
**Dependencias:** ninguna. No cerrar solo por pasar la prueba VM.

### WEB-02 — Corregir la cola del flood fill y validar fallback
**P0 · Hecho · 3–6 h · Origen W2**  
**Cierre 07/10/2026:** implementado y verificado; ver [cambios, pruebas y límites](implementation-2026-10-07/web-first-five.md).
**Archivos:** [paint-worker.js](../web/paint-worker.js), [paint.js](../web/paint.js).  
**Trabajo:** evitar encolar repetidamente un píxel, con capacidad acotada; comprobar dimensiones, coordenadas, buffer y máscara antes de procesar. Revisar equivalencia del algoritmo sin worker.  
**Aceptación:** regiones blancas 10×10, 100×100 y 1200×1200 se rellenan al 100%; contornos y regiones aisladas permanecen intactos; bordes, tolerancia, mismo color y coordenadas inválidas se manejan; worker y fallback producen el mismo resultado esperado.

### WEB-03 — Hacer robusto IndexedDB y su fallback
**P0 · Hecho · 3–6 h · Origen C/T1**  
**Cierre 07/10/2026:** implementado y verificado; ver [cambios, pruebas y límites](implementation-2026-10-07/web-first-five.md).
**Archivos:** [app-utils.js](../web/app-utils.js).  
**Trabajo:** manejar apertura bloqueada, timeout, excepciones, abortos y cuotas; cerrar conexiones. Corregir migración/fallback para no eliminar el único backup ni reemplazar un registro más reciente por uno viejo.  
**Aceptación:** guardar, cargar y borrar terminan con resultado explícito cuando IndexedDB falta o falla; localStorage indisponible no rompe el editor; migración conserva datos hasta confirmar persistencia; se restaura la versión más reciente y se puede volver a guardar después de un fallo.  
**Dependencias:** WEB-01.

### WEB-04 — Guardar antes de cambiar dibujo, modo o salir
**P0 · Hecho · 3–6 h · Origen C/T1/U2**  
**Cierre 07/10/2026:** implementado y verificado; ver [cambios, pruebas y límites](implementation-2026-10-07/web-first-five.md). Chrome automatizado; QA física Android/iOS pendiente.
**Archivos:** [paint.js](../web/paint.js), [brush.js](../web/brush.js), [app-utils.js](../web/app-utils.js).  
**Trabajo:** capturar slug/modo/revisión de la obra al programar autosave; serializar escrituras y descartar callbacks obsoletos. Guardar antes de navegación interna y preparar recuperación al ocultar/salir, sin depender de un await en el cierre del navegador.  
**Aceptación:** cambiar antes de 450 ms no guarda la obra bajo otro slug; un resultado antiguo no cambia el estado de la obra nueva; cierre inmediato, cambio rápido y restauración se prueban; si el navegador impide persistir se comunica la limitación sin afirmar éxito.  
**Dependencias:** WEB-03.

### WEB-05 — Mostrar estado real de guardado y recuperación
**P0 · Hecho · 2–4 h · Origen C/UX guardado**  
**Ejecución 07/10/2026:** Estado persistente y reintento; recuperación validada y 20 recorridos por motor sin pérdida. Ver [evidencia y límites](implementation-2026-10-07/web-six-ten.md).
**Archivos:** editores JS/HTML/CSS.  
**Trabajo:** distinguir “guardando”, “guardado en este dispositivo”, “falló” y “descargar PNG”; ofrecer continuar y reintentar; proteger carga/restauración asíncrona con identidad del dibujo.  
**Aceptación:** éxito solo después de persistir; restaurar A y abrir B no sobrescribe B; datos corruptos permiten seguir pintando; completar 20 recorridos pintar→deshacer→guardar→recargar→restaurar sin pérdida.  
**Dependencias:** WEB-03/04.

### WEB-06 — Verificar y ajustar exportación PNG
**P0 · Parcial · 2–4 h · Origen C/exportación IP**  
**Ejecución 07/10/2026:** Descarga y alternativa verificadas en Chrome/WebKit automatizados; falta Chrome Android y Safari iOS físicos. Ver [evidencia y límites](implementation-2026-10-07/web-six-ten.md).
**Archivos:** [paint.js](../web/paint.js), [brush.js](../web/brush.js).  
**Trabajo:** manejar `toBlob` nulo/error, descarga repetida, nombre de archivo y liberación de object URL compatible con navegadores objetivo; ofrecer alternativa si corresponde.  
**Aceptación:** archivos exportados abren con dimensiones, contornos y colores correctos en Chrome escritorio/Android y Safari iOS; la UI maneja el fallo; el evento distingue intención/archivo preparado de una descarga que el navegador no permite confirmar.  
**Dependencias:** WEB-01/02. Requiere dispositivos/navegadores reales para cerrar QA.

### WEB-07 — Conservar contexto al cambiar entre balde y pincel
**P1 · Hecho · 3–6 h · Origen U2**  
**Continuación 07/10/2026:** Enlaces seguros preservan asset/categoría, guardan antes del cambio y muestran aviso cancelable sobre obras independientes por herramienta; ida/vuelta sin pérdida probada en Chromium y WebKit. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** editores JS/HTML, helpers.  
**Trabajo:** transferir asset y contexto en enlaces; elegir transferencia compatible de la obra o un aviso explícito con opción de guardar antes del cambio. No fusionar formatos incompatibles sin comprobarlos.  
**Aceptación:** cambiar modo abre el mismo dibujo y conserva o explica de forma clara el estado de la obra; no se pierde trabajo silenciosamente; ida y vuelta probadas.  
**Dependencias:** WEB-04/05/06.

### WEB-08 — Reinicio seguro y recuperación del borrado
**P1 · Hecho · 2–4 h · Origen U2/UX herramientas**  
**Ejecución 07/10/2026:** Confirmación, cancelación y recuperación con Deshacer verificadas; no es recuperación persistente después de recargar. Ver [evidencia y límites](implementation-2026-10-07/web-six-ten.md).
**Archivos:** ambos editores.  
**Trabajo:** pedir confirmación cuando hay trabajo, permitir cancelar y recuperar el estado previo mediante deshacer o respaldo; coordinar reinicio con autosave.  
**Aceptación:** un toque accidental no elimina definitivamente la obra; cancelar no cambia nada; confirmar y recuperar funcionan; no reaparece un guardado anterior por una carrera.  
**Dependencias:** WEB-04/05.

### WEB-09 — Evitar carreras entre relleno, carga y acciones
**P1 · Hecho · 3–6 h · Origen auditoría motor**  
**Ejecución 07/10/2026:** Operaciones coordinadas, callbacks obsoletos descartados y recuperación ante fallos/timeout del worker y carga. Ver [evidencia y límites](implementation-2026-10-07/web-six-ten.md).
**Archivos:** [paint.js](../web/paint.js), [brush.js](../web/brush.js), worker.  
**Trabajo:** serializar o bloquear acciones incompatibles durante una operación; invalidar resultados al cambiar asset/revisión; recuperar estado ante error del worker/fetch/decode.  
**Aceptación:** relleno seguido de deshacer, reset, restauración o cambio rápido no aplica resultados a otro estado; fallo de worker activa fallback o error recuperable sin bloquear actividad.  
**Dependencias:** WEB-02/04.

### WEB-10 — Medir y limitar memoria y tareas largas
**P1 · Parcial · 4–8 h · Origen T1/rendimiento**  
**Continuación 07/10/2026:** Perfil local con 20 ediciones/guardados a 1200 px en ambos motores y navegadores; límites compartidos de historial verificados. Falta CPU/RAM y tacto en Android de 2–3 GB; los tiempos incluyen automatización/guardado. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** editores, worker, helpers.  
**Trabajo:** perfilar antes de optimizar; acotar historial y copias; evaluar resolución adaptada y coste de codificar PNG. Conservar miniaturas lazy y galería bajo demanda.  
**Aceptación:** prueba de 20 trazos/rellenos y guardados en Android modesto sin cierre; objetivo de respuesta visual <100 ms y operación grande <500 ms o progreso visible, sin bloqueo >1 s; registrar medición y ajustar alcance si no se cumple.  
**Dependencias:** WEB-02/04/09.

### WEB-11 — Añadir rehacer con historial coherente
**P2 · Hecho · 3–6 h · Origen U2**  
**Ejecución 07/10/2026:** Rehacer con límite compartido de pasos/bytes, ramas y autosave verificados. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** ambos editores.  
**Trabajo:** agregar pila de rehacer acotada; limpiar la rama futura al pintar de nuevo; sincronizar con reset/restauración/autosave.  
**Aceptación:** pintar→deshacer→rehacer reconstruye la obra; editar después de deshacer invalida rehacer; botones reflejan disponibilidad; memoria queda limitada.  
**Dependencias:** WEB-08/09/10.

## Épica 2 — UX, catálogo y accesibilidad web

### UX-01 — Poner lienzo y controles esenciales al alcance
**P1 · Parcial · 4–7 h · Origen U1**  
**Ejecución 07/10/2026:** Lienzo y controles visibles en diez combinaciones de viewport/modo; falta QA física y prueba acompañada. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** [paint.html](../web/paint.html), [paint.css](../web/paint.css), [brush.html](../web/brush.html), [brush.css](../web/brush.css).  
**Trabajo:** lienzo arriba, 8–12 colores cercanos, deshacer/guardar visibles; plegar paletas avanzadas, color personalizado y grosor; retirar reservas publicitarias vacías del editor.  
**Aceptación:** a 360/390/768 px y en paisaje el primer lienzo es visible y utilizable; controles no tapan zona activa ni saltan bajo el dedo; sin scroll horizontal. La meta ≥8/10 primeras pinturas en ≤30 s requiere después prueba acompañada.

### UX-02 — Simplificar selección y destacar continuar
**P1 · Parcial · 3–5 h · Origen UX catálogo**  
**Ejecución 07/10/2026:** Catálogo visual y colección de copias locales implementados; falta observar selección con personas. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** catálogo/galería de ambos editores, [assets-list.js](../web/assets-list.js), helpers.  
**Trabajo:** miniaturas grandes, temas y dificultad visual, continuar destacado; opciones de búsqueda avanzadas para adulto; estados vacío/carga/error.  
**Aceptación:** elegir dibujo visualmente sin lectura obligatoria; abrir desde home en una acción; adulto encuentra tema en ≤3 pasos; listado de guardados no promete obras ausentes.  
**Dependencias:** WEB-05 y CAT-01 para clasificación definitiva.

### UX-03 — Corregir controles ficticios y enlaces de home
**P1 · Parcial · 2–4 h · Origen UX home**  
**Ejecución 07/10/2026:** Home sin controles ficticios, enlaces y promesas corregidos; falta correo/URL confirmado del operador. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** [index.html](../web/index.html), [home.js](../web/home.js).  
**Trabajo:** hacer funcionales los botones de maqueta o convertirlos en elementos decorativos sin foco; CTA principal al balde y pincel secundario; enlaces descriptivos a categorías, privacidad y contacto real; precisar promesas de funciones/gratuidad.  
**Aceptación:** tabulación no cae en acciones ficticias; enlaces llegan a destinos correctos; no se promete rehacer antes de WEB-11; contacto usa información confirmada del operador.

### UX-04 — Mejorar foco, nombres y estados accesibles
**P1 · Parcial · 3–6 h · Origen UX herramientas**  
**Ejecución 07/10/2026:** Foco, nombres, selección, teclado y contraste esencial verificados; faltan lector real y revisión integral. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** home y editores HTML/CSS/JS.  
**Trabajo:** nombres de colores, etiquetas útiles, selección perceptible además de color, foco visible, navegación de diálogos y anuncios de estado; objetivos táctiles propios de 44–48 px con separación.  
**Aceptación:** controles usables por teclado y estados anunciados por lector; contraste y foco verificados; Escape/cierre devuelven foco; no declarar accesibilidad completa del canvas sin auditarla.

### UX-05 — Separar controles adultos de la actividad
**P1 · Parcial · 3–5 h · Origen UX adultos**  
**Ejecución 07/10/2026:** Zona adulta, impresión y recorrido sin aceptar implementados; PRIV-01/02 y decisiones de audiencia pendientes. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** home/editores/página adulta; equivalente Flutter en MOB-08.  
**Trabajo:** ubicar privacidad, impresión, compras futuras y enlaces externos en un recorrido adulto claro; mantener pintar accesible al rechazar.  
**Aceptación:** el niño no necesita aceptar publicidad ni resolver compras para usar herramientas; zona adulta identificable; gate de interfaz no se presenta como consentimiento parental verificable.  
**Dependencias:** PRIV-01/02; decisiones de audiencia.

## Épica 3 — Contenidos, pipeline y SEO

### CAT-01 — Unificar taxonomía y metadatos de catálogo
**P1 · Parcial · 3–6 h · Origen S1/inventario**  
**Continuación 07/10/2026:** Catálogo generado y tests Flutter ahora pasan con SDK compatible; recorrido de filtros y presentación en app física sigue pendiente. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** Fuente técnica única, taxonomía y enlaces web verificados; falta analyzer/tests/recorrido Flutter con SDK compatible. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** [assets-list.js](../web/assets-list.js), [catalog.json maestro](../base_png/catalog.json), [catálogo Flutter](../flutter/assets/catalog.json), repositorio Flutter.  
**Trabajo:** categorías coherentes para casas/paisajes y demás dibujos; metadatos de dificultad/tema; definir diferencias intencionales entre plataformas con slugs estables.  
**Aceptación:** ningún dibujo se clasifica en un tema ajeno; filtros/enlaces conservan identidad; discrepancias se documentan o corrigen. Igualar cantidades no es por sí solo un criterio de calidad.

### CAT-02 — Registrar procedencia y filtrar publicación comercial
**P0 comercial · Condicional · 3–5 h · Origen C1/D**  
**Archivos:** manifiesto de contenido a crear y generadores de catálogo/SEO.  
**Trabajo:** campos de autor/fuente/licencia/uso permitido/evidencia/estado; validación de inclusión comercial y exclusión de contenido no acreditado en catálogo, fichas, packs y sitemap.  
**Aceptación:** solo los assets marcados como autorizados con evidencia entran en una salida comercial; pruebas detectan entradas incompletas; selección piloto de 24–40 se aplica cuando esté aprobada.  
**Dependencia externa:** responsable aporta y valida derechos; un campo de licencia no demuestra titularidad. No publicar 19 fichas Gabby para completar el conteo.

### CAT-03 — Generar variantes y catálogos reproducibles
**P2 · Hecho · 6–10 h · Origen pipeline**  
**Ejecución 07/10/2026:** Pipeline técnico determinista: 227 salidas, ocho tests y repetición sin diferencias; CAT-02 excluida por el usuario, sin autorización comercial. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** herramienta local nueva, maestros y catálogos.  
**Trabajo:** maestro→PNG ≤1200→thumb ≤360→móvil→catálogos; parámetros documentados; salida determinista e inclusión explícita por plataforma; preservar originales.  
**Aceptación:** ejecución repetida no introduce diferencias inesperadas; detecta slugs duplicados, archivos ausentes y proporciones incompatibles; actualizar un dibujo no requiere editar manualmente tres catálogos.  
**Dependencias:** CAT-01/02. Puede adelantarse si el mantenimiento manual lo justifica.

### CAT-04 — Comprobar calidad técnica de cada dibujo publicado
**P1 · Parcial · 3–6 h iniciales · Origen calidad gráfica**  
**Ejecución 07/10/2026:** 62 controles técnicos y 248 recorridos automatizados pintar/exportar; faltan revisión manual de contornos y dispositivos. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** fixtures/herramientas locales y assets seleccionados.  
**Trabajo:** controles automáticos de dimensiones/proporciones y casos representativos de contornos; recorrido manual pintar/exportar por dibujo; registrar aprobación técnica independiente de derechos.  
**Aceptación:** 100% del piloto tiene registro de pintar/exportar, regiones problemáticas corregidas y salida legible; PNG válido no se toma como prueba de contornos cerrados.  
**Dependencias:** WEB-02/06, CAT-02.

### SEO-01 — Mejorar plantillas y enlaces de páginas temáticas
**P1 · Parcial · 4–8 h · Origen S1/I**  
**Ejecución 07/10/2026:** Seis páginas existentes de animales/dinosaurios/vehículos distinguen colección y guía adulta; faltan derechos y revisión del piloto. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [dibujos](../web/dibujos), [categorías](../web/categorias), [packs](../web/packs), home.  
**Trabajo:** aplicar a 4–6 páginas contenido adulto aprobado: preview, facilidad, uso, impresión y relacionados; enlaces al editor con asset correcto; separar intención de categoría y pack o consolidar duplicados reales.  
**Aceptación:** páginas estáticas rastreables y útiles; canonical correcto; todos los enlaces funcionan; no generar páginas masivas sustituyendo una palabra.  
**Dependencias:** CAT-01/02/04, UX-03. Textos y utilidad requieren criterio editorial; indexación/demanda se evalúan fuera del código.

### SEO-02 — Unificar host, robots, sitemap y rutas
**P1 · Parcial · 2–4 h · Origen SEO**  
**Ejecución 07/10/2026:** WWW verificado, robots/sitemap alineados y 61 rutas locales comprobadas; quedan cierre comercial y verificación pública de cambios. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [robots.txt](../web/robots.txt), [sitemap.xml](../web/sitemap.xml), canonical y configuración de hosting.  
**Trabajo:** escoger host canónico conforme a despliegue real, alinear referencias y comprobar redirecciones si el hosting las permite; actualizar sitemap desde páginas publicables.  
**Aceptación:** URLs del sitemap responden y usan el mismo host; sin entradas excluidas/rotas; editor con queries conserva canonical; no prometer indexación por pasar estos checks.  
**Dependencias:** CAT-02 y host confirmado.

### SEO-03 — Piloto breve en inglés
**P2 · Hecho (piloto gratuito local) · 4–8 h · Origen O**  
**Continuación 07/10/2026:** Por solicitud explícita se implementó una landing gratuita de dinosaurios, guía, navegación es/en, canonical/hreflang y ambos editores localizados con cuatro dibujos. Se conserva idioma, asset y trabajo local por modo; sitemap verificado. No se construyó ni reactivó una oferta vendible. Pendientes publicación, revisión editorial, indexación y experimento de demanda; no son resultados del código. [Implementación y límites](implementation-2026-10-07/maint-data-seo3.md).
**Ejecución 07/10/2026:** Diferido conforme al plan: sin señal española, oferta/recurso y traducción aprobados; no se abrió otro frente. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** landing/plantilla y recurso piloto.  
**Trabajo:** una landing y pack breve localizados, navegación de idioma y referencias canónicas/hreflang cuando correspondan; precio/moneda transparentes.  
**Aceptación:** recorrido completo sin mezcla de idiomas, URLs válidas, métricas comparables permitidas.  
**Dependencias:** núcleo fiable y señal de validación en español; traducción aprobada y oferta definida. No traducir todo el catálogo como requisito inicial.


## Épica 4 — Privacidad, medición y publicidad web

### PRIV-01 — Centralizar preferencias y carga de terceros
**P0 monetización · Hecho · 4–8 h · Origen P1/consentimiento**  
**Ejecución 07/10/2026:** Preferencias v2 comunes, legacy no concede permisos, storage/cross-tab/revocación y terceros apagados verificados en esta versión. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [analytics-init.js](../web/analytics-init.js), home y editores.  
**Trabajo:** un único módulo de preferencias con estados/versionado, controles adultos y revocación; vincular carga de scripts/eventos al tratamiento permitido. No conceder personalización/datos publicitarios automáticamente por “Aceptar”. Manejar storage bloqueado.  
**Aceptación:** actividad completa sin aceptar; home/editores/páginas comparten estado coherente; rechazar/revocar no pierde dibujo; no salen solicitudes prohibidas por la configuración elegida; callbacks diferidos no cargan terceros tras revocar.  
**Dependencia externa:** definir tratamientos, audiencia, mercados y necesidad de CMP/proveedor; conservar terceros apagados cuando no exista una configuración autorizada.

### PRIV-02 — Publicar política y contacto coherentes
**P0 monetización · Parcial · 2–4 h · Origen P2/documentación**  
**Ejecución 07/10/2026:** Información técnica web/app unificada y noindex mientras faltan operador/contacto, mercados y texto definitivo. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [privacy.html](../web/privacy.html), footer/home/editores, política enlazada desde Flutter.  
**Trabajo:** integrar texto aprobado para web/app, operador/contacto, dibujo local, exportación, backups posibles, terceros, conservación y controles; sustituir anclas contradictorias por destino único con secciones.  
**Aceptación:** todos los enlaces abren la política correcta; versión visible; enlaces de preferencias operativos; la descripción coincide con flujos observados.  
**Dependencias:** PRIV-01/03; datos y texto jurídico confirmados. El desarrollo no debe inventar operador ni derechos legales.

### PRIV-03 — Documentar solicitudes reales y configuración de seguridad
**P0 monetización · Parcial · 3–6 h · Origen inventario HAR/CSP**  
**Ejecución 07/10/2026:** HAR local de 56 estados y cabeceras públicas registrados; quedan app física, producción nueva y proveedores futuros. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** configuración HTML/CSP y evidencias fuera de `web/`.  
**Trabajo:** capturar red/cookies/storage en sesión limpia, sin decidir, al rechazar, aceptar y revocar; inventariar scripts y parámetros. Ajustar CSP mínima para servicios aprobados; comprobar cabeceras del host y no abrir comodines/unsafe-eval para ads.  
**Aceptación:** HAR/inventario con datos sensibles depurados y versiones; diferencia entre tráfico observado y lectura de código; ausencia de bloqueos injustificados y de solicitudes no permitidas.  
**Dependencias:** PRIV-01 y servicios seleccionados; no activar anuncios comerciales como parte de la prueba.

### DATA-01 — Minimizar payloads y validar source
**P1 · Hecho · 2–4 h · Origen seguridad/medición**  
**Ejecución 07/10/2026:** Esquemas mínimos web/móvil con source/enums/slugs conocidos; campos libres descartados y collectors apagados. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** helpers, home y editores; [product_analytics.dart](../flutter/lib/product_analytics.dart).  
**Trabajo:** enum de source/tema/modo/plataforma/resultado y bandas temporales; rechazar URLs/texto arbitrario; evitar trazos, dibujos, búsquedas libres y datos personales; versión de esquema.  
**Aceptación:** payloads fuera del esquema se descartan o normalizan; un `source` malicioso/arbitrario no se transmite; sin eventos por cada toque.  
**Dependencias:** tratamientos permitidos definidos.

### DATA-02 — Instrumentar calidad y continuidad con resultados reales
**P1 · Parcial · 3–6 h · Origen embudo/H**  
**Continuación adicional 07/10/2026:** Se prepararon GA4 web y Firebase Analytics Flutter, seleccionados por el usuario, con configuración/permiso explícitos, esquema, estados de fallo y revocación; publicidad/personalización denegadas. Firebase apagado desde el manifiesto final Android; iOS sigue desactivado. Apertura fallida/restauración/time bands y errores del collector probados en Flutter. Faltan ID/proyecto reales, tratamiento/avisos y recepción/red en SDK/cuentas; no se inventaron ni activaron. [Código, configuración y evidencia](implementation-2026-10-07/maint-data-seo3.md).
**Continuación 07/10/2026:** Hooks de guardado/restauración/compartir y estado de UI se prueban con collector apagado/fake y outcomes reales de test; recepción/cohorte/collector autorizado siguen pendientes. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** Resultados reales de apertura/save/restore/export y first_paint probados en web; UI móvil e integración de collector autorizada pendientes. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** editores/helpers, interfaz de analítica Flutter.  
**Trabajo:** apertura exitosa/error, first_paint una vez, local_save_success/failure, restore_success y exportación con semántica precisa; datos mínimos. Mantener collector móvil desactivado hasta autorización de tratamiento.  
**Aceptación:** fallo de escritura no genera éxito; apertura fallida no cuenta como activación; restauración obsoleta no cuenta; exportación no afirma archivo abierto; eventos no salen cuando no está permitido.  
**Dependencias:** WEB-05/06, PRIV-01, DATA-01. No crear fingerprint ni cuentas para medir regreso.

### ADS-01 — Implementar una ubicación web admisible para adultos
**P0 monetización · Parcial · 3–6 h · Origen L/diseño publicitario**  
**Ejecución 07/10/2026:** Componente adulto inactivo con estados, limpieza de resultados tardíos y prohibición en editor; falta integración/proveedor y aprobación/derechos. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** página adulta elegida, módulo ads y configuración.  
**Trabajo:** unidad explícita y marcada, separada de herramientas/tarjetas; modo sin ads, estados de carga/error, espacio colapsable sin saltos peligrosos; excluir ads del editor y revisar Auto Ads. Aplicar señales de audiencia soportadas por el producto/SDK confirmado.  
**Aceptación:** creatividades de prueba verificadas sin clics comerciales; ninguna unidad encima/junto al lienzo, colores o guardar; error/rechazo sigue permitiendo actividad; sin refresh propio, interstitial ni rewarded.  
**Dependencias externas:** PRIV-01/02/03, derechos, revisión de ámbito, configuración infantil aplicable y aprobación de cuenta. Una página etiquetada “adultos” no acredita audiencia adulta.

### ADS-02 — Validar ads.txt y añadir app-ads.txt cuando corresponda
**P0 monetización móvil · Parcial · 1–2 h · Origen AdMob verificación**  
**Ejecución 07/10/2026:** ads.txt válido y HTTP 200; app-ads.txt HTTP 404, sin vendedor/ficha móvil confirmados: no se inventó el archivo. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [ads.txt](../web/ads.txt), `web/app-ads.txt` a crear, configuración de dominio.  
**Trabajo:** usar vendedor autorizado confirmado y servir registros en el dominio enlazado por la ficha; distinguir archivo web y móvil.  
**Aceptación:** respuestas públicas correctas, registro sin placeholders; verificación de consola registrada por responsable.  
**Dependencia externa:** proveedor/cuenta/ficha/dominio confirmados; código no garantiza app readiness.

## Épica 5 — Flutter: fiabilidad y publicación condicional

### MOB-01 — Recuperar autosave tras fallos y guardar en lifecycle
**P0 publicación · Parcial · 4–7 h · Origen autosave móvil**  
**Continuación 07/10/2026:** Ahora analyzer y widgets Flutter concluyeron: fallo/reintento, reset/undo/redo y lifecycle simulado aprobados. Persistencia durante cierre/suspensión del SO físico sigue pendiente. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** Autosave recuperable, snapshot, dispose idempotente, estado/reintento y lifecycle implementados; core probado, Flutter/QA física pendientes. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [autosave_controller.dart](../flutter/lib/autosave_controller.dart), [main.dart](../flutter/lib/main.dart).  
**Trabajo:** recuperar cadena de Futures tras rechazo, capturar errores de Timer; flush al suspender/salir y coordinación antes de desmontar; estados honestos.  
**Aceptación:** fallo inyectado→siguiente save exitoso; no queda rechazo sin capturar; navegación/suspensión conserva última obra verificable; “guardado” aparece después de escribir.  
**Dependencias:** MOB-02; QA física para cierre.

### MOB-02 — Escrituras atómicas y lecturas sin mutación
**P0 publicación · Parcial · 4–7 h · Origen storage móvil**  
**Continuación 07/10/2026:** Pruebas Flutter de storage, 12 casos filesystem/autosave Windows y composición de PNG aprobados. Falta validar interrupción/recuperación en filesystem Android/iOS instalado. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** Reemplazo temporal/rename con backups, lecturas sin mutación y cola serializada comprobados en núcleo real; falta Flutter/QA móvil. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [drawing_storage.dart](../flutter/lib/drawing_storage.dart).  
**Trabajo:** PNG/índice temporal+rename con recuperación; ampliar serialización existente para migración/reparación; separar lectura pura de escritura; coherencia entre archivos e índice.  
**Aceptación:** interrupción no destruye último PNG válido; índice corrupto recupera obras y comunica límites de metadatos; save/load/list/favorite/clear concurrentes no pierden entradas; fallo no bloquea operaciones siguientes.

### MOB-03 — Estados seguros del banner
**P0 publicación con ads · Parcial · 2–4 h · Origen banner móvil**  
**Continuación 07/10/2026:** Controlador con estados, descarte tardío, disposición única, timeout y tres intentos máximos; pruebas de permiso/fallo/revocación/desmontaje aprobadas. Falta integración nativa en dispositivos con unidades de prueba permitidas. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [ad_banner.dart](../flutter/lib/ad_banner.dart).  
**Trabajo:** estados vacío/cargando/listo/fallo; limpiar referencia al disponer, comprobar mounted tras await y evitar cargas concurrentes; reintento limitado con backoff; mostrar solo anuncio listo.  
**Aceptación:** fallo/desmontaje/reintento no monta anuncio dispuesto ni duplica recursos; sin hueco inútil ni bucle de solicitudes; app continúa sin ads.

### MOB-04 — Validar configuración publicitaria por ambiente
**P0 publicación con ads · Parcial · 2–4 h · Origen ambientes**  
**Continuación 07/10/2026:** Anuncios desactivados por defecto; contrato Dart/Gradle/iOS y guardas release sin fallback a test. Seis casos shell iOS, tres rechazos Gradle y tests Dart aprobados; profile también impide unidades test. Falta inspección de release firmado y build iOS; plugin nativo sigue incluido. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** banner/ad service, Gradle, Info.plist/xcconfig y documentación.  
**Trabajo:** contrato debug/test/producción y opción release sin ads; IDs de prueba explícitos en test; release monetizado falla ante IDs productivos ausentes o configuración incompleta; no versionar secretos.  
**Aceptación:** artefacto release monetizado no usa silenciosamente test ID; release sin ads funciona sin inicializar SDK publicitario; configuración efectiva inspeccionada.  
**Dependencias:** MOB-03/05 y valores de cuenta confirmados.

### MOB-05 — Robustecer UMP y revisar SDKs/permisos
**P0 publicación con ads · Parcial · 3–6 h · Origen privacidad móvil**  
**Continuación 07/10/2026:** UMP con estados, timeout, canRequestAds, opciones según requirement status y bloqueo/revocación antes de banner; adaptación al SDK 7.0.0 y pruebas con gateway fake. SDKs/permisos/declaraciones/red nativos y decisiones de audiencia siguen pendientes. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [ad_service.dart](../flutter/lib/ad_service.dart), ajustes adultos en main, manifests/dependencias.  
**Trabajo:** error UMP con estado explícito y consulta canRequestAds según SDK; opciones de privacidad según requirement status; tratamiento infantil antes de inicializar; verificar compatibilidad de APIs por versión, SDKs/adaptadores, manifest fusionado, identificadores y declaraciones técnicas.  
**Aceptación:** error/rechazo no inicializa ads sin habilitación válida; configuración efectiva registrada; AD_ID y permisos cumplen decisiones de audiencia; Privacy manifests/required reason APIs revisados también en plugins.  
**Dependencia externa:** mercados/audiencia, CMP/mensajes y requisitos vigentes confirmados. NPA/gate no sustituyen consentimiento parental ni aprobación infantil Apple.

### MOB-06 — Compartir con origen en iPad y errores recuperables
**P0 iPad · Parcial · 2–4 h · Origen export_service**  
**Continuación 07/10/2026:** Origen real del botón, PNG temporal único y limpieza acotada; distingue compartido/cancelado/desconocido/fallo. Tests de archivo real y callback aprobados; share sheet físico iPad/iPhone/Android pendiente. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [export_service.dart](../flutter/lib/export_service.dart), botón en main.  
**Trabajo:** pasar rectángulo de origen del botón a sharePositionOrigin; distinguir cancelar/error/compartir; gestionar archivos temporales y evitar bloquear UI.  
**Aceptación:** share sheet real abre en iPad en ambas orientaciones; Android/iPhone siguen funcionando; cancelar/fallo vuelve a actividad sin afirmar entrega.

### MOB-07 — Serializar acciones y medir rendimiento del motor
**P1 · Parcial · 4–8 h · Origen rendimiento/carreras**  
**Continuación 07/10/2026:** Bloqueo de fill/acciones incompatibles, descarte tras dispose, generación de imagen protegida e historial acotado; carreras y 20 ediciones probadas. Perfil CPU/RAM, zoom/multitáctil y persistencia física pendientes. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [drawing_engine.dart](../flutter/lib/drawing_engine.dart), [layered_canvas.dart](../flutter/lib/layered_canvas.dart), main.  
**Trabajo:** impedir resultados de fill obsoletos; coordinar undo/reset/export; perfilar snapshots/encoding y mover trabajo fuera de UI solo si se justifica; historial limitado.  
**Aceptación:** acciones rápidas no sobrescriben obra nueva; 20 gestos/rellenos en Android modesto sin cierre; zoom/coordenadas y multitáctil verificados; registrar CPU/RAM y objetivos de respuesta de WEB-10.

### MOB-08 — Mejorar controles adultos, reset y accesibilidad
**P1 · Parcial · 3–6 h · Origen UX infantil Flutter**  
**Continuación 07/10/2026:** Desafío adulto variable, reinicio confirmable y recuperable, foco/errores y acciones serializadas; widgets aprobados. Lectores, texto grande, estrecho/paisaje y adecuación final a audiencia/plataforma pendientes; no verifica consentimiento legal. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** main, componentes UI/tema.  
**Trabajo:** sustituir gate fijo 4+3 por mecanismo de interfaz apropiado a plataforma; salidas/compras en zona adulta; reset cancelable/recuperable; semántica, foco, objetivos táctiles y textos grandes.  
**Aceptación:** links externos y futuras compras usan recorrido adulto; reset no pierde obra accidentalmente; pantalla estrecha/paisaje/lector/textos grandes probados; no se anuncia gate como verificación legal.  
**Dependencias:** MOB-01/07 y audiencia definida.

### MOB-09 — Mostrar obra real en Mis dibujos
**P2 · Hecho · 3–5 h · Origen previews**  
**Continuación 07/10/2026:** Miniatura compuesta desde obra PNG local con contornos, isolate y caché de 24 entradas; SliverList lazy, favoritos sin PNG y fallback. Composición real/corrupción probadas; QA física de la lista se conserva en el registro general. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** main, storage/modelos.  
**Trabajo:** miniatura de la obra guardada con carga/caché acotadas, fallback al original; distinguir favorito sin pintar de trabajo en curso.  
**Aceptación:** preview refleja última revisión guardada; no bloquea lista ni carga todos los PNG completos; archivos ausentes/corruptos tienen fallback.  
**Dependencias:** MOB-02.

### MOB-10 — Rehacer en Flutter
**P2 · Hecho · 3–6 h · Origen L**  
**Continuación 07/10/2026:** Undo/redo con máximo compartido de ocho pasos y 24 MiB de historial codificado; ramas, reset y estado/botones probados con píxeles reales y widgets. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** motor y main.  
**Trabajo:** historial acotado de undo/redo, invalidez de rama tras edición y estados de controles.  
**Aceptación:** undo/redo reproducen capa correcta; cambiar obra/reset no mezcla historiales; autosave persiste resultado final.  
**Dependencias:** MOB-07.

### MOB-11 — Resolver matriz de build y comprobar release Android
**P0 publicación Android · Parcial · 4–8 h + entorno · Origen build móvil**  
**Continuación 07/10/2026:** SDK Flutter 3.47.6/Dart 3.13.5 aislado; analyzer sin incidencias y 24 tests aprobados. Matriz AGP 8.12.1/Gradle 9.1.0/Kotlin 2.3.20; APK debug final aprobado e inspeccionado: compile/target SDK 36, minSdk 24; tres guardas nativas rechazan configuraciones inválidas. Release firmado/instalación/offline físicos pendientes. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** pubspec/lock, Gradle/settings, configuración release.  
**Trabajo:** confirmar requisitos efectivos Flutter/AGP/Kotlin/share_plus y ajustar lo necesario; verificar target SDK vigente y artefacto firmado con configuración correcta. Resolver entorno/dependencias antes de repetir checks.  
**Aceptación:** analyzer/tests concluyen, build release instala y abre; offline/persistencia/compartir y fallo de banner se prueban; target efectivo registrado; ninguna clave privada en repo/logs.  
**Dependencias:** MOB-01/02/06 y correcciones de ads si se incluyen. Activar rama Android solo con demanda de instalación/offline; aprobación/testers de tienda son externos.

### MOB-12 — Preparar build y QA iOS/iPad cuando haya recursos
**P2 · Condicional · 6–12 h + Mac/QA · Origen iOS**  
**Archivos:** proyecto iOS, configuración/dependencias.  
**Trabajo:** SDK/Xcode/firma/provisioning efectivos, permisos/Privacy manifests, iPad/compartir y opciones de distribución infantil; preferir ruta sin ads cuando no exista soporte admitido.  
**Aceptación:** build firmado y pruebas reales en iPhone/iPad, con configuración/documentación técnica concordante.  
**Dependencias:** validación comercial, presupuesto/entorno macOS, MOB-06/08 y revisión externa de tienda. No ejecutar como obligación del trimestre.

## Épica 6 — Oferta adulta y extensiones comerciales

### COM-01 — Página de oferta original, preview e impresión
**P1 · Pospuesto · 4–7 h · Origen J/propuesta de valor**  
**Decisión 07/10/2026:** Pospuesto por el usuario; no atender en el alcance actual. Retomar únicamente por nueva indicación expresa.  
**Archivos:** página adulta nueva, previews/estilos de impresión y enlaces.  
**Trabajo:** una oferta inicial con contenido aprobado, muestra gratuita, versión imprimible legible, precio/moneda, licencia y entrega claramente descritos; precisar alcance de uso gratis.  
**Aceptación:** preview y salida impresa/PDF se verifican; ningún asset no acreditado; niños no reciben presión de compra; precio piloto USD 12 se usa solo si se confirma.  
**Dependencias:** CAT-02/04, UX-05; pack y términos aprobados. No requiere backend propio.

### COM-02 — Integrar cobro y entrega solo al autorizar ventas
**P2 · Pospuesto · 5–10 h · Origen oferta adulta**  
**Decisión 07/10/2026:** Pospuesto por el usuario; no atender en el alcance actual. Retomar únicamente por nueva indicación expresa.  
**Archivos:** integración con proveedor elegido y página de confirmación.  
**Trabajo:** checkout alojado o solución mínima adecuada; entrega tras estado real de pago, idempotencia, errores/reembolsos y datos mínimos; validar firmas del proveedor si se utilizan webhooks.  
**Aceptación:** entorno de prueba cubre pagado, cancelado, fallido y duplicado; no entrega por query manipulada; total bruto/devoluciones concilian con pedidos; secretos no llegan a cliente/logs.  
**Dependencias externas:** autorización de ventas, operador/mercados, proveedor/cobro, términos y derechos confirmados. Sin cuentas infantiles ni infraestructura propia injustificada.

### COM-03 — Compra única para quitar anuncios móvil
**P2 · Pospuesto · 6–12 h · Origen alternativa móvil**  
**Decisión 07/10/2026:** Pospuesto por el usuario; no atender en el alcance actual. Retomar únicamente por nueva indicación expresa.  
**Archivos:** [entitlement_repository.dart](../flutter/lib/entitlement_repository.dart), ajustes, ads y futura integración de tienda.  
**Trabajo:** compra adulta, estado pendiente/error, restauración y entitlement persistente verificable; ocultar banner al adquirir; reconciliar ingresos y pérdida de impresiones.  
**Aceptación:** compra/restauración/cancelación/reinstalación probadas en sandbox; fallo no concede ni revoca arbitrariamente; no mostrar venta funcional mientras siga “Próximamente”.  
**Dependencias:** app con uso y oferta autorizada, cuentas de tienda, MOB-03/04/08. Precio/comisión son decisiones externas.

### COM-04 — Compartir enlace opcional desde exportación adulta
**P2 · Condicional · 2–4 h · Origen canal de recomendación**  
**Archivos:** UI adulta de exportación web/móvil.  
**Trabajo:** compartir archivo local y enlace limpio opcional; sin contactos, contenido del niño en URL ni subida automática de obra.  
**Aceptación:** adulto puede omitir enlace; cancelar no interrumpe actividad; no hay permisos de agenda ni paso obligatorio.  
**Dependencias:** WEB-06 o MOB-06, UX-05.

## Épica 7 — Pruebas, CI y mantenibilidad

### QA-01 — Convertir diagnósticos en checks que bloquean errores
**P0 · Hecho · 3–5 h · Origen B/despliegue**  
**Cierre 07/10/2026:** implementado y verificado; ver [cambios, pruebas y límites](implementation-2026-10-07/web-first-five.md).
**Archivos:** [checks.cjs](audit-2026-10-03/checks.cjs) como referencia; suite mantenible nueva fuera del archivo histórico.  
**Trabajo:** assertions/exit no cero para helpers, relleno, contornos, catálogos, dimensiones y rutas; distinguir informe diagnóstico de gate; conservar evidencia histórica.  
**Aceptación:** introducir W1/W2 deliberadamente hace fallar el check; versión corregida pasa; CI no continúa por un JSON con complete:false.  
**Dependencias:** WEB-01/02, CAT-01. Derechos/SEO se agregan al existir sus esquemas.

### QA-02 — Pruebas de navegador de continuidad y exportación
**P1 · Parcial · 4–7 h · Origen criterios comerciales**  
**Continuación 07/10/2026:** Suite actual 75/75 en Chromium y 75/75 WebKit, con ida/vuelta entre modos y uso sostenido a 1200 px. La matriz física continúa abierta. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** 34 tests de lógica y 47 por motor Chrome/WebKit; matriz física y privacidad definitiva PRIV-01 pendientes. Ver [evidencia y límites](implementation-2026-10-07/web-six-ten.md).
**Archivos:** pruebas nuevas y matriz de QA en docs.  
**Trabajo:** ambos modos, autosave con fallos/cuota, restauración, cambios rápidos, reset, export y rechazo/revocación; fixtures de canvas verificables.  
**Aceptación:** recorridos reproducibles detectan pérdidas/carreras; viewport 360/390/768 y escritorio cubiertos; resultados de dispositivos físicos separados de emulación; mantener los 20 recorridos de WEB-05 como evidencia de release.  
**Dependencias:** WEB-03 a WEB-09, PRIV-01; sin anuncios comerciales en tests.

### QA-03 — Tests Flutter que detecten los fallos auditados
**P0 publicación · Hecho · 4–8 h · Origen tests móviles**  
**Continuación 07/10/2026:** Assert de relleno corregido para comparar RGBA/contorno. Analyzer terminó sin incidencias; 24 tests Flutter y 12 del núcleo de archivos/autosave aprobados, incluyendo fallos, lifecycle simulado, banner/UMP fake, exportación, redo y carreras. Integración nativa/QA física queda registrada por tarea. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [test Flutter](../flutter/test).  
**Trabajo:** corregir assert de relleno que solo mira rojo; comprobar canales/contornos; fallo→recuperación autosave, lifecycle, storage corrupto/concurrente, banner/UMP, export y carreras.  
**Aceptación:** fixtures fallan con comportamiento defectuoso y pasan tras corrección; analyzer/tests terminan con resultado verificable; no considerar un proceso sin salida como aprobado.  
**Dependencias:** MOB-01/02/03/05/06/07, entorno Flutter disponible.

### CI-01 — Checks antes de publicar Pages y rollback documentado
**P0 publicación web · Parcial · 2–4 h · Origen workflow**  
**Continuación 07/10/2026:** Validación requerida antes de deploy, mismo gate en PR y publicación exclusiva de web; revisión registrada y runbook de rollback concreto. YAML/gates locales aprobados; ejecución y rollback remotos pendientes, sin publicar. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [deploy-pages.yml](../.github/workflows/deploy-pages.yml), instrucciones de despliegue.  
**Trabajo:** job de validación requerido antes de upload/deploy; ejecutarlo también en PR; publicar únicamente web; registrar revisión desplegada y procedimiento de retorno a versión verificada.  
**Aceptación:** un check fallido impide deploy; docs/evidencia no entran al sitio; commit publicado identificable; rollback concreto documentado y verificable sin publicación automática durante este backlog.  
**Dependencias:** QA-01; QA-02 según capacidad/entorno.

### CI-02 — CI y smoke tests de release móvil
**P1 · Parcial · 3–6 h · Origen falta CI móvil**  
**Continuación 07/10/2026:** Workflow manual con SDK fijado, lock, analyzer/tests y APK debug sin ads; artefacto de prueba con retención corta. No configura secretos ni release firmado; ejecución remota y smoke físico pendientes. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** workflow nuevo y runbook Flutter.  
**Trabajo:** analyzer/tests y build Android reproducible; firma/configuración a través de secretos protegidos; matriz/manual de offline, lifecycle, share y banner; iOS en macOS solo al abrir esa rama.  
**Aceptación:** fallo bloquea artefacto; logs no filtran claves; instrucciones distinguen build debug, release firmado y aprobación de tienda.  
**Dependencias:** QA-03, MOB-11 y plataforma confirmada.

### MAINT-01 — Centralizar código repetido tras estabilizarlo
**P2 · Hecho · 4–8 h · Origen arquitectura web/Flutter**  
**Continuación adicional 07/10/2026:** Cinco renderizadores comunes en `editor-ui.js`, colores/categorías compartidos sin listas duplicadas y cuatro componentes de catálogo más su función de color extraídos de `main.dart`. Regresiones web/móviles conservan estados y recorridos. La fidelidad de bordes suavizados al restaurar con pincel es un defecto previo registrado por separado; esta extracción no cambia ese algoritmo. [Implementación y verificaciones](implementation-2026-10-07/maint-data-seo3.md).
**Continuación 07/10/2026:** Navegación/guardado al salir compartidos entre motores; Flutter separa controles adultos, miniaturas y estados/configuración publicitarios. Regresiones aprobadas; catálogo/paletas/UI restante no se reescriben en este alcance. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** helpers/editor web y pantallas Flutter afectadas.  
**Trabajo:** extraer consentimiento, catálogo/paletas y utilidades duplicadas con contratos claros; dividir main.dart solo en zonas donde facilite cambios/pruebas. Evitar reescritura global o nuevo framework.  
**Aceptación:** mismos recorridos y estado preservados, menor duplicación medible; regresiones funcionales de las áreas extraídas pasan.  
**Dependencias:** núcleo reparado, PRIV-01 y pruebas pertinentes.

### DOC-01 — Alinear instrucciones técnicas con el producto real
**P1 · Hecho · 1–3 h · Origen documentación desactualizada**  
**Continuación 07/10/2026:** README raíz/web/assets/Flutter alineados con código, pipeline, ambientes desactivados y límites; comandos, despliegue/rollback y pruebas restantes documentados. Informes previos conservados como históricos. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [README raíz](../README.md), [README web](../web/README.md), [README assets](../web/assets/README.md), [README Flutter](../flutter/README.md).  
**Trabajo:** reflejar Flutter existente, pipeline/recursos reales, ubicación ads autorizada, ambientes, comandos que validan y límites de QA; actualizar al implementar cada tarea.  
**Aceptación:** instrucciones reproducibles, sin funciones/promesas inexistentes ni contradicciones con privacidad; diagnóstico histórico conservado como histórico.

## Orden de ejecución recomendado

1. **Núcleo web:** WEB-01/02 y QA-01; después WEB-03/04/05/06/09 y QA-02. WEB-08 protege la obra; CI-01 prepara despliegues con checks.
2. **Experiencia y contenido piloto:** UX-01 a UX-04, CAT-01/02/04, WEB-07 y SEO-01/02. CAT-02 necesita evidencia externa de derechos.
3. **Validación sin terceros si falta autorización:** UX-05, preparación de PRIV-01/02/03 y DATA-01. DATA-02 y ADS-01 permanecen condicionados al tratamiento permitido. COM-01/02/03 están pospuestos por decisión del usuario; disponer de contenido aprobado no los reactiva.
4. **Android solo ante demanda:** MOB-02/01/06/07/08, QA-03, MOB-11 y CI-02. Si hay ads, también MOB-03/04/05 y ADS-02; release sin ads es una opción.
5. **Elegir una expansión:** piloto inglés SEO-03 o beta Android; después valorar rehacer, pipeline, previews e iOS según evidencia. Las versiones vendibles y compras permanecen pospuestas. No ejecutar todas las ramas simultáneamente.

Para 5 h/semana, concentrar ejecución en núcleo web, UX esencial, catálogo acreditado y actividad gratuita para familias/docentes; posponer móvil, iOS, inglés y mejoras P2. El número de tareas de este documento no aumenta el presupuesto de tiempo de la auditoría.

## Pruebas pendientes

La [matriz y checklist de pruebas pendientes](PRUEBAS-PENDIENTES.md) reúne QA física Android/iPhone/iPad, red/privacidad, despliegue, verificaciones de las 45 tareas abiertas y registro de resultados. Distingue pruebas de cambios actuales de pruebas que requieren implementar primero su tarea.

## Regla para cerrar una tarea

Registrar bajo su ID: estado, fecha, cambios/commit si disponible, checks ejecutados y resultado, navegadores/dispositivos utilizados y dependencias externas aún abiertas. Usar **Hecho** solo cuando se cumple todo el criterio; implementación sin prueba física requerida sigue como **Parcial**. Una integración puede quedar **lista técnicamente, pendiente externa** sin afirmar que monetiza o fue publicada.

Las reglas de SDKs/tiendas/privacidad citadas en la auditoría son insumos históricos; reconfirmar fuentes oficiales al implementar una integración o preparar release. Este backlog no las declara vigentes por su fecha de creación.

## Referencias de trabajo

- [Informe consolidado](audit-2026-10-03/INFORME-PAINTME.md).
- [Detalle Flutter](audit-2026-10-03/flutter-audit.md).
- [Privacidad y condiciones externas](audit-2026-10-03/privacy-research.md).
- [Economía y mercado](audit-2026-10-03/market-economics.md).
- [Diagnósticos originales](audit-2026-10-03/checks.cjs) y [resultados archivados](audit-2026-10-03/checks-results.json).

