package com.longtailvideo.jwplayer.events {
	import com.longtailvideo.jwplayer.player.Player;
	
	import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.system.Capabilities;

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
		 * <p>The properties of the event object have the following values:</p>
	     * <table class="innertable">
     	 *		<tr><th>Property</th><th>Value</th></tr>
	     *		<tr><td><code>id</code></td><td>ID of the player in the HTML DOM. Used by javascript to reference the player.</td></tr>
	     *		<tr><td><code>client</code></td><td>A string representing the client the player runs in (e.g. FLASH WIN 9,0,115,0).</td></tr>
  	     * 		<tr><td><code>version</code></td><td>A string representing the major version, minor version and revision number of the player (e.g. 5.0.395).</td></tr>
  	     * </table>
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
	     * <table class="innertable">
     	 *		<tr><th>Property</th><th>Value</th></tr>
	     *		<tr><td><code>id</code></td><td>ID of the player in the HTML DOM. Used by javascript to reference the player.</td></tr>
	     *		<tr><td><code>client</code></td><td>A string representing the client the player runs in (e.g. FLASH WIN 9,0,115,0).</td></tr>
  	     * 		<tr><td><code>version</code></td><td>A string representing the major version, minor version and revision number of the player (e.g. 5.0.395).</td></tr>
  	     * 		<tr><td><code>message</code></td><td>Message explaining the cause of the error</td></tr>
  	     * </table>
  	     * 
		 * @see com.longtailvideo.jwplayer.player.Player
		 * @eventType jwplayerError
		 */
		public static var JWPLAYER_ERROR:String = "jwplayerError";

		public var id:String;
		public var client:String;
		public var version:String;
		
		public var message:String

		public function PlayerEvent(type:String, msg:String=undefined) {
			super(type, false, false);

			try {
				if (ExternalInterface.available) {
					this.id = ExternalInterface.objectID;
				}
				this.client = "FLASH" + Capabilities.version;
				this.version = Player.version;
			} catch (e:Error) {}
			this.message = msg;
		}
		
	}
}