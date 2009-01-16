/**
* Plugin that displays the actual mediafiles, overlay icons and the logo.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Draw;
import com.jeroenwijering.utils.Strings;

import flash.display.*;
import flash.events.*;
import flash.geom.ColorTransform;
import flash.net.URLRequest;
import flash.utils.*;


public class Display implements PluginInterface {


	/** Configuration vars for this plugin. **/
	public var config:Object;
	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** Reference to the display MC. **/
	private var display:MovieClip;
	/** Loader object for loading a logo. **/
	private var loader:Loader;
	/** The margins of the logo. **/
	private var margins:Array;
	/** The latest playback state **/
	private var state:String;
	/** A list of all the icons. **/
	private var ICONS:Array = new Array(
		'playIcon',
		'errorIcon',
		'bufferIcon',
		'linkIcon',
		'muteIcon',
		'fullscreenIcon',
		'nextIcon'
	);
	/** Timeout for hiding the buffericon. **/
	private var timeout:Number;


	/** Constructor; add all needed listeners. **/
	public function Display():void {};


	/** Initialize the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.ERROR,errorHandler);
		view.addControllerListener(ControllerEvent.MUTE,stateHandler);
		view.addControllerListener(ControllerEvent.PLAYLIST,stateHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.BUFFER,bufferHandler);
		view.addModelListener(ModelEvent.ERROR,errorHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		display = view.skin['display'];
		display.media.mask = display.masker;
		if(view.config['screencolor']) {
			var clr:ColorTransform = new ColorTransform();
			clr.color = uint('0x'+view.config['screencolor'].substr(-6));
			display.back.transform.colorTransform = clr;
		}
		if(view.config['displayclick'] != 'none') {
			display.addEventListener(MouseEvent.CLICK,clickHandler);
			display.buttonMode = true;
			display.mouseChildren = false;
		}
		if(display.logo) {
			logoSetter();
		}
		stateHandler();
	};


	/** Receive buffer updates. **/
	private function bufferHandler(evt:ModelEvent):void {
		if(evt.data.percentage > 0) {
			Draw.set(display.bufferIcon.txt,'text',Strings.zero(evt.data.percentage));
		} else {
			Draw.set(display.bufferIcon.txt,'text','');
		}
	};


	/** Process a click on the display. **/
	private function clickHandler(evt:MouseEvent):void {
		if(view.config['state'] == ModelStates.IDLE) {
			view.sendEvent('PLAY');
		} else if (view.config['state'] == ModelStates.PLAYING && view.config['mute'] == true) {
			view.sendEvent('MUTE');
		} else {
			view.sendEvent(view.config['displayclick']);
		}
	};


	/** Receive and print errors. **/
	private function errorHandler(evt:Object):void {
		if(view.config['icons'] == true) {
			setIcon('errorIcon');
			Draw.set(display.errorIcon.txt,'text',evt.data.message);
		}
	};


	/** Logo loaded; now position it. **/
	private function logoHandler(evt:Event=null):void {
		if(margins[0] > margins[2]) {
			display.logo.x = display.back.width- margins[2]-display.logo.width;
		} else {
			display.logo.x = margins[0];
		}
		if(margins[1] > margins[3]) {
			display.logo.y = display.back.height- margins[3]-display.logo.height;
		} else {
			display.logo.y = margins[1];
		}
	};


	/** Setup the logo loading. **/
	private function logoSetter():void {
		margins = new Array(
			display.logo.x,
			display.logo.y,
			display.back.width-display.logo.x-display.logo.width,
			display.back.height-display.logo.y-display.logo.height
		);
		if(display.logo.width == 10) {
			Draw.clear(display.logo);
		}
		if(view.config['logo']) {
			Draw.clear(display.logo);
			loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE,logoHandler);
			display.logo.addChild(loader);
			loader.load(new URLRequest(view.config['logo']));
		}
	};



	/** Receive resizing requests **/
	private function resizeHandler(evt:ControllerEvent):void {
		if(config['height'] > 0) {
			display.visible = true;
		} else {
			display.visible = false;
		}
		Draw.pos(display,config['x'],config['y']);
		Draw.size(display.back,config['width'],config['height']);
		Draw.size(display.masker,config['width'],config['height']);
		for(var i:String in ICONS) {
			Draw.pos(display[ICONS[i]],config['width']/2,config['height']/2);
		}
		if(display.logo) { 
			logoHandler();
		}
	};


	/** Set a specific icon in the display. **/
	private function setIcon(icn:String=undefined):void {
		clearTimeout(timeout);
		for(var i:String in ICONS) {
			if(display[ICONS[i]]) { 
				if(icn == ICONS[i] && view.config['icons'] == true) {
					display[ICONS[i]].visible = true;
				} else {
					display[ICONS[i]].visible = false;
				}
			}
		}
	};


	/** Handle a change in playback state. **/
	private function stateHandler(evt:Event=null):void {
		switch (view.config['state']) {
			case ModelStates.PLAYING:
				if(view.config['mute'] == true) {
					setIcon('muteIcon');
				} else {
					setIcon();
				}
				break;
			case ModelStates.BUFFERING:
				if(evt && evt['data'].oldstate == ModelStates.PLAYING) {
					timeout = setTimeout(setIcon,1500,'bufferIcon');
				} else {
					setIcon('bufferIcon');
				}
				break;
			case ModelStates.IDLE:
				if(view.config.displayclick == 'none' || !view.playlist) {
					setIcon();
				} else {
					setIcon('playIcon');
				}
				break;
			default:
				setIcon(view.config.displayclick+'Icon');
				break;
		}
	};


};


}
