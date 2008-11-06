/**
* Implement an HD toggle. An icon is shown to do the toggle, and the value is saved as a cookie.
*
* Three flashvars are available:
* - hd.file: the HD file that one can toggle to.
* - hd.replace: in case of a playlist, hd.file is of no use. hd.replace sets a replace on the files in the playlist.
*   The replace is delimited by a pipe. An example "/loq/|/hiq/" will replace the "loq" directory with "/hiq".
* - hd.state is the state of the HD toggle (true/false). Use it to force HD on or off through flashvars, regardless 
*   of a users' cookie settings.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Configger;
import flash.display.MovieClip;
import flash.events.MouseEvent;


public class HD extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	private var config:Object = {
		file:undefined,
		replace:undefined,
		state:false
	};
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Reference to the graphics. **/
	private var clip:MovieClip;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** Position in the video (saved for quick toggling when using streamers). **/
	private var position:Number = 0;
	/** reference to the original files. **/
	private var originals:Array;


	/** Constructor; nothing going on. **/
	public function HD():void {};


	/** Quality is clicked, so change the video. **/
	private function clickHandler(evt:MouseEvent=null):void {
		config['state'] = !config['state'];
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
		view.skin['hd'] ? clip = view.skin['hd']: clip = this.hd;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addControllerListener(ControllerEvent.PLAYLIST,playlistHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		for(var str:String in config) {
			if(view.config['hd.'+str]) {
				config[str] = view.config['hd.'+str];
			}
		}
		clip.addEventListener(MouseEvent.CLICK,clickHandler);
		clip.buttonMode = true;
		clip.mouseChildren = false;
		resizeHandler();
		setButton();
		stateHandler();
	};


	/** The first playlistload is caught to save the original videos. **/
	private function playlistHandler(evt:ControllerEvent=undefined):void {
		if(!originals) {
			originals = new Array();
			for(var i:Number=0; i<view.playlist.length; i++) {
				originals.push(view.playlist[i]['file']);
			}
			if(config['state'] == true) {
				reLoad();
			}
		}
	};


	/** Handle a resize. Move the play/buffer icon to the side with a nasty hack. **/
	private function resizeHandler(evt:ControllerEvent=undefined):void {
		clip.x = Math.round(view.config['width']/2-22);
		clip.y = Math.round(view.config['height']/2);
		view.skin.display.playIcon.x = Math.round(view.config['width']/2+22);
		view.skin.display.bufferIcon.x = Math.round(view.config['width']/2+22);
	};


	/** Reload the playlist with either the HD or default videos. **/
	private function reLoad():void {
		var ply = view.playlist;
		for (var i:Number = 0; i<ply.length; i++) {
			if(config['state'] == true) {
				if(config['replace']) {
					var rep:Array = config['replace'].split('|');
					var pos:Number = ply[i]['file'].indexOf(rep[0]);
					ply[i]['file'] = ply[i]['file'].substr(0,pos)+rep[1]+ply[i]['file'].substr(pos+rep[0].length);
				} else {
					ply[i]['file'] = config['file'];
				}
			} else {
				ply[i]['file'] = originals[i];
			}
			if(i == view.config['item']) {
				ply[i]['start'] = position;
			}
		}
		view.sendEvent('LOAD',ply);
	};


	/** Set the HD button state. **/
	private function setButton() {
		if(config['state']) {
			clip.onBtn.visible = true;
			clip.offBtn.visible = false;
		} else {
			clip.onBtn.visible = false;
			clip.offBtn.visible = true;
		}
	}


	/** Hide the button when playing. **/
	private function stateHandler(evt:ModelEvent=null):void {
		switch(view.config['state']) {
			case ModelStates.PLAYING:
				clip.visible = false;
				break;
			default:
				clip.visible = true;
				break;
		}
	};


	/** Save the position (for swift switching). **/
	private function timeHandler(evt:ModelEvent=null):void {
		position = evt.data.position;
	};


}


}