/**
 * JW Player view component
 *
 * @author zach
 * @version 1.0
 */
(function(jwplayer) {

	jwplayer.html5.view = function(player) {
		player._model.domelement.wrap("<div id='" + player.id + "_jwplayer' />");
		player._model.domelement.parent().css({
			position: 'relative',
			height: player._model.config.height + 'px',
			width: player._model.config.width + 'px',
			margin: 'auto',
			padding: 0,
			'background-color': player._model.config.screencolor
		});
		player._model.domelement.css({
			position: 'absolute',
			width: player._model.config.width + 'px',
			height: player._model.config.height + 'px',
			top: 0,
			left: 0,
			'z-index': 0,
			margin: 'auto',
			display: 'block'
		});
	};
})(jwplayer);
