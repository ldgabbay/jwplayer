jwplayer = function(container) { return jwplayer.constructor(container); };

jwplayer.constructor = function(container) {};

$jw = jwplayer;jwplayer.utils = function() {
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
 */
jwplayer.utils.hasHTML5 = function() {
	return !!document.createElement('video').canPlayType;
};

/**
 * Detects whether or not the current player has flash capabilities
 * TODO: Add minimum flash version constraint: 9.0.115
 */
jwplayer.utils.hasFlash = function() {
	return (typeof navigator.plugins != "undefined" && typeof navigator.plugins['Shockwave Flash'] != "undefined") || (typeof window.ActiveXObject != "undefined");
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
				currentSibling = currentSibling.nextSibling;
				if (currentSibling.nodeType == 1 && currentSibling.tagName.toLowerCase() == ("/")+toReplace.tagName.toLowerCase() ) {
					endTagFound = true;
				}
			}
			if (endTagFound) {
				while (siblings.length > 0) {
					var element = siblings.pop();
					element.parentNode.removeChild(element);
				}
			}
			
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

jwplayer.utils.strings.trim = function(inputString){
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};
(function(jwplayer) {
	var _players = [];

	jwplayer.constructor = function(container) {
		return jwplayer.api.selectPlayer(container);
	};
	
	jwplayer.api = function() {};

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
		
		var _originalHTML = container.outerHTML;
		
		var _itemMeta = {};
		
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
				var newstate = args['newstate'],
					oldstate = args['oldstate'];
				if (newstate == state) {
					var callbacks = _stateListeners[newstate];
					if (callbacks) {
						for (var c in callbacks) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, {oldstate:oldstate, newstate:newstate});
							}
						}
					}
				}
			};
		};
		
		this.addInternalListener = function(player, type) {
			player.jwAddEventListener(type, 'function(dat) { jwplayer("'+this.id+'").dispatchEvent("'+type+'", dat); }');
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
				for (var l in _listeners[type]) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].call(this, args);
					}
				}
			}
		};

		function translateEventResponse(type, eventProperties) {
			var translated = jwplayer.utils.extend({}, eventProperties);
			if (type == jwplayer.api.events.JWPLAYER_FULLSCREEN) {
				translated['fullscreen'] = translated['message'];
				delete translated['message'];
			} else if (typeof translated['data'] == "object") {
				// Takes ViewEvent "data" block and moves it up a level
				translated = jwplayer.utils.extend(translated, translated['data']);
				delete translated['data'];
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
				_queuedCalls.push({method:funcName, parameters:args});
			}
		};
		
		this.playerReady = function(obj) {
			_playerReady = true;
			if (!_player) {
				this.setPlayer(document.getElementById(obj['id']));
			}
			
			for (var eventType in _listeners) {
				this.addInternalListener(_player, eventType);
			}

			this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, function(data) {
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
		
		this.destroy = function() {
			_listeners = {};
			_queuedCalls = [];
			if (this.container.outerHTML != _originalHTML){
				jwplayer.api.destroyPlayer(this.id, _originalHTML);	
			}
		};
		

		/** Using this function instead of array.slice since Arguments are not an array **/
		function slice(list, from, to) {
			var ret = [];
			if (!from) { from = 0; }
			if (!to) { to = list.length-1; }
			for (var i=from; i<=to; i++) {
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
		getBuffer: function() { return this.callInternal('jwGetBuffer'); },
		getDuration: function() { return this.callInternal('jwGetDuration'); },
		getFullscreen: function() { return this.callInternal('jwGetFullscreen'); },
		getHeight: function() { return this.callInternal('jwGetHeight'); },
		getLockState: function() { return this.callInternal('jwGetLockState'); },
		getMeta: function() { return this.getItemMeta(); },
		getMute: function() { return this.callInternal('jwGetMute'); },
		getPlaylist: function() { return this.callInternal('jwGetPlaylist'); },
		getPlaylistItem: function(item) {
			if (item == undefined) item = 0;
			return this.getPlaylist()[item]; 
		},
		getPosition: function() { return this.callInternal('jwGetPosition'); },
		getState: function() { return this.callInternal('jwGetState'); },
		getVolume: function() { return this.callInternal('jwGetVolume'); },
		getWidth: function() { return this.callInternal('jwGetWidth'); },
		
		// Player Public Methods
		setFullscreen: function(fullscreen) { this.callInternal("jwSetFullscreen", fullscreen); return this;},
		setMute: function(mute) { this.callInternal("jwSetMute", mute); return this; },
		lock: function() { return this; },
		unlock: function() { return this; },
		load: function(toLoad) { this.callInternal("jwLoad", toLoad); return this; },
		playlistItem: function(item) { this.callInternal("jwPlaylistItem", item); return this; },
		playlistPrev: function() { this.callInternal("jwPlaylistPrev"); return this; },
		playlistNext: function() { this.callInternal("jwPlaylistNext"); return this; },
		resize: function(width, height) { 
			this.container.width = width; 
			this.container.height = height; 
			return this; 
		},
		play: function(state) {
			if (typeof state === "undefined") {
				var state = this.getState();
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
		stop: function() { this.callInternal("jwStop"); return this; }, 
		seek: function(position) { this.callInternal("jwSeek", position); return this; },
		setVolume: function(volume) { this.callInternal("jwSetVolume", volume); return this; },
		
		// Player Events
		onBufferChange: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, callback); },
		onBufferFull: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, callback); },
		onError: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_ERROR, callback); },
		onFullscreen: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, callback); },
		onMeta: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, callback); },
		onMute: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, callback); },
		onPlaylist: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, callback); },
		onPlaylistItem: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, callback); },
		onReady: function(callback) { return this.eventListener(jwplayer.api.events.API_READY, callback); },
		onResize: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_RESIZE, callback); },
		onComplete: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, callback); },
		onTime: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, callback); },
		onVolume: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, callback); },
	
		// State events
		onBuffer: function(callback) { return this.stateListener(jwplayer.api.events.state.BUFFERING, callback); },
		onPause: function(callback) { return this.stateListener(jwplayer.api.events.state.PAUSED, callback); },
		onPlay: function(callback) { return this.stateListener(jwplayer.api.events.state.PLAYING, callback); },
		onIdle: function(callback) { return this.stateListener(jwplayer.api.events.state.IDLE, callback); },

		setup: function(options) { return this; },
		remove: function() {
			this.destroy();
		}, 
		
		// Player plugin API
		initializePlugin: function(pluginName, pluginCode) { return this; }
	};
	
	jwplayer.api.selectPlayer = function(identifier) {
		var _container;
		
		if (identifier == undefined) identifier = 0;
		
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
		for(var p in _players) {
			if (_players[p].id == id) {
				return _players[p];
			}
		}
		return null;
	};
	
	jwplayer.api.addPlayer = function(player) {
		for (var i in _players) {
			if (_players[i] == player) {
				return player; // Player is already in the list;
			}
		}
	
		_players.push(player);
		return player;
	};
	
	jwplayer.api.destroyPlayer = function(playerId, replacementHTML) {
		var index = -1;
		for(var p in _players) {
			if (_players[p].id == playerId) {
				index = p;
				continue;
			}
		}
		if (index >= 0) {
			var toDestroy = document.getElementById(_players[index].id);
			if (toDestroy) {
				if (replacementHTML) {
					toDestroy.outerHTML = replacementHTML;
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
	var api = jwplayer.api.playerById(obj['id']);
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
		width : 400,
		height : 300,
		players: [{type:"flash", src:"player.swf"},{type:'html5'}],
		components: {
			controlbar: {
				position: "over"
			}
		}
	};

	jwplayer.embed.Embedder.prototype = {
		config: undefined, 
		api: undefined,
		events: {},
		players: undefined,

		constructor : function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = this.parseConfig(jwplayer.utils.extend({}, jwplayer.embed.defaults, mediaConfig, this.api.config));
		},

		embedPlayer : function() {
			// TODO: Parse playlist for playable content
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
				case 'flash':
					if (jwplayer.utils.hasFlash()) {
						// TODO: serialize levels & playlist, de-serialize in
						// Flash
						if (this.config.levels || this.config.playlist) {
							this.api.onReady(this.loadAfterReady(this.config));
						}

						// Make sure we're passing the correct ID into Flash for
						// Linux API support
						this.config.id = this.api.id;

						var flashPlayer = jwplayer.embed.embedFlash(document.getElementById(this.api.id), player, this.config);
						this.api.container = flashPlayer;
						this.api.setPlayer(flashPlayer);
					} else {
						this.players.splice(0, 1);
						return this.embedPlayer();
					}
					break;
				case 'html5':
					if (jwplayer.utils.hasHTML5()) {
						var html5player = jwplayer.embed.embedHTML5(document.getElementById(this.api.id), player, this.config);
						this.api.container = document.getElementById(this.api.id);
						this.api.setPlayer(html5player);
					} else {
						this.players.splice(0, 1);
						return this.embedPlayer();
					}
					break;
				}
			} else {
				this.api.container.innerHTML = "<p>No suitable players found</p>";
			}

			this.setupEvents();

			return this.api;
		},

		setupEvents : function() {
			for (evt in this.events) {
				if (typeof this.api[evt] == "function") {
					(this.api[evt]).call(this.api, this.events[evt]);
				}
			}
		},

		loadAfterReady : function(loadParams) {
			return function(obj) {
				if (loadParams.playlist) {
					this.load(loadParams.playlist);
				} else if (loadParams.levels) {
					var item = this.getPlaylistItem(0);
					if (!item) {
						item = { file: loadParams.levels[0].file, provider:'video' };
					}
					if (!item.image) {
						item.image = loadParams.image;
					}
					item.levels = loadParams.levels;
					this.load(item);
				}
			};
		},

		parseConfig : function(config) {
			var parsedConfig = jwplayer.utils.extend( {}, config);
			if (parsedConfig.events) {
				this.events = parsedConfig.events;
				delete parsedConfig['events'];
			}
			if (parsedConfig.players) {
				this.players = parsedConfig.players;
				delete parsedConfig['players'];
			}
			if (parsedConfig.plugins) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parsePlugins(parsedConfig.plugins));
				}
			}
			return parsedConfig;
		}

	};

	jwplayer.embed.embedFlash = function(_container, _player, _options) {
		var params = jwplayer.utils.extend( {}, _options);

		var width = params.width;
		delete params['width'];

		var height = params.height;
		delete params['height'];

		// These properties are loaded after playerready; not sent in as
		// flashvars.
		if (params.levels && params.levels.length && params.file === undefined) {
//			params.file = params.levels[0]['file'];
		}

		delete params['levels'];
		delete params['playlist'];

		jwplayer.embed.parseConfigBlock(params, 'components');
		jwplayer.embed.parseConfigBlock(params, 'providers');

		if (jwplayer.utils.isIE()) {
			var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" '
					+ 'width="'
					+ width
					+ '" height="'
					+ height
					+ '" '
					+ 'id="'
					+ _container.id + '" name="' + _container.id + '">';
			html += '<param name="movie" value="' + _player.src + '">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="allowscriptaccess" value="always">';
			html += '<param name="flashvars" value="' + jwplayer.embed
					.jsonToFlashvars(params) + '">';
			html += '</object>';
			if (_container.tagName.toLowerCase() == "video") {
				jwplayer.utils.mediaparser.replaceMediaElement(_container, html);
			} else {
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
			jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed
					.jsonToFlashvars(params));
			_container.parentNode.replaceChild(obj, _container);
			return obj;
		}

	};

	jwplayer.embed.embedHTML5 = function(container, player, options) {
		if (jwplayer.html5) {
			container.innerHTML = "<p>Embedded HTML5 player goes here</p>";
			var playerOptions = jwplayer.utils.extend( {screencolor:'0x000000'}, options);
			jwplayer.embed.parseConfigBlock(playerOptions, 'components');
			// TODO: remove this requirement from the html5 player (sources
			// instead of levels)
			if (playerOptions.levels && !playerOptions.sources)
				playerOptions.sources = options.levels;
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
		if (!pluginBlock) return {};

		var flat = {}, pluginKeys = [];

		for (plugin in pluginBlock) {
			var pluginName = plugin.indexOf('-') > 0 ? plugin.substring(0, plugin.indexOf('-')) : plugin;
			var pluginConfig = pluginBlock[plugin];
			pluginKeys.push(plugin);
			for (param in pluginConfig) {
				flat[pluginName + '.' + param] = pluginConfig[param];
			}
		}
		flat['plugins'] = pluginKeys.join(',');
		return flat;
	};

	jwplayer.embed.parseConfigBlock = function(options, blockName) {
		if (options[blockName]) {
			var components = options[blockName];
			for ( var name in components) {
				var component = components[name];
				if (typeof component == "string") {
					// i.e. controlbar="over"
					options[name] = component;
				} else {
					// i.e. controlbar.position="over"
					for ( var option in component) {
						options[name + '.' + option] = component[option];
					}
				}
			}
			delete options[blockName];
		}
	};

	jwplayer.api.PlayerAPI.prototype.setup = function(options, players) {
		if (options && options['flashplayer'] && !options['players']) {
			options['players'] = [{type:'flash', src:options['flashplayer']},{type:'html5'}];
			delete options['flashplayer'];
		}
		if (players && !options['players']) {
			if (typeof players == "string") {
				options['players'] = [{type:"flash", src:players}];
			} else if (players instanceof Array) {
				options['players'] = players;
			} else if (typeof players == "object" && players.type) {
				options['players'] = [players];
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
		var videoTags = jwplayer.utils.selectors.getElementsByTagAndClass('video','jwplayer');
		for (var i=0; i<videoTags.length; i++) {
			var video = videoTags[i];
			jwplayer(video.id).setup({
				players: [{type:'flash', src:'/jwplayer/player.swf'},{type:'html5'}]
			});
		}
	}
	noviceEmbed();
	
	
})(jwplayer);
