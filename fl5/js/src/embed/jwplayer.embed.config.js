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
	
	function getPluginString(config) {
		var pluginString = "";
		switch(jwplayer.utils.typeOf(config.plugins)){
			case "object":
				for (var plugin in config.plugins) {
					pluginString += plugin+",";
				}
				break;
			case "string":
				pluginString = config.plugins+",";
				break;
		}
		return pluginString;
	}
	
	function addConfigParameter(config, componentType, componentName, componentParameter){
		if (jwplayer.utils.typeOf(config[componentType]) != "object"){
			config[componentType] = {};
		}
		if (jwplayer.utils.typeOf(config[componentType][componentName]) != "object"){
			config[componentType][componentName] = {};
		}
		config[componentType][componentName][componentParameter] = config[componentName+"."+componentParameter];
		delete config[componentName+"."+componentParameter];
	}
	
	jwplayer.embed.deserialize = function(config){
		var pluginstring = getPluginString(config);
		for (var parameter in config) {
			if (parameter.indexOf(".") > -1) {
				var path = parameter.split(".");
				var componentName = path[0];
				var componentParameter = path[1];
				if ((components.toString()+",").indexOf(componentName+",") > -1) {
					addConfigParameter(config, "components", componentName, componentParameter);
				} else if (pluginstring.indexOf(componentName+",") > -1) {
					addConfigParameter(config, "plugins", componentName, componentParameter);
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
			if (typeof parsedConfig[components[component]] == "string") {
				if (!parsedConfig.components[components[component]]) {
					parsedConfig.components[components[component]] = {};
				}
				if (components[component] == "logo") {
					parsedConfig.components[components[component]].file = parsedConfig[components[component]];
				} else {
					parsedConfig.components[components[component]].position = parsedConfig[components[component]];
				}
				delete parsedConfig[components[component]];
			} else if (typeof parsedConfig[components[component]] != "undefined") {
				if (!parsedConfig.components[components[component]]) {
					parsedConfig.components[components[component]] = {};
				}
				jwplayer.utils.extend(parsedConfig.components[components[component]], parsedConfig[components[component]]);
				delete parsedConfig[components[component]];
			}
			if (typeof parsedConfig[components[component]+"size"] != "undefined") {
				if (!parsedConfig.components[components[component]]) {
					parsedConfig.components[components[component]] = {};
				}
				parsedConfig.components[components[component]].size = parsedConfig[components[component]+"size"];
				delete parsedConfig[components[component]+"size"];
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
