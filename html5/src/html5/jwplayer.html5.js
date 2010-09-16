/**
 * Core component of the JW Player (initialization, API).
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {
	var _player = {
		id: undefined,
		version: "1.0",
		skin: undefined,
		_model: undefined,
		_view: undefined,
		_controller: undefined,
		_listeners: {},
		_media: undefined,
		_domelement: undefined
	};
	
	jwplayer.html5 = function(domelement) {
		_player._domelement = domelement;
		_player.id = domelement.id;
		_player.setup = setup;
		return _player;
	};
		
	function setup (options) {
		jwplayer.html5.utils.log("Starting setup", _player);
		_setup(_player, 0, options);
		return _player;
	}
	
	function _setup(player, step, options) {
		//try {
			switch (step) {
				case 0:
					player._model = new jwplayer.html5.model(options);
					player._model.domelement = $('#'+_player.id);
					_setup(player, step + 1);
					break;
				case 1:
					player._controller = jwplayer.html5.controller(player);
					_setup($.extend(player, jwplayer.html5._api(player)), step + 1);
					break;
				case 2:
					jwplayer.html5.skinner(player, function() {
						_setup(player, step + 1);
					});
					break;
				case 3:
					jwplayer.html5.view(player);
					_setup(player, step + 1);
					break;
				case 4:
					jwplayer.html5.model.setActiveMediaProvider(player);
					if ((player._media === undefined) || !player._media.hasChrome) {
						_setup(player, step + 1);
					}
					break;
				case 5:
					jwplayer.html5.display(player, player._model.domelement);
					if (player._media === undefined) {
						player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
					} else {
						_setup(player, step + 1);
					}
					break;
				case 6:
					jwplayer.html5.controlbar(player, player._model.domelement);
					_setup(player, step + 1);
					break;
				case 7:
					player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
					_setup(player, step + 1);
					break;
				default:
					if (player.getConfig().autostart === true) {
						player.play();
					}
					break;
			}
		//} catch (err) {
		//	jwplayer.html5.utils.log("Setup failed at step " + step, err);
		//}
	}
})(jwplayer);

