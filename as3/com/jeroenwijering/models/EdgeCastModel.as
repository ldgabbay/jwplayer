/**
* Manages playback of streaming video from the EdgeCast CDN.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.models.HTTPModel;
import com.jeroenwijering.player.Model;


public class EdgeCastModel extends HTTPModel {


	/** Constructor. **/
	public function EdgeCastModel(mod:Model):void {
		super(mod);
	};


	/** Create the video request URL. **/
	override protected function getURL():String {
		var url:String = item['file'];
		if(timeoffset > 0) {
			if(url.indexOf('?') > 0) {
				url += '&ec_seek='+timeoffset;
			} else {
				url += '?ec_seek='+timeoffset;
			}
		}
		return url;
	};


};


}