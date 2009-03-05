/** 
* This plugin sends realtime sound spectrum information to javascript.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.MovieClip;
import flash.external.ExternalInterface;
import flash.media.SoundMixer;
import flash.utils.*;


public class SoundProxy extends MovieClip implements PluginInterface {


	/** Configuration values of the plugin. **/
	public var config:Object = {
		bands:1,
		interval:1000,
		listener:'soundListener'
	};
	/** Reference to the stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** ID of the sample sending interval. **/
	private var interval:Number;


	/** Constructor; nothing going on. **/
	public function SoundProxy() {
		clip = this;
	};


	/** Get an array with frequencyband-amplitudes. **/
	private function calculateBands():Array {
		var arr:Array = new Array();
		var bts:ByteArray = new ByteArray();
		var wid:Number = 512/config['bands'];
		var sum:Number = 0;
		// the 10 in this call corresponds to ~43hz. An 11 would be ~22hz and a 9 ~86hz.
		SoundMixer.computeSpectrum(bts,true,10);
		for (var i:Number=1; i<513; i++) {
			sum += bts.readFloat();
			if(Math.floor(i%wid) == 0 || i == 512) {
				arr.push(sum/wid);
				sum = 0;
			}
		}
		return arr;
	};


	/** This call is invoked by the player. It loads the flashvars and sets the listener.**/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addModelListener(ModelEvent.STATE,stateHandler);
		if(view.config['soundproxy.listener']) {
			config['listener'] = view.config['soundproxy.listener'];
		}
	};


	/** Calculates the sounddata and sends it to the javascript listener. **/
	private function sendSample() {
		var obj:Object = {
			'client':view.config['client'],
			'id':view.config['id'],
			'version':view.config['version']
		};
		obj['bands'] = calculateBands();
		if(ExternalInterface.available && view.skin.loaderInfo.url.indexOf('http') == 0) {
			try {
				ExternalInterface.call(config['listener'],obj);
			} catch (err:Error) {}
		}
	};


	/** Close on video completed. **/
	private function stateHandler(evt:ModelEvent) {
		switch(view.config['state']) {
			case ModelStates.PLAYING:
				interval = setInterval(sendSample,config['interval']);
				break;
			default:
				clearInterval(interval);
				break;
		}
	};


}


}