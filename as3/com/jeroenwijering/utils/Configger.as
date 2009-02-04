/**
* Loads application configuration data (from xml, cookies and flashvars).
**/
package com.jeroenwijering.utils {


import com.jeroenwijering.utils.Strings;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.display.Sprite;
import flash.net.SharedObject;
import flash.net.URLRequest;
import flash.net.URLLoader;


public class Configger extends EventDispatcher {


	/** Reference to a display object to get flashvars from. **/
	private var reference:Sprite;
	/** Reference to the config object. **/
	private var config:Object;
	/** XML loading object reference **/
	private var loader:URLLoader;
	/** Cookie object. **/
	private static var cookie:SharedObject;


	/**
	* Constructor.
	* 
	* @param ref	A reference Sprite; needed to access the flashvars.
	**/
	public function Configger(ref:Sprite):void {
		reference = ref;
		Configger.cookie = SharedObject.getLocal('com.jeroenwijering','/');
	};


	/**
	* Start the variables loading process.
	* 
	* @param def	The default config object; existing values are overwritten.
	**/
	public function load(def:Object):void {
		config = def;
		var xml:String = reference.root.loaderInfo.parameters['config'];
		if(xml) {
			loadXML(Strings.decode(xml));
		} else {
			loadFlashvars();
		}
	};


	/** Load configuration data from external XML file. **/
	private function loadXML(url:String):void {
		loader = new URLLoader();
		loader.addEventListener(Event.COMPLETE,xmlHandler);
		try {
			loader.load(new URLRequest(url));
		} catch (err:Error) {
			loadFlashvars();
		}
	};


	/** Parse the XML from external configuration file. **/
	private function xmlHandler(evt:Event):void {
		var dat:XML = XML(evt.currentTarget.data);
		var obj:Object = new Object();
		for each (var prp:XML in dat.children()) {
			obj[prp.name()] = prp.text();
		}
		compareWrite(obj);
		loadFlashvars();
	};


	/** Set config variables or load them from flashvars. **/
	private function loadFlashvars():void {
		compareWrite(reference.root.loaderInfo.parameters);
		loadCookies();
	};


	/** Load configuration data from flashcookie. **/
	private function loadCookies() {
		compareWrite(Configger.cookie.data);
		dispatchEvent(new Event(Event.COMPLETE));
	};


	/** Compare and save new items in config. **/
	private function compareWrite(obj:Object):void {
		for (var cfv:String in obj) {
			config[cfv.toLowerCase()] = Strings.serialize(obj[cfv.toLowerCase()]);
		}
	};


	/**
	* Save config parameter to cookie.
	*
	* @param prm	The parameter name.
	* @param val	The parameter value.
	**/
	public static function saveCookie(prm:String,val:Object) {
		Configger.cookie.data[prm] = val;
		Configger.cookie.flush();
	};


}


}