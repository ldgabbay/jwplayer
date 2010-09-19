/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.utils = function() {
	};
	
	/** Returns the extension of a file name **/
	jwplayer.html5.utils.extension = function(path) {
		return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	jwplayer.html5.utils.getAbsolutePath = function(path) {
		if (path === undefined) {
			return undefined;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = document.location.href.substr(0, document.location.href.indexOf("://") + 3);
		var basepath = document.location.href.split("?")[0];
		basepath = basepath.substring(protocol.length, (path.indexOf("/") === 0) ? basepath.indexOf('/', protocol.length) : basepath.lastIndexOf('/'));
		var patharray = (basepath + "/" + path).split("/");
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if (patharray[i] === undefined || patharray[i] == ".") {
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
		if (path === null) {
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}
	
	
	jwplayer.html5.utils.mapEmpty = function(map) {
		for (var val in map) {
			return false;
		}
		return true;
	};
	
	jwplayer.html5.utils.mapLength = function(map) {
		var result = 0;
		for (var val in map) {
			result++;
		}
		return result;
	};
	
	/** Logger **/
	jwplayer.html5.utils.log = function(msg, obj) {
		if (obj) {
			obj.message = msg;
			console.log(msg, obj);
		} else {
			console.log(msg);
		}
		return this;
	};
	
	jwplayer.html5.utils.css = function(domelement, styles, debug) {
		if (domelement !== undefined) {
			for (var style in styles) {
				try {
					if (typeof styles[style] == "number" && !(style == "zIndex" || style == "opacity")) {
						if (style.match(/color/i)) {
							styles[style] = "#" + _pad(styles[style].toString(16), 6);
						} else {
							styles[style] = styles[style] + "px";
						}
					}
					domelement.style[style] = styles[style];
				} catch (err) {
				}
			}
		}
	};
	
	function _pad(string, length) {
		while (string.length < length) {
			string = "0" + string;
		}
		return string;
	}
	
})(jwplayer);
