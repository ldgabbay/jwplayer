/**
* Create a bitmap from a still of a video and send it to a server for processing.
**/
package com.jeroenwijering.plugins {


import com.adobe.images.JPGEncoder;
import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Strings;

import flash.display.*;
import flash.events.*;
import flash.net.*;
import flash.system.*;
import flash.utils.*;


public class Snapshot extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		script:'http://www.jeroenwijering.com/test/snapshot/create.php',
		snapshot:undefined,
		timeout:5000
	};
	/** Reference to the stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** The current position inside the video. **/
	private var position:Number;
	/** Instance of the JPGEncoder that will encode the snapshot. **/
	private var encoder:JPGEncoder;
	/** The bitmap object to use for storing the snapshot contents. **/ 
	private var bitmap:BitmapData;
	/** URLLoader that sends the jpg data and returns the image url. **/
	private var loader:URLLoader;


	/** Constructor; set security directive for the download dialog. **/
	public function Snapshot():void {
		clip = this;
		Security.allowDomain("*");
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.addModelListener(ModelEvent.META,metaHandler);
		clip.button.buttonMode = true;
		clip.button.mouseChildren = false;
		clip.button.addEventListener(MouseEvent.CLICK,clickHandler);
		clip.button.tf.htmlText = "<u>Start the video to select a frame</u>";
	};


	/** When metadata is received, build a new bitmap object with the right dimensions. **/
	private function metaHandler(evt:ModelEvent) {
		if(evt.data.width && evt.data.height) {
			bitmap = new BitmapData(evt.data.width,evt.data.height);
		}
	};


	/** Handle a resize of the display. **/
	private function resizeHandler(evt:ControllerEvent=null) {
		clip.button.x = clip.back.x = config['x'];
		clip.button.y = clip.back.y = config['y'];
		clip.button.area.width = clip.back.width = config['width'];
		clip.button.tf.width = config['width'] - 20;
	};


	/** Invoked when the span button is clicked; it'll setup and send the servercall. **/
	private function clickHandler(evt:MouseEvent) {
		if(view.config['state'] == ModelStates.IDLE) {
			if(config['snapshot']) {
				navigateToURL(new URLRequest(config['snapshot']));
			} else {
				view.sendEvent('PLAY','true');
			}
		} else {
			clip.button.area.visible = false;
			clip.button.tf.htmlText = 'Rendering snapshot, please wait...';
			sendBitmap();
			view.sendEvent('STOP');
			try {
				view.getPlugin('controlbar').block(true);
			} catch (err:Error) {}
		}
	};


	/** Encode and send a bitmap of the video. **/
	private function sendBitmap():void {
		encoder = new JPGEncoder(90);
		var req:URLRequest = new URLRequest(config['script']);
		bitmap.draw(view.skin.display.media);
		var arr:ByteArray = encoder.encode(bitmap);
		req.requestHeaders.push(new URLRequestHeader("Content-type","application/octet-stream"));
		req.method = URLRequestMethod.POST;
		req.data = arr;
		view.sendEvent(ViewEvent.TRACE,'taken a '+Math.round(arr.length/1024)+'kb JPG snapshot.');
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE,timeoutHandler);
		loader.load(req);
	};


	/** Save the current position in the video; needed for a snapshot later on. **/
	private function timeHandler(evt:ModelEvent=null):void {
		position = Math.round(evt.data.position*10)/10;
		if (position > 0) { 
			var pos:String = position.toString();
			if(pos.indexOf('.') == -1) { pos += '.0'; }
			clip.button.tf.htmlText = "<u>Select frame at "+pos+" seconds</u>";
		}
	};


	/** Reload the video after a timeout. **/
	private function timeoutHandler(evt:Event=null):void {
		view.config['image'] = config['snapshot'] = String(loader.data);
		view.sendEvent('LOAD',view.config);
		clip.button.area.visible = true;
		clip.button.tf.htmlText = 'Snapshot ready; <u>click to download</u> or restart the video.';
		view.getPlugin('controlbar').block(false);
	};


};


}