/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.html5.states.IDLE,
		"playing": jwplayer.html5.states.PLAYING,
		"pause": jwplayer.html5.states.PAUSED,
		"buffering": jwplayer.html5.states.BUFFERING
	};
	
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
		'load': _generalHandler,
		'loadedfirstframe': _generalHandler
	};
	
	var _domelement;
	var _jdomelement;
	var _bufferFull;
	var _bufferingComplete;
	var _state = jwplayer.html5.states.IDLE;
	var _interval;
	var _stopped;
	
	jwplayer.html5.mediavideo = function(player) {
		_domelement = player._domelement;
		_jdomelement = $(_domelement);
		_jdomelement.attr('loop', player._model.config.repeat);
		var media = {
			play: _play(player),
			pause: _pause(player),
			seek: _seek(player),
			stop: _stop(player),
			volume: _volume(player),
			mute: _mute(player),
			fullscreen: _fullscreen(player),
			load: _load(player),
			resize: _resize(player),
			getState: _getState,
			interval: null,
			loadcount: 0,
			hasChrome: false
		};
		media.mute(player.getMute());
		media.volume(player.getVolume());
		return media;
	};

	function _getState(){
		return _state;
	}
	
	function _generalHandler(event, player) {
	}
	
	function _stateHandler(event, player) {
		if (_states[event.type]) {
			_setState(player, _states[event.type]);
		}
	}
		
	function _setState(player, newstate) {
		if (_stopped) {
			newstate = jwplayer.html5.states.IDLE;
		}
		if (_state != newstate) {
			var oldstate = _state;
			_state = newstate;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
		}
		if (newstate == jwplayer.html5.states.IDLE) {
			clearInterval(_interval);
			_interval = null;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE);
			if (player._model.config.repeat && !_stopped) {
				player.play();
			}
			if (_jdomelement.css('display') != 'none') {
				_jdomelement.css('display', 'none');
			}
		}
		_stopped = false;
	}
	
	
	function _metaHandler(event, player) {
		var meta = {
			height: event.target.videoHeight,
			width: event.target.videoWidth,
			duration: event.target.duration
		};
		if (player._model.duration === 0) {
			player._model.duration = event.target.duration;
		}
		player._model.playlist[player._model.item] = $.extend(player._model.playlist[player._model.item], meta);
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_META, meta);
	}
	
	
	function _positionHandler(event, player) {
		if (_stopped) {
			return;
		}
		if (!jwplayer.html5.utils.isNull(event.target)) {
			if (player._model.duration === 0) {
				player._model.duration = event.target.duration;
			}
			
			if (_state == jwplayer.html5.states.PLAYING) {
				player._model.position = Math.round(event.target.currentTime * 10) / 10;
				player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_TIME, {
					position: Math.round(event.target.currentTime * 10) / 10,
					duration: Math.round(event.target.duration * 10) / 10
				});
			}
		}
		_progressHandler({}, player);
	}
	
	
	function _progressHandler(event, player) {
		var bufferPercent, bufferTime, bufferFill;
		if (!isNaN(event.loaded / event.total)) {
			bufferPercent = event.loaded / event.total * 100;
			bufferTime = bufferPercent / 100 * (player._model.duration - _domelement.currentTime);
		} else if ((_domelement.buffered !== undefined) && (_domelement.buffered.length > 0)) {
			maxBufferIndex = 0;
			if (maxBufferIndex >= 0) {
				bufferPercent = _domelement.buffered.end(maxBufferIndex) / _domelement.duration * 100;
				bufferTime = _domelement.buffered.end(maxBufferIndex) - _domelement.currentTime;
			}
		}
		
		bufferFill = bufferTime / player._model.config.bufferlength * 100;
		
		// TODO: Buffer underrun
		if (false) {
			if (bufferFill < 25 && _state == jwplayer.html5.states.PLAYING) {
				_setState(jwplayer.html5.states.BUFFERING);
				_bufferFull = false;
				if (!_domelement.seeking) {
					_domelement.pause();
				}
			} else if (bufferFill > 95 && _state == jwplayer.html5.states.BUFFERING && _bufferFull === false && bufferTime > 0) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
			}
		}
		
		if (_bufferFull === false) {
			_bufferFull = true;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
		}
		
		if (!_bufferingComplete) {
			if (bufferPercent == 100 && _bufferingComplete === false) {
				_bufferingComplete = true;
			}
			
			if (!jwplayer.html5.utils.isNull(bufferPercent)) {
				player._model.buffer = Math.round(bufferPercent);
				player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: Math.round(bufferPercent)
					//bufferingComplete: _bufferingComplete,
					//bufferFull: _bufferFull,
					//bufferFill: bufferFill,
					//bufferTime: bufferTime
				});
			}
			
		}
	}
	
	
	function _startInterval(player) {
		if (_interval === null) {
			_interval = window.setInterval(function() {
				_positionHandler({}, player);
			}, 100);
		}
	}
	
	
	function _errorHandler(event, player) {
		player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, {});
	}
	
	
	function _play(player) {
		return function() {
			if (_state != jwplayer.html5.states.PLAYING) {
				_setState(player, jwplayer.html5.states.PLAYING);
				_domelement.play();
			}
		};
	}
	
	
	/** Switch the pause state of the player. **/
	function _pause(player) {
		return function() {
			_domelement.pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function _seek(player) {
		return function(position) {
			_domelement.currentTime = position;
			_domelement.play();
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function _stop(player) {
		return function() {
			_stopped = true;
			_domelement.pause();
			clearInterval(_interval);
			_interval = undefined;
			player._model.position = 0;
			_setState(player, jwplayer.html5.states.IDLE);
		};
	}
	
	
	/** Change the video's volume level. **/
	function _volume(player) {
		return function(position) {
			player._model.volume = position;
			_domelement.volume = position / 100;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(_domelement.volume * 100)
			});
		};
	}
	
	
	/** Switch the mute state of the player. **/
	function _mute(player) {
		return function(state) {
			player._model.mute = state;
			_domelement.muted = state;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, {
				mute: _domelement.muted
			});
		};
	}
	
	
	/** Resize the player. **/
	function _resize(player) {
		return function(width, height) {
			// TODO: Fullscreen
			if (false) {
				$("#" + player.id + "_jwplayer").css("position", 'fixed');
				$("#" + player.id + "_jwplayer").css("top", '0');
				$("#" + player.id + "_jwplayer").css("left", '0');
				$("#" + player.id + "_jwplayer").css("width", width);
				$("#" + player.id + "_jwplayer").css("height", height);
				player._model.width = $("#" + player.id + "_jwplayer").width;
				player._model.height = $("#" + player.id + "_jwplayer").height;
			}
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_RESIZE, {
				fullscreen: player._model.fullscreen,
				width: width,
				hieght: height
			});
		};
	}
	
	
	/** Switch the fullscreen state of the player. **/
	function _fullscreen(player) {
		return function(state) {
			player._model.fullscreen = state;
			if (state === true) {
				player.resize("100%", "100%");
			} else {
				player.resize(player._model.config.width, player._model.config.height);
			}
		};
	}
	
	
	/** Load a new video into the player. **/
	function _load(player) {
		return function(playlistItem) {
			_domelement = _insertVideoTag(player, playlistItem);
			_jdomelement = $(_domelement);
			$.each(_events, function(event, handler) {
				_domelement.addEventListener(event, function(event) {
					handler(event, player);
				}, true);
			});
			if (_jdomelement.css('display') == 'none') {
				_jdomelement.css('display', 'block');
			}
			setTimeout(function() {
				_bufferFull = false;
				_bufferingComplete = false;
				_setState(player, jwplayer.html5.states.BUFFERING);
				_startInterval(player);
				try {
					_domelement.currentTime = 0;					
				} catch (err){
					
				}
			}, 25);
		};
	}
	
	function _insertVideoTag(player, playlistItem) {
		var div1 = document.getElementById(player.id);
		var vid = div1.ownerDocument.createElement("video");
		//vid.controls = "none";
		if (vid.autobuffer){
			vid.autobuffer = player._model.config.autoplay;
		} else if (vid.autoplay){
			vid.autoplay = player._model.config.autoplay;
		}
		for (var sourceIndex in playlistItem.sources){
			var sourceModel = playlistItem.sources[sourceIndex];
			var source = div1.ownerDocument.createElement("source");
			source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
			if (sourceModel.type === undefined) {
				var extension = jwplayer.html5.utils.extension(sourceModel.file);
				if (extension == "ogv") {
					extension = "ogg";
				}
				source.type = 'video/' + extension + ';';
			} else {
				source.type = sourceModel.type;
			}
			vid.appendChild(source);
		}
		vid.width = player._model.config.width;
		vid.height = player._model.config.height;
		var styles = {
			position: 'absolute',
			width: player._model.config.width + 'px',
			height: player._model.config.height + 'px',
			top: 0,
			left: 0,
			'z-index': 0,
			margin: 'auto',
			display: 'block'
		};
		for (var style in styles){
			vid.style[style] = styles[style];
		}
		div1.parentNode.replaceChild(vid, div1);
		vid.id = player.id;
		return vid;
	}
	
	
})(jwplayer);
