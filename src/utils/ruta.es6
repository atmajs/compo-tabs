var route_getPath,
	route_getCurrent;
(function(){
	route_getPath = function(ctx){
		var path = ctx && ctx.req && ctx.req.url;
		if (path != null) 
			return path;
		
		path = typeof ruta !== 'undefined'
			? ruta.currentPath()
			: null;
		if (path != null) 
			return path;
		
		return typeof location !== 'undefined'
			? location.pathname
			: null;
	};
	route_getCurrent = function(route, ctx){
		var path = route_getPath(ctx),
			query = path.indexOf('?');
		if (query !== -1) 
			path = path.substring(0, query);
			
		if (route.charCodeAt(0) !== 47) {
			// /
			route = '/' + route;
		}
		
		var _parts = route.split('/'),
			_length = _parts.length,
			_default = _parts[_length - 1],
			
			_path = path.split('/');
			
		
		if (_length > _path.length) {
			return _default !== '-'
				? _default
				: null;
		}
		
		var i = _length - 1;
		while (--i > -1) {
			if (_parts[i] === '-')
				break;
			
			// in case we care about parents path
			// '/-/strict/tabName'
			if (_parts[i] !== _path[i]) 
				return null;
		}
		return _path[_length - 1];
	};
}());
