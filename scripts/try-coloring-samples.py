from pathlib import Path
from coloring_generator import Options, write_result
ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'tools/coloring-generator/samples/inputs/balloon.png'
for threshold in [190,210,230]:
    for closing in [3,5]:
        result = write_result(source, ROOT / f'docs/qa-evidence/2026-10-07/coloring-generator/balloon-t{threshold}-c{closing}', Options(mode='outline',threshold=threshold,noise=64,close=closing,thickness=4), force=True)
        print(threshold,closing,result['region_count'],result['tiny_regions_under_16px'],result['line_pixel_ratio'])
