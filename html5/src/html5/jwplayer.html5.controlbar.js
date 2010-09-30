/**
 * jwplayer controlbar component of the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	/** Map with config for the jwplayerControlbar plugin. **/
	var _defaults = {
		backgroundcolor: "",
		margin: 10,
		//font: "_sans",
		font: "Arial,sans-serif",
		fontsize: 10,
		fontcolor: parseInt("000000", 16),
		fontstyle: "normal",
		//fontweight: "normal",
		fontweight: "bold",
		buttoncolor: parseInt("ffffff", 16),
		position: jwplayer.html5.view.positions.BOTTOM,
		idlehide: false,
		layout: {
			"left": {
				"position": "left",
				"elements": [{
					"name": "play",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "prev",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "next",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "elapsed",
					"type": "text"
				}]
			},
			"center": {
				"position": "center",
				"elements": [{
					"name": "time",
					"type": "slider"
				}]
			},
			"right": {
				"position": "right",
				"elements": [{
					"name": "duration",
					"type": "text"
				}, {
					"name": "blank",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "mute",
					"type": "button"
				}, {
					"name": "volume",
					"type": "slider"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "fullscreen",
					"type": "button"
				}]
			}
		}
	};
	
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
	
	jwplayer.html5.controlbar = function(api, config) {
		var _api = api;
		var _settings = jwplayer.utils.extend({}, _defaults, _api.skin.getComponentSettings("controlbar"), config);
		if (jwplayer.html5.utils.mapLength(_api.skin.getComponentLayout("controlbar")) > 0) {
			_settings.layout = _api.skin.getComponentLayout("controlbar");
		}
		var _wrapper;
		var _dividerid = 0;
		var _marginleft = 0;
		var _marginright = 0;
		var _scrubber = "none";
		var _mousedown;
		var _currentPosition;
		var _currentDuration;
		var _currentBuffer;
		var _width;
		var _height;
		var _prevElement;
		var _elements = {};
		var _ready = false;
		
		
		function _buildBase() {
			var wrappercss = {
				height: _api.skin.getSkinElement("controlbar", "background").height,
				backgroundColor: _settings.backgroundcolor
			};
			
			_wrapper = document.createElement("div");
			_wrapper.id = _api.id + "_jwplayer_controlbar";
			_css(_wrapper, wrappercss);
			
			_addElement("capLeft", "left", false, _wrapper);
			var domelmentcss = {
				position: "absolute",
				height: _api.skin.getSkinElement("controlbar", "background").height,
				background: " url(" + _api.skin.getSkinElement("controlbar", "background").src + ") repeat-x center left",
				left: _api.skin.getSkinElement("controlbar", "capLeft").width
			};
			_appendNewElement("elements", _wrapper, domelmentcss);
			_addElement("capRight", "right", false, _wrapper);
		}
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			if (!_ready && _wrapper.parentElement !== undefined) {
				_ready = true;
				if (_settings.position.toUpperCase() == jwplayer.html5.view.positions.OVER) {
					document.getElementById(_api.id).onmousemove = _fadeOut;
				}
			}
			_width = width;
			_height = height;
			if (_api.jwGetFullscreen()) {
				_show(_elements.normalscreenButton);
				_hide(_elements.fullscreenButton);
			} else {
				_hide(_elements.normalscreenButton);
				_show(_elements.fullscreenButton);
			}
			var style = _resizeBar();
			_timeHandler({
				id: _api.id,
				duration: _currentDuration,
				position: _currentPosition
			});
			_bufferHandler({
				id: _api.id,
				bufferPercent: _currentBuffer
			});
			return style;
		};
		
		function _fadeOut() {
			jwplayer.html5.utils.cancelAnimation(_wrapper);
			if (_settings.idlehide || (_api.jwGetState() != jwplayer.api.events.state.IDLE && _api.jwGetState() != jwplayer.api.events.state.PAUSED)) {
				jwplayer.html5.utils.fadeTo(_wrapper, 0, 0.1, 1, 2);
			}
		}
		
		function _fadeIn() {
			jwplayer.html5.utils.cancelAnimation(_wrapper);
			jwplayer.html5.utils.fadeTo(_wrapper, 1, 0, 1, 0);
		}
		
		function _appendNewElement(id, parent, css) {
			var element = document.createElement("div");
			_elements[id] = element;
			element.id = _wrapper.id + "_" + id;
			parent.appendChild(element);
			if (css !== undefined) {
				_css(element, css);
			}
			return element;
		}
		
		/** Draw the jwplayerControlbar elements. **/
		function _buildElements() {
			_buildGroup(_settings.layout.left);
			_buildGroup(_settings.layout.right, -1);
			_buildGroup(_settings.layout.center);
		}
		
		/** Layout a group of elements**/
		function _buildGroup(group, order) {
			var alignment = group.position == "right" ? "right" : "left";
			var elements = jwplayer.utils.extend([], group.elements);
			if (order !== undefined) {
				elements.reverse();
			}
			for (var i = 0; i < elements.length; i++) {
				_buildElement(elements[i], alignment);
			}
		}
		
		function getNewDivivderId() {
			return _dividerid++;
		}
		
		/** Draw a single element into the jwplayerControlbar. **/
		function _buildElement(element, alignment) {
			var offset, offsetLeft, offsetRight, width, slidercss;
			switch (element.name) {
				case "play":
					_addElement("playButton", alignment, false);
					_addElement("pauseButton", alignment, true);
					_buildHandler("playButton", "jwPlay");
					_buildHandler("pauseButton", "jwPause");
					break;
				case "divider":
					_addElement("divider" + getNewDivivderId(), alignment, true);
					break;
				case "prev":
					if (_api.jwGetPlaylist().length > 1) {
						_addElement("prevButton", alignment, true);
						_buildHandler("prevButton", "jwPlaylistPrev");
					}
					break;
				case "next":
					if (_api.jwGetPlaylist().length > 1) {
						_addElement("nextButton", alignment, true);
						_buildHandler("nextButton", "jwPlaylistNext");
					}
					break;
				case "elapsed":
					_addElement("elapsedText", alignment, true);
					break;
				case "time":
					offsetLeft = _api.skin.getSkinElement("controlbar", "timeSliderCapLeft") === undefined ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
					offsetRight = _api.skin.getSkinElement("controlbar", "timeSliderCapRight") === undefined ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapRight").width;
					offset = alignment == "left" ? offsetLeft : offsetRight;
					width = _api.skin.getSkinElement("controlbar", "timeSliderRail").width + offsetLeft + offsetRight;
					slidercss = {
						height: _api.skin.getSkinElement("controlbar", "background").height,
						position: "absolute",
						top: 0,
						width: width
					};
					slidercss[alignment] = alignment == "left" ? _marginleft : _marginright;
					var _timeslider = _appendNewElement("timeSlider", _elements.elements, slidercss);
					_addElement("timeSliderCapLeft", alignment, true, _timeslider, alignment == "left" ? 0 : offset);
					_addElement("timeSliderRail", alignment, false, _timeslider, offset);
					_addElement("timeSliderBuffer", alignment, false, _timeslider, offset);
					_addElement("timeSliderProgress", alignment, false, _timeslider, offset);
					_addElement("timeSliderThumb", alignment, false, _timeslider, offset);
					_addElement("timeSliderCapRight", alignment, true, _timeslider, alignment == "right" ? 0 : offset);
					_addSliderListener("time");
					break;
				case "fullscreen":
					_addElement("fullscreenButton", alignment, false);
					_addElement("normalscreenButton", alignment, true);
					_buildHandler("fullscreenButton", "jwSetFullscreen", true);
					_buildHandler("normalscreenButton", "jwSetFullscreen", false);
					break;
				case "volume":
					offsetLeft = _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft") === undefined ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
					offsetRight = _api.skin.getSkinElement("controlbar", "volumeSliderCapRight") === undefined ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapRight").width;
					offset = alignment == "left" ? offsetLeft : offsetRight;
					width = _api.skin.getSkinElement("controlbar", "volumeSliderRail").width + offsetLeft + offsetRight;
					slidercss = {
						height: _api.skin.getSkinElement("controlbar", "background").height,
						position: "absolute",
						top: 0,
						width: width
					};
					slidercss[alignment] = alignment == "left" ? _marginleft : _marginright;
					var _volumeslider = _appendNewElement("volumeSlider", _elements.elements, slidercss);
					_addElement("volumeSliderCapLeft", alignment, true, _volumeslider, alignment == "left" ? 0 : offset);
					_addElement("volumeSliderRail", alignment, true, _volumeslider, offset);
					_addElement("volumeSliderProgress", alignment, false, _volumeslider, offset);
					_addElement("volumeSliderCapRight", alignment, true, _volumeslider, alignment == "right" ? 0 : offset);
					_addSliderListener("volume");
					break;
				case "mute":
					_addElement("muteButton", alignment, false);
					_addElement("unmuteButton", alignment, true);
					_buildHandler("muteButton", "jwSetMute", true);
					_buildHandler("unmuteButton", "jwSetMute", false);
					
					break;
				case "duration":
					_addElement("durationText", alignment, true);
					break;
			}
		}
		
		function _addElement(element, alignment, offset, parent, position) {
			if ((_api.skin.getSkinElement("controlbar", element) !== undefined || element.indexOf("Text") > 0 || element.indexOf("divider") === 0) && !(element.indexOf("divider") === 0 && _prevElement.indexOf("divider") === 0)) {
				_prevElement = element;
				var css = {
					height: _api.skin.getSkinElement("controlbar", "background").height,
					position: "absolute",
					top: 0
				};
				var wid;
				if (element.indexOf("Text") > 0) {
					element.innerhtml = "00:00";
					css.font = _settings.fontsize + "px/" + (_api.skin.getSkinElement("controlbar", "background").height + 1) + "px " + _settings.font;
					css.color = _settings.fontcolor;
					css.textAlign = "center";
					css.fontWeight = _settings.fontweight;
					css.fontStyle = _settings.fontstyle;
					css.cursor = "default";
					wid = 14 + 3 * _settings.fontsize;
				} else if (element.indexOf("divider") === 0) {
					css.background = "url(" + _api.skin.getSkinElement("controlbar", "divider").src + ") repeat-x center left";
					wid = _api.skin.getSkinElement("controlbar", "divider").width;
				} else {
					css.background = "url(" + _api.skin.getSkinElement("controlbar", element).src + ") repeat-x center left";
					wid = _api.skin.getSkinElement("controlbar", element).width;
				}
				if (alignment == "left") {
					css.left = position === undefined ? _marginleft : position;
					if (offset) {
						_marginleft += wid;
					}
				} else if (alignment == "right") {
					css.right = position === undefined ? _marginright : position;
					if (offset) {
						_marginright += wid;
					}
				}
				
				if (parent === undefined) {
					parent = _elements.elements;
				}
				
				css.width = wid;
				
				var newelement = _appendNewElement(element, parent, css);
				if (_api.skin.getSkinElement("controlbar", element + "Over") !== undefined) {
					newelement.onmouseover = function(evt) {
						evt.stopPropagation();
						newelement.style.backgroundImage = ["url(", _api.skin.getSkinElement("controlbar", element + "Over").src, ")"].join("");
					};
					newelement.onmouseout = function(evt) {
						evt.stopPropagation();
						newelement.style.backgroundImage = ["url(", _api.skin.getSkinElement("controlbar", element).src, ")"].join("");
					};
				}
				
			}
		}
		
		function _addListeners() {
			// Register events with the player.
			//_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, _timeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _muteHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
		}
		
		/** Add interactivity to the jwplayerControlbar elements. **/
		function _init() {
			// Trigger a few events so the bar looks good on startup.
			_timeHandler({
				id: _api.id,
				duration: _api.jwGetDuration(),
				position: 0
			});
			_bufferHandler({
				id: _api.id,
				bufferProgress: 0
			});
			_muteHandler({
				id: _api.id,
				mute: _api.jwGetMute()
			});
			_stateHandler({
				id: _api.id,
				newstate: jwplayer.api.events.state.IDLE
			});
			_volumeHandler({
				id: _api.id,
				volume: _api.jwGetVolume()
			});
		}
		
		
		/** Set a single button handler. **/
		function _buildHandler(element, handler, args) {
			if (_api.skin.getSkinElement("controlbar", element) !== undefined) {
				var _element = _elements[element];
				if (_element !== null) {
					_css(_element, {
						cursor: "pointer"
					});
					if (handler == "fullscreen") {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							_api.jwSetFullscreen(!_api.jwGetFullscreen());
						};
					} else {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							if (args !== null) {
								_api[handler](args);
							} else {
								_api[handler]();
							}
							
						};
					}
				}
			}
		}
		
		/** Set the volume drag handler. **/
		function _addSliderListener(name) {
			var bar = _elements[name + "Slider"];
			_css(_elements.elements, {
				"cursor": "pointer"
			});
			_css(bar, {
				"cursor": "pointer"
			});
			bar.onmousedown = function(evt) {
				_scrubber = name;
			};
			bar.onmouseup = function(evt) {
				evt.stopPropagation();
				_sliderUp(evt.pageX);
			};
			bar.onmousemove = function(evt) {
				if (_scrubber == "time") {
					_mousedown = true;
					var xps = evt.pageX - bar.getBoundingClientRect().left - window.pageXOffset;
					_css(_elements.timeSliderThumb, {
						left: xps
					});
				}
			};
		}
		
		
		/** The slider has been moved up. **/
		function _sliderUp(msx) {
			_mousedown = false;
			var railRect, xps;
			if (_scrubber == "time") {
				railRect = _elements.timeSliderRail.getBoundingClientRect();
				xps = msx - railRect.left + window.pageXOffset;
				var pos = xps / railRect.width * _currentDuration;
				if (pos < 0) {
					pos = 0;
				} else if (pos > _currentDuration) {
					pos = _currentDuration - 3;
				}
				_api.jwSeek(pos);
				if (_api.jwGetState() != jwplayer.api.events.state.PLAYING) {
					_api.jwPlay();
				}
			} else if (_scrubber == "volume") {
				railRect = _elements.volumeSliderRail.getBoundingClientRect();
				xps = msx - railRect.left - window.pageXOffset;
				var pct = Math.round(xps / railRect.width * 100);
				if (pct < 0) {
					pct = 0;
				} else if (pct > 100) {
					pct = 100;
				}
				if (_api.jwGetMute()) {
					_api.jwSetMute(false);
				}
				_api.jwSetVolume(pct);
			}
			_scrubber = "none";
		}
		
		
		/** Update the buffer percentage. **/
		function _bufferHandler(event) {
			if (event.bufferPercent !== null) {
				_currentBuffer = event.bufferPercent;
			}
			var wid = _elements.timeSliderRail.getBoundingClientRect().width;
			var bufferWidth = isNaN(Math.round(wid * _currentBuffer / 100)) ? 0 : Math.round(wid * _currentBuffer / 100);
			_css(_elements.timeSliderBuffer, {
				width: bufferWidth
			});
		}
		
		
		/** Update the mute state. **/
		function _muteHandler(event) {
			if (event.mute) {
				_hide(_elements.muteButton);
				_show(_elements.unmuteButton);
				_hide(_elements.volumeSliderProgress);
			} else {
				_show(_elements.muteButton);
				_hide(_elements.unmuteButton);
				_show(_elements.volumeSliderProgress);
			}
		}
		
		
		/** Update the playback state. **/
		function _stateHandler(event) {
			// Handle the play / pause button
			if (event.newstate == jwplayer.api.events.state.BUFFERING || event.newstate == jwplayer.api.events.state.PLAYING) {
				_show(_elements.pauseButton);
				_hide(_elements.playButton);
			} else {
				_hide(_elements.pauseButton);
				_show(_elements.playButton);
			}
			
			// Show / hide progress bar
			if (event.newstate == jwplayer.api.events.state.IDLE) {
				if (!_settings.idlehide && _settings.position.toUpperCase() == jwplayer.html5.view.positions.OVER) {
					_fadeIn();
				}
				_hide(_elements.timeSliderBuffer);
				_hide(_elements.timeSliderProgress);
				_hide(_elements.timeSliderThumb);
			} else {
				_fadeOut();
				_show(_elements.timeSliderBuffer);
				if (event.newstate != jwplayer.api.events.state.BUFFERING) {
					_show(_elements.timeSliderProgress);
					_show(_elements.timeSliderThumb);
				}
			}
		}
		
		
		/** Handles event completion **/
		function _completeHandler(event) {
			_timeHandler(jwplayer.utils.extend(event, {
				position: 0,
				duration: _currentDuration
			}));
		}
		
		
		/** Update the playback time. **/
		function _timeHandler(event) {
			if (event.position !== null) {
				_currentPosition = event.position;
			}
			if (event.duration !== null) {
				_currentDuration = event.duration;
			}
			var progress = (_currentPosition === _currentDuration === 0) ? 0 : _currentPosition / _currentDuration;
			var railRect = _elements.timeSliderRail.getBoundingClientRect();
			var progressWidth = isNaN(Math.round(railRect.width * progress)) ? 0 : Math.round(railRect.width * progress);
			var thumbPosition = progressWidth;
			
			_elements.timeSliderProgress.style.width = progressWidth + "px";
			if (!_mousedown) {
				if (_elements.timeSliderThumb) {
					_elements.timeSliderThumb.style.left = thumbPosition + "px";
				}
			}
			if (_elements.durationText) {
				_elements.durationText.innerHTML = _timeFormat(_currentDuration);
			}
			if (_elements.elapsedText) {
				_elements.elapsedText.innerHTML = _timeFormat(_currentPosition);
			}
		}
		
		
		/** Format the elapsed / remaining text. **/
		function _timeFormat(sec) {
			str = "00:00";
			if (sec > 0) {
				str = Math.floor(sec / 60) < 10 ? "0" + Math.floor(sec / 60) + ":" : Math.floor(sec / 60) + ":";
				str += Math.floor(sec % 60) < 10 ? "0" + Math.floor(sec % 60) : Math.floor(sec % 60);
			}
			return str;
		}
		
		
		/** Resize the jwplayerControlbar. **/
		function _resizeBar() {
			var controlbarcss = {
				width: _width
			};
			var elementcss = {};
			if (_settings.position.toUpperCase() == jwplayer.html5.view.positions.OVER || _api.jwGetFullscreen()) {
				controlbarcss.left = _settings.margin;
				controlbarcss.width -= 2 * _settings.margin;
				controlbarcss.top = _height - _api.skin.getSkinElement("controlbar", "background").height - _settings.margin;
				controlbarcss.height = _api.skin.getSkinElement("controlbar", "background").height;
			} else {
				controlbarcss.left = 0;
			}
			
			elementcss.left = _api.skin.getSkinElement("controlbar", "capLeft").width;
			elementcss.width = controlbarcss.width - _api.skin.getSkinElement("controlbar", "capLeft").width - _api.skin.getSkinElement("controlbar", "capRight").width;
			
			var timeSliderLeft = _api.skin.getSkinElement("controlbar", "timeSliderCapLeft") === undefined ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
			_css(_elements.timeSliderRail, {
				width: (elementcss.width - _marginleft - _marginright),
				left: timeSliderLeft
			});
			if (_elements.timeSliderCapRight !== undefined) {
				_css(_elements.timeSliderCapRight, {
					left: timeSliderLeft + (elementcss.width - _marginleft - _marginright)
				});
			}
			_css(_wrapper, controlbarcss);
			_css(_elements.elements, elementcss);
			return controlbarcss;
		}
		
		
		/** Update the volume level. **/
		function _volumeHandler(event) {
			if (_elements.volumeSliderRail !== undefined) {
				var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
				var width = parseInt(_elements.volumeSliderRail.style.width.replace("px", ""), 10);
				var progressWidth = isNaN(Math.round(width * progress)) ? 0 : Math.round(width * progress);
				var offset = parseInt(_elements.volumeSliderRail.style.right.replace("px", ""), 10);
				
				var volumeSliderLeft = _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft") === undefined ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
				_css(_elements.volumeSliderProgress, {
					width: progressWidth,
					left: volumeSliderLeft
				});
				
				if (_elements.volumeSliderCapLeft !== undefined) {
					_css(_elements.volumeSliderCapLeft, {
						left: 0
					});
				}
			}
		}
		
		function _setup() {
			_buildBase();
			_buildElements();
			_addListeners();
			_init();
			_wrapper.style.opacity = _settings.idlehide ? 0 : 1;
		}
		
		_setup();
		return this;
	};
})(jwplayer);
