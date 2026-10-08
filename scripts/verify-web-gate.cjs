// Check the gate against the original defects without editing the working tree.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const root = path.resolve(__dirname,'..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(),'paintme-gate-'));
try {
  for(const file of ['app-utils.js','paint-worker.js','flood-fill.js']) {
    fs.copyFileSync(path.join(root,'web',file),path.join(temporary,file));
  }
  const testFile=path.join(root,'tests/web-core.test.cjs');
  const run = pattern => cp.spawnSync(process.execPath,['--test','--test-name-pattern',pattern,testFile],{
    env:{...process.env,PAINTME_WEB_ROOT:temporary},encoding:'utf8',
  });
  assert.equal(run('shared helpers|worker fills every pixel of 10×10').status,0,'Control must pass before mutations');
  const originalHelper=fs.readFileSync(path.join(temporary,'app-utils.js'),'utf8');
  fs.writeFileSync(path.join(temporary,'app-utils.js'),originalHelper.replace('const PaintMe = window.PaintMe =','const PaintMe ='));
  assert.equal(run('shared helpers').status,1,'W1 must fail the gate');
  fs.writeFileSync(path.join(temporary,'app-utils.js'),originalHelper);
  fs.copyFileSync(path.join(root,'docs/audit-2026-10-03/production-paint-worker-js.txt'),path.join(temporary,'paint-worker.js'));
  assert.equal(run('worker fills every pixel of 10×10').status,1,'W2 must fail the gate');
  console.log('Gate verified: the original W1 and W2 defects each produce exit code 1.');
} finally {
  const resolved=path.resolve(temporary);
  if(path.dirname(resolved)!==path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('paintme-gate-')) {
    throw Error('Refusing cleanup outside the verified temporary directory');
  }
  fs.rmSync(resolved,{recursive:true,force:true});
}
