/**
* Implements an HD toggle, accessible through a controlbar button.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Configger;

import flash.display.Sprite;
import flash.events.Event;
import flash.ui.ContextMenuItem;


public class HD implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		state:true
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
	};


	/** HD button is clicked, so change the video. **/
	private function clickHandler(evt:Event=null):void {
		config['state'] = ! config['state'];
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
		try {
			view.getPlugin('controlbar').addButton(icon,'hd',clickHandler);
			context = new ContextMenuItem('Toggle HD quality...');
			view.getPlugin('rightclick').addItem(context,clickHandler);
		} catch (err:Error) {
			view.sendEvent(ViewEvent.TRACE,"HD: version 4.3 of the player is needed to show a button.");
		}
		if(config['state']) {
			original = view.config['file'];
			view.config['file'] = config['file'];
		}
		setUI();
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
	private function setUI() {
		if(config['state']) {
			icon.alpha = 1;
			context.caption = 'HD video is on...';
		} else {
			icon.alpha = 0.3;
			context.caption = 'HD video is off...';
		}
	};


};


}