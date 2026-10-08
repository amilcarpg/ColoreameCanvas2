# WEB-01, WEB-02, QA-01, WEB-03 y WEB-04 — implementación y verificación

Fecha: 07/10/2026. Alcance autorizado: atender las cinco primeras tareas indicadas por el usuario. Cambios locales, sin push, publicación, activación de anuncios ni cobros. Se conservaron y completaron los cambios que ya estaban presentes en helpers, editores y worker.

## Resultado

| Tarea | Estado técnico | Evidencia |
|---|---|---|
| WEB-01 | Hecho | Cuatro paletas, navegación Siguiente/Sorpresa, carga de helpers y guardado/restauración comprobados en ambos editores; orden de scripts validado; fallo de dependencia muestra mensaje claro. |
| WEB-02 | Hecho | Worker y fallback comparten algoritmo. Regiones 10×10, 100×100 y 1200×1200 completas; máscara, regiones aisladas, bordes, tolerancia, mismo color y entrada inválida cubiertos. |
| QA-01 | Hecho | Gate con assertions y salida no cero; sintaxis, catálogo, recursos, proporciones, helpers, motor y almacenamiento. Reintroducir W1 y W2 en una carpeta temporal hizo fallar sus comprobaciones con código 1. El workflow Pages ejecutará el gate antes de publicar. |
| WEB-03 | Hecho | Apertura bloqueada/error/timeout, excepción/aborto/timeout de transacción y cuota cubiertos; recuperación posterior verificada; lecturas conservan backup; versión reciente gana; borrado con tombstone impide resucitar copia antigua. |
| WEB-04 | Hecho en Chrome automatizado | Snapshot con slug/revisión, escrituras serializadas y callbacks obsoletos descartados. Cambios de dibujo/categoría/enlace esperan guardado. beforeunload/pagehide/visibilitychange preparan respaldo síncrono. Recarga inmediata, cierre/reapertura de pestaña y trazo aún en curso comprobados. |

“Cambiar modo” guarda la obra en el modo de origen antes de navegar. La transferencia de asset/capas entre modos sigue siendo WEB-07; este cambio no fusiona las dos obras.

## Implementación

- `web/app-utils.js`: helpers públicos, transacciones acotadas y conexiones cerradas, selección de registro más reciente, cola por clave, backups, tombstones y controlador de autosave con identidad de revisión.
- `web/flood-fill.js`: motor compartido con cola tipada de N píxeles y marca de visitado al encolar. Se cuenta también el trabajo descartado al repartirlo por frames.
- `web/paint-worker.js`: importa el motor, valida solicitudes y devuelve error explícito para que el editor libere el estado.
- `web/paint.js` y `web/brush.js`: bloquean transiciones incompatibles; capturan la obra antes de cambiar de dibujo; revierten selección si no se puede guardar; preparan respaldo al salir y evitan avisos de éxito de una revisión anterior.
- Se incrementa la revisión desde el inicio y durante un trazo: un autosave previo no puede marcar como guardado un trazo nuevo todavía en curso.
- Reset espera las escrituras ya iniciadas antes de borrar. Una descarga preparada no se toma como prueba de guardado local. La lectura/escritura de preferencias existente tolera storage bloqueado.
- `web/paint.html` y `web/brush.html`: orden de dependencias y versiones de recursos actualizados.
- `.github/workflows/deploy-pages.yml`: Node 24 y ejecución de `scripts/check-web.cjs` antes de subir/desplegar.

Los ajustes adyacentes de reset, callbacks y storage de preferencias son necesarios para evitar carreras o un editor roto al probar las tareas solicitadas. No se implementó reinicio con confirmación/recuperación completa (WEB-08), rehacer, nueva UX, política ni monetización.

## Verificación ejecutada

- **29 tests de lógica aprobados** en `tests/web-core.test.cjs` con Node 24.19.0.
- **14 tests de navegador aprobados** en `tests/web-browser.test.cjs`, usando Chrome instalado en Windows mediante Playwright, en modo headless. Se incluyen viewport 390×844 y 1280×800; no son dispositivos físicos.
- **20 recorridos** de pintar→deshacer→pintar→recargar inmediatamente→restaurar→reiniciar, diez por editor. El PNG restaurado coincide exactamente con el snapshot esperado.
- Paletas, siguiente/sorpresa, cambio rápido, categorías, “Ver todos”, dropdown y enlace al otro modo probados.
- IndexedDB/localStorage bloqueado no rompe el editor; el cambio de dibujo se cancela y puede reintentarse después de recuperar almacenamiento.
- Cierre y reapertura de una pestaña recupera la obra; recarga con pincel pulsado guarda el trazo en curso.
- Worker y fallback comprobados con canvas real; contornos protegidos y región vecina intacta.
- Ambos editores cargaron también el catálogo real de 62 recursos; sin errores JavaScript de ejecución.
- **Prueba del gate aprobada:** control verde y dos mutaciones rojas independientes, sin editar el árbol de trabajo.
- Revisión de diferencias sin errores de whitespace.

Las pruebas de navegador bloquean terceros y usan dibujos sintéticos pequeños para comparar píxeles de forma determinista; el smoke de catálogo usa imágenes reales. Los fallos/timeout de storage se inyectan para reproducirlos; no se afirma haber llenado el disco ni todas las cuotas de todos los navegadores.

## Repetir los checks

Desde la raíz del proyecto:

```powershell
node scripts/check-web.cjs
node scripts/verify-web-gate.cjs
```

Para incluir pruebas de navegador, instalar/proporcionar Playwright en el entorno de desarrollo; no es una dependencia del sitio:

```powershell
$env:PAINTME_PLAYWRIGHT_PATH = 'C:\Users\amilc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
node scripts/check-web.cjs --browser
```

El runner usa por defecto `C:\Program Files\Google\Chrome\Application\chrome.exe`. Puede cambiarse con `PAINTME_BROWSER_PATH`. Si Playwright es resoluble por Node, no hace falta `PAINTME_PLAYWRIGHT_PATH`. El servidor local y el navegador de tests se abren y cierran dentro del runner.

Los diagnósticos/resultados de octubre 3 se conservan como evidencia histórica. El comando mantenible para el producto actual es `scripts/check-web.cjs`; el script histórico no es el gate del nuevo worker con importScripts.

## Límites y siguiente trabajo

Faltan Chrome Android/Safari iOS físicos, cuotas reales/sesión privada específicas, rendimiento en hardware modesto y pruebas de exportación descargada/abierta. Permanecen en WEB-05/06, QA-02 y las demás tareas según sus criterios. Una terminación forzada del navegador o del sistema puede impedir todos los eventos de cierre: el respaldo de salida reduce pérdidas, no garantiza supervivencia frente a kill/crash.

El workflow se modificó localmente; no se ejecutó GitHub Actions ni se desplegó producción. CI-01 conserva trabajo adicional de checks en PR y rollback. No se ejecutaron ni modificaron Flutter o integraciones publicitarias.
