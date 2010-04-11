/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($){

    var embedString = "<embed %elementvars% src='src/jquery.jwplayer.swf' allowfullscreen='true' allowscriptaccess='always' flashvars='%flashvars%' />";
    var objectString = "<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' %elementvars%'> <param name='movie' value='src/jquery.jwplayer.swf'> <param name='allowfullscreen' value='true'> <param name='allowscriptaccess' value='always'> <param name='wmode' value='transparent'> <param name='flashvars' value='%flashvars%'> </object>";
    var elementvars = {
        width: true,
        height: true,
        id: true,
        name: true,
        className: true
    }
    
    $.fn.jwplayerView = function(){
        return this.each(function(){
            $(this).wrap("<div />");
            $(this).before("<img src='" + $(this).data("model").image + "' style='width:" + $(this).data("model").width + "px,height:" + $(this).data("model").height + "px' />");
            $(this).prev("img").click($.fn.jwplayer.play);
        });
    };
    
    /** Embeds a Flash Player at the specified location in the DOM. **/
    $.fn.jwplayerView.embedFlash = function(domElement, model){
        var htmlString, elementvarString = "", flashvarString = "";
        if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
            htmlString = embedString;
        }
        else {
            htmlString = objectString;
        }
        for (var elementvar in elementvars) {
            if (!((model[elementvar] === undefined) || (model[elementvar] === "") || (model[elementvar] === null))) {
                elementvarString += elementvar + "='" + model[elementvar] + "'";
            }
        }
        for (var flashvar in model) {
            if (!((model[flashvar] === undefined) || (model[flashvar] === "") || (model[flashvar] === null))) {
                if (flashvar == "sources") {
                    flashvarString += "file=" + model.sources[model.item].file + "&";
                }
                else {
                    flashvarString += flashvar + "=" + model[flashvar] + "&";
                }
            }
        }
        htmlString = htmlString.replace("%elementvars%", elementvarString);
        htmlString = htmlString.replace("%flashvars%", flashvarString);
        $(domElement).replaceWith(htmlString);
    };
    
    
})(jQuery);
