/**
* Implements a sharing menu with embed and link codes.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.*;
import flash.events.*;
import flash.text.*;


public class Sharing extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		embed:undefined,
		link:undefined,
		oncomplete:true
	};
	/** Reference to the stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor; nothing going on. **/
	public function Sharing():void {
		clip = this;
	};


	/** Toggle the visibility of the sharing plugin. **/
	private function clickHandler(evt:MouseEvent) {
		clip.visible = !(clip.visible);
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		try {
			view.getPlugin('controlbar').addButton(clip.icon,'hd',clickHandler);
		} catch (err:Error) {
			clip.icon.visible = false;
		}
	};


	/** check the metadata for bandwidth. **/ 
	private function resizeHandler(evt:ControllerEvent):void {
		clip.back.height = view.config['height'];
		clip.back.width = view.config['width'];
	};


};


}