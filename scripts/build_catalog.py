"""Deterministic technical assets/catalogs. Does not validate rights or publish."""
from pathlib import Path, PurePosixPath
from io import BytesIO
import argparse
import json
import re
import sys
from html import escape
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SAFE = re.compile(r"[a-z0-9-]{1,64}\Z")


def checked_path(value, prefix):
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or "\\" in value or not value.startswith(prefix) or path.suffix != ".png":
        raise ValueError(f"Unsafe PNG path: {value}")
    return path


def load_catalog(path):
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if data.get("schemaVersion") != 2 or not isinstance(data.get("categories"), dict):
        raise ValueError("Expected schemaVersion 2 and categories")
    slugs, outputs = set(), set()
    for entry in data["drawings"]:
        slug = entry["slug"]
        if not SAFE.fullmatch(slug) or slug in slugs:
            raise ValueError(f"Duplicate/invalid slug: {slug}")
        slugs.add(slug)
        if entry["category"] not in data["categories"] or entry["theme"] not in data["categories"]:
            raise ValueError(f"Unknown taxonomy: {slug}")
        if entry["difficulty"] not in ["simple", "medio", "detallado", "por-revisar"]:
            raise ValueError(f"Unknown detail level: {slug}")
        if not entry["platforms"] or len(set(entry["platforms"])) != len(entry["platforms"]) or set(entry["platforms"]) - {"web", "flutter"}:
            raise ValueError(f"Invalid platforms: {slug}")
        if Path(entry["file"]).name != entry["file"] or "\\" in entry["file"] or Path(entry["file"]).suffix != ".png":
            raise ValueError(f"Unsafe master path: {slug}")
        source = path.parent / entry["file"]
        if source.resolve().parent != path.parent.resolve():
            raise ValueError(f"Master outside catalog directory: {slug}")
        if not source.is_file():
            raise ValueError(f"Missing master: {source}")
        for name, prefix in [("webSrc", "assets/"), ("thumbnailSrc", "assets/thumbs/")]:
            checked_path(entry[name], prefix)
            if entry[name] in outputs:
                raise ValueError(f"Duplicate output path: {entry[name]}")
            outputs.add(entry[name])
        with Image.open(source) as image:
            image.verify()
        with Image.open(source) as image:
            if image.format != "PNG" or min(image.size) < 1 or image.width * image.height > 16_000_000:
                raise ValueError(f"Invalid master dimensions: {slug}")
    return data


def png_variant(source, maximum):
    with Image.open(source) as raw:
        image = raw.convert("RGBA")
        # Keep transparency on top of white consistent with both editors.
        paper = Image.new("RGBA", image.size, "white")
        image = Image.alpha_composite(paper, image).convert("RGB")
        if max(image.size) > maximum:
            ratio = maximum / max(image.size)
            image = image.resize(tuple(max(1, round(side * ratio)) for side in image.size), Image.Resampling.LANCZOS)
        buffer = BytesIO()
        image.save(buffer, format="PNG", optimize=False, compress_level=9)
        return buffer.getvalue(), image.size


def existing_pages(catalog, pages_root):
    """Synchronize existing pages only; do not create new indexed drawings."""
    files = {}
    entries = {item['slug']: item for item in catalog['drawings'] if 'web' in item['platforms']}
    indexed = {slug for slug in entries if (pages_root / 'dibujos' / (slug + '.html')).is_file()}

    def cards(items):
        return ''.join(f'<a class="card" href="../dibujos/{item["slug"]}.html"><img src="../{item["thumbnailSrc"]}" alt="{escape(item["label"])} para colorear" loading="lazy" /><strong>{escape(item["label"])}</strong></a>' for item in items)

    for folder in ['dibujos', 'categorias', 'packs']:
        for page in sorted((pages_root / folder).glob('*.html')):
            text = page.read_text(encoding='utf-8')
            if folder == 'dibujos':
                item = entries.get(page.stem)
                if not item:
                    continue
                category = item['category']
                label = escape(item['label'])
                description = f'{label} para colorear online gratis en la categoría de {escape(catalog["categories"][category]).lower()}.'
                text = re.sub(r'(<title>).*?(</title>)', lambda m: m[1] + label + ' para colorear online | PaintMe.club' + m[2], text)
                text = re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*(" />)', lambda m: m[1] + description + m[2], text)
                text = re.sub(r'(<meta property="og:title" content=")[^"]*(" />)', lambda m: m[1] + label + ' para colorear online | PaintMe.club' + m[2], text)
                text = re.sub(r'(<h1>).*?(</h1>)', lambda m: m[1] + label + ' para colorear online' + m[2], text)
                text = re.sub(r'(<p>).*?(</p>)', lambda m: m[1] + description + m[2], text, count=1)
                text = re.sub(r'(<h2>)Más dibujos de .*?(</h2>)', lambda m: m[1] + 'Más dibujos de ' + escape(catalog['categories'][category]) + m[2], text)
                text = re.sub(r'(class="preview"><img src="[^"]*" alt=")[^"]*(")', lambda m: m[1] + label + ' para colorear' + m[2], text)
            else:
                category = page.stem
                if category not in catalog['categories']:
                    continue
            selected = [item for slug, item in entries.items() if slug in indexed and item['category'] == category and (folder != 'dibujos' or slug != page.stem)]
            if folder == 'dibujos':
                selected = selected[:6]
            if selected:
                text = re.sub(r'(<div class="grid">).*?(</div>)', lambda m: m[1] + cards(selected) + m[2], text, flags=re.S)
            # Keep query links aligned with the catalog, including recategorized assets.
            text = re.sub(r'(asset=([a-z0-9-]+)&(?:amp;)?category=)[a-z0-9-]+', lambda m: m[1] + entries[m[2]]['category'] if m[2] in entries else m[0], text)
            files[f'web/{folder}/{page.name}'] = text.encode('utf-8')
    return files


def generated_files(catalog, source_root, pages_root=None):
    files, web, mobile = {}, [], []
    for entry in catalog["drawings"]:
        common = {key: entry[key] for key in ["label", "slug", "category", "pack", "theme", "difficulty", "keywords"]}
        common["featured"] = entry.get("featured", False)
        painting, paint_size = png_variant(source_root / entry["file"], 1200)
        thumbnail, thumb_size = png_variant(source_root / entry["file"], 360)
        if abs(paint_size[0] / paint_size[1] - thumb_size[0] / thumb_size[1]) > .01:
            raise ValueError(f"Aspect ratio mismatch: {entry['slug']}")
        if "web" in entry["platforms"]:
            web.append({**common, "src": entry["webSrc"], "thumbnailSrc": entry["thumbnailSrc"], "description": f"{entry['label']}: dibujo para colorear en {catalog['categories'][entry['category']]}."})
            files["web/" + entry["webSrc"]] = painting
            files["web/" + entry["thumbnailSrc"]] = thumbnail
        if "flutter" in entry["platforms"]:
            asset = "assets/drawings_mobile/" + entry["file"]
            mobile.append({**common, "asset": asset})
            files["flutter/" + asset] = painting
    def encoded(value):
        return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    files["web/assets-list.js"] = b"// Generated by scripts/build_catalog.py; edit base_png/catalog.json.\nwindow.ASSETS = " + encoded(web).rstrip() + b";\n"
    files["web/catalog-meta.js"] = b"// Generated taxonomy.\nwindow.PaintMeCatalog = " + encoded({"categories": catalog["categories"]}).rstrip() + b";\n"
    files["flutter/assets/catalog.json"] = encoded(mobile)
    categories = [(slug, label) for slug, label in catalog["categories"].items() if any(item["category"] == slug for item in mobile)]
    dart = "// Generated by scripts/build_catalog.py.\nimport 'models.dart';\n\nconst catalogCategories = <Category>[\n"
    dart += "".join(f"  Category({json.dumps(slug)}, {json.dumps(label, ensure_ascii=False)}),\n" for slug, label in categories)
    files["flutter/lib/catalog_categories.dart"] = (dart + "];\n").encode("utf-8")
    if pages_root is not None:
        files.update(existing_pages(catalog, pages_root))
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--catalog", type=Path, default=ROOT / "base_png/catalog.json")
    parser.add_argument("--out-dir", type=Path, default=ROOT)
    parser.add_argument("--write", action="store_true", help="Write generated outputs; default only checks")
    args = parser.parse_args()
    catalog = load_catalog(args.catalog.resolve())
    files = generated_files(catalog, args.catalog.resolve().parent, ROOT / 'web')
    stale = []
    for relative, content in files.items():
        destination = args.out_dir.resolve() / relative
        if destination.exists() and destination.read_bytes() == content:
            continue
        stale.append(relative)
        if args.write:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(content)
    print(f"{len(catalog['drawings'])} masters; {len(files)} deterministic outputs; {len(stale)} {'updated' if args.write else 'out of date'}.")
    if stale and not args.write:
        print("\n".join(stale))
        return 1
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, KeyError, OSError, TypeError) as error:
        print(f"Catalog validation failed: {error}", file=sys.stderr)
        sys.exit(1)
