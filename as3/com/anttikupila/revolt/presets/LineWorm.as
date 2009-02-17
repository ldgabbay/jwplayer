﻿package com.anttikupila.revolt.presets {
	import com.anttikupila.revolt.presets.Preset;
	import com.anttikupila.revolt.drawers.*;
	import com.anttikupila.revolt.effects.*;
	import com.anttikupila.revolt.scalers.*;
	import flash.display.BitmapData;
	
	public class LineWorm extends Preset {
		function LineWorm() {
			super();
			fourier = true;
			drawers = new Array(new CenterLine());
			effects = new Array(new Perlin(8,6), new Blur(2,2), new Tint(0x000000, 0.05));
			scalers = new Array(new ZoomIn(150));
		}
		
		override public function toString():String {
			return "Line worm";
		}
	}
}