/**
 * Core component of the JW Player (initialization, API).
 *
 * @author zach
 * @version 1.0
 */

jwplayer = function(){};

jwplayer.html5 = function(domelement) {
	this._domelement = domelement;
	this.id = domelement.id;
	return this.html5;
};

jwplayer.html5.prototype = {
	id: undefined,
	version: "1.0",
	skin: undefined,
	_model: undefined,
	_view: undefined,
	_controller: undefined,
	_listeners: undefined,
	_media: undefined,
	_domelement: undefined
};

jwplayer.html5.setup = function(options){
	jwplayer.html5.utils.log("Starting setup", this);
	jwplayer.html5._setup(this, 0, options);
	return this;
};

jwplayer.html5._setup = function(player, step, options) {
	try {
		switch (step) {
			case 0:
				player._model = new jwplayer.html5.model(options);
				player._model.domelement = $(player.domelement);
				jwplayer.html5._setup(player, step + 1);
				break;
			case 1:
				player._controller = jwplayer.html5.controller(player);
				jwplayer.html5._setup($.extend(player, jwplayer.html5._api(player)), step + 1);
				break;
			case 2:
				jwplayer.html5.skinner(player, function() {
					jwplayer.html5._setup(player, step + 1);
				});
				break;
			case 3:
				jwplayer.html5.view(player);
				jwplayer.html5._setup(player, step + 1);
				break;
			case 4:
				jwplayer.html5.model.setActiveMediaProvider(player);
				if ((player._media === undefined) || !player._media.hasChrome) {
					jwplayer.html5._setup(player, step + 1);
				}
				break;
			case 5:
				jwplayer.html5.display(player, player._model.domelement);
				if (player._media === undefined) {
					player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
				} else {
					jwplayer.html5._setup(player, step + 1);
				}
				break;
			case 6:
				if (!jwplayer.html5.utils.isiPhone()) {
					jwplayer.html5.controlbar(player, player._model.domelement);
				}
				jwplayer.html5._setup(player, step + 1);
				break;
			case 7:
				player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
				jwplayer.html5._setup(player, step + 1);
				break;
			default:
				if (player.config.autostart === true) {
					player.play();
				}
				break;
		}
	} catch (err) {
		jwplayer.html5.utils.log("Setup failed at step " + step, err);
	}
};
jwplayer.html5.states = {
	IDLE: 'IDLE',
	BUFFERING: 'BUFFERING',
	PLAYING: 'PLAYING',
	PAUSED: 'PAUSED'
};jwplayer.html5.events = {
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
};/** A factory for API calls that either set listeners or return data **/
jwplayer.html5._api = function(player) {
	return {
		play: player._controller.play,
		pause: player._controller.pause,
		stop: player._controller.stop,
		seek: player._controller.seek,
		
		resize: player._controller.resize,
		fullscreen: player._controller.fullscreen,
		volume: player._controller.volume,
		mute: player._controller.mute,
		load: player._controller.load,
		
		addEventListener: player._controller.addEventListener,
		removeEventListener: player._controller.removeEventListener,
		sendEvent: player._controller.sendEvent,
		
		ready: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_READY),
		error: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_ERROR),
		complete: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE),
		state: jwplayer.html5._api.dataListenerFactory(player, 'state', jwplayer.html5.events.JWPLAYER_PLAYER_STATE),
		buffer: jwplayer.html5._api.dataListenerFactory(player, 'buffer', jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER),
		time: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_TIME),
		position: jwplayer.html5._api.dataListenerFactory(player, 'position'),
		duration: jwplayer.html5._api.dataListenerFactory(player, 'duration'),
		width: jwplayer.html5._api.dataListenerFactory(player, 'width'),
		height: jwplayer.html5._api.dataListenerFactory(player, 'height'),
		meta: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_META)
	};
};

jwplayer.html5._api.dataListenerFactory = function(player, dataType, eventType) {
	return function(arg) {
		switch (jwplayer.html5.utils.typeOf(arg)) {
			case "function":
				if (!jwplayer.html5.utils.isNull(eventType)) {
					player.addEventListener(eventType, arg);
				}
				break;
			default:
				if (!jwplayer.html5.utils.isNull(dataType)) {
					return player._controller.mediaInfo()[dataType];
				}
				return player._controller.mediaInfo();
		}
		return player;
	};
};/**
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
/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
jwplayer.html5.controller = function(player) {
	return {
		play: jwplayer.html5.controller.play(player),
		pause: jwplayer.html5.controller.pause(player),
		seek: jwplayer.html5.controller.seek(player),
		stop: jwplayer.html5.controller.stop(player),
		volume: jwplayer.html5.controller.volume(player),
		mute: jwplayer.html5.controller.mute(player),
		resize: jwplayer.html5.controller.resize(player),
		fullscreen: jwplayer.html5.controller.fullscreen(player),
		load: jwplayer.html5.controller.load(player),
		mediaInfo: jwplayer.html5.controller.mediaInfo(player),
		addEventListener: jwplayer.html5.controller.addEventListener(player),
		removeEventListener: jwplayer.html5.controller.removeEventListener(player),
		sendEvent: jwplayer.html5.controller.sendEvent(player)
	};
};

jwplayer.html5.controller._mediainfovariables = ["width","height","state","sources","source","position","buffer","duration","volume","mute","fullscreen"];

jwplayer.html5.controller.play = function(player) {
	return function() {
		try {
			switch (player._model.state) {
				case jwplayer.html5.states.IDLE:
					player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, player._media.play);
					player._media.load(player._model.sources[player._model.source].file);
					break;
				case jwplayer.html5.states.PAUSED:
					player._media.play();
					break;
			}
			
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Switch the pause state of the player. **/
jwplayer.html5.controller.pause = function(player) {
	return function() {
		try {
			switch (player._model.state) {
				case jwplayer.html5.states.PLAYING:
				case jwplayer.html5.states.BUFFERING:
					player._media.pause();
					break;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Seek to a position in the video. **/
jwplayer.html5.controller.seek = function(player) {
	return function(position) {
		try {
			switch (player._model.state) {
				case jwplayer.html5.states.PLAYING:
				case jwplayer.html5.states.PAUSED:
				case jwplayer.html5.states.BUFFERING:
					player._media.seek(position);
					break;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Stop playback and loading of the video. **/
jwplayer.html5.controller.stop = function(player) {
	return function() {
		try {
			player._media.stop();
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Get / set the video's volume level. **/
jwplayer.html5.controller.volume = function(player) {
	return function(arg) {
		try {
			switch (jwplayer.html5.utils.typeOf(arg)) {
				case "function":
					player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, arg);
					break;
				case "number":
					player._media.volume(arg);
					return true;
				case "string":
					player._media.volume(parseInt(arg, 10));
					return true;
				default:
					return player._model.volume;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Get / set the mute state of the player. **/
jwplayer.html5.controller.mute = function(player) {
	return function(arg) {
		try {
			switch (jwplayer.html5.utils.typeOf(arg)) {
				case "function":
					player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, arg);
					break;
				case "boolean":
					player._media.mute(arg);
					break;
				default:
					return player._model.mute;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Resizes the video **/
jwplayer.html5.controller.resize = function(player) {
	return function(arg1, arg2) {
		try {
			switch (jwplayer.html5.utils.typeOf(arg1)) {
				case "function":
					player.addEventListener(jwplayer.html5.events.JWPLAYER_RESIZE, arg1);
					break;
				case "number":
					player._media.resize(arg1, arg2);
					break;
				case "string":
					player._media.resize(arg1, arg2);
					break;
				default:
					break;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Jumping the player to/from fullscreen. **/
jwplayer.html5.controller.fullscreen = function(player) {
	return function(arg) {
		try {
			switch (jwplayer.html5.utils.typeOf(arg)) {
				case "function":
					player.addEventListener(jwplayer.html5.events.JWPLAYER_FULLSCREEN, arg);
					break;
				case "boolean":
					player._media.fullscreen(arg);
					break;
				default:
					return player._model.fullscreen;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Loads a new video **/
jwplayer.html5.controller.load = function(player) {
	return function(arg) {
		try {
			switch (jwplayer.html5.utils.typeOf(arg)) {
				case "function":
					player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_LOADED, arg);
					break;
				default:
					player._media.load(arg);
					break;
			}
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Returns the meta **/
jwplayer.html5.controller.mediaInfo = function(player) {
	return function() {
		try {
			var result = {};
			for (var index in jwplayer.html5.controller._mediainfoparameters) {
				var mediaparam = jwplayer.html5.controller._mediainfoparameters[index];
				result[mediaparam] = player._model[mediaparam];
			}
			return result;
		} catch (err) {
			jwplayer.html5.utils.log("error", err);
		}
		return false;
	};
};


/** Add an event listener. **/
jwplayer.html5.controller.addEventListener = function(player) {
	return function(type, listener, count) {
		try {
			if (player._listeners[type] === undefined) {
				player._listeners[type] = [];
			}
			player._listeners[type].push({
				listener: listener,
				count: count
			});
		} catch (err) {
			jwplayer.html5.utils.log("error", err);
		}
		return false;
	};
};


/** Remove an event listener. **/
jwplayer.html5.controller.removeEventListener = function(player) {
	return function(type, listener) {
		try {
			for (var lisenterIndex in player._listeners[type]) {
				if (player._listeners[type][lisenterIndex] == listener) {
					player._listeners[type].slice(lisenterIndex, lisenterIndex + 1);
					break;
				}
			}
		} catch (err) {
			jwplayer.html5.utils.log("error", err);
		}
		return false;
	};
};


/** Send an event **/
jwplayer.html5.controller.sendEvent = function(player) {
	return function(type, data) {
		data = $.extend({
			id: player.id,
			version: player.version
		}, data);
		if ((player._model.config.debug !== undefined) && (player._model.config.debug.toString().toLowerCase() == 'console')) {
			jwplayer.html5.utils.log(type, data);
		}
		for (var listenerIndex in player._listeners[type]) {
			try {
				player._listeners[type][listenerIndex].listener(data);
			} catch (err) {
				jwplayer.html5.utils.log("There was an error while handling a listener", err);
			}
			if (player._listeners[type][listenerIndex].count === 1) {
				delete player._listeners[type][listenerIndex];
			} else if (player._listeners[type][listenerIndex].count > 0) {
				player._listeners[type][listenerIndex].count = player._listeners[type][listenerIndex].count - 1;
			}
		}
	};
};

/**
 * JW Player Defaul
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
/** Constructor **/
jwplayer.html5.defaultSkin = '<?xml version="1.0" ?><skin author="LongTail Video" name="Five" version="1.0"><settings><setting name="backcolor" value="0xFFFFFF"/><setting name="frontcolor" value="0x000000"/><setting name="lightcolor" value="0x000000"/><setting name="screencolor" value="0x000000"/></settings><components><component name="controlbar"><settings><setting name="margin" value="20"/><setting name="fontsize" value="11"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFJJREFUeNrslLENwAAIwxLU/09j5AiOgD5hVQzNAVY8JK4qEfHMIKBnd2+BQlBINaiRtL/aV2rdzYBsM6CIONbI1NZENTr3RwdB2PlnJgJ6BRgA4hwu5Qg5iswAAAAASUVORK5CYII="/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="playButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhJREFUeNpiYqABYBo1dNRQ+hr6H4jvA3E8NS39j4SpZvh/LJig4YxEGEqy3kET+w+AOGFQRhTJhrEQkGcczfujhg4CQwECDADpTRWU/B3wHQAAAABJRU5ErkJggg=="/><element name="pauseButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAChJREFUeNpiYBgFo2DwA0YC8v/R1P4nRu+ooaOGUtnQUTAKhgIACDAAFCwQCfAJ4gwAAAAASUVORK5CYII="/><element name="prevButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEtJREFUeNpiYBgFo2Dog/9QDAPyQHweTYwiQ/2B+D0Wi8g2tB+JTdBQRiIMJVkvEy0iglhDF9Aq9uOpHVEwoE+NJDUKRsFgAAABBgDe2hqZcNNL0AAAAABJRU5ErkJggg=="/><element name="nextButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAElJREFUeNpiYBgFo2Dog/9AfB6I5dHE/lNqKAi/B2J/ahsKw/3EGMpIhKEk66WJoaR6fz61IyqemhEFSlL61ExSo2AUDAYAEGAAiG4hj+5t7M8AAAAASUVORK5CYII="/><element name="timeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADxJREFUeNpiYBgFo2AU0Bwwzluw+D8tLWARFhKiqQ9YuLg4aWsBGxs7bS1gZ6e5BWyjSX0UjIKhDgACDABlYQOGh5pYywAAAABJRU5ErkJggg=="/><element name="timeSliderBuffer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFo2AU0Bww1jc0/aelBSz8/Pw09QELOzs7bS1gY2OjrQWsrKy09gHraFIfBaNgqAOAAAMAvy0DChXHsZMAAAAASUVORK5CYII="/><element name="timeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAClJREFUeNpiYBgFo2AU0BwwAvF/WlrARGsfjFow8BaMglEwCugAAAIMAOHfAQunR+XzAAAAAElFTkSuQmCC"/><element name="timeSliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAICAYAAAA870V8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiZICA/yCCiQEJUJcDEGAAY0gBD1/m7Q0AAAAASUVORK5CYII="/><element name="muteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpiYBgFIw3MB+L/5Gj8j6yRiRTFyICJXHfTXyMLAXlGati4YDRFDj8AEGAABk8GSqqS4CoAAAAASUVORK5CYII="/><element name="unmuteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFgxz8p7bm+cQa+h8LHy7GhEcjIz4bmAjYykiun/8j0fakGPIfTfPgiSr6aB4FVAcAAQYAWdwR1G1Wd2gAAAAASUVORK5CYII="/><element name="volumeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGpJREFUeNpi/P//PwM9ABMDncCoRYPfIqqDZcuW1UPp/6AUDcNM1DQYKtRAlaAj1mCSLSLXYIIWUctgDItoZfDA5aOoqKhGEANIM9LVR7SymGDQUctikuOIXkFNdhHEOFrDjlpEd4sAAgwAriRMub95fu8AAAAASUVORK5CYII="/><element name="volumeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFtJREFUeNpi/P//PwM9ABMDncCoRYPfIlqAeij9H5SiYZiqBqPTlFqE02BKLSLaYFItIttgQhZRzWB8FjENiuRJ7aAbsMQwYMl7wDIsWUUQ42gNO2oR3S0CCDAAKhKq6MLLn8oAAAAASUVORK5CYII="/><element name="fullscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAE5JREFUeNpiYBgFo2DQA0YC8v/xqP1PjDlMRDrEgUgxkgHIlfZoriVGjmzLsLFHAW2D6D8eA/9Tw7L/BAwgJE90PvhPpNgoGAVDEQAEGAAMdhTyXcPKcAAAAABJRU5ErkJggg=="/><element name="normalscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEZJREFUeNpiYBgFo2DIg/9UUkOUAf8JiFFsyX88fJyAkcQgYMQjNkzBoAgiezyRbE+tFGSPxQJ7auYBmma0UTAKBhgABBgAJAEY6zON61sAAAAASUVORK5CYII="/></elements></component><component name="display"><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC"/><element name="playIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg=="/><element name="muteIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNrs1jEOgCAMBVAg7t5/8qaoIy4uoobyXsLCxA+0NCUAAADGUWvdQoQ41x4ixNBB2hBvBskdD3w5ZCkl3+33VqI0kjBBlh9rp+uTcyOP33TnolfsU85XX3yIRpQph8ZQY3wTZtU5AACASA4BBgDHoVuY1/fvOQAAAABJRU5ErkJggg=="/><element name="errorIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWlJREFUeNrsl+1twjAQhsHq/7BBYQLYIBmBDcoGMAIjtBPQTcII2SDtBDBBwrU6pGsUO7YbO470PtKJkz9iH++d4ywWAAAAAABgljRNsyWr2bZzDuJG1rLdZhcMbTjrBCGDyUKsqQLFciJb9bSvuG/WagRVRUVUI6gqy5HVeKWfSgRyJruKIU//TrZTSn2nmlaXThrloi/v9F2STC1W4+Aw5cBzkquRc09bofFNc6YLxEON0VUZS5FPTftO49vMjRsIF3RhOGr7/D/pJw+FKU+q0vDyq8W42jCunDqI3LC5XxNj2wHLU1XjaRnb0Lhykhqhhd8MtSF5J9tbjCv4mXGvKJz/65FF/qJryyaaIvzP2QRxZTX2nTuXjvV/VPFSwyLnW7mpH99yTh1FEVro6JBSd40/pMrRdV8vPtcKl28T2pT8TnFZ4yNosct3Q0io6JfBiz1FlGdqVQH3VHnepAEAAAAAADDzEGAAcTwB10jWgxcAAAAASUVORK5CYII="/><element name="bufferIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAuhJREFUeNrsWr9rU1EUznuNGqvFQh1ULOhiBx0KDtIuioO4pJuik3FxFfUPaAV1FTdx0Q5d2g4FFxehTnEpZHFoBy20tCIWtGq0TZP4HfkeHB5N8m6Sl/sa74XDybvv3vvOd8/Pe4lXrVZT3dD8VJc0B8QBcUAcEAfESktHGeR5XtMfqFQq/f92zPe/NbtGlKTdCY30kuxrpMGO94BlQCXs+rbh3ONgA6BlzP1p20d80gEI5hmA2A92Qua1Q2PtAFISM+bvjMG8U+Q7oA3rQGASwrYCU6WpNdLGYbA+Pq5jjXIiwi8EEa2UDbQSaKOIuV+SlkcCrfjY8XTI9EpKGwP0C2kru2hLtHqa4zoXtZRWyvi4CLwv9Opr6Hkn6A9HKgEANsQ1iqC3Ub/vRUk2JgmRkatK36kVrnt0qObunwUdUUMXMWYpakJsO5Am8tAw2GBIgwWA+G2S2dMpiw0gDioQRQJoKhRb1QiDwlHZUABYbaXWsm5ae6loTE4ZDxN4CZar8foVzOJ2iyZ2kWF3t7YIevffaMT5yJ70kQb2fQ1sE5SHr2wazs2wgMxgbsEKEAgxAvZUJbQLBGTSBMgNrncJbA6AljtS/eKDJ0Ez+DmrQEzXS2h1Ck25kAg0IZcUOaydCy4sYnN2fOA+2AP16gNoHALlQ+fwH7XO4CxLenUpgj4xr6ugY2roPMbMx+Xs18m/E8CVEIhxsNeg83XWOAN6grG3lGbk8uE5fr4B/WH3cJw+co/l9nTYsSGYCJ/lY5/qv0thn6nrIWmjeJcPSnWOeY++AkF8tpJHIMAUs/MaBBpj3znZfQo5psY+ZrG4gv5HickjEOymKjEeRpgyST6IuZcTcWbnjcgdPi5ghxciRKsl1lDSsgwA1i8fssonJgzmTSqfGUkCENndNdAL7PS6QQ7ZYISTo+1qq0LEWjTWcvY4isa4z+yfQB+7ooyHVg5RI7/i1Ijn/vnggDggDogD4oC00P4KMACd/juEHOrS4AAAAABJRU5ErkJggg=="/></elements></component><component name="dock"><elements><element name="button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFBJREFUeNrs0cEJACAQA8Eofu0fu/W6EM5ZSAFDRpKTBs00CQQEBAQEBAQEBAQEBAQEBATkK8iqbY+AgICAgICAgICAgICAgICAgIC86QowAG5PAQzEJ0lKAAAAAElFTkSuQmCC"/></elements></component><component name="playlist"><elements><element name="item" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAIAAAC1nk4lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHhJREFUeNrs2NEJwCAMBcBYuv/CFuIE9VN47WWCR7iocXR3pdWdGPqqwIoMjYfQeAiNh9B4JHc6MHQVHnjggQceeOCBBx77TifyeOY0iHi8DqIdEY8dD5cL094eePzINB5CO/LwcOTptNB4CP25L4TIbZzpU7UEGAA5wz1uF5rF9AAAAABJRU5ErkJggg=="/><element name="sliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADhJREFUeNrsy6ENACAMAMHClp2wYxZLAg5Fcu9e3OjuOKqqfTMzbs14CIZhGIZhGIZhGP4VLwEGAK/BBnVFpB0oAAAAAElFTkSuQmCC"/><element name="sliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADRJREFUeNrsy7ENACAMBLE8++8caFFKKiRffU53112SGs3ttOohGIZhGIZhGIZh+Fe8BRgAiaUGde6NOSEAAAAASUVORK5CYII="/></elements></component></components></skin>';

/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
jwplayer.html5.display = function(player) {
	if (player._model.components.display === undefined) {
		player._model.components.display = {};
		player._model.components.display.elements = jwplayer.html5.display.initializeDisplayElements(player);
		if (jwplayer.html5.utils.isiPhone()) {
			domelement.attr('poster', jwplayer.html5.utils.getAbsolutePath(player.config.image));
		} else {
			jwplayer.html5.display.setupDisplay(player);
			player.state(jwplayer.html5.display.stateHandler(player));
			player.mute(jwplayer.html5.display.stateHandler(player));
			player.error(function(obj) {
			});
		}
	}
};

jwplayer.html5.display.logoDefaults = {
	prefix: "http://l.longtailvideo.com/html5/0/",
	file: "logo.png",
	link: "http://www.longtailvideo.com/players/jw-flv-player/",
	margin: 8,
	out: 0.5,
	over: 1,
	timeout: 3,
	hide: "true",
	position: "bottom-left",
	width: 93,
	height: 30
};

jwplayer.html5.display.setupDisplay = function(player) {
	var meta = player.meta();
	var html = [];
	html.push("<div id='" + player.id + "_display'" + jwplayer.html5.display.getStyle(player, 'display') + ">");
	html.push("<div id='" + player.id + "_displayImage'" + jwplayer.html5.display.getStyle(player, 'displayImage') + ">&nbsp;</div>");
	html.push("<div id='" + player.id + "_displayIconBackground'" + jwplayer.html5.display.getStyle(player, 'displayIconBackground') + ">");
	html.push("<img id='" + player.id + "_displayIcon' src='" + player.skin.display.elements.playIcon.src + "' alt='Click to play video'" + jwplayer.html5.display.getStyle(player, 'displayIcon') + "/>");
	html.push('</div>');
	html.push('<div id="' + player.id + '_logo" target="_blank"' + jwplayer.html5.display.getStyle(player, 'logo') + '>&nbsp;</div>');
	html.push('</div>');
	player._model.components.display.domelement.before(html.join(''));
	jwplayer.html5.display.setupDisplayElements(player);
};


jwplayer.html5.display.getStyle = function(player, element) {
	var result = '';
	for (var style in player._model.components.display.elements[element].style) {
		result += style + ":" + player._model.components.display.elements[element].style[style] + ";";
	}
	if (result === '') {
		return ' ';
	}
	return ' style="' + result + '" ';
};


jwplayer.html5.display.setupDisplayElements = function(player) {
	var displayElements = jwplayer.html5.display.initializeDisplayElements(player);
	for (var element in displayElements) {
		var elementId = ['#', player.id, '_', element];
		player._model.components.display[element] = $(elementId.join(''));
		if (displayElements[element].click !== undefined) {
			player._model.components.display[element].click(displayElements[element].click);
		}
	}
};


jwplayer.html5.display.initializeDisplayElements = function(player) {
	var meta = player.meta();
	var elements = {
		display: {
			style: {
				cursor: 'pointer',
				width: meta.width + "px",
				height: meta.height + "px",
				position: 'relative',
				'z-index': 50,
				margin: 0,
				padding: 0
			},
			click: jwplayer.html5.display.displayClickHandler(player)
		},
		displayIcon: {
			style: {
				cursor: 'pointer',
				position: 'absolute',
				top: ((player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2) + "px",
				left: ((player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2) + "px",
				border: 0,
				margin: 0,
				padding: 0
			}
		},
		displayIconBackground: {
			style: {
				cursor: 'pointer',
				position: 'absolute',
				top: ((meta.height - player.skin.display.elements.background.height) / 2) + "px",
				left: ((meta.width - player.skin.display.elements.background.width) / 2) + "px",
				border: 0,
				'background-image': (['url(', player.skin.display.elements.background.src, ')']).join(''),
				width: player.skin.display.elements.background.width + "px",
				height: player.skin.display.elements.background.height + "px",
				margin: 0,
				padding: 0
			}
		},
		displayImage: {
			style: {
				display: 'block',
				background: ([player.config.screencolor, ' url(', jwplayer.html5.utils.getAbsolutePath(player.config.image), ') no-repeat center center']).join(''),
				width: meta.width + "px",
				height: meta.height + "px",
				position: 'absolute',
				cursor: 'pointer',
				left: 0,
				top: 0,
				margin: 0,
				padding: 0,
				'text-decoration': 'none'
			}
		},
		logo: {
			style: {
				position: 'absolute',
				width: jwplayer.html5.display.logoDefaults.width + "px",
				height: jwplayer.html5.display.logoDefaults.height + "px",
				'background-image': (['url(', jwplayer.html5.display.logoDefaults.prefix, jwplayer.html5.display.logoDefaults.file, ')']).join(''),
				margin: 0,
				padding: 0,
				display: 'none',
				'text-decoration': 'none'
			},
			click: jwplayer.html5.display.logoClickHandler()
		}
	};
	var positions = jwplayer.html5.display.logoDefaults.position.split("-");
	for (var position in positions) {
		elements.logo.style[positions[position]] = jwplayer.html5.display.logoDefaults.margin + "px";
	}
	return elements;
};


jwplayer.html5.display.displayClickHandler = function(player) {
	return function(evt) {
		if (player._media === undefined) {
			document.location.href = jwplayer.html5.utils.getAbsolutePath(player.meta().sources[player.meta().source].file);
			return;
		}
		if (typeof evt.preventDefault != 'undefined') {
			evt.preventDefault(); // W3C
		} else {
			evt.returnValue = false; // IE
		}
		if (player._model.state != jwplayer.html5.states.PLAYING) {
			player.play();
		} else {
			player.pause();
		}
	};
};


jwplayer.html5.display.logoClickHandler = function() {
	return function(evt) {
		evt.stopPropagation();
		return;
	};
};


jwplayer.html5.display.setIcon = function(player, path) {
	$("#" + player.id + "_displayIcon")[0].src = path;
};


jwplayer.html5.display.animate = function(element, state) {
	var speed = 'slow';
	if (!player._model.components.display.animate) {
		return;
	}
	if (state) {
		element.slideDown(speed, function() {
			jwplayer.html5.display.animate(element);
		});
	} else {
		element.slideUp(speed, function() {
			jwplayer.html5.display.animate(element, true);
		});
	}
};


jwplayer.html5.display.stateHandler = function(player) {
	return function(obj) {
		player = $.jwplayer(obj.id);
		player._model.components.display.animate = false;
		switch (player._model.state) {
			case jwplayer.html5.states.BUFFERING:
				displays[obj.id].logo.fadeIn(0, function() {
					setTimeout(function() {
						displays[obj.id].logo.fadeOut(jwplayer.html5.display.logoDefaults.out * 1000);
					}, jwplayer.html5.display.logoDefaults.timeout * 1000);
				});
				displays[obj.id].displayIcon[0].src = player.skin.display.elements.bufferIcon.src;
				displays[obj.id].displayIcon.css({
					"display": "block",
					top: (player.skin.display.elements.background.height - player.skin.display.elements.bufferIcon.height) / 2 + "px",
					left: (player.skin.display.elements.background.width - player.skin.display.elements.bufferIcon.width) / 2 + "px"
				});
				player._model.components.display.animate = true;
				// TODO: Buffer Icon rotation
				if (false) {
					jwplayer.html5.display.animate(displays[obj.id].displayIconBackground);
				}
				displays[obj.id].displayIconBackground.css('display', 'none');
				break;
			case jwplayer.html5.states.PAUSED:
				displays[obj.id].logo.fadeIn(0);
				displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
				displays[obj.id].displayIconBackground.css("display", "block");
				displays[obj.id].displayIcon[0].src = player.skin.display.elements.playIcon.src;
				displays[obj.id].displayIcon.css({
					"display": "block",
					top: (player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2 + "px",
					left: (player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2 + "px"
				});
				break;
			case jwplayer.html5.states.IDLE:
				displays[obj.id].logo.fadeOut(0);
				displays[obj.id].displayImage.css("background", "#ffffff url('" + jwplayer.html5.utils.getAbsolutePath(player.config.image) + "') no-repeat center center");
				displays[obj.id].displayIconBackground.css("display", "block");
				displays[obj.id].displayIcon[0].src = player.skin.display.elements.playIcon.src;
				displays[obj.id].displayIcon.css({
					"display": "block",
					top: (player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2 + "px",
					left: (player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2 + "px"
				});
				break;
			default:
				if (player.mute()) {
					displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
					displays[obj.id].displayIconBackground.css("display", "block");
					displays[obj.id].displayIcon[0].src = player.skin.display.elements.muteIcon.src;
					displays[obj.id].displayIcon.css({
						"display": "block",
						top: (player.skin.display.elements.muteIcon.height - player.skin.display.elements.muteIcon.height) / 2 + "px",
						left: (player.skin.display.elements.background.width - player.skin.display.elements.muteIcon.width) / 2 + "px"
					});
				} else {
					try {
						displays[obj.id].logo.clearQueue();
					} catch (err) {
					
					}
					displays[obj.id].logo.fadeIn(0, function() {
						setTimeout(function() {
							displays[obj.id].logo.fadeOut(jwplayer.html5.display.logoDefaults.out * 1000);
						}, jwplayer.html5.display.logoDefaults.timeout * 1000);
					});
					displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
					displays[obj.id].displayIconBackground.css("display", "none");
					displays[obj.id].displayIcon.css("display", "none");
				}
				break;
		}
	};
};

/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
jwplayer.html5.mediavideo = function(player) {
	player._model.domelement.attr('loop', player._model.config.repeat);
	var media = {
		play: jwplayer.html5.mediavideo.play(player),
		pause: jwplayer.html5.mediavideo.pause(player),
		seek: jwplayer.html5.mediavideo.seek(player),
		stop: jwplayer.html5.mediavideo.stop(player),
		volume: jwplayer.html5.mediavideo.volume(player),
		mute: jwplayer.html5.mediavideo.mute(player),
		fullscreen: jwplayer.html5.mediavideo.fullscreen(player),
		load: jwplayer.html5.mediavideo.load(player),
		resize: jwplayer.html5.mediavideo.resize(player),
		state: jwplayer.html5.states.IDLE,
		interval: null,
		loadcount: 0,
		hasChrome: false
	};
	player._media = media;
	media.mute(player.mute());
	media.volume(player.volume());
	$.each(jwplayer.html5.mediavideo.events, function(event, handler) {
		player.domelement.addEventListener(event, function(event) {
			handler(event, player);
		}, true);
	});
};

jwplayer.html5.mediavideo.states = {
	"ended": jwplayer.html5.states.IDLE,
	"playing": jwplayer.html5.states.PLAYING,
	"pause": jwplayer.html5.states.PAUSED,
	"buffering": jwplayer.html5.states.BUFFERING
};

jwplayer.html5.mediavideo.events = {
	'abort': jwplayer.html5.mediavideo.generalHandler,
	'canplay': jwplayer.html5.mediavideo.stateHandler,
	'canplaythrough': jwplayer.html5.mediavideo.stateHandler,
	'durationchange': jwplayer.html5.mediavideo.metaHandler,
	'emptied': jwplayer.html5.mediavideo.generalHandler,
	'ended': jwplayer.html5.mediavideo.stateHandler,
	'error': jwplayer.html5.mediavideo.errorHandler,
	'loadeddata': jwplayer.html5.mediavideo.metaHandler,
	'loadedmetadata': jwplayer.html5.mediavideo.metaHandler,
	'loadstart': jwplayer.html5.mediavideo.stateHandler,
	'pause': jwplayer.html5.mediavideo.stateHandler,
	'play': jwplayer.html5.mediavideo.positionHandler,
	'playing': jwplayer.html5.mediavideo.stateHandler,
	'progress': jwplayer.html5.mediavideo.progressHandler,
	'ratechange': jwplayer.html5.mediavideo.generalHandler,
	'seeked': jwplayer.html5.mediavideo.stateHandler,
	'seeking': jwplayer.html5.mediavideo.stateHandler,
	'stalled': jwplayer.html5.mediavideo.stateHandler,
	'suspend': jwplayer.html5.mediavideo.stateHandler,
	'timeupdate': jwplayer.html5.mediavideo.positionHandler,
	'volumechange': jwplayer.html5.mediavideo.generalHandler,
	'waiting': jwplayer.html5.mediavideo.stateHandler,
	'canshowcurrentframe': jwplayer.html5.mediavideo.generalHandler,
	'dataunavailable': jwplayer.html5.mediavideo.generalHandler,
	'empty': jwplayer.html5.mediavideo.generalHandler,
	'load': jwplayer.html5.mediavideo.generalHandler,
	'loadedfirstframe': jwplayer.html5.mediavideo.generalHandler
};

jwplayer.html5.mediavideo.stateHandler = function(event, player) {
	if (jwplayer.html5.mediavideo.states[event.type]) {
		jwplayer.html5.mediavideo.setState(player, jwplayer.html5.mediavideo.states[event.type]);
	}
};


jwplayer.html5.mediavideo.setState = function(player, newstate) {
	if (player._media.stopped) {
		newstate = jwplayer.html5.states.IDLE;
	}
	if (player._model.state != newstate) {
		var oldstate = player._model.state;
		player._media.state = newstate;
		player._model.state = newstate;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_PLAYER_STATE, {
			oldstate: oldstate,
			newstate: newstate
		});
	}
	if (newstate == jwplayer.html5.states.IDLE) {
		clearInterval(player._media.interval);
		player._media.interval = null;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE);
		if (player._model.config.repeat && !player._media.stopped) {
			player.play();
		}
		if (player._model.domelement.css('display') != 'none') {
			player._model.domelement.css('display', 'none');
		}
	}
	player._media.stopped = false;
};


jwplayer.html5.mediavideo.metaHandler = function(event, player) {
	var meta = {
		height: event.target.videoHeight,
		width: event.target.videoWidth,
		duration: event.target.duration
	};
	if (player._model.duration === 0) {
		player._model.duration = event.target.duration;
	}
	player._model.sources[player._model.source] = $.extend(player._model.sources[player._model.source], meta);
	player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_META, meta);
};


jwplayer.html5.mediavideo.positionHandler = function(event, player) {
	if (player._media.stopped) {
		return;
	}
	if (!jwplayer.html5.utils.isNull(event.target)) {
		if (player._model.duration === 0) {
			player._model.duration = event.target.duration;
		}
		
		if (player._media.state == jwplayer.html5.states.PLAYING) {
			player._model.position = Math.round(event.target.currentTime * 10) / 10;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_TIME, {
				position: Math.round(event.target.currentTime * 10) / 10,
				duration: Math.round(event.target.duration * 10) / 10
			});
		}
	}
	jwplayer.html5.mediavideo.progressHandler({}, player);
};


jwplayer.html5.mediavideo.progressHandler = function(event, player) {
	var bufferPercent, bufferTime, bufferFill;
	if (!isNaN(event.loaded / event.total)) {
		bufferPercent = event.loaded / event.total * 100;
		bufferTime = bufferPercent / 100 * (player._model.duration - player.domelement.currentTime);
	} else if ((player.domelement.buffered !== undefined) && (player.domelement.buffered.length > 0)) {
		maxBufferIndex = 0;
		if (maxBufferIndex >= 0) {
			bufferPercent = player.domelement.buffered.end(maxBufferIndex) / player.domelement.duration * 100;
			bufferTime = player.domelement.buffered.end(maxBufferIndex) - player.domelement.currentTime;
		}
	}
	
	bufferFill = bufferTime / player._model.config.bufferlength * 100;
	
	// TODO: Buffer underrun
	if (false) {
		if (bufferFill < 25 && player._media.state == jwplayer.html5.states.PLAYING) {
			jwplayer.html5.mediavideo.setState(jwplayer.html5.states.BUFFERING);
			player._media.bufferFull = false;
			if (!player.domelement.seeking) {
				player.domelement.pause();
			}
		} else if (bufferFill > 95 && player._media.state == jwplayer.html5.states.BUFFERING && player._media.bufferFull === false && bufferTime > 0) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
		}
	}
	
	if (player._media.bufferFull === false) {
		player._media.bufferFull = true;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
	}
	
	if (!player._media.bufferingComplete) {
		if (bufferPercent == 100 && player._media.bufferingComplete === false) {
			player._media.bufferingComplete = true;
		}
		
		if (!jwplayer.html5.utils.isNull(bufferPercent)) {
			player._model.buffer = Math.round(bufferPercent);
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER, {
				bufferPercent: Math.round(bufferPercent)
				//bufferingComplete: player._media.bufferingComplete,
				//bufferFull: player._media.bufferFull,
				//bufferFill: bufferFill,
				//bufferTime: bufferTime
			});
		}
		
	}
};


jwplayer.html5.mediavideo.startInterval = function(player) {
	if (player._media.interval === null) {
		player._media.interval = window.setInterval(function() {
			jwplayer.html5.mediavideo.positionHandler({}, player);
		}, 100);
	}
};


jwplayer.html5.mediavideo.errorHandler = function(event, player) {
	player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, {});
};


jwplayer.html5.mediavideo.play = function(player) {
	return function() {
		if (player._media.state != jwplayer.html5.states.PLAYING) {
			jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.PLAYING);
			player.domelement.play();
		}
	};
};


/** Switch the pause state of the player. **/
jwplayer.html5.mediavideo.pause = function(player) {
	return function() {
		player.domelement.pause();
	};
};


/** Seek to a position in the video. **/
jwplayer.html5.mediavideo.seek = function(player) {
	return function(position) {
		player.domelement.currentTime = position;
		player.domelement.play();
	};
};


/** Stop playback and loading of the video. **/
jwplayer.html5.mediavideo.stop = function(player) {
	return function() {
		player._media.stopped = true;
		player.domelement.pause();
		clearInterval(player._media.interval);
		player._media.interval = undefined;
		player._model.position = 0;
	};
};


/** Change the video's volume level. **/
jwplayer.html5.mediavideo.volume = function(player) {
	return function(position) {
		player._model.volume = position;
		player.domelement.volume = position / 100;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, {
			volume: Math.round(player.domelement.volume * 100)
		});
	};
};


/** Switch the mute state of the player. **/
jwplayer.html5.mediavideo.mute = function(player) {
	return function(state) {
		player._model.mute = state;
		player.domelement.muted = state;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, {
			mute: player.domelement.muted
		});
	};
};


/** Resize the player. **/
jwplayer.html5.mediavideo.resize = function(player) {
	return function(width, height) {
		// TODO: Fullscreen
		if (false) {
			$("#" + player.id + "_jwplayer").css("position", 'fixed');
			$("#" + player.id + "_jwplayer").css("top", '0');
			$("#" + player.id + "_jwplayer").css("left", '0');
			$("#" + player.id + "_jwplayer").css("width", width);
			$("#" + player.id + "_jwplayer").css("height", height);
			player._model.width = $("#" + player.id + "_jwplayer").width;
			player._model.height = $("#" + player.id + "_jwplayer").height;
		}
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_RESIZE, {
			fullscreen: player._model.fullscreen,
			width: width,
			hieght: height
		});
	};
};


/** Switch the fullscreen state of the player. **/
jwplayer.html5.mediavideo.fullscreen = function(player) {
	return function(state) {
		player._model.fullscreen = state;
		if (state === true) {
			player.resize("100%", "100%");
		} else {
			player.resize(player._model.config.width, player._model.config.height);
		}
	};
};


/** Load a new video into the player. **/
jwplayer.html5.mediavideo.load = function(player) {
	return function(path) {
		if (player._model.domelement.css('display') == 'none') {
			player._model.domelement.css('display', 'block');
		}
		
		setTimeout(function() {
			path = jwplayer.html5.utils.getAbsolutePath(path);
			if (path == player.domelement.src && player._media.loadcount > 0) {
				player._model.position = 0;
				player.domelement.currentTime = 0;
				jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.BUFFERING);
				jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.PLAYING);
				if (player.domelement.paused) {
					player.domelement.play();
				}
				return;
			} else if (path != player.domelement.src) {
				player._media.loadcount = 0;
			}
			player._media.loadcount++;
			player._media.bufferFull = false;
			player._media.bufferingComplete = false;
			jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.BUFFERING);
			player.domelement.src = path;
			player.domelement.load();
			jwplayer.html5.mediavideo.startInterval(player);
			try {
				player.domelement.currentTime = 0;
			} catch (err) {
			
			}
		}, 25);
	};
};
/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
jwplayer.html5.model = function(options) {
	$.extend(this.config, options);
	this.sources = this.config.sources;
	delete this.config.sources;
	for (var index in jwplayer.html5.model._configurableStateVariables) {
		var configurableStateVariable = jwplayer.html5.model._configurableStateVariables[index];
		this[configurableStateVariable] = this.config[configurableStateVariable];
	}
	return this;
};

jwplayer.html5.model.prototype = {
	components: {},
	sources: {},
	state: jwplayer.html5.states.IDLE,
	source: 0,
	position: 0,
	buffer: 0,
	config: {
		width: 480,
		height: 320,
		skin: undefined,
		file: undefined,
		image: undefined,
		start: 0,
		duration: 0,
		bufferlength: 5,
		volume: 90,
		mute: false,
		fullscreen: false,
		repeat: false,
		autostart: false,
		debug: undefined
	}
};

jwplayer.html5.model._configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen"];

jwplayer.html5.model.setActiveMediaProvider = function(player) {
	var source, sourceIndex;
	for (sourceIndex in player._model.sources) {
		source = player._model.sources[sourceIndex];
		if (source.type === undefined) {
			var extension = jwplayer.html5.utils.extension(source.file);
			if (extension == "ogv") {
				extension = "ogg";
			}
			source.type = 'video/' + extension + ';';
		}
		if (jwplayer.html5.utils.supportsType(source.type)) {
			player._model.source = sourceIndex;
			jwplayer.html5.mediaVideo(player);
			return true;
		}
	}
	return false;
};
/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */

/** Constructor **/
jwplayer.html5.skinner = function(player, completeHandler) {
	player.skin = {
		_completeHandler: completeHandler,
		properties: {}
	};
	jwplayer.html5.skinner.load(player);
};

/** Load the skin **/
jwplayer.html5.skinner.load = function(player) {
	$.ajax({
		url: jwplayer.html5.utils.getAbsolutePath(player._model.config.skin),
		complete: function(xmlrequest, textStatus) {
			if (textStatus == "success") {
				jwplayer.html5.skinner.loadSkin(player, xmlrequest.responseXML);
			} else {
				jwplayer.html5.skinner.loadSkin(player, jwplayer.html5.defaultSkin);
			}
		}
		
	});
};


jwplayer.html5.skinner.loadSkin = function(player, xml) {
	var components = $('component', xml);
	if (components.length === 0) {
		return;
	}
	for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
		player.skin._loading = true;
		
		var componentName = $(components[componentIndex]).attr('name');
		var component = {
			settings: {},
			elements: {}
		};
		player.skin[componentName] = component;
		var elements = $(components[componentIndex]).find('element');
		for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
			jwplayer.html5.skinner.loadImage(elements[elementIndex], componentName, player);
		}
		var settings = $(components[componentIndex]).find('setting');
		for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
			player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
		}
		
		player.skin._loading = false;
		
		jwplayer.html5.skinner.resetCompleteIntervalTest(player);
	}
};


jwplayer.html5.skinner.resetCompleteIntervalTest = function (player) {
	clearInterval(player.skin._completeInterval);
	player.skin._completeInterval = setInterval(function() {
		jwplayer.html5.skinner.checkComplete(player);
	}, 100);
};


/** Load the data for a single element. **/
jwplayer.html5.skinner.loadImage = function(element, component, player) {
	var img = new Image();
	var elementName = $(element).attr('name');
	var elementSource = $(element).attr('src');
	var skinUrl = jwplayer.html5.utils.getAbsolutePath(player._model.config.skin);
	var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
	var imgUrl = (elementSource.indexOf('data:image/png;base64,') === 0) ? elementSource : [skinRoot, component, elementSource].join('/');
	
	player.skin[component].elements[elementName] = {
		height: 0,
		width: 0,
		src: '',
		ready: false
	};
	
	$(img).load(jwplayer.html5.skinner.completeImageLoad(img, elementName, component, player));
	$(img).error(function() {
		player.skin[component].elements[elementName].ready = true;
		jwplayer.html5.skinner.resetCompleteIntervalTest(player);
	});
	
	img.src = imgUrl;
};


jwplayer.html5.skinner.checkComplete = function(player) {
	for (var component in player.skin) {
		if (component != 'properties') {
			for (var element in player.skin[component].elements) {
				if (!player.skin[component].elements[element].ready) {
					return;
				}
			}
		}
	}
	if (player.skin._loading === false) {
		clearInterval(player.skin._completeInterval);
		player.skin._completeHandler();
	}
};


jwplayer.html5.skinner.completeImageLoad = function(img, element, component, player) {
	return function() {
		player.skin[component].elements[element].height = img.height;
		player.skin[component].elements[element].width = img.width;
		player.skin[component].elements[element].src = img.src;
		player.skin[component].elements[element].ready = true;
		jwplayer.html5.skinner.resetCompleteIntervalTest(player);
	};
};


jwplayer.html5.skinner.hasComponent = function(player, component) {
	return (player.skin[component] !== null);
};


jwplayer.html5.skinner.getSkinElement = function(player, component, element) {
	try {
		return player.skin[component].elements[element];
	} catch (err) {
		jwplayer.html5.utils.log("No such skin component / element: ", [player, component, element]);
	}
	return null;
};


jwplayer.html5.skinner.addSkinElement = function(player, component, name, element) {
	try {
		player.skin[component][name] = element;
	} catch (err) {
		jwplayer.html5.utils.log("No such skin component ", [player, component]);
	}
};

jwplayer.html5.skinner.getSkinProperties = function(player) {
	return player.skin.properties;
};

/**
 * Utility methods for the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
/** Constructor **/
jwplayer.html5.utils = function() {
	return this.each(function() {
	});
};

//http://old.nabble.com/jQuery-may-add-$.browser.isiPhone-td11163329s27240.html
jwplayer.html5.utils.isiPhone = function() {
	var agent = navigator.userAgent.toLowerCase();
	return agent.match(/iPhone/i);
};

jwplayer.html5.utils.isiPad = function() {
	var agent = navigator.userAgent.toLowerCase();
	return agent.match(/iPad/i);
};

/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
jwplayer.html5.utils.supportsFlash = function() {
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
			if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
				version = (navigator.plugins['Shockwave Flash 2.0'] ||
				navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
			}
		} catch (e) {
		}
	}
	var major = parseInt(version.split(',')[0], 10);
	var minor = parseInt(version.split(',')[2], 10);
	if (major > 9 || (major == 9 && minor > 97)) {
		return true;
	} else {
		return false;
	}
};

/** Filetypes supported by Flash **/
var flashFileTypes = {
	'aac': true,
	'f4v': true,
	'flv': true,
	'm4a': true,
	'm4v': true,
	'mov': true,
	'mp3': true,
	'mp4': true
};


/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
jwplayer.html5.utils.flashCanPlay = function(fileName) {
	if (flashFileTypes[jwplayer.html5.utils.extension(fileName)]) {
		return true;
	}
	return false;
};

/** Check if this client supports playback for the specified type. **/
jwplayer.html5.utils.supportsType = function(type) {
	try {
		return !!document.createElement('video').canPlayType(type);
	} catch (e) {
		return false;
	}
};

/** Check if this client supports HTML5 H.264 playback. **/
jwplayer.html5.utils.supportsH264 = function() {
	return jwplayer.html5.utils.supportsType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
};


/** Check if this client supports HTML5 OGG playback. **/
jwplayer.html5.utils.supportsOgg = function() {
	return jwplayer.html5.utils.supportsType('video/ogg; codecs="theora, vorbis"');
};

/** Returns the extension of a file name **/
jwplayer.html5.utils.extension = function(path) {
	return path.substr(path.lastIndexOf('.') + 1, path.length);
};

/** Resets an element's CSS **/
/*jwplayer.html5.cSS = function(options) {
 return this.each(function() {
 var defaults = {
 'margin': 0,
 'padding': 0,
 'background': 'none',
 'border': 'none',
 'bottom': 'auto',
 'clear': 'none',
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
 //alert(jwplayer.html5.utils.dump(err));
 }
 });
 };*/
jwplayer.html5.utils.isNull = function(obj) {
	return ((obj === null) || (obj === undefined) || (obj === ""));
};

/** Gets an absolute file path based on a relative filepath **/
jwplayer.html5.utils.getAbsolutePath = function(path) {
	if (jwplayer.html5.utils.isNull(path)) {
		return path;
	}
	if (isAbsolutePath(path)) {
		return path;
	}
	var protocol = document.location.href.substr(0, document.location.href.indexOf("://") + 3);
	var basepath = document.location.href.substring(protocol.length, (path.indexOf("/") === 0) ? document.location.href.indexOf('/', protocol.length) : document.location.href.lastIndexOf('/'));
	var patharray = (basepath + "/" + path).split("/");
	var result = [];
	for (var i = 0; i < patharray.length; i++) {
		if (jwplayer.html5.utils.isNull(patharray[i]) || patharray[i] == ".") {
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
	if (jwplayer.html5.utils.isNull(path)) {
		return;
	}
	var protocol = path.indexOf("://");
	var queryparams = path.indexOf("?");
	return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
}


jwplayer.html5.utils.mapEmpty = function(map) {
	for (var val in map) {
		return false;
	}
	return true;
};

jwplayer.html5.utils.mapLength = function(map) {
	var result = 0;
	for (var val in map) {
		result++;
	}
	return result;
};


/** Dumps the content of an object to a string **/
jwplayer.html5.utils.dump = function(object, depth) {
	if (object === null) {
		return 'null';
	} else if (jwplayer.html5.utils.typeOf(object) != 'object') {
		if (jwplayer.html5.utils.typeOf(object) == 'string') {
			return "\"" + object + "\"";
		}
		return object;
	}
	
	var type = jwplayer.html5.utils.typeOf(object);
	
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
		result += jwplayer.html5.utils.dump(object[i], depth) + ",\n" + indent;
	}
	
	result = result.substring(0, result.length - 2 - depth) + "\n";
	
	result += indent.substring(0, indent.length - 1);
	result += (type == "array") ? "]" : "}";
	
	return result;
};

/** Returns the true type of an object **/
jwplayer.html5.utils.typeOf = function(value) {
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
jwplayer.html5.utils.log = function(msg, obj) {
	try {
		if (obj) {
			console.log("%s: %o", msg, obj);
		} else {
			console.log(jwplayer.html5.utils.dump(msg));
		}
	} catch (err) {
	}
	return this;
};


/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */

jwplayer.html5.view = function(player) {
	player._model.domelement.wrap("<div id='" + player.id + "_jwplayer' />");
	player._model.domelement.parent().css({
		position: 'relative',
		height: player._model.config.height + 'px',
		width: player._model.config.width + 'px',
		margin: 'auto',
		padding: 0,
		'background-color': player._model.config.screencolor
	});
	var display = (jwplayer.html5.utils.isiPhone() || !(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)) ? 'block' : 'none';
	player._model.domelement.css({
		position: 'absolute',
		width: player._model.config.width + 'px',
		height: player._model.config.height + 'px',
		top: 0,
		left: 0,
		'z-index': 0,
		margin: 'auto',
		display: display
	});
};