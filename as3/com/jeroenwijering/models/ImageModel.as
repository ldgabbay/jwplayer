/**
* Model for playback of GIF/JPG/PNG images.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;

import flash.display.*;
import flash.events.*;
import flash.net.URLRequest;
import flash.system.LoaderContext;
import flash.utils.*;


public class ImageModel extends AbstractModel {


	/** Loader that loads the image. **/
	private var loader:Loader;
	/** ID for the position interval. **/
	private var interval:Number;


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
		item = itm;
		position = 0;
		loader.load(new URLRequest(item['file']),new LoaderContext(true));
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
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


	/** Pause playback of the item. **/
	override public function pause():void {
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};


	/** Resume playback of the item. **/
	override public function play():void {
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		interval = setInterval(positionInterval,100);
	};


	/** Interval function that pings the position. **/
	protected function positionInterval():void {
		position = Math.round(position*10+1)/10;
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration']});
		} else if (item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Send load progress to player. **/
	private function progressHandler(evt:ProgressEvent):void {
		var pct = Math.round(evt.bytesLoaded/evt.bytesTotal*100);
		model.sendEvent(ModelEvent.BUFFER,{percentage:pct});
	};


	/** Seek to a certain position in the item. **/
	override public function seek(pos:Number):void {
		clearInterval(interval);
		position = pos;
		play();
	};


	/** Stop the image interval. **/
	override public function stop():void {
		if(loader.contentLoaderInfo.bytesLoaded != loader.contentLoaderInfo.bytesTotal) {
			loader.close();
		} else {
			loader.unload();
		}
		clearInterval(interval);
		position = 0;
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


};


}