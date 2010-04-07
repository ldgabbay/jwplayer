/**
 * HTML DOM Media Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMVideoElementParser = {};

$.fn.jwplayerUtilsParsersDOMVideoElementParser.attributes = {
	'poster': 'image'
};

$.fn.jwplayerUtilsParsersDOMVideoElementParser.parse = function(domElement, attributes) {
	if  (attributes == undefined) {
		attributes = $.fn.jwplayerUtilsParsersDOMVideoElementParser.attributes;
	} else {
		$.extend(attributes, $.fn.jwplayerUtilsParsersDOMVideoElementParser.attributes);
	}
	return $.fn.jwplayerUtilsParsersDOMMediaElementParser.parse(domElement, attributes);
}

$.fn.jwplayerUtilsParsersDOMElementParser.parsers['video'] = $.fn.jwplayerUtilsParsersDOMVideoElementParser.parse;

})(jQuery);