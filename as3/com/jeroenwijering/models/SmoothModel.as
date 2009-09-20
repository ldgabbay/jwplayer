/**
* Model that smoothly plays back a video segmented in smaller chunks.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.parsers.SmoothParser;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.Logger;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class SmoothModel extends AbstractModel {


	/** Currently playing chunk. **/
	private var chunk:Number;
	/** All available video chunks. **/
	private var chunks:Array;
	/** Index metadata of the stream. **/
	private var index:Object;
	/** ID for the position interval. **/
	private var interval:Number;
	/** Loader that loads the manifest XML file. **/
	private var loader:URLLoader;
	/** Soundtransform object. **/
	private var transformer:SoundTransform;


	/** Constructor; sets up the connection and display. **/
	public function SmoothModel(mod:Model):void {
		super(mod);
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE, loaderHandler);
		loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		loader.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		transformer = new SoundTransform();
	};


	/** Catch playback errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};



	/** Load content. **/
	override public function load(itm:Object):void {
		item = itm;
		chunk = 0;
		position = item['start'];
		if(model.config['mute']) {
			 transformer.volume = 0;
		} else { 
			 transformer.volume = model.config['volume']/100;
		}
		loader.load(new URLRequest(item['file']));
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Load a chunk for playback. **/
	private function loadChunk(chk:Number,pse:Boolean=true):void {
		var url:String = item['file'].substr(0,item['file'].length-5);
		if(chunks[chk]) {
			url += '_' + item['levels'][0].bitrate + '.mp4';
			url += '?start=' + chunks[chk]['start'];
			url += '&end=' + chunks[chk]['end'];
			chunks[chk].connection = new NetConnection();
			chunks[chk].connection.connect(null);
			chunks[chk].netstream = new NetStream(chunks[chk].connection);
			chunks[chk].netstream.client = new Object();
			chunks[chk].netstream.soundTransform = transformer;
			chunks[chk].netstream.play(url);
			chunks[chk].netstream.pause();
			chunks[chk].netstream.seek(0);
			chunks[chk].video = new Video();
			chunks[chk].video.width = 320;
			chunks[chk].video.height = 180;
			chunks[chk].video.attachNetStream(chunks[chk].netstream);
		}
	};


	/** Get the metadata, levels and chunks from the manifest. **/
	private function loaderHandler(evt:Event):void {
		var xml:XML = XML(evt.target.data);
		index = SmoothParser.parseIndex(xml);
		item['duration'] = index['duration'];
		item['levels'] = SmoothParser.parseLevels(xml);
		chunks = SmoothParser.parseChunks(xml);
		if(item['levels'].length == 0 || chunks.length == 0) {
			errorHandler(new ErrorEvent(ErrorEvent.ERROR,false,false,
				"SmoothStreaming manifest contains no quality levels or chunks."))
		} else {
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


	/** Start playing a chunk. **/
	private function playChunk(chk:Number=0):void {
		chunks[chk].netstream.resume();
		loadChunk(chk+1);
		chunk = chk;
		setTimeout(showChunk,100);
	};

	private function showChunk() {
		addChild(chunks[chunk].video);
		resize();
	};


	/** Interval for the position progress **/
	private function positionInterval():void {
		var obj:Object = chunks[chunk];
		position = obj['start']+obj.netstream.time;
		if(model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(position >= obj.end-0.1) {
			playChunk(chunk+1);
		}
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration'],chunk:chunk});
		} else if (item['duration'] > 0) {
			clearInterval(interval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a new position. **/
	override public function seek(pos:Number):void {
		position = pos;
		clearInterval(interval);
		for (var i:Number=0; i<chunks.length; i++) {
			if(chunks[i]['end'] > pos && chunks[i]['start'] <= pos) {
				loadChunk(i);
				playChunk(i);
				break;
			}
		}
		interval = setInterval(positionInterval,40);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Destroy the video. **/
	override public function stop():void {
		clearInterval(interval);
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transformer.volume = vol/100;
		chunks[chunk].netstream.soundTransform = transformer;
	};


};


}