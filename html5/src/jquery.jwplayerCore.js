/**
 * Core component of the JW Player (initialization, API).
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	/** Map with all players on the page. **/
	var players = {};
	
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			$.fn.jwplayerUtils.log("Starting setup", this);
			setupJWPlayer($(this), 0, options);
		});
	};
	
	function setupJWPlayer(player, step, options) {
		try {
			switch (step) {
				case 0:
					var model = $.fn.jwplayerModel(player, options);
					var player = {
						model: model,
						listeners: {}
					};
					setupJWPlayer(player, step + 1);
					break;
				case 1:
					player.controller = $.fn.jwplayerController(player);
					players[player.model.config.id] = player;
					setupJWPlayer($.extend(player, api(player)), step + 1);
					break;
				case 2:
					$.fn.jwplayerView(player);
					setupJWPlayer(player, step + 1);
					break;
				case 3:
					$.fn.jwplayerModel.setActiveMediaProvider(player);
					setupJWPlayer(player, step + 1);
					break;
				case 4:
					$.fn.jwplayerSkinner(player, function() {
						setupJWPlayer(player, step + 1);
					});
					break;
				case 5:
					$.fn.jwplayerDisplay($.jwplayer(player.id), player.model.domelement);
					setupJWPlayer(player, step + 1);
					break;
				case 6:
					$.fn.jwplayerControlbar($.jwplayer(player.id), player.model.domelement);
					setupJWPlayer(player, step + 1);
					break;
				case 7:
					player.sendEvent($.fn.jwplayer.events.JWPLAYER_READY);
					setupJWPlayer(player, step + 1)
					break;
				default:
					if (player.config.autostart === true) {
						player.play();
					}
					if (player.config.repeat) {
						if ((player.config.repeat.toLowerCase() == 'list') || (player.config.repeat.toLowerCase() == 'always') || (player.config.repeat.toLowerCase() == 'single')) {
							player.complete(function() {
								player.play();
							});
						}
					}
					break;
			}
		} catch (err) {
			$.fn.jwplayerUtils.log("Setup failed at step " + step, err);
		}
	}
	
	
	/** Map with config for the controlbar plugin. **/
	$.fn.jwplayer.defaults = {
		autostart: false,
		file: undefined,
		height: 295,
		image: undefined,
		skin: './assets/five/five.xml',
		volume: 90,
		width: 480,
		mute: false,
		bufferlength: 5,
		start: 0,
		position: 0,
		debug: undefined,
		flashplayer: 'http://developer.longtailvideo.com/player/trunk/html5/assets/player.swf'
	};
	
	
	/** A factory for API calls that either set listeners or return data **/
	function dataListenerFactory(player, dataType, eventType) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					if (!$.fn.jwplayerUtils.isNull(eventType)) {
						player.addEventListener(eventType, arg);
					}
					break;
				default:
					if (!$.fn.jwplayerUtils.isNull(dataType)) {
						return player.controller.mediaInfo[dataType];
					}
					return player.controller.mediaInfo;
			}
			return $.jwplayer(player.id);
		};
	}
	
	
	function api(player) {
		if (!$.fn.jwplayerUtils.isNull(player.id)) {
			return player;
		}
		return {
			play: player.controller.play,
			pause: player.controller.pause,
			stop: player.controller.stop,
			seek: player.controller.seek,
			
			resize: player.controller.resize,
			fullscreen: player.controller.fullscreen,
			volume: player.controller.volume,
			mute: player.controller.mute,
			load: player.controller.load,
			
			addEventListener: player.controller.addEventListener,
			removeEventListener: player.controller.removeEventListener,
			sendEvent: player.controller.sendEvent,
			
			ready: dataListenerFactory(player, null, $.fn.jwplayer.events.JWPLAYER_READY),
			error: dataListenerFactory(player, null, $.fn.jwplayer.events.JWPLAYER_ERROR),
			complete: dataListenerFactory(player, null, $.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE),
			state: dataListenerFactory(player, 'state', $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE),
			buffer: dataListenerFactory(player, 'buffer', $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER),
			time: dataListenerFactory(player, 'position', $.fn.jwplayer.events.JWPLAYER_MEDIA_TIME),
			duration: dataListenerFactory(player, 'duration'),
			width: dataListenerFactory(player, 'width'),
			height: dataListenerFactory(player, 'height'),
			meta: dataListenerFactory(player, null, $.fn.jwplayer.events.JWPLAYER_MEDIA_META),
			
			id: player.model.config.id,
			config: player.model.config,
			version: '0.1-alpha',
			skin: player.skin
		};
	}
	
	function jwplayer(selector) {
		if ($.fn.jwplayerUtils.isNull(selector)) {
			for (var player in players) {
				return api(players[player]);
			}
		} else {
			return api(players[selector]);
		}
		return null;
	}
	
	$.fn.jwplayer.states = {
		IDLE: 'IDLE',
		BUFFERING: 'BUFFERING',
		PLAYING: 'PLAYING',
		PAUSED: 'PAUSED'
	};
	
	$.fn.jwplayer.events = {
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
		JWPLAYER_RESIZE: 'jwplayerResize',
		//JWPLAYER_LOCKED: 'jwplayerLocked',
		//JWPLAYER_UNLOCKED: 'jwplayerLocked',
		JWPLAYER_ERROR: 'jwplayerError',
		JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
		JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
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
	
	/** Automatically initializes the player for all <video> tags with the JWPlayer class. **/
	$(document).ready(function() {
		$("video.jwplayer").jwplayer();
	});
	
})(jQuery);
