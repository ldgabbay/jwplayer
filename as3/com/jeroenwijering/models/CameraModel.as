/**
* Model that leverages the built-in webcam access of the Flash Player (displaying the output).
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.AbstractModel;
import com.jeroenwijering.player.Model;
import com.jeroenwijering.utils.NetClient;

import flash.events.*;
import flash.media.*;
import flash.net.*;
import flash.utils.*;


public class CameraModel extends AbstractModel {


	/** Camera object to be instantiated. **/
	private var camera:Camera;
	/** Video object to be instantiated. **/
	private var video:Video;
	/** NetConnection object for setup of the video stream. **/
	protected var connection:NetConnection;
	/** NetStream instance that handles the stream IO. **/
	protected var stream:NetStream;
	/** Microphone object to be instantiated. **/
	private var microphone:Microphone;
	/** ID for the position interval. **/
	private var interval:Number;


	public function CameraModel(mod:Model):void {
		super(mod);
		try {
			camera = Camera.getCamera();
			camera.setMode(320,240,10);
			microphone = Microphone.getMicrophone();
			video = new Video(320,240);
			video.smoothing = model.config['smoothing'];
		} catch(err:Error) {}
	};


	/** Load the camera into the video **/
	override public function load(itm:Object):void {
		item = itm;
		position = 0;
		if(camera) {
			model.mediaHandler(video);
			model.sendEvent(ModelEvent.META,{framerate:10,height:320,width:240});
			play();
			if(item['streamer']) {
				connection = new NetConnection();
				connection.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				connection.objectEncoding = ObjectEncoding.AMF0;
				connection.client = new NetClient(this);
				connection.connect(item['streamer']);
				camera.setLoopback(true);
			}
		} else { 
			stop();
			model.sendEvent(ModelEvent.ERROR,{message:'No webcam found on this computer.'});
		}
	};


	/** Pause playback. **/
	override public function pause():void {
		video.attachCamera(null);
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};


	/** Resume playback **/
	override public function play():void {
		video.attachCamera(camera);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		interval = setInterval(positionInterval,100);
	};


	/** Interval function that pings the position. **/
	protected function positionInterval():void {
		position = Math.round(position*10+1)/10;
		if(position < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position,duration:item['duration']});
		} else if (item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/** Seek to a certain position in the item. **/
	override public function seek(pos:Number):void {
		clearInterval(interval);
		position = pos;
		play();
	};


	/** Receive NetStream status updates. **/
	protected function statusHandler(evt:NetStatusEvent):void {
		switch (evt.info.code) {
			case 'NetConnection.Connect.Success':
				stream = new NetStream(connection);
				stream.client = new NetClient(this);
				stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				stream.attachCamera(camera);
				stream.publish(item['file'],"record");
				break;
		}
		model.sendEvent(ModelEvent.META,{info:evt.info.code});
	};


	/** Destroy the videocamera. **/
	override public function stop():void {
		video.attachCamera(null);
		if(item['streamer']) {
			stream.close();
			connection.close();
		}
		clearInterval(interval);
		position = 0;
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


};


}