# PaintMe — Borrador de privacidad (PRIV-02)

Versión: 13/10/2026. Estado: **referencia de preparación**, basada en el código local. PRIV-02 se cerró posteriormente con alcance simplificado de documentación y enlaces. El texto vigente del producto está en `web/privacy.html` y `web/en/privacy.html`; este borrador conserva el análisis previo y no debe usarse como otra versión pública. No acredita el despliegue público, una app instalada ni validación legal completa.

## Texto propuesto

### Uso de PaintMe

PaintMe permite elegir dibujos, colorearlos y descargar una creación sin registro. Está pensado para niños desde los 4 años como orientación de uso, familias y docentes. Recomendamos acompañamiento adulto, especialmente para los más pequeños; no se exige pasar por la sección para familias para empezar a pintar.

La operación se realiza desde Perú. El alcance previsto es internacional, inicialmente en español e inglés; el contenido inglés disponible corresponde a un piloto.

### Dibujos y preferencias en la web

Los dibujos y copias de recuperación se guardan en IndexedDB o localStorage del navegador, separados por dibujo y herramienta. Las preferencias se recuerdan localmente cuando el navegador lo permite. Los módulos de guardado no envían los trazos ni el contenido del lienzo al operador.

Las copias permanecen hasta reemplazarlas o eliminarlas mediante las herramientas del sitio o del navegador. Una sesión privada puede eliminarlas al cerrar. No se sincronizan entre dispositivos ni entre balde y pincel. Una descarga PNG permite conservar una copia independiente.

### Alojamiento y solicitudes técnicas

Abrir el sitio requiere enviar solicitudes al proveedor de alojamiento, que puede procesar información técnica para servir los archivos y proteger el servicio. El proyecto configura publicación mediante GitHub Pages; esto no confirma qué infraestructura está atendiendo actualmente el dominio ni dónde se procesa cada solicitud.

GitHub informa que registra y almacena las IP de visitantes de sitios GitHub Pages para seguridad. Ese tratamiento pertenece al alojamiento y es distinto del guardado local de dibujos. Antes de aprobar el texto definitivo deben confirmarse proveedor efectivo, intermediarios, condiciones y conservación. No se afirma que los servidores estén en Estados Unidos por suposición.

### Analítica y publicidad

En la configuración web local revisada, la analítica y la publicidad externas están desactivadas. GA4 y Firebase Analytics están preparados como integraciones opcionales; el componente publicitario web no carga un proveedor en su estado actual.

Su futura activación requiere revisar el tratamiento de datos, proveedores, audiencia infantil y avisos correspondientes, además de actualizar esta información. Guardar una preferencia no activa por sí solo servicios deshabilitados. No es necesario aceptar esos servicios para pintar.

### Aplicación Flutter

La aplicación guarda obras, biblioteca y preferencias en archivos locales. El sistema operativo puede incluirlos en copias de seguridad conforme a su configuración. Firebase Analytics está preparado y desactivado en la configuración revisada.

El proyecto incluye un plugin publicitario; su presencia no demuestra que se estén mostrando anuncios. Publicidad está desactivada por defecto. La configuración efectiva de una versión distribuida, su tráfico y los backups deben verificarse en dispositivos antes de aprobar afirmaciones definitivas sobre la aplicación.

### Descargar, imprimir y compartir

Descargar PNG crea un archivo local. Imprimir lo entrega al navegador y al servicio de impresión elegido. Compartir desde la app entrega el archivo a la aplicación seleccionada. Esas acciones pueden sacar el dibujo de PaintMe o del dispositivo por decisión de quien las utiliza.

### Consultas por correo

El canal confirmado para consultas es **contancto.focuzlab@gmail.com**. Si una persona escribe, el destinatario recibe su dirección y el contenido del mensaje a través del proveedor de correo. No es necesario escribir ni proporcionar una dirección para pintar. Recomendamos que las consultas las realice un adulto y que no incluya datos del niño que no sean necesarios para explicar el problema.

### Cambios

Esta información deberá revisarse si cambian el alojamiento, los servicios activos, la forma de guardar o compartir obras o las finalidades del tratamiento. Los cambios en publicidad y analítica requieren revisar el aviso antes de activarlos.

## Verificaciones futuras fuera del cierre de PRIV-02

| Pendiente | Información o verificación requerida |
|---|---|
| Alojamiento efectivo | Confirmar proveedor e intermediarios del dominio publicado; datos técnicos, conservación y posibles transferencias. |
| Contacto | Definir uso, acceso, conservación y eliminación de mensajes recibidos. No inventar plazos. |
| Información del responsable | Evaluar qué identificación, dirección de contacto y mecanismos de derechos corresponden al tratamiento real. El usuario no autoriza publicar datos personales por defecto. |
| App distribuida | Verificar build efectivo, solicitudes nativas, SDKs y backups en dispositivo. |
| Aviso definitivo | Revisar información sobre destinatarios, finalidades, fundamentos y derechos que corresponda; aprobar el texto. |
| Concordancia pública | Comprobar enlaces, versión publicada y preferencias en el dominio real. |

Por decisión posterior del usuario, esta tabla no bloquea PRIV-02. Se conserva como referencia para revisar servicios externos, publicación móvil y asuntos legales cuando corresponda. No autoriza activar banners o analítica. No es necesario enumerar todos los países visitantes para cerrar UX-05; los requisitos aplicables se evalúan según la oferta y el tratamiento reales.

## Referencias verificables

- [Decisiones confirmadas de producto](DECISIONES-PRODUCTO.md).
- [Configuración local](../web/site-config.json), [privacidad](../web/privacy.js), [analítica](../web/analytics-init.js), [componente de publicidad](../web/ad-slot.js).
- [Workflow de publicación](../.github/workflows/deploy-pages.yml).
- [GitHub Pages y registro de IP](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
- [Referencia de estilo: política de Stereo92FM](https://sites.google.com/view/stereo92fm/politicadeprivacidad-html). No usar como política de PaintMe sin adaptación.
