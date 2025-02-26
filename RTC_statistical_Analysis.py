import pandas as pd
from scipy.stats import spearmanr

# Define file paths
lake_data_path = r"E:\FAU master\LESSONS\Semester 3\research training course\Data\Urmia_Lake_Analysis_interpolated.xlsx"
precip_data_path = r"E:\FAU master\LESSONS\Semester 3\research training course\Data\Urmia_Precipitation_Data.xlsx"
temp_data_path = r"E:\FAU master\LESSONS\Semester 3\research training course\Data\Urmia_Temperature_Data.xlsx"

# Load the datasets
lake_data = pd.read_excel(lake_data_path)
precip_data = pd.read_excel(precip_data_path)
temp_data = pd.read_excel(temp_data_path)

# Ensure "Year" column is properly named and filtered up to 2018
lake_data.rename(columns={"year": "Year"}, inplace=True)
precip_data.rename(columns={"year": "Year"}, inplace=True)
temp_data.rename(columns={"year": "Year"}, inplace=True)

lake_data = lake_data[lake_data["Year"] <= 2018]
precip_data = precip_data[precip_data["Year"] <= 2018]
temp_data = temp_data[temp_data["Year"] <= 2018]

# Convert decimal commas to dots (if present) and numeric columns
lake_data.replace(',', '.', regex=True, inplace=True)
precip_data.replace(',', '.', regex=True, inplace=True)
temp_data.replace(',', '.', regex=True, inplace=True)

lake_data = lake_data.apply(pd.to_numeric, errors='coerce')
precip_data = precip_data.apply(pd.to_numeric, errors='coerce')
temp_data = temp_data.apply(pd.to_numeric, errors='coerce')

# Calculate midsummer averages (July & August)
precip_data["Precipitation"] = precip_data[["Jul", "Aug"]].mean(axis=1, skipna=True)
temp_data["Temperature"] = temp_data[["Jul", "Aug"]].mean(axis=1, skipna=True)

# Keep only relevant columns
precip_data = precip_data[["Year", "Precipitation"]]
temp_data = temp_data[["Year", "Temperature"]]

# Merge datasets on 'Year' column
merged_data = lake_data.merge(precip_data, on="Year", how="inner").merge(temp_data, on="Year", how="inner")

# Define variable pairs for Spearman's correlation
correlation_pairs = [
    ("Mean_Vegetation_NDVI", "Temperature"),
    ("Mean_Vegetation_NDVI", "Precipitation"),
    ("Mean_Water_NDWI", "Temperature"),
    ("Mean_Water_NDWI", "Precipitation"),
    ("Mean_Water_MNDWI", "Temperature"),
    ("Mean_Water_MNDWI", "Precipitation"),
    ("Mean_Lake_Area", "Temperature"),
    ("Mean_Lake_Area", "Precipitation"),
    ("Mean_Lake_Area", "Mean_Water_NDWI")
]

# Compute Spearman's correlation
results = []
missing_vars = []

for var1, var2 in correlation_pairs:
    if var1 in merged_data.columns and var2 in merged_data.columns:
        # Drop NaN values before computing correlation
        valid_data = merged_data[[var1, var2]].dropna()

        if not valid_data.empty:
            spearman_corr, p_value = spearmanr(valid_data[var1], valid_data[var2])
            results.append(f"{var1} vs {var2}: Spearman Correlation = {spearman_corr:.4f}, p-value = {p_value:.4f}")
        else:
            missing_vars.append(f"{var1} vs {var2} - Not enough data (all values missing)")
    else:
        missing_vars.append(f"{var1} or {var2} not found in dataset")

# Save results to a text file
output_path = r"E:\FAU master\LESSONS\Semester 3\research training course\Data\Spearman_Correlation_Results.txt"
with open(output_path, "w") as file:
    file.write("Spearman Correlation Results (Up to Year 2018, Using July-August Averages):\n\n")
    for res in results:
        file.write(res + "\n")

    if missing_vars:
        file.write("\nMissing Data Issues:\n")
        for missing in missing_vars:
            file.write(missing + "\n")

# Print results
print("\nSpearman Correlation Results (Up to Year 2018, Using July-August Averages):\n")
for res in results:
    print(res)

if missing_vars:
    print("\nMissing Data Issues:")
    for missing in missing_vars:
        print(missing)

print(f"\nResults saved to: {output_path}")
