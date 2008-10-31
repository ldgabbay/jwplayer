/**
* This plugin sends realtime sound spectrum information to javascript.
* Use it to build equalizer / visualizer applications in javascript that react on the player.
* The plugin has three flashvars:
* 
* 1. soundproxy.bands
* This is the number of frequency bands the proxy sends to javascript. Default is 1 (only one band).
* This corresponds to the number of entries in the 'bands' array in the object sent to the listener.
* 
* 2. soundproxy.interval
* This is the resolution in milliseconds with which the sounddata is sent to javascript. Default is 50 (twenty times/second).
*
* 3. soundproxy.listener
* This is the javascript function that receives the sounddata info. Default is "soundListener".
* The function receives an object with the following variables:
* - id (id of the player in the javascript DOM)
* - version (version of the player, e.g. 4.2.90)
* - client (plugin client, e.g. FLASH WIN 9.0.124
* - bands (this is an array with values from -1 to 1, corresponding to the amplitude of the frequency bands)
*
* = CAUTION =
* When playing a video from another domain than the player.swf, a security exception 
* prevents the plugin from parsing the soundfrequency data. Always place player + video at the same domain.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;
import flash.external.ExternalInterface;
import flash.media.SoundMixer;
import flash.utils.ByteArray;
import flash.utils.clearInterval;
import flash.utils.setInterval;


public class SoundProxy extends MovieClip implements PluginInterface {


	/** initialize call for 4.0 backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Configuration values of the plugin. **/
	private var config:Object = {
		bands:1,
		interval:50,
		listener:'soundListener'
	};
	/** ID of the sample sending interval. **/
	private var interval:Number;



	/** Constructor; nothing going on. **/
	public function SoundProxy() {};


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
		for(var str:String in config) {
			if(view.config['soundproxy.'+str]) {
				config[str] = view.config['soundproxy.'+str];
			}
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