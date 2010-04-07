/**
 * HTML DOM Media Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMSourceElementParser = {};

$.fn.jwplayerUtilsParsersDOMSourceElementParser.attributes = {
	'src': 'file',
	'type': 'type',
	'media': 'media'
};

$.fn.jwplayerUtilsParsersDOMSourceElementParser.parse = function(domElement, attributes) {
	if  (attributes == undefined) {
		attributes = $.fn.jwplayerUtilsParsersDOMSourceElementParser.attributes;
	} else {
		$.extend(attributes, $.fn.jwplayerUtilsParsersDOMSourceElementParser.attributes);
	}
	return $.fn.jwplayerUtilsParsersDOMElementParser.parse(domElement, attributes);
};


$.fn.jwplayerUtilsParsersDOMElementParser.parsers['source'] = $.fn.jwplayerUtilsParsersDOMSourceElementParser.parse;

})(jQuery);