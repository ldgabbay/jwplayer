/**
 * Controlbar component of the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {


	/** Hooking the controlbar up to jQuery. **/
	$.fn.controlbar = function(ops) {
		return this.each(function() {
			var id = $(this)[0].id;
			var div = $('#' + id).parents()[0].id;
			var player = document.getElementById(id);
			var options = $.extend({}, $.fn.controlbar.defaults, ops);
			$.extend(options, player.getConfig());
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
			$.fn.controlbar.bars[id] = {
				player: player,
				options: options,
				images: {}
			};
			loadSkin($.fn.controlbar.bars[id]);
		});
	};
	
	
	/** Map with all controlbars. **/
	$.fn.controlbar.bars = {};
	
	
	/** Map with config for the controlbar plugin. **/
	$.fn.controlbar.defaults = {
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
	$.fn.controlbar.bufferHandler = function(obj) {
		bufferHandler({
			id: obj.id,
			buffer: obj.percentage
		});
	};
	$.fn.controlbar.muteHandler = function(obj) {
		muteHandler({
			id: obj.id,
			mute: obj.state
		});
	};
	$.fn.controlbar.stateHandler = function(obj) {
		stateHandler({
			id: obj.id,
			state: obj.newstate.toLowerCase()
		});
	};
	$.fn.controlbar.timeHandler = function(obj) {
		timeHandler({
			id: obj.id,
			elapsed: obj.position,
			duration: obj.duration
		});
	};
	$.fn.controlbar.volumeHandler = function(obj) {
		volumeHandler({
			id: obj.id,
			volume: obj.percentage
		});
	};
	
	
	/** Draw the controlbar elements. **/
	function buildElements(config) {
		// Draw the background.
		$('#' + config.options.div).after('<div id="' + config.options.id + '_controlBar"></div>');
		$('#' + config.options.id + '_controlBar').css('position', 'absolute');
		$('#' + config.options.id + '_controlBar').css('height', config.images.background.height);
		$('#' + config.options.id + '_controlBar').css('background', 'url(' + config.images.background.src + ') repeat-x center left');
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
	
	
	/** Draw a single element into the controlbar. **/
	function buildElement(element, align, offset, config) {
		var nam = config.options.id + '_' + element;
		$('#' + config.options.id + '_controlBar').append('<div id="' + nam + '"></div>');
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
	
	
	/** Add interactivity to the controlbar elements. **/
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
		config.player.addModelListener('buffer', 'jQuery.fn.controlbar.bufferHandler');
		config.player.addModelListener('state', 'jQuery.fn.controlbar.stateHandler');
		config.player.addModelListener('time', 'jQuery.fn.controlbar.timeHandler');
		config.player.addControllerListener('mute', 'jQuery.fn.controlbar.muteHandler');
		config.player.addControllerListener('volume', 'jQuery.fn.controlbar.volumeHandler');
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
		var bar = '#' + config.id + '_controlBar';
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
			var bar = $('#' + config.id + '_controlBar').width();
			var brx = $('#' + config.id + '_controlBar').position().left;
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
	
	
	/** Resize the controlbar. **/
	function resizeBar(options) {
		var lft = options.left;
		var top = options.top + options.height;
		var wid = options.width;
		var hei = $('#' + options.id + '_controlBar').height();
		if (options.position == 'over') {
			lft += 1 * options.margin;
			top -= 1 * options.margin + hei;
			wid -= 2 * options.margin;
		}
		if (options.fullscreen) {
			lft = options.margin;
			top = $(window).height() - options.margin - hei;
			wid = $(window).width() - 2 * options.margin;
			$('#' + options.id + '_controlBar').css('z-index', 99);
		} else {
			$('#' + options.id + '_controlBar').css('z-index', 97);
		}
		$('#' + options.id + '_controlBar').css('left', lft);
		$('#' + options.id + '_controlBar').css('top', top);
		$('#' + options.id + '_controlBar').css('width', wid);
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
			player.css("display", "inherit");
			$.fn.log("mediaprovider",player);
			player.data("media").play();
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayerController.pause = function(player) {
		try {
			player.data("media").pause();
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayerController.seek = function(player, position) {
		try {
			player.data("media").seek(position);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayerController.stop = function(player) {
		try {
			player.data("media").stop();
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	
	/** Change the video's volume level. **/
	$.fn.jwplayerController.volume = function(player, position) {
		try {
			player.data("media").volume(position);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	/** Switch the mute state of the player. **/
	$.fn.jwplayerController.mute = function(player, state) {
		try {
			player.data("media").mute(state);
			return true;
		} catch (err) {
		
		}
		return false;
	};
	
	/** Jumping the player to/from fullscreen. **/
	$.fn.jwplayerController.fullscreen = function(player, state) {
		try {
			player.data("media").fullscreen(state);
			return true;
		} catch (err) {
		
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
		return {
			play: play(selector),
			pause: pause(selector),
			seek: seek(selector),
			stop: stop(selector),
			volume: volume(selector),
			mute: mute(selector),
			fullscreen: fullscreen(selector)
		};
	}
	
	/** Extending jQuery **/
	$.extend({
		jwplayer: jwplayer
	});
	
	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			$(this).css("display", "none");
			$(this).jwplayerModel(options);
			$(this).jwplayerView();
			$.fn.jwplayerModel.setActiveMediaProvider($(this));
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
		skin: '../../skins/five/five.xml',
		volume: 100,
		width: 400,
		source: 0,
		flashplayer: 'src/jquery.jwplayer.swf'
	};
	
	function factory(selector, fn) {
		return function() {
			try {
				fn();
				return jwplayer(selector);
			} catch (err) {
			
			}
			return false;
		};
	}
	
	
	/** Start playback or resume. **/
	function play(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.play', arg);
					break;
				default:
					$.fn.jwplayerController.play(player);
					break;
			}
		});
	}
	
	/** Switch the pause state of the player. **/
	function pause(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.pause', arg);
					break;
				default:
					$.fn.jwplayerController.pause(player);
					break;
			}
		});
	}
	
	
	/** Seek to a position in the video. **/
	function seek(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.seek', arg);
					break;
				default:
					$.fn.jwplayerController.seek(player, arg);
					break;
			}
		});
	}
	
	
	/** Stop playback and loading of the video. **/
	function stop(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.stop', arg);
					break;
				default:
					$.fn.jwplayerController.stop(player);
					break;
			}
		});
	}
	
	
	/** Change the video's volume level. **/
	function volume(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.volume', arg);
					break;
				case "number":
					$.fn.jwplayerController.setVolume(player, arg);
					break;
				default:
					$.fn.jwplayerController.getVolume(player);
					break;
			}
		});
	}
	
	/** Switch the mute state of the player. **/
	function mute(player, state) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.mute', arg);
					break;
				case "boolean":
					$.fn.jwplayerController.setMute(player, arg);
					break;
				default:
					$.fn.jwplayerController.getMute(player);
					break;
			}
		});
	}
	
	/** Jumping the player to/from fullscreen. **/
	function fullscreen(player, state) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.fullscreen', arg);
					break;
				case "boolean":
					$.fn.jwplayerController.setFullscreen(player, arg);
					break;
				default:
					$.fn.jwplayerController.getFullscreen(player);
					break;
			}
		});
	}
	
	/** Jumping the player to/from fullscreen. **/
	function state(player) {
		return factory(player, function(arg) {
			switch ($.fn.jwplayerUtils.typeOf(arg)) {
				case "function":
					addEventListener(player, 'jwplayer.state', arg);
					break;
			}
		});
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
			$(this).data("media", $.fn.jwplayerMediaFlash);
			var model = $(this).data("model");
			model.autostart = true;
			model.controlbar = 'none';
			model.icons = false;
			$.fn.jwplayerView.embedFlash($(this), model);
		});
	};
	
})(jQuery);
/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {

	var state = 'idle';
	
	var states = {
		"buffering": "buffering",
		"ended" : "idle",
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
		'play': stateHandler,
		'playing': stateHandler,
		'progress': positionHandler,
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
	
	
	$.fn.jwplayerMediaVideo = function(options) {
		return this.each(function() {
			var video = $(this);
			//$.fn.log(this);
			var media = {
				play: $.fn.jwplayerMediaVideo.play(video),
				pause: $.fn.jwplayerMediaVideo.pause(video),
				seek: $.fn.jwplayerMediaVideo.seek(video),
				volume: $.fn.jwplayerMediaVideo.volume(video),
				mute: $.fn.jwplayerMediaVideo.mute(video),
				fullscreen: $.fn.jwplayerMediaVideo.fullscreen(video)
			};
			video.data("media", media);
			$.each(events, function(event, handler) {
				video[0].addEventListener(event, handler,true);
			});
		});
	};
	
	function generalHandler(event) {
		$.fn.log("general:" + event.type);
	}
	
	function stateHandler(event) {
		/*$.fn.log("state", {
			event: event.type,
			state: state
		});*/
		if(states[event.type]) {
			setState(event.target, states[event.type]);
		}
	}
	
	function setState(player, newState) {
		if (state != newState) {
			var oldState = state;
			state = newState;
			$(player).trigger("jwplayer.state", {
				oldstate: oldState,
				newstate: newState
			});
		}
	}
	
	function metaHandler(event) {
		$.fn.log("meta:" + event.type);
	}
	
	function positionHandler(event) {
		$(event.target).trigger("jwplayer.time", {
			position: event.target.currentTime,
			duration: event.target.duraiton
		});
	}
	
	function errorHandler(event) {
		$.fn.log("error:" + event.type);
	}
	
	$.fn.jwplayerMediaVideo.play = function(player) {
		return function() {
			try {
				player.css("display", "inherit");
				player[0].play();
				model.state = 'playing';
				return true;
			} catch (err) {
			
			}
			return false;
		};
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayerMediaVideo.pause = function(player) {
		return function() {
			player.pause();
		};
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayerMediaVideo.seek = function(player) {
		return function(position) {
			player.currentTime = position;
		};
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayerMediaVideo.stop = function(player) {
		return function() {
			player.pause();
			player.currentTime = player.startTime;
		};
	};
	
	
	/** Change the video's volume level. **/
	$.fn.jwplayerMediaVideo.volume = function(player) {
		return function(position) {
			video.volume = position / 100;
		};
	};
	
	/** Switch the mute state of the player. **/
	$.fn.jwplayerMediaVideo.mute = function(player) {
		return function(state) {
			player.mute = state;
		};
	};
	
	/** Switch the fullscreen state of the player. **/
	$.fn.jwplayerMediaVideo.fullscreen = function(player) {
		return function(state) {
			//player.fullscreen = state;
		};
	};
	
	
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
					//$.fn.jwplayerView.embedFlash(player, model);
					//$(event.target).css("display", "none");
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
		switch (parameters.newState) {
			case 'idle':
				$(event.target).css("display", "none");
				$(event.target).prev("a").css("display", "inherit");
				break;
			case 'playing':
				$(event.target).css("display", "inherit");
				$(event.target).prev("a").css("display", "none");
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
			$(domElement).before(htmlString);
		}
	};
	
	
})(jQuery);
