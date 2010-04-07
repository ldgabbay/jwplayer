/**
 * HTML DOM Media Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMsourceElementParser = {};

$.fn.jwplayerUtilsParsersDOMsourceElementParser.attributes = {
	'src': 'file',
	'type': 'type',
	'media': 'media'
};

$.fn.jwplayerUtilsParsersDOMsourceElementParser.parse = function(domElement, attributes) {
	if  (attributes == undefined) {
		attributes = $.fn.jwplayerUtilsParsersDOMsourceElementParser.attributes;
	} else {
		$.merge(attributes, $.fn.jwplayerUtilsParsersDOMsourceElementParser.attributes);
	}
	return $.fn.jwplayerUtilsParsersDOMElementParser.parse(domElement, attributes);
};


$.fn.jwplayerUtilsParsersDOMElementParser.parsers['source'] = $.fn.jwplayerUtilsParsersDOMsourceElementParser.parse;

})(jQuery);