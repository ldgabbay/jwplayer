﻿/**
* Wrapper for load and playback of Youtube videos through their API.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;

import flash.display.*;
import flash.events.*;
import flash.net.URLRequest;
import flash.system.*;


public class LivestreamModel extends AbstractModel {


	/** URL of the livestream SWF. **/
	private const LOCATION:String = "http://cdn.livestream.com/chromelessPlayer/wrappers/SimpleWrapper.swf";


	/** Loader for loading the Livestream API. **/
	private var loader:Loader;
	/** Reference to the chromeless player. **/
	private var player:Object;
	/** Wrapper of the chromeless player. **/
	private var wrapper:Object;


	/** Setup YouTube connections and load proxy. **/
	public function LivestreamModel(mod:Model):void {
		super(mod);
		mouseEnabled = true;
		Security.allowDomain('*');
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		addChild(loader);
	};

	/** Livestream application loaded. **/
	private function applicationHandler(evt:Event):void {
		wrapper = Object(loader.content).application;
		wrapper.addEventListener("ready", playerReadyHandler);
	};


	/** Catch load errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load the Livestream channel. **/
	override public function load(itm:Object):void {
		item = itm;
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
		if(player) {
			play();
		} else {
			Security.loadPolicyFile("http://cdn.livestream.com/crossdomain.xml");
			loader.load(new URLRequest(LOCATION),new LoaderContext(true,
				ApplicationDomain.currentDomain,SecurityDomain.currentDomain));
		}
	};


	/** Livestream player SWF loaded. **/
	private function loaderHandler(evt:Event):void {
		loader.content.addEventListener('applicationComplete',applicationHandler);
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
		player = wrapper.getPlayer();
		player.addEventListener("errorEvent", playerErrorHandler);
		player.devKey = model.config['livestream.devkey'];
		player.showMuteButton = false;
		player.showPauseButton = false;
		player.showPlayButton = false;
		player.showSpinner = false;
		player.volumeOverlayEnabled = true;
		player.volume = model.config['volume']/100;
		resize();
		play();
	};


	/** Chromeless player failed loading. **/
	private function playerErrorHandler(evt:Event):void {
		stop();
		var msg:String = Object(evt).message;
		model.sendEvent(ModelEvent.ERROR,{message:msg});
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