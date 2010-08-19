(function(jwplayer) {

	jwplayer.embed = function() {};
	
	jwplayer.embed.Embedder = function(playerApi) {
		var events = {},
			players = {},
			config = undefined,
			api = undefined;		
		this.constructor(playerApi);
	};
	
	jwplayer.embed.Embedder.prototype = {
		constructor: function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = this.parseConfig(jwplayer.utils.extend({}, mediaConfig, this.api.config));
		},
	
		embedPlayer: function() {
			// TODO: Parse playlist for playable content
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
				case 'flash':
					if (jwplayer.utils.hasFlash()) {
						//TODO: serialize levels & playlist, de-serialize in Flash
						if (this.config.levels || this.config.playlist) {
							this.api.onReady(this.loadAfterReady(this.config));
						}
						var flashPlayer = jwplayer.embed.embedFlash(this.api.container, player, this.config);
						this.api.container = flashPlayer;
						this.api.setPlayer(flashPlayer);
					} else {
						this.players.splice(0, 1);
						this.embedPlayer();
					}
					break;
				case 'html5':
					// todo: Check for presence of HTML5
					if (!jwplayer.utils.isIE()) {
						var html5player = jwplayer.embed.embedHTML5(this.api.container, player, this.config);
						this.api.setPlayer(html5player);
					} else {
						this.players.splice(0, 1);
						this.embedPlayer();
					}
					break;
				}
			} else {
				this.api.container.innerHTML = "<p>No suitable players found</p>";
			}
			return this.api;
		},
		
		loadAfterReady: function(loadParams) {
			return function(obj) {
				if (loadParams.playlist) {
					this.load(loadParams.playlist);
				} else if (loadParams.levels) {
					var item = this.getPlaylistItem(0);
					item.levels = loadParams.levels;
					this.load(item);
				}
			};
		},
		
		parseConfig: function(config) {
			var parsedConfig = jwplayer.utils.extend({}, config);
			if(parsedConfig.events) {
				this.events = parsedConfig.events;
				delete parsedConfig['events'];
			}
			if(parsedConfig.players) {
				this.players = parsedConfig.players;
				delete parsedConfig['players'];
			}
			if(parsedConfig.plugins) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parsePlugins(parsedConfig.plugins));
				}
			}
			return parsedConfig;
		}
	
	};
	
	jwplayer.embed.defaults = {
		width: 400,
		height: 300
	};
	
	jwplayer.embed.parseComponents = function(options) {
		if (options['components']) {
			var components = options['components'];
			for (var name in components) {
				var component = components[name];
				if (typeof component == "string") {
					options[name] = component;
				} else {
					for (var option in component) {
						options[name+'.'+option] = component[option];
					}
				}
			}
		}
	};
	
	jwplayer.embed.embedFlash = function(_container, _player, _options) {
		var params = jwplayer.utils.extend({}, jwplayer.embed.defaults, _options);
		
		var width = params.width; 
		delete params['width'];
		
		var height = params.height; 
		delete params['height'];
		
		// These properties are loaded after playerready; not sent in as flashvars.
		if (params.levels && params.levels.length && params.file === undefined) {
			params.file = params.levels[0]['file'];
		}
		
		delete params['levels'];
		delete params['playlist'];
		
		jwplayer.embed.parseComponents(params);
		
		if (jwplayer.utils.isIE()) {
			var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' + 
				'width="' + width + '" height="' + height + '" ' +
				'id="' + _container.id + '" name="' + _container.id +
				'">';
			html += '<param name="movie" value="' + _player.src + '">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="allowscriptaccess" value="always">';
			html += '<param name="flashvars" value="' + jwplayer.embed.jsonToFlashvars(params) +'">';
			html += '</object>';
			_container.outerHTML = html;
			return document.getElementById(_container.id);
		} else {
			var obj = document.createElement('object');
			obj.setAttribute('type', 'application/x-shockwave-flash');
			obj.setAttribute('data', _player.src);
			obj.setAttribute('width', width);
			obj.setAttribute('height', height);
			obj.setAttribute('id', _container.id);
			obj.setAttribute('name', _container.id);
			jwplayer.embed.appendAttribute(obj, 'allowfullscreen', 'true');
			jwplayer.embed.appendAttribute(obj, 'allowscriptaccess', 'always');
			jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed.jsonToFlashvars(params));
			_container.parentNode.replaceChild(obj, _container);
			return obj;
		}
		
	};
	
	jwplayer.embed.embedHTML5 = function(container, player, options) {
		if (jwplayer.html5) {
			container.innerHTML = "<p>Embedded HTML5 player goes here</p>";
			// TODO: remove this requirement from the html5 player (sources instead of levels)
			var playerOptions = jwplayer.utils.extend({}, jwplayer.embed.defaults, options);
			if (playerOptions.levels && !playerOptions.sources) playerOptions.sources = options.levels;
			return new (jwplayer.html5(container)).setup(playerOptions);
		} else {
			return null;
		}
	};
	
	jwplayer.embed.appendAttribute = function(object, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		object.appendChild(param);
	};
	
	jwplayer.embed.jsonToFlashvars = function(json) {
		var flashvars = '';
		for (key in json) {
			flashvars += key + '=' + escape(json[key]) + '&';
		}
		return flashvars.substring(0, flashvars.length-1);
	};
	
	jwplayer.embed.parsePlugins = function(pluginBlock) {
		if (!pluginBlock) return {};
		
		var flat = {},
			pluginKeys = [];
		
		for (plugin in pluginBlock) {
			var pluginName = plugin.indexOf('-') > 0 ? plugin.substring(0, plugin.indexOf('-')) : plugin;
			var pluginConfig = pluginBlock[plugin];
			pluginKeys.push(plugin);
			for (param in pluginConfig) {
				flat[pluginName+'.'+param] = pluginConfig[param];
			}
		}
		flat['plugins'] = pluginKeys.join(','); 
		return flat;
	};
	
	jwplayer.api.PlayerAPI.prototype.setup = function(options) {
		this.config = options;
		return (new jwplayer.embed.Embedder(this)).embedPlayer();
	};
	
})(jwplayer);