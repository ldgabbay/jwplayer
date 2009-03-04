/**
* Plugin for playing a closed audiodescription with a video.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.MovieClip;
import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.text.*;


public class Audiodescription extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		file:undefined,
		state:true,
		volume:90
	}
	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** Reference to the icon. **/
	private var icon:MovieClip;
	/** sound object to be instantiated. **/
	private var sound:Sound;
	/** Sound channel object. **/
	private var channel:SoundChannel;


	/** Constructor; not much going on. **/
	public function Audiodescription():void {
		clip = this;
	};


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.ITEM,itemHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		drawButton();
		setState(config['state']);
	};


	/** Check for captions with a new item. **/
	private function itemHandler(evt:ControllerEvent=null):void {
		var aud:String = view.playlist[view.config['item']]['audiodescription.file'];
		if(aud) { 
			config['audio'] = aud; 
		} else if(view.config['audio']) {
			config['file'] = view.config['audio'];
		} else if(view.config['audiodescription.file']) {
			config['file'] = view.config['audiodescription.file'];
		}
		if(config['file']) {
			sound = new Sound(new URLRequest(config['file']));
			channel = sound.play();
			setVolume();
		}
	};


	/** Clicking the  hide button. **/
	private function clickHandler(evt:MouseEvent):void {
		setState(!config['state']);
	};


	/** Set buttons in the controlbar **/
	private function drawButton():void {
		try {
			icon = new MovieClip();
			icon.graphics.beginFill(0x000000);
			icon.graphics.moveTo(1,0);
			icon.graphics.lineTo(1,7);
			icon.graphics.lineTo(3,7);
			icon.graphics.lineTo(3,4);
			icon.graphics.lineTo(4,4);
			icon.graphics.lineTo(4,7);
			icon.graphics.lineTo(6,7);
			icon.graphics.lineTo(6,0);
			icon.graphics.lineTo(3,0);
			icon.graphics.lineTo(3,1);
			icon.graphics.lineTo(4,1);
			icon.graphics.lineTo(4,3);
			icon.graphics.lineTo(3,3);
			icon.graphics.lineTo(3,0);
			icon.graphics.moveTo(7,0);
			icon.graphics.lineTo(7,7);
			icon.graphics.lineTo(11,7);
			icon.graphics.lineTo(11,6);
			icon.graphics.lineTo(12,6);
			icon.graphics.lineTo(12,1);
			icon.graphics.lineTo(11,1);
			icon.graphics.lineTo(11,0);
			icon.graphics.lineTo(9,0);
			icon.graphics.lineTo(9,1);
			icon.graphics.lineTo(10,1);
			icon.graphics.lineTo(10,6);
			icon.graphics.lineTo(9,6);
			icon.graphics.lineTo(9,0);
			icon.graphics.lineTo(7,0);
			icon.graphics.endFill();
			view.getPlugin('controlbar').addButton(icon,'audiodescription',clickHandler);
		} catch (err:Error) {}
	};


	/** Turn the audiodescription on/off. **/
	public function setState(stt:Boolean):void {
		config['state'] = stt;
		var cke:SharedObject = SharedObject.getLocal('com.jeroenwijering','/');
		cke.data['audiodescription.state'] = stt;
		cke.flush();
		setVolume();
		if(stt) {
			icon.alpha = 1;
		} else { 
			icon.alpha = 0.3;
		}
	};


	/** Set the volume level. **/
	private function setVolume():void {
		var trf:SoundTransform = new SoundTransform(config['volume']/100);
		if(!config['state']) { trf.volume = 0; }
		if(channel) { channel.soundTransform = trf; }
	};


	/** The statehandler manages audio pauses. **/
	private function stateHandler(evt:ModelEvent) {
		switch(evt.data.newstate) {
			case ModelStates.PAUSED:
			case ModelStates.COMPLETED:
			case ModelStates.IDLE:
				if(channel) {
					channel.stop();
				}
				break;
			}
	};


	/** Check timing of the player to sync audio if needed. **/
	private function timeHandler(evt:ModelEvent):void {
		var pos:Number = evt.data.position;
		if(channel && view.config['state'] == ModelStates.PLAYING && Math.abs(pos-channel.position/1000) > 0.5) {
			channel.stop();
			channel = sound.play(pos*1000);
			setVolume();
		}
	};


};


}