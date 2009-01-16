/**
* Implements an HD toggle, accessible through a controlbar button.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Configger;
import flash.display.MovieClip;
import flash.events.MouseEvent;


public class HD extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** reference to the original file. **/
	private var original:String;


	/** Constructor; nothing going on. **/
	public function HD():void {};


	/** HD button is clicked, so change the video. **/
	private function clickHandler(evt:MouseEvent=null):void {
		if(config['state']) {
			config['state'] = false;
		} else { 
			config['state'] = true;
		}
		view.config['autostart'] = true;
		reLoad();
		setButton();
		try { 
			Configger.saveCookie('hd.state',config['state']);
		} catch (err:Error) {}
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.PLAYLIST,playlistHandler);
		try {
			view.getPlugin('controlbar').addButton(icon,'hd',clickHandler);
		} catch (err:Error) {
			icon.visible = false;
		}
		if(config['state'] == true) {
			original = view.config['file'];
			view.config['file'] = config['file'];
		}
		setButton();
	};


	/** The first playlistload is caught to save the original videos. **/
	private function playlistHandler(evt:ControllerEvent=undefined):void {
		if(!original) {
			original = view.playlist[0]['file'];
			if(config['state'] == true) { reLoad(); }
		}
	};


	/** Reload the playlist with either the HD or default video. **/
	private function reLoad():void {
		var fil:String;
		var ply:Array = view.playlist;
		if(config['state'] == true) {
			fil = config['file'];
		} else {
			fil = original;
		}
		if(ply.length == 1) { 
			ply[0]['file'] = fil;
			view.sendEvent('LOAD',ply);
		} else { 
			view.sendEvent('LOAD',fil);
		}
	};


	/** Set the HD button state. **/
	private function setButton() {
		if(config['state']) {
			icon.alpha = 1;
		} else {
			icon.alpha = 0.3;
		}
	};


}


}