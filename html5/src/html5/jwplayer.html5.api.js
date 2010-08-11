/** 
 * A factory for API calls that either set listeners or return data
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5._api = function(player) {
		return {
			play: player._controller.play,
			pause: player._controller.pause,
			stop: player._controller.stop,
			seek: player._controller.seek,
			
			resize: player._controller.resize,
			//fullscreen: player._controller.fullscreen,
			//volume: player._controller.volume,
			//mute: player._controller.mute,
			load: player._controller.load,
			
			addEventListener: player._controller.addEventListener,
			removeEventListener: player._controller.removeEventListener,
			sendEvent: player._controller.sendEvent,
			
			//ready: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_READY),
			//error: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_ERROR),
			//complete: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE),
			//state: _dataListenerFactory(player, 'state', jwplayer.html5.events.JWPLAYER_PLAYER_STATE),
			//buffer: _dataListenerFactory(player, 'buffer', jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER),
			//time: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_TIME),
			//meta: _dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_META)
			
			getPosition: _dataListenerFactory(player, 'position'),
			getDuration: _dataListenerFactory(player, 'duration'),
			getBuffer: _dataListenerFactory(player, 'buffer'),
			getWidth: _dataListenerFactory(player, 'width'),
			getHeight: _dataListenerFactory(player, 'height'),
			getFullscreen: _dataListenerFactory(player, 'buffer'),
			setFullscreen: player._controller.fullscreen,
			getVolume: _dataListenerFactory(player, 'volume'),
			setVolume: player._controller.volume,
			getMute: _dataListenerFactory(player, 'mute'),
			setMute: player._controller.mute,
			
			getState: function(){
				return player._media.getState();
			},
			
			getConfig: function(){
				return player._model.config;
			},
			getVersion: function() {
				return player.version;
			},
			getPlaylist: function() {
				return player._model.playlist;
			},
			playlistItem: function(item) {
				return player._controller.item(item);
			},
			playlistNext: function() {
				return player._controller.next();
			},
			playlistPrev: function() {
				return player._controller.prev();
			},
			
			//UNIMPLEMENTED
			getLevel: function() {
			},
			getBandwidth: function() {
			},
			getLockState: function() {
			},
			lock: function() {
			},
			unlock: function() {
			}
			
		};
	};
	
	function _dataListenerFactory(player, dataType, eventType) {
		return function(arg) {
			switch (jwplayer.html5.utils.typeOf(arg)) {
				case "function":
					if (!jwplayer.html5.utils.isNull(eventType)) {
						player.addEventListener(eventType, arg);
					}
					break;
				default:
					if (!jwplayer.html5.utils.isNull(dataType)) {
						return player._controller.mediaInfo()[dataType];
					}
					return player._controller.mediaInfo();
			}
			return player;
		};
	}
	
})(jwplayer);
