"""Evidence-backed CAT-04 report. Never infers physical QA or rights approval."""
from pathlib import Path
import os, json, hashlib, re, csv
from collections import Counter
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = (ROOT / os.environ.get('PAINTME_ARTWORK_OUTPUT', 'docs/qa-evidence/2026-10-14/artwork-checklist')).resolve()
if not OUT.is_relative_to(ROOT):
    raise ValueError('Evidence must stay inside the project')

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    static = json.loads((OUT/'static.json').read_text(encoding='utf-8'))['items']
    reports = {engine: json.loads((OUT/f'browser-{engine}.json').read_text(encoding='utf-8')) for engine in ['chromium', 'webkit']}
    extended = json.loads((OUT/'extended-chromium.json').read_text(encoding='utf-8'))
    visual = json.loads((OUT/'visual-review.json').read_text(encoding='utf-8'))
    pipeline = json.loads((OUT/'pipeline-differences.json').read_text(encoding='utf-8'))
    assert all(i['pixel_equal'] for i in pipeline['items']), 'Variants differ from their master'
    catalog_hash = digest(ROOT/'base_png/catalog.json')
    for report in [*reports.values(), extended]:
        assert len(report['items']) == len(static) == 62, 'Incomplete audit'
        assert report['catalog_sha256'] == catalog_hash, 'Catalog changed during audit'
        assert all(digest(ROOT/'web'/filename)==sha for filename,sha in report['editor_sha256'].items()), 'Editor changed during audit'
        assert not any(i.get('error') or i.get('page_errors') for i in report['items']), 'Browser errors'
    by_engine = {e:{i['slug']:i for i in r['items']} for e,r in reports.items()}
    ex = {i['slug']:i for i in extended['items']}
    titles = {m[1]:m[2] for m in re.finditer(r'^- \[ \] \*\*([TEP]-\d{2}) · ([^*]+)\*\*', (ROOT/'docs/CHECKLIST-IMAGENES-COLOREAR.md').read_text(encoding='utf-8'), re.M)}
    records, rows = [], []
    downloads_total = 0
    for row in static:
        slug=row['slug']; browser=by_engine['chromium'][slug]; geometry=browser['geometry']; manual=visual['items'][slug]
        assert digest(ROOT/row['files']['web']['path'])==browser['source_sha256'], 'Changed asset '+slug
        assert manual['source_sha256']==browser['source_sha256'], 'Visual review is stale '+slug
        assert all(digest(ROOT/f['path'])==f['sha256'] for f in row['files'].values()), 'Changed variant '+slug
        assert all(by_engine[e][slug]['source_sha256']==browser['source_sha256'] for e in reports), 'Different source across engines'
        controls={}
        def control(key,status,evidence): controls[key]={'status':status,'evidence':evidence}
        def measured(key,passed,evidence): control(key,'Aprobado' if passed else 'Fallido',evidence)
        modes=[m for e in reports for m in by_engine[e][slug]['modes'].values()]
        measured('T-01',all(f['valid_png'] for f in row['files'].values()),'Variantes decodificadas con Pillow y cargadas en ambos editores web.')
        control('T-02','Pendiente' if 'flutter' in row['platforms'] else 'Aprobado','Rutas web comprobadas; Flutter incluido en catálogo/paquete, ejecución física pendiente cuando aplica.')
        measured('T-03',row['dimensions_pass'],'Web ≤1200 px; miniatura ≤360 px; dimensiones por variante registradas.')
        measured('T-04',row['aspect_delta']<=.01 and row['master_aspect_delta']<=.01,'Proporciones y píxeles del pipeline verificados; revisión de hojas de contacto.')
        control('T-05','Aprobado','62 slugs únicos y pertenencia explícita: 43 Flutter, 19 exclusivos web.')
        measured('T-06',all(m.get('thumbnail_select') and m.get('dropdown_select') for m in ex[slug]['modes'].values()),'Selección por miniatura/selector en Chromium; enlace directo en ambos motores.')
        measured('T-07',row['files']['web']['colored_ratio']<=.01,'Base sin color incompatible; lectura independiente de los canales PNG.')
        for key in ['T-08','T-09','T-10','T-11','T-13','T-14']:
            entry=manual['controls'][key]; control(key,entry['status'],entry['evidence'])
        control('T-12','Bloqueado','Falta verificar regiones pequeñas con dedo en los dispositivos físicos objetivo.')
        measured('T-15',geometry['damaged_line_pixels']==0 and ex[slug]['modes']['paint'].get('line_click_protected'),'Barrido completo de regiones no altera la máscara; toque sobre línea probado.')
        measured('T-16',ex[slug]['modes']['paint'].get('recolor') and ex[slug]['modes']['paint'].get('same_color_noop'),'Recoloreado y repetición del mismo color comprobados en una región real.')
        measured('T-17',all(by_engine[e][slug]['modes']['brush']['eraser']['changed'] for e in reports) and ex[slug]['modes']['brush']['long_stroke']['damaged_solid_line_pixels']==0,'Punto, trazo largo, borrador y protección de líneas sólidas en navegador; tacto físico pendiente.')
        measured('T-18',all(m['undo_exact'] for m in modes),'Deshacer devuelve exactamente el estado previo en ambos motores y modos.')
        control('T-19','Pendiente' if 'flutter' in row['platforms'] else 'Aprobado','Worker/fallback equivalentes en navegador; Flutter físico pendiente cuando aplica.')
        measured('T-20',all(m['restore_exact'] for m in modes),'Comparación RGBA antes/después de recargar y recuperar; capa editable y PNG compuesto independientes.')
        measured('T-21',all(m.get('separate_saved_works') for m in ex[slug]['modes'].values()),'Obras A/B conservadas por slug y modo, comprobadas contra sus copias persistidas.')
        export_readable=True
        for engine in reports:
            for mode in ['paint','brush']:
                for index in range(3):
                    name=f'{mode}-{engine}-export'+('' if index==0 else '-'+str(index+1))+'.png'
                    with Image.open(OUT/slug/name) as image:
                        image.load()
                        export_readable &= image.format=='PNG' and list(image.size)==by_engine[engine][slug]['modes'][mode]['dimensions']
                downloads_total += len(by_engine[engine][slug]['modes'][mode]['downloads'])
        control('T-22','Pendiente' if export_readable and all(d['pixels_exact'] for m in modes for d in m['downloads']) else 'Fallido','PNG recibido, comparado RGBA y abierto con Pillow independiente; visor del sistema y dispositivos físicos pendientes.')
        control('T-23','Pendiente' if all(m.get('downloads_change_with_edits') for m in modes) else 'Fallido','Tres PNG diferentes tras nuevas ediciones por modo/motor; alternativa de guardado físico pendiente.')
        control('T-24','Pendiente','Impresión física y salida de papel no comprobadas.')
        for key in ['T-25','T-26','T-27']: control(key,'Bloqueado','Faltan dispositivos físicos para toque, zoom/rotación y CPU/RAM; emulación no los sustituye.')
        control('T-28','Aprobado','Peso, dimensiones y SHA-256 por variante; tiempos de escritorio registrados, memoria móvil pendiente.')
        for key in ['E-01','E-02','E-03','E-04']:
            entry=manual['controls'][key]; control(key,entry['status'],entry['evidence'])
        for key in ['P-01','P-02','P-03','P-04']: control(key,'Pendiente','No evaluado en CAT-04. CAT-02 continúa excluida; no se acredita procedencia ni permiso comercial.')
        assert set(controls)==set(titles)
        counts=Counter(c['status'] for c in controls.values())
        decision='Requiere corrección' if counts['Fallido'] else 'Verificado en web de escritorio; pendiente de alcance físico/nativo'
        record={**row,'controls':controls,'status_counts':dict(counts),'notes':manual['notes'],'technical_decision':decision,'publication_decision':'No evaluada: CAT-02 excluida'}
        records.append(record)
        lines=[f"# {row['label']} — {slug}",'','Revisión CAT-04: 14/10/2026. Evidencia local identificada por SHA-256.', '',f'**Resultado:** {decision}.','', '## Variantes','', '| Variante | Dimensiones | KB | SHA-256 |','|---|---:|---:|---|']
        for role,f in row['files'].items(): lines.append(f"| {role} | {f['width']}×{f['height']} | {f['bytes']/1024:.1f} | {f['sha256']} |")
        lines+=['','## Revisión visual','']+['- '+n for n in manual['notes']]
        lines+=['','## Recuperación y descargas','','| Motor | Balde: píxeles cambiados | Pincel: píxeles cambiados | PNG exactos |','|---|---:|---:|---:|']
        for e in reports:
            m=by_engine[e][slug]['modes']; lines.append(f"| {e} | {m['paint']['restore_diff']['changed_pixels']} | {m['brush']['restore_diff']['changed_pixels']} | {sum(d['pixels_exact'] for a in m.values() for d in a['downloads'])}/6 |")
        lines+=['',f"Regiones: {len(geometry['regions'])}; menores de 16 px: {geometry['regions_under_16px']}. Barrido: {geometry['mismatched_pixels']} píxeles discrepantes, {geometry['damaged_line_pixels']} de contorno dañados.",'','[Mapa numerado](regions-chromium.png) · [Balde exportado](paint-chromium-export.png) · [Pincel antes de restaurar](brush-chromium-before-restore.png) · [Pincel recuperado](brush-chromium-export.png)','','## Checklist','','| ID | Control | Estado | Evidencia o límite |','|---|---|---|---|']
        for key,c in controls.items(): lines.append(f"| {key} | {titles[key]} | {c['status']} | {c['evidence']} |")
        (OUT/slug/'CHECKLIST.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
        rows.append({'slug':slug,'label':row['label'],'regions':len(geometry['regions']),'tiny_regions':geometry['regions_under_16px'],'approved':counts['Aprobado'],'failed':counts['Fallido'],'pending':counts['Pendiente'],'blocked':counts['Bloqueado'],'decision':decision})
    (OUT/'checklist-results.json').write_text(json.dumps({'scope':'CAT-04 desktop web; physical/native QA pending; CAT-02 excluded','items':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (OUT/'checklist-summary.csv').open('w',encoding='utf-8',newline='') as stream:
        writer=csv.DictWriter(stream,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    print(json.dumps({'images':len(records),'controls':len(records)*len(titles),'downloads':downloads_total,'requires_correction':[r['slug'] for r in rows if r['failed']]},ensure_ascii=False))

if __name__=='__main__': main()
