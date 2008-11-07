/**
* This plugin fills its area with a randomly generated color.
* It is simply a demonstration of the new view.getPluginConfig function,
* as well as the ability in 4.3 to allow plugins to set their own space.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.MovieClip;

public class RandomColor extends MovieClip implements PluginInterface {

	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** This plugin's color **/
	private var color:uint;

	/** Constructor; nothing going on. **/
	public function RandomColor() {};

	private var config:Object;

	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		color = Math.floor(Math.random()*0xFFFFFF);
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		resizeHandler();
	};

	/** Resize the area. **/
	private function resizeHandler(evt:ControllerEvent=undefined):void {
		config = view.getPluginConfig(this);

		if(config.hasOwnProperty('x')) {
			var dimensions:Object = {x:-1,y:-1,width:-1,height:-1};
			
			dimensions.x = Number(config['x']);
			dimensions.y = Number(config['y']);
			dimensions.width = Number(config['width']);
			dimensions.height = Number(config['height']);
			
			this.graphics.clear();
			this.graphics.beginFill(this.color);
			this.graphics.drawRect(dimensions.x, dimensions.y, dimensions.width, dimensions.height);

		}
	};

}


}