const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const https = require('node:https');
const os = require('node:os');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const playwright = require(process.env.PAINTME_PLAYWRIGHT_PATH || 'playwright');
const engineName = process.env.PAINTME_BROWSER_ENGINE || 'chromium';
if (!['chromium', 'webkit', 'firefox'].includes(engineName)) throw new Error('Invalid PAINTME_BROWSER_ENGINE');
const web = path.resolve(__dirname, '../web');
let browser, server, origin, certificateDirectory;
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
function chunk(type, data) {
  const name = Buffer.from(type), source = Buffer.concat([name,data]);
  let crc=0xffffffff;
  for(const byte of source) {
    crc ^= byte;
    for(let bit=0;bit<8;bit++) crc = (crc>>>1) ^ ((crc&1) ? 0xedb88320 : 0);
  }
  const head=Buffer.alloc(4), tail=Buffer.alloc(4);
  head.writeUInt32BE(data.length); tail.writeUInt32BE((crc ^ 0xffffffff)>>>0);
  return Buffer.concat([head,source,tail]);
}
function fixturePNG(lineX=12, size=24) {
  const header=Buffer.alloc(13);
  header.writeUInt32BE(size,0); header.writeUInt32BE(size,4); header[8]=8; header[9]=6;
  const row = size * 4 + 1;
  const data=Buffer.alloc(size*row);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) {
    const offset=y*row+1+x*4;
    const black=x===0 || y===0 || x===size-1 || y===size-1 || x===lineX;
    data.set(black ? [0,0,0,255] : [255,255,255,255],offset);
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(data)),chunk('IEND',Buffer.alloc(0))]);
}
const png=fixturePNG();
const fixtures=[
  {slug:'gato',label:'Gato',category:'animales',featured:true},
  {slug:'perro',label:'Perro',category:'animales'},
  {slug:'auto',label:'Auto',category:'vehiculos',featured:true},
  {slug:'tren',label:'Tren',category:'vehiculos'},
].map(drawing=>({...drawing,src:'assets/test-'+drawing.slug+'.png',thumbnailSrc:'assets/test-'+drawing.slug+'.png'}));

before(async()=>{
  // Preserve the production CSP, including upgrade-insecure-requests, in all engines.
  certificateDirectory=fs.mkdtempSync(path.join(os.tmpdir(),'paintme-https-'));
  const certificate=path.join(certificateDirectory,'localhost.pem');
  const key=path.join(certificateDirectory,'localhost-key.pem');
  const openssl=process.env.PAINTME_OPENSSL_PATH || (process.platform==='win32' ? 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe' : 'openssl');
  cp.execFileSync(openssl,['req','-x509','-newkey','rsa:2048','-sha256','-nodes','-keyout',key,'-out',certificate,'-subj','/CN=localhost','-addext','subjectAltName=DNS:localhost,IP:127.0.0.1','-days','1'],{stdio:'ignore'});
  server=https.createServer({key:fs.readFileSync(key),cert:fs.readFileSync(certificate)},(request,response)=>{
    const filename=path.resolve(web,'.'+new URL(request.url,'http://localhost').pathname);
    if(!filename.startsWith(web+path.sep)) { response.writeHead(403).end(); return; }
    fs.readFile(filename,(error,data)=>{
      if(error) response.writeHead(404).end();
      else { response.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream'); response.end(data); }
    });
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin='https://127.0.0.1:'+server.address().port;
  const launchOptions = { headless: true };
  if (process.env.PAINTME_BROWSER_PATH) launchOptions.executablePath = process.env.PAINTME_BROWSER_PATH;
  else if (engineName === 'chromium') launchOptions.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  browser=await playwright[engineName].launch(launchOptions);
  console.log('Browser engine: '+engineName+' '+browser.version()+' (headless, Windows)');
});
after(async()=>{
  await browser?.close();
  if(server) await new Promise(resolve=>server.close(resolve));
  if(certificateDirectory) {
    const resolved=path.resolve(certificateDirectory);
    if(path.dirname(resolved)!==path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('paintme-https-')) throw new Error('Unsafe certificate cleanup path');
    fs.rmSync(resolved,{recursive:true,force:true});
  }
});

async function editor(mode,{fallback=false,blocked=false,fixture=true,viewport={width:390,height:844},touch=false,workerDelay=false}={}) {
  const context=await browser.newContext({viewport,ignoreHTTPSErrors:true,hasTouch:touch,isMobile:touch && engineName!=='firefox'});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin) { await route.abort(); return; }
    if(fixture && url.pathname==='/assets-list.js') {
      await route.fulfill({contentType:'text/javascript',body:'window.ASSETS = '+JSON.stringify(fixtures)+';'}); return;
    }
    if(fixture && url.pathname.startsWith('/assets/test-')) {
      await route.fulfill({contentType:'image/png',body:png}); return;
    }
    await route.continue();
  });
  await context.addInitScript(({fallback,blocked,workerDelay})=>{
    if(fallback) Object.defineProperty(window,'Worker',{value:undefined});
    if(blocked) {
      Object.defineProperty(window,'indexedDB',{value:undefined,configurable:true});
      window.__originalSetItem=Storage.prototype.setItem;
      Storage.prototype.setItem=function(){throw new DOMException('Quota exceeded','QuotaExceededError');};
    }
    if(workerDelay) {
      const NativeWorker=window.Worker;
      window.Worker=class extends EventTarget {
        constructor(url) {
          super();
          this.worker=new NativeWorker(url);
          this.worker.addEventListener('message',event=>{
            window.__deliverFill=()=>this.dispatchEvent(new MessageEvent('message',{data:event.data}));
          });
          this.worker.addEventListener('error',()=>this.dispatchEvent(new Event('error',{cancelable:true})));
        }
        postMessage(data,transfer) {this.worker.postMessage(data,transfer);}
        terminate() {this.worker.terminate();}
      };
    }
  },{fallback,blocked,workerDelay});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',error=>{errors.push(error.message);if(process.env.PAINTME_DEBUG) console.error(error.message);});
  if(process.env.PAINTME_DEBUG) page.on('console',message=>console.log(message.type()+': '+message.text()));
  await page.goto(origin+'/'+mode+'.html?asset=gato&category=animales');
  try {await ready(page);} catch(error) {
    if(process.env.PAINTME_DEBUG) console.log(await page.evaluate(()=>({pm:typeof window.PaintMe,loaded:typeof isImageLoaded,html:document.title,errors:document.getElementById('status')?.textContent})));
    throw error;
  }
  await page.locator('#adultArea > summary').click();
  await page.locator('#consentReject').click().catch(()=>{});
  await page.locator('#adultArea > summary').click();
  return {page,context,errors};
}
async function selectPalette(page,value) {
  await page.locator('#toolOptions').evaluate(element=>{element.open=true;});
  await page.locator('#paletteSelect').selectOption(value);
}
async function selectDrawing(page,value) {
  await page.locator('#galleryBrowser').evaluate(element=>{element.open=true;});
  await page.locator('#catalogAdvanced').evaluate(element=>{element.open=true;});
  await page.locator('#assetSelect').selectOption(value);
}
async function ready(page) { await page.waitForFunction(()=>typeof isImageLoaded !== 'undefined' && isImageLoaded && !switchingAsset); }
async function pixel(page,x=5,y=5) {return page.evaluate(({x,y})=>Array.from(ctx.getImageData(x,y,1,1).data),{x,y});}
async function paint(page,mode,{release=true,waitForFill=true}={}) {
  await page.locator('#canvas').scrollIntoViewIfNeeded();
  const box=await page.locator('#canvas').boundingBox();
  const point=(x,y)=>({x:box.x+box.width*x/24,y:box.y+box.height*y/24});
  const start=point(mode==='paint'?5:4,5);
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  if(mode==='brush') {
    const end=point(8,5);
    await page.mouse.move(end.x,end.y,{steps:4});
  }
  if(release) await page.mouse.up();
  if(mode==='paint' && waitForFill) await page.waitForFunction(()=>!fillInProgress);
}
async function resetDrawing(page,confirm=true) {
  await page.locator('#otherActions').evaluate(element=>{element.open=true;});
  await page.locator('#resetBtn').click();
  await page.locator('#resetDialog').waitFor({state:'visible'});
  if(!confirm && process.env.PAINTME_EVIDENCE_DIR) {
    fs.mkdirSync(process.env.PAINTME_EVIDENCE_DIR,{recursive:true});
    const mode=await page.evaluate(()=>location.pathname.replace(/\W/g,''));
    await page.screenshot({path:path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-'+mode+'-reset.png')});
  }
  await page.locator('#resetDialog button[value="'+(confirm?'reset':'cancel')+'"]').click();
  await page.waitForFunction(()=>!switchingAsset);
}
async function restore(page) {
  await page.waitForFunction(()=>!document.getElementById('restoreBtn').hidden);
  await page.locator('#restoreBtn').click();
  await page.waitForFunction(()=>['Dibujo restaurado','Drawing restored'].includes(document.getElementById('status').textContent));
}

for(const mode of ['paint','brush']) {
  test(mode+': palettes, next/surprise, save before 450ms, categories and mode navigation',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      assert.equal(await page.locator('#paletteSelect option').count(),4);
      await selectPalette(page,'pastel');
      assert.equal(await page.locator('.color-swatch').count(),12);
      await paint(page,mode);
      const expected=await pixel(page);
      assert.notDeepEqual(expected,[255,255,255,255]);
      assert.deepEqual(await pixel(page,12,5),[0,0,0,255]);
      const original=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await page.locator('#nextBtn').click();
      await ready(page);
      assert.equal(await page.evaluate(()=>currentAsset.slug),'perro');
      const saved=await page.evaluate(async mode=>(await PaintMe.loadLocalDrawing(mode,'gato')).dataUrl,mode==='paint'?'bucket':'brush');
      assert.equal(saved,original);
      await page.locator('#otherActions').evaluate(element=>{element.open=true;});
      await page.locator('#surpriseBtn').click();
      await ready(page);
      assert.equal(await page.evaluate(()=>currentAsset.slug),'gato');
      await restore(page);
      assert.deepEqual(await pixel(page),expected);
      await page.locator('#galleryBrowser').evaluate(element=>{element.open=true;});
      await page.locator('.category-chip').filter({hasText:'Vehículos'}).click();
      await ready(page);
      assert.equal(await page.evaluate(()=>currentAsset.slug),'auto');
      await paint(page,mode);
      const vehicle=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await page.locator('#allBtn').click();
      await ready(page);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),vehicle);
      await selectDrawing(page,'gato');
      await ready(page);
      await restore(page);
      assert.deepEqual(await pixel(page),expected);
      await paint(page,mode);
      const slug=await page.evaluate(()=>currentAsset.slug);
      await page.locator('#adultArea > summary').click();
      page.once('dialog', dialog => dialog.accept());
      await page.locator('a[href="'+(mode==='paint'?'brush':'paint')+'.html"]').click();
      await page.waitForURL(url => url.pathname.endsWith('/'+(mode==='paint'?'brush':'paint')+'.html') && url.searchParams.get('asset')===slug);
      const record=await page.evaluate(async({mode,slug})=>PaintMe.loadLocalDrawing(mode,slug),{mode:mode==='paint'?'bucket':'brush',slug});
      assert(record);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': immediate reload and 10 complete undo/save/restore journeys',async()=>{
    const {page,context,errors}=await editor(mode,{viewport:{width:1280,height:800}});
    try {
      for(let i=0;i<10;i++) {
        await selectPalette(page,i%2?'pastel':'brillante');
        await paint(page,mode);
        await page.locator('#undoBtn').click();
        assert.deepEqual(await pixel(page),[255,255,255,255]);
        await paint(page,mode);
        const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
        await page.reload();
        await ready(page);
        await restore(page);
        assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected);
        await resetDrawing(page);
        assert.equal(await page.evaluate(mode=>PaintMe.loadLocalDrawing(mode,'gato'),mode==='paint'?'bucket':'brush'),null);
      }
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': storage unavailable blocks unsafe transition and can recover',async()=>{
    const {page,context,errors}=await editor(mode,{blocked:true});
    try {
      await paint(page,mode);
      await page.locator('#nextBtn').click();
      await page.waitForFunction(()=>!switchingAsset);
      assert.equal(await page.evaluate(()=>currentAsset.slug),'gato');
      assert.match(await page.locator('#status').textContent(),/No pudimos guardar/);
      await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem;});
      await page.locator('#nextBtn').click();
      await ready(page);
      assert.equal(await page.evaluate(()=>currentAsset.slug),'perro');
      assert.notEqual(await page.evaluate(mode=>PaintMe.loadLocalDrawing(mode,'gato'),mode==='paint'?'bucket':'brush'),null);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': obsolete autosave callback cannot announce a newer revision as saved',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await page.evaluate(async()=>{
        autosave.schedule(currentAsset.slug,canvas.toDataURL('image/png'),drawingRevision-1);
        setStatus('Estado de la revisión nueva');
        await autosave.flush();
      });
      assert.equal(await page.locator('#status').textContent(),'Estado de la revisión nueva');
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
}
test('fallback runs with real canvas and preserves the same boundaries',async()=>{
  const {page,context,errors}=await editor('paint',{fallback:true});
  try {
    await paint(page,'paint');
    assert.deepEqual(await pixel(page),[239,83,80,255]);
    assert.deepEqual(await pixel(page,12,5),[0,0,0,255]);
    assert.deepEqual(await pixel(page,16,5),[255,255,255,255]);
    await page.reload();
    await ready(page); await restore(page);
    assert.deepEqual(await pixel(page),[239,83,80,255]);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});
test('brush saves a live unfinished stroke before reload',async()=>{
  const {page,context,errors}=await editor('brush');
  try {
    await paint(page,'brush',{release:false});
    const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
    await page.reload(); await page.mouse.up();
    await ready(page); await restore(page);
    assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});
test('both editors load the actual catalog and images without JavaScript errors',async()=>{
  for(const mode of ['paint','brush']) {
    const {page,context,errors}=await editor(mode,{fixture:false});
    try {
      assert.equal(await page.evaluate(()=>ASSETS_LIST.length),62);
      assert.equal(await page.locator('#paletteSelect option').count(),4);
      assert(await page.evaluate(()=>canvas.width>24 && canvas.width<=1200));
      await page.locator('#nextBtn').click(); await ready(page);
      assert.notEqual(await page.evaluate(()=>currentAsset.slug),'gato');
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  }
});

for (const mode of ['paint','brush']) test(mode+': English pilot preserves language, local work, gallery and PNG export',async()=>{
  const {page,context,errors}=await editor(mode,{fixture:false});
  try {
    await page.goto(origin+'/'+mode+'.html?lang=en&asset=triceratops&category=dinosaurios');await ready(page);
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.equal(await page.evaluate(()=>ASSETS_LIST.length),4);
    assert.equal(await page.locator('#saveBtn').innerText(),'Download PNG');
    await page.locator('#galleryBrowser').evaluate(node=>node.open=true);
    assert.equal(await page.locator('#assetGallery .asset-card').count(),4);
    assert.equal(await page.locator('#categoryFilters').innerText(),'All\nDinosaurs');
    assert.equal(await page.locator('#palette').getAttribute('aria-label'),'Choose a color');
    for (const palette of ['base','pastel','naturaleza','brillante']) {
      await selectPalette(page,palette);
      const names=await page.locator('.color-swatch').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')));
      assert(!names.some(name=>/Rojo|Rosa|Morado|Índigo|Amarillo|Verde|Azul|Gris|Naranja|Marrón/.test(name)),names.join(', '));
    }
    await selectPalette(page,'base');
    await paint(page,mode);
    const snapshot=async()=>page.evaluate(async()=>{ const data=ctx.getImageData(0,0,canvas.width,canvas.height).data; for(let i=0;i<lineMask.length;i++) if(lineMask[i]) data.fill(0,i*4,i*4+4); return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).join(','); });
    const expected=await snapshot();
    await page.waitForFunction(()=>document.getElementById('localSaveStatus').dataset.state==='saved');
    assert.equal(await page.locator('#localSaveStatus').innerText(),'Saved on this device');
    const downloading=page.waitForEvent('download');await page.locator('#saveBtn').click();const download=await downloading;
    assert(download.suggestedFilename().endsWith('.png'));
    await page.reload();await ready(page);await restore(page);
    // The legacy brush composite reconstruction has a separate pending antialiased-outline check.
    assert.equal(await snapshot(),expected);
    await page.locator('#adultArea').evaluate(node=>node.open=true);
    page.once('dialog',dialog=>{assert(dialog.message().startsWith('Your drawing is saved'));return dialog.accept();});
    const other=mode==='paint'?'brush':'paint';
    await page.locator('a[href="'+other+'.html"]').click();await ready(page);
    assert.equal(new URL(page.url()).searchParams.get('lang'),'en');
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.equal(await page.evaluate(()=>currentAsset.slug),'triceratops');
    const body=await page.locator('body').innerText();
    assert(!/Deshacer|Guardar preferencias|Zona para adultos|Cargando dibujo|Pocos detalles/.test(body),body);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});

test('English resource and Spanish activity have reciprocal language navigation and privacy controls',async()=>{
  const context=await browser.newContext({ignoreHTTPSErrors:true}), page=await context.newPage();
  const external=[];
  page.on('request',request=>{if(new URL(request.url()).origin!==origin) external.push(request.url());});
  try {
    await page.goto(origin+'/en/dinosaur-coloring.html');
    assert((await page.locator('.grid .card').first().boundingBox()).width < 400);
    await page.locator('.privacy-controls').evaluate(node=>node.open=true);
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.equal(await page.locator('link[hreflang="es"]').getAttribute('href'),'https://www.paintme.club/packs/dinosaurios.html');
    assert.equal(await page.locator('#consentReject').innerText(),'Reject');
    await page.locator('#consentReject').click();
    assert.equal(await page.locator('#consentAccept').innerText(),'Save preferences');
    assert((await page.locator('#privacyStatus').innerText()).startsWith('External analytics'));
    if(process.env.PAINTME_EVIDENCE_DIR) {
      fs.mkdirSync(process.env.PAINTME_EVIDENCE_DIR,{recursive:true});
      await page.locator('.privacy-controls').evaluate(node=>node.open=false);
      await page.screenshot({path:path.join(process.env.PAINTME_EVIDENCE_DIR,'english-resource-'+engineName+'.png'),fullPage:true});
      await page.setViewportSize({width:390,height:844});
      await page.screenshot({path:path.join(process.env.PAINTME_EVIDENCE_DIR,'english-resource-mobile-'+engineName+'.png'),fullPage:true});
    }
    await page.goto(origin+'/packs/dinosaurios.html');
    assert.equal(await page.locator('link[hreflang="en"]').getAttribute('href'),'https://www.paintme.club/en/dinosaur-coloring.html');
    assert.deepEqual(external,[]);
  } finally {await context.close();}
});

for(const mode of ['paint','brush']) test(mode+': closing a tab keeps the latest image for a new tab',async()=>{
  const {page,context,errors}=await editor(mode);
  try {
    await paint(page,mode);
    const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
    const closed=page.waitForEvent('close');
    await page.close({runBeforeUnload:true});
    await closed;
    const reopened=await context.newPage();
    reopened.on('pageerror',error=>errors.push(error.message));
    await reopened.goto(origin+'/'+mode+'.html?asset=gato&category=animales');
    await ready(reopened); await restore(reopened);
    assert.equal(await reopened.evaluate(()=>canvas.toDataURL('image/png')),expected);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});
test('previous autosave completion cannot clear a live brush stroke as saved',async()=>{
  const {page,context,errors}=await editor('brush');
  try {
    await paint(page,'brush');
    await selectPalette(page,'brillante');
    await paint(page,'brush',{release:false});
    await page.evaluate(()=>autosave.flush());
    assert.equal(await page.evaluate(()=>hasUnsavedChanges),true);
    const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
    await page.reload(); await page.mouse.up();
    await ready(page); await restore(page);
    assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});


async function expectedPixels(page) {
  return page.evaluate(()=>Array.from(ctx.getImageData(0,0,canvas.width,canvas.height).data));
}
async function checkDownloadedPng(page,download,expected,filename) {
  assert.equal(download.suggestedFilename(),filename);
  assert.equal(await download.failure(),null);
  const file=await download.path();
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  assert.equal(bytes.readUInt32BE(16),24);
  assert.equal(bytes.readUInt32BE(20),24);
  const decoded=await page.evaluate(async base64=>{
    const image=new Image();
    const loaded=new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;});
    image.src='data:image/png;base64,'+base64;
    await loaded;
    const copy=document.createElement('canvas');copy.width=image.width;copy.height=image.height;
    const copyContext=copy.getContext('2d');copyContext.drawImage(image,0,0);
    return Array.from(copyContext.getImageData(0,0,copy.width,copy.height).data);
  },bytes.toString('base64'));
  assert.deepEqual(decoded,expected);
}
async function downloadDrawing(page) {
  const pending=page.waitForEvent('download');
  await page.locator('#saveBtn').click();
  const download=await pending;
  await page.waitForFunction(()=>!exportInProgress);
  return download;
}

for(const mode of ['paint','brush']) {
  const storageMode=mode==='paint'?'bucket':'brush';
  const filename=mode==='paint'?'gato.png':'gato-pincel.png';
  test(mode+': persistent error, retry and saved status are independent of tools',async()=>{
    const {page,context,errors}=await editor(mode,{blocked:true});
    try {
      await paint(page,mode);
      const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await page.waitForFunction(()=>document.getElementById('localSaveStatus').dataset.state==='error');
      assert.equal(await page.locator('#retrySaveBtn').isVisible(),true);
      await selectPalette(page,'pastel');
      assert.equal(await page.locator('#localSaveStatus').getAttribute('data-state'),'error');
      await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem;});
      await page.locator('#retrySaveBtn').click();
      await page.waitForFunction(()=>document.getElementById('localSaveStatus').dataset.state==='saved');
      assert.equal(await page.locator('#retrySaveBtn').isVisible(),false);
      assert.equal(await page.evaluate(async mode=>(await PaintMe.loadLocalDrawing(mode,'gato')).dataUrl,storageMode),expected);
      await selectPalette(page,'brillante');
      assert.equal(await page.locator('#localSaveStatus').getAttribute('data-state'),'saved');
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': reset cancellation, confirmation, undo and reload preserve artwork',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);
      const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await resetDrawing(page,false);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      await resetDrawing(page,true);
      assert.deepEqual(await pixel(page),[255,255,255,255]);
      assert.equal(await page.locator('#undoBtn').textContent(),'Recuperar reinicio');
      assert.equal(await page.evaluate(mode=>PaintMe.loadLocalDrawing(mode,'gato'),storageMode),null);
      await page.locator('#undoBtn').click();
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      await page.evaluate(()=>autosave.flush());
      await page.reload();await ready(page);await restore(page);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': failed reset persistence retains undo recovery',async()=>{
    const {page,context,errors}=await editor(mode,{blocked:true});
    try {
      await paint(page,mode);
      const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await resetDrawing(page);
      assert.equal(await page.locator('#localSaveStatus').getAttribute('data-state'),'error');
      assert.equal(await page.locator('#undoBtn').textContent(),'Recuperar reinicio');
      await page.locator('#undoBtn').click();
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem;});
      await page.evaluate(()=>autosave.flush());
      assert.equal(await page.evaluate(async mode=>(await PaintMe.loadLocalDrawing(mode,'gato')).dataUrl,storageMode),before);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': repeated PNG downloads open with exact dimensions and pixels',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);
      const expected=await expectedPixels(page);
      await page.evaluate(()=>{
        window.__revocations=[];
        const native=URL.revokeObjectURL.bind(URL);
        URL.revokeObjectURL=url=>{window.__revocations.push(url);native(url);};
      });
      for(let i=0;i<3;i++) {
        const download=await downloadDrawing(page);
        await checkDownloadedPng(page,download,expected,filename);
      }
      assert.equal(await page.locator('#saveBtn').textContent(),'Descargar PNG');
      assert.equal(await page.locator('#exportStatus').getAttribute('data-state'),'ready');
      assert.equal(await page.evaluate(()=>window.__revocations.length),0);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': null blob exposes a usable preview and alternative download',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);
      const expected=await expectedPixels(page);
      await page.evaluate(()=>{
        window.__nativeToBlob=HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob=function(callback){callback(null);};
      });
      await page.locator('#saveBtn').click();
      await page.waitForFunction(()=>!exportInProgress);
      assert.equal(await page.locator('#exportStatus').getAttribute('data-state'),'error');
      assert.equal(await page.locator('#pngPreviewBtn').isVisible(),true);
      await page.locator('#pngPreviewBtn').click();
      await page.locator('#pngPreviewDialog').waitFor({state:'visible'});
      await page.waitForFunction(()=>document.getElementById('pngPreviewImage').naturalWidth===24);
      if(process.env.PAINTME_EVIDENCE_DIR) {
        fs.mkdirSync(process.env.PAINTME_EVIDENCE_DIR,{recursive:true});
        await page.screenshot({path:path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-'+mode+'-png-preview.png')});
      }
      const pending=page.waitForEvent('download');
      await page.locator('#pngFallbackDownload').click();
      await checkDownloadedPng(page,await pending,expected,filename);
      await page.locator('#pngPreviewDialog button').click();
      await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=window.__nativeToBlob;});
      await checkDownloadedPng(page,await downloadDrawing(page),expected,filename);
      assert.deepEqual(await expectedPixels(page),expected);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': corrupt saved image leaves the canvas intact and painting can continue',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await page.evaluate(async mode=>{
        await PaintMe.saveLocalDrawing(mode,'gato','data:image/png;base64,not-a-valid-png');
        await updateRestoreButton();
      },storageMode);
      await page.locator('#restoreBtn').click();
      await page.waitForFunction(()=>!restoringDrawing);
      assert.equal(await page.locator('#localSaveStatus').getAttribute('data-state'),'error');
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      assert.equal(await page.locator('#restoreBtn').isVisible(),false);
      await paint(page,mode);await page.evaluate(()=>autosave.flush());
      await page.reload();await ready(page);await restore(page);
      assert.notDeepEqual(await pixel(page),[255,255,255,255]);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': restoring locks conflicting actions and ignores an obsolete decoded image',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);await page.evaluate(()=>autosave.flush());
      await page.reload();await ready(page);
      const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await page.evaluate(()=>{
        const native=PaintMe.decodeSavedPng;
        PaintMe.decodeSavedPng=data=>new Promise((resolve,reject)=>{
          window.__releaseRestore=()=>native(data).then(resolve,reject);
        });
      });
      await page.locator('#restoreBtn').click();
      await page.waitForFunction(()=>Boolean(window.__releaseRestore));
      for(const id of ['nextBtn','resetBtn','saveBtn','undoBtn','restoreBtn']) assert.equal(await page.locator('#'+id).isDisabled(),true,id);
      assert.equal(await page.evaluate(async()=>{undo();await reset();return selectAssetBySlug('perro');}),false);
      await page.evaluate(()=>{drawingRevision+=1;window.__releaseRestore();});
      await page.waitForFunction(()=>!restoringDrawing);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      assert.equal(await page.evaluate(()=>currentAsset.slug),'gato');
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': late export callback cannot download a superseded drawing',async()=>{
    const {page,context,errors}=await editor(mode),downloads=[];
    page.on('download',download=>downloads.push(download));
    try {
      await paint(page,mode);
      await page.evaluate(()=>{
        window.__nativePng=PaintMe.canvasToPngBlob;
        PaintMe.canvasToPngBlob=snapshot=>new Promise((resolve,reject)=>{
          window.__releaseExport=()=>window.__nativePng(snapshot).then(resolve,reject);
        });
      });
      await page.locator('#saveBtn').click();
      await page.waitForFunction(()=>Boolean(window.__releaseExport));
      for(const id of ['nextBtn','resetBtn','saveBtn','undoBtn','restoreBtn']) assert.equal(await page.locator('#'+id).isDisabled(),true,id);
      const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
      assert.equal(await page.evaluate(async()=>{undo();await reset();return selectAssetBySlug('perro');}),false);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
      await page.evaluate(()=>{drawingRevision+=1;window.__releaseExport();});
      await page.waitForFunction(()=>!exportInProgress);
      assert.equal(downloads.length,0);
      assert.equal(await page.locator('#exportStatus').getAttribute('data-state'),'cancelled');
      await page.evaluate(()=>{PaintMe.canvasToPngBlob=window.__nativePng;});
      await checkDownloadedPng(page,await downloadDrawing(page),await expectedPixels(page),filename);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
}

test('fill result in flight blocks undo/reset/navigation and applies only to its revision',async()=>{
  const {page,context,errors}=await editor('paint',{workerDelay:true});
  try {
    await paint(page,'paint',{waitForFill:false});
    await page.waitForFunction(()=>Boolean(window.__deliverFill));
    for(const id of ['nextBtn','resetBtn','saveBtn','undoBtn','restoreBtn']) assert.equal(await page.locator('#'+id).isDisabled(),true,id);
    const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
    assert.equal(await page.evaluate(async()=>{undo();await reset();return selectAssetBySlug('perro');}),false);
    assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
    await page.evaluate(()=>window.__deliverFill());
    await page.waitForFunction(()=>!fillInProgress);
    assert.deepEqual(await pixel(page),[239,83,80,255]);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});
test('late worker reply cannot overwrite a newer revision',async()=>{
  const {page,context,errors}=await editor('paint',{workerDelay:true});
  try {
    await paint(page,'paint',{waitForFill:false});
    await page.waitForFunction(()=>Boolean(window.__deliverFill));
    const before=await page.evaluate(()=>canvas.toDataURL('image/png'));
    await page.evaluate(()=>{drawingRevision+=1;window.__deliverFill();});
    await page.waitForFunction(()=>!fillInProgress);
    assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),before);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});
test('worker error recovers through fallback without disabling the activity',async()=>{
  const {page,context,errors}=await editor('paint',{workerDelay:true});
  try {
    await paint(page,'paint',{waitForFill:false});
    await page.waitForFunction(()=>Boolean(window.__deliverFill));
    await page.evaluate(()=>fillWorker.dispatchEvent(new Event('error',{cancelable:true})));
    await page.waitForFunction(()=>!fillInProgress);
    assert.deepEqual(await pixel(page),[239,83,80,255]);
    assert.equal(await page.evaluate(()=>fillWorker),null);
    await page.locator('#undoBtn').click();
    await paint(page,'paint');
    assert.deepEqual(await pixel(page),[239,83,80,255]);
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});

for(const mode of ['paint','brush']) for(const width of [360,390,768,1280]) {
  test(mode+': export/restore at '+width+'px'+(width<600?' with touch emulation':''),async()=>{
    const {page,context,errors}=await editor(mode,{viewport:{width,height:width<600?844:1024},touch:width<600});
    try {
      if(width<600) {
        await page.locator('#canvas').scrollIntoViewIfNeeded();
        const box=await page.locator('#canvas').boundingBox();
        await page.touchscreen.tap(box.x+box.width*5/24,box.y+box.height*5/24);
        if(mode==='paint') await page.waitForFunction(()=>!fillInProgress);
      } else await paint(page,mode);
      assert.notDeepEqual(await pixel(page),[255,255,255,255]);
      const expected=await expectedPixels(page);
      await checkDownloadedPng(page,await downloadDrawing(page),expected,mode==='paint'?'gato.png':'gato-pincel.png');
      await page.reload();await ready(page);await restore(page);
      assert.deepEqual(await expectedPixels(page),expected);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
}


for(const mode of ['paint','brush']) {
  test(mode+': obsolete bitmap cannot replace a more recent image load',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await context.route('**/assets/test-perro.png',route=>route.fulfill({contentType:'image/png',body:fixturePNG(8)}));
      const bitmapSupported=await page.evaluate(()=>typeof createImageBitmap==='function');
      if(!bitmapSupported) {
        // The Image path is still exercised by all normal catalog tests.
        throw new Error('This test requires the bitmap path; do not silently skip it.');
      }
      await page.evaluate(()=>{
        const native=createImageBitmap;
        let first=true;
        window.createImageBitmap=async blob=>{
          const bitmap=await native(blob);
          if(!first) return bitmap;
          first=false;
          return new Promise(resolve=>{window.__releaseBitmap=()=>resolve(bitmap);});
        };
        window.__oldImageLoad=loadImage('assets/test-gato.png');
      });
      await page.waitForFunction(()=>Boolean(window.__releaseBitmap));
      await page.evaluate(()=>loadImage('assets/test-perro.png'));
      const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
      assert.deepEqual(await pixel(page,12,5),[255,255,255,255]);
      await page.evaluate(async()=>{window.__releaseBitmap();await window.__oldImageLoad;});
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': rejecting again from privacy preferences preserves drawing and denies flags',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);
      const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await page.locator('#adultArea').evaluate(element=>{element.open=true;});
      await page.locator('#privacySettingsBtn').click();
      await page.locator('#consentAccept').click();
      await page.locator('#adultArea').evaluate(element=>{element.open=true;});
      await page.locator('#privacySettingsBtn').click();
      await page.locator('#consentReject').click();
      const preferences=await page.evaluate(()=>JSON.parse(localStorage.getItem(PaintMePrivacy.KEY)));
      assert.equal(preferences.analytics,false);assert.equal(preferences.ads,false);
      assert.equal(await page.evaluate(()=>PaintMePrivacy.allowed('analytics') || PaintMePrivacy.allowed('ads')),false);
      assert.equal(await page.evaluate(()=>window.dataLayer.length),0);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected);
      await page.evaluate(()=>autosave.flush());
      await page.reload();await ready(page);await restore(page);
      assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
}


for(const mode of ['paint','brush']) {
  test(mode+': network failure and stalled image decode release controls and allow retry',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);
      const original=await page.evaluate(()=>canvas.toDataURL('image/png'));
      await context.route('**/assets/test-perro.png',route=>route.fulfill({status:503,body:'Unavailable'}));
      await page.locator('#nextBtn').click();
      await page.waitForFunction(()=>!switchingAsset && !isImageLoaded);
      assert.equal(await page.locator('#assetSelect').isEnabled(),true);
      assert.match(await page.locator('#status').textContent(),/No se pudo cargar/);
      assert.equal(await page.evaluate(async mode=>(await PaintMe.loadLocalDrawing(mode,'gato')).dataUrl,mode==='paint'?'bucket':'brush'),original);
      await context.unroute('**/assets/test-perro.png');
      await page.evaluate(()=>{
        window.__nativeBitmap=createImageBitmap;
        window.__nativeTimeout=setTimeout;
        window.createImageBitmap=()=>new Promise(resolve=>{window.__decodeLate=resolve;});
        window.setTimeout=(callback,ms,...args)=>window.__nativeTimeout(callback,ms===10000?40:ms,...args);
      });
      await page.evaluate(()=>selectAssetBySlug('perro'));
      assert.equal(await page.evaluate(()=>switchingAsset),false);
      assert.equal(await page.locator('#assetSelect').isEnabled(),true);
      assert.match(await page.locator('#status').textContent(),/No se pudo cargar/);
      await page.evaluate(()=>{
        window.__decodeLate({close(){window.__lateBitmapClosed=true;}});
        window.createImageBitmap=window.__nativeBitmap;
        window.setTimeout=window.__nativeTimeout;
      });
      await page.waitForFunction(()=>window.__lateBitmapClosed);
      await page.evaluate(()=>selectAssetBySlug('perro'));
      await ready(page);
      await paint(page,mode);
      assert.notDeepEqual(await pixel(page),[255,255,255,255]);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
}

for(const mode of ['paint','brush']) {
  test(mode+': redo preserves pixels, persists results and invalidates branches/reset/load',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await paint(page,mode);const colored=await expectedPixels(page);
      await page.locator('#undoBtn').click();
      assert.equal(await page.locator('#redoBtn').isEnabled(),true);
      await page.locator('#redoBtn').click();assert.deepEqual(await expectedPixels(page),colored);
      await page.evaluate(()=>autosave.flush());await page.reload();await ready(page);await restore(page);
      assert.deepEqual(await expectedPixels(page),colored);assert.equal(await page.locator('#redoBtn').isDisabled(),true);
      await resetDrawing(page);await page.locator('#undoBtn').click();assert.deepEqual(await expectedPixels(page),colored);
      await page.locator('#redoBtn').click();assert.deepEqual(await pixel(page),[255,255,255,255]);
      await page.locator('#undoBtn').click();
      await selectPalette(page,'brillante');await paint(page,mode);
      assert.equal(await page.locator('#redoBtn').isDisabled(),true);
      await page.locator('#nextBtn').click();await ready(page);
      assert.equal(await page.locator('#redoBtn').isDisabled(),true);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': local gallery includes real copies, restores across categories and respects deletion',async()=>{
    const {page,context,errors}=await editor(mode);
    const storageMode=mode==='paint'?'bucket':'brush';
    try {
      await paint(page,mode);const expected=await expectedPixels(page);await page.evaluate(()=>autosave.flush());
      await page.locator('#galleryBrowser > summary').click();
      await page.waitForFunction(()=>document.querySelectorAll('.saved-card').length===1);
      await page.locator('.category-chip').filter({hasText:'Vehículos'}).click();await ready(page);
      await page.locator('.saved-card').click();await page.waitForFunction(()=>currentAsset.slug==='gato' && !restoringDrawing && document.getElementById('status').textContent==='Dibujo restaurado');
      assert.deepEqual(await expectedPixels(page),expected);
      await page.evaluate(async mode=>{await PaintMe.clearLocalDrawing(mode,'gato');await refreshSavedGallery();},storageMode);
      assert.equal(await page.locator('.saved-card').count(),0);
      await page.evaluate(async mode=>{await PaintMe.saveLocalDrawing(mode,'gato','data:image/png;base64,broken');await refreshSavedGallery();},storageMode);
      await page.waitForFunction(()=>document.querySelector('.saved-card')?.dataset.unreadable==='true');
      assert.equal(await page.locator('.saved-card').isDisabled(),true);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  test(mode+': color names, keyboard state, dialog focus and adult printing preserve artwork',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      assert.equal(await page.locator('.color-swatch').first().getAttribute('aria-label'),'Rojo');
      await page.locator('.color-swatch').nth(1).focus();await page.keyboard.press('Space');
      assert.equal(await page.locator('.color-swatch').nth(1).getAttribute('aria-pressed'),'true');
      assert.equal(await page.locator('.color-swatch[aria-pressed="true"]').count(),1);
      const contrasts=await page.evaluate(()=>{
        const luminance=color=>{
          const channels=color.match(/[\d.]+/g).slice(0,3).map(value=>{
            const channel=Number(value)/255;return channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;
          });
          return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;
        };
        return ['saveBtn','nextBtn','status','localSaveStatus'].map(id=>{
          const element=document.getElementById(id),style=getComputedStyle(element);
          const background=style.backgroundColor==='rgba(0, 0, 0, 0)'?'rgb(255, 255, 255)':style.backgroundColor;
          const a=luminance(style.color),b=luminance(background);
          return {id,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
        });
      });
      for(const value of contrasts) assert(value.ratio>=4.5,JSON.stringify(value));

      await paint(page,mode);const expected=await expectedPixels(page);
      await page.locator('#otherActions').evaluate(element=>{element.open=true;});
  await page.locator('#resetBtn').click();await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!switchingAsset);
      assert.equal(await page.evaluate(()=>document.activeElement.id),'resetBtn');
      assert.deepEqual(await expectedPixels(page),expected);
      await page.locator('#adultArea > summary').click();
      await page.evaluate(()=>{window.print=()=>{window.__printed=Boolean(document.getElementById('printPreviewImage').complete);};});
      await page.locator('#printDrawingBtn').click();await page.waitForFunction(()=>window.__printed);
      assert.deepEqual(await expectedPixels(page),expected);
      assert.equal(await page.locator('.ad-slot').count(),0);
      assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
  for(const viewport of [{width:360,height:844},{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1280,height:800}]) {
    test(mode+': actual drawing starts in viewport '+viewport.width+'x'+viewport.height,async()=>{
      const {page,context,errors}=await editor(mode,{fixture:false,viewport});
      try {
        await page.evaluate(()=>window.scrollTo(0,0));await page.waitForFunction(()=>!fitRaf);
        const layout=await page.evaluate(()=>{
          const box=canvas.getBoundingClientRect();
          const save = document.getElementById('saveBtn').getBoundingClientRect();
          return {saveBottom:save.bottom,top:box.top,bottom:box.bottom,width:box.width,height:box.height,screen:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,tools:document.getElementById('toolOptions').open};
        });
        assert(layout.top>=0 && layout.bottom<=layout.screen,JSON.stringify(layout));
        assert(layout.width>=100 && layout.height>=90,JSON.stringify(layout));
        assert(layout.saveBottom<=layout.screen,JSON.stringify(layout));
        assert.equal(layout.overflow,false);assert.equal(layout.tools,false);
        if(process.env.PAINTME_EVIDENCE_DIR) await page.screenshot({path:path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-'+mode+'-'+viewport.width+'x'+viewport.height+'.png')});
        assert.deepEqual(errors,[]);
      } finally {await context.close();}
    });
  }
}
test('home preview has no fictitious buttons and adult contact only uses configured safe links',async()=>{
  const {page,context,errors}=await editor('paint');
  try {
    await page.goto(origin+'/index.html');
    assert.equal(await page.locator('.app-card-toolbar button').count(),0);
    assert.equal(await page.locator('.hero-copy a').first().getAttribute('href'),'paint.html?asset=dinosaurio&category=dinosaurios&source=home');
    assert.equal(await page.locator('.category-card').first().getAttribute('href'),'categorias/animales.html');
    await context.route('**/site-config.json',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({contact:{email:'operator@example.test',url:'javascript:alert(1)'}})}));
    await page.goto(origin+'/adults.html');await page.waitForFunction(()=>document.querySelectorAll('#contactLinks a').length===1);
    assert.equal(await page.locator('#contactLinks a').getAttribute('href'),'mailto:operator@example.test');
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});

test('recategorized existing pages open the requested drawing in both modes', {timeout:120000},async()=>{
  const {page,context,errors}=await editor('paint',{fixture:false});
  const entries=JSON.parse(fs.readFileSync(path.join(web,'../base_png/catalog.json'))).drawings;
  try {
    for(const slug of ['casa-1','casa-2','casa-3','casa-4','casa-5','casa-simple','paisaje-3','paisaje-4','paisaje-5']) {
      for(const mode of ['paint','brush']) {
        await page.goto(origin+'/dibujos/'+slug+'.html');
        await page.locator('.actions a[href*="'+mode+'.html"]').click();
        await ready(page);
        assert.deepEqual(await page.evaluate(()=>({slug:currentAsset.slug,category:currentAsset.category})),{slug,category:entries.find(item=>item.slug===slug).category});
      }
    }
    assert.deepEqual(errors,[]);
  } finally {await context.close();}
});

for(const mode of ['paint','brush']) {
  test(mode+': every real catalog drawing paints and exports its actual pixels', {timeout:240000},async()=>{
    const {page,context,errors}=await editor(mode,{fixture:false,viewport:{width:1280,height:800}});
    const report=[];
    try {
      const assets=await page.evaluate(()=>ASSETS_LIST.map(asset=>({slug:asset.slug,label:asset.label})));
      for(const asset of assets) {
        await page.evaluate(async slug=>{await changeCategory('');await selectAssetBySlug(slug);},asset.slug);
        await ready(page);
        const original=await page.evaluate(()=>canvas.toDataURL('image/png'));
        await page.evaluate(mode=>{
          const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
          let point;
          const cx=Math.floor(canvas.width/2),cy=Math.floor(canvas.height/2);
          for(let radius=0;radius<canvas.width/2 && !point;radius++) {
            for(const x of [cx-radius,cx+radius]) {
              const index=cy*canvas.width+x,offset=index*4;
              if(!lineMask[index] && pixels[offset]>245 && pixels[offset+1]>245 && pixels[offset+2]>245) {point={x,y:cy};break;}
            }
          }
          if(!point) throw Error('No paintable seed: '+currentAsset.slug);
          if(mode==='paint') fillAtPoint(point);
          else {pushUndo();drawingRevision++;drawBrushSegment(point,point);setUnsavedChanges(true);scheduleAutosave();}
        },mode);
        if(mode==='paint') await page.waitForFunction(()=>!fillInProgress);
        assert.notEqual(await page.evaluate(()=>canvas.toDataURL('image/png')),original,asset.slug+' unchanged');
        const expected=await page.evaluate(async()=>({
          width:canvas.width,height:canvas.height,
          hash:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,canvas.width,canvas.height).data))).map(value=>value.toString(16).padStart(2,'0')).join('')
        }));
        const download=await downloadDrawing(page),bytes=fs.readFileSync(await download.path());
        assert.equal(bytes.subarray(1,4).toString(),'PNG');
        const actual=await page.evaluate(async base64=>{
          const image=await PaintMe.decodeSavedPng('data:image/png;base64,'+base64);
          const surface=document.createElement('canvas');surface.width=image.width;surface.height=image.height;
          const context=surface.getContext('2d');context.drawImage(image,0,0);
          return {width:image.width,height:image.height,hash:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',context.getImageData(0,0,surface.width,surface.height).data))).map(value=>value.toString(16).padStart(2,'0')).join('')};
        },bytes.toString('base64'));
        assert.deepEqual(actual,expected,asset.slug);
        report.push({slug:asset.slug,mode,...expected,paint_export:'passed',manual_contours:'pending'});
        if(process.env.PAINTME_EVIDENCE_DIR) {
          const thumbnail=await page.evaluate(()=>{const image=document.createElement('canvas');image.width=image.height=180;image.getContext('2d').drawImage(canvas,0,0,180,180);return image.toDataURL('image/png');});
          const folder=path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-artwork-'+mode);fs.mkdirSync(folder,{recursive:true});
          fs.writeFileSync(path.join(folder,asset.slug+'.png'),Buffer.from(thumbnail.split(',')[1],'base64'));
        }
      }
      assert.equal(report.length,62);assert.deepEqual(errors,[]);
    } finally {
      if(process.env.PAINTME_EVIDENCE_DIR) fs.writeFileSync(path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-artwork-'+mode+'.json'),JSON.stringify(report,null,2)+'\n');
      await context.close();
    }
  });
}

test('default build makes no third-party requests in undecided/save/reject/revoke states across all page types', {timeout:120000},async()=>{
  const report=[];
  for(const target of ['index.html','paint.html?asset=dinosaurio&category=dinosaurios','brush.html?asset=dinosaurio&category=dinosaurios','adults.html','privacy.html','categorias/animales.html','packs/animales.html']) {
    const har=process.env.PAINTME_EVIDENCE_DIR ? path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-privacy-'+target.split('?')[0].replaceAll('/','-')+'.har') : undefined;
    const context=await browser.newContext({ignoreHTTPSErrors:true,...(har ? {recordHar:{path:har,content:'omit',mode:'minimal'}} : {})});
    const page=await context.newPage(),requests=[],errors=[];
    page.on('request',request=>requests.push({url:request.url(),type:request.resourceType()}));page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto(origin+'/'+target);await page.waitForLoadState('networkidle');
      if(target.startsWith('paint')||target.startsWith('brush')) {await ready(page);await page.locator('#adultArea').evaluate(node=>node.open=true);}
      else await page.locator('details.privacy-controls').evaluate(node=>node.open=true);
      const canvasBefore=await page.evaluate(()=>document.getElementById('canvas')?.toDataURL()||null);
      for(const [state,button] of [['undecided',null],['save','#consentAccept'],['reject','#consentReject'],['revoke','#consentRevoke']]) {
        if(button) await page.locator(button).click();
        await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,50)));
        assert.equal(await page.evaluate(()=>PaintMePrivacy.allowed('analytics')||PaintMePrivacy.allowed('ads')),false);
        assert.equal(await page.evaluate(()=>window.dataLayer.length),0);
        assert.equal((await context.cookies()).length,0);
        assert.equal(requests.filter(request=>new URL(request.url).origin!==origin).length,0,JSON.stringify(requests));
        assert.equal(await page.evaluate(()=>document.getElementById('canvas')?.toDataURL()||null),canvasBefore);
        report.push({page:target.split('?')[0],state,third_party_requests:0,cookies:0,activity_preserved:true});
      }
      const policy=await page.locator('#consentBanner a').getAttribute('href');assert.equal(new URL(policy,page.url()).pathname,'/privacy.html');
      assert.deepEqual(errors,[]);
      if(process.env.PAINTME_EVIDENCE_DIR) await page.screenshot({path:path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-page-'+target.split('?')[0].replaceAll('/','-')+'.png'),fullPage:true});
    } finally {await context.close();}
  }
  if(process.env.PAINTME_EVIDENCE_DIR)fs.writeFileSync(path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-privacy-network.json'),JSON.stringify({scope:'Local default build; outbound requests not intercepted or blocked by the runner. CSP is active. HAR contains artificial test traffic only.',cases:report},null,2)+'\n');
});

for(const mode of ['paint','brush']) {
  test(mode+': quality events distinguish actual outcomes and send no data',async()=>{
    const {page,context,errors}=await editor(mode);
    try {
      await page.evaluate(()=>{window.__events=[];window.PaintMeAnalytics={track(name,params){const clean=PaintMeEvents.sanitize(name,params);if(clean)window.__events.push(clean);return false;}};});
      await context.route('**/assets/failure-probe.png',route=>route.fulfill({status:503,body:'unavailable'}));
      await page.evaluate(()=>loadImage('assets/failure-probe.png'));
      const loadFailure=await page.evaluate(()=>window.__events);
      assert.equal(loadFailure.filter(event=>event.name==='drawing_load_failure').length,1);
      assert.equal(loadFailure.filter(event=>event.name==='drawing_open').length,0);
      await page.evaluate(()=>loadImage(currentAsset.src));await ready(page);
      await paint(page,mode);await page.evaluate(()=>autosave.flush());
      await paint(page,mode);await page.evaluate(()=>autosave.flush());
      await downloadDrawing(page);
      const events=await page.evaluate(()=>window.__events);
      assert.equal(events.filter(event=>event.name==='drawing_open').length,1);
      assert.equal(events.filter(event=>event.name==='first_paint').length,1);
      assert(events.some(event=>event.name==='local_save_success'));
      assert(events.some(event=>event.name==='save_png'&&event.params.export_result==='download_requested'));
      assert(!events.some(event=>event.name.includes('opened_file')));
      await page.evaluate(()=>restoreSavedDrawing());
      assert.equal(await page.evaluate(()=>window.__events.filter(event=>event.name==='restore_success').length),1);
      await page.evaluate(()=>{HTMLCanvasElement.prototype.toBlob=function(callback){callback(null);};});
      await page.locator('#saveBtn').click();
      await page.waitForFunction(()=>window.__events.some(event=>event.name==='export_failure'));
      await page.evaluate(()=>{window.__events=[];Object.defineProperty(window,'indexedDB',{configurable:true,get(){throw Error('blocked');}});Storage.prototype.setItem=function(){throw Error('quota');};scheduleAutosave();});
      await page.evaluate(()=>autosave.flush());
      const failure=await page.evaluate(()=>window.__events);
      assert(failure.some(event=>event.name==='local_save_failure'));assert(!failure.some(event=>event.name==='local_save_success'));
      assert.equal(await page.evaluate(()=>dataLayer.length),0);assert.deepEqual(errors,[]);
    } finally {await context.close();}
  });
}

test('adult ad controller stays off by default, cleans revoked/late/failed mocks and never runs in editors',async()=>{
  const {page,context}=await editor('paint');
  try {
    await page.goto(origin+'/adults.html');
    const result=await page.evaluate(async()=>{
      const slot=document.getElementById('adultAdSlot');let permitted=false,calls=0,releases=0,changed=()=>{},resolve;
      const controller=PaintMeAds.createController(slot,{allowed:()=>permitted,subscribe:callback=>{changed=callback;return()=>{};},request:()=>{calls++;return new Promise(done=>{resolve=done;});},timeout:20});
      await controller.show();const defaultOff=slot.hidden&&calls===0;
      permitted=true;const pending=controller.show();await Promise.resolve();permitted=false;changed();
      const node=document.createElement('div');node.textContent='Creatividad de prueba';resolve({node,dispose(){releases++;}});await pending;
      const revoked=slot.hidden&&releases===1;
      permitted=true;const late=controller.show();await new Promise(done=>setTimeout(done,40));
      const failed=slot.dataset.adState==='failed';resolve({node:document.createElement('div'),dispose(){releases++;}});await late;await Promise.resolve();
      controller.dispose();return{defaultOff,revoked,failed,releases};
    });
    assert.deepEqual(result,{defaultOff:true,revoked:true,failed:true,releases:2});
    await page.goto(origin+'/paint.html');await ready(page);
    await page.addScriptTag({url:origin+'/ad-slot.js'});
    assert.equal(await page.evaluate(async()=>{const container=document.createElement('div');document.body.append(container);let calls=0;const controller=PaintMeAds.createController(container,{allowed:()=>true,request:()=>{calls++;return null;}});await controller.show();controller.dispose();return calls;}),0);
  } finally {await context.close();}
});

async function switchMode(page, accept) {
  const pendingDialog = page.waitForEvent('dialog');
  const click = page.locator('.mode-link').click();
  const dialog = await pendingDialog;
  assert.match(dialog.message(), /trabajos separados/);
  if (accept) await dialog.accept(); else await dialog.dismiss();
  await click;
  if (!accept) await page.waitForFunction(() => !switchingAsset);
}
for (const mode of ['paint','brush']) test(mode+': mode switch cancel and round trip preserve asset and independent artwork', async () => {
  const {page,context,errors} = await editor(mode);
  try {
    await page.locator('#galleryBrowser').evaluate(element => { element.open = true; });
    await page.locator('.category-chip').filter({hasText:'Vehículos'}).click(); await ready(page); await paint(page,mode);
    const artwork = await page.evaluate(() => canvas.toDataURL('image/png'));
    await page.locator('#adultArea').evaluate(element => { element.open = true; });
    const other = mode === 'paint' ? 'brush' : 'paint';
    await switchMode(page, false);
    assert.equal(await page.evaluate(() => currentAsset.slug), 'auto');
    assert.equal(await page.evaluate(() => canvas.toDataURL('image/png')), artwork);
    await switchMode(page, true);
    await page.waitForURL(url => url.pathname.endsWith('/'+other+'.html') && url.searchParams.get('asset') === 'auto');
    await ready(page); assert.equal(await page.evaluate(() => currentAsset.slug), 'auto');
    assert.equal(new URL(page.url()).searchParams.get('source'), 'mode');
    await paint(page, other);
    const otherArtwork = await page.evaluate(() => canvas.toDataURL('image/png'));
    await page.locator('#adultArea').evaluate(element => { element.open = true; });
    await switchMode(page, true);
    await page.waitForURL(url => url.pathname.endsWith('/'+mode+'.html') && url.searchParams.get('asset') === 'auto');
    await ready(page); await restore(page);
    assert.equal(await page.evaluate(() => canvas.toDataURL('image/png')), artwork);
    assert.equal(await page.evaluate(async kind => (await PaintMe.loadLocalDrawing(kind, 'auto')).dataUrl, other==='paint'?'bucket':'brush'), otherArtwork);
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});

for (const mode of ['paint','brush']) test(mode+': sustained 1200px edits and saves keep history bounded', async () => {
  const {page,context,errors} = await editor(mode);
  try {
    await context.route('**/assets/test-gato.png', route => route.fulfill({contentType:'image/png', body:fixturePNG(600,1200)}));
    await page.reload(); await ready(page);
    await page.evaluate(() => {
      window.__longTasks=[];
      if (typeof PerformanceObserver==='function' && PerformanceObserver.supportedEntryTypes.includes('longtask')) {
        new PerformanceObserver(list => window.__longTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true});
      }
    });
    const timings=[];
    for (let i=0;i<20;i++) {
      await page.evaluate(i => { activeColor = '#'+(0x440000+i*4321).toString(16).padStart(6,'0'); }, i);
      const start=Date.now(); await paint(page,mode);
      await page.evaluate(async () => { await autosave.flush(); });
      timings.push(Date.now()-start);
    }
    const profile=await page.evaluate(() => ({
      width:canvas.width,height:canvas.height,
      history_steps:history.past.length+history.future.length,
      history_bytes:[...history.past,...history.future].reduce((sum,image)=>sum+image.data.byteLength,0),
      long_tasks_ms:window.__longTasks,js_heap_bytes:performance.memory?.usedJSHeapSize ?? null,
    }));
    assert.equal(profile.width,1200); assert.equal(profile.height,1200);
    assert(profile.history_bytes <= (mode==='paint'?32:48)*1024*1024);
    assert(profile.history_steps <= (mode==='paint'?10:20));
    await page.reload(); await ready(page); await restore(page);
    assert.deepEqual(errors, []);
    if (process.env.PAINTME_EVIDENCE_DIR) {
      fs.mkdirSync(process.env.PAINTME_EVIDENCE_DIR,{recursive:true});
      fs.writeFileSync(path.join(process.env.PAINTME_EVIDENCE_DIR,engineName+'-'+mode+'-performance.json'), JSON.stringify({
        scope:'Windows headless synthetic 1200px fixture; timings include automation and persistent save, not device CPU/RAM or child touch latency.',
        engine:engineName,mode,edit_and_save_wall_ms:timings,...profile
      },null,2));
    }
  } finally { await context.close(); }
});
