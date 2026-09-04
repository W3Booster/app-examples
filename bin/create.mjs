#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
if (args.includes('--help') || !args.length) {
  console.log('Usage: w3booster-create <new-directory>\nCreates a complete TypeScript app with demo data. No account required.');
  process.exit(args.length ? 0 : 1);
}
if (args.length !== 1 || args[0].startsWith('-')) throw new Error('Provide exactly one new project directory.');
const target = resolve(args[0]);
try { await access(target); throw new Error(`Directory already exists: ${target}. Choose a new directory; existing files are never overwritten.`); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const source = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(target, { recursive: true });
for (const file of ['src', 'scripts', 'docs', 'index.html', 'tsconfig.json', 'vite.config.ts', 'app-definition.json', 'README.md', 'LICENSE']) {
  await cp(resolve(source, file), resolve(target, file), { recursive: true });
}
const manifest = JSON.parse(await readFile(resolve(source, 'package.json'), 'utf8'));
// Even after the official demo is registered, new projects must have their own identity.
await cp(resolve(source, 'bin/demo-definition.ts'), resolve(target, 'src/w3booster.generated.ts'));
manifest.name = basename(target).toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'my-w3booster-app';
delete manifest.bin; delete manifest.files; delete manifest.repository;
// Generator tests belong to this repository, not the generated application.
manifest.scripts.check = 'tsc --noEmit';
await writeFile(resolve(target, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(resolve(target, '.gitignore'), 'node_modules/\ndist/\n.env*\n');
console.log(`Created ${target}\n\nNext:\n  cd ${JSON.stringify(args[0])}\n  npm install\n  npm run dev\n\nOpen http://localhost:5173/ — demo data works immediately.\nGuide: https://website.w3booster.com/developer/first-app/`);
