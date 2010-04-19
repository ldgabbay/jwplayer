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
			var player = document.getElementById(id);
			var options = $.extend({}, $.fn.jwplayerControlbar.defaults, ops);
			//$.extend(options, player.getConfig());
			// Add positioning options and change the player css, so we can full-browser-screen it.
			$.extend(options, {
				id: id,
				div: div,
				left: $('#' + div).position().left,
				top: $('#' + div).position().top
			});
			$('#' + div).css('position', 'static');
			$('#' + div).css('z-index', '98');
			$('#' + div).css('height', options.height);
			$('#' + div).css('width', options.width);
			$('#' + id).css('width', '100%');
			$('#' + id).css('height', '100%');
			// Save the variables globally and start loading the skin.
			$.fn.jwplayerControlbar.bars[id] = {
				player: player,
				options: options,
				images: {}
			};
			loadSkin($.fn.jwplayerControlbar.bars[id]);
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
		skin: '././skins/five/five.xml',
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
	$.fn.jwplayerControlbar.bufferHandler = function(obj) {
		bufferHandler({
			id: obj.id,
			buffer: obj.percentage
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
		$('#' + config.options.div).after('<div id="' + config.options.id + '_jwplayerControlbar"></div>');
		$('#' + config.options.id + '_jwplayerControlbar').css('position', 'absolute');
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
		buildHandler('pauseButton', 'play', config.player, config.options);
		buildHandler('muteButton', 'mute', config.player, config.options);
		buildHandler('unmuteButton', 'mute', config.player, config.options);
		buildHandler('fullscreenButton', 'fullscreen', config.player, config.options);
		buildHandler('normalscreenButton', 'fullscreen', config.player, config.options);
		/*
		 addSliders(options);
		 */
		// Register events with the player.
		config.player.addModelListener('buffer', 'jQuery.fn.jwplayerControlbar.bufferHandler');
		config.player.addModelListener('state', 'jQuery.fn.jwplayerControlbar.stateHandler');
		config.player.addModelListener('time', 'jQuery.fn.jwplayerControlbar.timeHandler');
		config.player.addControllerListener('mute', 'jQuery.fn.jwplayerControlbar.muteHandler');
		config.player.addControllerListener('volume', 'jQuery.fn.jwplayerControlbar.volumeHandler');
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
				player.sendEvent(handler);
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
			player.sendEvent('seek', pos);
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
			player.sendEvent('volume', pct);
		}
		config.scrubber = 'none';
	}
	
	
	
	
	/** Update the buffer percentage. **/
	function bufferHandler(options) {
		if (options.buffer === 0) {
			$('#' + options.id + '_timeSliderBuffer').css('display', 'none');
		} else {
			$('#' + options.id + '_timeSliderBuffer').css('display', 'block');
			var wid = $('#' + options.id + '_timeSliderRail').width();
			$('#' + options.id + '_timeSliderBuffer').css('width', Math.round(wid * options.buffer / 100));
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
		if (options.state == 'completed') {
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
			$('#' + options.div).css('position', 'absolute');
			$('#' + options.div).css('left', 0);
			$('#' + options.div).css('top', 0);
			$('#' + options.div).css('height', '100%');
			$('#' + options.div).css('width', '100%');
			$('#' + options.id + '_normalscreenButton').css('display', 'block');
			$('#' + options.id + '_fullscreenButton').css('display', 'none');
			$(window).resize(function() {
				resizeBar(options);
			});
		} else {
			$('#' + options.div).css('position', 'static');
			$('#' + options.div).css('left', options.left);
			$('#' + options.div).css('top', options.top);
			$('#' + options.div).css('height', options.height);
			$('#' + options.div).css('width', options.width);
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
		var top = options.top + options.height;
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
	
	
})(jQuery);/**
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
			play: play(selector),
			pause: pause(selector),
			seek: seek(selector),
			stop: stop(selector),
			volume: volume(selector),
			mute: mute(selector),
			fullscreen: fullscreen(selector),
			state: state(selector),
			buffer: buffer(selector),
			duration: duration(selector),
			width: width(selector),
			height: buffer(selector),
			load: load(selector),
			resize: resize(selector),
			meta: meta(selector),
			time: time(selector),
			complete: complete(selector),
			events: events
		};
	}
	
	var events = {
		JWPLAYER_READY: 'jwplayerReady',
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
	
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			var id = $(this)[0].id;
			$(this).css("display", "none");
			$(this).jwplayerModel(options);
			$(this).jwplayerView();
			$.fn.jwplayerModel.setActiveMediaProvider($(this));
			//$(this).jwplayerControlbar();
			$(this).trigger("JWPLAYER_READY", {
				id: id
			});
		});
	};
	
	
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
					$.fn.jwplayerController.volume(player, parseInt(arg,10));
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
			position: event.target.currentTime
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
			'buffer': buffer
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
	$.fn.jwplayerSkinner = function() {
		return this.each(function() {
			loadSkin($(this).data("model"));
		});
	};
	
	
	/** Loading the images from the skin XML. **/
	function loadSkin(model) {
		$.get(model.skin, {}, function(xml) {
			var arr = $('component', xml);
			for (var i = 0; i < arr.length; i++) {
				if ($(arr[i]).attr('name') == 'display') {
					var sts = $(arr[i]).find('setting');
					arr = $(arr[i]).find('element');
					break;
				}
			}
			for (var i = 0; i < sts.length; i++) {
				model.skinlements[$(sts[i]).attr('name')] = $(sts[i]).attr('value');
			}
			config.options.images = arr.length;
			for (var i = 0; i < arr.length; i++) {
				loadImage(arr[i], config);
			}
		});
	}
	
	
	/** Load the data for a single element. **/
	function loadImage(element, config) {
		var img = new Image();
		var nam = $(element).attr('name');
		var url = config.options.skin.substr(0, config.options.skin.lastIndexOf('/')) + '/controlbar/';
		$(img).error(function() {
			config.options.images--;
		});
		$(img).load(function() {
			config.images[nam] = {
				height: this.height,
				width: this.width,
				src: this.src
			};
			config.options.images--;
			if (config.options.images === 0) {
				buildElements(config);
				buildHandlers(config);
			}
		});
		img.src = url + $(element).attr('src');
	}
	
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

	var embedString = "<embed %elementvars% src='%flashplayer%' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' />";
	var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars%'> <param name='movie' value='%flashplayer%'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
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
			$(this).wrap("<div />");
			$(this).before("<a href='" + $(this).data("model").sources[$(this).data("model").source].file + "' style='display:block; background:#ffffff url(" + $(this).data("model").image + ") no-repeat center center;width:" + $(this).data("model").width + "px;height:" + $(this).data("model").height + "px;position:relative;'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + ($(this).data("model").height - 60) / 2 + "px; left:" + ($(this).data("model").width - 60) / 2 + "px; border:0;' /></a>");
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
				$(event.target).css("display", "none");
				$(event.target).prev("a").css("display", "inherit");
				break;
			case 'playing':
				$(event.target).prev("a").css("display", "none");
				$(event.target).css("display", "inherit");
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
			var id = domElement[0].id;
			$(domElement).replaceWith(htmlString);
			//$("#"+id).css("display", "none");
			$("#"+id).prev("a").css("display", "none");
		}
	};
	
	
})(jQuery);
