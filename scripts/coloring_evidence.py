"""Build visual evidence and semantic probes for the five generated examples."""
from pathlib import Path
import json
import sys
import hashlib
sys.path.insert(0,str(Path(__file__).resolve().parent))
from coloring_generator import ROOT,SAMPLES,SAMPLE_ROOT,Image,np,topology
from PIL import ImageDraw,ImageFont

evidence=ROOT/'docs/qa-evidence/2026-10-07/coloring-generator'
evidence.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
sheet=Image.new('RGB',(1180, len(SAMPLES)*410+65),'#f4f3ed')
draw=ImageDraw.Draw(sheet)
draw.text((20,18),'Original',fill='#25352c',font=font)
draw.text((410,18),'PNG para colorear',fill='#25352c',font=font)
draw.text((800,18),'Mapa de regiones',fill='#25352c',font=font)
stats=[]
for index,sample in enumerate(SAMPLES):
    slug=sample['slug'];directory=SAMPLE_ROOT/'outputs'/slug
    report=json.loads((directory/'report.json').read_text(encoding='utf-8'))
    y=65+index*410
    for column,source in enumerate([SAMPLE_ROOT/'inputs'/(slug+'.png'),directory/'drawing.png',directory/'regions.png']):
        image=Image.open(source).convert('RGB');image.thumbnail((360,360))
        sheet.paste(image,(20+column*390,y))
    draw.text((20,y+363),sample['label'],fill='#25352c',font=small)
    draw.text((410,y+363),f"{report['region_count']} regiones / {report['enclosed_regions_over_16px']} interiores / {report['tiny_regions_under_16px']} diminutas",fill='#25352c',font=small)
    variants={}
    for kind in ['drawing','master','thumbnail','regions']:
        file=directory/(kind+'.png')
        with Image.open(file) as variant:
            variant.verify()
        with Image.open(file) as variant:
            variants[kind]={'size':list(variant.size),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
    stats.append({'slug':slug,'regions':report['region_count'],'closed':report['enclosed_regions_over_16px'],'tiny':report['tiny_regions_under_16px'],'milliseconds':report['elapsed_ms'],'warnings':report['warnings'],'variants':variants})
sheet.save(SAMPLE_ROOT/'comparison-final.jpg',quality=92)
# Both intended cloud interiors are open; the balloon panel is a closed control.
image=Image.open(SAMPLE_ROOT/'outputs/balloon/drawing.png').convert('RGB')
mask=(np.asarray(image)[:,:,0]<128).astype(np.uint8)*255
labels,regions=topology(mask)
probes=[]
for name,x,y in [('nube izquierda',165,640),('nube derecha',1000,785),('panel cerrado del globo',320,410)]:
    region_id=int(labels[y,x]);region=next((r for r in regions if r['id']==region_id),None)
    probes.append({'name':name,'seed':[x,y],'region_id':region_id,'connected_to_edge':region['touches_edge'] if region else None,'pixels':region['pixels'] if region else None})
leak=np.asarray(image).copy();external=labels==int(labels[0,0]);leak[external]=[250,206,149]
Image.fromarray(leak).save(evidence/'balloon-exterior-probe.png')
exports=[]
for file in sorted(evidence.glob('*.png')):
    if file.stem.startswith(('chromium-','webkit-')) and any(file.stem.endswith(suffix) for suffix in ['-download','-paint','-brush']):
        with Image.open(file) as image:
            image.verify()
        with Image.open(file) as image:
            exports.append({'file':file.name,'format':image.format,'size':list(image.size),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
summary={'samples':stats,'semantic_probes':probes,'received_pngs_independently_decoded':exports}
(evidence/'sample-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(stats)} muestras; {len(exports)} PNG recibidos verificados con Pillow; {len(probes)} sondas semánticas.')
