const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../web');
function environment({blocked=false,initial={}}={}) {
  const records=new Map(Object.entries(initial)),listeners={};
  const window={ASSETS:[{slug:'gato'}],addEventListener(name,callback){listeners[name]=callback;}};
  const localStorage={getItem(key){if(blocked)throw Error('blocked');return records.get(key)||null;},setItem(key,value){if(blocked)throw Error('blocked');records.set(key,value);},removeItem(key){if(blocked)throw Error('blocked');records.delete(key);}};
  const document={currentScript:{src:'https://paintme.test/privacy.js'},readyState:'loading',addEventListener(){},getElementById(){return null;}};
  const scope={window,localStorage,document,URL,Set,Map,console};vm.createContext(scope);
  for(const name of ['product-events.js','privacy.js','analytics-init.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),scope);
  return {scope,window,records,listeners};
}
test('legacy grants, invalid versions and invalid JSON never activate optional services',()=>{
  for(const initial of [{coloreame_consent_v1:'granted'},{paintme_preferences_v2:'{broken'},{paintme_preferences_v2:JSON.stringify({version:1,analytics:true})},{paintme_preferences_v2:JSON.stringify({version:2,decided:true,analytics:true,ads:true})}]) {
    const {window}=environment({initial});
    assert.equal(window.PaintMePrivacy.allowed('analytics'),false);assert.equal(window.PaintMePrivacy.allowed('ads'),false);
    window.PaintMePrivacy.decide({analytics:true,ads:true});
    assert.equal(window.PaintMePrivacy.snapshot().analytics,false);assert.equal(window.PaintMePrivacy.snapshot().ads,false);
  }
});
test('blocked storage uses session preferences, does not grant services or throw',()=>{
  const {window}=environment({blocked:true});
  window.PaintMePrivacy.decide({analytics:true});
  assert.equal(window.PaintMePrivacy.snapshot().persisted,false);
  assert.equal(window.PaintMePrivacy.snapshot().decided,true);
  assert.equal(window.PaintMePrivacy.allowed('analytics'),false);
});
test('preferences propagate between tabs, remove legacy key and invalidate epochs',()=>{
  const {window,records,listeners}=environment({initial:{coloreame_consent_v1:'granted'}}),states=[];
  const unsubscribe=window.PaintMePrivacy.subscribe(value=>states.push(value));
  window.PaintMePrivacy.decide({}); assert(!records.has('coloreame_consent_v1'));
  records.set(window.PaintMePrivacy.KEY,JSON.stringify({version:2,decided:true,analytics:false,ads:false}));
  listeners.storage({key:window.PaintMePrivacy.KEY});
  assert.equal(states.length,2);assert(states[1].generation>states[0].generation);
  unsubscribe();window.PaintMePrivacy.decide({});assert.equal(states.length,2);
});
test('event schema rejects unknown names and strips URLs, text, search, traces and unknown slugs',()=>{
  const {window}=environment(),schema=window.PaintMeEvents;
  assert.equal(schema.sanitize('arbitrary',{email:'child@example.test'}),null);
  const result=JSON.parse(JSON.stringify(schema.sanitize('first_paint',{asset_slug:'not-in-catalog',source:'https://evil.test/person',category:'bogus',mode:'bucket',email:'child@example.test',question:'free text',drawing:'data:image/png',traces:[1,2],search:'a name',time_band:'15_30s'})));
  assert.deepEqual(result,{name:'first_paint',params:{schema_version:1,mode:'bucket',time_band:'15_30s',platform:'web',source:'direct'}});
  assert.equal(schema.sanitize('drawing_open',{asset_slug:'gato'}).params.asset_slug,'gato');
  assert.deepEqual([0,5000,15000,30000,60000].map(schema.timeBand),['lt_5s','5_15s','15_30s','30_60s','gte_60s']);
});
test('disabled collector queues no events and asynchronous legacy script calls stay inert after revocation',async()=>{
  const {window}=environment();
  for(let i=0;i<100;i++)assert.equal(window.gtag('event','first_paint',{asset_slug:'gato'}),false);
  const waiting=window.ensureAnalyticsLoaded();window.PaintMePrivacy.decide({});
  assert.equal(await waiting,null);assert.equal(await window.loadThirdPartyScript('gtag','https://example.test/sdk'),null);
  assert.equal(window.dataLayer.length,0);
});
test('HTML restricts external scripts to the three prepared GA resource pages; no publisher loading',()=>{
  function files(directory){return fs.readdirSync(directory,{withFileTypes:true}).flatMap(item=>item.isDirectory()?files(path.join(directory,item.name)):[path.join(directory,item.name)]);}
  for(const file of files(root).filter(file=>file.endsWith('.html'))) {
    const text=fs.readFileSync(file,'utf8');
    assert(text.includes('privacy.js?v='),file);
    assert(!text.includes('fonts.googleapis.com'),file);
    assert(!/<script[^>]+src="https?:/.test(text),file);
    const prepared = ['adults.html','packs/dinosaurios.html','en/dinosaur-coloring.html'].includes(path.relative(root,file).split(path.sep).join('/'));
    assert(text.includes(prepared ? "script-src 'self' https://www.googletagmanager.com;" : "script-src 'self';"),file);
    assert(text.includes("frame-src 'none';"),file);
    assert(!text.includes('*.google') && !text.includes("script-src *"),file);
  }
});
