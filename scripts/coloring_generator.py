"""Local image-to-coloring PNG generator and preview server. Preserves sources."""
from __future__ import annotations

import argparse
import base64
from dataclasses import asdict, dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
import hashlib
import json
import sys
import threading
import time

ROOT = Path(__file__).resolve().parents[1]
LOCAL_DEPS = ROOT / '.tools/coloring-deps'
if LOCAL_DEPS.is_dir():
    sys.path.insert(0, str(LOCAL_DEPS))
try:
    import cv2 as cv
    import numpy as np
    from PIL import Image, ImageOps
except ImportError as error:
    raise SystemExit('Instala las dependencias: python -m pip install -r scripts/requirements-coloring.txt') from error

MAX_INPUT_PIXELS = 16_000_000
MAX_UPLOAD_BYTES = 16 * 1024 * 1024
PROCESS_LOCK = threading.Lock()  # Also protects the deterministic OpenCV RNG.
SAMPLE_ROOT = ROOT / 'tools/coloring-generator/samples'
SAMPLES = [
    {'slug': 'tortoise', 'label': 'Tortuga de líneas', 'mode': 'outline'},
    {'slug': 'fox', 'label': 'Zorro a color', 'mode': 'color'},
    {'slug': 'balloon', 'label': 'Globo a lápiz', 'mode': 'outline', 'options': {'threshold': 230, 'noise': 64, 'close': 3}},
    {'slug': 'flower', 'label': 'Flor sin contornos', 'mode': 'color'},
    {'slug': 'house-photo', 'label': 'Foto de casa de madera', 'mode': 'photo'},
]


@dataclass(frozen=True)
class Options:
    mode: str = 'auto'
    size: int = 1200
    threshold: int = 165
    noise: int = 24
    close: int = 1
    thickness: int = 4
    colors: int = 6
    detail: str = 'simple'

    def validate(self):
        if self.mode not in {'auto', 'outline', 'color', 'photo'}:
            raise ValueError('Modo desconocido.')
        if self.detail not in {'simple', 'medium', 'detailed'}:
            raise ValueError('Nivel de detalle desconocido.')
        limits = {'size': (128, 2400), 'threshold': (1, 254), 'noise': (0, 2000), 'close': (0, 5), 'thickness': (1, 8), 'colors': (2, 12)}
        for field, (low, high) in limits.items():
            value = getattr(self, field)
            if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
                raise ValueError(f'{field}: debe ser un entero entre {low} y {high}.')


def decode(payload: bytes):
    if not payload or len(payload) > MAX_UPLOAD_BYTES:
        raise ValueError('La imagen debe pesar entre 1 byte y 16 MB.')
    try:
        with Image.open(BytesIO(payload)) as raw:
            if raw.width * raw.height > MAX_INPUT_PIXELS:
                raise ValueError('La imagen supera 16 millones de píxeles.')
            if raw.format not in {'PNG', 'JPEG', 'WEBP', 'BMP', 'TIFF'}:
                raise ValueError('Formato admitido: PNG, JPG, WEBP, BMP o TIFF.')
            raw.load()
            source_format = raw.format
            oriented = ImageOps.exif_transpose(raw).convert('RGBA')
            paper = Image.new('RGBA', oriented.size, 'white')
            return Image.alpha_composite(paper, oriented).convert('RGB'), source_format
    except (OSError, Image.DecompressionBombError) as error:
        raise ValueError('No se pudo decodificar la imagen.') from error


def remove_specks(mask, minimum):
    if minimum <= 1:
        return mask.copy(), 0
    count, labels, stats, _ = cv.connectedComponentsWithStats(mask, connectivity=8)
    keep = np.ones(count, dtype=np.uint8)
    keep[0] = 0
    rejected = np.where(stats[1:, cv.CC_STAT_AREA] < minimum)[0] + 1
    keep[rejected] = 0
    return keep[labels] * 255, len(rejected)


def topology(mask):
    count, labels, stats, _ = cv.connectedComponentsWithStats(255-mask, connectivity=4)
    edge_ids = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]])).tolist())
    regions = []
    for index in range(1, count):
        x, y, w, h, area = (int(v) for v in stats[index])
        # Prefer a point far from lines. A concave region's centroid can lie
        # outside it, and its nearest member may round onto a line in the UI.
        crop = (labels[y:y+h, x:x+w] == index).astype(np.uint8)
        distance = cv.distanceTransform(np.pad(crop,1), cv.DIST_L2, 5)[1:-1,1:-1]
        seed_y, seed_x = np.unravel_index(np.argmax(distance), crop.shape)
        regions.append({'id': index, 'pixels': area, 'touches_edge': index in edge_ids, 'seed': [x+int(seed_x), y+int(seed_y)], 'bbox': [x, y, w, h]})
    return labels, regions


def color_boundaries(rgb, options):
    smooth = cv.bilateralFilter(rgb, 9, 65, 65)
    lab = cv.cvtColor(smooth, cv.COLOR_RGB2LAB).astype(np.float32)
    # Lower lighting sensitivity; a palette still cannot infer semantic shapes.
    features = lab.copy(); features[:, :, 0] *= .35
    step = max(1, int(np.sqrt(rgb.shape[0]*rgb.shape[1]/40_000)))
    sample = np.ascontiguousarray(features[::step, ::step].reshape(-1, 3))
    k = min(options.colors, len(np.unique(sample, axis=0)))
    cv.setRNGSeed(0)
    _, _, centers = cv.kmeans(sample, k, None, (cv.TERM_CRITERIA_EPS+cv.TERM_CRITERIA_MAX_ITER, 50, .5), 1, cv.KMEANS_PP_CENTERS)
    # Merge close palette entries to avoid outlines between gentle gradients.
    parent = list(range(k))
    def find(i):
        while parent[i] != i:
            i = parent[i]
        return i
    for i in range(k):
        for j in range(i):
            if float(np.linalg.norm(centers[i]-centers[j])) < 20:
                parent[find(i)] = find(j)
    groups = np.array([find(i) for i in range(k)], dtype=np.uint8)
    labels = np.empty(rgb.shape[:2], dtype=np.uint8)
    for first in range(0, len(rgb), 64):
        strip = features[first:first+64]
        distance = ((strip[:, :, None, :]-centers[None, None, :, :])**2).sum(axis=3)
        labels[first:first+64] = groups[np.argmin(distance, axis=2)]
    labels = cv.medianBlur(labels, 5)
    edges = np.zeros(labels.shape, dtype=np.uint8)
    edges[:, 1:][labels[:, 1:] != labels[:, :-1]] = 255
    edges[1:, :][labels[1:, :] != labels[:-1, :]] = 255
    dark = (rgb.max(axis=2) < 95).astype(np.uint8)*255
    # Keep existing black strokes rather than outlining both sides of each one.
    # Large solid dark fills become outlines; small eye/nose details are kept.
    if float(np.mean(dark > 0)) > .003:
        distance = cv.distanceTransform(dark, cv.DIST_L2, 5)
        core = (distance > 9).astype(np.uint8)*255
        count, core_labels, stats, _ = cv.connectedComponentsWithStats(core, connectivity=8)
        large = np.zeros(count, dtype=np.uint8)
        large[np.where(stats[:, cv.CC_STAT_AREA] > rgb.shape[0]*rgb.shape[1]*.0008)[0]] = 1
        large[0] = 0
        interiors = large[core_labels]*255
        interiors = cv.dilate(interiors, cv.getStructuringElement(cv.MORPH_ELLIPSE, (17,17)))
        dark[interiors > 0] = 0
        edges = cv.bitwise_or(edges, dark)
    return edges


def extract_lines(rgb, options, mode):
    gray = cv.cvtColor(rgb, cv.COLOR_RGB2GRAY)
    if mode == 'color':
        return color_boundaries(rgb, options)
    if mode == 'photo':
        sigma = {'simple': 2.6, 'medium': 1.4, 'detailed': .7}[options.detail]
        smooth = cv.bilateralFilter(gray, 9, 80, 80)
        smooth = cv.GaussianBlur(smooth, (0, 0), sigma)
        edges = cv.Canny(smooth, 40, 100)
        # Recover a coarse silhouette for objects on a nearly uniform backdrop.
        # It remains a review aid, not semantic redrawing of arbitrary photos.
        lab = cv.cvtColor(cv.GaussianBlur(rgb, (0,0), 2), cv.COLOR_RGB2LAB).astype(np.float32)
        border = np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])
        background = np.median(border,axis=0)
        foreground = (np.linalg.norm(lab[:, :, 1:]-background[1:],axis=2) > 10).astype(np.uint8)*255
        foreground = cv.morphologyEx(foreground, cv.MORPH_CLOSE, np.ones((9,9),np.uint8))
        foreground = cv.morphologyEx(foreground, cv.MORPH_OPEN, np.ones((5,5),np.uint8))
        contours, _ = cv.findContours(foreground, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
        silhouette = np.zeros(gray.shape, dtype=np.uint8)
        selected = []
        for contour in contours:
            if cv.contourArea(contour) > rgb.shape[0]*rgb.shape[1]*.01:
                polygon = cv.approxPolyDP(contour, cv.arcLength(contour,True)*.002, True)
                selected.append(polygon)
                cv.drawContours(silhouette, [polygon], -1, 255, cv.FILLED)
        if selected:
            edges = cv.bitwise_and(edges, cv.dilate(silhouette, np.ones((15,15),np.uint8)))
            cv.drawContours(edges, selected, -1, 255, 1)
        return edges
    # Subtract broad lighting variation without magnifying paper texture.
    smooth = cv.GaussianBlur(gray, (0, 0), {'simple': 2.2, 'medium': .9, 'detailed': .35}[options.detail])
    background = cv.GaussianBlur(smooth, (0, 0), 25)
    normalized = cv.divide(smooth, np.maximum(background, 1), scale=255)
    # Local darkness extracts strokes while ignoring broad scan shadows.
    normalized_threshold = round(175+options.threshold*.18)
    _, local_mask = cv.threshold(normalized, normalized_threshold, 255, cv.THRESH_BINARY_INV)
    return local_mask


def fill_small_interiors(mask, minimum):
    if minimum <= 1:
        return mask.copy(), 0
    count, labels, stats, _ = cv.connectedComponentsWithStats(255-mask, connectivity=4)
    border = set(np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]])).tolist())
    small = [index for index in range(1,count) if stats[index,cv.CC_STAT_AREA] < minimum and index not in border]
    fill = np.zeros(count,dtype=np.uint8); fill[small] = 1
    result = mask.copy(); result[fill[labels] > 0] = 255
    return result, len(small)


def png(image):
    stream = BytesIO()
    image.save(stream, format='PNG', compress_level=9)
    return stream.getvalue()


def convert(payload: bytes, options=Options()):
    options.validate()
    started = time.perf_counter()
    source, source_format = decode(payload)
    initial_size = source.size
    master_size = min(max(initial_size), options.size)
    ratio = master_size/max(initial_size)
    work = source.resize((max(1, round(source.width*ratio)), max(1, round(source.height*ratio))), Image.Resampling.LANCZOS)
    rgb = np.asarray(work)
    with PROCESS_LOCK:
        cv.setNumThreads(1)
        hsv = cv.cvtColor(rgb, cv.COLOR_RGB2HSV)
        colored_ratio = float(np.mean((hsv[:, :, 1] > 60) & (hsv[:, :, 2] < 250)))
        mode = ('color' if colored_ratio > .04 else 'outline') if options.mode == 'auto' else options.mode
        raw = extract_lines(rgb, options, mode)
        raw, removed = remove_specks(raw, options.noise)
        _, before = topology(raw)
        repaired = raw.copy()
        if options.close:
            radius = options.close
            kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (radius*2+1, radius*2+1))
            repaired = cv.morphologyEx(repaired, cv.MORPH_CLOSE, kernel)
        if options.thickness > 1:
            repaired = cv.dilate(repaired, cv.getStructuringElement(cv.MORPH_ELLIPSE, (options.thickness, options.thickness)))
        repaired, removed_after = remove_specks(repaired, options.noise)
        repaired, filled_small = fill_small_interiors(repaired, options.noise if options.detail == 'simple' else options.noise//4)
        master = Image.fromarray(255-repaired).convert('RGB')
        # Process the actual web-size mask again after reducing the master.
        web_scale = min(1, 1200/max(master.size))
        web_size = tuple(max(1, round(v*web_scale)) for v in master.size)
        web_mask = cv.resize(repaired, web_size, interpolation=cv.INTER_AREA)
        web_mask = np.where(web_mask >= 127, 255, 0).astype(np.uint8)
        labels, regions = topology(web_mask)
        web = Image.fromarray(255-web_mask).convert('RGB')
        thumb = ImageOps.contain(web, (360, 360), Image.Resampling.LANCZOS)
        palette = np.array([[255, 255, 255]] + [[45+(i*71)%180, 45+(i*43)%180, 45+(i*97)%180] for i in range(len(regions))], dtype=np.uint8)
        map_pixels = palette[labels]
        map_pixels[web_mask > 0] = 0
        regions_image = Image.fromarray(map_pixels)
        tiny = [r for r in regions if r['pixels'] < 16]
        enclosed = [r for r in regions if not r['touches_edge'] and r['pixels'] >= 16]
        line_ratio = float(np.mean(web_mask > 0))
        warnings = []
        if mode == 'photo':
            warnings.append('Una foto conserva texturas y puede dejar contornos abiertos; revisar o redibujar antes de publicar.')
        if not enclosed:
            warnings.append('No se detectan regiones interiores grandes cerradas; revisar posibles fugas al exterior.')
        if len(tiny) > 20 or (len(tiny) > 5 and len(tiny) > len(regions)*.3):
            warnings.append('Hay demasiadas regiones diminutas; reducir detalle o mejorar el original.')
        if line_ratio > .35:
            warnings.append('Las zonas oscuras ocupan demasiado espacio; reducir grosor o ajustar extracción.')
        if line_ratio < .003:
            warnings.append('Se detectaron muy pocas líneas; ajustar contraste o modo.')
        if len(before) != len(regions):
            warnings.append('La reparación/grosor/redimensión cambió la conectividad; comprobar uniones y separaciones.')
        if options.mode == 'auto':
            warnings.append('La selección automática distingue color de líneas, pero no identifica fotografías con fiabilidad.')
        report = {
            'schemaVersion': 1, 'source_sha256': hashlib.sha256(payload).hexdigest(),
            'source_format': source_format, 'source_size': list(initial_size), 'options': asdict(options), 'mode_used': mode,
            'web_size': list(web_size), 'master_size': list(master.size), 'thumbnail_size': list(thumb.size),
            'regions': regions, 'region_count': len(regions), 'enclosed_regions_over_16px': len(enclosed),
            'tiny_regions_under_16px': len(tiny), 'line_pixel_ratio': line_ratio,
            'removed_line_components': int(removed+removed_after), 'regions_before_repair': len(before),
            'filled_small_interiors': filled_small,
            'changed_line_pixels': int(np.count_nonzero(raw != repaired)),
            'warnings': warnings, 'review_required': True,
            'technical_status': 'needs_review' if warnings else 'automatic_checks_passed_review_pending',
            'elapsed_ms': round((time.perf_counter()-started)*1000),
            'versions': {'pillow': Image.__version__, 'numpy': np.__version__, 'opencv': cv.__version__},
        }
    products = {name: png(image) for name, image in [('master', master), ('drawing', web), ('thumbnail', thumb), ('regions', regions_image)]}
    report['output_sha256'] = {name: hashlib.sha256(data).hexdigest() for name, data in products.items()}
    return products, report


def write_result(source, destination, options, force=False):
    source = Path(source).resolve(); destination = Path(destination).resolve()
    names = {name: destination / (name+'.png') for name in ['master', 'drawing', 'thumbnail', 'regions']}
    names['report'] = destination / 'report.json'
    if source in names.values():
        raise ValueError('La salida no puede reemplazar el original.')
    if not force and any(p.exists() for p in names.values()):
        raise ValueError('La salida ya existe; usa otra carpeta o --force para reemplazar resultados.')
    products, report = convert(source.read_bytes(), options)
    destination.mkdir(parents=True, exist_ok=True)
    for name, data in products.items():
        names[name].write_bytes(data)
    names['report'].write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return report


class PreviewHandler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send(self, status, body, content_type='application/json; charset=utf-8'):
        if isinstance(body, dict):
            body = json.dumps(body, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers(); self.wfile.write(body)

    def do_GET(self):
        if self.path == '/api/samples':
            return self.send(200, {'samples': SAMPLES})
        if self.path in {'/', '/index.html'}:
            return self.send(200, (ROOT / 'tools/coloring-generator/index.html').read_bytes(), 'text/html; charset=utf-8')
        if self.path == '/fill.js':
            return self.send(200, (ROOT / 'web/flood-fill.js').read_bytes(), 'text/javascript; charset=utf-8')
        for sample in SAMPLES:
            if self.path == '/samples/'+sample['slug']+'.png':
                file = SAMPLE_ROOT / 'inputs' / (sample['slug']+'.png')
                if file.exists():
                    return self.send(200, file.read_bytes(), 'image/png')
        return self.send(404, {'error': 'Archivo no encontrado.'})

    def do_POST(self):
        if self.path != '/api/convert':
            return self.send(404, {'error': 'Ruta no encontrada.'})
        # Only the local page may submit conversions; no arbitrary file reads.
        expected_origin = 'http://'+self.headers.get('Host', '')
        if self.headers.get('Origin') not in {None, expected_origin}:
            return self.send(403, {'error': 'Origen no permitido.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= MAX_UPLOAD_BYTES*2:
                raise ValueError('La solicitud supera el tamaño permitido.')
            request = json.loads(self.rfile.read(length))
            payload = base64.b64decode(request['image'], validate=True)
            options = Options(**request.get('options', {}))
            products, report = convert(payload, options)
            return self.send(200, {'images': {name: 'data:image/png;base64,'+base64.b64encode(data).decode('ascii') for name, data in products.items()}, 'report': report})
        except (ValueError, KeyError, TypeError) as error:
            return self.send(400, {'error': str(error)})
        except Exception:
            return self.send(500, {'error': 'No se pudo procesar esta imagen. Intenta con otro archivo o ajuste.'})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--serve', action='store_true', help='Abrir interfaz local en http://127.0.0.1:8787')
    parser.add_argument('--port', type=int, default=8787)
    parser.add_argument('--input', type=Path)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--samples', action='store_true', help='Convertir las cinco muestras originales del proyecto')
    parser.add_argument('--force', action='store_true')
    for name in ['mode', 'detail']:
        parser.add_argument('--'+name, default=getattr(Options(), name))
    for name in ['size', 'threshold', 'noise', 'close', 'thickness', 'colors']:
        parser.add_argument('--'+name, type=int, default=getattr(Options(), name))
    args = parser.parse_args()
    options = Options(**{name: getattr(args, name) for name in Options.__dataclass_fields__})
    options.validate()
    if args.serve:
        if args.port != 0 and not 1024 <= args.port <= 65535:
            parser.error('El puerto debe estar entre 1024 y 65535, o 0 para asignación automática.')
        server = ThreadingHTTPServer(('127.0.0.1', args.port), PreviewHandler)
        print(f'Generador local: http://127.0.0.1:{server.server_address[1]}', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()
        return
    if args.samples:
        output = args.out or SAMPLE_ROOT / 'outputs'
        for sample in SAMPLES:
            sample_options = Options(**{**asdict(options), 'mode': sample['mode'], **sample.get('options', {})})
            result = write_result(SAMPLE_ROOT / 'inputs' / (sample['slug']+'.png'), output / sample['slug'], sample_options, args.force)
            print(f"{sample['slug']}: {result['region_count']} regiones, {result['tiny_regions_under_16px']} diminutas, {result['elapsed_ms']} ms")
    elif args.input and args.out:
        report = write_result(args.input, args.out, options, args.force)
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        parser.error('Usa --serve, --samples, o --input <archivo> --out <carpeta>.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError) as error:
        print(f'Error: {error}', file=sys.stderr)
        sys.exit(1)
