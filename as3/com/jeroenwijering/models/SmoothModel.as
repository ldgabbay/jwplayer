/**
* Model that smoothly plays back a video segmented in smaller chunks.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.parsers.SmoothParser;
import com.jeroenwijering.player.Model;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class SmoothModel extends AbstractModel {


	/** Currently playing chunk. **/
	protected var chunk:Number;
	/** All available video chunks. **/
	protected var chunks:Array;
	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** Index metadata of the stream. **/
	protected var index:Object
	/** ID for the position interval. **/
	protected var interval:Number;
	/** Currently active level. **/
	protected var level:Number = 0;
	/** All available quality levels. **/
	protected var levels:Array;
	/** Loader that loads the manifest XML file. **/
	protected var loader:URLLoader;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Sound control object. **/
	protected var transform:SoundTransform;
	/** Video object to be instantiated. **/
	protected var video:Video;


	/** Constructor; sets up the connection and display. **/
	public function SmoothModel(mod:Model):void {
		super(mod);
		connection = new NetConnection();
		connection.connect(null);
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE, loaderHandler);
		loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		loader.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream = new NetStream(connection);
		stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		stream.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		stream.client = new Object();
		video = new Video(320,240);
		video.smoothing = model.config['smoothing'];
		video.attachNetStream(stream);
		transform = new SoundTransform();
	};


	/** Catch playback errors. **/
	protected function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		item = itm;
		chunk = level = 0;
		position = item['start'];
		loader.load(new URLRequest(item['file']));
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Load the next chunk for playback based upon the current position. **/
	protected function loadChunk():void {
		var pos:Number = position+0.5;
		for (var i:Number=0; i<chunks.length; i++) {
			if(chunks[i]['end'] > pos && chunks[i]['start'] <= pos) {
				chunk = i;
				break;
			}
		}
		var url:String = 'http://h264.code-shop.com:8080/ccc.mp4';
		url += '?start='+chunks[chunk]['start'];
		url += '&end='+chunks[chunk]['end'];
		stream.play(url);
	};


	/** Get the metadata, levels and chunks from the manifest. **/
	private function loaderHandler(evt:Event):void {
		var xml:XML = XML(evt.target.data);
		index = SmoothParser.parseIndex(xml);
		model.sendEvent(ModelEvent.META,index);
		levels = SmoothParser.parseLevels(xml);
		chunks = SmoothParser.parseChunks(xml);
		if(levels.length == 0 || chunks.length == 0) {
			errorHandler(new ErrorEvent(ErrorEvent.ERROR,false,false,
				"SmoothStreaming manifest contains no quality levels or chunks."))
		} else {
			model.mediaHandler(video);
			interval = setInterval(positionInterval,100);
			setLevel();
			loadChunk();
		}
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
		var pos:Number = Math.round((chunks[chunk]['start']+stream.time)*10)/10;
		if(pos == position || pos > position + 1) {
			return; 
		}
		position = pos;
		if(model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration'],chunk:chunk});
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
		loadChunk();
		interval = setInterval(positionInterval,100);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Set a specific stream level. **/
	protected function setLevel():void {
		level = 0;
		model.sendEvent(ModelEvent.META,levels[level]);
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case "NetStream.Play.Stop":
				if(chunk == chunks.length-1) {
					clearInterval(interval);
					model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				} else {
					loadChunk();
				}
				break;
			case "NetStream.Play.StreamNotFound":
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:'Video not found or access denied: '+item['file']});
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
		clearInterval(interval);
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		stream.soundTransform = transform;
	};


};


}