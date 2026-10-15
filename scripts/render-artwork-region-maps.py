"""Render unambiguous diagnostic colors from verified browser region seeds."""
from pathlib import Path
import json, sys, hashlib
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.tools/coloring-deps'))
import cv2 as cv
OUT=ROOT/'docs/qa-evidence/2026-10-14/artwork-checklist'
catalog=json.loads((ROOT/'base_png/catalog.json').read_text(encoding='utf-8'))
entries={e['slug']:e for e in catalog['drawings']}
report=json.loads((OUT/'browser-chromium.json').read_text(encoding='utf-8'))
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',16)
records=[]
for item in report['items']:
    source=ROOT/'web'/entries[item['slug']]['webSrc']
    assert hashlib.sha256(source.read_bytes()).hexdigest()==item['source_sha256']
    rgb=np.asarray(Image.open(source).convert('RGB')).copy()
    lines=(rgb.mean(axis=2)<=245).astype('uint8')
    count,labels,stats,_=cv.connectedComponentsWithStats(1-lines,connectivity=4)
    regions=item['geometry']['regions']
    assert count-1==len(regions)
    lookup=np.zeros((count,3),dtype='uint8'); used=set(); mappings=[]
    for r in regions:
        label=int(labels[r['y'],r['x']]); assert label and int(stats[label,cv.CC_STAT_AREA])==r['pixels']
        color=(r['id']*0x9e3779)&0xffffff
        assert color not in used; used.add(color)
        channels=[color>>16,(color>>8)&255,color&255]; lookup[label]=channels
        mappings.append({'id':r['id'],'rgb':channels})
    rgb[lines==0]=lookup[labels[lines==0]]
    image=Image.fromarray(rgb); draw=ImageDraw.Draw(image)
    for r in regions:
        if r['pixels']>=64:draw.text((r['x'],r['y']),str(r['id']),font=font,anchor='mm',fill='black',stroke_width=2,stroke_fill='white')
    target=OUT/item['slug']/'regions-chromium.png'; image.save(target)
    records.append({'slug':item['slug'],'source_sha256':item['source_sha256'],'map_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'colors':mappings})
(OUT/'region-map-colors.json').write_text(json.dumps({'method':'Unique RGB per region; CV four-connected components match every browser region seed and area. Diagnostic recoloring only.','items':records},indent=2)+'\n',encoding='utf-8')
print(f'{len(records)} maps, no repeated region colors; browser seeds and areas verified.')
