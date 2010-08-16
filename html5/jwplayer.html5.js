/**
 * Core component of the JW Player (initialization, API).
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _player = {
		id: undefined,
		version: "1.0",
		skin: undefined,
		_model: undefined,
		_view: undefined,
		_controller: undefined,
		_listeners: {},
		_media: undefined,
		_domelement: undefined
	};
	
	jwplayer.html5 = function(domelement) {
		_player._domelement = domelement;
		_player.id = domelement.id;
		_player.setup = setup;
		return _player;
	};
		
	function setup (options) {
		jwplayer.html5.utils.log("Starting setup", _player);
		_setup(_player, 0, options);
		return _player;
	}
	
	function _setup(player, step, options) {
		//try {
			switch (step) {
				case 0:
					player._model = new jwplayer.html5.model(options);
					player._model.domelement = $('#'+_player.id);
					_setup(player, step + 1);
					break;
				case 1:
					player._controller = jwplayer.html5.controller(player);
					_setup($.extend(player, jwplayer.html5._api(player)), step + 1);
					break;
				case 2:
					jwplayer.html5.skinner(player, function() {
						_setup(player, step + 1);
					});
					break;
				case 3:
					jwplayer.html5.view(player);
					_setup(player, step + 1);
					break;
				case 4:
					jwplayer.html5.model.setActiveMediaProvider(player);
					if ((player._media === undefined) || !player._media.hasChrome) {
						_setup(player, step + 1);
					}
					break;
				case 5:
					jwplayer.html5.display(player, player._model.domelement);
					if (player._media === undefined) {
						player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
					} else {
						_setup(player, step + 1);
					}
					break;
				case 6:
					jwplayer.html5.controlbar(player, player._model.domelement);
					_setup(player, step + 1);
					break;
				case 7:
					player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
					_setup(player, step + 1);
					break;
				default:
					if (player.getConfig().autostart === true) {
						player.play();
					}
					break;
			}
		//} catch (err) {
		//	jwplayer.html5.utils.log("Setup failed at step " + step, err);
		//}
	}
})(jwplayer);

/**
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.states = {
		IDLE: 'IDLE',
		BUFFERING: 'BUFFERING',
		PLAYING: 'PLAYING',
		PAUSED: 'PAUSED'
	};
})(jwplayer);
/**
 * JWPlayer events
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.events = {
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
		JWPLAYER_PLAYLIST_LOADED: 'jwplayerPlaylistLoaded',
		JWPLAYER_PLAYLIST_UPDATED: 'jwplayerPlaylistUpdated',
		JWPLAYER_PLAYLIST_ITEM: 'jwplayerPlaylistItem',
		JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState'
	};
})(jwplayer);
/** 
 * A factory for API calls that either set listeners or return data
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5._api = function(player) {
		return {
			play: player._controller.play,
			pause: player._controller.pause,
			stop: player._controller.stop,
			seek: player._controller.seek,
			
			resize: player._controller.resize,
			//fullscreen: player._controller.fullscreen,
			//volume: player._controller.volume,
			//mute: player._controller.mute,
			load: player._controller.load,
			
			addEventListener: player._controller.addEventListener,
			removeEventListener: player._controller.removeEventListener,
			sendEvent: player._controller.sendEvent,
			
			//ready: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_READY),
			//error: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_ERROR),
			//complete: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE),
			//state: _dataListenerFactory(player, 'state', jwplayer.html5.events.JWPLAYER_PLAYER_STATE),
			//buffer: _dataListenerFactory(player, 'buffer', jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER),
			//time: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_TIME),
			//meta: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_META)
			
			getPosition: _dataListenerFactory(player, 'position'),
			getDuration: _dataListenerFactory(player, 'duration'),
			getBuffer: _dataListenerFactory(player, 'buffer'),
			getWidth: _dataListenerFactory(player, 'width'),
			getHeight: _dataListenerFactory(player, 'height'),
			getFullscreen: _dataListenerFactory(player, 'buffer'),
			setFullscreen: player._controller.fullscreen,
			getVolume: _dataListenerFactory(player, 'volume'),
			setVolume: player._controller.volume,
			getMute: _dataListenerFactory(player, 'mute'),
			setMute: player._controller.mute,
			
			getState: function(){
				return player._media.getState();
			},
			
			getConfig: function(){
				return player._model.config;
			},
			getVersion: function() {
				return player.version;
			},
			getPlaylist: function() {
				return player._model.playlist;
			},
			playlistItem: function(item) {
				return player._controller.item(item);
			},
			playlistNext: function() {
				return player._controller.next();
			},
			playlistPrev: function() {
				return player._controller.prev();
			},
			
			//UNIMPLEMENTED
			getLevel: function() {
			},
			getBandwidth: function() {
			},
			getLockState: function() {
			},
			lock: function() {
			},
			unlock: function() {
			}
			
		};
	};
	
	function _dataListenerFactory(player, dataType, eventType) {
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
	}
	
})(jwplayer);
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
/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.controller = function(player) {
		return {
			play: _play(player),
			pause: _pause(player),
			seek: _seek(player),
			stop: _stop(player),
			prev: _prev(player),
			next: _next(player),
			item: _item(player),
			volume: _volume(player),
			mute: _mute(player),
			resize: _resize(player),
			fullscreen: _fullscreen(player),
			load: _load(player),
			mediaInfo: _mediaInfo(player),
			addEventListener: _addEventListener(player),
			removeEventListener: _removeEventListener(player),
			sendEvent: _sendEvent(player)
		};
	};
	
	_mediainfovariables = ["width", "height", "state", "playlist", "item", "position", "buffer", "duration", "volume", "mute", "fullscreen"];
	
	function _play(player) {
		return function() {
			try {
				switch (player.getState()) {
					case jwplayer.html5.states.IDLE:
						player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, player._media.play);
						player._media.load(player._model.playlist[player._model.item]);
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
	}
	
	
	/** Switch the pause state of the player. **/
	function _pause(player) {
		return function() {
			try {
				switch (player.getState()) {
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
	}
	
	
	/** Seek to a position in the video. **/
	function _seek(player) {
		return function(position) {
			try {
				switch (player.getState()) {
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
	}
	
	
	/** Stop playback and loading of the video. **/
	function _stop(player) {
		return function() {
			try {
				player._media.stop();
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Stop playback and loading of the video. **/
	function _next(player) {
		return function() {
			try {
				if (player._model.item + 1 == player._model.playlist.length){
					return player.playlistItem(0);
				} else {
					return player.playlistItem(player._model.item + 1);
				}
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
		/** Stop playback and loading of the video. **/
	function _prev(player) {
		return function() {
			try {
				if (player._model.item === 0){
					return player.playlistItem(player._model.playlist.length - 1);
				} else {
					return player.playlistItem(player._model.item - 1);
				}
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Stop playback and loading of the video. **/
	function _item(player) {
		return function(item) {
			try {
				var oldstate = player.getState();
				player.stop();
				player._model.item = item;
				player.sendEvent(jwplayer.html5.events.JWPLAYER_PLAYLIST_ITEM, {"item":item});
				if (oldstate == jwplayer.html5.states.PLAYING || oldstate == jwplayer.html5.states.BUFFERING){
					player.play();
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}	
	/** Get / set the video's volume level. **/
	function _volume(player) {
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
	}
	
	
	/** Get / set the mute state of the player. **/
	function _mute(player) {
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
	}
	
	
	/** Resizes the video **/
	function _resize(player) {
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
	}
	
	
	/** Jumping the player to/from fullscreen. **/
	function _fullscreen(player) {
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
	}
	
	
	/** Loads a new video **/
	function _load(player) {
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
	}
	
	
	/** Returns the meta **/
	function _mediaInfo(player) {
		return function() {
			try {
				var result = {};
				for (var index in _mediainfovariables) {
					var mediavar = _mediainfovariables[index];
					result[mediavar] = player._model[mediavar];
				}
				return result;
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
	}
	
	
	/** Add an event listener. **/
	function _addEventListener(player) {
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
	}
	
	
	/** Remove an event listener. **/
	function _removeEventListener(player) {
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
	}
	
	
	/** Send an event **/
	function _sendEvent(player) {
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
	}
	
})(jwplayer);
/**
 * JW Player Default skin
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.defaultSkin = '<?xml version="1.0" ?><skin author="LongTail Video" name="Five" version="1.0"><settings><setting name="backcolor" value="0xFFFFFF"/><setting name="frontcolor" value="0x000000"/><setting name="lightcolor" value="0x000000"/><setting name="screencolor" value="0x000000"/></settings><components><component name="controlbar"><settings><setting name="margin" value="20"/><setting name="fontsize" value="11"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFJJREFUeNrslLENwAAIwxLU/09j5AiOgD5hVQzNAVY8JK4qEfHMIKBnd2+BQlBINaiRtL/aV2rdzYBsM6CIONbI1NZENTr3RwdB2PlnJgJ6BRgA4hwu5Qg5iswAAAAASUVORK5CYII="/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="playButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhJREFUeNpiYqABYBo1dNRQ+hr6H4jvA3E8NS39j4SpZvh/LJig4YxEGEqy3kET+w+AOGFQRhTJhrEQkGcczfujhg4CQwECDADpTRWU/B3wHQAAAABJRU5ErkJggg=="/><element name="pauseButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAChJREFUeNpiYBgFo2DwA0YC8v/R1P4nRu+ooaOGUtnQUTAKhgIACDAAFCwQCfAJ4gwAAAAASUVORK5CYII="/><element name="prevButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEtJREFUeNpiYBgFo2Dog/9QDAPyQHweTYwiQ/2B+D0Wi8g2tB+JTdBQRiIMJVkvEy0iglhDF9Aq9uOpHVEwoE+NJDUKRsFgAAABBgDe2hqZcNNL0AAAAABJRU5ErkJggg=="/><element name="nextButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAElJREFUeNpiYBgFo2Dog/9AfB6I5dHE/lNqKAi/B2J/ahsKw/3EGMpIhKEk66WJoaR6fz61IyqemhEFSlL61ExSo2AUDAYAEGAAiG4hj+5t7M8AAAAASUVORK5CYII="/><element name="timeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADxJREFUeNpiYBgFo2AU0Bwwzluw+D8tLWARFhKiqQ9YuLg4aWsBGxs7bS1gZ6e5BWyjSX0UjIKhDgACDABlYQOGh5pYywAAAABJRU5ErkJggg=="/><element name="timeSliderBuffer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFo2AU0Bww1jc0/aelBSz8/Pw09QELOzs7bS1gY2OjrQWsrKy09gHraFIfBaNgqAOAAAMAvy0DChXHsZMAAAAASUVORK5CYII="/><element name="timeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAClJREFUeNpiYBgFo2AU0BwwAvF/WlrARGsfjFow8BaMglEwCugAAAIMAOHfAQunR+XzAAAAAElFTkSuQmCC"/><element name="timeSliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAICAYAAAA870V8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiZICA/yCCiQEJUJcDEGAAY0gBD1/m7Q0AAAAASUVORK5CYII="/><element name="muteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpiYBgFIw3MB+L/5Gj8j6yRiRTFyICJXHfTXyMLAXlGati4YDRFDj8AEGAABk8GSqqS4CoAAAAASUVORK5CYII="/><element name="unmuteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFgxz8p7bm+cQa+h8LHy7GhEcjIz4bmAjYykiun/8j0fakGPIfTfPgiSr6aB4FVAcAAQYAWdwR1G1Wd2gAAAAASUVORK5CYII="/><element name="volumeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGpJREFUeNpi/P//PwM9ABMDncCoRYPfIqqDZcuW1UPp/6AUDcNM1DQYKtRAlaAj1mCSLSLXYIIWUctgDItoZfDA5aOoqKhGEANIM9LVR7SymGDQUctikuOIXkFNdhHEOFrDjlpEd4sAAgwAriRMub95fu8AAAAASUVORK5CYII="/><element name="volumeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFtJREFUeNpi/P//PwM9ABMDncCoRYPfIlqAeij9H5SiYZiqBqPTlFqE02BKLSLaYFItIttgQhZRzWB8FjENiuRJ7aAbsMQwYMl7wDIsWUUQ42gNO2oR3S0CCDAAKhKq6MLLn8oAAAAASUVORK5CYII="/><element name="fullscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAE5JREFUeNpiYBgFo2DQA0YC8v/xqP1PjDlMRDrEgUgxkgHIlfZoriVGjmzLsLFHAW2D6D8eA/9Tw7L/BAwgJE90PvhPpNgoGAVDEQAEGAAMdhTyXcPKcAAAAABJRU5ErkJggg=="/><element name="normalscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEZJREFUeNpiYBgFo2DIg/9UUkOUAf8JiFFsyX88fJyAkcQgYMQjNkzBoAgiezyRbE+tFGSPxQJ7auYBmma0UTAKBhgABBgAJAEY6zON61sAAAAASUVORK5CYII="/></elements></component><component name="display"><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC"/><element name="playIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg=="/><element name="muteIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNrs1jEOgCAMBVAg7t5/8qaoIy4uoobyXsLCxA+0NCUAAADGUWvdQoQ41x4ixNBB2hBvBskdD3w5ZCkl3+33VqI0kjBBlh9rp+uTcyOP33TnolfsU85XX3yIRpQph8ZQY3wTZtU5AACASA4BBgDHoVuY1/fvOQAAAABJRU5ErkJggg=="/><element name="errorIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWlJREFUeNrsl+1twjAQhsHq/7BBYQLYIBmBDcoGMAIjtBPQTcII2SDtBDBBwrU6pGsUO7YbO470PtKJkz9iH++d4ywWAAAAAABgljRNsyWr2bZzDuJG1rLdZhcMbTjrBCGDyUKsqQLFciJb9bSvuG/WagRVRUVUI6gqy5HVeKWfSgRyJruKIU//TrZTSn2nmlaXThrloi/v9F2STC1W4+Aw5cBzkquRc09bofFNc6YLxEON0VUZS5FPTftO49vMjRsIF3RhOGr7/D/pJw+FKU+q0vDyq8W42jCunDqI3LC5XxNj2wHLU1XjaRnb0Lhykhqhhd8MtSF5J9tbjCv4mXGvKJz/65FF/qJryyaaIvzP2QRxZTX2nTuXjvV/VPFSwyLnW7mpH99yTh1FEVro6JBSd40/pMrRdV8vPtcKl28T2pT8TnFZ4yNosct3Q0io6JfBiz1FlGdqVQH3VHnepAEAAAAAADDzEGAAcTwB10jWgxcAAAAASUVORK5CYII="/><element name="bufferIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAuhJREFUeNrsWr9rU1EUznuNGqvFQh1ULOhiBx0KDtIuioO4pJuik3FxFfUPaAV1FTdx0Q5d2g4FFxehTnEpZHFoBy20tCIWtGq0TZP4HfkeHB5N8m6Sl/sa74XDybvv3vvOd8/Pe4lXrVZT3dD8VJc0B8QBcUAcEAfESktHGeR5XtMfqFQq/f92zPe/NbtGlKTdCY30kuxrpMGO94BlQCXs+rbh3ONgA6BlzP1p20d80gEI5hmA2A92Qua1Q2PtAFISM+bvjMG8U+Q7oA3rQGASwrYCU6WpNdLGYbA+Pq5jjXIiwi8EEa2UDbQSaKOIuV+SlkcCrfjY8XTI9EpKGwP0C2kru2hLtHqa4zoXtZRWyvi4CLwv9Opr6Hkn6A9HKgEANsQ1iqC3Ub/vRUk2JgmRkatK36kVrnt0qObunwUdUUMXMWYpakJsO5Am8tAw2GBIgwWA+G2S2dMpiw0gDioQRQJoKhRb1QiDwlHZUABYbaXWsm5ae6loTE4ZDxN4CZar8foVzOJ2iyZ2kWF3t7YIevffaMT5yJ70kQb2fQ1sE5SHr2wazs2wgMxgbsEKEAgxAvZUJbQLBGTSBMgNrncJbA6AljtS/eKDJ0Ez+DmrQEzXS2h1Ck25kAg0IZcUOaydCy4sYnN2fOA+2AP16gNoHALlQ+fwH7XO4CxLenUpgj4xr6ugY2roPMbMx+Xs18m/E8CVEIhxsNeg83XWOAN6grG3lGbk8uE5fr4B/WH3cJw+co/l9nTYsSGYCJ/lY5/qv0thn6nrIWmjeJcPSnWOeY++AkF8tpJHIMAUs/MaBBpj3znZfQo5psY+ZrG4gv5HickjEOymKjEeRpgyST6IuZcTcWbnjcgdPi5ghxciRKsl1lDSsgwA1i8fssonJgzmTSqfGUkCENndNdAL7PS6QQ7ZYISTo+1qq0LEWjTWcvY4isa4z+yfQB+7ooyHVg5RI7/i1Ijn/vnggDggDogD4oC00P4KMACd/juEHOrS4AAAAABJRU5ErkJggg=="/></elements></component><component name="dock"><elements><element name="button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFBJREFUeNrs0cEJACAQA8Eofu0fu/W6EM5ZSAFDRpKTBs00CQQEBAQEBAQEBAQEBAQEBATkK8iqbY+AgICAgICAgICAgICAgICAgIC86QowAG5PAQzEJ0lKAAAAAElFTkSuQmCC"/></elements></component><component name="playlist"><elements><element name="item" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAIAAAC1nk4lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHhJREFUeNrs2NEJwCAMBcBYuv/CFuIE9VN47WWCR7iocXR3pdWdGPqqwIoMjYfQeAiNh9B4JHc6MHQVHnjggQceeOCBBx77TifyeOY0iHi8DqIdEY8dD5cL094eePzINB5CO/LwcOTptNB4CP25L4TIbZzpU7UEGAA5wz1uF5rF9AAAAABJRU5ErkJggg=="/><element name="sliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADhJREFUeNrsy6ENACAMAMHClp2wYxZLAg5Fcu9e3OjuOKqqfTMzbs14CIZhGIZhGIZhGP4VLwEGAK/BBnVFpB0oAAAAAElFTkSuQmCC"/><element name="sliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADRJREFUeNrsy7ENACAMBLE8++8caFFKKiRffU53112SGs3ttOohGIZhGIZhGIZh+Fe8BRgAiaUGde6NOSEAAAAASUVORK5CYII="/></elements></component></components></skin>';
	
})(jwplayer);
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _logoDefaults = {
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
	
	var _display;
	
	jwplayer.html5.display = function(player) {
		if (_display === undefined) {
			_display = {};
			_display.elements = _initializeDisplayElements(player);
			_setupDisplay(player);
			player.addEventListener(jwplayer.html5.events.JWPLAYER_PLAYER_STATE, _stateHandler(player));
			player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, _stateHandler(player));
			player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_ERROR, function(obj) {
			});
		}
	};
	
	function _setupDisplay(player) {
		var html = [];
		html.push("<div id='" + player.id + "_display'" + _getStyle(player, 'display') + ">");
		html.push("<div id='" + player.id + "_displayImage'" + _getStyle(player, 'displayImage') + ">&nbsp;</div>");
		html.push("<div id='" + player.id + "_displayIconBackground'" + _getStyle(player, 'displayIconBackground') + ">");
		html.push("<img id='" + player.id + "_displayIcon' src='" + player.skin.display.elements.playIcon.src + "' alt='Click to play video'" + _getStyle(player, 'displayIcon') + "/>");
		html.push('</div>');
		html.push('<div id="' + player.id + '_logo" target="_blank"' + _getStyle(player, 'logo') + '>&nbsp;</div>');
		html.push('</div>');
		player._model.domelement.before(html.join(''));
		_display.display = $("#"+player.id + "_display");
		_display.displayImage = $("#"+player.id + "_displayImage");
		_display.displayIcon = $("#"+player.id + "_displayIcon");
		_display.displayIconBackground = $("#"+player.id + "_displayIconBackground");
		_display.logo = $("#"+player.id + "_logo");
		_setupDisplayElements(player);
	}
	
	
	function _getStyle(player, element) {
		var result = '';
		for (var style in _display.elements[element].style) {
			result += style + ":" + _display.elements[element].style[style] + ";";
		}
		if (result === '') {
			return ' ';
		}
		return ' style="' + result + '" ';
	}
	
	
	function _setupDisplayElements(player) {
		var displayElements = _initializeDisplayElements(player);
		for (var element in displayElements) {
			var elementId = ['#', player.id, '_', element];
			_display[element] = $(elementId.join(''));
			if (displayElements[element].click !== undefined) {
				_display[element].click(displayElements[element].click);
			}
		}
	}
	
	
	function _initializeDisplayElements(player) {
		var elements = {
			display: {
				style: {
					cursor: 'pointer',
					width: player.getWidth() + "px",
					height: player.getHeight() + "px",
					position: 'relative',
					'z-index': 50,
					margin: 0,
					padding: 0
				},
				click: _displayClickHandler(player)
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
					top: ((player.getHeight() - player.skin.display.elements.background.height) / 2) + "px",
					left: ((player.getWidth() - player.skin.display.elements.background.width) / 2) + "px",
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
					background: ([player._model.config.screencolor, ' url(', jwplayer.html5.utils.getAbsolutePath(player.getConfig().image), ') no-repeat center center']).join(''),
					width: player.getWidth() + "px",
					height: player.getHeight() + "px",
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
					width: _logoDefaults.width + "px",
					height: _logoDefaults.height + "px",
					'background-image': (['url(', _logoDefaults.prefix, _logoDefaults.file, ')']).join(''),
					margin: 0,
					padding: 0,
					display: 'none',
					'text-decoration': 'none'
				},
				click: _logoClickHandler()
			}
		};
		var positions = _logoDefaults.position.split("-");
		for (var position in positions) {
			elements.logo.style[positions[position]] = _logoDefaults.margin + "px";
		}
		return elements;
	}
	
	
	function _displayClickHandler(player) {
		return function(evt) {
			if (player._media === undefined) {
				document.location.href = jwplayer.html5.utils.getAbsolutePath(player.getPlaylist()[player.getConfig().item].levels[0]);
				return;
			}
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (player.getState() != jwplayer.html5.states.PLAYING) {
				player.play();
			} else {
				player.pause();
			}
		};
	}
	
	
	function _logoClickHandler() {
		return function(evt) {
			evt.stopPropagation();
			return;
		};
	}
	
	
	function _setIcon(player, path) {
		$("#" + player.id + "_displayIcon")[0].src = path;
	}
	
	
	function _animate(element, state) {
		var speed = 'slow';
		if (!_display.animate) {
			return;
		}
		if (state) {
			element.slideDown(speed, function() {
				_animate(element);
			});
		} else {
			element.slideUp(speed, function() {
				_animate(element, true);
			});
		}
	}
	
	
	function _stateHandler(player) {
		return function(obj) {
			_display.animate = false;
			switch (player.getState()) {
				case jwplayer.html5.states.BUFFERING:
					_display.logo.fadeIn(0, function() {
						setTimeout(function() {
							_display.logo.fadeOut(_logoDefaults.out * 1000);
						}, _logoDefaults.timeout * 1000);
					});
					_display.displayIcon[0].src = player.skin.display.elements.bufferIcon.src;
					_display.displayIcon.css({
						"display": "block",
						top: (player.skin.display.elements.background.height - player.skin.display.elements.bufferIcon.height) / 2 + "px",
						left: (player.skin.display.elements.background.width - player.skin.display.elements.bufferIcon.width) / 2 + "px"
					});
					_display.animate = true;
					// TODO: Buffer Icon rotation
					if (false) {
						_animate(_display.displayIconBackground);
					}
					_display.displayIconBackground.css('display', 'none');
					break;
				case jwplayer.html5.states.PAUSED:
					_display.logo.fadeIn(0);
					_display.displayImage.css("background", "transparent no-repeat center center");
					_display.displayIconBackground.css("display", "block");
					_display.displayIcon[0].src = player.skin.display.elements.playIcon.src;
					_display.displayIcon.css({
						"display": "block",
						top: (player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2 + "px",
						left: (player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2 + "px"
					});
					break;
				case jwplayer.html5.states.IDLE:
					_display.logo.fadeOut(0);
					_display.displayImage.css("background", player._model.config.screencolor + " url('" + jwplayer.html5.utils.getAbsolutePath(player.getConfig().image) + "') no-repeat center center");
					_display.displayIconBackground.css("display", "block");
					_display.displayIcon[0].src = player.skin.display.elements.playIcon.src;
					_display.displayIcon.css({
						"display": "block",
						top: (player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2 + "px",
						left: (player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2 + "px"
					});
					break;
				default:
					if (player.getMute()) {
						_display.displayImage.css("background", "transparent no-repeat center center");
						_display.displayIconBackground.css("display", "block");
						_display.displayIcon[0].src = player.skin.display.elements.muteIcon.src;
						_display.displayIcon.css({
							"display": "block",
							top: (player.skin.display.elements.muteIcon.height - player.skin.display.elements.muteIcon.height) / 2 + "px",
							left: (player.skin.display.elements.background.width - player.skin.display.elements.muteIcon.width) / 2 + "px"
						});
					} else {
						try {
							_display.logo.clearQueue();
						} catch (err) {
						
						}
						_display.logo.fadeIn(0, function() {
							setTimeout(function() {
								_display.logo.fadeOut(_logoDefaults.out * 1000);
							}, _logoDefaults.timeout * 1000);
						});
						_display.displayImage.css("background", "transparent no-repeat center center");
						_display.displayIconBackground.css("display", "none");
						_display.displayIcon.css("display", "none");
					}
					break;
			}
		};
	}
	
	})(jwplayer);
/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.html5.states.IDLE,
		"playing": jwplayer.html5.states.PLAYING,
		"pause": jwplayer.html5.states.PAUSED,
		"buffering": jwplayer.html5.states.BUFFERING
	};
	
	var _events = {
		'abort': _generalHandler,
		'canplay': _stateHandler,
		'canplaythrough': _stateHandler,
		'durationchange': _metaHandler,
		'emptied': _generalHandler,
		'ended': _stateHandler,
		'error': _errorHandler,
		'loadeddata': _metaHandler,
		'loadedmetadata': _metaHandler,
		'loadstart': _stateHandler,
		'pause': _stateHandler,
		'play': _positionHandler,
		'playing': _stateHandler,
		'progress': _progressHandler,
		'ratechange': _generalHandler,
		'seeked': _stateHandler,
		'seeking': _stateHandler,
		'stalled': _stateHandler,
		'suspend': _stateHandler,
		'timeupdate': _positionHandler,
		'volumechange': _generalHandler,
		'waiting': _stateHandler,
		'canshowcurrentframe': _generalHandler,
		'dataunavailable': _generalHandler,
		'empty': _generalHandler,
		'load': _generalHandler,
		'loadedfirstframe': _generalHandler
	};
	
	var _domelement;
	var _jdomelement;
	var _bufferFull;
	var _bufferingComplete;
	var _state = jwplayer.html5.states.IDLE;
	var _interval;
	var _stopped;
	
	jwplayer.html5.mediavideo = function(player) {
		_domelement = player._domelement;
		_jdomelement = $(_domelement);
		_jdomelement.attr('loop', player._model.config.repeat);
		var media = {
			play: _play(player),
			pause: _pause(player),
			seek: _seek(player),
			stop: _stop(player),
			volume: _volume(player),
			mute: _mute(player),
			fullscreen: _fullscreen(player),
			load: _load(player),
			resize: _resize(player),
			getState: _getState,
			interval: null,
			loadcount: 0,
			hasChrome: false
		};
		media.mute(player.getMute());
		media.volume(player.getVolume());
		return media;
	};

	function _getState(){
		return _state;
	}
	
	function _generalHandler(event, player) {
	}
	
	function _stateHandler(event, player) {
		if (_states[event.type]) {
			_setState(player, _states[event.type]);
		}
	}
		
	function _setState(player, newstate) {
		if (_stopped) {
			newstate = jwplayer.html5.states.IDLE;
		}
		if (_state != newstate) {
			var oldstate = _state;
			_state = newstate;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_PLAYER_STATE, {
				oldstate: oldstate,
				newstate: newstate
			});
		}
		if (newstate == jwplayer.html5.states.IDLE) {
			clearInterval(_interval);
			_interval = null;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE);
			if (player._model.config.repeat && !_stopped) {
				player.play();
			}
			if (_jdomelement.css('display') != 'none') {
				_jdomelement.css('display', 'none');
			}
		}
		_stopped = false;
	}
	
	
	function _metaHandler(event, player) {
		var meta = {
			height: event.target.videoHeight,
			width: event.target.videoWidth,
			duration: event.target.duration
		};
		if (player._model.duration === 0) {
			player._model.duration = event.target.duration;
		}
		player._model.playlist[player._model.item] = $.extend(player._model.playlist[player._model.item], meta);
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_META, meta);
	}
	
	
	function _positionHandler(event, player) {
		if (_stopped) {
			return;
		}
		if (!jwplayer.html5.utils.isNull(event.target)) {
			if (player._model.duration === 0) {
				player._model.duration = event.target.duration;
			}
			
			if (_state == jwplayer.html5.states.PLAYING) {
				player._model.position = Math.round(event.target.currentTime * 10) / 10;
				player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_TIME, {
					position: Math.round(event.target.currentTime * 10) / 10,
					duration: Math.round(event.target.duration * 10) / 10
				});
			}
		}
		_progressHandler({}, player);
	}
	
	
	function _progressHandler(event, player) {
		var bufferPercent, bufferTime, bufferFill;
		if (!isNaN(event.loaded / event.total)) {
			bufferPercent = event.loaded / event.total * 100;
			bufferTime = bufferPercent / 100 * (player._model.duration - _domelement.currentTime);
		} else if ((_domelement.buffered !== undefined) && (_domelement.buffered.length > 0)) {
			maxBufferIndex = 0;
			if (maxBufferIndex >= 0) {
				bufferPercent = _domelement.buffered.end(maxBufferIndex) / _domelement.duration * 100;
				bufferTime = _domelement.buffered.end(maxBufferIndex) - _domelement.currentTime;
			}
		}
		
		bufferFill = bufferTime / player._model.config.bufferlength * 100;
		
		// TODO: Buffer underrun
		if (false) {
			if (bufferFill < 25 && _state == jwplayer.html5.states.PLAYING) {
				_setState(jwplayer.html5.states.BUFFERING);
				_bufferFull = false;
				if (!_domelement.seeking) {
					_domelement.pause();
				}
			} else if (bufferFill > 95 && _state == jwplayer.html5.states.BUFFERING && _bufferFull === false && bufferTime > 0) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
			}
		}
		
		if (_bufferFull === false) {
			_bufferFull = true;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
		}
		
		if (!_bufferingComplete) {
			if (bufferPercent == 100 && _bufferingComplete === false) {
				_bufferingComplete = true;
			}
			
			if (!jwplayer.html5.utils.isNull(bufferPercent)) {
				player._model.buffer = Math.round(bufferPercent);
				player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: Math.round(bufferPercent)
					//bufferingComplete: _bufferingComplete,
					//bufferFull: _bufferFull,
					//bufferFill: bufferFill,
					//bufferTime: bufferTime
				});
			}
			
		}
	}
	
	
	function _startInterval(player) {
		if (_interval === null) {
			_interval = window.setInterval(function() {
				_positionHandler({}, player);
			}, 100);
		}
	}
	
	
	function _errorHandler(event, player) {
		player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, {});
	}
	
	
	function _play(player) {
		return function() {
			if (_state != jwplayer.html5.states.PLAYING) {
				_setState(player, jwplayer.html5.states.PLAYING);
				_domelement.play();
			}
		};
	}
	
	
	/** Switch the pause state of the player. **/
	function _pause(player) {
		return function() {
			_domelement.pause();
		};
	}
	
	
	/** Seek to a position in the video. **/
	function _seek(player) {
		return function(position) {
			_domelement.currentTime = position;
			_domelement.play();
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function _stop(player) {
		return function() {
			_stopped = true;
			_domelement.pause();
			clearInterval(_interval);
			_interval = undefined;
			player._model.position = 0;
			_setState(player, jwplayer.html5.states.IDLE);
		};
	}
	
	
	/** Change the video's volume level. **/
	function _volume(player) {
		return function(position) {
			player._model.volume = position;
			_domelement.volume = position / 100;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(_domelement.volume * 100)
			});
		};
	}
	
	
	/** Switch the mute state of the player. **/
	function _mute(player) {
		return function(state) {
			player._model.mute = state;
			_domelement.muted = state;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, {
				mute: _domelement.muted
			});
		};
	}
	
	
	/** Resize the player. **/
	function _resize(player) {
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
	}
	
	
	/** Switch the fullscreen state of the player. **/
	function _fullscreen(player) {
		return function(state) {
			player._model.fullscreen = state;
			if (state === true) {
				player.resize("100%", "100%");
			} else {
				player.resize(player._model.config.width, player._model.config.height);
			}
		};
	}
	
	
	/** Load a new video into the player. **/
	function _load(player) {
		return function(playlistItem) {
			_domelement = _insertVideoTag(player, playlistItem);
			_jdomelement = $(_domelement);
			$.each(_events, function(event, handler) {
				_domelement.addEventListener(event, function(event) {
					handler(event, player);
				}, true);
			});
			if (_jdomelement.css('display') == 'none') {
				_jdomelement.css('display', 'block');
			}
			setTimeout(function() {
				_bufferFull = false;
				_bufferingComplete = false;
				_setState(player, jwplayer.html5.states.BUFFERING);
				_startInterval(player);
				try {
					_domelement.currentTime = 0;					
				} catch (err){
					
				}
			}, 25);
		};
	}
	
	function _insertVideoTag(player, playlistItem) {
		var div1 = document.getElementById(player.id);
		var vid = div1.ownerDocument.createElement("video");
		//vid.controls = "none";
		if (vid.autobuffer){
			vid.autobuffer = player._model.config.autoplay;
		} else if (vid.autoplay){
			vid.autoplay = player._model.config.autoplay;
		}
		for (var sourceIndex in playlistItem.levels){
			var sourceModel = playlistItem.levels[sourceIndex];
			var source = div1.ownerDocument.createElement("source");
			source.src = jwplayer.html5.utils.getAbsolutePath(sourceModel.file);
			if (sourceModel.type === undefined) {
				var extension = jwplayer.html5.utils.extension(sourceModel.file);
				if (extension == "ogv") {
					extension = "ogg";
				}
				source.type = 'video/' + extension + ';';
			} else {
				source.type = sourceModel.type;
			}
			vid.appendChild(source);
		}
		vid.width = player._model.config.width;
		vid.height = player._model.config.height;
		var styles = {
			position: 'absolute',
			width: player._model.config.width + 'px',
			height: player._model.config.height + 'px',
			top: 0,
			left: 0,
			'z-index': 0,
			margin: 'auto',
			display: 'block'
		};
		for (var style in styles){
			vid.style[style] = styles[style];
		}
		div1.parentNode.replaceChild(vid, div1);
		vid.id = player.id;
		return vid;
	}
	
	
})(jwplayer);
/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen"];

	jwplayer.html5.model = function(options) {
		$.extend(this.config, options);
		if (this.config.playlist && this.config.playlist.length > 0){
			this.playlist = this.config.playlist;
		} else if (this.config.levels && this.config.levels.length > 0) {
			this.playlist = [{"levels": this.config.levels}];
		} else if (this.config.file){
			this.playlist = [{"levels": [{"file":this.config.file}]}];
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			this[configurableStateVariable] = this.config[configurableStateVariable];
		}
		if (this.config.skin.length === 0){
			this.config.skin = "1.xml";
		}
		return this;
	};
	
	jwplayer.html5.model.prototype = {
		components: {},
		playlist: [],
		state: jwplayer.html5.states.IDLE,
		item: 0,
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
			debug: undefined,
			screencolor: ''
		}
	};
	
	jwplayer.html5.model.setActiveMediaProvider = function(player) {
		player._media = jwplayer.html5.mediavideo(player);	
		return true;
	};	
})(jwplayer);
/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _completeHandler;
	var _loading;
	
	/** Constructor **/
	jwplayer.html5.skinner = function(player, completeHandler) {
		_completeHandler = completeHandler;
		player.skin = {
			properties: {}
		};
		_load(player);
	};
	
	/** Load the skin **/
	function _load(player) {
		if (jwplayer.html5.utils.getAbsolutePath(player._model.config.skin) === undefined) {
			_loadSkin(player, jwplayer.html5.defaultSkin);
		} else {
			$.ajax({
				url: jwplayer.html5.utils.getAbsolutePath(player._model.config.skin),
				complete: function(xmlrequest, textStatus) {
					if (textStatus == "success") {
						_loadSkin(player, xmlrequest.responseXML);
					} else {
						_loadSkin(player, jwplayer.html5.defaultSkin);
					}
				}
				
			});
		}
		
	}
	
	
	function _loadSkin(player, xml) {
		var components = $('component', xml);
		if (components.length === 0) {
			return;
		}
		for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
			_loading = true;
			
			var componentName = $(components[componentIndex]).attr('name');
			var component = {
				settings: {},
				elements: {}
			};
			player.skin[componentName] = component;
			var elements = $(components[componentIndex]).find('element');
			for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
				_loadImage(elements[elementIndex], componentName, player);
			}
			var settings = $(components[componentIndex]).find('setting');
			for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
				player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
			}
			
			_loading = false;
			
			_resetCompleteIntervalTest(player);
		}
	}
	
	
	function _resetCompleteIntervalTest(player) {
		clearInterval(player.skin._completeInterval);
		player.skin._completeInterval = setInterval(function() {
			_checkComplete(player);
		}, 100);
	}
	
	
	/** Load the data for a single element. **/
	function _loadImage(element, component, player) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var imgUrl;
		if (elementSource.indexOf('data:image/png;base64,') === 0) {
			imgUrl = elementSource;
		} else {
			var skinUrl = jwplayer.html5.utils.getAbsolutePath(player._model.config.skin);
			var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
			imgUrl = [skinRoot, component, elementSource].join('/');
		}
				
		player.skin[component].elements[elementName] = {
			height: 0,
			width: 0,
			src: '',
			ready: false
		};
		
		$(img).load(_completeImageLoad(img, elementName, component, player));
		$(img).error(function() {
			player.skin[component].elements[elementName].ready = true;
			_resetCompleteIntervalTest(player);
		});
		
		img.src = imgUrl;
	}
	
	
	function _checkComplete(player) {
		for (var component in player.skin) {
			if (component != 'properties') {
				for (var element in player.skin[component].elements) {
					if (!player.skin[component].elements[element].ready) {
						return;
					}
				}
			}
		}
		if (_loading === false) {
			clearInterval(player.skin._completeInterval);
			_completeHandler();
		}
	}
	
	
	function _completeImageLoad(img, element, component, player) {
		return function() {
			player.skin[component].elements[element].height = img.height;
			player.skin[component].elements[element].width = img.width;
			player.skin[component].elements[element].src = img.src;
			player.skin[component].elements[element].ready = true;
			_resetCompleteIntervalTest(player);
		};
	}
	
	
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
	
})(jwplayer);
/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.utils = function() {
		return this.each(function() {
		});
	};
	

	
	/** Returns the extension of a file name **/
	jwplayer.html5.utils.extension = function(path) {
		return path.substr(path.lastIndexOf('.') + 1, path.length);
	};
	
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
	
	
})(jwplayer);
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

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
		player._model.domelement.css({
			position: 'absolute',
			width: player._model.config.width + 'px',
			height: player._model.config.height + 'px',
			top: 0,
			left: 0,
			'z-index': 0,
			margin: 'auto',
			display: 'block'
		});
	};
})(jwplayer);
