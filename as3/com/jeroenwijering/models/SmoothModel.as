/**
* Model that smoothly plays back a video segmented in smaller chunks.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.parsers.SmoothParser;
import com.jeroenwijering.player.Model;

import flash.display.Sprite;
import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class SmoothModel extends AbstractModel {


	/** Currently playing chunk. **/
	private var chunk:Number;
	/** Chunk that is up next. **/
	private var next:Number;
	/** All available video chunks. **/
	private var chunks:Array;
	/** Container that switches the two video objects. **/
	private var container:Sprite;
	/** Index metadata of the stream. **/
	private var index:Object;
	/** ID for the position interval. **/
	private var interval:Number;
	/** Currently active level. **/
	private var level:Number = 0;
	/** All available quality levels. **/
	private var levels:Array;
	/** Loader that loads the manifest XML file. **/
	private var loader:URLLoader;
	/** Soundtransform object. **/
	private var transform:SoundTransform;


	/** Constructor; sets up the connection and display. **/
	public function SmoothModel(mod:Model):void {
		super(mod);
		container = new Sprite();
		container.graphics.drawRect(0,0,320,240);
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE, loaderHandler);
		loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		loader.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		transform = new SoundTransform();
	};


	/** Catch playback errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		item = itm;
		level = 0;
		chunk = 0;
		position = item['start'];
		if(model.config['mute']) {
			 transform.volume = 0;
		} else { 
			 transform.volume = model.config['volume']/100;
		}
		loader.load(new URLRequest(item['file']));
		model.mediaHandler(container);
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Load a chunk for playback. **/
	private function loadChunk(chk:Number):void {
		//var url:String = item['file'].substr(0,item['file'].length-3)+'mp4';
		var url:String = 'http://h264.code-shop.com:8080/ccc.mp4';
		url += '?start='+chunks[chk]['start'];
		url += '&end='+chunks[chk]['end'];
		chunks[chk].connection = new NetConnection();
		chunks[chk].connection.connect(null);
		chunks[chk].netstream = new NetStream(chunks[chk].connection);
		chunks[chk].netstream.client = new Object();
		chunks[chk].netstream.soundTransform = transform;
		chunks[chk].netstream.play(url);
		chunks[chk].netstream.pause();
		chunks[chk].video = new Video(320,240);
		chunks[chk].video.smoothing = model.config['smoothing'];
		chunks[chk].video.visible = false;
		chunks[chk].video.attachNetStream(chunks[chk].netstream);
		container.addChild(chunks[chk].video);
		next = chk;
	};


	/** Start playing a chunk. **/
	private function playChunk(chk:Number=0):void {
		chunks[chk].netstream.resume();
		chunks[chk].video.visible = true;
		chunk = chk;
	};


	/** Remove the current chunk. **/
	private function killChunk(chk:Number):void {
		if(chunks[chk] && chunks[chk].netstream) {
			chunks[chk].netstream.close();
		}
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
			setLevel();
			seek(item['start']);
		}
	};


	/** Pause playback. **/
	override public function pause():void {
		chunks[chunk].netstream.pause();
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};


	/** Resume playing. **/
	override public function play():void {
		chunks[chunk].netstream.resume();
		interval = setInterval(positionInterval,40);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
	};


	/** Interval for the position progress **/
	private function positionInterval():void {
		var chk:Number = chunk;
		var obj:Object = chunks[chunk];
		var pos:Number = obj['start']+obj.netstream.time;
		if(model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(pos > obj['end']-0.15) {
			setTimeout(killChunk,2000,chk);
			playChunk(chk+1);
			setTimeout(loadChunk,1000,chk+2);
		}
		if(pos < item['duration']) {
			pos = Math.round(pos*10)/10;
			if(pos != position) {
				position = pos;
				model.sendEvent(ModelEvent.TIME,{position:pos,duration:item['duration'],chunk:chk});
			}
		} else if (item['duration'] > 0) {
			obj.netstream.pause();
			clearInterval(interval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a new position. **/
	override public function seek(pos:Number):void {
		position = pos;
		clearInterval(interval);
		killChunk(chunk);
		killChunk(next);
		for (var i:Number=0; i<chunks.length; i++) {
			if(chunks[i]['end'] > pos && chunks[i]['start'] <= pos) {
				loadChunk(i);
				playChunk(i);
				setTimeout(loadChunk,1000,i+1);
				break;
			}
		}
		interval = setInterval(positionInterval,40);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Set a specific stream level. **/
	private function setLevel():void {
		level = 0;
		model.sendEvent(ModelEvent.META,levels[level]);
	};


	/** Destroy the video. **/
	override public function stop():void {
		killChunk(chunk);
		killChunk(next);
		clearInterval(interval);
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		chunks[chunk].netstream.soundTransform = transform;
	};


};


}