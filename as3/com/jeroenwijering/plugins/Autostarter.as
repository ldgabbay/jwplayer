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
		cookie = SharedObject.getLocal('com.jeroenwijering','/');
	};


	/** Initing the plugin. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		if(!cookie.data['autostarter']) {
			cookie.data['autostarter'] = {};
		}
		update();
	};


	/** Update the cookie and set autostart. **/
	private function update():void {
		var fil:Number = view.config['file'];
		if(cookie.data['autostarter'][fil]) {
			cookie.data['autostarter'][fil]++;
			if(cookie.data['autostarter'][fil] > config['count']) {
				view.config['autostarter'] = false;
			} else {
				view.config['autostarter'] = true;
			}
		} else { 
			cookie.data['autostarter'][fil] = 1;
			view.config['autostarter'] = true;
		}
		cookie.flush();
	};


};


}