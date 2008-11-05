/**
* This draws a simple scrollbar next to a textfield/mask combination.
**/
package com.jeroenwijering.utils {


import com.jeroenwijering.utils.Draw;
import flash.display.Sprite;
import flash.events.MouseEvent;
import flash.text.TextField;
import flash.utils.clearInterval;
import flash.utils.setInterval;


public class Scrollbar {


	/** Textfield that has to be scrolled. **/
	private var field:TextField;
	/** Mask for the scrolleable field. **/
	private var mask:Sprite;
	/** Clip in which the scrollbar is drawn. **/
	private var scrollbar:Sprite;
	/** Icon of the scrollbar. **/
	private var icon:Sprite;
	/** Color of the scrollbar. **/
	private var color:String;
	/** Proportion between the field and mask. **/
	private var proportion:Number;
	/** Interval ID for smooth scrolling. **/
	private var interval:Number;


	/**
	* Constructor; initializes the scrollbar parameters.
	*
	* @param fld	The field that has to be scrolled.
	* @param msk	The field to use as mask for the scrolleable field.
	* @param icl	The color of the icon of the scrollbar (the part that moves).
	* @param rcl	The color of the rail of the scrollbar (the background).
	**/
	public function Scrollbar(fld:TextField,msk:Sprite,clr:String="000000"):void {
		field = fld;
		mask = msk;
		color = clr;
		scrollbar = new Sprite();
		field.parent.addChild(scrollbar);
		scrollbar.mouseChildren = false;
		scrollbar.buttonMode = true;
	};


	/**
	* Invoke a (re)draw of the scrollbar.
	**/
	public function draw():void {
		Draw.clear(scrollbar);
		field.y = mask.y;
		scrollbar.x = mask.x+mask.width;
		scrollbar.y = mask.y;
		proportion = mask.height/field.height;
		if(proportion < 1) {
			scrollbar.visible = true;
			scrollbar.addEventListener(MouseEvent.MOUSE_DOWN,downHandler);
			Draw.rect(scrollbar,color,10,mask.height,0,0,0);
			Draw.rect(scrollbar,color,1,mask.height,4,0,0.5);
			icon = Draw.rect(scrollbar,color,3,mask.height*proportion,3,0,1);
		} else {
			scrollbar.visible = false;
			scrollbar.removeEventListener(MouseEvent.MOUSE_DOWN,downHandler);
		}
	};


	/** The mouse is pressed over the scrollbar. **/
	private function downHandler(evt:MouseEvent):void {
		interval = setInterval(scroll,25);
		mask.stage.addEventListener(MouseEvent.MOUSE_UP,upHandler);
	};


	/** The mouse has been released after a scrollbarpress. **/
	private function upHandler(evt:MouseEvent):void {
		clearInterval(interval);
		mask.stage.removeEventListener(MouseEvent.MOUSE_UP,upHandler);
	};


	/** Calculate and scroll to the new y position. **/
	private function scroll():void {
		var mps:Number = scrollbar.mouseY;
		if(mps < icon.height/2) {
			icon.y = 0;
			field.y = mask.y;
		} else if (mps > scrollbar.height - icon.height/2) {
			icon.y = scrollbar.height-icon.height;
			field.y = mask.y + mask.height - field.height;
		} else {
			icon.y = mps - icon.height/2;
			field.y = mask.y + mask.height/2 - mps/proportion;
		}
	};


};


}