/**
* This plugin prints the metadata enclosed in videos or mp3s on screen.
*
* @todo 	Add a scrollbar when the metadata doesn't fit in the display.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;
import flash.events.MouseEvent;


public class MetaViewer extends MovieClip implements PluginInterface {


	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** Reference to the graphics. **/
	private var clip:MovieClip;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;


	/** Constructor; nothing going on. **/
	public function MetaViewer() {};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		view.addModelListener(ModelEvent.META,metaHandler);
		view.skin['metadata'] ? clip = view.skin['metadata']: clip = this['metadata'];
		resizeHandler();
		clip.visible = false;
		clip.xx.mouseChildren = false;
		clip.xx.buttonMode = true;
		clip.xx.addEventListener(MouseEvent.CLICK,clickHandler);
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
		}
	};


	/** Handle a resize. **/
	private function resizeHandler(evt:ControllerEvent=undefined) {
		clip.bg.width = view.config['width'];
		clip.bg.height = view.config['height'];
		clip.tf.width = view.config['width']-40;
		clip.tf.height = view.config['height']-50;
		clip.xx.x = view.config['width']-40;
	};


};


}