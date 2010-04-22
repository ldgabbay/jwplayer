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
			$.extend(options, $('#' + id).data("model"));
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
		$.jwplayer(config.player).buffer($.fn.jwplayerControlbar.bufferHandler);
		$.jwplayer(config.player).state($.fn.jwplayerControlbar.stateHandler);
		$.jwplayer(config.player).time($.fn.jwplayerControlbar.timeHandler);
		$.jwplayer(config.player).mute($.fn.jwplayerControlbar.muteHandler);
		$.jwplayer(config.player).volume($.fn.jwplayerControlbar.volumeHandler);
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


	})(jQuery);
