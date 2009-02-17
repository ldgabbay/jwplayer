﻿package com.anttikupila.revolt.presets {
	import com.anttikupila.revolt.presets.Preset;
	import com.anttikupila.revolt.drawers.*;
	import com.anttikupila.revolt.effects.*;
	import com.anttikupila.revolt.scalers.*;
	
	public class LineFourier extends Preset {
		function LineFourier() {
			super();
			fourier = true;
			drawers = new Array(new Line());
			effects = new Array(new Blur(), new Perlin(5,2));
			scalers = new Array(new ZoomOut());
		}
		
		override public function toString():String {
			return "Line with fourier transformation";
		}
	}
}