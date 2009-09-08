package com.longtailvideo.jwplayer.view {
	import flash.display.DisplayObject;
	import flash.events.IEventDispatcher;

	/**
	 * Send when the skin is ready
	 *
	 * @eventType flash.events.Event.COMPLETE
	 */
	[Event(name="complete", type = "flash.events.Event")]

	/**
	 * Send when an error occurred loading the skin
	 *
	 * @eventType flash.events.ErrorEvent.ERROR
	 */
	[Event(name="error", type = "flash.events.ErrorEvent")]

	public interface ISkin extends IEventDispatcher {
		
		/**
		 * Instructs the skin to load its assets from a URL 
		 * @param url The URL from which to load the assets
		 */
		function load(url:String=null):void;
		
		/**
		 * Returns the availability of skin elements for a given component.
		 * 
		 * <p>e.g. "controlbar"</p>
		 * 
		 * @param component
		 * @return 
		 * 
		 */		
		function hasComponent(component:String):Boolean;

		/**
		 * 
		 * @param component
		 * @param element
		 * @return 
		 * 
		 */
		function getSkinElement(component:String, element:String):DisplayObject;
		
		/**
		 * Adds a skin element to the skin
		 * 
		 * @param name
		 * @param element
		 * @return 
		 * 
		 */
		function addSkinElement(component:String, element:DisplayObject, name:String=null):void;
		
		/**
		 * 
		 * @return 
		 * 
		 */		
		function getSkinProperties():SkinProperties;
	}
}