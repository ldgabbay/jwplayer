/**
* Interface for all display elements.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Draw;
import com.jeroenwijering.utils.Strings;
import flash.display.Loader;
import flash.display.MovieClip;
import flash.display.Sprite;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.geom.ColorTransform;
import flash.net.URLRequest;
import flash.utils.clearTimeout;
import flash.utils.setTimeout;


public class Display implements PluginInterface {


	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** Reference to the display MC. **/
	private var display:MovieClip;
	/** Loader object for loading a logo. **/
	private var loader:Loader;
	/** Configuration vars for this plugin. **/
	private var config:Object;
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
	/** ID for the buffer showing tiomeout. **/
	private var timeout:Number;


	/** Constructor; add all needed listeners. **/
	public function Display():void {};


	/** Initialize the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		config = view.getPluginConfig(this);
		view.addControllerListener(ControllerEvent.ERROR,errorHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addControllerListener(ControllerEvent.PLAYLIST,stateHandler);
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
		if(view.config['screenalpha'] < 1) {
			display.back.alpha = view.config['screenalpha'];
		} else if(view.config['screenalpha'] < 100)  {
			display.back.alpha = Number(view.config['screenalpha'])/100;
		}
		if(view.config['displayclick'] != 'none') {
			display.addEventListener(MouseEvent.CLICK,clickHandler);
			display.buttonMode = true;
			display.mouseChildren = false;
		}
		try {
			if(display.logo.width == 10) { 
				Draw.clear(display.logo); 
				if(view.config['logo']) { setLogo(); }
			} else { 
				logoHandler();
			}
		} catch (err:Error) {}
		stateHandler();
	};


	/** Receive buffer updates. **/
	private function bufferHandler(evt:ModelEvent):void {
		var pct:String = '';
		if(evt.data.percentage > 0) {
			pct = Strings.zero(evt.data.percentage);
		}
		try {
			display.bufferIcon.txt.text = pct;
		} catch (err:Error) {}
	};


	/** Process a click on the display. **/
	private function clickHandler(evt:MouseEvent):void {
		if(view.config['state'] == ModelStates.IDLE) { 
			view.sendEvent('PLAY');
		} else { 
			view.sendEvent(view.config['displayclick']);
		}
	};


	/** Receive and print errors. **/
	private function errorHandler(evt:Object):void {
		if(view.config['icons'] == true) {
			try {
				setIcon('errorIcon');
				display.errorIcon.txt.text = evt.data.message;
			} catch (err:Error) {}
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


	/** Receive resizing requests **/
	private function resizeHandler(evt:ControllerEvent=null):void {
		display.x = config['x'];
		display.y = config['y'];
		if(config['height'] > 0) {
			display.visible = true;
		} else {
			display.visible = false;
		}
		display.back.width  = config['width'];
		display.back.height = config['height'];
		try {
			display.masker.width = config['width'];
			display.masker.height = config['height'];
		} catch (err:Error) {}
		for(var i:String in ICONS) {
			try { 
				display[ICONS[i]].x = Math.round(config['width']/2);
				display[ICONS[i]].y = Math.round(config['height']/2);
			} catch (err:Error) {}
		}
		if(view.config['logo']) {
			logoHandler();
		}
	};


	/** Set a specific icon in the display. **/
	private function setIcon(icn:String=undefined):void {
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


	/** Setup the logo loading. **/
	private function setLogo():void {
		margins = new Array(
			display.logo.x,
			display.logo.y,
			display.back.width-display.logo.x-display.logo.width,
			display.back.height-display.logo.y-display.logo.height
		);
		loader = new Loader();
		loader.contentLoaderInfo.addEventListener(Event.COMPLETE,logoHandler);
		display.logo.addChild(loader);
		loader.load(new URLRequest(view.config['logo']));
	};


	/** Handle a change in playback state. **/
	private function stateHandler(evt:Event=null):void {
		clearTimeout(timeout);
		switch (view.config['state']) {
			case ModelStates.PLAYING:
				setIcon();
				break;
			case ModelStates.BUFFERING:
				if(evt && evt['data']['oldstate'] == ModelStates.PLAYING) {
					setIcon();
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
