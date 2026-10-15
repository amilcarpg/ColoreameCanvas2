"""Reuse only unchanged verified drawings; retain source audit provenance."""
from pathlib import Path
import argparse, json, hashlib, copy, shutil
ROOT=Path(__file__).resolve().parents[1]

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def checked(path):
    path=path.resolve()
    if not path.is_relative_to(ROOT):raise ValueError('Evidence must stay inside the project')
    return path

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--report-dir',type=Path,required=True)
    args=parser.parse_args();out=checked(args.report_dir)
    catalog=json.loads((ROOT/'base_png/catalog.json').read_text(encoding='utf-8'))
    current={i['slug']:i for i in catalog['drawings']}
    prior=copy.deepcopy(catalog)
    changed={i['slug'] for i in prior['drawings'] if i.pop('downsampleFilter',None)=='bilinear'}
    repairs=json.loads((out/'imagegen-repairs.json').read_text(encoding='utf-8'))
    previous_entries={r['slug']:r['previous_entry'] for r in repairs if r.get('previous_entry')}
    prior['drawings']=[copy.deepcopy(previous_entries.get(e['slug'],e)) for e in prior['drawings']]
    prior_text=json.dumps(prior,ensure_ascii=False,indent=2)+'\n'
    prior_hashes={hashlib.sha256(prior_text.encode()).hexdigest(),hashlib.sha256(prior_text.replace('\n','\r\n').encode()).hexdigest()}
    for filename in ['browser-chromium.json','browser-webkit.json','extended-chromium.json']:
        old=json.loads((out/'before-cleanup'/filename).read_text(encoding='utf-8'))
        new=json.loads((out/'after-cleanup'/filename).read_text(encoding='utf-8'))
        assert old['catalog_sha256'] in prior_hashes,'Unexpected metadata changed before repair'
        assert new['catalog_sha256']==digest(ROOT/'base_png/catalog.json'),'New audit has stale catalog'
        assert old['editor_sha256']==new['editor_sha256'],'Editor changed; full rerun required'
        assert all(digest(ROOT/'web'/name)==sha for name,sha in new['editor_sha256'].items()),'Editor changed after audit'
        assert old['engine']==new['engine'] and old['browserVersion']==new['browserVersion'],'Different browser versions'
        updates={i['slug']:i for i in new['items']}
        assert set(updates)==changed,'Expected exactly the repaired drawings'
        assert len(old['items'])==len(current)==62,'Incomplete full audit'
        merged=[]
        for item in old['items']:
            slug=item['slug'];row=copy.deepcopy(updates.get(slug,item));entry=current[slug]
            assert all(row[k]==entry[k] for k in ['slug','label','category','difficulty','platforms']),'Runtime metadata changed'
            assert row['source_sha256']==digest(ROOT/'web'/entry['webSrc']),'Stale drawing '+slug
            assert not row.get('error') and not row.get('page_errors') and all(m.get('passed') for m in row['modes'].values()),'Failed drawing '+slug
            row['audit_source']=('after-cleanup/' if slug in changed else 'before-cleanup/')+filename
            row['audit_started_at']=new['timestamp'] if slug in changed else old['timestamp']
            merged.append(row)
        result={**new,'scope':f'Combined verified evidence: full 62-drawing run plus retest of {len(changed)} repaired drawings. The {62-len(changed)} reused items have unchanged source pixels, editor hashes and runtime metadata. No physical QA.','items':merged,'provenance':{'complete_run':'before-cleanup/'+filename,'repair_retest':'after-cleanup/'+filename,'complete_run_catalog_sha256':old['catalog_sha256'],'retested':sorted(changed),'reused_unchanged':62-len(changed),'metadata_change':'Bilinear filtering on repaired entries and recorded versioning of antenna-tip source; runtime metadata of reused drawings unchanged.'}}
        (out/filename).write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    # Copy the current per-drawing PNG evidence; originals/full-run JSON remain.
    for slug in changed:
        for file in (out/'after-cleanup'/slug).glob('*.png'):shutil.copyfile(file,out/slug/file.name)
    print(f'62 drawings consolidated per audit: {len(changed)} repaired/retested, {62-len(changed)} unchanged and hash-verified; provenance retained.')

if __name__=='__main__':main()
