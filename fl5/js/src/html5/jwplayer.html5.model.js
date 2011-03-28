/**
 * JW Player model component
 *
 * @author zach
 * @version 5.4
 */
(function(jwplayer) {
	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen", "item", "plugins", "stretching"];
	
	jwplayer.html5.model = function(api, container, options) {
		var _api = api;
		var _container = container;
		var _model = {
			id: _container.id,
			playlist: [],
			state: jwplayer.api.events.state.IDLE,
			position: 0,
			buffer: 0,
			config: {
				width: 480,
				height: 320,
				item: -1,
				skin: undefined,
				file: undefined,
				image: undefined,
				start: 0,
				duration: 0,
				bufferlength: 5,
				volume: 90,
				mute: false,
				fullscreen: false,
				repeat: "none",
				stretching: jwplayer.utils.stretching.UNIFORM,
				autostart: false,
				debug: undefined,
				screencolor: undefined
			}
		};
		var _media;
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		var _components = ["display", "logo", "controlbar", "dock"];
		
		jwplayer.utils.extend(_model, _eventDispatcher);
		
		for (var option in options) {
			if (typeof options[option] == "string") {
				var type = /color$/.test(option) ? "color" : null;
				options[option] = jwplayer.utils.typechecker(options[option], type);
			}
			var config = _model.config;
			var path = option.split(".");
			for (var edge in path) {
				if (edge == path.length - 1) {
					config[path[edge]] = options[option];
				} else {
					if (config[path[edge]] === undefined) {
						config[path[edge]] = {};
					}
					config = config[path[edge]];
				}
			}
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			_model[configurableStateVariable] = _model.config[configurableStateVariable];
		}
		
		var pluginorder = _components.concat([]);
		
		if (_model.plugins !== undefined) {
			if (typeof _model.plugins == "string") {
				var userplugins = _model.plugins.split(",");
				for (var userplugin in userplugins) {
					if (typeof userplugins[userplugin] == "string") {
						pluginorder.push(userplugins[userplugin].replace(/^\s+|\s+$/g, ""));
					}
				}
			}
		}
		
		if (typeof _model.config.chromeless == "undefined" && jwplayer.utils.isIOS()) {
			_model.config.chromeless = true;
		}
		
		if (_model.config.chromeless) {
			pluginorder = ["logo"];
			if (_model.config.repeat === undefined || _model.config.repeat == "none") {
				_model.config.repeat = "list";
			}
		}
		
		_model.plugins = {
			order: pluginorder,
			config: {},
			object: {}
		};
		
		if (typeof _model.config.components != "undefined") {
			for (var component in _model.config.components) {
				_model.plugins.config[component] = _model.config.components[component];
			}
		}
		
		for (var pluginIndex in _model.plugins.order) {
			var pluginName = _model.plugins.order[pluginIndex];
			var pluginConfig = _model.config[pluginName] === undefined ? {} : _model.config[pluginName];
			_model.plugins.config[pluginName] = _model.plugins.config[pluginName] === undefined ? pluginConfig : jwplayer.utils.extend(_model.plugins.config[pluginName], pluginConfig);
			if (typeof _model.plugins.config[pluginName].position == "undefined") {
				_model.plugins.config[pluginName].position = jwplayer.html5.view.positions.OVER;
			} else {
				_model.plugins.config[pluginName].position = _model.plugins.config[pluginName].position.toString().toUpperCase();
			}
		}
		
		// Fix the dock
		if (typeof _model.plugins.config.dock != "undefined") {
			if (typeof _model.plugins.config.dock != "object") {
				var position = _model.plugins.config.dock.toString().toUpperCase();
				_model.plugins.config.dock = {
					position: position
				}
			}
			
			if (typeof _model.plugins.config.dock.position != "undefined") {
				_model.plugins.config.dock.align = _model.plugins.config.dock.position;
				_model.plugins.config.dock.position = jwplayer.html5.view.positions.OVER;
			}
		}
		
		_model.loadPlaylist = function(arg, ready) {
			var input;
			if (typeof arg == "string") {
				try {
					input = eval(arg);
				} catch (err) {
					input = arg;
				}
			} else {
				input = arg;
			}
			var config;
			switch (jwplayer.utils.typeOf(input)) {
				case "object":
					config = input;
					break;
				case "array":
					config = {
						playlist: input
					};
					break;
				default:
					config = {
						file: input
					};
					break;
			}
			_model.playlist = new jwplayer.html5.playlist(config);
			if (_model.config.shuffle) {
				_model.item = _getShuffleItem();
			} else {
				if (_model.config.item >= _model.playlist.length) {
					_model.config.item = _model.playlist.length - 1;
				} else if (_model.config.item < 0) {
					_model.config.item = 0;
				}
				_model.item = _model.config.item;
			}
			if (!ready) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, {
					"playlist": _model.playlist
				});
			}
			_model.setActiveMediaProvider(_model.playlist[_model.item]);
		};
		
		function _getShuffleItem() {
			var result = null;
			if (_model.playlist.length > 1) {
				while (result === null) {
					result = Math.floor(Math.random() * _model.playlist.length);
					if (result == _model.item) {
						result = null;
					}
				}
			} else {
				result = 0;
			}
			return result;
		}
		
		function forward(evt) {
			if (evt.type == jwplayer.api.events.JWPLAYER_MEDIA_LOADED) {
				_container = _media.getDisplayElement();
			}
			_eventDispatcher.sendEvent(evt.type, evt);
		}
		
		_model.setActiveMediaProvider = function(playlistItem) {
			if (_media !== undefined) {
				_media.resetEventListeners();
			}
			_media = new jwplayer.html5.mediavideo(_model, _container);
			_media.addGlobalListener(forward);
			if (_model.config.chromeless) {
				_media.load(playlistItem);
			}
			return true;
		};
		
		_model.getMedia = function() {
			return _media;
		};
		
		_model.seek = function(pos) {
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_SEEK, {
				"position": _model.position,
				"offset": pos
			});
			return _media.seek(pos);
		};

		
		
		_model.setupPlugins = function() {
			for (var plugin in _model.plugins.order) {
				try {
					var pluginName = _model.plugins.order[plugin];
					if (jwplayer.html5[pluginName] !== undefined) {
						_model.plugins.object[pluginName] = new jwplayer.html5[pluginName](_api, _model.plugins.config[pluginName]);
					} else {
						_model.plugins.order.splice(plugin, plugin + 1);
					}
				} catch (err) {
					jwplayer.utils.log("Could not setup " + pluginName);
				}
			}
			
		};
		
		return _model;
	};
	
	
})(jwplayer);
