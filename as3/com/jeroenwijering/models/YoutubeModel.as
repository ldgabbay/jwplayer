/**
* Wrapper for load and playback of Youtube videos through their API.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;

import flash.display.Loader;
import flash.events.*;
import flash.net.LocalConnection;
import flash.net.URLRequest;
import flash.system.Security;


public class YoutubeModel extends AbstractModel {


	/** Loader for loading the YouTube proxy **/
	private var loader:Loader;
	/** 'Unique' string to use for proxy connection. **/
	private var unique:String;
	/** Connection towards the YT proxy. **/
	private var outgoing:LocalConnection;
	/** connection from the YT proxy. **/
	private var inbound:LocalConnection;
	/** Save that the meta has been sent. **/
	private var metasent:Boolean;
	/** Save that a load call has been sent. **/
	private var loading:Boolean;
	/** Save the connection state. **/
	private var connected:Boolean;
	/** URL of a custom youtube swf. **/
	private var location:String;


	/** Setup YouTube connections and load proxy. **/
	public function YoutubeModel(mod:Model):void {
		super(mod);
		Security.allowDomain('*');
		var url:String = model.display.loaderInfo.url;
		if(url.indexOf('http://') == 0) {
			unique = Math.random().toString().substr(2);
			var str:String = url.substr(0,url.indexOf('.swf'));
			location = str.substr(0,str.lastIndexOf('/')+1)+'yt.swf?unique='+unique;
		} else {
			unique = '1';
			location = 'yt.swf';
		}
		outgoing = new LocalConnection();
		outgoing.allowDomain('*');
		outgoing.allowInsecureDomain('*');
		outgoing.addEventListener(StatusEvent.STATUS,onLocalConnectionStatusChange);
		inbound = new LocalConnection();
		inbound.allowDomain('*');
		inbound.allowInsecureDomain('*');
		inbound.addEventListener(StatusEvent.STATUS,onLocalConnectionStatusChange);
		//inbound.addEventListener(AsyncErrorEvent.ASYNC_ERROR,errorHandler);
		inbound.client = this;
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
	};


	/** Catch load errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** xtract the current ID from a youtube URL **/
	private function getID(url:String):String {
		var arr = url.split('?');
		var str = '';
		for (var i in arr) {
			if(arr[i].substr(0,2) == 'v=') {
				str = arr[i].substr(2);
			}
		}
		if(str == '') { str = url.substr(url.indexOf('/v/')+3); }
		if(str.indexOf('&') > -1) { 
			str = str.substr(0,str.indexOf('&'));
		}
		return str;
	};


	/** Load the YouTube movie. **/
	override public function load(itm:Object):void {
		item = itm;
		position = 0;
		loading = true;
		if(connected) {
			if(outgoing) {
				var gid = getID(item['file']);
				resize(model.config['width'],model.config['width']/4*3);
				outgoing.send('AS3_'+unique,"loadVideoById",gid,item['start']);
				model.mediaHandler(loader);
			}
		} else {
			inbound.connect('AS2_'+unique);
			loader.load(new URLRequest(location));
		}
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
	};


	/** Pause the YouTube movie. **/
	override public function pause():void {
		outgoing.send('AS3_'+unique,"pauseVideo");
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};



	/** Play or pause the video. **/
	override public function play():void {
		outgoing.send('AS3_'+unique,"playVideo");
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
	};


	/** SWF loaded; add it to the tree **/
	public function onSwfLoadComplete():void {
		model.config['mute'] == true ? volume(0): volume(model.config['volume']);
		connected = true;
		if(loading) { load(item); }
	};


	/** error was thrown without this handler **/
	public function onLocalConnectionStatusChange(evt:StatusEvent):void {
		// model.sendEvent(ModelEvent.META,{status:evt.code});
	};


	/** Catch youtube errors. **/
	public function onError(erc:String):void {
		model.sendEvent(ModelEvent.ERROR,{message:"YouTube error (video not found?):\n"+item['file']});
		stop();
	};


	/** Catch youtube state changes. **/
	public function onStateChange(stt:Number):void {
		switch(Number(stt)) {
			case -1:
				// model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
				break;
			case 0:
				if(model.config['state'] != ModelStates.BUFFERING && model.config['state'] != ModelStates.IDLE) {
					model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				}
				break;
			case 1:
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
				break;
			case 2:
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
				break;
			case 3:
				model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
				model.sendEvent(ModelEvent.BUFFER,{percentage:0});
				break;
		}
	};


	/** Catch Youtube load changes **/
	public function onLoadChange(ldd:Number,ttl:Number,off:Number):void {
		model.sendEvent(ModelEvent.LOADED,{loaded:ldd,total:ttl,offset:off});
	};


	/** Catch Youtube position changes **/
	public function onTimeChange(pos:Number,dur:Number):void {
		model.sendEvent(ModelEvent.TIME,{position:pos,duration:dur});
		if(!metasent) {
			model.sendEvent(ModelEvent.META,{width:320,height:240,duration:dur});
			metasent = true;
		}
	};


	/** Resize the YT player. **/
	public function resize(wid:Number,hei:Number) {
		outgoing.send('AS3_'+unique,"setSize",wid,hei);
	};


	/** Seek to position. **/
	override public function seek(pos:Number):void {
		outgoing.send('AS3_'+unique,"seekTo",pos);
		play();
	};


	/** Destroy the youtube video. **/
	override public function stop():void {
		metasent = false;
		outgoing.send('AS3_'+unique,"stopVideo");
		position = 0;
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};



	/** Set the volume level. **/
	override public function volume(pct:Number):void {
		outgoing.send('AS3_'+unique,"setVolume",pct);
	};


}


}