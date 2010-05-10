/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	var logoDefaults = {
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
	
	displays = {};
	
	$.fn.jwplayerDisplay = function(player, domelement) {
		displays[player.id] = {};
		displays[player.id].domelement = domelement;
		if ($.fn.jwplayerUtils.isiPhone()) {
			domelement.attr('poster', $.fn.jwplayerUtils.getAbsolutePath(player.config.image));
		} else {
			setupDisplay(player);
			player.state(stateHandler);
			player.mute(stateHandler);
			player.error(function(obj) {
			
			});
		}
	};
	
	function setupDisplay(player) {
		var meta = player.meta();
		var html = [];
		html.push("<div id='" + player.id + "_display'>");
		html.push("<a id='" + player.id + "_displayImage' href='" + $.fn.jwplayerUtils.getAbsolutePath(meta.sources[meta.source].file) + "'>&nbsp;</a>");
		html.push("<div id='" + player.id + "_displayIconBackground' alt='Click to play video'>");
		html.push("<img id='" + player.id + "_displayIcon' src='" + player.skin.display.elements.playIcon.src + "' alt='Click to play video' />");
		html.push('</div>');
		html.push('<a id="' + player.id + '_logo" target="_blank" href="' + logoDefaults.link + '">&nbsp;</a>');
		html.push('</div>');
		displays[player.id].domelement.before(html.join(''));
		setupDisplayElements(player);
	}
	
	function setupDisplayElements(player) {
		var displayElements = initializeDisplayElements(player);
		for (var element in displayElements) {
			var elementId = ['#', player.id, '_', element];
			displays[player.id][element] = $(elementId.join(''));
			displays[player.id][element].css(displayElements[element].style);
			if (displayElements[element].click !== undefined) {
				displays[player.id][element].click(displayElements[element].click);
			}
		}
	}
	
	function initializeDisplayElements(player) {
		var meta = player.meta();
		var elements = {
			display: {
				style: {
					cursor: 'pointer',
					width: meta.width,
					height: meta.height,
					position: 'relative',
					'z-index': 50,
					margin: 0,
					padding: 0
				}
			},
			displayIcon: {
				style: {
					cursor: 'pointer',
					position: 'absolute',
					top: (player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2,
					left: (player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2,
					border: 0,
					margin: 0,
					padding: 0
				}
			},
			displayIconBackground: {
				style: {
					cursor: 'pointer',
					position: 'absolute',
					top: (meta.height - player.skin.display.elements.background.height) / 2,
					left: (meta.width - player.skin.display.elements.background.width) / 2,
					border: 0,
					'background-image': (['url(', player.skin.display.elements.background.src, ')']).join(''),
					width: player.skin.display.elements.background.width,
					height: player.skin.display.elements.background.height,
					margin: 0,
					padding: 0
				},
				click: clickHandler(player)
			},
			displayImage: {
				style: {
					display: 'block',
					background: ([player.config.screencolor, ' url(', $.fn.jwplayerUtils.getAbsolutePath(player.config.image), ') no-repeat center center']).join(''),
					width: meta.width,
					height: meta.height,
					position: 'absolute',
					cursor: 'pointer',
					left: 0,
					top: 0,
					margin: 0,
					padding: 0,
					'text-decoration': 'none'
				},
				click: clickHandler(player)
			},
			logo: {
				style: {
					position: 'absolute',
					width: logoDefaults.width,
					height: logoDefaults.height,
					'background-image': (['url(', logoDefaults.prefix, logoDefaults.file, ')']).join(''),
					margin: 0,
					padding: 0,
					display: 'none',
					'text-decoration': 'none'
				}
			}
		};
		var positions = logoDefaults.position.split("-");
		for (var position in positions) {
			elements.logo.style[positions[position]] = logoDefaults.margin;
		}
		return elements;
	}
	
	function clickHandler(player) {
		return function(evt) {
			if (player.media === undefined) {
				return;
			}
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (player.model.state != $.fn.jwplayer.states.PLAYING) {
				player.play();
			} else {
				player.pause();
			}
		};
	}
	
	function setIcon(player, path) {
		$("#" + player.id + "_displayIcon")[0].src = path;
	}
	
	function animate(element, state) {
		var speed = 'slow';
		if (!displays[player.id].animate) {
			return;
		}
		if (state) {
			element.slideDown(speed, function() {
				animate(element);
			});
		} else {
			element.slideUp(speed, function() {
				animate(element, true);
			});
		}
	}
	
	
	function stateHandler(obj) {
		player = $.jwplayer(obj.id);
		displays[player.id].animate = false;
		switch (player.model.state) {
			case $.fn.jwplayer.states.BUFFERING:
				displays[obj.id].logo.fadeIn(0, function() {
					setTimeout(function() {
						displays[obj.id].logo.fadeOut(logoDefaults.out * 1000);
					}, logoDefaults.timeout * 1000);
				});
				displays[obj.id].displayIcon[0].src = player.skin.display.elements.bufferIcon.src;
				displays[obj.id].displayIcon.css({
					"display": "block",
					top: (player.skin.display.elements.background.height - player.skin.display.elements.bufferIcon.height) / 2 + "px",
					left: (player.skin.display.elements.background.width - player.skin.display.elements.bufferIcon.width) / 2 + "px"
				});
				displays[player.id].animate = true;
				// TODO: Buffer Icon rotation
				if (false) {
					animate(displays[obj.id].displayIconBackground);
				}
				displays[obj.id].displayIconBackground.css('display', 'none');
				break;
			case $.fn.jwplayer.states.PAUSED:
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
			case $.fn.jwplayer.states.IDLE:
				displays[obj.id].logo.fadeOut(0);
				displays[obj.id].displayImage.css("background", "#ffffff url('" + $.fn.jwplayerUtils.getAbsolutePath(player.config.image) + "') no-repeat center center");
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
					} catch (err){
						
					}
					displays[obj.id].logo.fadeIn(0, function() {
						setTimeout(function() {
							displays[obj.id].logo.fadeOut(logoDefaults.out * 1000);
						}, logoDefaults.timeout * 1000);
					});
					displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
					displays[obj.id].displayIconBackground.css("display", "none");
					displays[obj.id].displayIcon.css("display", "none");
				}
				break;
		}
	}
	
})(jQuery);
