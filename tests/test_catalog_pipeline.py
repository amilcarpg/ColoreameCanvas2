from pathlib import Path
from tempfile import TemporaryDirectory
import copy
import hashlib
import json
import subprocess
import sys
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from build_catalog import load_catalog, generated_files, existing_pages


class CatalogPipelineTests(unittest.TestCase):
    def setUp(self):
        self.temporary = TemporaryDirectory(prefix="paintme-catalog-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        Image.new("RGB", (1600, 800), "white").save(self.root / "drawing.png")
        self.catalog = {"schemaVersion": 2, "categories": {"casas": "Casas"}, "drawings": [{"slug": "casa", "label": "Casa", "category": "casas", "theme": "casas", "difficulty": "simple", "pack": "casas", "keywords": ["casa"], "file": "drawing.png", "platforms": ["web", "flutter"], "webSrc": "assets/drawing.png", "thumbnailSrc": "assets/thumbs/drawing.png"}]}
        self.path = self.root / "catalog.json"

    def write(self, catalog=None):
        self.path.write_text(json.dumps(catalog or self.catalog), encoding="utf-8")

    def test_deterministic_outputs_leave_master_untouched(self):
        self.write()
        before = hashlib.sha256((self.root / "drawing.png").read_bytes()).digest()
        catalog = load_catalog(self.path)
        first = generated_files(catalog, self.root)
        self.assertEqual(first, generated_files(catalog, self.root))
        self.assertEqual(before, hashlib.sha256((self.root / "drawing.png").read_bytes()).digest())
        from io import BytesIO
        self.assertEqual(Image.open(BytesIO(first["web/assets/drawing.png"])).size, (1200, 600))
        self.assertEqual(Image.open(BytesIO(first["web/assets/thumbs/drawing.png"])).size, (360, 180))

    def test_rejects_duplicate_slugs(self):
        self.catalog["drawings"].append(copy.deepcopy(self.catalog["drawings"][0]))
        self.write()
        with self.assertRaisesRegex(ValueError, "Duplicate/invalid slug"):
            load_catalog(self.path)

    def test_existing_pages_are_idempotent_and_do_not_create_new_drawings(self):
        pages = self.root / 'web'
        (pages / 'dibujos').mkdir(parents=True)
        page = pages / 'dibujos/casa.html'
        page.write_text('<title>Casa</title><a href="../paint.html?asset=casa&category=navidad">Pintar</a>', encoding='utf-8')
        files = existing_pages(self.catalog, pages)
        self.assertEqual(list(files), ['web/dibujos/casa.html'])
        self.assertIn(b'category=casas', files['web/dibujos/casa.html'])
        page.write_bytes(files['web/dibujos/casa.html'])
        self.assertEqual(existing_pages(self.catalog, pages), files)

    def test_rejects_unknown_taxonomy(self):
        self.catalog["drawings"][0]["category"] = "inventada"
        self.write()
        with self.assertRaisesRegex(ValueError, "Unknown taxonomy"):
            load_catalog(self.path)

    def test_rejects_output_traversal(self):
        self.catalog["drawings"][0]["webSrc"] = "assets/../../drawing.png"
        self.write()
        with self.assertRaisesRegex(ValueError, "Unsafe PNG path"):
            load_catalog(self.path)

    def test_rejects_missing_master(self):
        self.catalog["drawings"][0]["file"] = "missing.png"
        self.write()
        with self.assertRaisesRegex(ValueError, "Missing master"):
            load_catalog(self.path)

    def test_explicit_platform_does_not_add_mobile_distribution(self):
        self.catalog["drawings"][0]["platforms"] = ["web"]
        self.write()
        files = generated_files(load_catalog(self.path), self.root)
        self.assertEqual(json.loads(files["flutter/assets/catalog.json"]), [])
        self.assertFalse(any("drawings_mobile" in name for name in files))

    def test_check_is_read_only_and_invalid_catalog_writes_nothing(self):
        self.write()
        output = self.root / "output"
        command = [sys.executable, str(ROOT / "scripts/build_catalog.py"), "--catalog", str(self.path), "--out-dir", str(output)]
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 1)
        self.assertFalse(output.exists())
        self.assertEqual(subprocess.run(command + ["--write"], capture_output=True).returncode, 0)
        self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)
        self.catalog["drawings"][0]["platforms"] = ["unknown"]
        self.write()
        bad_output = self.root / "invalid-output"
        command[command.index("--out-dir") + 1] = str(bad_output)
        self.assertEqual(subprocess.run(command + ["--write"], capture_output=True).returncode, 1)
        self.assertFalse(bad_output.exists())


if __name__ == "__main__":
    unittest.main()
