/**
* Model that concatenates segmented streams into a single file.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.NetClient;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class SegmentModel extends AbstractModel {


	/** Video object to be instantiated. **/
	protected var video:Video;
	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Sound control object. **/
	protected var transform:SoundTransform;
	/** ID for the position interval. **/
	protected var interval:Number;
	/** Segmentation length in seconds. **/
	protected var increment:Number = 10;
	/** Currently playing segment. **/
	protected var segment:Number;


	/** Constructor; sets up the connection and display. **/
	public function SegmentModel(mod:Model):void {
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
	};


	/** Catch security errors. **/
	protected function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		item = itm;
		position = 0;
		model.mediaHandler(video);
		stream.checkPolicyFile = true;
		queue();
		interval = setInterval(positionInterval,100);
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
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
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};


	/** Resume playing. **/
	override public function play():void {
		stream.resume();
		interval = setInterval(positionInterval,100);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
	};


	/** Interval for the position progress **/
	protected function positionInterval():void {
		if(stream.time < increment) {
			position = segment*increment + Math.round(stream.time*10)/10;
		}
		var bfr:Number = Math.round(stream.bufferLength/stream.bufferTime*100);
		if (bfr > 95 && model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration'],segment:segment});
		} else if (item['duration'] > 0) {
			stream.pause();
			clearInterval(interval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a new position. **/
	override public function seek(pos:Number):void {
		position = pos;
		clearInterval(interval);
		queue();
		interval = setInterval(positionInterval,100);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case "NetStream.Play.Stop":
				if(position > item['duration'] - increment/2) {
					clearInterval(interval);
					model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				} else { 
					queue();
				}
				break;
			case "NetStream.Play.StreamNotFound":
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:'Video not found or access denied: '+item['file']});
				break;
		}
		model.sendEvent(ModelEvent.META,{status:evt.info.code});
	};


	/** Queue the next segment for playback based upon the current position. **/
	protected function queue():void {
		segment = Math.round(position/increment);
		var stt:Number = segment*increment;
		var end:Number = (segment+1)*increment;
		stream.play(item['file']+'?start='+stt+'&end='+end);
	};


	/** Destroy the video. **/
	override public function stop():void {
		if(stream.bytesLoaded < stream.bytesTotal) {
			stream.close();
		} else {
			stream.pause();
		}
		clearInterval(interval);
		position = 0;
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		stream.soundTransform = transform;
	};


};


}