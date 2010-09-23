/**
 * JW Player display component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	_css = jwplayer.html5.utils.css;
	
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
		var _api = api;
		var _display = {};
		var _width;
		var _height;
		var _degreesRotated;
		var _rotationInterval;
		var _bufferRotation = _api.skin.getComponentSettings("display").bufferrotation === undefined ? 15 : parseInt(_api.skin.getComponentSettings("display").bufferrotation, 10);
		var _bufferInterval = _api.skin.getComponentSettings("display").bufferinterval === undefined ? 100 : parseInt(_api.skin.getComponentSettings("display").bufferinterval, 10);
		var _elements = {
			display: {
				style: {
					cursor: "pointer"
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
					display: "block",
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
			_display.display_image = createElement("div", "display_image");
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
				width: (width - 10)
			});
			_css(_display.display_image, {
				width: width,
				height: height
			});
			_css(_display.display_iconBackground, {
				top: ((_height - _api.skin.getSkinElement("display", "background").height) / 2),
				left: ((_width - _api.skin.getSkinElement("display", "background").width) / 2)
			});
			_stateHandler({});
		};
		
		function createElement(tag, element) {
			var _element = document.createElement(tag);
			_element.id = _api.id + "_jwplayer_" + element;
			_css(_element, _elements[element].style);
			return _element;
		}
		
		
		function _setupDisplayElements() {
			for (var element in _display) {
				if (_elements[element].click !== undefined) {
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
			_show(_display.display_iconBackground);
			_display.display_icon.style.backgroundImage = (["url(", _api.skin.getSkinElement("display", newIcon).src, ")"]).join("");
			_css(_display.display_icon, {
				display: "block",
				width: _api.skin.getSkinElement("display", newIcon).width,
				height: _api.skin.getSkinElement("display", newIcon).height,
				top: (_api.skin.getSkinElement("display", "background").height - _api.skin.getSkinElement("display", newIcon).height) / 2,
				left: (_api.skin.getSkinElement("display", "background").width - _api.skin.getSkinElement("display", newIcon).width) / 2
			});
			if (_api.skin.getSkinElement("display", newIcon + "Over") !== undefined) {
				_display.display_icon.onmouseover = function(evt) {
					evt.stopPropagation();
					_display.display_icon.style.backgroundImage = ["url(", _api.skin.getSkinElement("display", newIcon + "Over").src, ")"].join("");
				};
				_display.display_icon.onmouseout = function(evt) {
					evt.stopPropagation();
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
		
		function _errorHandler(evt){
			_hideDisplayIcon();
			_display.display_text.innerHTML = evt.error;
			_show(_display.display_text);
			_display.display_text.style.top = ((_height -  _display.display_text.getBoundingClientRect().height) / 2) + "px";
		}
		
		function _stateHandler(evt) {
			_hide(_display.display_text);
			if (_rotationInterval !== undefined) {
				clearInterval(_rotationInterval);
				_rotationInterval = null;
				jwplayer.html5.utils.animations.rotate(_display.display_icon, 0);
			}
			switch (_api.jwGetState()) {
				case jwplayer.api.events.state.BUFFERING:
					_setDisplayIcon("bufferIcon");
					_degreesRotated = 0;
					_rotationInterval = setInterval(function() {
						_degreesRotated += _bufferRotation;
						jwplayer.html5.utils.animations.rotate(_display.display_icon, _degreesRotated % 360);
					}, _bufferInterval);
					_setDisplayIcon("bufferIcon");
					break;
				case jwplayer.api.events.state.PAUSED:
					_css(_display.display_image, {
						background: "transparent no-repeat center center"
					});
					_show(_display.display_iconBackground);
					_setDisplayIcon("playIcon");
					break;
				case jwplayer.api.events.state.IDLE:
					var background = _api.jwGetPlaylist()[_api.jwGetItem()].image === "" ? "" : " url(" + jwplayer.html5.utils.getAbsolutePath(_api.jwGetPlaylist()[_api.jwGetItem()].image) + ")";
					_css(_display.display_image, {
						background: background + " no-repeat center center"
					});
					_show(_display.display_iconBackground);
					_setDisplayIcon("playIcon");
					break;
				default:
					if (_api.jwGetMute()) {
						_css(_display.display_image, {
							background: "transparent no-repeat center center"
						});
						_show(_display.display_iconBackground);
						_setDisplayIcon("muteIcon");
						
					} else {
						_css(_display.display_image, {
							background: "transparent no-repeat center center"
						});
						_hide(_display.display_iconBackground);
						_hide(_display.display_icon);
					}
					break;
			}
		}
		
		return this;
	};
	
	
	
})(jwplayer);
