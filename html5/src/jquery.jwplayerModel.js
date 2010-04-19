/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($) {

	$.fn.jwplayerModel = function(options) {
		return this.each(function() {
			$(this).jwplayerParse(options);
		});
	};
	
	$.fn.jwplayerModel.setActiveMediaProvider = function(player) {
		var source, sourceIndex;
		var model = player.data("model");
		for (sourceIndex in model.sources) {
			source = model.sources[sourceIndex];
			if (source.type === undefined) {
				source.type = 'video/' + $.fn.jwplayerUtils.extension(source.file) + ';';
			}
			if ($.fn.jwplayerUtils.supportsType(source.type)) {
				model.source = sourceIndex;
				player.jwplayerMediaVideo();
				return true;
			}
		}
		if ($.fn.jwplayerUtils.supportsFlash && model.state != 'playing') {
			for (sourceIndex in model.sources) {
				source = model.sources[sourceIndex];
				if ($.fn.jwplayerUtils.flashCanPlay(source.file)) {
					model.source = sourceIndex;
					player.jwplayerMediaFlash();
					return true;
				}
			}
		}
		return false;
	};
	
})(jQuery);
