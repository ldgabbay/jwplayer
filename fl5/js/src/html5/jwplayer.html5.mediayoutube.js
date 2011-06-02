/**
 * JW Player YouTube Media component
 *
 * @author pablo
 * @version 5.7
 */
(function(jwplayer) {

	var _states = {
		"ended": jwplayer.api.events.state.IDLE,
		"playing": jwplayer.api.events.state.PLAYING,
		"pause": jwplayer.api.events.state.PAUSED,
		"buffering": jwplayer.api.events.state.BUFFERING
	};
	
	var _css = jwplayer.utils.css;
	
	jwplayer.html5.mediayoutube = function(model, container) {
		var _eventDispatcher = new jwplayer.html5.eventdispatcher();
		jwplayer.utils.extend(this, _eventDispatcher);
		var _model = model;
		var _container = document.getElementById(container.id);
		var _state = jwplayer.api.events.state.IDLE;
		var _object, _embed;
		
		_init();
		
		function _setState(newstate) {
			if (_state != newstate) {
				var oldstate = _state;
				_model.state = newstate;
				_state = newstate;
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_PLAYER_STATE, {
					oldstate: oldstate,
					newstate: newstate
				});
			}
		}
		
		this.getDisplayElement = function() {
			return _container;
		};
		
		this.play = function() {
			if (_state == jwplayer.api.events.state.IDLE) {
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
					bufferPercent: 100
				});
				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL);
				_setState(jwplayer.api.events.state.PLAYING);
			} else if (_state == jwplayer.api.events.state.PAUSED) {
				_setState(jwplayer.api.events.state.PLAYING);
			}
		};
		
		
		/** Switch the pause state of the player. **/
		this.pause = function() {
			_setState(jwplayer.api.events.state.PAUSED);
		};
		
		
		/** Seek to a position in the video. **/
		this.seek = function(position) {
		};
		
		
		/** Stop playback and loading of the video. **/
		this.stop = function(clear) {
			if (!_utils.exists(clear)) {
				clear = true;
			}
			_model.position = 0;
			_setState(jwplayer.api.events.state.IDLE);
			if (clear) {
				_css(_object, { display: "none" });
//				_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			}
		}
		
		/** Change the video's volume level. **/
		this.volume = function(position) {
			_model.volume = position;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_VOLUME, {
				volume: Math.round(position)
			});
		};
		
		
		/** Switch the mute state of the player. **/
		this.mute = function(state) {
			_container.muted = state;
			_model.mute = state;
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_MUTE, {
				mute: state
			});
		};
		
		
		/** Resize the player. **/
		this.resize = function(width, height) {
			if (width * height > 0) {
				_object.width = _embed.width = width;
				_object.height = _embed.height = height;
			}
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_RESIZE, {
				fullscreen: _model.fullscreen,
				width: width,
				height: height
			});
		};
		
		
		/** Switch the fullscreen state of the player. **/
		this.fullscreen = function(state) {
			if (state === true) {
				this.resize("100%", "100%");
			} else {
				this.resize(_model.config.width, _model.config.height);
			}
		};
		
		
		/** Load a new video into the player. **/
		this.load = function(playlistItem) {
			_css(_object, { display: "block" });
			_embedItem(playlistItem);
			_setState(jwplayer.api.events.state.BUFFERING);
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER, {
				bufferPercent: 0
			});
			_eventDispatcher.sendEvent(jwplayer.api.events.JWPLAYER_MEDIA_LOADED);
			this.play();
		};
		
		this.hasChrome = function() {
			return (_state != jwplayer.api.events.state.IDLE);
		};
		
		function _embedItem(playlistItem) {
			var path = playlistItem.levels[0].file;
			path = ["http://www.youtube.com/v/", _getYouTubeID(path), "&amp;hl=en_US&amp;fs=1&autoplay=1"].join("");
			var objectParams = {
				movie: path,
				allowfullscreen: "true",
				allowscriptaccess: "always"
			};
			
			_object.innerHTML = "";
			
			for (var objectParam in objectParams) {
				var param = document.createElement("param");
				param.name = objectParam;
				param.value = objectParams[objectParam];
				_object.appendChild(param);
			}
			
			var embedParams = {
				src: path,
				type: "application/x-shockwave-flash",
				allowfullscreen: "true",
				allowscriptaccess: "always",
				width: _object.width,
				height: _object.height
			};
			for (var embedParam in embedParams) {
				_embed.setAttribute(embedParam, embedParams[embedParam]);
			}
			_object.appendChild(_embed);
			_object.style.zIndex = 2147483000;
		}
		
		function _init() {
			_object = document.createElement("object");
			_object.id = _container.id;
			
			_object.style.position = "absolute";
			_object.width = _model.config.width;
			_object.height = _model.config.height;

			if (_container.parentNode) {
				_container.parentNode.replaceChild(_object, _container);
			}
			_container = _object;
			
			_embed = document.createElement("embed");
			_object.appendChild(_embed);

			if (jwplayer.utils.isIOS() && _model.playlist && _model.playlist[_model.item]) {
				_embedItem(_model.playlist[_model.item]);
			}
		}
		
		
		/** Extract the current ID from a youtube URL.  Supported values include:
		 * http://www.youtube.com/watch?v=ylLzyHk54Z0
		 * http://www.youtube.com/watch#!v=ylLzyHk54Z0
		 * http://www.youtube.com/v/ylLzyHk54Z0
		 * http://youtu.be/ylLzyHk54Z0
		 * ylLzyHk54Z0
		 **/
		function _getYouTubeID(url) {
			var arr = url.split(/\?|\#\!/);
			var str = '';
			for (var i=0; i<arr.length; i++) {
				if (arr[i].substr(0, 2) == 'v=') {
					str = arr[i].substr(2);
				}
			}
			if (str == '') {
				if (url.indexOf('/v/') >= 0) {
					str = url.substr(url.indexOf('/v/') + 3);
				} else if (url.indexOf('youtu.be') >= 0) {
					str = url.substr(url.indexOf('youtu.be/') + 9);
				} else {
					str = url;
				}
			}
			if (str.indexOf('?') > -1) {
				str = str.substr(0, str.indexOf('?'));
			}
			if (str.indexOf('&') > -1) {
				str = str.substr(0, str.indexOf('&'));
			}
			
			return str;
		}
		
		this.embed = _embed;
		
		return this;
	};
})(jwplayer);
