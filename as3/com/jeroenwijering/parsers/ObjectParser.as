/**
* Process a feeditem before adding to the feed.
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
		'title':undefined,
		'start':0,
		'streamer':undefined,
		'tags':undefined,
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
	/** Mimetypes of all supported mediafiles. **/
	public static var MIMETYPES:Object = {
		'application/x-fcs':'rtmp',
		'application/x-shockwave-flash':'image',
		'audio/aac':'video',
		'audio/m4a':'video',
		'audio/mp4':'video',
		'audio/mp3':'sound',
		'audio/mpeg':'sound',
		'audio/x-3gpp':'video',
		'audio/x-m4a':'video',
		'image/gif':'image',
		'image/jpeg':'image',
		'image/jpg':'image',
		'image/png':'image',
		'video/flv':'video',
		'video/3gpp':'video',
		'video/h264':'video',
		'video/mp4':'video',
		'video/x-3gpp':'video',
		'video/x-flv':'video',
		'video/x-m4v':'video',
		'video/x-mp4':'video'
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
			} else if(typeof(ObjectParser.ELEMENTS[i]) == "number") {
				itm[i] = 0;
			}
		}
		return itm;
	};


}


}
