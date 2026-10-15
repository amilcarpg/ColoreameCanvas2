# Compilación de la aplicación móvil

Guía vigente al 15/10/2026. Android verificado en Windows; iOS requiere Mac y conserva validación pendiente. Compilar no publica la aplicación.

## Abrir el proyecto

En VS Code, abrir `D:\DevAPG\ApgColoreameCanvas2\ColoreameCanvas2` o su subcarpeta `flutter`, con las extensiones Dart y Flutter. Los comandos de compilación se ejecutan desde `flutter/`, donde está `pubspec.yaml`.

## Entorno Android comprobado

| Componente | Configuración utilizada |
|---|---|
| Flutter / Dart | 3.44.6 / 3.12.2, `D:/flutter` |
| Java | JBR 21 de Android Studio |
| Android SDK | `D:/ProgramData/androidlocal` |
| Gradle / AGP / Kotlin | 9.1.0 / 8.12.1 / 2.3.20 |
| Android efectivo | minSdk 24, compile/target SDK 36 |
| Identificador | `com.focuzlab.paintme` |
| Versión del proyecto | `1.0.1+2` |

No usar Java 8 u 11 que puedan aparecer primero en el PATH de este equipo. Los SDK instalados están fuera del repositorio; las cachés y ajustes locales propios se guardan bajo `.tools/`. En otro equipo hay que ajustar las rutas e instalar los componentes Android que solicite Flutter.

Desde PowerShell, preparar la sesión:

```powershell
$taskRepoRoot = 'D:\DevAPG\ApgColoreameCanvas2\ColoreameCanvas2'
$taskFlutterExe = 'D:/flutter/bin/flutter.bat'
$taskJavaBin = 'D:/Program Files/Android/Android Studio/jbr/bin'
$env:JAVA_HOME = 'D:/Program Files/Android/Android Studio/jbr'
$env:ANDROID_HOME = 'D:/ProgramData/androidlocal'
$env:GRADLE_USER_HOME = Join-Path $taskRepoRoot '.tools/gradle-cache'

# En este equipo existe un truststore local para la red empresarial.
$taskTrustStore = Join-Path $taskRepoRoot '.tools/java-trust/cacerts'
if (Test-Path -LiteralPath $taskTrustStore) {
    $env:JAVA_TOOL_OPTIONS = '-Djavax.net.ssl.trustStore="' + $taskTrustStore + '" -Djavax.net.ssl.trustStorePassword=changeit'
}

Set-Location (Join-Path $taskRepoRoot 'flutter')
& $taskFlutterExe --version
& $taskFlutterExe doctor -v
```

Flutter puede dar prioridad a su configuración Android global sobre `ANDROID_HOME`. Revisar con `doctor -v` y `android/local.properties` que el SDK efectivo sea el esperado; no copiar rutas de otro equipo ni cambiar preferencias globales sin necesidad. `local.properties` lo regenera Flutter y no se versiona.

## Dependencias y controles

```powershell
& $taskFlutterExe pub get --enforce-lockfile
& $taskFlutterExe analyze --no-pub
& $taskFlutterExe test --no-pub
```

Detenerse si un comando falla y resolverlo antes de continuar. Conservar `pubspec.lock`; no ejecutar `pub upgrade` como solución automática a errores de compilación. Última validación funcional: 34 pruebas Flutter y analyzer sin incidencias; [evidencia Android](ANDROID-EMULADOR-2026-10-15.md).

## Ejecutar o generar un APK debug

```powershell
& $taskFlutterExe devices
# Sustituir emulator-5560 por el ID que muestre devices.
& $taskFlutterExe run -d emulator-5560 --dart-define=PAINTME_ADS=disabled --dart-define=PAINTME_ANALYTICS=false

# Generar un APK debug sin ejecutarlo.
& $taskFlutterExe build apk --debug --dart-define=PAINTME_ADS=disabled --dart-define=PAINTME_ANALYTICS=false
```

Salida: `flutter/build/app/outputs/flutter-apk/app-debug.apk`, relativa a la raíz del repositorio. Debug sirve para desarrollo y usa una firma diferente de la firma release. El APK x86_64 específico de las pruebas anteriores era para emulador; no usarlo como entrega para teléfonos ARM.

## Firma release existente

Ya existen localmente `flutter/android/key.properties` y el keystore de carga. Gradle obtiene de ese archivo `storeFile`, `storePassword`, `keyAlias` y `keyPassword`. No crear otra clave para la aplicación existente ni imprimir/subir estos archivos. Están ignorados por Git y requieren respaldo seguro fuera del historial del repositorio.

En un checkout nuevo, recuperar los archivos de firma existentes por el mecanismo privado del propietario y ajustar `storeFile` al equipo. La plantilla `flutter/android/key.properties.example` muestra los campos, pero sus valores no sirven para firmar. Gradle resuelve un `storeFile` relativo desde `flutter/android/app/`.

Huella pública esperada del certificado de carga, SHA-256:

```text
13bd89e4ecec30ba3724217fa0393e04c41a82b1030ace72f1195a74d6a1262e
```

Es el certificado de carga local; no se ha contrastado en esta tarea con el certificado de firma que use Google Play App Signing.

## Incrementar la versión

Editar `flutter/pubspec.yaml` antes del build:

```yaml
version: 1.0.1+2
```

`1.0.1` es la versión visible (`versionName`) y `2` el código Android (`versionCode`). Para la siguiente entrega, elegir un código superior a los ya utilizados en Play Console. No basta cambiar el nombre del AAB. El código 2 se generó localmente; no se ha consultado su disponibilidad en Play. Evitar overrides `--build-name`/`--build-number` salvo que se documenten para mantener claro qué versión produjo el artefacto.

## Generar AAB para Google Play y APK release

Desde `flutter/`, con la sesión y firma anteriores:

```powershell
& $taskFlutterExe build appbundle --release --dart-define=PAINTME_ADS=disabled --dart-define=PAINTME_ANALYTICS=false
& $taskFlutterExe build apk --release --dart-define=PAINTME_ADS=disabled --dart-define=PAINTME_ANALYTICS=false
```

| Destino | Archivo generado, desde la raíz del repositorio |
|---|---|
| Google Play | `flutter/build/app/outputs/bundle/release/app-release.aab` |
| Instalación directa | `flutter/build/app/outputs/flutter-apk/app-release.apk` |

Los comandos normales actualizan los metadatos de plugins. Después de ejecutar `flutter drive`, evitar `--no-pub` en el build release: un registro generado por el arnés incluyó `IntegrationTestPlugin` y provocó un fallo de compilación. Se resolvió con `flutter pub get` y el build normal; no editar manualmente `GeneratedPluginRegistrant.java`.

Anuncios y analítica permanecen apagados explícitamente. Los plugins nativos siguen incluidos; estos flags no equivalen a eliminar SDKs ni a auditar todo su tráfico. No es necesario incorporar los IDs productivos para esta entrega apagada.

Los outputs se sobrescriben en el siguiente build. Copiar el artefacto verificado a una ruta que incluya versión/código y guardar su hash para evitar confundir entregas. El AAB vigente ya generado es:

```text
D:\DevAPG\ApgColoreameCanvas2\ColoreameCanvas2\.tools\apks\paintme-1.0.1-release-noads.aab
```

Su SHA-256 es `8f82047950f4f1e60adc67193bdf6e951e63e08d2bb5d986f62954ff171f3af6`. El APK conservado `paintme-1.0.0-release-noads.apk` sigue siendo 1.0.0 (1): solo se regeneró el AAB para el incremento posterior. Al volver a ejecutar ambos comandos, ambos outputs tomarán la versión de `pubspec.yaml`.

## Verificar antes de subir

Desde `flutter/`, con las variables de la sesión inicial:

```powershell
# APK: firma/certificado, identidad/versión y alineación ZIP.
& "$env:ANDROID_HOME/build-tools/35.0.1/apksigner.bat" verify --verbose --print-certs build/app/outputs/flutter-apk/app-release.apk
& "$env:ANDROID_HOME/build-tools/35.0.1/aapt.exe" dump badging build/app/outputs/flutter-apk/app-release.apk
& "$env:ANDROID_HOME/build-tools/35.0.1/zipalign.exe" -c -P 16 4 build/app/outputs/flutter-apk/app-release.apk

# AAB: bundletool oficial descargado localmente en esta sesión.
$taskBundletool = Join-Path $taskRepoRoot '.tools/bundletool/bundletool-all-1.18.3.jar'
& "$taskJavaBin/java.exe" -jar $taskBundletool validate --bundle=build/app/outputs/bundle/release/app-release.aab
& "$taskJavaBin/java.exe" -jar $taskBundletool dump manifest --bundle=build/app/outputs/bundle/release/app-release.aab
& "$taskJavaBin/jarsigner.exe" -verify build/app/outputs/bundle/release/app-release.aab
& "$taskJavaBin/keytool.exe" -printcert -jarfile build/app/outputs/bundle/release/app-release.aab
Get-FileHash build/app/outputs/bundle/release/app-release.aab -Algorithm SHA256
```

Si falta bundletool, obtenerlo de [sus releases oficiales](https://github.com/google/bundletool/releases) y verificar el digest del asset. La versión usada en esta sesión fue 1.18.3; SHA-256 del JAR: `a099cfa1543f55593bc2ed16a70a7c67fe54b1747bb7301f37fdfd6d91028e29`. No se distribuye como archivo versionado del proyecto.

Comprobar paquete `com.focuzlab.paintme`, versión/código elegidos, target SDK efectivo, app no depurable y certificado esperado. La alineación ZIP no certifica por sí sola todas las bibliotecas en dispositivos con páginas de 16 KiB. Java puede advertir sobre certificado autofirmado, timestamp y orden ZIP del AAB; la verificación adicional de las 593 entradas de contenido y bundletool está documentada en el [informe release](ANDROID-RELEASE-2026-10-15.md).

Instalar el APK release en un dispositivo o emulador con una instalación de firma compatible. Una app debug del mismo paquete tiene otro certificado: no desinstalarla sin preservar primero las obras; se utilizó un AVD separado (`emulator-5562`) para el release. Ejemplo, usando el ID correcto:

```powershell
& "$env:ANDROID_HOME/platform-tools/adb.exe" -s emulator-5562 install -r build/app/outputs/flutter-apk/app-release.apk
& "$env:ANDROID_HOME/platform-tools/adb.exe" -s emulator-5562 shell am start -W -n com.focuzlab.paintme/.MainActivity
```

Probar catálogo, pintar, guardado, cierre/reapertura, offline y compartir. El recorrido release 1.0.0 en Android 15 emulado ya comprobó pintar/guardar/recuperar sin red activa; la entrega AAB 1.0.1 cambió la versión y verificó estructura/firma/metadatos. Compartir, matriz física/iOS y aprobación de tienda conservan sus pendientes.

## Fallos conocidos del entorno

- **PKIX al descargar Gradle:** usar un truststore local con las raíces empresariales que Windows ya confía, como se hizo bajo `.tools/java-trust/`. No desactivar TLS ni importar certificados desconocidos. El truststore contiene una copia del `cacerts` de Java y las raíces empresariales; `changeit` es su contraseña técnica, no la contraseña del keystore de firma.
- **Kotlin: “this and base files have different roots” (C: frente a D:):** en este equipo se resolvió con estas propiedades en `.tools/gradle-cache/gradle.properties`, no en la configuración global:

```properties
kotlin.incremental=false
kotlin.compiler.execution.strategy=in-process
```

- **Plugin de integración ausente en release:** regenerar los metadatos con pub y el build normal, según lo indicado arriba.
- **ADB offline:** consultar `adb devices` y reconectar los dispositivos offline; no borrar datos ni recrear el AVD como primera solución.

## iOS y CI

iOS requiere macOS, Xcode, CocoaPods y firma/provisioning del propietario; mínimo configurado iOS 15. No se compiló ni validó aquí. No seguir la receta de Windows como si produjera un IPA.

`.github/workflows/check-mobile.yml` es un workflow manual de debug, no publica ni firma release. Conserva un SDK fijado en su registro anterior; no representa el entorno Windows 3.44.6 verificado en esta guía. La ejecución remota y configuración de firma en CI son tareas independientes.
