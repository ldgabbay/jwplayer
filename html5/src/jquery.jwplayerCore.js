/**
 * Core component of the JW Player (initialization, API).
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-05
 */

(function($){

/** Hooking the controlbar up to jQuery. **/
$.fn.jwplayer = function(options) {
	return this.each(function() {
		var domConfig = $.fn.jwplayerUtilsParsersDOMElementParser.parse(this);
		var model = $.extend(true, {}, $.fn.jwplayer.defaults, options, domConfig);
		if ($.fn.jwplayerUtils.supportsFlash){
			$.fn.jwplayerView.embedFlash(this, model);
		}
		// loadSkin(options);
	});
}

/** Map with all players on the page. **/
$.fn.jwplayer.players = {};


/** Map with config for the controlbar plugin. **/
$.fn.jwplayer.defaults = {
	autostart:false,
	buffer:0,
	duration:0,
	file:undefined,
	height:300,
	image:undefined,
	left:0,
	position:0,
	skin:'../../skins/five/five.xml',
	state:'idle',
	top:0,
	volume:100,
	width:400
};


/** Jumping the player to/from fullscreen. **/
$.fn.jwplayer.fullscreen = function(player,state) {};


/** Switch the mute state of the player. **/
$.fn.jwplayer.mute = function(player,state) {};


/** Switch the pause state of the player. **/
$.fn.jwplayer.pause = function(player,state) {};


/** Seek to a position in the video. **/
$.fn.jwplayer.seek = function(player,position) {};


/** Stop playback and loading of the video. **/
$.fn.jwplayer.stop = function(player) {};


/** Change the video's volume level. **/
$.fn.jwplayer.volume = function(player,position) {};


/** Add an event listener. **/
$.fn.jwplayer.addEventListener = function(player,event,listener) {};


/** Remove an event listener. **/
$.fn.jwplayer.removeEventListener = function(player,event,listener) {};


/** Loading the images from the skin XML. **/
function loadSkin(config) {
	$.get(config.options['skin'],{},function(xml) {
		var arr = $('component',xml);
		for (var i=0; i<arr.length; i++) {
			if($(arr[i]).attr('name') == 'display') {
				var sts = $(arr[i]).find('setting');
				arr = $(arr[i]).find('element');
				break;
			}
		}
		for(var i=0; i<sts.length; i++) {
			config.options[$(sts[i]).attr('name')] = $(sts[i]).attr('value');
		}
		config.options['images'] = arr.length;
		for(var i=0; i<arr.length; i++) {
			loadImage(arr[i],config);
		}
	});
};


/** Load the data for a single element. **/
function loadImage(element,config) {
	var img = new Image();
	var nam = $(element).attr('name');
	var url = config.options['skin'].substr(0,config.options['skin'].lastIndexOf('/')) + '/controlbar/';
	$(img).error(function() { config.options['images']--; });
	$(img).load(function() {
		config.images[nam] = {
			height:this.height,
			width:this.width,
			src:this.src
		};
		config.options['images']--;
		if(config.options['images'] == 0) {
			buildElements(config);
			buildHandlers(config);
		}
	});
	img.src = url+$(element).attr('src');
};

/** Automatically initializes the player for all <video> tags with the JWPlayer class. **/
$(document).ready(function() {
   $("video.jwplayer").jwplayer();
 }); 

})(jQuery);