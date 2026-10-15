# PaintMe — Revisión técnica SEO-01 / SEO-02

Fecha: 13/10/2026. Alcance autorizado: revisión editorial del piloto existente, coherencia de enlaces y comprobación pública de rutas, host, robots, canonical y sitemap. Sin publicación de cambios.

## SEO-01: revisión editorial

Se revisaron las seis páginas existentes: categorías y guías de animales, dinosaurios y vehículos. Las categorías permiten elegir un dibujo por forma y detalle; las guías explican una actividad gratuita y cómo continuar en papel. No se consolidan porque cumplen funciones diferentes.

Cambios locales:

- En las tres guías, «Dibujos del pack» pasa a «Dibujos para esta actividad gratuita».
- La impresión se encuentra bajo «Para familias y docentes», coherente con los editores.
- Elegir un dibujo no requiere participación obligatoria del adulto. Se recomienda acompañamiento, especialmente para los más pequeños.
- Se corrige la tilde de «vehículos» en textos y metadatos; las rutas y slugs conservan `vehiculos`.
- El piloto inglés conserva su idioma y utiliza «For families and teachers»; explica que el acompañamiento es recomendado.

Las categorías de animales y dinosaurios se revisaron y no requirieron cambios. No se agregaron dibujos, páginas masivas, ofertas ni promesas pedagógicas.

## SEO-02: comprobación pública

Se consultó el sitio mediante solicitudes HTTP desde PowerShell (`Invoke-WebRequest`), siguiendo las redirecciones. El resultado corresponde al sitio accesible durante esta revisión, antes de publicar los nuevos ajustes editoriales.

| Comprobación | Resultado observado |
|---|---|
| URLs del sitemap público | 61 de 61 responden HTTP 200. |
| Canonical de esas páginas | 61 de 61 coinciden con su URL en el sitemap. |
| Noindex en URLs del sitemap | No detectado por la comprobación de metadatos. |
| Sitemap público frente al local | Coinciden, normalizando saltos de línea. |
| Robots público | HTTP 200; `Allow: /` y referencia a `https://www.paintme.club/sitemap.xml`. |
| Host del proyecto | `web/CNAME`: `www.paintme.club`. |
| `http://paintme.club/` | Destino efectivo `https://www.paintme.club/`, respuesta final 200. |
| `https://paintme.club/` | Mismo destino efectivo, respuesta final 200. |
| `http://www.paintme.club/` | Mismo destino efectivo, respuesta final 200. |

No se afirma el código de cada salto intermedio ni su carácter permanente: las consultas registraron el destino y la respuesta final.

Se comprobaron además tres recorridos públicos con parámetros, todos HTTP 200:

| URL solicitada | Canonical observado |
|---|---|
| `/paint.html?asset=dinosaurio&category=dinosaurios` | `https://www.paintme.club/paint.html` |
| `/brush.html?asset=auto&category=vehiculos` | `https://www.paintme.club/brush.html` |
| `/paint.html?lang=en&asset=triceratops` | `https://www.paintme.club/paint.html` |

No fue necesario cambiar robots, sitemap, rutas o host.

## Verificación local posterior a los cambios

- `node scripts/check-web.cjs`: 50 pruebas aprobadas; 63 rutas HTML/canonical, 61 URLs de sitemap y enlaces locales comprobados.
- Cuatro pruebas existentes seleccionadas de `tests/web-browser.test.cjs`, Chromium 155.0.8059.41 headless/Windows: piloto inglés en balde y pincel, navegación recíproca de idiomas y apertura del dibujo correcto desde páginas temáticas en ambos modos. Todas aprobadas.
- `git diff --check`: aprobado.

## Cierre y límites

SEO-01 y SEO-02 quedan **Hecho en su alcance técnico autorizado**. La revisión local posterior no comprueba que los ajustes editoriales nuevos estén publicados. No se hizo push, despliegue ni cambios de hosting.

Los checks de disponibilidad y SEO no acreditan autoría o derechos. CAT-02 sigue excluida por decisión previa del usuario; no se reactivó ni se declara un cierre comercial. CAT-04 conserva su QA gráfica/física independiente. Indexación, posicionamiento y demanda no se acreditan por respuestas HTTP ni por tests.

Al publicar estos cambios, comprobar que el contenido nuevo se sirve; cualquier cambio de rutas, host o páginas indexables requiere repetir las comprobaciones correspondientes.
