/**
* Parse a SmoothStreamingMedia manifest for metadata, quality levels and chunks.
**/
package com.jeroenwijering.parsers {


import com.jeroenwijering.utils.Logger;
import com.jeroenwijering.utils.Strings;


public class SmoothParser {


	/** Timecode to seconds multiplier. **/
	private static const MULTIPLIER = 10000000;


	/** Push c elements in an array. **/
	public static function parseChunks(dat:XML):Array {
		var arr:Array = new Array();
		var stt:Number = 0;
		for each (var i:XML in dat.children()[0].children()) {
			if (i.localName().toLowerCase() == 'c') {
				var end:Number = stt+i.@d.toString()/SmoothParser.MULTIPLIER;
				var obj:Object = {start:stt,end:end};
				Logger.log(obj);
				arr.push(obj);
				stt = end;
			}
		}
		return arr;
	};


	/** Push StreamIndex attributes into an object. **/
	public static function parseIndex(dat:XML):Object {
		var obj:Object = new Object();
		var att:XMLList = dat.children()[0].@*;
		for(var i:Number=0; i<att.length(); i++) {
			obj[att[i].name().toString().toLowerCase()] = att[i].toString();
		}
		if(obj['duration']) {
			obj['duration'] /= SmoothParser.MULTIPLIER;
		}
		return obj;
	};


	/** Push QualityLevel elements in an array. **/
	public static function parseLevels(dat:XML):Array {
		var arr:Array = new Array();
		for each (var i:XML in dat.children()[0].children()) {
			if (i.localName().toLowerCase() == 'qualitylevel') {
				var obj:Object = new Object();
				for(var j:Number=0; j<i.@*.length(); j++) {
					obj[i.@*[j].name().toString().toLowerCase()] = i.@*[j].toString();
				}
				Logger.log(obj);
				arr.push(obj);
			}
		}
		return arr;
	};


}


}