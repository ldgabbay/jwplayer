/**
* Loads external SWF skin and calculates dimensions.
**/


package com.jeroenwijering.utils {


import com.jeroenwijering.utils.Draw;
import flash.display.Loader;
import flash.display.MovieClip;
import flash.events.*;
import flash.net.URLRequest;


public class Skinner extends EventDispatcher {


	/** Reference to the stage graphics. **/
	public var skin:MovieClip;
	/** SWF skin loader reference **/
	private var loader:Loader;
	/** Reference to the player itself. **/
	private var player:MovieClip;
	/** Skinnable elements **/
	private var ELEMENTS:Array = new Array("controlbar","display","playlist");


	/**
	* Constructor.
	*
	* @param skn	The player instance.
	**/
	public function Skinner(ply:MovieClip) {
		player = ply;
	};


	/**
	* Start the loading process.
	*
	* @param cfg	Object that contains all docking parameters.
	**/
	public function load(url:String=undefined) {
		if(url) {
			loader = new Loader();
			loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaderHandler);
			loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
			try {
				loader.load(new URLRequest(url));
			} catch (err:Error) { 
				dispatchEvent(new Event(Event.COMPLETE));
			}
		} else {
			skin = player.root['player'];
			dispatchEvent(new Event(Event.COMPLETE));
		}
	};


	/** SWF loading failed; use default skin. **/
	private function errorHandler(evt:IOErrorEvent) {
		dispatchEvent(new Event(Event.COMPLETE));
	};


	/** SWF loading completed; add to stage and populate. **/
	private function loaderHandler(evt:Event) {
		if(loader.content['player']) {
			skin = MovieClip(loader.content['player']);
			trace(loader.content['player']);
		} else {
			skin = MovieClip(loader.content);
		}
		Draw.clear(player);
		player.addChild(skin);
		/*
		for(var i=0; i<cnt.numChildren; i++) {
			var ncd = cnt.getChildAt(i);
			var ocd = skin.getChildByName(ncd.name);
			if(ocd) {
				skin.removeChild(ocd);
				skin.addChild(ncd);
				skin[ncd.name] = ncd;
			}
		}
		*/
		dispatchEvent(new Event(Event.COMPLETE));
	};


}


}