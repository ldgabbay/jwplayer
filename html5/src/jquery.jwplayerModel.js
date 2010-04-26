/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {
	var jwplayerid = 1;
	
	var modelParams ={
		volume: 100,
		fullscreen: false,
		mute: false,
		width: 480,
		height: 320,
		duration: 0
	};
	
	function createModel(){
		return {
			config: {},
			sources: {},
			listeners: {},
			state: $.fn.jwplayer.states.IDLE,
			source: 0,
			buffer: 0
		};
	}

	
	$.fn.jwplayerModel = function(domElement, options) {
		var model = createModel();
		model.config = $.fn.jwplayerParse(domElement[0], options);
		if (model.config.id === undefined) {
			model.config.id = "jwplayer_"+jwplayerid++;
		}
		model.sources = model.config.sources;
		delete model.config.sources;
		model.domelement = domElement;
		for (var modelParam in modelParams) {
			if (model.config[modelParam] !== undefined) {
				model[modelParam] = model.config[modelParam];
			} else {
				model[modelParam] = modelParams[modelParam];
			}
		}
		return model;
	};
	
	$.fn.jwplayerModel.setActiveMediaProvider = function(player) {
		var source, sourceIndex;
		for (sourceIndex in player.model.sources) {
			source = player.model.sources[sourceIndex];
			if (source.type === undefined) {
				source.type = 'video/' + $.fn.jwplayerUtils.extension(source.file) + ';';
			}
			if ($.fn.jwplayerUtils.supportsType(source.type)) {
				player.model.source = sourceIndex
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
