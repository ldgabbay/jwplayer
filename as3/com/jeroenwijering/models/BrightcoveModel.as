/**
* Wrapper for load and playback of Brightcove videos.
* A Brightcove URL would look like: 
* http://services.brightcove.com/services/viewer/federated_f9/?publisherID=979525218
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.ModelInterface;
import com.jeroenwijering.player.Model;
import flash.display.*;
import flash.net.URLRequest;
import flash.events.*;
import flash.system.*;
import flash.utils.*;


public class BrightcoveModel implements ModelInterface {


	/** Reference to the Model **/
	private var model:Model;
	/** Loader for loading the Brightcove player. **/
	private var loader:Loader;
	/** Reference to the Brightcove VideoPlayer. **/
	private var videoplayer:Object;
	/** Interval ID for checking if the player is loaded. **/
	private var interval;


	/** Load Brightcove player. **/
	public function BrightcoveModel(mod:Model):void {
		model = mod;
		Security.allowDomain("*");
		var url = model.config['file'] + '?isVid=1';
		url += "&cdnURL="+escape("http://admin.brightcove.com");
		url += "&servicesURL="+escape("http://services.brightcove.com/services");
		url += "&playerWidth="+model.config["width"];
		url += "&playerHeight="+model.config["height"];
		url = 'http://c.brightcove.com/services/viewer/federated_f9/2069232001?isVid=1&playerWidth=400&playerHeight=280&playerID=2069232001';
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		var ctx:LoaderContext = new LoaderContext(false,ApplicationDomain.currentDomain);
		loader.load(new URLRequest(url),ctx);
	};


	/** Catch load errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Extract the video ID from a Brightcove URL **/
	private function getID(url:String):String {
		return '';
	};


	/** Load the video. **/
	public function load():void {
	};


	private function loaderHandler(evt:Event):void {
		interval = setInterval(checkPlayer,100);
	};


	private function checkPlayer():void {
		var exp:Object = Object(loader.content).getModule('experience');
		var vpl:Object = Object(loader.content).getModule('videoPlayer');
		if(vpl && exp) {
			videoplayer = vpl;
			exp.addEventListener('templateReady',templateReady);
			clearInterval(interval);
		}
	};

	private function templateReady(evt:Event) {
		model.mediaHandler(loader.content);
		videoplayer.loadVideo(model.config['file']);
	};


	/** Pause the video. **/
	public function pause():void {
	};


	/** Play the video. **/
	public function play():void {
	};


	/** Toggle video quality. **/
	public function quality(stt:Boolean):void {
	};


	/** Seek to position. **/
	public function seek(pos:Number):void {
	};


	/** Destroy the video. **/
	public function stop():void {
	};



	/** Set the volume level. **/
	public function volume(pct:Number):void {
	};


}


}