/**
* Implements an HD toggle, accessible through a controlbar button.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Configger;

import flash.display.MovieClip;
import flash.display.Sprite;
import flash.events.Event;
import flash.ui.ContextMenuItem;


public class HD extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		bitrate:1500,
		file:undefined,
		state:undefined
	};
	/** Reference to the clip on stage. **/
	private var icon:Sprite;
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** reference to the original file. **/
	private var original:String;
	/** contextmenu item. **/
	private var context:ContextMenuItem;


	/** Constructor; nothing going on. **/
	public function HD():void {
		icon = drawIcon();
		context = new ContextMenuItem('Toggle HD quality...');
	};


	/** HD button is clicked, so change the video. **/
	private function clickHandler(evt:Event=null):void {
		config['state'] = !config['state'];
		view.config['autostart'] = true;
		reLoad();
		setUI();
		try { 
			Configger.saveCookie('hd.state',config['state']);
		} catch (err:Error) {}
	};


	/** Draw the HD icon. **/
	private function drawIcon():Sprite {
		var icn:Sprite = new Sprite();
		icn.graphics.beginFill(0x000000);
		icn.graphics.moveTo(1,0);
		icn.graphics.lineTo(1,7);
		icn.graphics.lineTo(3,7);
		icn.graphics.lineTo(3,4);
		icn.graphics.lineTo(4,4);
		icn.graphics.lineTo(4,7);
		icn.graphics.lineTo(6,7);
		icn.graphics.lineTo(6,0);
		icn.graphics.lineTo(4,0);
		icn.graphics.lineTo(4,3);
		icn.graphics.lineTo(3,3);
		icn.graphics.lineTo(3,0);
		icn.graphics.lineTo(1,0);
		icn.graphics.moveTo(7,0);
		icn.graphics.lineTo(7,7);
		icn.graphics.lineTo(11,7);
		icn.graphics.lineTo(11,6);
		icn.graphics.lineTo(12,6);
		icn.graphics.lineTo(12,1);
		icn.graphics.lineTo(11,1);
		icn.graphics.lineTo(11,0);
		icn.graphics.lineTo(9,0);
		icn.graphics.lineTo(9,1);
		icn.graphics.lineTo(10,1);
		icn.graphics.lineTo(10,6);
		icn.graphics.lineTo(9,6);
		icn.graphics.lineTo(9,0);
		icn.graphics.lineTo(7,0);
		icn.graphics.endFill();
		return icn;
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		if(!config['file']) {
			return; 
		} else {
			original = view.config['file'];
		}
		try {
			view.getPlugin('controlbar').addButton(icon,'hd',clickHandler);
			view.getPlugin('rightclick').addItem(context,clickHandler);
		} catch (err:Error) {
			view.sendEvent(ViewEvent.TRACE,"HD: version 4.3 of the player is needed to show a button.");
		}
		if(config['state'] != false) {
			view.config['file'] = config['file'];
			if(config['state'] == undefined) {
				view.addModelListener(ModelEvent.META,metaHandler);
			}
		}
		setUI();
	};


	/** Reload the playlist with either the HD or default video. **/
	private function reLoad():void {
		var fil:String;
		if(config['state'] == false) {
			fil = original;
		} else {
			fil = config['file'];
		}
		if(view.playlist.length == 1) {
			view.config['file'] = fil;
			view.sendEvent('LOAD',view.config);
		} else {
			view.sendEvent('LOAD',fil);
		}
	};


	/** check the metadata for bandwidth. **/ 
	private function metaHandler(evt:ModelEvent):void {
		if(evt.data.bitrate) {
			config['bitrate'] = evt.data.bitrate;
		}
		if(evt.data.bandwidth && config['state'] == undefined) {
			config['state'] = true;
			if(evt.data.bandwidth < config['bitrate']) {
				clickHandler();
				view.sendEvent(ViewEvent.TRACE,"HD: Insufficient bandwidth, autoswitching to normal quality.");
			} else { 
				view.sendEvent(ViewEvent.TRACE,"HD: Bandwidth OK, sticking with HD quality.");
			}
		}
	};


	/** Set the HD button state. **/
	private function setUI() {
		if(config['state'] == false) {
			icon.alpha = 0.3;
			context.caption = 'HD quality is off...';
		} else {
			icon.alpha = 1;
			context.caption = 'HD quality is on...';
		}
	};


};


}