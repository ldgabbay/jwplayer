/**
 * JW Player component that loads / interfaces PNG skinning.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */

/** Constructor **/
jwplayer.html5.skinner = function(player, completeHandler) {
	player.skin = {
		_completeHandler: completeHandler,
		properties: {}
	};
	jwplayer.html5.skinner.load(player);
};

/** Load the skin **/
jwplayer.html5.skinner.load = function(player) {
	$.ajax({
		url: jwplayer.html5.utils.getAbsolutePath(player._model.config.skin),
		complete: function(xmlrequest, textStatus) {
			if (textStatus == "success") {
				jwplayer.html5.skinner.loadSkin(player, xmlrequest.responseXML);
			} else {
				jwplayer.html5.skinner.loadSkin(player, jwplayer.html5.defaultSkin);
			}
		}
		
	});
};


jwplayer.html5.skinner.loadSkin = function(player, xml) {
	var components = $('component', xml);
	if (components.length === 0) {
		return;
	}
	for (var componentIndex = 0; componentIndex < components.length; componentIndex++) {
		player.skin._loading = true;
		
		var componentName = $(components[componentIndex]).attr('name');
		var component = {
			settings: {},
			elements: {}
		};
		player.skin[componentName] = component;
		var elements = $(components[componentIndex]).find('element');
		for (var elementIndex = 0; elementIndex < elements.length; elementIndex++) {
			jwplayer.html5.skinner.loadImage(elements[elementIndex], componentName, player);
		}
		var settings = $(components[componentIndex]).find('setting');
		for (var settingIndex = 0; settingIndex < settings.length; settingIndex++) {
			player.skin[componentName].settings[$(settings[settingIndex]).attr("name")] = $(settings[settingIndex]).attr("value");
		}
		
		player.skin._loading = false;
		
		jwplayer.html5.skinner.resetCompleteIntervalTest(player);
	}
};


jwplayer.html5.skinner.resetCompleteIntervalTest = function (player) {
	clearInterval(player.skin._completeInterval);
	player.skin._completeInterval = setInterval(function() {
		jwplayer.html5.skinner.checkComplete(player);
	}, 100);
};


/** Load the data for a single element. **/
jwplayer.html5.skinner.loadImage = function(element, component, player) {
	var img = new Image();
	var elementName = $(element).attr('name');
	var elementSource = $(element).attr('src');
	var skinUrl = jwplayer.html5.utils.getAbsolutePath(player._model.config.skin);
	var skinRoot = skinUrl.substr(0, skinUrl.lastIndexOf('/'));
	var imgUrl = (elementSource.indexOf('data:image/png;base64,') === 0) ? elementSource : [skinRoot, component, elementSource].join('/');
	
	player.skin[component].elements[elementName] = {
		height: 0,
		width: 0,
		src: '',
		ready: false
	};
	
	$(img).load(jwplayer.html5.skinner.completeImageLoad(img, elementName, component, player));
	$(img).error(function() {
		player.skin[component].elements[elementName].ready = true;
		jwplayer.html5.skinner.resetCompleteIntervalTest(player);
	});
	
	img.src = imgUrl;
};


jwplayer.html5.skinner.checkComplete = function(player) {
	for (var component in player.skin) {
		if (component != 'properties') {
			for (var element in player.skin[component].elements) {
				if (!player.skin[component].elements[element].ready) {
					return;
				}
			}
		}
	}
	if (player.skin._loading === false) {
		clearInterval(player.skin._completeInterval);
		player.skin._completeHandler();
	}
};


jwplayer.html5.skinner.completeImageLoad = function(img, element, component, player) {
	return function() {
		player.skin[component].elements[element].height = img.height;
		player.skin[component].elements[element].width = img.width;
		player.skin[component].elements[element].src = img.src;
		player.skin[component].elements[element].ready = true;
		jwplayer.html5.skinner.resetCompleteIntervalTest(player);
	};
};


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

