/**
* Model for playback of GIF/JPG/PNG images.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.BasicModel;
import com.jeroenwijering.player.Model;

import flash.display.Bitmap;
import flash.display.Loader;
import flash.events.*;
import flash.net.URLRequest;
import flash.system.LoaderContext;


public class ImageModel extends BasicModel {


	/** Loader that loads the image. **/
	private var loader:Loader;


	/** Constructor; sets up listeners **/
	public function ImageModel(mod:Model):void {
		super(mod);
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
		loader.contentLoaderInfo.addEventListener(ProgressEvent.PROGRESS,progressHandler);
		loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
	};


	/** load image into screen **/
	override public function load(itm:Object):void {
		super.load(itm);
		loader.load(new URLRequest(item['file']),new LoaderContext(true));
	};


	/** Catch errors. **/
	private function errorHandler(evt:ErrorEvent):void {
		stop();
		model.sendEvent(ModelEvent.ERROR,{message:evt.text});
	};


	/** Load and place the image on stage. **/
	private function loaderHandler(evt:Event):void {
		model.mediaHandler(loader);
		try {
			Bitmap(loader.content).smoothing = true;
		} catch (err:Error) {}
		model.sendEvent(ModelEvent.META,{height:evt.target.height,width:evt.target.width});
		play();
	};


	/** Interval function that pings the position. **/
	override protected function positionInterval():void {
		position += 0.1;
		super.positionInterval();
	};


	/** Send load progress to player. **/
	private function progressHandler(evt:ProgressEvent):void {
		var pct = Math.round(evt.bytesLoaded/evt.bytesTotal*100);
		model.sendEvent(ModelEvent.BUFFER,{percentage:pct});
	};


	/** Stop the image interval. **/
	override public function stop():void {
		if(loader.contentLoaderInfo.bytesLoaded != loader.contentLoaderInfo.bytesTotal) {
			loader.close();
		} else {
			loader.unload();
		}
		super.stop();
	};


};


}