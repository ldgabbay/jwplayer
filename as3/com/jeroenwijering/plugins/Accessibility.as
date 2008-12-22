/**
* Plugin for playing closed captions and a closed audiodescription with a video.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.parsers.SRTParser;
import com.jeroenwijering.parsers.TTParser;
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
	private var config:Object = {
		audio:undefined,
		captions:undefined,
		fontsize:15,
		hide:false,
		listener:undefined,
		mute:false,
		volume:50
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



	public function Accessibility():void {
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE,loaderHandler);
	};


	/** Show/hide the captions **/
	public function hideCaptions(stt:Boolean) {
		config['hide'] = !stt;
		clip.visible = config['hide'];
		if(config['hide']) { 
			clip.captionsIcon.alpha = 1;
		} else { 
			clip.captionsIcon.alpha = 0.3;
		}
	};


	/** Clicking the  hide button. **/
	private function hideClick(evt:MouseEvent) {
		hideCaptions(config['hide']);
	};


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		if(view.skin['accessibility']) {
			clip =  view.skin['accessibility'];
		} else { 
			clip = this['accessibility'];
		}
		loadVars();
		view.addControllerListener(ControllerEvent.ITEM,itemHandler);
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
		view.addModelListener(ModelEvent.STATE,stateHandler);
		if(ExternalInterface.available && view.skin.loaderInfo.url.indexOf('http') == 0) {
			try {
				ExternalInterface.addCallback("hideCaptions",hideCaptions);
				ExternalInterface.addCallback("muteAudio",muteAudio);
			} catch (err:Error) {}
		}
		clip.tf.autoSize = TextFieldAutoSize.CENTER;
		format = new TextFormat(null,config['fontsize']);
		hideCaptions(config['hide'])
		muteAudio(config['mute']);
		try {
			if(config['audio']) {
				view.getPlugin('controlbar').addButton(clip.audioIcon,'audio',muteClick);
			}
			if(config['captions']) {
				view.getPlugin('controlbar').addButton(clip.captionsIcon,'captions',hideClick);
			}
		} catch (erro:Error) { 
			clip.audioIcon.visible = clip.captionsIcon.visible = false;
		}
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



	/** Load variables from the main config. **/
	private function loadVars() {
		config['audio'] = view.config['audio'];
		config['captions'] = view.config['captions'];
		for(var str:String in config) {
			if(view.config['accessibility.'+str]) {
				config[str] = view.config['accessibility.'+str];
			}
		}
	}


	/** Mute/unmute the audiodesc. **/
	private function muteAudio(stt:Boolean) {
		config['mute'] = stt;
		setVolume();
		if(config['mute']) {
			clip.audioIcon.alpha = 0.3;
		} else { 
			clip.audioIcon.alpha = 1;
		}
	};


	/** Clicking the  hide button. **/
	private function muteClick(evt:MouseEvent) {
		muteAudio(!config['mute']);
	};


	/** Resize the captions if the display changes. **/
	private function resizeHandler(evt:ControllerEvent=undefined):void {
		clip.width = view.config['width'];
		clip.scaleY = clip.scaleX;
		clip.y = view.config['height']-clip.height-config['fontsize']*clip.scaleX;
	};


	/** Set the audidescription volume level. **/
	public function setAudio():void {
		sound = new Sound(new URLRequest(config['audio']));
		channel = sound.play();
		setVolume();
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
		if(!captions) { return; }
		var cur:Number = -1;
		var pos:Number = evt.data.position;
		// sync up the captions (only if needed).
		for(var i:Number=0; i<captions.length; i++) {
			if(captions[i]['begin'] < pos && captions[i]['end'] > pos) {
				cur = i;
				break;
			}
		}
		if(cur != current) { setCaption(cur); }
		// and sync up the audio (only if needed).
		if(channel && view.config['state'] == ModelStates.PLAYING && Math.abs(pos-channel.position/1000) > 0.5) {
			channel.stop();
			channel = sound.play(pos*1000);
			setVolume();
		}
	};


};


}