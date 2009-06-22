/**
* Manages playback of streaming video from the HighWinds CDN.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.RTMPModel;
import com.jeroenwijering.player.Model;

import flash.events.*;
import flash.net.*;


public class HighwindsModel extends RTMPModel {


	/** Loader instance that loads the XML file. **/
	private var loader:URLLoader;
	/** Save the old location of the file, so we can overwrite it on stop. **/
	private var smil:String;


	/** Constructor. **/
	public function HighwindsModel(mod:Model):void {
		super(mod);
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE, loaderHandler);
		loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		loader.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
	};


	/** Override the load function with one that first parses the SMIL file. **/
	override public function load(itm:Object):void {
		item = itm;
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
		if(item['file'].substr(-5) == '.smil') { 
			smil = item['file'];
		} else {
			smil = item['file']+'.smil';
		}
		loader.load(new URLRequest(smil));
	};


	/** Get the streamer / file from the HW XML. **/
	private function loaderHandler(evt:Event) {
		var xml:XML = XML(evt.currentTarget.data);
		item['streamer'] = xml.children()[0].children()[0].@base.toString();
		item['file'] = xml.children()[1].children()[0].@src.toString();
		model.mediaHandler(video);
		connection.connect(item['streamer']);
	};


	/** Return the file reference to the SMIL location. **/
	override public function stop():void {
		super.stop();
		if(smil) { 
			item['file'] = smil;
		}
	};


};


}