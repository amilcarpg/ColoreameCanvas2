# Evidencia versionada y archivos locales

Se conservan en Git los informes de verificación, resúmenes por dibujo, manifiestos/hashes de publicación, resultados de compilación/firma y capturas seleccionadas de Android.

Las exportaciones PNG repetidas, capturas masivas, candidatos descartados, estados intermedios, HAR y capturas de consolas autenticadas del 14/10/2026 permanecen en la copia local; no se suben al repositorio público. Los informes históricos pueden referirse a esos archivos locales como trazabilidad de la ejecución. La ausencia de esos binarios en Git no representa una prueba pendiente ni una nueva ejecución.

Los APK/AAB, SDKs, cachés y herramientas descargadas permanecen bajo `.tools/` o directorios de build ignorados. Los keystores, contraseñas y configuraciones locales de Firebase/AdMob no se versionan. Para compilar, consultar [Compilación móvil](../COMPILACION-MOVIL.md).
