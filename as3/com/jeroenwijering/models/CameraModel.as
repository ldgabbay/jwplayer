/**
* Model that leverages the built-in webcam access of the Flash Player (displaying the output).
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.BasicModel;
import com.jeroenwijering.player.Model;

import flash.media.*;


public class CameraModel extends BasicModel {


	/** Camera object to be instantiated. **/
	private var camera:Camera;
	/** Video object to be instantiated. **/
	private var video:Video;
	/** Microphone object to be instantiated. **/
	private var microphone:Microphone;


	public function CameraModel(mod:Model):void {
		super(mod);
		try {
			camera = Camera.getCamera();
			camera.setMode(320,240,20);
			model.sendEvent(ModelEvent.META,{framerate:20,height:320,width:240});
			microphone = Microphone.getMicrophone();
			video = new Video(320,240);
			video.smoothing = model.config['smoothing'];
		} catch(err:Error) {}
	};


	/** Load the camera into the video **/
	override public function load(itm:Object):void {
		super.load(itm);
		if(camera) {
			model.mediaHandler(video);
			play();
		} else { 
			stop();
			model.sendEvent(ModelEvent.ERROR,{message:'No webcam found on this computer.'});
		}
	};


	/** Pause playback. **/
	override public function pause():void {
		super.pause();
		video.attachCamera(null);
	};


	/** Resume playback **/
	override public function play():void {
		super.play();
		video.attachCamera(camera);
	};


	/** Destroy the videocamera. **/
	override public function stop():void {
		video.attachCamera(null);
		super.stop();
	};


};


}