/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	displays = {};
	
	$.fn.jwplayerDisplay = function(player, domelement) {
		displays[player.id] = {};
		displays[player.id].domelement = domelement;
		var meta = player.meta();
		domelement.before("<div id='" + player.id + "_display' style='width:" + meta.width + "px;height: " + meta.height + "px;position:relative;z-index:50' ><a id='" + player.id + "_displayImage' href='" + $.fn.jwplayerUtils.getAbsolutePath(meta.sources[meta.source].file) + "'>&nbsp;</a><div id='" + player.id + "_displayIconBackground' alt='Click to play video' style='position:absolute; top:" + (meta.height - player.skin.display.elements.background.height) / 2 + "px; left:" + (meta.width - player.skin.display.elements.background.width) / 2 + "px; border:0; background-image:url(" + player.skin.display.elements.background.src + "); width:" + player.skin.display.elements.background.width + "px;height:" + player.skin.display.elements.background.height + "px;' ><img id='" + player.id + "_displayIcon' src='" + player.skin.display.elements.playIcon.src + "' alt='Click to play video' style='position:absolute; top:" + (player.skin.display.elements.background.height - player.skin.display.elements.playIcon.height) / 2 + "px; left:" + (player.skin.display.elements.background.width - player.skin.display.elements.playIcon.width) / 2 + "px; border:0;' /></div></div>");
		var display = $("#" + player.id + "_display");
		var displayImage = $("#" + player.id + "_displayImage");
		var displayIcon = $("#" + player.id + "_displayIcon");
		var displayIconBackground = $("#" + player.id + "_displayIconBackground");
		displayImage.jwplayerCSS({
			'display': "block",
			'background': "#ffffff url('" + $.fn.jwplayerUtils.getAbsolutePath(player.config.image) + "') no-repeat center center",
			'width': meta.width,
			'height': meta.height,
			'position': "relative",
			'left': 0,
			'top': 0
		});
		
		display.click(function(evt) {
			$.fn.jwplayerUtils.log("click" + player.model.state, evt);
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
			
		});
		player.state(stateHandler);
		player.mute(stateHandler);
		player.error(function(obj) {
		
		});
		displays[player.id].display = display;
		displays[player.id].displayImage = displayImage;
		displays[player.id].displayIcon = displayIcon;
		displays[player.id].displayIconBackground = displayIconBackground;
	};
	
	function setIcon(player, path) {
		$("#" + player.id + "_displayIcon")[0].src = path;
	}
	
	function stateHandler(obj) {
		player = $.jwplayer(obj.id);
		switch (player.model.state) {
			case $.fn.jwplayer.states.BUFFERING:
				displays[obj.id].displayIconBackground.css("display", "block");
				displays[obj.id].displayIcon[0].src = player.skin.display.elements.bufferIcon.src;
				$.fn.jwplayerUtils.log("offset", {
					"display": "block",
					top: (player.skin.display.elements.background.height - player.skin.display.elements.bufferIcon.height) / 2 + "px",
					left: (player.skin.display.elements.background.width - player.skin.display.elements.bufferIcon.width) / 2 + "px"
				});
				displays[obj.id].displayIcon.css({
					"display": "block",
					top: (player.skin.display.elements.background.height - player.skin.display.elements.bufferIcon.height) / 2 + "px",
					left: (player.skin.display.elements.background.width - player.skin.display.elements.bufferIcon.width) / 2 + "px"
				});
				break;
			case $.fn.jwplayer.states.PAUSED:
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
					displays[obj.id].displayIconBackground.css("display", "block");
					displays[obj.id].displayIcon[0].src = player.skin.display.elements.muteIcon.src;
					displays[obj.id].displayIcon.css({
						"display": "block",
						top: (player.skin.display.elements.muteIcon.height - player.skin.display.elements.muteIcon.height) / 2 + "px",
						left: (player.skin.display.elements.background.width - player.skin.display.elements.muteIcon.width) / 2 + "px"
					});
				} else {
					displays[obj.id].displayImage.css("background", "transparent no-repeat center center");
					displays[obj.id].displayIconBackground.css("display", "none");
					displays[obj.id].displayIcon.css("display", "none");
				}
				break;
		}
	}
	
})(jQuery);
