/**
 * JW Player Video Media component
 *
 * @author zach
 * 
 * @version 5.7
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.api.events.state.IDLE,
		"playing": jwplayer.api.events.state.PLAYING,
		"pause": jwplayer.api.events.state.PAUSED,
		"buffering": jwplayer.api.events.state.BUFFERING
	};
	
	var _utils = jwplayer.utils;
	var _css = _utils.css;
	
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
		_utils.extend(this, _eventDispatcher);
		var _model = model,
			_container = container,
			_video, 
			_state, 
			_start,
			_currentItem,
			_interval,
			_bufferingComplete, _bufferFull;
			
		_init();
		
		
		/************************************
		 *           PUBLIC METHODS         * 
		 ************************************/
		
		/** 
		 * Start loading the video and playing
		 */
		this.load = function(item, play) {
			if (typeof play == "undefined") {
				play = true;
			}
			_currentItem = item;
			_utils.empty(_video);
			if (item.levels && item.levels.length > 0) {
				_video.removeAttribute("src");
				for (var i=0; i < item.levels.length; i++) {
					var src = _video.ownerDocument.createElement("source");
					src.src = item.levels[i].file;
					_video.appendChild(src);
				}
			} else {
				_video.src = item.file;
			}
			_video.load();
			if (_utils.isIOS()) {
				if (item.image) {
					_video.poster = item.image;
				}
				_video.controls = "controls";
			}
			
			_bufferingComplete = _bufferFull = false;
			_model.buffer = 0;
			
			if (!_utils.exists(item.start)) {
				item.start = 0;
			}
			_model.duration = item.duration;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			
			if (play) {
				_setState(jwplayer.api.events.state.BUFFERING);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: 0
				});
				this.play();
			}
		}
		
		/**
		 * Play the video if paused
		 */
		this.play = function() {
			if (_state != jwplayer.api.events.state.PLAYING) {
				_startInterval();
				_video.play();
				if (_bufferFull) {
					_setState(jwplayer.api.events.state.PLAYING);
				} else {
					_setState(jwplayer.api.events.state.BUFFERING);
				}
			}
		}
		
		/**
		 * Pause the video
		 */
		this.pause = function() {
			_video.pause();
			_setState(jwplayer.api.events.state.PAUSED);
		}
		
		/**
		 * Instruct the video to seek to a position
		 * @param position The requested position, in seconds
		 */
		this.seek = function(position) {
			if (!(_model.duration <= 0 || isNaN(_model.duration)) &&
				!(_model.position <= 0 || isNaN(_model.position))) {
					_video.currentTime = position;
					_video.play();
			}
		}
		
		/**
		 * Stop the playing video and unload it
		 */
		_stop = this.stop = function(clear) {
			if (!_utils.exists(clear)) {
				clear = true;
			}
			_clearInterval();
			_video.pause();
			_video.removeAttribute("src");
			_video.removeAttribute("controls");
			_video.removeAttribute("poster");
			if (clear) {
				_utils.empty(_video);
				_video.load();
				if(_video.webkitSupportsFullscreen) {
					try {
						_video.webkitExitFullscreen();
					} catch(err) {}
				}
			}
			_setState(jwplayer.api.events.state.IDLE);
		}
		
		/** Switch the fullscreen state of the player. **/
		this.fullscreen = function(state) {
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
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
		
		/** Change the video's volume level. **/
		this.volume = function(position) {
			if (!_utils.isIOS()) {
				_video.volume = position / 100;
				_model.volume = position;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
					volume: Math.round(position)
				});
			}
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			if (!_utils.isIOS()) {
				_video.muted = state;
				_model.mute = state;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, {
					mute: state
				});
			}
		};

		
		/**
		 * Get the visual component
		 */
		this.getDisplayElement = function() {
			return _video;
		}
		
		/**
		 * Whether this media component has its own chrome
		 */
		this.hasChrome = function() {
			return false;
		}
		
		/************************************
		 *           PRIVATE METHODS         * 
		 ************************************/
		
		
		/** Initializes the HTML5 video and audio media provider **/
		function _init() {
			_video = document.createElement("video");
			_state = jwplayer.api.events.state.IDLE;
			_start = false;
 
			for (var event in _events) {
				_video.addEventListener(event, function(evt) {
					if (_utils.exists(evt.target.parentNode)) {
						_events[evt.type](evt);
					}
				}, true);
			}

			
			if(_container.parentNode) {
				_container.parentNode.replaceChild(_video, _container);
			}
			
			if (!_video.id) {
				_video.id = _container.id;
			}
		}
		
		/** Set the current player state **/
		function _setState(newstate) {
			// Handles FF 3.5 issue
			if (newstate == jwplayer.api.events.state.PAUSED && _state == jwplayer.api.events.state.IDLE) {
				return;
			}

			if (_state != newstate) {
				var oldstate = _state;
				_model.state = _state = newstate;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
			}
		}
		
		
		/** Handle general <video> tag events **/
		function _generalHandler(event) {
		}
		
		/** Update the player progress **/
		function _progressHandler(event) {
			var bufferPercent;
			if (_utils.exists(event) && event.lengthComputable && event.total) {
				bufferPercent = event.loaded / event.total * 100;
			} else if (_utils.exists(_video.buffered) && (_video.buffered.length > 0)) {
				var maxBufferIndex = _video.buffered.length - 1;
				if (maxBufferIndex >= 0) {
					bufferPercent = _video.buffered.end(maxBufferIndex) / _video.duration * 100;
				}
			}
			
			if (_bufferFull === false && _state == jwplayer.api.events.state.BUFFERING) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
				_bufferFull = true;
			}
			
			if (!_bufferingComplete) {
				if (bufferPercent == 100) {
					_bufferingComplete = true;
				}
				
				if (_utils.exists(bufferPercent) && (bufferPercent > _model.buffer)) {
					_model.buffer = Math.round(bufferPercent);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
						bufferPercent: Math.round(bufferPercent)
					});
				}
				
			}
		}
		
		/** Update the player's position **/
		function _positionHandler(event) {
			if (_utils.exists(event) && _utils.exists(event.target)) {
				if (_model.duration <= 0 || isNaN(_model.duration)) {
					_model.duration = Math.round(event.target.duration * 10) / 10;
				}
				if (!_start && _video.readyState > 0) {
					_setState(jwplayer.api.events.state.PLAYING);
				}
				if (_state == jwplayer.api.events.state.PLAYING) {
					if (!_start && _video.readyState > 0) {
						_start = true;
						try {
							if (_video.currentTime < _currentItem.start) {
								_video.currentTime = _currentItem.start;
							}
						} catch (err) {}
						_video.volume = _model.volume / 100;
						_video.muted = _model.mute;
					}
					_model.position = Math.round(event.target.currentTime * 10) / 10;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_TIME, {
						position: event.target.currentTime,
						duration: event.target.duration
					});
					if (_model.position >= _model.duration && (_model.position > 0 || _model.duration > 0)) {
						_complete();
					}
				}
			}
			_progressHandler(event);
		}

		/** Load handler **/
		function _loadHandler(event) {
		}

		function _stateHandler(event) {
			if (_states[event.type]) {
				if (event.type == "ended") {
					_complete();
				} else {
					_setState(_states[event.type]);
				}
			}
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
			_currentItem = _utils.extend(_currentItem, meta);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_META, {
				metadata: meta
			});			
		}

		function _errorHandler(event) {
			var message = "There was an error: ";
			if ((event.target.error && event.target.tagName.toLowerCase() == "video") ||
					event.target.parentNode.error && event.target.parentNode.tagName.toLowerCase() == "video") {
				var element = !_utils.exists(event.target.error) ? event.target.parentNode.error : event.target.error;
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
				_utils.log("An unknown error occurred.  Continuing...");
				return;
			}
			_stop();
			message += _joinFiles();
			_error = true;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
				error: message
			});
			return;		
		}
		
		
		function _joinFiles() {
			var result = "";
			for (var sourceIndex in _currentItem.levels) {
				var sourceModel = _currentItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				result += jwplayer.utils.getAbsolutePath(sourceModel.file);
				if (sourceIndex < (_currentItem.levels.length - 1)) {
					result += ", ";
				}
			}
			return result;
		}
		
		function _startInterval() {
			if (!_utils.exists(_interval)) {
				_interval = setInterval(function() {
					_progressHandler();
				}, 100);
			}
		}
		
		function _clearInterval() {
			clearInterval(_interval);
			_interval = null;
		}
		
		function _complete() {
			if (_state != jwplayer.api.events.state.IDLE) {
				_stop(false);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE);
			}
		}
		

	};
})(jwplayer);
