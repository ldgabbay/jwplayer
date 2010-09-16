/**
 * JW Player playlist model
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	jwplayer.html5.playlist = function(config) {
		var _playlist = [];
		if (config.playlist && config.playlist.length > 0) {
			_playlist = config.playlist;
		} else {
			_playlist.push(new jwplayer.html5.playlistitem(config));
		}
		return _playlist;
	};
	
})(jwplayer);
