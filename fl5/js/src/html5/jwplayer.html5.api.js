/** 
 * A factory for API calls that either set listeners or return data
 *
 * @author zach
 * @version 5.7
 */
(function(jwplayer) {

	jwplayer.html5.api = function(container, options) {
		var _api = {};
				
		var _container = document.createElement('div');
		container.parentNode.replaceChild(_container, container);
		_container.id = container.id;
		
		_api.version = jwplayer.version;
		_api.id = _container.id;
		
		var _model = new jwplayer.html5.model(_api, _container, options);
		var _view = new jwplayer.html5.view(_api, _container, _model);
		var _controller = new jwplayer.html5.controller(_api, _container, _model, _view);
		
		_api.skin = new jwplayer.html5.skin();
		
		_api.jwPlay = function(state) {
			if (typeof state == "undefined") {
				_togglePlay();
			} else if (state.toString().toLowerCase() == "true") {
				_controller.play();
			} else {
				_controller.pause();
			}
		};
		_api.jwPause = function(state) {
			if (typeof state == "undefined") {
				_togglePlay();
			} else if (state.toString().toLowerCase() == "true") {
				_controller.pause();
			} else {
				_controller.play();
			}
		};
		function _togglePlay() {
			if (_model.state == jwplayer.api.events.state.PLAYING || _model.state == jwplayer.api.events.state.BUFFERING) {
				_controller.pause();
			} else {
				_controller.play();
			}
		}
		
		_api.jwStop = _controller.stop;
		_api.jwSeek = _controller.seek;
		_api.jwPlaylistItem = _controller.item;
		_api.jwPlaylistNext = _controller.next;
		_api.jwPlaylistPrev = _controller.prev;
		_api.jwResize = _controller.resize;
		_api.jwLoad = _controller.load;
		
		function _statevarFactory(statevar) {
			return function() {
				return _model[statevar];
			};
		}
		
		function _componentCommandFactory(componentName, funcName, args) {
			return function() {
				var comp = _model.plugins.object[componentName];
				if (comp && comp[funcName] && typeof comp[funcName] == "function") {
					comp[funcName].apply(comp, args);
				}
			};
		}
		
		_api.jwGetItem = _statevarFactory('item');
		_api.jwGetPosition = _statevarFactory('position');
		_api.jwGetDuration = _statevarFactory('duration');
		_api.jwGetBuffer = _statevarFactory('buffer');
		_api.jwGetWidth = _statevarFactory('width');
		_api.jwGetHeight = _statevarFactory('height');
		_api.jwGetFullscreen = _statevarFactory('fullscreen');
		_api.jwSetFullscreen = _controller.setFullscreen;
		_api.jwGetVolume = _statevarFactory('volume');
		_api.jwSetVolume = _controller.setVolume;
		_api.jwGetMute = _statevarFactory('mute');
		_api.jwSetMute = _controller.setMute;
		_api.jwGetStretching = _statevarFactory('stretching');
		
		_api.jwGetState = _statevarFactory('state');
		_api.jwGetVersion = function() {
			return _api.version;
		};
		_api.jwGetPlaylist = function() {
			return _model.playlist;
		};
		_api.jwGetPlaylistIndex = _api.jwGetItem;
		
		_api.jwAddEventListener = _controller.addEventListener;
		_api.jwRemoveEventListener = _controller.removeEventListener;
		_api.jwSendEvent = _controller.sendEvent;
		
		_api.jwDockSetButton = function(id, handler, outGraphic, overGraphic) {
			if (_model.plugins.object["dock"] && _model.plugins.object["dock"].setButton) {
				_model.plugins.object["dock"].setButton(id, handler, outGraphic, overGraphic);	
			}
		}
		
		_api.jwControlbarShow = _componentCommandFactory("controlbar", "show");
		_api.jwControlbarHide = _componentCommandFactory("controlbar", "hide");
		_api.jwDockShow = _componentCommandFactory("dock", "show");
		_api.jwDockHide = _componentCommandFactory("dock", "hide");
		_api.jwDisplayShow = _componentCommandFactory("display", "show");
		_api.jwDisplayHide = _componentCommandFactory("display", "hide");
		
		//UNIMPLEMENTED
		_api.jwGetLevel = function() {
		};
		_api.jwGetBandwidth = function() {
		};
		_api.jwGetLockState = function() {
		};
		_api.jwLock = function() {
		};
		_api.jwUnlock = function() {
		};
		
		var _playlistLoadComplete = _completeHandler(_model, _view, _controller); 
		
		function _finishLoad(model, view, controller) {
			return function() {
				model.addEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistLoadComplete);
				if (model.config.playlistfile) {
					model.loadPlaylist(model.config.playlistfile);
				} else if (typeof model.config.playlist == "array") {
					model.loadPlaylist(model.config.file);
				} else {
					model.loadPlaylist(model.config);
				}
			};
		}
		
		function _completeHandler(model, view, controller) {
			return function(evt) {
				model.removeEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _playlistLoadComplete);
				model.setupPlugins();
				view.setup();
				var evt = {
						id: _api.id,
						version: _api.version
				};
				controller.sendEvent(jwplayer.api.events.JWPLAYER_READY, evt);
				if (jwplayer.utils.exists(playerReady)) {
					playerReady(evt);
				}
			
				if (jwplayer.utils.exists(window[model.config.playerReady])) {
					window[model.config.playerReady](evt);
				}
			
				model.sendEvent(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, {
					"playlist": model.playlist
				});
			
				if (model.config.autostart && !jwplayer.utils.isIOS()) {
					controller.item(model.item);
				}			
			}
		}
		
		if (_model.config.chromeless && !jwplayer.utils.isIPad()) {
			setTimeout(_finishLoad(_model, _view, _controller), 25);
		} else {
			_api.skin.load(_model.config.skin, _finishLoad(_model, _view, _controller));
		}
		return _api;
	};
	
})(jwplayer);
