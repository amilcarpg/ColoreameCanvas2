"""Read-only inventory and contact sheets for the per-image checklist."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/qa-evidence/2026-10-07/artwork-checklist'

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    catalog = json.loads((ROOT / 'base_png/catalog.json').read_text(encoding='utf-8-sig'))
    mobile = json.loads((ROOT / 'flutter/assets/catalog.json').read_text(encoding='utf-8-sig'))
    rows = []
    for entry in catalog['drawings']:
        row = {k: entry[k] for k in ['slug', 'label', 'category', 'pack', 'difficulty', 'platforms']}
        variants = {'master': ROOT / 'base_png' / entry['file'], 'web': ROOT / 'web' / entry['webSrc'], 'thumbnail': ROOT / 'web' / entry['thumbnailSrc']}
        if 'flutter' in entry['platforms']:
            selected = next(e for e in mobile if e['slug'] == entry['slug'])
            variants['flutter'] = ROOT / 'flutter' / selected['asset']
        row['files'] = {}
        for role, filename in variants.items():
            payload = filename.read_bytes()
            with Image.open(filename) as raw:
                raw.load()
                rgba = np.asarray(raw.convert('RGBA')).astype(np.int16)
                visible = rgba[:, :, 3] >= 16
                spread = rgba[:, :, :3].max(axis=2) - rgba[:, :, :3].min(axis=2)
                record = {'path': filename.relative_to(ROOT).as_posix(), 'format': raw.format, 'width': raw.width, 'height': raw.height, 'bytes': len(payload), 'sha256': hashlib.sha256(payload).hexdigest(), 'colored_ratio': float(np.mean((spread > 24) & visible)), 'dark_ratio': float(np.mean((rgba[:, :, :3].mean(axis=2) <= 245) & visible)), 'transparent_ratio': float(np.mean(rgba[:, :, 3] < 255))}
                record['valid_png'] = raw.format == 'PNG' and min(raw.size) > 0 and record['dark_ratio'] > 0
                row['files'][role] = record
        w, t, m = (row['files'][r] for r in ['web', 'thumbnail', 'master'])
        row['dimensions_pass'] = max(w['width'], w['height']) <= 1200 and max(t['width'], t['height']) <= 360
        row['aspect_delta'] = abs(w['width'] / w['height'] - t['width'] / t['height'])
        row['master_aspect_delta'] = abs(w['width'] / w['height'] - m['width'] / m['height'])
        row['flutter_same_as_web'] = row['files'].get('flutter', {}).get('sha256') == w['sha256'] if 'flutter' in row['files'] else None
        row['rights_evidence'] = {key: entry.get(key) for key in ['author', 'source', 'license', 'rights', 'provenance', 'evidence'] if entry.get(key)}
        rows.append(row)
    report = {'scope': 'Independent Pillow decoding; no physical device or rights approval', 'items': rows}
    (OUT / 'static.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 15)
    for offset in range(0, len(rows), 16):
        sheet = Image.new('RGB', (1120, 1160), 'white')
        draw = ImageDraw.Draw(sheet)
        for i, row in enumerate(rows[offset:offset+16]):
            x, y = (i % 4) * 280, (i // 4) * 290
            with Image.open(ROOT / row['files']['web']['path']) as raw:
                preview = ImageOps.contain(raw.convert('RGB'), (268, 252))
                sheet.paste(preview, (x + (280-preview.width)//2, y))
            draw.text((x+5,y+255), row['slug'], fill='black', font=font)
            draw.text((x+5,y+275), row['difficulty'], fill='gray', font=font)
        sheet.save(OUT / f'originals-{offset//16+1}.jpg', quality=90)
    print(f'{len(rows)} imágenes inventariadas; variantes decodificadas y hojas de contacto creadas.')

if __name__ == '__main__':
    main()
