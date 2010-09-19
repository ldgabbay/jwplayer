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
					switch (_model.state) {
						case jwplayer.api.events.state.IDLE:
							if (_itemUpdated) {
								_model.setActiveMediaProvider(_model.playlist[_model.item]);
								_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, _model.getMedia().play);
								_model.getMedia().load(_model.playlist[_model.item]);
								_itemUpdated = false;
							} else {
								_model.getMedia().play();
							}
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
				_model.loadPlaylist(arg);
				_itemUpdated = true;
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