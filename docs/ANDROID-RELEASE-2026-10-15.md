# Android release — 15/10/2026

Alcance: regenerar AAB y APK release con las correcciones actuales y la firma existente. Sin subir a Google Play ni activar anuncios/analítica.

## Versión vigente para subida: 1.0.1 (2)

Tras autorización del usuario, `flutter/pubspec.yaml` pasó a `1.0.1+2` y se regeneró el AAB. Archivo para subir: `.tools/apks/paintme-1.0.1-release-noads.aab` (83.126.430 bytes), SHA-256 `8f82047950f4f1e60adc67193bdf6e951e63e08d2bb5d986f62954ff171f3af6`. Bundletool aprobó la estructura; se comprobaron paquete, versión 1.0.1/código 2, configuración no depurable, analítica apagada y las 593 entradas firmadas con el certificado PaintMe existente. Anuncios apagados. No se subió a Play ni se comprobó allí la disponibilidad del código 2.

[Evidencia de 1.0.1](qa-evidence/2026-10-15/android-release/verification-1.0.1.json). El APK y los resultados 1.0.0 (1) descritos abajo se conservan como evidencia anterior; el APK no se regeneró en este incremento solicitado para el AAB.

## Punto de partida corregido

Ya existían `flutter/android/key.properties`, el keystore de carga y un AAB/APK release del 22/07/2026. Ambos artefactos anteriores usaban el certificado PaintMe SHA-256 `13bd89e4ecec30ba3724217fa0393e04c41a82b1030ace72f1195a74d6a1262e`. No era necesario crear una firma nueva. Lo pendiente era regenerar la versión con las correcciones recientes y verificarla.

Los archivos de firma y contraseñas se conservan locales, ignorados por Git. No se incluyen en este informe.

## Compilación

Se conserva versión 1.0.0, código 1. Antes de subir a Play hay que confirmar que ese código no esté utilizado; no se consultó ni publicó una versión en la tienda.

Entorno y solución TLS/Kotlin: [informe del emulador](ANDROID-EMULADOR-2026-10-15.md). El primer intento release con `--no-pub`, posterior a `flutter drive`, encontró un `GeneratedPluginRegistrant.java` obsoleto que incluía `IntegrationTestPlugin`. `flutter pub get` y la compilación normal con resolución de plugins regeneraron el registro. No se editó manualmente el archivo generado ni se incorporó el arnés al release.

Comandos desde `flutter/`, después de configurar Java/Android y las rutas locales indicadas en el informe:

```powershell
flutter build appbundle --release --dart-define=PAINTME_ADS=disabled --dart-define=PAINTME_ANALYTICS=false
flutter build apk --release --dart-define=PAINTME_ADS=disabled --dart-define=PAINTME_ANALYTICS=false
```

Para un release después de ejecutar pruebas de integración, permitir la actualización normal de metadatos de plugins; no reutilizar a ciegas el registro generado por el arnés con `--no-pub`.

## Alcance de la verificación

**Resultado: AAB y APK release actualizados generados y verificados.** Ambos builds terminaron con salida 0. Identidad `com.focuzlab.paintme`, versión 1.0.0 (1), minSdk 24, target/compile SDK 36 y configuración no depurable. Los artefactos incorporan las correcciones actuales del lienzo y catálogo.

| Artefacto | Tamaño | SHA-256 |
|---|---:|---|
| `flutter/build/app/outputs/bundle/release/app-release.aab` | 83.126.426 bytes | `bc1e195b726273fcde68af4ddf1d337cc873d9569f4efabdbfc4680599e684ea` |
| `flutter/build/app/outputs/flutter-apk/app-release.apk` | 81.460.195 bytes | `f54bd651e8becd713ca820bb2fdb039a957ee9b42a333e8045cc3dcc1c0d83fc` |

Copias estables locales: `.tools/apks/paintme-1.0.0-release-noads.aab` y `.tools/apks/paintme-1.0.0-release-noads.apk`. No se versionan los binarios.

- Bundletool oficial 1.18.3: `validate` aprobado. La herramienta descargada se contrastó con el SHA-256 del asset oficial de GitHub `a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29`.
- APK: `apksigner verify --verbose --print-certs` aprobado; mismo certificado PaintMe que los artefactos de julio. `zipalign -c -P 16 4` aprobado (alineación del archivo ZIP, no certificación de todas las bibliotecas en un sistema de páginas de 16 KiB).
- AAB: `jarsigner -verify` aprobado. Java avisa del certificado autofirmado, falta de timestamp y orden ZIP que difiere al leer por streaming. Se comprobó adicionalmente cada entrada con `JarFile` y validación criptográfica: las **593 entradas de contenido** están firmadas con el certificado PaintMe esperado. La validación estructural de bundletool también pasó. Esto no sustituye la revisión de Google Play.
- Manifiesto AAB: Firebase Analytics desactivado nativamente, colección false, app no depurable y sin registro del plugin de pruebas. Anuncios deshabilitados por Dart; el App ID nativo de muestra y los SDKs siguen incluidos, sin activar anuncios reales.
- Instalación del APK y arranque en frío: aprobados en el AVD independiente `PaintMe_Release_API_35`, Android 15/API 35, `emulator-5562`.
- Catálogo y editor revisados visualmente; pintar y estado de guardado comprobados. Tras `am force-stop`, reapertura y selección del dibujo, la obra roja se recuperó. El recorte de pantalla del lienzo, con la misma geometría, coincide exactamente antes/después. Esta comparación visual en release es distinta de la comparación RGBA del almacenamiento realizada por el arnés debug.
- Modo avión, Wi-Fi/datos apagados y `Active default network: none` confirmados durante el recorrido release. No se afirma una auditoría integral de tráfico de SDKs.

[Resultados y hashes](qa-evidence/2026-10-15/android-release/verification.json), [evidencia completa](qa-evidence/2026-10-15/android-release/), [obra recuperada](qa-evidence/2026-10-15/android-release/release-restored-fitted.png).

Se comprueban estructura AAB con bundletool oficial, firma y certificado, manifiestos y arranque instalado en un segundo emulador Android 15 del proyecto. El emulador debug y sus dibujos se conservan. Esta comprobación no equivale a aprobación de Play, distribución física ni revisión de proveedor publicitario.
