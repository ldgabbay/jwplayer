/**
* Plugin for playing closed captions and a closed audiodescription with a video.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.parsers.SRTParser;
import com.jeroenwijering.parsers.TTParser;
import com.jeroenwijering.utils.Configger;

import flash.display.MovieClip;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.external.ExternalInterface;
import flash.media.*;
import flash.net.URLLoader;
import flash.net.URLRequest;
import flash.text.*;


public class Accessibility extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		audio:undefined,
		captions:undefined,
		fontsize:14,
		hide:false,
		listener:undefined,
		mute:false,
		volume:90
	}
	/** Reference to the MVC view. **/
	private var view:AbstractView;
	/** XML connect and parse object. **/
	private var loader:URLLoader;
	/** The array the captions are loaded into. **/
	private var captions:Array;
	/** Textformat entry for the captions. **/
	private var format:TextFormat;
	/** Displayelement to load the captions into. **/
	private var clip:MovieClip;
	/** Currently active caption. **/
	private var current:Number;
	/** sound object to be instantiated. **/
	private var sound:Sound;
	/** Sound channel object. **/
	private var channel:SoundChannel;


	public function Accessibility(clp:MovieClip=null):void {
		if(clp) { 
			clip = clp;
		} else {
			clip = this['accessibility'];
		}
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE,loaderHandler);
	};


	/** Show/hide the captions **/
	public function hide(stt:Boolean):void {
		config['hide'] = stt;
		Configger.saveCookie('accessibility.hide',config['hide']);
		clip.visible = config['hide'];
		if(config['hide']) { 
			clip.captionsIcon.alpha = 1;
		} else { 
			clip.captionsIcon.alpha = 0.3;
		}
	};


	/** Clicking the  hide button. **/
	private function hideClick(evt:MouseEvent=null):void {
		hide(!config['hide']);
	};


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		if(view.config['audio']) { config['audio'] = view.config['audio']; }
		if(view.config['captions']) { config['captions'] = view.config['captions']; }
		if(!config['captions'] && !config['audio']) {
			clip.visible = false;
			return;
		}
		view.addControllerListener(ControllerEvent.ITEM,itemHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		clip.tf.autoSize = TextFieldAutoSize.CENTER;
		format = new TextFormat(null,config['fontsize']);
		hide(config['hide']);
		mute(config['mute']);
		try {
			setButtons();
		} catch (erro:Error) { 
				clip.audioIcon.visible = clip.captionsIcon.visible = false;
		}
		try {
			ExternalInterface.addCallback("hideCaptions",hideClick);
			ExternalInterface.addCallback("muteAudio",muteClick);
		} catch (err:Error) {}
	};


	/** Check for captions with a new item. **/
	private function itemHandler(evt:ControllerEvent=null):void {
		setCaption(-1);
		captions = new Array();
		var cap:String = view.playlist[view.config['item']]['captions'];
		if(cap) { config['captions'] = cap; }
		if(config['captions']) {
			try {
				loader.load(new URLRequest(config['captions']));
			} catch (err:Error) {
				view.sendEvent('ERROR','Captions: '+err.message);
			}
		}
		var aud:String = view.playlist[view.config['item']]['audio'];
		if(aud) { config['audio'] = aud; }
		if(config['audio']) { setAudio(); }
	};


	/** Captions are loaded; now display them. **/
	private function loaderHandler(evt:Event):void {
		if(config['captions'].substr(-3) == 'srt') {
			captions = SRTParser.parseCaptions(String(evt.target.data));
		} else { 
			captions = TTParser.parseCaptions(XML(evt.target.data));
		}
		if(captions.length == 0) {
			view.sendEvent('TRACE','Acessibility: Captions are not a valid TimedText or SRT file.');
		}
	};


	/** Mute/unmute the audiodesc. **/
	public function mute(stt:Boolean):void {
		config['mute'] = stt;
		Configger.saveCookie('accessibility.mute',config['mute']);
		setVolume();
		if(config['mute']) {
			clip.audioIcon.alpha = 0.3;
		} else { 
			clip.audioIcon.alpha = 1;
		}
	};


	/** Clicking the  hide button. **/
	private function muteClick(evt:MouseEvent=null):void {
		mute(!config['mute']);
	};


	/** Resize the captions if the display changes. **/
	private function resizeHandler(evt:ControllerEvent=undefined):void {
		clip.width = view.config['width'];
		clip.scaleY = clip.scaleX;
		clip.y = view.config['height']-clip.height-config['fontsize']*clip.scaleX;
	};


	/** Set the audidescription volume level. **/
	private function setAudio():void {
		sound = new Sound(new URLRequest(config['audio']));
		channel = sound.play();
		setVolume();
	};

	/** Set buttons in the controlbar **/
	private function setButtons():void {
		if(config['captions']) {
			view.getPlugin('controlbar').addButton(clip.captionsIcon,'captions',hideClick);
		} else { 
			clip.captionsIcon.visible = false;
		}
		if(config['audio']) {
			view.getPlugin('controlbar').addButton(clip.audioIcon,'audio',muteClick);
		} else {
			clip.audioIcon.visible = false;
		}
	};


	/** Set a caption on screen. **/
	private function setCaption(idx:Number):void {
		var txt:String = '';
		if(idx > -1) { txt = captions[idx]['text']; }
		current = idx;
		clip.tf.htmlText = txt;
		clip.tf.setTextFormat(format);
		view.sendEvent('TRACE','caption: '+txt);
		resizeHandler();
		if(config['listener']) {
			try { 
				ExternalInterface.call(config['listener'],txt);
			} catch(err:Error) {}
		}
	};


	/** Set the volume level. **/
	private function setVolume():void {
		var trf:SoundTransform = new SoundTransform(config['volume']/100);
		if(config['mute']) { trf.volume = 0; }
		if(channel) { channel.soundTransform = trf; }
	};


	/** The statehandler manages audio pauses. **/
	private function stateHandler(evt:ModelEvent) { 
		switch(evt.data.newstate) {
			case ModelStates.PAUSED:
			case ModelStates.COMPLETED:
			case ModelStates.IDLE:
				if(channel) {
					channel.stop();
				}
				break;
			}
	};


	/** Check timing of the player to sync captions. **/
	private function timeHandler(evt:ModelEvent):void {
		var cur:Number = -1;
		var pos:Number = evt.data.position;
		// sync up the captions if needed.
		for(var i:Number=0; i<captions.length; i++) {
			if(captions[i]['begin'] < pos && captions[i]['end'] > pos) {
				cur = i;
				break;
			}
		}
		trace(cur);
		if(cur != current) {
			setCaption(cur);
		}
		// sync up the audio if needed.
		if(channel && view.config['state'] == ModelStates.PLAYING && Math.abs(pos-channel.position/1000) > 0.5) {
			channel.stop();
			channel = sound.play(pos*1000);
			setVolume();
		}
	};


};


}