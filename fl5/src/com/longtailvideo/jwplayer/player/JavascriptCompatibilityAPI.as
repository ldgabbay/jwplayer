package com.longtailvideo.jwplayer.player {

	import com.jeroenwijering.events.ControllerEvent;
	import com.jeroenwijering.events.ModelEvent;
	import com.jeroenwijering.events.ViewEvent;
	import com.longtailvideo.jwplayer.events.PlayerEvent;
	import com.longtailvideo.jwplayer.utils.Logger;
	
	import flash.external.ExternalInterface;


	public class JavascriptCompatibilityAPI extends JavascriptAPI {
		private var _emu:PlayerV4Emulation;

		private var controllerCallbacks:Object;		
		private var modelCallbacks:Object;		
		private var viewCallbacks:Object;		

		public function JavascriptCompatibilityAPI(player:IPlayer) {
			controllerCallbacks = {};
			modelCallbacks = {};
			viewCallbacks = {};

			_emu = PlayerV4Emulation.getInstance(player);
			super(player);
		}
		
		override protected function setupJSListeners():void {
			super.setupJSListeners();

			try {
				ExternalInterface.addCallback("addControllerListener",addJSControllerListener);
				ExternalInterface.addCallback("addModelListener",addJSModelListener);
				ExternalInterface.addCallback("addViewListener",addJSViewListener);
				ExternalInterface.addCallback("removeControllerListener",removeJSControllerListener);
				ExternalInterface.addCallback("removeModelListener",removeJSModelListener);
				ExternalInterface.addCallback("removeViewListener",removeJSViewListener);
				ExternalInterface.addCallback("getConfig",getConfig);
				ExternalInterface.addCallback("getPlaylist",getPlaylist);
				ExternalInterface.addCallback("getPluginConfig",getJSPluginConfig);
				ExternalInterface.addCallback("loadPlugin",loadPlugin);
				ExternalInterface.addCallback("sendEvent",sendEvent);
			} catch(e:Error) {
				Logger.log("Could not start up JavasScript API: " + e.message);
			}

		}
		
		private function addJSControllerListener(type:String,callback:String):Boolean {
			type = type.toUpperCase();
			if (!controllerCallbacks.hasOwnProperty(type)) { controllerCallbacks[type] = []; }
			if ( (controllerCallbacks[type] as Array).indexOf(callback) < 0) {
				(controllerCallbacks[type] as Array).push(callback);
				_emu.addControllerListener(type, forwardControllerEvents);
			}
			return true;
		}
		
		private function removeJSControllerListener(type:String,callback:String):Boolean {
			type = type.toUpperCase();
			var listeners:Array = (controllerCallbacks[type] as Array);
			var idx:Number = listeners ? listeners.indexOf(callback) : -1; 
			if (idx >= 0) {
				listeners.splice(idx, 1);
				_emu.removeControllerListener(type.toUpperCase(), forwardControllerEvents);
				return true;
			} 
			return false;
		}


		private function addJSModelListener(type:String,callback:String):Boolean {
			type = type.toUpperCase();
			if (!modelCallbacks.hasOwnProperty(type)) { modelCallbacks[type] = []; }
			if ( (modelCallbacks[type] as Array).indexOf(callback) < 0) {
				(modelCallbacks[type] as Array).push(callback);
				_emu.addModelListener(type, forwardModelEvents);
			}
			return true;
		}
		
		private function removeJSModelListener(type:String,callback:String):Boolean {
			type = type.toUpperCase();
			var listeners:Array = (modelCallbacks[type] as Array);
			var idx:Number = listeners ? listeners.indexOf(callback) : -1; 
			if (idx >= 0) {
				listeners.splice(idx, 1);
				_emu.removeModelListener(type.toUpperCase(), forwardModelEvents);
				return true;
			} 
			return false;
		}


		private function addJSViewListener(type:String,callback:String):Boolean {
			type = type.toUpperCase();
			if (!viewCallbacks.hasOwnProperty(type)) { viewCallbacks[type] = []; }
			if ( (viewCallbacks[type] as Array).indexOf(callback) < 0) {
				(viewCallbacks[type] as Array).push(callback);
				_emu.addViewListener(type.toUpperCase(), forwardViewEvents);
			}
			return true;
		}
		
		private function removeJSViewListener(type:String,callback:String):Boolean {
			type = type.toUpperCase();
			var listeners:Array = (viewCallbacks[type] as Array);
			var idx:Number = listeners ? listeners.indexOf(callback) : -1; 
			if (idx >= 0) {
				listeners.splice(idx, 1);
				_emu.removeViewListener(type.toUpperCase(), forwardViewEvents);
				return true;
			} 
			return false;
		}

		private function getConfig():Object {
			return stripDots(_emu.config);
		}
		
		private function stripDots(obj:Object):Object {
			var newObj:Object = (obj is Array) ? new Array() : new Object();
			for (var i:String in obj) {
				if (i.indexOf(".") < 0) {
					if (typeof(obj[i]) == "object") {
						newObj[i] = stripDots(obj[i]);
					} else {
						newObj[i] = obj[i];
					}
				}
			}
			return newObj;
		}
		
		private function getPlaylist():Object {
			var arry:Array = [];
			for each (var obj:Object in _emu.playlist) {
				arry.push(stripDots(obj));
			}
			return arry;
		}
		
		private function getJSPluginConfig(pluginId:String):Object {
			return _player.config.pluginConfig(pluginId);
		}
		
		private function loadPlugin(plugin:String):Object {
			return {error:'This function is no longer supported.'}
		}
		
		private function sendEvent(type:String, data:Object = null):void {
			_emu.sendEvent(type.toUpperCase(), data);
		}
		
		private function forwardControllerEvents(evt:ControllerEvent):void {
			if (controllerCallbacks.hasOwnProperty(evt.type)) {
				for each (var callback:String in controllerCallbacks[evt.type]) {
					if (ExternalInterface.available) {
						ExternalInterface.call(callback, stripDots(evt.data));
					}
				}
			}
		}

		private function forwardModelEvents(evt:ModelEvent):void {
			if (modelCallbacks.hasOwnProperty(evt.type)) {
				for each (var callback:String in modelCallbacks[evt.type]) {
					if (ExternalInterface.available) {
						ExternalInterface.call(callback, stripDots(evt.data));
					}
				}
			}
		}

		private function forwardViewEvents(evt:ViewEvent):void {
			if (viewCallbacks.hasOwnProperty(evt.type)) {
				for each (var callback:String in viewCallbacks[evt.type]) {
					if (ExternalInterface.available) {
						ExternalInterface.call(callback, stripDots(evt.data));
					}
				}
			}
		}

	}

}