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
			interval: null
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
		if (player.model.duration === 0){
			player.model.duration = event.target.duration;
		}
		player.model.sources[player.model.source] = $.extend(player.model.sources[player.model.source], meta);
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_META, meta);
	}
	
	function positionHandler(event, player) {
		if (player.media.interval === null) {
			player.media.interval = window.setInterval(function() {
				positionHandler(event, player);
			}, 100);
		}
		if (player.model.duration  === 0){
			player.model.duration = event.target.duration;
		}
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, {
			position: event.target.currentTime,
			duration: event.target.duration
		});
	}
	
	function progressHandler(event, player) {
		var buffer;
		if (!isNaN(event.loaded / event.total)) {
			buffer = event.loaded / event.total * 100;
		} else if (player.model.domelement[0].buffered !== undefined) {
			buffer = player.model.domelement[0].buffered.end(0) / player.model.domelement[0].duration * 100;
		}
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, {
			'bufferPercent': buffer
		});
	}
	
	function errorHandler(event, player) {
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, {});
	}
	
	function play(player) {
		return function() {
			player.model.domelement[0].play();
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
			player.media.interval = null;
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
			player.model.width = width;
			player.model.height = height;
			player.css("width", width);
			player.css("height", height);
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
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
				player.css("width", window.width);
				player.css("height", window.height);
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
					width: width,
					hieght: height
				});
			} else {
				// TODO: exit fullscreen
			}
		};
	}
	
	/** Load a new video into the player. **/
	function load(player) {
		return function(path) {
			player.model.domelement[0].src = path;
		};
	}
})(jQuery);