/**
 * jwplayerControlbar component of the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {


	/** Hooking the jwplayerControlbar up to jQuery. **/
	$.fn.jwplayerControlbar = function(player) {
		player.controlbar = $.extend({}, $.fn.jwplayerControlbar.defaults, player.controlbar);
		buildElements(player);
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
	
	
	/** Callbacks called by Flash players to update stats. **/
	$.fn.jwplayerControlbar.bufferHandler = function(obj) {	
		bufferHandler({
			id: obj.id,
			bufferPercent: obj.bufferPercent
		});
	};
	
	$.fn.jwplayerControlbar.muteHandler = function(obj) {
		muteHandler({
			id: obj.id,
			mute: obj.state
		});
	};
	
	$.fn.jwplayerControlbar.stateHandler = function(obj) {
		stateHandler({
			id: obj.id,
			state: obj.newstate.toLowerCase()
		});
	};
	
	$.fn.jwplayerControlbar.timeHandler = function(obj) {
		timeHandler({
			id: obj.id,
			position: obj.position,
			duration: obj.duration
		});
	};
	
	$.fn.jwplayerControlbar.volumeHandler = function(obj) {
		volumeHandler({
			id: obj.id,
			volume: obj.percentage
		});
	};
	
	
	/** Draw the jwplayerControlbar elements. **/
	function buildElements(player) {
		// Draw the background.
		player.model.domelement.parents(":first").append('<div id="' +player.id + '_jwplayerControlbar"></div>');
		$("#"+player.id + '_jwplayerControlbar').css('position', 'relative');
		$("#"+player.id + '_jwplayerControlbar').css('height', player.skin.controlbar.elements.background.height);
		$("#"+player.id + '_jwplayerControlbar').css('background', 'url(' + player.skin.controlbar.elements.background.src + ') repeat-x center left');
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
		var nam =player.id + '_' + element;
		$('#' +player.id + '_jwplayerControlbar').append('<div id="' + nam + '"></div>');
		$('#' + nam).css('position', 'absolute');
		$('#' + nam).css('top', 0);
		if (element.indexOf('Text') > 0) {
			$('#' + nam).html('00:00');
			$('#' + nam).css('font', player.controlbar.fontsize + 'px/' + (player.skin.controlbar.elements.background.height + 1) + 'px Arial,sans-serif');
			$('#' + nam).css('text-align', 'center');
			$('#' + nam).css('font-weight', 'bold');
			$('#' + nam).css('cursor', 'default');
			var wid = 14 + 3 * player.controlbar.fontsize;
			$('#' + nam).css('color', '#' + player.controlbar.fontcolor.substr(-6));
		} else if (element.indexOf('divider') === 0) {
			$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements.divider.src + ') repeat-x center left');
			var wid = player.skin.controlbar.elements.divider.width;
		} else {
			$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements[element].src + ') repeat-x center left');
			var wid = player.skin.controlbar.elements[element].width;
		}
		if (align == 'left') {
			$('#' + nam).css(align, player.controlbar.leftmargin);
			if (offset) {
				player.controlbar.leftmargin += wid;
			}
		} else if (align == 'right') {
			$('#' + nam).css(align, player.controlbar.rightmargin);
			if (offset) {
				player.controlbar.rightmargin += wid;
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
		buildHandler('muteButton', 'mute', player);
		buildHandler('unmuteButton', 'mute', player);
		buildHandler('fullscreenButton', 'fullscreen', player);
		buildHandler('normalscreenButton', 'fullscreen', player);
		
		addSliders(player);

		// Register events with the player.
		player.buffer($.fn.jwplayerControlbar.bufferHandler);
		player.state($.fn.jwplayerControlbar.stateHandler);
		player.time($.fn.jwplayerControlbar.timeHandler);
		player.mute($.fn.jwplayerControlbar.muteHandler);
		player.volume($.fn.jwplayerControlbar.volumeHandler);
		// Trigger a few events so the bar looks good on startup.
		fullscreenHandler(player);
		muteHandler(player);
		stateHandler(player);
		volumeHandler(player);
	}
	
	
	/** Set a single button handler. **/
	function buildHandler(element, handler, player) {
		var nam = player.id + '_' + element;
		$('#' + nam).css('cursor', 'pointer');
		if (handler == 'fullscreen') {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				player.fullscreen() = !player.fullscreen();
				fullscreenHandler(player);
			});
		} else {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				player[handler]();
			});
		}
	}
	
	
	/** Set the volume drag handler. **/
	function addSliders(player) {
		var bar = '#' +player.id + '_jwplayerControlbar';
		var trl = '#' +player.id + '_timeSliderRail';
		var vrl = '#' +player.id + '_volumeSliderRail';
		$(bar).css('cursor', 'hand');
		$(bar).mousedown(function(evt) {
			var xps = evt.pageX - $(bar).position().left;
			if (xps > $(trl).position().left && xps < $(trl).position().left + $(trl).width()) {
				player.controlbar.scrubber = 'time';
			} else if (xps > $(vrl).position().left && xps < $(vrl).position().left + $(vrl).width()) {
				player.controlbar.scrubber = 'volume';
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
			if (player.controlbar.scrubber == 'time') {
				var xps = evt.pageX - $(bar).position().left;
				$('#' +player.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function sliderUp(msx, player) {
		if (player.controlbar.scrubber == 'time') {
			var xps = msx - $('#' +player.id + '_timeSliderRail').position().left;
			var wid = $('#' +player.id + '_timeSliderRail').width();
			var pos = xps / wid * player.duration();
			if (pos < 0) {
				pos = 0;
			} else if (pos > player.controlbar.duration) {
				pos = player.controlbar.duration - 3;
			}
			player.seek(pos);
		} else if (player.controlbar.scrubber == 'volume') {
			var bar = $('#' +player.id + '_jwplayerControlbar').width();
			var brx = $('#' +player.id + '_jwplayerControlbar').position().left;
			var rig = $('#' +player.id + '_volumeSliderRail').css('right').substr(0, 2);
			var wid = player.skin.controlbar.elements.volumeSliderRail.width;
			var pct = Math.round((msx - bar - brx + 1 * rig + wid) / wid * 100);
			if (pct < 0) {
				pct = 0;
			} else if (pct > 100) {
				pct = 100;
			}
			player.volume(pct);
		}
		player.controlbar.scrubber = 'none';
	}
	
	
	/** Update the buffer percentage. **/
	function bufferHandler(event) {
		var player = $.jwplayer(event.id);
		if (event.bufferPercent === 0) {
			$('#' +player.id + '_timeSliderBuffer').css('display', 'none');
		} else {
			$('#' +player.id + '_timeSliderBuffer').css('display', 'block');
			var wid = $('#' +player.id + '_timeSliderRail').width();
			$('#' +player.id + '_timeSliderBuffer').css('width', Math.round(wid * event.bufferPercent / 100));
		}
	}
	
	
	/** Update the mute state. **/
	function muteHandler(event) {
		var player = $.jwplayer(event.id);
		if (event.mute) {
			$('#' +player.id + '_muteButton').css('display', 'none');
			$('#' +player.id + '_unmuteButton').css('display', 'block');
			$('#' +player.id + '_volumeSliderProgress').css('display', 'none');
		} else {
			$('#' +player.id + '_muteButton').css('display', 'block');
			$('#' +player.id + '_unmuteButton').css('display', 'none');
			$('#' +player.id + '_volumeSliderProgress').css('display', 'block');
		}
	}
	
	
	/** Update the playback state. **/
	function stateHandler(event) {
		var player = $.jwplayer(event.id);
		if (event.state == $.fn.jwplayer.states.BUFFERING || player.state() ==  $.fn.jwplayer.states.PLAYING) {
			$('#' +player.id + '_pauseButton').css('display', 'block');
			$('#' +player.id + '_playButton').css('display', 'none');
		} else {
			$('#' +player.id + '_pauseButton').css('display', 'none');
			$('#' +player.id + '_playButton').css('display', 'block');
		}
		if (player.state() ==  $.fn.jwplayer.states.IDLE) {
			timeHandler({
				id: player.id,
				position: 0
			});
		}
	}
	
	
	/** Update the playback time. **/
	function timeHandler(event) {
		var player = $.jwplayer(event.id);
		var wid = $('#' +player.id + '_timeSliderRail').width();
		var thb = $('#' +player.id + '_timeSliderThumb').width();
		var lft = $('#' +player.id + '_timeSliderRail').position().left;
		if (event.position === 0) {
			$('#' +player.id + '_timeSliderProgress').css('display', 'none');
			$('#' +player.id + '_timeSliderThumb').css('display', 'none');
		} else {
			$('#' +player.id + '_timeSliderProgress').css('display', 'block');
			$('#' +player.id + '_timeSliderProgress').css('width', Math.round(wid * event.position / event.duration));
			$('#' +player.id + '_timeSliderThumb').css('display', 'block');
			$('#' +player.id + '_timeSliderThumb').css('left', lft +
			Math.round((wid - thb) * event.position / event.duration));
			$('#' +player.id + '_durationText').html(timeFormat(event.duration));
		}
		$('#' +player.id + '_elapsedText').html(timeFormat(event.position));
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
	function fullscreenHandler(event) {
		var player = $.jwplayer(event.id);
		if (event.fullscreen) {
			//$('#' + options.div).css('position', 'absolute');
			//$('#' + options.div).css('left', 0);
			//$('#' + options.div).css('top', 0);
			//$('#' + options.div).css('height', '100%');
			//$('#' + options.div).css('width', '100%');
			$('#' +player.id + '_normalscreenButton').css('display', 'block');
			$('#' +player.id + '_fullscreenButton').css('display', 'none');
			$(window).resize(function() {
				resizeBar(player);
			});
		} else {
			//$('#' + options.div).css('position', 'relative');
			//$('#' + options.div).css('left', options.left);
			//$('#' + options.div).css('top', options.top);
			//$('#' + options.div).css('height', options.height);
			//$('#' + options.div).css('width', options.width);
			$('#' +player.id + '_normalscreenButton').css('display', 'none');
			$('#' +player.id + '_fullscreenButton').css('display', 'block');
			$(window).resize(null);
		}
		resizeBar(player);
		timeHandler(player);
		bufferHandler(player);
	}
	
	
	/** Resize the jwplayerControlbar. **/
	function resizeBar(player) {
		var lft = player.controlbar.left;
		var top = player.controlbar.top;
		var wid = player.model.config.width;
		var hei = $('#' +player.id + '_jwplayerControlbar').height();
		if (player.controlbar.position == 'over') {
			lft += 1 * player.controlbar.margin;
			top -= 1 * player.controlbar.margin + hei;
			wid -= 2 * player.controlbar.margin;
		}
		if (player.fullscreen()) {
			lft = player.controlbar.margin;
			top = $(window).height() - player.controlbar.margin - hei;
			wid = $(window).width() - 2 * player.controlbar.margin;
			$('#' +player.id + '_jwplayerControlbar').css('z-index', 99);
		} else {
			$('#' +player.id + '_jwplayerControlbar').css('z-index', 97);
		}
		$('#' +player.id + '_jwplayerControlbar').css('left', lft);
		$('#' +player.id + '_jwplayerControlbar').css('top', top);
		$('#' +player.id + '_jwplayerControlbar').css('width', wid);
		$('#' +player.id + '_timeSliderRail').css('width', wid - player.controlbar.leftmargin - player.controlbar.rightmargin);
	}
	
	
	/** Update the volume level. **/
	function volumeHandler(event) {
		var player = $.jwplayer(event.id);
		var rwd = $('#' +player.id + '_volumeSliderRail').width();
		var wid = Math.round(event.volume / 100 * rwd);
		var rig = $('#' +player.id + '_volumeSliderRail').css('right').substr(0, 2);
		$('#' +player.id + '_volumeSliderProgress').css('width', wid);
		$('#' +player.id + '_volumeSliderProgress').css('right', 1 * rig + rwd - wid);
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
		state: 'IDLE'
	};

	$.fn.jwplayerController = function() {
		return this.each(function() {
		});
	};
	
	
	$.fn.jwplayerController.play = function(player) {
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
		$.fn.jwplayerControlbar(player);
		player.sendEvent("JWPLAYER_READY");
	}
	
	
	/** Map with all players on the page. **/
	var players = {};
	
	
	/** Map with config for the controlbar plugin. **/
	$.fn.jwplayer.defaults = {
		autostart: false,
		file: undefined,
		height: 300,
		image: undefined,
		skin: 'assets/five/five.xml',
		volume: 100,
		width: 400,
		flashplayer: 'assets/player.swf'
	};
	
	
	/** Start playback or resume. **/
	function play(player) {
		return function() {
			$.fn.jwplayerController.play(player);
			return jwplayer(player);
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			$.fn.jwplayerController.pause(player);
			return jwplayer(player);
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(arg) {
			$.fn.jwplayerController.seek(player, arg);
			return jwplayer(player);
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			$.fn.jwplayerController.stop(player);
			return jwplayer(player);
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
			return jwplayer(player);
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player, state) {
		return function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, arg);
					break;
				case "boolean":
					$.fn.jwplayerController.mute(player, arg);
					break;
				default:
					$.fn.jwplayerController.mute(player);
					break;
			}
			return jwplayer(player);
		};
	}
	
	/** Resizing the player **/
	function resize(player, state) {
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
			return jwplayer(player);
		};
	}
	
	/** Fullscreen the player **/
	function fullscreen(player, state) {
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
			return jwplayer(player);
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
					$.fn.jwplayerUtils.log("mediainfo", $.fn.jwplayerController.mediaInfo(player));
					return $.fn.jwplayerController.mediaInfo(player).state;
			}
			return jwplayer(player);
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
			return jwplayer(player);
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
			return jwplayer(player);
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
			return jwplayer(player);
		};
	}
	
	/** Adds a listener for video completion **/
	function complete(player) {
		return function(arg) {
			addEventListener(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_COMPLETE, arg);
			return jwplayer(player);
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
			return jwplayer(player);
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
			return jwplayer(player);
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
			for (var listener in player.model.listeners[type]) {
				player.model.listeners[type][listener](data);
			}
		};
	}
	
	function api(player) {
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
			seek: seek(player),
			state: state(player),
			stop: stop(player),
			time: time(player),
			volume: volume(player),
			width: width(player),
			addEventListener: apiAddEventListener(player),
			removeEventListener: apiRemoveEventListener(player),
			sendEvent: sendEvent(player),
			version: '0.1-alpha'
		};
	}
	
	function jwplayer(selector) {
		if (selector === undefined) {
			for (var player in players) {
				return players[player];
			}
		} else {
			return players[selector];
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
				stateHandler(event, player);
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
				player.model.domelement[0].sendEvent("PLAY");
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
			mediaInfo: mediaInfo(player),
			state: $.fn.jwplayer.states.IDLE,
			interval: null
		};
		player.media = media;
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
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
		}
		if (newstate == $.fn.jwplayer.states.IDLE) {
			clearInterval(player.media.interval);
			player.media.interval = null;
		}
	}
	
	function metaHandler(event, player) {
		var meta = {
			height: event.target.videoHeight,
			width: event.target.videoWidth,
			duration: event.target.duration
		};
		player.model = $.extend(player.model, meta);
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_META, meta);
	}
	
	function positionHandler(event, player) {
		if (player.media.interval === null) {
			player.media.interval = window.setInterval(function() {
				positionHandler(event, player);
			}, 100);
		}
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_TIME, {
			position: event.target.currentTime,
			duration: event.target.duration
		});
	}
	
	function progressHandler(event, player) {
		var buffer;
		if (!isNaN(event.loaded / event.total)) {
			buffer = event.loaded / event.total * 100;
		} else if (player.model.domelement.buffered !== undefined) {
			buffer = player.model.domelement.buffered.end(0) / player.model.domelement.duration * 100;
		}
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_BUFFER, {
			'bufferPercent': buffer
		});
	}
	
	function errorHandler(event, player) {
		sendEvent(player, $.fn.jwplayer.events.JWPLAYER_ERROR, {});
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
			player.model.domelement[0].volume = position / 100;
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_VOLUME, {
				volume: player.model.domelement[0].volume
			});
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			player.model.domelement[0].muted = state;
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_MUTE, {
				mute: player.model.domelement[0].muted
			});
		};
	}
	
	/** Resize the player. **/
	function resize(player) {
		return function(width, height) {
			player.css("width", width);
			player.css("height", height);
			sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
				width: width,
				hieght: height
			});
		};
	}
	
	/** Switch the fullscreen state of the player. **/
	function fullscreen(player) {
		return function(state) {
			if (state === true) {
				player.css("width", window.width);
				player.css("height", window.height);
				sendEvent(player, $.fn.jwplayer.events.JWPLAYER_MEDIA_RESIZE, {
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
	
	function sendEvent(player, type, data) {
		player.sendEvent(type, $.extend({
			id: player.model.config.id,
			version: player.version
		}, data));
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
	
	var modelParams ={
		volume: 100,
		fullscreen: false,
		mute: false,
		width: 480,
		height: 320,
		duration: 0
	};
	
	function createModel(){
		return {
			config: {},
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
		if (model.config.id === undefined) {
			model.config.id = "jwplayer_"+jwplayerid++;
		}
		model.sources = model.config.sources;
		delete model.config.sources;
		model.domelement = domElement;
		for (var modelParam in modelParams) {
			if (model.config[modelParam] !== undefined) {
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
				source.type = 'video/' + $.fn.jwplayerUtils.extension(source.file) + ';';
			}
			if ($.fn.jwplayerUtils.supportsType(source.type)) {
				player.model.source = sourceIndex
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
		return parseMediaElement(domElement, attributes);
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
	load = function (player, completeHandler){
		$.get(player.model.config.skin, {}, function(xml) {
			var skin = {
				properties:{},
				incompleteElements: 0
			};
			var components = $('component', xml);
			for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
				var componentName = $(components[componentIndex]).attr('name');
				var component = {
					settings:{}, 
					elements:{}
				};
				var elements = $(components[componentIndex]).find('element');
				for (var elementIndex = 0; elementIndex < elements.length; elementIndex++){
					skin.incompleteElements++;
					loadImage(elements[elementIndex], componentName, player, completeHandler);
				}
				var settings = $(components[componentIndex]).find('setting');
				for (var settingIndex = 0; settingIndex < settings.length; settingIndex++){
					component.settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
				}
				skin[componentName] = component;
			}
			player.skin = skin;
		});
	};
	
	/** Load the data for a single element. **/
	function loadImage(element, component, player, completeHandler) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var skinUrl = player.model.config.skin.substr(0,  player.model.config.skin.lastIndexOf('/'));
		$(img).error(function() {
			player.skin.incompleteElements--;
		});
		$(img).load(function() {
			player.skin[component].elements[elementName] = {
				height: this.height,
				width: this.width,
				src: this.src
			};
			player.skin.incompleteElements--;
			if (player.skin.incompleteElements === 0) {
				completeHandler();
			}
		});
		img.src = [skinUrl, component, elementSource].join("/");
	}
	
	$.fn.jwplayerSkinner.hasComponent = function (player, component){
		return (player.skin[component] !== null);
	};
	
	
	$.fn.jwplayerSkinner.getSkinElement = function (player, component, element){
		try {
			return player.skin[component].elements[element];
		} catch (err) {
			$.fn.jwplayerUtils.log("No such skin component / element: ", [player, component, element]);
		}
		return null;
	};

	
	$.fn.jwplayerSkinner.addSkinElement = function (player, component, name, element){
		try {
			player.skin[component][name] = element;
		} catch (err){
			$.fn.jwplayerUtils.log("No such skin component ", [player, component]);
		}
	};
	
	$.fn.jwplayerSkinner.getSkinProperties = function (player){
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

	var styleString = "style='left:0px;top:0px;position:absolute;z-index:0;'";
	var embedString = "<embed %elementvars% src='%flashplayer%' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' %style% />";
	var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars%' %style%> <param name='movie' value='%flashplayer%'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
	var elementvars = {
		width: true,
		height: true,
		id: true,
		name: true,
		className: true
	};
	
	$.fn.jwplayerView = function(player) {
		/*if (!(($(this).attr("src") === undefined) || ($(this).attr("src") === ""))) {
			$(this).attr("preload", "metadata");
			$(this).append('<source src="' + $(this).attr("src") + '" >');
			$(this).removeAttr("src");
		}*/
		player.model.domelement.wrap("<div id='" + player.model.config.id + "_jwplayer' />");
		player.model.domelement.parent().css("position", "relative");
		//$(this).css("display", "none");
		player.model.domelement.css("position", "absolute");
		player.model.domelement.css("left", "0px");
		player.model.domelement.css("top", "0px");
		player.model.domelement.css("z-index", "0");
		player.model.domelement.before("<a href='" + player.model.sources[player.model.source].file + "' style='display:block; background:#ffffff url(" + player.model.config.image + ") no-repeat center center;width:" + player.model.width + "px;height:" + player.model.height + "px;position:relative;'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + (player.model.height - 60) / 2 + "px; left:" + (player.model.width - 60) / 2 + "px; border:0;' /></a>");
		player.model.domelement.prev("a").css("position", "relative");
		player.model.domelement.prev("a").css("z-index", "100");
		player.model.domelement.prev("a").click(function(evt) {
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C 
			} else {
				evt.returnValue = false; // IE 
			}
			if (player.state() !== $.fn.jwplayer.states.PLAYING){
				player.play();
			} else {
				player.pause();
			}
			 
		});
		$.jwplayer(player.model.config.id).state(function(obj) {
			imageHandler(obj, player);
		});
	};
	
	function imageHandler(obj, player) {
		switch (obj.newstate) {
			case $.fn.jwplayer.states.IDLE:
				player.model.domelement.css("z-index", "0");
				player.model.domelement.prev("a").css("z-index", "100");
				break;
			case $.fn.jwplayer.states.PLAYING:
				player.model.domelement.prev("a").css("z-index", "0");
				player.model.domelement.css("z-index", "100");
				break;
		}
	}
	
	$.fn.jwplayerView.switchMediaProvider = function(){
		
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
					elementvarString += elementvar + "='" + player.model.config[elementvar] + "'";
				}
			}
			flashvarString += "file=" + player.model.sources[player.model.source].file + "&";
			var config = $.extend(true, {}, player.model.config, options);
			for (var flashvar in config) {
				if (!((config[flashvar] === undefined) || (config[flashvar] === "") || (config[flashvar] === null))) {
						flashvarString += flashvar + "=" + config[flashvar] + "&";
				}
			}
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", player.model.config.flashplayer);
			htmlString = htmlString.replace("%style%", styleString);
			player.model.domelement.before(htmlString);
			var oldDOMElement = player.model.domelement;
			player.model.domelement = player.model.domelement.prev();
			oldDOMElement.remove();
		}
	};
	
	
})(jQuery);
