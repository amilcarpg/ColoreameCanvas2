from pathlib import Path
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/qa-evidence/2026-10-07/artwork-checklist'
catalog = json.loads((ROOT / 'base_png/catalog.json').read_text(encoding='utf-8-sig'))
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 15)
for offset in range(0, len(catalog['drawings']), 16):
    sheet = Image.new('RGB', (1120, 1120), 'white')
    draw = ImageDraw.Draw(sheet)
    for index, entry in enumerate(catalog['drawings'][offset:offset+16]):
        filename = OUT / entry['slug'] / 'regions-chromium.png'
        if not filename.exists():
            continue
        x, y = index % 4 * 280, index // 4 * 280
        with Image.open(filename) as raw:
            preview = ImageOps.contain(raw.convert('RGB'), (268, 252))
            sheet.paste(preview, (x+(280-preview.width)//2, y))
        draw.text((x+4, y+255), entry['slug'], fill='black', font=font)
    sheet.save(OUT / f'regions-sheet-{offset//16+1}.jpg', quality=92)
print('Hojas de regiones creadas con la evidencia disponible.')
before = Image.open(OUT / 'dinosaurio/brush-chromium-before-restore.png').convert('RGB')
after = Image.open(OUT / 'dinosaurio/brush-chromium-export.png').convert('RGB')
delta = np.abs(np.asarray(before).astype(np.int16) - np.asarray(after).astype(np.int16)).max(axis=2)
y, x = np.unravel_index(np.argmax(delta), delta.shape)
x, y = max(0, min(x-40, before.width-80)), max(0, min(y-40, before.height-80))
box = (x, y, x+80, y+80)
mask = np.zeros((*delta.shape, 3), dtype=np.uint8)
mask[delta > 0] = [255, 40, 40]
comparison = Image.new('RGB', (990, 380), 'white')
draw = ImageDraw.Draw(comparison)
for index, (label, frame) in enumerate([('Antes de recuperar', before), ('Después de recuperar', after), ('Píxeles alterados', Image.fromarray(mask))]):
    comparison.paste(frame.crop(box).resize((320,320), Image.Resampling.NEAREST), (index*330,40))
    draw.text((index*330+5,10), label, fill='black', font=font)
draw.text((5,365), f'Dinosaurio: recorte ({x},{y}) de 80x80 px, ampliado 4 veces.', fill='black', font=font)
comparison.save(OUT / 'restore-comparison.png')
