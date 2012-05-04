/** 
 * API to control instream playback without interrupting currently playing video
 *
 * @author pablo
 * @version 5.9
 */
(function(jwplayer) {
	var _utils = jwplayer.utils;
	
	jwplayer.html5.instream = function(api, model, view, controller) {
		var _defaultOptions = {
			controlbarseekable:"always",
			controlbarpausable:true,
			controlbarstoppable:true,
			playlistclickable:true
		};
		
		var _item,
			_options,
			_api=api, _model=model, _view=view, _controller=controller,
			_video, _oldsrc, _oldsources, _oldpos, _oldstate, _olditem,
			_provider, _cbar, _disp, _instreamMode = false,
			_dispatcher, _instreamContainer,
			_self = this;


		/*****************************************
		 *****  Public instream API methods  *****
		 *****************************************/

		/** Load an instream item and initialize playback **/
		this.load = function(item, options) {
			// Update the instream player's model
			_copyModel();
			// Sets internal instream mode to true
			_instreamMode = true;
			// Instream playback options
			_options = _utils.extend(_defaultOptions, options);
			// Copy the playlist item passed in and make sure it's formatted as a proper playlist item
			_item = jwplayer.html5.playlistitem(item);
			// Create (or reuse) video media provider.  No checks right now to make sure it's a valid playlist item (i.e. provider="video").
			_setupProvider();
			// Create the container in which the controls will be placed
			_instreamContainer = document.createElement("div");
			_instreamContainer.id = _self.id + "_instream_container";
			// Make sure the original player's provider stops broadcasting events (pseudo-lock...)
			_controller.detachMedia();
			// Get the video tag
			_video = _provider.getDisplayElement();
			// Store this to compare later (in case the main player switches to the next playlist item when we switch out of instream playback mode 
			_olditem = _model.playlist[_model.item];
			// Keep track of the original player state
			_oldstate = _api.jwGetState();
			// If the player's currently playing, pause the video tag
			if (_oldstate == jwplayer.api.events.state.BUFFERING || _oldstate == jwplayer.api.events.state.PLAYING) {
				_video.pause();
			}
			
			// Copy the video src/sources tags and store the current playback time
			_oldsrc = _video.src ? _video.src : _video.currentSrc;
			_oldsources = _video.innerHTML;
			_oldpos = _video.currentTime;
			
			// Instream display component
			_disp = new jwplayer.html5.display(_self, _utils.extend({},_model.plugins.config.display));
			_disp.setAlternateClickHandler(function(evt) {
				if (_fakemodel.state == jwplayer.api.events.state.PAUSED) {
					_self.jwInstreamPlay();
				} else {
					_sendEvent(jwplayer.api.events.JWPLAYER_INSTREAM_CLICK, evt);
				}
			});
			_instreamContainer.appendChild(_disp.getDisplayElement());

			// Instream controlbar (if not iOS/Android)
			if (!_utils.isMobile()) {
				_cbar = new jwplayer.html5.controlbar(_self, _utils.extend({},_model.plugins.config.controlbar, {}));
				if (_model.plugins.config.controlbar.position == jwplayer.html5.view.positions.OVER) {
					_instreamContainer.appendChild(_cbar.getDisplayElement());
				} else {
					var cbarParent = _model.plugins.object.controlbar.getDisplayElement().parentNode;
					cbarParent.appendChild(_cbar.getDisplayElement());
				}
			}

			// Show the instream layer
			_view.setupInstream(_instreamContainer, _video);
			// Resize the instream components to the proper size
			_resize();
			// Load the instream item
			_provider.load(_item);
			
		}
			
		/** Stop the instream playback and revert the main player back to its original state **/
		this.jwInstreamDestroy = function(complete) {
			if (!_instreamMode) return;
			// We're not in instream mode anymore.
			_instreamMode = false;
			if (_oldstate != jwplayer.api.events.state.IDLE) {
				// Load the original item into our provider, which sets up the regular player's video tag
				_provider.load(_olditem, false);
				// We don't want the position interval to be running anymore
				_provider.stop(false);
			} else {
				_provider.stop(true);
			}
			// We don't want the instream provider to be attached to the video tag anymore
			_provider.detachMedia();
			// Return the view to its normal state
			_view.destroyInstream();
			// If we added the controlbar anywhere, let's get rid of it
			if (_cbar) try { _cbar.getDisplayElement().parentNode.removeChild(_cbar.getDisplayElement()); } catch(e) {}
			// Let listeners know the instream player has been destroyed, and why
			_sendEvent(jwplayer.api.events.JWPLAYER_INSTREAM_DESTROYED, {reason:(complete ? "complete":"destroyed")}, true);
			// Re-attach the controller
			_controller.attachMedia();
			if (_oldstate == jwplayer.api.events.state.BUFFERING || _oldstate == jwplayer.api.events.state.PLAYING) {
				// Model was already correct; just resume playback
				_video.play();
				if (_model.playlist[_model.item] == _olditem) {
					// We need to seek using the player's real provider, since the seek may have to be delayed
					_model.getMedia().seek(_oldpos);
				}
			}
			return;
		};
		
		/** Forward any calls to add and remove events directly to our event dispatcher **/
		this.jwInstreamAddEventListener = function(type, listener) {
			_dispatcher.addEventListener(type, listener);
		} 
		this.jwInstreamRemoveEventListener = function(type, listener) {
			_dispatcher.removeEventListener(type, listener);
		}

		/** Start instream playback **/
		this.jwInstreamPlay = function() {
			if (!_instreamMode) return;
			_provider.play(true);
		}

		/** Pause instream playback **/
		this.jwInstreamPause = function() {
			if (!_instreamMode) return;
			_provider.pause(true);
		}
		
		/** Seek to a point in instream media **/
		this.jwInstreamSeek = function(position) {
			if (!_instreamMode) return;
			_provider.seek(position);
		}
		
		/** Get the current instream state **/
		this.jwInstreamGetState = function() {
			if (!_instreamMode) return undefined;
			return _fakemodel.state;
		}

		/** Get the current instream playback position **/
		this.jwInstreamGetPosition = function() {
			if (!_instreamMode) return undefined;
			return _fakemodel.position;
		}

		/** Get the current instream media duration **/
		this.jwInstreamGetDuration = function() {
			if (!_instreamMode) return undefined;
			return _fakemodel.duration;
		}
		
		this.playlistClickable = function() {
			return (!_instreamMode || _options.playlistclickable.toString().toLowerCase()=="true");
		}
		

		/*****************************
		 ****** Private methods ****** 
		 *****************************/

		function _init() {
			// Initialize the instream player's model copied from main player's model
			_fakemodel = new jwplayer.html5.model(this, _model.getMedia() ? _model.getMedia().getDisplayElement() : _model.container, _model);
			// Create new event dispatcher
			_dispatcher = new jwplayer.html5.eventdispatcher();
			// Listen for player resize events
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_RESIZE, _resize);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_FULLSCREEN, _resize);
		}

		function _copyModel() {
			_fakemodel.setMute(_model.mute);
			_fakemodel.setVolume(_model.volume);
		}
		
		function _setupProvider() {
			if (!_provider) {
				_provider = new jwplayer.html5.mediavideo(_fakemodel, _model.getMedia() ? _model.getMedia().getDisplayElement() : _model.container);
				_provider.addGlobalListener(_forward);
				_provider.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_META, _metaHandler);
				_provider.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_COMPLETE, _completeHandler);
				_provider.addEventListener(jwplayer.api.events.JWPLAYER_MEDIA_BUFFER_FULL, _bufferFullHandler);
			}
			_provider.attachMedia();
		}
		
		/** Forward provider events to listeners **/		
		function _forward(evt) {
			if (_instreamMode) {
				_sendEvent(evt.type, evt);
			}
		}
		
		/** Handle the JWPLAYER_MEDIA_BUFFER_FULL event **/		
		function _bufferFullHandler(evt) {
			if (_instreamMode) {
				_provider.play();
			}
		}

		/** Handle the JWPLAYER_MEDIA_COMPLETE event **/		
		function _completeHandler(evt) {
			if (_instreamMode) {
				setTimeout(function() {
					_self.jwInstreamDestroy(true);
				}, 10);
			}
		}

		/** Handle the JWPLAYER_MEDIA_META event **/		
		function _metaHandler(evt) {
			// If we're getting video dimension metadata from the provider, allow the view to resize the media
			if (evt.metadata.width && evt.metadata.height) {
				_view.resizeMedia();
			}
		}
		
		function _sendEvent(type, data, forceSend) {
			if (_instreamMode || forceSend) {
				_dispatcher.sendEvent(type, data);
			}
		}
		
		// Resize handler; resize the components.
		function _resize() {
			var originalDisp = _model.plugins.object.display.getDisplayElement().style;
			
			if (_cbar) {
				var originalBar = _model.plugins.object.controlbar.getDisplayElement().style; 
				_cbar.resize(_utils.parseDimension(originalDisp.width), _utils.parseDimension(originalDisp.height));
				_css(_cbar.getDisplayElement(), _utils.extend({}, originalBar, { zIndex: 1001, opacity: 1 }));
			}
			if (_disp) {
				
				_disp.resize(_utils.parseDimension(originalDisp.width), _utils.parseDimension(originalDisp.height));
				_css(_disp.getDisplayElement(), _utils.extend({}, originalDisp, { zIndex: 1000 }));
			}
			if (_view) {
				_view.resizeMedia();
			}
		}
		
		
		/**************************************
		 *****  Duplicate main html5 api  *****
		 **************************************/
		
		this.jwPlay = function(state) {
			if (_options.controlbarpausable.toString().toLowerCase()=="true") {
				this.jwInstreamPlay();
			}
		};
		
		this.jwPause = function(state) {
			if (_options.controlbarpausable.toString().toLowerCase()=="true") {
				this.jwInstreamPause();
			}
		};

		this.jwStop = function() {
			if (_options.controlbarstoppable.toString().toLowerCase()=="true") {
				this.jwInstreamDestroy();
				_api.jwStop();
			}
		};

		this.jwSeek = function(position) {
			switch(_options.controlbarseekable.toLowerCase()) {
			case "always":
				this.jwInstreamSeek(position);
				break;
			case "backwards":
				if (_fakemodel.position > position) {
					this.jwInstreamSeek(position);
				}
				break;
			}
		};
		
		this.jwGetPosition = function() {};
		this.jwGetDuration = function() {};
		this.jwGetWidth = _api.jwGetWidth;
		this.jwGetHeight = _api.jwGetHeight;
		this.jwGetFullscreen = _api.jwGetFullscreen;
		this.jwSetFullscreen = _api.jwSetFullscreen;
		this.jwGetVolume = function() { return _model.volume; };
		this.jwSetVolume = function(vol) {
			_provider.volume(vol);
			_api.jwSetVolume(vol);
		}
		this.jwGetMute = function() { return _model.mute; };
		this.jwSetMute = function(state) {
			_provider.mute(state);
			_api.jwSetMute(state);
		}
		this.jwGetState = function() { return _fakemodel.state; };
		this.jwGetPlaylist = function() { return [_item]; };
		this.jwGetPlaylistIndex = function() { return 0; };
		this.jwGetStretching = function() { return _model.config.stretching; };
		this.jwAddEventListener = function(type, handler) { _dispatcher.addEventListener(type, handler); };
		this.jwRemoveEventListener = function(type, handler) { _dispatcher.removeEventListener(type, handler); };

		this.skin = _api.skin;
		this.id = _api.id + "_instream";

		_init();
		return this;
	};
})(jwplayer);

