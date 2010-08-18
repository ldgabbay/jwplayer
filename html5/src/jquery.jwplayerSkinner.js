/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	var players = {};
	
	/** Constructor **/
	$.fn.jwplayerSkinner = function(player, completeHandler) {
		players[player.id] = {
			completeHandler: completeHandler
		};
		load(player);
	};
	
	/** Load the skin **/
	function load(player) {
		$.ajax({
			url: $.fn.jwplayerUtils.getAbsolutePath(player.model.config.skin),
			complete: function(xmlrequest, textStatus) {
				if (textStatus == "success") {
					loadSkin(player, xmlrequest.responseXML);
				} else {
					loadSkin(player, $.fn.jwplayerDefaultSkin);
				}
			}
			
		});
	}
	
	function loadSkin(player, xml) {
		var skin = {
			properties: {}
		};
		player.skin = skin;
		var components = $('component', xml);
		if (components.length === 0) {
			return;
		}
		for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
			players[player.id].loading = true;
			
			var componentName = $(components[componentIndex]).attr('name');
			var component = {
				settings: {},
				elements: {}
			};
			player.skin[componentName] = component;
			var elements = $(components[componentIndex]).find('element');
			for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
				loadImage(elements[elementIndex], componentName, player);
			}
			var settings = $(components[componentIndex]).find('setting');
			for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
				player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
			}
			
			players[player.id].loading = false;
			
			resetCompleteIntervalTest(player);
		}
	}
	
	function resetCompleteIntervalTest(player) {
		clearInterval(players[player.id].completeInterval);
		players[player.id].completeInterval = setInterval(function() {
			checkComplete(player);
		}, 100);
	}
	
	/** Load the data for a single element. **/
	function loadImage(element, component, player) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var skinUrl = $.fn.jwplayerUtils.getAbsolutePath(player.model.config.skin);
		var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
		var imgUrl = (elementSource.indexOf('data:image/png;base64,') === 0) ? elementSource : [skinRoot, component, elementSource].join('/');
		
		player.skin[component].elements[elementName] = {
			height: 0,
			width: 0,
			src: '',
			ready: false
		};

		$(img).load(completeImageLoad(img, elementName, component, player));		
		$(img).error(function() {
			player.skin[component].elements[elementName].ready = true;
			resetCompleteIntervalTest(player);
		});
		
		img.src = imgUrl;
	}
	
	function checkComplete(player) {
		for (var component in player.skin) {
			if (component != 'properties') {
				for (var element in player.skin[component].elements) {
					if (!player.skin[component].elements[element].ready) {
						return;
					}
				}
			}
		}
		if (players[player.id].loading === false) {
			clearInterval(players[player.id].completeInterval);
			players[player.id].completeHandler();
		}
	}
	
	function completeImageLoad(img, element, component, player) {
		return function() {
			player.skin[component].elements[element].height = img.height;
			player.skin[component].elements[element].width = img.width;
			player.skin[component].elements[element].src = img.src;
			player.skin[component].elements[element].ready = true;
			resetCompleteIntervalTest(player);
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
