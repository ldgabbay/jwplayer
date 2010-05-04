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
	$.fn.jwplayerSkinner = function(player, completeHandler) {
		load(player, completeHandler);
	};
	
	/** Load the skin **/
	function load(player, completeHandler) {
		$.ajax({
			url: player.model.config.skin,
			complete: function(xmlrequest, textStatus) {
				if (textStatus == "success") {
					loadSkin(player, xmlrequest.responseText, completeHandler);
				} else {
					loadSkin(player, $.fn.jwplayerDefaultSkin, completeHandler);
				}
			}
			
		});
	}
	
	function loadSkin(player, xml, completeHandler) {
		var skin = {
			properties: {},
			incompleteElements: 0
		};
		player.skin = skin;
		var components = $('component', xml);
		if (components.length === 0) {
			return;
		}
		for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
			var componentName = $(components[componentIndex]).attr('name');
			var component = {
				settings: {},
				elements: {}
			};
			player.skin[componentName] = component;
			var elements = $(components[componentIndex]).find('element');
			player.skin.loading = true;
			for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
				player.skin.incompleteElements++;
				loadImage(elements[elementIndex], componentName, player, completeHandler);
			}
			var settings = $(components[componentIndex]).find('setting');
			for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
				player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
			}
			player.skin.loading = false;
			if (player.skin.incompleteElements === 0) {
				completeHandler();
			}
		}
	}
	
	/** Load the data for a single element. **/
	function loadImage(element, component, player, completeHandler) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var skinUrl = player.model.config.skin.substr(0, player.model.config.skin.lastIndexOf('/'));
		$(img).error(function() {
			player.skin.incompleteElements--;
			if ((player.skin.incompleteElements === 0) && (player.skin.loading === false)) {
				completeHandler();
			}
		});
		
		$(img).load(completeImageLoad(img, elementName, component, player, completeHandler));
		img.src = (elementSource.indexOf('data:image/png;base64,') === 0) ? elementSource : [skinUrl, component, elementSource].join("/");
	}
	
	function completeImageLoad(img, element, component, player, completeHandler) {
		return function() {
			player.skin[component].elements[element] = {
				height: img.height,
				width: img.width,
				src: img.src
			};
			player.skin.incompleteElements--;
			if ((player.skin.incompleteElements === 0) && (player.skin.loading === false)) {
				completeHandler();
			}
		};
	}
	
	$.fn.jwplayerSkinner.hasComponent = function(player, component) {
		return (player.skin[component] !== null);
	};
	
	
	$.fn.jwplayerSkinner.getSkinElement = function(player, component, element) {
		try {
			return player.skin[component].elements[element];
		} catch (err) {
			$.fn.jwplayerUtils.log("No such skin component / element: ", [player, component, element]);
		}
		return null;
	};
	
	
	$.fn.jwplayerSkinner.addSkinElement = function(player, component, name, element) {
		try {
			player.skin[component][name] = element;
		} catch (err) {
			$.fn.jwplayerUtils.log("No such skin component ", [player, component]);
		}
	};
	
	$.fn.jwplayerSkinner.getSkinProperties = function(player) {
		return player.skin.properties;
	};
	
})(jQuery);
