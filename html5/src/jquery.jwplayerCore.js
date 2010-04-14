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
		return {
			play: play(selector),
			pause: pause(selector),
			seek: seek(selector),
			stop: stop(selector),
			volume: volume(selector),
			mute: mute(selector),
			fullscreen: fullscreen(selector)
		};
	}
	
	/** Extending jQuery **/
	$.extend({
		jwplayer: jwplayer
	});
	
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			$(this).css("display", "none");
			$(this).jwplayerModel(options);
			$(this).jwplayerView();
			$.fn.jwplayerModel.setActiveMediaProvider($(this));
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
	
	function factory(selector, fn) {
		return function() {
			try {
				fn();
				return jwplayer(selector);
			} catch (err) {
			
			}
			return false;
		};
	}
	
	
	/** Start playback or resume. **/
	function play(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.play', arg);
					break;
				default:
					$.fn.jwplayerController.play(player);
					break;
			}
		});
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.pause', arg);
					break;
				default:
					$.fn.jwplayerController.pause(player);
					break;
			}
		});
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.seek', arg);
					break;
				default:
					$.fn.jwplayerController.seek(player, arg);
					break;
			}
		});
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.stop', arg);
					break;
				default:
					$.fn.jwplayerController.stop(player);
					break;
			}
		});
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.volume', arg);
					break;
				case "number":
					$.fn.jwplayerController.setVolume(player, arg);
					break;
				default:
					$.fn.jwplayerController.getVolume(player);
					break;
			}
		});
	}
	
	/** Switch the mute state of the player. **/
	function mute(player, state) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.mute', arg);
					break;
				case "boolean":
					$.fn.jwplayerController.setMute(player, arg);
					break;
				default:
					$.fn.jwplayerController.getMute(player);
					break;
			}
		});
	}
	
	/** Jumping the player to/from fullscreen. **/
	function fullscreen(player, state) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.fullscreen', arg);
					break;
				case "boolean":
					$.fn.jwplayerController.setFullscreen(player, arg);
					break;
				default:
					$.fn.jwplayerController.getFullscreen(player);
					break;
			}
		});
	}
	
	/** Jumping the player to/from fullscreen. **/
	function state(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.state', arg);
					break;
			}
		});
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
