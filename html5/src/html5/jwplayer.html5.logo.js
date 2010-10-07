/**
 * JW Player logo component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	var _defaults = {
		prefix: "http://l.longtailvideo.com/html5/",
		file: "logo.png",
		link: "http://www.longtailvideo.com/players/jw-flv-player/",
		margin: 8,
		out: 0.5,
		over: 1,
		timeout: 3,
		hide: true,
		position: "bottom-left"
	};
	
	_css = jwplayer.html5.utils.css;
	
	jwplayer.html5.logo = function(api, logoConfig) {
		var _api = api;
		var _timeout;
		
		if (_defaults.prefix) {
			var version = api.version.split(/\W/).splice(0, 2).join("/");
			if (_defaults.prefix.indexOf(version) < 0) {
				_defaults.prefix += version + "/";
			}
		}
		
		if (logoConfig.position == jwplayer.html5.view.positions.OVER){
			logoConfig.position = _defaults.position;
		}
		
		var _settings = jwplayer.utils.extend({}, _defaults, logoConfig);
		
		if (!_settings.file){
			return;
		}
		
		var _logo = document.createElement("img");
		_logo.id = _api.id + "_jwplayer_logo";
		
		_logo.onload = function(evt) {
			_css(_logo, _getStyle());
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		};
		
		if (_settings.file.indexOf("http://") === 0) {
			_logo.src = _settings.file;
		} else {
			_logo.src = _settings.prefix + _settings.file;
		}
		
		_logo.onmouseover = function(evt) {
			_logo.style.opacity = _settings.over;
			fade();
		};
		
		_logo.onmouseout = function(evt) {
			_logo.style.opacity = _settings.out;
			fade();
		};
		
		_logo.onclick = _logoClickHandler;
		
		function _getStyle() {
			var _imageStyle = {
				textDecoration: "none",
				position: "absolute"
			};
			_imageStyle.display = _settings.hide ? "none" : "block";
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
		
		function fade() {
			if (_timeout) {
				clearTimeout(_timeout);
			}
			_timeout = setTimeout(function() {
				jwplayer.html5.utils.fadeTo(_logo, 0, 0.1, parseFloat(_logo.style.opacity));
			}, _settings.timeout * 1000);
		}
		
		function _stateHandler(obj) {
			switch (_api.jwGetState()) {
				case jwplayer.api.events.state.BUFFERING:
					_logo.style.display = "block";
					_logo.style.opacity = _settings.out;
					if (_settings.hide) {
						fade();
					}
					break;
				case jwplayer.api.events.state.PAUSED:
					break;
				case jwplayer.api.events.state.IDLE:
					break;
				case jwplayer.api.events.state.PLAYING:
					break;
				default:
					if (_settings.hide) {
						fade();
					}
					break;
			}
		}
		
		return this;
	};
	
})(jwplayer);
