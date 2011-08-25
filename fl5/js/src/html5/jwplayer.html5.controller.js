/**
 * JW Player controller component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	var _mediainfovariables = ["width", "height", "state", "playlist", "item", "position", "buffer", "duration", "volume", "mute", "fullscreen"];
	var _utils = jwplayer.utils;
	
	jwplayer.html5.controller = function(api, container, model, view) {
		var _api = api;
		var _model = model;
		var _view = view;
		var _container = container;
		var _itemUpdated = true;
		var _oldstart = -1;
		
		var debug = _utils.exists(_model.config.debug) && (_model.config.debug.toString().toLowerCase() == 'console');
		var _eventDispatcher = new jwplayer.html5.eventdispatcher(_container.id, debug);
		_utils.extend(this, _eventDispatcher);
		
		var _queuedEvents = [];
		var _ready = false;
		
		function forward(evt) {
			if (_ready) {
				_eventDispatcher.sendEvent(evt.type, evt);
			} else {
				_queuedEvents.push(evt);
			}
		}
		
		function _playerReady(evt) {
			if (!_ready) {
				_ready = true;

				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_READY, evt);
				
				if (jwplayer.utils.exists(window.playerReady)) {
					playerReady(evt);
				}

				if (jwplayer.utils.exists(window[model.config.playerReady])) {
					window[model.config.playerReady](evt);
				}

				while (_queuedEvents.length > 0) {
					var queued = _queuedEvents.shift(); 
					_eventDispatcher.sendEvent(queued.type, queued);						
				}
			
				if (model.config.autostart && !jwplayer.utils.isIOS()) {
					_item(_model.item);
				}

				while (_queuedCalls.length > 0) {
					var queuedCall = _queuedCalls.shift();
					_callMethod(queuedCall.method, queuedCall.arguments);
				}

			}
		}
		
		_model.addGlobalListener(forward);
		
		/** Set event handlers **/
		_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, function() {
			_model.getMedia().play();
		});
		_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, function(evt) {
			if (evt.position >= _model.playlist[_model.item].start && _oldstart >= 0) {
				_model.playlist[_model.item].start = _oldstart;
				_oldstart = -1;
			}
		});
		_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, function(evt) {
			setTimeout(_completeHandler, 25);
		});
		
		function _play() {
			try {
				_loadItem(_model.item);
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (_itemUpdated || _model.state == jwplayer.api.events.state.IDLE) {
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
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					switch (_model.state) {
						case jwplayer.api.events.state.PLAYING:
						case jwplayer.api.events.state.BUFFERING:
							if (_model.getMedia()) {
								_model.getMedia().pause();
							}
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
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (typeof position != "number") {
						position = parseFloat(position);
					}
					switch (_model.state) {
						case jwplayer.api.events.state.IDLE:
							if (_oldstart < 0) {
								_oldstart = _model.playlist[_model.item].start;
								_model.playlist[_model.item].start = position;
							}
							_play();
							break;
						case jwplayer.api.events.state.PLAYING:
						case jwplayer.api.events.state.PAUSED:
						case jwplayer.api.events.state.BUFFERING:
							_model.seek(position);
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
		function _stop(clear) {
			if (!_utils.exists(clear)) {
				clear = true;
			}
			try {
				if (_model.getMedia()) {
					_model.getMedia().stop(clear);
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
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (_model.config.shuffle) {
						_loadItem(_getShuffleItem());
					} else if (_model.item + 1 == _model.playlist.length) {
						_loadItem(0);
					} else {
						_loadItem(_model.item + 1);
					}
				}
				if (_model.state != jwplayer.api.events.state.IDLE) {
					var oldstate = _model.state;
					_model.state = jwplayer.api.events.state.IDLE;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
						oldstate: oldstate,
						newstate: jwplayer.api.events.state.IDLE
					});
				}
				_play();
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Stop playback and loading of the video. **/
		function _prev() {
			try {
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (_model.config.shuffle) {
						_loadItem(_getShuffleItem());
					} else if (_model.item === 0) {
						_loadItem(_model.playlist.length - 1);
					} else {
						_loadItem(_model.item - 1);
					}
				}
				if (_model.state != jwplayer.api.events.state.IDLE) {
					var oldstate = _model.state;
					_model.state = jwplayer.api.events.state.IDLE;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
						oldstate: oldstate,
						newstate: jwplayer.api.events.state.IDLE
					});
				}
				_play();
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		function _getShuffleItem() {
			var result = null;
			if (_model.playlist.length > 1) {
				while (!_utils.exists(result)) {
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
			if (!_model.playlist || !_model.playlist[item]) {
				return false;
			}
			
			try {
				if (_model.playlist[item].levels[0].file.length > 0) {
					var oldstate = _model.state;
					if (oldstate !== jwplayer.api.events.state.IDLE) {
						if (_model.playlist[_model.item].provider == _model.playlist[item].provider) {
							_stop(false);
						} else {
							_stop();
						}
					}
					_loadItem(item);
					_play();
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		function _loadItem(item) {
			if (!_model.playlist[item]) {
				return;
			}
			_model.setActiveMediaProvider(_model.playlist[item]);
			if (_model.item != item) {
				_model.item = item;
				_itemUpdated = true;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
					"index": item
				});
			}
		}
		
		/** Get / set the video's volume level. **/
		function _setVolume(volume) {
			try {
				_loadItem(_model.item);
				var media = _model.getMedia();
				switch (typeof(volume)) {
					case "number":
						media.volume(volume);
						break;
					case "string":
						media.volume(parseInt(volume, 10));
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
				_loadItem(_model.item);
				var media = _model.getMedia();
				if (typeof state == "undefined") {
					media.mute(!_model.mute);
				} else {
					if (state.toString().toLowerCase() == "true") {
						media.mute(true);
					} else {
						media.mute(false);
					}
				}
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
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_RESIZE, {
					"width": _model.width,
					"height": _model.height
				});
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Jumping the player to/from fullscreen. **/
		function _setFullscreen(state) {
			try {
				if (typeof state == "undefined") {
					state = !_model.fullscreen;
				} 
				
				if (state.toString().toLowerCase() == "true") {
					_model.fullscreen = true;					
					_view.fullscreen(true);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_FULLSCREEN, {
						fullscreen: true
					});
				} else {
					_model.fullscreen = false;					
					_view.fullscreen(false);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_FULLSCREEN, {
						fullscreen: false
					});
				}
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_RESIZE, {
					"width": _model.width,
					"height": _model.height
				});
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
				_loadItem(_model.item);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		function _detachMedia() {
			try {
				return _model.getMedia().detachMedia();
			} catch (err) {
				return null;
			}
		}

		function _attachMedia() {
			try {
				return _model.getMedia().attachMedia();
			} catch (err) {
				return null;
			}
		}

		jwplayer.html5.controller.repeatoptions = {
			LIST: "LIST",
			ALWAYS: "ALWAYS",
			SINGLE: "SINGLE",
			NONE: "NONE"
		};
		
		function _completeHandler() {
			switch (_model.config.repeat.toUpperCase()) {
				case jwplayer.html5.controller.repeatoptions.SINGLE:
					_play();
					break;
				case jwplayer.html5.controller.repeatoptions.ALWAYS:
					if (_model.item == _model.playlist.length - 1 && !_model.config.shuffle) {
						_item(0);
					} else {
						_next();
					}
					break;
				case jwplayer.html5.controller.repeatoptions.LIST:
					if (_model.item == _model.playlist.length - 1 && !_model.config.shuffle) {
						_stop();
						_loadItem(0);
					} else {
						_next();
					}
					break;
				default:
					_stop();
					break;
			}
		}
		
		var _queuedCalls = [];
		
		function _waitForReady(func) {
			return function() {
				if (_ready) {
					_callMethod(func, arguments);
				} else {
					_queuedCalls.push({ method: func, arguments: arguments});
				}
			}
		}

		function _callMethod(func, args) {
			var _args = [];
			for (i=0; i < args.length; i++) {
				_args.push(args[i]);
			}
			func.apply(this, _args);
		}
		
		this.play = _waitForReady(_play);
		this.pause = _waitForReady(_pause);
		this.seek = _waitForReady(_seek);
		this.stop = _waitForReady(_stop);
		this.next = _waitForReady(_next);
		this.prev = _waitForReady(_prev);
		this.item = _waitForReady(_item);
		this.setVolume = _waitForReady(_setVolume);
		this.setMute = _waitForReady(_setMute);
		this.resize = _waitForReady(_resize);
		this.setFullscreen = _waitForReady(_setFullscreen);
		this.load = _waitForReady(_load);
		this.playerReady = _playerReady;
		this.detachMedia = _detachMedia; 
		this.attachMedia = _attachMedia; 
	};
})(jwplayer);
