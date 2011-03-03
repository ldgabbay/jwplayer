/**
 * Plugin package definition
 * @author zach
 * @version 5.5
 */
(function(jwplayer) {
	var _plugins = {};		
	
	jwplayer.plugins = function() {
	}
	
	jwplayer.plugins.loadPlugins = function(config) {
		return new jwplayer.plugins.pluginloader(new jwplayer.plugins.model(_plugins), config);
	}
	
	jwplayer.plugins.registerPlugin = function(id, arg1, arg2) {
		if (_plugins[id]) {
			_plugins[id].registerPlugin(id, arg1, arg2);
		}
	}
})(jwplayer);
