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
	$.fn.jwplayerControlbar = function(ops) {
		return this.each(function() {
			var id = $(this)[0].id;
			var div = $('#' + id).parents()[0].id;
			//$($('#' + id).parents()[0]).append('<div id="' + div + '">');
			var player = document.getElementById(id);
			var options = $.extend({}, $.fn.jwplayerControlbar.defaults, ops);
			$.extend(options, $('#' + id).data("model"));
			// Add positioning options and change the player css, so we can full-browser-screen it.
			$.extend(options, {
				id: id,
				div: div,
				left: 0,
				top: 0
			});
			// Save the variables globally and start loading the skin.
			config = {
				player: player,
				options: options,
				images: $(player).data("skin").controlbar.elements
			};
			$.fn.jwplayerControlbar.bars[id] = config;
			buildElements(config);
			buildHandlers(config);
		});
	};
	
	
	/** Map with all jwplayerControlbars. **/
	$.fn.jwplayerControlbar.bars = {};
	
	
	/** Map with config for the jwplayerControlbar plugin. **/
	$.fn.jwplayerControlbar.defaults = {
		buffer: 0,
		div: 'container',
		duration: 0,
		elapsed: 0,
		fontsize: 10,
		fontcolor: '000000',
		fullscreen: false,
		id: 'player',
		images: 0,
		position: 'bottom',
		skin: 'assets/five/five.xml',
		width: 400,
		height: 300,
		left: 0,
		leftmargin: 0,
		top: 0,
		rightmargin: 0,
		scrubber: 'none',
		state: 'idle',
		volume: 100
	};
	
	
	/** Callbacks called by Flash players to update stats. **/
	$.fn.jwplayerControlbar.bufferHandler = function(event, obj) {
		bufferHandler({
			id: obj.id,
			bufferPercent: obj.bufferPercent
		});
	};
	$.fn.jwplayerControlbar.muteHandler = function(event, obj) {
		muteHandler({
			id: obj.id,
			mute: obj.state
		});
	};
	$.fn.jwplayerControlbar.stateHandler = function(event, obj) {
		stateHandler({
			id: obj.id,
			state: obj.newstate.toLowerCase()
		});
	};
	$.fn.jwplayerControlbar.timeHandler = function(event, obj) {
		timeHandler({
			id: obj.id,
			elapsed: obj.position,
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
	function buildElements(config) {
		// Draw the background.
		$('#' + config.options.div).append('<div id="' + config.options.id + '_jwplayerControlbar"></div>');
		$('#' + config.options.id + '_jwplayerControlbar').css('position', 'relative');
		$('#' + config.options.id + '_jwplayerControlbar').css('height', config.images.background.height);
		$('#' + config.options.id + '_jwplayerControlbar').css('background', 'url(' + config.images.background.src + ') repeat-x center left');
		// Draw all elements on top of the bar.
		buildElement('capLeft', 'left', true, config);
		buildElement('playButton', 'left', false, config);
		buildElement('pauseButton', 'left', true, config);
		buildElement('divider1', 'left', true, config);
		buildElement('elapsedText', 'left', true, config);
		buildElement('timeSliderRail', 'left', false, config);
		buildElement('timeSliderBuffer', 'left', false, config);
		buildElement('timeSliderProgress', 'left', false, config);
		buildElement('timeSliderThumb', 'left', false, config);
		buildElement('capRight', 'right', true, config);
		buildElement('fullscreenButton', 'right', false, config);
		buildElement('normalscreenButton', 'right', true, config);
		buildElement('divider2', 'right', true, config);
		buildElement('volumeSliderRail', 'right', false, config);
		buildElement('volumeSliderProgress', 'right', true, config);
		buildElement('muteButton', 'right', false, config);
		buildElement('unmuteButton', 'right', true, config);
		buildElement('divider3', 'right', true, config);
		buildElement('durationText', 'right', true, config);
	}
	
	
	/** Draw a single element into the jwplayerControlbar. **/
	function buildElement(element, align, offset, config) {
		var nam = config.options.id + '_' + element;
		$('#' + config.options.id + '_jwplayerControlbar').append('<div id="' + nam + '"></div>');
		$('#' + nam).css('position', 'absolute');
		$('#' + nam).css('top', 0);
		if (element.indexOf('Text') > 0) {
			$('#' + nam).html('00:00');
			$('#' + nam).css('font', config.options.fontsize + 'px/' + (config.images.background.height + 1) + 'px Arial,sans-serif');
			$('#' + nam).css('text-align', 'center');
			$('#' + nam).css('font-weight', 'bold');
			$('#' + nam).css('cursor', 'default');
			var wid = 14 + 3 * config.options.fontsize;
			$('#' + nam).css('color', '#' + config.options.fontcolor.substr(-6));
		} else if (element.indexOf('divider') === 0) {
			$('#' + nam).css('background', 'url(' + config.images.divider.src + ') repeat-x center left');
			var wid = config.images.divider.width;
		} else {
			$('#' + nam).css('background', 'url(' + config.images[element].src + ') repeat-x center left');
			var wid = config.images[element].width;
		}
		if (align == 'left') {
			$('#' + nam).css(align, config.options.leftmargin);
			if (offset) {
				config.options.leftmargin += wid;
			}
		} else if (align == 'right') {
			$('#' + nam).css(align, config.options.rightmargin);
			if (offset) {
				config.options.rightmargin += wid;
			}
		}
		$('#' + nam).css('width', wid);
		$('#' + nam).css('height', config.images.background.height);
	}
	
	
	/** Add interactivity to the jwplayerControlbar elements. **/
	function buildHandlers(config) {
		// Register events with the buttons.
		buildHandler('playButton', 'play', config.player, config.options);
		buildHandler('pauseButton', 'pause', config.player, config.options);
		buildHandler('muteButton', 'mute', config.player, config.options);
		buildHandler('unmuteButton', 'mute', config.player, config.options);
		buildHandler('fullscreenButton', 'fullscreen', config.player, config.options);
		buildHandler('normalscreenButton', 'fullscreen', config.player, config.options);
		/*
		 addSliders(options);
		 */
		// Register events with the player.
		$.jwplayer("#" + config.player.id).buffer($.fn.jwplayerControlbar.bufferHandler);
		$.jwplayer("#" + config.player.id).state($.fn.jwplayerControlbar.stateHandler);
		$.jwplayer("#" + config.player.id).time($.fn.jwplayerControlbar.timeHandler);
		$.jwplayer("#" + config.player.id).mute($.fn.jwplayerControlbar.muteHandler);
		$.jwplayer("#" + config.player.id).volume($.fn.jwplayerControlbar.volumeHandler);
		// Trigger a few events so the bar looks good on startup.
		fullscreenHandler(config.options);
		muteHandler(config.options);
		stateHandler(config.options);
		volumeHandler(config.options);
	}
	
	
	/** Set a single button handler. **/
	function buildHandler(element, handler, player, options) {
		var nam = options.id + '_' + element;
		$('#' + nam).css('cursor', 'pointer');
		if (handler == 'fullscreen') {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				options.fullscreen = !options.fullscreen;
				fullscreenHandler(options);
			});
		} else {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				player[handler]();
			});
		}
	}
	
	
	/** Set the volume drag handler. **/
	function addSliders() {
		var bar = '#' + config.id + '_jwplayerControlbar';
		var trl = '#' + config.id + '_timeSliderRail';
		var vrl = '#' + config.id + '_volumeSliderRail';
		$(bar).css('cursor', 'hand');
		$(bar).mousedown(function(evt) {
			var xps = evt.pageX - $(bar).position().left;
			if (xps > $(trl).position().left && xps < $(trl).position().left + $(trl).width()) {
				config.scrubber = 'time';
			} else if (xps > $(vrl).position().left && xps < $(vrl).position().left + $(vrl).width()) {
				config.scrubber = 'volume';
			}
		});
		$(bar).mouseup(function(evt) {
			evt.stopPropagation();
			sliderUp(evt.pageX);
		});
		$(bar).mouseleave(function(evt) {
			sliderUp(evt.pageX);
			evt.stopPropagation();
		});
		$(bar).mousemove(function(evt) {
			if (config.scrubber == 'time') {
				var xps = evt.pageX - $(bar).position().left;
				$('#' + config.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function sliderUp(msx) {
		if (config.scrubber == 'time') {
			var xps = msx - $('#' + config.id + '_timeSliderRail').position().left;
			var wid = $('#' + config.id + '_timeSliderRail').width();
			var pos = xps / wid * config.duration;
			if (pos < 0) {
				pos = 0;
			} else if (pos > config.duration) {
				pos = config.duration - 3;
			}
			player.seek(pos);
		} else if (config.scrubber == 'volume') {
			var bar = $('#' + config.id + '_jwplayerControlbar').width();
			var brx = $('#' + config.id + '_jwplayerControlbar').position().left;
			var rig = $('#' + config.id + '_volumeSliderRail').css('right').substr(0, 2);
			var wid = config.images.volumeSliderRail.width;
			var pct = Math.round((msx - bar - brx + 1 * rig + wid) / wid * 100);
			if (pct < 0) {
				pct = 0;
			} else if (pct > 100) {
				pct = 100;
			}
			player.volume(pct);
		}
		config.scrubber = 'none';
	}
	
	
	
	
	/** Update the buffer percentage. **/
	function bufferHandler(options) {
		if (options.bufferPercent === 0) {
			$('#' + options.id + '_timeSliderBuffer').css('display', 'none');
		} else {
			$('#' + options.id + '_timeSliderBuffer').css('display', 'block');
			var wid = $('#' + options.id + '_timeSliderRail').width();
			$('#' + options.id + '_timeSliderBuffer').css('width', Math.round(wid * options.bufferPercent / 100));
		}
	}
	
	
	/** Update the mute state. **/
	function muteHandler(options) {
		if (options.mute) {
			$('#' + options.id + '_muteButton').css('display', 'none');
			$('#' + options.id + '_unmuteButton').css('display', 'block');
			$('#' + options.id + '_volumeSliderProgress').css('display', 'none');
		} else {
			$('#' + options.id + '_muteButton').css('display', 'block');
			$('#' + options.id + '_unmuteButton').css('display', 'none');
			$('#' + options.id + '_volumeSliderProgress').css('display', 'block');
		}
	}
	
	
	/** Update the playback state. **/
	function stateHandler(options) {
		if (options.state == 'buffering' || options.state == 'playing') {
			$('#' + options.id + '_pauseButton').css('display', 'block');
			$('#' + options.id + '_playButton').css('display', 'none');
		} else {
			$('#' + options.id + '_pauseButton').css('display', 'none');
			$('#' + options.id + '_playButton').css('display', 'block');
		}
		if (options.state == 'idle') {
			options.elapsed = 0;
			timeHandler(options);
		}
	}
	
	
	/** Update the playback time. **/
	function timeHandler(options) {
		var wid = $('#' + options.id + '_timeSliderRail').width();
		var thb = $('#' + options.id + '_timeSliderThumb').width();
		var lft = $('#' + options.id + '_timeSliderRail').position().left;
		if (options.elapsed === 0) {
			$('#' + options.id + '_timeSliderProgress').css('display', 'none');
			$('#' + options.id + '_timeSliderThumb').css('display', 'none');
		} else {
			$('#' + options.id + '_timeSliderProgress').css('display', 'block');
			$('#' + options.id + '_timeSliderProgress').css('width', Math.round(wid * options.elapsed / options.duration));
			$('#' + options.id + '_timeSliderThumb').css('display', 'block');
			$('#' + options.id + '_timeSliderThumb').css('left', lft +
			Math.round((wid - thb) * options.elapsed / options.duration));
			$('#' + options.id + '_durationText').html(timeFormat(options.duration));
		}
		$('#' + options.id + '_elapsedText').html(timeFormat(options.elapsed));
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
	function fullscreenHandler(options) {
		if (options.fullscreen) {
			//$('#' + options.div).css('position', 'absolute');
			//$('#' + options.div).css('left', 0);
			//$('#' + options.div).css('top', 0);
			//$('#' + options.div).css('height', '100%');
			//$('#' + options.div).css('width', '100%');
			$('#' + options.id + '_normalscreenButton').css('display', 'block');
			$('#' + options.id + '_fullscreenButton').css('display', 'none');
			$(window).resize(function() {
				resizeBar(options);
			});
		} else {
			//$('#' + options.div).css('position', 'relative');
			//$('#' + options.div).css('left', options.left);
			//$('#' + options.div).css('top', options.top);
			//$('#' + options.div).css('height', options.height);
			//$('#' + options.div).css('width', options.width);
			$('#' + options.id + '_normalscreenButton').css('display', 'none');
			$('#' + options.id + '_fullscreenButton').css('display', 'block');
			$(window).resize(null);
		}
		resizeBar(options);
		timeHandler(options);
		bufferHandler(options);
	}
	
	
	/** Resize the jwplayerControlbar. **/
	function resizeBar(options) {
		var lft = options.left;
		var top = options.top;
		var wid = options.width;
		var hei = $('#' + options.id + '_jwplayerControlbar').height();
		if (options.position == 'over') {
			lft += 1 * options.margin;
			top -= 1 * options.margin + hei;
			wid -= 2 * options.margin;
		}
		if (options.fullscreen) {
			lft = options.margin;
			top = $(window).height() - options.margin - hei;
			wid = $(window).width() - 2 * options.margin;
			$('#' + options.id + '_jwplayerControlbar').css('z-index', 99);
		} else {
			$('#' + options.id + '_jwplayerControlbar').css('z-index', 97);
		}
		$('#' + options.id + '_jwplayerControlbar').css('left', lft);
		$('#' + options.id + '_jwplayerControlbar').css('top', top);
		$('#' + options.id + '_jwplayerControlbar').css('width', wid);
		$('#' + options.id + '_timeSliderRail').css('width', wid - options.leftmargin - options.rightmargin);
	}
	
	
	/** Update the volume level. **/
	function volumeHandler(options) {
		var rwd = $('#' + options.id + '_volumeSliderRail').width();
		var wid = Math.round(options.volume / 100 * rwd);
		var rig = $('#' + options.id + '_volumeSliderRail').css('right').substr(0, 2);
		$('#' + options.id + '_volumeSliderProgress').css('width', wid);
		$('#' + options.id + '_volumeSliderProgress').css('right', 1 * rig + rwd - wid);
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

	$.fn.jwplayerController = function() {
		return this.each(function() {
		});
	};
	
	
	$.fn.jwplayerController.play = function(player) {
		try {
			player.data("media").play();
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayerController.pause = function(player) {
		try {
			player.data("media").pause();
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayerController.seek = function(player, position) {
		try {
			player.data("media").seek(position);
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
			
		}
		return false;
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayerController.stop = function(player) {
		try {
			player.data("media").stop();
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
				return $(player).data("model").volume;
			} else {
				player.data("media").volume(position);
				$(player).data("model").volume = position;
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
				return $(player).data("model").mute;
			} else {
				player.data("media").mute(state);
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
			if (position === undefined) {
				return $(player).data("model").fullscreen;
			} else {
				player.data("media").fullscreen(state);
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
			player.data("media").resize(width, height);
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Returns the meta **/
	$.fn.jwplayerController.mediaInfo = function(player) {
		try {
			player.data("media").mediaInfo();
			return true;
		} catch (err) {
			$.fn.jwplayerUtils.log("error", err);
		}
		return false;
	};
	
	/** Loads a new video **/
	$.fn.jwplayerController.load = function(player, path) {
		try {
			player.data("media").load(path);
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

	function jwplayer(selector) {
		if (selector === undefined) {
			selector = ".jwplayer:first";
		}
		if ($.fn.jwplayerUtils.typeOf(selector) == "string") {
			selector = $(selector);
		}
		return {
			buffer: buffer(selector),
			duration: duration(selector),
			complete: complete(selector),
			fullscreen: fullscreen(selector),
			height: buffer(selector),
			load: load(selector),
			meta: meta(selector),
			mute: mute(selector),
			pause: pause(selector),
			play: play(selector),
			resize: resize(selector),
			seek: seek(selector),
			state: state(selector),
			stop: stop(selector),
			time: time(selector),
			volume: volume(selector),
			width: width(selector),
			addEventListener: apiAddEventListener(selector),
			removeEventListener: apiRemoveEventListener(selector),
			events: events
		};
	}
	
	var events = {
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
		JWPLAYER_RESIZE: 'jwplayerResize',
		//JWPLAYER_LOCKED: 'jwplayerLocked',
		//JWPLAYER_UNLOCKED: 'jwplayerLocked',
		//JWPLAYER_ERROR: 'jwplayerError',
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
	
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			var player = $(this);
			player.jwplayerModel(options);
			player.jwplayerView();
			$.fn.jwplayerModel.setActiveMediaProvider(player);
			$("#"+player[0].id).jwplayerSkinner(function() {
				finishSetup(player);
			});
		});
	};
	
	function finishSetup(player) {
		player.jwplayerControlbar();
		player.trigger("JWPLAYER_READY", {
			id: player[0].id
		});
	}
	
	
	/** Map with all players on the page. **/
	$.fn.jwplayer.players = {};
	
	
	/** Map with config for the controlbar plugin. **/
	$.fn.jwplayer.defaults = {
		autostart: false,
		duration: 0,
		file: undefined,
		height: 300,
		image: undefined,
		skin: 'assets/five/five.xml',
		volume: 100,
		width: 400,
		source: 0,
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_VOLUME, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_MUTE, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_RESIZE, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_FULLSCREEN, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_PLAYER_STATE, arg);
					break;
				default:
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_BUFFER, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_TIME, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_LOADED, arg);
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
			addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_COMPLETE, arg);
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
			addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_ERROR, arg);
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
					addEventListener(player, $.jwplayer().events.JWPLAYER_MEDIA_META, arg);
					break;
				default:
					return $.fn.jwplayerController.mediaInfo(player);
			}
			return jwplayer(player);
		};
	}
	
	/** Returns the API method for adding an event listener.**/
	function apiAddEventListener(player) {
		return function(event, listener) {
			addEventListener(player, event, listener);
		};
	}

	/** Returns the API method for adding an event listener.**/
	function apiRemoveEventListener(player) {
		return function(event, listener) {
			removeEventListener(player, event, listener);
		};
	}
	
	/** Add an event listener. **/
	function addEventListener(player, event, listener) {
		$(player).bind(event, listener);
	}
	
	
	/** Remove an event listener. **/
	function removeEventListener(player, event, listener) {
		$(player).unbind(event, listener);
	}
	
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
/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {
	var states = {
		"buffering": "buffering",
		"ended": "idle",
		"playing": "playing",
		"pause": "paused"
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
		'timeupdate': generalHandler,
		'volumechange': generalHandler,
		'waiting': stateHandler,
		'canshowcurrentframe': generalHandler,
		'dataunavailable': generalHandler,
		'empty': generalHandler,
		'load': generalHandler,
		'loadedfirstframe': generalHandler
	};
	
	
	$.fn.jwplayerMediaVideo = function(options) {
		return this.each(function() {
			var video = $(this);
			var media = {
				play: play(video),
				pause: pause(video),
				seek: seek(video),
				stop: stop(video),
				volume: volume(video),
				mute: mute(video),
				fullscreen: fullscreen(video),
				load: load(video),
				state: "idle",
				interval: null
			};
			video.data("media", media);
			$.each(events, function(event, handler) {
				video[0].addEventListener(event, handler, true);
			});
		});
	};
	
	function generalHandler(event) {
		//$.fn.jwplayerUtils.log("general:" + event.type);
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
			sendEvent($(player), $.jwplayer().events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldState,
				newstate: newState
			});
		}
		if (newState == 'idle') {
			clearInterval($(player).data("media").interval);
			$(player).data("media").interval = null;
		}
	}
	
	function metaHandler(event) {
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_MEDIA_META, {
			videoHeight: event.target.videoHeight,
			videoWidth: event.target.videoWidth,
			duration: event.target.duration
		});
	}
	
	function positionHandler(event) {
		if ($(event.target).data("media").interval === null) {
			$(event.target).data("media").interval = window.setInterval(function() {
				positionHandler(event);
			}, 100);
		}
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_MEDIA_TIME, {
			position: event.target.currentTime,
			duration: event.target.duration
		});
	}
	
	function progressHandler(event) {
		var buffer;
		if (!isNaN(event.loaded / event.total)) {
			buffer = event.loaded / event.total * 100;
		} else if (event.target.buffered !== undefined) {
			buffer = event.target.buffered.end(0) / event.target.duration * 100;
		}
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_MEDIA_BUFFER, {
			'bufferPercent': buffer
		});
	}
	
	function errorHandler(event) {
		sendEvent($(event.target), $.jwplayer().events.JWPLAYER_ERROR, {});
	}
	
	function play(player) {
		return function() {
			player[0].play();
		};
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return function() {
			player[0].pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return function(position) {
			player[0].currentTime = position;
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return function() {
			player[0].pause();
			player[0].currentTime = 0;
			clearInterval($(player).data("media").interval);
			$(player).data("media").interval = null;
			setState(player, 'idle');
		};
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return function(position) {
			player[0].volume = position / 100;
			sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_VOLUME, {
				volume: player[0].volume
			});
		};
	}
	
	/** Switch the mute state of the player. **/
	function mute(player) {
		return function(state) {
			player[0].muted = state;
			sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_MUTE, {
				mute: player[0].muted
			});
		};
	}
	
	/** Resize the player. **/
	function resize(player) {
		return function(width, height) {
			player.css("width", width);
			player.css("height", height);
			sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_RESIZE, {
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
				sendEvent(player, $.jwplayer().events.JWPLAYER_MEDIA_RESIZE, {
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
	
	function sendEvent(player, type, data) {
		player.trigger(type, $.extend({
			id: player[0].id,
			version: $.jwplayer(player).version
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

	$.fn.jwplayerModel = function(options) {
		return this.each(function() {
			$(this).jwplayerParse(options);
		});
	};
	
	$.fn.jwplayerModel.setActiveMediaProvider = function(player) {
		var source, sourceIndex;
		var model = player.data("model");
		for (sourceIndex in model.sources) {
			source = model.sources[sourceIndex];
			if (source.type === undefined) {
				source.type = 'video/' + $.fn.jwplayerUtils.extension(source.file) + ';';
			}
			if ($.fn.jwplayerUtils.supportsType(source.type)) {
				model.source = sourceIndex;
				player.jwplayerMediaVideo();
				return true;
			}
		}
		if ($.fn.jwplayerUtils.supportsFlash && model.state != 'playing') {
			for (sourceIndex in model.sources) {
				source = model.sources[sourceIndex];
				if ($.fn.jwplayerUtils.flashCanPlay(source.file)) {
					model.source = sourceIndex;
					player.jwplayerMediaFlash();
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
	
	$.fn.jwplayerParse = function(options) {
		return this.each(function() {
			$(this).data("model", $.extend(true, {}, $.fn.jwplayer.defaults, options, parseElement(this)));
		});
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
			configuration.screencolor = $(domElement).css("background-color");
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
	$.fn.jwplayerSkinner = function(completeHandler) {
		return this.each(function() {
			load($(this), completeHandler);
		});
	};
	
	/** Load the skin **/
	load = function (player, completeHandler){
		$.get(player.data("model").skin, {}, function(xml) {
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
			player.data("skin", skin);
		});
	};
	
	/** Load the data for a single element. **/
	function loadImage(element, component, player, completeHandler) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var skinUrl = player.data("model").skin.substr(0, player.data("model").skin.lastIndexOf('/'));
		$(img).error(function() {
			player.data("skin").incompleteElements--;
		});
		$(img).load(function() {
			player.data("skin")[component].elements[elementName] = {
				height: this.height,
				width: this.width,
				src: this.src
			};
			player.data("skin").incompleteElements--;
			if (player.data("skin").incompleteElements === 0) {
				completeHandler();
			}
		});
		img.src = [skinUrl, component, elementSource].join("/");
	}
	
	$.fn.jwplayerSkinner.hasComponent = function (player, component){
		return (player.data("skin")[component] !== null);
	};
	
	
	$.fn.jwplayerSkinner.getSkinElement = function (player, component, element){
		try {
			return player.data("skin")[component].elements[element];
		} catch (err) {
			$.fn.jwplayerUtils.log("No such skin component / element: ", [player, component, element]);
		}
		return null;
	};

	
	$.fn.jwplayerSkinner.addSkinElement = function (player, component, name, element){
		try {
			player.data("skin")[component][name] = element;
		} catch (err){
			$.fn.jwplayerUtils.log("No such skin component ", [player, component]);
		}
	};
	
	$.fn.jwplayerSkinner.getSkinProperties = function (player){
		return player.data("skin").properties;
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
	
	$.fn.jwplayerView = function() {
		return this.each(function() {
			var video = $(this);
			if ($(this).attr("src") !== "") {
				$(this).attr("preload", "metadata");
				$(this).append('<source src="' + $(this).attr("src") + '" >');
				$(this).removeAttr("src");
			}
			$(this).wrap("<div id='" + $(this)[0].id + "_jwplayer' />");
			$(this).parent().css("position", "relative");
			//$(this).css("display", "none");
			$(this).css("position", "absolute");
			$(this).css("left", "0px");
			$(this).css("top", "0px");
			$(this).css("z-index", "0");
			$(this).before("<a href='" + $(this).data("model").sources[$(this).data("model").source].file + "' style='display:block; background:#ffffff url(" + $(this).data("model").image + ") no-repeat center center;width:" + $(this).data("model").width + "px;height:" + $(this).data("model").height + "px;position:relative;'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + ($(this).data("model").height - 60) / 2 + "px; left:" + ($(this).data("model").width - 60) / 2 + "px; border:0;' /></a>");
			$(this).prev("a").css("position", "relative");
			$(this).prev("a").css("z-index", "100");
			$(this).prev("a").click(function(evt) {
				if (typeof evt.preventDefault != 'undefined') {
					evt.preventDefault(); // W3C 
				} else {
					evt.returnValue = false; // IE 
				}
				$.jwplayer(video).play();
			});
			$.jwplayer(video).state(imageHandler);
		});
	};
	
	function imageHandler(event, parameters) {
		$.fn.jwplayerUtils(event.target);
		switch (parameters.newstate) {
			case 'idle':
				$(event.target).css("z-index", "0");
				$(event.target).prev("a").css("z-index", "100");
				break;
			case 'playing':
				$(event.target).prev("a").css("z-index", "0");
				$(event.target).css("z-index", "100");
				break;
		}
	}
	
	/** Embeds a Flash Player at the specified location in the DOM. **/
	$.fn.jwplayerView.embedFlash = function(domElement, model) {
		if (model.flashplayer !== false) {
			var htmlString, elementvarString = "", flashvarString = "";
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				htmlString = embedString;
			} else {
				htmlString = objectString;
			}
			for (var elementvar in elementvars) {
				if (!((model[elementvar] === undefined) || (model[elementvar] === "") || (model[elementvar] === null))) {
					elementvarString += elementvar + "='" + model[elementvar] + "'";
				}
			}
			for (var flashvar in model) {
				if (!((model[flashvar] === undefined) || (model[flashvar] === "") || (model[flashvar] === null))) {
					if (flashvar == "sources") {
						flashvarString += "file=" + model.sources[model.source].file + "&";
					} else {
						flashvarString += flashvar + "=" + model[flashvar] + "&";
					}
				}
			}
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", model.flashplayer);
			htmlString = htmlString.replace("%style%", styleString);
			$(domElement).before(htmlString);
			var result = $(domElement).prev();
			$(domElement).remove();
			return result;
		}
	};
	
	
})(jQuery);
