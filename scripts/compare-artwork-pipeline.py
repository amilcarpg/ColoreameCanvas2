"""Diagnose byte differences reported by build_catalog without rewriting assets."""
from pathlib import Path
from io import BytesIO
import json
import numpy as np
from PIL import Image
from build_catalog import load_catalog, png_variant

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/qa-evidence/2026-10-07/artwork-checklist'
catalog = load_catalog(ROOT / 'base_png/catalog.json')
rows = []
for entry in catalog['drawings']:
    source = ROOT / 'base_png' / entry['file']
    for role, relative, maximum in [('web', 'web/' + entry['webSrc'], 1200), ('thumbnail', 'web/' + entry['thumbnailSrc'], 360)]:
        expected, size = png_variant(source, maximum)
        actual = (ROOT / relative).read_bytes()
        if expected == actual:
            continue
        with Image.open(BytesIO(expected)) as image:
            expected_pixels = np.asarray(image.convert('RGBA')).astype(np.int16)
        with Image.open(BytesIO(actual)) as image:
            actual_pixels = np.asarray(image.convert('RGBA')).astype(np.int16)
        delta = np.abs(actual_pixels - expected_pixels)
        rows.append({'slug': entry['slug'], 'role': role, 'path': relative, 'pixel_equal': bool(np.array_equal(expected_pixels, actual_pixels)), 'changed_pixels': int(np.count_nonzero(np.any(delta > 0, axis=2))), 'max_channel_delta': int(delta.max())})
        if role == 'web' and 'flutter' in entry['platforms']:
            rows.append({**rows[-1], 'role': 'flutter', 'path': 'flutter/assets/drawings_mobile/' + entry['file']})
(OUT / 'pipeline-differences.json').write_text(json.dumps({'byte_mismatches': len(rows), 'items': rows}, indent=2), encoding='utf-8')
print(json.dumps(rows))
