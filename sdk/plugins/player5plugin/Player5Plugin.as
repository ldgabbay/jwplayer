package {
	import com.longtailvideo.jwplayer.player.IPlayer;
	import com.longtailvideo.jwplayer.plugins.IPlugin;
	import com.longtailvideo.jwplayer.plugins.PluginConfig;
	
	import flash.display.Sprite;
	import flash.events.MouseEvent;
	
	public class Player5Plugin extends Sprite implements IPlugin {
		private var api:IPlayer;

		/** Let the player know what the name of your plugin is. **/
		public function get id():String { return "player5plugin"; }
		
		/**
		 * Called by the player after the plugin has been created.
		 *  
		 * @param player A reference to the player's API
		 * @param config The plugin's configuration parameters.
		 */
		public function initPlugin(player:IPlayer, config:PluginConfig):void {
			api = player;
			
			var clickButton:Sprite = new Sprite();
			clickButton.graphics.beginFill(0x003388, 1);
			clickButton.graphics.drawCircle(0, 0, 10);
			clickButton.graphics.endFill();
			clickButton.x = 10;
			clickButton.y = 10;
			clickButton.buttonMode = true;
			clickButton.addEventListener(MouseEvent.CLICK, buttonClicked);
			addChild(clickButton);
			
		}
		
		/**
		 * When the player resizes itself, it sets the x/y coordinates of all components and plugins.  
		 * Then it calls resize() on each plugin, which is then expected to lay itself out within 
		 * the requested boundaries.  Plugins whose position and size are not set by flashvar configuration
		 * receive the video display area's dimensions in resize().
		 *  
		 * @param width Width of the plugin's layout area, in pixels 
		 * @param height Height of the plugin's layout area, in pixels
		 */		
		public function resize(wid:Number, hei:Number):void {
			this.graphics.beginFill(0x990000, 0.5);
			this.graphics.drawRect(0, 0, wid, hei);
			this.graphics.endFill();
			
			
		}

		/**
		 * Mouse click handler 
		 */
		private function buttonClicked(event:MouseEvent):void {
			// Toggle the mute state of the player.
			api.mute = !api.mute;
		}
		
	}
}