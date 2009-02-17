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
	/** Load offset for bandwidth checking. **/
	protected var loadtimer:Number;


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
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Interval for the loading progress **/
	protected function loadHandler():void {
		var ldd:Number = stream.bytesLoaded;
		var ttl:Number = stream.bytesTotal;
		model.sendEvent(ModelEvent.LOADED,{loaded:ldd,total:ttl});
		if(ldd == ttl && ldd > 0) {
			clearInterval(loadinterval);
		}
		if(!loadtimer) {
			loadtimer = setTimeout(loadTimeout,3000);
		}
	};


	/** timeout for checking the bitrate. **/
	protected function loadTimeout():void {
		var obj:Object = new Object();
		obj['bandwidth'] = Math.round(stream.bytesLoaded/1024/3*8);
		if(item['duration']) {
			obj['bitrate'] = Math.round(stream.bytesTotal/1024*8/item['duration']);
		}
		model.sendEvent('META',obj);
	};


	/** Get metadata information from netstream class. **/
	public function onData(dat:Object):void {
		if(dat.width) {
			video.width = dat.width;
			video.height = dat.height;
		}
		model.sendEvent(ModelEvent.META,dat);
	};


	/** Pause playback. **/
	override public function pause():void {
		stream.pause();
		super.pause();
	};


	/** Resume playing. **/
	override public function play():void {
		stream.resume();
		super.play();
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
		super.positionInterval();
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
		if(stream.bytesLoaded < stream.bytesTotal) {
			stream.close();
		} else { 
			stream.pause();
		}
		clearInterval(loadinterval);
		loadtimer = undefined;
		super.stop();
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		stream.soundTransform = transform;
	};


};


}