/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var embedString = "<embed %elementvars% src='%flashplayer%' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' />";
	var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars%'> <param name='movie' value='%flashplayer%'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
	var elementvars = {
		width: true,
		height: true,
		id: true,
		name: true,
		className: true
	};
	
	$.fn.jwplayerView = function() {
		return this.each(function() {
			var video = $(this);
			$(this).wrap("<div />");
			$(this).before("<a href='" + $(this).data("model").sources[$(this).data("model").source].file + "' style='display:block; background:#ffffff url(" + $(this).data("model").image + ") no-repeat center center;width:" + $(this).data("model").width + "px;height:" + $(this).data("model").height + "px;position:relative;'><img src='http://content.bitsontherun.com/staticfiles/play.png' alt='Click to play video' style='position:absolute; top:" + ($(this).data("model").height - 60) / 2 + "px; left:" + ($(this).data("model").width - 60) / 2 + "px; border:0;' /></a>");
			$(this).prev("a").click(function(evt) {
				if (typeof evt.preventDefault != 'undefined') {
					evt.preventDefault(); // W3C 
				} else {
					evt.returnValue = false; // IE 
				}
				$.jwplayer(video).play();
			});
			$.jwplayer(video).state(imageHandler);
		});
	};
	
	function imageHandler(event, parameters) {
		switch (parameters.newState) {
			case 'idle':
				$(event.target).css("display", "none");
				$(event.target).prev("a").css("display", "inherit");
				break;
			case 'playing':
				$(event.target).css("display", "inherit");
				$(event.target).prev("a").css("display", "none");
				break;
		}
	}
	
	/** Embeds a Flash Player at the specified location in the DOM. **/
	$.fn.jwplayerView.embedFlash = function(domElement, model) {
		if (model.flashplayer !== false) {
			var htmlString, elementvarString = "", flashvarString = "";
			if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
				htmlString = embedString;
			} else {
				htmlString = objectString;
			}
			for (var elementvar in elementvars) {
				if (!((model[elementvar] === undefined) || (model[elementvar] === "") || (model[elementvar] === null))) {
					elementvarString += elementvar + "='" + model[elementvar] + "'";
				}
			}
			for (var flashvar in model) {
				if (!((model[flashvar] === undefined) || (model[flashvar] === "") || (model[flashvar] === null))) {
					if (flashvar == "sources") {
						flashvarString += "file=" + model.sources[model.source].file + "&";
					} else {
						flashvarString += flashvar + "=" + model[flashvar] + "&";
					}
				}
			}
			htmlString = htmlString.replace("%elementvars%", elementvarString);
			htmlString = htmlString.replace("%flashvars%", flashvarString);
			htmlString = htmlString.replace("%flashplayer%", model.flashplayer);
			$(domElement).before(htmlString);
		}
	};
	
	
})(jQuery);
