# PaintMe — Product backlog técnico

Creado: 07/10/2026. Fuente: [diagnóstico del 03/10/2026](audit-2026-10-03/INFORME-PAINTME.md) y revisión local del 07/10/2026.

Última actualización: **14/10/2026**.

**Publicación verificada 14/10/2026:** versión web autorizada publicada en Pages, commit `fbe3610`, [run exitoso](https://github.com/amilcarpg/ColoreameCanvas2/actions/runs/38629204487). 247 archivos públicos coinciden con el manifiesto; `/familias.html` responde 200 y smoke de guardar/recuperar/descargar en ambos editores aprobado, sin terceros ni cookies. Servicios apagados. Rollback ensayado localmente con árbol exacto; rollback público no ejecutado. [Resultado y evidencia](PUBLICACION-WEB-2026-10-14.md).

**Cambio de ruta 14/10/2026:** Por solicitud del usuario, «Para familias y docentes» pasa a `familias.html`; auxiliares renombrados a `familias.css` y `familias.js`. Actualizados enlaces de home/editores/categorías/guías/privacidad, canonical/sitemap, configuración de analítica, selección del banner y pruebas/documentación vigente. `adults.html` conserva una redirección cliente compatible (parámetros y anclas preservados con JavaScript, fallback sin JavaScript), canonical a la nueva página y `noindex`; no es un 301 del servidor. Cincuenta pruebas locales, quince seleccionadas de navegador y check de 64 rutas HTML/61 URLs sitemap aprobados. El sitemap solo incluye la ruta nueva. Informes archivados preservados; cambios locales sin publicar, por lo que la nueva URL pública debe comprobarse tras desplegar.

Este archivo reúne las recomendaciones que se pueden implementar o verificar mediante código: web, Flutter, herramientas de contenido, configuración, pruebas y CI. Registra el plan y el estado de ejecución; sus entradas no autorizan publicar, activar anuncios, procesar pagos o enviar comunicaciones.

## Resumen de las últimas tareas atendidas — 14/10/2026

Este resumen refleja las tareas trabajadas el 13 y 14 de octubre; no sustituye el estado del resto del backlog. Los registros del 07/10 se conservan como evidencia histórica.

| ID | Estado actual | Resultado y siguiente paso |
|---|---|---|
| UX-03 | Hecho | Contacto confirmado y configurado: `contancto.focuzlab@gmail.com`. |
| UX-05 | Hecho | Interfaz «Para familias y docentes», edad orientativa 4+ y acompañamiento recomendado; decisiones en [documento de producto](DECISIONES-PRODUCTO.md). |
| PRIV-02 | Hecho en el alcance local actual | Política ES/EN, contacto, fecha y enlaces coherentes. Publicación y revisión legal no se acreditan con este cierre. |
| SEO-01 | Hecho en el alcance técnico | Revisión editorial del piloto y ajustes locales ES/EN; derechos e indexación separados. |
| SEO-02 | Hecho en el alcance técnico | 61 URLs públicas y sus canonical verificados, robots/sitemap coherentes y host WWW confirmado. |
| PRIV-03 | Parcial | Evidencia local previa; faltan tráfico de app física y nueva producción con las integraciones finales. |
| DATA-02 | Parcial: datos incorporados, apagados | GA4 y Firebase Android configurados; 55 checks web, tres de importación y seis Flutter aprobados. Recepción y revocación reales pendientes. |
| ADS-01 | Parcial: integración local desactivada | Tres bloques verificados localmente; decisión de mantener Pages. CSP con nonce, audiencia/aprobación y proveedor real pendientes. |
| ADS-02 | Parcial: web autorizado y app AdMob creada | ads.txt Autorizado. PaintMe Android y banner registrados en AdMob; app Debe revisarse, sin tienda vinculada. Falta dominio de ficha y reconocimiento de app-ads.txt. |
| MOB-11 | Parcial | AAB y APK release actualizados con firma PaintMe, validados; APK instalado, pintar/guardar/recuperar tras cierre sin red activa aprobados en Android 15 emulado. Falta compartir, matriz física y tienda. [Evidencia](ANDROID-RELEASE-2026-10-15.md). |

Solo se publicaron `ads.txt` y `app-ads.txt` (commit `80687be24375673860dd4acbe4ec6eeaa5164be8`); los demás cambios de estas tareas siguen locales. No se activaron anuncios ni analítica. CAT-02 continúa excluida y COM-01/02/03 pospuestos. [Evidencia de SEO](SEO-REVISION-2026-10-13.md) y [evidencia de ADS-02/Android](ADS-02-2026-10-14.md).

## Registro vigente para completar PRIV-03, DATA-02 y ADS-01/02 — 14/10/2026

Este registro sustituye los pendientes antiguos que dicen que faltan IDs o publicar los archivos de vendedores. Las notas de ejecución anteriores conservan su fecha y describen etapas históricas. Registrar valores no activa servicios ni acredita una verificación externa. No hay fecha de cierre comprometida: se completan al cumplir los hitos siguientes.

### Valores confirmados y dónde aplicarlos

| Uso | Valor confirmado | Aplicación pendiente o estado |
|---|---|---|
| Sitio / dominio | `https://www.paintme.club/` | Producción web; verificar también redirecciones desde `https://paintme.club/`. |
| GA4 web | `G-XJBQD3ZZ8Q` | Incorporado en `web/site-config.json` → `analytics.measurementId`, con servicios apagados. Confirmar flujo web en consola. |
| Firebase Android: proyecto | `paintme1` | `FIREBASE_PROJECT_ID` de la configuración real Flutter. |
| Firebase Android: número / sender ID | `278253770765` | `FIREBASE_MESSAGING_SENDER_ID`. |
| Firebase Android: app ID | `1:278253770765:android:86885d699ee2c4175cdd44` | `FIREBASE_APP_ID`; no confundir con el paquete Android ni con el ID de GA4 web. |
| Paquete Android / ficha | `com.focuzlab.paintme` | AAB vigente firmado y verificado: 1.0.1 (2), 15/10. APK anterior 1.0.0 (1). Ficha/publicación pendientes; disponibilidad del código 2 por contrastar con Play. [Artefacto](ANDROID-RELEASE-2026-10-15.md). |
| Archivo Firebase recibido | `C:\Users\aparedes\Downloads\google-services(3).json` | Cliente Android importado a `flutter/firebase-config.local.json`, ignorado por Git, ambos flags false. Clave no reproducida en este backlog ni en la web. |
| AdSense: cliente | `ca-pub-9994592587162260` | Ya configurado localmente en `ads.client`. |
| Banner inferior de balde/pincel | `7446331398` | `ads.slots.editorBottom`; ambos editores comparten bloque. |
| Banner inferior de familias | `9685481928` | `ads.slots.familiesBottom`, ruta `/familias.html`. |
| Banner inferior de inicio | `7340274204` | `ads.slots.homeBottom`, rutas `/` y `/index.html`. |
| Registro de vendedores web y móvil | `google.com, pub-9994592587162260, DIRECT, f08c47fec0942fa0` | Publicado en ambos archivos; no falta volver a crearlos. |
| URLs de archivos publicados | `https://www.paintme.club/ads.txt` y `https://www.paintme.club/app-ads.txt` | HTTP 200 y contenido exacto comprobados en el despliegue del 14/10; conservar evidencia de reconocimiento de consola. |
| Ficha Google Play (prueba cerrada) | `https://play.google.com/store/apps/details?id=com.focuzlab.paintme` | Confirmar dominio web efectivo de desarrollador y asociación de esta app en AdMob. El acceso puede depender de la prueba cerrada. |
| Contacto para avisos / privacidad | `contancto.focuzlab@gmail.com` | Confirmado y configurado; conservar esta escritura exacta. |

La audiencia registrada es familiar, con edad orientativa 4+ y acompañamiento recomendado; idiomas español e inglés. Véase [decisiones de producto](DECISIONES-PRODUCTO.md). La página de familias no acredita por sí sola audiencia adulta para publicidad o analítica.

**Estado operativo actual:** valores GA4 y Firebase Android incorporados; `analytics.enabled=false`, `analytics.treatmentReviewed=false`; `ads.enabled=false`, `ads.siteApproved=false`, `ads.treatmentReviewed=false`. Configuración Firebase local con ambos flags false; el ejemplo continúa vacío intencionalmente. Permisos publicitarios denegados. El usuario decide mantener GitHub Pages; la CSP con nonce por respuesta sigue pendiente y el adaptador bloquea `csp_not_ready`.

### Cuándo ejecutar y cuándo cerrar

| Ítem | Próximo trabajo concreto | Momento de ejecución | Evidencia necesaria para cerrar |
|---|---|---|---|
| DATA-02 | Incorporar los valores recibidos; confirmar flujo web/proyecto Android en consola; completar avisos y controles del tratamiento permitido; probar eventos mínimos y revocación. | Configurar primero, con servicios apagados. Hacer la verificación real cuando los controles estén implementados y el entorno de prueba autorizado esté disponible. No depende de aprobar AdSense. | Recepción identificable en GA4/Firebase (por ejemplo DebugView), versión/configuración probadas y red antes de decidir, rechazar, aceptar y revocar según el tratamiento implementado. No basta un collector simulado; no deben salir eventos cuando no esté permitido. |
| ADS-01 | Publicar la integración local de los tres bloques; resolver CSP/alojamiento compatible y señales de permisos/audiencia; confirmar estado aprobado de `paintme.club` en AdSense. | Resolver primero las condiciones técnicas y de tratamiento. Verificar integración real cuando la cuenta/sitio lo permita, sin clics comerciales; habilitar servicio solo tras comprobar esas condiciones. | Estado de aprobación registrado, prueba del proveedor real y de carga/vacío/error/revocación, disposición móvil/escritorio y captura de red. Mantener Auto Ads desactivado y ubicaciones inferiores acordadas. |
| ADS-02 | Consultar estado de `ads.txt` en AdSense; comprobar dominio efectivo de la ficha y reconocimiento de `app-ads.txt` para `com.focuzlab.paintme` en AdMob. | Ya puede verificarse en las consolas: ambos archivos están publicados. Si sigue pendiente el rastreo, volver a comprobar cuando cambie el estado, sin recrear archivos ni exigir un nuevo APK. | Estado de reconocimiento de ambos archivos y asociación dominio/ficha/app registrados con fecha. La aprobación para servir anuncios web se cierra en ADS-01, no en este ítem. |
| PRIV-03 | Capturar tráfico, cookies/storage y cabeceras de producción nueva y app física; inventariar destinos, parámetros y terceros; comparar con permisos efectivos. | Mantener una captura base con servicios apagados; repetir al probar GA4/Firebase y AdSense reales y tras el despliegue final. No cerrar antes de observar las integraciones que se van a entregar. | Evidencia depurada con fecha, URL, versión web/build móvil, dispositivo y estados de permiso/revocación. Documentar diferencias entre código y tráfico observado, cabeceras y ausencia de solicitudes no permitidas; enlazar resultados de DATA-02/ADS-01. |

**Orden práctico:** verificar ADS-02 en consola en paralelo a la configuración de DATA-02; resolver condiciones de ADS-01; completar PRIV-03 con la producción y app finales. La compilación/identidad del APK se sigue en MOB-11. La actualización de este documento no realiza esas integraciones ni cambia su estado a Hecho.

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
**P1 · Hecho · 2–4 h · Origen UX home**
**Cierre 13/10/2026:** El usuario confirmó `contancto.focuzlab@gmail.com`. Configurado en `web/site-config.json` y enlazado desde privacidad; home conserva el destino `familias.html#contacto`. Verificado con Node y el cargador real `familias.js`: configuración JSON, un único enlace `mailto:` con dirección y texto exactos, mensaje de contacto disponible, destino desde home y enlace en privacidad; `git diff --check` aprobado. Esta verificación adicional no utilizó navegador ni dispositivo físico. Cierre local; publicación y recepción de correo no verificadas. PRIV-02 sigue parcial por identidad/país del operador, mercados y texto definitivo.
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
**P1 · Hecho · 3–5 h · Origen UX adultos**
**Cierre 13/10/2026:** Por autorización expresa del usuario, se cierra el alcance de interfaz implementado y verificado abajo. PRIV-02 se conserva como revisión documental independiente; no bloquea este cierre ni se declara completada. País de operación confirmado: Perú; alcance internacional, inicialmente en español e inglés. Las decisiones reutilizables, servicios apagados y preferencia de no publicar datos personales sin autorización se registran en [DECISIONES-PRODUCTO.md](DECISIONES-PRODUCTO.md).
**Alcance confirmado 13/10/2026:** Actividad para niños desde los 4 años como edad orientativa, familias y docentes; acompañamiento recomendado, sin participación adulta continua obligatoria. La página informativa y los enlaces de home/editores se identifican como «Para familias y docentes», con preguntas frecuentes, ayuda, impresión, privacidad y contacto. Pintar sigue accesible sin registro ni paso obligatorio por esa página; preferencias y enlaces externos se identifican para adultos. No se añade un gate de edad ni se presenta la sección como consentimiento parental. Analítica y publicidad se mantienen preparadas y desactivadas hasta completar sus requisitos; ventas siguen pospuestas. LATAM, Estados Unidos y Europa son mercados de interés, no una autorización de tratamiento ni una comprobación de requisitos por país.
**Implementación 13/10/2026:** Textos y navegación unificados en home, balde, pincel y página informativa; cuatro preguntas frecuentes explican edad orientativa, acompañamiento, inicio directo y controles adultos. Localización del nuevo rótulo al inglés conservada. El alcance de interfaz está atendido; se mantiene **Parcial** por PRIV-02 (identidad/país del operador, mercados específicos y texto definitivo), sin activar servicios externos ni publicar.
**Verificación 13/10/2026:** `node scripts/check-web.cjs` aprobado: 50 pruebas de lógica/privacidad/analítica, 63 rutas HTML/canonical y 61 URLs de sitemap. Veinte pruebas existentes seleccionadas de navegador aprobadas en Chromium 155 headless/Windows: piloto inglés, rechazo/revocación sin pérdida, impresión, contacto, ausencia de solicitudes de terceros, publicidad apagada y diez combinaciones modo/viewport (360/390/768 px, paisaje y escritorio). `git diff --check` aprobado. No se realizaron pruebas físicas ni publicación.
**Ejecución 07/10/2026:** Zona adulta, impresión y recorrido sin aceptar implementados; PRIV-01/02 y decisiones de audiencia pendientes. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** home/editores/página adulta; equivalente Flutter en MOB-08.  
**Trabajo:** ubicar privacidad, impresión, compras futuras y enlaces externos en un recorrido adulto claro; mantener pintar accesible al rechazar.  
**Aceptación:** el niño no necesita aceptar publicidad ni resolver compras para usar herramientas; zona adulta identificable; gate de interfaz no se presenta como consentimiento parental verificable.  
**Dependencias:** PRIV-01 y decisiones de audiencia, atendidas para la interfaz actual. PRIV-02 permanece independiente por separación de alcance autorizada el 13/10/2026. Activar servicios externos requiere sus tareas PRIV/DATA/ADS; MOB-08 conserva el alcance móvil.

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
**Publicación 14/10/2026:** correcciones web publicadas y verificadas; recuperación/exportación de producción aprobadas. Se conserva Parcial por QA física/nativa. [Despliegue y evidencia](PUBLICACION-WEB-2026-10-14.md).
**Actualización 14/10/2026:** revisión local de los 62 dibujos, nueve fuentes corregidas y recuperación exacta del pincel; 2 232 controles, 744 PNG, Chromium/WebKit y compatibilidad con obras antiguas verificados. Originales/créditos preservados, sin publicar. Quedan dispositivos físicos, Flutter instalado, impresión y adecuación de dificultad; CAT-02 sigue excluida. [Resultados y evidencia actual](RESULTADO-CHECKLIST-IMAGENES.md).
**Completado en local:** revisión visual de áreas principales de los 62 dibujos; corrección de Triceratops, dos ponies y seis dibujos Gabby mediante el pipeline Python; regeneración de variantes y recuperación compatible con obras anteriores. En los siete dibujos con fragmentación masiva, las microregiones menores de 16 px bajaron de 20 836 a 109 (99,5%). Regresión: 51 pruebas Node, 10 Python y 97 por motor de navegador aprobadas; compatibilidad de las nueve fuentes repetida después de la última corrección.
**Pendiente para cerrar:** pruebas táctiles, zoom/rotación y rendimiento en Android/iPhone/iPad; ejecución instalada Flutter para sus 43 dibujos; apertura en visor del sistema, impresión física y validación de dificultad con el público previsto. Se mantiene **Parcial** hasta completar esta evidencia.
**Límite:** cambios locales sin publicar; revisión técnica independiente de derechos. CAT-02 continúa excluida.
**Ejecución 07/10/2026:** 62 controles técnicos y 248 recorridos automatizados pintar/exportar; faltan revisión manual de contornos y dispositivos. Ver [cambios, pruebas y límites](implementation-2026-10-07/web-eleven-twenty.md).
**Archivos:** fixtures/herramientas locales y assets seleccionados.  
**Trabajo:** controles automáticos de dimensiones/proporciones y casos representativos de contornos; recorrido manual pintar/exportar por dibujo; registrar aprobación técnica independiente de derechos.  
**Aceptación:** 100% del piloto tiene registro de pintar/exportar, regiones problemáticas corregidas y salida legible; PNG válido no se toma como prueba de contornos cerrados.  
**Dependencias:** WEB-02/06, CAT-02.

### SEO-01 — Mejorar plantillas y enlaces de páginas temáticas
**P1 · Hecho (alcance técnico) · 4–8 h · Origen S1/I**
**Cierre 13/10/2026:** Por autorización expresa, revisadas seis páginas existentes y el piloto inglés. Guías gratuitas sin promesa de pack vendible, impresión bajo «Para familias y docentes», acompañamiento recomendado y corrección de «vehículos» conservando slugs. Cincuenta pruebas locales y cuatro pruebas seleccionadas de navegador aprobadas; rutas y enlaces verificados. [Revisión, evidencia pública y límites](SEO-REVISION-2026-10-13.md). Derechos e indexación quedan separados de este cierre técnico; CAT-02 sigue excluida. Ajustes locales sin publicar.
**Ejecución 07/10/2026:** Seis páginas existentes de animales/dinosaurios/vehículos distinguen colección y guía adulta; faltan derechos y revisión del piloto. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [dibujos](../web/dibujos), [categorías](../web/categorias), [packs](../web/packs), home.  
**Trabajo:** aplicar a 4–6 páginas contenido adulto aprobado: preview, facilidad, uso, impresión y relacionados; enlaces al editor con asset correcto; separar intención de categoría y pack o consolidar duplicados reales.  
**Aceptación:** páginas estáticas rastreables y útiles; canonical correcto; todos los enlaces funcionan; no generar páginas masivas sustituyendo una palabra.  
**Dependencias vigentes:** Catálogo existente y UX-03 para los enlaces revisados. Por separación de alcance autorizada el 13/10/2026, derechos/CAT-02, QA gráfica/física de CAT-04 e indexación/demanda no se declaran resueltos por este cierre técnico.

### SEO-02 — Unificar host, robots, sitemap y rutas
**P1 · Hecho (alcance técnico) · 2–4 h · Origen SEO**
**Cierre 13/10/2026:** Las 61 URLs del sitemap público responden 200 y tienen canonical coincidente; sitemap público/local iguales y robots alineado. HTTP y host sin WWW llegan a `https://www.paintme.club/`; tres recorridos de editor con queries conservan canonical sin parámetros. Check local aprobado: 63 rutas HTML/canonical y 61 URLs sitemap. No se requieren cambios de host/rutas/sitemap. [Evidencia y límites](SEO-REVISION-2026-10-13.md). Cierre técnico autorizado, sin acreditar derechos ni indexación y sin publicar los ajustes nuevos de SEO-01.
**Ejecución 07/10/2026:** WWW verificado, robots/sitemap alineados y 61 rutas locales comprobadas; quedan cierre comercial y verificación pública de cambios. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [robots.txt](../web/robots.txt), [sitemap.xml](../web/sitemap.xml), canonical y configuración de hosting.  
**Trabajo:** escoger host canónico conforme a despliegue real, alinear referencias y comprobar redirecciones si el hosting las permite; actualizar sitemap desde páginas publicables.  
**Aceptación:** URLs del sitemap responden y usan el mismo host; sin entradas excluidas/rotas; editor con queries conserva canonical; no prometer indexación por pasar estos checks.  
**Dependencias vigentes:** Host confirmado por consulta pública. CAT-02 sigue excluida; derechos y cierre comercial quedan fuera del cierre técnico autorizado el 13/10/2026.

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
**P0 documentación · Hecho (alcance local actual) · 2–4 h · Origen P2/documentación**
**Cambio de alcance y cierre 13/10/2026:** Por autorización del usuario, PRIV-02 se limita a documentación del funcionamiento actual, enlaces coherentes, contacto y fecha visibles. Política del producto en `web/privacy.html`, con versión inglesa en `web/en/privacy.html`; home/editores/controles y URL predeterminada Flutter conservan esos destinos. La página Google Sites aportada se considera copia externa, no destino canónico del producto; no se editó. Se añaden título, fecha, cambios y contacto confirmado en ambos idiomas; se elimina la afirmación inglesa obsoleta de contacto sin confirmar. El cierre local no acredita publicación ni cumplimiento legal completo. Revisión nativa se atiende al publicar app; tratamiento de publicidad/analítica y revisión legal se separan de esta tarea, sin activar servicios.
**Verificación de cierre 13/10/2026:** 50 pruebas aprobadas con `node scripts/check-web.cjs`, 63 rutas HTML/canonical y 61 URLs del sitemap. Comprobación adicional Node aprobada: fecha y `mailto:` en español/inglés, enlaces de home/adultos/ambos editores, sección `#web`, destino del módulo de preferencias y URL predeterminada Flutter; analítica apagada. `git diff --check` aprobado. Verificación de código local, sin repetir QA de navegador ni publicar.
**Ejecución 07/10/2026:** Información técnica web/app unificada y noindex mientras faltan operador/contacto, mercados y texto definitivo. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Actualización 13/10/2026:** Contacto confirmado e incorporado: `contancto.focuzlab@gmail.com`. País de operación confirmado: Perú; alcance internacional, inicialmente en español e inglés. Preparado [borrador específico para PaintMe](PRIVACIDAD-BORRADOR.md), con decisiones enlazadas y pendientes verificables sobre alojamiento efectivo, mensajes de contacto, información del responsable que corresponda, app distribuida, revisión del texto y concordancia pública. No se incorporan datos personales del operador sin autorización. Página local alineada con los datos confirmados; se mantiene **Parcial**, `noindex` y servicios externos apagados. UX-05 se cierra por separado.
**Verificación del borrador 13/10/2026:** `node scripts/check-web.cjs` aprobado (50 pruebas, 63 rutas HTML/canonical y 61 URLs del sitemap); `git diff --check` aprobado. Se conservan enlaces y controles de privacidad existentes. Sin revisión legal, publicación ni comprobación de app física.
**Archivos:** [privacy.html](../web/privacy.html), footer/home/editores, política enlazada desde Flutter.  
**Trabajo vigente:** mantener documentación de guardado local, exportación, contacto y servicios actualmente apagados; enlaces al destino del producto y traducción inglesa coherente.
**Aceptación vigente:** política local describe la configuración actual; home, editores y controles enlazan al destino previsto; contacto y fecha visibles. No requiere activar servicios, publicar datos personales del operador ni verificar una futura app distribuida.
**Dependencias vigentes:** PRIV-01 para controles actuales. PRIV-03, DATA-02, ADS-01/02 y tareas móviles conservan las verificaciones de sus respectivas integraciones o publicaciones. Los registros anteriores son históricos y no mantienen el bloqueo sustituido por este cambio de alcance.

### PRIV-03 — Documentar solicitudes reales y configuración de seguridad
**P0 monetización · Parcial · 3–6 h · Origen inventario HAR/CSP**  
**Pendiente vigente 14/10/2026:** App física y nueva producción con integraciones finales aún sin verificar. Aplicar los hitos y la evidencia del registro vigente al inicio de este documento; las capturas locales anteriores no cierran esta tarea.
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
**Actualización 14/10/2026:** GA4 `G-XJBQD3ZZ8Q` incorporado a la configuración web y Firebase `paintme1` para `com.focuzlab.paintme` importado a configuración local ignorada por Git; ambos servicios apagados. 55 checks Node, tres de importación Python, seis Flutter y 12 seleccionados por motor de navegador aprobados. Siguen pendientes confirmación en cuentas, tratamiento/avisos y recepción/revocación/red reales. [Resultados actuales](SERVICIOS-Y-PUBLICACION-2026-10-14.md).
**Continuación adicional 07/10/2026:** Se prepararon GA4 web y Firebase Analytics Flutter, seleccionados por el usuario, con configuración/permiso explícitos, esquema, estados de fallo y revocación; publicidad/personalización denegadas. Firebase apagado desde el manifiesto final Android; iOS sigue desactivado. Apertura fallida/restauración/time bands y errores del collector probados en Flutter. Faltan ID/proyecto reales, tratamiento/avisos y recepción/red en SDK/cuentas; no se inventaron ni activaron. [Código, configuración y evidencia](implementation-2026-10-07/maint-data-seo3.md).
**Continuación 07/10/2026:** Hooks de guardado/restauración/compartir y estado de UI se prueban con collector apagado/fake y outcomes reales de test; recepción/cohorte/collector autorizado siguen pendientes. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** Resultados reales de apertura/save/restore/export y first_paint probados en web; UI móvil e integración de collector autorizada pendientes. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** editores/helpers, interfaz de analítica Flutter.  
**Trabajo:** apertura exitosa/error, first_paint una vez, local_save_success/failure, restore_success y exportación con semántica precisa; datos mínimos. Mantener collector móvil desactivado hasta autorización de tratamiento.  
**Aceptación:** fallo de escritura no genera éxito; apertura fallida no cuenta como activación; restauración obsoleta no cuenta; exportación no afirma archivo abierto; eventos no salen cuando no está permitido.  
**Dependencias:** WEB-05/06, PRIV-01, DATA-01. No crear fingerprint ni cuentas para medir regreso.

### ADS-01 — Preparar publicidad web con ubicaciones explícitas
**P0 monetización · Parcial · 3–6 h · Origen L/diseño publicitario**  
**Estado vigente 14/10/2026:** se mantiene GitHub Pages por decisión del usuario. Integración apagada y guardas de permisos verificadas en Chromium/WebKit; CSP con nonce por respuesta pendiente de infraestructura compatible. Audiencia, aprobación y proveedor real sin verificar; no se activan servicios. [Resultado y fuentes](SERVICIOS-Y-PUBLICACION-2026-10-14.md).
**Banner de inicio 14/10/2026:** Usuario aporta slot `7340274204` («PaintMe — Banner home») y autoriza su ubicación inferior. Configurado `ads.slots.homeBottom`, contenedor bajo todo el contenido/FAQ antes del pie y soporte de rutas `/` y `/index.html`. Conservados bloque editor `7446331398` y bloque familias `9685481928`. Cincuenta pruebas locales y doce seleccionadas de navegador aprobadas, con SDK simulado; inicio móvil/escritorio sin solapamientos ni desplazamiento de la acción principal y permisos denegados sin solicitudes. Flags de publicidad siguen false; sin publicación. Las referencias anteriores a inicio sin bloque describen la etapa sustituida por esta solicitud.
**Bloques diferenciados 14/10/2026:** Usuario aporta «PaintMe — Banner adulto», slot `9685481928`. Configurado en `ads.slots.familiesBottom` para preguntas/familias; `ads.slots.editorBottom` conserva `7446331398` para balde/pincel. Mismo editor confirmado `ca-pub-9994592587162260`, sin bloque en inicio. Se mantiene desactivado y sin publicar; los registros anteriores describen la etapa previa de bloque compartido.
**Integración local 14/10/2026:** Usuario aporta bloque AdSense `7446331398` y autoriza integrarlo, manteniendo anuncios apagados. Adaptador y controlador conectados a los banners inferiores de ambos editores y al final de preguntas/información para familias, sin añadir anuncios al inicio. Se prueban lleno/vacío/fallo/timeout/revocación con SDK simulado; 50 pruebas locales y 20 seleccionadas de navegador aprobadas. Permisos actuales no habilitan ads y los tres flags de configuración permanecen false. Se identifica además CSP estática incompatible con el soporte estricto de AdSense; el adaptador rechaza la carga (`csp_not_ready`) hasta resolverla. Pendientes aprobación, privacidad/audiencia y CSP/red real. No se publica ni se muestran anuncios reales. [Detalle actualizado](ADS-01-BANNER-INFERIOR.md).
**Cambio de alcance 14/10/2026:** El usuario confirma un banner inferior en cada editor web, sustituyendo la exclusión de diseño anterior. Preparados contenedor oculto y estilos compartidos fuera de la actividad, con etiqueta ES/EN, separación superior de 150 px, sin anclaje fijo, superposición ni impresión. No se conecta proveedor ni se elimina el bloqueo operativo del controlador hasta implementar integración/condiciones de habilitación. Cincuenta pruebas locales, catorce regresiones seleccionadas de navegador y dos pruebas de disposición aprobadas. Falta código de bloque `data-ad-slot`, integración/privacidad y aprobación AdSense; usuario aportó captura de propiedad verificada y revisión solicitada. No se activa publicidad ni Auto Ads. [Diseño, decisiones y límites](ADS-01-BANNER-INFERIOR.md).
**Ejecución 07/10/2026:** Componente adulto inactivo con estados, limpieza de resultados tardíos y prohibición en editor; falta integración/proveedor y aprobación/derechos. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** página adulta elegida, módulo ads y configuración.  
**Trabajo vigente:** unidades explícitas y marcadas en ubicaciones aprobadas, incluida parte inferior de ambos editores; modo sin ads, estados de carga/error y espacio colapsable sin saltos peligrosos. Mantener Auto Ads desactivado. Aplicar señales de audiencia soportadas por el producto/SDK confirmado.
**Aceptación vigente:** integración de prueba verificada sin clics comerciales; banner inferior separado de toda la actividad, sin tapar lienzo/colores/guardar y sin overflow; error/rechazo permite seguir pintando; estados y revocación comprobados; sin refresh propio, interstitial ni rewarded. La preparación de contenedores no completa esta aceptación de integración.
**Dependencias externas:** PRIV-01/02/03, derechos, revisión de ámbito, configuración infantil aplicable y aprobación de cuenta. Una página etiquetada “adultos” no acredita audiencia adulta.

### ADS-02 — Validar ads.txt y añadir app-ads.txt cuando corresponda
**P0 monetización móvil · Parcial · 1–2 h · Origen AdMob verificación**  
**Configuración AdMob posterior 14/10/2026:** por instrucción expresa del usuario, creada PaintMe Android sin tienda vinculada (búsqueda de paquete/URL sin resultados), App ID `ca-app-pub-9994592587162260~5200451162`. Creado banner inferior `ca-app-pub-9994592587162260/2933380472`, sin vídeo ni refresh automático. IDs guardados en configuración local apagada; estado Debe revisarse. No se activó ni publicó la app. [Resultado](ADMOB-CONFIGURACION-2026-10-14.md).
**Verificación posterior en consola 14/10/2026:** ads.txt de paintme.club figura **Autorizado**. Sitio **Preparando**, revisión solicitada a las 12:02. Se retira el reconocimiento web de los pendientes; AdMob se mantiene pendiente de comprobar, sin repetir el registro confirmado por el usuario. [Evidencia](qa-evidence/2026-10-14/release-services/adsense-console.json).
**Consulta adicional 14/10/2026:** ads.txt y app-ads.txt responden 200 con registro exacto desde WWW y tras redirigir el dominio sin WWW. Las consolas AdSense/AdMob requieren iniciar sesión; no se afirma reconocimiento. La ficha pública de prueba cerrada devolvió 404 sin acceso de tester: falta verificar su dominio efectivo. [Evidencia actual](SERVICIOS-Y-PUBLICACION-2026-10-14.md).
**Publicación 14/10/2026:** Enviados únicamente `web/ads.txt` y `web/app-ads.txt` por API a `main`, commit `80687be24375673860dd4acbe4ec6eeaa5164be8`; [despliegue Pages exitoso](https://github.com/amilcarpg/ColoreameCanvas2/actions/runs/38598468617). Ambos archivos públicos respondieron 200 con `pub-9994592587162260`. Captura del usuario confirma propiedad AdSense verificada y revisión solicitada. Falta comprobar estado del registro web en consola y verificación AdMob/ficha; ADS-02 sigue parcial. Los otros cambios locales, incluido el espacio inferior nuevo, no se publicaron en ese commit.
**Actualización adicional 14/10/2026:** La captura de verificación AdSense y la confirmación expresa del usuario identifican también el vendedor web como `pub-9994592587162260`. Actualizado `web/ads.txt`, sustituyendo el ID anterior; coincide con el registro móvil confirmado. Ambos archivos preparados localmente; falta publicar, verificar propiedad en AdSense, solicitar revisión del sitio y comprobar AdMob por separado. No se añade script publicitario ni se activan anuncios. El registro siguiente documenta la etapa anterior.
**Actualización 14/10/2026:** Usuario confirma registro AdMob `pub-9994592587162260`, app en prueba cerrada `com.focuzlab.paintme` y dominio `https://www.paintme.club/`. Creado `web/app-ads.txt`; vendedor web de `ads.txt` conservado. Identificador/namespace y paquete/ruta Android de MainActivity corregidos. Cincuenta pruebas web y comprobaciones de coherencia aprobadas; build Android no llegó a compilar por certificado TLS al descargar Gradle. Pendientes publicación, web efectiva de ficha y verificación en AdMob; no se activan anuncios. [Cambios, verificaciones y límites](ADS-02-2026-10-14.md).
**Ejecución 07/10/2026:** ads.txt válido y HTTP 200; app-ads.txt HTTP 404, sin vendedor/ficha móvil confirmados: no se inventó el archivo. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [ads.txt](../web/ads.txt), [app-ads.txt](../web/app-ads.txt), configuración de dominio.
**Trabajo:** usar vendedor autorizado confirmado y servir registros en el dominio enlazado por la ficha; distinguir archivo web y móvil.  
**Aceptación:** respuestas públicas correctas, registro sin placeholders; verificación de consola registrada por responsable.  
**Pendientes de cierre vigentes 14/10/2026:** ads.txt Autorizado. PaintMe Android y su banner ya creados en AdMob; falta vincular la ficha pública de com.focuzlab.paintme, confirmar su dominio y verificar app-ads.txt. La app está en Debe revisarse. No crear duplicados. La aprobación web continúa en ADS-01. [Alta y evidencia](ADMOB-CONFIGURACION-2026-10-14.md).
**Dependencia externa:** registro, identificador de app y dominio confirmados por el usuario; ficha y consola aún no verificadas de forma independiente. Código y archivo no garantizan app readiness.

## Épica 5 — Flutter: fiabilidad y publicación condicional

### MOB-01 — Recuperar autosave tras fallos y guardar en lifecycle
**Actualización 15/10/2026:** Autosave real y recuperación RGBA exacta tras cierre forzado y reapertura offline aprobados en Android 15 emulado. El cierre fue posterior al guardado confirmado; suspensión/cierre durante escritura y QA física siguen pendientes. [Evidencia](ANDROID-EMULADOR-2026-10-15.md).
**P0 publicación · Parcial · 4–7 h · Origen autosave móvil**  
**Continuación 07/10/2026:** Ahora analyzer y widgets Flutter concluyeron: fallo/reintento, reset/undo/redo y lifecycle simulado aprobados. Persistencia durante cierre/suspensión del SO físico sigue pendiente. [Evidencia](implementation-2026-10-07/remaining-code.md).
**Ejecución 07/10/2026:** Autosave recuperable, snapshot, dispose idempotente, estado/reintento y lifecycle implementados; core probado, Flutter/QA física pendientes. Ver [cambios, evidencia y límites](implementation-2026-10-07/items-21-31.md).
**Archivos:** [autosave_controller.dart](../flutter/lib/autosave_controller.dart), [main.dart](../flutter/lib/main.dart).  
**Trabajo:** recuperar cadena de Futures tras rechazo, capturar errores de Timer; flush al suspender/salir y coordinación antes de desmontar; estados honestos.  
**Aceptación:** fallo inyectado→siguiente save exitoso; no queda rechazo sin capturar; navegación/suspensión conserva última obra verificable; “guardado” aparece después de escribir.  
**Dependencias:** MOB-02; QA física para cierre.

### MOB-02 — Escrituras atómicas y lecturas sin mutación
**Actualización 15/10/2026:** Save/load/list en filesystem Android instalado y recuperación tras cierre sin conexión aprobados en emulador. Interrupción durante escritura y matriz iOS/física pendientes. [Evidencia](ANDROID-EMULADOR-2026-10-15.md).
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
**Continuación release 15/10/2026:** AAB y APK firmados con ambiente disabled; manifiesto Firebase desactivado y sin plugin de pruebas, APK no depurable instalado. SDKs y App ID nativo de muestra siguen presentes; no se prueba producción monetizada ni iOS. [Evidencia](ANDROID-RELEASE-2026-10-15.md).
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
**Actualización 15/10/2026:** Corregido recorte inicial del lienzo y botón Ajustar; toque mapeado una sola vez a coordenadas fuente. Dos pruebas de ajuste/orientación y recorrido nativo pintar/deshacer/rehacer aprobados. Perfil físico y multitáctil real pendientes. [Evidencia](ANDROID-EMULADOR-2026-10-15.md).
**P1 · Parcial · 4–8 h · Origen rendimiento/carreras**  
**Continuación 07/10/2026:** Bloqueo de fill/acciones incompatibles, descarte tras dispose, generación de imagen protegida e historial acotado; carreras y 20 ediciones probadas. Perfil CPU/RAM, zoom/multitáctil y persistencia física pendientes. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [drawing_engine.dart](../flutter/lib/drawing_engine.dart), [layered_canvas.dart](../flutter/lib/layered_canvas.dart), main.  
**Trabajo:** impedir resultados de fill obsoletos; coordinar undo/reset/export; perfilar snapshots/encoding y mover trabajo fuera de UI solo si se justifica; historial limitado.  
**Aceptación:** acciones rápidas no sobrescriben obra nueva; 20 gestos/rellenos en Android modesto sin cierre; zoom/coordenadas y multitáctil verificados; registrar CPU/RAM y objetivos de respuesta de WEB-10.

### MOB-08 — Mejorar controles adultos, reset y accesibilidad
**Actualización 15/10/2026:** Corregido fondo de catálogo/editor/ajustes para hacer legibles los encabezados; captura Android vertical revisada. Lectores, texto grande y matriz física pendientes. [Evidencia](ANDROID-EMULADOR-2026-10-15.md).
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
**Incremento autorizado 15/10/2026:** Versión del proyecto 1.0.1+2; AAB regenerado y verificado con la firma existente, sin servicios ni publicación. [Ruta y evidencia vigentes](ANDROID-RELEASE-2026-10-15.md).
**Continuación release 15/10/2026:** La firma ya existía y se reutilizó. AAB/APK actuales compilados; bundletool, firmas, certificado y alineación ZIP aprobados. APK release instalado en otro emulador, con recorrido pintar/guardar/cierre/reapertura sin red activa y captura del lienzo idéntica. Generación/firma local deja de estar pendiente. Se conserva Parcial por compartir, QA física y requisitos externos de tienda; versión 1.0.0 (1), sin publicación. [Informe y artefactos](ANDROID-RELEASE-2026-10-15.md).
**Actualización 15/10/2026:** Resueltos TLS local y caché Kotlin entre unidades. Flutter 3.44.6/Dart 3.12.2, Java 21 y Gradle 9.1.0 bin con SHA fijado: build debug aprobado, paquete `com.focuzlab.paintme`, minSdk 24/target 36. Analyzer sin incidencias, 34 tests y dos fases de integración nativa en Android 15 emulado aprobados; ads/analytics apagados. Release firmado, tienda y matriz física/iOS siguen pendientes. [Informe](ANDROID-EMULADOR-2026-10-15.md).
**P0 publicación Android · Parcial · 4–8 h + entorno · Origen build móvil**
**Actualización 14/10/2026:** Corregidos applicationId/namespace/MainActivity a `com.focuzlab.paintme`, confirmado por el usuario para la ficha de prueba cerrada. La evidencia anterior de APK corresponde al identificador previo. Nuevo intento de build detenido antes de compilar por validación del certificado de descarga de Gradle; verificar el identificador del artefacto cuando el entorno permita compilar. [Detalle](ADS-02-2026-10-14.md).
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
**Aceptación:** introducir W1/W2 deliberadamente hace fallar el check; versión corregida pasa; un JSON con complete:false no se considera aprobado. Los checks web son manuales y locales por decisión del 08/10/2026.
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

### CI-01 — Validación local manual, publicación Pages y rollback documentado
**P0 publicación web · Hecho · 2–4 h · Origen workflow**
**Cierre 14/10/2026:** cerrado por instrucción del usuario en el alcance vigente: checks locales aprobados, publicación Pages identificada y verificada, 247 archivos exactos, familias operativa y procedimiento de rollback documentado y ensayado en un índice temporal. No se requiere revertir una versión pública funcional para este cierre. Los registros de preparación anteriores son históricos. [Evidencia de cierre](PUBLICACION-WEB-2026-10-14.md).
**Publicación verificada 14/10/2026:** versión web autorizada publicada en Pages, commit `fbe3610`, [run exitoso](https://github.com/amilcarpg/ColoreameCanvas2/actions/runs/38629204487). 247 archivos públicos coinciden con el manifiesto; `/familias.html` responde 200 y smoke de guardar/recuperar/descargar en ambos editores aprobado, sin terceros ni cookies. Servicios apagados. Rollback ensayado localmente con árbol exacto; rollback público no ejecutado. [Resultado y evidencia](PUBLICACION-WEB-2026-10-14.md).
**Preparación local 14/10/2026:** web actual verificada, 55 checks Node y 12 seleccionados por motor aprobados; manifiesto de 247 archivos contrastado por HTTP local. Runbook ampliado para SHA/run, `/familias.html` y rollback verificable. Producción actual aún devuelve 404 en familias; publicación y rollback remotos no ejecutados. [Evidencia y resultado](SERVICIOS-Y-PUBLICACION-2026-10-14.md).
**Cambio de alcance 08/10/2026:** por instrucción del usuario, se elimina toda validación/generación del workflow Pages. Python y checks web se ejecutan manualmente en local; Actions solo publica `web/` desde Git. Se conservan los scripts para uso local y el runbook de rollback. La comprobación del nuevo despliegue remoto sigue pendiente.
**Continuación 07/10/2026:** Validación requerida antes de deploy, mismo gate en PR y publicación exclusiva de web; revisión registrada y runbook de rollback concreto. YAML/gates locales aprobados; ejecución y rollback remotos pendientes, sin publicar. Ver [implementación y verificaciones](implementation-2026-10-07/remaining-code.md).
**Archivos:** [deploy-pages.yml](../.github/workflows/deploy-pages.yml), instrucciones de despliegue.  
**Trabajo:** generar y validar manualmente en local, subir fuentes/resultados a Git; Pages publica únicamente web sin checks en CI; registrar revisión desplegada y procedimiento de retorno a versión verificada.
**Aceptación:** workflow Pages sin job de validación, Python ni Node; docs/evidencia no entran al sitio; commit publicado identificable; instrucciones de checks locales y rollback disponibles.
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

1. **Núcleo web:** WEB-01/02 y QA-01; después WEB-03/04/05/06/09 y QA-02. WEB-08 protege la obra; CI-01 documenta checks locales manuales y publicación sin validación en CI.
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

