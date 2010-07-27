jwplayer = function(container) { return jwplayer.constuctor(container); };

jwplayer.constructor = function(container) {};

$jw = jwplayer;jwplayer.utils = function() {
};

/** Returns the true type of an object **/
// TODO: if not used elsewhere, remove this function
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
	var args = jwplayer.utils.extend['arguments'];
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
jwplayer.utils.html = function(element, content) {
	element.innerHTML = content;
};

/**
 * Detects whether the current browser is IE.
 * Technique from http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html 
 **/
jwplayer.utils.isIE = function() {
	return (!+"\v1");
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
	callbacks: {},
	
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
			// Todo: register new object
			return jwplayer.api.addPlayer(new jwplayer.api.PlayerAPI(_container)); 
		}
	} else if (typeof identifier == 'number') {
		return jwplayer.players[identifier];
	}

	return null;
};

jwplayer.api.playerByContainer = function(cont) {
	for(var p in jwplayer.players) {
		if (jwplayer.players[p].container == cont) {
			return jwplayer.players[p];
		}
	}
	return null;
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

// Can't make this a read-only getter, thanks to IE incompatibility.
jwplayer.players = jwplayer.api._players;

var _userPlayerReady = playerReady;

function playerReady(obj) {
	var cont = jwplayer(obj['id']);
	var api = jwplayer.api.playerByContainer(cont);
	api.player = cont;
	// Todo: setup event callbacks
	// Todo: run any queued up commands 
	
	if (_userPlayerReady && _userPlayerReady.call) {
		_userPlayerReady.call(this, obj);
	}		
}jwplayer.embed = function() {};

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