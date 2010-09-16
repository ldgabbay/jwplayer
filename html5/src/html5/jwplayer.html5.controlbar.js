/**
 * jwplayer controlbar component of the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _positions = {
		BOTTOM: 'BOTTOM',
		TOP: 'TOP',
		OVER: 'OVER'
	};
	
	
	/** Map with config for the jwplayerControlbar plugin. **/
	var _defaults = {
		fontsize: 10,
		fontcolor: '000000',
		position: _positions.BOTTOM,
		leftmargin: 0,
		rightmargin: 0,
		scrubber: 'none'
	};
	
	var _controlbar;
	
	jwplayer.html5.controlbar = function(player) {
		_controlbar = $.extend({}, _defaults, player.skin.controlbar.settings);
		_buildElements(player);
		_buildHandlers(player);
	};
	
	/** Draw the jwplayerControlbar elements. **/
	function _buildElements(player, domelement) {
		// Draw the background.
		player._model.domelement.parents(":first").append('<div id="' + player.id + '_jwplayerControlbar"></div>');
		$("#" + player.id + '_jwplayerControlbar').css('position', 'absolute');
		$("#" + player.id + '_jwplayerControlbar').css('height', player.skin.controlbar.elements.background.height);
		switch (_controlbar.position) {
			case _positions.TOP:
				$("#" + player.id + '_jwplayerControlbar').css('top', 0);
				break;
			default:
				$("#" + player.id + '_jwplayerControlbar').css('top', player.getHeight());
				player._model.domelement.parents(":first").css('height', parseInt(player._model.domelement.parents(":first").css('height').replace('px', '')) + player.skin.controlbar.elements.background.height);
				break;
		}
		$("#" + player.id + '_jwplayerControlbar').css('background', 'url(' + player.skin.controlbar.elements.background.src + ') repeat-x center left');
		// Draw all elements on top of the bar.
		_buildElement('capLeft', 'left', true, player);
		_buildElement('playButton', 'left', false, player);
		_buildElement('pauseButton', 'left', true, player);
		_buildElement('divider1', 'left', true, player);
		_buildElement('prevButton', 'left', true, player);
		_buildElement('divider2', 'left', true, player);
		_buildElement('nextButton', 'left', true, player);
		_buildElement('divider3', 'left', true, player);
		_buildElement('elapsedText', 'left', true, player);
		_buildElement('timeSliderRail', 'left', false, player);
		_buildElement('timeSliderBuffer', 'left', false, player);
		_buildElement('timeSliderProgress', 'left', false, player);
		_buildElement('timeSliderThumb', 'left', false, player);
		_buildElement('capRight', 'right', true, player);
		// TODO
		if (false) {
			_buildElement('fullscreenButton', 'right', false, player);
			_buildElement('normalscreenButton', 'right', true, player);
			_buildElement('divider4', 'right', true, player);
		}
		_buildElement('volumeSliderRail', 'right', false, player);
		_buildElement('volumeSliderProgress', 'right', true, player);
		_buildElement('muteButton', 'right', false, player);
		_buildElement('unmuteButton', 'right', true, player);
		_buildElement('divider5', 'right', true, player);
		_buildElement('durationText', 'right', true, player);
	}
	
	
	/** Draw a single element into the jwplayerControlbar. **/
	function _buildElement(element, align, offset, player) {
		var nam = player.id + '_' + element;
		$('#' + player.id + '_jwplayerControlbar').append('<div id="' + nam + '"></div>');
		$('#' + nam).css('position', 'absolute');
		$('#' + nam).css('top', '0px');
		if (element.indexOf('Text') > 0) {
			$('#' + nam).html('00:00');
			$('#' + nam).css('font', _controlbar.fontsize + 'px/' + (player.skin.controlbar.elements.background.height + 1) + 'px Arial,sans-serif');
			$('#' + nam).css('text-align', 'center');
			$('#' + nam).css('font-weight', 'bold');
			$('#' + nam).css('cursor', 'default');
			var wid = 14 + 3 * _controlbar.fontsize;
			$('#' + nam).css('color', '#' + _controlbar.fontcolor.substr(-6));
		} else if (element.indexOf('divider') === 0) {
			$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements.divider.src + ') repeat-x center left');
			var wid = player.skin.controlbar.elements.divider.width;
		} else {
			$('#' + nam).css('background', 'url(' + player.skin.controlbar.elements[element].src + ') repeat-x center left');
			var wid = player.skin.controlbar.elements[element].width;
		}
		if (align == 'left') {
			$('#' + nam).css(align, _controlbar.leftmargin);
			if (offset) {
				_controlbar.leftmargin += wid;
			}
		} else if (align == 'right') {
			$('#' + nam).css(align, _controlbar.rightmargin);
			if (offset) {
				_controlbar.rightmargin += wid;
			}
		}
		$('#' + nam).css('width', wid);
		$('#' + nam).css('height', player.skin.controlbar.elements.background.height);
	}
	
	
	/** Add interactivity to the jwplayerControlbar elements. **/
	function _buildHandlers(player) {
		// Register events with the buttons.
		_buildHandler('playButton', 'play', player);
		_buildHandler('pauseButton', 'pause', player);
		_buildHandler('prevButton', 'playlistPrev', player);
		_buildHandler('nextButton', 'playlistNext', player);
		_buildHandler('muteButton', 'setMute', player, true);
		_buildHandler('unmuteButton', 'setMute', player, false);
		_buildHandler('fullscreenButton', 'setFullscreen', player, true);
		_buildHandler('normalscreenButton', 'setFullscreen', player, false);
		
		_addSliders(player);
		
		// Register events with the player.
		player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
		player.addEventListener(jwplayer.html5.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_TIME, _timeHandler);
		player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, _muteHandler);
		player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
		player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
		
		// Trigger a few events so the bar looks good on startup.
		_resizeHandler({
			id: player.id,
			fulscreen: player.getFullscreen(),
			width: player.getWidth(),
			height: player.getHeight()
		});
		_timeHandler({
			id: player.id,
			duration: player.getDuration(),
			position: 0
		});
		_bufferHandler({
			id: player.id,
			bufferProgress: 0
		});
		_muteHandler({
			id: player.id,
			mute: player.getMute()
		});
		_stateHandler({
			id: player.id,
			newstate: jwplayer.html5.states.IDLE
		});
		_volumeHandler({
			id: player.id,
			volume: player.getVolume()
		});
	}
	
	
	/** Set a single button handler. **/
	function _buildHandler(element, handler, player, args) {
		var nam = player.id + '_' + element;
		$('#' + nam).css('cursor', 'pointer');
		if (handler == 'fullscreen') {
			$('#' + nam).mouseup(function(evt) {
				evt.stopPropagation();
				player.setFullscreen(!player.getFullscreen());
				_resizeHandler({
					id: player.id,
					fullscreen: player.getFullscreen(),
					width: player.getWidth(),
					height: player.getHeight()
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
	}
	
	
	/** Set the volume drag handler. **/
	function _addSliders(player) {
		var bar = '#' + player.id + '_jwplayerControlbar';
		var trl = '#' + player.id + '_timeSliderRail';
		var vrl = '#' + player.id + '_volumeSliderRail';
		$(bar).css('cursor', 'pointer');
		$(trl).css('cursor', 'pointer');
		$(vrl).css('cursor', 'pointer');
		$(bar).mousedown(function(evt) {
			if (evt.pageX >= $(trl).offset().left - window.pageXOffset && evt.pageX <= $(trl).offset().left - window.pageXOffset + $(trl).width()) {
				_controlbar.scrubber = 'time';
			} else if (evt.pageX >= $(vrl).offset().left - window.pageXOffset && evt.pageX <= $(vrl).offset().left - window.pageXOffset + $(trl).width()) {
				_controlbar.scrubber = 'volume';
			}
		});
		$(bar).mouseup(function(evt) {
			evt.stopPropagation();
			_sliderUp(evt.pageX, player);
		});
		$(bar).mousemove(function(evt) {
			if (_controlbar.scrubber == 'time') {
				_controlbar.mousedown = true;
				var xps = evt.pageX - $(bar).offset().left - window.pageXOffset;
				$('#' + player.id + '_timeSliderThumb').css('left', xps);
			}
		});
	}
	
	
	/** The slider has been moved up. **/
	function _sliderUp(msx, player) {
		_controlbar.mousedown = false;
		if (_controlbar.scrubber == 'time') {
			var xps = msx - $('#' + player.id + '_timeSliderRail').offset().left + window.pageXOffset;
			var wid = $('#' + player.id + '_timeSliderRail').width();
			var pos = xps / wid * _controlbar.currentDuration;
			if (pos < 0) {
				pos = 0;
			} else if (pos > _controlbar.currentDuration) {
				pos = _controlbar.currentDuration - 3;
			}
			player.seek(pos);
			if (player.getState() != jwplayer.html5.states.PLAYING) {
				player.play();
			}
		} else if (_controlbar.scrubber == 'volume') {
			var xps = msx - $('#' + player.id + '_volumeSliderRail').offset().left - window.pageXOffset;
			var wid = $('#' + player.id + '_volumeSliderRail').width();
			var pct = Math.round(xps / wid * 100);
			if (pct < 0) {
				pct = 0;
			} else if (pct > 100) {
				pct = 100;
			}
			if (player._model.mute) {
				player.setMute(false);
			}
			player.setVolume(pct);
		}
		_controlbar.scrubber = 'none';
	}
	
	
	/** Update the buffer percentage. **/
	function _bufferHandler(event) {
		if (!jwplayer.html5.utils.isNull(event.bufferPercent)) {
			_controlbar.currentBuffer = event.bufferPercent;
		}
		
		var wid = $('#' + event.id + '_timeSliderRail').width();
		var bufferWidth = isNaN(Math.round(wid * _controlbar.currentBuffer / 100)) ? 0 : Math.round(wid * _controlbar.currentBuffer / 100);
		$('#' + event.id + '_timeSliderBuffer').css('width', bufferWidth);
	}
	
	
	/** Update the mute state. **/
	function _muteHandler(event) {
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
	function _stateHandler(event) {
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
	}
	
	
	/** Handles event completion **/
	function _completeHandler(event) {
		_timeHandler($.extend(event, {
			position: 0,
			duration: _controlbar.currentDuration
		}));
	}
	
	
	/** Update the playback time. **/
	function _timeHandler(event) {
		if (!jwplayer.html5.utils.isNull(event.position)) {
			_controlbar.currentPosition = event.position;
		}
		if (!jwplayer.html5.utils.isNull(event.duration)) {
			_controlbar.currentDuration = event.duration;
		}
		var progress = (_controlbar.currentPosition === _controlbar.currentDuration === 0) ? 0 : _controlbar.currentPosition / _controlbar.currentDuration;
		var railWidth = $('#' + event.id + '_timeSliderRail').width();
		var thumbWidth = $('#' + event.id + '_timeSliderThumb').width();
		var railLeft = $('#' + event.id + '_timeSliderRail').position().left;
		var progressWidth = isNaN(Math.round(railWidth * progress)) ? 0 : Math.round(railWidth * progress);
		var thumbPosition = railLeft + progressWidth;
		
		$('#' + event.id + '_timeSliderProgress').css('width', progressWidth);
		if (!_controlbar.mousedown) {
			$('#' + event.id + '_timeSliderThumb').css('left', thumbPosition);
		}
		
		$('#' + event.id + '_durationText').html(_timeFormat(_controlbar.currentDuration));
		$('#' + event.id + '_elapsedText').html(_timeFormat(_controlbar.currentPosition));
	}
	
	
	/** Format the elapsed / remaining text. **/
	function _timeFormat(sec) {
		str = '00:00';
		if (sec > 0) {
			str = Math.floor(sec / 60) < 10 ? '0' + Math.floor(sec / 60) + ':' : Math.floor(sec / 60) + ':';
			str += Math.floor(sec % 60) < 10 ? '0' + Math.floor(sec % 60) : Math.floor(sec % 60);
		}
		return str;
	}
	
	
	/** Flip the player size to/from full-browser-screen. **/
	function _resizeHandler(event) {
		_controlbar.width = event.width;
		_controlbar.fullscreen = event.fullscreen;
		if (event.fullscreen) {
			$('#' + event.id + '_normalscreenButton').css('display', 'block');
			$('#' + event.id + '_fullscreenButton').css('display', 'none');
			// TODO
			if (false) {
				$(window).resize(function() {
					_resizeBar(player);
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
		_resizeBar(event);
		_timeHandler(event);
		_bufferHandler(event);
	}
	
	
	/** Resize the jwplayerControlbar. **/
	function _resizeBar(event) {
		var lft = _controlbar.left;
		var top = _controlbar.top;
		var wid = _controlbar.width;
		var hei = $('#' + event.id + '_jwplayerControlbar').height();
		if (_controlbar.position == 'over') {
			lft += 1 * _controlbar.margin;
			top -= 1 * _controlbar.margin + hei;
			wid -= 2 * _controlbar.margin;
		}
		if (_controlbar.fullscreen) {
			lft = _controlbar.margin;
			top = $(window).height() - _controlbar.margin - hei;
			wid = $(window).width() - 2 * _controlbar.margin;
			$('#' + event.id + '_jwplayerControlbar').css('z-index', 99);
		} else {
			$('#' + event.id + '_jwplayerControlbar').css('z-index', 97);
		}
		$('#' + event.id + '_jwplayerControlbar').css('left', lft);
		$('#' + event.id + '_jwplayerControlbar').css('top', top);
		$('#' + event.id + '_jwplayerControlbar').css('width', wid);
		$('#' + event.id + '_timeSliderRail').css('width', (wid - _controlbar.leftmargin - _controlbar.rightmargin));
	}
	
	
	/** Update the volume level. **/
	function _volumeHandler(event) {
		var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
		var railWidth = $('#' + event.id + '_volumeSliderRail').width();
		var railRight = parseInt($('#' + event.id + '_volumeSliderRail').css('right').toString().replace('px', ''), 10);
		var progressWidth = isNaN(Math.round(railWidth * progress)) ? 0 : Math.round(railWidth * progress);
		
		$('#' + event.id + '_volumeSliderProgress').css('width', progressWidth);
		$('#' + event.id + '_volumeSliderProgress').css('right', (railWidth + railRight - progressWidth));
	}
	
})(jwplayer);
