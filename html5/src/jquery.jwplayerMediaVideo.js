/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {
	var states = {
		"ended": $.fn.jwplayer.states.IDLE,
		"playing": $.fn.jwplayer.states.PLAYING,
		"pause": $.fn.jwplayer.states.PAUSED,
		"buffering": $.fn.jwplayer.states.BUFFERING
	};
	
	var events = {
		'abort': generalHandler,
		'canplay': stateHandler,
		'canplaythrough': stateHandler,
		'durationchange': metaHandler,
		'emptied': generalHandler,
		'ended': stateHandler,
		'error': errorHandler,
		'loadeddata': metaHandler,
		'loadedmetadata': metaHandler,
		'loadstart': stateHandler,
		'pause': stateHandler,
		'play': positionHandler,
		'playing': stateHandler,
		'progress': progressHandler,
		'ratechange': generalHandler,
		'seeked': stateHandler,
		'seeking': stateHandler,
		'stalled': stateHandler,
		'suspend': stateHandler,
		'timeupdate': positionHandler,
		'volumechange': generalHandler,
		'waiting': stateHandler,
		'canshowcurrentframe': generalHandler,
		'dataunavailable': generalHandler,
		'empty': generalHandler,
		'load': generalHandler,
		'loadedfirstframe': generalHandler
	};
	
	
	$.fn.jwplayerMediaVideo = function(player) {
		var media = {
			play: play(player),
			pause: pause(player),
			seek: seek(player),
			stop: stop(player),
			volume: volume(player),
			mute: mute(player),
			fullscreen: fullscreen(player),
			load: load(player),
			resize: resize(player),
			state: $.fn.jwplayer.states.IDLE,
			interval: null,
			loadcount: 0
		};
		player.media = media;
		media.mute(player.mute());
		media.volume(player.volume());
		$.each(events, function(event, handler) {
			player.model.domelement[0].addEventListener(event, function(event) {
				handler(event, player);
			}, true);
		});
	};
	
	function generalHandler(event, player) {
		//$.fn.jwplayerUtils.log("general:" + event.type);
	}
	
	function stateHandler(event, player) {
		if (states[event.type]) {
			setState(player, states[event.type]);
		}
	}
	
	function setState(player, newstate) {
		if (player.model.state != newstate) {
			var oldstate = player.model.state;
			player.media.state = newstate;
			player.model.state = newstate;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
		}
		if (newstate == $.fn.jwplayer.states.IDLE) {
			clearInterval(player.media.interval);
			player.media.interval = null;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE);
		}
	}
	
	function metaHandler(event, player) {
		var meta = {
			height: event.target.videoHeight,
			width: event.target.videoWidth,
			duration: event.target.duration
		};
		if (player.model.duration === 0) {
			player.model.duration = event.target.duration;
		}
		player.model.sources[player.model.source] = $.extend(player.model.sources[player.model.source], meta);
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_META, meta);
	}
	
	function positionHandler(event, player) {
		if (!$.fn.jwplayerUtils.isNull(event.target)) {
			if (player.model.duration === 0) {
				player.model.duration = event.target.duration;
			}
			
			if (!$.fn.jwplayerUtils.isNull(event.target.currentTime)) {
				player.model.position = event.target.currentTime;
			}
			if (player.media.state == $.fn.jwplayer.states.PLAYING) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, {
					position: event.target.currentTime,
					duration: event.target.duration
				});
			}
		}
		progressHandler({}, player);
	}
	
	function progressHandler(event, player) {
		var bufferPercent, bufferTime, bufferFill;
		if (!isNaN(event.loaded / event.total)) {
			bufferPercent = event.loaded / event.total * 100;
			bufferTime = bufferPercent / 100 * player.model.duration;
		} else if ((player.model.domelement[0].buffered !== undefined) &&(player.model.domelement[0].buffered.length > 0)) {
			maxBufferIndex = 0;
			if (maxBufferIndex >= 0) {
				bufferPercent = player.model.domelement[0].buffered.end(maxBufferIndex) / player.model.domelement[0].duration * 100;
				bufferTime = player.model.domelement[0].buffered.end(maxBufferIndex) - player.model.position;
			}
		}
		
		bufferFill = bufferTime / player.model.config.bufferlength * 100;
		
		if (bufferFill < 25 && player.media.state == $.fn.jwplayer.states.PLAYING) {
			player.media.bufferFull = false;
			player.model.domelement[0].pause();
			setState(PlayerState.BUFFERING);
		} else if (bufferFill > 95 && player.media.state == $.fn.jwplayer.states.BUFFERING && player.media.bufferFull === false && bufferTime > 0) {
			player.media.bufferFull = true;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
		}
		
		if (!player.media.bufferingComplete) {
			if (bufferPercent == 100 && player.media.bufferingComplete === false) {
				player.media.bufferingComplete = true;
			}
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, {
				'bufferPercent': bufferPercent,
				'bufferingComplete': player.media.bufferingComplete,
				'bufferFull': player.media.bufferFull
			});
		}
	}
	
	function startInterval(player) {
		if (player.media.interval === null) {
			player.media.interval = window.setInterval(function() {
				positionHandler({}, player);
			}, 100);
		}
	}
	
	
	function errorHandler(event, player) {
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, {});
	}
	
	function play(player) {
		return function() {
			if (player.media.state != $.fn.jwplayer.states.PLAYING) {
				setState(player, $.fn.jwplayer.states.PLAYING);
				player.model.domelement[0].play();
			}
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			player.model.domelement[0].pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			player.model.domelement[0].currentTime = position;
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			player.model.domelement[0].pause();
			player.model.domelement[0].currentTime = 0;
			clearInterval(player.media.interval);
			player.media.interval = undefined;
			setState(player, $.fn.jwplayer.states.IDLE);
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			player.model.volume = position;
			player.model.domelement[0].volume = position / 100;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME, {
				volume: player.model.domelement[0].volume * 100
			});
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			player.model.mute = state;
			player.model.domelement[0].muted = state;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, {
				mute: player.model.domelement[0].muted
			});
		};
	}
	
	/** Resize the player. **/
	function resize(player) {
		return function(width, height) {
			/*$("#"+player.id+"_jwplayer").css("position", 'fixed');
			$("#"+player.id+"_jwplayer").css("top", '0');
			$("#"+player.id+"_jwplayer").css("left", '0');
			$("#"+player.id+"_jwplayer").css("width", width);
			$("#"+player.id+"_jwplayer").css("height", height);
			player.model.width = $("#"+player.id+"_jwplayer").width;
			player.model.height = $("#"+player.id+"_jwplayer").height;*/
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
				fullscreen: player.model.fullscreen,
				width: width,
				hieght: height
			});
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			player.model.fullscreen = state;
			if (state === true) {
				player.resize("100%", "100%");
			} else {
				player.resize(player.model.config.width, player.model.config.height);				
			}
		};
	}
	
	/** Load a new video into the player. **/
	function load(player) {
		return function(path) {
			path = $.fn.jwplayerUtils.getAbsolutePath(path);
			if (path == player.model.domelement[0].src && player.media.loadcount > 0) {
				setState(player, $.fn.jwplayer.states.BUFFERING);
				setState(player, $.fn.jwplayer.states.PLAYING);
				player.model.domelement[0].currentTime = player.config.start;
				//player.model.domelement[0].paused = false;
				return;
			} else if (path != player.model.domelement[0].src) {
				player.media.loadcount = 0;
			}
			player.media.loadcount++;
			player.media.bufferFull = false;
			player.media.bufferingComplete = false;
			setState(player, $.fn.jwplayer.states.BUFFERING);
			player.model.domelement[0].src = path;
			startInterval(player);
			player.model.domelement[0].currentTime = player.config.start;
		};
	}
	
})(jQuery);
