/**
* Model for playback of streaming video with the Lighttpd server.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.HTTPModel;
import com.jeroenwijering.player.Model;

import flash.utils.*;


public class LighttpdModel extends HTTPModel {


	/** Constructor. **/
	public function LighttpdModel(mod:Model):void {
		super(mod);
	};


	/** Create the video request URL. **/
	override protected function getURL():String {
		var url:String = item['file'];
		var off:Number = byteoffset;
		if(mp4) {
			off = timeoffset;
		}
		if(url.indexOf('?') > -1) {
			url += '&start='+off;
		} else {
			url += '?start='+off;
		}
		if(model.config['token']) {
			url += '&token='+model.config['token'];
		}
		url += '&id='+model.config['id'];
		url += '&client='+encodeURI(model.config['client']);
		url += '&version='+encodeURI(model.config['version']);
		url += '&width='+model.config['width'];
		return url;
	};


};


}