/**
 * JW Player view component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	var _utils = jwplayer.utils;
	var _css = _utils.css;
	
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
		var _media;
		var _falseFullscreen = false;
		
		function createWrapper() {
			_wrapper = document.createElement("div");
			_wrapper.id = _container.id;
			_wrapper.className = _container.className;
			_videowrapper = document.createElement("div");
			_videowrapper.id = _wrapper.id + "_video_wrapper";
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
//				width: _model.width,
//				height: _model.height,
				width: "100%",
				height: "100%",
				top: 0,
				left: 0,
				zIndex: 1,
				margin: "auto",
				display: "block"
			});
			
			_css(_videowrapper, {
				overflow: "hidden",
				position: "absolute",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0
			});
			
			_utils.wrap(_container, _wrapper);
			_utils.wrap(_container, _videowrapper);
			
			_box = document.createElement("div");
			_box.id = _wrapper.id + "_displayarea";
			_wrapper.appendChild(_box);
		}
		
		function layoutComponents() {
			for (var pluginIndex = 0; pluginIndex < _model.plugins.order.length; pluginIndex++) {
				var pluginName = _model.plugins.order[pluginIndex];
				if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
					_model.plugins.object[pluginName].height = _utils.parseDimension(_model.plugins.object[pluginName].getDisplayElement().style.height);
					_model.plugins.object[pluginName].width = _utils.parseDimension(_model.plugins.object[pluginName].getDisplayElement().style.width);
					_model.plugins.config[pluginName].currentPosition = _model.plugins.config[pluginName].position;
				}
			}
			_loadedHandler();
		}
		
		function _stateHandler(evt) {
			_css(_box, {
				display: (_model.getMedia() && _model.getMedia().hasChrome()) ? "none" : "block"
			});
		}

		function _loadedHandler(evt) {
			var newMedia = _model.getMedia() ? _model.getMedia().getDisplayElement() : null;
			
			if (_utils.exists(newMedia)) {
				if (_media != newMedia) {
					if (_media && _media.parentNode) {
						_media.parentNode.replaceChild(newMedia, _media);
					}
					_media = newMedia;
				}
				for (var pluginIndex = 0; pluginIndex < _model.plugins.order.length; pluginIndex++) {
					var pluginName = _model.plugins.order[pluginIndex];
					if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
						_model.plugins.config[pluginName].currentPosition = _model.plugins.config[pluginName].position;
					}
				}
			}
			_resize(_model.width, _model.height);
		}
		
		this.setup = function() {
			if (_model && _model.getMedia()) {
				_container = _model.getMedia().getDisplayElement();
			}
			createWrapper();
			layoutComponents();
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_LOADED, _loadedHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, function() {
				_resizeMedia();
			});
			var oldresize;
			if (_utils.exists(window.onresize)) {
				oldresize = window.onresize;
			}
			window.onresize = function(evt) {
				if (_utils.exists(oldresize)) {
					try {
						oldresize(evt);
					} catch (err) {
					
					}
				}
				if (_api.jwGetFullscreen()) {
					var rect = document.body.getBoundingClientRect();
					_model.width = Math.abs(rect.left) + Math.abs(rect.right);
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
				if (typeof width == "string" && width.indexOf("%")) {
					_width = _wrapper.parentElement.clientWidth * parseInt(width.replace("%"),"") / 100;
				} else {
					_width = width;
				}
				if (typeof height == "string" && height.indexOf("%")) {
					_height = _wrapper.parentElement.clientHeight * parseInt(height.replace("%"),"") / 100;
				} else {
					_height = height;
				}
				_css(_box, {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					width: "100%",
					height: "100%",
					position: "absolute"
				});
				_css(_wrapper, {
					height: _height,
					width: _width
				});
				var failed = _resizeComponents(_normalscreenComponentResizer, plugins);
				if (failed.length > 0) {
					_zIndex += failed.length;
					var plIndex = failed.indexOf("playlist"),
						cbIndex = failed.indexOf("controlbar");
					if (plIndex >= 0 && cbIndex >= 0) {
						// Reverse order of controlbar and playlist when both are set to "over"
						failed[plIndex] = failed.splice(cbIndex, 1, failed[plIndex])[0];
					}
					_resizeComponents(_overlayComponentResizer, failed, true);
				}
			} else if ( !_useNativeFullscreen() ) {
				_resizeComponents(_fullscreenComponentResizer, plugins, true);
			}
			_resizeMedia();
		}
		
		function _resizeComponents(componentResizer, plugins, sizeToBox) {
			var failed = [];
			for (var pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
				var pluginName = plugins[pluginIndex];
				if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
					if (_model.plugins.config[pluginName].currentPosition != jwplayer.html5.view.positions.NONE) {
						var style = componentResizer(pluginName, _zIndex--);
						if (!style) {
							failed.push(pluginName);
						} else {
							var width = style.width;
							var height = style.height;
							if (sizeToBox) {
								delete style.width;
								delete style.height;
							}
							_css(_model.plugins.object[pluginName].getDisplayElement(), style);
							_model.plugins.object[pluginName].resize(width, height);
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
			if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
				if (_model.plugins.config[pluginName].position && _hasPosition(_model.plugins.config[pluginName].position)) {
					if (!_utils.exists(_model.plugins.object[pluginName].getDisplayElement().parentNode)) {
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
			if (!_utils.exists(_model.plugins.object[pluginName].getDisplayElement().parentNode)) {
				_box.appendChild(_model.plugins.object[pluginName].getDisplayElement());
			}
//			var _iwidth = _model.width, 
//				_iheight = _model.height, 
//				percentage;
//			if (typeof _model.width == "string" && _model.width.lastIndexOf("%") > -1) {
//				percentage = parseFloat(_model.width.substring(0, _model.width.lastIndexOf("%"))) / 100;
//				_iwidth = Math.round(_wrapper.clientWidth * percentage);
//			}
//			
//			if (typeof _model.height == "string" && _model.height.lastIndexOf("%") > -1) {
//				percentage = parseFloat(_model.height.substring(0, _model.height.lastIndexOf("%"))) / 100;
//				_iheight = Math.round(_wrapper.clientHeight * percentage);
//			}
			return {
				position: "absolute",
				width: (_wrapper.clientWidth - _utils.parseDimension(_box.style.left) - _utils.parseDimension(_box.style.right)),
				height: (_wrapper.clientHeight - _utils.parseDimension(_box.style.top) - _utils.parseDimension(_box.style.bottom)),
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
			if (!_utils.exists(_model.getMedia())) {
				return;
			}
			_box.style.position = "absolute";
			var media = _model.getMedia().getDisplayElement();
			if (media && media.tagName.toLowerCase() == "video") {
				media.style.position = "absolute";
				if (media.parentNode) {
					media.parentNode.style.left = _box.style.left;
					media.parentNode.style.top = _box.style.top;
				}
				_utils.stretch(_api.jwGetStretching(), media, _box.clientWidth, _box.clientHeight, 
						media.videoWidth ? media.videoWidth : 400, 
						media.videoHeight ? media.videoHeight : 300);
			} else {
				var display = _model.plugins.object['display'].getDisplayElement();
				if(display) {
					_model.getMedia().resize(_utils.parseDimension(display.style.width), _utils.parseDimension(display.style.height));
				} else {
					_model.getMedia().resize(_utils.parseDimension(_box.style.width), _utils.parseDimension(_box.style.height));
				}
			}
		}
		
		function _getComponentPosition(pluginName) {
			var plugincss = {
				position: "absolute",
				margin: 0,
				padding: 0,
				top: null
			};
			// Not a code error - toLowerCase is needed for the CSS position
			var position = _model.plugins.config[pluginName].currentPosition.toLowerCase();
			switch (position.toUpperCase()) {
				case jwplayer.html5.view.positions.TOP:
					plugincss.top = _utils.parseDimension(_box.style.top);
					plugincss.left = _utils.parseDimension(_box.style.left);
					plugincss.width = _width - _utils.parseDimension(_box.style.left) - _utils.parseDimension(_box.style.right);
					plugincss.height = _model.plugins.object[pluginName].height;
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].height + "px";
					_box.style.height = _utils.parseDimension(_box.style.height) - plugincss.height + "px";
					break;
				case jwplayer.html5.view.positions.RIGHT:
					plugincss.top = _utils.parseDimension(_box.style.top);
					plugincss.right = _utils.parseDimension(_box.style.right);
					plugincss.width = _model.plugins.object[pluginName].width;
					plugincss.height = _height - _utils.parseDimension(_box.style.top) - _utils.parseDimension(_box.style.bottom);
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].width + "px";
					_box.style.width = _utils.parseDimension(_box.style.width) - plugincss.width + "px";
					break;
				case jwplayer.html5.view.positions.BOTTOM:
					plugincss.bottom = _utils.parseDimension(_box.style.bottom);
					plugincss.left = _utils.parseDimension(_box.style.left);
					plugincss.width = _width - _utils.parseDimension(_box.style.left) - _utils.parseDimension(_box.style.right);
					plugincss.height = _model.plugins.object[pluginName].height;
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].height + "px";
					_box.style.height = _utils.parseDimension(_box.style.height) - plugincss.height + "px";
					break;
				case jwplayer.html5.view.positions.LEFT:
					plugincss.top = _utils.parseDimension(_box.style.top);
					plugincss.left = _utils.parseDimension(_box.style.left);
					plugincss.width = _model.plugins.object[pluginName].width;
					plugincss.height = _height - _utils.parseDimension(_box.style.top) - _utils.parseDimension(_box.style.bottom);
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].width + "px";
					_box.style.width = _utils.parseDimension(_box.style.width) - plugincss.width + "px";
					break;
				default:
					break;
			}
			return plugincss;
		}
		
		
		this.resize = _resize;
		
		this.fullscreen = function(state) {
			if (_useNativeFullscreen()) {
				var videotag;
				try {
					videotag = _model.getMedia().getDisplayElement();
				} catch(e) {}
				
				if (videotag && videotag.webkitSupportsFullscreen) {
					if (state && !videotag.webkitDisplayingFullscreen) {
						try {
							videotag.webkitEnterFullscreen();
						} catch (err) {
						}
					} else if (!state && videotag.webkitDisplayingFullscreen) {
						try {
							videotag.webkitExitFullscreen();
						} catch (err) {
						}
					}
				}
				_falseFullscreen = false;
			} else {
				if (state) {
					document.onkeydown = _keyHandler;
					clearInterval(_resizeInterval);
					var rect = document.body.getBoundingClientRect();
					_model.width = Math.abs(rect.left) + Math.abs(rect.right);
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
					if (_model.getMedia() && _model.getMedia().getDisplayElement()) {
						_css(_model.getMedia().getDisplayElement(), style);
					}
					style.zIndex = 2;
					_css(_box, style);
					_falseFullscreen = true;
				} else {
					document.onkeydown = "";
					_model.width = _width;
					_model.height = _height;
					_css(_wrapper, {
						position: "relative",
						height: _model.height,
						width: _model.width,
						zIndex: 0
					});
					_falseFullscreen = false;
				}
				_resize(_model.width, _model.height);
			}
		};
		
		function _hasPosition(position) {
			return ([jwplayer.html5.view.positions.TOP, jwplayer.html5.view.positions.RIGHT, jwplayer.html5.view.positions.BOTTOM, jwplayer.html5.view.positions.LEFT].toString().indexOf(position.toUpperCase()) > -1);
		}
		
		function _useNativeFullscreen() {
			if (_api.jwGetState() != jwplayer.api.events.state.IDLE
					&& !_falseFullscreen
					&& navigator 
					&& navigator.vendor 
					&& navigator.vendor.indexOf("Apple") == 0) {
				 return true;
			}
			
			return false;
		}
		
	};
	
	
	//TODO: Enum
	jwplayer.html5.view.positions = {
		TOP: "TOP",
		RIGHT: "RIGHT",
		BOTTOM: "BOTTOM",
		LEFT: "LEFT",
		OVER: "OVER",
		NONE: "NONE"
	};
})(jwplayer);
