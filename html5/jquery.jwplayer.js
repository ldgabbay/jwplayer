/**
 * jwplayerControlbar component of the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	var controlbars = {};
	
	/** Hooking the jwplayerControlbar up to jQuery. **/
	$.fn.jwplayerControlbar = function(player, domelement) {
		controlbars[player.id] = $.extend({}, $.fn.jwplayerControlbar.defaults, player.config.plugins.controlbar);
		buildElements(player, domelement);
		buildHandlers(player);
	};
	
	$.fn.jwplayerControlbar.positions = {
		BOTTOM: 'BOTTOM',
		TOP: 'TOP',
		OVER: 'OVER'
	};
	
	
	/** Map with config for the jwplayerControlbar plugin. **/
	$.fn.jwplayerControlbar.defaults = {
		fontsize: 10,
		fontcolor: '000000',
		position: $.fn.jwplayerControlbar.positions.BOTTOM,
		leftmargin: 0,
		rightmargin: 0,
		scrubber: 'none'
	};
	
	/** Draw the jwplayerControlbar elements. **/
	function buildElements(player, domelement) {
		// Draw the background.
		domelement.parents(":first").append('<div id="' + player.id + '_jwplayerControlbar"></div>');
		$("#" + player.id + '_jwplayerControlbar').css('position', 'absolute');
		$("#" + player.id + '_jwplayerControlbar').css('height', player.skin.controlbar.elements.background.height);
		switch (controlbars[player.id].position) {
			case $.fn.jwplayerControlbar.positions.TOP:
				$("#" + player.id + '_jwplayerControlbar').css('top', 0);
				break;
			default:
				$("#" + player.id + '_jwplayerControlbar').css('top', player.height());
				domelement.parents(":first").css('height', parseInt(domelement.parents(":first").css('height').replace('px', '')) + player.skin.controlbar.elements.background.height);
				break;
		}
		$("#" + player.id + '_jwplayerControlbar').css('background', 'url(' + player.skin.controlbar.elements.background.src + ') repeat-x center left');
		// Draw all elements on top of the bar.
		buildElement('capLeft', 'left', true, player);
		buildElement('playButton', 'left', false, player);
		buildElement('pauseButton', 'left', true, player);
		buildElement('divider1', 'left', true, player);
		buildElement('elapsedText', 'left', true, player);
		buildElement('timeSliderRail', 'left', false, player);
		buildElement('timeSliderBuffer', 'left', false, player);
		buildElement('timeSliderProgress', 'left', false, player);
		buildElement('timeSliderThumb', 'left', false, player);
		buildElement('capRight', 'right', true, player);
		buildElement('fullscreenButton', 'right', false, player);
		buildElement('normalscreenButton', 'right', true, player);
		buildElement('divider2', 'right', true, player);
		buildElement('volumeSliderRail', 'right', false, player);
		buildElement('volumeSliderProgress', 'right', true, player);
		buildElement('muteButton', 'right', false, player);
		buildElement('unmuteButton', 'right', true, player);
		buildElement('divider3', 'right', true, player);
		buildElement('durationText', 'right', true, player);
	}
	
	
	/** Draw a single element into the jwplayerControlbar. **/
	function buildElement(element, align, offset, player) {
		var nam = player.id + '_' + element;
		$('#' + player.id + '_jwplayerControlbar').append('<div id="' + nam + '"></div>');
		$('#' + nam).css('position', 'absolute');
		$('#' + nam).css('top', '0px');
		if (element.indexOf('Text') > 0) {
			$('#' + nam).html('00:00');
			$('#' + nam).css('font', controlbars[player.id].fontsize + 'px/' + (player.skin.controlbar.elements.background.height + 1) + 'px Arial,sans-serif');
			$('#' + nam).css('text-align', 'center');
			$('#' + nam).css('font-weight', 'bold');
			$('#' + nam).css('cursor', 'default');
			var wid = 14 + 3 * controlbars[player.id].fontsize;
			$('#' + nam).css('color', '#' + controlbars[player.id].fontcolor.substr(-6));
		} else if (element.indexOf('divider') === 0) {
			$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements.divider.src + ') repeat-x center left');
			var wid = player.skin.controlbar.elements.divider.width;
		} else {
			$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements[element].src + ') repeat-x center left');
			var wid = player.skin.controlbar.elements[element].width;
		}
		if (align == 'left') {
			$('#' + nam).css(align, controlbars[player.id].leftmargin);
			if (offset) {
				controlbars[player.id].leftmargin += wid;
			}
		} else if (align == 'right') {
			$('#' + nam).css(align, controlbars[player.id].rightmargin);
			if (offset) {
				controlbars[player.id].rightmargin += wid;
			}
		}
		$('#' + nam).css('width', wid);
		$('#' + nam).css('height', player.skin.controlbar.elements.background.height);
	}
	
	
	/** Add interactivity to the jwplayerControlbar elements. **/
	function buildHandlers(player) {
		// Register events with the buttons.
		buildHandler('playButton', 'play', player);
		buildHandler('pauseButton', 'pause', player);
		buildHandler('muteButton', 'mute', player, true);
		buildHandler('unmuteButton', 'mute', player, false);
		buildHandler('fullscreenButton', 'fullscreen', player, true);
		buildHandler('normalscreenButton', 'fullscreen', player, false);
		
		addSliders(player);
		
		// Register events with the player.
		player.buffer(bufferHandler);
		player.state(stateHandler);
		player.time(timeHandler);
		player.mute(muteHandler);
		player.volume(volumeHandler);
		player.complete(completeHandler);
		
		// Trigger a few events so the bar looks good on startup.
		resizeHandler({
			id: player.id,
			fulscreen: player.fullscreen(),
			width: player.width(),
			height: player.height()
		});
		timeHandler({
			id: player.id,
			time: 0,
			duration: 0
		});
		bufferHandler({
			id: player.id,
			bufferProgress: 0
		});
		muteHandler({
			id: player.id,
			mute: player.mute()
		});
		stateHandler({
			id: player.id,
			newstate: $.fn.jwplayer.states.IDLE
		});
		volumeHandler({
			id: player.id,
			volume: player.volume()
		});
	}
	
	
	/** Set a single button handler. **/
	function buildHandler(element, handler, player, args) {
		var nam = player.id + '_' + element;
		$('#' + nam).css('cursor', 'pointer');
		if (handler == 'fullscreen') {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				player.fullscreen(!player.fullscreen());
				resizeHandler({
					id: player.id,
					fullscreen: player.fullscreen(),
					width: player.width(),
					height: player.height()
				});
			});
		} else {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				if (!$.fn.jwplayerUtils.isNull(args)) {
					player[handler](args);
				} else {
					player[handler]();
				}
				
			});
		}
	}
	
	
	/** Set the volume drag handler. **/
	function addSliders(player) {
		var bar = '#' + player.id + '_jwplayerControlbar';
		var trl = '#' + player.id + '_timeSliderRail';
		var vrl = '#' + player.id + '_volumeSliderRail';
		$(bar).css('cursor', 'hand');
		$(trl).css('cursor', 'hand');
		$(vrl).css('cursor', 'hand');
		$(bar).mousedown(function(evt) {
			if (evt.pageX >= $(trl).offset().left && evt.pageX <= $(trl).offset().left + $(trl).width()) {
				controlbars[player.id].scrubber = 'time';
			} else if (evt.pageX >= $(vrl).offset().left && evt.pageX <= $(vrl).offset().left + $(trl).width()) {
				controlbars[player.id].scrubber = 'volume';
			}
		});
		$(bar).mouseup(function(evt) {
			evt.stopPropagation();
			sliderUp(evt.pageX, player);
		});
		$(bar).mousemove(function(evt) {
			if (controlbars[player.id].scrubber == 'time') {
				controlbars[player.id].mousedown = true;
				var xps = evt.pageX - $(bar).offset().left;
				$('#' + player.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function sliderUp(msx, player) {
		controlbars[player.id].mousedown = false;
		if (controlbars[player.id].scrubber == 'time') {
			var xps = msx - $('#' + player.id + '_timeSliderRail').offset().left;
			var wid = $('#' + player.id + '_timeSliderRail').width();
			var pos = xps / wid * controlbars[player.id].currentDuration;
			if (pos < 0) {
				pos = 0;
			} else if (pos > controlbars[player.id].currentDuration) {
				pos = controlbars[player.id].currentDuration - 3;
			}
			player.seek(pos);
			if (player.model.state != $.fn.jwplayer.states.PLAYING) {
				player.play();
			}
		} else if (controlbars[player.id].scrubber == 'volume') {
			var xps = msx - $('#' + player.id + '_volumeSliderRail').offset().left;
			var wid = $('#' + player.id + '_volumeSliderRail').width();
			var pct = Math.round(xps / wid * 100);
			if (pct < 0) {
				pct = 0;
			} else if (pct > 100) {
				pct = 100;
			}
			player.volume(pct);
		}
		controlbars[player.id].scrubber = 'none';
	}
	
	
	/** Update the buffer percentage. **/
	function bufferHandler(event) {
		if (!$.fn.jwplayerUtils.isNull(event.bufferPercent)) {
			controlbars[event.id].currentBuffer = event.bufferPercent;
		}
		if (event.bufferPercent === 0) {
			$('#' + event.id + '_timeSliderBuffer').css('display', 'none');
		} else {
			var wid = $('#' + event.id + '_timeSliderRail').width();
			$('#' + event.id + '_timeSliderBuffer').css('width', Math.round(wid * controlbars[event.id].currentBuffer / 100));
		}
	}
	
	
	/** Update the mute state. **/
	function muteHandler(event) {
		if (event.mute) {
			$('#' + event.id + '_muteButton').css('display', 'none');
			$('#' + event.id + '_unmuteButton').css('display', 'block');
			$('#' + event.id + '_volumeSliderProgress').css('display', 'none');
		} else {
			$('#' + event.id + '_muteButton').css('display', 'block');
			$('#' + event.id + '_unmuteButton').css('display', 'none');
			$('#' + event.id + '_volumeSliderProgress').css('display', 'block');
		}
	}
	
	
	/** Update the playback state. **/
	function stateHandler(event) {
		// Handle the play / pause button
		if (event.newstate == $.fn.jwplayer.states.BUFFERING || event.newstate == $.fn.jwplayer.states.PLAYING) {
			$('#' + event.id + '_pauseButton').css('display', 'block');
			$('#' + event.id + '_playButton').css('display', 'none');
		} else {
			$('#' + event.id + '_pauseButton').css('display', 'none');
			$('#' + event.id + '_playButton').css('display', 'block');
		}
		
		// Show / hide progress bar
		if (event.newstate == $.fn.jwplayer.states.IDLE) {
			$('#' + event.id + '_timeSliderBuffer').css('display', 'none');
			$('#' + event.id + '_timeSliderProgress').css('display', 'none');
			$('#' + event.id + '_timeSliderThumb').css('display', 'none');
		} else {
			$('#' + event.id + '_timeSliderBuffer').css('display', 'block');
			if (event.newstate != $.fn.jwplayer.states.BUFFERING) {
				$('#' + event.id + '_timeSliderProgress').css('display', 'block');
				$('#' + event.id + '_timeSliderThumb').css('display', 'block');
			}
		}
	}
	
	/** Handles event completion **/
	function completeHandler(event) {
		timeHandler($.extend(event, {
			position: 0,
			duration: controlbars[event.id].currentDuration
		}));
	}
	
	
	/** Update the playback time. **/
	function timeHandler(event) {
		if (!$.fn.jwplayerUtils.isNull(event.position)) {
			controlbars[event.id].currentPosition = event.position;
		}
		if (!$.fn.jwplayerUtils.isNull(event.duration)) {
			controlbars[event.id].currentDuration = event.duration;
		}
		var progress = (controlbars[event.id].currentPosition === controlbars[event.id].currentDuration === 0) ? 0 : controlbars[event.id].currentPosition / controlbars[event.id].currentDuration;
		var railWidth = $('#' + event.id + '_timeSliderRail').width();
		var thumbWidth = $('#' + event.id + '_timeSliderThumb').width();
		var railLeft = $('#' + event.id + '_timeSliderRail').position().left;
		
		$('#' + event.id + '_timeSliderProgress').css('width', Math.round(railWidth * progress));
		if (!controlbars[event.id].mousedown) {
			$('#' + event.id + '_timeSliderThumb').css('left', railLeft + Math.round((railWidth - thumbWidth) * progress));
		}
		
		$('#' + event.id + '_durationText').html(timeFormat(controlbars[event.id].currentDuration));
		$('#' + event.id + '_elapsedText').html(timeFormat(controlbars[event.id].currentPosition));
	}
	
	
	/** Format the elapsed / remaining text. **/
	function timeFormat(sec) {
		str = '00:00';
		if (sec > 0) {
			str = Math.floor(sec / 60) < 10 ? '0' + Math.floor(sec / 60) + ':' : Math.floor(sec / 60) + ':';
			str += Math.floor(sec % 60) < 10 ? '0' + Math.floor(sec % 60) : Math.floor(sec % 60);
		}
		return str;
	}
	
	
	/** Flip the player size to/from full-browser-screen. **/
	function resizeHandler(event) {
		controlbars[event.id].width = event.width;
		controlbars[event.id].fullscreen = event.fullscreen;
		if (event.fullscreen) {
			$('#' + event.id + '_normalscreenButton').css('display', 'block');
			$('#' + event.id + '_fullscreenButton').css('display', 'none');
			/*$(window).resize(function() {
			 resizeBar(player);
			 });*/
		} else {
			$('#' + event.id + '_normalscreenButton').css('display', 'none');
			$('#' + event.id + '_fullscreenButton').css('display', 'block');
			//$(window).resize(null);
		}
		resizeBar(event);
		timeHandler(event);
		bufferHandler(event);
	}
	
	
	/** Resize the jwplayerControlbar. **/
	function resizeBar(event) {
		var lft = controlbars[event.id].left;
		var top = controlbars[event.id].top;
		var wid = controlbars[event.id].width;
		var hei = $('#' + event.id + '_jwplayerControlbar').height();
		if (controlbars[event.id].position == 'over') {
			lft += 1 * controlbars[event.id].margin;
			top -= 1 * controlbars[event.id].margin + hei;
			wid -= 2 * controlbars[event.id].margin;
		}
		if (controlbars[event.id].fullscreen) {
			lft = controlbars[event.id].margin;
			top = $(window).height() - controlbars[event.id].margin - hei;
			wid = $(window).width() - 2 * controlbars[event.id].margin;
			$('#' + event.id + '_jwplayerControlbar').css('z-index', 99);
		} else {
			$('#' + event.id + '_jwplayerControlbar').css('z-index', 97);
		}
		$('#' + event.id + '_jwplayerControlbar').css('left', lft);
		$('#' + event.id + '_jwplayerControlbar').css('top', top);
		$('#' + event.id + '_jwplayerControlbar').css('width', wid);
		$('#' + event.id + '_timeSliderRail').css('width', (wid - controlbars[event.id].leftmargin - controlbars[event.id].rightmargin));
	}
	
	
	/** Update the volume level. **/
	function volumeHandler(event) {
		var rwd = $('#' + event.id + '_volumeSliderRail').width();
		var wid = Math.round(event.volume / 100 * rwd);
		var rig = $('#' + event.id + '_volumeSliderRail').css('right').substr(0, 2);
		$('#' + event.id + '_volumeSliderProgress').css('width', wid);
		$('#' + event.id + '_volumeSliderProgress').css('right', (1 * rig + rwd - wid));
	}
	
	
})(jQuery);
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
		$.fn.jwplayerUtils.log("Starting step " + step, {
			player: player,
			options: options
		});
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
						$.fn.jwplayerUtils.log("Skin loading complete", player);
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
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	displays = {};
	
	$.fn.jwplayerDisplay = function(player, domelement) {
		displays[player.id] = {};
		displays[player.id].domelement = domelement;
		var meta = player.meta();
		domelement.before("<div id='" + player.id + "_display' style='width:" + meta.width + "px;height: " + meta.height + "px;position:relative;z-index:50' ><a id='" + player.id + "_displayImage' href='" + $.fn.jwplayerUtils.getAbsolutePath(meta.sources[meta.source].file) + "'>&nbsp;</a><img id='" + player.id + "_displayIconBackground' src='" + player.skin.display.elements.background.src + "' alt='Click to play video' style='position:absolute; top:" + (meta.height - 60) / 2 + "px; left:" + (meta.width - 60) / 2 + "px; border:0;' /><img id='" + player.id + "_displayIcon' src='" + player.skin.display.elements.playIcon.src + "' alt='Click to play video' style='position:absolute; top:" + (meta.height - 60) / 2 + "px; left:" + (meta.width - 60) / 2 + "px; border:0;' /></div>");
		var display = $("#" + player.id + "_display");
		var displayImage = $("#" + player.id + "_displayImage");
		var displayIcon = $("#" + player.id + "_displayIcon");
		var displayIconBackground = $("#" + player.id + "_displayIconBackground");
		displayImage.jwplayerCSS({
			'display': "block",
			'background': "#ffffff url('" + $.fn.jwplayerUtils.getAbsolutePath(player.config.image) + "') no-repeat center center",
			'width': meta.width,
			'height': meta.height,
			'position': "relative",
			'left': 0,
			'top': 0
		});
		
		display.click(function(evt) {
			$.fn.jwplayerUtils.log("click" + player.model.state, evt);
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (player.model.state != $.fn.jwplayer.states.PLAYING) {
				player.play();
			} else {
				player.pause();
			}
			
		});
		player.state(stateHandler);
		player.mute(stateHandler);
		player.error(function(obj) {
		
		});
		displays[player.id].display = display;
		displays[player.id].displayImage = displayImage;
		displays[player.id].displayIcon = displayIcon;
		displays[player.id].displayIconBackground = displayIconBackground;
	};
	
	function setIcon(player, path) {
		$("#" + player.id + "_displayIcon")[0].src = path;
	}
	
	function stateHandler(obj) {
		switch ($.jwplayer(obj.id).model.state) {
			case $.fn.jwplayer.states.BUFFERING:
				displays[obj.id].displayIconBackground.css("display", "block");
				displays[obj.id].displayIcon[0].src = $.jwplayer(obj.id).skin.display.elements.bufferIcon.src;
				displays[obj.id].displayIcon.css("display", "block");
				break;
			case $.fn.jwplayer.states.PAUSED:
				displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
				displays[obj.id].displayIconBackground.css("display", "block");
				displays[obj.id].displayIcon[0].src = $.jwplayer(obj.id).skin.display.elements.playIcon.src;
				displays[obj.id].displayIcon.css("display", "block");
				break;
			case $.fn.jwplayer.states.IDLE:
				displays[obj.id].displayImage.css("background", "#ffffff url('" + $.fn.jwplayerUtils.getAbsolutePath($.jwplayer(obj.id).config.image) + "') no-repeat center center");
				displays[obj.id].displayIconBackground.css("display", "block");
				displays[obj.id].displayIcon[0].src = $.jwplayer(obj.id).skin.display.elements.playIcon.src;
				displays[obj.id].displayIcon.css("display", "block");
				break;
			default:
				if ($.jwplayer(obj.id).mute()) {
					displays[obj.id].displayIconBackground.css("display", "block");
					displays[obj.id].displayIcon[0].src = $.jwplayer(obj.id).skin.display.elements.muteIcon.src;
					displays[obj.id].displayIcon.css("display", "block");
				} else {
					displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
					displays[obj.id].displayIconBackground.css("display", "none");
					displays[obj.id].displayIcon.css("display", "none");
				}
				break;
		}
	}
	
})(jQuery);
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
			state: $.fn.jwplayer.states.IDLE
		};
		player.media = media;
		addEventListeners(player);
	};
	
	function stateHandler(event, player) {
		$.fn.jwplayerUtils.log(event);
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
		$.fn.jwplayerMediaFlash.forwarders[player.id] = {}
		var video = player.model.domelement;
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
	
	$.fn.jwplayerMediaFlash.forwarders = {};
	
	function forward(event, type, player) {
		switch (type) {
			case $.fn.jwplayer.events.JWPLAYER_MEDIA_META:
				//$.fn.jwplayerUtils.log(type, event);
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
			} catch (err) {
				$.fn.jwplayerUtils.log("There was an error", err);
			}
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
			player.model.domelement[0].sendEvent("MUTE", state);
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
/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {
	var states = {
		"ended": $.fn.jwplayer.states.IDLE,
		"playing": $.fn.jwplayer.states.PLAYING,
		"pause": $.fn.jwplayer.states.PAUSED,
		"buffering": $.fn.jwplayer.states.BUFFERING
	};
	
	var events = {
		'abort': generalHandler,
		'canplay': stateHandler,
		'canplaythrough': stateHandler,
		'durationchange': metaHandler,
		'emptied': generalHandler,
		'ended': stateHandler,
		'error': errorHandler,
		'loadeddata': metaHandler,
		'loadedmetadata': metaHandler,
		'loadstart': stateHandler,
		'pause': stateHandler,
		'play': positionHandler,
		'playing': stateHandler,
		'progress': progressHandler,
		'ratechange': generalHandler,
		'seeked': stateHandler,
		'seeking': stateHandler,
		'stalled': stateHandler,
		'suspend': stateHandler,
		'timeupdate': positionHandler,
		'volumechange': generalHandler,
		'waiting': stateHandler,
		'canshowcurrentframe': generalHandler,
		'dataunavailable': generalHandler,
		'empty': generalHandler,
		'load': generalHandler,
		'loadedfirstframe': generalHandler
	};
	
	
	$.fn.jwplayerMediaVideo = function(player) {
		var media = {
			play: play(player),
			pause: pause(player),
			seek: seek(player),
			stop: stop(player),
			volume: volume(player),
			mute: mute(player),
			fullscreen: fullscreen(player),
			load: load(player),
			resize: resize(player),
			state: $.fn.jwplayer.states.IDLE,
			interval: null,
			loadcount: 0
		};
		player.media = media;
		media.mute(player.mute());
		media.volume(player.volume());
		$.each(events, function(event, handler) {
			player.model.domelement[0].addEventListener(event, function(event) {
				handler(event, player);
			}, true);
		});
	};
	
	function generalHandler(event, player) {
		//$.fn.jwplayerUtils.log("general:" + event.type);
	}
	
	function stateHandler(event, player) {
		if (states[event.type]) {
			setState(player, states[event.type]);
		}
	}
	
	function setState(player, newstate) {
		if (player.model.state != newstate) {
			var oldstate = player.model.state;
			player.media.state = newstate;
			player.model.state = newstate;
			$.fn.jwplayerUtils.log($.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
		}
		if (newstate == $.fn.jwplayer.states.IDLE) {
			clearInterval(player.media.interval);
			player.media.interval = null;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE);
		}
	}
	
	function metaHandler(event, player) {
		var meta = {
			height: event.target.videoHeight,
			width: event.target.videoWidth,
			duration: event.target.duration
		};
		if (player.model.duration === 0) {
			player.model.duration = event.target.duration;
		}
		player.model.sources[player.model.source] = $.extend(player.model.sources[player.model.source], meta);
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_META, meta);
	}
	
	function positionHandler(event, player) {
		if (!$.fn.jwplayerUtils.isNull(event.target)) {
			if (player.model.duration === 0) {
				player.model.duration = event.target.duration;
			}
			
			if (!$.fn.jwplayerUtils.isNull(event.target.currentTime)) {
				player.model.position = event.target.currentTime;
			}
			if (player.media.state == $.fn.jwplayer.states.PLAYING) {
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, {
					position: event.target.currentTime,
					duration: event.target.duration
				});
			}
		}
		
	}
	
	function progressHandler(event, player) {
		var bufferPercent, bufferTime, bufferFill;
		if (!isNaN(event.loaded / event.total)) {
			bufferPercent = event.loaded / event.total * 100;
			bufferTime = bufferPercent / 100 * player.model.duration;
		} else if (player.model.domelement[0].buffered !== undefined) {
			maxBufferIndex = 0;
			if (maxBufferIndex >= 0) {
				bufferPercent = player.model.domelement[0].buffered.end(maxBufferIndex) / player.model.domelement[0].duration * 100;
				bufferTime = player.model.domelement[0].buffered.end(maxBufferIndex) - player.model.position;
			}
		}
		
		bufferFill = bufferTime / player.model.config.bufferlength * 100;
		
		if (bufferFill < 25 && player.media.state == $.fn.jwplayer.states.PLAYING) {
			player.media.bufferFull = false;
			player.model.domelement[0].pause();
			setState(PlayerState.BUFFERING);
		} else if (bufferFill > 95 && player.media.state == $.fn.jwplayer.states.BUFFERING && player.media.bufferFull === false && bufferTime > 0) {
			player.media.bufferFull = true;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
		}
		
		if (!player.media.bufferingComplete) {
			if (bufferPercent == 100 && player.media.bufferingComplete === false) {
				player.media.bufferingComplete = true;
			}
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, {
				'bufferPercent': bufferPercent
			});
		}
	}
	
	function startInterval(player) {
		if (player.media.interval === null) {
			player.media.interval = window.setInterval(function() {
				positionHandler({}, player);
			}, 100);
		}
	}
	
	
	function errorHandler(event, player) {
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, {});
	}
	
	function play(player) {
		return function() {
			if (player.media.state != $.fn.jwplayer.states.PLAYING) {
				setState(player, $.fn.jwplayer.states.PLAYING);
				player.model.domelement[0].play();
			}
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			player.model.domelement[0].pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			player.model.domelement[0].currentTime = position;
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			player.model.domelement[0].pause();
			player.model.domelement[0].currentTime = 0;
			clearInterval(player.media.interval);
			player.media.interval = undefined;
			setState(player, $.fn.jwplayer.states.IDLE);
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			player.model.volume = position;
			player.model.domelement[0].volume = position / 100;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME, {
				volume: player.model.domelement[0].volume * 100
			});
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			player.model.mute = state;
			player.model.domelement[0].muted = state;
			player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, {
				mute: player.model.domelement[0].muted
			});
		};
	}
	
	/** Resize the player. **/
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
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			player.model.fullscreen = state;
			if (state === true) {
				//player.css("width", window.width);
				//player.css("height", window.height);
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
					width: player.model.width,
					hieght: player.model.height
				});
			} else {
				// TODO: exit fullscreen
			}
		};
	}
	
	/** Load a new video into the player. **/
	function load(player) {
		return function(path) {
			path = $.fn.jwplayerUtils.getAbsolutePath(path);
			$.fn.jwplayerUtils.log("replay:" + player.model.domelement[0].src + ":" + path + ":" + (path == player.model.domelement[0].src));
			if (path == player.model.domelement[0].src && player.media.loadcount > 0) {
				setState(player, $.fn.jwplayer.states.BUFFERING);
				setState(player, $.fn.jwplayer.states.PLAYING);
				player.model.domelement[0].currentTime = player.config.start;
				//player.model.domelement[0].paused = false;
				return;
			} else if (path != player.model.domelement[0].src) {
				player.media.loadcount = 0;
			}
			player.media.loadcount++;
			player.media.bufferFull = false;
			player.media.bufferingComplete = false;
			setState(player, $.fn.jwplayer.states.BUFFERING);
			player.model.domelement[0].src = path;
			startInterval(player);
			player.model.domelement[0].currentTime = player.config.start;
		};
	}
	
})(jQuery);
/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	var jwplayerid = 1;
	
	var modelParams = {
		volume: 100,
		fullscreen: false,
		mute: false,
		start: 0,
		width: 480,
		height: 320,
		duration: 0
	};
	
	function createModel() {
		return {
			sources: {},
			state: $.fn.jwplayer.states.IDLE,
			source: 0,
			buffer: 0
		};
	}
	
	
	$.fn.jwplayerModel = function(domElement, options) {
		var model = createModel();
		model.config = $.extend(true, {}, $.fn.jwplayer.defaults, $.fn.jwplayerParse(domElement[0]), options);
		if ($.fn.jwplayerUtils.isNull(model.config.id)) {
			model.config.id = "jwplayer_" + jwplayerid++;
		}
		model.sources = model.config.sources;
		delete model.config.sources;
		model.domelement = domElement;
		for (var modelParam in modelParams) {
			if (!$.fn.jwplayerUtils.isNull(model.config[modelParam])) {
				model[modelParam] = model.config[modelParam];
			} else {
				model[modelParam] = modelParams[modelParam];
			}
		}
		//model = $.extend(true, {}, , model);
		return model;
	};
	
	$.fn.jwplayerModel.setActiveMediaProvider = function(player) {
		var source, sourceIndex;
		for (sourceIndex in player.model.sources) {
			source = player.model.sources[sourceIndex];
			if (source.type === undefined) {
				var extension = $.fn.jwplayerUtils.extension(source.file);
				if (extension == "ogv") {
					extension = "ogg";
				}
				source.type = 'video/' + extension + ';';
			}
			if ($.fn.jwplayerUtils.supportsType(source.type)) {
				player.model.source = sourceIndex;
				$.fn.jwplayerMediaVideo(player);
				return true;
			}
		}
		if ($.fn.jwplayerUtils.supportsFlash && player.state != $.fn.jwplayer.states.PLAYING) {
			for (sourceIndex in player.model.sources) {
				source = player.model.sources[sourceIndex];
				if ($.fn.jwplayerUtils.flashCanPlay(source.file)) {
					player.model.source = sourceIndex;
					$.fn.jwplayerMediaFlash(player);
					return true;
				}
			}
		}
		return false;
	};
	
})(jQuery);
/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var elementAttributes = {
		'element': {
			'width': 'width',
			'height': 'height',
			'id': 'id',
			'class': 'className',
			'name': 'name'
		},
		'media': {
			'src': 'file',
			'preload': 'preload',
			'autoplay': 'autostart',
			'loop': 'repeat',
			'controls': 'controls'
		},
		'source': {
			'src': 'file',
			'type': 'type',
			'media': 'media'
		},
		'video': {
			'poster': 'image'
		}
	};
	
	var parsers = {};
	
	$.fn.jwplayerParse = function(player) {
		return parseElement(player);
	};
	
	function getAttributeList(elementType, attributes) {
		if (attributes === undefined) {
			attributes = elementAttributes[elementType];
		} else {
			$.extend(attributes, elementAttributes[elementType]);
		}
		return attributes;
	}
	
	function parseElement(domElement, attributes) {
		if (parsers[domElement.tagName.toLowerCase()] && (attributes === undefined)) {
			return parsers[domElement.tagName.toLowerCase()](domElement);
		} else {
			attributes = getAttributeList('element', attributes);
			var configuration = {};
			for (var attribute in attributes) {
				if (attribute != "length") {
					var value = $(domElement).attr(attribute);
					if (!(value === "" || value === undefined)) {
						configuration[attributes[attribute]] = $(domElement).attr(attribute);
					}
				}
			}
			configuration.screencolor = ($(domElement).css("background-color") == "transparent") ? "#ffffff" : $(domElement).css("background-color");
			configuration.plugins = {};
			return configuration;
		}
	}
	
	function parseMediaElement(domElement, attributes) {
		attributes = getAttributeList('media', attributes);
		var sources = [];
		$("source", domElement).each(function() {
			sources[sources.length] = parseSourceElement(this);
		});
		var configuration = parseElement(domElement, attributes);
		if (configuration.file !== undefined) {
			sources[0] = {
				'file': configuration.file
			};
		}
		if (!$.fn.jwplayerUtils.isiPhone()) {
			domElement.src = undefined;
		} 
		configuration.sources = sources;
		return configuration;
	}
	
	function parseSourceElement(domElement, attributes) {
		attributes = getAttributeList('source', attributes);
		return parseElement(domElement, attributes);
	}
	
	function parseVideoElement(domElement, attributes) {
		attributes = getAttributeList('video', attributes);
		var result = parseMediaElement(domElement, attributes);
		if (!$.fn.jwplayerUtils.isNull($(domElement).attr('poster')) && !$.fn.jwplayerUtils.isiPhone()){
			$(domElement).removeAttr('poster');
		}
		return result;
	}
	
	parsers.media = parseMediaElement;
	parsers.audio = parseMediaElement;
	parsers.source = parseSourceElement;
	parsers.video = parseVideoElement;
	
	
})(jQuery);
/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	/** Constructor **/
	$.fn.jwplayerSkinner = function(player, completeHandler) {
		load(player, completeHandler);
	};
	
	/** Load the skin **/
	function load(player, completeHandler) {
		$.get(player.model.config.skin, {}, function(xml) {
			var skin = {
				properties: {},
				incompleteElements: 0
			};
			player.skin = skin;
			var components = $('component', xml);
			for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
				var componentName = $(components[componentIndex]).attr('name');
				var component = {
					settings: {},
					elements: {}
				};
				player.skin[componentName] = component;
				var elements = $(components[componentIndex]).find('element');
				player.skin.loading = true;
				for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
					player.skin.incompleteElements++;
					loadImage(elements[elementIndex], componentName, player, completeHandler);
				}
				var settings = $(components[componentIndex]).find('setting');
				for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
					player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
				}
				player.skin.loading = false;
			}
		});
	}
	
	/** Load the data for a single element. **/
	function loadImage(element, component, player, completeHandler) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var skinUrl = player.model.config.skin.substr(0, player.model.config.skin.lastIndexOf('/'));
		$(img).error(function() {
			player.skin.incompleteElements--;
		});
		$(img).bind('load', {
			player: player,
			elementName: elementName,
			component: component,
			completeHandler: completeHandler
		}, function(event) {
			event.data.player.skin[event.data.component].elements[event.data.elementName] = {
				height: this.height,
				width: this.width,
				src: this.src
			};
			event.data.player.skin.incompleteElements--;
			if ((event.data.player.skin.incompleteElements === 0) && (event.data.player.skin.loading === false)) {
				event.data.completeHandler();
			}
		});
		var src = [skinUrl, component, elementSource].join("/");
		//$(img).attr('style', "filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);");
		img.src = src;
		img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')";
	}
	
	$.fn.jwplayerSkinner.hasComponent = function(player, component) {
		return (player.skin[component] !== null);
	};
	
	
	$.fn.jwplayerSkinner.getSkinElement = function(player, component, element) {
		try {
			return player.skin[component].elements[element];
		} catch (err) {
			$.fn.jwplayerUtils.log("No such skin component / element: ", [player, component, element]);
		}
		return null;
	};
	
	
	$.fn.jwplayerSkinner.addSkinElement = function(player, component, name, element) {
		try {
			player.skin[component][name] = element;
		} catch (err) {
			$.fn.jwplayerUtils.log("No such skin component ", [player, component]);
		}
	};
	
	$.fn.jwplayerSkinner.getSkinProperties = function(player) {
		return player.skin.properties;
	};
	
})(jQuery);
/**
 * Utility methods for the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	/** Constructor **/
	$.fn.jwplayerUtils = function() {
		return this.each(function() {
		});
	};
	
	//http://old.nabble.com/jQuery-may-add-$.browser.isiPhone-td11163329s27240.html
	$.fn.jwplayerUtils.isiPhone = function() {
		var agent = navigator.userAgent.toLowerCase();
		return agent.match(/iPhone/i);
	};
	
	/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
	$.fn.jwplayerUtils.supportsFlash = function() {
		var version = '0,0,0,0';
		try {
			try {
				var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
				try {
					axo.AllowScriptAccess = 'always';
				} catch (e) {
					version = '6,0,0';
				}
			} catch (e) {
			}
			version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch (e) {
			try {
				if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
					version = (navigator.plugins["Shockwave Flash 2.0"] ||
					navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch (e) {
			}
		}
		var major = parseInt(version.split(',')[0]);
		var minor = parseInt(version.split(',')[2]);
		if (major > 9 || (major == 9 && minor > 97)) {
			return true;
		} else {
			return false;
		}
	};
	
	/** Filetypes supported by Flash **/
	var flashFileTypes = {
		'3g2': true,
		'3gp': true,
		'aac': true,
		'f4b': true,
		'f4p': true,
		'f4v': true,
		'flv': true,
		'gif': true,
		'jpg': true,
		'jpeg': true,
		'm4a': true,
		'm4v': true,
		'mov': true,
		'mp3': true,
		'mp4': true,
		'png': true,
		'rbs': true,
		'sdp': true,
		'swf': true,
		'vp6': true
	};
	
	
	/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
	$.fn.jwplayerUtils.flashCanPlay = function(fileName) {
		if (flashFileTypes[$.fn.jwplayerUtils.extension(fileName)]) {
			return true;
		}
		return false;
	};
	
	/** Check if this client supports playback for the specified type. **/
	$.fn.jwplayerUtils.supportsType = function(type) {
		try {
			return !!document.createElement('video').canPlayType(type);
		} catch (e) {
			return false;
		}
	};
	
	/** Check if this client supports HTML5 H.264 playback. **/
	$.fn.jwplayerUtils.supportsH264 = function() {
		return $.fn.jwplayerUtils.supportsType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	};
	
	
	/** Check if this client supports HTML5 OGG playback. **/
	$.fn.jwplayerUtils.supportsOgg = function() {
		return $.fn.jwplayerUtils.supportsType('video/ogg; codecs="theora, vorbis"');
	};
	
	/** Returns the extension of a file name **/
	$.fn.jwplayerUtils.extension = function(path) {
		return path.substr(path.lastIndexOf('.') + 1, path.length);
	};
	
	/** Resets an element's CSS **/
	$.fn.jwplayerCSS = function(options) {
		return this.each(function() {
			var defaults = {
				'margin': 0,
				'padding': 0,
				'background': 'none',
				'border': 'none',
				'bottom': 'auto',
				'clear': 'none',
				'cursor': 'default',
				'float': 'none',
				'font-family': '"Arial", "Helvetica", sans-serif',
				'font-size': 'medium',
				'font-style': 'normal',
				'font-weight': 'normal',
				'height': 'auto',
				'left': 'auto',
				'letter-spacing': 'normal',
				'line-height': 'normal',
				'max-height': 'none',
				'max-width': 'none',
				'min-height': 0,
				'min-width': 0,
				'overflow': 'visible',
				'position': 'static',
				'right': 'auto',
				'text-align': 'left',
				'text-decoration': 'none',
				'text-indent': 0,
				'text-transform': 'none',
				'top': 'auto',
				'visibility': 'visible',
				'white-space': 'normal',
				'width': 'auto',
				'z-index': 'auto'
			};
			try {
				$(this).css($.extend(defaults, options));
			} catch (err) {
				//alert($.fn.jwplayerUtils.dump(err));
			}
		});
	};
	
	$.fn.jwplayerUtils.isNull = function(obj) {
		return ((obj === null) || (obj === undefined) || (obj === ""));
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	$.fn.jwplayerUtils.getAbsolutePath = function(path) {
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = document.location.href.substr(0, document.location.href.indexOf("://") + 3);
		var basepath = document.location.href.substring(protocol.length, (path.indexOf("/") === 0) ? document.location.href.indexOf('/') : document.location.href.lastIndexOf('/'));
		var patharray = (basepath + "/" + path).split("/");
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if ($.fn.jwplayerUtils.isNull(patharray[i]) || patharray[i] == ".") {
				continue;
			} else if (patharray[i] == "..") {
				result.pop();
			} else {
				result.push(patharray[i]);
			}
		}
		return protocol + result.join("/");
	};
	
	function isAbsolutePath(path) {
		if(path === undefined){
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}
	
	/** Dumps the content of an object to a string **/
	$.fn.jwplayerUtils.dump = function(object, depth) {
		if (object === null) {
			return 'null';
		} else if ($.fn.jwplayerUtils.typeOf(object) != 'object') {
			if ($.fn.jwplayerUtils.typeOf(object) == 'string') {
				return "\"" + object + "\"";
			}
			return object;
		}
		
		var type = $.fn.jwplayerUtils.typeOf(object);
		
		depth = (depth === undefined) ? 1 : depth + 1;
		var indent = "";
		for (var i = 0; i < depth; i++) {
			indent += "\t";
		}
		
		var result = (type == "array") ? "[" : "{";
		result += "\n" + indent;
		
		for (var i in object) {
			if (type == "object") {
				result += "\"" + i + "\": ";
			}
			result += $.fn.jwplayerUtils.dump(object[i], depth) + ",\n" + indent;
		}
		
		result = result.substring(0, result.length - 2 - depth) + "\n";
		
		result += indent.substring(0, indent.length - 1);
		result += (type == "array") ? "]" : "}";
		
		return result;
	};
	
	/** Returns the true type of an object **/
	$.fn.jwplayerUtils.typeOf = function(value) {
		var s = typeof value;
		if (s === 'object') {
			if (value) {
				if (value instanceof Array) {
					s = 'array';
				}
			} else {
				s = 'null';
			}
		}
		return s;
	};
	
	
	/** Logger **/
	$.fn.jwplayerUtils.log = function(msg, obj) {
		try {
			if (obj) {
				console.log("%s: %o", msg, obj);
			} else {
				console.log($.fn.jwplayerUtils.dump(msg));
			}
		} catch (err) {
		}
		return this;
	};
	
	
})(jQuery);
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var styleString = "left:0px;top:0px;position:absolute;z-index:0;";
	var embedString = "<embed %elementvars% src='%flashplayer%' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' %style% />";
	var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars% %style% > <param name='movie' value='%flashplayer%'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
	var elementvars = {
		//width: true,
		//height: true,
		id: true,
		name: true,
		className: true
	};
	
	$.fn.jwplayerView = function(player) {
		player.model.domelement.wrap("<div id='" + player.model.config.id + "_jwplayer' />");
		player.model.domelement.parent().jwplayerCSS({
			'position': 'relative',
			'height': player.model.config.height,
			'width': player.model.config.width,
			'margin': 'auto'
		});
		player.model.domelement.css({
			'position': 'absolute',
			'width': player.model.config.width,
			'height': player.model.config.height,
			'top': 0,
			'z-index': 0,
			margin: 'auto'
		});
	};
	
	$.fn.jwplayerView.switchMediaProvider = function() {
	
	};
	
	/** Embeds a Flash Player at the specified location in the DOM. **/
	$.fn.jwplayerView.embedFlash = function(player, options) {
		if (player.model.config.flashplayer !== false) {
			var htmlString, elementvarString = "", flashvarString = "";
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				htmlString = embedString;
			} else {
				htmlString = objectString;
			}
			for (var elementvar in elementvars) {
				if (!((player.model.config[elementvar] === undefined) || (player.model.config[elementvar] === "") || (player.model.config[elementvar] === null))) {
					elementvarString += elementvar + "='" + player.model.config[elementvar] + "' ";
				}
			}
			if (elementvar.indexOf("name" ) < 0) {
				elementvarString += "name" + "='" + player.id + "' ";
			}
			var config = $.extend(true, {}, player.model.config, options);
			flashvarString += "file=" + $.fn.jwplayerUtils.getAbsolutePath(player.model.sources[player.model.source].file) + "&image=" + $.fn.jwplayerUtils.getAbsolutePath(config.image) +"&";
			for (var flashvar in config) {
				if ((flashvar == "file") || (flashvar == "image") ||  (flashvar == "plugins")) {
					continue;
				}
				if (!$.fn.jwplayerUtils.isNull(config[flashvar])){
					flashvarString += flashvar + "=" + config[flashvar] + "&";
				}
			}
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", player.model.config.flashplayer);
			htmlString = htmlString.replace("%style%", "style='"+styleString+"width:"+player.model.config.width+"px;height:"+player.model.config.height+"px;'");
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				player.model.domelement.before(htmlString);
			} else {
				player.model.domelement.before("<div />");
				player.model.domelement.prev()[0].outerHTML= htmlString;
			}
			var oldDOMElement = player.model.domelement;
			player.model.domelement = player.model.domelement.prev();
			oldDOMElement.remove();
		}
	};
	
	
})(jQuery);
