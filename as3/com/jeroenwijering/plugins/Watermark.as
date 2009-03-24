﻿/**
* Plugin that skins the actual mediafiles, overlay icons and the logo.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.*;

import fl.transitions.*;
import fl.transitions.easing.*;

import flash.display.*;
import flash.utils.*;
import flash.events.*;
import flash.net.*;

public dynamic class Watermark extends MovieClip implements PluginInterface {

	/** Configuration vars for this plugin. **/
	private var config:Object = {};
	/** Reference to the skin MC. **/
	public var clip:MovieClip;
	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** Time to display watermark **/
	private var watermarkTimeout:Number = 5000;
	/** Timeout keeping track of fade out  **/
	private var hidingTimeout:uint;
	/** Alpha values for mouse states **/
	private var alphas:Object = {
		over: 1,
		out: 0.75
	};
	/** URL to redirect to on mouse click **/
	private var clickURL:String = "http://www.longtailvideo.com/players/jw-flv-player/";
	/** Set to true when the watermark is visible **/
	private var showing:Boolean = false;

	/** Constructor **/
	public function Watermark() {
		this.alpha = alphas['out'];
		this.buttonMode = true;
		addEventListener(MouseEvent.MOUSE_OVER, mouseOverHandler);
		addEventListener(MouseEvent.MOUSE_OUT, mouseOutHandler);
		addEventListener(MouseEvent.CLICK, clickHandler);
	}
	
	/** Initialize the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		
		this.visible = false;
		clip.addChild(this);

		view.addModelListener(ModelEvent.STATE, stateHandler);
		view.addControllerListener(ControllerEvent.RESIZE, resizeHandler);
		
	}

	private function stateHandler(evt:ModelEvent):void {
		if(evt.data.newstate == evt.data.oldstate) return;
		
		switch(evt.data.newstate) {
			case ModelStates.BUFFERING:
			case ModelStates.PAUSED:
				clearTimeout(hidingTimeout);
				showWatermark();
				break;
			case ModelStates.PLAYING:
				hidingTimeout = setTimeout(hideWatermark, watermarkTimeout);
				break;
		}
	}
	
	private function resizeHandler(evt:ControllerEvent):void {
		config = view.getPluginConfig(this);
		this.x = config['x'] + 5;
		this.y = config['height'] - this.height - 5;
	}

	/** Fade in watermark. **/
	private function showWatermark():void {
		if(!showing) {
			showing = true;
			TransitionManager.start(this, {type:Fade, direction:Transition.IN, duration:0.3, easing:Regular.easeIn});
		}
	}

	/** Fade out watermark. **/
	private function hideWatermark():void {
		showing = false;
		TransitionManager.start(this, {type:Fade, direction:Transition.OUT, duration:0.3, easing:Regular.easeIn});
	}
	
	/** Handle mouse over state **/
	private function mouseOverHandler(evt:MouseEvent):void {
		this.alpha = alphas['over'];
	}
	
	/** Handle mouse out state **/
	private function mouseOutHandler(evt:MouseEvent):void {
		this.alpha = alphas['out'];
	}
	
	/** Handle Mouse Click **/
	private function clickHandler(evt:MouseEvent):void {
		navigateToURL(new URLRequest(clickURL),"_self");
	}
	
	
}


}
