/**
 * HTML DOM Media Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMmediaElementParser = {};

$.fn.jwplayerUtilsParsersDOMmediaElementParser.attributes = {
	'src': 'file',
	'preload': 'preload', 
	'autoplay': 'autostart',
	'loop': 'repeat',
	'controls': 'controls'
};

$.fn.jwplayerUtilsParsersDOMmediaElementParser.parse = function(domElement, attributes) {
	if  (attributes == undefined) {
		attributes = $.fn.jwplayerUtilsParsersDOMmediaElementParser.attributes;
	} else {
		$.merge(attributes, $.fn.jwplayerUtilsParsersDOMmediaElementParser.attributes);
	}
	var sources = [];
	$("source",domElement).each(function() {
		sources[sources.length] = $.fn.jwplayerUtilsParsersDOMsourceElementParser.parse(domElement);
	});
	var configuration = $.fn.jwplayerUtilsParsersDOMElementParser.parse(domElement, attributes);
	configuration['sources'] = sources;
	return configuration;
};

$.fn.jwplayerUtilsParsersDOMElementParser.parsers['media'] = $.fn.jwplayerUtilsParsersDOMmediaElementParser.parse;
$.fn.jwplayerUtilsParsersDOMElementParser.parsers['audio'] = $.fn.jwplayerUtilsParsersDOMmediaElementParser.parse;

})(jQuery);