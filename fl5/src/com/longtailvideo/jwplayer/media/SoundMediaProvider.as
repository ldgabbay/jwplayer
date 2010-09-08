/**
 * Wrapper for playback of mp3 sounds.
 **/
package com.longtailvideo.jwplayer.media {
	import com.jeroenwijering.events.*;
	import com.longtailvideo.jwplayer.events.MediaEvent;
	import com.longtailvideo.jwplayer.model.PlayerConfig;
	import com.longtailvideo.jwplayer.model.PlaylistItem;
	import com.longtailvideo.jwplayer.player.PlayerState;
	import com.longtailvideo.jwplayer.utils.Logger;
	
	import flash.events.*;
	import flash.media.*;
	import flash.net.URLRequest;
	import flash.utils.*;


	public class SoundMediaProvider extends MediaProvider {
		/** _sound object to be instantiated. **/
		private var _sound:Sound;
		/** Sound control object. **/
		private var _transformer:SoundTransform;
		/** Sound _channel object. **/
		private var _channel:SoundChannel;
		/** Sound _context object. **/
		private var _context:SoundLoaderContext;
		/** ID for the position interval. **/
		protected var _positionInterval:Number;
		/** Whether the buffer has filled **/
		private var _bufferFull:Boolean;
		/** Whether the enitre sound file has been buffered **/
		private var _bufferingComplete:Boolean;
		/** User-defined item duration **/
		private var _userDuration:Number = -1;
		
		/** Constructor; sets up the connection and display. **/
		public function SoundMediaProvider() {
			super('_sound');

		}


		public override function initializeMediaProvider(cfg:PlayerConfig):void {
			super.initializeMediaProvider(cfg);
			_transformer = new SoundTransform();
			_context = new SoundLoaderContext(config.bufferlength * 1000, true);
		}


		/** Sound completed; send event. **/
		private function completeHandler(evt:Event):void {
			complete();
		}


		/** Catch errors. **/
		private function errorHandler(evt:ErrorEvent):void {
			stop();
			error(evt.text);
		}


		/** Forward ID3 data from the _sound. **/
		private function id3Handler(evt:Event):void {
			try {
				var id3:ID3Info = _sound.id3;
				var obj:Object = {type: 'id3', album: id3.album,
						artist: id3.artist, comment: id3.comment,
						genre: id3.genre, name: id3.songName, track: id3.track,
						year: id3.year}
				sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_META, {metadata:obj});
			} catch (err:Error) {
			}
		}


		/** Load the _sound. **/
		override public function load(itm:PlaylistItem):void {
			_position = 0;
			_bufferFull = false;
			_userDuration = itm.duration;
			if (!_item || _item.file != itm.file || !_bufferingComplete) {
				_bufferingComplete = false;
				_item = itm;
				_sound = new Sound();
				_sound.addEventListener(IOErrorEvent.IO_ERROR, errorHandler);
				_sound.addEventListener(Event.ID3, id3Handler);
				_sound.addEventListener(ProgressEvent.PROGRESS, positionHandler);
				_sound.load(new URLRequest(_item.file), _context);
			}
			if (!_positionInterval) {
				_positionInterval = setInterval(positionHandler, 100);
			}

			sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_LOADED);
			setState(PlayerState.BUFFERING);
			sendBufferEvent(0);
			streamVolume(config.mute ? 0 : config.volume);
		}


		/** Pause the _sound. **/
		override public function pause():void {
			if (_positionInterval){
				clearInterval(_positionInterval);
				_positionInterval = undefined;
			}
			
			if (_channel) {
				_channel.stop();
			}
			super.pause();
		}


		/** Play the _sound. **/
		override public function play():void {
			if (position == 0 && _item.start > 0) {
				seek(item.start);
				return;
			}
			if (!_positionInterval) {
				_positionInterval = setInterval(positionHandler, 100);
			}
			if (_channel){
				_channel.stop();
				_channel = null;
			}
			_channel = _sound.play(_position * 1000, 0, _transformer);
			_channel.addEventListener(Event.SOUND_COMPLETE, completeHandler);
			super.play();
		}


		/** Interval for the _position progress **/
		protected function positionHandler(progressEvent:ProgressEvent=null):void {
			var bufferPercent:Number = 0;
			
			if (_userDuration < 0) {
				if (_sound.bytesTotal > 0 && _sound.bytesLoaded / _sound.bytesTotal > 0.1) {
					_item.duration = _sound.length / 1000 / _sound.bytesLoaded * _sound.bytesTotal;
				} else if (_sound.length > 0) {
					_item.duration = Math.floor(_sound.length / 100) / 10;
				}
			}
			
			if (_channel && _sound) {
				_position = Math.floor(_channel.position / 100) / 10;
				if (_sound.bytesTotal > 0 && _item.duration != 0) {
					bufferPercent = Math.floor(_sound.bytesLoaded / _sound.bytesTotal * 100);
				}
			}

			
			if (state == PlayerState.PLAYING && _sound.isBuffering == true) {
				// Buffer underrun condition
				_bufferFull = false;
				setState(PlayerState.BUFFERING);
				return
			} else if (_sound.bytesLoaded > 0 && !_sound.isBuffering && !_bufferFull) {
				_bufferFull = true;
				sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_BUFFER_FULL);
			}
			
			if (_channel && !isNaN(bufferPercent) && bufferPercent > 0 && !_bufferingComplete){
				if (bufferPercent == 100 && _bufferingComplete == false) {
					_bufferingComplete = true;
				}
				sendBufferEvent(bufferPercent, 0, {loaded:_sound.bytesLoaded, total:_sound.bytesTotal});
			}
			
			if (state != PlayerState.PLAYING) {
				return;
			}
			
			if (_position < _item.duration) {
				sendMediaEvent(MediaEvent.JWPLAYER_MEDIA_TIME, {position: _position, duration: _item.duration});
			} else if (_item.duration > 0) {
				complete();
			}
		}
		
		/** Seek in the _sound. **/
		override public function seek(pos:Number):void {
			if ( (_userDuration >= 0 && pos < _userDuration) || (_userDuration < 0 && _sound && pos < _sound.length) || item.start) { 
				clearInterval(_positionInterval);
				_positionInterval = undefined;
				if (_channel) {
					_channel.stop();
				}
				_position = pos;
				play();
			}
		}


		/** Destroy the _sound. **/
		override public function stop():void {
			clearInterval(_positionInterval);
			_positionInterval = undefined;
			item.duration = _userDuration;
			super.stop();
			if (_channel) {
				_channel.stop();
				_channel = null;
			}
			try {
				_sound.close();
			} catch (err:Error) {
			}
		}


		/** Set the volume level. **/
		override public function setVolume(vol:Number):void {
			streamVolume(vol);
			super.setVolume(vol);
		}
		

		/** Set the stream's volume, without sending a volume event **/
		protected function streamVolume(level:Number):void {
			_transformer.volume = level / 100;
			if (_channel) {
				_channel.soundTransform = _transformer;
			}
		}
	}
}
