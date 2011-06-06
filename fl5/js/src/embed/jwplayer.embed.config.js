/**
 * Configuration for the JW Player Embedder
 * @author Zach
 * @version 5.6
 */
(function(jwplayer) {
	function _playerDefaults() {
		return [{
			type: "flash",
			src: "/jwplayer/player.swf"
		}, {
			type: 'html5'
		}, {
			type: 'download'
		}];
	}
	
	function _isPosition(string) {
		var lower = string.toLowerCase();
		var positions = ["left", "right", "top", "bottom"];
		
		for (var position = 0; position < positions.length; position++) {
			if (lower == positions[position]) {
				return true;
			}
		}
		
		return false;
	}
	
	function _isPlaylist(property) {
		var result = false;
		// XML Playlists
		// (typeof property == "string" && !_isPosition(property)) ||
		// JSON Playlist
		result = (property instanceof Array) ||
		// Single playlist item as an Object
		(typeof property == "object" && !property.position && !property.size);
		return result;
	}
	
	function getSize(size) {
		if (typeof size == "string") {
			if (parseInt(size).toString() == size || size.toLowerCase().indexOf("px") > -1) {
				return parseInt(size);
			} 
		}
		return size;
	}
	
	var components = ["playlist", "dock", "controlbar", "logo"];
	
	function getPluginNames(config) {
		var pluginNames = {};
		switch(jwplayer.utils.typeOf(config.plugins)){
			case "object":
				for (var plugin in config.plugins) {
					pluginNames[jwplayer.utils.getPluginName(plugin)] = plugin;
				}
				break;
			case "string":
				var pluginArray = config.plugins.split(",");
				for (var i=0; i < pluginArray.length; i++) {
					pluginNames[jwplayer.utils.getPluginName(pluginArray[i])] = pluginArray[i];	
				}
				break;
		}
		return pluginNames;
	}
	
	function addConfigParameter(config, componentType, componentName, componentParameter){
		if (jwplayer.utils.typeOf(config[componentType]) != "object"){
			config[componentType] = {};
		}
		var componentConfig = config[componentType][componentName];

		if (jwplayer.utils.typeOf(componentConfig) != "object") {
			config[componentType][componentName] = componentConfig = {};
		}

		if (componentParameter) {
			if (componentType == "plugins") {
				var pluginName = jwplayer.utils.getPluginName(componentName);
				componentConfig[componentParameter] = config[pluginName+"."+componentParameter];
				delete config[pluginName+"."+componentParameter];
			} else {
				componentConfig[componentParameter] = config[componentName+"."+componentParameter];
				delete config[componentName+"."+componentParameter];
			}
		}
	}
	
	jwplayer.embed.deserialize = function(config){
		var pluginNames = getPluginNames(config);
		
		for (var pluginId in pluginNames) {
			addConfigParameter(config, "plugins", pluginNames[pluginId]);
		}
		
		for (var parameter in config) {
			if (parameter.indexOf(".") > -1) {
				var path = parameter.split(".");
				var prefix = path[0];
				var parameter = path[1];

				if (jwplayer.utils.isInArray(components, prefix)) {
					addConfigParameter(config, "components", prefix, parameter);
				} else if (pluginNames[prefix]) {
					addConfigParameter(config, "plugins", pluginNames[prefix], parameter);
				}
			}
		}
		return config;
	}
	
	jwplayer.embed.config = function(config, embedder) {
		var parsedConfig = jwplayer.utils.extend({}, config);
		
		var _tempPlaylist;
		
		if (_isPlaylist(parsedConfig.playlist)){
			_tempPlaylist = parsedConfig.playlist;
			delete parsedConfig.playlist;
		}
		
		parsedConfig = jwplayer.embed.deserialize(parsedConfig);
		
		parsedConfig.height = getSize(parsedConfig.height);
		parsedConfig.width = getSize(parsedConfig.width);
		
		if (typeof parsedConfig.plugins == "string") {
			var pluginArray = parsedConfig.plugins.split(",");
			if (typeof parsedConfig.plugins != "object") {
				parsedConfig.plugins = {};
			}
			for (var plugin = 0; plugin < pluginArray.length; plugin++) {
				var pluginName = jwplayer.utils.getPluginName(pluginArray[plugin]);
				if (typeof parsedConfig[pluginName] == "object") {
					parsedConfig.plugins[pluginArray[plugin]] = parsedConfig[pluginName];
					delete parsedConfig[pluginName];
				} else {
					parsedConfig.plugins[pluginArray[plugin]] = {};
				}
			}
		}
						
		for (var component = 0; component < components.length; component++) {
			var comp = components[component];
			if (jwplayer.utils.exists(parsedConfig[comp])) {
				if (typeof parsedConfig[comp] != "object") {
					if (!parsedConfig.components[comp]) {
						parsedConfig.components[comp] = {};
					}
					if (comp == "logo") {
						parsedConfig.components[comp].file = parsedConfig[comp];
					} else {
						parsedConfig.components[comp].position = parsedConfig[comp];
					}
					delete parsedConfig[comp];
				} else {
					if (!parsedConfig.components[comp]) {
						parsedConfig.components[comp] = {};
					}
					jwplayer.utils.extend(parsedConfig.components[comp], parsedConfig[comp]);
					delete parsedConfig[comp];
				}
			} 
 
			if (typeof parsedConfig[comp+"size"] != "undefined") {
				if (!parsedConfig.components[comp]) {
					parsedConfig.components[comp] = {};
				}
				parsedConfig.components[comp].size = parsedConfig[comp+"size"];
				delete parsedConfig[comp+"size"];
			}
		}
		
		// Special handler for the display icons setting
		if (typeof parsedConfig.icons != "undefined"){
			if (!parsedConfig.components.display) {
					parsedConfig.components.display = {};
				}
			parsedConfig.components.display.icons = parsedConfig.icons;
			delete parsedConfig.icons;
		}
		
		if (parsedConfig.players) {
			parsedConfig.modes = parsedConfig.players;
			delete parsedConfig.players;
		}
		
		var _modes;
		if (parsedConfig.flashplayer && !parsedConfig.modes) {
			_modes = _playerDefaults();
			_modes[0].src = parsedConfig.flashplayer;
			delete parsedConfig.flashplayer;
		} else if (parsedConfig.modes) {
			if (typeof parsedConfig.modes == "string") {
				_modes = _playerDefaults();
				_modes[0].src = parsedConfig.modes;
			} else if (parsedConfig.modes instanceof Array) {
				_modes = parsedConfig.modes;
			} else if (typeof parsedConfig.modes == "object" && parsedConfig.modes.type) {
				_modes = [parsedConfig.modes];
			}
			delete parsedConfig.modes;
		} else {
			_modes = _playerDefaults();
		}
		parsedConfig.modes = _modes;
		
		if (_tempPlaylist) {
			parsedConfig.playlist = _tempPlaylist;
		}
		
		return parsedConfig;
	};
	
})(jwplayer);
