/**
 * Core component of the JW Player (initialization, API).
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	function jwplayer(selector) {
		if (selector === undefined) {
			selector = ".jwplayer:first";
		}
		if ($.fn.jwplayerUtils.typeOf(selector) == "string") {
			selector = $(selector);
		}
		return {
			play: play(selector),
			pause: pause(selector),
			seek: seek(selector),
			stop: stop(selector),
			volume: volume(selector),
			mute: mute(selector),
			fullscreen: fullscreen(selector),
			state: state(selector),
			buffer: buffer(selector),
			duration: duration(selector),
			width: width(selector),
			height: buffer(selector),
			load: load(selector),
			resize: resize(selector),
			meta: meta(selector),
			time: time(selector),
			complete: complete(selector),
			events: events
		};
	}
	
	var events = {
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_RESIZE: 'jwplayerResize',
		//JWPLAYER_LOCKED: 'jwplayerLocked',
		//JWPLAYER_UNLOCKED: 'jwplayerLocked',
		JWPLAYER_ERROR: 'jwplayerError',
		JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
		//JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
		JWPLAYER_MEDIA_ERROR: 'jwplayerMediaError',
		JWPLAYER_MEDIA_LOADED: 'jwplayerMediaLoaded',
		JWPLAYER_MEDIA_COMPLETE: 'jwplayerMediaComplete',
		JWPLAYER_MEDIA_TIME: 'jwplayerMediaTime',
		JWPLAYER_MEDIA_VOLUME: 'jwplayerMediaVolume',
		JWPLAYER_MEDIA_META: 'jwplayerMediaMeta',
		JWPLAYER_MEDIA_MUTE: 'jwplayerMediaMute',
		JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState'
	};
	
	/** Extending jQuery **/
	$.extend({
		'jwplayer': jwplayer
	});
	
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			var id = $(this)[0].id;
			//$(this).css("display", "none");
			$(this).jwplayerModel(options);
			$(this).jwplayerView();
			$.fn.jwplayerModel.setActiveMediaProvider($(this));
			$(this).jwplayerControlbar();
			$(this).trigger("JWPLAYER_READY", {
				id: id
			});
		});
	};
	
	
	/** Map with all players on the page. **/
	$.fn.jwplayer.players = {};
	
	
	/** Map with config for the controlbar plugin. **/
	$.fn.jwplayer.defaults = {
		autostart: false,
		duration: 0,
		file: undefined,
		height: 300,
		image: undefined,
		skin: 'assets/five/five.xml',
		volume: 100,
		width: 400,
		source: 0,
		flashplayer: 'assets/player.swf'
	};
	
	
	/** Start playback or resume. **/
	function play(player) {
		return function() {
			$.fn.jwplayerController.play(player);
			return jwplayer(player);
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			$.fn.jwplayerController.pause(player);
			return jwplayer(player);
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(arg) {
			$.fn.jwplayerController.seek(player, arg);
			return jwplayer(player);
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			$.fn.jwplayerController.stop(player);
			return jwplayer(player);
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_VOLUME, arg);
					break;
				case "number":
					$.fn.jwplayerController.volume(player, arg);
					break;
				case "string":
					$.fn.jwplayerController.volume(player, parseInt(arg,10));
					break;
				default:
					return $.fn.jwplayerController.volume(player);
			}
			return jwplayer(player);
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player, state) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_MUTE, arg);
					break;
				case "boolean":
					$.fn.jwplayerController.mute(player, arg);
					break;
				default:
					$.fn.jwplayerController.mute(player);
					break;
			}
			return jwplayer(player);
		};
	}
	
	/** Resizing the player **/
	function resize(player, state) {
		return function(arg1, arg2) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_RESIZE, arg);
					break;
				case "number":
					$.fn.jwplayerController.resize(player, arg1, arg2);
					break;
				default:
					break;
			}
			return jwplayer(player);
		};
	}
	
	/** Fullscreen the player **/
	function fullscreen(player, state) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_FULLSCREEN, arg);
					break;
				case "boolean":
					$.fn.jwplayerController.fullscreen(player, arg);
					break;
				default:
					return $.fn.jwplayerController.fullscreen(player);
			}
			return jwplayer(player);
		};
	}
	
	/** Adds a state listener **/
	function state(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_PLAYER_STATE, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player).state;
			}
			return jwplayer(player);
		};
	}
	
	/** Adds a buffer listener **/
	function buffer(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_BUFFER, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player).buffer;
			}
			return jwplayer(player);
		};
	}
	
	/** Returns the current time **/
	function time(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_TIME, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player).time;
			}
			return jwplayer(player);
		};
	}
	
	/** Loads a new video into the player **/
	function load(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_LOADED, arg);
					break;
				default:
					$.fn.jwplayerController.load(player, arg);
			}
			return jwplayer(player);
		};
	}
	
	/** Adds a listener for video completion **/
	function complete(player) {
		return function(arg) {
			addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_COMPLETE, arg);
			return jwplayer(player);
		};
	}
	
	/** Returns the duration **/
	function duration(player) {
		return function() {
			return $.fn.jwplayerController.mediaInfo(player).duration;
		};
	}
	
	
	/** Returns the width **/
	function width(player) {
		return function() {
			return $.fn.jwplayerController.mediaInfo(player).width;
		};
	}
	
	
	/** Returns the height **/
	function height(player) {
		return function() {
			return $.fn.jwplayerController.mediaInfo(player).height;
		};
	}
	
	/** Returns the available meta-data **/
	function meta(player) {
		return function() {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_META, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player);
			}
			return jwplayer(player);
		};
	}
	
	
	/** Add an event listener. **/
	function addEventListener(player, event, listener) {
		$(player).bind(event, listener);
	}
	
	
	/** Remove an event listener. **/
	function removeEventListener(player, event, listener) {
		$(player).unbind(event, listener);
	}
	
	/** Automatically initializes the player for all <video> tags with the JWPlayer class. **/
	$(document).ready(function() {
		$("video.jwplayer").jwplayer();
	});
	
})(jQuery);
