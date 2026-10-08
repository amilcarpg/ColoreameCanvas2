# Plan de ejecución — Ítems 21 a 31

Fecha: 07/10/2026. Fuente: [product backlog](PRODUCT-BACKLOG.md), [implementación 11–20](implementation-2026-10-07/web-eleven-twenty.md) y [pruebas pendientes](PRUEBAS-PENDIENTES.md).

Este plan ordena los once ítems por dependencias. No cambia sus estados a Hecho ni ejecuta código, despliegues, anuncios, cobros o comunicaciones. **CAT-02 sigue excluida por instrucción del usuario:** no se implementará su registro/filtro de derechos ni se considerará resuelta. Las tareas comerciales que dependen de ella pueden prepararse localmente; su cierre/publicación continúa condicionado.

## Ejecución local

[Resultado del 07/10/2026](implementation-2026-10-07/items-21-31.md): código disponible atendido, terceros apagados, MOB-02 previo incluido y pruebas técnicas concluidas. SEO-03 sigue condicionado; cierres externos y físicos constan en el backlog y pruebas pendientes. Las etapas de abajo conservan el plan original.

## Dependencias de entrada

| Dependencia | Estado observado | Efecto en este plan |
|---|---|---|
| WEB-05: estados reales de guardado | Hecho | DATA-02 puede usar resultados confirmados de persistencia. |
| WEB-06: exportación | Parcial; pruebas automatizadas aprobadas, dispositivos pendientes | DATA-02 puede medir archivo preparado/intención, nunca archivo abierto. Mantener QA física para cierre completo. |
| CAT-01: taxonomía | Web verificada; validación Flutter pendiente | SEO puede usar las categorías y slugs web actuales; el pendiente móvil no impide preparar plantillas web. |
| CAT-04: calidad por dibujo | Técnica/exportación automatizada hechas; revisión visual pendiente | Revisar contornos/legibilidad de los dibujos elegidos antes de cerrar páginas/recursos del piloto. |
| UX-03: home/contacto | Código listo; contacto del operador pendiente | PRIV-02 y cierre de UX-03 necesitan correo/URL real confirmado. |
| CAT-02: procedencia/filtro comercial | Excluida; derechos no acreditados por esta implementación | No cerrar salidas comerciales que exigen contenido autorizado. No eludir esta dependencia generando páginas o anuncios. |
| Operador, audiencia y mercados | Por confirmar | Determinan tratamiento de datos, política, CMP/proveedor y disponibilidad de servicios. Sin configuración autorizada, mantener terceros apagados. |
| Host/dominio canónico | Por verificar contra configuración y redirecciones reales | SEO-02 puede preparar validación; no inventar redirecciones de GitHub Pages ni dar el host por confirmado por un canonical. |
| Cuentas/proveedores de anuncios | Aprobaciones y registros de vendedor pendientes de confirmar | ADS-01/02 necesitan valores reales; no introducir placeholders públicos o IDs supuestos. |
| Flutter/Dart | SDK disponible 3.7.2; proyecto exige Dart ^3.11.5 | Preparar entorno compatible antes de analyzer/tests. Resolver entorno no implica ejecutar todo MOB-11 ni lanzar Android. |

## Secuencia propuesta

### Etapa 0 — Preparar las decisiones y el inventario

Registrar operador/contacto, audiencia/mercados, tratamientos deseados, servicios autorizados y host real. Pedir al responsable únicamente los datos faltantes necesarios para cerrar su rama; no contraseñas ni claves. Inventariar scripts, cookies/storage y preferencias actuales como **primera parte de PRIV-03**, antes de diseñar el cambio. Esta captura inicial es diagnóstico, no aprobación de la configuración actual.

Si faltan decisiones, avanzar con el código y las pruebas que mantienen terceros apagados. La confirmación de un host no resuelve derechos de contenido; una etiqueta «adultos» tampoco demuestra audiencia adulta.

### Etapa 1 — Privacidad y esquema de datos

1. **24 / PRIV-01:** diseñar e implementar estado central versionado, rechazo/revocación, carga diferida e invalidación de callbacks. Por defecto, sin servicios no autorizados. No conceder personalización o datos publicitarios automáticamente por aceptar.
2. **27 / DATA-01:** definir esquema mínimo y enumeraciones; normalizar `source`, tema/modo/plataforma/resultado y bandas de tiempo. Puede prepararse junto con PRIV-01; no enviar datos hasta existir tratamiento permitido.
3. **28 / DATA-02:** conectar apertura, primera pintura, guardado, restauración y exportación a sus resultados reales, usando PRIV-01 y DATA-01. Collector móvil sigue apagado hasta autorización de tratamiento.
4. **26 / PRIV-03, verificación final:** capturar red/cookies/storage antes de decidir, al rechazar, aceptar y revocar; probar el caso revocar mientras un script/callback espera. Revisar CSP mínima y cabeceras del host, con servicios de prueba/configuración autorizada.
5. **25 / PRIV-02:** integrar política y contacto confirmados que describan los flujos realmente observados; alinear enlaces web/app y preferencias.

El borrador de política puede prepararse mientras se implementa el control de datos. Su cierre necesita el inventario final y texto confirmado. Si la política exige cambiar un flujo, ajustar PRIV-01 y repetir la parte afectada de PRIV-03: no se considera una dependencia circular que autorice omitir pruebas.

### Etapa 2 — SEO sobre una muestra útil

6. **22 / SEO-02:** verificar host, canonical, robots, rutas y sitemap existente; preparar generación/validación desde las páginas admitidas. Puede avanzarse mientras se completa la etapa 1. Su salida comercial sigue condicionada por CAT-02/derechos y host confirmado.
7. **21 / SEO-01:** preparar 4–6 páginas útiles para adultos: preview, nivel gráfico, uso, impresión y relacionados. Usar taxonomía web ya verificada, probar dibujo/contornos del piloto y confirmar contacto/textos. Separar propósito de categoría/pack o consolidar duplicados reales. No crear nuevas fichas de contenido sin derechos acreditados.

No repetir lo ya hecho en CAT-01/03: las queries y tarjetas relacionadas existentes ya están sincronizadas. SEO-01 añade utilidad editorial y SEO-02 verifica configuración/publicabilidad; indexación/demanda requieren seguimiento real después de un despliegue autorizado.

### Etapa 3 — Publicidad preparada y condicionada

8. **30 / ADS-02:** validar vendedor/dominio/registro de `ads.txt`; preparar `app-ads.txt` solo cuando exista ficha móvil vinculada y vendedor confirmado. Puede hacerse antes de ADS-01, sin activar solicitudes publicitarias. Si no hay ficha móvil, esa parte queda pendiente justificada, sin archivo ficticio.
9. **29 / ADS-01:** preparar una única ubicación separada de herramientas, con modo sin ads, estados de carga/fallo y pruebas sin clics comerciales. Cerrar únicamente tras PRIV-01/02/03, derechos, configuración de audiencia admitida y aprobación de cuenta/proveedor. Revisar Auto Ads para que no inserte unidades en el editor.

Con CAT-02 excluida y derechos sin acreditar, la rama publicitaria comercial permanece condicionada. Se puede dejar un componente inactivo y comprobar su comportamiento mediante mocks; eso no equivale a anuncio aprobado o ingresos.

### Ramas independientes o posteriores

10. **31 / MOB-01:** preparar entorno compatible → implementar **MOB-02 primero** → implementar recuperación de autosave y flush de lifecycle → ejecutar tests y QA física. MOB-02 está fuera de los ítems 21–31, pero es una dependencia necesaria; no prometer persistencia fiable corrigiendo solo la cola de autosave. Añadir pruebas enfocadas de storage/autosave como parte de esta rama, sin declarar QA-03 completo. No requiere anuncios, ASO, firma release o publicación en tienda para comenzar la reparación.
11. **23 / SEO-03:** diferir hasta núcleo fiable, señal de utilidad/uso o comercial en español, oferta/recurso piloto definido y traducción revisada. Reutilizar privacidad/esquema/host ya verificados. Probar una landing y un recurso breve, con navegación de idioma y referencias canónicas/hreflang coherentes. Si hay oferta de pago, precio/moneda y contenido deben estar confirmados; no inventar ventas o checkout. Falta de señal mantiene la tarea Condicional.

Las ramas pueden trabajarse en paralelo por disponibilidad, pero no suman capacidad automáticamente. Con una sola persona recomiendo terminar el núcleo web de la etapa 1 antes de abrir trabajo móvil o inglés.

## Matriz completa por ítem

Las horas son las estimaciones orientativas del backlog; no incluyen esperas externas ni nueva creación de contenido. «Preparar» no equivale a cerrar.

| Ítem | Tarea / horas | Dependencias técnicas | Dependencias externas o pendientes | Entrega y prueba de cierre |
|---:|---|---|---|---|
| 21 | SEO-01 · 4–8 h | CAT-01 web, CAT-04 piloto, UX-03; coordinar SEO-02 para rutas/host | CAT-02 excluida/derechos; 4–6 textos/recursos aprobados, contacto | Páginas útiles, queries correctas, relacionados, canonical y enlaces; revisión editorial y visual. No cerrar derechos/indexación con un test. |
| 22 | SEO-02 · 2–4 h | Catálogo/páginas existentes, configuración de hosting | Host confirmado; CAT-02/derechos para publicación | Un host consistente, sitemap sin rutas rotas/inadmisibles, canonical de queries; respuestas/redirecciones verificadas en entorno real. |
| 23 | SEO-03 · 4–8 h | Núcleo web fiable; reutilizar SEO-02 y PRIV/DATA cuando se incluyan mediciones | Señal española, oferta definida, traducción y derechos | Piloto breve con recorrido coherente y medición permitida; no expansión de todo el catálogo. |
| 24 | PRIV-01 · 4–8 h | Inventario inicial de PRIV-03; módulo común y controles adultos existentes | Tratamientos/audiencia/mercados/proveedor/CMP cuando corresponda | Preferencias comunes, rechazo/revocación sin pérdida y sin solicitudes no autorizadas; mocks más red final. |
| 25 | PRIV-02 · 2–4 h | PRIV-01 y PRIV-03 final, UX-03/contacto | Identidad/contacto, texto y tratamientos confirmados | Política versionada web/app, enlaces únicos y descripción contrastada con flujos; no inventar datos del operador. |
| 26 | PRIV-03 · 3–6 h | Baseline al inicio; PRIV-01 para cierre, DATA-01/02 si instrumentados | Servicios permitidos, acceso al entorno/host | HAR/inventario depurado por estado, cookies/storage y CSP/cabeceras documentados; repetir ante cambios de política. |
| 27 | DATA-01 · 2–4 h | Contrato con PRIV-01; collectors web/móvil | Tratamientos permitidos para transmisión | Esquema versionado; source arbitrario/URL descartado o normalizado, sin trazos/búsquedas libres/datos personales; pruebas de entradas inválidas. |
| 28 | DATA-02 · 3–6 h | WEB-05 hecho, WEB-06 parcial; PRIV-01 y DATA-01 | Tratamiento autorizado; QA física de exportación pendiente | Éxito posterior a operación, first_paint único, errores explícitos, restauración obsoleta excluida; ninguna afirmación de archivo abierto. |
| 29 | ADS-01 · 3–6 h | PRIV-01/02/03; configuración válida y ADS-02 cuando se requiera registro | Derechos/CAT-02, audiencia, proveedor, cuenta aprobada | Una unidad inactiva o de prueba según configuración permitida; rechazo/fallo sin interrupción, sin ads en editor; cierre comercial solo con evidencias externas. |
| 30 | ADS-02 · 1–2 h | Archivos/configuración del dominio | Vendedor/cuenta/dominio y ficha móvil confirmados | Registros reales, entrega pública y verificación de consola; ads.txt web no sustituye app-ads.txt. |
| 31 | MOB-01 · 4–7 h | **MOB-02 previo, 4–7 h adicionales**; entorno compatible; tests enfocados | Equipo físico para suspensión/cierre; entorno Flutter preparado | Fallo→siguiente save exitoso, cola sin rechazo atascado, estados reales, navegación/lifecycle con última obra recuperable. |

## Orden de trabajo recomendado

**Inventario inicial y decisiones → PRIV-01 + DATA-01 → DATA-02 → PRIV-03 final → PRIV-02 → SEO-02 → SEO-01 → ADS-02 → ADS-01.**

**Rama móvil:** entorno compatible → MOB-02 → MOB-01 → tests/QA física. **Inglés:** SEO-03 solo tras la señal española y el piloto definido. Preparar SEO-02 y los datos de ADS-02 puede adelantarse sin esperar toda la cadena; transmitir datos/servir anuncios no.

## Capacidad y hitos

Los once ítems suman **32–63 h orientativas** si sus decisiones/dependencias están disponibles. Con MOB-02: **36–70 h**. Esto excluye preparar/cambiar SDK, resolver incompatibilidades, revisión jurídica, ilustración/traducción, reclutamiento/observación, dispositivos y esperas de cuentas/indexación. Las pruebas técnicas enfocadas están incluidas en la estimación de cada tarea; ampliaciones ajenas a esos criterios se reestiman.

Como provisión de capacidad, reservar 20% para integración/incidencias: aproximadamente **43–84 h**, sin convertirlo en promesa. A 10 h/semana son unas **5–9 semanas de trabajo disponible**; a 5 h/semana, **9–17 semanas**. Las ramas condicionadas y esperas externas pueden alargar el calendario o quedar diferidas. No hacer horas de inglés/ads únicamente para consumir esa provisión.

| Hito | Evidencia necesaria | Si falta una dependencia |
|---|---|---|
| H1: control web de terceros y datos | PRIV-01/DATA-01 y tests; defaults sin terceros no autorizados | Mantener todo envío externo apagado; continuar preparación local. |
| H2: medición/política verificables | DATA-02, red PRIV-03 y texto/contacto PRIV-02 | No declarar política definitiva ni recepción de métricas; registrar dato/decisión concreta faltante. |
| H3: muestra SEO preparada | SEO-02/01, enlaces y revisión del piloto | Mantener borradores sin publicar si host/derechos/contenido no están cerrados. |
| H4: ads técnicamente preparados | ADS-02/01, pruebas de errores/layout y evidencias externas | Componente inactivo; sin publicación o monetización automática. |
| H5: guardado Flutter reparado | MOB-02/01, tests concluidos y lifecycle físico | Código local con estado Parcial; no presentar parse/analyzer como build o prueba física. |
| H6: piloto inglés justificado | Señal española, traducción/oferta y SEO-03 probado | Mantener Condicional; no traducir el catálogo entero. |

## Registro durante la ejecución

Al terminar cada bloque, actualizar el backlog con **Hecho/Parcial/Condicional**, enlazar evidencia nueva fuera de `web/` y añadir lo restante a [PRUEBAS-PENDIENTES.md](PRUEBAS-PENDIENTES.md). Conservar resultados históricos. Repetir pruebas afectadas por cambios; no volver a ejecutar sin motivo toda la auditoría.

Cierre de código, cierre de QA física y autorización de publicación son estados distintos. Este plan no crea una autorización de despliegue o activación de servicios ni revoca la exclusión de CAT-02.
