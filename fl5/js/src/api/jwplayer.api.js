/**
 * API for the JW Player
 * 
 * @author Pablo
 * @version 5.8
 */
(function(jwplayer) {
	var _players = [];
	
	jwplayer.api = function(container) {
		this.container = container;
		this.id = container.id;
		
		var _listeners = {};
		var _stateListeners = {};
		var _componentListeners = {};
		var _readyListeners = [];
		var _player = undefined;
		var _playerReady = false;
		var _queuedCalls = [];
		var _instream = undefined;
		
		var _originalHTML = jwplayer.utils.getOuterHTML(container);
		
		var _itemMeta = {};
		var _callbacks = {};
		
		// Player Getters
		this.getBuffer = function() {
			return this.callInternal('jwGetBuffer');
		};
		this.getContainer = function() {
			return this.container;
		};
		
		function _setButton(ref, plugin) {
			return function(id, handler, outGraphic, overGraphic) {
				if (ref.renderingMode == "flash" || ref.renderingMode == "html5") {
					var handlerString;
					if (handler) {
						_callbacks[id] = handler;
						handlerString = "jwplayer('" + ref.id + "').callback('" + id + "')";
					} else if (!handler && _callbacks[id]) {
						delete _callbacks[id];
					}
					_player.jwDockSetButton(id, handlerString, outGraphic, overGraphic);
				}
				return plugin;
			};
		}
		
		this.getPlugin = function(pluginName) {
			var _this = this;
			var _plugin = {};
			if (pluginName == "dock") {
				return jwplayer.utils.extend(_plugin, {
					setButton: _setButton(_this, _plugin),
					show: function() { _this.callInternal('jwDockShow'); return _plugin; },
					hide: function() { _this.callInternal('jwDockHide'); return _plugin; },
					onShow: function(callback) { 
						_this.componentListener("dock", jwplayer.api.events.JWPLAYER_COMPONENT_SHOW, callback); 
						return _plugin; 
					},
					onHide: function(callback) { 
						_this.componentListener("dock", jwplayer.api.events.JWPLAYER_COMPONENT_HIDE, callback); 
						return _plugin; 
					}
				});
			} else if (pluginName == "controlbar") {
				return jwplayer.utils.extend(_plugin, {
					show: function() { _this.callInternal('jwControlbarShow'); return _plugin; },
					hide: function() { _this.callInternal('jwControlbarHide'); return _plugin; },
					onShow: function(callback) { 
						_this.componentListener("controlbar", jwplayer.api.events.JWPLAYER_COMPONENT_SHOW, callback); 
						return _plugin; 
					},
					onHide: function(callback) { 
						_this.componentListener("controlbar", jwplayer.api.events.JWPLAYER_COMPONENT_HIDE, callback); 
						return _plugin; 
					}
				});
			} else if (pluginName == "display") {
				return jwplayer.utils.extend(_plugin, {
					show: function() { _this.callInternal('jwDisplayShow'); return _plugin; },
					hide: function() { _this.callInternal('jwDisplayHide'); return _plugin; },
					onShow: function(callback) { 
						_this.componentListener("display", jwplayer.api.events.JWPLAYER_COMPONENT_SHOW, callback); 
						return _plugin; 
					},
					onHide: function(callback) { 
						_this.componentListener("display", jwplayer.api.events.JWPLAYER_COMPONENT_HIDE, callback); 
						return _plugin; 
					}
				});
			} else {
				return this.plugins[pluginName];
			}
		};
		
		this.callback = function(id) {
			if (_callbacks[id]) {
				return _callbacks[id]();
			}
		};
		this.getDuration = function() {
			return this.callInternal('jwGetDuration');
		};
		this.getFullscreen = function() {
			return this.callInternal('jwGetFullscreen');
		};
		this.getHeight = function() {
			return this.callInternal('jwGetHeight');
		};
		this.getLockState = function() {
			return this.callInternal('jwGetLockState');
		};
		this.getMeta = function() {
			return this.getItemMeta();
		};
		this.getMute = function() {
			return this.callInternal('jwGetMute');
		};
		this.getPlaylist = function() {
			var playlist = this.callInternal('jwGetPlaylist');
			if (this.renderingMode == "flash") {
				jwplayer.utils.deepReplaceKeyName(playlist, ["__dot__","__spc__","__dsh__"], ["."," ","-"]);	
			}
			for (var i = 0; i < playlist.length; i++) {
				if (!jwplayer.utils.exists(playlist[i].index)) {
					playlist[i].index = i;
				}
			}
			return playlist;
		};
		this.getPlaylistItem = function(item) {
			if (!jwplayer.utils.exists(item)) {
				item = this.getCurrentItem();
			}
			return this.getPlaylist()[item];
		};
		this.getPosition = function() {
			return this.callInternal('jwGetPosition');
		};
		this.getRenderingMode = function() {
			return this.renderingMode;
		};
		this.getState = function() {
			return this.callInternal('jwGetState');
		};
		this.getVolume = function() {
			return this.callInternal('jwGetVolume');
		};
		this.getWidth = function() {
			return this.callInternal('jwGetWidth');
		};
		// Player Public Methods
		this.setFullscreen = function(fullscreen) {
			if (!jwplayer.utils.exists(fullscreen)) {
				this.callInternal("jwSetFullscreen", !this.callInternal('jwGetFullscreen'));
			} else {
				this.callInternal("jwSetFullscreen", fullscreen);
			}
			return this;
		};
		this.setMute = function(mute) {
			if (!jwplayer.utils.exists(mute)) {
				this.callInternal("jwSetMute", !this.callInternal('jwGetMute'));
			} else {
				this.callInternal("jwSetMute", mute);
			}
			return this;
		};
		this.lock = function() {
			return this;
		};
		this.unlock = function() {
			return this;
		};
		this.load = function(toLoad) {
			this.callInternal("jwLoad", toLoad);
			return this;
		};
		this.playlistItem = function(item) {
			this.callInternal("jwPlaylistItem", item);
			return this;
		};
		this.playlistPrev = function() {
			this.callInternal("jwPlaylistPrev");
			return this;
		};
		this.playlistNext = function() {
			this.callInternal("jwPlaylistNext");
			return this;
		};
		this.resize = function(width, height) {
			if (this.renderingMode == "html5") {
				_player.jwResize(width, height);
			} else {
				this.container.width = width;
				this.container.height = height;
				var wrapper = document.getElementById(this.id + "_wrapper");
				if (wrapper) {
					wrapper.style.width = width + "px";
					wrapper.style.height = height + "px";
				}
			}
			return this;
		};
		this.play = function(state) {
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
		};
		this.pause = function(state) {
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
		};
		this.stop = function() {
			this.callInternal("jwStop");
			return this;
		};
		this.seek = function(position) {
			this.callInternal("jwSeek", position);
			return this;
		};
		this.setVolume = function(volume) {
			this.callInternal("jwSetVolume", volume);
			return this;
		};
		this.loadInstream = function(item, instreamOptions) {
			_instream = new jwplayer.api.instream(this, _player, item, instreamOptions);
			return _instream;
		};
		// Player Events
		this.onBufferChange = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, callback);
		};
		this.onBufferFull = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, callback);
		};
		this.onError = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_ERROR, callback);
		};
		this.onFullscreen = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, callback);
		};
		this.onMeta = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, callback);
		};
		this.onMute = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, callback);
		};
		this.onPlaylist = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, callback);
		};
		this.onPlaylistItem = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, callback);
		};
		this.onReady = function(callback) {
			return this.eventListener(jwplayer.api.events.API_READY, callback);
		};
		this.onResize = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_RESIZE, callback);
		};
		this.onComplete = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, callback);
		};
		this.onSeek = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_SEEK, callback);
		};
		this.onTime = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, callback);
		};
		this.onVolume = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, callback);
		};
		this.onBeforePlay = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BEFOREPLAY, callback);
		};
		this.onBeforeComplete = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BEFORECOMPLETE, callback);
		};
		// State events
		this.onBuffer = function(callback) {
			return this.stateListener(jwplayer.api.events.state.BUFFERING, callback);
		};
		this.onPause = function(callback) {
			return this.stateListener(jwplayer.api.events.state.PAUSED, callback);
		};
		this.onPlay = function(callback) {
			return this.stateListener(jwplayer.api.events.state.PLAYING, callback);
		};
		this.onIdle = function(callback) {
			return this.stateListener(jwplayer.api.events.state.IDLE, callback);
		};
		this.remove = function() {
			if (!_playerReady) {
				throw "Cannot call remove() before player is ready";
				return;
			}
			_remove(this);
		};
		
		function _remove(player) {
			_queuedCalls = [];
			if (jwplayer.utils.getOuterHTML(player.container) != _originalHTML) {
				jwplayer.api.destroyPlayer(player.id, _originalHTML);
			}
		}
		
		this.setup = function(options) {
			if (jwplayer.embed) {
				// Destroy original API on setup() to remove existing listeners
				var newId = this.id;
				_remove(this);
				var newApi = jwplayer(newId);
				newApi.config = options;
				return new jwplayer.embed(newApi);
			}
			return this;
		};
		this.registerPlugin = function(id, arg1, arg2) {
			jwplayer.plugins.registerPlugin(id, arg1, arg2);
		};
		
		/** Use this function to set the internal low-level player.  This is a javascript object which contains the low-level API calls. **/
		this.setPlayer = function(player, renderingMode) {
			_player = player;
			this.renderingMode = renderingMode;
		};
		
		this.stateListener = function(state, callback) {
			if (!_stateListeners[state]) {
				_stateListeners[state] = [];
				this.eventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, stateCallback(state));
			}
			_stateListeners[state].push(callback);
			return this;
		};
		
		this.detachMedia = function() {
			if (this.renderingMode == "html5") {
				return this.callInternal("jwDetachMedia");
			}
		}

		this.attachMedia = function() {
			if (this.renderingMode == "html5") {
				return this.callInternal("jwAttachMedia");
			}
		}

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
		
		this.componentListener = function(component, type, callback) {
			if (!_componentListeners[component]) {
				_componentListeners[component] = {};
			}
			if (!_componentListeners[component][type]) {
				_componentListeners[component][type] = [];
				this.eventListener(type, _componentCallback(component, type));
			}
			_componentListeners[component][type].push(callback);
			return this;
		};
		
		function _componentCallback(component, type) {
			return function(event) {
				if (component == event.component) {
					var callbacks = _componentListeners[component][type];
					if (callbacks) {
						for (var c = 0; c < callbacks.length; c++) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, event);
							}
						}
					}
				}
			};
		}		
		
		this.addInternalListener = function(player, type) {
			try {
				player.jwAddEventListener(type, 'function(dat) { jwplayer("' + this.id + '").dispatchEvent("' + type + '", dat); }');
			} catch(e) {
				jwplayer.utils.log("Could not add internal listener");
			}
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
				var args = _utils.translateEventResponse(type, arguments[1]);
				for (var l = 0; l < _listeners[type].length; l++) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].call(this, args);
					}
				}
			}
		};

		this.dispatchInstreamEvent = function(type) {
			if (_instream) {
				_instream.dispatchEvent(type, arguments);
			}
		};

		this.callInternal = function() {
			if (_playerReady) {
				var funcName = arguments[0],
				args = [];
			
				for (var argument = 1; argument < arguments.length; argument++) {
					args.push(arguments[argument]);
				}
				
				if (typeof _player != "undefined" && typeof _player[funcName] == "function") {
					if (args.length == 2) { 
						return (_player[funcName])(args[0], args[1]);
					} else if (args.length == 1) {
						return (_player[funcName])(args[0]);
					} else {
						return (_player[funcName])();
					}
				}
				return null;
			} else {
				_queuedCalls.push(arguments);
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
				_itemMeta = {};
			});
			
			this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, function(data) {
				jwplayer.utils.extend(_itemMeta, data.metadata);
			});
			
			this.dispatchEvent(jwplayer.api.events.API_READY);
			
			while (_queuedCalls.length > 0) {
				this.callInternal.apply(this, _queuedCalls.shift());
			}
		};
		
		this.getItemMeta = function() {
			return _itemMeta;
		};
		
		this.getCurrentItem = function() {
			return this.callInternal('jwGetPlaylistIndex');
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
		return this;
	};
	
	jwplayer.api.selectPlayer = function(identifier) {
		var _container;
		
		if (!jwplayer.utils.exists(identifier)) {
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
				return jwplayer.api.addPlayer(new jwplayer.api(_container));
			}
		} else if (typeof identifier == 'number') {
			return jwplayer.getPlayers()[identifier];
		}
		
		return null;
	};
	
	jwplayer.api.events = {
		API_READY: 'jwplayerAPIReady',
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
		JWPLAYER_RESIZE: 'jwplayerResize',
		JWPLAYER_ERROR: 'jwplayerError',
		JWPLAYER_MEDIA_BEFOREPLAY: 'jwplayerMediaBeforePlay',
		JWPLAYER_MEDIA_BEFORECOMPLETE: 'jwplayerMediaBeforeComplete',
		JWPLAYER_COMPONENT_SHOW: 'jwplayerComponentShow',
		JWPLAYER_COMPONENT_HIDE: 'jwplayerComponentHide',
		JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
		JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
		JWPLAYER_MEDIA_ERROR: 'jwplayerMediaError',
		JWPLAYER_MEDIA_LOADED: 'jwplayerMediaLoaded',
		JWPLAYER_MEDIA_COMPLETE: 'jwplayerMediaComplete',
		JWPLAYER_MEDIA_SEEK: 'jwplayerMediaSeek',
		JWPLAYER_MEDIA_TIME: 'jwplayerMediaTime',
		JWPLAYER_MEDIA_VOLUME: 'jwplayerMediaVolume',
		JWPLAYER_MEDIA_META: 'jwplayerMediaMeta',
		JWPLAYER_MEDIA_MUTE: 'jwplayerMediaMute',
		JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState',
		JWPLAYER_PLAYLIST_LOADED: 'jwplayerPlaylistLoaded',
		JWPLAYER_PLAYLIST_ITEM: 'jwplayerPlaylistItem',
		JWPLAYER_INSTREAM_CLICK: 'jwplayerInstreamClicked',
		JWPLAYER_INSTREAM_DESTROYED: 'jwplayerInstreamDestroyed'
	};
	
	jwplayer.api.events.state = {
		BUFFERING: 'BUFFERING',
		IDLE: 'IDLE',
		PAUSED: 'PAUSED',
		PLAYING: 'PLAYING'
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
			try {
				_players[index].callInternal("jwDestroy");
			} catch (e) {}
			var toDestroy = document.getElementById(_players[index].id);
			if (document.getElementById(_players[index].id + "_wrapper")) {
				toDestroy = document.getElementById(_players[index].id + "_wrapper");
			}
			if (toDestroy) {
				if (replacementHTML) {
					jwplayer.utils.setOuterHTML(toDestroy, replacementHTML);
				} else {
					var replacement = document.createElement('div');
					var newId = toDestroy.id;
					if (toDestroy.id.indexOf("_wrapper") == toDestroy.id.length - 8) {
						newID = toDestroy.id.substring(0, toDestroy.id.length - 8);
					}
					replacement.setAttribute('id', newId);
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
	} else {
		jwplayer.api.selectPlayer(obj.id).playerReady(obj);
	}
	
	if (_userPlayerReady) {
		_userPlayerReady.call(this, obj);
	}
};
