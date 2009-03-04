/**
* This plugin renders some cool visualizations in the display, great for audio playback.
* All visualization code is developed by Antti Kupila (www.anttikupila.com).
**/

package com.jeroenwijering.plugins {


import com.anttikupila.revolt.presets.*;
import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Randomizer;

import flash.media.*;
import flash.display.*;
import flash.net.*;
import flash.events.*;
import flash.utils.*;


public class Revolt extends MovieClip implements PluginInterface {


	/** Configuration data of the plugin. **/
	public var config:Object = {
		gain:1,
		simple:false,
		sound:false,
		timeout:10
	};
	/** Clip in which the visuals are shown. **/
	public var clip:MovieClip;
	/** Clip in which the visuals are shown. **/
	private var visuals:Sprite;
	/** List of visualization presets. **/
	private var presets:Array;
	/** Randomizer for the preset. **/
	private var randomizer:Randomizer;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Matrix in which the bitmapdata is loaded. **/
	private var bitmap:BitmapData;
	/** Bytearray in which the bitmapdata is loaded. **/
	private var array:ByteArray;
	/** ID for the timeout between preset switches. **/
	private var timeout:Number;
	/** Currently active preset. **/
	private var current:Preset;


	/** Setup all presets and the click. **/
	public function Revolt() {
		clip = this;
		presets = new Array(
			new LineFourier(),
			new Explosion(),
			new LineSmooth(),
			new LineWorm(),
			new Tunnel()
		);
		randomizer = new Randomizer(presets.length);
	};


	/** Connect the plugin to the player and setup the bitmap. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		if(config['width']) {
			bitmap = new BitmapData(config['width'],config['height'],false,0x000000);
		} else {
			bitmap = new BitmapData(view.config['width'],view.config['height'],false,0x000000);
		}
		array = new ByteArray();
		visuals = new Sprite();
		clip.addChild(visuals);
		visuals.addEventListener(MouseEvent.CLICK,clickHandler);
		visuals.buttonMode = true;
		visuals.mouseChildren = false;
		var pic:Bitmap = new Bitmap(bitmap);
		pic.smoothing = true;
		visuals.addChild(pic);
		if(config['simple'] == true) { 
			current = new LineNoFourier(view.config['lightcolor']);
		} else {
			next();
		}
		resizeHandler();
	};


	/** When clicking, send an event for the simple setting, or switch visualizers. **/
	private function clickHandler(evt:MouseEvent):void {
		view.sendEvent(view.config['displayclick']);
	}


	/** Compute a new soundspectrum bitmap. **/
	private function compute(ev:Event):void {
		SoundMixer.computeSpectrum(array,current.fourier,0);
		var soundArray:Array = new Array();
		for (var i:uint = 0; i < 512; i++) {
			soundArray.push(array.readFloat()*config['gain']);
		}
		current.applyGfx(bitmap,soundArray);
	};


	/** Flip to the next preset. **/
	private function next(evt:Event=null):void {
		clearTimeout(timeout);
		if(config['simple'] != true) {
			current = presets[randomizer.pick()];
			view.sendEvent('TRACE'," REVOLT: "+current.toString() + ' preset');
			timeout = setTimeout(next,config['timeout']*1000);
		}
	};


	/** Resize the visualizer to the display. **/
	private function resizeHandler(evt:ControllerEvent=null) {
		if(config['width']) {
			clip.x = config['x'];
			clip.y = config['y'];
			clip.width = config['width'];
			clip.height = config['height'];
		} else {
			clip.width = view.config['width'];
			clip.height = view.config['height'];
		}
	};


	/** Only show the visualizer when content is playing. **/
	private function stateHandler(evt:ModelEvent=null) {
		removeEventListener(Event.ENTER_FRAME,compute);
		clearTimeout(timeout);
		switch(view.config['state']) {
			case ModelStates.PAUSED:
			case ModelStates.PLAYING:
				var typ = view.playlist[view.config['item']]['type'];
				if(config['sound'] != true || typ != 'sound') {
					addEventListener(Event.ENTER_FRAME,compute);
					if(config['simple'] != true) {
						timeout = setTimeout(next,config['timeout']*1000);
					}
				}
				break;
		}
	};


}


}