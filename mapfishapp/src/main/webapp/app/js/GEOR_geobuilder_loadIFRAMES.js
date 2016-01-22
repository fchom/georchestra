Ext.namespace("GEOR");

GEOR.geobuilder_loadIFRAMES = function () {

	// Create all IFRAME wrappers and append IFRAMEs inside each corresponding wrapper.
	// Note that Ext.DomHelper.append is NOT chainable.
	// For example purpose, ggis_menu_IFRAME's src attribute is manually set so that the IFRAME is loaded.
	// ggis_hiddenWidget IFRAME.
	Ext.DomHelper.append(document.body, {
		tag: 'div',
		cls: 'iframe-wrapper',
		id: 'ggis_hiddenWidget',
		css: 'display:none;'
	});
	Ext.DomHelper.append(document.getElementById('ggis_hiddenWidget'), {
        tag : 'iframe',
        id : 'ggis_hiddenWidget_IFRAME',
        frameBorder : 0,
        width : 0,
        height : 0,
        css : 'display:none;visibility:hidden;height:0px;',
        src : ''
    });

	// ggis_menu IFRAME
	Ext.DomHelper.append(document.body, {
		tag: 'div',
		cls: 'iframe-wrapper',
		id: 'ggis_menu',
		css: 'display:none;'
	});
	Ext.DomHelper.append(document.getElementById('ggis_menu'), {
        tag : 'iframe',
        id : 'ggis_menu_IFRAME',
        frameBorder : 0,
        css : 'display:none;visibility:hidden;height:0px;',
        src : ''
    });

	// ggis_featureInfo IFRAME
	Ext.DomHelper.append(document.body, {
		tag: 'div',
		cls: 'iframe-wrapper',
		id: 'ggis_featureInfo',
		css: 'display:none;'
	});
	Ext.DomHelper.append(document.getElementById('ggis_featureInfo'), {
        tag : 'iframe',
        id : 'ggis_featureInfo_IFRAME',
        frameBorder : 0,
        width : 0,
        height : 0,
        css : 'display:none;visibility:hidden;height:0px;',
        src : ''
    });

	// ggis_workPlace IFRAME
	Ext.DomHelper.append(document.body, {
		tag: 'div',
		cls: 'iframe-wrapper',
		id: 'ggis_workPlace',
		css: 'display:none;'
	});
	Ext.DomHelper.append(document.getElementById('ggis_workPlace'), {
        tag : 'iframe',
        id : 'ggis_workPlace_IFRAME',
        frameBorder : 0,
        width : 500,
        height : 400,
        css : 'display:none;visibility:hidden;height:0px;',
        src : ''
    });

	// ggis_popup IFRAME
	Ext.DomHelper.append(document.body, {
		tag: 'div',
		cls: 'iframe-wrapper',
		id: 'ggis_popup',
		css: 'display:none;'
	});
	Ext.DomHelper.append(document.getElementById('ggis_popup'), {
        tag : 'iframe',
        id : 'ggis_popup_IFRAME',
        frameBorder : 0,
        width : 0,
        height : 0,
        css : 'display:none;visibility:hidden;height:0px;',
        src : ''
    });

};