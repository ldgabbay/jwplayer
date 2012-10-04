package com.longtailvideo.jwplayer.view {

	import com.longtailvideo.jwplayer.events.GlobalEventDispatcher;
	import com.longtailvideo.jwplayer.events.ViewEvent;
	import com.longtailvideo.jwplayer.player.IPlayer;
	import com.longtailvideo.jwplayer.player.PlayerVersion;
	import com.longtailvideo.jwplayer.utils.Configger;
	import com.longtailvideo.jwplayer.utils.Logger;
	import com.longtailvideo.jwplayer.utils.Stretcher;
	
	import flash.display.MovieClip;
	import flash.events.ContextMenuEvent;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	import flash.system.Capabilities;
	import flash.ui.ContextMenu;
	import flash.ui.ContextMenuItem;

	/**
	 * Implement a rightclick menu with "fullscreen", "stretching" and "about" options.
	 **/
	public class RightclickMenu extends GlobalEventDispatcher {

		/** Player API. **/
		protected var _player:IPlayer;
		/** Context menu **/
		protected var context:ContextMenu;

		/** About JW Player menu item **/
		protected var about:ContextMenuItem;
		/** Debug menu item **/
		protected var debug:ContextMenuItem;
		/** Link flag for the menu click handler **/
		protected var linkFlag:String;
	
		/** Constructor. **/
		public function RightclickMenu(player:IPlayer, clip:MovieClip) {
			_player = player;
			context = new ContextMenu();
			context.hideBuiltInItems();
			clip.contextMenu = context;
			initializeMenu();
		}

		/** Add an item to the contextmenu. **/
		protected function addItem(itm:ContextMenuItem, fcn:Function):void {
			itm.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, fcn);
			itm.separatorBefore = true;
			context.customItems.push(itm);
		}

		/** Initialize the rightclick menu. **/
		public function initializeMenu():void {
			setAboutText();
			addItem(about, aboutHandler);
			if (Capabilities.isDebugger == true || _player.config.debug != Logger.NONE) {
				debug = new ContextMenuItem('Logging to ' + _player.config.debug + '...');
				addItem(debug, debugHandler);
			}
		}
		
		protected function setAboutText():void {
			var edition:String = _getEdition();
			if (edition == "free" || edition.length == 0) {
				about = new ContextMenuItem('About JW Player ' + _player.version + '...');
				linkFlag = "f";
			}
			else {
				var version:String = PlayerVersion.version;
				linkFlag = _getLinkFlag(edition);
				edition = edition.charAt(0).toUpperCase() + edition.substr(1);
				version += " (" + edition + " edition)";
				about = new ContextMenuItem('About JW Player ' + version + '...');
			}
		}
		
		private function _getEdition():String {
			var edition:String = "";
			try {
				edition = _player['edition'];
			}
			catch(error:Error) {
				edition = "";
			}
			return edition;
		}
		
		private function _getLinkFlag(edition:String):String {
			switch (edition.toLowerCase()) {
				case "pro": 
					return "p";
				case "premium": 
					return "r";
				case "ads":
					return "a";
				default: 
					return "f";
			}
		}

		/** jump to the about page. **/
		protected function aboutHandler(evt:ContextMenuEvent):void {
			navigateToURL(new URLRequest('http://www.longtailvideo.com/jwpabout/?a=right-click&v='+PlayerVersion.version+linkFlag+'&m=flash'), '_top');
		}

		/** change the debug system. **/
		protected function debugHandler(evt:ContextMenuEvent):void {
			var arr:Array = new Array(Logger.NONE, Logger.CONSOLE, Logger.TRACE);
			var idx:Number = arr.indexOf(_player.config.debug);
			idx = (idx == arr.length - 1) ? 0 : idx + 1;
			debug.caption = 'Logging to ' + arr[idx] + '...';
			setCookie('debug', arr[idx]);
			_player.config.debug = arr[idx];
		}

		protected function setCookie(name:String, value:*):void {
			Configger.saveCookie(name, value);			
		}

	}

}