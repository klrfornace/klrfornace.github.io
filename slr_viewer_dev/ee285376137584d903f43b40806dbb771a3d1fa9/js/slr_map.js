// Add patch to expand available map control positions
L.Map.include({
  _initControlPos: function () {
    var corners = this._controlCorners = {},
      l = 'leaflet-',
      container = this._controlContainer =
        L.DomUtil.create('div', l + 'control-container', this._container);

    function createCorner(vSide, hSide) {
      var className = l + vSide + ' ' + l + hSide;

      corners[vSide + hSide] = L.DomUtil.create('div', className, container);
    }

    createCorner('top', 'left');
    createCorner('top', 'right');
    createCorner('bottom', 'left');
    createCorner('bottom', 'right');

    createCorner('top', 'center');
    createCorner('middle', 'center');
    createCorner('middle', 'left');
    createCorner('middle', 'right');
    createCorner('bottom', 'center');
  }
});

// Set up map
const sliderStart = 0;

// Statewide zoom
// const zoomLevel = 8;
// const centerCoord = [20.602, -157.409];

// Oʻahu zoom
const zoomLevel = 11;
const centerCoord = [21.483, -157.980];

const map = L.map('map',{preferCanvas:true, minZoom: 7, maxZoom:19}).setView(centerCoord, zoomLevel);

// Restrict bounds to Hawaiʻi
const southWest = L.latLng( 15.2763, -166.7944 );
const northEast = L.latLng( 25.3142, -148.3484 );
const bounds = L.latLngBounds( southWest, northEast );
map.options.maxBounds = bounds;

// Create panes to ensure correct layer order
map.createPane('base'); // ensure basemaps are always the lowest layer
map.getPane('base').style.zIndex = 150;

map.createPane('mvt-line'); // for vector tiles that should be moved up
map.getPane('mvt-line').style.zIndex = 390; // right behind line layers at 400

map.createPane('underlay'); // for tile layers that need to above basemap but below all other layers
map.getPane('underlay').style.zIndex = 175;

map.createPane('admin-boundaries'); // for boundary shapes that should be in front of tiles/shapes but below markers
map.getPane('admin-boundaries').style.zIndex = 425;

mapboxLight.addTo(map); // initial basemap

//////// LAYER CONTROL AND LEGEND ////////

// Add styled layer control to map
// Based on Leaflet.StyledLayerControl: https://github.com/davicustodio/Leaflet.StyledLayerControl
layerControl = L.Control.styledLayerControl( basemaps, overlayMaps, {collapsed: false, position:'topright'});

layerControl.addTo( map );
layerControl.getContainer().id = 'styledLayerControl'; // set id for relocation

// Insert simple legend with active map layers into styled layer control which can be toggled on/off by user (initially off).

const legendDiv = document.querySelector('.legend-container'); //this div is created in styledLayerControl
const legendHeader = L.DomUtil.create('div','legend-header', legendDiv);
legendHeader.innerHTML = 'Sea level: <span id="legend-depth-label">Present level</span>';

// Set up entries for all layers/layer groups. All entries will initially be hidden.

// Exposure layers
// const slrxaEntry = L.DomUtil.create('div','legend-slrxa legend-entry legend-entry-hidden',legendDiv);
const passiveEntry = L.DomUtil.create('div','legend-passive legend-entry legend-entry-hidden',legendDiv);
passiveEntry.innerHTML = '<span class="legend-subheader">Passive Flooding</span><br>' + passive.options.legendEntry;
const waveEntry = L.DomUtil.create('div','legend-wave legend-entry legend-entry-hidden',legendDiv);
waveEntry.innerHTML = '<span class="legend-subheader">Annual High Wave-Driven Flooding</span><br>' + wave.options.legendEntry;

const compFloodEntry = L.DomUtil.create('div','legend-comp-flood legend-entry legend-entry-hidden',legendDiv);
compFloodEntry.innerHTML = '<span class="legend-subheader">Compound Flooding Scenario<br>(December 2021 Kona Storm)</span><br>' + compFlood.options.legendEntry;

// Impact layers
const roadEntry = L.DomUtil.create('div', 'legend-roads legend-entry legend-entry-hidden',legendDiv);
roadEntry.innerHTML = '<span class="legend-subheader">Flooded Roads</span><br>'+ roads.options.legendEntry;

const stormwaterEntry = L.DomUtil.create('div', 'legend-stormwater legend-entry legend-entry-hidden',legendDiv);
stormwaterEntry.innerHTML = stormwater.options.legendEntry;

// Other layers
for (let layer of [devplan, moku, ahupuaa, boards, dhhl, slrxa32]){
  const entry = L.DomUtil.create('div','legend-' + layer.options.legendKey + ' legend-entry legend-entry-hidden',legendDiv);
  entry.innerHTML = layer.options.legendEntry;
}

const femaEntry = L.DomUtil.create('div','legend-femaflood legend-entry legend-entry-hidden',legendDiv);

// const testEntry = L.DomUtil.create('div','legend-test legend-entry legend-entry-hidden',legendDiv);
// const soilEntry = L.DomUtil.create('div','legend-soils legend-entry legend-entry-hidden',legendDiv);
// const geologyEntry = L.DomUtil.create('div','legend-geology legend-entry legend-entry-hidden',legendDiv);

// Show/hide simple legend according to legend radio button state (created in styledLayerControl)
// const legendRadio = document.querySelector('.legend-radio-group');


// Add event listeners to manage exclusive layers and update legend as layers are added/removed.

// This function is necessary to avoid firing 2 overlayadd events when removing exclusive layers. 
// See https://gis.stackexchange.com/questions/382017/leaflet-mutually-exclusive-overlay-layers-overlayadd-event-firing-twice
function removeWithTimeout(layer) {
  setTimeout(function() {
    layerControl.unSelectLayer(layer);
  }, 10);
}

map.on('overlayadd', function addOverlay(e){
    const legendKey = (e.layer != undefined)? e.layer.options.legendKey: e.options.legendKey;
    // Update legend

    const entryDiv = document.querySelector('.legend-'+ legendKey);
    // Remove class to allow display
    entryDiv.classList.remove('legend-entry-hidden');
  
    // Remove any other layers in administrative boundary pane if another is added. (Other exclusive groups to be added)

    // Arrays of excluisve groups (e.g., layers that cannot be on map concurrently)
    const adminGroup = [devplan, moku, ahupuaa, boards, dhhl];
    const exposureGroup = [passive, wave, compFlood];

    for(let group of [adminGroup, exposureGroup]){
      if (group.includes(e.layer)){
        for(let layer of group){
            if (layer.options.legendKey != legendKey && map.hasLayer(layer)){
              removeWithTimeout(layer);
          }
        }
      }
    }
});

map.on('overlayremove', function(e){
  const legendKey = (e.layer != undefined)? e.layer.options.legendKey: e.options.legendKey;
  const entryDiv = document.querySelector('.legend-'+ legendKey);
  // Restore class to remove display
  entryDiv.classList.add('legend-entry-hidden');
})



 // Change layer styles based on light/dark (satellite) basemaps
map.on( 'baselayerchange',
  function() {
    if ( map.hasLayer( mapboxLight )) {
      boundary_style.color = '#6e6e6e';
      boundary_style2.color = '#6e6e6e'; // Thicker line style
      boundary_highlight_style.color = '#3c3c3c';

      ahupuaa.setStyle( boundary_style );
      devplan.setStyle( boundary_style );
      moku.setStyle( boundary_style );
      boards.setStyle( boundary_style );
      dhhl.setStyle(boundary_style2)

      // Also make sure legend styles are correct
      const entries = document.querySelectorAll('.legend-line');
      entries.forEach(entry => {
        entry.classList.remove('line-dark-basemap');
      })
    }
    else {
      boundary_style.color = '#FFFFFF';
      boundary_style2.color = '#FFFFFF';
      boundary_highlight_style.color = '#FFFFFF';

      ahupuaa.setStyle( boundary_style );
      devplan.setStyle( boundary_style );
      moku.setStyle( boundary_style );
      boards.setStyle( boundary_style );
      dhhl.setStyle(boundary_style2);

      const entries = document.querySelectorAll('.legend-line');
      entries.forEach(entry => {
        entry.classList.add('line-dark-basemap');
      })
    }
  }
);


// Change styles based on map zoom level

map.on('zoomend', function(){
  const currentZoom = map.getZoom();

  if (currentZoom < 13){
    stormwaterStyle.weight = 0.25;
    stormwaterStyle.radius = 2;
    stormwaterLayers.forEach((layer) => layer.setStyle(stormwaterStyle));
  }
  else if (currentZoom < 18){
    stormwaterStyle.weight = 0.5;
    stormwaterStyle.radius = 3;
    stormwaterLayers.forEach((layer) => layer.setStyle(stormwaterStyle));
  }
  else {
    stormwaterStyle.weight = 0.5;
    stormwaterStyle.radius = 3.5;
    stormwaterLayers.forEach((layer) => layer.setStyle(stormwaterStyle));
  }
})

// Close tooltips for admin boundary layers at high zooms 
// Also adjust cursor based on if clickable tile layers are present

map.on('zoomend', function() {
  const tooltips = document.querySelectorAll('.leaflet-tooltip');
  if (map.getZoom() < zoomThreshold) {
    tooltips.forEach((tooltip) => tooltip.style.display = "block");
    L.DomUtil.removeClass(map._container,'pointer-cursor');
  } else { 
    tooltips.forEach((tooltip) => tooltip.style.display = "none");
    queryableWMSLayers.forEach(layer => {
      if (map.hasLayer(layer)) {
        L.DomUtil.addClass(map._container,'pointer-cursor');
      }
    })
  }
})

//////// OTHER CONTROLS ////////

// Home zoom button
function returnHome(){
  map.setView(centerCoord,zoomLevel);
  this.blur(); // Remove focus after button is clicked (to prevent style from sticking)
}

const homeControl = L.control({position: 'topleft'});
homeControl.onAdd = function(){
  const btnContainer = L.DomUtil.create('div','leaflet-bar');
  const homeButton = L.DomUtil.create('a','leaflet-control-home', btnContainer);
  homeButton.role = "button";
  homeButton.href = '#';
  homeButton.title = 'Return to original view';
  homeButton.setAttribute('aria-label','Return to original view');
  homeButton.setAttribute('aria-disable',false);
  homeButton.innerHTML = '<span aria-hidden="true"></span></a>';
  homeButton.onclick = returnHome;

  return btnContainer
}
homeControl.addTo(map);

// Add easy print button to export map.
// leaflet-easyPrint: https://github.com/rowanwins/leaflet-easyPrint
// Bundle updated per this issue: https://github.com/rowanwins/leaflet-easyPrint/issues/109
L.easyPrint({
	title: 'Export this map',
	position: 'topleft',
  filename: 'slr_viewer_map',
  hideControlContainer: false,
  exportOnly: true,
  hideClasses: ['leaflet-control-zoom','leaflet-control-home','leaflet-control-easyPrint','ac-container','styledLayerControl-utilities'], 
  showClasses: ['legend-container'],
  sizeModes: ['A4Landscape']
	// sizeModes: ['Current','A4Portrait', 'A4Landscape']
}).addTo(map);

// Add Mapbox logo per Terms of Service
const logoControl = L.control({position: 'bottomleft'});
logoControl.onAdd = function() {
  const logoDiv = L.DomUtil.create('div','logo-control');
  logoDiv.innerHTML = '<img src="images/mapbox_logo.svg">';
  return logoDiv
}
logoControl.addTo(map);

// Set up address/TMK search bar with Mapbox geocoder and State of Hawaiʻi TMK database
// Leaflet-control-geocoder: https://github.com/perliedman/leaflet-control-geocoder

// Keep track of markers assigned to queried addresses so correct marker can be removed
var activeAddress = {};
// Keep track of layers assigned to queried TMKs so correct shape can be removed
var activeTMK = {};

const geocoderControl = new L.Control.Geocoder({ geocoder: null, position:'topleft',placeholder:'Search by address or TMK', collapsed: false, suggestMinLength: 7, defaultMarkGeocode: false })
  .on('startgeocode', function(e){
    inputStr = e.input.trim(); // Get input and remove any white space

    // If input is 9 digit number, do TMK search
    if (inputStr.match( /^\d{9}$/ )){
      queryTMK(inputStr);
      return;
    }
    
  })
  .on('markgeocode', function(e){
    const result = e.geocode;
    // Use timestamp to create unique ID for each address instead of fighting with strings
    const addressId = Math.floor(Date.now());
    map.fitBounds(result.bbox);
    const addressMarker = new L.Marker(result.center)
      .bindPopup((result.html || result.name).replace(', United States','') + '<br><br>' + '<a href="javascript:void(0);" onClick="removeAddress('+ addressId +')">Remove marker from map</a>')
      .addTo(map)
      .openPopup();
    addressMarker._icon.classList.add("huechange"); // change default marker color
    activeAddress[addressId] = addressMarker;
  })
  .on('finishgeocode', function(e){
    // Remove all tooltips connected to inputs
    Array.from(document.querySelectorAll('input')).forEach(node => {  
      if (node._tippy) node._tippy.destroy();
    });
    
    // Create Tippy tooltip if there are no address results (excluding 9-digit TMKs since these are searched separately).
    if ((!(inputStr.match( /^\d{9}$/ ))) && (e.results.length == 0)) {
      const geocoderControl = document.getElementById('geocoder-control');
      const tip = new tippy(geocoderControl, {
        content: "No results found. For TMK searches, please enter TMK as 9-digit number with no special characters.",
        theme: "tippy-error",
        placement: "bottom",
        trigger: "manual",
      });

      tip.show();

      // Add keydown listener in case user just uses backspace to reenter address
      geocoderControl.addEventListener('keydown',() => {
        tip.hide();
      })

    }
    
  });

// Set up geocoder restricted to bounding box around Hawaiʻi
const geocoder = L.Control.Geocoder.mapbox({apiKey: ak, geocodingQueryParams:{'bbox':'-162,18,-154,23'}});
geocoderControl.options.geocoder = geocoder;
geocoderControl.addTo(map);

// Set id to control position via css
const geocoderDiv = document.querySelector('.leaflet-control-geocoder');
geocoderDiv.setAttribute('id','geocoder-control');

// Add id to default geocoder error div to always hide display via css (using Tippy to create custom error tooltips instead)
const geocoderErrorDiv = document.querySelector('.leaflet-control-geocoder-form-no-error');
geocoderErrorDiv.setAttribute('id','geocoder-error-default');

function queryTMK(tmk){

  // Define the ArcGIS REST API URL; return result in GeoJSON format; include
  // parcel acres in addition to the geometry of the search result:

  var url = 'https://geodata.hawaii.gov/arcgis/rest/services/ParcelsZoning/MapServer/25/query?f=geojson&outFields=gisacres,tmk_txt&where=tmk%3D' + tmk;

  // Ensure same-domain request (not sure this is necessary, but seemed to
  // fix error that Brad Romine was getting):
  // Commenting this out for now - preventing queries when testing from local server - KF
  // url = '/cgi-bin/get_response.py?type=application/json&url=' + encodeURI( url );

  fetch(url)
    .then((response) => {
      if (!response.ok){
        throw new Error('Connection error');
      }
      return response.json();
    })
    .then((data) => {
      const features = data.features;

      if (features.length == 0){
        // Remove all tooltips connected to inputs
        Array.from(document.querySelectorAll('input')).forEach(node => {  
          if (node._tippy) node._tippy.destroy();
        });

        // Create new tooltip if there are no query results
        const geocoderControl = document.getElementById('geocoder-control');
        const tip = new tippy(geocoderControl, {
          content: 'No results found for this TMK. Please check key and try again.',
          theme: "tippy-error",
          placement: "bottom",
          trigger: "manual",
        });

        tip.show();

        // Add keydown listener in case user just uses backspace to reenter address
        geocoderControl.addEventListener('keydown',() => {
          tip.hide();
        })
        return;
      }

      //Set color based on light or dark basemap
      tmkColor = map.hasLayer(mapboxLight) ? "black":"#dbdbdb";

      const tmkPolygon = L.geoJSON(data, {
        style: {"fill": false, "color": tmkColor},
        onEachFeature: function(feature, layer){
          return layer.bindPopup('<strong>TMK ' + tmk + '</strong><br>Acres: '+ feature.properties.gisacres.toFixed(2) + '<br><br>'
          + '<a href="javascript:void(0);" onClick="removeTMK('+ tmk +')">Remove shape from map</a>');
        }
      }).addTo(map);

      map.fitBounds(tmkPolygon.getBounds());

      tmkPolygon.eachLayer(function(layer){
        layer.openPopup();
      });

      activeTMK[tmk] = tmkPolygon;
    })
    .catch((error) => {
      console.log(error);
      // Remove all tooltips connected to inputs
      Array.from(document.querySelectorAll('input')).forEach(node => {  
        if (node._tippy) node._tippy.destroy();
      });

      // Create new tooltip to show connection error
      const geocoderControl = document.getElementById('geocoder-control');
      const tip = new tippy(geocoderControl, {
        content: 'Connection error. Please try again later.',
        theme: "tippy-error",
        placement: "bottom",
        trigger: "manual",
      });

      tip.show();

      // Add keydown listener in case user just uses backspace to reenter address
      geocoderControl.addEventListener('keydown',() => {
        tip.hide();
      })
    });
}

function removeTMK(tmk){
  map.removeLayer(activeTMK[tmk]);
}

function removeAddress(address){
  map.removeLayer(activeAddress[address]);
}

// Set up loading icon control
const loadingControl = L.control({position: 'middlecenter'});
loadingControl.onAdd = function() {
  const loadingDiv = L.DomUtil.create('div','loading-control');
  loadingDiv.setAttribute('id','loading-control');
  loadingDiv.innerHTML = '<img src="images/loading_blue2.gif">';
  return loadingDiv
}

function showLoadingControl(){
  hideLoadingControl(); // Hide any existing control
  map.addControl(loadingControl);
}

function hideLoadingControl(){
  if (document.getElementById('loading-control')){
    map.removeControl(loadingControl);
  }
}

// Connect loading control to all layers. Note different event type for GeoJSON layers vs. other layers. 
ajaxSingleLayers.forEach(layer => {
  // GeoJSON AJAX layers start loading before being added to the map, so use custom loadStatus option to track data progress.
  layer.on('add', function(){
    if (layer.options.loadStatus != 'loaded'){
      showLoadingControl();
    }
  }); 
  layer.on('data:loaded', hideLoadingControl);
  layer.on('remove',hideLoadingControl); // in case impatient users unselect layer before data is loaded
});

wmsSingleLayers.forEach(layer => {
  layer.on('loading', showLoadingControl);
  layer.on('load', hideLoadingControl);
  layer.on('remove',hideLoadingControl);
});

layerGroups.forEach(grp => {
  let layers = grp.layers;
  layers.forEach(layer => {
    layer.on('loading', showLoadingControl);
    layer.on('load', hideLoadingControl);
    layer.on('remove',hideLoadingControl);
  })
})

// Error control

map.on('easyPrint-error', () => console.log('printing error'));

const errorControl = L.control({position: 'middlecenter'});
errorControl.onAdd = function() {
  const errorDiv = L.DomUtil.create('div','error-control');
  errorDiv.innerHTML = 'Printing error. Sorry!';
  const closeButton = L.DomUtil.create('a','close-btn',errorDiv);
  closeButton.innerHTML = '&#10006;';
  closeButton.setAttribute('role','button');
  closeButton.onclick = removeErrorControl;
  return errorDiv
}

function removeErrorControl(){
  map.removeControl(errorControl);
}
map.on('easyPrint-error', () => map.addControl(errorControl));


// Initialize map with passive flooding layers

layerControl.selectLayer(passive); 
const passiveLegendEntry = document.querySelector('.legend-' + passive.options.legendKey);
passiveLegendEntry.classList.remove('legend-entry-hidden');


// Configure info tooltips using Tippy library
// For some reason, this needs to be after the map is initialized with first set of layers. 
// StyledLayerControl is interfering somehow, but I can't figure out how. -KF
const infoTooltips = {
  '#scenario-select-info':'More info about sea level rise scenarios. <br><a href="#">Click here for full details.</a>',
  '#mhhw-info':'Mean Higher High Water (MHHW): The water level at the average highest tide of the day.',
  '#passive-flooding-info':'More info about passive flooding. <br><a href="#">Click here for full details.</a>',
};

Object.keys(infoTooltips).forEach(key => {
  tippy(key, {
    content: infoTooltips[key],
    trigger:'click',
    placement: 'right',
    theme: 'light-border',
    allowHTML: true,
    interactive: true,
    appendTo: () => document.body
  });
});

// Add tab button to open/close side panel

function openClosePanel(){
  const panel = document.querySelector('.side-panel-container');
  const tabContainer = document.querySelector('.side-panel-tab-container');

  // Open the side panel
  if (this.classList.contains('panel-closed')){
    panel.style.width = '225px';
    tabContainer.style.left = '225px';

    this.classList.remove('panel-closed');
    this.style.backgroundImage = "url(images/close2.svg)";

    this.setAttribute('aria-label', 'Close the sea level slider panel');

    // Move left side controls over
    const leftControls = document.querySelectorAll('.leaflet-left .leaflet-control');
    leftControls.forEach(control => control.classList.remove('side-panel-closed'));
  }
  // Close the side panel
  else{
    panel.style.width = 0;
    tabContainer.style.left = '0px';

    this.classList.add('panel-closed');
    console.log(activeDepth);
    const newURL = (activeDepth < 10)? 'images/slr0' + activeDepth + '_open.svg':'images/slr' + activeDepth + '_open.svg';
    this.style.backgroundImage = "url("+ newURL + ")";

    // Also update aria-label
    this.setAttribute('aria-label', 'Displayed sea level is ' + activeDepth + ' feet. Click to open sea level slider to adjust depth.');

    // Move left side controls over
    const leftControls = document.querySelectorAll('.leaflet-left .leaflet-control');
    leftControls.forEach(control => control.classList.add('side-panel-closed'));
  }
}

// function openPanel(){
//   const panel = document.querySelector('.side-panel-container');
//   panel.style.width == '0px'? panel.style.width = '225px': panel.style.width = 0;
//   const panelControl = document.querySelector('.panel-control');
//   panelControl.classList.add('side-panel-open');
// }

// Add functionality to close button
const closeButton = document.querySelector('.side-panel-tab');
closeButton.onclick = openClosePanel;

// const sidePanelControl = L.control({position:'topleft'})
// sidePanelControl.onAdd = function() {
//   const tab = L.DomUtil.create('div','leaflet-bar panel-control side-panel-open');
//   tab.id = 'slr-tab-container';
//   const tabButton =  L.DomUtil.create('a','slr-tab-button', tab);
//   tabButton.id = 'slr-tab-button';
//   tabButton.role = "button";
//   tabButton.href = '#';
//   tabButton.title = 'Open sea level slider';
//   tabButton.setAttribute('aria-label','Displayed sea level is ' + document.getElementById("depth-level-label").innerHTML + '. Click to open sea level slider to adjust depth.');
//   tabButton.setAttribute('aria-disable',false);
//   tabButton.innerHTML = '<span aria-hidden="true"></span></a>';
//   tabButton.onclick = openPanel;

//   tab.setAttribute('aria-haspopup', true);
//   if (!L.Browser.touch) {
//       L.DomEvent.disableClickPropagation(tab);
//       L.DomEvent.on(tab, 'wheel', L.DomEvent.stopPropagation);
//   } else {
//       L.DomEvent.on(tab, 'click', L.DomEvent.stopPropagation);
//   }
//   return tab
// }
// sidePanelControl.addTo(map);
