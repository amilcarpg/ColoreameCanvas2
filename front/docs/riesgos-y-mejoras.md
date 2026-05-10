# Riesgos y mejoras prioritarias

Este documento resume los principales contras, riesgos y mejoras prioritarias de la web de colorear con balde de pintura. Cada punto incluye una forma concreta de validar que quedo resuelto.

## Estado de atencion

Actualizado tras implementar y validar la primera ronda de mejoras.

| Hallazgo | Estado | Evidencia |
| --- | --- | --- |
| 1. El balde puede pintar las lineas negras | Atendido | `app.js` bloquea pixels oscuros/grises del dibujo original antes y durante el relleno, y muestra `Toca una zona blanca para pintar`. |
| 2. El relleno puede fugarse por bordes abiertos o suavizados | Atendido en logica; requiere QA manual por dibujo | `app.js` usa el dibujo original como mapa de barreras oscuras/grises. Aun se debe probar cada PNG porque un contorno fisicamente abierto puede requerir corregir el asset. |
| 3. Deshacer guarda estados aunque no haya cambios reales | Atendido | El undo ya no se guarda antes del relleno; solo se agrega historial cuando `changedCount > 0`. |
| 4. El historial de deshacer puede consumir mucha memoria | Atendido | El historial guarda solo la region modificada y reduce el limite efectivo en pantallas pequenas. |
| 5. Algunas imagenes son demasiado grandes o no estan optimizadas | Atendido en dimension y documentacion; requiere QA visual por asset | Los PNG grandes fueron redimensionados a maximo 1200 px por lado y `assets/README.md` documenta la preparacion esperada. |
| 6. El selector de dibujos no es ideal para ninos | Atendido | La UI ahora construye una galeria de miniaturas desde `assets-list.js`, sincronizada con el `<select>`. |
| 7. La paleta usa codigos hexadecimales en el estado | Atendido | La paleta usa nombres amigables y `aria-label` por color; el estado muestra `Color activo: rojo/morado/...`. |
| 8. La UI puede mejorar en accesibilidad y controles tactiles | Atendido | Botones y swatches tienen minimo tactil de 48 px y foco visible con `:focus-visible`. |
| 9. Ads y analitica requieren cuidado por tratarse de una web para ninos | Atendido en configuracion/documentacion; requiere revision legal antes de produccion | Analytics y AdSense ya no se cargan desde el HTML inicial; `app.js` los carga solo tras aceptar consentimiento, con anuncios no personalizados. |

Validacion realizada:
- `node --check app.js` sin errores.
- `file assets/*.png` confirma que ningun PNG excede 1200 px por lado.
- Prueba en navegador local: carga sin errores de consola, 24 miniaturas visibles, selector y galeria sincronizados, paleta con nombres, relleno habilita `Deshacer`, `Deshacer` vuelve al estado anterior, y rechazar consentimiento oculta el banner.

## Contras y riesgos

### 1. El balde puede pintar las lineas negras

**Estado:** atendido.

**Riesgo:** si el usuario toca directamente una linea del dibujo, el algoritmo puede intentar rellenar esa linea. En una app para ninos esto es frecuente, porque los toques no siempre son precisos.

**Mejora esperada:** bloquear el relleno cuando el pixel inicial sea oscuro o pertenezca al contorno.

**Como validar que esta resuelto:**
- Abrir varios dibujos.
- Tocar lineas negras o bordes del dibujo.
- Confirmar que la linea no cambia de color.
- Confirmar que aparece un mensaje simple, por ejemplo: "Toca una zona blanca para pintar".

### 2. El relleno puede fugarse por bordes abiertos o suavizados

**Estado:** atendido en la logica de barreras; requiere QA manual por dibujo para detectar PNG con contornos fisicamente abiertos.

**Riesgo:** algunas imagenes tienen bordes antialias, grises o zonas no cerradas. El flood fill por tolerancia puede cruzar esos huecos y pintar areas que no corresponden.

**Mejora esperada:** usar imagenes con contornos cerrados y/o mejorar la deteccion de barreras para que los bordes negros y grises actuen como limite.

**Como validar que esta resuelto:**
- Probar cada dibujo de `assets-list.js`.
- Pintar zonas pequenas cerca de bordes, esquinas y detalles finos.
- Confirmar que el color no invade regiones vecinas.
- Registrar cualquier imagen que falle y corregir su PNG o ajustar la logica de barreras.

### 3. Deshacer guarda estados aunque no haya cambios reales

**Estado:** atendido.

**Riesgo:** actualmente se guarda un snapshot antes de saber si el relleno va a cambiar pixeles. Si el usuario toca una zona que ya tiene el color activo, puede generarse un paso de deshacer innecesario.

**Mejora esperada:** guardar en el historial solo cuando el relleno realmente modifica al menos un pixel.

**Como validar que esta resuelto:**
- Pintar una zona con rojo.
- Sin cambiar color, tocar otra vez la misma zona roja.
- Confirmar que el boton "Deshacer" no agrega un nuevo paso inutil.
- Presionar "Deshacer" y verificar que vuelve al estado anterior real.

### 4. El historial de deshacer puede consumir mucha memoria

**Estado:** atendido.

**Riesgo:** cada paso de deshacer guarda una copia completa del canvas. En imagenes grandes, 10 estados pueden consumir bastante memoria, especialmente en moviles.

**Mejora esperada:** limitar mejor el tamano efectivo del canvas, guardar solo regiones modificadas o reducir el limite en dispositivos pequenos.

**Como validar que esta resuelto:**
- Probar en un movil o simulador con varias imagenes grandes.
- Pintar mas de 10 veces seguidas.
- Confirmar que la pagina no se congela, no se recarga y no pierde respuesta tactil.
- Revisar memoria/performance en DevTools durante la prueba.

### 5. Algunas imagenes son demasiado grandes o no estan optimizadas para colorear

**Estado:** atendido en dimension y documentacion; requiere QA visual para confirmar contornos cerrados en todos los dibujos.

**Riesgo:** assets como imagenes de mas de 3000 px se reducen al cargar. Esa reduccion puede generar bordes suaves, perdida de detalle y peor rendimiento.

**Mejora esperada:** preparar todos los PNG como dibujos de colorear limpios, con resolucion cercana a 1000-1200 px, fondo blanco, lineas oscuras y contornos cerrados.

**Como validar que esta resuelto:**
- Ejecutar `file assets/*.png` y revisar dimensiones.
- Confirmar que ningun dibujo excede innecesariamente el tamano recomendado.
- Pintar cada imagen y verificar que las areas se comportan como regiones cerradas.
- Confirmar que la carga inicial y el cambio de dibujo se sienten rapidos.

### 6. El selector de dibujos no es ideal para ninos

**Estado:** atendido.

**Riesgo:** un `<select>` con nombres no es tan visual ni amigable para ninos. Requiere leer y no muestra que dibujo se va a pintar.

**Mejora esperada:** reemplazar o complementar el selector con una galeria de miniaturas grandes.

**Como validar que esta resuelto:**
- Ver la pagina en desktop y movil.
- Confirmar que cada dibujo aparece como miniatura tocable.
- Confirmar que al tocar una miniatura cambia el canvas.
- Confirmar que la miniatura activa queda visualmente marcada.

### 7. La paleta usa codigos hexadecimales en el estado

**Estado:** atendido.

**Riesgo:** mensajes como `Color activo: #ef5350` no son claros para ninos.

**Mejora esperada:** usar nombres amigables: rojo, rosa, morado, azul, verde, amarillo, naranja, cafe, gris.

**Como validar que esta resuelto:**
- Seleccionar cada color.
- Confirmar que el estado muestra un nombre entendible.
- Confirmar que los botones de color tienen `aria-label` con el nombre del color.

### 8. La UI puede mejorar en accesibilidad y controles tactiles

**Estado:** atendido.

**Riesgo:** algunos controles pueden ser pequenos o poco claros en pantallas tactiles. Ademas, los swatches quitan el outline de foco.

**Mejora esperada:** botones de al menos 44-48 px, foco visible, textos claros y mejor soporte para teclado.

**Como validar que esta resuelto:**
- Navegar usando solo teclado.
- Confirmar que siempre se ve que control tiene el foco.
- Probar en viewport movil.
- Confirmar que los controles son faciles de tocar sin errores.

### 9. Ads y analitica requieren cuidado por tratarse de una web para ninos

**Estado:** atendido en configuracion y documentacion; requiere revision legal antes de produccion.

**Riesgo:** al declarar una experiencia para ninos, anuncios y medicion deben manejarse con mucho cuidado legal y de privacidad.

**Mejora esperada:** cargar AdSense/Analytics solo despues del consentimiento, evitar personalizacion de anuncios, mantener consentimiento claro y no poner anuncios cerca del canvas.

**Como validar que esta resuelto:**
- Confirmar que el consentimiento inicia en modo denegado.
- Abrir DevTools > Network y recargar en una sesion limpia.
- Confirmar que no se cargan `googletagmanager.com` ni `pagead2.googlesyndication.com` antes de aceptar.
- Aceptar y rechazar cookies, y verificar que `gtag consent` se actualiza correctamente.
- Confirmar que no hay anuncios superpuestos ni cerca del area de juego.
- Revisar politicas aplicables antes de publicar campanas o monetizacion.

## Mejoras prioritarias

### Prioridad 1: Hacer el balde mas seguro

Implementar proteccion para no pintar lineas oscuras y reducir fugas entre regiones.

**Validacion:**
- Tocar contornos negros no cambia el dibujo.
- Pintar zonas pequenas no invade otras zonas.
- La experiencia se mantiene rapida en movil.

### Prioridad 2: Corregir el historial de deshacer

Guardar undo solo cuando hay cambios reales.

**Validacion:**
- Repetir clic en una zona ya pintada no agrega un paso inutil.
- Deshacer siempre vuelve a cambios visibles anteriores.

### Prioridad 3: Optimizar y normalizar los assets

Preparar los dibujos como imagenes de colorear consistentes.

**Validacion:**
- Todos los assets tienen resolucion razonable.
- Los bordes son oscuros y cerrados.
- Cada imagen pasa una prueba manual de relleno por regiones.

### Prioridad 4: Mejorar selector de dibujos

Crear una galeria con miniaturas para elegir dibujos.

**Validacion:**
- Un nino puede elegir dibujo visualmente sin leer nombres.
- En movil se ven miniaturas grandes y faciles de tocar.
- El dibujo activo se distingue claramente.

### Prioridad 5: Mejorar lenguaje y accesibilidad de la paleta

Usar nombres de colores, controles mas grandes y foco visible.

**Validacion:**
- Los colores se anuncian con nombres.
- La pagina se puede usar con teclado.
- Los botones son comodos en pantallas tactiles.

### Prioridad 6: Revisar privacidad y anuncios antes de produccion

Confirmar que la monetizacion y analitica cumplen con una audiencia infantil.

**Validacion:**
- Consentimiento probado en aceptar/rechazar.
- Anuncios ubicados solo en header/footer.
- Sin anuncios personalizados para menores si aplica.
