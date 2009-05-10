package com.jeroenwijering.utils {


import com.jeroenwijering.utils.Debug;

import flash.external.ExternalInterface;


/**
* <p>Utility class for logging debug messages. it supports the following logging systems:</p>
* <ul>
* <li>The tracing sstem built into the debugging players.</li>
* <li>The standalone Arthropod AIR application.</li>
* <li>The Console.log function built into Firefox/Firebug.</li>
* </ul>
**/
public class Logger {


	/** Constant defining the Arthropod output type. **/
	public static const ARTHROPOD:String = "arthropod";
	/** Constant defining the Firefox/Firebug console output type. **/
	public static const CONSOLE:String = "console";
	/** Constant defining there's no output. **/
	public static const NONE:String = "none";
	/** Constant defining the Flash tracing output type. **/
	public static const TRACE:String = "trace";


	/** Current output system to use for logging. **/
	public static var output:String = Logger.NONE;


	/**
	* Log a message to the output system.
	*
	* @param message	The message to send forward. Arrays and objects are automatically chopped up.
	* @param type		The type of message; is capitalized and precedes the message.
	**/
	public static function log(message:*,type:String="log"):void {
		if(message == undefined) {
			send(type.toUpperCase());
		} else if (message is String) {
			send(type.toUpperCase()+' ('+message+')');
		} else if (message is Boolean || message is Number || message is Array) {
			send(type.toUpperCase()+' ('+message.toString()+')');
		} else {
			Logger.object(message,type);
		}
	};


	/** Explode an object for logging. **/
	private static function object(message:Object,type:String):void {
		var txt:String = type.toUpperCase()+' ({';
		for(var i:String in message) {
			if(message[i] is Object) { 
				txt += i+':'+message[i].toString()+', ';
			}
		}
		txt = txt.substr(0,txt.length-2);
		if(i) { txt += '})'; }
		Logger.send(txt);
	};


	/** Send the messages to the output system. **/
	private static function send(text:String):void {
		switch(Logger.output) {
			case Logger.ARTHROPOD:
				Debug.log(text);
				break;
			case Logger.CONSOLE:
				ExternalInterface.call('console.log',text);
				break;
			case Logger.TRACE:
				trace(text);
				break;
			default:
				break;
		}
	};


}


}