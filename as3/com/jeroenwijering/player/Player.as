/**
* Player that crunches through all media formats Flash can read.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.events.*;
import com.jeroenwijering.plugins.*;
import com.jeroenwijering.utils.Configger;

import flash.display.MovieClip;
import flash.events.Event;


public class Player extends MovieClip {


	/** All configuration values. Change them to hard-code your preferences. **/
	public var config:Object = {
		author:undefined,
		description:undefined, 
		date:undefined,
		duration:0,
		file:undefined,
		image:undefined,
		link:undefined,
		start:0,
		tags:undefined,
		title:undefined,
		type:undefined,

		backcolor:undefined,
		frontcolor:undefined,
		lightcolor:undefined,
		screencolor:undefined,
		screenalpha:100,

		controlbar:'bottom',
		height:300,
		playlist:'none',
		playlistsize:180,
		skin:undefined,
		width:400,

		autostart:false,
		bufferlength:1,
		displayclick:'play',
		fullscreen:false,
		icons:true,
		item:0,
		logo:undefined,
		mute:false,
		quality:true,
		repeat:'none',
		resizing:true,
		shuffle:false,
		state:'IDLE',
		stretching:'uniform',
		volume:90,
		
		abouttext:undefined,
		aboutlink:"http://www.jeroenwijering.com/?item=JW_FLV_Player",
		client:undefined,
		id:undefined,
		linktarget:'_blank',
		plugins:undefined,
		streamer:undefined,
		token:undefined,
		tracecall:undefined,
		version:'4.3.116'
	};
	/** Base directory from which all plugins are loaded. **/
	public var basedir:String = "http://plugins.longtailvideo.com/";
	/** Reference to all stage graphics. **/
	public var skin:MovieClip;
	/** Reference to the View of the MVC cycle, which defines all API calls. **/
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
		visible = false;
		skin = this['player'];
		addEventListener(Event.ADDED_TO_STAGE,loadConfig);
	};


	/** When added to stage, the player loads configuration settings. **/
	protected function loadConfig(evt:Event=null):void { 
		configger = new Configger(this);
		configger.addEventListener(Event.COMPLETE,loadSkin);
		configger.load(config);
	};


	/** When config is loaded, the player laods the skin. **/
	protected function loadSkin(evt:Event=null):void {
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
		loadPlugins();
	};


	/** MVC inited; now init built-in plugins and load external ones. **/
	protected function loadPlugins():void {
		sploader.addPlugin(new Display(),'display');
		sploader.addPlugin(new Rightclick(),'rightclick');
		sploader.addPlugin(new Controlbar(),'controlbar');
		sploader.addPlugin(new Playlist(),'playlist');
		sploader.addEventListener(SPLoaderEvent.PLUGINS,startPlayer);
		sploader.loadPlugins();
	};


	/**
	* Everything is now ready. The Player is redrawn, shown and the file is loaded.
	*
	* The Player broadcasts a READY event here to actionscript.
	* The View will send an asynchroneous PlayerReady event to javascript.
	**/
	protected function startPlayer(evt:SPLoaderEvent=null) {
		view.sendEvent(ViewEvent.REDRAW);
		visible = true;
		dispatchEvent(new PlayerEvent(PlayerEvent.READY));
		if(config['file']) {
			view.sendEvent(ViewEvent.LOAD,config);
		}
	};


}


}
