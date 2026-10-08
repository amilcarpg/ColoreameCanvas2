# Pages: validación local manual, publicación y rollback

Desde el 08/10/2026, por decisión del usuario, la generación y las pruebas se ejecutan manualmente en el equipo local. Actions solo publica lo subido a Git.

## Validación antes de publicar

El workflow `deploy-pages.yml` ejecuta únicamente `deploy` con push a main o ejecución manual. No corre en PR, no instala Python/Node ni genera imágenes o ejecuta pruebas. El único directorio que se sube es `web/`; `docs/`, pruebas y SDKs locales quedan fuera del artefacto.

Repetir desde la raíz:

```powershell
python -m pip install -r scripts/requirements-catalog.txt
python scripts/build_catalog.py --write
python scripts/build_catalog.py
python -m unittest discover -s tests -p test_catalog_pipeline.py
node scripts/check-web.cjs
node scripts/verify-web-gate.cjs
```

Ejecutar cada comando manualmente y revisar su resultado; ante un fallo, corregir antes de publicar. Para continuidad/exportación usar también la suite de navegador descrita en `web/README.md`. Los diagnósticos históricos no sustituyen las pruebas actuales.

Revisar `git diff` y `git status`, incluir fuentes y resultados generados en el commit y hacer push a `main`. Pages publica exactamente el contenido de `web/` de esa revisión; no exige evidencia de validación local ni bloquea la publicación por tests. Los PNG solo se regeneran cuando ejecutas el comando local con `--write`.

Después de una publicación, conservar URL del run, `GITHUB_SHA` del resumen de deploy, resultados de pruebas locales y smoke público de home/editor/guardar/restaurar/exportación. No afirmar que se publicó la revisión local sin esa evidencia.

## Rollback por revisión

1. Localizar en Actions el último run publicado y verificado y su SHA. Anotar qué commits posteriores introdujeron el problema; si no hay evidencia de una versión buena, no inventar una revisión de retorno.
2. Trabajar en un checkout limpio o worktree separado. Conservar el trabajo local actual. Crear una rama de corrección y revertir los commits causantes con `git revert --no-commit`, sin reset ni force push. Si fue un merge, revisar explícitamente su parent antes de elegir `-m`.
3. Revisar el diff completo: web, generadores, catálogos y checks deben seguir siendo compatibles. Ejecutar los comandos de arriba y las pruebas de navegador afectadas. No copiar solamente HTML antiguo si sus helpers/assets pertenecen a otra revisión.
4. Preparar commit/PR y obtener la autorización de publicación que corresponda. El revert mantiene trazabilidad; el SHA nuevo, no el antiguo, será la revisión de rollback publicada.
5. Tras publicar, comparar el SHA del run, repetir smoke público y registrar el resultado. Si falla, conservar evidencia y corregir la rama; no encadenar publicaciones a ciegas.

Plantilla de registro: fecha, incidente, SHA anterior, SHA bueno de referencia, commits revertidos, SHA de rollback, URL del run, checks, smoke público y responsable. La ejecución remota y un rollback público quedan pendientes de una publicación autorizada.
