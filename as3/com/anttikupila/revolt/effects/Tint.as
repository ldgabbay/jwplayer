﻿package com.anttikupila.revolt.effects {
	import flash.display.BitmapData;
	import flash.filters.ColorMatrixFilter;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.geom.Matrix;
	import com.anttikupila.revolt.effects.Effect;
	
	public class Tint extends Effect {
		// RGB to Luminance conversion constants as found on
		// Charles A. Poynton's colorspace-faq:
		// http://www.faqs.org/faqs/graphics/colorspace-faq/
		
		private static var r_lum:Number = 0.212671;
		private static var g_lum:Number = 0.715160;
		private static var b_lum:Number = 0.072169;
		private var colorMatrix:Array;
		
		
		function Tint(rgb:Number, amount:Number) {
			var r:Number = ( ( rgb >> 16 ) & 0xff ) / 255;
			var g:Number = ( ( rgb >> 8  ) & 0xff ) / 255;
			var b:Number = (   rgb         & 0xff ) / 255;
			
			if (!amount) amount = 1;
			var inv_amount:Number = 1 - amount;
			
			
			colorMatrix =  new Array( inv_amount + amount*r*r_lum, amount*r*g_lum,  amount*r*b_lum, 0, 0,
									 amount*g*r_lum, inv_amount + amount*g*g_lum, amount*g*b_lum, 0, 0,
									 amount*b*r_lum,amount*b*g_lum, inv_amount + amount*b*b_lum, 0, 0,
									 0 , 0 , 0 , 1, 0 );
			
		}
		
		override public function applyFX(gfx:BitmapData):void {
			var c:ColorMatrixFilter = new ColorMatrixFilter(colorMatrix);
			gfx.applyFilter(gfx, new Rectangle(0, 0, gfx.width, gfx.height), new Point(0, 0), c);
		}
	}
}