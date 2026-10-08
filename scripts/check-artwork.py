"""Technical artwork checks and review register; no rights/visual approval."""
from pathlib import Path
import argparse
import csv
import hashlib
import json
import numpy as np
from PIL import Image
from build_catalog import load_catalog


def inspect(catalog_path, output_root):
    catalog = load_catalog(catalog_path)
    rows = []
    for entry in catalog["drawings"]:
        source = catalog_path.parent / entry["file"]
        row = {"slug": entry["slug"], "category": entry["category"], "master_sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "technical": "passed", "manual_paint_export": "pending", "contours_visual": "pending", "evidence": ""}
        ratios = []
        for key, maximum in [("webSrc", 1200), ("thumbnailSrc", 360)]:
            filename = output_root / "web" / entry[key]
            with Image.open(filename) as raw:
                image = raw.convert("RGB")
                if max(image.size) > maximum or min(image.size) < 1:
                    raise ValueError(f"Dimensions: {entry['slug']} {key}")
                row[key + "_size"] = f"{image.width}x{image.height}"
                ratios.append(image.width / image.height)
                if key == "webSrc":
                    pixels = np.asarray(image).astype(np.int16)
                    colored = np.mean(np.max(pixels, axis=2) - np.min(pixels, axis=2) > 24)
                    row["colored_pixel_ratio"] = round(float(colored), 6)
                    if colored > .01:
                        raise ValueError(f"Color content incompatible with brush: {entry['slug']}")
                    row["protected_pixel_ratio"] = round(float(np.mean(np.mean(pixels, axis=2) < 245)), 6)
        if abs(ratios[0] - ratios[1]) > .01:
            raise ValueError(f"Aspect ratio: {entry['slug']}")
        rows.append(row)
    return rows


def main():
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report-dir", type=Path)
    args = parser.parse_args()
    rows = inspect(root / "base_png/catalog.json", root)
    if args.report_dir:
        args.report_dir.mkdir(parents=True, exist_ok=True)
        # Never overwrite accumulated human review evidence silently.
        csv_path = args.report_dir / "artwork-review.csv"
        if not csv_path.exists():
            with csv_path.open("w", encoding="utf-8", newline="") as stream:
                writer = csv.DictWriter(stream, fieldnames=list(rows[0]))
                writer.writeheader()
                writer.writerows(rows)
        (args.report_dir / "artwork-technical.json").write_text(json.dumps({"scope": "technical only; manual contour review and rights remain separate", "items": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(rows)} drawings: dimensions, ratios, black/white compatibility verified. Manual contour/paint review remains pending.")


if __name__ == "__main__":
    main()
