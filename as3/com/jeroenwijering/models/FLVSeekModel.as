/**
* Manages playback of streaming flv with Limelight FLVSeek functionality.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.HTTPModel;
import com.jeroenwijering.player.Model;

import flash.utils.*;


public class FLVSeekModel extends HTTPModel {


	/** Constructor; sets up the connection and display. **/
	public function FLVSeekModel(mod:Model):void {
		super(mod);
	};


	/** Create the video request URL. **/
	override protected function getURL():String {
		var url:String = item['file'];
		if(url.indexOf('?') > -1) {
			url += '&fs='+byteoffset;
		} else {
			url += '?fs='+byteoffset;
		}
		return url;
	};


};


}