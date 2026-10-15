# PaintMe Android — alta en AdMob

14/10/2026. El usuario confirmó que no estaba registrada y autorizó configurarla en la cuenta AdMob abierta. Se creó **PaintMe, Android**, y un único bloque **PaintMe Android - Banner inferior**. La confirmación de alta, la configuración y la lista final se comprobaron en la consola.

| Identificador | Valor |
|---|---|
| Aplicación AdMob | `ca-app-pub-9994592587162260~5200451162` |
| Banner inferior | `ca-app-pub-9994592587162260/2933380472` |
| Paquete previsto | `com.focuzlab.paintme` — todavía sin vincular/verificar en AdMob |
| Estado de la app | **Debe revisarse** |

La búsqueda del paquete y de su URL exacta de Google Play no devolvió resultados. Por ello se creó **sin tienda vinculada**, sin atribuir a otra app una ficha incorrecta. La [guía oficial de AdMob](https://support.google.com/admob/answer/9989980?hl=es) permite preparar apps sin publicar y exige una ficha pública admitida para vincularlas y revisar su preparación. No se modificó ni publicó la ficha de Google Play.

El banner tiene texto/imagen/rich media, vídeo desmarcado, actualización automática inhabilitada y puja de partner desmarcada; eCPM optimizado por Google para todos los precios. Se verificó como el único bloque en la lista. No se crearon campañas ni grupos de mediación ni se enviaron instrucciones por correo.

Los IDs se guardaron en `flutter/admob-config.local.json`, ignorado por Git, con `PAINTME_ADS=disabled` y `PAINTME_ADS_APPROVED=false`. No se activó el SDK ni se compiló/publicó una nueva app. Android sigue obteniendo el App ID nativo productivo de propiedad Gradle/entorno `ADMOB_APP_ID`; guardar el JSON local no modifica ese manifiesto ni concede aprobación. Una futura integración autorizada deberá comprobar los valores efectivos del artefacto.

## Pendientes

1. Hacer accesible la ficha correcta de Google Play y vincularla al registro existente, sin crear otra app AdMob.
2. Confirmar que la web del desarrollador de esa ficha sea `https://www.paintme.club/` y verificar `app-ads.txt`. El archivo público ya existe; su publicación no sustituye esta asociación.
3. Completar la revisión de preparación, audiencia/permisos aplicables e integración física con unidades de prueba antes de habilitar producción.

La aprobación de la cuenta AdMob no es la aprobación de PaintMe. El estado del archivo web `ads.txt` autorizado en AdSense tampoco verifica `app-ads.txt` de esta app.

[Evidencia estructurada](qa-evidence/2026-10-14/release-services/admob-created.json).

![Confirmación del bloque y ambos identificadores](qa-evidence/2026-10-14/release-services/admob-created.png)
