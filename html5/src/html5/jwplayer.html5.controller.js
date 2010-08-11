/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.controller = function(player) {
		return {
			play: _play(player),
			pause: _pause(player),
			seek: _seek(player),
			stop: _stop(player),
			prev: _prev(player),
			next: _next(player),
			item: _item(player),
			volume: _volume(player),
			mute: _mute(player),
			resize: _resize(player),
			fullscreen: _fullscreen(player),
			load: _load(player),
			mediaInfo: _mediaInfo(player),
			addEventListener: _addEventListener(player),
			removeEventListener: _removeEventListener(player),
			sendEvent: _sendEvent(player)
		};
	};
	
	_mediainfovariables = ["width", "height", "state", "playlist", "item", "position", "buffer", "duration", "volume", "mute", "fullscreen"];
	
	function _play(player) {
		return function() {
			try {
				switch (player.getState()) {
					case jwplayer.html5.states.IDLE:
						player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, player._media.play);
						player._media.load(player._model.playlist[player._model.item]);
						break;
					case jwplayer.html5.states.PAUSED:
						player._media.play();
						break;
				}
				
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Switch the pause state of the player. **/
	function _pause(player) {
		return function() {
			try {
				switch (player.getState()) {
					case jwplayer.html5.states.PLAYING:
					case jwplayer.html5.states.BUFFERING:
						player._media.pause();
						break;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Seek to a position in the video. **/
	function _seek(player) {
		return function(position) {
			try {
				switch (player.getState()) {
					case jwplayer.html5.states.PLAYING:
					case jwplayer.html5.states.PAUSED:
					case jwplayer.html5.states.BUFFERING:
						player._media.seek(position);
						break;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Stop playback and loading of the video. **/
	function _stop(player) {
		return function() {
			try {
				player._media.stop();
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Stop playback and loading of the video. **/
	function _next(player) {
		return function() {
			try {
				if (player._model.item + 1 == player._model.playlist.length){
					return player.playlistItem(0);
				} else {
					return player.playlistItem(player._model.item + 1);
				}
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
		/** Stop playback and loading of the video. **/
	function _prev(player) {
		return function() {
			try {
				if (player._model.item === 0){
					return player.playlistItem(player._model.playlist.length - 1);
				} else {
					return player.playlistItem(player._model.item - 1);
				}
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	/** Stop playback and loading of the video. **/
	function _item(player) {
		return function(item) {
			try {
				var oldstate = player.getState();
				player.stop();
				player._model.item = item;
				player.sendEvent(jwplayer.html5.events.JWPLAYER_PLAYLIST_ITEM, {"item":item});
				if (oldstate == jwplayer.html5.states.PLAYING || oldstate == jwplayer.html5.states.BUFFERING){
					player.play();
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}	
	/** Get / set the video's volume level. **/
	function _volume(player) {
		return function(arg) {
			try {
				switch (jwplayer.html5.utils.typeOf(arg)) {
					case "function":
						player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, arg);
						break;
					case "number":
						player._media.volume(arg);
						return true;
					case "string":
						player._media.volume(parseInt(arg, 10));
						return true;
					default:
						return player._model.volume;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Get / set the mute state of the player. **/
	function _mute(player) {
		return function(arg) {
			try {
				switch (jwplayer.html5.utils.typeOf(arg)) {
					case "function":
						player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, arg);
						break;
					case "boolean":
						player._media.mute(arg);
						break;
					default:
						return player._model.mute;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Resizes the video **/
	function _resize(player) {
		return function(arg1, arg2) {
			try {
				switch (jwplayer.html5.utils.typeOf(arg1)) {
					case "function":
						player.addEventListener(jwplayer.html5.events.JWPLAYER_RESIZE, arg1);
						break;
					case "number":
						player._media.resize(arg1, arg2);
						break;
					case "string":
						player._media.resize(arg1, arg2);
						break;
					default:
						break;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Jumping the player to/from fullscreen. **/
	function _fullscreen(player) {
		return function(arg) {
			try {
				switch (jwplayer.html5.utils.typeOf(arg)) {
					case "function":
						player.addEventListener(jwplayer.html5.events.JWPLAYER_FULLSCREEN, arg);
						break;
					case "boolean":
						player._media.fullscreen(arg);
						break;
					default:
						return player._model.fullscreen;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Loads a new video **/
	function _load(player) {
		return function(arg) {
			try {
				switch (jwplayer.html5.utils.typeOf(arg)) {
					case "function":
						player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_LOADED, arg);
						break;
					default:
						player._media.load(arg);
						break;
				}
				return player;
			} catch (err) {
				player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
			}
			return false;
		};
	}
	
	
	/** Returns the meta **/
	function _mediaInfo(player) {
		return function() {
			try {
				var result = {};
				for (var index in _mediainfovariables) {
					var mediavar = _mediainfovariables[index];
					result[mediavar] = player._model[mediavar];
				}
				return result;
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
	}
	
	
	/** Add an event listener. **/
	function _addEventListener(player) {
		return function(type, listener, count) {
			try {
				if (player._listeners[type] === undefined) {
					player._listeners[type] = [];
				}
				player._listeners[type].push({
					listener: listener,
					count: count
				});
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
	}
	
	
	/** Remove an event listener. **/
	function _removeEventListener(player) {
		return function(type, listener) {
			try {
				for (var lisenterIndex in player._listeners[type]) {
					if (player._listeners[type][lisenterIndex] == listener) {
						player._listeners[type].slice(lisenterIndex, lisenterIndex + 1);
						break;
					}
				}
			} catch (err) {
				jwplayer.html5.utils.log("error", err);
			}
			return false;
		};
	}
	
	
	/** Send an event **/
	function _sendEvent(player) {
		return function(type, data) {
			data = $.extend({
				id: player.id,
				version: player.version
			}, data);
			if ((player._model.config.debug !== undefined) && (player._model.config.debug.toString().toLowerCase() == 'console')) {
				jwplayer.html5.utils.log(type, data);
			}
			for (var listenerIndex in player._listeners[type]) {
				try {
					player._listeners[type][listenerIndex].listener(data);
				} catch (err) {
					jwplayer.html5.utils.log("There was an error while handling a listener", err);
				}
				if (player._listeners[type][listenerIndex].count === 1) {
					delete player._listeners[type][listenerIndex];
				} else if (player._listeners[type][listenerIndex].count > 0) {
					player._listeners[type][listenerIndex].count = player._listeners[type][listenerIndex].count - 1;
				}
			}
		};
	}
	
})(jwplayer);
