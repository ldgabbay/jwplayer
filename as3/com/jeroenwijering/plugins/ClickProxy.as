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
	/** Reference to the graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Rectangle that serves as hitarea. **/
	private var rectangle:MovieClip;
	/** Playback position of the video. **/
	private var position:Number;


	/** Constructor; nothing going on. **/
	public function ClickProxy() {
		clip = this;
	};


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
		if(ExternalInterface.available && view.clip.loaderInfo.url.indexOf('http') == 0) {
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
		rectangle = new MovieClip();
		rectangle.graphics.beginFill(0x000000,0);
		rectangle.graphics.drawRect(0,0,100,100);
		clip.addChild(rectangle);
		rectangle.addEventListener(MouseEvent.CLICK,clickHandler);
		rectangle.buttonMode = true;
		rectangle.mouseChildren = false;
		resizeHandler();
	};


	/** Resize the area. **/
	private function resizeHandler(evt:ControllerEvent=null) {
		rectangle.width = view.config['width'];
		rectangle.height = view.config['height'];
	};


	/** Save playback position updates. **/
	private function timeHandler(evt:ModelEvent) {
		position = evt.data.position;
	};


}


}