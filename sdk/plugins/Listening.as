/**
* This is a simple plugin that listens to a few events of the player.
**/
package {


import com.jeroenwijering.events.*;
import flash.display.MovieClip;
import flash.text.TextField;


public class Listening extends MovieClip implements PluginInterface {


	/** Reference to this plugins' flashvars. **/
	public var config:Object = {};
	/** Reference to this plugins' stage graphics. **/
	public var clip:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor. **/
	public function Listening():void {
		clip = this;
	};


	/** 
	* The initialize call is invoked by the player on startup.
	* It gives a reference to the player.
	* When we have that, we can start listening to the time and playback state.
	**/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
		view.addModelListener(ModelEvent.STATE,stateHandler);
		view.addModelListener(ModelEvent.TIME,timeHandler);
	};


	/** This function is called each time the playback state changes. **/
	private function stateHandler(evt:ModelEvent) {
		switch(evt.data.newstate) {
			case ModelStates.PAUSED:
				clip.field.text = 'video paused';
				break;
			case ModelStates.COMPLETED:
				clip.field.text = 'video completed';
				break;
			case ModelStates.PLAYING:
				// nothing here, since now the time is updating.
				break;
			case ModelStates.IDLE:
				clip.field.text = 'video not started';
				break;
			case ModelStates.BUFFERING:
				clip.field.text = 'video buffering';
				break;
		}
	};


	/** This function is called each time the time of the video changes. **/
	private function timeHandler(evt:ModelEvent) {
		var dur:Number = evt.data.duration;
		var pos:Number = evt.data.position;
		var txt:String = Math.round(dur-pos)+" seconds left";
		clip.field.text = txt;
	};


};


}