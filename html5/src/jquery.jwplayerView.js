/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var styleString = "style='left:0px;top:0px;position:absolute;z-index:0;'";
	var embedString = "<embed %elementvars% src='%flashplayer%' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' %style% />";
	var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars%' %style%> <param name='movie' value='%flashplayer%'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
	var elementvars = {
		width: true,
		height: true,
		id: true,
		name: true,
		className: true
	};
	
	$.fn.jwplayerView = function(player) {
		/*if (!(($(this).attr("src") === undefined) || ($(this).attr("src") === ""))) {
			$(this).attr("preload", "metadata");
			$(this).append('<source src="' + $(this).attr("src") + '" >');
			$(this).removeAttr("src");
		}*/
		player.model.domelement.wrap("<div id='" + player.model.config.id + "_jwplayer' />");
		player.model.domelement.parent().css("position", "relative");
		//$(this).css("display", "none");
		player.model.domelement.css("position", "absolute");
		player.model.domelement.css("left", "0px");
		player.model.domelement.css("top", "0px");
		player.model.domelement.css("z-index", "0");
		player.model.domelement.before("<a href='" + player.model.sources[player.model.source].file + "' style='display:block; background:#ffffff url(" + player.model.config.image + ") no-repeat center center;width:" + player.model.width + "px;height:" + player.model.height + "px;position:relative;'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + (player.model.height - 60) / 2 + "px; left:" + (player.model.width - 60) / 2 + "px; border:0;' /></a>");
		player.model.domelement.prev("a").css("position", "relative");
		player.model.domelement.prev("a").css("z-index", "100");
		player.model.domelement.prev("a").click(function(evt) {
			if (typeof evt.preventDefault != 'undefined') {
				evt.preventDefault(); // W3C 
			} else {
				evt.returnValue = false; // IE 
			}
			if (player.state() !== $.fn.jwplayer.states.PLAYING){
				player.play();
			} else {
				player.pause();
			}
			 
		});
		$.jwplayer(player.model.config.id).state(function(obj) {
			imageHandler(obj, player);
		});
	};
	
	function imageHandler(obj, player) {
		switch (obj.newstate) {
			case $.fn.jwplayer.states.IDLE:
				player.model.domelement.css("z-index", "0");
				player.model.domelement.prev("a").css("z-index", "100");
				break;
			case $.fn.jwplayer.states.PLAYING:
				player.model.domelement.prev("a").css("z-index", "0");
				player.model.domelement.css("z-index", "100");
				break;
		}
	}
	
	$.fn.jwplayerView.switchMediaProvider = function(){
		
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
					elementvarString += elementvar + "='" + player.model.config[elementvar] + "'";
				}
			}
			flashvarString += "file=" + player.model.sources[player.model.source].file + "&";
			var config = $.extend(true, {}, player.model.config, options);
			for (var flashvar in config) {
				if (!((config[flashvar] === undefined) || (config[flashvar] === "") || (config[flashvar] === null))) {
						flashvarString += flashvar + "=" + config[flashvar] + "&";
				}
			}
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", player.model.config.flashplayer);
			htmlString = htmlString.replace("%style%", styleString);
			player.model.domelement.before(htmlString);
			var oldDOMElement = player.model.domelement;
			player.model.domelement = player.model.domelement.prev();
			oldDOMElement.remove();
		}
	};
	
	
})(jQuery);
