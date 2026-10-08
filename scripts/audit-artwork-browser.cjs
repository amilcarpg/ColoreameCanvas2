// Applies image checks to real local assets. Does not alter or publish artwork.
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const probe = process.argv.includes('--probe-triceratops');
const extended = process.argv.includes('--extended');
const output = path.join(root, 'docs/qa-evidence/2026-10-07/artwork-checklist', ...(probe ? ['triceratops-probe'] : []));
const playwright = require(process.env.PAINTME_PLAYWRIGHT_PATH || 'playwright');
const engine = process.env.PAINTME_BROWSER_ENGINE || 'chromium';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'base_png/catalog.json')));
const scope = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'web/assets-list.js'), 'utf8'), scope);
const assets = scope.window.ASSETS;
const previous = extended ? JSON.parse(fs.readFileSync(path.join(output, 'browser-' + engine + '.json'))) : null;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
async function main() {
  fs.mkdirSync(output, { recursive: true });
  const cert = path.join(output, 'localhost-' + engine + '.pem'), key = path.join(output, 'localhost-' + engine + '-key.pem');
  cp.execFileSync('C:/Program Files/Git/usr/bin/openssl.exe', ['req', '-x509', '-newkey', 'rsa:2048', '-sha256', '-nodes', '-keyout', key, '-out', cert, '-subj', '/CN=localhost', '-days', '1'], { stdio: 'ignore' });
  const webRoot = path.join(root, 'web');
  const server = https.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert) }, (req, res) => {
    const file = path.resolve(webRoot, '.' + new URL(req.url, 'https://localhost').pathname);
    if (!file.startsWith(webRoot + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => { if (err) res.writeHead(404).end(); else { res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); res.end(data); } });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'https://127.0.0.1:' + server.address().port;
  let browser;
  const report = { timestamp: new Date().toISOString(), engine, scope: 'Real local images; desktop automation; geometry is not intended-region approval.', catalog_sha256: hash(fs.readFileSync(path.join(root, 'base_png/catalog.json'))), editor_sha256: Object.fromEntries(['paint.js', 'brush.js', 'flood-fill.js', 'app-utils.js'].map(f => [f, hash(fs.readFileSync(path.join(webRoot, f)))])), items: [] };
  try {
    browser = await playwright[engine].launch(engine === 'chromium' ? { headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' } : { headless: true });
    report.browserVersion = browser.version();
    for (const asset of assets.filter(asset => !probe || asset.slug === 'triceratops')) {
      const master = catalog.drawings.find(e => e.slug === asset.slug);
      const dir = path.join(output, asset.slug);
      fs.mkdirSync(dir, { recursive: true });
      const item = { slug: asset.slug, label: asset.label, category: asset.category, difficulty: master.difficulty, platforms: master.platforms, source_sha256: hash(fs.readFileSync(path.join(webRoot, asset.src))), modes: {} };
      report.items.push(item);
      const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 }, acceptDownloads: true });
      await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));
      try {
        for (const mode of ['paint', 'brush']) {
          const result = item.modes[mode] = {};
          const started = Date.now();
          await page.goto(origin + '/' + mode + '.html?asset=' + asset.slug);
          await page.waitForFunction(slug => isImageLoaded && !switchingAsset && currentAsset.slug === slug, asset.slug, { timeout: 20000 });
          result.load_ms_desktop = Date.now() - started;
          await page.evaluate(() => { document.getElementById('adultArea').open = true; document.getElementById('consentReject').click(); document.getElementById('adultArea').open = false; });
          result.dimensions = await page.evaluate(() => [canvas.width, canvas.height]);
          if (extended) {
            item.geometry = previous.items.find(i => i.slug === asset.slug).geometry;
            const seed = item.geometry.selected;
            const other = assets.find(a => a.slug !== asset.slug && a.category === asset.category);
            await page.evaluate(slug => selectAssetBySlug(slug, 'audit'), other.slug);
            await page.waitForFunction(slug => isImageLoaded && !switchingAsset && currentAsset.slug === slug, other.slug);
            await page.evaluate(() => { document.getElementById('galleryBrowser').open = true; ensureGalleryBuilt(); });
            await page.locator('#assetGallery .asset-card[data-slug="' + asset.slug + '"]').click();
            await page.waitForFunction(slug => isImageLoaded && !switchingAsset && currentAsset.slug === slug, asset.slug);
            result.thumbnail_select = true;
            await page.evaluate(slug => { const select = document.getElementById('assetSelect'); select.value = slug; select.dispatchEvent(new Event('change')); }, other.slug);
            await page.waitForFunction(slug => isImageLoaded && !switchingAsset && currentAsset.slug === slug, other.slug);
            result.dropdown_select = true;
            await page.evaluate(slug => selectAssetBySlug(slug, 'audit'), asset.slug);
            await page.waitForFunction(() => isImageLoaded && !switchingAsset);
            if (mode === 'paint') {
              result.line_click_protected = await page.evaluate(() => { const before = canvas.toDataURL(); const i = lineMask.findIndex(v => v === 1); fillAtPoint({ x: i % canvas.width, y: Math.floor(i / canvas.width) }); return canvas.toDataURL() === before; });
              await page.evaluate(seed => { activeColor = '#112233'; fillAtPoint(seed); }, seed);
              await page.waitForFunction(() => !fillInProgress);
              result.recolor = await page.evaluate(seed => { const color = Array.from(ctx.getImageData(seed.x, seed.y, 1, 1).data); return color.join(',') === '17,34,51,255'; }, seed);
              result.same_color_noop = await page.evaluate(seed => { const before = canvas.toDataURL(); fillAtPoint(seed); return !fillInProgress && canvas.toDataURL() === before; }, seed);
            } else {
              result.long_stroke = await page.evaluate(() => {
                const before = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                brushSize = 32; activeColor = '#112233';
                drawBrushSegment({ x: 0, y: canvas.height / 2 }, { x: canvas.width - 1, y: canvas.height / 2 });
                const after = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let changed = 0, damagedSolidLines = 0;
                for (let i = 0; i < before.length; i += 4) { if (before[i] !== after[i] || before[i+1] !== after[i+1] || before[i+2] !== after[i+2]) { changed++; if (before[i] === 0 && before[i+1] === 0 && before[i+2] === 0) damagedSolidLines++; } }
                eraseMode = true; brushSize = 64; drawBrushSegment({ x: 0, y: canvas.height / 2 }, { x: canvas.width - 1, y: canvas.height / 2 }); eraseMode = false;
                return { changed_pixels: changed, damaged_solid_line_pixels: damagedSolidLines };
              });
              await page.evaluate(seed => { drawBrushSegment(seed, seed); drawingRevision++; setUnsavedChanges(true); scheduleAutosave(); }, seed);
            }
            const snapshotA = await page.evaluate(async () => { scheduleAutosave(); await autosave.flush(); return canvas.toDataURL('image/png'); });
            await page.evaluate(slug => selectAssetBySlug(slug, 'audit'), other.slug);
            await page.waitForFunction(() => isImageLoaded && !switchingAsset);
            const seedB = previous.items.find(i => i.slug === other.slug).geometry.selected;
            await page.evaluate(({ seed, mode }) => { if (mode === 'paint') { activeColor = '#aa2255'; fillAtPoint(seed); } else { drawBrushSegment(seed, seed); drawingRevision++; setUnsavedChanges(true); scheduleAutosave(); } }, { seed: seedB, mode });
            if (mode === 'paint') await page.waitForFunction(() => !fillInProgress);
            const snapshotB = await page.evaluate(async () => { scheduleAutosave(); await autosave.flush(); return canvas.toDataURL('image/png'); });
            await page.evaluate(slug => selectAssetBySlug(slug, 'audit'), asset.slug);
            await page.waitForFunction(() => isImageLoaded && !switchingAsset);
            result.separate_saved_works = await page.evaluate(async ({ a, b, mode, snapshotA, snapshotB }) => (await PaintMe.loadLocalDrawing(mode, a))?.dataUrl === snapshotA && (await PaintMe.loadLocalDrawing(mode, b))?.dataUrl === snapshotB, { a: asset.slug, b: other.slug, mode: mode === 'paint' ? 'bucket' : 'brush', snapshotA, snapshotB });
            result.passed = result.thumbnail_select && result.dropdown_select && result.separate_saved_works && (mode === 'paint' ? result.line_click_protected && result.recolor && result.same_color_noop : result.long_stroke.changed_pixels > 0 && result.long_stroke.damaged_solid_line_pixels === 0);
            continue;
          }
          if (mode === 'paint') {
            const geometry = await page.evaluate(probe => {
              const w = canvas.width, h = canvas.height, n = w * h;
              const original = ctx.getImageData(0, 0, w, h);
              const labels = new Int32Array(n), queue = new Uint32Array(n);
              const regions = [];
              for (let start = 0; start < n; start++) {
                if (lineMask[start] || labels[start]) continue;
                const id = regions.length + 1; let head = 0, tail = 0, edge = false;
                queue[tail++] = start; labels[start] = id;
                while (head < tail) {
                  const i = queue[head++], x = i % w, y = Math.floor(i / w);
                  if (x === 0 || x === w - 1 || y === 0 || y === h - 1) edge = true;
                  const visit = j => { if (!lineMask[j] && labels[j] === 0) { labels[j] = id; queue[tail++] = j; } };
                  if (x) visit(i - 1); if (x < w - 1) visit(i + 1); if (y) visit(i - w); if (y < h - 1) visit(i + w);
                }
                // Pick the most interior point, using inexpensive horizontal/vertical clearance.
                let best = start, clearance = -1;
                for (let k = 0; k < tail; k += Math.max(1, Math.floor(tail / 1000))) {
                  const i = queue[k], x = i % w, y = Math.floor(i / w); let d = 0;
                  while (d < 40 && x - d >= 0 && x + d < w && y - d >= 0 && y + d < h && labels[i - d] === id && labels[i + d] === id && labels[i - d * w] === id && labels[i + d * w] === id) d++;
                  if (d > clearance) { clearance = d; best = i; }
                }
                regions.push({ id, pixels: tail, x: best % w, y: Math.floor(best / w), touches_edge: edge, clearance_px: clearance });
              }
              const work = new Uint8ClampedArray(original.data);
              const colors = regions.map((r, i) => [30 + (i * 71) % 190, 30 + (i * 43) % 190, 30 + (i * 97) % 190, 255]);
              const startTime = performance.now();
              for (const r of regions) {
                const task = PaintMeFill.createTask({ width: w, height: h, startX: r.x, startY: r.y, fillColor: colors[r.id - 1], tolerance: TOLERANCE, lineMask, buffer: work.buffer });
                if (!task) throw new Error('Invalid fill task');
                while (!task.done) task.step(300000);
              }
              let mismatched = 0, damagedLines = 0;
              for (let i = 0; i < n; i++) for (let c = 0; c < 4; c++) {
                const expected = lineMask[i] ? original.data[i * 4 + c] : colors[labels[i] - 1][c];
                if (work[i * 4 + c] !== expected) { mismatched++; if (lineMask[i]) damagedLines++; break; }
              }
              const map = document.createElement('canvas'); map.width = w; map.height = h;
              const mapCtx = map.getContext('2d'); mapCtx.putImageData(new ImageData(work, w, h), 0, 0);
              mapCtx.font = 'bold 16px sans-serif'; mapCtx.textAlign = 'center';
              for (const r of regions.filter(r => r.pixels >= 64)) { mapCtx.lineWidth = 3; mapCtx.strokeStyle = 'white'; mapCtx.strokeText(String(r.id), r.x, r.y); mapCtx.fillStyle = 'black'; mapCtx.fillText(String(r.id), r.x, r.y); }
              const selected = probe ? { ...regions[labels[300 * w + 500] - 1], x: 500, y: 300 } : [...regions].filter(r => !r.touches_edge).sort((a, b) => b.clearance_px - a.clearance_px || b.pixels - a.pixels)[0] || [...regions].sort((a, b) => b.pixels - a.pixels)[0];
              window.__auditSeed = selected;
              return { regions, total_paintable_pixels: regions.reduce((s, r) => s + r.pixels, 0), regions_under_16px: regions.filter(r => r.pixels < 16).length, all_regions_algorithm_ms: performance.now() - startTime, mismatched_pixels: mismatched, damaged_line_pixels: damagedLines, selected, map: map.toDataURL('image/png') };
            }, probe);
            fs.writeFileSync(path.join(dir, 'regions-' + engine + '.png'), Buffer.from(geometry.map.split(',')[1], 'base64'));
            delete geometry.map; item.geometry = geometry;
          }
          const seed = item.geometry.selected;
          const original = await page.evaluate(() => canvas.toDataURL('image/png'));
          await page.locator('#canvas').scrollIntoViewIfNeeded();
          const box = await page.locator('#canvas').boundingBox();
          const click = { x: box.x + box.width * seed.x / result.dimensions[0], y: box.y + box.height * seed.y / result.dimensions[1] };
          await page.mouse.click(click.x, click.y);
          if (mode === 'paint') await page.waitForFunction(() => !fillInProgress);
          let painted = await page.evaluate(() => canvas.toDataURL('image/png'));
          result.pointer_changes_canvas = painted !== original;
          await page.locator('#undoBtn').click();
          result.undo_exact = await page.evaluate(original => canvas.toDataURL('image/png') === original, original);
          await page.mouse.click(click.x, click.y);
          if (mode === 'paint') await page.waitForFunction(() => !fillInProgress);
          painted = await page.evaluate(() => canvas.toDataURL('image/png'));
          if (mode === 'paint') {
            await page.locator('#undoBtn').click();
            await page.evaluate(seed => { pushUndo(); floodFillFallback(seed.x, seed.y, hexToRgba(activeColor), TOLERANCE); }, seed);
            await page.waitForFunction(() => !fillInProgress);
            result.worker_fallback_exact = await page.evaluate(painted => canvas.toDataURL('image/png') === painted, painted);
            painted = await page.evaluate(() => canvas.toDataURL('image/png'));
          } else {
            result.eraser = await page.evaluate(seed => {
              eraseMode = true; drawBrushSegment(seed, seed); eraseMode = false;
              const erased = canvas.toDataURL('image/png'); drawBrushSegment(seed, seed);
              return { changed: erased !== canvas.toDataURL('image/png') };
            }, seed);
            painted = await page.evaluate(() => canvas.toDataURL('image/png'));
          }
          await page.evaluate(() => scheduleAutosave());
          const storageMode = mode === 'paint' ? 'bucket' : 'brush';
          await page.waitForFunction(async ({ slug, mode, painted }) => (await PaintMe.loadLocalDrawing(mode, slug))?.dataUrl === painted, { slug: asset.slug, mode: storageMode, painted }, { timeout: 15000 });
          result.save_exact = true;
          fs.writeFileSync(path.join(dir, mode + '-' + engine + '-before-restore.png'), Buffer.from(painted.split(',')[1], 'base64'));
          await page.reload();
          await page.waitForFunction(() => isImageLoaded && !switchingAsset);
          await page.locator('#restoreBtn').click();
          await page.waitForFunction(() => !restoringDrawing);
          result.restore_diff = await page.evaluate(async painted => {
            const image = new Image(); image.src = painted; await image.decode();
            const surface = document.createElement('canvas'); surface.width = canvas.width; surface.height = canvas.height;
            const c = surface.getContext('2d'); c.drawImage(image, 0, 0);
            const before = c.getImageData(0, 0, canvas.width, canvas.height).data;
            const after = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let pixels = 0, maximum = 0;
            for (let i = 0; i < before.length; i += 4) { let different = false; for (let j = 0; j < 4; j++) { const d = Math.abs(before[i + j] - after[i + j]); maximum = Math.max(maximum, d); different ||= d > 0; } if (different) pixels++; }
            return { changed_pixels: pixels, max_channel_delta: maximum };
          }, painted);
          result.restore_exact = result.restore_diff.changed_pixels === 0;
          const restored = await page.evaluate(() => canvas.toDataURL('image/png'));
          const downloads = [];
          for (let i = 0; i < 3; i++) {
            const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
            await page.locator('#saveBtn').click();
            const download = await downloadPromise;
            const stream = await download.createReadStream(); const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const bytes = Buffer.concat(chunks);
            const pixelExact = await page.evaluate(async ({ bytes, painted }) => {
              const decode = async url => { const image = new Image(); image.src = url; await image.decode(); const surface = document.createElement('canvas'); surface.width = image.width; surface.height = image.height; const context = surface.getContext('2d'); context.drawImage(image, 0, 0); return { w: image.width, h: image.height, data: context.getImageData(0, 0, image.width, image.height).data }; };
              const received = await decode('data:image/png;base64,' + bytes), expected = await decode(painted);
              return received.w === expected.w && received.h === expected.h && received.data.every((v, j) => v === expected.data[j]);
            }, { bytes: bytes.toString('base64'), painted: restored });
            downloads.push({ filename: download.suggestedFilename(), bytes: bytes.length, sha256: hash(bytes), pixels_exact: pixelExact });
            if (i === 0) fs.writeFileSync(path.join(dir, mode + '-' + engine + '-export.png'), bytes);
          }
          result.downloads = downloads;
          result.elapsed_ms = Date.now() - started;
          result.passed = result.pointer_changes_canvas && result.undo_exact && result.save_exact && result.restore_exact && downloads.every(d => d.pixels_exact) && (mode === 'paint' ? result.worker_fallback_exact : result.eraser.changed);
        }
        item.page_errors = errors;
      } catch (err) { item.error = err.stack; console.error(asset.slug + ': ' + err.message); }
      finally { await context.close(); }
      fs.writeFileSync(path.join(output, (extended ? 'extended-' : 'browser-') + engine + '.json'), JSON.stringify(report, null, 2));
      console.log(engine + ' ' + report.items.length + '/' + assets.length + ' ' + asset.slug + ' regions=' + (item.geometry?.regions.length ?? '?') + ' paint=' + item.modes.paint?.passed + ' brush=' + item.modes.brush?.passed);
    }
  } finally {
    await browser?.close(); await new Promise(resolve => server.close(resolve));
    for (const file of [cert, key]) if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  if (report.items.some(i => i.error || !i.modes.paint?.passed || !i.modes.brush?.passed || i.geometry?.mismatched_pixels)) process.exitCode = 1;
}
main().catch(err => { console.error(err); process.exitCode = 1; });
