// Read-only remote verification and a local fingerprint; never commits or deploys.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const critical = ['index.html','paint.html','brush.html','familias.html','adults.html','privacy.html',
  'site-config.json','assets-list.js','app-utils.js','paint.js','brush.js','privacy.js','analytics-init.js',
  'adsense-provider.js','ad-slot.js','ad-banner.css','familias.js','familias.css','familias-redirect.js',
  'ads.txt','app-ads.txt','robots.txt','sitemap.xml'];

function manifestFor(webRoot) {
  const files = {};
  function walk(directory) {
    for (const entry of fs.readdirSync(directory, {withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))) {
      const absolute = path.join(directory,entry.name);
      if (entry.isSymbolicLink()) throw Error('Symlink cannot be included in a release');
      if (entry.isDirectory()) walk(absolute);
      else if (entry.isFile()) files[path.relative(webRoot,absolute).split(path.sep).join('/')] = hash(fs.readFileSync(absolute));
    }
  }
  walk(webRoot);
  for (const file of critical) if (!files[file]) throw Error('Missing release file: '+file);
  const config = JSON.parse(fs.readFileSync(path.join(webRoot,'site-config.json')));
  if (config.analytics?.enabled !== false || config.analytics?.treatmentReviewed !== false ||
      config.ads?.enabled !== false || config.ads?.siteApproved !== false || config.ads?.treatmentReviewed !== false) {
    throw Error('This release requires analytics and advertising to remain disabled');
  }
  if (config.analytics.measurementId !== 'G-XJBQD3ZZ8Q') throw Error('Confirmed GA4 ID is missing');
  return {schemaVersion:1, scope:'Static web with optional services disabled; no deployment or account approval implied',
    treeSha256:hash(Buffer.from(JSON.stringify(files))), files, critical};
}

async function verify(manifest, baseURL, fetcher=fetch, all=false) {
  const base = new URL(baseURL);
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/') throw Error('Use an origin without credentials, query or path');
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(base.hostname))) throw Error('HTTPS is required outside localhost');
  if (manifest.schemaVersion !== 1 || !manifest.files || !Array.isArray(manifest.critical) ||
      hash(Buffer.from(JSON.stringify(manifest.files))) !== manifest.treeSha256) throw Error('Invalid or modified manifest');
  const results=[];
  for (const file of all ? Object.keys(manifest.files) : manifest.critical) {
    if (!manifest.files[file] || file.startsWith('/') || file.split('/').includes('..') || /[\\?#]/.test(file)) throw Error('Invalid manifest path');
    const url = new URL(file.split('/').map(encodeURIComponent).join('/'),base);
    try {
      const response = await fetcher(url,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000)});
      const actual = response.ok ? hash(Buffer.from(await response.arrayBuffer())) : null;
      results.push({file,status:response.status,exact:actual===manifest.files[file],expectedSha256:manifest.files[file],actualSha256:actual});
    } catch {results.push({file,status:null,exact:false,error:'Request failed, timed out or redirected; inspect separately'});}
  }
  return {timestamp:new Date().toISOString(),baseURL:base.href,treeSha256:manifest.treeSha256,passed:results.every(r=>r.exact),results};
}

function outputPath(value) {
  const resolved=path.resolve(root,value || '');
  if (!resolved.startsWith(root+path.sep)) throw Error('Output must stay within the project');
  return resolved;
}

async function main(args) {
  const option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
  let report;
  if (args[0]==='snapshot') {
    report={...manifestFor(path.join(root,'web')),createdAt:new Date().toISOString(),
      checkoutHead:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
      checkoutHasChanges:!!cp.execFileSync('git',['status','--porcelain'],{cwd:root,encoding:'utf8'}).trim()};
  } else if (args[0]==='verify') {
    if (!option('--manifest') || !option('--base-url')) throw Error('verify requires --manifest and --base-url');
    report=await verify(JSON.parse(fs.readFileSync(outputPath(option('--manifest')))),option('--base-url'),fetch,args.includes('--all'));
  } else throw Error('Usage: web-release.cjs snapshot --output <project JSON> | verify --manifest <JSON> --base-url <origin> [--all] [--output <JSON>]');
  if (option('--output')) {const output=outputPath(option('--output'));fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
  console.log(JSON.stringify({scope:report.scope,treeSha256:report.treeSha256,files:report.results?.length || Object.keys(report.files).length,passed:report.passed ?? true}));
  if (report.passed===false) process.exitCode=1;
}

module.exports={manifestFor,verify};
if (require.main===module) main(process.argv.slice(2)).catch(error=>{console.error(error.message);process.exitCode=1;});
