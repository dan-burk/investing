# Download Historical Financial Data from Macrotrends
# This script fetches monthly data for S&P 500, NASDAQ, Dow, Gold, Silver, and Copper
# from the Macrotrends API and saves them as CSV files in data/.
# Run from the repo root. The deploy workflow does the same thing with
# scripts/fetch-data.mjs; use this one if GitHub gets blocked.

# Load required packages
if (!require("pacman")) install.packages("pacman")
pacman::p_load(httr, jsonlite, dplyr)

# Define the datasets to download
datasets <- list(
  list(name = "sp500", id = "2324", filename = "data/data_sp500.csv"),
  list(name = "nasdaq", id = "1320", filename = "data/data_nasdaq.csv"),
  list(name = "dow", id = "1319", filename = "data/data_dow.csv"),
  list(name = "gold", id = "1333", filename = "data/data_gold.csv"),
  list(name = "silver", id = "1470", filename = "data/data_silver.csv"),
  list(name = "copper", id = "1476", filename = "data/data_copper.csv")
)

# Function to download and process data
download_macrotrends_data <- function(page_id, asset_name, output_file) {

  cat(sprintf("Downloading %s data...\n", asset_name))

  # Construct API URL
  url <- sprintf("https://www.macrotrends.net/economic-data/%s/INDEXMONTHLY", page_id)

  # Fetch data with error handling
  tryCatch({
    # Make GET request with browser headers to avoid 403 errors
    response <- GET(
      url,
      add_headers(
        `User-Agent` = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        `Accept` = "application/json, text/javascript, */*; q=0.01",
        `Referer` = sprintf("https://www.macrotrends.net/%s/", page_id),
        `Accept-Language` = "en-US,en;q=0.9"
      )
    )

    # Check if request was successful
    if (status_code(response) != 200) {
      stop(sprintf("Failed to download data. HTTP status code: %d", status_code(response)))
    }

    # Parse JSON response
    json_data <- content(response, as = "text", encoding = "UTF-8")
    parsed_data <- fromJSON(json_data)

    # Extract the data array
    data_array <- parsed_data$data

    # Check if data exists
    if (is.null(data_array) || length(data_array) == 0) {
      stop(sprintf("No data returned from API - check if page ID %s is correct for %s", page_id, asset_name))
    }

    # Convert to data frame
    df <- as.data.frame(data_array)

    # Check if we have the expected columns
    if (ncol(df) != 2) {
      stop(sprintf("Expected 2 columns but got %d", ncol(df)))
    }

    names(df) <- c("timestamp", "Value")

    # Convert timestamp (milliseconds) to date
    df$Date <- as.POSIXct(df$timestamp / 1000, origin = "1970-01-01", tz = "UTC")
    df$Date <- format(df$Date, "%m/%d/%Y")

    # Select and reorder columns
    df <- df %>% select(Date, Value)

    # Write to CSV
    write.csv(df, output_file, row.names = FALSE)

    cat(sprintf("✓ Successfully saved %s data to %s (%d rows)\n",
                asset_name, output_file, nrow(df)))

    return(TRUE)

  }, error = function(e) {
    cat(sprintf("✗ Error downloading %s: %s\n", asset_name, e$message))
    return(FALSE)
  })
}

# Download all datasets
cat("Starting data download from Macrotrends...\n\n")

results <- lapply(datasets, function(ds) {
  download_macrotrends_data(
    page_id = ds$id,
    asset_name = ds$name,
    output_file = ds$filename
  )
})

# Summary
cat("\n========== DOWNLOAD SUMMARY ==========\n")
successful <- sum(unlist(results))
total <- length(datasets)
cat(sprintf("Successfully downloaded: %d/%d datasets\n", successful, total))

if (successful == total) {
  cat("\n✓ All datasets downloaded successfully!\n")
  cat("You can now run your R Markdown analysis.\n")
} else {
  cat("\n⚠ Some downloads failed. Check error messages above.\n")
}
