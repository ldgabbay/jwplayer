var settings = {
	players: function(location, players){
		var basepath = location.substring(0, location.indexOf("/js/test/examples") + 1);
		var defaults = {
			html5: {type:"html5"},
			//flash: {type:"flash", src:basepath+"bin-debug/player.swf"},
			flash: {type:"flash", src:basepath+"player.swf"},
			download: {type:"download"}
		};
		if (!players){
			return [defaults.html5, defaults.flash, defaults.download];
			//return [defaults.flash, defaults.html5, defaults.download];
		} else {
			var result = [];
			for (var player = 0; player < players.length; player++) {
				result.push(defaults[players[player]]);
			} 
			return result;
		}
	},
	
	modes:{
    flashonly: [{type:'flash',src:'../../../player.swf'}],
    html5only: [{type:'html5'}],
    flashhtml5: [{type:'flash',src:'../../../player.swf'},{type:'html5'}],
    flash: [{type:'flash',src:'../../../player.swf'},{type:'html5'}],
    html5: [{type:'html5'},{type:'flash',src:'../../../player.swf'}],
    standard: [{type:'flash',src:'../../../player.swf'},{type:'html5'},{type:'download'}]
 }

};