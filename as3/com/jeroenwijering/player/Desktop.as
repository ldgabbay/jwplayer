/**
* Player that crunches through all media formats Flash can read.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.player.*;
import com.jeroenwijering.plugins.*;
import flash.display.MovieClip;
import flash.events.Event;


public class Desktop extends Player {


	/** Initialize and start the desktop player. **/
	public function Desktop():void { super(); };


	/** When added to stage, the player loads the config. **/
	override protected function loadConfig(evt:Event=null):void {
		config['frontcolor'] = 'CCCCCC';
		config['lightcolor'] = '99CC00';
		config['autostart'] = true;
		loadSkin();
	};


	/** MVC inited; now load plugins. **/
	override protected function loadPlugins():void {
		sploader.addPlugin(new Display(),'display');
		sploader.addPlugin(new Rightclick(),'rightclick');
		sploader.addPlugin(new Controlbar(),'controlbar');
		sploader.addPlugin(new Dragdrop(),'dragdrop');
		startPlayer();
	};


}


}