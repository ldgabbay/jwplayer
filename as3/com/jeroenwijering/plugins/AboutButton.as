/**
* This plugin shows an 'about' button in the controlbar. It demonstrates the new ViewEvent.BUTTON.
* 
* By default, the plugin will use the 'abouttex' and 'aboutlink' flashvars, but you can set the folling flashvars:
* - text (Another, shorter or custom text).
* - link (Link the button should link to.
* - icon (a small GIF/PNG file that can be used as alternative to the text.
* 
* @author Pablo Schklowsky
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.Sprite;
import flash.events.MouseEvent;
import flash.net.URLLoader;
import flash.net.URLRequest;
import flash.net.navigateToURL;


public class AboutButton extends Sprite implements PluginInterface {

	/** Reference to the View of the player. **/
	private var view:AbstractView;
	/** initialize call for backward compatibility. **/
	public var initialize:Function = initializePlugin;
	/** Plugin config. **/
	private var config:Object;
	/** Icon sprite. **/
	private var icon:Sprite;


	/** Constructor; initing icon. **/
	public function CustomButton() {
		icon = new Sprite();
	};


	/** This function is invoked when the button is clicked. **/
	public function clickHandler(evt:MouseEvent):void {
		view.sendEvent(ViewEvent.PLAY,'false');
		if(config['link']) {
			navigateToURL(new URLRequest(config['link']),'_blank');
		} else {
			navigateToURL(new URLRequest(view.config['aboutlink']),'_blank');
		} 
	};


	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		config = view.getPluginConfig(this);
		view.sendEvent(ViewEvent.BUTTON,{icon:icon,handler:clickHandler,name:'about'});
		if(config['icon']) { 
			
		} else if (config['text']) { 
			
		} else { 
			
		}
	};


	/** Draw the icon contents . **/
	private  function drawIcon() { 
		
	};


}


}