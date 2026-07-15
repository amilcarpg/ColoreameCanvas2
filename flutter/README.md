# PaintMe App

Aplicación móvil nativa multiplataforma de PaintMe, construida con Flutter.

## Ejecutar

```bash
flutter pub get
flutter run
```

La app se desarrollará de forma independiente al sitio de `../web`. Los recursos que pasen a ser compartidos por ambos clientes se centralizarán en `../shared` antes de integrarlos en la app.

## Anuncios y publicación

El catálogo usa Google Mobile Ads con anuncios no personalizados y configuración infantil. El editor nunca carga anuncios. Antes de publicar configura los App IDs de producción como secretos o variables de CI: Android toma `ADMOB_APP_ID` de Gradle o del entorno, e iOS de la configuración de Xcode. El ID de la unidad de banner se inyecta en ejecución:

```bash
flutter run --dart-define=ADMOB_BANNER_ID=ca-app-pub-xxxx/yyyy
```

Para Android, crea `android/key.properties` (no se versiona) con `storeFile`, `storePassword`, `keyAlias` y `keyPassword`; los builds release no usan firma de depuración. Configura `PRIVACY_POLICY_URL` al compilar si la política se publica en otro dominio y revisa los requisitos de Google Play Families y App Store antes de enviar la app a revisión.
