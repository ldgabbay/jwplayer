jwplayer().registerPlugin('hd', function(player, div, config){
	this.resize = function (width, height){
		div.style.color = "white";
		div.innerHTML = config.text;
	};
}, '/player-5.5a/js/test/examples/plugins/hd-1.swf');