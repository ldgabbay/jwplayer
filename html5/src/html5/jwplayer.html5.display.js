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

