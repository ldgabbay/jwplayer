/**
 * Core component of the JW Player (initialization, API).
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5 = function(container) {
		var _container = container;
		
		this.setup = function(options) {
			jwplayer.utils.extend(this, new jwplayer.html5.api(_container, options));
			return this;
		};
		
		return this;
	};
	
	jwplayer.html5.version = '1.0';
})(jwplayer);

/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.utils = function() {
	};
	
	/** Returns the extension of a file name **/
	jwplayer.html5.utils.extension = function(path) {
		return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	jwplayer.html5.utils.getAbsolutePath = function(path) {
		if (path === undefined) {
			return undefined;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = document.location.href.substr(0, document.location.href.indexOf("://") + 3);
		var basepath = document.location.href.split("?")[0];
		basepath = basepath.substring(protocol.length, (path.indexOf("/") === 0) ? basepath.indexOf('/', protocol.length) : basepath.lastIndexOf('/'));
		var patharray = (basepath + "/" + path).split("/");
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if (patharray[i] === undefined || patharray[i] == ".") {
				continue;
			} else if (patharray[i] == "..") {
				result.pop();
			} else {
				result.push(patharray[i]);
			}
		}
		return protocol + result.join("/");
	};
	
	function isAbsolutePath(path) {
		if (path === null) {
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}
	
	
	jwplayer.html5.utils.mapEmpty = function(map) {
		for (var val in map) {
			return false;
		}
		return true;
	};
	
	jwplayer.html5.utils.mapLength = function(map) {
		var result = 0;
		for (var val in map) {
			result++;
		}
		return result;
	};
	
	/** Logger **/
	jwplayer.html5.utils.log = function(msg, obj) {
		if (obj) {
			obj.message = msg;
			console.log(obj);
		} else {
			console.log(msg);
		}
		return this;
	};
	
	jwplayer.html5.utils.css = function(domelement, styles) {
		if (domelement !== undefined) {
			for (var style in styles) {
				try {
					domelement.style[style.replace("_", "-")] = styles[style];
				} catch (err) {
					console.log(err);
				}
			}
		}
	};
})(jwplayer);
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _css = jwplayer.html5.utils.css;
	
	jwplayer.html5.view = function(api, container, model) {
		var _container;
		var _wrapper;
		var _zindex = 0;
		var _box = {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		};
		
		function createWrapper() {
			_wrapper = document.createElement("div");
			_wrapper.id = _container.id;
			_container.id = _wrapper.id + "_video";
			
			_css(_wrapper, {
				position: 'relative',
				height: model.config.height + 'px',
				width: model.config.width + 'px',
				margin: 'auto',
				padding: 0,
				background_color: model.config.screencolor,
				z_index: getNextZIndex()
			});
			
			_css(_container, {
				position: 'absolute',
				width: model.config.width + 'px',
				height: model.config.height + 'px',
				top: 0,
				left: 0,
				z_index: 1,
				margin: 'auto',
				display: 'block'
			});
			
			jwplayer.utils.wrap(_container, _wrapper);
		}
		
		function getNextZIndex() {
			return _zindex++;
		}
		
		function layoutComponents() {
			if (model.getMedia() !== undefined && !model.getMedia().hasChrome && !model.config.chromeless) {
				for (var pluginIndex in model.plugins.order) {
					var pluginName = model.plugins.order[pluginIndex];
					if (model.plugins.object[pluginName].getDisplayElement !== undefined) {
						var plugincss = {
							position: 'absolute',
							z_index: getNextZIndex(),
							margin: 0,
							padding: 0
						};
						var elementWidth, elementHeight;
						switch (model.plugins.config[pluginName].position.toUpperCase()) {
							case jwplayer.html5.view.positions.OVER:
								break;
							case jwplayer.html5.view.positions.TOP:
								plugincss.top = 0;
								elementHeight = getNumber(model.plugins.object[pluginName].getDisplayElement().style.height);
								_box.top += elementHeight;
								for (var childNode in _wrapper.childNodes) {
									if (!isNaN(parseInt(childNode, 10))) {
										_wrapper.childNodes[childNode].style.height = getNumber(_wrapper.childNodes[childNode].style.height) - elementHeight ;
										_wrapper.childNodes[childNode].style.top = getNumber(_wrapper.childNodes[childNode].style.top) + elementHeight;
									}
								}
								break;
							case jwplayer.html5.view.positions.RIGHT:
								elementWidth = getNumber(model.plugins.object[pluginName].getDisplayElement().style.width);
								_box.right += elementWidth;
								break;
							case jwplayer.html5.view.positions.BOTTOM:
								elementHeight = getNumber(model.plugins.object[pluginName].getDisplayElement().style.height);
								plugincss.top = getNumber(_wrapper.style.height) - elementHeight - _box.bottom;
								_box.bottom += elementHeight;
								break;
							case jwplayer.html5.view.positions.LEFT:
								elementWidth = getNumber(model.plugins.object[pluginName].getDisplayElement().style.width);
								_box.left += elementWidth;
								break;
						}
						_container.parentNode.appendChild(model.plugins.object[pluginName].getDisplayElement());
						_css(model.plugins.object[pluginName].getDisplayElement(), plugincss);
					}
				}
			} else {
				model.getMedia().getDisplayElement().poster = model.playlist[model.item].image;
				model.getMedia().getDisplayElement().controls = "controls";
			}
		}
		
		function getNumber(style) {
			if (style === "") {
				return 0;
			}
			return parseInt(style.replace("px", ""), 10);
		}
		
		this.setup = function(container) {
			_container = container;
			createWrapper();
			layoutComponents();
			this.resize(model.config.width, model.config.height);
		};
		
		this.resize = function(width, height) {
			for (var pluginIndex in model.plugins.order) {
				var pluginName = model.plugins.order[pluginIndex];
				if (model.plugins.config[pluginName].position == jwplayer.html5.view.positions.OVER && !api.jwGetFullscreen()){
					model.plugins.object[pluginName].resize(model.width - _box.left - _box.right, model.height - _box.top - _box.bottom);
				} else {
					model.plugins.object[pluginName].resize(width, height);
				}
			}
			_css(model.getMedia().getDisplayElement(), {
				position: 'absolute',
				width: (api.jwGetFullscreen() ? model.width : model.width - _box.left - _box.right),
				height:  (api.jwGetFullscreen() ? model.height : model.height - _box.top - _box.bottom),
				top: _box.top,
				left: _box.left
			});
		};
		
	};
	
	jwplayer.html5.view.positions = {
		TOP: "TOP",
		RIGHT: "RIGHT",
		BOTTOM: "BOTTOM",
		LEFT: "LEFT",
		OVER: "OVER"
	};
})(jwplayer);
/**
 * jwplayer controlbar component of the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	/** Map with config for the jwplayerControlbar plugin. **/
	var _defaults = {
		backgroundcolor: "000000",
		margin: 10,
		//font: "_sans",
		font: "Arial,sans-serif",
		fontsize: 10,
		fontcolor: "000000",
		fontstyle: "normal",
		//fontweight: "normal",
		fontweight: "bold",
		buttoncolor: "ffffff",
		position: jwplayer.html5.view.positions.BOTTOM,
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
					"name": "divider",
					"type": "divider"
				}, {
					"name": "blank",
					"type": "button"
				}, {
					"name": "fullscreen",
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
		var _settings = jwplayer.utils.extend({}, _defaults, api.skin.getComponentSettings("controlbar"), config);
		if (jwplayer.html5.utils.mapLength(api.skin.getComponentLayout("controlbar")) > 0) {
			_settings.layout = api.skin.getComponentLayout("controlbar");
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
		var _fullscreen;
		var _width;
		var _height;
		var _prevElement;
		var _elements = {};
		
		
		function _buildBase() {
			var wrappercss = {
				height: api.skin.getSkinElement("controlbar", "background").height,
				background_color: "#" + _settings.backgroundcolor
			};
			
			_wrapper = document.createElement("div");
			_wrapper.id = api.id + "_jwplayer_controlbar";
			_css(_wrapper, wrappercss);
			
			_addElement("capLeft", "left", false, _wrapper);
			var domelmentcss = {
				position: "absolute",
				height: api.skin.getSkinElement("controlbar", "background").height,
				background: " url(" + api.skin.getSkinElement("controlbar", "background").src + ") repeat-x center left",
				left: api.skin.getSkinElement("controlbar", "capLeft").width
			};
			_appendNewElement("elements", _wrapper, domelmentcss);
			_addElement("capRight", "right", false, _wrapper);
		}
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			_width = width;
			_height = height;
			_fullscreen = api.jwGetFullscreen();
			if (_fullscreen) {
				_show(_elements.normalscreenButton);
				_hide(_elements.fullscreenButton);
				// TODO
				if (false) {
					window.onresize(function() {
						_resizeBar();
					});
				}
			} else {
				_hide(_elements.normalscreenButton);
				_show(_elements.fullscreenButton);
				// TODO
				if (false) {
					window.onresize(null);
				}
			}
			_resizeBar();
			_timeHandler({});
			_bufferHandler({});
		};
		
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
					if (api.jwGetPlaylist().length > 1) {
						_addElement("prevButton", alignment, true);
						_buildHandler("prevButton", "jwPlaylistPrev");
					}
					break;
				case "next":
					if (api.jwGetPlaylist().length > 1) {
						_addElement("nextButton", alignment, true);
						_buildHandler("nextButton", "jwPlaylistNext");
					}
					break;
				case "elapsed":
					_addElement("elapsedText", alignment, true);
					break;
				case "time":
					var offsetLeft = api.skin.getSkinElement("controlbar", "timeSliderCapLeft") === undefined ? 0 : api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
					var offsetRight = api.skin.getSkinElement("controlbar", "timeSliderCapRight") === undefined ? 0 : api.skin.getSkinElement("controlbar", "timeSliderCapRight").width;
					var offset = alignment == "left" ? offsetLeft : offsetRight;
					var width = api.skin.getSkinElement("controlbar", "timeSliderRail").width + offsetLeft + offsetRight;
					var slidercss = {
						height: api.skin.getSkinElement("controlbar", "background").height,
						position: "absolute",
						top: "0px",
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
					var offsetLeft = api.skin.getSkinElement("controlbar", "volumeSliderCapLeft") === undefined ? 0 : api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
					var offsetRight = api.skin.getSkinElement("controlbar", "volumeSliderCapRight") === undefined ? 0 : api.skin.getSkinElement("controlbar", "volumeSliderCapRight").width;
					var offset = alignment == "left" ? offsetLeft : offsetRight;
					var width = api.skin.getSkinElement("controlbar", "volumeSliderRail").width + offsetLeft + offsetRight;
					var slidercss = {
						height: api.skin.getSkinElement("controlbar", "background").height,
						position: "absolute",
						top: "0px",
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
			if ((api.skin.getSkinElement("controlbar", element) !== undefined || element.indexOf("Text") > 0 || element.indexOf("divider") === 0) && !(element.indexOf("divider") === 0 && _prevElement.indexOf("divider") === 0)) {
				_prevElement = element;
				var css = {
					height: api.skin.getSkinElement("controlbar", "background").height,
					position: "absolute",
					top: "0px"
				};
				var wid;
				if (element.indexOf("Text") > 0) {
					element.innerhtml = "00:00";
					css.font = _settings.fontsize + "px/" + (api.skin.getSkinElement("controlbar", "background").height + 1) + "px " + _settings.font;
					css.color = _settings.fontcolor;
					css.text_align = "center";
					css.font_weight = _settings.fontweight;
					css.font_style = _settings.fontstyle;
					css.cursor = "default";
					wid = 14 + 3 * _settings.fontsize;
					css.color = "#" + _settings.fontcolor.substr(-6);
				} else if (element.indexOf("divider") === 0) {
					css.background = "url(" + api.skin.getSkinElement("controlbar", "divider").src + ") repeat-x center left";
					wid = api.skin.getSkinElement("controlbar", "divider").width;
				} else {
					css.background = "url(" + api.skin.getSkinElement("controlbar", element).src + ") repeat-x center left";
					wid = api.skin.getSkinElement("controlbar", element).width;
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
				if (api.skin.getSkinElement("controlbar", element + "Over") !== undefined) {
					newelement.onmouseover = function(evt) {
						evt.stopPropagation();
						newelement.style["background-image"] = ["url(", api.skin.getSkinElement("controlbar", element + "Over").src, ")"].join("");
					};
					newelement.onmouseout = function(evt) {
						evt.stopPropagation();
						newelement.style["background-image"] = ["url(", api.skin.getSkinElement("controlbar", element).src, ")"].join("");
					};
				}
				
			}
		}
		
		function _addListeners() {
			// Register events with the player.
			//api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistHandler);
			api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
			api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, _timeHandler);
			api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _muteHandler);
			api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
			api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
		}
		
		/** Add interactivity to the jwplayerControlbar elements. **/
		function _init() {
			// Trigger a few events so the bar looks good on startup.
			_timeHandler({
				id: api.id,
				duration: api.jwGetDuration(),
				position: 0
			});
			_bufferHandler({
				id: api.id,
				bufferProgress: 0
			});
			_muteHandler({
				id: api.id,
				mute: api.jwGetMute()
			});
			_stateHandler({
				id: api.id,
				newstate: jwplayer.api.events.state.IDLE
			});
			_volumeHandler({
				id: api.id,
				volume: api.jwGetVolume()
			});
		}
		
		
		/** Set a single button handler. **/
		function _buildHandler(element, handler, args) {
			if (api.skin.getSkinElement("controlbar", element) !== undefined) {
				var _element = _elements[element];
				if (_element !== null) {
					_css(_element, {
						cursor: "pointer"
					});
					if (handler == "fullscreen") {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							api.jwSetFullscreen(!api.jwGetFullscreen());
						};
					} else {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							if (!(args === null)) {
								api[handler](args);
							} else {
								api[handler]();
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
				api.jwSeek(pos);
				if (api.jwGetState() != jwplayer.api.events.state.PLAYING) {
					api.jwPlay();
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
				if (api.jwGetMute()) {
					api.jwSetMute(false);
				}
				api.jwSetVolume(pct);
			}
			_scrubber = "none";
		}
		
		
		/** Update the buffer percentage. **/
		function _bufferHandler(event) {
			if (!(event.bufferPercent === null)) {
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
				_hide(_elements.timeSliderBuffer);
				_hide(_elements.timeSliderProgress);
				_hide(_elements.timeSliderThumb);
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
			_timeHandler(jwplayer.utils.extend(event, {
				position: 0,
				duration: _currentDuration
			}));
		}
		
		
		/** Update the playback time. **/
		function _timeHandler(event) {
			if (!(event.position === null)) {
				_currentPosition = event.position;
			}
			if (!(event.duration === null)) {
				_currentDuration = event.duration;
			}
			var progress = (_currentPosition === _currentDuration === 0) ? 0 : _currentPosition / _currentDuration;
			var railRect = _elements.timeSliderRail.getBoundingClientRect();
			var progressWidth = isNaN(Math.round(railRect.width * progress)) ? 0 : Math.round(railRect.width * progress);
			var thumbPosition = progressWidth;
			
			_elements.timeSliderProgress.style.width = progressWidth;
			if (!_mousedown) {
				if (_elements.timeSliderThumb) {
					_elements.timeSliderThumb.style.left = thumbPosition;
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
			if (_settings.position.toUpperCase() == jwplayer.html5.view.positions.OVER || _fullscreen) {
				controlbarcss.left = _settings.margin;
				controlbarcss.width -= 2 * _settings.margin;
				controlbarcss.top = _height -  api.skin.getSkinElement("controlbar", "background").height - _settings.margin;
			}

			elementcss.left = api.skin.getSkinElement("controlbar", "capLeft").width;
			elementcss.width = controlbarcss.width - api.skin.getSkinElement("controlbar", "capLeft").width - api.skin.getSkinElement("controlbar", "capRight").width;
			
			var timeSliderLeft = api.skin.getSkinElement("controlbar", "timeSliderCapLeft") === undefined ? 0 : api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
			_css(_elements.timeSliderRail, {
				width: (elementcss.width - _marginleft - _marginright),
				left: timeSliderLeft
			});
			if (_elements.timeSliderCapRight !== null) {
				_css(_elements.timeSliderCapRight, {
					left: timeSliderLeft + (elementcss.width - _marginleft - _marginright)
				});
			}
			_css(_wrapper, controlbarcss);
			_css(_elements.elements, elementcss);
			
		}
		
		
		/** Update the volume level. **/
		function _volumeHandler(event) {
			if (_elements.volumeSliderRail !== null) {
				var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
				var width = parseInt(_elements.volumeSliderRail.style.width.replace("px", ""), 10);
				var progressWidth = isNaN(Math.round(width * progress)) ? 0 : Math.round(width * progress);
				var offset = parseInt(_elements.volumeSliderRail.style.right.replace("px", ""), 10);
				
				var volumeSliderLeft = api.skin.getSkinElement("controlbar", "volumeSliderCapLeft") === undefined ? 0 : api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
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
		}
		
		_setup();
		return this;
	};
})(jwplayer);
/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _mediainfovariables = ["width", "height", "state", "playlist", "item", "position", "buffer", "duration", "volume", "mute", "fullscreen"];
	
	jwplayer.html5.controller = function(api, container, model, view) {
		var _model = model;
		var _view = view;
		
		var debug = (_model.config.debug !== undefined) && (_model.config.debug.toString().toLowerCase() == 'console');
		var _eventDispatcher = new jwplayer.html5.eventdispatcher(container.id, debug);
		jwplayer.utils.extend(this, _eventDispatcher);
		
		function forward(evt) {
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		_model.addGlobalListener(forward);
		
		function _play() {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					switch (_model.state) {
						case jwplayer.api.events.state.IDLE:
							_model.setActiveMediaProvider(_model.playlist[_model.item]);
							_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, function() {
								_model.getMedia().play();
							});
							_model.getMedia().load(_model.playlist[_model.item]);
							break;
						case jwplayer.api.events.state.PAUSED:
							_model.getMedia().play();
							break;
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Switch the pause state of the player. **/
		function _pause() {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					switch (_model.state) {
						case jwplayer.api.events.state.PLAYING:
						case jwplayer.api.events.state.BUFFERING:
							_model.getMedia().pause();
							break;
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Seek to a position in the video. **/
		function _seek(position) {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					switch (_model.state) {
						case jwplayer.api.events.state.PLAYING:
						case jwplayer.api.events.state.PAUSED:
						case jwplayer.api.events.state.BUFFERING:
							_model.getMedia().seek(position);
							break;
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Stop playback and loading of the video. **/
		function _stop() {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					_model.getMedia().stop();
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Stop playback and loading of the video. **/
		function _next() {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					if (_model.item + 1 == _model.playlist.length) {
						return _item(0);
					} else {
						return _item(_model.item + 1);
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Stop playback and loading of the video. **/
		function _prev() {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					if (_model.item === 0) {
						return _item(_model.playlist.length - 1);
					} else {
						return _item(_model.item - 1);
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Stop playback and loading of the video. **/
		function _item(item) {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					var oldstate = _model.state;
					_stop();
					_model.item = item;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
						"item": item
					});
					if (oldstate == jwplayer.api.events.state.PLAYING || oldstate == jwplayer.api.events.state.BUFFERING) {
						_play();
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Get / set the video's volume level. **/
		function _setVolume(volume) {
			try {
				switch (typeof(volume)) {
					case "number":
						_model.getMedia().volume(volume);
						break;
					case "string":
						_model.getMedia().volume(parseInt(volume, 10));
						break;
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Get / set the mute state of the player. **/
		function _setMute(state) {
			try {
				_model.getMedia().mute(state);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Resizes the video **/
		function _resize(width, height) {
			try {
				_model.width = width;
				_model.height = height;
				_view.resize(width, height);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Jumping the player to/from fullscreen. **/
		function _setFullscreen(state) {
			try {
				_model.getMedia().fullscreen(state);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Loads a new video **/
		function _load(arg) {
			try {
				_model.loadPlaylist(arg);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		this.play = _play;
		this.pause = _pause;
		this.seek = _seek;
		this.stop = _stop;
		this.next = _next;
		this.prev = _prev;
		this.item = _item;
		this.setVolume = _setVolume;
		this.setMute = _setMute;
		this.resize = _resize;
		this.setFullscreen = _setFullscreen;
		this.load = _load;
	};
})(jwplayer);
/**
 * JW Player Default skin
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.defaultSkin = function() {
		this.text = '<?xml version="1.0" ?><skin author="LongTail Video" name="Five" version="1.0"><settings><setting name="backcolor" value="0xFFFFFF"/><setting name="frontcolor" value="0x000000"/><setting name="lightcolor" value="0x000000"/><setting name="screencolor" value="0x000000"/></settings><components><component name="controlbar"><settings><setting name="margin" value="20"/><setting name="fontsize" value="11"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFJJREFUeNrslLENwAAIwxLU/09j5AiOgD5hVQzNAVY8JK4qEfHMIKBnd2+BQlBINaiRtL/aV2rdzYBsM6CIONbI1NZENTr3RwdB2PlnJgJ6BRgA4hwu5Qg5iswAAAAASUVORK5CYII="/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="playButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhJREFUeNpiYqABYBo1dNRQ+hr6H4jvA3E8NS39j4SpZvh/LJig4YxEGEqy3kET+w+AOGFQRhTJhrEQkGcczfujhg4CQwECDADpTRWU/B3wHQAAAABJRU5ErkJggg=="/><element name="pauseButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAChJREFUeNpiYBgFo2DwA0YC8v/R1P4nRu+ooaOGUtnQUTAKhgIACDAAFCwQCfAJ4gwAAAAASUVORK5CYII="/><element name="prevButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEtJREFUeNpiYBgFo2Dog/9QDAPyQHweTYwiQ/2B+D0Wi8g2tB+JTdBQRiIMJVkvEy0iglhDF9Aq9uOpHVEwoE+NJDUKRsFgAAABBgDe2hqZcNNL0AAAAABJRU5ErkJggg=="/><element name="nextButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAElJREFUeNpiYBgFo2Dog/9AfB6I5dHE/lNqKAi/B2J/ahsKw/3EGMpIhKEk66WJoaR6fz61IyqemhEFSlL61ExSo2AUDAYAEGAAiG4hj+5t7M8AAAAASUVORK5CYII="/><element name="timeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADxJREFUeNpiYBgFo2AU0Bwwzluw+D8tLWARFhKiqQ9YuLg4aWsBGxs7bS1gZ6e5BWyjSX0UjIKhDgACDABlYQOGh5pYywAAAABJRU5ErkJggg=="/><element name="timeSliderBuffer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFo2AU0Bww1jc0/aelBSz8/Pw09QELOzs7bS1gY2OjrQWsrKy09gHraFIfBaNgqAOAAAMAvy0DChXHsZMAAAAASUVORK5CYII="/><element name="timeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAClJREFUeNpiYBgFo2AU0BwwAvF/WlrARGsfjFow8BaMglEwCugAAAIMAOHfAQunR+XzAAAAAElFTkSuQmCC"/><element name="timeSliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAICAYAAAA870V8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiZICA/yCCiQEJUJcDEGAAY0gBD1/m7Q0AAAAASUVORK5CYII="/><element name="muteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpiYBgFIw3MB+L/5Gj8j6yRiRTFyICJXHfTXyMLAXlGati4YDRFDj8AEGAABk8GSqqS4CoAAAAASUVORK5CYII="/><element name="unmuteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFgxz8p7bm+cQa+h8LHy7GhEcjIz4bmAjYykiun/8j0fakGPIfTfPgiSr6aB4FVAcAAQYAWdwR1G1Wd2gAAAAASUVORK5CYII="/><element name="volumeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGpJREFUeNpi/P//PwM9ABMDncCoRYPfIqqDZcuW1UPp/6AUDcNM1DQYKtRAlaAj1mCSLSLXYIIWUctgDItoZfDA5aOoqKhGEANIM9LVR7SymGDQUctikuOIXkFNdhHEOFrDjlpEd4sAAgwAriRMub95fu8AAAAASUVORK5CYII="/><element name="volumeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFtJREFUeNpi/P//PwM9ABMDncCoRYPfIlqAeij9H5SiYZiqBqPTlFqE02BKLSLaYFItIttgQhZRzWB8FjENiuRJ7aAbsMQwYMl7wDIsWUUQ42gNO2oR3S0CCDAAKhKq6MLLn8oAAAAASUVORK5CYII="/><element name="fullscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAE5JREFUeNpiYBgFo2DQA0YC8v/xqP1PjDlMRDrEgUgxkgHIlfZoriVGjmzLsLFHAW2D6D8eA/9Tw7L/BAwgJE90PvhPpNgoGAVDEQAEGAAMdhTyXcPKcAAAAABJRU5ErkJggg=="/><element name="normalscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEZJREFUeNpiYBgFo2DIg/9UUkOUAf8JiFFsyX88fJyAkcQgYMQjNkzBoAgiezyRbE+tFGSPxQJ7auYBmma0UTAKBhgABBgAJAEY6zON61sAAAAASUVORK5CYII="/></elements></component><component name="display"><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC"/><element name="playIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg=="/><element name="muteIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNrs1jEOgCAMBVAg7t5/8qaoIy4uoobyXsLCxA+0NCUAAADGUWvdQoQ41x4ixNBB2hBvBskdD3w5ZCkl3+33VqI0kjBBlh9rp+uTcyOP33TnolfsU85XX3yIRpQph8ZQY3wTZtU5AACASA4BBgDHoVuY1/fvOQAAAABJRU5ErkJggg=="/><element name="errorIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWlJREFUeNrsl+1twjAQhsHq/7BBYQLYIBmBDcoGMAIjtBPQTcII2SDtBDBBwrU6pGsUO7YbO470PtKJkz9iH++d4ywWAAAAAABgljRNsyWr2bZzDuJG1rLdZhcMbTjrBCGDyUKsqQLFciJb9bSvuG/WagRVRUVUI6gqy5HVeKWfSgRyJruKIU//TrZTSn2nmlaXThrloi/v9F2STC1W4+Aw5cBzkquRc09bofFNc6YLxEON0VUZS5FPTftO49vMjRsIF3RhOGr7/D/pJw+FKU+q0vDyq8W42jCunDqI3LC5XxNj2wHLU1XjaRnb0Lhykhqhhd8MtSF5J9tbjCv4mXGvKJz/65FF/qJryyaaIvzP2QRxZTX2nTuXjvV/VPFSwyLnW7mpH99yTh1FEVro6JBSd40/pMrRdV8vPtcKl28T2pT8TnFZ4yNosct3Q0io6JfBiz1FlGdqVQH3VHnepAEAAAAAADDzEGAAcTwB10jWgxcAAAAASUVORK5CYII="/><element name="bufferIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAuhJREFUeNrsWr9rU1EUznuNGqvFQh1ULOhiBx0KDtIuioO4pJuik3FxFfUPaAV1FTdx0Q5d2g4FFxehTnEpZHFoBy20tCIWtGq0TZP4HfkeHB5N8m6Sl/sa74XDybvv3vvOd8/Pe4lXrVZT3dD8VJc0B8QBcUAcEAfESktHGeR5XtMfqFQq/f92zPe/NbtGlKTdCY30kuxrpMGO94BlQCXs+rbh3ONgA6BlzP1p20d80gEI5hmA2A92Qua1Q2PtAFISM+bvjMG8U+Q7oA3rQGASwrYCU6WpNdLGYbA+Pq5jjXIiwi8EEa2UDbQSaKOIuV+SlkcCrfjY8XTI9EpKGwP0C2kru2hLtHqa4zoXtZRWyvi4CLwv9Opr6Hkn6A9HKgEANsQ1iqC3Ub/vRUk2JgmRkatK36kVrnt0qObunwUdUUMXMWYpakJsO5Am8tAw2GBIgwWA+G2S2dMpiw0gDioQRQJoKhRb1QiDwlHZUABYbaXWsm5ae6loTE4ZDxN4CZar8foVzOJ2iyZ2kWF3t7YIevffaMT5yJ70kQb2fQ1sE5SHr2wazs2wgMxgbsEKEAgxAvZUJbQLBGTSBMgNrncJbA6AljtS/eKDJ0Ez+DmrQEzXS2h1Ck25kAg0IZcUOaydCy4sYnN2fOA+2AP16gNoHALlQ+fwH7XO4CxLenUpgj4xr6ugY2roPMbMx+Xs18m/E8CVEIhxsNeg83XWOAN6grG3lGbk8uE5fr4B/WH3cJw+co/l9nTYsSGYCJ/lY5/qv0thn6nrIWmjeJcPSnWOeY++AkF8tpJHIMAUs/MaBBpj3znZfQo5psY+ZrG4gv5HickjEOymKjEeRpgyST6IuZcTcWbnjcgdPi5ghxciRKsl1lDSsgwA1i8fssonJgzmTSqfGUkCENndNdAL7PS6QQ7ZYISTo+1qq0LEWjTWcvY4isa4z+yfQB+7ooyHVg5RI7/i1Ijn/vnggDggDogD4oC00P4KMACd/juEHOrS4AAAAABJRU5ErkJggg=="/></elements></component><component name="dock"><elements><element name="button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFBJREFUeNrs0cEJACAQA8Eofu0fu/W6EM5ZSAFDRpKTBs00CQQEBAQEBAQEBAQEBAQEBATkK8iqbY+AgICAgICAgICAgICAgICAgIC86QowAG5PAQzEJ0lKAAAAAElFTkSuQmCC"/></elements></component><component name="playlist"><elements><element name="item" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAIAAAC1nk4lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHhJREFUeNrs2NEJwCAMBcBYuv/CFuIE9VN47WWCR7iocXR3pdWdGPqqwIoMjYfQeAiNh9B4JHc6MHQVHnjggQceeOCBBx77TifyeOY0iHi8DqIdEY8dD5cL094eePzINB5CO/LwcOTptNB4CP25L4TIbZzpU7UEGAA5wz1uF5rF9AAAAABJRU5ErkJggg=="/><element name="sliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADhJREFUeNrsy6ENACAMAMHClp2wYxZLAg5Fcu9e3OjuOKqqfTMzbs14CIZhGIZhGIZhGP4VLwEGAK/BBnVFpB0oAAAAAElFTkSuQmCC"/><element name="sliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADRJREFUeNrsy7ENACAMBLE8++8caFFKKiRffU53112SGs3ttOohGIZhGIZhGIZh+Fe8BRgAiaUGde6NOSEAAAAASUVORK5CYII="/></elements></component></components></skin>';
		this.xml = null;
		
		//http://www.w3schools.com/Dom/dom_parser.asp 
		if (window.DOMParser) {
			parser = new DOMParser();
			this.xml = parser.parseFromString(this.text, "text/xml");
		} else {
			//IE
			this.xml = new ActiveXObject("Microsoft.XMLDOM");
			this.xml.async = "false";
			this.xml.loadXML(this.text);
		}
		return this;
	};
	
})(jwplayer);
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _logoDefaults = {
		prefix: "http://l.longtailvideo.com/html5/0/",
		file: "logo.png",
		link: "http://www.longtailvideo.com/players/jw-flv-player/",
		margin: 8,
		out: 0.5,
		over: 1,
		timeout: 3,
		hide: "true",
		position: "bottom-left",
		width: 93,
		height: 30
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
	
	
	jwplayer.html5.display = function(api, config) {
		var _display = {};
		var _width;
		var _height;
		var _degreesRotated;
		var _rotationInterval;
		var _bufferRotation = api.skin.getComponentSettings("display").bufferrotation === undefined ? 15 : parseInt(api.skin.getComponentSettings("display").bufferrotation, 10);
		var _bufferInterval = api.skin.getComponentSettings("display").bufferinterval === undefined ? 100 : parseInt(api.skin.getComponentSettings("display").bufferinterval, 10);
		config.screencolor = (api.skin.getComponentSettings("display").backgroundcolor === undefined) ? config.screencolor : api.skin.getComponentSettings("display").backgroundcolor;
		config.screencolor = (config.screencolor === undefined) ? "" : config.screencolor.replace("0x", "#");
		var _elements = _initializeDisplayElements();
		api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _stateHandler);
		api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _stateHandler);
		api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_ERROR, function(obj) {
		});
		_setupDisplay();
		
		
		function _setupDisplay() {
			_display.display = createElement("div", "display");
			_display.display_image = createElement("div", "display_image");
			_display.display_icon = createElement("div", "display_icon");
			_display.display_iconBackground = createElement("div", "display_iconBackground");
			_display.logo = createElement("div", "logo");
			_display.display.appendChild(_display.display_image);
			_display.display_iconBackground.appendChild(_display.display_icon);
			_display.display.appendChild(_display.display_iconBackground);
			_display.display.appendChild(_display.logo);
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
			_css(_display.display_image, {
				width: width,
				height: height
			});
			_css(_display.display_iconBackground, {
				top: ((_height - api.skin.getSkinElement("display", "background").height) / 2) + "px",
				left: ((_width - api.skin.getSkinElement("display", "background").width) / 2) + "px"
			});
			_stateHandler({});
		};
		
		function createElement(tag, element) {
			var _element = document.createElement(tag);
			_element.id = api.id + "_jwplayer_" + element;
			_css(_element, _elements[element].style);
			return _element;
		}
		
		function _getStyle(element) {
			var result = '';
			for (var style in _elements[element].style) {
				result += style + ":" + _elements[element].style[style] + ";";
			}
			if (result === '') {
				return ' ';
			}
			return ' style="' + result + '" ';
		}
		
		
		function _setupDisplayElements() {
			for (var element in _display) {
				if (_elements[element].click !== undefined) {
					_display[element].onclick = _elements[element].click;
				}
			}
		}
		
		
		function _initializeDisplayElements() {
			var elements = {
				display: {
					style: {
						cursor: 'pointer'
					},
					click: _displayClickHandler
				},
				display_icon: {
					style: {
						cursor: 'pointer',
						position: 'absolute',
						top: ((api.skin.getSkinElement("display", "background").height - api.skin.getSkinElement("display", "playIcon").height) / 2) + "px",
						left: ((api.skin.getSkinElement("display", "background").width - api.skin.getSkinElement("display", "playIcon").width) / 2) + "px",
						border: 0,
						margin: 0,
						padding: 0
					}
				},
				display_iconBackground: {
					style: {
						cursor: 'pointer',
						position: 'absolute',
						top: ((_height - api.skin.getSkinElement("display", "background").height) / 2) + "px",
						left: ((_width - api.skin.getSkinElement("display", "background").width) / 2) + "px",
						border: 0,
						'background-image': (['url(', api.skin.getSkinElement("display", "background").src, ')']).join(''),
						width: api.skin.getSkinElement("display", "background").width + "px",
						height: api.skin.getSkinElement("display", "background").height + "px",
						margin: 0,
						padding: 0
					}
				},
				display_image: {
					style: {
						display: 'block',
						background: config.screencolor,
						width: _width + "px",
						height: _height + "px",
						position: 'absolute',
						cursor: 'pointer',
						left: 0,
						top: 0,
						margin: 0,
						padding: 0,
						'text-decoration': 'none'
					}
				},
				logo: {
					style: {
						position: 'absolute',
						width: _logoDefaults.width + "px",
						height: _logoDefaults.height + "px",
						'background-image': (['url(', _logoDefaults.prefix, _logoDefaults.file, ')']).join(''),
						margin: 0,
						padding: 0,
						display: 'none',
						'text-decoration': 'none'
					},
					click: _logoClickHandler
				}
			};
			var positions = _logoDefaults.position.split("-");
			for (var position in positions) {
				elements.logo.style[positions[position]] = _logoDefaults.margin + "px";
			}
			return elements;
		}
		
		
		function _displayClickHandler(evt) {
			if (typeof evt.preventDefault != "undefined") {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (api.jwGetState() != jwplayer.api.events.state.PLAYING) {
				api.jwPlay();
			} else {
				api.jwPause();
			}
		}
		
		
		function _logoClickHandler(evt) {
			evt.stopPropagation();
			return;
		}
		
		
		function _setDisplayIcon(newIcon) {
			_show(_display.display_iconBackground);
			_display.display_icon.style["background-image"] = (['url(', api.skin.getSkinElement("display", newIcon).src, ')']).join('');
			_css(_display.display_icon, {
				display: "block",
				width: api.skin.getSkinElement("display", newIcon).width,
				height: api.skin.getSkinElement("display", newIcon).height,
				top: (api.skin.getSkinElement("display", "background").height - api.skin.getSkinElement("display", newIcon).height) / 2,
				left: (api.skin.getSkinElement("display", "background").width - api.skin.getSkinElement("display", newIcon).width) / 2
			});
			if (api.skin.getSkinElement("display", newIcon + "Over") !== undefined) {
				_display.display_icon.onmouseover = function(evt) {
					evt.stopPropagation();
					_display.display_icon.style["background-image"] = ["url(", api.skin.getSkinElement("display", newIcon + "Over").src, ")"].join("");
				};
				_display.display_icon.onmouseout = function(evt) {
					evt.stopPropagation();
					_display.display_icon.style["background-image"] = ["url(", api.skin.getSkinElement("display", newIcon).src, ")"].join("");
				};
			} else {
				_display.display_icon.onmouseover = undefined;
				_display.display_icon.onmouseout = undefined;
			}
		}
		
		function _hideDisplayIcon() {
			_hide(_display.display_icon);
			_hide(_display.display_iconBackground);
		}
		
		function _stateHandler(obj) {
			if (_rotationInterval !== undefined) {
				clearInterval(_rotationInterval);
				_rotationInterval = undefined;
				jwplayer.html5.utils.animations.rotate(_display.display_icon, 0);
			}
			switch (api.jwGetState()) {
				case jwplayer.api.events.state.BUFFERING:
					jwplayer.html5.utils.fadeTo(_display.logo, 0, _logoDefaults.timeout, 1);
					_setDisplayIcon("bufferIcon");
					_degreesRotated = 0;
					_rotationInterval = setInterval(function() {
						_degreesRotated += _bufferRotation;
						jwplayer.html5.utils.animations.rotate(_display.display_icon, _degreesRotated % 360);
					}, _bufferInterval);
					_setDisplayIcon("bufferIcon");
					break;
				case jwplayer.api.events.state.PAUSED:
					jwplayer.html5.utils.fadeTo(_display.logo, 1, 0, 0);
					_css(_display.display_image, {
						background: "transparent no-repeat center center"
					});
					_show(_display.display_iconBackground);
					_setDisplayIcon("playIcon");
					break;
				case jwplayer.api.events.state.IDLE:
					_display.logo.style.display = "block";
					var background = api.jwGetPlaylist()[api.jwGetItem()].image === "" ? config.screencolor : config.screencolor + " url('" + jwplayer.html5.utils.getAbsolutePath(api.jwGetPlaylist()[api.jwGetItem()].image) + "')";
					_css(_display.display_image, {
						background: background + " no-repeat center center"
					});
					_show(_display.display_iconBackground);
					_setDisplayIcon("playIcon");
					break;
				default:
					if (api.jwGetMute()) {
						_css(_display.display_image, {
							background: "transparent no-repeat center center"
						});
						_show(_display.display_iconBackground);
						_setDisplayIcon("muteIcon");
						
					} else {
						try {
							_display.logo.clearQueue();
						} catch (err) {
						
						}
						_display.logo.style.display = "block";
						jwplayer.html5.utils.fadeTo(_display.logo, 0, _logoDefaults.timeout, 1);
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
/**
 * Event dispatcher for the JW Player for HTML5
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.eventdispatcher = function(id, debug) {
		var _listeners;
		var _globallisteners;
		
		/** Clears all event listeners **/
		this.resetEventListeners = function() {
			_listeners = {};
			_globallisteners = [];
		};
		
		this.resetEventListeners();
		
		/** Add an event listener for a specific type of event. **/
		this.addEventListener = function(type, listener, count) {
			try {
				if (_listeners[type] === undefined) {
					_listeners[type] = [];
				}
				
				if (typeof(listener) == "string") {
					eval("listener = " + listener);
				}
				_listeners[type].push({
					listener: listener,
					count: count
				});
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
		
		
		/** Remove an event listener for a specific type of event. **/
		this.removeEventListener = function(type, listener) {
			try {
				for (var lisenterIndex in _listeners[type]) {
					if (_listeners[type][lisenterIndex].toString() == listener.toString()) {
						_listeners[type].slice(lisenterIndex, lisenterIndex + 1);
						break;
					}
				}
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
		
		/** Add an event listener for all events. **/
		this.addGlobalListener = function(listener, count) {
			try {
				if (typeof(listener) == "string") {
					eval("listener = " + listener);
				}
				_globallisteners.push({
					listener: listener,
					count: count
				});
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
		
		/** Add an event listener for all events. **/
		this.removeGlobalListener = function(listener) {
			try {
				for (var lisenterIndex in _globallisteners) {
					if (_globallisteners[lisenterIndex].toString() == listener.toString()) {
						_globallisteners.slice(lisenterIndex, lisenterIndex + 1);
						break;
					}
				}
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
		
		
		/** Send an event **/
		this.sendEvent = function(type, data) {
			if (data === undefined) {
				data = {};
			}
			jwplayer.utils.extend(data, {
				id: id,
				version: jwplayer.html5.version,
				type: type
			});
			if (debug) {
				jwplayer.html5.utils.log(type, data);
			}
			for (var listenerIndex in _listeners[type]) {
				try {
					_listeners[type][listenerIndex].listener(data);
				} catch (err) {
					jwplayer.html5.utils.log("There was an error while handling a listener", err);
				}
				if (_listeners[type][listenerIndex].count === 1) {
					delete _listeners[type][listenerIndex];
				} else if (_listeners[type][listenerIndex].count > 0) {
					_listeners[type][listenerIndex].count = _listeners[type][listenerIndex].count - 1;
				}
			}
			for (var globalListenerIndex in _globallisteners) {
				try {
					_globallisteners[globalListenerIndex].listener(data);
				} catch (err) {
					jwplayer.html5.utils.log("There was an error while handling a listener", err);
				}
				if (_globallisteners[globalListenerIndex].count === 1) {
					delete _globallisteners[globalListenerIndex];
				} else if (_globallisteners[globalListenerIndex].count > 0) {
					_globallisteners[globalListenerIndex].count = _globallisteners[globalListenerIndex].count - 1;
				}
			}
		};
	};
})(jwplayer);
/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.extensionmap = {
		"3gp": "video/3gpp",
		"3gpp": "video/3gpp",
		"3g2": "video/3gpp2",
		"3gpp2": "video/3gpp2",
		"flv": "video/x-flv",
		"f4a": "audio/mp4",
		"f4b": "audio/mp4",
		"f4p": "video/mp4",
		"f4v": "video/mp4",
		"mov": "video/quicktime",
		"m4a": "audio/mp4",
		"m4b": "audio/mp4",
		"m4p": "audio/mp4",
		"m4v": "video/mp4",
		"mkv": "video/x-matroska",
		"mp4": "video/mp4",
		"sdp": "application/sdp",
		"vp6": "video/x-vp6",
		"aac": "audio/aac",
		"mp3": "audio/mp3",
		"ogg": "audio/ogg",
		"ogv": "video/ogg",
		"webm": "video/webm"
	};
})(jwplayer);
/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.api.events.state.IDLE,
		"playing": jwplayer.api.events.state.PLAYING,
		"pause": jwplayer.api.events.state.PAUSED,
		"buffering": jwplayer.api.events.state.BUFFERING
	};
	
	var _css = jwplayer.html5.utils.css;
	
	jwplayer.html5.mediavideo = function(model, container) {
		var _events = {
			'abort': _generalHandler,
			'canplay': _stateHandler,
			'canplaythrough': _stateHandler,
			'durationchange': _metaHandler,
			'emptied': _generalHandler,
			'ended': _stateHandler,
			'error': _errorHandler,
			'loadeddata': _metaHandler,
			'loadedmetadata': _metaHandler,
			'loadstart': _stateHandler,
			'pause': _stateHandler,
			'play': _positionHandler,
			'playing': _stateHandler,
			'progress': _progressHandler,
			'ratechange': _generalHandler,
			'seeked': _stateHandler,
			'seeking': _stateHandler,
			'stalled': _stateHandler,
			'suspend': _stateHandler,
			'timeupdate': _positionHandler,
			'volumechange': _generalHandler,
			'waiting': _stateHandler,
			'canshowcurrentframe': _generalHandler,
			'dataunavailable': _generalHandler,
			'empty': _generalHandler,
			'load': _generalHandler,
			'loadedfirstframe': _generalHandler
		};
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		var _model = model;
		var _container = container;
		var _bufferFull;
		var _bufferingComplete;
		var _state = jwplayer.api.events.state.IDLE;
		var _interval = null;
		var _stopped;
		var _loadcount = 0;
		var _start = false;
		var hasChrome = false;
		
		function _getState() {
			return _state;
		}
		
		function _generalHandler(event) {
		}
		
		function _stateHandler(event) {
			if (_states[event.type]) {
				_setState(_states[event.type]);
			}
		}
		
		function _setState(newstate) {
			if (_stopped) {
				newstate = jwplayer.api.events.state.IDLE;
			}
			if (_state != newstate) {
				var oldstate = _state;
				_model.state = newstate;
				_state = newstate;
				if (newstate == jwplayer.api.events.state.IDLE) {
					_clearInterval();
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE);
					
					if (_container.style.display != 'none') {
						_container.style.display = 'none';
					}
				}
				
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
			}
			_stopped = false;
		}
		
		
		function _metaHandler(event) {
			var meta = {
				height: event.target.videoHeight,
				width: event.target.videoWidth,
				duration: event.target.duration
			};
			if (_model.duration === 0) {
				_model.duration = event.target.duration;
			}
			_model.playlist[_model.item] = jwplayer.utils.extend(_model.playlist[_model.item], meta);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_META, {
				metadata: meta
			});
		}
		
		
		function _positionHandler(event) {
			if (_stopped) {
				return;
			}
			if (!(event.target === undefined)) {
				if (_model.duration === 0) {
					_model.duration = event.target.duration;
				}
				
				if (_state == jwplayer.api.events.state.PLAYING) {
					if (!_start && _container.readyState > 0) {
						_start = true;
						_container.currentTime = _model.playlist[_model.item].start;
						_container.volume = _model.volume / 100;
						_container.muted = _model.mute;
					}
					_model.position = Math.round(event.target.currentTime * 10) / 10;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_TIME, {
						position: Math.round(event.target.currentTime * 10) / 10,
						duration: Math.round(event.target.duration * 10) / 10
					});
				}
			}
			_progressHandler({});
		}
		
		
		function _progressHandler(event) {
			var bufferPercent, bufferTime, bufferFill;
			if (!isNaN(event.loaded / event.total)) {
				bufferPercent = event.loaded / event.total * 100;
				bufferTime = bufferPercent / 100 * (_model.duration - _container.currentTime);
			} else if ((_container.buffered !== undefined) && (_container.buffered.length > 0)) {
				maxBufferIndex = 0;
				if (maxBufferIndex >= 0) {
					bufferPercent = _container.buffered.end(maxBufferIndex) / _container.duration * 100;
					bufferTime = _container.buffered.end(maxBufferIndex) - _container.currentTime;
				}
			}
			
			bufferFill = bufferTime / _model.config.bufferlength * 100;
			
			if (_bufferFull === false) {
				_bufferFull = true;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
			}
			
			if (!_bufferingComplete) {
				if (bufferPercent == 100 && _bufferingComplete === false) {
					_bufferingComplete = true;
				}
				
				if (!(bufferPercent === null)) {
					_model.buffer = Math.round(bufferPercent);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
						bufferPercent: Math.round(bufferPercent)
					});
				}
				
			}
		}
		
		
		function _startInterval() {
			if (_interval === null) {
				_interval = setInterval(function() {
					_positionHandler({});
				}, 100);
			}
		}
		
		function _clearInterval() {
			clearInterval(_interval);
			_interval = null;
		}
		
		function _errorHandler(event) {
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {});
		}
		
		this.getDisplayElement = function() {
			return _container;
		};
		
		this.play = function() {
			if (_state != jwplayer.api.events.state.PLAYING) {
				_container.play();
				_setState(jwplayer.api.events.state.PLAYING);
				_startInterval();
			}
		};
		
		
		/** Switch the pause state of the player. **/
		this.pause = function() {
			_container.pause();
			_setState(jwplayer.api.events.state.PAUSED);
		};
		
		
		/** Seek to a position in the video. **/
		this.seek = function(position) {
			_container.currentTime = position;
			_container.play();
		};
		
		
		/** Stop playback and loading of the video. **/
		this.stop = function() {
			_stopped = true;
			_container.pause();
			_clearInterval();
			_model.position = 0;
			_setState(jwplayer.api.events.state.IDLE);
		};
		
		
		/** Change the video's volume level. **/
		this.volume = function(position) {
			_container.volume = position / 100;
			_model.volume = position;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(position)
			});
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			_container.muted = state;
			_model.mute = state;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, {
				mute: state
			});
		};
		
		
		/** Resize the player. **/
		this.resize = function(width, height) {
			// TODO: Fullscreen
			if (false) {
				_css(_container, {
					width: width,
					height: height
				});
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_RESIZE, {
				fullscreen: _model.fullscreen,
				width: width,
				hieght: height
			});
		};
		
		
		/** Switch the fullscreen state of the player. **/
		this.fullscreen = function(state) {
			_model.fullscreen = state;
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
		};
		
		
		/** Load a new video into the player. **/
		this.load = function(playlistItem) {
			_embed(playlistItem);
			
			_bufferFull = false;
			_bufferingComplete = false;
			_start = false;

			if (_container.style.display != 'none') {
				_container.style.display = 'block';
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			_setState(jwplayer.api.events.state.BUFFERING);
			_positionHandler({});
		};
		
		_embed = function(playlistItem) {
			var vid = _container.ownerDocument.createElement("video");
			vid.preload = "none";
			vid.loop = _model.config.repeat;
			for (var sourceIndex in playlistItem.levels) {
				var sourceModel = playlistItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				if (sourceModel.type === undefined) {
					var extension = jwplayer.html5.utils.extension(sourceModel.file);
					if (jwplayer.html5.extensionmap[extension] !== undefined) {
						source.type = jwplayer.html5.extensionmap[extension];
					} else {
						source.type = 'video/' + extension + ';';
					}
				} else {
					source.type = sourceModel.type;
				}
				vid.appendChild(source);
			}
			vid.style.position = _container.style.position;
			vid.style.top = _container.style.top;
			vid.style.left = _container.style.left;
			vid.style.width = _container.style.width;
			vid.style.height = _container.style.height;
			vid.volume = 0;
			_container.parentNode.replaceChild(vid, _container);
			vid.id = _container.id;
			_container = vid;
			for (var event in _events) {
				_container.addEventListener(event, function(evt) {
					_events[evt.type](evt);
				}, true);
			}
		};
		
		this.embed = _embed;
		
		return this;
	};
})(jwplayer);
/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen", "item", "plugins"];
	
	jwplayer.html5.model = function(api, container, options) {
		var _model = {
			media: undefined,
			playlist: [],
			state: jwplayer.api.events.state.IDLE,
			position: 0,
			buffer: 0,
			config: {
				width: 480,
				height: 320,
				item: 0,
				skin: undefined,
				file: undefined,
				image: undefined,
				start: 0,
				duration: 0,
				bufferlength: 5,
				volume: 90,
				mute: false,
				fullscreen: false,
				repeat: false,
				autostart: false,
				debug: undefined,
				screencolor: undefined
			}
		};
		var _media;
		var _container = container;
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		var _components = ["display", "controlbar"];
		
		jwplayer.utils.extend(_model, _eventDispatcher);
		
		for (var option in options) {
			switch (options[option]) {
				case "":
					continue;
				case "true":
					_model.config[option] = true;
					break;
				case "false":
					_model.config[option] = false;
					break;
				default:
					var config = _model.config;
					var path = option.split(".");
					for (var edge in path) {
						if (edge == path.length - 1) {
							config[path[edge]] = options[option];
						} else {
							config[path[edge]] = {};
							config = config[path[edge]];
						}
					}
			}
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			_model[configurableStateVariable] = _model.config[configurableStateVariable];
		}
		
		var pluginorder = _model.plugins === undefined ? _components : _components.concat(_model.plugins);
		
		_model.plugins = {
			order: pluginorder,
			config: {
				display: {
					position: jwplayer.html5.view.positions.OVER,
					screencolor: _model.config.screencolor
				},
				controlbar: {
					position: jwplayer.html5.view.positions.BOTTOM
				}
			},
			object: {}
		};
		
		for (var pluginIndex in _model.plugins.order) {
			var pluginName = _model.plugins.order[pluginIndex];
			var pluginConfig = _model.config[pluginName] === undefined ? {} : _model.config[pluginName];
			_model.plugins.config[pluginName] = _model.plugins.config[pluginName] === undefined ? pluginConfig : jwplayer.utils.extend(_model.plugins.config[pluginName], pluginConfig);
			if (_model.plugins.config[pluginName].position === undefined){
				_model.plugins.config[pluginName].position = jwplayer.html5.view.positions.OVER;
			}
		}
		
		_model.loadPlaylist = function(playlist, ready) {
			ready = ready === null ? true : false;
			_model.playlist = new jwplayer.html5.playlist(playlist);
			if (ready) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
					"item": _model.config.item
				});
			}
			_model.setActiveMediaProvider(_model.playlist[_model.item]);
		};
		
		function forward(evt) {
			if (evt.type == jwplayer.api.events.JWPLAYER_MEDIA_LOADED) {
				_container = _media.getDisplayElement();
			}
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		_model.setActiveMediaProvider = function(playlistItem) {
			if (_media === undefined) {
				_media = new jwplayer.html5.mediavideo(_model, _container);
				_media.addGlobalListener(forward);
				if (_model.config.chromeless) {
					_media.embed(playlistItem);
				}
			}
			return true;
		};
		
		_model.getMedia = function() {
			return _media;
		};
		
		_model.setupPlugins = function() {
			for (var plugin in _model.plugins.order) {
				if (jwplayer.html5[_model.plugins.order[plugin]] !== undefined) {
					_model.plugins.object[_model.plugins.order[plugin]] = new jwplayer.html5[_model.plugins.order[plugin]](api, _model.plugins.config[_model.plugins.order[plugin]]);
				} else {
					_model.plugins.object[_model.plugins.order[plugin]] = new window[_model.plugins.order[plugin]](api, _model.plugins.config[_model.plugins.order[plugin]]);
				}
			}
		};
		
		return _model;
	};
	
	
})(jwplayer);
/**
 * JW Player playlist model
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.playlist = function(config) {
		var _playlist = [];
		if (config.playlist && config.playlist.length > 0) {
			_playlist = config.playlist;
		} else {
			_playlist.push(new jwplayer.html5.playlistitem(config));
			// For testing
			_playlist.push(new jwplayer.html5.playlistitem(config));
			_playlist.push(new jwplayer.html5.playlistitem(config));
		}
		return _playlist;
	};
	
})(jwplayer);
/**
 * JW Player playlist item model
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.playlistitem = function(config) {
		var _playlistitem = {
			author: "",
			date: "",
			description: "",
			image: "",
			link: "",
			mediaid: "",
			tags: "",
			title: "",
			provider: "",
			
			file: "",
			streamer: "",
			duration: -1,
			start: 0,
			
			currentLevel: -1,
			levels: []
		};
		
		for (var property in _playlistitem) {
			if (config[property] !== undefined) {
				_playlistitem[property] = config[property];
			}
		}
		if (_playlistitem.levels.length === 0) {
			_playlistitem.levels[0] = new jwplayer.html5.playlistitemlevel(_playlistitem);
		}
		return _playlistitem;
	};	
})(jwplayer);
/**
 * JW Player playlist item level model
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.playlistitemlevel = function(config) {
		var _playlistitemlevel = {
			file: "",
			streamer: "",
			bitrate: 0,
			width: 0
		};
		
		for (var property in _playlistitemlevel) {
			if (config[property] !== undefined) {
				_playlistitemlevel[property] = config[property];
			}
		}
		return _playlistitemlevel;
	};
	
})(jwplayer);
/**
 * JW Player component that loads PNG skins.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.skin = function() {
		var _components = {};
		var _loaded = false;
		
		this.load = function(path, callback) {
			new jwplayer.html5.skinloader(path, function(skin) {
				_loaded = true;
				_components = skin;
				callback();
			});
		};
		
		this.getSkinElement = function(component, element) {
			if (_loaded) {
				try {
					return _components[component].elements[element];
				} catch (err) {
					jwplayer.html5.utils.log("No such skin component / element: ", [component, element]);
				}
			}
			return null;
		};
		
		this.getComponentSettings = function(component) {
			if (_loaded) {
				return _components[component].settings;
			}
			return null;
		};

		this.getComponentLayout = function(component) {
			if (_loaded) {
				return _components[component].layout;
			}
			return null;
		};
		
	};
})(jwplayer);
/**
 * JW Player component that loads PNG skins.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	/** Constructor **/
	jwplayer.html5.skinloader = function(skinPath, completeHandler) {
		var _skin = {};
		var _completeHandler = completeHandler;
		var _loading = true;
		var _completeInterval;
		
		skinPath = jwplayer.html5.utils.getAbsolutePath(skinPath);
		
		/** Load the skin **/
		function _load() {
			if (skinPath === undefined) {
				_loadSkin(jwplayer.html5.defaultSkin().xml);
			} else {
				jwplayer.utils.ajax(skinPath, function(xmlrequest) {
					_loadSkin(xmlrequest.responseXML);
				}, function(path) {
					_loadSkin(jwplayer.html5.defaultSkin().xml);
				});
			}
			
		}
		
		
		function _loadSkin(xml) {
			var components = xml.getElementsByTagName('component');
			if (components.length === 0) {
				return;
			}
			for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
				var componentName = components[componentIndex].getAttribute("name");
				var component = {
					settings: {},
					elements: {},
					layout: {}
				};
				_skin[componentName] = component;
				var elements = components[componentIndex].getElementsByTagName('elements')[0].getElementsByTagName('element');
				for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
					_loadImage(elements[elementIndex], componentName);
				}
				var settingsElement = components[componentIndex].getElementsByTagName('settings')[0];
				if (settingsElement !== undefined && settingsElement.childNodes.length > 0) {
					var settings = settingsElement.getElementsByTagName('setting');
					for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
						_skin[componentName].settings[settings[settingIndex].getAttribute("name")] = settings[settingIndex].getAttribute("value");
					}
				}
				var layout = components[componentIndex].getElementsByTagName('layout')[0];
				if (layout !== undefined && layout.childNodes.length > 0) {
					var groups = layout.getElementsByTagName('group');
					for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
						var group = groups[groupIndex];
						_skin[componentName].layout[group.getAttribute("position")] = {
							elements: []
						};
						for (var attributeIndex = 0; attributeIndex < group.attributes.length; attributeIndex++) {
							var attribute = group.attributes[attributeIndex];
							_skin[componentName].layout[group.getAttribute("position")][attribute.name] = attribute.value;
						}
						var groupElements = group.getElementsByTagName('*');
						for (var groupElementIndex = 0; groupElementIndex < groupElements.length; groupElementIndex++) {
							var element = groupElements[groupElementIndex];
							_skin[componentName].layout[group.getAttribute("position")].elements.push({type:element.tagName});
							for (var attributeIndex = 0; attributeIndex < element.attributes.length; attributeIndex++) {
								var attribute = element.attributes[attributeIndex];
								_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex][attribute.name] = attribute.value;
							}
							if (_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex].name === undefined){
								_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex].name = element.tagName;
							}
						}
					}
				}
				
				_loading = false;
				
				_resetCompleteIntervalTest();
			}
		}
		
		
		function _resetCompleteIntervalTest() {
			clearInterval(_completeInterval);
			_completeInterval = setInterval(function() {
				_checkComplete();
			}, 100);
		}
		
		
		/** Load the data for a single element. **/
		function _loadImage(element, component) {
			var img = new Image();
			var elementName = element.getAttribute("name");
			var elementSource = element.getAttribute("src");
			var imgUrl;
			if (elementSource.indexOf('data:image/png;base64,') === 0) {
				imgUrl = elementSource;
			} else {
				var skinUrl = jwplayer.html5.utils.getAbsolutePath(skinPath);
				var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
				imgUrl = [skinRoot, component, elementSource].join('/');
			}
			
			_skin[component].elements[elementName] = {
				height: 0,
				width: 0,
				src: '',
				ready: false
			};
			
			img.onload = function(evt) {
				_completeImageLoad(img, elementName, component);
			};
			img.onerror = function(evt) {
				_skin[component].elements[elementName].ready = true;
				_resetCompleteIntervalTest();
			};
			
			img.src = imgUrl;
		}
		
		
		function _checkComplete() {
			for (var component in _skin) {
				if (component != 'properties') {
					for (var element in _skin[component].elements) {
						if (!_skin[component].elements[element].ready) {
							return;
						}
					}
				}
			}
			if (_loading === false) {
				clearInterval(_completeInterval);
				_completeHandler(_skin);
			}
		}
		
		
		function _completeImageLoad(img, element, component) {
			_skin[component].elements[element].height = img.height;
			_skin[component].elements[element].width = img.width;
			_skin[component].elements[element].src = img.src;
			_skin[component].elements[element].ready = true;
			_resetCompleteIntervalTest();
		}
		
		_load();
	};
})(jwplayer);
/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _completeHandler;
	var _loading;
	
	/** Constructor **/
	jwplayer.html5.skinner = function(player, completeHandler) {
		_completeHandler = completeHandler;
		player.skin = {
			properties: {}
		};
		_load(player);
	};
	
	/** Load the skin **/
	function _load(player) {
		if (jwplayer.html5.utils.getAbsolutePath(player._model.config.skin) === undefined) {
			_loadSkin(player, jwplayer.html5.defaultSkin);
		} else {
			$.ajax({
				url: jwplayer.html5.utils.getAbsolutePath(player._model.config.skin),
				complete: function(xmlrequest, textStatus) {
					if (textStatus == "success") {
						_loadSkin(player, xmlrequest.responseXML);
					} else {
						_loadSkin(player, jwplayer.html5.defaultSkin);
					}
				}
				
			});
		}
		
	}
	
	
	function _loadSkin(player, xml) {
		var components = $('component', xml);
		if (components.length === 0) {
			return;
		}
		for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
			_loading = true;
			
			var componentName = $(components[componentIndex]).attr('name');
			var component = {
				settings: {},
				elements: {}
			};
			player.skin[componentName] = component;
			var elements = $(components[componentIndex]).find('element');
			for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
				_loadImage(elements[elementIndex], componentName, player);
			}
			var settings = $(components[componentIndex]).find('setting');
			for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
				player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
			}
			
			_loading = false;
			
			_resetCompleteIntervalTest(player);
		}
	}
	
	
	function _resetCompleteIntervalTest(player) {
		clearInterval(player.skin._completeInterval);
		player.skin._completeInterval = setInterval(function() {
			_checkComplete(player);
		}, 100);
	}
	
	
	/** Load the data for a single element. **/
	function _loadImage(element, component, player) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var imgUrl;
		if (elementSource.indexOf('data:image/png;base64,') === 0) {
			imgUrl = elementSource;
		} else {
			var skinUrl = jwplayer.html5.utils.getAbsolutePath(player._model.config.skin);
			var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
			imgUrl = [skinRoot, component, elementSource].join('/');
		}
				
		player.skin[component].elements[elementName] = {
			height: 0,
			width: 0,
			src: '',
			ready: false
		};
		
		$(img).load(_completeImageLoad(img, elementName, component, player));
		$(img).error(function() {
			player.skin[component].elements[elementName].ready = true;
			_resetCompleteIntervalTest(player);
		});
		
		img.src = imgUrl;
	}
	
	
	function _checkComplete(player) {
		for (var component in player.skin) {
			if (component != 'properties') {
				for (var element in player.skin[component].elements) {
					if (!player.skin[component].elements[element].ready) {
						return;
					}
				}
			}
		}
		if (_loading === false) {
			clearInterval(player.skin._completeInterval);
			_completeHandler();
		}
	}
	
	
	function _completeImageLoad(img, element, component, player) {
		return function() {
			player.skin[component].elements[element].height = img.height;
			player.skin[component].elements[element].width = img.width;
			player.skin[component].elements[element].src = img.src;
			player.skin[component].elements[element].ready = true;
			_resetCompleteIntervalTest(player);
		};
	}
	
	
	jwplayer.html5.skinner.hasComponent = function(player, component) {
		return (player.skin[component] !== null);
	};
	
	
	jwplayer.html5.skinner.getSkinElement = function(player, component, element) {
		try {
			return player.skin[component].elements[element];
		} catch (err) {
			jwplayer.html5.utils.log("No such skin component / element: ", [player, component, element]);
		}
		return null;
	};
	
	
	jwplayer.html5.skinner.addSkinElement = function(player, component, name, element) {
		try {
			player.skin[component][name] = element;
		} catch (err) {
			jwplayer.html5.utils.log("No such skin component ", [player, component]);
		}
	};
	
	jwplayer.html5.skinner.getSkinProperties = function(player) {
		return player.skin.properties;
	};
	
})(jwplayer);
/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _animations = {};
	
	jwplayer.html5.utils.animations = function() {
	};
	
	jwplayer.html5.utils.animations.transform = function(domelement, value) {
		domelement.style.webkitTransform = value;
		domelement.style.MozTransform = value;
		domelement.style.OTransform = value;
	};
	
	jwplayer.html5.utils.animations.transformOrigin = function(domelement, value) {
		domelement.style.webkitTransformOrigin = value;
		domelement.style.MozTransformOrigin = value;
		domelement.style.OTransformOrigin = value;
	};
	
	jwplayer.html5.utils.animations.rotate = function(domelement, deg) {
		jwplayer.html5.utils.animations.transform(domelement, ["rotate(", deg, "deg)"].join(""));
	};
	
	jwplayer.html5.utils.fadeTo = function(domelement, endAlpha, time, startAlpha, startTime) {
		// Interrupting
		if (_animations[domelement] != startTime && startTime !== undefined){
			return;
		} 
		var currentTime = new Date().getTime();
		if (startAlpha === undefined) {
			startAlpha = domelement.style.opacity === "" ? 1 : domelement.style.opacity;
		}
		if (typeof startAlpha == "string"){
			startAlpha = parseInt(startAlpha, 10);
		}	
		if (domelement.style.opacity == endAlpha && domelement.style.opacity !== ""){
			return;
		}
		if (startTime === undefined) {
			startTime = currentTime;
			_animations[domelement] = startTime; 
		}
		var percentTime = (currentTime - startTime) / (time * 1000);
		percentTime = percentTime > 1 ? 1 : percentTime;
		var delta = endAlpha - startAlpha;
		var alpha = startAlpha + (percentTime * delta);
		if (alpha > 1){
			alpha = 1;
		} else if (alpha < 0) {
			alpha = 0;
		}
		domelement.style.opacity = alpha;
		setTimeout(function() {
			jwplayer.html5.utils.fadeTo(domelement, endAlpha, time, startAlpha, startTime);
		}, 100);
	};
	
})(jwplayer);
/** 
 * A factory for API calls that either set listeners or return data
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.api = function(container, options) {
		var _container = document.createElement('div');
		container.parentNode.replaceChild(_container, container);
		_container.id = container.id;
		
		var _model = new jwplayer.html5.model(this, _container, options);
		var _view = new jwplayer.html5.view(this, _container, _model);
		var _controller = new jwplayer.html5.controller(this, _container, _model, _view);
		
		this.version = "1.0";
		this.id = _container.id;
		this.skin = new jwplayer.html5.skin();
		
		this.jwPlay = _controller.play;
		this.jwPause = _controller.pause;
		this.jwStop = _controller.stop;
		this.jwSeek = _controller.seek;
		this.jwPlaylistItem = _controller.item;
		this.jwPlaylistNext = _controller.next;
		this.jwPlaylistPrev = _controller.prev;
		this.jwResize = _controller.resize;
		this.jwLoad = _controller.load;
		
		function _statevarFactory(statevar) {
			return function() {
				return _model[statevar];
			};
		}
		
		this.jwGetItem = _statevarFactory('item');
		this.jwGetPosition = _statevarFactory('position');
		this.jwGetDuration = _statevarFactory('duration');
		this.jwGetBuffer = _statevarFactory('buffer');
		this.jwGetWidth = _statevarFactory('width');
		this.jwGetHeight = _statevarFactory('height');
		this.jwGetFullscreen = _statevarFactory('fullscreen');
		this.jwSetFullscreen = _controller.setFullscreen;
		this.jwGetVolume = _statevarFactory('volume');
		this.jwSetVolume = _controller.setVolume;
		this.jwGetMute = _statevarFactory('mute');
		this.jwSetMute = _controller.setMute;
		
		this.jwGetState = _statevarFactory('state');
		this.jwGetVersion = function() {
			return this.version;
		};
		this.jwGetPlaylist = function() {
			return _model.playlist;
		};
		
		this.jwAddEventListener = _controller.addEventListener;
		this.jwRemoveEventListener = _controller.removeEventListener;
		this.jwSendEvent = _controller.sendEvent;
		
		//UNIMPLEMENTED
		this.jwGetLevel = function() {
		};
		this.jwGetBandwidth = function() {
		};
		this.jwGetLockState = function() {
		};
		this.jwLock = function() {
		};
		this.jwUnlock = function() {
		};
		
		this.skin.load(_model.config.skin, function() {
			_model.loadPlaylist(_model.config, false);
			_model.setupPlugins();
			_view.setup(_model.getMedia().getDisplayElement());
			var evt = {
				id: this.id,
				version: this.version
			};
			_controller.sendEvent(jwplayer.api.events.JWPLAYER_READY, evt);
			if (playerReady !== undefined) {
				playerReady(evt);
			}
			
			if (window[_model.config.playerReady] !== undefined) {
				window[_model.config.playerReady](evt);
			}
			
			_model.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED);
			_model.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
				"item": _model.config.item
			});
			
			if (_model.config.autostart === true && !_model.config.chromeless) {
				_controller.play();
			}
		});
		
		return this;
	};
	
})(jwplayer);
