# PaintMe — Decisiones de producto

Fecha: 13/10/2026. Fuente: decisiones confirmadas por el usuario durante el cierre de UX-05.

Este documento sirve como referencia para futuros cambios. Registra decisiones de producto; no autoriza publicar, activar servicios externos ni presentar una revisión legal como completada. El estado de cada tarea se conserva en [PRODUCT-BACKLOG.md](PRODUCT-BACKLOG.md).

## Audiencia y propuesta

| Aspecto | Decisión confirmada |
|---|---|
| Audiencia principal | Niños que colorean durante momentos de ocio. |
| Audiencia complementaria | Padres, cuidadores y docentes que acompañan o enseñan a pintar. |
| Edad orientativa | Desde los 4 años; no es una verificación de edad ni una restricción de acceso. |
| Acompañamiento | Recomendado, especialmente para los más pequeños; sin participación adulta continua obligatoria. |
| Experiencia principal | Elegir, colorear y descargar un dibujo sin registro. |
| Alcance | Internacional, inicialmente en español e inglés. Esto no significa que todo el catálogo esté traducido: el inglés actual es un piloto. |
| Operación | El usuario confirmó que opera desde Perú. No se ha confirmado la ubicación física de servidores. |

## Información y controles para adultos

Nombre y ruta confirmados el 14/10/2026: la página «Para familias y docentes» usa `familias.html` para evitar la ambigüedad de `adults.html`. La ruta anterior se conserva solo como redirección compatible; los enlaces vigentes y configuración deben apuntar a la nueva ruta. Auxiliares: `familias.css` y `familias.js`.

- La sección se llama **Para familias y docentes** y contiene preguntas frecuentes, ayuda, impresión, contacto y privacidad.
- Pintar no exige pasar por esa sección, crear una cuenta ni aceptar analítica o publicidad.
- Impresión, preferencias y enlaces externos se identifican como acciones para adultos.
- La sección no verifica edad ni consentimiento parental; no se añade un gate obligatorio para acceder al editor.
- Las obras permanecen separadas por dispositivo y herramienta; no prometer sincronización entre balde y pincel.

## Servicios y monetización

| Servicio | Objetivo futuro | Estado autorizado actual |
|---|---|---|
| Publicidad | Banners discretos en páginas informativas y, por cambio confirmado el 14/10/2026, un espacio inferior en cada editor web. | Preparada y desactivada; completar ADS/PRIV antes de activar. |
| Analítica | Conocer procedencia del tráfico y utilidad de los recorridos con datos mínimos. | GA4/Firebase preparados y desactivados; completar DATA/PRIV antes de activar. |
| Compras y versiones vendibles | Referencia futura del backlog. | COM-01/02/03 pospuestos; requieren nueva indicación expresa. |

## Contacto y privacidad del operador

- Contacto confirmado: **contancto.focuzlab@gmail.com**, conservando exactamente la dirección proporcionada.
- El usuario prefiere no publicar datos personales por seguridad. No incorporar nombre, DNI, teléfono o domicilio particular sin autorización explícita.
- Esa preferencia no constituye una conclusión sobre obligaciones legales. La identificación que corresponda se evalúa dentro de PRIV-02, separada del cierre técnico de UX-05.
- No afirmar que no existe ningún tratamiento de datos: distinguir dibujos locales, solicitudes técnicas al alojamiento y mensajes que el adulto envíe por correo.
- La política de Stereo92FM es una referencia de estilo, no una política aplicable sin adaptación a PaintMe.

## Reglas para futuros trabajos

Actualización del 14/10/2026: el usuario confirma banner inferior en balde y pincel. El espacio se sitúa fuera del bloque de actividad, sin superposición ni posición fija y con etiqueta «Publicidad». Se conserva oculto cuando está desactivado. Esta decisión sustituye la exclusión anterior de anuncios del editor web como diseño futuro; no autoriza cargar anuncios reales, activar Auto Ads ni cambiar publicidad nativa Flutter. [Diseño y verificaciones](ADS-01-BANNER-INFERIOR.md).

Continuación del 14/10/2026: autorizado integrar localmente el bloque real `7446331398`, conservando anuncios apagados. Se prepara también un banner al final de preguntas/información para familias. Para el inicio se recomienda esperar y no se añaden anuncios. Activación real pendiente de aprobación de sitio, tratamiento/permiso y CSP compatible; el bloque aportado no resuelve por sí solo esas condiciones.

Separación de bloques confirmada el 14/10/2026: `7446331398` queda para balde/pincel; `9685481928` («PaintMe — Banner adulto») se asigna a preguntas/familias. Ambos usan `ca-pub-9994592587162260`. El inicio sigue sin bloque y la publicidad permanece desactivada.

Cambio posterior del 14/10/2026: el usuario aporta «PaintMe — Banner home», slot `7340274204`, y solicita incluirlo en la parte inferior del inicio. Se añade bajo todo el contenido y las preguntas frecuentes, antes del pie, sin superposición ni inserción entre tarjetas. Esta decisión sustituye la recomendación anterior de no incluir publicidad en el inicio. Los otros dos bloques se conservan y la publicidad permanece desactivada.

1. Mantener el acceso directo a pintar y las funciones gratuitas confirmadas.
2. No activar publicidad, analítica, cuentas o subida de obras por considerar cerrado UX-05.
3. Revisar PRIV-02/03, DATA-02 y ADS-01/02 al cambiar proveedores, datos, finalidad o configuración activa.
4. Documentar cambios de alcance con fecha y autorización; conservar evidencia histórica.
5. Verificar los textos y recorridos en los idiomas realmente implementados; no prometer soporte global completo.

## Cierre de UX-05

El usuario autorizó el cierre el 13/10/2026. El alcance de interfaz está implementado y verificado: 50 pruebas locales, veinte pruebas seleccionadas en Chromium headless/Windows, navegación, impresión, rechazo/revocación, terceros apagados y viewports de escritorio/móvil. Sin publicación ni prueba física adicional.

PRIV-02 se cerró en su alcance local de documentación y enlaces el 13/10/2026, por simplificación autorizada posteriormente. La política del producto se mantiene en `web/privacy.html`, con versión inglesa; Google Sites es una copia externa. Las verificaciones de publicación móvil, servicios externos y revisión legal quedan separadas de ese cierre. No se declara cumplimiento legal completo ni se activa publicidad/analítica.

## Referencias

- [Backlog técnico](PRODUCT-BACKLOG.md).
- [Borrador de privacidad y pendientes de PRIV-02](PRIVACIDAD-BORRADOR.md).
- [Página para familias y docentes](../web/familias.html).
- [Página local de privacidad](../web/privacy.html).
