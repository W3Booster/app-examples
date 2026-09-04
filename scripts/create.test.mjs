import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const run = promisify(execFile);
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
    await assert.rejects(run(process.execPath, ['bin/create.mjs', target]), /already exists/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
