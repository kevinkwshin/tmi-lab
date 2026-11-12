import {mkdir, writeFile, mkdtemp, rm, chmod} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';

// Official release, pinned and checked before extraction. No system installation.
const version = '0.17.0';
const builds = {
  'darwin-arm64': ['aarch64-apple-darwin', 'a3f1cac7c5678f01661a92212f58480ae3b0634115d880dbc59e2953ded45667'],
  'darwin-x64': ['x86_64-apple-darwin', '7c90ef5b6ddb1eb1937e4337add5237b79338e4b9676459fa91187d24d6cdf80'],
  'linux-x64': ['x86_64-unknown-linux-musl', '8533d07f9ccbd7a65824b9e0459041bca34af1eb33daba48f59215593753a3b7'],
};
const build = builds[`${process.platform}-${process.arch}`];
if (!build) throw new Error('Install Tectonic for this platform and set TECTONIC to its executable path.');
const [target, checksum] = build;
const url = `https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${version}/tectonic-${version}-${target}.tar.gz`;
const response = await fetch(url, {signal: AbortSignal.timeout(120_000)});
if (!response.ok) throw new Error(`Tectonic download failed: HTTP ${response.status}`);
const archive = Buffer.from(await response.arrayBuffer());
if (createHash('sha256').update(archive).digest('hex') !== checksum) throw new Error('Tectonic archive checksum mismatch.');
const temporary = await mkdtemp(join(tmpdir(), 'tmi-tectonic-'));
try {
  const archivePath = join(temporary, 'tectonic.tar.gz');
  await writeFile(archivePath, archive);
  const tools = resolve('.tools');
  await mkdir(tools, {recursive: true});
  await promisify(execFile)('tar', ['-xzf', archivePath, '-C', tools, 'tectonic']);
  await chmod(join(tools, 'tectonic'), 0o755);
  console.log(`Installed verified Tectonic ${version} in .tools/tectonic`);
} finally {
  await rm(temporary, {recursive: true, force: true});
}
