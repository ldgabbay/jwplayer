/**
* Wrapper for playback of video streamed over RTMP.
* 
* All playback functionalities are cross-server (FMS, Wowza, Red5), with the exception of:
* - The SecureToken functionality (Wowza).
* - getStreamLength / checkBandwidth (FMS3).
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.BasicModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.NetClient;
import com.jeroenwijering.utils.TEA;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class RTMPModel extends BasicModel {


	/** Video object to be instantiated. **/
	protected var video:Video;
	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Sound control object. **/
	protected var transform:SoundTransform;


	/** Constructor; sets up the connection and display. **/
	public function RTMPModel(mod:Model):void {
		super(mod);
		connection = new NetConnection();
		connection.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		connection.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		connection.objectEncoding = ObjectEncoding.AMF0;
		connection.client = new NetClient(this);
		video = new Video(320,240);
		video.smoothing = model.config['smoothing'];
		transform = new SoundTransform();
	};


	/** Catch security errors. **/
	protected function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Extract the correct rtmp syntax from the file string. **/
	private function getID(url:String):String {
		var ext:String = url.substr(-4);
		if(ext == '.mp3') {
			return 'mp3:'+url.substr(0,url.length-4);
		} else if(ext == '.mp4' || ext == '.mov' || ext == '.aac' || ext == '.m4a') {
			return 'mp4:'+url;
		} else if (ext == '.flv') {
			return url.substr(0,url.length-4);
		} else {
			return url;
		}
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		super.load(itm);
		model.mediaHandler(video);
		connection.connect(item['streamer']);
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
		if(dat.type == 'complete') {
			clearInterval(interval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
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


	/** Interval for the position progress. **/
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
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration']});
		} else if (item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a new position. **/
	override public function seek(pos:Number):void {
		super.seek(pos);
		stream.seek(pos);
	};


	/** Start the netstream object. **/
	protected function setStream() {
		stream = new NetStream(connection);
		stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		stream.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		stream.bufferTime = model.config['bufferlength'];
		stream.client = new NetClient(this);
		video.attachNetStream(stream);
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
		interval = setInterval(positionInterval,100);
		stream.play(getID(item['file']),item['start']);
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case 'NetConnection.Connect.Success':
				setStream();
				var res:Responder = new Responder(streamlengthHandler);
				connection.call("getStreamLength",res,getID(item['file']));
				connection.call("checkBandwidth",null);
				if(evt.info.secureToken != undefined) {
					connection.call("secureTokenResponse",null,TEA.decrypt(evt.info.secureToken,model.config['token']));
				}
				break;
			case  'NetStream.Seek.Notify':
				clearInterval(interval);
				interval = setInterval(positionInterval,100);
				break;
			case 'NetConnection.Connect.Rejected':
				if(evt.info.ex.code == 302) {
					item['streamer'] = evt.info.ex.redirect;
					connection.connect(item['streamer']);
				}
				break;
			case 'NetStream.Failed':
			case 'NetStream.Play.StreamNotFound':
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:"Stream not found: "+item['file']});
				break;
			case 'NetConnection.Connect.Failed':
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:"Server not found: "+item['streamer']});
				break;
		}
		model.sendEvent(ModelEvent.META,{info:evt.info.code});
	};


	/** Destroy the stream. **/
	override public function stop():void {
		if(stream) { 
			stream.close();
		}
		connection.close();
		super.stop();
	};


	/** Get the streamlength returned from the connection. **/
	private function streamlengthHandler(len:Number):void {
		onData({type:'streamlength',duration:len-item['start']});
	};


	/** Set the volume level. **/
	override public function volume(vol:Number):void {
		transform.volume = vol/100;
		if(stream) { 
			stream.soundTransform = transform;
		}
	};


};


}