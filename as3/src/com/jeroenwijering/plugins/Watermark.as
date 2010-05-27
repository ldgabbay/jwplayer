﻿package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.*;

import fl.transitions.*;
import fl.transitions.easing.*;

import flash.display.*;
import flash.utils.*;
import flash.events.*;
import flash.net.*;


/**
* Plugin that shows a watermark when buffering.
**/
public class Watermark extends MovieClip implements PluginInterface {


	/** Reference to the skin MC. **/
	public var clip:MovieClip;
	/** Configuration flashvars pushed by the player. **/
	public var config:Object = {};
	/** Configuration flashvars, not overwritten by the player. **/
	private var _config:Object = {
		file:undefined,
		link:undefined,
		margin:10,
		out:0.5,
		over:1,
		state:false,
		timeout:3
	};
	/** Save whether the plugin is configurable. **/
	private var configurable:Boolean;
	/** Reference to the loader **/
	private var loader:Loader;
	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** Timeout keeping track of fade out  **/
	private var timeout:uint;


	/** Constructor. **/
	public function Watermark(cfg:Boolean=false):void {
		configurable = cfg;
	};


	/** Handle Mouse Click **/
	private function clickHandler(evt:MouseEvent):void {
		view.sendEvent(ViewEvent.PLAY,false);
		var lnk:String = view.config['aboutlink'];
		if(_config['link']) { lnk = _config['link']; }
		navigateToURL(new URLRequest(lnk));
	};


	/** Fade out watermark. **/
	private function hide():void {
		_config['state'] = false;
		clip.mouseEnabled = false;
		TransitionManager.start(clip,{
			type:Fade,
			direction:Transition.OUT,
			duration:0.3,
			easing:Regular.easeIn
		});
	};


	/** Initialize the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addModelListener(ModelEvent.STATE,stateHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		if(configurable) {
			for (var i:String in config) { _config[i] = config[i]; }
		}
		clip.visible = false;
		clip.alpha = _config['out'];
		clip.buttonMode = true;
		clip.addEventListener(MouseEvent.CLICK,clickHandler);
		clip.addEventListener(MouseEvent.MOUSE_OVER,overHandler);
		clip.addEventListener(MouseEvent.MOUSE_OUT,outHandler);
		if(!configurable) {
			clip.addChild(this);
			resizeHandler();
		} else if(_config['file']) {
			loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
			loader.load(new URLRequest(_config['file']));
		}
	};


	/** Watermark loaded, so position it. **/
	private function loaderHandler(evt:Event):void {
		clip.addChild(loader);
		resizeHandler();
	};


	/** Handle mouse out state **/
	private function outHandler(evt:MouseEvent):void {
		clip.alpha = _config['out'];
	};


	/** Handle mouse over state **/
	private function overHandler(evt:MouseEvent):void {
		clip.alpha = _config['over'];
	};


	private function resizeHandler(evt:ControllerEvent=null):void {
		clip.x = config['x'] + _config['margin'];
		clip.y = config['y'] + config['height'] - clip.height - _config['margin'];
	};


	/** Load the logo when buffering. **/
	private function stateHandler(evt:ModelEvent):void {
		switch(evt.data.newstate) {
			case ModelStates.BUFFERING:
				clearTimeout(timeout);
				show();
				break;
		}
	};


	/** Fade in watermark. **/
	private function show():void {
		if(!_config['state']) {
			_config['state'] = true;
			TransitionManager.start(clip,{
				type:Fade,
				direction:Transition.IN,
				duration:0.3,
				easing:Regular.easeIn
			});
			resizeHandler();
		}
		timeout = setTimeout(hide,_config['timeout']*1000);
		clip.mouseEnabled = true;
	};


}


}