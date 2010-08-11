/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _completeHandler;
	var _loading;
	
	/** Constructor **/
	jwplayer.html5.skinner = function(player, completeHandler) {
		_completeHandler = completeHandler;
		player.skin = {
			properties: {}
		};
		_load(player);
	};
	
	/** Load the skin **/
	function _load(player) {
		if (jwplayer.html5.utils.getAbsolutePath(player._model.config.skin) === undefined) {
			_loadSkin(player, jwplayer.html5.defaultSkin);
		} else {
			$.ajax({
				url: jwplayer.html5.utils.getAbsolutePath(player._model.config.skin),
				complete: function(xmlrequest, textStatus) {
					if (textStatus == "success") {
						_loadSkin(player, xmlrequest.responseXML);
					} else {
						_loadSkin(player, jwplayer.html5.defaultSkin);
					}
				}
				
			});
		}
		
	}
	
	
	function _loadSkin(player, xml) {
		var components = $('component', xml);
		if (components.length === 0) {
			return;
		}
		for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
			_loading = true;
			
			var componentName = $(components[componentIndex]).attr('name');
			var component = {
				settings: {},
				elements: {}
			};
			player.skin[componentName] = component;
			var elements = $(components[componentIndex]).find('element');
			for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
				_loadImage(elements[elementIndex], componentName, player);
			}
			var settings = $(components[componentIndex]).find('setting');
			for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
				player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
			}
			
			_loading = false;
			
			_resetCompleteIntervalTest(player);
		}
	}
	
	
	function _resetCompleteIntervalTest(player) {
		clearInterval(player.skin._completeInterval);
		player.skin._completeInterval = setInterval(function() {
			_checkComplete(player);
		}, 100);
	}
	
	
	/** Load the data for a single element. **/
	function _loadImage(element, component, player) {
		var img = new Image();
		var elementName = $(element).attr('name');
		var elementSource = $(element).attr('src');
		var imgUrl;
		if (elementSource.indexOf('data:image/png;base64,') === 0) {
			imgUrl = elementSource;
		} else {
			var skinUrl = jwplayer.html5.utils.getAbsolutePath(player._model.config.skin);
			var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
			imgUrl = [skinRoot, component, elementSource].join('/');
		}
				
		player.skin[component].elements[elementName] = {
			height: 0,
			width: 0,
			src: '',
			ready: false
		};
		
		$(img).load(_completeImageLoad(img, elementName, component, player));
		$(img).error(function() {
			player.skin[component].elements[elementName].ready = true;
			_resetCompleteIntervalTest(player);
		});
		
		img.src = imgUrl;
	}
	
	
	function _checkComplete(player) {
		for (var component in player.skin) {
			if (component != 'properties') {
				for (var element in player.skin[component].elements) {
					if (!player.skin[component].elements[element].ready) {
						return;
					}
				}
			}
		}
		if (_loading === false) {
			clearInterval(player.skin._completeInterval);
			_completeHandler();
		}
	}
	
	
	function _completeImageLoad(img, element, component, player) {
		return function() {
			player.skin[component].elements[element].height = img.height;
			player.skin[component].elements[element].width = img.width;
			player.skin[component].elements[element].src = img.src;
			player.skin[component].elements[element].ready = true;
			_resetCompleteIntervalTest(player);
		};
	}
	
	
	jwplayer.html5.skinner.hasComponent = function(player, component) {
		return (player.skin[component] !== null);
	};
	
	
	jwplayer.html5.skinner.getSkinElement = function(player, component, element) {
		try {
			return player.skin[component].elements[element];
		} catch (err) {
			jwplayer.html5.utils.log("No such skin component / element: ", [player, component, element]);
		}
		return null;
	};
	
	
	jwplayer.html5.skinner.addSkinElement = function(player, component, name, element) {
		try {
			player.skin[component][name] = element;
		} catch (err) {
			jwplayer.html5.utils.log("No such skin component ", [player, component]);
		}
	};
	
	jwplayer.html5.skinner.getSkinProperties = function(player) {
		return player.skin.properties;
	};
	
})(jwplayer);
