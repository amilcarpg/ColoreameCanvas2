const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const web = process.env.PAINTME_WEB_ROOT || path.join(ROOT, 'web');
const read = name => fs.readFileSync(path.join(web, name), 'utf8').replace(/^\uFEFF/, '');
const tick = () => new Promise(resolve => setImmediate(resolve));

function memoryStorage() {
  const records = new Map();
  return {
    records, unavailable: false, quota: false,
    getItem(key) { if (this.unavailable) throw Error('blocked'); return records.get(key) ?? null; },
    setItem(key, value) { if (this.unavailable || this.quota) throw Error('quota'); records.set(key, value); },
    removeItem(key) { if (this.unavailable) throw Error('blocked'); records.delete(key); },
  };
}

function fakeIDB() {
  const records = new Map();
  const state = { records, fail: '', closes: 0, opens: 0, transactions: 0 };
  state.open = () => {
    state.opens++;
    if (state.fail === 'open-throw') throw Error('security');
    const request = {};
    queueMicrotask(() => {
      if (state.fail === 'open-timeout') return;
      if (state.fail === 'open-blocked') { request.onblocked?.(); return; }
      if (state.fail === 'open-error') { request.onerror?.(); return; }
      request.result = {
        close() { state.closes++; },
        transaction() {
          if (state.fail === 'transaction-throw') throw Error('transaction');
          state.transactions++;
          let pending = 0, aborted = false, completion;
          const tx = {
            abort() { aborted = true; clearImmediate(completion); queueMicrotask(() => tx.onabort?.()); },
            objectStore() {
              return {
                get(key) {
                  const req = { transaction: tx };
                  pending++;
                  queueMicrotask(() => {
                    if (aborted) return;
                    if (state.fail === 'transaction-timeout') return;
                    if (state.fail === 'transaction-abort') { tx.abort(); return; }
                    if (state.fail === 'request-error') { tx.onerror?.(); return; }
                    req.result = records.get(key);
                    req.onsuccess?.();
                    pending--;
                    complete();
                  });
                  return req;
                },
                put(value, key) {
                  if (state.fail === 'put-throw') throw Error('put quota');
                  pending++;
                  queueMicrotask(() => {
                    if (!aborted) records.set(key, structuredClone(value));
                    pending--;
                    complete();
                  });
                },
              };
            },
          };
          function complete() {
            clearImmediate(completion);
            completion = setImmediate(() => {
              if (!aborted && pending === 0) tx.oncomplete?.();
            });
          }
          return tx;
        },
      };
      request.onsuccess?.();
    });
    return request;
  };
  return state;
}

function helper({ idb, local = memoryStorage(), fixedClock = false } = {}) {
  const window = { localStorage: local, location: { href: 'https://paintme.test/paint.html' } };
  if (idb) window.indexedDB = idb;
  const scope = {
    window, localStorage: local, URL, Map, Set, Promise,
    Date: fixedClock ? { now: () => 1000 } : Date,
    // Accelerate failure deadlines without racing successful fake-IDB setImmediate commits under CPU load.
    setTimeout: (callback, ms) => setTimeout(callback, ms >= 1500 ? 200 : ms),
    clearTimeout,
  };
  vm.createContext(scope);
  vm.runInContext(read('app-utils.js'), scope);
  return { pm: window.PaintMe, scope, local };
}
const key = (mode = 'bucket', slug = 'gato') => `paintme_autosave_v1:${mode}:${slug}`;

test('mode switch carries only known asset/category context to the other local engine', () => {
  const { pm } = helper();
  const destination = pm.modeDestination('brush.html?asset=wrong&source=private', {slug:'gato'}, 'animales', 'bucket');
  assert.equal(destination.pathname, '/brush.html');
  assert.equal(destination.searchParams.get('asset'), 'gato');
  assert.equal(destination.searchParams.get('category'), 'animales');
  assert.equal(destination.searchParams.get('source'), 'mode');
  assert.equal(pm.modeDestination('https://other.test/brush.html', {slug:'gato'}, 'animales', 'bucket'), null);
  assert.equal(pm.modeDestination('brush.html', {slug:'../gato'}, 'animales', 'bucket'), null);
});

test('all production JS parses and editor dependencies load in order', () => {
  for (const name of fs.readdirSync(web).filter(name => name.endsWith('.js'))) {
    assert.equal(cp.spawnSync(process.execPath, ['--check', path.join(web, name)]).status, 0, name);
  }
  for (const name of ['paint', 'brush']) {
    const html = read(name + '.html');
    assert(html.indexOf('app-utils.js') < html.indexOf(name + '.js?'));
    assert(html.indexOf('flood-fill.js') < html.indexOf(name + '.js?'));
    assert.match(read(name + '.js'), /const PM = window.PaintMe;/);
  }
});
test('shared helpers expose all palettes and navigate without repeating surprise', () => {
  const { pm, scope } = helper();
  assert.equal(vm.runInContext('PaintMe === window.PaintMe', scope), true);
  assert.equal(Object.keys(pm.PALETTES).length, 4);
  for (const palette of Object.values(pm.PALETTES)) assert.equal(palette.colors.length, 12);
  const drawings = [{slug:'gato'}, {slug:'perro'}, {slug:'pez'}];
  assert.equal(pm.getNextAsset(drawings, drawings[0]).slug, 'perro');
  assert.equal(pm.getNextAsset(drawings, drawings[2]).slug, 'gato');
  for (let i=0; i<30; i++) assert.notEqual(pm.getRandomAsset(drawings, drawings[0]).slug, 'gato');
  assert.equal(pm.getRandomAsset([], drawings[0]), null);
});
test('catalog paths, slugs, dimensions and aspect ratios are consistent', () => {
  const scope = {window:{}};
  vm.runInNewContext(read('assets-list.js'), scope);
  const seen = new Set();
  function dimensions(filename, max) {
    const png = fs.readFileSync(path.join(web, filename));
    assert.equal(png.subarray(1,4).toString(), 'PNG', filename);
    const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
    assert(w > 0 && h > 0 && Math.max(w,h) <= max, filename);
    return w/h;
  }
  for (const drawing of scope.window.ASSETS) {
    assert(!seen.has(drawing.slug), drawing.slug);
    seen.add(drawing.slug);
    assert(Math.abs(dimensions(drawing.src,1200) - dimensions(drawing.thumbnailSrc,360)) <= 0.01);
  }
  for (const [file, base, list] of [
    ['base_png/catalog.json','base_png', json=>json.drawings],
    ['flutter/assets/catalog.json','flutter', json=>json],
  ]) for (const drawing of list(JSON.parse(fs.readFileSync(path.join(ROOT,file))))) {
    assert(fs.existsSync(path.join(ROOT,base,drawing.file || drawing.asset)), drawing.slug);
  }
});

function fillScope() {
  const scope = { Uint8Array, Uint32Array, Uint8ClampedArray, ArrayBuffer };
  vm.createContext(scope);
  vm.runInContext(read('flood-fill.js'), scope);
  return scope;
}
function fixture(w, h, extra={}) {
  return { id:1, width:w, height:h, startX:0, startY:0, fillColor:[255,0,0,255],
    tolerance:20, lineMask:new Uint8Array(w*h), buffer:new Uint8ClampedArray(w*h*4).fill(255).buffer, ...extra };
}
function workerFill(input) {
  const scope = fillScope();
  let handler, result;
  scope.importScripts = () => {};
  scope.self = {addEventListener: (_, fn)=>handler=fn, postMessage: value=>result=value};
  vm.runInContext(read('paint-worker.js'),scope);
  handler({data:input});
  return result;
}
function fallbackFill(input) {
  const scope = fillScope();
  const task = scope.PaintMeFill.createTask(input);
  assert(task);
  let frames = 0;
  while (!task.step(17)) assert(++frames < input.width*input.height+1);
  return task.data;
}
for (const [w,h] of [[10,10],[100,100],[1200,1200]]) test(`worker fills every pixel of ${w}×${h}`, () => {
  const result=workerFill(fixture(w,h));
  assert.equal(result.error,undefined);
  const data=new Uint8ClampedArray(result.buffer);
  for (let i=0;i<data.length;i+=4) {
    assert.equal(data[i],255); assert.equal(data[i+1],0); assert.equal(data[i+2],0); assert.equal(data[i+3],255);
  }
});
test('worker and fallback agree on masks, isolated regions, edges and tolerance', () => {
  const input=fixture(7,5,{startX:1,startY:4});
  const pixels=new Uint8ClampedArray(input.buffer);
  for(let y=0;y<5;y++) {
    input.lineMask[y*7+3]=1;
    pixels.set([0,0,0,255],(y*7+3)*4);
  }
  pixels.set([230,230,230,255],0);
  const fallback=fallbackFill(structuredClone(input));
  const worker=new Uint8ClampedArray(workerFill(structuredClone(input)).buffer);
  assert.deepEqual(worker,fallback);
  for(let y=0;y<5;y++) for(let x=0;x<7;x++) {
    const i=(y*7+x)*4;
    if(x===3) assert.deepEqual(Array.from(worker.subarray(i,i+4)),[0,0,0,255]);
    else if(x>3 || (x===0 && y===0)) assert.notEqual(worker[i+1],0);
    else assert.equal(worker[i+1],0);
  }
});
test('protected seed and already matching fill are no-ops in both engines', () => {
  for(const input of [fixture(3,3,{fillColor:[255,255,255,255]}), fixture(3,3,{lineMask:new Uint8Array(9).fill(1)})]) {
    const expected=new Uint8ClampedArray(input.buffer).slice();
    assert.deepEqual(fallbackFill(structuredClone(input)),expected);
    assert.deepEqual(new Uint8ClampedArray(workerFill(structuredClone(input)).buffer),expected);
  }
});
test('malformed fill requests are rejected explicitly without allocating a queue', () => {
  for(const extra of [
    {width:0},{width:1n},{height:Symbol('invalid')},{height:-1},{startX:-1},{startY:3},{startX:0.5},
    {fillColor:[NaN,0,0,255]},{fillColor:[256,0,0,255]},{tolerance:-1},{tolerance:Infinity},
    {buffer:new ArrayBuffer(1)},{lineMask:new Uint8Array(2)},{width:2000,height:2000},
  ]) assert.equal(workerFill(fixture(3,3,extra)).error,'invalid_fill');
});

test('fallback save/load/clear works without IndexedDB and keeps modes separate', async () => {
  const {pm}=helper();
  assert.equal(await pm.saveLocalDrawing('bucket','gato','first'),true);
  assert.equal(await pm.saveLocalDrawing('brush','gato','brush'),true);
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'first');
  assert.equal((await pm.loadLocalDrawing('brush','gato')).dataUrl,'brush');
  assert.equal(await pm.clearLocalDrawing('bucket','gato'),true);
  assert.equal(await pm.loadLocalDrawing('bucket','gato'),null);
  assert.equal((await pm.loadLocalDrawing('brush','gato')).dataUrl,'brush');
});
test('IndexedDB commits, closes connections and removes only confirmed backup', async () => {
  const idb=fakeIDB(), {pm,local}=helper({idb});
  assert.equal(pm.backupLocalDrawing('bucket','gato','first'),true);
  assert.equal(await pm.saveLocalDrawing('bucket','gato','second'),true);
  assert.equal(local.getItem(key()),null);
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'second');
  assert.equal(idb.closes,idb.opens);
});
for(const failure of ['open-throw','open-error','open-blocked','open-timeout','transaction-throw','transaction-abort','transaction-timeout','request-error','put-throw']) {
  test(`storage recovers after ${failure}`,async()=>{
    const idb=fakeIDB(), {pm,local}=helper({idb});
    idb.fail=failure;
    assert.equal(await pm.saveLocalDrawing('bucket','gato','fallback'),true);
    assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'fallback');
    idb.fail='';
    assert.equal(await pm.saveLocalDrawing('bucket','gato','recovered'),true);
    assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'recovered');
    assert.equal(local.getItem(key()),null);
  });
}
test('blocked and full storage report failure, then allow a successful retry', async()=>{
  const {pm,local}=helper();
  local.unavailable=true;
  assert.equal(await pm.saveLocalDrawing('bucket','gato','lost'),false);
  assert.equal(await pm.loadLocalDrawing('bucket','gato'),null);
  local.unavailable=false; local.quota=true;
  assert.equal(await pm.saveLocalDrawing('bucket','gato','lost'),false);
  local.quota=false;
  assert.equal(await pm.saveLocalDrawing('bucket','gato','retry'),true);
});
test('legacy/corrupt backup reads are safe and never delete the only valid copy', async()=>{
  const {pm,local}=helper();
  local.setItem(key(), JSON.stringify({dataUrl:'legacy'}));
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'legacy');
  assert(local.getItem(key()));
  for(const raw of ['{broken', 'null','{}', '{"dataUrl":""}']) {
    local.setItem(key(),raw); assert.equal(await pm.loadLocalDrawing('bucket','gato'),null);
  }
});
test('same-millisecond saves and a newer close backup never restore an older image', async()=>{
  const idb=fakeIDB(), {pm,local}=helper({idb,fixedClock:true});
  const first=pm.saveLocalDrawing('bucket','gato','old');
  await tick();
  pm.backupLocalDrawing('bucket','gato','new');
  await first;
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'new');
  assert.equal(JSON.parse(local.getItem(key())).dataUrl,'new');
  await pm.saveLocalDrawing('bucket','gato','newest');
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'newest');
});
test('failed clear leaves tombstone and cannot resurrect an older IndexedDB image', async()=>{
  const idb=fakeIDB(), {pm}=helper({idb});
  await pm.saveLocalDrawing('bucket','gato','old');
  idb.fail='transaction-abort';
  assert.equal(await pm.clearLocalDrawing('bucket','gato'),true);
  idb.fail='';
  assert.equal(await pm.loadLocalDrawing('bucket','gato'),null);
  await pm.saveLocalDrawing('bucket','gato','fresh');
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'fresh');
});
test('autosave captures slug/revision, serializes writes and reports each real outcome', async()=>{
  const {pm,local}=helper(), callbacks=[];
  const controller=pm.createAutosaveController('bucket',(...args)=>callbacks.push(args));
  controller.schedule('gato','cat',1);
  controller.schedule('perro','dog',2);
  await controller.flush();
  assert.equal((await pm.loadLocalDrawing('bucket','gato')).dataUrl,'cat');
  assert.equal((await pm.loadLocalDrawing('bucket','perro')).dataUrl,'dog');
  assert.deepEqual(callbacks,[[true,'gato',1],[true,'perro',2]]);
  local.quota=true;
  controller.schedule('perro','fail',3);
  assert.equal(await controller.flush(),false);
  local.quota=false;
  controller.schedule('perro','retry',4);
  assert.equal(await controller.flush(),true);
  assert.deepEqual(callbacks.slice(-2),[[false,'perro',3],[true,'perro',4]]);
});
test('synchronous close backup includes the latest pending snapshot even during a write',async()=>{
  const idb=fakeIDB(), {pm,local}=helper({idb});
  const controller=pm.createAutosaveController('brush');
  controller.schedule('gato','old',1);
  const write=controller.flush();
  controller.schedule('gato','last',2);
  assert.equal(controller.backup(),true);
  assert.equal(JSON.parse(local.getItem(key('brush'))).dataUrl,'last');
  await write;
  assert.equal((await pm.loadLocalDrawing('brush','gato')).dataUrl,'last');
  await controller.flush();
});
test('cancel waits for in-flight save so reset cannot resurrect deleted drawing',async()=>{
  const {pm}=helper({idb:fakeIDB()});
  const controller=pm.createAutosaveController('bucket');
  controller.schedule('gato','old',1);
  controller.flush();
  await controller.cancel();
  await pm.clearLocalDrawing('bucket','gato');
  assert.equal(await pm.loadLocalDrawing('bucket','gato'),null);
});
test('consumer callback errors do not corrupt persistence or block the next save',async()=>{
  const {pm}=helper();
  const controller=pm.createAutosaveController('bucket',()=>{throw Error('UI');});
  controller.schedule('gato','one',1);
  assert.equal(await controller.flush(),true);
  controller.schedule('gato','two',2);
  assert.equal(await controller.flush(),true);
});
test('invalid storage keys and snapshots fail explicitly',async()=>{
  const {pm}=helper();
  for(const [mode,slug,png] of [['bad','gato','png'],['bucket','../x','png'],['brush','gato','']]) {
    assert.equal(await pm.saveLocalDrawing(mode,slug,png),false);
    assert.equal(pm.backupLocalDrawing(mode,slug,png),false);
  }
});

test('saving notification precedes only a confirmed persistence result',async()=>{
  const idb=fakeIDB(),{pm}=helper({idb}), events=[];
  const controller=pm.createAutosaveController('bucket',(saved,slug,revision)=>{
    assert.equal(idb.records.get(key()).dataUrl,'image');
    events.push(['saved',saved,slug,revision]);
  },(slug,revision)=>events.push(['saving',slug,revision]));
  controller.schedule('gato','image',42);
  await controller.flush();
  assert.deepEqual(events,[['saving','gato',42],['saved',true,'gato',42]]);
});
test('PNG encoding explicitly fails on null, throw and timeout, and succeeds on valid blob',async()=>{
  const {pm}=helper();
  for(const source of [
    {toBlob(callback){callback(null);}},
    {toBlob(){throw Error('SecurityError');}},
    {toBlob(){}},
    {toBlob(callback){callback({type:'image/jpeg',size:10});}},
  ]) await assert.rejects(pm.canvasToPngBlob(source),/png_(failed|timeout)/);
  const blob={type:'image/png',size:10};
  assert.equal(await pm.canvasToPngBlob({toBlob(callback){callback(blob);}}),blob);
});
test('saved PNG validation rejects non-data sources before starting image load',async()=>{
  const {pm}=helper();
  for(const source of ['https://example.test/image.png','data:text/html,hello',null]) {
    await assert.rejects(pm.decodeSavedPng(source),/invalid_png/);
  }
});
test('download attaches its link and defers object URL release',()=>{
  const {pm,scope}=helper(),events=[],timers=[];
  let attached=false;
  const link={click(){assert(attached);events.push(['click',this.download]);},remove(){attached=false;}};
  scope.document={createElement:()=>link,body:{appendChild(){attached=true;}}};
  scope.URL={createObjectURL:()=> 'blob:test',revokeObjectURL:url=>events.push(['revoke',url])};
  scope.setTimeout=(callback,ms)=>{timers.push({callback,ms});};
  pm.downloadPngBlob({type:'image/png',size:20},'gato.png');
  assert.deepEqual(events,[['click','gato.png']]);
  assert.equal(attached,false);
  assert.equal(timers[0].ms,30000);
  timers[0].callback();
  assert.deepEqual(events[1],['revoke','blob:test']);
});


test('saved image error and stalled decode reject and detach callbacks',async()=>{
  const {pm,scope}=helper();
  const images=[];
  scope.Image=class { constructor(){images.push(this);} set src(value){this.source=value;} };
  const invalid=pm.decodeSavedPng('data:image/png;base64,broken');
  images[0].onerror();
  await assert.rejects(invalid,/invalid_png/);
  assert.equal(images[0].onerror,null);
  assert.equal(images[0].onload,null);
  await assert.rejects(pm.decodeSavedPng('data:image/png;base64,stalled'),/restore_timeout/);
  assert.equal(images[1].onerror,null);
  assert.equal(images[1].onload,null);
});

test('history undo/redo, branches and clearing preserve the expected snapshots',()=>{
  const {pm}=helper(), history=pm.createHistory(4,100), image=value=>({data:new Uint8Array([value])});
  const a=image(1), b=image(2), c=image(3);
  history.push(a);history.push(b);
  assert.equal(history.undo(c),b);
  assert.equal(history.undo(b),a);
  assert.equal(history.redo(a),b);
  assert.equal(history.redo(b),c);
  assert.equal(history.redo(c),null);
  history.undo(c);history.push(a);
  assert.equal(history.future.length,0);
  history.clear();assert.equal(history.bytes(),0);
});
test('history shares its step and byte limits between undo and redo',()=>{
  const {pm}=helper(), history=pm.createHistory(20,32*1024*1024);
  for(let i=0;i<20;i++) history.push({data:new Uint8Array(1200*1200*4)});
  assert.equal(history.past.length,5);
  assert(history.bytes()<=32*1024*1024);
  for(let i=0;i<5;i++) history.undo({data:new Uint8Array(1200*1200*4)});
  assert.equal(history.future.length,5);
  assert(history.bytes()<=32*1024*1024);
  const small=pm.createHistory(2,100);
  for(let i=0;i<8;i++) small.push({data:new Uint8Array(1)});
  assert.equal(small.past.length,2);
});
test('generated catalogs have the same taxonomy and explicit platform membership',()=>{
  const master=JSON.parse(fs.readFileSync(path.join(ROOT,'base_png/catalog.json')));
  const mobile=JSON.parse(fs.readFileSync(path.join(ROOT,'flutter/assets/catalog.json')));
  const scope={window:{}};vm.runInNewContext(read('assets-list.js'),scope);
  assert.equal(master.drawings.length,62);
  assert.equal(scope.window.ASSETS.length,62);
  assert.equal(mobile.length,43);
  for(const [platform,list] of [['web',scope.window.ASSETS],['flutter',mobile]]) {
    const expected=master.drawings.filter(item=>item.platforms.includes(platform));
    assert.deepEqual(Array.from(list,item=>item.slug),expected.map(item=>item.slug));
    for(const item of list) {
      const source=expected.find(record=>record.slug===item.slug);
      for(const field of ['category','theme','difficulty','label']) assert.equal(item[field],source[field],item.slug+': '+field);
      assert(master.categories[item.category]);
    }
  }
  assert.equal(master.drawings.find(item=>item.slug==='casa-4').category,'vehiculos');
  assert.equal(master.drawings.find(item=>item.slug==='casa-1').category,'casas');
  assert.equal(master.drawings.find(item=>item.slug==='paisaje-3').category,'paisajes');
});

test('existing drawing pages keep category query links and related cards aligned with the catalog',()=>{
  const master=JSON.parse(fs.readFileSync(path.join(ROOT,'base_png/catalog.json')));
  const entries=new Map(master.drawings.map(item=>[item.slug,item]));
  for(const folder of ['dibujos','categorias','packs']) for(const name of fs.readdirSync(path.join(ROOT,'web',folder))) {
    if(!name.endsWith('.html')) continue;
    const text=fs.readFileSync(path.join(ROOT,'web',folder,name),'utf8'),slug=name.slice(0,-5);
    for(const match of text.matchAll(/asset=([a-z0-9-]+)&(?:amp;)?category=([a-z0-9-]+)/g)) {
      assert.equal(match[2],entries.get(match[1])?.category,folder+'/'+name);
    }
    const expected=folder==='dibujos' ? entries.get(slug)?.category : slug;
    for(const match of text.matchAll(/class="card" href="\.\.\/dibujos\/([a-z0-9-]+)\.html"/g)) {
      assert.equal(entries.get(match[1])?.category,expected,folder+'/'+name+': '+match[1]);
    }
  }
});
