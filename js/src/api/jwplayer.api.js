jwplayer.players = [];

jwplayer.constuctor = function(x) {
	if (!x) { return {}; }
	else {
		return jwplayer.api.selectPlayer(x);
	}
};

jwplayer.api = function(container) {
	this.container = container;
};

jwplayer.api.prototype = jwplayer.constructor.prototype = {
	container: undefined,
	player: undefined,
	config: undefined,
	id: undefined,
	
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
	onVolume: function() { return this; }
};

jwplayer.api.selectPlayer = function(identifier) {
	var _container;
	
	if (identifier.nodeType) {
		// Handle DOM Element
		_container = identifier;
	} else if (typeof identifier == 'string') {
		// Find container by ID
		_container = document.getElementById(identifier);
	}
	
	if (!_container) { return undefined; } 

	var foundPlayer = jwplayer.api.playerByContainer(_container);
	if (foundPlayer) { 
		return foundPlayer; 
	} else { 
		return new jwplayer.api(_container); 
	}
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

	jwplayer.players.push(player);
	return player;
};

jwplayer.register = jwplayer.api.registerPlayer = function(player) {
	return jwplayer.api.addPlayer(player);
};
