//////// BASEMAPS ////////
const mapboxURL = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
const mapboxOptions = (layerId) => ({
  attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> '
              +'<strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
  id: layerId,
  maxZoom: 20,
  tileSize: 512,
  zoomOffset: -1,
  accessToken:ak,
  pane: 'base',
})

const mapboxLight = L.tileLayer(mapboxURL, mapboxOptions('mapbox/light-v10'));
const mapboxSatellite = L.tileLayer(mapboxURL, mapboxOptions('mapbox/satellite-v9'));
const mapboxSatelliteStreets = L.tileLayer(mapboxURL, mapboxOptions('mapbox/satellite-streets-v11'));

// const mapboxStreets = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',{
//   attribution:  '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
//   id: 'mapbox/streets-v11',
//   maxZoom: 20,
//   tileSize: 512,
//   zoomOffset: -1,
//   accessToken:ak
// });


// var Google_Grayscale_Simple = L.gridLayer.googleMutant(
//   {
//     type: 'roadmap',
//     maxZoom: 20,
//     styles: [{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"landscape","elementType":"labels.text","stylers":[{"lightness":-65},{"weight":3}]},{"featureType":"landscape","elementType":"labels.text.stroke","stylers":[{"lightness":100}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":25},{"visibility":"off"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"off"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#ffff00"},{"lightness":25},{"saturation":-97}]}],
//     basemap: true,
//     basemapName: 'Google_Grayscale_Simple'
//   }
// );
// Google_Grayscale_Simple.addTo(map);

// var Google_Satellite = L.gridLayer.googleMutant( { type: 'satellite', maxZoom: 20, basemap: true, basemapName: 'Google_Satellite' } );

// Esri basemaps

// map.createPane('base');
// map.getPane('base').style.zIndex = 0;
// // var tiles = L.esri.Vector.vectorBasemapLayer("ArcGIS:Imagery", {apikey: ak, pane:'base'}).addTo(map);
// // var tiles = L.esri.Vector.vectorBasemapLayer("ArcGIS:LightGray:Base", {apikey: ak, pane:'base'}).addTo(map);
// var tiles = L.esri.Vector.vectorBasemapLayer("OSM:LightGray:Base", {apikey: ak, pane:'base'}).addTo(map);

// map.createPane('labels');
// map.getPane('labels').style.zIndex = 650;
// map.getPane('labels').style.pointerEvents = 'none';

// var mapLabels = L.esri.Vector.vectorBasemapLayer("ArcGIS:Imagery:Labels", {apikey: ak, pane: 'labels'}).addTo(map);
// var mapLabels = L.esri.Vector.vectorBasemapLayer("OSM:LightGray:Labels", {apikey: ak, pane: 'labels'}).addTo(map);


// const ESRI_WorldGrayCanvas = L.tileLayer(
//     'http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
//     {
//       attribution: 'Map &copy; ESRI',
//       // 'Map &copy; ESRI, DeLorme, NAVTEQ',
//       minZoom: 0,
//       maxZoom: 19,
//       basemap: true,
//       basemapName: 'ESRI_WorldGrayCanvas'
//     }
//   );

//////// OVERLAYS ////////

//////// EXPOSURE LAYERS ////////

const crcgeoURL = 'https://crcgeo.soest.hawaii.edu/geoserver/gwc/service/wms';
// const defaultWMSoptions = {
//   tiled:true, 
//   version:'1.1.1', 
//   format:'image/png', 
//   transparent: true,
//   opacity: 0.67,
//   // errorTileUrl: '/images/map_tile_error.png',
//   attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
//   bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//   maxZoom: 19,
//   queryable: false,
// };


const wmsOptions = (ft, type) => {
  return {
    tiled:true, 
    version:'1.1.1', 
    format:'image/png', 
    transparent: true,
    opacity: 0.67,
  // errorTileUrl: '/images/map_tile_error.png',
    attribution: 'Data &copy; <a href="https://www.soest.hawaii.edu/crc/" target="_blank" title="Climate Resilience Collaborative at University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST)">UH/SOEST/CRC</a>',
    bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
    maxZoom: 19,
    queryable: false,
    layers: (ft < 10) ? `CRC:HI_State_80prob_0${ft}ft_${type}_v2` : `CRC:HI_State_80prob_${ft}ft_${type}_v2`, 
    name: (ft < 10) ? `Passive ${type} 0${ft}ft` : `Passive ${type} ${ft}ft`,
  }
} 

const passiveLayers = {
  'SCI': [],
  'GWI': []
}
for (let i = 0; i < 11; i++) {
  for (let layer in passiveLayers) {
    passiveLayers[layer][i] = L.tileLayer.wms(crcgeoURL, wmsOptions(i, layer));
  }
}


// const passiveSCI_0 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_00ft_SCI_v2', name: 'Passive SCI 00ft'})
// );
// const passiveSCI_1 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_01ft_SCI_v2', name: 'Passive SCI 1ft'})
// );
// const passiveSCI_2 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_02ft_SCI_v2', name: 'Passive SCI 2ft'})
// );
// const passiveSCI_3 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_03ft_SCI_v2', name: 'Passive SCI 3ft'})
// );
// const passiveSCI_4 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_04ft_SCI_v2', name: 'Passive SCI 4ft'})
// );
// const passiveSCI_5 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_05ft_SCI_v2', name: 'Passive SCI 5ft'})
// );
// const passiveSCI_6 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_06ft_SCI_v2', name: 'Passive SCI 6ft'})
// );
// const passiveSCI_7 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_07ft_SCI_v2', name: 'Passive SCI 7ft'})
// );
// const passiveSCI_8 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_08ft_SCI_v2', name: 'Passive SCI 8ft'})
// );
// const passiveSCI_9 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_09ft_SCI_v2', name: 'Passive SCI 9ft'})
// );
// const passiveSCI_10 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_10ft_SCI_v2', name: 'Passive SCI 10ft'})
// );

// const passiveGWI_0 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_00ft_GWI_v2', name: 'Passive GWI 00ft'})
// );
// const passiveGWI_1 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_01ft_GWI_v2', name: 'Passive GWI 1ft'})
// );
// const passiveGWI_2 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_02ft_GWI_v2', name: 'Passive GWI 2ft'})
// );
// const passiveGWI_3 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_03ft_GWI_v2', name: 'Passive GWI 3ft'})
// );
// const passiveGWI_4 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_04ft_GWI_v2', name: 'Passive GWI 4ft'})
// );
// const passiveGWI_5 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_05ft_GWI_v2', name: 'Passive GWI 5ft'})
// );
// const passiveGWI_6 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_06ft_GWI_v2', name: 'Passive GWI 6ft'})
// );
// const passiveGWI_7 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_07ft_GWI_v2', name: 'Passive GWI 7ft'})
// );
// const passiveGWI_8 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_08ft_GWI_v2', name: 'Passive GWI 8ft'})
// );
// const passiveGWI_9 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_09ft_GWI_v2', name: 'Passive GWI 9ft'})
// );
// const passiveGWI_10 = L.tileLayer.wms(crcgeoURL,
//   Object.assign(defaultWMSoptions,{layers: 'CRC:HI_State_80prob_10ft_GWI_v2', name: 'Passive GWI 10ft'})
// );


//////////  OTHER OVERLAYS  //////////

// Geology Layer: 

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

// Soils survey:

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
 
// State Land Use Districts (Agricultural, Conservation, Rural, Urban):
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
  
// Development / Community Plan Areas (Districts):

// General boundary styles and functions
const boundary_style = {
    weight: 1,
    color: '#6e6e6e',
    opacity: 1.0,
    fill: 0.000001,
    fillOpacity: 0.0
  };

const boundary_highlight_style = {
    weight: 2,
    color: '#3c3c3c',
    opacity: 1.0,
    fill: 0.000001,
    fillOpacity: 0.0
  };

function highlightBoundaries ( e ) {
    let layer = e.target;
    layer.setStyle( boundary_highlight_style );
    if ( !L.Browser.ie && !L.Browser.opera ) layer.bringToFront();
  }
  

const devplanURL = 'https://geodata.hawaii.gov/arcgis/rest/services/ParcelsZoning/MapServer/24/query?where=&text=&objectIds=&time=&geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&f=geojson';

const devplan = new L.GeoJSON.AJAX(
  devplanURL, 
    {
      style: boundary_style,
      onEachFeature: function ( feature, layer ) {
        layer.bindPopup( '<strong>' + feature.properties.district + '</strong>', { direction: 'left', sticky: true } );
        layer.on(
          {
            mouseover: highlightBoundaries,
            mouseout: function(){devplan.resetStyle(this)},
            click: function(){map.fitBounds( layer.getBounds())}

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
      legendKey: 'devplan',
      exclude: [ 'Ahupuaa', 'Moku' ]
    }
  );

// Ahupuaʻa boundaries:

const ahupuaaURL = 'https://geodata.hawaii.gov/arcgis/rest/services/HistoricCultural/MapServer/1/query?geometry=-166.7944,15.2763,-148.3484,25.3142&      geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=ahupuaa&returnGeometry=true&returnTrueCurves=false&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson';

const ahupuaa = new L.GeoJSON.AJAX(
  ahupuaaURL,
  {
    style: boundary_style,
    onEachFeature: function ( feature, layer ) {
      var ahupuaa_name = feature.properties.ahupuaa;
      ahupuaa_name = ahupuaa_name.replace( /�/g, '&#299;' );
      layer.bindPopup( '<strong>' + ahupuaa_name + '</strong>');
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){ahupuaa.resetStyle(this)},
          click: function(){map.fitBounds( layer.getBounds())}
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
    legendKey: 'ahupuaa',
    exclude: [ 'Community Plan Areas', 'Moku' ]
  }
);

// Moku boundaries:

const mokuURL = 'https://geodata.hawaii.gov/arcgis/rest/services/HistoricCultural/MapServer/3/query?geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=moku&returnGeometry=true&returnTrueCurves=false&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson';

const moku = new L.GeoJSON.AJAX(
  mokuURL,
  {
    style: boundary_style,
    onEachFeature: function ( feature, layer ) {

      var moku_name = feature.properties.moku;

      // Lanai has no moku, so fall back to Mokupuni (island):

      if ( !moku_name ) {
        moku_name = feature.properties.mokupuni;
      }

      layer.bindPopup( '<b>' + moku_name + '</b>');
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){moku.resetStyle(this)},
          click: function(){map.fitBounds( layer.getBounds())}

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
    legendKey: 'moku',
    exclude: [ 'Ahupuaa', 'Community Plan Areas' ]
  }
);

// Oʻahu Neighborhood Boards

const boardURL = 'https://services.arcgis.com/tNJpAOha4mODLkXz/ArcGIS/rest/services/AdministrativePolitical/FeatureServer/5/query?geometry=-166.7944,15.2763,-148.3484,25.3142&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outFields=BOARD_NUM&returnGeometry=true&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&f=geojson'

// Board names not included in feature service for some reason  ¯\_(ツ)_/¯
const boardNames = {1:'Hawaii Kai', 2:'Kuliouou-Kalani Iki', 3:'Waialae-Kahala',4:'Kaimuki',5:'Diamond Head/Kapahulu/St. Louis Heights',6:'Palolo',7:'Manoa',8:'McCully-Moiliili',9:'Waikiki',10:'Makiki/Lower Punchbowl/Tantalus',11:'Ala Moana/Kakaako',12:'Nuuanu/Punchbowl',13:'Downtown-Chinatown',14:'Liliha/Puunui/Alewa/Kamehameha Heights',15:	'Kalihi-Palama',
16:'Kalihi Valley',17:'Moanalua (Board not formed)',18:'Aliamanu/Salt Lake/Foster Village/Airport',
20:'Aiea',21:'Pearl City',22:'Waipahu',23:'Ewa',24:'Waianae Coast',25:'Mililani/Waipio/Melemanu',26:'Wahiawa-Whitmore Village',27:'North Shore',28: 'Koolauloa',29:'Kahalu&#299;u',30: 'Kaneohe',31:'Kailua',32:'Waimanalo',33:'Mokapu (Board not formed)',34:'Makakilo/Kapolei/Honokai Hale',35:'Mililani Mauka/Launani Valley',36:'Nanakuli-Maili'};

const boards = new L.GeoJSON.AJAX(
  boardURL,
  {
    style: boundary_style,
    onEachFeature: function ( feature, layer ) {
      const boardNumber = feature.properties.BOARD_NUM;
      layer.bindPopup( '<strong>' + boardNames[boardNumber]+ ' ('+ boardNumber + ')</strong>');
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){boards.resetStyle(this)},
          click: function(){map.fitBounds( layer.getBounds())}
        }
      );
    },
    pane: 'admin-boundaries',
    legendKey: 'boards',
    exclude: ['Moku','Ahupuaa','Community Plan Areas','DHHL Lands']
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

const dhhl = new L.GeoJSON.AJAX(
  dhhlURL,
  {
    style: boundary_style2,
    onEachFeature: function ( feature, layer ) {
      layer.bindPopup( '<strong>' + feature.properties.name20 + '</strong><br>Population (2020): ' + feature.properties.pop20.toLocaleString("en-US"));
      layer.on(
        {
          mouseover: highlightBoundaries,
          mouseout: function(){dhhl.resetStyle(this)},
          click: function(){map.fitBounds( layer.getBounds())}

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
    legendKey: 'dhhl',
  }
);


// FEMA Flood Hazard Zones: 

const femaFlood = L.tileLayer.wms(
  'https://geodata.hawaii.gov/arcgis/services/Hazards/MapServer/WMSServer',
  {
    layers: '2',
    styles: 'dfirm',
    // sld: 'http://www.pacioos.hawaii.edu/ssi/sld/flood_hazard_zones.xml',
    // sld: '/slds/fema_flood.xml',
    version: '1.1.1',
    //brought up darker color shades on my computer strangely...
    //format: 'image/png',
    format: 'image/gif',
    transparent: true,
    opacity: 1.00,
    // errorTileUrl: '/images/map_tile_error.png',
    attribution: 'Data &copy; <a href="http://planning.hawaii.gov/gis/download-gis-data/" target="_blank" title="U.S. Federal Emergency Management Agency">FEMA</a>',
    //bounds: L.latLngBounds( L.latLng( 20.5001, -159.79 ), L.latLng( 22.2353, -155.979 ) ),
    bounds: L.latLngBounds( L.latLng( 18.891141, -160.250512 ), L.latLng( 22.235775, -154.730304 ) ),
    maxZoom: 20,
    // My custom attributes:
    name: 'Flood Hazard Zones',
    pane: 'underlay',
    legendKey: 'femaflood',
    queryable: true 
  }
);

//////////  LAYER GROUPS  //////////

// Initialize layer groups
// const slrxa = L.layerGroup([slrxa_2030],{legendKey:'slrxa'});
const passive = L.layerGroup([passiveLayers['SCI'][0], passiveLayers['GWI'][0]],{legendKey:'passive'})
// const waveinun = L.layerGroup([waveinun_2030],{legendKey:'waveinun'});

// Assign all possible layers to groups
const layerGroups = [
  {
    "group": passive,
    "layers": Object.values(passiveLayers).flat(),    
  }];


// {
//     "group": slrxa,
//     "layers":[slrxa_2030, slrxa_2050, slrxa_2075, slrxa_2100],
// },
// {
//   "group": waveinun,
//   "layers":[waveinun_2030, waveinun_2050, waveinun_2075, waveinun_2100],
// }]

// Tags in layer names to get each layer by depth. (These are used by slider to move layers in and out of layer groups.)
// const layerTags = ['2030','2050','2075','2100'];
const layerTags = ['00ft','1ft','2ft','3ft','4ft','5ft','6ft','7ft','8ft','9ft','10ft'];

// Arrays of all single layers (GeoJSON AJAX or WMS) for later use
const ajaxSingleLayers = [devplan, moku, ahupuaa, boards, dhhl,];
const wmsSingleLayers = [femaFlood]
const unconnectedLayers = [land_use_districts, geology, soils];

///////// LAYER CONTROL OBJECTS //////////

// Create basemap layer object for layer control
const basemaps = [
  {
    groupName: 'BASEMAPS',
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
// z indexes (from styledLayerControl) to go haywire, so it's safest to use panes if layer order is critical. 
const overlayMaps = [
  {
    groupName: 'EXPOSURE', 
    expanded: true,
     layers: {'<span class="layer-label">Passive Flooding</span>':passive,
      }
  },
  { groupName: 'IMPACTS',
    expanded: false,
    layers: {'<span class="layer-label">example</span>': femaFlood}},
  { groupName: 'OTHER OVERLAYS',
    expanded: false,
    layers: {'<span class="layer-label">Community Plan Areas</span>': devplan,
              '<span class="layer-label">Moku Boundaries</span>': moku,
              '<span class="layer-label">Ahupua&#699;a Boundaries</span>': ahupuaa,
              '<span class="layer-label">Neighborhood Board Boundaries</span>': boards,
              '<span class="layer-label">Hawaiian Home Lands (DHHL Lands)</span>': dhhl,
              }}
];
// '<span class="layer-label">Sea Level Rise Exposure Area<br>(SLR-XA)</span>': slrxa,
// '<span class="layer-label">Wave Inundation</span><details id="wave-options"><summary>More options</summary>test</details>': waveinun,






// old layers

// const slrxa_2030 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_tt_all_slrxa_2030',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SLR-XA 2030',
//     queryable: false,
//   }
// );

// const slrxa_2050 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_tt_all_slrxa_2050',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SLR-XA 2050',
//     queryable: false
//   }
// );

// const slrxa_2075 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_tt_all_slrxa_2075',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SLR-XA 2075',
//     queryable: false
//   }
// );

// const slrxa_2100 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_tt_all_slrxa_2100',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 0.5,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SLR-XA 2100',
//     queryable: false
//   }
// );

// const soest_slr_2030 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_slr_flood_2030',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.00,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SOEST SLR Inundation 2030',
//     queryable: false
//   }
// );

// const soest_slr_2050 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_slr_flood_2050',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.00,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>', 
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SOEST SLR Inundation 2050',
//     queryable: false
//   }
// );

// const soest_slr_2075 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_slr_flood_2075',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.00,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SOEST SLR Inundation 2075',
//     queryable: false
//   }
// );

// const soest_slr_2100 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_slr_flood_2100',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.0,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 18.860, -159.820 ), L.latLng( 22.260, -154.750 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'SOEST SLR Inundation 2100',
//     queryable: false
//   }
// );

// const waveinun_2030 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_wave_flood_2030',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.00,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 20.6103, -159.8023 ), L.latLng( 22.2382, -156.3537 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'Wave Inundation 2030',
//     queryable: true
//   }
// );

// const waveinun_2050 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_wave_flood_2050',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.00,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',      
//     bounds: L.latLngBounds( L.latLng( 20.6103, -159.8023 ), L.latLng( 22.2382, -156.3537 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'Wave Inundation 2050',
//     queryable: true
//   }
// );

// const waveinun_2075 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_wave_flood_2075',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.00,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>', 
//     bounds: L.latLngBounds( L.latLng( 20.6103, -159.8023 ), L.latLng( 22.2382, -156.3537 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'Wave Inundation 2075',
//     queryable: true
//   }
// );

// const waveinun_2100 = L.tileLayer.wms(
//   'http://geo.pacioos.hawaii.edu/geoserver/PACIOOS/gwc/service/wms',
//   {
//     layers: 'hi_hcgg_all_wave_flood_2100',
//     tiled: true, // pulls from GWC if available; otherwise, stores to GWC...
//     version: '1.1.1',
//     format: 'image/png',
//     transparent: true,
//     opacity: 1.0,
//     // errorTileUrl: '/images/map_tile_error.png',
//     attribution: 'Data &copy; <a href="http://www.soest.hawaii.edu/coasts/" target="_blank" title="University of Hawaii (UH) School of Ocean and Earth Science and Technology (SOEST) Coastal Geology Group (CGG)">UH/SOEST/CGG</a>',
//     bounds: L.latLngBounds( L.latLng( 20.6103, -159.8023 ), L.latLng( 22.2382, -156.3537 ) ),
//     maxZoom: 20,
//     // My custom attributes:
//     name: 'Wave Inundation 2100',
//     queryable: true
//   }
// );
