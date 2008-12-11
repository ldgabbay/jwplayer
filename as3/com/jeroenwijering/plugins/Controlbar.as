/**
* Display a controlbar with transport buttons and sliders.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.*;

import flash.display.*;
import flash.events.MouseEvent;
import flash.geom.ColorTransform;
import flash.geom.Rectangle;
import flash.net.URLRequest;
import flash.ui.Mouse;
import flash.utils.clearTimeout;
import flash.utils.setTimeout;


public class Controlbar implements PluginInterface {


	/** Reference to the view. **/
	private var view:AbstractView;
	/** Reference to the controlbar **/
	private var bar:MovieClip;
	/** List with configuration settings. **/
	private var config:Object;
	/** A list with all controls. **/
	private var stacker:Stacker;
	/** Timeout for hiding the bar. **/
	private var hiding:Number;
	/** When scrubbing, icon shouldn't be set. **/
	private var scrubber:MovieClip;
	/** Color object for frontcolor. **/
	private var front:ColorTransform;
	/** Color object for lightcolor. **/
	private var light:ColorTransform;
	/** The actions for all controlbar buttons. **/
	private var BUTTONS = {
		playButton:'PLAY',
		pauseButton:'PLAY',
		stopButton:'STOP',
		prevButton:'PREV',
		nextButton:'NEXT',
		linkButton:'LINK',
		fullscreenButton:'FULLSCREEN',
		normalscreenButton:'FULLSCREEN',
		muteButton:'MUTE',
		unmuteButton:'MUTE'
	};
	/** The actions for all sliders **/ 
	private var SLIDERS = {
		timeSlider:'SEEK',
		volumeSlider:'VOLUME'
	}
	/** The button to clone for all custom buttons. **/
	private var clonee:MovieClip;


	/** Constructor. **/
	public function Controlbar():void {};


	/** Initialize from view. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		config = view.getPluginConfig(this);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.LOADED,loadedHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.addControllerListener(ControllerEvent.PLAYLIST,itemHandler);
		view.addControllerListener(ControllerEvent.ITEM,itemHandler);
		view.addControllerListener(ControllerEvent.MUTE,muteHandler);
		view.addControllerListener(ControllerEvent.VOLUME,volumeHandler);
		bar = view.skin['controlbar'];
		stacker = new Stacker(bar);
		setButtons();
		setColors();
		itemHandler();
		muteHandler();
		volumeHandler();
		loadedHandler();
		timeHandler();
		stateHandler();
	};


	/** 
	* Add a new button to the controlbar.
	*
	* @param icn	A graphic to show as icon
	* @param nam	Name of the button
	* @param hdl	The function to call when clicking the button.
	**/
	public function addButton(icn:DisplayObject,nam:String,hdl:Function):void {
		if(bar['linkButton'].back) {
			var btn:MovieClip = Draw.clone(bar['linkButton']);
			btn.name = nam+'Button';
			btn.visible = true;
			bar.addChild(btn);
			var off:Number = Math.round((btn.height-icn.height)/2);
			Draw.clear(btn.icon);
			btn.icon.addChild(icn);
			icn.x = icn.y = 0;
			btn.icon.x = btn.icon.y = off;
			btn.back.width = icn.width+2*off;
			btn.buttonMode = true;
			btn.mouseChildren = false;
			btn.addEventListener(MouseEvent.CLICK,hdl);
			if(front) {
				btn.icon.transform.colorTransform = front;
				btn.addEventListener(MouseEvent.MOUSE_OVER,overHandler);
				btn.addEventListener(MouseEvent.MOUSE_OUT,outHandler);
			}
			stacker.insert(btn,bar['linkButton']);
		}
	};


	/** Handle clicks from all buttons. **/
	private function clickHandler(evt:MouseEvent):void {
		view.sendEvent(BUTTONS[evt.target.name]);
	};


	/** Handle mouse presses on sliders. **/
	private function downHandler(evt:MouseEvent):void {
		scrubber = MovieClip(evt.target);
		var rct:Rectangle = new Rectangle(scrubber.rail.x,scrubber.icon.y,scrubber.rail.width-scrubber.icon.width,0);
		scrubber.icon.startDrag(true,rct);
    	bar.stage.addEventListener(MouseEvent.MOUSE_UP,upHandler);
	};


	/** Fix the timeline display. **/
	private function fixTime():void {
		try {
			var scp:Number = bar.timeSlider.scaleX;
			bar.timeSlider.scaleX = 1;
			bar.timeSlider.icon.x = scp*bar.timeSlider.icon.x;
			bar.timeSlider.mark.x = scp*bar.timeSlider.mark.x;
			bar.timeSlider.mark.width = scp*bar.timeSlider.mark.width;
			bar.timeSlider.rail.width = scp*bar.timeSlider.rail.width;
			bar.timeSlider.done.x = scp*bar.timeSlider.done.x;
			bar.timeSlider.done.width = scp*bar.timeSlider.done.width;
		} catch (err:Error) {}
	};


	/** Hide the controlbar **/
	public function hide(stt:Boolean):void { 
		bar.visible = !stt;
	};


	/** Handle a change in the current item **/
	private function itemHandler(evt:ControllerEvent=null):void {
		try {
			if(view.playlist && view.playlist.length > 1) {
				bar.prevButton.visible = bar.nextButton.visible = true;
			} else {
				bar.prevButton.visible = bar.nextButton.visible = false;
			}
		} catch (err:Error) {}
		try {
			if(view.playlist && view.playlist[view.config['item']]['link']) {
				bar.linkButton.visible = true;
			} else { 
				bar.linkButton.visible = false;
			}
		} catch (err:Error) {}
		timeHandler();
		stacker.rearrange();
		fixTime();
		loadedHandler(new ModelEvent(ModelEvent.LOADED,{loaded:0,total:0}))
	};


	/** Process bytesloaded updates given by the model. **/
	private function loadedHandler(evt:ModelEvent=null):void {
		var pc1:Number = 0;
		if(evt && evt.data.total > 0) {
			pc1 = evt.data.loaded/evt.data.total;
		}
		var pc2:Number = 0;
		if(evt && evt.data.offset) {
			pc2 = evt.data.offset/evt.data.total;
		}
		try {
			var wid:Number = bar.timeSlider.rail.width;
			bar.timeSlider.mark.x = pc2*wid;
			bar.timeSlider.mark.width = pc1*wid;
		} catch (err:Error) {}
	};


	/** Show above controlbar on mousemove. **/
	private function moveHandler(evt:MouseEvent=null):void {
		if(bar.alpha == 0) { Animations.fade(bar,1); }
		clearTimeout(hiding);
		hiding = setTimeout(moveTimeout,1000);
		Mouse.show();
	};


	/** Hide above controlbar again when move has timed out. **/
	private function moveTimeout():void {
		if((bar.mouseY<3 || bar.mouseY>bar.height-5)  && bar.alpha == 1) {
			Animations.fade(bar,0);
			Mouse.hide();
		}
	};


	/** Show a mute icon if playing. **/
	private function muteHandler(evt:ControllerEvent=null):void {
			if(view.config['mute'] == true) {
				try {
					bar.muteButton.visible = false;
					bar.unmuteButton.visible = true;
				} catch (err:Error) {}
				try {
					bar.volumeSlider.mark.visible = false;
					bar.volumeSlider.icon.x = bar.volumeSlider.rail.x;
				} catch (err:Error) {}
			} else {
				try {
					bar.muteButton.visible = true;
					bar.unmuteButton.visible = false;
				} catch (err:Error) {}
				try {
					bar.volumeSlider.mark.visible = true;
					volumeHandler();
				} catch (err:Error) {}
			}
	};


	/** Handle mouseouts from all buttons **/
	private function outHandler(evt:MouseEvent):void {
		if(front && evt.target['icon']) {
			evt.target['icon'].transform.colorTransform = front;
		} else {
			evt.target.gotoAndPlay('out');
		}
	};


	/** Handle clicks from all buttons **/
	private function overHandler(evt:MouseEvent):void {
		if(front && evt.target['icon']) {
			evt.target['icon'].transform.colorTransform = light;
		} else {
			evt.target.gotoAndPlay('over');
		}
	};


	/** Process resizing requests **/
	private function resizeHandler(evt:ControllerEvent=null):void {
		var wid:Number = config['width'];
		bar.x = config['x'];
		bar.y = config['y'];
		bar.visible = config['visible'];
		if(config['position'] == 'over' || view.config['fullscreen'] == true) {
			bar.x = config['margin'];
			bar.y = config['y'] + config['height'] - config['margin'] - config['size'];
			wid = config['width'] - 2*config['margin'];
			bar.back.alpha = 0.75;
		} else if(config['position'] != 'none') {
			bar.back.alpha = 1;
		}
		try { 
			bar.fullscreenButton.visible = false;
			bar.normalscreenButton.visible = false;
			if(bar.stage['displayState']) {
				if(view.config['fullscreen']) {
					bar.fullscreenButton.visible = false;
					bar.normalscreenButton.visible = true;
				} else {
					bar.fullscreenButton.visible = true;
					bar.normalscreenButton.visible = false;
				}
			}
		} catch (err:Error) {}
		stacker.rearrange(wid);
		stateHandler();
		fixTime();
	};


	/** Clickhandler for all buttons. **/
	private function setButtons():void {
		for(var btn:String in BUTTONS) {
			if(bar[btn]) {
				bar[btn].mouseChildren = false;
				bar[btn].buttonMode = true;
				bar[btn].addEventListener(MouseEvent.CLICK, clickHandler);
				bar[btn].addEventListener(MouseEvent.MOUSE_OVER, overHandler);
				bar[btn].addEventListener(MouseEvent.MOUSE_OUT, outHandler);
			}
		}
		for(var sld:String in SLIDERS) {
			if(bar[sld]) {
				bar[sld].mouseChildren = false;
				bar[sld].buttonMode = true;
				bar[sld].addEventListener(MouseEvent.MOUSE_DOWN, downHandler);
				bar[sld].addEventListener(MouseEvent.MOUSE_OVER, overHandler);
				bar[sld].addEventListener(MouseEvent.MOUSE_OUT, outHandler);
			}
		}
	};


	/** Init the colors. **/
	private function setColors():void {
		if(view.config['backcolor'] && bar['playButton'].icon) { 
			var clr:ColorTransform = new ColorTransform();
			clr.color = uint('0x'+view.config['backcolor'].substr(-6));
			bar.back.transform.colorTransform = clr;
		}
		if(view.config['frontcolor']) {
			try {
				front = new ColorTransform();
				front.color = uint('0x'+view.config['frontcolor'].substr(-6));
				for(var btn:String in BUTTONS) {
					if(bar[btn]) {
						bar[btn]['icon'].transform.colorTransform = front;
					}
				}
				for(var sld:String in SLIDERS) {
					if(bar[sld]) {
						bar[sld]['icon'].transform.colorTransform = front;
						bar[sld]['mark'].transform.colorTransform = front;
						bar[sld]['rail'].transform.colorTransform = front;
					}
				}
				bar.elapsedText.textColor = front.color;
				bar.totalText.textColor = front.color;
			} catch (err:Error) {}
		}
		if(view.config['lightcolor']) {
			light = new ColorTransform();
			light.color = uint('0x'+view.config['lightcolor'].substr(-6));
		} else { 
			light = front;
		}
		if(light) {
			try {
				bar['timeSlider']['done'].transform.colorTransform = light;
				bar['volumeSlider']['mark'].transform.colorTransform = light;
			} catch (err:Error) {}
		}
	};


	/** Process state changes **/
	private function stateHandler(evt:ModelEvent=undefined):void {
		clearTimeout(hiding);
		view.skin.removeEventListener(MouseEvent.MOUSE_MOVE,moveHandler);
		try {
			var dps:String = bar.stage['displayState'];
		} catch (err:Error) {}
		switch(view.config['state']) {
			case ModelStates.PLAYING:
			case ModelStates.BUFFERING:
				try {
					bar.playButton.visible = false;
					bar.pauseButton.visible = true;
				} catch (err:Error) {}
				if(view.config['controlbar'] == 'over' || dps == 'fullScreen') {
					hiding = setTimeout(moveTimeout,1000);
					view.skin.addEventListener(MouseEvent.MOUSE_MOVE,moveHandler);
				} else {
					Animations.fade(bar,1);
				}
				break;
			default:
				try {
					bar.playButton.visible = true;
					bar.pauseButton.visible = false;
				} catch (err:Error) {}
				if(view.config['controlbar'] == 'over' || dps == 'fullScreen') {
					Mouse.show();
					Animations.fade(bar,1);
				}
		}
	};


	/** Process time updates given by the model. **/
	private function timeHandler(evt:ModelEvent=null):void {
		var dur:Number = 0;
		var pos:Number = 0;
		if(evt) {
			dur = evt.data.duration;
			pos = evt.data.position;
		} else if(view.playlist) {
			dur = view.playlist[view.config['item']]['duration'];
			pos = view.playlist[view.config['item']]['start'];
		}
		var pct:Number = pos/dur;
		try {
			bar.elapsedText.text = Strings.digits(pos);
			bar.totalText.text = Strings.digits(dur);
		} catch (err:Error) {}
		try {
			var tsl:MovieClip = bar.timeSlider;
			var xps:Number = Math.round(pct*(tsl.rail.width-tsl.icon.width));
			if (dur > 0) {
				bar.timeSlider.icon.visible = true;
				bar.timeSlider.mark.visible = true;
				if(!scrubber) {
					bar.timeSlider.icon.x = xps;
					var dld:Number = bar.timeSlider.mark.x;
					if(xps > dld) {
						bar.timeSlider.done.x = dld;
						bar.timeSlider.done.width = xps-dld;
						bar.timeSlider.done.visible = true;
					} else { 
						bar.timeSlider.done.visible = false;
					}
				}
			} else {
				bar.timeSlider.icon.visible = false;
				bar.timeSlider.mark.visible = false;
				bar.timeSlider.done.visible = false;
			}
		} catch (err:Error) {}
	};


	/** Handle mouse releases on sliders. **/
	private function upHandler(evt:MouseEvent):void {
		var mpl:Number = 0;
    	bar.stage.removeEventListener(MouseEvent.MOUSE_UP,upHandler);
		scrubber.icon.stopDrag();
		if(scrubber.name == 'timeSlider' && view.playlist) {
			mpl = view.playlist[view.config['item']]['duration'];
		} else if(scrubber.name == 'volumeSlider') {
			mpl = 100;
		}
		var pct:Number = (scrubber.icon.x-scrubber.rail.x) / (scrubber.rail.width-scrubber.icon.width) * mpl;
		view.sendEvent(SLIDERS[scrubber.name],Math.round(pct));
		scrubber = undefined;
	};


	/** Reflect the new volume in the controlbar **/
	private function volumeHandler(evt:ControllerEvent=null):void {
		try { 
			var vsl:MovieClip = bar.volumeSlider;
			vsl.mark.width = view.config['volume']*(vsl.rail.width-vsl.icon.width/2)/100;
			vsl.icon.x = vsl.mark.x + view.config['volume']*(vsl.rail.width-vsl.icon.width)/100;
		} catch (err:Error) {}
	};


};


}