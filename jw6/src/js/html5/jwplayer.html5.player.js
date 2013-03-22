/**
 * Main HTML5 player class
 *
 * @author pablo
 * @version 6.0
 */
(function(html5) {
	var utils = jwplayer.utils;
	
	html5.player = function(config) {
		var _api = this,
			_model, 
			_view, 
			_controller,
			_instreamPlayer;

		function _init() {
			_model = new html5.model(config); 
			_api.id = _model.id;
			_view = new html5.view(_api, _model); 
			_controller = new html5.controller(_model, _view);
			
			_api._model = _model;

			jwplayer.utils.css.block();
			
			_initializeAPI();
			
			var setup = new html5.setup(_model, _view, _controller);
			setup.addEventListener(jwplayer.events.JWPLAYER_READY, _readyHandler);
			setup.addEventListener(jwplayer.events.JWPLAYER_ERROR, _errorHandler);
			setup.start();

		}
		
		function _readyHandler(evt) {
			_controller.playerReady(evt);
			utils.css.unblock();
		}

		function _errorHandler(evt) {
			utils.log('There was a problem setting up the player: ', evt);
			utils.css.unblock();
		}

		function _normalizePlaylist() {
			var list = _model.playlist,
				arr = [];

			for (var i = 0; i < list.length; i++) {
				arr.push(_normalizePlaylistItem(list[i]));
			}

			return arr;
		}

		function _normalizePlaylistItem(item) {
			var obj = {
				'description':	item.description,
				'file':			item.file,
				'image':		item.image,
				'mediaid':		item.mediaid,
				'title':		item.title
			};

			for (var i in item) {
				obj[i] = item[i];
			}

			obj['sources'] = [];
			obj['tracks'] = [];
			if (item.sources.length > 0) {
				for (i in item.sources) {
					var source = item.sources[i];
					var sourceCopy = {
						file: source.file,
						type: source.type ? source.type : undefined,
						label: source.label,
						"default": source["default"] ? true : false
					};
					obj['sources'].push(sourceCopy);
				}
			}

			if (item.tracks.length > 0) {
				for (i in item.tracks) {
					var track = item.tracks[i];
					var trackCopy = {
						file: track.file,
						kind: track.kind ? track.kind : undefined,
						label: track.label,
						"default": track["default"] ? true : false
					};
					obj['tracks'].push(trackCopy);
				}
			}

			if (!item.file && item.sources.length > 0) {
				obj.file = item.sources[0].file;
			}

			return obj;
		}
		
		function _initializeAPI() {
			
			/** Methods **/
			_api.jwPlay = _controller.play;
			_api.jwPause = _controller.pause;
			_api.jwStop = _controller.stop;
			_api.jwSeek = _controller.seek;
			_api.jwSetVolume = _controller.setVolume;
			_api.jwSetMute = _controller.setMute;
			_api.jwLoad = _controller.load;
			_api.jwPlaylistNext = _controller.next;
			_api.jwPlaylistPrev = _controller.prev;
			_api.jwPlaylistItem = _controller.item;
			_api.jwSetFullscreen = _controller.setFullscreen;
			_api.jwResize = _view.resize;		
			_api.jwSeekDrag = _model.seekDrag;
			_api.jwSetStretching = _controller.setStretching;
			_api.jwGetQualityLevels = _controller.getQualityLevels;
			_api.jwGetCurrentQuality = _controller.getCurrentQuality;
			_api.jwSetCurrentQuality = _controller.setCurrentQuality;
			_api.jwGetCaptionsList = _controller.getCaptionsList;
			_api.jwGetCurrentCaptions = _controller.getCurrentCaptions;
			_api.jwSetCurrentCaptions = _controller.setCurrentCaptions;
			_api.jwSetControls = _view.setControls;
			_api.jwGetSafeRegion = _view.getSafeRegion; 
			_api.jwForceState = _view.forceState;
			_api.jwReleaseState = _view.releaseState;
			
			
			
			
			_api.jwGetPlaylistIndex = _statevarFactory('item');
			_api.jwGetPosition = _statevarFactory('position');
			_api.jwGetDuration = _statevarFactory('duration');
			_api.jwGetBuffer = _statevarFactory('buffer');
			_api.jwGetWidth = _statevarFactory('width');
			_api.jwGetHeight = _statevarFactory('height');
			_api.jwGetFullscreen = _statevarFactory('fullscreen');
			_api.jwGetVolume = _statevarFactory('volume');
			_api.jwGetMute = _statevarFactory('mute');
			_api.jwGetState = _statevarFactory('state');
			_api.jwGetStretching = _statevarFactory('stretching');
			_api.jwGetPlaylist = _normalizePlaylist;
			_api.jwGetControls = _statevarFactory('controls');


			/** InStream API **/
			_api.jwDetachMedia = _controller.detachMedia;
			_api.jwAttachMedia = _controller.attachMedia;
			
			_api.jwLoadInstream = function(item, options) {
				if (!_instreamPlayer) {
					_instreamPlayer = new html5.instream(_api, _model, _view, _controller);
				}
				setTimeout(function() {
					_instreamPlayer.load(item, options);
				}, 10);
			}
			
			_api.jwInstreamPlay = function() {
				if (_instreamPlayer) _instreamPlayer.jwInstreamPlay();
			}
			
			_api.jwInstreamPause = function() {
				if (_instreamPlayer) _instreamPlayer.jwInstreamPause();
			}
			
			_api.jwInstreamDestroy = function() {
				if (_instreamPlayer) _instreamPlayer.jwInstreamDestroy();
				_instreamPlayer = undefined;
			}

			_api.jwInstreamAddEventListener = function(type, listener) {
				if (_instreamPlayer) _instreamPlayer.jwInstreamAddEventListener(type, listener);
			} 
			_api.jwInstreamRemoveEventListener = function(type, listener) {
				if (_instreamPlayer) _instreamPlayer.jwInstreamRemoveEventListener(type, listener);
			}

			_api.jwPlayerDestroy = function() {
				if (_view) {
					_view.destroy();
				}
			}
			
			/** Events **/
			_api.jwAddEventListener = _controller.addEventListener;
			_api.jwRemoveEventListener = _controller.removeEventListener;
			
			/** Dock **/
			_api.jwDockAddButton = _view.addButton;
			_api.jwDockRemoveButton = _view.removeButton;
						
		}

		/** Getters **/
		
		function _statevarFactory(statevar) {
			return function() {
				return _model[statevar];
			};
		}
		


		_init();
	}
})(jwplayer.html5);

