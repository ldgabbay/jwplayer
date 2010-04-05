/**
 * Utility methods for the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-05
 */
(function($){

$.fn.jwplayer.utils = function(ops) {
	return this.each(function() {
	});
};

/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
$.fn.jwplayer.utils.supportsFlash = function() {
	var version = '0,0,0,0';
	try {
		try {
			var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
			try { axo.AllowScriptAccess = 'always'; }
			catch(e) { version = '6,0,0'; }
		} catch(e) {}
		version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
	} catch(e) {
		try {
			if(navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
				version = (navigator.plugins["Shockwave Flash 2.0"] || 
					navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
			}
		} catch(e) {}
	}
	var major = parseInt(version.split(',')[0]);
	var minor = parseInt(version.split(',')[2]);
	if(major > 9 || (major == 9 && minor > 97)) {
		return true;
	} else {
		return false;
	}
};

/** check if this client supports HTML5 H.264 playback. **/
$.fn.jwplayer.utils.supportsH264 = function() {
	try { 
		return !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	} catch(e) { 
		return false;
	}
};


/** check if this client supports HTML5 OGG playback. **/
$.fn.jwplayer.utils.supportsOgg = function() {
	try {
		return !!document.createElement('video').canPlayType('video/ogg; codecs="theora, vorbis"');
	} catch(e) { 
		return false;
	}
};


/** Embeds a Flash Player at the specified location in the DOM. **/
$.fn.jwplayer.utils.embedFlash = function(object, options) {
	object = $(object);
	var flashvars = "";
	for (var option in options) {
		if (options[option] != undefined) {
			flashvars += option + "=" + options[option] + "&";
		}
	}
	if ($.browser.msie) {
		object.replaceWith("<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='"+object.attr('width') +"' height='"+object.attr('height') +"' id='"+object.attr('id') +"' name='"+object.attr('name') +"' class='"+object.attr("class") +"'>" +
			"<param name='movie' value='src/jquery.jwplayer.swf'>" +
			"<param name='allowfullscreen' value='true'>" +
			"<param name='allowscriptaccess' value='always'>" +
			"<param name='wmode' value='transparent'>" +
			"<param name='flashvars' value='"+flashvars+"file="+object.attr('src') +"&image="+object.attr('poster') +"'>" +
			"</object>"
		);
	} else {
		object.replaceWith("<embed " +
			"width='" + object.attr('width') + "' " +
			"height='" + object.attr('height') + "' " + 
			"id='" + object.attr('id') + "' " +
			"name='" + object.attr('name') + "' " +
			"class='" + object.attr('class') + "' " +
			"src='src/jquery.jwplayer.swf' " +
			"allowfullscreen='true' " +
			"allowscriptaccess='always' " +
			"flashvars='" + flashvars + "file=" + object.attr('src') +"&image="+object.attr('poster') +"' " +
			"/>"
		);
	}
};


})(jQuery);