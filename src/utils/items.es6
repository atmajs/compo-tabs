var getItems;
(function(){
	getItems = function($tabs, type){
		var klass = '.-tab-' + type;
		if ($tabs.$ == null){
			return getChildren(
				jmask($tabs).children(klass).children()
			);
		}
		if ($tabs.attr.anchors) {
			return $($tabs.$.find('.-tab-panels')[0])
				.find('a[name]');
		}
		return $($tabs.$.find('.-tab-' + type + 's')[0])
			.children(klass);
	};
}());