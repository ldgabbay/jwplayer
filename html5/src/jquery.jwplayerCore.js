/**
 * Core component of the JW Player (initialization, API).
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	/** Hooking the controlbar up to jQuery. **/
	$.fn.jwplayer = function(options) {
		return this.each(function() {
			$(this).css("display", "none");
			$(this).jwplayerModel(options);
			$(this).jwplayerView();
			$.fn.jwplayerModel.setActiveMediaProvider($(this));
		});
	};
	
	
	/** Map with all players on the page. **/
	$.fn.jwplayer.players = {};
	
	
	/** Map with config for the controlbar plugin. **/
	$.fn.jwplayer.defaults = {
		autostart: false,
		buffer: 0,
		duration: 0,
		file: undefined,
		height: 300,
		image: undefined,
		left: 0,
		position: 0,
		skin: '../../skins/five/five.xml',
		state: 'idle',
		top: 0,
		volume: 100,
		width: 400,
		source: 0
	};
	
	
	/** Start playback or resume. **/
	$.fn.jwplayer.play = function(player) {
		return $.fn.jwplayerController.play(player);
	};
	
	/** Switch the pause state of the player. **/
	$.fn.jwplayer.pause = function(player) {
		return $.fn.jwplayerController.pause(player);
	};
	
	
	/** Seek to a position in the video. **/
	$.fn.jwplayer.seek = function(player, position) {
		return $.fn.jwplayerController.seek(player, position);
	};
	
	
	/** Stop playback and loading of the video. **/
	$.fn.jwplayer.stop = function(player) {
		return $.fn.jwplayerController.stop(player);
	};
	
	
	/** Change the video's volume level. **/
	$.fn.jwplayer.volume = function(player, volume) {
		return $.fn.jwplayerController.volume(player, volume);
	};
	
	/** Switch the mute state of the player. **/
	$.fn.jwplayer.mute = function(player, state) {
		return $.fn.jwplayerController.mute(player, state);
	};
	
	/** Jumping the player to/from fullscreen. **/
	$.fn.jwplayer.fullscreen = function(player, state) {
		return $.fn.jwplayerController.fullscreen(player, state);
	};
	
	/** Add an event listener. **/
	$.fn.jwplayer.addEventListener = function(player, event, listener) {
		$(player).bind(event, listener);
	};
	
	
	/** Remove an event listener. **/
	$.fn.jwplayer.removeEventListener = function(player, event, listener) {
		$(player).unbind(event, listener);
	};
	
	/** Automatically initializes the player for all <video> tags with the JWPlayer class. **/
	$(document).ready(function() {
		$("video.jwplayer").jwplayer();
	});
	
})(jQuery);
