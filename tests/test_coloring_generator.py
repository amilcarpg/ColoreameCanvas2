from pathlib import Path
from tempfile import TemporaryDirectory
from io import BytesIO
import hashlib
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from coloring_generator import Options, convert, decode, remove_specks, topology, fill_small_interiors, write_result, cv, np, Image, MAX_INPUT_PIXELS
from PIL import ImageDraw


def payload(image):
    stream = BytesIO(); image.save(stream, format='PNG'); return stream.getvalue()


class ColoringGeneratorTests(unittest.TestCase):
    def test_concave_region_seed_has_clearance_from_its_outline(self):
        mask=np.full((180,180),255,np.uint8)
        cv.rectangle(mask,(20,20),(160,160),0,-1)
        cv.rectangle(mask,(55,20),(125,120),255,-1)
        labels,regions=topology(mask)
        region=regions[0];x,y=region['seed']
        self.assertEqual(int(labels[y,x]),region['id'])
        self.assertGreater(cv.distanceTransform(255-mask,cv.DIST_L2,5)[y,x],10)

    def test_png_jpeg_and_webp_inputs_produce_binary_png_with_regions(self):
        source=Image.open(ROOT/'tools/coloring-generator/samples/inputs/tortoise.png').convert('RGB')
        source.thumbnail((480,480))
        for format in ['PNG','JPEG','WEBP']:
            stream=BytesIO();source.save(stream,format=format)
            products,report=convert(stream.getvalue(),Options(mode='outline',size=480))
            with self.subTest(format=format):
                self.assertEqual(report['source_format'],format)
                self.assertEqual(set(np.unique(np.asarray(Image.open(BytesIO(products['drawing']))))),{0,255})
                self.assertGreater(report['enclosed_regions_over_16px'],0)

    def test_alpha_is_composited_on_white_without_hidden_rgb_artifacts(self):
        image = Image.new('RGBA', (160,160), (255,0,0,0))
        ImageDraw.Draw(image).rectangle((30,30,130,130),outline=(0,0,0,255),width=5)
        products, report = convert(payload(image), Options(mode='outline',size=160))
        pixels = np.asarray(Image.open(BytesIO(products['drawing'])))
        self.assertTrue(np.array_equal(pixels[0,0],[255,255,255]))
        self.assertEqual(set(np.unique(pixels)),{0,255})
        self.assertGreater(report['enclosed_regions_over_16px'],0)

    def test_noise_removal_preserves_large_outline_and_its_inside(self):
        mask = np.zeros((180,180),np.uint8)
        cv.rectangle(mask,(30,30),(140,140),255,3)
        mask[5,5] = 255; mask[175,175] = 255
        clean, removed = remove_specks(mask,10)
        self.assertEqual(removed,2)
        self.assertEqual(clean[30,70],255)
        labels, regions = topology(clean)
        self.assertNotEqual(labels[70,70],labels[0,0])

    def test_small_interior_cleanup_keeps_small_regions_on_border(self):
        mask = np.full((100,100),255,np.uint8)
        mask[1:3,1:3]=0; mask[0:2,98:100]=0
        clean, filled = fill_small_interiors(mask,5)
        self.assertEqual(filled,1)
        self.assertEqual(clean[1,1],255)
        self.assertEqual(clean[0,99],0)

    def test_small_gap_repair_disconnects_inside_from_outside(self):
        mask = np.zeros((160,160),np.uint8)
        cv.rectangle(mask,(30,30),(130,130),255,3)
        mask[28:33,79:81]=0
        labels, _ = topology(mask)
        self.assertEqual(labels[70,70],labels[0,0])
        repaired=cv.morphologyEx(mask,cv.MORPH_CLOSE,np.ones((5,5),np.uint8))
        labels, _ = topology(repaired)
        self.assertNotEqual(labels[70,70],labels[0,0])

    def test_flat_color_shapes_produce_white_interiors_and_closed_outlines(self):
        image=Image.new('RGB',(200,200),'white')
        draw=ImageDraw.Draw(image); draw.rectangle((30,30,170,170),fill='#ef7442');draw.ellipse((65,65,135,135),fill='#e5cd35')
        products,report=convert(payload(image),Options(mode='color',size=200,colors=3,close=1))
        output=np.asarray(Image.open(BytesIO(products['drawing'])))
        self.assertTrue(np.array_equal(output[45,45],[255,255,255]))
        self.assertGreaterEqual(report['enclosed_regions_over_16px'],2)

    def test_generated_originals_are_repeatable_and_have_exact_binary_web_masks(self):
        for slug in ['tortoise','fox','balloon','flower','house-photo']:
            source=(ROOT/f'tools/coloring-generator/samples/inputs/{slug}.png').read_bytes()
            mode='photo' if slug=='house-photo' else 'color' if slug in {'fox','flower'} else 'outline'
            options=Options(mode=mode,size=480)
            first, report=convert(source,options);second,_=convert(source,options)
            with self.subTest(slug=slug):
                self.assertEqual(first,second)
                self.assertTrue(report['review_required'])
                array=np.asarray(Image.open(BytesIO(first['drawing'])))
                self.assertEqual(set(np.unique(array)),{0,255})
                self.assertLessEqual(max(Image.open(BytesIO(first['thumbnail'])).size),360)

    def test_photo_never_claims_semantic_or_publication_approval(self):
        source=(ROOT/'tools/coloring-generator/samples/inputs/house-photo.png').read_bytes()
        _,report=convert(source,Options(mode='photo',size=320))
        self.assertTrue(report['review_required'])
        self.assertEqual(report['technical_status'],'needs_review')
        self.assertTrue(any('foto' in warning for warning in report['warnings']))

    def test_oversized_decode_is_rejected_before_loading_pixels(self):
        image=Image.new('1',(4001,4000),1)
        self.assertGreater(image.width*image.height,MAX_INPUT_PIXELS)
        with self.assertRaisesRegex(ValueError,'millones'):
            decode(payload(image))

    def test_invalid_image_and_out_of_range_options_are_rejected(self):
        with self.assertRaises(ValueError):decode(b'not a png')
        for options in [Options(mode='unknown'),Options(size=99999),Options(close=-1),Options(noise=True)]:
            with self.subTest(options=options),self.assertRaises(ValueError):options.validate()

    def test_existing_results_and_original_are_not_overwritten_implicitly(self):
        with TemporaryDirectory(prefix='paintme-coloring-') as temporary:
            root=Path(temporary);source=root/'source.png'
            source.write_bytes(payload(Image.new('RGB',(160,160),'white')))
            before=hashlib.sha256(source.read_bytes()).hexdigest()
            write_result(source,root/'result',Options(size=160))
            with self.assertRaisesRegex(ValueError,'ya existe'):write_result(source,root/'result',Options(size=160))
            self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),before)
            original=root/'drawing.png';original.write_bytes(source.read_bytes())
            with self.assertRaisesRegex(ValueError,'original'):write_result(original,root,Options(size=160),True)


if __name__=='__main__':unittest.main()
