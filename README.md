# Stocks vs. Metals

## Monthly routine

Macrotrends blocks GitHub's servers, so refresh the data from your PC once a month. Pushing deploys the site.

```
node scripts/fetch-data.mjs
git commit -am "Refresh data" && git push
```

How the S&P 500, NASDAQ, Dow, gold, silver and copper have performed since 1927, and what $10 a month in each would be worth today. Live at https://danielburkhalter.dev/investing/.

- `index.html`: the page (plain HTML/JS, Plotly). It loads the CSVs and does all the math in the browser: % change since a start date, dollar-cost averaging, and the rank table. Assets and colors live in `ASSETS` at the top of the script.
- `data/data_*.csv`: monthly prices from [Macrotrends](https://www.macrotrends.net/), `"Date","Value"` with MM/DD/YYYY dates.
- `scripts/fetch-data.mjs`: refreshes the CSVs from the Macrotrends API (through curl; Macrotrends blocks Node's own fetch). An asset that fails keeps its previous CSV.
- `scripts/download_macrotrends_data.R`: the original R downloader, same output. Run from the repo root.
- `.github/workflows/deploy.yml`: deploys to GitHub Pages on every push.

The R script works too for the monthly refresh: `source("scripts/download_macrotrends_data.R")` from the repo root.

Run locally: `py -m http.server`, then open http://localhost:8000.

For information only, not investment advice.
