import pandas as pd
import matplotlib.pyplot as plt
import os

# Define the save path for figures
fig_save_path = "E:\\FAU master\\LESSONS\\Semester 3\\research training course\\Data"
os.makedirs(fig_save_path, exist_ok=True)

# Load precipitation data
precipitation_data = pd.read_excel("E:\\FAU master\\LESSONS\\Semester 3\\research training course\\Code\\Urmia_precipitation_Data.xlsx")

# Load temperature data
temperature_data = pd.read_excel("E:\\FAU master\\LESSONS\\Semester 3\\research training course\\Code\\Urmia_Temperature_Data.xlsx")

# Replace missing values (-999.9 and -888.8) with NaN
precipitation_data.replace([-999.9, -888.8], pd.NA, inplace=True)
temperature_data.replace([-999.9, -888.8], pd.NA, inplace=True)

# Calculate midsummer (July and August) averages
precipitation_data["MidSummerAvg"] = precipitation_data[["Jul", "Aug"]].mean(axis=1, skipna=True)
temperature_data["MidSummerAvg"] = temperature_data[["Jul", "Aug"]].mean(axis=1, skipna=True)

# Convert years to integers for proper formatting
precipitation_data["Year"] = precipitation_data["Year"].astype(int)
temperature_data["Year"] = temperature_data["Year"].astype(int)

# Define font sizes
tl = 16  # Title font size
al = 14  # Axis label font size
tl_ticks = 12  # Tick font size

# Set x-ticks every 2 years
years = precipitation_data["Year"]
xticks_labels = years[::2]  # Select every second year

# Plot midsummer precipitation
plt.figure(figsize=(10, 6))
plt.plot(precipitation_data["Year"], precipitation_data["MidSummerAvg"], marker='o', linestyle='-', color='blue', label="Precipitation (mm)")
plt.xlabel("Year", fontsize=al)
plt.ylabel("Precipitation (mm)", fontsize=al)
plt.title("Yearly Mid-Summer (July-August) Precipitation (mm) - Lake Urmia", fontsize=tl)
plt.xticks(xticks_labels, rotation=45, fontsize=tl_ticks)  # Display years every 2 years
plt.yticks(fontsize=tl_ticks)
plt.ylim(0, 30)  # Set y-axis range from 0 to 30
plt.grid(True)
plt.legend(fontsize=tl_ticks)

# Save the precipitation figure
precip_fig_path = os.path.join(fig_save_path, "MidSummer_Precipitation.png")
plt.savefig(precip_fig_path, dpi=400, bbox_inches='tight')
plt.show()

# Plot midsummer temperature
plt.figure(figsize=(10, 6))
plt.plot(temperature_data["Year"], temperature_data["MidSummerAvg"], marker='o', linestyle='-', color='red', label="Temperature (°C)")
plt.xlabel("Year", fontsize=al)
plt.ylabel("Temperature (°C)", fontsize=al)
plt.title("Yearly Mid-Summer (July-August) Temperature (°C) - Lake Urmia", fontsize=tl)
plt.xticks(xticks_labels, rotation=45, fontsize=tl_ticks)  # Display years every 2 years
plt.yticks(fontsize=tl_ticks)
plt.ylim(15, 30)  # Set y-axis range from 15 to 30
plt.grid(True)
plt.legend(fontsize=tl_ticks)

# Save the temperature figure
temp_fig_path = os.path.join(fig_save_path, "MidSummer_Temperature.png")
plt.savefig(temp_fig_path, dpi=400, bbox_inches='tight')
plt.show()

# Plot combined temperature and precipitation with dual y-axes
fig, ax1 = plt.subplots(figsize=(10, 6))

# Primary y-axis (left) for precipitation
ax1.set_xlabel("Year", fontsize=al)
ax1.set_ylabel("Precipitation (mm)", fontsize=al, color="blue")
ax1.plot(precipitation_data["Year"], precipitation_data["MidSummerAvg"], marker='o', linestyle='-', color='blue', label="Precipitation (mm)")
ax1.tick_params(axis='y', labelcolor="blue")
ax1.set_ylim(0, 30)  # Set y-axis range from 0 to 30

# Secondary y-axis (right) for temperature
ax2 = ax1.twinx()
ax2.set_ylabel("Temperature (°C)", fontsize=al, color="red")
ax2.plot(temperature_data["Year"], temperature_data["MidSummerAvg"], marker='o', linestyle='-', color='red', label="Temperature (°C)")
ax2.tick_params(axis='y', labelcolor="red")
ax2.set_ylim(15, 30)  # Set y-axis range from 15 to 30

# Title and grid
plt.title("Yearly Mid-Summer (July-August) Temperature & Precipitation - Lake Urmia", fontsize=tl)
ax1.set_xticks(xticks_labels)  # Display years every 2 years
ax1.set_xticklabels(xticks_labels, rotation=45, fontsize=tl_ticks)
plt.grid(True)

# Save the combined figure
combined_fig_path = os.path.join(fig_save_path, "MidSummer_Temp_Precip_Combined.png")
plt.savefig(combined_fig_path, dpi=400, bbox_inches='tight')
plt.show()

print(f"Precipitation figure saved at: {precip_fig_path}")
print(f"Temperature figure saved at: {temp_fig_path}")
print(f"Combined figure saved at: {combined_fig_path}")
