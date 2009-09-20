package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.*;

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
	public var config:Object = {
		position:'over'
	};
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
		Animations.fade(clip,0,0.1);
	};


	/** Initialize the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addModelListener(ModelEvent.STATE,stateHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		if(configurable) {
			for (var i:String in config) { _config[i] = config[i]; }
		}
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
		clip.alpha = 0;
		clip.visible = false;
	};


	/** Watermark loaded, so position it. **/
	private function loaderHandler(evt:Event):void {
		clip.addChild(loader);
		resizeHandler();
	};


	/** Handle mouse out state **/
	private function outHandler(evt:MouseEvent):void {
		Animations.fade(clip,0,0.2);
	};


	/** Handle mouse over state **/
	private function overHandler(evt:MouseEvent):void {
		clearTimeout(timeout);
		Animations.fade(clip,_config['over'],0.1);
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
		Animations.fade(clip,_config['out'],0.1);
		timeout = setTimeout(hide,_config['timeout']*1000);
	};


}


}