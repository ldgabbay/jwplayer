/** A factory for API calls that either set listeners or return data **/
jwplayer.html5._api = function(player) {
	return {
		play: player._controller.play,
		pause: player._controller.pause,
		stop: player._controller.stop,
		seek: player._controller.seek,
		
		resize: player._controller.resize,
		fullscreen: player._controller.fullscreen,
		volume: player._controller.volume,
		mute: player._controller.mute,
		load: player._controller.load,
		
		addEventListener: player._controller.addEventListener,
		removeEventListener: player._controller.removeEventListener,
		sendEvent: player._controller.sendEvent,
		
		ready: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_READY),
		error: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_ERROR),
		complete: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE),
		state: jwplayer.html5._api.dataListenerFactory(player, 'state', jwplayer.html5.events.JWPLAYER_PLAYER_STATE),
		buffer: jwplayer.html5._api.dataListenerFactory(player, 'buffer', jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER),
		time: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_TIME),
		position: jwplayer.html5._api.dataListenerFactory(player, 'position'),
		duration: jwplayer.html5._api.dataListenerFactory(player, 'duration'),
		width: jwplayer.html5._api.dataListenerFactory(player, 'width'),
		height: jwplayer.html5._api.dataListenerFactory(player, 'height'),
		meta: jwplayer.html5._api.dataListenerFactory(player, null, jwplayer.html5.events.JWPLAYER_MEDIA_META)
	};
};

jwplayer.html5._api.dataListenerFactory = function(player, dataType, eventType) {
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
};