/**
* Wrapper for playback of mp3 sounds.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.BasicModel;
import com.jeroenwijering.player.Model;

import flash.events.*;
import flash.media.*;
import flash.net.URLRequest;
import flash.utils.clearInterval;


public class SoundModel extends BasicModel {


	/** sound object to be instantiated. **/
	private var sound:Sound;
	/** Sound control object. **/
	private var transform:SoundTransform;
	/** Sound channel object. **/
	private var channel:SoundChannel;
	/** Sound context object. **/
	private var context:SoundLoaderContext;


	/** Constructor; sets up the connection and display. **/
	public function SoundModel(mod:Model):void {
		super(mod);
		transform = new SoundTransform();
		context = new SoundLoaderContext(model.config['bufferlength']*1000,true);
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
	};


	/** Sound completed; send event. **/
	private function completeHandler(evt:Event):void {
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
	};


	/** Catch errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Forward ID3 data from the sound. **/
	private function id3Handler(evt:Event):void {
		try {
			var id3:ID3Info = sound.id3;
			var obj:Object = {
				type:'id3',
				album:id3.album,
				artist:id3.artist,
				comment:id3.comment,
				genre:id3.genre,
				name:id3.songName,
				track:id3.track,
				year:id3.year
			}
			model.sendEvent(ModelEvent.META,obj);
		} catch (err:Error) {}
	};


	/** Load the sound. **/
	override public function load(itm:Object):void {
		super.load(itm);
		sound = new Sound();
		sound.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		sound.addEventListener(ProgressEvent.PROGRESS,progressHandler);
		sound.addEventListener(Event.COMPLETE,loadedHandler);
		sound.addEventListener(Event.ID3,id3Handler);
		sound.load(new URLRequest(item['file']),context);
		play();
	};


	/** Sound has been loaded, so the final duration is known. **/
	private function loadedHandler(evt:Event):void {
		model.sendEvent(ModelEvent.META,{duration:sound.length/1000-item['start']});
	};


	/** Pause the sound. **/
	override public function pause():void {
		super.pause();
		channel.stop();
	};


	/** Play the sound. **/
	override public function play():void {
		super.play();
		channel = sound.play(position*1000,0,transform);
		channel.addEventListener(Event.SOUND_COMPLETE,completeHandler);
	};


	/** Interval for the position progress **/
	override protected function positionInterval():void {
		position = Math.round(channel.position/100)/10;
		if(sound.isBuffering == true && sound.bytesTotal > sound.bytesLoaded) {
			if(model.config['state'] != ModelStates.BUFFERING) {
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
			} else {
				var pct:Number = Math.floor(sound.length/(channel.position+model.config['bufferlength']*1000)*100);
				model.sendEvent(ModelEvent.BUFFER,{percentage:pct});
			}
		} else if (model.config['state'] == ModelStates.BUFFERING && sound.isBuffering == false) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(position-item['start'] < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position-item['start'],duration:item['duration']});
		} else if(item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Interval for the loading progress **/
	private function progressHandler(evt:ProgressEvent):void {
		var ldd = evt.bytesLoaded;
		var ttl = evt.bytesTotal;
		model.sendEvent(ModelEvent.LOADED,{loaded:ldd,total:ttl});
	};


	/** Seek in the sound. **/
	override public function seek(pos:Number):void {
		channel.stop();
		super.seek(pos);
	};


	/** Destroy the sound. **/
	override public function stop():void {
		if(channel) { channel.stop(); }
		try { sound.close(); } catch (err:Error) {}
		super.stop();
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		if(channel) {
			channel.soundTransform = transform;
		}
	};


};


}