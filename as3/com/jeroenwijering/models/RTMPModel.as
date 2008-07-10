﻿/**
* Wrapper for playback of progressively downloaded video.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.ModelInterface;
import com.jeroenwijering.player.Model;
import flash.display.DisplayObject;
import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class RTMPModel implements ModelInterface {


	/** reference to the model. **/
	private var model:Model;
	/** Video object to be instantiated. **/
	private var video:Video;
	/** NetConnection object for setup of the video stream. **/
	private var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	private var stream:NetStream;
	/** Sound control object. **/
	private var transform:SoundTransform;
	/** Interval ID for the time. **/
	private var timeinterval:Number;
	/** Timeout ID for cleaning up idle streams. **/
	private var timeout:Number;
	/** Metadata received switch. **/
	private var metadata:Boolean;
	/** Index of the file where the video starts. **/
	private var fileindex:Number;

	/** Constructor; sets up the connection and display. **/
	public function RTMPModel(mod:Model) {
		model = mod;
		connection = new NetConnection();
		connection.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		connection.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		connection.objectEncoding = ObjectEncoding.AMF0;
		connection.client = this;
		video = new Video(320,240);
		quality(model.config['quality']);
		transform = new SoundTransform();
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
	};


	/** Catch security errors. **/
	private function errorHandler(evt:ErrorEvent) {
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** xtract the current ID from an RTMP URL **/
	private function getStream(url:String):String {
		var i = 0;
		if(fileindex) {
			fileindex = url.lastIndexOf('/',fileindex-2)+1;
		} else { 
			fileindex = url.lastIndexOf('/')+1;
		}
		var str = url.substr(0,fileindex);
		trace(str);
		return str;
	};


	/** xtract the current Stream from an RTMP URL **/
	private function getID(url:String):String {
		var str = url.substr(fileindex);
		if(str.substr(-4) == '.mp3') {
			str = 'mp3:'+str.substr(0,str.length-4);
		} else if(str.substr(-4) == '.mp4' || str.substr(-4)=='.mov') {
			str = 'mp4:'+str.substr(0,str.length-4);
		} else if (str.substr(-4) == '.flv'){
			str = str.substr(0,str.length-4);
		}
		trace(str);
		return str;
	};


	/** Load content. **/
	public function load() {
		connection.connect(getStream(model.playlist[model.config['item']]['file']));
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Catch noncritical errors. **/
	private function metaHandler(evt:ErrorEvent) {
		model.sendEvent(ModelEvent.META,{error:evt.text});
	};


	/** Get metadata information from netstream class. **/
	public function onMetaData(info:Object) {
		if(!metadata) {
			metadata = true;
			if(info.width) {
				video.width = info.width;
				video.height = info.height;
				model.mediaHandler(video);
			} else { 
				model.mediaHandler();
			}
			var dat = new Object();
			for(var i in info) { 
				dat[i] = info[i];
			}
			model.sendEvent(ModelEvent.META,dat);
			if(model.playlist[model.config['item']]['start'] > 0) {
				seek(model.playlist[model.config['item']]['start']);
			}
		}
	};


	/** Receive NetStream status updates. **/
	public function onPlayStatus(info:Object=null) {
		if(info.code == "NetStream.Play.Complete") {
			fileindex = undefined;
			clearInterval(timeinterval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Get textdata from netstream. **/
	public function onTextData(info:Object) {
		var dat = new Object();
		for(var i in info) { 
			dat[i] = info[i];
		}
		model.sendEvent(ModelEvent.META,dat);
	};


	/** Pause playback. **/
	public function pause() {
		clearInterval(timeinterval);
		stream.pause();
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
		timeout = setTimeout(disconnect,30000);
	};


	/** Pause takes too long: disconnect. **/
	private function disconnect() {
		stop();
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** Resume playing. **/
	public function play() {
		clearTimeout(timeout);
		clearInterval(timeinterval);
		stream.resume();
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		timeinterval = setInterval(timeHandler,100);
	};


	/** Change the smoothing mode. **/
	public function quality(qua:Boolean) {
		if(qua == true) { 
			video.smoothing = true;
			video.deblocking = 3;
		} else { 
			video.smoothing = false;
			video.deblocking = 1;
		}
	};


	/** Change the smoothing mode. **/
	public function seek(pos:Number) {
		clearTimeout(timeout);
		clearInterval(timeinterval);
		if(model.config['state'] == ModelStates.PAUSED) {
			stream.resume();
		} else {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		stream.seek(pos);
	};


	/** Set streaming object **/
	public function setStream() {
		stream = new NetStream(connection);
		stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		stream.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,metaHandler);
		stream.bufferTime = model.config['bufferlength'];
		stream.client = this;
		video.attachNetStream(stream);
		stream.soundTransform = transform;
		stream.play(getID(model.playlist[model.config['item']]['file']));
		clearInterval(timeinterval);
		timeinterval = setInterval(timeHandler,100);
	};


	/** Receive NetStream status updates. **/
	private function statusHandler(evt:NetStatusEvent) {
		if(evt.info.code == "NetConnection.Connect.Success") {
			setStream();
		} else if(evt.info.code == "NetStream.Seek.Notify") {
			clearInterval(timeinterval);
			timeinterval = setInterval(timeHandler,100);
		} else if(evt.info.code == "NetStream.Play.StreamNotFound") {
			if(fileindex > 10) {
				load();
			} else {
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:"Stream not found: "+model.playlist[model.config['item']]['file']});
			}
		} else if (evt.info.code == "NetConnection.Connect.Rejected" || evt.info.code == "NetConnection.Connect.Failed") {
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:"Stream not found: "+model.playlist[model.config['item']]['file']});
		} else { 
			model.sendEvent(ModelEvent.META,{info:evt.info.code});
		}
	};


	/** Destroy the stream. **/
	public function stop() {
		metadata = false;
		fileindex = undefined;
		clearInterval(timeinterval);
		connection.close();
		if(stream) { stream.close(); }
		video.attachNetStream(null);
	};


	/** Interval for the position progress **/
	private function timeHandler() {
		var bfr = Math.round(stream.bufferLength/stream.bufferTime*100);
		var pos = Math.round(stream.time*10)/10;
		var dur = model.playlist[model.config['item']]['duration'];
		if(bfr < 100 && pos < Math.abs(dur-stream.bufferTime-1)) {
			model.sendEvent(ModelEvent.BUFFER,{percentage:bfr});
			if(model.config['state'] != ModelStates.BUFFERING) {
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
			}
		} else if (model.config['state'] == ModelStates.BUFFERING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		}
		if(dur > 0) {
			model.sendEvent(ModelEvent.TIME,{position:pos,duration:dur});
		}
	};


	/** Set the volume level. **/
	public function volume(vol:Number) {
		transform.volume = vol/100;
		if(stream) { 
			stream.soundTransform = transform;
		}
	};


};


}