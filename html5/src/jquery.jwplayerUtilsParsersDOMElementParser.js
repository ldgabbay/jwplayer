/**
 * HTML DOM Element Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-06
 */
(function($){

$.fn.jwplayerUtilsParsersDOMElementParser = {};

$.fn.jwplayerUtilsParsersDOMElementParser.parsers = {};

$.fn.jwplayerUtilsParsersDOMElementParser.attributes = {
	'width':'width',
	'height': 'height',
	'id': 'id',
	'class': 'className',
	'name': 'name'
};
	
$.fn.jwplayerUtilsParsersDOMElementParser.parse = function(domElement, attributes) {
	if ($.fn.jwplayerUtilsParsersDOMElementParser.parsers[domElement.tagName.toLowerCase()] && (attributes == null)) {
		return $.fn.jwplayerUtilsParsersDOMElementParser.parsers[domElement.tagName.toLowerCase()](domElement);
	} else {
		if  (attributes == undefined) {
			attributes = $.fn.jwplayerUtilsParsersDOMElementParser.attributes;
		} else {
			$.extend(attributes, $.fn.jwplayerUtilsParsersDOMElementParser.attributes);
		}
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

})(jQuery);