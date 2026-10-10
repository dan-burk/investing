# Stocks vs. Metals

How the S&P 500, NASDAQ, Dow, gold, silver and copper have grown since 1927, and what $10 a month in each would be worth today. Live at https://danielburkhalter.dev/investing/.

- `index.html`: the page (plain HTML/JS, Plotly). It loads the CSVs and does all the math in the browser: % change since a start date, dollar-cost averaging, and the rank table. Assets and colors live in `ASSETS` at the top of the script.
- `data/data_*.csv`: monthly prices from [Macrotrends](https://www.macrotrends.net/), `"Date","Value"` with MM/DD/YYYY dates.
- `scripts/fetch-data.mjs`: refreshes the CSVs from the Macrotrends API (through curl; Macrotrends blocks Node's own fetch). An asset that fails keeps its previous CSV.
- `scripts/download_macrotrends_data.R`: the original R downloader, same output. Run from the repo root.
- `.github/workflows/deploy.yml`: refreshes the data, commits any change, and deploys to GitHub Pages on push and on the 2nd of each month.

If Macrotrends blocks GitHub's servers, refresh by hand: `node scripts/fetch-data.mjs` (or `source("scripts/download_macrotrends_data.R")`), then commit and push.

Run locally: `py -m http.server`, then open http://localhost:8000.

For information only, not investment advice.
