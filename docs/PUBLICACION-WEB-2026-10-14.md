# Publicación web verificada — 14/10/2026

**CI-01 cerrado el 14/10/2026 por instrucción del usuario.** Criterios vigentes cumplidos: validación manual local, publicación identificable, verificación pública y procedimiento de retorno disponible y ensayado localmente. No se ejecutó una reversión pública ni se requiere para este cierre.

Publicación autorizada por el usuario, conservando GitHub Pages y los servicios opcionales apagados.

- Sitio: [paintme.club](https://www.paintme.club/).
- Commit publicado: [fbe3610](https://github.com/amilcarpg/ColoreameCanvas2/commit/fbe3610fe324bb536f5719602a5bc721ecfc6d27).
- [Run de Pages 38629204487](https://github.com/amilcarpg/ColoreameCanvas2/actions/runs/38629204487): completado con éxito; SHA comprobado contra el commit autorizado.
- Huella del contenido: `9efa38717a153f16c6e2ee308d35043fde46642ff39a4a90c13fc31606c4326c`. **247/247 archivos públicos idénticos** al manifiesto preparado, incluidos PNG originales/versionados y todos los archivos críticos.
- `/familias.html`: HTTP 200, título correcto. `/adults.html` redirige a familias y conserva parámetros/ancla. Home y ambos editores cargan correctamente.
- Smoke público con dibujo artificial Triceratops: pintar, guardar, recargar, recuperar exactamente y descargar en balde/pincel aprobados. Ambos PNG independientes: 1200×1200 y válidos en Pillow. Sin errores de página, solicitudes a terceros ni cookies en esa sesión aislada.
- GA4 configurado con el ID recibido; analítica y publicidad continúan apagadas. Los tres espacios publicitarios siguen sin proveedor real activo. `ads.txt` y `app-ads.txt` forman parte de la comparación exacta.

## Rollback comprobado y límites

Se ensayó el parche inverso de la publicación en un índice Git temporal: devuelve exactamente el árbol padre `aab6438440c55aeea149db168e978772ef618bb8`. El árbol del commit remoto es idéntico al ensayado. No se modificaron el checkout ni el sitio durante esa prueba.

**No se ejecutó un rollback público.** La revisión anterior no incluía familias; volver a ella eliminaría esa ruta. La revisión `fbe3610fe324bb536f5719602a5bc721ecfc6d27` queda como referencia publicada con smoke aprobado para un retorno futuro, cuya ejecución deberá comprobar el incidente, el alcance y el nuevo run conforme al [runbook](DEPLOYMENT-RUNBOOK.md).

## Evidencia

[Registro de publicación](qa-evidence/2026-10-14/release-services/publication.json) · [Comparación pública de 247 archivos](qa-evidence/2026-10-14/release-services/public-after-release.json) · [Smoke de producción](qa-evidence/2026-10-14/release-services/production-smoke.json) · [Ensayo local de rollback](qa-evidence/2026-10-14/release-services/rollback-rehearsal.json).

Se publicó únicamente el árbol `web/` revisado. La API de GitHub permitió crear un árbol/commit exactos tras el rechazo 403 del transporte Git. Se conservan los demás cambios de trabajo y el índice local; Firebase local ignorado, fuentes Flutter, documentos y herramientas de QA no se subieron en este commit. Los informes de preparación que dicen «sin publicar» o «familias 404» describen la base anterior y quedan sustituidos por este registro.

Siguen pendientes: reconocimiento de vendedores y dominio de ficha en AdSense/AdMob, CSP compatible con AdSense manteniendo el alojamiento elegido, audiencia/permisos y aprobación, recepción/revocación reales de GA4/Firebase y QA móvil/física CAT-04. Esta publicación no cierra esos ítems ni activa servicios.
