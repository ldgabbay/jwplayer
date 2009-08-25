package tests.utils {
	import com.jeroenwijering.events.PluginInterface;
	import com.longtailvideo.jwplayer.utils.AssetLoader;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.utils.describeType;
	
	import org.flexunit.Assert;
	import org.flexunit.async.Async;

	public class AssetLoaderTest {
		private var loader:AssetLoader;

		[Before]
		public function setup():void {
			loader = new AssetLoader();
		}
		
		[Test(async,timeout="3000")]
		public function testLoadSWF():void {
			Async.handleEvent(this, loader, Event.COMPLETE, testLoadSWFComplete);
			loader.load("http://plugins.longtailvideo.com/viral.swf", Sprite);
		}
		
		private function testLoadSWFComplete(evt:Event, params:*):void {
			var eventLoader:AssetLoader = evt.target as AssetLoader;
			Assert.assertEquals(loader, eventLoader);
			Assert.assertNotNull(eventLoader.loadedObject);
			Assert.assertNotNull(eventLoader.loadedObject as Sprite);
		}
			

	}
}