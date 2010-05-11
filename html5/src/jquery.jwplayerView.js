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
		id: true,
		name: true,
		className: true
	};
	
	$.fn.jwplayerView = function(player) {
		player.model.domelement.wrap("<div id='" + player.model.config.id + "_jwplayer' />");
		player.model.domelement.parent().css({
			position: 'relative',
			height: player.config.height,
			width: player.config.width,
			margin: 'auto',
			padding: 0,
			'background-color': player.config.screencolor
		});
		var display = ($.fn.jwplayerUtils.isiPhone() || !(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)) ? 'block' : 'none' ;
		player.model.domelement.css({
			position: 'absolute',
			width: player.model.config.width,
			height: player.model.config.height,
			top: 0,
			left: 0,
			'z-index': 0,
			margin: 'auto',
			display: display
		});
	};
	
	$.fn.jwplayerView.switchMediaProvider = function() {
	
	};
	
	/** Embeds a Flash Player at the specified location in the DOM. **/
	$.fn.jwplayerView.embedFlash = function(player, options) {
		if (player.model.config.flashplayer) {
			var htmlString, elementvarString = "", flashvarString = "";
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				htmlString = embedString;
			} else {
				htmlString = objectString;
			}
			for (var elementvar in elementvars) {
				if (!$.fn.jwplayerUtils.isNull(player.model.config[elementvar])) {
					elementvarString += elementvar + "='" + player.model.config[elementvar] + "' ";
				}
			}
			if (elementvarString.indexOf("name=") < 0) {
				elementvarString += "name='" + player.id + "' ";
			}
			var config = $.extend(true, {}, player.model.config, options);
			if (!$.fn.jwplayerUtils.isNull(player.model.sources[player.model.source])){
				flashvarString += 'file=' + $.fn.jwplayerUtils.getAbsolutePath(player.model.sources[player.model.source].file) + '&';
			}
			if (!$.fn.jwplayerUtils.isNull(config.image)){
				flashvarString += 'image=' + $.fn.jwplayerUtils.getAbsolutePath(config.image) + '&';
			}
			for (var flashvar in config) {
				if ((flashvar == 'file') || (flashvar == 'image') || (flashvar == 'plugins')) {
					continue;
				}
				if (!$.fn.jwplayerUtils.isNull(config[flashvar])) {
					flashvarString += flashvar + '=' + config[flashvar] + '&';
				}
			}
			
			flashvarString += 'playerready=$.fn.jwplayerMediaFlash.playerReady';
			
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", $.fn.jwplayerUtils.getAbsolutePath(player.model.config.flashplayer));
			htmlString = htmlString.replace("%style%", "style='" + styleString + "width:" + player.model.config.width + "px;height:" + player.model.config.height + "px;'");
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				htmlString = htmlString.replace("%style%", "style='" + styleString + "width:" + player.model.config.width + "px;height:" + player.model.config.height + "px;'");
				player.model.domelement.before(htmlString);
			} else {
				htmlString = htmlString.replace("%style%", "style='" + styleString + "width:" + player.model.config.width + "px;height:" + (player.model.config.height + player.skin.controlbar.elements.background.height) + "px;'");
				player.model.domelement.before("<div />");
				player.model.domelement.prev().html(htmlString);
				
			}
			var oldDOMElement = player.model.domelement;
			player.model.domelement = player.model.domelement.prev();
			oldDOMElement.remove();
		}
	};
	
	
})(jQuery);
