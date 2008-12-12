/**
* Revolt plugin
* =============
* 
* This plugin renders some cool visualizations in the display, great for audio playback. It has no flashvars.
* All visualization code is developed by Antti Kupila (www.anttikupila.com).
* 
* The plugin contains 6 presets, and developers with actionscript experience can easily add new presets.
* Source code of the plugin can be found at http://developer.longtailvideo.com/trac/browser/plugins/revolt-1.0
**/

package com.jeroenwijering.plugins {


import com.anttikupila.revolt.presets.*;
import com.jeroenwijering.events.*;

import flash.media.*;
import flash.display.*;
import flash.net.*;
import flash.events.*;
import flash.utils.*;


public class Revolt extends MovieClip implements PluginInterface {


	private var gfx:BitmapData;
	private var clip:Sprite;
	private var presetList:Array;
	private var presetInt:Timer;
	private var preset:Preset;
	private var view:AbstractView;
	private var ba:ByteArray;
	public var initialize:Function;


	/** Setup all presets and the click. **/
	public function Revolt() {
		presetList = new Array(
			new LineFourier(),
			new LineNoFourier(),
			new Explosion(),
			new LineSmooth(),
			new LineWorm(),
			new Tunnel()
		);
		clip = new Sprite();
		ba = new ByteArray();
		initialize = this.initializePlugin;
		addChild(clip);
		presetInt = new Timer(10000,0);
		presetInt.addEventListener(TimerEvent.TIMER,nextPreset);
		clip.addEventListener(MouseEvent.CLICK,nextPreset);
		clip.buttonMode = true;
		clip.mouseChildren = false;
		clip.visible = false;
	};


	/** Connect the plugin to the player and setup the bitmap. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		gfx = new BitmapData(view.config['width'],view.config['height'],false,0x000000);
		var pic:Bitmap = new Bitmap(gfx);
		pic.smoothing = true;
		clip.addChild(pic);
		resizeHandler();
	};


	/** Compute a new soundspectrum bitmap. **/
	private function compute(ev:Event):void {
		SoundMixer.computeSpectrum(ba,preset.fourier,0);
		var soundArray:Array = new Array();
		for (var i:uint = 0; i < 512; i++) {
			soundArray.push(ba.readFloat());
		}
		preset.applyGfx(gfx,soundArray);
	};


	/** Flip to the next preset. **/
	private function nextPreset(evt:Event=null):void {
		presetInt.reset();
		var idx = Math.floor(Math.random()*presetList.length);
		var newPreset:Preset = presetList[idx];
		if (newPreset != preset) {
			preset = newPreset;
			preset.init();
			presetInt.start();
			view.sendEvent('TRACE',"REVOLT: "+preset.toString()+ 'preset');
		} else {
			nextPreset();
		}
	};


	/** Resize the visualizer to the display. **/
	private function resizeHandler(evt:ControllerEvent=null) {
		try { 
			var obj = view.getPluginConfig(this);
			clip.x = obj['x'];
			clip.y = obj['y'];
			clip.width = obj['width'];
			clip.height = obj['height'];
		} catch (err:Error) {
			clip.width = view.config['width'];
			clip.height = view.config['height'];
		}
	};


	/** Only show the visualizer when content is playing. **/
	private function stateHandler(evt:ModelEvent=null) {
		removeEventListener(Event.ENTER_FRAME,compute);
		switch(view.config['state']) {
			case ModelStates.BUFFERING:
			case ModelStates.PAUSED:
			case ModelStates.PLAYING:
				addEventListener(Event.ENTER_FRAME,compute);
				clip.visible = true;
				nextPreset();
				break;
			default:
				presetInt.reset();
				clip.visible = false;
				break;
		}
	};


}


}