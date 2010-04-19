/**
 * JW Player Flash Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {

	$.fn.jwplayerMediaFlash = function(options) {
		return this.each(function() {
			var model = $(this).data("model");
			//model.autostart = true;
			model.controlbar = 'none';
			model.icons = false;
			var id = $(this)[0].id;
			$.fn.jwplayerView.embedFlash($(this), model);
			var video = $("#"+id);
			var media = {
				play: play(video),
				pause: pause(video),
				seek: seek(video),
				volume: volume(video),
				mute: mute(video),
				fullscreen: fullscreen(video)
			};
			// THIS DOESN'T WORK - I HATE YOU JQUERY
			$("#"+id).data("media", media);
		});
	};
	
	function setup(player) {
		var media = player.data("media");
		if (media.state === undefined) {
			media.state = "idle";
			player.css("display", "inherit");
			//player.prev("a").css("display", "none");
			//setState(player, "playing");
			addEventListeners(player);
		}
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
			$(player).trigger("jwplayer.state", {
				oldstate: oldState,
				newstate: newState
			});
		}
	}
	
	function addEventListeners(player){
		var events = $.jwplayer().events;
		for (var event in events) {
			player[0].addEventListener(events[event], forward, true);
		}
	}
	
	function forward(event){
		$(event.id).trigger(event.type, event);
	}
	
	function play(player) {
		return function() {
			setup(player);
			try {
				player[0].play();
				return true;
			} catch (err) {
				$.fn.jwplayerUtils.log("error", err);
			}
			return false;
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			setup(player);
			player.pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			setup(player);
			player.seek(position);
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			setup(player);
			player.stop();
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			setup(player);
			player.volume(position);
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			setup(player);
			player.mute(state);
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			setup(player);
			//player.fullscreen = state;
		};
	}
	
})(jQuery);
