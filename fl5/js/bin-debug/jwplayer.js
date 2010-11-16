jwplayer = function(container) { return jwplayer.constructor(container); };

jwplayer.constructor = function(container) {};

$jw = jwplayer;
jwplayer.utils = function() {
};

/** Returns the true type of an object **/
// TODO: if not used elsewhere, remove this function
jwplayer.utils.typeOf = function(value) {
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

/** Merges a list of objects **/
jwplayer.utils.extend = function() {
	var args = jwplayer.utils.extend['arguments'];
	if (args.length > 1) {
		for (var i = 1; i < args.length; i++) {
			for (element in args[i]) {
				args[0][element] = args[i][element];
			}
		}
		return args[0];
	}
	return null;
};

/** Returns the extension of a file name **/
jwplayer.utils.extension = function(path) {
	path = path.split("?")[0];
	return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
};

/** Updates the contents of an HTML element **/
jwplayer.utils.html = function(element, content) {
	element.innerHTML = content;
};

/** Appends an HTML element to another element HTML element **/
jwplayer.utils.append = function(originalElement, appendedElement) {
	originalElement.appendChild(appendedElement);
};

/** Wraps an HTML element with another element **/
jwplayer.utils.wrap = function(originalElement, appendedElement) {
	originalElement.parentNode.replaceChild(appendedElement, originalElement);
	appendedElement.appendChild(originalElement);
};

/** Loads an XML file into a DOM object **/
jwplayer.utils.ajax = function(xmldocpath, completecallback, errorcallback) {
	//TODO: [ticket:1064]
	var xmlhttp;
	if (window.XMLHttpRequest) {
		// IE>7, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// IE6
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200) {
				if (completecallback) {
					completecallback(xmlhttp);
				}
			} else {
				if (errorcallback) {
					errorcallback(xmldocpath);
				}
			}
		}
	};
	xmlhttp.open("GET", xmldocpath, true);
	xmlhttp.send(null);
	return xmlhttp;
};

/** Loads a file **/
jwplayer.utils.load = function(domelement, completecallback, errorcallback) {
	domelement.onreadystatechange = function() {
		if (domelement.readyState === 4) {
			if (domelement.status === 200) {
				if (completecallback) {
					completecallback();
				}
			} else {
				if (errorcallback) {
					errorcallback();
				}
			}
		}
	};
};

/** Finds tags in a DOM, returning a new DOM **/
jwplayer.utils.find = function(dom, tag) {
	return dom.getElementsByTagName(tag);
};

/** **/

/** Appends an HTML element to another element HTML element **/
jwplayer.utils.append = function(originalElement, appendedElement) {
	originalElement.appendChild(appendedElement);
};

/**
 * Detects whether the current browser is IE (version 8 or below).
 * Technique from http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
 * Note - this detection no longer works for IE9.
 **/
jwplayer.utils.isIE = function() {
	return (!+"\v1");
};


/**
 * Detects whether the current browser is mobile Safari.
 **/
jwplayer.utils.isIOS = function() {
	var agent = navigator.userAgent.toLowerCase();
	return (agent.match(/iP(hone|ad)/i) !== null);
};

/**
 * Detects whether the browser can handle HTML5 video.
 * Using this as a proxy for detecting all HTML5 features needed for the JW HTML5 Player.  Do we need more granularity?
 *
 * @param config (optional) If set, check to see if the first playable item
 */
jwplayer.utils.hasHTML5 = function(config) {
	var vid = document.createElement('video');
	
	if (!!vid.canPlayType) {
		if (config) {
			var item = {};
			if (config.playlist && config.playlist.length) {
				item.file = config.playlist[0].file;
				item.levels = config.playlist[0].levels;
			} else {
				item.file = config.file;
				item.levels = config.levels;
			}
			// TODO: [ticket:1115]
			if (item.file) {
				return jwplayer.utils.vidCanPlay(vid, item.file);
			} else if (item.levels && item.levels.length) {
				for (var i = 0; i < item.levels.length; i++) {
					if (item.levels[i].file && jwplayer.utils.vidCanPlay(vid, item.levels[i].file)) {
						return true;
					}
				}
			}
		} else {
			return true;
		}
	}
	
	return false;
};

/**
 * Determines if a video element can play a particular file, based on its extension
 */
jwplayer.utils.vidCanPlay = function(video, file) {
	var extension = jwplayer.utils.extension(file);
	if (jwplayer.utils.extensionmap[extension] !== undefined) {
		sourceType = jwplayer.utils.extensionmap[extension];
	} else {
		sourceType = 'video/' + extension + ';';
	}
	return (video.canPlayType(sourceType) || file.toLowerCase().indexOf("youtube.com") > -1);
};

/**
 * Replacement for "outerHTML" getter (not available in FireFox)
 */
jwplayer.utils.getOuterHTML = function(element) {
	if (element.outerHTML) {
		return element.outerHTML;
	} else {
		var parent = element.parentNode;
		var tmp = document.createElement(parent.tagName);
		tmp.appendChild(element);
		var elementHTML = tmp.innerHTML;
		parent.appendChild(element);
		return elementHTML;
	}
};

/**
 * Replacement for outerHTML setter (not available in FireFox)
 */
jwplayer.utils.setOuterHTML = function(element, html) {
	if (element.outerHTML) {
		element.outerHTML = html;
	} else {
		var el = document.createElement('div');
		el.innerHTML = html;
		var range = document.createRange();
		range.selectNodeContents(el);
		var documentFragment = range.extractContents();
		element.parentNode.insertBefore(documentFragment, element);
		element.parentNode.removeChild(element);
	}
};

/**
 * Detects whether or not the current player has flash capabilities
 * TODO: Add minimum flash version constraint: 9.0.115
 */
jwplayer.utils.hasFlash = function() {
	return (typeof navigator.plugins != "undefined" && typeof navigator.plugins['Shockwave Flash'] != "undefined") || (typeof window.ActiveXObject != "undefined");
};

/**
 * Extracts a plugin name from a string
 */
jwplayer.utils.getPluginName = function(pluginName) {
	if (pluginName.lastIndexOf("/") >= 0) {
		pluginName = pluginName.substring(pluginName.lastIndexOf("/")+1, pluginName.length);
	}
	if (pluginName.lastIndexOf("-") >= 0) {
		pluginName = pluginName.substring(0, pluginName.lastIndexOf("-"));
	}
	if (pluginName.lastIndexOf(".swf") >= 0) {
		pluginName = pluginName.substring(0, pluginName.lastIndexOf(".swf"));
	}
	return pluginName;
};
/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 1.0
 * @lastmodifieddate 2010-08-09
 */
(function(jwplayer) {

    jwplayer.utils.mediaparser = function() {};

	var elementAttributes = {
		element: {
			width: 'width',
			height: 'height',
			id: 'id',
			'class': 'className',
			name: 'name'
		},
		media: {
			src: 'file',
			preload: 'preload',
			autoplay: 'autostart',
			loop: 'repeat',
			controls: 'controls'
		},
		source: {
			src: 'file',
			type: 'type',
			media: 'media',
			'data-jw-width': 'width',
			'data-jw-bitrate': 'bitrate'
				
		},
		video: {
			poster: 'image'
		}
	};
	
	var parsers = {};
	
	jwplayer.utils.mediaparser.parseMedia = function(element) {
		return parseElement(element);
	};
	
	function getAttributeList(elementType, attributes) {
		if (attributes === undefined) {
			attributes = elementAttributes[elementType];
		} else {
			jwplayer.utils.extend(attributes, elementAttributes[elementType]);
		}
		return attributes;
	}
	
	function parseElement(domElement, attributes) {
		if (parsers[domElement.tagName.toLowerCase()] && (attributes === undefined)) {
			return parsers[domElement.tagName.toLowerCase()](domElement);
		} else {
			attributes = getAttributeList('element', attributes);
			var configuration = {};
			for (var attribute in attributes) {
				if (attribute != "length") {
					var value = domElement.getAttribute(attribute);
					if (!(value === "" || value === undefined || value === null)) {
						configuration[attributes[attribute]] = domElement.getAttribute(attribute);
					}
				}
			}
			//configuration.screencolor =
			var bgColor = domElement.style['#background-color'];
			if (bgColor && !(bgColor == "transparent" || bgColor == "rgba(0, 0, 0, 0)")) {
				configuration.screencolor = bgColor;
			}
			return configuration;
		}
	}
	
	function parseMediaElement(domElement, attributes) {
		attributes = getAttributeList('media', attributes);
		var sources = [];
		if (jwplayer.utils.isIE()) {
			// IE6/7/8 case
			var currentElement = domElement.nextSibling;
			if (currentElement !== undefined){
				while(currentElement.tagName.toLowerCase() == "source") {
					sources.push(parseSourceElement(currentElement));
					currentElement = currentElement.nextSibling;
				}				
			}
		} else {
			//var sourceTags = domElement.getElementsByTagName("source");
			var sourceTags = jwplayer.utils.selectors("source", domElement);
			for (var i in sourceTags) {
				if (!isNaN(i)){
					sources.push(parseSourceElement(sourceTags[i]));					
				}
			}
		}
		var configuration = parseElement(domElement, attributes);
		if (configuration.file !== undefined) {
			sources[0] = {
				'file': configuration.file
			};
		}
		configuration.levels = sources;
		return configuration;
	}
	
	function parseSourceElement(domElement, attributes) {
		attributes = getAttributeList('source', attributes);
		var result = parseElement(domElement, attributes);
		result.width = result.width ? result.width : 0;
		result.bitrate = result.bitrate ? result.bitrate : 0;
		return result;
	}
	
	function parseVideoElement(domElement, attributes) {
		attributes = getAttributeList('video', attributes);
		var result = parseMediaElement(domElement, attributes);
		return result;
	}
	
	/** For IE browsers, replacing a media element's contents isn't possible, since only the start tag 
	 * is matched by document.getElementById.  This method traverses the elements siblings until it finds 
	 * the closing tag.  If it can't find one, it will not remove the element's siblings.
	 * 
	 * @param toReplace The media element to be replaced
	 * @param html The replacement HTML code (string)
	 **/
	jwplayer.utils.mediaparser.replaceMediaElement = function(toReplace, html) {
		if (jwplayer.utils.isIE()) {
			var endTagFound = false;
			var siblings = [];
			var currentSibling = toReplace.nextSibling;
			while (currentSibling && !endTagFound) {
				siblings.push(currentSibling);
				if (currentSibling.nodeType == 1 && currentSibling.tagName.toLowerCase() == ("/")+toReplace.tagName.toLowerCase() ) {
					endTagFound = true;
				}
				currentSibling = currentSibling.nextSibling;
			}
			if (endTagFound) {
				while (siblings.length > 0) {
					var element = siblings.pop();
					element.parentNode.removeChild(element);
				}
			}
			
			// TODO: This is not required to fix [ticket:1094], but we may want to do it anyway
			// jwplayer.utils.setOuterHTML(toReplace, html);
			toReplace.outerHTML = html;
		}
	};
	
	parsers.media = parseMediaElement;
	parsers.audio = parseMediaElement;
	parsers.source = parseSourceElement;
	parsers.video = parseVideoElement;
	
	
})(jwplayer);
jwplayer.utils.selectors = function(selector, parent){
	if (parent === undefined) {
		parent = document;
	}
	selector = jwplayer.utils.strings.trim(selector);
	var selectType = selector.charAt(0);
	if (selectType == "#"){
		return parent.getElementById(selector.substr(1));
	} else if (selectType == "."){
		if (parent.getElementsByClassName) {
			return parent.getElementsByClassName(selector.substr(1));
		} else {
			return jwplayer.utils.selectors.getElementsByTagAndClass("*", selector.substr(1));
		}
	} else {
		if (selector.indexOf(".") > 0){
			selectors = selector.split(".");
			return jwplayer.utils.selectors.getElementsByTagAndClass(selectors[0], selectors[1]);
		} else {
			return parent.getElementsByTagName(selector);
		}
	}
	return null;
};

jwplayer.utils.selectors.getElementsByTagAndClass = function(tagName, className, parent) {
	elements = [];
	if (parent === undefined) {
		parent = document;
	}
	var selected = parent.getElementsByTagName(tagName);
	for (var i = 0; i < selected.length; i++){
		if (selected[i].className !== undefined){
			var classes = selected[i].className.split(" ");
			for (var classIndex = 0; classIndex < classes.length; classIndex++){
				if (classes[classIndex] == className){
					elements.push(selected[i]);
				}
			}
		}
	}
	return elements;
};jwplayer.utils.strings = function(){};

/** Removes whitespace from the beginning and end of a string **/
jwplayer.utils.strings.trim = function(inputString){
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};/**
 * JW Player Media Extension to Mime Type mapping
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.utils.extensionmap = {
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
		"webm": "video/webm",
		"m3u8": "audio/x-mpegurl"
	};
})(jwplayer);
(function(jwplayer) {
	var _players = [];
	
	jwplayer.constructor = function(container) {
		return jwplayer.api.selectPlayer(container);
	};
	
	jwplayer.api = function() {
	};
	
	jwplayer.api.events = {
		API_READY: 'jwplayerAPIReady',
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
		JWPLAYER_RESIZE: 'jwplayerResize',
		JWPLAYER_ERROR: 'jwplayerError',
		JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
		JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
		JWPLAYER_MEDIA_ERROR: 'jwplayerMediaError',
		JWPLAYER_MEDIA_LOADED: 'jwplayerMediaLoaded',
		JWPLAYER_MEDIA_COMPLETE: 'jwplayerMediaComplete',
		JWPLAYER_MEDIA_TIME: 'jwplayerMediaTime',
		JWPLAYER_MEDIA_VOLUME: 'jwplayerMediaVolume',
		JWPLAYER_MEDIA_META: 'jwplayerMediaMeta',
		JWPLAYER_MEDIA_MUTE: 'jwplayerMediaMute',
		JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState',
		JWPLAYER_PLAYLIST_LOADED: 'jwplayerPlaylistLoaded',
		JWPLAYER_PLAYLIST_ITEM: 'jwplayerPlaylistItem'
	};
	
	jwplayer.api.events.state = {
		BUFFERING: 'BUFFERING',
		IDLE: 'IDLE',
		PAUSED: 'PAUSED',
		PLAYING: 'PLAYING'
	};
	
	jwplayer.api.PlayerAPI = function(container) {
		this.container = container;
		this.id = container.id;
		
		var _listeners = {};
		var _stateListeners = {};
		var _readyListeners = [];
		var _player = undefined;
		var _playerReady = false;
		var _queuedCalls = [];
		
		var _originalHTML = jwplayer.utils.getOuterHTML(container);
		
		var _itemMeta = {};
		var _currentItem = 0;
		
		/** Use this function to set the internal low-level player.  This is a javascript object which contains the low-level API calls. **/
		this.setPlayer = function(player) {
			_player = player;
		};
		
		this.stateListener = function(state, callback) {
			if (!_stateListeners[state]) {
				_stateListeners[state] = [];
				this.eventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, stateCallback(state));
			}
			_stateListeners[state].push(callback);
			return this;
		};
		
		function stateCallback(state) {
			return function(args) {
				var newstate = args.newstate, oldstate = args.oldstate;
				if (newstate == state) {
					var callbacks = _stateListeners[newstate];
					if (callbacks) {
						for (var c = 0; c < callbacks.length; c++) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, {
									oldstate: oldstate,
									newstate: newstate
								});
							}
						}
					}
				}
			};
		}
		
		this.addInternalListener = function(player, type) {
			player.jwAddEventListener(type, 'function(dat) { jwplayer("' + this.id + '").dispatchEvent("' + type + '", dat); }');
		};
		
		this.eventListener = function(type, callback) {
			if (!_listeners[type]) {
				_listeners[type] = [];
				if (_player && _playerReady) {
					this.addInternalListener(_player, type);
				}
			}
			_listeners[type].push(callback);
			return this;
		};
		
		this.dispatchEvent = function(type) {
			if (_listeners[type]) {
				var args = translateEventResponse(type, arguments[1]);
				for (var l = 0; l < _listeners[type].length; l++) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].call(this, args);
					}
				}
			}
		};
		
		function translateEventResponse(type, eventProperties) {
			var translated = jwplayer.utils.extend({}, eventProperties);
			if (type == jwplayer.api.events.JWPLAYER_FULLSCREEN) {
				translated.fullscreen = translated.message;
				delete translated.message;
			} else if (type == jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM) {
				if (translated.item && translated.index === undefined) {
					translated.index = translated.item;
					delete translated.item;
				}
			} else if (typeof translated.data == "object") {
				// Takes ViewEvent "data" block and moves it up a level
				translated = jwplayer.utils.extend(translated, translated.data);
				delete translated.data;
			}
			
			return translated;
		}
		
		this.callInternal = function(funcName, args) {
			if (_playerReady) {
				if (typeof _player != "undefined" && typeof _player[funcName] == "function") {
					if (args !== undefined) {
						return (_player[funcName])(args);
					} else {
						return (_player[funcName])();
					}
				}
				return null;
			} else {
				_queuedCalls.push({
					method: funcName,
					parameters: args
				});
			}
		};
		
		this.playerReady = function(obj) {
			_playerReady = true;
			if (!_player) {
				this.setPlayer(document.getElementById(obj.id));
			}
			this.container = document.getElementById(this.id);
			
			for (var eventType in _listeners) {
				this.addInternalListener(_player, eventType);
			}
			
			this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, function(data) {
				if (data.index !== undefined) {
					// Flash player item event
					_currentItem = data.index;
				} else if (data.item !== undefined) {
					// HTML5 player item event
					_currentItem = data.item;
				}
				// TODO: reconcile API discrepancies
				_itemMeta = {};
			});
			
			this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, function(data) {
				jwplayer.utils.extend(_itemMeta, data.metadata);
			});
			
			this.dispatchEvent(jwplayer.api.events.API_READY);
			
			while (_queuedCalls.length > 0) {
				var call = _queuedCalls.shift();
				this.callInternal(call.method, call.parameters);
			}
		};
		
		this.getItemMeta = function() {
			return _itemMeta;
		};
		
		this.getCurrentItem = function() {
			return _currentItem;
		};
		
		this.destroy = function() {
			_listeners = {};
			_queuedCalls = [];
			if (jwplayer.utils.getOuterHTML(this.container) != _originalHTML) {
				jwplayer.api.destroyPlayer(this.id, _originalHTML);
			}
		};
		
		
		/** Using this function instead of array.slice since Arguments are not an array **/
		function slice(list, from, to) {
			var ret = [];
			if (!from) {
				from = 0;
			}
			if (!to) {
				to = list.length - 1;
			}
			for (var i = from; i <= to; i++) {
				ret.push(list[i]);
			}
			return ret;
		}
		
	};
	
	jwplayer.api.PlayerAPI.prototype = {
		// Player properties
		container: undefined,
		options: undefined,
		id: undefined,
		
		// Player Getters
		getBuffer: function() {
			return this.callInternal('jwGetBuffer');
		},
		getDuration: function() {
			return this.callInternal('jwGetDuration');
		},
		getFullscreen: function() {
			return this.callInternal('jwGetFullscreen');
		},
		getHeight: function() {
			return this.callInternal('jwGetHeight');
		},
		getLockState: function() {
			return this.callInternal('jwGetLockState');
		},
		getMeta: function() {
			return this.getItemMeta();
		},
		getMute: function() {
			return this.callInternal('jwGetMute');
		},
		getPlaylist: function() {
			var playlist = this.callInternal('jwGetPlaylist');
			for (var i = 0; i < playlist.length; i++) {
				if (playlist[i].index === undefined) {
					playlist[i].index = i;
				}
			}
			return playlist;
		},
		getPlaylistItem: function(item) {
			if (item === undefined) {
				item = this.getCurrentItem();
			}
			return this.getPlaylist()[item];
		},
		getPosition: function() {
			return this.callInternal('jwGetPosition');
		},
		getState: function() {
			return this.callInternal('jwGetState');
		},
		getVolume: function() {
			return this.callInternal('jwGetVolume');
		},
		getWidth: function() {
			return this.callInternal('jwGetWidth');
		},
		
		// Player Public Methods
		setFullscreen: function(fullscreen) {
			if (fullscreen === undefined) {
				this.callInternal("jwSetFullscreen", true);
			} else {
				this.callInternal("jwSetFullscreen", fullscreen);
			}
			return this;
		},
		setMute: function(mute) {
			if (mute === undefined) {
				this.callInternal("jwSetMute", true);
			} else {
				this.callInternal("jwSetMute", mute);
			}
			return this;
		},
		lock: function() {
			return this;
		},
		unlock: function() {
			return this;
		},
		load: function(toLoad) {
			this.callInternal("jwLoad", toLoad);
			return this;
		},
		playlistItem: function(item) {
			this.callInternal("jwPlaylistItem", item);
			return this;
		},
		playlistPrev: function() {
			this.callInternal("jwPlaylistPrev");
			return this;
		},
		playlistNext: function() {
			this.callInternal("jwPlaylistNext");
			return this;
		},
		resize: function(width, height) {
			this.container.width = width;
			this.container.height = height;
			return this;
		},
		play: function(state) {
			if (typeof state === "undefined") {
				state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("jwPause");
				} else {
					this.callInternal("jwPlay");
				}
			} else {
				this.callInternal("jwPlay", state);
			}
			return this;
		},
		pause: function() {
			var state = this.getState();
			switch (state) {
				case jwplayer.api.events.state.PLAYING:
				case jwplayer.api.events.state.BUFFERING:
					this.callInternal("jwPause");
					break;
				case jwplayer.api.events.state.PAUSED:
					this.callInternal("jwPlay");
					break;
			}
			return this;
		},
		stop: function() {
			this.callInternal("jwStop");
			return this;
		},
		seek: function(position) {
			this.callInternal("jwSeek", position);
			return this;
		},
		setVolume: function(volume) {
			this.callInternal("jwSetVolume", volume);
			return this;
		},
		
		// Player Events
		onBufferChange: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, callback);
		},
		onBufferFull: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, callback);
		},
		onError: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_ERROR, callback);
		},
		onFullscreen: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, callback);
		},
		onMeta: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, callback);
		},
		onMute: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, callback);
		},
		onPlaylist: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, callback);
		},
		onPlaylistItem: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, callback);
		},
		onReady: function(callback) {
			return this.eventListener(jwplayer.api.events.API_READY, callback);
		},
		onResize: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_RESIZE, callback);
		},
		onComplete: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, callback);
		},
		onTime: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, callback);
		},
		onVolume: function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, callback);
		},
		
		// State events
		onBuffer: function(callback) {
			return this.stateListener(jwplayer.api.events.state.BUFFERING, callback);
		},
		onPause: function(callback) {
			return this.stateListener(jwplayer.api.events.state.PAUSED, callback);
		},
		onPlay: function(callback) {
			return this.stateListener(jwplayer.api.events.state.PLAYING, callback);
		},
		onIdle: function(callback) {
			return this.stateListener(jwplayer.api.events.state.IDLE, callback);
		},
		
		setup: function(options) {
			return this;
		},
		remove: function() {
			this.destroy();
		},
		
		// Player plugin API
		initializePlugin: function(pluginName, pluginCode) {
			return this;
		}
		
	};
	
	jwplayer.api.selectPlayer = function(identifier) {
		var _container;
		
		if (identifier === undefined) {
			identifier = 0;
		}
		
		if (identifier.nodeType) {
			// Handle DOM Element
			_container = identifier;
		} else if (typeof identifier == 'string') {
			// Find container by ID
			_container = document.getElementById(identifier);
		}
		
		if (_container) {
			var foundPlayer = jwplayer.api.playerById(_container.id);
			if (foundPlayer) {
				return foundPlayer;
			} else {
				// Todo: register new object
				return jwplayer.api.addPlayer(new jwplayer.api.PlayerAPI(_container));
			}
		} else if (typeof identifier == 'number') {
			return jwplayer.getPlayers()[identifier];
		}
		
		return null;
	};
	
	jwplayer.api.playerById = function(id) {
		for (var p = 0; p < _players.length; p++) {
			if (_players[p].id == id) {
				return _players[p];
			}
		}
		return null;
	};
	
	jwplayer.api.addPlayer = function(player) {
		for (var p = 0; p < _players.length; p++) {
			if (_players[p] == player) {
				return player; // Player is already in the list;
			}
		}
		
		_players.push(player);
		return player;
	};
	
	jwplayer.api.destroyPlayer = function(playerId, replacementHTML) {
		var index = -1;
		for (var p = 0; p < _players.length; p++) {
			if (_players[p].id == playerId) {
				index = p;
				continue;
			}
		}
		if (index >= 0) {
			var toDestroy = document.getElementById(_players[index].id);
			if (toDestroy) {
				if (replacementHTML) {
					jwplayer.utils.setOuterHTML(toDestroy, replacementHTML);
				} else {
					var replacement = document.createElement('div');
					replacement.setAttribute('id', toDestroy.id);
					toDestroy.parentNode.replaceChild(replacement, toDestroy);
				}
			}
			_players.splice(index, 1);
		}
		
		return null;
	};
	
	// Can't make this a read-only getter, thanks to IE incompatibility.
	jwplayer.getPlayers = function() {
		return _players.slice(0);
	};
	
})(jwplayer);

var _userPlayerReady = (typeof playerReady == 'function') ? playerReady : undefined;

playerReady = function(obj) {
	var api = jwplayer.api.playerById(obj.id);
	if (api) {
		api.playerReady(obj);
	}
	
	if (_userPlayerReady) {
		_userPlayerReady.call(this, obj);
	}
};
(function(jwplayer) {

	jwplayer.embed = function() {
	};
	
	jwplayer.embed.Embedder = function(playerApi) {
		this.constructor(playerApi);
	};
	
	jwplayer.embed.defaults = {
		width: 400,
		height: 300,
		players: [{
			type: "flash",
			src: "player.swf"
		}, {
			type: 'html5'
		},
		{
			type: 'download'
		}],
		components: {
			controlbar: {
				position: 'over'
			}
		}
	};
	
	jwplayer.embed.Embedder.prototype = {
		config: undefined,
		api: undefined,
		events: {},
		players: undefined,
		
		constructor: function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = this.parseConfig(jwplayer.utils.extend({}, jwplayer.embed.defaults, mediaConfig, this.api.config));
		},
		
		embedPlayer: function() {
			// TODO: Parse playlist for playable content
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
					case 'flash':
						if (jwplayer.utils.hasFlash()) {
							if (this.config.file && !this.config.provider) {
								switch (jwplayer.utils.extension(this.config.file).toLowerCase()) {
									case "webm":
									case "ogv":
									case "ogg":
										this.config.provider = "video";
										break;
								}
							}
							
							// TODO: serialize levels & playlist, de-serialize in
							// Flash
							if (this.config.levels || this.config.playlist) {
								this.api.onReady(this.loadAfterReady(this.config));
							}
							
							// Make sure we're passing the correct ID into Flash for
							// Linux API support
							this.config.id = this.api.id;
							
							// TODO: [ticket:1066]
							// this.config.netstreambasepath = window.location.href
							
							var flashPlayer = jwplayer.embed.embedFlash(document.getElementById(this.api.id), player, this.config);
							this.api.container = flashPlayer;
							this.api.setPlayer(flashPlayer);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
					case 'html5':
						if (jwplayer.utils.hasHTML5(this.config)) {
							var html5player = jwplayer.embed.embedHTML5(document.getElementById(this.api.id), player, this.config);
							this.api.container = document.getElementById(this.api.id);
							this.api.setPlayer(html5player);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
					case 'download':
						// TODO: [ticket:1076]
						break;
				}
			} else {
				this.api.container.innerHTML = "<p>No suitable players found</p>";
			}
			
			this.setupEvents();
			
			return this.api;
		},
		
		setupEvents: function() {
			for (evt in this.events) {
				if (typeof this.api[evt] == "function") {
					(this.api[evt]).call(this.api, this.events[evt]);
				}
			}
		},
		
		loadAfterReady: function(loadParams) {
			return function(obj) {
				if (loadParams.playlist) {
					this.load(loadParams.playlist);
				} else if (loadParams.levels) {
					var item = this.getPlaylistItem(0);
					if (!item) {
						item = {
							file: loadParams.levels[0].file,
							provider: (loadParams.provider ? loadParams.provider : "video")
						};
					}
					if (!item.image) {
						item.image = loadParams.image;
					}
					item.levels = loadParams.levels;
					this.load(item);
				}
			};
		},
		
		parseConfig: function(config) {
			var parsedConfig = jwplayer.utils.extend({}, config);
			if (parsedConfig.events) {
				this.events = parsedConfig.events;
				delete parsedConfig.events;
			}
			if (parsedConfig.players) {
				this.players = parsedConfig.players;
				delete parsedConfig.players;
			}
			if (parsedConfig.plugins) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parsePlugins(parsedConfig.plugins));
				}
			}
			
			if (parsedConfig.playlist && typeof parsedConfig.playlist === "string" && !parsedConfig['playlist.position']) {
				parsedConfig['playlist.position'] = parsedConfig.playlist;
				delete parsedConfig.playlist;
			}
			
			if (parsedConfig.controlbar && typeof parsedConfig.controlbar === "string" && !parsedConfig['controlbar.position']) {
				parsedConfig['controlbar.position'] = parsedConfig.controlbar;
				delete parsedConfig.controlbar;
			}
			
			return parsedConfig;
		}
		
	};
	
	
	
	jwplayer.embed.embedFlash = function(_container, _player, _options) {
		var params = jwplayer.utils.extend({}, _options);
		
		var width = params.width;
		delete params.width;
		
		var height = params.height;
		delete params.height;
		
		delete params.levels;
		delete params.playlist;
		
		jwplayer.embed.parseConfigBlock(params, 'components');
		jwplayer.embed.parseConfigBlock(params, 'providers');
		
		if (jwplayer.utils.isIE()) {
			var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' +
			'width="' +
			width +
			'" height="' +
			height +
			'" ' +
			'id="' +
			_container.id +
			'" name="' +
			_container.id +
			'">';
			html += '<param name="movie" value="' + _player.src + '">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="allowscriptaccess" value="always">';
			html += '<param name="wmode" value="opaque">';
			html += '<param name="flashvars" value="' +
			jwplayer.embed.jsonToFlashvars(params) +
			'">';
			html += '</object>';
			if (_container.tagName.toLowerCase() == "video") {
				jwplayer.utils.mediaparser.replaceMediaElement(_container, html);
			} else {
				// TODO: This is not required to fix [ticket:1094], but we may want to do it anyway 
				// jwplayer.utils.setOuterHTML(_container, html);
				_container.outerHTML = html;
			}
			return document.getElementById(_container.id);
		} else {
			var obj = document.createElement('object');
			obj.setAttribute('type', 'application/x-shockwave-flash');
			obj.setAttribute('data', _player.src);
			obj.setAttribute('width', width);
			obj.setAttribute('height', height);
			obj.setAttribute('id', _container.id);
			obj.setAttribute('name', _container.id);
			jwplayer.embed.appendAttribute(obj, 'allowfullscreen', 'true');
			jwplayer.embed.appendAttribute(obj, 'allowscriptaccess', 'always');
			jwplayer.embed.appendAttribute(obj, 'wmode', 'opaque');
			jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed.jsonToFlashvars(params));
			_container.parentNode.replaceChild(obj, _container);
			return obj;
		}
		
	};
	
	jwplayer.embed.embedHTML5 = function(container, player, options) {
		if (jwplayer.html5) {
			container.innerHTML = "";
			var playerOptions = jwplayer.utils.extend({
				screencolor: '0x000000'
			}, options);
			jwplayer.embed.parseConfigBlock(playerOptions, 'components');
			// TODO: remove this requirement from the html5 player (sources
			// instead of levels)
			if (playerOptions.levels && !playerOptions.sources) {
				playerOptions.sources = options.levels;
			}
			if (playerOptions.skin && playerOptions.skin.toLowerCase().indexOf(".zip") > 0) {
				playerOptions.skin = playerOptions.skin.replace(/\.zip/i, ".xml");
			}
			return new (jwplayer.html5(container)).setup(playerOptions);
		} else {
			return null;
		}
	};
	
	jwplayer.embed.appendAttribute = function(object, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		object.appendChild(param);
	};
	
	jwplayer.embed.jsonToFlashvars = function(json) {
		var flashvars = '';
		for (key in json) {
			flashvars += key + '=' + escape(json[key]) + '&';
		}
		return flashvars.substring(0, flashvars.length - 1);
	};
	
	jwplayer.embed.parsePlugins = function(pluginBlock) {
		if (!pluginBlock) {
			return {};
		}
		
		var flat = {}, pluginKeys = [];
		
		for (plugin in pluginBlock) {
			var pluginName = jwplayer.utils.getPluginName(plugin);
			var pluginConfig = pluginBlock[plugin];
			pluginKeys.push(plugin);
			for (param in pluginConfig) {
				flat[pluginName + '.' + param] = pluginConfig[param];
			}
		}
		flat.plugins = pluginKeys.join(',');
		return flat;
	};
	
	jwplayer.embed.parseConfigBlock = function(options, blockName) {
		if (options[blockName]) {
			var components = options[blockName];
			for (var name in components) {
				var component = components[name];
				if (typeof component == "string") {
					// i.e. controlbar="over"
					if (!options[name]) {
						options[name] = component;
					}
				} else {
					// i.e. controlbar.position="over"
					for (var option in component) {
						if (!options[name + '.' + option]) {
							options[name + '.' + option] = component[option];
						}
					}
				}
			}
			delete options[blockName];
		}
	};
	
	jwplayer.api.PlayerAPI.prototype.setup = function(options, players) {
		if (options && options.flashplayer && !options.players) {
			options.players = [{
				type: 'flash',
				src: options.flashplayer
			}, {
				type: 'html5'
			}];
			delete options.flashplayer;
		}
		if (players && !options.players) {
			if (typeof players == "string") {
				options.players = [{
					type: "flash",
					src: players
				}];
			} else if (players instanceof Array) {
				options.players = players;
			} else if (typeof players == "object" && players.type) {
				options.players = [players];
			}
		}
		
		// Destroy original API on setup() to remove existing listeners
		var newId = this.id;
		this.remove();
		var newApi = jwplayer(newId);
		newApi.config = options;
		return (new jwplayer.embed.Embedder(newApi)).embedPlayer();
	};
	
	function noviceEmbed() {
		if (!document.body) {
			return setTimeout(noviceEmbed, 15);
		}
		var videoTags = jwplayer.utils.selectors.getElementsByTagAndClass('video', 'jwplayer');
		for (var i = 0; i < videoTags.length; i++) {
			var video = videoTags[i];
			jwplayer(video.id).setup({
				players: [{
					type: 'flash',
					src: '/jwplayer/player.swf'
				}, {
					type: 'html5'
				}]
			});
		}
	}
	
	noviceEmbed();
	
	
})(jwplayer);
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
	
	jwplayer.html5.version = '5.3';
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
	
	/** Gets an absolute file path based on a relative filepath **/
	jwplayer.html5.utils.getAbsolutePath = function(path) {
		if (path === undefined) {
			return undefined;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = document.location.href.substring(0, document.location.href.indexOf("://") + 3);
		var domain = document.location.href.substring(protocol.length, document.location.href.indexOf('/', protocol.length + 1));
		var patharray;
		if (path.indexOf("/") === 0) {
			patharray = path.split("/");
		} else {
			var basepath = document.location.href.split("?")[0];
			basepath = basepath.substring(protocol.length + domain.length + 1, basepath.lastIndexOf('/'));
			patharray = basepath.split("/").concat(path.split("/"));
		}
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if (!patharray[i] || patharray[i] === undefined || patharray[i] == ".") {
				continue;
			} else if (patharray[i] == "..") {
				result.pop();
			} else {
				result.push(patharray[i]);
			}
		}
		return protocol + domain + "/" + result.join("/");
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
		if (typeof console != "undefined" && typeof console.log != "undefined") {
			if (obj) {
				console.log(msg, obj);
			} else {
				console.log(msg);
			}
		}
	};
	
	jwplayer.html5.utils.css = function(domelement, styles, debug) {
		if (domelement !== undefined) {
			for (var style in styles) {
				try {
					if (typeof styles[style] === "undefined") {
						continue;
					} else if (typeof styles[style] == "number" && !(style == "zIndex" || style == "opacity")) {
						if (isNaN(styles[style])) {
							continue;
						}
						if (style.match(/color/i)) {
							styles[style] = "#" + _pad(styles[style].toString(16), 6);
						} else {
							styles[style] = styles[style] + "px";
						}
					}
					domelement.style[style] = styles[style];
				} catch (err) {
				}
			}
		}
	};
	
	function _pad(string, length) {
		while (string.length < length) {
			string = "0" + string;
		}
		return string;
	}
	
	jwplayer.html5.utils.isYouTube = function(path) {
		return path.indexOf("youtube.com") > -1;
	};
	
	jwplayer.html5.utils.getYouTubeId = function(path) {
		path.indexOf("youtube.com" > 0);
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
		var _prevElement;
		var _elements = {};
		var _ready = false;
		var _positions = {};
		
		
		function _buildBase() {
			_marginleft = 0;
			_marginright = 0;
			_dividerid = 0;
			if (!_ready) {
				var wrappercss = {
					height: _api.skin.getSkinElement("controlbar", "background").height,
					backgroundColor: _settings.backgroundcolor
				};
				
				_wrapper = document.createElement("div");
				_wrapper.id = _api.id + "_jwplayer_controlbar";
				_css(_wrapper, wrappercss);
			}
			
			_addElement("capLeft", "left", false, _wrapper);
			var domelementcss = {
				position: "absolute",
				height: _api.skin.getSkinElement("controlbar", "background").height,
				background: " url(" + _api.skin.getSkinElement("controlbar", "background").src + ") repeat-x center left",
				left: _api.skin.getSkinElement("controlbar", "capLeft").width
			};
			_appendNewElement("elements", _wrapper, domelementcss);
			_addElement("capRight", "right", false, _wrapper);
		}
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			jwplayer.html5.utils.cancelAnimation(_wrapper);
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
		
		function _updatePositions() {
			var positionElements = ["timeSlider", "volumeSlider", "timeSliderRail", "volumeSliderRail"];
			for (var positionElement in positionElements) {
				var elementName = positionElements[positionElement];
				if (typeof _elements[elementName] != "undefined") {
					_positions[elementName] = _elements[elementName].getBoundingClientRect();
				}
			}
		}
		
		
		function _setVisiblity() {
			jwplayer.html5.utils.cancelAnimation(_wrapper);
			if (_remainVisible()) {
				jwplayer.html5.utils.fadeTo(_wrapper, 1, 0, 1, 0);
			} else {
				jwplayer.html5.utils.fadeTo(_wrapper, 0, 0.1, 1, 2);
			}
		}
		
		function _remainVisible() {
			if (_api.jwGetState() == jwplayer.api.events.state.IDLE || _api.jwGetState() == jwplayer.api.events.state.PAUSED) {
				if (_settings.idlehide) {
					return false;
				}
				return true;
			}
			if (_api.jwGetFullscreen()) {
				return false;
			}
			if (_settings.position.toUpperCase() == jwplayer.html5.view.positions.OVER) {
				return false;
			}
			return true;
		}
		
		function _appendNewElement(id, parent, css) {
			var element;
			if (!_ready) {
				element = document.createElement("div");
				_elements[id] = element;
				element.id = _wrapper.id + "_" + id;
				parent.appendChild(element);
			} else {
				element = document.getElementById(_wrapper.id + "_" + id);
			}
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
		
		function getNewDividerId() {
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
					_addElement("divider" + getNewDividerId(), alignment, true);
					break;
				case "prev":
					_addElement("prevButton", alignment, true);
					_buildHandler("prevButton", "jwPlaylistPrev");
					break;
				case "next":
					_addElement("nextButton", alignment, true);
					_buildHandler("nextButton", "jwPlaylistNext");
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
				
				if (_ready) {
					_css(_elements[element], css);
				} else {
					var newelement = _appendNewElement(element, parent, css);
					if (_api.skin.getSkinElement("controlbar", element + "Over") !== undefined) {
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
				_api.jwSeek(pos);
				if (_api.jwGetState() != jwplayer.api.events.state.PLAYING) {
					_api.jwPlay();
				}
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
			if (event.bufferPercent !== null) {
				_currentBuffer = event.bufferPercent;
			}
			var wid = _positions.timeSliderRail.width;
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
			var progressWidth = isNaN(Math.round(_positions.timeSliderRail.width * progress)) ? 0 : Math.round(_positions.timeSliderRail.width * progress);
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
		
		
		function cleanupDividers() {
			var lastElement, lastVisibleElement;
			var childNodes = document.getElementById(_wrapper.id + "_elements").childNodes;
			for (var childNode in document.getElementById(_wrapper.id + "_elements").childNodes) {
				if (isNaN(parseInt(childNode, 10))) {
					continue;
				}
				if (childNodes[childNode].id.indexOf(_wrapper.id + "_divider") === 0 && lastVisibleElement.id.indexOf(_wrapper.id + "_divider") === 0) {
					childNodes[childNode].style.display = "none";
				} else if (childNodes[childNode].id.indexOf(_wrapper.id + "_divider") === 0 && lastElement.style.display != "none") {
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
			_updatePositions();
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
			_updatePositions();
			_ready = true;
			_addListeners();
			_init();
			_wrapper.style.opacity = _settings.idlehide ? 0 : 1;
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
		var _api = api;
		var _model = model;
		var _view = view;
		var _container = container;
		var _itemUpdated = true;
		
		var debug = (_model.config.debug !== undefined) && (_model.config.debug.toString().toLowerCase() == 'console');
		var _eventDispatcher = new jwplayer.html5.eventdispatcher(_container.id, debug);
		jwplayer.utils.extend(this, _eventDispatcher);
		
		function forward(evt) {
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		_model.addGlobalListener(forward);
		
		function _play() {
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					if (_itemUpdated || _model.state == jwplayer.api.events.state.IDLE) {
						_model.setActiveMediaProvider(_model.playlist[_model.item]);
						_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, function() {
							_model.getMedia().play();
						});
						if (_model.config.repeat) {
							_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, function(evt) {
								setTimeout(_completeHandler, 25);
							});
						}
						_model.getMedia().load(_model.playlist[_model.item]);
						_itemUpdated = false;
					} else if (_model.state == jwplayer.api.events.state.PAUSED) {
						_model.getMedia().play();
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
				if (_model.playlist[0].levels[0].file.length > 0 && _model.state != jwplayer.api.events.state.IDLE) {
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
					if (_model.config.shuffle) {
						_item(_getShuffleItem());
					} else if (_model.item + 1 == _model.playlist.length) {
						_item(0);
					} else {
						_item(_model.item + 1);
					}
				}
				if (_model.state != jwplayer.api.events.state.PLAYING && _model.state != jwplayer.api.events.state.BUFFERING) {
					_play();
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
					if (_model.config.shuffle) {
						_item(_getShuffleItem());
					} else if (_model.item === 0) {
						_item(_model.playlist.length - 1);
					} else {
						_item(_model.item - 1);
					}
				}
				if (_model.state != jwplayer.api.events.state.PLAYING && _model.state != jwplayer.api.events.state.BUFFERING) {
					_play();
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		function _getShuffleItem() {
			var result = null;
			if (_model.playlist.length > 1) {
				while (result === null) {
					result = Math.floor(Math.random() * _model.playlist.length);
					if (result == _model.item) {
						result = null;
					}
				}
			} else {
				result = 0;
			}
			return result;
		}
		
		/** Stop playback and loading of the video. **/
		function _item(item) {
			_model.resetEventListeners();
			_model.addGlobalListener(forward);
			try {
				if (_model.playlist[0].levels[0].file.length > 0) {
					var oldstate = _model.state;
					if (oldstate !== jwplayer.api.events.state.IDLE) {
						_stop();
					}
					_model.item = item;
					_itemUpdated = true;
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
				_model.fullscreen = state;
				_view.fullscreen(state);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Loads a new video **/
		function _load(arg) {
			try {
				_stop();
				_model.loadPlaylist(arg);
				_itemUpdated = true;
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		jwplayer.html5.controller.repeatoptions = {
			LIST: "LIST",
			ALWAYS: "ALWAYS",
			SINGLE: "SINGLE",
			NONE: "NONE"
		};
		
		function _completeHandler() {
			_model.resetEventListeners();
			_model.addGlobalListener(forward);
			switch (_model.config.repeat.toUpperCase()) {
				case jwplayer.html5.controller.repeatoptions.SINGLE:
					_play();
					break;
				case jwplayer.html5.controller.repeatoptions.ALWAYS:
					if (_model.item == _model.playlist.length - 1 && !_model.config.shuffle) {
						_item(0);
						_play();
					} else {
						_next();
					}
					break;
				case jwplayer.html5.controller.repeatoptions.LIST:
					if (_model.item == _model.playlist.length - 1 && !_model.config.shuffle) {
						_item(0);
					} else {
						_next();
					}
					break;
			}
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
		var _error;
		var _bufferRotation = _api.skin.getComponentSettings("display").bufferrotation === undefined ? 15 : parseInt(_api.skin.getComponentSettings("display").bufferrotation, 10);
		var _bufferInterval = _api.skin.getComponentSettings("display").bufferinterval === undefined ? 100 : parseInt(_api.skin.getComponentSettings("display").bufferinterval, 10);
		var _elements = {
			display: {
				style: {
					cursor: "pointer",
					top: 0,
					left: 0
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
			if (_error) {
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
			if (_api.skin.getSkinElement("display", newIcon + "Over") !== undefined) {
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
		
		function _stateHandler(evt) {
			if ((evt.type == jwplayer.api.events.JWPLAYER_PLAYER_STATE ||
			evt.type == jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM) &&
			_error) {
				_error = false;
				_hide(_display.display_text);
			}
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
					_setDisplayIcon("playIcon");
					break;
				case jwplayer.api.events.state.IDLE:
					if (_api.jwGetPlaylist()[_api.jwGetItem()].image) {
						_css(_display.display_image, {
							display: "block"
						});
						_display.display_image.src = jwplayer.html5.utils.getAbsolutePath(_api.jwGetPlaylist()[_api.jwGetItem()].image);
					} else {
						_css(_display.display_image, {
							display: "none"
						});
						delete _display.display_image.src;
					}
					_setDisplayIcon("playIcon");
					break;
				default:
					if (_api.jwGetMute()) {
						_css(_display.display_image, {
							display: "none"
						});
						delete _display.display_image.src;
						_setDisplayIcon("muteIcon");
					} else {
						_css(_display.display_image, {
							display: "none"
						});
						delete _display.display_image.src;
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
		var _id = id;
		var _debug = debug;
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
				for (var listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
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
				for (var globalListenerIndex = 0; globalListenerIndex < _globallisteners.length; globalListenerIndex++) {
					if (_globallisteners[globalListenerIndex].toString() == listener.toString()) {
						_globallisteners.slice(globalListenerIndex, globalListenerIndex + 1);
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
				id: _id,
				version: jwplayer.html5.version,
				type: type
			});
			if (_debug) {
				jwplayer.html5.utils.log(type, data);
			}
			if (typeof _listeners[type] != "undefined") {
				for (var listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
					try {
						_listeners[type][listenerIndex].listener(data);
					} catch (err) {
						jwplayer.html5.utils.log("There was an error while handling a listener", _listeners[type][listenerIndex].listener, err);
					}
					if (_listeners[type][listenerIndex].count === 1) {
						delete _listeners[type][listenerIndex];
					} else if (_listeners[type][listenerIndex].count > 0) {
						_listeners[type][listenerIndex].count = _listeners[type][listenerIndex].count - 1;
					}
				}
			}
			for (var globalListenerIndex = 0; globalListenerIndex < _globallisteners.length; globalListenerIndex++) {
				try {
					_globallisteners[globalListenerIndex].listener(data);
				} catch (err) {
					jwplayer.html5.utils.log("There was an error while handling a listener", _globallisteners[globalListenerIndex].listener, err);
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
 * JW Player logo component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _defaults = {
		prefix: "http://l.longtailvideo.com/html5/",
		file: "logo.png",
		link: "http://www.longtailvideo.com/players/jw-flv-player/",
		margin: 8,
		out: 0.5,
		over: 1,
		timeout: 3,
		hide: true,
		position: "bottom-left"
	};
	
	_css = jwplayer.html5.utils.css;
	
	jwplayer.html5.logo = function(api, logoConfig) {
		var _api = api;
		var _timeout;
		
		if (_defaults.prefix) {
			var version = api.version.split(/\W/).splice(0, 2).join("/");
			if (_defaults.prefix.indexOf(version) < 0) {
				_defaults.prefix += version + "/";
			}
		}
		
		if (logoConfig.position == jwplayer.html5.view.positions.OVER){
			logoConfig.position = _defaults.position;
		}
		
		var _settings = jwplayer.utils.extend({}, _defaults, logoConfig);
		
		if (!_settings.file){
			return;
		}
		
		var _logo = document.createElement("img");
		_logo.id = _api.id + "_jwplayer_logo";
		_logo.style.display = "none";
		
		_logo.onload = function(evt) {
			_css(_logo, _getStyle());
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		};
		
		if (_settings.file.indexOf("http://") === 0) {
			_logo.src = _settings.file;
		} else {
			_logo.src = _settings.prefix + _settings.file;
		}
		
		_logo.onmouseover = function(evt) {
			_logo.style.opacity = _settings.over;
			fade();
		};
		
		_logo.onmouseout = function(evt) {
			_logo.style.opacity = _settings.out;
			fade();
		};
		
		_logo.onclick = _logoClickHandler;
		
		function _getStyle() {
			var _imageStyle = {
				textDecoration: "none",
				position: "absolute"
			};
			_imageStyle.display = _settings.hide ? "none" : "block";
			var positions = _settings.position.toLowerCase().split("-");
			for (var position in positions) {
				_imageStyle[positions[position]] = _settings.margin;
			}
			return _imageStyle;
		}
		
		this.resize = function(width, height) {
		};
		
		this.getDisplayElement = function() {
			return _logo;
		};
		
		function _logoClickHandler(evt) {
			evt.stopPropagation();
			window.open(_settings.link, "_blank");
			return;
		}
		
		function fade() {
			if (_timeout) {
				clearTimeout(_timeout);
			}
			_timeout = setTimeout(function() {
				jwplayer.html5.utils.fadeTo(_logo, 0, 0.1, parseFloat(_logo.style.opacity));
			}, _settings.timeout * 1000);
		}
		
		function _stateHandler(obj) {
			switch (_api.jwGetState()) {
				case jwplayer.api.events.state.BUFFERING:
					_logo.style.display = "block";
					_logo.style.opacity = _settings.out;
					if (_settings.hide) {
						fade();
					}
					break;
				case jwplayer.api.events.state.PAUSED:
					break;
				case jwplayer.api.events.state.IDLE:
					break;
				case jwplayer.api.events.state.PLAYING:
					break;
				default:
					if (_settings.hide) {
						fade();
					}
					break;
			}
		}
		
		return this;
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
			'load': _loadHandler,
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
		var _hasChrome = false;
		var _currentItem;
		var _sourceError;
		var _bufferTimes = [];
		var _bufferBackupTimeout;
		var _error = false;
		
		function _getState() {
			return _state;
		}
		
		function _loadHandler(evt) {
		}
		
		function _generalHandler(event) {
		}
		
		function _stateHandler(event) {
			if (_states[event.type]) {
				_setState(_states[event.type]);
			}
		}
		
		function _setState(newstate) {
			if (_error) {
				return;
			}
			if (_stopped) {
				newstate = jwplayer.api.events.state.IDLE;
			}
			if (newstate == jwplayer.api.events.state.PAUSED && _state == jwplayer.api.events.state.IDLE) {
				return;
			}
			if (_state != newstate) {
				var oldstate = _state;
				_model.state = newstate;
				_state = newstate;
				var _sendComplete = false;
				if (newstate == jwplayer.api.events.state.IDLE) {
					_clearInterval();
					if (_model.position >= _model.duration && (_model.position || _model.duration)) {
						_sendComplete = true;
					}
					
					if (_container.style.display != 'none' && !_model.config.chromeless) {
						_container.style.display = 'none';
					}
				}
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
				if (_sendComplete) {
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE);
				}
			}
			_stopped = false;
		}
		
		
		function _metaHandler(event) {
			var meta = {
				height: event.target.videoHeight,
				width: event.target.videoWidth,
				duration: Math.round(event.target.duration * 10) / 10
			};
			if (_model.duration === 0 || isNaN(_model.duration)) {
				_model.duration = Math.round(event.target.duration * 10) / 10;
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
			
			if (event !== undefined && event.target !== undefined) {
				if (_model.duration === 0 || isNaN(_model.duration)) {
					_model.duration = Math.round(event.target.duration * 10) / 10;
				}
				if (!_start && _container.readyState > 0) {
					_setState(jwplayer.api.events.state.PLAYING);
				}
				if (_state == jwplayer.api.events.state.PLAYING) {
					if (!_start && _container.readyState > 0) {
						_start = true;
						try {
							_container.currentTime = _model.playlist[_model.item].start;
						} catch (err) {
						
						}
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
			_progressHandler(event);
		}
		
		function _bufferBackup() {
			var timeout = (_bufferTimes[_bufferTimes.length - 1] - _bufferTimes[0]) / _bufferTimes.length;
			_bufferBackupTimeout = setTimeout(function() {
				if (!_bufferingComplete) {
					_progressHandler({
						lengthComputable: true,
						loaded: 1,
						total: 1
					});
				}
			}, timeout * 10);
		}
		
		function _progressHandler(event) {
			var bufferPercent, bufferTime;
			if (event !== undefined && event.lengthComputable && event.total) {
				_addBufferEvent();
				bufferPercent = event.loaded / event.total * 100;
				bufferTime = bufferPercent / 100 * (_model.duration - _container.currentTime);
				if (50 < bufferPercent && !_bufferingComplete) {
					clearTimeout(_bufferBackupTimeout);
					_bufferBackup();
				}
			} else if ((_container.buffered !== undefined) && (_container.buffered.length > 0)) {
				maxBufferIndex = 0;
				if (maxBufferIndex >= 0) {
					bufferPercent = _container.buffered.end(maxBufferIndex) / _container.duration * 100;
					bufferTime = _container.buffered.end(maxBufferIndex) - _container.currentTime;
				}
			}
			
			if (_bufferFull === false && _state == jwplayer.api.events.state.BUFFERING) {
				_bufferFull = true;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
			}
			
			if (!_bufferingComplete) {
				if (bufferPercent == 100 && _bufferingComplete === false) {
					_bufferingComplete = true;
				}
				
				if (bufferPercent !== null && (bufferPercent > _model.buffer)) {
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
					_positionHandler();
				}, 100);
			}
		}
		
		function _clearInterval() {
			clearInterval(_interval);
			_interval = null;
		}
		
		function _errorHandler(event) {
			var message = "There was an error: ";
			if ((event.target.error && event.target.tagName.toLowerCase() == "video") ||
			event.target.parentNode.error && event.target.parentNode.tagName.toLowerCase() == "video") {
				var element = event.target.error === undefined ? event.target.parentNode.error : event.target.error;
				switch (element.code) {
					case element.MEDIA_ERR_ABORTED:
						message = "You aborted the video playback: ";
						break;
					case element.MEDIA_ERR_NETWORK:
						message = "A network error caused the video download to fail part-way: ";
						break;
					case element.MEDIA_ERR_DECODE:
						message = "The video playback was aborted due to a corruption problem or because the video used features your browser did not support: ";
						break;
					case element.MEDIA_ERR_SRC_NOT_SUPPORTED:
						message = "The video could not be loaded, either because the server or network failed or because the format is not supported: ";
						break;
					default:
						message = "An unknown error occurred: ";
						break;
				}
			} else if (event.target.tagName.toLowerCase() == "source") {
				_sourceError--;
				if (_sourceError > 0) {
					return;
				}
				message = "The video could not be loaded, either because the server or network failed or because the format is not supported: ";
			} else {
				jwplayer.html5.utils.log("Erroneous error received. Continuing...");
				return;
			}
			_stop();
			message += joinFiles();
			_error = true;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
				error: message
			});
			return;
		}
		
		function joinFiles() {
			var result = "";
			for (var sourceIndex in _currentItem.levels) {
				var sourceModel = _currentItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				result += jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				if (sourceIndex < (_currentItem.levels.length - 1)) {
					result += ", ";
				}
			}
			return result;
		}
		
		this.getDisplayElement = function() {
			return _container;
		};
		
		this.play = function() {
			if (_state != jwplayer.api.events.state.PLAYING) {
				if (_container.style.display != "block") {
					_container.style.display = "block";
				}
				_container.play();
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
			if (!(_model.duration === 0 || isNaN(_model.duration)) &&
			!(_model.position === 0 || isNaN(_model.position))) {
				_container.currentTime = position;
				_container.play();
			}
		};
		
		
		/** Stop playback and loading of the video. **/
		function _stop() {
			_container.pause();
			_clearInterval();
			_model.position = 0;
			_stopped = true;
			_setState(jwplayer.api.events.state.IDLE);
		}
		
		this.stop = _stop;
		
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
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
		};
		
		
		/** Load a new video into the player. **/
		this.load = function(playlistItem) {
			_embed(playlistItem);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			_bufferFull = false;
			_bufferingComplete = false;
			_start = false;
			if (!_model.config.chromeless) {
				_bufferTimes = [];
				_addBufferEvent();
				_setState(jwplayer.api.events.state.BUFFERING);
				
				setTimeout(function() {
					_positionHandler();
				}, 25);
			}
		};
		
		function _addBufferEvent() {
			var currentTime = new Date().getTime();
			_bufferTimes.push(currentTime);
		}
		
		this.hasChrome = function() {
			return _hasChrome;
		};
		
		function _embed(playlistItem) {
			_model.duration = playlistItem.duration;
			_hasChrome = false;
			_currentItem = playlistItem;
			var vid = document.createElement("video");
			vid.preload = "none";
			_error = false;
			_sourceError = 0;
			for (var sourceIndex = 0; sourceIndex < playlistItem.levels.length; sourceIndex++) {
				var sourceModel = playlistItem.levels[sourceIndex];
				if (jwplayer.html5.utils.isYouTube(sourceModel.file)) {
					delete vid;
					_embedYouTube(sourceModel.file);
					return;
				}
				var sourceType;
				if (sourceModel.type === undefined) {
					var extension = jwplayer.utils.extension(sourceModel.file);
					if (jwplayer.utils.extensionmap[extension] !== undefined) {
						sourceType = jwplayer.utils.extensionmap[extension];
					} else {
						sourceType = 'video/' + extension + ';';
					}
				} else {
					sourceType = sourceModel.type;
				}
				if (vid.canPlayType(sourceType) === "") {
					continue;
				}
				var source = _container.ownerDocument.createElement("source");
				source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				source.type = sourceType;
				_sourceError++;
				vid.appendChild(source);
			}
			
			if (_sourceError === 0) {
				_error = true;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
					error: "The video could not be loaded because the format is not supported by your browser: " + joinFiles()
				});
			}
			
			if (_model.config.chromeless) {
				vid.poster = jwplayer.html5.utils.getAbsolutePath(playlistItem.image);
				vid.controls = "controls";
			}
			vid.style.position = _container.style.position;
			vid.style.top = _container.style.top;
			vid.style.left = _container.style.left;
			vid.style.width = _container.style.width;
			vid.style.height = _container.style.height;
			vid.style.zIndex = _container.style.zIndex;
			vid.onload = _loadHandler;
			vid.volume = 0;
			_container.parentNode.replaceChild(vid, _container);
			vid.id = _container.id;
			_container = vid;
			for (var event in _events) {
				_container.addEventListener(event, function(evt) {
					if (evt.target.parentNode !== null) {
						_events[evt.type](evt);
					}
				}, true);
			}
		}
		
		function _embedYouTube(path) {
			var object = document.createElement("object");
			path = ["http://www.youtube.com/v/", path.replace(/^[^v]+v.(.{11}).*/, "$1"), "&amp;hl=en_US&amp;fs=1&autoplay=1"].join("");
			var objectParams = {
				movie: path,
				allowFullScreen: "true",
				allowscriptaccess: "always"
			};
			for (var objectParam in objectParams) {
				var param = document.createElement("param");
				param.name = objectParam;
				param.value = objectParams[objectParam];
				object.appendChild(param);
			}
			
			var embed = document.createElement("embed");
			var embedParams = {
				src: path,
				type: "application/x-shockwave-flash",
				allowscriptaccess: "always",
				allowfullscreen: "true",
				width: document.getElementById(model.id).style.width,
				height: document.getElementById(model.id).style.height
			};
			for (var embedParam in embedParams) {
				embed[embedParam] = embedParams[embedParam];
			}
			object.appendChild(embed);
			
			object.style.position = _container.style.position;
			object.style.top = _container.style.top;
			object.style.left = _container.style.left;
			object.style.width = document.getElementById(model.id).style.width;
			object.style.height = document.getElementById(model.id).style.height;
			object.style.zIndex = 2147483000;
			_container.parentNode.replaceChild(object, _container);
			object.id = _container.id;
			_container = object;
			_hasChrome = true;
		}
		
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
		var _api = api;
		var _container = container;
		var _model = {
			id: _container.id,
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
				repeat: "none",
				autostart: false,
				debug: undefined,
				screencolor: undefined
			}
		};
		var _media;
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		var _components = ["display", "logo", "controlbar"];
		
		jwplayer.utils.extend(_model, _eventDispatcher);
		
		for (var option in options) {
			if (typeof options[option] == "string") {
				var type = /color$/.test(option) ? "color" : null;
				options[option] = jwplayer.html5.utils.typechecker(options[option], type);
			}
			var config = _model.config;
			var path = option.split(".");
			for (var edge in path) {
				if (edge == path.length - 1) {
					config[path[edge]] = options[option];
				} else {
					if (config[path[edge]] === undefined) {
						config[path[edge]] = {};
					}
					config = config[path[edge]];
				}
			}
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			_model[configurableStateVariable] = _model.config[configurableStateVariable];
		}
		
		var pluginorder = _components.concat([]);
		
		if (_model.plugins !== undefined) {
			if (typeof _model.plugins == "string") {
				var userplugins = _model.plugins.split(",");
				for (var userplugin in userplugins) {
					pluginorder.push(userplugins[userplugin].replace(/^\s+|\s+$/g, ""));
				}
			} else {
				for (var plugin in _model.plugins) {
					pluginorder.push(_model.plugins[plugin].replace(/^\s+|\s+$/g, ""));
				}
			}
		}
		
		if (jwplayer.utils.isIOS()) {
			_model.config.chromeless = true;
		}
		
		if (_model.config.chromeless) {
			pluginorder = [];
		}
		
		_model.plugins = {
			order: pluginorder,
			config: {
				controlbar: {
					position: jwplayer.html5.view.positions.BOTTOM
				}
			},
			object: {}
		};
		
		if (typeof _model.config.components != "undefined") {
			for (var component in _model.config.components) {
				_model.plugins.config[component] = _model.config.components[component];
			}
		}
		
		for (var pluginIndex in _model.plugins.order) {
			var pluginName = _model.plugins.order[pluginIndex];
			var pluginConfig = _model.config[pluginName] === undefined ? {} : _model.config[pluginName];
			_model.plugins.config[pluginName] = _model.plugins.config[pluginName] === undefined ? pluginConfig : jwplayer.utils.extend(_model.plugins.config[pluginName], pluginConfig);
			if (_model.plugins.config[pluginName].position === undefined) {
				_model.plugins.config[pluginName].position = jwplayer.html5.view.positions.OVER;
			}
		}
		
		_model.loadPlaylist = function(arg, ready) {
			var input;
			if (typeof arg == "string") {
				try {
					input = eval(arg);
				} catch (err) {
					input = arg;
				}
			} else {
				input = arg;
			}
			var config;
			switch (jwplayer.utils.typeOf(input)) {
				case "object":
					config = input;
					break;
				case "array":
					config = {
						playlist: input
					};
					break;
				default:
					config = {
						file: input
					};
					break;
			}
			_model.playlist = new jwplayer.html5.playlist(config);
			if (_model.config.shuffle) {
				_model.item = _getShuffleItem();
			} else {
				if (_model.config.item >= _model.playlist.length) {
					_model.config.item = _model.playlist.length - 1;
				}
				_model.item = _model.config.item;
			}
			if (!ready) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
					"item": _model.item
				});
			}
			_model.setActiveMediaProvider(_model.playlist[_model.item]);
		};
		
		function _getShuffleItem() {
			var result = null;
			if (_model.playlist.length > 1) {
				while (result === null) {
					result = Math.floor(Math.random() * _model.playlist.length);
					if (result == _model.item) {
						result = null;
					}
				}
			} else {
				result = 0;
			}
			return result;
		}
		
		function forward(evt) {
			if (evt.type == jwplayer.api.events.JWPLAYER_MEDIA_LOADED) {
				_container = _media.getDisplayElement();
			}
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		_model.setActiveMediaProvider = function(playlistItem) {
			if (_media !== undefined) {
				_media.resetEventListeners();
			}
			_media = new jwplayer.html5.mediavideo(_model, _container);
			_media.addGlobalListener(forward);
			if (_model.config.chromeless) {
				_media.load(playlistItem);
			}
			return true;
		};
		
		_model.getMedia = function() {
			return _media;
		};
		
		
		_model.setupPlugins = function() {
			for (var plugin in _model.plugins.order) {
				try {
					if (jwplayer.html5[_model.plugins.order[plugin]] !== undefined) {
						_model.plugins.object[_model.plugins.order[plugin]] = new jwplayer.html5[_model.plugins.order[plugin]](_api, _model.plugins.config[_model.plugins.order[plugin]]);
					} else if (window[_model.plugins.order[plugin]] !== undefined) {
						_model.plugins.object[_model.plugins.order[plugin]] = new window[_model.plugins.order[plugin]](_api, _model.plugins.config[_model.plugins.order[plugin]]);
					} else {
						_model.plugins.order.splice(plugin, plugin+1);
					}
				} catch (err) {
					jwplayer.html5.utils.log("Could not setup " + _model.plugins.order[plugin]);
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
			for (var playlistItem in config.playlist) {
				_playlist.push(new jwplayer.html5.playlistitem(config.playlist[playlistItem]));
			}
		} else {
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
			}, function() {
				new jwplayer.html5.skinloader("", function(skin) {
					_loaded = true;
					_components = skin;
					callback();
				});
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
	jwplayer.html5.skinloader = function(skinPath, completeHandler, errorHandler) {
		var _skin = {};
		var _completeHandler = completeHandler;
		var _errorHandler = errorHandler;
		var _loading = true;
		var _completeInterval;
		var _skinPath = skinPath;
		var _error = false;
		
		/** Load the skin **/
		function _load() {
			if (_skinPath === undefined || _skinPath === "") {
				_loadSkin(jwplayer.html5.defaultSkin().xml);
			} else {
				jwplayer.utils.ajax(jwplayer.html5.utils.getAbsolutePath(_skinPath), function(xmlrequest) {
					try {
						if (xmlrequest.responseXML !== null){
							_loadSkin(xmlrequest.responseXML);
							return;	
						}
					} catch (err){
						
					}
					_loadSkin(jwplayer.html5.defaultSkin().xml);
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
						var name = settings[settingIndex].getAttribute("name");
						var value = settings[settingIndex].getAttribute("value");
						var type = /color$/.test(name) ? "color" : null;
						_skin[componentName].settings[name] = jwplayer.html5.utils.typechecker(value, type);
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
							_skin[componentName].layout[group.getAttribute("position")].elements.push({
								type: element.tagName
							});
							for (var elementAttributeIndex = 0; elementAttributeIndex < element.attributes.length; elementAttributeIndex++) {
								var elementAttribute = element.attributes[elementAttributeIndex];
								_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex][elementAttribute.name] = elementAttribute.value;
							}
							if (_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex].name === undefined) {
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
			if (!_error) {
				_completeInterval = setInterval(function() {
					_checkComplete();
				}, 100);
			}
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
				var skinUrl = jwplayer.html5.utils.getAbsolutePath(_skinPath);
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
				_error = true;
				_resetCompleteIntervalTest();
				_errorHandler();
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
	
	jwplayer.html5.utils.cancelAnimation = function(domelement) {
		delete _animations[domelement.id];
	};
	
	jwplayer.html5.utils.fadeTo = function(domelement, endAlpha, time, startAlpha, delay, startTime) {
		// Interrupting
		if (_animations[domelement.id] != startTime && startTime !== undefined) {
			return;
		}
		var currentTime = new Date().getTime();
		if (startTime > currentTime) {
			setTimeout(function() {
				jwplayer.html5.utils.fadeTo(domelement, endAlpha, time, startAlpha, 0, startTime);
			}, startTime - currentTime);
		}
		domelement.style.display = "block";
		if (startAlpha === undefined) {
			startAlpha = domelement.style.opacity === "" ? 1 : domelement.style.opacity;
		}
		if (domelement.style.opacity == endAlpha && domelement.style.opacity !== "" && startTime !== undefined) {
			if (endAlpha === 0) {
				domelement.style.display = "none";
			}
			return;
		}
		if (startTime === undefined) {
			startTime = currentTime;
			_animations[domelement.id] = startTime;
		}
		if (delay === undefined) {
			delay = 0;
		}
		var percentTime = (currentTime - startTime) / (time * 1000);
		percentTime = percentTime > 1 ? 1 : percentTime;
		var delta = endAlpha - startAlpha;
		var alpha = startAlpha + (percentTime * delta);
		if (alpha > 1) {
			alpha = 1;
		} else if (alpha < 0) {
			alpha = 0;
		}
		domelement.style.opacity = alpha;
		if (delay > 0) {
			_animations[domelement.id] = startTime + delay * 1000;
			jwplayer.html5.utils.fadeTo(domelement, endAlpha, time, startAlpha, 0, _animations[domelement.id]);
			return;
		}
		setTimeout(function() {
			jwplayer.html5.utils.fadeTo(domelement, endAlpha, time, startAlpha, 0, startTime);
		}, 10);
	};
})(jwplayer);
/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _colorPattern = new RegExp(/^(#|0x)[0-9a-fA-F]{3,6}/);
	jwplayer.html5.utils.typechecker = function(value, type) {
		type = type === null ? _guessType(value) : type;
		return _typeData(value, type);
	};
	
	function _guessType(value) {
		var bools = ["true", "false", "t", "f"];
		if (bools.indexOf(value.toLowerCase().replace(" ", "")) >= 0) {
			return "boolean";
		} else if (_colorPattern.test(value)) {
			return "color";
		} else if (!isNaN(parseInt(value, 10)) && parseInt(value, 10).toString().length == value.length) {
			return "integer";
		} else if (!isNaN(parseFloat(value)) && parseFloat(value).toString().length == value.length) {
			return "float";
		}
		return "string";
	}
	
	function _typeData(value, type) {
		if (type === null) {
			return value;
		}
		
		switch (type) {
			case "color":
				if (value.length > 0) {
					return _stringToColor(value);
				}
				return null;
			case "integer":
				return parseInt(value, 10);
			case "float":
				return parseFloat(value);
			case "boolean":
				if (value.toLowerCase() == "true") {
					return true;
				} else if (value == "1") {
					return true;
				}
				return false;
		}
		return value;
	}
	
	function _stringToColor(value) {
		switch (value.toLowerCase()) {
			case "blue":
				return parseInt("0000FF", 16);
			case "green":
				return parseInt("00FF00", 16);
			case "red":
				return parseInt("FF0000", 16);
			case "cyan":
				return parseInt("00FFFF", 16);
			case "magenta":
				return parseInt("FF00FF", 16);
			case "yellow":
				return parseInt("FFFF00", 16);
			case "black":
				return parseInt("000000", 16);
			case "white":
				return parseInt("FFFFFF", 16);
			default:
				value = value.replace(/(#|0x)?([0-9A-F]{3,6})$/gi, "$2");
				if (value.length == 3) {
					value = value.charAt(0) + value.charAt(0) + value.charAt(1) + value.charAt(1) + value.charAt(2) + value.charAt(2);
				}
				return parseInt(value, 16);
		}
		
		return parseInt("000000", 16);
	}
	
})(jwplayer);
/** 
 * A factory for API calls that either set listeners or return data
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.api = function(container, options) {
		var _api = {};
		
		if (!jwplayer.utils.hasHTML5()) {
			return _api;
		}
		
		var _container = document.createElement('div');
		container.parentNode.replaceChild(_container, container);
		_container.id = container.id;
		
		_api.version = jwplayer.html5.version;
		_api.id = _container.id;
		
		var _model = new jwplayer.html5.model(_api, _container, options);
		var _view = new jwplayer.html5.view(_api, _container, _model);
		var _controller = new jwplayer.html5.controller(_api, _container, _model, _view);
		
		_api.skin = new jwplayer.html5.skin();
		
		_api.jwPlay = _controller.play;
		_api.jwPause = _controller.pause;
		_api.jwStop = _controller.stop;
		_api.jwSeek = _controller.seek;
		_api.jwPlaylistItem = _controller.item;
		_api.jwPlaylistNext = _controller.next;
		_api.jwPlaylistPrev = _controller.prev;
		_api.jwResize = _controller.resize;
		_api.jwLoad = _controller.load;
		
		function _statevarFactory(statevar) {
			return function() {
				return _model[statevar];
			};
		}
		
		_api.jwGetItem = _statevarFactory('item');
		_api.jwGetPosition = _statevarFactory('position');
		_api.jwGetDuration = _statevarFactory('duration');
		_api.jwGetBuffer = _statevarFactory('buffer');
		_api.jwGetWidth = _statevarFactory('width');
		_api.jwGetHeight = _statevarFactory('height');
		_api.jwGetFullscreen = _statevarFactory('fullscreen');
		_api.jwSetFullscreen = _controller.setFullscreen;
		_api.jwGetVolume = _statevarFactory('volume');
		_api.jwSetVolume = _controller.setVolume;
		_api.jwGetMute = _statevarFactory('mute');
		_api.jwSetMute = _controller.setMute;
		
		_api.jwGetState = _statevarFactory('state');
		_api.jwGetVersion = function() {
			return _api.version;
		};
		_api.jwGetPlaylist = function() {
			return _model.playlist;
		};
		
		_api.jwAddEventListener = _controller.addEventListener;
		_api.jwRemoveEventListener = _controller.removeEventListener;
		_api.jwSendEvent = _controller.sendEvent;
		
		//UNIMPLEMENTED
		_api.jwGetLevel = function() {
		};
		_api.jwGetBandwidth = function() {
		};
		_api.jwGetLockState = function() {
		};
		_api.jwLock = function() {
		};
		_api.jwUnlock = function() {
		};
		
		function _finishLoad(model, view, controller) {
			return function() {
				model.loadPlaylist(model.config, true);
				model.setupPlugins();
				view.setup(model.getMedia().getDisplayElement());
				var evt = {
					id: _api.id,
					version: _api.version
				};
				controller.sendEvent(jwplayer.api.events.JWPLAYER_READY, evt);
				if (playerReady !== undefined) {
					playerReady(evt);
				}
				
				if (window[model.config.playerReady] !== undefined) {
					window[model.config.playerReady](evt);
				}
				
				model.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED);
				model.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
					"item": model.config.item
				});
				
				if (model.config.autostart === true && !model.config.chromeless) {
					controller.play();
				}
			};
		}
		
		if (_model.config.chromeless) {
			setTimeout(_finishLoad(_model, _view, _controller), 25);
		} else {
			_api.skin.load(_model.config.skin, _finishLoad(_model, _view, _controller));
		}
		return _api;
	};
	
})(jwplayer);
