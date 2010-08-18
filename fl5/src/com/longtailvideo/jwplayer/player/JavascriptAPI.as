package com.longtailvideo.jwplayer.player {
	import com.longtailvideo.jwplayer.events.MediaEvent;
	import com.longtailvideo.jwplayer.events.PlayerEvent;
	import com.longtailvideo.jwplayer.events.PlayerStateEvent;
	import com.longtailvideo.jwplayer.events.PlaylistEvent;
	import com.longtailvideo.jwplayer.events.ViewEvent;
	import com.longtailvideo.jwplayer.model.Playlist;
	import com.longtailvideo.jwplayer.utils.JavascriptSerialization;
	import com.longtailvideo.jwplayer.utils.Logger;
	import com.longtailvideo.jwplayer.utils.Strings;
	
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.utils.Timer;
	
	public class JavascriptAPI {
		protected var _player:IPlayer;
		protected var _playerBuffer:Number = 0;
		protected var _playerPosition:Number = 0;
		
		protected var _listeners:Object;

		public function JavascriptAPI(player:IPlayer) {
			_listeners = {};
			
			_player = player;
			_player.addEventListener(PlayerEvent.JWPLAYER_READY, playerReady);

			setupPlayerListeners();
			setupJSListeners();
		}
		
		/** Delay the response to PlayerReady to allow the external interface to initialize in some browsers **/
		protected function playerReady(evt:PlayerEvent):void {
			var timer:Timer = new Timer(50, 1);
			timer.addEventListener(TimerEvent.TIMER_COMPLETE, function(timerEvent:TimerEvent):void {
				var callbacks:String = _player.config.playerready ? _player.config.playerready + "," + "playerReady" : "playerReady";  
				if (ExternalInterface.available) {
					for each (var callback:String in callbacks.replace(/\s/,"").split(",")) {
						try {
							ExternalInterface.call(callback,{
								id:evt.id,
								client:evt.client,
								version:evt.version
							});
						} catch (e:Error) {}
					}
				}
			});
			timer.start();
		}
		
		protected function setupPlayerListeners():void {
			_player.addEventListener(PlaylistEvent.JWPLAYER_PLAYLIST_ITEM, resetPosition);
			_player.addEventListener(MediaEvent.JWPLAYER_MEDIA_TIME, updatePosition);
			_player.addEventListener(MediaEvent.JWPLAYER_MEDIA_BUFFER, updateBuffer);
		}
		
		protected function resetPosition(evt:PlaylistEvent):void {
			_playerPosition = 0;
			_playerBuffer = 0;
		}
		
		protected function updatePosition(evt:MediaEvent):void {
			_playerPosition = evt.position;
		}

		protected function updateBuffer(evt:MediaEvent):void {
			_playerBuffer = evt.bufferPercent;
		}

		protected function setupJSListeners():void {
			try {
				// Event handlers
				ExternalInterface.addCallback("jwAddEventListener", js_addEventListener);
				ExternalInterface.addCallback("jwRemoveEventListener", js_removeEventListener);
				
				// Getters
				ExternalInterface.addCallback("jwGetBandwidth", js_getBandwidth);
				ExternalInterface.addCallback("jwGetBuffer", js_getBuffer);
				ExternalInterface.addCallback("jwGetDuration", js_getDuration);
				ExternalInterface.addCallback("jwGetFullscreen", js_getFullscreen);
				ExternalInterface.addCallback("jwGetHeight", js_getHeight);
				ExternalInterface.addCallback("jwGetLevel", js_getLevel);
				ExternalInterface.addCallback("jwGetLockState", js_getLockState);
				ExternalInterface.addCallback("jwGetMute", js_getMute);
				ExternalInterface.addCallback("jwGetPlaylist", js_getPlaylist);
				ExternalInterface.addCallback("jwGetPosition", js_getPosition);
				ExternalInterface.addCallback("jwGetState", js_getState);
				ExternalInterface.addCallback("jwGetWidth", js_getWidth);
				ExternalInterface.addCallback("jwGetVersion", js_getVersion);
				ExternalInterface.addCallback("jwGetVolume", js_getVolume);

				// Player API Calls
				ExternalInterface.addCallback("jwPlay", js_play);
				ExternalInterface.addCallback("jwPause", js_pause);
				ExternalInterface.addCallback("jwStop", js_stop);
				ExternalInterface.addCallback("jwSeek", js_seek);
				ExternalInterface.addCallback("jwLoad", js_load);
				ExternalInterface.addCallback("jwPlaylistItem", js_playlistItem);
				ExternalInterface.addCallback("jwPlaylistNext", js_playlistNext);
				ExternalInterface.addCallback("jwPlaylistPrev", js_playlistPrev);
				ExternalInterface.addCallback("jwMute", js_mute);
				ExternalInterface.addCallback("jwVolume", js_volume);
				
				
			} catch(e:Error) {
				Logger.log("Could not initialize JavaScript API: "  + e.message);
			}
			
		}

		
		/***********************************************
		 **              EVENT LISTENERS              **
		 ***********************************************/
		
		protected function js_addEventListener(eventType:String, callback:String):void {
			if (!_listeners[eventType]) {
				_listeners[eventType] = [];
				_player.addEventListener(eventType, listenerCallback);
			}
			(_listeners[eventType] as Array).push(callback);
		}
		
		protected function js_removeEventListener(eventType:String, callback:String):void {
			var callbacks:Array = _listeners[eventType];
			if (callbacks) {
				var callIndex:Number = callbacks.indexOf(callback);
				if (callIndex > -1) {
					callbacks.splice(callIndex, 1);
				}
			}
		}
		
		
		
		protected function listenerCallback(evt:PlayerEvent):void {
			var args:Object;
			
			if (evt is MediaEvent)
				args = listnerCallbackMedia(evt as MediaEvent);
			else if (evt is PlayerStateEvent)
				args = listenerCallbackState(evt as PlayerStateEvent);
			else if (evt is ViewEvent && (evt as ViewEvent).data != null)
				args['data'] = (evt as ViewEvent).data;
			
			var callbacks:Array = _listeners[evt.type] as Array;
			
			if (callbacks) {
				for each (var call:String in callbacks) {
					ExternalInterface.call(call, args);
				}
			}
			
		}
		
		protected function merge(obj1:Object, obj2:Object):Object {
			var newObj:Object = {};
			
			for (var key:String in obj1) {
				newObj[key] = obj1[key];
			}
			
			for (key in obj2) {
				newObj[key] = obj2[key];
			}
			
			return newObj;
		}
		
		protected function listnerCallbackMedia(evt:MediaEvent):Object {
			var returnObj:Object = {};

			if (evt.bufferPercent >= 0) 		returnObj.bufferPercent = evt.bufferPercent;
			if (evt.duration >= 0)		 		returnObj.duration = evt.duration;
			if (evt.message != undefined)		returnObj.message = evt.message;
			if (evt.metadata != null)	 		returnObj.metadata = evt.metadata;
			if (evt.offset >= 0)				returnObj.offset = evt.offset;
			if (evt.position >= 0)				returnObj.position = evt.position;

			if (evt.type == MediaEvent.JWPLAYER_MEDIA_MUTE)
				returnObj.mute = evt.mute;
			
			if (evt.type == MediaEvent.JWPLAYER_MEDIA_VOLUME)
				returnObj.volume = evt.volume;

			return returnObj;
		}
		
		
		protected function listenerCallbackState(evt:PlayerStateEvent):Object {
			 if (evt.type == PlayerStateEvent.JWPLAYER_PLAYER_STATE) {
				return { newstate: evt.newstate, oldstate: evt.oldstate };
			 } else return {};
		}
		
		/***********************************************
		 **                 GETTERS                   **
		 ***********************************************/
		
		protected function js_getBandwidth():Number {
			return _player.config.bandwidth;
		}

		protected function js_getBuffer():Number {
			return _playerBuffer;
		}
		
		protected function js_getDuration():Number {
			return _player.playlist.currentItem.duration;
		}
		
		protected function js_getFullscreen():Boolean {
			return _player.config.fullscreen;
		}

		protected function js_getHeight():Number {
			return _player.config.height;
		}
		
		protected function js_getLevel():Number {
			return _player.playlist.currentItem.currentLevel;
		}
		
		protected function js_getLockState():Boolean {
			return _player.locked;
		}
		
		protected function js_getMute():Boolean {
			return _player.config.mute;
		}
		
		protected function js_getPlaylist():Array {
			return JavascriptSerialization.playlistToArray(_player.playlist);
		}
		
		protected function js_getPosition():Number {
			return _playerPosition;
		}
		
		protected function js_getState():String {
			return _player.state;
		}

		protected function js_getWidth():Number {
			return _player.config.width;
		}

		protected function js_getVersion():String {
			return _player.version;
		}

		protected function js_getVolume():Number {
			return _player.config.volume;
		}

		/***********************************************
		 **                 PLAYBACK                  **
		 ***********************************************/
	
		protected function js_play(playstate:*=null):void {
			if (playstate != null && playstate != "") {
				if ((playstate is Boolean && playstate === true) || String(playstate).toLowerCase() == "true") {
					_player.play();
				} else {
					Logger.log("Pausing player: " + typeof playstate);
					_player.pause();
				}
			} else {
				playToggle();
			}
		}
		
		
		protected function js_pause():void {
			playToggle();
		}
		
		protected function playToggle():void {
			if (_player.state == PlayerState.IDLE || _player.state == PlayerState.PAUSED) {
				_player.play();
			} else {
				_player.pause();
			}
		}
		
		protected function js_stop():void {
			_player.stop();
		}
		
		protected function js_seek(position:Number=0):void {
			_player.seek(position);
		}
		
		protected function js_load(toLoad:*):void {
			_player.load(toLoad);
		}
		
		protected function js_playlistItem(item:Number):void {
			_player.playlistItem(item);
		}

		protected function js_playlistNext():void {
			_player.playlistNext();
		}

		protected function js_playlistPrev():void {
			_player.playlistPrev();
		}

		protected function js_mute(mutestate:*=null):void {
			if (mutestate is Boolean) {
				if (Boolean(mutestate)) {
					_player.mute(true);
				} else {
					_player.mute(false);
				}
			} else {
				_player.mute(!_player.config.mute);
			}
		}

		protected function js_volume(volume:Number):void {
			_player.volume(volume);
		}

		
	}

}