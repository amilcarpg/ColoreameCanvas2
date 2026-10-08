# Generación y validación web manuales en local

Decisión del usuario del 08/10/2026: ejecutar Python y las comprobaciones manualmente en el equipo local; GitHub Actions solo publica los archivos guardados en Git.

## Cambios

- Pages conserva push a `main` y ejecución manual; se elimina el evento PR y el job `validate` completo.
- Sin Python, Node, instalación de dependencias, regeneración de PNG o pruebas dentro del workflow Pages.
- Se publica exclusivamente `web/` y se registra la revisión en el resumen del run, sin afirmar que Actions la validó.
- Pipeline, README, runbook y backlog reflejan el flujo local manual. Los scripts de pruebas siguen disponibles.
- El workflow móvil manual es independiente y no participa en la publicación web.

## Comprobaciones locales ejecutadas

Entorno: Windows, Python 3.11, Pillow 11.2.1.

1. `python scripts/build_catalog.py --write`: 62 maestros, 227 salidas, 1 actualización de final de línea en `web/packs/dinosaurios.html`; sin diferencias de contenido en Git ni cambios de PNG.
2. `python scripts/build_catalog.py`: 0 archivos desactualizados.
3. `python -m unittest discover -s tests -p test_catalog_pipeline.py`: 8 pruebas aprobadas.
4. `node scripts/check-web.cjs`: 50 pruebas aprobadas, 63 rutas HTML y 61 URLs de sitemap verificadas.
5. `node scripts/verify-web-gate.cjs`: ambos defectos históricos producen el código de fallo esperado en las comprobaciones locales.

La comparación de bytes de PNG en el runner Linux ya no forma parte del despliegue. No se diagnosticó aquí la causa exacta de las diferencias del run anterior. El nuevo despliegue remoto se comprueba por su revisión y estado en Actions; estas pruebas locales no sustituyen QA física ni verificación pública de guardado/exportación.
