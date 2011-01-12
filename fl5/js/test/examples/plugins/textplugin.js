jwplayer().registerPlugin('textplugin', function(player, div, config){
	this.resize = function (width, height){
		div.style.color = "white";
		div.innerHTML = config.text;
	};
});