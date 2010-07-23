jwplayer = function(container) { return jwplayer.constuctor(container); };

jwplayer.constructor = function(container) {};

$jw = jwplayer;jwplayer.utils = function() {
};

/** Returns the true type of an object **/
jwplayer.utils.typeOf = function(value) {
	var s = typeof value;
	if (s === 'object') {
		if (value) {
			if (value instanceof Array) {
				s = 'array';
			}
		} else {
			s = 'null';
		}
		}
	return s;
};

/** Merges a list of objects **/
jwplayer.utils.extend = function() {
	var args = extend['arguments'];
	if (args.length > 0) {
		for (var i = args.length - 1; i > 0; i--){
			for (element in args[i]) {
				args[i-1][element] = args[i][element];
			}
		}
		return args[0];		
	}
	return null;
};

/** Updates the contents of an HTML element **/
jwplayer.utils.html = function(element, content){
	element.innerHTML = content;
};jwplayer.utils.selectors = function(selector){
	selector = jwplayer.utils.strings.trim(selector);
	var selectType = selector.charAt(0);
	if (selectType == "#"){
		return document.getElementById(selector.substr(1));
	} else if (selectType == "."){
		if (document.getElementsByClassName) {
			return document.getElementsByClassName(selector.substr(1));
		} else {
			return jwplayer.utils.selectors.getElementsByTagAndClass("*", selector.substr(1));
		}
	} else {
		if (selector.indexOf(".") > 0){
			selectors = selector.split(".");
			return jwplayer.utils.selectors.getElementsByTagAndClass(selectors[0], selectors[1]);
		} else {
			return document.getElementsByTagName(selector);
		}
	}
	return null;
};

jwplayer.utils.selectors.getElementsByTagAndClass = function(tagName, className){
	elements = [];
	var selected = document.getElementsByTagName(tagName);
	for (var i = 0; i < selected.length; i++){
		if (selected[i].className !== undefined){
			var classes = selected[i].className.split(" ");
			for (var classIndex = 0; classIndex < classes.length; classIndex++){
				if (classes[classIndex] == className){
					elements.push(selected[i]);
				}
			}
		}
	}
	return elements;
};jwplayer.utils.strings = function(){};

jwplayer.utils.strings.trim = function(inputString){
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};
jwplayer.constuctor = function(container) {
	return jwplayer.api.selectPlayer(container);
};

jwplayer.api = function() {};

jwplayer.api._players = [];

jwplayer.api.PlayerAPI = function(container) {
	this.container = container;
	this.id = container.id;
};

jwplayer.api.PlayerAPI.prototype = {
	// Player properties
	container: undefined,
	player: undefined,
	options: undefined,
	id: undefined,
	
	// Player Getters
	getBuffer: function() { return undefined; },
	getFullscreen: function() { return undefined; },
	getLockState: function() { return undefined; },
	getMeta: function() { return undefined; },
	getMute: function() { return undefined; },
	getPlaylist: function() { return undefined; },
	getPlaylistItem: function() { return undefined; },
	getHeight: function() { return undefined; },
	getWidth: function() { return undefined; },
	getState: function() { return undefined; },
	getPosition: function() { return undefined; },
	getDuration: function() { return undefined; },
	getVolume: function() { return undefined; },
	
	// Player Public Methods
	setFullscreen: function() { return this; },
	setMute: function() { return this; },
	lock: function() { return this; },
	unlock: function() { return this; },
	load: function() { return this; },
	playlistItem: function() { return this; },
	playlistPrev: function() { return this; },
	playlistNext: function() { return this; },
	resize: function() { return this; },
	play: function() { return this; },
	pause: function() { return this; },
	stop: function() { return this; },
	seek: function() { return this; },
	setVolume: function() { return this; },
	
	// Player Events
	onBuffer: function() { return this; },
	onBufferFull: function() { return this; },
	onError: function() { return this; },
	onFullscreen: function() { return this; },
	onMeta: function() { return this; },
	onMute: function() { return this; },
	onPlaylist: function() { return this; },
	onPlaylistItem: function() { return this; },
	onReady: function() { return this; },
	onResize: function() { return this; },
	onState: function() { return this; },
	onComplete: function() { return this; },
	onTime: function() { return this; },
	onVolume: function() { return this; },

	// Player plugin API
	initializePlugin: function(pluginName, pluginCode) { return this; }
};

jwplayer.api.selectPlayer = function(identifier) {
	var _container;
	
	if (identifier == undefined) identifier = 0;
	
	if (identifier.nodeType) {
		// Handle DOM Element
		_container = identifier;
	} else if (typeof identifier == 'string') {
		// Find container by ID
		_container = document.getElementById(identifier);
	}
	
	if (_container) {  
		var foundPlayer = jwplayer.api.playerByContainer(_container);
		if (foundPlayer) {
			return foundPlayer; 
		} else {
			return new jwplayer.api.PlayerAPI(_container); 
		}
	} else if (typeof identifier == 'number') {
		return jwplayer.players[identifier];
	}

	return undefined;
};

jwplayer.api.playerByContainer = function(cont) {
	for(var p in jwplayer.players) {
		if (jwplayer.players[p].container == cont) {
			return jwplayer.players[p];
		}
	}
	return undefined;
};

jwplayer.api.addPlayer = function(player) {
	for (var i in jwplayer.players) {
		if (jwplayer.players[i] == player) {
			return player; // Player is already in the list;
		}
	}

	jwplayer.api._players.push(player);
	return player;
};

jwplayer.register = jwplayer.api.registerPlayer = function(player) {
	return jwplayer.api.addPlayer(player);
};

jwplayer.__defineGetter__('players', function() { return jwplayer.api._players.slice(0); });
jwplayer.embed = function() {};

jwplayer.embed.Embedder = function(playerApi) {
	this.constructor(playerApi);
};

jwplayer.embed.Embedder.prototype = {
	api: undefined,
	events: {},

	constructor: function(playerApi) {
		api = playerApi;
		console.log(this.api);
		console.log(api);
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
