/**
* Prints the metadata enclosed in videos onscreen, which is useful for metadata checking. 
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import com.jeroenwijering.utils.Scrollbar;
import flash.display.MovieClip;
import flash.events.MouseEvent;


public class MetaViewer extends MovieClip implements PluginInterface {


	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Reference to the graphics. **/
	private var clip:MovieClip;
	/** Scrollbar clip for the metadata. **/
	private var scrollbar:Scrollbar;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;


	/** Constructor; nothing going on. **/
	public function MetaViewer() {
		clip = this['metadata'];
		clip.tf.mask = clip.ms;
		clip.tf.autoSize = "left";
		clip.xx.mouseChildren = false;
		clip.xx.buttonMode = true;
		clip.xx.addEventListener(MouseEvent.CLICK,clickHandler);
		scrollbar = new Scrollbar(clip.tf,clip.ms);
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.META,metaHandler);
		resizeHandler();
	};


	/** When clicking the x, the viewer is closed. **/
	private function clickHandler(evt:MouseEvent) { clip.visible = false; };


	/** Print the metadata in a list. **/
	private function metaHandler(evt:ModelEvent) {
		if(evt.data.type == 'metadata' || evt.data.type == 'id3') {
			var str:String = '';
			for (var itm:String in evt.data) {
				switch(itm) {
					case 'type':
					case 'id':
					case 'version':
					case 'client':
						break;
					case 'keyframes':
						str += '» '+itm+': '+evt.data[itm]['times'].length+' entries\n';
						break;
					case 'seekpoints':
					case 'trackinfo':
						str += '» '+itm+': '+evt.data[itm].length+' entries\n';
						break;
					default:
						if(evt.data[itm] != '') {
							str += '» '+itm+': '+evt.data[itm]+'\n';
						}
						break;
				}
			}
			clip.tf.text = str;
			clip.visible = true;
			scrollbar.draw();
		}
	};


	/** Handle a resize. **/
	private function resizeHandler(evt:ControllerEvent=undefined) {
		var wid:Number = view.config['width'];
		var hei:Number = view.config['height'];
		try {
			var cfg = view.getPluginConfig(this);
			clip.x = cfg['x'];
			clip.y = cfg['y'];
			wid = cfg['width'];
			hei = cfg['height'];
			if(cfg['position'] != 'over') {
				clip.xx.visible = false;
			}
		} catch(err:Error) {}
		clip.bg.width = wid;
		clip.bg.height = hei;
		clip.tf.width = clip.ms.width = wid-50;
		clip.ms.height = hei-60;
		clip.xx.x = wid-35;
		scrollbar.draw();
	};


};


}