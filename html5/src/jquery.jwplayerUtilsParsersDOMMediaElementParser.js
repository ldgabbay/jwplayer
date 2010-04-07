/**
 * HTML DOM Media Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMMediaElementParser = {};

$.fn.jwplayerUtilsParsersDOMMediaElementParser.attributes = {
	'src': 'file',
	'preload': 'preload', 
	'autoplay': 'autostart',
	'loop': 'repeat',
	'controls': 'controls'
};

$.fn.jwplayerUtilsParsersDOMMediaElementParser.parse = function(domElement, attributes) {
	if  (attributes == undefined) {
		attributes = $.fn.jwplayerUtilsParsersDOMMediaElementParser.attributes;
	} else {
		$.extend(attributes, $.fn.jwplayerUtilsParsersDOMMediaElementParser.attributes);
	}
	var sources = [];
	$("source",domElement).each(function() {
		sources[sources.length] = $.fn.jwplayerUtilsParsersDOMSourceElementParser.parse(this);
	});
	var configuration = $.fn.jwplayerUtilsParsersDOMElementParser.parse(domElement, attributes);
	if (configuration['file'] != undefined) {
		sources[0] = {'file':configuration['file']};
	}
	configuration['sources'] = sources;
	return configuration;
};

$.fn.jwplayerUtilsParsersDOMElementParser.parsers['media'] = $.fn.jwplayerUtilsParsersDOMMediaElementParser.parse;
$.fn.jwplayerUtilsParsersDOMElementParser.parsers['audio'] = $.fn.jwplayerUtilsParsersDOMMediaElementParser.parse;

})(jQuery);