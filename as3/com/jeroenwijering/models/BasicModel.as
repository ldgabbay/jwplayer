/**
* This is the base model class all models must extent.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.player.Model;

import flash.utils.clearInterval;
import flash.utils.setInterval;


public class BasicModel {


	/** Reference to the player Model. **/
	protected var model:Model
	/** Reference to the currently active playlistitem. **/
	protected var item:Object;
	/** The current position inside the file. **/
	protected var position:Number;
	/** ID for the position interval. **/
	protected var interval:Number;


	/**
	* Constructor; sets up reference to the MVC model.
	*
	* @param mod	The model of the player MVC triad.
	* @see Model
	**/
	public function BasicModel(mod:Model):void {
		model = mod;
	};


	/**
	* Load an item into the model.
	*
	* @param itm	The currently active playlistitem.
	**/
	public function load(itm:Object):void {
		item = itm;
		position = item['start'];
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.BUFFERING});
		model.sendEvent(ModelEvent.BUFFER,{percentage:0});
	};


	/** Pause playback of the item. **/
	public function pause():void {
		clearInterval(interval);
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PAUSED});
	};


	/** Resume playback of the item. **/
	public function play():void {
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.PLAYING});
		interval = setInterval(positionInterval,100);
	};


	/** Interval function that pings the position. **/
	protected function positionInterval():void {
		position = Math.round(position*10+1)/10;
		if(position-item['start'] < item['duration']) {
			model.sendEvent(ModelEvent.TIME,{position:position-item['start'],duration:item['duration']});
		} else if (item['duration'] > 0) {
			pause();
			model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.COMPLETED});
		}
	};


	/**
	* Seek to a certain position in the item. 
	*
	* @param pos	The position in seconds.
	**/
	public function seek(pos:Number):void {
		clearInterval(interval);
		position = item['start'] + pos;
		play();
	};


	/** Stop playing and loading the item. **/
	public function stop():void {
		clearInterval(interval);
		if(item) { 
			position = item['start'];
		}
		model.sendEvent(ModelEvent.STATE,{newstate:ModelStates.IDLE});
	};


	/** 
	* Change the playback volume of the item.
	*
	* @param vol	The new volume (0 to 100).
	**/
	public function volume(vol:Number):void {};


};


}