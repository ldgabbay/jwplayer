package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Logger

import flash.display.MovieClip;
import flash.external.ExternalInterface;
import flash.net.sendToURL;
import flash.net.URLRequest;
import flash.utils.setTimeout;


/**
* Ping Plugin; pings a serverside script whenever a video starts loading.
**/
public class Ping extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		script:undefined
	};
	/** Page referrer. **/
	private var referrer:String;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor; nothing going on. **/
	public function Ping():void {};


	/** Event is catched; ping it to the script. **/
	private function itemHandler(evt:ControllerEvent):void {
		// Nasty timeout to allow the player to retrieve it's DOM ID.
		setTimeout(sendPing,500,'event=item');
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.ITEM,itemHandler);
		if(ExternalInterface.available) {
			referrer = ExternalInterface.call("function(){return window.location.href;}");
		}
	};


	/** Wrap up the url generation and do the ping. **/
	private function sendPing(prm:String):void {
		prm += '&file='+encodeURIComponent(view.playlist[view.config['item']]['file']);
		prm += '&client='+encodeURIComponent(view.config['client']);
		prm += '&id='+encodeURIComponent(view.config['id']);
		prm += '&referrer='+encodeURIComponent(referrer);
		prm += '&version='+view.config['version'];
		prm += '&rand='+Math.random();
		Logger.log(prm,'ping');
		if(config['script']) {
			sendToURL(new URLRequest(config['script']+'?'+prm));
		}
	};


};


}