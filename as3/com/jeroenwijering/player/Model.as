/**
* Wraps all media APIs (all models) and manages thumbnail display.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.*;
import com.jeroenwijering.utils.*;

import flash.display.*;
import flash.events.*;
import flash.net.URLRequest;
import flash.system.LoaderContext;


public class Model extends EventDispatcher {


	/** Object with all configuration variables. **/
	public var config:Object;
	/** Reference to the display MovieClip. **/
	public var display:MovieClip;
	/** Object with all display variables. **/
	private var sploader:SPLoader;
	/** Reference to the player's controller. **/
	private var controller:Controller;
	/** The list with all active models. **/
	private var models:Object;
	/** Loader for the preview image. **/
	private var thumb:Loader;
	/** Save the currently playing playlist item. **/
	private var item:Object;
	/** Save the current image url to prevent duplicate loading. **/
	private var image:String;


	/** Constructor, save references, setup listeners and  init thumbloader. **/
	public function Model(cfg:Object,skn:MovieClip,ldr:SPLoader,ctr:Controller):void {
		config = cfg;
		display = MovieClip(skn.getChildByName('display'));
		sploader = ldr;
		controller = ctr;
		controller.addEventListener(ControllerEvent.ITEM,itemHandler);
		controller.addEventListener(ControllerEvent.MUTE,muteHandler);
		controller.addEventListener(ControllerEvent.PLAY,playHandler);
		controller.addEventListener(ControllerEvent.PLAYLIST,playlistHandler);
		controller.addEventListener(ControllerEvent.RESIZE,resizeHandler);
		controller.addEventListener(ControllerEvent.SEEK,seekHandler);
		controller.addEventListener(ControllerEvent.STOP,stopHandler);
		controller.addEventListener(ControllerEvent.VOLUME,volumeHandler);
		thumb = new Loader();
		thumb.contentLoaderInfo.addEventListener(Event.COMPLETE,thumbHandler);
		thumb.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,thumbHandler);
		Draw.clear(display.media);
		display.addChildAt(thumb,display.getChildIndex(display.media));
		display.media.visible = false;
		models = new Object();
	};


	/** Load a new playback model. **/
	public function addModel(mdl:AbstractModel,typ:String):void {
		models[typ] = mdl;
	};


	/** Item change: stop the old model and start the new one. **/
	private function itemHandler(evt:ControllerEvent):void {
		if(item) {
			models[item['type']].stop();
		}
		item = controller.playlist[config['item']];
		if(models[item['type']]) {
			models[item['type']].load(item);
		} else {
			sendEvent(ModelEvent.ERROR,{message:'No suiteable model found for playback of this file.'});
		}
		if(item['image']) {
			if(item['image'] != image) {
				image = item['image'];
				thumb.load(new URLRequest(item['image']),new LoaderContext(true));
			}
		} else if(image) {
			image = undefined;
			thumb.unload();
		}
	};


	/** 
	* Place the mediafile fro the current model on stage.
	* 
	* @param obj	The displayobject (MovieClip/Video/Loader) to display.
	**/
	public function mediaHandler(obj:DisplayObject=undefined):void {
		Draw.clear(display.media);
		display.media.addChild(obj);
		resizeHandler();
	};


	/** Make the current model toggle its mute state. **/
	private function muteHandler(evt:ControllerEvent):void {
		if(item) {
			if(evt.data.state == true) {
				models[item['type']].volume(0);
			} else {
				models[item['type']].volume(config['volume']);
			}
		}
	};


	/** Make the current model play or pause. **/
	private function playHandler(evt:ControllerEvent):void {
		if(item) {
			if(evt.data.state == true) {
				models[item['type']].play();
			} else { 
				models[item['type']].pause();
			}
		}
	};


	/** Load a new thumbnail. **/
	private function playlistHandler(evt:ControllerEvent):void {
		var img:String = controller.playlist[config['item']]['image'];
		if(img && img != image) {
			image = img;
			thumb.load(new URLRequest(img),new LoaderContext(true));
		}
	};


	/** Resize the media and thumb. **/
	private function resizeHandler(evt:Event=null):void {
		var wid:Number = sploader.getPlugin('display').config['width'];
		var hei:Number = sploader.getPlugin('display').config['height'];
		Stretcher.stretch(display.media,wid,hei,config['stretching']);
		if(thumb.width > 10) {
			Stretcher.stretch(thumb,wid,hei,config['stretching']);
		}
	};


	/** Make the current model seek. **/
	private function seekHandler(evt:ControllerEvent):void {
		if(item) {
			models[item['type']].seek(evt.data.position);
		}
	};


	/** Make the current model stop and show the thumb. **/
	private function stopHandler(evt:ControllerEvent=undefined):void {
		if(item) {
			models[item['type']].stop();
		}
	};


	/**  
	* Dispatch events to the View/ Controller.
	* When switching states, the thumbnail is shown/hidden.
	* 
	* @param typ	The eventtype to dispatch.
	* @param dat	An object with data to send along.
	* @see 			ModelEvent
	**/
	public function sendEvent(typ:String,dat:Object):void {
		if(typ == ModelEvent.STATE) {
			dat['oldstate'] = config['state'];
			config['state'] = dat.newstate;
			switch(dat['newstate']) {
				case ModelStates.IDLE:
					sendEvent(ModelEvent.LOADED,{loaded:0,offset:0,total:0});
				case ModelStates.COMPLETED:
					thumb.visible = true;
					display.media.visible = false;
					sendEvent(ModelEvent.TIME,{position:0,duration:item['duration']});
					break;
				case ModelStates.PLAYING:
					if(item['file'].indexOf('m4a') == -1
						&& item['file'].indexOf('mp3') == -1
						&& item['file'].indexOf('aac') == -1) {
						thumb.visible = false;
						display.media.visible = true;
					} else { 
						thumb.visible = true;
						display.media.visible = false;
					}
					break;
			}
		} else if(dat.width) {
			resizeHandler();
		}
		Logger.log(dat,typ);
		dispatchEvent(new ModelEvent(typ,dat));
	};


	/** Thumb loaded, try to antialias it before resizing. **/
	private function thumbHandler(evt:Event) {
		try {
			Bitmap(thumb.content).smoothing = true;
		} catch (err:Error) {}
		resizeHandler();
	};


	/** Make the current model change volume. **/
	private function volumeHandler(evt:ControllerEvent):void {
		if(item) {
			models[item['type']].volume(evt.data.percentage);
		}
	};


}


}