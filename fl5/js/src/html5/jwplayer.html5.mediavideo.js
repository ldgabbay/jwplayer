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
	var _isIOS = _utils.isIOS();
	
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
			'play': _generalHandler,
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
			_emptied = false,
			_attached = false,
			_bufferingComplete, _bufferFull,
			_sourceError;
			
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
			
			if (!_attached) {
				return;
			}
			
			_currentItem = item;
			_utils.empty(_video);

			_sourceError = 0; 

			if (item.levels && item.levels.length > 0) {
				if (item.levels.length == 1) {
					_video.src = item.levels[0].file;
				} else {
					if (_video.src) {
						_video.removeAttribute("src");
					}
					for (var i=0; i < item.levels.length; i++) {
						var src = _video.ownerDocument.createElement("source");
						src.src = item.levels[i].file;
						_video.appendChild(src);
						_sourceError++;
					}
				}
			} else {
				_video.src = item.file;
			}
			if (_isIOS) {
				if (item.image) {
					_video.poster = item.image;
				}
				_video.controls = "controls";
				_video.style.display = "block";
			}
			
			_bufferingComplete = _bufferFull = _start = false;
			_model.buffer = 0;
			
			if (!_utils.exists(item.start)) {
				item.start = 0;
			}
			_model.duration = item.duration;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			if((!_isIOS && item.levels.length == 1) || !_emptied) {
				_video.load();
			}
			_emptied = false;
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
			if (!_attached) return;
			
			if (_state != jwplayer.api.events.state.PLAYING) {
				_startInterval();
				if (_bufferFull) {
					_setState(jwplayer.api.events.state.PLAYING);
				} else {
					_setState(jwplayer.api.events.state.BUFFERING);
				}
				_video.play();
			}
		}
		
		/**
		 * Pause the video
		 */
		this.pause = function() {
			if (!_attached) return;
			
			_video.pause();
			_setState(jwplayer.api.events.state.PAUSED);
		}
		
		/**
		 * Instruct the video to seek to a position
		 * @param position The requested position, in seconds
		 */
		this.seek = function(position) {
			if (!_attached) return;
			
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
			if (!_attached) return;
			
			if (!_utils.exists(clear)) {
				clear = true;
			}
			_clearInterval();
			if (clear) {
				_video.style.display = "none";
				_bufferFull = false;
				var agent = navigator.userAgent;
				if(agent.match(/chrome/i)) {
					_video.src = undefined;
				} else if(agent.match(/safari/i)) {
					_video.removeAttribute("src");
				} else {
					_video.src = "";
				}
				_video.removeAttribute("controls");
				_video.removeAttribute("poster");
				_utils.empty(_video);
				_video.load();
				_emptied = true;
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
			if (!_isIOS) {
				_video.volume = position / 100;
				_model.volume = position;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
					volume: Math.round(position)
				});
			}
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			if (!_isIOS) {
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
		
		/**
		 * Return the video tag and stop listening to events  
		 */
		this.detachMedia = function() {
			_attached = false;
			return this.getDisplayElement();
		}
		
		/**
		 * Begin listening to events again  
		 */
		this.attachMedia = function() {
			_attached = true;
		}
		
		/************************************
		 *           PRIVATE METHODS         * 
		 ************************************/
		
		function _handleMediaEvent(type, handler) {
			return function(evt) {
				if (_attached && _utils.exists(evt.target.parentNode)) {
					handler(evt);
				}
			};
		}
		
		/** Initializes the HTML5 video and audio media provider **/
		function _init() {
			_video = document.createElement("video");
			_state = jwplayer.api.events.state.IDLE;
 
			for (var event in _events) {
				_video.addEventListener(event, _handleMediaEvent(event, _events[event]), true);
			}
			_attached = true;

			_video.setAttribute("x-webkit-airplay", "allow"); 
			
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
				if (!isNaN(event.target.duration) && (isNaN(_model.duration) || _model.duration < 1)) {
					if (event.target.duration == Infinity) {
						_model.duration = 0;
					} else {
						_model.duration = Math.round(event.target.duration * 10) / 10;
					}
				}
				if (!_start && _video.readyState > 0) {
					_video.style.display = "block";
					_setState(jwplayer.api.events.state.PLAYING);
				}
				
				if (_utils.exists(_video.webkitDisplayingFullscreen)) {
					if (_video.webkitDisplayingFullscreen != _model.fullscreen) {
						_model.fullscreen = _video.webkitDisplayingFullscreen;
						_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_FULLSCREEN, {
							fullscreen: _model.fullscreen
						});
					}
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
					_model.position = _model.duration > 0 ? (Math.round(event.target.currentTime * 10) / 10) : 0;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_TIME, {
						position: _model.position,
						duration: _model.duration
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
			if ( (_model.duration === 0 || isNaN(_model.duration)) && event.target.duration != Infinity) {
				_model.duration = Math.round(event.target.duration * 10) / 10;
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_META, {
				metadata: meta
			});			
		}

		function _errorHandler(event) {
			if (_state == jwplayer.api.events.state.IDLE) {
				return;
			}
			
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
			_stop(false);
			message += _joinFiles();
			_error = true;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
				message: message
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
