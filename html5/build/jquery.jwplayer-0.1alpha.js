/**
 * Controlbar component of the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($){


    /** Hooking the controlbar up to jQuery. **/
    $.fn.controlbar = function(ops){
        return this.each(function(){
            var id = $(this)[0].id;
            var div = $('#' + id).parents()[0].id;
            var player = document.getElementById(id);
            var options = $.extend({}, $.fn.controlbar.defaults, ops);
            $.extend(options, player.getConfig());
            // Add positioning options and change the player css, so we can full-browser-screen it.
            $.extend(options, {
                id: id,
                div: div,
                left: $('#' + div).position().left,
                top: $('#' + div).position().top
            });
            $('#' + div).css('position', 'static');
            $('#' + div).css('z-index', '98');
            $('#' + div).css('height', options.height);
            $('#' + div).css('width', options.width);
            $('#' + id).css('width', '100%');
            $('#' + id).css('height', '100%');
            // Save the variables globally and start loading the skin.
            $.fn.controlbar.bars[id] = {
                player: player,
                options: options,
                images: {}
            };
            loadSkin($.fn.controlbar.bars[id]);
        });
    };
    
    
    /** Map with all controlbars. **/
    $.fn.controlbar.bars = {};
    
    
    /** Map with config for the controlbar plugin. **/
    $.fn.controlbar.defaults = {
        buffer: 0,
        div: 'container',
        duration: 0,
        elapsed: 0,
        fontsize: 10,
        fontcolor: '000000',
        fullscreen: false,
        id: 'player',
        images: 0,
        position: 'bottom',
        skin: '././skins/five/five.xml',
        width: 400,
        height: 300,
        left: 0,
        leftmargin: 0,
        top: 0,
        rightmargin: 0,
        scrubber: 'none',
        state: 'idle',
        volume: 100
    };
    
    
    /** Callbacks called by Flash players to update stats. **/
    $.fn.controlbar.bufferHandler = function(obj){
        bufferHandler({
            id: obj.id,
            buffer: obj.percentage
        });
    };
    $.fn.controlbar.muteHandler = function(obj){
        muteHandler({
            id: obj.id,
            mute: obj.state
        });
    };
    $.fn.controlbar.stateHandler = function(obj){
        stateHandler({
            id: obj.id,
            state: obj.newstate.toLowerCase()
        });
    };
    $.fn.controlbar.timeHandler = function(obj){
        timeHandler({
            id: obj.id,
            elapsed: obj.position,
            duration: obj.duration
        });
    };
    $.fn.controlbar.volumeHandler = function(obj){
        volumeHandler({
            id: obj.id,
            volume: obj.percentage
        });
    };
    
    
    
    
    /** Loading the images from the skin XML. **/
    function loadSkin(config){
        $.get(config.options.skin, {}, function(xml){
            var arr = $('component', xml);
            for (var i = 0; i < arr.length; i++) {
                if ($(arr[i]).attr('name') == 'controlbar') {
                    var sts = $(arr[i]).find('setting');
                    arr = $(arr[i]).find('element');
                    break;
                }
            }
            for (var i = 0; i < sts.length; i++) {
                config.options[$(sts[i]).attr('name')] = $(sts[i]).attr('value');
            }
            config.options.images = arr.length;
            for (var i = 0; i < arr.length; i++) {
                loadImage(arr[i], config);
            }
        });
    }
    
    
    /** Load the data for a single element. **/
    function loadImage(element, config){
        var img = new Image();
        var nam = $(element).attr('name');
        var url = config.options.skin.substr(0, config.options.skin.lastIndexOf('/')) + '/controlbar/';
        $(img).error(function(){
            config.options.images--;
        });
        $(img).load(function(){
            config.images[nam] = {
                height: this.height,
                width: this.width,
                src: this.src
            };
            config.options.images--;
            if (config.options.images === 0) {
                buildElements(config);
                buildHandlers(config);
            }
        });
        img.src = url + $(element).attr('src');
    }
    
    
    
    
    /** Draw the controlbar elements. **/
    function buildElements(config){
        // Draw the background.
        $('#' + config.options.div).after('<div id="' + config.options.id + '_controlBar"></div>');
        $('#' + config.options.id + '_controlBar').css('position', 'absolute');
        $('#' + config.options.id + '_controlBar').css('height', config.images.background.height);
        $('#' + config.options.id + '_controlBar').css('background', 'url(' + config.images.background.src + ') repeat-x center left');
        // Draw all elements on top of the bar.
        buildElement('capLeft', 'left', true, config);
        buildElement('playButton', 'left', false, config);
        buildElement('pauseButton', 'left', true, config);
        buildElement('divider1', 'left', true, config);
        buildElement('elapsedText', 'left', true, config);
        buildElement('timeSliderRail', 'left', false, config);
        buildElement('timeSliderBuffer', 'left', false, config);
        buildElement('timeSliderProgress', 'left', false, config);
        buildElement('timeSliderThumb', 'left', false, config);
        buildElement('capRight', 'right', true, config);
        buildElement('fullscreenButton', 'right', false, config);
        buildElement('normalscreenButton', 'right', true, config);
        buildElement('divider2', 'right', true, config);
        buildElement('volumeSliderRail', 'right', false, config);
        buildElement('volumeSliderProgress', 'right', true, config);
        buildElement('muteButton', 'right', false, config);
        buildElement('unmuteButton', 'right', true, config);
        buildElement('divider3', 'right', true, config);
        buildElement('durationText', 'right', true, config);
    }
    
    
    /** Draw a single element into the controlbar. **/
    function buildElement(element, align, offset, config){
        var nam = config.options.id + '_' + element;
        $('#' + config.options.id + '_controlBar').append('<div id="' + nam + '"></div>');
        $('#' + nam).css('position', 'absolute');
        $('#' + nam).css('top', 0);
        if (element.indexOf('Text') > 0) {
            $('#' + nam).html('00:00');
            $('#' + nam).css('font', config.options.fontsize + 'px/' + (config.images.background.height + 1) + 'px Arial,sans-serif');
            $('#' + nam).css('text-align', 'center');
            $('#' + nam).css('font-weight', 'bold');
            $('#' + nam).css('cursor', 'default');
            var wid = 14 + 3 * config.options.fontsize;
            $('#' + nam).css('color', '#' + config.options.fontcolor.substr(-6));
        }
        else 
            if (element.indexOf('divider') === 0) {
                $('#' + nam).css('background', 'url(' + config.images.divider.src + ') repeat-x center left');
                var wid = config.images.divider.width;
            }
            else {
                $('#' + nam).css('background', 'url(' + config.images[element].src + ') repeat-x center left');
                var wid = config.images[element].width;
            }
        if (align == 'left') {
            $('#' + nam).css(align, config.options.leftmargin);
            if (offset) {
                config.options.leftmargin += wid;
            }
        }
        else 
            if (align == 'right') {
                $('#' + nam).css(align, config.options.rightmargin);
                if (offset) {
                    config.options.rightmargin += wid;
                }
            }
        $('#' + nam).css('width', wid);
        $('#' + nam).css('height', config.images.background.height);
    }
    
    
    /** Add interactivity to the controlbar elements. **/
    function buildHandlers(config){
        // Register events with the buttons.
        buildHandler('playButton', 'play', config.player, config.options);
        buildHandler('pauseButton', 'play', config.player, config.options);
        buildHandler('muteButton', 'mute', config.player, config.options);
        buildHandler('unmuteButton', 'mute', config.player, config.options);
        buildHandler('fullscreenButton', 'fullscreen', config.player, config.options);
        buildHandler('normalscreenButton', 'fullscreen', config.player, config.options);
        /*
         addSliders(options);
         */
        // Register events with the player.
        config.player.addModelListener('buffer', 'jQuery.fn.controlbar.bufferHandler');
        config.player.addModelListener('state', 'jQuery.fn.controlbar.stateHandler');
        config.player.addModelListener('time', 'jQuery.fn.controlbar.timeHandler');
        config.player.addControllerListener('mute', 'jQuery.fn.controlbar.muteHandler');
        config.player.addControllerListener('volume', 'jQuery.fn.controlbar.volumeHandler');
        // Trigger a few events so the bar looks good on startup.
        fullscreenHandler(config.options);
        muteHandler(config.options);
        stateHandler(config.options);
        volumeHandler(config.options);
    }
    
    
    /** Set a single button handler. **/
    function buildHandler(element, handler, player, options){
        var nam = options.id + '_' + element;
        $('#' + nam).css('cursor', 'pointer');
        if (handler == 'fullscreen') {
            $('#' + nam).mouseup(function(evt){
                evt.stopPropagation();
                options.fullscreen = !options.fullscreen;
                fullscreenHandler(options);
            });
        }
        else {
            $('#' + nam).mouseup(function(evt){
                evt.stopPropagation();
                player.sendEvent(handler);
            });
        }
    }
    
    
    /** Set the volume drag handler. **/
    function addSliders(){
        var bar = '#' + config.id + '_controlBar';
        var trl = '#' + config.id + '_timeSliderRail';
        var vrl = '#' + config.id + '_volumeSliderRail';
        $(bar).css('cursor', 'hand');
        $(bar).mousedown(function(evt){
            var xps = evt.pageX - $(bar).position().left;
            if (xps > $(trl).position().left && xps < $(trl).position().left + $(trl).width()) {
                config.scrubber = 'time';
            }
            else 
                if (xps > $(vrl).position().left && xps < $(vrl).position().left + $(vrl).width()) {
                    config.scrubber = 'volume';
                }
        });
        $(bar).mouseup(function(evt){
            evt.stopPropagation();
            sliderUp(evt.pageX);
        });
        $(bar).mouseleave(function(evt){
            sliderUp(evt.pageX);
            evt.stopPropagation();
        });
        $(bar).mousemove(function(evt){
            if (config.scrubber == 'time') {
                var xps = evt.pageX - $(bar).position().left;
                $('#' + config.id + '_timeSliderThumb').css('left', xps);
            }
        });
    }
    
    
    /** The slider has been moved up. **/
    function sliderUp(msx){
        if (config.scrubber == 'time') {
            var xps = msx - $('#' + config.id + '_timeSliderRail').position().left;
            var wid = $('#' + config.id + '_timeSliderRail').width();
            var pos = xps / wid * config.duration;
            if (pos < 0) {
                pos = 0;
            }
            else 
                if (pos > config.duration) {
                    pos = config.duration - 3;
                }
            player.sendEvent('seek', pos);
        }
        else 
            if (config.scrubber == 'volume') {
                var bar = $('#' + config.id + '_controlBar').width();
                var brx = $('#' + config.id + '_controlBar').position().left;
                var rig = $('#' + config.id + '_volumeSliderRail').css('right').substr(0, 2);
                var wid = config.images.volumeSliderRail.width;
                var pct = Math.round((msx - bar - brx + 1 * rig + wid) / wid * 100);
                if (pct < 0) {
                    pct = 0;
                }
                else 
                    if (pct > 100) {
                        pct = 100;
                    }
                player.sendEvent('volume', pct);
            }
        config.scrubber = 'none';
    }
    
    
    
    
    /** Update the buffer percentage. **/
    function bufferHandler(options){
        if (options.buffer === 0) {
            $('#' + options.id + '_timeSliderBuffer').css('display', 'none');
        }
        else {
            $('#' + options.id + '_timeSliderBuffer').css('display', 'block');
            var wid = $('#' + options.id + '_timeSliderRail').width();
            $('#' + options.id + '_timeSliderBuffer').css('width', Math.round(wid * options.buffer / 100));
        }
    }
    
    
    /** Update the mute state. **/
    function muteHandler(options){
        if (options.mute) {
            $('#' + options.id + '_muteButton').css('display', 'none');
            $('#' + options.id + '_unmuteButton').css('display', 'block');
            $('#' + options.id + '_volumeSliderProgress').css('display', 'none');
        }
        else {
            $('#' + options.id + '_muteButton').css('display', 'block');
            $('#' + options.id + '_unmuteButton').css('display', 'none');
            $('#' + options.id + '_volumeSliderProgress').css('display', 'block');
        }
    }
    
    
    /** Update the playback state. **/
    function stateHandler(options){
        if (options.state == 'buffering' || options.state == 'playing') {
            $('#' + options.id + '_pauseButton').css('display', 'block');
            $('#' + options.id + '_playButton').css('display', 'none');
        }
        else {
            $('#' + options.id + '_pauseButton').css('display', 'none');
            $('#' + options.id + '_playButton').css('display', 'block');
        }
        if (options.state == 'completed') {
            options.elapsed = 0;
            timeHandler(options);
        }
    }
    
    
    /** Update the playback time. **/
    function timeHandler(options){
        var wid = $('#' + options.id + '_timeSliderRail').width();
        var thb = $('#' + options.id + '_timeSliderThumb').width();
        var lft = $('#' + options.id + '_timeSliderRail').position().left;
        if (options.elapsed === 0) {
            $('#' + options.id + '_timeSliderProgress').css('display', 'none');
            $('#' + options.id + '_timeSliderThumb').css('display', 'none');
        }
        else {
            $('#' + options.id + '_timeSliderProgress').css('display', 'block');
            $('#' + options.id + '_timeSliderProgress').css('width', Math.round(wid * options.elapsed / options.duration));
            $('#' + options.id + '_timeSliderThumb').css('display', 'block');
            $('#' + options.id + '_timeSliderThumb').css('left', lft +
            Math.round((wid - thb) * options.elapsed / options.duration));
            $('#' + options.id + '_durationText').html(timeFormat(options.duration));
        }
        $('#' + options.id + '_elapsedText').html(timeFormat(options.elapsed));
    }
    
    
    /** Format the elapsed / remaining text. **/
    function timeFormat(sec){
        str = '00:00';
        if (sec > 0) {
           str = Math.floor(sec / 60) < 10 ? '0' + Math.floor(sec / 60) + ':' : Math.floor(sec / 60) + ':';
           str += Math.floor(sec % 60) < 10 ? '0' + Math.floor(sec % 60) : Math.floor(sec % 60);
        }
        return str;
    }
    
    
    /** Flip the player size to/from full-browser-screen. **/
    function fullscreenHandler(options){
        if (options.fullscreen) {
            $('#' + options.div).css('position', 'absolute');
            $('#' + options.div).css('left', 0);
            $('#' + options.div).css('top', 0);
            $('#' + options.div).css('height', '100%');
            $('#' + options.div).css('width', '100%');
            $('#' + options.id + '_normalscreenButton').css('display', 'block');
            $('#' + options.id + '_fullscreenButton').css('display', 'none');
            $(window).resize(function(){
                resizeBar(options);
            });
        }
        else {
            $('#' + options.div).css('position', 'static');
            $('#' + options.div).css('left', options.left);
            $('#' + options.div).css('top', options.top);
            $('#' + options.div).css('height', options.height);
            $('#' + options.div).css('width', options.width);
            $('#' + options.id + '_normalscreenButton').css('display', 'none');
            $('#' + options.id + '_fullscreenButton').css('display', 'block');
            $(window).resize(null);
        }
        resizeBar(options);
        timeHandler(options);
        bufferHandler(options);
    }
    
    
    /** Resize the controlbar. **/
    function resizeBar(options){
        var lft = options.left;
        var top = options.top + options.height;
        var wid = options.width;
        var hei = $('#' + options.id + '_controlBar').height();
        if (options.position == 'over') {
            lft += 1 * options.margin;
            top -= 1 * options.margin + hei;
            wid -= 2 * options.margin;
        }
        if (options.fullscreen) {
            lft = options.margin;
            top = $(window).height() - options.margin - hei;
            wid = $(window).width() - 2 * options.margin;
            $('#' + options.id + '_controlBar').css('z-index', 99);
        }
        else {
            $('#' + options.id + '_controlBar').css('z-index', 97);
        }
        $('#' + options.id + '_controlBar').css('left', lft);
        $('#' + options.id + '_controlBar').css('top', top);
        $('#' + options.id + '_controlBar').css('width', wid);
        $('#' + options.id + '_timeSliderRail').css('width', wid - options.leftmargin - options.rightmargin);
    }
    
    
    /** Update the volume level. **/
    function volumeHandler(options){
        var rwd = $('#' + options.id + '_volumeSliderRail').width();
        var wid = Math.round(options.volume / 100 * rwd);
        var rig = $('#' + options.id + '_volumeSliderRail').css('right').substr(0, 2);
        $('#' + options.id + '_volumeSliderProgress').css('width', wid);
        $('#' + options.id + '_volumeSliderProgress').css('right', 1 * rig + rwd - wid);
    }
    
    
    })(jQuery);
/**
 * JW Player controller component
 * 
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($){



})(jQuery);/**
 * Core component of the JW Player (initialization, API).
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($){

    /** Hooking the controlbar up to jQuery. **/
    $.fn.jwplayer = function(options){
        return this.each(function(){
            $(this).css("display", "none");
            $(this).jwplayerParse(options);
            $(this).wrap("<div />");
            $(this).before("<img src='" + $(this).data("model").image + "' style='width:" + $(this).data("model").width + "px,height:" + $(this).data("model").height + "px' />");
            $(this).prev("img").click($.fn.jwplayer.play);
            // loadSkin(options);
        });
    };
    
    
    $.fn.jwplayer.play = function(event){
		var source, sourceIndex;
        var video = $(event.target).next("video");
        var model = video.data("model");
        for (sourceIndex in model.sources) {
            source = model.sources[sourceIndex];
            if (source.type === undefined) {
                source.type = 'video/' + $.fn.jwplayerUtils.extension(source.file) + ';';
            }
            if ($.fn.jwplayerUtils.supportsType(source.type)) {
                model.item = sourceIndex;
                $(event.target).css("display", "none");
                video.css("display", "inherit");
                video[0].play();
                model.state = 'playing';
                return true;
            }
        }
        if ($.fn.jwplayerUtils.supportsFlash && model.state != 'playing') {
            for (sourceIndex in model.sources) {
                source = model.sources[sourceIndex];
                $.fn.log($.fn.jwplayerUtils.flashCanPlay(source.file));
                if ($.fn.jwplayerUtils.flashCanPlay(source.file)) {
                    model.item = sourceIndex;
                    $.fn.jwplayerView.embedFlash(video, model);
                    $(event.target).css("display", "none");
                    return true;
                }
            }
        }
        alert("No file to play!");
        return false;
    };
    
    
    /** Map with all players on the page. **/
    $.fn.jwplayer.players = {};
    
    
    /** Map with config for the controlbar plugin. **/
    $.fn.jwplayer.defaults = {
        autostart: false,
        buffer: 0,
        duration: 0,
        file: undefined,
        height: 300,
        image: undefined,
        left: 0,
        position: 0,
        skin: '../../skins/five/five.xml',
        state: 'idle',
        top: 0,
        volume: 100,
        width: 400,
        item: 0
    };
    
    
    /** Jumping the player to/from fullscreen. **/
    $.fn.jwplayer.fullscreen = function(player, state){
    };
    
    
    /** Switch the mute state of the player. **/
    $.fn.jwplayer.mute = function(player, state){
    };
    
    
    /** Switch the pause state of the player. **/
    $.fn.jwplayer.pause = function(player, state){
    };
    
    
    /** Seek to a position in the video. **/
    $.fn.jwplayer.seek = function(player, position){
    };
    
    
    /** Stop playback and loading of the video. **/
    $.fn.jwplayer.stop = function(player){
    };
    
    
    /** Change the video's volume level. **/
    $.fn.jwplayer.volume = function(player, position){
    };
    
    
    /** Add an event listener. **/
    $.fn.jwplayer.addEventListener = function(player, event, listener){
    };
    
    
    /** Remove an event listener. **/
    $.fn.jwplayer.removeEventListener = function(player, event, listener){
    };
    
    
    /** Loading the images from the skin XML. **/
    function loadSkin(config){
        $.get(config.options.skin, {}, function(xml){
            var arr = $('component', xml);
            for (var i = 0; i < arr.length; i++) {
                if ($(arr[i]).attr('name') == 'display') {
                    var sts = $(arr[i]).find('setting');
                    arr = $(arr[i]).find('element');
                    break;
                }
            }
            for (var i = 0; i < sts.length; i++) {
                config.options[$(sts[i]).attr('name')] = $(sts[i]).attr('value');
            }
            config.options.images = arr.length;
            for (var i = 0; i < arr.length; i++) {
                loadImage(arr[i], config);
            }
        });
    }
    
    
    /** Load the data for a single element. **/
    function loadImage(element, config){
        var img = new Image();
        var nam = $(element).attr('name');
        var url = config.options.skin.substr(0, config.options.skin.lastIndexOf('/')) + '/controlbar/';
        $(img).error(function(){
            config.options.images--;
        });
        $(img).load(function(){
            config.images[nam] = {
                height: this.height,
                width: this.width,
                src: this.src
            };
            config.options.images--;
            if (config.options.images === 0) {
                buildElements(config);
                buildHandlers(config);
            }
        });
        img.src = url + $(element).attr('src');
    }
    
    /** Automatically initializes the player for all <video> tags with the JWPlayer class. **/
    $(document).ready(function(){
        $("video.jwplayer").jwplayer();
    });
    
})(jQuery);
/**
 * JW Player model component
 * 
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($){



})(jQuery);/**
 * Parser for the JW Player.
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($){

    var elementAttributes = {
        'element': {
            'width': 'width',
            'height': 'height',
            'id': 'id',
            'class': 'className',
            'name': 'name'
        },
        'media': {
            'src': 'file',
            'preload': 'preload',
            'autoplay': 'autostart',
            'loop': 'repeat',
            'controls': 'controls'
        },
        'source': {
            'src': 'file',
            'type': 'type',
            'media': 'media'
        },
        'video': {
            'poster': 'image'
        }
    };
    
    var parsers = {};
    
    $.fn.jwplayerParse = function(options){
        return this.each(function(){
            $(this).data("model", $.extend(true, {}, $.fn.jwplayer.defaults, options, parseElement(this)));
        });
    };
    
    function getAttributeList(attributes, elementType){
        if (attributes === undefined) {
            attributes = elementAttributes[elementType];
        }
        else {
            $.extend(attributes, elementAttributes[elementType]);
        }
        return attributes;
    }
    
    function parseElement(domElement, attributes){
        if (parsers[domElement.tagName.toLowerCase()] && (attributes === null)) {
            return parsers[domElement.tagName.toLowerCase()](domElement);
        }
        else {
            attributes = getAttributeList(attributes, 'element');
            var configuration = {};
            for (var attribute in attributes) {
                if (attribute != "length") {
                    var value = $(domElement).attr(attribute);
                    if (!(value === "" || value === undefined)) {
                        configuration[attributes[attribute]] = $(domElement).attr(attribute);
                    }
                }
            }
            return configuration;
        }
    }
    
    function parseMediaElement(domElement, attributes){
        attributes = getAttributeList(attributes, 'media');
        var sources = [];
        $("source", domElement).each(function(){
            sources[sources.length] = parseSourceElement(this);
        });
        var configuration = parseElement(domElement, attributes);
        if (configuration.file !== undefined) {
            sources[0] = {
                'file': configuration.file
            };
        }
        configuration.sources = sources;
        return configuration;
    }
    
    function parseSourceElement(domElement, attributes){
        attributes = getAttributeList(attributes, 'source');
        return parseElement(domElement, attributes);
    }
    
    function parseVideoElement(domElement, attributes){
        attributes = getAttributeList(attributes, 'video');
        return parseMediaElement(domElement, attributes);
    }
    
    parsers.media = parseMediaElement;
    parsers.audio = parseMediaElement;
    parsers.source = parseSourceElement;
    parsers.video = parseVideoElement;
    
    
})(jQuery);
/**
 * JW Player component that loads / interfaces PNG skinning.
 * 
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($){



})(jQuery);/**
 * Utility methods for the JW Player.
 *
 * @author jeroen
 * @version 1.0alpha
 * @lastmodifiedauthor zach
 * @lastmodifieddate 2010-04-11
 */
(function($){

    /** Constructor **/
    $.fn.jwplayerUtils = function(){
        return this.each(function(){
        });
    };
    
    /** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
    $.fn.jwplayerUtils.supportsFlash = function(){
        var version = '0,0,0,0';
        try {
            try {
                var axo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
                try {
                    axo.AllowScriptAccess = 'always';
                } 
                catch (e) {
                    version = '6,0,0';
                }
            } 
            catch (e) {
            }
            version = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
        } 
        catch (e) {
            try {
                if (navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin) {
                    version = (navigator.plugins["Shockwave Flash 2.0"] ||
                    navigator.plugins["Shockwave Flash"]).description.replace(/\D+/g, ",").match(/^,?(.+),?$/)[1];
                }
            } 
            catch (e) {
            }
        }
        var major = parseInt(version.split(',')[0]);
        var minor = parseInt(version.split(',')[2]);
        if (major > 9 || (major == 9 && minor > 97)) {
            return true;
        }
        else {
            return false;
        }
    };
    
    /** Filetypes supported by Flash **/
    var flashFileTypes = {
        '3g2': true,
        '3gp': true,
        'aac': true,
        'f4b': true,
        'f4p': true,
        'f4v': true,
        'flv': true,
        'gif': true,
        'jpg': true,
        'jpeg': true,
        'm4a': true,
        'm4v': true,
        'mov': true,
        'mp3': true,
        'mp4': true,
        'png': true,
        'rbs': true,
        'sdp': true,
        'swf': true,
        'vp6': true
    };
    
    
    /** Check if this client supports Flash player 9.0.115+ (FLV/H264). **/
    $.fn.jwplayerUtils.flashCanPlay = function(fileName){
        if (flashFileTypes[$.fn.jwplayerUtils.extension(fileName)]) {
            return true;
        }
        return false;
    };
    
    /** Check if this client supports playback for the specified type. **/
    $.fn.jwplayerUtils.supportsType = function(type){
        try {
            return !!document.createElement('video').canPlayType(type);
        } 
        catch (e) {
            return false;
        }
    };
    
    /** Check if this client supports HTML5 H.264 playback. **/
    $.fn.jwplayerUtils.supportsH264 = function(){
        return $.fn.jwplayerUtils.supportsType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
    };
    
    
    /** Check if this client supports HTML5 OGG playback. **/
    $.fn.jwplayerUtils.supportsOgg = function(){
        return $.fn.jwplayerUtils.supportsType('video/ogg; codecs="theora, vorbis"');
    };
    
    /** Returns the extension of a file name **/
    $.fn.jwplayerUtils.extension = function(path){
        return path.substr(path.lastIndexOf('.') + 1, path.length);
    };
    
    /** Dumps the content of an object to a string **/
    $.fn.jwplayerUtils.dump = function(object, depth){
        if (object === null) {
            return 'null';
        }
        else 
            if ($.fn.jwplayerUtils.typeOf(object) != 'object') {
                if ($.fn.jwplayerUtils.typeOf(object) == 'string') {
                    return "\"" + object + "\"";
                }
                return object;
            }
        
        var type = $.fn.jwplayerUtils.typeOf(object);
        
        depth = (depth === undefined) ? 1 : depth+1;
        var indent = "";
        for (var i = 0; i < depth; i++) {
            indent += "\t";
        }
        
        var result = (type == "array") ? "[" : "{";
        result += "\n" + indent;
        
        for (var i in object) {
            if (type == "object") {
                result += "\"" + i + "\": ";
            }
            result += $.fn.jwplayerUtils.dump(object[i], depth) + ",\n" + indent;
        }
        
        result = result.substring(0, result.length - 2 - depth) + "\n";
        
        result += indent.substring(0, indent.length - 1);
        result += (type == "array") ? "]" : "}";
        
        return result;
    };
    
    /** Returns the true type of an object **/
    $.fn.jwplayerUtils.typeOf = function(value){
        var s = typeof value;
        if (s === 'object') {
            if (value) {
                if (value instanceof Array) {
                    s = 'array';
                }
            }
            else {
                s = 'null';
            }
        }
        return s;
    };
    
    
    /** Logger **/
    $.fn.log = function(msg, obj){
        try {
            if (obj) {
                console.log("%s: %o", msg, obj);
            }
            else {
                console.log($.fn.jwplayerUtils.dump(msg));
            }
        } 
        catch (err) {
        }
        return this;
    };
    
    
})(jQuery);
/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
(function($){

$.fn.jwplayerView = function() {
};

/** Embeds a Flash Player at the specified location in the DOM. **/
$.fn.jwplayerView.embedFlash = function(domElement, model) {
	if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
		$(domElement).replaceWith("<embed " + 
			"width='" + model.width + "' " + 
			"height='" + model.height + "' " + 
			"id='" + model.id + "' " + 
			"name='" + model.name + "' " + 
			"class='" + model.className + "' " + 
			"src='src/jquery.jwplayer.swf' " + 
			"allowfullscreen='true' " + 
			"allowscriptaccess='always' " + 
			"flashvars='file=" + model.sources[model.item].file + "&image=" + model.image + "' " + 
			"/>"
		);
	} else {
			$(domElement).replaceWith("<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='" + model.width + "' height='" + model.height + "' id='" + model.id + "' name='" + model.name + "' class='" + model.className + "'>" + 
			"<param name='movie' value='src/jquery.jwplayer.swf'>" + 
			"<param name='allowfullscreen' value='true'>" + 
			"<param name='allowscriptaccess' value='always'>" + 
			"<param name='wmode' value='transparent'>" + 
			"<param name='flashvars' value='file=" + model.sources[model.item].file + "&image=" + model.image + "'>" + 
			"</object>"
		);
	}
};


})(jQuery);