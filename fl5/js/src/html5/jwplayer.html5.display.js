/**
 * JW Player display component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {
	_utils = jwplayer.utils;
	_css = _utils.css;
	
	_hide = function(element) {
		_css(element, {
			display: "none"
		});
	};
	
	_show = function(element) {
		_css(element, {
			display: "block"
		});
	};
	
	jwplayer.html5.display = function(api, config) {
		var _defaults = {
			icons: true
		}
		var _config = _utils.extend({}, _defaults, config);
		var _api = api;
		var _display = {};
		var _width;
		var _height;
		var _imageWidth;
		var _imageHeight;
		var _degreesRotated;
		var _rotationInterval;
		var _error;
		var _bufferRotation = !_utils.exists(_api.skin.getComponentSettings("display").bufferrotation) ? 15 : parseInt(_api.skin.getComponentSettings("display").bufferrotation, 10);
		var _bufferInterval = !_utils.exists(_api.skin.getComponentSettings("display").bufferinterval) ? 100 : parseInt(_api.skin.getComponentSettings("display").bufferinterval, 10);
		var _updateTimeout = -1;
		var _lastState = "";
		var _showing = true;
		var _elements = {
			display: {
				style: {
					cursor: "pointer",
					top: 0,
					left: 0,
					overflow: "hidden"
				},
				click: _displayClickHandler
			},
			display_icon: {
				style: {
					cursor: "pointer",
					position: "absolute",
					top: ((_api.skin.getSkinElement("display", "background").height - _api.skin.getSkinElement("display", "playIcon").height) / 2),
					left: ((_api.skin.getSkinElement("display", "background").width - _api.skin.getSkinElement("display", "playIcon").width) / 2),
					border: 0,
					margin: 0,
					padding: 0,
					zIndex: 3
				}
			},
			display_iconBackground: {
				style: {
					cursor: "pointer",
					position: "absolute",
					top: ((_height - _api.skin.getSkinElement("display", "background").height) / 2),
					left: ((_width - _api.skin.getSkinElement("display", "background").width) / 2),
					border: 0,
					backgroundImage: (["url(", _api.skin.getSkinElement("display", "background").src, ")"]).join(""),
					width: _api.skin.getSkinElement("display", "background").width,
					height: _api.skin.getSkinElement("display", "background").height,
					margin: 0,
					padding: 0,
					zIndex: 2
				}
			},
			display_image: {
				style: {
					display: "none",
					width: _width,
					height: _height,
					position: "absolute",
					cursor: "pointer",
					left: 0,
					top: 0,
					margin: 0,
					padding: 0,
					textDecoration: "none",
					zIndex: 1
				}
			},
			display_text: {
				style: {
					zIndex: 4,
					position: "relative",
					opacity: 0.8,
					backgroundColor: parseInt("000000", 16),
					color: parseInt("ffffff", 16),
					textAlign: "center",
					fontFamily: "Arial,sans-serif",
					padding: "0 5px",
					fontSize: 14
				}
			}
		};
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _stateHandler);
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _stateHandler);
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_ERROR, _errorHandler);
		_setupDisplay();
		
		function _setupDisplay() {
			_display.display = createElement("div", "display");
			_display.display_text = createElement("div", "display_text");
			_display.display.appendChild(_display.display_text);
			_display.display_image = createElement("img", "display_image");
			_display.display_image.onerror = function(evt) {
				_hide(_display.display_image);
			};
			_display.display_image.onload = _onImageLoad;
			_display.display_icon = createElement("div", "display_icon");
			_display.display_iconBackground = createElement("div", "display_iconBackground");
			_display.display.appendChild(_display.display_image);
			_display.display_iconBackground.appendChild(_display.display_icon);
			_display.display.appendChild(_display.display_iconBackground);
			_setupDisplayElements();
		}
		
		
		this.getDisplayElement = function() {
			return _display.display;
		};
		
		this.resize = function(width, height) {
			_width = width;
			_height = height;
			_css(_display.display, {
				width: width,
				height: height
			});
			_css(_display.display_text, {
				width: (width - 10),
				top: ((_height - _display.display_text.getBoundingClientRect().height) / 2)
			});
			_css(_display.display_iconBackground, {
				top: ((_height - _api.skin.getSkinElement("display", "background").height) / 2),
				left: ((_width - _api.skin.getSkinElement("display", "background").width) / 2)
			});
			_stretch();
			_stateHandler({});
		};
		
		this.show = function() {
			_show(_display.display_icon);
			_show(_display.display_iconBackground);
		}

		this.hide = function() {
			_hideDisplayIcon();
		}

		function _onImageLoad(evt) {
			_imageWidth = _display.display_image.naturalWidth;
			_imageHeight = _display.display_image.naturalHeight;
			_stretch();
		}
		
		function _stretch() {
			_utils.stretch(_api.jwGetStretching(), _display.display_image, _width, _height, _imageWidth, _imageHeight);
		};
		
		function createElement(tag, element) {
			var _element = document.createElement(tag);
			_element.id = _api.id + "_jwplayer_" + element;
			_css(_element, _elements[element].style);
			return _element;
		}
		
		
		function _setupDisplayElements() {
			for (var element in _display) {
				if (_utils.exists(_elements[element].click)) {
					_display[element].onclick = _elements[element].click;
				}
			}
		}
		
		
		function _displayClickHandler(evt) {
			if (typeof evt.preventDefault != "undefined") {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (_api.jwGetState() != jwplayer.api.events.state.PLAYING) {
				_api.jwPlay();
			} else {
				_api.jwPause();
			}
		}
		
		
		function _setDisplayIcon(newIcon) {
			if (_error || !_config.icons) {
				_hideDisplayIcon();
				return;
			}
			_show(_display.display_iconBackground);
			_display.display_icon.style.backgroundImage = (["url(", _api.skin.getSkinElement("display", newIcon).src, ")"]).join("");
			_css(_display.display_icon, {
				display: "block",
				width: _api.skin.getSkinElement("display", newIcon).width,
				height: _api.skin.getSkinElement("display", newIcon).height,
				top: (_api.skin.getSkinElement("display", "background").height - _api.skin.getSkinElement("display", newIcon).height) / 2,
				left: (_api.skin.getSkinElement("display", "background").width - _api.skin.getSkinElement("display", newIcon).width) / 2
			});
			if (_utils.exists(_api.skin.getSkinElement("display", newIcon + "Over"))) {
				_display.display_icon.onmouseover = function(evt) {
					_display.display_icon.style.backgroundImage = ["url(", _api.skin.getSkinElement("display", newIcon + "Over").src, ")"].join("");
				};
				_display.display_icon.onmouseout = function(evt) {
					_display.display_icon.style.backgroundImage = ["url(", _api.skin.getSkinElement("display", newIcon).src, ")"].join("");
				};
			} else {
				_display.display_icon.onmouseover = null;
				_display.display_icon.onmouseout = null;
			}
		}
		
		function _hideDisplayIcon() {
			_hide(_display.display_icon);
			_hide(_display.display_iconBackground);
		}
		
		function _errorHandler(evt) {
			_error = true;
			_hideDisplayIcon();
			_display.display_text.innerHTML = evt.error;
			_show(_display.display_text);
			_display.display_text.style.top = ((_height - _display.display_text.getBoundingClientRect().height) / 2) + "px";
		}
		
		function _resetPoster() {
			/*
			var oldDisplayImage = _display.display_image;
			_display.display_image = createElement("img", "display_image");
			_display.display_image.onerror = function(evt) {
				_hide(_display.display_image);
			};
			_display.display_image.onload = _onImageLoad;
			_display.display.replaceChild(_display.display_image, oldDisplayImage);
			*/
			_display.display_image.style.display = "none";
		}
		
		function _stateHandler(evt) {
			if ((evt.type == jwplayer.api.events.JWPLAYER_PLAYER_STATE ||
			evt.type == jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM) &&
			_error) {
				_error = false;
				_hide(_display.display_text);
			}
			
			var state = _api.jwGetState();
			if (state == _lastState) {
				return;
			}
			_lastState = state;

			if (_updateTimeout >= 0) {
				clearTimeout(_updateTimeout);
			}

			if (_showing || _api.jwGetState() == jwplayer.api.events.state.PLAYING || _api.jwGetState() == jwplayer.api.events.state.PAUSED) {
				_updateDisplay(_api.jwGetState());
			} else {
				_updateTimeout = setTimeout(_stateCallback(_api.jwGetState()), 300);
			}
		}
		
		function _stateCallback(state) {
			return (function() {
				_updateDisplay(state);
			});
		}
		
		
		function _updateDisplay(state) {
			if (_utils.exists(_rotationInterval)) {
				clearInterval(_rotationInterval);
				_rotationInterval = null;
				_utils.animations.rotate(_display.display_icon, 0);
			}
			switch (state) {
				case jwplayer.api.events.state.BUFFERING:
					if (_utils.isIOS()) {
						_resetPoster();
						_hide(_display.display_iconBackground);
						_hide(_display.display_icon);
					} else {
						if (_api.jwGetPlaylist()[_api.jwGetItem()].provider == "sound") {
							_showImage();
						}
						_degreesRotated = 0;
						_rotationInterval = setInterval(function() {
							_degreesRotated += _bufferRotation;
							_utils.animations.rotate(_display.display_icon, _degreesRotated % 360);
						}, _bufferInterval);
						_setDisplayIcon("bufferIcon");
						_showing = true;
					}
					break;
				case jwplayer.api.events.state.PAUSED:
					if (!_utils.isIOS()) {
						if (_api.jwGetPlaylist()[_api.jwGetItem()].provider != "sound") {
							_css(_display.display_image, {
								background: "transparent no-repeat center center"
							});
						}
						_setDisplayIcon("playIcon");
						_showing = true;
					}
					break;
				case jwplayer.api.events.state.IDLE:
					if (_api.jwGetPlaylist()[_api.jwGetItem()].image) {
						_showImage();
					} else {
						_resetPoster();
					}
					_setDisplayIcon("playIcon");
					_showing = true;
					break;
				default:
					if (_api.jwGetPlaylist()[_api.jwGetItem()].provider == "sound") {
						if (_utils.isIOS()) {
							_resetPoster();
							_showing = false;
						} else {
							_showImage();
						}
					} else {
						_resetPoster();
						_showing = false;
					}
					if (_api.jwGetMute() && _config.showmute) {
						_setDisplayIcon("muteIcon");
					} else {
						_hide(_display.display_iconBackground);
						_hide(_display.display_icon);
					}
					break;
			}
			_updateTimeout = -1;
		}
		
		function _showImage() {
			_css(_display.display_image, {
				display: "block"
			});
			_display.display_image.src = _utils.getAbsolutePath(_api.jwGetPlaylist()[_api.jwGetItem()].image);
		}
		
		return this;
	};
	
	
	
})(jwplayer);
