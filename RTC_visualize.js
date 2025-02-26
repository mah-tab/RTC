// MAHTAB ARJOMANDI
// RTC remote sensing project
// Lake Urmia water-land-vegetation segmentation and spectral analysis (2000-2024)

// **Define AOI**
var AOI = ee.Geometry.Polygon(
  [[[44.9000133801619, 37.10895953230172],
    [45.93278215176619, 37.10895953230172],
    [45.93278215176619, 38.329904687931574],
    [44.9000133801619, 38.329904687931574],
    [44.9000133801619, 37.10895953230172]]],  
  null,  
  false  
);

Map.centerObject(AOI, 8);
Map.addLayer(AOI, {color: 'red'}, 'AOI Polygon');

// **Load Landsat 5 & 8 images (July & August)**
var landsat5 = ee.ImageCollection('LANDSAT/LT05/C02/T1_TOA')
                .filterBounds(AOI)
                .filterDate('2000-01-01', '2012-12-31')
                .filter(ee.Filter.calendarRange(7, 8, 'month'))
                .filter(ee.Filter.lt('CLOUD_COVER', 10))
                .map(function(image) { return image.clip(AOI); });

var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
                .filterBounds(AOI)
                .filterDate('2013-01-01', '2024-08-31')
                .filter(ee.Filter.calendarRange(7, 8, 'month'))
                .filter(ee.Filter.lt('CLOUD_COVER', 10))
                .map(function(image) { return image.clip(AOI); });

// **Calculate NDVI, NDWI, MNDWI**
function calculateIndices(image) {
  var ndvi = image.normalizedDifference(['B4', 'B3']).rename('NDVI');
  var ndwi = image.normalizedDifference(['B2', 'B4']).rename('NDWI');
  var mndwi = image.normalizedDifference(['B2', 'B5']).rename('MNDWI');
  
  if (image.get('SPACECRAFT_ID') === 'LANDSAT_8') {
    ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
    ndwi = image.normalizedDifference(['B3', 'B5']).rename('NDWI');
    mndwi = image.normalizedDifference(['B3', 'B6']).rename('MNDWI');
  }
  return image.addBands([ndvi, ndwi, mndwi]);
}

// **Apply index calculations**
var indices5 = landsat5.map(calculateIndices);
var indices8 = landsat8.map(calculateIndices);
var mergedIndices = indices8.merge(indices5);

// **Segment Water and Vegetation**
function segmentWaterVegetation(image) {
  var waterMask = image.select('NDWI').gt(0);
  var vegetationMask = image.select('NDVI').gt(0.2).and(waterMask.not());

  var waterNDWI = image.select('NDWI').updateMask(waterMask).rename('Water_NDWI');
  var waterMNDWI = image.select('MNDWI').updateMask(waterMask).rename('Water_MNDWI');
  var landNDVI = image.select('NDVI').updateMask(vegetationMask).rename('Vegetation_NDVI');

  return image.addBands([waterNDWI, waterMNDWI, landNDVI]);
}

// **Apply segmentation**
var segmentedIndices = mergedIndices.map(segmentWaterVegetation);

// **Compute Lake Area Using Water Pixels**
function computeLakeArea(image) {
  var waterMask = image.select('Water_NDWI').gt(0);
  var pixelCount = waterMask.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: AOI,
    scale: 30,
    maxPixels: 1e9
  }).get('Water_NDWI');

  var lakeAreaKm2 = ee.Algorithms.If(
    pixelCount, 
    ee.Number(pixelCount).multiply(900).divide(1e6), 
    0
  );

  return image.addBands(ee.Image.constant(lakeAreaKm2).toFloat().rename('Lake_Area'));
}

// **Apply lake area computation**
var indexedLakeAreas = segmentedIndices.map(computeLakeArea);

// **Find Min/Max NDVI and NDWI Images**
function computeMean(image, band) {
  return image.set(band + '_Mean', image.select(band).reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: AOI,
    scale: 30,
    maxPixels: 1e9
  }).get(band));
}

var imagesWithMeanNDVI = indexedLakeAreas.map(function(image) { return computeMean(image, 'NDVI'); });
var imagesWithMeanNDWI = indexedLakeAreas.map(function(image) { return computeMean(image, 'NDWI'); });

var minNDVIImage = imagesWithMeanNDVI.sort('NDVI_Mean', true).first();
var maxNDVIImage = imagesWithMeanNDVI.sort('NDVI_Mean', false).first();
var minNDWIImage = imagesWithMeanNDWI.sort('NDWI_Mean', true).first();
var maxNDWIImage = imagesWithMeanNDWI.sort('NDWI_Mean', false).first();

// **Print Image Names**
print('Image with Min NDVI:', minNDVIImage.get('system:index'));
print('Image with Max NDVI:', maxNDVIImage.get('system:index'));
print('Image with Min NDWI:', minNDWIImage.get('system:index'));
print('Image with Max NDWI:', maxNDWIImage.get('system:index'));

// **Mosaic and Composite Images to Ensure Full AOI Coverage**
function mosaicImage(image) {
  return indexedLakeAreas.filter(ee.Filter.equals('system:index', image.get('system:index'))).mosaic().clip(AOI);
}

var minNDVI_Mosaic = mosaicImage(minNDVIImage);
var maxNDVI_Mosaic = mosaicImage(maxNDVIImage);
var minNDWI_Mosaic = mosaicImage(minNDWIImage);
var maxNDWI_Mosaic = mosaicImage(maxNDWIImage);

// **Visualization Parameters**
var ndviVis = {min: -0.2, max: 1, palette: ['blue', 'white', 'green']};
var ndwiVis = {min: -1, max: 1, palette: ['brown', 'white', 'blue']};

// **Display Images on AOI**
Map.addLayer(minNDVI_Mosaic.select('NDVI'), ndviVis, 'Min NDVI Image');
Map.addLayer(maxNDVI_Mosaic.select('NDVI'), ndviVis, 'Max NDVI Image');
Map.addLayer(minNDWI_Mosaic.select('NDWI'), ndwiVis, 'Min NDWI Image');
Map.addLayer(maxNDWI_Mosaic.select('NDWI'), ndwiVis, 'Max NDWI Image');

// **Compute Yearly Means**
function computeYearlyMean(year) {
  var yearCollection = indexedLakeAreas.filter(ee.Filter.calendarRange(year, year, 'year'));
  var meanImage = yearCollection.mean();

  var meanDict = meanImage.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: AOI,
    scale: 30,
    bestEffort: true
  });

  return ee.Feature(null, {
    'year': year,
    'Mean_Lake_Area': ee.Algorithms.If(meanDict.contains('Lake_Area'), meanDict.get('Lake_Area'), 0),
    'Mean_Water_NDWI': ee.Algorithms.If(meanDict.contains('Water_NDWI'), meanDict.get('Water_NDWI'), null),
    'Mean_Water_MNDWI': ee.Algorithms.If(meanDict.contains('Water_MNDWI'), meanDict.get('Water_MNDWI'), null),
    'Mean_Vegetation_NDVI': ee.Algorithms.If(meanDict.contains('Vegetation_NDVI'), meanDict.get('Vegetation_NDVI'), null)
  });
}

// **Compute yearly statistics (2000-2024)**
var years = ee.List.sequence(2000, 2024);
var yearlyData = ee.FeatureCollection(years.map(computeYearlyMean));
print('Yearly Water & Vegetation Spectral Data:', yearlyData);

// **Export results**
Export.table.toDrive({
  collection: yearlyData,
  description: 'Lake_Urmia_Yearly_Data',
  fileFormat: 'CSV'
});
