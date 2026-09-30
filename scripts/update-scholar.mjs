import {readFile, writeFile, rename, rm} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';

export const profileId = 'prJCNYoAAAAJ';
export const profileUrl = `https://scholar.google.com/citations?user=${profileId}&hl=en`;
const snapshotPath = fileURLToPath(new URL('../src/scholar-metrics.json', import.meta.url));
const plainText = value => value.replace(/<[^>]*>/g, '').trim();

function count(value) {
  if (!/^(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)$/.test(value)) {
    throw new Error('Scholar returned an invalid numeric value.');
  }
  const number = Number(value.replaceAll(',', ''));
  if (!Number.isSafeInteger(number)) throw new Error('Scholar returned an unsafe numeric value.');
  return number;
}

export function parseScholarProfile(html, now = new Date()) {
  if (html.length > 2_000_000) throw new Error('Scholar response is unexpectedly large.');
  const name = html.match(/<div\b[^>]*\bid=["']gsc_prf_in["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if (!name || !/^Keewon Shin(?:, PhD)?$/.test(plainText(name))) {
    throw new Error('Expected public Scholar profile was not returned; it may be unavailable or blocked.');
  }
  const table = html.match(/<table\b[^>]*\bid=["']gsc_rsb_st["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
  if (!table) throw new Error('Scholar metrics table is missing.');
  const metrics = {};
  const keys = new Map([['Citations', 'citations'], ['h-index', 'hIndex'], ['i10-index', 'i10Index']]);
  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const label = row[1].match(/<td\b[^>]*class=["'][^"']*\bgsc_rsb_sc1\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/i)?.[1];
    const key = label && keys.get(plainText(label));
    if (!key) continue;
    const cells = [...row[1].matchAll(/<td\b[^>]*class=["'][^"']*\bgsc_rsb_std\b[^"']*["'][^>]*>([\s\S]*?)<\/td>/gi)];
    if (cells.length !== 2 || key in metrics) throw new Error('Scholar metric columns changed.');
    metrics[key] = count(plainText(cells[0][1]));
  }
  if (Object.keys(metrics).length !== 3 || metrics.citations === 0) {
    throw new Error('Scholar returned incomplete metrics.');
  }
  const years = [...html.matchAll(/<span\b[^>]*class=["'][^"']*\bgsc_g_t\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)].map(m => count(plainText(m[1])));
  const counts = [...html.matchAll(/<span\b[^>]*class=["'][^"']*\bgsc_g_al\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi)].map(m => count(plainText(m[1])));
  const year = now.getUTCFullYear();
  if (years.length < 7 || years.length !== counts.length || years.some((y, i) => y < 1970 || y > year || (i > 0 && y !== years[i - 1] + 1))) {
    throw new Error('Scholar returned an incomplete or invalid yearly graph.');
  }
  if (metrics.citations < metrics.hIndex ** 2 || metrics.citations < metrics.i10Index * 10 || counts.reduce((a, b) => a + b, 0) > metrics.citations) {
    throw new Error('Scholar metrics and yearly graph are inconsistent.');
  }
  return {
    profileId,
    checked: now.toISOString().slice(0, 10),
    ...metrics,
    trend: years.map((year, i) => ({year, count: counts[i]}))
  };
}

export async function refreshScholar({fetchImpl = fetch, output = snapshotPath, now = new Date()} = {}) {
  const previous = await readFile(output, 'utf8');
  const response = await fetchImpl(profileUrl, {
    headers: {'User-Agent': 'TMI-lab-profile-refresh/1.0 (+https://tmi-lab.org/)', 'Accept': 'text/html'},
    redirect: 'error',
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) throw new Error(`Scholar request failed (HTTP ${response.status}).`);
  const metrics = parseScholarProfile(await response.text(), now);
  const next = `${JSON.stringify(metrics, null, 2)}\n`;
  if (next !== previous) {
    const temporary = `${output}.${process.pid}.tmp`;
    try {
      await writeFile(temporary, next, 'utf8');
      await rename(temporary, output);
    } finally {
      await rm(temporary, {force: true});
    }
  }
  return metrics;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const metrics = await refreshScholar();
    console.log(`Scholar verified ${metrics.checked}: ${metrics.citations} citations, h-index ${metrics.hIndex}, i10-index ${metrics.i10Index}.`);
  } catch (error) {
    console.error(`Scholar refresh failed; the previous snapshot and checked date are unchanged. ${error.message}`);
    process.exitCode = 1;
  }
}
