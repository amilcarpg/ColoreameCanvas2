# PaintMe — Ejecución del plan 21–31

Fecha: 07/10/2026. [Plan ejecutado](../PLAN-ITEMS-21-31.md), [backlog](../PRODUCT-BACKLOG.md) y [pruebas pendientes](../PRUEBAS-PENDIENTES.md). Cambios locales, sin commit, push, despliegue, anuncios comerciales, ventas o mensajes a terceros. CAT-02 continúa excluida.

## Resultado y cierres pendientes

| Ítem | Tarea | Estado | Resultado / dependencia restante |
|---:|---|---|---|
| 21 | SEO-01 | Parcial | Seis páginas existentes mejoradas: categoría y guía de actividad para animales, dinosaurios y vehículos. Rutas/queries verificadas. Faltan derechos, revisión visual del piloto y revisión editorial; no publicación comercial autorizada. |
| 22 | SEO-02 | Parcial | WWW confirmado por consulta pública; robots alineado, generador/check de sitemap y 61 rutas/canonical verificadas localmente. Faltan comprobación de la versión nueva publicada y cierre de derechos. |
| 23 | SEO-03 | Condicional | Diferido según el plan: no hay señal de uso/ventas en español, recurso/oferta definida o traducción aprobada. No se creó un frente inglés ni se inventó un producto/precio. |
| 24 | PRIV-01 | Hecho en la versión desactivada | Preferencias centrales versionadas, legacy no concede permisos, rechazo/revocación/tab/storage bloqueado. Sin scripts externos, fuentes externas ni colas anteriores al permiso. Activar servicios futuros requiere implementación/configuración revisada y repetir auditoría. |
| 25 | PRIV-02 | Parcial | Información técnica web/app unificada, versionada y enlazada; explica persistencia/backup/exportación y terceros móviles pendientes. Identidad, país, contacto, mercados y texto definitivo no confirmados; documento marcado pendiente y noindex. |
| 26 | PRIV-03 | Parcial | Baseline por código, HAR de la versión local en Chrome/WebKit y cabeceras públicas consultadas. Cero peticiones a terceros/cookies en sesiones limpias locales. Falta red móvil, producción nueva y servicios/CMP futuros. |
| 27 | DATA-01 | Hecho técnico | Esquemas con enums, slugs conocidos, source normalizado y sin texto libre/dibujos/trazos/URLs. Collector web y móvil apagados; no se habilita recepción de métricas. |
| 28 | DATA-02 | Parcial | Apertura exitosa/fallo, primera pintura, save/restore/export según resultado real instrumentados y probados en web. Móvil recibe hooks de save/apertura; faltan tests de widgets y, si se autoriza, integración del collector. No contar eventos preparados como recibidos por GA. |
| 29 | ADS-01 | Parcial | Componente adulto inactivo con mocks de rechazo, revocación, timeout y resultados tardíos. Nunca ejecuta en editor; no SDK, ID o unidad comercial configurada. Derechos, audiencia, cuenta/proveedor y privacidad definitiva pendientes. |
| 30 | ADS-02 | Parcial | ads.txt sintácticamente correcto y servido públicamente con HTTP 200. app-ads.txt devuelve 404; no se creó un vendedor ficticio. Faltan titularidad de vendedor, cuenta/ficha móvil/dominio y verificación en consola. |
| 31 | MOB-01 | Parcial | Cola de autosave recuperable, timer controlado, snapshot inmediato, dispose idempotente, estado real/reintento y flush de salida/lifecycle implementados. Núcleo probado; Flutter completo, widgets y dispositivos pendientes. |
| Requisito | MOB-02 | Parcial | Escrituras temporales+rename, backups, operaciones serializadas, lecturas sin reescribir índice y marcadores contra resurrección tras clear. Núcleo probado en Windows; falta QA móvil y plataforma Flutter compatible. |

## Privacidad y datos

`web/privacy.js` centraliza estado v2 y controles comunes en todos los tipos de página. No reutiliza `coloreame_consent_v1=granted`. El estado se comparte mediante storage events; storage bloqueado conserva la decisión de sesión sin romper la actividad. La preferencia no borra dibujos. Los servicios de esta versión están explícitamente desactivados; Guardar preferencias no concede permisos publicitarios ni pretende obtener autorización parental.

`analytics-init.js` dejó de cargar GA al hacerse visible la página. Las APIs heredadas de carga devuelven null sin crear scripts; `gtag` conserva únicamente compatibilidad local y no guarda eventos en dataLayer. No hay un collector de red configurado. Se quitaron Google Fonts y permisos CSP para Google/ads: scripts/conexiones propios y frames desactivados. Esto no confirma cumplimiento legal global ni el tratamiento de una app con SDK publicitario existente.

`product-events.js` valida nombres, categoría/modo/plataforma/resultado/source y bandas de tiempo; los slugs deben existir en el catálogo cargado. FAQ no envía el texto de preguntas. No salen búsquedas libres, emails, trazos, URLs, base64 o contenido de lienzo. El esquema móvil y su adaptador sanitizado están en `product_analytics.dart`; la implementación que usa la app sigue desactivada.

La instrumentación web distingue carga exitosa de selección, primera pintura una vez por apertura, persistencia confirmada de fallo, restauración exitosa de fallo y PNG preparado/solicitado de fallo de encoding. Las respuestas obsoletas mantienen los controles de identidad anteriores. Los tests capturan eventos mediante un spy local; **no hay métricas recibidas o facturadas**. Una descarga solicitada no acredita archivo abierto.

La política anterior describía solo móvil y remitía a una ficha no comprobada. `privacy.html` ahora explica web/app por separado, backups posibles, compartir e impresión, y declara los datos de operador y tratamientos que faltan. Todos los enlaces usan ese destino; el texto pendiente queda fuera del sitemap mediante noindex. No se inventó contacto, base jurídica, plazo legal o responsable. `site-config.json` sigue con contacto vacío.

## Red observada y seguridad

- [Baseline de código previo](items-21-31/privacy-baseline-source.json): hashes, carga de GA antes de decidir, flags de aceptación y fuentes externas. No se afirma que esa inspección capturó pings/cookies reales antes del cambio.
- [Chrome: red local](items-21-31/chromium-privacy-network.json) y [WebKit: red local](items-21-31/webkit-privacy-network.json): siete tipos de página × cuatro estados = 28 casos por navegador, sin interceptar/bloquear outbound desde el runner en este caso. CSP permanece activa; ninguna petición a terceros, ninguna cookie en esos contextos limpios, dibujo conservado.
- HAR por página y navegador en la misma carpeta, con contenido de respuestas omitido; tráfico artificial local, sin usuarios o dibujos de niños. Los otros recorridos de motor sí usan el bloqueo de terceros anterior, por lo que no sustituyen este caso específico de red.
- [Consulta pública de host/cabeceras/registros](items-21-31/public-host-readonly.json): HTTPS sin WWW terminó en WWW; root/robots/sitemap/ads.txt devolvieron 200. app-ads.txt devolvió 404. No se observaron CSP/HSTS/X-Content-Type-Options/Referrer-Policy como cabeceras en esas respuestas; la CSP nueva es meta local, no una cabecera de producción nueva.

No se auditó una sesión pública que acepte publicidad real, ni la red de una app física. Los resultados locales no se extienden a la versión aún publicada. Si se añade un proveedor habrá que revisar endpoint/datos, CMP, cookies, CSP y revocación del SDK; esta versión no incluye ni carga ese SDK.

## SEO y publicidad

La categoría ayuda a elegir dibujo por forma/detalle; su pack correspondiente es una guía gratuita de actividad acompañada y papel. Las seis páginas son las existentes de animales/dinosaurios/vehículos; incluyen selección, uso de balde/pincel, deshacer, guardar/descargar e impresión por adulto. No hay PDF, oferta pagada, promesa pedagógica, licencia comercial nueva ni nuevas fichas de personajes.

`scripts/check-site.cjs` valida CNAME/canonical, enlaces locales, rutas, robots, sitemap y sintaxis del vendedor Google existente. `--write` genera el sitemap determinista desde canonical de páginas existentes sin noindex. Hay 61 HTML locales y 60 URLs de sitemap; la política pendiente no entra. El comando se incorpora al gate web de Pages mediante `check-web.cjs`. La disponibilidad pública de todos los cambios sigue pendiente de despliegue autorizado; el check no aplica el filtro comercial de CAT-02.

`ad-slot.js` prepara un único lugar adulto, sin requests, proveedor ni SDK en producción. Su controlador colapsa cuando no hay autorización y libera resultados viejos al revocar, fallar, caducar o desmontar. Las pruebas usan nodos locales de creatividad artificial; no se muestran anuncios comerciales ni se hacen clics en ellos. Activarlo no se resuelve cambiando un booleano: faltan integración/proveedor y cierres del plan.

ads.txt se conserva con el registro público existente; comprobar sintaxis no demuestra que el operador sea dueño de ese vendedor ni que AdSense/AdMob esté aprobado. app-ads.txt necesita vendedor confirmado y dominio vinculado a una ficha móvil real. Por eso no se copió automáticamente el registro web a un archivo móvil.

## Persistencia móvil

`drawing_storage.dart` pasa a ser el adaptador de directorio de plataforma; `local_drawing_storage.dart` contiene las operaciones comprobables sin Flutter. Una cola serializa tanto lecturas como escrituras entre instancias; una operación fallida no bloquea las siguientes. Las lecturas reconstruyen metadata en memoria sin reparar índice en disco. Las mutaciones posteriores escriben versión nueva.

Cada archivo se escribe temporalmente con flush y después se renombra; se conserva backup anterior. Se recupera índice de backup ante JSON corrupto y PNG anterior si falta el principal. No se afirma que el núcleo decodifique/valide visualmente PNG corruptos: esa validación sigue en el motor y requiere pruebas de app. Clear persiste un marcador para que migración/backups no hagan reaparecer una obra borrada; un nuevo save exitoso lo retira. Slugs fuera del esquema se rechazan y los bytes del llamador se copian antes de esperar.

PNG e índice son **dos reemplazos individuales**, no una transacción de filesystem entre ambos. Si el PNG se reemplaza y falla después el índice, se informa fallo; la lectura puede recuperar el PNG nuevo con metadata antigua. No se destruye deliberadamente la última copia válida ni se anuncia éxito antes de terminar la escritura.

Autosave captura bytes al pedir guardar, serializa, atrapa fallos/timer y devuelve resultado explícito. Un resultado antiguo no borra el estado pendiente de una edición posterior. Dispose cancela el timer, guarda la última captura y es idempotente. La UI añade Guardando/Guardado/Falló/Reintentar, espera el resultado antes de afirmar guardado al salir/completar y diferencia salir sin guardar. Se añadió observador para inactive/paused/hidden; esto mejora el intento de persistencia, pero el sistema operativo aún puede terminar el proceso antes de completar IO.

El Dart disponible 3.7.2 ejecutó y analizó el núcleo real extraído; no usa dobles del almacenamiento/autosave para ocultar sus errores. `pubspec.yaml` sigue exigiendo ^3.11.5. Se consultó el [archivo oficial Flutter](https://docs.flutter.dev/install/archive); la petición al manifiesto Windows devolvió HTTP 404 y no se obtuvo un SDK compatible. No se actualizó el SDK existente, bajó la restricción ni cambió el lock para hacer pasar tests. [Registro de entorno](items-21-31/sdk-environment.json).

## Verificación y repetición

| Comprobación | Resultado |
|---|---|
| Node: núcleo web + preferencias/esquema | 44/44 |
| Chrome 154.0.8037.98 / WebKit 26.5, Windows headless | 71/71 en cada motor |
| Caso de red sin bloqueo del runner | 28 estados por motor; 56 total |
| Pintar/exportar todos los dibujos | 62 × dos modos × dos motores = 248 recorridos |
| Rutas/canonical/sitemap/ads.txt | 61 HTML / 60 URLs; validación local aprobada |
| Pipeline catálogo | 227 salidas, cero diferencias; 8/8 tests Python |
| Regresiones históricas W1/W2 | Ambos hacen fallar el gate |
| Núcleo móvil real: storage/autosave/esquema | 12/12, Dart 3.7.2 en Windows |
| Analyzer del harness móvil independiente | `dart analyze tests/mobile-storage-autosave.dart`: sin incidencias |
| Parse de cinco Dart modificados mediante format --output=none | Correcto; formato previo de main preservado, sin afirmar analyzer Flutter |

```powershell
node scripts/check-web.cjs
node scripts/check-site.cjs
node scripts/verify-web-gate.cjs
python scripts/build_catalog.py
python -m unittest discover -s tests -p test_catalog_pipeline.py -v

# Playwright y navegadores de desarrollo; mismas variables del informe 6–10.
$env:PAINTME_BROWSER_ENGINE = 'chromium'
node --test tests/web-browser.test.cjs
$env:PAINTME_BROWSER_ENGINE = 'webkit'
node --test tests/web-browser.test.cjs

# Core independiente; no equivale a flutter test/analyze.
D:/flutter/bin/cache/dart-sdk/bin/dart.exe tests/mobile-storage-autosave.dart
D:/flutter/bin/cache/dart-sdk/bin/dart.exe analyze tests/mobile-storage-autosave.dart
```

El harness móvil verifica interrupción antes de replace, índice fallido, serialización, lectura sin mutación, backups, clear, traversal, copia de bytes, fallo→retry, timer/dispose, resultados obsoletos, captura/UI fallida y esquema mínimo. El test Flutter de migración se actualizó para exigir que list no cree un índice; la suite Flutter completa no se ejecutó por el entorno.

## Lo que queda

Datos del operador/contacto y tratamientos; derechos/CAT-02; revisión visual/editorial del piloto; red y configuración públicas de la versión nueva; proveedor/CMP/vendedor/cuenta/ficha; Flutter compatible y QA de widgets/filesystem/lifecycle físico. Las pruebas están registradas en [PRUEBAS-PENDIENTES.md](../PRUEBAS-PENDIENTES.md). Inglés permanece condicionado; no se obtuvo evidencia de demanda, ingresos o cumplimiento global por ejecutar tests.
