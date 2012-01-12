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

function getVariable(name) {
	var regex = new RegExp(name+"=([\\w\\,]+)");
	var match = window.location.href.match(regex);
	if (match && match.length > 1) {
		return match[1];
	} else {
		return "";
	}
}

function setDefault(name) {
	var val = getVariable(name);
	if (val) {
		document.getElementById(name+"_"+val).selected = true;
	}
}
