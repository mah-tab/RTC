import pandas as pd
import matplotlib.pyplot as plt


def plot_indices_from_excel(file_path, save_path):
    # Load the Excel file
    df = pd.read_excel(file_path)

    # Convert decimal separator from comma to dot if necessary
    df.replace(',', '.', regex=True, inplace=True)

    # Convert columns to numeric values
    df["Mean_Vegetation_NDVI"] = pd.to_numeric(df["Mean_Vegetation_NDVI"], errors='coerce')
    df["Mean_Water_MNDWI"] = pd.to_numeric(df["Mean_Water_MNDWI"], errors='coerce')
    df["Mean_Water_NDWI"] = pd.to_numeric(df["Mean_Water_NDWI"], errors='coerce')
    df["Mean_Lake_Area"] = pd.to_numeric(df["Mean_Lake_Area"], errors='coerce')
    df["year"] = pd.to_numeric(df["year"], errors='coerce')

    # Plot NDVI, MNDWI, and NDWI
    plt.figure(figsize=(10, 6))
    plt.plot(df["year"], df["Mean_Vegetation_NDVI"], label="Mean Vegetation NDVI", marker='o', color='green')
    plt.plot(df["year"], df["Mean_Water_MNDWI"], label="Mean Water MNDWI", marker='s', color='brown')
    plt.plot(df["year"], df["Mean_Water_NDWI"], label="Mean Water NDWI", marker='^', color='blue')

    # Formatting the plot
    plt.xlabel("Year", fontsize=14)
    plt.ylabel("Index Value", fontsize=14)
    plt.title("Mean Spectral Parameters Over Years", fontsize=16)
    plt.xticks(fontsize=12)
    plt.yticks(fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)

    # Save the plot
    image_path = f"{save_path}/Urmia_Lake_Analysis_plot.png"
    plt.savefig(image_path, dpi=400)
    plt.show()

    # Plot Lake Area changes
    plt.figure(figsize=(10, 6))
    plt.plot(df["year"], df["Mean_Lake_Area"], label="Mean Lake Area (km²)", marker='o', color='blue')

    # Formatting the plot
    plt.xlabel("Year", fontsize=14)
    plt.ylabel("Lake Area (km²)", fontsize=14)
    plt.title("Lake Area Changes Over Years", fontsize=16)
    plt.xticks(fontsize=12)
    plt.yticks(fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True)

    # Save the lake area plot
    lake_area_image_path = f"{save_path}/Urmia_Lake_Area_Changes.png"
    plt.savefig(lake_area_image_path, dpi=400)
    plt.show()

    return image_path, lake_area_image_path


file_path = "E:\\FAU master\\LESSONS\Semester 3\\research training course\Data\\Urmia_Lake_Analysis_interpolated.xlsx"
save_path = "E:\\FAU master\\LESSONS\Semester 3\\research training course\Data"  # Update with actual save path
image_path, lake_area_image_path = plot_indices_from_excel(file_path, save_path)
print(f"Plots saved at: {image_path} and {lake_area_image_path}")
