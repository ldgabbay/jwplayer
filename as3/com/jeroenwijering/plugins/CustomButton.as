/**
* This plugin demonstrates of the new ViewEvent.BUTTON event.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.Sprite;
import flash.events.MouseEvent;

public class CustomButton extends Sprite implements PluginInterface {

	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** URL for button. **/
	private var button_url:String;
	/** Plugin config. **/
	private var config:Object;

	/** Constructor; nothing going on. **/
	public function CustomButton() {};

	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;

		config = view.getPluginConfig(this);
		button_url = config['icon'];

		/** Load from URL **/
		view.sendEvent(ViewEvent.BUTTON, {icon:button_url,clickhandler:buttonClick,buttonname:'test'});

		/** Create a movie clip as the icon **/
		var mc:Sprite = new Sprite();
		mc.name = 'icon';
		mc.graphics.beginFill(0x000000);
		mc.graphics.lineTo(9, 4.5);
		mc.graphics.lineTo(0, 9);
		mc.graphics.lineTo(0, 0);
		
		view.sendEvent(ViewEvent.BUTTON, {icon:mc,clickhandler:buttonClick,buttonname:'test2'});
	};

	protected function buttonClick(evt:MouseEvent=undefined):void {
		view.sendEvent(ViewEvent.PLAY);
	}

}


}