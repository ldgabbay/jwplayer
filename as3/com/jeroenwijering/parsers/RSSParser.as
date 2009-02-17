/**
* Parse an RSS feed and translate it to a feedarray.
**/
package com.jeroenwijering.parsers {


import com.jeroenwijering.parsers.JWParser;
import com.jeroenwijering.parsers.MediaParser;
import com.jeroenwijering.utils.Strings;


public class RSSParser {


	/** Parse an RSS playlist for feeditems. **/
	public static function parse(dat:XML):Array {
		var arr:Array = new Array();
		for each (var i:XML in dat.children()) {
			if (i.localName() == 'channel') {
				for each (var j:XML in i.children()) {
					if(j.name() == 'item') {
						arr.push(RSSParser.parseItem(j));
					}
				}
			}
		}
		return arr;
	};


	/** Translate RSS item to playlist item. **/
	public static function parseItem(obj:XML):Object {
		var itm:Object =  new Object();
		for each (var i:XML in obj.children()) {
			switch(i.localName()) {
				case 'duration':
					itm['duration'] = Strings.seconds(i.text().toString());
					break;
				case 'enclosure':
					itm['file'] = i.@url.toString();
					break;
				case 'title':
					itm['title'] = i.text().toString();
					break;
				case 'pubDate':
					itm['date'] = i.text().toString();
					break;
				case 'keywords':
					itm['tags'] = i.text().toString();
					break;
				case 'description':
					itm['description'] = i.text().toString();
					break;
				case 'summary':
					itm['description'] = i.text().toString();
					break;
				case 'link':
					itm['link'] = i.text().toString();
					break;
				case 'author':
					itm['author'] = i.text().toString();
					break;
				case 'group':
					itm = MediaParser.parseGroup(i,itm);
					break;
			}
		}
		itm = JWParser.parseEntry(obj,itm);
		itm = MediaParser.parseGroup(obj,itm);
		return itm;
	};


}


}