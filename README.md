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
flutter run
```

Los dibujos web permanecen en `web/assets/`. Cuando comience la implementación móvil, moveremos los recursos realmente compartidos a una carpeta `shared/` para evitar duplicarlos.
