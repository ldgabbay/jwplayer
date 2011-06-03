/**
 * jwplayer Playlist component for the JW Player.
 *
 * @author pablo
 * @version 5.7
 */
(function(jwplayer) {
	var _defaults = {
		size: 180,
		position: jwplayer.html5.view.positions.NONE,
		itemheight: 60,
		showthumbs: true
	};

	_utils = jwplayer.utils; 
	_css = _utils.css;
	
	_hide = function(element) {
		_css(element, {
			display: "none"
		});
	};
	
	_show = function(element) {
		_css(element, {
			display: "block"
		});
	};
	
	jwplayer.html5.playlistcomponent = function(api, config) {
		var _api = api;
		var _settings = jwplayer.utils.extend({}, _defaults, _api.skin.getComponentSettings("playlist"), config);
		if (_settings.position == jwplayer.html5.view.positions.NONE
			|| typeof jwplayer.html5.view.positions[_settings.position] == "undefined") {
			return;
		}
		var _wrapper;
		var _width;
		var _height;
		var _playlist;
		var _items;
		var _ul;
		
		this.getDisplayElement = function() {
			return _wrapper;
		};
		
		this.resize = function(width, height) {
			_width = width;
			_height = height;
			var style = {
				width: _width,
				height: _height
			};
			_css(_wrapper, style);
		};
		
		this.show = function() {
			_show(_wrapper);
		}

		this.hide = function() {
			_hide(_wrapper);
		}


		function _setup() {
			_wrapper = document.createElement("div");
			_wrapper.id = _api.id + "_jwplayer_playlistcomponent";
			switch(_settings.position) {
			case jwplayer.html5.view.positions.RIGHT:				
			case jwplayer.html5.view.positions.LEFT:
				_wrapper.style.width = _settings.size + "px";
				break;
			case jwplayer.html5.view.positions.TOP:				
			case jwplayer.html5.view.positions.BOTTOM:
				_wrapper.style.height = _settings.size + "px";
				break;
			}
			_wrapper.style.backgroundColor = '#C6C6C6';
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_LOADED, _rebuildPlaylist);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYLIST_ITEM, _scrollToItem);
			_api.jwAddEventListener(jwplayer.api.events.JWPLAYER_PLAYER_STATE, _stateHandler);
		}
		
		function _createList() {
			var ul = document.createElement("ul");
			_css(ul, {
			    width: _wrapper.style.width,
				minWidth: _wrapper.style.width,
				height: _wrapper.style.height,
		    	background: '#f8f8f8',
		    	listStyle: 'none',
		    	margin: 0,
		    	padding: 0,
		    	fontFamily: 'Arial, Helvetica, sans-serif',
		    	'overflowY': 'auto'
			});
			return ul;
		}
		
		function _createItem(item) {
			var li = document.createElement("li");
			_css(li,{
			    height: _settings.itemheight,
		    	background: '#EEEEEE',
		    	display: 'block',
		    	borderBottom: '1px solid #ddd',
		    	cursor: 'pointer'
			});
			
			if (_showThumbs() && (item.image || item['playlist.image']) ) {
				var image = new Image();
				_css(image, {
				    height: 60,
				    width: 80,
				    'float': 'left',
				    styleFloat: 'left',
				    cssFloat: 'left',
				    margin: '0 5px 0 0',
				    background: 'black',
				    overflow: 'auto'
				});
				image.src = item['playlist.image'] ? item['playlist.image'] : item.image;
				li.appendChild(image);
	        }
	        var textWrapper = document.createElement("div");
	        _css(textWrapper, {
	            margin: '0 5px'
	        });
	        if (item.title) {
	        	var title = document.createElement("span");
	        	_css(title, {
	        	    margin: 0,
	        		padding: 0,
	        		height: 20, 
	            	lineHeight: 24,
	            	overflow: 'hidden',
	            	display: 'block',
	            	fontSize: '11px',
	            	fontWeight: 'bold'
	        	});
	        	title.innerHTML = item.title;
	        	textWrapper.appendChild(title);
	        }
	        if (item.description) {
	        	var desc = document.createElement("span");
	        	_css(desc,{
	        	    display: 'block',
	        		margin: 0,
	            	padding: 0,
	            	fontSize: '11px',
	            	height: '36px',
	            	lineHeight: '12px',
	            	overflow: 'hidden'
	        	});
	        	desc.innerHTML = item.description;
	        	textWrapper.appendChild(desc);
	        }
	        li.appendChild(textWrapper);
			return li;
		}
		
		function _rebuildPlaylist(evt) {
			_wrapper.innerHTML = "";
			
			_playlist = _api.jwGetPlaylist();
			if (!_playlist) {
				return;
			}
			items = [];
			_ul = _createList();
			
			for (var i=0; i<_playlist.length; i++) {
				var li = _createItem(_playlist[i]);
				li.onclick = _clickHandler(i);
				_ul.appendChild(li);
				items.push(li);
			}
			
			_wrapper.appendChild(_ul);

			if (_utils.isIOS() && window.iScroll) {
				_ul.style.height = 60 * _playlist.length + "px";
				var myscroll = new iScroll(_wrapper.id);
			}
			
		}
		
		function _clickHandler(index) {
			return function() {
				_api.jwPlaylistItem(index);
				_api.jwPlay(true);
			}
		}
		
		function _scrollToItem() {
			_ul.scrollTop = _api.jwGetPlaylistIndex() * _settings.itemheight;
		}

		function _showThumbs() {
			return _settings.showthumbs.toString().toLowerCase() == "true";	
		}
		
		function _stateHandler() {
			if (_settings.position == jwplayer.html5.view.positions.OVER) {
				switch (_api.jwGetState()) {
				case jwplayer.api.events.state.IDLE:
					_show(_wrapper);
					break;
				default:
					_hide(_wrapper);
					break;
				}
			}
		}
		
		_setup();
		return this;
	};
})(jwplayer);
