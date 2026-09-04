import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm, access } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
const run = promisify(execFile);
test('each registered example has its own actual screenshot and icon', async () => {
  const catalog = JSON.parse(await readFile('examples.json', 'utf8'));
  const hashes = new Set();
  for (const app of catalog) {
    const screenshot = await readFile('docs/' + app.slug + '.png');
    assert.equal(screenshot.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    hashes.add(createHash('sha256').update(screenshot).digest('hex'));
    assert.ok(app.screenshotUrls[0].endsWith('/' + app.slug + '.png'));
    assert.match(await readFile('public/icons/' + app.slug + '.svg', 'utf8'), /<svg/);
  }
  assert.equal(hashes.size, catalog.length);
});
test('generator creates a usable project and refuses to overwrite it', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'w3booster-starter-test-'));
  const target = join(directory, 'my-app');
  try {
    await run(process.execPath, ['bin/create.mjs', target]);
    const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'));
    assert.equal(manifest.name, 'my-app');
    const sourceManifest = JSON.parse(await readFile('package.json', 'utf8'));
    assert.equal(manifest.dependencies['@w3booster/sdk'], sourceManifest.dependencies['@w3booster/sdk']);
    assert.equal(manifest.scripts.check, 'tsc --noEmit');
    assert.match(await readFile(join(target, 'src/main.ts'), 'utf8'), /runtime.start/);
    assert.match(await readFile(join(target, 'src/w3booster.generated.ts'), 'utf8'), /unregistered_demo/);
    assert.doesNotMatch(await readFile(join(target, 'src/application.ts'), 'utf8'), /registered\//);
    await assert.rejects(access(join(target, 'src/registered')));
    assert.equal(manifest.scripts['examples:sync'], undefined);
    await assert.rejects(run(process.execPath, ['bin/create.mjs', target]), /already exists/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
