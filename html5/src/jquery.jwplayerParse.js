/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

var elementAttributes = {
	'element':{
		'width':'width',
		'height': 'height',
		'id': 'id',
		'class': 'className',
		'name': 'name'
	},
	'media': {
		'src': 'file',
		'preload': 'preload', 
		'autoplay': 'autostart',
		'loop': 'repeat',
		'controls': 'controls'
	},
	'source':{
		'src': 'file',
		'type': 'type',
		'media': 'media'
	},
	'video': {
		'poster': 'image'
	}
};

var parsers = {
}

$.fn.jwplayerParse = function(options){
	return this.each(function() {
		$(this).data("model", $.extend(true, {}, $.fn.jwplayer.defaults, options, parseElement(this)));
	});
};

function getAttributeList(attributes, elementType) {
	if  (attributes == undefined) {
		attributes = elementAttributes[elementType];
	} else {
		$.extend(attributes, elementAttributes[elementType]);
	}
	return attributes;
}

function parseElement(domElement, attributes) {
	if (parsers[domElement.tagName.toLowerCase()] && (attributes == null)) {
		return parsers[domElement.tagName.toLowerCase()](domElement);
	} else {
		attributes = getAttributeList(attributes, 'element');
		var configuration = {};			
		for (var attribute in attributes) {
			if (attribute != "length") {
				var value = $(domElement).attr(attribute);
				if (!(value == "" || value == undefined)) {
					configuration[attributes[attribute]] = $(domElement).attr(attribute);
				}
			}
		}
		return configuration;
	}
};

function parseMediaElement(domElement, attributes) {
	attributes = getAttributeList(attributes, 'media');
	var sources = [];
	$("source",domElement).each(function() {
		sources[sources.length] = parseSourceElement(this);
	});
	var configuration = parseElement(domElement, attributes);
	if (configuration['file'] != undefined) {
		sources[0] = {'file':configuration['file']};
	}
	configuration['sources'] = sources;
	return configuration;
};

function parseSourceElement(domElement, attributes) {
	attributes = getAttributeList(attributes, 'source');
	return parseElement(domElement, attributes);
};

function parseVideoElement(domElement, attributes) {
	attributes = getAttributeList(attributes, 'video');
	return parseMediaElement(domElement, attributes);
}

parsers['media'] = parseMediaElement;
parsers['audio'] = parseMediaElement;
parsers['source'] = parseSourceElement;
parsers['video'] = parseVideoElement;


})(jQuery);