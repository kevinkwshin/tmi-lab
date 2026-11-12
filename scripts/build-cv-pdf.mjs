import {access, readFile, rm} from 'node:fs/promises';
import {constants} from 'node:fs';
import {resolve, dirname, basename} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

export async function buildCvPdf(source = 'dist/cv/keewon-shin-cv.tex') {
  let executable = process.env.TECTONIC;
  if (!executable) {
    const local = resolve('.tools/tectonic');
    try { await access(local, constants.X_OK); executable = local; }
    catch { executable = 'tectonic'; }
  }
  const document = resolve(source);
  const output = dirname(document);
  try {
    const result = await promisify(execFile)(executable,
      ['--keep-logs', '--outdir', output, basename(document)],
      {cwd: output, timeout: 240_000, maxBuffer: 8 * 1024 * 1024});
    const pdf = document.replace(/\.tex$/, '.pdf');
    const bytes = await readFile(pdf);
    if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Compiler did not produce a PDF.');
    if (result.stderr) console.log(result.stderr.trim());
    console.log(`Built ${pdf}`);
    return pdf;
  } catch (error) {
    const hint = error.code === 'ENOENT' ? ' Run npm run setup:tex or set TECTONIC.' : '';
    throw new Error(`CV PDF build failed.${hint} ${error.stderr || error.message}`);
  } finally {
    // Compiler diagnostics are local build evidence, never public website assets.
    await rm(document.replace(/\.tex$/, '.log'), {force: true});
  }
}
