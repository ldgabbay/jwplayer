/**
 * jwplayer controlbar component of the JW Player.
 *
 * @author zach
 * @version 5.6
 */
(function(jwplayer) {
	/** Map with config for the jwplayerControlbar plugin. **/
	var _defaults = {
		backgroundcolor: "",
		margin: 10,
		font: "Arial,sans-serif",
		fontsize: 10,
		fontcolor: parseInt("000000", 16),
		fontstyle: "normal",
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
	
	_css = jwplayer.utils.css;
	
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
		if (_settings.position == jwplayer.html5.view.positions.NONE
			|| typeof jwplayer.html5.view.positions[_settings.position] == "undefined") {
			return;
		}
		if (jwplayer.utils.mapLength(_api.skin.getComponentLayout("controlbar")) > 0) {
			_settings.layout = _api.skin.getComponentLayout("controlbar");
		}
		var _wrapper;
		var _dividerid;
		var _marginleft;
		var _marginright;
		var _scrubber = "none";
		var _mousedown;
		var _currentPosition;
		var _currentDuration;
		var _currentBuffer;
		var _width;
		var _height;
		var _elements = {};
		var _ready = false;
		var _positions = {};
		var _bgElement;
		var _hiding = false;
		var _fadeTimeout;
		
		function _getBack() {
			if (!_bgElement) {
				_bgElement = _api.skin.getSkinElement("controlbar", "background");
				if (!_bgElement) {
					_bgElement = {
					   width: 0, height: 0, src: null		
					}
				}
			}
			return _bgElement;
		}
		
		function _buildBase() {
			_marginleft = 0;
			_marginright = 0;
			_dividerid = 0;
			if (!_ready) {
				var wrappercss = {
					height: _getBack().height,
					backgroundColor: _settings.backgroundcolor
				};
				
				_wrapper = document.createElement("div");
				_wrapper.id = _api.id + "_jwplayer_controlbar";
				_css(_wrapper, wrappercss);
			}

			var capLeft = (_api.skin.getSkinElement("controlbar", "capLeft"));
			var capRight = (_api.skin.getSkinElement("controlbar", "capRight"));

			if (capLeft) {
				_addElement("capLeft", "left", false, _wrapper);
			}
			var domelementcss = {
				position: "absolute",
				height: _getBack().height,
				left: (capLeft ? capLeft.width : 0),
				zIndex: 0
			};
			_appendNewElement("background", _wrapper, domelementcss, "img");
			if (_getBack().src) {
				_elements.background.src = _getBack().src;
			}
			domelementcss.zIndex = 1;
			_appendNewElement("elements", _wrapper, domelementcss);
			if (capRight) {
				_addElement("capRight", "right", false, _wrapper);
			}
		}
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			jwplayer.utils.cancelAnimation(_wrapper);
			document.getElementById(_api.id).onmousemove = _setVisiblity;
			_width = width;
			_height = height;
			_setVisiblity();
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
		
		this.show = function() {
			_hiding = false;
			_show(_wrapper);
		}

		this.hide = function() {
			_hiding = true;
			_hide(_wrapper);
		}

		function _updatePositions() {
			var positionElements = ["timeSlider", "volumeSlider", "timeSliderRail", "volumeSliderRail"];
			for (var positionElement in positionElements) {
				var elementName = positionElements[positionElement];
				if (typeof _elements[elementName] != "undefined") {
					_positions[elementName] = _elements[elementName].getBoundingClientRect();
				}
			}
		}
		
		
		function _setVisiblity(evt) {
			if (_hiding) { return; }
			if (_settings.position == jwplayer.html5.view.positions.OVER) {
				if (_remainVisible() || jwplayer.utils.exists(evt)) {
					_fadeIn();
					clearTimeout(_fadeTimeout);
					if (_api.jwGetState() != jwplayer.api.events.state.IDLE) {
						_fadeTimeout = setTimeout(function() {
							_fadeOut();
						}, 2000);
					}
				} else {
					clearTimeout(_fadeTimeout);
					if (parseFloat(_wrapper.style.opacity) > 0) {
						_fadeOut();
					}
				}
			}
		}
		
		function _fadeOut(delay) {
			jwplayer.utils.cancelAnimation(_wrapper);
			jwplayer.utils.fadeTo(_wrapper, 0, 0.1, 1, 0);
		}
		
		function _fadeIn() {
			jwplayer.utils.cancelAnimation(_wrapper);
			jwplayer.utils.fadeTo(_wrapper, 1, 0, 1, 0);
		}
		
		function _remainVisible() {
			if (_hiding) return false;
					
			if (_api.jwGetState() == jwplayer.api.events.state.IDLE || _api.jwGetState() == jwplayer.api.events.state.PAUSED) {
				if (_settings.idlehide) {
					return false;
				}
				return true;
			}
			if (_api.jwGetFullscreen()) {
				return false;
			}
			return true;
		}
		
		function _appendNewElement(id, parent, css, domelement) {
			var element;
			if (!_ready) {
				if (!domelement) {
					domelement = "div";
				}
				element = document.createElement(domelement);
				_elements[id] = element;
				element.id = _wrapper.id + "_" + id;
				parent.appendChild(element);
			} else {
				element = document.getElementById(_wrapper.id + "_" + id);
			}
			if (jwplayer.utils.exists(css)) {
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
			if (jwplayer.utils.exists(order)) {
				elements.reverse();
			}
			for (var i = 0; i < elements.length; i++) {
				_buildElement(elements[i], alignment);
			}
		}
		
		function getNewDividerId() {
			return _dividerid++;
		}
		
		/** Draw a single element into the jwplayerControlbar. **/
		function _buildElement(element, alignment) {
			var offset, offsetLeft, offsetRight, width, slidercss;
			
			if (element.type == "divider") {
				_addElement("divider" + getNewDividerId(), alignment, true, undefined, undefined, element.width, element.element);
				return;
			}
			
			switch (element.name) {
				case "play":
					_addElement("playButton", alignment, false);
					_addElement("pauseButton", alignment, true);
					_buildHandler("playButton", "jwPlay");
					_buildHandler("pauseButton", "jwPause");
					break;
				case "prev":
					_addElement("prevButton", alignment, true);
					_buildHandler("prevButton", "jwPlaylistPrev");
					break;
				case "stop":
					_addElement("stopButton", alignment, true);
					_buildHandler("stopButton", "jwStop");
					break;
				case "next":
					_addElement("nextButton", alignment, true);
					_buildHandler("nextButton", "jwPlaylistNext");
					break;
				case "elapsed":
					_addElement("elapsedText", alignment, true);
					break;
				case "time":
					offsetLeft = !jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", "timeSliderCapLeft")) ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
					offsetRight = !jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", "timeSliderCapRight")) ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapRight").width;
					offset = alignment == "left" ? offsetLeft : offsetRight;
					width = _api.skin.getSkinElement("controlbar", "timeSliderRail").width + offsetLeft + offsetRight;
					slidercss = {
						height: _getBack().height,
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
					offsetLeft = !jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", "volumeSliderCapLeft")) ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
					offsetRight = !jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", "volumeSliderCapRight")) ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapRight").width;
					offset = alignment == "left" ? offsetLeft : offsetRight;
					width = _api.skin.getSkinElement("controlbar", "volumeSliderRail").width + offsetLeft + offsetRight;
					slidercss = {
						height: _getBack().height,
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
		
		function _addElement(element, alignment, offset, parent, position, width, skinElement) {
			if (jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", element)) || element.indexOf("Text") > 0 || element.indexOf("divider") === 0)  {
				var css = {
					height: _getBack().height,
					position: "absolute",
					display: "block",
					top: 0
				};
				if ((element.indexOf("next") === 0 || element.indexOf("prev") === 0) && _api.jwGetPlaylist().length < 2) {
					offset = false;
					css.display = "none";
				}
				var wid;
				if (element.indexOf("Text") > 0) {
					element.innerhtml = "00:00";
					css.font = _settings.fontsize + "px/" + (_getBack().height + 1) + "px " + _settings.font;
					css.color = _settings.fontcolor;
					css.textAlign = "center";
					css.fontWeight = _settings.fontweight;
					css.fontStyle = _settings.fontstyle;
					css.cursor = "default";
					wid = 14 + 3 * _settings.fontsize;
				} else if (element.indexOf("divider") === 0) {
					if (width) {
						if (!isNaN(parseInt(width))) {
							wid = parseInt(width);
						}
					} else if (skinElement) {
						var altDivider = _api.skin.getSkinElement("controlbar", skinElement);
						if (altDivider) {
							css.background = "url(" + altDivider.src + ") repeat-x center left";
							wid = altDivider.width;
						}
					} else {
						css.background = "url(" + _api.skin.getSkinElement("controlbar", "divider").src + ") repeat-x center left";
						wid = _api.skin.getSkinElement("controlbar", "divider").width;	
					}
				} else {
					css.background = "url(" + _api.skin.getSkinElement("controlbar", element).src + ") repeat-x center left";
					wid = _api.skin.getSkinElement("controlbar", element).width;
				}
				if (alignment == "left") {
					css.left = isNaN(position) ? _marginleft : position;
					if (offset) {
						_marginleft += wid;
					}
				} else if (alignment == "right") {
					css.right = isNaN(position) ? _marginright : position;
					if (offset) {
						_marginright += wid;
					}
				}
				
				
				if (jwplayer.utils.typeOf(parent) == "undefined") {
					parent = _elements.elements;
				}
				
				css.width = wid;
				
				if (_ready) {
					_css(_elements[element], css);
				} else {
					var newelement = _appendNewElement(element, parent, css);
					if (jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", element + "Over"))) {
						newelement.onmouseover = function(evt) {
							newelement.style.backgroundImage = ["url(", _api.skin.getSkinElement("controlbar", element + "Over").src, ")"].join("");
						};
						newelement.onmouseout = function(evt) {
							newelement.style.backgroundImage = ["url(", _api.skin.getSkinElement("controlbar", element).src, ")"].join("");
						};
					}
				}
			}
		}
		
		function _addListeners() {
			// Register events with the player.
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, _timeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _muteHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
		}
		
		function _playlistHandler() {
			_buildBase();
			_buildElements();
			_resizeBar();
			_init();
		}

		function _itemHandler(evt) {
			_currentDuration = _api.jwGetPlaylist()[evt.index].duration;
			_timeHandler({
				id: _api.id,
				duration: _currentDuration,
				position: 0
			});
			_bufferHandler({
				id: _api.id,
				bufferProgress: 0
			});
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
			if (_ready) {
				return;
			}
			if (jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", element))) {
				var _element = _elements[element];
				if (jwplayer.utils.exists(_element)) {
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
							if (jwplayer.utils.exists(args)) {
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
			if (_ready) {
				return;
			}
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
					var xps = evt.pageX - _positions[name + "Slider"].left - window.pageXOffset;
					_css(_elements.timeSliderThumb, {
						left: xps
					});
				}
			};
		}
		
		
		/** The slider has been moved up. **/
		function _sliderUp(msx) {
			_mousedown = false;
			var xps;
			if (_scrubber == "time") {
				xps = msx - _positions.timeSliderRail.left + window.pageXOffset;
				var pos = xps / _positions.timeSliderRail.width * _currentDuration;
				if (pos < 0) {
					pos = 0;
				} else if (pos > _currentDuration) {
					pos = _currentDuration - 3;
				}
				if (_api.jwGetState() == jwplayer.api.events.state.PAUSED || _api.jwGetState() == jwplayer.api.events.state.IDLE) {
					_api.jwPlay();
				}
				_api.jwSeek(pos);
			} else if (_scrubber == "volume") {
				xps = msx - _positions.volumeSliderRail.left - window.pageXOffset;
				var pct = Math.round(xps / _positions.volumeSliderRail.width * 100);
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
			if (jwplayer.utils.exists(event.bufferPercent)) {
				_currentBuffer = event.bufferPercent;
			}
			if (_positions.timeSliderRail) {
				var wid = _positions.timeSliderRail.width;
				var bufferWidth = isNaN(Math.round(wid * _currentBuffer / 100)) ? 0 : Math.round(wid * _currentBuffer / 100);
				_css(_elements.timeSliderBuffer, {
					width: bufferWidth
				});
			}
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
			
			_setVisiblity();
			// Show / hide progress bar
			if (event.newstate == jwplayer.api.events.state.IDLE) {
				_hide(_elements.timeSliderBuffer);
				_hide(_elements.timeSliderProgress);
				_hide(_elements.timeSliderThumb);
				_timeHandler({
					id: _api.id,
					duration: _api.jwGetDuration(),
					position: 0
				});
			} else {
				_show(_elements.timeSliderBuffer);
				if (event.newstate != jwplayer.api.events.state.BUFFERING) {
					_show(_elements.timeSliderProgress);
					_show(_elements.timeSliderThumb);
				}
			}
		}
		
		
		/** Handles event completion **/
		function _completeHandler(event) {
			_bufferHandler({
				bufferPercent: 0
			});
			_timeHandler(jwplayer.utils.extend(event, {
				position: 0,
				duration: _currentDuration
			}));
		}
		
		
		/** Update the playback time. **/
		function _timeHandler(event) {
			if (jwplayer.utils.exists(event.position)) {
				_currentPosition = event.position;
			}
			if (jwplayer.utils.exists(event.duration)) {
				_currentDuration = event.duration;
			}
			var progress = (_currentPosition === _currentDuration === 0) ? 0 : _currentPosition / _currentDuration;
			var progressElement = _positions.timeSliderRail;
			if (progressElement) {
				var progressWidth = isNaN(Math.round(progressElement.width * progress)) ? 0 : Math.round(progressElement.width * progress);
				var thumbPosition = progressWidth;
				if (_elements.timeSliderProgress) {
					_elements.timeSliderProgress.style.width = progressWidth + "px";
					if (!_mousedown) {
						if (_elements.timeSliderThumb) {
							_elements.timeSliderThumb.style.left = thumbPosition + "px";
						}
					}
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
		
		
		function cleanupDividers() {
			var lastElement, lastVisibleElement;
			var elements = document.getElementById(_wrapper.id + "_elements");
			if (!elements) {
				return;
			}
			
			var childNodes = elements.childNodes;
			for (var childNode in elements.childNodes) {
				if (isNaN(parseInt(childNode, 10))) {
					continue;
				}
				if (childNodes[childNode].id.indexOf(_wrapper.id + "_divider") === 0 
						&& lastVisibleElement 
						&& lastVisibleElement.id.indexOf(_wrapper.id + "_divider") === 0 
						&& childNodes[childNode].style.backgroundImage == lastVisibleElement.style.backgroundImage) {
					childNodes[childNode].style.display = "none";
				} else if (childNodes[childNode].id.indexOf(_wrapper.id + "_divider") === 0 && lastElement && lastElement.style.display != "none") {
					childNodes[childNode].style.display = "block";
				}
				if (childNodes[childNode].style.display != "none") {
					lastVisibleElement = childNodes[childNode];
				}
				lastElement = childNodes[childNode];
			}
		}
		
		/** Resize the jwplayerControlbar. **/
		function _resizeBar() {
			cleanupDividers();
			if (_api.jwGetFullscreen()) {
				_show(_elements.normalscreenButton);
				_hide(_elements.fullscreenButton);
			} else {
				_hide(_elements.normalscreenButton);
				_show(_elements.fullscreenButton);
			}
			var controlbarcss = {
				width: _width
			};
			var elementcss = {};
			if (_settings.position == jwplayer.html5.view.positions.OVER || _api.jwGetFullscreen()) {
				controlbarcss.left = _settings.margin;
				controlbarcss.width -= 2 * _settings.margin;
				controlbarcss.top = _height - _getBack().height - _settings.margin;
				controlbarcss.height = _getBack().height;
			}
			
			var capLeft = _api.skin.getSkinElement("controlbar", "capLeft"); 
			var capRight = _api.skin.getSkinElement("controlbar", "capRight"); 
			
			elementcss.left = capLeft ? capLeft.width : 0;
			elementcss.width = controlbarcss.width - elementcss.left - (capRight ? capRight.width : 0);

			var timeSliderLeft = !jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", "timeSliderCapLeft")) ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
			_css(_elements.timeSliderRail, {
				width: (elementcss.width - _marginleft - _marginright),
				left: timeSliderLeft
			});
			if (jwplayer.utils.exists(_elements.timeSliderCapRight)) {
				_css(_elements.timeSliderCapRight, {
					left: timeSliderLeft + (elementcss.width - _marginleft - _marginright)
				});
			}
			_css(_wrapper, controlbarcss);
			_css(_elements.elements, elementcss);
			_css(_elements.background, elementcss);
			_updatePositions();
			return controlbarcss;
		}
		
		
		/** Update the volume level. **/
		function _volumeHandler(event) {
			if (jwplayer.utils.exists(_elements.volumeSliderRail)) {
				var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
				var width = parseInt(_elements.volumeSliderRail.style.width.replace("px", ""), 10);
				var progressWidth = isNaN(Math.round(width * progress)) ? 0 : Math.round(width * progress);
				var offset = parseInt(_elements.volumeSliderRail.style.right.replace("px", ""), 10);
				
				var volumeSliderLeft = (!jwplayer.utils.exists(_api.skin.getSkinElement("controlbar", "volumeSliderCapLeft"))) ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
				_css(_elements.volumeSliderProgress, {
					width: progressWidth,
					left: volumeSliderLeft
				});
				
				if (jwplayer.utils.exists(_elements.volumeSliderCapLeft)) {
					_css(_elements.volumeSliderCapLeft, {
						left: 0
					});
				}
			}
		}
		
		function _setup() {
			_buildBase();
			_buildElements();
			_updatePositions();
			_ready = true;
			_addListeners();
			_settings.idlehide = (_settings.idlehide.toString().toLowerCase() == "true");
			if (_settings.position == jwplayer.html5.view.positions.OVER && _settings.idlehide) {
				_wrapper.style.opacity = 0;
			}
			_init();
		}
		
		_setup();
		return this;
	};
})(jwplayer);
