/**
* This is the most basic parser for playlist entries. It only strips noexisting elements.
**/
package com.jeroenwijering.parsers {


import com.jeroenwijering.utils.Strings;


public class ObjectParser {


	/** Supported elements for a playlistentry. **/
	private static var ELEMENTS:Object = {
		'author':undefined,
		'date':undefined,
		'description':undefined,
		'duration':0,
		'file':undefined,
		'image':undefined,
		'link':undefined,
		'start':0,
		'streamer':undefined,
		'tags':undefined,
		'title':undefined,
		'type':undefined
	};
	/** File extensions of all supported mediatypes. **/
	public static var EXTENSIONS:Object = {
		'3g2':'video',
		'3gp':'video',
		'aac':'video',
		'f4b':'video',
		'f4p':'video',
		'f4v':'video',
		'flv':'video',
		'gif':'image',
		'jpg':'image',
		'm4a':'video',
		'm4v':'video',
		'mov':'video',
		'mp3':'sound',
		'mp4':'video',
		'png':'image',
		'rbs':'sound',
		'sdp':'video',
		'swf':'image',
		'vp6':'video'
	};


	/**
	* Parse a generic object into a playlist item.
	* 
	* @param obj	A plain object with key:value pairs.
	* @return 		A playlist item ({title,file,image,etc.})
	**/
	public static function parse(obj:Object):Object {
		var itm = new Object();
		for(var i:String in ObjectParser.ELEMENTS) {
			if(obj[i] != undefined) {
				itm[i] = Strings.serialize(obj[i]);
			}
		}
		return itm;
	};


}


}
