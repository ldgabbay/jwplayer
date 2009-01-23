/**
* Wraps all media APIs (all models) and manages thumbnail display.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.BasicModel;
import com.jeroenwijering.player.*;
import com.jeroenwijering.utils.*;

import flash.display.*;
import flash.events.*;
import flash.net.URLRequest;
import flash.system.LoaderContext;


public class Model extends EventDispatcher {


	/** Object with all configuration variables. **/
	public var config:Object;
	/** Reference to the skin MovieClip. **/
	public var skin:MovieClip;
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
		skin = skn;
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
		Draw.clear(skin.display.media);
		skin.display.addChildAt(thumb,skin.display.getChildIndex(skin.display.media)+1);
		skin.display.media.visible = false;
		models = new Object();
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
		if(item['image'] && item['image'] != image) {
			image = item['image'];
			thumb.load(new URLRequest(item['image']),new LoaderContext(true));
		}
	};


	/** Load a new playback model. **/
	public function loadModel(mdl:BasicModel,typ:String):void {
		models[typ] = mdl;
	};


	/** 
	* Place the mediafile fro the current model on stage.
	* 
	* @param obj	The displayobject (MovieClip/Video/Loader) to display.
	**/
	public function mediaHandler(obj:DisplayObject=undefined):void {
		Draw.clear(skin.display.media);
		skin.display.media.addChild(obj);
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
		var cfg:Object = sploader.getPluginConfig(sploader.getPlugin('display'));
		Stretcher.stretch(skin.display.media,cfg['width'],cfg['height'],config['stretching']);
		if(thumb.width > 10) {
			Stretcher.stretch(thumb,cfg['width'],cfg['height'],config['stretching']);
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
		image = undefined;
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
		switch(typ) { 
			case ModelEvent.STATE:
				dat['oldstate'] = config['state'];
				config['state'] = dat.newstate;
				dispatchEvent(new ModelEvent(typ,dat));
				switch(dat['newstate']) {
					case ModelStates.IDLE:
						sendEvent(ModelEvent.LOADED,{loaded:0,offset:0,total:0});
					case ModelStates.COMPLETED:
						thumb.visible = true;
						skin.display.media.visible = false;
						sendEvent(ModelEvent.TIME,{position:0,duration:item['duration']});
						break;
					case ModelStates.PLAYING:
						if(item['file'].indexOf('m4a') == -1
							&& item['file'].indexOf('mp3') == -1
							&& item['file'].indexOf('aac') == -1) {
							thumb.visible = false;
							skin.display.media.visible = true;
						} else { 
							thumb.visible = true;
							skin.display.media.visible = false;
						}
						break;
				}
				break;
			case ModelEvent.META:
				if(dat.width) { resizeHandler(); }
			default:
				dispatchEvent(new ModelEvent(typ,dat));
				break;
		}
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