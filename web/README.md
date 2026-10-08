# Colorea con balde de pintura y pincel (Canvas)

Proyecto web estático (sin backend) para pintar por regiones usando flood fill en HTML5 Canvas o pintar a mano con pincel sobre dibujos PNG.

## Continuación MAINT-01 / DATA-02 / SEO-03

Los cinco renderizadores de catálogo/paletas se comparten en `editor-ui.js`. Los motores mantienen el estado y guardado. El piloto gratuito está en `en/dinosaur-coloring.html`; `paint.html?lang=en` y `brush.html?lang=en` usan cuatro dinosaurios y la misma persistencia local por modo. No se añadió oferta de pago.

GA4 está preparado y **apagado** en `site-config.json`: faltan el ID público `G-…`, tratamientos/avisos y verificación real. La carga exige configuración válida, una de las tres rutas preparadas, CSP y una nueva elección explícita; rechazar/revocar mantiene el dibujo. Los editores no habilitan el SDK. No convertir la cola del SDK en una afirmación de recepción ni visitantes adultos cualificados. [Configuración, pruebas y límites](../docs/implementation-2026-10-07/maint-data-seo3.md).

## Cómo ejecutar
- Recomendado: servir con un servidor local para evitar bloqueos de CORS.
- Ejemplos:
  - `python3 -m http.server 8000`
  - `npx serve .`
- Abrir en el navegador: `http://localhost:8000`

## PNGs recomendados
- Líneas negras sobre fondo blanco, sin grises en las líneas.
- Contornos cerrados (evita fugas del balde).
- Resolución para pintar: máximo de 1200 px en el lado mayor; el lienzo no utiliza más detalle.
- Si hay bordes anti-aliased, ajusta la tolerancia en `paint.js` (por defecto 20).
- El modo pincel (`brush.html`) filtra y carga solo archivos `.png`.

## Regla obligatoria para el administrador al agregar un dibujo

Cada vez que el administrador agregue un dibujo, debe preparar y registrar estas tres variantes antes de publicarlo:

- `base_png/<archivo>.png`: maestro, conservado a la mayor resolución disponible.
- `assets/<archivo>.png` o `assets/<coleccion>/<archivo>.png`: versión para pintar, máximo 1200 px en el lado mayor.
- `assets/thumbs/<archivo>.png`: miniatura de selección, máximo 360 px en el lado mayor.

Registrar la entrada en `base_png/catalog.json`; no editar `assets-list.js` a mano. Desde la raíz, `python scripts/build_catalog.py --write` genera variantes y catálogos. `python scripts/build_catalog.py` comprueba sin escribir. La galería carga `thumbnailSrc`; el lienzo carga `src`. [Pipeline, dependencias y revisión](../docs/CATALOG-PIPELINE.md).

En la web, la galería se muestra bajo demanda al abrir **Elegir otro dibujo**. No se crean sus tarjetas ni se descargan sus miniaturas durante la carga inicial. También muestra hasta doce copias guardadas del modo actual, con sus propias imágenes y estados de lectura.

## Zona adulta y publicidad

Los editores muestran primero lienzo, colores y acciones esenciales. «Más opciones» contiene controles avanzados; «Más acciones», reiniciar y sorpresa. «Zona para adultos» contiene impresión, preferencias y enlaces. La ayuda de `adults.html` lee el contacto confirmado desde `site-config.json`; el contacto vacío permanece explícitamente pendiente.

El editor no contiene slots publicitarios ni carga AdSense. La web de esta revisión mantiene también GA y fuentes externas apagados: `privacy.js` centraliza preferencias v2 y no hereda permisos de v1; `product-events.js` admite solo datos del esquema. No existe un collector de red habilitado. PRIV-02/03 y ADS-01 siguen pendientes de sus cierres externos; la separación adulta no constituye consentimiento parental.

## Estructura
- `index.html`
- `paint.html`
- `brush.html`
- `paint.css`
- `paint.js`
- `brush.css`
- `brush.js`
- `assets-list.js`
- `assets/<coleccion>/*.png`
- `assets/thumbs/*.png`


## Comprobaciones de fiabilidad web

Desde la raíz del repositorio: `node scripts/check-web.cjs`. El comando verifica sintaxis, helpers, relleno, catálogo y almacenamiento; devuelve código distinto de cero ante una regresión y se ejecuta antes de Pages.

`node scripts/verify-web-gate.cjs` comprueba que los defectos originales de helpers y cola sean detectados. `node scripts/check-web.cjs --browser` añade pruebas de Chrome con Playwright disponible en desarrollo; configurar `PAINTME_PLAYWRIGHT_PATH` y, si hace falta, `PAINTME_BROWSER_PATH`.

Instrucciones, resultados y límites: [verificación de las cinco primeras tareas](../docs/implementation-2026-10-07/web-first-five.md) y [tareas 6–10: guardado, PNG, carreras, reinicio y QA](../docs/implementation-2026-10-07/web-six-ten.md).

La suite de navegador también admite WebKit con `PAINTME_BROWSER_ENGINE=webkit` y el navegador de Playwright instalado. El servidor de pruebas conserva la CSP y usa HTTPS temporal; requiere OpenSSL (en Windows usa el incluido en Git, o `PAINTME_OPENSSL_PATH`). Estos recorridos no sustituyen QA física Chrome Android/Safari iOS.

Los editores distinguen el guardado automático local de **Descargar PNG**. Se puede reintentar un fallo, abrir una alternativa PNG y cancelar un reinicio. Deshacer recupera el reinicio y Rehacer lo reaplica; nueva edición invalida la rama futura. El historial comparte límites de pasos/bytes y no sobrevive a cambiar dibujo o recargar.

[Ítems 11–20 salvo CAT-02: implementación y evidencia](../docs/implementation-2026-10-07/web-eleven-twenty.md) y [pruebas que faltan](../docs/PRUEBAS-PENDIENTES.md). La revisión automatizada de todos los PNG no sustituye contornos revisados a mano, descarga física o pruebas con personas.

## SEO, privacidad y componente publicitario inactivo

`node scripts/check-site.cjs` verifica rutas/canonical, enlaces locales, robots/sitemap y sintaxis de ads.txt. Se ejecuta también en el gate web. `--write` regenera sitemap desde canonical de páginas existentes sin noindex; no aplica aprobación de derechos o de cuentas. La política pendiente queda fuera del sitemap.

Las seis páginas de categorías/guías de animales, dinosaurios y vehículos incluyen contenido adulto útil. `ad-slot.js` prepara un componente inactivo en `adults.html`, con mocks para estados y revocación; no incorpora SDK ni configura anuncios comerciales. app-ads.txt requiere vendedor y ficha confirmados.

[Ejecución 21–31, evidencia y límites](../docs/implementation-2026-10-07/items-21-31.md). Para QA de red, el caso específico de la suite no bloquea outbound desde el runner; registra HAR de tráfico artificial local. Las otras pruebas de editor conservan su bloqueo anterior. Configurar `PAINTME_EVIDENCE_DIR` para guardar capturas/HAR fuera de web.


## Continuidad, rendimiento y despliegue

Cambiar entre Balde y Pincel guarda antes de navegar, conserva asset/categoría y explica que cada herramienta mantiene su propia obra. Cancelar mantiene el editor; al volver se puede restaurar la copia de esa herramienta. No se mezclan formatos de capas incompatibles.

La suite incluye veinte ediciones/guardados sobre un fixture de 1200×1200 y comprueba el presupuesto compartido de historial: balde 10 pasos/32 MiB, pincel 20 pasos/48 MiB. Los límites incluyen pasado y futuro; no limitan la RAM total. Los tiempos registrados son de Windows headless con automatización y persistencia, no latencia táctil o perfil de Android modesto.

Pages valida Node, regresiones históricas y pipeline en PR y antes de deploy. Publica únicamente `web/` y registra la revisión. [Runbook y rollback](../docs/DEPLOYMENT-RUNBOOK.md). La ejecución remota necesita una publicación autorizada; esta sesión no hace push ni despliega.

[Mejoras de código restantes: resultados](../docs/implementation-2026-10-07/remaining-code.md).
