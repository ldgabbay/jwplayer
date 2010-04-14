/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {

	var state = 'idle';
	
	var states = {
		"buffering": "buffering",
		"ended" : "idle",
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
		'play': stateHandler,
		'playing': stateHandler,
		'progress': positionHandler,
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
	
	
	$.fn.jwplayerMediaVideo = function(options) {
		return this.each(function() {
			var video = $(this);
			//$.fn.log(this);
			var media = {
				play: $.fn.jwplayerMediaVideo.play(video),
				pause: $.fn.jwplayerMediaVideo.pause(video),
				seek: $.fn.jwplayerMediaVideo.seek(video),
				volume: $.fn.jwplayerMediaVideo.volume(video),
				mute: $.fn.jwplayerMediaVideo.mute(video),
				fullscreen: $.fn.jwplayerMediaVideo.fullscreen(video)
			};
			video.data("media", media);
			$.each(events, function(event, handler) {
				video[0].addEventListener(event, handler,true);
			});
		});
	};
	
	function generalHandler(event) {
		$.fn.log("general:" + event.type);
	}
	
	function stateHandler(event) {
		/*$.fn.log("state", {
			event: event.type,
			state: state
		});*/
		if(states[event.type]) {
			setState(event.target, states[event.type]);
		}
	}
	
	function setState(player, newState) {
		if (state != newState) {
			var oldState = state;
			state = newState;
			$(player).trigger("jwplayer.state", {
				oldstate: oldState,
				newstate: newState
			});
		}
	}
	
	function metaHandler(event) {
		$.fn.log("meta:" + event.type);
	}
	
	function positionHandler(event) {
		$(event.target).trigger("jwplayer.time", {
			position: event.target.currentTime,
			duration: event.target.duraiton
		});
	}
	
	function errorHandler(event) {
		$.fn.log("error:" + event.type);
	}
	
	$.fn.jwplayerMediaVideo.play = function(player) {
		return function() {
			try {
				player.css("display", "inherit");
				player[0].play();
				model.state = 'playing';
				return true;
			} catch (err) {
			
			}
			return false;
		};
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayerMediaVideo.pause = function(player) {
		return function() {
			player.pause();
		};
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayerMediaVideo.seek = function(player) {
		return function(position) {
			player.currentTime = position;
		};
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayerMediaVideo.stop = function(player) {
		return function() {
			player.pause();
			player.currentTime = player.startTime;
		};
	};
	
	
	/** Change the video's volume level. **/
	$.fn.jwplayerMediaVideo.volume = function(player) {
		return function(position) {
			video.volume = position / 100;
		};
	};
	
	/** Switch the mute state of the player. **/
	$.fn.jwplayerMediaVideo.mute = function(player) {
		return function(state) {
			player.mute = state;
		};
	};
	
	/** Switch the fullscreen state of the player. **/
	$.fn.jwplayerMediaVideo.fullscreen = function(player) {
		return function(state) {
			//player.fullscreen = state;
		};
	};
	
	
})(jQuery);
