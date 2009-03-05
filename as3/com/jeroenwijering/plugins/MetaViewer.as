/**
* Prints the metadata enclosed in videos onscreen, which is useful for metadata checking. 
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Scrollbar;

import flash.display.MovieClip;
import flash.events.MouseEvent;
import flash.text.TextField;


public class MetaViewer extends MovieClip implements PluginInterface {


	/** Reference to the graphics. **/
	public var clip:MovieClip;
	/** Object with configuration values. **/
	public var config:Object = {};
	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Scrollbar clip for the metadata. **/
	private var scrollbar:Scrollbar;
	/** Formatted metadata string. **/
	private var metastring:String = "No metadata received yet."
	/** Formatted seekpoints string. **/
	private var seekstring:String = "No seekpoints received yet.";


	/** Constructor; nothing going on. **/
	public function MetaViewer() {
		clip = this;
	};

	/** Print the metadata in a list. **/
	private function dataHandler(evt:ModelEvent) {
		if(evt.data.type == 'metadata' || evt.data.type == 'id3') {
			var arr:Array = new Array();
			for (var itm:String in evt.data) {
				switch(itm) {
					case 'type':
					case 'id':
					case 'version':
					case 'client':
						break;
					case 'keyframes':
						seekstring = '';
						arr.push('» '+itm+': '+evt.data[itm]['times'].length+' entries');
						for (var i:Number=0; i<evt.data[itm]['times'].length; i++) {
							seekstring += '» '+evt.data[itm]['times'][i]+'s - '+evt.data[itm]['filepositions'][i]+'b\n';
						}
						break;
					case 'seekpoints':
						seekstring = '';
						for (var j:Number=0; j<evt.data[itm].length; j++) {
							seekstring += '» '+evt.data[itm][j]['time']+'s - '+evt.data[itm][j]['offset']+'b\n';
						}
					case 'trackinfo':
						arr.push('» '+itm+': '+evt.data[itm].length+' entries');
						break;
					default:
						if(evt.data[itm] != '') {
							arr.push('» '+itm+': '+evt.data[itm]);
						}
						break;
				}
			}
			arr.sort();
			metastring = arr.join('\n');
			metaHandler();
			resizeHandler();
		}
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.META,dataHandler);
		clip.tf.mask = clip.ms;
		clip.tf.autoSize = "left";
		clip.seek.buttonMode = clip.meta.buttonMode = true;
		clip.seek.addEventListener(MouseEvent.CLICK,seekHandler);
		clip.meta.addEventListener(MouseEvent.CLICK,metaHandler);
		scrollbar = new Scrollbar(clip.tf,clip.ms,'CCCCCC');
		clip.visible = true;
		resizeHandler();
	};


	/** Switching to metadata view. **/
	private function metaHandler(evt:MouseEvent=null) { 
		clip.tf.text = metastring;
		clip.meta.alpha = 1;
		clip.seek.alpha = 0.5;
		scrollbar.draw();
	};


	/** Handle a resize. **/
	private function resizeHandler(evt:ControllerEvent=undefined) {
		var wid:Number = view.config['width'];
		var hei:Number = view.config['height'];
		if(config['width']) {
			clip.x = config['x'];
			clip.y = config['y'];
			wid = config['width'];
			hei = config['height'];
			clip.visible = config['visible'];
		}
		clip.bg.width = wid;
		clip.bg.height = hei;
		clip.tf.width = clip.ms.width = wid-50;
		clip.ms.height = hei-60;
		scrollbar.draw();
	};


	/** Switching to seekpoints. **/
	private function seekHandler(evt:MouseEvent) { 
		clip.tf.text = seekstring;
		clip.meta.alpha = 0.5;
		clip.seek.alpha = 1;
		scrollbar.draw();
	};


};


}