// Refreshes data/*.csv with full monthly history from Macrotrends. Runs in the
// deploy workflow; an asset that fails keeps its previous CSV, so the site
// always has complete (if stale) data. If GitHub's IPs get blocked, run this
// (or scripts/download_macrotrends_data.R) locally and push the CSVs.
//
// Macrotrends returns 403 without browser-like headers, and blocks Node's own
// fetch even with them (Cloudflare), so requests go through curl.
//
// Usage: node scripts/fetch-data.mjs

import { writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const ASSETS = { sp500: 2324, nasdaq: 1320, dow: 1319, gold: 1333, silver: 1470, copper: 1476 }

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
}

// same layout the R script writes: "Date","Value" with MM/DD/YYYY dates
const mdy = ms => { const d = new Date(ms); return [d.getUTCMonth() + 1, d.getUTCDate()].map(n => String(n).padStart(2, '0')).join('/') + '/' + d.getUTCFullYear() }

const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

// back-to-back requests sometimes draw a 403, so space them out and retry
function get(id, tries = 4) {
  const headers = Object.entries({ ...HEADERS, Referer: `https://www.macrotrends.net/${id}/` }).flatMap(([k, v]) => ['-H', `${k}: ${v}`])
  for (let i = 1; ; i++) {
    // -f fails on HTTP errors, so a 403 throws instead of returning an error page
    try { return execFileSync('curl', ['-fsS', ...headers, `https://www.macrotrends.net/economic-data/${id}/INDEXMONTHLY`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }) }
    catch (e) { if (i === tries) throw new Error(e.stderr?.trim() || e.message); sleep(5000 * i) }
  }
}

function fetchAsset(name, id) {
  const body = get(id)
  const rows = JSON.parse(body).data
  if (!rows?.length) throw new Error('no data returned')
  const csv = ['"Date","Value"', ...rows.filter(([, v]) => v != null).map(([t, v]) => `"${mdy(t)}",${v}`)].join('\n') + '\n'
  writeFileSync(new URL(`../data/data_${name}.csv`, import.meta.url), csv)
  return `${rows.length} rows, last ${mdy(rows[rows.length - 1][0])}`
}

let failed = 0
for (const [name, id] of Object.entries(ASSETS)) {
  try { console.log(`✓ ${name}: ${fetchAsset(name, id)}`) }
  catch (e) { failed++; console.log(`✗ ${name}: ${e.message.split('\n')[0]} (keeping previous CSV)`) }
}
console.log(failed ? `${failed} of ${Object.keys(ASSETS).length} failed` : 'All assets updated')
