# Coloreame PNG Backend

CLI en Python para validar y preparar imagenes PNG para pintar.

## Instalacion

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Uso

```bash
python cli.py
```

El menu permite:

- Validar si un PNG parece apto para colorear.
- Crear una version line-art limpia.
- Detectar regiones cerradas pintables.
- Ejecutar el pipeline completo y exportar resultados.

Los resultados se guardan por defecto en `backend/output/`.

