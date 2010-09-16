/**
 * Utility methods for the JW Player.
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _animations = {};
	
	jwplayer.html5.utils.animations = function() {
	};
	
	jwplayer.html5.utils.animations.transform = function(domelement, value) {
		domelement.style.webkitTransform = value;
		domelement.style.MozTransform = value;
		domelement.style.OTransform = value;
	};
	
	jwplayer.html5.utils.animations.transformOrigin = function(domelement, value) {
		domelement.style.webkitTransformOrigin = value;
		domelement.style.MozTransformOrigin = value;
		domelement.style.OTransformOrigin = value;
	};
	
	jwplayer.html5.utils.animations.rotate = function(domelement, deg) {
		jwplayer.html5.utils.animations.transform(domelement, ["rotate(", deg, "deg)"].join(""));
	};
	
	jwplayer.html5.utils.fadeTo = function(domelement, endAlpha, time, startAlpha, startTime) {
		// Interrupting
		if (_animations[domelement] != startTime && startTime !== undefined) {
			return;
		}
		var currentTime = new Date().getTime();
		if (startAlpha === undefined) {
			startAlpha = domelement.style.opacity === "" ? 1 : domelement.style.opacity;
		}
		if (typeof startAlpha == "string") {
			startAlpha = parseInt(startAlpha, 10);
		}
		if (domelement.style.opacity == endAlpha && domelement.style.opacity !== "" && startTime !== undefined) {
			return;
		}
		if (startTime === undefined) {
			startTime = currentTime;
			_animations[domelement] = startTime;
		}
		var percentTime = (currentTime - startTime) / (time * 1000);
		percentTime = percentTime > 1 ? 1 : percentTime;
		var delta = endAlpha - startAlpha;
		var alpha = startAlpha + (percentTime * delta);
		if (alpha > 1) {
			alpha = 1;
		} else if (alpha < 0) {
			alpha = 0;
		}
		domelement.style.opacity = alpha;
		setTimeout(function() {
			jwplayer.html5.utils.fadeTo(domelement, endAlpha, time, startAlpha, startTime);
		}, 10);
	};
	
})(jwplayer);
