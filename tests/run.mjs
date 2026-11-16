import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir = await mkdtemp(join(tmpdir(), 'roomforone-test-'));
try {
  const { outputFiles } = await build({ entryPoints: ['tests/core.test.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
  const file = join(dir, 'core.test.mjs'); await writeFile(file, outputFiles[0].contents);
  const result = spawnSync(process.execPath, ['--test', file], { stdio: 'inherit' });
  process.exitCode = result.status || 0;
} finally { await rm(dir, { recursive: true, force: true }); }
