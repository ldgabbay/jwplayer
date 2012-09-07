package com.longtailvideo.jwplayer.controller {
	import com.longtailvideo.jwplayer.utils.AssetLoader;
	import com.longtailvideo.jwplayer.utils.RootReference;
	import com.longtailvideo.jwplayer.utils.Strings;
	
	import flash.display.DisplayObject;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;
	
	import mx.core.IFlexDisplayObject;

	/**
	 * Sent when the plugin loader has loaded all valid plugins.
	 *
	 * @eventType flash.events.Event.COMPLETE
	 */
	[Event(name="complete", type = "flash.events.Event")]

	/**
	 * Sent when an error occured during plugin loading.
	 *
	 * @eventType flash.events.ErrorEvent.ERROR
	 */
	[Event(name="error", type = "flash.events.ErrorEvent")]


	/**
	 * Loads plugins during player startup 
	 *  
	 * @author Pablo Schklowsky
	 */	
	public class PluginLoader extends EventDispatcher {
		
		public var plugins:Object;

		private var loaders:Dictionary;
		
		// So plugins can embed assets
		private var flexDisplay:IFlexDisplayObject;
		
		protected function get pluginRepository():String {
			try {
				if (RootReference.root.loaderInfo.url.indexOf("https://") == 0) {
					return "https://secureplugins.longtailvideo.com/"; 
				}
			} catch(e:Error) {}
			return "http://plugins.longtailvideo.com/"; 
		}
		
		public function PluginLoader() {
			loaders = new Dictionary();
			plugins = {};
		}
		
		public function loadPlugins(pluginList:String):void {
			if (pluginList) {
				var plugins:Array = pluginList.replace(/\s*/g,"").split(",");
				for each(var plugin:String in plugins) {
					if (plugin){
						loadLocalPlugin(plugin); //Testing	
					}
				}
			} else {
				dispatchEvent(new Event(Event.COMPLETE));
			}
		}
		
		private function loadLocalPlugin(plugin:String):void {
			if (plugin.indexOf("/") >= 0) {
				var loader:AssetLoader = new AssetLoader();
				loader.addEventListener(Event.COMPLETE, loadSuccess);
				loader.addEventListener(ErrorEvent.ERROR, pluginLoadFailed);
				loaders[loader] = plugin;
				loader.load(plugin);
			} else {
				loadV5Plugin(plugin);
			}
		}
		
		private function loadV5Plugin(plugin:String):void {
			var loader:AssetLoader = new AssetLoader();
			loader.addEventListener(Event.COMPLETE, loadSuccess);
			loader.addEventListener(ErrorEvent.ERROR, pluginLoadFailed);			
			
			var split:Array = plugin.substr(plugin.lastIndexOf("/")+1).replace(/(.*)\.swf$/i, "$1").split("-");
			var name:String = split[0];
			var version:String = split.length > 1 ? ("-" + split[1]) : "";
			var url:String = pluginRepository + "6/" + name + "/" + name + version + ".swf";
			
			loaders[loader] = plugin;
			loader.load(url);
		}
		
		private function pluginLoadFailed(evt:ErrorEvent):void {
			dispatchEvent(new ErrorEvent(ErrorEvent.ERROR, false, false, "Error loading plugin: Plugin file not found"));
		}
		
		private function loadSuccess(evt:Event):void {
			var loader:AssetLoader = evt.target as AssetLoader;
			var url:String = loaders[loader] as String;
			var pluginId:String = url.substr(url.lastIndexOf("/")+1).replace(/(.*)\.swf$/i, "$1").split("-")[0];
			plugins[pluginId] = loader.loadedObject as DisplayObject;
			loader.removeEventListener(Event.COMPLETE, loadSuccess);
			delete loaders[loader];
			checkComplete();
		}
		
		private function checkComplete():void {
			var waiting:Boolean = false;
			for each(var remaining:String in loaders) {
				// Still waiting for some plugins to load
				waiting = true;
				continue;
			}
			
			if (!waiting) {
				dispatchEvent(new Event(Event.COMPLETE));
			}
		}

		
	}
}