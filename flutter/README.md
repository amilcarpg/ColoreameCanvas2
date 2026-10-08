# PaintMe App

Cliente Flutter Android/iOS. El catálogo móvil contiene 43 entradas y comparte la fuente técnica `../base_png/catalog.json` con la web; no incorpora automáticamente los 19 dibujos exclusivos web. No editar salidas generadas. Ver [pipeline](../docs/CATALOG-PIPELINE.md).

## Firebase Analytics preparado y apagado

`firebase_core 4.15.0` y `firebase_analytics 12.6.0` están fijados en pubspec/lock. No se proporcionó proyecto Firebase. `firebase-config.example.json` lista los defines públicos necesarios; sus flags parten de false y sus IDs vacíos. La disponibilidad Android exige configuración válida y `PAINTME_ANALYTICS`/`PAINTME_ANALYTICS_REVIEWED`, después requiere permiso de la sesión desde Ajustes para adultos. No se habilitan anuncios/personalización ni se reutiliza un permiso persistido.

El manifiesto del build default desactiva Firebase Analytics nativamente, además de la protección Dart; el plugin puede crear una instancia al registrarse. Antes de activar un build real se requieren las comprobaciones de SDK/red/cuenta del [informe](../docs/implementation-2026-10-07/maint-data-seo3.md). No confundir el esquema de eventos propios con todo lo que procesa el SDK.

iOS permanece desactivado; Firebase requiere mínimo **iOS 15**, alineado en Podfile/proyecto. El pod usa la variante sin AdId. Falta verificar en Mac; un build Android aprobado no acredita iOS. Los componentes del catálogo están en `catalog_widgets.dart`.

## Entorno y comprobaciones

El proyecto requiere Dart ^3.11.5. En esta sesión se preparó un SDK aislado Flutter 3.47.6 / Dart 3.13.5 en `../.tools/flutter-sdk`; el SDK anterior del PATH no se reemplazó. Las dependencias de pub y Android también están en `.tools/`, ignorado por Git. Para repetir en Windows desde `flutter/`:

```powershell
$env:PUB_CACHE = 'D:/DevAPG/ColoreameCanvas2/.tools/pub-cache'
../.tools/flutter-sdk/bin/flutter.bat pub get --enforce-lockfile
../.tools/flutter-sdk/bin/flutter.bat analyze --no-pub
../.tools/flutter-sdk/bin/flutter.bat test --no-pub
```

La matriz Android actual es Gradle 9.1.0, AGP 8.12.1 y Kotlin 2.3.20, con target/compile SDK derivados del Flutter fijado. Gradle se ajustó por un fallo reproducido de caché Windows; no se omiten validaciones por warnings.

Con otro checkout/SDK compatible, ajustar las rutas o usar `flutter` del PATH. El lock conserva versiones de plugins; las cuatro dependencias de soporte actualizadas responden a la matriz del SDK aislado. No sustituir analyzer/tests por un proceso que no terminó.

Desde la raíz, `.tools/flutter-sdk/bin/dart.bat tests/mobile-storage-autosave.dart` comprueba además el núcleo de archivos/autosave independiente. Los widgets usan servicios de memoria/inyección para probar UI; el harness independiente usa almacenamiento real y fallos de filesystem. Ninguno simula una app física.

## Guardado, dibujo y exportación

`LocalDrawingStorage` serializa operaciones, usa temporales/rename y backups y no reescribe índice al leer. PNG e índice son reemplazos individuales, no una transacción conjunta. Autosave recupera la cola tras fallo, muestra estado/reintento y captura al flush/dispose. La UI intenta guardar al suspender y salir; el OS puede terminar antes de completar IO.

El motor bloquea ediciones durante fill, descarta resultados al disponer y mantiene undo/redo con un máximo compartido de ocho pasos y 24 MiB de PNG de historial. Esto no limita toda la RAM de la app. Reiniciar pide confirmación y puede recuperarse con Deshacer antes de editar otra vez. Las miniaturas se generan de la obra local en un isolate, con lista lazy y caché limitada; original/favorito sin obra actúan como fallback.

Compartir pertenece al recorrido adulto, usa el rectángulo del botón requerido en iPad y distingue resultado del sistema, cancelación, resultado desconocido y fallo. Los PNG temporales son únicos; se conservan para la app receptora y solo se limpian archivos propios de más de dos días. No hay subida automática al creador ni prueba de que el destinatario recibió el archivo. La separación adulta por desafío variable es de interfaz, no consentimiento parental legal.

## Anuncios por ambiente

**Por defecto `PAINTME_ADS=disabled`: Dart no solicita UMP, inicializa MobileAds ni carga banners.** El plugin nativo sigue incluido; no equivale a un artefacto libre de SDKs ni a una auditoría de red móvil. El editor nunca aloja banners y el catálogo colapsa al faltar anuncio listo.

Para desarrollo con unidades de prueba:

```powershell
flutter run --dart-define=PAINTME_ADS=test
```

Test se admite solo en debug. La ruta de producción futura requiere `PAINTME_ADS=production`, `PAINTME_ADS_APPROVED=true`, banner productivo válido y App ID nativo confirmado. No activar esa ruta sin los cierres externos del backlog. No hay fallback silencioso a unidades de prueba en release.

Android toma App ID productivo de propiedad Gradle/entorno `ADMOB_APP_ID`; disabled/test usan el App ID de muestra del proveedor. iOS parte del ID de muestra y permite override en `ios/Flutter/AdMob.local.xcconfig`, ignorado por Git. `validate_ads.sh` verifica ambientes/IDs antes del build Flutter en Xcode. Confirmar también las configuraciones efectivas del artefacto.

Para release Android se conserva firma propia desde `android/key.properties` (ignorado), nunca firma debug. Sin anuncios no exige IDs productivos, pero sigue exigiendo firma válida. No registrar claves ni contraseñas en repo/logs. iOS requiere Mac, Xcode y provisioning; no fue compilado aquí.

## Build local Android aislado

Si `flutter config` contiene una ruta Android global, esa configuración tiene prioridad sobre `ANDROID_HOME`. Para conservarla, el intento local usa `android/local.properties` (ignorado por Git), con `sdk.dir` apuntando a `.tools/android-sdk`, `flutter.sdk` al SDK aislado y `flutter.buildMode=debug`. Después de resolver pub desde `flutter/`, ejecutar desde `flutter/android/`:

**Revisar `local.properties` después de cada comando Flutter/pub**: Flutter puede regenerarlo con la ruta del SDK global. Corregirlo antes de invocar Gradle para conservar el SDK del proyecto.

```powershell
$env:PUB_CACHE = 'D:/DevAPG/ColoreameCanvas2/.tools/pub-cache'
$env:ANDROID_HOME = 'D:/DevAPG/ColoreameCanvas2/.tools/android-sdk'
$env:GRADLE_USER_HOME = 'D:/DevAPG/ColoreameCanvas2/.tools/gradle-cache'
./gradlew.bat app:assembleDebug --no-daemon --console=plain
```

Sin dart-defines se aplica el valor `disabled`; no es una distribución firmada productiva. El comando de CI usa Flutter con `--dart-define=PAINTME_ADS=disabled` en un runner nuevo. Resultado y límites del build local: informe enlazado abajo.

## CI y pruebas de dispositivo

`check-mobile.yml` es manual: analyzer, tests y APK debug sin anuncios. Guarda un artefacto de prueba, no publica en tiendas ni firma una distribución productiva. Sus ejecuciones remotas, build firmado y smoke físico siguen pendientes.

[Resultados de implementación](../docs/implementation-2026-10-07/remaining-code.md), [pruebas pendientes](../docs/PRUEBAS-PENDIENTES.md) y [backlog](../docs/PRODUCT-BACKLOG.md). Las compras/ofertas COM-01/02/03 están pospuestas y CAT-02 sigue excluida.
