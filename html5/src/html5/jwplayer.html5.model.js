/**
 * JW Player model component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _configurableStateVariables = ["width", "height", "start", "duration", "volume", "mute", "fullscreen"];

	jwplayer.html5.model = function(options) {
		$.extend(this.config, options);
		if (this.config.playlist && this.config.playlist.length > 0){
			this.playlist = this.config.playlist;
			delete this.config.playlist;
		} else if (this.config.sources && this.config.sources.length > 0) {
			this.playlist = [{"sources": this.config.sources}];
			delete this.config.sources;
		}
		for (var index in _configurableStateVariables) {
			var configurableStateVariable = _configurableStateVariables[index];
			this[configurableStateVariable] = this.config[configurableStateVariable];
		}
		return this;
	};
	
	jwplayer.html5.model.prototype = {
		components: {},
		playlist: [],
		state: jwplayer.html5.states.IDLE,
		item: 0,
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
			debug: undefined,
			screencolor: ''
		}
	};
	
	jwplayer.html5.model.setActiveMediaProvider = function(player) {
		player._media = jwplayer.html5.mediavideo(player);	
		return true;
	};	
})(jwplayer);
