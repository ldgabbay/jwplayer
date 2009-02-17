/**
* Prints the metadata enclosed in videos onscreen, which is useful for metadata checking. 
**/
package com.jeroenwijering.plugins {


import com.jeroenwijering.events.*;

import flash.display.MovieClip;


public class Sharing extends MovieClip implements PluginInterface {


	/** Object with configuration values; autofilled by the player. **/
	public var config:Object = {
		'embed':undefined,
		'link':undefined,
		'message':'check out this video!',
		'oncomplete':true
	};
	/** Reference to the graphics; autofilled by the player. **/
	public var skin:MovieClip;
	/** Reference to the View of the player. **/
	private var view:AbstractView;


	/** Constructor; nothing going on. **/
	public function Sharing() {};



	/** The initialize call is invoked by the player View. **/
	public function initializePlugin(vie:AbstractView):void {
		view = vie;
	};


	};


};


}