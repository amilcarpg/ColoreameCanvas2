# PaintMe

Este repositorio contiene los dos clientes del producto:

- [`web/`](web/README.md): el sitio web estático actual, publicado con GitHub Pages.
- [`flutter/`](flutter/README.md): la aplicación móvil de Flutter para Android e iOS.

## Desarrollo

Para probar el sitio web:

```bash
cd web
python3 -m http.server 8000
```

Para ejecutar la app móvil:

```bash
cd flutter
flutter pub get --enforce-lockfile
flutter run --dart-define=PAINTME_ADS=disabled
```

Los dibujos maestros y su fuente técnica están en `base_png/`. El pipeline genera variantes y catálogos web/Flutter con distribución explícita por plataforma. Ver [mantenimiento del catálogo](docs/CATALOG-PIPELINE.md) y [product backlog](docs/PRODUCT-BACKLOG.md).

Las ofertas de pago y compras COM-01/02/03 están pospuestas. Para entorno Flutter, pruebas y configuración de anuncios apagados, ver [README móvil](flutter/README.md). Para validar Pages y preparar rollback, ver [runbook de despliegue](docs/DEPLOYMENT-RUNBOOK.md). Cambios y pruebas de esta sesión: [informe técnico](docs/implementation-2026-10-07/remaining-code.md).
