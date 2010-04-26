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
			mute: obj.mute
		});
	};
	
	$.fn.jwplayerControlbar.stateHandler = function(obj) {
		stateHandler({
			id: obj.id,
			state: obj.newstate
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
			volume: obj.volume
		});
	};
	
	
	/** Draw the jwplayerControlbar elements. **/
	function buildElements(player) {
		// Draw the background.
		player.model.domelement.parents(":first").append('<div id="' + player.id + '_jwplayerControlbar"></div>');
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
		buildHandler('muteButton', 'mute', player, true);
		buildHandler('unmuteButton', 'mute', player, false);
		buildHandler('fullscreenButton', 'fullscreen', player, true);
		buildHandler('normalscreenButton', 'fullscreen', player, false);
		
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
	function buildHandler(element, handler, player, args) {
		var nam = player.id + '_' + element;
		$('#' + nam).css('cursor', 'pointer');
		if (handler == 'fullscreen') {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				player.fullscreen(!player.fullscreen());
				fullscreenHandler(player);
			});
		} else {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				if (args !== undefined) {
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
			var xps = evt.pageX - $(bar).position().left - $('#' + player.id + '_jwplayerControlbar').parents(":first").position().left;
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
				$('#' + player.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function sliderUp(msx, player) {
		if (player.controlbar.scrubber == 'time') {
			var xps = msx - $('#' + player.id + '_timeSliderRail').position().left - $('#' + player.id + '_jwplayerControlbar').parents(":first").position().left;
			var wid = $('#' + player.id + '_timeSliderRail').width();
			var pos = xps / wid * player.duration();
			if (pos < 0) {
				pos = 0;
			} else if (pos > player.controlbar.duration) {
				pos = player.controlbar.duration - 3;
			}
			player.seek(pos);
		} else if (player.controlbar.scrubber == 'volume') {
			var bar = $('#' + player.id + '_jwplayerControlbar').width();
			var brx = $('#' + player.id + '_jwplayerControlbar').position().left + $('#' + player.id + '_jwplayerControlbar').parents(":first").position().left;
			var rig = $('#' + player.id + '_volumeSliderRail').css('right').substr(0, 2);
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
			$('#' + player.id + '_timeSliderBuffer').css('display', 'none');
		} else {
			if (player.state() != $.fn.jwplayer.states.IDLE) {
				$('#' + player.id + '_timeSliderBuffer').css('display', 'block');
			}
			var wid = $('#' + player.id + '_timeSliderRail').width();
			$('#' + player.id + '_timeSliderBuffer').css('width', Math.round(wid * event.bufferPercent / 100));
		}
	}
	
	
	/** Update the mute state. **/
	function muteHandler(event) {
		var player = $.jwplayer(event.id);
		if (player.mute()) {
			$('#' + player.id + '_muteButton').css('display', 'none');
			$('#' + player.id + '_unmuteButton').css('display', 'block');
			$('#' + player.id + '_volumeSliderProgress').css('display', 'none');
		} else {
			$('#' + player.id + '_muteButton').css('display', 'block');
			$('#' + player.id + '_unmuteButton').css('display', 'none');
			$('#' + player.id + '_volumeSliderProgress').css('display', 'block');
		}
	}
	
	
	/** Update the playback state. **/
	function stateHandler(event) {
		var player = $.jwplayer(event.id);
		if (player.state() == $.fn.jwplayer.states.BUFFERING || player.state() == $.fn.jwplayer.states.PLAYING) {
			$('#' + player.id + '_pauseButton').css('display', 'block');
			$('#' + player.id + '_playButton').css('display', 'none');
		} else {
			$('#' + player.id + '_pauseButton').css('display', 'none');
			$('#' + player.id + '_playButton').css('display', 'block');
		}
		if (player.state() == $.fn.jwplayer.states.IDLE) {
			timeHandler({
				id: player.id,
				position: 0
			});
		}
	}
	
	
	/** Update the playback time. **/
	function timeHandler(event) {
		var player = $.jwplayer(event.id);
		var wid = $('#' + player.id + '_timeSliderRail').width();
		var thb = $('#' + player.id + '_timeSliderThumb').width();
		var lft = $('#' + player.id + '_timeSliderRail').position().left;
		if (player.state() == $.fn.jwplayer.states.IDLE) {
			$('#' + player.id + '_timeSliderBuffer').css('display', 'none');
		} else {
			$('#' + player.id + '_timeSliderBuffer').css('display', 'block');
		}
		if (event.position === 0) {
			$('#' + player.id + '_timeSliderProgress').css('display', 'none');
			$('#' + player.id + '_timeSliderThumb').css('display', 'none');
		} else {
			$('#' + player.id + '_timeSliderProgress').css('display', 'block');
			$('#' + player.id + '_timeSliderProgress').css('width', Math.round(wid * event.position / event.duration));
			$('#' + player.id + '_timeSliderThumb').css('display', 'block');
			$('#' + player.id + '_timeSliderThumb').css('left', lft +
			Math.round((wid - thb) * event.position / event.duration));
			$('#' + player.id + '_durationText').html(timeFormat(event.duration));
		}
		$('#' + player.id + '_elapsedText').html(timeFormat(event.position));
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
		if (player.fullscreen()) {
			//$('#' + options.div).css('position', 'absolute');
			//$('#' + options.div).css('left', 0);
			//$('#' + options.div).css('top', 0);
			//$('#' + options.div).css('height', '100%');
			//$('#' + options.div).css('width', '100%');
			$('#' + player.id + '_normalscreenButton').css('display', 'block');
			$('#' + player.id + '_fullscreenButton').css('display', 'none');
			$(window).resize(function() {
				resizeBar(player);
			});
		} else {
			//$('#' + options.div).css('position', 'relative');
			//$('#' + options.div).css('left', options.left);
			//$('#' + options.div).css('top', options.top);
			//$('#' + options.div).css('height', options.height);
			//$('#' + options.div).css('width', options.width);
			$('#' + player.id + '_normalscreenButton').css('display', 'none');
			$('#' + player.id + '_fullscreenButton').css('display', 'block');
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
		var hei = $('#' + player.id + '_jwplayerControlbar').height();
		if (player.controlbar.position == 'over') {
			lft += 1 * player.controlbar.margin;
			top -= 1 * player.controlbar.margin + hei;
			wid -= 2 * player.controlbar.margin;
		}
		if (player.fullscreen()) {
			lft = player.controlbar.margin;
			top = $(window).height() - player.controlbar.margin - hei;
			wid = $(window).width() - 2 * player.controlbar.margin;
			$('#' + player.id + '_jwplayerControlbar').css('z-index', 99);
		} else {
			$('#' + player.id + '_jwplayerControlbar').css('z-index', 97);
		}
		$('#' + player.id + '_jwplayerControlbar').css('left', lft);
		$('#' + player.id + '_jwplayerControlbar').css('top', top);
		$('#' + player.id + '_jwplayerControlbar').css('width', wid);
		$('#' + player.id + '_timeSliderRail').css('width', wid - player.controlbar.leftmargin - player.controlbar.rightmargin);
	}
	
	
	/** Update the volume level. **/
	function volumeHandler(event) {
		var player = $.jwplayer(event.id);
		var rwd = $('#' + player.id + '_volumeSliderRail').width();
		var wid = Math.round(event.volume / 100 * rwd);
		var rig = $('#' + player.id + '_volumeSliderRail').css('right').substr(0, 2);
		$('#' + player.id + '_volumeSliderProgress').css('width', wid);
		$('#' + player.id + '_volumeSliderProgress').css('right', 1 * rig + rwd - wid);
	}
	
	
})(jQuery);
