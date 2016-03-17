// source /src/wrapper.es6
"use strict";

(function (root, factory) {
	var _mask,
	    _ruta,
	    _incl,
	    _global = typeof global !== "undefined" ? global : window;

	_mask = get("mask");
	_ruta = get("ruta");
	_incl = get("include");

	if (_mask == null) throw Error("MaskJS was not loaded");

	factory(_global, _mask, _ruta, _incl, _mask.Compo.config.getDOMLibrary());

	function get(prop) {
		return _global[prop] || _global.atma && _global.atma[prop];
	}
})(undefined, function (global, mask, ruta, include, $) {

	//- removed (use boostrap css and application level overrides)
	//-- include && include.css('./tabs.css');

	// source ./utils/log.es6
	"use strict";

	var log_error = console.error.bind(console, "a:tabs - Error - ");
	var log_warn = console.warn.bind(console, "a:tabs - Warn - ");
	//# sourceMappingURL=log.es6.map
	// end:source ./utils/log.es6
	// source ./utils/children.es6
	"use strict";

	var getChildren;
	(function () {
		getChildren = function ($nodes) {
			var $coll = jmask(),
			    imax = $nodes.length,
			    i = -1;
			while (++i < imax) {
				$coll.add(child_resolve($nodes[i]));
			}
			return $coll;
		};
		function child_resolve(child) {
			if (child.type === mask.Dom.NODE) {
				// is future dom node
				return child;
			}var ctr = child.controller;
			if (ctr && ctr.prototype.tagName) {
				// is future compo with tagName
				return child;
			} // is compo: get all dom-nodes
			var $col = jmask(),
			    $children = jmask(child).children(),
			    imax = $children.length,
			    i = 0;
			for (; i < imax; i++) {
				$col.add(child_resolve($children[i]));
			}

			return $col;
		}
	})();
	//# sourceMappingURL=children.es6.map
	// end:source ./utils/children.es6
	// source ./utils/items.es6
	"use strict";

	var getItems;
	(function () {
		getItems = function ($tabs, type) {
			var klass = ".-tab-" + type;
			if ($tabs.$ == null) {
				return getChildren(jmask($tabs).children(klass).children());
			}
			if ($tabs.attr.anchors) {
				return $($tabs.$.find(".-tab-panels")[0]).find("a[name]");
			}
			return $($tabs.$.find(".-tab-" + type + "s")[0]).children(klass);
		};
	})();
	//# sourceMappingURL=items.es6.map
	// end:source ./utils/items.es6
	// source ./utils/ruta.es6
	"use strict";

	var route_getPath, route_getCurrent;
	(function () {
		route_getPath = function (ctx) {
			var path = ctx && ctx.req && ctx.req.url;
			if (path != null) return path;

			path = typeof ruta !== "undefined" ? ruta.currentPath() : null;
			if (path != null) return path;

			return typeof location !== "undefined" ? location.pathname : null;
		};
		route_getCurrent = function (route, ctx) {
			var path = route_getPath(ctx),
			    query = path.indexOf("?");
			if (query !== -1) path = path.substring(0, query);

			if (route.charCodeAt(0) !== 47) {
				// /
				route = "/" + route;
			}

			var _parts = route.split("/"),
			    _length = _parts.length,
			    _default = _parts[_length - 1],
			    _path = path.split("/");

			if (_length > _path.length) {
				return _default !== "-" ? _default : null;
			}

			var i = _length - 1;
			while (--i > -1) {
				if (_parts[i] === "-") break;

				// in case we care about parents path
				// '/-/strict/tabName'
				if (_parts[i] !== _path[i]) return null;
			}
			return _path[_length - 1];
		};
	})();
	//# sourceMappingURL=ruta.es6.map
	// end:source ./utils/ruta.es6

	// source ./compo.es6
	"use strict";

	var templates = {
		"@tab": "\n\t\tul.nav.nav-tabs .-tab-headers >\n\t\t\t@each (tab) >\n\t\t\t\t@head\n\t\t\t\t\tclass=\"-tab-header ~[ $a.visible === '@tab.attr.name' ? 'active']\"\n\t\t\t\t\tname='@tab.attr.name'\n\t\t\t\t\tas=li {\n\t\t\t\t\t\ta href='#' x-signal='click: changeTab' >\n\t\t\t\t\t\t\t@placeholder;\n\t\t\t\t\t}\n\t\t\t\n\t\t.tab-content.-tab-panels  >\n\t\t\t@each (tab) >\n\t\t\t\t@body\n\t\t\t\t\tclass=\"tab-pane -tab-panel  ~[ $a.visible === '@tab.attr.name' ? 'active']\"\n\t\t\t\t\tname='@tab.attr.name'\n\t\t\t\t\tas=div\n\t\t\t\t;\n\t\t\t\t\n\t\t@show > :animation #show > @placeholder;\n\t\t@hide > :animation #hide > @placeholder;\n\t",
		"@panel": "\n\t\t.tab-content.-tab-panels  >\n\t\t\t@each (panel) >\n\t\t\t\tdiv class=\"tab-pane -tab-panel ~[ $a.visible === '@panel.attr.name' ? 'active']\"\n\t\t\t\t\tname='@panel.attr.name' >\n\t\t\t\t\t\t@placeholder;\n\t\t\t\t\t\t\n\t\t@show > :animation #show > @placeholder;\n\t\t@hide > :animation #hide > @placeholder;\n\t"
	};

	var TabsCompo = mask.Compo({
		meta: {
			attributes: {
				"?x-route": "string",
				"?x-visible": "string",
				"?x-anchors": "boolean",
				"?x-scrollbar": "boolean"
			}
		},
		tagName: "div",
		attr: {
			"class": "-tabs"
		},
		slots: {
			changeTab: function changeTab(event) {
				event.preventDefault();
				event.stopPropagation();
				var el = $(event.currentTarget).closest(".-tab-header");
				if (el.hasClass("active")) {
					return;
				}var name = el.attr("name");
				if (name == null) {
					log_error("`changeTab` - name attribute not found");
					return;
				}
				this.setActive(name);
				this.$.trigger("change", name);
				return [this, name];
			}
		},

		onRenderStart: function onRenderStart(model, ctx) {

			var tagName = jmask(this.nodes).tag(),
			    template = templates[tagName];

			if (template == null) {
				log_error("Root Template is not defined for", tagName);
				log_warn("Support `@tab{@head;@body}` , `@panel`");
				return;
			}

			this.nodes = mask.merge(template, this.nodes);

			if (this.xScrollbar || this.xAnchors) {
				this.attr["class"] += " scrollbar";
			}
			if (this.xRoute) {
				this.attr["x-route"] = null;
				this.attr.visible = route_getCurrent(this.xRoute, ctx);
			}
			if (this.xAnchors) {
				var divs = jmask(this).children(".-tab-panels").children(),
				    panels = getChildren(divs);
				if (panels.length === 0) {
					log_error("Has no elements in @panels tag");
					return;
				}
				panels.addClass("active");
			}
			if (this.xAnchors == null && this.attr.visible == null) {
				this.attr.visible = getItems(this, "panels").eq(0).attr("name");
			}
		},

		onRenderEndServer: function onRenderEndServer(elements, model, ctx) {
			if (this.attr.visible && this.xScrollbar == null) {
				var sel = "[name=\"" + this.attr.visible + "\"].-tab-panel";

				var pane = elements[0].querySelector(sel);
				if (pane == null) {
					log_error("Not Found: ", sel);
					return;
				}
				pane.classList.add("active");
			}
		},

		onRenderEnd: function onRenderEnd(els, model, ctx) {
			var _this = this;

			if (this.attr.scrollbar) {
				this.scroller = this.closest(":scroller");
				this.scroller.on("scroll", "", this._scrolled.bind(this));
			}
			if (this.xRoute) {
				ruta.add("^/", function () {
					var name = route_getCurrent(_this.xRoute, ctx);
					_this.setActive(name);
				});
			}
		},

		animate: function animate(type, panel, callback) {
			if (panel == null) {
				return;
			}var animation = this._getAnimation(type);

			if (animation == null) {
				return;
			}animation.start(callback, panel);
		},
		_getAnimation: function _getAnimation(ani) {
			if (this.components == null) {
				return null;
			} // cache ?
			var animation;
			for (var i = 0, x, imax = this.components.length; i < imax; i++) {
				x = this.components[i];
				if (":animation" === x.compoName && ani === x.attr.id) {
					animation = x;
					break;
				}
			}
			return animation;
		},
		_hide: function _hide($el) {
			if ($el.length === 0) {
				return;
			}var ani = this._getAnimation("hide");
			if (ani == null) {
				$el.removeClass("active");
				return;
			}
			ani.start(function () {
				$el.removeClass("active");
			}, $el[0]);
		},
		_show: function _show($el) {
			if ($el.length === 0) {
				this.attr.visible = "";
				return;
			}

			$el.addClass("active");
			this.animate("show", $el[0]);
		},
		_scrolled: function _scrolled(top, left) {
			var scrollTop = this.scroller.$[0].scrollTop + (this.attr.dtop << 0);

			var $panels = getItems(this, "panel"),
			    min = null,
			    $el = null;

			for (var i = 0, x, imax = $panels.length; i < imax; i++) {
				x = $panels[i];

				if (min == null) {
					min = scrollTop - x.offsetTop;
					$el = x;
					continue;
				}

				if (Math.abs(x.offsetTop - scrollTop) < min) {
					min = scrollTop - x.offsetTop;
					$el = x;
				}
			}

			var name = $el.getAttribute("name");

			if (name && this.attr.visible !== name) {
				this.attr.visible = name;

				this.emitOut("-tabChanged", name);
			}
		},
		_scrollInto: function _scrollInto($el) {
			this.scroller.scroller.scrollToElement($el[0]);
		},

		setActive: function setActive(name) {
			if (this.attr.visible === name) {
				return;
			}this.attr.visible = name;

			var $panels = getItems(this, "panel"),
			    $headers = getItems(this, "header");

			var $panel = $panels.filter("[name=\"" + name + "\"]");

			if (this.attr.scrollbar) {
				if ($panel.length == 0) {
					log_error("Panel not found", name);
					return;
				}
				this._scrollInto($panel);
			} else {

				if ($panel.hasClass("active")) {
					return;
				}this._hide($panels.filter(".active"));
				this._show($panel);
			}

			$headers.removeClass("active").filter("[name=\"" + name + "\"]").addClass("active");
		},
		has: function has(name) {
			return getItems(this, "panel").filter("[name=\"" + name + "\"]").length !== 0;
		},
		getActiveName: function getActiveName() {
			return this.attr.visible;
		},
		getList: function getList() {
			var array = [],
			    $panels = getItems(this, "panel"),
			    name;

			for (var i = 0, $x, imax = $panels.length; i < imax; i++) {
				$x = $panels[i];

				name = null;

				if ($x.getAttribute) name = $x.getAttribute("name");

				if (!name) name = $x.attr && $x.attr.name;

				array.push(name);
			}
			return array;
		}
	});
	//# sourceMappingURL=compo.es6.map
	// end:source ./compo.es6

	mask.registerHandler("a:tabs", TabsCompo);
});
//# sourceMappingURL=wrapper.es6.map
// end:source /src/wrapper.es6