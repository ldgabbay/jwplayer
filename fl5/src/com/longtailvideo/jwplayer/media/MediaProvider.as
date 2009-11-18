package com.longtailvideo.jwplayer.media {
	import com.longtailvideo.jwplayer.events.GlobalEventDispatcher;
	import com.longtailvideo.jwplayer.events.IGlobalEventDispatcher;
	import com.longtailvideo.jwplayer.events.MediaEvent;
	import com.longtailvideo.jwplayer.events.PlayerStateEvent;
	import com.longtailvideo.jwplayer.model.PlayerConfig;
	import com.longtailvideo.jwplayer.model.PlaylistItem;
	import com.longtailvideo.jwplayer.player.PlayerState;
	import com.longtailvideo.jwplayer.utils.Stretcher;
	
	import flash.display.DisplayObject;
	import flash.display.MovieClip;
	import flash.display.Sprite;
	import flash.events.Event;
	
	/**
	 * Fired when a portion of the current media has been loaded into the buffer.
	 *
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_BUFFER
	 */
	[Event(name="jwplayerMediaBuffer", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Fired when the buffer is full.
	 *
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_BUFFER_FULL
	 */
	[Event(name="jwplayerMediaBufferFull", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Fired if an error occurs in the course of media playback.
	 *
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_ERROR
	 */
	[Event(name="jwplayerMediaError", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Fired after the MediaProvider has loaded an item into memory.
	 *
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_LOADED
	 */
	[Event(name="jwplayerMediaLoaded", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Sent after a load() command has completed
	 * 
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_TIME
	 */
	[Event(name="jwplayerMediaTime", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Sends the position and duration of the currently playing media
	 * 
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_VOLUME
	 */
	[Event(name="jwplayerMediaVolume", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Fired when the currently playing media has completed its playback
	 * 
	 * @eventType com.longtailvideo.jwplayer.events.MediaEvent.JWPLAYER_MEDIA_COMPLETE
	 */
	[Event(name="jwplayerMediaComplete", type="com.longtailvideo.jwplayer.events.MediaEvent")]
	/**
	 * Sent when the playback state has changed.
	 * 
	 * @eventType com.longtailvideo.jwplayer.events.PlayerStateEvent.JWPLAYER_PLAYER_STATE
	 */
	[Event(name="jwplayerPlayerState", type="com.longtailvideo.jwplayer.events.PlayerStateEvent")]

	public class MediaProvider extends Sprite implements IGlobalEventDispatcher {
		/** Reference to the player configuration. **/
		private var _config:PlayerConfig;
		/** Name of the MediaProvider **/
		private var _provider:String;
		/** Reference to the currently active playlistitem. **/
		protected var _item:PlaylistItem;
		/** The current position inside the file. **/
		protected var _position:Number;
		/** The current volume of the audio output stream **/
		private var _volume:Number;
		/** The playback state for the currently loaded media.  @see com.longtailvideo.jwplayer.model.ModelStates **/
		private var _state:String;
		/** Clip containing graphical representation of the currently playing media **/
		private var _media:MovieClip;
		/** Most recent buffer data **/
		private var _bufferPercent:Number;
		/** Handles event dispatching **/
		private var _dispatcher:GlobalEventDispatcher;

		protected var _width:Number;
		protected var _height:Number;


		public function MediaProvider(provider:String) {
			_provider = provider;
			_dispatcher = new GlobalEventDispatcher();
		}


		public function initializeMediaProvider(cfg:PlayerConfig):void {
			_config = cfg;
			_state = PlayerState.IDLE;
		}


		/**
		 * Load a new playlist item
		 * @param itm The playlistItem to load
		 **/
		public function load(itm:PlaylistItem):void {
			_item = itm;
			dispatchEvent(new MediaEvent(MediaEvent.JWPLAYER_MEDIA_LOADED));
		}


		/** Pause playback of the item. **/
		public function pause():void {
			setState(PlayerState.PAUSED);
		}


		/** Resume playback of the item. **/
		public function play():void {
			setState(PlayerState.PLAYING);
			if (_media) {
				_media.visible = true;
			}
		}


		/**
		 * Seek to a certain position in the item.
		 *
		 * @param pos	The position in seconds.
		 **/
		public function seek(pos:Number):void {
			_position = pos;
			//			sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_TIME, {position: position, duration:item.duration});
		}


		/** Stop playing and loading the item. **/
		public function stop():void {
			setState(PlayerState.IDLE);
			_position = 0;
			if (_media) {
				_media.visible = false;
			}
		}


		/**
		 * Change the playback volume of the item.
		 *
		 * @param vol	The new volume (0 to 100).
		 **/
		public function setVolume(vol:Number):void {
			sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_VOLUME, {'volume': vol});
		}


		/**
		 * Changes the mute state of the item.
		 *
		 * @param mute	The new mute state.
		 **/
		public function mute(mute:Boolean):void {
			mute == true ? setVolume(0) : setVolume(_config.volume);
			sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_MUTE, {'mute': mute});
		}


		/** Completes video playback **/
		protected function complete():void {
			stop();
			sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_COMPLETE);
		}


		/** Puts the video into a buffer state **/
		protected function buffer():void {

		}


		/** Graphical representation of media **/
		public function get display():DisplayObject {
			return _media;
		}


		/** Name of the MediaProvider. */
		public function get provider():String {
			return _provider;
		}


		/**
		 * Current state of the MediaProvider.
		 * @see PlayerStates
		 */
		public function get state():String {
			return _state;
		}


		/** Currently playing PlaylistItem **/
		public function get item():PlaylistItem {
			return _item;
		}


		/** Current position, in seconds **/
		public function get position():Number {
			return _position;
		}


		/**
		 * The current volume of the playing media
		 * <p>Range: 0-100</p>
		 */
		public function get volume():Number {
			return _volume;
		}


		/**
		 * The current config
		 */
		protected function get config():PlayerConfig {
			return _config;
		}


		/**
		 * Resizes the display.
		 *
		 * @param width		The new width of the display.
		 * @param height	The new height of the display.
		 **/
		public function resize(width:Number, height:Number):void {
			_width = width;
			_height = height;
			if (_media) {
				Stretcher.stretch(_media, width, height, _config.stretching);
			}
		}


		/**
		 * Sets the current state to a new state and sends a PlayerStateEvent
		 * @param newState A state from ModelStates.
		 */
		protected function setState(newState:String):void {
			if (state != newState) {
				var evt:PlayerStateEvent = new PlayerStateEvent(PlayerStateEvent.JWPLAYER_PLAYER_STATE, newState, state);
				_state = newState;
				dispatchEvent(evt);
			}
		}


		/**
		 * Sends a MediaEvent, simultaneously setting a property
		 * @param type
		 * @param property
		 * @param value
		 */
		protected function sendMediaEvent(type:String, properties:Object=null):void {
			var newEvent:MediaEvent = new MediaEvent(type);
			for (var property:String in properties) {
				if (newEvent.hasOwnProperty(property)) {
					newEvent[property] = properties[property];
				}
			}
			dispatchEvent(newEvent);
		}


		/** Dispatches buffer change notifications **/
		protected function sendBufferEvent(bufferPercent:Number, offset:Number=0):void {
			if (_bufferPercent != bufferPercent) {
				_bufferPercent = bufferPercent;
				sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_BUFFER, {'bufferPercent': _bufferPercent,
						'offset': offset, 'duration': _item.duration});
			}
		}


		/** Dispatches error notifications **/
		protected function error(message:String):void {
			stop();
			sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_ERROR, {message: message});
		}


		/**
		 * Gets a property from the player configuration
		 *
		 * @param property The property to be retrieved.
		 * **/
		protected function getConfigProperty(property:String):* {
			return _config.pluginConfig(provider)[property];
		}


		///////////////////////////////////////////		
		/// IGlobalEventDispatcher implementation
		///////////////////////////////////////////		
		/**
		 * @inheritDoc
		 */
		public function addGlobalListener(listener:Function):void {
			_dispatcher.addGlobalListener(listener);
		}


		/**
		 * @inheritDoc
		 */
		public function removeGlobalListener(listener:Function):void {
			_dispatcher.removeGlobalListener(listener);
		}


		/**
		 * @inheritDoc
		 */
		public override function dispatchEvent(event:Event):Boolean {
			_dispatcher.dispatchEvent(event);
			return super.dispatchEvent(event);
		}


		protected function set media(m:DisplayObject):void {
			if (m) {
				_media = new MovieClip();
				_media.visible = false;
				_media.addChild(m);
				if (_width * _height > 0) {
					Stretcher.stretch(_media, _width, _height, _config.stretching);
				}
			} else {
				_media = null;
			}
		}


		protected function get media():DisplayObject {
			return _media;
		}
	}
}