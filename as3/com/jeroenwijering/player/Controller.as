/**
* Process all input from the views and modifies the model.
**/
package com.jeroenwijering.player {


import com.jeroenwijering.events.*;
import com.jeroenwijering.parsers.*;
import com.jeroenwijering.utils.Configger;
import com.jeroenwijering.utils.Randomizer;

import flash.display.MovieClip;
import flash.events.*;
import flash.geom.Rectangle;
import flash.net.URLLoader;
import flash.net.URLRequest;
import flash.net.navigateToURL;
import flash.system.Capabilities;


public class Controller extends EventDispatcher {


	/** Configuration object **/
	private var config:Object;
	/** Reference to the skin; for stage event subscription. **/
	private var skin:MovieClip;
	/** Playlist of the player. **/
	public var playlist:Array;
	/** Reference to the player's model. **/
	private var model:Model;
	/** Reference to the player's view. **/
	private var view:View;
	/** Object that manages loading of XML playlists. **/
	private var loader:URLLoader;
	/** object that provides randomization. **/
	private var randomizer:Randomizer;

	/** Constructor, set up stage and playlist listeners. **/
	public function Controller(cfg:Object,skn:MovieClip):void {
		config = cfg;
		skin = skn;
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE,loaderHandler);
		loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR,errorHandler);
		loader.addEventListener(IOErrorEvent.IO_ERROR,errorHandler);
	};


	/** Register view and model with controller, start loading playlist. **/
	public function closeMVC(mdl:Model,vie:View):void {
		model= mdl;
		model.addEventListener(ModelEvent.META,metaHandler);
		model.addEventListener(ModelEvent.TIME,metaHandler);
		model.addEventListener(ModelEvent.STATE,stateHandler);
		view = vie;
		view.addEventListener(ViewEvent.FULLSCREEN,fullscreenHandler);
		view.addEventListener(ViewEvent.ITEM,itemHandler);
		view.addEventListener(ViewEvent.LINK,linkHandler);
		view.addEventListener(ViewEvent.LOAD,loadHandler);
		view.addEventListener(ViewEvent.MUTE,muteHandler);
		view.addEventListener(ViewEvent.NEXT,nextHandler);
		view.addEventListener(ViewEvent.PLAY,playHandler);
		view.addEventListener(ViewEvent.PREV,prevHandler);
		view.addEventListener(ViewEvent.QUALITY,qualityHandler);
		view.addEventListener(ViewEvent.REDRAW,redrawHandler);
		view.addEventListener(ViewEvent.SEEK,seekHandler);
		view.addEventListener(ViewEvent.STOP,stopHandler);
		view.addEventListener(ViewEvent.VOLUME,volumeHandler);
	};



	/** Catch errors dispatched by the playlister. **/
	private function errorHandler(evt:ErrorEvent):void {
		dispatchEvent(new ControllerEvent(ControllerEvent.ERROR,{message:evt.text}));
	};


	/** Switch fullscreen state. **/
	private function fullscreenHandler(evt:ViewEvent):void {
		if(skin.stage['displayState'] == 'fullScreen') {
			skin.stage['displayState'] = 'normal';
		} else {
			fullscreenrect();
			skin.stage['displayState'] = 'fullScreen';
		}
	};


	/** Set the fullscreen rectangle **/
	private function fullscreenrect():void {
		try {
			var srx:Number = Capabilities.screenResolutionX;
			var asr:Number = srx/Capabilities.screenResolutionY;
			var wid:Number = playlist[config['item']]['width'];
			if(wid && wid > srx/2) {
				skin.stage["fullScreenSourceRect"] = new Rectangle(skin.x,skin.y,wid,Math.round(wid/asr));
			} else {
				skin.stage["fullScreenSourceRect"] = new Rectangle(skin.x,skin.y,srx/2,Capabilities.screenResolutionY/2);
			}
		} catch (err:Error) {}
	};


	/** Return the type of specific playlistitem (the Model to play it with) **/
	private function getModelType(itm:Object):String {
		// no file, so nothing to play
		if(!itm['file']) {
			return null;
		}
		var ext:String = ObjectParser.EXTENSIONS[itm['file'].substr(-3).toLowerCase()];
		// string matches on the file
		if(itm['file'].indexOf('youtube.com/w') > -1 || itm['file'].indexOf('youtube.com/v') > -1) {
			return 'youtube';
		}
		// recognized mimetype/extension and streamer
		if((itm['type'] == 'video' || ext) && itm['streamer']) {
			if(itm['streamer'].substr(0,4) == 'rtmp') {
				return 'rtmp';
			} else {
				return 'http';
			}
		}
		// user-defined type or recognized mimetypes
		if(itm['type']) {
			return itm['type'];
		}
		// extension is returned (can be null)
		return ext;
	};


	/** Jump to a userdefined item in the playlist. **/
	private function itemHandler(evt:ViewEvent):void {
		var itm:Number = evt.data.index;
		if (itm < 0) {
			playItem(0);
		} else if (itm > playlist.length-1) {
			playItem(playlist.length-1);
		} else if (!isNaN(itm)) {
			playItem(itm);
		}
	};


	/** Jump to the link of a playlistitem. **/
	private function linkHandler(evt:ViewEvent):void {
		var itm:Number = config['item'];
		if(evt.data.index) { itm = evt.data.index; }
		var lnk:String = playlist[itm]['link'];
		if(lnk != null) {
			navigateToURL(new URLRequest(lnk),config['linktarget']);
		}
	};


	/** Load a new playlist. **/
	private function loadHandler(evt:ViewEvent):void {
		if(config['state'] != 'IDLE') {
			stopHandler();
		}
		var obj:Object;
		if(typeof(evt.data.object) == 'string') {
			obj = {file:evt.data.object};
		} else {
			obj = evt.data.object;
		}
		if(obj['file']) {
			if(getModelType(obj) == null) {
				loader.load(new URLRequest(obj['file']));
				return;
			} else {
				playlistHandler(new Array(ObjectParser.parse(obj)));
			}
		} else {
			var arr:Array = new Array();
			for each(var itm:Object in obj) {
				arr.push(ObjectParser.parse(itm));
			}
			playlistHandler(arr);
		}
	};


	/** Translate the XML object to the feed array. **/
	private function loaderHandler(evt:Event):void {
		try {
			var dat:XML = XML(evt.target.data);
			var fmt:String = dat.localName().toLowerCase();
		} catch (err:Error) {
			dispatchEvent(new ControllerEvent(ControllerEvent.ERROR,'This playlist is not a valid XML file.'));
			return;
		}
		switch (fmt) {
			case 'rss':
				playlistHandler(RSSParser.parse(dat));
				break;
			case 'playlist':
				playlistHandler(XSPFParser.parse(dat));
				break;
			case 'asx':
				playlistHandler(ASXParser.parse(dat));
				break;
			case 'smil':
				playlistHandler(SMILParser.parse(dat));
				break;
			case 'feed':
				playlistHandler(ATOMParser.parse(dat));
				break;
			default:
				dispatchEvent(new ControllerEvent(ControllerEvent.ERROR,'Unknown playlist format: '+fmt));
				return;
		}
	};


	/** Update playlist item duration. **/
	private function metaHandler(evt:ModelEvent):void {
		if(evt.data.duration > 0 && playlist[config['item']]['duration'] == 0) {
			playlist[config['item']]['duration'] = evt.data.duration;
		}
		if(evt.data.width) {
			playlist[config['item']]['width'] = evt.data.width;
			playlist[config['item']]['height'] = evt.data.height;
		}
	};


	/** Save new state of the mute switch and send volume. **/
	private function muteHandler(evt:ViewEvent):void {
		if(evt.data.state) {
			if(evt.data.state == config['mute']) {
				return;
			} else { 
				config['mute'] = evt.data.state;
			}
		} else {
			config['mute'] = !config['mute'];
		}
		Configger.saveCookie('mute',config['mute']);
		dispatchEvent(new ControllerEvent(ControllerEvent.MUTE,{state:config['mute']}));
	};


	/** Jump to the next item in the playlist. **/
	private function nextHandler(evt:ViewEvent):void {
		if(playlist && config['shuffle'] == true) { 
			playItem(randomizer.pick());
		} else if (playlist && config['item'] == playlist.length-1) {
			playItem(0);
		} else if (playlist) { 
			playItem(config['item']+1);
		}
	};


	/** Change the playback state. **/
	private function playHandler(evt:ViewEvent):void {
		if(playlist) {
			if(evt.data.state != false && config['state'] == ModelStates.PAUSED) {
				dispatchEvent(new ControllerEvent(ControllerEvent.PLAY,{state:true}));
			} else if (evt.data.state != false && config['state'] == ModelStates.COMPLETED) {
				dispatchEvent(new ControllerEvent(ControllerEvent.SEEK,{position:playlist[config['item']]['start']}));
			} else if(evt.data.state != false && config['state'] == ModelStates.IDLE) {
				playItem();
			} else if (evt.data.state != true &&
				(config['state'] == ModelStates.PLAYING || config['state'] == ModelStates.BUFFERING)) {
				dispatchEvent(new ControllerEvent(ControllerEvent.PLAY,{state:false}));
			}
		}
	};


	/** Direct the model to play a new item. **/
	private function playItem(nbr:Number=undefined):void {
		if(nbr > -1) {
			if(playlist[nbr]['file'] == playlist[config['item']]['file']) {
				playlist[nbr]['duration'] = playlist[config['item']]['duration'];
			}
			config['item'] = nbr;
		}
		dispatchEvent(new ControllerEvent(ControllerEvent.ITEM,{index:config['item']}));
	};


	/** Check new playlist for playeable files and setup randomizing/autostart. **/
	private function playlistHandler(ply:Array):void {
		for(var i:Number=ply.length-1; i>-1; i--) {
			if(!ply[i]['streamer']) { ply[i]['streamer'] = config['streamer']; }
			if(!ply[i]['duration']) { ply[i]['duration'] = 0; }
			if(!ply[i]['start']) { ply[i]['start'] = 0; }
			ply[i]['type'] = getModelType(ply[i]);
			if(!ply[i]['type']) { ply.splice(i,1); }
		}
		if(ply.length > 0) {
			playlist = ply;
		} else {
			dispatchEvent(new ControllerEvent(ControllerEvent.ERROR,{message:'No valid filetypes found in this playlist'}));
			return;
		}
		if(config['shuffle'] == true) {
			randomizer = new Randomizer(playlist.length);
			config['item'] = randomizer.pick();
		} else if (config['item'] > playlist.length) {
			config['item'] = playlist.length-1;
		}
		dispatchEvent(new ControllerEvent(ControllerEvent.PLAYLIST,{playlist:playlist}));
		if(config['autostart'] == true) {
			playItem();
		}
	};


	/** Jump to the previous item in the playlist. **/
	private function prevHandler(evt:ViewEvent):void {
		if (config['item'] == 0) {
			playItem(playlist.length-1);
		} else { 
			playItem(config['item']-1);
		}
	};


	/** Switch playback quality. **/
	private function qualityHandler(evt:ViewEvent=null):void {
		if(evt.data.state != undefined) {
			if(evt.data.state == config['quality']) {
				return;
			} else { 
				config['quality'] = evt.data.state;
			}
		} else {
			config['quality'] = !config['quality'];
		}
		Configger.saveCookie('quality',config['quality']);
		dispatchEvent(new ControllerEvent(ControllerEvent.QUALITY,{state:config['quality']}));
	};


	/** Forward a resizing of the stage. **/
	private function redrawHandler(evt:ViewEvent=null):void {
		var dat:Object = {fullscreen: false};

		try { 
			var dps:String = skin.stage['displayState'];
		} catch (err:Error) {}

		if(dps == 'fullScreen') {
			dat.fullscreen = true;
			config['width'] = skin.stage.stageWidth;
			config['height'] = skin.stage.stageHeight;
		} else if(config['resizing']) {
			config['width'] = skin.stage.stageWidth;
			config['height'] = skin.stage.stageHeight;
		} 

		config['controlbar.size'] = skin.controlbar.height;
		if(config['controlbar']) { config['controlbar.position'] = config['controlbar']; }
		if(config['playlist']) { config['playlist.position'] = config['playlist']; }
		if(config['playlistsize']) { config['playlist.size'] = config['playlistsize']; }

		layoutPlugins();
		
		dat.width = config['width'];
		dat.height = config['height'];
		dispatchEvent(new ControllerEvent(ControllerEvent.RESIZE,dat));
	};

	/** Set the size and position for each plugin in config. 
	 *  It's up to each plugin to resize itself accordingly. 
	 **/
	private function layoutPlugins():void {
		var displayCoord:Object = { x: 0, y:0, width:Number(config['width']), height:Number(config['height']) };
	
		var plugins:Array = [];
		var overlays:Array = [];
		
		if(config.hasOwnProperty('plugins')) {
			plugins = String(config['plugins']).split(',');
		}
		
		for(var i:Number = plugins.length-1; i >= 0; i--) {
			var plg:String = plugins[i];
			
			if(config.hasOwnProperty(plg + '.position') && config.hasOwnProperty(plg + '.size')) {
				var plgSize:Number = Number(config[plg+'.size']);
				switch(String(config[plg+'.position']).toLowerCase()) {
					case "left":
						config[plg+'.x'] = displayCoord.x;
						config[plg+'.y'] = displayCoord.y;
						config[plg+'.width'] = plgSize;
						config[plg+'.height'] = displayCoord.height;
						displayCoord.x += plgSize;
						displayCoord.width -= plgSize;
						break;
					case "top":
						config[plg+'.x'] = displayCoord.x;
						config[plg+'.y'] = displayCoord.y;
						config[plg+'.width'] = displayCoord.width;
						config[plg+'.height'] = plgSize;
						displayCoord.y += plgSize;
						displayCoord.height -= plgSize;
						break;
					case "right":
						config[plg+'.x'] = displayCoord.x + displayCoord.width - plgSize;
						config[plg+'.y'] = displayCoord.y;
						config[plg+'.width'] = plgSize;
						config[plg+'.height'] = displayCoord.height;
						displayCoord.width -= plgSize;
						break;
					case "bottom":
						config[plg+'.x'] = displayCoord.x;
						config[plg+'.y'] = displayCoord.y + displayCoord.height - plgSize;
						config[plg+'.width'] = displayCoord.width;
						config[plg+'.height'] = plgSize;
						displayCoord.height -= plgSize;
						break;
					default:
						overlays.push(plg);
				}
			} else {
				overlays.push(plg);
			}
		}
		
		for(var x:Number=0; x<overlays.length; x++) {
			config[overlays[x]+'.x'] = displayCoord.x;
			config[overlays[x]+'.y'] = displayCoord.y;
			config[overlays[x]+'.width'] = displayCoord.width;
			config[overlays[x]+'.height'] = displayCoord.height;
		}
		
		for(var s:String in displayCoord) {
			config[s] = displayCoord[s];
		}
	}


	/** Seek to a specific part in a mediafile. **/
	private function seekHandler(evt:ViewEvent):void {
		if(config['state'] != ModelStates.IDLE && playlist[config['item']]['duration'] > 0) {
			var pos:Number = evt.data.position;
			if(pos < 2) { 
				pos = 0;
			} else if (pos > playlist[config['item']]['duration']-2) { 
				pos = playlist[config['item']]['duration']-2;
			}
			dispatchEvent(new ControllerEvent(ControllerEvent.SEEK,{position:pos}));
		}
	};


	/** Stop all playback and buffering. **/
	private function stopHandler(evt:ViewEvent=undefined):void {
		dispatchEvent(new ControllerEvent(ControllerEvent.STOP));
	};


	/** Manage playback state changes. **/
	private function stateHandler(evt:ModelEvent):void {
		if(evt.data.newstate == ModelStates.COMPLETED && (config['repeat'] == 'always' ||
			(config['repeat'] == 'list' && config['shuffle'] == true && randomizer.length > 0) || 
			(config['repeat'] == 'list' && config['shuffle'] == false && config['item'] < playlist.length-1))) {
			if(config['shuffle'] == true) {
				playItem(randomizer.pick());
			} else if(config['item'] == playlist.length-1) {
				playItem(0);
			} else {
				playItem(config['item']+1);
			}
		}
	};


	/** Save new state of the mute switch and send volume. **/
	private function volumeHandler(evt:ViewEvent):void {
		var vol:Number = evt.data.percentage;
		if (vol < 1) {
			muteHandler(new ViewEvent(ViewEvent.MUTE,{state:true}));
		} else if (!isNaN(vol) && vol < 101) {
			if(config['mute'] == true) { 
				muteHandler(new ViewEvent(ViewEvent.MUTE,{state:false}));
			}
			config['volume'] = vol;
			Configger.saveCookie('volume',config['volume']);
			dispatchEvent(new ControllerEvent(ControllerEvent.VOLUME,{percentage:vol}));
		}
	};


}


}
