# Pages: validación, publicación y rollback

Los cambios de esta sesión son locales. Este documento no ejecuta ni autoriza una publicación.

## Validación antes de publicar

El workflow `deploy-pages.yml` ejecuta `validate` en PR hacia main, push a main y ejecución manual. El job `deploy` necesita que `validate` termine correctamente y no corre en PR. El único directorio que se sube es `web/`; `docs/`, pruebas y SDKs locales quedan fuera del artefacto.

Repetir desde la raíz:

```powershell
node scripts/check-web.cjs
node scripts/verify-web-gate.cjs
python -m pip install -r scripts/requirements-catalog.txt
python scripts/build_catalog.py
python -m unittest discover -s tests -p test_catalog_pipeline.py
```

Para continuidad/exportación usar también la suite de navegador descrita en `web/README.md`. El workflow básico no ejecuta esa matriz física ni activa anuncios. Un check fallido detiene el workflow; los diagnósticos históricos no sustituyen assertions.

Después de una publicación autorizada, conservar URL del run, `GITHUB_SHA` del resumen de deploy, resultado del job validate y smoke público de home/editor/guardar/restaurar/exportación. No afirmar que se publicó la revisión local sin esa evidencia.

## Rollback por revisión

1. Localizar en Actions el último run publicado y verificado y su SHA. Anotar qué commits posteriores introdujeron el problema; si no hay evidencia de una versión buena, no inventar una revisión de retorno.
2. Trabajar en un checkout limpio o worktree separado. Conservar el trabajo local actual. Crear una rama de corrección y revertir los commits causantes con `git revert --no-commit`, sin reset ni force push. Si fue un merge, revisar explícitamente su parent antes de elegir `-m`.
3. Revisar el diff completo: web, generadores, catálogos y checks deben seguir siendo compatibles. Ejecutar los comandos de arriba y las pruebas de navegador afectadas. No copiar solamente HTML antiguo si sus helpers/assets pertenecen a otra revisión.
4. Preparar commit/PR y obtener la autorización de publicación que corresponda. El revert mantiene trazabilidad; el SHA nuevo, no el antiguo, será la revisión de rollback publicada.
5. Tras publicar, comparar el SHA del run, repetir smoke público y registrar el resultado. Si falla, conservar evidencia y corregir la rama; no encadenar publicaciones a ciegas.

Plantilla de registro: fecha, incidente, SHA anterior, SHA bueno de referencia, commits revertidos, SHA de rollback, URL del run, checks, smoke público y responsable. La ejecución remota y un rollback público quedan pendientes de una publicación autorizada.
