/**
* Wrap all media API's and manage playback.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.*;
import com.jeroenwijering.player.*;
import com.jeroenwijering.utils.*;
import flash.display.*;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.net.URLRequest;
import flash.system.LoaderContext;
import flash.utils.getDefinitionByName;


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
	/** Save the current image to prevent overloading. **/
	private var image:String;
	/** Currently active model. **/
	private var currentModel:String;


	/** Constructor, save arrays and set currentItem. **/
	public function Model(cfg:Object,skn:MovieClip,ldr:SPLoader,ctr:Controller):void {
		config = cfg;
		skin = skn;
		sploader = ldr;
		Draw.clear(skin.display.media);
		controller = ctr;
		controller.addEventListener(ControllerEvent.ITEM,itemHandler);
		controller.addEventListener(ControllerEvent.MUTE,muteHandler);
		controller.addEventListener(ControllerEvent.PLAY,playHandler);
		controller.addEventListener(ControllerEvent.PLAYLIST,playlistHandler);
		controller.addEventListener(ControllerEvent.QUALITY,qualityHandler);
		controller.addEventListener(ControllerEvent.RESIZE,resizeHandler);
		controller.addEventListener(ControllerEvent.SEEK,seekHandler);
		controller.addEventListener(ControllerEvent.STOP,stopHandler);
		controller.addEventListener(ControllerEvent.VOLUME,volumeHandler);
		thumb = new Loader();
		thumb.contentLoaderInfo.addEventListener(Event.COMPLETE,resizeHandler);
		skin.display.addChildAt(thumb,skin.display.getChildIndex(skin.display.media)+1);
		models = new Object();
	};


	/** Item change: switch the curently active model if there's a new URL **/
	private function itemHandler(evt:ControllerEvent):void {
		var typ:String = playlist[config['item']]['type'];
		if(currentModel) {
			models[currentModel].stop();
		}
		if(!models[typ]) {
			loadModel(typ);
		}
		if(models[typ]) {
			currentModel = typ;
			models[typ].load();
		} else {
			sendEvent(ModelEvent.ERROR,{message:'No suiteable model found for playback.'});
		}
		thumbLoader();
	};


	/** Initialize a new model. **/
	private function loadModel(typ:String):void {
		switch(typ) {
			case 'camera':
				models[typ] = new CameraModel(this);
				break;
			case 'http':
				models[typ] = new HTTPModel(this);
				break;
			case 'image':
				models[typ] = new ImageModel(this);
				break;
			case 'rtmp':
				models[typ] = new RTMPModel(this);
				break;
			case 'sound':
				models[typ] = new SoundModel(this);
				break;
			case 'video':
				models[typ] = new VideoModel(this);
				break;
			case 'youtube':
				models[typ] = new YoutubeModel(this);
				break;
		}
	};


	/** Place a loaded mediafile on stage **/
	public function mediaHandler(chd:DisplayObject=undefined):void {
		Draw.clear(skin.display.media);
		skin.display.media.addChild(chd);
		resizeHandler();
	};


	/** Load the configuration array. **/
	private function muteHandler(evt:ControllerEvent):void {
		if(currentModel) {
			if(evt.data.state == true) {
				models[currentModel].volume(0);
			} else {
				models[currentModel].volume(config['volume']);
			}
		}
	};


	/** Togge the playback state. **/
	private function playHandler(evt:ControllerEvent):void {
		if(currentModel) {
			if(evt.data.state == true) {
				models[currentModel].play();
			} else { 
				models[currentModel].pause();
			}
		}
	};


	/** Send an idle with new playlist. **/
	private function playlistHandler(evt:ControllerEvent):void {
		thumbLoader();
	};


	/** Toggle the playback quality. **/
	private function qualityHandler(evt:ControllerEvent):void {
		if(currentModel) {
			models[currentModel].quality(evt.data.state);
		}
	};


	/** Resize the media and thumb. **/
	private function resizeHandler(evt:Event=null):void {
		var cfg:Object = sploader.getPluginConfig(sploader.getPlugin('display'));
		Stretcher.stretch(skin.display.media,cfg['width'],cfg['height'],config['stretching']);
		if(thumb.content) {
			Stretcher.stretch(thumb,cfg['width'],cfg['height'],config['stretching']);
		}
	};


	/** Seek inside a file. **/
	private function seekHandler(evt:ControllerEvent):void {
		if(currentModel) {
			models[currentModel].seek(evt.data.position);
		}
	};


	/** Load the configuration array. **/
	private function stopHandler(evt:ControllerEvent=undefined):void {
		if(currentModel) {
			models[currentModel].stop();
		}
		sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/**  Dispatch events. State switch is saved. **/
	public function sendEvent(typ:String,dat:Object):void {
		switch(typ) { 
			case ModelEvent.STATE:
				dat['oldstate'] = config['state'];
				config['state'] = dat.newstate;
				dispatchEvent(new ModelEvent(typ,dat));
				switch(dat['newstate']) {
					case ModelStates.IDLE:
					case ModelStates.COMPLETED:
						thumb.visible = true;
						skin.display.media.visible = false;
						if(playlist) {
							sendEvent(ModelEvent.TIME,{position:0,duration:playlist[config['item']]['duration']});
						}
						break;
					case ModelStates.PLAYING:
						var ext:String = playlist[config['item']]['file'].substr(-3);
						if(ext != 'aac' && ext != 'mp3' && ext != 'm4a') {
							thumb.visible = false;
							skin.display.media.visible = true;
						} else { 
							thumb.visible = true;
							skin.display.media.visible = false;
						}
						break;
				}
				break;
			case ModelEvent.TIME:
				dat['duration'] = playlist[config['item']]['duration'];
				if(dat['duration'] > 0 && dat['duration'] < dat['position']) {
					models[currentModel].pause();
					sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
				} else {
					dispatchEvent(new ModelEvent(typ,dat));
				}
				break;
			
			case ModelEvent.ERROR:
				models[currentModel].stop();
				sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
				dispatchEvent(new ModelEvent(typ,dat));
				break;
			case ModelEvent.META:
				if(dat.width) { resizeHandler(); }
			default:
				dispatchEvent(new ModelEvent(typ,dat));
				break;
		}
	};


	/** Load a thumb on stage. **/
	private function thumbLoader():void {
		var img:String = playlist[config['item']]['image'];
		if(img && img != image) {
			image = img;
			thumb.load(new URLRequest(img),new LoaderContext(true));
		}
	};


	/** Load the configuration array. **/
	private function volumeHandler(evt:ControllerEvent):void {
		if(currentModel) {
			models[currentModel].volume(evt.data.percentage);
		}
	};


	/** Getter for the playlist **/
	public function get playlist():Array {
		return controller.playlist;
	};


}


}