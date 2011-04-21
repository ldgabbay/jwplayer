/**
 * JW Player namespace definition
 * @version 5.6
 */
var jwplayer = function(container) {
	if (jwplayer.api){
		return jwplayer.api.selectPlayer(container);
	}
};

var $jw = jwplayer;

jwplayer.version = '5.6.1763';
