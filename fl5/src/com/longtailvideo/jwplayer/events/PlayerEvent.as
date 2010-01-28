package com.longtailvideo.jwplayer.events {
	import com.longtailvideo.jwplayer.player.PlayerVersion;
	
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
		 * The PlayerEvent.JWPLAYER_LOCKED constant defines the value of the
		 * <code>type</code> property of the event object
		 * for a <code>jwplayerLocked</code> event.
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
		 * @eventType jwplayerLocked
		 */
		public static var JWPLAYER_LOCKED:String = "jwplayerLocked";

		/**
		 * The PlayerEvent.JWPLAYER_UNLOCKED constant defines the value of the
		 * <code>type</code> property of the event object
		 * for a <code>jwplayerUnlocked</code> event.
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
		 * @eventType jwplayerUnlocked
		 */
		public static var JWPLAYER_UNLOCKED:String = "jwplayerUnlocked";
		
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
		
		public static var id:String;
		public static var client:String;
		public static var version:String;
		
		public var id:String;
		public var client:String;
		public var version:String;
		public var message:String;

		public function PlayerEvent(type:String, msg:String=undefined) {
			super(type, false, false);

			setupStaticVars();
			
			this.id = PlayerEvent.id;
			this.client = PlayerEvent.version;
			this.version = PlayerEvent.version;
			this.message = msg;
		}
		
		private function setupStaticVars():void {
			try {
				if (!PlayerEvent.id && ExternalInterface.available) {
					PlayerEvent.id = ExternalInterface.objectID;
				}
				if (!PlayerEvent.client) { PlayerEvent.client = "FLASH" + Capabilities.version; }
				if (!PlayerEvent.version) { PlayerEvent.version = PlayerVersion.version; }
			} catch (e:Error) {}
		}
		
		public override function toString():String {
			return '[PlayerEvent type="' + type + '"' 
				+ ' id="' + id + '"'
				+ ' client="' + client + '"'
				+ ' version="' + version + '"'
				+ ' message="' + message + '"'
				+ "]";
		} 
		
		public override function clone():Event {
			return new PlayerEvent(this.type, this.message);
		}
		
	}
}