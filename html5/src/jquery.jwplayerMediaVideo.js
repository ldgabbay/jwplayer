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
			mediaInfo: mediaInfo(player),
			state: $.fn.jwplayer.states.IDLE,
			interval: null
		};
		player.media = media;
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
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
		}
		if (newstate == $.fn.jwplayer.states.IDLE) {
			clearInterval(player.media.interval);
			player.media.interval = null;
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE);
		}
	}
	
	function metaHandler(event, player) {
		var meta = {
			height: event.target.videoHeight,
			width: event.target.videoWidth,
			duration: event.target.duration
		};
		player.model = $.extend(player.model, meta);
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_META, meta);
	}
	
	function positionHandler(event, player) {
		if (player.media.interval === null) {
			player.media.interval = window.setInterval(function() {
				positionHandler(event, player);
			}, 100);
		}
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, {
			position: event.target.currentTime,
			duration: event.target.duration
		});
	}
	
	function progressHandler(event, player) {
		var buffer;
		if (!isNaN(event.loaded / event.total)) {
			buffer = event.loaded / event.total * 100;
		} else if (player.model.domelement.buffered !== undefined) {
			buffer = player.model.domelement.buffered.end(0) / player.model.domelement.duration * 100;
		}
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, {
			'bufferPercent': buffer
		});
	}
	
	function errorHandler(event, player) {
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_ERROR, {});
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
			player.model.volume = position / 100;
			player.model.domelement[0].volume = position / 100;
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME, {
				volume: player.model.domelement[0].volume * 100
			});
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			player.model.mute = state;
			player.model.domelement[0].muted = state;
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, {
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
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
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
				sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
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
			//TODO
		};
	}
	
	/** Returns the media info **/
	function mediaInfo(player) {
		return function(){
			return {
				width: player.model.width,
				player: player.model.height,
				state: player.model.state 
			};
		};
	}
	
	function sendEvent(player, type, data) {
		player.sendEvent(type, $.extend({
			id: player.model.config.id,
			version: player.version
		}, data));
	}
	
})(jQuery);

