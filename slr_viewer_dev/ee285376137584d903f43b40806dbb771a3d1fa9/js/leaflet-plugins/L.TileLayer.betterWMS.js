// Source: https://gist.github.com/rclark/6908938
// Modified to use fetch instead of using Jquery ajax -KF

L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({
  onAdd: function (map) {
    // Triggered when the layer is added to a map.
    //   Register a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onAdd.call(this, map);
    map.on('click', this.getFeatureInfo, this);
    // L.DomUtil.addClass(map._container,'pointer-cursor');
  },
  
  onRemove: function (map) {
    // Triggered when the layer is removed from a map.
    //   Unregister a click listener, then do all the upstream WMS things
    L.TileLayer.WMS.prototype.onRemove.call(this, map);
    map.off('click', this.getFeatureInfo, this);
    // L.DomUtil.removeClass(map._container,'pointer-cursor');
  },
  
  getFeatureInfo: function (evt) {
    // Only make the request if map zoom is at minimum zoom level. This was an attempt to manage multiple clickable layers at once but I abandoned it- KF
    // const popupMinZoom = this.wmsParams.popupMinZoom? this.wmsParams.popupMinZoom: 0;
    
    const fields = this.wmsParams.queryFields;

    // Make an AJAX request to the server and hope for the best
    var url = this.getFeatureInfoUrl(evt.latlng),
        showResults = L.Util.bind(this.showGetFeatureInfo, this);
      
      // For Geoserver urls, remove GeoWebCache part of url
      url = url.replace('gwc/service/', '' )

      const isJsonRequest = url.includes('json');

      if (isJsonRequest){
        fetch(url)
        .then((response) => {
            if (!response.ok){
              throw new Error('Connection error');
            }
            return response.json(); 
          })
          .then((data) => {
            const err = (data.features.length > 0) ? null : data;
            // for single field queries
            if (fields.length == 1){
              if (data.features[0].properties[fields[0]] != this.wmsParams.nullValue){
                showResults(err, evt.latlng, data.features[0].properties[fields[0]]);
              }
            }
            else{
              if (data.features[0].properties[fields[0]] != this.wmsParams.nullValue){
                let results = [];
                for (let i=0; i < fields.length; i++){
                  results.push(data.features[0].properties[fields[i]])
                }
                showResults(err, evt.latlng, results);
              }
            }

          })
          .catch((error) => {showResults(error)});
      }
      // xml requests
      else{
        fetch(url)
        .then((response) => {
          if (!response.ok){
            throw new Error('Connection error');
          }
          return response.text(); // https://stackoverflow.com/questions/37693982/how-to-fetch-xml-with-fetch-api
        })
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((data) => {
          const err = (data.getElementsByTagName('FIELDS')) ? null : data;
          // for single field queries
          if (fields.length == 1){
            if (data.getElementsByTagName('FIELDS')[0].getAttribute(fields[0]) != this.wmsParams.nullValue){
              showResults(err, evt.latlng, data.getElementsByTagName('FIELDS')[0].getAttribute(fields[0]));
            }
          }
          // for multiple field queries
          else {
            if (data.getElementsByTagName('FIELDS')[0].getAttribute(fields[0]) != this.wmsParams.nullValue){
              let results = [];
              for (let i=0; i < fields.length; i++){
                results.push(data.getElementsByTagName('FIELDS')[0].getAttribute(fields[i]));
              }
              showResults(err, evt.latlng, results);
            }
          }
        })
        .catch((error) => {showResults(error)});
      }      
  },
  
  getFeatureInfoUrl: function (latlng) {
    // Construct a GetFeatureInfo request URL given a point
    
    var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
        size = this._map.getSize(),
        
        params = {
          request: 'GetFeatureInfo',
          service: 'WMS',
          srs: 'EPSG:4326',
          styles: this.wmsParams.styles,
          transparent: this.wmsParams.transparent,
          version: this.wmsParams.version,      
          format: this.wmsParams.format,
          bbox: this._map.getBounds().toBBoxString(),
          height: size.y,
          width: size.x,
          layers: this.wmsParams.layers,
          query_layers: this.wmsParams.layers,
          info_format: this._url.match('geodata.hawaii.gov')? 'text/xml':'application/json' // <-- ACCOUNT FOR DIFFERENT DATA TYPES HERE
        };
    
    params[params.version === '1.3.0' ? 'i' : 'x'] = Math.round(point.x);
    params[params.version === '1.3.0' ? 'j' : 'y'] = Math.round(point.y);
    
    return this._url + L.Util.getParamString(params, this._url, true);
  },
  
  showGetFeatureInfo: function (err, latlng, content) {
    if (err) { console.log(err); return; } // do nothing if there's an error
    // Otherwise show the content in a popup, or something.
    const latlngString = +(Math.round(latlng.lat + "e+4") + "e-4") + ', ' + +(Math.round(latlng.lng + "e+4") + "e-4");
    const latlngIcon = '<svg viewBox="0 0 42.95 62.04"><g><path d="m21.48,0C11.56,0,0,6.15,0,21.8c0,10.62,16.52,34.09,21.48,40.24,4.41-6.15,21.48-29.06,21.48-40.24C42.95,6.15,31.39,0,21.48,0Zm0,34.35c-6.14,0-11.11-4.97-11.11-11.11s4.97-11.11,11.11-11.11,11.11,4.97,11.11,11.11-4.97,11.11-11.11,11.11Z"/></g></svg>';
    L.popup({ maxWidth: 200})
      .setLatLng(latlng)
      .setContent(this.wmsParams.queryDisplay(content) + '<hr><div class="latlng">'+latlngIcon + latlngString + '</div>')
      .openOn(this._map);
  }
});

L.tileLayer.betterWms = function (url, options) {
  return new L.TileLayer.BetterWMS(url, options);  
};

