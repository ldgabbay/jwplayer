/**
* Manages playback of live streams through a subscription mechanism.
**/
package com.jeroenwijering.models {


import com.jeroenwijering.events.*;
import com.jeroenwijering.models.RTMPModel;
import com.jeroenwijering.player.Model;


import flash.events.*;
import flash.utils.*;


public class FCSubscribeModel extends RTMPModel {


	/** Interval ID for subscription pings. **/
	private var subscribe:Number;


	/** Constructor. **/
	public function FCSubscribeModel(mod:Model):void {
		super(mod);
	};


	/** Try subscribing. **/
	private function doSubscribe(id:String):void {
		connection.call("FCSubscribe",null,id);
	};


	/** Check metadata for subscription success/failure. **/
	override public function onData(dat:Object):void {
		if(dat.type == 'fcsubscribe') {
			if(dat.code == "NetStream.Play.StreamNotFound" ) {
				model.sendEvent(ModelEvent.ERROR,{message:"Subscription failed: "+item['file']});
			} else if(dat.code == "NetStream.Play.Start") {
				setStream();
			}
			clearInterval(subscribe);
		}
		super.onData(dat);
	};


	/** Receive NetStream status updates. **/
	override protected function statusHandler(evt:NetStatusEvent):void {
		if (evt.info.code == 'NetConnection.Connect.Success') {
			model.sendEvent(ModelEvent.META,{info:evt.info.code});
			subscribe = setInterval(doSubscribe,1000,getID(item['file']));
		} else {
			super.statusHandler(evt);
		}
	};


};


}