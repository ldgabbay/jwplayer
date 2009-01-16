/**
* Manages playback of http streaming flv.
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


public class HTTPModel extends BasicModel {


	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Video object to be instantiated. **/
	protected var video:Video;
	/** Sound control object. **/
	protected var transform:SoundTransform;
	/** Interval ID for the loading. **/
	protected var loadinterval:Number;
	/** Save whether metadata has already been sent. **/
	protected var meta:Boolean;
	/** Object with keyframe times and positions. **/
	protected var keyframes:Object;
	/** Offset in bytes of the last seek. **/
	protected var byteoffset:Number;
	/** Offset in seconds of the last seek. **/
	protected var timeoffset:Number;
	/** Boolean for mp4 / flv streaming. **/
	protected var mp4:Boolean;


	/** Constructor; sets up the connection and display. **/
	public function HTTPModel(mod:Model):void {
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
		byteoffset = timeoffset = 0;
	};


	/** Convert seekpoints to keyframes. **/
	protected function convertSeekpoints(dat:Object):Object {
		var kfr:Object = new Object();
		kfr.times = new Array();
		kfr.filepositions = new Array();
		for (var j in dat) {
			kfr.times[j] = Number(dat[j]['time']);
			kfr.filepositions[j] = Number(dat[j]['offset']);
		}
		return kfr;
	};


	/** Catch security errors. **/
	protected function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Return a keyframe byteoffset or timeoffset. **/
	protected function getOffset(pos:Number,tme:Boolean=false):Number {
		if(!keyframes) {
			return 0;
		}
		for (var i:Number=0; i < keyframes.times.length - 1; i++) {
			if(keyframes.times[i] <= pos && keyframes.times[i+1] >= pos) {
				break;
			}
		}
		if(tme == true) {
			return keyframes.times[i];
		} else { 
			return keyframes.filepositions[i];
		}
	};


	/** Returns a key to add to the stream. **/
	protected function getToken():String {
		return model.config['token'];
	};


	/** Create the video request URL. **/
	protected function getURL():String {
		var url:String = item['streamer'];
		if(url.indexOf('?') > -1) {
			url += "&file="+item['file'];
		} else {
			url += "?file="+item['file'];
		}
		if(byteoffset > 0) {
			url += '&start='+byteoffset;
		}
		if(getToken()) {
			url += '&token='+getToken();
		}
		return url;
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		super.load(itm);
		if(stream) {
			stream.close();
		}
		model.mediaHandler(video);
		stream.play(getURL());
		clearInterval(interval);
		interval = setInterval(positionInterval,100);
		clearInterval(loadinterval);
		loadinterval = setInterval(loadHandler,200);
	};


	/** Interval for the loading progress **/
	protected function loadHandler():void {
		var ldd:Number = stream.bytesLoaded;
		var ttl:Number = stream.bytesTotal + byteoffset;
		var off:Number = byteoffset;
		if(meta) {
			ttl = getOffset(item['start']+item['duration']) - getOffset(item['start']);
			off = Math.max(0,byteoffset-getOffset(item['start']));
		}
		if(ldd+off >= ttl && ldd > 0) {
			model.sendEvent(ModelEvent.LOADED,{loaded:ttl-off,total:ttl,offset:off});
			clearInterval(loadinterval);
		} else {
			model.sendEvent(ModelEvent.LOADED,{loaded:ldd,total:ttl,offset:off});
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
		if(dat['type'] == 'metadata' && !meta) {
			meta = true;
			if(dat.seekpoints) {
				mp4 = true;
				keyframes = convertSeekpoints(dat.seekpoints);
			} else {
				mp4 = false;
				keyframes = dat.keyframes;
			}
			if(item['start'] > 0) {
				seek(0);
			}
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
		var pos:Number = Math.round(stream.time*10)/10;
		if (mp4) { 
			pos += timeoffset;
		}
		var bfr:Number = Math.round(stream.bufferLength/stream.bufferTime*100);
		if(bfr < 95 && pos < Math.abs(item['duration']-stream.bufferTime-1)) {
			model.sendEvent(ModelEvent.BUFFER,{percentage:bfr});
			if(model.config['state'] != ModelStates.BUFFERING && bfr < 25) {
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
			}
		} else if (bfr > 95 && model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(pos-item['start'] < item['duration']) {
			if(pos > 0) {
				position = Math.max(0,Math.round((pos-item['start'])*10)/10);
				model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration']});
			}
		} else if (item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a specific second. **/
	override public function seek(pos:Number):void {
		var off = getOffset(pos+item['start']);
		if(off < byteoffset || off > byteoffset+stream.bytesLoaded) {
			timeoffset = getOffset(pos+item['start'],true);
			byteoffset = off;
			load(item);
		} else {
			super.seek(pos);
			if(mp4) { 
				stream.seek(position-timeoffset);
			} else {
				stream.seek(position);
			}
		}
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case "NetStream.Play.Stop":
				if(model.config['state'] != ModelStates.COMPLETED) {
					clearInterval(interval);
					model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				}
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


	/** Destroy the HTTP stream. **/
	override public function stop():void {
		super.stop();
		stream.close();
		clearInterval(loadinterval);
		byteoffset = timeoffset = 0;
		keyframes = undefined;
		meta = false;
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		stream.soundTransform = transform;
	};


};


}