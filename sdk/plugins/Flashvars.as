/**
* This is a simple plugin that accepts specific flashvars.
**/
package {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;
import flash.text.TextField;


public class Flashvars extends MovieClip implements PluginInterface {


	/** Reference to this plugins' flashvars. **/
	public var config:Object = {
		message:'hi!'
	};
	/** Reference to this plugins' stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor. **/
	public function Flashvars():void {
		clip = this;
	};


	/**
	* The initialize call is invoked by the player on startup.
	* With player 4.4+, the player automatically pushes the flashvars into our 'config' variable.
	* Unfortunately, we still have to do this manually for older players.
	*
	* The 'field' textfield is drawn in the FLA file.
	* By using the 'clip' variable, you can easily access it.
	**/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		if(view.config['flashvars.message']) {
			config['message'] = view.config['flashvars.message'];
		}
		clip.field.text = config['message'];
	};


};


}