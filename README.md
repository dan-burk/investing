# Stocks vs. Metals

## Monthly routine

Macrotrends blocks GitHub's servers, so refresh the data from your PC once a month. Pushing deploys the site.

1. Prices, in a terminal at the repo root:
   ```
   node scripts/fetch-data.mjs
   ```
2. S&P 500 dividends, in R/RStudio with the repo as the working directory:
   ```r
   source("scripts/fetch-dividends.R")
   ```
3. Commit and push, in the terminal:
   ```
   git add data && git commit -m "Refresh data" && git push
   ```

How the S&P 500, NASDAQ, Dow, gold, silver and copper have performed since 1927, and what $10 a month in each would be worth today. Live at https://danielburkhalter.dev/investing/.

## Data sources

Only these two sources are used:

- [Macrotrends](https://www.macrotrends.net/): monthly prices for every asset.
- [Robert Shiller](https://shillerdata.com/): S&P 500 dividends, for the S&P 500 + Dividends line. NASDAQ and Dow dividends aren't available, so those lines are price only.

## Files

- `index.html`: the page (plain HTML/JS, Plotly). It loads the CSVs and does all the math in the browser: % change since a start date, dollar-cost averaging, the S&P 500 + Dividends index, and the rank table. Assets and colors live in `ASSETS` at the top of the script.
- `data/data_*.csv`: monthly prices from Macrotrends, `"Date","Value"` with MM/DD/YYYY dates.
- `data/data_sp500_dividends.csv`: Shiller's S&P 500 annual dividend per share by month, same layout. It lags prices by a few months; the page reuses the latest dividend until new ones arrive.
- `scripts/fetch-data.mjs`: refreshes the price CSVs from the Macrotrends API (through curl; Macrotrends blocks Node's own fetch). An asset that fails keeps its previous CSV.
- `scripts/fetch-dividends.R`: refreshes the dividend CSV from Shiller's Excel file (needs R with readxl).
- `scripts/download_macrotrends_data.R`: the original R price downloader, same output as `fetch-data.mjs`. Run from the repo root.
- `.github/workflows/deploy.yml`: deploys to GitHub Pages on every push.

Run locally: `py -m http.server`, then open http://localhost:8000.

For information only, not investment advice.
