const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup(overrides={}) {
  const records=new Map(),listeners={},scripts=[],timers=new Map();let next=0;
  const config={enabled:true,treatmentReviewed:true,measurementId:'G-TEST123456',paths:['/adults.html'],...overrides};
  const window={ASSETS:[{slug:'dinosaurio'}],location:new URL('https://www.paintme.test/adults.html?name=private#secret'),
    addEventListener(name,cb){listeners[name]=cb;},
    fetch:async()=>({ok:true,json:async()=>({analytics:config})}),
    setTimeout(cb){timers.set(++next,cb);return next;},clearTimeout(id){timers.delete(id);}};
  const document={currentScript:{src:'https://www.paintme.test/analytics-init.js'},cookie:'',documentElement:{lang:'en'},readyState:'loading',addEventListener(){},getElementById(){return null;},
    querySelector(){return {content:"script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com"};},
    createElement(){return {remove(){this.removed=true;}};},head:{appendChild(node){scripts.push(node);}}};
  const localStorage={getItem:key=>records.get(key)||null,setItem:(key,value)=>records.set(key,value),removeItem:key=>records.delete(key)};
  const context=vm.createContext({window,document,localStorage,URL,Set,Map,console});
  for (const file of ['product-events.js','privacy.js','analytics-init.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../web',file),'utf8'),context);
  return {window,document,scripts,timers,records};
}
test('GA validates ID, treatment, scope and CSP before making analytics available',async()=>{
  for (const invalid of [{enabled:false},{treatmentReviewed:false},{measurementId:'G-<script>'},{paths:['/paint.html']}]) {
    const {window,scripts}=setup(invalid);assert.equal(await window.PaintMeAnalytics.ready,false);
    window.PaintMePrivacy.decide({analytics:true});assert.equal(scripts.length,0);assert.equal(window.dataLayer.length,0);
  }
  const env=setup();env.document.querySelector=()=>({content:"script-src 'self';"});
  assert.equal(await env.window.PaintMeAnalytics.ready,false);
});
test('basic consent sends nothing before permission or after rejection; events are not replayed',async()=>{
  const {window,scripts}=setup();await window.PaintMeAnalytics.ready;
  assert.equal(window.gtag('event','first_paint',{asset_slug:'dinosaurio'}),false);
  window.PaintMePrivacy.decide({});assert.equal(scripts.length,0);assert.equal(window.dataLayer.length,0);
  window.PaintMePrivacy.decide({analytics:true});assert.equal(scripts.length,1);assert.equal(window.dataLayer.length,0);
  scripts[0].onload();assert.equal(window.PaintMeAnalytics.status(),'ready');
  assert.equal(window.dataLayer.filter(entry=>entry[1]==='first_paint').length,0);
});
test('GA sends only schema events, query-free location and no advertising grants',async()=>{
  const {window,scripts}=setup();await window.PaintMeAnalytics.ready;
  window.PaintMePrivacy.decide({analytics:true});scripts[0].onload();
  assert.equal(window.gtag('event','arbitrary',{email:'private'}),false);
  assert.equal(window.gtag('event','first_paint',{asset_slug:'dinosaurio',search:'child',drawing:'data:image/png'}),true);
  const entries=JSON.parse(JSON.stringify(window.dataLayer.map(entry=>Array.from(entry))));
  const config=entries.find(entry=>entry[0]==='config')[2];
  assert.equal(config.send_page_view,false);assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);
  for(const entry of entries.filter(entry=>entry[0]==='consent')) {
    assert.equal(entry[2].ad_storage,'denied');assert.equal(entry[2].ad_user_data,'denied');assert.equal(entry[2].ad_personalization,'denied');
  }
  const params=entries.at(-1)[2];assert.equal(params.page_location,'https://www.paintme.test/adults.html');assert.equal(params.page_referrer,'');assert.equal(params.ui_language,'en');
  assert(!JSON.stringify(entries).includes('private'));assert(!('search' in params));assert(!('drawing' in params));
});
test('revocation resolves pending loads and prevents late initialization, also across tabs',async()=>{
  const {window,scripts,records}=setup();await window.PaintMeAnalytics.ready;
  window.PaintMePrivacy.decide({analytics:true});const waiting=window.ensureAnalyticsLoaded();
  window.PaintMePrivacy.decide({});assert.equal(await waiting,null);scripts[0].onload();
  assert.equal(window.dataLayer.length,0);assert.equal(window['ga-disable-G-TEST123456'],true);
  window.PaintMePrivacy.decide({analytics:true});scripts[1].onload();assert.equal(window.PaintMeAnalytics.status(),'ready');
  records.set(window.PaintMePrivacy.KEY,JSON.stringify({version:2,decided:true,analytics:false}));
  // Storage delivery is checked by the shared privacy tests; explicit revoke has the same subscriber boundary.
  window.PaintMePrivacy.decide({});assert.equal(window.gtag('event','resource_open'),false);assert.equal(window.dataLayer.length,0);
});
test('SDK load errors and timeouts allow retry without keeping an old event queue',async()=>{
  const {window,scripts,timers}=setup();await window.PaintMeAnalytics.ready;
  window.PaintMePrivacy.decide({analytics:true});const failed=window.ensureAnalyticsLoaded();scripts[0].onerror();assert.equal(await failed,null);
  assert.equal(window.PaintMeAnalytics.status(),'error');const retry=window.ensureAnalyticsLoaded();
  scripts[0].onload();assert.equal(window.PaintMeAnalytics.status(),'loading');
  Array.from(timers.values())[0]();assert.equal(await retry,null);
  const success=window.ensureAnalyticsLoaded();scripts[2].onload();assert.equal(await success,scripts[2]);assert.equal(window.PaintMeAnalytics.status(),'ready');
});
