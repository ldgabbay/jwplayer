/**
 * Video tag stuff
 * 
 * @author pablo
 * @version 6.0
 */
(function(jwplayer) {

	var utils = jwplayer.utils, 
		events = jwplayer.events, 
		states = events.state;
	
	/** HTML5 video class * */
	jwplayer.html5.video = function(videotag) {
		var _isIE = utils.isIE(),
			_mediaEvents = {
			"abort" : _generalHandler,
			"canplay" : _canPlayHandler,
			"canplaythrough" : _generalHandler,
			"durationchange" : _durationUpdateHandler,
			"emptied" : _generalHandler,
			"ended" : _endedHandler,
			"error" : _errorHandler,
			"loadeddata" : _generalHandler,
			"loadedmetadata" : _canPlayHandler,
			"loadstart" : _generalHandler,
			"pause" : _playHandler,
			"play" : _playHandler,
			"playing" : _playHandler,
			"progress" : _progressHandler,
			"ratechange" : _generalHandler,
			"readystatechange" : _generalHandler,
			"seeked" : _sendSeekEvent,
			"seeking" : _isIE ? _bufferStateHandler : _generalHandler,
			"stalled" : _generalHandler,
			"suspend" : _generalHandler,
			"timeupdate" : _timeUpdateHandler,
			"volumechange" : _volumeHandler,
			"waiting" : _bufferStateHandler
		},
		
		_extensions = utils.extensionmap,

		// Current playlist item
		_item,
		// Currently playing source
		_source,
		// Current type - used to filter the sources
		_type,
		// Reference to the video tag
		_videotag,
		// Current duration
		_duration,
		// Current position
		_position,
		// Requested seek position
		_seekOffset,
		// Whether seeking is ready yet
		_canSeek,
		// Whether we have sent out the BUFFER_FULL event
		_bufferFull,
		// If we should seek on canplay
		_delayedSeek,
		// If we're currently dragging the seek bar
		_dragging,
		// Current media state
		_state = states.IDLE,
		// Save the volume state before muting
		_lastVolume,
		// Using setInterval to check buffered ranges
		_bufferInterval = -1,
		// Last sent buffer amount
		_bufferPercent = -1,
		// Event dispatcher
		_eventDispatcher = new events.eventdispatcher(),
		// Whether or not we're listening to video tag events
		_attached = false,
		// Quality levels
		_levels,
		// Current quality level index
		_currentQuality = -1,
		// Whether or not we're on an Android device
		_isAndroid = utils.isAndroid(),
		// Reference to self
		_this = this,
		
		//make sure we only do complete once
		_completeOnce = false,
		
		_beforecompleted = false;
		
		utils.extend(_this, _eventDispatcher);

		// Constructor
		function _init(videotag) {
			_videotag = videotag;
			_setupListeners();

			// Workaround for a Safari bug where video disappears on switch to fullscreen
			_videotag.controls = true;
			_videotag.controls = false;
			
			// Enable AirPlay
			_videotag.setAttribute("x-webkit-airplay", "allow");
			
			_attached = true;
		}

		function _setupListeners() {
			for (var evt in _mediaEvents) {
				_videotag.addEventListener(evt, _mediaEvents[evt], false);
			}
		}

		function _sendEvent(type, data) {
			if (_attached) {
				_eventDispatcher.sendEvent(type, data);
			}
		}

		
		function _generalHandler(evt) {
			//if (evt) utils.log("%s %o (%s,%s)", evt.type, evt);
		}

		function _durationUpdateHandler(evt) {
			_generalHandler(evt);
			if (!_attached) return;
			var newDuration = _round(_videotag.duration);
			if (_duration != newDuration) {
				_duration = newDuration;
			}
			if (_isAndroid && _delayedSeek > 0 && newDuration > _delayedSeek) {
				_seek(_delayedSeek);
			}
			_timeUpdateHandler();
		}

		function _timeUpdateHandler(evt) {
			_generalHandler(evt);
			if (!_attached) return;
			if (_state == states.PLAYING && !_dragging) {
				_position = _round(_videotag.currentTime);
				_sendEvent(events.JWPLAYER_MEDIA_TIME, {
					position : _position,
					duration : _duration
				});
				// Working around a Galaxy Tab bug; otherwise _duration should be > 0
//				if (_position >= _duration && _duration > 3 && !utils.isAndroid(2.3)) {
//					_complete();
//				}
			}
		}

		function _round(number) {
			return Number(number.toFixed(1));
		}

		function _canPlayHandler(evt) {
			_generalHandler(evt);
			if (!_attached) return;
			if (!_canSeek) {
				_canSeek = true;
				_sendBufferFull();
			}
			if (evt.type == "loadedmetadata") {
                //fixes Chrome bug where it doesn't like being muted before video is loaded
                if (_videotag.muted) {
                    _videotag.muted = false;
                    _videotag.muted = true;
                }
                _sendEvent(events.JWPLAYER_MEDIA_META,{duration:_videotag.duration,height:_videotag.videoHeight,width:_videotag.videoWidth});
            }
		}
		
		
		
		function _progressHandler(evt) {
			_generalHandler(evt);
			if (_canSeek && _delayedSeek > 0 && !_isAndroid) {
				// Need to set a brief timeout before executing delayed seek; IE9 stalls otherwise.
				if (_isIE) setTimeout(_seek, 200, _delayedSeek);
				// Otherwise call it immediately
				else _seek(_delayedSeek);
			}
		}
		
		function _sendBufferFull() {
			if (!_bufferFull) {
				_bufferFull = true;
				_sendEvent(events.JWPLAYER_MEDIA_BUFFER_FULL);
			}
		}

		function _playHandler(evt) {
			_generalHandler(evt);
			if (!_attached || _dragging) return;

			if (_videotag.paused) {
				if (_videotag.currentTime == _videotag.duration && _videotag.duration > 3) {
					// Needed as of Chrome 20
					//_complete();
				} else {
					_pause();
				}
			} else {
				if (utils.isFF() && evt.type=="play" && _state == states.BUFFERING)
					// In FF, we get an extra "play" event on startup - we need to wait for "playing",
					// which is also handled by this function
					return;
				else
					_setState(states.PLAYING);
			}
		}

		function _bufferStateHandler(evt) {
			_generalHandler(evt);
			if (!_attached) return;
			if (!_dragging) _setState(states.BUFFERING);
		}

		function _errorHandler(evt) {
			if (!_attached) return;
			utils.log("Error playing media: %o", _videotag.error);
			_eventDispatcher.sendEvent(events.JWPLAYER_MEDIA_ERROR, {message: "Error loading media: File could not be played"});
			_setState(states.IDLE);
		}

		function _getPublicLevels(levels) {
			var publicLevels;
			if (utils.typeOf(levels)=="array" && levels.length > 0) {
				publicLevels = [];
				for (var i=0; i<levels.length; i++) {
					var level = levels[i], publicLevel = {};
					publicLevel.label = _levelLabel(level) ? _levelLabel(level) : i;
					publicLevels[i] = publicLevel;
				}
			}
			return publicLevels;
		}
		
		function _sendLevels(levels) {
			var publicLevels = _getPublicLevels(levels);
			if (publicLevels) {
				_eventDispatcher.sendEvent(events.JWPLAYER_MEDIA_LEVELS, { levels: publicLevels, currentQuality: _currentQuality });
			}
		}
		
		function _levelLabel(level) {
			if (level.label) return level.label;
			else return 0;
		}
		
		_this.load = function(item) {
			if (!_attached) return;
			_completeOnce = false;
			_item = item;
			_delayedSeek = 0;
			_duration = item.duration ? item.duration : -1;
			_position = 0;
			
			_levels = _item.sources;
			_pickInitialQuality();
			_sendLevels(_levels);
			
			_completeLoad();
		}
		
		function _pickInitialQuality() {
			if (_currentQuality < 0) _currentQuality = 0;
			
			for (var i=0; i<_levels.length; i++) {
				if (_levels[i]["default"]) {
					_currentQuality = i;
					break;
				}
			}

			var cookies = utils.getCookies(),
				label = cookies["qualityLabel"];

			if (label) {
				for (i=0; i<_levels.length; i++) {
					if (_levels[i]["label"] == label) {
						_currentQuality = i;
						break;
					}
				} 
			}
		}
		
		function _completeLoad() {
			_canSeek = false;
			_bufferFull = false;
			_source = _levels[_currentQuality];
			
			_setState(states.BUFFERING); 
			_videotag.src = _source.file;
			_videotag.load();
			
			_bufferInterval = setInterval(_sendBufferUpdate, 100);

			if (utils.isIPod() || utils.isAndroid(2.3)) {
				_sendBufferFull();
			}
		}

		var _stop = _this.stop = function() {
			if (!_attached) return;
			_videotag.removeAttribute("src");
			if (!_isIE) _videotag.load();
			_currentQuality = -1;
			clearInterval(_bufferInterval);
			_setState(states.IDLE);
		}

		_this.play = function() {
			if (_attached && !_dragging) _videotag.play();
		}

		var _pause = _this.pause = function() {
			if (_attached) {
				_videotag.pause();
				_setState(states.PAUSED);
			}
		}
			
		_this.seekDrag = function(state) {
			if (!_attached) return; 
			_dragging = state;
			if (state) _videotag.pause();
			else _videotag.play();
		}
		
		var _seek = _this.seek = function(pos) {
			if (!_attached) return; 
			//if (_videotag.readyState >= _videotag.HAVE_FUTURE_DATA) {
			if (_canSeek) {
				_delayedSeek = 0;
				_videotag.currentTime = pos;
			} else {
				_delayedSeek = pos;
			}
		}
		
		function _sendSeekEvent(evt) {
			_generalHandler(evt);
			if (!_dragging) {
				_sendEvent(events.JWPLAYER_MEDIA_SEEK, {
					position: _position,
					offset: _videotag.currentTime
				});
				if (_state != states.PAUSED) {
					_setState(states.PLAYING);
				}
			}
		}

		var _volume = _this.volume = function(vol) {
			if (utils.exists(vol)) {
				_videotag.volume = Math.min(Math.max(0, vol / 100), 1);
				_lastVolume = _videotag.volume * 100;
			}
		}
		
		function _volumeHandler(evt) {
			_sendEvent(events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(_videotag.volume * 100)
			});
			_sendEvent(events.JWPLAYER_MEDIA_MUTE, {
				mute: _videotag.muted
			});
		}
		
		_this.mute = function(state) {
			if (!utils.exists(state)) state = !_videotag.muted;
			if (state) {
				_lastVolume = _videotag.volume * 100;
				_videotag.muted = true;
			} else {
				_volume(_lastVolume);
				_videotag.muted = false;
			}
		}

		/** Set the current player state * */
		function _setState(newstate) {
			// Handles a FF 3.5 issue
			if (newstate == states.PAUSED && _state == states.IDLE) {
				return;
			}
			
			// Ignore state changes while dragging the seekbar
			if (_dragging) return

			if (_state != newstate) {
				var oldstate = _state;
				_state = newstate;
				_sendEvent(events.JWPLAYER_PLAYER_STATE, {
					oldstate : oldstate,
					newstate : newstate
				});
			}
		}
		
		function _sendBufferUpdate() {
			if (!_attached) return; 
			var newBuffer = _getBuffer();
			if (newBuffer != _bufferPercent) {
				_bufferPercent = newBuffer;
				_sendEvent(events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: Math.round(_bufferPercent * 100)
				});
			}
			if (newBuffer >= 1) {
				clearInterval(_bufferInterval);
			}
		}
		
		function _getBuffer() {
			if (_videotag.buffered.length == 0 || _videotag.duration == 0)
				return 0;
			else
				return _videotag.buffered.end(_videotag.buffered.length-1) / _videotag.duration;
		}
		
		function _endedHandler(evt) {
			_generalHandler(evt);
			if (_attached) _complete();
		}
		
		function _complete() {
		    //if (_completeOnce) return;
		    _completeOnce = true;
			if (_state != states.IDLE) {
				_currentQuality = -1;
                _beforecompleted = true;
				_sendEvent(events.JWPLAYER_MEDIA_BEFORECOMPLETE);


				if (_attached) {
				    _setState(states.IDLE);
    				_sendEvent(events.JWPLAYER_MEDIA_COMPLETE);
    			    _beforecompleted = false; 	
                }
			}
		}
		
        this.checkComplete = function() {
            
            return _beforecompleted;
        }

		/**
		 * Return the video tag and stop listening to events  
		 */
		_this.detachMedia = function() {
			_attached = false;
			return _videotag;
		}
		
		/**
		 * Begin listening to events again  
		 */
		_this.attachMedia = function(seekable) {
			_attached = true;
			if (!seekable) _canSeek = false;
			if (_beforecompleted) {
			    _setState(states.IDLE);
			    _sendEvent(events.JWPLAYER_MEDIA_COMPLETE);
                _beforecompleted = false;
			}
		}
		
		// Provide access to video tag
		// TODO: remove; used by InStream
		_this.getTag = function() {
			return _videotag;
		}
		
		_this.audioMode = function() {
			if (!_levels) { return false; }
			var type = _levels[0].type;
			return (type == "aac" || type == "mp3" || type == "vorbis");
		}

		_this.setCurrentQuality = function(quality) {
			if (_currentQuality == quality) return;
			quality = parseInt(quality);
			if (quality >=0) {
				if (_levels && _levels.length > quality) {
					_currentQuality = quality;
					utils.saveCookie("qualityLabel", _levels[quality].label);
					_sendEvent(events.JWPLAYER_MEDIA_LEVEL_CHANGED, { currentQuality: quality, levels: _getPublicLevels(_levels)} );
					var currentTime = _videotag.currentTime;
					_completeLoad();
					_this.seek(currentTime);
				}
			}
		}
		
		_this.getCurrentQuality = function() {
			return _currentQuality;
		}
		
		_this.getQualityLevels = function() {
			return _getPublicLevels(_levels);
		}
		
		// Call constructor
		_init(videotag);

	}

})(jwplayer);