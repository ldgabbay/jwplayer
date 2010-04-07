/**
 * HTML DOM Media Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMvideoElementParser = {};

$.fn.jwplayerUtilsParsersDOMvideoElementParser.attributes = {
	'poster': 'image'
};

$.fn.jwplayerUtilsParsersDOMvideoElementParser.parse = function(domElement, attributes) {
	if  (attributes == undefined) {
		attributes = $.fn.jwplayerUtilsParsersDOMvideoElementParser.attributes;
	} else {
		$.merge(attributes, $.fn.jwplayerUtilsParsersDOMvideoElementParser.attributes);
	}
	return $.fn.jwplayerUtilsParsersDOMmediaElementParser.parse(domElement, attributes);
}

$.fn.jwplayerUtilsParsersDOMElementParser.parsers['video'] = $.fn.jwplayerUtilsParsersDOMvideoElementParser.parse;

})(jQuery);