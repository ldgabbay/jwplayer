﻿package com.anttikupila.revolt.presets {
	import com.anttikupila.revolt.presets.Preset;
	import com.anttikupila.revolt.drawers.*;
	import com.anttikupila.revolt.effects.*;
	import com.anttikupila.revolt.scalers.*;
	
	public class Tunnel extends Preset {
		
		function Tunnel() {
			super();
			drawers = new Array(new TunnelDrawer());
			scalers = new Array(new ZoomIn());
			var perlin:Perlin = new Perlin(10,10);
			perlin.interval = 3748;
			effects = new Array(perlin);
		}
		
		override public function toString():String {
			return "Smooth line without fourier transformation";
		}
	}
}