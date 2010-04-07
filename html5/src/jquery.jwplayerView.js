/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-05
 */
(function($){

$.fn.jwplayerView = function() {
};

/** Embeds a Flash Player at the specified location in the DOM. **/
$.fn.jwplayerView.embedFlash = function(domElement, model) {
	if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
		$(domElement).replaceWith("<embed " + 
			"width='" + model.width + "' " + 
			"height='" + model.height + "' " + 
			"id='" + model.id + "' " + 
			"name='" + model.name + "' " + 
			"class='" + model.className + "' " + 
			"src='src/jquery.jwplayer.swf' " + 
			"allowfullscreen='true' " + 
			"allowscriptaccess='always' " + 
			"flashvars='file=" + model.sources[0].file + "&image=" + model.image + "' " + 
			"/>"
		);
	} else {
			$(domElement).replaceWith("<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='" + model.width + "' height='" + model.height + "' id='" + model.id + "' name='" + model.name + "' class='" + model.className + "'>" + 
			"<param name='movie' value='src/jquery.jwplayer.swf'>" + 
			"<param name='allowfullscreen' value='true'>" + 
			"<param name='allowscriptaccess' value='always'>" + 
			"<param name='wmode' value='transparent'>" + 
			"<param name='flashvars' value='file=" + model.sources[0].file + "&image=" + model.image + "'>" + 
			"</object>"
		);
	}
};


})(jQuery);