/**
* Loads external SWF skins and plugins.
**/


package com.jeroenwijering.player {


import com.jeroenwijering.events.SPLoaderEvent;
import com.jeroenwijering.utils.Draw;
import com.jeroenwijering.utils.Strings;

import flash.display.Loader;
import flash.display.MovieClip;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.IOErrorEvent;
import flash.net.URLRequest;
import flash.system.*;


public class SPLoader extends EventDispatcher {


	/** Reference to the player itself. **/
	private var player:MovieClip;
	/** SWF loader reference **/
	private var loader:Loader;
	/** Number of plugns that are done loading. **/
	private var done:Number;
	/** Reference to all the plugin objects. **/
	private var plugins:Array;


	/** Constructor, references player and gets plugin basedir. **/
	public function SPLoader(ply:MovieClip):void {
		player = ply;
		plugins = new Array();
	};


	/** Add an already inited plugin to the list. **/
	public function addPlugin(pgi:Object,nam:String) {
		var obj:Object = {reference:pgi,name:nam,position:'over',size:50};
		// hack for the playlist/controlbar flashvars
		if(nam == 'controlbar') {
			obj['position'] = player.config['controlbar'];
			obj['size'] = player.skin.controlbar.height;
			obj['margin'] = player.skin.controlbar.x;
		} else if (nam == 'playlist') {
			obj['position'] = player.config['playlist'];
			obj['size'] = player.config['playlistsize'];
		}
		for(var str:String in player.config) {
			if(player.config[nam+'.'+str]) {
				obj[str] = player.config[nam+'.'+str];
			}
		}
		plugins.push(obj);
		pgi.initializePlugin(player.view);
	};


	/** Get a reference to a specific plugin. **/
	public function getPlugin(nam:String):Object {
		for(var i:Number=0; i<plugins.length; i++) { 
			if(plugins[i]['name'] == nam) { 
				return plugins[i]['reference'];
			}
		}
		return null;
	};


	/** Return the configuration data of a specific plugin. **/
	public function getPluginConfig(plg:Object):Object {
		for(var i:Number=0; i<plugins.length; i++) {
			if(plugins[i]['reference'] == plg) {
				return plugins[i];
			}
		}
		return null;
	};


	/** Load a single plugin into the stack (after initialization). **/
	public function loadPlugin(url:String,str:String=null) {
		if(str != null && str != '') {
			var ar1:Array = str.split('&');
			for(var i:String in ar1) {
				var ar2:Array = ar1[i].split('=');
				player.config[ar2[0]] = Strings.serialize(ar2[1]); }
		}
		loadSWF(url,false);
	};


	/** Start loading the SWF plugins, or broadcast if there's none. **/
	public function loadPlugins():void {
		if(player.config['plugins']) {
			var arr:Array = player.config['plugins'].split(',');
			done = arr.length;
			for(var i:Number=0; i<arr.length; i++) {
				loadSWF(arr[i],false);
			}
		} else {
			dispatchEvent(new SPLoaderEvent(SPLoaderEvent.PLUGINS));
		}
	};


	/** Start loading the skin, or broadcast if there's none. **/
	public function loadSkin():void {
		if(player.config['skin']) {
			loadSWF(player.config['skin'],true);
		} else {
			dispatchEvent(new SPLoaderEvent(SPLoaderEvent.SKIN));
		}
	};


	/** Load a particular SWF file. **/
	private function loadSWF(str:String,skn:Boolean):void {
		if(str.substr(-4) == '.swf') { str = str.substr(0, str.length-4); }
		var ldr:Loader = new Loader();
		if(skn) {
			ldr.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,skinError);
			ldr.contentLoaderInfo.addEventListener(Event.COMPLETE,skinHandler);
		} else {
			ldr.visible = false;
			player.skin.addChild(ldr);
			ldr.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,pluginError);
			ldr.contentLoaderInfo.addEventListener(Event.COMPLETE,pluginHandler);
		}
		str += '.swf';
		if(player.loaderInfo.url.indexOf('http') == 0) {
			var ctx:LoaderContext = new LoaderContext(true,ApplicationDomain.currentDomain,SecurityDomain.currentDomain);
			if(skn) {
				ldr.load(new URLRequest(str),ctx);
			} else {
				ldr.load(new URLRequest(player.basedir+str),ctx);
			}
		} else {
			ldr.load(new URLRequest(str));
		}
	};


	/** Plugin loading failed. **/
	private function pluginError(evt:IOErrorEvent):void {
		player.view.sendEvent('TRACE',' plugin: '+evt.text);
		done--;
		if(done == 0) {
			dispatchEvent(new SPLoaderEvent(SPLoaderEvent.PLUGINS));
		}
	};


	/** Plugin loading completed; add to stage and populate. **/
	private function pluginHandler(evt:Event):void {
		try {
			var idx:Number = evt.target.url.lastIndexOf('/');
			var nam:String = evt.target.url.substr(idx+1,evt.target.url.indexOf('.swf.')-3);
			addPlugin(evt.target.content,nam);
			evt.target.loader.visible = true;
		} catch(err:Error) { 
			player.view.sendEvent('TRACE',' plugin: '+err.message);
		}
		done--;
		if(done == 0) {
			dispatchEvent(new SPLoaderEvent(SPLoaderEvent.PLUGINS));
		}
	};


	/** Layout all plugins for a normal resize. **/
	public function layoutNormal():void {
		var bounds:Object = {x:0,y:0,width:player.config['width'],height:player.config['height']};
		var overs:Array = new Array();
		for(var i:Number = plugins.length-1; i>=0; i--) {
			switch(plugins[i]['position']) {
				case "left":
					plugins[i]['x'] = bounds.x;
					plugins[i]['y'] = bounds.y;
					plugins[i]['width'] = plugins[i]['size'];
					plugins[i]['height'] = bounds.height;
					plugins[i]['visible'] = true;
					bounds.x += plugins[i]['size'];
					bounds.width -= plugins[i]['size'];
					break;
				case "top":
					plugins[i]['x'] = bounds.x;
					plugins[i]['y'] = bounds.y;
					plugins[i]['width'] = bounds.width;
					plugins[i]['height'] = plugins[i]['size'];
					plugins[i]['visible'] = true;
					bounds.y += plugins[i]['size'];
					bounds.height -= plugins[i]['size'];
					break;
				case "right":
					plugins[i]['x'] = bounds.x + bounds.width - plugins[i]['size'];
					plugins[i]['y'] = bounds.y;
					plugins[i]['width'] = plugins[i]['size'];
					plugins[i]['height'] = bounds.height;
					plugins[i]['visible'] = true;
					bounds.width -= plugins[i]['size'];
					break;
				case "bottom":
					plugins[i]['x'] = bounds.x;
					plugins[i]['y'] = bounds.y+bounds.height-plugins[i]['size'];
					plugins[i]['width'] = bounds.width;
					plugins[i]['height'] = plugins[i]['size'];
					plugins[i]['visible'] = true;
					bounds.height -= plugins[i]['size'];
					break;
				case "over":
					overs.push(i);
					break;
				default:
					plugins[i]['visible'] = false;
					break;
			}
		}
		for(var j:Number=0; j<overs.length; j++) {
			plugins[overs[j]]['x'] = bounds.x;
			plugins[overs[j]]['y'] = bounds.y;
			plugins[overs[j]]['width'] = bounds.width;
			plugins[overs[j]]['height'] = bounds.height;
			plugins[overs[j]]['visible'] = true;
		}
		if(player.config['resizing']) {
			player.config['width'] = bounds.width;
			player.config['height'] = bounds.height;
		}
	};


	/** Layout all plugins in case of a fullscreen resize. **/
	public function layoutFullscreen() {
		for(var i:Number=0; i<plugins.length; i++) {
			if (plugins[i]['position'] == 'over' || plugins[i]['name'] == 'controlbar') {
				plugins[i]['x'] = 0;
				plugins[i]['y'] = 0;
				plugins[i]['width'] = player.skin.stage.stageWidth;
				plugins[i]['height'] = player.skin.stage.stageHeight;
				plugins[i]['visible'] = true;
			} else {
				plugins[i]['visible'] = false;
			}
		}
	};


	/** Skin loading failed; use default skin. **/
	private function skinError(evt:IOErrorEvent=null):void {
		dispatchEvent(new SPLoaderEvent(SPLoaderEvent.SKIN));
	};


	/** Skin loading completed; add to stage and populate. **/
	private function skinHandler(evt:Event):void {
		if(evt.target.content['player']) {
			player.skin = MovieClip(evt.target.content['player']);
			Draw.clear(player);
			player.addChild(player.skin);
		}
		dispatchEvent(new SPLoaderEvent(SPLoaderEvent.SKIN));
	};


}


}