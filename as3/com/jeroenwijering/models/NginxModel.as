/**
* Manages playback of streaming flv with the Nginx server.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.HTTPModel;
import com.jeroenwijering.player.Model;

import flash.utils.*;


public class NginxModel extends HTTPModel {


	/** Constructor; sets up the connection and display. **/
	public function NginxModel(mod:Model):void {
		super(mod);
	};


	/** Create the video request URL. **/
	override protected function getURL():String {
		var url:String = item['file'];
		var off:Number  = byteoffset;
		if(mp4) {
			off = timeoffset;
		}
		if(url.indexOf('?') > -1) {
			url += '&start='+off;
		} else {
			url += '?start='+off;
		}
		return url;
	};


};


}