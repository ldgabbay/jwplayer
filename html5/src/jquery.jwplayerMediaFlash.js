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
		//options.autostart = true;
		options.controlbar = 'none';
		options.icons = false;
		$.fn.jwplayerView.embedFlash(player, options);
		var media = {
			play: play(player),
			pause: pause(player),
			seek: seek(player),
			volume: volume(player),
			mute: mute(player),
			fullscreen: fullscreen(player),
			load: load(player),
			resize: resize(player),
			mediaInfo: mediaInfo(player),
			state: $.fn.jwplayer.states.IDLE
		};
		player.media = media;
		addEventListeners(player);
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
		var video = player.model.domelement;
		for (var controllerEvent in controllerEvents) {
			$.fn.jwplayerMediaFlash.forwarders[controllerEvents[controllerEvent]] = forwardFactory(controllerEvents[controllerEvent], player);
			video[0].addControllerListener(controllerEvent, "$.fn.jwplayerMediaFlash.forwarders."+controllerEvents[controllerEvent]);
		}
		for (var modelEvent in modelEvents) {
			$.fn.jwplayerMediaFlash.forwarders[modelEvents[modelEvent]] = forwardFactory(modelEvents[modelEvent], player);
			video[0].addModelListener(modelEvent, "$.fn.jwplayerMediaFlash.forwarders."+modelEvents[modelEvent]);
		}
	}
	
	function forwardFactory(type, player){
		return function(event){
			forward(event, type, player);
		};
	}
	
	$.fn.jwplayerMediaFlash.forwarders = {};
	
	function forward(event, type, player) {
		$.fn.jwplayerUtils.log(type, event);
		switch (type) {
			case $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE:
				if (event.newstate == "COMPLETED") {
					sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE);
				} else {
					stateHandler(event, player);	
				}
				break;
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER:
				event.bufferPercent = event.percentage; 
				player.sendEvent(type, event);
				break;
			default:
				player.sendEvent(type, event);
				break;
		}	
	}
	
	function play(player) {
		return function() {
			try {
				player.model.domelement[0].sendEvent("PLAY", true);
			} catch (err){
				$.fn.jwplayerUtils.log("There was an error", err);
			}
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			player.model.domelement[0].sendEvent("PAUSE");
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
			player.model.domelement[0].sendEvent("MUTE");
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			//player.fullscreen = state;
		};
	}
	/** Load a new video into the player. **/
	function load(player) {
		return function(path) {
			//TODO
		};
	}
	
	/** Resizes the video **/
	function resize(player) {
		return function(width, height) {
			//TODO
		};
	}
	
	
	/** Returns the media info **/
	function mediaInfo(player) {
		return function(){
			return {
				width: player.model.width,
				player: player.model.height,
				state: player.model.state 
			};
		};
	}
	
})(jQuery);