# Imágenes para PC y móvil

Análisis del proyecto, 15/10/2026.

## Recomendación

Conservar un maestro por dibujo y su proporción original. Adaptar el área de dibujo y los controles a la pantalla, con ajuste completo inicial, centrado y zoom para detalles. Una pantalla vertical puede mostrar un dibujo cuadrado sin recortarlo ni deformarlo. La web también se usa en teléfonos y puede tener un área de edición vertical.

El pipeline `scripts/build_catalog.py` ya genera assets web y Flutter desde el mismo maestro, con lado máximo de 1200 píxeles y proporción conservada, además de miniaturas. Tener archivos en carpetas distintas no significa tener composiciones diferentes. No hace falta duplicar manualmente el catálogo.

## Cuándo conviene una variante vertical

Para nuevas ilustraciones concebidas para teléfono (personaje de cuerpo entero, torre, árbol), una composición vertical puede aprovechar mejor el espacio. Debe ser una decisión artística del dibujo y funcionar también en PC. Recortar automáticamente un cuadrado puede cortar figuras, créditos o contornos y abrir regiones de relleno; estirarlo deforma la ilustración.

Si se necesita de verdad una composición alternativa del mismo dibujo, tratarla como variante con identidad y dimensiones propias, miniatura, revisión de contornos y guardado separado. La capa pintada se guarda en coordenadas del dibujo: sustituir un cuadrado por otro encuadre bajo el mismo identificador puede desalinear obras existentes. No basta escalar la capa cuando cambió la composición.

## Resolución y coste

Separar composición de resolución. Una versión más pequeña reduce descarga y memoria pero puede perder microregiones y precisión al ampliar. Una imagen RGBA de 1200×1200 ocupa aproximadamente 5,5 MiB por buffer decodificado; la app mantiene varios buffers e historial. El tamaño comprimido del PNG no representa ese consumo. Antes de añadir resoluciones específicas, medir memoria, latencia y calidad de zoom en un teléfono de prestaciones modestas.

## Cambio aplicado y siguiente decisión

Se corrigió Flutter para ajustar la imagen completa al área disponible, centrarla y convertir los toques una sola vez a coordenadas del dibujo. Dos pruebas de viewport comprueban el ajuste, el cambio de orientación y las coordenadas. Las pruebas Android usan una fuente cuadrada real de 1200×1200.

No se crearon versiones verticales ni se cambiaron los originales. Primero validar esta adaptación con usuarios y medir si el tamaño de las regiones exige zoom demasiado frecuente. Si ocurre, priorizar dibujos más simples o nuevas composiciones verticales; conservar compatibles las obras ya guardadas.
