"""Deterministic CAT-04 repairs from preserved originals; dry-run by default."""
from pathlib import Path
import argparse, sys, json, hashlib
from io import BytesIO
import numpy as np
from PIL import Image, ImageDraw, ImageOps
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.tools/coloring-deps'))
import cv2 as cv
from build_catalog import load_catalog, png_variant

PROFILES={
    'pony-magico': {'threshold':220,'closing':3},
    'pony-princesa': {'threshold':200,'closing':3},
    'gabby-camping': {'threshold':220,'closing':3,'preserve_bottom':14},
    'gabby-pintando': {'threshold':200,'closing':3,'preserve_bottom':30},
    'gabby-amigos': {'threshold':200,'closing':3,'preserve_top':100},
    'gabby-cumpleanos': {'threshold':200,'closing':3},
    'gabby-casa-magica': {'threshold':200,'closing':0},
}

def checked(path):
    resolved=path.resolve()
    if not resolved.is_relative_to(ROOT):raise ValueError('Repair paths must stay inside the project')
    return resolved

def topology(rgb):
    lines=(rgb.mean(axis=2)<=245).astype('uint8')
    count,labels,stats,_=cv.connectedComponentsWithStats(1-lines,connectivity=4)
    areas=stats[1:,cv.CC_STAT_AREA]
    return {'regions':int(count-1),'tiny_under_16px':int((areas<16).sum())},labels

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report-dir',type=Path,required=True)
    parser.add_argument('--write',action='store_true')
    args=parser.parse_args()
    report_dir=checked(args.report_dir)
    manifest=json.loads((report_dir/'imagegen-repairs.json').read_text(encoding='utf-8'))
    catalog=load_catalog(ROOT/'base_png/catalog.json')
    rows=[]
    for repair in manifest:
        slug=repair['slug'];entry=next(e for e in catalog['drawings'] if e['slug']==slug)
        original=checked(report_dir/'originals'/repair['original_file'])
        if hashlib.sha256(original.read_bytes()).hexdigest()!=repair['original_sha256']:raise ValueError('Original changed: '+slug)
        if entry['file']==repair['original_file']:raise ValueError('A repair must use a new master filename: '+slug)
        with Image.open(original) as image:before=np.asarray(image.convert('RGB')).copy()
        gray=before.mean(axis=2)
        if slug=='triceratops':
            if before.shape[:2]!=(1200,1200):raise ValueError('Unexpected Triceratops dimensions')
            lines=(gray<=245).astype('uint8')
            closed=cv.morphologyEx(lines,cv.MORPH_CLOSE,np.ones((9,9),np.uint8))
            patch=np.zeros(lines.shape,dtype=bool)
            # The single critical gap was localized by independently testing
            # each added connected component. Avoid a global contour closure.
            patch[731:749,187:203]=(closed>lines)[731:749,187:203]
            after=before.copy();after[patch]=0
            params={'method':'localized jaw closure','bbox':[187,731,16,18],'changed_pixels':int(patch.sum())}
        elif slug=='gabby-gato-flores':
            after=before.copy()
            boxes=[(535,0,110,100),(645,28,110,105)]
            for x,y,w,h in boxes:
                roi=before[y:y+h,x:x+w]
                lines=(roi.mean(axis=2)<=220).astype('uint8')
                lines=cv.morphologyEx(lines,cv.MORPH_CLOSE,np.ones((3,3),np.uint8))
                after[y:y+h,x:x+w]=np.repeat(((1-lines)*255)[:,:,None],3,axis=2)
            params={'method':'localized antenna-tip cleanup','boxes':boxes,'threshold':220,'closing':3}
        else:
            params=PROFILES[slug]
            lines=(gray<params['threshold']).astype('uint8')
            if params['closing']:lines=cv.morphologyEx(lines,cv.MORPH_CLOSE,np.ones((params['closing'],params['closing']),np.uint8))
            after=np.repeat(((1-lines)*255)[:,:,None],3,axis=2)
            # Preserve lettering and credits pixel-for-pixel in the master.
            if params.get('preserve_bottom'):after[-params['preserve_bottom']:]=before[-params['preserve_bottom']:]
            if params.get('preserve_top'):after[:params['preserve_top']]=before[:params['preserve_top']]
        if not np.all(after[np.all(before==0,axis=2)]==0):raise ValueError('Solid black artwork removed: '+slug)
        buffer=BytesIO();Image.fromarray(after).save(buffer,format='PNG',compress_level=9)
        master_bytes=buffer.getvalue()
        destination=checked(ROOT/'base_png'/entry['file'])
        before_stats,_=topology(before)
        after_stats,labels=topology(after)
        row={'slug':slug,'parameters':params,'before_master':before_stats,'after_master':after_stats,'changed_pixels':int(np.count_nonzero(np.any(before!=after,axis=2))),'solid_black_preserved':True,'sha256':hashlib.sha256(master_bytes).hexdigest(),'dimensions':[after.shape[1],after.shape[0]]}
        if slug=='triceratops':
            row['head_reaches_exterior']=bool(labels[300,500]==labels[0,0])
            if row['head_reaches_exterior']:raise ValueError('Jaw patch did not isolate the head')
        if slug=='gabby-gato-flores':
            row['left_antenna_reaches_exterior']=bool(labels[41,588]==labels[0,0])
            row['right_antenna_reaches_exterior']=bool(labels[89,697]==labels[0,0])
            if row['left_antenna_reaches_exterior'] or row['right_antenna_reaches_exterior']:raise ValueError('Antenna tips still connected to exterior')
        if args.write:
            destination.write_bytes(master_bytes)
            for key,maximum in [('webSrc',1200),('thumbnailSrc',360)]:
                content,size=png_variant(destination,maximum,entry.get('downsampleFilter','lanczos'))
                checked(ROOT/'web'/entry[key]).write_bytes(content)
                if key=='webSrc' and 'flutter' in entry['platforms']:checked(ROOT/'flutter/assets/drawings_mobile'/entry['file']).write_bytes(content)
                if key=='webSrc':
                    with Image.open(BytesIO(content)) as image:row['after_web'],_=topology(np.asarray(image.convert('RGB')))
            sheet=Image.new('RGB',(820,650),'white');draw=ImageDraw.Draw(sheet)
            for column,(title,pixels) in enumerate([('Original',before),('Reparado',after)]):
                preview=ImageOps.contain(Image.fromarray(pixels),(400,600))
                sheet.paste(preview,(column*410+(400-preview.width)//2,35))
                draw.text((column*410+8,8),title,fill='black')
            sheet.save(report_dir/(slug+'-repair-comparison.png'))
            repair.update(active_content='Deterministic repair from the preserved original; characters and credits retained',active_master_sha256=row['sha256'],deterministic_parameters=params)
        rows.append(row)
    if args.write:
        (report_dir/'deterministic-repairs.json').write_text(json.dumps({'authorization':'User explicitly approved Python pipeline cleanup in this chat on 14/10/2026','tool':'Project Python pipeline, Pillow/OpenCV; no ImageGen candidate incorporated','opencv':cv.__version__,'items':rows},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        (report_dir/'imagegen-repairs.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'written':args.write,'items':rows},ensure_ascii=False))

if __name__=='__main__':main()
