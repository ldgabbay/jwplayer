/**
* This is a simple plugin that can freely position itself inside the player.
**/
package {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;


public class Positioning extends MovieClip implements PluginInterface {


	/** Reference to this plugins' flashvars. **/
	public var config:Object = {};
	/** Reference to this plugins' stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor. It references the stage graphics. **/
	public function Positioning():void {
		clip = this;
	};


	/** 
	* The initialize call is invoked by the player on startup.
	* It saves the reference, and subscribes on the resizing of the player.
	**/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addControllerListener(ControllerEvent.RESIZE,resizeHandler);
		resizeHandler();
	};


	/** 
	* This function is automatically called when the player resizes.
	* 
	* First, the width and height of the display are used, since in 4.1 - 4.3,
	* plugins could only be on top of the display.
	*
	* Second, the 'config' variable of the plugin is checked for a "width" flashvar.
	* The 4.4+ players will automatically update an x/y/width/height/visible in it.
	* If it is there, we update the width and height and position the clip.
	* The 'visible' flashvar is useful to hide the plugin in fullscreen.
	*
	* Last, we resize the "block" MovieClip that is in the FLA file.
	**/
	private function resizeHandler(evt:ControllerEvent=null) {
		var wid:Number = view.config['width'];
		var hei:Number = view.config['height'];
		if(config['width']) {
			wid = config['width'];
			hei = config['height'];
			clip.x = config['x'];
			clip.y = config['y'];
			clip.visible = config['visible'];
		}
		clip.block.width = wid;
		clip.block.height = hei;
	};


};


}