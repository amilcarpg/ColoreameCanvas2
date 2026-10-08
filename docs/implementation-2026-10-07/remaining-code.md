# PaintMe — Continuación de mejoras de código restantes

Fecha: 07/10/2026. Revisión: árbol local sin commit/publicación. Alcance autorizado: mejoras restantes posibles del backlog; **CAT-02 excluida y COM-01/02/03 pospuestos**. No se activaron anuncios, cobros, cuentas, mensajes ni distribución. Los informes anteriores se conservan como evidencia histórica.

## Resultado y estado

| ID | Implementación y verificación local | Criterio restante |
|---|---|---|
| WEB-07 · Hecho | Navegación compartida, asset/categoría conservados, flush antes del cambio, aviso cancelable y vuelta/restauración de cada modo. Chromium/WebKit. | Las obras de balde/pincel son independientes; se explica y puede descargarse antes de cambiar. No hay conversión silenciosa entre formatos. |
| WEB-10 · Parcial | 20 ediciones y guardados por motor a 1200 px, undo/redo con presupuesto conjunto de pasos/bytes y restauración final; cuatro perfiles. | RAM/CPU y latencia/tacto en Android modesto, cierre/rotación/zoom físicos. |
| MOB-03 · Parcial | Banner solo visible tras load exitoso; timeout, permiso antes/después, descarte tardío, referencia vaciada, dispose único y máximo tres intentos con pausa. Tests con recursos fake. | Comprobar plugin nativo y banner test físico con configuración permitida. |
| MOB-04 · Parcial | `PAINTME_ADS=disabled` por defecto; contrato Dart/Android/iOS; release rechaza ambiente test/IDs de muestra/configuración productiva incompleta. Seis casos shell y tests Dart. | Inspección efectiva de release firmado y build iOS; valores productivos/cuentas no comprobados. |
| MOB-05 · Parcial | UMP con estados, errores/timeout, consulta de permiso y opciones cuando requeridas; revocación retira banner, no habilita SDK tras fallo. SDK 7.0.0 comprobado en fuente instalada y gateways fake. | Audiencia/mercados, mensajes/proveedor, SDKs/adaptadores, AD_ID/manifiesto, datos de red y declaraciones de tienda. |
| MOB-06 · Parcial | Rectángulo del botón para share; PNG único; solo limpieza de temporales propios antiguos; cancelar/fallo/resultado desconocido son distintos de éxito. Archivos reales/callbacks probados. | Share sheet real iPad/iPhone/Android y Xcode. |
| MOB-07 · Parcial | Motor y UI serializan operaciones incompatibles; fill obsoleto tras dispose no aplica; generación de imagen protegida, historial acotado. Pruebas de carreras/píxeles/20 ediciones. | Perfil total CPU/RAM, zoom/coordenadas/multitáctil y sistema móvil físico. |
| MOB-08 · Parcial | Gate variable, respuesta incorrecta/cancelación, confirmación de reset y recuperación, errores/foco y acciones bloqueadas durante IO. Widgets. | Texto grande, lectores, paisaje/estrecho, adecuación a audiencia/plataforma. Gate separa interfaz, no verifica al responsable legal. |
| MOB-09 · Hecho | Miniatura de obra local con máscara de contornos; compute, caché de 24 entradas por revisión y SliverList lazy; favorito sin obra/fallback. PNG compuesto y corrupción probados. | QA física de lista grande y regreso se conserva como smoke general. |
| MOB-10 · Hecho | Undo/redo compartido: ocho pasos/24 MiB de historial PNG; ramas/reset y botones/widgets con píxeles reales. | RAM total no está limitada a 24 MiB; smoke físico general. |
| QA-03 · Hecho | Relleno compara RGBA/contorno, analyzer terminado sin incidencias, 24 tests Flutter y 12 filesystem/autosave real. | Pruebas nativas/SDK físico pertenecen a MOB-*; tests con mocks no acreditan integración real. |
| CI-01 · Parcial | Gate requerido antes de Pages y en PR; publicación solo `web/`; registro SHA y rollback con revert/validación documentados. YAML/gates locales. | Primera ejecución remota, fallo de gate en PR y rollback/smoke público autorizados. |
| CI-02 · Parcial | Workflow manual con SDK fijo, lock, analyzer/tests, APK debug sin anuncios y retención corta de artefacto. | Ejecución remota, firma/configuración protegida y smoke release; iOS condicionado. |
| MAINT-01 · Parcial | Un solo handler de navegación web; Flutter extrae controles adultos, miniaturas, controlador/configuración de ads; regresiones pasan. | No se hizo reescritura global; catálogo/paletas/UI restante se extraerán al justificar cambios. |
| DOC-01 · Hecho | README raíz/web/Flutter/assets actualizados, pipeline y runbook; comandos, ambientes apagados y límites explicitados. | Conservar documentos al cambiar versión/configuración. |

## Evidencia ejecutada

- `node scripts/check-web.cjs`: **45/45** tests, 61 rutas HTML/canonical, 60 URLs sitemap y sintaxis ads.txt; [salida](remaining-code/web-gate-output.txt).
- `node scripts/verify-web-gate.cjs`: W1/W2 originales hacen fallar el gate (exit 1); informe histórico no sobrescrito.
- Suite de navegador completa: **75/75 Chromium y 75/75 WebKit**, incluidos dibujos reales del catálogo, exportación/restauración, errores/carreras, privacidad apagada, contexto entre modos y uso sostenido. Tiempos totales aproximados: 197 s y 347 s. Viewports/emulación en Windows; no Chrome Android/Safari iOS físicos.
- `flutter analyze --no-pub`: **No issues found**, proceso concluido con exit 0; [salida](remaining-code/flutter-analyze-output.txt).
- `flutter test --no-pub`: **24/24**, proceso concluido con exit 0; [salida](remaining-code/flutter-test-output.txt). Nuevos `reliability_test.dart` y `editor_continuity_test.dart`; widgets usan storage/gateways inyectados. El motor compone/valida PNG reales.
- Harness `tests/mobile-storage-autosave.dart`: **12/12**, archivos reales Windows con fallos/recuperación; no filesystem móvil.
- Pipeline: **227 salidas sin diferencias y ocho tests Python aprobados**. No cambios de recursos en esta continuación ni aprobación de derechos.
- YAML de ambos workflows parseado y dependencias/trigger/artifact path revisados. Shell iOS pasa sintaxis y seis ambientes/errores simulados: [config-checks.json](remaining-code/config-checks.json). No Xcode ni identidad de cuenta comprobada.

[Resumen estructurado](remaining-code/verification-summary.json). La evidencia corresponde a código local y estas herramientas; no acredita negocio, tráfico, cumplimiento o aprobación de tiendas.

## Rendimiento: medición y límites

Los perfiles [Chromium balde](remaining-code/chromium-paint-performance.json), [Chromium pincel](remaining-code/chromium-brush-performance.json), [WebKit balde](remaining-code/webkit-paint-performance.json) y [WebKit pincel](remaining-code/webkit-brush-performance.json) registran 20 ediciones, guardado, pasos/bytes de historial y long tasks cuando el navegador expone esa API. Fixture sintético 1200×1200; tiempos incluyen automatización y persistencia. Heap JS no es RAM total del navegador. No interpretar ausencia de long tasks como ausencia de cualquier bloqueo.

El historial web mantiene máximo conjunto de 32 pasos/48 MiB y reduce los pasos efectivos con cuadros grandes. Flutter mantiene ocho pasos/24 MiB de PNG codificado, aparte de imágenes/capas/decodificación y otras copias. La carga de miniaturas Flutter se serializa y la lista se construye bajo demanda. No se trasladó encoding a otro isolate sin perfil físico que justifique ese coste; no se promete operación <500 ms en un teléfono.

## Entorno Flutter y build Android

El SDK previo del PATH no se sustituyó. Se preparó en `.tools/flutter-sdk` Flutter **3.47.6 / Dart 3.13.5**, caché pub y Gradle locales y SDK Android aislado con API 36/NDK 28.2.13676358. No claves productivas consultadas. El lock conserva plugins (incluidos google_mobile_ads 7.0.0/share_plus 12.0.2); solo cambian matcher, meta, test_api y vector_math para el SDK elegido. La restricción Dart ^3.11.5 se conserva.

AGP sube de 8.11.1 a **8.12.1** por mínimo de share_plus. Se corrigió la DSL Kotlin del proyecto: plugins antes de configuración, `compilerOptions` JVM 17 y Action explícita para validar release. Los intentos Gradle 8.14 fallaron moviendo caché temporal en Windows. Gradle tiene [incidencia oficial](https://github.com/gradle/gradle/issues/31438) y [corrección de locking](https://github.com/gradle/gradle/pull/34369) incluida en 9.1; se ajustó a **Gradle 9.1.0 / Kotlin 2.3.20**, dentro de la [matriz Kotlin](https://kotlinlang.org/docs/gradle-configure-project.html). AGP 8.12 admite API 36 y requiere [Gradle ≥8.13/Java 17](https://developer.android.com/build/releases/agp-8-12-0-release-notes). Fuentes consultadas 07/10/2026.

**Build Android debug aprobado:** primer build completo terminó con exit 0 en 8 m 23 s; tras las dos correcciones finales, rebuild terminó con exit 0 en 1 m 39 s. [Primer build](remaining-code/android-debug-build-output.txt), [build final](remaining-code/android-debug-final-output.txt), [hash/tamaño/badging del APK final](remaining-code/android-debug-apk.json). El APK final confirma compile/target SDK 36 y minSdk 24; es debug de tres arquitecturas, no tamaño de release/AAB. Se ejecuta `app:assembleDebug` directamente con `local.properties` apuntando al SDK aislado: Flutter daba prioridad a su configuración Android global sobre ANDROID_HOME. No se alteró esa preferencia global. Anuncios están apagados por defecto; no release firmado ni instalación física.

Tres guardas Android se ejecutaron con Gradle `--dry-run`: release con ambiente test, profile con ambiente test y producción sin App ID fueron rechazados con los mensajes esperados antes de ejecutar tareas. [Resultados](remaining-code/android-config-guards.json). Esto comprueba rechazo de configuración, no una compilación válida productiva.

El build incluido del SDK Flutter emite un warning de su Kotlin interno; Flutter también anuncia deprecación futura de AGP 8.12.1. No se usó flag para saltar validación ni se cambió AGP a 9 solo por warning. Revaluar matriz antes de publicar.

En la revisión final se añadió relectura de mounted/permiso después de esperar entitlement y bloqueo de inicialización/formularios duplicados mientras cambia privacidad. Dos regresiones adicionales prueban esas carreras; una intercepta el canal binario del SDK y exige cero solicitudes al revocar durante la espera. Profile, además de release, rechaza el ambiente test en Dart y Gradle.

El manifiesto debug empaquetado ya confirma package `club.paintme.paintme_app`, versión 1.0.0+1, minSdk 24 y **targetSdk 36**. Incluye AD_ID, permisos AdServices y `MobileAdsInitProvider`, con App ID de muestra: [inventario debug](remaining-code/android-debug-manifest.json). Su presencia necesita revisión de audiencia/permisos y red nativa; no se inspeccionó aún release.

## Privacidad y distribución

Dart no solicita UMP/MobileAds/banner en ambiente disabled. **El plugin y sus componentes nativos siguen incluidos**: esto no demuestra artefacto sin SDKs ni cero tráfico/identificadores móviles. Comparar manifiesto fusionado y red en la futura app física, con decisiones de audiencia/mercados. No afirmar que NPA, gate o canRequestAds resuelven consentimiento parental.

Contratos/API de la versión instalada y [guía UMP Flutter](https://developers.google.com/admob/flutter/privacy), [share_plus 12.0.2/iPad](https://pub.dev/packages/share_plus/versions/12.0.2) consultados 07/10/2026. Guardas sintácticas no prueban propiedad/aprobación de IDs. Los tests no hacen solicitudes de anuncios comerciales ni clics.

No se implementó enlace opcional COM-04, inglés SEO-03, venta/checkout/ad-free COM-01/02/03 ni filtro/licencias CAT-02. iOS mantiene dependencia de Mac/Xcode/firma/equipos. [Backlog actualizado](../PRODUCT-BACKLOG.md), [matriz de pruebas pendientes](../PRUEBAS-PENDIENTES.md) y [runbook Pages](../DEPLOYMENT-RUNBOOK.md) detallan los próximos cierres; los estados Parcial conservan esas dependencias.
