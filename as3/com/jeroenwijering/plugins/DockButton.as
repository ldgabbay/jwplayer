/**
* A button from within the dock.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.utils.Draw;

import flash.display.*;
import flash.events.*;
import flash.text.TextField;


public class DockButton extends MovieClip {


	/** Reference to the object with colors. **/
	private var colors:Object;


	/**
	* Constructor; sets up the button.
	*
	* @param icn	The image to display in the button.
	* @param txt	The text to display in the button caption.
	* @param fcn	The function to call when the button is clicked
	* @param clr	The rollover color of the dock icon.
	**/
	public function DockButton(icn:DisplayObject,txt:String,hdl:Function,clr:Object=undefined):void {
		mouseChildren = false;
		buttonMode = true;
		if(icn) { setImage(icn); }
		field.text = txt;
		addEventListener(MouseEvent.CLICK,hdl);
		if(clr) {
			colors = clr;
			back.transform.colorTransform = colors['back'];
			icon.transform.colorTransform = colors['front'];
			addEventListener(MouseEvent.MOUSE_OVER,overHandler);
			addEventListener(MouseEvent.MOUSE_OUT,outHandler);
			field.textColor = colors['front'].color;
		}
	};


	/** When rolling over, the background is color changed. **/
	private function overHandler(evt:MouseEvent):void {
		back.transform.colorTransform = colors['light'];
	};


	/** When rolling over, the background is color changed. **/
	private function outHandler(evt:MouseEvent):void {
		back.transform.colorTransform = colors['back'];
	};


	/** 
	* Change the image in the button. 
	*
	* @param dpo	The new caption for the button.
	**/
	private function setImage(dpo:DisplayObject):void {
		Draw.clear(icon);
		icon.addChild(dpo);
		icon.x =  Math.round(width/2 - icon.width/2);
		icon.y = Math.round(height/2 - icon.height/2);
	};



};


}
