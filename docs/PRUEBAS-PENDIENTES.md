# PaintMe — Pruebas pendientes

Creado: 07/10/2026. Responsable de ejecución: por asignar. Este documento registra pruebas para ejecutar después; ninguna casilla vacía implica aprobación. Fuentes: [product backlog](PRODUCT-BACKLOG.md), [tareas 1–5](implementation-2026-10-07/web-first-five.md) y [tareas 6–10](implementation-2026-10-07/web-six-ten.md).

## Alcance y punto de partida

Los cambios web de las primeras diez tareas tienen **34 pruebas de lógica, 47 en Chrome y 47 en WebKit aprobadas**. No se deben registrar como pendientes esas ejecuciones del 07/10; habrá que repetirlas cuando cambie el código o se prepare otra versión. Los tests automatizados no prueban un teléfono físico ni peticiones reales a terceros: el runner bloquea esos terceros.

Aquí se reúnen:

1. Pruebas físicas y de integración que faltan para los cambios actuales, especialmente WEB-06 y QA-02.
2. Rendimiento, accesibilidad, contenido y observación de usuarios todavía no medidos.
3. Criterios de prueba de las **45 tareas abiertas al crear este registro** del backlog, incluidos Flutter y ramas comerciales condicionales. Muchos requieren implementar primero su tarea; no son defectos nuevos de los cambios actuales.

El informe de las primeras cinco tareas conserva límites históricos. La exportación de escritorio ya se comprobó posteriormente; el catálogo completo ya tiene una comprobación técnica automatizada posterior; lo pendiente es la matriz física, la revisión visual de contornos y los entornos/integraciones descritos abajo.

Este registro no autoriza publicar, activar anuncios, cobrar, reclutar usuarios ni enviar mensajes. Las pruebas de servicios se harán en entornos de prueba y cuando existan la configuración y las autorizaciones correspondientes.

## Actualización: ítems 11–20 excepto CAT-02

[Implementación y resultados](implementation-2026-10-07/web-eleven-twenty.md). Ya pasaron 38 pruebas Node, ocho Python, 66 completas en Chrome y 66 en WebKit, más tres comprobaciones finales por navegador. Los 62 dibujos tienen control técnico y 248 recorridos automatizados pintar/exportar; esos recorridos no están pendientes. No certifican contornos de todas las regiones ni dispositivos físicos.

Pendientes concretos de esta entrega:

- [ ] **N-01 / UX-01, UX-02:** ejecutar F-03/F-04 y V-01/V-02 con el nuevo layout, selección visual y continuar local. Verificar ≥8/10 primeros colores en ≤30 s; no inferirlo de un viewport.
- [ ] **N-02 / WEB-11, WEB-10:** rehacer/reset/nueva rama con tacto físico y 20 trazos/rellenos en Android modesto; comprobar memoria total y respuesta. El límite del historial ya pasó en software.
- [ ] **N-03 / UX-03:** el operador confirma correo o URL; configurarlo en `web/site-config.json`, abrirlo desde home/adultos y comprobar recepción/destino. Actualmente está vacío; no hay contacto ficticio.
- [ ] **N-04 / UX-04:** F-12 con lector real, teclado, escala de texto y zoom; nombres/estados/dialogos, swatches y contraste integral. La comprobación actual de contraste solo cubre cuatro textos/controles esenciales.
- [ ] **N-05 / UX-05:** impresión real desde ambos modos en escritorio/iPhone/iPad/Android; vista previa, orientación, márgenes, legibilidad y cancelación sin modificar obra. Los tests preparan la imagen y sustituyen `window.print`.
- [ ] **N-06 / UX-05:** R-01 a R-05 después de PRIV-01/02; verificar preferencias, revocación, terceros y política final. La separación adulta no acredita consentimiento legal.
- [ ] **N-07 / CAT-01:** SDK compatible, analyzer/tests y APK debug ya aprobados en la continuación. Probar filtros Casas/Paisajes/Vehículos, slugs y presentación en app instalada; runtime físico pendiente.
- [ ] **N-08 / CAT-04:** revisar todas las regiones y contornos de cada dibujo seleccionado en balde/pincel, exportar y abrir visualmente. Registrar fecha, incidencias y evidencia por slug en [artwork-review.csv](implementation-2026-10-07/web-eleven-twenty/artwork-review.csv); contrastar hashes con JSON si cambia un maestro. Corregir y repetir cualquier fuga/ilegibilidad.

CAT-02 fue **excluida por el usuario**. No se ejecutaron ni aprobaron procedencia, licencias o filtro comercial. Sus dependencias no se dan por resueltas al generar recursos. Las entradas B-* conservan los casos originales; las notas de actualización indican lo ya comprobado y lo restante.

## Actualización: ejecución del plan 21–31

[Resultados y evidencia](implementation-2026-10-07/items-21-31.md). Pasaron 44 pruebas Node, 71 en Chrome y 71 en WebKit, ocho del pipeline y doce del núcleo real móvil. El harness móvil también pasa analyzer independiente; no son flutter test/analyze. Las capturas HAR locales sin bloqueo del runner cubren 28 estados por navegador sin requests externos/cookies; no repetirlas como pendientes de esa revisión. El nuevo sitemap y 61 rutas/canonical se comprobaron localmente.

- [ ] **P-01 / PRIV-02, UX-03:** confirmar operador, país, contacto, mercados y tratamientos; completar/revisar texto, configurar contacto y comprobar sus enlaces. Actualmente la política está marcada pendiente/noindex y el contacto vacío.
- [ ] **P-02 / PRIV-03:** con SDK/proveedores autorizados, repetir red/cookies/storage por estado, revocación con callbacks en curso y CSP; inventariar datos efectivos. Mantener desactivados mientras falte configuración. No inferir tráfico de app desde mocks web.
- [ ] **P-03 / SEO-01, CAT-04:** revisión editorial y visual de las seis páginas del piloto y sus dibujos; impresión física/legibilidad/contornos, función distinta de categoría/guía. Derechos permanecen sin acreditar; CAT-02 excluida.
- [ ] **P-04 / SEO-02, PRIV-03:** tras despliegue autorizado, contrastar sitemap/robots/canonical y todos los destinos públicos de la nueva versión, red/cabeceras reales. La consulta pública actual confirmó WWW y ads.txt; no verificó una versión nueva desplegada. Indexación es seguimiento externo.
- [ ] **P-05 / ADS-01:** proveedor/SDK/CMP, cuenta y audiencia admitidos; integración real de prueba, Auto Ads, layout/fallo/revocación/timeout. No habilitar el componente por disponer solo de mocks aprobados.
- [ ] **P-06 / ADS-02:** confirmar vendedor y cuenta; ficha móvil/dominio vinculados antes de generar app-ads.txt; entrega HTTP y verificación de consola. Su 404 actual es una dependencia registrada, no un archivo vacío aprobado.
- [ ] **P-07 / MOB-02:** entorno Flutter/analyzer/tests ya preparados y aprobados; resta integración de app/adapter y filesystem Android/iOS físicos. Simular suspensión/interrupción al escribir PNG/índice y recuperar; metadatos, favoritos, clear, PNG ilegible y concurrencia. Se comprobaron atomicidad de bytes/JSON, backup y colas en Windows; no validación visual/decodificación de cada PNG.
- [ ] **P-08 / MOB-01:** Flutter widgets y ciclo de vida físico inactive/paused/hidden, navegación, completar/next/dispose y guardado fallido→reintento. Comprobar mensajes tras persistir, no promesa automática al salir, timers sin errores sin manejar y recuperación tras cierre del SO. El flush no garantiza que el SO permita terminar IO.
- [ ] **P-09 / DATA-02:** hooks de UI móvil con collector fake, identidad/obsolescencia, primera actividad y save/restore/share según resultado. Si se autoriza un collector, validar recepción y exclusión de datos/no-permisos, sin equiparar eventos preparados con recepción GA.
- [ ] **P-10 / SEO-03:** habilitar solo tras señal española y recurso/oferta/traducción definidos; recorrido de idioma, navegación, canonical/hreflang y medición permitida. Sin esa evidencia sigue Condicional.

Nota histórica de la fase 21–31: la restricción de proyecto Dart ^3.11.5 no se rebajó; entonces estaba disponible 3.7.2. El manifiesto oficial Windows devolvió 404 durante el intento de preparar el entorno; no se instaló/actualizó SDK ni se ejecutaron widgets/build. El núcleo independiente sí se ejecutó y analizó.

## Actualización: continuación de mejoras de código restantes

[Implementación, entorno y resultados](implementation-2026-10-07/remaining-code.md). Aprobadas **45 pruebas Node, 75 en Chromium, 75 en WebKit, 24 Flutter y 12 del núcleo móvil**, ocho del pipeline y comprobación histórica W1/W2. `flutter analyze --no-pub` terminó sin incidencias. Los 20 ciclos a 1200 px por editor tienen perfiles locales guardados; no son CPU/RAM de Android. Esta actualización sustituye la limitación histórica de SDK móvil: ahora existe Flutter 3.47.6/Dart 3.13.5 aislado; no prueba dispositivos físicos ni release firmado.

Pendientes de esta entrega, con dependencias:

- [ ] **C-01 / WEB-10, MOB-07:** Android de 2–3 GB, build identificada, 20 trazos/rellenos/guardados, CPU/RAM total/pausas y respuesta; zoom, multitáctil y rotación físicos. Los límites de historial y carreras ya pasaron en software.
- [ ] **C-02 / MOB-01/02, DATA-02:** en app instalada, suspender/cerrar durante IO y reabrir; metadatos/favoritos/corrupción, salvar después de fallo, completar/siguiente/salir y cobertura de eventos permitidos. Los widgets simulan lifecycle y almacenamiento; harness real usa archivos Windows.
- [ ] **C-03 / MOB-03/04/05:** con audiencia/mercados/proveedor admitidos, probar SDK nativo con unidades de test, rechazo/error/revocación/opciones, banner fallido/reintento/desmontaje. Inspeccionar manifest fusionado/AD_ID, SDKs/adaptadores y tráfico; no activar producción por pasar mocks.
- [ ] **C-04 / MOB-04/11:** APK debug local aprobado/inspeccionado (SDK 36); preparar firma/entorno de release sin ads con configuración protegida, inspeccionar package/version/target/manifiesto efectivo y abrir/instalar. Después comprobar guardas de release monetizado solo con IDs y aprobación confirmados. Debug no satisface esta fila.
- [ ] **C-05 / MOB-06/12:** Mac/Xcode/provisioning y equipos iPad/iPhone/Android: abrir share sheet desde botón en ambas orientaciones, cancelar, fallo, repetir y regresar a actividad; revisar conservación/limpieza de temporales. Shell y callback fake no prueban UIKit.
- [ ] **C-06 / MOB-08/09/10:** lector real, foco/semántica/textos grandes y pantalla estrecha/paisaje; gate variable y salidas adultas, reset/deshacer/rehacer y última miniatura al volver a Mis dibujos; favorito sin obra, archivo ausente/corrupto y lista grande. Sin pruebas con niños en esta ejecución.
- [ ] **C-07 / CI-01:** PR autorizado y ejecución remota del gate, defecto deliberado en rama de prueba impide deploy, artefacto contiene solo web; después despliegue/rollback autorizados del runbook y smoke público por SHA. Actualmente solo se comprobó YAML/gate local y dependencias de jobs.
- [ ] **C-08 / CI-02:** ejecutar workflow manual remoto, revisar analyzer/tests/artefacto debug, fallo impide subida; preparar secretos/firma y smoke de release únicamente cuando se habilite esa distribución. CI iOS condicionada a Mac/plataforma.
- [ ] **C-09 / MAINT-01:** al abrir una extracción adicional de catálogo/paletas/pantallas, repetir recorridos funcionales de las áreas modificadas y registrar reducción concreta de duplicación. Navegación web y componentes adultos/miniaturas/ads móviles ya están extraídos.

**CAT-02 sigue excluida. COM-01/02/03 y sus pruebas de venta/compra están pospuestos**, requieren nueva indicación expresa; no reactivarlos al resolver otras dependencias. SEO-03, COM-04 e iOS conservan sus condiciones. APK debug local final aprobado e inspeccionado: compile/target SDK 36, minSdk 24. Tres guardas Android rechazaron configuraciones inválidas en dry-run; sin release firmado, instalación física ni publicación.

## Cómo registrar una ejecución

Usar **Pendiente**, **Bloqueada**, **Aprobada**, **Fallida** o **No aplica**. Marcar una casilla únicamente cuando su resultado esperado se cumpla y exista evidencia; si falta equipo/configuración, registrar la dependencia, no aprobarla. “No aplica” exige motivo.

Por cada caso y combinación de dispositivo/modo, añadir una fila al registro del final. Anotar fecha, persona, commit o revisión local, URL/entorno, modelo, RAM cuando importe, sistema operativo, navegador y versión, modo balde/pincel, pasos, resultado y evidencia. Guardar capturas, PNG, logs y perfiles fuera de `web/`; por ejemplo, `docs/qa-evidence/<fecha>/<ID>/`. No incorporar cookies, tokens, identificadores personales ni dibujos de niños a evidencia compartida; usar obras de prueba creadas por el evaluador.

## Matriz física mínima

| Entorno real | Modos | Orientaciones | Casos | Estado |
|---|---|---|---|---|
| Teléfono Android, Chrome | Balde y pincel | Retrato y paisaje | F-01 a F-11; F-12 cuando haya lector; F-13 en equipo modesto | Pendiente |
| iPhone, Safari | Balde y pincel | Retrato y paisaje | F-01 a F-12 | Pendiente |
| iPad, Safari | Balde y pincel | Retrato y paisaje | F-01 a F-12 | Pendiente |
| Android modesto de 2–3 GB RAM | Balde y pincel | Retrato y paisaje | F-03, F-05, F-07 y F-13 | Pendiente; puede coincidir con la primera fila |
| Escritorio, Chrome y Safari macOS si se incluye en soporte | Balde y pincel | Ventana estrecha y amplia | F-12, red real R-01 a R-04, política R-05 | Pendiente; las pruebas automatizadas Chrome/WebKit ya pasaron |

Probar una revisión identificable servida por HTTPS accesible al dispositivo. Registrar la URL y verificar qué versión de scripts se cargó. Emulación, viewport o WebKit en Windows no sustituyen las filas físicas. No desplegar producción solo para poder llenar esta tabla.

## Pruebas físicas de los editores

### F-01 — Descargar y abrir PNG reales

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-06, QA-02. En cada modo elegir dos dibujos reales: uno simple y otro cercano a la resolución máxima de 1200 px. Colorear regiones o trazar con varios colores; comprobar visualmente contornos antes de descargar. Pulsar Descargar PNG tres veces seguidas y abrir cada archivo desde Descargas/Archivos/visor real del sistema. Registrar nombres, dimensiones, tamaño y captura del visor.

**Esperado:** PNG válido, tamaño igual al canvas, colores y contornos conservados, todas las capas del pincel presentes. Una repetición no genera archivo vacío ni deja el editor bloqueado. El mensaje no afirma que el usuario abrió el archivo. Si el navegador bloquea una descarga, registrar el caso y comprobar F-02; no marcar descarga directa aprobada por ver solo el aviso de preparación.

### F-02 — Vista previa y alternativa de guardado

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-06. Preparar PNG, abrir Ver PNG para guardar y usar tanto el enlace alternativo como las opciones reales disponibles sobre la imagen. Si se fuerza un error de `toBlob`, hacerlo solo en el entorno de prueba. Cerrar el diálogo y volver a pintar.

**Esperado:** al menos la ruta alternativa comprobada entrega un PNG que se abre correctamente; el diálogo funciona táctilmente, no tapa su cierre y mantiene la obra. Documentar qué acción del navegador funciona en cada sistema. La prueba automatizada de `toBlob` nulo ya pasó; aquí falta la compatibilidad física.

### F-03 — Toque, trazo, borrador, zoom y multitáctil

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** QA-02; mejoras futuras UX-04. Con el dedo, rellenar junto a un contorno y en ambas regiones de un dibujo; en pincel tocar sin arrastrar, dibujar un trazo y borrar parte. Usar zoom/pinch y desplazamiento; levantar dedos en orden distinto y volver a pintar. Repetir con distintos grosores.

**Esperado:** coordenadas correctas, un toque de pincel deja un punto, contornos protegidos, no quedan trazos o estados táctiles atascados. El gesto de zoom no modifica por accidente la obra y las acciones vuelven a estar disponibles. Las pruebas actuales emulan un toque; no acreditan pinch físico.

### F-04 — Rotación y tamaño real de pantalla

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** QA-02; disposición futura UX-01. Rotar durante una obra, después de guardarla y con cada diálogo abierto; cambiar barras visibles del navegador cuando el sistema lo permita. Repetir herramientas, exportación y restauración.

**Esperado actual:** la rotación no borra la obra, no altera coordenadas ni vuelve inaccesibles diálogo y acciones. Registrar scroll, recortes y controles tapados. **Primer lienzo visible sin scroll** es un criterio futuro de UX-01, todavía no implementado ni aprobado.

### F-05 — Veinte recorridos completos por dispositivo

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-05, QA-02. Hacer diez recorridos por modo: abrir dibujo→pintar→deshacer→volver a pintar→esperar Guardado en este dispositivo→descargar→recargar→Continuar/restaurar. Incluir al menos dos dibujos y conservar una referencia de la obra antes de recargar.

**Esperado:** veinte recuperaciones correctas, sin mezcla de dibujos/modos ni falso éxito; exportación abierta coincide con la obra. Registrar cada recorrido, no solo “20 OK”. Los veinte recorridos por motor automatizado ya pasaron; estos son los físicos pendientes.

### F-06 — Cambiar antes del autosave y navegar entre modos

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-04, QA-02; futura WEB-07. Pintar y pulsar Siguiente o cambiar categoría inmediatamente, antes de 450 ms; volver al dibujo y restaurar. Repetir con un enlace al otro modo y regresar al modo de origen.

**Esperado actual:** la obra queda guardada bajo el dibujo y modo correctos; un fallo impide la transición y da una salida recuperable. El cambio de modo todavía guarda en origen: **transferir el mismo asset y las capas es WEB-07 pendiente**, no debe aprobarse como función existente.

### F-07 — Ocultar, suspender y cerrar normalmente

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-04, QA-02. Pintar y pasar a otra app antes de 450 ms; bloquear pantalla; regresar. Repetir cerrando normalmente la pestaña y abriendo una nueva del mismo sitio. Incluir un trazo que todavía esté en curso al ocultar cuando el sistema permita reproducirlo.

**Esperado:** recuperar la última obra disponible sin guardarla bajo otro slug; estado coherente después de volver. Registrar cuándo el sistema entrega eventos de salida y qué revisión se recupera.

### F-08 — Terminación forzada y límites de recuperación

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-04, QA-02. Con una obra de prueba, forzar cierre de la app del navegador antes del autosave y repetir después de confirmar guardado; abrir y restaurar.

**Esperado de evaluación:** registrar cuánto trabajo se conserva y en qué escenario; no mezclarlo con cierre normal. Kill/crash puede impedir eventos de salida y no se prometió recuperar un trazo todavía no persistido. Si se pierde una revisión previamente confirmada, abrir incidencia. Una prueba exploratoria favorable no garantiza supervivencia a todos los cierres del sistema.

### F-09 — Sesión privada y almacenamiento restringido

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-03/05, QA-02. En modo privado pintar, guardar, recargar y restaurar dentro de la misma sesión. Si el navegador ofrece restricción de almacenamiento del sitio, repetir allí. Cerrar la sesión privada y comprobar el comportamiento al empezar una nueva.

**Esperado:** actividad y exportación siguen funcionando; si storage no está disponible, no se anuncia guardado exitoso y se ofrece reintento/descarga. Documentar la retención real de cada navegador; no exigir conservación después de cerrar una sesión privada que el navegador elimina.

### F-10 — Cuota y fallo real de persistencia

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari, o Bloqueada con causa registrada.

**Relacionadas:** WEB-03/05, QA-02. Usar un origen/perfil de prueba desechable con una obra de referencia; limitar o agotar su almacenamiento mediante una herramienta controlada. No llenar el disco ni borrar datos personales. Intentar guardar y cambiar dibujo; liberar la cuota del origen y reintentar.

**Esperado:** mensaje de fallo persistente, sin falso éxito ni navegación que pierda cambios; descarga todavía utilizable; siguiente guardado y restauración correctos al resolver la cuota. Registrar método, navegador y alcance. La cuota inyectada en tests ya pasó; no equivale a agotar una cuota real. Si el sistema no permite inducirla, dejar la fila Bloqueada.

### F-11 — Reinicio, cancelación y recuperación

- [ ] Android Chrome · [ ] iPhone Safari · [ ] iPad Safari.

**Relacionadas:** WEB-08, QA-02. Pintar y pulsar Reiniciar: cancelar con el botón; repetir con Escape/cierre permitido; comprobar obra intacta. Confirmar y pulsar Recuperar reinicio; guardar, recargar y restaurar. Finalmente confirmar otro reinicio y recargar sin recuperarlo.

**Esperado:** cancelar conserva obra; confirmar permite Deshacer en la página actual; después de recuperar y guardar, la restauración funciona. Un guardado anterior no reaparece tras borrar. No se espera recuperación del historial del reinicio después de recargar/cambiar de dibujo; no es papelera persistente.

### F-12 — Teclado, lector y diálogos

- [ ] TalkBack Android · [ ] VoiceOver iPhone/iPad · [ ] teclado de escritorio.

**Relacionadas:** QA-02; UX-04 aún pendiente. Navegar sin ratón por acciones, estado de guardado, reintento, preferencias y diálogos; abrir, cancelar y cerrar. Comprobar foco, lectura de estados y retorno del foco al control que abrió el diálogo. Registrar contraste, nombres de colores y uso con texto ampliado.

**Esperado actual:** diálogos y acciones añadidas tienen nombres, foco visible y cierre disponible. Los huecos de accesibilidad general se registran para UX-04; no aprobar toda la actividad canvas por pasar este recorrido.

### F-13 — Rendimiento y memoria en Android modesto

- [ ] Perfil balde · [ ] Perfil pincel · [ ] Repetición tras ajustes, si hacen falta.

**Relacionadas:** WEB-10 pendiente. Registrar RAM/modelo/versión; usar dibujo cercano a 1200 px, veinte trazos/rellenos, deshacer y guardados. Medir latencia visual, operación grande, tareas largas y memoria con herramientas de perfil; probar un relleno grande y cambios de dibujo. Registrar batería/red solo si afectan la ejecución observada.

**Objetivos elegidos, aún no medidos:** respuesta visual <100 ms; operación grande <500 ms o progreso visible; sin bloqueo >1 s ni cierre. Si no se cumplen, conservar el perfil y abrir ajuste de WEB-10. No usar el tiempo del runner ni una estimación de RGBA como perfil de dispositivo.

- [ ] **Complemento web pendiente:** registrar una línea base de Lighthouse en home y ambos editores, con revisión, dispositivo/perfil y red usados; revisar carga, tareas largas y desplazamientos de diseño. Separar estas mediciones de laboratorio de Core Web Vitals de campo: sin muestra real, los datos de campo permanecen no disponibles. Una puntuación Lighthouse no sustituye los recorridos físicos ni fija por sí sola la aceptación del motor.

## Red, privacidad e integración pendientes

Estas comprobaciones dependen de PRIV-01/02/03 y de definir tratamientos/servicios/mercados. Se puede registrar una línea base del comportamiento actual, pero no declararla conforme sin una configuración esperada definida. Usar sesiones de prueba adultas, nunca tráfico de niños para auditar datos.

### R-01 — Inventario real antes de decidir y al rechazar

- [ ] Home · [ ] Balde · [ ] Pincel · [ ] páginas temáticas/adultas incluidas.

En un perfil limpio registrar HAR, scripts, cookies y almacenamiento antes de decidir; luego Rechazar, pintar, exportar y recargar. Repetir entre páginas. Inventariar dominios, campos y finalidades observadas.

**Esperado:** sin solicitudes prohibidas por el diseño elegido y actividad operativa sin aceptación. Distinguir datos realmente observados de inferencias por código. Depurar la evidencia antes de guardarla.

### R-02 — Aceptación y revocación reales

- [ ] Estados/versionado compartidos · [ ] Revocación conserva obra · [ ] Red posterior a revocación.

Solo con configuración autorizada de prueba, aceptar desde el recorrido adulto, capturar red/storage, reabrir preferencias y revocar. Pintar, guardar, navegar y recargar; revisar scripts, colas/eventos diferidos, solicitudes y cookies según el diseño. Repetir con storage bloqueado.

**Esperado:** no se inicia tráfico prohibido después de revocar, estados coherentes en páginas, sin pérdida de obra ni concesión automática improcedente. Los cuatro flags `denied` ya se probaron; aquí falta el flujo real de terceros y PRIV-01.

### R-03 — Contrato y minimización de eventos

- [ ] Payload válido · [ ] source arbitrario/malicioso · [ ] fallos/obsolescencia · [ ] envío denegado.

Tras DATA-01/02 validar esquema, tema/modo/source enumerados y bandas de tiempo. Inyectar fuente inválida, apertura fallida, fallo de guardado, restauración tardía y exportación preparada sin archivo abierto. Revisar lo recibido, cuando exista un collector autorizado.

**Esperado:** datos fuera del esquema rechazados/normalizados, sin dibujos, trazos ni datos personales; un fallo no genera evento de éxito; first_paint no se duplica; denegación impide envíos no permitidos.

### R-04 — CSP, cabeceras y anuncios de prueba

- [ ] CSP/cabeceras efectivas · [ ] error/sin anuncio · [ ] separación táctil · [ ] sin formatos excluidos.

Con servicios elegidos, usar unidades/creatividades de prueba; observar consola/red y cabeceras del host. Simular error y ausencia de anuncio, rotar y usar controles cerca de la ubicación adulta prevista.

**Esperado:** sin bloqueos indebidos ni permisos amplios injustificados; sin ads sobre/junto al lienzo/herramientas; no saltos bajo el dedo, refresh propio, interstitial ni rewarded. No activar ni pulsar anuncios comerciales. Esta prueba depende de ADS-01 y configuración/audiencia aprobadas.

### R-05 — Política, contacto y archivos del vendedor

- [ ] Destinos/política/versionado · [ ] concordancia con red · [ ] ads.txt · [ ] app-ads.txt cuando corresponda.

Tras PRIV-02 y ADS-02 recorrer todos los enlaces web/móvil; cotejar texto, operador/contacto y preferencias con los datos reales. Consultar HTTP y contenido de archivos de vendedor en el dominio vinculado a las fichas. El responsable registra el estado de consola cuando haya acceso.

**Esperado:** sin política contradictoria ni placeholders, respuestas públicas correctas y destinatarios descritos según flujos observados. Un HTTP 200 no demuestra aprobación AdSense/AdMob; estado externo se registra separado.

## Despliegue y regresión antes de una versión

- [ ] **D-01 — Repetir el gate local:** `node scripts/check-web.cjs`, `node scripts/verify-web-gate.cjs` y ambas suites de navegador sobre la revisión candidata. Registrar versiones y salida completa. Esperado: exit code 0; las mutaciones W1/W2 devuelven 1. Esto es revalidación futura de tests aprobados, no ejecución pendiente del 07/10.
- [ ] **D-02 — Comprobar Actions/PR (CI-01):** después de implementar checks en PR, usar una rama de prueba con gate fallido y verificar que no sube/despliega artefacto. No introducir la regresión en main. Esperado: bloqueo efectivo de la publicación y docs/evidencia excluidas de la salida web. El workflow se editó localmente, no se ejecutó remotamente.
- [ ] **D-03 — Revisión y rollback (CI-01):** registrar commit candidato/publicado, comparar recursos servidos cuando se autorice publicar y ensayar el procedimiento de retorno en entorno de prueba. Esperado: versión identificable y recuperación reproducible a la versión validada. Publicación real requiere su autorización; no ocurre por ejecutar este checklist.

## Verificaciones tras implementar el resto del backlog

La siguiente lista conserva los criterios de las **45 tareas abiertas antes de atender los ítems 11–20**. Para cada una: implementar o resolver dependencias del [backlog](PRODUCT-BACKLOG.md), preparar un caso que pueda detectar el defecto, ejecutar en el entorno indicado y registrar resultado/evidencia. No marcar una función todavía inexistente como aprobada ni contar falta de implementación como fallo de una prueba ya ejecutada.

WEB-06 y QA-02 están implementadas parcialmente y se completan con los casos físicos/de privacidad anteriores. Flutter, pagos, tiendas, inglés y anuncios siguen condicionados a sus ramas y configuraciones. La evidencia de otras tareas web no cierra esos frentes.

### B-WEB-06 — Verificar y ajustar exportación PNG

- [ ] Verificación pendiente. **Momento:** Parcial; ejecutar casos anteriores y resolver dependencia restante.

**Preparación y casos a cubrir:** manejar `toBlob` nulo/error, descarga repetida, nombre de archivo y liberación de object URL compatible con navegadores objetivo; ofrecer alternativa si corresponde.

**Resultado esperado:** archivos exportados abren con dimensiones, contornos y colores correctos en Chrome escritorio/Android y Safari iOS; la UI maneja el fallo; el evento distingue intención/archivo preparado de una descarga que el navegador no permite confirmar.

**Dependencias:** WEB-01/02. Requiere dispositivos/navegadores reales para cerrar QA.

### B-WEB-07 — Conservar contexto al cambiar entre balde y pincel

**Continuación 07/10/2026:** Enlaces seguros preservan asset/categoría, guardan antes del cambio y muestran aviso cancelable sobre obras independientes por herramienta; ida/vuelta sin pérdida probada en Chromium y WebKit. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [x] Alcance técnico comprobado el 07/10/2026; las verificaciones físicas/nativas quedan en C-* y la matriz. Repetir ante cambios.

**Preparación y casos a cubrir:** transferir asset y contexto en enlaces; elegir transferencia compatible de la obra o un aviso explícito con opción de guardar antes del cambio. No fusionar formatos incompatibles sin comprobarlos.

**Resultado esperado:** cambiar modo abre el mismo dibujo y conserva o explica de forma clara el estado de la obra; no se pierde trabajo silenciosamente; ida y vuelta probadas.

**Dependencias:** WEB-04/05/06.

### B-WEB-10 — Medir y limitar memoria y tareas largas

**Continuación 07/10/2026:** Perfil local con 20 ediciones/guardados a 1200 px en ambos motores y navegadores; límites compartidos de historial verificados. Falta CPU/RAM y tacto en Android de 2–3 GB; los tiempos incluyen automatización/guardado. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** perfilar antes de optimizar; acotar historial y copias; evaluar resolución adaptada y coste de codificar PNG. Conservar miniaturas lazy y galería bajo demanda.

**Resultado esperado:** prueba de 20 trazos/rellenos y guardados en Android modesto sin cierre; objetivo de respuesta visual <100 ms y operación grande <500 ms o progreso visible, sin bloqueo >1 s; registrar medición y ajustar alcance si no se cumple.

**Dependencias:** WEB-02/04/09.

### B-WEB-11 — Añadir rehacer con historial coherente

**Actualización 07/10/2026:** Rehacer con límite compartido de pasos/bytes, ramas y autosave verificados. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [x] Alcance técnico verificado el 07/10/2026. Repetir al cambiar código; los criterios originales de abajo se conservan para regresión.

**Preparación y casos a cubrir:** agregar pila de rehacer acotada; limpiar la rama futura al pintar de nuevo; sincronizar con reset/restauración/autosave.

**Resultado esperado:** pintar→deshacer→rehacer reconstruye la obra; editar después de deshacer invalida rehacer; botones reflejan disponibilidad; memoria queda limitada.

**Dependencias:** WEB-08/09/10.

### B-UX-01 — Poner lienzo y controles esenciales al alcance

**Actualización 07/10/2026:** Lienzo y controles visibles en diez combinaciones de viewport/modo; falta QA física y prueba acompañada. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** lienzo arriba, 8–12 colores cercanos, deshacer/guardar visibles; plegar paletas avanzadas, color personalizado y grosor; retirar reservas publicitarias vacías del editor.

**Resultado esperado:** a 360/390/768 px y en paisaje el primer lienzo es visible y utilizable; controles no tapan zona activa ni saltan bajo el dedo; sin scroll horizontal. La meta ≥8/10 primeras pinturas en ≤30 s requiere después prueba acompañada.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-UX-02 — Simplificar selección y destacar continuar

**Actualización 07/10/2026:** Catálogo visual y colección de copias locales implementados; falta observar selección con personas. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** miniaturas grandes, temas y dificultad visual, continuar destacado; opciones de búsqueda avanzadas para adulto; estados vacío/carga/error.

**Resultado esperado:** elegir dibujo visualmente sin lectura obligatoria; abrir desde home en una acción; adulto encuentra tema en ≤3 pasos; listado de guardados no promete obras ausentes.

**Dependencias:** WEB-05 y CAT-01 para clasificación definitiva.

### B-UX-03 — Corregir controles ficticios y enlaces de home

**Actualización 07/10/2026:** Home sin controles ficticios, enlaces y promesas corregidos; falta correo/URL confirmado del operador. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** hacer funcionales los botones de maqueta o convertirlos en elementos decorativos sin foco; CTA principal al balde y pincel secundario; enlaces descriptivos a categorías, privacidad y contacto real; precisar promesas de funciones/gratuidad.

**Resultado esperado:** tabulación no cae en acciones ficticias; enlaces llegan a destinos correctos; no se promete rehacer antes de WEB-11; contacto usa información confirmada del operador.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-UX-04 — Mejorar foco, nombres y estados accesibles

**Actualización 07/10/2026:** Foco, nombres, selección, teclado y contraste esencial verificados; faltan lector real y revisión integral. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** nombres de colores, etiquetas útiles, selección perceptible además de color, foco visible, navegación de diálogos y anuncios de estado; objetivos táctiles propios de 44–48 px con separación.

**Resultado esperado:** controles usables por teclado y estados anunciados por lector; contraste y foco verificados; Escape/cierre devuelven foco; no declarar accesibilidad completa del canvas sin auditarla.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-UX-05 — Separar controles adultos de la actividad

**Actualización 07/10/2026:** Zona adulta, impresión y recorrido sin aceptar implementados; PRIV-01/02 y decisiones de audiencia pendientes. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** ubicar privacidad, impresión, compras futuras y enlaces externos en un recorrido adulto claro; mantener pintar accesible al rechazar.

**Resultado esperado:** el niño no necesita aceptar publicidad ni resolver compras para usar herramientas; zona adulta identificable; gate de interfaz no se presenta como consentimiento parental verificable.

**Dependencias:** PRIV-01/02; decisiones de audiencia.

### B-CAT-01 — Unificar taxonomía y metadatos de catálogo

**Actualización 07/10/2026:** Fuente técnica única, taxonomía y enlaces web verificados; falta analyzer/tests/recorrido Flutter con SDK compatible. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** categorías coherentes para casas/paisajes y demás dibujos; metadatos de dificultad/tema; definir diferencias intencionales entre plataformas con slugs estables.

**Resultado esperado:** ningún dibujo se clasifica en un tema ajeno; filtros/enlaces conservan identidad; discrepancias se documentan o corrigen. Igualar cantidades no es por sí solo un criterio de calidad.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-CAT-02 — Registrar procedencia y filtrar publicación comercial

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** campos de autor/fuente/licencia/uso permitido/evidencia/estado; validación de inclusión comercial y exclusión de contenido no acreditado en catálogo, fichas, packs y sitemap.

**Resultado esperado:** solo los assets marcados como autorizados con evidencia entran en una salida comercial; pruebas detectan entradas incompletas; selección piloto de 24–40 se aplica cuando esté aprobada.

**Dependencia externa:** responsable aporta y valida derechos; un campo de licencia no demuestra titularidad. No publicar 19 fichas Gabby para completar el conteo.

### B-CAT-03 — Generar variantes y catálogos reproducibles

**Actualización 07/10/2026:** Pipeline técnico determinista: 227 salidas, ocho tests y repetición sin diferencias; CAT-02 excluida por el usuario, sin autorización comercial. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [x] Alcance técnico verificado el 07/10/2026. Repetir al cambiar código; los criterios originales de abajo se conservan para regresión.

**Preparación y casos a cubrir:** maestro→PNG ≤1200→thumb ≤360→móvil→catálogos; parámetros documentados; salida determinista e inclusión explícita por plataforma; preservar originales.

**Resultado esperado:** ejecución repetida no introduce diferencias inesperadas; detecta slugs duplicados, archivos ausentes y proporciones incompatibles; actualizar un dibujo no requiere editar manualmente tres catálogos.

**Dependencias:** CAT-01/02. Puede adelantarse si el mantenimiento manual lo justifica.

### B-CAT-04 — Comprobar calidad técnica de cada dibujo publicado

**Actualización 07/10/2026:** 62 controles técnicos y 248 recorridos automatizados pintar/exportar; faltan revisión manual de contornos y dispositivos. [Evidencia](implementation-2026-10-07/web-eleven-twenty.md).

- [ ] Cierre pendiente tras implementación local; consultar la actualización 11–20 y las dependencias restantes.

**Preparación y casos a cubrir:** controles automáticos de dimensiones/proporciones y casos representativos de contornos; recorrido manual pintar/exportar por dibujo; registrar aprobación técnica independiente de derechos.

**Resultado esperado:** 100% del piloto tiene registro de pintar/exportar, regiones problemáticas corregidas y salida legible; PNG válido no se toma como prueba de contornos cerrados.

**Dependencias:** WEB-02/06, CAT-02.

### B-SEO-01 — Mejorar plantillas y enlaces de páginas temáticas

**Actualización 07/10/2026:** Seis páginas existentes de animales/dinosaurios/vehículos distinguen colección y guía adulta; faltan derechos y revisión del piloto. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** aplicar a 4–6 páginas contenido adulto aprobado: preview, facilidad, uso, impresión y relacionados; enlaces al editor con asset correcto; separar intención de categoría y pack o consolidar duplicados reales.

**Resultado esperado:** páginas estáticas rastreables y útiles; canonical correcto; todos los enlaces funcionan; no generar páginas masivas sustituyendo una palabra.

**Dependencias:** CAT-01/02/04, UX-03. Textos y utilidad requieren criterio editorial; indexación/demanda se evalúan fuera del código.

### B-SEO-02 — Unificar host, robots, sitemap y rutas

**Actualización 07/10/2026:** WWW verificado, robots/sitemap alineados y 61 rutas locales comprobadas; quedan cierre comercial y verificación pública de cambios. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** escoger host canónico conforme a despliegue real, alinear referencias y comprobar redirecciones si el hosting las permite; actualizar sitemap desde páginas publicables.

**Resultado esperado:** URLs del sitemap responden y usan el mismo host; sin entradas excluidas/rotas; editor con queries conserva canonical; no prometer indexación por pasar estos checks.

**Dependencias:** CAT-02 y host confirmado.

### B-SEO-03 — Piloto breve en inglés

**Actualización 07/10/2026:** Diferido conforme al plan: sin señal española, oferta/recurso y traducción aprobados; no se abrió otro frente. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** una landing y pack breve localizados, navegación de idioma y referencias canónicas/hreflang cuando correspondan; precio/moneda transparentes.

**Resultado esperado:** recorrido completo sin mezcla de idiomas, URLs válidas, métricas comparables permitidas.

**Dependencias:** núcleo fiable y señal de validación en español; traducción aprobada y oferta definida. No traducir todo el catálogo como requisito inicial.

### B-PRIV-01 — Centralizar preferencias y carga de terceros

**Actualización 07/10/2026:** Preferencias v2 comunes, legacy no concede permisos, storage/cross-tab/revocación y terceros apagados verificados en esta versión. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [x] Alcance técnico de esta versión sin collectors verificado. Reabrir auditoría antes de habilitar cualquier proveedor.

**Preparación y casos a cubrir:** un único módulo de preferencias con estados/versionado, controles adultos y revocación; vincular carga de scripts/eventos al tratamiento permitido. No conceder personalización/datos publicitarios automáticamente por “Aceptar”. Manejar storage bloqueado.

**Resultado esperado:** actividad completa sin aceptar; home/editores/páginas comparten estado coherente; rechazar/revocar no pierde dibujo; no salen solicitudes prohibidas por la configuración elegida; callbacks diferidos no cargan terceros tras revocar.

**Dependencia externa:** definir tratamientos, audiencia, mercados y necesidad de CMP/proveedor; conservar terceros apagados cuando no exista una configuración autorizada.

### B-PRIV-02 — Publicar política y contacto coherentes

**Actualización 07/10/2026:** Información técnica web/app unificada y noindex mientras faltan operador/contacto, mercados y texto definitivo. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** integrar texto aprobado para web/app, operador/contacto, dibujo local, exportación, backups posibles, terceros, conservación y controles; sustituir anclas contradictorias por destino único con secciones.

**Resultado esperado:** todos los enlaces abren la política correcta; versión visible; enlaces de preferencias operativos; la descripción coincide con flujos observados.

**Dependencias:** PRIV-01/03; datos y texto jurídico confirmados. El desarrollo no debe inventar operador ni derechos legales.

### B-PRIV-03 — Documentar solicitudes reales y configuración de seguridad

**Actualización 07/10/2026:** HAR local de 56 estados y cabeceras públicas registrados; quedan app física, producción nueva y proveedores futuros. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** capturar red/cookies/storage en sesión limpia, sin decidir, al rechazar, aceptar y revocar; inventariar scripts y parámetros. Ajustar CSP mínima para servicios aprobados; comprobar cabeceras del host y no abrir comodines/unsafe-eval para ads.

**Resultado esperado:** HAR/inventario con datos sensibles depurados y versiones; diferencia entre tráfico observado y lectura de código; ausencia de bloqueos injustificados y de solicitudes no permitidas.

**Dependencias:** PRIV-01 y servicios seleccionados; no activar anuncios comerciales como parte de la prueba.

### B-DATA-01 — Minimizar payloads y validar source

**Actualización 07/10/2026:** Esquemas mínimos web/móvil con source/enums/slugs conocidos; campos libres descartados y collectors apagados. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [x] Alcance técnico de esta versión sin collectors verificado. Reabrir auditoría antes de habilitar cualquier proveedor.

**Preparación y casos a cubrir:** enum de source/tema/modo/plataforma/resultado y bandas temporales; rechazar URLs/texto arbitrario; evitar trazos, dibujos, búsquedas libres y datos personales; versión de esquema.

**Resultado esperado:** payloads fuera del esquema se descartan o normalizan; un `source` malicioso/arbitrario no se transmite; sin eventos por cada toque.

**Dependencias:** tratamientos permitidos definidos.

### B-DATA-02 — Instrumentar calidad y continuidad con resultados reales

**Actualización 07/10/2026:** Resultados reales de apertura/save/restore/export y first_paint probados en web; UI móvil e integración de collector autorizada pendientes. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** apertura exitosa/error, first_paint una vez, local_save_success/failure, restore_success y exportación con semántica precisa; datos mínimos. Mantener collector móvil desactivado hasta autorización de tratamiento.

**Resultado esperado:** fallo de escritura no genera éxito; apertura fallida no cuenta como activación; restauración obsoleta no cuenta; exportación no afirma archivo abierto; eventos no salen cuando no está permitido.

**Dependencias:** WEB-05/06, PRIV-01, DATA-01. No crear fingerprint ni cuentas para medir regreso.

### B-ADS-01 — Implementar una ubicación web admisible para adultos

**Actualización 07/10/2026:** Componente adulto inactivo con estados, limpieza de resultados tardíos y prohibición en editor; falta integración/proveedor y aprobación/derechos. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** unidad explícita y marcada, separada de herramientas/tarjetas; modo sin ads, estados de carga/error, espacio colapsable sin saltos peligrosos; excluir ads del editor y revisar Auto Ads. Aplicar señales de audiencia soportadas por el producto/SDK confirmado.

**Resultado esperado:** creatividades de prueba verificadas sin clics comerciales; ninguna unidad encima/junto al lienzo, colores o guardar; error/rechazo sigue permitiendo actividad; sin refresh propio, interstitial ni rewarded.

**Dependencias externas:** PRIV-01/02/03, derechos, revisión de ámbito, configuración infantil aplicable y aprobación de cuenta. Una página etiquetada “adultos” no acredita audiencia adulta.

### B-ADS-02 — Validar ads.txt y añadir app-ads.txt cuando corresponda

**Actualización 07/10/2026:** ads.txt válido y HTTP 200; app-ads.txt HTTP 404, sin vendedor/ficha móvil confirmados: no se inventó el archivo. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** usar vendedor autorizado confirmado y servir registros en el dominio enlazado por la ficha; distinguir archivo web y móvil.

**Resultado esperado:** respuestas públicas correctas, registro sin placeholders; verificación de consola registrada por responsable.

**Dependencia externa:** proveedor/cuenta/ficha/dominio confirmados; código no garantiza app readiness.

### B-MOB-01 — Recuperar autosave tras fallos y guardar en lifecycle

**Actualización 07/10/2026:** Autosave recuperable, snapshot, dispose idempotente, estado/reintento y lifecycle implementados; core probado, Flutter/QA física pendientes. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** recuperar cadena de Futures tras rechazo, capturar errores de Timer; flush al suspender/salir y coordinación antes de desmontar; estados honestos.

**Resultado esperado:** fallo inyectado→siguiente save exitoso; no queda rechazo sin capturar; navegación/suspensión conserva última obra verificable; “guardado” aparece después de escribir.

**Dependencias:** MOB-02; QA física para cierre.

### B-MOB-02 — Escrituras atómicas y lecturas sin mutación

**Actualización 07/10/2026:** Reemplazo temporal/rename con backups, lecturas sin mutación y cola serializada comprobados en núcleo real; falta Flutter/QA móvil. [Evidencia](implementation-2026-10-07/items-21-31.md).

- [ ] Cierre pendiente; consultar la actualización 21–31 para lo ya verificado y la dependencia concreta restante.

**Preparación y casos a cubrir:** PNG/índice temporal+rename con recuperación; ampliar serialización existente para migración/reparación; separar lectura pura de escritura; coherencia entre archivos e índice.

**Resultado esperado:** interrupción no destruye último PNG válido; índice corrupto recupera obras y comunica límites de metadatos; save/load/list/favorite/clear concurrentes no pierden entradas; fallo no bloquea operaciones siguientes.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-MOB-03 — Estados seguros del banner

**Continuación 07/10/2026:** Controlador con estados, descarte tardío, disposición única, timeout y tres intentos máximos; pruebas de permiso/fallo/revocación/desmontaje aprobadas. Falta integración nativa en dispositivos con unidades de prueba permitidas. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** estados vacío/cargando/listo/fallo; limpiar referencia al disponer, comprobar mounted tras await y evitar cargas concurrentes; reintento limitado con backoff; mostrar solo anuncio listo.

**Resultado esperado:** fallo/desmontaje/reintento no monta anuncio dispuesto ni duplica recursos; sin hueco inútil ni bucle de solicitudes; app continúa sin ads.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-MOB-04 — Validar configuración publicitaria por ambiente

**Continuación 07/10/2026:** Anuncios desactivados por defecto; contrato Dart/Gradle/iOS y guardas release sin fallback a test. Seis casos shell iOS y tests Dart aprobados. Falta inspección de release firmado y build iOS; plugin nativo sigue incluido. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** contrato debug/test/producción y opción release sin ads; IDs de prueba explícitos en test; release monetizado falla ante IDs productivos ausentes o configuración incompleta; no versionar secretos.

**Resultado esperado:** artefacto release monetizado no usa silenciosamente test ID; release sin ads funciona sin inicializar SDK publicitario; configuración efectiva inspeccionada.

**Dependencias:** MOB-03/05 y valores de cuenta confirmados.

### B-MOB-05 — Robustecer UMP y revisar SDKs/permisos

**Continuación 07/10/2026:** UMP con estados, timeout, canRequestAds, opciones según requirement status y bloqueo/revocación antes de banner; adaptación al SDK 7.0.0 y pruebas con gateway fake. SDKs/permisos/declaraciones/red nativos y decisiones de audiencia siguen pendientes. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** error UMP con estado explícito y consulta canRequestAds según SDK; opciones de privacidad según requirement status; tratamiento infantil antes de inicializar; verificar compatibilidad de APIs por versión, SDKs/adaptadores, manifest fusionado, identificadores y declaraciones técnicas.

**Resultado esperado:** error/rechazo no inicializa ads sin habilitación válida; configuración efectiva registrada; AD_ID y permisos cumplen decisiones de audiencia; Privacy manifests/required reason APIs revisados también en plugins.

**Dependencia externa:** mercados/audiencia, CMP/mensajes y requisitos vigentes confirmados. NPA/gate no sustituyen consentimiento parental ni aprobación infantil Apple.

### B-MOB-06 — Compartir con origen en iPad y errores recuperables

**Continuación 07/10/2026:** Origen real del botón, PNG temporal único y limpieza acotada; distingue compartido/cancelado/desconocido/fallo. Tests de archivo real y callback aprobados; share sheet físico iPad/iPhone/Android pendiente. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** pasar rectángulo de origen del botón a sharePositionOrigin; distinguir cancelar/error/compartir; gestionar archivos temporales y evitar bloquear UI.

**Resultado esperado:** share sheet real abre en iPad en ambas orientaciones; Android/iPhone siguen funcionando; cancelar/fallo vuelve a actividad sin afirmar entrega.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-MOB-07 — Serializar acciones y medir rendimiento del motor

**Continuación 07/10/2026:** Bloqueo de fill/acciones incompatibles, descarte tras dispose, generación de imagen protegida e historial acotado; carreras y 20 ediciones probadas. Perfil CPU/RAM, zoom/multitáctil y persistencia física pendientes. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** impedir resultados de fill obsoletos; coordinar undo/reset/export; perfilar snapshots/encoding y mover trabajo fuera de UI solo si se justifica; historial limitado.

**Resultado esperado:** acciones rápidas no sobrescriben obra nueva; 20 gestos/rellenos en Android modesto sin cierre; zoom/coordenadas y multitáctil verificados; registrar CPU/RAM y objetivos de respuesta de WEB-10.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

### B-MOB-08 — Mejorar controles adultos, reset y accesibilidad

**Continuación 07/10/2026:** Desafío adulto variable, reinicio confirmable y recuperable, foco/errores y acciones serializadas; widgets aprobados. Lectores, texto grande, estrecho/paisaje y adecuación final a audiencia/plataforma pendientes; no verifica consentimiento legal. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** sustituir gate fijo 4+3 por mecanismo de interfaz apropiado a plataforma; salidas/compras en zona adulta; reset cancelable/recuperable; semántica, foco, objetivos táctiles y textos grandes.

**Resultado esperado:** links externos y futuras compras usan recorrido adulto; reset no pierde obra accidentalmente; pantalla estrecha/paisaje/lector/textos grandes probados; no se anuncia gate como verificación legal.

**Dependencias:** MOB-01/07 y audiencia definida.

### B-MOB-09 — Mostrar obra real en Mis dibujos

**Continuación 07/10/2026:** Miniatura compuesta desde obra PNG local con contornos, isolate y caché de 24 entradas; SliverList lazy, favoritos sin PNG y fallback. Composición real/corrupción probadas; QA física de la lista se conserva en el registro general. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [x] Alcance técnico comprobado el 07/10/2026; las verificaciones físicas/nativas quedan en C-* y la matriz. Repetir ante cambios.

**Preparación y casos a cubrir:** miniatura de la obra guardada con carga/caché acotadas, fallback al original; distinguir favorito sin pintar de trabajo en curso.

**Resultado esperado:** preview refleja última revisión guardada; no bloquea lista ni carga todos los PNG completos; archivos ausentes/corruptos tienen fallback.

**Dependencias:** MOB-02.

### B-MOB-10 — Rehacer en Flutter

**Continuación 07/10/2026:** Undo/redo con máximo compartido de ocho pasos y 24 MiB de historial codificado; ramas, reset y estado/botones probados con píxeles reales y widgets. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [x] Alcance técnico comprobado el 07/10/2026; las verificaciones físicas/nativas quedan en C-* y la matriz. Repetir ante cambios.

**Preparación y casos a cubrir:** historial acotado de undo/redo, invalidez de rama tras edición y estados de controles.

**Resultado esperado:** undo/redo reproducen capa correcta; cambiar obra/reset no mezcla historiales; autosave persiste resultado final.

**Dependencias:** MOB-07.

### B-MOB-11 — Resolver matriz de build y comprobar release Android

**Continuación 07/10/2026:** SDK Flutter 3.47.6/Dart 3.13.5 aislado; analyzer sin incidencias y 24 tests aprobados. Matriz AGP 8.12.1/Gradle 9.1.0/Kotlin 2.3.20; resultado de compilación debug y dependencias restantes en informe. Release firmado/instalación/offline físicos pendientes. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** confirmar requisitos efectivos Flutter/AGP/Kotlin/share_plus y ajustar lo necesario; verificar target SDK vigente y artefacto firmado con configuración correcta. Resolver entorno/dependencias antes de repetir checks.

**Resultado esperado:** analyzer/tests concluyen, build release instala y abre; offline/persistencia/compartir y fallo de banner se prueban; target efectivo registrado; ninguna clave privada en repo/logs.

**Dependencias:** MOB-01/02/06 y correcciones de ads si se incluyen. Activar rama Android solo con demanda de instalación/offline; aprobación/testers de tienda son externos.

### B-MOB-12 — Preparar build y QA iOS/iPad cuando haya recursos

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** SDK/Xcode/firma/provisioning efectivos, permisos/Privacy manifests, iPad/compartir y opciones de distribución infantil; preferir ruta sin ads cuando no exista soporte admitido.

**Resultado esperado:** build firmado y pruebas reales en iPhone/iPad, con configuración/documentación técnica concordante.

**Dependencias:** validación comercial, presupuesto/entorno macOS, MOB-06/08 y revisión externa de tienda. No ejecutar como obligación del trimestre.

### B-COM-01 — Página de oferta original, preview e impresión

**Pospuesto por decisión del usuario:** no ejecutar esta tarea ni sus pruebas de venta/compra en el alcance actual. Retomar solo por nueva indicación expresa.

**Preparación y casos a cubrir:** una oferta inicial con contenido aprobado, muestra gratuita, versión imprimible legible, precio/moneda, licencia y entrega claramente descritos; precisar alcance de uso gratis.

**Resultado esperado:** preview y salida impresa/PDF se verifican; ningún asset no acreditado; niños no reciben presión de compra; precio piloto USD 12 se usa solo si se confirma.

**Dependencias:** CAT-02/04, UX-05; pack y términos aprobados. No requiere backend propio.

### B-COM-02 — Integrar cobro y entrega solo al autorizar ventas

**Pospuesto por decisión del usuario:** no ejecutar esta tarea ni sus pruebas de venta/compra en el alcance actual. Retomar solo por nueva indicación expresa.

**Preparación y casos a cubrir:** checkout alojado o solución mínima adecuada; entrega tras estado real de pago, idempotencia, errores/reembolsos y datos mínimos; validar firmas del proveedor si se utilizan webhooks.

**Resultado esperado:** entorno de prueba cubre pagado, cancelado, fallido y duplicado; no entrega por query manipulada; total bruto/devoluciones concilian con pedidos; secretos no llegan a cliente/logs.

**Dependencias externas:** autorización de ventas, operador/mercados, proveedor/cobro, términos y derechos confirmados. Sin cuentas infantiles ni infraestructura propia injustificada.

### B-COM-03 — Compra única para quitar anuncios móvil

**Pospuesto por decisión del usuario:** no ejecutar esta tarea ni sus pruebas de venta/compra en el alcance actual. Retomar solo por nueva indicación expresa.

**Preparación y casos a cubrir:** compra adulta, estado pendiente/error, restauración y entitlement persistente verificable; ocultar banner al adquirir; reconciliar ingresos y pérdida de impresiones.

**Resultado esperado:** compra/restauración/cancelación/reinstalación probadas en sandbox; fallo no concede ni revoca arbitrariamente; no mostrar venta funcional mientras siga “Próximamente”.

**Dependencias:** app con uso y oferta autorizada, cuentas de tienda, MOB-03/04/08. Precio/comisión son decisiones externas.

### B-COM-04 — Compartir enlace opcional desde exportación adulta

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** compartir archivo local y enlace limpio opcional; sin contactos, contenido del niño en URL ni subida automática de obra.

**Resultado esperado:** adulto puede omitir enlace; cancelar no interrumpe actividad; no hay permisos de agenda ni paso obligatorio.

**Dependencias:** WEB-06 o MOB-06, UX-05.

### B-QA-02 — Pruebas de navegador de continuidad y exportación

- [ ] Verificación pendiente. **Momento:** Parcial; ejecutar casos anteriores y resolver dependencia restante.

**Preparación y casos a cubrir:** ambos modos, autosave con fallos/cuota, restauración, cambios rápidos, reset, export y rechazo/revocación; fixtures de canvas verificables.

**Resultado esperado:** recorridos reproducibles detectan pérdidas/carreras; viewport 360/390/768 y escritorio cubiertos; resultados de dispositivos físicos separados de emulación; mantener los 20 recorridos de WEB-05 como evidencia de release.

**Dependencias:** WEB-03 a WEB-09, PRIV-01; sin anuncios comerciales en tests.

### B-QA-03 — Tests Flutter que detecten los fallos auditados

**Continuación 07/10/2026:** Assert de relleno corregido para comparar RGBA/contorno. Analyzer terminó sin incidencias; 24 tests Flutter y 12 del núcleo de archivos/autosave aprobados, incluyendo fallos, lifecycle simulado, banner/UMP fake, exportación, redo y carreras. Integración nativa/QA física queda registrada por tarea. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [x] Alcance técnico comprobado el 07/10/2026; las verificaciones físicas/nativas quedan en C-* y la matriz. Repetir ante cambios.

**Preparación y casos a cubrir:** corregir assert de relleno que solo mira rojo; comprobar canales/contornos; fallo→recuperación autosave, lifecycle, storage corrupto/concurrente, banner/UMP, export y carreras.

**Resultado esperado:** fixtures fallan con comportamiento defectuoso y pasan tras corrección; analyzer/tests terminan con resultado verificable; no considerar un proceso sin salida como aprobado.

**Dependencias:** MOB-01/02/03/05/06/07, entorno Flutter disponible.

### B-CI-01 — Checks antes de publicar Pages y rollback documentado

**Continuación 07/10/2026:** Validación requerida antes de deploy, mismo gate en PR y publicación exclusiva de web; revisión registrada y runbook de rollback concreto. YAML/gates locales aprobados; ejecución y rollback remotos pendientes, sin publicar. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** job de validación requerido antes de upload/deploy; ejecutarlo también en PR; publicar únicamente web; registrar revisión desplegada y procedimiento de retorno a versión verificada.

**Resultado esperado:** un check fallido impide deploy; docs/evidencia no entran al sitio; commit publicado identificable; rollback concreto documentado y verificable sin publicación automática durante este backlog.

**Dependencias:** QA-01; QA-02 según capacidad/entorno.

### B-CI-02 — CI y smoke tests de release móvil

**Continuación 07/10/2026:** Workflow manual con SDK fijado, lock, analyzer/tests y APK debug sin ads; artefacto de prueba con retención corta. No configura secretos ni release firmado; ejecución remota y smoke físico pendientes. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** analyzer/tests y build Android reproducible; firma/configuración a través de secretos protegidos; matriz/manual de offline, lifecycle, share y banner; iOS en macOS solo al abrir esa rama.

**Resultado esperado:** fallo bloquea artefacto; logs no filtran claves; instrucciones distinguen build debug, release firmado y aprobación de tienda.

**Dependencias:** QA-03, MOB-11 y plataforma confirmada.

### B-MAINT-01 — Centralizar código repetido tras estabilizarlo

**Continuación 07/10/2026:** Navegación/guardado al salir compartidos entre motores; Flutter separa controles adultos, miniaturas y estados/configuración publicitarios. Regresiones aprobadas; catálogo/paletas/UI restante no se reescriben en este alcance. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [ ] Verificación pendiente. **Momento:** Después de implementar/autorizar su rama.

**Preparación y casos a cubrir:** extraer consentimiento, catálogo/paletas y utilidades duplicadas con contratos claros; dividir main.dart solo en zonas donde facilite cambios/pruebas. Evitar reescritura global o nuevo framework.

**Resultado esperado:** mismos recorridos y estado preservados, menor duplicación medible; regresiones funcionales de las áreas extraídas pasan.

**Dependencias:** núcleo reparado, PRIV-01 y pruebas pertinentes.

### B-DOC-01 — Alinear instrucciones técnicas con el producto real

**Continuación 07/10/2026:** README raíz/web/assets/Flutter alineados con código, pipeline, ambientes desactivados y límites; comandos, despliegue/rollback y pruebas restantes documentados. Informes previos conservados como históricos. [Evidencia](implementation-2026-10-07/remaining-code.md).

- [x] Alcance técnico comprobado el 07/10/2026; las verificaciones físicas/nativas quedan en C-* y la matriz. Repetir ante cambios.

**Preparación y casos a cubrir:** reflejar Flutter existente, pipeline/recursos reales, ubicación ads autorizada, ambientes, comandos que validan y límites de QA; actualizar al implementar cada tarea.

**Resultado esperado:** instrucciones reproducibles, sin funciones/promesas inexistentes ni contradicciones con privacidad; diagnóstico histórico conservado como histórico.

Dependencias y preparación: ver la tarea correspondiente en el backlog.

## Validación con personas, separada de QA técnica

Estas pruebas de la auditoría todavía no se hicieron. Ejecutarlas después de preparar la actividad y reclutamiento autorizado; no confundir tests de software con investigación de demanda.

- [ ] **V-01 — Adultos/docentes:** cinco adultos y dos docentes revisan el recorrido; identificar acción principal y contacto en <10 s, encontrar tema en ≤3 pasos y registrar utilidad/errores. Relacionadas: UX-02/03 y plan de auditoría.
- [ ] **V-02 — Sesiones acompañadas:** seis a diez sesiones del tramo piloto elegido, con autorización de responsables; completar diez observaciones para evaluar ≥8/10 primeras pinturas en ≤30 s y ≥7/10 tareas sin pérdida. Si hay menos de diez, mostrar la fracción y dejar el umbral pendiente. No recoger nombres, vídeo/voz o telemetría publicitaria infantil por defecto. Son umbrales elegidos, no garantías ni significancia estadística.
- [ ] **V-03 — Regreso:** seguimiento adulto a siete días, primero diez y ampliar a veinte familias si se puede; anotar respuestas y ausencia de respuesta; evaluar el umbral de cinco regresos de veinte. Una invitación puede sesgar retorno; no llamarlo retención orgánica.
- [ ] **V-04 — Actividad/pack terminado:** cuando exista oferta original autorizada, comprobar impresión/PDF, instrucciones y uso con adultos; registrar devolución/uso y ventas externas si se autoriza vender. Intención verbal no sustituye pago; no procesar ventas como parte de una prueba técnica.

Los experimentos de adquisición, ventas y RPM del informe quedan en el plan de negocio. Sus resultados requieren audiencia y permisos reales; no se resuelven ejecutando un test de código.

## Registro de ejecuciones

Copiar esta fila por caso, dispositivo, modo y repetición cuando corresponda. Para F-05 añadir el número de recorrido; para tareas condicionales registrar primero si están listas para probar.

| ID/caso | Fecha/responsable | Revisión y URL/entorno | Equipo, SO, navegador/versión | Modo/orientación/repetición | Estado | Resultado observado/incidencia | Evidencia o bloqueo |
|---|---|---|---|---|---|---|---|
| Por completar | — | — | — | — | Pendiente | — | — |

Plantilla ampliada para un fallo:

```text
ID:
Fecha y responsable:
Revisión del código y URL:
Equipo / RAM / SO / navegador / versión:
Modo / dibujo / orientación:
Estado previo y datos de prueba:
Pasos exactos:
Resultado esperado:
Resultado observado:
Reproducibilidad (intentos/fallos):
Estado: Pendiente / Bloqueada / Aprobada / Fallida / No aplica
Evidencia depurada:
Incidencia y tarea del backlog:
Dependencia o motivo de No aplica:
Próxima acción:
```

## Cierre

### Continuación MAINT-01 / DATA-02 / SEO-03 — 07/10/2026

Las pruebas automatizadas de esta continuación están en [el informe](implementation-2026-10-07/maint-data-seo3.md). Firebase/GA4 preparados no equivale a recepción externa verificada. Mantener estas pruebas pendientes:

| Caso | Dependencia | Comprobación por realizar | Estado |
|---|---|---|---|
| D-GA-01 | ID de propiedad, tratamientos/avisos y staging | Capturar solicitudes/cookies antes de decidir, al rechazar, aceptar, revocar y entre tabs. Cero carga/pings antes de permiso en web; SDK ya descargado deja de medir tras revocar. | Pendiente |
| D-GA-02 | Cuenta/configuración GA4 real | Desactivar Enhanced Measurement/etiquetas extra; inspeccionar payloads, origen, eventos automáticos y recepción DebugView/Realtime. No exponer query/referrer, dibujos, texto libre ni publicidad. | Pendiente |
| D-FB-01 | Proyecto Firebase real, revisión de tratamiento y Android físico | Arranque frío antes de permiso y con permiso de una sesión anterior, background/cierre forzado/reapertura, rechazar/revocar mientras SDK carga; inspeccionar SDK nativo, cookies/IDs, red y datos automáticos. El apagado del build default está comprobado en manifiesto, no por captura de red física. | Pendiente |
| D-FB-02 | Android/configuración real | Verificar en Firebase éxito/fallo de escritura, restore solo tras PNG válido, primera pintura única, ausencia de activación por borrador y efecto de un error del collector; no contar compartir cancelado. | Pendiente |
| D-FB-03 | Mac, proyecto iOS y audiencia/tratamiento revisados | Compilar con iOS mínimo 15 y pod sin AdId, revisar manifest/privacy declarations y arranque/consentimiento/red. iOS permanece desactivado en el código y plist; no activar hasta verificar ese recorrido. | Bloqueada por entorno/configuración |
| S-EN-01 | Revisor de inglés + pruebas acompañadas físicas | Revisar vocabulario/accesibilidad, diálogos y estados de error; probar los cuatro dinosaurios con balde/pincel, modo independiente, guardar/continuar/PNG/impresión y regreso a la landing en Android/Safari/iPad. | Pendiente |
| S-EN-02 | Publicación autorizada + muestra de adquisición | Search Console, alternates/canonical/indexación; comparar español/inglés con cobertura de permisos, tamaños de muestra y visitas adultas cualificadas. No inferir demanda de los tests ni de `resource_open`. | Pendiente |
| W-BR-ALPHA | Corrección del formato/migración de guardado por capas | Restaurar un PNG real con contornos de alfa parcial y comparar todos los píxeles, repetir 5 ciclos guardar/recargar/restaurar y exportar. La reconstrucción actual del pincel puede cambiar bordes suavizados; las zonas fuera de la máscara se conservaron. Añadir fixture significativo y mantener copias previas al migrar. | Fallo observado; corrección pendiente |

No se reactivan CAT-02 ni COM-01/02/03 por estas pruebas.

WEB-06 se cierra cuando sus exportaciones físicas estén verificadas. QA-02 requiere además la matriz de continuidad y el recorrido de privacidad definitivo. Mantener ambos estados **Parcial** hasta reunir esa evidencia. Las demás tareas se cierran contra sus propios criterios, sin heredar aprobación por una plataforma distinta.

Actualizar este archivo junto al backlog al implementar o ejecutar una prueba: fecha, estado, evidencia y pendientes restantes. No sobrescribir los informes históricos de auditoría/implementación.
