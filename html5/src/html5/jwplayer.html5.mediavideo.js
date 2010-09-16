/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.api.events.state.IDLE,
		"playing": jwplayer.api.events.state.PLAYING,
		"pause": jwplayer.api.events.state.PAUSED,
		"buffering": jwplayer.api.events.state.BUFFERING
	};
	
	var _css = jwplayer.html5.utils.css;
	
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
		jwplayer.utils.extend(this, _eventDispatcher);
		var _model = model;
		var _container = container;
		var _bufferFull;
		var _bufferingComplete;
		var _state = jwplayer.api.events.state.IDLE;
		var _interval = null;
		var _stopped;
		var _loadcount = 0;
		var _start = false;
		var hasChrome = false;
		
		function _getState() {
			return _state;
		}
		
		function _loadHandler(evt) {
		}
		
		function _generalHandler(event) {
		}
		
		function _stateHandler(event) {
			if (_states[event.type]) {
				_setState(_states[event.type]);
			}
		}
		
		function _setState(newstate) {
			if (_stopped) {
				newstate = jwplayer.api.events.state.IDLE;
			}
			if (_state != newstate) {
				var oldstate = _state;
				_model.state = newstate;
				_state = newstate;
				if (newstate == jwplayer.api.events.state.IDLE) {
					_clearInterval();
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE);
					
					if (_container.style.display != 'none') {
						_container.style.display = 'none';
					}
				}
				
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
			}
			_stopped = false;
		}
		
		
		function _metaHandler(event) {
			var meta = {
				height: event.target.videoHeight,
				width: event.target.videoWidth,
				duration: event.target.duration
			};
			if (_model.duration === 0) {
				_model.duration = event.target.duration;
			}
			_model.playlist[_model.item] = jwplayer.utils.extend(_model.playlist[_model.item], meta);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_META, {
				metadata: meta
			});
		}
		
		
		function _positionHandler(event) {
			if (_stopped) {
				return;
			}
			
			if (event !== undefined && event.target !== undefined) {
				if (_model.duration === 0) {
					_model.duration = event.target.duration;
				}
				
				if (_state == jwplayer.api.events.state.PLAYING) {
					if (!_start && _container.readyState > 0) {
						_start = true;
						_container.currentTime = _model.playlist[_model.item].start;
						_container.volume = _model.volume / 100;
						_container.muted = _model.mute;
					}
					_model.position = Math.round(event.target.currentTime * 10) / 10;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_TIME, {
						position: Math.round(event.target.currentTime * 10) / 10,
						duration: Math.round(event.target.duration * 10) / 10
					});
				}
			}
			_progressHandler(event);
		}
		
		
		function _progressHandler(event) {
			var bufferPercent, bufferTime;
			if (event !== undefined && event.lengthComputable && event.total) {
				bufferPercent = event.loaded / event.total * 100;
				bufferTime = bufferPercent / 100 * (_model.duration - _container.currentTime);
			} else if ((_container.buffered !== undefined) && (_container.buffered.length > 0)) {
				maxBufferIndex = 0;
				if (maxBufferIndex >= 0) {
					bufferPercent = _container.buffered.end(maxBufferIndex) / _container.duration * 100;
					bufferTime = _container.buffered.end(maxBufferIndex) - _container.currentTime;
				}
			}
			
			if (_bufferFull === false) {
				_bufferFull = true;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
			}
			
			if (!_bufferingComplete) {
				if (bufferPercent == 100 && _bufferingComplete === false) {
					_bufferingComplete = true;
				}
				
				if (bufferPercent !== null && (bufferPercent > _model.buffer)) {
					_model.buffer = Math.round(bufferPercent);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
						bufferPercent: Math.round(bufferPercent)
					});
				}
				
			}
		}
		
		
		function _startInterval() {
			if (_interval === null) {
				_interval = setInterval(function() {
					_positionHandler();
				}, 100);
			}
		}
		
		function _clearInterval() {
			clearInterval(_interval);
			_interval = null;
		}
		
		function _errorHandler(event) {
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, event.target);
		}
		
		this.getDisplayElement = function() {
			return _container;
		};
		
		this.play = function() {
			if (_state != jwplayer.api.events.state.PLAYING) {
				if (_container.style.display != "block") {
					_container.style.display = "block";
				}
				_container.play();
				_setState(jwplayer.api.events.state.PLAYING);
				_startInterval();
			}
		};
		
		
		/** Switch the pause state of the player. **/
		this.pause = function() {
			_container.pause();
			_setState(jwplayer.api.events.state.PAUSED);
		};
		
		
		/** Seek to a position in the video. **/
		this.seek = function(position) {
			_container.currentTime = position;
			_container.play();
		};
		
		
		/** Stop playback and loading of the video. **/
		this.stop = function() {
			_stopped = true;
			_container.pause();
			_clearInterval();
			_model.position = 0;
			_setState(jwplayer.api.events.state.IDLE);
		};
		
		
		/** Change the video's volume level. **/
		this.volume = function(position) {
			_container.volume = position / 100;
			_model.volume = position;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(position)
			});
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			_container.muted = state;
			_model.mute = state;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, {
				mute: state
			});
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
		
		
		/** Switch the fullscreen state of the player. **/
		this.fullscreen = function(state) {
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
		};
		
		
		/** Load a new video into the player. **/
		this.load = function(playlistItem) {
			_embed(playlistItem);
			
			_bufferFull = false;
			_bufferingComplete = false;
			_start = false;
			setTimeout(function() {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
				_setState(jwplayer.api.events.state.BUFFERING);
				_positionHandler();
			}, 25);
		};
		
		_embed = function(playlistItem) {
			var vid = document.createElement("video");
			vid.preload = "none";
			vid.loop = _model.config.repeat;
			for (var sourceIndex in playlistItem.levels) {
				var sourceModel = playlistItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				if (sourceModel.type === undefined) {
					var extension = jwplayer.html5.utils.extension(sourceModel.file);
					if (jwplayer.html5.extensionmap[extension] !== undefined) {
						source.type = jwplayer.html5.extensionmap[extension];
					} else {
						source.type = 'video/' + extension + ';';
					}
				} else {
					source.type = sourceModel.type;
				}
				vid.appendChild(source);
			}
			vid.style.position = _container.style.position;
			vid.style.top = _container.style.top;
			vid.style.left = _container.style.left;
			vid.style.width = _container.style.width;
			vid.style.height = _container.style.height;
			vid.style.zIndex = _container.style.zIndex;
			vid.onload = _loadHandler;
			vid.volume = 0;
			_container.parentNode.replaceChild(vid, _container);
			vid.id = _container.id;
			_container = vid;
			for (var event in _events) {
				_container.addEventListener(event, function(evt) {
					if (evt.target.parentNode !== null) {
						_events[evt.type](evt);
					}
				}, true);
			}
		};
		
		this.embed = _embed;
		
		return this;
	};
})(jwplayer);
