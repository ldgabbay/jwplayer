/**
 * API for the JW Player
 * @author Pablo
 * @version 5.4
 */
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
			if (type == jwplayer.api.events.JWPLAYER_FULLSCREEN && !translated.fullscreen) {
				translated.fullscreen = translated.message == "true" ? true : false;
				delete translated.message;
			} else if (typeof translated.data == "object") {
				// Takes ViewEvent "data" block and moves it up a level
				translated = jwplayer.utils.extend(translated, translated.data);
				delete translated.data;
			}
			
			var rounders = ["position", "duration", "offset"];
			for (var rounder in rounders) {
				if (translated[rounders[rounder]]) {
					translated[rounders[rounder]] = Math.round(translated[rounders[rounder]] * 1000) / 1000;
				}
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
					_currentItem = data.index;
				}
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
				this.callInternal("jwSetFullscreen", !this.callInternal('jwGetFullscreen'));
			} else {
				this.callInternal("jwSetFullscreen", fullscreen);
			}
			return this;
		},
		setMute: function(mute) {
			if (mute === undefined) {
				this.callInternal("jwSetMute", !this.callInternal('jwGetMute'));
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
			if (typeof state == "undefined") {
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
		pause: function(state) {
			if (typeof state == "undefined") {
				state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("jwPause");
				} else {
					this.callInternal("jwPlay");
				}
			} else {
				this.callInternal("jwPause", state);
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
