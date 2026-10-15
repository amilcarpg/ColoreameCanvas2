# Android: compilación y pruebas en emulador

Fecha: 15/10/2026. Alcance autorizado: desarrollo local, sin publicación ni activación de servicios.

## Entorno y correcciones

Flutter 3.44.6 / Dart 3.12.2, Java 21 de Android Studio, Gradle 9.1.0, Android SDK instalado y emulador propio del proyecto `PaintMe_API_35` (`emulator-5560`, Android 15/API 35, x86_64, 1080×2400). AVD, caché Gradle y truststore locales bajo `.tools/`; no se modificaron certificados globales ni el AVD personal.

La descarga usa la distribución binaria oficial de Gradle, con SHA-256 fijado en el wrapper: `a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806`. El truststore local incorpora raíces empresariales ya confiadas por Windows para validar TLS. No se desactiva la validación. Se desactiva la compilación incremental Kotlin solamente en la configuración local de Gradle para evitar el fallo entre Pub Cache en C: y proyecto en D:.

Se corrigió un defecto reproducido con Dinosaurio 1200×1200: `InteractiveViewer` recortaba el dibujo a la pantalla y «Ajustar» restauraba una identidad incorrecta. `DrawingViewport` ajusta y centra el contenido y mantiene los toques en coordenadas del viewport para aplicar una sola inversa. Incluye reajuste por dimensiones/orientación. También se corrigió el fondo de Scaffold para que los encabezados fueran legibles.

## Validación

- Analyzer: sin incidencias.
- Flutter: 34 pruebas aprobadas, incluidas dos nuevas de ajuste/coordenadas/orientación.
- Android nativo, fase `paint`: aprobada con salida 0. Catálogo real, decodificación, dibujo completo visible, toque sobre una región real, autosave, deshacer/rehacer y lectura del PNG con igualdad RGBA exacta. Exportación compuesta generada con el motor real y guardada en el filesystem Android.
- Android nativo, fase `restore`: aprobada con salida 0 después de cierre forzado, modo avión y Wi-Fi/datos apagados (tabla de rutas vacía). Igualdad RGBA exacta con el PNG de la ejecución anterior y obra presente en el índice. El arnés requería bombear un frame antes de tomar la segunda captura de una pantalla sin cambios; corregido.
- Anuncios y analítica deshabilitados explícitamente. La prueba verifica la configuración; los SDK/plugins siguen incluidos. No equivale a auditoría integral de tráfico.

Las capturas y JSON se guardan primero en la app y se recuperan con `adb exec-out run-as`; así se evita transferir grandes listas de bytes por el canal de resultados del driver. La prueba de recuperación es una segunda ejecución con `QA_PHASE=restore`, después de `am force-stop`, modo avión y Wi-Fi/datos apagados; no limpia datos ni desinstala la app.

Evidencia: [carpeta Android](qa-evidence/2026-10-14/android-emulator/), [captura pintada](qa-evidence/2026-10-14/android-emulator/qa-paint-after.png), [resultado nativo](qa-evidence/2026-10-14/android-emulator/qa-paint-results.json). La carpeta conserva la fecha de inicio de la sesión; esta continuación se ejecutó el 15/10.

## Límites para cierre de backlog

**Continuación posterior autorizada:** el AAB y APK release actuales ya se generaron con la firma existente y se verificaron por separado. El APK release también pasó instalación, pintura y recuperación tras cierre en un segundo emulador. Las menciones de release pendiente en este informe describen el alcance inicial debug. Ver [resultado release](ANDROID-RELEASE-2026-10-15.md).

APK normal de prueba (sin entrada del arnés): `.tools/apks/paintme-debug-noads-x86_64.apk`, compilado e instalado nuevamente con éxito. Paquete `com.focuzlab.paintme`, versión 1.0.0, minSdk 24, target/compile 36. SHA-256: `d7f3a0b2f9dc86b2f241f3e791dd2bc927292d21c482506c53f5539c4d32f4ee`. Es para el emulador x86_64; no es una entrega para teléfonos ARM. [Metadatos](qa-evidence/2026-10-14/android-emulator/apk.json).

Esta validación usa un Android emulado y un APK debug x86_64. No cierra release firmado, Google Play, iOS/iPad, share sheet con entrega/cancelación, proveedor publicitario real, lectores de pantalla ni rendimiento de un teléfono modesto. El cierre forzado se realiza después del autosave confirmado: no demuestra supervivencia si el SO mata el proceso durante una escritura en curso. Se mantienen los ítems correspondientes como parciales.

La recomendación sobre composición/resolución está en [Imágenes para PC y móvil](IMAGENES-PC-MOVIL.md).
