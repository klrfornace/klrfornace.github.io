L.Control.StyledLayerControl = L.Control.Layers.extend({
    options: {
        collapsed: true,
        position: 'topright',
        autoZIndex: true,
        group_togglers: {
            show: false,
            labelAll: 'All',
            labelNone: 'None'
        },
        groupDeleteLabel: 'Delete the group'
    },

    initialize: function(baseLayers, groupedOverlays, options) {
        var i,
            j;
        L.Util.setOptions(this, options);

        this._layerControlInputs = [];
        this._layers = [];
        this._lastZIndex = 0;
        this._handlingClick = false;
        this._groupList = [];
        this._domGroups = [];

        for (i in baseLayers) {
            for (var j in baseLayers[i].layers) {
                this._addLayer(baseLayers[i].layers[j], j, baseLayers[i], false);
            }
        }

        //THIS METHOD DOES NOT PRESEVE ORDER OF LAYERS IN ALL BROWSERS,
        //NOTABLY CHROME (-jmaurer):
        // for (i in groupedOverlays) {
        //     for (var j in groupedOverlays[i].layers) {
        //          this._addLayer(groupedOverlays[i].layers[j], j, groupedOverlays[i], true);
        //     }	
        // }
        // */

        /* So using arrays instead... -jmaurer */
        // (Updated for different object structure - KF)

        for (let i = 0; i < groupedOverlays.length; i++) {
            let groupedOverlay = groupedOverlays[i];
            let layerKeys = Object.keys(groupedOverlay.layers);
            for (let j = 0; j < layerKeys.length; j++) {
                let layer_name = layerKeys[j];
                let layer_obj = groupedOverlay.layers[layer_name];
                this._addLayer(layer_obj, layer_name, groupedOverlay, true);
            }
        }



    },

    onAdd: function(map) {
        this._initLayout();
        this._update();

        map
            .on('layeradd', this._onLayerChange, this)
            .on('layerremove', this._onLayerChange, this)
            .on('zoomend', this._onZoomEnd, this);

        return this._container;
    },

    onRemove: function(map) {
        map
            .off('layeradd', this._onLayerChange)
            .off('layerremove', this._onLayerChange);
    },

    addBaseLayer: function(layer, name, group) {
        layer['isBaseLayer'] = true ;
        this._addLayer(layer, name, group, false);
        this._update();
        return this;
    },

    addOverlay: function(layer, name, group) {
        this._addLayer(layer, name, group, true);
        this._update();
        return this;
    },

    removeLayer: function(layer) {
        var id = L.Util.stamp(layer);
        delete this._layers[id];
        this._update();
        return this;
    },

    removeGroup: function(group_Name, del) {
        for (group in this._groupList) {
            if (this._groupList[group].groupName == group_Name) {
                for (layer in this._layers) {
                    if (this._layers[layer].group && this._layers[layer].group.name == group_Name) {
                        if (del) {
                            this._map.removeLayer(this._layers[layer].layer);
                        }
                        delete this._layers[layer];
                    }
                }
                delete this._groupList[group];
                this._update();
                break;
            }
        }
    },

    removeAllGroups: function(del) {
        for (group in this._groupList) {
                for (layer in this._layers) {
                    if (this._layers[layer].group && this._layers[layer].group.removable) {
                        if (del) {
                            this._map.removeLayer(this._layers[layer].layer);
                        }
                        delete this._layers[layer];
                    }
                }
                delete this._groupList[group];
        }
        this._update();
    },

    selectLayer: function(layer) {
        this._map.addLayer(layer);
        this._update();
        this._toggleLayerLabelClass();
    },

    unSelectLayer: function(layer) {
        this._map.removeLayer(layer);
        this._update();
        this._toggleLayerLabelClass();
    },

    selectGroup: function(group_Name) {
        this.changeGroup(group_Name, true)
    },

    unSelectGroup: function(group_Name) {
        this.changeGroup(group_Name, false)
    },

    changeGroup: function(group_Name, select) {
        for (group in this._groupList) {
            if (this._groupList[group].groupName == group_Name) {
                for (layer in this._layers) {
                    if (this._layers[layer].group && this._layers[layer].group.name == group_Name) {
                        if (select) {
                            this._map.addLayer(this._layers[layer].layer);
                        } else {
                            this._map.removeLayer(this._layers[layer].layer);
                        }
                    }
                }
                break;
            }
        }
        this._update();
    },


    _initLayout: function() {
        var className = 'leaflet-control-layers',
            container = this._container = L.DomUtil.create('div', className);

        //Makes this work on IE10 Touch devices by stopping it from firing a mouseout event when the touch is released
        container.setAttribute('aria-haspopup', true);
        if (!L.Browser.touch) {
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.on(container, 'wheel', L.DomEvent.stopPropagation);
        } else {
            L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
        }

        // If map is scrollable, prevent map scrolls when scrolling on this div (-jmaurer):
        // Also stop zooming on double-click (if user clicks too quickly) - KF

        var me = this; // closure
        L.DomEvent.addListener(container, 'mouseover', function () {
            me._map.doubleClickZoom.disable(); 
            me._map.scrollWheelZoom.disable();
            }
        );
        L.DomEvent.addListener(container, 'mouseout', function () {
            me._map.doubleClickZoom.enable(); 
            me._map.scrollWheelZoom.enable();
          }
        );

        // This prevents click and drag panning - KF

        L.DomEvent.addListener(container, 'mousedown', function (){
            me._map.dragging.disable();
          })
        
          L.DomEvent.addListener(document, 'mouseup', function (){
            me._map.dragging.enable();
          })
        // end insert

        var section = document.createElement('section');
        section.className = 'ac-container ' + className + '-list';

        var form = this._form = this._section = L.DomUtil.create('form');

        section.appendChild(form);

        if (this.options.collapsed) {
            if (!L.Browser.android) {
                L.DomEvent
                    .on(container, 'mouseover', this._expand, this)
                    .on(container, 'mouseout', this._collapse, this);
            }
            var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
            link.href = '#';
            link.title = 'Layers';

            if (L.Browser.touch) {
                L.DomEvent
                    .on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', this._expand, this);
            } else {
                L.DomEvent.on(link, 'focus', this._expand, this);
            }

            this._map.on('click', this._collapse, this);
            // TODO keyboard accessibility

        } else {
            this._expand();

                // Create hidden layers button in case user clicks "hide" on expanded list:
                // -jmaurer

                var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
                link.href = '#';
                link.title = 'Show the layer menu';
                L.DomEvent
                  .on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', this._expand, this);
        }

        this._baseLayersList = L.DomUtil.create('div', className + '-base', form);
        this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);

        container.appendChild(section);

        // process options of ac-container css class - to options.container_width and options.container_maxHeight
        for (var c = 0; c < (containers = container.getElementsByClassName('ac-container')).length; c++) {
            if (this.options.container_width) {
                containers[c].style.width = this.options.container_width;
            }

            // set the max-height of control to y value of map object
            this._default_maxHeight = this.options.container_maxHeight ? this.options.container_maxHeight : (this._map.getSize().y - 70);
            containers[c].style.maxHeight = this._default_maxHeight;
        }

        // Insert div to hold simple legend (created separately) - KF
        L.DomUtil.create('div','legend-container legend-container-hidden', container);

        // Add layer utilities for expanding, collapsing, and clearing all
        // layers (-jmaurer):
        // Condensing to just hide menu - KF

        var utilities = document.createElement('div');	
        utilities.id = 'styledLayerControl-utilities';

        // var clear_all = document.createElement('a');
        // var clear_all_text = document.createTextNode('Clear all');
        // clear_all.appendChild(clear_all_text);
        // clear_all.href = 'javascript:void(0)';
        // var me = this; // create closure
        // clear_all.onclick = function () { me._clearAll(); };
        // utilities.appendChild(clear_all);

        // var spacer = document.createElement('span');
        // spacer.innerHTML = ' &nbsp;&#149;&nbsp; ';
        // utilities.appendChild(spacer);

        var hide_menu = L.DomUtil.create('button','close-btn',utilities)

        hide_menu.innerHTML = '<svg viewBox="0 0 30.56 30.28"><g><path d="M26.06,30.28H4.5c-2.48,0-4.5-2.02-4.5-4.5V4.5C0,2.02,2.02,0,4.5,0H26.06c2.48,0,4.5,2.02,4.5,4.5V25.78c0,2.48-2.02,4.5-4.5,4.5ZM4.5,3c-.83,0-1.5,.67-1.5,1.5V25.78c0,.83,.67,1.5,1.5,1.5H26.06c.83,0,1.5-.67,1.5-1.5V4.5c0-.83-.67-1.5-1.5-1.5H4.5Z"/><g><rect x="19.41" y="5.94" width="6.99" height="3.13" transform="translate(1.4 18.4) rotate(-45)"/><polygon points="18 5.46 15.46 14.96 24.96 12.41 18 5.46"/></g><g><rect x="4.15" y="21.2" width="6.99" height="3.13" transform="translate(-13.86 12.08) rotate(-45)"/><polygon points="12.55 24.82 15.1 15.32 5.6 17.87 12.55 24.82"/></g></g></svg>';
        hide_menu.setAttribute('aria-label','Hide layer control window');
        var closure = this; // create closure
        hide_menu.onclick = function () { closure._collapse(); };
        utilities.appendChild(hide_menu);

        // var spacer = document.createElement('span');
        // spacer.innerHTML = ' &nbsp;&#149;&nbsp; ';
        // utilities.appendChild(spacer);

        var legendToggle = L.DomUtil.create('button','legend-toggle',utilities);
        legendToggle.innerHTML = 'Simple legend <svg viewBox="0 0 28.56 16.6"><g><g><rect y="6.05" width="16.61" height="4.5"/><polygon points="14.18 16.6 28.56 8.3 14.18 0 14.18 16.6"/></g></g></svg>';
        legendToggle.setAttribute('aria-label','Switch between simple legend and full menu');

        container.appendChild(utilities);

        window.onresize = this._on_resize_window.bind(this);

    },

    _on_resize_window: function() {
        // listen to resize of screen to reajust de maxHeight of container
        for (var c = 0; c < containers.length; c++) {
            // input the new value to height
            containers[c].style.maxHeight = (window.innerHeight - 90) < this._removePxToInt(this._default_maxHeight) ? (window.innerHeight - 90) + "px" : this._removePxToInt(this._default_maxHeight) + "px";
            
            // add resizing to min width based on window width
        }
    },

    // remove the px from a css value and convert to a int
    _removePxToInt: function(value) {
        if (typeof value === 'string') {
            return parseInt(value.replace("px", ""));
        }
        return value;
    },

    _addLayer: function(layer, name, group, overlay) {
        var id = L.Util.stamp(layer);

        this._layers[id] = {
            layer: layer,
            name: name,
            overlay: overlay
        };

        if (group) {
            var groupId = this._groupList.indexOf(group);

            // if not find the group search for the name
            if (groupId === -1) {
                for (g in this._groupList) {
                    if (this._groupList[g].groupName == group.groupName) {
                        groupId = g;
                        break;
                    }
                }
            }

            if (groupId === -1) {
                groupId = this._groupList.push(group) - 1;
            }

            this._layers[id].group = {
                name: group.groupName,
                id: groupId,
                expanded: group.expanded,
                removable: group.removable
            };
        }

        if (this.options.autoZIndex && layer.setZIndex) {
            this._lastZIndex++;
            layer.setZIndex(this._lastZIndex);
        }
    },

    _update: function() {
        if (!this._container) {
            return;
        }

        this._baseLayersList.innerHTML = '';
        this._overlaysList.innerHTML = '';

        this._domGroups.length = 0;

        this._layerControlInputs = [];

        var baseLayersPresent = false,
            overlaysPresent = false,
            i,
            obj;

        for (i in this._layers) {
            obj = this._layers[i];
            this._addItem(obj);
            overlaysPresent = overlaysPresent || obj.overlay;
            baseLayersPresent = baseLayersPresent || !obj.overlay;
        }

    },

    _onLayerChange: function(e) {
        var obj = this._layers[L.Util.stamp(e.layer)];

        if (!obj) {
            return;
        }

        if (!this._handlingClick) {
            this._update();
        }

        var type = obj.overlay ?
            (e.type === 'layeradd' ? 'overlayadd' : 'overlayremove') :
            (e.type === 'layeradd' ? 'baselayerchange' : null);

            // KF: This was not firing baselayerchange events correctly:
            // e.type === 'layeradd' && e.layer.isBaseLayer ? 'baselayerchange' : null;

        this._checkIfDisabled();
        this._toggleLayerLabelClass();

        if (type) {
            this._map.fire(type, obj);
        }
    },

    _onZoomEnd: function(e) {
        this._checkIfDisabled();
    },

    _checkIfDisabled: function(layers) {
        var currentZoom = this._map.getZoom();

        for (layerId in this._layers) {
            if (this._layers[layerId].layer.options && (this._layers[layerId].layer.options.minZoom || this._layers[layerId].layer.options.maxZoom)) {
                var el = document.getElementById('ac_layer_input_' + this._layers[layerId].layer._leaflet_id);
                if (currentZoom < this._layers[layerId].layer.options.minZoom || currentZoom > this._layers[layerId].layer.options.maxZoom) {
                    el.disabled = 'disabled';
                } else {
                    el.disabled = '';
                }
            }
        }
    },

    // IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
    _createRadioElement: function(name, checked) {

        var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"';
        if (checked) {
            radioHtml += ' checked="checked"';
        }
        radioHtml += '/>';

        var radioFragment = document.createElement('div');
        radioFragment.innerHTML = radioHtml;

        return radioFragment.firstChild;
    },

    _addItem: function(obj) {
        var label = document.createElement('div'),
            input,
            checked = this._map.hasLayer(obj.layer),
            id = 'ac_layer_input_' + obj.layer._leaflet_id,
            container;


        if (obj.overlay) {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.className = 'leaflet-control-layers-selector';
            input.defaultChecked = checked;

            label.className = "menu-item-checkbox";
            input.id = id;

        } else {
            input = this._createRadioElement('leaflet-base-layers', checked);

            label.className = "menu-item-radio";
            input.id = id;
        }

        this._layerControlInputs.push(input);
        input.layerId = L.Util.stamp(obj.layer);

        L.DomEvent.on(input, 'click', this._onInputClick, this);

        var name = document.createElement('label');
        //KF modified
        name.innerHTML = '<label id="' + id +'-label" for="' + id + '">' + obj.name + '</label>';
        // name.innerHTML = '<label for="' + id + '">' + obj.name + '</label>';

        label.appendChild(input);
        label.appendChild(name);

        if (obj.layer.StyledLayerControl) {

            // configure the delete button for layers with attribute removable = true
            if (obj.layer.StyledLayerControl.removable) {
                var bt_delete = document.createElement("input");
                bt_delete.type = "button";
                bt_delete.className = "bt_delete";
                L.DomEvent.on(bt_delete, 'click', this._onDeleteClick, this);
                label.appendChild(bt_delete);
            }

            // configure the visible attribute to layer
            if (obj.layer.StyledLayerControl.visible) {
                // this._map.addLayer(obj.layer);
            }

        }


        if (obj.overlay) {
            container = this._overlaysList;
        } else {
            container = this._baseLayersList;
        }

        var groupContainer = this._domGroups[obj.group.id];

        if (!groupContainer) {

            groupContainer = document.createElement('div');
            groupContainer.id = 'leaflet-control-accordion-layers-' + obj.group.id;

            // verify if group is expanded
            var s_expanded = obj.group.expanded ? ' checked = "true" ' : '';

            // verify if type is exclusive
            var s_type_exclusive = this.options.exclusive ? ' type="radio" ' : ' type="checkbox" ';

            inputElement = '<input id="ac' + obj.group.id + '" name="accordion-1" class="menu" ' + s_expanded + s_type_exclusive + '/>';
            inputLabel = '<label for="ac' + obj.group.id + '">' + obj.group.name + '</label>';

            article = document.createElement('article');
            article.className = 'ac-large'
            
            // KF insert for transition - doesn't work

            // let transitionDiv = document.createElement('div');
            // transitionDiv.className = 'ac-large-transition';
            // article.appendChild(transitionDiv);
            // transitionDiv.appendChild(label);
            // end insert

            article.appendChild(label);

            // process options of ac-large css class - to options.group_maxHeight property
            if (this.options.group_maxHeight) {
                article.style.maxHeight = this.options.group_maxHeight;
            }

            groupContainer.innerHTML = inputElement + inputLabel;

            groupContainer.appendChild(article);

            // Link to toggle all layers
            if (obj.overlay && this.options.group_togglers.show) {

                // Toggler container
                var togglerContainer = L.DomUtil.create('div', 'group-toggle-container', groupContainer);

                // Link All
                var linkAll = L.DomUtil.create('a', 'group-toggle-all', togglerContainer);
                linkAll.href = '#';
                linkAll.title = this.options.group_togglers.labelAll;
                linkAll.innerHTML = this.options.group_togglers.labelAll;
                linkAll.setAttribute("data-group-name", obj.group.name);

                if (L.Browser.touch) {
                    L.DomEvent
                        .on(linkAll, 'click', L.DomEvent.stop)
                        .on(linkAll, 'click', this._onSelectGroup, this);
                } else {
                    L.DomEvent
                        .on(linkAll, 'click', L.DomEvent.stop)
                        .on(linkAll, 'focus', this._onSelectGroup, this);
                }

                // Separator
                var separator = L.DomUtil.create('span', 'group-toggle-divider', togglerContainer);
                separator.innerHTML = ' / ';

                // Link none
                var linkNone = L.DomUtil.create('a', 'group-toggle-none', togglerContainer);
                linkNone.href = '#';
                linkNone.title = this.options.group_togglers.labelNone;
                linkNone.innerHTML = this.options.group_togglers.labelNone;
                linkNone.setAttribute("data-group-name", obj.group.name);

                if (L.Browser.touch) {
                    L.DomEvent
                        .on(linkNone, 'click', L.DomEvent.stop)
                        .on(linkNone, 'click', this._onUnSelectGroup, this);
                } else {
                    L.DomEvent
                        .on(linkNone, 'click', L.DomEvent.stop)
                        .on(linkNone, 'focus', this._onUnSelectGroup, this);
                }

                if (obj.overlay && this.options.group_togglers.show && obj.group.removable) {
                    // Separator
                    var separator = L.DomUtil.create('span', 'group-toggle-divider', togglerContainer);
                    separator.innerHTML = ' / ';
                }

                if (obj.group.removable) {
                    // Link delete group
                    var linkRemove = L.DomUtil.create('a', 'group-toggle-none', togglerContainer);
                    linkRemove.href = '#';
                    linkRemove.title = this.options.groupDeleteLabel;
                    linkRemove.innerHTML = this.options.groupDeleteLabel;
                    linkRemove.setAttribute("data-group-name", obj.group.name);

                    if (L.Browser.touch) {
                        L.DomEvent
                            .on(linkRemove, 'click', L.DomEvent.stop)
                            .on(linkRemove, 'click', this._onRemoveGroup, this);
                    } else {
                        L.DomEvent
                            .on(linkRemove, 'click', L.DomEvent.stop)
                            .on(linkRemove, 'focus', this._onRemoveGroup, this);
                    }
                }

            }

            container.appendChild(groupContainer);

            this._domGroups[obj.group.id] = groupContainer;
        } else {

            groupContainer.getElementsByTagName('article')[0].appendChild(label);
        }


        return label;
    },

    _onDeleteClick: function(obj) {
        var node = obj.target.parentElement.childNodes[0];
        n_obj = this._layers[node.layerId];

        // verify if obj is a basemap and checked to not remove
        if (!n_obj.overlay && node.checked) {
            return false;
        }

        if (this._map.hasLayer(n_obj.layer)) {
            this._map.removeLayer(n_obj.layer);
        }

        obj.target.parentNode.remove();

        return false;
    },

    _onSelectGroup: function(e) {
        this.selectGroup(e.target.getAttribute("data-group-name"));
    },

    _onUnSelectGroup: function(e) {
        this.unSelectGroup(e.target.getAttribute("data-group-name"));
    },

    _onRemoveGroup: function(e) {
        this.removeGroup(e.target.getAttribute("data-group-name"), true);
    },

    _expand : function () {
        L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
        // -jmaurer:
        if ( document.getElementById( 'styledLayerControl-utilities' ) ) {
          document.getElementById( 'styledLayerControl-utilities' ).style.display = '';
        }
        if ( document.querySelector( '.legend-container' ) ) {
            document.querySelector( '.legend-container').style.display = '';
          }
    },

    _collapse : function () {
        this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
        // -jmaurer:
        if ( document.getElementById( 'styledLayerControl-utilities' ) ) {
          document.getElementById( 'styledLayerControl-utilities' ).style.display = 'none';
        }
        if ( document.querySelector( '.legend-container' ) ) {
            document.querySelector( '.legend-container').style.display = 'none';
          }
    },

    // _expand: function() {
    //     L.DomUtil.addClass(this._container, 'leaflet-control-layers-expanded');
    // },

    // _collapse: function() {
    //     this._container.className = this._container.className.replace(' leaflet-control-layers-expanded', '');
    // },

    //KF addition
    // Add class to label to show/hide/change style of control entry as layers are added/removed
    _toggleLayerLabelClass: function(){
        for (layerId in this._layers) {
            var currentInput = document.getElementById('ac_layer_input_' + this._layers[layerId].layer._leaflet_id);
            var currentLabel = document.getElementById('ac_layer_input_' + this._layers[layerId].layer._leaflet_id + '-label');
            
            currentInput.checked ? currentLabel.classList.add("active-layer"):currentLabel.classList.remove('active-layer');
        }
    },

   
    /* jmaurer; groupName optional: */ 
    _clearAll : function ( groupName ) {
        var i,
        input,
        obj,
        inputs = this._form.getElementsByTagName('input'),
        inputsLen = inputs.length;

        for (i = 0; i < inputsLen; i++) {
            input = inputs[i];
            obj = this._getLayer(input.layerId);

            if ( !obj ) { continue; }
            if ( !obj.layer ) { continue; }
            if ( !obj.overlay ) { continue; } // skip basemaps

            if ( groupName
                && obj.group.name != groupName ) {
                continue;
            }

            input.checked = false;
        }
        this._onInputClick();
    },
    

});

L.Control.styledLayerControl = function(baseLayers, overlays, options) {
    return new L.Control.StyledLayerControl(baseLayers, overlays, options);
};