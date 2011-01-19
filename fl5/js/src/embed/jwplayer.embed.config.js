/**
 * Configuration for the JW Player Embedder
 * @author Zach
 * @version 5.5
 */
(function(jwplayer) {
	function _playerDefaults() {
		return [{
			type: "flash",
			src: "player.swf"
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
		result = (typeof property == "string" && !_isPosition(property)) ||
		// JSON Playlist
		(property instanceof Array) ||
		// Single playlist item as an Object
		(typeof property == "object" && !property.position && !property.size);
		return result;
	}
	
	jwplayer.embed.config = function(config, embedder) {
		var parsedConfig = jwplayer.utils.extend({}, config);
		
		/*
		 *  Special handler for playlists; has a component later for non-string playlists
		 *  This must be handled in two stages to allow things like playlist.position 
		 *  to be handled
		 */
		if (_isPlaylist(parsedConfig.playlist)) {
			parsedConfig.playlistfile = parsedConfig.playlist;
			delete parsedConfig.playlist;
		}
		
		for (var option in parsedConfig) {
			if (option.indexOf(".") > -1) {
				var path = option.split(".");
				var tempConfig = parsedConfig;
				for (var edge = 0; edge < path.length; edge++) {
					if (edge == path.length - 1) {
						if (jwplayer.utils.typeOf(tempConfig) == "object") {
							tempConfig[path[edge]] = parsedConfig[option];
							delete parsedConfig[option];
						}
					} else {
						if (tempConfig[path[edge]] === undefined) {
							tempConfig[path[edge]] = {};
						}
						tempConfig = tempConfig[path[edge]];
					}
				}
			}
		}
		
		if (typeof parsedConfig.plugins == "string") {
			var pluginArray = parsedConfig.plugins.split(",");
			for (var plugin = 0; plugin < pluginArray.length; plugin++) {
				var pluginName = jwplayer.utils.getPluginName(pluginArray[plugin]);
				if (typeof parsedConfig[pluginName] == "object") {
					if (typeof parsedConfig.plugins != "object") {
						parsedConfig.plugins = {};
					}
					parsedConfig.plugins[pluginArray[plugin]] = parsedConfig[pluginName];
					delete parsedConfig[pluginName];
				}
			}
		}
		
		var components = ["playlist", "dock", "controlbar"];
		
		for (var component = 0; component < components.length; component++) {
			if (typeof parsedConfig[components[component]] == "string") {
				if (!parsedConfig.components[components[component]]) {
					parsedConfig.components[components[component]] = {};
				}
				parsedConfig.components[components[component]].position = parsedConfig[components[component]];
				delete parsedConfig[components[component]];
			} else if (parsedConfig[components[component]]) {
				parsedConfig.components[components[component]] = parsedConfig[components[component]];
				delete parsedConfig[components[component]];
			}
		}
		
		// Special handler for playlists; This moves back non-string playlists
		if (typeof parsedConfig.playlistfile != "string") {
			parsedConfig.playlist = parsedConfig.playlistfile;
			delete parsedConfig.playlistfile;
		}
		
		if (parsedConfig.events) {
			embedder.events = parsedConfig.events;
			delete parsedConfig.events;
		}
		
		if (parsedConfig.flashplayer && !parsedConfig.players) {
			embedder.players = _playerDefaults();
			embedder.players[0].src = parsedConfig.flashplayer;
			delete parsedConfig.flashplayer;
		} else if (parsedConfig.players) {
			if (typeof parsedConfig.players == "string") {
				embedder.players = _playerDefaults();
				embedder.players[0].src = parsedConfig.players;
			} else if (parsedConfig.players instanceof Array) {
				embedder.players = parsedConfig.players;
			} else if (typeof parsedConfig.players == "object" && parsedConfig.players.type) {
				embedder.players = [parsedConfig.players];
			}
			delete parsedConfig.players;
		}
		
		return parsedConfig;
	};
	
})(jwplayer);
