/**
* This plugin sends mouse click information to javascript when a user clicks on a playing video.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;
import flash.events.MouseEvent;
import flash.external.ExternalInterface;


public class ClickProxy extends MovieClip implements PluginInterface {


	/** Configuration values of the plugin. **/
	public var config:Object = {
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
		resizeHandler();
	};


	/** Resize the area. **/
	private function resizeHandler(evt:ControllerEvent=null) {
		clip.back.width = view.config['width'];
		clip.back.height = view.config['height'];
	};


	/** Save playback position updates. **/
	private function timeHandler(evt:ModelEvent) { 
		position = evt.data.position;
	};


}


}