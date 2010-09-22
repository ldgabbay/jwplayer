/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen", "item", "plugins"];
	
	jwplayer.html5.model = function(api, container, options) {
		var _api = api;
		var _container = container;
		var _model = {
			id: _container.id,
			media: undefined,
			playlist: [],
			state: jwplayer.api.events.state.IDLE,
			position: 0,
			buffer: 0,
			config: {
				width: 480,
				height: 320,
				item: 0,
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
				autostart: false,
				debug: undefined,
				screencolor: undefined
			}
		};
		var _media;
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		var _components = ["display", "logo", "controlbar"];
		
		jwplayer.utils.extend(_model, _eventDispatcher);
		
		for (var option in options) {
			if (typeof options[option] == "string") {
				var type = /color$/.test(option) ? "color" : null;
				options[option] = jwplayer.html5.utils.typechecker(options[option], type);
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
			var userplugins = _model.plugins.split(",");
			for (var userplugin in userplugins){
				pluginorder.push(userplugin.replace(/^\s+|\s+$/g,""));
			}
		}
		
		if (jwplayer.utils.isIOS()){
			_model.config.chromeless = true;
		}
		
		if (_model.config.chromeless){
			pluginorder = [];
		}
				
		_model.plugins = {
			order: pluginorder,
			config: {
				controlbar: {
					position: jwplayer.html5.view.positions.BOTTOM
				}
			},
			object: {}
		};
		
		for (var pluginIndex in _model.plugins.order) {
			var pluginName = _model.plugins.order[pluginIndex];
			var pluginConfig = _model.config[pluginName] === undefined ? {} : _model.config[pluginName];
			_model.plugins.config[pluginName] = _model.plugins.config[pluginName] === undefined ? pluginConfig : jwplayer.utils.extend(_model.plugins.config[pluginName], pluginConfig);
			if (_model.plugins.config[pluginName].position === undefined) {
				_model.plugins.config[pluginName].position = jwplayer.html5.view.positions.OVER;
			}
		}
		
		_model.loadPlaylist = function(playlist, ready) {
			ready = ready === null ? true : false;
			_model.playlist = new jwplayer.html5.playlist(playlist);
			if (_model.config.shuffle) {
				_model.item = Math.floor(Math.random() * _model.playlist.length);
			} else {
				if (_model.config.item >= _model.playlist.length) {
					_model.config.item = _model.playlist.length - 1;
				}
				_model.item = _model.config.item;
			}
			if (ready) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED);
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, {
					"item": _model.item
				});
			}
			_model.setActiveMediaProvider(_model.playlist[_model.item]);
		};
		
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
				_media.embed(playlistItem);
			}
			return true;
		};
		
		_model.getMedia = function() {
			return _media;
		};
		

		_model.setupPlugins = function() {
			for (var plugin in _model.plugins.order) {
				if (jwplayer.html5[_model.plugins.order[plugin]] !== undefined) {
					_model.plugins.object[_model.plugins.order[plugin]] = new jwplayer.html5[_model.plugins.order[plugin]](_api, _model.plugins.config[_model.plugins.order[plugin]]);
				} else {
					_model.plugins.object[_model.plugins.order[plugin]] = new window[_model.plugins.order[plugin]](_api, _model.plugins.config[_model.plugins.order[plugin]]);
				}
			}
		};
		
		return _model;
	};
	
	
})(jwplayer);
