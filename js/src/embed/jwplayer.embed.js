jwplayer.embed = function() {};

jwplayer.embed.Embedder = function(playerApi) {
	this.constructor(playerApi);
};

jwplayer.embed.Embedder.prototype = {
	api: undefined,
	events: {},

	constructor: function(playerApi) {
		this.api = playerApi;
		this.parseConfig(api.config);
	},

	embedPlayer: function() {
		return api;
	},
	
	parseConfig: function(config) {
		if(config.events) {
			this.events = config.events;
		}
		return config;
	}

};

jwplayer.api.PlayerAPI.prototype.setup = function(options, player) {
	this.config = options;
	this.player = player;
	return (new jwplayer.embed.Embedder(this)).embedPlayer();
};
