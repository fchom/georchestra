/*
 * Copyright (C) Camptocamp
 *
 * This file is part of geOrchestra
 *
 * geOrchestra is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with geOrchestra.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * @include OpenLayers/Control/MousePosition.js
 * @include OpenLayers/Control/ScaleLine.js
 * @include OpenLayers/Projection.js
 * @include GeoExt/widgets/MapPanel.js
 * @include GEOR_toolbar.js
 * @include GEOR_config.js
 * @include GEOR_scalecombo.js
 */

Ext.namespace("GEOR");

GEOR.mappanel = (function() {
	

    /**
     * Property: tr
     * {Function} an alias to OpenLayers.i18n
     */
    var tr = null;

    /**
     * Property: mpControl
     * {OpenLayers.Control.MousePosition}
     */
    var mpControl = null;
    
    /**
     * Method: formatMousePositionOutput
     * creates a mouse position formatter 
     *
     * Parameters:
     * {String} projCode The EPSG code.
     *
     * Returns:
     * {Function}
     */
    var formatMousePositionOutput = function(projCode) {
        var format, firstPrefix, secondPrefix, 
            p = new OpenLayers.Projection(projCode);
        if (!p.proj) {
            alert("Missing definition of "+projCode+" for the output mouse position !");
            return;
        }
        if (p.proj.projName === "longlat") {
            format = function(n) {return OpenLayers.Number.format(n, 5)};
            firstPrefix = "Lon = ";
            secondPrefix = ", Lat = ";
        } else {
            format = function(n) {return OpenLayers.Number.format(n, 0)};
            firstPrefix = "X = ";
            secondPrefix = ", Y = ";
        }
        return function(lonlat) {
            return [firstPrefix, format(lonlat.lon), 
                secondPrefix, format(lonlat.lat)].join('');
        }
    };
    
    /**
     * Method: buildMousePositionCtrl
     * Build a mouse position control.
     *
     * Parameters:
     * {String} projCode The EPSG code.
     * {DOMElement} The DOM element the control must be drawn in.
     *
     * Returns:
     * {OpenLayers.Control.MousePosition}
     */
    var buildMousePositionCtrl = function(projCode, div) {
        return new OpenLayers.Control.MousePosition({
            div: div,
            id:'mouseControlId',
            displayProjection: new OpenLayers.Projection(projCode),
            formatOutput: formatMousePositionOutput(projCode)
        });
    };


    /**
     * Method: buildBbarCfg
     * Build the bottom toolbar config
     *
     * Parameters:
     * map - {OpenLayers.Map}
     *
     * Returns:
     * {Object} An object with a "buttons" property referencing
     *     an array of toolbar items.
     */
    var buildBbarCfg = function(map) {
    	// div to push element
        var div;
        // Srs select by user
        var xySelect;        
        // list of items to push in bbar
        var items = [];

        // Scale combobox
        items.push(Ext.apply({
            width: 110,
            value: tr('scale picker')
        }, GEOR.scalecombo.create(map)));

        // Scale Line
        div = Ext.DomHelper.append(Ext.getBody(), {
            tag: "div",
            cls: "olControlScaleLine"
        });
        items.push(div);
        var scaleOptions = {
        		geodesic : true,
        		div:div
        
        };
        map.addControl(new OpenLayers.Control.ScaleLine(scaleOptions));

        // greedy spacer
        items.push("->");

        // Pointer coordinates
        var srsList = GEOR.config.POINTER_POSITION_SRS_LIST,
            srs = srsList[0][0];
        
        items.push(tr("Coordonnées en "));
        items.push({
            xtype: 'combo',
            id:'comboSrs',
            width: 130,
            store: srsList,
            value: srsList[1][0],
            editable: false,
            cls:'bottomButton',
            tpl: [
                '<tpl for=".">',
                '<div class="x-combo-list-item" ext:qtip="{field2} - {field1}" >',
                '{field2}',
                '</div>',
                '</tpl>'
            ].join(''),
            triggerAction: 'all',
            mode: 'local',
            listeners: {
                select: function(combo, record, index) {
                    mpControl.displayProjection = 
                        new OpenLayers.Projection(record.data['field1']);
                    mpControl.formatOutput = 
                        formatMousePositionOutput(record.data['field1']);
                    projName = mpControl.displayProjection.proj.projName;
                    if(projName === 'longlat'){
                    	Ext.getCmp('textX').setValue('Lon = ');
                    	Ext.getCmp('textY').setValue('Lat = ');
                    } else {
                    	Ext.getCmp('textX').setValue('X = ');
                        Ext.getCmp('textY').setValue('Y = ');
                    }
                }
            }
        });
        
        
        items.push({
        		xtype:'textfield',
        		id:'textX',
        		width: 34,
        		cls:'fieldXY',
        		value:'X = ',
        		readOnly:true
        });
        
        items.push({
            xtype: 'textfield',
            id:'fieldX',           
            width: 82,
            editable: true,
            listeners:{
            	afterrender:destroyPoint
            },
            regex:/^[0-9.-]+$/, // allow . and - and number 0 - 9 only
        });      
        
        items.push({
    		xtype:'textfield',
    		id:'textY',
    		width: 34,
    		cls:'fieldXY',
    		value:'Y = ',
    		readOnly:true
    	});
        
        items.push({
            xtype: 'textfield',
            id:'fieldY',
            width: 82,
            editable: true,
            listeners:{
            	afterrender:destroyPoint
            },
            regex:/^[0-9.-]+$/, // allow . and - and number 0 - 9 only
        });
        
        // If user dblclick on one field, destroy point result
        function destroyPoint(field){
        	field.getEl().on('dblclick',function(event,el){
    			if (map.getLayersByName('georchestra_pointsLayer').length > 0){
    				lastResult = map.getLayersByName('georchestra_pointsLayer')[0];
        			lastResult.removeAllFeatures();
    			}
    		});
        }
        
        // create button to set center on feature
        items.push({
        	xtype:'button',
        	id:'buttonCenter',
        	height:10,
        	text:'Voir',
        	tooltip:'Zoom surl les coordonnées',
        	ctCls:'x-btn-smallest',
        	handler: function (){
        	// create layer and delete feature if last feature exist
        		var pointsLayer;
        		var size;       		
        		if (map.getLayersByName('georchestra_pointsLayer').length === 0){
        			pointsLayer = new OpenLayers.Layer.Vector("georchestra_pointsLayer", {
        			displayInLayerSwitcher: false,
        			styleMap: new OpenLayers.StyleMap({
                        "default": {
                        	graphicWidth: 20,
                            graphicHeight: 32,
                            graphicYOffset: -28, // shift graphic up 28 pixels
                            externalGraphic : 'app/css/images/pwrs/geoPin.png'
                            }
                    })
                });        		        		
                map.addLayer(pointsLayer);
                
        		} else {
        			pointsLayer = map.getLayersByName('georchestra_pointsLayer')[0];
        			pointsLayer.removeAllFeatures();
        		}        		
        		// get coordinates from field value
            	var xLong = Ext.getCmp('fieldX').getValue();
        		var yLat = Ext.getCmp('fieldY').getValue();
        		if (xLong != null || yLat != null){
        			// directly create point if SRS = projection, else, transform to map SRS
            		if (xySelect=== GEOR.config.MAP_SRS){
                		var point = new OpenLayers.Geometry.Point(xLong,yLat);
                	} else { 
            			var coord = new OpenLayers.LonLat(xLong, yLat).transform(
                            new OpenLayers.Projection(xySelect), 
                            GEOR.config.MAP_SRS);      			
            			var point = new OpenLayers.Geometry.Point(coord.lon,coord.lat);        			
            		}
            		// add new point to map and zoom if geom respect map extend
            		if (point.x <= GEOR.config.MAP_XMAX &&
            			point.x >= GEOR.config.MAP_XMIN && 
            			point.y <= GEOR.config.MAP_YMAX && 
            			point.y >= GEOR.config.MAP_YMIN){
            				map.setCenter(new OpenLayers.LonLat(point.x, point.y), 16);
            				feature = new OpenLayers.Feature.Vector(point);
                			pointsLayer.addFeatures(feature);
            		}else{
            			alert("Coordonnées invalides !");
        			}
        		}
        		
            }
        });
        
        // create event to get coordinates from mouse position control and display to field
        var events = map.events;
        events.register("mousemove",map,function(e){
            var mapMousePosition = map.getControlsBy("id","mouseControlId")[0];
        	if (mapMousePosition.lastXy != null){
        		var last_x = mapMousePosition.lastXy.x;
                var last_y = mapMousePosition.lastXy.y;
                var lonLat = map.getLonLatFromPixel(new OpenLayers.Pixel(last_x,last_y));

                // Get default map projection and get projection from combo
                var projFrom = GEOR.config.MAP_SRS;
                comboSrs = Ext.getCmp('comboSrs').getValue();
                
                // transform coordinates to selected projection if srs 
                // is not map projection
                if (comboSrs != projFrom){
                	xySelect=comboSrs;
                    projTo = new OpenLayers.Projection(comboSrs);
                    lonLatProj = lonLat.transform(projFrom, projTo);
                    lonX=lonLatProj.lon.toFixed(5);
                    latY=lonLatProj.lat.toFixed(5);
                } else {
                	lonX=lonLat.lon.toFixed(2);
                    latY=lonLat.lat.toFixed(2);
                    xySelect=projFrom;
                }
                
                Ext.getCmp('fieldX').setValue(lonX);
                Ext.getCmp('fieldY').setValue(latY);      
                  return true;
        	}
            
        },true);

        div = Ext.DomHelper.append(Ext.getBody(), {
            tag: "div",
            cls: "mouseposition",
            hidden:'true'
        });
        items.push(div);
        mpControl = buildMousePositionCtrl(srs,div);
        map.addControl(mpControl);
          
        return {
            id: "bbar",
            items: items
        };
    };

    /*
     * Public
     */
    return {

        /**
         * APIMethod: create
         * Return the map panel config.
         *
         * Parameters:
         * layerStore - {GeoExt.data.LayerStore} The application layer store.
         */
        create: function(layerStore) {
            var map = layerStore.map;
            tr = OpenLayers.i18n;
            return new GeoExt.MapPanel({
                xtype: "gx_mappanel",
                region: "center",
                id: "mappanel",
                stateful: false,
                map: map,
                layers: layerStore,
                tbar: //Appel de la fonction d'init du menu de la toolbar
                    GEOR.geobuilder_toolbar.create(layerStore),//GEOR.toolbar.create(layerStore),
                bbar: new Ext.Toolbar(buildBbarCfg(map))
                // hack for better ergonomics:
                //,updateMapSize: function() {}
                // but is responsible of https://github.com/georchestra/georchestra/issues/367
            });
        }
    };
})();
