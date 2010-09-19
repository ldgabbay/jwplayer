/**
 * JW Player logo component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _defaults = {
		prefix: "http://l.longtailvideo.com/html5/0/",
		file: "logo.png",
		link: "http://www.longtailvideo.com/players/jw-flv-player/",
		margin: 8,
		out: 0.5,
		over: 1,
		timeout: 3,
		hide: "true",
		//position: "bottom-left",
		width: 93,
		height: 30
	};
	
	_css = jwplayer.html5.utils.css;
	
	jwplayer.html5.logo = function(api, config) {
		var _api = api;
		var _settings = jwplayer.utils.extend({}, _defaults, config);
		
		var _logo = document.createElement("img");
		_logo.id = _api.id + "_jwplayer_logo";
		_css(_logo, _getStyle());
		
		_logo.onload = function(evt) {
			_settings.width = _logo.width;
			_settings.height = _logo.height;
						
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		};
		
		_logo.src = _settings.prefix + _settings.file;
		
		_logo.onmouseover = function(evt) {
			_logo.style.opacity = _settings.over;
		};
		
		_logo.onmouseout = function(evt) {
			_logo.style.opacity = _settings.out;
		};
		
		_logo.onclick = _logoClickHandler;
		
		function _getStyle() {
			var _imageStyle = {
				width: _settings.width,
				height: _settings.height,
				textDecoration: "none",
				position: "absolute",
				display: "none"
			};
			var positions = _settings.position.toLowerCase().split("-");
			for (var position in positions) {
				_imageStyle[positions[position]] = _settings.margin;
			}
			return _imageStyle;
		}
		
		this.resize = function(width, height) {
		};
		
		this.getDisplayElement = function() {
			return _logo;
		};
		
		function _logoClickHandler(evt) {
			evt.stopPropagation();
			window.open(_settings.link, "_blank");
			return;
		}
		
		function _stateHandler(obj) {
			switch (_api.jwGetState()) {
				case jwplayer.api.events.state.BUFFERING:
					_logo.style.opacity = _settings.out;
					jwplayer.html5.utils.fadeTo(_logo, 0, 0.1, parseFloat(_logo.style.opacity), _settings.timeout);
					break;
				case jwplayer.api.events.state.PAUSED:
					break;
				case jwplayer.api.events.state.IDLE:
					break;
				case jwplayer.api.events.state.PLAYING:
					break;
				default:
					jwplayer.html5.utils.fadeTo(_logo, 0, 0.1, parseFloat(_logo.style.opacity), _settings.timeout);
					break;
			}
		}
		
		return this;
	};
	
})(jwplayer);