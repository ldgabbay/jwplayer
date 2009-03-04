/**
* Implement a rightclick menu with "fullscreen", "stretching" and "about" options.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.events.ContextMenuEvent;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.ui.ContextMenu;
import flash.ui.ContextMenuItem;


public class Rightclick implements PluginInterface {


	/** Plugin configuration object. **/
	public var config:Object = {};
	/** Reference to the contextmenu. **/
	private var context:ContextMenu;
	/** Reference to the 'about' menuitem. **/
	private var about:ContextMenuItem;
	/** Reference to the fullscreen menuitem. **/
	private var fullscreen:ContextMenuItem;
	/** Reference to the stretchmode menuitem. **/
	private var stretching:ContextMenuItem;
	/** Reference to the MVC view. **/
	private var view:AbstractView;


	/** Constructor. **/
	public function Rightclick():void {
		context = new ContextMenu();
		context.hideBuiltInItems();
	};


	/**
	* Add an item to the contextmenu.
	*
	* @param itm	An initialized ContextMenuItem
	* @param fcn	The function to call when the menuitem is clicked.
	**/
	public function addItem(itm:ContextMenuItem,fcn:Function):void {
		itm.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT,fcn);
		itm.separatorBefore = true;
		context.customItems.push(itm);
	};


	/** Initialize the communication with the player. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.skin.contextMenu = context;
		try {
			if(view.skin.stage['displayState']) {
				fullscreen = new ContextMenuItem('Toggle fullscreen...');
				addItem(fullscreen,fullscreenHandler);
			}
		} catch (err:Error) {}
		stretching = new ContextMenuItem('Stretching is '+view.config['stretching']+'...');
		addItem(stretching,stretchHandler);
		if(view.config['abouttext']) {
			about = new ContextMenuItem(view.config['abouttext']+'...');
		} else {
			about = new ContextMenuItem('About JW Player '+view.config['version']+'...');
		}
		addItem(about,aboutHandler);
	};


	/** jump to the about page. **/
	private function aboutHandler(evt:ContextMenuEvent):void {
		navigateToURL(new URLRequest(view.config['aboutlink']),'_blank');
	};


	/** Toggle the fullscreen mode. **/
	private function fullscreenHandler(evt:ContextMenuEvent):void { 
		view.sendEvent(ViewEvent.FULLSCREEN);
	};


	/** Change the stretchmode. **/
	private function stretchHandler(evt:ContextMenuEvent):void {
		var arr:Array = new Array('uniform','fill','exactfit','none');
		for (var idx:Number = 0; idx<arr.length; idx++) {
			if(arr[idx] == view.config['stretching']) {
				break;
			}
		}
		idx == arr.length-1 ? idx = 0: idx++;
		view.config['stretching'] = arr[idx];
		stretching.caption = 'Stretching is '+view.config['stretching']+'...';
		view.sendEvent(ViewEvent.REDRAW);
	};


}


}