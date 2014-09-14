(function(root, factory){
	var _mask,
		_ruta,
		_incl,
		_global = typeof global !== 'undefined'
			? global
			: window
			;
	
	_mask = get('mask');
	_ruta = get('ruta');
	_incl = get('include');
	
	if (_mask == null) 
		throw Error('MaskJS was not loaded');
	
	factory(_global, _mask, _ruta, _incl, _mask.Compo.config.getDOMLibrary());
	
	function get(prop) {
		return _global[prop] || (_global.atma && _global.atma[prop]);
	}
}(this, function(global, mask, ruta, include, $){
	
	include && include.css('./tabs.css');

	// import ./utils/log.es6
	// import ./utils/children.es6
	// import ./utils/items.es6
	// import ./utils/ruta.es6
	
	// import ./compo.es6
	
	mask.registerHandler('a:tabs', TabsCompo);
}));
