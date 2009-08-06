﻿/**
* Player that crunches through all media formats Flash can read.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.*;
import com.jeroenwijering.plugins.*;
import com.jeroenwijering.utils.Configger;
import com.jeroenwijering.utils.Logger;

import flash.display.MovieClip;
import flash.events.Event;


public class Player extends MovieClip {


	/** All configuration values. Change them to hard-code your preferences. **/
	public var config:Object = {
		author:undefined,
		date:undefined,
		description:undefined,
		duration:0,
		file:undefined,
		image:undefined,
		link:undefined,
		start:0,
		streamer:undefined,
		tags:undefined,
		title:undefined,
		type:undefined,

		backcolor:undefined,
		frontcolor:undefined,
		lightcolor:undefined,
		screencolor:undefined,

		controlbar:'bottom',
		dock:false,
		height:300,
		icons:true,
		playlist:'none',
		playlistsize:180,
		skin:undefined,
		width:400,

		autostart:false,
		bufferlength:1,
		displayclick:'play',
		fullscreen:false,
		item:0,
		linktarget:'_blank',
		logo:undefined,
		mute:false,
		repeat:'none',
		resizing:true,
		shuffle:false,
		smoothing:true,
		state:'IDLE',
		stretching:'uniform',
		volume:90,

		abouttext:"JW Player",
		aboutlink:"http://www.longtailvideo.com/players/jw-flv-player/",
		client:undefined,
		debug:'none',
		id:undefined,
		plugins:undefined,
		version:'4.6.248'
	};
	/** Reference to all stage graphics. **/
	public var skin:MovieClip;
	/** Reference to the View of the MVC cycle, defining all API calls. **/
	public var view:View;
	/** Object that loads all configuration variables. **/
	protected var configger:Configger;
	/** Object that load the skin and plugins. **/
	protected var sploader:SPLoader;
	/** Reference to the Controller of the MVC cycle. **/
	protected var controller:Controller;
	/** Reference to the model of the MVC cycle. **/
	protected var model:Model;


	/** Constructor; hides player and waits until it is added to the stage. **/
	public function Player():void {
		skin = this['player'];
		for(var i:Number=0; i<skin.numChildren; i++) {
			skin.getChildAt(i).visible = false;
		}
		// This event is useful for Flex, but not recognized by FP9.0.16
		try {
			addEventListener(Event.ADDED_TO_STAGE,loadConfig);
		} catch(err:Error) { loadConfig(); }
	};


	/** When added to stage, the player loads configuration settings. **/
	protected function loadConfig(evt:Event=null):void {
		try {
			removeEventListener(Event.ADDED_TO_STAGE,loadConfig);
		} catch(err:Error) {}
		configger = new Configger(this);
		configger.addEventListener(Event.COMPLETE,loadSkin);
		configger.load(config);
	};


	/** When config is loaded, the player laods the skin. **/
	protected function loadSkin(evt:Event=null):void {
		if(config['tracecall']) {
			Logger.output = config['tracecall'];
		} else { 
			Logger.output = config['debug'];
		}
		sploader = new SPLoader(this);
		sploader.addEventListener(SPLoaderEvent.SKIN,loadMVC);
		sploader.loadSkin();
	};


	/** When the skin is loaded, the model/view/controller are inited. **/
	protected function loadMVC(evt:SPLoaderEvent=null):void {
		controller = new Controller(config,skin,sploader);
		model = new Model(config,skin,sploader,controller);
		view = new View(config,skin,sploader,controller,model);
		controller.closeMVC(model,view);
		addModels();
		addPlugins();
		sploader.addEventListener(SPLoaderEvent.PLUGINS,startPlayer);
		sploader.loadPlugins();
	};


	/** Initialize all playback models. **/
	protected function addModels():void {
		model.addModel(new HTTPModel(model),'http');
		model.addModel(new ImageModel(model),'image');
		model.addModel(new RTMPModel(model),'rtmp');
		model.addModel(new SegmentModel(model),'segment');
		model.addModel(new SoundModel(model),'sound');
		model.addModel(new VideoModel(model),'video');
		model.addModel(new YoutubeModel(model),'youtube');

		model.addModel(new BitgravityModel(model),'bitgravity');
		model.addModel(new EdgeCastModel(model),'edgecast');
		model.addModel(new FCSubscribeModel(model),'fcsubscribe');
		model.addModel(new FLVSeekModel(model),'flvseek');
		model.addModel(new HighwindsModel(model),'highwinds');
		model.addModel(new LighttpdModel(model),'lighttpd');
		model.addModel(new VDOXModel(model),'vdox');
	};


	/** Init built-in plugins and load external ones. **/
	protected function addPlugins():void {
		sploader.addPlugin(new Display(),'display');
		sploader.addPlugin(new Rightclick(),'rightclick');
		sploader.addPlugin(new Controlbar(),'controlbar');
		sploader.addPlugin(new Playlist(),'playlist');
		sploader.addPlugin(new Dock(),'dock');
		sploader.addPlugin(new Watermark(),'watermark');
	};


	/**
	* Everything is now ready. The Player is redrawn, shown and the file is loaded.
	*
	* The Player broadcasts a READY event here to actionscript.
	* The View will send an asynchroneous PlayerReady event to javascript.
	**/
	protected function startPlayer(evt:SPLoaderEvent=null) {
		view.sendEvent(ViewEvent.REDRAW);
		dispatchEvent(new PlayerEvent(PlayerEvent.READY));
		view.playerReady();
		if(config['file']) {
			view.sendEvent(ViewEvent.LOAD,config);
		}
	};


}


}