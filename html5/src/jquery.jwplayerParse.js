/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

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
			media: 'media'
		},
		video: {
			poster: 'image'
		}
	};
	
	var parsers = {};
	
	$.fn.jwplayerParse = function(player) {
		return parseElement(player);
	};
	
	function getAttributeList(elementType, attributes) {
		if (attributes === undefined) {
			attributes = elementAttributes[elementType];
		} else {
			$.extend(attributes, elementAttributes[elementType]);
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
					var value = $(domElement).attr(attribute);
					if (!(value === "" || value === undefined)) {
						configuration[attributes[attribute]] = $(domElement).attr(attribute);
					}
				}
			}
			configuration.screencolor = (($(domElement).css("background-color") == "transparent") || ($(domElement).css("background-color") == "rgba(0, 0, 0, 0)")) ? "black" : $(domElement).css("background-color");
			configuration.plugins = {};
			return configuration;
		}
	}
	
	function parseMediaElement(domElement, attributes) {
		attributes = getAttributeList('media', attributes);
		var sources = [];
		if (!(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length)){
			var currentElement = $(domElement).next();
			if (currentElement[0] !== undefined){
				while(currentElement[0].tagName.toLowerCase() == "source") {
					sources[sources.length] = parseSourceElement(currentElement[0]);
					currentElement = currentElement.next();
				}				
			}
		} else {
			$("source", domElement).each(function() {
				sources[sources.length] = parseSourceElement(this);
			});
		}
		var configuration = parseElement(domElement, attributes);
		if (configuration.file !== undefined) {
			sources[0] = {
				'file': configuration.file
			};
		}
		if (!$.fn.jwplayerUtils.isiPhone()) {
			domElement.removeAttribute('src');
		}
		configuration.sources = sources;
		return configuration;
	}
	
	function parseSourceElement(domElement, attributes) {
		attributes = getAttributeList('source', attributes);
		return parseElement(domElement, attributes);
	}
	
	function parseVideoElement(domElement, attributes) {
		attributes = getAttributeList('video', attributes);
		var result = parseMediaElement(domElement, attributes);
		if (!$.fn.jwplayerUtils.isiPhone() && !$.fn.jwplayerUtils.isiPad()) {
			try {
				$(domElement)[0].removeAttribute('poster');
			} catch (err) {
			
			}
		}
		return result;
	}
	
	parsers.media = parseMediaElement;
	parsers.audio = parseMediaElement;
	parsers.source = parseSourceElement;
	parsers.video = parseVideoElement;
	
	
})(jQuery);
