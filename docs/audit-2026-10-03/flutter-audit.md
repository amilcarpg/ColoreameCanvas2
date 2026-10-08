# Auditoría Flutter — PaintMe — 2026-10-03

## Alcance y estado

Revisión estática de Flutter Android/iOS, solo lectura del producto. Se autoriza únicamente este informe. No se encontraron AGENTS.md aplicables en raíz, ascendentes ni Flutter. El usuario confirma tráfico cero y monetización configurada pero no publicada; no hay evidencia de aprobación de tiendas ni ingresos. Esta app constituye una base funcional, no una publicación verificada. Con una meta de USD 1.400 brutos mensuales, conviene validar adquisición y uso repetido antes de abrir dos frentes de publicación móvil.

## Implementación comprobada

- Catálogo local, categorías, búsqueda y favoritos: `D:/DevAPG/ColoreameCanvas2/flutter/lib/catalog_repository.dart:5`, `main.dart:122`, `main.dart:254`. El padre verificó 43 dibujos Flutter y sus archivos.
- Editor con balde, pincel, borrador, 12 colores, zoom, deshacer y terminados: `D:/DevAPG/ColoreameCanvas2/flutter/lib/main.dart:652`, `main.dart:1021`, `main.dart:1121`, `drawing_engine.dart:79`.
- Contorno separado de color y flood fill con cola tipada de capacidad width × height; no hereda el defecto de capacidad de cola encontrado en web: `D:/DevAPG/ColoreameCanvas2/flutter/lib/drawing_engine.dart:34`.
- Persistencia local PNG e índice de favoritos/estado, migración PNG antiguos: `D:/DevAPG/ColoreameCanvas2/flutter/lib/drawing_storage.dart:31`, `drawing_storage.dart:64`, `drawing_storage.dart:129`.
- Analytics deliberadamente desactivado y entitlement sin anuncios siempre false: `D:/DevAPG/ColoreameCanvas2/flutter/lib/product_analytics.dart:10`, `entitlement_repository.dart:5`. No hay compra implementada; UI muestra Próximamente (`main.dart:1345`).
- Ads en catálogo, sin componente banner en editor, configuración infantil/G previa a inicialización y petición no personalizada: `D:/DevAPG/ColoreameCanvas2/flutter/lib/ad_service.dart:19`, `ad_banner.dart:49`, `main.dart:262`.

## Hallazgos priorizados

### Alta: autosave puede dejar de guardar después de un error

Hecho: `_pendingSave` se encadena con `.then` y nunca recupera rechazo (`D:/DevAPG/ColoreameCanvas2/flutter/lib/autosave_controller.dart:25`, `autosave_controller.dart:34`). Un primer fallo impide que se invoquen los siguientes saves de ese controlador. El Timer no captura errores. `dispose()` se invoca sin esperar (`main.dart:933`) y no existe observador de ciclo de vida para guardar al pasar a segundo plano. El diálogo asegura que se guardó antes de confirmar escritura (`main.dart:854`). Inferencia: pérdida de trabajo en errores de disco o cierre rápido; no se reprodujo en dispositivo. Acción: recuperar cola, estado visible de guardado/error, flush al suspender/salir y pruebas con fallo inyectado y recuperación.

### Alta: compartir en iPad carece de origen requerido

Hecho: ShareParams no recibe `sharePositionOrigin` (`D:/DevAPG/ColoreameCanvas2/flutter/lib/export_service.dart:17`). La [documentación del paquete 12.0.2](https://pub.dev/packages/share_plus/versions/12.0.2) exige ese parámetro en iPad y advierte fallo, crash o UI bloqueada sin él. Tampoco se captura error en el botón (`main.dart:1005`). Acción antes de soporte iPad: origen del botón, estado/error y prueba real. Exportar escribe documentos privados y abre share sheet; no ofrece guardado directo a galería ni PDF.

### Alta: publicación Android no verificada y versión AGP bajo requisito declarado

Hecho: AGP 8.11.1 en `D:/DevAPG/ColoreameCanvas2/flutter/android/settings.gradle.kts:22`; share_plus ^12.0.1 (lock 12.0.2 en pubspec.lock:378) en `flutter/pubspec.yaml:37`. El [paquete 12.0.2](https://pub.dev/packages/share_plus/versions/12.0.2) declara AGP >=8.12.1. Inferencia: riesgo de build nativo incompatible, no error reproducido. Flutter SDK existe pero no hay .dart_tool, android/local.properties ni android/key.properties en este checkout. No se compiló release. No instalar ni actualizar por esta auditoría.

### Media: banner fallido queda retenido

Hecho: `onAdFailedToLoad` dispone el anuncio sin poner `_ad = null` ni reintento (`D:/DevAPG/ColoreameCanvas2/flutter/lib/ad_banner.dart:53`); carga futura retorna cuando `_ad != null` (`ad_banner.dart:37`) y build usa todo objeto no nulo (`ad_banner.dart:70`). Inferencia: banner sin recuperación tras fallo y posible montaje con objeto dispuesto. Una carga tras await entitlement tampoco revisa mounted. Acción: estado loaded, descarte coherente, mounted y retry controlado.

### Media: configuración de ads aún no acredita monetización lista

Hecho: falta ADMOB_BANNER_ID usa unidad de prueba también en release (`D:/DevAPG/ColoreameCanvas2/flutter/lib/ad_banner.dart:39`). Android sí exige App ID no vacío y archivo de firma para tareas release (`android/app/build.gradle.kts:71`), pero no verifica banner productivo ni contenido completo de firma. iOS referencia $(ADMOB_APP_ID) (`ios/Runner/Info.plist:22`) sin definición versionada encontrada. No se leyeron credenciales. Acción: contrato de configuración por ambiente y smoke test de artefacto firmado. No tomar estas piezas como ingresos o aprobación de AdMob.

### Media: manejo de privacidad y error de UMP incompleto

Hecho: error de actualización UMP se descarta (`D:/DevAPG/ColoreameCanvas2/flutter/lib/ad_service.dart:15`), sin consultar canRequestAds en esa rama ni fallback permitido. Opciones se muestran siempre detrás del acceso adulto, sin getPrivacyOptionsRequirementStatus (`main.dart:1340`). La [guía UMP](https://developers.google.com/admob/flutter/privacy) describe consulta del requisito y revisión de canRequestAds también al fallar consentimiento. La configuración infantil es evidencia técnica, no certificación legal. Falta verificar mensajes de cuenta, Data Safety/App Privacy, audiencia elegida y comportamiento geográfico en dispositivo.

### Media: escrituras de almacenamiento no son atómicas

Hecho: PNG e índice se sobrescriben directamente (`D:/DevAPG/ColoreameCanvas2/flutter/lib/drawing_storage.dart:85`, `drawing_storage.dart:129`); `_readIndex` también escribe y operaciones list/load no se encolan como mutaciones (`drawing_storage.dart:44`, `drawing_storage.dart:95`). Inferencia: interrupción puede truncar archivo; lecturas concurrentes que reescriben índice pueden perder metadatos. Recuperación de índice corrupto salva inventario PNG, no favoritos/terminados. Acción: temp + rename, lecturas puras, serialización y prueba de corrupción/concurrencia.

### Media: rendimiento y UX críticos pendientes de ejecución

Hecho: fill usa isolate; decode inicial, snapshots PNG por gesto, export y encoding de autosave se ejecutan sin isolate (`D:/DevAPG/ColoreameCanvas2/flutter/lib/drawing_engine.dart:137`, `drawing_engine.dart:193`, `main.dart:694`). Con imágenes de hasta 1200 px esto merece perf profiling; no se midieron FPS/RAM. Undo/reset/compartir permanecen disponibles durante fill (`main.dart:991`), mientras fill reemplaza colorLayer al volver; posible carrera de operaciones. `Mis dibujos` usa miniatura del original, no obra pintada (`main.dart:610`) y favoritos previos a pintar se consideran inProgress. Reset sin confirmación, aunque permite undo. No hay verificación de zoom/coordenadas, gestos, accesibilidad completa, pantalla estrecha, landscape ni textos grandes.

## Release, documentación y QA

Android evita firma debug para release y gitignore excluye keystore/key.properties; README documenta variables básicas (`D:/DevAPG/ColoreameCanvas2/flutter/android/app/build.gradle.kts:53`, `android/.gitignore:15`, `flutter/README.md:15`). iOS contiene bundle/team y firma automática, pero no acredita provisioning disponible. Solo se encontró CI para publicar web (`D:/DevAPG/ColoreameCanvas2/.github/workflows/deploy-pages.yml:1`). No se encontraron CI móvil, matriz dispositivos, runbook de rollback ni checklist de tienda.

Hay siete casos de test versionados: dos motor/catálogo, tres storage y dos widgets de identidad/tamaño (`D:/DevAPG/ColoreameCanvas2/flutter/test/drawing_engine_test.dart:8`, `drawing_storage_test.dart:19`, `paintme_ui_test.dart:7`). El test de balde comprueba canal rojo blanco/rojo y por ello no demuestra que el lado derecho permanezca sin pintar. No cubren autosave con fallo, ads/UMP, export, lifecycle, corrupción, undo/reset o editor completo.

Se intentaron `flutter analyze --no-pub` y `flutter test --no-pub`; ambos permanecieron sin salida ni resultado. El wrapper Flutter intenta adquirir `D:/flutter/bin/cache/flutter.bat.lock` en un bucle (`D:/flutter/bin/internal/shared.bat:44`); ese SDK está fuera de raíces de escritura autorizadas, por lo que la restricción de lock es una explicación probable, no una confirmación diagnóstica. No se cambió SDK ni se instaló nada. Checks **no concluidos**, no aprobados y no se atribuyen fallos de test al producto. También faltan dependencias resueltas locales (.dart_tool). Compilar iOS requiere entorno macOS/Xcode; no disponible aquí.

## Decisión sugerida

Resolver primero fiabilidad del dibujo y guardado. Mantener Flutter como beta interna hasta un smoke test Android firmado y pruebas de persistencia/compartir. El siguiente gasto de negocio debe validar niños/familias usando y repitiendo la experiencia, con métricas mínimas agregadas y consentimiento adecuado; aún no hay tráfico para estimar eCPM, fill rate, retención ni ingresos. Elegir Android como primer experimento móvil por capacidad local, sin asumir que iOS o compra sin anuncios estén terminados. Publicación y objetivos económicos requieren evidencia posterior.


Los dos procesos de comprobación se interrumpieron con Ctrl+C tras no producir salida; terminaron con código 1, sin diagnóstico de analyzer ni tests.

