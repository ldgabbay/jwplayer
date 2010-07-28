/**
 * jwplayerControlbar component of the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
/** Hooking the jwplayerControlbar up to jQuery. **/
jwplayer.html5.controlbar = function(player) {
	player._model.components.controlbar = $.extend({}, jwplayer.html5.controlbar.defaults, player.config.plugins.controlbar);
	jwplayer.html5.controlbar.buildElements(player);
	jwplayer.html5.controlbar.buildHandlers(player);
};

jwplayer.html5.controlbar.positions = {
	BOTTOM: 'BOTTOM',
	TOP: 'TOP',
	OVER: 'OVER'
};


/** Map with config for the jwplayerControlbar plugin. **/
jwplayer.html5.controlbar.defaults = {
	fontsize: 10,
	fontcolor: '000000',
	position: jwplayer.html5.controlbar.positions.BOTTOM,
	leftmargin: 0,
	rightmargin: 0,
	scrubber: 'none'
};

/** Draw the jwplayerControlbar elements. **/
jwplayer.html5.controlbar.buildElements = function(player) {
	// Draw the background.
	player._model.domelement.parents(":first").append('<div id="' + player.id + '_jwplayerControlbar"></div>');
	$("#" + player.id + '_jwplayerControlbar').css('position', 'absolute');
	$("#" + player.id + '_jwplayerControlbar').css('height', player.skin.controlbar.elements.background.height);
	switch (player._model.components.controlbar.position) {
		case jwplayer.html5.controlbar.positions.TOP:
			$("#" + player.id + '_jwplayerControlbar').css('top', 0);
			break;
		default:
			$("#" + player.id + '_jwplayerControlbar').css('top', player.height());
			player._model.domelement.parents(":first").css('height', parseInt(player._model.domelement.parents(":first").css('height').replace('px', '')) + player.skin.controlbar.elements.background.height);
			break;
	}
	$("#" + player.id + '_jwplayerControlbar').css('background', 'url(' + player.skin.controlbar.elements.background.src + ') repeat-x center left');
	// Draw all elements on top of the bar.
	jwplayer.html5.controlbar.buildElement('capLeft', 'left', true, player);
	jwplayer.html5.controlbar.buildElement('playButton', 'left', false, player);
	jwplayer.html5.controlbar.buildElement('pauseButton', 'left', true, player);
	jwplayer.html5.controlbar.buildElement('divider1', 'left', true, player);
	jwplayer.html5.controlbar.buildElement('elapsedText', 'left', true, player);
	jwplayer.html5.controlbar.buildElement('timeSliderRail', 'left', false, player);
	jwplayer.html5.controlbar.buildElement('timeSliderBuffer', 'left', false, player);
	jwplayer.html5.controlbar.buildElement('timeSliderProgress', 'left', false, player);
	jwplayer.html5.controlbar.buildElement('timeSliderThumb', 'left', false, player);
	jwplayer.html5.controlbar.buildElement('capRight', 'right', true, player);
	// TODO
	if (false) {
		jwplayer.html5.controlbar.buildElement('fullscreenButton', 'right', false, player);
		jwplayer.html5.controlbar.buildElement('normalscreenButton', 'right', true, player);
		jwplayer.html5.controlbar.buildElement('divider2', 'right', true, player);
	}
	if (!jwplayer.html5.utils.isiPad()) {
		jwplayer.html5.controlbar.buildElement('volumeSliderRail', 'right', false, player);
		jwplayer.html5.controlbar.buildElement('volumeSliderProgress', 'right', true, player);
		jwplayer.html5.controlbar.buildElement('muteButton', 'right', false, player);
		jwplayer.html5.controlbar.buildElement('unmuteButton', 'right', true, player);
		jwplayer.html5.controlbar.buildElement('divider3', 'right', true, player);
	}
	jwplayer.html5.controlbar.buildElement('durationText', 'right', true, player);
};


/** Draw a single element into the jwplayerControlbar. **/
jwplayer.html5.controlbar.buildElement = function(element, align, offset, player) {
	var nam = player.id + '_' + element;
	$('#' + player.id + '_jwplayerControlbar').append('<div id="' + nam + '"></div>');
	$('#' + nam).css('position', 'absolute');
	$('#' + nam).css('top', '0px');
	if (element.indexOf('Text') > 0) {
		$('#' + nam).html('00:00');
		$('#' + nam).css('font', player._model.components.controlbar.fontsize + 'px/' + (player.skin.controlbar.elements.background.height + 1) + 'px Arial,sans-serif');
		$('#' + nam).css('text-align', 'center');
		$('#' + nam).css('font-weight', 'bold');
		$('#' + nam).css('cursor', 'default');
		var wid = 14 + 3 * player._model.components.controlbar.fontsize;
		$('#' + nam).css('color', '#' + player._model.components.controlbar.fontcolor.substr(-6));
	} else if (element.indexOf('divider') === 0) {
		$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements.divider.src + ') repeat-x center left');
		var wid = player.skin.controlbar.elements.divider.width;
	} else {
		$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements[element].src + ') repeat-x center left');
		var wid = player.skin.controlbar.elements[element].width;
	}
	if (align == 'left') {
		$('#' + nam).css(align, player._model.components.controlbar.leftmargin);
		if (offset) {
			player._model.components.controlbar.leftmargin += wid;
		}
	} else if (align == 'right') {
		$('#' + nam).css(align, player._model.components.controlbar.rightmargin);
		if (offset) {
			player._model.components.controlbar.rightmargin += wid;
		}
	}
	$('#' + nam).css('width', wid);
	$('#' + nam).css('height', player.skin.controlbar.elements.background.height);
};


/** Add interactivity to the jwplayerControlbar elements. **/
jwplayer.html5.controlbar.buildHandlers = function(player) {
	// Register events with the buttons.
	jwplayer.html5.controlbar.buildHandler('playButton', 'play', player);
	jwplayer.html5.controlbar.buildHandler('pauseButton', 'pause', player);
	jwplayer.html5.controlbar.buildHandler('muteButton', 'mute', player, true);
	jwplayer.html5.controlbar.buildHandler('unmuteButton', 'mute', player, false);
	jwplayer.html5.controlbar.buildHandler('fullscreenButton', 'fullscreen', player, true);
	jwplayer.html5.controlbar.buildHandler('normalscreenButton', 'fullscreen', player, false);
	
	jwplayer.html5.controlbar.addSliders(player);
	
	// Register events with the player.
	player.buffer(jwplayer.html5.controlbar.bufferHandler);
	player.state(jwplayer.html5.controlbar.stateHandler);
	player.time(jwplayer.html5.controlbar.timeHandler);
	player.mute(jwplayer.html5.controlbar.muteHandler);
	player.volume(jwplayer.html5.controlbar.volumeHandler);
	player.complete(jwplayer.html5.controlbar.completeHandler);
	
	// Trigger a few events so the bar looks good on startup.
	jwplayer.html5.controlbar.resizeHandler({
		id: player.id,
		fulscreen: player.fullscreen(),
		width: player.width(),
		height: player.height()
	});
	jwplayer.html5.controlbar.timeHandler({
		id: player.id,
		duration: player.duration(),
		position: 0
	});
	jwplayer.html5.controlbar.bufferHandler({
		id: player.id,
		bufferProgress: 0
	});
	jwplayer.html5.controlbar.muteHandler({
		id: player.id,
		mute: player.mute()
	});
	jwplayer.html5.controlbar.stateHandler({
		id: player.id,
		newstate: jwplayer.html5.states.IDLE
	});
	jwplayer.html5.controlbar.volumeHandler({
		id: player.id,
		volume: player.volume()
	});
};


/** Set a single button handler. **/
jwplayer.html5.controlbar.buildHandler = function(element, handler, player, args) {
	var nam = player.id + '_' + element;
	$('#' + nam).css('cursor', 'pointer');
	if (handler == 'fullscreen') {
		$('#' + nam).mouseup(function(evt) {
			evt.stopPropagation();
			player.fullscreen(!player.fullscreen());
			jwplayer.html5.controlbar.resizeHandler({
				id: player.id,
				fullscreen: player.fullscreen(),
				width: player.width(),
				height: player.height()
			});
		});
	} else {
		$('#' + nam).mouseup(function(evt) {
			evt.stopPropagation();
			if (!jwplayer.html5.utils.isNull(args)) {
				player[handler](args);
			} else {
				player[handler]();
			}
			
		});
	}
};


/** Set the volume drag handler. **/
jwplayer.html5.controlbar.addSliders = function(player) {
	var bar = '#' + player.id + '_jwplayerControlbar';
	var trl = '#' + player.id + '_timeSliderRail';
	var vrl = '#' + player.id + '_volumeSliderRail';
	$(bar).css('cursor', 'pointer');
	$(trl).css('cursor', 'pointer');
	$(vrl).css('cursor', 'pointer');
	$(bar).mousedown(function(evt) {
		if (evt.pageX >= $(trl).offset().left - window.pageXOffset && evt.pageX <= $(trl).offset().left - window.pageXOffset + $(trl).width()) {
			player._model.components.controlbar.scrubber = 'time';
		} else if (evt.pageX >= $(vrl).offset().left - window.pageXOffset && evt.pageX <= $(vrl).offset().left - window.pageXOffset + $(trl).width()) {
			player._model.components.controlbar.scrubber = 'volume';
		}
	});
	$(bar).mouseup(function(evt) {
		evt.stopPropagation();
		jwplayer.html5.controlbar.sliderUp(evt.pageX, player);
	});
	$(bar).mousemove(function(evt) {
		if (player._model.components.controlbar.scrubber == 'time') {
			player._model.components.controlbar.mousedown = true;
			var xps = evt.pageX - $(bar).offset().left - window.pageXOffset;
			$('#' + player.id + '_timeSliderThumb').css('left', xps);
		}
	});
};


/** The slider has been moved up. **/
jwplayer.html5.controlbar.sliderUp = function(msx, player) {
	player._model.components.controlbar.mousedown = false;
	if (player._model.components.controlbar.scrubber == 'time') {
		var xps = msx - $('#' + player.id + '_timeSliderRail').offset().left + window.pageXOffset;
		var wid = $('#' + player.id + '_timeSliderRail').width();
		var pos = xps / wid * player._model.components.controlbar.currentDuration;
		if (pos < 0) {
			pos = 0;
		} else if (pos > player._model.components.controlbar.currentDuration) {
			pos = player._model.components.controlbar.currentDuration - 3;
		}
		player.seek(pos);
		if (player._model.state != jwplayer.html5.states.PLAYING) {
			player.play();
		}
	} else if (player._model.components.controlbar.scrubber == 'volume') {
		var xps = msx - $('#' + player.id + '_volumeSliderRail').offset().left - window.pageXOffset;
		var wid = $('#' + player.id + '_volumeSliderRail').width();
		var pct = Math.round(xps / wid * 100);
		if (pct < 0) {
			pct = 0;
		} else if (pct > 100) {
			pct = 100;
		}
		if (player._model.mute) {
			player.mute(false);
		}
		player.volume(pct);
	}
	player._model.components.controlbar.scrubber = 'none';
};


/** Update the buffer percentage. **/
jwplayer.html5.controlbar.bufferHandler = function(event) {
	if (!jwplayer.html5.utils.isNull(event.bufferPercent)) {
		controlbars[event.id].currentBuffer = event.bufferPercent;
	}
	
	var wid = $('#' + event.id + '_timeSliderRail').width();
	var bufferWidth = isNaN(Math.round(wid * controlbars[event.id].currentBuffer / 100)) ? 0 : Math.round(wid * controlbars[event.id].currentBuffer / 100);
	$('#' + event.id + '_timeSliderBuffer').css('width', bufferWidth);
};


/** Update the mute state. **/
jwplayer.html5.controlbar.muteHandler = function(event) {
	if (event.mute) {
		$('#' + event.id + '_muteButton').css('display', 'none');
		$('#' + event.id + '_unmuteButton').css('display', 'block');
		$('#' + event.id + '_volumeSliderProgress').css('display', 'none');
	} else {
		$('#' + event.id + '_muteButton').css('display', 'block');
		$('#' + event.id + '_unmuteButton').css('display', 'none');
		$('#' + event.id + '_volumeSliderProgress').css('display', 'block');
	}
};


/** Update the playback state. **/
jwplayer.html5.controlbar.stateHandler = function(event) {
	// Handle the play / pause button
	if (event.newstate == jwplayer.html5.states.BUFFERING || event.newstate == jwplayer.html5.states.PLAYING) {
		$('#' + event.id + '_pauseButton').css('display', 'block');
		$('#' + event.id + '_playButton').css('display', 'none');
	} else {
		$('#' + event.id + '_pauseButton').css('display', 'none');
		$('#' + event.id + '_playButton').css('display', 'block');
	}
	
	// Show / hide progress bar
	if (event.newstate == jwplayer.html5.states.IDLE) {
		$('#' + event.id + '_timeSliderBuffer').css('display', 'none');
		$('#' + event.id + '_timeSliderProgress').css('display', 'none');
		$('#' + event.id + '_timeSliderThumb').css('display', 'none');
	} else {
		$('#' + event.id + '_timeSliderBuffer').css('display', 'block');
		if (event.newstate != jwplayer.html5.states.BUFFERING) {
			$('#' + event.id + '_timeSliderProgress').css('display', 'block');
			$('#' + event.id + '_timeSliderThumb').css('display', 'block');
		}
	}
};


/** Handles event completion **/
jwplayer.html5.controlbar.completeHandler = function(event) {
	jwplayer.html5.controlbar.timeHandler($.extend(event, {
		position: 0,
		duration: controlbars[event.id].currentDuration
	}));
};


/** Update the playback time. **/
jwplayer.html5.controlbar.timeHandler = function(event) {
	if (!jwplayer.html5.utils.isNull(event.position)) {
		controlbars[event.id].currentPosition = event.position;
	}
	if (!jwplayer.html5.utils.isNull(event.duration)) {
		controlbars[event.id].currentDuration = event.duration;
	}
	var progress = (controlbars[event.id].currentPosition === controlbars[event.id].currentDuration === 0) ? 0 : controlbars[event.id].currentPosition / controlbars[event.id].currentDuration;
	var railWidth = $('#' + event.id + '_timeSliderRail').width();
	var thumbWidth = $('#' + event.id + '_timeSliderThumb').width();
	var railLeft = $('#' + event.id + '_timeSliderRail').position().left;
	var progressWidth = isNaN(Math.round(railWidth * progress)) ? 0 : Math.round(railWidth * progress);
	var thumbPosition = railLeft + progressWidth;
	
	$('#' + event.id + '_timeSliderProgress').css('width', progressWidth);
	if (!controlbars[event.id].mousedown) {
		$('#' + event.id + '_timeSliderThumb').css('left', thumbPosition);
	}
	
	$('#' + event.id + '_durationText').html(jwplayer.html5.controlbar.timeFormat(controlbars[event.id].currentDuration));
	$('#' + event.id + '_elapsedText').html(jwplayer.html5.controlbar.timeFormat(controlbars[event.id].currentPosition));
};


/** Format the elapsed / remaining text. **/
jwplayer.html5.controlbar.timeFormat = function(sec) {
	str = '00:00';
	if (sec > 0) {
		str = Math.floor(sec / 60) < 10 ? '0' + Math.floor(sec / 60) + ':' : Math.floor(sec / 60) + ':';
		str += Math.floor(sec % 60) < 10 ? '0' + Math.floor(sec % 60) : Math.floor(sec % 60);
	}
	return str;
};


/** Flip the player size to/from full-browser-screen. **/
jwplayer.html5.controlbar.resizeHandler = function(event) {
	controlbars[event.id].width = event.width;
	controlbars[event.id].fullscreen = event.fullscreen;
	if (event.fullscreen) {
		$('#' + event.id + '_normalscreenButton').css('display', 'block');
		$('#' + event.id + '_fullscreenButton').css('display', 'none');
		// TODO
		if (false) {
			$(window).resize(function() {
				jwplayer.html5.controlbar.resizeBar(player);
			});
		}
	} else {
		$('#' + event.id + '_normalscreenButton').css('display', 'none');
		$('#' + event.id + '_fullscreenButton').css('display', 'block');
		// TODO
		if (false) {
			$(window).resize(null);
		}
	}
	jwplayer.html5.controlbar.resizeBar(event);
	jwplayer.html5.controlbar.timeHandler(event);
	jwplayer.html5.controlbar.bufferHandler(event);
};


/** Resize the jwplayerControlbar. **/
jwplayer.html5.controlbar.resizeBar = function(event) {
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
};


/** Update the volume level. **/
jwplayer.html5.controlbar.volumeHandler = function(event) {
	var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
	var railWidth = $('#' + event.id + '_volumeSliderRail').width();
	var railRight = parseInt($('#' + event.id + '_volumeSliderRail').css('right').toString().replace('px', ''), 10);
	var progressWidth = isNaN(Math.round(railWidth * progress)) ? 0 : Math.round(railWidth * progress);
	
	$('#' + event.id + '_volumeSliderProgress').css('width', progressWidth);
	$('#' + event.id + '_volumeSliderProgress').css('right', (railWidth + railRight - progressWidth));
};
