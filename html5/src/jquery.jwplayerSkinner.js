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
		$.get(player.model.config.skin, {}, function(xml) {
			var skin = {
				properties: {},
				incompleteElements: 0
			};
			player.skin = skin;
			var components = $('component', xml);
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
			}
		});
	}
	
	/** Load the data for a single element. **/
	function loadImage(element, component, player, completeHandler) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var skinUrl = player.model.config.skin.substr(0, player.model.config.skin.lastIndexOf('/'));
		$(img).error(function() {
			player.skin.incompleteElements--;
		});
		$(img).bind('load', {
			player: player,
			elementName: elementName,
			component: component,
			completeHandler: completeHandler
		}, function(event) {
			event.data.player.skin[event.data.component].elements[event.data.elementName] = {
				height: this.height,
				width: this.width,
				src: this.src
			};
			event.data.player.skin.incompleteElements--;
			if ((event.data.player.skin.incompleteElements === 0) && (event.data.player.skin.loading === false)) {
				event.data.completeHandler();
			}
		});
		var src = [skinUrl, component, elementSource].join("/");
		//$(img).attr('style', "filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);");
		img.src = src;
		img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "')";
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
