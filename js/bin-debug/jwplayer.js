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
	if (args.length > 0) {
		for (var i = args.length - 1; i > 0; i--){
			for (element in args[i]) {
				args[i-1][element] = args[i][element];
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
};jwplayer.utils.selectors = function(selector){
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

jwplayer.utils.selectors.getElementsByTagAndClass = function(tagName, className){
	elements = [];
	var selected = document.getElementsByTagName(tagName);
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
		var _listeners = {};
		var _stateListeners = {};
		var _player = undefined;
		
		this.container = container;
		this.id = container.id;
		
		this.stateListener = function(state, callback) {
			if (!_stateListeners[state]) { 
				_stateListeners[state] = []; 
				this.eventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, this.stateCallback(state));
			} 
			_stateListeners[state].push(callback);
			return this;
		};
		
		this.stateCallback = function(state) {
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
		
		this.eventListener = function(type, callback) {
			if (!_listeners[type]) { _listeners[type] = []; }
			_listeners[type].push(callback);
			return this;
		};
		
		this.dispatchEvent = function(type) {
			if (_listeners[type]) {
				for (var l in _listeners[type]) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].apply(this, slice(arguments, 1));
					}
				}
			}
		};
		
		this.playerReady = function() {
			_player = this.container;
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
		getBuffer: function() { return undefined; },
		getFullscreen: function() { return undefined; },
		getLockState: function() { return undefined; },
		getMeta: function() { return undefined; },
		getMute: function() { return undefined; },
		getPlaylist: function() { return undefined; },
		getPlaylistItem: function() { return undefined; },
		getHeight: function() { return undefined; },
		getWidth: function() { return undefined; },
		getState: function() { return undefined; },
		getPosition: function() { return undefined; },
		getDuration: function() { return undefined; },
		getVolume: function() { return undefined; },
		
		// Player Public Methods
		setFullscreen: function() { return this; },
		setMute: function() { return this; },
		lock: function() { return this; },
		unlock: function() { return this; },
		load: function() { return this; },
		playlistItem: function() { return this; },
		playlistPrev: function() { return this; },
		playlistNext: function() { return this; },
		resize: function() { return this; },
		play: function() { 
			this.dispatchEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, 'BUFFERING', 'IDLE'); 
			this.dispatchEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, 'PLAYING', 'BUFFERING'); 
			return this; 
		},
		pause: function() { 
			this.dispatchEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, 'PAUSED', 'PLAYING'); 
			return this; 
		},
		stop: function() { 
			this.dispatchEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, 'IDLE', 'PLAYING'); 
			return this; 
		},
		seek: function() { return this; },
		setVolume: function() { return this; },
		
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
		initializePlugin: function(pluginName, pluginCode) { return this; },
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
			var foundPlayer = jwplayer.api.playerByContainer(_container);
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
	
	jwplayer.api.playerByContainer = function(cont) {
		for(var p in _players) {
			if (_players[p].container == cont) {
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
	
	var _userPlayerReady = (typeof playerReady == 'function') ? playerReady : undefined;
	
	playerReady = function(obj) {
		var api = jwplayer(obj['id']);
		api.playerReady();
		
		// Todo: setup event callbacks
		// Todo: run any queued up commands 
		
		if (_userPlayerReady) {
			_userPlayerReady.call(this, obj);
		}		
	};
	
})(jwplayer);(function(jwplayer) {

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
			this.config = this.parseConfig(this.api.config);
		},
	
		embedPlayer: function() {
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
				case 'flash':
					this.api.container = jwplayer.embed.embedFlash(this.api.container, player, this.config);
					break;
				case 'html5':
					this.api.player = jwplayer.embed.embedHTML5(this.api.container, player, this.config);
					playerReady({id:this.api.container.id});
					break;
				}
			}
			return jwplayer.register(this.api);
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
			var player = new (jwplayer.html5(container)).setup(jwplayer.utils.extend({}, jwplayer.embed.defaults, options));
			return player;
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
		if(player) { this.player = player; }
		jwplayer.register(this);
		return (new jwplayer.embed.Embedder(this)).embedPlayer();
	};
	
})(jwplayer);