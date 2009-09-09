/**
* Wrapper for load and playback of Youtube videos through their API.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.Logger;

import flash.display.*;
import flash.events.*;
import flash.net.URLRequest;
import flash.system.*;


public class LivestreamModel extends AbstractModel {


	/** URL of the livestream SWF. **/
	private const LOCATION:String = "http://cdn.livestream.com/chromelessPlayer/wrappers/SimpleWrapper.swf";
	/** Testing key for developer.longtailvideo.com. **/
	private var key:String = '8Y5Rp-6ikHTF0DaOYmxqBWNv8mAx7FdRjvbf2Kk-xWkAG0JUKJwrfGmnsgDfUlNMHqQUmpBOho4cmCyMKDT41I_H3riecIRlu9f1DNBkwF_We7mGBy3CD1fKSAbltsIn';

	/** Loader for loading the Livestream API. **/
	private var loader:Loader;
	/** Reference to the chromeless player. **/
	private var player:Object;
	/** Wrapper of the chromeless player. **/
	private var wrapper:Object;


	/** Setup YouTube connections and load proxy. **/
	public function LivestreamModel(mod:Model):void {
		super(mod);
		Security.allowDomain('*');
		Security.loadPolicyFile("http://cdn.livestream.com/crossdomain.xml");
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
	};

	/** Livestream application loaded. **/
	private function applicationHandler(evt:Event):void {
		wrapper = Object(loader.content).application;
		Logger.log('wrapper loaded: '+wrapper);
		wrapper.addEventListener("ready", playerReadyHandler);
	};


	/** Catch load errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load the YouTube movie. **/
	override public function load(itm:Object):void {
		item = itm;
		position = item['start'];
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
		if(player) {
			play();
		} else {
			loader.load(new URLRequest(LOCATION),new LoaderContext(true,
				ApplicationDomain.currentDomain,SecurityDomain.currentDomain));
		}
	};


	/** Livestream player SWF loaded. **/
	private function loaderHandler(evt:Event):void {
		Logger.log('swf loaded: '+loader.content);
		loader.content.addEventListener('applicationComplete',applicationHandler);
	};


	/** Pause the YouTube movie. **/
	override public function pause():void {
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};


	/** Play or pause the video. **/
	override public function play():void {
		var idx:Number = item['file'].lastIndexOf('/');
		player.channel = item['file'].substr(idx+1);
		player.play();
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
	};


	/** Chromeless player has succesfully loaded. **/
	private function playerReadyHandler(evt:Event):void {
		Logger.log('player loaded: '+wrapper.getPlayer());
		player = wrapper.getPlayer();
		model.mediaHandler(player as DisplayObject);
		player.addEventListener("errorEvent", playerErrorHandler);
		if(model.config['livestream.key']) {
			player.devKey = model.config['livestream.key'];
		} else {
			player.devKey = key;
		}
		player.showMuteButton = false;
		player.showPauseButton = false;
		player.showPlayButton = false;
		player.showSpinner = false;
		player.volumeOverlayEnabled = true;
		player.volume = model.config['volume']/100;
		play();
	};


	/** Chromeless player failed loading. **/
	private function playerErrorHandler(evt:Event):void {
		stop();
		var msg:String = Object(evt).message;
		model.sendEvent(ModelEvent.ERROR,{message:msg});
	};


	/** Seek to position. **/
	override public function seek(pos:Number):void {
		position = pos;
		play();
	};


	/** Destroy the youtube video. **/
	override public function stop():void {
		if(player) { player.stop(); }
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};



	/** Set the volume level. **/
	override public function volume(pct:Number):void {
		if(player) {
			player.volume = pct/100;
		}
	};


}


}