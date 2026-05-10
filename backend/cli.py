from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from PIL import Image


OUTPUT_DIR = Path(__file__).resolve().parent / "output"


@dataclass
class ValidationIssue:
    level: str
    code: str
    message: str


@dataclass
class ImageStats:
    path: str
    width: int
    height: int
    mode: str
    has_alpha: bool
    black_pixel_ratio: float
    near_white_pixel_ratio: float
    estimated_regions: int | None = None


@dataclass
class ValidationResult:
    score: int
    status: str
    stats: ImageStats
    issues: list[ValidationIssue]


def load_png(path: Path) -> Image.Image:
    if not path.exists():
        raise FileNotFoundError(f"No existe el archivo: {path}")
    if path.suffix.lower() != ".png":
        raise ValueError("El archivo debe ser PNG.")
    image = Image.open(path)
    image.load()
    return image


def image_to_rgba_array(image: Image.Image) -> np.ndarray:
    return np.array(image.convert("RGBA"))


def make_line_mask(image: Image.Image, threshold: int = 180) -> np.ndarray:
    rgba = image_to_rgba_array(image)
    alpha = rgba[:, :, 3]
    rgb = rgba[:, :, :3]

    white_background = np.full_like(rgb, 255)
    alpha_factor = (alpha.astype(np.float32) / 255.0)[:, :, None]
    composited = (rgb * alpha_factor + white_background * (1.0 - alpha_factor)).astype(np.uint8)

    gray = cv2.cvtColor(composited, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    _, binary_inverse = cv2.threshold(blurred, threshold, 255, cv2.THRESH_BINARY_INV)
    return binary_inverse


def clean_line_mask(mask: np.ndarray, close_gaps: bool = True, thicken: bool = True) -> np.ndarray:
    cleaned = mask.copy()
    noise_kernel = np.ones((2, 2), np.uint8)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, noise_kernel, iterations=1)

    if close_gaps:
        close_kernel = np.ones((3, 3), np.uint8)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, close_kernel, iterations=1)

    if thicken:
        dilate_kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.dilate(cleaned, dilate_kernel, iterations=1)

    return cleaned


def save_line_art(mask: np.ndarray, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    line_art = np.where(mask > 0, 0, 255).astype(np.uint8)
    rgba = cv2.cvtColor(line_art, cv2.COLOR_GRAY2RGBA)
    rgba[:, :, 3] = 255
    Image.fromarray(rgba).save(output_path)


def detect_paint_regions(line_mask: np.ndarray, min_area: int = 80) -> tuple[np.ndarray, list[dict[str, Any]]]:
    paintable = np.where(line_mask > 0, 0, 255).astype(np.uint8)

    flood = paintable.copy()
    h, w = flood.shape
    flood_mask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(flood, flood_mask, (0, 0), 128)

    interior = np.where(flood == 255, 255, 0).astype(np.uint8)
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(interior, connectivity=4)

    region_map = np.zeros((h, w), np.uint16)
    regions: list[dict[str, Any]] = []
    region_id = 1

    for label in range(1, count):
        area = int(stats[label, cv2.CC_STAT_AREA])
        if area < min_area:
            continue

        x = int(stats[label, cv2.CC_STAT_LEFT])
        y = int(stats[label, cv2.CC_STAT_TOP])
        width = int(stats[label, cv2.CC_STAT_WIDTH])
        height = int(stats[label, cv2.CC_STAT_HEIGHT])
        cx, cy = centroids[label]

        region_map[labels == label] = region_id
        regions.append(
            {
                "id": region_id,
                "area": area,
                "bbox": {"x": x, "y": y, "width": width, "height": height},
                "centroid": {"x": round(float(cx), 2), "y": round(float(cy), 2)},
            }
        )
        region_id += 1

    return region_map, regions


def save_region_preview(region_map: np.ndarray, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    preview = np.zeros((*region_map.shape, 3), dtype=np.uint8)

    ids = np.unique(region_map)
    for region_id in ids:
        if region_id == 0:
            continue
        rng = np.random.default_rng(int(region_id))
        color = rng.integers(80, 245, size=3, dtype=np.uint8)
        preview[region_map == region_id] = color

    Image.fromarray(preview, mode="RGB").save(output_path)


def validate_png(path: Path, estimate_regions: bool = True) -> ValidationResult:
    image = load_png(path)
    rgba = image_to_rgba_array(image)
    height, width = rgba.shape[:2]
    alpha = rgba[:, :, 3]
    rgb = rgba[:, :, :3]

    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    black_ratio = float(np.mean((gray < 80) & (alpha > 16)))
    white_ratio = float(np.mean((gray > 235) | (alpha < 16)))

    issues: list[ValidationIssue] = []

    if width < 512 or height < 512:
        issues.append(ValidationIssue("error", "small_image", "La imagen deberia ser al menos 512x512."))
    elif width < 1024 or height < 1024:
        issues.append(ValidationIssue("warning", "low_resolution", "Mejor si la imagen llega a 1024x1024 o mas."))

    if black_ratio < 0.01:
        issues.append(ValidationIssue("error", "few_lines", "Hay muy pocos pixeles oscuros; no parece line-art."))
    elif black_ratio > 0.35:
        issues.append(ValidationIssue("warning", "too_many_dark_pixels", "Hay demasiada tinta negra; podria ser dificil pintar."))

    if white_ratio < 0.45:
        issues.append(ValidationIssue("warning", "busy_background", "El fondo no parece suficientemente blanco o transparente."))

    has_alpha = image.mode in ("RGBA", "LA") or "transparency" in image.info
    estimated_regions: int | None = None
    if estimate_regions:
        mask = clean_line_mask(make_line_mask(image), close_gaps=True, thicken=True)
        _, regions = detect_paint_regions(mask)
        estimated_regions = len(regions)
        if estimated_regions == 0:
            issues.append(ValidationIssue("error", "no_regions", "No se detectaron regiones cerradas para pintar."))
        elif estimated_regions < 3:
            issues.append(ValidationIssue("warning", "few_regions", "Se detectaron pocas regiones cerradas."))

    error_count = sum(issue.level == "error" for issue in issues)
    warning_count = sum(issue.level == "warning" for issue in issues)
    score = max(0, 100 - error_count * 35 - warning_count * 12)
    status = "excelente" if score >= 90 else "aceptable" if score >= 65 else "necesita_arreglo"

    stats = ImageStats(
        path=str(path),
        width=width,
        height=height,
        mode=image.mode,
        has_alpha=has_alpha,
        black_pixel_ratio=round(black_ratio, 4),
        near_white_pixel_ratio=round(white_ratio, 4),
        estimated_regions=estimated_regions,
    )
    return ValidationResult(score=score, status=status, stats=stats, issues=issues)


def process_png(path: Path, output_dir: Path = OUTPUT_DIR) -> dict[str, Any]:
    image = load_png(path)
    stem = path.stem
    output_dir.mkdir(parents=True, exist_ok=True)

    raw_mask = make_line_mask(image)
    clean_mask = clean_line_mask(raw_mask)
    region_map, regions = detect_paint_regions(clean_mask)

    line_art_path = output_dir / f"{stem}_lineart.png"
    regions_preview_path = output_dir / f"{stem}_regions_preview.png"
    regions_json_path = output_dir / f"{stem}_regions.json"
    report_path = output_dir / f"{stem}_report.json"

    save_line_art(clean_mask, line_art_path)
    save_region_preview(region_map, regions_preview_path)

    regions_payload = {"source": str(path), "region_count": len(regions), "regions": regions}
    regions_json_path.write_text(json.dumps(regions_payload, indent=2), encoding="utf-8")

    validation = validate_png(path)
    report_payload = {
        "validation": {
            "score": validation.score,
            "status": validation.status,
            "stats": asdict(validation.stats),
            "issues": [asdict(issue) for issue in validation.issues],
        },
        "outputs": {
            "line_art_png": str(line_art_path),
            "regions_preview_png": str(regions_preview_path),
            "regions_json": str(regions_json_path),
        },
    }
    report_path.write_text(json.dumps(report_payload, indent=2), encoding="utf-8")
    report_payload["outputs"]["report_json"] = str(report_path)
    return report_payload


def prompt_path() -> Path:
    value = input("Ruta del PNG: ").strip().strip('"').strip("'")
    return Path(value).expanduser().resolve()


def print_validation(result: ValidationResult) -> None:
    print("\nResultado")
    print(f"- Estado: {result.status}")
    print(f"- Score: {result.score}/100")
    print(f"- Tamano: {result.stats.width}x{result.stats.height}")
    print(f"- Modo: {result.stats.mode}")
    print(f"- Pixeles oscuros: {result.stats.black_pixel_ratio:.2%}")
    print(f"- Fondo blanco/transparente estimado: {result.stats.near_white_pixel_ratio:.2%}")
    if result.stats.estimated_regions is not None:
        print(f"- Regiones estimadas: {result.stats.estimated_regions}")

    if result.issues:
        print("\nObservaciones")
        for issue in result.issues:
            print(f"- [{issue.level}] {issue.message}")
    else:
        print("\nSin observaciones importantes.")


def print_outputs(payload: dict[str, Any]) -> None:
    print("\nArchivos generados")
    for label, output_path in payload["outputs"].items():
        print(f"- {label}: {output_path}")
    print(f"\nRegiones detectadas: {payload['validation']['stats']['estimated_regions']}")
    print(f"Estado: {payload['validation']['status']} ({payload['validation']['score']}/100)")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    while True:
        print("\nColoreame PNG CLI")
        print("1. Validar PNG")
        print("2. Crear line-art limpio")
        print("3. Detectar regiones pintables")
        print("4. Pipeline completo")
        print("5. Salir")

        option = input("Elige una opcion: ").strip()

        try:
            if option == "1":
                result = validate_png(prompt_path())
                print_validation(result)
            elif option == "2":
                path = prompt_path()
                image = load_png(path)
                mask = clean_line_mask(make_line_mask(image))
                output_path = OUTPUT_DIR / f"{path.stem}_lineart.png"
                save_line_art(mask, output_path)
                print(f"\nListo: {output_path}")
            elif option == "3":
                path = prompt_path()
                image = load_png(path)
                mask = clean_line_mask(make_line_mask(image))
                region_map, regions = detect_paint_regions(mask)
                preview_path = OUTPUT_DIR / f"{path.stem}_regions_preview.png"
                json_path = OUTPUT_DIR / f"{path.stem}_regions.json"
                save_region_preview(region_map, preview_path)
                json_path.write_text(
                    json.dumps({"source": str(path), "region_count": len(regions), "regions": regions}, indent=2),
                    encoding="utf-8",
                )
                print(f"\nRegiones detectadas: {len(regions)}")
                print(f"Preview: {preview_path}")
                print(f"JSON: {json_path}")
            elif option == "4":
                print_outputs(process_png(prompt_path()))
            elif option == "5":
                print("Hasta luego.")
                break
            else:
                print("Opcion invalida.")
        except Exception as exc:
            print(f"\nError: {exc}")


if __name__ == "__main__":
    main()
