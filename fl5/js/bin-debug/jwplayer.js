/**
 * JW Player Source start cap
 * 
 * This will appear at the top of the JW Player source
 * 
 * @version 5.7
 */

 if (typeof jwplayer == "undefined") {/**
 * JW Player namespace definition
 * @version 5.7
 */
var jwplayer = function(container) {
	if (jwplayer.api){
		return jwplayer.api.selectPlayer(container);
	}
};

var $jw = jwplayer;

jwplayer.version = '5.7.1847';

// "Shiv" method for older IE browsers; required for parsing media tags
jwplayer.vid = document.createElement("video");
jwplayer.audio = document.createElement("audio");
jwplayer.source = document.createElement("source");/**
 * Utility methods for the JW Player.
 * 
 * @author zach, pablo
 * @version 5.7
 */
(function(jwplayer) {

	jwplayer.utils = function() {
	};

	/** Returns the true type of an object * */

	/**
	 * 
	 * @param {Object}
	 *            value
	 */
	jwplayer.utils.typeOf = function(value) {
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

	/** Merges a list of objects * */
	jwplayer.utils.extend = function() {
		var args = jwplayer.utils.extend['arguments'];
		if (args.length > 1) {
			for ( var i = 1; i < args.length; i++) {
				for ( var element in args[i]) {
					args[0][element] = args[i][element];
				}
			}
			return args[0];
		}
		return null;
	};

	/**
	 * Returns a deep copy of an object.
	 * 
	 * @param {Object}
	 *            obj
	 */
	jwplayer.utils.clone = function(obj) {
		var result;
		var args = jwplayer.utils.clone['arguments'];
		if (args.length == 1) {
			switch (jwplayer.utils.typeOf(args[0])) {
			case "object":
				result = {};
				for ( var element in args[0]) {
					result[element] = jwplayer.utils.clone(args[0][element]);
				}
				break;
			case "array":
				result = [];
				for ( var element in args[0]) {
					result[element] = jwplayer.utils.clone(args[0][element]);
				}
				break;
			default:
				return args[0];
				break;
			}
		}
		return result;
	};

	/** Returns the extension of a file name * */
	jwplayer.utils.extension = function(path) {
		if (!path) { return ""; }
		path = path.substring(path.lastIndexOf("/") + 1, path.length);
		path = path.split("?")[0];
		if (path.lastIndexOf('.') > -1) {
			return path.substr(path.lastIndexOf('.') + 1, path.length)
					.toLowerCase();
		}
		return;
	};

	/** Updates the contents of an HTML element * */
	jwplayer.utils.html = function(element, content) {
		element.innerHTML = content;
	};

	/** Wraps an HTML element with another element * */
	jwplayer.utils.wrap = function(originalElement, appendedElement) {
		if (originalElement.parentNode) {
			originalElement.parentNode.replaceChild(appendedElement,
					originalElement);
		}
		appendedElement.appendChild(originalElement);
	};

	/** Loads an XML file into a DOM object * */
	jwplayer.utils.ajax = function(xmldocpath, completecallback, errorcallback) {
		var xmlhttp;
		if (window.XMLHttpRequest) {
			// IE>7, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {
			// IE6
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				if (xmlhttp.status === 200) {
					if (completecallback) {
						completecallback(xmlhttp);
					}
				} else {
					if (errorcallback) {
						errorcallback(xmldocpath);
					}
				}
			}
		};
		try {
			xmlhttp.open("GET", xmldocpath, true);
			xmlhttp.send(null);
		} catch (error) {
			if (errorcallback) {
				errorcallback(xmldocpath);
			}
		}
		return xmlhttp;
	};

	/** Loads a file * */
	jwplayer.utils.load = function(domelement, completecallback, errorcallback) {
		domelement.onreadystatechange = function() {
			if (domelement.readyState === 4) {
				if (domelement.status === 200) {
					if (completecallback) {
						completecallback();
					}
				} else {
					if (errorcallback) {
						errorcallback();
					}
				}
			}
		};
	};

	/** Finds tags in a DOM, returning a new DOM * */
	jwplayer.utils.find = function(dom, tag) {
		return dom.getElementsByTagName(tag);
	};

	/** * */

	/** Appends an HTML element to another element HTML element * */
	jwplayer.utils.append = function(originalElement, appendedElement) {
		originalElement.appendChild(appendedElement);
	};

	/**
	 * Detects whether the current browser is IE !+"\v1" technique from
	 * http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
	 * Note - this detection no longer works for IE9, hence the detection for
	 * window.ActiveXObject
	 */
	jwplayer.utils.isIE = function() {
		return ((!+"\v1") || (typeof window.ActiveXObject != "undefined"));
	};

	/**
	 * Detects whether the current browser is Android 2.0, 2.1 or 2.2 which do
	 * have some support for HTML5
	 */
	jwplayer.utils.isLegacyAndroid = function() {
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(/android 2.[012]/i) !== null);
	};

	/**
	 * Detects whether the current browser is mobile Safari.
	 */
	jwplayer.utils.isIOS = function(regex) {
		if (typeof regex == "undefined") {
			regex = /iP(hone|ad|od)/i;
		}
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(regex) !== null);
	};
	
	jwplayer.utils.isIPad = function() {
		return jwplayer.utils.isIOS(/iPad/i);
	};

	jwplayer.utils.isIPod = function() {
		return jwplayer.utils.isIOS(/iP(hone|od)/i);
	};

	jwplayer.utils.getFirstPlaylistItemFromConfig = function(config) {
		var item = {};
		var playlistItem;
		if (config.playlist && config.playlist.length) {
			playlistItem = config.playlist[0];
		} else {
			playlistItem = config;
		}
		item.file = playlistItem.file;
		item.levels = playlistItem.levels;
		item.streamer = playlistItem.streamer;
		item.playlistfile = playlistItem.playlistfile;

		item.provider = playlistItem.provider;
		if (!item.provider) {
			if (item.file
					&& (item.file.toLowerCase().indexOf("youtube.com") > -1 || item.file
							.toLowerCase().indexOf("youtu.be") > -1)) {
				item.provider = "youtube";
			}
			if (item.streamer
					&& item.streamer.toLowerCase().indexOf("rtmp://") == 0) {
				item.provider = "rtmp";
			}
			if (playlistItem.type) {
				item.provider = playlistItem.type.toLowerCase();
			}
		}
		
		if (item.provider == "audio") {
			item.provider = "sound";
		}

		return item;
	}

	/**
	 * Replacement for "outerHTML" getter (not available in FireFox)
	 */
	jwplayer.utils.getOuterHTML = function(element) {
		if (element.outerHTML) {
			return element.outerHTML;
		} else {
			try {
				return new XMLSerializer().serializeToString(element);
			} catch (err) {
				return "";
			}
		}
	};

	/**
	 * Replacement for outerHTML setter (not available in FireFox)
	 */
	jwplayer.utils.setOuterHTML = function(element, html) {
		if (element.outerHTML) {
			element.outerHTML = html;
		} else {
			var el = document.createElement('div');
			el.innerHTML = html;
			var range = document.createRange();
			range.selectNodeContents(el);
			var documentFragment = range.extractContents();
			element.parentNode.insertBefore(documentFragment, element);
			element.parentNode.removeChild(element);
		}
	};

	/**
	 * Detects whether or not the current player has flash capabilities TODO:
	 * Add minimum flash version constraint: 9.0.115
	 */
	jwplayer.utils.hasFlash = function() {
		if (typeof navigator.plugins != "undefined"
				&& typeof navigator.plugins['Shockwave Flash'] != "undefined") {
			return true;
		}
		if (typeof window.ActiveXObject != "undefined") {
			try {
				new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				return true
			} catch (err) {
			}
		}
		return false;
	};

	/**
	 * Extracts a plugin name from a string
	 */
	jwplayer.utils.getPluginName = function(pluginName) {
		if (pluginName.lastIndexOf("/") >= 0) {
			pluginName = pluginName.substring(pluginName.lastIndexOf("/") + 1,
					pluginName.length);
		}
		if (pluginName.lastIndexOf("-") >= 0) {
			pluginName = pluginName.substring(0, pluginName.lastIndexOf("-"));
		}
		if (pluginName.lastIndexOf(".swf") >= 0) {
			pluginName = pluginName
					.substring(0, pluginName.lastIndexOf(".swf"));
		}
		if (pluginName.lastIndexOf(".js") >= 0) {
			pluginName = pluginName.substring(0, pluginName.lastIndexOf(".js"));
		}
		return pluginName;
	};

	/**
	 * Extracts a plugin version from a string
	 */
	jwplayer.utils.getPluginVersion = function(pluginName) {
		if (pluginName.lastIndexOf("-") >= 0) {
			if (pluginName.lastIndexOf(".js") >= 0) {
				return pluginName.substring(pluginName.lastIndexOf("-") + 1,
						pluginName.lastIndexOf(".js"));
			} else if (pluginName.lastIndexOf(".swf") >= 0) {
				return pluginName.substring(pluginName.lastIndexOf("-") + 1,
						pluginName.lastIndexOf(".swf"));
			} else {
				return pluginName.substring(pluginName.lastIndexOf("-") + 1);
			}
		}
		return "";
	};

	/** Gets an absolute file path based on a relative filepath * */
	jwplayer.utils.getAbsolutePath = function(path, base) {
		if (!jwplayer.utils.exists(base)) {
			base = document.location.href;
		}
		if (!jwplayer.utils.exists(path)) {
			return undefined;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = base.substring(0, base.indexOf("://") + 3);
		var domain = base.substring(protocol.length, base.indexOf('/',
				protocol.length + 1));
		var patharray;
		if (path.indexOf("/") === 0) {
			patharray = path.split("/");
		} else {
			var basepath = base.split("?")[0];
			basepath = basepath.substring(protocol.length + domain.length + 1,
					basepath.lastIndexOf('/'));
			patharray = basepath.split("/").concat(path.split("/"));
		}
		var result = [];
		for ( var i = 0; i < patharray.length; i++) {
			if (!patharray[i] || !jwplayer.utils.exists(patharray[i])
					|| patharray[i] == ".") {
				continue;
			} else if (patharray[i] == "..") {
				result.pop();
			} else {
				result.push(patharray[i]);
			}
		}
		return protocol + domain + "/" + result.join("/");
	};

	function isAbsolutePath(path) {
		if (!jwplayer.utils.exists(path)) {
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}

	/**
	 * Types of plugin paths
	 */
	jwplayer.utils.pluginPathType = {
		// TODO: enum
		ABSOLUTE : "ABSOLUTE",
		RELATIVE : "RELATIVE",
		CDN : "CDN"
	}

	/*
	 * Test cases getPathType('hd') getPathType('hd-1') getPathType('hd-1.4')
	 * 
	 * getPathType('http://plugins.longtailvideo.com/5/hd/hd.swf')
	 * getPathType('http://plugins.longtailvideo.com/5/hd/hd-1.swf')
	 * getPathType('http://plugins.longtailvideo.com/5/hd/hd-1.4.swf')
	 * 
	 * getPathType('./hd.swf') getPathType('./hd-1.swf')
	 * getPathType('./hd-1.4.swf')
	 */
	jwplayer.utils.getPluginPathType = function(path) {
		if (typeof path != "string") {
			return;
		}
		path = path.split("?")[0];
		var protocol = path.indexOf("://");
		if (protocol > 0) {
			return jwplayer.utils.pluginPathType.ABSOLUTE;
		}
		var folder = path.indexOf("/");
		var extension = jwplayer.utils.extension(path);
		if (protocol < 0 && folder < 0 && (!extension || !isNaN(extension))) {
			return jwplayer.utils.pluginPathType.CDN;
		}
		return jwplayer.utils.pluginPathType.RELATIVE;
	};

	jwplayer.utils.mapEmpty = function(map) {
		for ( var val in map) {
			return false;
		}
		return true;
	};

	jwplayer.utils.mapLength = function(map) {
		var result = 0;
		for ( var val in map) {
			result++;
		}
		return result;
	};

	/** Logger * */
	jwplayer.utils.log = function(msg, obj) {
		if (typeof console != "undefined" && typeof console.log != "undefined") {
			if (obj) {
				console.log(msg, obj);
			} else {
				console.log(msg);
			}
		}
	};

	/**
	 * 
	 * @param {Object}
	 *            domelement
	 * @param {Object}
	 *            styles
	 * @param {Object}
	 *            debug
	 */
	jwplayer.utils.css = function(domelement, styles, debug) {
		if (jwplayer.utils.exists(domelement)) {
			for ( var style in styles) {
				try {
					if (typeof styles[style] === "undefined") {
						continue;
					} else if (typeof styles[style] == "number"
							&& !(style == "zIndex" || style == "opacity")) {
						if (isNaN(styles[style])) {
							continue;
						}
						if (style.match(/color/i)) {
							styles[style] = "#"
									+ jwplayer.utils.strings.pad(styles[style]
											.toString(16), 6);
						} else {
							styles[style] = Math.ceil(styles[style]) + "px";
						}
					}
					domelement.style[style] = styles[style];
				} catch (err) {
				}
			}
		}
	};

	jwplayer.utils.isYouTube = function(path) {
		return (path.indexOf("youtube.com") > -1 || path.indexOf("youtu.be") > -1);
	};

	/**
	 * 
	 * @param {Object}
	 *            domelement
	 * @param {Object}
	 *            value
	 */
	jwplayer.utils.transform = function(domelement, value) {
		domelement.style.webkitTransform = value;
		domelement.style.MozTransform = value;
		domelement.style.OTransform = value;
	};

	/**
	 * Stretches domelement based on stretching. parentWidth, parentHeight,
	 * elementWidth, and elementHeight are required as the elements dimensions
	 * change as a result of the stretching. Hence, the original dimensions must
	 * always be supplied.
	 * 
	 * @param {String}
	 *            stretching
	 * @param {DOMElement}
	 *            domelement
	 * @param {Number}
	 *            parentWidth
	 * @param {Number}
	 *            parentHeight
	 * @param {Number}
	 *            elementWidth
	 * @param {Number}
	 *            elementHeight
	 */
	jwplayer.utils.stretch = function(stretching, domelement, parentWidth,
			parentHeight, elementWidth, elementHeight) {
		if (typeof parentWidth == "undefined"
				|| typeof parentHeight == "undefined"
				|| typeof elementWidth == "undefined"
				|| typeof elementHeight == "undefined") {
			return;
		}
		var xscale = parentWidth / elementWidth;
		var yscale = parentHeight / elementHeight;
		var x = 0;
		var y = 0;
		domelement.style.overflow = "hidden";
		jwplayer.utils.transform(domelement, "");
		var style = {};
		switch (stretching.toUpperCase()) {
		case jwplayer.utils.stretching.NONE:
			// Maintain original dimensions
			style.width = elementWidth;
			style.height = elementHeight;
			break;
		case jwplayer.utils.stretching.UNIFORM:
			// Scale on the dimension that would overflow most
			if (xscale > yscale) {
				// Taller than wide
				style.width = elementWidth * yscale;
				style.height = elementHeight * yscale;
			} else {
				// Wider than tall
				style.width = elementWidth * xscale;
				style.height = elementHeight * xscale;
			}
			break;
		case jwplayer.utils.stretching.FILL:
			// Scale on the smaller dimension and crop
			if (xscale > yscale) {
				style.width = elementWidth * xscale;
				style.height = elementHeight * xscale;
			} else {
				style.width = elementWidth * yscale;
				style.height = elementHeight * yscale;
			}
			break;
		case jwplayer.utils.stretching.EXACTFIT:
			// Distort to fit
			jwplayer.utils.transform(domelement, [ "scale(", xscale, ",",
					yscale, ")", " translate(0px,0px)" ].join(""));
			style.width = elementWidth;
			style.height = elementHeight;
			break;
		default:
			break;
		}
		style.top = (parentHeight - style.height) / 2;
		style.left = (parentWidth - style.width) / 2;
		jwplayer.utils.css(domelement, style);
	};

	// TODO: enum
	jwplayer.utils.stretching = {
		NONE : "NONE",
		FILL : "FILL",
		UNIFORM : "UNIFORM",
		EXACTFIT : "EXACTFIT"
	};

	/**
	 * Recursively traverses nested object, replacing key names containing a
	 * search string with a replacement string.
	 * 
	 * @param searchString
	 *            The string to search for in the object's key names
	 * @param replaceString
	 *            The string to replace in the object's key names
	 * @returns The modified object.
	 */
	jwplayer.utils.deepReplaceKeyName = function(obj, searchString,
			replaceString) {
		switch (jwplayer.utils.typeOf(obj)) {
		case "array":
			for ( var i = 0; i < obj.length; i++) {
				obj[i] = jwplayer.utils.deepReplaceKeyName(obj[i],
						searchString, replaceString);
			}
			break;
		case "object":
			for ( var key in obj) {
				var newkey = key.replace(new RegExp(searchString, "g"),
						replaceString);
				obj[newkey] = jwplayer.utils.deepReplaceKeyName(obj[key],
						searchString, replaceString);
				if (key != newkey) {
					delete obj[key];
				}
			}
			break;
		}
		return obj;
	}

	/**
	 * Returns true if an element is found in a given array
	 * 
	 * @param array
	 *            The array to search
	 * @param search
	 *            The element to search
	 */
	jwplayer.utils.isInArray = function(array, search) {
		if (!(array) || !(array instanceof Array)) {
			return false;
		}

		for ( var i = 0; i < array.length; i++) {
			if (search === array[i]) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns true if the value of the object is null, undefined or the empty
	 * string
	 * 
	 * @param a
	 *            The variable to inspect
	 */
	jwplayer.utils.exists = function(a) {
		switch (typeof (a)) {
		case "string":
			return (a.length > 0);
			break;
		case "object":
			return (a !== null);
		case "undefined":
			return false;
		}
		return true;
	}
	
	/**
	 * Removes all of an HTML container's child nodes
	 **/
	jwplayer.utils.empty = function(elem) {
		if (typeof elem.hasChildNodes == "function") {
			while(elem.hasChildNodes()) {
				elem.removeChild(elem.firstChild);
			}
		}
	}
	
	/**
	 * Cleans up a css dimension (e.g. '420px') and returns an integer.
	 */
	jwplayer.utils.parseDimension = function(dimension) {
		if (typeof dimension == "string") {
			if (dimension === "") {
				return 0;
			} else if (dimension.lastIndexOf("%") > -1) {
				return dimension;
			} else {
				return parseInt(dimension.replace("px", ""), 10);
			}
		}
		return dimension;
	}

	/**
	 * Returns dimensions (x,y,width,height) of a display object
	 */
	jwplayer.utils.getDimensions = function(obj) {
		if (obj && obj.style) {
			return {
				x: jwplayer.utils.parseDimension(obj.style.left),
				y: jwplayer.utils.parseDimension(obj.style.top),
				width: jwplayer.utils.parseDimension(obj.style.width),
				height: jwplayer.utils.parseDimension(obj.style.height)
			};
		} else {
			return {};
		}
	}

	/** Format the elapsed / remaining text. **/
	jwplayer.utils.timeFormat = function(sec) {
		str = "00:00";
		if (sec > 0) {
			str = Math.floor(sec / 60) < 10 ? "0" + Math.floor(sec / 60) + ":" : Math.floor(sec / 60) + ":";
			str += Math.floor(sec % 60) < 10 ? "0" + Math.floor(sec % 60) : Math.floor(sec % 60);
		}
		return str;
	}
	
	


})(jwplayer);
/**
 * Event namespace defintion for the JW Player
 *
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	jwplayer.events = function() {
	};
	
	jwplayer.events.COMPLETE = "COMPLETE";
	jwplayer.events.ERROR = "ERROR";
})(jwplayer);
/**
 * Event dispatcher for the JW Player
 *
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	jwplayer.events.eventdispatcher = function(debug) {
		var _debug = debug;
		var _listeners;
		var _globallisteners;
		
		/** Clears all event listeners **/
		this.resetEventListeners = function() {
			_listeners = {};
			_globallisteners = [];
		};
		
		this.resetEventListeners();
		
		/** Add an event listener for a specific type of event. **/
		this.addEventListener = function(type, listener, count) {
			try {
				if (!jwplayer.utils.exists(_listeners[type])) {
					_listeners[type] = [];
				}
				
				if (typeof(listener) == "string") {
					eval("listener = " + listener);
				}
				_listeners[type].push({
					listener: listener,
					count: count
				});
			} catch (err) {
				jwplayer.utils.log("error", err);
			}
			return false;
		};
		
		
		/** Remove an event listener for a specific type of event. **/
		this.removeEventListener = function(type, listener) {
			try {
				for (var listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
					if (_listeners[type][listenerIndex].listener.toString() == listener.toString()) {
						_listeners[type].splice(listenerIndex, 1);
						break;
					}
				}
			} catch (err) {
				jwplayer.utils.log("error", err);
			}
			return false;
		};
		
		/** Add an event listener for all events. **/
		this.addGlobalListener = function(listener, count) {
			try {
				if (typeof(listener) == "string") {
					eval("listener = " + listener);
				}
				_globallisteners.push({
					listener: listener,
					count: count
				});
			} catch (err) {
				jwplayer.utils.log("error", err);
			}
			return false;
		};
		
		/** Add an event listener for all events. **/
		this.removeGlobalListener = function(listener) {
			try {
				for (var globalListenerIndex = 0; globalListenerIndex < _globallisteners.length; globalListenerIndex++) {
					if (_globallisteners[globalListenerIndex].listener.toString() == listener.toString()) {
						_globallisteners.splice(globalListenerIndex, 1);
						break;
					}
				}
			} catch (err) {
				jwplayer.utils.log("error", err);
			}
			return false;
		};
		
		
		/** Send an event **/
		this.sendEvent = function(type, data) {
			if (!jwplayer.utils.exists(data)) {
				data = {};
			}
			if (_debug) {
				jwplayer.utils.log(type, data);
			}
			if (typeof _listeners[type] != "undefined") {
				for (var listenerIndex = 0; listenerIndex < _listeners[type].length; listenerIndex++) {
					try {
						_listeners[type][listenerIndex].listener(data);
					} catch (err) {
						jwplayer.utils.log("There was an error while handling a listener: " + err.toString(), _listeners[type][listenerIndex].listener);
					}
					if (_listeners[type][listenerIndex]) {
						if (_listeners[type][listenerIndex].count === 1) {
							delete _listeners[type][listenerIndex];
						} else if (_listeners[type][listenerIndex].count > 0) {
							_listeners[type][listenerIndex].count = _listeners[type][listenerIndex].count - 1;
						}
					}
				}
			}
			for (var globalListenerIndex = 0; globalListenerIndex < _globallisteners.length; globalListenerIndex++) {
				try {
					_globallisteners[globalListenerIndex].listener(data);
				} catch (err) {
					jwplayer.utils.log("There was an error while handling a listener: " + err.toString(), _globallisteners[globalListenerIndex].listener);
				}
				if (_globallisteners[globalListenerIndex]) {
					if (_globallisteners[globalListenerIndex].count === 1) {
						delete _globallisteners[globalListenerIndex];
					} else if (_globallisteners[globalListenerIndex].count > 0) {
						_globallisteners[globalListenerIndex].count = _globallisteners[globalListenerIndex].count - 1;
					}
				}
			}
		};
	};
})(jwplayer);
/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	var _animations = {};
	
	jwplayer.utils.animations = function() {
	};
	
	jwplayer.utils.animations.transform = function(domelement, value) {
		domelement.style.webkitTransform = value;
		domelement.style.MozTransform = value;
		domelement.style.OTransform = value;
		domelement.style.msTransform = value;
	};
	
	jwplayer.utils.animations.transformOrigin = function(domelement, value) {
		domelement.style.webkitTransformOrigin = value;
		domelement.style.MozTransformOrigin = value;
		domelement.style.OTransformOrigin = value;
		domelement.style.msTransformOrigin = value;
	};
	
	jwplayer.utils.animations.rotate = function(domelement, deg) {
		jwplayer.utils.animations.transform(domelement, ["rotate(", deg, "deg)"].join(""));
	};
	
	jwplayer.utils.cancelAnimation = function(domelement) {
		delete _animations[domelement.id];
	};
	
	jwplayer.utils.fadeTo = function(domelement, endAlpha, time, startAlpha, delay, startTime) {
		// Interrupting
		if (_animations[domelement.id] != startTime && jwplayer.utils.exists(startTime)) {
			return;
		}
		// No need to fade if the opacity is already where we're going
		if (domelement.style.opacity == endAlpha) {
			return;
		}
		
		var currentTime = new Date().getTime();
		if (startTime > currentTime) {
			setTimeout(function() {
				jwplayer.utils.fadeTo(domelement, endAlpha, time, startAlpha, 0, startTime);
			}, startTime - currentTime);
		}
		if (domelement.style.display == "none") {
			domelement.style.display = "block";
		}
		if (!jwplayer.utils.exists(startAlpha)) {
			startAlpha = domelement.style.opacity === "" ? 1 : domelement.style.opacity;
		}
		if (domelement.style.opacity == endAlpha && domelement.style.opacity !== "" && jwplayer.utils.exists(startTime)) {
			if (endAlpha === 0) {
				domelement.style.display = "none";
			}
			return;
		}
		if (!jwplayer.utils.exists(startTime)) {
			startTime = currentTime;
			_animations[domelement.id] = startTime;
		}
		if (!jwplayer.utils.exists(delay)) {
			delay = 0;
		}
		var percentTime = (time > 0) ? ((currentTime - startTime) / (time * 1000)) : 0;
		percentTime = percentTime > 1 ? 1 : percentTime;
		var delta = endAlpha - startAlpha;
		var alpha = startAlpha + (percentTime * delta);
		if (alpha > 1) {
			alpha = 1;
		} else if (alpha < 0) {
			alpha = 0;
		}
		domelement.style.opacity = alpha;
		if (delay > 0) {
			_animations[domelement.id] = startTime + delay * 1000;
			jwplayer.utils.fadeTo(domelement, endAlpha, time, startAlpha, 0, _animations[domelement.id]);
			return;
		}
		setTimeout(function() {
			jwplayer.utils.fadeTo(domelement, endAlpha, time, startAlpha, 0, startTime);
		}, 10);
	};
})(jwplayer);
/**
 * Arrays utility class
 * 
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	jwplayer.utils.arrays = function(){};
	
	/**
	 * Finds an element in an Array
	 * 
	 * @param {Object} haystack
	 * @param {Object} needle
	 * @return {Number} int
	 */
	jwplayer.utils.arrays.indexOf = function(haystack, needle){
		for (var i = 0; i < haystack.length; i++){
			if (haystack[i] == needle){
				return i;
			}
		}
		return -1;
	};
	
	/**
	 * Removes and element from an array
	 * 
	 * @param {Object} haystack
	 * @param {Object} needle
	 */
	jwplayer.utils.arrays.remove = function(haystack, needle){
		var neeedleIndex = jwplayer.utils.arrays.indexOf(haystack, needle);
		if (neeedleIndex > -1){
			haystack.splice(neeedleIndex, 1);
		}
	};
})(jwplayer);
/**
 * JW Player Media Extension to Mime Type mapping
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.utils.extensionmap = {
		"3gp": {
			"html5": "video/3gpp",
			"flash": "video"
		},
		"3gpp": {
			"html5": "video/3gpp"
		},
		"3g2": {
			"html5": "video/3gpp2",
			"flash": "video"
		},
		"3gpp2": {
			"html5": "video/3gpp2"
		},
		"flv": {
			"flash": "video"
		},
		"f4a": {
			"html5": "audio/mp4"
		},
		"f4b": {
			"html5": "audio/mp4",
			"flash": "video"
		},
		"f4v": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"mov": {
			"html5": "video/quicktime",
			"flash": "video"
		},
		"m4a": {
			"html5": "audio/mp4",
			"flash": "video"
		},
		"m4b": {
			"html5": "audio/mp4"
		},
		"m4p": {
			"html5": "audio/mp4"
		},
		"m4v": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"mp4": {
			"html5": "video/mp4",
			"flash": "video"
		},
		"rbs":{
			"flash": "sound"
		},
		"aac": {
			"html5": "audio/aac",
			"flash": "video"
		},
		"mp3": {
			"html5": "audio/mp3",
			"flash": "sound"
		},
		"ogg": {
			"html5": "audio/ogg"
		},
		"oga": {
			"html5": "audio/ogg"
		},
		"ogv": {
			"html5": "video/ogg"
		},
		"webm": {
			"html5": "video/webm"
		},
		"m3u8": {
			"html5": "audio/x-mpegurl"
		},
		"gif": {
			"flash": "image"
		},
		"jpeg": {
			"flash": "image"
		},
		"jpg": {
			"flash": "image"
		},
		"swf":{
			"flash": "image"
		},
		"png":{
			"flash": "image"
		},
		"wav":{
			"html5": "audio/x-wav"
		}
	};
})(jwplayer);
/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

    jwplayer.utils.mediaparser = function() {};

	var elementAttributes = {
		element: {
			width: 'width',
			height: 'height',
			id: 'id',
			'class': 'className',
			name: 'name'
		},
		media: {
			src: 'file',
			preload: 'preload',
			autoplay: 'autostart',
			loop: 'repeat',
			controls: 'controls'
		},
		source: {
			src: 'file',
			type: 'type',
			media: 'media',
			'data-jw-width': 'width',
			'data-jw-bitrate': 'bitrate'
				
		},
		video: {
			poster: 'image'
		}
	};
	
	var parsers = {};
	
	jwplayer.utils.mediaparser.parseMedia = function(element) {
		return parseElement(element);
	};
	
	function getAttributeList(elementType, attributes) {
		if (!jwplayer.utils.exists(attributes)) {
			attributes = elementAttributes[elementType];
		} else {
			jwplayer.utils.extend(attributes, elementAttributes[elementType]);
		}
		return attributes;
	}
	
	function parseElement(domElement, attributes) {
		if (parsers[domElement.tagName.toLowerCase()] && !jwplayer.utils.exists(attributes)) {
			return parsers[domElement.tagName.toLowerCase()](domElement);
		} else {
			attributes = getAttributeList('element', attributes);
			var configuration = {};
			for (var attribute in attributes) {
				if (attribute != "length") {
					var value = domElement.getAttribute(attribute);
					if (jwplayer.utils.exists(value)) {
						configuration[attributes[attribute]] = value;
					}
				}
			}
			var bgColor = domElement.style['#background-color'];
			if (bgColor && !(bgColor == "transparent" || bgColor == "rgba(0, 0, 0, 0)")) {
				configuration.screencolor = bgColor;
			}
			return configuration;
		}
	}
	
	function parseMediaElement(domElement, attributes) {
		attributes = getAttributeList('media', attributes);
		var sources = [];
		var sourceTags = jwplayer.utils.selectors("source", domElement);
		for (var i in sourceTags) {
			if (!isNaN(i)){
				sources.push(parseSourceElement(sourceTags[i]));					
			}
		}
		var configuration = parseElement(domElement, attributes);
		if (jwplayer.utils.exists(configuration.file)) {
			sources[0] = {
				'file': configuration.file
			};
		}
		configuration.levels = sources;
		return configuration;
	}
	
	function parseSourceElement(domElement, attributes) {
		attributes = getAttributeList('source', attributes);
		var result = parseElement(domElement, attributes);
		result.width = result.width ? result.width : 0;
		result.bitrate = result.bitrate ? result.bitrate : 0;
		return result;
	}
	
	function parseVideoElement(domElement, attributes) {
		attributes = getAttributeList('video', attributes);
		var result = parseMediaElement(domElement, attributes);
		return result;
	}
	
	parsers.media = parseMediaElement;
	parsers.audio = parseMediaElement;
	parsers.source = parseSourceElement;
	parsers.video = parseVideoElement;
	
	
})(jwplayer);
/**
 * Loads a <script> tag
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	//TODO: Enum
	jwplayer.utils.loaderstatus = {
		NEW: "NEW",
		LOADING: "LOADING",
		ERROR: "ERROR",
		COMPLETE: "COMPLETE"
	};
	
	jwplayer.utils.scriptloader = function(url) {
		var _status = jwplayer.utils.loaderstatus.NEW;
		var _eventDispatcher = new jwplayer.events.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		
		this.load = function() {
			if (_status == jwplayer.utils.loaderstatus.NEW) {
				_status = jwplayer.utils.loaderstatus.LOADING;
				var scriptTag = document.createElement("script");
				// Most browsers
				scriptTag.onload = function(evt) {
					_status = jwplayer.utils.loaderstatus.COMPLETE;
					_eventDispatcher.sendEvent(jwplayer.events.COMPLETE);
				}
				scriptTag.onerror = function(evt) {
					_status = jwplayer.utils.loaderstatus.ERROR;
					_eventDispatcher.sendEvent(jwplayer.events.ERROR);
				}
				// IE
				scriptTag.onreadystatechange = function() {
					if (scriptTag.readyState == 'loaded' || scriptTag.readyState == 'complete') {
						_status = jwplayer.utils.loaderstatus.COMPLETE;
						_eventDispatcher.sendEvent(jwplayer.events.COMPLETE);
					}
					// Error?
				}
				document.getElementsByTagName("head")[0].appendChild(scriptTag);
				scriptTag.src = url;
			}
			
		};
		
		this.getStatus = function() {
			return _status;
		}
	}
})(jwplayer);
/**
 * Selectors for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.utils.selectors = function(selector, parent) {
		if (!jwplayer.utils.exists(parent)) {
			parent = document;
		}
		selector = jwplayer.utils.strings.trim(selector);
		var selectType = selector.charAt(0);
		if (selectType == "#") {
			return parent.getElementById(selector.substr(1));
		} else if (selectType == ".") {
			if (parent.getElementsByClassName) {
				return parent.getElementsByClassName(selector.substr(1));
			} else {
				return jwplayer.utils.selectors.getElementsByTagAndClass("*", selector.substr(1));
			}
		} else {
			if (selector.indexOf(".") > 0) {
				var selectors = selector.split(".");
				return jwplayer.utils.selectors.getElementsByTagAndClass(selectors[0], selectors[1]);
			} else {
				return parent.getElementsByTagName(selector);
			}
		}
		return null;
	};
	
	jwplayer.utils.selectors.getElementsByTagAndClass = function(tagName, className, parent) {
		var elements = [];
		if (!jwplayer.utils.exists(parent)) {
			parent = document;
		}
		var selected = parent.getElementsByTagName(tagName);
		for (var i = 0; i < selected.length; i++) {
			if (jwplayer.utils.exists(selected[i].className)) {
				var classes = selected[i].className.split(" ");
				for (var classIndex = 0; classIndex < classes.length; classIndex++) {
					if (classes[classIndex] == className) {
						elements.push(selected[i]);
					}
				}
			}
		}
		return elements;
	};
})(jwplayer);
/**
 * String utilities for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

	jwplayer.utils.strings = function() {
	};
	
	/** Removes whitespace from the beginning and end of a string **/
	jwplayer.utils.strings.trim = function(inputString) {
		return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
	};
	
	/**
	 * Pads a string
	 * @param {String} string
	 * @param {Number} length
	 * @param {String} padder
	 */
	jwplayer.utils.strings.pad = function (string, length, padder) {
		if (!padder){
			padder = "0";
		}
		while (string.length < length) {
			string = padder + string;
		}
		return string;
	}
	
		/**
	 * Basic serialization: string representations of booleans and numbers are returned typed;
	 * strings are returned urldecoded.
	 *
	 * @param {String} val	String value to serialize.
	 * @return {Object}		The original value in the correct primitive type.
	 */
	jwplayer.utils.strings.serialize = function(val) {
		if (val == null) {
			return null;
		} else if (val == 'true') {
			return true;
		} else if (val == 'false') {
			return false;
		} else if (isNaN(Number(val)) || val.length > 5 || val.length == 0) {
			return val;
		} else {
			return Number(val);
		}
	}
	
	
	/**
	 * Convert a time-representing string to a number.
	 *
	 * @param {String}	The input string. Supported are 00:03:00.1 / 03:00.1 / 180.1s / 3.2m / 3.2h
	 * @return {Number}	The number of seconds.
	 */
	jwplayer.utils.strings.seconds = function(str) {
		str = str.replace(',', '.');
		var arr = str.split(':');
		var sec = 0;
		if (str.substr(-1) == 's') {
			sec = Number(str.substr(0, str.length - 1));
		} else if (str.substr(-1) == 'm') {
			sec = Number(str.substr(0, str.length - 1)) * 60;
		} else if (str.substr(-1) == 'h') {
			sec = Number(str.substr(0, str.length - 1)) * 3600;
		} else if (arr.length > 1) {
			sec = Number(arr[arr.length - 1]);
			sec += Number(arr[arr.length - 2]) * 60;
			if (arr.length == 3) {
				sec += Number(arr[arr.length - 3]) * 3600;
			}
		} else {
			sec = Number(str);
		}
		return sec;
	}
	
	
	/**
	 * Get the value of a case-insensitive attribute in an XML node
	 * @param {XML} xml
	 * @param {String} attribute
	 * @return {String} Value
	 */
	jwplayer.utils.strings.xmlAttribute = function(xml, attribute) {
		for (var attrib in xml.attributes) {
			if (xml.attributes[attrib].name && xml.attributes[attrib].name.toLowerCase() == attribute.toLowerCase()) 
				return xml.attributes[attrib].value.toString();
		}
		return "";
	}
	
	/**
	 * Converts a JSON object into its string representation.
	 * @param obj {Object} String, Number, Array or nested Object to serialize
	 * Serialization code borrowed from 
	 */
	jwplayer.utils.strings.jsonToString = function(obj) {
		// Use browser's native JSON implementation if it exists.
		var JSON = JSON || {}
		if (JSON && JSON.stringify) {
				return JSON.stringify(obj);
		}

		var type = typeof (obj);
		if (type != "object" || obj === null) {
			// Object is string or number
			if (type == "string") {
				obj = '"'+obj+'"';
			} else {
				return String(obj);
			}
		}
		else {
			// Object is an array or object
			var toReturn = [],
				isArray = (obj && obj.constructor == Array);
				
			for (var item in obj) {
				var value = obj[item];
				
				switch (typeof(value)) {
					case "string":
						value = '"' + value + '"';
						break;
					case "object":
						if (jwplayer.utils.exists(value)) {
							value = jwplayer.utils.strings.jsonToString(value);
						}
						break;
				}
				if (isArray) {
					// Array
					if (typeof(value) != "function") {
						toReturn.push(String(value));
					}
				} else {
					// Object
					if (typeof(value) != "function") {
						toReturn.push('"' + item + '":' + String(value));
					}
				}
			}
			
			if (isArray) {
				return "[" + String(toReturn) + "]";
			} else {
				return "{" + String(toReturn) + "}";
			}
		}
	}
	
})(jwplayer);/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	var _colorPattern = new RegExp(/^(#|0x)[0-9a-fA-F]{3,6}/);
	
	jwplayer.utils.typechecker = function(value, type) {
		type = !jwplayer.utils.exists(type) ? _guessType(value) : type;
		return _typeData(value, type);
	};
	
	function _guessType(value) {
		var bools = ["true", "false", "t", "f"];
		if (bools.toString().indexOf(value.toLowerCase().replace(" ", "")) >= 0) {
			return "boolean";
		} else if (_colorPattern.test(value)) {
			return "color";
		} else if (!isNaN(parseInt(value, 10)) && parseInt(value, 10).toString().length == value.length) {
			return "integer";
		} else if (!isNaN(parseFloat(value)) && parseFloat(value).toString().length == value.length) {
			return "float";
		}
		return "string";
	}
	
	function _typeData(value, type) {
		if (!jwplayer.utils.exists(type)) {
			return value;
		}
		
		switch (type) {
			case "color":
				if (value.length > 0) {
					return _stringToColor(value);
				}
				return null;
			case "integer":
				return parseInt(value, 10);
			case "float":
				return parseFloat(value);
			case "boolean":
				if (value.toLowerCase() == "true") {
					return true;
				} else if (value == "1") {
					return true;
				}
				return false;
		}
		return value;
	}
	
	function _stringToColor(value) {
		switch (value.toLowerCase()) {
			case "blue":
				return parseInt("0000FF", 16);
			case "green":
				return parseInt("00FF00", 16);
			case "red":
				return parseInt("FF0000", 16);
			case "cyan":
				return parseInt("00FFFF", 16);
			case "magenta":
				return parseInt("FF00FF", 16);
			case "yellow":
				return parseInt("FFFF00", 16);
			case "black":
				return parseInt("000000", 16);
			case "white":
				return parseInt("FFFFFF", 16);
			default:
				value = value.replace(/(#|0x)?([0-9A-F]{3,6})$/gi, "$2");
				if (value.length == 3) {
					value = value.charAt(0) + value.charAt(0) + value.charAt(1) + value.charAt(1) + value.charAt(2) + value.charAt(2);
				}
				return parseInt(value, 16);
		}
		
		return parseInt("000000", 16);
	}
	
})(jwplayer);
/**
 * Parser class definition
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	jwplayer.utils.parsers = function() {
	};
	
})(jwplayer);
/**
 * Parse a feed item for JWPlayer content.
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	jwplayer.utils.parsers.jwparser = function() {
	};
	
	jwplayer.utils.parsers.jwparser.PREFIX = 'jwplayer';
	
	/**
	 * Parse a feed entry for JWPlayer content.
	 *
	 * @param	{XML}		obj	The XML object to parse.
	 * @param	{Object}	itm	The playlistentry to amend the object to.
	 * @return	{Object}		The playlistentry, amended with the JWPlayer info.
	 * @see			ASXParser
	 * @see			ATOMParser
	 * @see			RSSParser
	 * @see			SMILParser
	 * @see			XSPFParser
	 */
	jwplayer.utils.parsers.jwparser.parseEntry = function(obj, itm) {
		for (var i in obj.childNodes) {
			if (obj.childNodes[i].prefix == jwplayer.utils.parsers.jwparser.PREFIX) {
				itm[obj.childNodes[i].localName] = jwplayer.utils.strings.serialize(obj.childNodes[i].textContent);
			}
			if (!itm['file'] && String(itm['link']).toLowerCase().indexOf('youtube') > -1) {
				itm['file'] = itm['link'];
			}
		}
		return itm;
	}
	
	/**
	 * Determine the provider of an item
	 * @param {Object} item
	 * @return {String} provider
	 */
	jwplayer.utils.parsers.jwparser.getProvider = function(item) {
		if (item['type']) {
			return item['type'];
		} else if (item['file'].indexOf('youtube.com/w') > -1 
					|| item['file'].indexOf('youtube.com/v') > -1
					|| item['file'].indexOf('youtu.be/') > -1 ) {
			return "youtube";
		} else if (item['streamer'] && item['streamer'].indexOf('rtmp') == 0) {
			return "rtmp";
		} else if (item['streamer'] && item['streamer'].indexOf('http') == 0) {
			return "http";
		} else {
			var ext = jwplayer.utils.strings.extension(item['file']);
			if (extensions.hasOwnProperty(ext)) {
				return extensions[ext];
			}
		}
		return "";
	}
	
})(jwplayer);
/**
 * Parse a MRSS group into a playlistitem (used in RSS and ATOM).
 *
 * author zach
 * version 5.7
 */
(function(jwplayer) {

	jwplayer.utils.parsers.mediaparser = function() {
	};
	
	/** Prefix for the JW Player namespace. **/
	jwplayer.utils.parsers.mediaparser.PREFIX = 'media';
	
	/**
	 * Parse a feeditem for Yahoo MediaRSS extensions.
	 * The 'content' and 'group' elements can nest other MediaRSS elements.
	 * @param	{XML}		obj		The entire MRSS XML object.
	 * @param	{Object}	itm		The playlistentry to amend the object to.
	 * @return	{Object}			The playlistentry, amended with the MRSS info.
	 * @see ATOMParser
	 * @see RSSParser
	 **/
	jwplayer.utils.parsers.mediaparser.parseGroup = function(obj, itm) {
		var ytp = false;
		
		for (var i in obj.childNodes) {
			if (obj.childNodes[i].prefix == jwplayer.utils.parsers.mediaparser.PREFIX) {
				if (!obj.childNodes[i].localName){
					continue;
				}
				switch (obj.childNodes[i].localName.toLowerCase()) {
					case 'content':
						if (!ytp) {
							itm['file'] = jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'url');
						}
						if (obj.childNodes[i].attributes.duration) {
							itm['duration'] = jwplayer.utils.strings.seconds(jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'duration'));
						}
						if (obj.childNodes[i].attributes.start) {
							itm['start'] = jwplayer.utils.strings.seconds(jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'start'));
						}
						if (obj.childNodes[i].childNodes && obj.childNodes[i].childNodes.length > 0) {
							itm = jwplayer.utils.parsers.mediaparser.parseGroup(obj.childNodes[i], itm);
						}
						if (obj.childNodes[i].attributes.width || obj.childNodes[i].attributes.bitrate) {
							if (!itm.levels) {
								itm.levels = [];
							}
							itm.levels.push({
								width: jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'width'),
								bitrate: jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'bitrate'),
								file: jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'url')
							});
						}
						break;
					case 'title':
						itm['title'] = obj.childNodes[i].textContent;
						break;
					case 'description':
						itm['description'] = obj.childNodes[i].textContent;
						break;
					case 'keywords':
						itm['tags'] = obj.childNodes[i].textContent;
						break;
					case 'thumbnail':
						itm['image'] = jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'url');
						break;
					case 'credit':
						itm['author'] = obj.childNodes[i].textContent;
						break;
					case 'player':
						var url = obj.childNodes[i].url;
						if (url.indexOf('youtube.com') >= 0 || url.indexOf('youtu.be') >= 0) {
							ytp = true;
							itm['file'] = jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'url');
						}
						break;
					case 'group':
						itm = jwplayer.utils.parsers.mediaparser.parseGroup(obj.childNodes[i], itm);
						break;
				}
			}
		}
		return itm;
	}
	
})(jwplayer);
/**
 * Parse an RSS feed and translate it to a playlist.
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	jwplayer.utils.parsers.rssparser = function() {
	};
	
	/**
	 * Parse an RSS playlist for feed items.
	 *
	 * @param {XML} dat
	 * @reuturn {Array} playlistarray
	 */
	jwplayer.utils.parsers.rssparser.parse = function(dat) {
		var arr = [];
		for (var i in dat.childNodes) {
			if (dat.childNodes[i].localName && dat.childNodes[i].localName.toLowerCase() == 'channel') {
				for (var j in dat.childNodes[i].childNodes) {
					if (dat.childNodes[i].childNodes[j].localName && dat.childNodes[i].childNodes[j].localName.toLowerCase() == 'item') {
						arr.push(_parseItem(dat.childNodes[i].childNodes[j]));
					}
				}
			}
		}
		return arr;
	};
	
	
	/** 
	 * Translate RSS item to playlist item.
	 *
	 * @param {XML} obj
	 * @return {PlaylistItem} PlaylistItem
	 */
	function _parseItem(obj) {
		var itm = {};
		for (var i in obj.childNodes) {
			if (!obj.childNodes[i].localName){
				continue;
			}
			switch (obj.childNodes[i].localName.toLowerCase()) {
				case 'enclosure':
					itm['file'] = jwplayer.utils.strings.xmlAttribute(obj.childNodes[i], 'url');
					break;
				case 'title':
					itm['title'] = obj.childNodes[i].textContent;
					break;
				case 'pubdate':
					itm['date'] = obj.childNodes[i].textContent;
					break;
				case 'description':
					itm['description'] = obj.childNodes[i].textContent;
					break;
				case 'link':
					itm['link'] = obj.childNodes[i].textContent;
					break;
				case 'category':
					if (itm['tags']) {
						itm['tags'] += obj.childNodes[i].textContent;
					} else {
						itm['tags'] = obj.childNodes[i].textContent;
					}
					break;
			}
		}
//		itm = jwplayer.utils.parsers.itunesparser.parseEntry(obj, itm);
		itm = jwplayer.utils.parsers.mediaparser.parseGroup(obj, itm);
		itm = jwplayer.utils.parsers.jwparser.parseEntry(obj, itm);

		return new jwplayer.html5.playlistitem(itm);
	}
	
	
})(jwplayer);
/**
 * Plugin package definition
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	var _plugins = {};		
	var _pluginLoaders = {};
	
	jwplayer.plugins = function() {
	}
	
	jwplayer.plugins.loadPlugins = function(id, config) {
		_pluginLoaders[id] = new jwplayer.plugins.pluginloader(new jwplayer.plugins.model(_plugins), config);
		return _pluginLoaders[id];
	}
	
	jwplayer.plugins.registerPlugin = function(id, arg1, arg2) {
		var pluginId = jwplayer.utils.getPluginName(id);
		if (_plugins[pluginId]) {
			_plugins[pluginId].registerPlugin(id, arg1, arg2);
		} else {
			jwplayer.utils.log("A plugin ("+id+") was registered with the player that was not loaded. Please check your configuration.");
			for (var pluginloader in _pluginLoaders){
				_pluginLoaders[pluginloader].pluginFailed();
			}
		}
	}
})(jwplayer);
/**
 * Model that manages all plugins
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {		
	jwplayer.plugins.model = function(plugins) {
		this.addPlugin = function(url) {
			var pluginName = jwplayer.utils.getPluginName(url);
			if (!plugins[pluginName]) {
				plugins[pluginName] = new jwplayer.plugins.plugin(url);
			}
			return plugins[pluginName];
		}
	}
})(jwplayer);
/**
 * Internal plugin model
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	jwplayer.plugins.pluginmodes = {
		FLASH: "FLASH",
		JAVASCRIPT: "JAVASCRIPT",
		HYBRID: "HYBRID"
	}
	
	jwplayer.plugins.plugin = function(url) {
		var _repo = "http://plugins.longtailvideo.com"
		var _status = jwplayer.utils.loaderstatus.NEW;
		var _flashPath;
		var _js;
		var _completeTimeout;
		
		var _eventDispatcher = new jwplayer.events.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		
		function getJSPath() {
			switch (jwplayer.utils.getPluginPathType(url)) {
				case jwplayer.utils.pluginPathType.ABSOLUTE:
					return url;
				case jwplayer.utils.pluginPathType.RELATIVE:
					return jwplayer.utils.getAbsolutePath(url, window.location.href);
				case jwplayer.utils.pluginPathType.CDN:
					var pluginName = jwplayer.utils.getPluginName(url);
					var pluginVersion = jwplayer.utils.getPluginVersion(url);
					return _repo + "/" + jwplayer.version.split(".")[0] + "/" + pluginName + "/" 
							+ pluginName + (pluginVersion !== "" ? ("-" + pluginVersion) : "") + ".js";
			}
		}
		
		function completeHandler(evt) {
			_completeTimeout = setTimeout(function(){
				_status = jwplayer.utils.loaderstatus.COMPLETE;
				_eventDispatcher.sendEvent(jwplayer.events.COMPLETE);		
			}, 1000);
		}
		
		function errorHandler(evt) {
			_status = jwplayer.utils.loaderstatus.ERROR;
			_eventDispatcher.sendEvent(jwplayer.events.ERROR);
		}
		
		this.load = function() {
			if (_status == jwplayer.utils.loaderstatus.NEW) {
				if (url.lastIndexOf(".swf") > 0) {
					_flashPath = url;
					_status = jwplayer.utils.loaderstatus.COMPLETE;
					_eventDispatcher.sendEvent(jwplayer.events.COMPLETE);
					return;
				}
				_status = jwplayer.utils.loaderstatus.LOADING;
				var _loader = new jwplayer.utils.scriptloader(getJSPath());
				// Complete doesn't matter - we're waiting for registerPlugin 
				_loader.addEventListener(jwplayer.events.COMPLETE, completeHandler);
				_loader.addEventListener(jwplayer.events.ERROR, errorHandler);
				_loader.load();
			}
		}
		
		this.registerPlugin = function(id, arg1, arg2) {
			if (_completeTimeout){
				clearTimeout(_completeTimeout);
				_completeTimeout = undefined;
			}
			if (arg1 && arg2) {
				_flashPath = arg2;
				_js = arg1;
			} else if (typeof arg1 == "string") {
				_flashPath = arg1;
			} else if (typeof arg1 == "function") {
				_js = arg1;
			} else if (!arg1 && !arg2) {
				_flashPath = id;
			}
			_status = jwplayer.utils.loaderstatus.COMPLETE;
			_eventDispatcher.sendEvent(jwplayer.events.COMPLETE);
		}
		
		this.getStatus = function() {
			return _status;
		}
		
		this.getPluginName = function() {
			return jwplayer.utils.getPluginName(url);
		}
		
		this.getFlashPath = function() {
			if (_flashPath) {
				switch (jwplayer.utils.getPluginPathType(_flashPath)) {
					case jwplayer.utils.pluginPathType.ABSOLUTE:
						return _flashPath;
					case jwplayer.utils.pluginPathType.RELATIVE:
						if (url.lastIndexOf(".swf") > 0) {
							return jwplayer.utils.getAbsolutePath(_flashPath, window.location.href);
						}
						return jwplayer.utils.getAbsolutePath(_flashPath, getJSPath());
					case jwplayer.utils.pluginPathType.CDN:
						if (_flashPath.indexOf("-") > -1){
							return _flashPath+"h";
						}
						return _flashPath+"-h";
				}
			}
			return null;
		}
		
		this.getJS = function() {
			return _js;
		}

		this.getPluginmode = function() {
			if (typeof _flashPath != "undefined"
			 && typeof _js != "undefined") {
			 	return jwplayer.plugins.pluginmodes.HYBRID;
			 } else if (typeof _flashPath != "undefined") {
			 	return jwplayer.plugins.pluginmodes.FLASH;
			 } else if (typeof _js != "undefined") {
			 	return jwplayer.plugins.pluginmodes.JAVASCRIPT;
			 }
		}
		
		this.getNewInstance = function(api, config, div) {
			return new _js(api, config, div);
		}
		
		this.getURL = function() {
			return url;
		}
	}
	
})(jwplayer);
/**
 * Loads plugins for a player
 * @author zach
 * @version 5.6
 */
(function(jwplayer) {

	jwplayer.plugins.pluginloader = function(model, config) {
		var _plugins = {};
		var _status = jwplayer.utils.loaderstatus.NEW;
		var _loading = false;
		var _iscomplete = false;
		var _eventDispatcher = new jwplayer.events.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		
		/*
		 * Plugins can be loaded by multiple players on the page, but all of them use
		 * the same plugin model singleton. This creates a race condition because
		 * multiple players are creating and triggering loads, which could complete
		 * at any time. We could have some really complicated logic that deals with
		 * this by checking the status when it's created and / or having the loader
		 * redispatch its current status on load(). Rather than do this, we just check
		 * for completion after all of the plugins have been created. If all plugins
		 * have been loaded by the time checkComplete is called, then the loader is
		 * done and we fire the complete event. If there are new loads, they will
		 * arrive later, retriggering the completeness check and triggering a complete
		 * to fire, if necessary.
		 */
		function _complete() {
			if (!_iscomplete) {
				_iscomplete = true;
				_status = jwplayer.utils.loaderstatus.COMPLETE;
				_eventDispatcher.sendEvent(jwplayer.events.COMPLETE);
			}
		}
		
		// This is not entirely efficient, but it's simple
		function _checkComplete() {
			if (!_iscomplete) {
				var incomplete = 0;
				for (plugin in _plugins) {
					var status = _plugins[plugin].getStatus(); 
					if (status == jwplayer.utils.loaderstatus.LOADING 
							|| status == jwplayer.utils.loaderstatus.NEW) {
						incomplete++;
					}
				}
				
				if (incomplete == 0) {
					_complete();
				}
			}
		}
		
		this.setupPlugins = function(api, config, resizer) {
			var flashPlugins = {
				length: 0,
				plugins: {}
			};
			var jsplugins = {
				length: 0,
				plugins: {}
			};
			for (var plugin in _plugins) {
				var pluginName = _plugins[plugin].getPluginName();
				if (_plugins[plugin].getFlashPath()) {
					flashPlugins.plugins[_plugins[plugin].getFlashPath()] = config.plugins[plugin];
					flashPlugins.plugins[_plugins[plugin].getFlashPath()].pluginmode = _plugins[plugin].getPluginmode();
					flashPlugins.length++;
				}
				if (_plugins[plugin].getJS()) {
					var div = document.createElement("div");
					div.id = api.id + "_" + pluginName;
					div.style.position = "absolute";
					div.style.zIndex = jsplugins.length + 10;
					jsplugins.plugins[pluginName] = _plugins[plugin].getNewInstance(api, config.plugins[plugin], div);
					jsplugins.length++;
					if (typeof jsplugins.plugins[pluginName].resize != "undefined") {
						api.onReady(resizer(jsplugins.plugins[pluginName], div, true));
						api.onResize(resizer(jsplugins.plugins[pluginName], div));
					}
				}
			}
			
			api.plugins = jsplugins.plugins;
			
			return flashPlugins;
		};
		
		this.load = function() {
			_status = jwplayer.utils.loaderstatus.LOADING;
			_loading = true;
			
			/** First pass to create the plugins and add listeners **/
			for (var plugin in config) {
				if (jwplayer.utils.exists(plugin)) {
					_plugins[plugin] = model.addPlugin(plugin);
					_plugins[plugin].addEventListener(jwplayer.events.COMPLETE, _checkComplete);
					_plugins[plugin].addEventListener(jwplayer.events.ERROR, _checkComplete);
				}
			}
			
			/** Second pass to actually load the plugins **/
			for (plugin in _plugins) {
				// Plugin object ensures that it's only loaded once
				_plugins[plugin].load();
			}
			
			_loading = false;
			
			// Make sure we're not hanging around waiting for plugins that already finished loading
			_checkComplete();
		}
		
		this.pluginFailed = function() {
			_complete();
		}
		
		this.getStatus = function() {
			return _status;
		}
		
	}
})(jwplayer);
/**
 * API for the JW Player
 * 
 * @author Pablo
 * @version 5.7
 */
(function(jwplayer) {
	var _players = [];
	
	jwplayer.api = function(container) {
		this.container = container;
		this.id = container.id;
		
		var _listeners = {};
		var _stateListeners = {};
		var _componentListeners = {};
		var _readyListeners = [];
		var _player = undefined;
		var _playerReady = false;
		var _queuedCalls = [];
		
		var _originalHTML = jwplayer.utils.getOuterHTML(container);
		
		var _itemMeta = {};
		var _callbacks = {};
		
		// Player Getters
		this.getBuffer = function() {
			return this.callInternal('jwGetBuffer');
		};
		this.getContainer = function() {
			return this.container;
		};
		
		function _setButton(ref, plugin) {
			return function(id, handler, outGraphic, overGraphic) {
				var handlerString;
				if (handler) {
					_callbacks[id] = handler;
					handlerString = "jwplayer('" + ref.id + "').callback('" + id + "')";
				} else if (!handler && _callbacks[id]) {
					delete _callbacks[id];
				}
				_player['jwDockSetButton'](id, handlerString, outGraphic, overGraphic);
				return plugin;
			};
		}
		
		this.getPlugin = function(pluginName) {
			var _this = this;
			var _plugin = {};
			if (pluginName == "dock") {
				return jwplayer.utils.extend(_plugin, {
					setButton: _setButton(_this, _plugin),
					show: function() { _this.callInternal('jwDockShow'); return _plugin; },
					hide: function() { _this.callInternal('jwDockHide'); return _plugin; },
					onShow: function(callback) { 
						_this.componentListener("dock", jwplayer.api.events.JWPLAYER_COMPONENT_SHOW, callback); 
						return _plugin; 
					},
					onHide: function(callback) { 
						_this.componentListener("dock", jwplayer.api.events.JWPLAYER_COMPONENT_HIDE, callback); 
						return _plugin; 
					}
				});
			} else if (pluginName == "controlbar") {
				return jwplayer.utils.extend(_plugin, {
					show: function() { _this.callInternal('jwControlbarShow'); return _plugin; },
					hide: function() { _this.callInternal('jwControlbarHide'); return _plugin; },
					onShow: function(callback) { 
						_this.componentListener("controlbar", jwplayer.api.events.JWPLAYER_COMPONENT_SHOW, callback); 
						return _plugin; 
					},
					onHide: function(callback) { 
						_this.componentListener("controlbar", jwplayer.api.events.JWPLAYER_COMPONENT_HIDE, callback); 
						return _plugin; 
					}
				});
			} else if (pluginName == "display") {
				return jwplayer.utils.extend(_plugin, {
					show: function() { _this.callInternal('jwDisplayShow'); return _plugin; },
					hide: function() { _this.callInternal('jwDisplayHide'); return _plugin; },
					onShow: function(callback) { 
						_this.componentListener("display", jwplayer.api.events.JWPLAYER_COMPONENT_SHOW, callback); 
						return _plugin; 
					},
					onHide: function(callback) { 
						_this.componentListener("display", jwplayer.api.events.JWPLAYER_COMPONENT_HIDE, callback); 
						return _plugin; 
					}
				});
			} else {
				return this.plugins[pluginName];
			}
		};
		
		this.callback = function(id) {
			if (_callbacks[id]) {
				return _callbacks[id]();
			}
		};
		this.getDuration = function() {
			return this.callInternal('jwGetDuration');
		};
		this.getFullscreen = function() {
			return this.callInternal('jwGetFullscreen');
		};
		this.getHeight = function() {
			return this.callInternal('jwGetHeight');
		};
		this.getLockState = function() {
			return this.callInternal('jwGetLockState');
		};
		this.getMeta = function() {
			return this.getItemMeta();
		};
		this.getMute = function() {
			return this.callInternal('jwGetMute');
		};
		this.getPlaylist = function() {
			var playlist = this.callInternal('jwGetPlaylist');
			if (this.renderingMode == "flash") {
				jwplayer.utils.deepReplaceKeyName(playlist, "__dot__", ".");	
			}
			for (var i = 0; i < playlist.length; i++) {
				if (!jwplayer.utils.exists(playlist[i].index)) {
					playlist[i].index = i;
				}
			}
			return playlist;
		};
		this.getPlaylistItem = function(item) {
			if (!jwplayer.utils.exists(item)) {
				item = this.getCurrentItem();
			}
			return this.getPlaylist()[item];
		};
		this.getPosition = function() {
			return this.callInternal('jwGetPosition');
		};
		this.getRenderingMode = function() {
			return this.renderingMode;
		};
		this.getState = function() {
			return this.callInternal('jwGetState');
		};
		this.getVolume = function() {
			return this.callInternal('jwGetVolume');
		};
		this.getWidth = function() {
			return this.callInternal('jwGetWidth');
		};
		// Player Public Methods
		this.setFullscreen = function(fullscreen) {
			if (!jwplayer.utils.exists(fullscreen)) {
				this.callInternal("jwSetFullscreen", !this.callInternal('jwGetFullscreen'));
			} else {
				this.callInternal("jwSetFullscreen", fullscreen);
			}
			return this;
		};
		this.setMute = function(mute) {
			if (!jwplayer.utils.exists(mute)) {
				this.callInternal("jwSetMute", !this.callInternal('jwGetMute'));
			} else {
				this.callInternal("jwSetMute", mute);
			}
			return this;
		};
		this.lock = function() {
			return this;
		};
		this.unlock = function() {
			return this;
		};
		this.load = function(toLoad) {
			this.callInternal("jwLoad", toLoad);
			return this;
		};
		this.playlistItem = function(item) {
			this.callInternal("jwPlaylistItem", item);
			return this;
		};
		this.playlistPrev = function() {
			this.callInternal("jwPlaylistPrev");
			return this;
		};
		this.playlistNext = function() {
			this.callInternal("jwPlaylistNext");
			return this;
		};
		this.resize = function(width, height) {
			if (this.renderingMode == "html5") {
				_player.jwResize(width, height);
			} else {
				this.container.width = width;
				this.container.height = height;
			}
			return this;
		};
		this.play = function(state) {
			if (typeof state == "undefined") {
				state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("jwPause");
				} else {
					this.callInternal("jwPlay");
				}
			} else {
				this.callInternal("jwPlay", state);
			}
			return this;
		};
		this.pause = function(state) {
			if (typeof state == "undefined") {
				state = this.getState();
				if (state == jwplayer.api.events.state.PLAYING || state == jwplayer.api.events.state.BUFFERING) {
					this.callInternal("jwPause");
				} else {
					this.callInternal("jwPlay");
				}
			} else {
				this.callInternal("jwPause", state);
			}
			return this;
		};
		this.stop = function() {
			this.callInternal("jwStop");
			return this;
		};
		this.seek = function(position) {
			this.callInternal("jwSeek", position);
			return this;
		};
		this.setVolume = function(volume) {
			this.callInternal("jwSetVolume", volume);
			return this;
		};
		// Player Events
		this.onBufferChange = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, callback);
		};
		this.onBufferFull = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, callback);
		};
		this.onError = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_ERROR, callback);
		};
		this.onFullscreen = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, callback);
		};
		this.onMeta = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, callback);
		};
		this.onMute = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, callback);
		};
		this.onPlaylist = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, callback);
		};
		this.onPlaylistItem = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, callback);
		};
		this.onReady = function(callback) {
			return this.eventListener(jwplayer.api.events.API_READY, callback);
		};
		this.onResize = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_RESIZE, callback);
		};
		this.onComplete = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, callback);
		};
		this.onSeek = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_SEEK, callback);
		};
		this.onTime = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, callback);
		};
		this.onVolume = function(callback) {
			return this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, callback);
		};
		// State events
		this.onBuffer = function(callback) {
			return this.stateListener(jwplayer.api.events.state.BUFFERING, callback);
		};
		this.onPause = function(callback) {
			return this.stateListener(jwplayer.api.events.state.PAUSED, callback);
		};
		this.onPlay = function(callback) {
			return this.stateListener(jwplayer.api.events.state.PLAYING, callback);
		};
		this.onIdle = function(callback) {
			return this.stateListener(jwplayer.api.events.state.IDLE, callback);
		};
		this.remove = function() {
			_listeners = {};
			_queuedCalls = [];
			if (jwplayer.utils.getOuterHTML(this.container) != _originalHTML) {
				jwplayer.api.destroyPlayer(this.id, _originalHTML);
			}
		};
		
		this.setup = function(options) {
			if (jwplayer.embed) {
				// Destroy original API on setup() to remove existing listeners
				var newId = this.id;
				this.remove();
				var newApi = jwplayer(newId);
				newApi.config = options;
				return new jwplayer.embed(newApi);
			}
			return this;
		};
		this.registerPlugin = function(id, arg1, arg2) {
			jwplayer.plugins.registerPlugin(id, arg1, arg2);
		};
		
		/** Use this function to set the internal low-level player.  This is a javascript object which contains the low-level API calls. **/
		this.setPlayer = function(player, renderingMode) {
			_player = player;
			this.renderingMode = renderingMode;
		};
		
		this.stateListener = function(state, callback) {
			if (!_stateListeners[state]) {
				_stateListeners[state] = [];
				this.eventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, stateCallback(state));
			}
			_stateListeners[state].push(callback);
			return this;
		};
		
		function stateCallback(state) {
			return function(args) {
				var newstate = args.newstate, oldstate = args.oldstate;
				if (newstate == state) {
					var callbacks = _stateListeners[newstate];
					if (callbacks) {
						for (var c = 0; c < callbacks.length; c++) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, {
									oldstate: oldstate,
									newstate: newstate
								});
							}
						}
					}
				}
			};
		}
		
		this.componentListener = function(component, type, callback) {
			if (!_componentListeners[component]) {
				_componentListeners[component] = {};
			}
			if (!_componentListeners[component][type]) {
				_componentListeners[component][type] = [];
				this.eventListener(type, _componentCallback(component, type));
			}
			_componentListeners[component][type].push(callback);
			return this;
		};
		
		function _componentCallback(component, type) {
			return function(event) {
				if (component == event.component) {
					var callbacks = _componentListeners[component][type];
					if (callbacks) {
						for (var c = 0; c < callbacks.length; c++) {
							if (typeof callbacks[c] == 'function') {
								callbacks[c].call(this, event);
							}
						}
					}
				}
			};
		}		
		
		this.addInternalListener = function(player, type) {
			player.jwAddEventListener(type, 'function(dat) { jwplayer("' + this.id + '").dispatchEvent("' + type + '", dat); }');
		};
		
		this.eventListener = function(type, callback) {
			if (!_listeners[type]) {
				_listeners[type] = [];
				if (_player && _playerReady) {
					this.addInternalListener(_player, type);
				}
			}
			_listeners[type].push(callback);
			return this;
		};
		
		this.dispatchEvent = function(type) {
			if (_listeners[type]) {
				var args = translateEventResponse(type, arguments[1]);
				for (var l = 0; l < _listeners[type].length; l++) {
					if (typeof _listeners[type][l] == 'function') {
						_listeners[type][l].call(this, args);
					}
				}
			}
		};
		
		function translateEventResponse(type, eventProperties) {
			var translated = jwplayer.utils.extend({}, eventProperties);
			if (type == jwplayer.api.events.JWPLAYER_FULLSCREEN && !translated.fullscreen) {
				translated.fullscreen = translated.message == "true" ? true : false;
				delete translated.message;
			} else if (typeof translated.data == "object") {
				// Takes ViewEvent "data" block and moves it up a level
				translated = jwplayer.utils.extend(translated, translated.data);
				delete translated.data;
			}
			
			var rounders = ["position", "duration", "offset"];
			for (var rounder in rounders) {
				if (translated[rounders[rounder]]) {
					translated[rounders[rounder]] = Math.round(translated[rounders[rounder]] * 1000) / 1000;
				}
			}
			
			return translated;
		}
		
		this.callInternal = function(funcName, args) {
			/*this.callInternal = function() {
			 var	funcName = arguments[0],
			 args = [];
			 for (var argument = 1; argument < arguments.length; argument++){
			 args[argument] = arguments[argument];
			 }*/
			if (_playerReady) {
				if (typeof _player != "undefined" && typeof _player[funcName] == "function") {
					if (jwplayer.utils.exists(args)) {
						//return (_player[funcName]).apply(this, args);
						return (_player[funcName])(args);
					} else {
						return (_player[funcName])();
					}
				}
				return null;
			} else {
				_queuedCalls.push({
					method: funcName,
					parameters: args
				});
			}
		};
		
		this.playerReady = function(obj) {
			_playerReady = true;
			if (!_player) {
				this.setPlayer(document.getElementById(obj.id));
			}
			this.container = document.getElementById(this.id);
			
			for (var eventType in _listeners) {
				this.addInternalListener(_player, eventType);
			}
			
			this.eventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, function(data) {
				_itemMeta = {};
			});
			
			this.eventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, function(data) {
				jwplayer.utils.extend(_itemMeta, data.metadata);
			});
			
			this.dispatchEvent(jwplayer.api.events.API_READY);
			
			while (_queuedCalls.length > 0) {
				var call = _queuedCalls.shift();
				this.callInternal(call.method, call.parameters);
			}
		};
		
		this.getItemMeta = function() {
			return _itemMeta;
		};
		
		this.getCurrentItem = function() {
			return this.callInternal('jwGetPlaylistIndex');
		};
		
		/** Using this function instead of array.slice since Arguments are not an array **/
		function slice(list, from, to) {
			var ret = [];
			if (!from) {
				from = 0;
			}
			if (!to) {
				to = list.length - 1;
			}
			for (var i = from; i <= to; i++) {
				ret.push(list[i]);
			}
			return ret;
		}
		return this;
	};
	
	jwplayer.api.selectPlayer = function(identifier) {
		var _container;
		
		if (!jwplayer.utils.exists(identifier)) {
			identifier = 0;
		}
		
		if (identifier.nodeType) {
			// Handle DOM Element
			_container = identifier;
		} else if (typeof identifier == 'string') {
			// Find container by ID
			_container = document.getElementById(identifier);
		}
		
		if (_container) {
			var foundPlayer = jwplayer.api.playerById(_container.id);
			if (foundPlayer) {
				return foundPlayer;
			} else {
				// Todo: register new object
				return jwplayer.api.addPlayer(new jwplayer.api(_container));
			}
		} else if (typeof identifier == 'number') {
			return jwplayer.getPlayers()[identifier];
		}
		
		return null;
	};
	
	jwplayer.api.events = {
		API_READY: 'jwplayerAPIReady',
		JWPLAYER_READY: 'jwplayerReady',
		JWPLAYER_FULLSCREEN: 'jwplayerFullscreen',
		JWPLAYER_RESIZE: 'jwplayerResize',
		JWPLAYER_ERROR: 'jwplayerError',
		JWPLAYER_COMPONENT_SHOW: 'jwplayerComponentShow',
		JWPLAYER_COMPONENT_HIDE: 'jwplayerComponentHide',
		JWPLAYER_MEDIA_BUFFER: 'jwplayerMediaBuffer',
		JWPLAYER_MEDIA_BUFFER_FULL: 'jwplayerMediaBufferFull',
		JWPLAYER_MEDIA_ERROR: 'jwplayerMediaError',
		JWPLAYER_MEDIA_LOADED: 'jwplayerMediaLoaded',
		JWPLAYER_MEDIA_COMPLETE: 'jwplayerMediaComplete',
		JWPLAYER_MEDIA_SEEK: 'jwplayerMediaSeek',
		JWPLAYER_MEDIA_TIME: 'jwplayerMediaTime',
		JWPLAYER_MEDIA_VOLUME: 'jwplayerMediaVolume',
		JWPLAYER_MEDIA_META: 'jwplayerMediaMeta',
		JWPLAYER_MEDIA_MUTE: 'jwplayerMediaMute',
		JWPLAYER_PLAYER_STATE: 'jwplayerPlayerState',
		JWPLAYER_PLAYLIST_LOADED: 'jwplayerPlaylistLoaded',
		JWPLAYER_PLAYLIST_ITEM: 'jwplayerPlaylistItem'
	};
	
	jwplayer.api.events.state = {
		BUFFERING: 'BUFFERING',
		IDLE: 'IDLE',
		PAUSED: 'PAUSED',
		PLAYING: 'PLAYING'
	};
	
	jwplayer.api.playerById = function(id) {
		for (var p = 0; p < _players.length; p++) {
			if (_players[p].id == id) {
				return _players[p];
			}
		}
		return null;
	};
	
	jwplayer.api.addPlayer = function(player) {
		for (var p = 0; p < _players.length; p++) {
			if (_players[p] == player) {
				return player; // Player is already in the list;
			}
		}
		
		_players.push(player);
		return player;
	};
	
	jwplayer.api.destroyPlayer = function(playerId, replacementHTML) {
		var index = -1;
		for (var p = 0; p < _players.length; p++) {
			if (_players[p].id == playerId) {
				index = p;
				continue;
			}
		}
		if (index >= 0) {
			var toDestroy = document.getElementById(_players[index].id);
			if (document.getElementById(_players[index].id + "_wrapper")) {
				toDestroy = document.getElementById(_players[index].id + "_wrapper");
			}
			if (toDestroy) {
				if (replacementHTML) {
					jwplayer.utils.setOuterHTML(toDestroy, replacementHTML);
				} else {
					var replacement = document.createElement('div');
					var newId = toDestroy.id;
					if (toDestroy.id.indexOf("_wrapper") == toDestroy.id.length - 8) {
						newID = toDestroy.id.substring(0, toDestroy.id.length - 8);
					}
					replacement.setAttribute('id', newId);
					toDestroy.parentNode.replaceChild(replacement, toDestroy);
				}
			}
			_players.splice(index, 1);
		}
		
		return null;
	};
	
	// Can't make this a read-only getter, thanks to IE incompatibility.
	jwplayer.getPlayers = function() {
		return _players.slice(0);
	};
	
})(jwplayer);

var _userPlayerReady = (typeof playerReady == 'function') ? playerReady : undefined;

playerReady = function(obj) {
	var api = jwplayer.api.playerById(obj.id);
	if (api) {
		api.playerReady(obj);
	} else {
		jwplayer.api.selectPlayer(obj.id).playerReady(obj);
	}
	
	if (_userPlayerReady) {
		_userPlayerReady.call(this, obj);
	}
};
/**
 * Embedder for the JW Player
 * @author Zach
 * @version 5.5
 */
(function(jwplayer) {
	jwplayer.embed = function(playerApi) {
		var _defaults = {
			width: 400,
			height: 300,
			components: {
				controlbar: {
					position: 'over'
				}
			}
		};
		var mediaConfig = jwplayer.utils.mediaparser.parseMedia(playerApi.container);
		var _config = new jwplayer.embed.config(jwplayer.utils.extend(_defaults, mediaConfig, playerApi.config), this);
		var _pluginloader = jwplayer.plugins.loadPlugins(playerApi.id, _config.plugins);
		
		function _setupEvents(api, events) {
			for (var evt in events) {
				if (typeof api[evt] == "function") {
					(api[evt]).call(api, events[evt]);
				}
			}
		}
		
		function _embedPlayer() {
			if (_pluginloader.getStatus() == jwplayer.utils.loaderstatus.COMPLETE) {
				for (var mode = 0; mode < _config.modes.length; mode++) {
					if (_config.modes[mode].type && jwplayer.embed[_config.modes[mode].type]) {
						var configClone = _config;
						if (_config.modes[mode].config) {
							configClone = jwplayer.utils.extend(jwplayer.utils.clone(_config), _config.modes[mode].config);
						}
						var embedder = new jwplayer.embed[_config.modes[mode].type](document.getElementById(playerApi.id), _config.modes[mode], configClone, _pluginloader, playerApi);
						if (embedder.supportsConfig()) {
							embedder.embed();
							
							_setupEvents(playerApi, _config.events);
							
							return playerApi;
						}
					}
				}
				jwplayer.utils.log("No suitable players found");
				new jwplayer.embed.logo(jwplayer.utils.extend({
					hide: true
				}, _config.components.logo), "none", playerApi.id);
			}
		};
		
		_pluginloader.addEventListener(jwplayer.events.COMPLETE, _embedPlayer);
		_pluginloader.addEventListener(jwplayer.events.ERROR, _embedPlayer);
		_pluginloader.load();
		
		return playerApi;
	};
	
	function noviceEmbed() {
		if (!document.body) {
			return setTimeout(noviceEmbed, 15);
		}
		var videoTags = jwplayer.utils.selectors.getElementsByTagAndClass('video', 'jwplayer');
		for (var i = 0; i < videoTags.length; i++) {
			var video = videoTags[i];
			jwplayer(video.id).setup({});
		}
	}
	
	noviceEmbed();
	
	
})(jwplayer);
/**
 * Configuration for the JW Player Embedder
 * @author Zach
 * @version 5.7
 */
(function(jwplayer) {
	function _playerDefaults() {
		return [{
			type: "flash",
			src: "/jwplayer/player.swf"
		}, {
			type: 'html5'
		}, {
			type: 'download'
		}];
	}
	
	var _aliases = {
		'players': 'modes',
		'autoplay': 'autostart'
	};
	
	function _isPosition(string) {
		var lower = string.toLowerCase();
		var positions = ["left", "right", "top", "bottom"];
		
		for (var position = 0; position < positions.length; position++) {
			if (lower == positions[position]) {
				return true;
			}
		}
		
		return false;
	}
	
	function _isPlaylist(property) {
		var result = false;
		// XML Playlists
		// (typeof property == "string" && !_isPosition(property)) ||
		// JSON Playlist
		result = (property instanceof Array) ||
		// Single playlist item as an Object
		(typeof property == "object" && !property.position && !property.size);
		return result;
	}
	
	function getSize(size) {
		if (typeof size == "string") {
			if (parseInt(size).toString() == size || size.toLowerCase().indexOf("px") > -1) {
				return parseInt(size);
			} 
		}
		return size;
	}
	
	var components = ["playlist", "dock", "controlbar", "logo", "display"];
	
	function getPluginNames(config) {
		var pluginNames = {};
		switch(jwplayer.utils.typeOf(config.plugins)){
			case "object":
				for (var plugin in config.plugins) {
					pluginNames[jwplayer.utils.getPluginName(plugin)] = plugin;
				}
				break;
			case "string":
				var pluginArray = config.plugins.split(",");
				for (var i=0; i < pluginArray.length; i++) {
					pluginNames[jwplayer.utils.getPluginName(pluginArray[i])] = pluginArray[i];	
				}
				break;
		}
		return pluginNames;
	}
	
	function addConfigParameter(config, componentType, componentName, componentParameter){
		if (jwplayer.utils.typeOf(config[componentType]) != "object"){
			config[componentType] = {};
		}
		var componentConfig = config[componentType][componentName];

		if (jwplayer.utils.typeOf(componentConfig) != "object") {
			config[componentType][componentName] = componentConfig = {};
		}

		if (componentParameter) {
			if (componentType == "plugins") {
				var pluginName = jwplayer.utils.getPluginName(componentName);
				componentConfig[componentParameter] = config[pluginName+"."+componentParameter];
				delete config[pluginName+"."+componentParameter];
			} else {
				componentConfig[componentParameter] = config[componentName+"."+componentParameter];
				delete config[componentName+"."+componentParameter];
			}
		}
	}
	
	jwplayer.embed.deserialize = function(config){
		var pluginNames = getPluginNames(config);
		
		for (var pluginId in pluginNames) {
			addConfigParameter(config, "plugins", pluginNames[pluginId]);
		}
		
		for (var parameter in config) {
			if (parameter.indexOf(".") > -1) {
				var path = parameter.split(".");
				var prefix = path[0];
				var parameter = path[1];

				if (jwplayer.utils.isInArray(components, prefix)) {
					addConfigParameter(config, "components", prefix, parameter);
				} else if (pluginNames[prefix]) {
					addConfigParameter(config, "plugins", pluginNames[prefix], parameter);
				}
			}
		}
		return config;
	}
	
	jwplayer.embed.config = function(config, embedder) {
		var parsedConfig = jwplayer.utils.extend({}, config);
		
		var _tempPlaylist;
		
		if (_isPlaylist(parsedConfig.playlist)){
			_tempPlaylist = parsedConfig.playlist;
			delete parsedConfig.playlist;
		}
		
		parsedConfig = jwplayer.embed.deserialize(parsedConfig);
		
		parsedConfig.height = getSize(parsedConfig.height);
		parsedConfig.width = getSize(parsedConfig.width);
		
		if (typeof parsedConfig.plugins == "string") {
			var pluginArray = parsedConfig.plugins.split(",");
			if (typeof parsedConfig.plugins != "object") {
				parsedConfig.plugins = {};
			}
			for (var plugin = 0; plugin < pluginArray.length; plugin++) {
				var pluginName = jwplayer.utils.getPluginName(pluginArray[plugin]);
				if (typeof parsedConfig[pluginName] == "object") {
					parsedConfig.plugins[pluginArray[plugin]] = parsedConfig[pluginName];
					delete parsedConfig[pluginName];
				} else {
					parsedConfig.plugins[pluginArray[plugin]] = {};
				}
			}
		}
						
		for (var component = 0; component < components.length; component++) {
			var comp = components[component];
			if (jwplayer.utils.exists(parsedConfig[comp])) {
				if (typeof parsedConfig[comp] != "object") {
					if (!parsedConfig.components[comp]) {
						parsedConfig.components[comp] = {};
					}
					if (comp == "logo") {
						parsedConfig.components[comp].file = parsedConfig[comp];
					} else {
						parsedConfig.components[comp].position = parsedConfig[comp];
					}
					delete parsedConfig[comp];
				} else {
					if (!parsedConfig.components[comp]) {
						parsedConfig.components[comp] = {};
					}
					jwplayer.utils.extend(parsedConfig.components[comp], parsedConfig[comp]);
					delete parsedConfig[comp];
				}
			} 
 
			if (typeof parsedConfig[comp+"size"] != "undefined") {
				if (!parsedConfig.components[comp]) {
					parsedConfig.components[comp] = {};
				}
				parsedConfig.components[comp].size = parsedConfig[comp+"size"];
				delete parsedConfig[comp+"size"];
			}
		}
		
		// Special handler for the display icons setting
		if (typeof parsedConfig.icons != "undefined"){
			if (!parsedConfig.components.display) {
					parsedConfig.components.display = {};
				}
			parsedConfig.components.display.icons = parsedConfig.icons;
			delete parsedConfig.icons;
		}
		
		for (var alias in _aliases)
		if (parsedConfig[alias]) {
			if (!parsedConfig[_aliases[alias]]) {
				parsedConfig[_aliases[alias]] = parsedConfig[alias];
			}
			delete parsedConfig[alias];
		}
		
		var _modes;
		if (parsedConfig.flashplayer && !parsedConfig.modes) {
			_modes = _playerDefaults();
			_modes[0].src = parsedConfig.flashplayer;
			delete parsedConfig.flashplayer;
		} else if (parsedConfig.modes) {
			if (typeof parsedConfig.modes == "string") {
				_modes = _playerDefaults();
				_modes[0].src = parsedConfig.modes;
			} else if (parsedConfig.modes instanceof Array) {
				_modes = parsedConfig.modes;
			} else if (typeof parsedConfig.modes == "object" && parsedConfig.modes.type) {
				_modes = [parsedConfig.modes];
			}
			delete parsedConfig.modes;
		} else {
			_modes = _playerDefaults();
		}
		parsedConfig.modes = _modes;
		
		if (_tempPlaylist) {
			parsedConfig.playlist = _tempPlaylist;
		}
		
		return parsedConfig;
	};
	
})(jwplayer);
/**
 * Download mode embedder for the JW Player
 * @author Zach
 * @version 5.5
 */
(function(jwplayer) {

	jwplayer.embed.download = function(_container, _player, _options, _loader, _api) {
		this.embed = function() {
			var params = jwplayer.utils.extend({}, _options);
			
			var _display = {};
			var _width = _options.width ? _options.width : 480;
			if (typeof _width != "number") {
				_width = parseInt(_width, 10);
			}
			var _height = _options.height ? _options.height : 320;
			if (typeof _height != "number") {
				_height = parseInt(_height, 10);
			}
			var _file, _image, _cursor;
			
			var item = {};
			if (_options.playlist && _options.playlist.length) {
				item.file = _options.playlist[0].file;
				_image = _options.playlist[0].image;
				item.levels = _options.playlist[0].levels;
			} else {
				item.file = _options.file;
				_image = _options.image;
				item.levels = _options.levels;
			}
			
			if (item.file) {
				_file = item.file;
			} else if (item.levels && item.levels.length) {
				_file = item.levels[0].file;
			}
			
			_cursor = _file ? "pointer" : "auto";
			
			var _elements = {
				display: {
					style: {
						cursor: _cursor,
						width: _width,
						height: _height,
						backgroundColor: "#000",
						position: "relative",
						textDecoration: "none",
						border: "none",
						display: "block"
					}
				},
				display_icon: {
					style: {
						cursor: _cursor,
						position: "absolute",
						display: _file ? "block" : "none",
						top: 0,
						left: 0,
						border: 0,
						margin: 0,
						padding: 0,
						zIndex: 3,
						width: 50,
						height: 50,
						backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg==)"
					}
				},
				display_iconBackground: {
					style: {
						cursor: _cursor,
						position: "absolute",
						display: _file ? "block" : "none",
						top: ((_height - 50) / 2),
						left: ((_width - 50) / 2),
						border: 0,
						width: 50,
						height: 50,
						margin: 0,
						padding: 0,
						zIndex: 2,
						backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC)"
					}
				},
				display_image: {
					style: {
						width: _width,
						height: _height,
						display: _image ? "block" : "none",
						position: "absolute",
						cursor: _cursor,
						left: 0,
						top: 0,
						margin: 0,
						padding: 0,
						textDecoration: "none",
						zIndex: 1,
						border: "none"
					}
				}
			};
			
			var createElement = function(tag, element, id) {
				var _element = document.createElement(tag);
				if (id) {
					_element.id = id;
				} else {
					_element.id = _container.id + "_jwplayer_" + element;
				}
				jwplayer.utils.css(_element, _elements[element].style);
				return _element;
			};
			
			_display.display = createElement("a", "display", _container.id);
			if (_file) {
				_display.display.setAttribute("href", jwplayer.utils.getAbsolutePath(_file));
			}
			_display.display_image = createElement("img", "display_image");
			_display.display_image.setAttribute("alt", "Click to download...");
			if (_image) {
				_display.display_image.setAttribute("src", jwplayer.utils.getAbsolutePath(_image));
			}
			//TODO: Add test to see if browser supports base64 images?
			if (true) {
				_display.display_icon = createElement("div", "display_icon");
				_display.display_iconBackground = createElement("div", "display_iconBackground");
				_display.display.appendChild(_display.display_image);
				_display.display_iconBackground.appendChild(_display.display_icon);
				_display.display.appendChild(_display.display_iconBackground);
			}
			_css = jwplayer.utils.css;
			
			_hide = function(element) {
				_css(element, {
					display: "none"
				});
			};
			
			function _onImageLoad(evt) {
				_imageWidth = _display.display_image.naturalWidth;
				_imageHeight = _display.display_image.naturalHeight;
				_stretch();
			}
			
			function _stretch() {
				jwplayer.utils.stretch(jwplayer.utils.stretching.UNIFORM, _display.display_image, _width, _height, _imageWidth, _imageHeight);
			};
			
			_display.display_image.onerror = function(evt) {
				_hide(_display.display_image);
			};
			_display.display_image.onload = _onImageLoad;
			
			_container.parentNode.replaceChild(_display.display, _container);
			
			var logoConfig = (_options.plugins && _options.plugins.logo) ? _options.plugins.logo : {};
			
			_display.display.appendChild(new jwplayer.embed.logo(_options.components.logo, "download", _container.id));
			
			_api.container = document.getElementById(_api.id);
			_api.setPlayer(_display.display, "download");
		};
		
		
		
		this.supportsConfig = function() {
			if (_options) {
				var item = jwplayer.utils.getFirstPlaylistItemFromConfig(_options);
				
				if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
					return true;
				} else if (item.file) {
					return canDownload(item.file, item.provider, item.playlistfile);
				} else if (item.levels && item.levels.length) {
					for (var i = 0; i < item.levels.length; i++) {
						if (item.levels[i].file && canDownload(item.levels[i].file, item.provider, item.playlistfile)) {
							return true;
						}
					}
				}
			} else {
				return true;
			}
		};
		
		/**
		 *
		 * @param {Object} file
		 * @param {Object} provider
		 * @param {Object} playlistfile
		 */
		function canDownload(file, provider, playlistfile) {
			// Don't support playlists
			if (playlistfile) {
				return false;
			}
			
			var providers = ["image", "sound", "youtube", "http"];
			// If the media provider is supported, return true
			if (provider && (providers.toString().indexOf(provider) > -1)) {
				return true;
			}
			
			// If a provider is set, only proceed if video
			if (!provider || (provider && provider == "video")) {
				var extension = jwplayer.utils.extension(file);
				
				// Only download if it's in the extension map or YouTube
				if (extension && jwplayer.utils.extensionmap[extension]) {
					return true;
				}
			}
			
			return false;
		};
	};
	
})(jwplayer);
/**
 * Flash mode embedder the JW Player
 * @author Zach
 * @version 5.5
 */
(function(jwplayer) {

	jwplayer.embed.flash = function(_container, _player, _options, _loader, _api) {
		function appendAttribute(object, name, value) {
			var param = document.createElement('param');
			param.setAttribute('name', name);
			param.setAttribute('value', value);
			object.appendChild(param);
		};
		
		function _resizePlugin(plugin, div, onready) {
			return function(evt) {
				if (onready) {
					document.getElementById(_api.id+"_wrapper").appendChild(div);
				}
				var display = document.getElementById(_api.id).getPluginConfig("display");
				plugin.resize(display.width, display.height);
				var style = {
					left: display.x,
					top: display.y
				}
				jwplayer.utils.css(div, style);
			}
		}
		
		
		function parseComponents(componentBlock) {
			if (!componentBlock) {
				return {};
			}
			
			var flat = {};
			
			for (var component in componentBlock) {
				var componentConfig = componentBlock[component];
				for (var param in componentConfig) {
					flat[component + '.' + param] = componentConfig[param];
				}
			}
			
			return flat;
		};
		
		function parseConfigBlock(options, blockName) {
			if (options[blockName]) {
				var components = options[blockName];
				for (var name in components) {
					var component = components[name];
					if (typeof component == "string") {
						// i.e. controlbar="over"
						if (!options[name]) {
							options[name] = component;
						}
					} else {
						// i.e. controlbar.position="over"
						for (var option in component) {
							if (!options[name + '.' + option]) {
								options[name + '.' + option] = component[option];
							}
						}
					}
				}
				delete options[blockName];
			}
		};
		
		function parsePlugins(pluginBlock) {
			if (!pluginBlock) {
				return {};
			}
			
			var flat = {}, pluginKeys = [];
			
			for (var plugin in pluginBlock) {
				var pluginName = jwplayer.utils.getPluginName(plugin);
				var pluginConfig = pluginBlock[plugin];
				pluginKeys.push(plugin);
				for (var param in pluginConfig) {
					flat[pluginName + '.' + param] = pluginConfig[param];
				}
			}
			flat.plugins = pluginKeys.join(',');
			return flat;
		};
		
		function jsonToFlashvars(json) {
			var flashvars = json.netstreambasepath ? '' : 'netstreambasepath=' + encodeURIComponent(window.location.href.split("#")[0]) + '&';
			for (var key in json) {
				if (typeof(json[key]) == "object") {
					flashvars += key + '=' + encodeURIComponent("[[JSON]]"+jwplayer.utils.strings.jsonToString(json[key])) + '&';
				} else {
					flashvars += key + '=' + encodeURIComponent(json[key]) + '&';
				}
			}
			return flashvars.substring(0, flashvars.length - 1);
		};
		
		this.embed = function() {		
			// Make sure we're passing the correct ID into Flash for Linux API support
			_options.id = _api.id;
			
			var _wrapper;
			
			var params = jwplayer.utils.extend({}, _options);
			
			var width = params.width;	
			var height = params.height;
			
			// Hack for when adding / removing happens too quickly
			if (_container.id + "_wrapper" == _container.parentNode.id) {
				_wrapper = document.getElementById(_container.id + "_wrapper");
			} else {
				_wrapper = document.createElement("div");
				_wrapper.id = _container.id + "_wrapper";
				jwplayer.utils.wrap(_container, _wrapper);
				jwplayer.utils.css(_wrapper, {
					position: "relative",
					width: width,
					height: height
				});
			}
			
			
			var flashPlugins = _loader.setupPlugins(_api, params, _resizePlugin);
			
			if (flashPlugins.length > 0) {
				jwplayer.utils.extend(params, parsePlugins(flashPlugins.plugins));
			} else {
				delete params.plugins;
			}
			
			
			var toDelete = ["height", "width", "modes", "events"];
				
			for (var i = 0; i < toDelete.length; i++) {
				delete params[toDelete[i]];
			}
			
			var wmode = "opaque";
			if (params.wmode) {
				wmode = params.wmode;
			}
			
			parseConfigBlock(params, 'components');
			parseConfigBlock(params, 'providers');
			
			// Hack for the dock
			if (typeof params["dock.position"] != "undefined"){
				if (params["dock.position"].toString().toLowerCase() == "false") {
					params["dock"] = params["dock.position"];
					delete params["dock.position"];					
				}
			}
			
			var bgcolor = "#000000";
			
			var flashPlayer;
			if (jwplayer.utils.isIE()) {
				var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' +
				'bgcolor="' +
				bgcolor +
				'" width="100%" height="100%" ' +
				'id="' +
				_container.id +
				'" name="' +
				_container.id +
				'" tabindex=0"' +
				'">';
				html += '<param name="movie" value="' + _player.src + '">';
				html += '<param name="allowfullscreen" value="true">';
				html += '<param name="allowscriptaccess" value="always">';
				html += '<param name="seamlesstabbing" value="true">';
				html += '<param name="wmode" value="' + wmode + '">';
				html += '<param name="flashvars" value="' +
				jsonToFlashvars(params) +
				'">';
				html += '</object>';

				jwplayer.utils.setOuterHTML(_container, html);
								
				flashPlayer = document.getElementById(_container.id);
			} else {
				var obj = document.createElement('object');
				obj.setAttribute('type', 'application/x-shockwave-flash');
				obj.setAttribute('data', _player.src);
				obj.setAttribute('width', "100%");
				obj.setAttribute('height', "100%");
				obj.setAttribute('bgcolor', '#000000');
				obj.setAttribute('id', _container.id);
				obj.setAttribute('name', _container.id);
				obj.setAttribute('tabindex', 0);
				appendAttribute(obj, 'allowfullscreen', 'true');
				appendAttribute(obj, 'allowscriptaccess', 'always');
				appendAttribute(obj, 'seamlesstabbing', 'true');
				appendAttribute(obj, 'wmode', wmode);
				appendAttribute(obj, 'flashvars', jsonToFlashvars(params));
				_container.parentNode.replaceChild(obj, _container);
				flashPlayer = obj;
			}
			
			_api.container = flashPlayer;
			_api.setPlayer(flashPlayer, "flash");
		}
		/**
		 * Detects whether Flash supports this configuration
		 */
		this.supportsConfig = function() {
			if (jwplayer.utils.hasFlash()) {
				if (_options) {
					var item = jwplayer.utils.getFirstPlaylistItemFromConfig(_options);
					if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
						return true;
					} else if (item.file) {
						return flashCanPlay(item.file, item.provider);
					} else if (item.levels && item.levels.length) {
						for (var i = 0; i < item.levels.length; i++) {
							if (item.levels[i].file && flashCanPlay(item.levels[i].file, item.provider)) {
								return true;
							}
						}
					}
				} else {
					return true;
				}
			}
			return false;
		}
		
		/**
		 * Determines if a Flash can play a particular file, based on its extension
		 */
		flashCanPlay = function(file, provider) {
			var providers = ["video", "http", "sound", "image"];
			// Provider is set, and is not video, http, sound, image - play in Flash
			if (provider && (providers.toString().indexOf(provider < 0))) {
				return true;
			}
			var extension = jwplayer.utils.extension(file);
			// If there is no extension, use Flash
			if (!extension) {
				return true;
			}
			// Extension is in the extension map, but not supported by Flash - fail
			if (jwplayer.utils.exists(jwplayer.utils.extensionmap[extension]) &&
					!jwplayer.utils.exists(jwplayer.utils.extensionmap[extension].flash)) {
				return false;
			}
			return true;
		};
	};
	
})(jwplayer);
/**
 * HTML5 mode embedder for the JW Player
 * @author Zach
 * @version 5.5
 */
(function(jwplayer) {

	jwplayer.embed.html5 = function(_container, _player, _options, _loader, _api) {
		function _resizePlugin (plugin, div, onready) {
			return function(evt) {
				var displayarea = document.getElementById(_container.id + "_displayarea");
				if (onready) {
					displayarea.appendChild(div);
				}
				var display = displayarea.style;
				plugin.resize(parseInt(display.width.replace("px","")), parseInt(display.height.replace("px","")));
				div.left = display.left;
				div.top = display.top;
			}
		}
		
		this.embed = function() {
			if (jwplayer.html5) {
				_loader.setupPlugins(_api, _options, _resizePlugin);
				_container.innerHTML = "";
				var playerOptions = jwplayer.utils.extend({
					screencolor: '0x000000'
				}, _options);

				var toDelete = ["plugins", "modes", "events"];
				
				for (var i = 0; i < toDelete.length; i++){
					delete playerOptions[toDelete[i]];
				}
				// TODO: remove this requirement from the html5 _player (sources instead of levels)
				if (playerOptions.levels && !playerOptions.sources) {
					playerOptions.sources = _options.levels;
				}
				if (playerOptions.skin && playerOptions.skin.toLowerCase().indexOf(".zip") > 0) {
					playerOptions.skin = playerOptions.skin.replace(/\.zip/i, ".xml");
				}
				var html5player = new (jwplayer.html5(_container)).setup(playerOptions);
				_api.container = document.getElementById(_api.id);
				_api.setPlayer(html5player, "html5");
			} else {
				return null;
			}
		}
		
		/**
		 * Detects whether the html5 player supports this configuration.
		 *
		 * @return {Boolean}
		 */
		this.supportsConfig = function() {
			var vid = document.createElement('video');
			if (!!vid.canPlayType) {
				if (_options) {
					var item = jwplayer.utils.getFirstPlaylistItemFromConfig(_options);
					if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
						return true;
					} else if (item.file) {
						return html5CanPlay(vid, item.file, item.provider, item.playlistfile);
					} else if (item.levels && item.levels.length) {
						for (var i = 0; i < item.levels.length; i++) {
							if (item.levels[i].file && html5CanPlay(vid, item.levels[i].file, item.provider, item.playlistfile)) {
								return true;
							}
						}
					}
				} else {
					return true;
				}
			}
			
			return false;
		}
		
		/**
		 * Determines if a video element can play a particular file, based on its extension
		 * @param {Object} video
		 * @param {Object} file
		 * @param {Object} provider
		 * @param {Object} playlistfile
		 * @return {Boolean}
		 */
		html5CanPlay = function(video, file, provider, playlistfile) {
			// Don't support playlists
			if (playlistfile) {
				return false;
			}
			
			// YouTube is supported
			if (provider && provider == "youtube") {
				return true;
			}
			
			// If a provider is set, only proceed if video or HTTP or sound
			if (provider && provider != "video" && provider != "http" && provider != "sound") {
				return false;
			}
			
			var extension = jwplayer.utils.extension(file);
			// If no extension or unrecognized extension, allow to play
			if (!jwplayer.utils.exists(extension) || !jwplayer.utils.exists(jwplayer.utils.extensionmap[extension])){
				return true;
			}
			
			// If extension is defined but not supported by HTML5, don't play 
			if (!jwplayer.utils.exists(jwplayer.utils.extensionmap[extension].html5)) {
				return false;
			}
						
			// Check for Android, which returns false for canPlayType
			if (jwplayer.utils.isLegacyAndroid() && extension.match(/m4v|mp4/)) {
				return true;
			}
			
			// Last, but not least, we ask the browser 
			// (But only if it's a video with an extension known to work in HTML5)
			return browserCanPlay(video, jwplayer.utils.extensionmap[extension].html5);
		};
		
		/**
		 * 
		 * @param {DOMMediaElement} video
		 * @param {String} mimetype
		 * @return {Boolean}
		 */
		browserCanPlay = function(video, mimetype) {
			// OK to use HTML5 with no extension
			if (!mimetype) {
				return true;
			}
			
			if (video.canPlayType(mimetype)) {
				return true;
			} else if (mimetype == "audio/mp3" && navigator.userAgent.match(/safari/i)) {
				// Work around Mac Safari bug
				return video.canPlayType("audio/mpeg");
			} else {
				return false;
			}
			
		}
	};
	
})(jwplayer);
/**
 * Logo for the JW Player embedder
 * @author Zach
 * @version 5.5
 */
(function(jwplayer) {

	jwplayer.embed.logo = function(logoConfig, mode, id) {
		var _defaults = {
			prefix: 'http://l.longtailvideo.com/'+mode+'/',
			file: "logo.png",
			link: "http://www.longtailvideo.com/players/jw-flv-player/",
			margin: 8,
			out: 0.5,
			over: 1,
			timeout: 5,
			hide: false,
			position: "bottom-left"
		};
		
		_css = jwplayer.utils.css;
		
		var _logo;
		var _settings;
		
		_setup();
		
		function _setup() {
			_setupConfig();
			_setupDisplayElements();
			_setupMouseEvents();
		}
		
		function _setupConfig() {
			if (_defaults.prefix) {
				var version = jwplayer.version.split(/\W/).splice(0, 2).join("/");
				if (_defaults.prefix.indexOf(version) < 0) {
					_defaults.prefix += version + "/";
				}
			}
			
			_settings = jwplayer.utils.extend({}, _defaults, logoConfig);
		}
		
		function _getStyle() {
			var _imageStyle = {
				border: "none",
				textDecoration: "none",
				position: "absolute",
				cursor: "pointer",
				zIndex: 10				
			};
			_imageStyle.display = _settings.hide ? "none" : "block";
			var positions = _settings.position.toLowerCase().split("-");
			for (var position in positions) {
				_imageStyle[positions[position]] = _settings.margin;
			}
			return _imageStyle;
		}
		
		function _setupDisplayElements() {
			_logo = document.createElement("img");
			_logo.id = id + "_jwplayer_logo";
			_logo.style.display = "none";
			
			_logo.onload = function(evt) {
				_css(_logo, _getStyle());
				_outHandler();
			};
			
			if (!_settings.file) {
				return;
			}
			
			if (_settings.file.indexOf("http://") === 0) {
				_logo.src = _settings.file;
			} else {
				_logo.src = _settings.prefix + _settings.file;
			}
		}
		
		if (!_settings.file) {
			return;
		}
		
		
		function _setupMouseEvents() {
			if (_settings.link) {
				_logo.onmouseover = _overHandler;
				_logo.onmouseout = _outHandler;
				_logo.onclick = _clickHandler;
			} else {
				this.mouseEnabled = false;
			}
		}
		
		
		function _clickHandler(evt) {
			if (typeof evt != "undefined") {
				evt.preventDefault();
				evt.stopPropagation();
			}
			if (_settings.link) {
				window.open(_settings.link, "_self");
			}
			return;
		}
		
		function _outHandler(evt) {
			if (_settings.link) {
				_logo.style.opacity = _settings.out;
			}
			return;
		}
		
		function _overHandler(evt) {
			if (_settings.hide) {
				_logo.style.opacity = _settings.over;
			}
			return;
		}
		
		return _logo;	
	};
	
})(jwplayer);
/**
 * Core component of the JW Player (initialization, API).
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.html5 = function(container) {
		var _container = container;
		
		this.setup = function(options) {
			jwplayer.utils.extend(this, new jwplayer.html5.api(_container, options));
			return this;
		};
		
		return this;
	};
})(jwplayer);

/**
 * JW Player view component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	var _utils = jwplayer.utils;
	var _css = _utils.css;
	
	jwplayer.html5.view = function(api, container, model) {
		var _api = api;
		var _container = container;
		var _model = model;
		var _wrapper;
		var _width;
		var _height;
		var _box;
		var _zIndex;
		var _resizeInterval;
		var _media;
		
		function createWrapper() {
			_wrapper = document.createElement("div");
			_wrapper.id = _container.id;
			_wrapper.className = _container.className;
			_videowrapper = document.createElement("div");
			_videowrapper.id = _wrapper.id + "_video_wrapper";
			_container.id = _wrapper.id + "_video";
			
			_css(_wrapper, {
				position: "relative",
				height: _model.height,
				width: _model.width,
				padding: 0,
				backgroundColor: getBackgroundColor(),
				zIndex: 0
			});
			
			function getBackgroundColor() {
				if (_api.skin.getComponentSettings("display") && _api.skin.getComponentSettings("display").backgroundcolor) {
					return _api.skin.getComponentSettings("display").backgroundcolor;
				}
				return parseInt("000000", 16);
			}
			
			_css(_container, {
				width: _model.width,
				height: _model.height,
				top: 0,
				left: 0,
				zIndex: 1,
				margin: "auto",
				display: "block"
			});
			
			_css(_videowrapper, {
				overflow: "hidden",
				position: "absolute",
				top: 0,
				left: 0,
				bottom: 0,
				right: 0
			});
			
			_utils.wrap(_container, _wrapper);
			_utils.wrap(_container, _videowrapper);
			
			_box = document.createElement("div");
			_box.id = _wrapper.id + "_displayarea";
			_wrapper.appendChild(_box);
		}
		
		function layoutComponents() {
			for (var pluginIndex = 0; pluginIndex < _model.plugins.order.length; pluginIndex++) {
				var pluginName = _model.plugins.order[pluginIndex];
				if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
					_model.plugins.object[pluginName].height = _utils.parseDimension(_model.plugins.object[pluginName].getDisplayElement().style.height);
					_model.plugins.object[pluginName].width = _utils.parseDimension(_model.plugins.object[pluginName].getDisplayElement().style.width);
					_model.plugins.config[pluginName].currentPosition = _model.plugins.config[pluginName].position;
				}
			}
			_loadedHandler();
		}
		
		function _stateHandler(evt) {
			_css(_box, {
				display: _model.getMedia().hasChrome() ? "none" : "block"
			});
		}

		function _loadedHandler(evt) {
			var newMedia = _model.getMedia() ? _model.getMedia().getDisplayElement() : null;
			
			if (_utils.exists(newMedia)) {
				if (_media != newMedia) {
					if (_media && _media.parentNode) {
						_media.parentNode.replaceChild(newMedia, _media);
					}
					_media = newMedia;
				}
				for (var pluginIndex = 0; pluginIndex < _model.plugins.order.length; pluginIndex++) {
					var pluginName = _model.plugins.order[pluginIndex];
					if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
						if (_model.getMedia().hasChrome()) {
							_model.plugins.config[pluginName].currentPosition = jwplayer.html5.view.positions.NONE;
						} else {
							_model.plugins.config[pluginName].currentPosition = _model.plugins.config[pluginName].position;
						}
					}
				}
			}
			_resize(_model.width, _model.height);
		}
		
		this.setup = function() {
			if (_model && _model.getMedia()) {
				_container = _model.getMedia().getDisplayElement();
			}
			createWrapper();
			layoutComponents();
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_LOADED, _loadedHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, function() {
				_resizeMedia();
			});
			var oldresize;
			if (_utils.exists(window.onresize)) {
				oldresize = window.onresize;
			}
			window.onresize = function(evt) {
				if (_utils.exists(oldresize)) {
					try {
						oldresize(evt);
					} catch (err) {
					
					}
				}
				if (_api.jwGetFullscreen()) {
					var rect = document.body.getBoundingClientRect();
					_model.width = Math.abs(rect.left) + Math.abs(rect.right);
					_model.height = window.innerHeight;
				}
				_resize(_model.width, _model.height);
			};
		};
		
		function _keyHandler(evt) {
			switch (evt.keyCode) {
				case 27:
					if (_api.jwGetFullscreen()) {
						_api.jwSetFullscreen(false);
					}
					break;
				case 32:
					// For spacebar. Not sure what to do when there are multiple players
					if (_api.jwGetState() != jwplayer.api.events.state.IDLE && _api.jwGetState() != jwplayer.api.events.state.PAUSED) {
						_api.jwPause();
					} else {
						_api.jwPlay();
					}
					break;
			}
		}
		
		function _resize(width, height) {
			if (_wrapper.style.display == "none") {
				return;
			}
			var plugins = [].concat(_model.plugins.order);
			plugins.reverse();
			_zIndex = plugins.length + 2;
			if (!_model.fullscreen) {
				_model.width = width;
				_model.height = height;
				_width = width;
				_height = height;
				_css(_box, {
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
					width: width,
					height: height,
					position: "relative"
				});
				_css(_wrapper, {
					height: _height,
					width: _width
				});
				var failed = _resizeComponents(_normalscreenComponentResizer, plugins);
				if (failed.length > 0) {
					_zIndex += failed.length;
					_resizeComponents(_overlayComponentResizer, failed, true);
				}
			} else if (navigator.vendor.indexOf("Apple") !== 0) {
				_resizeComponents(_fullscreenComponentResizer, plugins, true);
			}
			_resizeMedia();
		}
		
		function _resizeComponents(componentResizer, plugins, sizeToBox) {
			var failed = [];
			for (var pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
				var pluginName = plugins[pluginIndex];
				if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
					if (_model.plugins.config[pluginName].currentPosition != jwplayer.html5.view.positions.NONE) {
						var style = componentResizer(pluginName, _zIndex--);
						if (!style) {
							failed.push(pluginName);
						} else {
							_model.plugins.object[pluginName].resize(style.width, style.height);
							if (sizeToBox) {
								delete style.width;
								delete style.height;
							}
							_css(_model.plugins.object[pluginName].getDisplayElement(), style);
						}
					} else {
						_css(_model.plugins.object[pluginName].getDisplayElement(), {
							display: "none"
						});
					}
				}
			}
			return failed;
		}
		
		function _normalscreenComponentResizer(pluginName, zIndex) {
			if (_utils.exists(_model.plugins.object[pluginName].getDisplayElement)) {
				if (_model.plugins.config[pluginName].position && _hasPosition(_model.plugins.config[pluginName].position)) {
					if (!_utils.exists(_model.plugins.object[pluginName].getDisplayElement().parentNode)) {
						_wrapper.appendChild(_model.plugins.object[pluginName].getDisplayElement());
					}
					var style = _getComponentPosition(pluginName);
					style.zIndex = zIndex;
					return style;
				}
			}
			return false;
		}
		
		function _overlayComponentResizer(pluginName, zIndex) {
			if (!_utils.exists(_model.plugins.object[pluginName].getDisplayElement().parentNode)) {
				_box.appendChild(_model.plugins.object[pluginName].getDisplayElement());
			}
			var _iwidth = _model.width, _iheight = _model.height;
			if (typeof _model.width == "string" && _model.width.lastIndexOf("%") > -1) {
				percentage = parseFloat(_model.width.substring(0, _model.width.lastIndexOf("%"))) / 100;
				_iwidth = Math.round(window.innerWidth * percentage);
			}
			
			if (typeof _model.height == "string" && _model.height.lastIndexOf("%") > -1) {
				percentage = parseFloat(_model.height.substring(0, _model.height.lastIndexOf("%"))) / 100;
				_iheight = Math.round(window.innerHeight * percentage);
			}
			return {
				position: "absolute",
				width: (_iwidth - _utils.parseDimension(_box.style.left) - _utils.parseDimension(_box.style.right)),
				height: (_iheight - _utils.parseDimension(_box.style.top) - _utils.parseDimension(_box.style.bottom)),
				zIndex: zIndex
			};
		}
		
		function _fullscreenComponentResizer(pluginName, zIndex) {
			return {
				position: "fixed",
				width: _model.width,
				height: _model.height,
				zIndex: zIndex
			};
		}
		
		function _resizeMedia() {
			if (!_utils.exists(_model.getMedia())) {
				return;
			}
			_box.style.position = "absolute";
			var media = _model.getMedia().getDisplayElement();
			if (media && media.tagName.toLowerCase() == "video") {
				media.style.position = "absolute";
				var iwidth, iheight;
				if (_box.style.width.toString().lastIndexOf("%") > -1 || _box.style.width.toString().lastIndexOf("%") > -1) {
					var rect = _box.getBoundingClientRect();
					iwidth = Math.abs(rect.left) + Math.abs(rect.right);
					iheight = Math.abs(rect.top) + Math.abs(rect.bottom);
				} else {
					iwidth = _utils.parseDimension(_box.style.width);
					iheight = _utils.parseDimension(_box.style.height);
				}
				if (media.parentNode) {
					media.parentNode.style.left = _box.style.left;
					media.parentNode.style.top = _box.style.top;
				}
				_utils.stretch(_api.jwGetStretching(), media, iwidth, iheight, 
						media.videoWidth ? media.videoWidth : 400, 
						media.videoHeight ? media.videoHeight : 300);
			} else {
				_model.getMedia().resize(_utils.parseDimension(_box.style.width), _utils.parseDimension(_box.style.height));
			}
		}
		
		function _getComponentPosition(pluginName) {
			var plugincss = {
				position: "absolute",
				margin: 0,
				padding: 0,
				top: null
			};
			// Not a code error - toLowerCase is needed for the CSS position
			var position = _model.plugins.config[pluginName].currentPosition.toLowerCase();
			switch (position.toUpperCase()) {
				case jwplayer.html5.view.positions.TOP:
					plugincss.top = _utils.parseDimension(_box.style.top);
					plugincss.left = _utils.parseDimension(_box.style.left);
					plugincss.width = _width - _utils.parseDimension(_box.style.left) - _utils.parseDimension(_box.style.right);
					plugincss.height = _model.plugins.object[pluginName].height;
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].height + "px";
					_box.style.height = _utils.parseDimension(_box.style.height) - plugincss.height + "px";
					break;
				case jwplayer.html5.view.positions.RIGHT:
					plugincss.top = _utils.parseDimension(_box.style.top);
					plugincss.right = _utils.parseDimension(_box.style.right);
					plugincss.width = _model.plugins.object[pluginName].width;
					plugincss.height = _height - _utils.parseDimension(_box.style.top) - _utils.parseDimension(_box.style.bottom);
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].width + "px";
					_box.style.width = _utils.parseDimension(_box.style.width) - plugincss.width + "px";
					break;
				case jwplayer.html5.view.positions.BOTTOM:
					plugincss.bottom = _utils.parseDimension(_box.style.bottom);
					plugincss.left = _utils.parseDimension(_box.style.left);
					plugincss.width = _width - _utils.parseDimension(_box.style.left) - _utils.parseDimension(_box.style.right);
					plugincss.height = _model.plugins.object[pluginName].height;
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].height + "px";
					_box.style.height = _utils.parseDimension(_box.style.height) - plugincss.height + "px";
					break;
				case jwplayer.html5.view.positions.LEFT:
					plugincss.top = _utils.parseDimension(_box.style.top);
					plugincss.left = _utils.parseDimension(_box.style.left);
					plugincss.width = _model.plugins.object[pluginName].width;
					plugincss.height = _height - _utils.parseDimension(_box.style.top) - _utils.parseDimension(_box.style.bottom);
					_box.style[position] = _utils.parseDimension(_box.style[position]) + _model.plugins.object[pluginName].width + "px";
					_box.style.width = _utils.parseDimension(_box.style.width) - plugincss.width + "px";
					break;
				default:
					break;
			}
			return plugincss;
		}
		
		
		this.resize = _resize;
		
		this.fullscreen = function(state) {
			if (navigator && navigator.vendor && navigator.vendor.indexOf("Apple") === 0) {
				if (_model.getMedia().getDisplayElement().webkitSupportsFullscreen) {
					if (state) {
						try {
							_model.getMedia().getDisplayElement().webkitEnterFullscreen();
						} catch (err) {
						}
					} else {
						try {
							_model.getMedia().getDisplayElement().webkitExitFullscreen();
						} catch (err) {
						}
					}
				}
			} else {
				if (state) {
					document.onkeydown = _keyHandler;
					clearInterval(_resizeInterval);
					var rect = document.body.getBoundingClientRect();
					_model.width = Math.abs(rect.left) + Math.abs(rect.right);
					_model.height = window.innerHeight;
					var style = {
						position: "fixed",
						width: "100%",
						height: "100%",
						top: 0,
						left: 0,
						zIndex: 2147483000
					};
					_css(_wrapper, style);
					style.zIndex = 1;
					_css(_model.getMedia().getDisplayElement(), style);
					style.zIndex = 2;
					_css(_box, style);
				} else {
					document.onkeydown = "";
					_model.width = _width;
					_model.height = _height;
					_css(_wrapper, {
						position: "relative",
						height: _model.height,
						width: _model.width,
						zIndex: 0
					});
				}
				_resize(_model.width, _model.height);
			}
		};
		
	};
	
	function _hasPosition(position) {
		return ([jwplayer.html5.view.positions.TOP, jwplayer.html5.view.positions.RIGHT, jwplayer.html5.view.positions.BOTTOM, jwplayer.html5.view.positions.LEFT].toString().indexOf(position.toUpperCase()) > -1);
	}
	
	//TODO: Enum
	jwplayer.html5.view.positions = {
		TOP: "TOP",
		RIGHT: "RIGHT",
		BOTTOM: "BOTTOM",
		LEFT: "LEFT",
		OVER: "OVER",
		NONE: "NONE"
	};
})(jwplayer);
/**
 * jwplayer controlbar component of the JW Player.
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {
	/** Map with config for the jwplayerControlbar plugin. **/
	var _defaults = {
		backgroundcolor: "",
		margin: 10,
		font: "Arial,sans-serif",
		fontsize: 10,
		fontcolor: parseInt("000000", 16),
		fontstyle: "normal",
		fontweight: "bold",
		buttoncolor: parseInt("ffffff", 16),
		position: jwplayer.html5.view.positions.BOTTOM,
		idlehide: false,
		layout: {
			"left": {
				"position": "left",
				"elements": [{
					"name": "play",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "prev",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "next",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "elapsed",
					"type": "text"
				}]
			},
			"center": {
				"position": "center",
				"elements": [{
					"name": "time",
					"type": "slider"
				}]
			},
			"right": {
				"position": "right",
				"elements": [{
					"name": "duration",
					"type": "text"
				}, {
					"name": "blank",
					"type": "button"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "mute",
					"type": "button"
				}, {
					"name": "volume",
					"type": "slider"
				}, {
					"name": "divider",
					"type": "divider"
				}, {
					"name": "fullscreen",
					"type": "button"
				}]
			}
		}
	};
	
	_utils = jwplayer.utils;
	_css = _utils.css;
	
	_hide = function(element) {
		_css(element, {
			display: "none"
		});
	};
	
	_show = function(element) {
		_css(element, {
			display: "block"
		});
	};
	
	jwplayer.html5.controlbar = function(api, config) {
		var _api = api;
		var _settings = _utils.extend({}, _defaults, _api.skin.getComponentSettings("controlbar"), config);
		if (_settings.position == jwplayer.html5.view.positions.NONE
			|| typeof jwplayer.html5.view.positions[_settings.position] == "undefined") {
			return;
		}
		if (_utils.mapLength(_api.skin.getComponentLayout("controlbar")) > 0) {
			_settings.layout = _api.skin.getComponentLayout("controlbar");
		}
		var _wrapper;
		var _dividerid;
		var _marginleft;
		var _marginright;
		var _scrubber = "none";
		var _mousedown;
		var _currentPosition;
		var _currentDuration;
		var _currentBuffer;
		var _width;
		var _height;
		var _elements = {};
		var _ready = false;
		var _positions = {};
		var _bgElement;
		var _hiding = false;
		var _fadeTimeout;
		var _lastSent;
		var _eventReady = false;
		var _fullscreen = false;
		
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		_utils.extend(this, _eventDispatcher);
		
		function _getBack() {
			if (!_bgElement) {
				_bgElement = _api.skin.getSkinElement("controlbar", "background");
				if (!_bgElement) {
					_bgElement = {
					   width: 0, height: 0, src: null		
					}
				}
			}
			return _bgElement;
		}
		
		function _buildBase() {
			_marginleft = 0;
			_marginright = 0;
			_dividerid = 0;
			if (!_ready) {
				var wrappercss = {
					height: _getBack().height,
					backgroundColor: _settings.backgroundcolor
				};
				
				_wrapper = document.createElement("div");
				_wrapper.id = _api.id + "_jwplayer_controlbar";
				_css(_wrapper, wrappercss);
			}

			var capLeft = (_api.skin.getSkinElement("controlbar", "capLeft"));
			var capRight = (_api.skin.getSkinElement("controlbar", "capRight"));

			if (capLeft) {
				_addElement("capLeft", "left", false, _wrapper);
			}
			var domelementcss = {
				position: "absolute",
				height: _getBack().height,
				left: (capLeft ? capLeft.width : 0),
				zIndex: 0
			};
			_appendNewElement("background", _wrapper, domelementcss, "img");
			if (_getBack().src) {
				_elements.background.src = _getBack().src;
			}
			domelementcss.zIndex = 1;
			_appendNewElement("elements", _wrapper, domelementcss);
			if (capRight) {
				_addElement("capRight", "right", false, _wrapper);
			}
		}
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			_utils.cancelAnimation(_wrapper);
			document.getElementById(_api.id).onmousemove = _setVisiblity;
			_width = width;
			_height = height;
			
			if (_fullscreen != _api.jwGetFullscreen()) {
				_fullscreen = _api.jwGetFullscreen();
				_lastSent = undefined;
			}
			
			var style = _resizeBar();
			_setVisiblity();
			_timeHandler({
				id: _api.id,
				duration: _currentDuration,
				position: _currentPosition
			});
			_bufferHandler({
				id: _api.id,
				bufferPercent: _currentBuffer
			});
			return style;
		};
		
		this.show = function() {
			if (_hiding) {
				_hiding = false;
				_show(_wrapper);
				_sendShow();
			}
		}

		this.hide = function() {
			if (!_hiding) {
				_hiding = true;
				_hide(_wrapper);
				_sendHide();
			}
		}

		function _updatePositions() {
			var positionElements = ["timeSlider", "volumeSlider", "timeSliderRail", "volumeSliderRail"];
			for (var positionElement in positionElements) {
				var elementName = positionElements[positionElement];
				if (typeof _elements[elementName] != "undefined") {
					_positions[elementName] = _elements[elementName].getBoundingClientRect();
				}
			}
		}
		
		
		function _setVisiblity(evt) {
			if (_hiding) { return; }
			if (_settings.position == jwplayer.html5.view.positions.OVER || _api.jwGetFullscreen()) {
				clearTimeout(_fadeTimeout);
				switch(_api.jwGetState()) {
				case jwplayer.api.events.state.PAUSED:
				case jwplayer.api.events.state.IDLE:
					if (!_settings.idlehide || _utils.exists(evt)) {
						_fadeIn();
					}
					if (_settings.idlehide) {
						_fadeTimeout = setTimeout(function() {
							_fadeOut();
						}, 2000);
					}
					break;
				default:
					if (evt) {
						// Fade in on mouse move
						_fadeIn();
					}
					_fadeTimeout = setTimeout(function() {
						_fadeOut();
					}, 2000);
					break;
				}
			}
		}
		
		function _fadeOut(delay) {
			_sendHide();
			_utils.cancelAnimation(_wrapper);
			_utils.fadeTo(_wrapper, 0, 0.1, 1, 0);
		}
		
		function _fadeIn() {
			_sendShow();
			_utils.cancelAnimation(_wrapper);
			_utils.fadeTo(_wrapper, 1, 0, 1, 0);
		}
		
		function _sendVisibilityEvent(eventType) {
			return function() {
				if (_eventReady && _lastSent != eventType) {
					_lastSent = eventType;
					_eventDispatcher.sendEvent(eventType, {
						component: "controlbar",
						boundingRect: _getBoundingRect()
					});
				}
			}
		}

		var _sendShow = _sendVisibilityEvent(jwplayer.api.events.JWPLAYER_COMPONENT_SHOW);
		var _sendHide = _sendVisibilityEvent(jwplayer.api.events.JWPLAYER_COMPONENT_HIDE);
		
		function _getBoundingRect() {
			if (_settings.position == jwplayer.html5.view.positions.OVER || _api.jwGetFullscreen()) {
				return _utils.getDimensions(_wrapper);
			} else {
				return { x: 0, y:0, width: 0, height: 0 };
			}
		}

		function _appendNewElement(id, parent, css, domelement) {
			var element;
			if (!_ready) {
				if (!domelement) {
					domelement = "div";
				}
				element = document.createElement(domelement);
				_elements[id] = element;
				element.id = _wrapper.id + "_" + id;
				parent.appendChild(element);
			} else {
				element = document.getElementById(_wrapper.id + "_" + id);
			}
			if (_utils.exists(css)) {
				_css(element, css);
			}
			return element;
		}
		
		/** Draw the jwplayerControlbar elements. **/
		function _buildElements() {
			_buildGroup(_settings.layout.left);
			_buildGroup(_settings.layout.right, -1);
			_buildGroup(_settings.layout.center);
		}
		
		/** Layout a group of elements**/
		function _buildGroup(group, order) {
			var alignment = group.position == "right" ? "right" : "left";
			var elements = _utils.extend([], group.elements);
			if (_utils.exists(order)) {
				elements.reverse();
			}
			for (var i = 0; i < elements.length; i++) {
				_buildElement(elements[i], alignment);
			}
		}
		
		function getNewDividerId() {
			return _dividerid++;
		}
		
		/** Draw a single element into the jwplayerControlbar. **/
		function _buildElement(element, alignment) {
			var offset, offsetLeft, offsetRight, width, slidercss;
			
			if (element.type == "divider") {
				_addElement("divider" + getNewDividerId(), alignment, true, undefined, undefined, element.width, element.element);
				return;
			}
			
			switch (element.name) {
				case "play":
					_addElement("playButton", alignment, false);
					_addElement("pauseButton", alignment, true);
					_buildHandler("playButton", "jwPlay");
					_buildHandler("pauseButton", "jwPause");
					break;
				case "prev":
					_addElement("prevButton", alignment, true);
					_buildHandler("prevButton", "jwPlaylistPrev");
					break;
				case "stop":
					_addElement("stopButton", alignment, true);
					_buildHandler("stopButton", "jwStop");
					break;
				case "next":
					_addElement("nextButton", alignment, true);
					_buildHandler("nextButton", "jwPlaylistNext");
					break;
				case "elapsed":
					_addElement("elapsedText", alignment, true);
					break;
				case "time":
					offsetLeft = !_utils.exists(_api.skin.getSkinElement("controlbar", "timeSliderCapLeft")) ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
					offsetRight = !_utils.exists(_api.skin.getSkinElement("controlbar", "timeSliderCapRight")) ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapRight").width;
					offset = alignment == "left" ? offsetLeft : offsetRight;
					width = _api.skin.getSkinElement("controlbar", "timeSliderRail").width + offsetLeft + offsetRight;
					slidercss = {
						height: _getBack().height,
						position: "absolute",
						top: 0,
						width: width
					};
					slidercss[alignment] = alignment == "left" ? _marginleft : _marginright;
					var _timeslider = _appendNewElement("timeSlider", _elements.elements, slidercss);
					_addElement("timeSliderCapLeft", alignment, true, _timeslider, alignment == "left" ? 0 : offset);
					_addElement("timeSliderRail", alignment, false, _timeslider, offset);
					_addElement("timeSliderBuffer", alignment, false, _timeslider, offset);
					_addElement("timeSliderProgress", alignment, false, _timeslider, offset);
					_addElement("timeSliderThumb", alignment, false, _timeslider, offset);
					_addElement("timeSliderCapRight", alignment, true, _timeslider, alignment == "right" ? 0 : offset);
					_addSliderListener("time");
					break;
				case "fullscreen":
					_addElement("fullscreenButton", alignment, false);
					_addElement("normalscreenButton", alignment, true);
					_buildHandler("fullscreenButton", "jwSetFullscreen", true);
					_buildHandler("normalscreenButton", "jwSetFullscreen", false);
					break;
				case "volume":
					offsetLeft = !_utils.exists(_api.skin.getSkinElement("controlbar", "volumeSliderCapLeft")) ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
					offsetRight = !_utils.exists(_api.skin.getSkinElement("controlbar", "volumeSliderCapRight")) ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapRight").width;
					offset = alignment == "left" ? offsetLeft : offsetRight;
					width = _api.skin.getSkinElement("controlbar", "volumeSliderRail").width + offsetLeft + offsetRight;
					slidercss = {
						height: _getBack().height,
						position: "absolute",
						top: 0,
						width: width
					};
					slidercss[alignment] = alignment == "left" ? _marginleft : _marginright;
					var _volumeslider = _appendNewElement("volumeSlider", _elements.elements, slidercss);
					_addElement("volumeSliderCapLeft", alignment, true, _volumeslider, alignment == "left" ? 0 : offset);
					_addElement("volumeSliderRail", alignment, true, _volumeslider, offset);
					_addElement("volumeSliderProgress", alignment, false, _volumeslider, offset);
					_addElement("volumeSliderCapRight", alignment, true, _volumeslider, alignment == "right" ? 0 : offset);
					_addSliderListener("volume");
					break;
				case "mute":
					_addElement("muteButton", alignment, false);
					_addElement("unmuteButton", alignment, true);
					_buildHandler("muteButton", "jwSetMute", true);
					_buildHandler("unmuteButton", "jwSetMute", false);
					
					break;
				case "duration":
					_addElement("durationText", alignment, true);
					break;
			}
		}
		
		function _addElement(element, alignment, offset, parent, position, width, skinElement) {
			if (_utils.exists(_api.skin.getSkinElement("controlbar", element)) || element.indexOf("Text") > 0 || element.indexOf("divider") === 0)  {
				var css = {
					height: _getBack().height,
					position: "absolute",
					display: "block",
					top: 0
				};
				if ((element.indexOf("next") === 0 || element.indexOf("prev") === 0) && _api.jwGetPlaylist().length < 2) {
					offset = false;
					css.display = "none";
				}
				var wid;
				if (element.indexOf("Text") > 0) {
					element.innerhtml = "00:00";
					css.font = _settings.fontsize + "px/" + (_getBack().height + 1) + "px " + _settings.font;
					css.color = _settings.fontcolor;
					css.textAlign = "center";
					css.fontWeight = _settings.fontweight;
					css.fontStyle = _settings.fontstyle;
					css.cursor = "default";
					wid = 14 + 3 * _settings.fontsize;
				} else if (element.indexOf("divider") === 0) {
					if (width) {
						if (!isNaN(parseInt(width))) {
							wid = parseInt(width);
						}
					} else if (skinElement) {
						var altDivider = _api.skin.getSkinElement("controlbar", skinElement);
						if (altDivider) {
							css.background = "url(" + altDivider.src + ") repeat-x center left";
							wid = altDivider.width;
						}
					} else {
						css.background = "url(" + _api.skin.getSkinElement("controlbar", "divider").src + ") repeat-x center left";
						wid = _api.skin.getSkinElement("controlbar", "divider").width;	
					}
				} else {
					css.background = "url(" + _api.skin.getSkinElement("controlbar", element).src + ") repeat-x center left";
					wid = _api.skin.getSkinElement("controlbar", element).width;
				}
				if (alignment == "left") {
					css.left = isNaN(position) ? _marginleft : position;
					if (offset) {
						_marginleft += wid;
					}
				} else if (alignment == "right") {
					css.right = isNaN(position) ? _marginright : position;
					if (offset) {
						_marginright += wid;
					}
				}
				
				
				if (_utils.typeOf(parent) == "undefined") {
					parent = _elements.elements;
				}
				
				css.width = wid;
				
				if (_ready) {
					_css(_elements[element], css);
				} else {
					var newelement = _appendNewElement(element, parent, css);
					if (_utils.exists(_api.skin.getSkinElement("controlbar", element + "Over"))) {
						newelement.onmouseover = function(evt) {
							newelement.style.backgroundImage = ["url(", _api.skin.getSkinElement("controlbar", element + "Over").src, ")"].join("");
						};
						newelement.onmouseout = function(evt) {
							newelement.style.backgroundImage = ["url(", _api.skin.getSkinElement("controlbar", element).src, ")"].join("");
						};
					}
				}
			}
		}
		
		function _addListeners() {
			// Register events with the player.
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, _bufferHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, _timeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _muteHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, _volumeHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
		}
		
		function _playlistHandler() {
			_buildBase();
			_buildElements();
			_resizeBar();
			_init();
		}

		function _itemHandler(evt) {
			_currentDuration = _api.jwGetPlaylist()[evt.index].duration;
			_timeHandler({
				id: _api.id,
				duration: _currentDuration,
				position: 0
			});
			_bufferHandler({
				id: _api.id,
				bufferProgress: 0
			});
		}

		/** Add interactivity to the jwplayerControlbar elements. **/
		function _init() {
			// Trigger a few events so the bar looks good on startup.
			_timeHandler({
				id: _api.id,
				duration: _api.jwGetDuration(),
				position: 0
			});
			_bufferHandler({
				id: _api.id,
				bufferProgress: 0
			});
			_muteHandler({
				id: _api.id,
				mute: _api.jwGetMute()
			});
			_stateHandler({
				id: _api.id,
				newstate: jwplayer.api.events.state.IDLE
			});
			_volumeHandler({
				id: _api.id,
				volume: _api.jwGetVolume()
			});
		}
		
		
		/** Set a single button handler. **/
		function _buildHandler(element, handler, args) {
			if (_ready) {
				return;
			}
			if (_utils.exists(_api.skin.getSkinElement("controlbar", element))) {
				var _element = _elements[element];
				if (_utils.exists(_element)) {
					_css(_element, {
						cursor: "pointer"
					});
					if (handler == "fullscreen") {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							_api.jwSetFullscreen(!_api.jwGetFullscreen());
						};
					} else {
						_element.onmouseup = function(evt) {
							evt.stopPropagation();
							if (_utils.exists(args)) {
								_api[handler](args);
							} else {
								_api[handler]();
							}
							
						};
					}
				}
			}
		}
		
		/** Set the volume drag handler. **/
		function _addSliderListener(name) {
			if (_ready) {
				return;
			}
			var bar = _elements[name + "Slider"];
			_css(_elements.elements, {
				"cursor": "pointer"
			});
			_css(bar, {
				"cursor": "pointer"
			});
			bar.onmousedown = function(evt) {
				_scrubber = name;
			};
			bar.onmouseup = function(evt) {
				evt.stopPropagation();
				_sliderUp(evt.pageX);
			};
			bar.onmousemove = function(evt) {
				if (_scrubber == "time") {
					_mousedown = true;
					var xps = evt.pageX - _positions[name + "Slider"].left - window.pageXOffset;
					_css(_elements.timeSliderThumb, {
						left: xps
					});
				}
			};
		}
		
		
		/** The slider has been moved up. **/
		function _sliderUp(msx) {
			_mousedown = false;
			var xps;
			if (_scrubber == "time") {
				xps = msx - _positions.timeSliderRail.left + window.pageXOffset;
				var pos = xps / _positions.timeSliderRail.width * _currentDuration;
				if (pos < 0) {
					pos = 0;
				} else if (pos > _currentDuration) {
					pos = _currentDuration - 3;
				}
				if (_api.jwGetState() == jwplayer.api.events.state.PAUSED || _api.jwGetState() == jwplayer.api.events.state.IDLE) {
					_api.jwPlay();
				}
				_api.jwSeek(pos);
			} else if (_scrubber == "volume") {
				xps = msx - _positions.volumeSliderRail.left - window.pageXOffset;
				var pct = Math.round(xps / _positions.volumeSliderRail.width * 100);
				if (pct < 0) {
					pct = 0;
				} else if (pct > 100) {
					pct = 100;
				}
				if (_api.jwGetMute()) {
					_api.jwSetMute(false);
				}
				_api.jwSetVolume(pct);
			}
			_scrubber = "none";
		}
		
		
		/** Update the buffer percentage. **/
		function _bufferHandler(event) {
			if (_utils.exists(event.bufferPercent)) {
				_currentBuffer = event.bufferPercent;
			}
			if (_positions.timeSliderRail) {
				var wid = _positions.timeSliderRail.width;
				var bufferWidth = isNaN(Math.round(wid * _currentBuffer / 100)) ? 0 : Math.round(wid * _currentBuffer / 100);
				_css(_elements.timeSliderBuffer, {
					width: bufferWidth
				});
			}
		}
		
		
		/** Update the mute state. **/
		function _muteHandler(event) {
			if (event.mute) {
				_hide(_elements.muteButton);
				_show(_elements.unmuteButton);
				_hide(_elements.volumeSliderProgress);
			} else {
				_show(_elements.muteButton);
				_hide(_elements.unmuteButton);
				_show(_elements.volumeSliderProgress);
			}
		}
		
		
		/** Update the playback state. **/
		function _stateHandler(event) {
			// Handle the play / pause button
			if (event.newstate == jwplayer.api.events.state.BUFFERING || event.newstate == jwplayer.api.events.state.PLAYING) {
				_show(_elements.pauseButton);
				_hide(_elements.playButton);
			} else {
				_hide(_elements.pauseButton);
				_show(_elements.playButton);
			}
			
			_setVisiblity();
			// Show / hide progress bar
			if (event.newstate == jwplayer.api.events.state.IDLE) {
				_hide(_elements.timeSliderBuffer);
				_hide(_elements.timeSliderProgress);
				_hide(_elements.timeSliderThumb);
				_timeHandler({
					id: _api.id,
					duration: _api.jwGetDuration(),
					position: 0
				});
			} else {
				_show(_elements.timeSliderBuffer);
				if (event.newstate != jwplayer.api.events.state.BUFFERING) {
					_show(_elements.timeSliderProgress);
					_show(_elements.timeSliderThumb);
				}
			}
		}
		
		
		/** Handles event completion **/
		function _completeHandler(event) {
			_bufferHandler({
				bufferPercent: 0
			});
			_timeHandler(_utils.extend(event, {
				position: 0,
				duration: _currentDuration
			}));
		}
		
		
		/** Update the playback time. **/
		function _timeHandler(event) {
			if (_utils.exists(event.position)) {
				_currentPosition = event.position;
			}
			if (_utils.exists(event.duration)) {
				_currentDuration = event.duration;
			}
			var progress = (_currentPosition === _currentDuration === 0) ? 0 : _currentPosition / _currentDuration;
			var progressElement = _positions.timeSliderRail;
			if (progressElement) {
				var progressWidth = isNaN(Math.round(progressElement.width * progress)) ? 0 : Math.round(progressElement.width * progress);
				var thumbPosition = progressWidth;
				if (_elements.timeSliderProgress) {
					_elements.timeSliderProgress.style.width = progressWidth + "px";
					if (!_mousedown) {
						if (_elements.timeSliderThumb) {
							_elements.timeSliderThumb.style.left = thumbPosition + "px";
						}
					}
				}
			}
			if (_elements.durationText) {
				_elements.durationText.innerHTML = _utils.timeFormat(_currentDuration);
			}
			if (_elements.elapsedText) {
				_elements.elapsedText.innerHTML = _utils.timeFormat(_currentPosition);
			}
		}
		
		
		function cleanupDividers() {
			var lastElement, lastVisibleElement;
			var elements = document.getElementById(_wrapper.id + "_elements");
			if (!elements) {
				return;
			}
			
			var childNodes = elements.childNodes;
			for (var childNode in elements.childNodes) {
				if (isNaN(parseInt(childNode, 10))) {
					continue;
				}
				if (childNodes[childNode].id.indexOf(_wrapper.id + "_divider") === 0 
						&& lastVisibleElement 
						&& lastVisibleElement.id.indexOf(_wrapper.id + "_divider") === 0 
						&& childNodes[childNode].style.backgroundImage == lastVisibleElement.style.backgroundImage) {
					childNodes[childNode].style.display = "none";
				} else if (childNodes[childNode].id.indexOf(_wrapper.id + "_divider") === 0 && lastElement && lastElement.style.display != "none") {
					childNodes[childNode].style.display = "block";
				}
				if (childNodes[childNode].style.display != "none") {
					lastVisibleElement = childNodes[childNode];
				}
				lastElement = childNodes[childNode];
			}
		}
		
		/** Resize the jwplayerControlbar. **/
		function _resizeBar() {
			cleanupDividers();
			if (_api.jwGetFullscreen()) {
				_show(_elements.normalscreenButton);
				_hide(_elements.fullscreenButton);
			} else {
				_hide(_elements.normalscreenButton);
				_show(_elements.fullscreenButton);
			}
			var controlbarcss = {
				width: _width
			};
			var elementcss = {};
			if (_settings.position == jwplayer.html5.view.positions.OVER || _api.jwGetFullscreen()) {
				controlbarcss.left = _settings.margin;
				controlbarcss.width -= 2 * _settings.margin;
				controlbarcss.top = _height - _getBack().height - _settings.margin;
				controlbarcss.height = _getBack().height;
			}
			
			var capLeft = _api.skin.getSkinElement("controlbar", "capLeft"); 
			var capRight = _api.skin.getSkinElement("controlbar", "capRight"); 
			
			elementcss.left = capLeft ? capLeft.width : 0;
			elementcss.width = controlbarcss.width - elementcss.left - (capRight ? capRight.width : 0);

			var timeSliderLeft = !_utils.exists(_api.skin.getSkinElement("controlbar", "timeSliderCapLeft")) ? 0 : _api.skin.getSkinElement("controlbar", "timeSliderCapLeft").width;
			_css(_elements.timeSliderRail, {
				width: (elementcss.width - _marginleft - _marginright),
				left: timeSliderLeft
			});
			if (_utils.exists(_elements.timeSliderCapRight)) {
				_css(_elements.timeSliderCapRight, {
					left: timeSliderLeft + (elementcss.width - _marginleft - _marginright)
				});
			}
			_css(_wrapper, controlbarcss);
			_css(_elements.elements, elementcss);
			_css(_elements.background, elementcss);
			_updatePositions();
			return controlbarcss;
		}
		
		
		/** Update the volume level. **/
		function _volumeHandler(event) {
			if (_utils.exists(_elements.volumeSliderRail)) {
				var progress = isNaN(event.volume / 100) ? 1 : event.volume / 100;
				var width = _utils.parseDimension(_elements.volumeSliderRail.style.width);
				var progressWidth = isNaN(Math.round(width * progress)) ? 0 : Math.round(width * progress);
				var offset = _utils.parseDimension(_elements.volumeSliderRail.style.right);
				
				var volumeSliderLeft = (!_utils.exists(_api.skin.getSkinElement("controlbar", "volumeSliderCapLeft"))) ? 0 : _api.skin.getSkinElement("controlbar", "volumeSliderCapLeft").width;
				_css(_elements.volumeSliderProgress, {
					width: progressWidth,
					left: volumeSliderLeft
				});
				
				if (_utils.exists(_elements.volumeSliderCapLeft)) {
					_css(_elements.volumeSliderCapLeft, {
						left: 0
					});
				}
			}
		}
		
		function _setup() {
			_buildBase();
			_buildElements();
			_updatePositions();
			_ready = true;
			_addListeners();
			_settings.idlehide = (_settings.idlehide.toString().toLowerCase() == "true");
			if (_settings.position == jwplayer.html5.view.positions.OVER && _settings.idlehide) {
				_wrapper.style.opacity = 0;
				_eventReady = true;
			} else {
				setTimeout((function() { 
					_eventReady = true;
					_sendShow();
				}), 1);
			}				
			_init();
		}
		
		_setup();
		return this;
	};
})(jwplayer);
/**
 * JW Player controller component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	var _mediainfovariables = ["width", "height", "state", "playlist", "item", "position", "buffer", "duration", "volume", "mute", "fullscreen"];
	var _utils = jwplayer.utils;
	
	jwplayer.html5.controller = function(api, container, model, view) {
		var _api = api;
		var _model = model;
		var _view = view;
		var _container = container;
		var _itemUpdated = true;
		var _oldstart = -1;
		
		var debug = _utils.exists(_model.config.debug) && (_model.config.debug.toString().toLowerCase() == 'console');
		var _eventDispatcher = new jwplayer.html5.eventdispatcher(_container.id, debug);
		_utils.extend(this, _eventDispatcher);
		
		function forward(evt) {
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		_model.addGlobalListener(forward);
		
		/** Set event handlers **/
		_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, function() {
			_model.getMedia().play();
		});
		_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_TIME, function(evt) {
			if (evt.position >= _model.playlist[_model.item].start && _oldstart >= 0) {
				_model.playlist[_model.item].start = _oldstart;
				_oldstart = -1;
			}
		});
		_model.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, function(evt) {
			setTimeout(_completeHandler, 25);
		});
		
		
		function _play() {
			try {
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (_itemUpdated || _model.state == jwplayer.api.events.state.IDLE) {
						_model.getMedia().load(_model.playlist[_model.item]);
						_itemUpdated = false;
					} else if (_model.state == jwplayer.api.events.state.PAUSED) {
						_model.getMedia().play();
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Switch the pause state of the player. **/
		function _pause() {
			try {
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					switch (_model.state) {
						case jwplayer.api.events.state.PLAYING:
						case jwplayer.api.events.state.BUFFERING:
							_model.getMedia().pause();
							break;
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Seek to a position in the video. **/
		function _seek(position) {
			try {
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (typeof position != "number") {
						position = parseFloat(position);
					}
					switch (_model.state) {
						case jwplayer.api.events.state.IDLE:
							if (_oldstart < 0) {
								_oldstart = _model.playlist[_model.item].start;
								_model.playlist[_model.item].start = position;
							}
							_play();
							break;
						case jwplayer.api.events.state.PLAYING:
						case jwplayer.api.events.state.PAUSED:
						case jwplayer.api.events.state.BUFFERING:
							_model.seek(position);
							break;
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Stop playback and loading of the video. **/
		function _stop(clear) {
			if (!_utils.exists(clear)) {
				clear = true;
			}
			try {
				_model.getMedia().stop(clear);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Stop playback and loading of the video. **/
		function _next() {
			try {
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (_model.config.shuffle) {
						_loadItem(_getShuffleItem());
					} else if (_model.item + 1 == _model.playlist.length) {
						_loadItem(0);
					} else {
						_loadItem(_model.item + 1);
					}
				}
				if (_model.state != jwplayer.api.events.state.IDLE) {
					var oldstate = _model.state;
					_model.state = jwplayer.api.events.state.IDLE;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
						oldstate: oldstate,
						newstate: jwplayer.api.events.state.IDLE
					});
				}
				_play();
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		/** Stop playback and loading of the video. **/
		function _prev() {
			try {
				if (_model.playlist[_model.item].levels[0].file.length > 0) {
					if (_model.config.shuffle) {
						_loadItem(_getShuffleItem());
					} else if (_model.item === 0) {
						_loadItem(_model.playlist.length - 1);
					} else {
						_loadItem(_model.item - 1);
					}
				}
				if (_model.state != jwplayer.api.events.state.IDLE) {
					var oldstate = _model.state;
					_model.state = jwplayer.api.events.state.IDLE;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
						oldstate: oldstate,
						newstate: jwplayer.api.events.state.IDLE
					});
				}
				_play();
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		function _getShuffleItem() {
			var result = null;
			if (_model.playlist.length > 1) {
				while (!_utils.exists(result)) {
					result = Math.floor(Math.random() * _model.playlist.length);
					if (result == _model.item) {
						result = null;
					}
				}
			} else {
				result = 0;
			}
			return result;
		}
		
		/** Stop playback and loading of the video. **/
		function _item(item) {
			if (!_model.playlist || !_model.playlist[item]) {
				return false;
			}
			
			try {
				if (_model.playlist[item].levels[0].file.length > 0) {
					var oldstate = _model.state;
					if (oldstate !== jwplayer.api.events.state.IDLE) {
						if (_model.playlist[_model.item].provider == _model.playlist[item].provider) {
							_stop(false);
						} else {
							_stop();
						}
					}
					_loadItem(item);
					_play();
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		function _loadItem(item) {
			_model.item = item;
			_itemUpdated = true;
			_model.setActiveMediaProvider(_model.playlist[_model.item]);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
				"index": item
			});
		}
		
		/** Get / set the video's volume level. **/
		function _setVolume(volume) {
			try {
				switch (typeof(volume)) {
					case "number":
						_model.getMedia().volume(volume);
						break;
					case "string":
						_model.getMedia().volume(parseInt(volume, 10));
						break;
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Get / set the mute state of the player. **/
		function _setMute(state) {
			try {
				if (typeof state == "undefined") {
					_model.getMedia().mute(!_model.mute);
				} else {
					if (state.toString().toLowerCase() == "true") {
						_model.getMedia().mute(true);
					} else {
						_model.getMedia().mute(false);
					}
				}
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Resizes the video **/
		function _resize(width, height) {
			try {
				_model.width = width;
				_model.height = height;
				_view.resize(width, height);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_RESIZE, {
					"width": _model.width,
					"height": _model.height
				});
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Jumping the player to/from fullscreen. **/
		function _setFullscreen(state) {
			try {
				if (typeof state == "undefined") {
					_model.fullscreen = !_model.fullscreen;
					_view.fullscreen(!_model.fullscreen);
				} else {
					if (state.toString().toLowerCase() == "true") {
						_model.fullscreen = true;
						_view.fullscreen(true);
					} else {
						_model.fullscreen = false;
						_view.fullscreen(false);
					}
				}
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_RESIZE, {
					"width": _model.width,
					"height": _model.height
				});
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_FULLSCREEN, {
					"fullscreen": state
				});
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		
		/** Loads a new video **/
		function _load(arg) {
			try {
				_stop();
				_model.loadPlaylist(arg);
				_loadItem(_model.item);
				return true;
			} catch (err) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, err);
			}
			return false;
		}
		
		jwplayer.html5.controller.repeatoptions = {
			LIST: "LIST",
			ALWAYS: "ALWAYS",
			SINGLE: "SINGLE",
			NONE: "NONE"
		};
		
		function _completeHandler() {
			switch (_model.config.repeat.toUpperCase()) {
				case jwplayer.html5.controller.repeatoptions.SINGLE:
					_play();
					break;
				case jwplayer.html5.controller.repeatoptions.ALWAYS:
					if (_model.item == _model.playlist.length - 1 && !_model.config.shuffle) {
						_item(0);
					} else {
						_next();
					}
					break;
				case jwplayer.html5.controller.repeatoptions.LIST:
					if (_model.item == _model.playlist.length - 1 && !_model.config.shuffle) {
						_stop();
						_loadItem(0);
					} else {
						_next();
					}
					break;
				default:
					_stop();
					break;
			}
		}
		
		this.play = _play;
		this.pause = _pause;
		this.seek = _seek;
		this.stop = _stop;
		this.next = _next;
		this.prev = _prev;
		this.item = _item;
		this.setVolume = _setVolume;
		this.setMute = _setMute;
		this.resize = _resize;
		this.setFullscreen = _setFullscreen;
		this.load = _load;
	};
})(jwplayer);
/**
 * JW Player Default skin
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.html5.defaultSkin = function() {
		this.text = '<?xml version="1.0" ?><skin author="LongTail Video" name="Five" version="1.0"><settings><setting name="backcolor" value="0xFFFFFF"/><setting name="frontcolor" value="0x000000"/><setting name="lightcolor" value="0x000000"/><setting name="screencolor" value="0x000000"/></settings><components><component name="controlbar"><settings><setting name="margin" value="20"/><setting name="fontsize" value="11"/></settings><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFJJREFUeNrslLENwAAIwxLU/09j5AiOgD5hVQzNAVY8JK4qEfHMIKBnd2+BQlBINaiRtL/aV2rdzYBsM6CIONbI1NZENTr3RwdB2PlnJgJ6BRgA4hwu5Qg5iswAAAAASUVORK5CYII="/><element name="capLeft" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="capRight" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="divider" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAYCAIAAAC0rgCNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD5JREFUeNosi8ENACAMAgnuv14H0Z8asI19XEjhOiKCMmibVgJTUt7V6fe9KXOtSQCfctJHu2q3/ot79hNgANc2OTz9uTCCAAAAAElFTkSuQmCC"/><element name="playButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEhJREFUeNpiYqABYBo1dNRQ+hr6H4jvA3E8NS39j4SpZvh/LJig4YxEGEqy3kET+w+AOGFQRhTJhrEQkGcczfujhg4CQwECDADpTRWU/B3wHQAAAABJRU5ErkJggg=="/><element name="pauseButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAChJREFUeNpiYBgFo2DwA0YC8v/R1P4nRu+ooaOGUtnQUTAKhgIACDAAFCwQCfAJ4gwAAAAASUVORK5CYII="/><element name="prevButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEtJREFUeNpiYBgFo2Dog/9QDAPyQHweTYwiQ/2B+D0Wi8g2tB+JTdBQRiIMJVkvEy0iglhDF9Aq9uOpHVEwoE+NJDUKRsFgAAABBgDe2hqZcNNL0AAAAABJRU5ErkJggg=="/><element name="nextButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAElJREFUeNpiYBgFo2Dog/9AfB6I5dHE/lNqKAi/B2J/ahsKw/3EGMpIhKEk66WJoaR6fz61IyqemhEFSlL61ExSo2AUDAYAEGAAiG4hj+5t7M8AAAAASUVORK5CYII="/><element name="timeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADxJREFUeNpiYBgFo2AU0Bwwzluw+D8tLWARFhKiqQ9YuLg4aWsBGxs7bS1gZ6e5BWyjSX0UjIKhDgACDABlYQOGh5pYywAAAABJRU5ErkJggg=="/><element name="timeSliderBuffer" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFo2AU0Bww1jc0/aelBSz8/Pw09QELOzs7bS1gY2OjrQWsrKy09gHraFIfBaNgqAOAAAMAvy0DChXHsZMAAAAASUVORK5CYII="/><element name="timeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAClJREFUeNpiYBgFo2AU0BwwAvF/WlrARGsfjFow8BaMglEwCugAAAIMAOHfAQunR+XzAAAAAElFTkSuQmCC"/><element name="timeSliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAICAYAAAA870V8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiZICA/yCCiQEJUJcDEGAAY0gBD1/m7Q0AAAAASUVORK5CYII="/><element name="muteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADFJREFUeNpiYBgFIw3MB+L/5Gj8j6yRiRTFyICJXHfTXyMLAXlGati4YDRFDj8AEGAABk8GSqqS4CoAAAAASUVORK5CYII="/><element name="unmuteButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAYCAYAAADKx8xXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAD1JREFUeNpiYBgFgxz8p7bm+cQa+h8LHy7GhEcjIz4bmAjYykiun/8j0fakGPIfTfPgiSr6aB4FVAcAAQYAWdwR1G1Wd2gAAAAASUVORK5CYII="/><element name="volumeSliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAGpJREFUeNpi/P//PwM9ABMDncCoRYPfIqqDZcuW1UPp/6AUDcNM1DQYKtRAlaAj1mCSLSLXYIIWUctgDItoZfDA5aOoqKhGEANIM9LVR7SymGDQUctikuOIXkFNdhHEOFrDjlpEd4sAAgwAriRMub95fu8AAAAASUVORK5CYII="/><element name="volumeSliderProgress" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAYCAYAAADkgu3FAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFtJREFUeNpi/P//PwM9ABMDncCoRYPfIlqAeij9H5SiYZiqBqPTlFqE02BKLSLaYFItIttgQhZRzWB8FjENiuRJ7aAbsMQwYMl7wDIsWUUQ42gNO2oR3S0CCDAAKhKq6MLLn8oAAAAASUVORK5CYII="/><element name="fullscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAE5JREFUeNpiYBgFo2DQA0YC8v/xqP1PjDlMRDrEgUgxkgHIlfZoriVGjmzLsLFHAW2D6D8eA/9Tw7L/BAwgJE90PvhPpNgoGAVDEQAEGAAMdhTyXcPKcAAAAABJRU5ErkJggg=="/><element name="normalscreenButton" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEZJREFUeNpiYBgFo2DIg/9UUkOUAf8JiFFsyX88fJyAkcQgYMQjNkzBoAgiezyRbE+tFGSPxQJ7auYBmma0UTAKBhgABBgAJAEY6zON61sAAAAASUVORK5CYII="/></elements></component><component name="display"><elements><element name="background" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC"/><element name="playIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg=="/><element name="muteIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHJJREFUeNrs1jEOgCAMBVAg7t5/8qaoIy4uoobyXsLCxA+0NCUAAADGUWvdQoQ41x4ixNBB2hBvBskdD3w5ZCkl3+33VqI0kjBBlh9rp+uTcyOP33TnolfsU85XX3yIRpQph8ZQY3wTZtU5AACASA4BBgDHoVuY1/fvOQAAAABJRU5ErkJggg=="/><element name="errorIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAWlJREFUeNrsl+1twjAQhsHq/7BBYQLYIBmBDcoGMAIjtBPQTcII2SDtBDBBwrU6pGsUO7YbO470PtKJkz9iH++d4ywWAAAAAABgljRNsyWr2bZzDuJG1rLdZhcMbTjrBCGDyUKsqQLFciJb9bSvuG/WagRVRUVUI6gqy5HVeKWfSgRyJruKIU//TrZTSn2nmlaXThrloi/v9F2STC1W4+Aw5cBzkquRc09bofFNc6YLxEON0VUZS5FPTftO49vMjRsIF3RhOGr7/D/pJw+FKU+q0vDyq8W42jCunDqI3LC5XxNj2wHLU1XjaRnb0Lhykhqhhd8MtSF5J9tbjCv4mXGvKJz/65FF/qJryyaaIvzP2QRxZTX2nTuXjvV/VPFSwyLnW7mpH99yTh1FEVro6JBSd40/pMrRdV8vPtcKl28T2pT8TnFZ4yNosct3Q0io6JfBiz1FlGdqVQH3VHnepAEAAAAAADDzEGAAcTwB10jWgxcAAAAASUVORK5CYII="/><element name="bufferIcon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAuhJREFUeNrsWr9rU1EUznuNGqvFQh1ULOhiBx0KDtIuioO4pJuik3FxFfUPaAV1FTdx0Q5d2g4FFxehTnEpZHFoBy20tCIWtGq0TZP4HfkeHB5N8m6Sl/sa74XDybvv3vvOd8/Pe4lXrVZT3dD8VJc0B8QBcUAcEAfESktHGeR5XtMfqFQq/f92zPe/NbtGlKTdCY30kuxrpMGO94BlQCXs+rbh3ONgA6BlzP1p20d80gEI5hmA2A92Qua1Q2PtAFISM+bvjMG8U+Q7oA3rQGASwrYCU6WpNdLGYbA+Pq5jjXIiwi8EEa2UDbQSaKOIuV+SlkcCrfjY8XTI9EpKGwP0C2kru2hLtHqa4zoXtZRWyvi4CLwv9Opr6Hkn6A9HKgEANsQ1iqC3Ub/vRUk2JgmRkatK36kVrnt0qObunwUdUUMXMWYpakJsO5Am8tAw2GBIgwWA+G2S2dMpiw0gDioQRQJoKhRb1QiDwlHZUABYbaXWsm5ae6loTE4ZDxN4CZar8foVzOJ2iyZ2kWF3t7YIevffaMT5yJ70kQb2fQ1sE5SHr2wazs2wgMxgbsEKEAgxAvZUJbQLBGTSBMgNrncJbA6AljtS/eKDJ0Ez+DmrQEzXS2h1Ck25kAg0IZcUOaydCy4sYnN2fOA+2AP16gNoHALlQ+fwH7XO4CxLenUpgj4xr6ugY2roPMbMx+Xs18m/E8CVEIhxsNeg83XWOAN6grG3lGbk8uE5fr4B/WH3cJw+co/l9nTYsSGYCJ/lY5/qv0thn6nrIWmjeJcPSnWOeY++AkF8tpJHIMAUs/MaBBpj3znZfQo5psY+ZrG4gv5HickjEOymKjEeRpgyST6IuZcTcWbnjcgdPi5ghxciRKsl1lDSsgwA1i8fssonJgzmTSqfGUkCENndNdAL7PS6QQ7ZYISTo+1qq0LEWjTWcvY4isa4z+yfQB+7ooyHVg5RI7/i1Ijn/vnggDggDogD4oC00P4KMACd/juEHOrS4AAAAABJRU5ErkJggg=="/></elements></component><component name="dock"><elements><element name="button" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFBJREFUeNrs0cEJACAQA8Eofu0fu/W6EM5ZSAFDRpKTBs00CQQEBAQEBAQEBAQEBAQEBATkK8iqbY+AgICAgICAgICAgICAgICAgIC86QowAG5PAQzEJ0lKAAAAAElFTkSuQmCC"/></elements></component><component name="playlist"><elements><element name="item" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAIAAAC1nk4lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHhJREFUeNrs2NEJwCAMBcBYuv/CFuIE9VN47WWCR7iocXR3pdWdGPqqwIoMjYfQeAiNh9B4JHc6MHQVHnjggQceeOCBBx77TifyeOY0iHi8DqIdEY8dD5cL094eePzINB5CO/LwcOTptNB4CP25L4TIbZzpU7UEGAA5wz1uF5rF9AAAAABJRU5ErkJggg=="/><element name="sliderRail" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADhJREFUeNrsy6ENACAMAMHClp2wYxZLAg5Fcu9e3OjuOKqqfTMzbs14CIZhGIZhGIZhGP4VLwEGAK/BBnVFpB0oAAAAAElFTkSuQmCC"/><element name="sliderThumb" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8CAIAAADpFA0BAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADRJREFUeNrsy7ENACAMBLE8++8caFFKKiRffU53112SGs3ttOohGIZhGIZhGIZh+Fe8BRgAiaUGde6NOSEAAAAASUVORK5CYII="/></elements></component></components></skin>';
		this.xml = null;
		
		//http://www.w3schools.com/Dom/dom_parser.asp 
		if (window.DOMParser) {
			parser = new DOMParser();
			this.xml = parser.parseFromString(this.text, "text/xml");
		} else {
			//IE
			this.xml = new ActiveXObject("Microsoft.XMLDOM");
			this.xml.async = "false";
			this.xml.loadXML(this.text);
		}
		return this;
	};
	
})(jwplayer);
/**
 * JW Player display component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {
	_utils = jwplayer.utils;
	_css = _utils.css;
	
	_hide = function(element) {
		_css(element, {
			display: "none"
		});
	};
	
	_show = function(element) {
		_css(element, {
			display: "block"
		});
	};
	
	jwplayer.html5.display = function(api, config) {
		var _defaults = {
			icons: true,
			showmute: false
		}
		var _config = _utils.extend({}, _defaults, config);
		var _api = api;
		var _display = {};
		var _width;
		var _height;
		var _imageWidth;
		var _imageHeight;
		var _degreesRotated;
		var _rotationInterval;
		var _error;
		var _bufferRotation = !_utils.exists(_api.skin.getComponentSettings("display").bufferrotation) ? 15 : parseInt(_api.skin.getComponentSettings("display").bufferrotation, 10);
		var _bufferInterval = !_utils.exists(_api.skin.getComponentSettings("display").bufferinterval) ? 100 : parseInt(_api.skin.getComponentSettings("display").bufferinterval, 10);
		var _updateTimeout = -1;
		var _lastState = "";
		var _showing = true;
		var _lastSent;
		var _hiding = false;
		var _ready = false;
		
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		_utils.extend(this, _eventDispatcher);
		
		var _elements = {
			display: {
				style: {
					cursor: "pointer",
					top: 0,
					left: 0,
					overflow: "hidden"
				},
				click: _displayClickHandler
			},
			display_icon: {
				style: {
					cursor: "pointer",
					position: "absolute",
					top: ((_api.skin.getSkinElement("display", "background").height - _api.skin.getSkinElement("display", "playIcon").height) / 2),
					left: ((_api.skin.getSkinElement("display", "background").width - _api.skin.getSkinElement("display", "playIcon").width) / 2),
					border: 0,
					margin: 0,
					padding: 0,
					zIndex: 3,
					display: "none"
				}
			},
			display_iconBackground: {
				style: {
					cursor: "pointer",
					position: "absolute",
					top: ((_height - _api.skin.getSkinElement("display", "background").height) / 2),
					left: ((_width - _api.skin.getSkinElement("display", "background").width) / 2),
					border: 0,
					backgroundImage: (["url(", _api.skin.getSkinElement("display", "background").src, ")"]).join(""),
					width: _api.skin.getSkinElement("display", "background").width,
					height: _api.skin.getSkinElement("display", "background").height,
					margin: 0,
					padding: 0,
					zIndex: 2,
					display: "none"
				}
			},
			display_image: {
				style: {
					display: "none",
					width: _width,
					height: _height,
					position: "absolute",
					cursor: "pointer",
					left: 0,
					top: 0,
					margin: 0,
					padding: 0,
					textDecoration: "none",
					zIndex: 1
				}
			},
			display_text: {
				style: {
					zIndex: 4,
					position: "relative",
					opacity: 0.8,
					backgroundColor: parseInt("000000", 16),
					color: parseInt("ffffff", 16),
					textAlign: "center",
					fontFamily: "Arial,sans-serif",
					padding: "0 5px",
					fontSize: 14
				}
			}
		};
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, _stateHandler);
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _stateHandler);
		_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_ERROR, _errorHandler);
		_setupDisplay();
		
		function _setupDisplay() {
			_display.display = createElement("div", "display");
			_display.display_text = createElement("div", "display_text");
			_display.display.appendChild(_display.display_text);
			_display.display_image = createElement("img", "display_image");
			_display.display_image.onerror = function(evt) {
				_hide(_display.display_image);
			};
			_display.display_image.onload = _onImageLoad;
			_display.display_icon = createElement("div", "display_icon");
			_display.display_iconBackground = createElement("div", "display_iconBackground");
			_display.display.appendChild(_display.display_image);
			_display.display_iconBackground.appendChild(_display.display_icon);
			_display.display.appendChild(_display.display_iconBackground);
			_setupDisplayElements();
			
			setTimeout((function() {
				_ready = true;
				if (_config.icons.toString() == "true") {
					_sendShow();
				}
			}), 1);
		}
		
		
		this.getDisplayElement = function() {
			return _display.display;
		};
		
		this.resize = function(width, height) {
			_css(_display.display, {
				width: width,
				height: height
			});
			_css(_display.display_text, {
				width: (width - 10),
				top: ((height - _display.display_text.getBoundingClientRect().height) / 2)
			});
			_css(_display.display_iconBackground, {
				top: ((height - _api.skin.getSkinElement("display", "background").height) / 2),
				left: ((width - _api.skin.getSkinElement("display", "background").width) / 2)
			});
			if (_width != width || _height != height) {
				_width = width;
				_height = height;
				_lastSent = undefined;
				_sendShow();
			}
			_stretch();
			_stateHandler({});
		};
		
		this.show = function() {
			if (_hiding) {
				_hiding = false;
				_lastSent = undefined;
				_showDisplayIcon();
			}
		}

		this.hide = function() {
			if (!_hiding) {
				_lastSent = undefined;
				_hideDisplayIcon();
				_hiding = true;
			}
		}

		function _onImageLoad(evt) {
			_imageWidth = _display.display_image.naturalWidth;
			_imageHeight = _display.display_image.naturalHeight;
			_stretch();
		}
		
		function _stretch() {
			_utils.stretch(_api.jwGetStretching(), _display.display_image, _width, _height, _imageWidth, _imageHeight);
		};
		
		function createElement(tag, element) {
			var _element = document.createElement(tag);
			_element.id = _api.id + "_jwplayer_" + element;
			_css(_element, _elements[element].style);
			return _element;
		}
		
		
		function _setupDisplayElements() {
			for (var element in _display) {
				if (_utils.exists(_elements[element].click)) {
					_display[element].onclick = _elements[element].click;
				}
			}
		}
		
		
		function _displayClickHandler(evt) {
			if (typeof evt.preventDefault != "undefined") {
				evt.preventDefault(); // W3C
			} else {
				evt.returnValue = false; // IE
			}
			if (_api.jwGetState() != jwplayer.api.events.state.PLAYING) {
				_api.jwPlay();
			} else {
				_api.jwPause();
			}
		}
		
		
		function _setDisplayIcon(newIcon) {
			if (_error) {
				_hideDisplayIcon();
				return;
			}
			_display.display_icon.style.backgroundImage = (["url(", _api.skin.getSkinElement("display", newIcon).src, ")"]).join("");
			_css(_display.display_icon, {
				width: _api.skin.getSkinElement("display", newIcon).width,
				height: _api.skin.getSkinElement("display", newIcon).height,
				top: (_api.skin.getSkinElement("display", "background").height - _api.skin.getSkinElement("display", newIcon).height) / 2,
				left: (_api.skin.getSkinElement("display", "background").width - _api.skin.getSkinElement("display", newIcon).width) / 2
			});
			_showDisplayIcon();
			if (_utils.exists(_api.skin.getSkinElement("display", newIcon + "Over"))) {
				_display.display_icon.onmouseover = function(evt) {
					_display.display_icon.style.backgroundImage = ["url(", _api.skin.getSkinElement("display", newIcon + "Over").src, ")"].join("");
				};
				_display.display_icon.onmouseout = function(evt) {
					_display.display_icon.style.backgroundImage = ["url(", _api.skin.getSkinElement("display", newIcon).src, ")"].join("");
				};
			} else {
				_display.display_icon.onmouseover = null;
				_display.display_icon.onmouseout = null;
			}
		}
		
		function _hideDisplayIcon() {
			if (_config.icons.toString() == "true") {
				_hide(_display.display_icon);
				_hide(_display.display_iconBackground);
				_sendHide();
			}
		}

		function _showDisplayIcon() {
			if (!_hiding && _config.icons.toString() == "true") {
				_show(_display.display_icon);
				_show(_display.display_iconBackground);
				_sendShow();
			}
		}

		function _errorHandler(evt) {
			_error = true;
			_hideDisplayIcon();
			_display.display_text.innerHTML = evt.error;
			_show(_display.display_text);
			_display.display_text.style.top = ((_height - _display.display_text.getBoundingClientRect().height) / 2) + "px";
		}
		
		function _resetPoster() {
			/*
			var oldDisplayImage = _display.display_image;
			_display.display_image = createElement("img", "display_image");
			_display.display_image.onerror = function(evt) {
				_hide(_display.display_image);
			};
			_display.display_image.onload = _onImageLoad;
			_display.display.replaceChild(_display.display_image, oldDisplayImage);
			*/
			_display.display_image.style.display = "none";
		}
		
		function _stateHandler(evt) {
			if ((evt.type == jwplayer.api.events.JWPLAYER_PLAYER_STATE ||
			evt.type == jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM) &&
			_error) {
				_error = false;
				_hide(_display.display_text);
			}
			
			var state = _api.jwGetState();
			if (state == _lastState) {
				return;
			}
			_lastState = state;

			if (_updateTimeout >= 0) {
				clearTimeout(_updateTimeout);
			}

			if (_showing || _api.jwGetState() == jwplayer.api.events.state.PLAYING || _api.jwGetState() == jwplayer.api.events.state.PAUSED) {
				_updateDisplay(_api.jwGetState());
			} else {
				_updateTimeout = setTimeout(_stateCallback(_api.jwGetState()), 300);
			}
		}
		
		function _stateCallback(state) {
			return (function() {
				_updateDisplay(state);
			});
		}
		
		
		function _updateDisplay(state) {
			if (_utils.exists(_rotationInterval)) {
				clearInterval(_rotationInterval);
				_rotationInterval = null;
				_utils.animations.rotate(_display.display_icon, 0);
			}
			switch (state) {
				case jwplayer.api.events.state.BUFFERING:
					if (_utils.isIOS()) {
						_resetPoster();
						_hideDisplayIcon();
					} else {
						if (_api.jwGetPlaylist()[_api.jwGetItem()].provider == "sound") {
							_showImage();
						}
						_degreesRotated = 0;
						_rotationInterval = setInterval(function() {
							_degreesRotated += _bufferRotation;
							_utils.animations.rotate(_display.display_icon, _degreesRotated % 360);
						}, _bufferInterval);
						_setDisplayIcon("bufferIcon");
						_showing = true;
					}
					break;
				case jwplayer.api.events.state.PAUSED:
					if (!_utils.isIOS()) {
						if (_api.jwGetPlaylist()[_api.jwGetItem()].provider != "sound") {
							_css(_display.display_image, {
								background: "transparent no-repeat center center"
							});
						}
						_setDisplayIcon("playIcon");
						_showing = true;
					}
					break;
				case jwplayer.api.events.state.IDLE:
					if (_api.jwGetPlaylist()[_api.jwGetItem()].image) {
						_showImage();
					} else {
						_resetPoster();
					}
					_setDisplayIcon("playIcon");
					_showing = true;
					break;
				default:
					if (_api.jwGetPlaylist()[_api.jwGetItem()].provider == "sound") {
						if (_utils.isIOS()) {
							_resetPoster();
							_showing = false;
						} else {
							_showImage();
						}
					} else {
						_resetPoster();
						_showing = false;
					}
					if (_api.jwGetMute() && _config.showmute) {
						_setDisplayIcon("muteIcon");
					} else {
						_hideDisplayIcon();
					}
					break;
			}
			_updateTimeout = -1;
		}
		
		function _showImage() {
			_css(_display.display_image, {
				display: "block"
			});
			_display.display_image.src = _utils.getAbsolutePath(_api.jwGetPlaylist()[_api.jwGetItem()].image);
		}
		
		
		function _sendVisibilityEvent(eventType) {
			return function() {
				if (!_ready) return;
					
				if (!_hiding && _lastSent != eventType) {
					_lastSent = eventType;
					_eventDispatcher.sendEvent(eventType, {
						component: "display",
						boundingRect: _utils.getDimensions(_display.display_iconBackground)
					});
				}
			}
		}

		var _sendShow = _sendVisibilityEvent(jwplayer.api.events.JWPLAYER_COMPONENT_SHOW);
		var _sendHide = _sendVisibilityEvent(jwplayer.api.events.JWPLAYER_COMPONENT_HIDE);

		
		return this;
	};
	
	
	
})(jwplayer);
/**
 * JW Player dock component
 */
(function(jwplayer) {

	_css = jwplayer.utils.css; 
	
	jwplayer.html5.dock = function(api, config) {
		function _defaults() {
			return {
				align: jwplayer.html5.view.positions.RIGHT
			};
		};
		
		var _config = jwplayer.utils.extend({}, _defaults(), config);
		
		if (_config.align == "FALSE") {
			return;
		}
		var _buttons = {};
		var _buttonArray = [];
		var _width;
		var _height;
		var _hiding = false;
		var _fullscreen = false;
		var _dimensions = { x: 0, y: 0, width: 0, height: 0 };
		var _lastSent;
		
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		_utils.extend(this, _eventDispatcher);
		
		var _dock = document.createElement("div");
		_dock.id = api.id + "_jwplayer_dock";
		
		this.getDisplayElement = function() {
			return _dock;
		};
		
		this.setButton = function(id, handler, outGraphic, overGraphic) {
			if (!handler && _buttons[id]) {
				jwplayer.utils.arrays.remove(_buttonArray, id);
				_dock.removeChild(_buttons[id].div);
				delete _buttons[id];
			} else if (handler) {
				if (!_buttons[id]) {
					_buttons[id] = {
					}
				}
				_buttons[id].handler = handler;
				_buttons[id].outGraphic = outGraphic;
				_buttons[id].overGraphic = overGraphic;
				if (!_buttons[id].div) {
					_buttonArray.push(id);
					_buttons[id].div = document.createElement("div");
					_buttons[id].div.style.position = "relative";
					_dock.appendChild(_buttons[id].div);
					
					_buttons[id].div.appendChild(document.createElement("img"));
					_buttons[id].div.childNodes[0].style.position = "absolute";
					_buttons[id].div.childNodes[0].style.left = 0;
					_buttons[id].div.childNodes[0].style.top = 0;
					_buttons[id].div.childNodes[0].style.zIndex = 10;
					_buttons[id].div.childNodes[0].style.cursor = "pointer";
					
					_buttons[id].div.appendChild(document.createElement("img"));
					_buttons[id].div.childNodes[1].style.position = "absolute";
					_buttons[id].div.childNodes[1].style.left = 0;
					_buttons[id].div.childNodes[1].style.top = 0;
					if (api.skin.getSkinElement("dock", "button")) {
						_buttons[id].div.childNodes[1].src = api.skin.getSkinElement("dock", "button").src;
					}
					_buttons[id].div.childNodes[1].style.zIndex = 9;
					_buttons[id].div.childNodes[1].style.cursor = "pointer";
					
					_buttons[id].div.onmouseover = function() {
						if (_buttons[id].overGraphic) {
							_buttons[id].div.childNodes[0].src = _buttons[id].overGraphic;
						}
						if (api.skin.getSkinElement("dock", "buttonOver")) {
							_buttons[id].div.childNodes[1].src = api.skin.getSkinElement("dock", "buttonOver").src;
						}
					}
					
					_buttons[id].div.onmouseout = function() {
						if (_buttons[id].outGraphic) {
							_buttons[id].div.childNodes[0].src = _buttons[id].outGraphic;
						}
						if (api.skin.getSkinElement("dock", "button")) {
							_buttons[id].div.childNodes[1].src = api.skin.getSkinElement("dock", "button").src;
						}
					}
					// Make sure that this gets loaded and is cached so that rollovers are smooth
					if (_buttons[id].overGraphic) {
						_buttons[id].div.childNodes[0].src = _buttons[id].overGraphic;
					}
					if (_buttons[id].outGraphic) {
						_buttons[id].div.childNodes[0].src = _buttons[id].outGraphic;
					}
					if (api.skin.getSkinElement("dock", "button")) {
						_buttons[id].div.childNodes[1].src = api.skin.getSkinElement("dock", "button").src;
					}
				}
				
				if (handler) {
					_buttons[id].div.onclick = function(evt) {
						evt.preventDefault();
						jwplayer(api.id).callback(id);
						if (_buttons[id].overGraphic) {
							_buttons[id].div.childNodes[0].src = _buttons[id].overGraphic;
						}
						if (api.skin.getSkinElement("dock", "button")) {
							_buttons[id].div.childNodes[1].src = api.skin.getSkinElement("dock", "button").src;
						}
					}
				}
			}
			
			_resize(_width, _height);
		}
		
		function _resize(width, height) {
			if (_buttonArray.length > 0) {
				var margin = 10;
				var usedHeight = margin;
				var direction = -1;
				var buttonHeight = api.skin.getSkinElement("dock", "button").height;
				var buttonWidth = api.skin.getSkinElement("dock", "button").width;
				var xStart = width - buttonWidth - margin;
				var topLeft, bottomRight;
				if (_config.align == jwplayer.html5.view.positions.LEFT) {
					direction = 1;
					xStart = margin;
				}
				for (var i = 0; i < _buttonArray.length; i++) {
					var row = Math.floor(usedHeight / height);
					if ((usedHeight + buttonHeight + margin) > ((row + 1) * height)) {
						usedHeight = ((row + 1) * height) + margin;
						row = Math.floor(usedHeight / height);
					}
					var button = _buttons[_buttonArray[i]].div;
					button.style.top = (usedHeight % height) + "px";
					button.style.left = (xStart + (api.skin.getSkinElement("dock", "button").width + margin) * row * direction) + "px";
					var buttonDims = {
						x: jwplayer.utils.parseDimension(button.style.left),
						y: jwplayer.utils.parseDimension(button.style.top),
						width: buttonWidth,
						height: buttonHeight
					}
					if (!topLeft || (buttonDims.x <= topLeft.x && buttonDims.y <= topLeft.y))
						topLeft = buttonDims;
					if (!bottomRight || (buttonDims.x >= bottomRight.x && buttonDims.y >= bottomRight.y))
						bottomRight = buttonDims;
					
					usedHeight += api.skin.getSkinElement("dock", "button").height + margin;
				}
				_dimensions = {
					x: topLeft.x,
					y:  topLeft.y,
					width: bottomRight.x - topLeft.x + bottomRight.width,
					height: topLeft.y - bottomRight.y + bottomRight.height
				};
			}
			
			if (_fullscreen != api.jwGetFullscreen() || _width != width || _height != height) {
				_width = width;
				_height = height;
				_fullscreen = api.jwGetFullscreen();
				_lastSent = undefined;
				// Delay to allow resize event handlers to complete
				setTimeout(_sendShow, 1);
			}
			
		}
		
		function _sendVisibilityEvent(eventType) {
			return function() {
				if (!_hiding && _lastSent != eventType && _buttonArray.length > 0) {
					_lastSent = eventType;
					_eventDispatcher.sendEvent(eventType, {
						component: "dock",
						boundingRect: _dimensions
					});
				}
			}
		}

		var _sendShow = _sendVisibilityEvent(jwplayer.api.events.JWPLAYER_COMPONENT_SHOW);
		var _sendHide = _sendVisibilityEvent(jwplayer.api.events.JWPLAYER_COMPONENT_HIDE);

		this.resize = _resize;
		
		this.show = function() {
			_css(_dock, {
				display: "block"
			});
			if (_hiding) {
				_hiding = false;
				_sendShow();
			}
		}

		this.hide = function() {
			_css(_dock, {
				display: "none"
			});
			if (!_hiding) {
				_sendHide();
				_hiding = true;
			}
			
		}
		
		return this;
	}
})(jwplayer);
/**
 * Event dispatcher for the JW Player for HTML5
 *
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	jwplayer.html5.eventdispatcher = function(id, debug) {
		var _eventDispatcher = new jwplayer.events.eventdispatcher(debug);
		jwplayer.utils.extend(this, _eventDispatcher);
		
		/** Send an event **/
		this.sendEvent = function(type, data) {
			if (!jwplayer.utils.exists(data)) {
				data = {};
			}
			jwplayer.utils.extend(data, {
				id: id,
				version: jwplayer.version,
				type: type
			});
			_eventDispatcher.sendEvent(type, data);
		};
	};
})(jwplayer);
/**
 * JW Player logo component
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

	var _defaults = {
		prefix: "http://l.longtailvideo.com/html5/",
		file: "logo.png",
		link: "http://www.longtailvideo.com/players/jw-flv-player/",
		margin: 8,
		out: 0.5,
		over: 1,
		timeout: 5,
		hide: true,
		position: "bottom-left"
	};
	
	_css = jwplayer.utils.css;
	
	jwplayer.html5.logo = function(api, logoConfig) {
		var _api = api;
		var _timeout;
		var _settings;
		var _logo;
		
		_setup();
		
		function _setup() {
			_setupConfig();
			_setupDisplayElements();
			_setupMouseEvents();
		}
		
		function _setupConfig() {
			if (_defaults.prefix) {
				var version = api.version.split(/\W/).splice(0, 2).join("/");
				if (_defaults.prefix.indexOf(version) < 0) {
					_defaults.prefix += version + "/";
				}
			}
			
			if (logoConfig.position == jwplayer.html5.view.positions.OVER) {
				logoConfig.position = _defaults.position;
			}
			
			_settings = jwplayer.utils.extend({}, _defaults, logoConfig);
		}
		
		function _setupDisplayElements() {
			_logo = document.createElement("img");
			_logo.id = _api.id + "_jwplayer_logo";
			_logo.style.display = "none";
			
			_logo.onload = function(evt) {
				_css(_logo, _getStyle());
				_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
				_outHandler();
			};
			
			if (!_settings.file) {
				return;
			}
			
			if (_settings.file.indexOf("http://") === 0) {
				_logo.src = _settings.file;
			} else {
				_logo.src = _settings.prefix + _settings.file;
			}
		}
		
		if (!_settings.file) {
			return;
		}
		
		
		this.resize = function(width, height) {
		};
		
		this.getDisplayElement = function() {
			return _logo;
		};
		
		function _setupMouseEvents() {
			if (_settings.link) {
				_logo.onmouseover = _overHandler;
				_logo.onmouseout = _outHandler;
				_logo.onclick = _clickHandler;
			} else {
				this.mouseEnabled = false;
			}
		}
		
		
		function _clickHandler(evt) {
			if (typeof evt != "undefined") {
				evt.stopPropagation();
			}
			_api.jwPause();
			_api.jwSetFullscreen(false);
			if (_settings.link) {
				window.open(_settings.link, "_self");
			}
			return;
		}
		
		function _outHandler(evt) {
			if (_settings.link) {
				_logo.style.opacity = _settings.out;
			}
			return;
		}
		
		function _overHandler(evt) {
			if (_settings.hide) {
				_logo.style.opacity = _settings.over;
			}
			return;
		}
		
		function _getStyle() {
			var _imageStyle = {
				textDecoration: "none",
				position: "absolute",
				cursor: "pointer"
			};
			_imageStyle.display = _settings.hide ? "none" : "block";
			var positions = _settings.position.toLowerCase().split("-");
			for (var position in positions) {
				_imageStyle[positions[position]] = _settings.margin;
			}
			return _imageStyle;
		}
		
		function _show() {
			if (_settings.hide) {
				_logo.style.display = "block";
				_logo.style.opacity = 0;
				jwplayer.utils.fadeTo(_logo, _settings.out, 0.1, parseFloat(_logo.style.opacity));
				_timeout = setTimeout(function() {
					_hide();
				}, _settings.timeout * 1000);
			}
		}
		
		function _hide() {
			if (_settings.hide) {
				jwplayer.utils.fadeTo(_logo, 0, 0.1, parseFloat(_logo.style.opacity));
			}
		}
		
		function _stateHandler(obj) {
			if (obj.newstate == jwplayer.api.events.state.BUFFERING) {
				clearTimeout(_timeout);
				_show();
			}
		}
		
		return this;
	};
	
})(jwplayer);
/**
 * JW Player Video Media component
 *
 * @author zach
 * 
 * @version 5.7
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.api.events.state.IDLE,
		"playing": jwplayer.api.events.state.PLAYING,
		"pause": jwplayer.api.events.state.PAUSED,
		"buffering": jwplayer.api.events.state.BUFFERING
	};
	
	var _utils = jwplayer.utils;
	var _css = _utils.css;
	var _isIOS = _utils.isIOS();
	
	jwplayer.html5.mediavideo = function(model, container) {
		var _events = {
			'abort': _generalHandler,
			'canplay': _stateHandler,
			'canplaythrough': _stateHandler,
			'durationchange': _metaHandler,
			'emptied': _generalHandler,
			'ended': _stateHandler,
			'error': _errorHandler,
			'loadeddata': _metaHandler,
			'loadedmetadata': _metaHandler,
			'loadstart': _stateHandler,
			'pause': _stateHandler,
			'play': _positionHandler,
			'playing': _stateHandler,
			'progress': _progressHandler,
			'ratechange': _generalHandler,
			'seeked': _stateHandler,
			'seeking': _stateHandler,
			'stalled': _stateHandler,
			'suspend': _stateHandler,
			'timeupdate': _positionHandler,
			'volumechange': _generalHandler,
			'waiting': _stateHandler,
			'canshowcurrentframe': _generalHandler,
			'dataunavailable': _generalHandler,
			'empty': _generalHandler,
			'load': _loadHandler,
			'loadedfirstframe': _generalHandler
		};
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		_utils.extend(this, _eventDispatcher);
		var _model = model,
			_container = container,
			_video, 
			_state, 
			_start,
			_currentItem,
			_interval,
			_emptied = false,
			_bufferingComplete, _bufferFull,
			_sourceError;
			
		_init();
		
		
		/************************************
		 *           PUBLIC METHODS         * 
		 ************************************/
		
		/** 
		 * Start loading the video and playing
		 */
		this.load = function(item, play) {
			if (typeof play == "undefined") {
				play = true;
			}
			_currentItem = item;
			_utils.empty(_video);

			_sourceError = 0; 

			if (item.levels && item.levels.length > 0) {
				if (item.levels.length == 1) {
					_video.src = item.levels[0].file;
				} else {
					if (_video.src) {
						_video.removeAttribute("src");
					}
					for (var i=0; i < item.levels.length; i++) {
						var src = _video.ownerDocument.createElement("source");
						src.src = item.levels[i].file;
						_video.appendChild(src);
						_sourceError++;
					}
				}
			} else {
				_video.src = item.file;
			}
			if (_isIOS) {
				if (item.image) {
					_video.poster = item.image;
				}
				_video.controls = "controls";
			}
			
			_bufferingComplete = _bufferFull = _start = false;
			_model.buffer = 0;
			
			if (!_utils.exists(item.start)) {
				item.start = 0;
			}
			_model.duration = item.duration;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			if((!_isIOS && item.levels.length == 1) || !_emptied) {
				_video.load();
			}
			_emptied = false;
			
			if (play) {
				_setState(jwplayer.api.events.state.BUFFERING);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: 0
				});
				this.play();
			}
		}
		
		/**
		 * Play the video if paused
		 */
		this.play = function() {
			if (_state != jwplayer.api.events.state.PLAYING) {
				_startInterval();
				_video.play();
				if (_bufferFull) {
					_setState(jwplayer.api.events.state.PLAYING);
				} else {
					_setState(jwplayer.api.events.state.BUFFERING);
				}
			}
		}
		
		/**
		 * Pause the video
		 */
		this.pause = function() {
			_video.pause();
			_setState(jwplayer.api.events.state.PAUSED);
		}
		
		/**
		 * Instruct the video to seek to a position
		 * @param position The requested position, in seconds
		 */
		this.seek = function(position) {
			if (!(_model.duration <= 0 || isNaN(_model.duration)) &&
				!(_model.position <= 0 || isNaN(_model.position))) {
					_video.currentTime = position;
					_video.play();
			}
		}
		
		/**
		 * Stop the playing video and unload it
		 */
		_stop = this.stop = function(clear) {
			if (!_utils.exists(clear)) {
				clear = true;
			}
			_clearInterval();
			if (clear) {
				_video.style.display = "none";
				_bufferFull = false;
				var agent = navigator.userAgent;
				if(agent.match(/chrome/i)) {
					_video.src = undefined;
				} else if(agent.match(/safari/i)) {
					_video.removeAttribute("src");
				} else {
					_video.src = "";
				}
				_video.removeAttribute("controls");
				_video.removeAttribute("poster");
				_utils.empty(_video);
				_video.load();
				_emptied = true;
				if(_video.webkitSupportsFullscreen) {
					try {
						_video.webkitExitFullscreen();
					} catch(err) {}
				}
			}
			_setState(jwplayer.api.events.state.IDLE);
		}
		
		/** Switch the fullscreen state of the player. **/
		this.fullscreen = function(state) {
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
		};

		/** Resize the player. **/
		this.resize = function(width, height) {
			if (false) {
				_css(_container, {
					width: width,
					height: height
				});
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_RESIZE, {
				fullscreen: _model.fullscreen,
				width: width,
				hieght: height
			});
		};
		
		/** Change the video's volume level. **/
		this.volume = function(position) {
			if (!_isIOS) {
				_video.volume = position / 100;
				_model.volume = position;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
					volume: Math.round(position)
				});
			}
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			if (!_isIOS) {
				_video.muted = state;
				_model.mute = state;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, {
					mute: state
				});
			}
		};

		
		/**
		 * Get the visual component
		 */
		this.getDisplayElement = function() {
			return _video;
		}
		
		/**
		 * Whether this media component has its own chrome
		 */
		this.hasChrome = function() {
			return false;
		}
		
		/************************************
		 *           PRIVATE METHODS         * 
		 ************************************/
		
		
		/** Initializes the HTML5 video and audio media provider **/
		function _init() {
			_video = document.createElement("video");
			_state = jwplayer.api.events.state.IDLE;
 
			for (var event in _events) {
				_video.addEventListener(event, function(evt) {
					if (_utils.exists(evt.target.parentNode)) {
						_events[evt.type](evt);
					}
				}, true);
			}

			
			if(_container.parentNode) {
				_container.parentNode.replaceChild(_video, _container);
			}
			
			if (!_video.id) {
				_video.id = _container.id;
			}
		}
		
		/** Set the current player state **/
		function _setState(newstate) {
			// Handles FF 3.5 issue
			if (newstate == jwplayer.api.events.state.PAUSED && _state == jwplayer.api.events.state.IDLE) {
				return;
			}

			if (_state != newstate) {
				var oldstate = _state;
				_model.state = _state = newstate;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
			}
		}
		
		
		/** Handle general <video> tag events **/
		function _generalHandler(event) {
		}
		
		/** Update the player progress **/
		function _progressHandler(event) {
			var bufferPercent;
			if (_utils.exists(event) && event.lengthComputable && event.total) {
				bufferPercent = event.loaded / event.total * 100;
			} else if (_utils.exists(_video.buffered) && (_video.buffered.length > 0)) {
				var maxBufferIndex = _video.buffered.length - 1;
				if (maxBufferIndex >= 0) {
					bufferPercent = _video.buffered.end(maxBufferIndex) / _video.duration * 100;
				}
			}
			
			if (_bufferFull === false && _state == jwplayer.api.events.state.BUFFERING) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
				_bufferFull = true;
			}
			
			if (!_bufferingComplete) {
				if (bufferPercent == 100) {
					_bufferingComplete = true;
				}
				
				if (_utils.exists(bufferPercent) && (bufferPercent > _model.buffer)) {
					_model.buffer = Math.round(bufferPercent);
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
						bufferPercent: Math.round(bufferPercent)
					});
				}
				
			}
		}
		
		/** Update the player's position **/
		function _positionHandler(event) {
			if (_utils.exists(event) && _utils.exists(event.target)) {
				if (_model.duration <= 0 || isNaN(_model.duration)) {
					_model.duration = Math.round(event.target.duration * 10) / 10;
				}
				if (!_start && _video.readyState > 0) {
					_video.style.display = "block";
					_setState(jwplayer.api.events.state.PLAYING);
				}
				if (_state == jwplayer.api.events.state.PLAYING) {
					if (!_start && _video.readyState > 0) {
						_start = true;
						try {
							if (_video.currentTime < _currentItem.start) {
								_video.currentTime = _currentItem.start;
							}
						} catch (err) {}
						_video.volume = _model.volume / 100;
						_video.muted = _model.mute;
					}
					_model.position = Math.round(event.target.currentTime * 10) / 10;
					_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_TIME, {
						position: event.target.currentTime,
						duration: _model.duration
					});
					if (_model.position >= _model.duration && (_model.position > 0 || _model.duration > 0)) {
						_complete();
					}
				}
			}
			_progressHandler(event);
		}

		/** Load handler **/
		function _loadHandler(event) {
		}

		function _stateHandler(event) {
			if (_states[event.type]) {
				if (event.type == "ended") {
					_complete();
				} else {
					_setState(_states[event.type]);
				}
			}
		}

		function _metaHandler(event) {
			var meta = {
					height: event.target.videoHeight,
					width: event.target.videoWidth,
					duration: Math.round(event.target.duration * 10) / 10
				};
			if (_model.duration === 0 || isNaN(_model.duration)) {
				_model.duration = Math.round(event.target.duration * 10) / 10;
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_META, {
				metadata: meta
			});			
		}

		function _errorHandler(event) {
			if (_state == jwplayer.api.events.state.IDLE) {
				return;
			}
			
			var message = "There was an error: ";
			if ((event.target.error && event.target.tagName.toLowerCase() == "video") ||
					event.target.parentNode.error && event.target.parentNode.tagName.toLowerCase() == "video") {
				var element = !_utils.exists(event.target.error) ? event.target.parentNode.error : event.target.error;
				switch (element.code) {
					case element.MEDIA_ERR_ABORTED:
						message = "You aborted the video playback: ";
						break;
					case element.MEDIA_ERR_NETWORK:
						message = "A network error caused the video download to fail part-way: ";
						break;
					case element.MEDIA_ERR_DECODE:
						message = "The video playback was aborted due to a corruption problem or because the video used features your browser did not support: ";
						break;
					case element.MEDIA_ERR_SRC_NOT_SUPPORTED:
						message = "The video could not be loaded, either because the server or network failed or because the format is not supported: ";
						break;
					default:
						message = "An unknown error occurred: ";
						break;
				}
			} else if (event.target.tagName.toLowerCase() == "source") {
				_sourceError--;
				if (_sourceError > 0) {
					return;
				}
				message = "The video could not be loaded, either because the server or network failed or because the format is not supported: ";
			} else {
				_utils.log("An unknown error occurred.  Continuing...");
				return;
			}
			_stop(false);
			message += _joinFiles();
			_error = true;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
				error: message
			});
			return;		
		}
		
		
		function _joinFiles() {
			var result = "";
			for (var sourceIndex in _currentItem.levels) {
				var sourceModel = _currentItem.levels[sourceIndex];
				var source = _container.ownerDocument.createElement("source");
				result += jwplayer.utils.getAbsolutePath(sourceModel.file);
				if (sourceIndex < (_currentItem.levels.length - 1)) {
					result += ", ";
				}
			}
			return result;
		}
		
		function _startInterval() {
			if (!_utils.exists(_interval)) {
				_interval = setInterval(function() {
					_progressHandler();
				}, 100);
			}
		}
		
		function _clearInterval() {
			clearInterval(_interval);
			_interval = null;
		}
		
		function _complete() {
			if (_state != jwplayer.api.events.state.IDLE) {
				_stop(false);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE);
			}
		}
		

	};
})(jwplayer);
/**
 * JW Player YouTube Media component
 *
 * @author pablo
 * @version 5.7
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.api.events.state.IDLE,
		"playing": jwplayer.api.events.state.PLAYING,
		"pause": jwplayer.api.events.state.PAUSED,
		"buffering": jwplayer.api.events.state.BUFFERING
	};
	
	var _css = jwplayer.utils.css;
	
	jwplayer.html5.mediayoutube = function(model, container) {
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		var _model = model;
		var _container = document.getElementById(container.id);
		var _state = jwplayer.api.events.state.IDLE;
		var _object, _embed;
		
		_init();
		
		function _setState(newstate) {
			if (_state != newstate) {
				var oldstate = _state;
				_model.state = newstate;
				_state = newstate;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
			}
		}
		
		this.getDisplayElement = function() {
			return _container;
		};
		
		this.play = function() {
			if (_state == jwplayer.api.events.state.IDLE) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: 100
				});
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
				_setState(jwplayer.api.events.state.PLAYING);
			} else if (_state == jwplayer.api.events.state.PAUSED) {
				_setState(jwplayer.api.events.state.PLAYING);
			}
		};
		
		
		/** Switch the pause state of the player. **/
		this.pause = function() {
			_setState(jwplayer.api.events.state.PAUSED);
		};
		
		
		/** Seek to a position in the video. **/
		this.seek = function(position) {
		};
		
		
		/** Stop playback and loading of the video. **/
		this.stop = function(clear) {
			if (!_utils.exists(clear)) {
				clear = true;
			}
			_model.position = 0;
			_setState(jwplayer.api.events.state.IDLE);
			if (clear) {
				_css(_object, { display: "none" });
//				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			}
		}
		
		/** Change the video's volume level. **/
		this.volume = function(position) {
			_model.volume = position;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(position)
			});
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			_container.muted = state;
			_model.mute = state;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, {
				mute: state
			});
		};
		
		
		/** Resize the player. **/
		this.resize = function(width, height) {
			if (width * height > 0) {
				_object.width = _embed.width = width;
				_object.height = _embed.height = height;
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_RESIZE, {
				fullscreen: _model.fullscreen,
				width: width,
				height: height
			});
		};
		
		
		/** Switch the fullscreen state of the player. **/
		this.fullscreen = function(state) {
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
		};
		
		
		/** Load a new video into the player. **/
		this.load = function(playlistItem) {
			_css(_object, { display: "block" });
			_embedItem(playlistItem);
			_setState(jwplayer.api.events.state.BUFFERING);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
				bufferPercent: 0
			});
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			this.play();
		};
		
		this.hasChrome = function() {
			return (_state != jwplayer.api.events.state.IDLE);
		};
		
		function _embedItem(playlistItem) {
			var path = playlistItem.levels[0].file;
			path = ["http://www.youtube.com/v/", _getYouTubeID(path), "&amp;hl=en_US&amp;fs=1&autoplay=1"].join("");
			var objectParams = {
				movie: path,
				allowfullscreen: "true",
				allowscriptaccess: "always"
			};
			
			_object.innerHTML = "";
			
			for (var objectParam in objectParams) {
				var param = document.createElement("param");
				param.name = objectParam;
				param.value = objectParams[objectParam];
				_object.appendChild(param);
			}
			
			var embedParams = {
				src: path,
				type: "application/x-shockwave-flash",
				allowfullscreen: "true",
				allowscriptaccess: "always",
				width: _object.width,
				height: _object.height
			};
			for (var embedParam in embedParams) {
				_embed.setAttribute(embedParam, embedParams[embedParam]);
			}
			_object.appendChild(_embed);
			_object.style.zIndex = 2147483000;
		}
		
		function _init() {
			_object = document.createElement("object");
			_object.id = _container.id;
			
			_object.style.position = "absolute";
			_object.width = _model.config.width;
			_object.height = _model.config.height;

			if (_container.parentNode) {
				_container.parentNode.replaceChild(_object, _container);
			}
			_container = _object;
			
			_embed = document.createElement("embed");
			_object.appendChild(_embed);

			if (jwplayer.utils.isIOS() && _model.playlist && _model.playlist[_model.item]) {
				_embedItem(_model.playlist[_model.item]);
			}
		}
		
		
		/** Extract the current ID from a youtube URL.  Supported values include:
		 * http://www.youtube.com/watch?v=ylLzyHk54Z0
		 * http://www.youtube.com/watch#!v=ylLzyHk54Z0
		 * http://www.youtube.com/v/ylLzyHk54Z0
		 * http://youtu.be/ylLzyHk54Z0
		 * ylLzyHk54Z0
		 **/
		function _getYouTubeID(url) {
			var arr = url.split(/\?|\#\!/);
			var str = '';
			for (var i=0; i<arr.length; i++) {
				if (arr[i].substr(0, 2) == 'v=') {
					str = arr[i].substr(2);
				}
			}
			if (str == '') {
				if (url.indexOf('/v/') >= 0) {
					str = url.substr(url.indexOf('/v/') + 3);
				} else if (url.indexOf('youtu.be') >= 0) {
					str = url.substr(url.indexOf('youtu.be/') + 9);
				} else {
					str = url;
				}
			}
			if (str.indexOf('?') > -1) {
				str = str.substr(0, str.indexOf('?'));
			}
			if (str.indexOf('&') > -1) {
				str = str.substr(0, str.indexOf('&'));
			}
			
			return str;
		}
		
		this.embed = _embed;
		
		return this;
	};
})(jwplayer);
/**
 * JW Player model component
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {
	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen", "item", "plugins", "stretching"];
	
	jwplayer.html5.model = function(api, container, options) {
		var _api = api;
		var _container = container;
		var _model = {
			id: _container.id,
			playlist: [],
			state: jwplayer.api.events.state.IDLE,
			position: 0,
			buffer: 0,
			config: {
				width: 480,
				height: 320,
				item: -1,
				skin: undefined,
				file: undefined,
				image: undefined,
				start: 0,
				duration: 0,
				bufferlength: 5,
				volume: 90,
				mute: false,
				fullscreen: false,
				repeat: "",
				stretching: jwplayer.utils.stretching.UNIFORM,
				autostart: false,
				debug: undefined,
				screencolor: undefined
			}
		};
		var _media;
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		var _components = ["display", "logo", "playlist", "controlbar", "dock"];
		
		jwplayer.utils.extend(_model, _eventDispatcher);
		
		for (var option in options) {
			if (typeof options[option] == "string") {
				var type = /color$/.test(option) ? "color" : null;
				options[option] = jwplayer.utils.typechecker(options[option], type);
			}
			var config = _model.config;
			var path = option.split(".");
			for (var edge in path) {
				if (edge == path.length - 1) {
					config[path[edge]] = options[option];
				} else {
					if (!jwplayer.utils.exists(config[path[edge]])) {
						config[path[edge]] = {};
					}
					config = config[path[edge]];
				}
			}
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			_model[configurableStateVariable] = _model.config[configurableStateVariable];
		}
		
		var pluginorder = _components.concat([]);
		
		if (jwplayer.utils.exists(_model.plugins)) {
			if (typeof _model.plugins == "string") {
				var userplugins = _model.plugins.split(",");
				for (var userplugin in userplugins) {
					if (typeof userplugins[userplugin] == "string") {
						pluginorder.push(userplugins[userplugin].replace(/^\s+|\s+$/g, ""));
					}
				}
			}
		}
		
		if (typeof _model.config.chromeless == "undefined" && jwplayer.utils.isIPod()) {
			_model.config.chromeless = true;
		}
		
		
		if (jwplayer.utils.isIPad()) {
			pluginorder = ["logo","display","playlist"];
			if (!jwplayer.utils.exists(_model.config.repeat)) {
				_model.config.repeat = "list";
			}
		} else if (_model.config.chromeless) {
			pluginorder = ["logo","playlist"];
			if (!jwplayer.utils.exists(_model.config.repeat)) {
				_model.config.repeat = "list";
			}
		}
		
		_model.plugins = {
			order: pluginorder,
			config: {},
			object: {}
		};
		
		if (typeof _model.config.components != "undefined") {
			for (var component in _model.config.components) {
				_model.plugins.config[component] = _model.config.components[component];
			}
		}
		
		for (var pluginIndex in _model.plugins.order) {
			var pluginName = _model.plugins.order[pluginIndex];
			var pluginConfig = !jwplayer.utils.exists(_model.plugins.config[pluginName]) ? {} : _model.plugins.config[pluginName];
			_model.plugins.config[pluginName] = !jwplayer.utils.exists(_model.plugins.config[pluginName]) ? pluginConfig : jwplayer.utils.extend(_model.plugins.config[pluginName], pluginConfig);
			if (!jwplayer.utils.exists(_model.plugins.config[pluginName].position)) {
				if (pluginName == "playlist") {
					_model.plugins.config[pluginName].position = jwplayer.html5.view.positions.NONE;
				} else {
					_model.plugins.config[pluginName].position = jwplayer.html5.view.positions.OVER;
				}
			} else {
				_model.plugins.config[pluginName].position = _model.plugins.config[pluginName].position.toString().toUpperCase();
			}
		}
		
		// Fix the dock
		if (typeof _model.plugins.config.dock != "undefined") {
			if (typeof _model.plugins.config.dock != "object") {
				var position = _model.plugins.config.dock.toString().toUpperCase();
				_model.plugins.config.dock = {
					position: position
				}
			}
			
			if (typeof _model.plugins.config.dock.position != "undefined") {
				_model.plugins.config.dock.align = _model.plugins.config.dock.position;
				_model.plugins.config.dock.position = jwplayer.html5.view.positions.OVER;
			}
		}
		
		function _loadExternal(playlistfile) {
			var loader = new jwplayer.html5.playlistloader();
			loader.addEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, function(evt) {
				_model.playlist = new jwplayer.html5.playlist(evt);
				_loadComplete(true);
			});
			loader.addEventListener(jwplayer.api.events.JWPLAYER_ERROR, function(evt) {
				_model.playlist = new jwplayer.html5.playlist({playlist:[]});
				_loadComplete(false);
			});
			loader.load(playlistfile);
		}
		
		function _loadComplete() {
			if (_model.config.shuffle) {
				_model.item = _getShuffleItem();
			} else {
				if (_model.config.item >= _model.playlist.length) {
					_model.config.item = _model.playlist.length - 1;
				} else if (_model.config.item < 0) {
					_model.config.item = 0;
				}
				_model.item = _model.config.item;
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, {
				"playlist": _model.playlist
			});
			if (_model.playlist[_model.item].file || _model.playlist[_model.item].levels[0].file) {
				_model.setActiveMediaProvider(_model.playlist[_model.item]);
			}
		}
		
		_model.loadPlaylist = function(arg) {
			var input;
			if (typeof arg == "string") {
				try {
					input = eval(arg);
				} catch (err) {
					input = arg;
				}
			} else {
				input = arg;
			}
			var config;
			switch (jwplayer.utils.typeOf(input)) {
				case "object":
					config = input;
					break;
				case "array":
					config = {
						playlist: input
					};
					break;
				default:
					_loadExternal(input);
					return;
					break;
			}
			_model.playlist = new jwplayer.html5.playlist(config);
			if (jwplayer.utils.extension(_model.playlist[0].file) == "xml" ) {
				_loadExternal(_model.playlist[0].file);
			} else {
				_loadComplete();
			}
		};
		
		function _getShuffleItem() {
			var result = null;
			if (_model.playlist.length > 1) {
				while (!jwplayer.utils.exists(result)) {
					result = Math.floor(Math.random() * _model.playlist.length);
					if (result == _model.item) {
						result = null;
					}
				}
			} else {
				result = 0;
			}
			return result;
		}
		
		function forward(evt) {
			if (evt.type == jwplayer.api.events.JWPLAYER_MEDIA_LOADED) {
				_container = _media.getDisplayElement();
			}
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		var _mediaProviders = {};
		
		_model.setActiveMediaProvider = function(playlistItem) {
			if (playlistItem.provider == "audio") {
				playlistItem.provider = "sound";
			}
			var provider = playlistItem.provider;
			var current = _media ? _media.getDisplayElement() : null; 
			
			if (provider == "sound" || provider == "http" || provider == "") {
				provider = "video";
			}
			
			if (!jwplayer.utils.exists(_mediaProviders[provider])) {
				switch (provider) {
				case "video":
					_media = new jwplayer.html5.mediavideo(_model, current ? current : _container);
					break;
				case "youtube":
					_media = new jwplayer.html5.mediayoutube(_model, current ? current : _container);
					break;
				}
				if (!jwplayer.utils.exists(_media)) {
					return false;
				}
				_media.addGlobalListener(forward);
				_mediaProviders[provider] = _media;
			} else {
				if (_media != _mediaProviders[provider]) {
					if (_media) {
						_media.stop();
					}
					_media = _mediaProviders[provider];
				}
			}
			
			if (_model.config.chromeless) {
				_media.load(playlistItem, false);
			}
			return true;
		};
		
		_model.getMedia = function() {
			return _media;
		};
		
		_model.seek = function(pos) {
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_SEEK, {
				"position": _model.position,
				"offset": pos
			});
			return _media.seek(pos);
		};

		
		
		_model.setupPlugins = function() {
			for (var plugin in _model.plugins.order) {
				try {
					var pluginName = _model.plugins.order[plugin];
					if (jwplayer.utils.exists(jwplayer.html5[pluginName])) {
						if (pluginName == "playlist") {
							_model.plugins.object[pluginName] = new jwplayer.html5.playlistcomponent(_api, _model.plugins.config[pluginName]);
						} else {
							_model.plugins.object[pluginName] = new jwplayer.html5[pluginName](_api, _model.plugins.config[pluginName]);
						}
					} else {
						_model.plugins.order.splice(plugin, plugin + 1);
					}
					if (typeof _model.plugins.object[pluginName].addGlobalListener == "function") {
						_model.plugins.object[pluginName].addGlobalListener(forward);
					}
				} catch (err) {
					jwplayer.utils.log("Could not setup " + pluginName);
				}
			}
			
		};
		
		return _model;
	};
	
	
})(jwplayer);
/**
 * JW Player playlist model
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.html5.playlist = function(config) {
		var _playlist = [];
		if (config.playlist && config.playlist instanceof Array && config.playlist.length > 0) {
			for (var playlistItem in config.playlist) {
				if (!isNaN(parseInt(playlistItem))){
					_playlist.push(new jwplayer.html5.playlistitem(config.playlist[playlistItem]));
				}
			}
		} else {
			_playlist.push(new jwplayer.html5.playlistitem(config));
		}
		return _playlist;
	};
	
})(jwplayer);
/**
 * jwplayer Playlist component for the JW Player.
 *
 * @author pablo
 * @version 5.7
 */
(function(jwplayer) {
	var _defaults = {
		size: 180,
		position: jwplayer.html5.view.positions.NONE,
		itemheight: 60,
		thumbs: true,
		
		fontcolor: "#000000",
		overcolor: "",
		activecolor: "",
		backgroundcolor: "#f8f8f8",
		font: "_sans",
		fontsize: "",
		fontstyle: "",
		fontweight: ""
	};

	var _fonts = {
		'_sans': "Arial, Helvetica, sans-serif",
		'_serif': "Times, Times New Roman, serif",
		'_typewriter': "Courier New, Courier, monospace"
	}
	
	_utils = jwplayer.utils; 
	_css = _utils.css;
	
	_hide = function(element) {
		_css(element, {
			display: "none"
		});
	};
	
	_show = function(element) {
		_css(element, {
			display: "block"
		});
	};
	
	jwplayer.html5.playlistcomponent = function(api, config) {
		var _api = api;
		var _settings = jwplayer.utils.extend({}, _defaults, _api.skin.getComponentSettings("playlist"), config);
		if (_settings.position == jwplayer.html5.view.positions.NONE
			|| typeof jwplayer.html5.view.positions[_settings.position] == "undefined") {
			return;
		}
		var _wrapper;
		var _width;
		var _height;
		var _playlist;
		var _items;
		var _ul;
		var _lastCurrent = -1;

		var _elements = {
			'background': undefined,
			'item': undefined,
			'itemOver': undefined,
			'itemImage': undefined,
			'itemActive': undefined
		};
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			_width = width;
			_height = height;
			if (_api.jwGetFullscreen()) {
				_hide(_wrapper);
			} else {
				var style = {
						display: "block",
						width: _width,
						height: _height
				};
				_css(_wrapper, style);
			}
		};
		
		this.show = function() {
			_show(_wrapper);
		}

		this.hide = function() {
			_hide(_wrapper);
		}


		function _setup() {
			_wrapper = document.createElement("div");
			_wrapper.id = _api.id + "_jwplayer_playlistcomponent";
			switch(_settings.position) {
			case jwplayer.html5.view.positions.RIGHT:
			case jwplayer.html5.view.positions.LEFT:
				_wrapper.style.width = _settings.size + "px";
				break;
			case jwplayer.html5.view.positions.TOP:				
			case jwplayer.html5.view.positions.BOTTOM:
				_wrapper.style.height = _settings.size + "px";
				break;
			}
			
			_populateSkinElements();
			if (_elements.item) {
				_settings.itemheight = _elements.item.height;
			}
			
			_wrapper.style.backgroundColor = '#C6C6C6';
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _rebuildPlaylist);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _itemHandler);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		}
		
		function _createList() {
			var ul = document.createElement("ul");
			_css(ul, {
			    width: _wrapper.style.width,
				minWidth: _wrapper.style.width,
				height: _wrapper.style.height,
		    	backgroundColor: _settings.backgroundcolor,
		    	backgroundImage: _elements.background ? "url("+_elements.background.src+")" : "",
		    			
		    	color: _settings.fontcolor,
		    	listStyle: 'none',
		    	margin: 0,
		    	padding: 0,
		    	fontFamily: _fonts[_settings.font] ? _fonts[_settings.font] : _fonts['_sans'],
		    	fontSize: (_settings.fontsize ? _settings.fontsize : 11) + "px",
		    	fontStyle: _settings.fontstyle,
		    	fontWeight: _settings.fontweight,
		    	
		    	'overflowY': 'auto'
			});
			return ul;
		}
		
		function _itemOver(index) {
			return function() {
				var li = _ul.getElementsByClassName("item")[index];
				var normalColor = _settings.fontcolor;
				var normalBG = _elements.item ? "url("+_elements.item.src+")" : ""
				if (index == _api.jwGetPlaylistIndex()) {
					if (_settings.activecolor) {
						normalColor = _settings.activecolor;
					}
					if (_elements.itemActive) {
						normalBG =  "url("+_elements.itemActive.src+")";
					}
				}
				_css(li, {
					color: _settings.overcolor ? _settings.overcolor : normalColor,
				    backgroundImage: _elements.itemOver ? "url("+_elements.itemOver.src+")" : normalBG
				});
			}
		}

		function _itemOut(index) {
			return function() {
				var li = _ul.getElementsByClassName("item")[index];
				var color = _settings.fontcolor;
				var bg = _elements.item ? "url("+_elements.item.src+")" : "";
				
				if (index == _api.jwGetPlaylistIndex()) {
					if (_settings.activecolor) {
						color = _settings.activecolor;
					}
					if (_elements.itemActive) {
						bg = "url("+_elements.itemActive.src+")";
					}
				}
				_css(li, {
					color: color,
					backgroundImage: bg
				});
			}
		}

		function _createItem(index) {
			var item = _playlist[index];
			var li = document.createElement("li");
			li.className = "item";
			
			_css(li,{
			    height: _settings.itemheight,
		    	display: 'block',
		    	cursor: 'pointer',
			    backgroundImage: _elements.item ? "url("+_elements.item.src+")" : "",
			    backgroundSize: "100% " + _settings.itemheight + "px"
		    });

			li.onmouseover = _itemOver(index);
			li.onmouseout = _itemOut(index);
			
			var image = new Image();
        	var imgPos = 0;
        	var imgWidth = 0;
			if (_showThumbs() && (item.image || item['playlist.image'] || _elements.itemImage) ) {
	        	image.className = 'image';
	        	
	        	if (_elements.itemImage) {
	        		imgPos = (_settings.itemheight - _elements.itemImage.height) / 2;
	        		imgWidth = _elements.itemImage.width;
	        	} else {
	        		imgWidth = _settings.itemheight * 4 / 3;
	        	}
	        			
				_css(image, {
				    height: _elements.itemImage ? _elements.itemImage.height : _settings.itemheight,
				    width: imgWidth,
				    'float': 'left',
				    styleFloat: 'left',
				    cssFloat: 'left',
				    margin: '0 5px 0 0',
				    background: 'black',
				    overflow: 'auto',
				    margin: imgPos + "px"
				});

				if (item['playlist.image']) {
					image.src = item['playlist.image'];	
				} else if (item.image) {
				  	image.src = item.image;
				} else if (_elements.itemImage) {
					image.src = _elements.itemImage.src;
				}
				
				li.appendChild(image);
	        }
			
			var _remainingWidth = _width - imgWidth - imgPos * 2;
			if (_height < _settings.itemheight * _playlist.length) {
				_remainingWidth -= 15;
			}
			
	        var textWrapper = document.createElement("div");
	        _css(textWrapper, {
	            position: "relative",
	            height: "100%",
	            overflow: "hidden"
	        });

	        var duration = document.createElement("span");
    		if (item.duration > 0) {
        		duration.className = 'duration';
        		_css(duration, {
    		    	fontSize: (_settings.fontsize ? _settings.fontsize : 11) + "px",
                	fontWeight: (_settings.fontweight ? _settings.fontweight : "bold"),
    		    	width: "40px",
	            	height: _settings.fontsize ? _settings.fontsize + 10 : 20,
               		lineHeight: 24,
	            	'float': 'right',
				    styleFloat: 'right',
				    cssFloat: 'right',
	            });
        		duration.innerHTML = _utils.timeFormat(item.duration);
            	textWrapper.appendChild(duration);
        	}
	        
        	var title = document.createElement("span");
        	title.className = 'title';
        	_css(title, {
        		paddingLeft: (imgPos ? 0 : "5px"),
        		paddingRight: "5px",
        		height: _settings.fontsize ? _settings.fontsize + 10 : 20,
        		lineHeight: 24,
            	overflow: 'hidden',
            	'float': 'left',
			    styleFloat: 'left',
			    cssFloat: 'left',
            	width: ((item.duration > 0) ? _remainingWidth - 50 : _remainingWidth)-5 + "px",
		    	fontSize: (_settings.fontsize ? _settings.fontsize : 13) + "px",
            	fontWeight: (_settings.fontweight ? _settings.fontweight : "bold")
        	});
        	title.innerHTML = item ? item.title : "";
        	textWrapper.appendChild(title);

	        if (item.description) {
	        	var desc = document.createElement("span");
	        	desc.className = 'description';
	        	_css(desc,{
	        	    display: 'block',
	        	    'float': 'left',
				    styleFloat: 'left',
				    cssFloat: 'left',
	        		margin: 0,
	        		paddingLeft: title.style.paddingLeft,
	        		paddingRight: title.style.paddingRight,
	            	lineHeight: (_settings.fontsize ? _settings.fontsize * 1.5 : 18) + "px",
	            	overflow: 'hidden',
	            	position: "relative"
	        	});
	        	desc.innerHTML = item.description;
	        	textWrapper.appendChild(desc);
	        }
	        li.appendChild(textWrapper);
			return li;
		}
		
		function _rebuildPlaylist(evt) {
			_wrapper.innerHTML = "";
			
			_playlist = _api.jwGetPlaylist();
			if (!_playlist) {
				return;
			}
			items = [];
			_ul = _createList();
			
			for (var i=0; i<_playlist.length; i++) {
				var li = _createItem(i);
				li.onclick = _clickHandler(i);
				_ul.appendChild(li);
				items.push(li);
			}
			
			_lastCurrent = _api.jwGetPlaylistIndex();
			_itemOut(_lastCurrent)();
			
			_wrapper.appendChild(_ul);

			if (_utils.isIOS() && window.iScroll) {
				_ul.style.height = 60 * _playlist.length + "px";
				var myscroll = new iScroll(_wrapper.id);
			}
			
		}
		
		function _clickHandler(index) {
			return function() {
				_api.jwPlaylistItem(index);
				_api.jwPlay(true);
			}
		}
		
		function _scrollToItem() {
			_ul.scrollTop = _api.jwGetPlaylistIndex() * _settings.itemheight;
		}

		function _showThumbs() {
			return _settings.thumbs.toString().toLowerCase() == "true";	
		}

		function _itemHandler(evt) {
			if (_lastCurrent >= 0) {
				_itemOut(_lastCurrent)();
				_lastCurrent = evt.index;
			}
			_itemOut(evt.index)();
			_scrollToItem();
		}

		
		function _stateHandler() {
			if (_settings.position == jwplayer.html5.view.positions.OVER) {
				switch (_api.jwGetState()) {
				case jwplayer.api.events.state.IDLE:
					_show(_wrapper);
					break;
				default:
					_hide(_wrapper);
					break;
				}
			}
		}
		
		function _populateSkinElements() {
			for (var i in _elements) {
				_elements[i] = _getElement(i);
			}
		}
		
		function _getElement(name) {
			return _api.skin.getSkinElement("playlist", name);
		}
		
		
		
		_setup();
		return this;
	};
})(jwplayer);
/**
 * JW Player playlist item model
 *
 * @author zach
 * @version 5.6
 */
(function(jwplayer) {
	jwplayer.html5.playlistitem = function(config) {
		var _defaults = {
			author: "",
			date: "",
			description: "",
			image: "",
			link: "",
			mediaid: "",
			tags: "",
			title: "",
			provider: "",
			
			file: "",
			streamer: "",
			duration: -1,
			start: 0,
			
			currentLevel: -1,
			levels: []
		};
		
		
		var _playlistitem = jwplayer.utils.extend({}, _defaults, config);
		
		if (_playlistitem.type) {
			_playlistitem.provider = _playlistitem.type;
			delete _playlistitem.type;
		}
		
		if (_playlistitem.levels.length === 0) {
			_playlistitem.levels[0] = new jwplayer.html5.playlistitemlevel(_playlistitem);
		}
		
		if (!_playlistitem.provider) {
			_playlistitem.provider = _getProvider(_playlistitem.levels[0]);
		} else {
			_playlistitem.provider = _playlistitem.provider.toLowerCase();
		}
		
		return _playlistitem;
	};
	
	function _getProvider(item) {
		if (jwplayer.utils.isYouTube(item.file)) {
			return "youtube";
		} else {
			var extension = jwplayer.utils.extension(item.file);
			var mimetype;
			if (extension && jwplayer.utils.extensionmap[extension]) {
				mimetype = jwplayer.utils.extensionmap[extension].html5;
			} else if (item.type) {
				mimetype = item.type;
			}
			
			if (mimetype) {
				var mimeprefix = mimetype.split("/")[0];
				if (mimeprefix == "audio") {
					return "sound";
				} else if (mimeprefix == "video") {
					return mimeprefix;
				}
			}
		}
		return "";
	}
})(jwplayer);/**
 * JW Player playlist item level model
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.html5.playlistitemlevel = function(config) {
		var _playlistitemlevel = {
			file: "",
			streamer: "",
			bitrate: 0,
			width: 0
		};
		
		for (var property in _playlistitemlevel) {
			if (jwplayer.utils.exists(config[property])) {
				_playlistitemlevel[property] = config[property];
			}
		}
		return _playlistitemlevel;
	};
	
})(jwplayer);
/**
 * JW Player playlist loader
 *
 * @author pablo
 * @version 5.7
 */
(function(jwplayer) {
	jwplayer.html5.playlistloader = function() {
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		
		this.load = function(playlistfile) {
			jwplayer.utils.ajax(playlistfile, _playlistLoaded, _playlistError)
		}
		
		function _playlistLoaded(loadedEvent) {
			var playlistObj = [];  //[{file:'/testing/files/bunny.mp4'}];

			try {
				var playlistObj = jwplayer.utils.parsers.rssparser.parse(loadedEvent.responseXML.firstChild);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, {
					"playlist": new jwplayer.html5.playlist({playlist: playlistObj})
				});
			} catch (e) {
				_playlistError("Could not parse the playlist");
			}
		}
		
		function _playlistError(msg) {
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_ERROR, {
				error: msg ? msg : 'could not load playlist for whatever reason.  too bad'
			});
		}
	};
	
})(jwplayer);
/**
 * JW Player component that loads PNG skins.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	jwplayer.html5.skin = function() {
		var _components = {};
		var _loaded = false;
		
		this.load = function(path, callback) {
			new jwplayer.html5.skinloader(path, function(skin) {
				_loaded = true;
				_components = skin;
				callback();
			}, function() {
				new jwplayer.html5.skinloader("", function(skin) {
					_loaded = true;
					_components = skin;
					callback();
				});
			});
			
		};
		
		this.getSkinElement = function(component, element) {
			if (_loaded) {
				try {
					return _components[component].elements[element];
				} catch (err) {
					jwplayer.utils.log("No such skin component / element: ", [component, element]);
				}
			}
			return null;
		};
		
		this.getComponentSettings = function(component) {
			if (_loaded) {
				return _components[component].settings;
			}
			return null;
		};
		
		this.getComponentLayout = function(component) {
			if (_loaded) {
				return _components[component].layout;
			}
			return null;
		};
		
	};
})(jwplayer);
/**
 * JW Player component that loads PNG skins.
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {
	/** Constructor **/
	jwplayer.html5.skinloader = function(skinPath, completeHandler, errorHandler) {
		var _skin = {};
		var _completeHandler = completeHandler;
		var _errorHandler = errorHandler;
		var _loading = true;
		var _completeInterval;
		var _skinPath = skinPath;
		var _error = false;
		
		/** Load the skin **/
		function _load() {
			if (typeof _skinPath != "string" || _skinPath === "") {
				_loadSkin(jwplayer.html5.defaultSkin().xml);
			} else {
				jwplayer.utils.ajax(jwplayer.utils.getAbsolutePath(_skinPath), function(xmlrequest) {
					try {
						if (jwplayer.utils.exists(xmlrequest.responseXML)){
							_loadSkin(xmlrequest.responseXML);
							return;	
						}
					} catch (err){
						_clearSkin();
					}
					_loadSkin(jwplayer.html5.defaultSkin().xml);
				}, function(path) {
					_loadSkin(jwplayer.html5.defaultSkin().xml);
				});
			}
			
		}
		
		
		function _loadSkin(xml) {
			var components = xml.getElementsByTagName('component');
			if (components.length === 0) {
				return;
			}
			for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
				var componentName = components[componentIndex].getAttribute("name");
				var component = {
					settings: {},
					elements: {},
					layout: {}
				};
				_skin[componentName] = component;
				var elements = components[componentIndex].getElementsByTagName('elements')[0].getElementsByTagName('element');
				for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
					_loadImage(elements[elementIndex], componentName);
				}
				var settingsElement = components[componentIndex].getElementsByTagName('settings')[0];
				if (settingsElement && settingsElement.childNodes.length > 0) {
					var settings = settingsElement.getElementsByTagName('setting');
					for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
						var name = settings[settingIndex].getAttribute("name");
						var value = settings[settingIndex].getAttribute("value");
						var type = /color$/.test(name) ? "color" : null;
						_skin[componentName].settings[name] = jwplayer.utils.typechecker(value, type);
					}
				}
				var layout = components[componentIndex].getElementsByTagName('layout')[0];
				if (layout && layout.childNodes.length > 0) {
					var groups = layout.getElementsByTagName('group');
					for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
						var group = groups[groupIndex];
						_skin[componentName].layout[group.getAttribute("position")] = {
							elements: []
						};
						for (var attributeIndex = 0; attributeIndex < group.attributes.length; attributeIndex++) {
							var attribute = group.attributes[attributeIndex];
							_skin[componentName].layout[group.getAttribute("position")][attribute.name] = attribute.value;
						}
						var groupElements = group.getElementsByTagName('*');
						for (var groupElementIndex = 0; groupElementIndex < groupElements.length; groupElementIndex++) {
							var element = groupElements[groupElementIndex];
							_skin[componentName].layout[group.getAttribute("position")].elements.push({
								type: element.tagName
							});
							for (var elementAttributeIndex = 0; elementAttributeIndex < element.attributes.length; elementAttributeIndex++) {
								var elementAttribute = element.attributes[elementAttributeIndex];
								_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex][elementAttribute.name] = elementAttribute.value;
							}
							if (!jwplayer.utils.exists(_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex].name)) {
								_skin[componentName].layout[group.getAttribute("position")].elements[groupElementIndex].name = element.tagName;
							}
						}
					}
				}
				
				_loading = false;
				
				_resetCompleteIntervalTest();
			}
		}
		
		
		function _resetCompleteIntervalTest() {
			clearInterval(_completeInterval);
			if (!_error) {
				_completeInterval = setInterval(function() {
					_checkComplete();
				}, 100);
			}
		}
		
		
		/** Load the data for a single element. **/
		function _loadImage(element, component) {
			var img = new Image();
			var elementName = element.getAttribute("name");
			var elementSource = element.getAttribute("src");
			var imgUrl;
			if (elementSource.indexOf('data:image/png;base64,') === 0) {
				imgUrl = elementSource;
			} else {
				var skinUrl = jwplayer.utils.getAbsolutePath(_skinPath);
				var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
				imgUrl = [skinRoot, component, elementSource].join('/');
			}
			
			_skin[component].elements[elementName] = {
				height: 0,
				width: 0,
				src: '',
				ready: false,
				image: img
			};
			
			img.onload = function(evt) {
				_completeImageLoad(img, elementName, component);
			};
			img.onerror = function(evt) {
				_error = true;
				_resetCompleteIntervalTest();
				_errorHandler();
			};
			
			img.src = imgUrl;
		}
		
		function _clearSkin() {
			for (var componentName in _skin) {
				var component = _skin[componentName];
				for (var elementName in component.elements) {
					var element = component.elements[elementName];
					var img = element.image;
					img.onload = null;
					img.onerror = null;
					delete element.image;
					delete component.elements[elementName];
				}
				delete _skin[componentName];
			}
		}
		
		function _checkComplete() {
			for (var component in _skin) {
				if (component != 'properties') {
					for (var element in _skin[component].elements) {
						if (!_skin[component].elements[element].ready) {
							return;
						}
					}
				}
			}
			if (_loading === false) {
				clearInterval(_completeInterval);
				_completeHandler(_skin);
			}
		}
		
		
		function _completeImageLoad(img, element, component) {
			if(_skin[component] && _skin[component].elements[element]) {
				_skin[component].elements[element].height = img.height;
				_skin[component].elements[element].width = img.width;
				_skin[component].elements[element].src = img.src;
				_skin[component].elements[element].ready = true;
				_resetCompleteIntervalTest();
			} else {
				jwplayer.utils.log("Loaded an image for a missing element: " + component + "." + element);
			}
		}
		
		_load();
	};
})(jwplayer);
/** 
 * A factory for API calls that either set listeners or return data
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	jwplayer.html5.api = function(container, options) {
		var _api = {};
				
		var _container = document.createElement('div');
		container.parentNode.replaceChild(_container, container);
		_container.id = container.id;
		
		_api.version = jwplayer.version;
		_api.id = _container.id;
		
		var _model = new jwplayer.html5.model(_api, _container, options);
		var _view = new jwplayer.html5.view(_api, _container, _model);
		var _controller = new jwplayer.html5.controller(_api, _container, _model, _view);
		
		_api.skin = new jwplayer.html5.skin();
		
		_api.jwPlay = function(state) {
			if (typeof state == "undefined") {
				_togglePlay();
			} else if (state.toString().toLowerCase() == "true") {
				_controller.play();
			} else {
				_controller.pause();
			}
		};
		_api.jwPause = function(state) {
			if (typeof state == "undefined") {
				_togglePlay();
			} else if (state.toString().toLowerCase() == "true") {
				_controller.pause();
			} else {
				_controller.play();
			}
		};
		function _togglePlay() {
			if (_model.state == jwplayer.api.events.state.PLAYING || _model.state == jwplayer.api.events.state.BUFFERING) {
				_controller.pause();
			} else {
				_controller.play();
			}
		}
		
		_api.jwStop = _controller.stop;
		_api.jwSeek = _controller.seek;
		_api.jwPlaylistItem = _controller.item;
		_api.jwPlaylistNext = _controller.next;
		_api.jwPlaylistPrev = _controller.prev;
		_api.jwResize = _controller.resize;
		_api.jwLoad = _controller.load;
		
		function _statevarFactory(statevar) {
			return function() {
				return _model[statevar];
			};
		}
		
		function _componentCommandFactory(componentName, funcName, args) {
			return function() {
				var comp = _model.plugins.object[componentName];
				if (comp && comp[funcName] && typeof comp[funcName] == "function") {
					comp[funcName].apply(comp, args);
				}
			};
		}
		
		_api.jwGetItem = _statevarFactory('item');
		_api.jwGetPosition = _statevarFactory('position');
		_api.jwGetDuration = _statevarFactory('duration');
		_api.jwGetBuffer = _statevarFactory('buffer');
		_api.jwGetWidth = _statevarFactory('width');
		_api.jwGetHeight = _statevarFactory('height');
		_api.jwGetFullscreen = _statevarFactory('fullscreen');
		_api.jwSetFullscreen = _controller.setFullscreen;
		_api.jwGetVolume = _statevarFactory('volume');
		_api.jwSetVolume = _controller.setVolume;
		_api.jwGetMute = _statevarFactory('mute');
		_api.jwSetMute = _controller.setMute;
		_api.jwGetStretching = _statevarFactory('stretching');
		
		_api.jwGetState = _statevarFactory('state');
		_api.jwGetVersion = function() {
			return _api.version;
		};
		_api.jwGetPlaylist = function() {
			return _model.playlist;
		};
		_api.jwGetPlaylistIndex = _api.jwGetItem;
		
		_api.jwAddEventListener = _controller.addEventListener;
		_api.jwRemoveEventListener = _controller.removeEventListener;
		_api.jwSendEvent = _controller.sendEvent;
		
		_api.jwDockSetButton = function(id, handler, outGraphic, overGraphic) {
			if (_model.plugins.object["dock"] && _model.plugins.object["dock"].setButton) {
				_model.plugins.object["dock"].setButton(id, handler, outGraphic, overGraphic);	
			}
		}
		
		_api.jwControlbarShow = _componentCommandFactory("controlbar", "show");
		_api.jwControlbarHide = _componentCommandFactory("controlbar", "hide");
		_api.jwDockShow = _componentCommandFactory("dock", "show");
		_api.jwDockHide = _componentCommandFactory("dock", "hide");
		_api.jwDisplayShow = _componentCommandFactory("display", "show");
		_api.jwDisplayHide = _componentCommandFactory("display", "hide");
		
		//UNIMPLEMENTED
		_api.jwGetLevel = function() {
		};
		_api.jwGetBandwidth = function() {
		};
		_api.jwGetLockState = function() {
		};
		_api.jwLock = function() {
		};
		_api.jwUnlock = function() {
		};
		
		var _playlistLoadComplete = _completeHandler(_model, _view, _controller); 
		
		function _finishLoad(model, view, controller) {
			return function() {
				model.addEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistLoadComplete);
				if (model.config.playlistfile) {
					model.loadPlaylist(model.config.playlistfile);
				} else if (typeof model.config.playlist == "array") {
					model.loadPlaylist(model.config.file);
				} else {
					model.loadPlaylist(model.config);
				}
			};
		}
		
		function _completeHandler(model, view, controller) {
			return function(evt) {
				model.removeEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistLoadComplete);
				model.setupPlugins();
				view.setup();
				var evt = {
						id: _api.id,
						version: _api.version
				};
				controller.sendEvent(jwplayer.api.events.JWPLAYER_READY, evt);
				if (jwplayer.utils.exists(playerReady)) {
					playerReady(evt);
				}
			
				if (jwplayer.utils.exists(window[model.config.playerReady])) {
					window[model.config.playerReady](evt);
				}
			
				model.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, {
					"playlist": model.playlist
				});
			
				if (model.config.autostart && !jwplayer.utils.isIOS()) {
					controller.item(model.item);
				}			
			}
		}
		
		if (_model.config.chromeless && !jwplayer.utils.isIPad()) {
			setTimeout(_finishLoad(_model, _view, _controller), 25);
		} else {
			_api.skin.load(_model.config.skin, _finishLoad(_model, _view, _controller));
		}
		return _api;
	};
	
})(jwplayer);
/**
 * JW Player Source Endcap
 * 
 * This will appear at the end of the JW Player source
 * 
 * @version 5.7
 */

 }