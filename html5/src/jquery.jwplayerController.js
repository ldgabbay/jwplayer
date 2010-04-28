/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var mediaParams ={
		volume: 100,
		fullscreen: false,
		mute: false,
		width: 480,
		height: 320,
		duration: 0,
		source: 0,
		buffer: 0,
		state: 'IDLE'
	};

	$.fn.jwplayerController = function() {
		return this.each(function() {
		});
	};
	
	
	$.fn.jwplayerController.play = function(player) {
			player.media.play();
		try {
			player.media.play();
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayerController.pause = function(player) {
		try {
			player.media.pause();
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayerController.seek = function(player, position) {
		try {
			player.media.seek(position);
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
			
		}
		return false;
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayerController.stop = function(player) {
		try {
			player.media.stop();
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
			
		}
		return false;
	};
	
	
	/** Get / set the video's volume level. **/
	$.fn.jwplayerController.volume = function(player, position) {
		try {
			if (position === undefined) {
				return player.model.volume;
			} else {
				player.media.volume(position);
				player.model.volume = position;
				return true;
			}
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Get / set the mute state of the player. **/
	$.fn.jwplayerController.mute = function(player, state) {
		try {
			if (state === undefined) {
				return player.model.mute;
			} else {
				player.media.mute(state);
				return true;
			}
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	
	/** Jumping the player to/from fullscreen. **/
	$.fn.jwplayerController.fullscreen = function(player, state) {
		try {
			if (state === undefined) {
				return player.model.fullscreen;
			} else {
				player.media.fullscreen(state);
				return true;
			}
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Resizes the video **/
	$.fn.jwplayerController.resize = function(player, width, height) {
		try {
			player.media.resize(width, height);
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Returns the meta **/
	$.fn.jwplayerController.mediaInfo = function(player) {
		try {
			var result = {};
			for (var mediaParam in mediaParams){
				result[mediaParam] = player.model[mediaParam];
			}
			return result;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Loads a new video **/
	$.fn.jwplayerController.load = function(player, path) {
		try {
			player.media.load(path);
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
})(jQuery);
