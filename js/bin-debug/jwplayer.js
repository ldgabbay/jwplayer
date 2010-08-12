jwplayer = function(container) { return jwplayer.constuctor(container); };

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
		for (var i=1; i < args.length; i++){
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

/**
 * Detects whether the current browser is IE.
 * Technique from http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html 
 **/
jwplayer.utils.isIE = function() {
	return (!+"\v1");
};

/**
 * Detects whether or not the current player has flash capabilities
 */
jwplayer.utils.hasFlash = function() {
	var nav = navigator;
	return (typeof nav.plugins != "undefined" && typeof nav.plugins['Shockwave Flash'] != "undefined");
};/**
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
			media: 'media'
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
		if (!(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)){
			// IE6/7/8 case
			var currentElement = domElement.nextSibling;
			if (currentElement[0] !== undefined){
				while(currentElement[0].tagName.toLowerCase() == "source") {
					sources.push(parseSourceElement(currentElement[0]));
					currentElement = currentElement.nextSibling;
				}				
			}
		} else {
			var sourceTags = jwplayer.utils.selectors.getElementsByTagAndClass("source", "", domElement);
			for (var i in sourceTags) {
				sources.push(parseSourceElement(sourceTags[i]));
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
		result.width = 0;
		result.bitrate = 0;
		return result;
	}
	
	function parseVideoElement(domElement, attributes) {
		attributes = getAttributeList('video', attributes);
		var result = parseMediaElement(domElement, attributes);
		return result;
	}
	
	parsers.media = parseMediaElement;
	parsers.audio = parseMediaElement;
	parsers.source = parseSourceElement;
	parsers.video = parseVideoElement;
	
	
})(jwplayer);
jwplayer.utils.selectors = function(selector){
	selector = jwplayer.utils.strings.trim(selector);
	var selectType = selector.charAt(0);
	if (selectType == "#"){
		return document.getElementById(selector.substr(1));
	} else if (selectType == "."){
		if (document.getElementsByClassName) {
			return document.getElementsByClassName(selector.substr(1));
		} else {
			return jwplayer.utils.selectors.getElementsByTagAndClass("*", selector.substr(1));
		}
	} else {
		if (selector.indexOf(".") > 0){
			selectors = selector.split(".");
			return jwplayer.utils.selectors.getElementsByTagAndClass(selectors[0], selectors[1]);
		} else {
			return document.getElementsByTagName(selector);
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

	jwplayer.constuctor = function(container) {
		return jwplayer.api.selectPlayer(container);
	};
	
	jwplayer.api = function() {};

	jwplayer.api.events = {
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
		var _player = undefined;
		
		var _itemMeta = {};
		
		/** Use this function to set the internal low-level player.  This is a javascript object which contains the low-level API calls. **/
		this.setPlayer = function(player) {
			if (_player) {
				//remove all former _player event listeners
			}
			_player = player;
			for (var eventType in _listeners) {
				this.addInternalListener(_player, eventType);
			}
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
			return function(newstate, oldstate) {
				if (newstate == state) {
					var callbacks = _stateListeners[newstate];
					if (callbacks) {
						for (var c in callbacks) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, oldstate);
							}
						}
					}
				}
			};
		};
		
		this.addInternalListener = function(player, type) {
			player.addEventListener(type, 'function(dat) { jwplayer("'+this.id+'").dispatchEvent("'+type+'", dat); }');
		};
		
		this.eventListener = function(type, callback) {
			if (!_listeners[type]) { 
				_listeners[type] = []; 
				if (_player) {
					this.addInternalListener(_player, type);
				}
			}
			_listeners[type].push(callback);
			return this;
		};
		
		this.dispatchEvent = function(type) {
			if (_listeners[type]) {
				for (var l in _listeners[type]) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].call(this, arguments[1]);
					}
				}
			}
		};
		
		this.playerReady = function(obj) {
			this.eventListener('jwplayerMediaMeta', function(data) {
				jwplayer.utils.extend(_itemMeta, data.metadata);
			});
			
			this.dispatchEvent.call(this, "jwplayerReady", obj);
			
			// Todo: setup event callbacks
			// Todo: run any queued up commands 
			
		};
		
		this.callInternal = function(funcName, args) {
			if (_player && typeof _player[funcName] == "function") {
				if (args !== undefined) {
					return (_player[funcName])(args);
				} else {
					return (_player[funcName])();
				}
			}
			return null;
		};
		
		this.getItemMeta = function() {
			return _itemMeta;
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
		getBuffer: function() { return this.callInternal('getBuffer'); },
		getDuration: function() { return this.callInternal('getDuration'); },
		getFullscreen: function() { return this.callInternal('getFullscreen'); },
		getHeight: function() { return this.container.height; },
		getLockState: function() { return this.callInternal('getLockState'); },
		getMeta: function() { return this.getItemMeta(); },
		getMute: function() { return this.callInternal('getMute'); },
		getPlaylist: function() { return this.callInternal('getPlaylist'); },
		getPlaylistItem: function(item) { return this.callInternal('getPlaylist')[item]; },
		getPosition: function() { return this.callInternal('getPosition'); },
		getState: function() { return this.callInternal('getState'); },
		getVolume: function() { return this.callInternal('getVolume'); },
		getWidth: function() { return this.container.width; },
		
		// Player Public Methods
		setFullscreen: function(fullscreen) { this.callInternal("setFullscreen", fullscreen); return this;},
		setMute: function(mute) { this.callInternal("mute", mute); return this; },
		lock: function() { return this; },
		unlock: function() { return this; },
		load: function(toLoad) { this.callInternal("load", toLoad); return this; },
		playlistItem: function(item) { this.callInternal("playlistItem", item); return this; },
		playlistPrev: function() { this.callInternal("playlistPrev"); return this; },
		playlistNext: function() { this.callInternal("playlistNext"); return this; },
		resize: function(width, height) { 
			this.container.width = width; 
			this.container.height = height; 
			return this; 
		},
		play: function(state) {
			if (typeof state === "undefined") {
				var state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("pause");
				} else {
					this.callInternal("play");
				}
			} else {
				this.callInternal("play", state); 
			}
			return this; 
		},
		pause: function(state) {
			if (typeof state === "undefined") {
				var state = this.getState();
				if (state == jwplayer.api.events.state.PAUSED) {
					this.callInternal("play");
				} else {
					this.callInternal("pause");
				}
			} else {
				this.callInternal("pause", state); 
			}
			return this; 
		},
		stop: function() { this.callInternal("stop"); return this; }, 
		seek: function(position) { this.callInternal("seek", position); return this; },
		setVolume: function(volume) { this.callInternal("volume", volume); return this; },
		
		// Player Events
		onBufferProgress: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, callback); },
		onBufferFull: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, callback); },
		onError: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_ERROR, callback); },
		onFullscreen: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, callback); },
		onMeta: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, callback); },
		onMute: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, callback); },
		onPlaylist: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, callback); },
		onPlaylistItem: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, callback); },
		onReady: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_READY, callback); },
		onResize: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_RESIZE, callback); },
		onComplete: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, callback); },
		onTime: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, callback); },
		onVolume: function(callback) { return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, callback); },
	
		// State events
		onBuffer: function(callback) { return this.stateListener(jwplayer.api.events.state.BUFFERING, callback); },
		onPause: function(callback) { return this.stateListener(jwplayer.api.events.state.PAUSED, callback); },
		onPlay: function(callback) { return this.stateListener(jwplayer.api.events.state.PLAYING, callback); },
		onStop: function(callback) { return this.stateListener(jwplayer.api.events.state.IDLE, callback); },

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
				return new jwplayer.api.PlayerAPI(_container); 
			}
		} else if (typeof identifier == 'number') {
			return jwplayer.getPlayers()[identifier];
		}
	
		return null;
	};
	
	jwplayer.api.playerById = function(id) {
		for(var p in _players) {
			if (_players[p].container.id == id) {
				return _players[p];
			}
		}
		return null;
	};
	
	jwplayer.register = jwplayer.api.addPlayer = function(player) {
		for (var i in _players) {
			if (_players[i] == player) {
				return player; // Player is already in the list;
			}
		}
	
		_players.push(player);
		return player;
	};
	
	// Can't make this a read-only getter, thanks to IE incompatibility.
	jwplayer.getPlayers = function() { 
		return _players.slice(0); 
	};
	
})(jwplayer);

var _userPlayerReady = (typeof playerReady == 'function') ? playerReady : undefined;

playerReady = function(obj) {
	var api = jwplayer(obj['id']);
	api.playerReady(obj);
	
	if (_userPlayerReady) {
		_userPlayerReady.call(this, obj);
	}		
};
(function(jwplayer) {

	jwplayer.embed = function() {};
	
	jwplayer.embed.Embedder = function(playerApi) {
		var events = {},
			players = {},
			config = undefined,
			api = undefined;		
		this.constructor(playerApi);
	};
	
	jwplayer.embed.Embedder.prototype = {
		constructor: function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = this.parseConfig(jwplayer.utils.extend({}, mediaConfig, this.api.config));
		},
	
		embedPlayer: function() {
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
				case 'flash':
					if (jwplayer.utils.hasFlash()) {
						if (this.config.levels || this.config.playlist) {
							this.api.onReady(this.loadAfterReady(this.config));
						}
						var flashPlayer = jwplayer.embed.embedFlash(this.api.container, player, this.config);
						this.api.setPlayer(flashPlayer);
					} else {
						this.players.splice(0, 1);
						embedPlayer();
					}
					break;
				case 'html5':
					var html5player = jwplayer.embed.embedHTML5(this.api.container, player, this.config);
					this.api.setPlayer(html5player);
					this.api.playerReady({id:this.api.container.id});
					break;
				}
			}
			return this.api;
		},
		
		loadAfterReady: function(loadParams) {
			return function(obj) {
				if (loadParams.playlist) {
					this.load(loadParams.playlist);
				} else if (loadParams.levels) {
					var item = this.getPlaylistItem(0);
					item.levels = loadParams.levels;
					this.load(item);
				}
			};
		},
		
		parseConfig: function(config) {
			var parsedConfig = jwplayer.utils.extend({}, config);
			if(parsedConfig.events) {
				this.events = parsedConfig.events;
				delete parsedConfig['events'];
			}
			if(parsedConfig.players) {
				this.players = parsedConfig.players;
				delete parsedConfig['players'];
			}
			if(parsedConfig.plugins) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parsePlugins(parsedConfig.plugins));
				}
			}
			return parsedConfig;
		}
	
	};
	
	jwplayer.embed.defaults = {
		width: 400,
		height: 300
	};
	
	jwplayer.embed.embedFlash = function(container, player, options) {
		var params = jwplayer.utils.extend({}, jwplayer.embed.defaults, options);
		
		var width = params.width; 
		delete params['width'];
		
		var height = params.height; 
		delete params['height'];
		
		// These properties are loaded after playerready; not sent in as flashvars.
		if (params.levels && params.levels.length && params.file === undefined) {
			params.file = params.levels[0]['file'];
		}
		
		delete params['levels'];
		delete params['playlist'];
		
		if (jwplayer.utils.isIE()) {
			var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' + 
				'width="' + width + '" height="' + height + '" ' +
				'id="' + container.id + '" name="' + container.id +
				'">';
			html += '<param name="movie" value="' + player.src + '">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="allowscriptaccess" value="always">';
			html += '<param name="flashvars" value="' + jwplayer.embed.jsonToFlashvars(params) +'">';
			html += '</object>';
			container.outerHTML = html;
			return container;
		} else {
			var obj = document.createElement('object');
			obj.setAttribute('type', 'application/x-shockwave-flash');
			obj.setAttribute('data', player.src);
			obj.setAttribute('width', width);
			obj.setAttribute('height', height);
			obj.setAttribute('id', container.id);
			obj.setAttribute('name', container.id);
			jwplayer.embed.appendAttribute(obj, 'allowfullscreen', 'true');
			jwplayer.embed.appendAttribute(obj, 'allowscriptaccess', 'always');
			jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed.jsonToFlashvars(params));
			container.parentNode.replaceChild(obj, container);
			return obj;
		}
		
	};
	
	jwplayer.embed.embedHTML5 = function(container, player, options) {
		if (jwplayer.html5) {
			container.innerHTML = "<p>Embedded HTML5 player goes here</p>";
			// TODO: remove this requirement from the html5 player (sources instead of levels)
			return new (jwplayer.html5(container)).setup(jwplayer.utils.extend({sources:options.levels, playerready:'playerReady'}, jwplayer.embed.defaults, options));
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
		return flashvars.substring(0, flashvars.length-1);
	};
	
	jwplayer.embed.parsePlugins = function(pluginBlock) {
		if (!pluginBlock) return {};
		
		var flat = {},
			pluginKeys = [];
		
		for (plugin in pluginBlock) {
			var pluginName = plugin.indexOf('-') > 0 ? plugin.substring(0, plugin.indexOf('-')) : plugin;
			var pluginConfig = pluginBlock[plugin];
			pluginKeys.push(plugin);
			for (param in pluginConfig) {
				flat[pluginName+'.'+param] = pluginConfig[param];
			}
		}
		flat['plugins'] = pluginKeys.join(','); 
		return flat;
	};
	
	jwplayer.api.PlayerAPI.prototype.setup = function(options, player) {
		this.config = options;
		jwplayer.register(this);
		return (new jwplayer.embed.Embedder(this)).embedPlayer();
	};
	
})(jwplayer);