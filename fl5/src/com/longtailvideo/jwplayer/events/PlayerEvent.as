package com.longtailvideo.jwplayer.events {
	import flash.events.Event;

	/**
	 * Event class thrown by the Player
	 * 
	 * @see com.longtailvideo.jwplayer.player.Player
	 * @author Pablo Schklowsky
	 */
	public class PlayerEvent extends Event {
		
		/**
		 * The PlayerEvent.JWPLAYER_READY constant defines the value of the
		 * <code>type</code> property of the event object
		 * for a <code>jwplayerReady</code> event.
		 *
		 * @see com.longtailvideo.jwplayer.player.Player
		 * @eventType jwplayerReady
		 */
		public static var JWPLAYER_READY:String = "jwplayerReady";

		/**
		 * The PlayerEvent.JWPLAYER_ERROR constant defines the value of the
		 * <code>type</code> property of the event object
		 * for a <code>jwplayerError</code> event.
		 *
		 * @see com.longtailvideo.jwplayer.player.Player
		 * @eventType jwplayerError
		 */
		public static var JWPLAYER_ERROR:String = "jwplayerError";

		public function PlayerEvent(type:String) {
			super(type, false, false);
		}
		
	}
}