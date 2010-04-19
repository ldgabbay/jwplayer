/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {
	var states = {
		"buffering": "buffering",
		"ended": "idle",
		"playing": "playing",
		"pause": "paused"
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
		'timeupdate': generalHandler,
		'volumechange': generalHandler,
		'waiting': stateHandler,
		'canshowcurrentframe': generalHandler,
		'dataunavailable': generalHandler,
		'empty': generalHandler,
		'load': generalHandler,
		'loadedfirstframe': generalHandler
	};
	
	
	$.fn.jwplayerMediaVideo = function(options) {
		return this.each(function() {
			var video = $(this);
			var media = {
				play: play(video),
				pause: pause(video),
				seek: seek(video),
				stop: stop(video),
				volume: volume(video),
				mute: mute(video),
				fullscreen: fullscreen(video),
				load: load(video),
				state: "idle",
				interval: null
			};
			video.data("media", media);
			$.each(events, function(event, handler) {
				video[0].addEventListener(event, handler, true);
			});
		});
	};
	
	function generalHandler(event) {
		//$.fn.jwplayerUtils.log("general:" + event.type);
	}
	
	function stateHandler(event) {
		if (states[event.type]) {
			setState(event.target, states[event.type]);
		}
	}
	
	function setState(player, newState) {
		if ($(player).data("media").state != newState) {
			var oldState = $(player).data("media").state;
			$(player).data("media").state = newState;
			sendEvent($(player), $.jwplayer().events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldState,
				newstate: newState
			});
		}
		if (newState == 'idle') {
			clearInterval($(player).data("media").interval);
			$(player).data("media").interval = null;
		}
	}
	
	function metaHandler(event) {
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_MEDIA_META, {
			videoHeight: event.target.videoHeight,
			videoWidth: event.target.videoWidth,
			duration: event.target.duration
		});
	}
	
	function positionHandler(event) {
		if ($(event.target).data("media").interval === null) {
			$(event.target).data("media").interval = window.setInterval(function() {
				positionHandler(event);
			}, 100);
		}
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_MEDIA_TIME, {
			position: event.target.currentTime
		});
	}
	
	function progressHandler(event) {
		var buffer;
		if (!isNaN(event.loaded / event.total)) {
			buffer = event.loaded / event.total * 100;
		} else if (event.target.buffered !== undefined) {
			buffer = event.target.buffered.end(0) / event.target.duration * 100;
		}
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_MEDIA_BUFFER, {
			'buffer': buffer
		});
	}
	
	function errorHandler(event) {
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_ERROR, {});
	}
	
	function play(player) {
		return function() {
			player[0].play();
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			player[0].pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			player[0].currentTime = position;
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			player[0].pause();
			player[0].currentTime = 0;
			clearInterval($(player).data("media").interval);
			$(player).data("media").interval = null;
			setState(player, 'idle');
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			player[0].volume = position / 100;
			sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_VOLUME, {
				volume: player[0].volume
			});
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			player[0].muted = state;
			sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_MUTE, {
				mute: player[0].muted
			});
		};
	}
	
	/** Resize the player. **/
	function resize(player) {
		return function(width, height) {
			player.css("width", width);
			player.css("height", height);
			sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_RESIZE, {
				width: width,
				hieght: height
			});
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			if (state === true) {
				player.css("width", window.width);
				player.css("height", window.height);
				sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_RESIZE, {
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
	
	function sendEvent(player, type, data) {
		player.trigger(type, $.extend({
			id: player[0].id,
			version: $.jwplayer(player).version
		}, data));
	}
	
})(jQuery);

