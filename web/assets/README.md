# Recursos derivados

Los PNG de pintura y miniaturas se generan desde `base_png/` y `base_png/catalog.json`, en la raíz del repositorio. No agregar variantes a mano ni editar `web/assets-list.js` directamente.

Desde la raíz: `python scripts/build_catalog.py --write` y después `python scripts/build_catalog.py`. El generador conserva maestros, limita pintura a 1200 px y miniaturas a 360 px, y mantiene las rutas declaradas.

Ver [pipeline y controles](../../docs/CATALOG-PIPELINE.md). Generar una variante no acredita derechos ni contornos cerrados. Los recursos existentes siguen registrados; CAT-02 quedó excluida de esta entrega.
