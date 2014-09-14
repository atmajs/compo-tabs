var templates = {
	'@tab': `
		ul.nav.nav-tabs .-tab-headers >
			@each (tab) >
				@head
					class="-tab-header ~[: $a.visible === '@tab.attr.name' ? 'active']"
					name='@tab.attr.name'
					as=li {
						a href='#' x-signal='click: changeTab' >
							@placeholder;
					}
			
		.tab-content.-tab-panels  >
			@each (tab) >
				@body
					class="tab-pane -tab-panel  ~[: $a.visible === '@tab.attr.name' ? 'active']"
					name='@tab.attr.name'
					as=div
				;
				
		@show > :animation #show > @placeholder;
		@hide > :animation #hide > @placeholder;
	`,
	'@panel': `
		.tab-content.-tab-panels  >
			@each (panel) >
				div class="tab-pane -tab-panel ~[: $a.visible === '@panel.attr.name' ? 'active']"
					name='@panel.attr.name' >
						@placeholder;
						
		@show > :animation #show > @placeholder;
		@hide > :animation #hide > @placeholder;
	`
};

var TabsCompo = mask.Compo({
	meta: {
		attributes: {
			'?x-route': 'string',
			'?x-visible': 'string',
			'?x-anchors': 'boolean',
			'?x-scrollbar': 'boolean'
		}
	},
	tagName: 'div',
	attr: {
		'class': '-tabs'
	},
	slots: {
		changeTab (event) {
			event.preventDefault();
			event.stopPropagation();
			var el = $(event.currentTarget).closest('.-tab-header');
			if (el.hasClass('active'))
				return;
			
			var name = el.attr('name');
			if (name == null) {
				log_error('`changeTab` - name attribute not found');
				return;
			}
			this.setActive(name);
			this.$.trigger('change', name);
			return [this, name];
		}
	},
	
	onRenderStart: function(model, ctx){
		
		var tagName = jmask(this.nodes).tag(),
			template = templates[tagName];
		
		if (template == null) {
			log_error('Root Template is not defined for', tagName);
			log_warn('Support `@tab{@head;@body}` , `@panel`')
			return;
		}
		
		this.nodes = mask.merge(template, this.nodes);
		
		if (this.xScrollbar || this.xAnchors) {
			this.attr['class'] += ' scrollbar';
		}
		if (this.xRoute) {
			this.attr['x-route'] = null;
			this.attr.visible = route_getCurrent(this.xRoute, ctx);
		}
		if (this.xAnchors) {
			var divs = jmask(this).children('.-tab-panels').children(),
				panels = getChildren(divs);
			if (panels.length === 0) {
				log_error('Has no elements in @panels tag');
				return;
			}
			panels.addClass('active');
		}
		if (this.xAnchors == null && this.attr.visible == null) {
			this.attr.visible = getItems(this, 'panels').eq(0).attr('name');
		}
	},
	
	onRenderEndServer: function(elements, model, ctx) {
		if (this.attr.visible && this.xScrollbar == null) {
			var sel = '[name="'
				+ this.attr.visible
				+ '"].-tab-panel';
				
			var pane = elements[0].querySelector(sel);
			if (pane == null) {
				log_error('Not Found: ', sel);
				return;
			}
			pane.classList.add('active');
		}
	},

	onRenderEnd: function(els, model, ctx){
		if (this.attr.scrollbar) {
			this.scroller = this.closest(':scroller');
			this.scroller.on('scroll', '', this._scrolled.bind(this));
		}
		if (this.xRoute) {
			ruta.add('^/', () => {
				var name = route_getCurrent(this.xRoute, ctx);
				this.setActive(name);
			});
		}
	},
	
	animate: function(type, panel, callback){
		if (panel == null)
			return;
		
		var animation = this._getAnimation(type);
		
		if (animation == null)
			return;
			
		animation.start(callback, panel);
	},
	_getAnimation: function(ani){
		if (this.components == null)
			return null;
		
		// cache ?
		var animation;
		for (var i = 0, x, imax = this.components.length; i < imax; i++){
			x = this.components[i];
			if (':animation' === x.compoName && ani === x.attr.id) {
				animation = x;
				break;
			}
		}
		return animation;
	},
	_hide: function($el){
		if ($el.length === 0)
			return;
		var ani = this._getAnimation('hide');
		if (ani == null) {
			$el.removeClass('active');
			return;
		}
		ani.start(function(){
			$el.removeClass('active');
		}, $el[0]);
	},
	_show: function($el){
		if ($el.length === 0){
			this.attr.visible = '';
			return;
		}
		
		$el.addClass('active');
		this.animate('show', $el[0]);

	},
	_scrolled: function(top, left){
		var scrollTop = this.scroller.$[0].scrollTop + (this.attr.dtop << 0);
		
		var $panels = getItems(this, 'panel'),
			min = null,
			$el = null;
			
		for (var i = 0, x, imax = $panels.length; i < imax; i++){
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
		
		var name = $el.getAttribute('name');
		
		
		if (name && this.attr.visible !== name) {
			this.attr.visible = name;
			
			this.emitOut('-tabChanged', name);
		}
	},
	_scrollInto: function($el){
		this
			.scroller
			.scroller
			.scrollToElement($el[0]);
	},
	
	setActive: function(name){
		if (this.attr.visible === name) 
			return;
		
		this.attr.visible = name;

		var $panels = getItems(this, 'panel'),
			$headers = getItems(this, 'header');
			
		var $panel = $panels
			.filter('[name="' + name + '"]');
			
		
		if (this.attr.scrollbar) {
			if ($panel.length == 0) {
				log_error('Panel not found', name);
				return;
			}
			this._scrollInto($panel);
		}
		else {
		
			if ($panel.hasClass('active')) 
				return;
				
			this._hide($panels.filter('.active'));
			this._show($panel);
		}
		
		$headers
			.removeClass('active')
			.filter('[name="' + name + '"]')
			.addClass('active')
			;
	},
	has: function(name){
		return getItems(this, 'panel').filter('[name="'+name+'"]').length !== 0;
	},
	getActiveName: function(){
		return this.attr.visible;
	},
	getList: function(){
		var array = [],
			$panels = getItems(this, 'panel'),
			name;
		
		for (var i = 0, $x, imax = $panels.length; i < imax; i++){
			$x = $panels[i];
			
			name = null;
			
			if ($x.getAttribute) 
				name = $x.getAttribute('name');
			
			if (!name) 
				name = $x.attr && $x.attr.name;
			
			array.push(name);
		}
		return array;
	}
});