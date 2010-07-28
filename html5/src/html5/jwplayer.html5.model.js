/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0alpha
 * @lastmodifieddate 2010-04-11
 */
jwplayer.html5.model = function(options) {
	$.extend(this.config, options);
	this.sources = this.config.sources;
	delete this.config.sources;
	for (var index in jwplayer.html5.model._configurableStateVariables) {
		var configurableStateVariable = jwplayer.html5.model._configurableStateVariables[index];
		this[configurableStateVariable] = this.config[configurableStateVariable];
	}
	return this;
};

jwplayer.html5.model.prototype = {
	components: {},
	sources: {},
	state: jwplayer.html5.states.IDLE,
	source: 0,
	position: 0,
	buffer: 0,
	config: {
		width: 480,
		height: 320,
		skin: undefined,
		file: undefined,
		image: undefined,
		start: 0,
		duration: 0,
		bufferlength: 5,
		volume: 90,
		mute: false,
		fullscreen: false,
		repeat: false,
		autostart: false,
		debug: undefined
	}
};

jwplayer.html5.model._configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen"];

jwplayer.html5.model.setActiveMediaProvider = function(player) {
	var source, sourceIndex;
	for (sourceIndex in player._model.sources) {
		source = player._model.sources[sourceIndex];
		if (source.type === undefined) {
			var extension = jwplayer.html5.utils.extension(source.file);
			if (extension == "ogv") {
				extension = "ogg";
			}
			source.type = 'video/' + extension + ';';
		}
		if (jwplayer.html5.utils.supportsType(source.type)) {
			player._model.source = sourceIndex;
			jwplayer.html5.mediaVideo(player);
			return true;
		}
	}
	return false;
};
