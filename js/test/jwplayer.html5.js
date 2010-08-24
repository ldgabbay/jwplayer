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
		return this.each(function() {
		});
	};
	
	
	
	/** Returns the extension of a file name **/
	jwplayer.html5.utils.extension = function(path) {
		return path.substr(path.lastIndexOf('.') + 1, path.length);
	};
	
	jwplayer.html5.utils.isNull = function(obj) {
		return ((obj === null) || (obj === undefined) || (obj === ""));
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	jwplayer.html5.utils.getAbsolutePath = function(path) {
		if (jwplayer.html5.utils.isNull(path)) {
			return path;
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
			if (jwplayer.html5.utils.isNull(patharray[i]) || patharray[i] == ".") {
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
		if (jwplayer.html5.utils.isNull(path)) {
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
	
	
	/** Dumps the content of an object to a string **/
	jwplayer.html5.utils.dump = function(object, depth) {
		if (object === null) {
			return 'null';
		} else if (jwplayer.html5.utils.typeOf(object) != 'object') {
			if (jwplayer.html5.utils.typeOf(object) == 'string') {
				return "\"" + object + "\"";
			}
			return object;
		}
		
		var type = jwplayer.html5.utils.typeOf(object);
		
		depth = (depth === undefined) ? 1 : depth + 1;
		var indent = "";
		for (var indentCount = 0; indentCount < depth; indentCount++) {
			indent += "\t";
		}
		
		var result = (type == "array") ? "[" : "{";
		result += "\n" + indent;
		
		for (var key in object) {
			if (type == "object") {
				result += "\"" + key + "\": ";
			}
			result += jwplayer.html5.utils.dump(object[key], depth) + ",\n" + indent;
		}
		
		result = result.substring(0, result.length - 2 - depth) + "\n";
		
		result += indent.substring(0, indent.length - 1);
		result += (type == "array") ? "]" : "}";
		
		return result;
	};
	
	/** Returns the true type of an object **/
	jwplayer.html5.utils.typeOf = function(value) {
		var s = typeof value;
		if (s === 'object') {
			if (value) {
				if (value instanceof Array) {
					s = 'array';
				}
			} else {
				s = 'null';
			}
		}
		return s;
	};
	
	
	/** Logger **/
	jwplayer.html5.utils.log = function(msg, obj) {
		//try {
		if (obj) {
			console.log("%s: %o", msg, obj);
		} else {
			console.log(jwplayer.html5.utils.dump(msg));
		}
		//} catch (err) {
		//}
		return this;
	};
	
	jwplayer.html5.utils.css = function(domelement, styles) {
		if (domelement !== null) {
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
 * jwplayer controlbar component of the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _positions = {
		BOTTOM: "BOTTOM",
		TOP: "TOP",
		OVER: "OVER"
	};
	
	
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
		position: _positions.BOTTOM,
		leftmargin: 0,
		rightmargin: 0,
		scrubber: "none"
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
	
	jwplayer.html5.controlbar = function(api, container) {
		var _container = container;
		var _api = api;
		var _settings = jwplayer.utils.extend({}, _defaults, api.skin.getComponentSettings("controlbar"));
		var _domelement;
		
		/** Draw the jwplayerControlbar elements. **/
		function _buildElements() {
			// Draw the background.
			_domelement = document.createElement("div");
			_domelement.id = _api.id + "_jwplayer_controlbar";
			_container.parentNode.appendChild(_domelement);
			var controlbarcss = {
				position: "absolute",
				height: _api.skin.getSkinElement("controlbar", "background").height,
				background: " url(" + _api.skin.getSkinElement("controlbar", "background").src + ") repeat-x center left",
				background_color:  "#"+_settings.backgroundcolor
			};
			switch (_settings.position) {
				case _positions.TOP:
					controlbarcss.top = 0;
					break;
				default:
					controlbarcss.top = _api.jwGetHeight();
					_css(_domelement.parentNode, {
						"height": parseInt(_domelement.parentNode.style.height.replace("px", ""), 10) + _api.skin.getSkinElement("controlbar", "background").height
					});
					break;
			}
			
			_css(_domelement, controlbarcss);
			
			
			// Draw all elements on top of the bar.
			_buildElement("capLeft", "left", true);
			_buildElement("playButton", "left", false);
			_buildElement("pauseButton", "left", true);
			_buildElement("divider1", "left", true);
			_buildElement("prevButton", "left", true);
			_buildElement("divider2", "left", true);
			_buildElement("nextButton", "left", true);
			_buildElement("divider3", "left", true);
			_buildElement("elapsedText", "left", true);
			_buildElement("timeSliderCapLeft", "left", true);
			_buildElement("timeSliderRail", "left", false);
			_buildElement("timeSliderBuffer", "left", false);
			_buildElement("timeSliderProgress", "left", false);
			_buildElement("timeSliderThumb", "left", false);
			_buildElement("timeSliderCapRight", "left", true);
			_buildElement("capRight", "right", true);
			// TODO
			if (false) {
				_buildElement("fullscreenButton", "right", false);
				_buildElement("normalscreenButton", "right", true);
				_buildElement("divider4", "right", true);
			}
			_buildElement("volumeSliderCapLeft", "right", true);
			_buildElement("volumeSliderRail", "right", false);
			_buildElement("volumeSliderProgress", "right", true);
			_buildElement("volumeSliderCapRight", "right", true);
			_buildElement("muteButton", "right", false);
			_buildElement("unmuteButton", "right", true);
			_buildElement("divider5", "right", true);
			_buildElement("durationText", "right", true);
		}
		
		
		/** Draw a single element into the jwplayerControlbar. **/
		function _buildElement(element, align, offset) {
			if (_api.skin.getSkinElement("controlbar", element) !== undefined || element.indexOf("Text") > 0 || element.indexOf("divider") === 0) {
				var _element = document.createElement("div");
				_element.id = _domelement.id + "_" + element;
				_domelement.appendChild(_element);
				var css = {
					position: "absolute",
					top: "0px"
				};
				var wid;
				if (element.indexOf("Text") > 0) {
					_element.innerhtml = "00:00";
					css.font = _settings.fontsize + "px/" + (_api.skin.getSkinElement("controlbar", "background").height + 1) + "px " + _settings.font;
					css.color = _settings.fontcolor;
					css.text_align = "center";
					css.font_weight = _settings.fontweight;
					css.font_style = _settings.fontstyle;
					css.cursor = "default";
					wid = 14 + 3 * _settings.fontsize;
					css.color = "#" + _settings.fontcolor.substr(-6);
				} else if (element.indexOf("divider") === 0) {
					css.background = "url(" + _api.skin.getSkinElement("controlbar", "divider").src + ") repeat-x center left";
					wid = _api.skin.getSkinElement("controlbar", "divider").width;
				} else {
					css.background = "url(" + _api.skin.getSkinElement("controlbar", element).src + ") repeat-x center left";
					wid = _api.skin.getSkinElement("controlbar", element).width;
				}
				if (align == "left") {
					css.left = _settings.leftmargin;
					if (offset) {
						_settings.leftmargin += wid;
					}
				} else if (align == "right") {
					css.right = _settings.rightmargin;
					if (offset) {
						_settings.rightmargin += wid;
					}
				}
				css.width = wid;
				css.height = _api.skin.getSkinElement("controlbar", "background").height;
				_css(_element, css);
			}
		}
		
		
		/** Add interactivity to the jwplayerControlbar elements. **/
		function _buildHandlers() {
			// Register events with the buttons.
			_buildHandler("playButton", "jwPlay");
			_buildHandler("pauseButton", "jwPause");
			_buildHandler("prevButton", "jwPlaylistPrev");
			_buildHandler("nextButton", "jwPlaylistNext");
			_buildHandler("muteButton", "jwSetMute", true);
			_buildHandler("unmuteButton", "jwSetMute", false);
			_buildHandler("fullscreenButton", "jwSetFullscreen", true);
			_buildHandler("normalscreenButton", "jwSetFullscreen", false);
			
			_addSliders();
			
			// Register events with the player.
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, _timeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _muteHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
			
			// Trigger a few events so the bar looks good on startup.
			_resizeHandler({
				id: _api.id,
				fulscreen: _api.jwGetFullscreen(),
				width: _api.jwGetWidth(),
				height: _api.jwGetHeight()
			});
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
				var nam = _domelement.id + "_" + element;
				var _element = document.getElementById(nam);
				if (_element !== null) {
					_css(_element, {
						cursor: "pointer"
					});
					if (handler == "fullscreen") {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							_api.jwSetFullscreen(!_api.jwGetFullscreen());
							_resizeHandler({
								id: _api.id,
								fullscreen: _api.jwGetFullscreen(),
								width: _api.jwGetWidth(),
								height: _api.jwGetHeight()
							});
						};
					} else {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							if (!jwplayer.html5.utils.isNull(args)) {
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
		function _addSliders() {
			var bar = _domelement;
			var trl = document.getElementById(_domelement.id + "_timeSliderRail");
			var vrl = document.getElementById(_domelement.id + "_volumeSliderRail");
			_css(_domelement, {
				"cursor": "pointer"
			});
			_css(trl, {
				"cursor": "pointer"
			});
			_css(vrl, {
				"cursor": "pointer"
			});
			bar.onmousedown = function(evt) {
				var trlRect = trl.getBoundingClientRect();
				var vrlRect = vrl.getBoundingClientRect();
				if (evt.pageX >= trlRect.left - window.pageXOffset && evt.pageX <= trlRect.left - window.pageXOffset + trlRect.width) {
					_settings.scrubber = "time";
				} else if (evt.pageX >= vrlRect.left - window.pageXOffset && evt.pageX <= vrlRect.left - window.pageXOffset + vrlRect.width) {
					_settings.scrubber = "volume";
				}
			};
			bar.onmouseup = function(evt) {
				evt.stopPropagation();
				_sliderUp(evt.pageX);
			};
			bar.onmousemove = function(evt) {
				if (_settings.scrubber == "time") {
					_settings.mousedown = true;
					var xps = evt.pageX - bar.getBoundingClientRect().left - window.pageXOffset;
					_css(document.getElementById(_domelement.id + "_timeSliderThumb"), {
						left: xps
					});
				}
			};
		}
		
		
		/** The slider has been moved up. **/
		function _sliderUp(msx) {
			_settings.mousedown = false;
			var railRect, xps;
			if (_settings.scrubber == "time") {
				railRect = document.getElementById(_domelement.id + "_timeSliderRail").getBoundingClientRect();
				xps = msx - railRect.left + window.pageXOffset;
				var pos = xps / railRect.width * _settings.currentDuration;
				if (pos < 0) {
					pos = 0;
				} else if (pos > _settings.currentDuration) {
					pos = _settings.currentDuration - 3;
				}
				_api.jwSeek(pos);
				if (_api.jwGetState() != jwplayer.api.events.state.PLAYING) {
					_api.jwPlay();
				}
			} else if (_settings.scrubber == "volume") {
				railRect = document.getElementById(_domelement.id + "_volumeSliderRail").getBoundingClientRect();
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
			_settings.scrubber = "none";
		}
		
		
		/** Update the buffer percentage. **/
		function _bufferHandler(event) {
			if (!jwplayer.html5.utils.isNull(event.bufferPercent)) {
				_settings.currentBuffer = event.bufferPercent;
			}
			
			var wid = document.getElementById(_domelement.id + "_timeSliderRail").getBoundingClientRect().width;
			var bufferWidth = isNaN(Math.round(wid * _settings.currentBuffer / 100)) ? 0 : Math.round(wid * _settings.currentBuffer / 100);
			_css(document.getElementById(_domelement.id + "_timeSliderBuffer"), {
				width: bufferWidth
			});
		}
		
		
		/** Update the mute state. **/
		function _muteHandler(event) {
			if (event.mute) {
				_hide(document.getElementById(_domelement.id + "_muteButton"));
				_show(document.getElementById(_domelement.id + "_unmuteButton"));
				_hide(document.getElementById(_domelement.id + "_volumeSliderProgress"));
			} else {
				_show(document.getElementById(_domelement.id + "_muteButton"));
				_hide(document.getElementById(_domelement.id + "_unmuteButton"));
				_show(document.getElementById(_domelement.id + "_volumeSliderProgress"));
			}
		}
		
		
		/** Update the playback state. **/
		function _stateHandler(event) {
			// Handle the play / pause button
			if (event.newstate == jwplayer.api.events.state.BUFFERING || event.newstate == jwplayer.api.events.state.PLAYING) {
				_show(document.getElementById(_domelement.id + "_pauseButton"));
				_hide(document.getElementById(_domelement.id + "_playButton"));
			} else {
				_hide(document.getElementById(_domelement.id + "_pauseButton"));
				_show(document.getElementById(_domelement.id + "_playButton"));
			}
			
			// Show / hide progress bar
			if (event.newstate == jwplayer.api.events.state.IDLE) {
				_hide(document.getElementById(_domelement.id + "_timeSliderBuffer"));
				_hide(document.getElementById(_domelement.id + "_timeSliderProgress"));
				_hide(document.getElementById(_domelement.id + "_timeSliderThumb"));
			} else {
				_show(document.getElementById(_domelement.id + "_timeSliderBuffer"));
				if (event.newstate != jwplayer.api.events.state.BUFFERING) {
					_show(document.getElementById(_domelement.id + "_timeSliderProgress"));
					_show(document.getElementById(_domelement.id + "_timeSliderThumb"));
				}
			}
		}
		
		
		/** Handles event completion **/
		function _completeHandler(event) {
			_timeHandler(jwplayer.utils.extend(event, {
				position: 0,
				duration: _settings.currentDuration
			}));
		}
		
		
		/** Update the playback time. **/
		function _timeHandler(event) {
			if (!jwplayer.html5.utils.isNull(event.position)) {
				_settings.currentPosition = event.position;
			}
			if (!jwplayer.html5.utils.isNull(event.duration)) {
				_settings.currentDuration = event.duration;
			}
			var progress = (_settings.currentPosition === _settings.currentDuration === 0) ? 0 : _settings.currentPosition / _settings.currentDuration;
			var railRect = document.getElementById(_domelement.id + "_timeSliderRail").getBoundingClientRect();
			var progressWidth = isNaN(Math.round(railRect.width * progress)) ? 0 : Math.round(railRect.width * progress);
			var thumbPosition = railRect.left + progressWidth - _domelement.getBoundingClientRect().left;
			
			document.getElementById(_domelement.id + "_timeSliderProgress").style.width = progressWidth;
			if (!_settings.mousedown) {
				document.getElementById(_domelement.id + "_timeSliderThumb").style.left = thumbPosition;
			}
			document.getElementById(_domelement.id + "_durationText").innerHTML = _timeFormat(_settings.currentDuration);
			document.getElementById(_domelement.id + "_elapsedText").innerHTML = _timeFormat(_settings.currentPosition);
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
		
		
		/** Flip the player size to/from full-browser-screen. **/
		function _resizeHandler(event) {
			_settings.width = event.width;
			_settings.fullscreen = event.fullscreen;
			if (event.fullscreen) {
				_show(document.getElementById(_domelement.id + "_normalscreenButton"));
				_hide(document.getElementById(_domelement.id + "_fullscreenButton"));
				// TODO
				if (false) {
					window.onresize(function() {
						_resizeBar();
					});
				}
			} else {
				_hide(document.getElementById(_domelement.id + "_normalscreenButton"));
				_show(document.getElementById(_domelement.id + "_fullscreenButton"));
				// TODO
				if (false) {
					window.onresize(null);
				}
			}
			_resizeBar(event);
			_timeHandler(event);
			_bufferHandler(event);
		}
		
		
		/** Resize the jwplayerControlbar. **/
		function _resizeBar(event) {
			var lft = _settings.left;
			var top = _settings.top;
			var wid = _settings.width;
			var hei = _domelement.height;
			var controlbarcss = {};
			if (_settings.position == "over") {
				lft += 1 * _settings.margin;
				top -= 1 * _settings.margin + hei;
				wid -= 2 * _settings.margin;
			}
			if (_settings.fullscreen) {
				lft = _settings.margin;
				top = window.height - _settings.margin - hei;
				wid = window.width - 2 * _settings.margin;
				controlbarcss.z_index = 99;
			} else {
				controlbarcss.z_index = 97;
			}
			
			
			controlbarcss.left = lft;
			controlbarcss.top = top;
			controlbarcss.width = wid;
			_css(document.getElementById(_domelement.id + "_timeSliderRail"), {
				width: (wid - _settings.leftmargin - _settings.rightmargin)
			});
			_css(_domelement, controlbarcss);
		}
		
		
		/** Update the volume level. **/
		function _volumeHandler(event) {
			var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
			var railRect = document.getElementById(_domelement.id + "_volumeSliderRail").getBoundingClientRect();
			var progressWidth = isNaN(Math.round(railRect.width * progress)) ? 0 : Math.round(railRect.width * progress);
			var offset = parseInt(document.getElementById(_domelement.id + "_volumeSliderRail").style.right.replace("px", ""), 10);
			
			_css(document.getElementById(_domelement.id + "_volumeSliderProgress"), {
				width: progressWidth,
				right: railRect.width - progressWidth + offset
			});
		}
		
		_buildElements();
		_buildHandlers();
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
	
	jwplayer.html5.controller = function(model, view, container) {
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
							_eventDispatcher.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, _model.getMedia().play);
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
		function _setVolume(arg) {
			try {
				switch (jwplayer.html5.utils.typeOf(arg)) {
					case "number":
						_model.getMedia().volume(arg);
						break;
					case "string":
						_model.getMedia().volume(parseInt(arg, 10));
						break;
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Get / set the mute state of the player. **/
		function _setMute(arg) {
			try {
				_model.getMedia().mute(arg);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Resizes the video **/
		function _resize(arg1, arg2) {
			try {
				_model.getMedia().resize(arg1, arg2);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Jumping the player to/from fullscreen. **/
		function _setFullscreen(arg) {
			try {
				_model.getMedia().fullscreen(arg);
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
	
	
	jwplayer.html5.display = function(api, container, screencolor) {
		var _container = container;
		var _display = {};
		screencolor = (api.skin.getComponentSettings("display").backgroundcolor === undefined) ? screencolor : api.skin.getComponentSettings("display").backgroundcolor;
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
			_display.display_icon = createElement("img", "display_icon");
			_display.display_icon.src = api.skin.getSkinElement("display", "playIcon").src;
			_display.display_icon.alt = "Click to play video";
			_display.display_iconBackground = createElement("div", "display_iconBackground");
			_display.logo = createElement("div", "logo");
			_display.display.appendChild(_display.display_image);
			_display.display_iconBackground.appendChild(_display.display_icon);
			_display.display.appendChild(_display.display_iconBackground);
			_display.display.appendChild(_display.logo);
			_container.parentNode.insertBefore(_display.display, _container);
			_setupDisplayElements();
		}
		
		
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
						cursor: 'pointer',
						width: api.jwGetWidth() + "px",
						height: api.jwGetHeight() + "px",
						position: 'relative',
						'z-index': 50,
						margin: 0,
						padding: 0
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
						top: ((api.jwGetHeight() - api.skin.getSkinElement("display", "background").height) / 2) + "px",
						left: ((api.jwGetWidth() - api.skin.getSkinElement("display", "background").width) / 2) + "px",
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
						background: screencolor,
						width: api.jwGetWidth() + "px",
						height: api.jwGetHeight() + "px",
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
			/*if (player._media === undefined) {
			 document.location.href = jwplayer.html5.utils.getAbsolutePath(player.getPlaylist()[player.getConfig().item].levels[0]);
			 return;
			 }*/
			if (typeof evt.preventDefault != 'undefined') {
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
		
		
		function _setIcon(path) {
			_display.display_icon.src = path;
		}
		
		
		function _animate(element, state) {
			var speed = 'slow';
			if (!_display.animate) {
				return;
			}
			if (state) {
				element.slideDown(speed, function() {
					_animate(element);
				});
			} else {
				element.slideUp(speed, function() {
					_animate(element, true);
				});
			}
		}
		
		
		function _stateHandler(obj) {
			_display.animate = false;
			switch (api.jwGetState()) {
				case jwplayer.api.events.state.BUFFERING:
					_show(_display.logo);
					setTimeout(function() {
						_hide(_display.logo);
					//.fadeOut(_logoDefaults.out * 1000);
					}, _logoDefaults.timeout * 1000);
					_display.display_icon.src = api.skin.getSkinElement("display", "bufferIcon").src;
					_css(_display.display_icon, {
						display: "block",
						top: (api.skin.getSkinElement("display", "background").height - api.skin.getSkinElement("display", "bufferIcon").height) / 2 + "px",
						left: (api.skin.getSkinElement("display", "background").width - api.skin.getSkinElement("display", "bufferIcon").width) / 2 + "px"
					});
					_display.animate = true;
					// TODO: Buffer Icon rotation
					if (false) {
						_animate(_display.display_iconBackground);
					}
					_hide(_display.display_iconBackground);
					break;
				case jwplayer.api.events.state.PAUSED:
					_show(_display.logo);
					_css(_display.display_image, {
						background: "transparent no-repeat center center"
					});
					_show(_display.display_iconBackground);
					_display.display_icon.src = api.skin.getSkinElement("display", "playIcon").src;
					_css(_display.display_icon, {
						display: "block",
						top: (api.skin.getSkinElement("display", "background").height - api.skin.getSkinElement("display", "playIcon").height) / 2 + "px",
						left: (api.skin.getSkinElement("display", "background").width - api.skin.getSkinElement("display", "playIcon").width) / 2 + "px"
					});
					break;
				case jwplayer.api.events.state.IDLE:
					_hide(_display.logo);
					_css(_display.display_image, {
						background: screencolor + " url('" + jwplayer.html5.utils.getAbsolutePath(api.jwGetPlaylist()[api.jwGetItem()].image) + "') no-repeat center center"
					});
					_show(_display.display_iconBackground);
					_display.display_icon.src = api.skin.getSkinElement("display", "playIcon").src;
					_css(_display.display_icon, {
						display: "block",
						top: (api.skin.getSkinElement("display", "background").height - api.skin.getSkinElement("display", "playIcon").height) / 2 + "px",
						left: (api.skin.getSkinElement("display", "background").width - api.skin.getSkinElement("display", "playIcon").width) / 2 + "px"
					});
					break;
				default:
					if (api.jwGetMute()) {
						_css(_display.display_image, {
							background: "transparent no-repeat center center"
						});
						_show(_display.display_iconBackground);
						_display.display_icon.src = api.skin.getSkinElement("display", "muteIcon").src;
						_css(_display.display_icon, {
							display: "block",
							top: (api.skin.getSkinElement("display", "muteIcon").height - api.skin.getSkinElement("display", "muteIcon").height) / 2 + "px",
							left: (api.skin.getSkinElement("display", "background").width - api.skin.getSkinElement("display", "muteIcon").width) / 2 + "px"
						});
					} else {
						try {
							_display.logo.clearQueue();
						} catch (err) {
						
						}
						_show(_display.logo);
						setTimeout(function() {
							_hide(_display.logo);
						}, _logoDefaults.timeout * 1000);
						_css(_display.display_image, {
							background: "transparent no-repeat center center"
						});
						_hide(_display.display_iconBackground);
						_hide(_display.display_icon);
					}
					break;
			}
		}
		
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
				if (oldstate == jwplayer.api.events.state.IDLE && newstate == jwplayer.api.events.state.BUFFERING) {
					_container.volume = _model.volume / 100;
					_container.muted = _model.mute;
				}
				if (newstate == jwplayer.api.events.state.IDLE) {
					clearInterval(_interval);
					_interval = null;
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
			if (!jwplayer.html5.utils.isNull(event.target)) {
				if (_model.duration === 0) {
					_model.duration = event.target.duration;
				}
				
				if (_state == jwplayer.api.events.state.PLAYING) {
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
			
			// TODO: Buffer underrun
			if (false) {
				if (bufferFill < 25 && _state == jwplayer.api.events.state.PLAYING) {
					_setState(jwplayer.api.events.state.BUFFERING);
					_bufferFull = false;
					if (!_container.seeking) {
						_container.pause();
					}
				} else if (bufferFill > 95 && _state == jwplayer.api.events.state.BUFFERING && _bufferFull === false && bufferTime > 0) {
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
				}
			}
			
			if (_bufferFull === false) {
				_bufferFull = true;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
			}
			
			if (!_bufferingComplete) {
				if (bufferPercent == 100 && _bufferingComplete === false) {
					_bufferingComplete = true;
				}
				
				if (!jwplayer.html5.utils.isNull(bufferPercent)) {
					_model.buffer = Math.round(bufferPercent);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
						bufferPercent: Math.round(bufferPercent)
						//bufferingComplete: _bufferingComplete,
						//bufferFull: _bufferFull,
						//bufferFill: bufferFill,
						//bufferTime: bufferTime
					});
				}
				
			}
		}
		
		
		function _startInterval() {
			if (_interval === null) {
				_interval = window.setInterval(function() {
					_positionHandler({});
				}, 100);
			}
		}
		
		
		function _errorHandler(event) {
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {});
		}
		
		this.getContainer = function() {
			return _container;
		};
		
		this.play = function() {
			if (_state != jwplayer.api.events.state.PLAYING) {
				_container.play();
				_setState(jwplayer.api.events.state.PLAYING);
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
			clearInterval(_interval);
			_interval = undefined;
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
			_container = _insertVideoTag(playlistItem);
			for (var event in _events) {
				_container.addEventListener(event, function(evt) {
					_events[evt.type](evt);
				}, true);
			}
			if (_container.style.display != 'none') {
				_container.style.display = 'block';
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			setTimeout(function() {
				_bufferFull = false;
				_bufferingComplete = false;
				_setState(jwplayer.api.events.state.BUFFERING);
				_startInterval();
				try {
					_container.currentTime = 0;
				} catch (err) {
				
				}
			}, 25);
		};
		
		function _insertVideoTag(playlistItem) {
			//var _container = document.getElementById(player.id);
			var vid = _container.ownerDocument.createElement("video");
			//vid.controls = "none";
			if (vid.autobuffer) {
				vid.autobuffer = _model.config.autoplay;
			} else if (vid.autoplay) {
				vid.autoplay = _model.config.autoplay;
			}
			vid.loop = _model.config.repeat;
			for (var sourceIndex in playlistItem.levels) {
				var sourceModel = playlistItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				if (sourceModel.type === undefined) {
					var extension = jwplayer.html5.utils.extension(sourceModel.file);
					if (extension == "ogv") {
						extension = "ogg";
					}
					source.type = 'video/' + extension + ';';
				} else {
					source.type = sourceModel.type;
				}
				vid.appendChild(source);
			}
			vid.width = _model.config.width;
			vid.height = _model.config.height;
			var styles = {
				position: 'absolute',
				width: _model.config.width + 'px',
				height: _model.config.height + 'px',
				top: 0,
				left: 0,
				'z-index': 0,
				margin: 'auto',
				display: 'block'
			};
			for (var style in styles) {
				vid.style[style] = styles[style];
			}
			_container.parentNode.replaceChild(vid, _container);
			vid.id = _container.id;
			return vid;
		}
		
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

	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen", "item"];
	
	jwplayer.html5.model = function(container, options) {
		var _media;
		var _container = container;
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		
		jwplayer.utils.extend(this.config, options);
		
		this.loadPlaylist = function(playlist, ready) {
			ready = ready === null ? true : false;
			this.playlist = new jwplayer.html5.playlist(playlist);
			if (ready) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
					"item": this.config.item
				});		
			}
			this.setActiveMediaProvider(this.playlist[this.index]);
		};
		
		if (this.config.skin.length === 0) {
			this.config.skin = "";
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			this[configurableStateVariable] = this.config[configurableStateVariable];
		}
		
		function forward(evt) {
			if (evt.type == jwplayer.api.events.JWPLAYER_MEDIA_LOADED) {
				_container = _media.getContainer();
			}
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		this.setActiveMediaProvider = function(playlistItem) {
			if (_media === undefined) {
				_media = new jwplayer.html5.mediavideo(this, _container);
				_media.addGlobalListener(forward);
			}
			return true;
		};
		
		this.getMedia = function() {
			return _media;
		};
		
		return this;
	};
	
	jwplayer.html5.model.prototype = {
		media: undefined,
		components: {},
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
			screencolor: ''
		}
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
		_playlist = [];
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
		for (var property in this) {
			if (config[property] !== undefined) {
				this[property] = config[property];
			}
		}
		if (this.levels.length === 0){
			this.levels[0] = new jwplayer.html5.playlistitemlevel(this);
		}
		return this;
	};
	
	jwplayer.html5.playlistitem.prototype = {
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
})(jwplayer);
/**
 * JW Player playlist item level model
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.playlistitemlevel = function(config) {
		for (var property in this) {
			if (config[property] !== undefined) {
				this[property] = config[property];
			}
		}
		return this;
	};
	
	jwplayer.html5.playlistitemlevel.prototype = {
		file: "",
		streamer: "",
		bitrate: 0,
		width: 0
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
			if (skinPath === "") {
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
					elements: {}
				};
				_skin[componentName] = component;
				var elements = components[componentIndex].getElementsByTagName('element');
				for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
					_loadImage(elements[elementIndex], componentName);
				}
				var settings = components[componentIndex].getElementsByTagName('setting');
				for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
					_skin[componentName].settings[settings[settingIndex].getAttribute("name")] = settings[settingIndex].getAttribute("value");
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
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _css = jwplayer.html5.utils.css;
	
	jwplayer.html5.view = function(api, model, container) {
		var _api = api;
		var _model = model;
		var _wrapper;
		var _components = {};
		
		function createWrapper() {
			_wrapper = document.createElement("div");
			_wrapper.id = container.id;
			container.id = _wrapper.id + "_video";
						
			_css(_wrapper, {
				position: 'relative',
				height: _model.config.height + 'px',
				width: _model.config.width + 'px',
				margin: 'auto',
				padding: 0,
				'background-color': _model.config.screencolor
			});
			
			_css(container, {
				position: 'absolute',
				width: _model.config.width + 'px',
				height: _model.config.height + 'px',
				top: 0,
				left: 0,
				'z-index': 0,
				margin: 'auto',
				display: 'block'
			});
			
			jwplayer.utils.wrap(container, _wrapper);
		}
		
		function setupComponents() {
			if ((_model.getMedia() === undefined) || !_model.getMedia().hasChrome || !_model.config.chromeless) {
				_components.display = new jwplayer.html5.display(_api, container, _model.config.screencolor);
				_components.controlbar = new jwplayer.html5.controlbar(_api, container);
			}
		}
		
		this.setup = function() {
			createWrapper();
			setupComponents();
		};
		
		this.resize = function(width, height) {
		
		};
		
		
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
		var _model = new jwplayer.html5.model(container, options);
		var _view = new jwplayer.html5.view(this, _model, container);
		var _controller = new jwplayer.html5.controller(_model, _view, container);
		
		this.version = "1.0";
		this.id = container.id;
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
		this.jwGetFullscreen = _statevarFactory('buffer');
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
			_view.setup();
			var evt = {
				id: this.id,
				version: this.version
			};
			_model.loadPlaylist(_model.config, false);
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
			
			if (_model.config.autostart === true) {
				_controller.play();
			}
		});
		
		return this;
	};
	
})(jwplayer);
