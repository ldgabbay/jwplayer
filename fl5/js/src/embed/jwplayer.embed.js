/**
 * Embedder for the JW Player
 * @author Pablo
 * @version 5.4
 */
(function(jwplayer) {

	jwplayer.embed = function() {
	};
	
	jwplayer.embed.Embedder = function(playerApi) {
		this.constructor(playerApi);
	};
	
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
	
	jwplayer.embed.defaults = {
		width: 400,
		height: 300,
		players: _playerDefaults(),
		components: {
			controlbar: {
				position: 'over'
			}
		}
	};
	
	jwplayer.embed.Embedder.prototype = {
		config: undefined,
		api: undefined,
		events: {},
		players: undefined,
		
		constructor: function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = this.parseConfig(jwplayer.utils.extend({}, jwplayer.embed.defaults, mediaConfig, this.api.config));
		},
		
		embedPlayer: function() {
			// TODO: Parse playlist for playable content
			var player = this.players[0];
			if (player && player.type) {
				switch (player.type) {
					case 'flash':
						if (jwplayer.utils.flashSupportsConfig(this.config)) {
							if (this.config.file && !this.config.provider) {
								switch (jwplayer.utils.extension(this.config.file).toLowerCase()) {
									case "webm":
									case "ogv":
									case "ogg":
										this.config.provider = "video";
										break;
								}
							}
							
							// TODO: serialize levels & playlist, de-serialize in
							// Flash
							if (this.config.levels || this.config.playlist) {
								this.api.onReady(this.loadAfterReady(this.config));
							}
							
							// Make sure we're passing the correct ID into Flash for
							// Linux API support
							this.config.id = this.api.id;
							
							var flashPlayer = jwplayer.embed.embedFlash(document.getElementById(this.api.id), player, this.config);
							this.api.container = flashPlayer;
							this.api.setPlayer(flashPlayer);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
					case 'html5':
						if (jwplayer.utils.browserSupportsConfig(this.config)) {
							var html5player = jwplayer.embed.embedHTML5(document.getElementById(this.api.id), player, this.config);
							this.api.container = document.getElementById(this.api.id);
							this.api.setPlayer(html5player);
						} else {
							this.players.splice(0, 1);
							return this.embedPlayer();
						}
						break;
					case 'download':
						// TODO: [ticket:1076]
						var downloadplayer = jwplayer.embed.embedDownloadLink(document.getElementById(this.api.id), player, this.config);
						this.api.container = document.getElementById(this.api.id);
						this.api.setPlayer(downloadplayer);
						break;
				}
			} else {
				this.api.container.innerHTML = "<p>No suitable players found</p>";
			}
			
			this.setupEvents();
			
			return this.api;
		},
		
		setupEvents: function() {
			for (evt in this.events) {
				if (typeof this.api[evt] == "function") {
					(this.api[evt]).call(this.api, this.events[evt]);
				}
			}
		},
		
		loadAfterReady: function(loadParams) {
			return function(obj) {
				if (loadParams.playlist) {
					this.load(loadParams.playlist);
				} else if (loadParams.levels) {
					var item = this.getPlaylistItem(0);
					if (!item) {
						item = {
							file: loadParams.levels[0].file,
							provider: (loadParams.provider ? loadParams.provider : "video")
						};
					}
					if (!item.image) {
						item.image = loadParams.image;
					}
					item.levels = loadParams.levels;
					this.load(item);
				}
			};
		},
		
		parseConfig: function(config) {
			var parsedConfig = jwplayer.utils.extend({}, config);
			if (parsedConfig.events) {
				this.events = parsedConfig.events;
				delete parsedConfig.events;
			}
			if (parsedConfig.players) {
				this.players = parsedConfig.players;
				delete parsedConfig.players;
			}
			if (parsedConfig.plugins) {
				if (typeof parsedConfig.plugins == "object") {
					parsedConfig = jwplayer.utils.extend(parsedConfig, jwplayer.embed.parsePlugins(parsedConfig.plugins));
				}
			}
			
			if (parsedConfig.playlist && typeof parsedConfig.playlist === "string" && !parsedConfig['playlist.position']) {
				parsedConfig['playlist.position'] = parsedConfig.playlist;
				delete parsedConfig.playlist;
			}
			
			if (parsedConfig.controlbar && typeof parsedConfig.controlbar === "string" && !parsedConfig['controlbar.position']) {
				parsedConfig['controlbar.position'] = parsedConfig.controlbar;
				delete parsedConfig.controlbar;
			}
			
			return parsedConfig;
		}
		
	};
	
	jwplayer.embed.embedFlash = function(_container, _player, _options) {
		var params = jwplayer.utils.extend({}, _options);
		
		var width = params.width;
		delete params.width;
		
		var height = params.height;
		delete params.height;
		
		delete params.levels;
		delete params.playlist;
		
		var wmode = "opaque";
		if (params.wmode) {
			wmode = params.wmode;
		}
		
		jwplayer.embed.parseConfigBlock(params, 'components');
		jwplayer.embed.parseConfigBlock(params, 'providers');
		
		if (jwplayer.utils.isIE()) {
			var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' +
			'width="' +
			width +
			'" height="' +
			height +
			'" ' +
			'id="' +
			_container.id +
			'" name="' +
			_container.id +
			'">';
			html += '<param name="movie" value="' + _player.src + '">';
			html += '<param name="allowfullscreen" value="true">';
			html += '<param name="allowscriptaccess" value="always">';
			html += '<param name="wmode" value="' + wmode + '">';
			html += '<param name="flashvars" value="' +
			jwplayer.embed.jsonToFlashvars(params) +
			'">';
			html += '</object>';
			if (_container.tagName.toLowerCase() == "video") {
				jwplayer.utils.mediaparser.replaceMediaElement(_container, html);
			} else {
				// TODO: This is not required to fix [ticket:1094], but we may want to do it anyway 
				// jwplayer.utils.setOuterHTML(_container, html);
				_container.outerHTML = html;
			}
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
			jwplayer.embed.appendAttribute(obj, 'wmode', wmode);
			jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed.jsonToFlashvars(params));
			_container.parentNode.replaceChild(obj, _container);
			return obj;
		}
	};
	
	jwplayer.embed.embedHTML5 = function(container, player, options) {
		if (jwplayer.html5) {
			container.innerHTML = "";
			var playerOptions = jwplayer.utils.extend({
				screencolor: '0x000000'
			}, options);
			jwplayer.embed.parseConfigBlock(playerOptions, 'components');
			// TODO: remove this requirement from the html5 player (sources
			// instead of levels)
			if (playerOptions.levels && !playerOptions.sources) {
				playerOptions.sources = options.levels;
			}
			if (playerOptions.skin && playerOptions.skin.toLowerCase().indexOf(".zip") > 0) {
				playerOptions.skin = playerOptions.skin.replace(/\.zip/i, ".xml");
			}
			return new (jwplayer.html5(container)).setup(playerOptions);
		} else {
			return null;
		}
	};
	
	jwplayer.embed.embedDownloadLink = function(_container, _player, _options) {
		var params = jwplayer.utils.extend({}, _options);
		
		var _display = {};
		var _width = _options.width ? _options.width : 480;
		if (typeof _width != "number") {
			_width = parseInt(_width, 10);
		}
		var _height = _options.height ? _options.height : 320;
		if (typeof _height != "number") {
			_height = parseInt(_height, 10);
		}
		var _file, _image, _cursor;
		
		var item = {};
		if (_options.playlist && _options.playlist.length) {
			item.file = _options.playlist[0].file;
			_image = _options.playlist[0].image;
			item.levels = _options.playlist[0].levels;
		} else {
			item.file = _options.file;
			_image = _options.image;
			item.levels = _options.levels;
		}
		
		if (item.file) {
			_file = item.file;
		} else if (item.levels && item.levels.length) {
			_file = item.levels[0].file;
		}
		
		_cursor = _file ? "pointer" : "auto";
		
		var _elements = {
			display: {
				style: {
					cursor: _cursor,
					width: _width,
					height: _height,
					backgroundColor: "#000",
					position: "relative",
					textDecoration: "none",
					border: "none",
					display: "block"
				}
			},
			display_icon: {
				style: {
					cursor: _cursor,
					position: "absolute",
					display: _file ? "block" : "none",
					top: 0,
					left: 0,
					border: 0,
					margin: 0,
					padding: 0,
					zIndex: 3,
					width: 50,
					height: 50,
					backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAALdJREFUeNrs18ENgjAYhmFouDOCcQJGcARHgE10BDcgTOIosAGwQOuPwaQeuFRi2p/3Sb6EC5L3QCxZBgAAAOCorLW1zMn65TrlkH4NcV7QNcUQt7Gn7KIhxA+qNIR81spOGkL8oFJDyLJRdosqKDDkK+iX5+d7huzwM40xptMQMkjIOeRGo+VkEVvIPfTGIpKASfYIfT9iCHkHrBEzf4gcUQ56aEzuGK/mw0rHpy4AAACAf3kJMACBxjAQNRckhwAAAABJRU5ErkJggg==)"
				}
			},
			display_iconBackground: {
				style: {
					cursor: _cursor,
					position: "absolute",
					display: _file ? "block" : "none",
					top: ((_height - 50) / 2),
					left: ((_width - 50) / 2),
					border: 0,
					width: 50,
					height: 50,
					margin: 0,
					padding: 0,
					zIndex: 2,
					backgroundImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEpJREFUeNrszwENADAIA7DhX8ENoBMZ5KR10EryckCJiIiIiIiIiIiIiIiIiIiIiIh8GmkRERERERERERERERERERERERGRHSPAAPlXH1phYpYaAAAAAElFTkSuQmCC)"
				}
			},
			display_image: {
				style: {
					width: _width,
					height: _height,
					display: _image ? "block" : "none",
					position: "absolute",
					cursor: _cursor,
					left: 0,
					top: 0,
					margin: 0,
					padding: 0,
					textDecoration: "none",
					zIndex: 1,
					border: "none"
				}
			}
		};
		
		var createElement = function(tag, element, id) {
			var _element = document.createElement(tag);
			if (id){
				_element.id = id;
			} else {
				_element.id = _container.id + "_jwplayer_" + element;
			}		
			jwplayer.utils.css(_element, _elements[element].style);
			return _element;
		};
		
		_display.display = createElement("a", "display", _container.id);
		if (_file) {
			_display.display.setAttribute("href", jwplayer.utils.getAbsolutePath(_file));
		}
		_display.display_image = createElement("img", "display_image");
		_display.display_image.setAttribute("alt", "Click to download...");
		if (_image) {
			_display.display_image.setAttribute("src", jwplayer.utils.getAbsolutePath(_image));
		}
		//TODO: Add test to see if browser supports base64 images?
		if (true) {
			_display.display_icon = createElement("div", "display_icon");
			_display.display_iconBackground = createElement("div", "display_iconBackground");
			_display.display.appendChild(_display.display_image);
			_display.display_iconBackground.appendChild(_display.display_icon);
			_display.display.appendChild(_display.display_iconBackground);
		}
		
		_container.parentNode.replaceChild(_display.display, _container);
		
		return _display.display;
	};
	
	jwplayer.embed.appendAttribute = function(object, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		object.appendChild(param);
	};
	
	jwplayer.embed.jsonToFlashvars = function(json) {
		var flashvars = 'netstreambasepath=' + escape(window.location.href) + '&';
		for (key in json) {
			flashvars += key + '=' + escape(json[key]) + '&';
		}
		return flashvars.substring(0, flashvars.length - 1);
	};
	
	jwplayer.embed.parsePlugins = function(pluginBlock) {
		if (!pluginBlock) {
			return {};
		}
		
		var flat = {}, pluginKeys = [];
		
		for (plugin in pluginBlock) {
			var pluginName = jwplayer.utils.getPluginName(plugin);
			var pluginConfig = pluginBlock[plugin];
			pluginKeys.push(plugin);
			for (param in pluginConfig) {
				flat[pluginName + '.' + param] = pluginConfig[param];
			}
		}
		flat.plugins = pluginKeys.join(',');
		return flat;
	};
	
	jwplayer.embed.parseConfigBlock = function(options, blockName) {
		if (options[blockName]) {
			var components = options[blockName];
			for (var name in components) {
				var component = components[name];
				if (typeof component == "string") {
					// i.e. controlbar="over"
					if (!options[name]) {
						options[name] = component;
					}
				} else {
					// i.e. controlbar.position="over"
					for (var option in component) {
						if (!options[name + '.' + option]) {
							options[name + '.' + option] = component[option];
						}
					}
				}
			}
			delete options[blockName];
		}
	};
	
	jwplayer.api.PlayerAPI.prototype.setup = function(options, players) {
		if (options && options.flashplayer && !options.players) {
			options.players = _playerDefaults();
			options.players[0].src = options.flashplayer;
			delete options.flashplayer;
		}
		if (players && !options.players) {
			if (typeof players == "string") {
				options.players = _playerDefaults();
				options.players[0].src = players;
			} else if (players instanceof Array) {
				options.players = players;
			} else if (typeof players == "object" && players.type) {
				options.players = [players];
			}
		}
		
		// Destroy original API on setup() to remove existing listeners
		var newId = this.id;
		this.remove();
		var newApi = jwplayer(newId);
		newApi.config = options;
		return (new jwplayer.embed.Embedder(newApi)).embedPlayer();
	};
	
	function noviceEmbed() {
		if (!document.body) {
			return setTimeout(noviceEmbed, 15);
		}
		var videoTags = jwplayer.utils.selectors.getElementsByTagAndClass('video', 'jwplayer');
		for (var i = 0; i < videoTags.length; i++) {
			var video = videoTags[i];
			jwplayer(video.id).setup({
				players: [{
					type: 'flash',
					src: '/jwplayer/player.swf'
				}, {
					type: 'html5'
				}]
			});
		}
	}
	
	noviceEmbed();
	
	
})(jwplayer);
