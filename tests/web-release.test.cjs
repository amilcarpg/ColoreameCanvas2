const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {manifestFor,verify}=require('../scripts/web-release.cjs');
const web=path.resolve(__dirname,'../web');
test('release fingerprint verifies all critical files including familias and disabled configuration',async()=>{
  const manifest=manifestFor(web);
  assert(manifest.critical.includes('familias.html'));
  const result=await verify(manifest,'https://www.paintme.test/',async url=>new Response(fs.readFileSync(path.join(web,decodeURIComponent(url.pathname)))));
  assert.equal(result.passed,true);
});
test('release verification detects stale familias even if its HTTP status is 200',async()=>{
  const manifest=manifestFor(web);
  const result=await verify(manifest,'https://www.paintme.test/',async url=>new Response(url.pathname==='/familias.html'?'old version':fs.readFileSync(path.join(web,decodeURIComponent(url.pathname)))));
  assert.equal(result.passed,false);
  assert.equal(result.results.find(r=>r.file==='familias.html').exact,false);
});
test('release verification rejects altered manifests, remote HTTP and unsafe origins',async()=>{
  const manifest=manifestFor(web);
  await assert.rejects(verify(manifest,'http://www.paintme.test/'),/HTTPS/);
  await assert.rejects(verify(manifest,'https://www.paintme.test/?token=private'),/origin/);
  manifest.files['familias.html']='wrong';
  await assert.rejects(verify(manifest,'https://www.paintme.test/'),/modified manifest/);
});
