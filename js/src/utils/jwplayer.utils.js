jwplayer.utils = function() {
};

/** Returns the true type of an object **/
// TODO: if not used elsewhere, remove this function
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
			for (element in args[i]) {
				args[0][element] = args[i][element];
			}
		}
		return args[0];
	}
	return null;
};

/** Returns the extension of a file name **/
jwplayer.utils.extension = function(path) {
	return path.substr(path.lastIndexOf('.') + 1, path.length).toLowerCase();
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
 * Detects whether the current browser is mobile Safari.
 **/
jwplayer.utils.isIOS = function() {
	var agent = navigator.userAgent.toLowerCase();
	return (agent.match(/iP(hone|ad)/i) !== null);
};

/**
 * Detects whether the browser can handle HTML5 video.
 * Using this as a proxy for detecting all HTML5 features needed for the JW HTML5 Player.  Do we need more granularity?
 * 
 * @param config (optional) If set, check to see if the first playable item 
 */
jwplayer.utils.hasHTML5 = function(config) {
	var vid = document.createElement('video');
	
	if (!!vid.canPlayType) {
		if (config) {
			var item = {};
			if (config.playlist && config.playlist.length) {
				item.file = config.playlist[0].file;
				item.levels = config.playlist[0].levels;
			} else {
				item.file = config.file;
				item.levels = config.levels;
			}
			
			if (item.file) {
				return jwplayer.utils.vidCanPlay(vid, item.file);
			} else if (item.levels && item.levels.length) {
				for (var i=0; i<item.levels.length; i++) {
					if (item.levels[i].file && jwplayer.utils.vidCanPlay(vid, item.levels[i].file)) {
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

jwplayer.utils.vidCanPlay = function(video, file) {
	var extension = jwplayer.utils.strings.extension(file);
	if (jwplayer.utils.extensionmap[extension] !== undefined) {
		sourceType = jwplayer.utils.extensionmap[extension];
	} else {
		sourceType = 'video/' + extension + ';';
	}
	return video.canPlayType(sourceType);
};



/**
 * Detects whether or not the current player has flash capabilities
 * TODO: Add minimum flash version constraint: 9.0.115
 */
jwplayer.utils.hasFlash = function() {
	return (typeof navigator.plugins != "undefined" && typeof navigator.plugins['Shockwave Flash'] != "undefined") || (typeof window.ActiveXObject != "undefined");
};
