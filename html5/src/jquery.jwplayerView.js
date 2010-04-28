/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var styleString = "left:0px;top:0px;position:absolute;z-index:0;";
	var embedString = "<embed %elementvars% src='%flashplayer%' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' %style% />";
	var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars% %style% > <param name='movie' value='%flashplayer%'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
	var elementvars = {
		//width: true,
		//height: true,
		id: true,
		name: true,
		className: true
	};
	
	$.fn.jwplayerView = function(player) {
		player.model.domelement.wrap("<div id='" + player.model.config.id + "_jwplayer' />");
		player.model.domelement.parent().jwplayerCSS({
			'position': 'relative',
			'height': player.model.config.height,
			'width': player.model.config.width,
			'margin': 'auto'
		});
		player.model.domelement.jwplayerCSS({
			'position': 'absolute',
			'width': player.model.config.width,
			'height': player.model.config.height,
			'left': 0,
			'top': 0,
			'z-index': 0
		});
		player.model.domelement.before("<a href='" + $.fn.jwplayerUtils.getAbsolutePath(player.model.sources[player.model.source].file) + "'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + (player.model.height - 60) / 2 + "px; left:" + (player.model.width - 60) / 2 + "px; border:0;' /></a>");
		player.model.domelement.prev("a").jwplayerCSS({
			'display': 'block',
			'background': '#ffffff url(' + $.fn.jwplayerUtils.getAbsolutePath(player.model.config.image) + ') no-repeat center center',
			'width': player.model.width,
			'height': player.model.height,
			'position': 'relative',
			'left': 0,
			'top': 0,
			'z-index': 50
		});
		player.model.domelement.prev("a").click(function(evt) {
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (player.state() !== $.fn.jwplayer.states.PLAYING) {
				player.play();
			} else {
				player.pause();
			}
			
		});
		player.state(function(obj) {
			imageHandler(obj, player);
		});
	};
	
	function imageHandler(obj, player) {
		alert(player.id+":"+obj.newstate);
		switch (obj.newstate) {
			case $.fn.jwplayer.states.IDLE:
				player.model.domelement.css("z-index", "0");
				player.model.domelement.prev("a").css("z-index", "50");
				break;
			case $.fn.jwplayer.states.PLAYING:
				player.model.domelement.prev("a").css("z-index", "0");
				player.model.domelement.css("z-index", "50");
				break;
		}
	}
	
	$.fn.jwplayerView.switchMediaProvider = function() {
	
	};
	
	/** Embeds a Flash Player at the specified location in the DOM. **/
	$.fn.jwplayerView.embedFlash = function(player, options) {
		if (player.model.config.flashplayer !== false) {
			var htmlString, elementvarString = "", flashvarString = "";
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				htmlString = embedString;
			} else {
				htmlString = objectString;
			}
			for (var elementvar in elementvars) {
				if (!((player.model.config[elementvar] === undefined) || (player.model.config[elementvar] === "") || (player.model.config[elementvar] === null))) {
					elementvarString += elementvar + "='" + player.model.config[elementvar] + "' ";
				}
			}
			if (elementvar.indexOf("name" ) < 0) {
				elementvarString += "name" + "='" + player.id + "' ";
			}
			var config = $.extend(true, {}, player.model.config, options);
			flashvarString += "file=" + $.fn.jwplayerUtils.getAbsolutePath(player.model.sources[player.model.source].file) + "&image=" + $.fn.jwplayerUtils.getAbsolutePath(config.image) +"&";
			for (var flashvar in config) {
				if ((flashvar == "file") || (flashvar == "image")) {
					continue;
				}
				if (!$.fn.jwplayerUtils.isNull(config[flashvar] === undefined)) {
					flashvarString += flashvar + "=" + config[flashvar] + "&";
				}
			}
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", player.model.config.flashplayer);
			htmlString = htmlString.replace("%style%", "style='"+styleString+"width:"+player.model.config.width+"px;height:"+player.model.config.height+"px;'");
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				player.model.domelement.before(htmlString);
			} else {
				player.model.domelement.before("<div />");
				player.model.domelement.prev()[0].outerHTML= htmlString;
			}
			var oldDOMElement = player.model.domelement;
			player.model.domelement = player.model.domelement.prev();
			oldDOMElement.remove();
		}
	};
	
	
})(jQuery);
