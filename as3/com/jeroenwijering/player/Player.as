﻿/**
* Player that crunches through all media formats Flash can read.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.player.*;
import com.jeroenwijering.utils.Configger;
import com.jeroenwijering.utils.Skinner;
import com.jeroenwijering.views.*;
import flash.display.MovieClip;
import flash.events.Event;


public class Player extends MovieClip {


	/** A list with all default configuration values. **/
	private var defaults:Object = {
		author:undefined,
		captions:undefined,
		description:undefined,
		duration:0,
		file:undefined,
		image:undefined,
		link:undefined,
		start:0,
		title:undefined,
		type:undefined,

		controlbar:'bottom',
		controlbarsize:20,
		logo:undefined,
		playlist:'none',
		playlistsize:180,
		skin:undefined,

		autostart:false,
		bufferlength:1,
		displayclick:'play',
		fullscreen:false,
		item:0,
		mute:false,
		quality:true,
		repeat:'none',
		shuffle:false,
		stretching:'uniform',
		volume:80,

		abouttext:undefined,
		aboutlink:"http://www.jeroenwijering.com/?item=JW_FLV_Player",
		linktarget:'_blank',
		plugins:undefined,
		streamscript:undefined,
		tracecall:undefined,

		client:undefined,
		height:280,
		margins:'0,0',
		state:'IDLE',
		version:'4.0.47',
		width:400
	};
	/** Object that loads all configuration variables. **/
	private var configger:Configger;
	/** Object that load the skin and plugins. **/
	private var skinner:Skinner;
	/** Reference to the Controller of the MVC cycle. **/
	private var controller:Controller;
	/** Reference to the model of the MVC cycle. **/
	private var model:Model;
	/** Reference to the View of the MVC cycle. **/
	private var _view:View;
	/** A list with all the active views. **/
	private var views:Array;


	/** Constructor; Loads config parameters.**/
	public function Player() {
		visible = false;
		configger = new Configger(this);
		configger.addEventListener(Event.COMPLETE,configHandler);
		configger.load(defaults);
	};


	/** Config loading completed; now load skin. **/
	private function configHandler(evt:Event) {
		skinner = new Skinner(this);
		skinner.addEventListener(Event.COMPLETE,skinHandler);
		skinner.load(configger.config);
	};


	/** Skin loading completed, now load MVC and plugins. **/
	private function skinHandler(evt:Event) {
		visible = true;
		controller = new Controller(configger.config,skinner.skin);
		model = new Model(configger.config,skinner.skin,controller);
		_view = new View(configger.config,skinner.skin,controller,model);
		views = new Array(
			new ExternalView(_view),
			new RightclickView(_view),
			new DisplayView(_view),
			new ControlbarView(_view),
			new PlaylistView(_view),
			new CaptionsView(_view)
		);
		controller.start(model,_view);
	};


	/** reference to the view, so plugins and listeners can interface. **/
	public function get view():View {
		return _view;
	};


}


}