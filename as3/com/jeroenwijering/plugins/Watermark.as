/**
* Plugin that shows a watermark when buffering.
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
	private var watermarkTimeout:Number = 3000;
	/** Timeout keeping track of fade out  **/
	private var hidingTimeout:uint;
	/** Alpha values for mouse states **/
	private var alphas:Object = {
		over: 1,
		out: 0.5
	};
	/** Set to true when the watermark is visible **/
	private var showing:Boolean = false;


	/** Constructor **/
	public function Watermark() {
		this.alpha = alphas['out'];
		this.buttonMode = true;
		addEventListener(MouseEvent.MOUSE_OVER, mouseOverHandler);
		addEventListener(MouseEvent.MOUSE_OUT, mouseOutHandler);
		addEventListener(MouseEvent.CLICK, clickHandler);
	};


	/** Initialize the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		this.visible = false;
		clip.addChild(this);
		view.addModelListener(ModelEvent.STATE, stateHandler);
		view.addControllerListener(ControllerEvent.RESIZE, resizeHandler);
	};


	/** Load the logo when buffering. **/
	private function stateHandler(evt:ModelEvent):void {
		switch(evt.data.newstate) {
			case ModelStates.BUFFERING:
				clearTimeout(hidingTimeout);
				showWatermark();
				break;
		}
	};


	private function resizeHandler(evt:ControllerEvent):void {
		config = view.getPluginConfig(this);
		x = config['x'] + 10;
		y = config['height'] - height - 12;
	};


	/** Fade in watermark. **/
	private function showWatermark():void {
		if(!showing) {
			showing = true;
			TransitionManager.start(this,{type:Fade, direction:Transition.IN, duration:0.3, easing:Regular.easeIn});
		}
		hidingTimeout = setTimeout(hideWatermark, watermarkTimeout);
		clip.mouseEnabled = true;
	};


	/** Fade out watermark. **/
	private function hideWatermark():void {
		showing = false;
		clip.mouseEnabled = false;
		TransitionManager.start(this, {type:Fade, direction:Transition.OUT, duration:0.3, easing:Regular.easeIn});
	};


	/** Handle mouse over state **/
	private function mouseOverHandler(evt:MouseEvent):void {
		this.alpha = alphas['over'];
	};


	/** Handle mouse out state **/
	private function mouseOutHandler(evt:MouseEvent):void {
		this.alpha = alphas['out'];
	};


	/** Handle Mouse Click **/
	private function clickHandler(evt:MouseEvent):void {
		view.sendEvent(ViewEvent.PLAY,false);
		navigateToURL(new URLRequest(view.config['aboutlink']));
	};


}


}
