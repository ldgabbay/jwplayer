/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($){

    $.fn.jwplayerModel = function(options){
        return this.each(function(){
            $(this).jwplayerParse(options);
        });
    };
    
})(jQuery);
