/**
* Plugin that hot-switches to a livestream.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.NetClient;

import flash.display.*;
import flash.events.*;
import flash.net.*;
import flash.utils.setTimeout;


public class Livestream extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		file:'persconferentie.flv',
		image:undefined,
		interval:30,
		message:'Checking for livestream...',
		streamer:'rtmp://live-in.smpe.eu/az-on-demand'
	};
	/** Reference to the stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the view. **/
	private var view:AbstractView;
	/** Netconnection instance to check availability. **/
	private var connection:NetConnection;
	/** Netstream instance to check availability. **/
	private var stream:NetStream;
	/** URLLoader to connect to Highwinds. **/
	private var loader:URLLoader;


	public function Livestream():void {
		clip = this;
		connection = new NetConnection();
		loader = new URLLoader();
		loader.addEventListener(IOErrorEvent.IO_ERROR,loaderHandler);
		loader.addEventListener(Event.COMPLETE,loaderHandler);
	};


	/** Check the SMIL for availability of the stream. **/
	private function checkSmil():void {
	};


	/** Check the XML for a new application instance. **/
	private function checkStream():void {
		trace('checking');
		connection.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
		connection.client = new NetClient(this);
		connection.connect(config['streamer']);
		clip.visible = true;
		setTimeout(hideIcon,2000);
	};


	/** Hide the icon again after a check. **/
	private function hideIcon():void {
		clip.visible = false;
	}


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		clip.visible = false;
		if(view.config['tags'] == 'LIVESTREAM') {
			view.config['icons'] = false;
			view.config['repeat'] = 'always';
			if(config['file'].indexOf('hwcdn.net') == -1) {
				setTimeout(checkStream,2000);
			} else {
				loader.load(new URLRequest(config['file']));
			}
			view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
			clip.icon.txt.text = config['message'];
		}
	};


	/** Parse a HW SMIL file to retrieve the stream locations. **/
	private function loaderHandler(evt:Event):void {
		var xml:XML = XML(evt.currentTarget.data);
		trace(xml);
		config['streamer'] = xml.children()[0].children()[0].@base.toString();
		config['file'] = xml.children()[1].children()[0].@src.toString(); 
		setTimeout(checkStream,2000);
	};


	/** The livestream is found. After a few secs, we switch to it. **/
	private function loadStream():void {
		view.config['autostart'] = true;
		view.config['repeat'] = 'none';
		view.sendEvent('LOAD',{
			duration:0,
			file:config['file'],
			image:config['image'],
			streamer:config['streamer'],
			type:'rtmp'
		});
		view.addModelListener(ModelEvent.STATE,stateHandler);
	};


	/** Callback for the netclients. **/
	public function onData(dat:Object):void {};


	/** Reset the logo on resize. **/
	private function resizeHandler(evt:ControllerEvent):void { 
		clip.icon.x = config['x'] + config['width']/2;
		clip.icon.y = config['y'] + config['height']/2;
	};


	/** If the livestream is completed, we stop, so the on-demand stream is there. **/
	private function stateHandler(evt:ModelEvent) {
		if(evt.data.newstate == ModelStates.COMPLETED) {
			trace('reloading');
			view.removeModelListener(ModelEvent.STATE,stateHandler);
			view.sendEvent('LOAD',{
				duration:0,
				file:config['file'],
				image:config['image'],
				streamer:config['streamer'],
				type:'rtmp'
			});
		}
	};


	/** Receive NetStream status updates. **/
	private function statusHandler(evt:NetStatusEvent):void {
		trace(evt.info.code);
		switch(evt.info.code) {
			case 'NetConnection.Connect.Success':
				stream = new NetStream(connection);
				stream.addEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				stream.client = new NetClient(this);
				stream.play(config['file']);
				break;
			case 'NetStream.Play.Start':
				trace('stream found');
				stream.removeEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				connection.removeEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				stream.close();
				connection.close();
				setTimeout(loadStream,2000);
				break;
			case 'NetStream.Play.StreamNotFound':
			case 'NetConnection.Connect.Failed':
				stream.removeEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				connection.removeEventListener(NetStatusEvent.NET_STATUS,statusHandler);
				setTimeout(checkStream,config['interval']*1000);
				trace('scheduling retry');
				break;
		}
	};



};


}