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
	private static var EXTENSIONS:Object = {
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
	private static var MIMETYPES:Object = {
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
	* @return 		A playlist item (plain object with title,file,image,etc. entries)
	**/
	public static function parse(obj:Object):Object {
		var itm = new Object();
		for(var i:String in ObjectParser.ELEMENTS) {
			if(obj[i] != undefined) {
				itm[i] = Strings.serialize(obj[i]);
			}
		}
		if(!itm['type']) {
			itm['type'] = ObjectParser.extension(itm['file']);
		}
		return itm;
	};


	/** 
	* Return the model type of the file based upon the extension.
	* 
	* @param fil	The file url.
	* @return		The model type.
	**/
	public static function extension(fil:String):String {
		var ext:String = fil.substr(-3);
		return ObjectParser.EXTENSIONS[ext];
	};


	/** 
	* Return the model type of the file based upon the mimetype.
	* 
	* @param fil	The file url.
	* @return		The model type.
	**/
	public static function mimetype(mtp:String):String {
		var typ:String = ObjectParser.MIMETYPES[mtp];
		if(!typ) {
			typ = ObjectParser.EXTENSIONS[mtp];
		}
		if(!typ) {
			typ = mtp;
		}
		return typ;
	};


}


}
