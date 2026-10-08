// Read-only diagnostic checks. Does not modify product files.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const web = path.join(root, 'web');
const result = {};
result.syntax = fs.readdirSync(web).filter(x => x.endsWith('.js')).map(file => {
  const p = cp.spawnSync(process.execPath, ['--check', path.join(web, file)], {encoding:'utf8'});
  return {file, exit:p.status, error:p.stderr.trim()};
});
const sandbox = {window:{}, localStorage:{}, URL, Map, Set};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(web,'app-utils.js'),'utf8'),sandbox);
result.helperExposure = {
  lexical:vm.runInContext('typeof PaintMe',sandbox),
  windowProperty:vm.runInContext('typeof window.PaintMe',sandbox),
  editorHelpers:vm.runInContext('Object.keys(window.PaintMe || {})',sandbox)
};
const catalogScope = {window:{}};
vm.createContext(catalogScope);
vm.runInContext(fs.readFileSync(path.join(web,'assets-list.js'),'utf8'), catalogScope);
const assets = catalogScope.window.ASSETS;
const dims = file => {
  const b=fs.readFileSync(file);
  return b.subarray(1,4).toString()==='PNG' ? [b.readUInt32BE(16),b.readUInt32BE(20)] : null;
};
const mobile = JSON.parse(fs.readFileSync(path.join(root,'flutter/assets/catalog.json'),'utf8'));
const master = JSON.parse(fs.readFileSync(path.join(root,'base_png/catalog.json'),'utf8')).drawings;
result.catalog = {
  webCount: assets.length, mobileCount:mobile.length, masterCount:master.length,
  categories:assets.reduce((o,a)=>(o[a.category]=(o[a.category]||0)+1,o),{}),
  missing:[], oversized:[], ratioMismatch:[], duplicateSlugs:[],
  mobileMissing:mobile.filter(a=>!fs.existsSync(path.join(root,'flutter',a.asset))).map(a=>a.slug),
  mastersMissing:master.filter(a=>!fs.existsSync(path.join(root,'base_png',a.file))).map(a=>a.slug),
  webOnly:assets.filter(a=>!mobile.some(b=>b.slug===a.slug)).map(a=>a.slug)
};
const seen=new Set();
for(const a of assets){
  if(seen.has(a.slug)) result.catalog.duplicateSlugs.push(a.slug); seen.add(a.slug);
  for(const [key,limit] of [['src',1200],['thumbnailSrc',360]]){
    const f=path.join(web,a[key]||'');
    if(!a[key]||!fs.existsSync(f)){result.catalog.missing.push({slug:a.slug,key,path:a[key]});continue;}
    const d=dims(f); if(d && Math.max(...d)>limit) result.catalog.oversized.push({slug:a.slug,key,dimensions:d});
  }
  if(a.src&&a.thumbnailSrc&&fs.existsSync(path.join(web,a.src))&&fs.existsSync(path.join(web,a.thumbnailSrc))){
    const d=dims(path.join(web,a.src)),t=dims(path.join(web,a.thumbnailSrc));
    if(d&&t&&Math.abs(d[0]/d[1]-t[0]/t[1])>0.01) result.catalog.ratioMismatch.push(a.slug);
  }
}
result.pngBytes={};
for(const dir of ['base_png','web/assets','flutter/assets']){
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).reduce((n,e)=>n+(e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.png')?fs.statSync(path.join(d,e.name)).size:0),0);
  result.pngBytes[dir]=walk(path.join(root,dir));
}
result.productionComparison=[];
for(const f of ['index.html','paint.html','app-utils.js','paint.js','analytics-init.js','assets-list.js','robots.txt','sitemap.xml','ads.txt','privacy.html','paint-worker.js','brush.js','paint.css','brush.css','brush.html','categorias/dinosaurios.html','packs/dinosaurios.html','dibujos/dinosaurio.html']){
  const remote=path.join(__dirname,'production-'+f.replace(/[/.]/g,'-')+'.txt');
  if(fs.existsSync(remote)) result.productionComparison.push({file:f,normalizedMatch:fs.readFileSync(remote,'utf8').replaceAll('\r\n','\n')===fs.readFileSync(path.join(web,f),'utf8').replaceAll('\r\n','\n')});
}
result.worker=[];
for(const [w,h] of [[10,10],[100,100],[1200,1200]]){
  let handler,output;
  const scope={self:{addEventListener:(_,h)=>handler=h,postMessage:m=>output=m},Uint8ClampedArray,Uint8Array,Uint32Array,Math};
  vm.createContext(scope);
  vm.runInContext(fs.readFileSync(path.join(web,'paint-worker.js'),'utf8'),scope);
  const data=new Uint8ClampedArray(w*h*4).fill(255);
  handler({data:{id:1,width:w,height:h,startX:0,startY:0,fillColor:[255,0,0,255],tolerance:20,lineMask:new Uint8Array(w*h),buffer:data.buffer}});
  const out=new Uint8ClampedArray(output.buffer);let painted=0;
  for(let i=0;i<out.length;i+=4) if(out[i+1]===0)painted++;
  result.worker.push({dimensions:[w,h],expected:w*h,painted,complete:painted===w*h});
}
console.log(JSON.stringify(result,null,2));
