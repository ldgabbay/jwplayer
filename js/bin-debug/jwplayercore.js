jwplayer.players = [];

jwplayer.prototype = {
	container: undefined,
	player: undefined,
	config: undefined,
	
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
jwplayer.utils = function(){};
jwplayer.utils.selectors = function(selector){
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
	for (element in document.getElementsByTagName(tagName)){
		if ((element.className !== undefined) && (element.className.indexOf(className) > 1)){
			elements.push(element);
		}			
	}
	return elements;
};
jwplayer.utils.strings = function(){};

jwplayer.utils.strings.trim = function(inputString){
	return inputString.replace(/^\s*/, "").replace(/\s*$/, "");
};
jwplayer = function() {};

jwplayer.utils = function(){};
jwplayer.utils.selectors = function(selector){
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
