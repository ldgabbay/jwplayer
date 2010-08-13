/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 1.0
 * @lastmodifieddate 2010-08-09
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
		if (attributes === undefined) {
			attributes = elementAttributes[elementType];
		} else {
			jwplayer.utils.extend(attributes, elementAttributes[elementType]);
		}
		return attributes;
	}
	
	function parseElement(domElement, attributes) {
		if (parsers[domElement.tagName.toLowerCase()] && (attributes === undefined)) {
			return parsers[domElement.tagName.toLowerCase()](domElement);
		} else {
			attributes = getAttributeList('element', attributes);
			var configuration = {};
			for (var attribute in attributes) {
				if (attribute != "length") {
					var value = domElement.getAttribute(attribute);
					if (!(value === "" || value === undefined || value === null)) {
						configuration[attributes[attribute]] = domElement.getAttribute(attribute);
					}
				}
			}
			//configuration.screencolor =
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
		if (!(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)){
			// IE6/7/8 case
			var currentElement = domElement.nextSibling;
			if (currentElement[0] !== undefined){
				while(currentElement[0].tagName.toLowerCase() == "source") {
					sources.push(parseSourceElement(currentElement[0]));
					currentElement = currentElement.nextSibling;
				}				
			}
		} else {
			var sourceTags = jwplayer.utils.selectors.getElementsByTagAndClass("source", "", domElement);
			for (var i in sourceTags) {
				sources.push(parseSourceElement(sourceTags[i]));
			}
		}
		var configuration = parseElement(domElement, attributes);
		if (configuration.file !== undefined) {
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
