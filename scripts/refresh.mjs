// The whole monthly refresh in one command, run from your PC (Macrotrends
// blocks GitHub's servers):
//   1. prices from Macrotrends      (scripts/fetch-data.mjs)
//   2. dividends from Shiller        (scripts/fetch-dividends.R, if R is installed)
//   3. commit and push data/ if anything changed, which deploys the site
//
// Usage, from anywhere:  node scripts/refresh.mjs
// Add --no-push to refresh and commit without pushing.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const push = !process.argv.includes('--no-push')
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { cwd: root, encoding: 'utf8', ...opts })

// 1. Prices. fetch-data.mjs keeps an asset's old CSV when it fails, so a partial failure is still worth committing.
console.log('Prices (Macrotrends)')
const prices = run(process.execPath, ['scripts/fetch-data.mjs'])
console.log(prices.trimEnd().replace(/^/gm, '  '))
if (!prices.includes('✓')) { console.error('No prices updated; stopping.'); process.exit(1) }

// 2. Dividends. Optional: Shiller updates every few months, and the page reuses the latest dividend meanwhile.
function findRscript() {
  try { run(process.platform === 'win32' ? 'where' : 'which', ['Rscript'], { stdio: 'pipe' }); return 'Rscript' } catch {}
  const base = 'C:/Program Files/R'
  if (!existsSync(base)) return null
  const latest = readdirSync(base).filter(d => /^R-\d/.test(d)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop()
  const exe = latest && join(base, latest, 'bin', 'Rscript.exe')
  return exe && existsSync(exe) ? exe : null
}
console.log('Dividends (Shiller)')
const rscript = findRscript()
if (!rscript) console.log('  R not found; skipping (the page reuses the latest dividend)')
else {
  try { console.log('  ' + run(rscript, ['-e', 'source("scripts/fetch-dividends.R")'], { stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n').pop()) }
  catch (e) { console.log(`  failed, keeping previous CSV: ${(e.stderr || e.message).trim().split('\n').pop()}`) }
}

// 3. Commit and push.
if (!run('git', ['status', '--porcelain', 'data']).trim()) { console.log('No data changes; nothing to commit.'); process.exit(0) }
const last = readFileSync(join(root, 'data/data_sp500.csv'), 'utf8').trim().split('\n').pop().match(/"(\d\d)\/(\d\d)\/(\d{4})"/)
const through = last ? new Date(Date.UTC(+last[3], +last[1] - 1, +last[2])).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : 'latest'
run('git', ['add', 'data'])
run('git', ['commit', '-q', '-m', `Refresh data through ${through}`])
console.log(`Committed: Refresh data through ${through}`)
if (push) { run('git', ['push', '-q'], { stdio: 'inherit' }); console.log('Pushed; the site redeploys in a minute or two.') }
else console.log('Not pushed (--no-push).')
