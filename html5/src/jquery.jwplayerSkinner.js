/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	/** Constructor **/
	$.fn.jwplayerSkinner = function() {
		return this.each(function() {
			loadSkin($(this).data("model"));
		});
	};
	
	
	/** Loading the images from the skin XML. **/
	function loadSkin(model) {
		$.get(model.skin, {}, function(xml) {
			var arr = $('component', xml);
			for (var i = 0; i < arr.length; i++) {
				if ($(arr[i]).attr('name') == 'display') {
					var sts = $(arr[i]).find('setting');
					arr = $(arr[i]).find('element');
					break;
				}
			}
			for (var i = 0; i < sts.length; i++) {
				model.skinlements[$(sts[i]).attr('name')] = $(sts[i]).attr('value');
			}
			config.options.images = arr.length;
			for (var i = 0; i < arr.length; i++) {
				loadImage(arr[i], config);
			}
		});
	}
	
	
	/** Load the data for a single element. **/
	function loadImage(element, config) {
		var img = new Image();
		var nam = $(element).attr('name');
		var url = config.options.skin.substr(0, config.options.skin.lastIndexOf('/')) + '/controlbar/';
		$(img).error(function() {
			config.options.images--;
		});
		$(img).load(function() {
			config.images[nam] = {
				height: this.height,
				width: this.width,
				src: this.src
			};
			config.options.images--;
			if (config.options.images === 0) {
				buildElements(config);
				buildHandlers(config);
			}
		});
		img.src = url + $(element).attr('src');
	}
	
})(jQuery);
