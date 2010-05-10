/**
 * JW Player Flash Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {

	var controllerEvents = {
		ERROR: $.fn.jwplayer.events.JWPLAYER_ERROR,
		ITEM: "ITEM",
		MUTE: $.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE,
		PLAY: "PLAY",
		PLAYLIST: "PLAYLIST",
		RESIZE: $.fn.jwplayer.events.JWPLAYER_RESIZE,
		SEEK: "SEEK",
		STOP: "STOP",
		VOLUME: $.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME
	};
	
	var modelEvents = {
		BUFFER: $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER,
		ERROR: $.fn.jwplayer.events.JWPLAYER_MEDIA_ERROR,
		LOADED: $.fn.jwplayer.events.JWPLAYER_MEDIA_LOADED,
		META: $.fn.jwplayer.events.JWPLAYER_MEDIA_META,
		STATE: $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE,
		TIME: $.fn.jwplayer.events.JWPLAYER_MEDIA_TIME
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
	
	
	$.fn.jwplayerMediaFlash = function(player) {
		var options = {};
		var media = {
			play: play(player),
			pause: pause(player),
			seek: seek(player),
			volume: volume(player),
			mute: mute(player),
			fullscreen: fullscreen(player),
			load: load(player),
			resize: resize(player),
			state: $.fn.jwplayer.states.IDLE,
			hasChrome: true
			
		};
		player.media = media;
		$.fn.jwplayerView.embedFlash(player, options);
	};
	
	function stateHandler(event, player) {
		player.model.state = event.newstate;
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, {
			oldstate: event.oldstate,
			newstate: event.newstate
		});
	}
	
	
	function addEventListeners(player) {
		if (player.model.domelement[0].addControllerListener === undefined) {
			setTimeout(function() {
				addEventListeners(player);
			}, 100);
			return;
		}
		$.fn.jwplayerMediaFlash.forwarders[player.id] = {};
		var video = $("#" + player.id);
		for (var controllerEvent in controllerEvents) {
			$.fn.jwplayerMediaFlash.forwarders[player.id][controllerEvents[controllerEvent]] = forwardFactory(controllerEvents[controllerEvent], player);
			video[0].addControllerListener(controllerEvent, "$.fn.jwplayerMediaFlash.forwarders." + player.id + "." + controllerEvents[controllerEvent]);
		}
		for (var modelEvent in modelEvents) {
			$.fn.jwplayerMediaFlash.forwarders[player.id][modelEvents[modelEvent]] = forwardFactory(modelEvents[modelEvent], player);
			video[0].addModelListener(modelEvent, "$.fn.jwplayerMediaFlash.forwarders." + player.id + "." + modelEvents[modelEvent]);
		}
		$.fn.jwplayerMediaFlash.forwarders[player.id][viewEvents.MUTE] = forwardFactory(viewEvents.MUTE, player);
		video[0].addViewListener(viewEvents.MUTE, "$.fn.jwplayerMediaFlash.forwarders." + player.id + "." + viewEvents.MUTE);
		
	}
	
	function forwardFactory(type, player) {
		return function(event) {
			forward(event, type, player);
		};
	}
	
	$.fn.jwplayerMediaFlash.playerReady = function(evt) {
		addEventListeners($.jwplayer(evt.id));
	};
	
	$.fn.jwplayerMediaFlash.forwarders = {};
	
	function forward(event, type, player) {
		switch (type) {
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_META:
				player.sendEvent(type, event);
				break;
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE:
				player.model.mute = event.state;
				event.mute = event.state;
				player.sendEvent(type, event);
				break;
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME:
				player.model.volume = event.percentage;
				event.volume = event.percentage;
				player.sendEvent(type, event);
				break;
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE:
				player.model.fullscreen = event.fullscreen;
				player.model.height = event.height;
				player.model.width = event.width;
				player.sendEvent(type, event);
				break;
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_TIME:
				if (player.model.duration === 0) {
					player.model.duration = event.duration;
				}
				player.model.position = event.position;
				player.sendEvent(type, event);
				break;
			case $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE:
				if (event.newstate == "COMPLETED") {
					player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE, event);
				} else {
					stateHandler(event, player);
				}
				break;
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER:
				event.bufferPercent = event.percentage;
				player.model.buffer = event.percentage;
				player.sendEvent(type, event);
				break;
			default:
				player.sendEvent(type, event);
				break;
		}
	}
	
	function play(player) {
		return function() {
			player.model.domelement[0].sendEvent("PLAY", true);
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			player.model.domelement[0].sendEvent("PLAY", false);
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			player.model.domelement[0].sendEvent("SEEK", position);
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			player.model.domelement[0].sendEvent("STOP");
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			player.model.domelement[0].sendEvent("VOLUME", position);
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			if (((player.model.domelement[0].getConfig().mute === true) && (state === false)) || state) {
				player.model.domelement[0].sendEvent("MUTE", state);
			}
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			player.model.fullscreen = state;
			$.fn.jwplayerUtils.log("Fullscreen does not work for Flash media.");
		};
	}
	
	/** Load a new video into the player. **/
	function load(player) {
		return function(path) {
			path = $.fn.jwplayerUtils.getAbsolutePath(path);
			player.model.domelement[0].sendEvent("LOAD", path);
			player.model.domelement[0].sendEvent("PLAY");
		};
	}
	
	/** Resizes the video **/
	function resize(player) {
		return function(width, height) {
			player.model.width = width;
			player.model.height = height;
			player.css("width", width);
			player.css("height", height);
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
				width: width,
				hieght: height
			});
		};
	}
	
})(jQuery);
