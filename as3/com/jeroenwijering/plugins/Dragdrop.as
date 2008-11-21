/**
* Plugins that handles drag&drop in AIR applications.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.parsers.ObjectParser;
import flash.desktop.Clipboard;
import flash.desktop.ClipboardFormats;
import flash.display.MovieClip;
import flash.events.NativeDragEvent;
import flash.desktop.NativeDragManager;
import flash.filesystem.File;


public class Dragdrop extends MovieClip implements PluginInterface {


	/** Reference to the player view. **/
	private var view:AbstractView;
	/** Reference to the stage graphics **/
	private var clip:MovieClip;


	/** (Empty) constructor. **/
	public function Dragdrop() {};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addControllerListener(ControllerEvent.PLAYLIST,playlistHandler);
		view.skin.addEventListener(NativeDragEvent.NATIVE_DRAG_ENTER,dragHandler);
		view.skin.addEventListener(NativeDragEvent.NATIVE_DRAG_EXIT,exitHandler);
		view.skin.addEventListener(NativeDragEvent.NATIVE_DRAG_DROP,dropHandler);
		clip = view.skin['dragdrop'];
		clip.area.visible = false;
		resizeHandler();
	};


	/** When drapping content in, show the drop areas. **/
	private function dragHandler(evt:NativeDragEvent):void {
		NativeDragManager.acceptDragDrop(view.skin);
		clip.area.visible = true;
	};


	/** When dropping a file, see if it can be read. **/
	private function dropHandler(evt:NativeDragEvent):void {
		var arr:Array = new Array();
		var files:Array = evt.clipboard.getData(ClipboardFormats.FILE_LIST_FORMAT) as Array;
		for(var i:int = 0; i < files.length; ++i) {
			var f:File = File(files[i]);
			arr.push({file:f.url,title:f.name});
		}
		view.sendEvent('LOAD',arr);
	};


	/** Exiting the drag area; hiding the dragitems. **/
	private function exitHandler(evt:NativeDragEvent):void {
		clip.area.visible = false;
	};


	/** Hide the help text on play. **/
	private function playlistHandler(evt:ControllerEvent=undefined) {
		clip.txt.visible = false;
	};


	/** Handle a resize. **/
	private function resizeHandler(evt:ControllerEvent=undefined) {
		clip.txt.x = view.config['width']/2 - 150;
		clip.txt.y = view.config['height']/2 - 30;
		clip.area.width = view.config['width'] - 20;
		clip.area.height = view.config['height'] - 20;
	};


}


}