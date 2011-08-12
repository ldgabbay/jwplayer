(function(jwplayer) {

	var template = function(player, config, div) {
		this.resize = function(width, height) {
			div.style.color = "white";
			div.innerHTML = width + " x " + height;
			var debug = document.getElementById(config.debug);
			if (debug) {
  			 debug.innerHTML += width + " x " + height + "<br/>";
			} else {
  			console.log(width, height);
			}
			
		};
	}
	
	jwplayer().registerPlugin('resizeplugin', template);
	
})(jwplayer);