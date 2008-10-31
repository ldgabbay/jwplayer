/**
* This plugin adds functionality for taking a snapshot of the current display.
* It can either send an offset time or encoded JPG to a serverside script.
* The serverside script can then process the image and return a URL to it.
* Finally, there's the option to save the image on disk.
*
* Here's an example PHP script to use for serverside saving of the image:
<?php
if(isset ($GLOBALS["HTTP_RAW_POST_DATA"])) {
	$im =  $GLOBALS["HTTP_RAW_POST_DATA"];
	$rn = rand();
	$fp = fopen('/path/to/server/snapshots/'.$rn.'.jpg', 'wb');
	fwrite($fp, $im);
	fclose($fp);
	echo 'http://www.server.com/snapshots/'.$rn.'.jpg';
} else { 
	echo 'result=An error occured.';
}
?>
**/
package com.jeroenwijering.plugins {


import com.adobe.images.JPGEncoder;
import com.jeroenwijering.events.*;
import flash.display.BitmapData;
import flash.display.MovieClip;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.net.*;
import flash.system.Security;
import flash.utils.ByteArray;


public class Snapshot extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	private var config:Object = {
		encode:true,
		quality:90,
		script:undefined,
		saving:false
	};
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Reference to the graphics. **/
	private var clip:MovieClip;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** The current position inside the video. **/
	private var position:Number;
	/** Status of the snapshot plugin (idle,wait,save). **/
	private var status:String;
	/** The bitmap object to use for storing the snapshot contents. **/ 
	private var bitmap:BitmapData;
	/** Instance of the JPGEncoder that will encode the snapshot. **/
	private var encoder:JPGEncoder;


	/** Constructor; set security directive for the download dialog. **/
	public function Snapshot() {
		Security.allowDomain("*");
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.skin['snapshot'] ? clip = view.skin['snapshot']: clip = this['snapshot'];
		for(var str:String in config) {
			if(view.config['snapshot.'+str]) {
				config[str] = view.config['snapshot.'+str];
			}
		}
		if(config['encode']) {
			encoder = new JPGEncoder(config['quality']);
			view.addModelListener(ModelEvent.META,metaHandler);
		}
		clip.snap.buttonMode = clip.save.buttonMode = true;
		clip.snap.mouseChildren = clip.save.mouseChildren = false;
		clip.snap.addEventListener(MouseEvent.CLICK,snapHandler);
		clip.save.addEventListener(MouseEvent.CLICK,saveHandler);
		resizeHandler();
		statusHandler('IDLE');
		position = 0;
	};


	/** The URL is loaded, so let's examine it. **/
	private function loaderHandler(evt:Event) {
		view.sendEvent(ViewEvent.LOAD,{image:String(evt.target.data),file:view.config['file']});
		if(config['saving'] == true) { 
			statusHandler('SAVE');
		} else { 
			statusHandler('IDLE');
		}
	};


	/** When metadata is received, build a new bitmap object with the right dimensions. **/
	private function metaHandler(evt:ModelEvent) {
		if(evt.data.width && evt.data.height) {
			bitmap = new BitmapData(evt.data.width,evt.data.height);
		}
	};


	/** Handle a resize of the display. **/
	private function resizeHandler(evt:ControllerEvent=undefined) {
		clip.back.width = view.config['width'];
		clip.back.height = view.config['height'];
		clip.save.x = clip.snap.x = clip.wait.x = Math.round(view.config['width']/2);
		clip.save.y = clip.snap.y = clip.wait.y = Math.round(view.config['height']/2);
	};


	/** Invoked when the save button is pressed; it'll show a 'save' dialog. **/
	private function saveHandler(evt:MouseEvent) {
		var req:URLRequest = new URLRequest(view.playlist[view.config['item']]['image']);
		var ref = new FileReference();
		ref.download(req);
	};


	/** Invoked when the span button is clicked; it'll setup and send the servercall. **/
	private function snapHandler(evt:MouseEvent) {
		statusHandler('WAIT');
		view.sendEvent(ViewEvent.PLAY,'false');
		var req:URLRequest = new URLRequest(config['script']+'?file='+view.playlist[view.config['item']]['file']+'&pos='+position);
		if(bitmap) {
			bitmap.draw(view.skin.display.media);
			var arr:ByteArray = encoder.encode(bitmap);
			req.requestHeaders.push(new URLRequestHeader("Content-type","application/octet-stream"));
			req.method = URLRequestMethod.POST;
			req.data = arr;
			view.sendEvent(ViewEvent.TRACE,'Snapshot: image is '+Math.round(arr.length/1024)+' kilobytes.');
		} else {
			view.sendEvent(ViewEvent.TRACE,'Snapshot: taken at '+position+ 'seconds.');
		}
		var ldr:URLLoader = new URLLoader();
		ldr.addEventListener(Event.COMPLETE,loaderHandler);
		ldr.load(req);
	};


	/** Change the status of the plugin. **/
	private function statusHandler(stt:String) {
		status = stt;
		switch(status) {
			case 'IDLE':
				clip.back.visible = clip.save.visible = clip.wait.visible = false;
				clip.snap.visible = true;
				break;
			case 'WAIT':
				clip.save.visible = clip.snap.visible = false;
				clip.back.visible = clip.wait.visible = true;
				clip.back.gotoAndPlay(0);
				break;
			case 'SAVE':
				clip.back.visible = clip.snap.visible = clip.wait.visible = false;
				clip.save.visible = true;
				break;
		}
	};


	/** Save the current position in the video; needed for a snapshot later on. **/
	private function timeHandler(evt:ModelEvent) {
		position = evt.data.position;
	};



};


}