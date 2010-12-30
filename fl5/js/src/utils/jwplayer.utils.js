/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {

	jwplayer.utils = function() {
	};
	
	/** Returns the true type of an object **/
	
	/**
	 *
	 * @param {Object} value
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
	
	/** Merges a list of objects **/
	jwplayer.utils.extend = function() {
		var args = jwplayer.utils.extend['arguments'];
		if (args.length > 1) {
			for (var i = 1; i < args.length; i++) {
				for (var element in args[i]) {
					args[0][element] = args[i][element];
				}
			}
			return args[0];
		}
		return null;
	};
	
	/**
	 * Returns a deep copy of an object.
	 * @param {Object} obj
	 */
	jwplayer.utils.clone = function(obj) {
		var result;
		var args = jwplayer.utils.clone['arguments'];
		if (args.length == 1) {
			switch (jwplayer.utils.typeOf(args[0])) {
				case "object":
					result = {};
					for (var element in args[0]) {
						result[element] = jwplayer.utils.clone(args[0][element]);
					}
					break;
				case "array":
					result = [];
					for (var element in args[0]) {
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
	
	/** Returns the extension of a file name **/
	jwplayer.utils.extension = function(path) {
		path = path.substring(path.lastIndexOf("/") + 1, path.length);
		path = path.split("?")[0];
		if (path.lastIndexOf('.') > -1) {
			return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
		}
		return "";
	};
	
	/** Updates the contents of an HTML element **/
	jwplayer.utils.html = function(element, content) {
		element.innerHTML = content;
	};
	
	/** Appends an HTML element to another element HTML element **/
	jwplayer.utils.append = function(originalElement, appendedElement) {
		originalElement.appendChild(appendedElement);
	};
	
	/** Wraps an HTML element with another element **/
	jwplayer.utils.wrap = function(originalElement, appendedElement) {
		originalElement.parentNode.replaceChild(appendedElement, originalElement);
		appendedElement.appendChild(originalElement);
	};
	
	/** Loads an XML file into a DOM object **/
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
		xmlhttp.open("GET", xmldocpath, true);
		xmlhttp.send(null);
		return xmlhttp;
	};
	
	/** Loads a file **/
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
	
	/** Finds tags in a DOM, returning a new DOM **/
	jwplayer.utils.find = function(dom, tag) {
		return dom.getElementsByTagName(tag);
	};
	
	/** **/
	
	/** Appends an HTML element to another element HTML element **/
	jwplayer.utils.append = function(originalElement, appendedElement) {
		originalElement.appendChild(appendedElement);
	};
	
	/**
	 * Detects whether the current browser is IE (version 8 or below).
	 * Technique from http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
	 * Note - this detection no longer works for IE9.
	 **/
	jwplayer.utils.isIE = function() {
		return (!+"\v1");
	};
	
	/**
	 * Detects whether the current browser is Android 2.0, 2.1 or 2.2 which do have some support for HTML5
	 **/
	jwplayer.utils.isLegacyAndroid = function() {
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(/android 2.[012]/i) !== null);
	};
	
	
	/**
	 * Detects whether the current browser is mobile Safari.
	 **/
	jwplayer.utils.isIOS = function() {
		var agent = navigator.userAgent.toLowerCase();
		return (agent.match(/iP(hone|ad)/i) !== null);
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
		if (item.file && item.file.toLowerCase().indexOf("youtube.com") > -1) {
			item.provider = "youtube";
		}
		if (item.streamer && item.streamer.toLowerCase().indexOf("rtmp://") == 0) {
			item.provider = "rtmp";
		}
		if (playlistItem.type) {
			item.provider = playlistItem.type.toLowerCase();
		} else if (playlistItem.provider) {
			item.provider = playlistItem.provider.toLowerCase();
		}
		
		return item;
	}
	
	/**
	 * Detects whether Flash supports this configuration
	 * @param config (optional) If set, check to see if the first playable item
	 */
	jwplayer.utils.flashSupportsConfig = function(config) {
		if (jwplayer.utils.hasFlash()) {
			if (config) {
				var item = jwplayer.utils.getFirstPlaylistItemFromConfig(config);
				if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
					return true;
				} else if (item.file) {
					return jwplayer.utils.flashCanPlay(item.file, item.provider);
				} else if (item.levels && item.levels.length) {
					for (var i = 0; i < item.levels.length; i++) {
						if (item.levels[i].file && jwplayer.utils.flashCanPlay(item.levels[i].file, item.provider)) {
							return true;
						}
					}
				}
			} else {
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Determines if a Flash can play a particular file, based on its extension
	 */
	jwplayer.utils.flashCanPlay = function(file, provider) {
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
		if (jwplayer.utils.extensionmap[extension] !== undefined &&
		jwplayer.utils.extensionmap[extension].flash === undefined) {
			return false;
		}
		return true;
	};
	
	/**
	 * Detects whether the html5 player supports this configuration.
	 *
	 * @param config (optional) If set, check to see if the first playable item
	 * @return {Boolean}
	 */
	jwplayer.utils.html5SupportsConfig = function(config) {
		var vid = document.createElement('video');
		if (!!vid.canPlayType) {
			if (config) {
				var item = jwplayer.utils.getFirstPlaylistItemFromConfig(config);
				if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
					return true;
				} else if (item.file) {
					return jwplayer.utils.html5CanPlay(vid, item.file, item.provider, item.playlistfile);
				} else if (item.levels && item.levels.length) {
					for (var i = 0; i < item.levels.length; i++) {
						if (item.levels[i].file && jwplayer.utils.html5CanPlay(vid, item.levels[i].file, item.provider, item.playlistfile)) {
							return true;
						}
					}
				}
			} else {
				return true;
			}
		}
		
		return false;
	};
	
	/**
	 * Determines if a video element can play a particular file, based on its extension
	 * @param {Object} video
	 * @param {Object} file
	 * @param {Object} provider
	 * @param {Object} playlistfile
	 * @return {Boolean}
	 */
	jwplayer.utils.html5CanPlay = function(video, file, provider, playlistfile) {
		// Don't support playlists
		if (playlistfile) {
			return false;
		}
		
		// YouTube is supported
		if (provider && provider == "youtube") {
			return true;
		}
		
		// If a provider is set, only proceed if video
		if (provider && provider != "video" && provider != "http") {
			return false;
		}
		
		var extension = jwplayer.utils.extension(file);
		
		// Check for Android, which returns false for canPlayType
		if (jwplayer.utils.isLegacyAndroid() && extension.match(/m4v|mp4/)) {
			return true;
		}
		
		// Last, but not least, ask the browser
		return jwplayer.utils.browserCanPlay(video, extension);
	};
	
	/**
	 *
	 * @param {DOMElement} video tag
	 * @param {String} extension
	 * @return {Boolean}
	 */
	jwplayer.utils.browserCanPlay = function(video, extension) {
		var sourceType;
		// OK to use HTML5 with no extension
		if (!extension) {
			return true;
		} else if (jwplayer.utils.extensionmap[extension] !== undefined && jwplayer.utils.extensionmap[extension].html5 === undefined) {
			return false;
		} else if (jwplayer.utils.extensionmap[extension] !== undefined && jwplayer.utils.extensionmap[extension].html5 !== undefined) {
			sourceType = jwplayer.utils.extensionmap[extension].html5;
		} else {
			sourceType = 'video/' + extension + ';';
		}
		
		return video.canPlayType(sourceType);
	}
	
	/**
	 *
	 * @param {Object} config
	 */
	jwplayer.utils.downloadSupportsConfig = function(config) {
		if (config) {
			var item = jwplayer.utils.getFirstPlaylistItemFromConfig(config);
			
			if (typeof item.file == "undefined" && typeof item.levels == "undefined") {
				return true;
			} else if (item.file) {
				return jwplayer.utils.canDownload(item.file, item.provider, item.playlistfile);
			} else if (item.levels && item.levels.length) {
				for (var i = 0; i < item.levels.length; i++) {
					if (item.levels[i].file && jwplayer.utils.canDownload(item.levels[i].file, item.provider, item.playlistfile)) {
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
	jwplayer.utils.canDownload = function(file, provider, playlistfile) {
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
	
	/**
	 * Replacement for "outerHTML" getter (not available in FireFox)
	 */
	jwplayer.utils.getOuterHTML = function(element) {
		if (element.outerHTML) {
			return element.outerHTML;
		} else {
			var parent = element.parentNode;
			var tmp = document.createElement(parent.tagName);
			tmp.appendChild(element);
			var elementHTML = tmp.innerHTML;
			parent.appendChild(element);
			return elementHTML;
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
	 * Detects whether or not the current player has flash capabilities
	 * TODO: Add minimum flash version constraint: 9.0.115
	 */
	jwplayer.utils.hasFlash = function() {
		return (typeof navigator.plugins != "undefined" && typeof navigator.plugins['Shockwave Flash'] != "undefined") || (typeof window.ActiveXObject != "undefined");
	};
	
	/**
	 * Extracts a plugin name from a string
	 */
	jwplayer.utils.getPluginName = function(pluginName) {
		if (pluginName.lastIndexOf("/") >= 0) {
			pluginName = pluginName.substring(pluginName.lastIndexOf("/") + 1, pluginName.length);
		}
		if (pluginName.lastIndexOf("-") >= 0) {
			pluginName = pluginName.substring(0, pluginName.lastIndexOf("-"));
		}
		if (pluginName.lastIndexOf(".swf") >= 0) {
			pluginName = pluginName.substring(0, pluginName.lastIndexOf(".swf"));
		}
		return pluginName;
	};
	
	/** Gets an absolute file path based on a relative filepath **/
	jwplayer.utils.getAbsolutePath = function(path, base) {
		if (base === undefined) {
			base = document.location.href;
		}
		if (path === undefined) {
			return undefined;
		}
		if (isAbsolutePath(path)) {
			return path;
		}
		var protocol = base.substring(0, base.indexOf("://") + 3);
		var domain = base.substring(protocol.length, base.indexOf('/', protocol.length + 1));
		var patharray;
		if (path.indexOf("/") === 0) {
			patharray = path.split("/");
		} else {
			var basepath = base.split("?")[0];
			basepath = basepath.substring(protocol.length + domain.length + 1, basepath.lastIndexOf('/'));
			patharray = basepath.split("/").concat(path.split("/"));
		}
		var result = [];
		for (var i = 0; i < patharray.length; i++) {
			if (!patharray[i] || patharray[i] === undefined || patharray[i] == ".") {
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
		if (path === null) {
			return;
		}
		var protocol = path.indexOf("://");
		var queryparams = path.indexOf("?");
		return (protocol > 0 && (queryparams < 0 || (queryparams > protocol)));
	}
	
	jwplayer.utils.mapEmpty = function(map) {
		for (var val in map) {
			return false;
		}
		return true;
	};
	
	jwplayer.utils.mapLength = function(map) {
		var result = 0;
		for (var val in map) {
			result++;
		}
		return result;
	};
	
	/** Logger **/
	jwplayer.utils.log = function(msg, obj) {
		if (typeof console != "undefined" && typeof console.log != "undefined") {
			if (obj) {
				console.log(msg, obj);
			} else {
				console.log(msg);
			}
		}
	};
	
	jwplayer.utils.css = function(domelement, styles, debug) {
		if (domelement !== undefined) {
			for (var style in styles) {
				try {
					if (typeof styles[style] === "undefined") {
						continue;
					} else if (typeof styles[style] == "number" && !(style == "zIndex" || style == "opacity")) {
						if (isNaN(styles[style])) {
							continue;
						}
						if (style.match(/color/i)) {
							styles[style] = "#" + jwplayer.utils.strings.pad(styles[style].toString(16), 6);
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
		return path.indexOf("youtube.com") > -1;
	};
	
	jwplayer.utils.getYouTubeId = function(path) {
		path.indexOf("youtube.com" > 0);
	};
	
	/**
	 *
	 * @param {Object} domelement
	 * @param {Object} value
	 */
	jwplayer.utils.transform = function(domelement, value) {
		domelement.style.webkitTransform = value;
		domelement.style.MozTransform = value;
		domelement.style.OTransform = value;
	};
	
	/**
	 * Stretches domelement based on stretching. parentWidth, parentHeight, elementWidth,
	 * and elementHeight are required as the elements dimensions change as a result of the
	 * stretching. Hence, the original dimensions must always be supplied.
	 * @param {String} stretching
	 * @param {DOMElement} domelement
	 * @param {Number} parentWidth
	 * @param {Number} parentHeight
	 * @param {Number} elementWidth
	 * @param {Number} elementHeight
	 */
	jwplayer.utils.stretch = function(stretching, domelement, parentWidth, parentHeight, elementWidth, elementHeight) {
		if (typeof parentWidth == "undefined" || typeof parentHeight == "undefined" || typeof elementWidth == "undefined" || typeof elementHeight == "undefined") {
			return;
		}
		var xscale = parentWidth / elementWidth;
		var yscale = parentHeight / elementHeight;
		var x = 0;
		var y = 0;
		domelement.style.overflow = "hidden";
		jwplayer.utils.transform(domelement, "");
		var style = {};
		switch (stretching.toLowerCase()) {
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
				jwplayer.utils.transform(domelement, ["scale(", xscale, ",", yscale, ")", " translate(0px,0px)"].join(""));
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
	
	jwplayer.utils.stretching = {
		"NONE": "none",
		"FILL": "fill",
		"UNIFORM": "uniform",
		"EXACTFIT": "exactfit"
	};
})(jwplayer);
