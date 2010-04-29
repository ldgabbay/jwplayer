/**
 * jwplayerControlbar component of the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	
	var controlbars = {}


	/** Hooking the jwplayerControlbar up to jQuery. **/
	$.fn.jwplayerControlbar = function(player, domelement) {
		controlbars[player.id] = $.extend({}, $.fn.jwplayerControlbar.defaults, player.config.plugins.controlbar);
		buildElements(player, domelement);
		buildHandlers(player);
	};
	
	
	/** Map with config for the jwplayerControlbar plugin. **/
	$.fn.jwplayerControlbar.defaults = {
		fontsize: 10,
		fontcolor: '000000',
		position: 'bottom',
		leftmargin: 0,
		rightmargin: 0,
		scrubber: 'none'
	};
	
	/** Draw the jwplayerControlbar elements. **/
	function buildElements(player, domelement) {
		// Draw the background.
		domelement.parents(":first").append('<div id="' + player.id + '_jwplayerControlbar"></div>');
		$("#" + player.id + '_jwplayerControlbar').css('position', 'relative');
		$("#" + player.id + '_jwplayerControlbar').css('height', player.skin.controlbar.elements.background.height);
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
		$(bar).mouseleave(function(evt) {
			sliderUp(evt.pageX, player);
			evt.stopPropagation();
		});
		$(bar).mousemove(function(evt) {
			if (controlbars[player.id].scrubber == 'time') {
				var xps = evt.pageX - $(bar).position().left;
				$('#' + player.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function sliderUp(msx, player) {
		if (controlbars[player.id].scrubber == 'time') {
			var xps = msx - $('#' + player.id + '_timeSliderRail').offset().left;
			var wid = $('#' + player.id + '_timeSliderRail').width();
			var pos = xps / wid * player.duration();
			if (pos < 0) {
				pos = 0;
			} else if (pos > controlbars[player.id].duration) {
				pos = controlbars[player.id].duration - 3;
			}
			player.seek(pos);
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
			$('#' + event.id + '_timeSliderProgress').css('display', 'block');
			$('#' + event.id + '_timeSliderThumb').css('display', 'block');
		}
	}
	
	/** Handles event completion **/
	function completeHandler(event){
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
		$('#' + event.id + '_timeSliderThumb').css('left', railLeft + Math.round((railWidth - thumbWidth) * progress));
		
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

	var mediaParams ={
		volume: 100,
		fullscreen: false,
		mute: false,
		width: 480,
		height: 320,
		duration: 0,
		source: 0,
		buffer: 0,
		// I hate javascript
		//state: $.fn.jwplayer.states.IDLE
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
/**
 * Core component of the JW Player (initialization, API).
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			$.fn.jwplayerUtils.log("setup", this);
			var model = $.fn.jwplayerModel($(this), options);
			var player = {
				model: model
			};
			players[model.config.id] = player;
			player = $.extend(player, api(player));
			$.fn.jwplayerView(player);
			$.fn.jwplayerModel.setActiveMediaProvider(player);
 			$.fn.jwplayerSkinner(player, function() {
				finishSetup(player);
			});
		});
	};
	
	function finishSetup(player) {
		$.fn.jwplayerControlbar($.jwplayer(player.id), player.model.domelement);
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_READY);
	}
	
	
	/** Map with all players on the page. **/
	var players = {};
	
	
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
		flashplayer:'http://developer.longtailvideo.com/player/trunk/html5/assets/player.swf'
	};
	
	
	/** Start playback or resume. **/
	function play(player) {
		return function() {
			$.fn.jwplayerController.play(player);
			return jwplayer(player.id);
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			$.fn.jwplayerController.pause(player);
			return jwplayer(player.id);
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(arg) {
			$.fn.jwplayerController.seek(player, arg);
			return jwplayer(player.id);
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			$.fn.jwplayerController.stop(player);
			return jwplayer(player.id);
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME, arg);
					break;
				case "number":
					$.fn.jwplayerController.volume(player, arg);
					break;
				case "string":
					$.fn.jwplayerController.volume(player, parseInt(arg, 10));
					break;
				default:
					return $.fn.jwplayerController.volume(player);
			}
			return jwplayer(player.id);
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, arg);
					break;
				case "boolean":
					$.fn.jwplayerController.mute(player, arg);
					break;
				default:
					return $.fn.jwplayerController.mute(player);
			}
			return jwplayer(player.id);
		};
	}
	
	/** Resizing the player **/
	function resize(player) {
		return function(arg1, arg2) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_RESIZE, arg);
					break;
				case "number":
					$.fn.jwplayerController.resize(player, arg1, arg2);
					break;
				default:
					break;
			}
			return jwplayer(player.id);
		};
	}
	
	/** Fullscreen the player **/
	function fullscreen(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_FULLSCREEN, arg);
					break;
				case "boolean":
					$.fn.jwplayerController.fullscreen(player, arg);
					break;
				default:
					return $.fn.jwplayerController.fullscreen(player);
			}
			return jwplayer(player.id);
		};
	}
	
	/** Adds a state listener **/
	function state(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player).state;
			}
			return jwplayer(player.id);
		};
	}
	
	/** Adds a buffer listener **/
	function buffer(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player).buffer;
			}
			return jwplayer(player.id);
		};
	}
	
	/** Returns the current time **/
	function time(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player).time;
			}
			return jwplayer(player.id);
		};
	}
	
	/** Loads a new video into the player **/
	function load(player) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_LOADED, arg);
					break;
				default:
					$.fn.jwplayerController.load(player, arg);
			}
			return jwplayer(player.id);
		};
	}
	
	/** Adds a listener for video completion **/
	function complete(player) {
		return function(arg) {
			addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE, arg);
			return jwplayer(player.id);
		};
	}
	
	/** Adds a listener for player ready **/
	function ready(player) {
		return function(arg) {
			addEventListener(player, $.fn.jwplayer.events.JWPLAYER_READY, arg);
			return jwplayer(player.id);
		};
	}
	
	/** Returns the duration **/
	function duration(player) {
		return function() {
			return $.fn.jwplayerController.mediaInfo(player).duration;
		};
	}
	
	/** Adds a listener for media errors. **/
	function error(player) {
		return function(arg) {
			addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_ERROR, arg);
			return jwplayer(player.id);
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
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_META, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player);
			}
			return jwplayer(player.id);
		};
	}
	
	/** Returns the API method for adding an event listener.**/
	function apiAddEventListener(player) {
		return function(type, listener) {
			addEventListener(player, type, listener);
		};
	}
	
	/** Returns the API method for adding an event listener.**/
	function apiRemoveEventListener(player) {
		return function(type, listener) {
			removeEventListener(player, type, listener);
		};
	}
	
	/** Add an event listener. **/
	function addEventListener(player, type, listener) {
		if (player.model.listeners[type] === undefined) {
			player.model.listeners[type] = [];
		}
		player.model.listeners[type].push(listener);
	}
	
	
	/** Remove an event listener. **/
	function removeEventListener(player, type, listener) {
		for (var lisenterIndex in player.model.listeners[type]) {
			if (player.model.listeners[type][lisenterIndex] == listener) {
				player.model.listeners[type].slice(lisenterIndex, lisenterIndex + 1);
				break;
			}
		}
	}
	
	/** Send an event **/
	function sendEvent(player) {
		return function(type, data) {
			data = $.extend({
				id: player.id,
				version: player.version
			}, data);
			//$.fn.jwplayerUtils.log(type, data);
			for (var listener in player.model.listeners[type]) {
				player.model.listeners[type][listener](data);
			}
		};
	}
		
	
	function api(player) {
		if (!$.fn.jwplayerUtils.isNull(player.id)){
			return player;
		}
		return {
			id: player.model.config.id,
			buffer: buffer(player),
			duration: duration(player),
			complete: complete(player),
			fullscreen: fullscreen(player),
			height: buffer(player),
			load: load(player),
			meta: meta(player),
			mute: mute(player),
			pause: pause(player),
			play: play(player),
			resize: resize(player),
			ready: ready(player),
			seek: seek(player),
			state: state(player),
			stop: stop(player),
			time: time(player),
			volume: volume(player),
			width: width(player),
			skin: player.skin,
			config: player.model.config,
			addEventListener: apiAddEventListener(player),
			removeEventListener: apiRemoveEventListener(player),
			sendEvent: sendEvent(player),
			version: '0.1-alpha'
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
	
	/** Automatically initializes the player for all <video> tags with the JWPlayer class. **/
	$(document).ready(function() {
		$("video.jwplayer").jwplayer();
	});
	
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
			player.model.domelement[0].sendEvent("LOAD", path);
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
			interval: null
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
			player.model.state = newstate;
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
		if (player.model.duration === 0){
			player.model.duration = event.target.duration;
		}
		player.model.sources[player.model.source] = $.extend(player.model.sources[player.model.source], meta);
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_META, meta);
	}
	
	function positionHandler(event, player) {
		if (player.media.interval === null) {
			player.media.interval = window.setInterval(function() {
				positionHandler(event, player);
			}, 100);
		}
		if (player.model.duration  === 0){
			player.model.duration = event.target.duration;
		}
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, {
			position: event.target.currentTime,
			duration: event.target.duration
		});
	}
	
	function progressHandler(event, player) {
		var buffer;
		if (!isNaN(event.loaded / event.total)) {
			buffer = event.loaded / event.total * 100;
		} else if (player.model.domelement[0].buffered !== undefined) {
			buffer = player.model.domelement[0].buffered.end(0) / player.model.domelement[0].duration * 100;
		}
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, {
			'bufferPercent': buffer
		});
	}
	
	function errorHandler(event, player) {
		player.sendEvent($.fn.jwplayer.events.JWPLAYER_ERROR, {});
	}
	
	function play(player) {
		return function() {
			player.model.domelement[0].play();
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
			player.media.interval = null;
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
				player.css("width", window.width);
				player.css("height", window.height);
				player.sendEvent($.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
					width: width,
					hieght: height
				});
			} else {
				// TODO: exit fullscreen
			}
		};
	}
	
	/** Load a new video into the player. **/
	function load(player) {
		return function(path) {
			player.model.domelement[0].src = path;
		};
	}
})(jQuery);/**
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
		width: 480,
		height: 320,
		duration: 0
	};
	
	function createModel() {
		return {
			sources: {},
			listeners: {},
			state: $.fn.jwplayer.states.IDLE,
			source: 0,
			buffer: 0
		};
	}
	
	
	$.fn.jwplayerModel = function(domElement, options) {
		var model = createModel();
		model.config = $.fn.jwplayerParse(domElement[0], options);
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
	
	$.fn.jwplayerParse = function(player, options) {
		return $.extend(true, {}, $.fn.jwplayer.defaults, options, parseElement(player));
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
		if (!$.fn.jwplayerUtils.isNull($(domElement).attr('poster'))){
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
		player.model.domelement.jwplayerCSS({
			'position': 'absolute',
			'width': player.model.config.width,
			'height': player.model.config.height,
			'left': 0,
			'top': 0,
			'z-index': 0
		});
		player.model.domelement.before("<a href='" + $.fn.jwplayerUtils.getAbsolutePath(player.model.sources[player.model.source].file) + "'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + (player.model.height - 60) / 2 + "px; left:" + (player.model.width - 60) / 2 + "px; border:0;' /></a>");
		player.model.domelement.prev("a").jwplayerCSS({
			'display': 'block',
			'background': '#ffffff url(' + $.fn.jwplayerUtils.getAbsolutePath(player.model.config.image) + ') no-repeat center center',
			'width': player.model.width,
			'height': player.model.height,
			'position': 'relative',
			'left': 0,
			'top': 0,
			'z-index': 50
		});
		player.model.domelement.prev("a").click(function(evt) {
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (player.state() !== $.fn.jwplayer.states.PLAYING) {
				player.play();
			} else {
				player.pause();
			}
			
		});
		player.state(function(obj) {
			imageHandler(obj, player);
		});
	};
	
	function imageHandler(obj, player) {
		switch (obj.newstate) {
			case $.fn.jwplayer.states.IDLE:
				player.model.domelement.css("z-index", "0");
				player.model.domelement.prev("a").css("z-index", "50");
				break;
			case $.fn.jwplayer.states.PLAYING:
				player.model.domelement.prev("a").css("z-index", "0");
				player.model.domelement.css("z-index", "50");
				break;
		}
	}
	
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
