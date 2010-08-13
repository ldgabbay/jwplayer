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
		private function playerReady(evt:PlayerEvent):void {
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
				ExternalInterface.addCallback("addEventListener", js_addEventListener);
				ExternalInterface.addCallback("removeEventListener", js_removeEventListener);
				
				// Getters
				ExternalInterface.addCallback("getBandwidth", js_getBandwidth);
				ExternalInterface.addCallback("getBuffer", js_getBuffer);
				ExternalInterface.addCallback("getDuration", js_getDuration);
				ExternalInterface.addCallback("getFullscreen", js_getFullscreen);
				ExternalInterface.addCallback("getHeight", js_getHeight);
				ExternalInterface.addCallback("getLevel", js_getLevel);
				ExternalInterface.addCallback("getLockState", js_getLockState);
				ExternalInterface.addCallback("getMute", js_getMute);
//				ExternalInterface.addCallback("getPlaylist", js_getPlaylist); // This is handled by the compatibility API
				ExternalInterface.addCallback("getPosition", js_getPosition);
				ExternalInterface.addCallback("getState", js_getState);
				ExternalInterface.addCallback("getWidth", js_getWidth);
				ExternalInterface.addCallback("getVersion", js_getVersion);
				ExternalInterface.addCallback("getVolume", js_getVolume);

				// Player API Calls
				ExternalInterface.addCallback("play", js_play);
				ExternalInterface.addCallback("pause", js_pause);
				ExternalInterface.addCallback("stop", js_stop);
				ExternalInterface.addCallback("seek", js_seek);
				ExternalInterface.addCallback("load", js_load);
				ExternalInterface.addCallback("playlistItem", js_playlistItem);
				ExternalInterface.addCallback("playlistNext", js_playlistNext);
				ExternalInterface.addCallback("playlistPrev", js_playlistPrev);
				ExternalInterface.addCallback("mute", js_mute);
				ExternalInterface.addCallback("volume", js_volume);
				
				
			} catch(e:Error) {
				Logger.log("Could not initialize JavaScript API: "  + e.message);
			}
			
		}

		
		/***********************************************
		 **              EVENT LISTENERS              **
		 ***********************************************/
		
		private function js_addEventListener(eventType:String, callback:String):void {
			if (!_listeners[eventType]) {
				_listeners[eventType] = [];
				_player.addEventListener(eventType, listenerCallback);
			}
			(_listeners[eventType] as Array).push(callback);
		}
		
		private function js_removeEventListener(eventType:String, callback:String):void {
			var callbacks:Array = _listeners[eventType];
			if (callbacks) {
				var callIndex:Number = callbacks.indexOf(callback);
				if (callIndex > -1) {
					callbacks.splice(callIndex, 1);
				}
			}
		}
		
		
		
		private function listenerCallback(evt:PlayerEvent):void {
			var args:Object;
			
			if (evt is MediaEvent)
				args = listnerCallbackMedia(evt as MediaEvent);
			else if (evt is PlaylistEvent)
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
		
		private function merge(obj1:Object, obj2:Object):Object {
			var newObj:Object = {};
			
			for (var key:String in obj1) {
				newObj[key] = obj1[key];
			}
			
			for (key in obj2) {
				newObj[key] = obj2[key];
			}
			
			return newObj;
		}
		
		private function listnerCallbackMedia(evt:MediaEvent):Object {
			switch(evt.type) {
				case MediaEvent.JWPLAYER_MEDIA_BUFFER:
					return {
						bufferPercent: 	evt.bufferPercent,	
						offset:			evt.offset,
						duration:		evt.duration,
						position:		evt.position
					};
					break;
				case MediaEvent.JWPLAYER_MEDIA_TIME:
					return {
						offset:			evt.offset,
						duration:		evt.duration,
						position:		evt.position
					};
					break;
				case MediaEvent.JWPLAYER_MEDIA_VOLUME:
					return {
						volume:			evt.volume
					};
					break;
				case MediaEvent.JWPLAYER_MEDIA_MUTE:
					return {
						mute:			evt.mute
					};
					break;
				case MediaEvent.JWPLAYER_MEDIA_ERROR:
					return {
						message:		evt.mute
					};
					break;
				case MediaEvent.JWPLAYER_MEDIA_META:
					Logger.log("got metadata: " + Strings.print_r(evt.metadata));
					
					return {metadata: evt.metadata};
					break;
			}
			return {};
		}
		
		
		private function listenerCallbackState(evt:PlayerStateEvent):Object {
			 if (evt.type == PlayerStateEvent.JWPLAYER_PLAYER_STATE) {
				return { newstate: evt.newstate, oldstate: evt.oldstate };
			 } else return {};
		}
		

		
		/***********************************************
		 **                 GETTERS                   **
		 ***********************************************/
		
		private function js_getBandwidth():Number {
			return _player.config.bandwidth;
		}

		private function js_getBuffer():Number {
			return _playerBuffer;
		}
		
		private function js_getDuration():Number {
			return _player.playlist.currentItem.duration;
		}
		
		private function js_getFullscreen():Boolean {
			return _player.config.fullscreen;
		}

		private function js_getHeight():Number {
			return _player.config.height;
		}
		
		private function js_getLevel():Number {
			return _player.playlist.currentItem.currentLevel;
		}
		
		private function js_getLockState():Boolean {
			return _player.locked;
		}
		
		private function js_getMute():Boolean {
			return _player.config.mute;
		}
		
		private function js_getPlaylist():Array {
			return JavascriptSerialization.playlistToArray(_player.playlist);
		}
		
		private function js_getPosition():Number {
			return _playerPosition;
		}
		
		private function js_getState():String {
			return _player.state;
		}

		private function js_getWidth():Number {
			return _player.config.width;
		}

		private function js_getVersion():String {
			return _player.version;
		}

		private function js_getVolume():Number {
			return _player.config.volume;
		}

		/***********************************************
		 **                 PLAYBACK                  **
		 ***********************************************/
	
		private function js_play(playstate:*=null):void {
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
		
		
		private function js_pause():void {
			playToggle();
		}
		
		private function playToggle():void {
			if (_player.state == PlayerState.IDLE || _player.state == PlayerState.PAUSED) {
				_player.play();
			} else {
				_player.pause();
			}
		}
		
		private function js_stop():void {
			_player.stop();
		}
		
		private function js_seek(position:Number=0):void {
			_player.seek(position);
		}
		
		private function js_load(toLoad:*):void {
			_player.load(toLoad);
		}
		
		private function js_playlistItem(item:Number):void {
			_player.playlistItem(item);
		}

		private function js_playlistNext():void {
			_player.playlistNext();
		}

		private function js_playlistPrev():void {
			_player.playlistPrev();
		}

		private function js_mute(mutestate:*=null):void {
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

		private function js_volume(volume:Number):void {
			_player.volume(volume);
		}

		
	}

}