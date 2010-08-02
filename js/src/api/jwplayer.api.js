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
	
})(jwplayer);