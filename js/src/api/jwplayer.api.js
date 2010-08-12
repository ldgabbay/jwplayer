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