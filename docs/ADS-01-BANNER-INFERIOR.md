# ADS-01 — Preparación del banner inferior web

**Verificación posterior en AdSense, 14/10/2026:** ads.txt **Autorizado**; sitio **Preparando**, con revisión solicitada. El bloqueo de sesión anterior ya no aplica a esta consulta. Se conserva Pages; CSP con nonce y condiciones de audiencia/permisos pendientes. Sin activar anuncios ni modificar mensajes/cuenta. En AdMob, el usuario confirma un registro previo: falta localizarlo y comprobar app-ads.txt, sin crear duplicados. [Evidencia actual](qa-evidence/2026-10-14/release-services/adsense-console.json).

**Decisión y comprobación vigente 14/10/2026:** el usuario decide seguir con GitHub Pages. Los tres bloques siguen configurados y apagados; 12 pruebas seleccionadas por motor verifican familias, ubicaciones, estados simulados, revocación y permisos denegados. La CSP estricta con nonce por respuesta requiere una capa dinámica que no existe en la versión estática actual, por lo que queda pendiente junto con audiencia, aprobación de AdSense y proveedor real. [Ejecución, fuentes y límites](SERVICIOS-Y-PUBLICACION-2026-10-14.md).

Fecha: 14/10/2026. El usuario confirmó «sí parte inferior» para balde y pincel, tras la propuesta de preparar el espacio con publicidad desactivada.

Actualización de ruta del 14/10/2026: la página para familias usa ahora `familias.html`; controlador, configuración de analítica y pruebas se actualizan. El bloque `familiesBottom` continúa siendo `9685481928`. `adults.html` queda solo como redirección, sin anuncios ni analítica.

## Diseño implementado

- Un `aside#editorAdSlot` después de `main#actividad` en cada editor, antes del pie. No está dentro del lienzo, la paleta o los controles.
- Flujo normal (`position: static`), sin superposición, anclaje fijo ni animaciones.
- Separación superior de 150 px respecto del bloque de actividad cuando se muestra; es una decisión de diseño, no una certificación de política publicitaria.
- Ancho máximo exterior de 752 px, ajustado al viewport con márgenes laterales. Área de contenido con reserva mínima de 50 px en móvil y 90 px en escritorio; el tamaño definitivo deberá concordar con el bloque real seleccionado.
- Etiqueta «Publicidad» / «Advertisement», sin llamadas a hacer clic, enlaces o botones ficticios.
- Se respeta el estilo existente: superficie blanca, borde arena `#d6c4a7`, texto pizarra `#475569` y tipografía del editor. Texto auxiliar de 0,75 rem; la etiqueta y la ubicación distinguen el espacio sin depender del color.
- El atributo `hidden` colapsa también el margen y la reserva cuando está apagado. Las reglas de impresión conservan únicamente la obra.

## Preparación inicial

Se preparan contenedor y estilos. No se añade SDK, llamada a AdSense ni política CSP más abierta. El controlador publicitario existente conserva el bloqueo operativo de solicitudes en editores; conectar este nuevo espacio al proveedor requiere una implementación posterior autorizada.

Faltan el `data-ad-slot` del banner, la integración con estados/permisos y comprobaciones de audiencia/red. El usuario aportó captura de propiedad AdSense verificada y revisión solicitada; no acredita aprobación para servir anuncios.

Los anuncios automáticos y la optimización automática no se activan. Esta preparación no modifica los banners móviles Flutter.

## Verificación

- `node scripts/check-web.cjs`: 50 pruebas aprobadas, 63 rutas HTML/canonical y 61 URLs de sitemap.
- Catorce regresiones seleccionadas de navegador aprobadas: diez combinaciones de modo/viewport, dos recorridos ingleses, tráfico externo apagado y controlador adulto sin solicitudes en editores.
- Dos pruebas de diseño nuevas aprobadas en Chromium 155.0.8059.41 headless/Windows; cada una recorre 360×844, 844×390 y 1280×800. Se comprueba espacio oculto por defecto, ausencia de desplazamiento del lienzo al mostrar el contenedor desde la posición de pintar, separación mínima de 150 px, ausencia de overflow horizontal y ocultación en impresión.
- La vista previa de pruebas solo quita `hidden`; no muestra creatividades reales ni efectúa solicitudes publicitarias.
- `git diff --check`: aprobado. Sin publicación ni QA física.

## Integración local posterior — 14/10/2026

El usuario proporcionó el código y autorizó su integración local, además de consultar ubicaciones en preguntas frecuentes e inicio.

| Ubicación | Implementación local |
|---|---|
| Balde y pincel | Un banner horizontal adaptable bajo el bloque completo de actividad. |
| Preguntas para familias | Un banner horizontal al final de toda la información, separado de respuestas, contacto y enlaces. |
| Inicio | Por solicitud posterior del usuario, banner inferior bajo todo el contenido y antes del pie. |

El usuario proporcionó posteriormente un bloque distinto para la zona adulta. El mapa `ads.slots` conserva bloques separados, ambos del editor `ca-pub-9994592587162260`:

| Configuración | Ubicación | Bloque confirmado |
|---|---|---|
| `editorBottom` | Balde y pincel | `7446331398` — PaintMe — Banner inferior |
| `familiesBottom` | Preguntas / familias y docentes | `9685481928` — PaintMe — Banner adulto |
| `homeBottom` | Inicio, bajo todo el contenido | `7340274204` — PaintMe — Banner home |

Esta asignación permite distinguir esas ubicaciones en los informes de AdSense. Balde y pincel comparten todavía el bloque inferior. Los tres IDs fueron aportados por el usuario. No se inventan IDs adicionales ni se activan anuncios. La solicitud posterior del bloque de inicio sustituye la recomendación inicial de mantener esa página sin publicidad.

Actualización de inicio del 14/10/2026: `aside#homeAdSlot` usa los estilos compartidos, etiqueta «Publicidad» y ubicación en flujo normal, después del contenido/FAQ y antes del footer. No hay publicidad superior ni entre tarjetas de dibujos. Se conserva oculto por defecto, separado 150 px del contenido al mostrarlo y fuera de la impresión. El controlador reconoce `/` y `/index.html` con el slot `homeBottom`.

Verificación posterior a añadir inicio: 50 pruebas locales y 12 seleccionadas de navegador aprobadas, incluyendo los tres bloques reales configurados en cinco rutas, inicio a 360/768/1280 px sin desplazamiento de la acción principal ni overflow, ocultación al imprimir y ausencia de solicitudes con permisos denegados o configuración desactivada. Creatividades y cargas simuladas; ninguna solicitud a anuncios comerciales. `git diff --check` aprobado. Sin publicación ni activación.

Verificación de la separación: tres pruebas del adaptador aprobadas en Chromium, leyendo la configuración real de cada página y comprobando el slot esperado; casos lleno/vacío/error/timeout/revocación simulados. Comprobación Node de ambos IDs y `enabled=false`, más `git diff --check`, aprobadas. No se repite el resto de las regresiones porque este cambio solo modifica la asignación del bloque adulto.

`adsense-provider.js` transforma el fragmento en un adaptador sin scripts inline. Crea un `ins.adsbygoogle` horizontal, contenido dentro del ancho reservado; se evita la expansión a ancho completo fuera de su contenedor. `ad-slot.js` carga configuración, restringe el editor a su ubicación inferior aprobada, conserva la etiqueta, distingue lleno/vacío/error/timeout y limpia resultados obsoletos. No reubica un iframe ya servido al marcarlo listo, ni implementa refresh propio.

Los flags `enabled`, `siteApproved` y `treatmentReviewed` permanecen en false. La configuración válida no concede permiso: también se exige `PaintMePrivacy.allowed('ads')`, que el módulo actual no habilita. Hace falta integrar las señales de privacidad/audiencia que correspondan antes de la activación. La interfaz adulta no las sustituye.

### Condición CSP identificada

[AdSense documenta soporte para CSP estricta con nonce](https://support.google.com/adsense/answer/16283098?hl=en). El adaptador comprueba un nonce coincidente y `strict-dynamic` en la política antes de cargar el SDK. La CSP estática actual no cumple esa condición: se devuelve `csp_not_ready`, se colapsa el espacio y no se solicita Google. No se amplió a comodines, no se añadió `unsafe-eval` ni se inventó un nonce fijo. Resolver una CSP y alojamiento compatibles forma parte de la futura habilitación real; todavía no se verifican anuncios reales en producción.

En revocación se impiden solicitudes nuevas desde este controlador, se aborta la carga pendiente, se retira la creatividad y se solicita pausa al SDK. Esto no afirma borrar datos ya enviados ni descargar todo el código que un proveedor hubiera ejecutado; la red efectiva debe verificarse en PRIV-03.

### Verificación posterior

- 50 pruebas locales aprobadas con `node scripts/check-web.cjs`, 63 rutas HTML/canonical y 61 URLs de sitemap.
- 20 pruebas seleccionadas de navegador aprobadas en Chromium 155.0.8059.41 headless/Windows: disposición del espacio inferior, viewports, idioma inglés, terceros desactivados, controlador y adaptador.
- Adaptador probado en balde, pincel y página para familias con SDK simulado: lleno, vacío, error, timeout y revocación durante la carga; ID/slot correctos, etiqueta conservada y anchura disponible.
- Comprobados bloqueo por CSP y permiso denegado incluso con flags de configuración habilitados en un fixture. Sin solicitudes ni clics en anuncios reales.
- `git diff --check` aprobado. No se publican estos cambios.

ADS-01 sigue **Parcial**: adaptador y ubicaciones integrados localmente, habilitación real pendiente de aprobación AdSense, privacidad/audiencia y CSP compatible. El texto de preparación inicial de arriba se conserva como historial, no como el estado vigente de integración.
