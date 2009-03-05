/**
* Plugin for playing closed captions and a closed audiodescription with a video.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.parsers.SRTParser;
import com.jeroenwijering.parsers.TTParser;

import flash.display.MovieClip;
import flash.events.*;
import flash.filters.DropShadowFilter;
import flash.net.*;
import flash.text.*;


public class Captions extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		back:false,
		file:undefined,
		fontsize:14,
		state:true
	};
	/** Displayelement to load the captions into. **/
	public var clip:MovieClip;
	/** XML connect and parse object. **/
	private var loader:URLLoader;
	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** Icon for the controlbar. **/
	private var icon:MovieClip;
	/** Reference to the textfield. **/
	public var field:TextField;
	/** The array the captions are loaded into. **/
	private var captions:Array;
	/** Textformat entry for the captions. **/
	private var format:TextFormat;
	/** Currently active caption. **/
	private var current:Number;


	public function Captions() {
		clip = this;
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE,loaderHandler);
	};


	/** Clicking the  hide button. **/
	private function clickHandler(evt:MouseEvent):void {
		hide(!config['state']);
	};


	/** Set buttons in the controlbar **/
	private function drawButton():void {
		try {
			icon = new MovieClip();
			icon.graphics.beginFill(0x000000);
			icon.graphics.moveTo(1,0);
			icon.graphics.lineTo(1,7);
			icon.graphics.lineTo(6,7);
			icon.graphics.lineTo(6,5);
			icon.graphics.lineTo(4,5);
			icon.graphics.lineTo(4,6);
			icon.graphics.lineTo(3,6);
			icon.graphics.lineTo(3,1);
			icon.graphics.lineTo(4,1);
			icon.graphics.lineTo(4,2);
			icon.graphics.lineTo(6,2);
			icon.graphics.lineTo(6,0);
			icon.graphics.lineTo(1,0);
			icon.graphics.moveTo(7,0);
			icon.graphics.lineTo(7,7);
			icon.graphics.lineTo(12,7);
			icon.graphics.lineTo(12,5);
			icon.graphics.lineTo(10,5);
			icon.graphics.lineTo(10,6);
			icon.graphics.lineTo(9,6);
			icon.graphics.lineTo(9,1);
			icon.graphics.lineTo(10,1);
			icon.graphics.lineTo(10,2);
			icon.graphics.lineTo(12,2);
			icon.graphics.lineTo(12,0);
			icon.graphics.lineTo(7,0);
			icon.graphics.endFill();
			view.getPlugin('controlbar').addButton(icon,'captions',clickHandler);
		} catch (err:Error) {}
	};


	private function drawClip() {
		var rct:MovieClip = new MovieClip();
		rct.graphics.beginFill(0x000000,0.6);
		rct.graphics.drawRect(0,0,400,60);
		format = new TextFormat();
		format.color = 0xFFFFFF;
		format.size = config['fontsize'];
		format.align = "center";
		format.font = "_sans";
		format.leading = 4;
		field = new TextField();
		field.width = 400;
		field.height = 10;
		field.y = 10;
		field.autoSize = "center";
		field.selectable = false;
		field.multiline = true;
		field.defaultTextFormat = format;
		clip.addChild(rct);
		clip.addChild(field);
		if(config['back'] == false) {
			rct.alpha = 0;
			var ftr:DropShadowFilter = new DropShadowFilter(0,45,0,1,2,2,10,3);
			field.filters = new Array(ftr);
		}
	};


	/** Show/hide the captions **/
	public function hide(stt:Boolean):void {
		config['state'] = stt;
		clip.visible = config['state'];
		if(config['state']) { 
			icon.alpha = 1;
		} else { 
			icon.alpha = 0.3;
		}
		var cke:SharedObject = SharedObject.getLocal('com.jeroenwijering','/');
		cke.data['captions.state'] = stt;
		cke.flush();
	};


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.ITEM,itemHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		drawButton();
		drawClip();
		clip.mouseEnabled = false;
		clip.mouseChildren = false;
		hide(config['state']);
	};


	/** Check for captions with a new item. **/
	private function itemHandler(evt:ControllerEvent=null):void {
		current = 0;
		var fil:String = view.playlist[view.config['item']]['captions'];
		if(fil) {
			config['file'] = fil;
		} else if (view.config['captions']) {
			config['file'] = view.config['captions'];
		} else if (view.config['captions.file']) {
			config['file'] = view.config['captions.file'];
		}
		try {
			if(config['file']) {
				loader.load(new URLRequest(config['file']));
			}
		} catch (err:Error) {
			view.sendEvent('TRACE','Captions: '+err.message);
		}
	};


	/** Captions are loaded; now display them. **/
	private function loaderHandler(evt:Event):void {
		var ext:String = config['file'].substr(-3);
		captions = new Array();
		if(ext == 'srt' || ext == 'txt') {
			captions = SRTParser.parseCaptions(String(evt.target.data));
		} else { 
			captions = TTParser.parseCaptions(XML(evt.target.data));
		}
		if(captions.length == 0) {
			view.sendEvent('TRACE','Captions: not a valid TimedText or SRT file.');
		}
	};


	/** Resize the captions if the display changes. **/
	private function resizeHandler(evt:ControllerEvent=undefined):void {
		clip.width = view.config['width'];
		clip.scaleY = clip.scaleX;
		if(config['back'] == false) {
			field.y = 50 - field.height;
		}
		clip.y = view.config['height']-clip.height;
	};


	/** Set a caption on screen. **/
	private function setCaption(pos:Number):void {
		for(var i:Number=0; i<captions.length-1; i++) {
			if(captions[i]['begin'] < pos && captions[i+1]['begin'] > pos) {
				current = i;
				field.htmlText = captions[i]['text'];
				resizeHandler();
				return;
			}
		}
	};


	/** Check timing of the player to sync captions. **/
	private function stateHandler(evt:ModelEvent):void {
		if((view.config['state'] == ModelStates.PLAYING ||
		 	view.config['state'] == ModelStates.PAUSED) && config['state']) {
			clip.visible = true;
		} else {
			clip.visible = false;
		}
	};


	/** Check timing of the player to sync captions. **/
	private function timeHandler(evt:ModelEvent):void {
		var pos:Number = evt.data.position;
		if(captions && (captions[current]['begin'] > pos || captions[current+1]['begin'] < pos)) {
			setCaption(pos);
		}
	};



};


}