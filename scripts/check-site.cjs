// Static routes/canonical/sitemap validation. This does not approve content rights or indexing.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(process.env.PAINTME_SITE_ROOT || path.join(__dirname,'../web'));
const domain = fs.readFileSync(path.join(root,'CNAME'),'utf8').trim();
assert(/^[a-z0-9.-]+$/.test(domain), 'Invalid CNAME');
const host = 'https://'+domain;
function files(directory) {return fs.readdirSync(directory,{withFileTypes:true}).flatMap(item=>item.isDirectory()?files(path.join(directory,item.name)):[path.join(directory,item.name)]);}
const html = files(root).filter(file=>file.endsWith('.html')), urls=[];
for(const file of html) {
  const content=fs.readFileSync(file,'utf8'), relative=path.relative(root,file).split(path.sep).join('/');
  const canonical=content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  assert(canonical, 'Missing canonical: '+relative);
  const url=new URL(canonical);assert.equal(url.origin,host,relative);assert.equal(url.search,'',relative);assert.equal(url.hash,'',relative);
  assert.equal(url.pathname, relative==='index.html'?'/':'/'+relative,relative);
  if(!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(content)) urls.push(canonical);
  for(const match of content.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value=match[1].replace(/&amp;/g,'&');
    if(/^(https?:|mailto:|data:|blob:)/.test(value)) continue;
    const parsed=new URL(value,host+'/'+relative);
    const destination=path.resolve(root,'.'+decodeURIComponent(parsed.pathname));
    assert(destination.startsWith(root+path.sep),'Path escapes web: '+relative);
    assert(fs.existsSync(destination),'Missing local link: '+relative+' -> '+value);
  }
}
assert.equal(new Set(urls).size,urls.length,'Duplicate canonicals');urls.sort();
const expected='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>'  <url><loc>'+url+'</loc></url>').join('\n')+'\n</urlset>\n';
if(process.argv.includes('--write')) fs.writeFileSync(path.join(root,'sitemap.xml'),expected);
else assert.equal(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').replace(/\r\n/g,'\n'),expected,'Sitemap stale; run node scripts/check-site.cjs --write');
assert(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Sitemap: '+host+'/sitemap.xml'),'Wrong robots host');
const sellers=fs.readFileSync(path.join(root,'ads.txt'),'utf8').split(/\r?\n/).map(line=>line.trim()).filter(line=>line&&!line.startsWith('#'));
assert(sellers.length>0,'Empty ads.txt');
for(const line of sellers) assert(/^google\.com,\s*pub-\d{16},\s*(DIRECT|RESELLER),\s*f08c47fec0942fa0$/.test(line),'Malformed seller record');
console.log(`${html.length} HTML routes/canonicals, ${urls.length} sitemap URLs and ads.txt syntax verified. Seller ownership and platform approval are not verified.`);
