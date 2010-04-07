/**
 * Utility methods for the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-05
 */
(function($){

$.fn.jwplayerUtils = function(){
	return this.each(function() {
	});
}

/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
$.fn.jwplayerUtils.supportsFlash = function() {
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
$.fn.jwplayerUtils.supportsH264 = function() {
	try { 
		return !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	} catch(e) { 
		return false;
	}
};


/** check if this client supports HTML5 OGG playback. **/
$.fn.jwplayerUtils.supportsOgg = function() {
	try {
		return !!document.createElement('video').canPlayType('video/ogg; codecs="theora, vorbis"');
	} catch(e) { 
		return false;
	}
};

$.fn.jwplayerUtils.dump = function(object, depth) {
	if (object == null) {
		return 'null';
	} else if ($.fn.jwplayerUtils.typeOf(object) != 'object') {
		if ($.fn.jwplayerUtils.typeOf(object) == 'string'){
			return"\""+object+"\"";
		}
		return object;
	}
	
	var type = $.fn.jwplayerUtils.typeOf(object);
	
	(depth == undefined) ? depth = 1 : depth++;
	var indent = "";
	for (var i = 0; i < depth; i++) { indent += "\t"; }

	var result = (type == "array") ? "[" : "{";
	result += "\n"+indent;

	for (var i in object) {
		if (type == "object") { result += "\""+i+"\": "};
		result += $.fn.jwplayerUtils.dump(object[i], depth)+",\n"+indent;
	}
	
	result = result.substring(0, result.length-2-depth)+"\n";

	result  += indent.substring(0, indent.length-1);
	result  += (type == "array") ? "]" : "}";

	return result;
};
	
$.fn.jwplayerUtils.typeOf = function(value) {
	var s = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
	}
	return s;
};


$.fn.log = function (msg, obj) {
	try {
		console.log("%s: %o", msg, obj);
	} catch (err) {
	}
	return this;
};


})(jQuery);