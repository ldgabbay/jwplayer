/**
* Parse a MRSS group into a playlistitem (used in RSS and ATOM).
**/
package com.jeroenwijering.parsers {


import com.jeroenwijering.parsers.ObjectParser;
import com.jeroenwijering.utils.Strings;


public class MediaParser {


	/**
	* Parse an MRSS group (Yahoo MediaRSS extension).
	* 
	* @param obj	The entire MRSS XML object.
	* @param itm	The playlistentry to amend the object to.
	* @return		The playlistentry, amended with the MRSS info.
	* @see			ATOMParser
	* @see			RSSParser
	**/
	public static function parseGroup(obj:XML,itm:Object):Object {
		for each (var i:XML in obj.children()) {
			switch(i.localName()) {
				case 'content':
				if( !itm['file']) {
						itm['file'] = i.@url.toString();
					}
					if(i.@start) {
						itm['start'] = Strings.seconds(i.@start.toString());
					}
					if(i.@duration) {
						itm['duration'] = Strings.seconds(i.@duration.toString());
					}
					if(i.children().length() >0) {
						itm = parseGroup(i,itm);
					}
					break;
				case 'description':
					itm['description'] = i.text().toString();
					break;
				case 'thumbnail':
					itm['image'] = i.@url.toString();
					break;
				case 'credit':
					itm['author'] = i.text().toString();
					break;
				case 'keywords':
					itm['tags'] = i.text().toString();
					break;
				case 'meta':
					itm[i.@type.toString()] = i.text().toString();
					break;
			}
		}
		return itm;
	}


}


}