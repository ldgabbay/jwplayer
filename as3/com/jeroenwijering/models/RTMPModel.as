package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.*;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


/**
* Wrapper for playback of video streamed over RTMP. Can playback MP4, FLV, MP3, AAC and live streams.
* Server-specific features are:
* - The SecureToken functionality of Wowza (with the 'token' flahvar).
* - Load balancing with SMIL files (with the 'rtmp.loadbalance=true' flashvar).
**/
public class RTMPModel extends AbstractModel {


	/** NetConnection object for setup of the video stream. **/
	private var connection:NetConnection;
	/** ID for the position interval. **/
	private var interval:Number;
	/** Loader instance that loads the XML file. **/
	private var loader:URLLoader;
	/** NetStream instance that handles the stream IO. **/
	private var stream:NetStream;
	/** Sound control object. **/
	private var transform:SoundTransform;
	/** Save the location of the XML redirect. **/
	private var smil:String;
	/** Save that the video has been started. **/
	private var started:Boolean;
	/** Save that a file is unpublished. **/
	private var unpublished:Boolean;
	/** Video object to be instantiated. **/
	private var video:Video;


	/** Constructor; sets up the connection and display. **/
	public function RTMPModel(mod:Model):void {
		super(mod);
		connection = new NetConnection();
		connection.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		connection.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		connection.objectEncoding = ObjectEncoding.AMF0;
		connection.client = new Object();
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE, loaderHandler);
		loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		loader.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		video = new Video(320,240);
		video.smoothing = model.config['smoothing'];
		transform = new SoundTransform();
	};


	/** Catch security errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Extract the correct rtmp syntax from the file string. **/
	private function getID(url:String):String {
		var ext:String = url.substr(-4);
		if(ext == '.mp3') {
			return 'mp3:'+url.substr(0,url.length-4);
		} else if(ext == '.mp4' || ext == '.mov' || ext == '.aac' || ext == '.m4a' || ext == '.f4v') {
			return 'mp4:'+url;
		} else if (ext == '.flv') {
			return url.substr(0,url.length-4);
		} else {
			return url;
		}
	};


	/** Load content. **/
	override public function load(itm:Object):void {
		item = itm;
		position = 0;
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
		if(model.config['rtmp.loadbalance']) {
			smil = item['file'];
			loader.load(new URLRequest(smil));
		} else {
			model.mediaHandler(video);
			connection.connect(item['streamer']);
		}
	};


	/** Get the streamer / file from the loadbalancing XML. **/
	private function loaderHandler(evt:Event) {
		var xml:XML = XML(evt.currentTarget.data);
		item['streamer'] = xml.children()[0].children()[0].@base.toString();
		item['file'] = xml.children()[1].children()[0].@src.toString();
		model.mediaHandler(video);
		connection.connect(item['streamer']);
	};


	/** Get metadata information from netstream class. **/
	public function onData(dat:Object):void {
		if(dat.width) {
			video.width = dat.width;
			video.height = dat.height;
		}
		if(dat.type == 'complete') {
			clearInterval(interval);
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
		if(dat.type == 'close') {
			stop();
		}
		model.sendEvent(ModelEvent.META,dat);
	};


	/** Pause playback. **/
	override public function pause():void {
		stream.pause();
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
		if(started && item['duration'] == 0) {
			stop();
		}
	};


	/** Resume playing. **/
	override public function play():void {
		stream.resume();
		interval = setInterval(positionInterval,100);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
	};


	/** Interval for the position progress. **/
	private function positionInterval():void {
		position = Math.round(stream.time*10)/10;
		var bfr:Number = Math.round(stream.bufferLength/stream.bufferTime*100);
		if(bfr < 95 && position < Math.abs(item['duration']-stream.bufferTime-1)) {
			model.sendEvent(ModelEvent.BUFFER,{percentage:bfr});
			if(model.config['state'] != ModelStates.BUFFERING && bfr < 20) {
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
				stream.bufferTime = model.config['bufferlength'];
				model.sendEvent(ModelEvent.META,{bufferlength:model.config['bufferlength']});
			}
		} else if (bfr > 95 && model.config['state'] != ModelStates.PLAYING) {
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
			stream.bufferTime = model.config['bufferlength']*4;
			model.sendEvent(ModelEvent.META,{bufferlength:model.config['bufferlength']*4});
		}
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration']});
		} else if (!isNaN(position) && item['duration'] > 0) {
			stream.pause();
			clearInterval(interval);
			if(started && item['duration'] == 0) { stop(); }
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a new position. **/
	override public function seek(pos:Number):void {
		position = pos;
		clearInterval(interval);
		if(model.config['state'] != ModelStates.PLAYING) {
			stream.resume();
		}
		interval = setInterval(positionInterval,100);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		stream.seek(position);
	};


	/** Start the netstream object. **/
	private function setStream() {
		stream = new NetStream(connection);
		stream.checkPolicyFile = true;
		stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		stream.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		stream.bufferTime = model.config['bufferlength'];
		stream.client = new NetClient(this);
		video.attachNetStream(stream);
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
		interval = setInterval(positionInterval,100);
		stream.play(getID(item['file']));
	};


	/** Receive NetStream status updates. **/
	private function statusHandler(evt:NetStatusEvent):void {
		switch(evt.info.code) {
			case 'NetConnection.Connect.Success':
				if(evt.info.secureToken != undefined) {
					connection.call("secureTokenResponse",null,
						TEA.decrypt(evt.info.secureToken,model.config['token']));
				}
				setStream();
				var res:Responder = new Responder(streamlengthHandler);
				connection.call("getStreamLength",res,getID(item['file']));
				connection.call("checkBandwidth",null);
				break;
			case  'NetStream.Play.Start':
				if(item['start'] > 0 && !started) { seek(item['start']); }
				started = true;
				break;
			case  'NetStream.Seek.Notify':
				clearInterval(interval);
				interval = setInterval(positionInterval,100);
				break;
			case 'NetConnection.Connect.Rejected':
				try { 
					if(evt.info.ex.code == 302) {
						item['streamer'] = evt.info.ex.redirect;
						setTimeout(load,100,item);
						return;
					}
				} catch (err:Error) {
					stop();
					var msg:String = evt.info.code;
					if(evt.info['description']) { msg = evt.info['description']; }
					model.sendEvent(ModelEvent.ERROR,{message:msg});
				}
				break;
			case 'NetStream.Failed':
			case 'NetStream.Play.StreamNotFound':
				if(unpublished) {
					onData({type:'complete'});
					unpublished = false;
				} else { 
					stop();
					model.sendEvent(ModelEvent.ERROR,{message:"Stream not found: "+item['file']});
				}
				break;
			case 'NetConnection.Connect.Failed':
				stop();
				model.sendEvent(ModelEvent.ERROR,{message:"Server not found: "+item['streamer']});
				break;
			case 'NetStream.Play.UnpublishNotify':
				unpublished = true;
				break;
		}
		model.sendEvent(ModelEvent.META,evt.info);
	};


	/** Destroy the stream. **/
	override public function stop():void {
		if(stream) { 
			stream.close();
		}
		connection.close();
		started = false;
		clearInterval(interval);
		position = 0;
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
		if(smil) { 
			item['file'] = smil;
		}
	};


	/** Get the streamlength returned from the connection. **/
	private function streamlengthHandler(len:Number):void {
		if(len > 0) { onData({type:'streamlength',duration:len}); }
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