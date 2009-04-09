/**
* Manages playback of streaming video from the BitGravity CDN.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.models.HTTPModel;
import com.jeroenwijering.player.Model;


public class BitgravityModel extends HTTPModel {


	/** Constructor. **/
	public function BitgravityModel(mod:Model):void {
		super(mod);
	};


	/** Create the video request URL. **/
	override protected function getURL():String {
		var url:String = item['file'];
		if(timeoffset > 0) {
			if(url.indexOf('?') > 0) {
				url += '&';
			} else {
				url += '?';
			}
			if(mp4) { 
				url += 'starttime='+timeoffset;
			} else {
				url += 'start='+byteoffset;
			
			}
		}
		return url;
	};


};


}