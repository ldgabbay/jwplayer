﻿package com.anttikupila.revolt.presets {
	import com.anttikupila.revolt.presets.LineNoFourier;
	import com.anttikupila.revolt.drawers.SmoothLine;
	import com.anttikupila.revolt.scalers.ZoomIn;
	import com.anttikupila.revolt.effects.*;
	
	public class LineSmooth extends LineNoFourier {
		
		function LineSmooth() {
			super();
			drawers = new Array(new SmoothLine());
			scalers = new Array(new ZoomIn());
			effects = new Array(new Perlin(10,2), new Blur(3,3), new Tint(0x000000, 0.05));
		}
		
		override public function toString():String {
			return "Smooth line without fourier transformation";
		}
	}
}