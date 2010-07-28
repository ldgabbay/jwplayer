/**
 * Core component of the JW Player (initialization, API).
 *
 * @author zach
 * @version 1.0
 */

jwplayer = function(){};

jwplayer.html5 = function(domelement) {
	this._domelement = domelement;
	this.id = domelement.id;
	return this.html5;
};

jwplayer.html5.prototype = {
	id: undefined,
	version: "1.0",
	skin: undefined,
	_model: undefined,
	_view: undefined,
	_controller: undefined,
	_listeners: undefined,
	_media: undefined,
	_domelement: undefined
};

jwplayer.html5.setup = function(options){
	jwplayer.html5.utils.log("Starting setup", this);
	jwplayer.html5._setup(this, 0, options);
	return this;
};

jwplayer.html5._setup = function(player, step, options) {
	try {
		switch (step) {
			case 0:
				player._model = new jwplayer.html5.model(options);
				player._model.domelement = $(player.domelement);
				jwplayer.html5._setup(player, step + 1);
				break;
			case 1:
				player._controller = jwplayer.html5.controller(player);
				jwplayer.html5._setup($.extend(player, jwplayer.html5._api(player)), step + 1);
				break;
			case 2:
				jwplayer.html5.skinner(player, function() {
					jwplayer.html5._setup(player, step + 1);
				});
				break;
			case 3:
				jwplayer.html5.view(player);
				jwplayer.html5._setup(player, step + 1);
				break;
			case 4:
				jwplayer.html5.model.setActiveMediaProvider(player);
				if ((player._media === undefined) || !player._media.hasChrome) {
					jwplayer.html5._setup(player, step + 1);
				}
				break;
			case 5:
				jwplayer.html5.display(player, player._model.domelement);
				if (player._media === undefined) {
					player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
				} else {
					jwplayer.html5._setup(player, step + 1);
				}
				break;
			case 6:
				if (!jwplayer.html5.utils.isiPhone()) {
					jwplayer.html5.controlbar(player, player._model.domelement);
				}
				jwplayer.html5._setup(player, step + 1);
				break;
			case 7:
				player.sendEvent(jwplayer.html5.events.JWPLAYER_READY);
				jwplayer.html5._setup(player, step + 1);
				break;
			default:
				if (player.config.autostart === true) {
					player.play();
				}
				break;
		}
	} catch (err) {
		jwplayer.html5.utils.log("Setup failed at step " + step, err);
	}
};
