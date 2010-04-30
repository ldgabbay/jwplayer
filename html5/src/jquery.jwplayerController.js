/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var mediaParams = function() {
		return {
			volume: 100,
			fullscreen: false,
			mute: false,
			width: 480,
			height: 320,
			duration: 0,
			source: 0,
			sources: [],
			buffer: 0,
			state: $.fn.jwplayer.states.IDLE
		};
	};
	
	$.fn.jwplayerController = function(player) {
		return {
			play: play(player),
			pause: pause(player),
			seek: seek(player),
			stop: pause(player),
			volume: volume(player),
			mute: mute(player),
			resize: resize(player),
			fullscreen: fullscreen(player),
			load: load(player),
			mediaInfo: mediaInfo(player),
			addEventListener: addEventListener(player),
			removeEventListener: removeEventListener(player),
			sendEvent: sendEvent(player)
		};
	};
	
	
	function play(player) {
		return function() {
			try {
				switch (player.model.state) {
					case $.fn.jwplayer.states.IDLE:
						player.addEventListener($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER_FULL, player.media.play);
						player.media.load(player.model.sources[player.model.source].file);
						break;
					case $.fn.jwplayer.states.PAUSED:
						player.media.play();
						break;
				}
				
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			try {
				switch (player.model.state) {
					case $.fn.jwplayer.states.PLAYING:
					case $.fn.jwplayer.states.BUFFERING:
						player.media.pause();
						break;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			try {
				switch (player.model.state) {
					case $.fn.jwplayer.states.PLAYING:
					case $.fn.jwplayer.states.PAUSED:
					case $.fn.jwplayer.states.BUFFERING:
						player.media.seek(position);
						break;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			try {
				player.media.stop();
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Get / set the video's volume level. **/
	function volume(player) {
		return function(arg) {
			try {
				switch ($.fn.jwplayerUtils.typeOf(arg)) {
					case "function":
						player.addEventListener($.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME, arg);
						break;
					case "number":
						player.media.volume(arg);
						return true;
					case "string":
						player.media.volume(parseInt(arg, 10));
						return true;
					default:
						return player.model.volume;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Get / set the mute state of the player. **/
	function mute(player) {
		return function(arg) {
			try {
				switch ($.fn.jwplayerUtils.typeOf(arg)) {
					case "function":
						player.addEventListener($.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, arg);
						break;
					case "boolean":
						player.media.mute(arg);
						break;
					default:
						return player.model.mute;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Resizes the video **/
	function resize(player) {
		return function(arg1, arg2) {
			try {
				switch ($.fn.jwplayerUtils.typeOf(arg1)) {
					case "function":
						player.addEventListener($.fn.jwplayer.events.JWPLAYER_RESIZE, arg1);
						break;
					case "number":
						player.media.resize(arg1, arg2);
						break;
					case "string":
						player.media.resize(arg1, arg2);
						break;
					default:
						break;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Jumping the player to/from fullscreen. **/
	function fullscreen(player) {
		return function(arg) {
			try {
				switch ($.fn.jwplayerUtils.typeOf(arg)) {
					case "function":
						player.addEventListener($.fn.jwplayer.events.JWPLAYER_FULLSCREEN, arg);
						break;
					case "boolean":
						player.media.fullscreen(arg);
						break;
					default:
						return player.model.fullscreen;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Loads a new video **/
	function load(player) {
		return function(arg) {
			try {
				switch ($.fn.jwplayerUtils.typeOf(arg)) {
					case "function":
						player.addEventListener($.fn.jwplayer.events.JWPLAYER_MEDIA_LOADED, arg);
						break;
					default:
						player.media.load(arg);
						break;
				}
				return $.jwplayer(player.id);
			} catch (err) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Returns the meta **/
	function mediaInfo(player) {
		try {
			var result = {};
			for (var mediaParam in mediaParams()) {
				result[mediaParam] = player.model[mediaParam];
			}
			return result;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	}
	
	
	/** Add an event listener. **/
	function addEventListener(player) {
		return function(type, listener, count) {
			try {
				if (player.listeners[type] === undefined) {
					player.listeners[type] = [];
				}
				player.listeners[type].push({
					listener: listener,
					count: count
				});
			} catch (err) {
				$.fn.jwplayerUtils.log("error", err);
			}
			return false;
		};
	}
	
	
	/** Remove an event listener. **/
	function removeEventListener(player) {
		return function(type, listener) {
			try {
				for (var lisenterIndex in player.listeners[type]) {
					if (player.listeners[type][lisenterIndex] == listener) {
						player.listeners[type].slice(lisenterIndex, lisenterIndex + 1);
						break;
					}
				}
			} catch (err) {
				$.fn.jwplayerUtils.log("error", err);
			}
			return false;
		};
	}
	
	/** Send an event **/
	function sendEvent(player) {
		return function(type, data) {
			data = $.extend({
				id: player.id,
				version: player.version
			}, data);
			if (player.config.debug == 'CONSOLE') {
				$.fn.jwplayerUtils.log(type, data);
			}
			for (var listenerIndex in player.listeners[type]) {
				try {
					player.listeners[type][listenerIndex].listener(data);
				} catch (err) {
					$.fn.jwplayerUtils.log("There was an error while handling a listener", err);
				}
				if (player.listeners[type][listenerIndex].count === 1) {
					delete player.listeners[type][listenerIndex];
				} else if (player.listeners[type][listenerIndex].count > 0) {
					player.listeners[type][listenerIndex].count = player.listeners[type][listenerIndex].count - 1;
				}
			}
		};
	}
	
})(jQuery);
