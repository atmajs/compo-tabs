var log_error,
	log_warn;
(function(){
	log_error = delegate('error');
	log_warn = delegate('warn');
	
	function delegate(type) {
		return function(){
			log(type, arguments);
		};
	}
	function log(type, arguments_) {
		var arr = _slice.call(arguments_);
		arr.unshift('a:tabs |');
		console[type].apply(console, arr);
	}
}());