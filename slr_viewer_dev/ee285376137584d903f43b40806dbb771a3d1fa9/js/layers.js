//////// BASEMAPS ////////

const mapboxURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';
const mapboxOptions = (layerId) => ({
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> '
              +'<strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  id: layerId,
  maxZoom: 19,
  tileSize: 512,
  zoomOffset: -1,
  accessToken:ak,
  pane: 'base',
})

const mapboxLight = L.tileLayer(mapboxURL, mapboxOptions('mapbox/light-v10'));
const mapboxSatellite = L.tileLayer(mapboxURL, mapboxOptions('mapbox/satellite-v9'));
const mapboxSatelliteStreets = L.tileLayer(mapboxURL, mapboxOptions('mapbox/satellite-streets-v11'));

//////// OVERLAYS ////////

// Base URLs for CRC Geoserver
const crcgeoWMS = 'https://crcgeo.soest.hawaii.edu/geoserver/gwc/service/wms';
const crcgeoWFS = (layerName) => `https://crcgeo.soest.hawaii.edu/geoserver/CRC/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=${layerName}&outputFormat=application%2Fjson&srsName=EPSG:4326`;
// For Mapbox vector tiles
const crcgeoMVT = (layerName) => `https://crcgeo.soest.hawaii.edu/geoserver/gwc/service/tms/1.0.0/${layerName}@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf`

//////// EXPOSURE LAYERS ////////

const passiveWmsOptions = (ft, type) => (
  {
    tiled:true, 
    version:'1.1.1', 
    format:'image/png', 
    transparent: true,
    opacity: 0.67,
    // errorTileUrl: 'http://www.soest.hawaii.edu/crc/SLRviewer/tile_error.png',
    attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
    bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
    maxZoom: 19,
    queryable: true,
    queryProperty: 'GRAY_INDEX',
    queryDisplay: type === "SCI"? ((data) => 
                data == 11? ('Water depth at average highest tide of the day: <div class="popup-data"> 10+ ft</div>'):
                ('Water depth at average highest tide of the day: <div class="popup-data">' + (data-1) + '-' + data + ' ft</div>')):
                ((data) => 
                data == 11? ('Depth below sea level:<div class="popup-data"> 10+ ft</div>'): 
                ('Depth below sea level:<div class="popup-data">' + (data-1) + '-' + data + ' ft</div>')),
    nullValue: type === "SCI"? 127:15,
    layers: (ft < 10) ? `CRC:HI_State_80prob_0${ft}ft_${type}_v3` : `CRC:HI_State_80prob_${ft}ft_${type}_v3`, 
    name: (ft < 10) ? `Passive ${type} 0${ft}ft all-scenarios` : `Passive ${type} ${ft}ft all-scenarios`,
  }
) 

const passiveLayers = {
  'SCI': [],
  'GWI': []
}
for (let i = 0; i < 11; i++) {
  for (let layer in passiveLayers) {
    passiveLayers[layer][i] = L.tileLayer.betterWms(crcgeoWMS, passiveWmsOptions(i, layer));
  }
}

const waveWmsOptions = (ft) => (
  {
    tiled:true, 
    version:'1.1.1', 
    format:'image/png', 
    transparent: true,
    opacity: 0.67,
    // errorTileUrl: 'https://www.soest.hawaii.edu/crc/SLRviewer/tile_error.png',
    attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
    bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
    maxZoom: 19,
    queryable: true,
    queryProperty: 'GRAY_INDEX',
    nullValue: -999,
    layers: (ft < 10) ? `CRC:Waikiki_annual_wave_OsWkh1_0${ft}ft` : `CRC:Waikiki_annual_wave_OsWkh1_${ft}ft`, 
    name: (ft < 10) ? `Annual wave 0${ft}ft all-scenarios` : `Annual wave ${ft}ft all-scenarios`,
  }
) 

const waveLayers = [];

for (let i = 0; i < 11; i++) {
    waveLayers[i] = L.tileLayer.betterWms(crcgeoWMS, waveWmsOptions(i));
  }

  const compFloodWmsOptions = (ft) => (
    {
      tiled:true, 
      version:'1.1.1', 
      format:'image/png', 
      transparent: true,
      opacity: 0.67,
      errorTileUrl: 'https://www.soest.hawaii.edu/crc/SLRviewer/tile_error.png',
      attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
      bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
      maxZoom: 19,
      queryable: true,
      nullValue: -999,
      layers: (ft < 10) ? `CRC:compound_flooding_prelim_0${ft}ft` : `CRC:compound_flooding_prelim_${ft}ft`, 
      name: (ft < 10) ? `Kona storm scenario 0${ft}ft all-scenarios` : `Kona storm scenario ${ft}ft all-scenarios`,
    }
  ) 
  
  const compFloodLayers = [];
  
  for (let i = 0; i < 11; i++) {
    compFloodLayers[i] = L.tileLayer.wms(crcgeoWMS, compFloodWmsOptions(i));
    }

//////// IMPACT LAYERS ////////

// Flooded roads - loaded as vector tiles from Geoserver since WFS was too laggy for complicated shapes

const roadLayers = {
  '1': [],
  '2': []
}


function style1ft(properties, zoom) {
  const wt = (zoom < 13) ? 1:
              (zoom < 17) ? 1.5: 2;
  return {
      color:'#f45a9b',
      weight: wt,
  }
};

function style2ft(properties, zoom) {
  const wt = (zoom < 13) ? 1:
            (zoom < 15) ? 2:
            (zoom < 17) ? 3: 4;
  return {
      color:'#9f0c4a',
      weight: wt,
  }
};

for (let i = 0; i < 11; i++) {
  for (let layer in roadLayers) {
      const fullLayerName = (i < 10)? `CRC%3Ahi_state_80prob_0${i}ftslr_${layer}ft_strt_v3` :  `CRC%3Ahi_state_80prob_${i}ftslr_${layer}ft_strt_v3`;
      const layerName = (i < 10)? `hi_state_80prob_0${i}ftslr_${layer}ft_strt_v3` :  `hi_state_80prob_${i}ftslr_${layer}ft_strt_v3`;
      const roadURL = crcgeoMVT(fullLayerName);
      const styleFunction = (layer == '1')? style1ft: style2ft;

      const roadTileOptions = {
        vectorTileLayerStyles: {[layerName]: styleFunction},
        interactive: true,	// Make sure that this VectorGrid fires mouse/pointer events
        attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
        name: (i < 10) ? `Flooded roads 0${i}ft_${layer} all-scenarios` : `Flooded roads ${i}ft_${layer} all-scenarios`,
        pane: 'mvt-line'
      }
      roadLayers[layer][i] = L.vectorGrid.protobuf(roadURL, roadTileOptions)
        .on('click', function(e){ // Attach event listeners to open pop-ups for all features
          L.popup()
					.setContent(e.layer.properties.fullname)
					.setLatLng(e.latlng)
					.openOn(map);

          L.DomEvent.stop(e); // This stops pop-ups from lower layers (e.g. flood layers) opening at this point.
        })
  }
}

// Stormwater structures

const stormwaterStyle = {
  radius:2,
  fillColor: '#ec297b',
  color:'#fff',
  weight:0.25,
  opacity: 1,
  fillOpacity:1
};

const stormwaterLayers = [];

const stormwaterOptions = (ft) => (
  { pointToLayer: (feature, latlng) => (L.circleMarker(latlng, stormwaterStyle)),
    // onEachFeature: function ( feature, layer ) {
    //   var street_name = feature.properties.name;
    //   var tooltip = '<center><b>0.5 ft scenario';
    //   if ( street_name ) {
    //     tooltip += ':<br/>' + street_name;
    //   }
    //   tooltip += '</b></center>';
    //   layer.bindTooltip( tooltip, { sticky: true } );
    // },
    attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
    name: (ft < 10) ? `Flooded stormwater structures 0${ft}ft all-scenarios` : `Flooded stormwater structures ${ft}ft all-scenarios`,
  });

for (let i = 0; i < 11; i++) {
    const layerName = (i < 10)? `CRC%3Ahi_oahu_80prob_0${i}ftslr_strm_dr_v3` :  `CRC%3Ahi_oahu_80prob_${i}ftslr_strm_dr_v3`;
    const stormwaterWFS = crcgeoWFS(layerName);
    stormwaterLayers[i] = new L.GeoJSON.AJAX(stormwaterWFS, stormwaterOptions(i));
};

// Critical Facilities

const hospitals = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Ahospitals__and_clinics_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconUrl:"images/hospital_maroon.svg", iconSize:[16,16]})})),
  // attribution: 'Data &copy; <a href="https://honolulu-cchnl.opendata.arcgis.com/datasets/cchnl::hospitals-and-clinics/about" target="_blank">City & County of Honolulu GIS</a>',
  iconUrl: "images/hospital_maroon.svg",
  iconSizes:[[16,16],[18,18],[20,20]], // small, medium, large sizes set by zoomend listener
  displayName: 'Hospitals and Clinics',
  legendKey:'hospital',
  legendSymbol: '<img class="legend-sublayer legend-icon tight-layout" src="images/hospital_maroon.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon" src="images/hospital_maroon.svg"></img>Hospitals and Clinics</div>'
});

const fireStations = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Afire_stations_oahu_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconUrl:"images/fire_maroon.svg", iconSize:[16,16]})})),
  iconUrl: "images/fire_maroon.svg",
  iconSizes:[[16,16],[18,18],[20,20]],
  displayName: 'Fire Stations',
  legendKey: 'fire-station',
  legendSymbol: '<img class="legend-sublayer legend-icon tight-layout" src="images/fire_maroon.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon" src="images/fire_maroon.svg"></img>Fire Stations</div>'
});

const policeStations = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Apolice_stations_oahu_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconUrl:"images/police_maroon.svg", iconSize:[16,16]})})),
  iconUrl: "images/police_maroon.svg",
  iconSizes:[[16,16],[18,18],[20,20]],
  displayName: 'Police Stations',
  legendKey: 'police-station',
  legendSymbol: '<img class="legend-sublayer legend-icon tight-layout" src="images/police_maroon.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon" src="images/police_maroon.svg"></img>Police Stations</div>'
});

const schools = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Apublic_schools_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconUrl:"images/school_maroon.svg", iconSize:[16,16]})})),
  iconUrl:"images/school_maroon.svg",
  iconSizes:[[16,16],[18,18],[20,20]],
  displayName: 'Public Schools',
  legendKey: 'school',
  legendSymbol: '<img class="legend-sublayer legend-icon tight-layout" src="images/school_maroon.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon" src="images/school_maroon.svg"></img>Public Schools</div>'
});

// Wastewater infrastructure

const pumpStations = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Apump_stations_oahu_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconUrl:"images/pump_station.svg", iconSize:[16,16]})})),
  iconUrl:"images/pump_station.svg",
  iconSizes:[[16,16],[18,18],[20,20]],
  displayName: 'Pump Stations',
  legendKey:'pump-station',
  legendSymbol: '<img class="legend-sublayer legend-icon tight-layout" src="images/pump_station.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon" src="images/pump_station.svg"></img>Pump Stations</div>'
});

const treatmentPlants = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Asewer_-_treatment_plant_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconUrl:"images/wastewater.svg", iconSize:[16,16]})})),
  iconUrl:"images/wastewater.svg",
  iconSizes:[[16,16],[18,18],[20,20]],
  displayName: 'Treatment Plants',
  legendKey:'treatment-plant',
  legendSymbol: '<img class="legend-sublayer legend-icon tight-layout" src="images/wastewater.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon" src="images/wastewater.svg"></img>Treatment Plants</div>'
});

// WFS method was too laggy for the large number of features so loading cesspool points as vector tiles
const cesspoolURL = crcgeoMVT('CRC%3Aosds_dots_w_tracts_clean_atts_kp');

function cesspoolStyle(properties, zoom) {
  const iconSize = (zoom < 13) ? [6,6]:
            (zoom < 18) ? [9,9]: [12,12];
  return {
      icon: L.icon({iconSize: iconSize, iconUrl: "images/diamond.svg"})
  }
};

const cesspoolTileOptions = {
  vectorTileLayerStyles: {'osds_dots_w_tracts_clean_atts_kp': cesspoolStyle},
  interactive: false,	//set to false now since there are no pop-ups
  displayName: 'Cesspools',
  legendKey:'cesspool',
  legendSymbol: '<img class="legend-sublayer legend-icon small-shape tight-layout" src="images/diamond.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon small-shape" src="images/diamond.svg"></img>Cesspools</div>'
}

const cesspools = L.vectorGrid.protobuf(cesspoolURL, cesspoolTileOptions);

const sewerStyle = {
  color: '#c76113',
  weight: 1,
  opacity: 0.75
};

// This layer will also have to be converted to vector tiles if it is added to viewer
const sewerMains = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Aoahu_sewer_main_kp'), {
  style: sewerStyle,
  legendKey:'sewer-main',
  legendSymbol: '<svg class="legend-line sewer-line tight-layout" style="margin-top:0px" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="3.5"/></g></svg>',
  legendEntry: '<svg class="legend-line sewer-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="3.5"/></g></svg>Sewer Mains'
});

// Electrical infrastructure

const substations = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Asubstations_hi_hifld_kp'), {
  pointToLayer: (feature, latlng) => (L.marker(latlng, {icon: L.icon({iconSize:[12,14], iconUrl: "images/hexagon.svg"})})),
  iconUrl:"images/hexagon.svg",
  iconSizes:[[12,14],[15,17.4],[18,20.9]],
  displayName: 'Substations',
  legendKey:'substation',
  legendSymbol: '<img class="legend-sublayer legend-icon hexagon tight-layout" src="images/hexagon.svg"></img>',
  legendEntry: '<div class="legend-sublayer"><img class="legend-sublayer legend-icon hexagon" src="images/hexagon.svg"></img>Substations</div>'
});

const transmissionStyle = {
  color: '#f2b701',
  weight: 2,
  opacity: 1
};

const transmission = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Atransmission_lines_hi_hifld_kp'), {
  style: transmissionStyle,
  displayName: 'Transmission Lines',
  legendKey:'transmission',
  legendSymbol: '<svg class="legend-line electric-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="7"/></g></svg>',
  legendEntry: '<svg class="legend-line electric-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="7"/></g></svg>Transmission Lines'
});


//////////  OTHER OVERLAYS  //////////

// Geology Layer - not currently connected!

const geology = L.tileLayer.wms(
    'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/hi_usgs_all_geology/wms',
    {
      layers: 'hi_usgs_all_geology',
      styles: 'hi_usgs_all_geology2',
      version: '1.1.1',
      format: 'image/png',
      transparent: true,
      opacity: 1.00,
      // errorTileUrl: '/images/map_tile_error.png',
      attribution: 'Data &copy; <a href="http://pubs.usgs.gov/of/2007/1089/" target="_blank" title="United States Geological Survey (USGS)">USGS</a>',
      bounds: L.latLngBounds( L.latLng( 18.9106432386012, -160.247059539488 ), L.latLng( 22.2353669223379, -154.806693600261 ) ),
      maxZoom: 20,
      // My custom attributes:
      name: 'Geology',
      pane: 'underlay',
      legendKey: 'geology',
      queryable: true 
    }
  );

// Soils survey - not currently connected!

const soils = L.tileLayer.wms(
    'https://geodata.hawaii.gov/arcgis/services/Terrestrial/MapServer/WMSServer',
    {
      layers: '4',
      styles: 'soils',
      sld: 'http://www.pacioos.hawaii.edu/ssi/sld/soils_survey.xml?v=2',
      version: '1.1.1',
      format: 'image/png',
      transparent: true,
      opacity: 1.00,
      // errorTileUrl: '/images/map_tile_error.png',
      attribution: 'Data &copy; <a href="http://pubs.usgs.gov/of/2007/1089/" target="_blank" title="United States Geological Survey (USGS)">USGS</a>',
      bounds: L.latLngBounds( L.latLng( 18.9106432386012, -160.247059539488 ), L.latLng( 22.2353669223379, -154.806693600261 ) ),
      maxZoom: 20,
      // My custom attributes:
      name: 'Soils',
      pane: 'underlay',
      legendKey: 'soils',
      queryable: true 
    }
  );
 
// State Land Use Districts (Agricultural, Conservation, Rural, Urban) - not currently connected!
// Was layer '15' then it switched to '16' (2019-09) then it switched to
// '17' (2021-12); does not match REST which shows '20':

const land_use_districts = L.tileLayer.wms(
    'https://geodata.hawaii.gov/arcgis/services/ParcelsZoning/MapServer/WMSServer',
    {
      layers: '22', // was '17' (2022-08-30)
      styles: 'lud',
      sld: 'http://www.pacioos.hawaii.edu/ssi/sld/land_use_districts.xml',
      version: '1.1.1',
      format: 'image/png',
      transparent: true,
      opacity: 1.00,
      // errorTileUrl: '/images/map_tile_error.png',
      attribution: 'Data &copy; <a href="http://planning.hawaii.gov/gis/download-gis-data-expanded/" target="_blank" title="State of Hawaii Office of Planning Statewide GIS Program">State of Hawai&#699;i</a>',
      bounds: L.latLngBounds( L.latLng( 18.893356, -160.250511 ), L.latLng( 22.235643, -154.732045 ) ),
      maxZoom: 20,
      // My custom attributes:
      name: 'Land Use Districts',
      pane: 'underlay',
      legendKey: 'landuse',
      queryable: false 
    }
  );
  
// FEMA Flood Hazard Zones

//  NOTE: SLD file only seems to work if address of xml file is provided as http instead of https. Not sure why.
const femaFlood = L.tileLayer.wms(
  'https://geodata.hawaii.gov/arcgis/services/Hazards/MapServer/WMSServer',
  {
    layers: '2',
    styles: 'dfirm',
    sld: 'http://www.soest.hawaii.edu/crc/SLRviewer/slds/fema_flood_test.xml',
    // sld: 'http://www.pacioos.hawaii.edu/ssi/sld/flood_hazard_zones.xml',
    version: '1.1.1',
    format: 'image/png',
    transparent: true,
    opacity: 0.67,
    // errorTileUrl: '/images/map_tile_error.png',
    attribution: 'Data &copy; <a href="http://planning.hawaii.gov/gis/download-gis-data/" target="_blank" title="U.S. Federal Emergency Management Agency">FEMA</a>',
    //bounds: L.latLngBounds( L.latLng( 20.5001, -159.79 ), L.latLng( 22.2353, -155.979 ) ),
    bounds: L.latLngBounds( L.latLng( 18.891141, -160.250512 ), L.latLng( 22.235775, -154.730304 ) ),
    maxZoom: 19,
    // My custom attributes:
    queryable: true 
  }
);

// Esri WMS doesn't allow hatching so use leaflet-polygon.fillPattern plugin to apply hatching to specific zones queried as GeoJSONs
const leveeURL = 'https://geodata.hawaii.gov/arcgis/rest/services/Hazards/MapServer/6/query?where=zone_subty%20LIKE%20%27%LEVEE%%27&outFields=*&outSR=4326&f=geojson'
const floodwayURL = 'https://geodata.hawaii.gov/arcgis/rest/services/Hazards/MapServer/6/query?where=zone_subty%20LIKE%20%27FLOODWAY%27&outFields=*&outSR=4326&f=geojson'

const leveeHatch = new L.GeoJSON.AJAX(leveeURL, 
  {style:{fill:false, weight: 0.000001, opacity: 0.4}, 
  imgId:'hatch-gray',
});

const floodwayHatch = new L.GeoJSON.AJAX(floodwayURL, 
  {style:{fill:false, weight: 0.000001, opacity: 0.67},
  imgId:'hatch-red',
});

// Group the main layer and hatch pieces together.
const femaZones = L.layerGroup([femaFlood, leveeHatch, floodwayHatch],{
  pane: 'underlay',
  legendKey:'fema',
  legendEntry:'<div class="long-legend-wrapper"><div class="legend-box" style="background:#5cffff; opacity:0.67;"></div><div style="font-size:12px">1% Annual Chance Flood Hazard</div></div>'+
              '<img class="legend-box" src="images/hatch_red_zoom.png" style="opacity:0.67;"><div style="font-size:12px">Floodway</div>'+
              '<div class="long-legend-wrapper"><div class="legend-box" style="background:#ff9648; opacity:0.67;"></div><div style="font-size:12px">0.2% Annual Chance Flood Hazard</div></div>'+
              '<div class="long-legend-wrapper"><div><img class="legend-box" src="images/hatch_darkgray_zoom.png" style="opacity:0.67;"></div><div style="font-size:12px">Area with Reduced Risk Due to Levee</div></div>',
  displayName: 'FEMA Flood Hazard Areas',
  legendSubheader: 'FEMA Flood Hazard Areas'
})

// SLR-XA 3.2 ft (2017)
const slrxa32 = L.tileLayer.wms(
  'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
  {
    layers: 'hi_tt_all_slrxa_2100',
    tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
    version: '1.1.1',
    format: 'image/png',
    transparent: true,
    opacity: 0.5,
    // errorTileUrl: '/images/map_tile_error.png',
    attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
    bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
    maxZoom: 19,
    // My custom attributes:
    displayName: 'Sea Level Rise Exposure Area (2017)',
    name: 'SLR-XA 2100',
    legendKey: 'slrxa32',
    legendEntry: '<div class="legend-box" style="background:#0d5de4; opacity:0.5;"></div> SLR-XA 3.2 ft',
    queryable: false
  }
);

// General boundary styles and functions for admin boundary layers

const boundary_style = {
    weight: 1.5,
    color: '#6e6e6e',
    opacity: 1.0,
    fill: 0.000001,
    fillOpacity: 0
  };

const boundary_highlight_style = {
    weight: 2,
    color: '#3c3c3c',
    opacity: 1.0,
    fill: 0.000001,
    fillOpacity: 0.0
  };


function highlightBoundaries ( e ) {
    const layer = e.target;
    layer.setStyle( boundary_highlight_style );
    if ( !L.Browser.ie && !L.Browser.opera ) layer.bringToFront();
  }

// For converting names returned in all caps
function toTitleCase(str) {
    return str.replace(
      // /\w\S*/g, // white space only
      /\b[\w']+\b/g, // all word boundaries (including hyphens)
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

// Development / Community Plan Areas (Districts):

const devplanURL = 'https://geodata.hawaii.gov/arcgis/rest/services/ParcelsZoning/MapServer/24/query?geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&inSR=4326&outFields=*&returnGeometry=true&outSR=4326&f=geojson';

const devplan = new L.GeoJSON.AJAX(devplanURL, 
  {style: boundary_style,
      onEachFeature: function ( feature, layer ) {
        layer.bindTooltip( '<strong>' + toTitleCase(feature.properties.district) + '</strong>', { direction: 'left', sticky: true, permanent: false } );
        layer.on(
          {
            mouseover: highlightBoundaries,
            mouseout: function(){devplan.resetStyle(this)},
            click: function(e){
              const tooltip = layer.getTooltip();
              map.closeTooltip(tooltip)
            }

            // Zoom to clicked polygon if no other clickable overlays are
            // expecting a pop-up window:

            // click: function () {
            //   if ( !hasClickableLayer() ) {
            //     fitBounds( layer.getBounds().getSouth(), layer.getBounds().getWest(), layer.getBounds().getNorth(), layer.getBounds().getEast() );
            //   }
            // }
          }
        );
      },
      name: 'Community Plan Areas',
      pane: 'admin-boundaries',
      displayName: 'Community Plan Area Boundaries',
      legendKey: 'devplan',
      legendEntry: '<svg class="legend-line admin-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>Community Plan Area Boundaries',
      legendSymbol: '<svg class="legend-line admin-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>',
      loadStatus: 'loading'
    });

// Ahupuaʻa boundaries:

const ahupuaaURL = 'https://geodata.hawaii.gov/arcgis/rest/services/HistoricCultural/MapServer/1/query?geometry=-166.7944,15.2763,-148.3484,25.3142&      geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=ahupuaa&returnGeometry=true&returnTrueCurves=false&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson';

const ahupuaa = new L.GeoJSON.AJAX(ahupuaaURL,
  {
    style: boundary_style,
    onEachFeature: function ( feature, layer ) {
      var ahupuaa_name = feature.properties.ahupuaa;
      ahupuaa_name = ahupuaa_name.replace( /�/g, '&#299;' );
      layer.bindTooltip( '<strong>' + ahupuaa_name + '</strong>',{ direction: 'left', sticky: true });
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){ahupuaa.resetStyle(this)},
          click: function(e){
            const tooltip = layer.getTooltip();
            map.closeTooltip(tooltip)
          }
          // Zoom to clicked polygon if no other clickable overlays are
          // expecting a pop-up window:

          // click: function () {
          //   if ( !hasClickableLayer() ) {
          //     fitBounds( layer.getBounds().getSouth(), layer.getBounds().getWest(), layer.getBounds().getNorth(), layer.getBounds().getEast() );
          //   }
          // }
        }
      );
    },
    // My custom attributes:
    name: 'Ahupuaa',
    pane: 'admin-boundaries',
    displayName: 'Ahupua<span class="okina">&#699;</>a Boundaries',
    legendKey: 'ahupuaa',
    legendEntry: '<svg class="legend-line admin-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>Ahupua<span class="okina">&#699;</>a Boundaries',
    legendSymbol: '<svg class="legend-line admin-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>',
    loadStatus: 'loading'
  });

// Moku boundaries:

const mokuURL = 'https://geodata.hawaii.gov/arcgis/rest/services/HistoricCultural/MapServer/3/query?geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=moku&returnGeometry=true&returnTrueCurves=false&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson';

const moku = new L.GeoJSON.AJAX(mokuURL,
  {
    style: boundary_style,
    onEachFeature: function ( feature, layer ) {

      var moku_name = feature.properties.moku;

      // Lanai has no moku, so fall back to Mokupuni (island):

      if ( !moku_name ) {
        moku_name = feature.properties.mokupuni;
      }

      layer.bindTooltip( '<strong>' + moku_name + '</strong>',{ direction: 'left', sticky: true });
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){moku.resetStyle(this)},
          click: function(e){
            const tooltip = layer.getTooltip();
            map.closeTooltip(tooltip)
          }

          // Zoom to clicked polygon if no other clickable overlays are
          // expecting a pop-up window:

          // click: function () {
          //   if ( !hasClickableLayer() ) {
          //     fitBounds( layer.getBounds().getSouth(), layer.getBounds().getWest(), layer.getBounds().getNorth(), layer.getBounds().getEast() );
          //   }
          // }
        }
      );
    },
    // My custom attributes:
    name: 'Moku',
    pane: 'admin-boundaries',
    displayName: 'Moku Boundaries',
    legendKey: 'moku',
    legendEntry: '<svg class="legend-line admin-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>Moku Boundaries',
    legendSymbol: '<svg class="legend-line admin-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>',
    loadStatus: 'loading'
  });

// Oʻahu Neighborhood Boards

const boardURL = 'https://services.arcgis.com/tNJpAOha4mODLkXz/ArcGIS/rest/services/AdministrativePolitical/FeatureServer/5/query?geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outFields=BOARD_NUM&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson'

// Board names not included in feature service for some reason  ¯\_(ツ)_/¯
const boardNames = {1:'Hawaii Kai', 2:'Kuliouou-Kalani Iki', 3:'Waialae-Kahala',4:'Kaimuki',5:'Diamond Head/Kapahulu/St. Louis Heights',6:'Palolo',7:'Manoa',8:'McCully-Moiliili',9:'Waikiki',10:'Makiki/Lower Punchbowl/Tantalus',11:'Ala Moana/Kakaako',12:'Nuuanu/Punchbowl',13:'Downtown-Chinatown',14:'Liliha/Puunui/Alewa/Kamehameha Heights',15:	'Kalihi-Palama',
16:'Kalihi Valley',17:'Moanalua (Board not formed)',18:'Aliamanu/Salt Lake/Foster Village/Airport',
20:'Aiea',21:'Pearl City',22:'Waipahu',23:'Ewa',24:'Waianae Coast',25:'Mililani/Waipio/Melemanu',26:'Wahiawa-Whitmore Village',27:'North Shore',28: 'Koolauloa',29:'Kahalu&#299;u',30: 'Kaneohe',31:'Kailua',32:'Waimanalo',33:'Mokapu (Board not formed)',34:'Makakilo/Kapolei/Honokai Hale',35:'Mililani Mauka/Launani Valley',36:'Nanakuli-Maili'};

const boards = new L.GeoJSON.AJAX(boardURL,
  {style: boundary_style,
    onEachFeature: function ( feature, layer ) {
      const boardNumber = feature.properties.BOARD_NUM;
      layer.bindTooltip( '<strong>' + boardNames[boardNumber]+ ' ('+ boardNumber + ')</strong>',{ direction: 'left', sticky: true });
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){boards.resetStyle(this)},
          click: function(e){
            const tooltip = layer.getTooltip();
            map.closeTooltip(tooltip)
          }
        }
      );
    },
    name: 'Neighborhood Boards',
    pane: 'admin-boundaries',
    displayName: 'Neighborhood Board Boundaries',
    legendKey: 'boards',
    legendEntry: '<svg class="legend-line admin-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>Neighborhood Board Boundaries',
    legendSymbol: '<svg class="legend-line admin-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>',
    loadStatus: 'loading'
  });

// DHHL lands

const dhhlURL = 'https://geodata.hawaii.gov/arcgis/rest/services/Census/MapServer/30/query?geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=name20,pop20&returnGeometry=true&returnTrueCurves=false&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson';

const boundary_style2 = {
  weight: 1.5,
  color: '#6e6e6e',
  opacity: 1.0,
  fill: 0.000001,
  fillOpacity: 0.0
};

const dhhl = new L.GeoJSON.AJAX(dhhlURL,
  {style: boundary_style2,
    onEachFeature: function ( feature, layer ) {
      layer.bindTooltip( '<strong>' + feature.properties.name20 + '</strong>',{ direction: 'left', sticky: true });
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){dhhl.resetStyle(this)},
          click: function(e){
            const tooltip = layer.getTooltip();
            map.closeTooltip(tooltip)
          }

          // Zoom to clicked polygon if no other clickable overlays are
          // expecting a pop-up window:

          // click: function () {
          //   if ( !hasClickableLayer() ) {
          //     fitBounds( layer.getBounds().getSouth(), layer.getBounds().getWest(), layer.getBounds().getNorth(), layer.getBounds().getEast() );
          //   }
          // }
        }
      );
    },
    // My custom attributes:
    name: 'DHHL Lands',
    pane: 'admin-boundaries',
    displayName: 'Hawaiian Home Land Boundaries',
    legendKey: 'dhhl',
    legendEntry: '<svg class="legend-line admin-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>Hawaiian Home Land Boundaries',
    legendSymbol: '<svg class="legend-line admin-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4.74"/></g></svg>',
    loadStatus: 'loading'
  }
);

// TMK boundaries (Oʻahu parcels: layer id 7, statewide: layer id 1)

const tmk_bounds = L.tileLayer.betterWms(
  'https://geodata.hawaii.gov/arcgis/services/ParcelsZoning/MapServer/WMSServer',
  {
    async: true,
    layers: '7',
    version: '1.1.1',
    format: 'image/png',
    transparent: true,
    opacity: 0.75,
    // errorTileUrl: '/images/map_tile_error.png',
    attribution: 'Data &copy; <a href="https://geoportal.hawaii.gov/" target="_blank">Hawai<span class="okina">&#699;</span>i Statewide GIS Program</a>',
    bounds: L.latLngBounds( L.latLng( 18.9106432386012, -160.247059539488 ), L.latLng( 22.2353669223379, -154.806693600261 ) ),
    maxZoom: 20,
    // My custom attributes:
    displayName: 'TMK Parcels',
    name: 'TMK Parcels',
    queryable: true,
    queryProperty: 'tmk9num',
    queryDisplay: (data) => 'TMK: ' + data,
    legendKey:'tmk',
  }
);

// Add legend options separately since they were interfering with ArcGIS WMS call
tmk_bounds.options.legendEntry ='<svg class="legend-line tmk-line" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="3"/></g></svg>TMK Parcels';
tmk_bounds.options.legendSymbol ='<svg class="legend-line tmk-line tight-layout" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="3"/></g></svg>';


// Oʻahu shoreline setback (2023)

const setbackStyle = {
  color: '#e55913',
  weight: 2,
  opacity: 1,
  dashArray: '3,5',
};

const oahuSetback = new L.GeoJSON.AJAX(crcgeoWFS('CRC%3Aoahu_70yr_rate_plus_60ft'), {
  style: setbackStyle,
  displayName: 'O<span class="okina">&#699;</span>ahu Shoreline Setback',
  legendKey:'setback',
  legendSymbol: '<svg class="legend-line setback-line tight-layout" viewBox="0 0 31.74 5.74"><g><path d="m31.74,5.74h-4.74V0h4.74v5.74Zm-8.74,0h-5V0h5v5.74Zm-9,0h-5V0h5v5.74Zm-9,0H0V0h5v5.74Z"/></g></svg>',
  legendEntry: '<svg class="legend-line setback-line" viewBox="0 0 31.74 5.74"><g><path d="m31.74,5.74h-4.74V0h4.74v5.74Zm-8.74,0h-5V0h5v5.74Zm-9,0h-5V0h5v5.74Zm-9,0H0V0h5v5.74Z"/></g></svg>O<span class="okina">&#699;</span>ahu Shoreline Setback'
});

//////////  LAYER GROUPS  //////////

// Initialize layer groups that change with depth

const passive = L.layerGroup([passiveLayers['SCI'][0], passiveLayers['GWI'][0]],{
  legendKey:'passive',
  legendEntry: 'Marine flooding: water depth<br><img src="images/blue_colorbar.svg" style="width:220px; height: 17px;margin-bottom:5px;"><br>Low-lying areas: depth below sea level<br><img src="images/green_colorbar.svg" style="width:220px; height:17px">',
  legendSubheader: 'Passive Flooding',
  displayName: 'Passive Flooding',
  infoButtonId: 'passive-flooding-info'
})
const wave = L.layerGroup(waveLayers[0],{
  legendKey:'wave',
  legendEntry: 'Water depth<br><img src="images/purple_colorbar.svg" style="width:220px; height:17px;">',
  legendSubheader: 'Annual High Wave-Driven Flooding',
  displayName: 'Annual High Wave-Driven Flooding'
});
const roads = L.layerGroup(roadLayers[0],{
  legendKey:'roads',
  legendEntry: '<svg class="legend-line road-line" style="fill: #f45a9b" viewBox="0 0 31.74 5.74"><g><rect x=".5" y=".5" width="30.74" height="4"/></g></svg>&nbsp;Flood depth > 1 ft<br><svg class="legend-line road-line" style="fill: #9f0c4a" viewBox="0 0 31.74 5.74"><g><rect x=".5" y="-2.5" width="30.74" height="8"/></g></svg>&nbsp;Flood depth > 2 ft',
  legendSubheader: 'Flooded Roads',
  displayName: 'Flooded Roads'
});
const stormwater = L.layerGroup(stormwaterLayers[0],{
  legendKey:'stormwater',
  legendEntry:'<div class="long-legend-wrapper"><div><svg class="stormwater-icon" viewBox="0 0 33.19 33.19"><g><g><circle style="fill: #ec297b; stroke: #fff; stroke-width:1px" cx="16.59" cy="12.59" r="7.07"/></svg></div><div>Stormwater structures below sea level</div>',
  displayName: 'Stormwater Drainage Failure',
});
const compFlood = L.layerGroup(compFloodLayers[0],{
  legendKey:'comp-flood',
  legendEntry:'Floodwater Depth<br><img src="images/gist_ncar_colorbar.svg" style="width:225px; height: 17px;margin-bottom:5px;">',
  displayName: 'Compound Flooding Scenario &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(December 2021 Kona storm)',
  legendSubheader: 'Compound Flooding Scenario (December 2021 Kona storm)'
});

// Assign all possible layers to groups
const layerGroups = [
  {
    "group": passive,
    "layers": Object.values(passiveLayers).flat(),    
  },
  {
    "group": wave,
    "layers": waveLayers,    
  },
  {
    "group": roads,
    "layers": Object.values(roadLayers).flat(),    
  },
  {
    "group": stormwater,
    "layers": stormwaterLayers,    
  },
  {
    "group":compFlood,
    "layers":compFloodLayers,
  }
];

// Create layer groups with sublayers that can be toggled on/off by user in legend
const criticalFacilities = L.layerGroup([hospitals, fireStations, policeStations,schools], 
  options = {
    legendKey:'critical-facilities',
    attribution: 'Data &copy; <a href="https://honolulu-cchnl.opendata.arcgis.com/" target="_blank">City & County of Honolulu GIS</a>',
    displayName: 'Critical Facilities',
    legendSubheader: 'Critical Facilities',
});

const wastewater = L.layerGroup([treatmentPlants, pumpStations, cesspools], 
  options = {
    legendKey:'wastewater',
    attribution: 'Data &copy; <a href="https://honolulu-cchnl.opendata.arcgis.com/" target="_blank">City & County of Honolulu GIS</a>, '
    + '<a href="https://seagrant.soest.hawaii.edu/cesspools-tool/" target="_blank">Hawai<span class="okina">&#699;</span>i Cesspool Prioritization Tool</a>',
    displayName: 'Wastewater Infrastructure',
    legendSubheader: 'Wastewater Infrastructure',
});

const electrical = L.layerGroup([substations, transmission], 
  options = {
    legendKey:'electrical',
    attribution: 'Data &copy; <a href="https://hifld-geoplatform.opendata.arcgis.com/" target="_blank" title="Homeland Infrastructure Foundation-Level Data">HIFLD Open Data</a>',
    displayName: 'Electrical Infrastructure',
    legendSubheader: 'Electrical Infrastructure',
});


///////// LAYER CONTROL OBJECTS //////////

// Create basemap layer object for layer control
const basemaps = [
  {
    groupName: '<h3><img src="images/basemap.svg" class="label-icon">BASEMAPS</h3>',
    expanded: false, 
    layers: {
      'Grayscale': mapboxLight,
      // 'Streets': mapboxStreets,
      'Satellite': mapboxSatelliteStreets,
      'Satellite: no labels': mapboxSatellite,
    }
  }
];

// Create overlay layer object for layer control
// For all layers that change with depth, use L.LayerGroup initialized with any layer instead of individual layer. This allows for switching of layers 
// within the group as depth changes while keeping connection between layerGroup/_leaflet_id and checkbox input intact. Note this seems to cause assigned
// z indexes (from styledLayerControl) to go haywire, so it's safest to use map panes if layer order is critical. 
// For groups of sublayers added to map together but with individual sublayer controls, enter layer as object like:
// layerGroupName: {'layer': layerGroup, 'sublayers': {sublayerName1: sublayer1, sublayerName2: sublayer2}}
// (...And yes this could be constructed more efficiently)

// Functions to simplify formatting
const infoButton = (buttonId) => buttonId != undefined? '<button class="info-button" type="button" id="' + buttonId + '" aria-label="more info"></button>':'';
const labelFormat = (layer, inline) => inline? 
'<div class="legend-panel-inline">'+ layer.options.legendSymbol + '</div><span class="layer-label">'+layer.options.displayName +'</span>'+ infoButton(layer.options.infoButtonId):
'<span class="layer-label">'+ layer.options.displayName + '</span>'+ infoButton(layer.options.infoButtonId) + '<div class="legend-panel">'+ layer.options.legendEntry + '</div>';

const overlayMaps = [
  { groupName: '<h3><img src="images/wave.svg" class="label-icon">EXPOSURE</h3>', 
    expanded: true,
     layers: {
      [labelFormat(passive)]:passive, 
      }
  },
  { groupName: '<h3><img src="images/flood_outline.svg" class="label-icon">IMPACTS</h3>',
    expanded: true,
    layers: {
      [labelFormat(roads)]:roads,
      [labelFormat(stormwater)]:stormwater,
      'Critical Facilities':{'layer':criticalFacilities,
        'sublayers':{
              [labelFormat(hospitals, true)]:hospitals, 
              [labelFormat(fireStations,true)]: fireStations, 
              [labelFormat(policeStations,true)]: policeStations, 
              [labelFormat(schools,true)]: schools, 
        }},
        'Wastewater Infrastructure':{'layer':wastewater,
        'sublayers':{
              [labelFormat(treatmentPlants, true)]:treatmentPlants, 
              [labelFormat(pumpStations,true)]: pumpStations, 
              [labelFormat(cesspools, true)]: cesspools, 
        }},
        'Electrical Infrastructure':{'layer':electrical,
        'sublayers':{
              [labelFormat(substations,true)]:substations, 
              [labelFormat(transmission,true)]: transmission, 
        }},
    },
  },
  { groupName: '<h3><img src="images/other.svg" class="label-icon">OTHER OVERLAYS</h3>',
    expanded: true,
    layers: {
      [labelFormat(devplan, true)]: devplan,
      [labelFormat(moku, true)]: moku,
      [labelFormat(ahupuaa, true)]: ahupuaa,
      [labelFormat(boards,true)]: boards,
      [labelFormat(dhhl, true)]: dhhl,
      [labelFormat(oahuSetback, true)]: oahuSetback,
      [labelFormat(slrxa32)]: slrxa32,
      [labelFormat(femaZones)]: femaZones,
      [labelFormat(tmk_bounds, true)]: tmk_bounds
    }
  }
];


// Array of queryable WMS tile layers/layer groups
const queryableWMSLayers = [passive, wave, roads];

// Arrays of all single layers (GeoJSON AJAX or WMS) for later use with loading icon
const ajaxSingleLayers = [devplan, moku, ahupuaa, boards, dhhl, oahuSetback];
const wmsSingleLayers = [slrxa32, tmk_bounds, femaFlood];

// Add event listener to GeoJSON AJAX layers to catch data:loaded event.
//(Data starts loading before layer is added to map so this can happen before layer is added.)
ajaxSingleLayers.forEach(layer => layer.on('data:loaded', () => layer.options.loadStatus = 'loaded'));