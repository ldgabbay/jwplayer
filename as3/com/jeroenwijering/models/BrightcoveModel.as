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


public class BrightcoveModel implements ModelInterface {


	/** Reference to the Model **/
	private var model:Model;
	/** Loader for loading the Brightcove player. **/
	private var loader:Loader;
	/** Reference to the Brightcove player. **/
	private var bcPlayer:Object;


	/** Load Brightcove player. **/
	public function BrightcoveModel(mod:Model):void {
		model = mod;
		Security.allowDomain("http://admin.brightcove.com");
		var url = model.config['file'] + '?isVid=1';
		url += "&cdnURL="+escape("http://admin.brightcove.com");
		url += "&servicesURL="+escape("http://services.brightcove.com/services");
		url += "&playerWidth="+model.config["width"];
		url += "&playerHeight="+model.config["height"];
		url = 'http://c.brightcove.com/services/viewer/federated_f9/1896802254?isVid=1&isUI=1&flashID=null&playerWidth=650&playerHeight=630&publisherID=979525218&playerID=1896802254';
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
		loader.load(new URLRequest(url),new LoaderContext(true,ApplicationDomain.currentDomain));
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
		var pLoaderInfo:LoaderInfo = evt.target as LoaderInfo;
		var pLoader:Loader = pLoaderInfo.loader;
		var pPlayer:Sprite = evt.target.content as Sprite;
		if (bcPlayer && pPlayer != bcPlayer) {
			if (bcPlayer.parent) {
				bcPlayer.parent.removeChild(bcPlayer);
			}
		}
		bcPlayer = pPlayer;
		model.mediaHandler(bcPlayer as Sprite);
		if (model.skin.display.contains(pLoader)) model.skin.display.removeChild(pLoader);
	};


	private function createPlayer(config:Object):void {
	};


	public function onTemplateLoaded():void {
		trace('template loaded!');
	};


	public function getModule(pModule:String):Object {
		// return Object(bcPlayer).getModule(pModule);
		return '';
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