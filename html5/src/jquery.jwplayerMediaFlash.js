/**
 * JW Player Flash Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {

	var controllerEvents = {
		ERROR: "ERROR",
		ITEM: "ITEM",
		MUTE: "MUTE",
		PLAY: "PLAY",
		PLAYLIST: "PLAYLIST",
		RESIZE: "RESIZE",
		SEEK: "SEEK",
		STOP: "STOP",
		VOLUME: "VOLUME"
	};
	
	var modelEvents = {
		BUFFER: "BUFFER",
		ERROR: "ERROR",
		LOADED: "LOADED",
		META: "META",
		STATE: stateHandler,
		TIME: "TIME"
	};
	
	var viewEvents = {
		FULLSCREEN: "FULLSCREEN",
		ITEM: "ITEM",
		LINK: "LINK",
		LOAD: "LOAD",
		MUTE: "MUTE",
		NEXT: "NEXT",
		PLAY: "PLAY",
		PREV: "PREV",
		REDRAW: "REDRAW",
		SEEK: "SEEK",
		STOP: "STOP",
		TRACE: "TRACE",
		VOLUME: "VOLUME"
	};
	
	$.fn.jwplayerMediaFlash = function(options) {
		return this.each(function() {
			var model = $(this).data("model");
			//model.autostart = true;
			model.controlbar = 'none';
			model.icons = false;
			$.fn.jwplayerView.embedFlash($(this), model);
			var media = {
				play: play($(this)),
				pause: pause($(this)),
				seek: seek($(this)),
				volume: volume($(this)),
				mute: mute($(this)),
				fullscreen: fullscreen($(this)),
				state: "idle"
			};
			$(this).data("media", media);
			addEventListeners($(this));
		});
	};
	
	function stateHandler(event) {
		$(event.id).data("media").state = event.newState;
		sendEvent($(event.id), $.jwplayer().events.JWPLAYER_PLAYER_STATE, {
			oldstate: event.oldstate,
			newstate: event.newState
		});
	}
	
	function addEventListeners(player) {
		var event;
		if ($("#" + player[0].id)[0].addControllerListener === undefined) {
			setTimeout(function() {
				addEventListeners(player);
			}, 100);
			return;
		}
		for (event in controllerEvents) {
			$("#" + player[0].id)[0].addControllerListener(event, "$.fn.jwplayerMediaFlash.forward");
		}
		for (event in modelEvents) {
			$("#" + player[0].id)[0].addModelListener(event, "$.fn.jwplayerMediaFlash.forward");
		}
	}
	
	$.fn.jwplayerMediaFlash.forward = function(event) {
		$(event.id).trigger(event.type, event);
	};
	
	function play(player) {
		return function() {
			$("#" + player[0].id)[0].sendEvent("PLAY");
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			$("#" + player[0].id)[0].sendEvent("PAUSE");
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			$("#" + player[0].id)[0].sendEvent("SEEK", position);
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			$("#" + player[0].id)[0].sendEvent("STOP");
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			$("#" + player[0].id)[0].sendEvent("VOLUME", position);
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			$("#" + player[0].id)[0].sendEvent("MUTE");
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			//player.fullscreen = state;
		};
	}
	
})(jQuery);
