/**
 * JW Player Flash Media component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-12
 */
(function($) {

	$.fn.jwplayerMediaFlash = function(options) {
		return this.each(function() {
			$(this).data("media", $.fn.jwplayerMediaFlash);
			$.fn.jwplayerView.embedFlash($(this), $(this).data("model"));
		});
	};
	
})(jQuery);
