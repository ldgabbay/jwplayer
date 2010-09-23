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
		var _hasChrome = false;
		var _currentItem;
		var _sourceError = 0;
		var _bufferTimes = [];
		var _bufferBackupTimeout;
		
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
				var _sendComplete = false;
				if (newstate == jwplayer.api.events.state.IDLE) {
					_clearInterval();
					if (_model.position >= _model.duration && (_model.position || _model.duration)) {
						_sendComplete = true;
					}
					
					if (_container.style.display != 'none') {
						_container.style.display = 'none';
					}
				}
				
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
				if (_sendComplete) {
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE);
				}
			}
			_stopped = false;
		}
		
		
		function _metaHandler(event) {
			var meta = {
				height: event.target.videoHeight,
				width: event.target.videoWidth,
				duration: event.target.duration
			};
			if (_model.duration === 0 || isNaN(_model.duration)) {
				_model.duration = Math.round(event.target.duration * 10) / 10;
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
				if (_model.duration === 0 || isNaN(_model.duration)) {
					_model.duration = Math.round(event.target.duration * 10) / 10;
				}
				if (!_start && _container.readyState > 0) {
					_setState(jwplayer.api.events.state.PLAYING);
				}
				if (_state == jwplayer.api.events.state.PLAYING) {
					if (!_start && _container.readyState > 0) {
						_start = true;
						try {
							_container.currentTime = _model.playlist[_model.item].start;
						} catch (err) {
						
						}
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
		
		function _bufferBackup() {
			var timeout = (_bufferTimes[_bufferTimes.length - 1] - _bufferTimes[0]) / _bufferTimes.length;
			_bufferBackupTimeout = setTimeout(function() {
				if (!_bufferingComplete) {
					_progressHandler({
						lengthComputable: true,
						loaded: 1,
						total: 1
					});
				}
			}, timeout * 10);
		}
		
		function _progressHandler(event) {
			var bufferPercent, bufferTime;
			if (event !== undefined && event.lengthComputable && event.total) {
				_addBufferEvent();
				bufferPercent = event.loaded / event.total * 100;
				bufferTime = bufferPercent / 100 * (_model.duration - _container.currentTime);
				if (50 < bufferPercent && !_bufferingComplete) {
					clearTimeout(_bufferBackupTimeout);
					_bufferBackup();
				}
			} else if ((_container.buffered !== undefined) && (_container.buffered.length > 0)) {
				maxBufferIndex = 0;
				if (maxBufferIndex >= 0) {
					bufferPercent = _container.buffered.end(maxBufferIndex) / _container.duration * 100;
					bufferTime = _container.buffered.end(maxBufferIndex) - _container.currentTime;
				}
			}
			
			if (_bufferFull === false && _state == jwplayer.api.events.state.BUFFERING) {
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
			_stop();
			var message = "There was an error: ";
			if (event.target.error || event.target.parentNode.error) {
				var element = event.target.error === undefined ? event.target.parentNode.error : event.target.error;
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
				_sourceError++;
				if (_sourceError != _currentItem.levels.length) {
					return;
				}
				message = "The video could not be loaded, either because the server or network failed or because the format is not supported: ";
			}
			
			message += joinFiles();
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
				error: message
			});
			return;
		}
		
		function joinFiles() {
			var result = "";
			for (var sourceIndex in _currentItem.levels) {
				var sourceModel = _currentItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				result += jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				if (sourceIndex < (_currentItem.levels.length - 1)) {
					result += ", ";
				}
			}
			return result;
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
		function _stop() {
			_stopped = true;
			_container.pause();
			_clearInterval();
			_model.position = 0;
			_setState(jwplayer.api.events.state.IDLE);
		}
		
		this.stop = _stop;
		
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
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			_bufferFull = false;
			_bufferingComplete = false;
			_start = false;
			_bufferTimes = [];
			_addBufferEvent();
			_setState(jwplayer.api.events.state.BUFFERING);
			
			setTimeout(function() {
				_positionHandler();
			}, 25);
		};
		
		function _addBufferEvent() {
			var currentTime = new Date().getTime();
			_bufferTimes.push(currentTime);
		}
		
		this.hasChrome = function() {
			return _hasChrome;
		};
		
		function _embed(playlistItem) {
			_hasChrome = false;
			_currentItem = playlistItem;
			var vid = document.createElement("video");
			vid.preload = "none";
			if (_model.config.repeat.toUpperCase() == jwplayer.html5.controller.repeatoptions.SINGLE) {
				//vid.loop = true;				
			}
			_sourceError = 0;
			for (var sourceIndex in playlistItem.levels) {
				var sourceModel = playlistItem.levels[sourceIndex];
				if (jwplayer.html5.utils.isYouTube(sourceModel.file)) {
					delete vid;
					_embedYouTube(sourceModel.file);
					return;
				}
				var sourceType;
				if (sourceModel.type === undefined) {
					var extension = jwplayer.html5.utils.extension(sourceModel.file);
					if (jwplayer.html5.extensionmap[extension] !== undefined) {
						sourceType = jwplayer.html5.extensionmap[extension];
					} else {
						sourceType = 'video/' + extension + ';';
					}
				} else {
					sourceType = sourceModel.type;
				}
				if (vid.canPlayType(sourceType) === ""){
					continue;
				}
				var source = _container.ownerDocument.createElement("source");
				source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
				source.type = sourceType;
				vid.appendChild(source);
			}
			if (_model.config.chromeless) {
				vid.poster = jwplayer.html5.utils.getAbsolutePath(playlistItem.image);
				vid.controls = "controls";
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
		}
		
		function _embedYouTube(path) {
			var object = document.createElement("object");
			path = ["http://www.youtube.com/v/", path.replace(/^[^v]+v.(.{11}).*/, "$1"), "&amp;hl=en_US&amp;fs=1&autoplay=1"].join("");
			var objectParams = {
				movie: path,
				allowFullScreen: "true",
				allowscriptaccess: "always"
			};
			for (var objectParam in objectParams) {
				var param = document.createElement("param");
				param.name = objectParam;
				param.value = objectParams[objectParam];
				object.appendChild(param);
			}
			
			var embed = document.createElement("embed");
			var embedParams = {
				src: path,
				type: "application/x-shockwave-flash",
				allowscriptaccess: "always",
				allowfullscreen: "true",
				width: _container.style.width,
				height: _container.style.height
			};
			for (var embedParam in embedParams) {
				embed[embedParam] = embedParams[embedParam];
			}
			object.appendChild(embed);
			
			object.style.position = _container.style.position;
			object.style.top = _container.style.top;
			object.style.left = _container.style.left;
			object.style.width = _container.style.width;
			object.style.height = _container.style.height;
			object.style.zIndex = _container.style.zIndex;
			_container.parentNode.replaceChild(object, _container);
			object.id = _container.id;
			_container = object;
			_hasChrome = true;
		}
		
		this.embed = _embed;
		
		return this;
	};
})(jwplayer);
