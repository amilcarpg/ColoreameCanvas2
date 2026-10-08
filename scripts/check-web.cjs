// Failing assertions propagate a non-zero exit code; historical diagnostics stay untouched.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const commands = [['--test', path.join(__dirname, '../tests/web-core.test.cjs'), path.join(__dirname,'../tests/web-privacy.test.cjs'), path.join(__dirname,'../tests/web-analytics.test.cjs')], [path.join(__dirname,'check-site.cjs')]];
if (process.argv.includes('--browser')) commands.push(['--test', path.join(__dirname, '../tests/web-browser.test.cjs')]);
for (const args of commands) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
