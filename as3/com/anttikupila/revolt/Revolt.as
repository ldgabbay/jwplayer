﻿package com.anttikupila.revolt {import com.anttikupila.soundSpectrum.SoundProcessor;import com.anttikupila.revolt.presets.*;import com.jeroenwijering.events.*;import flash.media.*;import flash.display.*;import flash.net.*;import flash.events.*;import flash.utils.*;import flash.filters.DropShadowFilter;public class Revolt extends Sprite implements PluginInterface {	private var sp:SoundProcessor;	private var gfx:BitmapData;	private var clip:Sprite;	private var presetList:Array;	private var presetInt:Timer;	private var preset:Preset;	private var view:AbstractView;	public var initialize:Function = initializePlugin;	public function Revolt() {		sp = new SoundProcessor();		presetList = new Array(			new LineFourier(), 			new LineNoFourier(), 			new Explosion(), 			new LineSmooth(), 			new LineWorm(), 			new Tunnel()		);		clip = new Sprite();		addChild(clip);		presetInt = new Timer(10000,0);		presetInt.addEventListener(TimerEvent.TIMER,nextPreset);		visible = false;		clip.addEventListener(MouseEvent.CLICK,nextPreset);		clip.buttonMode = true;		clip.mouseChildren = false;	};	public function initializePlugin(vie:AbstractView):void {		view = vie;		resizeHandler();		stateHandler();		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);		view.addModelListener(ModelEvent.STATE,stateHandler);	};	private function compute(ev:Event):void {		var soundArray:Array = sp.getSoundSpectrum(preset.fourier);		preset.applyGfx(gfx,soundArray);	};	private function nextPreset(ev:Event):void {		presetInt.reset();		var idx = Math.floor(Math.random()*presetList.length);		var newPreset:Preset = presetList[idx];		if (newPreset != preset) {			preset = newPreset;			preset.init();			presetInt.start();			trace("EFFECT: "+preset.toString().toLowerCase());		} else {			nextPreset(null);		}	};	private function resizeHandler(evt:ControllerEvent=null) {		if(gfx) { clip.removeChildAt(0); }		gfx = new BitmapData(view.config['width'],view.config['height'],false,0x000000);		var pic:Bitmap = new Bitmap(gfx);		clip.addChild(pic);	};	private function stateHandler(evt:ModelEvent=null) {		removeEventListener(Event.ENTER_FRAME,compute);		switch(view.config['state']) {			case ModelStates.PLAYING:				addEventListener(Event.ENTER_FRAME,compute);				visible = true;				presetInt.start();				nextPreset(null);				break;			default:				presetInt.reset();				visible = false;				break;		}	};}}