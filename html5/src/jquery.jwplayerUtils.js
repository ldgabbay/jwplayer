/**
 * Utility methods for the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	/** Constructor **/
	$.fn.jwplayerUtils = function() {
		return this.each(function() {
		});
	};
	
	//http://old.nabble.com/jQuery-may-add-$.browser.isiPhone-td11163329s27240.html
	$.fn.jwplayerUtils.isiPhone = function() {
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(/iPhone/i) || agent.match(/iPad/i));
	};
	
	/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
	$.fn.jwplayerUtils.supportsFlash = function() {
		var version = '0,0,0,0';
		try {
			try {
				var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
				try {
					axo.AllowScriptAccess = 'always';
				} catch (e) {
					version = '6,0,0';
				}
			} catch (e) {
			}
			version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
		} catch (e) {
			try {
				if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
					version = (navigator.plugins['Shockwave Flash 2.0'] ||
					navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
				}
			} catch (e) {
			}
		}
		var major = parseInt(version.split(',')[0], 10);
		var minor = parseInt(version.split(',')[2], 10);
		if (major > 9 || (major == 9 && minor > 97)) {
			return true;
		} else {
			return false;
		}
	};
	
	/** Filetypes supported by Flash **/
	var flashFileTypes = {
		'aac': true,
		'f4v': true,
		'flv': true,
		'm4a': true,
		'm4v': true,
		'mov': true,
		'mp3': true,
		'mp4': true
	};
	
	
	/** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
	$.fn.jwplayerUtils.flashCanPlay = function(fileName) {
		if (flashFileTypes[$.fn.jwplayerUtils.extension(fileName)]) {
			return true;
		}
		return false;
	};
	
	/** Check if this client supports playback for the specified type. **/
	$.fn.jwplayerUtils.supportsType = function(type) {
		try {
			return !!document.createElement('video').canPlayType(type);
		} catch (e) {
			return false;
		}
	};
	
	/** Check if this client supports HTML5 H.264 playback. **/
	$.fn.jwplayerUtils.supportsH264 = function() {
		return $.fn.jwplayerUtils.supportsType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
	};
	
	
	/** Check if this client supports HTML5 OGG playback. **/
	$.fn.jwplayerUtils.supportsOgg = function() {
		return $.fn.jwplayerUtils.supportsType('video/ogg; codecs="theora, vorbis"');
	};
	
	/** Returns the extension of a file name **/
	$.fn.jwplayerUtils.extension = function(path) {
		return path.substr(path.lastIndexOf('.') + 1, path.length);
	};
	
	/** Resets an element's CSS **/
	$.fn.jwplayerCSS = function(options) {
		return this.each(function() {
			var defaults = {
				'margin': 0,
				'padding': 0,
				'background': 'none',
				'border': 'none',
				'bottom': 'auto',
				'clear': 'none',
				'float': 'none',
				'font-family': '"Arial", "Helvetica", sans-serif',
				'font-size': 'medium',
				'font-style': 'normal',
				'font-weight': 'normal',
				'height': 'auto',
				'left': 'auto',
				'letter-spacing': 'normal',
				'line-height': 'normal',
				'max-height': 'none',
				'max-width': 'none',
				'min-height': 0,
				'min-width': 0,
				'overflow': 'visible',
				'position': 'static',
				'right': 'auto',
				'text-align': 'left',
				'text-decoration': 'none',
				'text-indent': 0,
				'text-transform': 'none',
				'top': 'auto',
				'visibility': 'visible',
				'white-space': 'normal',
				'width': 'auto',
				'z-index': 'auto'
			};
			try {
				$(this).css($.extend(defaults, options));
			} catch (err) {
				//alert($.fn.jwplayerUtils.dump(err));
			}
		});
	};
	
	$.fn.jwplayerUtils.isNull = function(obj) {
		return ((obj === null) || (obj === undefined) || (obj === ""));
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	$.fn.jwplayerUtils.getAbsolutePath = function(path) {
		if ($.fn.jwplayerUtils.isNull(path)){
			return path;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = document.location.href.substr(0, document.location.href.indexOf("://") + 3);
		var basepath = document.location.href.substring(protocol.length, (path.indexOf("/") === 0) ? document.location.href.indexOf('/') : document.location.href.lastIndexOf('/'));
		var patharray = (basepath + "/" + path).split("/");
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if ($.fn.jwplayerUtils.isNull(patharray[i]) || patharray[i] == ".") {
				continue;
			} else if (patharray[i] == "..") {
				result.pop();
			} else {
				result.push(patharray[i]);
			}
		}
		return protocol + result.join("/");
	};
	
	function isAbsolutePath(path) {
		if($.fn.jwplayerUtils.isNull(path)){
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}
	
	/** Dumps the content of an object to a string **/
	$.fn.jwplayerUtils.dump = function(object, depth) {
		if (object === null) {
			return 'null';
		} else if ($.fn.jwplayerUtils.typeOf(object) != 'object') {
			if ($.fn.jwplayerUtils.typeOf(object) == 'string') {
				return "\"" + object + "\"";
			}
			return object;
		}
		
		var type = $.fn.jwplayerUtils.typeOf(object);
		
		depth = (depth === undefined) ? 1 : depth + 1;
		var indent = "";
		for (var i = 0; i < depth; i++) {
			indent += "\t";
		}
		
		var result = (type == "array") ? "[" : "{";
		result += "\n" + indent;
		
		for (var i in object) {
			if (type == "object") {
				result += "\"" + i + "\": ";
			}
			result += $.fn.jwplayerUtils.dump(object[i], depth) + ",\n" + indent;
		}
		
		result = result.substring(0, result.length - 2 - depth) + "\n";
		
		result += indent.substring(0, indent.length - 1);
		result += (type == "array") ? "]" : "}";
		
		return result;
	};
	
	/** Returns the true type of an object **/
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
	
	
	/** Logger **/
	$.fn.jwplayerUtils.log = function(msg, obj) {
		try {
			if (obj) {
				console.log("%s: %o", msg, obj);
			} else {
				console.log($.fn.jwplayerUtils.dump(msg));
			}
		} catch (err) {
		}
		return this;
	};
	
	
})(jQuery);
