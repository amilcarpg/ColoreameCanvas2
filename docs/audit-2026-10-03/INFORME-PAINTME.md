# PaintMe: diagnóstico y decisión de inversión

**Consulta y auditoría: 3 de octubre de 2026. Objetivo solicitado: USD 1.400 mensuales de ingresos brutos.**

## Veredicto

PaintMe tiene una base aprovechable para una actividad de coloreado, pero **no está preparado para monetizar responsablemente y su negocio aún no está validado**. Es posible construir una ruta matemática hacia USD 1.400/mes; no hay evidencia suficiente para decir que PaintMe vaya a conseguir el público o las ventas requeridos. La recomendación óptima bajo incertidumbre es **web gratuita para descubrir y probar la actividad, publicidad moderada en contenido dirigido a adultos y un pequeño producto original de pago para familias/docentes**. Android se incorpora si la repetición demuestra valor de instalar; iOS se pospone hasta sostener su coste y resolver sus restricciones. Esta elección se basa en distribución, riesgo y economía por hora, no en proteger el código existente.

**Confianza alta** en los fallos web reproducidos y el inventario; **media** en la secuencia de producto; **baja** en demanda, RPM, conversión y plazo hasta USD 1.400. Cambiarían la decisión: pruebas con familias, ventas reales a adultos, RPM efectivo aprobado, demanda orgánica por idioma y coste de adquirir adultos. El tamaño global del mercado de español/inglés no permite inferir la participación que PaintMe puede captar.

Recomiendo comprometer **10 h/semana durante 90 días y hasta USD 150 de gasto discrecional**, con revisiones al día 30 y 60; con 5 h/semana, concentrarse en web y validación, sin lanzamiento móvil ni traducción completa. Ese límite excluye un presupuesto de revisión jurídica específica y comisiones/impuestos: cotizarlos antes de activar anuncios si son necesarios para la jurisdicción finalmente elegida. No invertir en campañas de adquisición todavía. El objetivo de los 90 días es verificar una trayectoria, **no prometer USD 1.400 al día 90**. Un horizonte de 6–18 meses sirve para planificar capacidad, pero es una hipótesis de trabajo, no un pronóstico fundamentado.

### Cómo leer la evidencia

- **HC:** hecho comprobado por código, comprobación local o inspección del sitio; se indica el método.
- **DU:** dato declarado por el usuario; no auditado en cuentas privadas.
- **IR:** inferencia razonable a partir de evidencia.
- **HV:** hipótesis o supuesto numérico por validar.
- **IP:** información pendiente o prueba no realizada.

**DU:** tráfico actual cero; web publicada sin uso; monetización «configurada pero no publicada». No equivale a aprobación AdSense/AdMob ni confirma publicación de apps. País de operación, edades, horas y presupuesto siguen sin confirmar: el usuario pide recomendaciones. No se infiere jurisdicción de su zona horaria. «Revenue» se interpreta como ingreso bruto; resultado operativo y remuneración del creador son cifras diferentes.

No se modificó el producto, no se publicaron cambios y no se activaron integraciones. Solo se añadieron documentos, pruebas diagnósticas y evidencia en esta carpeta.

## 1. Inventario del estado real

| Componente | Estado y evidencia | Qué falta comprobar o completar |
|---|---|---|
| Web pública | **HC:** home, catálogo, balde y pincel accesibles en navegador. Relleno de una región y deshacer observados. | Exportación descargada en Safari/Chrome reales, recuperación fiable, pruebas táctiles físicas y rendimiento modesto. |
| Catálogo | **HC:** 62 dibujos web, 43 Flutter y 43 maestros. Web: animales 10, vehículos 7, Navidad 9, fantasía 8, dinosaurios 4, princesas 5 y Gabby 19. | Derechos y coherencia editorial; 19 Gabby no figuran en los catálogos maestro/móvil. |
| Variantes gráficas | **HC:** todos los `src` y `thumbnailSrc` registrados existen; PNG para pintar ≤1200 px y miniaturas ≤360 px; sin slugs duplicados ni diferencias de proporción >0,01 en la prueba. | No acredita contornos cerrados, calidad pedagógica ni derechos. Validar cada dibujo pintando y exportando. |
| Guardado web | **HC:** helpers para IndexedDB y fallback localStorage existen; **fallan en el recorrido actual por enlace incorrecto del objeto global**. | Corregir el enlace y verificar recarga, cambio de dibujo, cuotas, sesión privada y cierre inmediato. |
| Exportación web | **HC código:** `toBlob`, enlace de descarga y evento `save_png`. | Se pulsó Guardar en producción; la espera de descarga del navegador automatizado expiró. **IP:** no afirmar descarga exitosa ni error universal. |
| Anuncios web | **HC:** placeholders Header/Footer, identificador de editor y carga AdSense tras aceptar; ads.txt público. | No se observaron anuncios reales. Sin unidades `<ins class="adsbygoogle">` en los editores inspeccionados. Auto Ads/cuenta/aprobación no verificados. |
| Analítica web | **HC código:** GA4 y eventos presentes; carga `gtag` sin esperar aceptación; política de denegación inicial. | No se inspeccionaron paquetes de red ni consola GA. Que exista `gtag` no demuestra recepción de eventos, usuarios ni métricas válidas. |
| SEO | **HC:** 43 páginas de dibujos, 6 categorías, 7 packs, canonical, robots y sitemap; páginas estáticas rastreables. | Indexación real y demanda en Search Console. El catálogo web de 62 no tiene una página individual por cada dibujo. |
| Flutter | **HC código:** catálogo, dibujo por capas, herramientas, autosave, galería local, exportación, ajustes adultos y anuncios en catálogo. | Ver detalle móvil consolidado abajo; no se ejecutó una app física ni se verificaron tiendas privadas. |
| Backend | **HC:** web estática; dibujo/persistencia de dispositivo, sin necesidad demostrada de cuentas o sincronización. | Compras digitales futuras requieren elegir cobro/entrega, no justifican hoy un backend propio. |
| Despliegue | **HC:** GitHub Pages publica `web/` al push a main; commit local `d871512`, 17/07/2026. | Estado e historial de Actions remotos no consultados. El workflow no ejecuta checks antes de desplegar. |
| Producción/local | **HC:** 18 archivos públicos descargados vía HTTP 200 coinciden con local al normalizar CRLF/LF. Incluye ambos editores, helpers, worker, CSS, analítica, catálogo, privacidad, ads.txt, robots/sitemap y una muestra SEO. | No se afirma igualdad de todos los recursos ni de todo el historial de despliegue. |

**Documentación desactualizada:** el README raíz dice «cuando comience la implementación móvil», aunque Flutter ya está desarrollado. `web/assets/README.md` afirma que un PNG no está incluido; el catálogo real contiene otros recursos. `web/README.md` describe insertar snippets y mantener anuncios en editores, mientras `privacy.html` describe anuncios solo en catálogo móvil. Resolver los tres relatos antes de configurar publicidad.

### Pruebas realizadas y límites

Se inspeccionó producción con navegador real y dimensiones solicitadas de escritorio 1280×800, móvil 390×844 y tablet 768×1024. **Son tamaños de viewport, no dispositivos móviles físicos ni emulación de hardware, latencia o tacto.** Home móvil, editor balde, apertura de galería, cambio a Triceratops, selección de color, relleno, deshacer, siguiente sin efecto y pincel con un punto fueron observados. No se probó un trazo arrastrado, multitáctil, rotación física, uso con lectores de pantalla o pruebas con personas. Inspección Flutter basada en código y checks que se describen abajo.

Los siete JavaScript principales pasan `node --check`; eso solo valida sintaxis. La prueba Node del objeto compartido y del worker demuestra dos defectos funcionales. Evidencia reproducible: [checks.cjs](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/checks.cjs) y [checks-results.json](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/checks-results.json). Ejecutar desde raíz `node docs/audit-2026-10-03/checks.cjs` no modifica el producto.

## 2. Hallazgos priorizados

| ID / prioridad | Hallazgo y evidencia | Impacto / decisión |
|---|---|---|
| W1 / P0 | **HC demostrado:** `app-utils.js:1` define `const PaintMe`; `paint.js:59` y `brush.js:63` leen `window.PaintMe`, que es undefined. Prueba VM: objeto léxico existe, propiedad de window no existe. Navegador: paleta Base única, guardado fallido, Siguiente no cambia. | Helpers de autosave, recuperar, siguiente/sorpresa y paletas quedan inaccesibles. Reparación pequeña, sin reescritura; aceptación: guardar/restaurar y navegar en ambos editores. |
| W2 / P0 | **HC demostrado:** `paint-worker.js:31` reserva cola de N píxeles, pero encola vecinos repetidos antes de marcar visitados (`:53`, `:68`). Región blanca 10×10: pinta 36/100; 100×100: 2.607/10.000; 1200×1200: 361.274/1.440.000. | Relleno incompleto al agotar cola; la región del dinosaurio probada sí se pintó. Marcar al encolar o usar cola adecuada, verificar bordes y equivalencia con fallback. No es simplemente un problema de tolerancia del PNG. |
| P1 / P0 anuncios | **HC código:** Aceptar concede `ad_personalization` y `ad_user_data`, `paint.js:1170`; GA se carga al quedar visible, `analytics-init.js:72`. | Consentimiento binario de cualquier visitante infantil no resuelve las obligaciones. Diseñar jurisdicción/edad/SDK/CMP y política antes de monetizar. |
| P2 / P0 confianza | **HC:** política pública móvil breve; footer web enlaza párrafo distinto en editor (`index.html:450`, `paint.html:105`). | No hay una descripción coherente del tratamiento web/app, operador y derechos. Bloqueo de monetización, no motivo para rehacer dibujo. |
| C1 / P0 contenidos | **HC:** 19 assets etiquetados Gabby, sin evidencia de licencia en lo revisado. **IP:** titularidad del resto. | No concluir infracción automática ni asumir permiso por generar/descargar. No monetizar material reconocible sin autorización documentada; catálogo original o licenciado es requisito comercial. |
| U1 / P1 validación | **HC viewport:** en móvil el primer lienzo queda bajo título, placeholder y controles; en tablet el pincel también empieza bajo el primer viewport. | Reducir tiempo hasta actividad: lienzo primero, paleta compacta cercana, opciones avanzadas plegadas. Medir actividad en <30 s, no tiempo de permanencia forzado. |
| U2 / P1 continuidad | **HC código:** cambiar modo lleva a `brush.html`/`paint.html` sin asset ni traslado de trabajo; no hay rehacer en editores. `reset()` borra sin confirmación interna. | Preservar dibujo al cambiar modo o explicar limitación y ofrecer guardar. Confirmar reinicio en capa adulta/simple diálogo y recuperar borrado accidental. Rehacer después de resolver fallos básicos. |
| T1 / P1 fiabilidad | **IR código:** snapshots completos, autosave PNG síncrono previo a escritura, ausencia de flush explícito web al cerrar. | Probar móvil de poca memoria y cierre antes de 450 ms. No afirmar pérdidas medidas en todos los casos; límite de historial y adaptación de resolución antes que nueva arquitectura. |
| S1 / P1 adquisición | **HC:** algunas casas/paisajes usan categorías ajenas; categoría y pack repetidos, textos breves; home enlaza al editor más que a las categorías SEO. | Corregir taxonomía, favorecer enlaces descriptivos a páginas útiles para adultos; no crear cientos de páginas cambiando una palabra. |
| M1 / P1 negocio | **DU:** cero usuarios. **IP:** RPM, fill, retención, conversiones y demanda. | Probar distribución y disposición de pago; alcanzar USD 1.400 exige un motor de adquisición y ventas, no solo terminar interfaces. |

Rutas técnicas: [helpers](D:/DevAPG/ColoreameCanvas2/web/app-utils.js:1), [balde](D:/DevAPG/ColoreameCanvas2/web/paint.js:59), [pincel](D:/DevAPG/ColoreameCanvas2/web/brush.js:63), [worker](D:/DevAPG/ColoreameCanvas2/web/paint-worker.js:31), [GA](D:/DevAPG/ColoreameCanvas2/web/analytics-init.js:72), [consentimiento](D:/DevAPG/ColoreameCanvas2/web/paint.js:1170), [privacidad](D:/DevAPG/ColoreameCanvas2/web/privacy.html:14), [deploy](D:/DevAPG/ColoreameCanvas2/.github/workflows/deploy-pages.yml:32).

## 3. Segmento, propuesta y secuencia óptimos

### Público inicial recomendado: actividad acompañada para 4–7 años

**HV de producto:** familias y docentes de infantil/primeros cursos que buscan una actividad de 5–15 minutos, sin registro y con dibujos simples. El adulto descubre, autoriza, configura y compra; el niño elige colores y pinta. 4–7 no es una restricción ya definida ni un dato de usuarios: es una primera hipótesis porque el balde permite empezar sin lectura o precisión de trazo. Menores de 4 necesitan más acompañamiento y una UI más restringida; 8–11 probablemente exigirían catálogo/técnicas más ricos para diferenciarse. Se podrá ampliar tras observar uso, sin mantener variantes de producto independientes ahora.

**Propuesta:** «Dibujos originales en español para colorear al instante, continuar en este dispositivo y llevar la actividad al papel, sin cuenta». Para docentes: una pequeña actividad temática lista para usar, con versión imprimible clara e instrucciones de adulto. Para padres: facilidad, continuidad y claridad de privacidad. Para niños: respuesta inmediata, controles que toleran errores y elección propia. No afirmar mejoras de motricidad/aprendizaje demostradas sin evidencia; sustituir promesas de la home por descripción de la actividad.

La diferenciación viable es **simplicidad + originalidad + actividad digital/imprimible + curación para adulto**, no tamaño del catálogo, personajes famosos ni más efectos que competidores. Necesidad a validar: «resolver un rato creativo sin preparar una actividad desde cero». Razón de regreso: continuar una obra y encontrar otra temática útil, no rachas, recompensas publicitarias o presión.

### Idiomas y países

Empezar con español por capacidad editorial y posibilidad de obtener feedback directo. No porque sea el mercado más rentable probado. **HV:** evaluar adultos hispanohablantes de México y España mediante mensajes y búsquedas temáticas, sin convertir esto en una elección del país legal del operador. España activa el análisis europeo; usuarios estadounidenses, aunque hablen español, pueden activar COPPA. No segmentar anuncios solo por idioma para intentar eludir obligaciones. Elegir después una geografía principal con evidencia de demanda, ventas y cumplimiento.

Inglés tiene mayor alcance potencial y competencia; puede cambiar el óptimo. Al día 60, si el núcleo funciona, probar **una landing y un pack breve en inglés**, con el mismo dibujo y precio ajustado transparentemente, durante 4 semanas. Comparar adultos cualificados por hora de trabajo y compra/solicitud por visita. Expandir si hay al menos 100 visitas cualificadas o 10 conversaciones y señal comercial superior, no por visitas aisladas; si los tamaños difieren mucho, resultado inconcluso. No traducir 62 fichas ni mantener dos redes sociales antes de validar.

| Ruta | Beneficio | Coste/riesgo | Decisión |
|---|---|---|---|
| Web | Descubrimiento SEO/enlaces sin instalación; acceso de aula/familia. | Dependencia de navegador; offline no garantizado; monetización infantil compleja. | Primero aun si se partiera de cero: menor fricción y coste de probar demanda adulta. |
| Android | Offline real con assets, regreso y biblioteca de dispositivo. | QA de dispositivos, tienda, datos/ads, soporte y adquisición de instalaciones. | Segundo solo si familias piden guardar/instalar y regresan; puede mantenerse sin anuncios inicialmente. |
| iOS | Acceso a familias con dispositivos Apple. | Mac/build/firma, QA iPad, requisitos Kids, publicidad limitada y coste de cuenta. | Después de una ruta comercial demostrada. No elegirlo solo por una hipótesis de mayor eCPM. |

La app aporta valor si mejora continuidad y offline. Un contenedor instalado para repetir lo mismo que la web no demuestra ingreso incremental. No recomiendo reescribir Flutter, introducir backend, cuentas, comunidad, chat, dibujos subidos, IA en vivo, sincronización, suscripción ni editor profesional durante la validación.

### Producto mínimo comercializable

24–40 dibujos simples **con derechos acreditados**, 3–4 temas bien organizados; balde fiable como recorrido principal y pincel opcional; 8–12 colores grandes; deshacer; exportación PNG verificada; recuperar en el mismo dispositivo; página para adultos con impresión/uso y política completa. Elegir una sola oferta de pack original para adultos. Publicidad solo después de aprobación/configuración y prueba de solicitudes, separada de controles. Un pack de pago no convierte en pagado el uso gratuito: revisar «100% gratis» para precisar qué está incluido.

Aceptación: abrir un dibujo desde home en una acción; ningún primer lienzo oculto por espacio publicitario vacío en móvil objetivo; ≥8/10 sesiones acompañadas empiezan a pintar sin ayuda de interfaz en ≤30 s; 20 recorridos técnicos de pintar→deshacer→guardar→recargar→restaurar sin pérdida; 100% relleno esperado en fixtures de regiones y protección de contornos; exportaciones abiertas en Chrome Android/Safari iOS/escritorio; rechazar mantiene la actividad funcional; cero anuncio encima/pegado a herramientas; todo contenido comercial con registro de procedencia. Son **umbrales elegidos**, no resultados conseguidos.

## 4. UX y auditoría técnica

### Cambios de pantalla propuestos y cómo verificarlos

| Pantalla | Cambio concreto | Problema | Verificación |
|---|---|---|---|
| Home | Mantener CTA principal; «Pincel» secundario; convertir botones decorativos de la maqueta en elementos no interactivos o funcionales de verdad. Enlazar categorías descriptivas y privacidad/contacto reales. | Botones decorativos parecen funciones; contacto es solo ancla; se prometen funciones que el editor no tiene, como rehacer. | 5 adultos identifican acción principal y contacto en <10 s; tabulación no cae en botones ficticios. |
| Catálogo | Miniaturas grandes, 3–4 temas iniciales, orden por facilidad, continuar destacada; búsqueda avanzada para adultos. | Texto/select requiere lectura; categorías casas/paisajes confusas. | Niño acompañado selecciona visualmente sin leer; adulto encuentra tema en ≤3 pasos. |
| Editor móvil/tablet | Lienzo arriba, fila de colores inmediatamente cercana, deshacer/guardar visibles; «más opciones» para paleta, color personalizado y grosor; quitar reservas publicitarias vacías. | Cambio constante entre controles y dibujo mediante scroll. | Tamaños 360/390/768, retrato/paisaje; primer lienzo visible y controles no ocultan la zona activa. Prueba física pendiente. |
| Guardado | Distinguir «guardado en este dispositivo» de «descargar PNG»; indicar fallo recuperable; al volver ofrecer continuar. | Guardar exporta pero no asegura biblioteca; storage puede faltar. | Simular cuota/IndexedDB indisponible, recargar, cerrar y cambiar asset inmediatamente; sin falso estado de éxito. |
| Herramientas | Etiquetas/nombres de colores útiles, estado seleccionado no solo por color, foco visible, reinicio con recuperación. | «Color 1» no comunica matiz; CSS elimina outline sin reemplazo específico en swatches. | Teclado y lector en navegación; contraste de texto y foco; niño no pierde una obra con un toque accidental. |
| Adultos | Configuración de privacidad, compras, enlaces externos y contacto claramente separada; no exigir aceptar publicidad para pintar. | El niño no debe resolver decisiones de datos/compras. | Recorridos de adulto con información clara; una puerta parental no se presenta como consentimiento legal verificable. |

Para niños, objetivo propio de 44–48 px y espacio entre controles; no confundirlo con el mínimo general WCAG 2.2 de 24×24 CSS px con excepciones. [W 3 C mínimo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum), [W 3 C objetivo ampliado](https://www.w3.org/WAI/WCAG21/Understanding/target-size), consultados 03/10/2026. El canvas no tiene una alternativa completa por teclado; mejorar navegación/estado y declarar alcance, sin prometer conformidad WCAG de toda la actividad sin auditársela.

Esquema propuesto:

```text
Adulto descubre página temática → elige dibujo/actividad
                                      ↓
                   Niño acompañado pinta → deshacer → seguir
                                      ↓
                     Guardado local + descarga por adulto
                                      ↓
                   Volver → continuar / elegir otro dibujo

Adulto, en zona separada → privacidad / impresión / pack original
```

Validación: 5 adultos + 2 docentes primero; después 6–10 sesiones acompañadas con niños del tramo elegido y autorización de responsables. Observar tareas, errores y ayuda necesaria; no recolectar nombres de niños, vídeos o voces por defecto. La autorización para participar no autoriza telemetría publicitaria. Seguimiento a 7 días con adulto para saber si regresaron; registrar también falta de respuesta. La presente revisión es técnica/heurística, **no investigación con usuarios**.

### Web: mantener y reparar

Arquitectura estática sin framework/npm ni backend: coste de operación bajo y mantenimiento manejable. Ambos motores comparten helpers, pero repiten consentimiento/UI/catálogo/paletas; centralizar solo tras reparar W1 y W2. La galería realmente se construye bajo demanda y las imágenes usan miniaturas lazy: conservar. Máximo canvas 1200; worker para relleno y fallback por frames: conservar tras corregir cola. `fetch`/bitmap y IDs de carga evitan varias carreras de imagen; todavía probar cambiar asset mientras está pintando.

**Memoria estimada, no perfil medido:** RGBA 1200² = 5,76 MB por bitmap; 10 snapshots balde ≈ 57,6 MB; 20 pincel ≈ 115,2 MB, más capas, copias, máscara y compresión. Los PNG suman ~35,72 MB maestros, ~26,58 MB web y ~30,65 MB Flutter; esto no es el peso inicial de descarga ni tamaño del AAB/IPA. En web se cargan selecciones, no toda la carpeta. Probar 20 trazos y relleno grande en Android de 2–3 GB; objetivos elegidos: respuesta visual <100 ms al toque, operación grande <500 ms o progreso visible, sin bloqueo >1 s ni cierre. No hay Lighthouse/Core Web Vitals medidos aquí.

Autosave: IndexedDB con fallback es suficiente, pero hoy no se alcanza; tras W1, comprobar cuotas y abortos de transacción, captura del slug/canvas al programar y flush antes de cambiar/ocultar la página. No añadir nube por este defecto. Exportación `toBlob` es una base razonable; confirmar descarga en navegadores de destino porque revocar URL inmediatamente puede necesitar ajustes de compatibilidad. Rehacer es posterior, no bloquea validar si deshacer y recuperar funcionan.

Seguridad: parámetros asset/category normalizados a `[a-z0-9-]{1,64}`, selección por catálogo, textos con `textContent`; no se detectó ejecución del parámetro de asset. `source` en helper admite texto arbitrario: limitarlo a enum antes de medir para evitar URLs/datos inesperados. CSP meta restringe scripts y frames en home/editor; no se verificaron cabeceras HTTP de seguridad ni todos los dominios que necesitará un anuncio real. No añadir `unsafe-eval` o comodines para «hacer funcionar ads». La CSP actual podría bloquear recursos publicitarios: **riesgo**, no fallo de anuncio demostrado. Probar en staging con unidades de prueba permitidas.

SEO: canonical de editor evita tratar cada query como página independiente; conservarlo. `robots.txt` enlaza sitemap sin www mientras canonical/sitemap usan www: no es un error de indexación demostrado, revisar redirección y unificar host. Packs/categorías del mismo tema necesitan intenciones distintas: «actividad/lista» frente a «colección imprimible». Si son duplicados de hecho, consolidar/redirect/canonical con criterio, sin afirmar penalización automática. Sitemaps/canonical son señales y no garantizan indexación. [Google sobre canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), consultado 03/10/2026.

Añadir solo contenido útil y original: preview clara, nivel de detalle, cómo usar el tema con un adulto, imprimir, enlaces relacionados. No publicar 19 fichas Gabby para completar el catálogo mientras los derechos sean IP. Registrar fuente, autor, licencia comercial, fecha y evidencias por asset. Pipeline recomendado: maestro→optimización a 1200→thumb 360→versiones móvil→catálogo→prueba de contornos→SEO selectivo; una herramienta local reproducible basta. Falta demostrar un generador/pipeline automatizado actual; no mantener a mano tres catálogos de forma indefinida.

Despliegue: ejecutar los checks funcionales/sintaxis/catálogo como condición antes de Pages; poder revertir al último commit bueno. Publicar docs de análisis fuera de `web/` evita que se conviertan en páginas públicas del sitio. Mantener GitHub Pages mientras coste/límites medidos no exijan otra opción.

### Evidencia visual

Home y editor en viewport móvil; el canvas del editor empieza después de los controles. No es una prueba de dispositivo físico.

![Home móvil](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/home-mobile.jpg)

![Editor móvil antes de colorear](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/editor-mobile-initial.jpg)

![Error de guardado observado en escritorio](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/editor-desktop-save-error.jpg)

### Flutter: base útil, publicación y fiabilidad pendientes

**HC código:** repositorios de catálogo/preferencias/storage separados, motor de dibujo por capas, `compute` para relleno, catálogo/búsqueda/favoritos, Mis dibujos, zoom, balde/pincel/borrador/deshacer y exportación. `main.dart` sigue concentrando mucha UI: refactorizar pantallas solo donde reduzca errores, no iniciar reescritura. El worker Flutter marca visitas de forma distinta y no hereda el defecto de cola web. Assets locales permiten colorear sin red; anuncios/privacidad y compartir dependen de servicios/otras apps. Offline en dispositivo aún IP.

| Hallazgo móvil | Evidencia y alcance | Qué hacer antes de publicar |
|---|---|---|
| Autosave después de error | **HC código:** cadena `.then` de `_pendingSave` sin recuperación, `autosave_controller.dart:25`; dispose no esperado, `main.dart:933`; sin flush de ciclo de vida. **IR:** primer error puede bloquear los siguientes guardados. | Capturar fallo, continuar cola, confirmar éxito después de escritura, flush al suspender; test fallo→recuperación y cierre. |
| Storage | PNG/índice sobrescritos directamente, `drawing_storage.dart:85`; lecturas pueden reescribir índice. **IR:** riesgo de corrupción/concurrencia. | Escritura temporal + rename, serializar mutaciones y probar recuperación de índice/PNG. No exige base de datos remota. |
| Banner | `onAdFailedToLoad` dispone sin limpiar `_ad`, `ad_banner.dart:53`; build usa objeto no nulo. No se revisa mounted tras await entitlement. | Estados cargando/listo/fallo, liberar/resetear, backoff sin bucle, comprobar widget desmontado. Actividad sigue sin anuncio. |
| Ambientes publicitarios | Falta `ADMOB_BANNER_ID` usa test ID incluso release, `ad_banner.dart:39`. Android App ID/firma se exigen para release; iOS tiene variable `$(ADMOB_APP_ID)` sin definición versionada encontrada. | Release productivo debe fallar ante config incompleta, test inequívoco en debug; inspección del artefacto firmado y cuenta. No pedir/mostrar secretos. |
| iPad compartir | `export_service.dart:17` omite `sharePositionOrigin`; paquete 12.0.2 lo requiere. **IR:** fallo/crash posible, no reproducido. | Origen del botón, error visible, probar share sheet real en iPad antes de soportarlo. |
| Build Android | AGP 8.11.1, `settings.gradle.kts:22`; share_plus 12.0.2 lock declara ≥8.12.1. **IR:** riesgo de incompatibilidad, no build fallido demostrado. | Revisar matriz Flutter/AGP/Kotlin/plugin y compilar release; no actualizar todo sin razón. |
| Rendimiento/carreras | Snapshots PNG síncronos por gesto, `drawing_engine.dart:137`; UI permite acciones durante fill. **IR:** jank/resultado sobrescrito posibles. | Bloquear o serializar acciones incompatibles; perfil CPU/RAM en Android modesto; encode fuera de UI solo si perfil lo demuestra. |
| Analítica/compras | `DisabledProductAnalytics` no envía datos; entitlement devuelve false; «quitar anuncios» aparece Próximamente. | No contabilizar estos eventos como métricas recibidas ni venta sin anuncios como implementada. |
| UX infantil | Puerta adulta aritmética 4 + 3 fija, `main.dart:1297`; Mis dibujos muestra miniatura original; no rehacer. | Gate más robusto adecuado a plataforma, preview de obra, textos/estados claros. No tratar la suma como verificación de responsable legal. |

Android usa namespace/applicationId `club.paintme.paintme_app`, versión `1.0.0+1`, Java 17; SDK destino se deriva de Flutter, por lo que **no se confirmó el API efectivo del build**. No se revisaron claves ni certificados privados. iOS contiene proyecto/configuración de firma automática, pero no prueba que exista provisioning válido. No se encontró CI móvil, test de release ni publicación confirmada.

Hay siete tests versionados de motor/catálogo, almacenamiento y widgets. Uno compara canal rojo que permanece 255 tanto en blanco como rojo: no verifica por sí solo el aislamiento correcto de región. Faltan tests significativos de autosave tras fallo, lifecycle, ads, consentimiento y exportación. Se intentaron `flutter analyze --no-pub` y `flutter test --no-pub`; **no devolvieron diagnóstico**, se interrumpieron y no se consideran aprobados. El wrapper intenta un lock dentro del SDK `D:/flutter`, fuera de raíces de escritura, y falta `.dart_tool`: explicación probable, no causa plenamente probada. No instalar ni actualizar SDK como parte de este diagnóstico. iOS no compilado en este entorno Windows.

Fuentes técnicas consultadas 03/10/2026: [share_plus 12.0.2, requisitos y iPad](https://pub.dev/packages/share_plus/versions/12.0.2), [UMP Flutter](https://developers.google.com/admob/flutter/privacy). Evidencia local: [motor](D:/DevAPG/ColoreameCanvas2/flutter/lib/drawing_engine.dart:137), [autosave](D:/DevAPG/ColoreameCanvas2/flutter/lib/autosave_controller.dart:25), [banner](D:/DevAPG/ColoreameCanvas2/flutter/lib/ad_banner.dart:53), [exportación](D:/DevAPG/ColoreameCanvas2/flutter/lib/export_service.dart:17), [Android](D:/DevAPG/ColoreameCanvas2/flutter/android/settings.gradle.kts:22), [analítica](D:/DevAPG/ColoreameCanvas2/flutter/lib/product_analytics.dart:10). El [anexo móvil](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/flutter-audit.md) conserva detalle de comprobaciones.

## 5. Publicidad, privacidad y requisitos pendientes

### Decisión de diseño publicitario

**Recomendación, no regla numérica universal de plataforma:** cero anuncios dentro del lienzo, junto a colores, deshacer/guardar, exportación o en medio de una actividad. Web: empezar con una ubicación contextual claramente marcada en una página útil para adultos; Android, cuando se publique, máximo un banner visible en catálogo, separado de tarjetas y navegación. No asumir que un catálogo visitado por niños pasa a ser adulto por su etiqueta. Sin interstitials, rewarded, anuncios para desbloquear un color ni solicitudes de clic. Sin refresh propio durante la sesión. Si no hay anuncio, seguir jugando y colapsar espacio sin mover controles bajo el dedo. Probar separación y desplazamientos con creatividades de prueba; no hacer clic en anuncios comerciales para «verificar ingresos».

Esto reduce el inventario respecto a una aplicación llena de anuncios, de forma deliberada. La alternativa para mejorar ingresos es distribuir mejor y vender valor al adulto. No usar CTR publicitario infantil como objetivo.

### Qué se exige y en qué condiciones

| Condición | Requisito vigente consultado | Consecuencia para PaintMe |
|---|---|---|
| Uso de Google Publisher Ads en servicio dirigido a menores | Señales de tratamiento infantil y restricciones de personalización según audiencia/ámbito. La ayuda web actual utiliza TFAT y depreca TFCD/TFUA. | Verificar mecanismo AdSense/cuenta realmente aplicable; no copiar una API de GPT destinada a otro producto. La web inspeccionada no muestra esa señal. [Publisher Policies](https://support.google.com/adsense/answer/10502938?hl=en), [tratamiento por edad](https://support.google.com/adsense/answer/9007197?hl=en). |
| Distribución Play con público que incluye niños | Families, audiencia/Data safety/clasificación correctas; SDK/adaptadores en versiones autocertificadas para niños/edad desconocida; sin intereses/remarketing ni formatos disruptivos. | Revisar manifest fusionado y dependencias nativas; para exclusivamente infantil revisar exclusión de AD_ID en API 33 + y demás identificadores prohibidos. `google_mobile_ads:7.0.0` solo no acredita todo. [Families](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en), [SDKs admitidos](https://support.google.com/googleplay/android-developer/answer/12955712?hl=en). |
| App Store principalmente infantil/Kids | Publicidad y analítica de terceros restringidas; excepción contextual limitada exige condiciones, incluida revisión humana de creatividades. Puerta parental para salidas/compras y requisitos de reporte de anuncios. | NPA/rating G/aceptación Android no prueban excepción Apple. Pedir documentación al proveedor y justificar ante App Review, o publicar sin ads. [Apple reglas 1.3/5.1.4](https://developer.apple.com/app-store/review/guidelines/). |
| AdMob nueva app configurada desde enero 2025 | Verificar con app-ads.txt y revisión de preparación antes de servir plenamente; ver excepción de tiendas de terceros. | Publicar vendedor correcto en dominio vinculado a ficha y verificar consola. ads.txt web existente no sustituye app-ads.txt. No se encontró este último en el árbol local revisado. [AdMob verificación](https://support.google.com/admob/answer/14538460?hl=en). |
| Anuncios personalizados EEE/UK/Suiza | CMP certificado/TCF en la ruta descrita por Google. | El banner propio no es certificado. No afirmar que todo NPA obliga a esa misma certificación; sí revisar requisitos legales de almacenamiento y consentimiento. [CMP Google](https://support.google.com/adsense/answer/13554116?hl=en), [política UE](https://www.google.com/about/company/user-consent-policy/). |
| COPPA por audiencia/ámbito y datos | Menores de 13; identificadores/SDKs pueden estar cubiertos aunque no haya cuentas. Excepción de operaciones internas limitada, no automática para analítica. Reforma con plazo general de cumplimiento 22/04/2026 ya vencido. | Determinar si flujos específicos requieren consentimiento parental verificable y separado para divulgaciones no integrales; revisar retención/seguridad/avisos. Botón Aceptar y suma no bastan. [FTC FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions), [norma oficial](https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments). |
| GDPR/ePrivacy cuando aplicables | Ámbito por establecimiento/oferta/seguimiento; artículo 8 para servicios al niño basados en consentimiento, umbral 16 reducible nacionalmente hasta 13; obligaciones de información/revocación y almacenamiento en terminal. | No es una edad mínima universal para usar PaintMe; elegir base y autorización por tratamiento/país. Revisar además normativa de mercados fuera de UE/EEUU elegidos. [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj), [ePrivacy consolidada](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02002L0058-20091219). |

Todas las fuentes de esta sección consultadas **03/10/2026**. La evaluación de ámbito es condicional porque no se ha comunicado el país del operador ni una distribución concreta. Reconfirmar al publicar; no existe una aprobación legal global por elegir «familias».

### Datos y consentimiento actuales

Web: scripts `gtag` programados antes de aceptación; denegación inicial no impide por sí sola pings sin cookies en modo avanzado. No se capturó HAR; no se afirma haber medido cookies o datos realmente recibidos por Google. Eventos intentados incluyen asset, categoría, modo, selección, primera pintura y exportación; URL/referrer y datos automáticos dependen de GA/configuración. Definir una lista de datos realmente observados en sesión limpia, antes de decidir, al rechazar y al aceptar. Home no presenta el mismo banner que el editor. **Rechazar se probó**, aceptar se revisó por código. [Google sobre modos de consentimiento y pings](https://support.google.com/analytics/answer/10000067?hl=en).

Flutter: se configura UMP con menor de consentimiento y MobileAds con tratamiento infantil/menor/G y NPA antes de inicializar. Es un comienzo prudente. TFUA de UMP no se transmite automáticamente a MobileAds y puede evitar pedir consentimiento al menor: no es consentimiento parental conseguido. Mantener compatibilidad con SDK 7.0.0; la documentación actual describe migración a tratamiento por edad, que requiere revisar soporte de versión antes de usar nueva API. [UMP/TFUA](https://developers.google.com/admob/flutter/privacy/gdpr), [targeting actual](https://developers.google.com/admob/flutter/targeting).

No personalizada no significa «sin datos»: puede incluir identificadores para frecuencia/informes y almacenamiento. La analítica propia móvil está apagada; eso no describe lo que envía el SDK publicitario. [Ayuda Google de consentimiento](https://www.google.com/about/company/user-consent-policy-help/). Revisar permisos/Privacy manifests y required reason APIs del app **y sus plugins**, además de Data safety/App Privacy; no declarar «no recogemos nada» con ads sin auditar.

La política debe identificar operador/contacto, separar web/app, describir dibujo local y posibles backups del sistema, destinatarios/datos realmente usados, finalidad/base, conservación, controles/revocación y derechos según mercados. El dibujo local no tiene por qué enviarse al creador, pero compartir lo entrega a otra aplicación; no prometer que nunca sale del dispositivo. La suma parental actual separa interfaz, no verifica jurídicamente al responsable.

### Publicación: requisitos actuales distintos de aprobación de anuncios

- Play nuevas apps/updates: la fuente consultada exige **API 36 desde 31/08/2026**, con excepciones específicas y posibilidad de extensión hasta el 01/11/2026 en los casos admitidos. El target efectivo del proyecto depende del SDK Flutter y no se compiló. [Requisito Play](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-EN).
- Cuentas personales Play creadas después del 13/11/2023: **12 testers opt-in durante 14 días continuos** antes de solicitar acceso a producción; no se conoce tipo/fecha de cuenta. [Prueba cerrada](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).
- Desde 28/04/2026, iOS/iPadOS enviados a App Store Connect se construyen con SDK 26 o posterior. Esto es SDK de compilación, no obligación de que cada usuario tenga iOS 26. [Apple requisitos](https://developer.apple.com/news/?id=ueeok6yw).
- Firma, versiones, fichas, capturas honestas, políticas/declaraciones, manifiestos y revisión de contenido siguen pendientes. Los requisitos técnicos no garantizan aceptación en tiendas ni AdMob.

**Revisión profesional exactamente delimitada:** con país, edades y mercados elegidos, evaluar ámbito COPPA/GDPR/normas locales; si los datos publicitarios/analíticos observados admiten excepción operativa o exigen consentimiento parental; base, avisos y contratos. **Confirmación de plataforma/proveedor:** tratamiento infantil AdSense, app readiness AdMob y excepción contextual infantil Apple. Puede validarse demanda sin anuncios mientras se resuelven estos puntos; no hace falta dictamen para cambiar tamaño de botones.

**Cierre de monetización:** inventario HAR/SDK documentado, política consistente, rechazar/revocar funcionan sin perder dibujo, configuración infantil y permisos verificados en release, ads.txt/app-ads.txt correctos, estados de aprobación visibles y pruebas de anuncio de test sin clic accidental. El [anexo de privacidad](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/privacy-research.md) conserva fuentes y condiciones completas.

## 6. Comparativa de mercado

**HC externo de declaración/ficha, no prueba práctica de los competidores.** Se consultaron webs y fichas oficiales el 03/10/2026. No se midieron recorridos, FPS, tráfico, descargas, ingresos ni participación de mercado. La calidad comparada es organización/propuesta/prestaciones declaradas, no experiencia cronometrada. Catálogos anunciados por proveedores no son conteos independientes.

| Alternativa / público | Valor, catálogo y experiencia declarada | Plataformas/idiomas comprobados | Monetización/precio verificado | Oportunidad para PaintMe |
|---|---|---|---|---|
| [Coloring-Online](https://coloring-online.com/), niños de 3–10/familias | Sin registro, temas y colorear/descargar; cientos declarados. | Web móvil/tablet/desktop; español/inglés y enlaces a otros idiomas; apps enlazadas. | Web gratis; [cookies](https://coloring-online.com/cookie-policy/) declara AdSense, precio app IP. | Español y gratis ya existen: competir por continuidad/fiabilidad y confianza. |
| [Coloring-for-Kids](https://coloring-for-kids.com/es), niños/docentes | Temas/dificultad, pincel, números/letras/operaciones; >1.000 declarados. | Web multilingüe, español, enlaces a apps. | Web actividad gratuita; anuncios efectivos/precios app IP. | Curación por facilidad/uso acompañado, no volumen. |
| [Supercoloring](https://www.supercoloring.com/es/section/coloring), niños/adultos/docentes | Amplia taxonomía/imprimibles; >80.000 anunciado. | Web español/inglés. | Recursos gratis; [política](https://www.supercoloring.com/page/privacy-policy) declara redes publicitarias, no auditadas. | Digital fácil + actividad en papel; respetar derechos, no copiar catálogo/política. |
| [Crayola imprimibles](https://www.crayola.com/free-coloring-pages), familias/docentes | Sustituto de papel, marca reconocida, temas/celebraciones. | Web inglesa consultada, descarga e impresión. | Recursos gratis; materiales físicos a cargo de familia, promoción de tienda visible. | Probar un recurso original listo para usar; editor debe ahorrar esfuerzo frente al papel. |
| [RV Coloring Games](https://apps.apple.com/us/app/coloring-games-painting-glow/id1480696573), toddlers/preescolar | Relleno, pincel, libre, números y brillo. | iPhone/iPad, español entre 48 idiomas; [Android](https://play.google.com/store/apps/details?hl=en-US&id=com.rvappstudios.kids.coloring.book.color.painting). | Ficha US gratis; declara sin ads/IAP/paywall. | «Lo mismo con banners» es débil frente a alternativa gratuita sin ads; aportar curación/actividad adulta. |
| [Bimi Boo Kids Coloring](https://apps.apple.com/us/app/kids-coloring-drawing-games/id6444398254), toddlers | Modos creativos/animación, >20 páginas gratis declaradas. | iPhone/iPad; español entre 40 idiomas. | Sin ads declarado; ficha US USD 6,99/mes y 39,99/año, oferta final puede variar. | Hay oferta de pago, pero no prueba disposición de pago por PaintMe. |
| [Crayola Create & Play](https://apps.apple.com/us/app/crayola-create-and-play-kids/id1431955703), niños/familias | Actividades creativas amplias, herramientas/mascotas, marca. | iPhone/iPad, español entre 12 idiomas; [FAQ](https://www.crayolacreateandplay.com/faq) confirma Android/Amazon/Samsung. | Ficha US enumera USD 7,99/mes y 59,99/año, además de otros SKU; prueba/suscripción. Anuncios efectivos IP. | Acceso rápido/ligereza y una tarea concreta; no replicar todo el alcance. |

«4 + » de una ficha es clasificación, no necesariamente edad objetivo. Precios en dólares de **tienda estadounidense** a fecha de consulta: no garantizan oferta, impuestos o disponibilidad para otro país. Ningún número de terceros se usó para demanda/ingresos. Las declaraciones publicitarias de competidores no se recomiendan como modelo de cumplimiento.

**IR comercial:** el mercado tiene sustitutos abundantes y gratuitos, incluidos en español; ofrecer catálogo genérico no basta. El nicho candidato es una actividad original breve, acompañada y lista para aula/familia. Validar mediante uso y compra adulta antes de aumentar dibujos/idiomas. No hay evidencia para declarar un país o idioma «ganador» por RPM.

## 7. Modelo económico: meta USD 1.400, escenarios y fórmulas

**Todos los volúmenes, tasas, RPM, eCPM y costes de los escenarios son HV ilustrativas**, no datos actuales, benchmarks de sector ni pronósticos. DU tráfico 0 y ads sin publicar: no hay ingreso publicitario demostrado. Si no hay aprobación o solicitudes admisibles, ingreso ads es 0 incluso con visitas. Ninguna fuente externa aporta un RPM propio de PaintMe.

### Fórmulas sin contar dos veces

Web:

```text
Sesiones = U × sesiones por usuario
PV totales = sesiones × páginas por sesión
PV elegibles = PV totales × fracción elegible
Ingreso web = PV elegibles × Page RPM de ese grupo / 1.000
```

Page RPM del editor/publisher es por páginas, no impresiones de banner. La elegibilidad separa visitas/páginas en las que es admisible solicitar publicidad; el RPM del grupo incorpora cobertura/unidades. **No volver a multiplicar por fill o banners/página.** Si se mide RPM sobre todas las páginas, usar PV totales y eliminar factor elegible. Pintar/tocar/cambiar asset dentro del canvas no produce nuevas páginas artificiales. [Definición AdSense Page RPM](https://support.google.com/adsense/answer/112030?hl=en-GB), consultada 03/10/2026.

Móvil, solo banner de catálogo:

```text
Sesiones = MAU × sesiones por MAU
Oportunidades = sesiones × solicitudes admisibles por sesión
Impresiones = oportunidades × fill de respuestas × show de respuestas mostradas
Ingreso móvil = impresiones × eCPM banner / 1.000
```

Aquí fill=matched requests/requests; show=impresiones/matched requests. Si se dispone de impresiones/requests como fill efectivo, retirar show. Oportunidades no son minutos coloreando; sin refrescos propios ni recorrido forzado para aumentar inventario. Interstitial/rewarded:0 impresiones/ingresos en este plan. No se atribuye su eCPM al banner. [Glosario AdMob](https://support.google.com/admob/answer/13547458?hl=en), consultado 03/10/2026. No restar de nuevo comisión de red ya incorporada al ingreso publisher; cobro en cuenta puede tener ajustes/umbrales/plazos distintos al devengo mensual.

### Web: escenarios mensuales

| Variable | Conservador | Base | Optimista |
|---|---:|---:|---:|
| Usuarios |2.000|10.000|50.000|
| Sesiones/usuario |1,5|2|3|
| Sesiones |3.000|20.000|150.000|
| Páginas/sesión |1,6|2|2,5|
| PV totales |4.800|40.000|375.000|
| Fracción elegible |50%|65%|80%|
| PV elegibles |2.400|26.000|300.000|
| Page RPM elegible, USD |0,50|1,50|4,00|
| **Ingreso bruto, USD** |**1,20**|**39,00**|**1.200,00**|
| Coste directo supuesto |5,00|5,00|5,00|
| **Operativo antes de trabajo/impuestos** |**−3,80**|**34,00**|**1.195,00**|

Base: `10.000×2×2×0,65×1,50/1.000=39`. El 80% elegible optimista es especialmente exigente si el editor no muestra ads y concentra uso; se debe medir y podría ser mucho menor. No es una recomendación de colocar publicidad en 80% de las pantallas infantiles. Ad blocker/rechazo/región/aprobación y contenido afectan elegibilidad; no volver a descontar aquello ya incluido en RPM del grupo.

### Móvil: escenarios mensuales, costes Android

| Variable | Conservador | Base | Optimista |
|---|---:|---:|---:|
| MAU |500|5.000|25.000|
| Sesiones/MAU |3|6|10|
| Sesiones |1.500|30.000|250.000|
| Oportunidades/sesión |1|1,5|2|
| Solicitudes admisibles |1.500|45.000|500.000|
| Fill/respuesta |40%|65%|85%|
| Show/muestra |80%|85%|90%|
| Impresiones esperadas |480|24.862,5|382.500|
| eCPM banner, USD |0,20|0,60|1,50|
| **Ingreso bruto, USD** |**0,096**|**14,92**|**573,75**|
| Coste directo supuesto |7,00|7,00|7,00|
| **Operativo antes de trabajo/impuestos** |**−6,90**|**7,92**|**566,75**|

Base: `5.000×6×1,5×0,65×0,85×0,60/1.000=14,9175`. Fracciones de impresión son expectativas aritméticas, no eventos reales. El escenario favorable combina varios supuestos fuertes: no atribuirlo solo a crecer MAU.

### Costes reales pendientes y tiempo

USD 5/mes web es provisión elegida:2 dominio + 3 herramientas/contingencia, hosting estático 0 **si condiciones/límites actuales lo permiten**. No factura del creador. USD 7/mes Android:5 herramientas/contingencia + reparto aproximado de registro único de 25 en 12 meses. [Google confirma registro único USD 25](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en-AU); no vuelve a cobrarse anual. iOS añadiría 8,25/mes por [Apple USD 99/año](https://developer.apple.com/help/account/membership/program-enrollment/) con variación regional, más Mac/build/QA no cotizados. Fuentes consultadas 03/10/2026.

Excluidos de esas provisiones: compra/licencias de ilustración, revisión legal, CMP de pago si necesaria, hardware, comisiones de cobro/tienda, impuestos y campañas. Cotizar por escrito antes de invertir; una obligación que exceda el cap exige cambiar alcance/presupuesto, no ignorarla. En una ruta combinada no duplicar dominio/herramientas.

Horas de mantenimiento/adquisición **supuestas después del lanzamiento**: web 12 + 8=20 h/mes; Android 16 + 8=24 h/mes. No incluyen resolver deuda inicial ni alcanzar cientos de miles de usuarios. Valor de referencia para decidir 10 USD/h, no salario asumido: base web 34−200=−166; móvil 7,92−240=−232,08. Más audiencia puede exigir más horas; no presentar escenarios altos como ingreso pasivo. En el plan inicial se recomienda 10 h/semana incluyendo construir, vender y aprender, no 20 h/mes de operación estable.

### Escala para USD 100/300/500/1.400

```text
PV elegibles para bruto = meta × 1.000 / RPM
Usuarios web para bruto = meta × 1.000 / (s × p × elegibilidad × RPM)
MAU para bruto = meta × 1.000 / (s × oportunidades × fill × show × eCPM)
Para operativo: sustituir meta por meta + costes directos.
```

Web base, 4 PV y 2,6 elegibles por usuario/mes, RPM 1,50:

| Meta USD | PV elegibles bruto | PV totales bruto | Usuarios bruto | PV elegibles operativo, coste 5 | Usuarios operativo |
|---:|---:|---:|---:|---:|---:|
|100|66.667|102.565|25.642|70.000|26.924|
|300|200.000|307.693|76.924|203.334|78.206|
|500|333.334|512.821|128.206|336.667|129.488|
|**1.400**|**933.334**|**1.435.898**|**358.975**|**936.667**|**360.257**|

Móvil base, 4,9725 impresiones/MAU/mes, eCPM 0,60:

| Meta USD | Impresiones bruto | MAU bruto | Impresiones operativo, coste 7 | MAU operativo |
|---:|---:|---:|---:|---:|
|100|166.667|33.518|178.334|35.864|
|300|500.000|100.554|511.667|102.900|
|500|833.334|167.589|845.000|169.935|
|**1.400**|**2.333.334**|**469.248**|**2.345.000**|**471.594**|

No sumar usuarios web y MAU como personas únicas, pueden ser las mismas familias; sí sumar ingresos comprobados de plataformas diferentes evitando costes duplicados.

| Sensibilidad usuarios / escenario | USD 100 bruto | USD 300 bruto | USD 500 bruto | USD 1.400 bruto | USD 1.400 operativo |
|---|---:|---:|---:|---:|---:|
| Web conservador |166.667|500.000|833.334|2.333.334|2.341.667|
| Web base |25.642|76.924|128.206|358.975|360.257|
| Web optimista |4.167|12.500|20.834|58.334|58.542|
| Móvil conservador |520.834|1.562.500|2.604.167|7.291.667|7.328.125|
| Móvil base |33.518|100.554|167.589|469.248|471.594|
| Móvil optimista |4.358|13.072|21.787|61.003|61.308|

**USD 1.400 con ads solos:** web base casi 1,44 millones de PV/mes y 358.975 usuarios; móvil base 469.248 MAU. Bajo supuestos favorables aún 58.334 usuarios web o 61.003 MAU. No es imposible universalmente, pero no se sostiene hoy como objetivo probable para una persona sin distribución demostrada. Si web elegible fuese 20% en lugar de 65%, base exige ≈ 1.166.667 usuarios; si RPM se duplica, escala se divide por 2 manteniendo todo lo demás.

Sensibilidad a 100.000 PV elegibles: RPM 0,50/1,50/4→50/150/400 USD. A 100.000 impresiones: eCPM 0,20/0,60/1,50→20/60/150 USD. A 100.000 solicitudes con fill 65%,show 85%,eCPM 0,60→33,15 USD. Restricciones infantiles pueden reducir demanda admisible; país/formato/plataforma/estacionalidad cambian rendimiento, sin tarifas geográficas inventadas. [AdMob demanda infantil](https://support.google.com/admob/answer/9655701?hl=en-GB), [variación eCPM](https://support.google.com/admob/answer/15337570?hl=en), consulta 03/10/2026.

Retención voluntaria incrementa sesiones; no autoriza navegación artificial, refrescos ni más tiempo de pantalla. Si se busca 1.400 después de valorar trabajo: web base `(1.400+5+200)/0,0039`≈ 411.539 usuarios; Android `(1.400+7+240)/0,0029835`≈ 552.037 MAU, todavía antes de impuestos y otros costes.

### Captación pagada: rechazada por economía planteada, no por una cifra de CAC inventada

`LTV ads = ingreso por usuario activo-mes × meses activos equivalentes de cohorte − costes variables`. `CAC = gasto total / nuevos usuarios activados atribuibles`. Base web 0,0039 USD/usuario-mes; móvil 0,0029835. Con 3 meses activos equivalentes, LTV bruto ≈ 0,0117 y 0,00895 USD. A CAC **hipotético** USD 0,30, payback ideal ≈ 76,9 meses activos web y 100,6 móvil, ignorando abandono/costes. No se afirma que CAC real sea 0,30; este ejemplo muestra cuán pequeño es el margen disponible. No recomendar adquisición pagada para recuperar inversión con banners infantiles.

### Tres alternativas complementarias, sin compras dirigidas a niños

| Opción | Precio HV a probar | Justificación y condición |
|---|---|---|
| Compra única quitar anuncios móvil |USD 2,99| Valor de tranquilidad/continuidad; prueba adulta y restauración de compra. Comisión hipotética 30% deja 2,093 antes de soporte/impuestos; tarifa real pendiente. No implementada ni prioritaria sin app con uso/ads admisibles. Restar impresiones perdidas de compradores para no contar dos veces. |
| Un pack original familiar/aula |**USD 12 piloto consolidado**, comparar después banda 5–15 |24–40 dibujos/variantes útiles + guía breve + uso permitido familiar/aula. Es precio por curación/tiempo ahorrado, no benchmark demostrado; gratis competidor limita disposición de pago. Construir uno y probar cinco ventas, no catálogo de packs. |
| Kit docente ampliado |USD 14,99 como segunda prueba posterior| Guías/dificultad/licencia que ahorren preparación; entrevistas y uso real. No suscripción ni promesas de objetivos curriculares sin pruebas. Solo si primer producto vende. |

En anexos se evaluó una oferta barata familiar y otra docente; **la decisión consolidada es una sola oferta inicial a USD 12** para no duplicar producción/soporte. Se ajustará contenido/precio/segmento con compradores, no se asumirá que enseñar un precio genera ventas.

### Ruta candidata simplificada a USD 1.400

**HV de mes con distribución ya conseguida**, no meta automática del trimestre:

```text
Anuncios admisibles: USD 200
100 ventas adultas × USD 12: USD 1.200
Ingreso bruto total: USD 1.400
Reserva cobro/plataforma 10% de ventas: USD 120
Reserva devoluciones 5% de ventas: USD 60
Costes fijos total combinado: USD 25
Operativo antes de trabajo/impuestos: USD 1.195
Con 40 h/mes valoradas a USD 10/h: USD 795 de resultado económico
```

Tasas/costes son reservas de planificación, no tarifas comprobadas de un procesador. Los dibujos originales ya deben tener derechos; si se contrata creación, añadir ese coste/amortización. Con Page RPM de USD 1,50, USD 200 de anuncios necesitan 133.334 PV elegibles y ≈ 51.283 usuarios web base. 100 compras a 1% requieren 10.000 **visitas adultas cualificadas a la oferta**, no diez mil niños ni visitas indiferenciadas; a 0,5% se necesitan 20.000; a 2%,5.000. Audiencias pueden solaparse: no sumarlas como personas únicas. Si solo llega a 3.000 visitas adultas a 1%,30 ventas=360 USD; los 200 ads adicionales tampoco están garantizados.

Para 1.400 operativos, manteniendo 200 ads y 25 coste, ventas necesarias `(1.400+25−200)/0,85=1.441,18`;121 ventas×12 dan **1.652 brutos y 1.409,20 operativos**. Para 1.400 después de valorar 40 h×10,160 ventas×12 + 200 ads dan **2.120 brutos**,1.807 operativos y 1.407 tras valoración laboral, antes de impuestos. A esta escala soporte/contenido podría consumir más 40 h; medirlo.

**Óptimo condicionado:** probar primero ads admisibles y la pequeña oferta adulta. Si esa oferta vende y la actividad infantil ayuda a descubrirla, ampliar el canal/pack por lotes. Si nadie compra pero el uso orgánico crece fuerte, continuar ads con RPM real. Si docentes compran sin usar editor, cambiar foco a recurso adulto puede rendir más por hora. No puede calcularse retorno esperado ni fecha de 1.400 sin probabilidad de captación/conversión; no confundir estas identidades contables con predicción.

Escenarios recomputables: [economics.cjs](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/economics.cjs) y [economics-results.json](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/economics-results.json). El script usa exactamente los supuestos consolidados de ads y mix; `node docs/audit-2026-10-03/economics.cjs` recalcula sin tocar producto.

## 8. Experimentos de crecimiento y medición

### Canales dirigidos a adultos

| Canal / audiencia | Mensaje | Esfuerzo y coste propuestos | Métrica y plazo | Continuar / abandonar |
|---|---|---|---|---|
| SEO temático / familias y docentes | «Actividad original de dinosaurios para colorear online e imprimir, sin cuenta». | 4–6 páginas útiles, 1–2 h cada una + 1 h/semana revisión; USD 0 extra si hosting actual basta. | Search Console: impresiones/clics por tema, aperturas de actividad y demanda de imprimible; 6–12 semanas. | Continuar temas con impresión creciente + uso; revisar indexación antes de atribuir cero visitas a falta de demanda. No escalar páginas si no se usan. |
| Comunidades adultas / familias | Mostrar una actividad y preguntar cuándo resulta útil, con permiso del moderador. | Hasta 1 h/semana, una o dos comunidades; USD 0. No enviar mensajes ahora. | Visitas cualificadas, actividades iniciadas y feedback adulto en 4 semanas. | Seguir si genera 10 conversaciones o 30 visitas útiles y uso; dejar canal tras 3 participaciones permitidas sin señal. No spam ni mensajes a menores. |
| Docentes/colaboradores | «Actividad lista para aula, derechos claros y versión imprimible». | 5–10 conversaciones voluntarias; 6 h iniciales + máximo 1 h/semana; muestra gratuita USD 0–20. | Uso en 3 aulas/familias y petición repetida o compra en 4–6 semanas. | Continuar si 3 de 5 prueban y al menos 2 repiten/piden otra; feedback sin uso no justifica catálogo. |
| Recomendación desde exportación adulta | Compartir archivo local y enlace opcional de actividad, sin datos del niño. | 2 h UI/contenido cuando exportación funcione; USD 0. | Adultos reportan recomendación y visitas referidas agregadas en 4 semanas. | Mantener si fácil y útil, sin interrumpir al niño. No añadir contactos, permisos ni viralidad obligatoria. |
| ASO Android / adultos que buscan offline | Capturas reales: sin cuenta, dibujos locales, continuar; anuncios/packs declarados honestamente. | 6–10 h de ficha/QA además de release; tasas de cuenta si no existen. | Conversión de ficha a instalación, primera actividad y regreso permitido; 4–6 semanas tras beta/publicación. | Solo abrir si 10 familias repiten y al menos 5 piden instalar/offline. No medir éxito por instalaciones sin uso. |
| Paid ads / adultos | Oferta específica de pack; no campaña para adquirir niños. | **No invertir ahora**; eventual prueba ≤USD 30 solo si margen/CAC real lo permite. | CAC por comprador adulto y contribución a 30 días. | Continuar únicamente si coste total por venta inferior al margen exigido y sin depender de ads infantiles para recuperar inversión. |

SEO debe aportar valor, no producir páginas que solo cambien animal/idioma/ciudad. Textos, previews y recursos originales; sin contenido sin derechos, compra de backlinks ni publicación diaria insostenible. [Google políticas de contenido a escala](https://developers.google.com/search/docs/essentials/spam-policies), consultado 03/10/2026. Una colección mensual bien verificada es una cadencia máxima propuesta, no obligación.

### Cinco experimentos de bajo coste

1. **Utilidad y primera sesión (días 8–30, 6–8 h, USD 0–20):** 5 adultos y 2 docentes revisan actividad; 6–10 sesiones infantiles acompañadas después de permisos. Medir tiempo a primer color, ayudas, errores, finalización/exportación. Pasar si ≥8/10 empiezan ≤30 s y ≥7/10 completan una tarea sin pérdida. Si falla, simplificar antes de captar tráfico. No inferir demanda de estas muestras pequeñas.
2. **Demanda de temas/SEO (días 15–60, 8 h, USD 0):** 4 páginas distintas y útiles con dibujos de derechos acreditados. Esperar indexación y distribuir enlaces en canales adultos permitidos. Umbral elegido: 100 visitas cualificadas acumuladas y ≥30 primeras actividades o 10 solicitudes adultas de recurso. Si hay impresiones sin clicks, revisar intención/título; si ni indexa, resultado de demanda inconcluso. No confundir sesiones de auditoría con usuarios.
3. **Regreso (días 25–60, 4 h, USD 0):** 10 familias usan una actividad y se invita al adulto a volver en 7 d; después ampliar a 20 si existe reclutamiento. Pasar si ≥5/20 regresan voluntariamente a continuar/otra actividad. Medición por seguimiento adulto o agregación local consentida; no fingerprint. Una invitación puede sesgar retorno: registrar esa limitación, no llamarlo D7 orgánico.
4. **Disposición de pago (días 31–70, 10–14 h, USD 0–30):** mostrar un pack original completo a adultos con contenido/licencia/precio visibles; pago/entrega solo en fase futura autorizada y con condiciones válidas. Probar primero una oferta, p.ej. USD 12, frente a recurso gratis distinto. Evidencia fuerte: ≥5 compradores no relacionados, ≤1 devolución de 5 y uso reportado; intención verbal/preorden sin cobro es señal débil. Con menos de 100 visitas cualificadas, cero ventas no decide todo el mercado. Si tras 300 visitas y dos mensajes claros sigue sin compra, cambiar valor/segmento antes de producir otro pack.
5. **Monetización publicitaria responsable (días 45–90, 6–8 h + cumplimiento pendiente, USD 0 extra técnico):** tras cierre legal/plataforma, una ubicación web permitida; Android opcional. Medir solicitudes, fill/show e ingresos finalizados, por país/página/forma agregados. Comparar experiencia con y sin slot, nunca clics infantiles. ≥10.000 PV elegibles y 4 semanas para una primera banda de RPM; menos implica mucha incertidumbre, no un benchmark. Si el anuncio perjudica actividad o aprobación no llega, continuar validación sin ads y priorizar oferta adulta. No comprar tráfico solo para fabricar esta muestra.

El experimento de inglés es una extensión del nº2/4 si los hitos se cumplen; no añadir un sexto frente simultáneo. No se han reclutado usuarios, enviado mensajes, procesado cobros ni iniciado experimentos durante esta auditoría.

### Embudo y eventos mínimos

```text
Adulto descubre → abre página útil → abre dibujo → primer color
                                              ↓
                                  exporta / guarda / continúa
                                              ↓
                                      regresa a otra sesión

Página/visita apta → solicitud permitida → impresión → ingreso
Zona adulta → ve oferta → compra → entrega → uso/devolución
```

| Etapa | Métrica mínima | Implementación actual / cambio necesario |
|---|---|---|
| Descubrimiento | Clics/búsquedas por tema; visitas adultas por canal | Search Console pendiente; home intenta `select_content`. No equiparar clic SEO y usuario único. |
| Abrir dibujo | `drawing_open` exitoso / apertura editor | `asset_selected` existe, no sustituye tiempo de carga/éxito. Registrar error de carga con código corto. |
| Primera actividad | `first_paint` una vez por dibujo/sesión; tasa de activación | Existe web; Flutter usa collector apagado. No transmitir cada toque ni trayectoria. |
| Calidad | tiempo hasta color en bandas; errores de relleno/carga/guardado | Hoy incompleto. Medir pruebas acompañadas antes de implantar analytics. |
| Guardado/continuidad | `local_save_success`, `local_save_failure`, `restore_success` | Existe `return_to_saved`; W1 impide helper y recuperación. Registrar éxito después de persistir. |
| Exportación | intención de exportar + éxito cuando navegador/API permita saberlo | `save_png` indica callback/enlace, no que usuario abrió archivo o compartió. No sobreinterpretar. |
| Regreso | regreso a 7/30 días por adulto o dispositivo local con condiciones válidas | Sin cuentas no identifica familia/persona entre dispositivos; GA con restricciones no entrega retención completa. Denominador y cobertura explícitos. |
| Publicidad | requests, fill, show rate, impresiones e ingreso finalizado | Consola AdSense/AdMob; no CTR infantil; Analytics no es fuente de liquidación. |
| Oferta adulta | vista de oferta agregada, pedido, bruto, devolución, contribución | No implementado. Sistema de cobro guarda solo lo necesario para pedido/obligaciones fiscales; separar de sesión infantil. |

Minimización: enum de tema/modo/plataforma/resultado y bandas de tiempo; evitar nombres, fecha de nacimiento exacta, escuela, geolocalización precisa, contactos, foto/voz, contenido de dibujos, trazos, texto libre de búsqueda e IDs publicitarios en analítica propia. No usar hash de IP como supuesto anonimato. El identificador persistente local también requiere analizar finalidad/reglas si se transmite. El almacenamiento estrictamente necesario del dibujo no autoriza analítica/marketing.

**Tablero semanal sencillo**, hoja local manual o documento, sin nuevo servicio: clics SEO por tema, aperturas exitosas, activación, fallos/100 actividades, pruebas de restauración, retorno adulto con cobertura, compradores/refunds, RPM o eCPM/fill/show por región/formato cuando existan, bruto, costes y horas. Comparar cohortes/métodos iguales y mostrar tamaño de muestra. Si no hay permiso para analytics del niño, usar pruebas consentidas, feedback adulto y métricas agregadas de adquisición/ventas; marcar embudo incompleto. No inferir «nadie vuelve» de falta de tracking.

## 9. Backlog y plan de 90 días

**B:** bloqueante para lanzar/promocionar comercialmente o monetizar, según se indica. **V:** necesario para validar negocio. **L:** mejora posterior. **P0/P1/P2:** orden de prioridad. Horas son estimaciones para una persona familiarizada con el proyecto; incertidumbre baja/media/alta, no compromisos de fecha. USD 0 significa sin servicio nuevo, **no trabajo gratis**. Cambios listados son para fase posterior, no ejecutados.

| Tarea / problema→resultado | Componente / clase | Horas e incertidumbre | Dependencias / coste | Fin verificable y evidencia que la justifica |
|---|---|---|---|---|
| A. Definir 4–7 acompañado, mercados piloto, país operador y meta bruto/neto | Producto/privacidad V-P0 | 2–4, media | Ninguna; USD 0 | Decisión escrita y límite de inversión; hoy faltan datos decisivos, DU cero tráfico. |
| B. Reparar helpers y cola flood fill | Web B-P0 | 4–8, baja-media | A para QA; USD 0 | Fixtures 100% + siguiente/paletas/autosave en ambos modos; fallos W1/W2 demostrados. |
| C. Hacer guardado/recuperación y exportación fiables | Web B-P0 | 5–9, media | B; USD 0 | 20 recorridos, cuota/fallo/cierre y archivos abiertos en navegadores; W1 y prueba de export no concluida. |
| D. Verificar procedencia y ordenar 24–40 dibujos | Compartido B-P0 comercial | 4–8, alta | A; USD 0 si derechos existen; compra/licencia cotizada aparte | Registro por asset, retirar de oferta lo no acreditado; 19 Gabby e inconsistencias de categorías. |
| E. Inventario datos, política y configuración de privacidad | Web/ads B-P0 monetización | 6–12, alta | A; revisión profesional cotizar, sin comprar ahora | HAR y SDK documentados, policy/contacto/rechazo/revocación consistentes; discrepancia actual. |
| F. Lienzo primero, paleta y acciones simples | Web V-P1 | 5–8, media | B/C; USD 0 | Primer lienzo visible a 360/390/768 + test 8/10 activación; evidencia viewport. |
| G. Entrevistas y sesiones acompañadas | Producto V-P1 | 6–10, media | D/F, autorizaciones; USD 0–20 | Tareas/errores/feedback adultos, 6–10 sesiones; ninguna investigación existente. |
| H. Medición mínima y tablero | Web/negocio V-P1 | 3–6, alta | E y G; USD 0 | Eventos permitidos con denominadores/cobertura o alternativa manual; mobile collector apagado. |
| I.4–6 páginas útiles, taxonomía y enlaces | Web/SEO V-P1 | 6–10, media | D/F; USD 0 | Indexación inspeccionada y experimento 100 visitas; fichas repetidas/catálogo parcial. |
| J. Un pack original adulto terminado + oferta | Contenido/comercial V-P1 | 8–14, alta | D/G, términos/cobro para vender; USD 0–30 inicial | Pack usable, licencia familiar/aula y entrega;5 compradores para señal inicial, no producción masiva. |
| K. Distribución y regreso/ventas, sin ads pagados | Adultos V-P1 | 10–16, alta | G/I/J; USD 0–30 | Registro canal, tiempo,20 familias retorno o 300 visitas oferta; cero público actual. |
| L. Una ubicación ads después de cumplir | Web B-P0 monetización / V | 4–8 técnica, alta en aprobación | E + aprobación/cuenta/CSP; revisión legal fuera del cap | Solicitudes/impresiones finalizadas, UX intacta; no ingresos observados. |
| M. Corregir autosave/ads Flutter y smoke test release | Android B-P0 publicación | 8–16, alta | Demanda de instalación, E, entorno deps/firma; cuenta si falta | Analyzer/tests concluidos, build firmado, lifecycle/offline/banner fallido/compartir; checks pendientes. |
| N. ASO/beta con familias | Android V-P1 | 6–10 + plazo tienda, alta | M y política audiencia; tasas cuenta |12 testers 14 d si aplica + activación/regreso; instalaciones no prueban valor. |
| O. Piloto breve en inglés con misma oferta | Web/comercial V-P2 | 4–8, alta | Núcleo estable y señal española; USD 0 | Visitas adultas y compras por hora comparables; expansión sin datos hoy. |
| P. Rehacer, previews Mis dibujos, iPad/iOS y automatizar assets | Compartido/iOS L-P2 | 10–25 cada frente, alta | Validación y presupuesto específico | Tests de regresión/release y beneficio medido; no acumularlos en trimestre inicial. |

**Plan recomendado de 10 h/semana (~130 h/13 semanas):** asignar 40 h hasta día 30,45 h días 31–60 y 45 h días 61–90 incluyendo soporte/medición/buffer. No caben todos los máximos de la tabla; Android e inglés son **ramas alternativas**, no dos obligaciones adicionales. Si privacidad/derechos requieren más tiempo/coste, recortar alcance y posponer anuncios, sin dejar en segundo plano guardado o consentimiento.

| Hito | Resultado y orden | Evidencia de decisión |
|---|---|---|
| Primera semana (~10 h) | A 2 h; B 4–5 h; inventario derechos 2 h; preparar reclutamiento 1–2 h. Cero activación comercial hasta resolver bloqueos. | Tests de W1/W2 y decisiones de país/segmento; checklist de dibujos cuya titularidad falta. |
| Día 30 (40 h acumuladas) | B/C terminados, catálogo pequeño acreditado, privacidad inventariada, UX simple; G iniciado y tablero/manual listo. |20 recorridos de guardado; ≥8/10 primeras actividades; feedback 5 adultos + 2 docentes. Si falla utilidad, reducir/ajustar. |
| Día 60 (85 h) |4–6 páginas útiles y distribución adulta; un pack piloto; experimento regreso; anuncios solo si E/L cierran. |100 visitas cualificadas o 10 conversaciones, primera señal de retorno y 5 ventas si oferta alcanzó muestra. Si distribución insuficiente, no declarar fracaso del producto ni publicar móvil para compensar. |
| Día 90 (130 h) | Decidir motor de ingresos con datos; si existe demanda, optar Android beta **o** piloto inglés; repetir solo canal/oferta con señal. | Conversión/margen/horas y banda de RPM si existe muestra. Ruta explícita hacia USD 1.400 o inversión detenida/limitada. |

**Opción 5 h/semana (~65 h), cap discrecional USD 100:** A 2 h, B 6 h, C 6 h, D 5 h, E 8 h técnica, F 5 h, G 7 h, H 3 h, I 6 h, J 8 h, revisión/buffer 4 h. Total 65 h. Distribuir entrevistas/distribución dentro de G/I/J; no abrir Android, iOS ni inglés; ads solo si no compite con fiabilidad y la revisión necesaria cabe. Al día 30 núcleo reparado y segmento; al 60 primera validación/SEO; al 90 oferta pequeña y decisión con muestra disponible. Si revisión legal no cabe, validar sin ads. Con esta disponibilidad, alcanzar USD 1.400 durante el trimestre no está sustentado sin señal comercial previa.

### Continuar, cambiar o detener

- **Continuar validación:** fiabilidad cierra, adultos usan el recurso, señal de regreso y al menos 5 compradores externos de una oferta original, o demanda orgánica creciente útil. Exigir 10–20 ventas y margen estable antes de ampliar catálogo/invertir más. Los umbrales son decisiones de gestión, no significancia estadística.
- **Cambiar estrategia:** uso infantil bueno pero retorno bajo→actividad imprimible/ocasional; regreso alto y petición de offline→Android; interés docente y compras→recursos de aula; tráfico español insuficiente tras confirmar indexación/distribución→piloto inglés. RPM bajo→mejor oferta/distribución adulta, no densidad infantil.
- **Frenar expansión y gasto:** derechos/cumplimiento no cerrables con presupuesto; ≥20 adultos cualificados + 10 sesiones muestran poca utilidad tras una iteración; o dos ofertas/mensajes con ≥300 visitas adultas cada una sin compras ni uso; o mantenimiento consume>5 h/semana sin tracción al día 90. Tráfico insuficiente da resultado inconcluso: limitar otro mes de adquisición ≤20 h antes de seguir construyendo.
- **Ruta a 1.400:** no multiplicar el mes inicial como tendencia. Reestimar cada mes con RPM/cobertura reales, cohortes, ventas/refunds y capacidad de producir/support. Si para llegar hacen falta cientos de miles de visitas y el mejor canal trae cientos sin crecimiento, objetivo no sustentado aún. Bajar la meta intermedia a 100/300/500 o concentrar esfuerzo en valor pagado al adulto; no prometer «óptimo» sin evidencia.

## 10. Preguntas pendientes, fuentes y límites

No es necesario volver a responder las preferencias ya dadas: español/inglés se analizan como opciones, edades/horas/presupuesto son recomendaciones, tráfico cero y monetización no publicada se incorporaron. Quedan cinco grupos de información para la fase siguiente:

1. **Operador/mercados:** país real del responsable, contacto comercial y primeros países a los que ofrecerá el servicio; esto cambia requisitos y disponibilidad de cobro.
2. **Cuentas/publicación:** estados exactos de AdSense/AdMob, tipo/fecha cuenta Play, si existen fichas Android/iOS y qué App IDs/vendor records corresponden. No compartir contraseñas, claves de firma ni secretos.
3. **Derechos:** quién creó cada dibujo, contrato/licencia/procedencia y evidencia comercial, especialmente Gabby/personajes reconocibles.
4. **Capacidad:** confirmar si 10 h/semana y cap 150 USD/90 d son viables, además de equipo Android/Mac/iPad disponible y presupuesto de revisión específica.
5. **Muestras reales:** métricas agregadas adultas, actividad, vuelta, ventas/refunds, RPM/eCPM/fill y costes cuando se consigan. USD 1.400 se interpreta bruto; si se necesita dinero personal neto, recalcular impuestos/remuneración y meta.

Fuentes externas oficiales y fecha están junto a cada conclusión; ampliar en anexos [Flutter](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/flutter-audit.md), [privacidad](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/privacy-research.md) y [mercado/economía](D:/DevAPG/ColoreameCanvas2/docs/audit-2026-10-03/market-economics.md). La conclusión consolidada de este archivo resuelve recomendaciones: 4–7 acompañado, español primero con inglés como experimento, web primero y Android condicional, publicidad moderada y una oferta adulta original, sin infraestructura nueva demostrablemente necesaria.

Límites: no cuentas publicitarias/tiendas privadas, no tráfico/ingreso auditado, no research de usuarios, no pruebas físicas móviles, no profiler/Lighthouse/HAR, no tests/build Flutter concluidos, no dictamen de derechos o jurisdicción. Documentación y fuentes vivas pueden cambiar; revalidar reglas al implementar. Ni checks de sintaxis ni una UI terminada demuestran negocio viable.

### Las cinco acciones concretas para empezar

1. Reparar el objeto compartido web y la cola del relleno, usando los fixtures de esta auditoría; después verificar guardar/restaurar y siguiente en ambos editores.
2. Elegir 4–7 acompañado como piloto, identificar país del operador y seleccionar 24–40 dibujos originales/licenciados con evidencia; excluir de la oferta lo no acreditado.
3. Poner lienzo/paleta/guardar al alcance en móvil, separar opciones adultas y completar pruebas de exportación/continuidad en dispositivos reales.
4. Validar con 5 adultos, 2 docentes y 6–10 sesiones acompañadas; preparar 4 páginas útiles y una única oferta adulta original, con tiempo/coste registrados.
5. Cerrar privacidad/aprobación antes de anuncios; medir demanda, primeras ventas y RPM cuando exista muestra, revisar al 30/60/90 y perseguir USD 1.400 con la ruta demostrada.

