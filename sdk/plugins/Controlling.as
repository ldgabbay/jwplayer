/**
* This is a simple plugin template for controlling the player.
**/
package {


import com.jeroenwijering.events.*;

import flash.display.MovieClip;
import flash.events.MouseEvent;


public class Controlling extends MovieClip implements PluginInterface {


	/** Reference to this plugins' flashvars. **/
	public var config:Object = {};
	/** Reference to this plugins' stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor. **/
	public function Controlling():void {
		clip = this;
	};


	/** 
	* The initialize call is invoked by the player on startup. 
	* It gives a reference to the player
	* 
	* Before this function is called, the player links our "clip" variable to the FLA graphics.
	* In the FLA, the "button" MovieClip we use here is drawn.
	**/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		clip.button.addEventListener(MouseEvent.CLICK,clickHandler);
		clip.button.buttonMode = true;
	};


	/** The button is clicked, so stop the player. **/
	private function clickHandler(evt:MouseEvent) {
		view.sendEvent(ViewEvent.MUTE);
	};


};


}