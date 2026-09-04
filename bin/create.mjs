#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
console.log('The starter now lives in W3Booster/app-starter. Forwarding to its generator.');
const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['--yes', '--package=github:W3Booster/app-starter', 'w3booster-create', ...process.argv.slice(2)], { stdio: 'inherit', shell: false });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
