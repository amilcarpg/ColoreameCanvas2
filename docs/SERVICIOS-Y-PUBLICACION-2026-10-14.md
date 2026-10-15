# CI-01, DATA-02 y ADS-01/02 — ejecución local

**Cierre posterior de CI-01, 14/10/2026:** marcado Hecho tras verificar publicación, familias y 247 archivos, con rollback documentado y ensayado localmente. Los pendientes de publicación citados en la preparación inferior son históricos. [Cierre y evidencia](PUBLICACION-WEB-2026-10-14.md). ADS-01, ADS-02 y DATA-02 conservan sus pendientes específicos.

**Alta posterior en AdMob, 14/10/2026:** el usuario aclaró que PaintMe no estaba registrada y autorizó configurarla. Aplicación Android y banner inferior ya creados; estado Debe revisarse y tienda sin vincular. IDs locales con publicidad apagada. Las referencias anteriores a registro no localizado describen la fase previa. [Alta, evidencia y pendientes actuales](ADMOB-CONFIGURACION-2026-10-14.md).

**Verificación posterior en AdSense, 14/10/2026:** ads.txt **Autorizado**; sitio **Preparando**, con revisión solicitada. El bloqueo de sesión anterior ya no aplica a esta consulta. Se conserva Pages; CSP con nonce y condiciones de audiencia/permisos pendientes. Sin activar anuncios ni modificar mensajes/cuenta. En AdMob, el usuario confirma un registro previo: falta localizarlo y comprobar app-ads.txt, sin crear duplicados. [Evidencia actual](qa-evidence/2026-10-14/release-services/adsense-console.json).

**Actualización posterior del 14/10/2026:** publicación autorizada completada y verificada; familias responde 200, 247 archivos exactos y smoke público aprobado. Servicios apagados. [Resultado vigente](PUBLICACION-WEB-2026-10-14.md). Las referencias a cambios sin publicar en el texto siguiente describen la preparación anterior.

Fecha: 14/10/2026. El usuario autorizó implementar en local con servicios apagados y decidió **seguir con GitHub Pages**. La publicación y las pruebas con proveedores reales requieren autorización posterior. No se cambió dominio, alojamiento ni configuración de cuentas.

## CI-01 — versión web preparada

La versión local contiene `/familias.html`, su redirección desde `/adults.html`, el contacto/configuración actuales, los tres espacios publicitarios apagados y las correcciones CAT-04. Se añadieron `scripts/web-release.cjs` y tres pruebas: genera la huella de todos los archivos, exige servicios apagados y verifica una versión publicada contra los hashes esperados. Detecta una página antigua aunque responda HTTP 200, manifiestos modificados, URLs inseguras, archivos ausentes y redirecciones inesperadas.

Resultados: **55 pruebas Node**, 64 rutas HTML/canonical y 61 URLs de sitemap; gate de detección de los defectos originales aprobado. **12 pruebas seleccionadas por motor** (Chromium/WebKit): familias/redirección con y sin JS, tres ubicaciones publicitarias, estados simulados y permisos denegados. La comprobación de red de la versión apagada no intercepta/bloquea solicitudes de terceros desde el runner: no observó solicitudes externas ni cookies en los cuatro estados comprobados y siete tipos de página.

Los **247 archivos** del manifiesto coinciden por SHA-256 tras servirlos y descargarlos por HTTP local. Esto acredita el contenido preparado; no constituye publicación ni prueba del proveedor real. [Manifiesto](qa-evidence/2026-10-14/release-services/release-manifest.json) · [Comparación HTTP local](qa-evidence/2026-10-14/release-services/local-release-verification.json).

Se actualizó el [runbook](DEPLOYMENT-RUNBOOK.md) para comparar la revisión publicada, comprobar `/familias.html` y registrar rollback. No se ejecutó un rollback remoto ni se declaró buena toda una revisión a partir de comprobar vendedores. El rollback requerirá elegir una revisión con smoke aprobado, preparar su revert y verificar el nuevo despliegue autorizado.

## DATA-02 — valores incorporados y apagados

- GA4 `G-XJBQD3ZZ8Q` incorporado en `web/site-config.json`. `enabled=false` y `treatmentReviewed=false`; se probó que el ID real no habilita permisos, SDK ni cola de eventos por sí solo.
- Firebase Android importado desde el JSON recibido al archivo **local e ignorado por Git** `flutter/firebase-config.local.json`. Proyecto `paintme1`, paquete `com.focuzlab.paintme`; ambos flags false. La clave se mantiene en ese archivo y no se copia a este informe, al backlog ni a la web.
- `scripts/configure_firebase.py` valida cliente único, campos, app/sender y genera únicamente configuración apagada. Tres pruebas Python aprobadas. El ejemplo vacío sigue siendo una plantilla, no la configuración real.
- **Seis pruebas Flutter** aprobadas ejecutando con los defines reales apagados: ninguna activación del SDK real; rechazo, esquema, revocación durante inicialización, fallos/reintento y límites con gateway simulado.

Los controles existentes mantienen analítica básica opcional, señales publicitarias denegadas y descarte de eventos sin permiso. La prueba simulada de revocación no acredita recepción ni supresión de tráfico en un SDK físico. Quedan confirmar flujo/proyecto en consola, tratamiento/avisos aplicables y entorno autorizado para GA4/Firebase reales, DebugView y captura de red antes/rechazo/aceptación/revocación. No se activó ningún servicio ni se creó un build habilitado.

## ADS-02 — base pública y acceso a consolas

Consulta pública del 14/10/2026:

| Comprobación | Resultado |
|---|---|
| `https://www.paintme.club/ads.txt` | HTTP 200, vendedor exacto `pub-9994592587162260`. |
| `https://www.paintme.club/app-ads.txt` | HTTP 200, mismo registro exacto. |
| Ambos archivos desde dominio sin WWW | Redirigen a WWW; respuesta final 200 y registro exacto. |
| `/familias.html` en producción | HTTP 404: la ruta nueva aún no está publicada. |
| Configuración GA4 pública | ID vacío y servicios apagados; versión anterior. |
| Ficha pública de `com.focuzlab.paintme` | HTTP 404 sin acceso a la prueba cerrada; no permite verificar dominio de ficha ni concluir que la app no exista. |

Último run Pages consultado: [38609845993](https://github.com/amilcarpg/ColoreameCanvas2/actions/runs/38609845993), SHA `d685174e2b6888005694143032ea923ef7b905c5`, completado con éxito. La publicación anterior de vendedores corresponde a `80687be24375673860dd4acbe4ec6eeaa5164be8`. [Respuestas públicas](qa-evidence/2026-10-14/release-services/public-before-release.json) · [Runs consultados](qa-evidence/2026-10-14/release-services/pages-runs-before-release.json).

Se intentó consultar AdSense y AdMob en el navegador disponible; ambos requieren iniciar sesión. No se pudo observar reconocimiento, aprobación, asociación de app ni dominio efectivo de ficha. Los archivos no se recrearon ni se pidió un nuevo APK. El dominio que usa el rastreador debe contrastarse con la web del desarrollador de la ficha, como indica la [documentación oficial de AdMob](https://support.google.com/admob/answer/9363762?hl=en-uk). HTTP 200 no equivale a reconocimiento de consola.

## ADS-01 — tres bloques preparados; CSP y audiencia pendientes

Se conservan `7446331398` (ambos editores), `9685481928` (familias) y `7340274204` (inicio). Flags apagados, permisos publicitarios denegados y adaptador bloqueado ante `csp_not_ready`; las pruebas con SDK simulado cubren lleno/vacío/error/revocación y las guardas ante configuración habilitada sin permiso. No se cargaron banners reales ni se activó Auto Ads.

La [guía oficial de AdSense para CSP](https://support.google.com/adsense/answer/16283098?hl=en) admite la política estricta con nonce aplicado por respuesta a los scripts. La versión actual es estática en GitHub Pages y carece de esa capa dinámica. El usuario decidió conservar Pages tras comparar alternativas; **la CSP para AdSense queda pendiente y no se sustituyó por un nonce fijo ni se amplió la lista de dominios para simular compatibilidad**.

La audiencia declarada es familiar 4+; ni un enlace a familias ni un checkbox prueban audiencia adulta o condiciones del proveedor. Se mantienen pendientes la configuración de audiencia/permisos aplicable y la aprobación del sitio en AdSense. Después podrán autorizarse pruebas reales de los tres banners, red, estados y revocación. Publicar con servicios apagados puede avanzar por separado.

## Estado final de esta ejecución

CI-01: preparación/checks locales completados, publicación/smoke/rollback remotos pendientes. DATA-02: datos incorporados apagados y controles locales probados; recepción real pendiente. ADS-02: endpoints públicos correctos; reconocimiento y dominio de ficha pendientes de acceso a cuentas. ADS-01: integración apagada probada; CSP, audiencia, aprobación y proveedor real pendientes. CAT-02 continúa excluida y COM-01/02/03 pospuestos.
