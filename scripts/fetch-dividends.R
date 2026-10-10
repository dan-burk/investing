# Download S&P 500 dividends from Robert Shiller's dataset (shillerdata.com)
# and save them as data/data_sp500_dividends.csv for the S&P 500 + Dividends line.
# In R/RStudio with the repo as the working directory, after fetch-data.mjs:
#   source("scripts/fetch-dividends.R")
# Shiller's file is Excel and its download link changes with each update, so
# we find it on his home page.
#
# Output: "Date","Value" with MM/01/YYYY dates; Value is the annual dividend
# per share (Shiller's D column). Dividends lag prices by a few months; the
# page reuses the latest dividend for months not filled in yet.

if (!require("pacman")) install.packages("pacman")
pacman::p_load(readxl)

ua <- "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
home <- tempfile(fileext = ".html")
download.file("https://shillerdata.com/", home, quiet = TRUE, headers = c(`User-Agent` = ua))
link <- regmatches(readLines(home, warn = FALSE), regexpr('//[^"]*ie_data\\.xls[^"]*', readLines(home, warn = FALSE)))
if (length(link) == 0) stop("Couldn't find ie_data.xls on shillerdata.com")

xls <- tempfile(fileext = ".xls")
download.file(paste0("https:", link[1]), xls, mode = "wb", quiet = TRUE, headers = c(`User-Agent` = ua))

# Data sheet: header block of 7 rows, then Date (YYYY.MM), P, D, ...
x <- suppressMessages(read_excel(xls, sheet = "Data", skip = 7, col_types = "text"))[, 1:3]
names(x) <- c("Date", "P", "D")
x <- x[!is.na(suppressWarnings(as.numeric(x$Date))) & !is.na(suppressWarnings(as.numeric(x$D))), ]

# "2026.1" means October: the month is the two digits after the point
year <- substr(x$Date, 1, 4)
month <- round((as.numeric(x$Date) %% 1) * 100)
out <- data.frame(Date = sprintf("%02d/01/%s", month, year), Value = round(as.numeric(x$D), 4))
write.csv(out, "data/data_sp500_dividends.csv", row.names = FALSE)

cat(sprintf("✓ Saved %d months of S&P 500 dividends (%s to %s) to data/data_sp500_dividends.csv\n",
            nrow(out), out$Date[1], out$Date[nrow(out)]))
