/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	$.fn.jwplayerController = function() {
		return this.each(function() {
		});
	};
	
	
	$.fn.jwplayerController.play = function(player) {
		try {
			player.css("display", "inherit");
			$.fn.log("mediaprovider",player);
			player.data("media").play();
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayerController.pause = function(player) {
		try {
			player.data("media").pause();
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayerController.seek = function(player, position) {
		try {
			player.data("media").seek(position);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayerController.stop = function(player) {
		try {
			player.data("media").stop();
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	
	/** Change the video's volume level. **/
	$.fn.jwplayerController.volume = function(player, position) {
		try {
			player.data("media").volume(position);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	/** Switch the mute state of the player. **/
	$.fn.jwplayerController.mute = function(player, state) {
		try {
			player.data("media").mute(state);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	/** Jumping the player to/from fullscreen. **/
	$.fn.jwplayerController.fullscreen = function(player, state) {
		try {
			player.data("media").fullscreen(state);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
})(jQuery);
