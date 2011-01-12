jwplayer().registerPlugin('hd', function(player, div, config){
	this.resize = function (width, height){
		div.style.color = "white";
		div.innerHTML = config.text;
	};
}, './hd-1.swf');