/**
* Manages playback of http streaming flv.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.*;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class HTTPModel extends AbstractModel {


	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Video object to be instantiated. **/
	protected var video:Video;
	/** Sound control object. **/
	protected var transform:SoundTransform;
	/** ID for the position interval. **/
	protected var interval:Number;
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
	/** Load offset for bandwidth checking. **/
	protected var loadtimer:Number;
	/** Variable that takes reloading into account. **/
	protected var iterator:Number;


	/** Constructor; sets up the connection and display. **/
	public function HTTPModel(mod:Model):void {
		super(mod);
		connection = new NetConnection();
		connection.connect(null);
		stream = new NetStream(connection);
		stream.checkPolicyFile = true;
		stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		stream.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		stream.bufferTime = model.config['bufferlength'];
		stream.client = new NetClient(this);
		video = new Video(320,240);
		video.smoothing = model.config['smoothing'];
		video.attachNetStream(stream);
		transform = new SoundTransform();
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


	/** Create the video request URL. **/
	protected function getURL():String {
		var url:String = item['streamer'];
		var off:Number  = byteoffset;
		if(mp4) {
			off = timeoffset;
		}
		if(url.indexOf('?') > -1) {
			url += "&file="+item['file']+'&start='+off;
		} else {
			url += "?file="+item['file']+'&start='+off;
		}
		if(model.config['token']) {
			url += '&token='+model.config['token'];
		}
		return url;
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		item = itm;
		position = timeoffset;
		if(stream.bytesLoaded + byteoffset < stream.bytesTotal) {
			stream.close();
		}
		model.mediaHandler(video);
		stream.play(getURL());
		iterator = 0;
		clearInterval(interval);
		interval = setInterval(positionInterval,100);
		clearInterval(loadinterval);
		loadinterval = setInterval(loadHandler,200);
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Interval for the loading progress **/
	protected function loadHandler():void {
		var ldd:Number = stream.bytesLoaded;
		var ttl:Number = stream.bytesTotal;
		var pct:Number = timeoffset/(item['duration']+0.001);
		var off:Number = Math.round(ttl*pct/(1-pct));
		ttl += off;
		model.sendEvent(ModelEvent.LOADED,{loaded:ldd,total:ttl,offset:off});
		if(ldd+off >= ttl && ldd > 0) {
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
				seek(item['start']);
			}
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
		iterator++;
		if(iterator > 10) {
			position = Math.round(stream.time*10)/10;
			if (mp4) {
				position += timeoffset;
			}
		}
		var bfr:Number = Math.round(stream.bufferLength/stream.bufferTime*100);
		if(bfr < 95 && position < Math.abs(item['duration']-stream.bufferTime-1)) {
			model.sendEvent(ModelEvent.BUFFER,{percentage:bfr});
			if(model.config['state'] != ModelStates.BUFFERING && bfr < 25) {
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
			}
		} else if (bfr > 95 && model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration']});
		} else if (item['duration'] > 0) {
			stream.pause();
			clearInterval(interval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a specific second. **/
	override public function seek(pos:Number):void {
		var off:Number = getOffset(pos);
		clearInterval(interval);
		if(off < byteoffset || off >= byteoffset+stream.bytesLoaded) {
			timeoffset = position = getOffset(pos,true);
			byteoffset = off;
			load(item);
		} else {
			if(model.config['state'] == ModelStates.PAUSED) {
				stream.resume();
			}
			position = pos;
			if(mp4) {
				stream.seek(getOffset(position-timeoffset,true));
			} else {
				stream.seek(getOffset(position,true));
			}
			play();
		}
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case "NetStream.Play.Stop":
				if(model.config['state'] != ModelStates.COMPLETED && 
					model.config['state'] != ModelStates.BUFFERING) {
					clearInterval(interval);
					model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				}
				break;
			case "NetStream.Play.StreamNotFound":
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:'Video not found: '+item['file']});
				break;
		}
		model.sendEvent(ModelEvent.META,{info:evt.info.code});
	};


	/** Destroy the HTTP stream. **/
	override public function stop():void {
		if(stream.bytesLoaded+byteoffset < stream.bytesTotal) {
			stream.close();
		} else { 
			stream.pause();
		}
		clearInterval(interval);
		clearInterval(loadinterval);
		byteoffset = timeoffset = position = 0;
		keyframes = undefined;
		meta = false;
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		stream.soundTransform = transform;
	};


};


}