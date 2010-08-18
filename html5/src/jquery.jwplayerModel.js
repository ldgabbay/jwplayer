/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	var jwplayerid = 1;
	
	var modelParams = {
		volume: 100,
		fullscreen: false,
		mute: false,
		start: 0,
		width: 480,
		height: 320,
		duration: 0
	};
	
	function createModel() {
		return {
			sources: {},
			state: $.fn.jwplayer.states.IDLE,
			source: 0,
			buffer: 0
		};
	}
	
	
	$.fn.jwplayerModel = function(domElement, options) {
		var model = createModel();
		model.config = $.extend(true, {}, $.fn.jwplayer.defaults, $.fn.jwplayerParse(domElement[0]), options);
		if ($.fn.jwplayerUtils.isNull(model.config.id)) {
			model.config.id = "jwplayer_" + jwplayerid++;
		}
		model.sources = model.config.sources;
		delete model.config.sources;
		model.domelement = domElement;
		for (var modelParam in modelParams) {
			if (!$.fn.jwplayerUtils.isNull(model.config[modelParam])) {
				model[modelParam] = model.config[modelParam];
			} else {
				model[modelParam] = modelParams[modelParam];
			}
		}
		//model = $.extend(true, {}, , model);
		return model;
	};
	
	$.fn.jwplayerModel.setActiveMediaProvider = function(player) {
		var source, sourceIndex;
		for (sourceIndex in player.model.sources) {
			source = player.model.sources[sourceIndex];
			if (source.type === undefined) {
				var extension = $.fn.jwplayerUtils.extension(source.file);
				if (extension == "ogv") {
					extension = "ogg";
				}
				source.type = 'video/' + extension + ';';
			}
			if ($.fn.jwplayerUtils.supportsType(source.type)) {
				player.model.source = sourceIndex;
				$.fn.jwplayerMediaVideo(player);
				return true;
			}
		}
		if ($.fn.jwplayerUtils.supportsFlash && player.state != $.fn.jwplayer.states.PLAYING) {
			for (sourceIndex in player.model.sources) {
				source = player.model.sources[sourceIndex];
				if ($.fn.jwplayerUtils.flashCanPlay(source.file)) {
					player.model.source = sourceIndex;
					$.fn.jwplayerMediaFlash(player);
					return true;
				}
			}
		}
		return false;
	};
	
})(jQuery);
