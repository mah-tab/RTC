############################################################################################
# KNMI model dataanalysis for urmia temperatures among 3 models
# temperatures


# Set working directory
setwd("E:/FAU master/LESSONS/Semester3/Modeling/S06/HW/urmia data")

# Load the data
BNU_hist <- read.table("BNU-ESM_ts_hist.txt")
BNU_pi <- read.table("BNU-ESM-ts_picontrol.txt")
BNU_rcp85 <- read.table("BNU-ESM-ts_rcp85.txt")

CanESM2_hist <- read.table("CanESM2_ts_hist.txt")
CanESM2_pi <- read.table("CanESM2_ts_picontrol.txt")
CanESM2_rcp85 <- read.table("CanESM2_ts_rcp85.txt")

CCSM4_hist <- read.table("CCSM4_ts_hist.txt")
CCSM4_pi <- read.table("CCSM4_ts_picontrol_rcp.txt")
CCSM4_rcp85 <- read.table("CCSM4_ts_rcp85.txt")

# Extract July data (8th column)
BNU_July_hist <- BNU_hist[,c(1,8)]
BNU_July_pi <- BNU_pi[,c(1,8)]
BNU_July_rcp85 <- BNU_rcp85[,c(1,8)]

CanESM2_July_hist <- CanESM2_hist[,c(1,8)]
CanESM2_July_pi <- CanESM2_pi[,c(1,8)]
CanESM2_July_rcp85 <- CanESM2_rcp85[,c(1,8)]

CCSM4_July_hist <- CCSM4_hist[,c(1,8)]
CCSM4_July_pi <- CCSM4_pi[,c(1,8)]
CCSM4_July_rcp85 <- CCSM4_rcp85[,c(1,8)]

# Filter data for the years 2000 to 2024
BNU_July_hist_filtered <- BNU_July_hist[BNU_July_hist[,1] >= 2000 & BNU_July_hist[,1] <= 2024,]
CanESM2_July_hist_filtered <- CanESM2_July_hist[CanESM2_July_hist[,1] >= 2000 & CanESM2_July_hist[,1] <= 2024,]
CCSM4_July_hist_filtered <- CCSM4_July_hist[CCSM4_July_hist[,1] >= 2000 & CCSM4_July_hist[,1] <= 2024,]

BNU_July_rcp85_filtered <- BNU_July_rcp85[BNU_July_rcp85[,1] >= 2000 & BNU_July_rcp85[,1] <= 2024,]
CanESM2_July_rcp85_filtered <- CanESM2_July_rcp85[CanESM2_July_rcp85[,1] >= 2000 & CanESM2_July_rcp85[,1] <= 2024,]
CCSM4_July_rcp85_filtered <- CCSM4_July_rcp85[CCSM4_July_rcp85[,1] >= 2000 & CCSM4_July_rcp85[,1] <= 2024,]

# Calculate mean and standard deviation for piControl
mean_pi <- mean(c(BNU_July_pi[,2], CanESM2_July_pi[,2], CCSM4_July_pi[,2]))
sd_pi <- sd(c(BNU_July_pi[,2], CanESM2_July_pi[,2], CCSM4_July_pi[,2]))

# Calculate mean and percentiles for historical data
mean_hist <- mean(c(BNU_July_hist_filtered[,2], CanESM2_July_hist_filtered[,2], CCSM4_July_hist_filtered[,2]))
perc_hist <- quantile(c(BNU_July_hist_filtered[,2], CanESM2_July_hist_filtered[,2], CCSM4_July_hist_filtered[,2]), prob=c(0.1, 0.9))

# Define colors
colors <- c("darkorange", "dodgerblue", "forestgreen")

# Plot filtered historical data (2000-2024)
plot(BNU_July_hist_filtered, type='l', ylim=c(15,40), col=colors[1], ylab="Temperature (°C)", xlab="Year", main="Historical Air Temperature of Urmia Lake area Iran in July (2000-2024)", xaxt='n')
lines(CanESM2_July_hist_filtered, col=colors[2])
lines(CCSM4_July_hist_filtered, col=colors[3])

# Add mean and percentile lines
abline(h=mean_hist, col="black", lwd=2)
abline(h=perc_hist[1], col="black", lty=2)
abline(h=perc_hist[2], col="black", lty=2)

# Add text for percentiles
text(2002, perc_hist[1] + 1, "10% percentile", col="black", cex=0.6)
text(2002, perc_hist[2] + 1, "90% percentile", col="black", cex=0.6)

# Add shaded region for piControl mean ± std
polygon(c(min(BNU_July_hist_filtered[,1]), max(BNU_July_hist_filtered[,1]), max(BNU_July_hist_filtered[,1]), min(BNU_July_hist_filtered[,1])), 
        c(mean_pi - sd_pi, mean_pi - sd_pi, mean_pi + sd_pi, mean_pi + sd_pi), 
        col=rgb(0,1,1,0.1), border=NA)

# Custom x-axis ticks for 2000-2024
axis(1, at=seq(2000, 2024, by=2))

# Add legend for historical data
legend("topleft", legend=c("BNU-ESM", "CanESM2", "CCSM4", "Mean", "10% & 90% Percentile"), 
       col=c(colors, "black", "black"), lty=c(1, 1, 1, 1, 2), lwd=c(1, 1, 1, 2, 1), cex=0.6)

# Calculate mean and percentiles for RCP85 data
mean_rcp85 <- mean(c(BNU_July_rcp85_filtered[,2], CanESM2_July_rcp85_filtered[,2], CCSM4_July_rcp85_filtered[,2]))
perc_rcp85 <- quantile(c(BNU_July_rcp85_filtered[,2], CanESM2_July_rcp85_filtered[,2], CCSM4_July_rcp85_filtered[,2]), prob=c(0.1, 0.9))

# Plot filtered RCP85 data (2000-2024)
plot(BNU_July_rcp85_filtered, type='l', ylim=c(15,45), col=colors[1], ylab="Temperature (°C)", xlab="Year", main="Projected Air Temperature of Urmia Lake area Iran in July (2000-2024)", xaxt='n')
lines(CanESM2_July_rcp85_filtered, col=colors[2])
lines(CCSM4_July_rcp85_filtered, col=colors[3])

# Add mean and percentile lines
abline(h=mean_rcp85, col="black", lwd=2)
abline(h=perc_rcp85[1], col="black", lty=2)
abline(h=perc_rcp85[2], col="black", lty=2)

# Add text for percentiles
text(2008, perc_rcp85[1] + 1, "10% percentile", col="black", cex=0.6)
text(2008, perc_rcp85[2] + 1, "90% percentile", col="black", cex=0.6)

# Add shaded region for piControl mean ± std
polygon(c(min(BNU_July_rcp85_filtered[,1]), max(BNU_July_rcp85_filtered[,1]), max(BNU_July_rcp85_filtered[,1]), min(BNU_July_rcp85_filtered[,1])), 
        c(mean_pi - sd_pi, mean_pi - sd_pi, mean_pi + sd_pi, mean_pi + sd_pi), 
        col=rgb(0,1,1,0.1), border=NA)

# Custom x-axis ticks for 2000-2024
axis(1, at=seq(2000, 2024, by=2))

# Add legend for RCP85 data
legend("topleft", legend=c("BNU-ESM", "CanESM2", "CCSM4", "Mean", "10% & 90% Percentile"), 
       col=c(colors, "black", "black", "black"), lty=c(1, 1, 1, 1, 2, 3), lwd=c(1, 1, 1, 2, 1, 1), cex=0.6)


###############################################################################################################
###########################################################################################################

# precipitation


setwd("E:/FAU master/LESSONS/Semester3/Modeling/S06/HW/urmia data")

# Load the data
BNU_hist <- read.table("BNU-ESM_pr_hist.txt", header = FALSE)
BNU_pi <- read.table("BNU-ESM_pr_picontrol.txt", header = FALSE)
BNU_rcp85 <- read.table("BNU-ESM_pr_rcp85.txt", header = FALSE)

CanESM2_hist <- read.table("CanESM2_pr_hist.txt", header = FALSE)
CanESM2_pi <- read.table("CanESM2_pr_picontrol.txt", header = FALSE)
CanESM2_rcp85 <- read.table("CanESM2_pr_rcp85.txt", header = FALSE)

CCSM4_hist <- read.table("CCSM4_pr_hist.txt", header = FALSE)
CCSM4_pi <- read.table("CCSM4_pr_picontrol.txt", header = FALSE)
CCSM4_rcp85 <- read.table("CCSM4_pr_rcp85.txt", header = FALSE)

# Extract January data (1st and 2nd columns)
BNU_July_hist <- BNU_hist[, c(1, 2)]
BNU_July_pi <- BNU_pi[, c(1, 2)]
BNU_July_rcp85 <- BNU_rcp85[, c(1, 2)]

CanESM2_July_hist <- CanESM2_hist[, c(1, 2)]
CanESM2_July_pi <- CanESM2_pi[, c(1, 2)]
CanESM2_July_rcp85 <- CanESM2_rcp85[, c(1, 2)]

CCSM4_July_hist <- CCSM4_hist[, c(1, 2)]
CCSM4_July_pi <- CCSM4_pi[, c(1, 2)]
CCSM4_July_rcp85 <- CCSM4_rcp85[, c(1, 2)]

# Filter data for the years 2000 to 2024
BNU_July_hist_filtered <- BNU_July_hist[BNU_July_hist[,1] >= 2000 & BNU_July_hist[,1] <= 2024,]
CanESM2_July_hist_filtered <- CanESM2_July_hist[CanESM2_July_hist[,1] >= 2000 & CanESM2_July_hist[,1] <= 2024,]
CCSM4_July_hist_filtered <- CCSM4_July_hist[CCSM4_July_hist[,1] >= 2000 & CCSM4_July_hist[,1] <= 2024,]

BNU_July_rcp85_filtered <- BNU_July_rcp85[BNU_July_rcp85[,1] >= 2000 & BNU_July_rcp85[,1] <= 2024,]
CanESM2_July_rcp85_filtered <- CanESM2_July_rcp85[CanESM2_July_rcp85[,1] >= 2000 & CanESM2_July_rcp85[,1] <= 2024,]
CCSM4_July_rcp85_filtered <- CCSM4_July_rcp85[CCSM4_July_rcp85[,1] >= 2000 & CCSM4_July_rcp85[,1] <= 2024,]

# Calculate mean and standard deviation for piControl
mean_pi <- mean(c(BNU_July_pi[, 2], CanESM2_July_pi[, 2], CCSM4_July_pi[, 2]))
sd_pi <- sd(c(BNU_July_pi[, 2], CanESM2_July_pi[, 2], CCSM4_July_pi[, 2]))

# Calculate mean and percentiles for historical data
mean_hist <- mean(c(BNU_July_hist_filtered[, 2], CanESM2_July_hist_filtered[, 2], CCSM4_July_hist_filtered[, 2]))
perc_hist <- quantile(c(BNU_July_hist_filtered[, 2], CanESM2_July_hist_filtered[, 2], CCSM4_July_hist_filtered[, 2]), prob = c(0.1, 0.9))

# Define colors
colors <- c("darkorange", "dodgerblue", "forestgreen")

# Plot filtered historical data (2000-2024)
plot(BNU_July_hist_filtered, type = 'l', ylim = c(0, max(BNU_July_hist_filtered[, 2], CanESM2_July_hist_filtered[, 2], CCSM4_July_hist_filtered[, 2]) + 0.1), 
     col = colors[1], ylab = "Precipitation (mm)", xlab = "Year", main = "Historical Precipitation of Urmia Lake area Iran in January (2000-2024)", xaxt = 'n')
lines(CanESM2_July_hist_filtered, col = colors[2])
lines(CCSM4_July_hist_filtered, col = colors[3])

# Add mean and percentile lines
abline(h = mean_hist, col = "black", lwd = 2)
abline(h = perc_hist[1], col = "black", lty = 2)
abline(h = perc_hist[2], col = "black", lty = 2)

# Add text for percentiles
text(2002, perc_hist[1] + 1, "10% percentile", col = "black", cex = 0.6)
text(2002, perc_hist[2] + 1, "90% percentile", col = "black", cex = 0.6)

# Add shaded region for piControl mean ± std
polygon(c(min(BNU_July_hist_filtered[, 1]), max(BNU_July_hist_filtered[, 1]), max(BNU_July_hist_filtered[, 1]), min(BNU_July_hist_filtered[, 1])), 
        c(mean_pi - sd_pi, mean_pi - sd_pi, mean_pi + sd_pi, mean_pi + sd_pi), 
        col = rgb(0, 1, 1, 0.1), border = NA)

# Custom x-axis ticks for 2000-2024
axis(1, at = seq(2000, 2024, by = 2))

# Add legend for historical data
legend("topright", legend = c("BNU-ESM", "CanESM2", "CCSM4", "Mean", "10% & 90% Percentile"), 
       col = c(colors, "black", "black"), lty = c(1, 1, 1, 1, 2), lwd = c(1, 1, 1, 2, 1), cex = 0.6)

# Calculate mean and percentiles for RCP85 data
mean_rcp85 <- mean(c(BNU_July_rcp85_filtered[, 2], CanESM2_July_rcp85_filtered[, 2], CCSM4_July_rcp85_filtered[, 2]))
perc_rcp85 <- quantile(c(BNU_July_rcp85_filtered[, 2], CanESM2_July_rcp85_filtered[, 2], CCSM4_July_rcp85_filtered[, 2]), prob = c(0.1, 0.9))

# Plot filtered RCP85 data (2000-2024)
plot(BNU_July_rcp85_filtered, type = 'l', ylim = c(0, max(BNU_July_rcp85_filtered[, 2], CanESM2_July_rcp85_filtered[, 2], CCSM4_July_rcp85_filtered[, 2]) + 0.1), 
     col = colors[1], ylab = "Precipitation (mm)", xlab = "Year", main = "Projected Precipitation of Urmia Lake area Iran in January (2000-2024)", xaxt = 'n')
lines(CanESM2_July_rcp85_filtered, col = colors[2])
lines(CCSM4_July_rcp85_filtered, col = colors[3])

# Add mean and percentile lines
abline(h = mean_rcp85, col = "black", lwd = 2)
abline(h = perc_rcp85[1], col = "black", lty = 2)
abline(h = perc_rcp85[2], col = "black", lty = 2)

# Add text for percentiles
text(2008, perc_rcp85[1] + 1, "10% percentile", col = "black", cex = 0.6)
text(2008, perc_rcp85[2] + 1, "90% percentile", col = "black", cex = 0.6)

# Add shaded region for piControl mean ± std
polygon(c(min(BNU_July_rcp85_filtered[, 1]), max(BNU_July_rcp85_filtered[, 1]), max(BNU_July_rcp85_filtered[, 1]), min(BNU_July_rcp85_filtered[, 1])), 
        c(mean_pi - sd_pi, mean_pi - sd_pi, mean_pi + sd_pi, mean_pi + sd_pi), 
        col = rgb(0, 1, 1, 0.1), border = NA)

# Custom x-axis ticks for 2000-2024
axis(1, at = seq(2000, 2024, by = 2))

# Add legend for RCP85 data
legend("topright", legend = c("BNU-ESM", "CanESM2", "CCSM4", "Mean", "10% & 90% Percentile"), 
       col = c(colors, "black", "black", "black"), lty = c(1, 1, 1, 1, 2, 3), lwd = c(1, 1, 1, 2, 1, 1), cex = 0.6)

