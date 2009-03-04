/**
* Plugin that cookies users and autostarts if below a given count.
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.MovieClip;
import flash.net.SharedObject;


public class Autostarter extends MovieClip implements PluginInterface {


	/** List with configuration settings. **/
	public var config:Object = {
		count:1
	};
	/** Displayelement to load the captions into. **/
	public var clip:MovieClip;
	/** Reference to the view. **/
	private var view:AbstractView;
	/** Reference to the cookie. **/
	private var cookie:SharedObject;


	public function Autostarter():void {
		clip = this;
	};


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		update();
	};


	/** Update the cookie and set autostart. **/
	private function update():void {
		var fil:String = view.config['file'];
		cookie = SharedObject.getLocal('com.jeroenwijering.autostarter','/');
		if(cookie.data[fil]) {
			cookie.data[fil]++;
			if(cookie.data[fil] > config['count']) {
				view.config['autostart'] = false;
			} else {
				view.config['autostart'] = true;
			}
		} else { 
			cookie.data[fil] = 1;
			view.config['autostart'] = true;
		}
		cookie.flush();
	};


};


}