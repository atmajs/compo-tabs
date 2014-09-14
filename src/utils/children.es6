var getChildren;
(function(){
	getChildren = function($nodes){
		var $coll = jmask(),
			imax = $nodes.length,
			i = -1;
		while(++i < imax){
			$coll.add(child_resolve($nodes[i]));
		}
		return $coll;
	}
	function child_resolve(child) {
		if (child.type === mask.Dom.NODE)
			// is future dom node
			return child;
		
		var ctr = child.controller;
		if (ctr && ctr.prototype.tagName)
			// is future compo with tagName
			return child;
		
		// is compo: get all dom-nodes
		var $col = jmask(),
			$children = jmask(child).children(),
			imax = $children.length,
			i = 0;
		for (; i < imax; i++) {
			$col.add(child_resolve($children[i]));
		}
		
		return $col;
	}
}());