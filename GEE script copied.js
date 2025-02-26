# GEE script draft
// MAHTAB ARJOMANDI
// Scripting for remote sensing project
// Lake Urmia area spectral parameters, mid summer, 2000-2024
/*
  this scripts filters images from landsat 5 and 8 Tier 1, for july and august 2000-2024 with
a cloud coverage less than 10 percent, concatenates them, finds and displays the min and max NDVI and NDWI,
calculates spectral parameters NDVI, NDWI, MNDWI, NDMI over the images (mean value of july and august)
and exports it as a data frame
*/
  
Imports (3 entries) 
‣ var landsat8: Imagecollection "USGS Landsat 8 Level 2, Collection 2, Tier 1"
‣ var landsat5: Imagecollection "USGS Landsat 5 Level 2, Collection 2, Tier 1"
var AOI: Polygon, 4 vertices type: Polygon coordinates: 
  List (1 element) 0: List (5 elements) ‣
0: [44.78191028067244,36.847625422175961
‣1: [46.17168078848494,36.84762542217596
‣2: [46.17168078848494,38.495389372632621
‣ 3: 44.78191028067244,38.49538937263262
‣ 4: [44.78191028067244,36.84762542217596

*/

// Defining the area of interest (AOI) and calculating its area and perimeter
var areaInSquareMeters = AOI.area(1);
var areaInSquareKilometers = areaInSquareMeters.divide(1e6); // square km

print('Area of AOI in square meters:', areaInSquareMeters);
print('Area of AOI in square kilometers:', areaInSquareKilometers);

var perimeterInMeters = AOI.perimeter({maxError: 1});
var perimeterInKilometers = perimeterInMeters.divide(1000); // km

print('Perimeter of AOI in meters:', perimeterInMeters);
print('Perimeter of AOI in kilometers:', perimeterInKilometers);

// Spatial and Temporal Filter on Landsat 5 and 8 images
var landsat5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
                .filterBounds(AOI)
                .filterDate('2000-01-01', '2012-12-31')
                .filter(ee.Filter.calendarRange(7, 8, 'month')) // August only
                .filter(ee.Filter.lt('CLOUD_COVER', 10))
                .map(function(image) {
                  return image.clip(AOI); // Clip the images to the AOI
                });

var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
                .filterBounds(AOI)
                .filterDate('2013-01-01', '2024-08-31')
                .filter(ee.Filter.calendarRange(7, 8, 'month')) // August only
                .filter(ee.Filter.lt('CLOUD_COVER', 10))
                .map(function(image) {
                  return image.clip(AOI); // Clip the images to the AOI
                });

print('Filtered Landsat 5 Collection Size:', landsat5.size());
print('Filtered Landsat 8 Collection Size:', landsat8.size());

//Map.addLayer(landsat5);


// Function to calculate indices
function calculateIndices(image) {
  var ndvi = image.normalizedDifference(['SR_B4', 'SR_B3']).rename('NDVI');
  var ndwi = image.normalizedDifference(['SR_B2', 'SR_B4']).rename('NDWI');
  var mndwi = image.normalizedDifference(['SR_B2', 'SR_B5']).rename('MNDWI');
  var ndmi = image.normalizedDifference(['SR_B4', 'SR_B5']).rename('NDMI');

  if (image.get('SPACECRAFT_ID') === 'LANDSAT_8') {
    ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
    ndwi = image.normalizedDifference(['SR_B3', 'SR_B5']).rename('NDWI');
    mndwi = image.normalizedDifference(['SR_B3', 'SR_B6']).rename('MNDWI');
    ndmi = image.normalizedDifference(['SR_B5', 'SR_B6']).rename('NDMI');
  }
  
  return image.addBands([ndvi, ndwi, mndwi, ndmi]);
}

// Applying the function to both Landsat 5 and 8 collections
var indices5 = landsat5.map(calculateIndices);
var indices8 = landsat8.map(calculateIndices);

print('Sample Landsat 5 Image Bands (after adding indices):', indices5.first().bandNames());
print('Sample Landsat 8 Image Bands (after adding indices):', indices8.first().bandNames());

print('Calculated Indices for Landsat 5 Collection Size:', indices5.size());
print('Calculated Indices for Landsat 8 Collection Size:', indices8.size());

// Merging the Landsat 5 and 8 collections with calculated indices
var mergedIndices = indices8.merge(indices5);
print('Merged Indices Collection Sample Bands (after merging):', mergedIndices.first().bandNames());

// Mosaic the two collections: This combines the best images for each time period
//var mergedIndices = ee.ImageCollection(indices5.merge(indices8))
//                        .sort('system:time_start');  // Sort by date
// Check the bands in the mosaic collection
//print('Mosaic Collection Sample Bands:', mergedIndices.first().bandNames());

// Function to create a color bar legend for the parameters/////////////////////////////
function createSimpleLegend(title, palette, min, max) {
  // Create the color bar using ui.Thumbnail
  var colorBar = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),  // Generate a simple image
    params: {
      bbox: [0, 0, 1, 0.1],  // Size of the color bar (horizontal)
      dimensions: '100x10',  // Width and height of the bar
      format: 'png',         // Image format
      min: 0,
      max: 1,
      palette: palette       // Use the provided color palette
    },
    style: {stretch: 'horizontal'}
  });

  // Create labels for the min and max values
  var minLabel = ui.Label(min, {margin: '4px 8px', textAlign: 'left'});
  var maxLabel = ui.Label(max, {margin: '4px 8px', textAlign: 'right'});
  
  // Create a title label
  var legendTitle = ui.Label({
    value: title,
    style: {fontWeight: 'bold', fontSize: '12px'}
  });

  // Combine everything into a panel with labels on both sides of the color bar
  var legendPanel = ui.Panel({
    widgets: [
      legendTitle,
      ui.Panel([minLabel, colorBar, maxLabel], ui.Panel.Layout.flow('horizontal'))
    ],
    style: {
      position: 'bottom-center',
      padding: '1px',
      backgroundColor: 'white'
    }
  });
  
  return legendPanel;
}

// Create and add the NDVI legend to the map
var ndviLegend = createSimpleLegend('NDVI', ['blue', 'white', 'green'], -1, 1);
Map.add(ndviLegend);

// Create and add the NDWI legend to the map
var ndwiLegend = createSimpleLegend('NDWI', ['00FFFF', '0000FF'], -1, 1);
Map.add(ndwiLegend);

// Visualization parameters for NDVI
var ndviVisParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};
var ndwiVisParams = {min: -1, max: 1, palette: ['00FFFF', '0000FF']};
var mndwiVisParams = {min: -1, max: 1, palette: ['00FFFF', '0000FF', 'black']};
var ndmiVisParams = {min: -1, max: 1, palette: ['white', 'brown', 'green']};
// Add NDVI layer to the map

Map.addLayer(mergedIndices.select('NDVI'), ndviVisParams, 'NDVI');
Map.addLayer(mergedIndices.select('NDWI'), ndwiVisParams, 'NDWI');
Map.addLayer(mergedIndices.select('MNDWI'), mndwiVisParams, 'MNDWI');
Map.addLayer(mergedIndices.select('NDMI'), ndmiVisParams, 'NDMI');

// Mean calculations //////////////////////////////////////////////////

// Function to calculate mean NDVI for each image ////////////////////
function addMeanNDVI(image) {
  var meanNDVI = image.select('NDVI').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: AOI,
    scale: 30,
    maxPixels: 1e9
  }).get('NDVI');
  
  return image.set('meanNDVI', meanNDVI);
}

// Applying the function to the merged collection
var mergedWithMeanNDVI = mergedIndices.map(addMeanNDVI);

// Sorting the collection by mean NDVI
var sortedByNDVI = mergedWithMeanNDVI.sort('meanNDVI');

// Getting the first (min NDVI) and last (max NDVI) images
var minNDVIImage = sortedByNDVI.first();
var maxNDVIImage = sortedByNDVI.sort('meanNDVI', false).first();

// Printing image information for the min and max NDVI images
print('Image with Minimum Mean NDVI:', minNDVIImage);
print('Image with Maximum Mean NDVI:', maxNDVIImage);



// Function to calculate mean NDWI for each image /////////////////
function addMeanNDWI(image) {
  var meanNDWI = image.select('NDWI').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: AOI,
    scale: 30,
    maxPixels: 1e9
  }).get('NDWI');
  
  return image.set('meanNDWI', meanNDWI);
}

// Applying the function to the merged collection
var mergedWithMeanNDWI = mergedIndices.map(addMeanNDWI);

// Sorting the collection by mean NDWI
var sortedByNDWI = mergedWithMeanNDWI.sort('meanNDWI');

// Getting the first (min) and last (max) images
var minNDWIImage = sortedByNDWI.first();
var maxNDWIImage = sortedByNDWI.sort('meanNDWI', false).first();

// Printing image information for the min and max NDVI images
print('Image with Minimum Mean NDWI:', minNDWIImage);
print('Image with Maximum Mean NDWI:', maxNDWIImage);

/////////////////////////////////////////////////
/*
// Select only the index bands (NDVI, NDWI, MNDWI, NDMI) from both collections
var selectedBands = ['NDVI', 'NDWI', 'MNDWI', 'NDMI'];
var filteredMergedIndices = mergedIndices.select(selectedBands);

// Find the maximum NDVI image based on the average NDVI value across the entire image (ascending)
var maxNdviImage = filteredMergedIndices.sort('NDVI', true).first();

// Print the metadata of the image with the maximum NDVI
print('Image with Maximum NDVI:', maxNdviImage);
print('Image Metadata:', maxNdviImage.getInfo());

// Create a list of images from the filteredMergedIndices ImageCollection
var imagesList = filteredMergedIndices.toList(filteredMergedIndices.size());

// Combine the max NDVI image with the other images in the collection to create a mosaic
var mosaicMaxNdviImage = ee.ImageCollection.fromImages(ee.List([maxNdviImage]).cat(imagesList)).mosaic();

// Clip the mosaicked image to the AOI (assuming AOI is defined in your script)
var clippedMosaicMaxNdviImage = mosaicMaxNdviImage.clip(AOI);

// Visualization parameters for NDVI
var ndviVisParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};

// Display the clipped mosaicked image with maximum NDVI on the map
Map.addLayer(clippedMosaicMaxNdviImage.select('NDVI'), ndviVisParams, 'Clipped Mosaic Max NDVI Image');

// Center the map on the AOI
Map.centerObject(AOI, 8);
*/
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/// MAX PARAMETER DISPLAY : 
// NDVI 

// Select only the index bands (NDVI, NDWI, MNDWI, NDMI) from both collections
var selectedBands = ['NDVI', 'NDWI', 'MNDWI', 'NDMI'];
var filteredMergedIndices = mergedIndices.select(selectedBands);

// Find the image with the max NDVI pixel value using qualityMosaic
var maxNdviImage = filteredMergedIndices.qualityMosaic('NDVI');

// Print the metadata of the image with the max NDVI
print('Image with maximum NDVI:', maxNdviImage);
print('Image Metadata:', maxNdviImage.getInfo());

// Visualization parameters for NDVI
var ndviVisParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};

// Clip the image to the AOI (assuming AOI is defined in your script)
var clippedmaxNdviImage = maxNdviImage.clip(AOI);

// Display the clipped image with minimum NDVI on the map
Map.addLayer(clippedmaxNdviImage.select('NDVI'), ndviVisParams, 'Clipped Max NDVI Image');

// Center the map on the AOI
Map.centerObject(AOI, 8);


/////////////////////////////////////////////////////
///MIN PARAMETER DISPLAY
// Inverted NDVI for quality mosaic
// Select only the index bands (NDVI, NDWI, MNDWI, NDMI) from both collections
var selectedBands = ['NDVI', 'NDWI', 'MNDWI', 'NDMI'];
var filteredMergedIndices = mergedIndices.select(selectedBands);

// Invert NDVI values by multiplying by -1 to find min pixel values by sorting
var invertedNdviCollection = filteredMergedIndices.map(function(image) {
  return image.addBands(image.select('NDVI').multiply(-1).rename('NDVI_inverted'));
});

// Find the image with the min inverted NDVI (which is the max NDVI pixel values using qualityMosaic)
var minNdviImageInverted = invertedNdviCollection.qualityMosaic('NDVI_inverted');

// Revert the NDVI to the correct (minimum) values by multiplying by -1 again
var minNdviImage = minNdviImageInverted.select('NDVI_inverted').multiply(-1).rename('NDVI');

// Print the metadata of the image with the minimum NDVI
print('Image with Minimum NDVI (per pixel):', minNdviImage);
print('Image Metadata:', minNdviImage.getInfo());

// Visualization parameters for NDVI
var ndviVisParams = {min: -1, max: 1, palette: ['blue', 'white', 'green']};

// Clip the image to the AOI (assuming AOI is defined in your script)
var clippedMinNdviImage = minNdviImage.clip(AOI);

// Display the clipped image with minimum NDVI on the map
Map.addLayer(clippedMinNdviImage, ndviVisParams, 'Clipped Min NDVI Image');

// Center the map on the AOI
Map.centerObject(AOI, 8);

//////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
// NDWI

// Select only the index bands (NDVI, NDWI, MNDWI, NDMI) from both collections
var selectedBands = ['NDVI', 'NDWI', 'MNDWI', 'NDMI'];
var filteredMergedIndices = mergedIndices.select(selectedBands);

// Find the image with the max NDVI pixel value using qualityMosaic
var maxNdwiImage = filteredMergedIndices.qualityMosaic('NDWI');

// Print the metadata of the image with the max NDVI
print('Image with maximum NDWI:', maxNdwiImage);
print('Image Metadata:', maxNdwiImage.getInfo());

// Visualization parameters for NDVI
var ndwiVisParams = {min: -1, max: 1, palette: ['00FFFF', '0000FF']};

// Clip the image to the AOI (assuming AOI is defined in your script)
var clippedmaxNdwiImage = maxNdwiImage.clip(AOI);

// Display the clipped image with minimum NDVI on the map
Map.addLayer(clippedmaxNdwiImage.select('NDWI'), ndwiVisParams, 'Clipped Max NDWI Image');

// Center the map on the AOI
Map.centerObject(AOI, 8);


/////////////////////////////////////////////////////
///MIN PARAMETER DISPLAY
// Inverted NDWI for quality mosaic
// Select only the index bands (NDVI, NDWI, MNDWI, NDMI) from both collections
var selectedBands = ['NDVI', 'NDWI', 'MNDWI', 'NDMI'];
var filteredMergedIndices = mergedIndices.select(selectedBands);

// Invert NDVI values by multiplying by -1 to find min pixel values by sorting
var invertedNdwiCollection = filteredMergedIndices.map(function(image) {
  return image.addBands(image.select('NDWI').multiply(-1).rename('NDWI_inverted'));
});

// Find the image with the min inverted NDWI (which is the max pixel values using qualityMosaic)
var minNdwiImageInverted = invertedNdwiCollection.qualityMosaic('NDWI_inverted');

// Revert the NDVI to the correct (minimum) values by multiplying by -1 again
var minNdwiImage = minNdwiImageInverted.select('NDWI_inverted').multiply(-1).rename('NDWI');

// Print the metadata of the image with the minimum NDVI
print('Image with Minimum NDWI (per pixel):', minNdwiImage);
print('Image Metadata:', minNdwiImage.getInfo());

// Visualization parameters for NDVI
var ndwiVisParams = {min: -1, max: 1, palette: ['00FFFF', '0000FF']};

// Clip the image to the AOI (assuming AOI is defined in your script)
var clippedMinNdwiImage = minNdwiImage.clip(AOI);

// Display the clipped image with minimum NDVI on the map
Map.addLayer(clippedMinNdwiImage, ndwiVisParams, 'Clipped Min NDWI Image');

// Center the map on the AOI
Map.centerObject(AOI, 8);


/*
// Function to calculate yearly average of indices
function calculateYearlyAverage(year) {
  var filteredYear = mergedIndices.filter(ee.Filter.calendarRange(year, year, 'year'));
  
  var meanImage = filteredYear.mean(); // Get the mean of the bands
  
  // Initialize a dictionary to hold the results
  var result = {'year': year};
  
  // Check if each index exists in the meanImage before adding it to the result
  var bands = meanImage.bandNames();
  
  if (bands.contains('NDVI')) {
    result['NDVI'] = meanImage.select('NDVI').reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: AOI,
      scale: 60,
      bestEffort: true
    }).get('NDVI');
  }
  
  if (bands.contains('NDWI')) {
    result['NDWI'] = meanImage.select('NDWI').reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: AOI,
      scale: 60,
      bestEffort: true
    }).get('NDWI');
  }
  
  if (bands.contains('MNDWI')) {
    result['MNDWI'] = meanImage.select('MNDWI').reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: AOI,
      scale: 60,
      bestEffort: true
    }).get('MNDWI');
  }
  
  if (bands.contains('NDMI')) {
    result['NDMI'] = meanImage.select('NDMI').reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: AOI,
      scale: 60,
      bestEffort: true
    }).get('NDMI');
  }
  
  return ee.Feature(null, result);
}
*/


// Function to calculate yearly average of indices
function calculateYearlyAverage(year) {
  var filteredYear = mergedIndices.filter(ee.Filter.calendarRange(year, year, 'year'));
  
  // Check if there are any images for the given year (server-side check)
  var count = filteredYear.size();
  
  // Only proceed if there are images in the collection for the year
  return ee.Algorithms.If(
    count.gt(0),  // If the count of images is greater than 0
    filteredYear.mean().reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: AOI,
      scale: 60,
      bestEffort: true
    }).combine({'year': year}),  // Return combined results with year
    ee.Dictionary({'year': year})  // If no images, return year only
  );
}

// Create a list of years from 2000 to 2024
var years = ee.List.sequence(2000, 2024);

// Apply the yearly average calculation for each year using server-side map function
var yearlyIndices = ee.FeatureCollection(years.map(function(year) {
  var result = calculateYearlyAverage(year);
  return ee.Feature(null, result);
}));

// Print the yearly averages
print('Yearly Average NDVI, NDWI, MNDWI, and NDMI:', yearlyIndices);

// Export the results to Google Drive as a CSV
Export.table.toDrive({
  collection: yearlyIndices,
  description: 'Yearly_Average_Indices_LakeUrmia',
  fileFormat: 'CSV'
});

