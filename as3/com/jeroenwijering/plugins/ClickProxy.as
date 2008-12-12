/**
* Clickproxy plugin
* =================
*
* This plugin sends mouse click information to javascript when a user clicks on a playing video.
* Use it to build interactive video applications in javascript.The plugin has one flashvar:
* 
* 1. clickproxy.listener
* This is the javascript function that receives the mouseclick info. Default is "clickListener".
* 
* The function receives an object with the following variables:
* - id (id of the player in the javascript DOM)
* - version (version of the player, e.g. 4.2.90)
* - client (plugin client, e.g. FLASH WIN 9.0.124)
* - position (this is the playback position of the video)
* - mousex (this is the x position of the mouse in the display)
* - mousey (this is the y position of the mouse in the display)
* - state (this is the playbackstate of the video)
*
* Some nice examples from Lars Nyboe Andersen can be found here:
* - http://home5.inet.tele.dk/nyboe/flash/mediaplayer4/clickproxy/clickproxy_mux.html
* - http://home5.inet.tele.dk/nyboe/flash/mediaplayer4/JW_FLV_Media_Player_Piano/
*
* The full source code can be found at http://developer.longtailvideo.com/trac/browser/plugins/clickproxy-1.0
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;
import flash.events.MouseEvent;
import flash.external.ExternalInterface;


public class ClickProxy extends MovieClip implements PluginInterface {


	/** Configuration values of the plugin. **/
	private var config:Object = {
		listener:'clickListener'
	};
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Reference to the graphics. **/
	private var clip:MovieClip;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** Playback position of the video. **/
	private var position:Number;


	/** Constructor; nothing going on. **/
	public function ClickProxy() {};


	/** Start the search. **/
	private function clickHandler(evt:MouseEvent=null) {
		var obj:Object = {
			'client':view.config['client'],
			'id':view.config['id'],
			'version':view.config['version'],
			'position':position,
			'mousex':evt.target.mouseX,
			'mousey':evt.target.mouseY,
			'state':view.config['state']
		};
		if(ExternalInterface.available && view.skin.loaderInfo.url.indexOf('http') == 0) {
			try {
				ExternalInterface.call(config['listener'],obj);
			} catch (err:Error) {}
		}
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.config['icons'] = false;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		clip = this.area;
		clip.addEventListener(MouseEvent.CLICK,clickHandler);
		clip.buttonMode = true;
		clip.mouseChildren = false;
		for(var str:String in config) {
			if(view.config['clickproxy.'+str]) {
				config[str] = view.config['clickproxy.'+str];
			}
		}
	};


	/** Resize the area. **/
	private function resizeHandler(evt:ControllerEvent=undefined) {
		clip.back.width = view.config['width'];
		clip.back.height = view.config['height'];
	};


	/** Save playback position updates. **/
	private function timeHandler(evt:ModelEvent) { 
		position = evt.data.position;
	};


}


}