/**
 * JW Player controller component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
jwplayer.html5.controller = function(player) {
	return {
		play: jwplayer.html5.controller.play(player),
		pause: jwplayer.html5.controller.pause(player),
		seek: jwplayer.html5.controller.seek(player),
		stop: jwplayer.html5.controller.stop(player),
		volume: jwplayer.html5.controller.volume(player),
		mute: jwplayer.html5.controller.mute(player),
		resize: jwplayer.html5.controller.resize(player),
		fullscreen: jwplayer.html5.controller.fullscreen(player),
		load: jwplayer.html5.controller.load(player),
		mediaInfo: jwplayer.html5.controller.mediaInfo(player),
		addEventListener: jwplayer.html5.controller.addEventListener(player),
		removeEventListener: jwplayer.html5.controller.removeEventListener(player),
		sendEvent: jwplayer.html5.controller.sendEvent(player)
	};
};

jwplayer.html5.controller._mediainfovariables = ["width","height","state","sources","source","position","buffer","duration","volume","mute","fullscreen"];

jwplayer.html5.controller.play = function(player) {
	return function() {
		try {
			switch (player._model.state) {
				case jwplayer.html5.states.IDLE:
					player.addEventListener(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, player._media.play);
					player._media.load(player._model.sources[player._model.source].file);
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
};


/** Switch the pause state of the player. **/
jwplayer.html5.controller.pause = function(player) {
	return function() {
		try {
			switch (player._model.state) {
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
};


/** Seek to a position in the video. **/
jwplayer.html5.controller.seek = function(player) {
	return function(position) {
		try {
			switch (player._model.state) {
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
};


/** Stop playback and loading of the video. **/
jwplayer.html5.controller.stop = function(player) {
	return function() {
		try {
			player._media.stop();
			return player;
		} catch (err) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, err);
		}
		return false;
	};
};


/** Get / set the video's volume level. **/
jwplayer.html5.controller.volume = function(player) {
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
};


/** Get / set the mute state of the player. **/
jwplayer.html5.controller.mute = function(player) {
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
};


/** Resizes the video **/
jwplayer.html5.controller.resize = function(player) {
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
};


/** Jumping the player to/from fullscreen. **/
jwplayer.html5.controller.fullscreen = function(player) {
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
};


/** Loads a new video **/
jwplayer.html5.controller.load = function(player) {
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
};


/** Returns the meta **/
jwplayer.html5.controller.mediaInfo = function(player) {
	return function() {
		try {
			var result = {};
			for (var index in jwplayer.html5.controller._mediainfoparameters) {
				var mediaparam = jwplayer.html5.controller._mediainfoparameters[index];
				result[mediaparam] = player._model[mediaparam];
			}
			return result;
		} catch (err) {
			jwplayer.html5.utils.log("error", err);
		}
		return false;
	};
};


/** Add an event listener. **/
jwplayer.html5.controller.addEventListener = function(player) {
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
};


/** Remove an event listener. **/
jwplayer.html5.controller.removeEventListener = function(player) {
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
};


/** Send an event **/
jwplayer.html5.controller.sendEvent = function(player) {
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
};

