/**
 * Embedder for the JW Player
 * @author Zach
 * @version 5.5
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
		pluginloader: undefined,
		
		constructor: function(playerApi) {
			this.api = playerApi;
			var mediaConfig = jwplayer.utils.mediaparser.parseMedia(this.api.container);
			this.config = new jwplayer.embed.config(jwplayer.utils.extend({}, jwplayer.embed.defaults, mediaConfig, this.api.config), this);
			this.pluginloader = new jwplayer.plugins.loadPlugins(this);
		},
		
		embedPlayer: function() {
			if (this.pluginloader.isComplete()) {
				for (var player = 0; player < this.players.length; player++) {
					if (this.players[player].type && jwplayer.embed[this.players[player].type]) {
						var configClone = this.config;
						if (this.players[player].config){
							configClone = jwplayer.utils.extend(jwplayer.utils.clone(this.config), this.players[player].config);
						}
						var embedder = new jwplayer.embed[this.players[player].type](document.getElementById(this.api.id), this.players[player], configClone, this.pluginloader, this.api);
						if (embedder.supportsConfig()) {
							embedder.embed();
							return;
						}
					}
				}
				jwplayer.utils.log("No suitable players found");
				new jwplayer.embed.logo(jwplayer.utils.extend({
					hide: true
				}, this.config.components.logo), "none", this.api.id);
			}
			this.setupEvents();
			
			return this.api;
		},
		
		setupEvents: function() {
			for (var evt in this.events) {
				if (typeof this.api[evt] == "function") {
					(this.api[evt]).call(this.api, this.events[evt]);
				}
			}
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
	
	jwplayer.api.PlayerAPI.prototype.registerPlugin = function(id, param1, param2) {
		jwplayer.plugins.registerPlugin(id, param1, param2);
	}
	
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
