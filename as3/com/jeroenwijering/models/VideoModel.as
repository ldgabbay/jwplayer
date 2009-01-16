/**
* Wrapper for playback of progressively downloaded video.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.BasicModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.NetClient;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class VideoModel extends BasicModel {


	/** Video object to be instantiated. **/
	protected var video:Video;
	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Sound control object. **/
	protected var transform:SoundTransform;
	/** Interval ID for the loading. **/
	protected var loadinterval:Number;


	/** Constructor; sets up the connection and display. **/
	public function VideoModel(mod:Model):void {
		super(mod);
		connection = new NetConnection();
		connection.connect(null);
		stream = new NetStream(connection);
		stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		stream.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		stream.bufferTime = model.config['bufferlength'];
		stream.client = new NetClient(this);
		video = new Video(320,240);
		video.smoothing = model.config['smoothing'];
		video.attachNetStream(stream);
		transform = new SoundTransform();
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
	};


	/** Catch security errors. **/
	protected function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		super.load(itm);
		model.mediaHandler(video);
		stream.play(item['file']);
		interval = setInterval(positionInterval,100);
		loadinterval = setInterval(loadHandler,200);
	};


	/** Interval for the loading progress **/
	protected function loadHandler():void {
		var ldd:Number = stream.bytesLoaded;
		var ttl:Number = stream.bytesTotal;
		model.sendEvent(ModelEvent.LOADED,{loaded:ldd,total:ttl});
		if(ldd == ttl && ldd > 0) {
			clearInterval(loadinterval);
		}
	};


	/** Get metadata information from netstream class. **/
	public function onData(dat:Object):void {
		if(dat.width) {
			video.width = dat.width;
			video.height = dat.height;
		}
		if(dat.duration) { 
			dat.duration -= item['start'];
		}
		model.sendEvent(ModelEvent.META,dat);
	};


	/** Pause playback. **/
	override public function pause():void {
		super.pause();
		stream.pause();
	};


	/** Resume playing. **/
	override public function play():void {
		super.play();
		stream.resume();
	};


	/** Interval for the position progress **/
	override protected function positionInterval():void {
		position = Math.round(stream.time*10)/10;
		var bfr:Number = Math.round(stream.bufferLength/stream.bufferTime*100);
		if(bfr < 95 && position < Math.abs(item['duration']-stream.bufferTime-1)) {
			model.sendEvent(ModelEvent.BUFFER,{percentage:bfr});
			if(model.config['state'] != ModelStates.BUFFERING && bfr < 25) {
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
			}
		} else if (bfr > 95 && model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(position-item['start'] < item['duration']) {
			var pos:Number = Math.max(0,Math.round((position-item['start'])*10)/10);
			model.sendEvent(ModelEvent.TIME,{position:pos,duration:item['duration']});
		} else if (item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a new position. **/
	override public function seek(pos:Number):void {
		super.seek(pos);
		stream.seek(position);
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case "NetStream.Play.Stop":
				clearInterval(interval);
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				break;
			case "NetStream.Play.StreamNotFound":
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:'Video not found: '+item['file']});
				break;
			default:
				model.sendEvent(ModelEvent.META,{info:evt.info.code});
				break;
		}
	};


	/** Destroy the video. **/
	override public function stop():void {
		stream.close();
		clearInterval(loadinterval);
		super.stop();
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		stream.soundTransform = transform;
	};


};


}