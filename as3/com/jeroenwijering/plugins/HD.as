/**
* Implement an HD toggle.
* =======================
* 
* An icon is shown to do the toggle, and the value is saved as a cookie.
* This plugin only works for single files. Two flashvars are available:
* 
* - hd.file: the HD file that one can toggle to.
* - hd.state is the state of the HD toggle (true/false).
*   Use it to force HD on or off through flashvars, regardless of a users' HD cookie settings.
*
* This plugin also showcases the addition of controlbar buttons, introduced in 4.3.
* It'll silently fail (no button, no error) for < 4.3 players or nonsupporting skins.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Configger;
import flash.display.MovieClip;
import flash.events.MouseEvent;


public class HD extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	private var config:Object;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** reference to the original file. **/
	private var original:String;


	/** Constructor; nothing going on. **/
	public function HD():void {};


	/** Quality is clicked, so change the video. **/
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
			config = view.getPluginConfig(this);
		} catch(err:Error) {
			config = {
				file:view.config['hd.file'],
				state:view.config['hd.state']
			}
		}
		setButton();
		try {
			view.getPlugin('controlbar').addButton(icon,'hd',clickHandler);
		} catch (err:Error) {
			icon.visible = false;
		}
	};


	/** The first playlistload is caught to save the original videos. **/
	private function playlistHandler(evt:ControllerEvent=undefined):void {
		if(!original) {
			original = view.playlist[0]['file'];
			if(config['state'] == true) { reLoad(); }
		}
	};


	/** Reload the playlist with either the HD or default videos. **/
	private function reLoad():void {
		var ply = view.playlist;
		if(config['state'] == true) {
			ply[0]['file'] = config['file'];
		} else {
			ply[0]['file'] = original;
		}
		view.sendEvent('LOAD',ply);
	};


	/** Set the HD button state. **/
	private function setButton() {
		if(config['state']) {
			icon.alpha = 1;
		} else {
			icon.alpha = 0.3;
		}
	}


}


}