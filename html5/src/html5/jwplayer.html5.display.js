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
				document.location.href = jwplayer.html5.utils.getAbsolutePath(player.getPlaylist()[player.getConfig().item].sources[0]);
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
