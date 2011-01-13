/**
 * JW Player dock component
 */
(function(jwplayer) {
	jwplayer.html5.logo = function(api, config) {
		// TODO: Config parser needs to move dock to dock.align
		var defaults = {
			align: jwplayer.html5.view.positions.RIGHT
		};
		
		var _buttons = {};
		var _buttonArray = [];
		var _width;
		var _height;
		
		var _dock = document.createElement("div");
		
		this.getDisplayElement = function() {
			return _logo;
		};
		
		this.setButton = function(id, handler, outGraphic, overGraphic) {
			if (!handler && _buttons[id]) {
				jwplayer.utils.arrays.remove(_buttonArray, id);
				delete _buttons[id];
			} else {
				if (!_buttons[id]) {
					_buttonArray.push(id);
				}
				_buttons[id] = {
					handler: handler,
					outGraphic: outGraphic,
					overGraphic: overGraphic
				}
			}
			
			_resize(_width, _height);
		}
		
		function _resize(width, height) {
			_width = width;
			_height = height;
			
			if (buttonArray.length > 0) {
				var margin = 10;
				var xStart = width - buttons[0].width - margin;
				var usedHeight = margin;
				var direction = -1;
				if (getConfigParam('position') == 'left') {
					direction = 1;
					xStart = margin;
				}
				for (var i = 0; i < buttonArray.length; i++) {
					var row = Math.floor(usedHeight / height);
					if ((usedHeight + buttons[i].height + margin) > ((row + 1) * height)) {
						usedHeight = ((row + 1) * height) + margin;
						row = Math.floor(usedHeight / height);
					}
					buttons[i].y = usedHeight % height;
					buttons[i].x = xStart + (buttons[i].width + margin) * row * direction;
					usedHeight += buttons[i].height + margin;
					//(buttons[i] as DockButton).centerText();
				}
			}
		}
		
		this.resize = _resize;
		
		return this;
	}
})(jwplayer);
