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
		// TODO
		if (false) {
			buildElement('fullscreenButton', 'right', false, player);
			buildElement('normalscreenButton', 'right', true, player);
			buildElement('divider2', 'right', true, player);
		}
		if (!$.fn.jwplayerUtils.isiPad()) {
			buildElement('volumeSliderRail', 'right', false, player);
			buildElement('volumeSliderProgress', 'right', true, player);
			buildElement('muteButton', 'right', false, player);
			buildElement('unmuteButton', 'right', true, player);
			buildElement('divider3', 'right', true, player);
		}
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
			duration: player.duration(),
			position: 0
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
		$(bar).css('cursor', 'pointer');
		$(trl).css('cursor', 'pointer');
		$(vrl).css('cursor', 'pointer');
		$(bar).mousedown(function(evt) {
			if (evt.pageX >= $(trl).offset().left - window.pageXOffset && evt.pageX <= $(trl).offset().left - window.pageXOffset + $(trl).width()) {
				controlbars[player.id].scrubber = 'time';
			} else if (evt.pageX >= $(vrl).offset().left - window.pageXOffset && evt.pageX <= $(vrl).offset().left - window.pageXOffset + $(trl).width()) {
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
				var xps = evt.pageX - $(bar).offset().left - window.pageXOffset;
				$('#' + player.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function sliderUp(msx, player) {
		controlbars[player.id].mousedown = false;
		if (controlbars[player.id].scrubber == 'time') {
			var xps = msx - $('#' + player.id + '_timeSliderRail').offset().left + window.pageXOffset;
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
			var xps = msx - $('#' + player.id + '_volumeSliderRail').offset().left - window.pageXOffset;
			var wid = $('#' + player.id + '_volumeSliderRail').width();
			var pct = Math.round(xps / wid * 100);
			if (pct < 0) {
				pct = 0;
			} else if (pct > 100) {
				pct = 100;
			}
			if (player.model.mute) {
				player.mute(false);
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
		
		var wid = $('#' + event.id + '_timeSliderRail').width();
		var bufferWidth = isNaN(Math.round(wid * controlbars[event.id].currentBuffer / 100)) ? 0 : Math.round(wid * controlbars[event.id].currentBuffer / 100);
		$('#' + event.id + '_timeSliderBuffer').css('width', bufferWidth);
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
		var progressWidth = isNaN(Math.round(railWidth * progress)) ? 0 : Math.round(railWidth * progress);
		var thumbPosition = railLeft + progressWidth;
		
		$('#' + event.id + '_timeSliderProgress').css('width', progressWidth);
		if (!controlbars[event.id].mousedown) {
			$('#' + event.id + '_timeSliderThumb').css('left', thumbPosition);
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
			// TODO
			if (false) {
				$(window).resize(function() {
					resizeBar(player);
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
		var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
		var railWidth = $('#' + event.id + '_volumeSliderRail').width();
		var railRight = parseInt($('#' + event.id + '_volumeSliderRail').css('right').toString().replace('px', ''), 10);
		var progressWidth = isNaN(Math.round(railWidth * progress)) ? 0 : Math.round(railWidth * progress);
		
		$('#' + event.id + '_volumeSliderProgress').css('width', progressWidth);
		$('#' + event.id + '_volumeSliderProgress').css('right', (railWidth + railRight - progressWidth));
	}
	
	
})(jQuery);
