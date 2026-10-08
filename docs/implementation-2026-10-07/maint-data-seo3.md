# MAINT-01, DATA-02 y SEO-03 — 7 de octubre de 2026

Implementación local solicitada por el usuario. Google Analytics se eligió para web y Firebase Analytics para Flutter. No se proporcionaron ID de GA4 ni proyecto Firebase. No se publicaron cambios ni se activaron servicios. CAT-02 sigue excluido y COM-01/02/03 pospuestos.

## MAINT-01

- `web/editor-ui.js` concentra cinco renderizadores: temas, galería, opciones de paleta, colores y selector de dibujos. Ambos motores conservan sus estados y operaciones; elegir color en pincel sigue saliendo del borrador.
- Colores y categorías se leen de los helpers comunes, eliminando las listas duplicadas de los motores. La comprobación de dependencias falla explícitamente si falta el módulo compartido.
- `flutter/lib/catalog_widgets.dart` contiene los cuatro componentes visuales del catálogo y su función de color por categoría, extraídos de `main.dart` (211 líneas de la pantalla anterior). No cambia el repositorio ni el formato de almacenamiento.
- El collector se inyecta desde la app hasta catálogo/editor. Un límite que sanea y captura errores evita que una caída de analítica se convierta en fallo de apertura o impida pintar.

## DATA-02: integraciones preparadas, recepción pendiente

### Web / GA4

`web/site-config.json` contiene `analytics.enabled=false`, `treatmentReviewed=false`, ID vacío y tres rutas preparadas: adultos, actividad española de dinosaurios y piloto inglés. La etiqueta de una ruta no acredita audiencia adulta; revisar la audiencia y los tratamientos antes de cambiar esos valores. Los editores infantiles conservan CSP exclusivamente local y no están en ese alcance.

`analytics-init.js` valida ID `G-…`, revisión declarada, ruta y CSP. No inserta el SDK ni acumula eventos antes de una nueva elección explícita. Usa el modo básico: el código no envía al SDK el estado de denegación antes de cargarlo. Una preferencia histórica no habilita automáticamente la nueva integración. La disponibilidad no equivale a permiso.

Después del permiso configura `send_page_view=false`, Google Signals y personalización desactivados, todos los permisos publicitarios denegados y cookies con prefijo propio y duración de 30 días sin renovación automática. Los eventos pasan por el esquema: sin búsqueda libre, dibujos, trazos ni URL con query/hash; referrer vacío, título fijo y `ui_language=es/en`. `resource_open` describe una apertura **medida después del permiso**, no una visita adulta cualificada, persona única ni toda la audiencia. `track=true` significa entregado a la cola del SDK; no acredita recepción en GA4.

Rechazar/revocar bloquea el collector, activa `ga-disable-ID`, elimina el script y cookies propias accesibles, limpia la cola y resuelve cargas pendientes. Un callback obsoleto o de un intento fallido no reinicia la carga. El SDK descargado no puede desinstalarse de la memoria del navegador: verificar red, engagement automático y configuración de cuenta en staging. Desactivar Enhanced Measurement y cualquier etiqueta/integración adicional en la propiedad; el filtro de eventos propios no controla automáticamente todas las funciones de Google.

Solo tres páginas permiten los dominios precisos de GA en CSP. No se añadieron anuncios, comodines, `unsafe-eval` ni scripts externos estáticos.

Configuración pendiente: ID público de la propiedad seleccionada, país/mercados/edades, tratamiento y avisos completos, revisión de cuenta y captura de red. El ID encontrado en archivos históricos no se reutilizó automáticamente.

### Flutter / Firebase

Dependencias oficiales fijadas: `firebase_core 4.15.0` y `firebase_analytics 12.6.0`. `firebase_product_analytics.dart` implementa el gateway real, configuración por Dart defines y control en los ajustes adultos. `firebase-config.example.json` lista los campos públicos requeridos: API key, App ID específico de la plataforma, Project ID y Messaging Sender ID. No hay contraseñas ni cuenta creada por esta tarea.

Por defecto Firebase no se inicializa desde Dart y la recopilación está **desactivada también en el manifiesto Android final**. Se elimina `FirebaseInitProvider`, se desactiva reporte automático de pantallas/AD_ID y se deniega almacenamiento/publicidad por defecto. El plugin Android obtiene una instancia nativa al registrarse: por eso el apagado Dart por sí solo sería insuficiente. El build únicamente permite retirar la desactivación nativa con configuración válida y ambos defines `PAINTME_ANALYTICS=true` y `PAINTME_ANALYTICS_REVIEWED=true`; eso prepara la disponibilidad, no concede el permiso de la sesión.

El control adulto concede permiso solo para la sesión, sin reutilizar una preferencia persistida. No concede publicidad ni personalización. Las operaciones del collector se serializan; revocar impide eventos nuevos inmediatamente y desactiva/resetear los datos del SDK; cargas tardías vuelven a apagarlo. Los tests usan un gateway fake; no acreditan ausencia de todo tráfico nativo, consentimiento parental verificable ni recepción en Firebase. El SDK puede emitir eventos automáticos y procesar datos ajenos al payload personalizado cuando se active. Revisar arranque frío con un permiso previo, background, cierre forzado y revocación en dispositivo antes de activar un build público.

Se instrumentaron apertura fallida, restauración tras decodificar un PNG real y tiempo hasta primer color en bandas. El borrador no cuenta como primer color. Fallos de un collector inyectado no rompen el editor. No se emite éxito de restauración por encontrar solamente metadatos ni éxito de guardado antes de la escritura.

iOS permanece desactivado nativamente y en la disponibilidad Dart. Firebase exige iOS 15: Podfile y proyecto se alinearon y se eligió el pod sin soporte de ID publicitario. Falta compilar/inspeccionar en macOS y revisar el SDK para esa audiencia antes de habilitar esta plataforma. No se declara iOS probado.

## SEO-03: piloto gratuito

`web/en/dinosaur-coloring.html` ofrece cuatro dinosaurios del catálogo existente, guía familiar y salida digital/imprimible. No se creó producto de pago ni se afirmó titularidad original de esos dibujos. CAT-02 conserva su exclusión.

La actividad española y la landing inglesa tienen canonical propio, alternates `es/en` recíprocos y enlaces de idioma. El sitemap incluye la landing; la política inglesa es un borrador `noindex`. Los editores usan `?lang=en`, el mismo motor y las mismas claves locales, con catálogo limitado a los cuatro dinosaurios, labels, colores, accesibilidad y diálogos localizados. Cambiar balde/pincel conserva idioma y asset y explica los trabajos independientes. El idioma no se convierte en una segunda copia del historial.

El módulo de localización usa un vocabulario acotado y patrones conocidos sobre presentación, sin modificar los píxeles, almacenamiento ni código del motor. La copia inglesa requiere revisión editorial por una persona competente antes de promocionar. Indexación, demanda, visitas cualificadas, ventas y comparación comercial no se han medido.

## Verificación y limitaciones

- Gate web: 50 pruebas y 63 rutas/canonicals, 61 URLs de sitemap. W1/W2 históricos siguen bloqueando el gate.
- Flutter: analizador sin incidencias y 32 pruebas aprobadas; registros en `maint-data-seo3/`.
- Chromium/WebKit: 78 pruebas aprobadas por navegador; resultados completos en `maint-data-seo3/`. Tras completar vocabulario de colores/accesibilidad y ajustar la landing a la grilla existente se repitieron los tres casos ingleses en ambos navegadores; aprobados, incluidas solicitudes externas cero en el recurso con configuración apagada. Capturas de escritorio/390 px revisadas visualmente. Son navegadores automatizados en Windows, no dispositivos físicos.
- APK debug: `app:assembleDebug` completó en 3 min 9 s y la recompilación final en 1 min 14 s; manifiesto inspeccionado en `android-manifest.json`. No instalado, firmado para producción ni publicado. Advertencias existentes de AGP/Gradle y warnings de dependencias no impidieron compilar.
- La primera compilación se interrumpió al detectar que Flutter había regenerado `local.properties` con el SDK global; Gradle alcanzó a instalar Build Tools 35 y Platform 36 en `D:/Android/android-sdk`. Se corrigió la ruta local y la compilación final usó `.tools/android-sdk` (añadió API 34 requerida por plugins). No se borraron esos paquetes ni se alteró la configuración global de Flutter.

**Defecto previo observado:** la recuperación web con pincel reconstruye la capa desde un PNG compuesto y puede alterar bordes con alfa parcial. Los fixtures de líneas opacas pasan y las zonas pintadas del dinosaurio real se conservan. La prueba inglesa compara todos los píxeles fuera de la máscara de contorno; no acredita igualdad completa de bordes. Registrar/corregir formato de capas y migración antes de exigir restauración exacta de toda obra. No se cambió el algoritmo de restauración en esta refactorización.

## Pasos para completar la medición

1. Confirmar la propiedad GA4 y aplicaciones Firebase reales, sin compartir credenciales privadas.
2. Completar tratamientos, audiencia/mercados y políticas. Una página para adultos o una puerta aritmética no verifica consentimiento parental.
3. Configurar un staging restringido, con muestras de adultos autorizadas. Probar rechazo/aceptación/revocación y arranque previo antes de habilitar producción.
4. Comprobar solicitudes y payloads y recepción en DebugView/Realtime; distinguir intentos, eventos recibidos y resultados de actividad. Documentar tamaños de muestra y cobertura del consentimiento.
5. Ejecutar las pruebas físicas y de cuenta registradas en `docs/PRUEBAS-PENDIENTES.md`. Mantener DATA-02 parcial hasta verificar esa recepción y semántica en los servicios seleccionados.

## Fuentes técnicas oficiales consultadas el 07/10/2026

- [Modo básico frente a avanzado](https://developers.google.com/tag-platform/security/concepts/consent-mode): explica el bloqueo de carga previo y los pings del modo avanzado.
- [Configuración GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config) y [controles de privacidad](https://developers.google.com/tag-platform/security/guides/privacy): opciones, cookies y `ga-disable`.
- [Flutter Analytics](https://firebase.google.com/docs/analytics/flutter/get-started), [colección Android](https://firebase.google.com/docs/analytics/android/configure-data-collection) y [colección iOS](https://firebase.google.com/docs/analytics/ios/configure-data-collection): integración y desactivación nativa.
- [firebase_analytics 12.6.0](https://pub.dev/packages/firebase_analytics/versions/12.6.0), [firebase_core 4.15.0](https://pub.dev/packages/firebase_core/versions/4.15.0) y [setConsent](https://pub.dev/documentation/firebase_analytics/latest/firebase_analytics/FirebaseAnalytics/setConsent.html): APIs verificadas además en los paquetes descargados. Requisito iOS 15 y pod sin AdId comprobados en el podspec local.
