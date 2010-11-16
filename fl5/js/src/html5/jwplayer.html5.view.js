/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _css = jwplayer.html5.utils.css;
	
	jwplayer.html5.view = function(api, container, model) {
		var _api = api;
		var _container = container;
		var _model = model;
		var _wrapper;
		var _width;
		var _height;
		var _box;
		var _zIndex;
		var _resizeInterval;
		
		function createWrapper() {
			_wrapper = document.createElement("div");
			_wrapper.id = _container.id;
			_wrapper.className = _container.className;
			_container.id = _wrapper.id + "_video";
			
			_css(_wrapper, {
				position: "relative",
				height: _model.height,
				width: _model.width,
				padding: 0,
				backgroundColor: getBackgroundColor(),
				zIndex: 0
			});
			
			function getBackgroundColor() {
				if (_api.skin.getComponentSettings("display") && _api.skin.getComponentSettings("display").backgroundcolor) {
					return _api.skin.getComponentSettings("display").backgroundcolor;
				}
				return parseInt("000000", 16);
			}
			
			_css(_container, {
				position: "absolute",
				width: _model.width,
				height: _model.height,
				top: 0,
				left: 0,
				zIndex: 1,
				margin: "auto",
				display: "block"
			});
			
			jwplayer.utils.wrap(_container, _wrapper);
			
			_box = document.createElement("div");
			_box.id = _wrapper.id + "_displayarea";
			_wrapper.appendChild(_box);
		}
		
		function layoutComponents() {
			for (var pluginIndex = 0; pluginIndex < _model.plugins.order.length; pluginIndex++) {
				var pluginName = _model.plugins.order[pluginIndex];
				if (_model.plugins.object[pluginName].getDisplayElement !== undefined) {
					_model.plugins.object[pluginName].height = getNumber(_model.plugins.object[pluginName].getDisplayElement().style.height);
					_model.plugins.object[pluginName].width = getNumber(_model.plugins.object[pluginName].getDisplayElement().style.width);
					_model.plugins.config[pluginName].currentPosition = _model.plugins.config[pluginName].position;
				}
			}
			_loadedHandler();
		}
		
		function _loadedHandler(evt) {
			if (_model.getMedia() !== undefined) {
				for (var pluginIndex = 0; pluginIndex < _model.plugins.order.length; pluginIndex++) {
					var pluginName = _model.plugins.order[pluginIndex];
					if (_model.plugins.object[pluginName].getDisplayElement !== undefined) {
						if (_model.config.chromeless || _model.getMedia().hasChrome()) {
							_model.plugins.config[pluginName].currentPosition = jwplayer.html5.view.positions.NONE;
						} else {
							_model.plugins.config[pluginName].currentPosition = _model.plugins.config[pluginName].position;
						}
					}
				}
			}
			_resize(_model.width, _model.height);
		}
		
		function getNumber(style) {
			if (typeof style == "number") {
				return style;
			}
			if (style === "") {
				return 0;
			}
			return parseInt(style.replace("px", ""), 10);
		}
		
		function setResizeInterval() {
			_resizeInterval = setInterval(function() {
				if (_wrapper.width && _wrapper.height && (_model.width !== getNumber(_wrapper.width) || _model.height !== getNumber(_wrapper.height))) {
					_resize(getNumber(_wrapper.width), getNumber(_wrapper.height));
				} else {
					var rect = _wrapper.getBoundingClientRect();
					if (_model.width !== rect.width || _model.height !== rect.height) {
						_resize(rect.width, rect.height);
					}
					delete rect;
				}
			}, 100);
		}
		
		this.setup = function(container) {
			_container = container;
			createWrapper();
			layoutComponents();
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_LOADED, _loadedHandler);
			setResizeInterval();
			var oldresize;
			if (window.onresize !== null) {
				oldresize = window.onresize;
			}
			window.onresize = function(evt) {
				if (oldresize !== undefined) {
					try {
						oldresize(evt);
					} catch (err) {
					
					}
				}
				if (_api.jwGetFullscreen()) {
					// TODO: [ticket:1057]
					_model.width = window.innerWidth;
					_model.height = window.innerHeight;
				}
				_resize(_model.width, _model.height);
			};
		};
		
		function _keyHandler(evt) {
			switch (evt.keyCode) {
				case 27:
					if (_api.jwGetFullscreen()) {
						_api.jwSetFullscreen(false);
					}
					break;
				case 32:
					// For spacebar. Not sure what to do when there are multiple players
					if (_api.jwGetState() != jwplayer.api.events.state.IDLE && _api.jwGetState() != jwplayer.api.events.state.PAUSED) {
						_api.jwPause();
					} else {
						_api.jwPlay();
					}
					break;
			}
		}
		
		function _resize(width, height) {
			if (_wrapper.style.display == "none") {
				return;
			}
			var plugins = [].concat(_model.plugins.order);
			plugins.reverse();
			_zIndex = plugins.length + 2;
			if (!_model.fullscreen) {
				_model.width = width;
				_model.height = height;
				_width = width;
				_height = height;
				_css(_box, {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					width: width,
					height: height
				});
				_css(_wrapper, {
					height: _height,
					width: _width
				});
				var failed = _resizeComponents(_normalscreenComponentResizer, plugins);
				if (failed.length > 0) {
					_zIndex += failed.length;
					_resizeComponents(_overlayComponentResizer, failed, true);
				}
				_resizeMedia();
			} else {
				_resizeComponents(_fullscreenComponentResizer, plugins, true);
			}
		}
		
		function _resizeComponents(componentResizer, plugins, sizeToBox) {
			var failed = [];
			for (var pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
				var pluginName = plugins[pluginIndex];
				if (_model.plugins.object[pluginName].getDisplayElement !== undefined) {
					if (_model.plugins.config[pluginName].currentPosition.toUpperCase() !== jwplayer.html5.view.positions.NONE) {
						var style = componentResizer(pluginName, _zIndex--);
						if (!style) {
							failed.push(pluginName);
						} else {
							_model.plugins.object[pluginName].resize(style.width, style.height);
							if (sizeToBox) {
								delete style.width;
								delete style.height;
							}
							_css(_model.plugins.object[pluginName].getDisplayElement(), style);
						}
					} else {
						_css(_model.plugins.object[pluginName].getDisplayElement(), {
							display: "none"
						});
					}
				}
			}
			return failed;
		}
		
		function _normalscreenComponentResizer(pluginName, zIndex) {
			if (_model.plugins.object[pluginName].getDisplayElement !== undefined) {
				if (_hasPosition(_model.plugins.config[pluginName].position)) {
					if (_model.plugins.object[pluginName].getDisplayElement().parentNode === null) {
						_wrapper.appendChild(_model.plugins.object[pluginName].getDisplayElement());
					}
					var style = _getComponentPosition(pluginName);
					style.zIndex = zIndex;
					return style;
				}
			}
			return false;
		}
		
		function _overlayComponentResizer(pluginName, zIndex) {
			if (_model.plugins.object[pluginName].getDisplayElement().parentNode === null) {
				_box.appendChild(_model.plugins.object[pluginName].getDisplayElement());
			}
			return {
				position: "absolute",
				width: (_model.width - getNumber(_box.style.left) - getNumber(_box.style.right)),
				height: (_model.height - getNumber(_box.style.top) - getNumber(_box.style.bottom)),
				zIndex: zIndex
			};
		}
		
		function _fullscreenComponentResizer(pluginName, zIndex) {
			return {
				position: "fixed",
				width: _model.width,
				height: _model.height,
				zIndex: zIndex
			};
		}
		
		function _resizeMedia() {
			//TODO: [ticket:1104]
			_box.style.position = "absolute";
			var style = {
				position: "absolute",
				width: getNumber(_box.style.width),
				height: getNumber(_box.style.height),
				top: getNumber(_box.style.top),
				left: getNumber(_box.style.left)
			};
			_css(_model.getMedia().getDisplayElement(), style);
		}
		
		function _getComponentPosition(pluginName) {
			var plugincss = {
				position: "absolute",
				margin: 0,
				padding: 0,
				top: null
			};
			var position = _model.plugins.config[pluginName].currentPosition.toLowerCase();
			switch (position.toUpperCase()) {
				case jwplayer.html5.view.positions.TOP:
					plugincss.top = getNumber(_box.style.top);
					plugincss.left = getNumber(_box.style.left);
					plugincss.width = _width - getNumber(_box.style.left) - getNumber(_box.style.right);
					plugincss.height = _model.plugins.object[pluginName].height;
					_box.style[position] = getNumber(_box.style[position]) + _model.plugins.object[pluginName].height + "px";
					_box.style.height = getNumber(_box.style.height) - plugincss.height + "px";
					break;
				case jwplayer.html5.view.positions.RIGHT:
					plugincss.top = getNumber(_box.style.top);
					plugincss.right = getNumber(_box.style.right);
					plugincss.width = plugincss.width = _model.plugins.object[pluginName].width;
					plugincss.height = _height - getNumber(_box.style.top) - getNumber(_box.style.bottom);
					_box.style[position] = getNumber(_box.style[position]) + _model.plugins.object[pluginName].width + "px";
					_box.style.width = getNumber(_box.style.width) - plugincss.width + "px";
					break;
				case jwplayer.html5.view.positions.BOTTOM:
					plugincss.bottom = getNumber(_box.style.bottom);
					plugincss.left = getNumber(_box.style.left);
					plugincss.width = _width - getNumber(_box.style.left) - getNumber(_box.style.right);
					plugincss.height = _model.plugins.object[pluginName].height;
					_box.style[position] = getNumber(_box.style[position]) + _model.plugins.object[pluginName].height + "px";
					_box.style.height = getNumber(_box.style.height) - plugincss.height + "px";
					break;
				case jwplayer.html5.view.positions.LEFT:
					plugincss.top = getNumber(_box.style.top);
					plugincss.left = getNumber(_box.style.left);
					plugincss.width = _model.plugins.object[pluginName].width;
					plugincss.height = _height - getNumber(_box.style.top) - getNumber(_box.style.bottom);
					_box.style[position] = getNumber(_box.style[position]) + _model.plugins.object[pluginName].width + "px";
					_box.style.width = getNumber(_box.style.width) - plugincss.width + "px";
					break;
				default:
					break;
			}
			return plugincss;
		}
		
		
		this.resize = _resize;
		
		this.fullscreen = function(state) {
			if (navigator.vendor.indexOf("Apple") === 0) {
				if (_model.getMedia().getDisplayElement().webkitSupportsFullscreen) {
					if (state) {
						_model.fullscreen = false;
						_model.getMedia().getDisplayElement().webkitEnterFullscreen();
					} else {
						_model.getMedia().getDisplayElement().webkitExitFullscreen();
					}
				} else {
					_model.fullscreen = false;
				}
			} else {
				if (state) {
					document.onkeydown = _keyHandler;
					clearInterval(_resizeInterval);
					// TODO: [ticket:1057]
					_model.width = window.innerWidth;
					_model.height = window.innerHeight;
					var style = {
						position: "fixed",
						width: "100%",
						height: "100%",
						top: 0,
						left: 0,
						zIndex: 2147483000
					};
					_css(_wrapper, style);
					style.zIndex = 1;
					_css(_model.getMedia().getDisplayElement(), style);
					style.zIndex = 2;
					_css(_box, style);
				} else {
					document.onkeydown = "";
					setResizeInterval();
					_model.width = _width;
					_model.height = _height;
					_css(_wrapper, {
						position: "relative",
						height: _model.height,
						width: _model.width,
						zIndex: 0
					});
				}
				_resize(_model.width, _model.height);
			}
		};
		
	};
	
	function _hasPosition(position) {
		return ([jwplayer.html5.view.positions.TOP, jwplayer.html5.view.positions.RIGHT, jwplayer.html5.view.positions.BOTTOM, jwplayer.html5.view.positions.LEFT].indexOf(position.toUpperCase()) > -1);
	}
	
	jwplayer.html5.view.positions = {
		TOP: "TOP",
		RIGHT: "RIGHT",
		BOTTOM: "BOTTOM",
		LEFT: "LEFT",
		OVER: "OVER",
		NONE: "NONE"
	};
})(jwplayer);
