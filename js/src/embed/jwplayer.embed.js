jwplayer.embed = function() {};

jwplayer.embed.Embedder = function(playerApi) {
	this.constructor(playerApi);
};

jwplayer.embed.Embedder.prototype = {
	api: undefined,
	config: undefined,
	events: {},
	players: {},

	constructor: function(playerApi) {
		this.api = playerApi;
		this.config = this.parseConfig(this.api.config);
	},

	embedPlayer: function() {
		var player = this.players[0];
		if (player && player.type) {
			switch (player.type) {
			case 'flash':
				jwplayer.embed.embedFlash(this.api.container, player, this.config);
			}
		}
		
		return this.api;
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
		return parsedConfig;
	}
	
};

jwplayer.embed.defaults = {
	width: 400,
	height: 300
};

jwplayer.embed.embedFlash = function(container, player, options) {
	var params = jwplayer.utils.extend({}, jwplayer.embed.defaults, options);
	
	var width = params.width; 
	delete params['width'];
	
	var height = params.height; 
	delete params['height'];
	
	if (jwplayer.utils.isIE()) {
		var html = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" ' + 
			'width="' + width + '" height="' + height + '" ' +
			'id="' + container.id + '" name="' + container.id +
			'">';
		html += '<param name="movie" value="' + player.src + '">';
		html += '<param name="allowfullscreen" value="true">';
		html += '<param name="allowscriptaccess" value="always">';
		html += '<param name="flashvars" value="' + jwplayer.embed.jsonToFlashvars(params) +'">';
		html += '</object>';
		container.outerHTML = html;
	} else {
		var obj = document.createElement('object');
		obj.setAttribute('type', 'application/x-shockwave-flash');
		obj.setAttribute('data', player.src);
		obj.setAttribute('width', width);
		obj.setAttribute('height', height);
		obj.setAttribute('id', container.id);
		obj.setAttribute('name', container.id);
		jwplayer.embed.appendAttribute(obj, 'allowfullscreen', 'true');
		jwplayer.embed.appendAttribute(obj, 'allowscriptaccess', 'always');
		jwplayer.embed.appendAttribute(obj, 'flashvars', jwplayer.embed.jsonToFlashvars(params));
		container.parentNode.replaceChild(obj, container);
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

jwplayer.api.PlayerAPI.prototype.setup = function(options, player) {
	this.config = options;
	this.player = player;
	return (new jwplayer.embed.Embedder(this)).embedPlayer();
};