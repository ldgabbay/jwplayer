/**
 * JW Player Video Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
jwplayer.html5.mediavideo = function(player) {
	player._model.domelement.attr('loop', player._model.config.repeat);
	var media = {
		play: jwplayer.html5.mediavideo.play(player),
		pause: jwplayer.html5.mediavideo.pause(player),
		seek: jwplayer.html5.mediavideo.seek(player),
		stop: jwplayer.html5.mediavideo.stop(player),
		volume: jwplayer.html5.mediavideo.volume(player),
		mute: jwplayer.html5.mediavideo.mute(player),
		fullscreen: jwplayer.html5.mediavideo.fullscreen(player),
		load: jwplayer.html5.mediavideo.load(player),
		resize: jwplayer.html5.mediavideo.resize(player),
		state: jwplayer.html5.states.IDLE,
		interval: null,
		loadcount: 0,
		hasChrome: false
	};
	player._media = media;
	media.mute(player.mute());
	media.volume(player.volume());
	$.each(jwplayer.html5.mediavideo.events, function(event, handler) {
		player.domelement.addEventListener(event, function(event) {
			handler(event, player);
		}, true);
	});
};

jwplayer.html5.mediavideo.states = {
	"ended": jwplayer.html5.states.IDLE,
	"playing": jwplayer.html5.states.PLAYING,
	"pause": jwplayer.html5.states.PAUSED,
	"buffering": jwplayer.html5.states.BUFFERING
};

jwplayer.html5.mediavideo.events = {
	'abort': jwplayer.html5.mediavideo.generalHandler,
	'canplay': jwplayer.html5.mediavideo.stateHandler,
	'canplaythrough': jwplayer.html5.mediavideo.stateHandler,
	'durationchange': jwplayer.html5.mediavideo.metaHandler,
	'emptied': jwplayer.html5.mediavideo.generalHandler,
	'ended': jwplayer.html5.mediavideo.stateHandler,
	'error': jwplayer.html5.mediavideo.errorHandler,
	'loadeddata': jwplayer.html5.mediavideo.metaHandler,
	'loadedmetadata': jwplayer.html5.mediavideo.metaHandler,
	'loadstart': jwplayer.html5.mediavideo.stateHandler,
	'pause': jwplayer.html5.mediavideo.stateHandler,
	'play': jwplayer.html5.mediavideo.positionHandler,
	'playing': jwplayer.html5.mediavideo.stateHandler,
	'progress': jwplayer.html5.mediavideo.progressHandler,
	'ratechange': jwplayer.html5.mediavideo.generalHandler,
	'seeked': jwplayer.html5.mediavideo.stateHandler,
	'seeking': jwplayer.html5.mediavideo.stateHandler,
	'stalled': jwplayer.html5.mediavideo.stateHandler,
	'suspend': jwplayer.html5.mediavideo.stateHandler,
	'timeupdate': jwplayer.html5.mediavideo.positionHandler,
	'volumechange': jwplayer.html5.mediavideo.generalHandler,
	'waiting': jwplayer.html5.mediavideo.stateHandler,
	'canshowcurrentframe': jwplayer.html5.mediavideo.generalHandler,
	'dataunavailable': jwplayer.html5.mediavideo.generalHandler,
	'empty': jwplayer.html5.mediavideo.generalHandler,
	'load': jwplayer.html5.mediavideo.generalHandler,
	'loadedfirstframe': jwplayer.html5.mediavideo.generalHandler
};

jwplayer.html5.mediavideo.stateHandler = function(event, player) {
	if (jwplayer.html5.mediavideo.states[event.type]) {
		jwplayer.html5.mediavideo.setState(player, jwplayer.html5.mediavideo.states[event.type]);
	}
};


jwplayer.html5.mediavideo.setState = function(player, newstate) {
	if (player._media.stopped) {
		newstate = jwplayer.html5.states.IDLE;
	}
	if (player._model.state != newstate) {
		var oldstate = player._model.state;
		player._media.state = newstate;
		player._model.state = newstate;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_PLAYER_STATE, {
			oldstate: oldstate,
			newstate: newstate
		});
	}
	if (newstate == jwplayer.html5.states.IDLE) {
		clearInterval(player._media.interval);
		player._media.interval = null;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_COMPLETE);
		if (player._model.config.repeat && !player._media.stopped) {
			player.play();
		}
		if (player._model.domelement.css('display') != 'none') {
			player._model.domelement.css('display', 'none');
		}
	}
	player._media.stopped = false;
};


jwplayer.html5.mediavideo.metaHandler = function(event, player) {
	var meta = {
		height: event.target.videoHeight,
		width: event.target.videoWidth,
		duration: event.target.duration
	};
	if (player._model.duration === 0) {
		player._model.duration = event.target.duration;
	}
	player._model.sources[player._model.source] = $.extend(player._model.sources[player._model.source], meta);
	player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_META, meta);
};


jwplayer.html5.mediavideo.positionHandler = function(event, player) {
	if (player._media.stopped) {
		return;
	}
	if (!jwplayer.html5.utils.isNull(event.target)) {
		if (player._model.duration === 0) {
			player._model.duration = event.target.duration;
		}
		
		if (player._media.state == jwplayer.html5.states.PLAYING) {
			player._model.position = Math.round(event.target.currentTime * 10) / 10;
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_TIME, {
				position: Math.round(event.target.currentTime * 10) / 10,
				duration: Math.round(event.target.duration * 10) / 10
			});
		}
	}
	jwplayer.html5.mediavideo.progressHandler({}, player);
};


jwplayer.html5.mediavideo.progressHandler = function(event, player) {
	var bufferPercent, bufferTime, bufferFill;
	if (!isNaN(event.loaded / event.total)) {
		bufferPercent = event.loaded / event.total * 100;
		bufferTime = bufferPercent / 100 * (player._model.duration - player.domelement.currentTime);
	} else if ((player.domelement.buffered !== undefined) && (player.domelement.buffered.length > 0)) {
		maxBufferIndex = 0;
		if (maxBufferIndex >= 0) {
			bufferPercent = player.domelement.buffered.end(maxBufferIndex) / player.domelement.duration * 100;
			bufferTime = player.domelement.buffered.end(maxBufferIndex) - player.domelement.currentTime;
		}
	}
	
	bufferFill = bufferTime / player._model.config.bufferlength * 100;
	
	// TODO: Buffer underrun
	if (false) {
		if (bufferFill < 25 && player._media.state == jwplayer.html5.states.PLAYING) {
			jwplayer.html5.mediavideo.setState(jwplayer.html5.states.BUFFERING);
			player._media.bufferFull = false;
			if (!player.domelement.seeking) {
				player.domelement.pause();
			}
		} else if (bufferFill > 95 && player._media.state == jwplayer.html5.states.BUFFERING && player._media.bufferFull === false && bufferTime > 0) {
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
		}
	}
	
	if (player._media.bufferFull === false) {
		player._media.bufferFull = true;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER_FULL, {});
	}
	
	if (!player._media.bufferingComplete) {
		if (bufferPercent == 100 && player._media.bufferingComplete === false) {
			player._media.bufferingComplete = true;
		}
		
		if (!jwplayer.html5.utils.isNull(bufferPercent)) {
			player._model.buffer = Math.round(bufferPercent);
			player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_BUFFER, {
				bufferPercent: Math.round(bufferPercent)
				//bufferingComplete: player._media.bufferingComplete,
				//bufferFull: player._media.bufferFull,
				//bufferFill: bufferFill,
				//bufferTime: bufferTime
			});
		}
		
	}
};


jwplayer.html5.mediavideo.startInterval = function(player) {
	if (player._media.interval === null) {
		player._media.interval = window.setInterval(function() {
			jwplayer.html5.mediavideo.positionHandler({}, player);
		}, 100);
	}
};


jwplayer.html5.mediavideo.errorHandler = function(event, player) {
	player.sendEvent(jwplayer.html5.events.JWPLAYER_ERROR, {});
};


jwplayer.html5.mediavideo.play = function(player) {
	return function() {
		if (player._media.state != jwplayer.html5.states.PLAYING) {
			jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.PLAYING);
			player.domelement.play();
		}
	};
};


/** Switch the pause state of the player. **/
jwplayer.html5.mediavideo.pause = function(player) {
	return function() {
		player.domelement.pause();
	};
};


/** Seek to a position in the video. **/
jwplayer.html5.mediavideo.seek = function(player) {
	return function(position) {
		player.domelement.currentTime = position;
		player.domelement.play();
	};
};


/** Stop playback and loading of the video. **/
jwplayer.html5.mediavideo.stop = function(player) {
	return function() {
		player._media.stopped = true;
		player.domelement.pause();
		clearInterval(player._media.interval);
		player._media.interval = undefined;
		player._model.position = 0;
	};
};


/** Change the video's volume level. **/
jwplayer.html5.mediavideo.volume = function(player) {
	return function(position) {
		player._model.volume = position;
		player.domelement.volume = position / 100;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_VOLUME, {
			volume: Math.round(player.domelement.volume * 100)
		});
	};
};


/** Switch the mute state of the player. **/
jwplayer.html5.mediavideo.mute = function(player) {
	return function(state) {
		player._model.mute = state;
		player.domelement.muted = state;
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_MUTE, {
			mute: player.domelement.muted
		});
	};
};


/** Resize the player. **/
jwplayer.html5.mediavideo.resize = function(player) {
	return function(width, height) {
		// TODO: Fullscreen
		if (false) {
			$("#" + player.id + "_jwplayer").css("position", 'fixed');
			$("#" + player.id + "_jwplayer").css("top", '0');
			$("#" + player.id + "_jwplayer").css("left", '0');
			$("#" + player.id + "_jwplayer").css("width", width);
			$("#" + player.id + "_jwplayer").css("height", height);
			player._model.width = $("#" + player.id + "_jwplayer").width;
			player._model.height = $("#" + player.id + "_jwplayer").height;
		}
		player.sendEvent(jwplayer.html5.events.JWPLAYER_MEDIA_RESIZE, {
			fullscreen: player._model.fullscreen,
			width: width,
			hieght: height
		});
	};
};


/** Switch the fullscreen state of the player. **/
jwplayer.html5.mediavideo.fullscreen = function(player) {
	return function(state) {
		player._model.fullscreen = state;
		if (state === true) {
			player.resize("100%", "100%");
		} else {
			player.resize(player._model.config.width, player._model.config.height);
		}
	};
};


/** Load a new video into the player. **/
jwplayer.html5.mediavideo.load = function(player) {
	return function(path) {
		if (player._model.domelement.css('display') == 'none') {
			player._model.domelement.css('display', 'block');
		}
		
		setTimeout(function() {
			path = jwplayer.html5.utils.getAbsolutePath(path);
			if (path == player.domelement.src && player._media.loadcount > 0) {
				player._model.position = 0;
				player.domelement.currentTime = 0;
				jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.BUFFERING);
				jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.PLAYING);
				if (player.domelement.paused) {
					player.domelement.play();
				}
				return;
			} else if (path != player.domelement.src) {
				player._media.loadcount = 0;
			}
			player._media.loadcount++;
			player._media.bufferFull = false;
			player._media.bufferingComplete = false;
			jwplayer.html5.mediavideo.setState(player, jwplayer.html5.states.BUFFERING);
			player.domelement.src = path;
			player.domelement.load();
			jwplayer.html5.mediavideo.startInterval(player);
			try {
				player.domelement.currentTime = 0;
			} catch (err) {
			
			}
		}, 25);
	};
};
