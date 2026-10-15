# PaintMe App

Cliente Flutter Android/iOS. El catálogo móvil contiene 43 entradas y comparte la fuente técnica `../base_png/catalog.json` con la web; no incorpora automáticamente los 19 dibujos exclusivos web. No editar salidas generadas. Ver [pipeline](../docs/CATALOG-PIPELINE.md).

## Identidad Android y archivo publicitario

El identificador Android confirmado por el usuario para la prueba cerrada de Google Play es `com.focuzlab.paintme`. `applicationId`, namespace y el paquete Kotlin de `MainActivity` usan ese valor. El nombre de paquete Dart `paintme_app` se conserva: es independiente del identificador de tienda. Los identificadores de otras plataformas no se modifican como parte de este cambio Android.

`../web/app-ads.txt` y `../web/ads.txt` contienen el vendedor confirmado `pub-9994592587162260`, para móvil y web respectivamente. Ambos están publicados y respondieron HTTP 200 el 14/10/2026. Dominio de desarrollador confirmado: `https://www.paintme.club/`. Falta comprobar la URL efectiva de la ficha y el reconocimiento en AdSense/AdMob. Preparar estos archivos no activa publicidad. Ver [registro de ADS-02](../docs/ADS-02-2026-10-14.md).

## Firebase Analytics preparado y apagado

`firebase_core 4.15.0` y `firebase_analytics 12.6.0` están fijados en pubspec/lock. El proyecto Android recibido es `paintme1`, para `com.focuzlab.paintme`. Se incorporó a `firebase-config.local.json` (ignorado por Git) con ambos flags en false; `firebase-config.example.json` conserva su plantilla vacía. La disponibilidad Android exige configuración válida y `PAINTME_ANALYTICS`/`PAINTME_ANALYTICS_REVIEWED`, después requiere permiso de la sesión desde Ajustes para adultos. No se habilitan anuncios/personalización ni se reutiliza un permiso persistido.

Desde la raíz del repositorio, `python scripts/configure_firebase.py --source <google-services.json> --write` importa únicamente el cliente Android del paquete confirmado; rechaza clientes ambiguos, claves ausentes y sender/app incompatibles. No muestra la clave ni activa servicios. Para pruebas desde `flutter/`: `flutter test --no-pub --dart-define-from-file=firebase-config.local.json test/firebase_product_analytics_test.dart`. Los seis casos pasaron con los valores recibidos y flags apagados; esto no acredita recepción en Firebase ni red de un dispositivo físico.

El manifiesto del build default desactiva Firebase Analytics nativamente, además de la protección Dart; el plugin puede crear una instancia al registrarse. Antes de activar un build real se requieren las comprobaciones de SDK/red/cuenta del [informe](../docs/implementation-2026-10-07/maint-data-seo3.md). No confundir el esquema de eventos propios con todo lo que procesa el SDK.

iOS permanece desactivado; Firebase requiere mínimo **iOS 15**, alineado en Podfile/proyecto. El pod usa la variante sin AdId. Falta verificar en Mac; un build Android aprobado no acredita iOS. Los componentes del catálogo están en `catalog_widgets.dart`.

## Compilación móvil y versión vigente

La guía operativa está en [Compilación móvil](../docs/COMPILACION-MOVIL.md): abrir en VS Code, preparar PowerShell/Java/SDK, resolver dependencias, ejecutar debug, reutilizar la firma existente, incrementar versión, generar AAB/APK y verificarlos.

Entorno Android comprobado: Flutter **3.44.6 / Dart 3.12.2**, Java 21, Gradle 9.1.0, AGP 8.12.1 y Kotlin 2.3.20. minSdk 24, compile/target SDK 36. Las versiones del entorno aislado de octubre 7 corresponden al registro histórico y no son las instrucciones vigentes de compilación local.

Versión del proyecto: **1.0.1+2**. AAB firmado y verificado: `.tools/apks/paintme-1.0.1-release-noads.aab`, relativo a la raíz del repositorio. El APK release conservado es todavía 1.0.0 (1); el incremento posterior regeneró solo el AAB. Anuncios y analítica apagados. No publicado en Play. [Evidencia de firma y versiones](../docs/ANDROID-RELEASE-2026-10-15.md).

Últimos controles funcionales: analyzer sin incidencias, 34 tests Flutter y pruebas Android 15 emuladas de pintura, guardado y recuperación. El AAB 1.0.1 también pasó estructura, firma y metadatos. Ver [pruebas en emulador](../docs/ANDROID-EMULADOR-2026-10-15.md) y [release](../docs/ANDROID-RELEASE-2026-10-15.md). iOS, QA física y compartir mantienen sus límites documentados.

## Guardado, dibujo y exportación

`LocalDrawingStorage` serializa operaciones, usa temporales/rename y backups y no reescribe índice al leer. PNG e índice son reemplazos individuales, no una transacción conjunta. Autosave recupera la cola tras fallo, muestra estado/reintento y captura al flush/dispose. La UI intenta guardar al suspender y salir; el OS puede terminar antes de completar IO.

El motor bloquea ediciones durante fill, descarta resultados al disponer y mantiene undo/redo con un máximo compartido de ocho pasos y 24 MiB de PNG de historial. Esto no limita toda la RAM de la app. Reiniciar pide confirmación y puede recuperarse con Deshacer antes de editar otra vez. Las miniaturas se generan de la obra local en un isolate, con lista lazy y caché limitada; original/favorito sin obra actúan como fallback.

Compartir pertenece al recorrido adulto, usa el rectángulo del botón requerido en iPad y distingue resultado del sistema, cancelación, resultado desconocido y fallo. Los PNG temporales son únicos; se conservan para la app receptora y solo se limpian archivos propios de más de dos días. No hay subida automática al creador ni prueba de que el destinatario recibió el archivo. La separación adulta por desafío variable es de interfaz, no consentimiento parental legal.

## Anuncios por ambiente

**AdMob registrado el 14/10/2026:** PaintMe Android y su único banner inferior creados. IDs reales conservados en `admob-config.local.json` (ignorado), con ambiente `disabled` y aprobación false. En esa revisión la app estaba en «Debe revisarse», sin tienda vinculada. Después se generaron los artefactos locales indicados arriba; no se publicó en tienda ni se activaron esos IDs. [Identificadores, evidencia y pendientes](../docs/ADMOB-CONFIGURACION-2026-10-14.md).

**Por defecto `PAINTME_ADS=disabled`: Dart no solicita UMP, inicializa MobileAds ni carga banners.** El plugin nativo sigue incluido; no equivale a un artefacto libre de SDKs ni a una auditoría de red móvil. El editor nunca aloja banners y el catálogo colapsa al faltar anuncio listo.

Para desarrollo con unidades de prueba:

```powershell
flutter run --dart-define=PAINTME_ADS=test
```

Test se admite solo en debug. La ruta de producción futura requiere `PAINTME_ADS=production`, `PAINTME_ADS_APPROVED=true`, banner productivo válido y App ID nativo confirmado. No activar esa ruta sin los cierres externos del backlog. No hay fallback silencioso a unidades de prueba en release.

Android toma App ID productivo de propiedad Gradle/entorno `ADMOB_APP_ID`; disabled/test usan el App ID de muestra del proveedor. iOS parte del ID de muestra y permite override en `ios/Flutter/AdMob.local.xcconfig`, ignorado por Git. `validate_ads.sh` verifica ambientes/IDs antes del build Flutter en Xcode. Confirmar también las configuraciones efectivas del artefacto.

Para release Android se conserva firma propia desde `android/key.properties` (ignorado), nunca firma debug. Sin anuncios no exige IDs productivos, pero sigue exigiendo firma válida. No registrar claves ni contraseñas en repo/logs. iOS requiere Mac, Xcode y provisioning; no fue compilado aquí.

## CI y pruebas de dispositivo

`check-mobile.yml` es manual: analyzer, tests y APK debug sin anuncios. Guarda un artefacto de prueba, no publica en tiendas ni firma una distribución productiva. La firma release local ya se verificó; las ejecuciones remotas, la firma dentro de CI y el smoke físico siguen pendientes. El SDK fijado en ese workflow pertenece al registro previo; consultar la guía vigente para compilar localmente.

[Resultados de implementación](../docs/implementation-2026-10-07/remaining-code.md), [pruebas pendientes](../docs/PRUEBAS-PENDIENTES.md) y [backlog](../docs/PRODUCT-BACKLOG.md). Las compras/ofertas COM-01/02/03 están pospuestas y CAT-02 sigue excluida.
