const assert = require('node:assert/strict');
const {test,before,after} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const https = require('node:https');
const os = require('node:os');
const crypto = require('node:crypto');
const playwright = require(process.env.PAINTME_PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname,'..');
const samplesRoot = path.join(root,'tools/coloring-generator/samples');
const evidence = path.join(root,'docs/qa-evidence/2026-10-07/coloring-generator');
const engine = process.env.PAINTME_BROWSER_ENGINE || 'chromium';
const samples = ['tortoise','fox','balloon','flower','house-photo'];
const reports = Object.fromEntries(samples.map(slug=>[slug,JSON.parse(fs.readFileSync(path.join(samplesRoot,'outputs',slug,'report.json')))]));
let browser, generator, generatorOrigin, productServer, productOrigin, certificateDirectory;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const drawing = slug => fs.readFileSync(path.join(samplesRoot,'outputs',slug,'drawing.png'));
const interior = slug => reports[slug].regions.filter(r=>!r.touches_edge && r.pixels>=16).sort((a,b)=>b.pixels-a.pixels)[0];

before(async()=>{
  fs.mkdirSync(evidence,{recursive:true});
  generator = cp.spawn(process.env.PAINTME_PYTHON_PATH || 'python',['scripts/coloring_generator.py','--serve','--port','0'],{cwd:root,windowsHide:true,stdio:['ignore','pipe','pipe']});
  generatorOrigin = await new Promise((resolve,reject)=>{
    let output='';const timer=setTimeout(()=>reject(Error('Local generator did not start')),20000);
    generator.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});
    generator.once('error',reject);generator.once('exit',code=>{clearTimeout(timer);reject(Error('Generator exited '+code));});
  });
  certificateDirectory=fs.mkdtempSync(path.join(os.tmpdir(),'coloring-https-'));
  const key=path.join(certificateDirectory,'key.pem'),cert=path.join(certificateDirectory,'cert.pem');
  const openssl=process.env.PAINTME_OPENSSL_PATH || (process.platform==='win32'?'C:\\Program Files\\Git\\usr\\bin\\openssl.exe':'openssl');
  cp.execFileSync(openssl,['req','-x509','-newkey','rsa:2048','-sha256','-nodes','-keyout',key,'-out',cert,'-subj','/CN=localhost','-days','1'],{stdio:'ignore',windowsHide:true});
  const web=path.join(root,'web'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
  productServer=https.createServer({key:fs.readFileSync(key),cert:fs.readFileSync(cert)},(request,response)=>{
    const filename=path.resolve(web,'.'+new URL(request.url,'http://localhost').pathname);
    if(!filename.startsWith(web+path.sep)){response.writeHead(403).end();return;}
    fs.readFile(filename,(error,data)=>{if(error)response.writeHead(404).end();else {response.setHeader('Content-Type',mime[path.extname(filename)]||'application/octet-stream');response.end(data);}});
  });
  await new Promise(resolve=>productServer.listen(0,'127.0.0.1',resolve));
  productOrigin='https://127.0.0.1:'+productServer.address().port;
  browser=await playwright[engine].launch({headless:true,...(engine==='chromium'?{executablePath:process.env.PAINTME_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'}:{})});
  console.log('Engine '+engine+' '+browser.version());
});
after(async()=>{
  await browser?.close();generator?.kill();
  if(productServer)await new Promise(resolve=>productServer.close(resolve));
  if(certificateDirectory){const p=path.resolve(certificateDirectory);assert.equal(path.dirname(p),path.resolve(os.tmpdir()));assert.ok(path.basename(p).startsWith('coloring-https-'));fs.rmSync(p,{recursive:true,force:true});}
});
async function lab(){const context=await browser.newContext({viewport:{width:1440,height:1050},acceptDownloads:true});const page=await context.newPage();await page.goto(generatorOrigin);await page.waitForSelector('[data-slug="tortoise"]');return {context,page};}
async function choose(page,slug){await page.locator('[data-slug="'+slug+'"]').click();await page.waitForFunction(slug=>responseData?.report.source_sha256===slug, reports[slug].source_sha256);}
async function canvasStats(page,expression){return page.evaluate(expression);}

test('Five originals: UI agrees with CLI, exact region fill, protected lines, reset and download',async()=>{
  const {page,context}=await lab();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{for(const slug of samples){
    await choose(page,slug);
    const report=await page.evaluate(()=>responseData.report);
    assert.equal(report.output_sha256.drawing,reports[slug].output_sha256.drawing,slug);
    assert.equal(report.review_required,true);assert.equal(report.tiny_regions_under_16px,0);
    const failures=await page.evaluate(()=>{
      const failures=[];for(const region of responseData.report.regions){const data=originalDrawing.data.slice();const [x,y]=region.seed;const task=PaintMeFill.createTask({width:canvas.width,height:canvas.height,startX:x,startY:y,fillColor:[55,100,200,255],tolerance:20,lineMask,buffer:data.buffer});if(!task){failures.push(region.id);continue;}while(!task.done)task.step(100000);let filled=0,damaged=0;for(let i=0;i<lineMask.length;i++){if(data[i*4]===55)filled++;if(lineMask[i] && data[i*4]!==0)damaged++;}if(filled!==region.pixels || damaged)failures.push(region.id);}return failures;
    });assert.deepEqual(failures,[],slug+' all reported regions agree with the product fill engine');
    const region=interior(slug);await page.locator('#result').scrollIntoViewIfNeeded();
    const rect=await page.locator('#result').boundingBox(),[x,y]=region.seed,[w,h]=report.web_size;
    await page.mouse.click(rect.x+(x+.5)*rect.width/w,rect.y+(y+.5)*rect.height/h);
    const stats=await canvasStats(page,()=>{const d=context.getImageData(0,0,canvas.width,canvas.height).data;let painted=0,damaged=0;for(let i=0;i<lineMask.length;i++){if(lineMask[i] && d[i*4]!==0)damaged++;if(d[i*4]===237 && d[i*4+1]===135 && d[i*4+2]===94)painted++;}return {painted,damaged};});
    assert.equal(stats.painted,region.pixels,slug+' region must stay closed');assert.equal(stats.damaged,0);
    const downloadEvent=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadEvent;
    const target=path.join(evidence,engine+'-'+slug+'-download.png');await download.saveAs(target);assert.equal(hash(fs.readFileSync(target)),report.output_sha256.drawing,'Preview paint must not alter downloadable original');
    await page.locator('#resetPreview').click();
    assert.equal(await page.evaluate(()=>{const d=context.getImageData(0,0,canvas.width,canvas.height).data;return d.every((v,i)=>v===originalDrawing.data[i]);}),true);
    if(slug==='fox')await page.screenshot({path:path.join(evidence,engine+'-desktop.png'),fullPage:true});
  }assert.deepEqual(errors,[]);}finally{await context.close();}
});
test('Pending conversion and settings changes discard stale results and allow regeneration',async()=>{
  const {page,context}=await lab();try{
    await choose(page,'tortoise');
    let release;const gate=new Promise(resolve=>release=resolve);
    await page.route('**/api/convert',async route=>{await gate;await route.continue();});
    await page.locator('#generate').click();
    await page.locator('#thickness').evaluate(e=>{e.value='7';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#generate').isEnabled(),true);assert.equal(await page.locator('#download').getAttribute('href'),null);
    release();await page.unrouteAll({behavior:'wait'});
    await page.waitForTimeout(1400);assert.equal(await page.evaluate(()=>responseData),null);
    await page.locator('#generate').click();await page.waitForFunction(()=>responseData?.report.options.thickness===7);
    assert.notEqual(await page.evaluate(()=>responseData.report.output_sha256.drawing),reports.tortoise.output_sha256.drawing);
  }finally{await context.close();}
});
test('Own file upload, mobile layout, report download, invalid input and origin checks',async()=>{
  const {page,context}=await lab();try{
    await page.setViewportSize({width:390,height:844});
    await page.locator('#file').setInputFiles(path.join(samplesRoot,'inputs','flower.png'));
    await page.locator('#mode').selectOption('color');await page.locator('#generate').click();await page.waitForFunction(()=>responseData!==null);
    assert.equal(await page.evaluate(()=>responseData.report.source_sha256),reports.flower.source_sha256);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow');
    await page.screenshot({path:path.join(evidence,engine+'-mobile.png'),fullPage:true});
    const event=page.waitForEvent('download');await page.locator('#downloadReport').click();const d=await event;await d.saveAs(path.join(evidence,engine+'-download-report.json'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(evidence,engine+'-download-report.json'))).review_required,true);
    const invalid=await context.request.post(generatorOrigin+'/api/convert',{data:{image:Buffer.from('not an image').toString('base64')}});assert.equal(invalid.status(),400);
    const foreign=await context.request.post(generatorOrigin+'/api/convert',{headers:{Origin:'https://external.invalid'},data:{image:'AA=='}});assert.equal(foreign.status(),403);
  }finally{await context.close();}
});

for(const slug of samples)for(const mode of ['paint','brush'])test(slug+' in actual '+mode+' editor: contours, undo, autosave, restore and PNG',async()=>{
  const context=await browser.newContext({viewport:{width:1280,height:960},ignoreHTTPSErrors:true,acceptDownloads:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const catalog=samples.map(name=>({slug:name,label:name,category:'animales',src:'assets/generator-'+name+'.png',thumbnailSrc:'assets/generator-'+name+'.png'}));
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==productOrigin){await route.abort();return;}if(url.pathname==='/assets-list.js'){await route.fulfill({contentType:'text/javascript',body:'window.ASSETS='+JSON.stringify(catalog)+';'});return;}if(url.pathname.startsWith('/assets/generator-')){const name=url.pathname.slice('/assets/generator-'.length,-4);await route.fulfill({contentType:'image/png',body:drawing(name)});return;}await route.continue();});
  try{
    await page.goto(productOrigin+'/'+mode+'.html?asset='+slug);
    await page.waitForFunction(slug=>typeof isImageLoaded!=='undefined' && isImageLoaded && !switchingAsset && currentAsset.slug===slug,slug);
    await page.evaluate(()=>{window.__baseline=ctx.getImageData(0,0,canvas.width,canvas.height).data.slice();});
    const region=interior(slug),[sx,sy]=region.seed;
    const paint=async()=>{await page.locator('#canvas').scrollIntoViewIfNeeded();const rect=await page.locator('#canvas').boundingBox();const size=await page.evaluate(()=>({w:canvas.width,h:canvas.height}));await page.mouse.move(rect.x+(sx+.5)*rect.width/size.w,rect.y+(sy+.5)*rect.height/size.h);await page.mouse.down();if(mode==='brush')await page.mouse.move(rect.x+rect.width*.5,rect.y+rect.height*.5,{steps:8});await page.mouse.up();if(mode==='paint')await page.waitForFunction(()=>!fillInProgress);};
    await paint();
    const stats=await page.evaluate(()=>{const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;let damaged=0,changed=0;for(let i=0;i<d.length;i+=4){if(__baseline[i]===0 && (d[i]!==0 || d[i+1]!==0 || d[i+2]!==0 || d[i+3]!==255))damaged++;if(d[i]!==__baseline[i]||d[i+1]!==__baseline[i+1]||d[i+2]!==__baseline[i+2])changed++;}return {damaged,changed};});
    assert.equal(stats.damaged,0);assert.ok(stats.changed>0);if(mode==='paint')assert.equal(stats.changed,region.pixels);
    await page.locator('#undoBtn').click();assert.equal(await page.evaluate(()=>ctx.getImageData(0,0,canvas.width,canvas.height).data.every((v,i)=>v===__baseline[i])),true);
    await paint();const expected=await page.evaluate(()=>canvas.toDataURL('image/png'));
    await page.evaluate(()=>autosave.flush());await page.reload();
    await page.waitForFunction(()=>isImageLoaded && !switchingAsset);
    await page.locator('#restoreBtn').click();await page.waitForFunction(()=>document.getElementById('status').textContent==='Dibujo restaurado');
    assert.equal(await page.evaluate(()=>canvas.toDataURL('image/png')),expected,'Restore must preserve all binary contour pixels');
    const event=page.waitForEvent('download');await page.locator('#saveBtn').click();const download=await event;
    const target=path.join(evidence,engine+'-'+slug+'-'+mode+'.png');await download.saveAs(target);
    assert.equal(hash(fs.readFileSync(target)),hash(Buffer.from(expected.split(',')[1],'base64')));
    assert.deepEqual(errors,[]);
  }finally{await context.close();}
});
